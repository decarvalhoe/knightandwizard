import { describe, expect, it } from 'vitest';

import { ATTRIBUTE_KEYS, type CharacterAttributes } from '@knightandwizard/rules-core';

import {
  buildCreationView,
  createCreationDraft,
  fromDraftSnapshot,
  previewCharacter,
  setAttributePoints,
  setExtraSpellPoints,
  setSkillPoints,
  setSpellPoints,
  toDraftSnapshot,
  type CharacterCreationCatalog,
  type CharacterCreationDraft
} from './model.js';

describe('character creation wizard model', () => {
  it('filters class choices and automatic assets from the selected race/orientation/class', () => {
    const draft = createCreationDraft(catalog(), {
      classId: 'enchanteur',
      orientationId: 'magicien',
      raceId: 'humain'
    });
    const view = buildCreationView(draft, catalog());

    expect(view.availableClasses.map((classProfile) => classProfile.id)).toEqual([
      'enchanteur',
      'devin'
    ]);
    expect(view.grantedAssets.map((asset) => asset.id)).toEqual([
      'human-adaptability',
      'arcane-spark',
      'weapon-bond',
      'spell-focus'
    ]);
  });

  it('validates magician spell conversion against the skill and spell budgets', () => {
    const draft = withAttributes(
      setSpellPoints(
        setSpellPoints(
          setSkillPoints(
            setSkillPoints(
              setSkillPoints(
                setExtraSpellPoints(
                  createCreationDraft(catalog(), {
                    classId: 'enchanteur',
                    orientationId: 'magicien',
                    raceId: 'humain'
                  }),
                  1
                ),
                'arcanologie',
                4
              ),
              'histoire',
              4
            ),
            'arcanologie-des-rituels',
            2,
            'arcanologie'
          ),
          'spark',
          2
        ),
        'ward',
        1
      )
    );
    const view = buildCreationView(draft, catalog());

    expect(view.skillBudget).toEqual({
      convertedToSpells: 10,
      limit: 10,
      spent: 10
    });
    expect(view.spellBudget).toEqual({
      extraPoints: 1,
      freePoints: 2,
      requiredPoints: 3,
      spent: 3
    });
    expect(view.stepValidations.skills.valid).toBe(true);
    expect(view.stepValidations.spells.valid).toBe(true);

    const overSpent = setSkillPoints(draft, 'arcanologie-des-rituels', 3, 'arcanologie');
    const overSpentView = buildCreationView(overSpent, catalog());

    expect(overSpentView.stepValidations.skills.valid).toBe(false);
    expect(overSpentView.stepValidations.skills.errors).toContain(
      'skill points must total 10 at creation'
    );
  });

  it('builds a final character preview with resources, metadata, equipment, and granted assets', () => {
    const draft = completedMageDraft();
    const view = buildCreationView(draft, catalog());
    const character = previewCharacter(draft, catalog());

    expect(view.canSubmit).toBe(true);
    expect(character).toMatchObject({
      id: 'draft-aveline',
      name: 'Aveline',
      energy: { current: 60, max: 60 },
      equipment: [{ id: 'apprentice-kit', quantity: 1 }],
      metadata: {
        assets: ['human-adaptability', 'arcane-spark', 'weapon-bond', 'spell-focus'],
        background: 'Formee dans une tour frontaliere.',
        deity: 'Les Trois Flammes',
        psychology: 'calme',
        quote: 'Le mot engage.'
      },
      spells: [
        { id: 'spark', points: 2 },
        { id: 'ward', points: 1 }
      ]
    });
  });

  it('serializes a draft snapshot for localStorage/API persistence without embedding catalogs', () => {
    const draft = {
      ...completedMageDraft(),
      currentStep: 'skills'
    } satisfies CharacterCreationDraft;

    const snapshot = toDraftSnapshot(draft);
    const restored = fromDraftSnapshot(snapshot);

    expect(snapshot).toEqual({
      currentStep: 'skills',
      id: 'draft-aveline',
      payload: expect.objectContaining({
        classId: 'enchanteur',
        name: 'Aveline',
        raceId: 'humain'
      }),
      updatedAt: expect.any(String)
    });
    expect(JSON.stringify(snapshot)).not.toContain('attributeMax');
    expect(restored).toMatchObject({
      classId: 'enchanteur',
      currentStep: 'skills',
      id: 'draft-aveline',
      name: 'Aveline',
      raceId: 'humain'
    });
  });
});

