import {
  appendSessionEvent,
  createSessionState,
  getPendingDecisions,
  queueGmDecision,
  requestSessionRollback,
  resolveGmDecision,
  type AppendSessionEventInput,
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

export interface SessionManagerView {
  activeScene?: SessionScene;
  decisionQueue: SessionDecisionRow[];
  metrics: {
    activePlayers: number;
    events: number;
    pendingDecisions: number;
    scenes: number;
  };
  playerRows: Array<SessionPlayer & { statusLabel: string }>;
  recentEvents: SessionEventRow[];
  rollbackTargets: RollbackTargetRow[];
  summaryMetrics: SessionManagerMetric[];
}

const eventLabels: Record<SessionEventType, string> = {
  combat: 'Combat',
  dice_roll: 'Jet de des',
  gm_decision_requested: 'Decision MJ demandee',
  gm_decision_resolved: 'Decision MJ resolue',
  gm_ruling: 'Arbitrage MJ',
  narration: 'Narration',
  player_action: 'Action joueur',
  rollback_requested: 'Rollback demande',
  scene_opened: 'Scene ouverte'
};

export function createSessionManagerState(
  input: CreateSessionManagerStateInput = {}
): SessionManagerState {
  return createSessionState({
    decisions: input.decisions,
    events: input.events,
    id: input.id ?? 'session-brumeval',
    metadata: input.metadata ?? {
      campaign: 'Les Brumes de Valombre',
      cadence: 'async'
    },
    mode: input.mode ?? 'digital_human_gm',
    players: input.players ?? defaultPlayers(),
    scenes: input.scenes ?? defaultScenes(),
    slug: input.slug ?? 'brumeval',
    status: input.status ?? 'active',
    title: input.title ?? 'Brumeval'
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

function defaultPlayers(): SessionPlayer[] {
  return [
    {
      connected: true,
      id: 'gm',
      lastSeenAt: '2026-04-30T10:00:00.000Z',
      name: 'MJ',
      role: 'human_gm'
    },
    {
      characterId: 'aveline',
      connected: true,
      id: 'aveline',
      lastSeenAt: '2026-04-30T10:02:00.000Z',
      name: 'Aveline',
      role: 'player'
    },
    {
      characterId: 'mire',
      connected: false,
      id: 'mire',
      lastSeenAt: '2026-04-29T20:20:00.000Z',
      name: 'Mire',
      role: 'player'
    }
  ];
}

function defaultScenes(): SessionScene[] {
  return [
    {
      description: 'Arrivee sous la pluie, garde fatigue, tension basse.',
      id: 'brumeval-gate',
      location: 'Brumeval',
      npcIds: ['guetteur', 'brigand-cache'],
      openedAtSequence: 1,
      status: 'active',
      title: 'Porte nord'
    },
    {
      description: 'Auberge dense, rumeurs et repos possible.',
      id: 'auberge-corbeau',
      location: 'Brumeval',
      npcIds: ['aubergiste'],
      status: 'draft',
      title: 'Auberge du Corbeau'
    }
  ];
}
