import { parse as parsePath, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdir, readFile } from 'node:fs/promises';

import type { Payload } from 'payload';
import {
  DEFAULT_CATALOGS_DIR,
  loadCatalog,
  loadValidatedCatalogs,
  type BestiaryEntry,
  type Nation,
  type Organisation,
  type Potion,
  type Protection,
  type Religion,
  type Weapon
} from '../packages/catalogs/src/index.js';

type ImportCollection =
  | 'assets'
  | 'bestiary'
  | 'images'
  | 'lore-entries'
  | 'map-cities'
  | 'mushrooms'
  | 'nations'
  | 'organisations'
  | 'potions'
  | 'protections'
  | 'races'
  | 'religions'
  | 'rules'
  | 'weapons'
  | 'world-map-regions';

type SourceRefKind = 'legacy_php' | 'manual' | 'map_asset' | 'rules_markdown' | 'yaml';

type ImportDocument = {
  canonicalId: string;
  metadata?: Record<string, unknown>;
  migrationNotes?: string;
  name: string;
  sourceRefs?: SourceRef[];
} & Record<string, unknown>;

type ImportEntry = {
  collection: ImportCollection;
  data: ImportDocument;
};

type SourceRef = {
  kind: SourceRefKind;
  note?: string;
  path: string;
};

type ImportPlan = {
  ambiguityFiles: string[];
  entries: ImportEntry[];
};

type ImportStats = {
  created: number;
  dryRun: number;
  updated: number;
};

type ExistingCatalogDocument = {
  canonicalId?: string | null;
  id: string | number;
};

type ExistingDocumentsByCollection = Map<ImportCollection, Map<string, ExistingCatalogDocument>>;

const PAYLOAD_LOOKUP_CHUNK_SIZE = 50;
const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const defaultRulesDir = resolve(repoRoot, 'docs/rules');
const defaultAtoutsCsv = resolve(DEFAULT_CATALOGS_DIR, 'atouts-values.csv');

export async function buildCatalogImportPlan(
  catalogsDir = DEFAULT_CATALOGS_DIR,
  rulesDir = defaultRulesDir
): Promise<ImportPlan> {
  const priorityCatalogs = await loadValidatedCatalogs(catalogsDir);
  const entries: ImportEntry[] = [];
  const ambiguityFiles = await findAmbiguityFiles(catalogsDir);

  entries.push(
    ...priorityCatalogs['armes.yaml'].weapons.map((weapon) =>
      weaponEntry(weapon, priorityCatalogs['armes.yaml'].metadata)
    ),
    ...priorityCatalogs['bestiaire.yaml'].creatures.map((creature) =>
      bestiaryEntry(creature, priorityCatalogs['bestiaire.yaml'].metadata)
    ),
    ...priorityCatalogs['bestiaire.yaml'].creatures
      .filter((creature) => creature.playable)
      .map((creature) =>
        raceEntryFromBestiary(creature, priorityCatalogs['bestiaire.yaml'].metadata)
      ),
    ...priorityCatalogs['protections.yaml'].armor_pieces.map((protection) =>
      protectionEntry(protection, 'armor_piece', priorityCatalogs['protections.yaml'].metadata)
    ),
    ...priorityCatalogs['protections.yaml'].shields.map((protection) =>
      protectionEntry(protection, 'shield', priorityCatalogs['protections.yaml'].metadata)
    ),
    ...priorityCatalogs['potions.yaml'].potions.map((potion) =>
      potionEntry(potion, priorityCatalogs['potions.yaml'].metadata)
    ),
    ...priorityCatalogs['nations.yaml'].regions.map((nation) =>
      nationEntry(nation, priorityCatalogs['nations.yaml'].metadata)
    ),
    ...priorityCatalogs['organisations.yaml'].factions.map((organisation) =>
      organisationEntry(organisation, priorityCatalogs['organisations.yaml'].metadata)
    ),
    ...priorityCatalogs['religions.yaml'].religions.map((religion) =>
      religionEntry(religion, priorityCatalogs['religions.yaml'].metadata)
    )
  );

  entries.push(...(await extendedYamlEntries(catalogsDir)));
  entries.push(...(await atoutsEntries(defaultAtoutsCsv)));
  entries.push(...(await ruleEntries(rulesDir)));

  return {
    ambiguityFiles,
    entries: uniqueEntries(entries)
  };
}

