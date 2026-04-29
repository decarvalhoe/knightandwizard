import { describe, expect, it } from 'vitest';
import { chunkMarkdownDocument, chunkYamlCatalog } from './chunker.js';

describe('knowledge chunker', () => {
  it('splits markdown rules by headings with stable metadata', () => {
    const chunks = chunkMarkdownDocument({
      sourcePath: 'docs/rules/01-resolution.md',
      sourceKind: 'rule_markdown',
      text: '# D1 Resolution\n\nIntro.\n\n## R-1.1 Dice roll\n\nRoll d10 against difficulty.\n\n## R-1.2 Critical\n\nA critical result changes outcome.'
    });

    expect(chunks).toHaveLength(3);
    expect(chunks.map((chunk) => chunk.heading)).toEqual([
      'D1 Resolution',
      'R-1.1 Dice roll',
      'R-1.2 Critical'
    ]);
    expect(chunks[1]).toMatchObject({
      sourcePath: 'docs/rules/01-resolution.md',
      sourceKind: 'rule_markdown',
      chunkIndex: 1
    });
    expect(chunks[1]?.contentHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('splits yaml catalog arrays into deterministic item chunks', () => {
    const chunks = chunkYamlCatalog({
      sourcePath: 'data/catalogs/armes.yaml',
      text: 'metadata:\n  version: 1\nweapons:\n  - id: sword\n    name: Sword\n    damage: 3\n  - id: axe\n    name: Axe\n    damage: 4\n'
    });

    expect(chunks.map((chunk) => chunk.heading)).toEqual(['metadata', 'Sword', 'Axe']);
    expect(chunks.map((chunk) => chunk.chunkIndex)).toEqual([0, 1, 2]);
    expect(chunks[2]?.text).toContain('"id":"axe"');
  });
});
