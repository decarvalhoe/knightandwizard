import { type DiceRollResult, type RollDiceOptions, rollDice } from './dice.js';

/**
 * D8 — Magie (moteur). Étape 1 : le **jet de sort** (R-8.5).
 *
 * Le moteur de magie est piloté par `docs/plan/MAGIC-IMPLEMENTATION.md`. Cœur MVP : lancement
 * (ici) + énergie (coût/récup) + TI/concentration/interruption — ces deux derniers viendront
 * brancher l'énergie et le temps d'incantation dans le combat (réutilise R-9.4).
 */
export interface SpellCastResult {
  /** Dice pool = Intelligence + points invested in the spell. */
  pool: number;
  difficulty: number;
  roll: DiceRollResult;
  /** Net successes on the casting roll. */
  netSuccesses: number;
  /** A spell takes effect on at least one success. */
  success: boolean;
}

/**
 * R-8.5 — Spell casting roll. Pool = **Intelligence + points dans le sort** (PAS de compétence ni
 * de spécialisation). Difficulté = la difficulté convenue du sort (peut dépasser 9, R-1.20).
 *
 * Ne gère QUE le jet : le coût en énergie et le temps d'incantation (TI) sont des étapes suivantes.
 */
export function resolveSpellCast(
  intelligence: number,
  spellPoints: number,
  difficulty: number,
  options: RollDiceOptions = {}
): SpellCastResult {
  assertNonNegativeInteger('intelligence', intelligence);
  assertNonNegativeInteger('spellPoints', spellPoints);

  const pool = intelligence + spellPoints;
  const roll = rollDice(pool, difficulty, options);

  return {
    pool,
    difficulty,
    roll,
    netSuccesses: roll.successes,
    success: roll.successes > 0
  };
}

function assertNonNegativeInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
}
