import { describe, expect, it } from 'vitest';

import {
  ATTRIBUTE_KEYS,
  type Character,
  createPlayerCharacter,
  type RaceProfile
} from './character.js';
import {
  ProgressionError,
  calculateLearningPlan,
  calculateSessionXPAward,
  finalizeDefinitiveDeath,
  gainXP,
  learnSkill,
  learnSpell
} from './progression.js';

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
