import { afterAll, describe, expect, it } from 'vitest';
import { createSqlClient } from './client.js';
import { REQUIRED_APP_TABLES } from './schema.js';

const sql = createSqlClient();

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
});
