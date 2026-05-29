import { describe, expect, it } from 'vitest';
import type { SessionPlayer, SessionScene } from '@knightandwizard/rules-core';
import {
  applyLiveSessionEvent,
  buildSessionManagerView,
  createSessionManagerState,
  formatDuration,
  formatNarrativeInstant,
  recordSessionEvent,
  requestRollbackFromEvent,
  resolveNextPendingDecision,
  submitGmDecisionRequest
} from './model.js';

describe('session manager model', () => {
  it('creates an empty fallback state without seeded journal data', () => {
    const state = createSessionManagerState();

    expect(state.events).toEqual([]);
    expect(state.decisions).toEqual([]);
    expect(state.players).toEqual([]);
    expect(state.scenes).toEqual([]);
  });

  it('builds a session dashboard view from campaign, scene and event state', () => {
    const state = createSessionManagerState({
      decisions: [
        {
          assignedTo: 'human_gm',
          createdAt: '2026-04-30T10:03:00.000Z',
          id: 'decision-1',
          payload: { subject: 'negociation' },
          priority: 'high',
          requestedBy: 'llm',
          status: 'pending',
          title: 'Valider la negociation'
        }
      ],
      events: [
        {
          actorId: 'gm',
          createdAt: '2026-04-30T10:00:00.000Z',
          id: 'event-1',
          payload: { location: 'Porte nord' },
          sequence: 1,
          type: 'scene_opened'
        },
        {
          actorId: 'aveline',
          createdAt: '2026-04-30T10:02:00.000Z',
          id: 'event-2',
          payload: { text: 'Aveline parlemente.' },
          sequence: 2,
          type: 'player_action'
        }
      ],
      players: samplePlayers(),
      scenes: sampleScenes()
    });
    const view = buildSessionManagerView(state);

    expect(view.metrics).toEqual({
      activePlayers: 2,
      events: 2,
      pendingDecisions: 1,
      scenes: 2
    });
    expect(view.activeScene).toMatchObject({
      location: 'Brumeval',
      title: 'Porte nord'
    });
    expect(view.recentEvents.map((event) => event.label)).toEqual([
      'Aveline · Action joueur',
      'MJ · Scene ouverte'
    ]);
  });

  it('records events and exposes them as rollback targets', () => {
    const state = createSessionManagerState({
      players: samplePlayers(),
      scenes: []
    });
    const withEvent = recordSessionEvent(
      state,
      {
        actorId: 'gm',
        payload: { text: 'La pluie cesse.' },
        type: 'narration'
      },
      { id: 'event-test', now: '2026-04-30T10:10:00.000Z' }
    );
    const rollback = requestRollbackFromEvent(withEvent, 1, 'Correction de narration', {
      eventId: 'event-rollback',
      now: '2026-04-30T10:11:00.000Z'
    });

    expect(buildSessionManagerView(withEvent).rollbackTargets).toEqual([
      {
        label: '#1 · MJ · Narration',
        sequence: 1
      }
    ]);
    expect(rollback.events.map((event) => event.type)).toEqual(['narration', 'rollback_requested']);
  });

  it('projects live GM decisions into the queue while preserving the journal', () => {
    const state = createSessionManagerState({
      decisions: [],
      events: [
        {
          actorId: 'gm',
          createdAt: '2026-04-30T10:00:00.000Z',
          id: 'event-1',
          payload: { location: 'Porte nord', sceneId: 'gate', title: 'Porte nord' },
          sequence: 1,
          type: 'scene_opened'
        },
        {
          actorId: 'llm',
          createdAt: '2026-04-30T10:01:00.000Z',
          id: 'event-2',
          payload: { decisionId: 'decision-stale', requestedBy: 'llm', title: 'Ancienne' },
          sequence: 2,
          type: 'gm_decision_requested'
        },
        {
          actorId: 'gm',
          createdAt: '2026-04-30T10:02:00.000Z',
          id: 'event-3',
          payload: { reason: 'Reprendre', targetSequence: 1 },
          sequence: 3,
          type: 'rollback_requested'
        }
      ],
      players: samplePlayers()
    });
    const outcome = applyLiveSessionEvent(state, {
      actorId: 'llm',
      createdAt: '2026-04-30T10:03:00.000Z',
      id: 'event-4',
      payload: {
        assignedTo: 'human_gm',
        decisionId: 'decision-live',
        priority: 'high',
        requestedBy: 'llm',
        title: 'Valider la consequence narrative'
      },
      sequence: 4,
      type: 'gm_decision_requested'
    });

    expect(outcome.kind).toBe('applied');

    if (outcome.kind !== 'applied') {
      return;
    }

    expect(outcome.state.events.map((event) => event.sequence)).toEqual([1, 2, 3, 4]);
    expect(buildSessionManagerView(outcome.state).decisionQueue).toMatchObject([
      {
        id: 'decision-live',
        priority: 'high',
        title: 'Valider la consequence narrative'
      }
    ]);
  });

  it('surfaces critical state and D100 severity in dice_roll event labels', () => {
    const state = createSessionManagerState({
      events: [
        {
          actorId: 'aveline',
          createdAt: '2026-04-30T10:30:00.000Z',
          id: 'event-crit-fail',
          payload: {
            difficulty: 7,
            isCriticalFailure: true,
            criticalFailureSeverity: 73,
            successes: 0
          },
          sequence: 1,
          type: 'dice_roll'
        },
        {
          actorId: 'aveline',
          createdAt: '2026-04-30T10:31:00.000Z',
          id: 'event-crit-success',
          payload: { difficulty: 7, isCriticalSuccess: true, successes: 4 },
          sequence: 2,
          type: 'dice_roll'
        }
      ],
      players: samplePlayers()
    });
    const view = buildSessionManagerView(state);

    expect(view.recentEvents.map((event) => event.label)).toEqual([
      'Aveline · Jet de des',
      'Aveline · Jet de des'
    ]);
    expect(view.recentEvents.map((event) => event.detail)).toEqual([
      '4 succes · reussite critique',
      '0 succes · echec critique D100 73'
    ]);
  });

  it('builds a playable table thread with explicit actors, posts, rolls and GM decisions', () => {
    const state = createSessionManagerState({
      events: [
        {
          actorId: 'aveline',
          createdAt: '2026-04-30T10:00:00.000Z',
          id: 'event-post',
          payload: { kind: 'table_post', text: 'Je fouille la porte.' },
          sequence: 1,
          type: 'player_action'
        },
        {
          actorId: 'aveline',
          createdAt: '2026-04-30T10:01:00.000Z',
          id: 'event-roll',
          payload: {
            difficulty: 7,
            kind: 'table_roll',
            postText: 'Je force la serrure.',
            rolls: [9, 3],
            successes: 1
          },
          sequence: 2,
          type: 'dice_roll'
        },
        {
          actorId: 'gm',
          createdAt: '2026-04-30T10:02:00.000Z',
          id: 'event-decision',
          payload: {
            decisionId: 'decision-1',
            kind: 'table_decision',
            title: 'Valider le bruit de la serrure'
          },
          sequence: 3,
          type: 'gm_decision_requested'
        }
      ],
      players: samplePlayers()
    });
    const view = buildSessionManagerView(state);

    expect(view.threadRows).toEqual([
      {
        actorName: 'Aveline',
        createdAt: '2026-04-30T10:00:00.000Z',
        detail: 'Je fouille la porte.',
        id: 'event-post',
        kind: 'post',
        sequence: 1
      },
      {
        actorName: 'Aveline',
        createdAt: '2026-04-30T10:01:00.000Z',
        detail: 'Je force la serrure. · 1 succes',
        id: 'event-roll',
        kind: 'roll',
        sequence: 2
      },
      {
        actorName: 'MJ',
        createdAt: '2026-04-30T10:02:00.000Z',
        detail: 'Valider le bruit de la serrure',
        id: 'event-decision',
        kind: 'decision',
        sequence: 3
      }
    ]);
  });

  it('queues and resolves the next GM decision', () => {
    const state = createSessionManagerState();
    const queued = submitGmDecisionRequest(state, 'Valider le discours du PNJ', {
      decisionId: 'decision-test',
      eventId: 'event-request',
      now: '2026-04-30T10:20:00.000Z'
    });
    const resolved = resolveNextPendingDecision(
      queued,
      'approved',
      { ruling: 'Le discours est conserve.' },
      { eventId: 'event-resolved', now: '2026-04-30T10:21:00.000Z' }
    );

    expect(buildSessionManagerView(queued).decisionQueue.map((decision) => decision.title)).toEqual(
      ['Valider le discours du PNJ']
    );
    expect(buildSessionManagerView(resolved).decisionQueue).toEqual([]);
    expect(resolved.events.map((event) => event.type)).toEqual([
      'gm_decision_requested',
      'gm_decision_resolved'
    ]);
  });
});

