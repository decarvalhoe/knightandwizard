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

describe('character draft routes', () => {
  it('upserts and reads character creation drafts for API-backed autosave', async () => {
    const draft = {
      currentStep: 'skills',
      payload: {
        classId: 'enchanteur',
        name: 'Aveline',
        raceId: 'humain'
      }
    };

    const saveResponse = await app.inject({
      method: 'PUT',
      payload: draft,
      url: '/character-drafts/draft-aveline'
    });
    const readResponse = await app.inject({
      method: 'GET',
      url: '/character-drafts/draft-aveline'
    });

    expect(saveResponse.statusCode).toBe(200);
    expect(saveResponse.json()).toMatchObject({
      currentStep: 'skills',
      id: 'draft-aveline',
      payload: draft.payload,
      status: 'saved'
    });
    expect(readResponse.statusCode).toBe(200);
    expect(readResponse.json()).toMatchObject({
      currentStep: 'skills',
      id: 'draft-aveline',
      payload: draft.payload
    });
  });

  it('scopes draft persistence to the current request user', async () => {
    const draftId = `draft-auth-${randomUUID()}`;
    const draft = {
      currentStep: 'identity',
      payload: {
        classId: 'garde',
        name: 'Aveline Auth',
        raceId: 'humain'
      }
    };

    const saveResponse = await app.inject({
      headers: { 'x-kw-user-id': 'player-aveline' },
      method: 'PUT',
      payload: draft,
      url: `/character-drafts/${draftId}`
    });
    const ownerReadResponse = await app.inject({
      headers: { 'x-kw-user-id': 'player-aveline' },
      method: 'GET',
      url: `/character-drafts/${draftId}`
    });
    const otherReadResponse = await app.inject({
      headers: { 'x-kw-user-id': 'player-bastian' },
      method: 'GET',
      url: `/character-drafts/${draftId}`
    });
    const overwriteResponse = await app.inject({
      headers: { 'x-kw-user-id': 'player-bastian' },
      method: 'PUT',
      payload: {
        ...draft,
        payload: { ...draft.payload, name: 'Bastian Intrus' }
      },
      url: `/character-drafts/${draftId}`
    });

    expect(saveResponse.statusCode).toBe(200);
    expect(saveResponse.json()).toMatchObject({
      id: draftId,
      status: 'saved',
      userId: 'player-aveline'
    });
    expect(ownerReadResponse.statusCode).toBe(200);
    expect(ownerReadResponse.json()).toMatchObject({
      id: draftId,
      payload: draft.payload,
      userId: 'player-aveline'
    });
    expect(otherReadResponse.statusCode).toBe(404);
    expect(overwriteResponse.statusCode).toBe(409);
    expect(overwriteResponse.json()).toEqual({ status: 'owner_conflict' });
  });

  it('allows browser preflight requests from the game app', async () => {
    const response = await app.inject({
      headers: {
        'access-control-request-method': 'PUT',
        origin: 'http://localhost:3000'
      },
      method: 'OPTIONS',
      url: '/character-drafts/draft-aveline'
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(response.headers['access-control-allow-methods']).toContain('PUT');
    expect(response.headers['access-control-allow-headers']).toContain('x-kw-user-id');
  });
});
