import {
  ATTRIBUTE_KEYS,
  calculateLevelProgression,
  calculateEffectiveAttributes,
  rollDice,
  summarizeEncumbrance,
  summarizeVitalityState,
  PREDILECTION_KINDS,
  type AttributeKey,
  type Character,
  type CharacterAttributes,
  type CharacterEquipmentItem,
  type CharacterSkill,
  type DiceRollResult,
  type LevelProgression,
  type PredilectionKind,
  type RandomInteger,
  type VitalityState
} from '@knightandwizard/rules-core';

export type CharacterSheetMode = 'combat' | 'complete' | 'gm' | 'social';

export type CharacterSheetSectionId =
  | 'active-spells'
  | 'attributes'
  | 'full-audit'
  | 'gm-controls'
  | 'gm-notes'
  | 'grimoire'
  | 'identity'
  | 'inventory'
  | 'relations'
  | 'reputation'
  | 'resources'
  | 'skills'
  | 'social-attributes'
  | 'states'
  | 'weapons';

export type InventoryCategory = 'armor' | 'consumable' | 'gear' | 'shield' | 'weapon';

export interface InventoryItem {
  category: InventoryCategory;
  equipped?: boolean;
  id: string;
  name: string;
  quantity: number;
  weightKg?: number;
}

/**
 * A selectable equipment option derived from the canonical catalogs
 * (armes/protections/potions). Used to populate the inventory picker so the UI
 * never offers invented items.
 */
export interface EquipmentCatalogEntry {
  category: InventoryCategory;
  id: string;
  name: string;
  weightKg?: number;
}

/**
 * Minimal shape of a catalog equipment entry as exposed by the catalog API
 * documents (armes/protections/potions). Only the fields the inventory consumes
 * are typed; the underlying read models carry the full canonical payload.
 */
export interface EquipmentCatalogEntryInput {
  id?: string;
  name?: string;
  status?: string;
  weight_kg?: number | string;
  weight_kg_human?: number;
}

export interface WeaponsEquipmentDocument {
  weapons?: EquipmentCatalogEntryInput[];
}

export interface ProtectionsEquipmentDocument {
  armor_pieces?: EquipmentCatalogEntryInput[];
  shields?: EquipmentCatalogEntryInput[];
}

export interface PotionsEquipmentDocument {
  potions?: EquipmentCatalogEntryInput[];
}

/**
 * Builds the canonical equipment picker list consumed by the inventory UI.
 *
 * Every entry is derived from the armes/protections/potions catalogs (no invented
 * product data). Entries are normalized into inventory categories so the sheet can
 * append them directly. Non-active entries are skipped when a status is present.
 */
export function buildEquipmentCatalog(input: {
  potions: PotionsEquipmentDocument;
  protections: ProtectionsEquipmentDocument;
  weapons: WeaponsEquipmentDocument;
}): EquipmentCatalogEntry[] {
  return [
    ...(input.weapons.weapons ?? []).map((entry) => toEquipmentCatalogEntry(entry, 'weapon')),
    ...(input.protections.shields ?? []).map((entry) => toEquipmentCatalogEntry(entry, 'shield')),
    ...(input.protections.armor_pieces ?? []).map((entry) =>
      toEquipmentCatalogEntry(entry, 'armor')
    ),
    ...(input.potions.potions ?? []).map((entry) => toEquipmentCatalogEntry(entry, 'consumable'))
  ].filter((entry): entry is EquipmentCatalogEntry => entry !== undefined);
}

/**
 * Seeds the inventory from explicit canonical catalog ids. When a seed id is
 * absent from the catalogs the slot is dropped rather than fabricated.
 */
