import {
  COMBAT_ROUND_LENGTH_DT,
  addCombatant,
  applyDamage,
  createCombatState,
  resolveNextAction,
  type CombatAction,
  type CombatActionType,
  type Combatant,
  type CombatEvent,
  type CombatState,
  type RandomInteger
} from '@knightandwizard/rules-core';

export type VitalityState = 'critical' | 'dead' | 'healthy' | 'wounded';
export type CombatLogTone = 'danger' | 'neutral' | 'success' | 'warning';

export interface CombatantTemplate extends Omit<Combatant, 'baseAttributes'> {
  baseAttributes?: Combatant['baseAttributes'];
}

export interface CombatTrackerStateInput {
  combatants?: CombatantTemplate[];
  currentDT?: number;
}

export interface CombatTimelineRow {
  absoluteDT: number;
  active: boolean;
  cyclicDT: number;
  id: string;
  intent: string;
  name: string;
  relativeDT: number;
  round: number;
  statusLabels: string[];
  vitalityPercent: number;
  vitalityState: VitalityState;
}

export interface CombatRosterRow extends CombatTimelineRow {
  reflexes: number;
  speedFactor: number;
  vitality: {
    current: number;
    max: number;
  };
}

export interface CombatLogRow {
  atDT: number;
  label: string;
  tone: CombatLogTone;
}

export interface CombatTrackerView {
  current: {
    absoluteDT: number;
    cyclicDT: number;
    round: number;
  };
  log: CombatLogRow[];
  nextActor?: CombatTimelineRow;
  roster: CombatRosterRow[];
  timeline: CombatTimelineRow[];
}

const actionLabels: Record<CombatActionType, string> = {
  attack: 'attaque',
  defense: 'défense',
  move: 'déplacement',
  spell: 'sort',
  wait: 'attente'
};

const statusLabels: Record<string, string> = {
  bleeding: 'Saignement',
  dead: 'Mort',
  stunned: 'Étourdi',
  unconscious: 'Inconscient'
};

export function createCombatTrackerState(input: CombatTrackerStateInput = {}): CombatState {
  return (input.combatants ?? []).reduce(
    (state, combatant) => addTrackerCombatant(state, combatant),
    createCombatState(input.currentDT ?? 1)
  );
}

export function createTrackerCombatant(template: CombatantTemplate): Combatant {
  const baseAttributes = template.baseAttributes ?? template.attributes;

  return {
    ...template,
    attributes: { ...template.attributes },
    baseAttributes: { ...baseAttributes },
    skills: { ...template.skills },
    statuses: template.statuses.map((status) => ({ ...status })),
    vitality: { ...template.vitality }
  };
}

export function addTrackerCombatant(state: CombatState, template: CombatantTemplate): CombatState {
  if (state.timeline.some((combatant) => combatant.id === template.id)) {
    throw new Error(`Combatant already exists: ${template.id}`);
  }

  return addCombatant(state, createTrackerCombatant(template));
}

export function removeTrackerCombatant(state: CombatState, combatantId: string): CombatState {
  return {
    ...state,
    timeline: state.timeline.filter((combatant) => combatant.id !== combatantId)
  };
}

export function queueTrackerAction(
  state: CombatState,
  combatantId: string,
  action: CombatAction
): CombatState {
  const timeline = state.timeline.map((combatant) =>
    combatant.id === combatantId ? { ...combatant, pendingAction: action } : combatant
  );

  if (timeline.every((combatant) => combatant.id !== combatantId)) {
    throw new Error(`Unknown combatant: ${combatantId}`);
  }

  return {
    ...state,
    timeline: sortTimeline(timeline)
  };
}

export function resolveTrackerNextAction(
  state: CombatState,
  randomInteger?: RandomInteger
): CombatState {
  return resolveNextAction(state, randomInteger ? { randomInteger } : {});
}

export function applyTrackerDamage(
  state: CombatState,
  combatantId: string,
  damage: number
): CombatState {
  return applyDamage(state, combatantId, damage);
}

export function buildCombatTrackerView(state: CombatState): CombatTrackerView {
  const timeline = sortTimeline(state.timeline).map((combatant, index) =>
    toTimelineRow(combatant, state, index === 0)
  );

  return {
    current: {
      absoluteDT: state.currentDT,
      cyclicDT: toCyclicDT(state.currentDT),
      round: state.round
    },
    log: state.log.map((event) => formatCombatEvent(event, state.timeline)),
    nextActor: timeline[0],
    roster: sortRoster(state.timeline).map((combatant) => ({
      ...toTimelineRow(combatant, state, timeline[0]?.id === combatant.id),
      reflexes: combatant.reflexes,
      speedFactor: combatant.speedFactor,
      vitality: { ...combatant.vitality }
    })),
    timeline
  };
}

