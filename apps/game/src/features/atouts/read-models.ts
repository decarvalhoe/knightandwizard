import { getCatalogDocument } from '@/lib/catalogs';

const HIGHLIGHT_ATOUT_IDS = [
  'ambidextrie',
  'adrenaline',
  'race-innate-vision-nocturne',
  'niveau-2-agitateur-voyageur-berzerker'
] as const;

const FOCUS_SKILL_IDS = [
  'archerie',
  'esquive',
  'cartographie',
  'medecine',
  'furtivite',
  'equitation'
] as const;

export interface AtoutsCatalogDocument {
  atouts?: AtoutCatalogEntry[];
  metadata?: CatalogMetadata;
}

export interface SkillsCatalogDocument {
  metadata?: CatalogMetadata;
  skills?: SkillCatalogEntry[];
}

export interface CatalogMetadata {
  source?: string;
  total_entries?: number;
}

export interface AtoutCatalogEntry {
  activation?: AtoutActivation;
  effect?: string;
  id?: string;
  metadata?: Record<string, unknown>;
  name?: string;
  scope?: AtoutScope;
  status?: CatalogStatus;
  value?: number | null;
}

export interface SkillCatalogEntry {
  family?: string;
  family_name?: string;
  id?: string;
  name?: string;
  parent_id?: string | null;
  status?: CatalogStatus;
}

export type CatalogStatus = 'active' | 'ambiguous' | 'deprecated' | 'raw_reference_only' | string;
export type AtoutActivation = 'permanent' | 'ephemere' | 'unknown' | string;
export type AtoutScope = 'classe' | 'neutre' | 'orientation' | 'race' | 'niveau' | string;

export interface AtoutsCompanionView {
  activationBreakdown: BreakdownItem[];
  browseAtouts: AtoutSummary[];
  focusSkills: SkillSummary[];
  highlightAtouts: AtoutSummary[];
  skillFamilies: SkillFamilySummary[];
  sourceLabels: {
    atouts: string;
    skills: string;
  };
  scopeBreakdown: BreakdownItem[];
  stats: AtoutsCompanionStats;
}

export interface AtoutsCompanionStats {
  activeAtouts: number;
  atoutTotal: number;
  ephemereAtouts: number;
  families: number;
  permanentAtouts: number;
  rawReferenceAtouts: number;
  skillTotal: number;
}

export interface AtoutSummary {
  activation: AtoutActivation;
  effect: string;
  id: string;
  name: string;
  scope: AtoutScope;
  status: CatalogStatus;
  value: number | null;
}

export interface SkillSummary {
  family: string;
  familyLabel: string;
  id: string;
  name: string;
  parentId: string | null;
  status: CatalogStatus;
}

export interface SkillFamilySummary {
  family: string;
  label: string;
  total: number;
}

export interface BreakdownItem {
  count: number;
  key: string;
  label: string;
  percent: number;
}

export async function getAtoutsCompanionReadModel(): Promise<AtoutsCompanionView> {
  const [atouts, skills] = await Promise.all([
    getCatalogDocument<AtoutsCatalogDocument>('atouts.yaml'),
    getCatalogDocument<SkillsCatalogDocument>('competences.yaml')
  ]);

  return buildAtoutsCompanionView({ atouts, skills });
}

export function buildAtoutsCompanionView({
  atouts,
  skills
}: {
  atouts: AtoutsCatalogDocument;
  skills: SkillsCatalogDocument;
}): AtoutsCompanionView {
  const atoutEntries = (atouts.atouts ?? []).filter(isDisplayableAtout).map(toAtoutSummary);
  const skillEntries = (skills.skills ?? []).filter(isDisplayableSkill).map(toSkillSummary);

  return {
    activationBreakdown: buildBreakdown(atoutEntries, (atout) => atout.activation),
    browseAtouts: atoutEntries
      .filter((atout) => atout.status === 'active')
      .sort((left, right) => left.name.localeCompare(right.name, 'fr')),
    focusSkills: selectPreferred(skillEntries, FOCUS_SKILL_IDS, 6),
    highlightAtouts: selectPreferred(
      atoutEntries.filter((atout) => atout.status === 'active'),
      HIGHLIGHT_ATOUT_IDS,
      4
    ),
    skillFamilies: buildSkillFamilies(skillEntries),
    sourceLabels: {
      atouts: humanizeSourceLabel(atouts.metadata?.source, 'Atouts'),
      skills: humanizeSourceLabel(skills.metadata?.source, 'Compétences')
    },
    scopeBreakdown: buildBreakdown(atoutEntries, (atout) => atout.scope),
    stats: {
      activeAtouts: atoutEntries.filter((atout) => atout.status === 'active').length,
      atoutTotal: atoutEntries.length,
      ephemereAtouts: atoutEntries.filter((atout) => atout.activation === 'ephemere').length,
      families: new Set(skillEntries.map((skill) => skill.family)).size,
      permanentAtouts: atoutEntries.filter((atout) => atout.activation === 'permanent').length,
      rawReferenceAtouts: atoutEntries.filter((atout) => atout.status === 'raw_reference_only')
        .length,
      skillTotal: skillEntries.length
    }
  };
}

