import { addCombatant, createCombatState, type Combatant } from '@knightandwizard/rules-core';
import { describe, expect, it } from 'vitest';
import {
  GAME_MASTER_RULE_TOOL_IDS,
  createGameMasterRulesTools,
  executeAdvanceCombatTimelineTool,
  executeApplyDamageTool,
  executeDecideNpcActionTool,
  executeGetCharacterStatusTool,
  executeLookupBestiaryTool,
  executeLookupRuleTool,
  executeResolveAttackTool
} from './rules-tools.js';

describe('game master rules-core tools', () => {
  it('registers the complete Mastra tool surface with Zod input schemas', async () => {
    const tools = createGameMasterRulesTools({
      randomInteger: scriptedRolls([7, 8])
    });

    expect(Object.keys(tools)).toEqual(GAME_MASTER_RULE_TOOL_IDS);
    for (const tool of Object.values(tools)) {
      expect(tool.inputSchema).toBeDefined();
      expect(tool.description.length).toBeGreaterThan(20);
    }
    await expect(
      tools.rollDice.execute?.({ difficulty: 7, pool: 2 }, {} as never)
    ).resolves.toEqual(
      expect.objectContaining({
        rolls: [7, 8],
        successes: 2
      })
    );
  });

  it('applies damage, resolves attacks and advances the DT timeline through rules-core', async () => {
    const state = sampleCombatState();
    const damaged = await executeApplyDamageTool({
      combatantId: 'bandit',
      damage: 4,
      state
    });

    expect(damaged.status).toBe('ok');
    if (damaged.status !== 'ok') {
      throw new Error(damaged.message);
    }
    expect(damaged.state.timeline.find((combatant) => combatant.id === 'bandit')).toMatchObject({
      vitality: {
        current: 6,
        max: 10
      }
    });

    const resolved = await executeResolveAttackTool(
      {
        attack: {
          difficulty: 7,
          pool: 2
        },
        attackerId: 'hero',
        damageOnHit: 3,
        defenderId: 'bandit',
        state,
        weaponId: 'training_sword'
      },
      { randomInteger: scriptedRolls([9, 2]) }
    );

    expect(resolved.status).toBe('ok');
    if (resolved.status !== 'ok') {
      throw new Error(resolved.message);
    }
    expect(resolved.weaponId).toBe('training_sword');
    expect(resolved.state.log.map((event) => event.type)).toContain('attack_resolved');
    expect(resolved.state.log.map((event) => event.type)).toContain('damage_applied');

    const advanced = await executeAdvanceCombatTimelineTool({
      state: {
        ...state,
        timeline: state.timeline.map((combatant) =>
          combatant.id === 'hero'
            ? { ...combatant, pendingAction: { type: 'wait' as const, costDT: 4 } }
            : combatant
        )
      }
    });

    expect(advanced.status).toBe('ok');
    if (advanced.status !== 'ok') {
      throw new Error(advanced.message);
    }
    expect(advanced.state.currentDT).toBe(1);
    expect(advanced.state.timeline.find((combatant) => combatant.id === 'hero')).toMatchObject({
      nextActionAt: 5
    });
  });

  it('returns combatant status, RAG lookup citations and bestiary entries', async () => {
    const state = sampleCombatState();
    const status = await executeGetCharacterStatusTool({
      characterId: 'hero',
      state
    });

    expect(status).toMatchObject({
      status: 'ok',
      character: {
        id: 'hero',
        name: 'Hero'
      }
    });

    const rule = await executeLookupRuleTool(
      { query: 'jet de des difficile' },
      {
        searchRules: async () => [
          {
            citation: 'docs/rules/01-resolution.md > D1',
            heading: 'D1',
            id: 'resolution',
            rank: 1,
            score: 0.95,
            sourceKind: 'rule_markdown',
            sourcePath: 'docs/rules/01-resolution.md',
            text: 'Les jets difficiles utilisent une reserve de D10.'
          }
        ]
      }
    );

    expect(rule).toMatchObject({
      citations: [{ citation: 'docs/rules/01-resolution.md > D1' }],
      status: 'ok'
    });
    if (rule.status !== 'ok') {
      throw new Error(rule.message);
    }
    expect(rule.context).toContain('reserve de D10');

    const bestiary = await executeLookupBestiaryTool({ name: 'Humain' });

    expect(bestiary).toMatchObject({
      creature: {
        id: 'humain',
        name: 'Humain, -e'
      },
      status: 'ok'
    });

    const npcDecision = await executeDecideNpcActionTool({
      combatState: state,
      enemyIds: ['hero'],
      npcId: 'bandit',
      profile: {
        archetype: 'aggressive',
        controller: 'auto'
      }
    });

    expect(npcDecision).toMatchObject({
      decision: {
        action: {
          targetId: 'hero',
          type: 'attack'
        },
        controller: 'auto'
      },
      status: 'ok'
    });
  });

  it('returns graceful rule errors instead of throwing opaque exceptions', async () => {
    await expect(
      executeApplyDamageTool({
        combatantId: 'missing',
        damage: 4,
        state: sampleCombatState()
      })
    ).resolves.toMatchObject({
      message: 'Unknown combatant: missing',
      status: 'error'
    });
  });
});

function sampleCombatState() {
  return addCombatant(
    addCombatant(createCombatState(1), combatant('hero', 'Hero', 1)),
    combatant('bandit', 'Bandit', 3)
  );
}

function combatant(id: string, name: string, nextActionAt: number): Combatant {
  return {
    attributes: {
      dexterity: 5,
      stamina: 5,
      strength: 5
    },
    id,
    name,
    nextActionAt,
    reflexes: 5,
    skills: {},
    speedFactor: 4,
    statuses: [],
    vitality: {
      current: 10,
      max: 10
    }
  };
}

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
