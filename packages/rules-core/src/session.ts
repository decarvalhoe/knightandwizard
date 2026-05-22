export const SESSION_MODES = [
  'classic_table',
  'digital_human_gm',
  'digital_llm_gm',
  'digital_auto_gm',
  'multiplayer_no_gm'
] as const;

export const SESSION_STATUSES = ['planned', 'active', 'paused', 'archived'] as const;

export const SESSION_CONTROLLER_ROLES = ['player', 'human_gm', 'llm', 'auto'] as const;

export const SESSION_EVENT_TYPES = [
  'scene_opened',
  'narration',
  'player_action',
  'dice_roll',
  'combat',
  'gm_ruling',
  'gm_decision_requested',
  'gm_decision_resolved',
  'rollback_requested'
] as const;

export const SESSION_DECISION_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;

export const SESSION_DECISION_STATUSES = ['pending', 'approved', 'rejected', 'superseded'] as const;

export type SessionMode = (typeof SESSION_MODES)[number];
export type SessionStatus = (typeof SESSION_STATUSES)[number];
export type SessionControllerRole = (typeof SESSION_CONTROLLER_ROLES)[number];
export type SessionEventType = (typeof SESSION_EVENT_TYPES)[number];
export type SessionDecisionPriority = (typeof SESSION_DECISION_PRIORITIES)[number];
export type SessionDecisionStatus = (typeof SESSION_DECISION_STATUSES)[number];

export interface SessionPlayer {
  characterId?: string;
  connected?: boolean;
  id: string;
  lastSeenAt?: string;
  name: string;
  role: SessionControllerRole;
}

export interface SessionScene {
  description?: string;
  id: string;
  location: string;
  npcIds?: string[];
  openedAtSequence?: number;
  status: 'active' | 'closed' | 'draft';
  title: string;
}

export interface SessionEvent {
  actorId?: string;
  createdAt: string;
  id: string;
  payload: Record<string, unknown>;
  sequence: number;
  type: SessionEventType;
}

export interface SessionDecision {
  assignedTo: SessionControllerRole;
  createdAt: string;
  id: string;
  payload: Record<string, unknown>;
  priority: SessionDecisionPriority;
  requestedBy: string;
  resolution?: Record<string, unknown>;
  resolvedAt?: string;
  status: SessionDecisionStatus;
  title: string;
}

export interface SessionAuditEntry {
  action: string;
  actorId?: string;
  createdAt: string;
  entityId?: string;
  entityType: 'session' | 'session_decision' | 'session_event';
  id: string;
  payload: Record<string, unknown>;
}

export interface SessionState {
  audit: SessionAuditEntry[];
  createdAt: string;
  decisions: SessionDecision[];
  events: SessionEvent[];
  id: string;
  metadata: Record<string, unknown>;
  mode: SessionMode;
  players: SessionPlayer[];
  scenes: SessionScene[];
  slug: string;
  status: SessionStatus;
  title: string;
  updatedAt: string;
}

export interface CreateSessionStateInput {
  audit?: SessionAuditEntry[];
  createdAt?: string;
  decisions?: SessionDecision[];
  events?: SessionEvent[];
  id: string;
  metadata?: Record<string, unknown>;
  mode?: SessionMode;
  players?: SessionPlayer[];
  scenes?: SessionScene[];
  slug: string;
  status?: SessionStatus;
  title: string;
  updatedAt?: string;
}

export interface AppendSessionEventInput {
  actorId?: string;
  payload?: Record<string, unknown>;
  type: SessionEventType;
}

export interface QueueGmDecisionInput {
  assignedTo?: SessionControllerRole;
  payload?: Record<string, unknown>;
  priority?: SessionDecisionPriority;
  requestedBy: string;
  title: string;
}

export interface ResolveGmDecisionInput {
  actorId: string;
  resolution?: Record<string, unknown>;
  status: Exclude<SessionDecisionStatus, 'pending'>;
}

export interface RequestRollbackInput {
  actorId: string;
  reason: string;
  targetSequence: number;
}

export interface SessionMutationOptions {
  decisionId?: string;
  eventId?: string;
  id?: string;
  now?: string;
}

const priorityRank: Record<SessionDecisionPriority, number> = {
  low: 0,
  normal: 1,
  high: 2,
  urgent: 3
};

