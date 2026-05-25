import { type DiceRollResult, type RandomInteger, rollDice } from './dice.js';
import { DEFAULT_RULES_CONFIG, type RulesConfig } from './rules-config.js';

export type DamageType = 'P' | 'E' | 'C' | 'T';
export type DamageProtectionValues = Partial<Record<DamageType, number>>;

export interface WeaponDamageSpec {
  components: WeaponDamageComponentSpec[];
}

export interface WeaponDamageComponentSpec {
  type: DamageType;
  includesForce?: boolean;
  flat?: number;
  ammoBonus?: number;
  label?: string;
}

export interface DamageModifier {
  type: DamageType;
  value: number;
  source?: string;
}

export interface DamageShieldInput {
  percent: number;
  usable?: boolean;
  source?: string;
}

export interface DamageProtectionLayerInput {
  id?: string;
  layer: string;
  zones: string[];
  values: DamageProtectionValues;
  enabled?: boolean;
}

export interface DamageEnduranceInput {
  pool: number;
  difficulty?: number;
  enabled?: boolean;
}

export interface DamageDefenseInput {
  shield?: DamageShieldInput;
  percentageResistances?: Partial<Record<DamageType, number>>;
  circumstanceModifiers?: DamageModifier[];
  protections?: DamageProtectionLayerInput[];
  endurance?: DamageEnduranceInput;
}

export interface DamageZoneInput {
  id?: string;
  damageMultiplier?: number;
  allowsEndurance?: boolean;
}

export interface ComputeAttackDamageInput {
  attackerForce: number;
  netToucheSuccesses: number;
  weaponDamage: WeaponDamageSpec;
  damageModifiers?: DamageModifier[];
  defense?: DamageDefenseInput;
  zone?: DamageZoneInput;
  randomInteger: RandomInteger;
  config?: RulesConfig;
}

export interface RollAttackDamageInput {
  attackerForce: number;
  netToucheSuccesses: number;
  weaponDamage: WeaponDamageSpec;
  damageModifiers?: DamageModifier[];
  randomInteger: RandomInteger;
}

export interface RolledDamageComponent {
  type: DamageType;
  label?: string;
  includesForce: boolean;
  forceSuccesses: number;
  flat: number;
  ammoBonus: number;
  damageModifier: number;
  raw: number;
}

export interface RollAttackDamageResult {
  components: RolledDamageComponent[];
  log: CombatDamageLogEntry[];
}

export interface MitigateDamageInput {
  components: RolledDamageComponent[];
  defense?: DamageDefenseInput;
  zone?: DamageZoneInput;
  randomInteger: RandomInteger;
  config?: RulesConfig;
}

export interface ComputedDamageComponent extends RolledDamageComponent {
  shieldPercent?: number;
  shieldRoll?: number;
  shieldDeflected: boolean;
  afterShield: number;
  resistancePercent?: number;
  resistanceRoll?: number;
  resisted: boolean;
  afterResistance: number;
  circumstanceModifier: number;
  afterCircumstance: number;
  protection: number;
  protectionLayers: string[];
  protectionIds: string[];
  afterProtection: number;
  enduranceReduction: number;
  afterEndurance: number;
  zoneMultiplier: number;
  final: number;
}

export interface CombatDamageResult {
  finalDamage: number;
  components: ComputedDamageComponent[];
  log: CombatDamageLogEntry[];
}

