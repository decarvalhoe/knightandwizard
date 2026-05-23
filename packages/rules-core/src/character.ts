import { type Combatant } from './combat.js';
import { DEFAULT_RULES_CONFIG, type RulesConfig } from './rules-config.js';

export const ATTRIBUTE_KEYS = [
  'strength',
  'dexterity',
  'stamina',
  'reflexes',
  'perception',
  'intelligence',
  'charisma',
  'empathy',
  'aestheticism'
] as const;

export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

export type CharacterAttributes = Record<AttributeKey, number>;

export interface CharacterResource {
  current: number;
  max: number;
}

export interface RaceProfile {
  id: string;
  name: string;
  category: number;
  vitality: number;
  speedFactor: number;
  willFactor: number;
  attributeMax: CharacterAttributes;
}

export interface CharacterOrientationProfile {
  id: string;
  name: string;
  isMagical?: boolean;
}

export interface CharacterClassProfile {
  id: string;
  name: string;
  orientationId: string;
  primarySkillIds?: string[];
}

export interface CharacterSkill {
  id: string;
  points: number;
  isMain?: boolean;
  parentId?: string | null;
}

export interface CharacterSpell {
  id: string;
  points: number;
}

export interface CharacterEquipmentItem {
  id: string;
  name?: string;
  quantity?: number;
}

export type CharacterModifierTarget = AttributeKey | 'all_attributes';

export interface CharacterModifier {
  id: string;
  target: CharacterModifierTarget;
  value: number;
}

export interface CharacterValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  total: number;
}

export interface CharacterProgression {
  experiencePoints: number;
  experienceTotal: number;
  questPoints: number;
}

export interface CharacterBase {
  id: string;
  name: string;
  kind: 'player' | 'npc';
  /**
   * Ruleset version this character was built (or last migrated) under. Optional
   * to stay backward-compatible with characters persisted before versioning;
   * {@link createPlayerCharacter} / {@link createNonPlayerCharacter} stamp it
   * from the config they use and {@link migrateCharacter} updates it.
   */
  rulesVersion?: number;
  race: RaceProfile;
  orientation: CharacterOrientationProfile;
  classProfile: CharacterClassProfile;
  vitality: CharacterResource;
  energy: CharacterResource;
  speedFactor: number;
  willFactor: number;
  attributes: CharacterAttributes;
  skills: CharacterSkill[];
  spells: CharacterSpell[];
  equipment: CharacterEquipmentItem[];
  modifiers: CharacterModifier[];
  progression: CharacterProgression;
  metadata: Record<string, unknown>;
}

export interface PlayerCharacter extends CharacterBase {
  kind: 'player';
  userId?: string;
}

export interface NonPlayerCharacter extends CharacterBase {
  kind: 'npc';
  templateId?: string;
}

export type Character = PlayerCharacter | NonPlayerCharacter;

export interface CreatePlayerCharacterInput {
  id: string;
  name: string;
  userId?: string;
  race: RaceProfile;
  orientation: CharacterOrientationProfile;
  classProfile: CharacterClassProfile;
  attributes: CharacterAttributes;
  skills: CharacterSkill[];
  spells?: CharacterSpell[];
  equipment?: CharacterEquipmentItem[];
  modifiers?: CharacterModifier[];
  progression?: CharacterProgression;
  metadata?: Record<string, unknown>;
}

export interface CreateNonPlayerCharacterInput {
  id: string;
  name: string;
  templateId?: string;
  race: RaceProfile;
  orientation: CharacterOrientationProfile;
  classProfile: CharacterClassProfile;
  attributes: CharacterAttributes;
  vitality?: CharacterResource;
  energy?: CharacterResource;
  speedFactor?: number;
  willFactor?: number;
  skills?: CharacterSkill[];
  spells?: CharacterSpell[];
  equipment?: CharacterEquipmentItem[];
  modifiers?: CharacterModifier[];
  progression?: CharacterProgression;
  metadata?: Record<string, unknown>;
}

