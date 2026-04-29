import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import { createSqlClient } from './client.js';

const TABLES_TO_DROP = [
  'session_events',
  'audit_events',
  'knowledge_chunks',
  'knowledge_documents',
  'game_sessions',
  'catalog_documents',
  'kw_migrations'
] as const;

export async function resetDatabase(): Promise<void> {
  const sql = createSqlClient();

  try {
    await sql.begin(async (tx) => {
      for (const tableName of TABLES_TO_DROP) {
        await tx.unsafe(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
      }
    });

    console.log('database reset complete');
  } finally {
    await sql.end({ timeout: 5 });
  }
}

const isEntrypoint = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  resetDatabase().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
