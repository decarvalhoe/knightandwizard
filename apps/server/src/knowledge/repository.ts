import { createHash } from 'node:crypto';
import type postgres from 'postgres';
import type { SqlClient } from '../db/client.js';
import {
  createChunk,
  type KnowledgeChunk,
  type KnowledgeChunkMetadata,
  type KnowledgeSourceKind,
  stableHash
} from './chunker.js';

export interface EmbeddingProvider {
  dimensions: number;
  embed(text: string): Promise<number[]>;
}

export interface OllamaEmbeddingProviderOptions {
  dimensions?: number;
  endpoint?: string;
  model?: string;
}

export interface SearchResult {
  id: string;
  sourcePath: string;
  sourceKind: KnowledgeSourceKind;
  heading: string;
  text: string;
  metadata: KnowledgeChunkMetadata;
  score: number;
}

export const DEFAULT_EMBEDDING_DIMENSIONS = 1536;
export const DEFAULT_OLLAMA_EMBEDDING_ENDPOINT = 'http://localhost:11434/api/embed';
export const DEFAULT_OLLAMA_EMBEDDING_MODEL = 'nomic-embed-text';

export function createKnowledgeChunk(
  input: Omit<KnowledgeChunk, 'contentHash' | 'metadata'> & {
    metadata?: Partial<KnowledgeChunkMetadata>;
  }
): KnowledgeChunk {
  return createChunk(input);
}

export class DeterministicEmbeddingProvider implements EmbeddingProvider {
  readonly dimensions = DEFAULT_EMBEDDING_DIMENSIONS;

  async embed(text: string): Promise<number[]> {
    const vector = new Array<number>(this.dimensions).fill(0);
    const tokens = tokenize(text);

    for (const token of tokens) {
      const hash = createHash('sha256').update(token).digest();
      const index = ((hash[0] ?? 0) * 256 + (hash[1] ?? 0)) % this.dimensions;
      vector[index] += 1;
    }

    return normalize(vector);
  }
}

export class DeterministicTestEmbeddingProvider extends DeterministicEmbeddingProvider {}

export class OllamaEmbeddingProvider implements EmbeddingProvider {
  readonly dimensions: number;
  private readonly endpoint: string;
  private readonly model: string;

  constructor(options: OllamaEmbeddingProviderOptions = {}) {
    this.dimensions = options.dimensions ?? DEFAULT_EMBEDDING_DIMENSIONS;
    this.endpoint =
      options.endpoint ?? process.env.OLLAMA_EMBEDDING_URL ?? DEFAULT_OLLAMA_EMBEDDING_ENDPOINT;
    this.model =
      options.model ?? process.env.OLLAMA_EMBEDDING_MODEL ?? DEFAULT_OLLAMA_EMBEDDING_MODEL;
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch(this.endpoint, {
      body: JSON.stringify({
        input: text,
        model: this.model
      }),
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Ollama embedding request failed: ${response.status} ${response.statusText}`);
    }

    const payload = (await response.json()) as {
      embedding?: unknown;
      embeddings?: unknown;
    };
    const embedding = extractEmbedding(payload);

    if (embedding.length !== this.dimensions) {
      throw new Error(
        `Ollama embedding dimension mismatch: expected ${this.dimensions}, received ${embedding.length}`
      );
    }

    return normalize(embedding);
  }
}

export function createDefaultEmbeddingProvider(): EmbeddingProvider {
  const provider = process.env.KNOWLEDGE_EMBEDDING_PROVIDER ?? 'deterministic';

  if (provider === 'ollama') {
    return new OllamaEmbeddingProvider();
  }

  return new DeterministicEmbeddingProvider();
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
    const ingestedAt = new Date().toISOString();
    const documentMetadata = buildDocumentMetadata(sourceChunks, ingestedAt);
    const documentRows = await sql<{ id: string }[]>`
      INSERT INTO knowledge_documents (source_path, source_kind, title, content_hash, metadata)
      VALUES (
        ${firstChunk.sourcePath},
        ${firstChunk.sourceKind},
        ${firstChunk.heading},
        ${documentHash},
        ${sql.json(documentMetadata as postgres.JSONValue)}::jsonb
      )
      ON CONFLICT (source_path) DO UPDATE SET
        source_kind = EXCLUDED.source_kind,
        title = EXCLUDED.title,
        content_hash = EXCLUDED.content_hash,
        metadata = EXCLUDED.metadata,
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
          metadata,
          embedding
        ) VALUES (
          ${documentId},
          ${chunk.chunkIndex},
          ${chunk.sourcePath},
          ${chunk.sourceKind},
          ${chunk.heading},
          ${chunk.contentHash},
          ${chunk.text},
          ${sql.json(buildStoredChunkMetadata(chunk, ingestedAt) as postgres.JSONValue)}::jsonb,
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
      metadata,
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
    metadata: row.metadata,
    score: Number(row.score)
  }));
}

function buildDocumentMetadata(
  chunks: KnowledgeChunk[],
  ingestedAt: string
): Record<string, unknown> {
  const firstChunk = chunks[0];

  return {
    ...(firstChunk?.metadata ?? {}),
    chunk_count: chunks.length,
    chunk_hashes: chunks.map((chunk) => chunk.contentHash),
    ingested_at: ingestedAt
  };
}

function buildStoredChunkMetadata(
  chunk: KnowledgeChunk,
  ingestedAt: string
): KnowledgeChunkMetadata {
  return {
    ...chunk.metadata,
    chunk_hash: chunk.contentHash,
    chunk_index: chunk.chunkIndex,
    ingested_at: ingestedAt
  };
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

function tokenize(text: string): string[] {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .match(/[a-z0-9]+/g) ?? []
  ).map((token) => normalizeToken(token));
}

function normalizeToken(token: string): string {
  if (token === 'dice') {
    return 'des';
  }

  if (token === 'roll') {
    return 'jet';
  }

  if (token.startsWith('difficil')) {
    return 'difficulte';
  }

  return token;
}

function extractEmbedding(payload: { embedding?: unknown; embeddings?: unknown }): number[] {
  const candidate = Array.isArray(payload.embeddings) ? payload.embeddings[0] : payload.embedding;

  if (!Array.isArray(candidate) || !candidate.every((value) => typeof value === 'number')) {
    throw new Error('Ollama embedding response did not contain a numeric embedding');
  }

  return candidate;
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
