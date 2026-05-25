import { describe, expect, it } from 'vitest';

import { parseEffectModel, type EffectModel, type EffectSpec } from './effect-model.js';
import { computeEffectiveModifiers, effectiveAttribute } from './effects.js';

describe('effect modifier engine', () => {
  it('accumulates active additive modifiers by target and scope', () => {
    const effects = [
      effect({ target: 'aptitude', scope: 'strength', op: 'add', value: 2 }),
      effect({
        target: 'aptitude',
        scope: 'strength',
        op: 'add',
        value: 'level',
        activation: 'active'
      }),
      effect({
        target: 'aptitude',
        scope: 'dexterity',
        op: 'add',
        value: 4
      })
    ];

    const modifiers = computeEffectiveModifiers(effects, { activations: ['active'], level: 3 });

    expect(modifiers.aptitude.strength).toMatchObject({
      target: 'aptitude',
      scope: 'strength',
      add: 5,
      sub: 0,
      multiply: 1,
      additive: 5
    });
    expect(modifiers.aptitude.dexterity.add).toBe(4);
  });

  it('ignores effects whose condition, activation, or duration is inactive', () => {
    const effects = [
      effect({
        target: 'difficulty',
        scope: 'attack',
        op: 'sub',
        value: 1,
        condition: { action_type: 'attack' }
      }),
      effect({
        target: 'difficulty',
        scope: 'attack',
        op: 'sub',
        value: 10,
        condition: { action_type: 'defense' }
      }),
      effect({
        target: 'difficulty',
        scope: 'attack',
        op: 'sub',
        value: 10,
        activation: 'triggered'
      }),
      effect({
        target: 'difficulty',
        scope: 'attack',
        op: 'sub',
        value: 10,
        duration: { dt: 2 }
      })
    ];

    const modifiers = computeEffectiveModifiers(effects, {
      action_type: 'attack',
      activations: ['active'],
      elapsedDT: 2
    });

    expect(modifiers.difficulty.attack.sub).toBe(1);
    expect(modifiers.difficulty.attack.additive).toBe(-1);
    expect(modifiers.difficulty.attack.applications).toHaveLength(1);
  });

  it('applies set and multiply operations when resolving an effective aptitude', () => {
    const effects = [
      effect({ target: 'aptitude', scope: 'strength', op: 'set', value: 4 }),
      effect({ target: 'aptitude', scope: 'strength', op: 'add', value: 1 }),
      effect({ target: 'aptitude', scope: 'strength', op: 'multiply', value: 2 })
    ];

    expect(effectiveAttribute(3, 'strength', effects, {})).toBe(10);
  });

  it('floors effective aptitudes at zero', () => {
    const effects = [effect({ target: 'aptitude', scope: 'aestheticism', op: 'sub', value: 5 })];

    expect(effectiveAttribute(1, 'aestheticism', effects, {})).toBe(0);
  });

  it('recognizes status targets without resolving a status catalog', () => {
    const effects = [
      effect({ target: 'status', scope: 'stunned', op: 'grant', value: 0, activation: 'active' })
    ];

    const modifiers = computeEffectiveModifiers(effects, { activations: ['active'] });

    expect(modifiers.status.stunned).toMatchObject({
      target: 'status',
      scope: 'stunned',
      applications: [{ op: 'grant', sourceRef: 'fixture:effect' }]
    });
  });

  it('matches predilection slot tool conditions against the engaged tool', () => {
    const effects = [
      effect({
        target: 'pool',
        scope: 'attaque',
        op: 'add',
        value: 1,
        condition: { tool: 'arme_predilection' }
      })
    ];

    const modifiers = computeEffectiveModifiers(effects, {
      engagedTool: 'epee_longue',
      predilection: { arme: ['epee_longue'] }
    });

    expect(modifiers.pool.attaque.add).toBe(1);
  });

  it('does not match predilection slot tool conditions outside the slot set', () => {
    const effects = [
      effect({
        target: 'pool',
        scope: 'attaque',
        op: 'add',
        value: 1,
        condition: { tool: 'arme_predilection' }
      })
    ];

    const modifiers = computeEffectiveModifiers(effects, {
      engagedTool: 'arc_court',
      predilection: { arme: ['epee_longue'] }
    });

    expect(modifiers.pool).toEqual({});
  });

  it('matches concrete tool conditions by engaged tool equality', () => {
    const effects = [
      effect({
        target: 'pool',
        scope: 'musique',
        op: 'add',
        value: 1,
        condition: { tool: 'luth' }
      })
    ];

    const modifiers = computeEffectiveModifiers(effects, {
      engagedTool: 'luth',
      predilection: { instrument: ['flute'] }
    });

    expect(modifiers.pool.musique.add).toBe(1);
  });
});

function effect(
  spec: Partial<EffectSpec> & Pick<EffectSpec, 'target' | 'op' | 'value'>
): EffectModel {
  return parseEffectModel({
    source: { prose: 'Fixture effect.', ref: 'fixture:effect' },
    spec: {
      activation: 'passive',
      duration: 'permanent',
      ...spec
    },
    fidelity: 'covered'
  });
}
