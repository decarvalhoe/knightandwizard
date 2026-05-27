import {
  evaluateValue,
  matchesCondition,
  parseEffectModel,
  type EffectActivation,
  type EffectConditionContext,
  type EffectDuration,
  type EffectModel,
  type EffectOperation,
  type EffectSpec,
  type EffectTarget,
  type EffectValueContext
} from './effect-model.js';
import { type PredilectionSlots } from './predilection.js';
import {
  expandActiveStatuses,
  type ActiveStatusEntry,
  type CompositeStatusRegistry
} from './status-effects.js';

export const GLOBAL_EFFECT_SCOPE = '__global__';

export type NumericEffectTarget = Exclude<EffectTarget, 'status'>;
export type NumericEffectOperation = Extract<EffectOperation, 'add' | 'sub' | 'set' | 'multiply'>;

const COMPUTED_NUMERIC_EFFECT_TARGETS = [
  'aptitude',
  'factor',
  'difficulty',
  'pool',
  'energy',
  'vitality',
  'damage'
] as const satisfies readonly NumericEffectTarget[];

export type EffectApplicationContext = EffectConditionContext &
  EffectValueContext & {
    activations?: readonly EffectActivation[];
    engagedTool?: string;
    elapsedDT?: number;
    includeEphemeral?: boolean;
    predilection?: PredilectionSlots;
    activeStatuses?: readonly ActiveStatusEntry[];
    statusRegistry?: CompositeStatusRegistry;
  };

export interface EffectModifierApplication {
  sourceRef: string;
  target: NumericEffectTarget;
  scope?: string;
  op: NumericEffectOperation;
  value: number;
}

export interface EffectModifierBucket {
  target: NumericEffectTarget;
  scope?: string;
  add: number;
  sub: number;
  set?: number;
  multiply: number;
  additive: number;
  applications: EffectModifierApplication[];
}

export interface EffectStatusApplication {
  sourceRef: string;
  op: EffectOperation;
}

export interface EffectStatusBucket {
  target: 'status';
  scope?: string;
  applications: EffectStatusApplication[];
}

export interface EffectiveModifiers {
  aptitude: Record<string, EffectModifierBucket>;
  factor: Record<string, EffectModifierBucket>;
  difficulty: Record<string, EffectModifierBucket>;
  pool: Record<string, EffectModifierBucket>;
  energy: Record<string, EffectModifierBucket>;
  vitality: Record<string, EffectModifierBucket>;
  damage: Record<string, EffectModifierBucket>;
  status: Record<string, EffectStatusBucket>;
}

export interface EffectiveValueOptions {
  minimum?: number;
}

export function computeEffectiveModifiers(
  activeEffects: EffectModel[],
  ctx: EffectApplicationContext
): EffectiveModifiers {
  const modifiers = createEmptyModifiers();
  const statusEffects = expandActiveStatuses(ctx.activeStatuses, ctx.statusRegistry, ctx);
  const effects = statusEffects.length === 0 ? activeEffects : [...activeEffects, ...statusEffects];

  for (const activeEffect of effects) {
    const effect = parseEffectModel(activeEffect);

    if (!isEffectActive(effect.spec, ctx)) {
      continue;
    }

    if (effect.spec.target === 'status') {
      recordStatusEffect(modifiers, effect);
      continue;
    }

    if (!isNumericOperation(effect.spec.op)) {
      throw new Error(`Effect operation "${effect.spec.op}" is only supported for status targets`);
    }

    if (!isComputedNumericEffectTarget(effect.spec.target)) {
      throw new Error(
        `Effect target "${effect.spec.target}" is not supported by computeEffectiveModifiers`
      );
    }

    const value = evaluateValue(effect.spec.value, ctx);
    const bucket = getOrCreateModifierBucket(modifiers, effect.spec.target, effect.spec.scope);

    applyNumericOperation(bucket, {
      sourceRef: effect.source.ref,
      target: effect.spec.target,
      scope: effect.spec.scope,
      op: effect.spec.op,
      value
    });
  }

  return modifiers;
}

export function effectiveAttribute(
  base: number,
  scope: string,
  effects: EffectModel[],
  ctx: EffectApplicationContext
): number {
  return effectiveValue(base, 'aptitude', scope, effects, ctx, { minimum: 0 });
}

export function effectiveValue(
  base: number,
  target: NumericEffectTarget,
  scope: string | undefined,
  effects: EffectModel[],
  ctx: EffectApplicationContext,
  options: EffectiveValueOptions = {}
): number {
  const modifiers = computeEffectiveModifiers(effects, ctx);

  return applyEffectiveModifiers(base, target, scope, modifiers, options);
}

