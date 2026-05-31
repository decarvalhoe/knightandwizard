import type { SqlClient } from '../db/client.js';
import { createSqlClient } from '../db/client.js';
import {
  createDefaultEmbeddingProvider,
  toVectorLiteral,
  type EmbeddingProvider
} from '../knowledge/repository.js';
import type postgres from 'postgres';

export type GmMemoryProvenanceType = 'canonical_lore' | 'hypothesis' | 'session_fact';

export interface GmMemoryInput {
  importance?: number;
  kind: string;
  occurredAt?: Date | string;
  payload?: Record<string, unknown>;
  provenanceType?: GmMemoryProvenanceType;
  sessionKey: string;
  source?: string;
  subject: string;
  summary: string;
}

export interface GmMemoryEntry {
  id: string;
  importance: number;
  kind: string;
  occurredAt: string;
  payload: Record<string, unknown>;
  provenanceType: GmMemoryProvenanceType;
  score?: number;
  sessionKey: string;
  source: string;
  subject: string;
  summary: string;
}

export interface GmMemoryRecallInput {
  limit?: number;
  provenanceTypes?: GmMemoryProvenanceType[];
  query: string;
  sessionKey: string;
}

export interface EpisodicMemoryStore {
  close?: () => Promise<void>;
  recall(input: GmMemoryRecallInput): Promise<GmMemoryEntry[]>;
  record(input: GmMemoryInput): Promise<GmMemoryEntry | undefined>;
}

export interface GmMemoryPersistenceOptions {
  embeddingProvider?: EmbeddingProvider;
}

interface GmMemoryRow {
  id: string;
  importance: number;
  memory_kind: string;
  occurred_at: Date | string;
  provenance_type: GmMemoryProvenanceType;
  payload: Record<string, unknown>;
  session_key: string;
  source: string;
  subject: string;
  summary: string;
}

interface GmMemoryVectorRow extends GmMemoryRow {
  score: number | string;
}

const DEFAULT_RECALL_LIMIT = 5;

export async function recordGmMemory(
  sql: SqlClient,
  input: GmMemoryInput,
  options: GmMemoryPersistenceOptions = {}
): Promise<GmMemoryEntry> {
  const provenanceType = input.provenanceType ?? 'session_fact';
  const source = input.source ?? 'game-master';

  assertMemoryProvenance({ provenanceType, source });

  const embedding = await buildMemoryVectorLiteral(input, options);

  const rows = await sql<GmMemoryRow[]>`
    INSERT INTO gm_memories (
      session_key,
      memory_kind,
      provenance_type,
      subject,
      summary,
      importance,
      source,
      payload,
      embedding,
      occurred_at
    )
    VALUES (
      ${input.sessionKey},
      ${input.kind},
      ${provenanceType},
      ${input.subject},
      ${input.summary},
      ${input.importance ?? 1},
      ${source},
      ${sql.json((input.payload ?? {}) as postgres.JSONValue)}::jsonb,
      ${embedding}::vector,
      ${input.occurredAt ?? new Date()}
    )
    RETURNING id, session_key, memory_kind, provenance_type, subject, summary, importance, source, payload, occurred_at
  `;
  const row = rows[0];

  if (row === undefined) {
    throw new Error('Unable to persist GM memory');
  }

  return toMemoryEntry(row);
}

export async function searchGmMemories(
  sql: SqlClient,
  input: GmMemoryRecallInput,
  options: GmMemoryPersistenceOptions = {}
): Promise<GmMemoryEntry[]> {
  const limit = input.limit ?? DEFAULT_RECALL_LIMIT;
  const tokens = significantTokens(input.query);
  const provenanceTypes =
    input.provenanceTypes === undefined ? undefined : new Set(input.provenanceTypes);

  if (input.query.trim().length > 0) {
    const vectorMatches = await searchVectorGmMemories(sql, input, options, provenanceTypes, limit);

    if (vectorMatches.length > 0) {
      return vectorMatches;
    }
  }

  const rows = await sql<GmMemoryRow[]>`
    SELECT id, session_key, memory_kind, provenance_type, subject, summary, importance, source, payload, occurred_at
    FROM gm_memories
    WHERE session_key = ${input.sessionKey}
    ORDER BY occurred_at DESC
    LIMIT 200
  `;
  const memories = rows.map((row) => {
    const entry = toMemoryEntry(row);
    return {
      ...entry,
      score: scoreMemory(tokens, entry)
    };
  });
  const scopedMemories =
    provenanceTypes === undefined
      ? memories
      : memories.filter((memory) => provenanceTypes.has(memory.provenanceType));
  const candidates =
    tokens.length === 0
      ? scopedMemories
      : scopedMemories.filter((memory) => (memory.score ?? 0) > 0);

  return candidates
    .sort((left, right) => {
      const scoreDelta = (right.score ?? 0) - (left.score ?? 0);

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      const importanceDelta = right.importance - left.importance;

      if (importanceDelta !== 0) {
        return importanceDelta;
      }

      return right.occurredAt.localeCompare(left.occurredAt);
    })
    .slice(0, limit);
}

