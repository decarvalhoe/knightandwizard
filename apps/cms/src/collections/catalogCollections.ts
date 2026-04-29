import type { CollectionConfig, Field } from 'payload';

const requiredName: Field = {
  name: 'name',
  type: 'text',
  required: true,
  unique: true
};

const notes: Field = {
  name: 'notes',
  type: 'textarea',
  admin: {
    description: 'Notes internes de consolidation ou de migration depuis les catalogues YAML/PHP.'
  }
};

export const Weapons: CollectionConfig = {
  slug: 'weapons',
  admin: {
    defaultColumns: ['name', 'category', 'damageType', 'baseDamage'],
    group: 'Catalogues',
    useAsTitle: 'name'
  },
  labels: {
    singular: 'Weapon',
    plural: 'Weapons'
  },
  versions: true,
  fields: [
    requiredName,
    {
      name: 'category',
      type: 'select',
      options: ['melee', 'ranged', 'thrown', 'shield', 'natural'],
      required: true
    },
    {
      name: 'damageType',
      type: 'select',
      options: ['P', 'E', 'C', 'T', 'special'],
      required: true
    },
    {
      name: 'baseDamage',
      type: 'number',
      min: 0,
      required: true
    },
    {
      name: 'hands',
      type: 'number',
      min: 0
    },
    notes
  ]
};

export const Bestiary: CollectionConfig = {
  slug: 'bestiary',
  admin: {
    defaultColumns: ['name', 'category', 'vitality', 'speedFactor', 'willFactor'],
    group: 'Catalogues',
    useAsTitle: 'name'
  },
  labels: {
    singular: 'Bestiary Entry',
    plural: 'Bestiary'
  },
  versions: true,
  fields: [
    requiredName,
    {
      name: 'category',
      type: 'number',
      min: 1,
      required: true
    },
    {
      name: 'vitality',
      type: 'number',
      min: 0,
      required: true
    },
    {
      name: 'speedFactor',
      type: 'number',
      min: 1,
      required: true
    },
    {
      name: 'willFactor',
      type: 'number',
      min: 1,
      required: true
    },
    {
      name: 'attributes',
      type: 'group',
      fields: [
        'strength',
        'dexterity',
        'stamina',
        'reflexes',
        'perception',
        'intelligence',
        'charisma',
        'empathy',
        'aestheticism'
      ].map((name) => ({
        name,
        type: 'number',
        min: 0,
        required: true
      }))
    },
    notes
  ]
};

export const Spells: CollectionConfig = {
  slug: 'spells',
  admin: {
    defaultColumns: ['name', 'school', 'energyCost', 'incantationTimeDT', 'difficulty'],
    group: 'Catalogues',
    useAsTitle: 'name'
  },
  labels: {
    singular: 'Spell',
    plural: 'Spells'
  },
  versions: true,
  fields: [
    requiredName,
    {
      name: 'school',
      type: 'select',
      options: [
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
        'necromancy'
      ],
      required: true
    },
    {
      name: 'energyCost',
      type: 'number',
      min: 0,
      required: true
    },
    {
      name: 'incantationTimeDT',
      type: 'number',
      min: 1,
      required: true
    },
    {
      name: 'difficulty',
      type: 'number',
      min: 1,
      required: true
    },
    {
      name: 'directMagic',
      type: 'checkbox',
      defaultValue: false
    },
    {
      name: 'effect',
      type: 'textarea'
    },
    notes
  ]
};

export const Nations: CollectionConfig = {
  slug: 'nations',
  admin: {
    defaultColumns: ['name', 'region', 'government'],
    group: 'Catalogues',
    useAsTitle: 'name'
  },
  labels: {
    singular: 'Nation',
    plural: 'Nations'
  },
  versions: true,
  fields: [
    requiredName,
    {
      name: 'region',
      type: 'text',
      required: true
    },
    {
      name: 'government',
      type: 'text'
    },
    {
      name: 'description',
      type: 'textarea'
    },
    {
      name: 'mapColor',
      type: 'text'
    },
    notes
  ]
};

export const CatalogCollections = [Weapons, Bestiary, Spells, Nations] satisfies CollectionConfig[];
