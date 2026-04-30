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
  alchimie: 'Alchimie',
  arcanologie: 'Arcanologie',
  'arcanologie-des-rituels': 'Arcanologie des rituels',
  commandement: 'Commandement',
  cuisine: 'Cuisine',
  'cuisine-corteganne': 'Cuisine corteganne',
  diplomatie: 'Diplomatie',
  'epee-batarde': 'Épée bâtarde',
  'frappe-a-la-tete': 'Frappe à la tête',
  stoicisme: 'Stoïcisme'
};

export const skillCatalog: SkillCatalogEntry[] = [
  { id: 'arcanologie', label: 'Arcanologie' },
  { id: 'arcanologie-des-rituels', label: 'Arcanologie des rituels', parentId: 'arcanologie' },
  { id: 'alchimie', label: 'Alchimie' },
  { id: 'epee-batarde', label: 'Épée bâtarde' },
  { id: 'frappe-a-la-tete', label: 'Frappe à la tête', parentId: 'epee-batarde' },
  { id: 'stoicisme', label: 'Stoïcisme' },
  { id: 'commandement', label: 'Commandement' },
  { id: 'diplomatie', label: 'Diplomatie' },
  { id: 'cuisine', label: 'Cuisine' },
  { id: 'cuisine-corteganne', label: 'Cuisine corteganne', parentId: 'cuisine' }
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
    id: 'enchanteur',
    name: "Mage d'armes",
    orientationId: 'magicien',
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
  orientation: { id: 'magicien', isMagical: true, name: 'Magicien' },
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
    { id: 'arcanologie', points: 4 },
    { id: 'epee-batarde', points: 4 },
    { id: 'frappe-a-la-tete', parentId: 'epee-batarde', points: 2 },
    { id: 'stoicisme', points: 2 },
    { id: 'commandement', points: 4 },
    { id: 'cuisine-corteganne', parentId: 'cuisine', points: 2 },
    { id: 'arcanologie-des-rituels', parentId: 'arcanologie', points: 2 }
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
