'use client';

import { RotateCcw, Scale, Undo2 } from 'lucide-react';
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';

import {
  ARBITER_PRECEDENCE,
  buildConflictResolutionPlan,
  getPendingDecisions,
  hasArbiterAuthorityOver,
  nextConflictResolutionStep,
  queueGmDecision,
  requestSessionRollback,
  resolveGmDecision,
  revertSessionToSequence,
  type Arbiter,
  type ConflictResolutionActor,
  type SessionDecision,
  type SessionDecisionStatus,
  type SessionEvent,
  type SessionState
} from '@knightandwizard/rules-core';
import {
  Badge,
  Button,
  Card,
  Label,
  ProgressBar,
  Seal,
  SelectField,
  StatBlock,
  Table,
  type BadgeTone,
  type TableColumn
} from '@knightandwizard/ui';

import {
  createSessionManagerState,
  recordSessionEvent,
  withSessionChangeRequests
} from '@/features/session-manager/model';

type DecisionRow = {
  assignedTo: Arbiter;
  id: string;
  priority: SessionDecision['priority'];
  requestedBy: string;
  resolution: string;
  status: SessionDecisionStatus;
  title: string;
};

type AuthorityRow = {
  arbiter: Arbiter;
  label: string;
  rank: number;
  overrides: string;
};

type ConflictStepRow = {
  actor: string;
  auditRequired: boolean;
  id: string;
  label: string;
  rank: number;
};

type ConflictRecourseRow = {
  auditRequired: boolean;
  consensusRequired: boolean;
  id: string;
  label: string;
};

const surfaceStyle: CSSProperties = {
  background: 'var(--color-bg-canvas)',
  border: 'var(--border-strong) solid var(--color-border-rule)',
  color: 'var(--color-text-ink)',
  display: 'grid',
  fontFamily: 'var(--font-body)',
  gap: 16,
  maxWidth: '100%',
  minWidth: 0,
  overflow: 'hidden',
  padding: 24,
  width: '100%'
};

const heroStyle: CSSProperties = {
  alignItems: 'flex-start',
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
  justifyContent: 'space-between',
  minWidth: 0
};

const titleStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--text-title-l)',
  lineHeight: 'var(--leading-tight)',
  margin: '4px 0'
};

const subtitleStyle: CSSProperties = {
  color: 'var(--color-text-muted)',
  margin: 0
};

const panelTitleStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--text-title-m)',
  lineHeight: 'var(--leading-tight)',
  margin: '4px 0'
};

const cardGridStyle: CSSProperties = {
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
  minWidth: 0
};

const stackStyle: CSSProperties = {
  display: 'grid',
  gap: 12,
  minWidth: 0
};

const inlineStackStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  maxWidth: '100%',
  minWidth: 0
};

const buttonIconStyle: CSSProperties = {
  display: 'inline-flex',
  gap: 8,
  minHeight: 42
};

const iconStyle: CSSProperties = {
  height: 16,
  width: 16
};

const eventListStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
  listStyle: 'none',
  margin: 0,
  padding: 0
};

const eventRowStyle: CSSProperties = {
  border: 'var(--border-hairline) solid var(--color-border-hairline)',
  display: 'grid',
  gap: 8,
  gridTemplateColumns: 'auto minmax(0, 1fr)',
  minWidth: 0,
  padding: 10
};

const mutedStyle: CSSProperties = {
  color: 'var(--color-text-muted)',
  overflowWrap: 'anywhere'
};

const actorNames: Record<string, string> = {
  aveline: 'Aveline',
  auto: 'Automate de table',
  gm: 'MJ',
  mire: 'Mire',
  'scribe-llm': 'Scribe LLM'
};

const roleLabels: Record<Arbiter, string> = {
  auto: 'Auto',
  human_gm: 'MJ humain',
  llm: 'LLM',
  player: 'Joueur'
};

const priorityTones: Record<SessionDecision['priority'], BadgeTone> = {
  high: 'warn',
  low: 'neutral',
  normal: 'info',
  urgent: 'danger'
};