function samplePlayers(): SessionPlayer[] {
  return [
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
      characterId: 'mire',
      connected: false,
      id: 'mire',
      name: 'Mire',
      role: 'player'
    }
  ];
}

function sampleScenes(): SessionScene[] {
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

describe('applyLiveSessionEvent', () => {
  const base = createSessionManagerState({
    events: [
      {
        actorId: 'gm',
        createdAt: '2026-04-30T10:00:00.000Z',
        id: 'event-1',
        payload: { location: 'Porte nord' },
        sequence: 1,
        type: 'scene_opened'
      }
    ]
  });

  it('appends the next sequential event to the immutable journal', () => {
    const outcome = applyLiveSessionEvent(base, {
      actorId: 'aveline',
      createdAt: '2026-04-30T10:01:00.000Z',
      id: 'event-2',
      payload: { text: 'Aveline avance.' },
      sequence: 2,
      type: 'player_action'
    });

    expect(outcome.kind).toBe('applied');

    if (outcome.kind === 'applied') {
      expect(outcome.state.events.map((event) => event.sequence)).toEqual([1, 2]);
    }
  });

  it('ignores an already-known sequence (idempotent dedupe)', () => {
    const outcome = applyLiveSessionEvent(base, {
      actorId: 'gm',
      createdAt: '2026-04-30T10:00:00.000Z',
      id: 'event-1',
      payload: { location: 'Porte nord' },
      sequence: 1,
      type: 'scene_opened'
    });

    expect(outcome.kind).toBe('duplicate');
  });

  it('signals a gap when an event skips ahead, so the caller resyncs', () => {
    const outcome = applyLiveSessionEvent(base, {
      actorId: 'gm',
      createdAt: '2026-04-30T10:05:00.000Z',
      id: 'event-5',
      payload: {},
      sequence: 5,
      type: 'dice_roll'
    });

    expect(outcome.kind).toBe('gap');
  });

  it('recomputes the narrative clock when a live time-advance event is applied', () => {
    const outcome = applyLiveSessionEvent(base, {
      actorId: 'gm',
      createdAt: '2026-04-30T12:00:00.000Z',
      id: 'event-2',
      payload: { hours: 2 },
      sequence: 2,
      type: 'narrative_time_advanced'
    });

    expect(outcome.kind).toBe('applied');

    if (outcome.kind === 'applied') {
      expect(outcome.state.narrativeSeconds).toBe(7_200);
    }
  });

  it('preserves seeded scenes when a live decision arrives before scene events', () => {
    const state = createSessionManagerState({
      decisions: [],
      events: [],
      players: samplePlayers(),
      scenes: sampleScenes()
    });
    const outcome = applyLiveSessionEvent(state, {
      actorId: 'llm',
      createdAt: '2026-04-30T10:03:00.000Z',
      id: 'event-1',
      payload: {
        assignedTo: 'human_gm',
        decisionId: 'decision-live',
        priority: 'high',
        requestedBy: 'llm',
        title: 'Valider la consequence narrative'
      },
      sequence: 1,
      type: 'gm_decision_requested'
    });

    expect(outcome.kind).toBe('applied');

    if (outcome.kind !== 'applied') {
      return;
    }

    const view = buildSessionManagerView(outcome.state);
    expect(view.activeScene).toMatchObject({ id: 'brumeval-gate', title: 'Porte nord' });
    expect(view.decisionQueue).toMatchObject([
      {
        id: 'decision-live',
        title: 'Valider la consequence narrative'
      }
    ]);
  });
});

describe('narrative clock view (R-8.20)', () => {
  it('exposes the formatted instant and active spells in the manager view', () => {
    const state = createSessionManagerState({
      events: [
        {
          actorId: 'gm',
          createdAt: '2026-04-30T10:00:00.000Z',
          id: 'event-1',
          payload: { hours: 1 },
          sequence: 1,
          type: 'narrative_time_advanced'
        },
        {
          actorId: 'gm',
          createdAt: '2026-04-30T10:01:00.000Z',
          id: 'event-2',
          payload: {
            activeSpellId: 'spell-aura',
            durationAmount: 10,
            durationUnit: 'minute',
            spellId: 'aura-de-courage',
            targetId: 'aveline'
          },
          sequence: 2,
          type: 'spell_cast'
        }
      ]
    });
    const view = buildSessionManagerView(state);

    expect(view.narrativeClock.narrativeSeconds).toBe(3_600);
    expect(view.narrativeClock.instantLabel).toBe('Jour 1 · 01:00:00');
    expect(view.narrativeClock.activeSpells).toEqual([
      {
        id: 'spell-aura',
        label: 'aura-de-courage',
        permanent: false,
        remainingLabel: 'Expire dans 10 min',
        target: 'aveline'
      }
    ]);
  });

  it('marks a permanent spell as requiring an explicit dispel', () => {
    const state = createSessionManagerState({
      events: [
        {
          actorId: 'gm',
          createdAt: '2026-04-30T10:00:00.000Z',
          id: 'event-1',
          payload: {
            activeSpellId: 'spell-ward',
            durationAmount: 0,
            durationUnit: 'permanent',
            spellId: 'bouclier'
          },
          sequence: 1,
          type: 'spell_cast'
        }
      ]
    });
    const view = buildSessionManagerView(state);

    expect(view.narrativeClock.activeSpells).toEqual([
      {
        id: 'spell-ward',
        label: 'bouclier',
        permanent: true,
        remainingLabel: 'Permanent (dissipation requise)',
        target: undefined
      }
    ]);
  });

  it('formats absolute instants across day boundaries', () => {
    expect(formatNarrativeInstant(0)).toBe('Jour 1 · 00:00:00');
    expect(formatNarrativeInstant(86_400 + 3_661)).toBe('Jour 2 · 01:01:01');
  });

  it('formats short relative durations with the two largest units', () => {
    expect(formatDuration(7_200)).toBe('2 h');
    expect(formatDuration(90)).toBe('1 min 30 s');
    expect(formatDuration(86_400 + 3_600)).toBe('1 j 1 h');
  });
});
