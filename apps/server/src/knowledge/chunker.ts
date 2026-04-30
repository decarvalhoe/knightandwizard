import { createHash } from 'node:crypto';
import { basename } from 'node:path';
import { load } from 'js-yaml';

export type KnowledgeSourceKind =
  | 'rule_markdown'
  | 'catalog_yaml'
  | 'catalog_table'
  | 'lore_markdown'
  | 'legacy_web_html'
  | 'legacy_paper_extract'
  | 'legacy_php'
  | 'raw_source'
  | 'generated_doc'
  | 'third_party'
  | 'other';

export interface KnowledgeChunkMetadata extends Record<string, unknown> {
  catalog_ids: string[];
  chunk_hash: string;
  chunk_index: number;
  contains: string[];
  domain: string;
  domains: string[];
  ingested_at: string;
  priority: number | null;
  source_hash: string | null;
  source_path: string;
  source_status: string | null;
  source_type: string;
  unit_ids: string[];
}

export interface KnowledgeChunk {
  sourcePath: string;
  sourceKind: KnowledgeSourceKind;
  chunkIndex: number;
  heading: string;
  contentHash: string;
  metadata: KnowledgeChunkMetadata;
  text: string;
}

export interface MarkdownChunkInput {
  sourcePath: string;
  sourceKind: KnowledgeSourceKind;
  metadata?: Partial<KnowledgeChunkMetadata>;
  text: string;
}

export type TextChunkInput = MarkdownChunkInput;

export interface YamlChunkInput {
  sourcePath: string;
  metadata?: Partial<KnowledgeChunkMetadata>;
  text: string;
}

export interface SourceReferenceChunkInput {
  sourceHash: string;
  sourceKind: KnowledgeSourceKind;
  sourcePath: string;
  metadata?: Partial<KnowledgeChunkMetadata>;
}

export type KnowledgeChunkInput = Omit<KnowledgeChunk, 'contentHash' | 'metadata'> & {
  metadata?: Partial<KnowledgeChunkMetadata>;
};

const maxTextChunkLength = 6000;

export function stableHash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function chunkMarkdownDocument(input: MarkdownChunkInput): KnowledgeChunk[] {
  const lines = input.text.replace(/\r\n/g, '\n').split('\n');
  const sections: Array<{ heading: string; lines: string[] }> = [];
  let current: { heading: string; lines: string[] } | undefined;

  for (const line of lines) {
    const headingMatch = /^(#{1,6})\s+(.+?)\s*$/.exec(line);

    if (headingMatch !== null) {
      if (current !== undefined) {
        sections.push(current);
      }

      current = { heading: headingMatch[2] ?? basename(input.sourcePath), lines: [line] };
      continue;
    }

    if (current === undefined) {
      const fallbackHeading = basename(input.sourcePath).replace(/\.md$/i, '');
      current = { heading: fallbackHeading, lines: [] };
    }

    current.lines.push(line);
  }

  if (current !== undefined) {
    sections.push(current);
  }

  return sections
    .map((section) => ({ heading: section.heading, text: section.lines.join('\n').trim() }))
    .filter((section) => section.text.length > 0)
    .map((section, chunkIndex) =>
      createChunk({
        sourcePath: input.sourcePath,
        sourceKind: input.sourceKind,
        chunkIndex,
        heading: section.heading,
        metadata: input.metadata,
        text: section.text
      })
    );
}

export function chunkYamlCatalog(input: YamlChunkInput): KnowledgeChunk[] {
  const document = load(input.text);
  const entries: Array<{ catalogIds: string[]; heading: string; value: unknown }> = [];

  if (isRecord(document)) {
    for (const [key, value] of Object.entries(document)) {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          entries.push({
            catalogIds: getYamlCatalogIds(item),
            heading: getYamlItemHeading(key, item, index),
            value: item
          });
        });
        continue;
      }

      entries.push({ catalogIds: [], heading: key, value });
    }
  } else {
    entries.push({ catalogIds: [], heading: basename(input.sourcePath), value: document });
  }

  return entries.map((entry, chunkIndex) =>
    createChunk({
      sourcePath: input.sourcePath,
      sourceKind: 'catalog_yaml',
      chunkIndex,
      heading: entry.heading,
      metadata: {
        ...input.metadata,
        catalog_ids: entry.catalogIds,
        unit_ids: entry.catalogIds
      },
      text: stableStringify(entry.value)
    })
  );
}