export function formatCombatEvent(event: CombatEvent, combatants: Combatant[]): CombatLogRow {
  const actor = event.actorId ? findName(combatants, event.actorId) : undefined;
  const target = event.targetId ? findName(combatants, event.targetId) : undefined;

  if (event.type === 'attack_resolved') {
    const successes = event.successes ?? 0;

    return {
      atDT: event.atDT,
      label:
        successes > 0
          ? `${actor ?? 'Un combattant'} touche ${target ?? 'la cible'} : ${successes} succès`
          : `${actor ?? 'Un combattant'} rate ${target ?? 'la cible'}`,
      tone: successes > 0 ? 'success' : 'warning'
    };
  }

  if (event.type === 'damage_applied') {
    const finalDamage = event.finalDamage ?? 0;
    const healed = event.preventedDamage ?? 0;

    return {
      atDT: event.atDT,
      label:
        event.damage !== undefined && event.damage < 0
          ? `Soin ${healed} sur ${target ?? 'la cible'}`
          : `Dégâts ${finalDamage} sur ${target ?? 'la cible'}`,
      tone: finalDamage > 0 ? 'danger' : 'neutral'
    };
  }

  if (event.type === 'status_applied') {
    return {
      atDT: event.atDT,
      label: `${statusLabel(event.status?.id ?? 'état')} sur ${target ?? 'la cible'}`,
      tone: 'warning'
    };
  }

  if (event.type === 'stamina_roll_resolved') {
    return {
      atDT: event.atDT,
      label: `${actor ?? 'Un combattant'} encaisse ${event.preventedDamage ?? 0} dégâts`,
      tone: 'neutral'
    };
  }

  return {
    atDT: event.atDT,
    label: `${actor ?? 'Un combattant'} résout ${event.actionType ?? 'action'}`,
    tone: 'neutral'
  };
}

function toTimelineRow(
  combatant: Combatant,
  state: CombatState,
  active: boolean
): CombatTimelineRow {
  return {
    absoluteDT: combatant.nextActionAt,
    active,
    cyclicDT: toCyclicDT(combatant.nextActionAt),
    id: combatant.id,
    intent: actionIntent(combatant.pendingAction),
    name: combatant.name,
    relativeDT: Math.max(0, combatant.nextActionAt - state.currentDT),
    round: roundForDT(combatant.nextActionAt),
    statusLabels: combatant.statuses.map((status) => statusLabel(status.id)),
    vitalityPercent: vitalityPercent(combatant),
    vitalityState: vitalityState(combatant)
  };
}

function actionIntent(action: CombatAction | undefined): string {
  if (!action) {
    return 'Action à déclarer';
  }

  if (action.type === 'attack') {
    return `Attaque ${action.targetId}`;
  }

  return actionLabels[action.type];
}

function vitalityPercent(combatant: Combatant): number {
  if (combatant.vitality.max <= 0) {
    return 0;
  }

  return Math.round((combatant.vitality.current / combatant.vitality.max) * 100);
}

function vitalityState(combatant: Combatant): VitalityState {
  if (
    combatant.vitality.current <= 0 ||
    combatant.statuses.some((status) => status.id === 'dead')
  ) {
    return 'dead';
  }

  const percent = vitalityPercent(combatant);

  if (percent <= 50) {
    return 'critical';
  }

  if (percent <= 75) {
    return 'wounded';
  }

  return 'healthy';
}

function statusLabel(statusId: string): string {
  return statusLabels[statusId] ?? statusId;
}

function findName(combatants: Combatant[], combatantId: string): string | undefined {
  return combatants.find((combatant) => combatant.id === combatantId)?.name;
}

function toCyclicDT(absoluteDT: number): number {
  return ((absoluteDT - 1) % COMBAT_ROUND_LENGTH_DT) + 1;
}

function roundForDT(absoluteDT: number): number {
  return Math.floor((absoluteDT - 1) / COMBAT_ROUND_LENGTH_DT) + 1;
}

function sortTimeline(timeline: Combatant[]): Combatant[] {
  return [...timeline].sort((left, right) => {
    const nextActionDelta = left.nextActionAt - right.nextActionAt;

    if (nextActionDelta !== 0) {
      return nextActionDelta;
    }

    const reflexDelta = right.reflexes - left.reflexes;

    if (reflexDelta !== 0) {
      return reflexDelta;
    }

    return left.id.localeCompare(right.id);
  });
}

function sortRoster(timeline: Combatant[]): Combatant[] {
  return [...timeline].sort((left, right) => left.name.localeCompare(right.name));
}
