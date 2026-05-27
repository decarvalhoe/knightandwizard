import { describe, expect, it } from 'vitest';

import { resolveSpellCast } from './magic.js';

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

describe('spell casting roll (R-8.5)', () => {
  it('pools Intelligence + spell points (no skill) against the spell difficulty', () => {
    // Int 4 + 2 points = pool 6 ; difficulty 7 ; three dice >= 7 succeed.
    const result = resolveSpellCast(4, 2, 7, {
      randomInteger: scriptedRolls([7, 8, 9, 2, 3, 4])
    });

    expect(result.pool).toBe(6);
    expect(result.difficulty).toBe(7);
    expect(result.netSuccesses).toBe(3);
    expect(result.success).toBe(true);
  });

  it('fails the spell on zero successes', () => {
    const result = resolveSpellCast(2, 0, 7, { randomInteger: scriptedRolls([2, 3]) });

    expect(result.pool).toBe(2);
    expect(result.success).toBe(false);
    expect(result.netSuccesses).toBe(0);
  });

  it('supports high spell difficulties (> 9, R-1.20)', () => {
    // Difficulty 10 (> 9) is passed straight through to the dice engine. Eight dice
    // (Int 5 + 3 points), no initial 10 so the scripted pool is consumed exactly.
    const result = resolveSpellCast(5, 3, 10, {
      randomInteger: scriptedRolls([9, 9, 8, 7, 6, 5, 4, 3])
    });

    expect(result.pool).toBe(8);
    expect(result.difficulty).toBe(10);
    expect(result.netSuccesses).toBeGreaterThanOrEqual(1);
    expect(result.success).toBe(true);
  });

  it('rejects negative inputs', () => {
    expect(() => resolveSpellCast(-1, 0, 7)).toThrow();
    expect(() => resolveSpellCast(4, -2, 7)).toThrow();
  });
});
