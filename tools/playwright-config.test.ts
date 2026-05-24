import { readFileSync } from 'node:fs';

import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';

import config from '../playwright.config.js';

describe('Playwright E2E contract', () => {
  it('keeps actionable artifacts for CI failures', () => {
    expect(config.outputDir).toBe('test-results/e2e');
    expect(config.use).toMatchObject({
      screenshot: 'only-on-failure',
      trace: 'retain-on-failure'
    });
    expect(config.reporter).toEqual(
      expect.arrayContaining([['html', { open: 'never', outputFolder: 'playwright-report' }]])
    );
  });

  it('builds shared packages before an isolated E2E run', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts['test:e2e']).toMatch(/^pnpm build:shared && pnpm db:migrate/);
  });

  it('uploads Playwright artifacts when the CI validate job fails', () => {
    const workflow = yaml.load(readFileSync('.github/workflows/ci.yml', 'utf8')) as {
      jobs: { validate: { steps: Array<Record<string, unknown>> } };
    };

    expect(workflow.jobs.validate.steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          if: 'failure()',
          name: 'Upload Playwright artifacts on failure',
          uses: 'actions/upload-artifact@v4',
          with: expect.objectContaining({
            'if-no-files-found': 'ignore',
            path: expect.stringContaining('playwright-report')
          })
        })
      ])
    );
  });
});
