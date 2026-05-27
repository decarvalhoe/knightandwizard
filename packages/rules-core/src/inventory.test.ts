import { describe, expect, it } from 'vitest';

import { type InventoryItem, carriedWeightKg, setItemState, wornItems } from './inventory.js';

function items(): InventoryItem[] {
  return [
    { id: 'armor', typeId: 'cuir-cloute-haubergeon', weightKg: 8, state: 'worn' },
    { id: 'sword', typeId: 'epee', weightKg: 1.5, state: 'worn' },
    { id: 'rations', typeId: 'rations', weightKg: 0.5, state: 'carried', quantity: 4 },
    { id: 'tent', typeId: 'tente', weightKg: 6, state: 'stored' }
  ];
}

describe('inventory — carried weight (R-10.10)', () => {
  it('sums worn + carried weight, excluding stored, applying quantity', () => {
    // 8 (worn) + 1.5 (worn) + 0.5*4 (carried) = 11.5 ; tent (stored) excluded
    expect(carriedWeightKg(items())).toBe(11.5);
  });

  it('excludes an item once it is stored off-person', () => {
    const stowed = setItemState(items(), 'armor', 'stored');
    expect(carriedWeightKg(stowed)).toBe(3.5);
  });

  it('returns 0 for an empty inventory', () => {
    expect(carriedWeightKg([])).toBe(0);
  });

  it('rejects a negative weight or non-positive quantity', () => {
    expect(() =>
      carriedWeightKg([{ id: 'x', typeId: 't', weightKg: -1, state: 'worn' }])
    ).toThrow();
    expect(() =>
      carriedWeightKg([{ id: 'x', typeId: 't', weightKg: 1, state: 'worn', quantity: 0 }])
    ).toThrow();
  });
});

describe('inventory — worn loadout & state changes', () => {
  it('lists only worn items as the active loadout', () => {
    expect(wornItems(items()).map((item) => item.id)).toEqual(['armor', 'sword']);
  });

  it('changes an item state immutably (dressed for the moment)', () => {
    const before = items();
    const after = setItemState(before, 'armor', 'carried');

    expect(after.find((item) => item.id === 'armor')?.state).toBe('carried');
    expect(before.find((item) => item.id === 'armor')?.state).toBe('worn');
  });
});