const priorityLabels: Record<SessionDecision['priority'], string> = {
  high: 'haute',
  low: 'basse',
  normal: 'normale',
  urgent: 'urgente'
};

const statusTones: Record<SessionDecisionStatus, BadgeTone> = {
  approved: 'success',
  pending: 'warn',
  rejected: 'danger',
  superseded: 'neutral'
};

const decisionColumns: readonly TableColumn<DecisionRow>[] = [
  {
    cell: (row) => (
      <span style={stackStyle}>
        <strong>{row.title}</strong>
        <span style={mutedStyle}>{row.resolution}</span>
      </span>
    ),
    header: 'Cause',
    id: 'cause'
  },
  {
    cell: (row) => actorLabel(row.requestedBy),
    header: 'Requête',
    id: 'requestedBy'
  },
  {
    cell: (row) => <Badge tone="info">{roleLabels[row.assignedTo]}</Badge>,
    header: 'Arbitre',
    id: 'assignedTo'
  },
  {
    cell: (row) => <Badge tone={priorityTones[row.priority]}>{priorityLabels[row.priority]}</Badge>,
    header: 'Priorité',
    id: 'priority'
  },
  {
    cell: (row) => <Badge tone={statusTones[row.status]}>{statusLabel(row.status)}</Badge>,
    header: 'Statut',
    id: 'status'
  }
];

