import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'packages/**/*.test.ts',
      'apps/server/src/**/*.test.ts',
      'apps/cms/src/**/*.test.ts',
      'apps/game/src/**/*.test.ts',
      'tools/**/*.test.ts'
    ],
    coverage: {
      reporter: ['text', 'html']
    }
  }
});
