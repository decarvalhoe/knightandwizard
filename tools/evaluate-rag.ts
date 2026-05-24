import {
  evaluateRuleSearchSuite,
  RAG_EVALUATION_CASES
} from '../apps/server/src/knowledge/evaluations.js';

async function main(): Promise<void> {
  const results = await evaluateRuleSearchSuite({ limit: 5 });
  const failed = results.filter((result) => !result.passed);

  console.log(`rag evaluation: cases=${RAG_EVALUATION_CASES.length} failed=${failed.length}`);
  for (const result of results) {
    const status = result.passed ? 'ok' : 'failed';
    console.log(`- ${status} ${result.id} citations=${result.citations.length}`);
    for (const citation of result.citations.slice(0, 3)) {
      console.log(`  - ${citation.citation} score=${citation.score.toFixed(3)}`);
    }
    if (!result.passed) {
      console.log(`  missingSourcePaths=${result.missingSourcePaths.join(',') || '-'}`);
      console.log(`  missingDomains=${result.missingDomains.join(',') || '-'}`);
      console.log(`  missingTerms=${result.missingTerms.join(',') || '-'}`);
      console.log(
        `  catalogOverrideViolations=${result.catalogOverrideViolations.join(',') || '-'}`
      );
    }
  }

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
