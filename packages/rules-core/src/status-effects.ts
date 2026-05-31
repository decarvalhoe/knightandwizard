import {
  evaluateValue,
  parseEffectModel,
  type EffectDuration,
  type EffectModel,
  type EffectOperation,
  type EffectSpec,
  type EffectValueContext
} from './effect-model.js';

export const ACTIVATION_SOURCES = ['player_toggle', 'mj_validated', 'mj_imposed'] as const;

export type ActivationSource = (typeof ACTIVATION_SOURCES)[number];

export interface CompositeStatusDefinition {
  effects: readonly EffectSpec[];
  activationSources: readonly ActivationSource[];
  duration?: EffectDuration;
}

export type CompositeStatusRegistry = Readonly<Record<string, CompositeStatusDefinition>>;

interface ActiveStatusBase {
  duration?: EffectDuration;
  elapsedDT?: number;
}

export type ActiveStatusEntry =
  | string
  | (ActiveStatusBase & { id: string; statusId?: never })
  | (ActiveStatusBase & { id?: never; statusId: string });

export type StatusExpansionContext = EffectValueContext & {
  elapsedDT?: number;
};

export interface StatusGrantApplicationView {
  op: EffectOperation;
  sourceRef: string;
}

export interface StatusGrantBucketView {
  applications: readonly StatusGrantApplicationView[];
  scope?: string;
}

export interface StatusGrantModifiersView {
  status: Readonly<Record<string, StatusGrantBucketView>>;
}

export interface ActivatedStatusGrant {
  activationSource: ActivationSource;
  entry: ActiveStatusEntry;
  id: string;
  sourceRef: string;
}

export const COMPOSITE_STATUS_REGISTRY = defineCompositeStatusRegistry({
  fou_furieux: {
    activationSources: ['player_toggle', 'mj_validated', 'mj_imposed'],
    duration: { dt: '25*level', locked: true },
    effects: [
      {
        target: 'pool',
        op: 'add',
        value: 'level',
        condition: { aptitude: ['force', 'endurance'] },
        activation: 'passive',
        duration: 'permanent'
      },
      {
        target: 'aptitude',
        scope: 'empathie',
        op: 'set',
        value: 1,
        activation: 'passive',
        duration: 'permanent'
      },
      {
        target: 'aptitude',
        scope: 'intelligence',
        op: 'set',
        value: 1,
        activation: 'passive',
        duration: 'permanent'
      },
      {
        target: 'aptitude',
        scope: 'perception',
        op: 'set',
        value: 1,
        activation: 'passive',
        duration: 'permanent'
      }
    ]
  }
} satisfies CompositeStatusRegistry);

export function defineCompositeStatusRegistry<T extends CompositeStatusRegistry>(registry: T): T {
  for (const [statusId, definition] of Object.entries(registry)) {
    validateCompositeStatusDefinition(statusId, definition);
  }

  return registry;
}

export function expandActiveStatuses(
  activeStatuses: readonly ActiveStatusEntry[] | undefined,
  registry: CompositeStatusRegistry = COMPOSITE_STATUS_REGISTRY,
  ctx: StatusExpansionContext = {}
): EffectModel[] {
  if (activeStatuses === undefined || activeStatuses.length === 0) {
    return [];
  }

  const expanded: EffectModel[] = [];

  for (const activeStatus of activeStatuses) {
    const statusId = statusIdFor(activeStatus);
    const definition = registry[statusId];

    if (definition === undefined) {
      continue;
    }

    const statusEntry = statusEntryForExpansion(statusId, activeStatus, definition);
    const elapsedDT = elapsedDTFor(activeStatus, ctx);

    if (!isStatusActive(statusEntry, elapsedDT, ctx)) {
      continue;
    }

    for (const [index, spec] of definition.effects.entries()) {
      expanded.push(effectModelForStatus(statusId, index, spec));
    }
  }

  return expanded;
}

export function collectActivatedStatusGrants(
  modifiers: StatusGrantModifiersView,
  source: ActivationSource,
  registry: CompositeStatusRegistry = COMPOSITE_STATUS_REGISTRY
): ActivatedStatusGrant[] {
  const grants: ActivatedStatusGrant[] = [];
  const seen = new Set<string>();

  for (const bucket of Object.values(modifiers.status)) {
    const statusId = bucket.scope;

    if (statusId === undefined || !canActivate(source, statusId, registry)) {
      continue;
    }

    for (const application of bucket.applications) {
      if (application.op !== 'grant' || seen.has(statusId)) {
        continue;
      }

      grants.push({
        activationSource: source,
        entry: { id: statusId },
        id: statusId,
        sourceRef: application.sourceRef
      });
      seen.add(statusId);
    }
  }

  return grants;
}

