import { describe, expect, it } from 'vitest';
import {
  chunkMarkdownDocument,
  chunkTextDocument,
  chunkYamlCatalog,
  createSourceReferenceChunk
} from './chunker.js';

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
    expect(chunks[1]?.metadata).toMatchObject({
      chunk_hash: chunks[1]?.contentHash,
      chunk_index: 1,
      source_path: 'docs/rules/01-resolution.md',
      source_type: 'rule_markdown'
    });
  });

  it('splits yaml catalog arrays into deterministic item chunks', () => {
    const chunks = chunkYamlCatalog({
      sourcePath: 'data/catalogs/armes.yaml',
      text: 'metadata:\n  version: 1\nweapons:\n  - id: sword\n    name: Sword\n    damage: 3\n  - id: axe\n    name: Axe\n    damage: 4\n'
    });

    expect(chunks.map((chunk) => chunk.heading)).toEqual(['metadata', 'Sword', 'Axe']);
    expect(chunks.map((chunk) => chunk.chunkIndex)).toEqual([0, 1, 2]);
    expect(chunks[2]?.text).toContain('"id":"axe"');
    expect(chunks[2]?.metadata.catalog_ids).toEqual(['axe']);
  });

  it('chunks text and binary references with canonical metadata', () => {
    const textChunks = chunkTextDocument({
      sourcePath: 'data/legacy/web-scraped/raw-html/details/character-detail.php_id-87.html',
      sourceKind: 'legacy_web_html',
      metadata: {
        source_hash: 'a'.repeat(64),
        source_type: 'legacy_web_html',
        priority: 80,
        domains: ['legacy-characters']
      },
      text: 'Legacy character page'
    });
    const referenceChunk = createSourceReferenceChunk({
      sourceHash: 'b'.repeat(64),
      sourceKind: 'raw_source',
      sourcePath: 'data/legacy/paper/source.pdf'
    });

    expect(textChunks[0]?.metadata).toMatchObject({
      domain: 'legacy-characters',
      priority: 80,
      source_hash: 'a'.repeat(64),
      source_type: 'legacy_web_html'
    });
    expect(referenceChunk.text).toContain('Raw source reference');
    expect(referenceChunk.metadata.source_hash).toBe('b'.repeat(64));
  });
});
