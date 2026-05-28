import {
  appendSessionEvent,
  createSessionState,
  getPendingDecisions,
  projectSessionNarrativeClock,
  queueGmDecision,
  requestSessionRollback,
  resolveGmDecision,
  spellExpiresAt,
  type ActiveSpell,
  type AppendSessionEventInput,
  type SessionAuditEntry,
  type SessionDecision,
  type SessionDecisionStatus,
  type SessionEvent,
  type SessionEventType,
  type SessionMutationOptions,
  type SessionPlayer,
  type SessionScene,
  type SessionState
} from '@knightandwizard/rules-core';

export type SessionManagerState = SessionState;

export interface CreateSessionManagerStateInput {
  audit?: SessionAuditEntry[];
  createdAt?: string;
  decisions?: SessionDecision[];
  events?: SessionEvent[];
  id?: string;
  metadata?: Record<string, unknown>;
  mode?: SessionState['mode'];
  players?: SessionPlayer[];
  scenes?: SessionScene[];
  slug?: string;
  status?: SessionState['status'];
  title?: string;
  updatedAt?: string;
}

export interface SessionManagerMetric {
  label: string;
  value: number | string;
}

export interface SessionEventRow {
  createdAt: string;
  detail: string;
  label: string;
  sequence: number;
  tone: 'audit' | 'decision' | 'neutral' | 'rules';
}

export interface SessionDecisionRow {
  assignedTo: string;
  createdAt: string;
  id: string;
  priority: SessionDecision['priority'];
  requestedBy: string;
  title: string;
}

export interface RollbackTargetRow {
  label: string;
  sequence: number;
}

export interface ActiveSpellRow {
  id: string;
  label: string;
  permanent: boolean;
  remainingLabel: string;
  target?: string;
}

export interface NarrativeClockView {
  /** Instant narratif formaté (« Jour N · HH:MM:SS »). */
  instantLabel: string;
  narrativeSeconds: number;
  activeSpells: ActiveSpellRow[];
}

export interface SessionManagerView {
  activeScene?: SessionScene;
  decisionQueue: SessionDecisionRow[];
  metrics: {
    activePlayers: number;
    events: number;
    pendingDecisions: number;
    scenes: number;
  };
  narrativeClock: NarrativeClockView;
  playerRows: Array<SessionPlayer & { statusLabel: string }>;
  recentEvents: SessionEventRow[];
  rollbackTargets: RollbackTargetRow[];
  summaryMetrics: SessionManagerMetric[];
}

const eventLabels: Record<SessionEventType, string> = {
  combat: 'Combat',
  combat_ended: 'Fin de combat',
  dice_roll: 'Jet de des',
  gm_decision_requested: 'Decision MJ demandee',
  gm_decision_resolved: 'Decision MJ resolue',
  gm_ruling: 'Arbitrage MJ',
  narration: 'Narration',
  narrative_time_advanced: 'Temps narratif avance',
  player_action: 'Action joueur',
  rollback_requested: 'Rollback demande',
  scene_opened: 'Scene ouverte',
  spell_cast: 'Sort lance',
  spell_dispelled: 'Sort dissipe'
};

export function createSessionManagerState(
  input: CreateSessionManagerStateInput = {}
): SessionManagerState {
  return createSessionState({
    audit: input.audit,
    createdAt: input.createdAt,
    decisions: input.decisions,
    events: input.events,
    id: input.id ?? 'session-empty',
    metadata: input.metadata ?? {},
    mode: input.mode ?? 'digital_human_gm',
    players: input.players ?? [],
    scenes: input.scenes ?? [],
    slug: input.slug ?? 'session-empty',
    status: input.status ?? 'planned',
    title: input.title ?? 'Session',
    updatedAt: input.updatedAt
  });
}

