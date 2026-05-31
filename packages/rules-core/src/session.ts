import {
  type ActiveSpell,
  type NarrativeAdvance,
  type NarrativeCadenceMultiplier,
  type SpellDurationUnit,
  NARRATIVE_CADENCE_MULTIPLIERS,
  SPELL_DURATION_UNITS,
  advanceNarrative,
  endCombat,
  expireActiveSpells,
  isActiveSpellExpired
} from './narrative-time.js';

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
  'change_request_submitted',
  'change_request_resolved',
  'rollback_requested',
  'narrative_time_advanced',
  'combat_ended',
  'spell_cast',
  'spell_renewed',
  'spell_dispelled'
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
  /** Sorts encore actifs à l'instant narratif courant (R-8.20), dérivés du journal. */
  activeSpells: ActiveSpell[];
  audit: SessionAuditEntry[];
  createdAt: string;
  decisions: SessionDecision[];
  events: SessionEvent[];
  id: string;
  metadata: Record<string, unknown>;
  mode: SessionMode;
  /** Horloge narrative en secondes (R-8.20), dérivée du journal d'événements. */
  narrativeSeconds: number;
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
  const events = sortEvents(input.events ?? []);
  const clock = foldNarrativeClock(events);

  return {
    activeSpells: activeSpellsAt(clock),
    audit: input.audit ? [...input.audit] : [],
    createdAt: now,
    decisions: input.decisions ? [...input.decisions] : [],
    events,
    id: input.id,
    metadata: normalizePayload(input.metadata),
    mode: input.mode ?? 'classic_table',
    narrativeSeconds: clock.narrativeSeconds,
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

  return withNarrativeClock({
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
  });
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
export function revertSessionToSequence(state: SessionState, targetSequence: number): SessionState {
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
  const clock = foldNarrativeClock(retained);
  const lastEvent = retained.at(-1);

  return {
    ...state,
    activeSpells: activeSpellsAt(clock),
    decisions: projection.decisions,
    events: retained,
    narrativeSeconds: clock.narrativeSeconds,
    scenes: projection.scenes,
    updatedAt: options.now ?? lastEvent?.createdAt ?? state.createdAt
  };
}

/**
 * Projects the current playable state from the immutable session journal.
 *
 * A rollback marker does not delete history. It invalidates the slice after its
 * target up to the marker itself, while events appended after the marker are the
 * new branch of play. The projected state therefore keeps:
 * - events at or before the rollback target;
 * - events appended after the latest rollback marker.
 */
export function projectSessionStateFromJournal(state: SessionState): SessionState {
  const currentEvents = selectCurrentSessionEvents(state.events);

  return rebuildSessionStateFromEvents({ ...state, events: currentEvents });
}

function selectCurrentSessionEvents(events: SessionEvent[]): SessionEvent[] {
  const latestRollback = findLatestValidRollbackMarker(events);

  if (!latestRollback) {
    return sortEvents(events);
  }

  return sortEvents(events).filter(
    (event) =>
      event.sequence <= latestRollback.targetSequence || event.sequence > latestRollback.sequence
  );
}

function findLatestValidRollbackMarker(
  events: SessionEvent[]
): { sequence: number; targetSequence: number } | undefined {
  const sortedEvents = sortEvents(events).sort((left, right) => right.sequence - left.sequence);

  for (const event of sortedEvents) {
    if (event.type !== 'rollback_requested') {
      continue;
    }

    const targetSequence = event.payload.targetSequence;

    if (
      typeof targetSequence === 'number' &&
      events.some((candidate) => candidate.sequence === targetSequence)
    ) {
      return { sequence: event.sequence, targetSequence };
    }
  }

  return undefined;
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

// --- Horloge narrative « temps double » (R-8.20) -----------------------------
// La narrativeSeconds et les sorts actifs sont une projection pure du journal :
// un rollback rembobine donc automatiquement le temps et l'état des sorts.

export interface AdvanceSessionNarrativeInput {
  actorId?: string;
  by: NarrativeAdvance;
}

export interface EndSessionCombatInput {
  actorId?: string;
  /** DT cumulés de la scène de combat (R-8.20 : 1 DT = 0,2 s). */
  elapsedDT: number;
}

export interface CastSessionSpellInput {
  actorId?: string;
  /** Identifiant stable de l'instance de sort (défaut : dérivé de la séquence). */
  activeSpellId?: string;
  /** Quantité de durée déjà résolue (mise à l'échelle par réussites le cas échéant). */
  durationAmount: number;
  durationUnit: SpellDurationUnit;
  spellId?: string;
  targetId?: string;
}

export interface DispelSessionSpellInput {
  actorId?: string;
  activeSpellId: string;
}

export interface RenewSessionSpellInput {
  actorId?: string;
  activeSpellId: string;
}

interface NarrativeClock {
  /** Instant narratif courant en secondes (R-8.20). */
  narrativeSeconds: number;
  /** Tous les sorts lancés (chacun avec son castAtSeconds), moins ceux dissipés. */
  spells: ActiveSpell[];
}

/** Avance l'horloge narrative (contrôle MJ « passer la journée / N heures », R-8.20). */
export function advanceSessionNarrative(
  state: SessionState,
  input: AdvanceSessionNarrativeInput,
  options: SessionMutationOptions = {}
): SessionState {
  return appendSessionEvent(
    state,
    { actorId: input.actorId, payload: { ...input.by }, type: 'narrative_time_advanced' },
    options
  );
}

/** Fin de combat (R-8.20) : replie les DT écoulés de la scène sur l'horloge narrative. */
export function endSessionCombat(
  state: SessionState,
  input: EndSessionCombatInput,
  options: SessionMutationOptions = {}
): SessionState {
  return appendSessionEvent(
    state,
    { actorId: input.actorId, payload: { elapsedDT: input.elapsedDT }, type: 'combat_ended' },
    options
  );
}

/** Inscrit un sort actif sur l'horloge narrative ; son castAtSeconds est l'instant courant. */
export function castSessionSpell(
  state: SessionState,
  input: CastSessionSpellInput,
  options: SessionMutationOptions = {}
): SessionState {
  return appendSessionEvent(
    state,
    {
      actorId: input.actorId,
      payload: {
        activeSpellId: input.activeSpellId,
        durationAmount: input.durationAmount,
        durationUnit: input.durationUnit,
        spellId: input.spellId,
        targetId: input.targetId
      },
      type: 'spell_cast'
    },
    options
  );
}

/** Renouvelle un sort actif sans nouveau jet : même durée/réussites, nouveau départ d'expiration. */
export function renewSessionSpell(
  state: SessionState,
  input: RenewSessionSpellInput,
  options: SessionMutationOptions = {}
): SessionState {
  return appendSessionEvent(
    state,
    {
      actorId: input.actorId,
      payload: { activeSpellId: input.activeSpellId },
      type: 'spell_renewed'
    },
    options
  );
}

/** Dissipe un sort actif (seul moyen de terminer un sort `permanent`). */
export function dispelSessionSpell(
  state: SessionState,
  input: DispelSessionSpellInput,
  options: SessionMutationOptions = {}
): SessionState {
  return appendSessionEvent(
    state,
    {
      actorId: input.actorId,
      payload: { activeSpellId: input.activeSpellId },
      type: 'spell_dispelled'
    },
    options
  );
}

/** Sorts encore actifs à l'instant narratif courant de la session. */
export function getActiveSpells(state: SessionState): ActiveSpell[] {
  return state.activeSpells;
}

/**
 * Recalcule UNIQUEMENT la projection d'horloge narrative (`narrativeSeconds` +
 * `activeSpells`) depuis le journal, en préservant les autres facettes (scenes,
 * decisions…). Utile côté client après application d'un événement live, où les
 * scènes proviennent des métadonnées et non du fold d'événements.
 */
export function projectSessionNarrativeClock(state: SessionState): SessionState {
  return withNarrativeClock(state);
}

/** Recalcule les champs dérivés de l'horloge narrative à partir du journal. */
function withNarrativeClock(state: SessionState): SessionState {
  const clock = foldNarrativeClock(state.events);

  return {
    ...state,
    activeSpells: activeSpellsAt(clock),
    narrativeSeconds: clock.narrativeSeconds
  };
}

function activeSpellsAt(clock: NarrativeClock): ActiveSpell[] {
  return expireActiveSpells(clock.spells, clock.narrativeSeconds).active;
}

function foldNarrativeClock(events: SessionEvent[]): NarrativeClock {
  return sortEvents(events).reduce<NarrativeClock>(reduceNarrativeEvent, {
    narrativeSeconds: 0,
    spells: []
  });
}

function reduceNarrativeEvent(clock: NarrativeClock, event: SessionEvent): NarrativeClock {
  switch (event.type) {
    case 'narrative_time_advanced':
      return {
        ...clock,
        narrativeSeconds: advanceNarrative(
          clock.narrativeSeconds,
          narrativeAdvanceFromPayload(event.payload)
        )
      };
    case 'combat_ended':
      return {
        ...clock,
        narrativeSeconds: endCombat(
          clock.narrativeSeconds,
          nonNegativeNumber(event.payload.elapsedDT)
        )
      };
    case 'spell_cast': {
      const spell = activeSpellFromEvent(event, clock.narrativeSeconds);

      return spell === undefined ? clock : { ...clock, spells: [...clock.spells, spell] };
    }
    case 'spell_renewed': {
      const id = optionalString(event.payload.activeSpellId) ?? optionalString(event.payload.id);

      if (id === undefined) {
        return clock;
      }

      let renewed = false;
      const spells = clock.spells.map((spell) => {
        if (spell.id !== id || isActiveSpellExpired(spell, clock.narrativeSeconds)) {
          return spell;
        }

        renewed = true;
        return { ...spell, castAtSeconds: clock.narrativeSeconds };
      });

      return renewed ? { ...clock, spells } : clock;
    }
    case 'spell_dispelled': {
      const id = optionalString(event.payload.activeSpellId) ?? optionalString(event.payload.id);

      return id === undefined
        ? clock
        : { ...clock, spells: clock.spells.filter((spell) => spell.id !== id) };
    }
    default:
      return clock;
  }
}

function narrativeAdvanceFromPayload(payload: Record<string, unknown>): NarrativeAdvance {
  return {
    cadenceMultiplier: readNarrativeCadenceMultiplier(payload.cadenceMultiplier),
    days: nonNegativeNumber(payload.days),
    hours: nonNegativeNumber(payload.hours),
    minutes: nonNegativeNumber(payload.minutes),
    seconds: nonNegativeNumber(payload.seconds)
  };
}

function readNarrativeCadenceMultiplier(value: unknown): NarrativeCadenceMultiplier | undefined {
  return typeof value === 'number' &&
    NARRATIVE_CADENCE_MULTIPLIERS.some((multiplier) => multiplier === value)
    ? (value as NarrativeCadenceMultiplier)
    : undefined;
}

function activeSpellFromEvent(event: SessionEvent, castAtSeconds: number): ActiveSpell | undefined {
  const payload = event.payload;
  const durationUnit = optionalString(payload.durationUnit);

  if (!isSpellDurationUnit(durationUnit)) {
    return undefined;
  }

  return {
    castAtSeconds,
    durationAmount: nonNegativeNumber(payload.durationAmount),
    durationUnit,
    id:
      optionalString(payload.activeSpellId) ??
      optionalString(payload.id) ??
      `spell-${event.sequence}`,
    spellId: optionalString(payload.spellId),
    targetId: optionalString(payload.targetId)
  };
}

function isSpellDurationUnit(value: string | undefined): value is SpellDurationUnit {
  return value !== undefined && (SPELL_DURATION_UNITS as readonly string[]).includes(value);
}

function nonNegativeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
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
