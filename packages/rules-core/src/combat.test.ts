import { describe, expect, it } from 'vitest';

import {
  addCombatant,
  applyDamage,
  applyStatus,
  createCombatState,
  declareSpellCast,
  effectiveSpeedFactor,
  getCyclicDT,
  interruptCombatant,
  resolveNextAction,
  resolveStaminaDamage,
  summarizeEncumbrance,
  type AttackAction,
  type Combatant,
  type SpellAction
} from './combat.js';
import { parseEffectModel, type EffectModel } from './effect-model.js';

describe('combat DT timeline', () => {
  it('wraps the legacy 1-50 DT counter', () => {
    expect(getCyclicDT(50, '+')).toBe(1);
    expect(getCyclicDT(1, '-')).toBe(50);
    expect(getCyclicDT(12, '+')).toBe(13);
    expect(getCyclicDT(12, '')).toBe(12);
  });

  it('schedules combatants by speed factor and sorts by next action DT', () => {
    const state = createCombatState(1);
    const withSlow = addCombatant(state, combatant({ id: 'slow', speedFactor: 8, reflexes: 2 }));
    const withFast = addCombatant(withSlow, combatant({ id: 'fast', speedFactor: 5, reflexes: 3 }));

    expect(withFast.timeline.map((entry) => [entry.id, entry.nextActionAt])).toEqual([
      ['fast', 6],
      ['slow', 9]
    ]);
  });

  it('uses reflexes as the deterministic tie-breaker for same-DT actions', () => {
    const state = createCombatState(1);
    const left = combatant({ id: 'left', speedFactor: 5, reflexes: 2 });
    const right = combatant({ id: 'right', speedFactor: 5, reflexes: 6 });

    const result = addCombatant(addCombatant(state, left), right);

    expect(result.timeline.map((entry) => entry.id)).toEqual(['right', 'left']);
  });

  it('uses combatant id as the final deterministic tie-breaker', () => {
    const state = createCombatState(1);
    const result = addCombatant(
      addCombatant(state, combatant({ id: 'beta', speedFactor: 5, reflexes: 3 })),
      combatant({ id: 'alpha', speedFactor: 5, reflexes: 3 })
    );

    expect(result.timeline.map((entry) => entry.id)).toEqual(['alpha', 'beta']);
  });

  it('rejects invalid or empty timeline operations', () => {
    expect(() => createCombatState(0)).toThrow('currentDT must be a positive integer');
    expect(() => resolveNextAction(createCombatState(1))).toThrow(
      'Cannot resolve combat action without combatants'
    );
  });

  it('resolves the next action and reschedules the actor by action cost', () => {
    const state = addCombatant(
      createCombatState(1),
      combatant({
        id: 'actor',
        speedFactor: 5,
        pendingAction: { type: 'move', costDT: 3 }
      })
    );

    const result = resolveNextAction(state);

    expect(result.currentDT).toBe(6);
    expect(result.round).toBe(1);
    expect(result.timeline[0].nextActionAt).toBe(9);
    expect(result.timeline[0].pendingAction).toBeUndefined();
    expect(result.log.at(-1)).toMatchObject({
      type: 'action_resolved',
      actorId: 'actor',
      actionType: 'move',
      atDT: 6,
      costDT: 3,
      nextActionAt: 9
    });
  });
});

describe('combat vitality and statuses', () => {
  it('applies legacy vitality malus below half vitality and delays the next action', () => {
    const state = addCombatant(createCombatState(1), combatant({ id: 'target', nextActionAt: 12 }));

    const damaged = applyDamage(state, 'target', 4);
    const target = damaged.timeline[0];

    expect(target.vitality.current).toBe(6);
    expect(target.nextActionAt).toBe(16);
    expect(target.attributes.strength).toBe(5);

    const severelyDamaged = applyDamage(damaged, 'target', 3).timeline[0];

    expect(severelyDamaged.vitality.current).toBe(3);
    expect(severelyDamaged.attributes.strength).toBe(3);
    expect(severelyDamaged.attributes.dexterity).toBe(3);
    expect(severelyDamaged.attributes.stamina).toBe(3);
  });

  it('restores derived physical attributes when vitality comes back over the malus threshold', () => {
    const state = addCombatant(createCombatState(1), combatant({ id: 'target' }));
    const damaged = applyDamage(state, 'target', 7);
    const healed = applyDamage(damaged, 'target', -4).timeline[0];

    expect(healed.vitality.current).toBe(7);
    expect(healed.attributes.strength).toBe(5);
    expect(healed.attributes.dexterity).toBe(5);
    expect(healed.attributes.stamina).toBe(5);
  });

  it('supports until-death combatants that ignore vitality malus before 0 vitality', () => {
    const state = addCombatant(
      createCombatState(1),
      combatant({ id: 'skeleton', ignoresVitalityMalus: true })
    );

    const damaged = applyDamage(state, 'skeleton', 7).timeline[0];

    expect(damaged.vitality.current).toBe(3);
    expect(damaged.attributes.strength).toBe(5);
    expect(damaged.statuses).toEqual([]);
  });

  it('marks a combatant dead at zero vitality', () => {
    const state = addCombatant(createCombatState(1), combatant({ id: 'target' }));
    const damaged = applyDamage(state, 'target', 10).timeline[0];

    expect(damaged.vitality.current).toBe(0);
    expect(damaged.statuses).toContainEqual({ id: 'dead', appliedAtDT: 1 });
  });

  it('rejects damage for an unknown combatant', () => {
    expect(() => applyDamage(createCombatState(1), 'missing', 1)).toThrow(
      'Unknown combatant: missing'
    );
  });

  it('adds explicit tactical statuses without duplicating them', () => {
    const state = addCombatant(createCombatState(4), combatant({ id: 'target' }));
    const stunned = applyStatus(
      applyStatus(state, 'target', { id: 'stunned', durationDT: 5 }),
      'target',
      {
        id: 'stunned',
        durationDT: 5
      }
    ).timeline[0];

    expect(stunned.statuses).toEqual([{ id: 'stunned', durationDT: 5, appliedAtDT: 4 }]);
  });

  it('resolves the legacy endurance roll before applying damage', () => {
    const state = addCombatant(
      createCombatState(3),
      combatant({
        id: 'target',
        nextActionAt: 12,
        attributes: { stamina: 3 },
        baseAttributes: { stamina: 3 }
      })
    );

    const result = resolveStaminaDamage(state, 'target', 5, {
      randomInteger: scriptedRolls([7, 8, 2])
    });
    const target = result.timeline[0];

    expect(target.vitality.current).toBe(7);
    expect(target.nextActionAt).toBe(15);
    expect(result.log.at(-1)).toMatchObject({
      type: 'stamina_roll_resolved',
      actorId: 'target',
      damage: 5,
      preventedDamage: 2,
      finalDamage: 3
    });
  });
});

