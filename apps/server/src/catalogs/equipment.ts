import type {
  CatalogEntryStatus,
  Potion,
  PotionsCatalog,
  Protection,
  ProtectionsCatalog,
  SourceRef,
  Weapon,
  WeaponsCatalog
} from '@knightandwizard/catalogs';

export const EQUIPMENT_CATALOG_NAMES = ['armes.yaml', 'protections.yaml', 'potions.yaml'] as const;

export type EquipmentCatalogName = (typeof EQUIPMENT_CATALOG_NAMES)[number];
export type EquipmentInventoryCategory = 'armor' | 'consumable' | 'shield' | 'weapon';

export interface EquipmentProtectionProfile {
  C: number;
  E: number;
  P: number;
  T: number;
}

export interface EquipmentReadModelEntry {
  catalogStatus?: CatalogEntryStatus;
  category: EquipmentInventoryCategory;
  craftDifficulty?: number;
  craftSkill?: string;
  damageFormula?: string;
  damageType?: string | string[];
  difficulty?: number;
  effect?: string;
  handsRequired?: number;
  id: string;
  name: string;
  passChancePct?: number;
  pricePc?: number;
  protection?: EquipmentProtectionProfile;
  rawCategory?: string;
  sourceCatalog: EquipmentCatalogName;
  sourceRefs?: SourceRef[];
  weightKg?: number;
  zonesCovered?: string[];
}

export interface EquipmentInventoryReadModelInput {
  potions: PotionsCatalog;
  protections: ProtectionsCatalog;
  weapons: WeaponsCatalog;
}

export interface EquipmentInventoryTotals {
  armor: number;
  consumables: number;
  shields: number;
  total: number;
  weapons: number;
}

export function buildEquipmentInventoryReadModel(
  input: EquipmentInventoryReadModelInput
): EquipmentReadModelEntry[] {
  return [
    ...input.weapons.weapons.map(toWeaponEntry),
    ...input.protections.shields.map((entry) => toProtectionEntry(entry, 'shield')),
    ...input.protections.armor_pieces.map((entry) => toProtectionEntry(entry, 'armor')),
    ...input.potions.potions.map(toPotionEntry)
  ].filter((entry): entry is EquipmentReadModelEntry => entry !== undefined);
}

export function summarizeEquipmentInventory(
  entries: EquipmentReadModelEntry[]
): EquipmentInventoryTotals {
  const totals: EquipmentInventoryTotals = {
    armor: 0,
    consumables: 0,
    shields: 0,
    total: entries.length,
    weapons: 0
  };

  for (const entry of entries) {
    if (entry.category === 'armor') {
      totals.armor += 1;
    } else if (entry.category === 'consumable') {
      totals.consumables += 1;
    } else if (entry.category === 'shield') {
      totals.shields += 1;
    } else if (entry.category === 'weapon') {
      totals.weapons += 1;
    }
  }

  return totals;
}

function toWeaponEntry(entry: Weapon): EquipmentReadModelEntry | undefined {
  if (!isInventoryVisible(entry.status)) {
    return undefined;
  }

  return compactEntry({
    catalogStatus: entry.status,
    category: 'weapon',
    damageFormula: entry.damage_formula,
    damageType: entry.damage_type,
    difficulty: entry.difficulty,
    handsRequired: entry.hands_required,
    id: entry.id,
    name: entry.name,
    pricePc: readNumberField(entry, 'price_pc'),
    rawCategory: entry.category,
    sourceCatalog: 'armes.yaml',
    sourceRefs: entry.source_refs,
    weightKg: readWeightKg(entry)
  });
}

function toProtectionEntry(
  entry: Protection,
  category: Extract<EquipmentInventoryCategory, 'armor' | 'shield'>
): EquipmentReadModelEntry | undefined {
  if (!isInventoryVisible(entry.status)) {
    return undefined;
  }

  return compactEntry({
    catalogStatus: entry.status,
    category,
    id: entry.id,
    name: entry.name,
    passChancePct: readNumberField(entry, 'pass_chance_pct'),
    pricePc: readNumberField(entry, 'price_pc') ?? readNumberField(entry, 'price_pc_pair'),
    protection: entry.protection,
    rawCategory: entry.category,
    sourceCatalog: 'protections.yaml',
    sourceRefs: entry.source_refs,
    weightKg: entry.weight_kg_human,
    zonesCovered: readStringArrayField(entry, 'zones_covered')
  });
}

function toPotionEntry(entry: Potion): EquipmentReadModelEntry | undefined {
  if (!isInventoryVisible(entry.status)) {
    return undefined;
  }

  return compactEntry({
    catalogStatus: entry.status,
    category: 'consumable',
    craftDifficulty: readNestedNumberField(entry, 'craft_check', 'difficulty'),
    craftSkill: readNestedStringField(entry, 'craft_check', 'skill'),
    effect: entry.effect,
    id: entry.id,
    name: entry.name,
    pricePc: readNestedNumberField(entry, 'price', 'market_value_pc'),
    rawCategory: entry.category,
    sourceCatalog: 'potions.yaml',
    sourceRefs: entry.source_refs,
    weightKg: readWeightKg(entry)
  });
}

function isInventoryVisible(status: CatalogEntryStatus | undefined): boolean {
  return status === undefined || status === 'active';
}

function readWeightKg(entry: Record<string, unknown>): number | undefined {
  const weight = entry.weight_kg ?? entry.weight_kg_human;
  return typeof weight === 'number' ? weight : undefined;
}

function readNumberField(entry: Record<string, unknown>, key: string): number | undefined {
  const value = entry[key];
  return typeof value === 'number' ? value : undefined;
}

function readStringArrayField(entry: Record<string, unknown>, key: string): string[] | undefined {
  const value = entry[key];
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
    ? value
    : undefined;
}

function readNestedNumberField(
  entry: Record<string, unknown>,
  parentKey: string,
  key: string
): number | undefined {
  const parent = entry[parentKey];

  if (!isRecord(parent)) {
    return undefined;
  }

  return readNumberField(parent, key);
}

function readNestedStringField(
  entry: Record<string, unknown>,
  parentKey: string,
  key: string
): string | undefined {
  const parent = entry[parentKey];

  if (!isRecord(parent)) {
    return undefined;
  }

  const value = parent[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function compactEntry(entry: EquipmentReadModelEntry): EquipmentReadModelEntry {
  return Object.fromEntries(
    Object.entries(entry).filter(([, value]) => value !== undefined)
  ) as unknown as EquipmentReadModelEntry;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
