import { randomUUID } from 'node:crypto';
import { createTRPCClient, httpLink } from '@trpc/client';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import { runMigrations } from '../db/migrate.js';
import type { AppRouter } from './router.js';

const app = buildApp({ logger: false });
const trpc = createTestTrpcClient(app);

beforeAll(async () => {
  await runMigrations();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('tRPC rules and character procedures', () => {
  it('rolls dice through rules-core with deterministic test rolls', async () => {
    const result = await trpc.dice.roll.mutate({
      difficulty: 7,
      pool: 2,
      randomInteger: [7, 6],
      reason: 'procedure-test'
    });

    expect(result).toMatchObject({
      difficulty: 7,
      isCriticalFailure: false,
      isCriticalSuccess: false,
      pool: 2,
      reason: 'procedure-test',
      rolls: [7, 6],
      status: 'ok',
      successes: 1
    });
  });

  it('resolves combat actions on the server via the rules-core tool wrapper', async () => {
    const result = await trpc.combat.resolveAction.mutate({
      randomInteger: [7, 8],
      state: {
        currentDT: 1,
        log: [],
        round: 1,
        timeline: [
          {
            attributes: { dexterity: 3, stamina: 3, strength: 4 },
            id: 'aveline',
            name: 'Aveline',
            nextActionAt: 3,
            pendingAction: {
              attack: { difficulty: 7, pool: 2 },
              damageOnHit: 3,
              targetId: 'brigand',
              type: 'attack'
            },
            reflexes: 4,
            skills: { sword: 2 },
            speedFactor: 4,
            statuses: [],
            vitality: { current: 18, max: 18 }
          },
          {
            attributes: { dexterity: 2, stamina: 2, strength: 3 },
            id: 'brigand',
            name: 'Brigand',
            nextActionAt: 5,
            reflexes: 2,
            skills: { axe: 1 },
            speedFactor: 5,
            statuses: [],
            vitality: { current: 12, max: 12 }
          }
        ]
      }
    });

    const target = result.state.timeline.find((combatant) => combatant.id === 'brigand');

    expect(result.status).toBe('ok');
    expect(target?.vitality.current).toBe(9);
    expect(result.state.log.map((event) => event.type)).toEqual([
      'attack_resolved',
      'damage_applied'
    ]);
    expect(result.state.log[0]).toMatchObject({
      actorId: 'aveline',
      attackRoll: { rolls: [7, 8], successes: 2 },
      successes: 2,
      targetId: 'brigand'
    });
  });

  it('finalizes saved character drafts into persisted characters and reads them back', async () => {
    const draftId = `draft-${randomUUID()}`;
    const draft = {
      currentStep: 'review',
      payload: {
        attributes: {
          aestheticism: 1,
          charisma: 2,
          dexterity: 3,
          empathy: 1,
          intelligence: 2,
          perception: 2,
          reflexes: 2,
          stamina: 3,
          strength: 4
        },
        background: 'Garde de la porte nord.',
        classId: 'garde',
        deity: 'Les Trois Flammes',
        equipmentIds: ['epee_batarde'],
        extraSpellPoints: 0,
        genderId: 'unspecified',
        name: 'Aveline API',
        orientationId: 'guerrier',
        psychology: 'calme',
        quote: 'La lame engage.',
        raceId: 'humain',
        skills: [
          { id: 'epee-a-une-main', points: 4 },
          { id: 'stoicisme', points: 4 },
          { id: 'commandement', points: 4 },
          { id: 'observation-du-terrain', points: 4 },
          { id: 'bouclier', points: 4 }
        ],
        spells: []
      }
    };

    const saveResponse = await app.inject({
      method: 'PUT',
      payload: draft,
      url: `/character-drafts/${draftId}`
    });

    const finalized = await trpc.characters.finalize.mutate({ draftId });
    const readBack = await trpc.characters.get.query({ id: finalized.character.id });

    expect(saveResponse.statusCode).toBe(200);
    expect(finalized.character).toMatchObject({
      id: draftId,
      kind: 'player',
      metadata: {
        background: 'Garde de la porte nord.',
        deity: 'Les Trois Flammes'
      },
      name: 'Aveline API',
      race: { id: 'humain' }
    });
    expect(readBack.character).toEqual(finalized.character);
  });
});

function createTestTrpcClient(
  app: FastifyInstance
): ReturnType<typeof createTRPCClient<AppRouter>> {
  return createTRPCClient<AppRouter>({
    links: [
      httpLink({
        fetch: async (input, init) => {
          const requestUrl = new URL(String(input));
          const response = await app.inject({
            headers: toHeaderRecord(init?.headers),
            method: toHttpMethod(init?.method),
            payload: await toPayload(init?.body),
            url: `${requestUrl.pathname}${requestUrl.search}`
          });
          const headers = new Headers();

          for (const [key, value] of Object.entries(response.headers)) {
            if (Array.isArray(value)) {
              for (const item of value) {
                headers.append(key, String(item));
              }
            } else if (value !== undefined) {
              headers.set(key, String(value));
            }
          }

          return new Response(response.body, {
            headers,
            status: response.statusCode
          });
        },
        url: 'http://test.local/trpc'
      })
    ]
  });
}

function toHeaderRecord(headers: HeadersInit | undefined): Record<string, string> {
  const result: Record<string, string> = {};

  if (headers === undefined) {
    return result;
  }

  new Headers(headers).forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

function toHttpMethod(method: string | undefined): 'GET' | 'POST' {
  return method === 'POST' ? 'POST' : 'GET';
}

async function toPayload(body: BodyInit | null | undefined): Promise<string | undefined> {
  if (body === null || body === undefined) {
    return undefined;
  }

  if (typeof body === 'string') {
    return body;
  }

  return new Response(body).text();
}
