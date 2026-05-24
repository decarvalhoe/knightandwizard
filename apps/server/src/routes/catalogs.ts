import {
  PRIORITY_CATALOG_NAMES,
  type PotionsCatalog,
  type PriorityCatalogName,
  type ProtectionsCatalog,
  type WeaponsCatalog
} from '@knightandwizard/catalogs';
import type { FastifyInstance } from 'fastify';

import {
  EQUIPMENT_CATALOG_NAMES,
  buildEquipmentInventoryReadModel,
  summarizeEquipmentInventory
} from '../catalogs/equipment.js';
import { createSqlClient, type SqlClient } from '../db/client.js';

const catalogNamePattern = /^[a-z0-9-]+\.yaml$/;
const priorityCatalogNames = new Set<string>(PRIORITY_CATALOG_NAMES);

export interface CatalogSummary {
  catalogName: string;
  contentHash: string;
  importedAt: string;
  sourcePath: string;
  updatedAt: string;
}

export interface CatalogDocumentPayload<Document = unknown> extends CatalogSummary {
  document: Document;
}

interface CatalogRouteParams {
  catalogName: string;
}

interface CatalogDocumentRow {
  catalog_name: string;
  content_hash: string;
  document: unknown;
  imported_at: Date | string;
  source_path: string;
  updated_at: Date | string;
}

export async function registerCatalogRoutes(app: FastifyInstance): Promise<void> {
  app.options('/catalogs', async (_request, reply) => reply.code(204).send());
  app.options('/catalogs/equipment', async (_request, reply) => reply.code(204).send());
  app.options('/catalogs/:catalogName', async (_request, reply) => reply.code(204).send());

  app.get('/catalogs', async () => {
    const sql = createSqlClient();

    try {
      const rows = await listCatalogRows(sql);

      return {
        catalogs: rows
          .filter((row) => isPriorityCatalogName(row.catalog_name))
          .map(toCatalogSummary),
        status: 'ok' as const
      };
    } finally {
      await sql.end({ timeout: 5 });
    }
  });

  app.get('/catalogs/equipment', async (_request, reply) => {
    const sql = createSqlClient();

    try {
      const rows = await sql<CatalogDocumentRow[]>`
        SELECT catalog_name, source_path, content_hash, document, imported_at, updated_at
        FROM catalog_documents
        WHERE catalog_name IN ('armes.yaml', 'protections.yaml', 'potions.yaml')
        ORDER BY catalog_name ASC
      `;
      const rowByName = new Map(rows.map((row) => [row.catalog_name, row]));
      const missingCatalogs = EQUIPMENT_CATALOG_NAMES.filter(
        (catalogName) => !rowByName.has(catalogName)
      );

      if (missingCatalogs.length > 0) {
        return reply.code(404).send({
          error: {
            catalogNames: missingCatalogs,
            code: 'equipment_catalogs_not_imported',
            message: 'Equipment catalog read models are not imported.'
          },
          status: 'not_found'
        });
      }

      const equipment = buildEquipmentInventoryReadModel({
        potions: rowByName.get('potions.yaml')!.document as PotionsCatalog,
        protections: rowByName.get('protections.yaml')!.document as ProtectionsCatalog,
        weapons: rowByName.get('armes.yaml')!.document as WeaponsCatalog
      });

      return {
        equipment,
        sourceCatalogs: EQUIPMENT_CATALOG_NAMES.map((catalogName) =>
          toCatalogSummary(rowByName.get(catalogName)!)
        ),
        status: 'ok' as const,
        totals: summarizeEquipmentInventory(equipment)
      };
    } finally {
      await sql.end({ timeout: 5 });
    }
  });

  app.get<{ Params: CatalogRouteParams }>('/catalogs/:catalogName', async (request, reply) => {
    const { catalogName } = request.params;

    if (!catalogNamePattern.test(catalogName)) {
      return reply.code(400).send({
        error: {
          code: 'invalid_catalog_name',
          catalogName,
          message: 'Catalog names must be lowercase YAML filenames.'
        },
        status: 'invalid'
      });
    }

    const sql = createSqlClient();

    try {
      const rows = await sql<CatalogDocumentRow[]>`
        SELECT catalog_name, source_path, content_hash, document, imported_at, updated_at
        FROM catalog_documents
        WHERE catalog_name = ${catalogName}
        LIMIT 1
      `;
      const row = rows[0];

      if (!row) {
        return reply.code(404).send({
          error: {
            code: 'catalog_not_imported',
            catalogName,
            message: 'Catalog read model is not imported.'
          },
          status: 'not_found'
        });
      }

      return {
        catalog: toCatalogDocument(row),
        status: 'found' as const
      };
    } finally {
      await sql.end({ timeout: 5 });
    }
  });
}

async function listCatalogRows(sql: SqlClient): Promise<CatalogDocumentRow[]> {
  return sql<CatalogDocumentRow[]>`
    SELECT catalog_name, source_path, content_hash, document, imported_at, updated_at
    FROM catalog_documents
    WHERE source_path LIKE 'data/catalogs/%'
    ORDER BY catalog_name ASC
  `;
}

function toCatalogSummary(row: CatalogDocumentRow): CatalogSummary {
  return {
    catalogName: row.catalog_name,
    contentHash: row.content_hash,
    importedAt: toIsoString(row.imported_at),
    sourcePath: row.source_path,
    updatedAt: toIsoString(row.updated_at)
  };
}

function toCatalogDocument(row: CatalogDocumentRow): CatalogDocumentPayload {
  return {
    ...toCatalogSummary(row),
    document: row.document
  };
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function isPriorityCatalogName(catalogName: string): catalogName is PriorityCatalogName {
  return priorityCatalogNames.has(catalogName);
}
