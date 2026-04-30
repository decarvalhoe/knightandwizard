import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';

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
