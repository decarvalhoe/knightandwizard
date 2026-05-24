import {
  ATTRIBUTE_KEYS,
  createPlayerCharacter,
  type AttributeKey,
  type Character,
  type CharacterAttributes
} from '@knightandwizard/rules-core';

import { getApiBaseUrl, getCatalogDocument } from '@/lib/catalogs';

import {
  fromDraftSnapshot,
  previewCharacter,
  type DraftSnapshot
} from '../character-creation/model';
import {
  attributeLabels,
  buildCharacterCreationCatalogFromReadModels,
  toClassProfiles,
  toOrientationProfiles,
  toRaceProfiles,
  toSkillOptions,
  type RacesCatalogDocument,
  type ClassesCatalogDocument,
  type OrientationsCatalogDocument,
  type PotionsCatalogDocument,
  type ProtectionsCatalogDocument,
  type SkillsCatalogDocument,
  type SpellsCatalogDocument,
  type WeaponsCatalogDocument
} from '../character-creation/read-models';
import {
  buildEquipmentCatalog,
  buildInventory,
  buildInventoryFromCharacterEquipment,
  type EquipmentCatalogEntry,
  type InventoryItem,
  type SkillCatalogEntry,
  type SpellEntry
} from './model';

export interface CharacterSheetReadModel {
  attributeLabels: Record<AttributeKey, string>;
  attributeOrder: AttributeKey[];
  character: Character;
  dataSourceLabel: string;
  equipmentCatalog: EquipmentCatalogEntry[];
  initialInventory: InventoryItem[];
  skillCatalog: SkillCatalogEntry[];
  skillLabels: Record<string, string>;
  spells: SpellEntry[];
}

export interface CharacterSheetReadModelOptions {
  draftId?: string;
}

export async function getCharacterSheetReadModel(
  options: CharacterSheetReadModelOptions = {}
): Promise<CharacterSheetReadModel> {
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
  const draftSnapshot = options.draftId ? await getCharacterDraftSnapshot(options.draftId) : null;
  const creationCatalog = buildCharacterCreationCatalogFromReadModels({
    classes,
    orientations,
    potions,
    protections,
    races,
    skills,
    spells,
    weapons
  });
  const character = draftSnapshot
    ? previewCharacter(fromDraftSnapshot(draftSnapshot), creationCatalog)
    : buildActiveCharacter({ classes, orientations, races });
  const equipmentCatalog = buildEquipmentCatalog({ potions, protections, weapons });
  const skillCatalog = toSkillOptions(skills);
  const skillLabels = Object.fromEntries(skillCatalog.map((skill) => [skill.id, skill.label]));

  return {
    attributeLabels,
    attributeOrder: [...ATTRIBUTE_KEYS],
    character,
    dataSourceLabel: draftSnapshot ? 'Brouillon API' : 'Catalogues API',
    equipmentCatalog,
    initialInventory: draftSnapshot
      ? buildInventoryFromCharacterEquipment(character.equipment, equipmentCatalog)
      : buildInventory({ potions, protections, weapons }),
    skillCatalog,
    skillLabels,
    spells: draftSnapshot ? buildCharacterSpells(character, spells) : buildSpells(spells)
  };
}

async function getCharacterDraftSnapshot(draftId: string): Promise<DraftSnapshot | null> {
  const response = await fetch(
    `${getApiBaseUrl()}/character-drafts/${encodeURIComponent(draftId)}`,
    { cache: 'no-store' }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Unable to load character draft ${draftId}: HTTP ${response.status}`);
  }

  const body = (await response.json()) as CharacterDraftEnvelope;

  return {
    currentStep: body.currentStep,
    id: body.id,
    payload: body.payload,
    updatedAt: body.updatedAt
  };
}

interface CharacterDraftEnvelope extends DraftSnapshot {
  status?: 'found';
  userId?: string;
}

function buildActiveCharacter(input: {
  races: RacesCatalogDocument;
  classes: ClassesCatalogDocument;
  orientations: OrientationsCatalogDocument;
}) {
  const race = toRaceProfiles(input.races).find((entry) => entry.id === 'humain');
  const orientation = toOrientationProfiles(input.orientations).find(
    (entry) => entry.id === 'magicien'
  );
  const classProfile = toClassProfiles(input.classes).find((entry) => entry.id === 'enchanteur');

  if (!race || !orientation || !classProfile) {
    throw new Error(
      'Canonical character sheet seed requires humain, magicien and enchanteur read models.'
    );
  }

  return createPlayerCharacter({
    attributes: {
      aestheticism: 0,
      charisma: 3,
      dexterity: 3,
      empathy: 2,
      intelligence: 2,
      perception: 2,
      reflexes: 2,
      stamina: 3,
      strength: 3
    } satisfies CharacterAttributes,
    classProfile,
    id: 'pc-aveline',
    metadata: {
      deity: 'Les Trois Flammes',
      gmNotes: 'Surveiller la dette contractee aupres de la Guilde des Veilleurs.',
      psychology: 'calme, opiniatre',
      quote: 'La lame tranche, le mot engage.',
      reputation: 'Connue a Brumeval pour avoir contenu une breche mineure.'
    },
    modifiers: [{ id: 'disciplined-training', target: 'strength', value: 1 }],
    name: 'Aveline de Brumeval',
    orientation,
    race,
    skills: [
      { id: 'arcanologie', points: 4 },
      { id: 'epee-batarde', points: 4 },
      { id: 'frappe-a-la-tete', parentId: 'epee-batarde', points: 2 },
      { id: 'stoicisme', points: 2 },
      { id: 'commandement', points: 4 },
      { id: 'cuisine-corteganne', parentId: 'cuisine', points: 2 },
      { id: 'arcanologie-des-rituels', parentId: 'arcanologie', points: 2 }
    ],
    spells: [
      { id: 'bouclier', points: 1 },
      { id: 'boule-de-feu', points: 1 }
    ]
  });
}

function buildSpells(catalog: SpellsCatalogDocument): SpellEntry[] {
  const activeSpellIds = new Set(['bouclier', 'boule-de-feu']);

  return (catalog.spells ?? [])
    .filter((spell) => spell.id && spell.name && activeSpellIds.has(spell.id))
    .map((spell) => ({
      active: spell.id === 'bouclier',
      id: spell.id as string,
      name: spell.name as string,
      points: 1
    }));
}

function buildCharacterSpells(character: Character, catalog: SpellsCatalogDocument): SpellEntry[] {
  const namesById = new Map(
    (catalog.spells ?? [])
      .filter((spell) => spell.id && spell.name)
      .map((spell) => [spell.id as string, spell.name as string])
  );

  return character.spells.map((spell) => ({
    active: spell.id === 'bouclier',
    id: spell.id,
    name: namesById.get(spell.id) ?? spell.id,
    points: spell.points
  }));
}
