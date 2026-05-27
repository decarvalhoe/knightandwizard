/**
 * E0.2 / E0.2b — Lie chaque sort de `spells.yaml` (grimoire web) au lexique paper (`lexique.yaml`).
 *
 * Pour chaque sort, par ordre de confiance :
 *  1. Match direct : slug(nom) == id d'une entrée lexique → `prose_refs`.
 *  2. Variante / famille : base présente dans le lexique (de masse, mineur/majeur, changement,
 *     guérison, création de membre, appel, renvoi, bouclier…) → `prose_refs` + `derived_from`.
 *  3. Sinon — GÉNÉRATION ANCRÉE (E0.2b) : `generated_prose` = expansion lisible de la ligne `effect`
 *     canonique du grimoire + contexte d'école (jamais d'invention libre), marquée
 *     `prose_origin: templated`, `validation: pending`, `low_confidence` si l'école est peu ancrée
 *     côté paper. Promue par arbitrage MJ (workflow Q-D8.2). Voir docs/plan/PROSE-SOURCE-LINKAGE.md.
 *
 * Idempotent. Chaîné après `build:magic`.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { dump, load } from 'js-yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SPELLS_PATH = join(ROOT, 'data/catalogs/spells.yaml');
const LEXIQUE_PATH = join(ROOT, 'data/catalogs/lexique.yaml');
const LOW_COVERAGE_THRESHOLD = 0.5;

const SCHOOL_FR: Record<string, string> = {
  abjuration: "d'abjuration",
  alteration: "d'altération",
  'magie-blanche': 'de magie blanche',
  divination: 'de divination',
  enchantement: "d'enchantement",
  elementaire: 'élémentaire',
  illusion: "d'illusion",
  invocation: "d'invocation",
  'magie-naturelle': 'de magie naturelle',
  'magie-noire': 'de magie noire',
  necromancie: 'de nécromancie'
};

interface ProseRef {
  catalog: 'lexique';
  entry_id: string;
  term: string;
}
interface Spell {
  id: string;
  name: string;
  school_id: string;
  effect?: string;
  prose_refs?: ProseRef[];
  derived_from?: string;
  prose_orphan?: boolean;
  generated_prose?: string;
  prose_origin?: 'templated';
  validation?: 'pending';
  low_confidence?: boolean;
  [key: string]: unknown;
}
interface LexiqueEntry {
  id: string;
  term: string;
  kind: string;
}
interface SpellsDoc {
  version: number;
  metadata: Record<string, unknown>;
  spells?: Spell[];
  [key: string]: unknown;
}
interface LexiqueDoc {
  entries?: LexiqueEntry[];
  [key: string]: unknown;
}

const VARIANT_SUFFIXES = [
  / de masse$/i,
  / de distance$/i,
  / majeure?$/i,
  / mineure?$/i,
  / de groupe$/i
];

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Returns a lexique base id for a variant/family spell name, or null. */
function familyBase(name: string, has: (slug: string) => boolean): string | null {
  for (const sfx of VARIANT_SUFFIXES) {
    if (sfx.test(name)) {
      const base = slugify(name.replace(sfx, '').trim());
      if (has(base)) return base;
    }
  }
  const families: Array<[RegExp, string]> = [
    [/^changement /i, 'changement'],
    [/^gu[eé]rison /i, 'guerison'],
    [/^cr[eé]ation d/i, 'creation-de-membre'],
    [/^appel d/i, 'appel'],
    [/^renvoi d/i, 'renvoi-de-masse'],
    [/^bouclier /i, 'bouclier']
  ];
  for (const [re, base] of families) {
    if (re.test(name) && has(base)) return base;
  }
  return null;
}

/** Readable prose anchored on the canonical terse effect + school context. No free invention. */
function generateProse(spell: Spell): string {
  const school = SCHOOL_FR[spell.school_id] ?? `(${spell.school_id})`;
  const effect = (spell.effect ?? '')
    .trim()
    .replace(/\s*\/\s*R\b/g, ' par réussite')
    .replace(/\s*\/\s*Niv\.?/gi, ' par niveau du lanceur')
    .replace(/\s+/g, ' ')
    .trim();
  const body =
    effect.length > 0 ? effect.replace(/\.*$/, '') : 'effet non détaillé dans le grimoire';
  return `Sort ${school} : ${body}.`;
}