export type CombatDamageLogEntry =
  | {
      step: 'force_roll';
      pool: number;
      difficulty: number;
      successes: number;
      roll: DiceRollResult;
    }
  | {
      step: 'raw_damage';
      componentIndex: number;
      type: DamageType;
      forceSuccesses: number;
      flat: number;
      ammoBonus: number;
      damageModifier: number;
      after: number;
    }
  | {
      step: 'shield';
      componentIndex: number;
      type: DamageType;
      before: number;
      percent: number;
      roll?: number;
      deflected: boolean;
      after: number;
    }
  | {
      step: 'resistance';
      componentIndex: number;
      type: DamageType;
      before: number;
      percent: number;
      roll?: number;
      resisted: boolean;
      after: number;
    }
  | {
      step: 'circumstance';
      componentIndex: number;
      type: DamageType;
      before: number;
      modifier: number;
      after: number;
    }
  | {
      step: 'protection';
      componentIndex: number;
      type: DamageType;
      before: number;
      protection: number;
      layers: string[];
      protectionIds: string[];
      after: number;
    }
  | {
      step: 'endurance_roll';
      pool: number;
      difficulty: number;
      successes: number;
      roll: DiceRollResult;
      before: number;
      reduction: number;
      after: number;
    }
  | {
      step: 'endurance';
      componentIndex: number;
      type: DamageType;
      before: number;
      reduction: number;
      after: number;
      skipped: boolean;
      reason?: 'zone_forbids_endurance' | 'no_endurance_pool' | 'no_damage';
    }
  | {
      step: 'zone';
      componentIndex: number;
      type: DamageType;
      before: number;
      multiplier: number;
      after: number;
    };

interface MitigatedBeforeEnduranceComponent extends RolledDamageComponent {
  shieldPercent?: number;
  shieldRoll?: number;
  shieldDeflected: boolean;
  afterShield: number;
  resistancePercent?: number;
  resistanceRoll?: number;
  resisted: boolean;
  afterResistance: number;
  circumstanceModifier: number;
  afterCircumstance: number;
  protection: number;
  protectionLayers: string[];
  protectionIds: string[];
  afterProtection: number;
}

export function computeAttackDamage(input: ComputeAttackDamageInput): CombatDamageResult {
  const rolled = rollAttackDamage(input);
  const mitigated = mitigateDamageComponents({
    components: rolled.components,
    defense: input.defense,
    zone: input.zone,
    randomInteger: input.randomInteger,
    config: input.config
  });

  return {
    finalDamage: mitigated.finalDamage,
    components: mitigated.components,
    log: [...rolled.log, ...mitigated.log]
  };
}

export function rollAttackDamage(input: RollAttackDamageInput): RollAttackDamageResult {
  assertNonNegativeInteger('attackerForce', input.attackerForce);
  assertNonNegativeInteger('netToucheSuccesses', input.netToucheSuccesses);
  assertWeaponDamage(input.weaponDamage);

  const difficulty = damageRollDifficulty(input.netToucheSuccesses);
  const includesForce = input.weaponDamage.components.some((component) => component.includesForce);
  const log: CombatDamageLogEntry[] = [];
  const forceRoll = includesForce
    ? rollDice(input.attackerForce, difficulty, { randomInteger: input.randomInteger })
    : undefined;
  const forceSuccesses = forceRoll?.successes ?? 0;

  if (forceRoll !== undefined) {
    log.push({
      step: 'force_roll',
      pool: input.attackerForce,
      difficulty,
      successes: forceSuccesses,
      roll: forceRoll
    });
  }

  const components = input.weaponDamage.components.map((component, componentIndex) => {
    const flat = component.flat ?? 0;
    const ammoBonus = component.ammoBonus ?? 0;
    const damageModifier = sumDamageModifiers(input.damageModifiers, component.type);
    const componentForceSuccesses = component.includesForce ? forceSuccesses : 0;
    const raw = clampDamage(componentForceSuccesses + flat + ammoBonus + damageModifier);

    log.push({
      step: 'raw_damage',
      componentIndex,
      type: component.type,
      forceSuccesses: componentForceSuccesses,
      flat,
      ammoBonus,
      damageModifier,
      after: raw
    });

    return {
      type: component.type,
      label: component.label,
      includesForce: component.includesForce ?? false,
      forceSuccesses: componentForceSuccesses,
      flat,
      ammoBonus,
      damageModifier,
      raw
    };
  });

  return { components, log };
}

