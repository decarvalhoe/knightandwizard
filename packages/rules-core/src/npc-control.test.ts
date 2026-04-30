import { addCombatant, createCombatState, type Combatant } from './combat.js';
import { describe, expect, it } from 'vitest';
import {
  decideNpcAction,
  requestNpcControlHandoff,
  type NpcControlProfile
} from './npc-control.js';

describe('NPC control modes', () => {
  it('selects deterministic auto actions from archetype and combat state', () => {
    const state = sampleCombatState();
    const aggressive = decideNpcAction({
      combatState: state,
      enemyIds: ['hero', 'mage'],
      npcId: 'goblin',
      profile: {
        archetype: 'aggressive',
        controller: 'auto'
      }
    });

    expect(aggressive).toMatchObject({
      action: {
        targetId: 'mage',
        type: 'attack'
      },
      controller: 'auto',
      requiresHumanDecision: false,
      requiresLlmDecision: false
    });

    const coward = decideNpcAction({
      combatState: withVitality(state, 'goblin', 2),
      enemyIds: ['hero', 'mage'],
      npcId: 'goblin',
      profile: {
        archetype: 'coward',
        controller: 'auto'
      }
    });

    expect(coward).toMatchObject({
      action: {
        type: 'move'
      },
      reason: expect.stringContaining('fuir')
    });
  });

  it('delegates LLM control without inventing a deterministic action', () => {
    const decision = decideNpcAction({
      combatState: sampleCombatState(),
      enemyIds: ['hero'],
      npcId: 'goblin',
      profile: {
        archetype: 'cautious',
        controller: 'llm',
        personality: {
          motivations: ['proteger le pont'],
          speechStyle: 'terse'
        }
      }
    });

    expect(decision.action).toBeUndefined();
    expect(decision).toMatchObject({
      controller: 'llm',
      requiresHumanDecision: false,
      requiresLlmDecision: true
    });
    expect(decision.promptContext).toContain('proteger le pont');
  });

  it('queues human/player control decisions and records handoff history', () => {
    const profile: NpcControlProfile = {
      archetype: 'defensive',
      controller: 'human_gm',
      npcId: 'goblin'
    };
    const decision = decideNpcAction({
      combatState: sampleCombatState(),
      enemyIds: ['hero'],
      npcId: 'goblin',
      profile
    });

    expect(decision).toMatchObject({
      controller: 'human_gm',
      queuedDecision: {
        assignedTo: 'human_gm',
        title: 'Decision PNJ: Goblin'
      },
      requiresHumanDecision: true
    });

    const handoff = requestNpcControlHandoff(profile, {
      reason: 'Le MJ reprend la main pour une scene importante.',
      requestedBy: 'llm',
      targetController: 'human_gm'
    });

    expect(handoff.controller).toBe('human_gm');
    expect(handoff.handoffHistory).toEqual([
      expect.objectContaining({
        from: 'human_gm',
        reason: 'Le MJ reprend la main pour une scene importante.',
        requestedBy: 'llm',
        to: 'human_gm'
      })
    ]);
  });
});

function sampleCombatState() {
  return addCombatant(
    addCombatant(
      addCombatant(createCombatState(1), combatant('goblin', 'Goblin', 1, 10, 10)),
      combatant('hero', 'Hero', 3, 10, 10)
    ),
    combatant('mage', 'Mage', 4, 3, 10)
  );
}

function combatant(
  id: string,
  name: string,
  nextActionAt: number,
  vitality: number,
  maxVitality: number
): Combatant {
  return {
    attributes: {
      dexterity: 4,
      stamina: 4,
      strength: 4
    },
    id,
    name,
    nextActionAt,
    reflexes: 4,
    skills: {},
    speedFactor: 5,
    statuses: [],
    vitality: {
      current: vitality,
      max: maxVitality
    }
  };
}

function withVitality(state: ReturnType<typeof sampleCombatState>, id: string, current: number) {
  return {
    ...state,
    timeline: state.timeline.map((combatant) =>
      combatant.id === id
        ? {
            ...combatant,
            vitality: {
              ...combatant.vitality,
              current
            }
          }
        : combatant
    )
  };
}
