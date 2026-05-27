/**
 * E0.1 — Construit `data/catalogs/lexique.yaml` depuis l'extraction prose du Lexique paper.
 *
 * Le Lexique est la **définition canonique en prose** de la plupart des éléments du jeu (sorts,
 * atouts, …). Source brute = un bloc texte où chaque entrée est `Terme<TAB>prose`, suivie de
 * lignes de continuation, puis de métadonnées entre parenthèses : `(Permanent)` / `(Éphémère)`,
 * `(Sort de magie X)`, `(Atout de niveau N de l'orientation : Y)`, `(Atout de race : Z)`,
 * `(Atout de classe : W)`.
 *
 * En sortant un `catalog_yaml` dans `data/catalogs/`, chaque entrée devient automatiquement une
 * **unité canonique/NOMOS atomisée** (cf. docs/plan/PROSE-SOURCE-LINKAGE.md). La liaison
 * `prose_refs` vers spells/atouts est l'étape E0.2/E0.3.
 *
 * Usage : `pnpm catalogs:build:lexique`
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { dump } from 'js-yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_REL = 'data/legacy/paper/regles-papier/extracted/listes/lexique.md';
const OUTPUT_REL = 'data/catalogs/lexique.yaml';

type LexiqueKind = 'sort' | 'atout' | 'unknown';
type LexiqueDuration = 'permanent' | 'ephemeral';

interface LexiqueEntry {
  id: string;
  term: string;
  kind: LexiqueKind;
  prose: string;
  duration?: LexiqueDuration;
  niveau?: number;
  orientation?: string;
  race?: string;
  classe?: string;
  school_raw?: string;
  metadata_raw: string[];
  source_refs: Array<{ path: string; sha256: string; ref: string }>;
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** A line is an entry header when its pre-TAB part looks like a short title, not a prose sentence. */
function entryHead(line: string): { term: string; rest: string } | null {
  const tab = line.indexOf('\t');
  if (tab <= 0) return null;
  const term = line.slice(0, tab).trim();
  const rest = line.slice(tab + 1).trim();
  if (term.length === 0 || term.length > 60) return null;
  // A real term is not a full sentence (no trailing period / mid punctuation run).
  if (/[.!?] /.test(term)) return null;
  return { term, rest };
}

function isMetadata(line: string): boolean {
  return /^\(.*\)\s*$/.test(line.trim());
}

function applyMetadata(entry: LexiqueEntry, raw: string): void {
  entry.metadata_raw.push(raw);
  const inner = raw
    .trim()
    .replace(/^\(/, '')
    .replace(/\)\s*$/, '')
    .trim();

  if (/^perman/i.test(inner)) entry.duration = 'permanent';
  else if (/^[eé]ph/i.test(inner)) entry.duration = 'ephemeral';

  const sort = /^sort\s+d/i.exec(inner);
  if (sort) {
    entry.kind = 'sort';
    entry.school_raw = inner.replace(/^sort\s+(de\s+magie\s+|d['’]\s*|de\s+)/i, '').trim();
    return;
  }

  if (/^atout/i.test(inner)) {
    entry.kind = 'atout';
    const orientation = /niveau\s+(\d+)\s+de\s+l['’]orientation\s*:\s*(.+)$/i.exec(inner);
    if (orientation) {
      entry.niveau = Number.parseInt(orientation[1], 10);
      entry.orientation = orientation[2].trim();
      return;
    }
    const race = /de\s+(?:la\s+)?race\s*:\s*(.+)$/i.exec(inner);
    if (race) {
      entry.race = race[1].trim();
      return;
    }
    const classe = /de\s+classe\s*:\s*(.+)$/i.exec(inner);
    if (classe) {
      entry.classe = classe[1].trim();
      return;
    }
    const niveau = /niveau\s+(\d+)/i.exec(inner);
    if (niveau) entry.niveau = Number.parseInt(niveau[1], 10);
  }
}

function parseLexique(content: string, sourceHash: string): LexiqueEntry[] {
  const lines = content.split('\n');
  const entries: LexiqueEntry[] = [];
  const seen = new Map<string, number>();
  let current: LexiqueEntry | null = null;
  let started = false;

  const flush = (): void => {
    if (current) {
      current.prose = current.prose.trim();
      entries.push(current);
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');
    const trimmed = line.trim();
    const head = entryHead(line);

    if (head) {
      started = true;
      flush();
      let id = slugify(head.term);
      const count = seen.get(id) ?? 0;
      seen.set(id, count + 1);
      if (count > 0) id = `${id}-${count + 1}`;
      current = {
        id,
        term: head.term,
        kind: 'unknown',
        prose: head.rest,
        metadata_raw: [],
        source_refs: [{ path: SOURCE_REL, sha256: sourceHash, ref: `entry:${id}` }]
      };
      continue;
    }

    if (!started || current === null) continue;
    if (trimmed === '' || trimmed === '```') continue;
    if (isMetadata(line)) applyMetadata(current, trimmed);
    else current.prose += ` ${trimmed}`;
  }
  flush();

  return entries;
}

function toYamlEntry(entry: LexiqueEntry): Record<string, unknown> {
  const out: Record<string, unknown> = { id: entry.id, term: entry.term, kind: entry.kind };
  if (entry.school_raw) out.school_raw = entry.school_raw;
  if (entry.orientation) out.orientation = entry.orientation;
  if (entry.race) out.race = entry.race;
  if (entry.classe) out.classe = entry.classe;
  if (entry.niveau !== undefined) out.niveau = entry.niveau;
  if (entry.duration) out.duration = entry.duration;
  out.prose = entry.prose;
  if (entry.metadata_raw.length > 0) out.metadata_raw = entry.metadata_raw;
  out.source_refs = entry.source_refs;
  return out;
}

function main(): void {
  const sourcePath = join(ROOT, SOURCE_REL);
  const content = readFileSync(sourcePath, 'utf8');
  const sourceHash = createHash('sha256').update(content).digest('hex');
  const entries = parseLexique(content, sourceHash);

  const counts = entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.kind] = (acc[entry.kind] ?? 0) + 1;
    return acc;
  }, {});

  const catalog = {
    version: 1,
    metadata: {
      source: SOURCE_REL,
      source_sha256: sourceHash,
      imported_at: '2026-05-27',
      total_entries: entries.length,
      catalog_status: 'partial',
      notes:
        'Entrees du Lexique paper : definition canonique en prose des sorts, atouts et autres ' +
        'elements. kind/school_raw/orientation/race/classe/niveau/duration parses depuis les ' +
        'metadonnees entre parentheses. Liaison prose_refs vers spells/atouts = E0.2/E0.3.'
    },
    entries: entries.map(toYamlEntry)
  };

  const yaml = `# Generated by \`pnpm catalogs:build:lexique\`. Do not edit by hand.\n${dump(
    catalog,
    {
      lineWidth: 120,
      noRefs: true
    }
  )}`;

  writeFileSync(join(ROOT, OUTPUT_REL), yaml, 'utf8');
  console.log(`lexique catalog written to ${OUTPUT_REL}`);
  console.log(`  entries: ${entries.length} (${JSON.stringify(counts)})`);
}

main();
