/**
 * Converts K&W's native canonical artifacts into NOMOS-conformant artifacts.
 *
 * Input  : docs/canonical/source-manifest.yaml, docs/canonical/canonical-matrix.yaml (K&W format)
 * Output : docs/canonical/nomos/source-manifest.yaml, docs/canonical/nomos/canonical-matrix.yaml
 *          (validated by `nomos validate` against RBOKproject/NOMOS specs, schema 0.1.0)
 *
 * Every format-level mapping (K&W enum -> NOMOS enum) is declared explicitly below, per the
 * project rule "ambiguities/decisions are explicit, never hidden in code". The K&W-native
 * artifacts are never overwritten; this only emits a parallel NOMOS view under docs/canonical/nomos/.
 *
 * Notable decision: NOMOS `#CoveredUnit` requires concrete `test_refs`, which the K&W matrix
 * does not carry (it tracks per-layer status, not test paths). To stay honest, K&W "covered"
 * units are emitted as NOMOS `partial` with an explicit gap until real test_refs are linked.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { dump, load } from 'js-yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_MANIFEST = join(ROOT, 'docs/canonical/source-manifest.yaml');
const SRC_MATRIX = join(ROOT, 'docs/canonical/canonical-matrix.yaml');
const OUT_DIR = join(ROOT, 'docs/canonical/nomos');

// ---- explicit K&W -> NOMOS format mappings ----
const SOURCE_TYPE: Record<string, string> = {
  canonical_rule: 'markdown',
  catalog_yaml: 'database_export',
  catalog_table: 'database_export',
  legacy_web_html: 'html',
  legacy_paper_extract: 'markdown',
  legacy_php: 'php',
  raw_source: 'source_code',
  generated_doc: 'markdown',
  third_party: 'source_code',
  other: 'source_code'
};
const SOURCE_PRIORITY: Record<string, string> = {
  canonical_rule: 'primary',
  catalog_yaml: 'secondary',
  catalog_table: 'secondary',
  legacy_web_html: 'legacy',
  legacy_paper_extract: 'legacy',
  legacy_php: 'legacy',
  raw_source: 'reference',
  generated_doc: 'derived',
  third_party: 'reference',
  other: 'reference'
};
const SOURCE_STATUS: Record<string, string> = {
  active: 'active',
  duplicate: 'duplicate',
  superseded: 'superseded',
  out_of_scope: 'out_of_scope',
  raw_reference_only: 'active' // reference-only nature encoded via allowed_uses
};
const UNIT_TYPE: Record<string, string> = {
  rule: 'rule',
  ambiguity: 'ambiguity',
  anomaly: 'exception',
  legacy_session_page: 'legacy_behavior',
  changelog: 'decision'
  // default below: catalog_entry
};

// Graduated criticality, keyed on the K&W unit_type. NOMOS uses this for impact /
// blast-radius prioritisation (high/critical units are flagged when sources change).
//   critical = mechanical core the engine computes (a bug here breaks the game)
//   high     = character/combat-defining catalog content
//   medium   = other catalog content (default)
//   low      = lore / world / reference / legacy material
const CRITICALITY: Record<string, string> = {
  rule: 'critical',
  resistance: 'critical',
  bonus_damage_extra: 'critical',
  bonus_damage_extra_per_param: 'critical',
  race: 'high',
  classe: 'high',
  orientation: 'high',
  skill: 'high',
  spell: 'high',
  school: 'high',
  weapon: 'high',
  armor_piece: 'high',
  shield: 'high',
  ambiguity: 'high',
  anomaly: 'high',
  creature: 'medium',
  potion: 'medium',
  ingredient: 'medium',
  optional_ingredient: 'medium',
  deity: 'medium',
  religion: 'medium',
  organisation: 'medium',
  mushroom_syndrome: 'medium',
  asset: 'medium',
  city: 'low',
  region: 'low',
  regions_from_world_map: 'low',
  web_regions_complement: 'low',
  location: 'low',
  lore_entry: 'low',
  notable_individual: 'low',
  image: 'low',
  legacy_character: 'low',
  legacy_session_page: 'low',
  source_document: 'low',
  source_file: 'low',
  source_ref: 'low',
  changelog: 'low'
  // default below: medium
};

function nomosId(raw: string): string {
  const up = String(raw)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return /^[A-Z0-9]/.test(up) ? up : `X-${up}`;
}

function allowedUses(sourceType: string, status: string): string[] {
  if (status === 'raw_reference_only') return ['citation_internal', 'human_review_only'];
  if (sourceType === 'canonical_rule') {
    return ['structured_contract', 'vector_index', 'citation_internal', 'golden_case'];
  }
  if (sourceType.startsWith('catalog'))
    return ['structured_contract', 'vector_index', 'citation_internal'];
  if (sourceType.startsWith('legacy')) return ['citation_internal', 'human_review_only'];
  return ['vector_index', 'citation_internal'];
}

const LAYERS = [
  'yaml',
  'zod_schema',
  'relational_db',
  'vector_store',
  'rules_core',
  'api',
  'ui',
  'tests'
];

async function main(): Promise<void> {
  const srcManifest = load(await readFile(SRC_MANIFEST, 'utf8')) as {
    sources?: Record<string, unknown>[];
  };
  const srcMatrix = load(await readFile(SRC_MATRIX, 'utf8')) as {
    units?: Record<string, unknown>[];
  };

  const pathToId = new Map<string, string>();
  const sources = (srcManifest.sources ?? []).map((s) => {
    const id = nomosId(String(s.id));
    pathToId.set(String(s.path), id);
    const sourceType = String(s.source_type);
    const status = String(s.status);
    const domains = (s.domains as string[] | undefined) ?? [];
    const out: Record<string, unknown> = {
      id,
      path: s.path,
      type: SOURCE_TYPE[sourceType] ?? 'source_code',
      domain: domains[0] ?? 'general',
      priority: SOURCE_PRIORITY[sourceType] ?? 'reference',
      status: SOURCE_STATUS[status] ?? 'needs_review',
      hash: s.sha256,
      owner: 'decarvalhoe',
      license: 'proprietary',
      confidentiality: 'internal',
      allowed_uses: allowedUses(sourceType, status)
    };
    if (s.notes) out.notes = s.notes;
    return out;
  });

  let partial = 0;
  let notApplicable = 0;
  const units = (srcMatrix.units ?? []).map((u) => {
    const unitId = nomosId(String(u.unit_id));
    const domain =
      String(u.domain ?? 'general')
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'general';

    const rawSources = (u.sources as Record<string, unknown>[] | undefined) ?? [];
    const sourceRefs = rawSources.map((sr) => {
      const ref: Record<string, unknown> = {
        source_id: pathToId.get(String(sr.path)) ?? nomosId(String(sr.path)),
        locator: String(sr.ref ?? sr.path)
      };
      if (sr.sha256) ref.hash = `sha256:${sr.sha256}`;
      return ref;
    });
    if (sourceRefs.length === 0)
      sourceRefs.push({ source_id: nomosId(String(u.unit_id)), locator: String(u.unit_id) });

    const businessRuleObj = u.business_rule as
      | { summary?: string; ambiguity_ref?: string | null }
      | undefined;
    const businessRule = businessRuleObj?.summary || String(u.title ?? u.unit_id);

    const gaps: string[] = [];
    for (const layer of LAYERS) {
      const link = u[layer] as { status?: string; evidence?: string } | undefined;
      if (link?.status && link.status !== 'covered' && link.status !== 'not_applicable') {
        gaps.push(`${layer}: ${link.evidence ?? link.status}`);
      }
    }

    const status = u.status === 'not_applicable' ? 'not_applicable' : 'partial';
    if (u.status === 'covered')
      gaps.push('End-to-end test_refs not yet linked (K&W-covered at foundation layer only).');
    if (u.status === 'blocked_ambiguity') {
      gaps.push(
        `Blocked by ambiguity${businessRuleObj?.ambiguity_ref ? `: ${businessRuleObj.ambiguity_ref}` : '.'}`
      );
    }
    if (gaps.length === 0) {
      const rulesCore = u.rules_core as { evidence?: string } | undefined;
      gaps.push(
        status === 'not_applicable'
          ? (rulesCore?.evidence ?? 'Not applicable to product behavior.')
          : 'Downstream implementation evidence pending.'
      );
    }

    const unit: Record<string, unknown> = {
      unit_id: unitId,
      unit_type: UNIT_TYPE[String(u.unit_type)] ?? 'catalog_entry',
      name: String(u.title ?? u.unit_id),
      domain,
      criticality: CRITICALITY[String(u.unit_type)] ?? 'medium',
      source_refs: sourceRefs,
      business_rule: businessRule,
      status,
      gaps
    };

    const yamlLink = u.yaml as { path?: string; status?: string } | undefined;
    if (yamlLink?.path) {
      unit.canonical_contract = {
        path: yamlLink.path,
        object_id: unitId,
        status: yamlLink.status === 'covered' ? 'present' : 'planned'
      };
    }
    const vectorLink = u.vector_store as { status?: string } | undefined;
    if (vectorLink?.status === 'covered') unit.vector_refs = [{ collection: 'knowledge_chunks' }];

    if (status === 'partial') partial += 1;
    else notApplicable += 1;
    return unit;
  });

  await mkdir(OUT_DIR, { recursive: true });
  const dumpOpts = { lineWidth: 120, noRefs: true } as const;
  await writeFile(
    join(OUT_DIR, 'source-manifest.yaml'),
    dump({ schema_version: '0.1.0', sources }, dumpOpts)
  );
  await writeFile(
    join(OUT_DIR, 'canonical-matrix.yaml'),
    dump({ schema_version: '0.1.0', units }, dumpOpts)
  );

  console.log(`NOMOS export written to docs/canonical/nomos/`);
  console.log(`  sources: ${sources.length}`);
  console.log(`  units: ${units.length} (partial=${partial}, not_applicable=${notApplicable})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
