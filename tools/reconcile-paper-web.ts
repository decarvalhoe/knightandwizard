/**
 * E0.4b — Contrôle de réconciliation **read-only** entre les catalogues paper (bestiaire-paper,
 * armes-paper, protections-paper) et les catalogues web (bestiaire/armes/protections.yaml).
 *
 * Les catalogues web sont déjà dérivés du paper et riches en stats ; on ne les mute PAS (ils
 * portent des commentaires que js-yaml détruirait). Ce script se contente de **comparer** par nom
 * et de **rapporter** : couverture (matched/orphan des deux côtés) + **divergences de stats**
 * (où le web inféré s'écarte du paper autoritaire). Artefact de validation canonical-first.
 *
 * Usage : `pnpm catalogs:reconcile:paper-web`
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { load } from 'js-yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function readYaml<T>(rel: string): T {
  return load(readFileSync(join(ROOT, rel), 'utf8')) as T;
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
function indexByNameSlug<T extends { name: string }>(items: T[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const item of items) map.set(slugify(item.name), item);
  return map;
}

interface Section {
  name: string;
  matched: number;
  webOrphan: number;
  paperOrphan: number;
  discrepancies: string[];
}

function report(section: Section): void {
  console.log(`\n=== ${section.name} ===`);
  console.log(
    `  matched: ${section.matched} | web sans paper: ${section.webOrphan} | paper sans web: ${section.paperOrphan}`
  );
  console.log(`  divergences de stats: ${section.discrepancies.length}`);
  section.discrepancies.slice(0, 15).forEach((d) => console.log(`    - ${d}`));
}

function reconcileBestiaire(): Section {
  const web = readYaml<{
    creatures: Array<{
      name: string;
      vitality_base?: number;
      speed_factor_base?: number;
      will_factor_base?: number;
      attribute_max?: Record<string, number>;
    }>;
  }>('data/catalogs/bestiaire.yaml').creatures;
  const paper = readYaml<{
    creatures: Array<{
      name: string;
      vitalite?: number;
      speed_factor?: number;
      will_factor?: number;
      attribute_limits: Record<string, number>;
    }>;
  }>('data/catalogs/bestiaire-paper.yaml').creatures;
  const paperBy = indexByNameSlug(paper);
  const webBy = indexByNameSlug(web);
  const fr2en: Record<string, string> = {
    force: 'strength',
    dexterite: 'dexterity',
    endurance: 'stamina',
    esthetique: 'aestheticism',
    charisme: 'charisma',
    empathie: 'empathy',
    intelligence: 'intelligence',
    reflexes: 'reflexes',
    perception: 'perception'
  };
  const section: Section = {
    name: 'bestiaire',
    matched: 0,
    webOrphan: 0,
    paperOrphan: 0,
    discrepancies: []
  };
  for (const w of web) {
    const p = paperBy.get(slugify(w.name));
    if (!p) {
      section.webOrphan += 1;
      continue;
    }
    section.matched += 1;
    if (p.vitalite !== undefined && w.vitality_base !== undefined && p.vitalite !== w.vitality_base)
      section.discrepancies.push(`${w.name} vitalité web=${w.vitality_base} paper=${p.vitalite}`);
    if (
      p.speed_factor !== undefined &&
      w.speed_factor_base !== undefined &&
      p.speed_factor !== w.speed_factor_base
    )
      section.discrepancies.push(`${w.name} FV web=${w.speed_factor_base} paper=${p.speed_factor}`);
    if (
      p.will_factor !== undefined &&
      w.will_factor_base !== undefined &&
      p.will_factor !== w.will_factor_base
    )
      section.discrepancies.push(`${w.name} FVol web=${w.will_factor_base} paper=${p.will_factor}`);
    for (const [fr, en] of Object.entries(fr2en)) {
      const pv = p.attribute_limits?.[fr];
      const wv = w.attribute_max?.[en];
      if (pv !== undefined && wv !== undefined && pv !== wv)
        section.discrepancies.push(`${w.name} ${en} web=${wv} paper=${pv}`);
    }
  }
  for (const p of paper) if (!webBy.has(slugify(p.name))) section.paperOrphan += 1;
  return section;
}

function reconcileArmes(): Section {
  const web = readYaml<{
    weapons: Array<{
      name: string;
      damage_type?: string;
      damage_formula?: string;
      weight_kg?: number;
    }>;
  }>('data/catalogs/armes.yaml').weapons;
  const paper = readYaml<{
    weapons: Array<{ name: string; damage_type?: string; damage?: string; weight_kg?: number }>;
  }>('data/catalogs/armes-paper.yaml').weapons;
  const paperBy = indexByNameSlug(paper);
  const webBy = indexByNameSlug(web);
  const section: Section = {
    name: 'armes',
    matched: 0,
    webOrphan: 0,
    paperOrphan: 0,
    discrepancies: []
  };
  for (const w of web) {
    const p = paperBy.get(slugify(w.name));
    if (!p) {
      section.webOrphan += 1;
      continue;
    }
    section.matched += 1;
    if (p.damage_type && w.damage_type && p.damage_type !== w.damage_type)
      section.discrepancies.push(`${w.name} TD web=${w.damage_type} paper=${p.damage_type}`);
    if (p.damage && w.damage_formula && p.damage !== w.damage_formula)
      section.discrepancies.push(`${w.name} dégât web="${w.damage_formula}" paper="${p.damage}"`);
    if (p.weight_kg !== undefined && w.weight_kg !== undefined && p.weight_kg !== w.weight_kg)
      section.discrepancies.push(`${w.name} poids web=${w.weight_kg} paper=${p.weight_kg}`);
  }
  for (const p of paper) if (!webBy.has(slugify(p.name))) section.paperOrphan += 1;
  return section;
}

function reconcileProtections(): Section {
  const web = readYaml<{
    armor_pieces: Array<{ name: string; category?: string; protection?: Record<string, number> }>;
  }>('data/catalogs/protections.yaml').armor_pieces;
  const paper = readYaml<{
    materials: Array<{ id: string; name: string; armor: Record<string, number> }>;
  }>('data/catalogs/protections-paper.yaml').materials;
  const paperByMaterial = new Map(paper.map((m) => [slugify(m.name), m]));
  const section: Section = {
    name: 'protections',
    matched: 0,
    webOrphan: 0,
    paperOrphan: 0,
    discrepancies: []
  };
  const matchedMaterials = new Set<string>();
  for (const w of web ?? []) {
    const materialSlug = w.category ? slugify(w.category.replace(/_/g, ' ')) : '';
    const m = paperByMaterial.get(materialSlug);
    if (!m) {
      section.webOrphan += 1;
      continue;
    }
    section.matched += 1;
    matchedMaterials.add(materialSlug);
    for (const k of ['p', 'e', 'c', 't'] as const) {
      const pv = m.armor[k];
      const wv = w.protection?.[k.toUpperCase()];
      if (pv !== undefined && wv !== undefined && pv !== wv)
        section.discrepancies.push(`${w.name} armure ${k.toUpperCase()} web=${wv} paper=${pv}`);
    }
  }
  for (const m of paper) if (!matchedMaterials.has(slugify(m.name))) section.paperOrphan += 1;
  return section;
}

function main(): void {
  console.log('E0.4b — réconciliation paper ↔ web (read-only)');
  [reconcileBestiaire(), reconcileArmes(), reconcileProtections()].forEach(report);
}

main();