describe('combat action resolution', () => {
  it('resolves attack and defense rolls through the dice engine', () => {
    const attacker = combatant({
      id: 'attacker',
      speedFactor: 5,
      pendingAction: {
        type: 'attack',
        targetId: 'defender',
        attack: { pool: 3, difficulty: 7 },
        defense: { pool: 2, difficulty: 7 }
      }
    });
    const defender = combatant({ id: 'defender', speedFactor: 8 });
    const state = addCombatant(addCombatant(createCombatState(1), defender), attacker);

    const result = resolveNextAction(state, { randomInteger: scriptedRolls([7, 8, 2, 7, 2]) });

    expect(result.log.at(-1)).toMatchObject({
      type: 'attack_resolved',
      actorId: 'attacker',
      targetId: 'defender',
      atDT: 6,
      successes: 1
    });
  });

  it('keeps critical attack failure severity in the combat log without applying damage', () => {
    const attacker = combatant({
      id: 'attacker',
      speedFactor: 5,
      pendingAction: {
        type: 'attack',
        targetId: 'defender',
        attack: { pool: 3, difficulty: 7 },
        damageOnHit: 4
      }
    });
    const defender = combatant({ id: 'defender', speedFactor: 8 });
    const state = addCombatant(addCombatant(createCombatState(1), defender), attacker);

    const result = resolveNextAction(state, { randomInteger: scriptedRolls([1, 1, 7, 73]) });
    const attackEvent = result.log.at(-1);
    const target = result.timeline.find((entry) => entry.id === 'defender');

    expect(attackEvent).toMatchObject({
      type: 'attack_resolved',
      actorId: 'attacker',
      targetId: 'defender',
      atDT: 6,
      costDT: 5,
      nextActionAt: 11,
      successes: 0,
      attackRoll: { isCriticalFailure: true, criticalFailureSeverity: 73 }
    });
    expect(target?.vitality.current).toBe(10);
  });

  it('can apply declared damage on a successful attack', () => {
    const attacker = combatant({
      id: 'attacker',
      speedFactor: 5,
      pendingAction: {
        type: 'attack',
        targetId: 'defender',
        attack: { pool: 2, difficulty: 7 },
        damageOnHit: 3
      }
    });
    const defender = combatant({ id: 'defender', speedFactor: 8 });
    const state = addCombatant(addCombatant(createCombatState(1), defender), attacker);

    const result = resolveNextAction(state, { randomInteger: scriptedRolls([7, 8]) });
    const target = result.timeline.find((entry) => entry.id === 'defender');

    expect(target?.vitality.current).toBe(7);
    expect(target?.nextActionAt).toBe(12);
  });

  it('computes F+N weapon damage from net touche successes and applies it', () => {
    const attacker = combatant({
      id: 'attacker',
      speedFactor: 5,
      pendingAction: {
        type: 'attack',
        targetId: 'defender',
        attack: { pool: 2, difficulty: 7 },
        damage: {
          attackerForce: 4,
          weaponDamage: {
            components: [{ type: 'C', includesForce: true, flat: 3 }]
          }
        }
      }
    });
    const defender = combatant({ id: 'defender', speedFactor: 8 });
    const state = addCombatant(addCombatant(createCombatState(1), defender), attacker);

    const result = resolveNextAction(state, {
      randomInteger: scriptedRolls([7, 8, 5, 6, 4, 2])
    });
    const target = result.timeline.find((entry) => entry.id === 'defender');
    const attackEvent = result.log.find((event) => event.type === 'attack_resolved');

    expect(target?.vitality.current).toBe(5);
    expect(target?.nextActionAt).toBe(14);
    expect(attackEvent).toMatchObject({
      type: 'attack_resolved',
      successes: 2,
      damageBreakdown: {
        finalDamage: 5,
        components: [
          expect.objectContaining({
            type: 'C',
            forceSuccesses: 2,
            raw: 5,
            final: 5
          })
        ],
        log: expect.arrayContaining([
          expect.objectContaining({
            step: 'force_roll',
            difficulty: 5,
            successes: 2
          })
        ])
      }
    });
    expect(result.log.at(-1)).toMatchObject({
      type: 'damage_applied',
      targetId: 'defender',
      damage: 5,
      finalDamage: 5
    });
  });

  it('uses defended net touche successes to raise damage difficulty and reduce damage', () => {
    const withoutDefense = resolveNextAction(
      attackState({
        attack: { pool: 3, difficulty: 7 },
        damage: {
          attackerForce: 3,
          weaponDamage: {
            components: [{ type: 'T', includesForce: true }]
          }
        }
      }),
      { randomInteger: scriptedRolls([7, 8, 9, 4, 4, 5]) }
    );
    const withDefense = resolveNextAction(
      attackState({
        attack: { pool: 3, difficulty: 7 },
        defense: { pool: 2, difficulty: 7 },
        damage: {
          attackerForce: 3,
          weaponDamage: {
            components: [{ type: 'T', includesForce: true }]
          }
        }
      }),
      { randomInteger: scriptedRolls([7, 8, 9, 7, 2, 4, 4, 5]) }
    );
    const undefendedAttack = withoutDefense.log.find((event) => event.type === 'attack_resolved');
    const defendedAttack = withDefense.log.find((event) => event.type === 'attack_resolved');

    expect(undefendedAttack).toMatchObject({
      successes: 3,
      damageBreakdown: {
        finalDamage: 3,
        log: expect.arrayContaining([
          expect.objectContaining({ step: 'force_roll', difficulty: 4, successes: 3 })
        ])
      }
    });
    expect(defendedAttack).toMatchObject({
      successes: 2,
      damageBreakdown: {
        finalDamage: 1,
        log: expect.arrayContaining([
          expect.objectContaining({ step: 'force_roll', difficulty: 5, successes: 1 })
        ])
      }
    });
  });

  it('applies x2 zone damage from the structured damage path', () => {
    const result = resolveNextAction(
      attackState({
        attack: { pool: 1, difficulty: 7 },
        damage: {
          attackerForce: 0,
          weaponDamage: {
            components: [{ type: 'P', includesForce: false, flat: 4 }]
          },
          zone: { id: 'tete', damageMultiplier: 2, allowsEndurance: true }
        }
      }),
      { randomInteger: scriptedRolls([7]) }
    );
    const target = result.timeline.find((entry) => entry.id === 'defender');
    const attackEvent = result.log.find((event) => event.type === 'attack_resolved');

    expect(target?.vitality.current).toBe(2);
    expect(attackEvent).toMatchObject({
      damageBreakdown: {
        finalDamage: 8,
        components: [
          expect.objectContaining({
            zoneMultiplier: 2,
            final: 8
          })
        ]
      }
    });
  });

  it('keeps legacy damageOnHit behavior when structured damage is absent', () => {
    const result = resolveNextAction(
      attackState({
        attack: { pool: 2, difficulty: 7 },
        damageOnHit: 3
      }),
      { randomInteger: scriptedRolls([7, 8]) }
    );
    const target = result.timeline.find((entry) => entry.id === 'defender');
    const attackEvent = result.log.find((event) => event.type === 'attack_resolved');

    expect(target?.vitality.current).toBe(7);
    expect(target?.nextActionAt).toBe(12);
    expect(attackEvent).not.toHaveProperty('damageBreakdown');
    expect(result.log.at(-1)).toMatchObject({
      type: 'damage_applied',
      targetId: 'defender',
      damage: 3,
      finalDamage: 3
    });
  });
});