export function applyEffectiveModifiers(
  base: number,
  target: NumericEffectTarget,
  scope: string | undefined,
  modifiers: EffectiveModifiers,
  options: EffectiveValueOptions = {}
): number {
  let value = base;

  for (const bucket of collectBuckets(modifiers, target, scope)) {
    value = applyBucket(value, bucket);
  }

  return options.minimum === undefined ? value : Math.max(options.minimum, value);
}

function createEmptyModifiers(): EffectiveModifiers {
  return {
    aptitude: {},
    factor: {},
    difficulty: {},
    pool: {},
    energy: {},
    vitality: {},
    damage: {},
    status: {}
  };
}

function isEffectActive(spec: EffectSpec, ctx: EffectApplicationContext): boolean {
  return (
    matchesCondition(spec.condition, ctx) &&
    isActivationActive(spec.activation, ctx) &&
    isDurationActive(spec.duration, ctx)
  );
}

function isActivationActive(activation: EffectActivation, ctx: EffectApplicationContext): boolean {
  if (activation === 'passive') {
    return true;
  }

  return ctx.activations?.includes(activation) ?? false;
}

function isDurationActive(duration: EffectDuration, ctx: EffectApplicationContext): boolean {
  if (duration === 'permanent' || duration === 'until_dispel') {
    return true;
  }

  if (duration === 'ephemeral') {
    return ctx.includeEphemeral !== false;
  }

  const dt = typeof duration.dt === 'number' ? duration.dt : evaluateValue(duration.dt, ctx);

  return ctx.elapsedDT === undefined || ctx.elapsedDT < dt;
}

function isNumericOperation(op: EffectOperation): op is NumericEffectOperation {
  return op === 'add' || op === 'sub' || op === 'set' || op === 'multiply';
}

function isComputedNumericEffectTarget(target: EffectTarget): target is NumericEffectTarget {
  return (COMPUTED_NUMERIC_EFFECT_TARGETS as readonly string[]).includes(target);
}

function getOrCreateModifierBucket(
  modifiers: EffectiveModifiers,
  target: NumericEffectTarget,
  scope: string | undefined
): EffectModifierBucket {
  const buckets = modifiers[target];
  const key = effectScopeKey(scope);
  const existing = buckets[key];

  if (existing !== undefined) {
    return existing;
  }

  const bucket = createModifierBucket(target, scope);
  buckets[key] = bucket;

  return bucket;
}

function createModifierBucket(
  target: NumericEffectTarget,
  scope: string | undefined
): EffectModifierBucket {
  return {
    target,
    ...(scope === undefined ? {} : { scope }),
    add: 0,
    sub: 0,
    multiply: 1,
    additive: 0,
    applications: []
  };
}

function applyNumericOperation(
  bucket: EffectModifierBucket,
  application: EffectModifierApplication
): void {
  switch (application.op) {
    case 'add':
      bucket.add += application.value;
      break;
    case 'sub':
      bucket.sub += application.value;
      break;
    case 'set':
      bucket.set = application.value;
      break;
    case 'multiply':
      bucket.multiply *= application.value;
      break;
  }

  bucket.additive = bucket.add - bucket.sub;
  bucket.applications.push(application);
}

function recordStatusEffect(modifiers: EffectiveModifiers, effect: EffectModel): void {
  const key = effectScopeKey(effect.spec.scope);
  const existing = modifiers.status[key];
  const bucket =
    existing ??
    ({
      target: 'status',
      ...(effect.spec.scope === undefined ? {} : { scope: effect.spec.scope }),
      applications: []
    } satisfies EffectStatusBucket);

  bucket.applications.push({
    sourceRef: effect.source.ref,
    op: effect.spec.op
  });
  modifiers.status[key] = bucket;
}

function collectBuckets(
  modifiers: EffectiveModifiers,
  target: NumericEffectTarget,
  scope: string | undefined
): EffectModifierBucket[] {
  const buckets = modifiers[target];
  const keys =
    scope === undefined || scope === GLOBAL_EFFECT_SCOPE
      ? [GLOBAL_EFFECT_SCOPE]
      : [GLOBAL_EFFECT_SCOPE, scope];

  return keys.flatMap((key) => {
    const bucket = buckets[key];
    return bucket === undefined ? [] : [bucket];
  });
}

function applyBucket(base: number, bucket: EffectModifierBucket): number {
  const anchored = bucket.set ?? base;

  return (anchored + bucket.additive) * bucket.multiply;
}

function effectScopeKey(scope: string | undefined): string {
  return scope ?? GLOBAL_EFFECT_SCOPE;
}
