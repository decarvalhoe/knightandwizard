import { describe, expect, it } from 'vitest';

import {
  addCombatant,
  applyDamage,
  applyStatus,
  createCombatState,
  getCyclicDT,
  resolveNextAction,
  resolveStaminaDamage
} from './combat.js';

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
      atDT: 6
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
});

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
