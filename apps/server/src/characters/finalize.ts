import {
  loadValidatedCatalog,
  type ClassesCatalog,
  type OrientationsCatalog,
  type PotionsCatalog,
  type ProtectionsCatalog,
  type RacesCatalog,
  type WeaponsCatalog
} from '@knightandwizard/catalogs';
import {
  ATTRIBUTE_KEYS,
  createPlayerCharacter,
  type AttributeKey,
  type Character,
  type CharacterAttributes,
  type CharacterClassProfile,
  type CharacterEquipmentItem,
  type CharacterOrientationProfile,
  type CharacterSkill,
  type CharacterSpell,
  type CombatStatus,
  type RaceProfile,
  gainXP
} from '@knightandwizard/rules-core';
import { and, eq, sql as drizzleSql } from 'drizzle-orm';
import { z } from 'zod';
import { createDbClient, createSqlClient } from '../db/client.js';
import { characterDrafts, characters } from '../db/schema.js';

export class CharacterDraftNotFoundError extends Error {
  constructor(draftId: string) {
    super(`Character draft not found: ${draftId}`);
    this.name = 'CharacterDraftNotFoundError';
  }
}

export class CharacterNotFoundError extends Error {
  constructor(characterId: string) {
    super(`Character not found: ${characterId}`);
    this.name = 'CharacterNotFoundError';
  }
}

export interface CharacterPersistenceResult {
  character: Character;
}

export interface CharacterActiveSpellReadModel {
  activeSpellId: string;
  castAtNarrativeSeconds: number;
  castAtSequence: number;
  characterId: string;
  durationAmount: number;
  durationUnit: string;
  expiresAtCombatDt?: number;
  expiresAtNarrativeSeconds?: number;
  sourceCasterId?: string;
  spellId?: string;
  status: string;
  successesCount?: number;
  sessionSlug: string;
}

export interface CharacterPersistenceScope {
  userId?: string;
}

export interface CharacterCombatStateUpdate {
  sessionSlug?: string;
  statuses?: CombatStatus[];
  vitality?: {
    current?: number;
    max?: number;
  };
}

export interface CharacterXpAwardUpdate {
  actorId?: string;
  amount: number;
  questPoints?: number;
  reason?: string;
  sessionSlug?: string;
}

interface CharacterCreationCatalog {
  classes: CharacterClassProfile[];
  equipment: Array<{ id: string; name: string }>;
  orientations: CharacterOrientationProfile[];
  races: RaceProfile[];
}

interface CharacterActiveSpellRow {
  active_spell_id: string;
  cast_at_narrative_seconds: number | string;
  cast_at_sequence: number;
  character_id: string;
  duration_amount: number | string;
  duration_unit: string;
  expires_at_combat_dt: null | number;
  expires_at_narrative_seconds: null | number | string;
  session_slug: string;
  source_caster_id: null | string;
  spell_id: null | string;
  status: string;
  successes_count: null | number;
}

interface CharacterCreationDraftSnapshot {
  currentStep: CharacterCreationStepId;
  id: string;
  payload: CharacterCreationDraftPayload;
}

type CharacterCreationStepId =
  | 'identity'
  | 'attributes'
  | 'path'
  | 'spells'
  | 'skills'
  | 'assets'
  | 'equipment'
  | 'story'
  | 'review';

interface CharacterCreationDraftPayload {
  attributes: CharacterAttributes;
  background: string;
  classId: string;
  deity: string;
  equipmentIds: string[];
  extraSpellPoints: number;
  genderId: string;
  name: string;
  orientationId: string;
  psychology: string;
  quote: string;
  raceId: string;
  skills: CharacterSkill[];
  spells: CharacterSpell[];
}

const CharacterCreationStepIdSchema = z.enum([
  'identity',
  'attributes',
  'path',
  'spells',
  'skills',
  'assets',
  'equipment',
  'story',
  'review'
]);

const CharacterAttributesSchema = z.object(
  Object.fromEntries(ATTRIBUTE_KEYS.map((key) => [key, z.number().int().nonnegative()])) as Record<
    AttributeKey,
    z.ZodNumber
  >
) as z.ZodType<CharacterAttributes>;

const CharacterSkillSchema: z.ZodType<CharacterSkill> = z.object({
  id: z.string().min(1),
  isMain: z.boolean().optional(),
  parentId: z.string().min(1).nullable().optional(),
  points: z.number().int().nonnegative()
});

const CharacterSpellSchema: z.ZodType<CharacterSpell> = z.object({
  id: z.string().min(1),
  points: z.number().int().nonnegative()
});

