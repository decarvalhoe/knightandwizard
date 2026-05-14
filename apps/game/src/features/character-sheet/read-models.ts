import {
  ATTRIBUTE_KEYS,
  createPlayerCharacter,
  type AttributeKey,
  type CharacterAttributes
} from '@knightandwizard/rules-core';

import { getCatalogDocument } from '@/lib/catalogs';

import {
  attributeLabels,
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
import type { InventoryItem, SkillCatalogEntry, SpellEntry } from './model';

export interface CharacterSheetReadModel {
  attributeLabels: Record<AttributeKey, string>;
  attributeOrder: AttributeKey[];
  character: ReturnType<typeof createPlayerCharacter>;
  initialInventory: InventoryItem[];
  skillCatalog: SkillCatalogEntry[];
  skillLabels: Record<string, string>;
  spells: SpellEntry[];
}

export async function getCharacterSheetReadModel(): Promise<CharacterSheetReadModel> {
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
  const skillCatalog = toSkillOptions(skills);
  const skillLabels = Object.fromEntries(skillCatalog.map((skill) => [skill.id, skill.label]));

  return {
    attributeLabels,
    attributeOrder: [...ATTRIBUTE_KEYS],
    character: buildActiveCharacter({ classes, orientations, races }),
    initialInventory: buildInventory({ potions, protections, weapons }),
    skillCatalog,
    skillLabels,
    spells: buildSpells(spells)
  };
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

function buildInventory(input: {
  potions: PotionsCatalogDocument;
  protections: ProtectionsCatalogDocument;
  weapons: WeaponsCatalogDocument;
}): InventoryItem[] {
  const weapon = input.weapons.weapons?.find((entry) => entry.id === 'epee_batarde');
  const shield = input.protections.shields?.find((entry) => entry.id === 'bouclier_bois');
  const potion = input.potions.potions?.find((entry) => entry.id === 'potion_soin');

  const items: Array<InventoryItem | undefined> = [
    weapon
      ? {
          category: 'weapon',
          equipped: true,
          id: weapon.id as string,
          name: weapon.name as string,
          quantity: 1,
          weightKg: readWeightKg(weapon)
        }
      : undefined,
    shield
      ? {
          category: 'shield',
          equipped: true,
          id: shield.id as string,
          name: shield.name as string,
          quantity: 1,
          weightKg: readWeightKg(shield)
        }
      : undefined,
    potion
      ? {
          category: 'consumable',
          id: potion.id as string,
          name: potion.name as string,
          quantity: 2,
          weightKg: readWeightKg(potion)
        }
      : undefined
  ];

  return items.filter((item): item is InventoryItem => item !== undefined);
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

function readWeightKg(entry: unknown): number | undefined {
  if (typeof entry !== 'object' || entry === null) {
    return undefined;
  }

  const record = entry as Record<string, unknown>;
  const weight = record.weight_kg ?? record.weight_kg_human;
  return typeof weight === 'number' ? weight : undefined;
}
