import type { CollectionBeforeValidateHook, CollectionConfig, Field } from 'payload';

type CollectionInput = {
  adminGroup?: string;
  defaultColumns?: string[];
  description?: string;
  fields: Field[];
  labels: {
    plural: string;
    singular: string;
  };
  slug: string;
};

const CATALOG_GROUP = 'Catalogues canoniques';
const LEGACY_GROUP = 'Referentiels PHP';
const RULES_GROUP = 'Regles vivantes';

const canonicalIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const normalizeCanonicalId: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) {
    return data;
  }

  const canonicalId = data.canonicalId;

  if (typeof canonicalId !== 'string') {
    return data;
  }

  const normalized = canonicalId
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!canonicalIdPattern.test(normalized)) {
    throw new Error('canonicalId must contain lowercase letters, numbers and dashes only');
  }

  data.canonicalId = normalized;
  return data;
};

const canonicalIdField: Field = {
  name: 'canonicalId',
  type: 'text',
  admin: {
    description:
      'Stable source id used by YAML imports, legacy PHP mapping and rules-core references.'
  },
  index: true,
  required: true,
  unique: true
};

const nameField: Field = {
  name: 'name',
  type: 'text',
  required: true
};

const migrationNotesField: Field = {
  name: 'migrationNotes',
  type: 'textarea',
  admin: {
    description: 'Internal notes for source ambiguity, author validation or migration decisions.'
  }
};

const metadataField: Field = {
  name: 'metadata',
  type: 'json',
  admin: {
    description:
      'Raw catalog metadata preserved from YAML/PHP until importer-specific fields stabilize.'
  }
};

const sourceRefsField: Field = {
  name: 'sourceRefs',
  type: 'array',
  admin: {
    description: 'Source files, legacy tables or rules documents used to create this entry.'
  },
  fields: [
    selectField('kind', ['yaml', 'legacy_php', 'rules_markdown', 'map_asset', 'manual'], true),
    textField('path', true),
    textField('note')
  ]
};

const attributeNames = [
  'strength',
  'dexterity',
  'stamina',
  'reflexes',
  'perception',
  'intelligence',
  'charisma',
  'empathy',
  'aestheticism'
] as const;

const magicTypes = [
  'abjuration',
  'alteration',
  'white_magic',
  'divination',
  'enchantment',
  'elemental',
  'illusion',
  'invocation',
  'natural_magic',
  'black_magic',
  'necromancy',
  'legacy_type'
] as const;

export const Weapons = catalogCollection({
  defaultColumns: ['canonicalId', 'name', 'category', 'damageFormula', 'difficulty'],
  fields: [
    textField('category', true),
    selectField('damageTypes', ['P', 'E', 'C', 'T', 'special'], false, { hasMany: true }),
    textField('damageFormula', true),
    numberField('difficulty'),
    numberField('handsRequired'),
    numberField('weightKg'),
    relationshipField('originNation', 'nations'),
    textareaField('special')
  ],
  labels: { singular: 'Weapon', plural: 'Weapons' },
  slug: 'weapons'
});

export const Protections = catalogCollection({
  defaultColumns: ['canonicalId', 'name', 'kind', 'category', 'layer'],
  fields: [
    selectField('kind', ['armor_piece', 'shield'], true),
    textField('layer'),
    textField('category', true),
    textField('material'),
    damageProfileField('protection'),
    arrayField('zonesCovered', [textField('zone', true)]),
    numberField('passChancePct'),
    numberField('weightKgHuman'),
    textField('size'),
    jsonField('racialWeightModifiers')
  ],
  labels: { singular: 'Protection', plural: 'Protections' },
  slug: 'protections'
});

export const Bestiary = catalogCollection({
  defaultColumns: ['canonicalId', 'name', 'category', 'xpCategory', 'playable'],
  fields: [
    textField('category', true),
    numberField('sizeM'),
    numberField('lifeExpectancy'),
    numberField('xpCategory'),
    numberField('vitalityBase'),
    numberField('speedFactorBase'),
    numberField('willFactorBase'),
    attributeProfileField('attributeMax'),
    checkboxField('languageCapable'),
    checkboxField('playable')
  ],
  labels: { singular: 'Bestiary Entry', plural: 'Bestiary' },
  slug: 'bestiary'
});

