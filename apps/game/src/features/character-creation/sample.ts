import { ATTRIBUTE_KEYS, type CharacterAttributes } from '@knightandwizard/rules-core';

import type { CharacterCreationCatalog } from './model';

export const attributeLabels: Record<keyof CharacterAttributes, string> = {
  aestheticism: 'Esthetisme',
  charisma: 'Charisme',
  dexterity: 'Dexterite',
  empathy: 'Empathie',
  intelligence: 'Intelligence',
  perception: 'Perception',
  reflexes: 'Reflexes',
  stamina: 'Vigueur',
  strength: 'Force'
};

const humanMax = Object.fromEntries(ATTRIBUTE_KEYS.map((key) => [key, 6])) as CharacterAttributes;
const elfMax = {
  ...humanMax,
  dexterity: 7,
  perception: 7,
  stamina: 5
};
const dwarfMax = {
  ...humanMax,
  aestheticism: 5,
  stamina: 7,
  strength: 7
};

export const characterCreationCatalog: CharacterCreationCatalog = {
  assets: [
    {
      id: 'adaptable',
      label: 'Adaptabilite',
      raceIds: ['humain'],
      source: 'race'
    },
    {
      id: 'sharp-senses',
      label: 'Sens affutes',
      raceIds: ['haut_elfe'],
      source: 'race'
    },
    {
      id: 'stone-blood',
      label: 'Sang de pierre',
      raceIds: ['nain'],
      source: 'race'
    },
    {
      id: 'martial-drill',
      label: 'Discipline martiale',
      orientationIds: ['guerrier'],
      source: 'orientation'
    },
    {
      id: 'arcane-spark',
      label: 'Etincelle arcanique',
      orientationIds: ['magicien'],
      source: 'orientation'
    },
    {
      id: 'craft-guild',
      label: 'Reseau de guilde',
      orientationIds: ['artisan'],
      source: 'orientation'
    },
    {
      classIds: ['garde'],
      id: 'shield-line',
      label: 'Ligne de bouclier',
      source: 'class'
    },
    {
      classIds: ['ranger'],
      id: 'trail-eye',
      label: 'Oeil de piste',
      source: 'class'
    },
    {
      classIds: ['enchanteur'],
      id: 'weapon-bond',
      label: 'Lien de lame',
      source: 'class'
    },
    {
      classIds: ['enchanteur', 'devin'],
      id: 'spell-focus',
      label: 'Focaliseur',
      source: 'class'
    },
    {
      classIds: ['forgeron'],
      id: 'forge-hand',
      label: 'Main de forge',
      source: 'class'
    }
  ],
  classes: [
    {
      id: 'garde',
      name: 'Chevalier',
      orientationId: 'guerrier',
      primarySkillIds: ['epee-batarde']
    },
    {
      id: 'ranger',
      name: 'Rodeur',
      orientationId: 'guerrier',
      primarySkillIds: ['chasse']
    },
    {
      id: 'enchanteur',
      name: "Mage d'armes",
      orientationId: 'magicien',
      primarySkillIds: []
    },
    {
      id: 'devin',
      name: 'Mage erudit',
      orientationId: 'magicien',
      primarySkillIds: []
    },
    {
      id: 'forgeron',
      name: 'Forgeron',
      orientationId: 'artisan',
      primarySkillIds: ['forge']
    }
  ],
  equipment: [
    { id: 'travel-kit', name: 'Paquetage de voyage' },
    { id: 'longsword', name: 'Epee longue' },
    { id: 'round-shield', name: 'Bouclier rond' },
    { id: 'apprentice-kit', name: "Trousse d'apprenti" },
    { id: 'tool-roll', name: "Rouleau d'outils" }
  ],
  orientations: [
    { id: 'guerrier', isMagical: false, name: 'Guerrier' },
    { id: 'magicien', isMagical: true, name: 'Magicien' },
    { id: 'artisan', isMagical: false, name: 'Artisan' }
  ],
  races: [
    {
      attributeMax: humanMax,
      category: 20,
      id: 'humain',
      name: 'Humain',
      speedFactor: 8,
      vitality: 24,
      willFactor: 10
    },
    {
      attributeMax: elfMax,
      category: 18,
      id: 'haut_elfe',
      name: 'Elfe',
      speedFactor: 7,
      vitality: 20,
      willFactor: 11
    },
    {
      attributeMax: dwarfMax,
      category: 22,
      id: 'nain',
      name: 'Nain',
      speedFactor: 9,
      vitality: 28,
      willFactor: 9
    }
  ],
  skills: [
    { id: 'arcanologie', label: 'Arcanologie' },
    { id: 'arcanologie-des-rituels', label: 'Arcanologie des rituels', parentId: 'arcanologie' },
    { id: 'alchimie', label: 'Alchimie' },
    { id: 'epee-batarde', label: 'Épée bâtarde' },
    { id: 'frappe-a-la-tete', label: 'Frappe à la tête', parentId: 'epee-batarde' },
    { id: 'chasse', label: 'Chasse' },
    { id: 'traque', label: 'Traque', parentId: 'chasse' },
    { id: 'forge', label: 'Forge' },
    { id: 'commandement', label: 'Commandement' }
  ],
  spells: [
    { id: 'spark', label: 'Etincelle' },
    { id: 'ward', label: 'Garde mystique' },
    { id: 'veil', label: 'Voile' },
    { id: 'mend', label: 'Reparation mineure' }
  ]
};
