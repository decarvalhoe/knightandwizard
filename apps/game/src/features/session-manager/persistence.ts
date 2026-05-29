import type {
  CombatStatus,
  CombatVitality,
  SessionControllerRole,
  SessionDecisionPriority,
  SessionDecisionStatus,
  SessionEventType
} from '@knightandwizard/rules-core';

import { getClientApiBaseUrl } from '../../lib/api';

import {
  createPersistedSessionPayload,
  toSessionManagerState,
  type PersistedSessionSnapshot
} from './session-api';
import type { SessionManagerState } from './model';

export interface AppendResolvedEventInput {
  actorId: string;
  postText?: string;
  result: Record<string, unknown>;
}

export interface AppendThreadPostInput {
  actorId: string;
  text: string;
}

export interface QueuePersistedGmDecisionInput {
  assignedTo?: SessionControllerRole;
  payload?: Record<string, unknown>;
  priority?: SessionDecisionPriority;
  requestedBy: string;
  title: string;
}

export interface ResolvePersistedGmDecisionInput {
  actorId: string;
  resolution?: Record<string, unknown>;
  status: Exclude<SessionDecisionStatus, 'pending'>;
}

export interface RequestPersistedRollbackInput {
  actorId: string;
  reason: string;
  targetSequence: number;
}

export interface SyncCharacterCombatStateInput {
  sessionSlug?: string;
  statuses?: CombatStatus[];
  vitality?: CombatVitality;
}

export async function fetchPersistedSessionState(slug: string): Promise<SessionManagerState> {
  const snapshot = await getPersistedSessionSnapshot(slug);

  return toSessionManagerState(snapshot);
}

export async function appendDiceRollToSession(
  slug: string,
  input: AppendResolvedEventInput
): Promise<void> {
  const postText = normalizeOptionalText(input.postText);

  await appendPersistedSessionEvent(slug, {
    actorId: input.actorId,
    eventType: 'dice_roll',
    payload: {
      ...(postText ? { kind: 'table_roll', postText } : {}),
      ...input.result
    }
  });
}

export async function appendThreadPostToSession(
  slug: string,
  input: AppendThreadPostInput
): Promise<void> {
  const text = normalizeOptionalText(input.text);

  if (!text) {
    return;
  }

  await appendPersistedSessionEvent(slug, {
    actorId: input.actorId,
    eventType: 'player_action',
    payload: { kind: 'table_post', text }
  });
}

export async function appendCombatResolutionToSession(
  slug: string,
  input: AppendResolvedEventInput
): Promise<void> {
  await appendPersistedSessionEvent(slug, {
    actorId: input.actorId,
    eventType: 'combat',
    payload: input.result
  });
}

export async function syncCharacterCombatState(
  characterId: string,
  input: SyncCharacterCombatStateInput
): Promise<void> {
  const baseUrl = getClientApiBaseUrl();
  const response = await fetch(
    `${baseUrl}/characters/${encodeURIComponent(characterId)}/combat-state`,
    {
      body: JSON.stringify(input),
      headers: { 'content-type': 'application/json' },
      method: 'PATCH'
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to sync character combat state for ${characterId}: HTTP ${response.status}`
    );
  }
}

export async function appendPersistedSessionEvent(
  slug: string,
  input: {
    actorId: string;
    eventType: SessionEventType;
    payload: Record<string, unknown>;
  }
): Promise<void> {
  await postSessionJson(slug, `/sessions/${encodeURIComponent(slug)}/events`, input);
}

export async function queuePersistedGmDecision(
  slug: string,
  input: QueuePersistedGmDecisionInput
): Promise<void> {
  await postSessionJson(slug, `/sessions/${encodeURIComponent(slug)}/decisions`, input);
}

export async function resolvePersistedGmDecision(
  slug: string,
  decisionId: string,
  input: ResolvePersistedGmDecisionInput
): Promise<void> {
  await postSessionJson(
    slug,
    `/sessions/${encodeURIComponent(slug)}/decisions/${encodeURIComponent(decisionId)}/resolve`,
    input
  );
}

export interface AdvancePersistedNarrativeInput {
  actorId: string;
  by: { days?: number; hours?: number; minutes?: number; seconds?: number };
}

export interface DispelPersistedSpellInput {
  activeSpellId: string;
  actorId: string;
}

/** Avance l'horloge narrative (MJ « passer la journée / N heures », R-8.20). */
export async function advancePersistedNarrative(
  slug: string,
  input: AdvancePersistedNarrativeInput
): Promise<void> {
  await appendPersistedSessionEvent(slug, {
    actorId: input.actorId,
    eventType: 'narrative_time_advanced',
    payload: { ...input.by }
  });
}

/** Dissipe un sort actif (seul moyen de terminer un sort permanent). */
export async function dispelPersistedSpell(
  slug: string,
  input: DispelPersistedSpellInput
): Promise<void> {
  await appendPersistedSessionEvent(slug, {
    actorId: input.actorId,
    eventType: 'spell_dispelled',
    payload: { activeSpellId: input.activeSpellId }
  });
}

export async function requestPersistedRollback(
  slug: string,
  input: RequestPersistedRollbackInput
): Promise<SessionManagerState | undefined> {
  const body = await postSessionJson<{ revertedState?: SessionManagerState }>(
    slug,
    `/sessions/${encodeURIComponent(slug)}/rollback`,
    input
  );

  return body.revertedState;
}

async function getPersistedSessionSnapshot(slug: string): Promise<PersistedSessionSnapshot> {
  const baseUrl = getClientApiBaseUrl();
  const response = await fetch(`${baseUrl}/sessions/${encodeURIComponent(slug)}`, {
    cache: 'no-store'
  });

  if (response.status === 404) {
    return createPersistedSessionSnapshot(slug);
  }

  if (!response.ok) {
    throw new Error(`Unable to load session ${slug}: HTTP ${response.status}`);
  }

  return (await response.json()) as PersistedSessionSnapshot;
}

async function postSessionJson<ResponseBody>(
  slug: string,
  path: string,
  body: object
): Promise<ResponseBody> {
  const baseUrl = getClientApiBaseUrl();
  let response = await fetch(`${baseUrl}${path}`, {
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    method: 'POST'
  });

  if (response.status === 404) {
    await createPersistedSessionSnapshot(slug);
    response = await fetch(`${baseUrl}${path}`, {
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
      method: 'POST'
    });
  }

  if (!response.ok) {
    throw new Error(`Unable to persist session journal entry for ${slug}: HTTP ${response.status}`);
  }

  return (await response.json()) as ResponseBody;
}

async function createPersistedSessionSnapshot(slug: string): Promise<PersistedSessionSnapshot> {
  const baseUrl = getClientApiBaseUrl();
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

function normalizeOptionalText(value: string | undefined): string | undefined {
  const normalized = value?.trim();

  return normalized && normalized.length > 0 ? normalized : undefined;
}
