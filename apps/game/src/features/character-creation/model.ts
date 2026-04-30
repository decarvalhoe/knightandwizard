import {
  ATTRIBUTE_KEYS,
  createPlayerCharacter,
  validateAttributeDistribution,
  validateSkillDistribution,
  validateSpellDistribution,
  type AttributeKey,
  type Character,
  type CharacterAttributes,
  type CharacterClassProfile,
  type CharacterEquipmentItem,
  type CharacterOrientationProfile,
  type CharacterSkill,
  type CharacterSpell,
  type CharacterValidationResult,
  type RaceProfile
} from '@knightandwizard/rules-core';

export type CharacterCreationStepId =
  | 'identity'
  | 'attributes'
  | 'path'
  | 'spells'
  | 'skills'
  | 'assets'
  | 'equipment'
  | 'story'
  | 'review';

export interface CharacterCreationStep {
  id: CharacterCreationStepId;
  label: string;
}

export interface CharacterCreationAsset {
  classIds?: string[];
  id: string;
  label: string;
  orientationIds?: string[];
  raceIds?: string[];
  source: 'class' | 'orientation' | 'race';
}

export interface CharacterCreationSkillOption {
  id: string;
  label: string;
  parentId?: string | null;
}

export interface CharacterCreationSpellOption {
  id: string;
  label: string;
}

export interface CharacterCreationEquipmentOption {
  id: string;
  name: string;
}

export interface CharacterCreationCatalog {
  assets: CharacterCreationAsset[];
  classes: CharacterClassProfile[];
  equipment: CharacterCreationEquipmentOption[];
  orientations: CharacterOrientationProfile[];
  races: RaceProfile[];
  skills: CharacterCreationSkillOption[];
  spells: CharacterCreationSpellOption[];
}

export interface CharacterCreationDraft {
  attributes: CharacterAttributes;
  background: string;
  classId: string;
  currentStep: CharacterCreationStepId;
  deity: string;
  equipmentIds: string[];
  extraSpellPoints: number;
  genderId: string;
  id: string;
  name: string;
  orientationId: string;
  psychology: string;
  quote: string;
  raceId: string;
  skills: CharacterSkill[];
  spells: CharacterSpell[];
}

export interface DraftSnapshot {
  currentStep: CharacterCreationStepId;
  id: string;
  payload: Omit<CharacterCreationDraft, 'currentStep' | 'id'>;
  updatedAt: string;
}

export interface CreationBudget {
  convertedToSpells: number;
  limit: number;
  spent: number;
}

export interface SpellCreationBudget {
  extraPoints: number;
  freePoints: number;
  requiredPoints: number;
  spent: number;
}

export interface AttributeCreationBudget {
  limit: number;
  remaining: number;
  spent: number;
}

export interface StepValidation {
  errors: string[];
  valid: boolean;
  warnings: string[];
}

export interface CharacterCreationView {
  attributeBudget: AttributeCreationBudget;
  availableClasses: CharacterClassProfile[];
  canSubmit: boolean;
  completedStepIds: CharacterCreationStepId[];
  grantedAssets: CharacterCreationAsset[];
  selectedClass?: CharacterClassProfile;
  selectedOrientation?: CharacterOrientationProfile;
  selectedRace?: RaceProfile;
  skillBudget: CreationBudget;
  spellBudget: SpellCreationBudget;
  stepValidations: Record<CharacterCreationStepId, StepValidation>;
}

export const CREATION_STEPS: CharacterCreationStep[] = [
  { id: 'identity', label: 'Identite' },
  { id: 'attributes', label: 'Aptitudes' },
  { id: 'path', label: 'Voie' },
  { id: 'spells', label: 'Sorts' },
  { id: 'skills', label: 'Competences' },
  { id: 'assets', label: 'Atouts' },
  { id: 'equipment', label: 'Equipement' },
  { id: 'story', label: 'Historique' },
  { id: 'review', label: 'Validation' }
];

export const ATTRIBUTE_CREATION_ORDER = ATTRIBUTE_KEYS;

