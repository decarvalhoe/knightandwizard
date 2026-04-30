import type { CombatAction, CombatState, Combatant } from './combat.js';

export const NPC_CONTROLLERS = ['player', 'human_gm', 'llm', 'auto'] as const;
export const NPC_ARCHETYPES = [
  'aggressive',
  'defensive',
  'coward',
  'cautious',
  'brute',
  'skirmisher',
  'support'
] as const;

export type NpcController = (typeof NPC_CONTROLLERS)[number];
export type NpcArchetype = (typeof NPC_ARCHETYPES)[number];

export interface NpcPersonalityProfile {
  fears?: string[];
  motivations?: string[];
  riskTolerance?: 'low' | 'medium' | 'high';
  speechStyle?: string;
  tacticalLevel?: 'low' | 'medium' | 'high';
  values?: string[];
}

export interface NpcControlHandoff {
  at: string;
  from: NpcController;
  reason: string;
  requestedBy: NpcController | string;
  to: NpcController;
}

export interface NpcControlProfile {
  archetype: NpcArchetype;
  assignedTo?: string;
  controller: NpcController;
  handoffHistory?: NpcControlHandoff[];
  npcId?: string;
  personality?: NpcPersonalityProfile;
}

export interface DecideNpcActionInput {
  combatState: CombatState;
  enemyIds: string[];
  npcId: string;
  profile: NpcControlProfile;
}

export interface QueuedNpcDecision {
  assignedTo: string;
  npcId: string;
  payload: Record<string, unknown>;
  priority: 'normal' | 'urgent';
  title: string;
}

export interface NpcActionDecision {
  action?: CombatAction;
  controller: NpcController;
  npcId: string;
  promptContext?: string;
  queuedDecision?: QueuedNpcDecision;
  reason: string;
  requiresHumanDecision: boolean;
  requiresLlmDecision: boolean;
}

export interface RequestNpcControlHandoffInput {
  reason: string;
  requestedBy: NpcController | string;
  targetController: NpcController;
}

export function decideNpcAction(input: DecideNpcActionInput): NpcActionDecision {
  const npc = findCombatant(input.combatState, input.npcId);

  if (input.profile.controller === 'llm') {
    return {
      controller: 'llm',
      npcId: npc.id,
      promptContext: buildLlmPromptContext(npc, input.profile),
      reason: 'PNJ delegue au MJ LLM pour une decision contextuelle.',
      requiresHumanDecision: false,
      requiresLlmDecision: true
    };
  }

  if (input.profile.controller === 'human_gm' || input.profile.controller === 'player') {
    const assignedTo = input.profile.assignedTo ?? input.profile.controller;

    return {
      controller: input.profile.controller,
      npcId: npc.id,
      queuedDecision: {
        assignedTo,
        npcId: npc.id,
        payload: {
          archetype: input.profile.archetype,
          controller: input.profile.controller,
          enemyIds: input.enemyIds
        },
        priority: 'normal',
        title: `Decision PNJ: ${npc.name}`
      },
      reason: `PNJ controle par ${input.profile.controller}; decision humaine requise.`,
      requiresHumanDecision: true,
      requiresLlmDecision: false
    };
  }

  return decideAutoAction(input.combatState, npc, input.enemyIds, input.profile);
}

export function requestNpcControlHandoff(
  profile: NpcControlProfile,
  input: RequestNpcControlHandoffInput
): NpcControlProfile {
  return {
    ...profile,
    controller: input.targetController,
    handoffHistory: [
      ...(profile.handoffHistory ?? []),
      {
        at: new Date().toISOString(),
        from: profile.controller,
        reason: input.reason,
        requestedBy: input.requestedBy,
        to: input.targetController
      }
    ]
  };
}

function decideAutoAction(
  combatState: CombatState,
  npc: Combatant,
  enemyIds: string[],
  profile: NpcControlProfile
): NpcActionDecision {
  const vitalityRatio = npc.vitality.current / npc.vitality.max;

  if (profile.archetype === 'coward' && vitalityRatio <= 0.3) {
    return {
      action: {
        costDT: npc.speedFactor,
        type: 'move'
      },
      controller: 'auto',
      npcId: npc.id,
      reason: 'Archetype coward: vitalite basse, le PNJ tente de fuir.',
      requiresHumanDecision: false,
      requiresLlmDecision: false
    };
  }

  if (profile.archetype === 'defensive' || profile.archetype === 'cautious') {
    return {
      action: {
        costDT: Math.max(1, Math.ceil(npc.speedFactor / 2)),
        type: 'defense'
      },
      controller: 'auto',
      npcId: npc.id,
      reason: `Archetype ${profile.archetype}: le PNJ privilegie la defense.`,
      requiresHumanDecision: false,
      requiresLlmDecision: false
    };
  }

  const target = selectLowestVitalityEnemy(combatState, enemyIds);

  return {
    action: {
      attack: {
        difficulty: 7,
        pool: Math.max(1, npc.attributes.dexterity + (npc.skills.attack ?? 0))
      },
      costDT: npc.speedFactor,
      damageOnHit: Math.max(1, npc.attributes.strength),
      targetId: target.id,
      type: 'attack'
    },
    controller: 'auto',
    npcId: npc.id,
    reason: `Archetype ${profile.archetype}: attaque la cible la plus affaiblie (${target.name}).`,
    requiresHumanDecision: false,
    requiresLlmDecision: false
  };
}

function selectLowestVitalityEnemy(combatState: CombatState, enemyIds: string[]): Combatant {
  if (enemyIds.length === 0) {
    throw new Error('Auto NPC decision requires at least one enemy');
  }

  const enemies = enemyIds.map((enemyId) => findCombatant(combatState, enemyId));

  return [...enemies].sort((left, right) => {
    const vitalityDelta = left.vitality.current - right.vitality.current;

    if (vitalityDelta !== 0) {
      return vitalityDelta;
    }

    return left.nextActionAt - right.nextActionAt;
  })[0] as Combatant;
}

function buildLlmPromptContext(npc: Combatant, profile: NpcControlProfile): string {
  const personality = profile.personality;
  const fragments = [
    `PNJ: ${npc.name}`,
    `archetype: ${profile.archetype}`,
    `vitalite: ${npc.vitality.current}/${npc.vitality.max}`
  ];

  if (personality?.motivations?.length) {
    fragments.push(`motivations: ${personality.motivations.join(', ')}`);
  }

  if (personality?.fears?.length) {
    fragments.push(`peurs: ${personality.fears.join(', ')}`);
  }

  if (personality?.values?.length) {
    fragments.push(`valeurs: ${personality.values.join(', ')}`);
  }

  if (personality?.speechStyle) {
    fragments.push(`style: ${personality.speechStyle}`);
  }

  return fragments.join('\n');
}

function findCombatant(state: CombatState, combatantId: string): Combatant {
  const combatant = state.timeline.find((candidate) => candidate.id === combatantId);

  if (combatant === undefined) {
    throw new Error(`Unknown combatant: ${combatantId}`);
  }

  return combatant;
}
