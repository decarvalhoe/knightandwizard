import { describe, expect, it } from 'vitest';

import {
  ATTRIBUTE_KEYS,
  type Character,
  createPlayerCharacter,
  type RaceProfile
} from './character.js';
import {
  ProgressionError,
  attributeImprovementCost,
  calculateLearningPlan,
  calculateSessionXPAward,
  convertQuestPoints,
  energyImprovementCost,
  factorImprovementCost,
  finalizeDefinitiveDeath,
  gainXP,
  learnSkill,
  learnSpell,
  vitalityImprovementCost
} from './progression.js';
import { DEFAULT_RULES_CONFIG } from './rules-config.js';

describe('session XP awards', () => {
  it('calculates the official 1-8 session XP scale plus separate quest point', () => {
    expect(
      calculateSessionXPAward({
        presence: true,
        concentration: true,
        respectsSpeech: true,
        respectsPsychology: true,
        achievedObjective: true,
        roleplayPoints: 3,
        questPoint: true
      })
    ).toEqual({
      xp: 8,
      questPoints: 1
    });
  });

  it('allows explicit MJ bonus XP while keeping roleplay points bounded', () => {
    expect(
      calculateSessionXPAward({
        presence: true,
        roleplayPoints: 2,
        bonusXP: 4
      })
    ).toEqual({
      xp: 7,
      questPoints: 0
    });

    expect(() => calculateSessionXPAward({ roleplayPoints: 4 })).toThrow(ProgressionError);
  });
});

describe('XP reserve and death', () => {
  it('adds spendable XP, total XP and quest points immutably', () => {
    const character = fighter();
    const awarded = gainXP(character, 7, { questPoints: 1 });

    expect(awarded).not.toBe(character);
    expect(awarded.progression).toEqual({
      experiencePoints: 7,
      experienceTotal: 7,
      questPoints: 1
    });
    expect(character.progression.experiencePoints).toBe(0);
  });

  it('rejects invalid XP gains', () => {
    expect(() => gainXP(fighter(), -1)).toThrow(ProgressionError);
    expect(() => gainXP(fighter(), 1.5)).toThrow(ProgressionError);
  });

  it('drops available XP and quest points on definitive death while preserving total XP', () => {
    const character = gainXP(fighter(), 8, { questPoints: 2 });

    expect(finalizeDefinitiveDeath(character).progression).toEqual({
      experiencePoints: 0,
      experienceTotal: 8,
      questPoints: 0
    });
  });
});

describe('learning costs and duration', () => {
  it('estimates learning duration from XP cost, successes and rule floors', () => {
    expect(
      calculateLearningPlan({
        xpCost: 6,
        kind: 'skill',
        learningSuccesses: 2,
        teachingSuccesses: 1
      })
    ).toEqual({
      baseDays: 18,
      finalDays: 15
    });

    expect(
      calculateLearningPlan({
        xpCost: 10,
        kind: 'new_spell',
        divisor: 4,
        selfTaught: true
      })
    ).toEqual({
      baseDays: 60,
      finalDays: 15
    });
  });
});

describe('skill progression', () => {
  it('learns a new skill for 3 XP and adds the first point', () => {
    const character = gainXP(fighter(), 10);
    const learned = learnSkill(character, 'medecine', { hasNarrativeAccess: true });

    expect(learned.progression.experiencePoints).toBe(7);
    expect(learned.skills).toContainEqual({ id: 'medecine', points: 1 });
  });

  it('improves an existing skill for current points times 3 XP', () => {
    const character = gainXP(fighter(), 20);
    const learned = learnSkill(character, 'epee', { hasNarrativeAccess: true });

    expect(learned.progression.experiencePoints).toBe(8);
    expect(learned.skills.find((skill) => skill.id === 'epee')?.points).toBe(5);
  });

  it('requires enough XP and narrative access to learn a skill', () => {
    expect(() => learnSkill(fighter(), 'medecine', { hasNarrativeAccess: true })).toThrow(
      ProgressionError
    );
    expect(() =>
      learnSkill(gainXP(fighter(), 10), 'medecine', { hasNarrativeAccess: false })
    ).toThrow(ProgressionError);
  });
});