export async function importCatalogs(
  payload: Payload,
  plan: ImportPlan,
  options: { dryRun?: boolean } = {}
): Promise<ImportStats> {
  const stats: ImportStats = { created: 0, dryRun: 0, updated: 0 };
  const existingDocuments = options.dryRun
    ? new Map<ImportCollection, Map<string, ExistingCatalogDocument>>()
    : await existingDocumentsByCollection(payload, plan.entries);

  for (const entry of plan.entries) {
    if (options.dryRun) {
      stats.dryRun += 1;
      continue;
    }

    const existing = existingDocuments.get(entry.collection)?.get(entry.data.canonicalId);

    if (existing) {
      await payload.update({
        collection: entry.collection,
        data: entry.data,
        id: existing.id,
        overrideAccess: true
      });
      stats.updated += 1;
    } else {
      await payload.create({
        collection: entry.collection,
        data: entry.data,
        overrideAccess: true
      });
      stats.created += 1;
    }
  }

  return stats;
}

export async function verifyCatalogImport(payload: Payload, plan: ImportPlan): Promise<void> {
  const missing: string[] = [];
  const existingDocuments = await existingDocumentsByCollection(payload, plan.entries);

  for (const entry of plan.entries) {
    if (!existingDocuments.get(entry.collection)?.has(entry.data.canonicalId)) {
      missing.push(`${entry.collection}:${entry.data.canonicalId}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing imported catalog documents: ${missing.slice(0, 20).join(', ')}`);
  }
}

export function summarizePlan(plan: ImportPlan): Record<string, number> {
  return plan.entries.reduce<Record<string, number>>((summary, entry) => {
    summary[entry.collection] = (summary[entry.collection] ?? 0) + 1;
    return summary;
  }, {});
}

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const verifyOnly = args.has('--verify-only');
  const catalogsDir = argValue('--catalogs-dir') ?? DEFAULT_CATALOGS_DIR;
  const rulesDir = argValue('--rules-dir') ?? defaultRulesDir;
  const plan = await buildCatalogImportPlan(catalogsDir, rulesDir);

  printPlan(plan);

  if (dryRun) {
    return;
  }

  requirePayloadEnv();

  const payload = await loadPayload();

  try {
    if (!verifyOnly) {
      const stats = await importCatalogs(payload, plan);
      console.log(`catalog import: created=${stats.created} updated=${stats.updated}`);
    }

    await verifyCatalogImport(payload, plan);
    console.log('catalog verification: ok');
  } finally {
    await payload.destroy();
  }
}

function weaponEntry(weapon: Weapon, catalogMetadata: Record<string, unknown>): ImportEntry {
  return entry(
    'weapons',
    weapon,
    {
      category: weapon.category,
      damageFormula: weapon.damage_formula,
      damageTypes: toArray(weapon.damage_type),
      difficulty: weapon.difficulty,
      handsRequired: weapon.hands_required,
      sourceRefs: sourceRefs('armes.yaml', 'armes-ambiguites.md'),
      weightKg: numberOrUndefined(weapon.weight_kg)
    },
    catalogMetadata,
    'armes.yaml'
  );
}

function bestiaryEntry(
  creature: BestiaryEntry,
  catalogMetadata: Record<string, unknown>
): ImportEntry {
  return entry(
    'bestiary',
    creature,
    {
      attributeMax: creature.attribute_max,
      category: creature.category,
      languageCapable: creature.language_capable,
      lifeExpectancy: creature.life_expectancy,
      playable: creature.playable,
      sizeM: creature.size_m,
      speedFactorBase: creature.speed_factor_base,
      vitalityBase: creature.vitality_base,
      willFactorBase: creature.will_factor_base,
      xpCategory: creature.xp_category
    },
    catalogMetadata,
    'bestiaire.yaml'
  );
}

function raceEntryFromBestiary(
  creature: BestiaryEntry,
  catalogMetadata: Record<string, unknown>
): ImportEntry {
  return entry(
    'races',
    creature,
    {
      attributeMax: creature.attribute_max,
      category: creature.xp_category,
      playable: creature.playable,
      speedFactorBase: creature.speed_factor_base,
      vitalityBase: creature.vitality_base,
      willFactorBase: creature.will_factor_base
    },
    catalogMetadata,
    'bestiaire.yaml'
  );
}

