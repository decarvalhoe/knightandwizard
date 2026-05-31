import type { FastifyRequest } from 'fastify';

export const DEFAULT_USER_ID = 'local-dev';
export const USER_ID_HEADER = 'x-kw-user-id';

export function resolveRequestUserId(request: FastifyRequest, fallback?: unknown): string {
  return (
    normalizeUserId(readHeader(request.headers[USER_ID_HEADER])) ??
    normalizeUserId(fallback) ??
    DEFAULT_USER_ID
  );
}

export function normalizeUserId(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
}

function readHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
