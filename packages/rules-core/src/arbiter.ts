export const ARBITER_PRECEDENCE = ['human_gm', 'player', 'llm', 'auto'] as const;

export type Arbiter = (typeof ARBITER_PRECEDENCE)[number];

export const CONFLICT_TYPES = [
  'rule_interpretation',
  'dice_roll_dispute',
  'controller_decision_dispute',
  'inter_player_pj_conflict'
] as const;

export const CONFLICT_RESOLUTION_HIERARCHY = [
  {
    actor: 'table',
    auditRequired: false,
    id: 'discussion_among_table',
    label: 'Discussion de table'
  },
  {
    actor: 'human_gm',
    auditRequired: true,
    id: 'gm_ruling',
    label: 'Décision MJ'
  },
  {
    actor: 'auto',
    auditRequired: true,
    id: 'rule_lookup',
    label: 'Consultation règles'
  },
  {
    actor: 'auto',
    auditRequired: true,
    id: 'dice_arbitration',
    label: 'Arbitrage par les dés'
  },
  {
    actor: 'admin',
    auditRequired: true,
    id: 'session_pause_for_admin_intervention',
    label: 'Pause et intervention admin'
  }
] as const;

export const CONFLICT_RECOURSES = [
  {
    auditRequired: true,
    consensusRequired: false,
    id: 're_roll_dice',
    label: 'Relancer le jet'
  },
  {
    auditRequired: true,
    consensusRequired: true,
    id: 'retcon_event',
    label: 'Retcon audité'
  },
  {
    auditRequired: true,
    consensusRequired: false,
    id: 'escalate_to_admin',
    label: 'Escalade admin'
  }
] as const;

export type ConflictType = (typeof CONFLICT_TYPES)[number];
export type ConflictResolutionActor = Arbiter | 'admin' | 'table';
export type ConflictResolutionStep = (typeof CONFLICT_RESOLUTION_HIERARCHY)[number];
export type ConflictResolutionStepId = ConflictResolutionStep['id'];
export type ConflictRecourse = (typeof CONFLICT_RECOURSES)[number];

export interface ConflictResolutionPlan {
  conflictType: ConflictType;
  description: string;
  recourses: readonly ConflictRecourse[];
  steps: readonly ConflictResolutionStep[];
}

const CONFLICT_DESCRIPTIONS: Record<ConflictType, string> = {
  controller_decision_dispute: 'Décision de contrôleur contestée par un joueur ou le MJ',
  dice_roll_dispute: 'Jet contesté, erreur de lancer ou soupçon de triche',
  inter_player_pj_conflict: 'Conflit PJ/PJ ou désaccord de table',
  rule_interpretation: 'Interprétation de règle contestée entre joueur et MJ'
};

const AUTHORITY_SCORE = new Map<Arbiter, number>(
  ARBITER_PRECEDENCE.map((arbiter, index) => [arbiter, ARBITER_PRECEDENCE.length - index])
);

export function compareArbiterAuthority(left: Arbiter, right: Arbiter): number {
  return authorityScore(left) - authorityScore(right);
}

export function hasArbiterAuthorityOver(left: Arbiter, right: Arbiter): boolean {
  return compareArbiterAuthority(left, right) > 0;
}

export function buildConflictResolutionPlan(conflictType: ConflictType): ConflictResolutionPlan {
  const description = CONFLICT_DESCRIPTIONS[conflictType];

  if (description === undefined) {
    throw new Error(`Unknown conflict type: ${conflictType}`);
  }

  return {
    conflictType,
    description,
    recourses: CONFLICT_RECOURSES,
    steps: CONFLICT_RESOLUTION_HIERARCHY
  };
}

export function nextConflictResolutionStep(
  completedSteps: readonly ConflictResolutionStepId[]
): ConflictResolutionStep | undefined {
  const completed = new Set(completedSteps);

  return CONFLICT_RESOLUTION_HIERARCHY.find((step) => !completed.has(step.id));
}

function authorityScore(arbiter: Arbiter): number {
  const score = AUTHORITY_SCORE.get(arbiter);
  if (score === undefined) {
    throw new Error(`Unknown arbiter: ${arbiter}`);
  }
  return score;
}
