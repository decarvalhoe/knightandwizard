import { createHash } from 'node:crypto';
import type { SqlClient } from '../db/client.js';
import { createChunk, type KnowledgeChunk, type KnowledgeSourceKind, stableHash } from './chunker.js';

export interface EmbeddingProvider {
  dimensions: number;
  embed(text: string): Promise<number[]>;
}

export interface SearchResult {
  id: string;
  sourcePath: string;
  sourceKind: KnowledgeSourceKind;
  heading: string;
  text: string;
  score: number;
}

export function createKnowledgeChunk(input: Omit<KnowledgeChunk, 'contentHash'>): KnowledgeChunk {
  return createChunk(input);
}

export class DeterministicTestEmbeddingProvider implements EmbeddingProvider {
  readonly dimensions = 1536;

  async embed(text: string): Promise<number[]> {
    const vector = new Array<number>(this.dimensions).fill(0);
    const tokens = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];

    for (const token of tokens) {
      const hash = createHash('sha256').update(token).digest();
      const index = ((hash[0] ?? 0) * 256 + (hash[1] ?? 0)) % this.dimensions;
      vector[index] += 1;
    }

    return normalize(vector);
  }
}

export async function storeKnowledgeChunks(
  sql: SqlClient,
  chunks: KnowledgeChunk[],
  embeddingProvider: EmbeddingProvider
): Promise<void> {
  const chunksBySource = groupChunksBySource(chunks);

  for (const sourceChunks of chunksBySource.values()) {
    const firstChunk = sourceChunks[0];

    if (firstChunk === undefined) {
      continue;
    }

    const documentHash = stableHash(sourceChunks.map((chunk) => chunk.contentHash).join('\n'));
    const documentRows = await sql<{ id: string }[]>`
      INSERT INTO knowledge_documents (source_path, source_kind, title, content_hash)
      VALUES (${firstChunk.sourcePath}, ${firstChunk.sourceKind}, ${firstChunk.heading}, ${documentHash})
      ON CONFLICT (source_path) DO UPDATE SET
        source_kind = EXCLUDED.source_kind,
        title = EXCLUDED.title,
        content_hash = EXCLUDED.content_hash,
        imported_at = now(),
        updated_at = now()
      RETURNING id
    `;
    const documentId = documentRows[0]?.id;

    if (documentId === undefined) {
      throw new Error(`Unable to upsert knowledge document for ${firstChunk.sourcePath}`);
    }

    await sql`DELETE FROM knowledge_chunks WHERE document_id = ${documentId}`;

    for (const chunk of sourceChunks) {
      const embedding = await embeddingProvider.embed(chunk.text);
      const vector = toVectorLiteral(embedding);

      await sql`
        INSERT INTO knowledge_chunks (
          document_id,
          chunk_index,
          source_path,
          source_kind,
          heading,
          content_hash,
          text,
          embedding
        ) VALUES (
          ${documentId},
          ${chunk.chunkIndex},
          ${chunk.sourcePath},
          ${chunk.sourceKind},
          ${chunk.heading},
          ${chunk.contentHash},
          ${chunk.text},
          ${vector}::vector
        )
      `;
    }
  }
}

export async function searchKnowledgeChunks(
  sql: SqlClient,
  query: string,
  embeddingProvider: EmbeddingProvider,
  limit = 5
): Promise<SearchResult[]> {
  const vector = toVectorLiteral(await embeddingProvider.embed(query));
  const rows = await sql<Array<SearchResult & { distance: number }>>`
    SELECT
      id,
      source_path AS "sourcePath",
      source_kind AS "sourceKind",
      heading,
      text,
      embedding <=> ${vector}::vector AS distance,
      1 - (embedding <=> ${vector}::vector) AS score
    FROM knowledge_chunks
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${vector}::vector
    LIMIT ${limit}
  `;

  return rows.map((row) => ({
    id: row.id,
    sourcePath: row.sourcePath,
    sourceKind: row.sourceKind,
    heading: row.heading,
    text: row.text,
    score: Number(row.score)
  }));
}

function groupChunksBySource(chunks: KnowledgeChunk[]): Map<string, KnowledgeChunk[]> {
  const result = new Map<string, KnowledgeChunk[]>();

  for (const chunk of chunks) {
    const sourceChunks = result.get(chunk.sourcePath) ?? [];
    sourceChunks.push(chunk);
    result.set(chunk.sourcePath, sourceChunks);
  }

  for (const sourceChunks of result.values()) {
    sourceChunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
  }

  return result;
}

function normalize(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));

  if (magnitude === 0) {
    return vector;
  }

  return vector.map((value) => value / magnitude);
}

function toVectorLiteral(vector: number[]): string {
  return `[${vector.map((value) => formatVectorNumber(value)).join(',')}]`;
}

function formatVectorNumber(value: number): string {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return '0';
  }

  return value.toFixed(8).replace(/0+$/, '').replace(/\.$/, '') || '0';
}
