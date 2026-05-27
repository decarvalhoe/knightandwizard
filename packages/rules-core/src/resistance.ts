/**
 * E4 — Moteur de résistance multi-couches **magique + élémentaire** (R-1.32 / R-1.33 / R-8.15).
 *
 * Couche complémentaire au pipeline de dégâts physiques (`combat-damage.ts`, qui couvre déjà
 * bouclier → résistance P/E/C/T → armure → endurance). Ce module ajoute les couches que la magie
 * réclame et que le combat physique n'a pas :
 *
 *  - **Résistance magique (R-8.15)** : ne s'applique qu'à la **magie directe** (`direct_magic`), c.-à-d.
 *    un sort qui agit directement sur la cible vivante (contrôle, transformation, illusion, **soin**,
 *    bénédiction). C'est un **bouclier** contre les sorts directs offensifs, MAIS un **fardeau** sur
 *    les sorts directs bénéfiques (un soin peut être « résisté » donc bloqué).
 *  - **Résistance élémentaire** : pour la magie **indirecte** qui projette un élément (feu, foudre,
 *    eau, froid…). Routée par nom d'élément ; distincte des types physiques P/E/C/T.
 *
 * Routage (R-1.33) : un sort **direct** transite par la résistance magique ; un sort **indirect**
 * (élémentaire) par la résistance élémentaire (+ armure/endurance, gérées par `combat-damage`). Pas
 * de résistance générique : chaque agression passe par la (les) couche(s) pertinente(s).
 *
 * Toute résistance utilise la mécanique **D100 ≤ %** (R-1.32), tout-ou-rien (comme le bouclier
 * passif R-1.34) : un jet réussi annule entièrement l'effet de la couche.
 */
import { type RandomInteger } from './dice.js';

/** Quelle couche a (ou non) résisté. */
export type ResistanceLayer = 'magic' | 'elemental';

export interface ResistanceRoll {
  /** Couche évaluée. */
  layer: ResistanceLayer;
  /** Seuil de résistance en % (0..100). */
  percent: number;
  /** Le D100 jeté (absent si aucun jet n'était nécessaire : % nul ou montant nul). */
  roll?: number;
  /** Vrai si `roll <= percent` : la couche a résisté (effet annulé). */
  resisted: boolean;
}

/**
 * Vecteur d'agression d'un effet de sort sur une cible. `directMagic` et `element` décrivent
 * comment l'effet atteint la cible ; `beneficial` distingue un soin/buff (pour le fardeau R-8.15).
 */
export interface SpellAggression {
  /** R-8.15 : la magie agit-elle DIRECTEMENT sur la cible vivante ? (contrôle, soin, transformation) */
  directMagic: boolean;
  /** Soin / buff : si résisté par la magie, c'est un **fardeau** (l'effet bénéfique est bloqué). */
  beneficial: boolean;
  /** Élément projeté pour un sort indirect (feu, foudre, eau, froid…). */
  element?: string;
  /** Magnitude entrante (dégâts si offensif, soin si bénéfique). Entier ≥ 0. */
  amount: number;
}

/** Profil de résistance de la cible (sommes par type, cf. R-3.5 `character_resistances`). */
export interface TargetResistanceProfile {
  /** % de résistance à la magie directe (R-8.15). */
  magicPercent?: number;
  /** % de résistance par élément (clé = nom d'élément). */
  elementalPercent?: Record<string, number>;
}

export interface SpellResistanceResult {
  /** Magnitude après résistance (0 si une couche a résisté ; sinon l'entrée inchangée). */
  amount: number;
  /** Couche(s) effectivement évaluée(s), avec leur jet. */
  layers: ResistanceRoll[];
  /** Vrai si une couche a annulé l'effet. */
  fullyResisted: boolean;
  /** Vrai si un sort direct **bénéfique** a été bloqué par la résistance magique (fardeau R-8.15). */
  burden: boolean;
}

export interface ResistanceOptions {
  randomInteger?: RandomInteger;
}

function assertPercent(label: string, value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error(`${label} must be an integer between 0 and 100`);
  }
}

function assertNonNegativeInteger(label: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
}

function defaultRandomInteger(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

function rollD100(randomInteger: RandomInteger): number {
  const value = randomInteger(100);
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    throw new Error('randomInteger(100) must return an integer between 1 and 100');
  }
  return value;
}

/**
 * R-1.32 — primitive de résistance : `D100 ≤ percent` ⇒ résisté (tout-ou-rien). Ne jette pas si
 * `percent` est nul ou `amount` nul (rien à résister). `percent` est borné [0, 100].
 */
export function rollResistance(
  layer: ResistanceLayer,
  percent: number,
  amount: number,
  options: ResistanceOptions = {}
): ResistanceRoll {
  assertPercent(`${layer} resistance percent`, percent);
  assertNonNegativeInteger(`${layer} resistance amount`, amount);
  const randomInteger = options.randomInteger ?? defaultRandomInteger;
  const shouldRoll = amount > 0 && percent > 0;
  const roll = shouldRoll ? rollD100(randomInteger) : undefined;
  const resisted = roll !== undefined && roll <= percent;
  return { layer, percent, ...(roll !== undefined ? { roll } : {}), resisted };
}

/**
 * Applique les couches de résistance **magie/élémentaire** à un effet de sort, routées par le
 * vecteur d'agression (R-1.33) :
 *  - sort **direct** → résistance magique (R-8.15), bouclier offensif ET fardeau bénéfique ;
 *  - sort **indirect** avec élément → résistance élémentaire de cet élément.
 *
 * (L'armure P/E/C/T et l'endurance restent gérées par `combat-damage.ts` pour les dégâts physiques.)
 */
export function resolveSpellResistance(
  aggression: SpellAggression,
  profile: TargetResistanceProfile,
  options: ResistanceOptions = {}
): SpellResistanceResult {
  assertNonNegativeInteger('aggression.amount', aggression.amount);
  const layers: ResistanceRoll[] = [];
  let amount = aggression.amount;
  let burden = false;

  if (aggression.directMagic) {
    // R-8.15 — magie directe : la résistance magique s'applique (et SEULEMENT elle).
    const roll = rollResistance('magic', profile.magicPercent ?? 0, amount, options);
    layers.push(roll);
    if (roll.resisted) {
      amount = 0;
      burden = aggression.beneficial; // un soin/buff bloqué = fardeau
    }
  } else if (aggression.element !== undefined) {
    // Sort indirect élémentaire : résistance de l'élément concerné.
    const percent = profile.elementalPercent?.[aggression.element] ?? 0;
    const roll = rollResistance('elemental', percent, amount, options);
    layers.push(roll);
    if (roll.resisted) amount = 0;
  }

  return { amount, layers, fullyResisted: amount === 0 && aggression.amount > 0, burden };
}
