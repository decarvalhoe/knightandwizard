import {
  computeAttackDamage,
  type CombatDamageResult,
  type DamageDefenseInput,
  type DamageModifier,
  type DamageType,
  type DamageZoneInput,
  type WeaponDamageSpec
} from './combat-damage.js';
import { type DiceRollResult, type RandomInteger, rollDice } from './dice.js';
import { resolveSpellCast, type SpellCastResult, spendEnergy } from './magic.js';
import { DEFAULT_RULES_CONFIG, type RulesConfig } from './rules-config.js';
import {
  type EffectModel,
  type EffectOperation,
  type EffectTarget,
  type EffectValueContext,
  evaluateValue
} from './effect-model.js';
import { applyEffectiveModifiers, computeEffectiveModifiers, effectiveValue } from './effects.js';
import {
  resolveSpellResistance,
  type SpellResistanceResult,
  type TargetResistanceProfile
} from './resistance.js';

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

/**
 * A spell action in the combat timeline. The casting fields are OPTIONAL so the same `'spell'`
 * action type can also stand for a scheduled incantation placeholder (only a `costDT`), as the
 * combat tracker UI uses it. A *resolvable cast* additionally carries the R-8.5 roll inputs
 * (`intelligence` + `spellPoints` vs `difficulty`); `resolveNextAction` only rolls a cast when
 * those are present, otherwise the action resolves as a generic timed action.
 *
 * The canonical entry point is `declareSpellCast`: it spends `energyCost` immediately (R-8.10) and
 * schedules the caster `castingTimeDT` DT ahead (R-8.6 windup), so an interruption during that
 * window loses the energy with no refund (R-8.7). `costDT` is the post-cast recovery (defaults to
 * the effective speed factor).
 */
export interface SpellAction {
  type: 'spell';
  /** Optional catalog id of the spell being cast (provenance / logging). */
  spellId?: string;
  /** R-8.5 — caster Intelligence (the cast pool is Intelligence + spellPoints). */
  intelligence?: number;
  /** R-8.5 — points invested in the spell (no skill, no specialisation). */
  spellPoints?: number;
  /** R-8.5 — agreed spell difficulty (may exceed 9, R-1.20). */
  difficulty?: number;
  /** R-8.10 — energy spent to cast, committed at declaration (lost if interrupted). */
  energyCost?: number;
  /** R-8.6 — incantation time in DT (the interruptible windup before the spell launches). */
  castingTimeDT?: number;
  /** R-8.8 — DT shaved off the windup by spending 2 energy/DT; the TI floors at the speed factor. */
  tiReductionDT?: number;
  /** Optional target of the spell. */
  targetId?: string;
  /**
   * E1b — structured effect of the spell (provenance: catalog `spells.yaml`). When present and the
   * cast nets ≥1 success, `resolveSpell` evaluates it with `successes` = net successes (R-8.5) and,
   * for `damage`/`vitality` targets, applies it to `targetId`. The damage type is carried on the
   * resolved outcome (`spellEffect.scope`) so the resistance layer (E4) can interpose.
   */
  effect?: EffectModel;
  /**
   * R-8.15 — whether the spell acts DIRECTLY on the living target (control, transformation, heal,
   * blessing). Routes resistance: a direct spell is gated by magic resistance (shield offensively,
   * burden on a beneficial spell); an indirect spell (e.g. a projected element) is gated by
   * elemental resistance instead. Defaults to `false` (indirect). Provenance: spell `direct_magic`.
   */
  directMagic?: boolean;
  /** Post-cast recovery in DT; defaults to the caster's effective speed factor. */
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
  /** R-9.17 — base (racial) max vitality for the lethal-zone death threshold; defaults to vitality.max. */
  baseVitalityMax?: number;
  /** R-8.10 — spell energy pool ({ current, max }); required to declare a spell cast. */
  energy?: CombatVitality;
  /** R-8.7 — damage suffered during the current incantation; raises the cast difficulty (+1/pt). */
  spellConcentrationDamage?: number;
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
  /** R-8.15 / R-1.33 — per-type resistance profile (magic %, elemental % by element). */
  resistances?: TargetResistanceProfile;
}

