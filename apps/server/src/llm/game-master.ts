import { Agent } from '@mastra/core/agent';
import { Mastra } from '@mastra/core/mastra';
import { type RandomInteger } from '@knightandwizard/rules-core';
import { RAG_GROUNDING_POLICY, type RagGroundingPolicy } from '../knowledge/evaluations.js';
import { buildRuleContext, searchRules, type RuleSearchResult } from '../knowledge/rules.js';
import {
  buildEpisodicMemoryContext,
  createDatabaseEpisodicMemoryStore,
  type EpisodicMemoryStore,
  type GmMemoryEntry
} from './episodic-memory.js';
import {
  createGameMasterRulesTools,
  normalizeRuleToolResult,
  type GameMasterRuleTools,
  type RollDiceToolInput,
  type RollDiceToolResult,
  type RuleToolResult
} from './rules-tools.js';

export {
  executeRollDiceTool,
  validateRollDiceShape,
  type RollDiceToolInput,
  type RollDiceToolResult,
  type RuleToolResult
} from './rules-tools.js';

export const DEFAULT_GAME_MASTER_MODEL = 'ollama/qwen2.5:7b';
export type GameMasterProvider = 'deterministic-dev' | 'mastra-agent';

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
  output: RuleToolResult<RollDiceToolResult>;
  tool: 'rollDice';
}

export interface GameMasterSceneInput {
  roll?: RollDiceToolInput;
  sceneDescription: string;
  sessionId: string;
}

export interface GameMasterSceneResponse {
  episodicMemory: GameMasterEpisodicMemoryContext;
  generationError?: string;
  knowledge: GameMasterKnowledgeContext;
  memory: WorkingMemorySession;
  model: string;
  narration: string;
  provider: GameMasterProvider;
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
  agentInvoker?: GameMasterAgentInvoker;
  episodicMemoryStore?: EpisodicMemoryStore;
  knowledgeLimit?: number;
  knowledgeRetriever?: KnowledgeRetriever;
  memory?: WorkingMemory;
  provider?: GameMasterProvider;
}

export interface KnowledgeRetriever {
  searchRules(query: string, limit: number): Promise<RuleSearchResult[]>;
}

export interface GameMasterAgentInvoker {
  generate(agent: Agent, prompt: string): Promise<string>;
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
  grounding: RagGroundingPolicy;
  query: string;
}

export interface GameMasterEpisodicMemoryContext {
  context: string;
  error?: string;
  memories: GmMemoryEntry[];
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
const defaultAgentInvoker: GameMasterAgentInvoker = {
  async generate(agent, prompt) {
    const result = await (agent as Agent & { generate(input: string): Promise<unknown> }).generate(
      prompt
    );

    return readGeneratedText(result);
  }
};
let defaultEpisodicMemoryStore: EpisodicMemoryStore | undefined;

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
  const episodicMemory = await retrieveEpisodicMemoryContext(input, options);

  memory.appendTurn(input.sessionId, {
    content: sceneDescription,
    role: 'user'
  });

  const toolCalls: GameMasterToolCall[] = [];

  if (input.roll) {
    const output = (await runtime.tools.rollDice.execute?.(input.roll, {} as never)) as
      | RuleToolResult<RollDiceToolResult>
      | undefined;

    toolCalls.push({
      input: input.roll,
      output: normalizeRuleToolResult<RollDiceToolResult>(
        output,
        'rollDice tool did not return a result'
      ),
      tool: 'rollDice'
    });
  }

  const deterministicNarration = buildDeterministicNarration(
    sceneDescription,
    toolCalls,
    knowledge,
    episodicMemory
  );
  const requestedProvider = options.provider ?? getGameMasterProvider();
  let generationError: string | undefined;
  let narration = deterministicNarration;
  let provider: GameMasterProvider = 'deterministic-dev';

  if (requestedProvider === 'mastra-agent') {
    try {
      const generated = (
        await (options.agentInvoker ?? defaultAgentInvoker).generate(
          runtime.agent,
          buildAgentPrompt(sceneDescription, toolCalls, knowledge, episodicMemory)
        )
      ).trim();

      if (generated.length === 0) {
        throw new Error('agent.generate returned empty narration');
      }

      narration = generated;
      provider = 'mastra-agent';
    } catch (error) {
      generationError = error instanceof Error ? error.message : 'Unknown agent.generate error';
    }
  }

  const session = memory.appendTurn(input.sessionId, {
    content: narration,
    role: 'assistant',
    toolCalls
  });

  await recordSceneMemory(input, narration, toolCalls, knowledge, options);

  return {
    episodicMemory,
    knowledge,
    memory: session,
    model: runtime.model,
    narration,
    ...(generationError === undefined ? {} : { generationError }),
    provider,
    toolCalls
  };
}

function getGameMasterModel(): string {
  return process.env.GAME_MASTER_MODEL ?? DEFAULT_GAME_MASTER_MODEL;
}

function getGameMasterProvider(): GameMasterProvider {
  return process.env.GAME_MASTER_PROVIDER === 'mastra-agent' ? 'mastra-agent' : 'deterministic-dev';
}