export interface LevelProgression {
  level: number | null;
  levelPoints: number | null;
  levelUpAt: number | null;
  primarySkillIds: string[];
}

export interface CharacterMigrationResult<T extends Character = Character> {
  /** A NEW character object stamped with the target ruleset version. */
  character: T;
  /** Human-readable record of every derived value that was recomputed. */
  changes: string[];
  /**
   * Human-readable record of preserved player choices that now violate the
   * target ruleset (e.g. a chosen value exceeding a lowered cap). These are
   * surfaced, never silently corrected.
   */
  warnings: string[];
}

export class CharacterValidationError extends Error {
  readonly errors: string[];
  readonly warnings: string[];

  constructor(errors: string[], warnings: string[] = []) {
    super(errors.join('; '));
    this.name = 'CharacterValidationError';
    this.errors = errors;
    this.warnings = warnings;
  }
}

export function validateAttributeDistribution(
  attributes: CharacterAttributes,
  race: RaceProfile,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): CharacterValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const total = sumAttributes(attributes);

  if (total !== race.category) {
    errors.push(`attribute points must total ${race.category} at creation`);
  }

  for (const key of ATTRIBUTE_KEYS) {
    const value = attributes[key];
    const maximumAtCreation = race.attributeMax[key] - config.creation.attributeMaxOffset;

    if (!Number.isInteger(value) || value < 0) {
      errors.push(`${key} must be a non-negative integer`);
      continue;
    }

    if (value > maximumAtCreation) {
      errors.push(`${key} cannot exceed ${maximumAtCreation} at creation for ${race.name}`);
    }

    if (value === 0) {
      warnings.push(
        `${key} is 0 at creation and cannot progress unless a rule explicitly unlocks it`
      );
    }
  }

  return buildValidationResult(errors, warnings, total);
}

export function validateSkillDistribution(
  skills: CharacterSkill[],
  raceCategory: number,
  extraSpellPoints = 0,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): CharacterValidationResult {
  const errors: string[] = [];
  const total = sumPoints(skills);
  const requiredSkillPoints =
    raceCategory - extraSpellPoints * config.creation.skillPointsPerSpellPoint;

  if (requiredSkillPoints < 0) {
    errors.push(`extra spell points cannot consume more than ${raceCategory} skill points`);
  }

  if (requiredSkillPoints >= 0 && total !== requiredSkillPoints) {
    errors.push(`skill points must total ${requiredSkillPoints} at creation`);
  }

  for (const skill of skills) {
    validatePointEntry('skill', skill, config.creation.maxSkillPointsAtCreation, errors);
  }

  return buildValidationResult(errors, [], total);
}

export function validateSpellDistribution(
  spells: CharacterSpell[],
  isMagician: boolean,
  extraSpellPoints = 0,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): CharacterValidationResult {
  const errors: string[] = [];
  const total = sumPoints(spells);
  const baseSpellPoints = config.creation.magicianBaseSpellPoints;
  const requiredSpellPoints = isMagician ? baseSpellPoints + extraSpellPoints : 0;

  if (!isMagician && total > 0) {
    errors.push('non-magician characters cannot receive spell points at creation');
  }

  if (isMagician && total < baseSpellPoints) {
    errors.push(`magician spell points must be at least ${baseSpellPoints} at creation`);
  }

  if (isMagician && total >= baseSpellPoints && total !== requiredSpellPoints) {
    errors.push(`magician spell points must total ${requiredSpellPoints} at creation`);
  }

  for (const spell of spells) {
    validatePointEntry('spell', spell, config.creation.maxSpellPointsAtCreation, errors);
  }

  return buildValidationResult(errors, [], total);
}