export const Potions = catalogCollection({
  defaultColumns: ['canonicalId', 'name', 'category', 'outputType'],
  fields: [
    textField('category', true),
    textField('outputType', true),
    textareaField('effect', true),
    textField('effectDuration'),
    textField('consumptionMode'),
    arrayField('ingredients', [
      textField('ingredientId', true),
      textField('quantity'),
      textField('unit')
    ]),
    jsonField('craftCheck'),
    jsonField('outputMetadata'),
    numberField('marketValuePc')
  ],
  labels: { singular: 'Potion', plural: 'Potions' },
  slug: 'potions'
});

export const Spells = catalogCollection({
  defaultColumns: ['canonicalId', 'name', 'magicType', 'energyCost', 'difficulty'],
  fields: [
    selectField('magicType', magicTypes, true),
    textareaField('effect'),
    numberField('energyCost'),
    numberField('castingTimeDT'),
    numberField('difficulty'),
    numberField('value'),
    checkboxField('directMagic'),
    textField('legacyTypeId')
  ],
  labels: { singular: 'Spell', plural: 'Spells' },
  slug: 'spells'
});

export const Nations = catalogCollection({
  defaultColumns: ['canonicalId', 'name', 'category', 'capital', 'government'],
  fields: [
    textField('category', true),
    textField('capital'),
    textField('officialLanguage'),
    textField('officialReligion'),
    textField('government'),
    textareaField('description'),
    jsonField('gentile'),
    jsonField('population'),
    numberField('surfaceKm2'),
    textField('mapColor')
  ],
  labels: { singular: 'Nation', plural: 'Nations' },
  slug: 'nations'
});

export const Organisations = catalogCollection({
  defaultColumns: ['canonicalId', 'name', 'category', 'homeNation'],
  fields: [
    textField('category', true),
    textareaField('description'),
    relationshipField('homeNation', 'nations'),
    relationshipField('relatedReligion', 'religions')
  ],
  labels: { singular: 'Organisation', plural: 'Organisations' },
  slug: 'organisations'
});

export const Religions = catalogCollection({
  defaultColumns: ['canonicalId', 'name', 'category', 'primaryRace'],
  fields: [
    textField('category', true),
    relationshipField('primaryRace', 'races'),
    textareaField('doctrine'),
    arrayField('deities', [
      textField('name', true),
      textField('title'),
      textField('domain'),
      textareaField('notes')
    ])
  ],
  labels: { singular: 'Religion', plural: 'Religions' },
  slug: 'religions'
});

export const Rules = catalogCollection({
  adminGroup: RULES_GROUP,
  defaultColumns: ['canonicalId', 'name', 'section', 'sourcePath', 'order'],
  fields: [
    selectField(
      'section',
      [
        'resolution',
        'attributes',
        'races',
        'classes',
        'skills',
        'character_creation',
        'progression',
        'magic',
        'combat',
        'equipment',
        'npc_control',
        'world',
        'roles'
      ],
      true
    ),
    textField('sourcePath', true),
    numberField('order'),
    codeField('content', true, 'markdown'),
    arrayField('tags', [textField('tag', true)])
  ],
  labels: { singular: 'Rule', plural: 'Rules' },
  slug: 'rules'
});

export const Mushrooms = catalogCollection({
  defaultColumns: ['canonicalId', 'name', 'syndrome', 'toxicity'],
  fields: [
    textField('syndrome'),
    textField('toxicity'),
    textareaField('symptoms'),
    textareaField('treatment'),
    jsonField('species')
  ],
  labels: { singular: 'Mushroom', plural: 'Mushrooms' },
  slug: 'mushrooms'
});

export const Images = catalogCollection({
  defaultColumns: ['canonicalId', 'name', 'assetType', 'sourcePath'],
  fields: [
    selectField('assetType', ['world_map', 'regional_map', 'coat_of_arms', 'web_asset'], true),
    textField('sourcePath', true),
    textField('altText'),
    numberField('width'),
    numberField('height'),
    relationshipField('relatedNation', 'nations')
  ],
  labels: { singular: 'Image Asset', plural: 'Image Assets' },
  slug: 'images'
});

