import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  appendCombatResolutionToSession,
  appendDiceRollToSession,
  appendGmRulingToSession,
  appendThreadPostToSession,
  awardCharacterXp,
  queuePersistedChangeRequest,
  queuePersistedGmDecision,
  requestPersistedRollback,
  resolvePersistedChangeRequest,
  resolvePersistedGmDecision,
  syncCharacterCombatState
} from './persistence.js';

const originalPublicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

afterEach(() => {
  vi.restoreAllMocks();
  restoreEnv('NEXT_PUBLIC_API_BASE_URL', originalPublicApiBaseUrl);
});

describe('session manager persistence', () => {
  it('appends a table post with an explicit actor', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://browser-api.test';
    const fetchMock = vi.fn().mockResolvedValue(okJson({ status: 'created' }));
    vi.stubGlobal('fetch', fetchMock);

    await appendThreadPostToSession('brumeval', {
      actorId: 'player-aveline',
      text: 'Je fouille la porte.'
    });

    expect(fetchMock).toHaveBeenCalledWith('http://browser-api.test/sessions/brumeval/events', {
      body: JSON.stringify({
        actorId: 'player-aveline',
        eventType: 'player_action',
        payload: {
          kind: 'table_post',
          text: 'Je fouille la porte.'
        }
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST'
    });
  });

  it('appends a resolved dice roll as a typed persisted session event', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://browser-api.test';
    const fetchMock = vi.fn().mockResolvedValue(okJson({ status: 'created' }));
    vi.stubGlobal('fetch', fetchMock);

    await appendDiceRollToSession('brumeval', {
      actorId: 'aveline',
      postText: 'Je force la serrure.',
      result: {
        difficulty: 7,
        isCriticalFailure: false,
        isCriticalSuccess: false,
        pool: 2,
        reason: 'session-manager',
        rolls: [9, 3],
        status: 'ok',
        successes: 1
      }
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toBe('http://browser-api.test/sessions/brumeval/events');
    expect(JSON.parse(init.body as string)).toEqual({
      actorId: 'aveline',
      eventType: 'dice_roll',
      payload: {
        difficulty: 7,
        isCriticalFailure: false,
        isCriticalSuccess: false,
        kind: 'table_roll',
        pool: 2,
        postText: 'Je force la serrure.',
        reason: 'session-manager',
        rolls: [9, 3],
        status: 'ok',
        successes: 1
      }
    });
    expect(init).toMatchObject({
      headers: { 'content-type': 'application/json' },
      method: 'POST'
    });
  });

  it('appends a resolved combat action as a typed persisted session event', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://browser-api.test';
    const fetchMock = vi.fn().mockResolvedValue(okJson({ status: 'created' }));
    vi.stubGlobal('fetch', fetchMock);

    await appendCombatResolutionToSession('brumeval', {
      actorId: 'gm',
      result: {
        state: {
          currentDT: 1,
          log: [{ actorId: 'aveline', atDT: 3, type: 'wait_resolved' }],
          round: 1,
          timeline: []
        },
        status: 'ok'
      }
    });

    expect(fetchMock).toHaveBeenCalledWith('http://browser-api.test/sessions/brumeval/events', {
      body: JSON.stringify({
        actorId: 'gm',
        eventType: 'combat',
        payload: {
          state: {
            currentDT: 1,
            log: [{ actorId: 'aveline', atDT: 3, type: 'wait_resolved' }],
            round: 1,
            timeline: []
          },
          status: 'ok'
        }
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST'
    });
  });

  it('syncs a combat participant back to the persisted character sheet', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://browser-api.test';
    const fetchMock = vi.fn().mockResolvedValue(okJson({ status: 'updated' }));
    vi.stubGlobal('fetch', fetchMock);

    await syncCharacterCombatState('pc-aveline', {
      sessionSlug: 'brumeval',
      statuses: [{ id: 'bleeding' }],
      vitality: { current: 9, max: 20 }
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://browser-api.test/characters/pc-aveline/combat-state',
      {
        body: JSON.stringify({
          sessionSlug: 'brumeval',
          statuses: [{ id: 'bleeding' }],
          vitality: { current: 9, max: 20 }
        }),
        headers: { 'content-type': 'application/json' },
        method: 'PATCH'
      }
    );
  });

  it('appends a GM ruling event for cockpit actions', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://browser-api.test';
    const fetchMock = vi.fn().mockResolvedValue(okJson({ status: 'created' }));
    vi.stubGlobal('fetch', fetchMock);

    await appendGmRulingToSession('brumeval', {
      actorId: 'gm',
      payload: { characterId: 'pc-aveline', kind: 'xp_award', xp: 1 }
    });

    expect(fetchMock).toHaveBeenCalledWith('http://browser-api.test/sessions/brumeval/events', {
      body: JSON.stringify({
        actorId: 'gm',
        eventType: 'gm_ruling',
        payload: { characterId: 'pc-aveline', kind: 'xp_award', xp: 1 }
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST'
    });
  });

  it('awards character XP through the persisted character API', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://browser-api.test';
    const fetchMock = vi.fn().mockResolvedValue(okJson({ status: 'updated' }));
    vi.stubGlobal('fetch', fetchMock);

    await awardCharacterXp('pc-aveline', {
      actorId: 'gm',
      amount: 1,
      reason: 'Fin de session',
      sessionSlug: 'brumeval'
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://browser-api.test/characters/pc-aveline/xp-awards',
      {
        body: JSON.stringify({
          actorId: 'gm',
          amount: 1,
          reason: 'Fin de session',
          sessionSlug: 'brumeval'
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      }
    );
  });

  it('persists GM decision queue, resolution and rollback requests through journal routes', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://browser-api.test';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okJson({ decision: { id: 'decision-1' }, status: 'created' }))
      .mockResolvedValueOnce(okJson({ decision: { id: 'decision-1' }, status: 'resolved' }))
      .mockResolvedValueOnce(okJson({ status: 'created' }));
    vi.stubGlobal('fetch', fetchMock);

    await queuePersistedGmDecision('brumeval', {
      assignedTo: 'human_gm',
      payload: { source: 'session-manager' },
      priority: 'high',
      requestedBy: 'llm',
      title: 'Valider la consequence narrative'
    });
    await resolvePersistedGmDecision('brumeval', 'decision-1', {
      actorId: 'gm',
      resolution: { ruling: 'Decision validee par le MJ' },
      status: 'approved'
    });
    await requestPersistedRollback('brumeval', {
      actorId: 'gm',
      reason: 'Correction demandee par le MJ',
      targetSequence: 2
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://browser-api.test/sessions/brumeval/decisions',
      {
        body: JSON.stringify({
          assignedTo: 'human_gm',
          payload: { source: 'session-manager' },
          priority: 'high',
          requestedBy: 'llm',
          title: 'Valider la consequence narrative'
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      }
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://browser-api.test/sessions/brumeval/decisions/decision-1/resolve',
      {
        body: JSON.stringify({
          actorId: 'gm',
          resolution: { ruling: 'Decision validee par le MJ' },
          status: 'approved'
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      }
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      'http://browser-api.test/sessions/brumeval/rollback',
      {
        body: JSON.stringify({
          actorId: 'gm',
          reason: 'Correction demandee par le MJ',
          targetSequence: 2
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      }
    );
  });

  it('persists session change requests through the governance routes', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://browser-api.test';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okJson({ changeRequest: { id: 'change-1' }, status: 'created' }))
      .mockResolvedValueOnce(okJson({ changeRequest: { id: 'change-1' }, status: 'resolved' }));
    vi.stubGlobal('fetch', fetchMock);

    await queuePersistedChangeRequest('brumeval', {
      assignedTo: 'human_gm',
      authority: 'human_gm',
      changeKind: 'predilection_target',
      payload: { source: 'cockpit' },
      priority: 'high',
      requestedBy: 'gm',
      summary: 'Aveline veut changer sa cible de predilection.',
      targetId: 'pc-aveline',
      targetType: 'character',
      title: 'Changer la predilection'
    });
    await resolvePersistedChangeRequest('brumeval', 'change-1', {
      actorId: 'gm',
      resolution: { ruling: 'Accorde pour la prochaine scene.' },
      status: 'approved'
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://browser-api.test/sessions/brumeval/change-requests',
      {
        body: JSON.stringify({
          assignedTo: 'human_gm',
          authority: 'human_gm',
          changeKind: 'predilection_target',
          payload: { source: 'cockpit' },
          priority: 'high',
          requestedBy: 'gm',
          summary: 'Aveline veut changer sa cible de predilection.',
          targetId: 'pc-aveline',
          targetType: 'character',
          title: 'Changer la predilection'
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      }
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://browser-api.test/sessions/brumeval/change-requests/change-1/resolve',
      {
        body: JSON.stringify({
          actorId: 'gm',
          resolution: { ruling: 'Accorde pour la prochaine scene.' },
          status: 'approved'
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
      }
    );
  });
});

function okJson(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status: 200
  });
}

function restoreEnv(name: 'NEXT_PUBLIC_API_BASE_URL', value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
