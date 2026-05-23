import type { Payload } from 'payload';
import { describe, expect, it, vi } from 'vitest';

import {
  buildCatalogImportPlan,
  buildCatalogYamlRoundTripDocuments,
  exportCatalogRoundTripYaml,
  importCatalogs,
  summarizePlan,
  verifyCatalogImport
} from './import-catalogs.js';

describe('catalog import plan', () => {
  it('builds an idempotent Payload import plan from canonical sources', async () => {
    const plan = await buildCatalogImportPlan();
    const summary = summarizePlan(plan);

    expect(summary.weapons).toBe(107);
    expect(summary.bestiary).toBe(31);
    expect(summary.races).toBe(31);
    expect(summary.protections).toBe(71);
    expect(summary.potions).toBe(5);
    expect(summary.nations).toBe(29);
    expect(summary.organisations).toBe(7);
    expect(summary.religions).toBe(15);
    expect(summary.orientations).toBe(13);
    expect(summary['skill-families']).toBe(10);
    expect(summary.skills).toBe(368);
    expect(summary['character-classes']).toBe(91);
    expect(summary['magic-schools']).toBe(11);
    expect(summary.spells).toBe(324);
    expect(summary.assets).toBe(802);
    expect(summary['level-assets']).toBe(300);
    expect(summary.rules).toBe(13);
    expect(plan.ambiguityFiles).toContain('armes-ambiguites.md');

    const keys = plan.entries.map((entry) => entry.collection + ':' + entry.data.canonicalId);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('preserves catalog status and exact source refs for editable CMS documents', async () => {
    const plan = await buildCatalogImportPlan();
    const spell = findEntry(plan, 'spells', 'annihilation');
    const school = findEntry(plan, 'magic-schools', 'abjuration');
    const levelAsset = findEntry(plan, 'level-assets', 'niveau-2-agitateur-voyageur-berzerker');

    expect(spell?.data).toMatchObject({
      energyCost: 169,
      magicSchoolCanonicalId: 'abjuration',
      status: 'active'
    });
    expect(spell?.data.sourceRefs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'legacy_source',
          path: 'data/legacy/web-scraped/documents/grimoire/index.md',
          ref: 'entry:annihilation',
          sha256: expect.stringMatching(/^[0-9a-f]{64}$/)
        })
      ])
    );
    expect(school?.data).toMatchObject({
      color: 'jaune',
      specialistClassCanonicalId: 'abjurateur',
      status: 'active'
    });
    expect(levelAsset?.data).toMatchObject({
      assetCanonicalId: 'niveau-2-agitateur-voyageur-berzerker',
      characterClassName: 'Berzerker',
      level: 2,
      orientationName: 'Voyageur',
      status: 'active'
    });
  });

  it('exports a YAML round-trip document with raw source status and refs intact', async () => {
    const plan = await buildCatalogImportPlan();
    const documents = buildCatalogYamlRoundTripDocuments(plan);
    const spells = documents.find((document) => document.catalogName === 'spells.yaml');
    const yamlByCatalog = exportCatalogRoundTripYaml(plan);

    expect(spells?.entries).toHaveLength(324);
    expect(spells?.entries[0]).toMatchObject({
      canonicalId: 'annihilation',
      collection: 'spells',
      status: 'active'
    });
    expect(yamlByCatalog['spells.yaml']).toContain('ref: entry:annihilation');
    expect(yamlByCatalog['spells.yaml']).toContain('status: active');
    expect(yamlByCatalog['spells.yaml']).toContain(
      'sha256: 46e9ee82c1f468eb68efabe8030828b9784fad4cda6cc3664a4564667e10a200'
    );
  });

  it('upserts documents by canonicalId without creating duplicates', async () => {
    const payload = mockPayload({
      find: vi.fn().mockResolvedValue({
        docs: [{ canonicalId: 'longsword', id: 42 }]
      })
    });
    const plan = {
      ambiguityFiles: [],
      entries: [
        { collection: 'weapons' as const, data: { canonicalId: 'longsword', name: 'Longsword' } },
        { collection: 'weapons' as const, data: { canonicalId: 'dagger', name: 'Dagger' } }
      ]
    };

    await expect(importCatalogs(payload, plan)).resolves.toEqual({
      created: 1,
      dryRun: 0,
      updated: 1
    });

    expect(payload.find).toHaveBeenCalledTimes(1);
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'weapons',
        id: 42
      })
    );
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'weapons',
        data: expect.objectContaining({ canonicalId: 'dagger' })
      })
    );
  });

  it('does not touch Payload during dry runs', async () => {
    const payload = mockPayload();
    const plan = {
      ambiguityFiles: [],
      entries: [
        { collection: 'potions' as const, data: { canonicalId: 'healing', name: 'Healing' } }
      ]
    };

    await expect(importCatalogs(payload, plan, { dryRun: true })).resolves.toEqual({
      created: 0,
      dryRun: 1,
      updated: 0
    });

    expect(payload.find).not.toHaveBeenCalled();
    expect(payload.create).not.toHaveBeenCalled();
    expect(payload.update).not.toHaveBeenCalled();
  });

  it('reports missing documents during post-import verification', async () => {
    const payload = mockPayload({
      find: vi.fn().mockResolvedValue({
        docs: [{ canonicalId: 'healing', id: 7 }]
      })
    });
    const plan = {
      ambiguityFiles: [],
      entries: [
        { collection: 'potions' as const, data: { canonicalId: 'healing', name: 'Healing' } },
        { collection: 'potions' as const, data: { canonicalId: 'mana', name: 'Mana' } }
      ]
    };

    await expect(verifyCatalogImport(payload, plan)).rejects.toThrow('potions:mana');
  });
});

type TestPlan = Awaited<ReturnType<typeof buildCatalogImportPlan>>;

function findEntry(plan: TestPlan, collection: string, canonicalId: string) {
  return plan.entries.find(
    (entry) => entry.collection === collection && entry.data.canonicalId === canonicalId
  );
}

function mockPayload(overrides: Partial<Payload> = {}): Payload {
  return {
    create: vi.fn(),
    find: vi.fn().mockResolvedValue({ docs: [] }),
    update: vi.fn(),
    ...overrides
  } as unknown as Payload;
}
