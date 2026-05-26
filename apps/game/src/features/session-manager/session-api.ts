import type {
  SessionDecision,
  SessionEvent,
  SessionMode,
  SessionPlayer,
  SessionScene,
  SessionState,
  SessionStatus
} from '@knightandwizard/rules-core';

import { createSessionManagerState, type SessionManagerState } from './model';

export const DEFAULT_SESSION_SLUG = 'brumeval';

export interface PersistedSessionSnapshot {
  createdAt?: string;
  decisions?: SessionDecision[];
  events?: Array<SessionEvent | PersistedSessionEvent>;
  id?: string;
  metadata?: Record<string, unknown>;
  mode?: SessionMode;
  slug?: string;
  state?: SessionState;
  status?: SessionStatus;
  title?: string;
  updatedAt?: string;
}

export interface PersistedSessionEvent {
  actorId?: string;
  createdAt: string;
  eventType: SessionEvent['type'];
  id: string;
  payload: Record<string, unknown>;
  sequence: number;
}

export interface CreatePersistedSessionPayload {
  metadata: Record<string, unknown>;
  mode: SessionMode;
  slug: string;
  status: SessionStatus;
  title: string;
}

export function createPersistedSessionPayload(slug: string): CreatePersistedSessionPayload {
  return {
    metadata: {},
    mode: 'digital_human_gm',
    slug,
    status: 'active',
    title: titleFromSlug(slug)
  };
}

export function toSessionManagerState(snapshot: PersistedSessionSnapshot): SessionManagerState {
  if (snapshot.state) {
    // Le "Journal canonique" est le log d'evenements immuable. Apres un rollback,
    // le serveur renvoie une projection revertie dans `state` (evenements tronques),
    // mais le journal doit toujours montrer l'historique complet -- y compris le
    // marqueur de rollback que la projection exclut justement. On conserve donc les
    // scenes/decisions/statut projetes et on restaure le log complet depuis `events`.
    const fullEvents = Array.isArray(snapshot.events)
      ? snapshot.events.map(toSessionEvent)
      : undefined;

    if (fullEvents && fullEvents.length > snapshot.state.events.length) {
      return { ...snapshot.state, events: fullEvents };
    }

    return snapshot.state;
  }

  return createSessionManagerState({
    createdAt: snapshot.createdAt,
    decisions: snapshot.decisions ?? [],
    events: (snapshot.events ?? []).map(toSessionEvent),
    id: snapshot.id,
    metadata: snapshot.metadata ?? {},
    mode: snapshot.mode,
    players: toSessionPlayers(snapshot.metadata?.players),
    scenes: toSessionScenes(snapshot.metadata?.scenes),
    slug: snapshot.slug,
    status: snapshot.status,
    title: snapshot.title,
    updatedAt: snapshot.updatedAt
  });
}

export function toSessionEvent(event: SessionEvent | PersistedSessionEvent): SessionEvent {
  if ('type' in event) {
    return event;
  }

  return {
    actorId: event.actorId,
    createdAt: event.createdAt,
    id: event.id,
    payload: event.payload,
    sequence: event.sequence,
    type: event.eventType
  };
}

function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter((part) => part.length > 0)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ');
}

function toSessionPlayers(value: unknown): SessionPlayer[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isSessionPlayer);
}

function toSessionScenes(value: unknown): SessionScene[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isSessionScene);
}

function isSessionPlayer(value: unknown): value is SessionPlayer {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    (value.role === 'player' ||
      value.role === 'human_gm' ||
      value.role === 'llm' ||
      value.role === 'auto')
  );
}

function isSessionScene(value: unknown): value is SessionScene {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.location === 'string' &&
    typeof value.title === 'string' &&
    (value.status === 'active' || value.status === 'closed' || value.status === 'draft')
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
