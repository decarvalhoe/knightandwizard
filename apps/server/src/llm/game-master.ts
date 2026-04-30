import { Agent } from '@mastra/core/agent';
import { Mastra } from '@mastra/core/mastra';
import { createTool, type ToolAction } from '@mastra/core/tools';
import { rollDice, type DiceRollResult, type RandomInteger } from '@knightandwizard/rules-core';

export const DEFAULT_GAME_MASTER_MODEL = 'ollama/qwen2.5:7b';

export const GAME_MASTER_INSTRUCTIONS = [
  'Tu es le MJ numerique de Knight & Wizard.',
  'Le LLM ne calcule jamais les des, degats, DT, XP ou effets mecaniques.',
  'Pour toute resolution mecanique, tu appelles un outil type du rules-core.',
  'Tu peux narrer, reformuler, demander une validation MJ humain et garder le contexte de session.',
  'Toute ambiguite de regle importante doit etre escaladee au MJ humain.'
].join('\n');

export interface RollDiceToolInput {
  difficulty: number;
  pool: number;
  reason?: string;
}

export interface RollDiceToolResult extends DiceRollResult {
  difficulty: number;
  pool: number;
  reason?: string;
}

export interface GameMasterToolCall {
  input: RollDiceToolInput;
  output: RollDiceToolResult;
  tool: 'rollDice';
}

export interface GameMasterSceneInput {
  roll?: RollDiceToolInput;
  sceneDescription: string;
  sessionId: string;
}

export interface GameMasterSceneResponse {
  memory: WorkingMemorySession;
  model: string;
  narration: string;
  provider: 'deterministic-dev';
  toolCalls: GameMasterToolCall[];
}

export interface GameMasterRuntime {
  agent: Agent;
  mastra: Mastra;
  model: string;
  tools: {
    rollDice: ToolAction<unknown, unknown>;
  };
}

export interface GameMasterRuntimeOptions {
  model?: string;
  randomInteger?: RandomInteger;
}

export interface GameMasterSceneOptions extends GameMasterRuntimeOptions {
  memory?: WorkingMemory;
}

export interface WorkingMemoryTurn {
  content: string;
  createdAt: string;
  role: 'assistant' | 'tool' | 'user';
  toolCalls?: GameMasterToolCall[];
}

export interface WorkingMemorySession {
  sessionId: string;
  turns: WorkingMemoryTurn[];
  updatedAt: string;
}

export interface WorkingMemory {
  appendTurn(sessionId: string, turn: Omit<WorkingMemoryTurn, 'createdAt'>): WorkingMemorySession;
  getSession(sessionId: string): WorkingMemorySession | undefined;
}

const defaultWorkingMemory = createWorkingMemory();

export function createGameMasterRuntime(options: GameMasterRuntimeOptions = {}): GameMasterRuntime {
  const model = options.model ?? getGameMasterModel();
  const rollDiceTool = createRollDiceTool({ randomInteger: options.randomInteger });
  const agent = new Agent({
    description: 'Assistant MJ K&W avec tool calling vers rules-core.',
    id: 'kw-game-master',
    instructions: GAME_MASTER_INSTRUCTIONS,
    model,
    name: 'K&W Game Master',
    tools: {
      rollDice: rollDiceTool
    }
  });
  const mastra = new Mastra({
    agents: {
      gameMaster: agent
    },
    logger: false
  });

  return {
    agent,
    mastra,
    model,
    tools: {
      rollDice: rollDiceTool
    }
  };
}

export function createWorkingMemory(): WorkingMemory {
  const sessions = new Map<string, WorkingMemorySession>();

  return {
    appendTurn(sessionId, turn) {
      const createdAt = new Date().toISOString();
      const current = sessions.get(sessionId) ?? {
        sessionId,
        turns: [],
        updatedAt: createdAt
      };
      const next = {
        ...current,
        turns: [
          ...current.turns,
          {
            ...turn,
            createdAt
          }
        ],
        updatedAt: createdAt
      };

      sessions.set(sessionId, next);
      return next;
    },
    getSession(sessionId) {
      return sessions.get(sessionId);
    }
  };
}