const zeroAttributes = Object.fromEntries(
  ATTRIBUTE_KEYS.map((key) => [key, 0])
) as CharacterAttributes;

export function createCreationDraft(
  catalog: CharacterCreationCatalog,
  overrides: Partial<CharacterCreationDraft> = {}
): CharacterCreationDraft {
  const raceId = overrides.raceId ?? catalog.races[0]?.id ?? '';
  const orientationId = overrides.orientationId ?? catalog.orientations[0]?.id ?? '';
  const classId =
    overrides.classId ??
    catalog.classes.find((classProfile) => classProfile.orientationId === orientationId)?.id ??
    catalog.classes[0]?.id ??
    '';

  return {
    attributes: { ...zeroAttributes, ...(overrides.attributes ?? {}) },
    background: overrides.background ?? '',
    classId,
    currentStep: overrides.currentStep ?? 'identity',
    deity: overrides.deity ?? '',
    equipmentIds: [...(overrides.equipmentIds ?? [])],
    extraSpellPoints: overrides.extraSpellPoints ?? 0,
    genderId: overrides.genderId ?? 'unspecified',
    id: overrides.id ?? 'draft-local',
    name: overrides.name ?? '',
    orientationId,
    psychology: overrides.psychology ?? '',
    quote: overrides.quote ?? '',
    raceId,
    skills: (overrides.skills ?? []).map(copySkill),
    spells: (overrides.spells ?? []).map(copySpell)
  };
}

export function buildCreationView(
  draft: CharacterCreationDraft,
  catalog: CharacterCreationCatalog
): CharacterCreationView {
  const selectedRace = findRace(draft, catalog);
  const selectedOrientation = findOrientation(draft, catalog);
  const selectedClass = findClass(draft, catalog);
  const availableClasses = getAvailableClasses(draft, catalog);
  const grantedAssets = getGrantedAssets(draft, catalog);
  const attributeBudget = {
    limit: selectedRace?.category ?? 0,
    remaining: (selectedRace?.category ?? 0) - sumAttributePoints(draft.attributes),
    spent: sumAttributePoints(draft.attributes)
  };
  const skillBudget = buildSkillBudget(draft, selectedRace, selectedOrientation);
  const spellBudget = buildSpellBudget(draft, selectedOrientation);
  const stepValidations = Object.fromEntries(
    CREATION_STEPS.map((step) => [step.id, validateCreationStep(draft, catalog, step.id)])
  ) as Record<CharacterCreationStepId, StepValidation>;
  const canSubmit = CREATION_STEPS.every((step) => stepValidations[step.id].valid);
  const completedStepIds = CREATION_STEPS.filter((step) => stepValidations[step.id].valid).map(
    (step) => step.id
  );

  return {
    attributeBudget,
    availableClasses,
    canSubmit,
    completedStepIds,
    grantedAssets,
    selectedClass,
    selectedOrientation,
    selectedRace,
    skillBudget,
    spellBudget,
    stepValidations
  };
}

export function validateCreationStep(
  draft: CharacterCreationDraft,
  catalog: CharacterCreationCatalog,
  stepId: CharacterCreationStepId
): StepValidation {
  const race = findRace(draft, catalog);
  const orientation = findOrientation(draft, catalog);
  const classProfile = findClass(draft, catalog);
  const magician = isMagician(orientation);

  switch (stepId) {
    case 'identity':
      return fromErrors([
        ...required(Boolean(draft.name.trim()), 'character name is required'),
        ...required(Boolean(race), 'race is required')
      ]);
    case 'attributes':
      return race
        ? fromRulesResult(validateAttributeDistribution(draft.attributes, race))
        : missingRace();
    case 'path':
      return fromErrors([
        ...required(Boolean(orientation), 'orientation is required'),
        ...required(Boolean(classProfile), 'class is required'),
        ...required(
          !classProfile || classProfile.orientationId === draft.orientationId,
          'class must belong to selected orientation'
        )
      ]);
    case 'spells':
      return fromRulesResult(
        validateSpellDistribution(
          magician ? draft.spells : [],
          magician,
          magician ? draft.extraSpellPoints : 0
        )
      );
    case 'skills':
      return race
        ? fromRulesResult(
            validateSkillDistribution(
              draft.skills,
              race.category,
              magician ? draft.extraSpellPoints : 0
            )
          )
        : missingRace();
    case 'assets':
    case 'equipment':
    case 'story':
      return fromErrors([]);
    case 'review':
      return validateFinalPreview(draft, catalog);
  }
}