export function buildInventory(input: {
  potions: PotionsEquipmentDocument;
  protections: ProtectionsEquipmentDocument;
  weapons: WeaponsEquipmentDocument;
}): InventoryItem[] {
  const weapon = input.weapons.weapons?.find((entry) => entry.id === 'epee_batarde');
  const shield = input.protections.shields?.find((entry) => entry.id === 'bouclier_bois');
  const potion = input.potions.potions?.find((entry) => entry.id === 'soin');

  const items: Array<InventoryItem | undefined> = [
    weapon
      ? {
          category: 'weapon',
          equipped: true,
          id: weapon.id as string,
          name: weapon.name as string,
          quantity: 1,
          weightKg: readEquipmentWeightKg(weapon)
        }
      : undefined,
    shield
      ? {
          category: 'shield',
          equipped: true,
          id: shield.id as string,
          name: shield.name as string,
          quantity: 1,
          weightKg: readEquipmentWeightKg(shield)
        }
      : undefined,
    potion
      ? {
          category: 'consumable',
          id: potion.id as string,
          name: potion.name as string,
          quantity: 2,
          weightKg: readEquipmentWeightKg(potion)
        }
      : undefined
  ];

  return items.filter((item): item is InventoryItem => item !== undefined);
}

export function buildInventoryFromCharacterEquipment(
  equipment: CharacterEquipmentItem[],
  catalog: EquipmentCatalogEntry[]
): InventoryItem[] {
  const catalogById = new Map(catalog.map((entry) => [entry.id, entry]));

  return equipment.map((item) => {
    const catalogEntry = catalogById.get(item.id);
    const category = catalogEntry?.category ?? 'gear';
    const equipped = ['armor', 'shield', 'weapon'].includes(category) ? true : undefined;

    return {
      category,
      ...(equipped ? { equipped } : {}),
      id: item.id,
      name: catalogEntry?.name ?? item.name ?? item.id,
      quantity: Math.max(1, item.quantity ?? 1),
      weightKg: catalogEntry?.weightKg
    };
  });
}

function toEquipmentCatalogEntry(
  entry: EquipmentCatalogEntryInput,
  category: InventoryCategory
): EquipmentCatalogEntry | undefined {
  if (!entry.id || !entry.name || (entry.status !== undefined && entry.status !== 'active')) {
    return undefined;
  }

  return {
    category,
    id: entry.id,
    name: entry.name,
    weightKg: readEquipmentWeightKg(entry)
  };
}

function readEquipmentWeightKg(entry: EquipmentCatalogEntryInput): number | undefined {
  const weight = entry.weight_kg ?? entry.weight_kg_human;
  return typeof weight === 'number' ? weight : undefined;
}

export interface SpellEntry {
  active?: boolean;
  id: string;
  name: string;
  points: number;
}

export interface SkillCatalogEntry {
  id: string;
  label: string;
  parentId?: string | null;
}

export interface CharacterSheetSection {
  id: CharacterSheetSectionId;
  label: string;
}

export interface CreationBudgetSummary {
  convertedSkillPoints: number;
  extraSpellPoints: number;
  freeSpellPoints: number;
  skillPointLimit: number;
  skillPointsSpent: number;
  spellPoints: number;
}

export interface CharacterEncumbranceView {
  /** Base (racial) speed factor before the load penalty. */
  baseSpeedFactor: number;
  /** Carrying capacity without penalty (kg) = Force × 5 (R-2.18). */
  capacityKg: number;
  carriedKg: number;
  /** Speed factor once the encumbrance penalty is added. */
  effectiveSpeedFactor: number;
  excessKg: number;
  overloaded: boolean;
  /** Extra DT added to the speed factor by the load (R-2.18). */
  penaltyDT: number;
}

export interface PredilectionRow {
  kind: PredilectionKind;
  label: string;
  values: string[];
}

export interface CharacterSheetView {
  attributes: CharacterAttributes;
  carriedWeightKg: number;
  creationBudget: CreationBudgetSummary;
  encumbrance: CharacterEncumbranceView;
  equippedWeapons: InventoryItem[];
  levelProgression: LevelProgression;
  mode: CharacterSheetMode;
  predilections: PredilectionRow[];
  sections: CharacterSheetSection[];
  spellSummary: SpellSlotSummary;
  vitalityState: VitalityState;
}

