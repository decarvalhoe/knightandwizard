import type { Character, CharacterEquipmentItem } from '@knightandwizard/rules-core';
import { getClientApiBaseUrl } from '../../lib/api';

export class InventorySaveError extends Error {
  constructor(
    message: string,
    readonly conflict = false
  ) {
    super(message);
  }
}

export async function saveCharacterInventory(
  characterId: string,
  equipment: CharacterEquipmentItem[],
  expectedEquipment: CharacterEquipmentItem[]
): Promise<Character> {
  const items = (values: CharacterEquipmentItem[]) =>
    values.map(({ id, quantity }) => ({ id, quantity: quantity ?? 1 }));
  const response = await fetch(
    `${getClientApiBaseUrl()}/characters/${encodeURIComponent(characterId)}/equipment`,
    {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        equipment: items(equipment),
        expectedEquipment: items(expectedEquipment)
      })
    }
  );
  if (!response.ok)
    throw new InventorySaveError(
      response.status === 409
        ? 'L’inventaire a changé ailleurs. Rechargez la fiche avant de modifier.'
        : `Inventaire non enregistré (API HTTP ${response.status}).`,
      response.status === 409
    );
  const body = (await response.json()) as { character?: Character };
  if (!body.character || !Array.isArray(body.character.equipment))
    throw new InventorySaveError('Réponse inventaire incomplète.');
  return body.character;
}
