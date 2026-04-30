import { describe, expect, it } from 'vitest';
import {
  appendSessionEvent,
  createSessionState,
  getPendingDecisions,
  queueGmDecision,
  requestSessionRollback,
  resolveGmDecision
} from './session.js';

describe('session event journal', () => {
  it('appends immutable events with deterministic sequence numbers', () => {
    const session = createSessionState({
      id: 'session-brumeval',
      mode: 'digital_human_gm',
      slug: 'brumeval',
      title: 'Brumeval'
    });
    const withScene = appendSessionEvent(
      session,
      {
        actorId: 'gm',
        payload: { location: 'Porte nord' },
        type: 'scene_opened'
      },
      { id: 'event-1', now: '2026-04-30T10:00:00.000Z' }
    );
    const withRoll = appendSessionEvent(
      withScene,
      {
        actorId: 'aveline',
        payload: { difficulty: 7, successes: 2 },
        type: 'dice_roll'
      },
      { id: 'event-2', now: '2026-04-30T10:01:00.000Z' }
    );

    expect(session.events).toEqual([]);
    expect(withRoll.events.map((event) => [event.id, event.sequence, event.type])).toEqual([
      ['event-1', 1, 'scene_opened'],
      ['event-2', 2, 'dice_roll']
    ]);
    expect(withRoll.audit.map((entry) => entry.action)).toEqual([
      'session.event.appended',
      'session.event.appended'
    ]);
  });

  it('queues and resolves GM decisions through the canonical journal', () => {
    const session = createSessionState({
      id: 'session-brumeval',
      slug: 'brumeval',
      title: 'Brumeval'
    });
    const queued = queueGmDecision(
      session,
      {
        assignedTo: 'human_gm',
        payload: { options: ['negotiate', 'fight'] },
        priority: 'high',
        requestedBy: 'llm',
        title: 'Les brigands negocient-ils ?'
      },
      {
        decisionId: 'decision-1',
        eventId: 'event-1',
        now: '2026-04-30T10:05:00.000Z'
      }
    );
    const resolved = resolveGmDecision(
      queued,
      'decision-1',
      {
        actorId: 'gm',
        resolution: { ruling: 'fight' },
        status: 'approved'
      },
      {
        eventId: 'event-2',
        now: '2026-04-30T10:06:00.000Z'
      }
    );

    expect(getPendingDecisions(queued).map((decision) => decision.id)).toEqual(['decision-1']);
    expect(getPendingDecisions(resolved)).toEqual([]);
    expect(resolved.decisions[0]).toMatchObject({
      id: 'decision-1',
      resolvedAt: '2026-04-30T10:06:00.000Z',
      status: 'approved'
    });
    expect(resolved.events.map((event) => event.type)).toEqual([
      'gm_decision_requested',
      'gm_decision_resolved'
    ]);
  });

  it('records rollback requests as audit markers without deleting history', () => {
    const session = createSessionState({
      id: 'session-brumeval',
      slug: 'brumeval',
      title: 'Brumeval'
    });
    const withEvent = appendSessionEvent(
      session,
      {
        actorId: 'gm',
        payload: { text: 'La porte cede.' },
        type: 'narration'
      },
      { id: 'event-1', now: '2026-04-30T10:00:00.000Z' }
    );
    const rollback = requestSessionRollback(
      withEvent,
      {
        actorId: 'gm',
        reason: 'Retcon apres erreur de regle',
        targetSequence: 1
      },
      { eventId: 'event-2', now: '2026-04-30T10:10:00.000Z' }
    );

    expect(rollback.events.map((event) => [event.sequence, event.type])).toEqual([
      [1, 'narration'],
      [2, 'rollback_requested']
    ]);
    expect(rollback.events[1]?.payload).toMatchObject({
      reason: 'Retcon apres erreur de regle',
      targetSequence: 1
    });
    expect(rollback.audit.at(-1)).toMatchObject({
      action: 'session.rollback.requested',
      actorId: 'gm'
    });
  });

  it('rejects rollback requests targeting unknown events', () => {
    const session = createSessionState({
      id: 'session-brumeval',
      slug: 'brumeval',
      title: 'Brumeval'
    });

    expect(() =>
      requestSessionRollback(session, {
        actorId: 'gm',
        reason: 'Impossible',
        targetSequence: 4
      })
    ).toThrow('targetSequence must reference an existing event');
  });
});
