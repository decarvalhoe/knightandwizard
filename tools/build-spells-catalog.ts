import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import yaml from 'js-yaml';

const ROOT = join(import.meta.dirname ?? __dirname, '..');
const SOURCE_PATH = join(ROOT, 'data/legacy/web-scraped/documents/grimoire/index.md');
const SCHOOLS_OUTPUT = join(ROOT, 'data/catalogs/magic-schools.yaml');
const SPELLS_OUTPUT = join(ROOT, 'data/catalogs/spells.yaml');
const RELATIVE_SOURCE = 'data/legacy/web-scraped/documents/grimoire/index.md';

const SCHOOLS: Array<{
  id: string;
  name: string;
  source_label: string;
  color: string;
  specialist: string;
  domain: string;
}> = [
  {
    id: 'abjuration',
    name: 'Abjuration',
    source_label: 'Abjuration',
    color: 'jaune',
    specialist: 'abjurateur',
    domain: 'Anti-magie : annule, dévie, perturbe les sorts'
  },
  {
    id: 'alteration',
    name: 'Altération',
    source_label: 'Altération',
    color: 'rouge',
    specialist: 'alterateur',
    domain: 'Évolution / changement / transformation physique'
  },
  {
    id: 'magie-blanche',
    name: 'Magie blanche',
    source_label: 'Blanche',
    color: 'blanc',
    specialist: 'clerc',
    domain: 'Vibrations positives : restaure, protège, augmente'
  },
  {
    id: 'divination',
    name: 'Divination',
    source_label: 'Divinatoire',
    color: 'brun',
    specialist: 'devin',
    domain: 'Temps et réalité : informations, perception'
  },
  {
    id: 'enchantement',
    name: 'Enchantement',
    source_label: 'Enchantement',
    color: 'turquoise',
    specialist: 'enchanteur',
    domain: 'Désir et espoir : contournement de la réalité'
  },
  {
    id: 'elementaire',
    name: 'Élémentaire',
    source_label: 'Elémentaire',
    color: 'bleu',
    specialist: 'elementaliste',
    domain: 'Feu, air, terre, eau, roche, foudre, lave, glace, fumée'
  },
  {
    id: 'illusion',
    name: 'Illusion',
    source_label: 'Illusion',
    color: 'violet',
    specialist: 'illusionniste',
    domain: 'Esprit : fausse réalité'
  },
  {
    id: 'invocation',
    name: 'Invocation',
    source_label: 'Invocation',
    color: 'orange',
    specialist: 'invocateur',
    domain: 'Espace : juxtaposer lieux/distances pour invoquer'
  },
  {
    id: 'magie-naturelle',
    name: 'Magie naturelle',
    source_label: 'Naturelle',
    color: 'vert',
    specialist: 'druide',
    domain: 'Organique et vie : alliance avec la nature'
  },
  {
    id: 'magie-noire',
    name: 'Magie noire',
    source_label: 'Noire',
    color: 'noir',
    specialist: 'sorcier',
    domain: 'Vibrations négatives : dégrade, affaiblit, diminue'
  },
  {
    id: 'necromancie',
    name: 'Nécromancie',
    source_label: 'Nécromancie',
    color: 'gris',
    specialist: 'necromancien',
    domain: 'Mort : contrôle des morts'
  }
];

const SOURCE_LABEL_TO_SCHOOL = new Map(SCHOOLS.map((s) => [s.source_label, s]));

