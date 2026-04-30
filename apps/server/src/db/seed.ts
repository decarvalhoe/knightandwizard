import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import { createSqlClient } from './client.js';

export async function seedDatabase(): Promise<void> {
  const sql = createSqlClient();

  try {
    await sql.begin(async (tx) => {
      await tx`
        INSERT INTO catalog_documents (id, catalog_name, source_path, content_hash, document)
        VALUES (
          '00000000-0000-4000-8000-000000000001',
          'devlab',
          'data/catalogs/armes.yaml',
          '0000000000000000000000000000000000000000000000000000000000000001',
          ${tx.json({ seed: true, catalog: 'armes' })}::jsonb
        )
        ON CONFLICT (source_path) DO UPDATE SET
          catalog_name = EXCLUDED.catalog_name,
          content_hash = EXCLUDED.content_hash,
          document = EXCLUDED.document,
          updated_at = now()
      `;

      await tx`
        INSERT INTO game_sessions (id, slug, title, mode, status, metadata)
        VALUES (
          '00000000-0000-4000-8000-000000000002',
          'devlab-smoke-session',
          'Devlab Smoke Session',
          'classic_table',
          'planned',
          ${tx.json({ seed: true })}::jsonb
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          mode = EXCLUDED.mode,
          status = EXCLUDED.status,
          metadata = EXCLUDED.metadata,
          updated_at = now()
      `;
    });

    console.log('database seed complete');
  } finally {
    await sql.end({ timeout: 5 });
  }
}

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  seedDatabase().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
