import { describe, expect, it } from 'vitest';
import {
  evaluateRuleSearchResults,
  RAG_EVALUATION_CASES,
  RAG_GROUNDING_POLICY
} from './evaluations.js';
import type { RuleSearchResult } from './rules.js';

describe('canonical RAG evaluations', () => {
  it('defines resolution, creation, magic and combat citation cases', () => {
    expect(RAG_EVALUATION_CASES.map((evaluationCase) => evaluationCase.domain)).toEqual([
      'resolution',
      'creation',
      'magic',
      'combat'
    ]);
    expect(RAG_EVALUATION_CASES.every((evaluationCase) => evaluationCase.minCitations > 0)).toBe(
      true
    );
  });

  it('passes when expected canonical citations and domains are present', () => {
    for (const evaluationCase of RAG_EVALUATION_CASES) {
      const result = evaluateRuleSearchResults(evaluationCase, [
        ruleResult({
          domain: evaluationCase.expectedDomains[0] ?? 'D1-resolution',
          sourcePath: evaluationCase.expectedSourcePaths[0] ?? 'docs/rules/01-resolution.md',
          text: [...evaluationCase.requiredTerms, 'canonique'].join(' ')
        })
      ]);

      expect(result).toMatchObject({
        catalogOverrideViolations: [],
        grounding: RAG_GROUNDING_POLICY,
        missingDomains: [],
        missingSourcePaths: [],
        missingTerms: [],
        passed: true
      });
      expect(result.citations[0]?.citation).toContain(evaluationCase.expectedSourcePaths[0]);
    }
  });

  it('fails missing citations and attempted catalog overrides', () => {
    const evaluationCase = RAG_EVALUATION_CASES[0];
    if (evaluationCase === undefined) {
      throw new Error('Expected at least one RAG evaluation case');
    }

    const result = evaluateRuleSearchResults(evaluationCase, [
      ruleResult({
        citation: '',
        domain: 'D8-magie',
        metadata: { structured_override: true },
        sourcePath: 'docs/rules/08-magie.md',
        text: 'sort energie'
      })
    ]);

    expect(result.passed).toBe(false);
    expect(result.catalogOverrideViolations).toEqual(['docs/rules/08-magie.md']);
    expect(result.missingCitations).toEqual(['docs/rules/08-magie.md']);
    expect(result.missingSourcePaths).toEqual(evaluationCase.expectedSourcePaths);
    expect(result.grounding.catalogOverrideAllowed).toBe(false);
  });
});

function ruleResult(input: {
  citation?: string;
  domain: string;
  metadata?: Record<string, unknown>;
  sourcePath: string;
  text: string;
}): RuleSearchResult {
  return {
    citation: input.citation ?? `${input.sourcePath} > Test heading`,
    heading: 'Test heading',
    id: `${input.sourcePath}:0`,
    metadata: {
      catalog_ids: [],
      chunk_hash: 'a'.repeat(64),
      chunk_index: 0,
      contains: ['rules'],
      domain: input.domain,
      domains: [input.domain],
      ingested_at: 'test',
      priority: 100,
      source_hash: 'b'.repeat(64),
      source_path: input.sourcePath,
      source_status: 'active',
      source_type: 'canonical_rule',
      unit_ids: [],
      ...input.metadata
    },
    rank: 1,
    score: 0.9,
    sourceKind: 'rule_markdown',
    sourcePath: input.sourcePath,
    text: input.text
  };
}
