import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';

const app = buildApp({ logger: false });

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('game master routes', () => {
  it('describes a scene and includes a rollDice tool result in the narration', async () => {
    const response = await app.inject({
      method: 'POST',
      payload: {
        roll: {
          difficulty: 7,
          pool: 2,
          reason: 'Evaluer les traces dans la boue'
        },
        sceneDescription: 'Un chemin boueux quitte Brumeval vers la foret.',
        sessionId: 'route-session'
      },
      url: '/game-master/scenes/describe'
    });
    const payload = response.json();

    expect(response.statusCode).toBe(200);
    expect(payload).toMatchObject({
      model: 'ollama/qwen2.5:7b',
      provider: 'deterministic-dev',
      status: 'described',
      toolCalls: [
        {
          input: {
            difficulty: 7,
            pool: 2,
            reason: 'Evaluer les traces dans la boue'
          },
          tool: 'rollDice'
        }
      ]
    });
    expect(payload.narration).toContain('Jet D10 difficulte 7');
    expect(payload.toolCalls[0].output.successes).toEqual(expect.any(Number));
  });

  it('rejects invalid scene requests', async () => {
    const response = await app.inject({
      method: 'POST',
      payload: {
        roll: {
          difficulty: 0,
          pool: 0
        },
        sceneDescription: '',
        sessionId: ''
      },
      url: '/game-master/scenes/describe'
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      errors: [
        'sessionId is required',
        'sceneDescription is required',
        'roll.pool must be a positive integer',
        'roll.difficulty must be a positive integer'
      ],
      status: 'invalid'
    });
  });
});
