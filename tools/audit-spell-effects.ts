/**
 * E2a — Audit des patterns d'effets de sorts (préparation de la structuration des 324 sorts, E2).
 *
 * Lit `data/catalogs/spells.yaml` et classe CHAQUE ligne `effect` terse en :
 *   - une **famille** sémantique (dégâts, soin, modificateur, anti-magie, création, transformation,
 *     contrôle, jet opposé, déplacement, utilitaire, inconnu) — un indice de la cible `EffectModel` ;
 *   - une **mise à l'échelle** détectée (`/R` → `successes`, `/Niv` → `level`) ;
 *   - une **magnitude** (nombre de tête) et une **durée narrative** éventuelle (jour/heure/min × /R|/Niv) ;
 *   - un **palier de confiance** : `covered` (pattern numérique propre, exprimable tel quel via
 *     l'EffectModel actuel), `templatable` (famille reconnue mais cible/portée à décider),
 *     `arbitrage` (anti-magie / création / contrôle / jet opposé / inconnu → modélisation humaine).
 *
 * **Read-only** : n'écrit AUCUN catalogue (artefact de préparation, comme `reconcile-paper-web.ts`).
 * Le but est de **factoriser au maximum** et de chiffrer la charge d'arbitrage humain **par école**,
 * AVANT l'authoring gouverné (E2b, `fidelity: pending` + `requires_mj_validation`, validé par école).
 *
 * Usage : `pnpm catalogs:audit:spell-effects`
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { load } from 'js-yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

interface SpellEntry {
  id: string;
  name: string;
  school_id?: string;
  effect?: string;
  prose_refs?: unknown[];
  generated_prose?: string;
}

type Family =
  | 'damage'
  | 'heal'
  | 'modifier'
  | 'antimagic'
  | 'create'
  | 'transform'
  | 'control'
  | 'opposed_roll'
  | 'movement'
  | 'divination'
  | 'utility'
  | 'unknown';

type Tier = 'covered' | 'templatable' | 'arbitrage';
type Scaling = 'successes' | 'level';

interface NarrativeDuration {
  amount: Scaling | number;
  unit: 'minute' | 'hour' | 'day';
}

interface Classification {
  id: string;
  name: string;
  school: string;
  effect: string;
  family: Family;
  scaling: Scaling[];
  magnitude?: number;
  narrativeDuration?: NarrativeDuration;
  targetScaled: boolean; // "1 personne/R", "1 cible/R" — la portée croît avec R
  tier: Tier;
  proseLinked: boolean; // prose_refs (paper) vs generated_prose seul
}

/** Minuscule + sans diacritiques, pour des regex robustes (évite les plages accentuées en shell). */
function normalize(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Familles par mots-clés, dans l'ordre de priorité (la 1re qui matche gagne). */
const FAMILY_RULES: Array<{ family: Family; test: RegExp }> = [
  { family: 'damage', test: /\bdegat/ },
  { family: 'heal', test: /soigne|guerit|gueri|vitalit|regener|restaure|cicatris|ravive/ },
  { family: 'opposed_roll', test: /test de volonte|contre jet|jet d.endurance|jet d.int|si r ?>/ },
  {
    family: 'antimagic',
    test: /annule|renvoi|absorbe|\bcontre\b|remplace|empeche|reduit les r|prolonge le ti|diminue \d*r|change la cible d.un sort|sort actif|sort incante|dissipe|inverse un sort/
  },
  {
    family: 'create',
    test: /\bcree\b|\bcreation\b|invoque|convoque|fait apparaitre|fait venir|materialise/
  },
  {
    family: 'transform',
    test: /rouille|\bgel\b|evapore|detruit|transforme|petrifie|fond\b|durcit|liquefie|cristallise/
  },
  {
    family: 'control',
    test: /controle|charme|domine|ordonne|terreur|\bpeur\b|hypnot|paralys|endort|sommeil/
  },
  {
    family: 'movement',
    test: /teleport|\bvol\b|\bvole\b|levite|deplace|saute|propulse|repousse|attire/
  },
  // Buffs/débuffs numériques : verbes OU nom d'aptitude/diff/facteur/bouclier suivi d'un signe.
  {
    family: 'modifier',
    test: /augmente|diminue|reduit|prolonge|double|divise|allonge|accroit|amplifie|multiplie|abaisse|eleve|renforce|affaiblit|bouclier|eclaire/
  },
  {
    family: 'modifier',
    test: /(force|dexterite|endurance|esthetique|charisme|empathie|intelligence|reflexe|perception|volonte|vitesse|diff\.?|pect)\s*[+\-–]/
  },
  { family: 'modifier', test: /[+\-–]\s*\d+.*\/\s*(r\b|niv)/ },
  { family: 'modifier', test: /pour etre (vu|touche|toucher)|pour etre touche/ },
  // Divination / révélation / communication : effets narratifs (arbitrage).
  {
    family: 'divination',
    test: /revele|montre|colore|localise|permet de parler|\binformation|anticipe|premonition|detecte|identifi|\bsavoir|rejoint la cible dans son reve|parler avec/
  }
];

function detectFamily(norm: string): Family {
  for (const rule of FAMILY_RULES) {
    if (rule.test.test(norm)) return rule.family;
  }
  // Une magnitude + unité physique sans verbe reconnu = transformation/utilitaire mesurée.
  if (/\d+\s*(litre|kg|kilo|metre|m\b|cm|km|gramme)/.test(norm)) return 'utility';
  return 'unknown';
}

function detectScaling(norm: string): Scaling[] {
  const scaling: Scaling[] = [];
  if (/\/\s*r\b/.test(norm) || /\bpar reussite/.test(norm)) scaling.push('successes');
  if (/\/\s*niv/.test(norm) || /\bpar niveau/.test(norm)) scaling.push('level');
  return scaling;
}

function detectMagnitude(norm: string): number | undefined {
  const match = norm.match(/(\d+)/);
  return match ? Number(match[1]) : undefined;
}

const UNIT_MAP: Array<{ test: RegExp; unit: NarrativeDuration['unit'] }> = [
  { test: /jour/, unit: 'day' },
  { test: /heure|\bh\b/, unit: 'hour' },
  { test: /min/, unit: 'minute' }
];

function detectNarrativeDuration(norm: string): NarrativeDuration | undefined {
  // ex. "1 jour/Niv", "10min/niv", "1 jour/R"
  const match = norm.match(/(\d+)\s*(jour|heure|min(?:ute)?s?|h)\b\s*\/?\s*(r\b|niv)?/);
  if (!match) return undefined;
  const unitToken = match[2];
  const unitRule = UNIT_MAP.find((u) => u.test.test(unitToken));
  if (!unitRule) return undefined;
  const scaleToken = match[3];
  const amount: Scaling | number =
    scaleToken === 'r' ? 'successes' : scaleToken === 'niv' ? 'level' : Number(match[1]);
  return { amount, unit: unitRule.unit };
}

function detectTargetScaled(norm: string): boolean {
  return /(personne|cible|creature|ennemi|allie)s?\s*\/\s*r\b/.test(norm);
}

function classifyTier(family: Family, scaling: Scaling[], magnitude: number | undefined): Tier {
  // Dégâts numériques mis à l'échelle = directement exprimable via l'EffectModel actuel (E1).
  if (family === 'damage' && magnitude !== undefined) return 'covered';
  // Familles numériques à cible simple : un template suffira une fois la cible/portée décidée.
  if (
    (family === 'heal' || family === 'modifier' || family === 'utility') &&
    (magnitude !== undefined || scaling.length > 0)
  ) {
    return 'templatable';
  }
  // Tout le reste (anti-magie, création, transformation, contrôle, jet opposé, inconnu) = arbitrage.
  return 'arbitrage';
}

function classify(spell: SpellEntry): Classification {
  const effect = (spell.effect ?? '').trim();
  const norm = normalize(effect);
  // Indice par id : les sorts `invocation-de-X` créent une entité même si l'effet terse ("1 X/R")
  // ne porte aucun verbe reconnaissable.
  const family =
    detectFamily(norm) === 'unknown' && /^invocation/.test(spell.id)
      ? 'create'
      : detectFamily(norm);
  const scaling = detectScaling(norm);
  const magnitude = detectMagnitude(norm);
  const narrativeDuration = detectNarrativeDuration(norm);
  const targetScaled = detectTargetScaled(norm);
  const tier = classifyTier(family, scaling, magnitude);
  const proseLinked = Array.isArray(spell.prose_refs) && spell.prose_refs.length > 0;

  return {
    id: spell.id,
    name: spell.name,
    school: spell.school_id ?? '(sans école)',
    effect,
    family,
    scaling,
    magnitude,
    ...(narrativeDuration !== undefined ? { narrativeDuration } : {}),
    targetScaled,
    tier,
    proseLinked
  };
}

function pct(part: number, total: number): string {
  return total === 0 ? '0%' : `${Math.round((part / total) * 100)}%`;
}

function bump<K extends string>(counter: Record<K, number>, key: K): void {
  counter[key] = (counter[key] ?? 0) + 1;
}

function main(): void {
  const doc = load(readFileSync(join(ROOT, 'data/catalogs/spells.yaml'), 'utf8')) as {
    spells: SpellEntry[];
  };
  const spells = doc.spells ?? [];
  const rows = spells.map(classify);
  const total = rows.length;

  // Drill-down : `--family=<nom>` liste toutes les lignes d'effet d'une famille (aide E2b).
  const familyArg = process.argv.find((a) => a.startsWith('--family='))?.split('=')[1];
  if (familyArg) {
    const matching = rows.filter((r) => r.family === familyArg);
    console.log(`Famille « ${familyArg} » — ${matching.length} sorts :\n`);
    for (const r of matching) console.log(`  ${r.tier.padEnd(11)} ${r.id}: ${r.effect}`);
    return;
  }

  const byTier = {} as Record<Tier, number>;
  const byFamily = {} as Record<Family, number>;
  const bySchoolTier: Record<string, Record<Tier, number>> = {};
  let scalable = 0;
  let proseLinked = 0;

  for (const row of rows) {
    bump(byTier, row.tier);
    bump(byFamily, row.family);
    bySchoolTier[row.school] ??= { covered: 0, templatable: 0, arbitrage: 0 };
    bump(bySchoolTier[row.school], row.tier);
    if (row.scaling.length > 0) scalable += 1;
    if (row.proseLinked) proseLinked += 1;
  }

  console.log('E2a — Audit des patterns d’effets de sorts\n');
  console.log(
    `Total : ${total} sorts • prose paper-liée : ${proseLinked} (${pct(proseLinked, total)}) • avec mise à l’échelle (/R ou /Niv) : ${scalable} (${pct(scalable, total)})\n`
  );

  console.log('Paliers de confiance (préparation de l’arbitrage) :');
  for (const tier of ['covered', 'templatable', 'arbitrage'] as Tier[]) {
    const n = byTier[tier] ?? 0;
    console.log(`  ${tier.padEnd(12)} ${String(n).padStart(4)}  ${pct(n, total)}`);
  }

  console.log('\nFamilles sémantiques (indice de cible EffectModel) :');
  const families = (Object.keys(byFamily) as Family[]).sort((a, b) => byFamily[b] - byFamily[a]);
  for (const family of families) {
    const n = byFamily[family];
    const example = rows.find((r) => r.family === family)?.effect ?? '';
    console.log(`  ${family.padEnd(14)} ${String(n).padStart(4)}  ex: ${example.slice(0, 56)}`);
  }

  console.log('\nPar école × palier (charge d’arbitrage par école) :');
  console.log('  école'.padEnd(22) + 'cov  tmpl  arb  total');
  const schools = Object.keys(bySchoolTier).sort();
  for (const school of schools) {
    const t = bySchoolTier[school];
    const sum = t.covered + t.templatable + t.arbitrage;
    console.log(
      `  ${school.padEnd(20)}${String(t.covered).padStart(4)}${String(t.templatable).padStart(6)}${String(t.arbitrage).padStart(5)}${String(sum).padStart(7)}`
    );
  }

  // Échantillon d’arbitrage par famille « difficile » pour cadrer le travail humain.
  console.log('\nÉchantillon « arbitrage » (à modéliser à la main) :');
  for (const family of [
    'antimagic',
    'create',
    'control',
    'transform',
    'opposed_roll',
    'unknown'
  ] as Family[]) {
    const sample = rows.filter((r) => r.tier === 'arbitrage' && r.family === family).slice(0, 3);
    if (sample.length === 0) continue;
    console.log(`  [${family}]`);
    for (const r of sample) console.log(`    ${r.id}: ${r.effect.slice(0, 64)}`);
  }
}

main();
