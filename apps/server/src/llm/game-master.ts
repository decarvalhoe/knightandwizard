import { Agent } from '@mastra/core/agent';
import { Mastra } from '@mastra/core/mastra';
import { type RandomInteger } from '@knightandwizard/rules-core';
import { buildRuleContext, searchRules, type RuleSearchResult } from '../knowledge/rules.js';
import {
  createGameMasterRulesTools,
  type GameMasterRuleTools,
  type RollDiceToolInput,
  type RollDiceToolResult
} from './rules-tools.js';

export {
  executeRollDiceTool,
  validateRollDiceShape,
  type RollDiceToolInput,
  type RollDiceToolResult
} from './rules-tools.js';

export const DEFAULT_GAME_MASTER_MODEL = 'ollama/qwen2.5:7b';

export const GAME_MASTER_INSTRUCTIONS = [
  'Tu es le MJ numerique de Knight & Wizard.',
  'Le LLM ne calcule jamais les des, degats, DT, XP ou effets mecaniques.',
  'Pour toute resolution mecanique, tu appelles un outil type du rules-core.',
  'Avant de repondre, tu utilises le contexte RAG des regles et cites les sources retrouvees.',
  'Tu peux narrer, reformuler, demander une validation MJ humain et garder le contexte de session.',
  'Toute ambiguite de regle importante doit etre escaladee au MJ humain.'
].join('\n');

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
  knowledge: GameMasterKnowledgeContext;
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
  tools: GameMasterRuleTools;
}

export interface GameMasterRuntimeOptions {
  model?: string;
  randomInteger?: RandomInteger;
}

export interface GameMasterSceneOptions extends GameMasterRuntimeOptions {
  knowledgeLimit?: number;
  knowledgeRetriever?: KnowledgeRetriever;
  memory?: WorkingMemory;
}

export interface KnowledgeRetriever {
  searchRules(query: string, limit: number): Promise<RuleSearchResult[]>;
}

export interface GameMasterKnowledgeCitation {
  citation: string;
  heading: string;
  score: number;
  sourcePath: string;
}

export interface GameMasterKnowledgeContext {
  citations: GameMasterKnowledgeCitation[];
  context: string;
  error?: string;
  query: string;
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
const defaultKnowledgeRetriever: KnowledgeRetriever = {
  searchRules: (query, limit) => searchRules(query, { limit })
};

export function createGameMasterRuntime(options: GameMasterRuntimeOptions = {}): GameMasterRuntime {
  const model = options.model ?? getGameMasterModel();
  const tools = createGameMasterRulesTools({ randomInteger: options.randomInteger });
  const agent = new Agent({
    description: 'Assistant MJ K&W avec tool calling vers rules-core.',
    id: 'kw-game-master',
    instructions: GAME_MASTER_INSTRUCTIONS,
    model,
    name: 'K&W Game Master',
    tools
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
    tools
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
  const knowledge = await retrieveKnowledgeContext(input, options);

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

  const narration = buildDeterministicNarration(sceneDescription, toolCalls, knowledge);
  const session = memory.appendTurn(input.sessionId, {
    content: narration,
    role: 'assistant',
    toolCalls
  });

  return {
    knowledge,
    memory: session,
    model: runtime.model,
    narration,
    provider: 'deterministic-dev',
    toolCalls
  };
}

function getGameMasterModel(): string {
  return process.env.GAME_MASTER_MODEL ?? DEFAULT_GAME_MASTER_MODEL;
}

function buildDeterministicNarration(
  sceneDescription: string,
  toolCalls: GameMasterToolCall[],
  knowledge: GameMasterKnowledgeContext
): string {
  const sceneText = `La scene est posee: ${sceneDescription}`;
  const sourcesText =
    knowledge.citations.length > 0
      ? ` Sources RAG: ${knowledge.citations
          .map((citation, index) => `[${index + 1}] ${citation.citation}`)
          .join('; ')}.`
      : '';

  if (toolCalls.length === 0) {
    return `${sceneText}${sourcesText} Le MJ decrit les details visibles et attend la prochaine intention.`;
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

  return `${sceneText}${sourcesText} ${rollFragments.join(' ')} Le resultat mecanique est integre a la narration sans recalcul par le LLM.`;
}

async function retrieveKnowledgeContext(
  input: GameMasterSceneInput,
  options: GameMasterSceneOptions
): Promise<GameMasterKnowledgeContext> {
  const query = [input.sceneDescription.trim(), input.roll?.reason].filter(Boolean).join('\n');
  const limit = options.knowledgeLimit ?? 3;
  const retriever = options.knowledgeRetriever ?? defaultKnowledgeRetriever;

  try {
    const results = await retriever.searchRules(query, limit);

    return {
      citations: results.map((result) => ({
        citation: result.citation,
        heading: result.heading,
        score: result.score,
        sourcePath: result.sourcePath
      })),
      context: buildRuleContext(results),
      query
    };
  } catch (error) {
    return {
      citations: [],
      context: '',
      error: error instanceof Error ? error.message : 'Unknown knowledge retrieval error',
      query
    };
  }
}
