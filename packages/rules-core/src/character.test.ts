import { describe, expect, it } from 'vitest';

import { type Combatant } from './combat.js';
import {
  ATTRIBUTE_KEYS,
  CharacterValidationError,
  calculateEffectiveAttributes,
  calculateLevelProgression,
  createNonPlayerCharacter,
  createPlayerCharacter,
  toCombatant,
  validateAttributeDistribution,
  validateSkillDistribution,
  validateSpellDistribution
} from './character.js';

describe('character creation validation', () => {
  it('validates the canonical race-category attribute distribution', () => {
    const result = validateAttributeDistribution(validAttributes(), humanRace());

    expect(result).toEqual({
      valid: true,
      errors: [],
      warnings: [],
      total: 20
    });
  });

  it('rejects attributes above the creation maximum and warns about native zeroes', () => {
    const result = validateAttributeDistribution(
      {
        ...validAttributes(),
        strength: 6,
        aestheticism: 0
      },
      humanRace()
    );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('strength cannot exceed 5 at creation for Human');
    expect(result.warnings).toContain(
      'aestheticism is 0 at creation and cannot progress unless a rule explicitly unlocks it'
    );
  });

  it('validates creation skill points against race category and per-entry cap', () => {
    expect(validateSkillDistribution(validSkills(), humanRace().category)).toMatchObject({
      valid: true,
      errors: [],
      total: 20
    });

    expect(
      validateSkillDistribution([{ id: 'epee', points: 5 }], humanRace().category)
    ).toMatchObject({
      valid: false,
      errors: ['skill points must total 20 at creation', 'epee cannot exceed 4 points at creation'],
      total: 5
    });

    expect(
      validateSkillDistribution(
        [
          { id: 'reckless', points: -1 },
          { id: 'balance', points: 1 }
        ],
        0
      )
    ).toMatchObject({
      valid: false,
      errors: ['reckless must have non-negative integer skill points'],
      total: 0
    });
  });

  it('validates magician spell creation points separately from skills', () => {
    expect(validateSpellDistribution([{ id: 'firebolt', points: 2 }], true, 0)).toMatchObject({
      valid: true,
      errors: [],
      total: 2
    });

    expect(validateSpellDistribution([{ id: 'firebolt', points: 2 }], false, 0)).toMatchObject({
      valid: false,
      errors: ['non-magician characters cannot receive spell points at creation']
    });

    expect(validateSpellDistribution([], true, 0)).toMatchObject({
      valid: false,
      errors: ['magician spell points must be at least 2 at creation'],
      total: 0
    });

    expect(validateSpellDistribution([{ id: 'firebolt', points: 1 }], true, 1)).toMatchObject({
      valid: false,
      errors: ['magician spell points must be at least 2 at creation'],
      total: 1
    });

    expect(
      validateSpellDistribution(
        [
          { id: 'firebolt', points: 2 },
          { id: 'ward', points: 1 }
        ],
        true,
        1
      )
    ).toMatchObject({
      valid: true,
      errors: [],
      total: 3
    });
  });

  it('creates player characters with race-derived resources and magician energy', () => {
    const fighter = createPlayerCharacter({
      id: 'pc-fighter',
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
      skills: validSkills(),
      equipment: [{ id: 'longsword', quantity: 1 }],
      metadata: { creationMode: 'manual' }
    });
    const mage = createPlayerCharacter({
      id: 'pc-mage',
      name: 'Mirelda',
      race: humanRace(),
      orientation: { id: 'magicien', name: 'Magicien', isMagical: true },
      classProfile: {
        id: 'sorcier',
        name: 'Mage',
        orientationId: 'magicien'
      },
      attributes: validAttributes(),
      skills: validSkills(),
      spells: [{ id: 'firebolt', points: 2 }]
    });

    expect(fighter.vitality).toEqual({ current: 24, max: 24 });
    expect(fighter.energy).toEqual({ current: 0, max: 0 });
    expect(fighter.speedFactor).toBe(8);
    expect(fighter.willFactor).toBe(10);
    expect(fighter.equipment).toEqual([{ id: 'longsword', quantity: 1 }]);
    expect(fighter.metadata).toEqual({ creationMode: 'manual' });
    expect(mage.energy).toEqual({ current: 60, max: 60 });
  });

  it('fails character creation when rule distributions are invalid', () => {
    expect(() =>
      createPlayerCharacter({
        id: 'pc-invalid',
        name: 'Broken',
        race: humanRace(),
        orientation: { id: 'guerrier', name: 'Guerrier' },
        classProfile: {
          id: 'garde',
          name: 'Garde',
          orientationId: 'guerrier',
          primarySkillIds: ['epee']
        },
        attributes: {
          ...validAttributes(),
          strength: 6
        },
        skills: validSkills()
      })
    ).toThrow(CharacterValidationError);
  });
});

describe('non-player character templates', () => {
  it('creates generated NPC sheets without player creation point caps', () => {
    const guard = createNonPlayerCharacter({
      id: 'npc-guard',
      name: 'Garde humain',
      templateId: 'human-guard',
      race: humanRace(),
      orientation: { id: 'guerrier', name: 'Guerrier' },
      classProfile: {
        id: 'garde',
        name: 'Garde',
        orientationId: 'guerrier',
        primarySkillIds: ['epee']
      },
      attributes: {
        ...validAttributes(),
        strength: 6,
        stamina: 5
      },
      vitality: { current: 28, max: 28 },
      energy: { current: 0, max: 0 },
      speedFactor: 7,
      willFactor: 9,
      skills: [{ id: 'epee', points: 6, isMain: true }],
      metadata: { generatedFrom: 'Npc.php' }
    });

    expect(guard).toMatchObject({
      kind: 'npc',
      templateId: 'human-guard',
      vitality: { current: 28, max: 28 },
      speedFactor: 7,
      willFactor: 9,
      skills: [{ id: 'epee', points: 6, isMain: true }],
      metadata: { generatedFrom: 'Npc.php' }
    });
  });
});