function isDisplayableAtout(
  entry: AtoutCatalogEntry
): entry is RequiredNameAndId<AtoutCatalogEntry> {
  return Boolean(entry.id && entry.name);
}

function isDisplayableSkill(
  entry: SkillCatalogEntry
): entry is RequiredNameAndId<SkillCatalogEntry> {
  return Boolean(entry.id && entry.name);
}

type RequiredNameAndId<Entry extends { id?: string; name?: string }> = Entry & {
  id: string;
  name: string;
};

function toAtoutSummary(entry: RequiredNameAndId<AtoutCatalogEntry>): AtoutSummary {
  return {
    activation: entry.activation ?? 'unknown',
    effect: entry.effect ?? '',
    id: entry.id,
    name: entry.name,
    scope: entry.scope ?? 'neutre',
    status: entry.status ?? 'active',
    value: typeof entry.value === 'number' ? entry.value : null
  };
}

function toSkillSummary(entry: RequiredNameAndId<SkillCatalogEntry>): SkillSummary {
  const family = entry.family ?? 'non-classee';

  return {
    family,
    familyLabel: entry.family_name ?? family,
    id: entry.id,
    name: entry.name,
    parentId: entry.parent_id ?? null,
    status: entry.status ?? 'active'
  };
}

function selectPreferred<Entry extends { id: string }>(
  entries: Entry[],
  preferredIds: readonly string[],
  limit: number
): Entry[] {
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  const selected = preferredIds
    .map((id) => byId.get(id))
    .filter((entry): entry is Entry => Boolean(entry));
  const selectedIds = new Set(selected.map((entry) => entry.id));

  for (const entry of entries) {
    if (selected.length >= limit) break;
    if (!selectedIds.has(entry.id)) {
      selected.push(entry);
      selectedIds.add(entry.id);
    }
  }

  return selected.slice(0, limit);
}

function buildSkillFamilies(skills: SkillSummary[]): SkillFamilySummary[] {
  const families = new Map<string, SkillFamilySummary>();

  for (const skill of skills) {
    const existing = families.get(skill.family);
    if (existing) {
      existing.total += 1;
    } else {
      families.set(skill.family, {
        family: skill.family,
        label: skill.familyLabel,
        total: 1
      });
    }
  }

  return [...families.values()]
    .sort((left, right) => right.total - left.total || left.label.localeCompare(right.label))
    .slice(0, 6);
}

function buildBreakdown<Entry>(
  entries: Entry[],
  pickKey: (entry: Entry) => string | undefined
): BreakdownItem[] {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    const key = pickKey(entry) ?? 'unknown';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([key, count]) => ({
      count,
      key,
      label: labelCatalogKey(key),
      percent: entries.length === 0 ? 0 : Math.round((count / entries.length) * 100)
    }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

function labelCatalogKey(key: string): string {
  const labels: Record<string, string> = {
    classe: 'Classe',
    ephemere: 'Ephemere',
    niveau: 'Niveau',
    neutre: 'Neutre',
    orientation: 'Orientation',
    permanent: 'Permanent',
    race: 'Race',
    unknown: 'Inconnu'
  };

  return labels[key] ?? key;
}

function humanizeSourceLabel(source: string | undefined, fallback: string): string {
  if (!source) return fallback;
  if (source.includes('/atouts/')) return 'Atouts web';
  if (source.includes('competences')) return 'Compétences';

  return fallback;
}
