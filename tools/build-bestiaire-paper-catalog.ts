/**
 * E0.4 — Construit `data/catalogs/bestiaire-paper.yaml` depuis l'extraction prose du Bestiaire paper.
 *
 * Chaque créature = un bloc de stats (Taille, Espérance, Catégorie, Vitalité, Facteur de vitesse,
 * Facteur de volonté, Limites physiques 3×3, Atouts de race, Résistances) + Descriptif + sous-sections.
 * Sortant un `catalog_yaml`, chaque créature devient une unité canonique/NOMOS atomisée
 * (cf. docs/plan/PROSE-SOURCE-LINKAGE.md). La réconciliation avec `bestiaire.yaml` (web) = E0.4b.
 *
 * Usage : `pnpm catalogs:build:bestiaire-paper`
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { dump } from 'js-yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_REL = 'data/legacy/paper/regles-papier/extracted/listes/bestiaire.md';
const OUTPUT_REL = 'data/catalogs/bestiaire-paper.yaml';

const ATTR_LABELS = [
  'Force',
  'Dextérité',
  'Endurance',
  'Esthétique',
  'Charisme',
  'Empathie',
  'Intelligence',
  'Réflexes',
  'Perception'
] as const;

interface Creature {
  id: string;
  name: string;
  taille?: string;
  esperance?: string;
  categorie?: number;
  vitalite?: number;
  speed_factor?: number;
  will_factor?: number;
  attribute_limits: Record<string, number>;
  racial_atouts: string[];
  prose: string;
  source_refs: Array<{ path: string; sha256: string; ref: string }>;
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’*]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function num(block: string, label: string): number | undefined {
  const m = new RegExp(`${label}\\s*:\\s*(\\d+)`, 'i').exec(block);
  return m ? Number.parseInt(m[1], 10) : undefined;
}
function str(block: string, label: string): string | undefined {
  const m = new RegExp(`${label}\\s*:\\s*([^\\n\\t]+)`, 'i').exec(block);
  return m ? m[1].trim() : undefined;
}

function parseCreature(name: string, block: string, hash: string): Creature {
  const id = slugify(name);
  const attribute_limits: Record<string, number> = {};
  for (const label of ATTR_LABELS) {
    const v = num(block, label);
    if (v !== undefined) attribute_limits[slugify(label)] = v;
  }

  // Racial atouts : lines between "Atout(s) de race :" and "Descriptif".
  const racial_atouts: string[] = [];
  const atoutMatch = /Atouts?\s+de\s+race\s*:([\s\S]*?)(?:\nDescriptif|$)/i.exec(block);
  if (atoutMatch) {
    for (const raw of atoutMatch[1].split('\n')) {
      const line = raw.trim();
      if (line.length > 0 && !/^Descriptif/i.test(line)) racial_atouts.push(line);
    }
  }

  // Prose : everything after the first "Descriptif" line.
  const proseMatch = /\nDescriptif\s*\n([\s\S]*)$/i.exec(block);
  const prose = proseMatch
    ? proseMatch[1]
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && l !== '```' && !/^\*\s/.test(l))
        .join(' ')
        .trim()
    : '';

  return {
    id,
    name,
    taille: str(block, 'Taille moyenne'),
    esperance: str(block, 'Espérance de vie'),
    categorie: num(block, 'Catégorie'),
    vitalite: num(block, 'Vitalité'),
    speed_factor: num(block, 'Facteur de vitesse'),
    will_factor: num(block, 'Facteur de volonté'),
    attribute_limits,
    racial_atouts,
    prose,
    source_refs: [{ path: SOURCE_REL, sha256: hash, ref: `entry:${id}` }]
  };
}

function main(): void {
  const content = readFileSync(join(ROOT, SOURCE_REL), 'utf8');
  const hash = createHash('sha256').update(content).digest('hex');
  const lines = content.split('\n').map((l) => l.replace(/\r$/, ''));

  // Creature starts: the non-blank line preceding a "Taille moyenne :" line.
  const starts: Array<{ name: string; index: number }> = [];
  for (let i = 1; i < lines.length; i += 1) {
    if (/^\s*Taille moyenne\s*:/i.test(lines[i])) {
      let j = i - 1;
      while (j >= 0 && lines[j].trim() === '') j -= 1;
      if (j >= 0) starts.push({ name: lines[j].trim().replace(/\*+$/, '').trim(), index: j });
    }
  }

  const creatures: Creature[] = [];
  const seen = new Map<string, number>();
  for (let s = 0; s < starts.length; s += 1) {
    const from = starts[s].index;
    const to = s + 1 < starts.length ? starts[s + 1].index : lines.length;
    const block = lines.slice(from, to).join('\n');
    const creature = parseCreature(starts[s].name, block, hash);
    const count = seen.get(creature.id) ?? 0;
    seen.set(creature.id, count + 1);
    if (count > 0) creature.id = `${creature.id}-${count + 1}`;
    creatures.push(creature);
  }

  const catalog = {
    version: 1,
    metadata: {
      source: SOURCE_REL,
      source_sha256: hash,
      imported_at: '2026-05-27',
      total_entries: creatures.length,
      catalog_status: 'partial',
      notes:
        'Creatures du Bestiaire paper : stats (vitalite, facteurs, limites d attributs, atouts de ' +
        'race) + prose descriptive. Reconciliation avec bestiaire.yaml (web) = E0.4b.'
    },
    creatures
  };

  const yaml = `# Generated by \`pnpm catalogs:build:bestiaire-paper\`. Do not edit by hand.\n${dump(
    catalog,
    { lineWidth: 120, noRefs: true }
  )}`;
  writeFileSync(join(ROOT, OUTPUT_REL), yaml, 'utf8');
  console.log(`bestiaire-paper catalog written: ${creatures.length} creatures`);
  const withStats = creatures.filter((c) => c.vitalite !== undefined).length;
  const withAttrs = creatures.filter((c) => Object.keys(c.attribute_limits).length === 9).length;
  console.log(`  avec vitalite: ${withStats} ; avec 9 attributs: ${withAttrs}`);
}

main();