export function previewCharacter(
  draft: CharacterCreationDraft,
  catalog: CharacterCreationCatalog
): Character {
  const race = requireSelection(findRace(draft, catalog), 'race');
  const orientation = requireSelection(findOrientation(draft, catalog), 'orientation');
  const classProfile = requireSelection(findClass(draft, catalog), 'class');
  const primarySkillIds = new Set(classProfile.primarySkillIds ?? []);
  const equipment = draft.equipmentIds.map((equipmentId): CharacterEquipmentItem => {
    const option = catalog.equipment.find((entry) => entry.id === equipmentId);

    return {
      id: equipmentId,
      name: option?.name,
      quantity: 1
    };
  });

  return createPlayerCharacter({
    attributes: draft.attributes,
    classProfile,
    equipment,
    id: draft.id,
    metadata: {
      assets: getGrantedAssets(draft, catalog).map((asset) => asset.id),
      background: draft.background,
      deity: draft.deity,
      genderId: draft.genderId,
      psychology: draft.psychology,
      quote: draft.quote
    },
    name: draft.name.trim(),
    orientation,
    race,
    skills: draft.skills.map((skill) => ({
      ...copySkill(skill),
      isMain: skill.isMain ?? primarySkillIds.has(skill.id)
    })),
    spells: draft.spells.map(copySpell)
  });
}

export function getAvailableClasses(
  draft: CharacterCreationDraft,
  catalog: CharacterCreationCatalog
): CharacterClassProfile[] {
  return catalog.classes.filter(
    (classProfile) => classProfile.orientationId === draft.orientationId
  );
}

export function getGrantedAssets(
  draft: CharacterCreationDraft,
  catalog: CharacterCreationCatalog
): CharacterCreationAsset[] {
  return catalog.assets.filter((asset) => {
    if (asset.source === 'race') {
      return asset.raceIds?.includes(draft.raceId) ?? false;
    }

    if (asset.source === 'orientation') {
      return asset.orientationIds?.includes(draft.orientationId) ?? false;
    }

    return asset.classIds?.includes(draft.classId) ?? false;
  });
}

export function setAttributePoints(
  draft: CharacterCreationDraft,
  attribute: AttributeKey,
  points: number
): CharacterCreationDraft {
  return {
    ...draft,
    attributes: {
      ...draft.attributes,
      [attribute]: normalizePoints(points)
    }
  };
}

export function setExtraSpellPoints(
  draft: CharacterCreationDraft,
  extraSpellPoints: number
): CharacterCreationDraft {
  return {
    ...draft,
    extraSpellPoints: normalizePoints(extraSpellPoints)
  };
}

export function setSkillPoints(
  draft: CharacterCreationDraft,
  skillId: string,
  points: number,
  parentId?: string | null
): CharacterCreationDraft {
  return {
    ...draft,
    skills: setPointEntry(draft.skills, { id: skillId, parentId, points: normalizePoints(points) })
  };
}

export function setSpellPoints(
  draft: CharacterCreationDraft,
  spellId: string,
  points: number
): CharacterCreationDraft {
  return {
    ...draft,
    spells: setPointEntry(draft.spells, { id: spellId, points: normalizePoints(points) })
  };
}

export function toDraftSnapshot(draft: CharacterCreationDraft): DraftSnapshot {
  const { currentStep, id, ...payload } = draft;

  return {
    currentStep,
    id,
    payload,
    updatedAt: new Date().toISOString()
  };
}