export interface CombatEvent {
  type:
    | 'action_resolved'
    | 'action_interrupted'
    | 'attack_resolved'
    | 'spell_started'
    | 'spell_resolved'
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
  /** R-8.5 — spell casting roll result (on `spell_resolved`). */
  spellCast?: SpellCastResult;
  /** E1b — resolved structured spell effect, scaled by net successes (on `spell_resolved`). */
  spellEffect?: SpellEffectOutcome;
  /** R-8.10 — energy committed for a spell (on `spell_started`; lost if interrupted). */
  energySpent?: number;
}

/**
 * E1b — a spell's structured effect after evaluation, scaled by the cast's net successes (R-8.5).
 * `value` is the resolved numeric magnitude; `scope` carries the damage type (P/E/C/T) for a
 * `damage` target so the resistance layer (E4) can interpose. `applied` is true when the outcome
 * mutated the target's vitality during this resolution (damage / heal); other targets (factor,
 * difficulty, status, energy…) are reported but not auto-applied here.
 */
export interface SpellEffectOutcome {
  target: EffectTarget;
  op: EffectOperation;
  scope?: string;
  /** Evaluated magnitude BEFORE resistance (successes-scaled). */
  value: number;
  applied: boolean;
  /**
   * E4b — resistance outcome (magic/elemental layers, R-8.15) when the effect is applied to a
   * target. `resistance.amount` is the magnitude actually applied after the layers; `value` stays
   * the pre-resistance magnitude. Absent when no target / not applied.
   */
  resistance?: SpellResistanceResult;
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

