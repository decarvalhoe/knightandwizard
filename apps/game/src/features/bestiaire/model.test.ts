import { describe, expect, it } from 'vitest';

import { buildBestiarySurfaceView, type BestiaryCatalogDocument } from './model';

describe('bestiaire surface view model', () => {
  it('keeps active canonical species in source order and derives cabinet metrics', () => {
    const view = buildBestiarySurfaceView({
      metadata: {
        source_files: [
          { path: 'data/legacy/web-scraped/documents/bestiaire/index.md' },
          { path: 'data/legacy/paper/regles-papier/extracted/listes/bestiaire.md' }
        ]
      },
      creatures: [
        creature({
          id: 'humain',
          name: 'Humain, -e',
          category: 'humanoid',
          playable: true
        }),
        creature({
          id: 'griffon',
          name: 'Griffon',
          category: 'beast',
          language_capable: false,
          playable: false
        }),
        creature({
          id: 'archive',
          name: 'Archive',
          status: 'raw_reference_only'
        })
      ]
    });

    expect(view.metrics).toEqual({
      activeEntries: 2,
      categories: 2,
      nonPlayableEntries: 1,
      playableEntries: 1
    });
    expect(view.entries.map((entry) => entry.name)).toEqual(['Humain', 'Griffon']);
    expect(view.entries[0]).toMatchObject({
      category: 'humanoid',
      categoryLabel: 'Humanoïdes',
      languageLabel: 'Langage articule',
      lifeExpectancyLabel: '75 ans',
      playableLabel: 'Race jouable',
      sourceName: 'Humain, -e'
    });
    expect(view.entries[1]).toMatchObject({
      languageLabel: 'Non verbal',
      playableLabel: 'Creature MJ'
    });
    expect(view.categorySummaries).toEqual([
      { category: 'beast', count: 1, label: 'Bêtes' },
      { category: 'humanoid', count: 1, label: 'Humanoïdes' }
    ]);
    expect(view.sourceFiles).toEqual([
      {
        label: 'Bestiaire web',
        path: 'data/legacy/web-scraped/documents/bestiaire/index.md'
      },
      {
        label: 'Bestiaire papier',
        path: 'data/legacy/paper/regles-papier/extracted/listes/bestiaire.md'
      }
    ]);
  });

  it('formats immortal life expectancy and preserves listed innate traits', () => {
    const view = buildBestiarySurfaceView({
      creatures: [
        creature({
          innate_atouts: ['Vision nocturne'],
          innate_handicaps: ['Peur du soleil'],
          life_expectancy: -1,
          resistances: [{ type: 'alcool', value: 30 }]
        })
      ]
    });

    expect(view.entries[0]).toMatchObject({
      innateAtouts: ['Vision nocturne'],
      innateHandicaps: ['Peur du soleil'],
      lifeExpectancyLabel: 'Immortel',
      resistanceLabels: ['alcool 30']
    });
  });
});

function creature(
  overrides: Partial<BestiaryCatalogDocument['creatures'][number]> = {}
): BestiaryCatalogDocument['creatures'][number] {
  return {
    attribute_max: {
      aestheticism: 5,
      charisma: 5,
      dexterity: 5,
      empathy: 5,
      intelligence: 5,
      perception: 5,
      reflexes: 5,
      stamina: 5,
      strength: 5
    },
    category: 'humanoid',
    habitat: ['Empire'],
    id: 'haut_elfe',
    innate_atouts: [],
    innate_handicaps: [],
    language_capable: true,
    life_expectancy: 75,
    lore: 'Notice canonique.',
    name: 'Haut-elfe, -',
    playable: true,
    resistances: [],
    size_m: 1.9,
    social_structure: 'civilized',
    speed_factor_base: 7,
    status: 'active',
    vitality_base: 15,
    will_factor_base: 10,
    xp_category: 20,
    ...overrides
  };
}