export function fromDraftSnapshot(snapshot: DraftSnapshot): CharacterCreationDraft {
  return {
    ...snapshot.payload,
    currentStep: snapshot.currentStep,
    id: snapshot.id
  };
}

function validateFinalPreview(
  draft: CharacterCreationDraft,
  catalog: CharacterCreationCatalog
): StepValidation {
  const priorStepErrors = CREATION_STEPS.filter((step) => step.id !== 'review').flatMap(
    (step) => validateCreationStep(draft, catalog, step.id).errors
  );

  if (priorStepErrors.length > 0) {
    return fromErrors(priorStepErrors);
  }

  try {
    previewCharacter(draft, catalog);
    return fromErrors([]);
  } catch (error: unknown) {
    return fromErrors([error instanceof Error ? error.message : 'character preview failed']);
  }
}

function buildSkillBudget(
  draft: CharacterCreationDraft,
  race: RaceProfile | undefined,
  orientation: CharacterOrientationProfile | undefined
): CreationBudget {
  const convertedToSpells = isMagician(orientation) ? draft.extraSpellPoints * 10 : 0;
  const raceCategory = race?.category ?? 0;

  return {
    convertedToSpells,
    limit: raceCategory - convertedToSpells,
    spent: sumPoints(draft.skills)
  };
}

function buildSpellBudget(
  draft: CharacterCreationDraft,
  orientation: CharacterOrientationProfile | undefined
): SpellCreationBudget {
  const freePoints = isMagician(orientation) ? 2 : 0;
  const extraPoints = isMagician(orientation) ? draft.extraSpellPoints : 0;

  return {
    extraPoints,
    freePoints,
    requiredPoints: freePoints + extraPoints,
    spent: sumPoints(draft.spells)
  };
}

function findRace(
  draft: CharacterCreationDraft,
  catalog: CharacterCreationCatalog
): RaceProfile | undefined {
  return catalog.races.find((race) => race.id === draft.raceId);
}

function findOrientation(
  draft: CharacterCreationDraft,
  catalog: CharacterCreationCatalog
): CharacterOrientationProfile | undefined {
  return catalog.orientations.find((orientation) => orientation.id === draft.orientationId);
}

function findClass(
  draft: CharacterCreationDraft,
  catalog: CharacterCreationCatalog
): CharacterClassProfile | undefined {
  return catalog.classes.find((classProfile) => classProfile.id === draft.classId);
}

function fromRulesResult(result: CharacterValidationResult): StepValidation {
  return {
    errors: result.errors,
    valid: result.valid,
    warnings: result.warnings
  };
}

function fromErrors(errors: string[], warnings: string[] = []): StepValidation {
  return {
    errors,
    valid: errors.length === 0,
    warnings
  };
}

function required(condition: boolean, message: string): string[] {
  return condition ? [] : [message];
}

function missingRace(): StepValidation {
  return fromErrors(['race is required']);
}

function requireSelection<T>(selection: T | undefined, name: string): T {
  if (!selection) {
    throw new Error(`${name} is required`);
  }

  return selection;
}

function isMagician(orientation: CharacterOrientationProfile | undefined): boolean {
  return orientation?.isMagical === true || orientation?.id === 'magician';
}

function setPointEntry<TEntry extends { id: string; points: number }>(
  entries: TEntry[],
  nextEntry: TEntry
): TEntry[] {
  const nextEntries = entries.filter((entry) => entry.id !== nextEntry.id);

  if (nextEntry.points <= 0) {
    return nextEntries;
  }

  return [...nextEntries, nextEntry];
}

function normalizePoints(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function sumPoints(entries: Array<{ points: number }>): number {
  return entries.reduce((total, entry) => total + entry.points, 0);
}

function sumAttributePoints(attributes: CharacterAttributes): number {
  return ATTRIBUTE_KEYS.reduce((total, attribute) => total + attributes[attribute], 0);
}

function copySkill(skill: CharacterSkill): CharacterSkill {
  return {
    ...skill
  };
}

function copySpell(spell: CharacterSpell): CharacterSpell {
  return {
    ...spell
  };
}
