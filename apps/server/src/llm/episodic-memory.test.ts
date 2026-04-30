import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createSqlClient } from '../db/client.js';
import { runMigrations } from '../db/migrate.js';
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
      sessionKey,
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
        sessionKey,
        subject: 'Sergent Malo'
      });
      expect(buildEpisodicMemoryContext(memories)).toContain('[M1] Sergent Malo');
    } finally {
      await freshStore.close?.();
    }
  });

  it('supports direct lexical search for past decisions', async () => {
    const sessionKey = `test-memory-${randomUUID()}`;

    await recordGmMemory(sql, {
      importance: 5,
      kind: 'decision',
      sessionKey,
      subject: 'Pacte avec la guilde',
      summary: 'Le groupe a promis a la Guilde des Lanternes de livrer la relique intacte.'
    });

    const memories = await searchGmMemories(sql, {
      limit: 1,
      query: 'relique intacte',
      sessionKey
    });

    expect(memories).toHaveLength(1);
    expect(memories[0]).toMatchObject({
      kind: 'decision',
      subject: 'Pacte avec la guilde'
    });
  });
});