function buildDeterministicNarration(
  sceneDescription: string,
  toolCalls: GameMasterToolCall[],
  knowledge: GameMasterKnowledgeContext,
  episodicMemory: GameMasterEpisodicMemoryContext
): string {
  const sceneText = `La scene est posee: ${sceneDescription}`;
  const sourcesText =
    knowledge.citations.length > 0
      ? ` Sources RAG: ${knowledge.citations
          .map((citation, index) => `[${index + 1}] ${citation.citation}`)
          .join('; ')}.`
      : '';
  const memoryText =
    episodicMemory.memories.length > 0
      ? ` Memoire: ${episodicMemory.memories
          .map((memory, index) => `[M${index + 1}] ${memory.subject}`)
          .join('; ')}.`
      : '';

  if (toolCalls.length === 0) {
    return `${sceneText}${sourcesText}${memoryText} Le MJ decrit les details visibles et attend la prochaine intention.`;
  }

  const rollFragments = toolCalls.map(({ input, output }) => {
    const reason = input.reason ? ` (${input.reason})` : '';

    if (output.status === 'error') {
      return `Erreur outil rollDice${reason}: ${output.message}. Le MJ attend une entree corrigee avant toute resolution mecanique.`;
    }

    const critical = output.isCriticalSuccess
      ? ' Reussite critique.'
      : output.isCriticalFailure
        ? ` Echec critique${typeof output.criticalFailureSeverity === 'number' ? ` D100 ${output.criticalFailureSeverity}` : ''}.`
        : '';

    return `Jet D10 difficulte ${input.difficulty}${reason}: ${output.successes} succes [${output.rolls.join(', ')}].${critical}`;
  });

  return `${sceneText}${sourcesText}${memoryText} ${rollFragments.join(' ')} Le resultat mecanique est integre a la narration sans recalcul par le LLM.`;
}

function buildAgentPrompt(
  sceneDescription: string,
  toolCalls: GameMasterToolCall[],
  knowledge: GameMasterKnowledgeContext,
  episodicMemory: GameMasterEpisodicMemoryContext
): string {
  return [
    'Scene joueur:',
    sceneDescription,
    'Contexte RAG canonique a citer:',
    knowledge.context || 'Aucune source retrouvee.',
    'Memoire episodique de session:',
    episodicMemory.context || 'Aucune memoire retrouvee.',
    'Resultats outils rules-core deja calcules:',
    toolCalls.length === 0
      ? 'Aucun outil mecanique appele.'
      : toolCalls.map(toolCallToPrompt).join('\n'),
    'Contraintes de sortie:',
    [
      '- Ne recalcule jamais les des, degats, DT, XP ou effets.',
      '- Integre les resultats outils tels quels.',
      '- Cite les sources RAG disponibles avec leurs marqueurs [1], [2].',
      '- En cas d ambiguite mecanique, demande une validation MJ humain.'
    ].join('\n')
  ].join('\n\n');
}

function toolCallToPrompt({ input, output, tool }: GameMasterToolCall): string {
  const reason = input.reason ? ` (${input.reason})` : '';

  if (output.status === 'error') {
    return `${tool}${reason}: erreur ${output.message}`;
  }

  const critical = output.isCriticalSuccess
    ? ' reussite critique'
    : output.isCriticalFailure
      ? ` echec critique${typeof output.criticalFailureSeverity === 'number' ? ` D100 ${output.criticalFailureSeverity}` : ''}`
      : '';

  return `${tool}${reason}: ${output.successes} succes sur difficulte ${input.difficulty}, jets [${output.rolls.join(', ')}]${critical}`;
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
      grounding: RAG_GROUNDING_POLICY,
      query
    };
  } catch (error) {
    return {
      citations: [],
      context: '',
      error: error instanceof Error ? error.message : 'Unknown knowledge retrieval error',
      grounding: RAG_GROUNDING_POLICY,
      query
    };
  }
}

async function retrieveEpisodicMemoryContext(
  input: GameMasterSceneInput,
  options: GameMasterSceneOptions
): Promise<GameMasterEpisodicMemoryContext> {
  const query = [input.sceneDescription.trim(), input.roll?.reason].filter(Boolean).join('\n');

  try {
    const memories = await getEpisodicMemoryStore(options).recall({
      limit: 5,
      query,
      sessionKey: input.sessionId
    });

    return {
      context: buildEpisodicMemoryContext(memories),
      memories,
      query
    };
  } catch (error) {
    return {
      context: '',
      error: error instanceof Error ? error.message : 'Unknown episodic memory retrieval error',
      memories: [],
      query
    };
  }
}

async function recordSceneMemory(
  input: GameMasterSceneInput,
  narration: string,
  toolCalls: GameMasterToolCall[],
  knowledge: GameMasterKnowledgeContext,
  options: GameMasterSceneOptions
): Promise<void> {
  try {
    await getEpisodicMemoryStore(options).record({
      importance: toolCalls.length > 0 ? 3 : 2,
      kind: 'scene_event',
      payload: {
        canonicalLoreMutable: false,
        knowledgeCitations: knowledge.citations,
        toolCalls
      },
      provenanceType: 'session_fact',
      sessionKey: input.sessionId,
      source: 'game-master',
      subject: summarizeMemorySubject(input.sceneDescription),
      summary: `Scene: ${input.sceneDescription.trim()} Narration: ${narration}`
    });
  } catch {
    // Persistence must never block the deterministic rules response.
  }
}

function getEpisodicMemoryStore(options: GameMasterSceneOptions): EpisodicMemoryStore {
  if (options.episodicMemoryStore !== undefined) {
    return options.episodicMemoryStore;
  }

  defaultEpisodicMemoryStore ??= createDatabaseEpisodicMemoryStore();
  return defaultEpisodicMemoryStore;
}

function summarizeMemorySubject(sceneDescription: string): string {
  const normalized = sceneDescription.replace(/\s+/g, ' ').trim();

  if (normalized.length <= 80) {
    return normalized;
  }

  return `${normalized.slice(0, 79).trim()}…`;
}

function readGeneratedText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (isRecord(value)) {
    const direct = readString(value, 'text') ?? readString(value, 'content');

    if (direct !== undefined) {
      return direct;
    }
  }

  return JSON.stringify(value);
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
