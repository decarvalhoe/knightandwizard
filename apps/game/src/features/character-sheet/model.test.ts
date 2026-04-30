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
          id: 'wizard',
          name: 'Mage',
          orientationId: 'magician'
        },
        id: 'pc-converted-mage',
        name: 'Elaria',
        orientation: { id: 'magician', isMagical: true, name: 'Magicien' },
        race: {
          attributeMax: Object.fromEntries(
            ATTRIBUTE_KEYS.map((key) => [key, 6])
          ) as CharacterAttributes,
          category: 20,
          id: 'human',
          name: 'Humain',
          speedFactor: 8,
          vitality: 24,
          willFactor: 10
        },
        skills: [
          { id: 'arcana', points: 4 },
          { id: 'lore', points: 4 },
          { id: 'rituals', points: 2 }
        ],
        spells: [
          { id: 'ward', points: 2 },
          { id: 'spark', points: 1 }
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
    const character = createPlayerCharacter({
      attributes: {
        aestheticism: 1,
        charisma: 2,
        dexterity: 3,
        empathy: 2,
        intelligence: 2,
        perception: 0,
        reflexes: 2,
        stamina: 3,
        strength: 5
      },
      classProfile: {
        id: 'knight',
        name: 'Chevalier',
        orientationId: 'fighter',
        primarySkillIds: ['long-blades']
      },
      id: 'pc-blind',
      name: 'PJ aveugle',
      orientation: { id: 'fighter', name: 'Guerrier' },
      race: {
        attributeMax: Object.fromEntries(
          ATTRIBUTE_KEYS.map((key) => [key, 6])
        ) as CharacterAttributes,
        category: 20,
        id: 'human',
        name: 'Humain',
        speedFactor: 8,
        vitality: 24,
        willFactor: 10
      },
      skills: [
        { id: 'long-blades', isMain: true, points: 4 },
        { id: 'shield', points: 4 },
        { id: 'command', points: 4 },
        { id: 'endurance', points: 4 },
        { id: 'lore', points: 4 }
      ],
      spells: []
    });

    const result = rollAttributeCheck(character, 'perception', 7, () => {
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
      { id: 'long-blades', isMain: true, points: 4 },
      { id: 'riposte', parentId: 'long-blades', points: 3 },
      { id: 'counter-riposte', parentId: 'riposte', points: 2 },
      { id: 'cortegan-cuisine', parentId: 'unknown-parent', points: 1 },
      { id: 'command', points: 4 }
    ]);

    expect(
      rows.map((row) => [row.id, row.depth, row.isInheritedPrimary, row.implicitParentId])
    ).toEqual([
      ['long-blades', 0, false, undefined],
      ['riposte', 1, true, undefined],
      ['counter-riposte', 2, true, undefined],
      ['cortegan-cuisine', 0, false, 'unknown-parent'],
      ['command', 0, false, undefined]
    ]);
  });

  it('treats every unlisted skill or specialization as an implicit zero score', () => {
    const character = sampleCharacter();

    expect(skillPoints(character.skills, 'long-blades')).toBe(4);
    expect(skillPoints(character.skills, 'unlisted-specialization')).toBe(0);
  });

  it('overlays character points on a full implicit-zero skill catalog', () => {
    const rows = skillTreeRows(
      [{ id: 'cortegan-cuisine', parentId: 'cuisine', points: 2 }],
      [
        { id: 'long-blades', label: 'Armes longues' },
        { id: 'cuisine', label: 'Cuisine' },
        { id: 'cortegan-cuisine', label: 'Cuisine corteganne', parentId: 'cuisine' },
        { id: 'court-cuisine', label: 'Cuisine de cour', parentId: 'cuisine' }
      ]
    );

    expect(
      rows.map((row) => [row.id, row.points, row.depth, row.isImplicitZero, row.label])
    ).toEqual([
      ['long-blades', 0, 0, true, 'Armes longues'],
      ['cuisine', 0, 0, true, 'Cuisine'],
      ['cortegan-cuisine', 2, 1, false, 'Cuisine corteganne'],
      ['court-cuisine', 0, 1, true, 'Cuisine de cour']
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
      id: 'knight',
      name: 'Chevalier',
      orientationId: 'fighter',
      primarySkillIds: ['long-blades']
    },
    id: 'pc-aveline',
    modifiers: [{ id: 'training', target: 'strength', value: 2 }],
    name: 'Aveline de Brumeval',
    orientation: { id: 'fighter', name: 'Guerrier' },
    race: {
      attributeMax: Object.fromEntries(
        ATTRIBUTE_KEYS.map((key) => [key, 6])
      ) as CharacterAttributes,
      category: 20,
      id: 'human',
      name: 'Humain',
      speedFactor: 8,
      vitality: 24,
      willFactor: 10
    },
    skills: [
      { id: 'long-blades', isMain: true, points: 4 },
      { id: 'shield', points: 4 },
      { id: 'command', points: 4 },
      { id: 'endurance', points: 4 },
      { id: 'lore', points: 4 }
    ],
    spells: []
  });
}

function sampleMagicianCharacter(): Character {
  return createPlayerCharacter({
    attributes: sampleAttributes(),
    classProfile: {
      id: 'wizard',
      name: 'Mage',
      orientationId: 'magician'
    },
    id: 'pc-mire',
    name: 'Mire de Brumeval',
    orientation: { id: 'magician', isMagical: true, name: 'Magicien' },
    race: {
      attributeMax: Object.fromEntries(
        ATTRIBUTE_KEYS.map((key) => [key, 6])
      ) as CharacterAttributes,
      category: 20,
      id: 'human',
      name: 'Humain',
      speedFactor: 8,
      vitality: 24,
      willFactor: 10
    },
    skills: [
      { id: 'arcana', isMain: true, points: 4 },
      { id: 'rituals', points: 4 },
      { id: 'lore', points: 4 },
      { id: 'medicine', points: 4 },
      { id: 'diplomacy', points: 4 }
    ],
    spells: [
      { id: 'ward', points: 1 },
      { id: 'spark', points: 1 }
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
    { active: true, id: 'ward', name: 'Garde mystique', points: 1 },
    { active: false, id: 'spark', name: 'Étincelle', points: 2 }
  ];
}
