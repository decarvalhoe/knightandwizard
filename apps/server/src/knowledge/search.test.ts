import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createSqlClient } from '../db/client.js';
import { runMigrations } from '../db/migrate.js';
import {
  createKnowledgeChunk,
  DeterministicTestEmbeddingProvider,
  searchKnowledgeChunks,
  storeKnowledgeChunks
} from './repository.js';

const sql = createSqlClient();
const provider = new DeterministicTestEmbeddingProvider();

describe('knowledge repository', () => {
  beforeAll(async () => {
    await runMigrations();
    await sql`DELETE FROM knowledge_chunks WHERE source_path LIKE 'test/%'`;
    await sql`DELETE FROM knowledge_documents WHERE source_path LIKE 'test/%'`;
  });

  afterAll(async () => {
    await sql`DELETE FROM knowledge_chunks WHERE source_path LIKE 'test/%'`;
    await sql`DELETE FROM knowledge_documents WHERE source_path LIKE 'test/%'`;
    await sql.end({ timeout: 5 });
  });

  it('stores chunks and returns ranked vector search results', async () => {
    await storeKnowledgeChunks(
      sql,
      [
        createKnowledgeChunk({
          sourcePath: 'test/rules/dice.md',
          sourceKind: 'rule_markdown',
          chunkIndex: 0,
          heading: 'Dice difficulty',
          text: 'Dice rolls use d10 difficulty thresholds and critical outcomes.'
        }),
        createKnowledgeChunk({
          sourcePath: 'test/rules/magic.md',
          sourceKind: 'rule_markdown',
          chunkIndex: 0,
          heading: 'Magic schools',
          text: 'Magic schools define spells, energy, familiars and casting time.'
        })
      ],
      provider
    );

    const results = await searchKnowledgeChunks(sql, 'd10 dice difficulty roll', provider, 2);

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      sourcePath: 'test/rules/dice.md',
      heading: 'Dice difficulty'
    });
    expect(results[0]?.score).toBeGreaterThan(results[1]?.score ?? 0);
    expect(results[0]?.metadata).toMatchObject({
      chunk_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      source_path: 'test/rules/dice.md'
    });
  });
});
