import { describe, expect, it } from 'vitest';

import { addCombatant, createCombatState, resolveStaminaDamage } from './combat.js';
import { calculateLearningPlan, skillImprovementCost, spellImprovementCost } from './progression.js';
import { DEFAULT_RULES_CONFIG, type RulesConfig } from './rules-config.js';

/**
 * These tests prove rules-core is data-driven: the SAME function, fed a custom
 * RulesConfig, produces different (rule-tuned) results, while DEFAULT_RULES_CONFIG
 * reproduces the historical hard-coded behavior.
 */

function withProgression(overrides: Partial<RulesConfig['progression']>): RulesConfig {
  return {
    ...DEFAULT_RULES_CONFIG,
    progression: {
      ...DEFAULT_RULES_CONFIG.progression,
      ...overrides
    }
  };
}

function withCombat(overrides: Partial<RulesConfig['combat']>): RulesConfig {
  return {
    ...DEFAULT_RULES_CONFIG,
    combat: {
      ...DEFAULT_RULES_CONFIG.combat,
      ...overrides
    }
  };
}

function scriptedRolls(values: number[]) {
  let index = 0;

  return (sides: number): number => {
    const value = values[index];
    index += 1;

    if (value === undefined) {
      throw new Error(`No scripted roll left for D${sides}`);
    }

    return value;
  };
}

describe('versioned rules-config', () => {
  it('exposes the canonical default ruleset version', () => {
    expect(DEFAULT_RULES_CONFIG.version).toBe(1);
  });

  it('drives skill improvement cost from config.skillImprovementBaseCost', () => {
    const custom = withProgression({ skillImprovementBaseCost: 5 });

    // default base 3: 0 pts -> 3, 2 pts -> 6
    expect(skillImprovementCost(0)).toBe(3);
    expect(skillImprovementCost(2)).toBe(6);

    // custom base 5: 0 pts -> 5, 2 pts -> 10
    expect(skillImprovementCost(0, custom)).toBe(5);
    expect(skillImprovementCost(2, custom)).toBe(10);
  });

  it('drives spell improvement cost from config.spellImprovementBaseCost', () => {
    const custom = withProgression({ spellImprovementBaseCost: 4 });

    expect(spellImprovementCost(3)).toBe(30);
    expect(spellImprovementCost(3, custom)).toBe(12);
  });

  it('drives learning duration from learningDaysPerXP, selfTaughtMultiplier and learningFloors', () => {
    // Custom: 5 days per XP, self-taught x3, and a raised "skill" floor of 12.
    const custom = withProgression({
      learningDaysPerXP: 5,
      selfTaughtMultiplier: 3,
      learningFloors: {
        ...DEFAULT_RULES_CONFIG.progression.learningFloors,
        skill: 12
      }
    });

    // Default: baseDays = 2 * 3 * 1 = 6, finalDays clamped to skill floor 1 -> 6.
    expect(calculateLearningPlan({ xpCost: 2, kind: 'skill' })).toEqual({
      baseDays: 6,
      finalDays: 6
    });

    // Custom self-taught: baseDays = 2 * 5 * 3 = 30, no successes, floor 12 -> 30.
    expect(calculateLearningPlan({ xpCost: 2, kind: 'skill', selfTaught: true }, custom)).toEqual({
      baseDays: 30,
      finalDays: 30
    });

    // Custom: enough successes to drop below the raised floor -> clamped to 12.
    expect(
      calculateLearningPlan({ xpCost: 2, kind: 'skill', learningSuccesses: 30 }, custom)
    ).toEqual({
      baseDays: 10,
      finalDays: 12
    });
  });

  it('drives the stamina endurance roll difficulty from config.staminaRollDifficulty', () => {
    const makeState = () =>
      addCombatant(createCombatState(1), {
        id: 'target',
        name: 'Target',
        speedFactor: 5,
        nextActionAt: 12,
        reflexes: 3,
        vitality: { current: 10, max: 10 },
        attributes: { strength: 5, dexterity: 5, stamina: 3 },
        baseAttributes: { strength: 5, dexterity: 5, stamina: 3 },
        skills: {},
        statuses: []
      });

    // Default difficulty 7: three dice showing 8 (>= 7) -> 3 successes -> 3 prevented.
    const defaultResult = resolveStaminaDamage(makeState(), 'target', 5, {
      randomInteger: scriptedRolls([8, 8, 8])
    });
    expect(defaultResult.log.at(-1)).toMatchObject({
      type: 'stamina_roll_resolved',
      preventedDamage: 3,
      finalDamage: 2
    });

    // Custom difficulty 9: the SAME 8s now fail (8 < 9) -> 0 successes -> 0 prevented.
    const custom = withCombat({ staminaRollDifficulty: 9 });
    const customResult = resolveStaminaDamage(
      makeState(),
      'target',
      5,
      { randomInteger: scriptedRolls([8, 8, 8]) },
      custom
    );
    expect(customResult.log.at(-1)).toMatchObject({
      type: 'stamina_roll_resolved',
      preventedDamage: 0,
      finalDamage: 5
    });
  });
});
