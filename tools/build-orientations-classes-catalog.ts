import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import yaml from 'js-yaml';

const ROOT = join(import.meta.dirname ?? __dirname, '..');
const SOURCE_PATH = join(ROOT, 'data/legacy/web-scraped/documents/classes/index.md');
const ORIENTATIONS_OUTPUT = join(ROOT, 'data/catalogs/orientations.yaml');
const CLASSES_OUTPUT = join(ROOT, 'data/catalogs/classes.yaml');
const RELATIVE_SOURCE = 'data/legacy/web-scraped/documents/classes/index.md';

const ORIENTATIONS = new Set([
  'Artisan',
  'Artiste',
  'Commerçant',
  'Dommestique',
  'Guerrier',
  'Hors-la-loi',
  'Intellectuel',
  'Magicien',
  'Ouvrier',
  'Paysan',
  'Religieux',
  'Voyageur'
]);

const PRIMARY_SKILL_BY_CLASS: Record<string, string> = {
  bijoutier: 'bijouterie',
  charpentier: 'charpenterie',
  couturier: 'couture',
  'facteur-d-arc': 'facture-d-arc',
  forgeron: 'forge',
  menuisier: 'menuiserie',
  potier: 'poterie',
  tanneur: 'tannage',
  tonnelier: 'facture-de-tonneau',
  vannier: 'vannerie',
  chanteur: 'chant',
  comedien: 'comedie',
  conteur: 'conte',
  danseur: 'danse',
  dessinateur: 'dessin',
  ecrivain: 'redaction',
  peintre: 'peinture',
  prestidigitateur: 'prestidigitation',
  cuisinier: 'cuisine',
  jardinier: 'jardinage',
  agriculteur: 'agriculture',
  apiculteur: 'apiculture',
  berger: 'elevage-de-moutons',
  chevrier: 'elevage-de-chevres',
  porcher: 'elevage-de-porcs',
  bucheron: 'bucheronnage',
  chasseur: 'chasse',
  pecheur: 'peche',
  marchand: 'marchandage',
  aubergiste: 'hotellerie',
  alchimiste: 'alchimie',
  herboriste: 'herbologie',
  medecin: 'medecine',
  philosophe: 'philosophie',
  politicien: 'politique',
  scribe: 'redaction',
  exorciste: 'exorcisme',
  navigateur: 'navigation',
  inquisiteur: 'theologie',
  pretre: 'theologie',
  arbaletrier: 'arbalete',
  archer: 'archerie',
  cavalier: 'equitation',
  duelliste: 'epee-a-une-main',
  garde: 'epee-a-une-main',
  fantassin: 'lance',
  'fantassin-leger': 'lance',
  'fantassin-lourd': 'hallebarde',
  samourai: 'katana',
  espion: 'furtivite',
  voleur: 'vol-a-la-tire',
  'voleur-a-la-tire': 'vol-a-la-tire',
  ninja: 'furtivite',
  braconnier: 'chasse',
  ranger: 'chasse',
  rodeur: 'chasse',
  eclaireur: 'observation-du-terrain'
};

interface OrientationEntry {
  id: string;
  name: string;
  is_magical: boolean;
  source_refs: Array<{ path: string; sha256: string; ref: string }>;
}

interface ClassEntry {
  id: string;
  name: string;
  orientation_id: string;
  primary_skill_id: string | null;
  primary_skill_choice: 'fixed' | 'player_choice' | 'magician_no_primary';
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

function parse(): {
  orientations: OrientationEntry[];
  classes: ClassEntry[];
  sourceHash: string;
} {
  const content = readFileSync(SOURCE_PATH, 'utf8');
  const sourceHash = createHash('sha256').update(content).digest('hex');
  const lines = content.split('\n');

  const startIdx = lines.findIndex((line) => line.trim() === 'Liste des classes');
  if (startIdx === -1) {
    throw new Error('Source preamble "Liste des classes" not found');
  }

  const orientations: OrientationEntry[] = [];
  const classes: ClassEntry[] = [];
  let currentOrientation: OrientationEntry | null = null;
  const classIdsSeen = new Map<string, number>();

  for (let i = startIdx + 1; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    if (ORIENTATIONS.has(trimmed)) {
      const id = slugify(trimmed);
      const orientation: OrientationEntry = {
        id,
        name: trimmed,
        is_magical: id === 'magicien',
        source_refs: [{ path: RELATIVE_SOURCE, sha256: sourceHash, ref: `line:${i + 1}` }]
      };
      orientations.push(orientation);
      currentOrientation = orientation;
      continue;
    }

    if (!currentOrientation) continue;

    const baseId = slugify(trimmed);
    const occurrence = classIdsSeen.get(baseId) ?? 0;
    classIdsSeen.set(baseId, occurrence + 1);
    const id = occurrence === 0 ? baseId : `${baseId}-${currentOrientation.id}`;

    let primarySkillChoice: ClassEntry['primary_skill_choice'];
    let primarySkillId: string | null;
    if (currentOrientation.is_magical) {
      primarySkillChoice = 'magician_no_primary';
      primarySkillId = null;
    } else if (PRIMARY_SKILL_BY_CLASS[id] !== undefined) {
      primarySkillChoice = 'fixed';
      primarySkillId = PRIMARY_SKILL_BY_CLASS[id];
    } else {
      primarySkillChoice = 'player_choice';
      primarySkillId = null;
    }

    classes.push({
      id,
      name: trimmed,
      orientation_id: currentOrientation.id,
      primary_skill_id: primarySkillId,
      primary_skill_choice: primarySkillChoice,
      source_refs: [{ path: RELATIVE_SOURCE, sha256: sourceHash, ref: `line:${i + 1}` }]
    });
  }

  return { orientations, classes, sourceHash };
}

function writeYaml(filePath: string, payload: unknown): void {
  const yamlOutput = yaml.dump(payload, {
    lineWidth: 120,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false
  });
  const banner =
    '# Generated by `pnpm catalogs:build:orientations-classes`. Do not edit by hand.\n';
  writeFileSync(filePath, banner + yamlOutput, 'utf8');
}

function main(): void {
  const { orientations, classes, sourceHash } = parse();

  writeYaml(ORIENTATIONS_OUTPUT, {
    version: 1,
    metadata: {
      source: RELATIVE_SOURCE,
      source_sha256: sourceHash,
      imported_at: new Date().toISOString().slice(0, 10),
      total_entries: orientations.length,
      catalog_status: 'partial',
      notes:
        "Liste web canonique : 12 orientations. La 13e ('Malfaisant') référencée dans docs/rules/04-classes.md C.9 est absente du web — à inventorier en ambiguïté ultérieure."
    },
    orientations
  });

  writeYaml(CLASSES_OUTPUT, {
    version: 1,
    metadata: {
      source: RELATIVE_SOURCE,
      source_sha256: sourceHash,
      imported_at: new Date().toISOString().slice(0, 10),
      total_entries: classes.length,
      catalog_status: 'partial',
      notes:
        "Mapping primary_skill_id : 'fixed' suit R-4.5 (mapping de nom évident), 'magician_no_primary' = magiciens (pas de compétence primaire), 'player_choice' = classes ambiguës (Pirate, Voleur, Soldat générique...) où le joueur choisit au runtime."
    },
    classes
  });

  execFileSync('pnpm', ['exec', 'prettier', '--write', ORIENTATIONS_OUTPUT, CLASSES_OUTPUT], {
    cwd: ROOT,
    stdio: 'inherit'
  });
  console.log(`Wrote ${ORIENTATIONS_OUTPUT}`);
  console.log(`Wrote ${CLASSES_OUTPUT}`);
}

main();
