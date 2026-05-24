import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/catalogs', () => ({ getCatalogDocument: vi.fn() }));

import { buildAtoutsCompanionView } from './read-models.js';

describe('buildAtoutsCompanionView', () => {
  it('summarizes atouts and competences from catalog entries', () => {
    const view = buildAtoutsCompanionView({
      atouts: {
        atouts: [
          {
            activation: 'permanent',
            effect: 'Annule les penalites de mauvaise main.',
            id: 'ambidextrie',
            name: 'Ambidextrie',
            scope: 'neutre',
            status: 'active',
            value: 2000
          },
          {
            activation: 'ephemere',
            effect: 'Augmente le combat pendant la scene.',
            id: 'adrenaline',
            name: 'Adrenaline',
            scope: 'neutre',
            status: 'active',
            value: 2000
          },
          {
            activation: 'unknown',
            effect: 'Relation brute issue des races.',
            id: 'race-innate-anti-limites-physiques',
            name: 'Anti-limites physiques',
            scope: 'race',
            status: 'raw_reference_only',
            value: null
          }
        ]
      },
      skills: {
        skills: [
          {
            family: 'combat',
            family_name: 'Combat',
            id: 'archerie',
            name: 'Archerie',
            parent_id: null,
            status: 'active'
          },
          {
            family: 'survie',
            family_name: 'Survie',
            id: 'cartographie',
            name: 'Cartographie',
            parent_id: null,
            status: 'active'
          }
        ]
      }
    });

    expect(view.stats).toEqual({
      activeAtouts: 2,
      atoutTotal: 3,
      ephemereAtouts: 1,
      families: 2,
      permanentAtouts: 1,
      rawReferenceAtouts: 1,
      skillTotal: 2
    });
    expect(view.highlightAtouts.map((atout) => atout.id)).toEqual(['ambidextrie', 'adrenaline']);
    expect(view.skillFamilies).toEqual([
      { family: 'combat', label: 'Combat', total: 1 },
      { family: 'survie', label: 'Survie', total: 1 }
    ]);
  });
});
