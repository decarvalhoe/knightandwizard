export const TACTICAL_STATUS_CATEGORIES = [
  'physical',
  'mental',
  'magical',
  'sensory',
  'environmental'
] as const;

export type TacticalStatusCategory = (typeof TACTICAL_STATUS_CATEGORIES)[number];

export const TACTICAL_STATUS_MODIFIER_TARGETS = [
  'difficulty',
  'dice_count',
  'speed_factor',
  'damage_in',
  'damage_out'
] as const;

export type TacticalStatusModifierTarget = (typeof TACTICAL_STATUS_MODIFIER_TARGETS)[number];

export interface TacticalStatusModifier {
  target: TacticalStatusModifierTarget;
  scope: string;
  value: number;
}

export interface TacticalStatusInteractions {
  blocks?: readonly string[];
  forces?: readonly string[];
}

export interface TacticalStatusDefinition {
  id: string;
  name: string;
  category: TacticalStatusCategory;
  durationDT: number | null;
  stackable: boolean;
  modifiers: readonly TacticalStatusModifier[];
  immunities: readonly string[];
  removedBy: readonly string[];
  interactions: TacticalStatusInteractions;
}

export type TacticalStatusRegistry = Readonly<Record<string, TacticalStatusDefinition>>;

export const TACTICAL_STATUS_REGISTRY = defineTacticalStatusRegistry({
  prone: {
    id: 'prone',
    name: 'A terre',
    category: 'physical',
    durationDT: null,
    stackable: false,
    modifiers: [
      { target: 'difficulty', scope: 'self_melee_attack', value: 1 },
      { target: 'difficulty', scope: 'incoming_melee_attack', value: -1 }
    ],
    immunities: [],
    removedBy: ['stand_up', 'help_up', 'levitation'],
    interactions: { blocks: ['sprint'] }
  },
  grappled: {
    id: 'grappled',
    name: 'Agrippe',
    category: 'physical',
    durationDT: null,
    stackable: false,
    modifiers: [{ target: 'difficulty', scope: 'most_actions', value: 1 }],
    immunities: [],
    removedBy: ['escape_grapple', 'grappler_releases'],
    interactions: { blocks: ['move'], forces: ['escape_grapple'] }
  },
  restrained: {
    id: 'restrained',
    name: 'Entrave',
    category: 'physical',
    durationDT: null,
    stackable: false,
    modifiers: [{ target: 'difficulty', scope: 'most_actions', value: 2 }],
    immunities: [],
    removedBy: ['escape_restraint', 'ally_frees', 'magic_frees'],
    interactions: { blocks: ['move', 'sprint'] }
  },
  unconscious: {
    id: 'unconscious',
    name: 'Inconscient',
    category: 'physical',
    durationDT: null,
    stackable: false,
    modifiers: [{ target: 'difficulty', scope: 'incoming_attack', value: -99 }],
    immunities: [],
    removedBy: ['healing', 'wake_up', 'gm_ruling'],
    interactions: { blocks: ['all_actions'] }
  },
  dying: {
    id: 'dying',
    name: 'Mourant',
    category: 'physical',
    durationDT: null,
    stackable: false,
    modifiers: [],
    immunities: [],
    removedBy: ['healing', 'stabilize', 'dead'],
    interactions: { blocks: ['all_actions'] }
  },
  dead: {
    id: 'dead',
    name: 'Mort',
    category: 'physical',
    durationDT: null,
    stackable: false,
    modifiers: [],
    immunities: ['bleeding', 'poisoned', 'burning', 'frozen', 'electrified', 'drowning'],
    removedBy: ['resurrection', 'gm_ruling'],
    interactions: { blocks: ['all_actions'] }
  },
  disarmed: {
    id: 'disarmed',
    name: 'Desarme',
    category: 'physical',
    durationDT: null,
    stackable: false,
    modifiers: [{ target: 'difficulty', scope: 'weapon_attack', value: 2 }],
    immunities: [],
    removedBy: ['draw_weapon', 'recover_weapon'],
    interactions: { blocks: ['weapon_attack_without_weapon'] }
  },
  disabled_limb: {
    id: 'disabled_limb',
    name: 'Membre inutilisable',
    category: 'physical',
    durationDT: null,
    stackable: true,
    modifiers: [{ target: 'difficulty', scope: 'actions_using_limb', value: 2 }],
    immunities: [],
    removedBy: ['healing', 'rest', 'prosthesis', 'gm_ruling'],
    interactions: {}
  },
  encumbered: {
    id: 'encumbered',
    name: 'Encombre',
    category: 'physical',
    durationDT: null,
    stackable: false,
    modifiers: [
      { target: 'speed_factor', scope: 'all', value: 1 },
      { target: 'difficulty', scope: 'movement', value: 1 }
    ],
    immunities: [],
    removedBy: ['drop_load', 'increase_strength', 'gm_ruling'],
    interactions: {}
  },
  stunned: {
    id: 'stunned',
    name: 'Etourdi',
    category: 'physical',
    durationDT: null,
    stackable: false,
    modifiers: [{ target: 'difficulty', scope: 'defense', value: 1 }],
    immunities: [],
    removedBy: ['duration_elapsed', 'healing', 'gm_ruling'],
    interactions: { blocks: ['reaction'] }
  },
  winded: {
    id: 'winded',
    name: 'Essouffle',
    category: 'physical',
    durationDT: null,
    stackable: false,
    modifiers: [{ target: 'dice_count', scope: 'physical_actions', value: -1 }],
    immunities: [],
    removedBy: ['catch_breath', 'rest', 'healing'],
    interactions: {}
  },
  weakened: {
    id: 'weakened',
    name: 'Affaibli',
    category: 'physical',
    durationDT: null,
    stackable: false,
    modifiers: [{ target: 'dice_count', scope: 'physical_actions', value: -1 }],
    immunities: [],
    removedBy: ['healing', 'rest', 'gm_ruling'],
    interactions: {}
  },
  frightened: {
    id: 'frightened',
    name: 'Effraye',
    category: 'mental',
    durationDT: null,
    stackable: false,
    modifiers: [{ target: 'difficulty', scope: 'toward_fear_source', value: 1 }],
    immunities: ['charmed'],
    removedBy: ['morale_check', 'ally_reassures', 'magic_calm'],
    interactions: { forces: ['keep_distance'] }
  },
  enraged: {
    id: 'enraged',
    name: 'Enrage',
    category: 'mental',
    durationDT: null,
    stackable: false,
    modifiers: [
      { target: 'damage_out', scope: 'melee', value: 1 },
      { target: 'difficulty', scope: 'defense', value: 1 }
    ],
    immunities: ['frightened'],
    removedBy: ['calm_down', 'magic_calm', 'gm_ruling'],
    interactions: { forces: ['attack_nearest_threat'] }
  },
  charmed: {
    id: 'charmed',
    name: 'Charme',
    category: 'mental',
    durationDT: null,
    stackable: false,
    modifiers: [{ target: 'difficulty', scope: 'harm_charmer', value: 2 }],
    immunities: [],
    removedBy: ['damage_from_charmer', 'dispel', 'duration_elapsed'],
    interactions: { blocks: ['hostile_action_against_charmer'] }
  },
  confused: {
    id: 'confused',
    name: 'Confus',
    category: 'mental',
    durationDT: null,
    stackable: false,
    modifiers: [{ target: 'difficulty', scope: 'declared_actions', value: 1 }],
    immunities: [],
    removedBy: ['clear_mind', 'dispel', 'duration_elapsed'],
    interactions: {}
  },
  dominated: {
    id: 'dominated',
    name: 'Domine',
    category: 'mental',
    durationDT: null,
    stackable: false,
    modifiers: [],
    immunities: ['charmed'],
    removedBy: ['dispel', 'dominator_loses_control', 'duration_elapsed'],
    interactions: { forces: ['obey_controller'] }
  },
  surprised: {
    id: 'surprised',
    name: 'Surpris',
    category: 'mental',
    durationDT: null,
    stackable: false,
    modifiers: [
      { target: 'difficulty', scope: 'defense', value: 1 },
      { target: 'speed_factor', scope: 'next_action', value: 1 }
    ],
    immunities: [],
    removedBy: ['first_action_resolved', 'gm_ruling'],
    interactions: {}
  },
  blinded: {
    id: 'blinded',
    name: 'Aveugle',
    category: 'sensory',
    durationDT: null,
    stackable: false,
    modifiers: [{ target: 'difficulty', scope: 'targeted_attack', value: 2 }],
    immunities: [],
    removedBy: ['restore_sight', 'dispel', 'duration_elapsed'],
    interactions: { blocks: ['sight_required_action'] }
  },
  deafened: {
    id: 'deafened',
    name: 'Sourd',
    category: 'sensory',
    durationDT: null,
    stackable: false,
    modifiers: [{ target: 'difficulty', scope: 'hearing_based_action', value: 2 }],
    immunities: [],
    removedBy: ['restore_hearing', 'dispel', 'duration_elapsed'],
    interactions: { blocks: ['hearing_required_action'] }
  },
  silenced: {
    id: 'silenced',
    name: 'Reduit au silence',
    category: 'sensory',
    durationDT: null,
    stackable: false,
    modifiers: [],
    immunities: [],
    removedBy: ['restore_voice', 'dispel', 'duration_elapsed'],
    interactions: { blocks: ['verbal_action'] }
  },
  petrified: {
    id: 'petrified',
    name: 'Petrifie',
    category: 'sensory',
    durationDT: null,
    stackable: false,
    modifiers: [],
    immunities: ['poisoned', 'bleeding', 'burning', 'drowning'],
    removedBy: ['stone_to_flesh', 'dispel', 'gm_ruling'],
    interactions: { blocks: ['all_actions'] }
  },
  poisoned: {
    id: 'poisoned',
    name: 'Empoisonne',
    category: 'environmental',
    durationDT: null,
    stackable: true,
    modifiers: [{ target: 'dice_count', scope: 'physical_actions', value: -1 }],
    immunities: [],
    removedBy: ['antidote', 'healing', 'duration_elapsed'],
    interactions: {}
  },
  burning: {
    id: 'burning',
    name: 'En feu',
    category: 'environmental',
    durationDT: null,
    stackable: true,
    modifiers: [{ target: 'damage_in', scope: 'fire_tick', value: 1 }],
    immunities: ['frozen'],
    removedBy: ['extinguish', 'water', 'lack_of_fuel'],
    interactions: { forces: ['extinguish_self'] }
  },
  frozen: {
    id: 'frozen',
    name: 'Gele',
    category: 'environmental',
    durationDT: null,
    stackable: false,
    modifiers: [
      { target: 'speed_factor', scope: 'all', value: 2 },
      { target: 'difficulty', scope: 'movement', value: 2 }
    ],
    immunities: ['burning'],
    removedBy: ['heat', 'break_ice', 'duration_elapsed'],
    interactions: { blocks: ['sprint'] }
  },
  electrified: {
    id: 'electrified',
    name: 'Electrocute',
    category: 'environmental',
    durationDT: null,
    stackable: true,
    modifiers: [{ target: 'difficulty', scope: 'physical_actions', value: 1 }],
    immunities: [],
    removedBy: ['grounding', 'duration_elapsed', 'healing'],
    interactions: { blocks: ['reaction'] }
  },
  bleeding: {
    id: 'bleeding',
    name: 'Saignant',
    category: 'environmental',
    durationDT: null,
    stackable: true,
    modifiers: [{ target: 'damage_in', scope: 'bleed_tick', value: 1 }],
    immunities: [],
    removedBy: ['bandage', 'healing', 'stabilize'],
    interactions: {}
  },
  drowning: {
    id: 'drowning',
    name: 'En noyade',
    category: 'environmental',
    durationDT: null,
    stackable: false,
    modifiers: [{ target: 'difficulty', scope: 'physical_actions', value: 1 }],
    immunities: [],
    removedBy: ['breath_air', 'water_breathing', 'rescue'],
    interactions: { forces: ['seek_air'] }
  },
  invisible: {
    id: 'invisible',
    name: 'Invisible',
    category: 'magical',
    durationDT: null,
    stackable: false,
    modifiers: [
      { target: 'difficulty', scope: 'incoming_targeted_attack', value: 2 },
      { target: 'difficulty', scope: 'stealth', value: -1 }
    ],
    immunities: [],
    removedBy: ['reveal_invisibility', 'dispel', 'duration_elapsed'],
    interactions: {}
  },
  incorporeal: {
    id: 'incorporeal',
    name: 'Incorporel',
    category: 'magical',
    durationDT: null,
    stackable: false,
    modifiers: [{ target: 'damage_in', scope: 'physical', value: -99 }],
    immunities: ['grappled', 'restrained', 'poisoned', 'bleeding'],
    removedBy: ['materialize', 'dispel', 'duration_elapsed'],
    interactions: { blocks: ['physical_grapple'] }
  },
  levitating: {
    id: 'levitating',
    name: 'Levitant',
    category: 'magical',
    durationDT: null,
    stackable: false,
    modifiers: [{ target: 'difficulty', scope: 'ground_movement', value: 1 }],
    immunities: ['prone'],
    removedBy: ['land', 'dispel', 'duration_elapsed'],
    interactions: {}
  },
  silenced_magic: {
    id: 'silenced_magic',
    name: 'Anti-magie',
    category: 'magical',
    durationDT: null,
    stackable: false,
    modifiers: [{ target: 'difficulty', scope: 'spell', value: 99 }],
    immunities: [],
    removedBy: ['dispel', 'leave_area', 'duration_elapsed'],
    interactions: { blocks: ['spell'] }
  },
  blessed: {
    id: 'blessed',
    name: 'Beni',
    category: 'magical',
    durationDT: null,
    stackable: false,
    modifiers: [{ target: 'dice_count', scope: 'morale_or_resistance', value: 1 }],
    immunities: ['cursed'],
    removedBy: ['dispel', 'curse', 'duration_elapsed'],
    interactions: {}
  },
  cursed: {
    id: 'cursed',
    name: 'Maudit',
    category: 'magical',
    durationDT: null,
    stackable: false,
    modifiers: [{ target: 'dice_count', scope: 'morale_or_resistance', value: -1 }],
    immunities: ['blessed'],
    removedBy: ['dispel', 'blessing', 'duration_elapsed'],
    interactions: {}
  }
} satisfies TacticalStatusRegistry);