const predilectionLabels: Record<PredilectionKind, string> = {
  animaux: 'Animaux de prédilection',
  arme: 'Arme de prédilection',
  domaine: 'Domaine de prédilection',
  instrument: 'Instrument de prédilection',
  monture: 'Monture de prédilection'
};

export interface SpellSlotSummary {
  energyAvailable: number;
  knownSpells: number;
  pointsCommitted: number;
}

export interface AttributeRollResult extends DiceRollResult {
  attribute: AttributeKey;
  difficulty: number;
  pool: number;
}

export interface AttributeRollOutcomeLabel {
  id: 'critical-failure' | 'critical-success' | 'forced-failure';
  label: string;
  testId: string;
}

export interface SkillTreeRow extends CharacterSkill {
  depth: number;
  implicitParentId?: string;
  isImplicitZero: boolean;
  isInheritedPrimary: boolean;
  label?: string;
}

type SkillTreeNode = CharacterSkill & {
  isImplicitZero: boolean;
  label?: string;
};

const sectionLabels: Record<CharacterSheetSectionId, string> = {
  'active-spells': 'Sorts actifs',
  attributes: 'Attributs',
  'full-audit': 'Audit complet',
  'gm-controls': 'Contrôles MJ',
  'gm-notes': 'Notes privées',
  grimoire: 'Grimoire',
  identity: 'Identité',
  inventory: 'Inventaire',
  relations: 'Relations',
  reputation: 'Réputation',
  resources: 'Ressources',
  skills: 'Compétences',
  'social-attributes': 'Attributs sociaux',
  states: 'États',
  weapons: 'Armes équipées'
};

const sectionsByMode: Record<CharacterSheetMode, CharacterSheetSectionId[]> = {
  combat: ['resources', 'weapons', 'active-spells', 'states'],
  complete: ['identity', 'resources', 'attributes', 'skills', 'inventory', 'grimoire'],
  gm: ['identity', 'full-audit', 'gm-notes', 'gm-controls'],
  social: ['social-attributes', 'reputation', 'relations']
};

export const orderedAttributeKeys = ATTRIBUTE_KEYS;

export const socialAttributeKeys: AttributeKey[] = ['charisma', 'empathy', 'aestheticism'];

export function buildCharacterSheetView(input: {
  character: Character;
  inventory: InventoryItem[];
  mode: CharacterSheetMode;
  spells: SpellEntry[];
}): CharacterSheetView {
  const attributes = calculateEffectiveAttributes(input.character);
  const carriedWeightKg = totalInventoryWeight(input.inventory);

  return {
    attributes,
    carriedWeightKg,
    creationBudget: summarizeCreationBudget(input.character),
    encumbrance: buildEncumbranceView(input.character, attributes, carriedWeightKg),
    equippedWeapons: input.inventory.filter((item) => item.category === 'weapon' && item.equipped),
    levelProgression: calculateLevelProgression(input.character),
    mode: input.mode,
    predilections: buildPredilectionRows(input.character),
    sections: sectionsByMode[input.mode].map((id) => ({ id, label: sectionLabels[id] })),
    spellSummary: summarizeSpellSlots(input.character, input.spells),
    vitalityState: summarizeVitalityState(input.character.vitality)
  };
}

/**
 * Lists the character's predilection slots (R-6 / #140) for read-only display.
 * Only kinds with at least one chosen value are surfaced; changing them is an
 * MJ-validated action routed through the governance pipeline, not edited here.
 */
function buildPredilectionRows(character: Character): PredilectionRow[] {
  const slots = character.predilection;

  if (slots === undefined) {
    return [];
  }

  return PREDILECTION_KINDS.flatMap((kind) => {
    const values = slots[kind];

    if (values === undefined || values.length === 0) {
      return [];
    }

    return [{ kind, label: predilectionLabels[kind], values: [...values] }];
  });
}

/**
 * R-2.18 — Surfaces the equipment→encumbrance loop on the sheet: carried weight
 * vs capacity (Force × 5 kg), the resulting speed-factor penalty and the effective
 * speed factor. Uses the canonical rules-core helper so it never drifts from combat.
 */