export function createDatabaseEpisodicMemoryStore(
  sql?: SqlClient,
  options: GmMemoryPersistenceOptions = {}
): EpisodicMemoryStore {
  const client = sql ?? createSqlClient();
  const shouldCloseClient = sql === undefined;

  return {
    async close() {
      if (shouldCloseClient) {
        await client.end({ timeout: 5 });
      }
    },
    recall(input) {
      return searchGmMemories(client, input, options);
    },
    record(input) {
      return recordGmMemory(client, input, options);
    }
  };
}

export function buildEpisodicMemoryContext(memories: GmMemoryEntry[]): string {
  return memories
    .map(
      (memory, index) =>
        `[M${index + 1}] ${memory.subject} (${memory.provenanceType}, ${memory.kind}, source ${memory.source}, importance ${memory.importance})\n${memory.summary}`
    )
    .join('\n\n');
}

function assertMemoryProvenance(input: {
  provenanceType: GmMemoryProvenanceType;
  source: string;
}): void {
  if (input.source.trim().length === 0) {
    throw new Error('GM memory source is required');
  }

  if (input.provenanceType === 'canonical_lore' && !isCanonicalMemorySource(input.source)) {
    throw new Error('Canonical lore memories require a canonical source, not GM narration');
  }
}

function isCanonicalMemorySource(source: string): boolean {
  return (
    source.startsWith('catalog:') ||
    source.startsWith('data/') ||
    source.startsWith('docs/') ||
    source.startsWith('rule:') ||
    source.startsWith('source:')
  );
}

async function searchVectorGmMemories(
  sql: SqlClient,
  input: GmMemoryRecallInput,
  options: GmMemoryPersistenceOptions,
  provenanceTypes: Set<GmMemoryProvenanceType> | undefined,
  limit: number
): Promise<GmMemoryEntry[]> {
  const vector = await buildQueryVectorLiteral(input.query, options);

  if (vector === undefined) {
    return [];
  }

  const rows = await sql<GmMemoryVectorRow[]>`
    SELECT
      id,
      session_key,
      memory_kind,
      provenance_type,
      subject,
      summary,
      importance,
      source,
      payload,
      occurred_at,
      1 - (embedding <=> ${vector}::vector) AS score
    FROM gm_memories
    WHERE session_key = ${input.sessionKey}
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${vector}::vector
    LIMIT 200
  `;
  const scopedRows =
    provenanceTypes === undefined
      ? rows
      : rows.filter((row) => provenanceTypes.has(row.provenance_type));

  return scopedRows.slice(0, limit).map((row) => ({
    ...toMemoryEntry(row),
    score: Number(row.score)
  }));
}

async function buildMemoryVectorLiteral(
  input: GmMemoryInput,
  options: GmMemoryPersistenceOptions
): Promise<string | null> {
  return (
    (await buildVectorLiteral(`${input.subject}\n${input.summary}`, options.embeddingProvider)) ??
    null
  );
}

async function buildQueryVectorLiteral(
  query: string,
  options: GmMemoryPersistenceOptions
): Promise<string | undefined> {
  return buildVectorLiteral(query, options.embeddingProvider);
}

async function buildVectorLiteral(
  text: string,
  embeddingProvider: EmbeddingProvider | undefined
): Promise<string | undefined> {
  const provider = embeddingProvider ?? createDefaultEmbeddingProvider();

  try {
    return toVectorLiteral(await provider.embed(text));
  } catch {
    return undefined;
  }
}

function toMemoryEntry(row: GmMemoryRow): GmMemoryEntry {
  return {
    id: row.id,
    importance: row.importance,
    kind: row.memory_kind,
    occurredAt: row.occurred_at instanceof Date ? row.occurred_at.toISOString() : row.occurred_at,
    payload: row.payload,
    provenanceType: row.provenance_type,
    sessionKey: row.session_key,
    source: row.source,
    subject: row.subject,
    summary: row.summary
  };
}

function scoreMemory(tokens: string[], memory: GmMemoryEntry): number {
  if (tokens.length === 0) {
    return memory.importance;
  }

  const subject = normalizeText(memory.subject);
  const summary = normalizeText(memory.summary);
  let score = 0;

  for (const token of tokens) {
    if (subject.includes(token)) {
      score += 2;
    }

    if (summary.includes(token)) {
      score += 1;
    }
  }

  return score + memory.importance * 0.1;
}

function significantTokens(text: string): string[] {
  const stopWords = new Set([
    'a',
    'au',
    'aux',
    'ce',
    'ces',
    'de',
    'des',
    'du',
    'en',
    'et',
    'la',
    'le',
    'les',
    'pour',
    'qui',
    'un',
    'une'
  ]);

  return [...new Set(normalizeText(text).match(/[a-z0-9]+/g) ?? [])].filter(
    (token) => !stopWords.has(token)
  );
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