function clear(spell: Spell): void {
  delete spell.prose_refs;
  delete spell.derived_from;
  delete spell.prose_orphan;
  delete spell.generated_prose;
  delete spell.prose_origin;
  delete spell.validation;
  delete spell.low_confidence;
}

function main(): void {
  const spellsDoc = load(readFileSync(SPELLS_PATH, 'utf8')) as SpellsDoc;
  const lexiqueDoc = load(readFileSync(LEXIQUE_PATH, 'utf8')) as LexiqueDoc;
  const spells = spellsDoc.spells ?? [];
  const lexique = lexiqueDoc.entries ?? [];

  const bySlug = new Map<string, LexiqueEntry>();
  for (const entry of lexique) {
    const existing = bySlug.get(entry.id);
    if (!existing || (existing.kind !== 'sort' && entry.kind === 'sort'))
      bySlug.set(entry.id, entry);
  }
  const has = (slug: string): boolean => bySlug.has(slug);
  const link = (spell: Spell, entry: LexiqueEntry): void => {
    spell.prose_refs = [{ catalog: 'lexique', entry_id: entry.id, term: entry.term }];
  };

  const matchedLexiqueIds = new Set<string>();
  let direct = 0;
  let derived = 0;

  // Pass 1 — paper anchoring (direct + variant/family base).
  for (const spell of spells) {
    clear(spell);
    const directEntry = bySlug.get(slugify(spell.name));
    if (directEntry) {
      link(spell, directEntry);
      matchedLexiqueIds.add(directEntry.id);
      direct += 1;
      continue;
    }
    const base = familyBase(spell.name, has);
    if (base) {
      const baseEntry = bySlug.get(base)!;
      link(spell, baseEntry);
      spell.derived_from = baseEntry.id;
      matchedLexiqueIds.add(baseEntry.id);
      derived += 1;
    }
  }

  // Per-school paper-anchored coverage (drives low_confidence on generated entries).
  const bySchool = new Map<string, { total: number; anchored: number }>();
  for (const spell of spells) {
    const e = bySchool.get(spell.school_id) ?? { total: 0, anchored: 0 };
    e.total += 1;
    if (spell.prose_refs) e.anchored += 1;
    bySchool.set(spell.school_id, e);
  }

  // Pass 2 — generate anchored prose for the rest.
  let generated = 0;
  let lowConf = 0;
  for (const spell of spells) {
    if (spell.prose_refs) continue;
    const sc = bySchool.get(spell.school_id)!;
    spell.generated_prose = generateProse(spell);
    spell.prose_origin = 'templated';
    spell.validation = 'pending';
    if (sc.anchored / sc.total < LOW_COVERAGE_THRESHOLD) {
      spell.low_confidence = true;
      lowConf += 1;
    }
    generated += 1;
  }

  const sortEntries = lexique.filter((entry) => entry.kind === 'sort');
  const lexiqueOrphans = sortEntries.filter((entry) => !matchedLexiqueIds.has(entry.id));

  const banner = '# Generated by `pnpm catalogs:build:magic`. Do not edit by hand.\n';
  const yaml = dump(spellsDoc, {
    lineWidth: 100,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false
  });
  writeFileSync(SPELLS_PATH, banner + yaml, 'utf8');
  execFileSync('pnpm', ['exec', 'prettier', '--write', 'data/catalogs/spells.yaml'], {
    cwd: ROOT,
    stdio: 'ignore'
  });

  console.log(`link-spells-lexique: ${spells.length} sorts`);
  console.log(`  prose_refs paper : ${direct} direct + ${derived} derives = ${direct + derived}`);
  console.log(
    `  generated_prose  : ${generated} (dont low_confidence: ${lowConf}) -> validation pending`
  );
  console.log(`  prose_orphan     : 0 (chaque sort a une definition)`);
  console.log(`  lexique sorts non lies (sur ${sortEntries.length}) : ${lexiqueOrphans.length}`);
}

main();
