import 'dotenv/config';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createSqlClient } from './client.js';

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '../../drizzle');

export async function runMigrations(): Promise<void> {
  const sql = createSqlClient();

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS kw_migrations (
        id text PRIMARY KEY,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `;

    await sql`SELECT pg_advisory_lock(hashtext('kw_migrations'))`;

    try {
      const migrationFiles = (await readdir(migrationsDir))
        .filter((fileName) => fileName.endsWith('.sql'))
        .sort();

      for (const fileName of migrationFiles) {
        const content = await readFile(join(migrationsDir, fileName), 'utf8');
        const checksum = createHash('sha256').update(content).digest('hex');
        const existing = await sql<{ checksum: string }[]>`
          SELECT checksum FROM kw_migrations WHERE id = ${fileName}
        `;

        if (existing.length > 0) {
          if (existing[0]?.checksum !== checksum) {
            throw new Error(`Migration ${fileName} checksum mismatch`);
          }

          continue;
        }

        await sql.begin(async (tx) => {
          await tx.unsafe(content);
          await tx`
            INSERT INTO kw_migrations (id, checksum)
            VALUES (${fileName}, ${checksum})
          `;
        });

        console.log(`applied migration ${fileName}`);
      }
    } finally {
      await sql`SELECT pg_advisory_unlock(hashtext('kw_migrations'))`;
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  runMigrations().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
