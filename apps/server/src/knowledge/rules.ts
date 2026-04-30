import type { SqlClient } from '../db/client.js';
import { createSqlClient } from '../db/client.js';
import {
  createDefaultEmbeddingProvider,
  searchKnowledgeChunks,
  type EmbeddingProvider,
  type SearchResult
} from './repository.js';

export interface RuleSearchResult extends SearchResult {
  citation: string;
  rank: number;
}

export interface SearchRulesOptions {
  embeddingProvider?: EmbeddingProvider;
  limit?: number;
  sql?: SqlClient;
}

const DEFAULT_RULE_SEARCH_LIMIT = 5;

export async function searchRules(
  query: string,
  options: SearchRulesOptions = {}
): Promise<RuleSearchResult[]> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length === 0) {
    return [];
  }

  const sql = options.sql ?? createSqlClient();
  const shouldCloseClient = options.sql === undefined;
  const limit = options.limit ?? DEFAULT_RULE_SEARCH_LIMIT;
  const embeddingProvider = options.embeddingProvider ?? createDefaultEmbeddingProvider();

  try {
    const candidates = await searchKnowledgeChunks(
      sql,
      normalizedQuery,
      embeddingProvider,
      Math.max(limit * 8, 30)
    );
    const results = rerankResults(normalizedQuery, candidates).slice(0, limit);

    return results.map((result, index) => ({
      ...result,
      citation: formatRuleCitation(result),
      rank: index + 1
    }));
  } finally {
    if (shouldCloseClient) {
      await sql.end({ timeout: 5 });
    }
  }
}

export function buildRuleContext(results: RuleSearchResult[], maxCharsPerChunk = 1200): string {
  return results
    .map((result, index) => {
      const excerpt = truncateForContext(result.text, maxCharsPerChunk);
      return `[${index + 1}] ${result.citation}\n${excerpt}`;
    })
    .join('\n\n');
}

export function formatRuleCitation(result: Pick<SearchResult, 'heading' | 'sourcePath'>): string {
  return `${result.sourcePath} > ${result.heading}`;
}

function rerankResults(query: string, results: SearchResult[]): SearchResult[] {
  return results
    .map((result) => ({
      ...result,
      score: result.score + lexicalScore(query, result)
    }))
    .sort((left, right) => right.score - left.score);
}

function lexicalScore(query: string, result: SearchResult): number {
  const tokens = significantTokens(query);

  if (tokens.length === 0) {
    return 0;
  }

  const heading = normalizeText(result.heading);
  const text = normalizeText(result.text);
  const sourcePath = normalizeText(result.sourcePath);
  let score = 0;

  for (const token of tokens) {
    if (heading.includes(token)) {
      score += 1.5;
    }

    if (text.includes(token)) {
      score += 1;
    }
  }

  if (tokens.includes('jet') && tokens.includes('des') && text.includes('d10')) {
    score += 1.5;
  }

  if (tokens.includes('jet') && sourcePath.includes('01-resolution')) {
    score += 1;
  }

  return score / tokens.length;
}

function significantTokens(text: string): string[] {
  const stopWords = new Set([
    'a',
    'au',
    'aux',
    'ce',
    'ces',
    'comment',
    'de',
    'du',
    'en',
    'et',
    'fonctionne',
    'la',
    'le',
    'les',
    'pour',
    'un',
    'une'
  ]);

  return [...new Set(tokenizeForLexicalScore(text).filter((token) => !stopWords.has(token)))];
}

function tokenizeForLexicalScore(text: string): string[] {
  return (
    normalizeText(text)
      .match(/[a-z0-9]+/g)
      ?.map((token) => {
        if (token.startsWith('difficil')) {
          return 'difficulte';
        }

        return token;
      }) ?? []
  );
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function truncateForContext(text: string, maxChars: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (normalized.length <= maxChars) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxChars - 1)).trim()}…`;
}
