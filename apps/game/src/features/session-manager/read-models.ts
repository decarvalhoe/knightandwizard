import { getApiBaseUrl } from '../../lib/api';

import {
  DEFAULT_SESSION_SLUG,
  createPersistedSessionPayload,
  toSessionManagerState,
  type PersistedSessionSnapshot
} from './session-api';
import type { SessionManagerState } from './model';

export interface SessionManagerReadModel {
  initialState: SessionManagerState;
}

export async function getSessionManagerReadModel(
  slug = DEFAULT_SESSION_SLUG
): Promise<SessionManagerReadModel> {
  const baseUrl = getApiBaseUrl();
  const snapshot = await getOrCreateSessionSnapshot(baseUrl, slug);

  return {
    initialState: toSessionManagerState(snapshot)
  };
}

async function getOrCreateSessionSnapshot(
  baseUrl: string,
  slug: string
): Promise<PersistedSessionSnapshot> {
  const response = await fetch(`${baseUrl}/sessions/${encodeURIComponent(slug)}`, {
    cache: 'no-store'
  });

  if (response.status === 404) {
    return createSessionSnapshot(baseUrl, slug);
  }

  if (!response.ok) {
    throw new Error(`Unable to load session ${slug}: HTTP ${response.status}`);
  }

  return (await response.json()) as PersistedSessionSnapshot;
}

async function createSessionSnapshot(
  baseUrl: string,
  slug: string
): Promise<PersistedSessionSnapshot> {
  const response = await fetch(`${baseUrl}/sessions`, {
    body: JSON.stringify(createPersistedSessionPayload(slug)),
    cache: 'no-store',
    headers: { 'content-type': 'application/json' },
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error(`Unable to create session ${slug}: HTTP ${response.status}`);
  }

  return (await response.json()) as PersistedSessionSnapshot;
}