export function mitigateDamageComponents(input: MitigateDamageInput): CombatDamageResult {
  const config = input.config ?? DEFAULT_RULES_CONFIG;
  const defense = input.defense ?? {};
  const zone = normalizeZone(input.zone);
  const log: CombatDamageLogEntry[] = [];
  const beforeEndurance = input.components.map((component, componentIndex) =>
    applyComponentMitigationBeforeEndurance({
      component,
      componentIndex,
      defense,
      zoneId: zone.id,
      randomInteger: input.randomInteger,
      log
    })
  );

  const afterEndurance = applyEndurance({
    components: beforeEndurance,
    defense,
    zone,
    randomInteger: input.randomInteger,
    config,
    log
  });
  const afterZone = afterEndurance.map((component, componentIndex) => {
    const final = clampDamage(component.afterEndurance * zone.damageMultiplier);

    log.push({
      step: 'zone',
      componentIndex,
      type: component.type,
      before: component.afterEndurance,
      multiplier: zone.damageMultiplier,
      after: final
    });

    return {
      ...component,
      zoneMultiplier: zone.damageMultiplier,
      final
    };
  });

  return {
    finalDamage: afterZone.reduce((sum, component) => sum + component.final, 0),
    components: afterZone,
    log
  };
}

export function damageRollDifficulty(netToucheSuccesses: number): number {
  assertNonNegativeInteger('netToucheSuccesses', netToucheSuccesses);

  return Math.max(1, 7 - netToucheSuccesses);
}

function applyComponentMitigationBeforeEndurance(input: {
  component: RolledDamageComponent;
  componentIndex: number;
  defense: DamageDefenseInput;
  zoneId: string;
  randomInteger: RandomInteger;
  log: CombatDamageLogEntry[];
}): MitigatedBeforeEnduranceComponent {
  const shieldResult = applyShield({
    component: input.component,
    componentIndex: input.componentIndex,
    shield: input.defense.shield,
    randomInteger: input.randomInteger,
    log: input.log
  });
  const resistanceResult = applyResistance({
    component: input.component,
    componentIndex: input.componentIndex,
    before: shieldResult.afterShield,
    resistancePercent: input.defense.percentageResistances?.[input.component.type],
    randomInteger: input.randomInteger,
    log: input.log
  });
  const circumstanceModifier = sumDamageModifiers(
    input.defense.circumstanceModifiers,
    input.component.type
  );
  const afterCircumstance = clampDamage(resistanceResult.afterResistance + circumstanceModifier);

  input.log.push({
    step: 'circumstance',
    componentIndex: input.componentIndex,
    type: input.component.type,
    before: resistanceResult.afterResistance,
    modifier: circumstanceModifier,
    after: afterCircumstance
  });

  const protectionResult = applyProtection({
    component: input.component,
    componentIndex: input.componentIndex,
    before: afterCircumstance,
    protections: input.defense.protections,
    zoneId: input.zoneId,
    log: input.log
  });

  return {
    ...input.component,
    ...shieldResult,
    ...resistanceResult,
    circumstanceModifier,
    afterCircumstance,
    ...protectionResult
  };
}

function applyShield(input: {
  component: RolledDamageComponent;
  componentIndex: number;
  shield?: DamageShieldInput;
  randomInteger: RandomInteger;
  log: CombatDamageLogEntry[];
}): {
  shieldPercent?: number;
  shieldRoll?: number;
  shieldDeflected: boolean;
  afterShield: number;
} {
  const percent = input.shield?.percent ?? 0;
  assertPercent('shield.percent', percent);
  const usable = input.shield?.usable ?? true;
  const shouldRoll = input.component.raw > 0 && usable && percent > 0;
  const roll = shouldRoll ? rollD100(input.randomInteger) : undefined;
  const deflected = roll !== undefined && roll <= percent;
  const afterShield = deflected ? 0 : input.component.raw;

  input.log.push({
    step: 'shield',
    componentIndex: input.componentIndex,
    type: input.component.type,
    before: input.component.raw,
    percent,
    roll,
    deflected,
    after: afterShield
  });

  return {
    shieldPercent: percent,
    shieldRoll: roll,
    shieldDeflected: deflected,
    afterShield
  };
}