export function activateGrantedStatuses(
  modifiers: StatusGrantModifiersView,
  source: ActivationSource,
  registry: CompositeStatusRegistry = COMPOSITE_STATUS_REGISTRY
): ActiveStatusEntry[] {
  return collectActivatedStatusGrants(modifiers, source, registry).map((grant) => grant.entry);
}

export function canActivate(
  source: ActivationSource,
  statusId: string,
  registry: CompositeStatusRegistry = COMPOSITE_STATUS_REGISTRY
): boolean {
  return registry[statusId]?.activationSources.includes(source) ?? false;
}

export function isStatusActive(
  statusEntry: ActiveStatusEntry,
  elapsedDT?: number,
  ctx: EffectValueContext = {}
): boolean {
  if (typeof statusEntry === 'string') {
    return true;
  }

  const duration = statusEntry.duration;

  if (duration === undefined || duration === 'permanent' || duration === 'until_dispel') {
    return true;
  }

  if (duration === 'ephemeral') {
    return true;
  }

  // Durée narrative (R-8.20) : hors de l'horloge DT du combat ; l'effet reste actif au regard de
  // l'elapsedDT (son expiration relève du runtime double-horloge, E3).
  if ('amount' in duration) {
    return true;
  }

  if (elapsedDT === undefined) {
    return true;
  }

  if (!Number.isFinite(elapsedDT) || elapsedDT < 0) {
    throw new Error('Status elapsedDT must be a non-negative finite number');
  }

  const dt = typeof duration.dt === 'number' ? duration.dt : evaluateValue(duration.dt, ctx);

  return elapsedDT < dt;
}

function validateCompositeStatusDefinition(
  statusId: string,
  definition: CompositeStatusDefinition
): void {
  if (definition.activationSources.length === 0) {
    throw new Error(`Composite status "${statusId}" must declare at least one activation source`);
  }

  for (const source of definition.activationSources) {
    if (!isActivationSource(source)) {
      throw new Error(`Composite status "${statusId}" has unknown activation source "${source}"`);
    }
  }

  if (definition.duration !== undefined) {
    validateStatusDuration(statusId, definition.duration);
  }

  if (definition.effects.length === 0) {
    throw new Error(`Composite status "${statusId}" must declare at least one bundled effect`);
  }

  for (const [index, spec] of definition.effects.entries()) {
    effectModelForStatus(statusId, index, spec);
  }
}

function validateStatusDuration(statusId: string, duration: EffectDuration): void {
  parseEffectModel({
    source: {
      prose: `Composite status ${statusId} duration.`,
      ref: `status:${statusId}#duration`
    },
    spec: {
      target: 'status',
      scope: statusId,
      op: 'grant',
      value: 1,
      activation: 'passive',
      duration
    },
    fidelity: 'covered'
  });
}

function effectModelForStatus(statusId: string, index: number, spec: EffectSpec): EffectModel {
  return parseEffectModel({
    source: {
      prose: `Composite status ${statusId} bundled effect ${index + 1}.`,
      ref: `status:${statusId}#effect:${index + 1}`
    },
    spec: cloneEffectSpec(spec),
    fidelity: 'covered'
  });
}

function statusEntryForExpansion(
  statusId: string,
  activeStatus: ActiveStatusEntry,
  definition: CompositeStatusDefinition
): ActiveStatusEntry {
  const activeDuration = typeof activeStatus === 'string' ? undefined : activeStatus.duration;
  const definitionDuration = definition.duration;
  const duration = isLockedDuration(definitionDuration)
    ? definitionDuration
    : (activeDuration ?? definitionDuration);

  return duration === undefined ? { id: statusId } : { id: statusId, duration };
}

function elapsedDTFor(
  activeStatus: ActiveStatusEntry,
  ctx: StatusExpansionContext
): number | undefined {
  return typeof activeStatus === 'string'
    ? ctx.elapsedDT
    : (activeStatus.elapsedDT ?? ctx.elapsedDT);
}

function statusIdFor(activeStatus: ActiveStatusEntry): string {
  const statusId =
    typeof activeStatus === 'string' ? activeStatus : (activeStatus.id ?? activeStatus.statusId);

  if (statusId.length === 0) {
    throw new Error('Active status id must not be empty');
  }

  return statusId;
}

function isLockedDuration(duration: EffectDuration | undefined): boolean {
  return typeof duration === 'object' && 'locked' in duration && duration.locked === true;
}

function isActivationSource(source: string): source is ActivationSource {
  return (ACTIVATION_SOURCES as readonly string[]).includes(source);
}

function cloneEffectSpec(spec: EffectSpec): EffectSpec {
  return JSON.parse(JSON.stringify(spec)) as EffectSpec;
}