export function createSessionState(input: CreateSessionStateInput): SessionState {
  const now = input.createdAt ?? new Date().toISOString();

  return {
    audit: input.audit ? [...input.audit] : [],
    createdAt: now,
    decisions: input.decisions ? [...input.decisions] : [],
    events: sortEvents(input.events ?? []),
    id: input.id,
    metadata: normalizePayload(input.metadata),
    mode: input.mode ?? 'classic_table',
    players: input.players ? [...input.players] : [],
    scenes: input.scenes ? [...input.scenes] : [],
    slug: input.slug,
    status: input.status ?? 'planned',
    title: input.title,
    updatedAt: input.updatedAt ?? now
  };
}

export function appendSessionEvent(
  state: SessionState,
  input: AppendSessionEventInput,
  options: SessionMutationOptions = {}
): SessionState {
  const now = options.now ?? new Date().toISOString();
  const sequence = nextEventSequence(state.events);
  const event: SessionEvent = {
    actorId: input.actorId,
    createdAt: now,
    id: options.id ?? options.eventId ?? `${state.slug}-event-${sequence}`,
    payload: normalizePayload(input.payload),
    sequence,
    type: input.type
  };

  return {
    ...state,
    audit: [
      ...state.audit,
      createAuditEntry(state, {
        action: 'session.event.appended',
        actorId: input.actorId,
        entityId: event.id,
        entityType: 'session_event',
        id: `${event.id}-audit`,
        now,
        payload: {
          eventType: event.type,
          sequence: event.sequence,
          sessionId: state.id
        }
      })
    ],
    events: [...state.events, event],
    updatedAt: now
  };
}

export function queueGmDecision(
  state: SessionState,
  input: QueueGmDecisionInput,
  options: SessionMutationOptions = {}
): SessionState {
  const now = options.now ?? new Date().toISOString();
  const decision: SessionDecision = {
    assignedTo: input.assignedTo ?? 'human_gm',
    createdAt: now,
    id: options.decisionId ?? `${state.slug}-decision-${state.decisions.length + 1}`,
    payload: normalizePayload(input.payload),
    priority: input.priority ?? 'normal',
    requestedBy: input.requestedBy,
    status: 'pending',
    title: input.title
  };
  const withDecision = {
    ...state,
    decisions: [...state.decisions, decision],
    updatedAt: now
  };
  const withEvent = appendSessionEvent(
    withDecision,
    {
      actorId: input.requestedBy,
      payload: {
        assignedTo: decision.assignedTo,
        decisionId: decision.id,
        payload: decision.payload,
        priority: decision.priority,
        requestedBy: decision.requestedBy,
        title: decision.title
      },
      type: 'gm_decision_requested'
    },
    {
      eventId: options.eventId,
      now
    }
  );

  return {
    ...withEvent,
    audit: [
      ...withEvent.audit,
      createAuditEntry(state, {
        action: 'session.decision.queued',
        actorId: input.requestedBy,
        entityId: decision.id,
        entityType: 'session_decision',
        id: `${decision.id}-queued-audit`,
        now,
        payload: {
          assignedTo: decision.assignedTo,
          priority: decision.priority,
          sessionId: state.id
        }
      })
    ]
  };
}

export function resolveGmDecision(
  state: SessionState,
  decisionId: string,
  input: ResolveGmDecisionInput,
  options: SessionMutationOptions = {}
): SessionState {
  const decision = state.decisions.find((candidate) => candidate.id === decisionId);

  if (!decision) {
    throw new Error(`Unknown GM decision: ${decisionId}`);
  }

  if (decision.status !== 'pending') {
    throw new Error(`GM decision is already resolved: ${decisionId}`);
  }

  const now = options.now ?? new Date().toISOString();
  const decisions = state.decisions.map((candidate) =>
    candidate.id === decisionId
      ? {
          ...candidate,
          resolution: normalizePayload(input.resolution),
          resolvedAt: now,
          status: input.status
        }
      : candidate
  );
  const withDecision = {
    ...state,
    decisions,
    updatedAt: now
  };
  const withEvent = appendSessionEvent(
    withDecision,
    {
      actorId: input.actorId,
      payload: {
        decisionId,
        resolution: normalizePayload(input.resolution),
        status: input.status
      },
      type: 'gm_decision_resolved'
    },
    {
      eventId: options.eventId,
      now
    }
  );

  return {
    ...withEvent,
    audit: [
      ...withEvent.audit,
      createAuditEntry(state, {
        action: 'session.decision.resolved',
        actorId: input.actorId,
        entityId: decisionId,
        entityType: 'session_decision',
        id: `${decisionId}-resolved-audit`,
        now,
        payload: {
          sessionId: state.id,
          status: input.status
        }
      })
    ]
  };
}

