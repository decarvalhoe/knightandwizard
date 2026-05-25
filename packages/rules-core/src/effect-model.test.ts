import { describe, expect, it } from 'vitest';

import { evaluateValue, matchesCondition, parseEffectModel } from './effect-model.js';

describe('EffectModel parsing', () => {
  it('parses a valid data-driven effect model', () => {
    const raw = {
      source: {
        prose: "Cet atout diminue la difficulte d'un jet base sur l'intelligence de 5.",
        ref: 'lexique:916'
      },
      spec: {
        target: 'difficulty',
        scope: 'intelligence',
        op: 'sub',
        value: 5,
        condition: { action_type: 'intelligence_check' },
        activation: 'active',
        duration: 'ephemeral'
      },
      render: '{{source.prose}}',
      fidelity: 'covered',
      ambiguity_ref: null
    };

    expect(parseEffectModel(raw)).toEqual(raw);
  });

  it('parses expression and table values', () => {
    const expressionEffect = parseEffectModel({
      source: { prose: 'Ajoute le niveau aux des.', ref: 'lexique:118' },
      spec: {
        target: 'pool',
        scope: 'classe',
        op: 'add',
        value: 'level * 2',
        activation: 'passive',
        duration: 'permanent'
      },
      fidelity: 'covered'
    });
    const tableEffect = parseEffectModel({
      source: { prose: 'Bonus par palier de niveau.', ref: 'fixture:table' },
      spec: {
        target: 'energy',
        op: 'add',
        value: { table: 'energy_by_level', key: 'level' },
        activation: 'triggered',
        duration: { dt: 12 }
      },
      fidelity: 'pending'
    });

    expect(expressionEffect.spec.value).toBe('level * 2');
    expect(tableEffect.spec.value).toEqual({ table: 'energy_by_level', key: 'level' });
  });

  it('rejects unknown operations', () => {
    expect(() =>
      parseEffectModel({
        source: { prose: 'Invalid op.', ref: 'fixture:op' },
        spec: {
          target: 'pool',
          op: 'divide',
          value: 1,
          activation: 'passive',
          duration: 'permanent'
        },
        fidelity: 'pending'
      })
    ).toThrow(/Unknown effect operation "divide"/);
  });

  it('rejects unknown variables in values', () => {
    expect(() =>
      parseEffectModel({
        source: { prose: 'Invalid variable.', ref: 'fixture:value' },
        spec: {
          target: 'pool',
          op: 'add',
          value: 'wisdom + 1',
          activation: 'passive',
          duration: 'permanent'
        },
        fidelity: 'pending'
      })
    ).toThrow(/Unknown effect value variable "wisdom"/);
  });

  it('rejects malformed values', () => {
    expect(() =>
      parseEffectModel({
        source: { prose: 'Malformed expression.', ref: 'fixture:value' },
        spec: {
          target: 'pool',
          op: 'add',
          value: 'level ** 2',
          activation: 'passive',
          duration: 'permanent'
        },
        fidelity: 'pending'
      })
    ).toThrow(/Malformed effect value expression/);
  });

  it('rejects unknown condition keys', () => {
    expect(() =>
      parseEffectModel({
        source: { prose: 'Invalid condition.', ref: 'fixture:condition' },
        spec: {
          target: 'pool',
          op: 'add',
          value: 1,
          condition: { terrain: 'forest' },
          activation: 'passive',
          duration: 'permanent'
        },
        fidelity: 'pending'
      })
    ).toThrow(/Unknown effect condition key "terrain"/);
  });
});

describe('evaluateValue', () => {
  const context = {
    level: 4,
    force: 3,
    dexterity: 2,
    stamina: 5,
    reflexes: 1,
    perception: 2,
    intelligence: 6,
    charisma: 2,
    empathy: 1,
    aestheticism: 0,
    vitalityMax: 24,
    energyMax: 60,
    tables: {
      energy_by_level: {
        '4': 12
      }
    }
  };

  it('evaluates integer literals', () => {
    expect(evaluateValue(7, context)).toBe(7);
  });

  it('evaluates whitelisted variables', () => {
    expect(evaluateValue('level', context)).toBe(4);
  });

  it('evaluates simple arithmetic expressions safely', () => {
    expect(evaluateValue('level * 2', context)).toBe(8);
  });

  it('evaluates table lookups by whitelisted key variable', () => {
    expect(evaluateValue({ table: 'energy_by_level', key: 'level' }, context)).toBe(12);
  });
});

describe('matchesCondition', () => {
  const context = {
    context: 'combat',
    env: 'darkness',
    action_type: 'attack',
    target_tag: ['undead', 'armored'],
    weapon: 'sword',
    school: 'abjuration',
    self_state: 'wounded'
  };

  it('matches all_of conditions', () => {
    expect(
      matchesCondition(
        {
          all_of: [{ context: 'combat' }, { env: 'darkness' }, { target_tag: 'undead' }]
        },
        context
      )
    ).toBe(true);

    expect(
      matchesCondition(
        {
          all_of: [{ context: 'travel' }, { env: 'darkness' }]
        },
        context
      )
    ).toBe(false);
  });

  it('matches any_of conditions', () => {
    expect(
      matchesCondition(
        {
          any_of: [{ school: 'necromancy' }, { target_tag: 'undead' }]
        },
        context
      )
    ).toBe(true);

    expect(
      matchesCondition(
        {
          any_of: [{ school: 'necromancy' }, { weapon: 'bow' }]
        },
        context
      )
    ).toBe(false);
  });
});
