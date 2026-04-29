import type { Payload } from 'payload';
import { describe, expect, it, vi } from 'vitest';

import {
  buildCatalogImportPlan,
  importCatalogs,
  summarizePlan,
  verifyCatalogImport
} from './import-catalogs.js';

describe('catalog import plan', () => {
  it('builds an idempotent Payload import plan from canonical sources', async () => {
    const plan = await buildCatalogImportPlan();
    const summary = summarizePlan(plan);

    expect(summary.weapons).toBe(107);
    expect(summary.bestiary).toBe(30);
    expect(summary.protections).toBe(71);
    expect(summary.potions).toBe(5);
    expect(summary.nations).toBe(29);
    expect(summary.organisations).toBe(7);
    expect(summary.religions).toBe(15);
    expect(summary.assets).toBeGreaterThan(400);
    expect(summary.rules).toBe(13);
    expect(plan.ambiguityFiles).toContain('armes-ambiguites.md');

    const keys = plan.entries.map((entry) => `${entry.collection}:${entry.data.canonicalId}`);
    expect(new Set(keys).size).toBe(keys.length);
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

function mockPayload(overrides: Partial<Payload> = {}): Payload {
  return {
    create: vi.fn(),
    find: vi.fn().mockResolvedValue({ docs: [] }),
    update: vi.fn(),
    ...overrides
  } as unknown as Payload;
}