export function requestSessionRollback(
  state: SessionState,
  input: RequestRollbackInput,
  options: SessionMutationOptions = {}
): SessionState {
  const target = state.events.find((event) => event.sequence === input.targetSequence);

  if (!target) {
    throw new Error('targetSequence must reference an existing event');
  }

  const now = options.now ?? new Date().toISOString();
  const withEvent = appendSessionEvent(
    state,
    {
      actorId: input.actorId,
      payload: {
        reason: input.reason,
        targetEventId: target.id,
        targetSequence: target.sequence
      },
      type: 'rollback_requested'
    },
    {
      eventId: options.eventId,
      now
    }
  );

  return {
    ...withEvent,
    audit: [
      ...withEvent.audit,
      createAuditEntry(state, {
        action: 'session.rollback.requested',
        actorId: input.actorId,
        entityId: state.id,
        entityType: 'session',
        id: `${state.slug}-rollback-${target.sequence}-audit`,
        now,
        payload: {
          reason: input.reason,
          targetSequence: target.sequence
        }
      })
    ]
  };
}

/**
 * Validates a rollback target and returns the reconstructed prior state.
 *
 * Unlike {@link requestSessionRollback} — which preserves history by appending
 * a `rollback_requested` marker — this performs the actual revert: it rebuilds
 * the derived projection (scenes, decisions, retained events) from the ordered
 * log up to and including `targetSequence`. Throws when the target does not
 * reference an existing event.
 */
export function revertSessionToSequence(
  state: SessionState,
  targetSequence: number
): SessionState {
  const target = state.events.find((event) => event.sequence === targetSequence);

  if (!target) {
    throw new Error('targetSequence must reference an existing event');
  }

  return rebuildSessionStateFromEvents(state, { upToSequence: targetSequence });
}

export interface RebuildSessionStateOptions {
  /**
   * When provided, only events whose sequence is less than or equal to this
   * value are folded into the reconstructed state. Events after the target are
   * dropped from the rebuilt projection. Defaults to the latest event.
   */
  upToSequence?: number;
  /** Timestamp used for the rebuilt `updatedAt`. Defaults to the last folded event's `createdAt`. */
  now?: string;
}

/**
 * Pure event-sourced reconstruction of the derived session projection.
 *
 * The immutable event log is the source of truth: `scenes` and `decisions` are
 * recomputed by folding the ordered events up to (and including) the target
 * sequence. This is a real rollback/revert — it reconstructs the prior state
 * rather than appending a marker. Players, mode, slug, title and the audit
 * trail are session-level facts and are preserved from the input `state`.
 *
 * Events strictly after `upToSequence` are removed from the rebuilt projection,
 * so callers obtain the exact state the session had at that point in time.
 */
export function rebuildSessionStateFromEvents(
  state: SessionState,
  options: RebuildSessionStateOptions = {}
): SessionState {
  const ordered = sortEvents(state.events);
  const target =
    options.upToSequence ?? ordered.reduce((max, event) => Math.max(max, event.sequence), 0);
  const retained = ordered.filter((event) => event.sequence <= target);
  const projection = retained.reduce<SessionProjection>(reduceSessionEvent, {
    decisions: [],
    scenes: []
  });
  const lastEvent = retained.at(-1);

  return {
    ...state,
    decisions: projection.decisions,
    events: retained,
    scenes: projection.scenes,
    updatedAt: options.now ?? lastEvent?.createdAt ?? state.createdAt
  };
}

interface SessionProjection {
  decisions: SessionDecision[];
  scenes: SessionScene[];
}

