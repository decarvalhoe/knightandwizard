import { describe, expect, it } from 'vitest';
import {
  appendSessionEvent,
  createSessionState,
  getPendingDecisions,
  queueGmDecision,
  rebuildSessionStateFromEvents,
  requestSessionRollback,
  resolveGmDecision,
  revertSessionToSequence
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

describe('session state reconstruction', () => {
  function buildJournal() {
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
        payload: { location: 'Porte nord', sceneId: 'gate', title: 'Porte nord' },
        type: 'scene_opened'
      },
      { id: 'event-1', now: '2026-04-30T10:00:00.000Z' }
    );
    const queued = queueGmDecision(
      withScene,
      {
        assignedTo: 'human_gm',
        payload: { options: ['negotiate', 'fight'] },
        priority: 'high',
        requestedBy: 'llm',
        title: 'Les brigands negocient-ils ?'
      },
      { decisionId: 'decision-1', eventId: 'event-2', now: '2026-04-30T10:01:00.000Z' }
    );
    const resolved = resolveGmDecision(
      queued,
      'decision-1',
      { actorId: 'gm', resolution: { ruling: 'fight' }, status: 'approved' },
      { eventId: 'event-3', now: '2026-04-30T10:02:00.000Z' }
    );

    return resolved;
  }

  it('rebuilds scenes and decisions purely from the ordered event log', () => {
    const journal = buildJournal();
    // Drop the derived projections to prove they are rebuilt from events alone.
    const rebuilt = rebuildSessionStateFromEvents({
      ...journal,
      decisions: [],
      scenes: []
    });

    expect(rebuilt.scenes).toEqual([
      {
        description: undefined,
        id: 'gate',
        location: 'Porte nord',
        npcIds: undefined,
        openedAtSequence: 1,
        status: 'active',
        title: 'Porte nord'
      }
    ]);
    expect(rebuilt.decisions).toMatchObject([
      {
        assignedTo: 'human_gm',
        id: 'decision-1',
        priority: 'high',
        requestedBy: 'llm',
        resolution: { ruling: 'fight' },
        resolvedAt: '2026-04-30T10:02:00.000Z',
        status: 'approved',
        title: 'Les brigands negocient-ils ?'
      }
    ]);
    expect(rebuilt.updatedAt).toBe('2026-04-30T10:02:00.000Z');
  });

  it('reverts to a prior point, dropping later events and unresolving decisions', () => {
    const journal = buildJournal();
    // Revert to sequence 2 (decision requested) — the resolution at seq 3 disappears.
    const reverted = revertSessionToSequence(journal, 2);

    expect(reverted.events.map((event) => event.sequence)).toEqual([1, 2]);
    expect(getPendingDecisions(reverted).map((decision) => decision.id)).toEqual(['decision-1']);
    expect(reverted.decisions[0]).toMatchObject({ status: 'pending' });
    expect(reverted.decisions[0]?.resolvedAt).toBeUndefined();
    expect(reverted.scenes).toHaveLength(1);
    expect(reverted.updatedAt).toBe('2026-04-30T10:01:00.000Z');
  });

  it('reverts to the very first event, dropping the decision entirely', () => {
    const journal = buildJournal();
    const reverted = revertSessionToSequence(journal, 1);

    expect(reverted.events.map((event) => event.sequence)).toEqual([1]);
    expect(reverted.decisions).toEqual([]);
    expect(reverted.scenes).toHaveLength(1);
  });

  it('preserves session-level facts and the audit trail when reverting', () => {
    const journal = buildJournal();
    const reverted = revertSessionToSequence(journal, 1);

    expect(reverted.id).toBe(journal.id);
    expect(reverted.mode).toBe('digital_human_gm');
    expect(reverted.slug).toBe('brumeval');
    expect(reverted.audit).toEqual(journal.audit);
  });

  it('rejects reverts targeting unknown events', () => {
    const journal = buildJournal();

    expect(() => revertSessionToSequence(journal, 99)).toThrow(
      'targetSequence must reference an existing event'
    );
  });

  it('is stable across repeated rebuilds (fold is deterministic)', () => {
    const journal = buildJournal();
    const once = rebuildSessionStateFromEvents(journal);
    const twice = rebuildSessionStateFromEvents(once);

    expect(twice.scenes).toEqual(once.scenes);
    expect(twice.decisions).toEqual(once.decisions);
    expect(twice.events).toEqual(once.events);
    // The decision derived from events matches the one the queue helper recorded.
    expect(once.decisions).toEqual(journal.decisions);
  });
});
