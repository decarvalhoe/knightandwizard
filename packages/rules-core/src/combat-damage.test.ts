import { describe, expect, it } from 'vitest';

import { computeAttackDamage } from './combat-damage.js';

describe('computeAttackDamage', () => {
  it('rolls melee F+N damage as force successes plus the weapon flat bonus', () => {
    const result = computeAttackDamage({
      attackerForce: 4,
      netToucheSuccesses: 2,
      weaponDamage: {
        components: [{ type: 'C', includesForce: true, flat: 3 }]
      },
      randomInteger: scriptedRolls([5, 6, 4, 2])
    });

    expect(result.finalDamage).toBe(5);
    expect(result.components).toEqual([
      expect.objectContaining({
        type: 'C',
        raw: 5,
        afterShield: 5,
        afterResistance: 5,
        afterCircumstance: 5,
        protection: 0,
        afterProtection: 5,
        enduranceReduction: 0,
        afterEndurance: 5,
        zoneMultiplier: 1,
        final: 5
      })
    ]);
    expect(result.log).toContainEqual(
      expect.objectContaining({
        step: 'force_roll',
        difficulty: 5,
        successes: 2
      })
    );
  });

  it('resolves ranged N+munition damage without rolling force', () => {
    const result = computeAttackDamage({
      attackerForce: 5,
      netToucheSuccesses: 3,
      weaponDamage: {
        components: [{ type: 'P', includesForce: false, flat: 3, ammoBonus: 1 }]
      },
      randomInteger: () => {
        throw new Error('N+munition damage must not roll force');
      }
    });

    expect(result.finalDamage).toBe(4);
    expect(result.components[0]).toMatchObject({
      type: 'P',
      raw: 4,
      final: 4
    });
    expect(result.log.some((entry) => entry.step === 'force_roll')).toBe(false);
  });

  it('supports ranged weapons whose formula includes force such as F+bille', () => {
    const result = computeAttackDamage({
      attackerForce: 3,
      netToucheSuccesses: 1,
      weaponDamage: {
        components: [{ type: 'C', includesForce: true, flat: 0, ammoBonus: 1 }]
      },
      randomInteger: scriptedRolls([6, 8, 2])
    });

    expect(result.finalDamage).toBe(3);
    expect(result.components[0]).toMatchObject({
      type: 'C',
      forceSuccesses: 2,
      raw: 3,
      final: 3
    });
  });

  it('adds only matching typed damage modifiers before mitigation', () => {
    const result = computeAttackDamage({
      attackerForce: 0,
      netToucheSuccesses: 1,
      weaponDamage: {
        components: [{ type: 'C', includesForce: false, flat: 2 }]
      },
      damageModifiers: [
        { type: 'C', value: 2, source: 'atout' },
        { type: 'E', value: 99, source: 'spell-other-type' }
      ],
      randomInteger: scriptedRolls([])
    });

    expect(result.finalDamage).toBe(4);
    expect(result.components[0]).toMatchObject({
      type: 'C',
      damageModifier: 2,
      raw: 4
    });
  });

  it('lowers the force-roll difficulty when net touche successes increase', () => {
    const weakHit = computeAttackDamage({
      attackerForce: 3,
      netToucheSuccesses: 0,
      weaponDamage: {
        components: [{ type: 'T', includesForce: true, flat: 0 }]
      },
      randomInteger: scriptedRolls([5, 5, 5])
    });
    const strongHit = computeAttackDamage({
      attackerForce: 3,
      netToucheSuccesses: 2,
      weaponDamage: {
        components: [{ type: 'T', includesForce: true, flat: 0 }]
      },
      randomInteger: scriptedRolls([5, 5, 5])
    });

    expect(weakHit.finalDamage).toBe(0);
    expect(strongHit.finalDamage).toBe(3);
    expect(weakHit.log).toContainEqual(
      expect.objectContaining({ step: 'force_roll', difficulty: 7, successes: 0 })
    );
    expect(strongHit.log).toContainEqual(
      expect.objectContaining({ step: 'force_roll', difficulty: 5, successes: 3 })
    );
  });

  it('subtracts protections by damage type and covering layer', () => {
    const result = computeAttackDamage({
      attackerForce: 0,
      netToucheSuccesses: 1,
      weaponDamage: {
        components: [{ type: 'P', includesForce: false, flat: 6 }]
      },
      defense: {
        protections: [
          {
            id: 'cuir',
            layer: 'soft',
            zones: ['thorax'],
            values: { P: 1, E: 1, C: 0, T: 1 }
          },
          {
            id: 'maille',
            layer: 'mail',
            zones: ['thorax'],
            values: { P: 2, E: 1, C: 1, T: 2 }
          },
          {
            id: 'casque',
            layer: 'plate',
            zones: ['tete'],
            values: { P: 3, E: 1, C: 2, T: 3 }
          }
        ]
      },
      zone: { id: 'thorax' },
      randomInteger: scriptedRolls([])
    });

    expect(result.finalDamage).toBe(3);
    expect(result.components[0]).toMatchObject({
      type: 'P',
      raw: 6,
      protection: 3,
      afterProtection: 3,
      final: 3
    });
  });

  it('applies typed circumstance modifiers before protections', () => {
    const result = computeAttackDamage({
      attackerForce: 0,
      netToucheSuccesses: 1,
      weaponDamage: {
        components: [{ type: 'T', includesForce: false, flat: 2 }]
      },
      defense: {
        circumstanceModifiers: [{ type: 'T', value: 3, source: 'charge' }],
        protections: [
          {
            id: 'cuir',
            layer: 'soft',
            zones: ['thorax'],
            values: { P: 1, E: 1, C: 0, T: 1 }
          }
        ]
      },
      zone: { id: 'thorax' },
      randomInteger: scriptedRolls([])
    });

    expect(result.finalDamage).toBe(4);
    expect(result.components[0]).toMatchObject({
      raw: 2,
      circumstanceModifier: 3,
      afterCircumstance: 5,
      protection: 1,
      final: 4
    });
  });

  it('negates a component when its D100 resistance succeeds', () => {
    const result = computeAttackDamage({
      attackerForce: 0,
      netToucheSuccesses: 1,
      weaponDamage: {
        components: [{ type: 'E', includesForce: false, flat: 5 }]
      },
      defense: {
        percentageResistances: { E: 40 }
      },
      randomInteger: scriptedRolls([39])
    });

    expect(result.finalDamage).toBe(0);
    expect(result.components[0]).toMatchObject({
      type: 'E',
      raw: 5,
      resistanceRoll: 39,
      resisted: true,
      afterResistance: 0,
      final: 0
    });
  });

  it('fully deflects a component when the shield D100 succeeds', () => {
    const result = computeAttackDamage({
      attackerForce: 0,
      netToucheSuccesses: 1,
      weaponDamage: {
        components: [{ type: 'C', includesForce: false, flat: 5 }]
      },
      defense: {
        shield: { percent: 30, usable: true }
      },
      randomInteger: scriptedRolls([30])
    });

    expect(result.finalDamage).toBe(0);
    expect(result.components[0]).toMatchObject({
      type: 'C',
      shieldRoll: 30,
      shieldDeflected: true,
      afterShield: 0,
      final: 0
    });
  });

  it('applies the zone multiplier after protections and endurance', () => {
    const result = computeAttackDamage({
      attackerForce: 0,
      netToucheSuccesses: 1,
      weaponDamage: {
        components: [{ type: 'C', includesForce: false, flat: 6 }]
      },
      defense: {
        endurance: { pool: 3 },
        protections: [
          {
            id: 'casque',
            layer: 'plate',
            zones: ['tete'],
            values: { P: 2, E: 1, C: 2, T: 2 }
          }
        ]
      },
      zone: { id: 'tete', damageMultiplier: 2, allowsEndurance: true },
      randomInteger: scriptedRolls([7, 8, 2])
    });

    expect(result.finalDamage).toBe(4);
    expect(result.components[0]).toMatchObject({
      raw: 6,
      protection: 2,
      afterProtection: 4,
      enduranceReduction: 2,
      afterEndurance: 2,
      zoneMultiplier: 2,
      final: 4
    });
  });

  it('forbids endurance for throat and eye style zones before applying their multiplier', () => {
    const result = computeAttackDamage({
      attackerForce: 0,
      netToucheSuccesses: 1,
      weaponDamage: {
        components: [{ type: 'T', includesForce: false, flat: 6 }]
      },
      defense: {
        endurance: { pool: 3 },
        protections: [
          {
            id: 'gorgerin',
            layer: 'plate',
            zones: ['gorge'],
            values: { P: 2, E: 1, C: 2, T: 2 }
          }
        ]
      },
      zone: { id: 'gorge', damageMultiplier: 2, allowsEndurance: false },
      randomInteger: scriptedRolls([])
    });

    expect(result.finalDamage).toBe(8);
    expect(result.components[0]).toMatchObject({
      protection: 2,
      afterProtection: 4,
      enduranceReduction: 0,
      afterEndurance: 4,
      final: 8
    });
    expect(result.log.some((entry) => entry.step === 'endurance_roll')).toBe(false);
  });

  it('resolves multi-type weapons against each component type protection', () => {
    const result = computeAttackDamage({
      attackerForce: 2,
      netToucheSuccesses: 1,
      weaponDamage: {
        components: [
          { type: 'C', includesForce: true, flat: 2 },
          { type: 'E', includesForce: false, flat: 1 }
        ]
      },
      defense: {
        protections: [
          {
            id: 'cuir',
            layer: 'soft',
            zones: ['main'],
            values: { P: 1, E: 1, C: 2, T: 1 }
          }
        ]
      },
      zone: { id: 'main' },
      randomInteger: scriptedRolls([6, 3])
    });

    expect(result.finalDamage).toBe(1);
    expect(result.components).toEqual([
      expect.objectContaining({ type: 'C', raw: 3, protection: 2, final: 1 }),
      expect.objectContaining({ type: 'E', raw: 1, protection: 1, final: 0 })
    ]);
  });

  it('uses one endurance roll for the final multi-type wound', () => {
    const result = computeAttackDamage({
      attackerForce: 0,
      netToucheSuccesses: 1,
      weaponDamage: {
        components: [
          { type: 'C', includesForce: false, flat: 4 },
          { type: 'E', includesForce: false, flat: 3 }
        ]
      },
      defense: {
        endurance: { pool: 2 }
      },
      randomInteger: scriptedRolls([7, 8])
    });

    expect(result.finalDamage).toBe(5);
    expect(result.log.filter((entry) => entry.step === 'endurance_roll')).toHaveLength(1);
    expect(result.components).toEqual([
      expect.objectContaining({ type: 'C', afterProtection: 4, enduranceReduction: 2, final: 2 }),
      expect.objectContaining({ type: 'E', afterProtection: 3, enduranceReduction: 0, final: 3 })
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

    if (!Number.isInteger(value) || value < 1 || value > sides) {
      throw new Error(`Invalid scripted D${sides} roll: ${value}`);
    }

    return value;
  };
}
