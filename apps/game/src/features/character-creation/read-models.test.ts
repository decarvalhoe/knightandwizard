import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/catalogs', () => ({ getCatalogDocument: vi.fn() }));

import { buildCharacterCreationCatalogFromReadModels } from './read-models.js';

describe('character creation read-models', () => {
  it('exposes catalog ambiguity counts instead of silently resolving them', () => {
    const catalog = buildCharacterCreationCatalogFromReadModels({
      classes: { classes: [] },
      orientations: { orientations: [] },
      potions: { potions: [] },
      protections: { metadata: { ambiguities_count: 4 }, armor_pieces: [], shields: [] },
      races: { races: [] },
      skills: { skills: [] },
      spells: { spells: [] },
      weapons: { metadata: { ambiguities_count: 8 }, weapons: [] }
    });

    expect(catalog.ambiguityNotices).toEqual([
      {
        catalogName: 'Armes',
        count: 8,
        sourcePath: 'data/catalogs/armes-ambiguites.md'
      },
      {
        catalogName: 'Protections',
        count: 4,
        sourcePath: 'data/catalogs/protections.yaml'
      }
    ]);
  });
});