function buildEncumbranceView(
  character: Character,
  attributes: CharacterAttributes,
  carriedWeightKg: number
): CharacterEncumbranceView {
  const summary = summarizeEncumbrance({ carriedWeightKg, strength: attributes.strength });

  return {
    baseSpeedFactor: character.speedFactor,
    capacityKg: summary.capacityKg,
    carriedKg: summary.carriedKg,
    effectiveSpeedFactor: character.speedFactor + summary.penaltyDT,
    excessKg: summary.excessKg,
    overloaded: summary.overloaded,
    penaltyDT: summary.penaltyDT
  };
}

export function rollAttributeCheck(
  character: Character,
  attribute: AttributeKey,
  difficulty: number,
  randomInteger?: RandomInteger
): AttributeRollResult {
  const effectiveAttributes = calculateEffectiveAttributes(character);
  const pool = effectiveAttributes[attribute];
  const result = rollDice(pool, difficulty, { randomInteger });

  return {
    ...result,
    attribute,
    difficulty,
    pool
  };
}

export function attributeRollOutcomeLabels(
  result: AttributeRollResult
): AttributeRollOutcomeLabel[] {
  const labels: AttributeRollOutcomeLabel[] = [];

  if (result.pool === 0) {
    labels.push({
      id: 'forced-failure',
      label: 'Échec automatique (attribut 0)',
      testId: 'last-roll-forced-failure'
    });
  }

  if (result.isCriticalSuccess) {
    labels.push({
      id: 'critical-success',
      label: 'Réussite critique',
      testId: 'last-roll-critical-success'
    });
  }

  if (result.isCriticalFailure) {
    const severity = result.criticalFailureSeverity;
    labels.push({
      id: 'critical-failure',
      label:
        typeof severity === 'number' ? `Échec critique · D100 = ${severity}` : 'Échec critique',
      testId: 'last-roll-critical-failure'
    });
  }

  return labels;
}

export function addInventoryItem(inventory: InventoryItem[], item: InventoryItem): InventoryItem[] {
  const existing = inventory.find((entry) => entry.id === item.id);

  if (!existing) {
    return [...inventory, normalizeInventoryItem(item)];
  }

  return inventory.map((entry) =>
    entry.id === item.id
      ? {
          ...entry,
          quantity: entry.quantity + Math.max(1, item.quantity)
        }
      : entry
  );
}

export function removeInventoryItem(
  inventory: InventoryItem[],
  itemId: string,
  quantity = 1
): InventoryItem[] {
  return inventory.flatMap((entry) => {
    if (entry.id !== itemId) {
      return [entry];
    }

    const nextQuantity = entry.quantity - Math.max(1, quantity);
    return nextQuantity > 0 ? [{ ...entry, quantity: nextQuantity }] : [];
  });
}

export function summarizeSpellSlots(character: Character, spells: SpellEntry[]): SpellSlotSummary {
  return {
    energyAvailable: character.energy.current,
    knownSpells: spells.length,
    pointsCommitted: spells.reduce((total, spell) => total + spell.points, 0)
  };
}

export function summarizeCreationBudget(character: Character): CreationBudgetSummary {
  const skillPointsSpent = sumEntryPoints(character.skills);
  const spellPoints = sumEntryPoints(character.spells);
  const freeSpellPoints = isMagicianCharacter(character) ? 2 : 0;
  const extraSpellPoints = Math.max(0, spellPoints - freeSpellPoints);
  const convertedSkillPoints = extraSpellPoints * 10;

  return {
    convertedSkillPoints,
    extraSpellPoints,
    freeSpellPoints,
    skillPointLimit: character.race.category - convertedSkillPoints,
    skillPointsSpent,
    spellPoints
  };
}

export function skillPoints(skills: CharacterSkill[], skillId: string): number {
  return skills.find((skill) => skill.id === skillId)?.points ?? 0;
}

