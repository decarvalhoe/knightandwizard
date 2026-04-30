import { describe, expect, it } from 'vitest';

import {
  ATTRIBUTE_KEYS,
  createPlayerCharacter,
  type Character,
  type CharacterAttributes
} from '@knightandwizard/rules-core';
import {
  addInventoryItem,
  buildCharacterSheetView,
  removeInventoryItem,
  rollAttributeCheck,
  skillPoints,
  skillTreeRows,
  summarizeSpellSlots,
  type InventoryItem,
  type SpellEntry
} from './model.js';

describe('character sheet model', () => {
  it('selects the expected sections for each display mode', () => {
    const character = sampleCharacter();
    const inventory = sampleInventory();
    const spells = sampleSpells();

    expect(
      buildCharacterSheetView({ character, inventory, mode: 'complete', spells }).sections.map(
        (section) => section.id
      )
    ).toEqual(['identity', 'resources', 'attributes', 'skills', 'inventory', 'grimoire']);
    expect(
      buildCharacterSheetView({ character, inventory, mode: 'combat', spells }).sections.map(
        (section) => section.id
      )
    ).toEqual(['resources', 'weapons', 'active-spells', 'states']);
    expect(
      buildCharacterSheetView({ character, inventory, mode: 'social', spells }).sections.map(
        (section) => section.id
      )
    ).toEqual(['social-attributes', 'reputation', 'relations']);
    expect(
      buildCharacterSheetView({ character, inventory, mode: 'gm', spells }).sections.map(
        (section) => section.id
      )
    ).toEqual(['identity', 'full-audit', 'gm-notes', 'gm-controls']);
  });

  it('exposes level-point progression separately from creation skill distribution', () => {
    const view = buildCharacterSheetView({
      character: sampleMagicianCharacter(),
      inventory: sampleInventory(),
      mode: 'complete',
      spells: sampleSpells()
    });

    expect(view.levelProgression).toEqual({
      level: 1,
      levelPoints: 24,
      levelUpAt: 40,
      primarySkillIds: []
    });
  });

  it('summarizes magician creation budgets with converted skill points for extra spells', () => {
    const view = buildCharacterSheetView({
      character: createPlayerCharacter({
        attributes: sampleAttributes(),
        classProfile: {
          id: 'sorcier',
          name: 'Mage',
          orientationId: 'magicien'
        },
        id: 'pc-converted-mage',
        name: 'Elaria',
        orientation: { id: 'magicien', isMagical: true, name: 'Magicien' },
        race: {
          attributeMax: Object.fromEntries(
            ATTRIBUTE_KEYS.map((key) => [key, 6])
          ) as CharacterAttributes,
          category: 20,
          id: 'humain',
          name: 'Humain',
          speedFactor: 8,
          vitality: 24,
          willFactor: 10
        },
        skills: [
          { id: 'arcanologie', points: 4 },
          { id: 'histoire', points: 4 },
          { id: 'arcanologie-des-rituels', parentId: 'arcanologie', points: 2 }
        ],
        spells: [
          { id: 'bouclier', points: 2 },
          { id: 'boule-de-feu', points: 1 }
        ]
      }),
      inventory: sampleInventory(),
      mode: 'complete',
      spells: sampleSpells()
    });

    expect(view.creationBudget).toEqual({
      convertedSkillPoints: 10,
      extraSpellPoints: 1,
      freeSpellPoints: 2,
      skillPointLimit: 10,
      skillPointsSpent: 10,
      spellPoints: 3
    });
    expect(view.levelProgression.levelPoints).toBe(16);
  });

  it('rolls an attribute check from effective attributes and rules-core dice', () => {
    const character = sampleCharacter();
    const rolls = [10, 8, 1, 9, 6];
    let index = 0;

    const result = rollAttributeCheck(character, 'strength', 7, () => rolls[index++]);

    expect(result.pool).toBe(5);
    expect(result.difficulty).toBe(7);
    expect(result.rolls).toEqual([10, 8, 1, 9, 6]);
    expect(result.successes).toBe(2);
  });

  it('returns a forced failure with no D100 severity when the effective attribute is 0', () => {
    const base = sampleCharacter();
    const character: Character = {
      ...base,
      modifiers: [...base.modifiers, { id: 'curse', target: 'aestheticism', value: -1 }]
    };

    const result = rollAttributeCheck(character, 'aestheticism', 7, () => {
      throw new Error('randomInteger should not be called for a forced failure');
    });

    expect(result.pool).toBe(0);
    expect(result.rolls).toEqual([]);
    expect(result.successes).toBe(0);
    expect(result.isCriticalFailure).toBe(false);
    expect(result.isCriticalSuccess).toBe(false);
    expect(result.criticalFailureSeverity).toBeUndefined();
  });

  it('adds and removes inventory quantities without duplicating item rows', () => {
    const inventory = sampleInventory();
    const next = addInventoryItem(inventory, {
      category: 'weapon',
      equipped: false,
      id: 'dagger',
      name: 'Dague',
      quantity: 2,
      weightKg: 0.5
    });

    expect(next).toHaveLength(2);
    expect(next.find((item) => item.id === 'dagger')).toMatchObject({ quantity: 3 });

    const removedOne = removeInventoryItem(next, 'dagger');
    expect(removedOne.find((item) => item.id === 'dagger')).toMatchObject({ quantity: 2 });

    const removedAll = removeInventoryItem(removedOne, 'dagger', 2);
    expect(removedAll.map((item) => item.id)).toEqual(['longsword']);
  });

  it('keeps recursive skill specializations nested while marking implicit zero parents', () => {
    const rows = skillTreeRows([
      { id: 'parent-skill', isMain: true, points: 4 },
      { id: 'child-spec', parentId: 'parent-skill', points: 3 },
      { id: 'grandchild-spec', parentId: 'child-spec', points: 2 },
      { id: 'orphan-spec', parentId: 'unknown-parent', points: 1 },
      { id: 'sibling-root', points: 4 }
    ]);

    expect(
      rows.map((row) => [row.id, row.depth, row.isInheritedPrimary, row.implicitParentId])
    ).toEqual([
      ['parent-skill', 0, false, undefined],
      ['child-spec', 1, true, undefined],
      ['grandchild-spec', 2, true, undefined],
      ['orphan-spec', 0, false, 'unknown-parent'],
      ['sibling-root', 0, false, undefined]
    ]);
  });

  it('treats every unlisted skill or specialization as an implicit zero score', () => {
    const character = sampleCharacter();

    expect(skillPoints(character.skills, 'epee-batarde')).toBe(4);
    expect(skillPoints(character.skills, 'unlisted-specialization')).toBe(0);
  });

  it('overlays character points on a full implicit-zero skill catalog', () => {
    const rows = skillTreeRows(
      [{ id: 'cuisine-corteganne', parentId: 'cuisine', points: 2 }],
      [
        { id: 'epee-batarde', label: 'Épée bâtarde' },
        { id: 'cuisine', label: 'Cuisine' },
        { id: 'cuisine-corteganne', label: 'Cuisine corteganne', parentId: 'cuisine' },
        { id: 'cuisine-alterienne', label: 'Cuisine altérienne', parentId: 'cuisine' }
      ]
    );

    expect(
      rows.map((row) => [row.id, row.points, row.depth, row.isImplicitZero, row.label])
    ).toEqual([
      ['epee-batarde', 0, 0, true, 'Épée bâtarde'],
      ['cuisine', 0, 0, true, 'Cuisine'],
      ['cuisine-corteganne', 2, 1, false, 'Cuisine corteganne'],
      ['cuisine-alterienne', 0, 1, true, 'Cuisine altérienne']
    ]);
  });

  it('summarizes grimoire slots and available energy', () => {
    const summary = summarizeSpellSlots(sampleMagicianCharacter(), sampleSpells());

    expect(summary.knownSpells).toBe(2);
    expect(summary.pointsCommitted).toBe(3);
    expect(summary.energyAvailable).toBe(60);
  });
});

