import {
  createPlayerCharacter,
  toCombatant,
  type AttributeKey,
  type CharacterClassProfile,
  type CharacterOrientationProfile,
  type PlayerCharacter,
  type RandomInteger,
  type RaceProfile
} from '@knightandwizard/rules-core';

import type { CombatantTemplate } from '@/features/combat-tracker/model';

/**
 * Libellés FR canoniques des 9 aptitudes (miroir de
 * `features/character-creation/read-models.ts`). Traduction d'enum stable, pas
 * de donnée inventée.
 */
export const ATTRIBUTE_LABELS_FR: Record<AttributeKey, string> = {
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

/**
 * RNG déterministe (mulberry32) injecté dans rules-core : les résultats de dés
 * et de combat proviennent du VRAI moteur, de façon reproductible. La surface
 * n'invente jamais un résultat — elle appelle `rollDice` / `resolveNextAction`.
 */
export function makeSeededRandomInteger(seed: number): RandomInteger {
  let state = seed >>> 0;

  return (sides: number) => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    const unit = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return Math.floor(unit * sides) + 1;
  };
}

// Race « Humain » — valeurs réelles de `data/catalogs/races.yaml` (xp_category 20,
// vitality_base 20, speed_factor_base 8, will_factor_base 12, attribute_max 5).
const HUMAIN: RaceProfile = {
  id: 'humain',
  name: 'Humain',
  category: 20,
  vitality: 20,
  speedFactor: 8,
  willFactor: 12,
  attributeMax: {
    strength: 5,
    dexterity: 5,
    stamina: 5,
    reflexes: 5,
    perception: 5,
    intelligence: 5,
    charisma: 5,
    empathy: 5,
    aestheticism: 5
  }
};

// Orientation « Guerrier » + classe « Archer » (compétence primaire « archerie »)
// — `data/catalogs/orientations.yaml` + `classes.yaml`.
const GUERRIER: CharacterOrientationProfile = { id: 'guerrier', name: 'Guerrier' };
const ARCHER: CharacterClassProfile = {
  id: 'archer',
  name: 'Archer',
  orientationId: 'guerrier',
  primarySkillIds: ['archerie']
};

/**
 * Personnage de démonstration construit par le VRAI moteur :
 * `createPlayerCharacter` valide la création (aptitudes = catégorie 20,
 * compétences = 20, chaque valeur ≤ cap). Une fraîche enrôlée, niveau 1.
 */
export const demoArcher: PlayerCharacter = createPlayerCharacter({
  id: 'aveline',
  name: 'Aveline de Fauche-le-Vent',
  race: HUMAIN,
  orientation: GUERRIER,
  classProfile: ARCHER,
  attributes: {
    strength: 2,
    dexterity: 4,
    stamina: 3,
    reflexes: 3,
    perception: 4,
    intelligence: 1,
    charisma: 1,
    empathy: 1,
    aestheticism: 1
  },
  skills: [
    { id: 'archerie', points: 4, isMain: true },
    { id: 'arc-long', points: 4, parentId: 'archerie' },
    { id: 'arc-court', points: 4, parentId: 'archerie' },
    { id: 'esquive', points: 4 },
    { id: 'esquive-baissee', points: 4, parentId: 'esquive' }
  ]
});

// Adversaires du Registre — combattants réels passés au moteur de combat.
const BRIGAND: CombatantTemplate = {
  id: 'brigand',
  name: 'Brigand des routes',
  speedFactor: 10,
  nextActionAt: 0,
  reflexes: 2,
  vitality: { current: 16, max: 16 },
  attributes: { strength: 3, dexterity: 3, stamina: 3 },
  skills: { 'corps-a-corps': 3 },
  statuses: []
};

const MOLOSSE: CombatantTemplate = {
  id: 'molosse',
  name: 'Molosse affamé',
  speedFactor: 6,
  nextActionAt: 0,
  reflexes: 4,
  vitality: { current: 10, max: 10 },
  attributes: { strength: 2, dexterity: 4, stamina: 2 },
  skills: { morsure: 3 },
  statuses: []
};

export const PLAYER_ID = 'aveline';
export const FOE_IDS = ['brigand', 'molosse'] as const;

/** L'archer (dérivé du personnage réel via `toCombatant`) + deux adversaires. */
export const demoCombatants: CombatantTemplate[] = [toCombatant(demoArcher), BRIGAND, MOLOSSE];
