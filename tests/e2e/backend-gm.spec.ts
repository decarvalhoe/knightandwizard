import { expect, type APIRequestContext, test, type TestInfo } from '@playwright/test';

import {
  canonicalE2EFixtures,
  formatCanonicalSourceRefs,
  type CanonicalE2EScenario
} from './fixtures/canonical';

const apiBaseUrl = process.env.E2E_API_URL ?? 'http://127.0.0.1:3102';

type JsonObject = Record<string, unknown>;

test.describe('K&W backend, RAG and GM runtime flows', () => {
  test('persists drafts, session events, GM decisions, RAG context and episodic memory', async ({
    request
  }, testInfo) => {
    annotateCanonical(testInfo, 'backendGm');
    const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const draftId = `e2e-draft-${suffix}`;
    const sessionSlug = `e2e-session-${suffix}`;
    const gmSessionId = `e2e-gm-${suffix}`;
    const canonicalLinks = {
      characters: ['aveline'],
      objects: ['relique-brisee'],
      places: ['porte-nord'],
      rules: [{ ref: 'D13 arbitrage et rollback', sourcePath: 'docs/rules/13-roles-passation.md' }]
    };

    await expectJson(request, 'GET', '/health', 200, (body) => {
      expect(body.status).toBe('ok');
      expect(body.service).toBe('@knightandwizard/server');
    });

    await expectJson(request, 'GET', '/ready', 200, (body) => {
      expect(body.status).toBe('ready');
      expect(body.pgvector).toBe(true);
    });

    await expectJson(
      request,
      'PUT',
      `/character-drafts/${draftId}`,
      200,
      (body) => {
        expect(body.status).toBe('saved');
        expect(body.id).toBe(draftId);
        expect(body.currentStep).toBe('review');
      },
      {
        currentStep: 'review',
        payload: {
          name: canonicalE2EFixtures.actors.avelineDraftName,
          rules: 'character creation draft persistence'
        },
        userId: 'e2e'
      }
    );

    await expectJson(request, 'GET', `/character-drafts/${draftId}`, 200, (body) => {
      expect(body.status).toBe('found');
      expect(asRecord(body.payload).name).toBe(canonicalE2EFixtures.actors.avelineDraftName);
    });

    await expectJson(
      request,
      'POST',
      '/sessions',
      201,
      (body) => {
        expect(body.status).toBe('active');
        expect(body.slug).toBe(sessionSlug);
        expect(body.events).toHaveLength(0);
      },
      {
        metadata: { e2e: true },
        mode: 'digital_llm_gm',
        slug: sessionSlug,
        status: 'active',
        title: 'Session E2E'
      }
    );

    await expectJson(
      request,
      'POST',
      `/sessions/${sessionSlug}/events`,
      201,
      (body) => {
        const event = asRecord(body.event);

        expect(body.status).toBe('created');
        expect(event.sequence).toBe(1);
        expect(event.eventType).toBe('scene_opened');
        expect(asRecord(event.payload).links).toEqual(canonicalLinks);
      },
      {
        actorId: 'gm',
        eventType: 'scene_opened',
        links: canonicalLinks,
        payload: { location: 'Porte nord' }
      }
    );

    const decision = await expectJson(
      request,
      'POST',
      `/sessions/${sessionSlug}/decisions`,
      201,
      (body) => {
        const decisionBody = asRecord(body.decision);
        const event = asRecord(body.event);

        expect(body.status).toBe('created');
        expect(decisionBody.status).toBe('pending');
        expect(event.eventType).toBe('gm_decision_requested');
        expect(asRecord(decisionBody.payload).links).toEqual(canonicalLinks);
        expect(asRecord(event.payload).links).toEqual(canonicalLinks);
      },
      {
        assignedTo: 'human_gm',
        links: canonicalLinks,
        payload: { options: ['negocier', 'combattre'] },
        priority: 'high',
        requestedBy: 'llm',
        title: 'Valider la reaction du guetteur'
      }
    );

    const queuedDecision = asRecord(decision.decision);

    await expectJson(
      request,
      'POST',
      `/sessions/${sessionSlug}/decisions/${queuedDecision.id}/resolve`,
      200,
      (body) => {
        const decisionBody = asRecord(body.decision);
        const event = asRecord(body.event);

        expect(body.status).toBe('resolved');
        expect(decisionBody.status).toBe('approved');
        expect(event.eventType).toBe('gm_decision_resolved');
        expect(asRecord(decisionBody.resolution).links).toEqual(canonicalLinks);
        expect(asRecord(event.payload).links).toEqual(canonicalLinks);
      },
      {
        actorId: 'gm',
        links: canonicalLinks,
        resolution: { ruling: 'Reaction validee' },
        status: 'approved'
      }
    );

    await expectJson(
      request,
      'POST',
      `/sessions/${sessionSlug}/rollback`,
      201,
      (body) => {
        const event = asRecord(body.event);

        expect(body.status).toBe('created');
        expect(event.eventType).toBe('rollback_requested');
        expect(asRecord(event.payload).links).toEqual(canonicalLinks);
      },
      {
        actorId: 'gm',
        links: canonicalLinks,
        reason: 'Correction E2E',
        targetSequence: 1
      }
    );

    await expectJson(request, 'GET', `/sessions/${sessionSlug}`, 200, (body) => {
      const events = records(body.events);

      expect(events.map((event) => event.eventType)).toEqual([
        'scene_opened',
        'gm_decision_requested',
        'gm_decision_resolved',
        'rollback_requested'
      ]);
      expect(events.map((event) => asRecord(event.payload).links)).toEqual([
        canonicalLinks,
        canonicalLinks,
        canonicalLinks,
        canonicalLinks
      ]);
      expect(asRecord(records(body.decisions)[0]).status).toBe('approved');
    });

    await expectJson(
      request,
      'POST',
      '/game-master/scenes/describe',
      200,
      (body) => {
        expect(body.status).toBe('described');
        expect(body.provider).toBe('deterministic-dev');
        const toolCalls = records(body.toolCalls);
        const firstToolCall = asRecord(toolCalls[0]);
        const output = asRecord(firstToolCall.output);
        const knowledge = asRecord(body.knowledge);

        expect(toolCalls).toHaveLength(1);
        expect(firstToolCall.tool).toBe('rollDice');
        expect(records(output.rolls).length).toBeGreaterThanOrEqual(4);
        expect(records(knowledge.citations).length).toBeGreaterThan(0);
        expect(body.narration).toContain('Sources RAG');
      },
      {
        roll: {
          difficulty: 7,
          pool: 4,
          reason: 'jet de des difficile'
        },
        sceneDescription: canonicalE2EFixtures.scenes.firstDifficultRoll,
        sessionId: gmSessionId
      }
    );

    await expectJson(
      request,
      'POST',
      '/game-master/scenes/describe',
      200,
      (body) => {
        const episodicMemory = asRecord(body.episodicMemory);

        expect(body.status).toBe('described');
        expect(records(episodicMemory.memories).length).toBeGreaterThan(0);
        expect(body.narration).toContain('Memoire');
      },
      {
        sceneDescription: canonicalE2EFixtures.scenes.memoryRecall,
        sessionId: gmSessionId
      }
    );
  });
});

function annotateCanonical(testInfo: TestInfo, scenario: CanonicalE2EScenario): void {
  const fixture = canonicalE2EFixtures.scenarios[scenario];

  testInfo.annotations.push({
    description: formatCanonicalSourceRefs(fixture.sourceRefs),
    type: 'canonical-sources'
  });
}

async function expectJson(
  request: APIRequestContext,
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  expectedStatus: number,
  assertBody: (body: JsonObject) => void,
  data?: Record<string, unknown>
): Promise<JsonObject> {
  const response = await request.fetch(`${apiBaseUrl}${path}`, {
    data,
    headers: data ? { 'content-type': 'application/json' } : undefined,
    method
  });
  const body = asRecord(await response.json());

  expect(response.status(), `${method} ${path}`).toBe(expectedStatus);
  assertBody(body);

  return body;
}

function asRecord(value: unknown): JsonObject {
  expect(value).toEqual(expect.any(Object));

  return value as JsonObject;
}

function records(value: unknown): JsonObject[] {
  expect(Array.isArray(value)).toBe(true);

  return value as JsonObject[];
}
