type AttributeKey =
  | 'aestheticism'
  | 'charisma'
  | 'dexterity'
  | 'empathy'
  | 'intelligence'
  | 'perception'
  | 'reflexes'
  | 'stamina'
  | 'strength';

type AttributeMax = Record<AttributeKey, number>;

export interface BestiaryCatalogDocument {
  metadata?: {
    source_files?: Array<{ path?: string }>;
    total_entries?: number;
  };
  creatures: BestiaryCatalogCreature[];
}

export interface BestiaryCatalogCreature {
  attribute_max: AttributeMax;
  category: string;
  habitat?: string[];
  id: string;
  innate_atouts?: string[];
  innate_handicaps?: string[];
  language_capable: boolean;
  life_expectancy: number;
  lore?: string;
  name: string;
  playable: boolean;
  resistances?: Array<{ type?: string; value?: number | string }>;
  size_m: number;
  social_structure?: string;
  speed_factor_base: number;
  status: string;
  vitality_base: number;
  will_factor_base: number;
  xp_category: number;
}

export interface BestiarySurfaceView {
  categorySummaries: CategorySummary[];
  entries: BestiaryEntryView[];
  metrics: BestiaryMetrics;
  sourceFiles: SourceFileView[];
}

export interface BestiaryEntryView {
  attributeMaxItems: Array<{ label: string; value: number }>;
  category: string;
  habitat: string[];
  id: string;
  innateAtouts: string[];
  innateHandicaps: string[];
  languageLabel: string;
  lifeExpectancyLabel: string;
  lore: string | null;
  name: string;
  playable: boolean;
  playableLabel: string;
  resistanceLabels: string[];
  sizeLabel: string;
  socialStructure: string | null;
  sourceName: string;
  speedFactor: number;
  vitalityBase: number;
  willFactor: number;
  xpCategory: number;
}

export interface BestiaryMetrics {
  activeEntries: number;
  categories: number;
  nonPlayableEntries: number;
  playableEntries: number;
}

export interface CategorySummary {
  category: string;
  count: number;
}

export interface SourceFileView {
  path: string;
}

const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  aestheticism: 'Esthetisme',
  charisma: 'Charisme',
  dexterity: 'Dexterite',
  empathy: 'Empathie',
  intelligence: 'Intelligence',
  perception: 'Perception',
  reflexes: 'Reflexes',
  stamina: 'Endurance',
  strength: 'Force'
};

const ATTRIBUTE_ORDER: AttributeKey[] = [
  'strength',
  'dexterity',
  'stamina',
  'reflexes',
  'perception',
  'intelligence',
  'empathy',
  'charisma',
  'aestheticism'
];

export function buildBestiarySurfaceView(catalog: BestiaryCatalogDocument): BestiarySurfaceView {
  const entries = (catalog.creatures ?? [])
    .filter(isActiveCreature)
    .map((creature) => toEntryView(creature));
  const categorySummaries = toCategorySummaries(entries);
  const playableEntries = entries.filter((entry) => entry.playable).length;

  return {
    categorySummaries,
    entries,
    metrics: {
      activeEntries: entries.length,
      categories: categorySummaries.length,
      nonPlayableEntries: entries.length - playableEntries,
      playableEntries
    },
    sourceFiles: (catalog.metadata?.source_files ?? []).flatMap((source) =>
      source.path ? [{ path: source.path }] : []
    )
  };
}

function isActiveCreature(creature: BestiaryCatalogCreature): boolean {
  return creature.status === 'active' && Boolean(creature.id) && Boolean(creature.name);
}

function toEntryView(creature: BestiaryCatalogCreature): BestiaryEntryView {
  return {
    attributeMaxItems: ATTRIBUTE_ORDER.map((key) => ({
      label: ATTRIBUTE_LABELS[key],
      value: creature.attribute_max[key]
    })),
    category: creature.category,
    habitat: creature.habitat ?? [],
    id: creature.id,
    innateAtouts: creature.innate_atouts ?? [],
    innateHandicaps: creature.innate_handicaps ?? [],
    languageLabel: creature.language_capable ? 'Langage articule' : 'Non verbal',
    lifeExpectancyLabel: formatLifeExpectancy(creature.life_expectancy),
    lore: creature.lore ?? null,
    name: cleanCreatureName(creature.name),
    playable: creature.playable,
    playableLabel: creature.playable ? 'Race jouable' : 'Creature MJ',
    resistanceLabels: (creature.resistances ?? []).flatMap(formatResistance),
    sizeLabel: `${formatNumber(creature.size_m)} m`,
    socialStructure: creature.social_structure ?? null,
    sourceName: creature.name,
    speedFactor: creature.speed_factor_base,
    vitalityBase: creature.vitality_base,
    willFactor: creature.will_factor_base,
    xpCategory: creature.xp_category
  };
}

function toCategorySummaries(entries: BestiaryEntryView[]): CategorySummary[] {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((left, right) => left.category.localeCompare(right.category, 'fr'));
}

function cleanCreatureName(name: string): string {
  return name
    .replace(/,\s*-.*/, '')
    .replace(/\s*\/.*$/, '')
    .trim();
}

function formatLifeExpectancy(value: number): string {
  if (value < 0) return 'Immortel';
  if (value === 1) return '1 an';
  return `${formatNumber(value)} ans`;
}

function formatResistance(resistance: { type?: string; value?: number | string }): string[] {
  if (!resistance.type || resistance.value === undefined || resistance.value === null) {
    return [];
  }

  return [`${resistance.type} ${resistance.value}`];
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value);
}
