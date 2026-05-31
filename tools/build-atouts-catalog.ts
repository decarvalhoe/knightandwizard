import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import yaml from 'js-yaml';

const ROOT = join(import.meta.dirname ?? __dirname, '..');
const BASE_SOURCE_PATH = join(ROOT, 'data/legacy/web-scraped/documents/atouts/index.md');
const LEVEL_SOURCE_PATH = join(ROOT, 'data/legacy/web-scraped/documents/atouts-niveaux/index.md');
const RACES_CATALOG_PATH = join(ROOT, 'data/catalogs/races.yaml');
const RELATIVE_BASE_SOURCE = 'data/legacy/web-scraped/documents/atouts/index.md';
const RELATIVE_LEVEL_SOURCE = 'data/legacy/web-scraped/documents/atouts-niveaux/index.md';
const RELATIVE_RACES_CATALOG = 'data/catalogs/races.yaml';
const OUTPUT_PATH = join(ROOT, 'data/catalogs/atouts.yaml');

const TYPE_VALUES = new Set(['Classe', 'Neutre', 'Orientation']);
const ACTIVATION_VALUES = new Set(['Permanent', 'Ephémère']);

type AtoutStatus = 'active' | 'raw_reference_only';
type AtoutActivation = 'permanent' | 'ephemere' | 'unknown';
type AtoutScope = 'classe' | 'neutre' | 'orientation' | 'race' | 'niveau';

interface SourceRef {
  path: string;
  sha256: string;
  ref: string;
}

type EffectFidelity = 'covered' | 'ambiguous' | 'pending';

interface EffectSource {
  prose: string;
  ref: string;
}

type EffectSpec = Record<string, unknown>;

interface AtoutEffectFields {
  source: EffectSource;
  spec: EffectSpec;
  fidelity: EffectFidelity;
  ambiguity_ref?: string | null;
}

interface AtoutEntry {
  id: string;
  name: string;
  status: AtoutStatus;
  effect: string;
  value: number | null;
  activation: AtoutActivation;
  scope: AtoutScope;
  source_refs: SourceRef[];
  metadata?: Record<string, unknown>;
  source?: EffectSource;
  spec?: EffectSpec;
  fidelity?: EffectFidelity;
  ambiguity_ref?: string | null;
}

interface ParsedBaseAtouts {
  atouts: AtoutEntry[];
  sourceHash: string;
  byName: Map<string, AtoutEntry[]>;
}

interface ParsedLevelAtoutName {
  name: string;
  pointsRaw: string | null;
  valueHint: number | null;
}

interface RaceCatalogEntry {
  id?: string;
  name?: string;
  innate_atouts?: unknown;
  innate_handicaps?: unknown;
}

interface RaceAssetGroup {
  kind: 'atout' | 'handicap';
  name: string;
  raceIds: Set<string>;
  raceNames: Set<string>;
}