export const LoreEntries = catalogCollection({
  defaultColumns: ['canonicalId', 'name', 'topic', 'sourcePath'],
  fields: [
    textField('topic', true),
    textField('sourcePath', true),
    textareaField('summary'),
    textareaField('content'),
    arrayField('tags', [textField('tag', true)])
  ],
  labels: { singular: 'Lore Entry', plural: 'Lore Entries' },
  slug: 'lore-entries'
});

export const WorldMapRegions = catalogCollection({
  defaultColumns: ['canonicalId', 'name', 'kind', 'parentRegion'],
  fields: [
    selectField('kind', ['region', 'nation', 'zone', 'landmark'], true),
    relationshipField('parentRegion', 'world-map-regions'),
    relationshipField('nation', 'nations'),
    textField('sourceMap'),
    jsonField('borders'),
    jsonField('geometry')
  ],
  labels: { singular: 'World Map Region', plural: 'World Map Regions' },
  slug: 'world-map-regions'
});

export const MapCities = catalogCollection({
  defaultColumns: ['canonicalId', 'name', 'parentRegion', 'role'],
  fields: [
    relationshipField('parentRegion', 'world-map-regions'),
    relationshipField('nation', 'nations'),
    selectField(
      'role',
      [
        'capital',
        'capital_centre',
        'major_city',
        'town',
        'border_town',
        'village',
        'landmark',
        'gate',
        'island',
        'island_group',
        'tribal_capital'
      ],
      true
    ),
    textField('domain'),
    textField('sourceMap'),
    numberField('webId')
  ],
  labels: { singular: 'Map City', plural: 'Map Cities' },
  slug: 'map-cities'
});

export const Orientations = catalogCollection({
  adminGroup: LEGACY_GROUP,
  defaultColumns: ['canonicalId', 'name'],
  fields: [relationshipField('asset', 'assets')],
  labels: { singular: 'Orientation', plural: 'Orientations' },
  slug: 'orientations'
});

export const Races = catalogCollection({
  adminGroup: LEGACY_GROUP,
  defaultColumns: ['canonicalId', 'name', 'category', 'playable'],
  fields: [
    numberField('category'),
    numberField('vitalityBase'),
    numberField('speedFactorBase'),
    numberField('willFactorBase'),
    attributeProfileField('attributeMax'),
    relationshipField('raceAssets', 'assets', { hasMany: true }),
    checkboxField('playable')
  ],
  labels: { singular: 'Race', plural: 'Races' },
  slug: 'races'
});

export const SkillFamilies = catalogCollection({
  adminGroup: LEGACY_GROUP,
  defaultColumns: ['canonicalId', 'name'],
  fields: [textareaField('description')],
  labels: { singular: 'Skill Family', plural: 'Skill Families' },
  slug: 'skill-families'
});

export const Skills = catalogCollection({
  adminGroup: LEGACY_GROUP,
  defaultColumns: ['canonicalId', 'name', 'family', 'parentSkill'],
  fields: [
    relationshipField('family', 'skill-families'),
    relationshipField('parentSkill', 'skills'),
    checkboxField('isPrimaryCandidate')
  ],
  labels: { singular: 'Skill', plural: 'Skills' },
  slug: 'skills'
});

export const CharacterClasses = catalogCollection({
  adminGroup: LEGACY_GROUP,
  defaultColumns: ['canonicalId', 'name', 'orientation', 'classAsset'],
  fields: [
    relationshipField('orientation', 'orientations'),
    relationshipField('classAsset', 'assets'),
    relationshipField('primarySkills', 'skills', { hasMany: true })
  ],
  labels: { singular: 'Character Class', plural: 'Character Classes' },
  slug: 'character-classes'
});

export const Assets = catalogCollection({
  adminGroup: LEGACY_GROUP,
  defaultColumns: ['canonicalId', 'name', 'type', 'activation', 'value'],
  fields: [
    selectField(
      'type',
      ['neutral', 'race', 'orientation', 'class', 'level', 'handicap', 'familiar'],
      true
    ),
    selectField('activation', ['permanent', 'ephemeral', 'manual', 'legacy_unknown']),
    textareaField('effect', true),
    numberField('value'),
    numberField('familiarCostPoints'),
    numberField('familiarGrantPoints'),
    checkboxField('isHandicap'),
    numberField('sourceLine')
  ],
  labels: { singular: 'Asset', plural: 'Assets' },
  slug: 'assets'
});

