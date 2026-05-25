import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import yaml from 'js-yaml';

const ROOT = join(import.meta.dirname ?? __dirname, '..');
const SOURCE_PATH = join(ROOT, 'data/legacy/web-scraped/documents/competences/index.md');
const NATIVE_ADDITIONS_PATH = join(ROOT, 'data/catalogs/competences.native.yaml');
const CANON_RULES_PATH = join(ROOT, 'docs/rules/05-competences.md');
const OUTPUT_PATH = join(ROOT, 'data/catalogs/competences.yaml');
const RELATIVE_SOURCE_PATH = 'data/legacy/web-scraped/documents/competences/index.md';
const RELATIVE_NATIVE_ADDITIONS_PATH = 'data/catalogs/competences.native.yaml';
const RELATIVE_CANON_RULES_PATH = 'docs/rules/05-competences.md';

const FAMILIES = new Set([
  'Art',
  'Artisanat',
  'Combat',
  'Connaissance',
  'Jeu',
  'Maîtrise de soi',
  'Savoir-faire',
  'Sens',
  'Social',
  'Sport'
]);

interface SourceRef {
  path: string;
  sha256: string;
  ref: string;
}

interface SkillEntry {
  id: string;
  name: string;
  status: 'active';
  family: string;
  family_name: string;
  parent_id: string | null;
  source_refs: SourceRef[];
  metadata: Record<string, unknown>;
}

interface NativeSkillInput {
  id: string;
  name: string;
  family: string;
  parent_id: string | null;
}

interface NativeSkillUpdate {
  id: string;
  parent_id?: string | null;
  family?: string;
}

