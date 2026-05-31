import { getCatalogDocument } from '@/lib/catalogs';

export interface SpellsCatalogDocument {
  metadata?: {
    source?: string;
    total_entries?: number;
  };
  spells?: SpellCatalogEntry[];
}

export interface SpellCatalogEntry {
  difficulty?: number;
  effect?: string;
  energy?: number;
  id?: string;
  incantation_time?: number;
  name?: string;
  prose_refs?: unknown[];
  school_id?: string;
  status?: string;
  value?: number;
}

export interface MagicSchoolsCatalogDocument {
  metadata?: {
    source?: string;
    total_entries?: number;
  };
  schools?: MagicSchoolCatalogEntry[];
}

export interface MagicSchoolCatalogEntry {
  color?: string;
  domain?: string;
  id?: string;
  name?: string;
  specialist_class_id?: string;
  status?: string;
}

export interface GrimoireReadModel {
  metrics: {
    lexiqueLinkedSpells: number;
    schools: number;
    spells: number;
  };
  schoolSummaries: GrimoireSchoolSummary[];
  sourceLabels: string[];
  spells: GrimoireSpellView[];
}

export interface GrimoireSchoolSummary {
  color: string;
  domain: string;
  id: string;
  name: string;
  spellCount: number;
}

export interface GrimoireSpellView {
  difficulty: number | null;
  effect: string;
  energy: number | null;
  id: string;
  incantationTime: number | null;
  isLexiqueLinked: boolean;
  name: string;
  schoolId: string;
  schoolName: string;
  value: number | null;
}

export async function getGrimoireReadModel(): Promise<GrimoireReadModel> {
  const [spells, schools] = await Promise.all([
    getCatalogDocument<SpellsCatalogDocument>('spells.yaml'),
    getCatalogDocument<MagicSchoolsCatalogDocument>('magic-schools.yaml')
  ]);

  return buildGrimoireReadModel({ schools, spells });
}

export function buildGrimoireReadModel({
  schools,
  spells
}: {
  schools: MagicSchoolsCatalogDocument;
  spells: SpellsCatalogDocument;
}): GrimoireReadModel {
  const schoolEntries = (schools.schools ?? []).filter(isDisplayableSchool);
  const schoolById = new Map(schoolEntries.map((school) => [school.id, school]));
  const spellEntries = (spells.spells ?? [])
    .filter(isDisplayableSpell)
    .map((spell) => toSpellView(spell, schoolById))
    .sort((left, right) => left.name.localeCompare(right.name, 'fr'));
  const spellCounts = countSpellsBySchool(spellEntries);

  return {
    metrics: {
      lexiqueLinkedSpells: spellEntries.filter((spell) => spell.isLexiqueLinked).length,
      schools: schoolEntries.length,
      spells: spellEntries.length
    },
    schoolSummaries: schoolEntries.map((school) => ({
      color: school.color ?? 'inconnue',
      domain: school.domain ?? 'Domaine non renseigné',
      id: school.id,
      name: school.name,
      spellCount: spellCounts.get(school.id) ?? 0
    })),
    sourceLabels: [
      ...new Set([
        humanizeSourceLabel(spells.metadata?.source, 'Sorts web'),
        humanizeSourceLabel(schools.metadata?.source, 'Écoles de magie')
      ])
    ],
    spells: spellEntries
  };
}

function isDisplayableSchool(
  entry: MagicSchoolCatalogEntry
): entry is RequiredNameAndId<MagicSchoolCatalogEntry> {
  return entry.status === 'active' && Boolean(entry.id && entry.name);
}

function isDisplayableSpell(
  entry: SpellCatalogEntry
): entry is RequiredNameAndId<SpellCatalogEntry> {
  return entry.status === 'active' && Boolean(entry.id && entry.name);
}

type RequiredNameAndId<Entry extends { id?: string; name?: string }> = Entry & {
  id: string;
  name: string;
};

function toSpellView(
  spell: RequiredNameAndId<SpellCatalogEntry>,
  schoolById: Map<string, RequiredNameAndId<MagicSchoolCatalogEntry>>
): GrimoireSpellView {
  const schoolId = spell.school_id ?? 'unknown';
  const school = schoolById.get(schoolId);

  return {
    difficulty: typeof spell.difficulty === 'number' ? spell.difficulty : null,
    effect: spell.effect ?? 'Effet non renseigné',
    energy: typeof spell.energy === 'number' ? spell.energy : null,
    id: spell.id,
    incantationTime: typeof spell.incantation_time === 'number' ? spell.incantation_time : null,
    isLexiqueLinked: Array.isArray(spell.prose_refs) && spell.prose_refs.length > 0,
    name: spell.name,
    schoolId,
    schoolName: school?.name ?? 'École inconnue',
    value: typeof spell.value === 'number' ? spell.value : null
  };
}

function countSpellsBySchool(spells: GrimoireSpellView[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const spell of spells) {
    counts.set(spell.schoolId, (counts.get(spell.schoolId) ?? 0) + 1);
  }

  return counts;
}

function humanizeSourceLabel(source: string | undefined, fallback: string): string {
  if (!source) return fallback;
  if (source.includes('/grimoire/')) return 'Grand Grimoire web';

  return fallback;
}
