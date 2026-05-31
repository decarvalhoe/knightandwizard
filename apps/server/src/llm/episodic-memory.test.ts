import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createSqlClient } from '../db/client.js';
import { runMigrations } from '../db/migrate.js';
import type { EmbeddingProvider } from '../knowledge/repository.js';
import {
  buildEpisodicMemoryContext,
  createDatabaseEpisodicMemoryStore,
  recordGmMemory,
  searchGmMemories
} from './episodic-memory.js';

const sql = createSqlClient();

describe('game master episodic memory', () => {
  beforeAll(async () => {
    await runMigrations();
    await sql`DELETE FROM gm_memories WHERE session_key LIKE 'test-memory-%'`;
  });

  afterAll(async () => {
    await sql`DELETE FROM gm_memories WHERE session_key LIKE 'test-memory-%'`;
    await sql.end({ timeout: 5 });
  });

  it('persists memories and recalls relevant historical context through a fresh store', async () => {
    const sessionKey = `test-memory-${randomUUID()}`;

    await recordGmMemory(sql, {
      importance: 4,
      kind: 'npc_encounter',
      payload: { npcId: 'sergent_malo' },
      provenanceType: 'session_fact',
      sessionKey,
      source: 'game-master',
      subject: 'Sergent Malo',
      summary: 'La compagnie a rencontre le Sergent Malo, qui garde la porte nord de Brumeval.'
    });
    await recordGmMemory(sql, {
      importance: 1,
      kind: 'scene_event',
      sessionKey,
      subject: 'Marche de pluie',
      summary: 'La pluie rend les chemins boueux hors de la ville.'
    });

    const freshStore = createDatabaseEpisodicMemoryStore();

    try {
      const memories = await freshStore.recall({
        limit: 3,
        query: 'qui garde la porte nord de Brumeval ?',
        sessionKey
      });

      expect(memories[0]).toMatchObject({
        provenanceType: 'session_fact',
        sessionKey,
        source: 'game-master',
        subject: 'Sergent Malo'
      });
      expect(buildEpisodicMemoryContext(memories)).toContain(
        '[M1] Sergent Malo (session_fact, npc_encounter, source game-master'
      );
    } finally {
      await freshStore.close?.();
    }
  });

  it('supports direct lexical search and provenance filters for hypotheses', async () => {
    const sessionKey = `test-memory-${randomUUID()}`;

    await recordGmMemory(sql, {
      importance: 5,
      kind: 'decision',
      provenanceType: 'hypothesis',
      sessionKey,
      source: 'player-note',
      subject: 'Pacte avec la guilde',
      summary: 'Le groupe pense que la Guilde des Lanternes veut recuperer la relique intacte.'
    });
    await recordGmMemory(sql, {
      importance: 2,
      kind: 'scene_event',
      provenanceType: 'session_fact',
      sessionKey,
      subject: 'Relique emballee',
      summary: 'La relique intacte est emballee dans une couverture.'
    });

    const memories = await searchGmMemories(sql, {
      limit: 2,
      provenanceTypes: ['hypothesis'],
      query: 'relique intacte',
      sessionKey
    });

    expect(memories).toHaveLength(1);
    expect(memories[0]).toMatchObject({
      kind: 'decision',
      provenanceType: 'hypothesis',
      subject: 'Pacte avec la guilde'
    });
  });

  it('stores memory embeddings and recalls vector matches before lexical fallback', async () => {
    const sessionKey = `test-memory-${randomUUID()}`;
    const semanticEmbeddingProvider = new SemanticMemoryEmbeddingProvider();
    const memory = await recordGmMemory(
      sql,
      {
        importance: 3,
        kind: 'npc_encounter',
        provenanceType: 'session_fact',
        sessionKey,
        source: 'game-master',
        subject: 'Sergent Malo',
        summary: 'Le Sergent Malo tient la porte nord de Brumeval.'
      },
      { embeddingProvider: semanticEmbeddingProvider }
    );

    await recordGmMemory(
      sql,
      {
        importance: 5,
        kind: 'weather',
        provenanceType: 'session_fact',
        sessionKey,
        source: 'game-master',
        subject: 'Averse du soir',
        summary: 'Une pluie froide transforme la route en boue.'
      },
      { embeddingProvider: semanticEmbeddingProvider }
    );

    const embeddingRows = await sql<{ has_embedding: boolean }[]>`
      SELECT embedding IS NOT NULL AS has_embedding
      FROM gm_memories
      WHERE id = ${memory.id}
    `;
    const memories = await searchGmMemories(
      sql,
      {
        limit: 2,
        query: 'vigile des remparts',
        sessionKey
      },
      { embeddingProvider: semanticEmbeddingProvider }
    );

    expect(embeddingRows).toEqual([{ has_embedding: true }]);
    expect(memories[0]).toMatchObject({
      subject: 'Sergent Malo'
    });
    expect(memories[0]?.score).toBeGreaterThan(0.9);
  });

  it('requires canonical sources for canonical lore memories', async () => {
    const sessionKey = `test-memory-${randomUUID()}`;

    await expect(
      recordGmMemory(sql, {
        kind: 'lore_note',
        provenanceType: 'canonical_lore',
        sessionKey,
        source: 'game-master',
        subject: 'Brumeval',
        summary: 'Le MJ affirme un fait de lore depuis la narration.'
      })
    ).rejects.toThrow('Canonical lore memories require a canonical source');

    const memory = await recordGmMemory(sql, {
      kind: 'lore_note',
      provenanceType: 'canonical_lore',
      sessionKey,
      source: 'docs/rules/12-geographie-social-economie.md',
      subject: 'Geographie sociale',
      summary: 'Fait canonique cite depuis le corpus source.'
    });

    expect(memory).toMatchObject({
      provenanceType: 'canonical_lore',
      source: 'docs/rules/12-geographie-social-economie.md'
    });
  });
});

class SemanticMemoryEmbeddingProvider implements EmbeddingProvider {
  readonly dimensions = 1536;

  async embed(text: string): Promise<number[]> {
    const vector = new Array<number>(this.dimensions).fill(0);
    const normalized = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (/(malo|nord|porte|rempart|sergent|vigile)/.test(normalized)) {
      vector[0] = 1;
    }

    if (/(averse|boue|pluie|route)/.test(normalized)) {
      vector[1] = 1;
    }

    return vector;
  }
}
