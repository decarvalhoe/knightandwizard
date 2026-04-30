import { createTool, type ToolAction } from '@mastra/core/tools';
import { loadValidatedCatalog, type BestiaryEntry } from '@knightandwizard/catalogs';
import {
  applyDamage,
  decideNpcAction,
  resolveNextAction,
  rollDice,
  type AttackAction,
  type Combatant,
  type CombatState,
  type DiceRollResult,
  type NpcActionDecision,
  type RandomInteger
} from '@knightandwizard/rules-core';
import { z } from 'zod';
import { buildRuleContext, searchRules, type RuleSearchResult } from '../knowledge/rules.js';

export const GAME_MASTER_RULE_TOOL_IDS = [
  'rollDice',
  'applyDamage',
  'resolveAttack',
  'getCharacterStatus',
  'advanceCombatTimeline',
  'lookupRule',
  'lookupBestiary',
  'decideNpcAction'
] as const;

export type GameMasterRuleToolId = (typeof GAME_MASTER_RULE_TOOL_IDS)[number];
export type GameMasterRuleTools = Record<GameMasterRuleToolId, ToolAction<unknown, unknown>>;

export interface GameMasterRuleToolOptions {
  randomInteger?: RandomInteger;
  searchRules?: SearchRulesForTool;
}

export interface ToolErrorResult {
  message: string;
  status: 'error';
}

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

export interface ApplyDamageToolResult {
  state: CombatState;
  status: 'ok';
}

export interface ResolveAttackToolResult {
  state: CombatState;
  status: 'ok';
  weaponId?: string;
}

export interface GetCharacterStatusToolResult {
  character: CombatantStatusSnapshot;
  status: 'ok';
}

export interface AdvanceCombatTimelineToolResult {
  state: CombatState;
  status: 'ok';
}

export interface LookupRuleToolResult {
  citations: Array<Pick<RuleSearchResult, 'citation' | 'heading' | 'score' | 'sourcePath'>>;
  context: string;
  query: string;
  results: RuleSearchResult[];
  status: 'ok';
}

export interface LookupBestiaryToolResult {
  creature: BestiaryEntry;
  status: 'ok';
}

export interface DecideNpcActionToolResult {
  decision: NpcActionDecision;
  status: 'ok';
}

export interface CombatantStatusSnapshot {
  attributes: Combatant['attributes'];
  id: string;
  name: string;
  nextActionAt: number;
  statuses: Combatant['statuses'];
  vitality: Combatant['vitality'];
}

type SearchRulesForTool = (
  query: string,
  options?: { limit?: number }
) => Promise<RuleSearchResult[]>;

type RuleToolResult<T> = T | ToolErrorResult;

const RollDiceInputSchema = z.object({
  pool: z.number().int().positive(),
  difficulty: z.number().int().positive(),
  reason: z.string().optional()
});

const CombatRollRequestSchema = z.object({
  difficulty: z.number().int().positive(),
  pool: z.number().int().positive()
});

const CombatAttributesSchema = z.object({
  dexterity: z.number(),
  stamina: z.number(),
  strength: z.number()
});

const CombatVitalitySchema = z.object({
  current: z.number(),
  max: z.number().positive()
});

const CombatStatusSchema = z
  .object({
    appliedAtDT: z.number().int().positive().optional(),
    durationDT: z.number().int().positive().optional(),
    id: z.string().min(1)
  })
  .passthrough();

const CombatantSchema: z.ZodType<Combatant> = z
  .object({
    attributes: CombatAttributesSchema,
    baseAttributes: CombatAttributesSchema.optional(),
    id: z.string().min(1),
    ignoresVitalityMalus: z.boolean().optional(),
    name: z.string().min(1),
    nextActionAt: z.number().int().positive(),
    pendingAction: z.unknown().optional(),
    reflexes: z.number(),
    skills: z.record(z.string(), z.number()),
    speedFactor: z.number().int().positive(),
    statuses: z.array(CombatStatusSchema),
    vitality: CombatVitalitySchema
  })
  .passthrough() as z.ZodType<Combatant>;

const CombatStateSchema: z.ZodType<CombatState> = z
  .object({
    currentDT: z.number().int().positive(),
    log: z.array(z.unknown()),
    round: z.number().int().positive(),
    timeline: z.array(CombatantSchema)
  })
  .passthrough() as z.ZodType<CombatState>;

const ApplyDamageInputSchema = z.object({
  combatantId: z.string().min(1),
  damage: z.number().int(),
  state: CombatStateSchema
});

const ResolveAttackInputSchema = z.object({
  attack: CombatRollRequestSchema,
  attackerId: z.string().min(1),
  costDT: z.number().int().positive().optional(),
  damageOnHit: z.number().int().positive().optional(),
  defenderId: z.string().min(1),
  defense: CombatRollRequestSchema.optional(),
  state: CombatStateSchema,
  weaponId: z.string().min(1).optional()
});

const GetCharacterStatusInputSchema = z.object({
  characterId: z.string().min(1),
  state: CombatStateSchema
});

const AdvanceCombatTimelineInputSchema = z.object({
  state: CombatStateSchema
});

