import { describe, expect, it } from 'vitest';
import {
  advanceSessionNarrative,
  appendSessionEvent,
  castSessionSpell,
  createSessionState,
  dispelSessionSpell,
  endSessionCombat,
  getActiveSpells,
  getPendingDecisions,
  projectSessionStateFromJournal,
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

  it('projects a playable branch after rollback without deleting later journal history', () => {
    const journal = buildJournal();
    const rollback = requestSessionRollback(
      journal,
      { actorId: 'gm', reason: 'Retour avant arbitrage', targetSequence: 1 },
      { eventId: 'event-4', now: '2026-04-30T10:03:00.000Z' }
    );
    const replayed = queueGmDecision(
      rollback,
      {
        assignedTo: 'human_gm',
        payload: { options: ['parley', 'ambush'] },
        priority: 'normal',
        requestedBy: 'llm',
        title: 'Nouvelle decision apres rollback'
      },
      { decisionId: 'decision-2', eventId: 'event-5', now: '2026-04-30T10:04:00.000Z' }
    );
    const projected = projectSessionStateFromJournal(replayed);

    expect(replayed.events.map((event) => event.sequence)).toEqual([1, 2, 3, 4, 5]);
    expect(projected.events.map((event) => event.sequence)).toEqual([1, 5]);
    expect(projected.decisions).toMatchObject([
      {
        id: 'decision-2',
        status: 'pending',
        title: 'Nouvelle decision apres rollback'
      }
    ]);
    expect(projected.scenes).toMatchObject([{ id: 'gate', openedAtSequence: 1 }]);
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

describe('session narrative clock (R-8.20 — temps double)', () => {
  function newSession() {
    return createSessionState({
      id: 'session-brumeval',
      mode: 'digital_human_gm',
      slug: 'brumeval',
      title: 'Brumeval'
    });
  }

  it('starts at instant zero with no active spells', () => {
    const session = newSession();

    expect(session.narrativeSeconds).toBe(0);
    expect(session.activeSpells).toEqual([]);
  });

  it('advances the clock when the MJ skips time (« passer la journée »)', () => {
    const session = newSession();
    const later = advanceSessionNarrative(
      session,
      { actorId: 'gm', by: { days: 1, hours: 2 } },
      { eventId: 'event-1', now: '2026-04-30T10:00:00.000Z' }
    );

    expect(later.narrativeSeconds).toBe(86_400 + 7_200);
    expect(later.events.map((event) => event.type)).toEqual(['narrative_time_advanced']);
  });

  it('folds the elapsed combat DT back into the narrative clock at end of combat', () => {
    const session = newSession();
    // 50 DT of combat = 10 narrative seconds (1 DT = 0,2 s).
    const after = endSessionCombat(session, { actorId: 'gm', elapsedDT: 50 });

    expect(after.narrativeSeconds).toBeCloseTo(10);
  });

  it('records a cast spell at the current instant and keeps it active until it expires', () => {
    const session = newSession();
    const withTime = advanceSessionNarrative(session, { by: { hours: 1 } }); // 3600 s
    const cast = castSessionSpell(withTime, {
      activeSpellId: 'spell-aura',
      durationAmount: 10,
      durationUnit: 'minute',
      spellId: 'aura-de-courage',
      targetId: 'aveline'
    });

    expect(cast.activeSpells).toMatchObject([
      { id: 'spell-aura', castAtSeconds: 3_600, durationAmount: 10, durationUnit: 'minute' }
    ]);
    expect(getActiveSpells(cast)).toHaveLength(1);

    // 10 minutes later the buff has lapsed.
    const muchLater = advanceSessionNarrative(cast, { by: { minutes: 10 } });
    expect(muchLater.narrativeSeconds).toBe(3_600 + 600);
    expect(muchLater.activeSpells).toEqual([]);
  });

  it('expires a combat-scale (DT) spell once the MJ skips a day (combat nests in narrative)', () => {
    const session = newSession();
    const cast = castSessionSpell(session, {
      activeSpellId: 'spell-haste',
      durationAmount: 10,
      durationUnit: 'DT' // 2 s
    });

    expect(cast.activeSpells).toHaveLength(1);

    const nextDay = advanceSessionNarrative(cast, { by: { days: 1 } });
    expect(nextDay.activeSpells).toEqual([]);
  });

  it('keeps a permanent spell active until it is explicitly dispelled', () => {
    const session = newSession();
    const cast = castSessionSpell(session, {
      activeSpellId: 'spell-ward',
      durationAmount: 0,
      durationUnit: 'permanent'
    });
    const farFuture = advanceSessionNarrative(cast, { by: { days: 365 } });

    expect(farFuture.activeSpells.map((spell) => spell.id)).toEqual(['spell-ward']);

    const dispelled = dispelSessionSpell(farFuture, { actorId: 'gm', activeSpellId: 'spell-ward' });
    expect(dispelled.activeSpells).toEqual([]);
  });

  it('rewinds the clock and resurrects a lapsed spell when reverting (rollback rewinds time)', () => {
    const session = newSession();
    const cast = castSessionSpell(
      session,
      { activeSpellId: 'spell-aura', durationAmount: 10, durationUnit: 'minute' },
      { eventId: 'event-1', now: '2026-04-30T10:00:00.000Z' }
    );
    const later = advanceSessionNarrative(
      cast,
      { by: { hours: 1 } },
      { eventId: 'event-2', now: '2026-04-30T11:00:00.000Z' }
    );

    // After an hour the 10-minute buff is gone.
    expect(later.narrativeSeconds).toBe(3_600);
    expect(later.activeSpells).toEqual([]);

    // Revert to just after the cast (sequence 1): the clock is back to 0 and the spell is active again.
    const reverted = revertSessionToSequence(later, 1);
    expect(reverted.narrativeSeconds).toBe(0);
    expect(reverted.activeSpells.map((spell) => spell.id)).toEqual(['spell-aura']);
  });

  it('derives the clock purely from the journal (createSessionState folds events)', () => {
    const session = newSession();
    const built = advanceSessionNarrative(
      session,
      { by: { minutes: 30 } },
      { eventId: 'event-1', now: '2026-04-30T10:00:00.000Z' }
    );
    // Rebuild a fresh state from the raw events alone — the clock must match.
    const rehydrated = createSessionState({
      events: built.events,
      id: built.id,
      slug: built.slug,
      title: built.title
    });

    expect(rehydrated.narrativeSeconds).toBe(1_800);
  });
});
