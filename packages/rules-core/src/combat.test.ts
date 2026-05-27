import { describe, expect, it } from 'vitest';

import {
  addCombatant,
  applyDamage,
  applyStatus,
  createCombatState,
  effectiveSpeedFactor,
  getCyclicDT,
  interruptCombatant,
  resolveNextAction,
  resolveStaminaDamage,
  type AttackAction,
  type Combatant
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