export const LevelAssets = catalogCollection({
  adminGroup: LEGACY_GROUP,
  defaultColumns: ['canonicalId', 'name', 'asset', 'level', 'points'],
  fields: [
    relationshipField('asset', 'assets'),
    numberField('level', true),
    numberField('points'),
    relationshipField('race', 'races'),
    relationshipField('orientation', 'orientations'),
    relationshipField('characterClass', 'character-classes'),
    textareaField('specialCondition')
  ],
  labels: { singular: 'Level Asset', plural: 'Level Assets' },
  slug: 'level-assets'
});

export const Places = catalogCollection({
  adminGroup: LEGACY_GROUP,
  defaultColumns: ['canonicalId', 'name', 'status', 'nation', 'isCapital'],
  fields: [
    relationshipField('parentPlace', 'places'),
    relationshipField('nation', 'nations'),
    textField('status'),
    checkboxField('isCapital'),
    selectField('mapRole', ['forum_place', 'city', 'town', 'region', 'landmark', 'unknown'])
  ],
  labels: { singular: 'Place', plural: 'Places' },
  slug: 'places'
});

export const CatalogCollections = [
  Weapons,
  Protections,
  Bestiary,
  Potions,
  Spells,
  Nations,
  Organisations,
  Religions,
  Rules,
  Mushrooms,
  Images,
  LoreEntries,
  WorldMapRegions,
  MapCities,
  Orientations,
  Races,
  SkillFamilies,
  Skills,
  CharacterClasses,
  Assets,
  LevelAssets,
  Places
] satisfies CollectionConfig[];

function catalogCollection({
  adminGroup = CATALOG_GROUP,
  defaultColumns = ['canonicalId', 'name'],
  fields,
  labels,
  slug
}: CollectionInput): CollectionConfig {
  return {
    slug,
    admin: {
      defaultColumns,
      group: adminGroup,
      useAsTitle: 'name'
    },
    labels,
    versions: true,
    hooks: {
      beforeValidate: [normalizeCanonicalId]
    },
    fields: [
      canonicalIdField,
      nameField,
      ...fields,
      sourceRefsField,
      migrationNotesField,
      metadataField
    ]
  };
}

function textField(name: string, required = false, extra: Record<string, unknown> = {}): Field {
  return {
    name,
    type: 'text',
    required,
    ...extra
  } as Field;
}

function textareaField(name: string, required = false): Field {
  return {
    name,
    type: 'textarea',
    required
  };
}

function numberField(name: string, required = false): Field {
  return {
    name,
    type: 'number',
    required
  };
}

function checkboxField(name: string): Field {
  return {
    name,
    type: 'checkbox',
    defaultValue: false
  };
}

function codeField(name: string, required = false, language = 'typescript'): Field {
  return {
    name,
    type: 'code',
    admin: {
      language
    },
    required
  } as Field;
}

function selectField(
  name: string,
  options: readonly string[],
  required = false,
  extra: Record<string, unknown> = {}
): Field {
  return {
    name,
    type: 'select',
    options: options.map((value) => ({ label: toLabel(value), value })),
    required,
    ...extra
  } as Field;
}

function relationshipField(
  name: string,
  relationTo: string,
  extra: Record<string, unknown> = {}
): Field {
  return {
    name,
    type: 'relationship',
    relationTo,
    ...extra
  } as Field;
}

function jsonField(name: string): Field {
  return {
    name,
    type: 'json'
  };
}

function arrayField(name: string, fields: Field[]): Field {
  return {
    name,
    type: 'array',
    fields
  };
}

function damageProfileField(name: string): Field {
  return {
    name,
    type: 'group',
    fields: ['P', 'E', 'C', 'T'].map((damageType) => numberField(damageType))
  };
}

function attributeProfileField(name: string): Field {
  return {
    name,
    type: 'group',
    fields: attributeNames.map((attributeName) => numberField(attributeName))
  };
}

function toLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
