export const PREDILECTION_KINDS = ['arme', 'instrument', 'monture', 'animaux', 'domaine'] as const;

export type PredilectionKind = (typeof PREDILECTION_KINDS)[number];

export type PredilectionSlots = {
  arme?: string[];
  instrument?: string[];
  monture?: string[];
  animaux?: string[];
  domaine?: string[];
};

export const ARME_PREDILECTION_SLOT = 'arme_predilection';
export const INSTRUMENT_PREDILECTION_SLOT = 'instrument_predilection';
export const MONTURE_PREDILECTION_SLOT = 'monture_predilection';
export const ANIMAUX_PREDILECTION_SLOT = 'animaux_predilection';
export const DOMAINE_PREDILECTION_SLOT = 'domaine_predilection';

export const PREDILECTION_SLOT_NAMES = [
  ARME_PREDILECTION_SLOT,
  INSTRUMENT_PREDILECTION_SLOT,
  MONTURE_PREDILECTION_SLOT,
  ANIMAUX_PREDILECTION_SLOT,
  DOMAINE_PREDILECTION_SLOT
] as const;

export type PredilectionSlotName = (typeof PREDILECTION_SLOT_NAMES)[number];

export const PREDILECTION_SLOT_BY_KIND = {
  arme: ARME_PREDILECTION_SLOT,
  instrument: INSTRUMENT_PREDILECTION_SLOT,
  monture: MONTURE_PREDILECTION_SLOT,
  animaux: ANIMAUX_PREDILECTION_SLOT,
  domaine: DOMAINE_PREDILECTION_SLOT
} as const satisfies Record<PredilectionKind, PredilectionSlotName>;

export const PREDILECTION_KIND_BY_SLOT = {
  [ARME_PREDILECTION_SLOT]: 'arme',
  [INSTRUMENT_PREDILECTION_SLOT]: 'instrument',
  [MONTURE_PREDILECTION_SLOT]: 'monture',
  [ANIMAUX_PREDILECTION_SLOT]: 'animaux',
  [DOMAINE_PREDILECTION_SLOT]: 'domaine'
} as const satisfies Record<PredilectionSlotName, PredilectionKind>;

export const PREDILECTION_CHANGE_TRIGGERS = ['level_up', 'gm_validation'] as const;

export type PredilectionChangeTrigger = (typeof PREDILECTION_CHANGE_TRIGGERS)[number];

export type PredilectionTransitionAction = 'change' | 'extend';

export interface PredilectionTransition {
  action: PredilectionTransitionAction;
  kind: PredilectionKind;
  previous: string[];
  next: string[];
  value: string;
  trigger?: PredilectionChangeTrigger;
}

export interface PredilectionUpdate {
  slots: PredilectionSlots;
  transition: PredilectionTransition;
}

export interface ExtendPredilectionOptions {
  allowed: boolean;
}

export function initPredilectionSlot(kind: PredilectionKind, value: string): PredilectionSlots {
  assertPredilectionKind(kind);
  assertPredilectionValue(value);

  return { [kind]: [value] };
}

export function changePredilection(
  slots: PredilectionSlots,
  kind: PredilectionKind,
  newValue: string,
  trigger: PredilectionChangeTrigger
): PredilectionUpdate {
  assertPredilectionKind(kind);
  assertPredilectionValue(newValue);
  assertPredilectionChangeTrigger(trigger);

  const previous = copySlotValues(slots[kind]);
  const next = [newValue];

  return {
    slots: {
      ...copyPredilectionSlots(slots),
      [kind]: next
    },
    transition: {
      action: 'change',
      kind,
      previous,
      next,
      value: newValue,
      trigger
    }
  };
}

export function extendPredilection(
  slots: PredilectionSlots,
  kind: PredilectionKind,
  value: string,
  options: ExtendPredilectionOptions
): PredilectionUpdate {
  assertPredilectionKind(kind);
  assertPredilectionValue(value);

  if (options.allowed !== true) {
    throw new Error('Predilection extension must be allowed');
  }

  const previous = copySlotValues(slots[kind]);
  const next = previous.includes(value) ? previous : [...previous, value];

  return {
    slots: {
      ...copyPredilectionSlots(slots),
      [kind]: next
    },
    transition: {
      action: 'extend',
      kind,
      previous,
      next,
      value
    }
  };
}

export function copyPredilectionSlots(slots: PredilectionSlots): PredilectionSlots;
export function copyPredilectionSlots(slots: undefined): undefined;
export function copyPredilectionSlots(
  slots: PredilectionSlots | undefined
): PredilectionSlots | undefined {
  if (slots === undefined) {
    return undefined;
  }

  const copy: PredilectionSlots = {};

  for (const kind of PREDILECTION_KINDS) {
    const values = slots[kind];
    if (values !== undefined) {
      copy[kind] = copySlotValues(values);
    }
  }

  return copy;
}

export function predilectionKindForSlotName(value: string): PredilectionKind | undefined {
  return isPredilectionSlotName(value) ? PREDILECTION_KIND_BY_SLOT[value] : undefined;
}

export function isPredilectionSlotName(value: string): value is PredilectionSlotName {
  return (PREDILECTION_SLOT_NAMES as readonly string[]).includes(value);
}

function assertPredilectionKind(kind: PredilectionKind): void {
  if (!(PREDILECTION_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`Unknown predilection kind "${String(kind)}"`);
  }
}

function assertPredilectionValue(value: string): void {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('Predilection value must be a non-empty string');
  }
}

function assertPredilectionChangeTrigger(
  trigger: PredilectionChangeTrigger
): asserts trigger is PredilectionChangeTrigger {
  if (!(PREDILECTION_CHANGE_TRIGGERS as readonly string[]).includes(trigger)) {
    throw new Error('Predilection change trigger must be level_up or gm_validation');
  }
}

function copySlotValues(values: readonly string[] | undefined): string[] {
  if (values === undefined) {
    return [];
  }

  const copy: string[] = [];

  for (const value of values) {
    assertPredilectionValue(value);
    if (!copy.includes(value)) {
      copy.push(value);
    }
  }

  return copy;
}
