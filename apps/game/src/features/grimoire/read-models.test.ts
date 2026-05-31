import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/catalogs', () => ({ getCatalogDocument: vi.fn() }));

import { buildGrimoireReadModel } from './read-models.js';

describe('buildGrimoireReadModel', () => {
  it('builds a searchable spell index from spells and magic schools', () => {
    const view = buildGrimoireReadModel({
      schools: {
        metadata: { source: 'data/legacy/web-scraped/documents/grimoire/index.md' },
        schools: [
          {
            color: 'jaune',
            domain: 'Anti-magie',
            id: 'abjuration',
            name: 'Abjuration',
            status: 'active'
          },
          {
            color: 'rouge',
            domain: 'Transformation',
            id: 'alteration',
            name: 'Altération',
            status: 'active'
          }
        ]
      },
      spells: {
        metadata: { source: 'data/legacy/web-scraped/documents/grimoire/index.md' },
        spells: [
          {
            difficulty: 5,
            effect: "Augmente l'énergie d'un sort",
            energy: 6,
            id: 'augmentation-energetique',
            incantation_time: 4,
            name: 'Augmentation énergétique',
            prose_refs: [{ catalog: 'lexique' }],
            school_id: 'abjuration',
            status: 'active',
            value: 12
          },
          {
            effect: 'Archive',
            id: 'archive',
            name: 'Archive',
            school_id: 'alteration',
            status: 'raw_reference_only'
          }
        ]
      }
    });

    expect(view.metrics).toEqual({
      lexiqueLinkedSpells: 1,
      schools: 2,
      spells: 1
    });
    expect(view.schoolSummaries).toEqual([
      {
        color: 'jaune',
        domain: 'Anti-magie',
        id: 'abjuration',
        name: 'Abjuration',
        spellCount: 1
      },
      {
        color: 'rouge',
        domain: 'Transformation',
        id: 'alteration',
        name: 'Altération',
        spellCount: 0
      }
    ]);
    expect(view.spells[0]).toMatchObject({
      id: 'augmentation-energetique',
      isLexiqueLinked: true,
      schoolName: 'Abjuration'
    });
    expect(view.sourceLabels).toEqual(['Grand Grimoire web']);
  });
});
