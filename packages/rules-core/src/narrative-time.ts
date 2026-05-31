/**
 * E3 — Runtime « temps double » (R-8.20). Cœur pur rules-core : l'horloge narrative, la conversion
 * combat↔narratif et le suivi des sorts actifs (expiration double-échelle). La persistance
 * (`character_active_spells`, DB) et les surfaces MJ (cockpit) sont des couches au-dessus (E3b+).
 *
 * **Deux échelles imbriquées** (R-8.20) : le temps de **combat** (1 DT = 0,2 s) s'inscrit dans le
 * temps **narratif** (heures/jours). Tout est ramené à une **horloge narrative en secondes** : un
 * sort de durée DT comme un sort de durée min/heure/jour expire sur la même horloge, ce qui gère
 * automatiquement la conversion « si le combat se termine avant l'expiration ».
 *
 * Le multiplicateur de cadence (×0/×0.5/×1/×2) agit sur les avances explicites du MJ sans modifier
 * les durées intrinsèques des sorts déjà posées sur l'horloge.
 */

/** 1 DT = 0,2 seconde narrative (R-8.20). */
export const DT_SECONDS = 0.2;

/** Secondes par unité de durée narrative. */
export const NARRATIVE_UNIT_SECONDS = {
  minute: 60,
  hour: 3_600,
  day: 86_400
} as const;

export const SPELL_DURATION_UNITS = ['DT', 'minute', 'hour', 'day', 'permanent'] as const;
export type SpellDurationUnit = (typeof SPELL_DURATION_UNITS)[number];
export const NARRATIVE_CADENCE_MULTIPLIERS = [0, 0.5, 1, 2] as const;
export type NarrativeCadenceMultiplier = (typeof NARRATIVE_CADENCE_MULTIPLIERS)[number];

/**
 * Un sort actif sur l'horloge narrative. `durationAmount` est la quantité **résolue** (déjà mise à
 * l'échelle par les réussites le cas échéant) ; ignorée si `durationUnit === 'permanent'`.
 */
export interface ActiveSpell {
  id: string;
  spellId?: string;
  targetId?: string;
  /** Instant de lancement, en secondes narratives. */
  castAtSeconds: number;
  durationAmount: number;
  durationUnit: SpellDurationUnit;
}

export interface NarrativeAdvance {
  cadenceMultiplier?: NarrativeCadenceMultiplier;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

function assertNonNegativeFinite(label: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a non-negative finite number`);
  }
}

/** Convertit une durée de combat (DT) en secondes narratives (R-8.20 : 1 DT = 0,2 s). */
export function dtToNarrativeSeconds(dt: number): number {
  assertNonNegativeFinite('dt', dt);
  return dt * DT_SECONDS;
}

/**
 * Durée intrinsèque d'un sort en secondes narratives. Renvoie `null` pour `permanent` (pas
 * d'expiration : dissipation uniquement par dispel actif).
 */
export function durationToSeconds(amount: number, unit: SpellDurationUnit): number | null {
  if (unit === 'permanent') {
    return null;
  }
  assertNonNegativeFinite('duration amount', amount);
  if (unit === 'DT') {
    return amount * DT_SECONDS;
  }
  return amount * NARRATIVE_UNIT_SECONDS[unit];
}

/** Instant d'expiration (secondes narratives), ou `null` si le sort est permanent. */
export function spellExpiresAt(spell: ActiveSpell): number | null {
  const duration = durationToSeconds(spell.durationAmount, spell.durationUnit);
  return duration === null ? null : spell.castAtSeconds + duration;
}

/** Vrai si le sort a expiré à l'instant narratif `nowSeconds` (jamais pour un sort permanent). */
export function isActiveSpellExpired(spell: ActiveSpell, nowSeconds: number): boolean {
  const expiresAt = spellExpiresAt(spell);
  return expiresAt !== null && nowSeconds >= expiresAt;
}

/** Sépare les sorts actifs en `active` / `expired` à l'instant narratif `nowSeconds`. */
export function expireActiveSpells(
  spells: readonly ActiveSpell[],
  nowSeconds: number
): { active: ActiveSpell[]; expired: ActiveSpell[] } {
  const active: ActiveSpell[] = [];
  const expired: ActiveSpell[] = [];
  for (const spell of spells) {
    (isActiveSpellExpired(spell, nowSeconds) ? expired : active).push(spell);
  }
  return { active, expired };
}

/**
 * Avance l'horloge narrative (contrôle MJ « passer la journée / N heures »). Renvoie le nouvel
 * instant en secondes narratives.
 */
export function advanceNarrative(nowSeconds: number, by: NarrativeAdvance): number {
  assertNonNegativeFinite('nowSeconds', nowSeconds);
  const delta =
    (by.days ?? 0) * NARRATIVE_UNIT_SECONDS.day +
    (by.hours ?? 0) * NARRATIVE_UNIT_SECONDS.hour +
    (by.minutes ?? 0) * NARRATIVE_UNIT_SECONDS.minute +
    (by.seconds ?? 0);
  const cadenceMultiplier = by.cadenceMultiplier ?? 1;

  if (!NARRATIVE_CADENCE_MULTIPLIERS.some((allowed) => allowed === cadenceMultiplier)) {
    throw new Error('cadenceMultiplier must be one of 0, 0.5, 1 or 2');
  }

  assertNonNegativeFinite('advance delta', delta);
  return nowSeconds + delta * cadenceMultiplier;
}

/**
 * Fin de combat (R-8.20) : l'horloge narrative avance du temps cumulé de la scène de combat
 * (`elapsedDT` × 0,2 s). Renvoie le nouvel instant narratif.
 */
export function endCombat(nowSeconds: number, elapsedDT: number): number {
  assertNonNegativeFinite('nowSeconds', nowSeconds);
  return nowSeconds + dtToNarrativeSeconds(elapsedDT);
}