describe('character derived state', () => {
  it('calculates effective attributes from additive modifiers and clamps at zero', () => {
    const character = createPlayerCharacter({
      id: 'pc-effective',
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
      skills: validSkills(),
      modifiers: [
        { id: 'belt', target: 'strength', value: 2 },
        { id: 'curse', target: 'all_attributes', value: -3 }
      ]
    });

    expect(calculateEffectiveAttributes(character)).toMatchObject({
      strength: 2,
      aestheticism: 0
    });
  });

  it('calculates legacy level points from primary skill trees for non-magicians', () => {
    const character = createPlayerCharacter({
      id: 'pc-level',
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
        { id: 'frappe-a-la-tete', points: 3, parentId: 'epee' },
        { id: 'parade', points: 2, parentId: 'frappe-a-la-tete' },
        { id: 'cook', points: 4 },
        { id: 'chasse', points: 4 },
        { id: 'histoire', points: 3 }
      ]
    });

    expect(calculateLevelProgression(character)).toEqual({
      level: 1,
      levelPoints: 29,
      levelUpAt: 40,
      primarySkillIds: ['epee']
    });
  });

  it('does not double-count cyclic specialization trees when computing level points', () => {
    const character = createPlayerCharacter({
      id: 'pc-cycle',
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
        { id: 'epee', points: 4, isMain: true, parentId: 'parade' },
        { id: 'parade', points: 4, parentId: 'epee' },
        { id: 'cook', points: 4 },
        { id: 'chasse', points: 4 },
        { id: 'histoire', points: 4 }
      ]
    });

    expect(calculateLevelProgression(character).levelPoints).toBe(28);
  });

  it('calculates legacy level points for magicians from skills plus doubled spells', () => {
    const character = createPlayerCharacter({
      id: 'pc-mage-level',
      name: 'Mirelda',
      race: humanRace(),
      orientation: { id: 'magicien', name: 'Magicien', isMagical: true },
      classProfile: {
        id: 'sorcier',
        name: 'Mage',
        orientationId: 'magicien'
      },
      attributes: validAttributes(),
      skills: validSkills(),
      spells: [{ id: 'firebolt', points: 2 }]
    });

    expect(calculateLevelProgression(character)).toEqual({
      level: 1,
      levelPoints: 24,
      levelUpAt: 40,
      primarySkillIds: []
    });
  });

  it('allows magicians to convert creation skill points into additional spell points', () => {
    const oneExtraSpell = createPlayerCharacter({
      id: 'pc-mage-extra-spell',
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
        { id: 'arcana', points: 4 },
        { id: 'histoire', points: 4 },
        { id: 'rituals', points: 2 }
      ],
      spells: [
        { id: 'firebolt', points: 2 },
        { id: 'ward', points: 1 }
      ]
    });
    const allInSpells = createPlayerCharacter({
      id: 'pc-mage-four-spells',
      name: 'Elaria',
      race: humanRace(),
      orientation: { id: 'magicien', name: 'Magicien', isMagical: true },
      classProfile: {
        id: 'sorcier',
        name: 'Mage',
        orientationId: 'magicien'
      },
      attributes: validAttributes(),
      skills: [],
      spells: [
        { id: 'firebolt', points: 1 },
        { id: 'ward', points: 1 },
        { id: 'spark', points: 1 },
        { id: 'veil', points: 1 }
      ]
    });

    expect(calculateLevelProgression(oneExtraSpell).levelPoints).toBe(16);
    expect(calculateLevelProgression(allInSpells).levelPoints).toBe(8);
  });

  it('keeps familiars outside normal level progression like the legacy PHP', () => {
    const familiar = createPlayerCharacter({
      id: 'pc-familiar',
      name: 'Plume',
      race: {
        ...humanRace(),
        id: '32',
        name: 'Familier'
      },
      orientation: { id: 'guerrier', name: 'Guerrier' },
      classProfile: {
        id: 'garde',
        name: 'Garde',
        orientationId: 'guerrier',
        primarySkillIds: ['epee']
      },
      attributes: validAttributes(),
      skills: validSkills()
    });

    expect(calculateLevelProgression(familiar)).toEqual({
      level: null,
      levelPoints: null,
      levelUpAt: null,
      primarySkillIds: []
    });
  });

  it('maps a character sheet into a combat timeline participant', () => {
    const character = createPlayerCharacter({
      id: 'pc-combat',
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
      skills: validSkills()
    });

    expect(toCombatant(character)).toMatchObject<Partial<Combatant>>({
      id: 'pc-combat',
      name: 'Jehan',
      speedFactor: 8,
      reflexes: 2,
      vitality: { current: 24, max: 24 },
      attributes: {
        strength: 3,
        dexterity: 3,
        stamina: 3
      },
      skills: {
        epee: 4
      }
    });
  });
});

function humanRace() {
  return {
    id: 'humain',
    name: 'Human',
    category: 20,
    vitality: 24,
    speedFactor: 8,
    willFactor: 10,
    attributeMax: Object.fromEntries(ATTRIBUTE_KEYS.map((key) => [key, 6]))
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
