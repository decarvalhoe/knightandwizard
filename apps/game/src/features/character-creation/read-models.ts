import {
  ATTRIBUTE_KEYS,
  type AttributeKey,
  type CharacterAttributes,
  type CharacterClassProfile,
  type CharacterOrientationProfile,
  type RaceProfile
} from '@knightandwizard/rules-core';

import { getCatalogDocument } from '@/lib/catalogs';

import {
  createCreationDraft,
  type CharacterCreationCatalog,
  type CharacterCreationDraft
} from './model';

export const attributeLabels: Record<AttributeKey, string> = {
  aestheticism: 'Esthétisme',
  charisma: 'Charisme',
  dexterity: 'Dextérité',
  empathy: 'Empathie',
  intelligence: 'Intelligence',
  perception: 'Perception',
  reflexes: 'Réflexes',
  stamina: 'Vigueur',
  strength: 'Force'
};

export interface CharacterCreationReadModel {
  attributeLabels: Record<AttributeKey, string>;
  catalog: CharacterCreationCatalog;
}

export interface RacesCatalogDocument {
  races?: RaceCatalogEntry[];
}

export interface RaceCatalogEntry {
  attribute_max?: Partial<Record<AttributeKey, number>>;
  id?: string;
  name?: string;
  playable?: boolean;
  speed_factor_base?: number;
  status?: string;
  vitality_base?: number;
  will_factor_base?: number;
  xp_category?: number;
  innate_atouts?: string[];
}

export interface OrientationsCatalogDocument {
  orientations?: OrientationEntry[];
}

export interface OrientationEntry {
  id?: string;
  is_magical?: boolean;
  name?: string;
  status?: string;
}

export interface ClassesCatalogDocument {
  classes?: ClassEntry[];
}

export interface ClassEntry {
  id?: string;
  name?: string;
  orientation_id?: string;
  primary_skill_id?: string | null;
  status?: string;
}

export interface SkillsCatalogDocument {
  skills?: SkillEntry[];
}

export interface SkillEntry {
  id?: string;
  name?: string;
  parent_id?: string | null;
  status?: string;
}

export interface SpellsCatalogDocument {
  spells?: SpellEntry[];
}

export interface SpellEntry {
  id?: string;
  name?: string;
  status?: string;
}

export interface WeaponsCatalogDocument {
  weapons?: Array<{ id?: string; name?: string; status?: string }>;
}

export interface ProtectionsCatalogDocument {
  armor_pieces?: Array<{ id?: string; name?: string; status?: string }>;
  shields?: Array<{ id?: string; name?: string; status?: string }>;
}

export interface PotionsCatalogDocument {
  potions?: Array<{ id?: string; name?: string; status?: string }>;
}

export async function getCharacterCreationReadModel(): Promise<CharacterCreationReadModel> {
  const [races, orientations, classes, skills, spells, weapons, protections, potions] =
    await Promise.all([
      getCatalogDocument<RacesCatalogDocument>('races.yaml'),
      getCatalogDocument<OrientationsCatalogDocument>('orientations.yaml'),
      getCatalogDocument<ClassesCatalogDocument>('classes.yaml'),
      getCatalogDocument<SkillsCatalogDocument>('competences.yaml'),
      getCatalogDocument<SpellsCatalogDocument>('spells.yaml'),
      getCatalogDocument<WeaponsCatalogDocument>('armes.yaml'),
      getCatalogDocument<ProtectionsCatalogDocument>('protections.yaml'),
      getCatalogDocument<PotionsCatalogDocument>('potions.yaml')
    ]);

  return {
    attributeLabels,
    catalog: buildCharacterCreationCatalogFromReadModels({
      classes,
      orientations,
      races,
      potions,
      protections,
      skills,
      spells,
      weapons
    })
  };
}

export function buildCharacterCreationCatalogFromReadModels(input: {
  races: RacesCatalogDocument;
  classes: ClassesCatalogDocument;
  orientations: OrientationsCatalogDocument;
  potions: PotionsCatalogDocument;
  protections: ProtectionsCatalogDocument;
  skills: SkillsCatalogDocument;
  spells: SpellsCatalogDocument;
  weapons: WeaponsCatalogDocument;
}): CharacterCreationCatalog {
  const races = toRaceProfiles(input.races);

  return {
    assets: toRaceAssets(input.races),
    classes: toClassProfiles(input.classes),
    equipment: toEquipmentOptions(input.weapons, input.protections, input.potions),
    orientations: toOrientationProfiles(input.orientations),
    races,
    skills: toSkillOptions(input.skills),
    spells: toSpellOptions(input.spells)
  };
}

