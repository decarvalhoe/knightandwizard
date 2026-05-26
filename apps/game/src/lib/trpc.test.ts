import { afterEach, describe, expect, it } from 'vitest';

import { getTrpcEndpoint } from './trpc.js';

const originalApiBaseUrl = process.env.API_BASE_URL;
const originalPublicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

afterEach(() => {
  restoreEnv('API_BASE_URL', originalApiBaseUrl);
  restoreEnv('NEXT_PUBLIC_API_BASE_URL', originalPublicApiBaseUrl);
});

describe('tRPC client endpoint', () => {
  it('uses the public browser API base URL instead of the server-only API base URL', () => {
    process.env.API_BASE_URL = 'http://server-only.example';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://browser.example';

    expect(getTrpcEndpoint()).toBe('http://browser.example/trpc');
  });
});

function restoreEnv(name: 'API_BASE_URL' | 'NEXT_PUBLIC_API_BASE_URL', value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
