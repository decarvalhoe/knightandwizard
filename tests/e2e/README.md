# E2E canonical scenarios

The Playwright suite proves critical player/GM flows at product level. Each scenario must stay readable as a business behavior and must call `annotateCanonical(...)` with a fixture from `fixtures/canonical.ts`.

Required pattern for new scenarios:

1. Use a descriptive test title that names the product behavior.
2. Add canonical source annotations through `canonicalE2EFixtures.scenarios`.
3. Keep test data in `fixtures/canonical.ts` when it represents a reusable canonical scenario actor, scene or source reference.
4. Keep screenshots and traces actionable: Playwright stores traces and screenshots on failure under `test-results/e2e`, and CI uploads them with `playwright-report`.

Do not add invented game facts directly in a test body. If a scenario needs a new fixture, add the source reference first.
