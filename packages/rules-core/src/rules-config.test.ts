import { describe, expect, it } from 'vitest';

import {
  addCombatant,
  applyDamage,
  createCombatState,
  getCyclicDT,
  resolveStaminaDamage
} from './combat.js';
import {
  ATTRIBUTE_KEYS,
  calculateLevelProgression,
  createPlayerCharacter,
  type RaceProfile
} from './character.js';
import {
  calculateLearningPlan,
  skillImprovementCost,
  spellImprovementCost
} from './progression.js';
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

function withCreation(overrides: Partial<RulesConfig['creation']>): RulesConfig {
  return {
    ...DEFAULT_RULES_CONFIG,
    creation: {
      ...DEFAULT_RULES_CONFIG.creation,
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

function targetCombatant() {
  return {
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
  };
}

function humanRace(id = 'humain'): RaceProfile {
  return {
    id,
    name: 'Human',
    category: 20,
    vitality: 24,
    speedFactor: 8,
    willFactor: 10,
    attributeMax: Object.fromEntries(
      ATTRIBUTE_KEYS.map((key) => [key, 6])
    ) as RaceProfile['attributeMax']
  };
}

function validAttributes() {
  return {
    strength: 3,
    dexterity: 3,
    stamina: 3,
    reflexes: 2,
    perception: 2,
    intelligence: 2,
    charisma: 2,
    empathy: 2,
    aestheticism: 1
  };
}

function validSkills() {
  return [
    { id: 'epee', points: 4, isMain: true },
    { id: 'course', points: 4 },
    { id: 'chasse', points: 4 },
    { id: 'histoire', points: 4 },
    { id: 'medecine', points: 4 }
  ];
}

describe('versioned rules-config', () => {
  it('exposes the canonical default ruleset version', () => {
    expect(DEFAULT_RULES_CONFIG.version).toBe(1);
  });

  it('drives combat round length from config.roundLengthDT', () => {
    const custom = withCombat({ roundLengthDT: 12 });

    expect(getCyclicDT(12, '+', custom)).toBe(1);
    expect(getCyclicDT(1, '-', custom)).toBe(12);
    expect(createCombatState(13, custom).round).toBe(2);
  });

  it('drives damage unconscious and vitality-malus thresholds from config ratios', () => {
    const custom = withCombat({ unconsciousDamageRatio: 0.3, vitalityMalusRatio: 0.8 });
    const state = addCombatant(createCombatState(1, custom), targetCombatant(), custom);

    const result = applyDamage(state, 'target', 4, custom);
    const target = result.timeline[0];

    expect(target.vitality.current).toBe(6);
    expect(target.statuses).toContainEqual({ id: 'unconscious', appliedAtDT: 1 });
    expect(target.attributes).toMatchObject({ strength: 3, dexterity: 3, stamina: 1 });
  });

  it('drives magician and familiar identity from configured ids', () => {
    const custom = withCreation({
      magicianOrientationIds: ['custom-mage'],
      familiarRaceIds: ['custom-familiar']
    });

    const mage = createPlayerCharacter(
      {
        id: 'pc-custom-mage',
        name: 'Custom Mage',
        race: humanRace(),
        orientation: { id: 'custom-mage', name: 'Custom Mage' },
        classProfile: { id: 'custom-class', name: 'Custom Class', orientationId: 'custom-mage' },
        attributes: validAttributes(),
        skills: validSkills(),
        spells: [{ id: 'custom-spell', points: 2 }]
      },
      custom
    );

    expect(mage.energy).toEqual({ current: 60, max: 60 });

    const familiar = { ...mage, race: humanRace('custom-familiar') };
    expect(calculateLevelProgression(familiar, custom)).toEqual({
      level: null,
      levelPoints: null,
      levelUpAt: null,
      primarySkillIds: []
    });
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
    const makeState = () => addCombatant(createCombatState(1), targetCombatant());

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
