import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import { createSqlClient } from '../db/client.js';

const app = buildApp({ logger: false });

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('session routes', () => {
  it('creates sessions and appends canonical events with monotonic sequences', async () => {
    const slug = `api-session-${randomUUID()}`;

    const createResponse = await app.inject({
      method: 'POST',
      payload: {
        metadata: {
          players: [
            { id: 'gm', name: 'MJ', role: 'human_gm' },
            { id: 'aveline', name: 'Aveline', role: 'player' }
          ],
          scenes: [{ id: 'brumeval-gate', location: 'Brumeval', title: 'Porte nord' }]
        },
        mode: 'digital_human_gm',
        slug,
        title: 'Session API'
      },
      url: '/sessions'
    });

    const firstEventResponse = await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        eventType: 'scene_opened',
        payload: { location: 'Porte nord' }
      },
      url: `/sessions/${slug}/events`
    });
    const secondEventResponse = await app.inject({
      method: 'POST',
      payload: {
        actorId: 'aveline',
        eventType: 'dice_roll',
        payload: { difficulty: 7, successes: 2 }
      },
      url: `/sessions/${slug}/events`
    });
    const readResponse = await app.inject({
      method: 'GET',
      url: `/sessions/${slug}`
    });

    expect(createResponse.statusCode).toBe(201);
    expect(firstEventResponse.statusCode).toBe(201);
    expect(secondEventResponse.statusCode).toBe(201);
    expect(readResponse.statusCode).toBe(200);
    expect(readResponse.json()).toMatchObject({
      events: [
        { actorId: 'gm', eventType: 'scene_opened', sequence: 1 },
        { actorId: 'aveline', eventType: 'dice_roll', sequence: 2 }
      ],
      mode: 'digital_human_gm',
      slug,
      status: 'planned',
      title: 'Session API'
    });
    expect(readResponse.json().state).toMatchObject({
      events: [
        { actorId: 'gm', type: 'scene_opened', sequence: 1 },
        { actorId: 'aveline', type: 'dice_roll', sequence: 2 }
      ],
      players: [
        { id: 'gm', name: 'MJ', role: 'human_gm' },
        { id: 'aveline', name: 'Aveline', role: 'player' }
      ],
      scenes: [{ id: 'brumeval-gate', location: 'Brumeval', title: 'Porte nord' }],
      slug,
      title: 'Session API'
    });
  });

  it('queues and resolves GM decisions with audit-friendly events', async () => {
    const slug = `decision-session-${randomUUID()}`;

    await app.inject({
      method: 'POST',
      payload: {
        mode: 'digital_llm_gm',
        slug,
        title: 'Decision API'
      },
      url: '/sessions'
    });

    const queuedResponse = await app.inject({
      method: 'POST',
      payload: {
        assignedTo: 'human_gm',
        payload: { options: ['approve', 'rewrite'] },
        priority: 'urgent',
        requestedBy: 'llm',
        title: 'Valider la description du sanctuaire'
      },
      url: `/sessions/${slug}/decisions`
    });
    const queuedDecision = queuedResponse.json().decision;
    const resolvedResponse = await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        resolution: { ruling: 'approved' },
        status: 'approved'
      },
      url: `/sessions/${slug}/decisions/${queuedDecision.id}/resolve`
    });
    const readResponse = await app.inject({
      method: 'GET',
      url: `/sessions/${slug}`
    });

    expect(queuedResponse.statusCode).toBe(201);
    expect(resolvedResponse.statusCode).toBe(200);
    expect(readResponse.json().decisions).toMatchObject([
      {
        assignedTo: 'human_gm',
        priority: 'urgent',
        requestedBy: 'llm',
        status: 'approved',
        title: 'Valider la description du sanctuaire'
      }
    ]);
    expect(
      readResponse.json().events.map((event: { eventType: string }) => event.eventType)
    ).toEqual(['gm_decision_requested', 'gm_decision_resolved']);
  });

  it('records rollback requests without deleting previous events', async () => {
    const slug = `rollback-session-${randomUUID()}`;

    await app.inject({
      method: 'POST',
      payload: {
        slug,
        title: 'Rollback API'
      },
      url: '/sessions'
    });
    await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        eventType: 'narration',
        payload: { text: 'La relique se brise.' }
      },
      url: `/sessions/${slug}/events`
    });

    const rollbackResponse = await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        reason: 'Erreur de regle',
        targetSequence: 1
      },
      url: `/sessions/${slug}/rollback`
    });
    const readResponse = await app.inject({
      method: 'GET',
      url: `/sessions/${slug}`
    });

    expect(rollbackResponse.statusCode).toBe(201);
    expect(readResponse.json().events).toMatchObject([
      { eventType: 'narration', sequence: 1 },
      { eventType: 'rollback_requested', sequence: 2 }
    ]);
  });

  it('returns a reverted state reconstructed from the event log', async () => {
    const slug = `revert-session-${randomUUID()}`;

    await app.inject({
      method: 'POST',
      payload: { mode: 'digital_human_gm', slug, title: 'Revert API' },
      url: '/sessions'
    });
    await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        eventType: 'scene_opened',
        payload: { location: 'Brumeval', sceneId: 'gate', title: 'Porte nord' }
      },
      url: `/sessions/${slug}/events`
    });
    const queuedResponse = await app.inject({
      method: 'POST',
      payload: {
        assignedTo: 'human_gm',
        payload: { options: ['negotiate', 'fight'] },
        priority: 'high',
        requestedBy: 'llm',
        title: 'Les brigands negocient-ils ?'
      },
      url: `/sessions/${slug}/decisions`
    });
    const decisionId = queuedResponse.json().decision.id;
    // Resolving appends event sequence 3 (request was sequence 2, scene was 1).
    await app.inject({
      method: 'POST',
      payload: { actorId: 'gm', resolution: { ruling: 'fight' }, status: 'approved' },
      url: `/sessions/${slug}/decisions/${decisionId}/resolve`
    });

    // Revert to sequence 2 (decision requested) — the resolution at seq 3 must vanish.
    const rollbackResponse = await app.inject({
      method: 'POST',
      payload: { actorId: 'gm', reason: 'Annule la resolution', targetSequence: 2 },
      url: `/sessions/${slug}/rollback`
    });

    expect(rollbackResponse.statusCode).toBe(201);
    const reverted = rollbackResponse.json().revertedState;
    // The rollback marker (seq 4) and the resolution (seq 3) are excluded.
    expect(reverted.events.map((event: { sequence: number }) => event.sequence)).toEqual([1, 2]);
    expect(reverted.events.map((event: { type: string }) => event.type)).toEqual([
      'scene_opened',
      'gm_decision_requested'
    ]);
    expect(reverted.scenes).toMatchObject([{ id: 'gate', openedAtSequence: 1 }]);
    expect(reverted.decisions).toMatchObject([{ id: decisionId, status: 'pending' }]);
    expect(reverted.decisions[0].resolvedAt).toBeUndefined();

    // The persisted journal still preserves the full history including the marker.
    const readResponse = await app.inject({ method: 'GET', url: `/sessions/${slug}` });
    const readBody = readResponse.json();
    expect(readBody.events.map((event: { eventType: string }) => event.eventType)).toEqual([
      'scene_opened',
      'gm_decision_requested',
      'gm_decision_resolved',
      'rollback_requested'
    ]);
    expect(readBody.state.events.map((event: { sequence: number }) => event.sequence)).toEqual([
      1, 2
    ]);
    expect(readBody.state.decisions).toMatchObject([{ id: decisionId, status: 'pending' }]);
  });

  it('records canonical entity links on events, decisions and rollback markers', async () => {
    const slug = `linked-session-${randomUUID()}`;
    const links = {
      characters: ['aveline'],
      objects: ['relique-brisee'],
      places: ['brumeval-gate'],
      rules: [{ ref: 'R-13.9', sourcePath: 'docs/rules/13-roles-passation.md' }]
    };

    await app.inject({
      method: 'POST',
      payload: { slug, title: 'Linked API' },
      url: '/sessions'
    });

    const eventResponse = await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        eventType: 'scene_opened',
        links,
        payload: { text: 'La relique apparait dans la brume.' }
      },
      url: `/sessions/${slug}/events`
    });
    const decisionResponse = await app.inject({
      method: 'POST',
      payload: {
        assignedTo: 'human_gm',
        links,
        payload: { options: ['examiner', 'ignorer'] },
        requestedBy: 'llm',
        title: 'Tracer la relique dans le journal'
      },
      url: `/sessions/${slug}/decisions`
    });
    const decisionId = decisionResponse.json().decision.id;
    const resolveResponse = await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        links,
        resolution: { ruling: 'examiner' },
        status: 'approved'
      },
      url: `/sessions/${slug}/decisions/${decisionId}/resolve`
    });
    const rollbackResponse = await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        links,
        reason: 'Retour avant decision',
        targetSequence: 1
      },
      url: `/sessions/${slug}/rollback`
    });
    const readResponse = await app.inject({ method: 'GET', url: `/sessions/${slug}` });
    const readBody = readResponse.json();
    const sql = createSqlClient();
    let auditRows: { action: string; payload: { links?: unknown } }[];

    try {
      auditRows = await sql<{ action: string; payload: { links?: unknown } }[]>`
        SELECT action, payload
        FROM audit_events
        WHERE payload->>'sessionId' = ${readBody.id}
        ORDER BY created_at ASC
      `;
    } finally {
      await sql.end({ timeout: 5 });
    }

    expect(eventResponse.statusCode).toBe(201);
    expect(decisionResponse.statusCode).toBe(201);
    expect(resolveResponse.statusCode).toBe(200);
    expect(rollbackResponse.statusCode).toBe(201);
    expect(eventResponse.json().event.payload.links).toEqual(links);
    expect(decisionResponse.json().decision.payload.links).toEqual(links);
    expect(resolveResponse.json().decision.resolution.links).toEqual(links);
    expect(rollbackResponse.json().event.payload.links).toEqual(links);
    expect(
      readBody.events.map((event: { payload: { links?: unknown } }) => event.payload.links)
    ).toEqual([links, links, links, links]);
    expect(auditRows.map((row) => row.action)).toEqual([
      'session.event.appended',
      'session.decision.queued',
      'session.decision.resolved',
      'session.rollback.requested'
    ]);
    expect(auditRows.map((row) => row.payload.links)).toEqual([links, links, links, links]);
  });

  it('rejects invalid session payloads', async () => {
    const response = await app.inject({
      method: 'POST',
      payload: {
        slug: 'Invalid Slug',
        title: ''
      },
      url: '/sessions'
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      errors: ['slug must use lowercase letters, numbers and dashes', 'title is required'],
      status: 'invalid'
    });
  });
});
