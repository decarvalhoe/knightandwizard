import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createSqlClient } from './client.js';
import { runMigrations } from './migrate.js';
import { REQUIRED_APP_TABLES } from './schema.js';

const sql = createSqlClient();

beforeAll(async () => {
  await runMigrations();
});

afterAll(async () => {
  await sql.end({ timeout: 5 });
});

describe('database schema', () => {
  it('has pgvector enabled', async () => {
    const rows = await sql<{ extname: string }[]>`
      SELECT extname FROM pg_extension WHERE extname = 'vector'
    `;

    expect(rows).toEqual([{ extname: 'vector' }]);
  });

  it('has the initial app-owned tables', async () => {
    const rows = await sql<{ table_name: string }[]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;
    const tables = new Set(rows.map((row) => row.table_name));

    for (const tableName of REQUIRED_APP_TABLES) {
      expect(tables.has(tableName), `${tableName} should exist`).toBe(true);
    }
  });

  it('stores knowledge source metadata columns', async () => {
    const rows = await sql<{ table_name: string; column_name: string }[]>`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('knowledge_documents', 'knowledge_chunks')
        AND column_name = 'metadata'
    `;

    expect(rows.map((row) => row.table_name).sort()).toEqual([
      'knowledge_chunks',
      'knowledge_documents'
    ]);
  });
});
