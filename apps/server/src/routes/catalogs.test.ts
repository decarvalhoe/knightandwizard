import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { PRIORITY_CATALOG_NAMES } from '@knightandwizard/catalogs';

import { buildApp } from '../app.js';
import { importCatalogDocuments } from '../catalogs/read-models.js';
import { createSqlClient } from '../db/client.js';
import { runMigrations } from '../db/migrate.js';

const app = buildApp({ logger: false });
const sql = createSqlClient();

beforeAll(async () => {
  await runMigrations();
  await importCatalogDocuments(sql);
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await sql.end({ timeout: 5 });
});

describe('catalog routes', () => {
  it('lists imported priority catalog read models for frontend clients', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalogs' });
    const body = response.json() as CatalogListResponse;

    expect(response.statusCode).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.catalogs.map((catalog) => catalog.catalogName).sort()).toEqual(
      [...PRIORITY_CATALOG_NAMES].sort()
    );
    expect(body.catalogs.find((catalog) => catalog.catalogName === 'spells.yaml')).toMatchObject({
      catalogName: 'spells.yaml',
      sourcePath: 'data/catalogs/spells.yaml'
    });
    expect(body.catalogs[0]?.contentHash).toMatch(/^[0-9a-f]{64}$/);
    expect(body.catalogs[0]?.importedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('returns inventory-ready equipment entries from canonical equipment catalogs', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalogs/equipment' });
    const body = response.json() as EquipmentCatalogResponse;

    expect(response.statusCode).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.sourceCatalogs.map((catalog) => catalog.catalogName).sort()).toEqual([
      'armes.yaml',
      'potions.yaml',
      'protections.yaml'
    ]);
    expect(body.totals).toEqual({
      armor: 59,
      consumables: 5,
      shields: 12,
      total: 183,
      weapons: 107
    });
    expect(body.equipment.find((entry) => entry.id === 'epee_batarde')).toMatchObject({
      category: 'weapon',
      damageFormula: 'F+6',
      difficulty: 8,
      id: 'epee_batarde',
      name: 'Épée bâtarde',
      sourceCatalog: 'armes.yaml',
      weightKg: 2.2
    });
    expect(body.equipment.find((entry) => entry.id === 'bouclier_bois')).toMatchObject({
      category: 'shield',
      id: 'bouclier_bois',
      name: 'Bouclier (bois)',
      passChancePct: 40,
      protection: { C: 1, E: 2, P: 2, T: 3 },
      sourceCatalog: 'protections.yaml',
      weightKg: 3
    });
    expect(body.equipment.find((entry) => entry.id === 'soin')).toMatchObject({
      category: 'consumable',
      craftDifficulty: 9,
      effect:
        'Restaure autant de points de vitalité que de réussites obtenues lors de la fabrication',
      id: 'soin',
      name: 'Potion de Soin',
      sourceCatalog: 'potions.yaml'
    });
  });

  it('returns a catalog document with canonical status and source refs intact', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalogs/spells.yaml' });
    const body = response.json() as CatalogDocumentResponse<{ spells: CatalogEntry[] }>;

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      status: 'found',
      catalog: {
        catalogName: 'spells.yaml',
        sourcePath: 'data/catalogs/spells.yaml'
      }
    });
    expect(body.catalog.contentHash).toMatch(/^[0-9a-f]{64}$/);
    expect(body.catalog.document.spells[0]).toMatchObject({
      status: 'active',
      source_refs: expect.arrayContaining([
        expect.objectContaining({ path: 'data/legacy/web-scraped/documents/grimoire/index.md' })
      ])
    });
  });

  it('documents invalid catalog name errors', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalogs/not-json' });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: {
        code: 'invalid_catalog_name',
        message: 'Catalog names must be lowercase YAML filenames.'
      },
      status: 'invalid'
    });
  });

  it('documents missing catalog read model errors', async () => {
    const response = await app.inject({ method: 'GET', url: '/catalogs/unknown.yaml' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: {
        code: 'catalog_not_imported',
        catalogName: 'unknown.yaml',
        message: 'Catalog read model is not imported.'
      },
      status: 'not_found'
    });
  });
});

interface CatalogListResponse {
  catalogs: CatalogSummary[];
  status: 'ok';
}

interface CatalogDocumentResponse<Document> {
  catalog: CatalogSummary & { document: Document };
  status: 'found';
}

interface CatalogSummary {
  catalogName: string;
  contentHash: string;
  importedAt: string;
  sourcePath: string;
  updatedAt: string;
}

interface CatalogEntry {
  source_refs?: Array<{ path?: string }>;
  status?: string;
}

interface EquipmentCatalogResponse {
  equipment: EquipmentEntry[];
  sourceCatalogs: CatalogSummary[];
  status: 'ok';
  totals: {
    armor: number;
    consumables: number;
    shields: number;
    total: number;
    weapons: number;
  };
}

interface EquipmentEntry {
  category: 'armor' | 'consumable' | 'shield' | 'weapon';
  craftDifficulty?: number;
  damageFormula?: string;
  difficulty?: number;
  effect?: string;
  id: string;
  name: string;
  passChancePct?: number;
  protection?: Record<string, number>;
  sourceCatalog: string;
  weightKg?: number;
}
