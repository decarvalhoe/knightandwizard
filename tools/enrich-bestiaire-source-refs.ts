import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname ?? __dirname, '..');
const BESTIAIRE_PATH = join(ROOT, 'data/catalogs/bestiaire.yaml');
const WEB_SOURCE = 'data/legacy/web-scraped/documents/bestiaire/index.md';
const PAPER_SOURCE = 'data/legacy/paper/regles-papier/extracted/listes/bestiaire.md';

const WEB_ONLY_RACES = new Set(['zombie']);

function hash(filePath: string): string {
  return createHash('sha256')
    .update(readFileSync(join(ROOT, filePath), 'utf8'))
    .digest('hex');
}

function buildSourceRefsBlock(raceId: string, indent: string): string {
  const webHash = hash(WEB_SOURCE);
  const paperHash = hash(PAPER_SOURCE);
  const lines = [`${indent}source_refs:`];
  lines.push(`${indent}  - path: ${WEB_SOURCE}`);
  lines.push(`${indent}    sha256: ${webHash}`);
  lines.push(`${indent}    ref: "entry:${raceId}"`);
  if (!WEB_ONLY_RACES.has(raceId)) {
    lines.push(`${indent}  - path: ${PAPER_SOURCE}`);
    lines.push(`${indent}    sha256: ${paperHash}`);
    lines.push(`${indent}    ref: "entry:${raceId}"`);
  }
  return lines.join('\n');
}

function patch(): void {
  const content = readFileSync(BESTIAIRE_PATH, 'utf8');
  const lines = content.split('\n');
  const result: string[] = [];

  let currentRaceId: string | null = null;
  let entryIndent = '';
  let alreadyHasSourceRefs = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();
    const idMatch = line.match(/^(\s*)- id:\s*([a-z_0-9]+)\s*$/);

    if (idMatch) {
      currentRaceId = idMatch[2];
      entryIndent = idMatch[1] + '  ';
      alreadyHasSourceRefs = false;
    }

    if (currentRaceId && trimmed === 'source_refs:') {
      alreadyHasSourceRefs = true;
    }

    const isMetadataLine =
      currentRaceId && /^\s*metadata:\s*\{/.test(line) && !alreadyHasSourceRefs;
    if (isMetadataLine && currentRaceId) {
      result.push(buildSourceRefsBlock(currentRaceId, entryIndent));
      currentRaceId = null;
    }

    result.push(line);
  }

  writeFileSync(BESTIAIRE_PATH, result.join('\n'), 'utf8');
}

function main(): void {
  patch();
  console.log(`Enriched ${BESTIAIRE_PATH}`);
}

main();
