import { describe, expect, it } from 'vitest';

import { buildKnowledgeIndexPlan, summarizeKnowledgeIndexPlan } from './index-knowledge-base.js';

describe('knowledge base index plan', () => {
  it('collects every active/raw-reference source from the canonical manifest', async () => {
    const plan = await buildKnowledgeIndexPlan();
    const summary = summarizeKnowledgeIndexPlan(plan);

    expect(plan.sources.length).toBeGreaterThan(1000);
    expect(plan.chunks.length).toBeGreaterThan(plan.sources.length);
    expect(summary.rule_markdown).toBeGreaterThan(900);
    expect(summary.catalog_yaml).toBeGreaterThan(400);
    expect(summary.legacy_web_html).toBeGreaterThan(0);
    expect(summary.raw_source).toBeGreaterThan(0);
    expect(summary.lore_markdown).toBeGreaterThan(0);
    expect(plan.sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sourcePath: 'docs/rules/01-resolution.md' }),
        expect.objectContaining({ sourcePath: 'data/catalogs/armes.yaml' }),
        expect.objectContaining({
          sourcePath: 'docs/game/knightandwizard-game-foundation.md'
        }),
        expect.objectContaining({
          sourcePath: 'data/legacy/web-scraped/raw-html/details/character-detail.php_id-126.html'
        })
      ])
    );

    expect(plan.chunks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourcePath: 'data/legacy/web-scraped/raw-html/details/character-detail.php_id-126.html',
          metadata: expect.objectContaining({
            domain: 'legacy-characters',
            source_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
            source_type: 'legacy_web_html'
          })
        })
      ])
    );
    expect(plan.chunks.every((chunk) => chunk.metadata.chunk_hash === chunk.contentHash)).toBe(
      true
    );
  });
});
