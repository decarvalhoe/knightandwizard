import {
  computeAttackDamage,
  type CombatDamageResult,
  type DamageDefenseInput,
  type DamageModifier,
  type DamageZoneInput,
  type WeaponDamageSpec
} from './combat-damage.js';
import { type DiceRollResult, type RandomInteger, rollDice } from './dice.js';
import { DEFAULT_RULES_CONFIG, type RulesConfig } from './rules-config.js';
import { type EffectModel } from './effect-model.js';
import { effectiveValue } from './effects.js';

export const COMBAT_ROUND_LENGTH_DT = DEFAULT_RULES_CONFIG.combat.roundLengthDT;

export type TimelineDirection = '+' | '-' | '';
export type CombatActionType = 'attack' | 'defense' | 'spell' | 'move' | 'wait' | 'reload' | 'aim';
export type CombatStatusId = 'bleeding' | 'stunned' | 'unconscious' | 'dead' | string;

export interface CombatAttributes {
  strength: number;
  dexterity: number;
  stamina: number;
}

export interface CombatSkillSet {
  [skillId: string]: number;
}

export interface CombatVitality {
  current: number;
  max: number;
}

export interface CombatStatus {
  id: CombatStatusId;
  durationDT?: number;
  appliedAtDT?: number;
}

export interface CombatRollRequest {
  pool: number;
  difficulty: number;
}

export interface AttackDamageInput {
  attackerForce: number;
  weaponDamage: WeaponDamageSpec;
  damageModifiers?: DamageModifier[];
  defense?: DamageDefenseInput;
  zone?: DamageZoneInput;
}

export interface AttackAction {
  type: 'attack';
  targetId: string;
  attack: CombatRollRequest;
  defense?: CombatRollRequest;
  damage?: AttackDamageInput;
  damageOnHit?: number;
  costDT?: number;
}

export interface DefenseAction {
  type: 'defense';
  costDT?: number;
}

export interface SpellAction {
  type: 'spell';
  costDT?: number;
}

export interface MoveAction {
  type: 'move';
  costDT?: number;
}

export interface WaitAction {
  type: 'wait';
  costDT?: number;
}

/** R-9.3 — Ballistic preparation steps; each takes the actor's speed factor in DT. */
export interface ReloadAction {
  type: 'reload';
  costDT?: number;
}

export interface AimAction {
  type: 'aim';
  costDT?: number;
}

export type CombatAction =
  | AttackAction
  | DefenseAction
  | SpellAction
  | MoveAction
  | WaitAction
  | ReloadAction
  | AimAction;

export type CombatDamageBreakdown = CombatDamageResult;

export interface Combatant {
  id: string;
  name: string;
  speedFactor: number;
  nextActionAt: number;
  reflexes: number;
  vitality: CombatVitality;
  attributes: CombatAttributes;
  baseAttributes?: CombatAttributes;
  skills: CombatSkillSet;
  statuses: CombatStatus[];
  ignoresVitalityMalus?: boolean;
  pendingAction?: CombatAction;
  /** R-2.18 — total carried equipment weight in kg; drives the encumbrance speed penalty. */
  carriedWeightKg?: number;
  /** R-1.38 — active effects that may modify the speed factor (haste, slowness, atouts). */
  activeEffects?: EffectModel[];
}

export interface CombatEvent {
  type:
    | 'action_resolved'
    | 'action_interrupted'
    | 'attack_resolved'
    | 'damage_applied'
    | 'status_applied'
    | 'stamina_roll_resolved';
  atDT: number;
  actorId?: string;
  targetId?: string;
  actionType?: CombatActionType;
  costDT?: number;
  nextActionAt?: number;
  damage?: number;
  preventedDamage?: number;
  finalDamage?: number;
  damageBreakdown?: CombatDamageBreakdown;
  successes?: number;
  attackRoll?: DiceRollResult;
  defenseRoll?: DiceRollResult;
  staminaRoll?: DiceRollResult;
  status?: CombatStatus;
}

export interface CombatState {
  timeline: Combatant[];
  currentDT: number;
  round: number;
  log: CombatEvent[];
}

export interface CombatResolutionOptions {
  randomInteger?: RandomInteger;
}

/**
 * Creates an empty combat state using an absolute DT counter.
 *
 * Legacy UI displays DT as a cyclic 1-50 value. The engine stores absolute DTs
 * to keep timeline sorting unambiguous, while `getCyclicDT` preserves the old counter behavior.
 */