export function createPlayerCharacter(
  input: CreatePlayerCharacterInput,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): PlayerCharacter {
  const spells = input.spells ?? [];
  const magician = isMagicianOrientation(input.orientation, config);
  const spellTotal = sumPoints(spells);
  const extraSpellPoints = magician
    ? Math.max(0, spellTotal - config.creation.magicianBaseSpellPoints)
    : 0;
  const validationResults = [
    validateAttributeDistribution(input.attributes, input.race, config),
    validateSkillDistribution(input.skills, input.race.category, extraSpellPoints, config),
    validateSpellDistribution(spells, magician, extraSpellPoints, config)
  ];
  const errors = validationResults.flatMap((result) => result.errors);
  const warnings = validationResults.flatMap((result) => result.warnings);

  if (errors.length > 0) {
    throw new CharacterValidationError(errors, warnings);
  }

  const energy = magician
    ? {
        current: config.creation.magicianStartingEnergy,
        max: config.creation.magicianStartingEnergy
      }
    : { current: 0, max: 0 };

  return {
    id: input.id,
    name: input.name,
    kind: 'player',
    rulesVersion: config.version,
    userId: input.userId,
    race: input.race,
    orientation: input.orientation,
    classProfile: input.classProfile,
    vitality: {
      current: input.race.vitality,
      max: input.race.vitality
    },
    energy,
    speedFactor: input.race.speedFactor,
    willFactor: input.race.willFactor,
    attributes: { ...input.attributes },
    skills: input.skills.map(copySkill),
    spells: spells.map(copySpell),
    equipment: (input.equipment ?? []).map((item) => ({ ...item })),
    modifiers: (input.modifiers ?? []).map((modifier) => ({ ...modifier })),
    progression: copyProgression(input.progression),
    metadata: { ...(input.metadata ?? {}) }
  };
}

export function createNonPlayerCharacter(
  input: CreateNonPlayerCharacterInput,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): NonPlayerCharacter {
  const defaultEnergy = isMagicianOrientation(input.orientation, config)
    ? {
        current: config.creation.magicianStartingEnergy,
        max: config.creation.magicianStartingEnergy
      }
    : { current: 0, max: 0 };

  return {
    id: input.id,
    name: input.name,
    kind: 'npc',
    rulesVersion: config.version,
    templateId: input.templateId,
    race: input.race,
    orientation: input.orientation,
    classProfile: input.classProfile,
    vitality: input.vitality ?? {
      current: input.race.vitality,
      max: input.race.vitality
    },
    energy: input.energy ?? defaultEnergy,
    speedFactor: input.speedFactor ?? input.race.speedFactor,
    willFactor: input.willFactor ?? input.race.willFactor,
    attributes: { ...input.attributes },
    skills: (input.skills ?? []).map(copySkill),
    spells: (input.spells ?? []).map(copySpell),
    equipment: (input.equipment ?? []).map((item) => ({ ...item })),
    modifiers: (input.modifiers ?? []).map((modifier) => ({ ...modifier })),
    progression: copyProgression(input.progression),
    metadata: { ...(input.metadata ?? {}) }
  };
}

/**
 * Migrate a character onto a new ruleset version.
 *
 * The contract is deliberately conservative:
 * - DERIVED resources are recomputed (magician energy.max from the target
 *   config; energy.current is clamped down to the new max). Every change is
 *   recorded in `changes`.
 * - PLAYER CHOICES (attributes, skills, spells, equipment, modifiers) are
 *   PRESERVED verbatim.
 * - If a preserved choice now exceeds a target cap
 *   (maxSkillPointsAtCreation / maxSpellPointsAtCreation / the per-attribute
 *   creation cap derived from race.attributeMax - attributeMaxOffset), a
 *   warning is emitted but the value is NEVER truncated -- truncating would
 *   silently make a business decision.
 * - The returned `character` is a NEW object; the input is not mutated.
 */