function applyResistance(input: {
  component: RolledDamageComponent;
  componentIndex: number;
  before: number;
  resistancePercent?: number;
  randomInteger: RandomInteger;
  log: CombatDamageLogEntry[];
}): {
  resistancePercent?: number;
  resistanceRoll?: number;
  resisted: boolean;
  afterResistance: number;
} {
  const percent = input.resistancePercent ?? 0;
  assertPercent(`percentageResistances.${input.component.type}`, percent);
  const shouldRoll = input.before > 0 && percent > 0;
  const roll = shouldRoll ? rollD100(input.randomInteger) : undefined;
  const resisted = roll !== undefined && roll <= percent;
  const afterResistance = resisted ? 0 : input.before;

  input.log.push({
    step: 'resistance',
    componentIndex: input.componentIndex,
    type: input.component.type,
    before: input.before,
    percent,
    roll,
    resisted,
    after: afterResistance
  });

  return {
    resistancePercent: percent,
    resistanceRoll: roll,
    resisted,
    afterResistance
  };
}

function applyProtection(input: {
  component: RolledDamageComponent;
  componentIndex: number;
  before: number;
  protections?: DamageProtectionLayerInput[];
  zoneId: string;
  log: CombatDamageLogEntry[];
}): {
  protection: number;
  protectionLayers: string[];
  protectionIds: string[];
  afterProtection: number;
} {
  const matchingProtections = (input.protections ?? []).filter(
    (protection) => protection.enabled !== false && protection.zones.includes(input.zoneId)
  );
  const protection = matchingProtections.reduce((sum, current) => {
    const value = current.values[input.component.type] ?? 0;
    assertNonNegativeInteger(
      `protections.${current.id ?? current.layer}.${input.component.type}`,
      value
    );

    return sum + value;
  }, 0);
  const afterProtection = clampDamage(input.before - protection);
  const layers = matchingProtections.map((current) => current.layer);
  const protectionIds = matchingProtections.flatMap((current) =>
    current.id === undefined ? [] : [current.id]
  );

  input.log.push({
    step: 'protection',
    componentIndex: input.componentIndex,
    type: input.component.type,
    before: input.before,
    protection,
    layers,
    protectionIds,
    after: afterProtection
  });

  return {
    protection,
    protectionLayers: layers,
    protectionIds,
    afterProtection
  };
}

function applyEndurance(input: {
  components: MitigatedBeforeEnduranceComponent[];
  defense: DamageDefenseInput;
  zone: Required<DamageZoneInput>;
  randomInteger: RandomInteger;
  config: RulesConfig;
  log: CombatDamageLogEntry[];
}): Array<
  MitigatedBeforeEnduranceComponent & { enduranceReduction: number; afterEndurance: number }