export default function GreffePage() {
  const [night, setNight] = useState(false);
  const [state, setState] = useState(createInitialGreffeState);
  const [targetSequence, setTargetSequence] = useState('');

  const pendingDecisions = useMemo(() => getPendingDecisions(state), [state]);
  const nextDecision = useMemo(() => selectNextDecisionByAuthority(state), [state]);
  const decisionRows = useMemo(() => state.decisions.map(toDecisionRow), [state]);
  const authorityRows = useMemo(() => buildAuthorityRows(), []);
  const conflictPlan = useMemo(() => buildConflictResolutionPlan('rule_interpretation'), []);
  const conflictRows = useMemo<ConflictStepRow[]>(
    () =>
      conflictPlan.steps.map((step, index) => ({
        actor: conflictActorLabel(step.actor),
        auditRequired: step.auditRequired,
        id: step.id,
        label: step.label,
        rank: index + 1
      })),
    [conflictPlan]
  );
  const recourseRows = useMemo<ConflictRecourseRow[]>(
    () =>
      conflictPlan.recourses.map((recourse) => ({
        auditRequired: recourse.auditRequired,
        consensusRequired: recourse.consensusRequired,
        id: recourse.id,
        label: recourse.label
      })),
    [conflictPlan]
  );
  const activeConflictStep = nextConflictResolutionStep(['discussion_among_table']);
  const recentEvents = useMemo(() => [...state.events].slice(-8).reverse(), [state.events]);
  const rollbackTargets = useMemo(
    () =>
      state.events.map((event) => ({
        label: `#${event.sequence} · ${eventLabel(event)}`,
        value: String(event.sequence)
      })),
    [state.events]
  );
  const selectedTarget = resolveSelectedTarget(state, targetSequence);
  const targetValue = selectedTarget ? String(selectedTarget.sequence) : '';

  function resolveNextCause() {
    if (!nextDecision) {
      return;
    }

    setState((current) =>
      resolveGmDecision(
        current,
        nextDecision.id,
        {
          actorId: actorIdForArbiter(nextDecision.assignedTo),
          resolution: {
            ruling: `Arbitrage rendu par ${roleLabels[nextDecision.assignedTo]}`,
            source: 'rules-core:arbiter'
          },
          status: 'approved'
        },
        {
          eventId: nextDecision.id + '-resolved',
          now: nextTimestamp(current)
        }
      )
    );
  }

  function requestRenvoi() {
    if (!selectedTarget) {
      return;
    }

    setState((current) =>
      requestSessionRollback(
        current,
        {
          actorId: 'gm',
          reason: `Renvoi demandé au greffe vers l'événement #${selectedTarget.sequence}`,
          targetSequence: selectedTarget.sequence
        },
        {
          eventId: `greffe-renvoi-${current.events.length + 1}`,
          now: nextTimestamp(current)
        }
      )
    );
  }

  function pronounceCassation() {
    if (!selectedTarget) {
      return;
    }

    setState((current) => revertSessionToSequence(current, selectedTarget.sequence));
    setTargetSequence(String(selectedTarget.sequence));
  }

  function resetGreffe() {
    setState(createInitialGreffeState());
    setTargetSequence('');
  }

  return (
    <div data-skin="archives" data-theme={night ? 'night' : undefined} style={surfaceStyle}>
      <header style={heroStyle}>
        <div style={stackStyle}>
          <Label>Surface 12 · archives des causes</Label>
          <h1 style={titleStyle}>Greffe des causes</h1>
          <p style={subtitleStyle}>
            Journal des décisions MJ, arbitrage par autorité canonique et procédure de renvoi ou
            cassation.
          </p>
          <div style={inlineStackStyle}>
            <Badge tone="danger">D13</Badge>
            <Badge tone="info">Renvoi</Badge>
            <Badge tone="neutral">Cassation</Badge>
          </div>
        </div>
        <div style={inlineStackStyle}>
          <Button variant="secondary" onClick={() => setNight((current) => !current)}>
            Mode : {night ? 'Veillée' : 'Jour'}
          </Button>
          <Seal>{pendingDecisions.length} en instance</Seal>
        </div>
      </header>

      <Card>
        <StatBlock
          title="État du greffe"
          items={[
            { label: 'Causes', value: state.decisions.length },
            { label: 'En instance', value: pendingDecisions.length },
            { label: 'Événements', value: state.events.length },
            { label: 'Audit', value: state.audit.length }
          ]}
        />
      </Card>

      <div style={cardGridStyle}>
        <Card>
          <div style={heroStyle}>
            <div style={stackStyle}>
              <Label>Multi-arbitrage</Label>
              <h2 style={panelTitleStyle}>Ordre d'autorité</h2>
              <p style={subtitleStyle}>
                La règle D13 donne la main au MJ humain, puis au joueur, au LLM et à l'automate.
                Chaque rang peut casser les rangs inférieurs.
              </p>
            </div>
            <Seal>
              <Scale aria-hidden="true" style={iconStyle} /> D13
            </Seal>
          </div>

          <div style={stackStyle}>
            {authorityRows.map((row) => (
              <div key={row.arbiter} style={stackStyle}>
                <div style={heroStyle}>
                  <div>
                    <strong>
                      {row.rank}. {row.label}
                    </strong>
                    <div style={mutedStyle}>Peut casser : {row.overrides}</div>
                  </div>
                  <Badge tone={row.rank === 1 ? 'success' : 'neutral'}>Rang {row.rank}</Badge>
                </div>
                <ProgressBar
                  label={`Autorité ${row.label}`}
                  max={ARBITER_PRECEDENCE.length}
                  showValue={false}
                  tone={row.rank === 1 ? 'success' : 'info'}
                  value={ARBITER_PRECEDENCE.length - row.rank + 1}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={heroStyle}>
            <div style={stackStyle}>
              <Label>R-13.12</Label>
              <h2 style={panelTitleStyle}>Arbitrage des conflits</h2>
              <p style={subtitleStyle}>{conflictPlan.description}</p>
            </div>
            <Seal>
              <Scale aria-hidden="true" style={iconStyle} /> Litige
            </Seal>
          </div>

          <div style={stackStyle}>
            {conflictRows.map((row) => (
              <div key={row.id} style={eventRowStyle}>
                <Badge tone={row.auditRequired ? 'warn' : 'neutral'}>#{row.rank}</Badge>
                <span style={stackStyle}>
                  <strong>{row.label}</strong>
                  <span style={mutedStyle}>
                    {row.actor} · {row.auditRequired ? 'audit requis' : 'discussion libre'}
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div style={{ ...stackStyle, marginTop: 12 }}>
            <span style={mutedStyle}>
              Suite après discussion :{' '}
              {activeConflictStep
                ? `${activeConflictStep.label} · ${conflictActorLabel(activeConflictStep.actor)}`
                : 'clôturé'}
            </span>
            <div style={inlineStackStyle}>
              {recourseRows.map((row) => (
                <Badge key={row.id} tone={row.consensusRequired ? 'info' : 'neutral'}>
                  {row.label}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <Label>Prochaine cause</Label>
          <h2 style={panelTitleStyle}>{nextDecision?.title ?? 'Aucune cause en instance'}</h2>
          <p style={subtitleStyle}>
            {nextDecision
              ? `${actorLabel(nextDecision.requestedBy)} sollicite ${roleLabels[nextDecision.assignedTo]}.`
              : 'Le registre ne contient plus de décision à trancher.'}
          </p>
          <div style={{ ...inlineStackStyle, marginTop: 12 }}>
            <Button disabled={!nextDecision} onClick={resolveNextCause} style={buttonIconStyle}>
              <Scale aria-hidden="true" style={iconStyle} />
              Arbitrer
            </Button>
            <Button onClick={resetGreffe} style={buttonIconStyle} variant="secondary">
              <RotateCcw aria-hidden="true" style={iconStyle} />
              Rétablir le registre
            </Button>
          </div>
        </Card>
      </div>

      <Card>
        <Label>Journal des décisions MJ</Label>
        <Table
          caption="Causes inscrites au greffe"
          columns={decisionColumns}
          getRowKey={(row) => row.id}
          rows={decisionRows}
        />
      </Card>

      <div style={cardGridStyle}>
        <Card>
          <Label>Renvoi / cassation</Label>
          <div style={stackStyle}>
            <SelectField
              disabled={rollbackTargets.length === 0}
              hint="Renvoi conserve l'historique ; cassation reconstruit l'état à la séquence choisie."
              label="Séquence visée"
              onChange={(event) => setTargetSequence(event.target.value)}
              options={rollbackTargets}
              value={targetValue}
            />
            <div style={inlineStackStyle}>
              <Button disabled={!selectedTarget} onClick={requestRenvoi} style={buttonIconStyle}>
                <Undo2 aria-hidden="true" style={iconStyle} />
                Renvoi
              </Button>
              <Button
                disabled={!selectedTarget}
                onClick={pronounceCassation}
                style={buttonIconStyle}
                variant="secondary"
              >
                <Scale aria-hidden="true" style={iconStyle} />
                Cassation
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <Label>Minute du greffe</Label>
          <ol style={eventListStyle}>
            {recentEvents.map((event) => (
              <li key={event.id} style={eventRowStyle}>
                <Badge tone={eventTone(event)}>#{event.sequence}</Badge>
                <span style={stackStyle}>
                  <strong>{eventLabel(event)}</strong>
                  <span style={mutedStyle}>{eventDetail(event)}</span>
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}

function createInitialGreffeState(): SessionState {
  let state = createSessionManagerState({
    id: 'session-greffe-brumeval',
    mode: 'digital_human_gm',
    players: [
      {
        connected: true,
        id: 'gm',
        name: 'MJ',
        role: 'human_gm'
      },
      {
        characterId: 'aveline',
        connected: true,
        id: 'aveline',
        name: 'Aveline',
        role: 'player'
      },
      {
        connected: true,
        id: 'scribe-llm',
        name: 'Scribe LLM',
        role: 'llm'
      },
      {
        connected: true,
        id: 'auto',
        name: 'Automate de table',
        role: 'auto'
      }
    ],
    scenes: [],
    slug: 'greffe-brumeval',
    status: 'active',
    title: 'Greffe de Brumeval'
  });

  state = recordSessionEvent(
    state,
    {
      actorId: 'gm',
      payload: {
        description: 'Audience ouverte sous contrôle du MJ humain.',
        location: 'Archives de Brumeval',
        sceneId: 'audience-des-causes',
        title: 'Audience des causes'
      },
      type: 'scene_opened'
    },
    {
      eventId: 'greffe-event-1',
      now: '2026-04-30T10:00:00.000Z'
    }
  );

  state = withSessionChangeRequests(
    queueGmDecision(
      state,
      {
        assignedTo: 'human_gm',
        payload: { cause: 'passage-nord', source: 'D13 multi-arbitre' },
        priority: 'urgent',
        requestedBy: 'scribe-llm',
        title: 'Trancher le droit de passage au pont nord'
      },
      {
        decisionId: 'cause-001',
        eventId: 'greffe-event-2',
        now: '2026-04-30T10:01:00.000Z'
      }
    ),
    state.changeRequests
  );

  state = withSessionChangeRequests(
    resolveGmDecision(
      state,
      'cause-001',
      {
        actorId: 'gm',
        resolution: {
          ruling: 'Le passage est accordé, coût narratif différé.',
          source: 'human_gm'
        },
        status: 'approved'
      },
      {
        eventId: 'greffe-event-3',
        now: '2026-04-30T10:02:00.000Z'
      }
    ),
    state.changeRequests
  );

  state = withSessionChangeRequests(
    queueGmDecision(
      state,
      {
        assignedTo: 'player',
        payload: { cause: 'risque-consenti', source: 'consentement joueur' },
        priority: 'high',
        requestedBy: 'gm',
        title: 'Confirmer le risque consenti par Aveline'
      },
      {
        decisionId: 'cause-002',
        eventId: 'greffe-event-4',
        now: '2026-04-30T10:03:00.000Z'
      }
    ),
    state.changeRequests
  );

  state = withSessionChangeRequests(
    queueGmDecision(
      state,
      {
        assignedTo: 'llm',
        payload: { cause: 'attendus-narratifs', guardrail: 'narration_only' },
        priority: 'normal',
        requestedBy: 'aveline',
        title: 'Proposer les attendus narratifs sans calcul mécanique'
      },
      {
        decisionId: 'cause-003',
        eventId: 'greffe-event-5',
        now: '2026-04-30T10:04:00.000Z'
      }
    ),
    state.changeRequests
  );

  state = withSessionChangeRequests(
    queueGmDecision(
      state,
      {
        assignedTo: 'auto',
        payload: { cause: 'delai', guardrail: 'typed_projection_only' },
        priority: 'low',
        requestedBy: 'scribe-llm',
        title: 'Appliquer le suivi automatique du délai'
      },
      {
        decisionId: 'cause-004',
        eventId: 'greffe-event-6',
        now: '2026-04-30T10:05:00.000Z'
      }
    ),
    state.changeRequests
  );

  state = recordSessionEvent(
    state,
    {
      actorId: 'aveline',
      payload: {
        text: 'Aveline accepte de porter la conséquence narrative au registre.'
      },
      type: 'player_action'
    },
    {
      eventId: 'greffe-event-7',
      now: '2026-04-30T10:06:00.000Z'
    }
  );

  return withSessionChangeRequests(
    requestSessionRollback(
      state,
      {
        actorId: 'gm',
        reason: 'Renvoi préparatoire vers la confirmation du risque.',
        targetSequence: 4
      },
      {
        eventId: 'greffe-event-8',
        now: '2026-04-30T10:07:00.000Z'
      }
    ),
    state.changeRequests
  );
}

function buildAuthorityRows(): AuthorityRow[] {
  return ARBITER_PRECEDENCE.map((arbiter, index) => {
    const overridden = ARBITER_PRECEDENCE.filter((candidate) =>
      hasArbiterAuthorityOver(arbiter, candidate)
    );

    return {
      arbiter,
      label: roleLabels[arbiter],
      overrides: overridden.map((candidate) => roleLabels[candidate]).join(', ') || 'aucun',
      rank: index + 1
    };
  });
}

function selectNextDecisionByAuthority(state: SessionState): SessionDecision | undefined {
  const pending = getPendingDecisions(state);

  return (
    ARBITER_PRECEDENCE.map((arbiter) =>
      pending.find((decision) => decision.assignedTo === arbiter)
    ).find((decision): decision is SessionDecision => decision !== undefined) ?? pending[0]
  );
}

function toDecisionRow(decision: SessionDecision): DecisionRow {
  return {
    assignedTo: decision.assignedTo,
    id: decision.id,
    priority: decision.priority,
    requestedBy: decision.requestedBy,
    resolution: readString(decision.resolution, 'ruling') ?? 'En attente de minute.',
    status: decision.status,
    title: decision.title
  };
}

function resolveSelectedTarget(state: SessionState, selected: string): SessionEvent | undefined {
  const requested = Number.parseInt(selected, 10);

  if (Number.isFinite(requested)) {
    const match = state.events.find((event) => event.sequence === requested);

    if (match) {
      return match;
    }
  }

  return state.events.at(-1);
}

function nextTimestamp(state: SessionState): string {
  const latest = state.events.at(-1)?.createdAt ?? state.updatedAt;
  return new Date(new Date(latest).getTime() + 60_000).toISOString();
}

function actorIdForArbiter(arbiter: Arbiter): string {
  if (arbiter === 'human_gm') return 'gm';
  if (arbiter === 'player') return 'aveline';
  if (arbiter === 'llm') return 'scribe-llm';
  return 'auto';
}

function actorLabel(actorId: string): string {
  return actorNames[actorId] ?? actorId;
}

function conflictActorLabel(actor: ConflictResolutionActor): string {
  if (actor === 'admin') return 'Admin';
  if (actor === 'table') return 'Table';
  return roleLabels[actor];
}

function statusLabel(status: SessionDecisionStatus): string {
  if (status === 'approved') return 'validé';
  if (status === 'rejected') return 'rejeté';
  if (status === 'superseded') return 'cassé';
  return 'en instance';
}

function eventTone(event: SessionEvent): BadgeTone {
  if (event.type === 'rollback_requested') return 'danger';
  if (event.type === 'gm_decision_resolved') return 'success';
  if (event.type === 'gm_decision_requested') return 'warn';
  if (event.type === 'scene_opened') return 'info';
  return 'neutral';
}

function eventLabel(event: SessionEvent): string {
  if (event.type === 'scene_opened') return 'Audience ouverte';
  if (event.type === 'gm_decision_requested') return 'Cause inscrite';
  if (event.type === 'gm_decision_resolved') return 'Décision rendue';
  if (event.type === 'rollback_requested') return 'Renvoi demandé';
  if (event.type === 'player_action') return 'Déclaration joueur';
  return event.type;
}

function eventDetail(event: SessionEvent): ReactNode {
  if (event.type === 'rollback_requested') {
    return `Cible #${readNumber(event.payload, 'targetSequence') ?? '—'} · ${
      readString(event.payload, 'reason') ?? 'motif non consigné'
    }`;
  }

  if (event.type === 'gm_decision_requested') {
    return `${readString(event.payload, 'title') ?? 'Cause'} · ${
      roleLabels[(readString(event.payload, 'assignedTo') as Arbiter | undefined) ?? 'human_gm']
    }`;
  }

  if (event.type === 'gm_decision_resolved') {
    const resolution = readRecord(event.payload, 'resolution');
    return readString(resolution, 'ruling') ?? 'Résolution consignée.';
  }

  return (
    readString(event.payload, 'text') ??
    readString(event.payload, 'description') ??
    readString(event.payload, 'location') ??
    'Entrée canonique'
  );
}

function readString(record: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = record?.[key];
  return typeof value === 'string' ? value : undefined;
}

function readNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  return typeof value === 'number' ? value : undefined;
}

function readRecord(
  record: Record<string, unknown>,
  key: string
): Record<string, unknown> | undefined {
  const value = record[key];
  return isRecord(value) ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
