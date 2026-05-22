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

// The web list (`SOURCE_PATH`) only carries 12 orientations. The 13th, "Malfaisant",
// is canonical per Q-D4.1 (Tranché 2026-04-25) and is sourced from the paper list and
// the rules digest instead of the web scrape.
const PAPER_SOURCE_PATH = join(
  ROOT,
  'data/legacy/paper/regles-papier/extracted/listes/orientations-et-classes.md'
);
const RELATIVE_PAPER_SOURCE =
  'data/legacy/paper/regles-papier/extracted/listes/orientations-et-classes.md';
const RULES_SOURCE_PATH = join(ROOT, 'docs/rules/04-classes.md');
const RELATIVE_RULES_SOURCE = 'docs/rules/04-classes.md';

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
  status: 'active';
  is_magical: boolean;
  source_refs: Array<{ path: string; sha256: string; ref: string }>;
}

interface ClassEntry {
  id: string;
  name: string;
  status: 'active';
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

function sha256(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function parse(): {
  orientations: OrientationEntry[];
  classes: ClassEntry[];
  sourceHash: string;
} {
  const content = readFileSync(SOURCE_PATH, 'utf8');
  const sourceHash = sha256(content);
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
        status: 'active',
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
      status: 'active',
      orientation_id: currentOrientation.id,
      primary_skill_id: primarySkillId,
      primary_skill_choice: primarySkillChoice,
      source_refs: [{ path: RELATIVE_SOURCE, sha256: sourceHash, ref: `line:${i + 1}` }]
    });
  }

  // The web list stops at 12 orientations. "Malfaisant" (Q-D4.1, Tranché 2026-04-25) is the
  // canonical 13th orientation. It is absent from the web scrape, so it and its single canonical
  // class (Bourreau, paper line 145) are sourced from the paper list and the rules digest.
  const paperHash = sha256(readFileSync(PAPER_SOURCE_PATH, 'utf8'));
  const rulesHash = sha256(readFileSync(RULES_SOURCE_PATH, 'utf8'));

  orientations.push({
    id: 'malfaisant',
    name: 'Malfaisant',
    status: 'active',
    is_magical: false,
    source_refs: [
      // Paper list header "Malfaisant" + "Atout d'orientation : Méfait".
      { path: RELATIVE_PAPER_SOURCE, sha256: paperHash, ref: 'line:141' },
      // Rules digest synthesis table row 9 (Malfaisant / Méfait / Éph / -5 nuire à autrui).
      { path: RELATIVE_RULES_SOURCE, sha256: rulesHash, ref: 'line:152' },
      // Rules digest detailed atout row citing lexique:699.
      { path: RELATIVE_RULES_SOURCE, sha256: rulesHash, ref: 'line:172' }
    ]
  });

  // Bourreau is the only class the paper attaches to Malfaisant (orientation atout: Méfait;
  // class atout "Sadisme" is deferred per Q-D4.2, not invented here). Its primary skill is left
  // to player choice, consistent with other classes lacking an evident R-4.5 mapping.
  classes.push({
    id: 'bourreau',
    name: 'Bourreau',
    status: 'active',
    orientation_id: 'malfaisant',
    primary_skill_id: null,
    primary_skill_choice: 'player_choice',
    source_refs: [{ path: RELATIVE_PAPER_SOURCE, sha256: paperHash, ref: 'line:145' }]
  });

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
      catalog_status: 'complete',
      notes:
        "13 orientations canoniques (Q-D4.1, tranché 2026-04-25). La liste web ne porte que 12 orientations ; la 13e ('Malfaisant', atout d'orientation Méfait) est sourcée depuis la liste papier (orientations-et-classes.md:141) et docs/rules/04-classes.md (C.9, lexique:699)."
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
        "Mapping primary_skill_id : 'fixed' suit R-4.5 (mapping de nom évident), 'magician_no_primary' = magiciens (pas de compétence primaire), 'player_choice' = classes ambiguës (Pirate, Voleur, Soldat générique...) où le joueur choisit au runtime. La classe Bourreau (orientation Malfaisant) est sourcée depuis la liste papier (orientations-et-classes.md:145) car absente du web ; son atout de classe 'Sadisme' reste à reconstituer (Q-D4.2)."
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