export function skillTreeRows(
  skills: CharacterSkill[],
  catalog: SkillCatalogEntry[] = []
): SkillTreeRow[] {
  const rows: SkillTreeRow[] = [];
  const skillNodes = mergeSkillCatalogWithCharacterSkills(skills, catalog);
  const skillsById = new Map(skillNodes.map((skill) => [skill.id, skill]));
  const childrenByParentId = new Map<string, SkillTreeNode[]>();

  for (const skill of skillNodes) {
    if (!skill.parentId || !skillsById.has(skill.parentId)) {
      continue;
    }

    const siblings = childrenByParentId.get(skill.parentId) ?? [];
    siblings.push(skill);
    childrenByParentId.set(skill.parentId, siblings);
  }

  for (const skill of skillNodes) {
    if (skill.parentId && skillsById.has(skill.parentId)) {
      continue;
    }

    appendSkillTreeRows({
      childrenByParentId,
      depth: 0,
      inheritedPrimary: false,
      rows,
      skill,
      visited: new Set()
    });
  }

  return rows;
}

export function totalInventoryWeight(inventory: InventoryItem[]): number {
  return roundToTenth(
    inventory.reduce((total, item) => total + (item.weightKg ?? 0) * item.quantity, 0)
  );
}

function normalizeInventoryItem(item: InventoryItem): InventoryItem {
  return {
    ...item,
    quantity: Math.max(1, item.quantity)
  };
}

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

function sumEntryPoints(entries: Array<{ points: number }>): number {
  return entries.reduce((total, entry) => total + entry.points, 0);
}

function isMagicianCharacter(character: Character): boolean {
  return character.orientation.isMagical === true || character.orientation.id === 'magicien';
}

function mergeSkillCatalogWithCharacterSkills(
  skills: CharacterSkill[],
  catalog: SkillCatalogEntry[]
): SkillTreeNode[] {
  const skillById = new Map(skills.map((skill) => [skill.id, skill]));
  const nodesById = new Map<string, SkillTreeNode>();
  const orderedIds: string[] = [];

  function upsertNode(id: string, node: SkillTreeNode): void {
    if (!nodesById.has(id)) {
      orderedIds.push(id);
    }

    nodesById.set(id, node);
  }

  for (const entry of catalog) {
    const characterSkill = skillById.get(entry.id);

    upsertNode(entry.id, {
      id: entry.id,
      isImplicitZero: !characterSkill,
      isMain: characterSkill?.isMain,
      label: entry.label,
      parentId: entry.parentId ?? characterSkill?.parentId,
      points: characterSkill?.points ?? 0
    });
  }

  for (const skill of skills) {
    const existingNode = nodesById.get(skill.id);

    upsertNode(skill.id, {
      ...skill,
      isImplicitZero: false,
      label: existingNode?.label,
      parentId: existingNode?.parentId ?? skill.parentId
    });
  }

  return orderedIds.map((id) => nodesById.get(id)!);
}

function appendSkillTreeRows(input: {
  childrenByParentId: Map<string, SkillTreeNode[]>;
  depth: number;
  inheritedPrimary: boolean;
  rows: SkillTreeRow[];
  skill: SkillTreeNode;
  visited: Set<string>;
}): void {
  if (input.visited.has(input.skill.id)) {
    return;
  }

  const isInheritedPrimary = input.inheritedPrimary && !input.skill.isMain;
  const nextVisited = new Set(input.visited);
  nextVisited.add(input.skill.id);

  input.rows.push({
    ...input.skill,
    depth: input.depth,
    implicitParentId: input.depth === 0 && input.skill.parentId ? input.skill.parentId : undefined,
    isInheritedPrimary
  });

  const childInheritedPrimary = Boolean(input.skill.isMain || input.inheritedPrimary);
  const children = input.childrenByParentId.get(input.skill.id) ?? [];

  for (const child of children) {
    appendSkillTreeRows({
      childrenByParentId: input.childrenByParentId,
      depth: input.depth + 1,
      inheritedPrimary: childInheritedPrimary,
      rows: input.rows,
      skill: child,
      visited: nextVisited
    });
  }
}
