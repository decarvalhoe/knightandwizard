import { describe, expect, it } from 'vitest';

import { breakdownToCopper, copperToBreakdown, spendCopper } from './money.js';

describe('money — R-10.18 (factor 10, internal copper)', () => {
  it('converts a Po/Pa/Pb/Pc breakdown to copper', () => {
    expect(breakdownToCopper({ po: 1, pa: 2, pb: 3, pc: 4 })).toBe(1234);
    expect(breakdownToCopper({ po: 0, pa: 0, pb: 0, pc: 0 })).toBe(0);
  });

  it('converts copper back to the canonical breakdown', () => {
    expect(copperToBreakdown(1234)).toEqual({ po: 1, pa: 2, pb: 3, pc: 4 });
    expect(copperToBreakdown(0)).toEqual({ po: 0, pa: 0, pb: 0, pc: 0 });
    expect(copperToBreakdown(7)).toEqual({ po: 0, pa: 0, pb: 0, pc: 7 });
  });

  it('round-trips breakdown <-> copper', () => {
    const breakdown = { po: 3, pa: 0, pb: 9, pc: 5 };
    expect(copperToBreakdown(breakdownToCopper(breakdown))).toEqual(breakdown);
  });

  it('spends copper and rejects insufficient funds', () => {
    expect(spendCopper(1234, 234)).toBe(1000);
    expect(() => spendCopper(100, 101)).toThrow();
  });

  it('rejects non-integer or negative amounts', () => {
    expect(() => copperToBreakdown(-1)).toThrow();
    expect(() => breakdownToCopper({ po: 1.5, pa: 0, pb: 0, pc: 0 })).toThrow();
  });
});
