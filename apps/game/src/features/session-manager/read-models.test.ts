import { afterEach, describe, expect, it, vi } from 'vitest';

import { getSessionManagerReadModel } from './read-models.js';

const originalApiBaseUrl = process.env.API_BASE_URL;
const originalPublicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

afterEach(() => {
  vi.restoreAllMocks();
  restoreEnv('API_BASE_URL', originalApiBaseUrl);
  restoreEnv('NEXT_PUBLIC_API_BASE_URL', originalPublicApiBaseUrl);
});

describe('session manager read models', () => {
  it('loads the persisted session snapshot from the server API', async () => {
    process.env.API_BASE_URL = 'http://api.test';
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        state: {
          audit: [],
          createdAt: '2026-05-26T10:00:00.000Z',
          decisions: [],
          events: [
            {
              actorId: 'gm',
              createdAt: '2026-05-26T10:01:00.000Z',
              id: 'event-1',
              payload: { location: 'Porte nord' },
              sequence: 1,
              type: 'scene_opened'
            }
          ],
          id: 'session-1',
          metadata: { campaign: 'Brumeval' },
          mode: 'digital_human_gm',
          players: [{ id: 'gm', name: 'MJ', role: 'human_gm' }],
          scenes: [{ id: 'gate', location: 'Brumeval', status: 'active', title: 'Porte nord' }],
          slug: 'brumeval',
          status: 'active',
          title: 'Brumeval',
          updatedAt: '2026-05-26T10:01:00.000Z'
        }
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const readModel = await getSessionManagerReadModel('brumeval');

    expect(fetchMock).toHaveBeenCalledWith('http://api.test/sessions/brumeval', {
      cache: 'no-store'
    });
    expect(readModel.initialState.events.map((event) => event.type)).toEqual(['scene_opened']);
    expect(readModel.initialState.players).toEqual([{ id: 'gm', name: 'MJ', role: 'human_gm' }]);
  });

  it('creates an empty durable session when the requested slug does not exist', async () => {
    process.env.API_BASE_URL = 'http://api.test';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'not_found' }), { status: 404 }))
      .mockResolvedValueOnce(
        jsonResponse({
          state: {
            audit: [],
            createdAt: '2026-05-26T10:00:00.000Z',
            decisions: [],
            events: [],
            id: 'session-1',
            metadata: {},
            mode: 'digital_human_gm',
            players: [],
            scenes: [],
            slug: 'brumeval',
            status: 'active',
            title: 'Brumeval',
            updatedAt: '2026-05-26T10:00:00.000Z'
          }
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    const readModel = await getSessionManagerReadModel('brumeval');

    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://api.test/sessions', {
      body: JSON.stringify({
        metadata: {},
        mode: 'digital_human_gm',
        slug: 'brumeval',
        status: 'active',
        title: 'Brumeval'
      }),
      cache: 'no-store',
      headers: { 'content-type': 'application/json' },
      method: 'POST'
    });
    expect(readModel.initialState.slug).toBe('brumeval');
    expect(readModel.initialState.events).toEqual([]);
  });

  it('joins the current player identity before rendering the session', async () => {
    process.env.API_BASE_URL = 'http://api.test';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(sessionSnapshot({ players: [] })))
      .mockResolvedValueOnce(
        jsonResponse({
          session: sessionSnapshot({
            players: [
              {
                characterId: 'pc-aveline',
                connected: true,
                id: 'player-aveline',
                name: 'Aveline API',
                role: 'player'
              }
            ]
          }),
          status: 'joined'
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    const readModel = await getSessionManagerReadModel('brumeval', {
      characterId: 'pc-aveline',
      name: 'Aveline API',
      playerId: 'player-aveline',
      role: 'player'
    });

    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://api.test/sessions/brumeval/players', {
      body: JSON.stringify({
        characterId: 'pc-aveline',
        name: 'Aveline API',
        playerId: 'player-aveline',
        role: 'player'
      }),
      cache: 'no-store',
      headers: { 'content-type': 'application/json' },
      method: 'POST'
    });
    expect(readModel.currentPlayerId).toBe('player-aveline');
    expect(readModel.initialState.players).toEqual([
      {
        characterId: 'pc-aveline',
        connected: true,
        id: 'player-aveline',
        name: 'Aveline API',
        role: 'player'
      }
    ]);
  });
});

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status: 200
  });
}

function sessionSnapshot(input: { players: unknown[] }) {
  return {
    state: {
      audit: [],
      createdAt: '2026-05-26T10:00:00.000Z',
      decisions: [],
      events: [],
      id: 'session-1',
      metadata: {},
      mode: 'digital_human_gm',
      players: input.players,
      scenes: [],
      slug: 'brumeval',
      status: 'active',
      title: 'Brumeval',
      updatedAt: '2026-05-26T10:00:00.000Z'
    }
  };
}

function restoreEnv(name: 'API_BASE_URL' | 'NEXT_PUBLIC_API_BASE_URL', value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