function protectionEntry(
  protection: Protection,
  kind: 'armor_piece' | 'shield',
  catalogMetadata: Record<string, unknown>
): ImportEntry {
  const raw = protection as Record<string, unknown>;

  return entry(
    'protections',
    protection,
    {
      category: raw.category,
      kind,
      layer: raw.layer,
      material: raw.material,
      passChancePct: raw.pass_chance_pct,
      protection: raw.protection,
      size: raw.size,
      sourceRefs: sourceRefs('protections.yaml'),
      weightKgHuman: raw.weight_kg_human,
      zonesCovered: toArray(raw.zones_covered).map((zone) => ({ zone }))
    },
    catalogMetadata,
    'protections.yaml'
  );
}

function potionEntry(potion: Potion, catalogMetadata: Record<string, unknown>): ImportEntry {
  const raw = potion as Record<string, unknown>;

  return entry(
    'potions',
    potion,
    {
      category: potion.category,
      consumptionMode: raw.consumption_mode,
      craftCheck: potion.craft_check,
      effect: potion.effect,
      effectDuration: raw.effect_duration ?? raw.effect_duration_per_success,
      ingredients: potion.ingredients.map((ingredient) => ({
        ingredientId: ingredient.id,
        quantity: ingredient.quantity === undefined ? undefined : String(ingredient.quantity),
        unit: ingredient.unit
      })),
      marketValuePc: (raw.price as Record<string, unknown> | undefined)?.market_value_pc,
      outputMetadata: raw.output_metadata,
      outputType: potion.output_type
    },
    catalogMetadata,
    'potions.yaml'
  );
}

function nationEntry(nation: Nation, catalogMetadata: Record<string, unknown>): ImportEntry {
  return entry(
    'nations',
    nation,
    {
      capital: nation.capital ?? undefined,
      category: nation.category,
      gentile: { value: nation.gentile },
      government: nation.government ?? undefined,
      officialLanguage: nation.official_language ?? undefined,
      officialReligion: nation.official_religion ?? undefined,
      population: nation.population,
      surfaceKm2: nation.surface_km2 ?? undefined
    },
    catalogMetadata,
    'nations.yaml'
  );
}

function organisationEntry(
  organisation: Organisation,
  catalogMetadata: Record<string, unknown>
): ImportEntry {
  const raw = organisation as Record<string, unknown>;

  return entry(
    'organisations',
    organisation,
    {
      category: organisation.category,
      description: raw.description ?? raw.profile_members
    },
    catalogMetadata,
    'organisations.yaml'
  );
}

function religionEntry(religion: Religion, catalogMetadata: Record<string, unknown>): ImportEntry {
  const raw = religion as Record<string, unknown>;

  return entry(
    'religions',
    religion,
    {
      category: religion.category,
      deities: toArray(raw.deities).map((deity) =>
        typeof deity === 'string'
          ? { name: deity }
          : {
              domain: (deity as Record<string, unknown>).domain,
              name: String((deity as Record<string, unknown>).name ?? 'Unknown deity'),
              notes: (deity as Record<string, unknown>).notes,
              title: (deity as Record<string, unknown>).title
            }
      ),
      doctrine: religion.doctrine
    },
    catalogMetadata,
    'religions.yaml'
  );
}

async function extendedYamlEntries(catalogsDir: string): Promise<ImportEntry[]> {
  const entries: ImportEntry[] = [];
  const mushrooms = await loadCatalog<Record<string, unknown>>('champignons.yaml', catalogsDir);
  const images = await loadCatalog<Record<string, unknown>>('images.yaml', catalogsDir);
  const lore = await loadCatalog<Record<string, unknown>>('lore-index.yaml', catalogsDir);
  const worldMap = await loadCatalog<Record<string, unknown>>('world-map.yaml', catalogsDir);
  const regionalCities = await loadCatalog<Record<string, unknown>>(
    'cities-from-maps.yaml',
    catalogsDir
  );

  entries.push(
    ...toArray(mushrooms.mushroom_syndromes).map((raw) =>
      entry(
        'mushrooms',
        raw,
        {
          syndrome: raw.name,
          symptoms: raw.symptoms,
          toxicity: (raw.metadata as Record<string, unknown> | undefined)?.severity,
          treatment: raw.antidote
        },
        mushrooms.metadata as Record<string, unknown>,
        'champignons.yaml'
      )
    )
  );

  entries.push(...imageEntries(images));
  entries.push(
    ...toArray(lore.lore_entries).map((raw) =>
      entry(
        'lore-entries',
        { id: raw.id, name: raw.title, ...raw },
        {
          sourcePath: raw.source_file,
          summary: raw.summary,
          tags: toArray(raw.known_to).map((tag) => ({ tag })),
          topic: raw.category
        },
        lore.metadata as Record<string, unknown>,
        'lore-index.yaml'
      )
    )
  );
  entries.push(...worldMapEntries(worldMap));
  entries.push(...regionalMapCityEntries(regionalCities));

  return entries;
}

