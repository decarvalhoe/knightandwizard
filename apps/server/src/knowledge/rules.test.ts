import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createSqlClient } from '../db/client.js';
import { runMigrations } from '../db/migrate.js';
import {
  createKnowledgeChunk,
  DeterministicTestEmbeddingProvider,
  storeKnowledgeChunks
} from './repository.js';
import { buildRuleContext, searchRules } from './rules.js';

const sql = createSqlClient();
const provider = new DeterministicTestEmbeddingProvider();

describe('rules RAG search', () => {
  beforeAll(async () => {
    await runMigrations();
    await sql`DELETE FROM knowledge_chunks WHERE source_path LIKE 'test-rag/%'`;
    await sql`DELETE FROM knowledge_documents WHERE source_path LIKE 'test-rag/%'`;
  });

  afterAll(async () => {
    await sql`DELETE FROM knowledge_chunks WHERE source_path LIKE 'test-rag/%'`;
    await sql`DELETE FROM knowledge_documents WHERE source_path LIKE 'test-rag/%'`;
    await sql.end({ timeout: 5 });
  });

  it('returns cited rule chunks for a natural language query', async () => {
    await storeKnowledgeChunks(
      sql,
      [
        createKnowledgeChunk({
          sourcePath: 'test-rag/docs/rules/01-resolution.md',
          sourceKind: 'rule_markdown',
          chunkIndex: 0,
          heading: 'Jets difficiles',
          text: 'Un jet de des difficile utilise une reserve de D10, un seuil de difficulte et compte les succes.'
        }),
        createKnowledgeChunk({
          sourcePath: 'test-rag/docs/rules/08-magie.md',
          sourceKind: 'rule_markdown',
          chunkIndex: 0,
          heading: 'Ecoles de magie',
          text: 'Les ecoles de magie definissent les sorts, energies et conditions de lancement.'
        })
      ],
      provider
    );

    const results = await searchRules('comment fonctionne un jet de des difficile ?', {
      embeddingProvider: provider,
      limit: 2,
      sql
    });

    expect(results[0]).toMatchObject({
      citation: 'test-rag/docs/rules/01-resolution.md > Jets difficiles',
      heading: 'Jets difficiles',
      sourcePath: 'test-rag/docs/rules/01-resolution.md'
    });
    expect(results[0]?.score).toBeGreaterThan(results[1]?.score ?? 0);
    expect(results[0]?.metadata).toMatchObject({
      chunk_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      source_path: 'test-rag/docs/rules/01-resolution.md'
    });

    const context = buildRuleContext(results.slice(0, 1));
    expect(context).toContain('[1] test-rag/docs/rules/01-resolution.md > Jets difficiles');
    expect(context).toContain('reserve de D10');
  });
});