export function chunkTextDocument(input: TextChunkInput): KnowledgeChunk[] {
  const normalized = input.text.replace(/\r\n/g, '\n').trim();

  if (normalized.length === 0) {
    return [
      createChunk({
        sourcePath: input.sourcePath,
        sourceKind: input.sourceKind,
        chunkIndex: 0,
        heading: basename(input.sourcePath),
        metadata: input.metadata,
        text: 'Empty text source retained for canonical traceability.'
      })
    ];
  }

  return splitText(normalized).map((text, chunkIndex) =>
    createChunk({
      sourcePath: input.sourcePath,
      sourceKind: input.sourceKind,
      chunkIndex,
      heading:
        chunkIndex === 0
          ? basename(input.sourcePath)
          : `${basename(input.sourcePath)} #${chunkIndex + 1}`,
      metadata: input.metadata,
      text
    })
  );
}

export function createSourceReferenceChunk(input: SourceReferenceChunkInput): KnowledgeChunk {
  return createChunk({
    sourcePath: input.sourcePath,
    sourceKind: input.sourceKind,
    chunkIndex: 0,
    heading: basename(input.sourcePath),
    metadata: {
      ...input.metadata,
      source_hash: input.sourceHash
    },
    text: [
      'Raw source reference retained for canonical traceability.',
      `Path: ${input.sourcePath}`,
      `SHA-256: ${input.sourceHash}`
    ].join('\n')
  });
}

export function createChunk(input: KnowledgeChunkInput): KnowledgeChunk {
  const contentHash = stableHash(`${input.sourcePath}\0${input.heading}\0${input.text}`);

  return {
    ...input,
    contentHash,
    metadata: buildChunkMetadata(input, contentHash)
  };
}

function buildChunkMetadata(
  input: KnowledgeChunkInput,
  contentHash: string
): KnowledgeChunkMetadata {
  const metadata = input.metadata ?? {};
  const domains = stringArray(metadata.domains);
  const domain = stringValue(metadata.domain) ?? domains[0] ?? 'unclassified';

  return {
    ...metadata,
    catalog_ids: stringArray(metadata.catalog_ids),
    chunk_hash: contentHash,
    chunk_index: input.chunkIndex,
    contains: stringArray(metadata.contains),
    domain,
    domains,
    ingested_at: stringValue(metadata.ingested_at) ?? 'pending-ingest',
    priority: numberValue(metadata.priority),
    source_hash: stringValue(metadata.source_hash) ?? null,
    source_path: input.sourcePath,
    source_status: stringValue(metadata.source_status) ?? null,
    source_type: stringValue(metadata.source_type) ?? input.sourceKind,
    unit_ids: stringArray(metadata.unit_ids)
  };
}

function splitText(text: string): string[] {
  const chunks: string[] = [];
  let current = '';

  for (const line of text.split('\n')) {
    const candidate = current.length === 0 ? line : `${current}\n${line}`;

    if (candidate.length > maxTextChunkLength && current.trim().length > 0) {
      chunks.push(current.trim());
      current = line;
      continue;
    }

    current = candidate;
  }

  if (current.trim().length > 0) {
    chunks.push(current.trim());
  }

  return chunks;
}

function getYamlItemHeading(collectionName: string, item: unknown, index: number): string {
  if (isRecord(item)) {
    const name = item.name;
    const id = item.id;

    if (typeof name === 'string' && name.length > 0) {
      return name;
    }

    if (typeof id === 'string' && id.length > 0) {
      return id;
    }
  }

  return `${collectionName}[${index}]`;
}

function getYamlCatalogIds(item: unknown): string[] {
  if (!isRecord(item)) {
    return [];
  }

  const id = item.id;
  const name = item.name;

  if (typeof id === 'string' && id.length > 0) {
    return [id];
  }

  if (typeof name === 'string' && name.length > 0) {
    return [slugify(name)];
  }

  return [];
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value) ?? 'null';
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function numberValue(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
