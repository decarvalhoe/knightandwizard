import { describe, expect, it } from 'vitest';

import {
  CatalogValidationError,
  PRIORITY_CATALOG_NAMES,
  loadValidatedCatalog,
  loadValidatedCatalogs,
  validateCatalogData
} from './schemas.js';

const expectedCollections = [
  ['armes.yaml', 'weapons', 107],
  ['bestiaire.yaml', 'creatures', 30],
  ['protections.yaml', 'armor_pieces', 59],
  ['protections.yaml', 'shields', 12],
  ['potions.yaml', 'potions', 5],
  ['nations.yaml', 'regions', 29],
  ['organisations.yaml', 'factions', 7],
  ['religions.yaml', 'religions', 15],
  ['competences.yaml', 'skills', 368]
] as const;

describe('catalog Zod schemas', () => {
  it.each(expectedCollections)(
    'validates %s %s against the canonical YAML',
    async (file, key, count) => {
      const catalog = await loadValidatedCatalog(file);
      const collection = catalog[key];

      expect(Array.isArray(collection)).toBe(true);
      expect(collection).toHaveLength(count);
    }
  );

  it('loads all priority catalogs with their typed schemas', async () => {
    const catalogs = await loadValidatedCatalogs();

    expect(Object.keys(catalogs).sort()).toEqual([...PRIORITY_CATALOG_NAMES].sort());
    expect(catalogs['armes.yaml'].weapons[0].name).toBe('Arbalète à cry');
    expect(catalogs['nations.yaml'].regions[0].id).toBe('aderand');
  });

  it('groups skills under the 10 canonical families and resolves explicit parents', async () => {
    const catalog = await loadValidatedCatalog('competences.yaml');
    const families = new Set(catalog.skills.map((skill) => skill.family));

    expect(families).toEqual(
      new Set([
        'art',
        'artisanat',
        'combat',
        'connaissance',
        'jeu',
        'maitrise-de-soi',
        'savoir-faire',
        'sens',
        'social',
        'sport'
      ])
    );

    const ids = new Set(catalog.skills.map((skill) => skill.id));
    for (const skill of catalog.skills) {
      if (skill.parent_id != null) {
        expect(ids.has(skill.parent_id)).toBe(true);
      }
    }

    expect(ids.has('bouclier')).toBe(true);
    expect(ids.has('arcanologie')).toBe(true);
    expect(ids.has('long-blades')).toBe(false);
    expect(ids.has('shield')).toBe(false);
  });

  it('exposes specializations with an explicit parent reference', async () => {
    const catalog = await loadValidatedCatalog('competences.yaml');
    const tirGorge = catalog.skills.find((skill) => skill.id === 'tir-dans-la-gorge');

    expect(tirGorge).toBeDefined();
    expect(tirGorge?.parent_id).toBe('arc-long');
    expect(tirGorge?.family).toBe('combat');
  });

  it('reports the file and data path when validation fails', () => {
    const validate = () =>
      validateCatalogData(
        'armes.yaml',
        {
          version: 1,
          metadata: {
            source: 'test',
            imported_at: '2026-04-29',
            total_entries: 1
          },
          weapons: [{ id: 'broken_weapon' }]
        },
        'fixtures/armes.yaml'
      );

    expect(validate).toThrow(CatalogValidationError);

    try {
      validate();
    } catch (error) {
      expect(error).toBeInstanceOf(CatalogValidationError);
      expect((error as Error).message).toContain('fixtures/armes.yaml');
      expect((error as Error).message).toContain('weapons.0.name');
    }
  });
});
