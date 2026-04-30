import { defineConfig, devices } from '@playwright/test';

const gamePort = Number.parseInt(process.env.E2E_GAME_PORT ?? '3100', 10);
const apiPort = Number.parseInt(process.env.E2E_API_PORT ?? '3102', 10);
const gameBaseUrl = process.env.E2E_GAME_URL ?? `http://127.0.0.1:${gamePort}`;
const apiBaseUrl = process.env.E2E_API_URL ?? `http://127.0.0.1:${apiPort}`;
const databaseUrl =
  process.env.DATABASE_URL ??
  'postgres://knightandwizard:knightandwizard@127.0.0.1:55432/knightandwizard';
const payloadSecret = process.env.PAYLOAD_SECRET ?? 'local-dev-only-secret';

export default defineConfig({
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  retries: process.env.CI ? 1 : 0,
  testDir: './tests/e2e',
  timeout: 45_000,
  use: {
    baseURL: gameBaseUrl,
    trace: 'retain-on-failure'
  },
  webServer: [
    {
      command: [
        `DATABASE_URL=${databaseUrl}`,
        `PAYLOAD_SECRET=${payloadSecret}`,
        `SERVER_PORT=${apiPort}`,
        'pnpm --filter @knightandwizard/server dev'
      ].join(' '),
      env: {
        DATABASE_URL: databaseUrl,
        PAYLOAD_SECRET: payloadSecret,
        SERVER_PORT: String(apiPort)
      },
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      url: `${apiBaseUrl}/ready`
    },
    {
      command: [
        `API_BASE_URL=${apiBaseUrl}`,
        `NEXT_PUBLIC_API_BASE_URL=${apiBaseUrl}`,
        'pnpm --filter @knightandwizard/game exec next dev',
        `-p ${gamePort}`
      ].join(' '),
      env: {
        API_BASE_URL: apiBaseUrl,
        NEXT_PUBLIC_API_BASE_URL: apiBaseUrl
      },
      reuseExistingServer: !process.env.CI,
      timeout: 45_000,
      url: gameBaseUrl
    }
  ],
  workers: 1,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