export function migrateCharacter<T extends Character>(
  character: T,
  toConfig: RulesConfig = DEFAULT_RULES_CONFIG
): CharacterMigrationResult<T> {
  const changes: string[] = [];
  const warnings: string[] = [];

  // Deep-copy the resources we may recompute so the input stays untouched.
  const energy: CharacterResource = { ...character.energy };

  // Recompute derived resources: magician energy ceiling comes from the ruleset.
  if (isMagicianOrientation(character.orientation, toConfig)) {
    const newMax = toConfig.creation.magicianStartingEnergy;

    if (energy.max !== newMax) {
      changes.push(`energy.max recomputed from ${energy.max} to ${newMax}`);
      energy.max = newMax;
    }

    if (energy.current > energy.max) {
      changes.push(`energy.current clamped from ${energy.current} to ${energy.max}`);
      energy.current = energy.max;
    }
  }

  // Re-validate preserved player choices against the new caps (warn, never cut).
  for (const skill of character.skills) {
    if (skill.points > toConfig.creation.maxSkillPointsAtCreation) {
      warnings.push(
        `skill ${skill.id} has ${skill.points} points which exceeds the new creation cap of ` +
          `${toConfig.creation.maxSkillPointsAtCreation}; value preserved`
      );
    }
  }

  for (const spell of character.spells) {
    if (spell.points > toConfig.creation.maxSpellPointsAtCreation) {
      warnings.push(
        `spell ${spell.id} has ${spell.points} points which exceeds the new creation cap of ` +
          `${toConfig.creation.maxSpellPointsAtCreation}; value preserved`
      );
    }
  }

  for (const key of ATTRIBUTE_KEYS) {
    const value = character.attributes[key];
    const attributeMaxAtCreation =
      character.race.attributeMax[key] - toConfig.creation.attributeMaxOffset;

    if (value > attributeMaxAtCreation) {
      warnings.push(
        `attribute ${key} is ${value} which exceeds the new creation cap of ` +
          `${attributeMaxAtCreation} for ${character.race.name}; value preserved`
      );
    }
  }

  // Stamp the target ruleset version.
  changes.push(
    `rulesVersion stamped from ${character.rulesVersion ?? 'unset'} to ${toConfig.version}`
  );

  const migrated: T = {
    ...character,
    energy,
    rulesVersion: toConfig.version
  };

  return { character: migrated, changes, warnings };
}

export function calculateEffectiveAttributes(character: Character): CharacterAttributes {
  const effective = { ...character.attributes };

  for (const modifier of character.modifiers) {
    if (modifier.target === 'all_attributes') {
      for (const key of ATTRIBUTE_KEYS) {
        effective[key] = clampMinZero(effective[key] + modifier.value);
      }
      continue;
    }

    effective[modifier.target] = clampMinZero(effective[modifier.target] + modifier.value);
  }

  return effective;
}

export function calculateLevelProgression(
  character: Character,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): LevelProgression {
  if (isFamiliarRace(character.race, config)) {
    return {
      level: null,
      levelPoints: null,
      levelUpAt: null,
      primarySkillIds: []
    };
  }

  const primarySkillIds = isMagicianOrientation(character.orientation, config)
    ? []
    : collectPrimarySkillIds(character);
  const levelPoints = isMagicianOrientation(character.orientation, config)
    ? sumPoints(character.skills) +
      sumPoints(character.spells) * config.progression.magicianLevelSpellMultiplier
    : sumPoints(character.skills) + sumPrimaryTreePoints(character.skills, primarySkillIds);

  return {
    level: Math.floor(levelPoints / character.race.category),
    levelPoints,
    levelUpAt: (Math.floor(levelPoints / character.race.category) + 1) * character.race.category,
    primarySkillIds
  };
}