export function createCombatState(
  currentDT = 1,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): CombatState {
  assertPositiveInteger('currentDT', currentDT);

  return {
    timeline: [],
    currentDT,
    round: roundForDT(currentDT, config),
    log: []
  };
}

export function getCyclicDT(
  currentDT: number,
  direction: TimelineDirection,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): number {
  assertPositiveInteger('currentDT', currentDT);

  if (direction === '+') {
    return currentDT >= config.combat.roundLengthDT ? 1 : currentDT + 1;
  }

  if (direction === '-') {
    return currentDT <= 1 ? config.combat.roundLengthDT : currentDT - 1;
  }

  return currentDT;
}

/**
 * Adds a combatant to the dynamic DT timeline.
 *
 * If `nextActionAt` is not set, the first action follows the legacy assistant:
 * current DT + speed factor.
 */
export function addCombatant(
  state: CombatState,
  combatant: Combatant,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): CombatState {
  const normalized = normalizeCombatant(
    {
      ...combatant,
      nextActionAt:
        combatant.nextActionAt > 0
          ? combatant.nextActionAt
          : state.currentDT + effectiveSpeedFactor(combatant, config)
    },
    config
  );

  return {
    ...state,
    timeline: sortTimeline([...state.timeline, normalized])
  };
}

/**
 * Resolves the earliest scheduled combatant action and reschedules the actor.
 */
export function resolveNextAction(
  state: CombatState,
  options: CombatResolutionOptions = {},
  config: RulesConfig = DEFAULT_RULES_CONFIG
): CombatState {
  if (state.timeline.length === 0) {
    throw new Error('Cannot resolve combat action without combatants');
  }

  const timeline = sortTimeline(state.timeline);
  const actor = timeline[0];
  const action = actor.pendingAction ?? { type: 'wait' };
  const costDT = actionCostDT(actor, action, config);
  const currentDT = actor.nextActionAt;
  const nextActionAt = currentDT + costDT;
  const activeState: CombatState = {
    ...state,
    currentDT,
    round: roundForDT(currentDT, config),
    timeline
  };

  if (action.type === 'attack') {
    return rescheduleActor(
      resolveAttack(activeState, actor, action, { costDT, nextActionAt }, options, config),
      actor.id,
      action,
      config
    );
  }

  const event: CombatEvent = {
    type: 'action_resolved',
    actorId: actor.id,
    actionType: action.type,
    atDT: currentDT,
    costDT,
    nextActionAt
  };

  return rescheduleActor(
    {
      ...activeState,
      log: [...activeState.log, event]
    },
    actor.id,
    action,
    config
  );
}

/**
 * Applies final damage or healing and recomputes derived vitality malus.
 *
 * Positive values are damage. Negative values are healing.
 */
export function applyDamage(
  state: CombatState,
  targetId: string,
  damage: number,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): CombatState {
  const target = findCombatant(state, targetId);
  const previousVitality = target.vitality.current;
  const nextVitality = clamp(previousVitality - damage, 0, target.vitality.max);
  const finalDamage = Math.max(0, previousVitality - nextVitality);
  const healed = Math.max(0, nextVitality - previousVitality);
  const nextTarget = recomputeVitalityMalus(
    {
      ...target,
      vitality: {
        ...target.vitality,
        current: nextVitality
      },
      nextActionAt: finalDamage > 0 ? target.nextActionAt + finalDamage : target.nextActionAt
    },
    config
  );

  const withDeath =
    nextVitality === 0 ? withStatus(nextTarget, { id: 'dead' }, state.currentDT) : nextTarget;
  const withUnconscious =
    finalDamage > previousVitality * config.combat.unconsciousDamageRatio &&
    nextVitality > 0 &&
    !target.ignoresVitalityMalus
      ? withStatus(withDeath, { id: 'unconscious' }, state.currentDT)
      : withDeath;

  return replaceCombatant(
    {
      ...state,
      log: [
        ...state.log,
        {
          type: 'damage_applied',
          atDT: state.currentDT,
          targetId,
          damage,
          finalDamage,
          preventedDamage: healed
        }
      ]
    },
    withUnconscious
  );
}