const LookupRuleInputSchema = z.object({
  limit: z.number().int().positive().max(10).optional(),
  query: z.string().min(1)
});

const LookupBestiaryInputSchema = z.object({
  name: z.string().min(1)
});

const NpcControlProfileSchema = z
  .object({
    archetype: z.enum([
      'aggressive',
      'defensive',
      'coward',
      'cautious',
      'brute',
      'skirmisher',
      'support'
    ]),
    assignedTo: z.string().min(1).optional(),
    controller: z.enum(['player', 'human_gm', 'llm', 'auto']),
    npcId: z.string().min(1).optional(),
    personality: z
      .object({
        fears: z.array(z.string()).optional(),
        motivations: z.array(z.string()).optional(),
        riskTolerance: z.enum(['low', 'medium', 'high']).optional(),
        speechStyle: z.string().optional(),
        tacticalLevel: z.enum(['low', 'medium', 'high']).optional(),
        values: z.array(z.string()).optional()
      })
      .optional()
  })
  .passthrough();

const DecideNpcActionInputSchema = z.object({
  combatState: CombatStateSchema,
  enemyIds: z.array(z.string().min(1)),
  npcId: z.string().min(1),
  profile: NpcControlProfileSchema
});

export function createGameMasterRulesTools(
  options: GameMasterRuleToolOptions = {}
): GameMasterRuleTools {
  return {
    rollDice: createTool({
      description:
        'Resout un jet D10 Knight & Wizard via rules-core. Le MJ LLM ne doit jamais calculer les des lui-meme.',
      execute: async (inputData) =>
        executeRollDiceTool(inputData, { randomInteger: options.randomInteger }),
      id: 'rollDice',
      inputSchema: RollDiceInputSchema
    }),
    applyDamage: createTool({
      description:
        'Applique des degats ou des soins a un combattant dans un CombatState rules-core et retourne l etat mis a jour.',
      execute: async (inputData) => executeApplyDamageTool(inputData),
      id: 'applyDamage',
      inputSchema: ApplyDamageInputSchema
    }),
    resolveAttack: createTool({
      description:
        'Resout une attaque complete via la timeline combat rules-core, avec jet attaque, defense optionnelle et degats.',
      execute: async (inputData) =>
        executeResolveAttackTool(inputData, { randomInteger: options.randomInteger }),
      id: 'resolveAttack',
      inputSchema: ResolveAttackInputSchema
    }),
    getCharacterStatus: createTool({
      description:
        'Retourne la vitalite, les statuts et le prochain DT d action d un personnage present dans un CombatState.',
      execute: async (inputData) => executeGetCharacterStatusTool(inputData),
      id: 'getCharacterStatus',
      inputSchema: GetCharacterStatusInputSchema
    }),
    advanceCombatTimeline: createTool({
      description:
        'Avance la timeline DT en resolvant la prochaine action planifiee avec le moteur combat rules-core.',
      execute: async (inputData) => executeAdvanceCombatTimelineTool(inputData),
      id: 'advanceCombatTimeline',
      inputSchema: AdvanceCombatTimelineInputSchema
    }),
    lookupRule: createTool({
      description:
        'Recherche les regles et le lore pertinents dans la base RAG pgvector et retourne des citations utilisables.',
      execute: async (inputData) =>
        executeLookupRuleTool(inputData, { searchRules: options.searchRules }),
      id: 'lookupRule',
      inputSchema: LookupRuleInputSchema
    }),
    lookupBestiary: createTool({
      description:
        'Recherche une creature dans le bestiaire canonique YAML et retourne ses statistiques utiles au MJ.',
      execute: async (inputData) => executeLookupBestiaryTool(inputData),
      id: 'lookupBestiary',
      inputSchema: LookupBestiaryInputSchema
    }),
    decideNpcAction: createTool({
      description:
        'Decide le controle PNJ selon D11/D13: auto deterministe, delegation LLM contextuelle, ou file de decision humaine.',
      execute: async (inputData) => executeDecideNpcActionTool(inputData),
      id: 'decideNpcAction',
      inputSchema: DecideNpcActionInputSchema
    })
  } as unknown as GameMasterRuleTools;
}

