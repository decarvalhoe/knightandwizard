import { searchRules, type RuleSearchResult, type SearchRulesOptions } from './rules.js';

export type RagEvaluationDomain = 'combat' | 'creation' | 'magic' | 'resolution';

export interface RagEvaluationCase {
  domain: RagEvaluationDomain;
  expectedDomains: string[];
  expectedSourcePaths: string[];
  id: string;
  minCitations: number;
  query: string;
  requiredTerms: string[];
}

export interface RagEvaluationCitation {
  citation: string;
  heading: string;
  score: number;
  sourcePath: string;
}

export interface RagEvaluationResult {
  catalogOverrideViolations: string[];
  citations: RagEvaluationCitation[];
  domain: RagEvaluationDomain;
  grounding: RagGroundingPolicy;
  id: string;
  minCitations: number;
  missingCitations: string[];
  missingDomains: string[];
  missingSourcePaths: string[];
  missingTerms: string[];
  passed: boolean;
  query: string;
}

export const RAG_GROUNDING_POLICY = {
  catalogOverrideAllowed: false,
  structuredDataAuthority: 'catalog_read_models_rules_core_and_database',
  vectorRole: 'citation_and_arbitration_context'
} as const;

export type RagGroundingPolicy = typeof RAG_GROUNDING_POLICY;

export const RAG_EVALUATION_CASES: RagEvaluationCase[] = [
  {
    domain: 'resolution',
    expectedDomains: ['D1-resolution'],
    expectedSourcePaths: ['docs/rules/01-resolution.md'],
    id: 'rag-resolution-dice-difficulty',
    minCitations: 1,
    query: 'comment resoudre un jet de des difficile avec une reserve de D10 ?',
    requiredTerms: ['d10', 'difficulte', 'succes']
  },
  {
    domain: 'creation',
    expectedDomains: ['D6-creation-perso'],
    expectedSourcePaths: ['docs/rules/06-creation-perso.md'],
    id: 'rag-creation-budget-points',
    minCitations: 1,
    query: 'comment repartir les points pendant la creation de personnage ?',
    requiredTerms: ['creation', 'points']
  },
  {
    domain: 'magic',
    expectedDomains: ['D8-magie'],
    expectedSourcePaths: ['docs/rules/08-magie.md'],
    id: 'rag-magic-spell-casting',
    minCitations: 1,
    query: 'comment lancer un sort et payer son energie magique ?',
    requiredTerms: ['sort', 'energie']
  },
  {
    domain: 'combat',
    expectedDomains: ['D9-combat'],
    expectedSourcePaths: ['docs/rules/09-combat.md'],
    id: 'rag-combat-dt-timeline',
    minCitations: 1,
    query: 'comment fonctionnent les DT et la timeline de combat ?',
    requiredTerms: ['dt', 'combat']
  }
];

const catalogOverrideMetadataKeys = [
  'catalog_override',
  'override_catalog_data',
  'rag_overrides_structured_data',
  'structured_override'
];

export async function evaluateRuleSearchCase(
  evaluationCase: RagEvaluationCase,
  options: SearchRulesOptions = {}
): Promise<RagEvaluationResult> {
  const results = await searchRules(evaluationCase.query, {
    ...options,
    limit: options.limit ?? Math.max(evaluationCase.minCitations, 5)
  });

  return evaluateRuleSearchResults(evaluationCase, results);
}

export async function evaluateRuleSearchSuite(
  options: SearchRulesOptions = {}
): Promise<RagEvaluationResult[]> {
  const results: RagEvaluationResult[] = [];

  for (const evaluationCase of RAG_EVALUATION_CASES) {
    results.push(await evaluateRuleSearchCase(evaluationCase, options));
  }

  return results;
}

export function evaluateRuleSearchResults(
  evaluationCase: RagEvaluationCase,
  results: RuleSearchResult[]
): RagEvaluationResult {
  const citations = results.map(toEvaluationCitation);
  const missingCitations = citations
    .filter((citation) => citation.citation.trim().length === 0)
    .map((citation) => citation.sourcePath);
  const missingSourcePaths = evaluationCase.expectedSourcePaths.filter(
    (sourcePath) => !results.some((result) => result.sourcePath === sourcePath)
  );
  const missingDomains = evaluationCase.expectedDomains.filter(
    (domain) => !results.some((result) => resultDomains(result).includes(domain))
  );
  const missingTerms = evaluationCase.requiredTerms.filter(
    (term) => !results.some((result) => normalizeText(result.text).includes(normalizeText(term)))
  );
  const catalogOverrideViolations = results
    .filter(hasCatalogOverrideViolation)
    .map((result) => result.sourcePath);

  return {
    catalogOverrideViolations,
    citations,
    domain: evaluationCase.domain,
    grounding: RAG_GROUNDING_POLICY,
    id: evaluationCase.id,
    minCitations: evaluationCase.minCitations,
    missingCitations,
    missingDomains,
    missingSourcePaths,
    missingTerms,
    passed:
      citations.length >= evaluationCase.minCitations &&
      missingCitations.length === 0 &&
      missingSourcePaths.length === 0 &&
      missingDomains.length === 0 &&
      missingTerms.length === 0 &&
      catalogOverrideViolations.length === 0,
    query: evaluationCase.query
  };
}

function toEvaluationCitation(result: RuleSearchResult): RagEvaluationCitation {
  return {
    citation: result.citation,
    heading: result.heading,
    score: result.score,
    sourcePath: result.sourcePath
  };
}

function resultDomains(result: RuleSearchResult): string[] {
  return [
    typeof result.metadata.domain === 'string' ? result.metadata.domain : undefined,
    ...(Array.isArray(result.metadata.domains) ? result.metadata.domains : [])
  ].filter((domain): domain is string => typeof domain === 'string' && domain.length > 0);
}

function hasCatalogOverrideViolation(result: RuleSearchResult): boolean {
  return catalogOverrideMetadataKeys.some((key) => result.metadata[key] === true);
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
