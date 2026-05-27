/**
 * E0.5 — Audit de couverture prose (gate canonical-first). Pour chaque catalogue de `data/catalogs`,
 * compte les entrées portant une définition : `prose_refs` (lien paper autoritaire), `generated_prose`
 * (généré ancré, validation pending), `prose_orphan` (déclaré sans prose), ou rien.
 *
 * Le principe E0 (cf. docs/plan/PROSE-SOURCE-LINKAGE.md) : tout élément que les sources prose
 * DÉCRIVENT doit porter un lien/définition. Les catalogues purement nominaux (compétences, classes,
 * nations — où le nom EST la définition) ne sont pas un manque ; ils sont rapportés séparément.
 *
 * Usage : `pnpm catalogs:audit:prose`
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { load } from 'js-yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOGS_DIR = join(ROOT, 'data/catalogs');

interface Row {
  catalog: string;
  total: number;
  proseRefs: number;
  generated: number;
  ownProse: number;
  orphan: number;
  bare: number;
}

function isEntryArray(value: unknown): value is Array<Record<string, unknown>> {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object' &&
    value[0] !== null &&
    ('id' in value[0] || 'name' in value[0])
  );
}

function findEntries(doc: unknown): Array<Record<string, unknown>> | null {
  if (typeof doc !== 'object' || doc === null) return null;
  for (const value of Object.values(doc as Record<string, unknown>)) {
    if (isEntryArray(value)) return value;
  }
  return null;
}

function auditCatalog(file: string): Row | null {
  const doc = load(readFileSync(join(CATALOGS_DIR, file), 'utf8'));
  const entries = findEntries(doc);
  if (!entries) return null;
  const row: Row = {
    catalog: file,
    total: entries.length,
    proseRefs: 0,
    generated: 0,
    ownProse: 0,
    orphan: 0,
    bare: 0
  };
  for (const e of entries) {
    if (Array.isArray(e.prose_refs) && e.prose_refs.length > 0) row.proseRefs += 1;
    else if (typeof e.generated_prose === 'string') row.generated += 1;
    else if (typeof e.prose === 'string' && e.prose.length > 0) row.ownProse += 1;
    else if (e.prose_orphan === true) row.orphan += 1;
    else row.bare += 1;
  }
  return row;
}

function main(): void {
  const files = readdirSync(CATALOGS_DIR)
    .filter((f) => f.endsWith('.yaml'))
    .sort();
  const rows: Row[] = [];
  for (const file of files) {
    const row = auditCatalog(file);
    if (row) rows.push(row);
  }

  const bearing = (r: Row): number => r.proseRefs + r.generated + r.ownProse + r.orphan;
  const proseBearing = rows.filter((r) => bearing(r) > 0);
  const namedOnly = rows.filter((r) => bearing(r) === 0);

  console.log('E0.5 — Audit de couverture prose\n');
  console.log(
    'Catalogues PORTANT de la prose (source `prose`, lien `prose_refs` ou `generated_prose`) :'
  );
  console.log('  catalogue'.padEnd(28) + 'total  refs  gen  prose  orph  bare');
  for (const r of proseBearing) {
    console.log(
      `  ${r.catalog.padEnd(26)}${String(r.total).padStart(5)}${String(r.proseRefs).padStart(6)}${String(r.generated).padStart(5)}${String(r.ownProse).padStart(7)}${String(r.orphan).padStart(6)}${String(r.bare).padStart(6)}`
    );
  }
  const totals = proseBearing.reduce(
    (a, r) => ({
      total: a.total + r.total,
      defined: a.defined + r.proseRefs + r.generated + r.ownProse,
      bare: a.bare + r.bare + r.orphan
    }),
    { total: 0, defined: 0, bare: 0 }
  );
  console.log(
    `\n  => ${totals.defined}/${totals.total} entrées définies (source/lien/généré), ${totals.bare} sans définition, sur les catalogues prose-bearing.`
  );

  console.log('\nCatalogues NOMINAUX (nom = définition, pas de prose requise) :');
  console.log(`  ${namedOnly.map((r) => `${r.catalog}(${r.total})`).join(', ')}`);
}

main();