export async function executeRollDiceTool(
  input: unknown,
  options: Pick<GameMasterRuntimeOptions, 'randomInteger'> = {}
): Promise<RollDiceToolResult> {
  const normalizedInput = parseRollDiceInput(input);
  const result = rollDice(normalizedInput.pool, normalizedInput.difficulty, {
    randomInteger: options.randomInteger
  });

  return {
    ...result,
    difficulty: normalizedInput.difficulty,
    pool: normalizedInput.pool,
    reason: normalizedInput.reason
  };
}

export async function describeSceneWithGameMaster(
  input: GameMasterSceneInput,
  options: GameMasterSceneOptions = {}
): Promise<GameMasterSceneResponse> {
  const memory = options.memory ?? defaultWorkingMemory;
  const runtime = createGameMasterRuntime({
    model: options.model,
    randomInteger: options.randomInteger
  });
  const sceneDescription = input.sceneDescription.trim();

  memory.appendTurn(input.sessionId, {
    content: sceneDescription,
    role: 'user'
  });

  const toolCalls: GameMasterToolCall[] = [];

  if (input.roll) {
    const output = (await runtime.tools.rollDice.execute?.(input.roll, {} as never)) as
      | RollDiceToolResult
      | undefined;

    if (!output) {
      throw new Error('rollDice tool did not return a result');
    }

    toolCalls.push({
      input: input.roll,
      output,
      tool: 'rollDice'
    });
  }

  const narration = buildDeterministicNarration(sceneDescription, toolCalls);
  const session = memory.appendTurn(input.sessionId, {
    content: narration,
    role: 'assistant',
    toolCalls
  });

  return {
    memory: session,
    model: runtime.model,
    narration,
    provider: 'deterministic-dev',
    toolCalls
  };
}

function createRollDiceTool(options: Pick<GameMasterRuntimeOptions, 'randomInteger'>) {
  return createTool({
    description:
      'Resout un jet D10 K&W avec le rules-core. Utilise cet outil pour tout jet de des.',
    execute: async (inputData) => executeRollDiceTool(inputData, options),
    id: 'rollDice'
  });
}

function getGameMasterModel(): string {
  return process.env.GAME_MASTER_MODEL ?? DEFAULT_GAME_MASTER_MODEL;
}

function buildDeterministicNarration(
  sceneDescription: string,
  toolCalls: GameMasterToolCall[]
): string {
  const sceneText = `La scene est posee: ${sceneDescription}`;

  if (toolCalls.length === 0) {
    return `${sceneText} Le MJ decrit les details visibles et attend la prochaine intention.`;
  }

  const rollFragments = toolCalls.map(({ input, output }) => {
    const reason = input.reason ? ` (${input.reason})` : '';
    const critical = output.isCriticalSuccess
      ? ' Reussite critique.'
      : output.isCriticalFailure
        ? ' Echec critique.'
        : '';

    return `Jet D10 difficulte ${input.difficulty}${reason}: ${output.successes} succes [${output.rolls.join(', ')}].${critical}`;
  });

  return `${sceneText} ${rollFragments.join(' ')} Le resultat mecanique est integre a la narration sans recalcul par le LLM.`;
}

function parseRollDiceInput(input: unknown): RollDiceToolInput {
  if (!isRecord(input)) {
    throw new Error('rollDice input must be an object');
  }

  const errors = validateRollDiceShape(input);

  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }

  return {
    difficulty: input.difficulty as number,
    pool: input.pool as number,
    reason: typeof input.reason === 'string' ? input.reason : undefined
  };
}

export function validateRollDiceShape(input: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (!Number.isInteger(input.pool) || (input.pool as number) <= 0) {
    errors.push('roll.pool must be a positive integer');
  }

  if (!Number.isInteger(input.difficulty) || (input.difficulty as number) <= 0) {
    errors.push('roll.difficulty must be a positive integer');
  }

  if (input.reason !== undefined && typeof input.reason !== 'string') {
    errors.push('roll.reason must be a string');
  }

  return errors;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