interface SpellEntry {
  id: string;
  name: string;
  school_id: string;
  energy: number;
  incantation_time: number;
  difficulty: number;
  effect: string;
  value: number;
  source_refs: Array<{ path: string; sha256: string; ref: string }>;
}

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseNumeric(token: string, line: number): number {
  const cleaned = token.replace(/[^\d-]/g, '');
  const parsed = Number.parseInt(cleaned, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Expected numeric on line ${line}, got: "${token}"`);
  }
  return parsed;
}

function parse(): { spells: SpellEntry[]; sourceHash: string } {
  const content = readFileSync(SOURCE_PATH, 'utf8');
  const sourceHash = createHash('sha256').update(content).digest('hex');
  const lines = content.split('\n');
  const spells: SpellEntry[] = [];
  const idCounter = new Map<string, number>();

  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    const school = SOURCE_LABEL_TO_SCHOOL.get(trimmed);
    if (!school) continue;

    const nameLine = lines[i - 1]?.trim();
    if (!nameLine) continue;

    const energyToken = lines[i + 1]?.trim();
    const tiToken = lines[i + 2]?.trim();
    const diffToken = lines[i + 3]?.trim();
    const effect = lines[i + 4]?.trim() ?? '';
    const valueToken = lines[i + 5]?.trim();

    if (!energyToken || !tiToken || !diffToken || !valueToken) continue;
    if (!/^\d/.test(energyToken)) continue;
    if (!/^\d/.test(tiToken)) continue;

    let id = slugify(nameLine);
    const occ = idCounter.get(id) ?? 0;
    idCounter.set(id, occ + 1);
    if (occ > 0) id = `${id}-${school.id}`;

    spells.push({
      id,
      name: nameLine,
      school_id: school.id,
      energy: parseNumeric(energyToken, i + 2),
      incantation_time: parseNumeric(tiToken, i + 3),
      difficulty: parseNumeric(diffToken, i + 4),
      effect,
      value: parseNumeric(valueToken, i + 6),
      source_refs: [{ path: RELATIVE_SOURCE, sha256: sourceHash, ref: `entry:${id}` }]
    });
  }

  return { spells, sourceHash };
}

function writeYaml(filePath: string, payload: unknown): void {
  const yamlOutput = yaml.dump(payload, {
    lineWidth: 120,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false
  });
  const banner = '# Generated by `pnpm catalogs:build:magic`. Do not edit by hand.\n';
  writeFileSync(filePath, banner + yamlOutput, 'utf8');
}

function main(): void {
  const { spells, sourceHash } = parse();
  const today = new Date().toISOString().slice(0, 10);

  writeYaml(SCHOOLS_OUTPUT, {
    version: 1,
    metadata: {
      source: RELATIVE_SOURCE,
      source_sha256: sourceHash,
      imported_at: today,
      total_entries: SCHOOLS.length,
      catalog_status: 'partial',
      notes:
        'Onze écoles canoniques (R-8.3). Source web utilise des labels courts (Blanche, Noire, Naturelle, Divinatoire) ; ce catalogue normalise vers les noms complets.'
    },
    schools: SCHOOLS.map((school) => ({
      id: school.id,
      name: school.name,
      source_label: school.source_label,
      color: school.color,
      specialist_class_id: school.specialist,
      domain: school.domain,
      source_refs: [
        { path: RELATIVE_SOURCE, sha256: sourceHash, ref: `school:${school.source_label}` }
      ]
    }))
  });

  writeYaml(SPELLS_OUTPUT, {
    version: 1,
    metadata: {
      source: RELATIVE_SOURCE,
      source_sha256: sourceHash,
      imported_at: today,
      total_entries: spells.length,
      catalog_status: 'partial',
      notes:
        'Sorts extraits du Grand Grimoire web. Champ school_id réfère magic-schools.yaml. Les sorts du même nom dans plusieurs écoles reçoivent un suffixe -<school_id> sur leur ID.'
    },
    spells
  });

  execFileSync('pnpm', ['exec', 'prettier', '--write', SCHOOLS_OUTPUT, SPELLS_OUTPUT], {
    cwd: ROOT,
    stdio: 'inherit'
  });
  console.log(`Wrote ${SCHOOLS_OUTPUT} (${SCHOOLS.length} schools)`);
  console.log(`Wrote ${SPELLS_OUTPUT} (${spells.length} spells)`);
}

main();
