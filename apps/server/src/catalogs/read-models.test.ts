import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { PRIORITY_CATALOG_NAMES } from '@knightandwizard/catalogs';

import { createSqlClient } from '../db/client.js';
import { runMigrations } from '../db/migrate.js';
import { buildCatalogDocumentReadModels, upsertCatalogDocuments } from './read-models.js';

const sql = createSqlClient();

beforeAll(async () => {
  await runMigrations();
  await sql`DELETE FROM catalog_documents WHERE source_path LIKE 'data/catalogs/%'`;
});

afterAll(async () => {
  await sql.end({ timeout: 5 });
});

describe('catalog document read models', () => {
  it('builds one hashed read model per priority catalog with traced entries', async () => {
    const documents = await buildCatalogDocumentReadModels();
    const byName = new Map(documents.map((document) => [document.catalogName, document]));
    const spells = byName.get('spells.yaml')?.document as
      | { spells?: Array<{ source_refs?: unknown[]; status?: string }> }
      | undefined;

    expect(documents.map((document) => document.catalogName).sort()).toEqual(
      [...PRIORITY_CATALOG_NAMES].sort()
    );
    expect(byName.get('spells.yaml')?.contentHash).toMatch(/^[0-9a-f]{64}$/);
    expect(spells?.spells?.[0]).toMatchObject({
      status: 'active',
      source_refs: expect.arrayContaining([
        expect.objectContaining({ path: 'data/legacy/web-scraped/documents/grimoire/index.md' })
      ])
    });
  });

  it('upserts priority catalogs into catalog_documents with status, source refs and hash', async () => {
    const documents = await buildCatalogDocumentReadModels();
    const imported = await upsertCatalogDocuments(sql, documents);

    const countRows = await sql<{ count: string }[]>`
      SELECT count(*)::text AS count
      FROM catalog_documents
      WHERE source_path LIKE 'data/catalogs/%'
    `;
    const spellRows = await sql<
      Array<{
        catalog_name: string;
        content_hash: string;
        source_ref_path: string;
        status: string;
      }>
    >`
      SELECT
        catalog_name,
        content_hash,
        document #>> '{spells,0,status}' AS status,
        document #>> '{spells,0,source_refs,0,path}' AS source_ref_path
      FROM catalog_documents
      WHERE source_path = 'data/catalogs/spells.yaml'
    `;

    expect(imported).toBe(PRIORITY_CATALOG_NAMES.length);
    expect(Number(countRows[0]?.count)).toBe(PRIORITY_CATALOG_NAMES.length);
    expect(spellRows[0]).toMatchObject({
      catalog_name: 'spells.yaml',
      status: 'active',
      source_ref_path: 'data/legacy/web-scraped/documents/grimoire/index.md'
    });
    expect(spellRows[0]?.content_hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
