import { z } from 'zod';

import { DEFAULT_CATALOGS_DIR, catalogPath, loadCatalog } from './loader.js';

const NonEmptyStringSchema = z.string().min(1);
const CountLikeSchema = z.union([z.number().int().nonnegative(), NonEmptyStringSchema]);

export const CatalogMetadataSchema = z
  .object({
    source: NonEmptyStringSchema.optional(),
    imported_at: NonEmptyStringSchema.optional(),
    updated_at: NonEmptyStringSchema.optional(),
    total_entries: z.number().int().nonnegative().optional(),
    total_religions: z.number().int().nonnegative().optional(),
    total_deities: CountLikeSchema.optional(),
    ambiguities_count: z.number().int().nonnegative().optional()
  })
  .passthrough();

export const EntryMetadataSchema = z
  .object({
    source: NonEmptyStringSchema.optional(),
    inferred: z.boolean().optional(),
    version: z.number().int().positive().optional()
  })
  .passthrough();

export const DamageProfileSchema = z
  .object({
    P: z.number(),
    E: z.number(),
    C: z.number(),
    T: z.number()
  })
  .passthrough();

const CatalogBaseSchema = z
  .object({
    version: z.number().int().positive(),
    metadata: CatalogMetadataSchema
  })
  .passthrough();

export const WeaponSchema = z
  .object({
    id: NonEmptyStringSchema,
    name: NonEmptyStringSchema,
    category: NonEmptyStringSchema,
    damage_type: z.union([NonEmptyStringSchema, z.array(NonEmptyStringSchema)]).optional(),
    damage_formula: NonEmptyStringSchema,
    difficulty: z.number().optional(),
    hands_required: z.number().optional(),
    metadata: EntryMetadataSchema.optional()
  })
  .passthrough();

export const WeaponsCatalogSchema = CatalogBaseSchema.extend({
  weapons: z.array(WeaponSchema)
});

export const BestiaryEntrySchema = z
  .object({
    id: NonEmptyStringSchema,
    name: NonEmptyStringSchema,
    category: NonEmptyStringSchema,
    size_m: z.number(),
    life_expectancy: z.number(),
    xp_category: z.number(),
    vitality_base: z.number(),
    speed_factor_base: z.number(),
    will_factor_base: z.number(),
    attribute_max: z.object({}).passthrough(),
    language_capable: z.boolean(),
    playable: z.boolean(),
    source_refs: z.array(z.lazy(() => SourceRefSchema)).optional(),
    metadata: EntryMetadataSchema.optional()
  })
  .passthrough();

export const BestiaryCatalogSchema = CatalogBaseSchema.extend({
  creatures: z.array(BestiaryEntrySchema)
});

export const ArmorPieceSchema = z
  .object({
    id: NonEmptyStringSchema,
    name: NonEmptyStringSchema,
    layer: NonEmptyStringSchema,
    category: NonEmptyStringSchema,
    protection: DamageProfileSchema,
    zones_covered: z.array(NonEmptyStringSchema),
    weight_kg_human: z.number(),
    metadata: EntryMetadataSchema.optional()
  })
  .passthrough();

export const ShieldSchema = z
  .object({
    id: NonEmptyStringSchema,
    name: NonEmptyStringSchema,
    category: NonEmptyStringSchema,
    material: NonEmptyStringSchema,
    protection: DamageProfileSchema,
    pass_chance_pct: z.number(),
    weight_kg_human: z.number(),
    size: NonEmptyStringSchema,
    metadata: EntryMetadataSchema.optional()
  })
  .passthrough();

export const ProtectionSchema = z.union([ArmorPieceSchema, ShieldSchema]);

export const ProtectionsCatalogSchema = CatalogBaseSchema.extend({
  racial_weight_modifiers: z.record(NonEmptyStringSchema, z.number()).optional(),
  armor_pieces: z.array(ArmorPieceSchema),
  shields: z.array(ShieldSchema)
});

export const PotionIngredientSchema = z
  .object({
    id: NonEmptyStringSchema,
    quantity: z.union([z.number(), NonEmptyStringSchema]).optional(),
    unit: NonEmptyStringSchema.optional()
  })
  .passthrough();

export const PotionSchema = z
  .object({
    id: NonEmptyStringSchema,
    name: NonEmptyStringSchema,
    category: NonEmptyStringSchema,
    output_type: NonEmptyStringSchema,
    effect: NonEmptyStringSchema,
    ingredients: z.array(PotionIngredientSchema),
    craft_check: z.object({}).passthrough(),
    metadata: EntryMetadataSchema.optional()
  })
  .passthrough();

export const PotionsCatalogSchema = CatalogBaseSchema.extend({
  potions: z.array(PotionSchema)
});

const NullableStringSchema = NonEmptyStringSchema.nullable();

