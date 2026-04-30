import {
  ATTRIBUTE_KEYS,
  calculateLevelProgression,
  calculateEffectiveAttributes,
  rollDice,
  type AttributeKey,
  type Character,
  type CharacterAttributes,
  type CharacterSkill,
  type DiceRollResult,
  type LevelProgression,
  type RandomInteger
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

export interface CharacterSheetView {
  attributes: CharacterAttributes;
  carriedWeightKg: number;
  creationBudget: CreationBudgetSummary;
  equippedWeapons: InventoryItem[];
  levelProgression: LevelProgression;
  mode: CharacterSheetMode;
  sections: CharacterSheetSection[];
  spellSummary: SpellSlotSummary;
}

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
  return {
    attributes: calculateEffectiveAttributes(input.character),
    carriedWeightKg: totalInventoryWeight(input.inventory),
    creationBudget: summarizeCreationBudget(input.character),
    equippedWeapons: input.inventory.filter((item) => item.category === 'weapon' && item.equipped),
    levelProgression: calculateLevelProgression(input.character),
    mode: input.mode,
    sections: sectionsByMode[input.mode].map((id) => ({ id, label: sectionLabels[id] })),
    spellSummary: summarizeSpellSlots(input.character, input.spells)
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
