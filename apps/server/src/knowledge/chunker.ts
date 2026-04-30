import { createHash } from 'node:crypto';
import { basename } from 'node:path';
import { load } from 'js-yaml';

export type KnowledgeSourceKind = 'rule_markdown' | 'catalog_yaml' | 'lore_markdown' | 'other';

export interface KnowledgeChunk {
  sourcePath: string;
  sourceKind: KnowledgeSourceKind;
  chunkIndex: number;
  heading: string;
  contentHash: string;
  text: string;
}

export interface MarkdownChunkInput {
  sourcePath: string;
  sourceKind: KnowledgeSourceKind;
  text: string;
}

export interface YamlChunkInput {
  sourcePath: string;
  text: string;
}

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
        text: section.text
      })
    );
}

export function chunkYamlCatalog(input: YamlChunkInput): KnowledgeChunk[] {
  const document = load(input.text);
  const entries: Array<{ heading: string; value: unknown }> = [];

  if (isRecord(document)) {
    for (const [key, value] of Object.entries(document)) {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          entries.push({ heading: getYamlItemHeading(key, item, index), value: item });
        });
        continue;
      }

      entries.push({ heading: key, value });
    }
  } else {
    entries.push({ heading: basename(input.sourcePath), value: document });
  }

  return entries.map((entry, chunkIndex) =>
    createChunk({
      sourcePath: input.sourcePath,
      sourceKind: 'catalog_yaml',
      chunkIndex,
      heading: entry.heading,
      text: stableStringify(entry.value)
    })
  );
}

export function createChunk(input: Omit<KnowledgeChunk, 'contentHash'>): KnowledgeChunk {
  return {
    ...input,
    contentHash: stableHash(`${input.sourcePath}\0${input.heading}\0${input.text}`)
  };
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

  return JSON.stringify(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
