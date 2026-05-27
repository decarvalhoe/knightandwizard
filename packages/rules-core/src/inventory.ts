/**
 * R-10 / R-10.10 — Inventory model (MVP "arcade" mode : flat list + cumulative weight, no containers).
 *
 * Three states model the "habillé de ville" play loop (cf. docs/plan/SURFACES.md, Fiche) :
 * - `worn`    : equipped/active right now (armor by zone, weapon in hand, clothes) — feeds combat AND weight ;
 * - `carried` : on the person but not equipped — counts toward weight ;
 * - `stored`  : off-person (chest, vault elsewhere) — does NOT count toward encumbrance.
 *
 * The carried weight feeds the encumbrance speed penalty (R-2.18, already in combat.ts via V2b).
 * Containers / extradimensional storage are out of scope for now.
 */
export type ItemState = 'worn' | 'carried' | 'stored';

export interface InventoryItem {
  /** Unique instance id. */
  id: string;
  /** Catalog item-type id (frozen reference — R-10.19 versioning). */
  typeId: string;
  /** Display name (snapshot from the catalog). */
  name?: string;
  /** Weight in kg of a single unit (fractional allowed). */
  weightKg: number;
  /** porté (worn) / transporté (carried) / rangé hors-personne (stored). */
  state: ItemState;
  /** Stack quantity (consumables, ammo, coins); defaults to 1. */
  quantity?: number;
}

const ON_PERSON_STATES: readonly ItemState[] = ['worn', 'carried'];

/**
 * R-10.10 — Total carried weight (kg) of everything on the person (worn + carried),
 * excluding items stored off-person. Convertible into `Combatant.carriedWeightKg`.
 */
export function carriedWeightKg(items: readonly InventoryItem[]): number {
  return items
    .filter((item) => ON_PERSON_STATES.includes(item.state))
    .reduce((sum, item) => {
      const quantity = item.quantity ?? 1;

      assertNonNegativeNumber('weightKg', item.weightKg);
      assertPositiveInteger('quantity', quantity);

      return sum + item.weightKg * quantity;
    }, 0);
}

/** Items currently worn/equipped — the loadout that feeds combat (protections by zone, weapon specs). */
export function wornItems(items: readonly InventoryItem[]): InventoryItem[] {
  return items.filter((item) => item.state === 'worn');
}

/**
 * Immutably change an item's state — the core "dressed for the moment" gesture
 * (worn ↔ carried ↔ stored).
 */
export function setItemState(
  items: readonly InventoryItem[],
  itemId: string,
  state: ItemState
): InventoryItem[] {
  return items.map((item) => (item.id === itemId ? { ...item, state } : item));
}

function assertNonNegativeNumber(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non-negative number`);
  }
}

function assertPositiveInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
}
