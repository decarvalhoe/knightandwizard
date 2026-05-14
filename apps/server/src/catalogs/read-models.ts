import 'dotenv/config';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import {
  DEFAULT_CATALOGS_DIR,
  PRIORITY_CATALOG_NAMES,
  catalogPath,
  loadValidatedCatalogs,
  type PriorityCatalogName
} from '@knightandwizard/catalogs';

import { createSqlClient, type SqlClient } from '../db/client.js';

type SqlJsonValue = Parameters<SqlClient['json']>[0];

export interface CatalogDocumentReadModel {
  catalogName: PriorityCatalogName;
  contentHash: string;
  document: SqlJsonValue;
  sourcePath: string;
}

export async function buildCatalogDocumentReadModels(
  catalogsDir = DEFAULT_CATALOGS_DIR
): Promise<CatalogDocumentReadModel[]> {
  const catalogs = await loadValidatedCatalogs(catalogsDir);

  return Promise.all(
    PRIORITY_CATALOG_NAMES.map(async (catalogName) => {
      const absolutePath = catalogPath(catalogName, catalogsDir);
      const content = await readFile(absolutePath, 'utf8');

      return {
        catalogName,
        contentHash: createHash('sha256').update(content).digest('hex'),
        document: catalogs[catalogName] as unknown as SqlJsonValue,
        sourcePath: `data/catalogs/${catalogName}`
      };
    })
  );
}

export async function upsertCatalogDocuments(
  sql: SqlClient,
  documents: CatalogDocumentReadModel[]
): Promise<number> {
  await sql.begin(async (tx) => {
    for (const document of documents) {
      await tx`
        INSERT INTO catalog_documents (catalog_name, source_path, content_hash, document)
        VALUES (
          ${document.catalogName},
          ${document.sourcePath},
          ${document.contentHash},
          ${tx.json(document.document)}::jsonb
        )
        ON CONFLICT (source_path) DO UPDATE SET
          catalog_name = EXCLUDED.catalog_name,
          content_hash = EXCLUDED.content_hash,
          document = EXCLUDED.document,
          updated_at = now()
      `;
    }
  });

  return documents.length;
}

export async function importCatalogDocuments(
  sql: SqlClient,
  catalogsDir = DEFAULT_CATALOGS_DIR
): Promise<number> {
  const documents = await buildCatalogDocumentReadModels(catalogsDir);
  return upsertCatalogDocuments(sql, documents);
}

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  const sql = createSqlClient();
  importCatalogDocuments(sql)
    .then((count) => {
      console.log(`catalog documents imported: ${count}`);
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await sql.end({ timeout: 5 });
    });
}