export function applyStatus(
  state: CombatState,
  targetId: string,
  status: CombatStatus
): CombatState {
  const target = findCombatant(state, targetId);
  const nextTarget = withStatus(target, status, state.currentDT);

  return replaceCombatant(
    {
      ...state,
      log: [
        ...state.log,
        {
          type: 'status_applied',
          atDT: state.currentDT,
          targetId,
          status: nextTarget.statuses.find((candidate) => candidate.id === status.id)
        }
      ]
    },
    nextTarget
  );
}

export type InterruptOutcome = 'restart' | 'release';

/**
 * R-9.4 — Interrupts a combatant's in-progress action. The DT already invested
 * since declaration are LOST (no partial benefit). With `release` the actor is
 * freed at the current DT; with `restart` it re-attempts the same action and pays
 * its full speed-factor cost again from now. Spell energy loss (R-9.31) applies
 * once energy is modeled.
 */
export function interruptCombatant(
  state: CombatState,
  combatantId: string,
  outcome: InterruptOutcome = 'release',
  config: RulesConfig = DEFAULT_RULES_CONFIG
): CombatState {
  const target = findCombatant(state, combatantId);
  const interruptedAction = target.pendingAction;
  const cost = interruptedAction ? actionCostDT(target, interruptedAction, config) : 0;
  const remaining = Math.max(0, target.nextActionAt - state.currentDT);
  const lostDT = Math.max(0, cost - remaining);
  const restart = outcome === 'restart' && interruptedAction !== undefined;
  const next: Combatant = {
    ...target,
    nextActionAt: restart ? state.currentDT + cost : state.currentDT,
    pendingAction: restart ? interruptedAction : undefined
  };

  return replaceCombatant(
    {
      ...state,
      log: [
        ...state.log,
        {
          type: 'action_interrupted',
          atDT: state.currentDT,
          actorId: combatantId,
          actionType: interruptedAction?.type,
          costDT: lostDT,
          nextActionAt: next.nextActionAt
        }
      ]
    },
    next
  );
}

/**
 * Legacy endurance roll: stamina D10 vs difficulty 7, then one prevented damage per success.
 */
export function resolveStaminaDamage(
  state: CombatState,
  targetId: string,
  damage: number,
  options: CombatResolutionOptions = {},
  config: RulesConfig = DEFAULT_RULES_CONFIG
): CombatState {
  const target = findCombatant(state, targetId);
  const staminaRoll = rollDice(
    target.attributes.stamina,
    config.combat.staminaRollDifficulty,
    options
  );
  const preventedDamage = staminaRoll.successes;
  const finalDamage = Math.max(0, damage - preventedDamage);
  const damagedState = finalDamage > 0 ? applyDamage(state, targetId, finalDamage, config) : state;

  return {
    ...damagedState,
    log: [
      ...damagedState.log,
      {
        type: 'stamina_roll_resolved',
        atDT: state.currentDT,
        actorId: targetId,
        damage,
        preventedDamage,
        finalDamage,
        staminaRoll
      }
    ]
  };
}

function resolveAttack(
  state: CombatState,
  actor: Combatant,
  action: AttackAction,
  timing: { costDT: number; nextActionAt: number },
  options: CombatResolutionOptions,
  config: RulesConfig
): CombatState {
  const randomInteger = randomIntegerForResolution(options);
  const rollOptions = { randomInteger };
  const attackRoll = rollDice(action.attack.pool, action.attack.difficulty, rollOptions);
  const defenseRoll = action.defense
    ? rollDice(action.defense.pool, action.defense.difficulty, rollOptions)
    : undefined;
  const defenseSuccesses = defenseRoll?.successes ?? 0;
  const successes = Math.max(0, attackRoll.successes - defenseSuccesses);
  const damageBreakdown =
    action.damage !== undefined && successes > 0
      ? computeAttackDamage({
          ...action.damage,
          netToucheSuccesses: successes,
          randomInteger,
          config
        })
      : undefined;
  const event: CombatEvent = {
    type: 'attack_resolved',
    atDT: state.currentDT,
    actorId: actor.id,
    targetId: action.targetId,
    actionType: action.type,
    costDT: timing.costDT,
    nextActionAt: timing.nextActionAt,
    successes,
    attackRoll,
    defenseRoll,
    ...(damageBreakdown !== undefined ? { damageBreakdown } : {})
  };
  const withAttackLog = {
    ...state,
    log: [...state.log, event]
  };

  if (damageBreakdown !== undefined) {
    return applyDamage(withAttackLog, action.targetId, damageBreakdown.finalDamage, config);
  }

  if (successes > 0 && action.damageOnHit !== undefined && action.damageOnHit > 0) {
    return applyDamage(withAttackLog, action.targetId, action.damageOnHit, config);
  }

  return withAttackLog;
}