  if (action.type === 'spell' && isSpellCastReady(action)) {
    return rescheduleActor(
      resolveSpell(activeState, actor, action, { costDT, nextActionAt }, options, config),
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
export interface ApplyDamageOptions {
  /** R-9.17 — the zone struck, enabling head-knockout and lethal-zone thresholds. */
  zone?: { id?: string };
}

export function applyDamage(
  state: CombatState,
  targetId: string,
  damage: number,
  config: RulesConfig = DEFAULT_RULES_CONFIG,
  options: ApplyDamageOptions = {}
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
      nextActionAt: finalDamage > 0 ? target.nextActionAt + finalDamage : target.nextActionAt,
      // R-8.7 — damage suffered mid-incantation accumulates and raises the eventual cast difficulty.
      ...(target.pendingAction?.type === 'spell' && finalDamage > 0
        ? { spellConcentrationDamage: (target.spellConcentrationDamage ?? 0) + finalDamage }
        : {})
    },
    config
  );

  // R-9.17 — zone thresholds use the blow's final damage in a single hit.
  const blow = Math.max(0, damage);
  const zoneId = options.zone?.id;
  const survivesMalus = !target.ignoresVitalityMalus;
  const zoneDeath =
    survivesMalus &&
    zoneId !== undefined &&
    config.combat.lethalZoneIds.includes(zoneId) &&
    blow > (target.baseVitalityMax ?? target.vitality.max) * config.combat.lethalZoneBaseRatio;
  const headKnockout =
    survivesMalus &&
    zoneId !== undefined &&
    config.combat.headZoneIds.includes(zoneId) &&
    blow > target.vitality.max * config.combat.headUnconsciousMaxRatio;
  const isDead = nextVitality === 0 || zoneDeath;
  const withDeath = isDead ? withStatus(nextTarget, { id: 'dead' }, state.currentDT) : nextTarget;
  const generalKnockout = finalDamage > previousVitality * config.combat.unconsciousDamageRatio;
  const withUnconscious =
    !isDead && survivesMalus && (generalKnockout || headKnockout)
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
 * its full speed-factor cost again from now. A spell's energy is committed at
 * `declareSpellCast`, so interrupting an in-progress cast loses it with no refund (R-8.7 / R-9.31).
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
    pendingAction: restart ? interruptedAction : undefined,
    spellConcentrationDamage: undefined
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
 * R-8.5 / R-8.6 / R-8.7 — Commits a combatant to casting a spell from the current DT.
 *
 * The energy cost is spent immediately (R-8.10) and the caster is scheduled to resolve the cast
 * `castingTimeDT` DT later (R-8.6): that window is the interruptible incantation. Because the
 * energy is already committed, an `interruptCombatant` during the window loses it with no refund
 * (R-8.7). Call this on the caster's turn, then advance the timeline with `resolveNextAction`,
 * which resolves the casting roll when the caster reaches the front again.
 */
export function declareSpellCast(
  state: CombatState,
  casterId: string,
  action: SpellAction,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): CombatState {
  const caster = findCombatant(state, casterId);

  if (caster.energy === undefined) {
    throw new Error(`combatant ${casterId} has no energy pool and cannot cast spells`);
  }

  if (!isSpellCastReady(action)) {
    throw new Error('declareSpellCast requires intelligence, spellPoints and difficulty (R-8.5)');
  }

  if (action.castingTimeDT === undefined) {
    throw new Error('declareSpellCast requires castingTimeDT (R-8.6)');
  }

  if (action.energyCost === undefined) {
    throw new Error('declareSpellCast requires energyCost (R-8.10)');
  }

  assertPositiveInteger('castingTimeDT', action.castingTimeDT);

  const reductionRequest = action.tiReductionDT ?? 0;
  if (!Number.isInteger(reductionRequest) || reductionRequest < 0) {
    throw new Error('tiReductionDT must be a non-negative integer');
  }

  // R-8.8 — spending 2 energy/DT shortens the windup, but never below the speed factor (web
  // canonical floor) and never inflating an already-faster-than-FV spell.
  const floor = Math.min(effectiveSpeedFactor(caster, config), action.castingTimeDT);
  const effectiveTI = Math.max(floor, action.castingTimeDT - reductionRequest);
  const actualReduction = action.castingTimeDT - effectiveTI;
  const totalEnergyCost = action.energyCost + 2 * actualReduction;

  const energy = spendEnergy(caster.energy, totalEnergyCost);
  const nextActionAt = state.currentDT + effectiveTI;
  const next: Combatant = {
    ...caster,
    energy,
    nextActionAt,
    pendingAction: action
  };

  return replaceCombatant(
    {
      ...state,
      log: [
        ...state.log,
        {
          type: 'spell_started',
          atDT: state.currentDT,
          actorId: casterId,
          ...(action.targetId !== undefined ? { targetId: action.targetId } : {}),
          actionType: 'spell',
          costDT: effectiveTI,
          nextActionAt,
          energySpent: totalEnergyCost
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
          damageModifiers: [
            ...(action.damage.damageModifiers ?? []),
            ...damageModifiersFromEffects(actor)
          ],
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
    return applyDamage(withAttackLog, action.targetId, damageBreakdown.finalDamage, config, {
      zone: action.damage?.zone
    });
  }

  if (successes > 0 && action.damageOnHit !== undefined && action.damageOnHit > 0) {
    return applyDamage(withAttackLog, action.targetId, action.damageOnHit, config);
  }

  return withAttackLog;
}

/** A spell action that carries the R-8.5 roll inputs and can therefore be resolved as a cast. */
type ResolvableSpellCast = SpellAction & {
  intelligence: number;
  spellPoints: number;
  difficulty: number;
};

function isSpellCastReady(action: SpellAction): action is ResolvableSpellCast {
  return (
    action.intelligence !== undefined &&
    action.spellPoints !== undefined &&
    action.difficulty !== undefined
  );
}

function resolveSpell(
  state: CombatState,
  actor: Combatant,
  action: ResolvableSpellCast,
  timing: { costDT: number; nextActionAt: number },
  options: CombatResolutionOptions,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): CombatState {
  const randomInteger = randomIntegerForResolution(options);
  // R-8.7 — the mage kept concentrating through the hits taken during the windup: the cast
  // difficulty rises by +1 per damage point suffered during the incantation.
  const concentrationPenalty = actor.spellConcentrationDamage ?? 0;
  const spellCast = resolveSpellCast(
    action.intelligence,
    action.spellPoints,
    action.difficulty + concentrationPenalty,
    { randomInteger }
  );

  // E1b — the spell takes effect only on a successful cast (≥1 net success, R-8.5). The structured
  // effect is then evaluated with `successes` = net successes (per-réussite scaling, R-8.15).
  let spellEffect =
    action.effect !== undefined && spellCast.netSuccesses > 0
      ? evaluateSpellEffect(action.effect, actor, action, spellCast.netSuccesses)
      : undefined;

  // E4b — interpose the magic/elemental resistance layers (R-8.15 / R-1.33) before applying the
  // effect to the target. A direct spell is gated by magic resistance (shield, or burden on a
  // beneficial spell); an indirect spell with an element is gated by elemental resistance. The
  // applied magnitude is `resistance.amount` (0 if a layer fully resists).
  let appliedDelta = 0;
  if (spellEffect?.applied === true && action.targetId !== undefined) {
    const target = findCombatant(state, action.targetId);
    const beneficial = spellEffect.target === 'vitality' && spellEffect.op === 'add';
    const resistance = resolveSpellResistance(
      {
        directMagic: action.directMagic ?? false,
        beneficial,
        ...(spellEffect.scope !== undefined ? { element: spellEffect.scope } : {}),
        amount: spellEffect.value
      },
      target.resistances ?? {},
      { randomInteger }
    );
    spellEffect = { ...spellEffect, resistance };
    appliedDelta = spellEffectSign(spellEffect) * resistance.amount;
  }

  const event: CombatEvent = {
    type: 'spell_resolved',
    atDT: state.currentDT,
    actorId: actor.id,
    ...(action.targetId !== undefined ? { targetId: action.targetId } : {}),
    actionType: 'spell',
    costDT: timing.costDT,
    nextActionAt: timing.nextActionAt,
    successes: spellCast.netSuccesses,
    spellCast,
    ...(spellEffect !== undefined ? { spellEffect } : {})
  };

  const loggedState: CombatState = {
    ...state,
    log: [...state.log, event]
  };

  if (appliedDelta !== 0 && action.targetId !== undefined) {
    return applyDamage(loggedState, action.targetId, appliedDelta, config);
  }

  return loggedState;
}

/**
 * E1b — evaluates a spell's structured effect, scaling per net successes. `damage` and `vitality`
 * targets resolve to a vitality delta applied to the target; other targets (factor, difficulty,
 * status, energy…) are reported (`applied: false`) and left to their dedicated layers (E3/E4).
 */
function evaluateSpellEffect(
  effect: EffectModel,
  actor: Combatant,
  action: ResolvableSpellCast,
  netSuccesses: number
): SpellEffectOutcome {
  const spec = effect.spec;
  const value = Math.round(
    evaluateValue(spec.value, spellEffectContext(actor, action, netSuccesses))
  );
  const mutatesVitality =
    spec.target === 'damage' ||
    (spec.target === 'vitality' && (spec.op === 'add' || spec.op === 'sub'));

  return {
    target: spec.target,
    op: spec.op,
    ...(spec.scope !== undefined ? { scope: spec.scope } : {}),
    value,
    applied: mutatesVitality && action.targetId !== undefined
  };
}

/**
 * Builds the evaluation context from the caster. Combat only tracks the three physical attributes
 * plus the spell pool's Intelligence (R-8.5); effects referencing unavailable variables (e.g.
 * `level`) throw explicitly rather than guessing.
 */
function spellEffectContext(
  actor: Combatant,
  action: ResolvableSpellCast,
  netSuccesses: number
): EffectValueContext {
  return {
    successes: netSuccesses,
    force: actor.attributes.strength,
    dexterity: actor.attributes.dexterity,
    stamina: actor.attributes.stamina,
    intelligence: action.intelligence,
    vitalityMax: actor.vitality.max,
    ...(actor.energy !== undefined ? { energyMax: actor.energy.max } : {})
  };
}

/**
 * Sign of the vitality delta for `applyDamage` (+1 = damage, -1 = heal). `damage` and a `vitality`
 * reduction (`sub`) deal damage; a `vitality` increase (`add`) heals. Multiplied by the
 * post-resistance magnitude to get the signed delta.
 */
function spellEffectSign(outcome: SpellEffectOutcome): number {
  if (outcome.target === 'damage') {
    return 1;
  }
  if (outcome.target === 'vitality') {
    return outcome.op === 'add' ? -1 : 1;
  }
  return 0;
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
    pendingAction: undefined,
    spellConcentrationDamage: undefined
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

const DAMAGE_TYPES: DamageType[] = ['P', 'E', 'C', 'T'];

/**
 * #137 — Maps the actor's active EffectModel `damage`-target effects to per-type damage
 * modifiers consumed by combat-damage. Scope = damage type (P/E/C/T) or global (all types).
 * Only additive (add/sub) effects are mapped.
 */
function damageModifiersFromEffects(actor: Combatant): DamageModifier[] {
  const effects = actor.activeEffects ?? [];

  if (effects.length === 0) {
    return [];
  }

  const modifiers = computeEffectiveModifiers(effects, {});

  return DAMAGE_TYPES.flatMap((type) => {
    const value = Math.round(applyEffectiveModifiers(0, 'damage', type, modifiers, {}));

    return value === 0 ? [] : [{ type, value, source: 'effect' }];
  });
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