interface NativeAdditions {
  skills: NativeSkillInput[];
  existingSkillUpdates: NativeSkillUpdate[];
  sourceHash: string;
  rulesHash: string;
}

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function hashContent(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, context: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${context} must be a non-empty string`);
  }

  return value;
}

function readNullableString(value: unknown, context: string): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  return requireString(value, context);
}

function familyNameFor(value: string): string {
  for (const family of FAMILIES) {
    if (family === value || slugify(family) === value) {
      return family;
    }
  }

  throw new Error(`Unknown skill family "${value}"`);
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

function parse(): { skills: SkillEntry[]; sourceHash: string; relativeSourcePath: string } {
  const content = readFileSync(SOURCE_PATH, 'utf8');
  const sourceHash = hashContent(content);
  const relativeSourcePath = RELATIVE_SOURCE_PATH;
  const lines = content.split('\n');

  const startIdx = lines.findIndex((line) => line.trim() === 'Liste des compétences');
  if (startIdx === -1) {
    throw new Error('Source preamble "Liste des compétences" not found');
  }

  const skills: SkillEntry[] = [];
  let currentFamily: string | null = null;
  const idsSeen = new Map<string, number>();
  const knownSkillIds = new Set<string>();
  const knownByName: Array<{ id: string; name: string }> = [];

  for (let i = startIdx + 1; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    if (FAMILIES.has(trimmed)) {
      currentFamily = trimmed;
      continue;
    }

    if (!currentFamily) continue;

    const parenMatch = trimmed.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    const rawName = parenMatch ? parenMatch[1].trim() : trimmed;
    const parentText = parenMatch ? parenMatch[2].trim() : null;
    const baseId = slugify(rawName);

    let parentId: string | null = null;
    if (parentText) {
      const candidate = slugify(parentText);
      if (knownSkillIds.has(candidate)) {
        parentId = candidate;
      }
    }

    if (parentId === null) {
      const lower = rawName.toLowerCase();
      let best: { id: string; name: string } | null = null;
      for (const known of knownByName) {
        const prefix = `${known.name.toLowerCase()} `;
        if (lower.startsWith(prefix) && (!best || known.name.length > best.name.length)) {
          best = known;
        }
      }
      if (best) {
        parentId = best.id;
      }
    }

    const occurrence = idsSeen.get(baseId) ?? 0;
    idsSeen.set(baseId, occurrence + 1);
    let id: string;
    if (occurrence === 0) {
      id = baseId;
    } else if (parentId) {
      id = `${baseId}-${parentId}`;
    } else {
      id = `${baseId}-${slugify(currentFamily)}-${occurrence}`;
    }

    skills.push({
      id,
      name: rawName,
      status: 'active',
      family: slugify(currentFamily),
      family_name: currentFamily,
      parent_id: parentId,
      source_refs: [
        {
          path: relativeSourcePath,
          sha256: sourceHash,
          ref: `line:${i + 1}`
        }
      ],
      metadata: {
        source: 'web-canonical'
      }
    });
    knownSkillIds.add(id);
    knownByName.push({ id, name: rawName });
  }

  return { skills, sourceHash, relativeSourcePath };
}

function parseNativeSkillInput(raw: unknown, index: number): NativeSkillInput {
  if (!isRecord(raw)) {
    throw new Error(`Native skill entry ${index} must be an object`);
  }

  return {
    id: requireString(raw.id, `Native skill entry ${index}.id`),
    name: requireString(raw.name, `Native skill entry ${index}.name`),
    family: requireString(raw.family, `Native skill entry ${index}.family`),
    parent_id: readNullableString(raw.parent_id, `Native skill entry ${index}.parent_id`)
  };
}

function parseNativeSkillUpdate(raw: unknown, index: number): NativeSkillUpdate {
  if (!isRecord(raw)) {
    throw new Error(`Native skill update ${index} must be an object`);
  }

  const update: NativeSkillUpdate = {
    id: requireString(raw.id, `Native skill update ${index}.id`)
  };

  if ('parent_id' in raw) {
    update.parent_id = readNullableString(raw.parent_id, `Native skill update ${index}.parent_id`);
  }

  if ('family' in raw) {
    update.family = requireString(raw.family, `Native skill update ${index}.family`);
  }

  return update;
}

function parseNativeAdditions(existingSkills: SkillEntry[]): NativeAdditions {
  const content = readFileSync(NATIVE_ADDITIONS_PATH, 'utf8');
  const rulesContent = readFileSync(CANON_RULES_PATH, 'utf8');
  const sourceHash = hashContent(content);
  const rulesHash = hashContent(rulesContent);
  const parsed = yaml.load(content);

  if (!isRecord(parsed)) {
    throw new Error(`${RELATIVE_NATIVE_ADDITIONS_PATH} must contain a YAML object`);
  }

  const skillsRaw = parsed.skills;
  if (!Array.isArray(skillsRaw)) {
    throw new Error(`${RELATIVE_NATIVE_ADDITIONS_PATH}.skills must be an array`);
  }

  const updatesRaw = parsed.existing_skill_updates;
  if (updatesRaw !== undefined && !Array.isArray(updatesRaw)) {
    throw new Error(`${RELATIVE_NATIVE_ADDITIONS_PATH}.existing_skill_updates must be an array`);
  }

  const existingIds = new Set(existingSkills.map((skill) => skill.id));
  const nativeIds = new Set<string>();
  const skills = skillsRaw.map((entry, index) => {
    const skill = parseNativeSkillInput(entry, index);
    if (existingIds.has(skill.id)) {
      throw new Error(`Native skill "${skill.id}" duplicates a web-canonical skill id`);
    }
    if (nativeIds.has(skill.id)) {
      throw new Error(`Duplicate native skill id "${skill.id}"`);
    }
    nativeIds.add(skill.id);
    return skill;
  });

  const knownIds = new Set([...existingIds, ...nativeIds]);
  for (const skill of skills) {
    familyNameFor(skill.family);
    if (skill.parent_id !== null && !knownIds.has(skill.parent_id)) {
      throw new Error(`Native skill "${skill.id}" references unknown parent "${skill.parent_id}"`);
    }
  }

  const existingSkillUpdates = (updatesRaw ?? []).map((entry, index) => {
    const update = parseNativeSkillUpdate(entry, index);
    if (!knownIds.has(update.id)) {
      throw new Error(`Native skill update references unknown skill "${update.id}"`);
    }
    if (
      update.parent_id !== undefined &&
      update.parent_id !== null &&
      !knownIds.has(update.parent_id)
    ) {
      throw new Error(
        `Native skill update "${update.id}" references unknown parent "${update.parent_id}"`
      );
    }
    if (update.family !== undefined) {
      familyNameFor(update.family);
    }
    return update;
  });

  return { skills, existingSkillUpdates, sourceHash, rulesHash };
}

function nativeSourceRefs(sourceHash: string, rulesHash: string, ref: string): SourceRef[] {
  return [
    {
      path: RELATIVE_NATIVE_ADDITIONS_PATH,
      sha256: sourceHash,
      ref
    },
    {
      path: RELATIVE_CANON_RULES_PATH,
      sha256: rulesHash,
      ref: 'R-5.2'
    }
  ];
}

function buildNativeSkills(nativeAdditions: NativeAdditions): SkillEntry[] {
  return nativeAdditions.skills.map((skill) => {
    const familyName = familyNameFor(skill.family);

    return {
      id: skill.id,
      name: skill.name,
      status: 'active',
      family: slugify(familyName),
      family_name: familyName,
      parent_id: skill.parent_id,
      source_refs: nativeSourceRefs(
        nativeAdditions.sourceHash,
        nativeAdditions.rulesHash,
        `entry:${skill.id}`
      ),
      metadata: {
        source: 'native',
        source_kind: 'kw-canon',
        canon_ref: 'R-5.2'
      }
    };
  });
}

function applyNativeSkillUpdates(skills: SkillEntry[], nativeAdditions: NativeAdditions): void {
  const byId = new Map(skills.map((skill) => [skill.id, skill]));

  for (const update of nativeAdditions.existingSkillUpdates) {
    const skill = byId.get(update.id);
    if (skill === undefined) {
      throw new Error(`Native skill update references unknown skill "${update.id}"`);
    }

    if (update.parent_id !== undefined) {
      skill.parent_id = update.parent_id;
    }

    if (update.family !== undefined) {
      const familyName = familyNameFor(update.family);
      skill.family = slugify(familyName);
      skill.family_name = familyName;
    }

    skill.source_refs = uniqueSourceRefs([
      ...skill.source_refs,
      ...nativeSourceRefs(
        nativeAdditions.sourceHash,
        nativeAdditions.rulesHash,
        `update:${update.id}`
      )
    ]);
    skill.metadata = {
      ...skill.metadata,
      native_update: {
        source: 'native',
        source_kind: 'kw-canon',
        canon_ref: 'R-5.2'
      }
    };
  }
}

function buildCatalog(): unknown {
  const { skills, sourceHash, relativeSourcePath } = parse();
  const nativeAdditions = parseNativeAdditions(skills);
  const allSkills = [...skills, ...buildNativeSkills(nativeAdditions)];
  applyNativeSkillUpdates(allSkills, nativeAdditions);

  return {
    version: 1,
    metadata: {
      source: relativeSourcePath,
      source_sha256: sourceHash,
      sources: [
        { path: relativeSourcePath, sha256: sourceHash, kind: 'web-canonical' },
        {
          path: RELATIVE_NATIVE_ADDITIONS_PATH,
          sha256: nativeAdditions.sourceHash,
          kind: 'native-additions'
        },
        {
          path: RELATIVE_CANON_RULES_PATH,
          sha256: nativeAdditions.rulesHash,
          kind: 'kw-canon-rule'
        }
      ],
      imported_at: new Date().toISOString().slice(0, 10),
      total_entries: allSkills.length,
      total_families: 10,
      native_entries: nativeAdditions.skills.length,
      native_updates: nativeAdditions.existingSkillUpdates.length,
      catalog_kind: 'open',
      catalog_status: 'partial',
      notes:
        'Compétences extraites de la liste web canonique, complétées par data/catalogs/competences.native.yaml au titre du catalogue ouvert R-5.2. Hiérarchie parent_id explicite uniquement quand "(parent)" est notée dans la source ou quand une addition native la fixe. Spécialisations implicites à raffiner ensuite (R-5.3, R-5.7).'
    },
    skills: allSkills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      status: skill.status,
      family: skill.family,
      family_name: skill.family_name,
      parent_id: skill.parent_id,
      source_refs: skill.source_refs,
      metadata: skill.metadata
    }))
  };
}

function main(): void {
  const catalog = buildCatalog();
  const yamlOutput = yaml.dump(catalog, {
    lineWidth: 120,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false
  });
  const banner = '# Generated by `pnpm catalogs:build:competences`. Do not edit by hand.\n';
  writeFileSync(OUTPUT_PATH, banner + yamlOutput, 'utf8');
  execFileSync('pnpm', ['exec', 'prettier', '--write', OUTPUT_PATH], {
    cwd: ROOT,
    stdio: 'inherit'
  });
  console.log(`Wrote ${OUTPUT_PATH}`);
}

main();
