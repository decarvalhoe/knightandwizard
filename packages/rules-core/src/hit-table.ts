import { type RandomInteger } from './dice.js';

/**
 * R-9.46 (provisoire) — Table des Touches reconstruite (D100 → zone).
 *
 * Reconstruction depuis R-9.15 (effets de zone) + les 15 zones de `protections.yaml`, principe
 * R-9.21 / R-1.35 (« plus le D100 est haut, plus la zone est vitale »). Statut 🟡 : validée par le
 * propriétaire pour l'implémentation, **à remplacer/confirmer par le scan papier (OCR)** une fois
 * disponible. Chaque entrée porte une **sortie explicite** `{ damageMultiplier, allowsEndurance }`
 * ET une **voix** in-world (loi UX transverse « sortie explicite + voix »).
 *
 * `yeux` (×2, endurance interdite) est une sous-zone de précision (action précise R-1.12), hors
 * tirage aléatoire, donc absente de cette table.
 */
export interface HitTableEntry {
  /** Identifiant canonique de zone (aligné sur `protections.yaml`). */
  zone: string;
  /** Borne basse inclusive du D100 (1..100 ; 100 affiché « 00 »). */
  min: number;
  /** Borne haute inclusive du D100. */
  max: number;
  /** Multiplicateur de dégâts appliqué en dernier dans la chaîne (R-9.15). */
  damageMultiplier: number;
  /** Le jet d'endurance est-il autorisé pour cette zone (R-9.16) ? */
  allowsEndurance: boolean;
  /** Ligne de voix in-world (loi UX). */
  voice: string;
}

export interface HitZoneResult {
  zone: string;
  roll: number;
  damageMultiplier: number;
  allowsEndurance: boolean;
  voice: string;
}

/** R-9.46 provisoire — tri par létalité croissante (le D100 haut = zone vitale). */
export const PROVISIONAL_HIT_TABLE: readonly HitTableEntry[] = [
  {
    zone: 'pied',
    min: 1,
    max: 4,
    damageMultiplier: 1,
    allowsEndurance: true,
    voice: 'Au pied. Humiliant, rarement décisif.'
  },
  {
    zone: 'bas_jambe',
    min: 5,
    max: 11,
    damageMultiplier: 1,
    allowsEndurance: true,
    voice: 'Au tibia — il dansera moins.'
  },
  {
    zone: 'genou',
    min: 12,
    max: 14,
    damageMultiplier: 1,
    allowsEndurance: true,
    voice: 'Au genou. Ça lâche.'
  },
  {
    zone: 'haut_jambe',
    min: 15,
    max: 24,
    damageMultiplier: 1,
    allowsEndurance: true,
    voice: "À la cuisse ; s'il s'en tire, il boitera."
  },
  {
    zone: 'main',
    min: 25,
    max: 29,
    damageMultiplier: 1,
    allowsEndurance: true,
    voice: 'À la main. Tenir son arme devient une opinion.'
  },
  {
    zone: 'avant_bras',
    min: 30,
    max: 36,
    damageMultiplier: 1,
    allowsEndurance: true,
    voice: "À l'avant-bras. La parade s'en souviendra."
  },
  {
    zone: 'coude',
    min: 37,
    max: 39,
    damageMultiplier: 1,
    allowsEndurance: true,
    voice: 'Au coude. Articulation contrariée.'
  },
  {
    zone: 'haut_bras',
    min: 40,
    max: 47,
    damageMultiplier: 1,
    allowsEndurance: true,
    voice: 'Au bras. Le geste perd de son ampleur.'
  },
  {
    zone: 'epaule',
    min: 48,
    max: 51,
    damageMultiplier: 1,
    allowsEndurance: true,
    voice: "À l'épaule. Lever le bras devient négociable."
  },
  {
    zone: 'ventre_bas_dos',
    min: 52,
    max: 63,
    damageMultiplier: 1,
    allowsEndurance: true,
    voice: 'En plein ventre. Le genre de coup dont on se souvient.'
  },
  {
    zone: 'thorax_dos',
    min: 64,
    max: 75,
    damageMultiplier: 1,
    allowsEndurance: true,
    voice: 'En pleine poitrine.'
  },
  {
    zone: 'haut_thorax_haut_dos',
    min: 76,
    max: 82,
    damageMultiplier: 1,
    allowsEndurance: true,
    voice: 'Haut du buste, près de ce qui compte.'
  },
  {
    zone: 'tete',
    min: 83,
    max: 88,
    damageMultiplier: 2,
    allowsEndurance: true,
    voice: 'En plein crâne.'
  },
  {
    zone: 'parties_genitales',
    min: 89,
    max: 92,
    damageMultiplier: 1,
    allowsEndurance: false,
    voice: '…là. Pas un mot de plus.'
  },
  {
    zone: 'gorge_nuque',
    min: 93,
    max: 100,
    damageMultiplier: 2,
    allowsEndurance: false,
    voice: "À la gorge. Le sang n'attend pas."
  }
];

/**
 * Tire une zone de touche aléatoire (D100) sur la table fournie (défaut : table provisoire R-9.46).
 * Le résultat est directement convertible en `DamageZoneInput` (`id` = `zone`).
 */
export function rollHitZone(
  randomInteger: RandomInteger,
  table: readonly HitTableEntry[] = PROVISIONAL_HIT_TABLE
): HitZoneResult {
  const roll = randomInteger(100);

  if (!Number.isInteger(roll) || roll < 1 || roll > 100) {
    throw new Error('randomInteger(100) must return an integer between 1 and 100');
  }

  const entry = table.find((candidate) => roll >= candidate.min && roll <= candidate.max);

  if (entry === undefined) {
    throw new Error(`hit table has no zone for D100 roll ${roll}`);
  }

  return {
    zone: entry.zone,
    roll,
    damageMultiplier: entry.damageMultiplier,
    allowsEndurance: entry.allowsEndurance,
    voice: entry.voice
  };
}