const CharacterCreationDraftPayloadSchema: z.ZodType<CharacterCreationDraftPayload> = z
  .object({
    attributes: CharacterAttributesSchema,
    background: z.string(),
    classId: z.string().min(1),
    deity: z.string(),
    equipmentIds: z.array(z.string().min(1)),
    extraSpellPoints: z.number().int().nonnegative(),
    genderId: z.string(),
    name: z.string().min(1),
    orientationId: z.string().min(1),
    psychology: z.string(),
    quote: z.string(),
    raceId: z.string().min(1),
    skills: z.array(CharacterSkillSchema),
    spells: z.array(CharacterSpellSchema)
  })
  .passthrough();

const CharacterCreationDraftSnapshotSchema: z.ZodType<CharacterCreationDraftSnapshot> = z.object({
  currentStep: CharacterCreationStepIdSchema,
  id: z.string().min(1),
  payload: CharacterCreationDraftPayloadSchema
});

export async function finalizeCharacterDraft(
  draftId: string,
  scope: CharacterPersistenceScope = {}
): Promise<CharacterPersistenceResult> {
  const sql = createSqlClient();
  const db = createDbClient(sql);

  try {
    const draftRows = await db
      .select()
      .from(characterDrafts)
      .where(
        scope.userId
          ? and(eq(characterDrafts.id, draftId), eq(characterDrafts.userId, scope.userId))
          : eq(characterDrafts.id, draftId)
      )
      .limit(1);
    const row = draftRows[0];

    if (row === undefined) {
      throw new CharacterDraftNotFoundError(draftId);
    }

    const draft = CharacterCreationDraftSnapshotSchema.parse({
      currentStep: row.currentStep,
      id: row.id,
      payload: row.payload
    });
    const catalog = await loadCharacterCreationCatalog();
    const character = buildCharacterFromDraft(draft, catalog, row.userId);
    const persistedRows = await db
      .insert(characters)
      .values({
        draftId: draft.id,
        id: character.id,
        kind: character.kind,
        name: character.name,
        payload: character,
        userId: row.userId
      })
      .onConflictDoUpdate({
        set: {
          draftId: draft.id,
          kind: character.kind,
          name: character.name,
          payload: character,
          updatedAt: drizzleSql`now()`,
          userId: row.userId
        },
        target: characters.id
      })
      .returning({ character: characters.payload });

    return {
      character: persistedRows[0]!.character
    };
  } finally {
    await sql.end({ timeout: 5 });
  }
}

export async function getPersistedCharacter(
  id: string,
  scope: CharacterPersistenceScope = {}
): Promise<CharacterPersistenceResult> {
  const sql = createSqlClient();
  const db = createDbClient(sql);

  try {
    const rows = await db
      .select({ character: characters.payload })
      .from(characters)
      .where(
        scope.userId
          ? and(eq(characters.id, id), eq(characters.userId, scope.userId))
          : eq(characters.id, id)
      )
      .limit(1);
    const row = rows[0];

    if (row === undefined) {
      throw new CharacterNotFoundError(id);
    }

    return {
      character: row.character
    };
  } finally {
    await sql.end({ timeout: 5 });
  }
}