export const NationSchema = z
  .object({
    id: NonEmptyStringSchema,
    name: NonEmptyStringSchema,
    category: NonEmptyStringSchema,
    capital: NullableStringSchema,
    gentile: z.union([NonEmptyStringSchema, z.array(NonEmptyStringSchema), z.null()]).optional(),
    official_language: NullableStringSchema.optional(),
    official_religion: NullableStringSchema.optional(),
    government: NullableStringSchema.optional(),
    population: z.object({}).passthrough().optional(),
    surface_km2: z.number().nullable().optional(),
    metadata: EntryMetadataSchema
  })
  .passthrough();

export const NationsCatalogSchema = CatalogBaseSchema.extend({
  regions: z.array(NationSchema)
});

export const OrganisationSchema = z
  .object({
    id: NonEmptyStringSchema,
    name: NonEmptyStringSchema,
    category: NonEmptyStringSchema,
    metadata: EntryMetadataSchema
  })
  .passthrough();

export const OrganisationsCatalogSchema = CatalogBaseSchema.extend({
  factions: z.array(OrganisationSchema)
});

export const ReligionSchema = z
  .object({
    id: NonEmptyStringSchema,
    name: NonEmptyStringSchema,
    category: NonEmptyStringSchema,
    primary_race: NullableStringSchema.optional(),
    doctrine: NonEmptyStringSchema,
    metadata: EntryMetadataSchema
  })
  .passthrough();

export const ReligionsCatalogSchema = CatalogBaseSchema.extend({
  religions: z.array(ReligionSchema)
});

export const SourceRefSchema = z
  .object({
    path: NonEmptyStringSchema,
    sha256: NonEmptyStringSchema,
    ref: NonEmptyStringSchema
  })
  .passthrough();

export const SkillSchema = z
  .object({
    id: NonEmptyStringSchema,
    name: NonEmptyStringSchema,
    family: NonEmptyStringSchema,
    family_name: NonEmptyStringSchema.optional(),
    parent_id: NullableStringSchema.optional(),
    source_refs: z.array(SourceRefSchema).optional(),
    metadata: EntryMetadataSchema.optional()
  })
  .passthrough();

export const SkillsCatalogSchema = CatalogBaseSchema.extend({
  skills: z.array(SkillSchema)
});

export const OrientationSchema = z
  .object({
    id: NonEmptyStringSchema,
    name: NonEmptyStringSchema,
    is_magical: z.boolean(),
    source_refs: z.array(SourceRefSchema).optional(),
    metadata: EntryMetadataSchema.optional()
  })
  .passthrough();

export const OrientationsCatalogSchema = CatalogBaseSchema.extend({
  orientations: z.array(OrientationSchema)
});

export const PrimarySkillChoiceSchema = z.enum(['fixed', 'player_choice', 'magician_no_primary']);

export const ClassSchema = z
  .object({
    id: NonEmptyStringSchema,
    name: NonEmptyStringSchema,
    orientation_id: NonEmptyStringSchema,
    primary_skill_id: NullableStringSchema.optional(),
    primary_skill_choice: PrimarySkillChoiceSchema,
    source_refs: z.array(SourceRefSchema).optional(),
    metadata: EntryMetadataSchema.optional()
  })
  .passthrough();

export const ClassesCatalogSchema = CatalogBaseSchema.extend({
  classes: z.array(ClassSchema)
});

export const MagicSchoolSchema = z
  .object({
    id: NonEmptyStringSchema,
    name: NonEmptyStringSchema,
    source_label: NonEmptyStringSchema.optional(),
    color: NonEmptyStringSchema,
    specialist_class_id: NonEmptyStringSchema,
    domain: NonEmptyStringSchema,
    source_refs: z.array(SourceRefSchema).optional(),
    metadata: EntryMetadataSchema.optional()
  })
  .passthrough();

export const MagicSchoolsCatalogSchema = CatalogBaseSchema.extend({
  schools: z.array(MagicSchoolSchema)
});

export const SpellSchema = z
  .object({
    id: NonEmptyStringSchema,
    name: NonEmptyStringSchema,
    school_id: NonEmptyStringSchema,
    energy: z.number().int(),
    incantation_time: z.number().int(),
    difficulty: z.number().int(),
    effect: z.string(),
    value: z.number().int(),
    source_refs: z.array(SourceRefSchema).optional(),
    metadata: EntryMetadataSchema.optional()
  })
  .passthrough();

export const SpellsCatalogSchema = CatalogBaseSchema.extend({
  spells: z.array(SpellSchema)
});

