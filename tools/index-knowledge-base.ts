import { readdir, readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { createSqlClient, type SqlClient } from '../apps/server/src/db/client.js';
import { runMigrations } from '../apps/server/src/db/migrate.js';
import {
  chunkMarkdownDocument,
  chunkYamlCatalog,
  type KnowledgeChunk,
  type KnowledgeSourceKind
} from '../apps/server/src/knowledge/chunker.js';
import {
  createDefaultEmbeddingProvider,
  storeKnowledgeChunks,
  type EmbeddingProvider
} from '../apps/server/src/knowledge/repository.js';

export interface KnowledgeIndexSource {
  sourceKind: KnowledgeSourceKind;
  sourcePath: string;
}

export interface KnowledgeIndexPlan {
  chunks: KnowledgeChunk[];
  sources: KnowledgeIndexSource[];
}

export interface KnowledgeIndexStats {
  chunks: number;
  documents: number;
  dryRun: boolean;
  summary: Record<KnowledgeSourceKind, number>;
}

export interface BuildKnowledgeIndexPlanOptions {
  repoRoot?: string;
}

export interface IndexKnowledgeBaseOptions extends BuildKnowledgeIndexPlanOptions {
  dryRun?: boolean;
  embeddingProvider?: EmbeddingProvider;
  migrate?: boolean;
  sql?: SqlClient;
}

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));

export async function buildKnowledgeIndexPlan(
  options: BuildKnowledgeIndexPlanOptions = {}
): Promise<KnowledgeIndexPlan> {
  const root = options.repoRoot ?? repoRoot;
  const sources: KnowledgeIndexSource[] = [
    ...(await markdownSources(root, 'docs/rules', 'rule_markdown')),
    ...(await optionalMarkdownSource(
      root,
      'docs/game/knightandwizard-game-foundation.md',
      'lore_markdown'
    )),
    ...(await yamlSources(root, 'data/catalogs'))
  ];
  const chunks: KnowledgeChunk[] = [];

  for (const source of sources) {
    const text = await readFile(join(root, source.sourcePath), 'utf8');

    if (source.sourceKind === 'catalog_yaml') {
      chunks.push(...chunkYamlCatalog({ sourcePath: source.sourcePath, text }));
      continue;
    }

    chunks.push(
      ...chunkMarkdownDocument({
        sourceKind: source.sourceKind,
        sourcePath: source.sourcePath,
        text
      })
    );
  }

  return {
    chunks,
    sources
  };
}

export function summarizeKnowledgeIndexPlan(
  plan: KnowledgeIndexPlan
): Record<KnowledgeSourceKind, number> {
  return plan.chunks.reduce<Record<KnowledgeSourceKind, number>>(
    (summary, chunk) => ({
      ...summary,
      [chunk.sourceKind]: (summary[chunk.sourceKind] ?? 0) + 1
    }),
    {
      catalog_yaml: 0,
      lore_markdown: 0,
      other: 0,
      rule_markdown: 0
    }
  );
}

export async function indexKnowledgeBase(
  options: IndexKnowledgeBaseOptions = {}
): Promise<KnowledgeIndexStats> {
  const plan = await buildKnowledgeIndexPlan({ repoRoot: options.repoRoot });
  const summary = summarizeKnowledgeIndexPlan(plan);

  if (options.dryRun) {
    return {
      chunks: plan.chunks.length,
      documents: plan.sources.length,
      dryRun: true,
      summary
    };
  }

  if (options.migrate !== false) {
    await runMigrations();
  }

  const sql = options.sql ?? createSqlClient();
  const shouldCloseClient = options.sql === undefined;

  try {
    await storeKnowledgeChunks(
      sql,
      plan.chunks,
      options.embeddingProvider ?? createDefaultEmbeddingProvider()
    );
  } finally {
    if (shouldCloseClient) {
      await sql.end({ timeout: 5 });
    }
  }

  return {
    chunks: plan.chunks.length,
    documents: plan.sources.length,
    dryRun: false,
    summary
  };
}

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const stats = await indexKnowledgeBase({
    dryRun: args.has('--dry-run'),
    migrate: !args.has('--no-migrate')
  });

  console.log(
    `knowledge index: documents=${stats.documents} chunks=${stats.chunks} dryRun=${stats.dryRun}`
  );
  for (const [kind, count] of Object.entries(stats.summary).sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    console.log(`- ${kind}: ${count}`);
  }
}

async function markdownSources(
  root: string,
  directory: string,
  sourceKind: KnowledgeSourceKind
): Promise<KnowledgeIndexSource[]> {
  const fileNames = await readdir(join(root, directory));

  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .sort()
    .map((fileName) => ({
      sourceKind,
      sourcePath: `${directory}/${fileName}`
    }));
}

async function optionalMarkdownSource(
  root: string,
  sourcePath: string,
  sourceKind: KnowledgeSourceKind
): Promise<KnowledgeIndexSource[]> {
  try {
    const result = await stat(join(root, sourcePath));
    return result.isFile() ? [{ sourceKind, sourcePath }] : [];
  } catch {
    return [];
  }
}

async function yamlSources(root: string, directory: string): Promise<KnowledgeIndexSource[]> {
  const fileNames = await readdir(join(root, directory));

  return fileNames
    .filter((fileName) => fileName.endsWith('.yaml'))
    .sort()
    .map((fileName) => ({
      sourceKind: 'catalog_yaml',
      sourcePath: `${directory}/${fileName}`
    }));
}

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