function attackState(pendingAction: Omit<AttackAction, 'type' | 'targetId'>) {
  const attacker = combatant({
    id: 'attacker',
    speedFactor: 5,
    pendingAction: {
      type: 'attack',
      targetId: 'defender',
      ...pendingAction
    }
  });
  const defender = combatant({ id: 'defender', speedFactor: 8 });

  return addCombatant(addCombatant(createCombatState(1), defender), attacker);
}

function combatant(overrides: Partial<ReturnType<typeof baseCombatant>> = {}) {
  return {
    ...baseCombatant(),
    ...overrides,
    attributes: {
      ...baseCombatant().attributes,
      ...overrides.attributes
    },
    baseAttributes: overrides.baseAttributes
      ? { ...baseCombatant().baseAttributes, ...overrides.baseAttributes }
      : undefined,
    vitality: {
      ...baseCombatant().vitality,
      ...overrides.vitality
    }
  };
}

function baseCombatant() {
  return {
    id: 'combatant',
    name: 'Combatant',
    speedFactor: 5,
    nextActionAt: 0,
    reflexes: 3,
    vitality: { current: 10, max: 10 },
    attributes: { strength: 5, dexterity: 5, stamina: 5 },
    baseAttributes: undefined,
    skills: {},
    statuses: []
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

describe('combat interruptions (R-9.4)', () => {
  it('releases an interrupted actor at the current DT and loses the elapsed DT', () => {
    const base = addCombatant(
      createCombatState(1),
      combatant({ id: 'archer', speedFactor: 7, reflexes: 3 })
    );
    const inProgress = {
      ...base,
      currentDT: 4,
      timeline: base.timeline.map((entry) =>
        entry.id === 'archer' ? { ...entry, pendingAction: { type: 'aim' as const } } : entry
      )
    };

    const result = interruptCombatant(inProgress, 'archer', 'release');
    const archer = result.timeline.find((entry) => entry.id === 'archer');

    expect(archer?.nextActionAt).toBe(4);
    expect(archer?.pendingAction).toBeUndefined();
    const event = result.log.at(-1);
    expect(event?.type).toBe('action_interrupted');
    expect(event?.costDT).toBe(3);
  });

  it('restarts the same action paying the full speed factor again', () => {
    const base = addCombatant(
      createCombatState(1),
      combatant({ id: 'archer', speedFactor: 7, reflexes: 3 })
    );
    const inProgress = {
      ...base,
      currentDT: 4,
      timeline: base.timeline.map((entry) =>
        entry.id === 'archer' ? { ...entry, pendingAction: { type: 'aim' as const } } : entry
      )
    };

    const result = interruptCombatant(inProgress, 'archer', 'restart');
    const archer = result.timeline.find((entry) => entry.id === 'archer');

    expect(archer?.nextActionAt).toBe(11);
    expect(archer?.pendingAction).toEqual({ type: 'aim' });
  });
});

describe('effective speed factor (R-2.18 encumbrance / R-1.38 effects)', () => {
  it('adds no penalty at or below the carrying capacity (Force x 5 kg)', () => {
    expect(effectiveSpeedFactor(loaded({ speedFactor: 5, strength: 3, carriedWeightKg: 15 }))).toBe(
      5
    );
  });

  it('adds +1 speed factor per full 5 kg above the capacity', () => {
    // Force 3 -> capacity 15 kg.
    expect(
      effectiveSpeedFactor(loaded({ speedFactor: 5, strength: 3, carriedWeightKg: 15.1 }))
    ).toBe(6);
    expect(effectiveSpeedFactor(loaded({ speedFactor: 5, strength: 3, carriedWeightKg: 20 }))).toBe(
      6
    );
    expect(
      effectiveSpeedFactor(loaded({ speedFactor: 5, strength: 3, carriedWeightKg: 20.1 }))
    ).toBe(7);
  });

  it('shrinks carrying capacity when Force drops (R-2.18 edge case)', () => {
    expect(effectiveSpeedFactor(loaded({ speedFactor: 5, strength: 5, carriedWeightKg: 22 }))).toBe(
      5
    );
    expect(effectiveSpeedFactor(loaded({ speedFactor: 5, strength: 3, carriedWeightKg: 22 }))).toBe(
      7
    );
  });

  it('lets haste lower and slowness raise the effective factor (R-1.38)', () => {
    expect(
      effectiveSpeedFactor(loaded({ speedFactor: 7, activeEffects: [factorEffect('sub', 2)] }))
    ).toBe(5);
    expect(
      effectiveSpeedFactor(loaded({ speedFactor: 5, activeEffects: [factorEffect('add', 3)] }))
    ).toBe(8);
  });

  it('combines encumbrance with effects and floors at the minimum speed factor', () => {
    expect(
      effectiveSpeedFactor(
        loaded({
          speedFactor: 5,
          strength: 3,
          carriedWeightKg: 20.1,
          activeEffects: [factorEffect('sub', 1)]
        })
      )
    ).toBe(6);
    expect(
      effectiveSpeedFactor(loaded({ speedFactor: 5, activeEffects: [factorEffect('sub', 100)] }))
    ).toBe(1);
  });

  it('schedules the first action by the effective (encumbered) speed factor', () => {
    const state = addCombatant(
      createCombatState(1),
      loaded({ id: 'porter', speedFactor: 5, strength: 3, carriedWeightKg: 20.1 })
    );

    expect(state.timeline[0].nextActionAt).toBe(8);
  });
});

describe('summarizeEncumbrance (R-2.18)', () => {
  it('reports no overload at or below capacity (Force x 5 kg)', () => {
    expect(summarizeEncumbrance({ carriedWeightKg: 15, strength: 3 })).toEqual({
      capacityKg: 15,
      carriedKg: 15,
      excessKg: 0,
      overloaded: false,
      penaltyDT: 0
    });
  });

  it('adds +1 DT per full 5 kg above capacity and flags overload', () => {
    expect(summarizeEncumbrance({ carriedWeightKg: 20.1, strength: 3 })).toEqual({
      capacityKg: 15,
      carriedKg: 20.1,
      excessKg: 5.1,
      overloaded: true,
      penaltyDT: 2
    });
  });

  it('clamps negative carried weight to zero (no negative penalty)', () => {
    expect(summarizeEncumbrance({ carriedWeightKg: -4, strength: 2 })).toMatchObject({
      carriedKg: 0,
      excessKg: 0,
      penaltyDT: 0
    });
  });

  it('shares its definition with effectiveSpeedFactor (penalty matches)', () => {
    const penalty = summarizeEncumbrance({ carriedWeightKg: 22, strength: 3 }).penaltyDT;
    const base = 5;

    expect(
      effectiveSpeedFactor(loaded({ speedFactor: base, strength: 3, carriedWeightKg: 22 }))
    ).toBe(base + penalty);
  });
});

function loaded(props: {
  id?: string;
  speedFactor?: number;
  strength?: number;
  carriedWeightKg?: number;
  activeEffects?: EffectModel[];
}): Combatant {
  return {
    id: props.id ?? 'loaded',
    name: 'Loaded',
    speedFactor: props.speedFactor ?? 5,
    nextActionAt: 0,
    reflexes: 3,
    vitality: { current: 10, max: 10 },
    attributes: { strength: props.strength ?? 5, dexterity: 5, stamina: 5 },
    skills: {},
    statuses: [],
    ...(props.carriedWeightKg === undefined ? {} : { carriedWeightKg: props.carriedWeightKg }),
    ...(props.activeEffects === undefined ? {} : { activeEffects: props.activeEffects })
  };
}

function factorEffect(op: 'add' | 'sub', value: number): EffectModel {
  return parseEffectModel({
    source: { prose: 'Fixture speed-factor effect.', ref: 'fixture:factor' },
    spec: { target: 'factor', op, value, activation: 'passive', duration: 'permanent' },
    fidelity: 'covered'
  });
}

describe('damage-target effects in combat (#137)', () => {
  it('adds a damage-target effect bonus to the attack damage', () => {
    const damageEffect = parseEffectModel({
      source: { prose: 'Coup affute.', ref: 'fixture:dmg' },
      spec: {
        target: 'damage',
        scope: 'C',
        op: 'add',
        value: 2,
        activation: 'passive',
        duration: 'permanent'
      },
      fidelity: 'covered'
    });
    const attacker = {
      ...combatant({
        id: 'attacker',
        speedFactor: 5,
        pendingAction: {
          type: 'attack',
          targetId: 'defender',
          attack: { pool: 2, difficulty: 7 },
          damage: {
            attackerForce: 0,
            weaponDamage: { components: [{ type: 'C', includesForce: false, flat: 3 }] }
          }
        }
      }),
      activeEffects: [damageEffect]
    };
    const defender = combatant({ id: 'defender', speedFactor: 8 });
    const state = addCombatant(addCombatant(createCombatState(1), defender), attacker);

    const result = resolveNextAction(state, { randomInteger: scriptedRolls([7, 8]) });
    const target = result.timeline.find((entry) => entry.id === 'defender');

    // flat 3 + damage-effect +2 (type C) = 5
    expect(target?.vitality.current).toBe(5);
  });
});

describe('zone-based KO and death (R-9.17)', () => {
  it('knocks out on a head hit over a quarter of max vitality', () => {
    const state = addCombatant(createCombatState(1), combatant({ id: 'target' }));
    const target = applyDamage(state, 'target', 3, undefined, { zone: { id: 'tete' } }).timeline[0];

    expect(target.vitality.current).toBe(7);
    expect(target.statuses).toContainEqual({ id: 'unconscious', appliedAtDT: 1 });
    expect(target.statuses).not.toContainEqual({ id: 'dead', appliedAtDT: 1 });
  });

  it('kills on a head or throat hit over half the base vitality', () => {
    const head = addCombatant(createCombatState(1), combatant({ id: 'a' }));
    expect(
      applyDamage(head, 'a', 6, undefined, { zone: { id: 'tete' } }).timeline[0].statuses
    ).toContainEqual({ id: 'dead', appliedAtDT: 1 });

    const throat = addCombatant(createCombatState(1), combatant({ id: 'b' }));
    expect(
      applyDamage(throat, 'b', 6, undefined, { zone: { id: 'gorge_nuque' } }).timeline[0].statuses
    ).toContainEqual({ id: 'dead', appliedAtDT: 1 });
  });

  it('does not apply zone death to a non-lethal zone', () => {
    const state = addCombatant(createCombatState(1), combatant({ id: 'target' }));
    const target = applyDamage(state, 'target', 6, undefined, {
      zone: { id: 'haut_jambe' }
    }).timeline[0];

    expect(target.statuses).not.toContainEqual({ id: 'dead', appliedAtDT: 1 });
    expect(target.vitality.current).toBe(4);
  });

  it('skips zone death for until-death combatants', () => {
    const state = addCombatant(
      createCombatState(1),
      combatant({ id: 'skeleton', ignoresVitalityMalus: true })
    );
    const target = applyDamage(state, 'skeleton', 6, undefined, {
      zone: { id: 'tete' }
    }).timeline[0];

    expect(target.statuses).not.toContainEqual({ id: 'dead', appliedAtDT: 1 });
  });
});

describe('spell casting in combat (R-8.5 / R-8.6 / R-8.7 / R-8.8)', () => {
  const spell = (overrides: Partial<SpellAction> = {}): SpellAction => ({
    type: 'spell',
    intelligence: 4,
    spellPoints: 2,
    difficulty: 7,
    energyCost: 10,
    castingTimeDT: 12,
    ...overrides
  });

  const mageWithEnergy = (current = 60) => ({
    ...combatant({ id: 'mage', speedFactor: 7 }),
    energy: { current, max: 60 }
  });

  it('commits the energy cost and schedules the casting-time windup (R-8.6 / R-8.10)', () => {
    const state = addCombatant(createCombatState(1), mageWithEnergy());

    const declared = declareSpellCast(state, 'mage', spell());
    const caster = declared.timeline.find((entry) => entry.id === 'mage');

    expect(caster?.energy).toEqual({ current: 50, max: 60 });
    expect(caster?.nextActionAt).toBe(13); // currentDT 1 + TI 12
    expect(caster?.pendingAction).toMatchObject({ type: 'spell', energyCost: 10 });
    expect(declared.log.at(-1)).toMatchObject({
      type: 'spell_started',
      actorId: 'mage',
      costDT: 12,
      nextActionAt: 13,
      energySpent: 10
    });
  });

  it('resolves the casting roll when the caster reaches the front (R-8.5)', () => {
    const declared = declareSpellCast(
      addCombatant(createCombatState(1), mageWithEnergy()),
      'mage',
      spell()
    );

    // Pool 6 (Int 4 + 2 points) vs difficulty 7: three dice >= 7 succeed.
    const resolved = resolveNextAction(declared, {
      randomInteger: scriptedRolls([7, 8, 9, 2, 3, 4])
    });
    const event = resolved.log.at(-1);

    expect(event).toMatchObject({
      type: 'spell_resolved',
      actorId: 'mage',
      atDT: 13,
      successes: 3
    });
    expect(event?.spellCast?.success).toBe(true);
  });

  it('loses the committed energy when the incantation is interrupted (R-8.7)', () => {
    const state = addCombatant(
      addCombatant(createCombatState(1), mageWithEnergy()),
      combatant({ id: 'rogue', speedFactor: 5 })
    );
    const declared = declareSpellCast(state, 'mage', spell());

    const interrupted = interruptCombatant(declared, 'mage', 'release');
    const caster = interrupted.timeline.find((entry) => entry.id === 'mage');

    expect(caster?.energy).toEqual({ current: 50, max: 60 }); // committed energy is NOT refunded
    expect(caster?.pendingAction).toBeUndefined();
    expect(interrupted.log.at(-1)).toMatchObject({
      type: 'action_interrupted',
      actorId: 'mage',
      actionType: 'spell'
    });
  });

  it('rejects a cast the caster cannot pay for', () => {
    const state = addCombatant(createCombatState(1), mageWithEnergy(5));

    expect(() => declareSpellCast(state, 'mage', spell())).toThrow();
  });

  it('rejects casting for a combatant without an energy pool', () => {
    const state = addCombatant(createCombatState(1), combatant({ id: 'fighter', speedFactor: 7 }));

    expect(() => declareSpellCast(state, 'fighter', spell())).toThrow('no energy pool');
  });

  it('reduces the windup by spending 2 energy per DT, flooring at the speed factor (R-8.8)', () => {
    const state = addCombatant(createCombatState(1), mageWithEnergy());

    const declared = declareSpellCast(state, 'mage', spell({ tiReductionDT: 5 }));
    const caster = declared.timeline.find((entry) => entry.id === 'mage');

    // FV 7, TI 12 -> reduced to 7 (the floor): 5 DT removed at +2 energy/DT.
    expect(caster?.nextActionAt).toBe(8); // currentDT 1 + effective TI 7
    expect(caster?.energy).toEqual({ current: 40, max: 60 }); // 60 - (10 + 2 * 5)
    expect(declared.log.at(-1)).toMatchObject({
      type: 'spell_started',
      costDT: 7,
      energySpent: 20
    });
  });

  it('never reduces below the speed factor and only charges DT actually removed (R-8.8)', () => {
    const state = addCombatant(createCombatState(1), mageWithEnergy());

    const declared = declareSpellCast(state, 'mage', spell({ tiReductionDT: 10 }));
    const caster = declared.timeline.find((entry) => entry.id === 'mage');

    expect(caster?.nextActionAt).toBe(8); // floored at FV 7, not 12 - 10
    expect(caster?.energy).toEqual({ current: 40, max: 60 }); // charged for the 5 DT removed, not 10
  });

  it('raises the cast difficulty by damage taken during the incantation (R-8.7)', () => {
    const declared = declareSpellCast(
      addCombatant(createCombatState(1), mageWithEnergy()),
      'mage',
      spell()
    );
    const hit = applyDamage(declared, 'mage', 2); // 2 damage suffered mid-incantation
    const casting = hit.timeline.find((entry) => entry.id === 'mage');
    expect(casting?.spellConcentrationDamage).toBe(2);

    // difficulty 7 + 2 damage = 9; three dice >= 9 succeed.
    const resolved = resolveNextAction(hit, { randomInteger: scriptedRolls([9, 9, 9, 2, 2, 2]) });
    const event = resolved.log.at(-1);

    expect(event?.spellCast?.difficulty).toBe(9);
    expect(event).toMatchObject({ type: 'spell_resolved', successes: 3 });
    // the accumulator is cleared once the cast resolves.
    expect(resolved.timeline.find((entry) => entry.id === 'mage')?.spellConcentrationDamage).toBe(
      undefined
    );
  });
});

describe('structured spell effects applied on resolution (E1b, R-8.5)', () => {
  const spell = (overrides: Partial<SpellAction> = {}): SpellAction => ({
    type: 'spell',
    intelligence: 4,
    spellPoints: 2,
    difficulty: 7,
    energyCost: 10,
    castingTimeDT: 12,
    ...overrides
  });

  const mage = () => ({
    ...combatant({ id: 'mage', speedFactor: 7 }),
    energy: { current: 60, max: 60 }
  });

  // Target parked far in the future so the mage's windup resolves first.
  const target = (overrides: Partial<Combatant> = {}) =>
    combatant({ id: 'orc', speedFactor: 6, nextActionAt: 999, ...overrides });

  const damageEffect = parseEffectModel({
    source: { prose: 'Inflige 2 points de degats de coupe par reussite.', ref: 'spells:exemple' },
    spec: {
      target: 'damage',
      scope: 'C',
      op: 'add',
      value: 'successes * 2',
      activation: 'active',
      duration: 'ephemeral'
    },
    fidelity: 'covered',
    ambiguity_ref: null
  });

  // Pool 6 (Int 4 + 2 points) vs difficulty 7: three dice >= 7 -> 3 net successes, no explosion/1s.
  const threeSuccesses = () => scriptedRolls([7, 8, 9, 2, 3, 4]);

  it('scales damage by net successes and carries the damage type for resistance (E1b)', () => {
    const state = addCombatant(addCombatant(createCombatState(1), mage()), target());
    const declared = declareSpellCast(
      state,
      'mage',
      spell({ targetId: 'orc', effect: damageEffect })
    );

    const resolved = resolveNextAction(declared, { randomInteger: threeSuccesses() });

    const spellEvent = resolved.log.find((e) => e.type === 'spell_resolved');
    expect(spellEvent?.successes).toBe(3);
    // Target carries no resistances: the elemental layer rolls nothing (percent 0) and passes through.
    expect(spellEvent?.spellEffect).toMatchObject({
      target: 'damage',
      op: 'add',
      scope: 'C',
      value: 6,
      applied: true
    });
    expect(spellEvent?.spellEffect?.resistance?.amount).toBe(6);
    // 10 vitality - (3 successes * 2) = 4
    expect(resolved.timeline.find((e) => e.id === 'orc')?.vitality.current).toBe(4);
  });

  it('applies a heal using the structured formula, not a flat per-success heal (E1b)', () => {
    // Apaisement-style: the prose formula governs the magnitude, not a naive +R.
    const healEffect = parseEffectModel({
      source: { prose: 'Restaure 1 point de vitalite par reussite.', ref: 'spells:soin' },
      spec: {
        target: 'vitality',
        op: 'add',
        value: 'successes',
        activation: 'active',
        duration: 'ephemeral'
      },
      fidelity: 'covered',
      ambiguity_ref: null
    });
    const state = addCombatant(
      addCombatant(createCombatState(1), mage()),
      target({ id: 'ally', vitality: { current: 4, max: 10 } })
    );
    const declared = declareSpellCast(
      state,
      'mage',
      spell({ targetId: 'ally', effect: healEffect })
    );

    const resolved = resolveNextAction(declared, { randomInteger: threeSuccesses() });

    const spellEvent = resolved.log.find((e) => e.type === 'spell_resolved');
    expect(spellEvent?.spellEffect).toMatchObject({
      target: 'vitality',
      op: 'add',
      value: 3,
      applied: true
    });
    // 4 + 3 successes = 7 (heal is a negative vitality delta, capped at max)
    expect(resolved.timeline.find((e) => e.id === 'ally')?.vitality.current).toBe(7);
  });

  it('does not apply the effect when the cast nets zero successes (R-8.5)', () => {
    const state = addCombatant(addCombatant(createCombatState(1), mage()), target());
    const declared = declareSpellCast(
      state,
      'mage',
      spell({ targetId: 'orc', effect: damageEffect })
    );

    // No die >= 7 and no 1s: zero successes, no critical-failure D100.
    const resolved = resolveNextAction(declared, {
      randomInteger: scriptedRolls([2, 3, 4, 5, 6, 6])
    });

    const spellEvent = resolved.log.find((e) => e.type === 'spell_resolved');
    expect(spellEvent?.successes).toBe(0);
    expect(spellEvent?.spellEffect).toBeUndefined();
    expect(resolved.timeline.find((e) => e.id === 'orc')?.vitality.current).toBe(10);
  });

  it('reports a non-vitality effect without mutating the target (deferred to E3/E4)', () => {
    const slowEffect = parseEffectModel({
      source: { prose: 'Ralentit la cible (facteur de vitesse +2).', ref: 'spells:lenteur' },
      spec: {
        target: 'factor',
        op: 'add',
        value: 2,
        activation: 'active',
        duration: { dt: 20 }
      },
      fidelity: 'covered',
      ambiguity_ref: null
    });
    const state = addCombatant(addCombatant(createCombatState(1), mage()), target());
    const declared = declareSpellCast(
      state,
      'mage',
      spell({ targetId: 'orc', effect: slowEffect })
    );

    const resolved = resolveNextAction(declared, { randomInteger: threeSuccesses() });

    const spellEvent = resolved.log.find((e) => e.type === 'spell_resolved');
    expect(spellEvent?.spellEffect).toEqual({
      target: 'factor',
      op: 'add',
      value: 2,
      applied: false
    });
    // No damage_applied event and vitality intact: the modifier is left to its dedicated layer.
    expect(resolved.log.some((e) => e.type === 'damage_applied')).toBe(false);
    expect(resolved.timeline.find((e) => e.id === 'orc')?.vitality.current).toBe(10);
  });

  it('omits the effect outcome entirely when the spell carries no structured effect', () => {
    const state = addCombatant(addCombatant(createCombatState(1), mage()), target());
    const declared = declareSpellCast(state, 'mage', spell({ targetId: 'orc' }));

    const resolved = resolveNextAction(declared, { randomInteger: threeSuccesses() });

    const spellEvent = resolved.log.find((e) => e.type === 'spell_resolved');
    expect(spellEvent?.successes).toBe(3);
    expect(spellEvent?.spellEffect).toBeUndefined();
    expect(resolved.timeline.find((e) => e.id === 'orc')?.vitality.current).toBe(10);
  });
});

describe('spell resistance interposition (E4b, R-8.15 / R-1.33)', () => {
  const spell = (overrides: Partial<SpellAction> = {}): SpellAction => ({
    type: 'spell',
    intelligence: 4,
    spellPoints: 2,
    difficulty: 7,
    energyCost: 10,
    castingTimeDT: 12,
    ...overrides
  });
  const mage = () => ({
    ...combatant({ id: 'mage', speedFactor: 7 }),
    energy: { current: 60, max: 60 }
  });
  const target = (overrides: Partial<Combatant> = {}) =>
    combatant({ id: 'orc', speedFactor: 6, nextActionAt: 999, ...overrides });

  // Indirect elemental fire damage: 2/R -> 6 at 3 successes, scope feu.
  const fireEffect = parseEffectModel({
    source: { prose: '2 dégâts de feu par réussite.', ref: 'spells:fleche-de-feu' },
    spec: {
      target: 'damage',
      scope: 'feu',
      op: 'add',
      value: '2 * successes',
      activation: 'active',
      duration: 'ephemeral'
    },
    fidelity: 'covered',
    ambiguity_ref: null
  });
  // Cast: 3 successes from [7,8,9,2,3,4]; the trailing value is the resistance D100.
  const cast = (d100: number) => scriptedRolls([7, 8, 9, 2, 3, 4, d100]);

  it('elemental resistance fully blocks the damage on a successful D100 (R-1.32)', () => {
    const state = addCombatant(
      addCombatant(createCombatState(1), mage()),
      target({ resistances: { elementalPercent: { feu: 50 } } })
    );
    const declared = declareSpellCast(
      state,
      'mage',
      spell({ targetId: 'orc', effect: fireEffect })
    );

    // D100 30 <= 50 -> resisted.
    const resolved = resolveNextAction(declared, { randomInteger: cast(30) });

    const spellEvent = resolved.log.find((e) => e.type === 'spell_resolved');
    expect(spellEvent?.spellEffect?.resistance).toMatchObject({
      amount: 0,
      fullyResisted: true,
      burden: false,
      layers: [{ layer: 'elemental', percent: 50, roll: 30, resisted: true }]
    });
    // No damage applied: vitality intact.
    expect(resolved.timeline.find((e) => e.id === 'orc')?.vitality.current).toBe(10);
  });

  it('elemental resistance lets the damage through when the D100 fails', () => {
    const state = addCombatant(
      addCombatant(createCombatState(1), mage()),
      target({ resistances: { elementalPercent: { feu: 50 } } })
    );
    const declared = declareSpellCast(
      state,
      'mage',
      spell({ targetId: 'orc', effect: fireEffect })
    );

    // D100 80 > 50 -> not resisted.
    const resolved = resolveNextAction(declared, { randomInteger: cast(80) });

    const spellEvent = resolved.log.find((e) => e.type === 'spell_resolved');
    expect(spellEvent?.spellEffect?.resistance).toMatchObject({ amount: 6, fullyResisted: false });
    expect(resolved.timeline.find((e) => e.id === 'orc')?.vitality.current).toBe(4); // 10 - 6
  });

  it('routes by element: resistance to a different element does not block the damage', () => {
    const state = addCombatant(
      addCombatant(createCombatState(1), mage()),
      target({ resistances: { elementalPercent: { foudre: 90 } } }) // resists lightning, not fire
    );
    const declared = declareSpellCast(
      state,
      'mage',
      spell({ targetId: 'orc', effect: fireEffect })
    );

    // D100 1 would resist if lightning were checked; fire layer is percent 0 (no roll).
    const resolved = resolveNextAction(declared, {
      randomInteger: scriptedRolls([7, 8, 9, 2, 3, 4])
    });

    const spellEvent = resolved.log.find((e) => e.type === 'spell_resolved');
    expect(spellEvent?.spellEffect?.resistance?.amount).toBe(6);
    expect(resolved.timeline.find((e) => e.id === 'orc')?.vitality.current).toBe(4);
  });

  it('magic resistance is a BURDEN: a direct beneficial heal can be blocked (R-8.15)', () => {
    const healEffect = parseEffectModel({
      source: { prose: '1 point de vitalité par réussite.', ref: 'spells:soin' },
      spec: {
        target: 'vitality',
        op: 'add',
        value: 'successes',
        activation: 'active',
        duration: 'ephemeral'
      },
      fidelity: 'covered',
      ambiguity_ref: null
    });
    const state = addCombatant(
      addCombatant(createCombatState(1), mage()),
      target({ id: 'ally', vitality: { current: 4, max: 10 }, resistances: { magicPercent: 60 } })
    );
    const declared = declareSpellCast(
      state,
      'mage',
      spell({ targetId: 'ally', effect: healEffect, directMagic: true })
    );

    // D100 20 <= 60 -> the magic resistance blocks the (beneficial) heal: burden.
    const resolved = resolveNextAction(declared, { randomInteger: cast(20) });

    const spellEvent = resolved.log.find((e) => e.type === 'spell_resolved');
    expect(spellEvent?.spellEffect?.resistance).toMatchObject({
      amount: 0,
      fullyResisted: true,
      burden: true,
      layers: [{ layer: 'magic', percent: 60, roll: 20, resisted: true }]
    });
    expect(resolved.timeline.find((e) => e.id === 'ally')?.vitality.current).toBe(4); // heal blocked
  });

  it('magic resistance is a SHIELD against a direct offensive spell', () => {
    const mindCrush = parseEffectModel({
      source: {
        prose: '2 dégâts directs par réussite (contrôle mental).',
        ref: 'spells:broiement'
      },
      spec: {
        target: 'damage',
        op: 'add',
        value: '2 * successes',
        activation: 'active',
        duration: 'ephemeral'
      },
      fidelity: 'covered',
      ambiguity_ref: null
    });
    const state = addCombatant(
      addCombatant(createCombatState(1), mage()),
      target({ resistances: { magicPercent: 50 } })
    );
    const declared = declareSpellCast(
      state,
      'mage',
      spell({ targetId: 'orc', effect: mindCrush, directMagic: true })
    );

    const resolved = resolveNextAction(declared, { randomInteger: cast(30) }); // 30 <= 50 -> resisted

    const spellEvent = resolved.log.find((e) => e.type === 'spell_resolved');
    expect(spellEvent?.spellEffect?.resistance).toMatchObject({
      amount: 0,
      fullyResisted: true,
      burden: false,
      layers: [{ layer: 'magic', percent: 50, roll: 30, resisted: true }]
    });
    expect(resolved.timeline.find((e) => e.id === 'orc')?.vitality.current).toBe(10);
  });
});