export function createDefaultCreationDraft(
  catalog: CharacterCreationCatalog
): CharacterCreationDraft {
  const defaultEquipmentIds = catalog.equipment[0] ? [catalog.equipment[0].id] : [];

  return createCreationDraft(catalog, {
    classId: catalog.classes.find((entry) => entry.id === 'garde')?.id ?? catalog.classes[0]?.id,
    equipmentIds: defaultEquipmentIds,
    id: 'draft-local',
    orientationId:
      catalog.orientations.find((entry) => entry.id === 'guerrier')?.id ??
      catalog.orientations[0]?.id,
    raceId: catalog.races.find((entry) => entry.id === 'humain')?.id ?? catalog.races[0]?.id
  });
}

export function toRaceProfiles(catalog: RacesCatalogDocument): RaceProfile[] {
  return (catalog.races ?? [])
    .filter(
      (entry) => entry.status === 'active' && entry.playable === true && entry.id && entry.name
    )
    .map((entry) => ({
      attributeMax: toAttributeMax(entry.attribute_max),
      category: entry.xp_category ?? 0,
      id: entry.id as string,
      name: cleanName(entry.name as string),
      speedFactor: entry.speed_factor_base ?? 0,
      vitality: entry.vitality_base ?? 0,
      willFactor: entry.will_factor_base ?? 0
    }));
}

export function toOrientationProfiles(
  catalog: OrientationsCatalogDocument
): CharacterOrientationProfile[] {
  return (catalog.orientations ?? [])
    .filter((entry) => entry.status === 'active' && entry.id && entry.name)
    .map((entry) => ({
      id: entry.id as string,
      isMagical: entry.is_magical === true,
      name: entry.name as string
    }));
}

export function toClassProfiles(catalog: ClassesCatalogDocument): CharacterClassProfile[] {
  return (catalog.classes ?? [])
    .filter((entry) => entry.status === 'active' && entry.id && entry.name && entry.orientation_id)
    .map((entry) => ({
      id: entry.id as string,
      name: entry.name as string,
      orientationId: entry.orientation_id as string,
      primarySkillIds: entry.primary_skill_id ? [entry.primary_skill_id] : []
    }));
}

export function toSkillOptions(catalog: SkillsCatalogDocument) {
  return (catalog.skills ?? [])
    .filter((entry) => entry.status === 'active' && entry.id && entry.name)
    .map((entry) => ({
      id: entry.id as string,
      label: entry.name as string,
      parentId: entry.parent_id ?? null
    }));
}

export function toSpellOptions(catalog: SpellsCatalogDocument) {
  return (catalog.spells ?? [])
    .filter((entry) => entry.status === 'active' && entry.id && entry.name)
    .map((entry) => ({ id: entry.id as string, label: entry.name as string }));
}

export function toEquipmentOptions(
  weapons: WeaponsCatalogDocument,
  protections: ProtectionsCatalogDocument,
  potions: PotionsCatalogDocument
) {
  return [
    ...(weapons.weapons ?? []).map((entry) => toEquipmentOption(entry)),
    ...(protections.shields ?? []).map((entry) => toEquipmentOption(entry)),
    ...(protections.armor_pieces ?? []).map((entry) => toEquipmentOption(entry)),
    ...(potions.potions ?? []).map((entry) => toEquipmentOption(entry))
  ].filter((entry): entry is { id: string; name: string } => entry !== null);
}

function toRaceAssets(catalog: RacesCatalogDocument) {
  return (catalog.races ?? []).flatMap((creature) =>
    (creature.innate_atouts ?? []).map((assetName) => ({
      id: `${creature.id ?? 'race'}-${slugify(assetName)}`,
      label: assetName,
      raceIds: creature.id ? [creature.id] : [],
      source: 'race' as const
    }))
  );
}

function toEquipmentOption(entry: { id?: string; name?: string; status?: string }) {
  if (!entry.id || !entry.name || (entry.status !== undefined && entry.status !== 'active')) {
    return null;
  }

  return { id: entry.id, name: entry.name };
}

function toAttributeMax(
  source: Partial<Record<AttributeKey, number>> | undefined
): CharacterAttributes {
  return Object.fromEntries(
    ATTRIBUTE_KEYS.map((key) => [key, Math.max(1, source?.[key] ?? 5)])
  ) as CharacterAttributes;
}

function cleanName(name: string): string {
  return name
    .replace(/,\s*-.*/, '')
    .replace(/\s*\/.*$/, '')
    .trim();
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