export type TacticalStatusId = keyof typeof TACTICAL_STATUS_REGISTRY;

export const TACTICAL_STATUS_IDS = Object.keys(TACTICAL_STATUS_REGISTRY) as TacticalStatusId[];

export function defineTacticalStatusRegistry<T extends TacticalStatusRegistry>(registry: T): T {
  for (const [id, definition] of Object.entries(registry)) {
    validateTacticalStatusDefinition(id, definition);
  }

  return registry;
}

export function listTacticalStatusDefinitions(
  registry: TacticalStatusRegistry = TACTICAL_STATUS_REGISTRY
): TacticalStatusDefinition[] {
  return Object.values(registry);
}

export function getTacticalStatusDefinition(
  id: string,
  registry: TacticalStatusRegistry = TACTICAL_STATUS_REGISTRY
): TacticalStatusDefinition | undefined {
  return registry[id];
}

export function isKnownTacticalStatus(
  id: string,
  registry: TacticalStatusRegistry = TACTICAL_STATUS_REGISTRY
): boolean {
  return getTacticalStatusDefinition(id, registry) !== undefined;
}

function validateTacticalStatusDefinition(
  registryKey: string,
  definition: TacticalStatusDefinition
): void {
  if (definition.id !== registryKey) {
    throw new Error(`Tactical status registry key "${registryKey}" does not match definition id`);
  }

  if (definition.id.length === 0 || definition.name.length === 0) {
    throw new Error(`Tactical status "${registryKey}" must declare an id and name`);
  }

  if (!(TACTICAL_STATUS_CATEGORIES as readonly string[]).includes(definition.category)) {
    throw new Error(`Tactical status "${registryKey}" has unknown category`);
  }

  if (
    definition.durationDT !== null &&
    (!Number.isInteger(definition.durationDT) || definition.durationDT < 0)
  ) {
    throw new Error(
      `Tactical status "${registryKey}" durationDT must be null or a positive integer`
    );
  }

  for (const modifier of definition.modifiers) {
    if (!(TACTICAL_STATUS_MODIFIER_TARGETS as readonly string[]).includes(modifier.target)) {
      throw new Error(`Tactical status "${registryKey}" has unknown modifier target`);
    }
    if (modifier.scope.length === 0 || !Number.isInteger(modifier.value)) {
      throw new Error(`Tactical status "${registryKey}" has invalid modifier`);
    }
  }
}