describe('spell progression', () => {
  it('learns a new spell for 10 XP when the magician satisfies level and narrative gates', () => {
    const character = gainXP(magician(), 12);
    const learned = learnSpell(character, 'lumiere', {
      hasNarrativeAccess: true,
      minimumLevel: 1
    });

    expect(learned.progression.experiencePoints).toBe(2);
    expect(learned.spells).toContainEqual({ id: 'lumiere', points: 1 });
  });

  it('improves an existing spell for current points times 10 XP', () => {
    const character = gainXP(magician([{ id: 'boule-de-feu', points: 2 }]), 25);
    const learned = learnSpell(character, 'boule-de-feu', { hasNarrativeAccess: true });

    expect(learned.progression.experiencePoints).toBe(5);
    expect(learned.spells.find((spell) => spell.id === 'boule-de-feu')?.points).toBe(3);
  });

  it('rejects spell learning for non-magicians or unmet spell level requirements', () => {
    expect(() =>
      learnSpell(gainXP(fighter(), 20), 'lumiere', { hasNarrativeAccess: true })
    ).toThrow(ProgressionError);
    expect(() =>
      learnSpell(gainXP(magician(), 20), 'lumiere', {
        hasNarrativeAccess: true,
        minimumLevel: 2
      })
    ).toThrow(ProgressionError);
  });
});

function fighter(): Character {
  return createPlayerCharacter({
    id: 'guerrier',
    name: 'Jehan',
    race: humanRace(),
    orientation: { id: 'guerrier', name: 'Guerrier' },
    classProfile: {
      id: 'garde',
      name: 'Garde',
      orientationId: 'guerrier',
      primarySkillIds: ['epee']
    },
    attributes: validAttributes(),
    skills: [
      { id: 'epee', points: 4, isMain: true },
      { id: 'course', points: 4 },
      { id: 'chasse', points: 4 },
      { id: 'histoire', points: 4 },
      { id: 'forge', points: 4 }
    ]
  });
}

function magician(spells = [{ id: 'boule-de-feu', points: 2 }]): Character {
  return createPlayerCharacter({
    id: 'mage',
    name: 'Mirelda',
    race: humanRace(),
    orientation: { id: 'magicien', name: 'Magicien', isMagical: true },
    classProfile: {
      id: 'sorcier',
      name: 'Mage',
      orientationId: 'magicien'
    },
    attributes: validAttributes(),
    skills: [
      { id: 'arcanologie', points: 4 },
      { id: 'histoire', points: 4 },
      { id: 'chasse', points: 4 },
      { id: 'forge', points: 4 },
      { id: 'medecine', points: 4 }
    ],
    spells
  });
}

function humanRace(): RaceProfile {
  return {
    id: 'humain',
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

describe('XP cost bareme (R-7.5)', () => {
  it('costs an attribute under the racial limit at NA x 5', () => {
    expect(attributeImprovementCost(1)).toBe(5);
    expect(attributeImprovementCost(5)).toBe(25);
  });

  it('costs an attribute above the racial limit at NA x 20, reduced by atouts', () => {
    expect(attributeImprovementCost(3, { aboveLimit: true })).toBe(60);
    expect(attributeImprovementCost(3, { aboveLimit: true, limitModifier: 'anti_limits' })).toBe(
      30
    );
    expect(attributeImprovementCost(3, { aboveLimit: true, limitModifier: 'self_transcend' })).toBe(
      45
    );
  });

  it('costs a factor improvement at (NB - NA + 1) x 25', () => {
    expect(factorImprovementCost(8, 8)).toBe(25);
    expect(factorImprovementCost(8, 7)).toBe(50);
    expect(factorImprovementCost(8, 1)).toBe(200);
  });

  it('rejects a factor current value above its base', () => {
    expect(() => factorImprovementCost(8, 9)).toThrow(ProgressionError);
  });

  it('costs max vitality at 10 flat and max energy at 3 flat', () => {
    expect(vitalityImprovementCost()).toBe(10);
    expect(energyImprovementCost()).toBe(3);
  });

  it('is data-driven by the rules config', () => {
    const custom = {
      ...DEFAULT_RULES_CONFIG,
      progression: {
        ...DEFAULT_RULES_CONFIG.progression,
        attributeImprovementBaseCost: 7,
        factorImprovementBaseCost: 30,
        vitalityImprovementCost: 99
      }
    };

    expect(attributeImprovementCost(2, {}, custom)).toBe(14);
    expect(factorImprovementCost(8, 8, custom)).toBe(30);
    expect(vitalityImprovementCost(custom)).toBe(99);
  });
});

describe('quest points conversion (R-7.3)', () => {
  it('converts accumulated quest points into usable XP on quest completion', () => {
    const character = gainXP(fighter(), 5, { questPoints: 3 });
    const converted = convertQuestPoints(character);

    expect(converted.progression).toEqual({
      experiencePoints: 8,
      experienceTotal: 8,
      questPoints: 0
    });
    // immutable
    expect(character.progression.questPoints).toBe(3);
  });

  it('is a no-op when there are no quest points', () => {
    const character = gainXP(fighter(), 4);
    const converted = convertQuestPoints(character);

    expect(converted).toBe(character);
  });
});