function sampleCharacter(): Character {
  return createPlayerCharacter({
    attributes: sampleAttributes(),
    classProfile: {
      id: 'garde',
      name: 'Chevalier',
      orientationId: 'guerrier',
      primarySkillIds: ['epee-batarde']
    },
    id: 'pc-aveline',
    modifiers: [{ id: 'training', target: 'strength', value: 2 }],
    name: 'Aveline de Brumeval',
    orientation: { id: 'guerrier', name: 'Guerrier' },
    race: {
      attributeMax: Object.fromEntries(
        ATTRIBUTE_KEYS.map((key) => [key, 6])
      ) as CharacterAttributes,
      category: 20,
      id: 'humain',
      name: 'Humain',
      speedFactor: 8,
      vitality: 24,
      willFactor: 10
    },
    skills: [
      { id: 'epee-batarde', isMain: true, points: 4 },
      { id: 'bouclier', points: 4 },
      { id: 'commandement', points: 4 },
      { id: 'stoicisme', points: 4 },
      { id: 'histoire', points: 4 }
    ],
    spells: []
  });
}

function sampleMagicianCharacter(): Character {
  return createPlayerCharacter({
    attributes: sampleAttributes(),
    classProfile: {
      id: 'sorcier',
      name: 'Mage',
      orientationId: 'magicien'
    },
    id: 'pc-mire',
    name: 'Mire de Brumeval',
    orientation: { id: 'magicien', isMagical: true, name: 'Magicien' },
    race: {
      attributeMax: Object.fromEntries(
        ATTRIBUTE_KEYS.map((key) => [key, 6])
      ) as CharacterAttributes,
      category: 20,
      id: 'humain',
      name: 'Humain',
      speedFactor: 8,
      vitality: 24,
      willFactor: 10
    },
    skills: [
      { id: 'arcanologie', isMain: true, points: 4 },
      { id: 'arcanologie-des-rituels', parentId: 'arcanologie', points: 4 },
      { id: 'histoire', points: 4 },
      { id: 'medecine', points: 4 },
      { id: 'diplomatie', points: 4 }
    ],
    spells: [
      { id: 'bouclier', points: 1 },
      { id: 'boule-de-feu', points: 1 }
    ]
  });
}

function sampleAttributes(): CharacterAttributes {
  return {
    aestheticism: 1,
    charisma: 2,
    dexterity: 3,
    empathy: 2,
    intelligence: 2,
    perception: 2,
    reflexes: 2,
    stamina: 3,
    strength: 3
  };
}

function sampleInventory(): InventoryItem[] {
  return [
    {
      category: 'weapon',
      equipped: true,
      id: 'longsword',
      name: 'Épée longue',
      quantity: 1,
      weightKg: 1.4
    },
    {
      category: 'weapon',
      equipped: false,
      id: 'dagger',
      name: 'Dague',
      quantity: 1,
      weightKg: 0.5
    }
  ];
}

function sampleSpells(): SpellEntry[] {
  return [
    { active: true, id: 'bouclier', name: 'Garde mystique', points: 1 },
    { active: false, id: 'boule-de-feu', name: 'Étincelle', points: 2 }
  ];
}