function completedMageDraft(): CharacterCreationDraft {
  return {
    ...withAttributes(
      setSpellPoints(
        setSpellPoints(
          setSkillPoints(
            setSkillPoints(
              setSkillPoints(
                setExtraSpellPoints(
                  createCreationDraft(catalog(), {
                    classId: 'enchanteur',
                    id: 'draft-aveline',
                    name: 'Aveline',
                    orientationId: 'magicien',
                    raceId: 'humain'
                  }),
                  1
                ),
                'arcanologie',
                4
              ),
              'histoire',
              4
            ),
            'arcanologie-des-rituels',
            2,
            'arcanologie'
          ),
          'spark',
          2
        ),
        'ward',
        1
      )
    ),
    background: 'Formee dans une tour frontaliere.',
    deity: 'Les Trois Flammes',
    equipmentIds: ['apprentice-kit'],
    psychology: 'calme',
    quote: 'Le mot engage.'
  };
}

function withAttributes(draft: CharacterCreationDraft): CharacterCreationDraft {
  return ATTRIBUTE_KEYS.reduce(
    (nextDraft, attribute) =>
      setAttributePoints(nextDraft, attribute, validAttributes()[attribute]),
    draft
  );
}

function validAttributes(): CharacterAttributes {
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

function catalog(): CharacterCreationCatalog {
  const humanMax = Object.fromEntries(ATTRIBUTE_KEYS.map((key) => [key, 6])) as CharacterAttributes;

  return {
    assets: [
      {
        id: 'human-adaptability',
        label: 'Adaptabilite humaine',
        raceIds: ['humain'],
        source: 'race'
      },
      {
        id: 'elven-grace',
        label: 'Grace elfique',
        raceIds: ['haut_elfe'],
        source: 'race'
      },
      {
        id: 'arcane-spark',
        label: 'Etincelle arcanique',
        orientationIds: ['magicien'],
        source: 'orientation'
      },
      {
        classIds: ['enchanteur'],
        id: 'weapon-bond',
        label: 'Lien de lame',
        source: 'class'
      },
      {
        classIds: ['enchanteur'],
        id: 'spell-focus',
        label: 'Focaliseur',
        source: 'class'
      },
      {
        classIds: ['garde'],
        id: 'shield-line',
        label: 'Ligne de bouclier',
        source: 'class'
      }
    ],
    classes: [
      {
        id: 'garde',
        name: 'Garde',
        orientationId: 'guerrier',
        primarySkillIds: ['epee-batarde']
      },
      {
        id: 'enchanteur',
        name: "Mage d'armes",
        orientationId: 'magicien',
        primarySkillIds: []
      },
      {
        id: 'devin',
        name: 'Mage erudit',
        orientationId: 'magicien',
        primarySkillIds: []
      }
    ],
    equipment: [
      {
        id: 'apprentice-kit',
        name: "Trousse d'apprenti"
      }
    ],
    orientations: [
      { id: 'guerrier', isMagical: false, name: 'Guerrier' },
      { id: 'magicien', isMagical: true, name: 'Magicien' }
    ],
    races: [
      {
        attributeMax: humanMax,
        category: 20,
        id: 'humain',
        name: 'Humain',
        speedFactor: 8,
        vitality: 24,
        willFactor: 10
      },
      {
        attributeMax: humanMax,
        category: 18,
        id: 'haut_elfe',
        name: 'Elfe',
        speedFactor: 7,
        vitality: 20,
        willFactor: 11
      }
    ],
    skills: [
      { id: 'arcanologie', label: 'Arcanologie' },
      { id: 'arcanologie-des-rituels', label: 'Arcanologie des rituels', parentId: 'arcanologie' },
      { id: 'histoire', label: 'Histoire' },
      { id: 'epee-batarde', label: 'Épée bâtarde' }
    ],
    spells: [
      { id: 'spark', label: 'Etincelle' },
      { id: 'ward', label: 'Garde' }
    ]
  };
}
