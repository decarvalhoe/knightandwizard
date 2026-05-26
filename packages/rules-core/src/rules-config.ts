/**
 * Versioned, data-driven rule configuration ("les regles sont vivantes").
 *
 * Externalises constants that were previously hard-coded across rules-core so the
 * ruleset can be tuned, versioned and migrated. `DEFAULT_RULES_CONFIG` reproduces
 * the historical hard-coded values EXACTLY, so passing it (the default) is a no-op.
 */

export interface CombatRulesConfig {
  /** Length of a combat round in DT (legacy cyclic 1..N display). */
  roundLengthDT: number;
  /** Difficulty of the stamina endurance roll that prevents damage. */
  staminaRollDifficulty: number;
  /** A hit knocks the target unconscious when finalDamage > vitality.current * this ratio. */
  unconsciousDamageRatio: number;
  /** Vitality malus = round(vitality.max * this ratio) - vitality.current (clamped >= 0). */
  vitalityMalusRatio: number;
  /** R-2.18 — carrying capacity without speed penalty = strength * this (kg). */
  encumbranceKgPerStrength: number;
  /** R-2.18 — each full step of this many kg above capacity adds +1 to the speed factor. */
  encumbranceKgPerStep: number;
  /** R-1.38 — lower bound for the effective speed factor in DT (an action costs >= this). */
  minSpeedFactor: number;
}

export interface CreationRulesConfig {
  /** Per-attribute creation cap = race.attributeMax[attr] - this offset. */
  attributeMaxOffset: number;
  /** Maximum points on a single skill at creation. */
  maxSkillPointsAtCreation: number;
  /** Maximum points on a single spell at creation. */
  maxSpellPointsAtCreation: number;
  /** Spell points a magician receives at creation before conversion. */
  magicianBaseSpellPoints: number;
  /** Creation skill points consumed to buy one extra spell point. */
  skillPointsPerSpellPoint: number;
  /** Starting energy (current and max) for a magician character. */
  magicianStartingEnergy: number;
  /** Orientation ids treated as magician when source data does not expose isMagical. */
  magicianOrientationIds: string[];
  /** Race ids treated as familiars for level progression. */
  familiarRaceIds: string[];
}

export interface ProgressionRulesConfig {
  /** XP cost to raise a skill: 0 pts -> base, otherwise currentPoints * base. */
  skillImprovementBaseCost: number;
  /** XP cost to raise a spell: 0 pts -> base, otherwise currentPoints * base. */
  spellImprovementBaseCost: number;
  /** Base learning days per XP cost point. */
  learningDaysPerXP: number;
  /** Multiplier applied to learning time when self-taught (no mentor). */
  selfTaughtMultiplier: number;
  /** Minimum learning-days floor per learning kind. */
  learningFloors: {
    skill: number;
    complex_skill: number;
    new_spell: number;
    spell_development: number;
    conceptualization: number;
  };
  /** Maximum roleplay points awardable per session. */
  maxRoleplayPoints: number;
  /** Magician level points = skill points + spell points * this multiplier. */
  magicianLevelSpellMultiplier: number;
}

export interface RulesConfig {
  /**
   * Ruleset version. Persisted characters should record the version they were
   * built under so they can be migrated when the ruleset changes.
   */
  version: number;
  combat: CombatRulesConfig;
  creation: CreationRulesConfig;
  progression: ProgressionRulesConfig;
}

/**
 * Canonical default ruleset. Values mirror the historical hard-coded constants
 * in combat.ts / character.ts / progression.ts (do NOT change them here without
 * a ruleset version bump and a character migration path).
 */
export const DEFAULT_RULES_CONFIG: RulesConfig = {
  version: 1,
  combat: {
    roundLengthDT: 50,
    staminaRollDifficulty: 7,
    unconsciousDamageRatio: 0.5,
    vitalityMalusRatio: 0.5,
    encumbranceKgPerStrength: 5,
    encumbranceKgPerStep: 5,
    minSpeedFactor: 1
  },
  creation: {
    attributeMaxOffset: 1,
    maxSkillPointsAtCreation: 4,
    maxSpellPointsAtCreation: 2,
    magicianBaseSpellPoints: 2,
    skillPointsPerSpellPoint: 10,
    magicianStartingEnergy: 60,
    magicianOrientationIds: ['1', 'magicien'],
    familiarRaceIds: ['32', 'familiar']
  },
  progression: {
    skillImprovementBaseCost: 3,
    spellImprovementBaseCost: 10,
    learningDaysPerXP: 3,
    selfTaughtMultiplier: 2,
    learningFloors: {
      skill: 1,
      complex_skill: 3,
      new_spell: 7,
      spell_development: 14,
      conceptualization: 30
    },
    maxRoleplayPoints: 3,
    magicianLevelSpellMultiplier: 2
  }
};