function rescheduleActor(
  state: CombatState,
  actorId: string,
  action: CombatAction,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): CombatState {
  const actor = findCombatant(state, actorId);
  const delay = actionCostDT(actor, action, config);

  return replaceCombatant(state, {
    ...actor,
    nextActionAt: state.currentDT + delay,
    pendingAction: undefined
  });
}

function actionCostDT(
  actor: Combatant,
  action: CombatAction,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): number {
  return action.costDT ?? effectiveSpeedFactor(actor, config);
}

/**
 * R-2.18 / R-1.38 — Effective speed factor used to schedule a combatant's actions.
 *
 * Starts from the base (racial) speed factor, adds the encumbrance penalty (R-2.18:
 * +1 DT per full `encumbranceKgPerStep` kg carried above `strength *
 * encumbranceKgPerStrength`, using the CURRENT Force so weakening shrinks capacity),
 * then applies magic/atout effects targeting `factor` (R-1.38: haste lowers, slowness
 * raises). The result is rounded and floored at `minSpeedFactor`.
 */
export function effectiveSpeedFactor(
  actor: Combatant,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): number {
  const loadedBase = actor.speedFactor + encumbrancePenalty(actor, config);
  const effects = actor.activeEffects ?? [];

  if (effects.length === 0) {
    return Math.max(config.combat.minSpeedFactor, loadedBase);
  }

  const modified = effectiveValue(loadedBase, 'factor', undefined, effects, {});

  return Math.max(config.combat.minSpeedFactor, Math.round(modified));
}

function encumbrancePenalty(actor: Combatant, config: RulesConfig): number {
  const carried = actor.carriedWeightKg;

  if (carried === undefined || carried <= 0) {
    return 0;
  }

  const capacity = actor.attributes.strength * config.combat.encumbranceKgPerStrength;
  const excess = Math.max(0, carried - capacity);

  return Math.ceil(excess / config.combat.encumbranceKgPerStep);
}

function randomIntegerForResolution(options: CombatResolutionOptions): RandomInteger {
  return options.randomInteger ?? defaultRandomInteger;
}

function defaultRandomInteger(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

function normalizeCombatant(
  combatant: Combatant,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): Combatant {
  return recomputeVitalityMalus(
    {
      ...combatant,
      baseAttributes: combatant.baseAttributes ?? combatant.attributes,
      statuses: combatant.statuses ?? [],
      skills: combatant.skills ?? {}
    },
    config
  );
}

function recomputeVitalityMalus(
  combatant: Combatant,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): Combatant {
  const baseAttributes = combatant.baseAttributes ?? combatant.attributes;
  const malus = combatant.ignoresVitalityMalus
    ? 0
    : Math.max(
        0,
        Math.round(combatant.vitality.max * config.combat.vitalityMalusRatio) -
          combatant.vitality.current
      );

  return {
    ...combatant,
    baseAttributes,
    attributes: {
      strength: Math.max(0, baseAttributes.strength - malus),
      dexterity: Math.max(0, baseAttributes.dexterity - malus),
      stamina: Math.max(0, baseAttributes.stamina - malus)
    }
  };
}

function withStatus(combatant: Combatant, status: CombatStatus, currentDT: number): Combatant {
  if (combatant.statuses.some((candidate) => candidate.id === status.id)) {
    return combatant;
  }

  return {
    ...combatant,
    statuses: [
      ...combatant.statuses,
      {
        ...status,
        appliedAtDT: status.appliedAtDT ?? currentDT
      }
    ]
  };
}

function replaceCombatant(state: CombatState, combatant: Combatant): CombatState {
  return {
    ...state,
    timeline: sortTimeline(
      state.timeline.map((candidate) => (candidate.id === combatant.id ? combatant : candidate))
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

function roundForDT(currentDT: number, config: RulesConfig = DEFAULT_RULES_CONFIG): number {
  return Math.floor((currentDT - 1) / config.combat.roundLengthDT) + 1;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function assertPositiveInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
}