function imageEntries(images: Record<string, unknown>): ImportEntry[] {
  const metadata = images.metadata as Record<string, unknown>;
  const imageGroups: Array<[string, string]> = [
    ['world_map', 'world_map'],
    ['regional_maps', 'regional_map'],
    ['flags', 'coat_of_arms'],
    ['misc_images', 'web_asset']
  ];

  return imageGroups.flatMap(([key, assetType]) =>
    toArray(images[key]).map((raw) =>
      entry(
        'images',
        { id: raw.id, name: raw.name ?? raw.id, ...raw },
        {
          altText: raw.description,
          assetType,
          relatedNation: undefined,
          sourcePath: raw.file
        },
        metadata,
        'images.yaml'
      )
    )
  );
}

function worldMapEntries(worldMap: Record<string, unknown>): ImportEntry[] {
  const metadata = worldMap.metadata as Record<string, unknown>;
  const regions = [
    ...toArray(worldMap.web_regions_complement),
    ...toArray(worldMap.regions_from_world_map)
  ].map((raw) =>
    entry(
      'world-map-regions',
      { id: raw.id, name: raw.name ?? raw.web_capital ?? raw.id, ...raw },
      {
        borders: { value: raw.borders },
        kind: raw.category ? 'region' : 'nation',
        sourceMap: 'world-map.yaml'
      },
      metadata,
      'world-map.yaml'
    )
  );

  const cities = toArray(worldMap.cities).map((raw) =>
    entry(
      'map-cities',
      raw,
      {
        role: raw.is_capital ? 'capital' : 'town',
        sourceMap: 'world-map.yaml'
      },
      metadata,
      'world-map.yaml'
    )
  );

  const locations = toArray(worldMap.locations).map((raw) =>
    entry(
      'map-cities',
      { id: `location-${raw.id}`, name: raw.name, ...raw },
      {
        role: 'landmark',
        sourceMap: 'world-map.yaml'
      },
      metadata,
      'world-map.yaml'
    )
  );

  return [...regions, ...cities, ...locations];
}

function regionalMapCityEntries(regionalCities: Record<string, unknown>): ImportEntry[] {
  const metadata = regionalCities.metadata as Record<string, unknown>;
  const entries: ImportEntry[] = [];

  for (const [key, value] of Object.entries(regionalCities)) {
    if (!key.endsWith('_cities') || !isRecord(value)) {
      continue;
    }

    const sourceMap = String(value.source_map ?? 'cities-from-maps.yaml');
    const parentRegion = String(value.parent_region ?? key.replace(/_cities$/, ''));

    for (const section of ['capital', 'major_cities', 'cities', 'villages'] as const) {
      for (const raw of toArray(value[section])) {
        const item = normalizeMapPoint(raw, parentRegion, section);
        entries.push(
          entry(
            'map-cities',
            item,
            {
              role: item.role,
              sourceMap
            },
            metadata,
            'cities-from-maps.yaml'
          )
        );
      }
    }

    for (const raw of toArray(value.zones)) {
      const item = normalizeMapPoint(raw, parentRegion, 'zones');
      entries.push(
        entry(
          'world-map-regions',
          item,
          {
            kind: 'zone',
            sourceMap
          },
          metadata,
          'cities-from-maps.yaml'
        )
      );
    }
  }

  return entries;
}

async function atoutsEntries(csvFile = defaultAtoutsCsv): Promise<ImportEntry[]> {
  const csv = await readFile(csvFile, 'utf8');
  const rows = parseCsv(csv);

  return rows.map((row) =>
    entry(
      'assets',
      { id: row.id, name: row.name, ...row },
      {
        activation: activationValue(row.activation),
        effect: row.effect,
        familiarCostPoints: numberOrUndefined(row.familiar_cost_points),
        familiarGrantPoints: numberOrUndefined(row.familiar_grant_points),
        isHandicap: row.is_handicap === 'True',
        sourceLine: numberOrUndefined(row.source_line),
        type: row.is_handicap === 'True' ? 'handicap' : assetTypeValue(row.type),
        value: numberOrUndefined(row.value)
      },
      { source: 'atouts-values.csv' },
      'atouts-values.csv'
    )
  );
}

