import {
  ATTRIBUTE_KEYS,
  createPlayerCharacter,
  type AttributeKey,
  type Character,
  type CharacterAttributes
} from '@knightandwizard/rules-core';

import type { InventoryItem, SkillCatalogEntry, SpellEntry } from './model';

export const attributeLabels: Record<AttributeKey, string> = {
  aestheticism: 'Esthétisme',
  charisma: 'Charisme',
  dexterity: 'Dextérité',
  empathy: 'Empathie',
  intelligence: 'Intelligence',
  perception: 'Perception',
  reflexes: 'Réflexes',
  stamina: 'Vigueur',
  strength: 'Force'
};

export const skillLabels: Record<string, string> = {
  arcana: 'Art occulte',
  alchemy: 'Alchimie',
  command: 'Commandement',
  'counter-riposte': 'Contre-riposte',
  cuisine: 'Cuisine',
  'cortegan-cuisine': 'Cuisine corteganne',
  'court-cuisine': 'Cuisine de cour',
  diplomacy: 'Diplomatie',
  endurance: 'Endurance',
  'long-blades': 'Armes longues',
  riposte: 'Riposte',
  rituals: 'Rituels'
};

export const skillCatalog: SkillCatalogEntry[] = [
  { id: 'arcana', label: 'Art occulte' },
  { id: 'rituals', label: 'Rituels', parentId: 'arcana' },
  { id: 'alchemy', label: 'Alchimie' },
  { id: 'long-blades', label: 'Armes longues' },
  { id: 'riposte', label: 'Riposte', parentId: 'long-blades' },
  { id: 'counter-riposte', label: 'Contre-riposte', parentId: 'riposte' },
  { id: 'endurance', label: 'Endurance' },
  { id: 'command', label: 'Commandement' },
  { id: 'diplomacy', label: 'Diplomatie' },
  { id: 'cuisine', label: 'Cuisine' },
  { id: 'cortegan-cuisine', label: 'Cuisine corteganne', parentId: 'cuisine' },
  { id: 'court-cuisine', label: 'Cuisine de cour', parentId: 'cuisine' }
];

export const sampleCharacter: Character = createPlayerCharacter({
  attributes: {
    aestheticism: 1,
    charisma: 2,
    dexterity: 3,
    empathy: 2,
    intelligence: 2,
    perception: 2,
    reflexes: 2,
    stamina: 3,
    strength: 3
  },
  classProfile: {
    id: 'mage-arms',
    name: "Mage d'armes",
    orientationId: 'magician',
    primarySkillIds: []
  },
  id: 'pc-aveline',
  metadata: {
    deity: 'Les Trois Flammes',
    gmNotes: 'Surveiller la dette contractée auprès de la Guilde des Veilleurs.',
    psychology: 'calme, opiniâtre',
    quote: 'La lame tranche, le mot engage.',
    reputation: 'Connue à Brumeval pour avoir contenu une brèche mineure.'
  },
  modifiers: [{ id: 'disciplined-training', target: 'strength', value: 1 }],
  name: 'Aveline de Brumeval',
  orientation: { id: 'magician', isMagical: true, name: 'Magicien' },
  race: {
    attributeMax: Object.fromEntries(ATTRIBUTE_KEYS.map((key) => [key, 6])) as CharacterAttributes,
    category: 20,
    id: 'human',
    name: 'Humain',
    speedFactor: 8,
    vitality: 24,
    willFactor: 10
  },
  skills: [
    { id: 'arcana', points: 4 },
    { id: 'long-blades', points: 4 },
    { id: 'riposte', parentId: 'long-blades', points: 2 },
    { id: 'counter-riposte', parentId: 'riposte', points: 1 },
    { id: 'endurance', points: 1 },
    { id: 'command', points: 4 },
    { id: 'cortegan-cuisine', parentId: 'cuisine', points: 2 },
    { id: 'rituals', parentId: 'arcana', points: 2 }
  ],
  spells: [
    { id: 'ward', points: 1 },
    { id: 'spark', points: 1 }
  ]
});

export const sampleInventory: InventoryItem[] = [
  {
    category: 'weapon',
    equipped: true,
    id: 'longsword',
    name: 'Épée longue',
    quantity: 1,
    weightKg: 1.4
  },
  {
    category: 'shield',
    equipped: true,
    id: 'round-shield',
    name: 'Bouclier rond',
    quantity: 1,
    weightKg: 2
  },
  {
    category: 'consumable',
    id: 'healing-potion',
    name: 'Potion de soin',
    quantity: 2,
    weightKg: 0.2
  }
];

export const sampleSpells: SpellEntry[] = [
  { active: true, id: 'ward', name: 'Garde mystique', points: 1 },
  { active: false, id: 'spark', name: 'Étincelle', points: 1 }
];

export const attributeOrder = ATTRIBUTE_KEYS;
