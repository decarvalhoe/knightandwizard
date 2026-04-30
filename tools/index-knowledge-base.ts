import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { createSqlClient, type SqlClient } from '../apps/server/src/db/client.js';
import { runMigrations } from '../apps/server/src/db/migrate.js';
import {
  chunkMarkdownDocument,
  chunkTextDocument,
  chunkYamlCatalog,
  createSourceReferenceChunk,
  type KnowledgeChunk,
  type KnowledgeChunkMetadata,
  type KnowledgeSourceKind
} from '../apps/server/src/knowledge/chunker.js';
import {
  createDefaultEmbeddingProvider,
  storeKnowledgeChunks,
  type EmbeddingProvider
} from '../apps/server/src/knowledge/repository.js';
import {
  buildSourceManifest,
  isReadableTextSource,
  loadSourceManifest,
  type SourceEntry,
  type SourceStatus,
  type SourceType
} from './canonical.js';

export interface KnowledgeIndexSource {
  contains: string[];
  domains: string[];
  priority: number;
  sourceHash: string;
  sourceKind: KnowledgeSourceKind;
  sourcePath: string;
  sourceStatus: SourceStatus;
  sourceType: SourceType;
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
const markdownExtensions = new Set(['.md', '.markdown']);
const knowledgeSourceKinds: KnowledgeSourceKind[] = [
  'catalog_table',
  'catalog_yaml',
  'generated_doc',
  'legacy_paper_extract',
  'legacy_php',
  'legacy_web_html',
  'lore_markdown',
  'other',
  'raw_source',
  'rule_markdown',
  'third_party'
];

export async function buildKnowledgeIndexPlan(
  options: BuildKnowledgeIndexPlanOptions = {}
): Promise<KnowledgeIndexPlan> {
  const root = options.repoRoot ?? repoRoot;
  const manifest = await readManifest(root);
  const sources = manifest.sources
    .filter(shouldIndexSource)
    .sort((left, right) => left.path.localeCompare(right.path))
    .map(toKnowledgeIndexSource);
  const chunks: KnowledgeChunk[] = [];

  for (const source of sources) {
    const metadata = sourceMetadata(source);

    if (!isReadableTextSource(source.sourcePath)) {
      chunks.push(
        createSourceReferenceChunk({
          sourceHash: source.sourceHash,
          sourceKind: source.sourceKind,
          sourcePath: source.sourcePath,
          metadata
        })
      );
      continue;
    }

    const text = await readFile(join(root, source.sourcePath), 'utf8');
    const extension = extname(source.sourcePath).toLowerCase();

    if (source.sourceType === 'catalog_yaml') {
      chunks.push(
        ...chunkYamlCatalog({
          sourcePath: source.sourcePath,
          metadata,
          text
        })
      );
      continue;
    }

    if (markdownExtensions.has(extension)) {
      chunks.push(
        ...chunkMarkdownDocument({
          sourceKind: source.sourceKind,
          sourcePath: source.sourcePath,
          metadata,
          text
        })
      );
      continue;
    }

    chunks.push(
      ...chunkTextDocument({
        sourceKind: source.sourceKind,
        sourcePath: source.sourcePath,
        metadata,
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
  const summary = Object.fromEntries(knowledgeSourceKinds.map((kind) => [kind, 0])) as Record<
    KnowledgeSourceKind,
    number
  >;

  for (const chunk of plan.chunks) {
    summary[chunk.sourceKind] = (summary[chunk.sourceKind] ?? 0) + 1;
  }

  return summary;
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

async function readManifest(root: string) {
  try {
    return await loadSourceManifest({ repoRoot: root });
  } catch {
    return buildSourceManifest({ repoRoot: root });
  }
}

function shouldIndexSource(source: SourceEntry): boolean {
  return source.status === 'active' || source.status === 'raw_reference_only';
}

function toKnowledgeIndexSource(source: SourceEntry): KnowledgeIndexSource {
  return {
    contains: source.contains,
    domains: source.domains,
    priority: source.priority,
    sourceHash: source.sha256,
    sourceKind: sourceKindFor(source),
    sourcePath: source.path,
    sourceStatus: source.status,
    sourceType: source.source_type
  };
}

function sourceKindFor(source: SourceEntry): KnowledgeSourceKind {
  if (source.source_type === 'canonical_rule') {
    return 'rule_markdown';
  }

  if (source.source_type === 'catalog_yaml') {
    return 'catalog_yaml';
  }

  if (source.path === 'docs/game/knightandwizard-game-foundation.md') {
    return 'lore_markdown';
  }

  return source.source_type;
}

function sourceMetadata(source: KnowledgeIndexSource): Partial<KnowledgeChunkMetadata> {
  return {
    catalog_ids: [],
    contains: source.contains,
    domain: source.domains[0] ?? 'unclassified',
    domains: source.domains,
    priority: source.priority,
    source_hash: source.sourceHash,
    source_path: source.sourcePath,
    source_status: source.sourceStatus,
    source_type: source.sourceType,
    unit_ids: []
  };
}

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