export function toCombatant(character: Character): Combatant {
  const attributes = calculateEffectiveAttributes(character);

  return {
    id: character.id,
    name: character.name,
    speedFactor: character.speedFactor,
    nextActionAt: 0,
    reflexes: attributes.reflexes,
    vitality: { ...character.vitality },
    attributes: {
      strength: attributes.strength,
      dexterity: attributes.dexterity,
      stamina: attributes.stamina
    },
    baseAttributes: {
      strength: character.attributes.strength,
      dexterity: character.attributes.dexterity,
      stamina: character.attributes.stamina
    },
    skills: Object.fromEntries(character.skills.map((skill) => [skill.id, skill.points])),
    statuses: []
  };
}

function buildValidationResult(
  errors: string[],
  warnings: string[],
  total: number
): CharacterValidationResult {
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    total
  };
}

function validatePointEntry(
  label: 'skill' | 'spell',
  entry: CharacterSkill | CharacterSpell,
  maxPoints: number,
  errors: string[]
): void {
  if (!Number.isInteger(entry.points) || entry.points < 0) {
    errors.push(`${entry.id} must have non-negative integer ${label} points`);
    return;
  }

  if (entry.points > maxPoints) {
    errors.push(`${entry.id} cannot exceed ${maxPoints} points at creation`);
  }
}

function sumAttributes(attributes: CharacterAttributes): number {
  return ATTRIBUTE_KEYS.reduce((total, key) => total + attributes[key], 0);
}

function sumPoints(entries: Array<{ points: number }>): number {
  return entries.reduce((total, entry) => total + entry.points, 0);
}

export function isMagicianOrientation(
  orientation: CharacterOrientationProfile,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): boolean {
  return (
    orientation.isMagical === true ||
    configuredIdMatches(orientation.id, config.creation.magicianOrientationIds)
  );
}

export function isFamiliarRace(
  race: RaceProfile,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): boolean {
  return configuredIdMatches(race.id, config.creation.familiarRaceIds);
}

function configuredIdMatches(id: string, configuredIds: string[]): boolean {
  const normalizedId = id.toLowerCase();
  return configuredIds.some((configuredId) => configuredId.toLowerCase() === normalizedId);
}

function collectPrimarySkillIds(character: Character): string[] {
  const primarySkillIds = new Set<string>();

  for (const skillId of character.classProfile.primarySkillIds ?? []) {
    primarySkillIds.add(skillId);
  }

  for (const skill of character.skills) {
    if (skill.isMain) {
      primarySkillIds.add(skill.id);
    }
  }

  return [...primarySkillIds];
}

function sumPrimaryTreePoints(skills: CharacterSkill[], primarySkillIds: string[]): number {
  const skillMap = new Map(skills.map((skill) => [skill.id, skill]));
  const childrenByParentId = new Map<string, CharacterSkill[]>();

  for (const skill of skills) {
    if (!skill.parentId) {
      continue;
    }

    const siblings = childrenByParentId.get(skill.parentId) ?? [];
    siblings.push(skill);
    childrenByParentId.set(skill.parentId, siblings);
  }

  const primaryTreeIds = new Set<string>();
  const pending = [...primarySkillIds];

  while (pending.length > 0) {
    const skillId = pending.pop();

    if (!skillId || primaryTreeIds.has(skillId)) {
      continue;
    }

    primaryTreeIds.add(skillId);

    for (const child of childrenByParentId.get(skillId) ?? []) {
      pending.push(child.id);
    }
  }

  let total = 0;

  for (const skillId of primaryTreeIds) {
    total += skillMap.get(skillId)?.points ?? 0;
  }

  return total;
}

function clampMinZero(value: number): number {
  return Math.max(0, value);
}

function copySkill(skill: CharacterSkill): CharacterSkill {
  return { ...skill };
}

function copySpell(spell: CharacterSpell): CharacterSpell {
  return { ...spell };
}

function copyProgression(progression?: CharacterProgression): CharacterProgression {
  return {
    experiencePoints: progression?.experiencePoints ?? 0,
    experienceTotal: progression?.experienceTotal ?? 0,
    questPoints: progression?.questPoints ?? 0
  };
}