export async function executeRollDiceTool(
  input: unknown,
  options: Pick<GameMasterRuleToolOptions, 'randomInteger'> = {}
): Promise<RollDiceToolResult> {
  const normalizedInput = RollDiceInputSchema.parse(input);
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

export async function executeApplyDamageTool(
  input: unknown
): Promise<RuleToolResult<ApplyDamageToolResult>> {
  return safeRuleToolExecution(() => {
    const normalizedInput = ApplyDamageInputSchema.parse(input);

    return {
      state: applyDamage(
        normalizedInput.state,
        normalizedInput.combatantId,
        normalizedInput.damage
      ),
      status: 'ok'
    };
  });
}

export async function executeResolveAttackTool(
  input: unknown,
  options: Pick<GameMasterRuleToolOptions, 'randomInteger'> = {}
): Promise<RuleToolResult<ResolveAttackToolResult>> {
  return safeRuleToolExecution(() => {
    const normalizedInput = ResolveAttackInputSchema.parse(input);
    const state = prepareAttackState(normalizedInput);

    return {
      state: resolveNextAction(state, { randomInteger: options.randomInteger }),
      status: 'ok',
      weaponId: normalizedInput.weaponId
    };
  });
}

export async function executeGetCharacterStatusTool(
  input: unknown
): Promise<RuleToolResult<GetCharacterStatusToolResult>> {
  return safeRuleToolExecution(() => {
    const normalizedInput = GetCharacterStatusInputSchema.parse(input);

    return {
      character: toCombatantStatusSnapshot(
        findCombatant(normalizedInput.state, normalizedInput.characterId)
      ),
      status: 'ok'
    };
  });
}

export async function executeAdvanceCombatTimelineTool(
  input: unknown
): Promise<RuleToolResult<AdvanceCombatTimelineToolResult>> {
  return safeRuleToolExecution(() => {
    const normalizedInput = AdvanceCombatTimelineInputSchema.parse(input);

    return {
      state: resolveNextAction(normalizedInput.state),
      status: 'ok'
    };
  });
}

export async function executeLookupRuleTool(
  input: unknown,
  options: Pick<GameMasterRuleToolOptions, 'searchRules'> = {}
): Promise<RuleToolResult<LookupRuleToolResult>> {
  return safeRuleToolExecution(async () => {
    const normalizedInput = LookupRuleInputSchema.parse(input);
    const results = await (options.searchRules ?? searchRules)(normalizedInput.query, {
      limit: normalizedInput.limit ?? 5
    });

    return {
      citations: results.map((result) => ({
        citation: result.citation,
        heading: result.heading,
        score: result.score,
        sourcePath: result.sourcePath
      })),
      context: buildRuleContext(results),
      query: normalizedInput.query,
      results,
      status: 'ok'
    };
  });
}

export async function executeLookupBestiaryTool(
  input: unknown
): Promise<RuleToolResult<LookupBestiaryToolResult>> {
  return safeRuleToolExecution(async () => {
    const normalizedInput = LookupBestiaryInputSchema.parse(input);
    const catalog = await loadValidatedCatalog('bestiaire.yaml');
    const normalizedName = normalizeLookupText(normalizedInput.name);
    const creature = catalog.creatures.find(
      (candidate) =>
        normalizeLookupText(candidate.id) === normalizedName ||
        normalizeLookupText(candidate.name).includes(normalizedName)
    );

    if (creature === undefined) {
      throw new Error(`Unknown bestiary creature: ${normalizedInput.name}`);
    }

    return {
      creature,
      status: 'ok'
    };
  });
}

export async function executeDecideNpcActionTool(
  input: unknown
): Promise<RuleToolResult<DecideNpcActionToolResult>> {
  return safeRuleToolExecution(() => {
    const normalizedInput = DecideNpcActionInputSchema.parse(input);

    return {
      decision: decideNpcAction(normalizedInput),
      status: 'ok'
    };
  });
}

export function validateRollDiceShape(input: Record<string, unknown>): string[] {
  const result = RollDiceInputSchema.safeParse(input);

  if (result.success) {
    return [];
  }

  return result.error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `roll.${issue.path.join('.')}` : 'roll';

    if (issue.path.join('.') === 'pool') {
      return 'roll.pool must be a positive integer';
    }

    if (issue.path.join('.') === 'difficulty') {
      return 'roll.difficulty must be a positive integer';
    }

    if (issue.path.join('.') === 'reason') {
      return 'roll.reason must be a string';
    }

    return `${path}: ${issue.message}`;
  });
}

async function safeRuleToolExecution<T extends object>(
  callback: () => T | Promise<T>
): Promise<RuleToolResult<T>> {
  try {
    return await callback();
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'Unknown rules-core tool error',
      status: 'error'
    };
  }
}

function prepareAttackState(input: z.infer<typeof ResolveAttackInputSchema>): CombatState {
  const action: AttackAction = {
    attack: input.attack,
    costDT: input.costDT,
    damageOnHit: input.damageOnHit,
    defense: input.defense,
    targetId: input.defenderId,
    type: 'attack'
  };
  const attacker = findCombatant(input.state, input.attackerId);

  return {
    ...input.state,
    timeline: input.state.timeline.map((combatant) =>
      combatant.id === input.attackerId
        ? {
            ...combatant,
            nextActionAt: input.state.currentDT,
            pendingAction: action,
            reflexes: Math.max(combatant.reflexes, attacker.reflexes)
          }
        : combatant
    )
  };
}

function findCombatant(state: CombatState, combatantId: string): Combatant {
  const combatant = state.timeline.find((candidate) => candidate.id === combatantId);

  if (combatant === undefined) {
    throw new Error(`Unknown combatant: ${combatantId}`);
  }

  return combatant;
}

function toCombatantStatusSnapshot(combatant: Combatant): CombatantStatusSnapshot {
  return {
    attributes: combatant.attributes,
    id: combatant.id,
    name: combatant.name,
    nextActionAt: combatant.nextActionAt,
    statuses: combatant.statuses,
    vitality: combatant.vitality
  };
}

function normalizeLookupText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
