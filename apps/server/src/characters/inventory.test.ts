import { describe, expect, it } from 'vitest';
import { InventoryUpdateSchema, sameEquipment } from './inventory.js';

describe('inventory write contract', () => {
  it('accepts empty inventory and requires an expected snapshot', () => {
    expect(InventoryUpdateSchema.safeParse({ equipment: [], expectedEquipment: [] }).success).toBe(
      true
    );
    expect(InventoryUpdateSchema.safeParse({ equipment: [] }).success).toBe(false);
  });
  it('rejects duplicate ids, invalid quantities and client-supplied canonical details', () => {
    for (const equipment of [
      [{ id: 'soin', quantity: 0 }],
      [{ id: 'soin', quantity: -1 }],
      [{ id: 'soin', quantity: 1.5 }],
      [
        { id: 'soin', quantity: 1 },
        { id: 'soin', quantity: 2 }
      ],
      [{ id: 'soin', quantity: 1, name: 'invented' }]
    ])
      expect(InventoryUpdateSchema.safeParse({ equipment, expectedEquipment: [] }).success).toBe(
        false
      );
  });
  it('compares ids and quantities irrespective of order or canonical display names', () => {
    expect(
      sameEquipment(
        [{ id: 'soin' }, { id: 'epee_batarde', quantity: 2 }],
        [
          { id: 'epee_batarde', quantity: 2 },
          { id: 'soin', name: 'Soin', quantity: 1 }
        ]
      )
    ).toBe(true);
    expect(sameEquipment([{ id: 'soin', quantity: 1 }], [{ id: 'soin', quantity: 2 }])).toBe(false);
  });
});
