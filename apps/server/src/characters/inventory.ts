import { loadValidatedCatalog } from '@knightandwizard/catalogs';
import type { Character, CharacterEquipmentItem } from '@knightandwizard/rules-core';
import { z } from 'zod';
import { createSqlClient } from '../db/client.js';
import { CharacterNotFoundError, type CharacterPersistenceScope } from './finalize.js';

const equipmentList = z
  .array(
    z
      .object({
        id: z.string().min(1),
        quantity: z.number().int().positive().max(Number.MAX_SAFE_INTEGER)
      })
      .strict()
  )
  .refine((items) => new Set(items.map((item) => item.id)).size === items.length, {
    message: 'Equipment ids must be unique'
  });

export const InventoryUpdateSchema = z
  .object({
    equipment: equipmentList,
    expectedEquipment: equipmentList
  })
  .strict();
export type InventoryUpdate = z.infer<typeof InventoryUpdateSchema>;

export class InventoryConflictError extends Error {}
export class UnknownEquipmentError extends Error {}

export function sameEquipment(
  left: CharacterEquipmentItem[],
  right: CharacterEquipmentItem[]
): boolean {
  const normalize = (items: CharacterEquipmentItem[]) =>
    JSON.stringify(
      items
        .map(({ id, quantity }) => ({ id, quantity: quantity ?? 1 }))
        .sort((a, b) => a.id.localeCompare(b.id))
    );
  return normalize(left) === normalize(right);
}

export async function updatePersistedInventory(
  id: string,
  input: InventoryUpdate,
  scope: CharacterPersistenceScope
) {
  const [weapons, protections, potions] = await Promise.all([
    loadValidatedCatalog('armes.yaml'),
    loadValidatedCatalog('protections.yaml'),
    loadValidatedCatalog('potions.yaml')
  ]);
  const options = [
    ...weapons.weapons,
    ...protections.armor_pieces,
    ...protections.shields,
    ...potions.potions
  ];
  const equipment = input.equipment.map((item) => {
    const option = options.find(
      (entry) =>
        entry.id === item.id &&
        entry.name &&
        (entry.status === undefined || entry.status === 'active')
    );
    if (!option) throw new UnknownEquipmentError(`Unknown active equipment: ${item.id}`);
    return { ...item, name: option.name };
  });
  const sql = createSqlClient();
  try {
    return await sql.begin(async (tx) => {
      const rows = await tx<{ payload: Character }[]>`
        SELECT payload FROM characters
        WHERE id = ${id} AND user_id = ${scope.userId ?? 'local-dev'}
        FOR UPDATE
      `;
      const current = rows[0]?.payload;
      if (!current) throw new CharacterNotFoundError(id);
      // Repeating an acknowledged-lost request is safe; a different concurrent edit is not overwritten.
      if (sameEquipment(current.equipment, equipment)) return { character: current };
      if (!sameEquipment(current.equipment, input.expectedEquipment))
        throw new InventoryConflictError('Inventory changed; reload before editing');
      const updated = await tx<{ payload: Character }[]>`
        UPDATE characters
        SET payload = jsonb_set(payload, '{equipment}', ${tx.json(equipment)}::jsonb), updated_at = now()
        WHERE id = ${id} AND user_id = ${scope.userId ?? 'local-dev'}
        RETURNING payload
      `;
      return { character: updated[0]!.payload };
    });
  } finally {
    await sql.end({ timeout: 5 });
  }
}
