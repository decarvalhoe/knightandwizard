import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  appendCombatResolutionToSession,
  appendDiceRollToSession,
  queuePersistedGmDecision,
  requestPersistedRollback,
  resolvePersistedGmDecision
} from './persistence.js';

const originalPublicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

afterEach(() => {
  vi.restoreAllMocks();
  restoreEnv('NEXT_PUBLIC_API_BASE_URL', originalPublicApiBaseUrl);
});

describe('session manager persistence', () => {
  it('appends a resolved dice roll as a typed persisted session event', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://browser-api.test';
    const fetchMock = vi.fn().mockResolvedValue(okJson({ status: 'created' }));
    vi.stubGlobal('fetch', fetchMock);

    await appendDiceRollToSession('brumeval', {
      actorId: 'aveline',
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

    expect(fetchMock).toHaveBeenCalledWith('http://browser-api.test/sessions/brumeval/events', {
      body: JSON.stringify({
        actorId: 'aveline',
        eventType: 'dice_roll',
        payload: {
          difficulty: 7,
          isCriticalFailure: false,
          isCriticalSuccess: false,
          pool: 2,
          reason: 'session-manager',
          rolls: [9, 3],
          status: 'ok',
          successes: 1
        }
      }),
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
