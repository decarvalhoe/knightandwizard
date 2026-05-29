import { getApiBaseUrl } from '../../lib/api';

import type { SessionPlayer } from '@knightandwizard/rules-core';
import {
  DEFAULT_SESSION_SLUG,
  createPersistedSessionPayload,
  toSessionManagerState,
  type PersistedSessionSnapshot
} from './session-api';
import type { SessionManagerState } from './model';

export interface SessionManagerReadModel {
  currentPlayerId?: string;
  initialState: SessionManagerState;
}

export interface SessionJoinIdentity {
  capability?: string;
  characterId?: string;
  name?: string;
  playerId?: string;
  role?: SessionPlayer['role'];
}

export async function getSessionManagerReadModel(
  slug = DEFAULT_SESSION_SLUG,
  identity: SessionJoinIdentity = {}
): Promise<SessionManagerReadModel> {
  const baseUrl = getApiBaseUrl();
  const snapshot = await getOrCreateSessionSnapshot(baseUrl, slug);
  const joinedSnapshot = await joinSessionSnapshot(baseUrl, slug, snapshot, identity);

  return {
    currentPlayerId: identity.playerId,
    initialState: toSessionManagerState(joinedSnapshot)
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

async function joinSessionSnapshot(
  baseUrl: string,
  slug: string,
  snapshot: PersistedSessionSnapshot,
  identity: SessionJoinIdentity
): Promise<PersistedSessionSnapshot> {
  const payload = toJoinPayload(identity);

  if (!payload) {
    return snapshot;
  }

  const response = await fetch(`${baseUrl}/sessions/${encodeURIComponent(slug)}/players`, {
    body: JSON.stringify(payload),
    cache: 'no-store',
    headers: { 'content-type': 'application/json' },
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error(`Unable to join session ${slug}: HTTP ${response.status}`);
  }

  const body = (await response.json()) as { session?: PersistedSessionSnapshot };

  return body.session ?? snapshot;
}

function toJoinPayload(identity: SessionJoinIdentity) {
  if (!identity.playerId || !identity.name || !identity.role) {
    return undefined;
  }

  if (identity.role === 'player' && !identity.characterId) {
    return undefined;
  }

  return {
    ...(identity.capability ? { capability: identity.capability } : {}),
    ...(identity.characterId ? { characterId: identity.characterId } : {}),
    name: identity.name,
    playerId: identity.playerId,
    role: identity.role
  };
}