export type Weapon = z.infer<typeof WeaponSchema>;
export type WeaponsCatalog = z.infer<typeof WeaponsCatalogSchema>;
export type BestiaryEntry = z.infer<typeof BestiaryEntrySchema>;
export type BestiaryCatalog = z.infer<typeof BestiaryCatalogSchema>;
export type Protection = z.infer<typeof ProtectionSchema>;
export type ProtectionsCatalog = z.infer<typeof ProtectionsCatalogSchema>;
export type Potion = z.infer<typeof PotionSchema>;
export type PotionsCatalog = z.infer<typeof PotionsCatalogSchema>;
export type Nation = z.infer<typeof NationSchema>;
export type NationsCatalog = z.infer<typeof NationsCatalogSchema>;
export type Organisation = z.infer<typeof OrganisationSchema>;
export type OrganisationsCatalog = z.infer<typeof OrganisationsCatalogSchema>;
export type Religion = z.infer<typeof ReligionSchema>;
export type ReligionsCatalog = z.infer<typeof ReligionsCatalogSchema>;
export type SourceRef = z.infer<typeof SourceRefSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type SkillsCatalog = z.infer<typeof SkillsCatalogSchema>;
export type Orientation = z.infer<typeof OrientationSchema>;
export type OrientationsCatalog = z.infer<typeof OrientationsCatalogSchema>;
export type PrimarySkillChoice = z.infer<typeof PrimarySkillChoiceSchema>;
export type ClassEntry = z.infer<typeof ClassSchema>;
export type ClassesCatalog = z.infer<typeof ClassesCatalogSchema>;
export type MagicSchool = z.infer<typeof MagicSchoolSchema>;
export type MagicSchoolsCatalog = z.infer<typeof MagicSchoolsCatalogSchema>;
export type Spell = z.infer<typeof SpellSchema>;
export type SpellsCatalog = z.infer<typeof SpellsCatalogSchema>;

export const PRIORITY_CATALOG_NAMES = [
  'armes.yaml',
  'bestiaire.yaml',
  'protections.yaml',
  'potions.yaml',
  'nations.yaml',
  'organisations.yaml',
  'religions.yaml',
  'competences.yaml',
  'orientations.yaml',
  'classes.yaml',
  'magic-schools.yaml',
  'spells.yaml'
] as const;

export type PriorityCatalogName = (typeof PRIORITY_CATALOG_NAMES)[number];

export type PriorityCatalogData = {
  'armes.yaml': WeaponsCatalog;
  'bestiaire.yaml': BestiaryCatalog;
  'protections.yaml': ProtectionsCatalog;
  'potions.yaml': PotionsCatalog;
  'nations.yaml': NationsCatalog;
  'organisations.yaml': OrganisationsCatalog;
  'religions.yaml': ReligionsCatalog;
  'competences.yaml': SkillsCatalog;
  'orientations.yaml': OrientationsCatalog;
  'classes.yaml': ClassesCatalog;
  'magic-schools.yaml': MagicSchoolsCatalog;
  'spells.yaml': SpellsCatalog;
};

export type PriorityCatalogs = {
  [CatalogName in PriorityCatalogName]: PriorityCatalogData[CatalogName];
};

export const PriorityCatalogSchemas = {
  'armes.yaml': WeaponsCatalogSchema,
  'bestiaire.yaml': BestiaryCatalogSchema,
  'protections.yaml': ProtectionsCatalogSchema,
  'potions.yaml': PotionsCatalogSchema,
  'nations.yaml': NationsCatalogSchema,
  'organisations.yaml': OrganisationsCatalogSchema,
  'religions.yaml': ReligionsCatalogSchema,
  'competences.yaml': SkillsCatalogSchema,
  'orientations.yaml': OrientationsCatalogSchema,
  'classes.yaml': ClassesCatalogSchema,
  'magic-schools.yaml': MagicSchoolsCatalogSchema,
  'spells.yaml': SpellsCatalogSchema
} satisfies Record<PriorityCatalogName, z.ZodType>;

export class CatalogValidationError extends Error {
  public readonly filePath: string;
  public readonly issues: z.ZodIssue[];

  public constructor(filePath: string, issues: z.ZodIssue[]) {
    super(`Catalog validation failed for ${filePath}: ${issues.map(formatIssue).join('; ')}`);
    this.name = 'CatalogValidationError';
    this.filePath = filePath;
    this.issues = issues;
  }
}

export function validateCatalogData<CatalogName extends PriorityCatalogName>(
  catalogName: CatalogName,
  data: unknown,
  filePath: string = catalogName
): PriorityCatalogData[CatalogName] {
  const schema = PriorityCatalogSchemas[catalogName] as unknown as z.ZodType<
    PriorityCatalogData[CatalogName]
  >;
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new CatalogValidationError(filePath, result.error.issues);
  }

  return result.data;
}

export async function loadValidatedCatalog<CatalogName extends PriorityCatalogName>(
  catalogName: CatalogName,
  catalogsDir = DEFAULT_CATALOGS_DIR
): Promise<PriorityCatalogData[CatalogName]> {
  const filePath = catalogPath(catalogName, catalogsDir);
  const data = await loadCatalog(catalogName, catalogsDir);

  return validateCatalogData(catalogName, data, filePath);
}

export async function loadValidatedCatalogs(
  catalogsDir = DEFAULT_CATALOGS_DIR
): Promise<PriorityCatalogs> {
  const entries = await Promise.all(
    PRIORITY_CATALOG_NAMES.map(async (catalogName) => [
      catalogName,
      await loadValidatedCatalog(catalogName, catalogsDir)
    ])
  );

  return Object.fromEntries(entries) as PriorityCatalogs;
}

function formatIssue(issue: z.ZodIssue): string {
  const path = issue.path.length > 0 ? issue.path.map(String).join('.') : '<root>';
  return `${path}: ${issue.message}`;
}
