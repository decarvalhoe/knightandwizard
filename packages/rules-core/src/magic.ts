import type { CharacterResource } from './character.js';
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

/**
 * R-8.10 — Modèle d'énergie (MVP : coût + récupération + plafond).
 *
 * L'énergie est un pool `{ current, max }` (`CharacterResource`). `energyMax` provient de la
 * création (magicien 60, non-magicien 0, R-8.10) ; il n'est donc PAS recalculé ici. La durée
 * de repos (8 h, R-2.11) est gérée par l'action de repos (Fiche) : ce module ne fournit que les
 * primitives numériques que la Fiche / le combat décrémentent automatiquement.
 *
 * Hors périmètre (V2) : inversion énergie↔vitalité (R-8.14) et dépassement du plafond
 * ("Débordement d'énergie", R-8.14). En MVP, lancer sans énergie suffisante échoue.
 */
export function spendEnergy(energy: CharacterResource, cost: number): CharacterResource {
  assertNonNegativeInteger('cost', cost);

  if (cost > energy.current) {
    throw new Error(`insufficient energy: ${cost} required, ${energy.current} available`);
  }

  return { current: energy.current - cost, max: energy.max };
}

/**
 * R-8.10 — Regagne de l'énergie (potion, effet, récupération partielle), **plafonné** à `max`.
 * Le dépassement du plafond ("Débordement d'énergie") est V2.
 */
export function gainEnergy(energy: CharacterResource, amount: number): CharacterResource {
  assertNonNegativeInteger('amount', amount);

  return { current: Math.min(energy.current + amount, energy.max), max: energy.max };
}

/** R-8.10 / R-2.11 — Un repos complet (8 h) restaure l'énergie à son maximum. */
export function restoreEnergyToFull(energy: CharacterResource): CharacterResource {
  return { current: energy.max, max: energy.max };
}

function assertNonNegativeInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
}
