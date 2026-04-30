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
        raceId: 'human'
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
  });
});