export function buildSessionManagerView(state: SessionManagerState): SessionManagerView {
  const pendingDecisions = getPendingDecisions(state);
  const activePlayers = state.players.filter((player) => player.connected !== false).length;
  const metrics = {
    activePlayers,
    events: state.events.length,
    pendingDecisions: pendingDecisions.length,
    scenes: state.scenes.length
  };

  return {
    activeScene: getActiveScene(state),
    decisionQueue: pendingDecisions.map((decision) => ({
      assignedTo: roleLabel(decision.assignedTo),
      createdAt: decision.createdAt,
      id: decision.id,
      priority: decision.priority,
      requestedBy: actorName(state, decision.requestedBy),
      title: decision.title
    })),
    metrics,
    narrativeClock: buildNarrativeClockView(state),
    playerRows: state.players.map((player) => ({
      ...player,
      statusLabel: player.connected === false ? 'Hors ligne' : 'Connecte'
    })),
    recentEvents: [...state.events]
      .sort((left, right) => right.sequence - left.sequence)
      .slice(0, 8)
      .map((event) => toEventRow(state, event)),
    rollbackTargets: [...state.events]
      .sort((left, right) => right.sequence - left.sequence)
      .slice(0, 5)
      .map((event) => ({
        label: `#${event.sequence} · ${toEventRow(state, event).label}`,
        sequence: event.sequence
      })),
    summaryMetrics: [
      { label: 'Joueurs actifs', value: metrics.activePlayers },
      { label: 'Scenes', value: metrics.scenes },
      { label: 'Evenements', value: metrics.events },
      { label: 'Decisions MJ', value: metrics.pendingDecisions }
    ]
  };
}

export function recordSessionEvent(
  state: SessionManagerState,
  input: AppendSessionEventInput,
  options?: SessionMutationOptions
): SessionManagerState {
  return appendSessionEvent(state, input, options);
}

export function submitGmDecisionRequest(
  state: SessionManagerState,
  title: string,
  options?: SessionMutationOptions
): SessionManagerState {
  return queueGmDecision(
    state,
    {
      assignedTo: 'human_gm',
      payload: { source: 'session-manager' },
      priority: 'high',
      requestedBy: 'llm',
      title
    },
    options
  );
}

export function resolveNextPendingDecision(
  state: SessionManagerState,
  status: Exclude<SessionDecisionStatus, 'pending'>,
  resolution: Record<string, unknown>,
  options?: SessionMutationOptions
): SessionManagerState {
  const nextDecision = getPendingDecisions(state)[0];

  if (!nextDecision) {
    return state;
  }

  return resolveGmDecision(
    state,
    nextDecision.id,
    {
      actorId: 'gm',
      resolution,
      status
    },
    options
  );
}

export function requestRollbackFromEvent(
  state: SessionManagerState,
  targetSequence: number,
  reason: string,
  options?: SessionMutationOptions
): SessionManagerState {
  return requestSessionRollback(
    state,
    {
      actorId: 'gm',
      reason,
      targetSequence
    },
    options
  );
}

export type LiveSessionEventOutcome =
  | { kind: 'applied'; state: SessionManagerState }
  | { kind: 'duplicate' }
  | { kind: 'gap' };

/**
 * Applies a single live (broadcast) event to the local session state.
 * The immutable journal grows strictly by `sequence`: an already-known sequence
 * is a no-op (idempotent dedupe) and a forward gap signals the caller to
 * resynchronise from the authoritative GET /sessions/:slug.
 */
export function applyLiveSessionEvent(
  state: SessionManagerState,
  event: SessionEvent
): LiveSessionEventOutcome {
  const maxSequence = state.events.reduce((max, current) => Math.max(max, current.sequence), 0);

  if (event.sequence <= maxSequence) {
    return { kind: 'duplicate' };
  }

  if (event.sequence === maxSequence + 1) {
    // Recompute only the narrative-clock projection so a live `narrative_time_advanced`
    // (or spell) event keeps the displayed clock/active spells in sync without a refetch.
    return {
      kind: 'applied',
      state: projectSessionNarrativeClock({ ...state, events: [...state.events, event] })
    };
  }

  return { kind: 'gap' };
}

function buildNarrativeClockView(state: SessionManagerState): NarrativeClockView {
  return {
    activeSpells: state.activeSpells.map((spell) =>
      toActiveSpellRow(spell, state.narrativeSeconds)
    ),
    instantLabel: formatNarrativeInstant(state.narrativeSeconds),
    narrativeSeconds: state.narrativeSeconds
  };
}

