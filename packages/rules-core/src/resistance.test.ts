import { describe, expect, it } from 'vitest';

import { resolveSpellResistance, rollResistance } from './resistance.js';

/** Deterministic D100 source (consumes scripted values in order). */
function scripted(values: number[]): (sides: number) => number {
  let i = 0;
  return (sides: number): number => {
    const v = values[i];
    i += 1;
    if (v === undefined) throw new Error(`No scripted roll left for D${sides}`);
    return v;
  };
}

describe('rollResistance (R-1.32 — D100 ≤ %)', () => {
  it('resists when the D100 is at or below the threshold', () => {
    const r = rollResistance('magic', 40, 10, { randomInteger: scripted([40]) });
    expect(r).toEqual({ layer: 'magic', percent: 40, roll: 40, resisted: true });
  });

  it('does not resist when the D100 exceeds the threshold', () => {
    const r = rollResistance('elemental', 40, 10, { randomInteger: scripted([41]) });
    expect(r).toEqual({ layer: 'elemental', percent: 40, roll: 41, resisted: false });
  });

  it('does not roll when the percent is zero', () => {
    const r = rollResistance('magic', 0, 10, {
      randomInteger: scripted([]) // throws if a roll is attempted
    });
    expect(r).toEqual({ layer: 'magic', percent: 0, resisted: false });
  });

  it('does not roll when the amount is zero', () => {
    const r = rollResistance('elemental', 50, 0, { randomInteger: scripted([]) });
    expect(r).toEqual({ layer: 'elemental', percent: 50, resisted: false });
  });

  it('rejects an out-of-range percent', () => {
    expect(() => rollResistance('magic', 120, 10)).toThrow(/between 0 and 100/);
  });

  it('rejects a negative amount', () => {
    expect(() => rollResistance('magic', 50, -1)).toThrow(/non-negative/);
  });
});

describe('resolveSpellResistance — magie directe (R-8.15)', () => {
  it('blocks an offensive direct spell when the magic resistance succeeds (bouclier)', () => {
    const result = resolveSpellResistance(
      { directMagic: true, beneficial: false, amount: 12 },
      { magicPercent: 50 },
      { randomInteger: scripted([30]) }
    );
    expect(result.amount).toBe(0);
    expect(result.fullyResisted).toBe(true);
    expect(result.burden).toBe(false);
    expect(result.layers).toEqual([{ layer: 'magic', percent: 50, roll: 30, resisted: true }]);
  });

  it('blocks a BENEFICIAL direct spell as a burden (un soin résisté est perdu)', () => {
    const result = resolveSpellResistance(
      { directMagic: true, beneficial: true, amount: 8 },
      { magicPercent: 50 },
      { randomInteger: scripted([10]) }
    );
    expect(result.amount).toBe(0);
    expect(result.fullyResisted).toBe(true);
    expect(result.burden).toBe(true); // R-8.15 — la résistance magique est un fardeau ici
  });

  it('lets the direct spell through when the magic resistance fails', () => {
    const result = resolveSpellResistance(
      { directMagic: true, beneficial: false, amount: 12 },
      { magicPercent: 50 },
      { randomInteger: scripted([77]) }
    );
    expect(result.amount).toBe(12);
    expect(result.fullyResisted).toBe(false);
    expect(result.burden).toBe(false);
  });

  it('ignores elemental resistance for a direct spell (only the magic layer applies)', () => {
    const result = resolveSpellResistance(
      { directMagic: true, beneficial: false, element: 'feu', amount: 12 },
      { magicPercent: 0, elementalPercent: { feu: 90 } },
      { randomInteger: scripted([]) } // no roll: magicPercent 0 ⇒ no magic roll, elemental skipped
    );
    expect(result.amount).toBe(12);
    expect(result.layers).toEqual([{ layer: 'magic', percent: 0, resisted: false }]);
  });
});

describe('resolveSpellResistance — magie indirecte élémentaire', () => {
  it('blocks an elemental spell when the matching elemental resistance succeeds', () => {
    const result = resolveSpellResistance(
      { directMagic: false, beneficial: false, element: 'feu', amount: 20 },
      { elementalPercent: { feu: 36 } },
      { randomInteger: scripted([20]) }
    );
    expect(result.amount).toBe(0);
    expect(result.fullyResisted).toBe(true);
    expect(result.layers).toEqual([{ layer: 'elemental', percent: 36, roll: 20, resisted: true }]);
  });

  it('routes by element: no resistance to the spell element ⇒ full damage', () => {
    const result = resolveSpellResistance(
      { directMagic: false, beneficial: false, element: 'foudre', amount: 20 },
      { elementalPercent: { feu: 90 } }, // resistant to fire, not lightning
      { randomInteger: scripted([1]) } // would resist if fire were checked
    );
    expect(result.amount).toBe(20);
    expect(result.layers).toEqual([{ layer: 'elemental', percent: 0, resisted: false }]);
  });

  it('applies no layer for a non-direct spell without an element', () => {
    const result = resolveSpellResistance(
      { directMagic: false, beneficial: false, amount: 5 },
      { magicPercent: 90, elementalPercent: { feu: 90 } },
      { randomInteger: scripted([]) }
    );
    expect(result.amount).toBe(5);
    expect(result.layers).toEqual([]);
    expect(result.fullyResisted).toBe(false);
  });
});
