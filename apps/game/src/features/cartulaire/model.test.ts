import { describe, expect, it } from 'vitest';

import { buildCartulaireReadModel } from './model';

describe('cartulaire read model', () => {
  it('binds vector regions to canonical nations and heraldic emaux', () => {
    const readModel = buildCartulaireReadModel({
      cities: {
        features: [
          {
            geometry: { coordinates: [65, 55], type: 'Point' },
            properties: {
              id: 'erune',
              name: 'Erune',
              parent_region: 'alteria',
              role: 'capital'
            },
            type: 'Feature'
          }
        ],
        type: 'FeatureCollection'
      },
      nations: {
        metadata: { total_entries: 2 },
        regions: [
          {
            blason: { colors: ['or'], symbols: ['balance_or'] },
            capital: 'Erune',
            category: 'nation',
            id: 'alteria',
            metadata: { source: 'paper', version: 1 },
            name: 'Alteria',
            population: { total: 6500000 },
            surface_km2: 240000
          },
          {
            blason: { colors: ['rouge', 'bleu', 'blanc'], symbols: ['fontaine_oracle'] },
            capital: 'Cortega',
            category: 'nation',
            id: 'cortega',
            metadata: { source: 'paper', version: 1 },
            name: 'Cortega',
            population: { total: 9000000 },
            surface_km2: 370000
          }
        ],
        version: 2
      },
      regions: {
        features: [
          {
            geometry: {
              coordinates: [
                [
                  [57.5, 49],
                  [72.5, 49],
                  [72.5, 61],
                  [57.5, 61],
                  [57.5, 49]
                ]
              ],
              type: 'Polygon'
            },
            properties: {
              category: 'nation',
              id: 'alteria',
              name: 'Alteria',
              regional_map: '/maps/alteria.jpg'
            },
            type: 'Feature'
          }
        ],
        type: 'FeatureCollection'
      }
    });

    expect(readModel.summary).toEqual({
      cities: 1,
      nations: 2,
      totalPopulation: 15500000,
      vectorRegions: 1
    });
    expect(readModel.regions).toEqual([
      expect.objectContaining({
        capital: 'Erune',
        emaux: ['or'],
        id: 'alteria',
        mapPath: 'M 57.5 51 L 72.5 51 L 72.5 39 L 57.5 39 L 57.5 51 Z',
        name: 'Alteria',
        population: 6500000
      })
    ]);
    expect(readModel.emauxByNation).toEqual([
      expect.objectContaining({ emaux: ['or'], id: 'alteria' }),
      expect.objectContaining({ emaux: ['gueules', 'azur'], id: 'cortega' })
    ]);
  });
});
