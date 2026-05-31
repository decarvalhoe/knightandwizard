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
      'lookupBestiary',
      'decideNpcAction'
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
      status: 'ok',
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
          status: 'ok',
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

  it('includes D100 severity in deterministic critical failure narration', async () => {
    const result = await describeSceneWithGameMaster(
      {
        sceneDescription: 'Aveline tente une acrobatie dangereuse.',
        roll: {
          difficulty: 7,
          pool: 2,
          reason: 'Acrobatie sur corniche'
        },
        sessionId: 'session-critical-failure'
      },
      {
        randomInteger: scriptedRolls([2, 1, 73])
      }
    );

    expect(result.toolCalls[0]?.output).toMatchObject({
      criticalFailureSeverity: 73,
      isCriticalFailure: true,
      successes: 0
    });
    expect(result.narration).toContain('Echec critique D100 73.');
  });

  it('keeps invalid roll tool errors visible and recoverable', async () => {
    const result = await describeSceneWithGameMaster({
      sceneDescription: 'Le MJ demande un jet mal forme pendant un test outil.',
      roll: {
        difficulty: 7,
        pool: 0,
        reason: 'Contrat de recuperation tool calling'
      } as never,
      sessionId: 'session-roll-error'
    });

    expect(result.toolCalls[0]?.output).toMatchObject({
      message: expect.stringContaining('pool'),
      status: 'error'
    });
    expect(result.narration).toContain('Erreur outil rollDice');
    expect(result.narration).toContain('attend une entree corrigee');
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
              metadata: {
                catalog_ids: [],
                chunk_hash: 'a'.repeat(64),
                chunk_index: 0,
                contains: [],
                domain: 'D1-resolution',
                domains: ['D1-resolution'],
                ingested_at: 'test',
                priority: 100,
                source_hash: 'b'.repeat(64),
                source_path: 'docs/rules/01-resolution.md',
                source_status: 'active',
                source_type: 'canonical_rule',
                unit_ids: []
              },
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
              provenanceType: 'session_fact',
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
      grounding: {
        catalogOverrideAllowed: false,
        vectorRole: 'citation_and_arbitration_context'
      },
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
        payload: expect.objectContaining({
          canonicalLoreMutable: false
        }),
        provenanceType: 'session_fact',
        sessionKey: 'session-rag',
        source: 'game-master'
      })
    ]);
  });

  it('delegates narration to agent.generate when the Mastra provider is enabled', async () => {
    const prompts: string[] = [];
    const result = await describeSceneWithGameMaster(
      {
        sceneDescription: 'Aveline negocie avec le capitaine a la porte nord.',
        sessionId: 'session-agent-generate',
        roll: {
          difficulty: 7,
          pool: 2,
          reason: 'Convaincre le capitaine'
        }
      },
      {
        agentInvoker: {
          generate: async (_agent, prompt) => {
            prompts.push(prompt);
            return 'Le capitaine hesite, puis laisse Aveline parler sous condition. [1]';
          }
        },
        episodicMemoryStore: {
          recall: async () => [
            {
              id: 'memory-captain',
              importance: 3,
              kind: 'npc_encounter',
              occurredAt: '2026-04-30T19:00:00.000Z',
              payload: {},
              provenanceType: 'session_fact',
              score: 1.8,
              sessionKey: 'session-agent-generate',
              source: 'test',
              subject: 'Capitaine Orlan',
              summary: 'Le capitaine Orlan se mefie des voyageurs armes.'
            }
          ],
          record: async () => undefined
        },
        knowledgeRetriever: {
          searchRules: async () => [
            {
              citation: 'docs/rules/13-arbitrage.md > Autorite MJ',
              heading: 'Autorite MJ',
              id: 'chunk-authority',
              rank: 1,
              score: 0.88,
              sourceKind: 'rule_markdown',
              sourcePath: 'docs/rules/13-arbitrage.md',
              metadata: {
                catalog_ids: [],
                chunk_hash: 'c'.repeat(64),
                chunk_index: 0,
                contains: [],
                domain: 'D13-arbitrage',
                domains: ['D13-arbitrage'],
                ingested_at: 'test',
                priority: 100,
                source_hash: 'd'.repeat(64),
                source_path: 'docs/rules/13-arbitrage.md',
                source_status: 'active',
                source_type: 'canonical_rule',
                unit_ids: []
              },
              text: 'Le MJ humain conserve l autorite finale sur les decisions de table.'
            }
          ]
        },
        provider: 'mastra-agent',
        randomInteger: scriptedRolls([7, 9])
      }
    );

    expect(result.provider).toBe('mastra-agent');
    expect(result.narration).toBe(
      'Le capitaine hesite, puis laisse Aveline parler sous condition. [1]'
    );
    expect(prompts).toHaveLength(1);
    expect(prompts[0]).toContain('Aveline negocie avec le capitaine');
    expect(prompts[0]).toContain('docs/rules/13-arbitrage.md > Autorite MJ');
    expect(prompts[0]).toContain('Capitaine Orlan');
    expect(prompts[0]).toContain('2 succes');
  });

  it('falls back to deterministic narration when agent.generate fails', async () => {
    const result = await describeSceneWithGameMaster(
      {
        sceneDescription: 'La patrouille ferme la herse.',
        sessionId: 'session-agent-fallback'
      },
      {
        agentInvoker: {
          generate: async () => {
            throw new Error('model unavailable');
          }
        },
        episodicMemoryStore: {
          recall: async () => [],
          record: async () => undefined
        },
        knowledgeRetriever: {
          searchRules: async () => []
        },
        provider: 'mastra-agent'
      }
    );

    expect(result.provider).toBe('deterministic-dev');
    expect(result.generationError).toBe('model unavailable');
    expect(result.narration).toContain('La patrouille ferme la herse.');
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
