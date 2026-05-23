import type { SqlClient } from '../db/client.js';
import { createSqlClient } from '../db/client.js';
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

const DEFAULT_RECALL_LIMIT = 5;

export async function recordGmMemory(sql: SqlClient, input: GmMemoryInput): Promise<GmMemoryEntry> {
  const provenanceType = input.provenanceType ?? 'session_fact';
  const source = input.source ?? 'game-master';

  assertMemoryProvenance({ provenanceType, source });

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
  input: GmMemoryRecallInput
): Promise<GmMemoryEntry[]> {
  const limit = input.limit ?? DEFAULT_RECALL_LIMIT;
  const tokens = significantTokens(input.query);
  const provenanceTypes =
    input.provenanceTypes === undefined ? undefined : new Set(input.provenanceTypes);
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

export function createDatabaseEpisodicMemoryStore(sql?: SqlClient): EpisodicMemoryStore {
  const client = sql ?? createSqlClient();
  const shouldCloseClient = sql === undefined;

  return {
    async close() {
      if (shouldCloseClient) {
        await client.end({ timeout: 5 });
      }
    },
    recall(input) {
      return searchGmMemories(client, input);
    },
    record(input) {
      return recordGmMemory(client, input);
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