const PILOT_EFFECT_SPECS: Record<string, Omit<AtoutEffectFields, 'source'>> = {
  'race-innate-equilibre-controle': {
    spec: {
      target: 'difficulty',
      op: 'sub',
      value: 3,
      condition: { action_type: 'equilibre' },
      activation: 'passive',
      duration: 'permanent'
    },
    fidelity: 'covered'
  },
  'race-innate-flaire-infaillible': {
    spec: {
      target: 'difficulty',
      op: 'sub',
      value: 3,
      condition: { competence: 'odorat' },
      activation: 'passive',
      duration: 'permanent'
    },
    fidelity: 'covered'
  },
  'race-innate-pisteur-ne': {
    spec: {
      target: 'difficulty',
      op: 'sub',
      value: 3,
      condition: { competence: 'pistage' },
      activation: 'passive',
      duration: 'permanent'
    },
    fidelity: 'covered'
  },
  'niveau-2-apaisement-guerrier-justicier': {
    spec: {
      target: 'vitality',
      op: 'add',
      value: 'level',
      condition: { target_disposition: 'ally' },
      activation: 'active',
      duration: 'ephemeral'
    },
    fidelity: 'covered'
  },
  'niveau-2-apaisement-intellectuel-medecin': {
    spec: {
      target: 'vitality',
      op: 'add',
      value: 'level',
      condition: { target_disposition: 'ally' },
      activation: 'active',
      duration: 'ephemeral'
    },
    fidelity: 'covered'
  },
  'niveau-2-auto-soin-guerrier': {
    spec: {
      target: 'vitality',
      op: 'add',
      value: 'level',
      condition: { target_ref: 'self' },
      activation: 'active',
      duration: 'ephemeral'
    },
    fidelity: 'covered'
  },
  'niveau-2-bluff-intellectuel-joueur-de-poker': {
    spec: {
      target: 'difficulty',
      op: 'sub',
      value: 1,
      condition: { competence: 'mensonge' },
      activation: 'passive',
      duration: 'permanent'
    },
    fidelity: 'covered'
  },
  'niveau-2-maitrise-de-la-hache-ouvrier-bucheron': {
    spec: {
      target: 'difficulty',
      op: 'sub',
      value: 1,
      condition: { competence: 'hache' },
      activation: 'passive',
      duration: 'permanent'
    },
    fidelity: 'covered'
  },
  'niveau-2-paluche-ouvrier-bucheron': {
    spec: {
      target: 'damage',
      scope: 'C',
      op: 'add',
      value: 1,
      condition: { action_type: 'coup_de_poing_ou_claque' },
      activation: 'passive',
      duration: 'permanent'
    },
    fidelity: 'covered'
  },
  'niveau-3-accoutumance-a-la-douleur-ouvrier': {
    spec: {
      target: 'difficulty',
      op: 'sub',
      value: 1,
      condition: { aptitude: 'stamina' },
      activation: 'passive',
      duration: 'permanent'
    },
    fidelity: 'covered'
  },
  'niveau-3-coup-mortel-guerrier': {
    spec: {
      target: 'damage',
      op: 'add',
      value: 'level',
      condition: { action_type: 'attaque' },
      activation: 'active',
      duration: 'ephemeral'
    },
    fidelity: 'covered'
  },
  'niveau-3-coup-mortel-hors-la-loi-assassin': {
    spec: {
      target: 'damage',
      op: 'add',
      value: 'level',
      condition: { action_type: 'attaque' },
      activation: 'active',
      duration: 'ephemeral'
    },
    fidelity: 'covered'
  },
  'niveau-3-force-de-l-ours-voyageur': {
    spec: {
      target: 'difficulty',
      op: 'sub',
      value: 1,
      condition: { aptitude: 'strength' },
      activation: 'passive',
      duration: 'permanent'
    },
    fidelity: 'covered'
  },
  'niveau-5-maitre-du-mensonge-artiste-comedien': {
    spec: {
      target: 'pool',
      op: 'add',
      value: 'level',
      condition: { competence: 'mensonge' },
      activation: 'passive',
      duration: 'permanent'
    },
    fidelity: 'covered'
  },
  'niveau-5-maitre-du-mensonge-hors-la-loi': {
    spec: {
      target: 'pool',
      op: 'add',
      value: 'level',
      condition: { competence: 'mensonge' },
      activation: 'passive',
      duration: 'permanent'
    },
    fidelity: 'covered'
  },
  'niveau-5-maitre-du-mensonge-intellectuel-politicien': {
    spec: {
      target: 'pool',
      op: 'add',
      value: 'level',
      condition: { competence: 'mensonge' },
      activation: 'passive',
      duration: 'permanent'
    },
    fidelity: 'covered'
  },
  'niveau-5-orateur-ideal-intellectuel-politicien': {
    spec: {
      target: 'pool',
      op: 'add',
      value: 'level',
      condition: { competence: 'discours-de-foule' },
      activation: 'passive',
      duration: 'permanent'
    },
    fidelity: 'covered'
  },
  'niveau-10-maitre-en-choc-guerrier': {
    spec: {
      target: 'damage',
      scope: 'C',
      op: 'add',
      value: 1,
      activation: 'passive',
      duration: 'permanent'
    },
    fidelity: 'covered'
  },
  'niveau-10-maitre-en-lame-guerrier': {
    spec: {
      target: 'damage',
      scope: 'T',
      op: 'add',
      value: 1,
      activation: 'passive',
      duration: 'permanent'
    },
    fidelity: 'covered'
  },
  'niveau-10-maitre-en-perforation-guerrier': {
    spec: {
      target: 'damage',
      scope: 'P',
      op: 'add',
      value: 1,
      activation: 'passive',
      duration: 'permanent'
    },
    fidelity: 'covered'
  }
};

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseValue(token: string): number | null {
  const cleaned = token.replace(/[^\d-]/g, '');
  if (!cleaned) return null;
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function normalizeCell(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function indexedByName(atouts: AtoutEntry[]): Map<string, AtoutEntry[]> {
  const byName = new Map<string, AtoutEntry[]>();
  for (const atout of atouts) {
    const key = slugify(atout.name);
    byName.set(key, [...(byName.get(key) ?? []), atout]);
  }
  return byName;
}

function findBaseMatch(
  byName: Map<string, AtoutEntry[]>,
  name: string,
  kind: 'atout' | 'handicap' = 'atout'
): AtoutEntry | undefined {
  const matches = byName.get(slugify(name)) ?? [];
  const preferred = matches.find((entry) =>
    kind === 'handicap' ? (entry.value ?? 0) < 0 : (entry.value ?? 0) >= 0
  );
  return preferred ?? matches[0];
}

function uniqueSourceRefs(sourceRefs: SourceRef[]): SourceRef[] {
  const seen = new Set<string>();
  return sourceRefs.filter((sourceRef) => {
    const key = `${sourceRef.path}:${sourceRef.ref}:${sourceRef.sha256}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isEffectFidelity(value: unknown): value is EffectFidelity {
  return value === 'covered' || value === 'ambiguous' || value === 'pending';
}

function readExistingEffectFields(): Map<string, AtoutEffectFields> {
  const overlays = new Map<string, AtoutEffectFields>();
  if (!existsSync(OUTPUT_PATH)) return overlays;

  const parsed = yaml.load(readFileSync(OUTPUT_PATH, 'utf8'));
  if (!isRecord(parsed) || !Array.isArray(parsed.atouts)) return overlays;

  for (const rawAtout of parsed.atouts) {
    if (!isRecord(rawAtout) || typeof rawAtout.id !== 'string') continue;
    if (!isRecord(rawAtout.source) || !isRecord(rawAtout.spec)) continue;
    if (typeof rawAtout.source.prose !== 'string' || typeof rawAtout.source.ref !== 'string') {
      continue;
    }
    if (!isEffectFidelity(rawAtout.fidelity)) continue;

    overlays.set(rawAtout.id, {
      source: {
        prose: rawAtout.source.prose,
        ref: rawAtout.source.ref
      },
      spec: rawAtout.spec,
      fidelity: rawAtout.fidelity,
      ...(typeof rawAtout.ambiguity_ref === 'string' || rawAtout.ambiguity_ref === null
        ? { ambiguity_ref: rawAtout.ambiguity_ref }
        : {})
    });
  }

  return overlays;
}

function sourceRefForEffect(atout: AtoutEntry): string {
  const sourceRef =
    atout.source_refs.find((candidate) => candidate.path === RELATIVE_LEVEL_SOURCE) ??
    atout.source_refs.find((candidate) => candidate.path === RELATIVE_BASE_SOURCE) ??
    atout.source_refs[0];

  if (sourceRef === undefined) {
    throw new Error(`Atout ${atout.id} has no source_refs`);
  }

  return `${sourceRef.path}#${sourceRef.ref}`;
}

function applyEffectFields(
  atouts: AtoutEntry[],
  preservedFields: Map<string, AtoutEffectFields>
): AtoutEntry[] {
  const seenPilotIds = new Set<string>();

  const withEffects = atouts.map((atout) => {
    const pilot = PILOT_EFFECT_SPECS[atout.id];
    if (pilot !== undefined) {
      seenPilotIds.add(atout.id);
      return {
        ...atout,
        source: {
          prose: atout.effect,
          ref: sourceRefForEffect(atout)
        },
        ...pilot
      };
    }

    const preserved = preservedFields.get(atout.id);
    if (preserved === undefined) return atout;

    return {
      ...atout,
      ...preserved
    };
  });

  const missingPilotIds = Object.keys(PILOT_EFFECT_SPECS).filter((id) => !seenPilotIds.has(id));
  if (missingPilotIds.length > 0) {
    throw new Error(`Missing atout effect pilot entries: ${missingPilotIds.join(', ')}`);
  }

  return withEffects;
}

function countEffectSpecsByScope(atouts: AtoutEntry[]): Record<AtoutScope, number> {
  return atouts.reduce<Record<AtoutScope, number>>(
    (acc, atout) => {
      if (atout.spec !== undefined) {
        acc[atout.scope] += 1;
      }
      return acc;
    },
    { classe: 0, neutre: 0, orientation: 0, race: 0, niveau: 0 }
  );
}

function allocateId(idCounter: Map<string, number>, baseId: string): string {
  const occurrence = idCounter.get(baseId) ?? 0;
  idCounter.set(baseId, occurrence + 1);
  if (occurrence === 0) return baseId;
  return `${baseId}-${occurrence}`;
}

function parseBaseAtouts(): ParsedBaseAtouts {
  const content = readFileSync(BASE_SOURCE_PATH, 'utf8');
  const sourceHash = hashContent(content);
  const lines = content.split('\n').map((line) => line.trim());

  const headerIdx = lines.findIndex((line) => line === 'Type');
  if (headerIdx === -1) throw new Error('Header "Type" not found');

  const atouts: AtoutEntry[] = [];
  const idCounter = new Map<string, number>();
  let blockStart = headerIdx + 1;

  for (let i = blockStart; i < lines.length; i += 1) {
    const line = lines[i];
    if (!TYPE_VALUES.has(line)) continue;

    const typeLine = line;
    const activationLine = lines[i - 1];
    const valueLine = lines[i - 2];

    if (!ACTIVATION_VALUES.has(activationLine)) {
      blockStart = i + 1;
      continue;
    }
    const value = parseValue(valueLine);
    if (value === null) {
      blockStart = i + 1;
      continue;
    }

    const blockEnd = i - 3;
    const blockLines = lines.slice(blockStart, blockEnd + 1).filter((l) => l.length > 0);
    if (blockLines.length === 0) {
      blockStart = i + 1;
      continue;
    }

    const name = blockLines[0];
    const effect = blockLines.slice(1).join(' ').trim();

    let id = slugify(name);
    const occ = idCounter.get(id) ?? 0;
    idCounter.set(id, occ + 1);
    if (occ > 0) id = `${id}-${slugify(typeLine)}-${occ}`;

    atouts.push({
      id,
      name,
      status: 'active',
      effect,
      value,
      activation: activationLine === 'Permanent' ? 'permanent' : 'ephemere',
      scope: typeLine.toLowerCase() as AtoutScope,
      source_refs: [{ path: RELATIVE_BASE_SOURCE, sha256: sourceHash, ref: `entry:${id}` }]
    });

    blockStart = i + 1;
  }

  return { atouts, sourceHash, byName: indexedByName(atouts) };
}

function parseLevelAtoutName(token: string): ParsedLevelAtoutName {
  const normalized = normalizeCell(token);
  const match = /^(.*?)\s*:\s*([+-]?\d+%?)$/.exec(normalized);
  if (match === null) {
    return { name: normalized, pointsRaw: null, valueHint: null };
  }
  const name = normalizeCell(match[1] ?? '');
  const pointsRaw = normalizeCell(match[2] ?? '');
  return { name, pointsRaw, valueHint: parseValue(pointsRaw) };
}

function parseMarkdownTableRow(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return null;
  const cells = trimmed
    .slice(1, -1)
    .split('|')
    .map((cell) => normalizeCell(cell));
  if (cells.every((cell) => /^-+$/.test(cell))) return null;
  if (cells[0] === 'Nom') return null;
  return cells;
}

function contextSlug(parts: string[]): string {
  return parts
    .map((part) => slugify(part))
    .filter((part) => part.length > 0)
    .join('-');
}

function parseLevelAtouts(byName: Map<string, AtoutEntry[]>): {
  atouts: AtoutEntry[];
  sourceHash: string;
} {
  const content = readFileSync(LEVEL_SOURCE_PATH, 'utf8');
  const sourceHash = hashContent(content);
  const lines = content.split('\n');
  const atouts: AtoutEntry[] = [];
  const idCounter = new Map<string, number>();
  let currentTable: number | null = null;
  let currentTableRow = 0;

  for (const line of lines) {
    const tableMatch = /^### Tableau (\d+)\s*$/.exec(line.trim());
    if (tableMatch !== null) {
      currentTable = Number.parseInt(tableMatch[1] ?? '0', 10);
      currentTableRow = 0;
      continue;
    }
    if (currentTable === null) continue;

    const cells = parseMarkdownTableRow(line);
    if (cells === null) continue;
    currentTableRow += 1;

    const [nameToken, race = '', orientation = '', characterClass = '', specialCondition = ''] =
      cells;
    const effect = normalizeCell(cells.slice(5).join(' | '));
    const parsedName = parseLevelAtoutName(nameToken ?? '');
    if (parsedName.name.length === 0) continue;

    const scope: AtoutScope = race.length > 0 ? 'race' : 'niveau';
    const baseMatch = findBaseMatch(byName, parsedName.name);
    const qualifier = contextSlug([race, orientation, characterClass]);
    const baseId = [scope, String(currentTable + 1), slugify(parsedName.name), qualifier]
      .filter((part) => part.length > 0)
      .join('-');
    const id = allocateId(idCounter, baseId);

    atouts.push({
      id,
      name: parsedName.name,
      status: 'active',
      effect,
      value: baseMatch?.value ?? parsedName.valueHint,
      activation: baseMatch?.activation ?? 'unknown',
      scope,
      source_refs: uniqueSourceRefs([
        {
          path: RELATIVE_LEVEL_SOURCE,
          sha256: sourceHash,
          ref: `tableau:${currentTable}:row:${currentTableRow}`
        },
        ...(baseMatch?.source_refs ?? [])
      ]),
      metadata: {
        source_kind: 'level_asset',
        minimum_level: currentTable + 1,
        table: currentTable,
        row: currentTableRow,
        points_raw: parsedName.pointsRaw,
        race: race || null,
        orientation: orientation || null,
        class: characterClass || null,
        special_condition: specialCondition || null,
        value_source: baseMatch === undefined ? 'level_table' : 'base_atouts',
        matched_base_atout_id: baseMatch?.id ?? null
      }
    });
  }

  return { atouts, sourceHash };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function parseRaceCatalogAtouts(byName: Map<string, AtoutEntry[]>): {
  atouts: AtoutEntry[];
  sourceHash: string;
} {
  const content = readFileSync(RACES_CATALOG_PATH, 'utf8');
  const sourceHash = hashContent(content);
  const parsed = yaml.load(content);
  if (!isRecord(parsed) || !Array.isArray(parsed.races)) {
    throw new Error(`${RELATIVE_RACES_CATALOG} is not a valid races catalog`);
  }

  const groups = new Map<string, RaceAssetGroup>();
  for (const item of parsed.races) {
    if (!isRecord(item)) continue;
    const race = item as RaceCatalogEntry;
    if (typeof race.name !== 'string') continue;
    const raceName = race.name;
    const raceId = typeof race.id === 'string' ? race.id : slugify(raceName);

    for (const assetName of toStringArray(race.innate_atouts)) {
      const key = `atout:${slugify(assetName)}`;
      const group = groups.get(key) ?? {
        kind: 'atout',
        name: assetName,
        raceIds: new Set<string>(),
        raceNames: new Set<string>()
      };
      group.raceIds.add(raceId);
      group.raceNames.add(raceName);
      groups.set(key, group);
    }

    for (const assetName of toStringArray(race.innate_handicaps)) {
      const key = `handicap:${slugify(assetName)}`;
      const group = groups.get(key) ?? {
        kind: 'handicap',
        name: assetName,
        raceIds: new Set<string>(),
        raceNames: new Set<string>()
      };
      group.raceIds.add(raceId);
      group.raceNames.add(raceName);
      groups.set(key, group);
    }
  }

  const idCounter = new Map<string, number>();
  const atouts = [...groups.values()]
    .sort(
      (left, right) => left.name.localeCompare(right.name) || left.kind.localeCompare(right.kind)
    )
    .map((group) => {
      const baseMatch = findBaseMatch(byName, group.name, group.kind);
      const idPrefix = group.kind === 'handicap' ? 'race-innate-handicap' : 'race-innate';
      const id = allocateId(idCounter, `${idPrefix}-${slugify(group.name)}`);
      const relationStatus =
        baseMatch === undefined ? 'unmatched_race_catalog_name' : 'matched_by_name';

      return {
        id,
        name: group.name,
        status: baseMatch === undefined ? 'raw_reference_only' : 'active',
        effect: baseMatch?.effect ?? '',
        value: baseMatch?.value ?? null,
        activation: baseMatch?.activation ?? 'unknown',
        scope: 'race',
        source_refs: uniqueSourceRefs([
          {
            path: RELATIVE_RACES_CATALOG,
            sha256: sourceHash,
            ref: `innate:${group.kind}:${slugify(group.name)}`
          },
          ...(baseMatch?.source_refs ?? [])
        ]),
        metadata: {
          source_kind: `race_catalog_innate_${group.kind}`,
          race_ids: [...group.raceIds].sort(),
          race_names: [...group.raceNames].sort((left, right) => left.localeCompare(right)),
          relation_status: relationStatus,
          matched_base_atout_id: baseMatch?.id ?? null
        }
      } satisfies AtoutEntry;
    });

  return { atouts, sourceHash };
}

function main(): void {
  const preservedEffectFields = readExistingEffectFields();
  const base = parseBaseAtouts();
  const level = parseLevelAtouts(base.byName);
  const raceCatalog = parseRaceCatalogAtouts(base.byName);
  const atouts = applyEffectFields(
    [...base.atouts, ...level.atouts, ...raceCatalog.atouts],
    preservedEffectFields
  );
  const effectSpecsByScope = countEffectSpecsByScope(atouts);
  const effectSpecsCount = Object.values(effectSpecsByScope).reduce((sum, count) => sum + count, 0);
  const today = new Date().toISOString().slice(0, 10);

  const payload = {
    version: 1,
    metadata: {
      source: RELATIVE_BASE_SOURCE,
      source_sha256: base.sourceHash,
      sources: [
        { path: RELATIVE_BASE_SOURCE, sha256: base.sourceHash, kind: 'web_assets_list' },
        { path: RELATIVE_LEVEL_SOURCE, sha256: level.sourceHash, kind: 'web_level_assets' },
        {
          path: RELATIVE_RACES_CATALOG,
          sha256: raceCatalog.sourceHash,
          kind: 'derived_races_catalog'
        }
      ],
      imported_at: today,
      total_entries: atouts.length,
      base_entries: base.atouts.length,
      level_entries: level.atouts.length,
      race_catalog_entries: raceCatalog.atouts.length,
      effect_specs: effectSpecsCount,
      effect_specs_by_scope: effectSpecsByScope,
      catalog_status: 'expanded',
      notes:
        'Atouts/handicaps extraits de la liste web canonique (assets-list), des tableaux atouts-niveaux et des atouts/handicaps innés du catalogue races. Scopes: classe / neutre / orientation / race / niveau. Activation unknown et value null signalent une relation source sans valeur explicite dans la liste de base. Les specs EffectModel existantes sont préservées et le pilote #127 encode un lot audité race+niveau.'
    },
    atouts
  };

  const yamlOutput = yaml.dump(payload, {
    lineWidth: 120,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false
  });
  const banner = '# Generated by `pnpm catalogs:build:atouts`. Do not edit by hand.\n';
  writeFileSync(OUTPUT_PATH, banner + yamlOutput, 'utf8');

  execFileSync('pnpm', ['exec', 'prettier', '--write', OUTPUT_PATH], {
    cwd: ROOT,
    stdio: 'inherit'
  });
  console.log(`Wrote ${OUTPUT_PATH} (${atouts.length} atouts)`);
}

main();
