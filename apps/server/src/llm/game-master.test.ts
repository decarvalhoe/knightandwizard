import { describe, expect, it } from 'vitest';
import {
  createGameMasterRuntime,
  createWorkingMemory,
  describeSceneWithGameMaster,
  executeRollDiceTool
} from './game-master.js';

describe('game master Mastra runtime', () => {
  it('configures the K&W GM agent with the rollDice Mastra tool', async () => {
    const runtime = createGameMasterRuntime({ model: 'ollama/qwen2.5:7b' });

    expect(runtime.model).toBe('ollama/qwen2.5:7b');
    expect(runtime.agent.name).toBe('K&W Game Master');
    expect(runtime.mastra.getAgent('gameMaster')).toBe(runtime.agent);
    expect(await runtime.agent.getInstructions()).toContain('Le LLM ne calcule jamais');
    expect(Object.keys(await runtime.agent.listTools())).toEqual([
      'rollDice',
      'applyDamage',
      'resolveAttack',
      'getCharacterStatus',
      'advanceCombatTimeline',
      'lookupRule',
      'lookupBestiary'
    ]);
  });

  it('executes rollDice through the rules-core tool contract', async () => {
    const result = await executeRollDiceTool(
      {
        difficulty: 7,
        pool: 3,
        reason: 'Tester la vigilance du guetteur'
      },
      { randomInteger: scriptedRolls([7, 8, 2]) }
    );

    expect(result).toMatchObject({
      difficulty: 7,
      isCriticalFailure: false,
      isCriticalSuccess: false,
      pool: 3,
      reason: 'Tester la vigilance du guetteur',
      rolls: [7, 8, 2],
      successes: 2,
      total: 17
    });
  });

  it('describes a scene, calls rollDice and stores working memory by session', async () => {
    const memory = createWorkingMemory();
    const result = await describeSceneWithGameMaster(
      {
        sceneDescription: 'La compagnie approche de la porte nord sous la pluie.',
        sessionId: 'session-brumeval',
        roll: {
          difficulty: 7,
          pool: 3,
          reason: 'Vigilance du guetteur'
        }
      },
      {
        memory,
        randomInteger: scriptedRolls([7, 8, 2])
      }
    );

    expect(result.provider).toBe('deterministic-dev');
    expect(result.narration).toContain('porte nord');
    expect(result.narration).toContain('2 succes');
    expect(result.toolCalls).toEqual([
      {
        input: {
          difficulty: 7,
          pool: 3,
          reason: 'Vigilance du guetteur'
        },
        output: expect.objectContaining({
          rolls: [7, 8, 2],
          successes: 2
        }),
        tool: 'rollDice'
      }
    ]);
    expect(memory.getSession('session-brumeval')).toMatchObject({
      sessionId: 'session-brumeval',
      turns: [
        expect.objectContaining({ role: 'user' }),
        expect.objectContaining({ role: 'assistant' })
      ]
    });
  });

  it('injects retrieved rules context and cites it in the deterministic narration', async () => {
    const recorded: unknown[] = [];
    const result = await describeSceneWithGameMaster(
      {
        sceneDescription: 'Comment resoudre un jet difficile pour crocheter une serrure ?',
        sessionId: 'session-rag'
      },
      {
        knowledgeRetriever: {
          searchRules: async () => [
            {
              citation: 'docs/rules/01-resolution.md > Jets difficiles',
              heading: 'Jets difficiles',
              id: 'chunk-resolution',
              rank: 1,
              score: 0.92,
              sourceKind: 'rule_markdown',
              sourcePath: 'docs/rules/01-resolution.md',
              text: 'Un jet difficile fixe un seuil, lance une reserve de D10 et compte les succes.'
            }
          ]
        },
        episodicMemoryStore: {
          recall: async () => [
            {
              id: 'memory-sergent-malo',
              importance: 4,
              kind: 'npc_encounter',
              occurredAt: '2026-04-29T20:00:00.000Z',
              payload: {},
              score: 2.5,
              sessionKey: 'session-rag',
              source: 'test',
              subject: 'Sergent Malo',
              summary: 'Le Sergent Malo a deja aide le groupe devant la porte nord.'
            }
          ],
          record: async (memory) => {
            recorded.push(memory);
            return undefined;
          }
        }
      }
    );

    expect(result.knowledge).toMatchObject({
      citations: [
        {
          citation: 'docs/rules/01-resolution.md > Jets difficiles',
          score: 0.92
        }
      ],
      query: 'Comment resoudre un jet difficile pour crocheter une serrure ?'
    });
    expect(result.knowledge.context).toContain('[1] docs/rules/01-resolution.md > Jets difficiles');
    expect(result.narration).toContain(
      'Sources RAG: [1] docs/rules/01-resolution.md > Jets difficiles'
    );
    expect(result.episodicMemory.context).toContain('[M1] Sergent Malo');
    expect(result.narration).toContain('Memoire: [M1] Sergent Malo');
    expect(recorded).toEqual([
      expect.objectContaining({
        kind: 'scene_event',
        sessionKey: 'session-rag'
      })
    ]);
  });
});

function scriptedRolls(values: number[]) {
  let index = 0;

  return (sides: number): number => {
    const value = values[index];
    index += 1;

    if (value === undefined) {
      throw new Error(`No scripted roll left for D${sides}`);
    }

    return value;
  };
}
