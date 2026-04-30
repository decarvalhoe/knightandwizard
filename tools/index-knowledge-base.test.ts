import { describe, expect, it } from 'vitest';

import { buildKnowledgeIndexPlan, summarizeKnowledgeIndexPlan } from './index-knowledge-base.js';

describe('knowledge base index plan', () => {
  it('collects canonical rules, foundation lore and YAML catalogs', async () => {
    const plan = await buildKnowledgeIndexPlan();
    const summary = summarizeKnowledgeIndexPlan(plan);

    expect(plan.chunks.length).toBeGreaterThan(1000);
    expect(summary.rule_markdown).toBeGreaterThan(900);
    expect(summary.catalog_yaml).toBeGreaterThan(400);
    expect(summary.lore_markdown).toBeGreaterThan(0);
    expect(plan.sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sourcePath: 'docs/rules/01-resolution.md' }),
        expect.objectContaining({ sourcePath: 'data/catalogs/armes.yaml' }),
        expect.objectContaining({
          sourcePath: 'docs/game/knightandwizard-game-foundation.md'
        })
      ])
    );
  });
});
