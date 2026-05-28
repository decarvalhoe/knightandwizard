import { describe, expect, it } from 'vitest';

import { evaluateValue, matchesCondition, parseEffectModel } from './effect-model.js';
import type {
  EffectCondition,
  EffectConditionContext,
  EffectConditionValue
} from './effect-model.js';

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

  it('parses damage targets and activity governance fields', () => {
    const raw = {
      source: { prose: 'Inflige des degats supplementaires.', ref: 'fixture:damage' },
      spec: {
        target: 'damage',
        op: 'add',
        value: 2,
        condition: { action_type: 'weapon_damage' },
        activation: 'active',
        duration: 'ephemeral',
        requires_mj_validation: true,
        uses_per_day: 1
      },
      fidelity: 'covered'
    };

    expect(parseEffectModel(raw)).toEqual(raw);
  });

  it('accepts activity condition keys in parsed models and condition matching', () => {
    const cases = [
      ['competence', 'danse', 'forge'],
      ['spec', 'alchimie_mutagenes', 'pistage'],
      ['aptitude', ['perception', 'willpower'], 'force'],
      ['target_disposition', 'ally', 'enemy'],
      ['target_ref', 'employeur', 'inconnu'],
      ['tool', 'luth', 'flute'],
      ['intent', 'sauvegarder', 'nuire'],
      ['directness', 'direct_only', 'indirect']
    ] as const satisfies readonly (readonly [string, EffectConditionValue, EffectConditionValue])[];

    for (const [key, matching, nonMatching] of cases) {
      const condition = { [key]: matching };

      const model = parseEffectModel({
        source: { prose: `Condition ${key}.`, ref: `fixture:condition:${key}` },
        spec: {
          target: 'pool',
          op: 'add',
          value: 1,
          condition,
          activation: 'passive',
          duration: 'permanent'
        },
        fidelity: 'pending'
      });

      expect(model.spec.condition).toEqual(condition);
      expect(
        matchesCondition(
          condition as EffectCondition,
          { [key]: matching } as EffectConditionContext
        )
      ).toBe(true);
      expect(
        matchesCondition(
          condition as EffectCondition,
          {
            [key]: nonMatching
          } as EffectConditionContext
        )
      ).toBe(false);
    }
  });

  it('defaults optional activity governance fields by absence', () => {
    const model = parseEffectModel({
      source: { prose: 'No governance field.', ref: 'fixture:governance:absent' },
      spec: {
        target: 'pool',
        op: 'add',
        value: 1,
        activation: 'passive',
        duration: 'permanent'
      },
      fidelity: 'covered'
    });

    expect(model.spec.requires_mj_validation).toBeUndefined();
    expect(model.spec.uses_per_day).toBeUndefined();
  });

  it('rejects non-boolean activity governance validation flags', () => {
    expect(() =>
      parseEffectModel({
        source: { prose: 'Invalid MJ validation flag.', ref: 'fixture:governance:boolean' },
        spec: {
          target: 'pool',
          op: 'add',
          value: 1,
          activation: 'passive',
          duration: 'permanent',
          requires_mj_validation: 'yes'
        },
        fidelity: 'pending'
      })
    ).toThrow(/EffectModel\.spec\.requires_mj_validation must be a boolean/);
  });

  it('rejects non-positive or non-integer uses per day limits', () => {
    for (const uses_per_day of [0, -1, 1.5, '1']) {
      expect(() =>
        parseEffectModel({
          source: { prose: 'Invalid uses per day.', ref: 'fixture:uses-per-day' },
          spec: {
            target: 'pool',
            op: 'add',
            value: 1,
            activation: 'active',
            duration: 'ephemeral',
            uses_per_day
          },
          fidelity: 'pending'
        })
      ).toThrow(/EffectModel\.spec\.uses_per_day must be a positive integer/);
    }
  });

  it('parses expression-based locked durations', () => {
    const raw = {
      source: { prose: 'Duree verrouillee par niveau.', ref: 'fixture:duration:locked' },
      spec: {
        target: 'status',
        scope: 'fou_furieux',
        op: 'grant',
        value: 1,
        activation: 'active',
        duration: { dt: '25*level', locked: true }
      },
      fidelity: 'covered'
    };

    expect(parseEffectModel(raw)).toEqual(raw);
  });

  it('rejects invalid locked duration fields', () => {
    expect(() =>
      parseEffectModel({
        source: { prose: 'Invalid duration expression.', ref: 'fixture:duration:expression' },
        spec: {
          target: 'status',
          scope: 'fou_furieux',
          op: 'grant',
          value: 1,
          activation: 'active',
          duration: { dt: '25*unknown' }
        },
        fidelity: 'pending'
      })
    ).toThrow(/Unknown effect value variable "unknown"/);

    expect(() =>
      parseEffectModel({
        source: { prose: 'Invalid duration lock.', ref: 'fixture:duration:lock' },
        spec: {
          target: 'status',
          scope: 'fou_furieux',
          op: 'grant',
          value: 1,
          activation: 'active',
          duration: { dt: 25, locked: 'yes' }
        },
        fidelity: 'pending'
      })
    ).toThrow(/Effect duration locked must be a boolean/);
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

  it('evaluates the successes variable (effet mis a l’echelle par reussite, R-8.x)', () => {
    expect(evaluateValue('successes', { successes: 3 })).toBe(3);
    expect(evaluateValue('successes * 2', { successes: 3 })).toBe(6);
    expect(evaluateValue('level + successes', { level: 4, successes: 2 })).toBe(6);
  });

  it('throws when successes is required but absent from the context', () => {
    expect(() => evaluateValue('successes', context)).toThrow(
      /Missing effect value variable "successes"/
    );
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

describe('EffectModel narrative duration (R-8.20, systeme de temps double)', () => {
  const withDuration = (duration: unknown) => ({
    source: { prose: 'Effet dont la duree narrative depend du niveau.', ref: 'lexique:0' },
    spec: {
      target: 'vitality',
      op: 'add',
      value: 1,
      activation: 'active',
      duration
    },
    fidelity: 'pending'
  });

  it('parses a numeric narrative duration', () => {
    const model = parseEffectModel(withDuration({ amount: 30, unit: 'minute' }));
    expect(model.spec.duration).toEqual({ amount: 30, unit: 'minute' });
  });

  it('parses a narrative duration whose amount is a value expression', () => {
    const model = parseEffectModel(withDuration({ amount: 'level * 10', unit: 'hour' }));
    expect(model.spec.duration).toEqual({ amount: 'level * 10', unit: 'hour' });
  });

  it('accepts each whitelisted narrative unit', () => {
    for (const unit of ['minute', 'hour', 'day'] as const) {
      expect(() => parseEffectModel(withDuration({ amount: 1, unit }))).not.toThrow();
    }
  });

  it('rejects an unknown narrative unit', () => {
    expect(() => parseEffectModel(withDuration({ amount: 1, unit: 'week' }))).toThrow(
      /effect duration unit/
    );
  });

  it('rejects a non-positive numeric amount', () => {
    expect(() => parseEffectModel(withDuration({ amount: 0, unit: 'minute' }))).toThrow(
      /Effect duration amount/
    );
  });

  it('rejects an unknown key inside a narrative duration', () => {
    expect(() => parseEffectModel(withDuration({ amount: 1, unit: 'day', locked: true }))).toThrow(
      /effect duration/
    );
  });
});

describe('EffectModel protection target (E2f, buff/débuff d’armure)', () => {
  const protectionModel = (scope: string) => ({
    source: { prose: 'Bouclier de protection.', ref: 'spells:bouclier' },
    spec: {
      target: 'protection',
      scope,
      op: 'add',
      value: 'successes',
      activation: 'active',
      duration: 'ephemeral'
    },
    fidelity: 'pending'
  });

  it('parses a protection-target effect (scope = type protégé)', () => {
    const model = parseEffectModel(protectionModel('all'));
    expect(model.spec.target).toBe('protection');
    expect(model.spec.scope).toBe('all');
  });

  it('accepts an elemental protection scope', () => {
    expect(() => parseEffectModel(protectionModel('feu'))).not.toThrow();
  });
});