export async function listPersistedCharacterActiveSpells(
  id: string,
  scope: CharacterPersistenceScope = {}
): Promise<CharacterActiveSpellReadModel[]> {
  const sql = createSqlClient();
  const db = createDbClient(sql);

  try {
    const characterRows = await db
      .select({ id: characters.id })
      .from(characters)
      .where(
        scope.userId
          ? and(eq(characters.id, id), eq(characters.userId, scope.userId))
          : eq(characters.id, id)
      )
      .limit(1);

    if (characterRows.length === 0) {
      throw new CharacterNotFoundError(id);
    }

    const spellRows = await sql<CharacterActiveSpellRow[]>`
      SELECT
        cas.character_id,
        cas.active_spell_id,
        cas.spell_id,
        cas.source_caster_id,
        cas.cast_at_sequence,
        cas.cast_at_narrative_seconds,
        cas.duration_amount,
        cas.duration_unit,
        cas.successes_count,
        cas.expires_at_narrative_seconds,
        cas.expires_at_combat_dt,
        cas.status,
        gs.slug AS session_slug
      FROM character_active_spells cas
      JOIN game_sessions gs ON gs.id = cas.session_id
      WHERE cas.character_id = ${id}
        AND cas.status = 'active'
      ORDER BY cas.cast_at_sequence ASC, cas.created_at ASC
    `;

    return spellRows.map(toCharacterActiveSpellReadModel);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

export async function updatePersistedCharacterCombatState(
  id: string,
  input: CharacterCombatStateUpdate,
  scope: CharacterPersistenceScope = {}
): Promise<CharacterPersistenceResult> {
  const sql = createSqlClient();
  const db = createDbClient(sql);

  try {
    const rows = await db
      .select({ character: characters.payload })
      .from(characters)
      .where(
        scope.userId
          ? and(eq(characters.id, id), eq(characters.userId, scope.userId))
          : eq(characters.id, id)
      )
      .limit(1);
    const row = rows[0];

    if (row === undefined) {
      throw new CharacterNotFoundError(id);
    }

    const now = new Date().toISOString();
    const vitality = input.vitality
      ? {
          current: clampResource(
            input.vitality.current ?? row.character.vitality.current,
            input.vitality.max ?? row.character.vitality.max
          ),
          max: Math.max(1, input.vitality.max ?? row.character.vitality.max)
        }
      : row.character.vitality;
    const character: Character = {
      ...row.character,
      metadata: {
        ...row.character.metadata,
        combat: {
          ...(isRecord(row.character.metadata.combat) ? row.character.metadata.combat : {}),
          ...(input.sessionSlug ? { sessionSlug: input.sessionSlug } : {}),
          ...(input.statuses ? { statuses: input.statuses.map((status) => ({ ...status })) } : {}),
          updatedAt: now
        }
      },
      vitality
    };
    const updatedRows = await db
      .update(characters)
      .set({
        payload: character,
        updatedAt: drizzleSql`now()`
      })
      .where(
        scope.userId
          ? and(eq(characters.id, id), eq(characters.userId, scope.userId))
          : eq(characters.id, id)
      )
      .returning({ character: characters.payload });

    return {
      character: updatedRows[0]!.character
    };
  } finally {
    await sql.end({ timeout: 5 });
  }
}

export async function awardPersistedCharacterXp(
  id: string,
  input: CharacterXpAwardUpdate,
  scope: CharacterPersistenceScope = {}
): Promise<CharacterPersistenceResult> {
  const sql = createSqlClient();
  const db = createDbClient(sql);

  try {
    const rows = await db
      .select({ character: characters.payload })
      .from(characters)
      .where(
        scope.userId
          ? and(eq(characters.id, id), eq(characters.userId, scope.userId))
          : eq(characters.id, id)
      )
      .limit(1);
    const row = rows[0];

    if (row === undefined) {
      throw new CharacterNotFoundError(id);
    }

    const now = new Date().toISOString();
    const awarded = gainXP(row.character, input.amount, {
      questPoints: input.questPoints ?? 0
    });
    const awardRecord = {
      ...(input.actorId ? { actorId: input.actorId } : {}),
      amount: input.amount,
      awardedAt: now,
      ...(input.questPoints !== undefined ? { questPoints: input.questPoints } : {}),
      ...(input.reason ? { reason: input.reason } : {}),
      ...(input.sessionSlug ? { sessionSlug: input.sessionSlug } : {})
    };
    const character: Character = {
      ...awarded,
      metadata: {
        ...awarded.metadata,
        xpAwards: [...readXpAwardRecords(awarded.metadata.xpAwards), awardRecord]
      }
    };
    const updatedRows = await db
      .update(characters)
      .set({
        payload: character,
        updatedAt: drizzleSql`now()`
      })
      .where(
        scope.userId
          ? and(eq(characters.id, id), eq(characters.userId, scope.userId))
          : eq(characters.id, id)
      )
      .returning({ character: characters.payload });

    return {
      character: updatedRows[0]!.character
    };
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function loadCharacterCreationCatalog(): Promise<CharacterCreationCatalog> {
  const [races, orientations, classes, weapons, protections, potions] = await Promise.all([
    loadValidatedCatalog('races.yaml'),
    loadValidatedCatalog('orientations.yaml'),
    loadValidatedCatalog('classes.yaml'),
    loadValidatedCatalog('armes.yaml'),
    loadValidatedCatalog('protections.yaml'),
    loadValidatedCatalog('potions.yaml')
  ]);

  return {
    classes: toClassProfiles(classes),
    equipment: toEquipmentOptions(weapons, protections, potions),
    orientations: toOrientationProfiles(orientations),
    races: toRaceProfiles(races)
  };
}

function clampResource(current: number, max: number): number {
  return Math.min(Math.max(0, current), Math.max(1, max));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readXpAwardRecords(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord);
}

function buildCharacterFromDraft(
  draft: CharacterCreationDraftSnapshot,
  catalog: CharacterCreationCatalog,
  userId: string
): Character {
  const race = requireSelection(
    catalog.races.find((entry) => entry.id === draft.payload.raceId),
    'race'
  );
  const orientation = requireSelection(
    catalog.orientations.find((entry) => entry.id === draft.payload.orientationId),
    'orientation'
  );
  const classProfile = requireSelection(
    catalog.classes.find((entry) => entry.id === draft.payload.classId),
    'class'
  );
  const primarySkillIds = new Set(classProfile.primarySkillIds ?? []);
  const equipment = draft.payload.equipmentIds.map((equipmentId): CharacterEquipmentItem => {
    const option = catalog.equipment.find((entry) => entry.id === equipmentId);

    return {
      id: equipmentId,
      name: option?.name,
      quantity: 1
    };
  });

  return createPlayerCharacter({
    attributes: draft.payload.attributes,
    classProfile,
    equipment,
    id: draft.id,
    metadata: {
      background: draft.payload.background,
      deity: draft.payload.deity,
      genderId: draft.payload.genderId,
      psychology: draft.payload.psychology,
      quote: draft.payload.quote
    },
    name: draft.payload.name.trim(),
    orientation,
    race,
    skills: draft.payload.skills.map((skill) => ({
      ...skill,
      isMain: skill.isMain ?? primarySkillIds.has(skill.id)
    })),
    spells: draft.payload.spells.map((spell) => ({ ...spell })),
    userId
  });
}

function toRaceProfiles(catalog: RacesCatalog): RaceProfile[] {
  return catalog.races
    .filter(
      (entry) => entry.status === 'active' && entry.playable === true && entry.id && entry.name
    )
    .map((entry) => ({
      attributeMax: Object.fromEntries(
        ATTRIBUTE_KEYS.map((key) => [key, Math.max(1, entry.attribute_max[key] ?? 5)])
      ) as CharacterAttributes,
      category: entry.xp_category,
      id: entry.id,
      name: cleanName(entry.name),
      speedFactor: entry.speed_factor_base,
      vitality: entry.vitality_base,
      willFactor: entry.will_factor_base
    }));
}

function toOrientationProfiles(catalog: OrientationsCatalog): CharacterOrientationProfile[] {
  return catalog.orientations
    .filter((entry) => entry.status === 'active' && entry.id && entry.name)
    .map((entry) => ({
      id: entry.id,
      isMagical: entry.is_magical,
      name: entry.name
    }));
}

function toClassProfiles(catalog: ClassesCatalog): CharacterClassProfile[] {
  return catalog.classes
    .filter((entry) => entry.status === 'active' && entry.id && entry.name && entry.orientation_id)
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      orientationId: entry.orientation_id,
      primarySkillIds: entry.primary_skill_id ? [entry.primary_skill_id] : []
    }));
}

function toEquipmentOptions(
  weapons: WeaponsCatalog,
  protections: ProtectionsCatalog,
  potions: PotionsCatalog
): Array<{ id: string; name: string }> {
  return [
    ...weapons.weapons.map((entry) => toEquipmentOption(entry)),
    ...protections.shields.map((entry) => toEquipmentOption(entry)),
    ...protections.armor_pieces.map((entry) => toEquipmentOption(entry)),
    ...potions.potions.map((entry) => toEquipmentOption(entry))
  ].filter((entry): entry is { id: string; name: string } => entry !== null);
}

function toEquipmentOption(entry: { id?: string; name?: string; status?: string }) {
  if (!entry.id || !entry.name || (entry.status !== undefined && entry.status !== 'active')) {
    return null;
  }

  return { id: entry.id, name: entry.name };
}

function requireSelection<T>(value: T | undefined, label: string): T {
  if (value === undefined) {
    throw new Error(`Unknown character ${label} in draft`);
  }

  return value;
}

function toCharacterActiveSpellReadModel(
  row: CharacterActiveSpellRow
): CharacterActiveSpellReadModel {
  return {
    activeSpellId: row.active_spell_id,
    castAtNarrativeSeconds: Number(row.cast_at_narrative_seconds),
    castAtSequence: row.cast_at_sequence,
    characterId: row.character_id,
    durationAmount: Number(row.duration_amount),
    durationUnit: row.duration_unit,
    ...(row.expires_at_combat_dt !== null ? { expiresAtCombatDt: row.expires_at_combat_dt } : {}),
    ...(row.expires_at_narrative_seconds !== null
      ? { expiresAtNarrativeSeconds: Number(row.expires_at_narrative_seconds) }
      : {}),
    ...(row.source_caster_id !== null ? { sourceCasterId: row.source_caster_id } : {}),
    ...(row.spell_id !== null ? { spellId: row.spell_id } : {}),
    status: row.status,
    ...(row.successes_count !== null ? { successesCount: row.successes_count } : {}),
    sessionSlug: row.session_slug
  };
}

function cleanName(name: string): string {
  return name
    .replace(/,\s*-.*/, '')
    .replace(/\s*\/.*$/, '')
    .trim();
}