function toActiveSpellRow(spell: ActiveSpell, nowSeconds: number): ActiveSpellRow {
  const expiresAt = spellExpiresAt(spell);
  const permanent = expiresAt === null;

  return {
    id: spell.id,
    label: spell.spellId ?? 'Sort actif',
    permanent,
    remainingLabel: permanent
      ? 'Permanent (dissipation requise)'
      : `Expire dans ${formatDuration(Math.max(0, expiresAt - nowSeconds))}`,
    target: spell.targetId
  };
}

/** Formate un instant narratif absolu en « Jour N · HH:MM:SS » (R-8.20). */
export function formatNarrativeInstant(totalSeconds: number): string {
  const dayLength = 86_400;
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 0;
  const day = Math.floor(safe / dayLength) + 1;
  const within = Math.floor(safe % dayLength);
  const hours = Math.floor(within / 3_600);
  const minutes = Math.floor((within % 3_600) / 60);
  const seconds = within % 60;

  return `Jour ${day} · ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

/** Formate une durée relative courte (« 2 j 3 h », « 8 min 12 s », « permanent »). */
export function formatDuration(totalSeconds: number): string {
  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.round(totalSeconds) : 0;

  if (safe <= 0) {
    return "moins d'une seconde";
  }

  const days = Math.floor(safe / 86_400);
  const hours = Math.floor((safe % 86_400) / 3_600);
  const minutes = Math.floor((safe % 3_600) / 60);
  const seconds = safe % 60;
  const units: Array<[number, string]> = [
    [days, 'j'],
    [hours, 'h'],
    [minutes, 'min'],
    [seconds, 's']
  ];
  const significant = units.filter(([value]) => value > 0).slice(0, 2);

  return significant.map(([value, unit]) => `${value} ${unit}`).join(' ');
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

function getActiveScene(state: SessionManagerState): SessionScene | undefined {
  return state.scenes.find((scene) => scene.status === 'active') ?? state.scenes[0];
}

function toEventRow(state: SessionManagerState, event: SessionEvent): SessionEventRow {
  const label = `${actorName(state, event.actorId)} · ${eventLabels[event.type]}`;

  return {
    createdAt: event.createdAt,
    detail: eventDetail(event),
    label,
    sequence: event.sequence,
    tone: eventTone(event.type)
  };
}

function eventTone(type: SessionEventType): SessionEventRow['tone'] {
  if (type === 'dice_roll' || type === 'combat' || type === 'gm_ruling') {
    return 'rules';
  }

  if (type === 'gm_decision_requested' || type === 'gm_decision_resolved') {
    return 'decision';
  }

  if (type === 'rollback_requested') {
    return 'audit';
  }

  return 'neutral';
}

function eventDetail(event: SessionEvent): string {
  if (typeof event.payload.text === 'string') {
    return event.payload.text;
  }

  if (typeof event.payload.location === 'string') {
    return event.payload.location;
  }

  if (typeof event.payload.title === 'string') {
    return event.payload.title;
  }

  if (typeof event.payload.reason === 'string') {
    return event.payload.reason;
  }

  if (typeof event.payload.successes === 'number') {
    const parts = [`${event.payload.successes} succes`];

    if (event.payload.isCriticalSuccess === true) {
      parts.push('reussite critique');
    }

    if (event.payload.isCriticalFailure === true) {
      const severity = event.payload.criticalFailureSeverity;
      parts.push(
        typeof severity === 'number' ? `echec critique D100 ${severity}` : 'echec critique'
      );
    }

    return parts.join(' · ');
  }

  return 'Entree canonique';
}

function actorName(state: SessionManagerState, actorId: string | undefined): string {
  if (!actorId) {
    return 'Systeme';
  }

  return state.players.find((player) => player.id === actorId)?.name ?? actorId;
}

function roleLabel(role: SessionPlayer['role']): string {
  if (role === 'human_gm') {
    return 'MJ humain';
  }

  if (role === 'llm') {
    return 'LLM';
  }

  if (role === 'auto') {
    return 'Auto';
  }

  return 'Joueur';
}