async function ruleEntries(rulesDir: string): Promise<ImportEntry[]> {
  const files = (await readdir(rulesDir)).filter((file) => file.endsWith('.md')).sort();
  const entries: ImportEntry[] = [];

  for (const file of files) {
    const fullPath = resolve(rulesDir, file);
    const content = await readFile(fullPath, 'utf8');
    const title = content.match(/^#\s+(.+)$/m)?.[1] ?? parsePath(file).name;
    const section = sectionFromRuleFile(file);

    entries.push(
      entry(
        'rules',
        { id: parsePath(file).name, name: title, content },
        {
          content,
          order: numberOrUndefined(file.slice(0, 2)),
          section,
          sourcePath: `docs/rules/${file}`,
          tags: [{ tag: section }]
        },
        { source: 'docs/rules' },
        `docs/rules/${file}`,
        'rules_markdown'
      )
    );
  }

  return entries;
}

function entry(
  collection: ImportCollection,
  raw: Record<string, unknown>,
  data: Record<string, unknown>,
  catalogMetadata: Record<string, unknown>,
  sourcePath: string,
  sourceKind: SourceRefKind = sourcePath.endsWith('.md') ? 'rules_markdown' : 'yaml'
): ImportEntry {
  const canonicalId = slugify(String(raw.id ?? raw.name));

  return {
    collection,
    data: compactObject({
      ...data,
      canonicalId,
      metadata: compactObject({
        catalog: sourcePath,
        catalogMetadata,
        raw
      }),
      migrationNotes: data.migrationNotes,
      name: String(raw.name ?? raw.title ?? canonicalId),
      sourceRefs: data.sourceRefs ?? sourceRefs(sourcePath, undefined, sourceKind)
    })
  };
}

async function existingDocumentsByCollection(
  payload: Payload,
  entries: ImportEntry[]
): Promise<ExistingDocumentsByCollection> {
  const byCollection = groupEntriesByCollection(entries);
  const existingDocuments: ExistingDocumentsByCollection = new Map();

  for (const [collection, collectionEntries] of byCollection) {
    const canonicalIds = collectionEntries.map((entry) => entry.data.canonicalId);
    existingDocuments.set(
      collection,
      await findExistingDocumentsByCanonicalId(payload, collection, canonicalIds)
    );
  }

  return existingDocuments;
}

async function findExistingDocumentsByCanonicalId(
  payload: Payload,
  collection: ImportCollection,
  canonicalIds: string[]
): Promise<Map<string, ExistingCatalogDocument>> {
  const documents = new Map<string, ExistingCatalogDocument>();

  for (const canonicalIdChunk of chunks(canonicalIds, PAYLOAD_LOOKUP_CHUNK_SIZE)) {
    const result = await payload.find({
      collection,
      depth: 0,
      limit: canonicalIdChunk.length,
      overrideAccess: true,
      where: {
        canonicalId: {
          in: canonicalIdChunk
        }
      }
    });

    for (const doc of result.docs as ExistingCatalogDocument[]) {
      if (doc.canonicalId) {
        documents.set(doc.canonicalId, doc);
      }
    }
  }

  return documents;
}

function uniqueEntries(entries: ImportEntry[]): ImportEntry[] {
  const byKey = new Map<string, ImportEntry>();

  for (const entry of entries) {
    byKey.set(`${entry.collection}:${entry.data.canonicalId}`, entry);
  }

  return [...byKey.values()];
}

function groupEntriesByCollection(entries: ImportEntry[]): Map<ImportCollection, ImportEntry[]> {
  const byCollection = new Map<ImportCollection, ImportEntry[]>();

  for (const entry of entries) {
    const collectionEntries = byCollection.get(entry.collection) ?? [];
    collectionEntries.push(entry);
    byCollection.set(entry.collection, collectionEntries);
  }

  return byCollection;
}

function chunks<T>(values: T[], size: number): T[][] {
  const result: T[][] = [];

  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }

  return result;
}

