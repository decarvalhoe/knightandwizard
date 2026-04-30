import { describe, expect, it } from 'vitest';
import {
  buildSessionManagerView,
  createSessionManagerState,
  recordSessionEvent,
  requestRollbackFromEvent,
  resolveNextPendingDecision,
  submitGmDecisionRequest
} from './model.js';

describe('session manager model', () => {
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
      ]
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
    const state = createSessionManagerState();
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
      ]
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