> {
  const damageBeforeEndurance = input.components.reduce(
    (sum, component) => sum + component.afterProtection,
    0
  );
  const endurance = input.defense.endurance;
  const enduranceEnabled = endurance?.enabled ?? true;
  const endurancePool = endurance?.pool ?? 0;
  const enduranceDifficulty = endurance?.difficulty ?? input.config.combat.staminaRollDifficulty;

  assertNonNegativeInteger('endurance.pool', endurancePool);
  assertPositiveInteger('endurance.difficulty', enduranceDifficulty);

  const canRoll =
    damageBeforeEndurance > 0 &&
    input.zone.allowsEndurance &&
    enduranceEnabled &&
    endurancePool > 0;
  const roll = canRoll
    ? rollDice(endurancePool, enduranceDifficulty, { randomInteger: input.randomInteger })
    : undefined;
  const totalReduction = Math.min(damageBeforeEndurance, roll?.successes ?? 0);

  if (roll !== undefined) {
    input.log.push({
      step: 'endurance_roll',
      pool: endurancePool,
      difficulty: enduranceDifficulty,
      successes: roll.successes,
      roll,
      before: damageBeforeEndurance,
      reduction: totalReduction,
      after: damageBeforeEndurance - totalReduction
    });
  }

  let remainingReduction = totalReduction;

  return input.components.map((component, componentIndex) => {
    const reduction = Math.min(component.afterProtection, remainingReduction);
    remainingReduction -= reduction;
    const afterEndurance = component.afterProtection - reduction;
    const skippedReason = enduranceSkipReason({
      damageBeforeEndurance: component.afterProtection,
      zoneAllowsEndurance: input.zone.allowsEndurance,
      endurancePool,
      enduranceEnabled
    });

    input.log.push({
      step: 'endurance',
      componentIndex,
      type: component.type,
      before: component.afterProtection,
      reduction,
      after: afterEndurance,
      skipped: skippedReason !== undefined,
      reason: skippedReason
    });

    return {
      ...component,
      enduranceReduction: reduction,
      afterEndurance
    };
  });
}

function enduranceSkipReason(input: {
  damageBeforeEndurance: number;
  zoneAllowsEndurance: boolean;
  endurancePool: number;
  enduranceEnabled: boolean;
}): 'zone_forbids_endurance' | 'no_endurance_pool' | 'no_damage' | undefined {
  if (input.damageBeforeEndurance <= 0) {
    return 'no_damage';
  }

  if (!input.zoneAllowsEndurance) {
    return 'zone_forbids_endurance';
  }

  if (!input.enduranceEnabled || input.endurancePool <= 0) {
    return 'no_endurance_pool';
  }

  return undefined;
}

function normalizeZone(zone: DamageZoneInput | undefined): Required<DamageZoneInput> {
  const normalized = {
    id: zone?.id ?? 'unspecified',
    damageMultiplier: zone?.damageMultiplier ?? 1,
    allowsEndurance: zone?.allowsEndurance ?? true
  };

  assertPositiveNumber('zone.damageMultiplier', normalized.damageMultiplier);

  return normalized;
}

function sumDamageModifiers(modifiers: DamageModifier[] | undefined, type: DamageType): number {
  return (modifiers ?? [])
    .filter((modifier) => modifier.type === type)
    .reduce((sum, modifier) => {
      assertInteger(`damageModifiers.${modifier.source ?? modifier.type}`, modifier.value);

      return sum + modifier.value;
    }, 0);
}

function assertWeaponDamage(weaponDamage: WeaponDamageSpec): void {
  if (weaponDamage.components.length === 0) {
    throw new Error('weaponDamage.components must contain at least one component');
  }

  for (const [index, component] of weaponDamage.components.entries()) {
    assertDamageType(`weaponDamage.components.${index}.type`, component.type);
    assertInteger(`weaponDamage.components.${index}.flat`, component.flat ?? 0);
    assertInteger(`weaponDamage.components.${index}.ammoBonus`, component.ammoBonus ?? 0);
  }
}

function assertDamageType(name: string, value: string): void {
  if (!['P', 'E', 'C', 'T'].includes(value)) {
    throw new Error(`${name} must be one of P, E, C, T`);
  }
}

function assertPercent(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error(`${name} must be an integer between 0 and 100`);
  }
}

function assertPositiveNumber(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number`);
  }
}

function assertPositiveInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
}

function assertInteger(name: string, value: number): void {
  if (!Number.isInteger(value)) {
    throw new Error(`${name} must be an integer`);
  }
}

function assertNonNegativeInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
}

function clampDamage(value: number): number {
  return Math.max(0, value);
}

function rollD100(randomInteger: RandomInteger): number {
  const value = randomInteger(100);

  if (!Number.isInteger(value) || value < 1 || value > 100) {
    throw new Error(`randomInteger(100) must return an integer between 1 and 100`);
  }

  return value;
}