function reduceSessionEvent(projection: SessionProjection, event: SessionEvent): SessionProjection {
  switch (event.type) {
    case 'scene_opened':
      return {
        ...projection,
        scenes: [...projection.scenes, sceneFromEvent(event)]
      };
    case 'gm_decision_requested':
      return {
        ...projection,
        decisions: [...projection.decisions, decisionFromRequestEvent(event)]
      };
    case 'gm_decision_resolved':
      return {
        ...projection,
        decisions: applyDecisionResolution(projection.decisions, event)
      };
    default:
      return projection;
  }
}

function sceneFromEvent(event: SessionEvent): SessionScene {
  const payload = event.payload;

  return {
    description: optionalString(payload.description),
    id: optionalString(payload.sceneId) ?? optionalString(payload.id) ?? `scene-${event.sequence}`,
    location: optionalString(payload.location) ?? 'unknown',
    npcIds: Array.isArray(payload.npcIds)
      ? payload.npcIds.filter((value): value is string => typeof value === 'string')
      : undefined,
    openedAtSequence: event.sequence,
    status: 'active',
    title: optionalString(payload.title) ?? optionalString(payload.location) ?? 'Scene'
  };
}

function decisionFromRequestEvent(event: SessionEvent): SessionDecision {
  const payload = event.payload;
  const assignedTo = optionalString(payload.assignedTo);
  const priority = optionalString(payload.priority);

  return {
    assignedTo: isControllerRole(assignedTo) ? assignedTo : 'human_gm',
    createdAt: event.createdAt,
    id: optionalString(payload.decisionId) ?? `decision-${event.sequence}`,
    payload: isRecord(payload.payload) ? { ...payload.payload } : {},
    priority: isPriority(priority) ? priority : 'normal',
    requestedBy: optionalString(payload.requestedBy) ?? event.actorId ?? 'unknown',
    status: 'pending',
    title: optionalString(payload.title) ?? 'Untitled decision'
  };
}

function applyDecisionResolution(
  decisions: SessionDecision[],
  event: SessionEvent
): SessionDecision[] {
  const decisionId = optionalString(event.payload.decisionId);
  const status = optionalString(event.payload.status);
  const resolvedStatus: SessionDecisionStatus = isDecisionStatus(status) ? status : 'approved';

  return decisions.map((decision) =>
    decision.id === decisionId
      ? {
          ...decision,
          resolution: isRecord(event.payload.resolution) ? { ...event.payload.resolution } : {},
          resolvedAt: event.createdAt,
          status: resolvedStatus
        }
      : decision
  );
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isControllerRole(value: string | undefined): value is SessionControllerRole {
  return value !== undefined && (SESSION_CONTROLLER_ROLES as readonly string[]).includes(value);
}

function isPriority(value: string | undefined): value is SessionDecisionPriority {
  return value !== undefined && (SESSION_DECISION_PRIORITIES as readonly string[]).includes(value);
}

function isDecisionStatus(value: string | undefined): value is SessionDecisionStatus {
  return value !== undefined && (SESSION_DECISION_STATUSES as readonly string[]).includes(value);
}

export function getPendingDecisions(state: SessionState): SessionDecision[] {
  return state.decisions
    .filter((decision) => decision.status === 'pending')
    .sort((left, right) => {
      const priorityDelta = priorityRank[right.priority] - priorityRank[left.priority];

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return left.createdAt.localeCompare(right.createdAt);
    });
}

function nextEventSequence(events: SessionEvent[]): number {
  return events.reduce((max, event) => Math.max(max, event.sequence), 0) + 1;
}

function sortEvents(events: SessionEvent[]): SessionEvent[] {
  return [...events].sort((left, right) => left.sequence - right.sequence);
}

function normalizePayload(payload: Record<string, unknown> | undefined): Record<string, unknown> {
  return payload === undefined ? {} : { ...payload };
}

function createAuditEntry(
  state: SessionState,
  input: {
    action: string;
    actorId?: string;
    entityId?: string;
    entityType: SessionAuditEntry['entityType'];
    id: string;
    now: string;
    payload: Record<string, unknown>;
  }
): SessionAuditEntry {
  return {
    action: input.action,
    actorId: input.actorId,
    createdAt: input.now,
    entityId: input.entityId,
    entityType: input.entityType,
    id: input.id,
    payload: {
      sessionId: state.id,
      ...input.payload
    }
  };
}
