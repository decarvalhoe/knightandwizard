import { describe, expect, it } from 'vitest';

import {
  buildEquipmentCatalog,
  buildInventory,
  type PotionsEquipmentDocument,
  type ProtectionsEquipmentDocument,
  type WeaponsEquipmentDocument
} from './model.js';

const weapons: WeaponsEquipmentDocument = {
  weapons: [
    { id: 'epee_batarde', name: 'Épée bâtarde', weight_kg: 2.2 },
    // Parametric weights (string) are intentionally left without a numeric weight.
    { id: 'chaine', name: 'Chaîne', weight_kg: '0.8/1m' },
    // Non-active entries must never reach the inventory picker.
    { id: 'arme_demo', name: 'Arme démo', status: 'deprecated', weight_kg: 1 },
    // Entries missing an id/name are skipped.
    { name: 'Sans id' }
  ]
};

const protections: ProtectionsEquipmentDocument = {
  armor_pieces: [{ id: 'cuir_souple_bonnet', name: 'Bonnet (cuir souple)', weight_kg_human: 0.2 }],
  shields: [{ id: 'bouclier_bois', name: 'Bouclier (bois)', weight_kg_human: 3 }]
};

const potions: PotionsEquipmentDocument = {
  potions: [
    { id: 'soin', name: 'Potion de Soin' },
    { id: 'agrandissement', name: "Potion d'Agrandissement" }
  ]
};

describe('character sheet equipment read-model', () => {
  it('derives the equipment picker from the armes/protections/potions catalogs', () => {
    const catalog = buildEquipmentCatalog({ potions, protections, weapons });

    expect(catalog).toEqual([
      { category: 'weapon', id: 'epee_batarde', name: 'Épée bâtarde', weightKg: 2.2 },
      { category: 'weapon', id: 'chaine', name: 'Chaîne', weightKg: undefined },
      { category: 'shield', id: 'bouclier_bois', name: 'Bouclier (bois)', weightKg: 3 },
      { category: 'armor', id: 'cuir_souple_bonnet', name: 'Bonnet (cuir souple)', weightKg: 0.2 },
      { category: 'consumable', id: 'soin', name: 'Potion de Soin', weightKg: undefined },
      {
        category: 'consumable',
        id: 'agrandissement',
        name: "Potion d'Agrandissement",
        weightKg: undefined
      }
    ]);
  });

  it('excludes non-active and malformed catalog entries from the picker', () => {
    const ids = buildEquipmentCatalog({ potions, protections, weapons }).map((entry) => entry.id);

    expect(ids).not.toContain('arme_demo');
    expect(ids.every((id) => id.length > 0)).toBe(true);
  });

  it('seeds the inventory from canonical catalog ids without inventing items', () => {
    const inventory = buildInventory({ potions, protections, weapons });

    expect(inventory).toEqual([
      {
        category: 'weapon',
        equipped: true,
        id: 'epee_batarde',
        name: 'Épée bâtarde',
        quantity: 1,
        weightKg: 2.2
      },
      {
        category: 'shield',
        equipped: true,
        id: 'bouclier_bois',
        name: 'Bouclier (bois)',
        quantity: 1,
        weightKg: 3
      },
      {
        category: 'consumable',
        id: 'soin',
        name: 'Potion de Soin',
        quantity: 2,
        weightKg: undefined
      }
    ]);
  });

  it('drops a seed slot when its canonical id is absent rather than fabricating one', () => {
    const inventory = buildInventory({
      potions: { potions: [] },
      protections,
      weapons
    });

    expect(inventory.map((item) => item.id)).toEqual(['epee_batarde', 'bouclier_bois']);
  });
});
