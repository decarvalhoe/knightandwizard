import { describe, expect, it } from 'vitest';

import { canonicalE2EFixtures } from '../tests/e2e/fixtures/canonical.js';

describe('canonical E2E fixtures', () => {
  it('trace every business scenario to canonical sources', () => {
    for (const scenario of Object.values(canonicalE2EFixtures.scenarios)) {
      expect(scenario.sourceRefs.length, scenario.title).toBeGreaterThan(0);
      for (const sourceRef of scenario.sourceRefs) {
        expect(sourceRef.path).toMatch(/^(docs\/rules|docs\/product|data\/catalogs)\//);
      }
    }
  });
});