function normalizeMapPoint(
  raw: unknown,
  parentRegion: string,
  section: 'capital' | 'cities' | 'major_cities' | 'villages' | 'zones'
): Record<string, unknown> {
  if (isRecord(raw)) {
    return {
      ...raw,
      id: raw.id ?? slugify(String(raw.name)),
      name: raw.name ?? raw.id,
      parentRegion,
      role: raw.role ?? roleFromSection(section)
    };
  }

  return {
    id: slugify(String(raw)),
    name: labelFromId(String(raw)),
    parentRegion,
    role: roleFromSection(section)
  };
}

function roleFromSection(
  section: 'capital' | 'cities' | 'major_cities' | 'villages' | 'zones'
): string {
  if (section === 'capital') {
    return 'capital';
  }
  if (section === 'major_cities') {
    return 'major_city';
  }
  if (section === 'zones') {
    return 'landmark';
  }
  if (section === 'villages') {
    return 'village';
  }
  return 'town';
}

function sourceRefs(
  sourcePath: string,
  ambiguityPath?: string,
  sourceKind: SourceRefKind = 'yaml'
): SourceRef[] {
  return [
    { kind: sourceKind, path: sourcePath },
    ...(ambiguityPath
      ? [{ kind: 'manual' as const, path: ambiguityPath, note: 'Ambiguities to review' }]
      : [])
  ];
}

async function findAmbiguityFiles(catalogsDir: string): Promise<string[]> {
  const files = await readdir(catalogsDir);
  return files.filter((file) => file.endsWith('-ambiguites.md')).sort();
}

function sectionFromRuleFile(file: string): string {
  const name = parsePath(file).name.replace(/^\d+-/, '');
  const section = name.replace(/-/g, '_');
  const sectionMap: Record<string, string> = {
    attributs: 'attributes',
    classes: 'classes',
    combat: 'combat',
    competences: 'skills',
    creation_perso: 'character_creation',
    equipement: 'equipment',
    geographie_social_economie: 'world',
    magie: 'magic',
    progression: 'progression',
    races: 'races',
    resolution: 'resolution',
    roles_passation: 'roles',
    controle_pnj: 'npc_control'
  };

  return sectionMap[section] ?? section;
}

function parseCsv(csv: string): Record<string, string>[] {
  const lines = csv.trim().split(/\r?\n/);
  const headers = parseCsvLine(lines[0] ?? '');

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === ',' && !quoted) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function assetTypeValue(type: string | undefined): string {
  if (type === 'Classe') {
    return 'class';
  }
  if (type === 'Race') {
    return 'race';
  }
  if (type === 'Orientation') {
    return 'orientation';
  }
  return 'neutral';
}

function activationValue(activation: string | undefined): string {
  if (activation === 'Permanent') {
    return 'permanent';
  }
  if (activation === 'Ephémère') {
    return 'ephemeral';
  }
  return 'legacy_unknown';
}

function compactObject<T extends Record<string, unknown>>(object: T): T {
  return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined)) as T;
}

function toArray<T = Record<string, unknown>>(value: unknown): T[] {
  if (value === undefined || value === null) {
    return [];
  }

  return Array.isArray(value) ? (value as T[]) : [value as T];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function numberOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function labelFromId(value: string): string {
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function argValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function printPlan(plan: ImportPlan): void {
  console.log(`catalog import plan: ${plan.entries.length} documents`);
  console.table(summarizePlan(plan));

  if (plan.ambiguityFiles.length > 0) {
    console.log(`catalog ambiguities: ${plan.ambiguityFiles.join(', ')}`);
  }
}

function requirePayloadEnv(): void {
  const hasDatabaseUrl = Boolean(process.env.CMS_DATABASE_URL || process.env.DATABASE_URL);
  const missing = [
    !process.env.PAYLOAD_SECRET ? 'PAYLOAD_SECRET' : undefined,
    !hasDatabaseUrl ? 'CMS_DATABASE_URL or DATABASE_URL' : undefined
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(`Missing required environment for Payload import: ${missing.join(', ')}`);
  }
}

async function loadPayload(): Promise<Payload> {
  const [{ getPayload }, { default: payloadConfig }] = await Promise.all([
    import('payload'),
    import('../apps/cms/src/payload.config.js')
  ]);

  return getPayload({ config: payloadConfig });
}

if (
  relative(process.cwd(), fileURLToPath(import.meta.url)) ===
  relative(process.cwd(), process.argv[1] ?? '')
) {
  main()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error(error);
      process.exit(1);
    });
}
