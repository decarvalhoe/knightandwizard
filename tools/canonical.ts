import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { load } from 'js-yaml';

export type SourceType =
  | 'canonical_rule'
  | 'catalog_yaml'
  | 'catalog_table'
  | 'legacy_web_html'
  | 'legacy_paper_extract'
  | 'legacy_php'
  | 'raw_source'
  | 'generated_doc'
  | 'third_party'
  | 'other';

export type SourceStatus =
  | 'active'
  | 'duplicate'
  | 'superseded'
  | 'out_of_scope'
  | 'raw_reference_only';

export type UnitStatus = 'covered' | 'partial' | 'blocked_ambiguity' | 'not_applicable';

export interface SourceEntry {
  id: string;
  path: string;
  sha256: string;
  source_type: SourceType;
  priority: number;
  status: SourceStatus;
  domains: string[];
  contains: string[];
  notes: string;
}

export interface SourceManifest {
  version: 1;
  hash_algorithm: 'sha256';
  sources: SourceEntry[];
}

export interface CanonicalMatrixUnit {
  unit_id: string;
  unit_type: string;
  domain: string;
  title: string;
  status: UnitStatus;
  sources: Array<{ path: string; ref: string; sha256: string }>;
  business_rule: { summary: string; ambiguity_ref: string | null };
  yaml: MatrixLink;
  zod_schema: MatrixLink;
  relational_db: MatrixLink;
  vector_store: MatrixLink;
  rules_core: MatrixLink;
  api: MatrixLink;
  ui: MatrixLink;
  tests: MatrixLink;
}

export interface MatrixLink {
  status: UnitStatus;
  evidence: string;
  path?: string | null;
  entry_id?: string | null;
}

export interface CanonicalMatrix {
  version: 1;
  units: CanonicalMatrixUnit[];
}

export interface ProductSampleImport {
  file: string;
  line: number;
  importText: string;
}

export interface CoverageSummary {
  manifestSources: number;
  activeSources: number;
  rawReferenceSources: number;
  outOfScopeSources: number;
  matrixUnits: number;
  unitsByType: Record<string, number>;
  unitsByStatus: Record<UnitStatus, number>;
  productSampleImports: ProductSampleImport[];
}

export interface CanonicalBuildOptions {
  repoRoot?: string;
}

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sourceRoots = ['docs', 'data/catalogs', 'data/legacy', 'apps/legacy-php-site'];
const generatedDir = 'docs/canonical';
const sourceManifestPath = `${generatedDir}/source-manifest.yaml`;
const canonicalMatrixPath = `${generatedDir}/canonical-matrix.yaml`;
const coverageReportPath = `${generatedDir}/coverage-report.md`;
const ignoredDirectoryNames = new Set(['.git', '.next', '.turbo', 'dist', 'node_modules']);
const textExtensions = new Set([
  '.css',
  '.csv',
  '.html',
  '.js',
  '.json',
  '.md',
  '.php',
  '.scss',
  '.sql',
  '.svg',
  '.tpl',
  '.ts',
  '.txt',
  '.xml',
  '.yaml',
  '.yml'
]);

export async function buildSourceManifest(
  options: CanonicalBuildOptions = {}
): Promise<SourceManifest> {
  const root = options.repoRoot ?? repoRoot;
  const files = await collectSourceFiles(root);
  const sources = await Promise.all(
    files.map(async (sourcePath) => {
      const content = await readFile(join(root, sourcePath));
      return {
        id: slugify(sourcePath.replace(/\.[^.]+$/, '')),
        path: sourcePath,
        sha256: createHash('sha256').update(content).digest('hex'),
        ...classifySource(sourcePath)
      } satisfies SourceEntry;
    })
  );

  return {
    version: 1,
    hash_algorithm: 'sha256',
    sources: sources.sort((left, right) => left.path.localeCompare(right.path))
  };
}

export async function loadSourceManifest(
  options: CanonicalBuildOptions = {}
): Promise<SourceManifest> {
  const text = await readFile(join(options.repoRoot ?? repoRoot, sourceManifestPath), 'utf8');
  const parsed = load(text);
  if (!isRecord(parsed) || !Array.isArray(parsed.sources)) {
    throw new Error(`${sourceManifestPath} is not a valid source manifest`);
  }
  return {
    version: 1,
    hash_algorithm: 'sha256',
    sources: parsed.sources.map(parseSourceEntry)
  };
}

export async function buildCanonicalMatrix(
  manifest: SourceManifest,
  options: CanonicalBuildOptions = {}
): Promise<CanonicalMatrix> {
  const root = options.repoRoot ?? repoRoot;
  const units = new Map<string, CanonicalMatrixUnit>();

  for (const source of manifest.sources) {
    addUnit(
      units,
      buildUnit(
        source,
        `source:${source.id}`,
        'source_document',
        source.path,
        source.path,
        source.status === 'out_of_scope' ? 'not_applicable' : 'covered'
      )
    );
  }

  for (const source of manifest.sources) {
    if (source.status === 'out_of_scope' || source.status === 'duplicate') continue;
    const path = join(root, source.path);

    if (source.source_type === 'canonical_rule') {
      extractRuleUnits(source, await readFile(path, 'utf8')).forEach((unit) =>
        addUnit(units, unit)
      );
    } else if (source.source_type === 'catalog_yaml') {
      extractYamlCatalogUnits(source, await readFile(path, 'utf8')).forEach((unit) =>
        addUnit(units, unit)
      );
    } else if (source.path.endsWith('data/catalogs/atouts-values.csv')) {
      extractAssetCsvUnits(source, await readFile(path, 'utf8')).forEach((unit) =>
        addUnit(units, unit)
      );
    } else {
      extractLegacyObjectUnits(source).forEach((unit) => addUnit(units, unit));
    }
  }

  return {
    version: 1,
    units: [...units.values()].sort((left, right) => left.unit_id.localeCompare(right.unit_id))
  };
}

export async function findProductSampleImports(
  options: CanonicalBuildOptions = {}
): Promise<ProductSampleImport[]> {
  const root = options.repoRoot ?? repoRoot;
  const files = [
    ...(await walkFiles(join(root, 'apps/game/src/app'), root)),
    ...(await walkFiles(join(root, 'apps/game/src/features'), root))
  ];
  const results: ProductSampleImport[] = [];

  for (const file of files.sort()) {
    if (!['.ts', '.tsx'].includes(extname(file))) continue;
    if (
      file.endsWith('.test.ts') ||
      file.endsWith('.test.tsx') ||
      file.includes('/__fixtures__/')
    ) {
      continue;
    }
    const lines = (await readFile(join(root, file), 'utf8')).split('\n');
    lines.forEach((lineText, index) => {
      if (/from\s+['"][^'"]*sample['"]/.test(lineText)) {
        results.push({ file, importText: lineText.trim(), line: index + 1 });
      }
    });
  }

  return results;
}

export async function buildCoverageSummary(
  manifest: SourceManifest,
  matrix: CanonicalMatrix,
  options: CanonicalBuildOptions = {}
): Promise<CoverageSummary> {
  return {
    activeSources: manifest.sources.filter((source) => source.status === 'active').length,
    manifestSources: manifest.sources.length,
    matrixUnits: matrix.units.length,
    outOfScopeSources: manifest.sources.filter((source) => source.status === 'out_of_scope').length,
    productSampleImports: await findProductSampleImports(options),
    rawReferenceSources: manifest.sources.filter((source) => source.status === 'raw_reference_only')
      .length,
    unitsByStatus: countBy(matrix.units, (unit) => unit.status),
    unitsByType: countBy(matrix.units, (unit) => unit.unit_type)
  };
}

export async function generateCanonicalArtifacts(
  options: CanonicalBuildOptions = {}
): Promise<{ manifest: SourceManifest; matrix: CanonicalMatrix; report: string }> {
  const manifest = await buildSourceManifest(options);
  const matrix = await buildCanonicalMatrix(manifest, options);
  const summary = await buildCoverageSummary(manifest, matrix, options);
  return { manifest, matrix, report: renderCoverageReport(summary) };
}

export async function writeCanonicalArtifacts(options: CanonicalBuildOptions = {}): Promise<void> {
  const root = options.repoRoot ?? repoRoot;
  const artifacts = await generateCanonicalArtifacts(options);
  await mkdir(join(root, generatedDir), { recursive: true });
  await writeFile(join(root, sourceManifestPath), renderSourceManifest(artifacts.manifest));
  await writeFile(join(root, canonicalMatrixPath), renderCanonicalMatrix(artifacts.matrix));
  await writeFile(join(root, coverageReportPath), artifacts.report);
}

export async function checkCanonicalArtifacts(
  options: CanonicalBuildOptions = {}
): Promise<{ ok: boolean; stale: string[] }> {
  const root = options.repoRoot ?? repoRoot;
  const artifacts = await generateCanonicalArtifacts(options);
  const expected = new Map([
    [sourceManifestPath, renderSourceManifest(artifacts.manifest)],
    [canonicalMatrixPath, renderCanonicalMatrix(artifacts.matrix)],
    [coverageReportPath, artifacts.report]
  ]);
  const stale: string[] = [];

  for (const [path, expectedText] of expected) {
    let actual: string;
    try {
      actual = await readFile(join(root, path), 'utf8');
    } catch {
      stale.push(path);
      continue;
    }
    if (actual !== expectedText) stale.push(path);
  }

  return { ok: stale.length === 0, stale };
}

export function renderSourceManifest(manifest: SourceManifest): string {
  const lines = [
    '# Generated by `pnpm canonical:write`. Do not edit by hand.',
    'version: 1',
    'hash_algorithm: sha256',
    'sources:'
  ];
  for (const source of manifest.sources) {
    lines.push(
      `  - id: ${yamlString(source.id)}`,
      `    path: ${yamlString(source.path)}`,
      `    sha256: ${yamlString(source.sha256)}`,
      `    source_type: ${source.source_type}`,
      `    priority: ${source.priority}`,
      `    status: ${source.status}`,
      `    domains: ${yamlArray(source.domains)}`,
      `    contains: ${yamlArray(source.contains)}`,
      `    notes: ${yamlString(source.notes)}`
    );
  }
  return `${lines.join('\n')}\n`;
}

export function renderCanonicalMatrix(matrix: CanonicalMatrix): string {
  const lines = [
    '# Generated by `pnpm canonical:write`. Do not edit by hand.',
    'version: 1',
    'units:'
  ];
  for (const unit of matrix.units) {
    lines.push(
      `  - unit_id: ${yamlString(unit.unit_id)}`,
      `    unit_type: ${yamlString(unit.unit_type)}`,
      `    domain: ${yamlString(unit.domain)}`,
      `    title: ${yamlString(unit.title)}`,
      `    status: ${unit.status}`,
      '    sources:'
    );
    for (const source of unit.sources) {
      lines.push(
        `      - path: ${yamlString(source.path)}`,
        `        ref: ${yamlString(source.ref)}`,
        `        sha256: ${yamlString(source.sha256)}`
      );
    }
    lines.push(
      '    business_rule:',
      `      summary: ${yamlString(unit.business_rule.summary)}`,
      `      ambiguity_ref: ${unit.business_rule.ambiguity_ref === null ? 'null' : yamlString(unit.business_rule.ambiguity_ref)}`,
      ...renderLink('yaml', unit.yaml),
      ...renderLink('zod_schema', unit.zod_schema),
      ...renderLink('relational_db', unit.relational_db),
      ...renderLink('vector_store', unit.vector_store),
      ...renderLink('rules_core', unit.rules_core),
      ...renderLink('api', unit.api),
      ...renderLink('ui', unit.ui),
      ...renderLink('tests', unit.tests)
    );
  }
  return `${lines.join('\n')}\n`;
}

export function renderCoverageReport(summary: CoverageSummary): string {
  const lines = [
    '# Canonical Coverage Report',
    '',
    'Generated by `pnpm canonical:write`.',
    '',
    '## Source Registry',
    '',
    `- Total sources: ${summary.manifestSources}`,
    `- Active sources: ${summary.activeSources}`,
    `- Raw reference sources: ${summary.rawReferenceSources}`,
    `- Out-of-scope registered sources: ${summary.outOfScopeSources}`,
    '',
    '## Canonical Matrix',
    '',
    `- Total units: ${summary.matrixUnits}`,
    '',
    '### Units By Status',
    '',
    ...countLines(summary.unitsByStatus),
    '',
    '### Units By Type',
    '',
    ...countLines(summary.unitsByType),
    '',
    '## Product Fixture Imports',
    ''
  ];

  if (summary.productSampleImports.length === 0) {
    lines.push('- No product `sample.ts` imports detected.');
  } else {
    lines.push(
      '- Product screens still import sample fixtures. These are known blockers for strict compliance:'
    );
    for (const sampleImport of summary.productSampleImports) {
      lines.push(
        `  - ${sampleImport.file}:${sampleImport.line} - \`${sampleImport.importText.replace(/`/g, '\\`')}\``
      );
    }
  }

  lines.push(
    '',
    '## Interpretation',
    '',
    '- `covered` means evidence exists at the current foundation layer.',
    '- `partial` means the unit is registered but still needs downstream implementation evidence.',
    '- `not_applicable` must carry an explicit reason in the matrix row.',
    '- This report is a gate artifact, not a replacement for domain review.'
  );

  return `${lines.join('\n')}\n`;
}

export function isReadableTextSource(sourcePath: string): boolean {
  return textExtensions.has(extname(sourcePath).toLowerCase());
}

function extractRuleUnits(source: SourceEntry, text: string): CanonicalMatrixUnit[] {
  const seen = new Set<string>();
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .flatMap((line, index) => {
      const match = /\b([RQ]-\d+(?:\.\d+)*(?:-[a-z]+)?)\b/i.exec(line);
      if (match === null) return [];
      const unitId = (match[1] ?? '').toUpperCase();
      if (seen.has(unitId)) return [];
      seen.add(unitId);
      return [
        buildUnit(
          source,
          unitId,
          unitId.startsWith('Q-') ? 'ambiguity' : 'rule',
          stripMarkdown(line),
          `line ${index + 1}`,
          'partial'
        )
      ];
    });
}

function extractYamlCatalogUnits(source: SourceEntry, text: string): CanonicalMatrixUnit[] {
  const parsed = load(text);
  const units: CanonicalMatrixUnit[] = [];
  if (!isRecord(parsed)) return units;
  for (const [key, value] of Object.entries(parsed))
    collectCatalogUnits(source, value, [key], units);
  return units;
}

function collectCatalogUnits(
  source: SourceEntry,
  value: unknown,
  path: string[],
  units: CanonicalMatrixUnit[]
): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (!isRecord(item)) return;
      const id =
        stringValue(item.id) ?? slugify(stringValue(item.name) ?? `${path.join('-')}-${index}`);
      const title = stringValue(item.name) ?? id;
      const collection = path[path.length - 1] ?? 'entry';
      const type = catalogUnitType(collection, source.path);
      const unit = buildUnit(
        source,
        `${type}:${slugify(id)}`,
        type,
        title,
        `${path.join('.')}.${index}`,
        'partial'
      );
      unit.yaml = {
        entry_id: id,
        evidence: 'Catalog source entry exists.',
        path: source.path,
        status: 'covered'
      };
      unit.zod_schema = link(
        'partial',
        'Zod schema coverage must be linked by domain implementation.'
      );
      units.push(unit);
      for (const [childKey, childValue] of Object.entries(item)) {
        if (Array.isArray(childValue) || isRecord(childValue)) {
          collectCatalogUnits(source, childValue, [...path, String(index), childKey], units);
        }
      }
    });
    return;
  }
  if (isRecord(value)) {
    for (const [key, childValue] of Object.entries(value)) {
      collectCatalogUnits(source, childValue, [...path, key], units);
    }
  }
}

function extractAssetCsvUnits(source: SourceEntry, text: string): CanonicalMatrixUnit[] {
  const rows = parseCsv(text);
  const [header, ...records] = rows;
  if (header === undefined) return [];
  const idIndex = header.indexOf('id');
  const nameIndex = header.indexOf('name');
  const typeIndex = header.indexOf('type');
  if (idIndex === -1) return [];
  return records
    .filter((row) => (row[idIndex] ?? '').length > 0)
    .map((row, index) => {
      const id = row[idIndex] ?? `asset-${index + 1}`;
      const title = row[nameIndex] ?? id;
      const type = (row[typeIndex] ?? '').toLowerCase().includes('handicap') ? 'handicap' : 'asset';
      const unit = buildUnit(
        source,
        `${type}:${slugify(id)}`,
        type,
        title,
        `row ${index + 2}`,
        'partial'
      );
      unit.yaml = {
        entry_id: id,
        evidence: 'Catalog table entry exists.',
        path: source.path,
        status: 'covered'
      };
      unit.zod_schema = link(
        'partial',
        'Zod schema coverage must be linked by domain implementation.'
      );
      return unit;
    });
}

function extractLegacyObjectUnits(source: SourceEntry): CanonicalMatrixUnit[] {
  const units: CanonicalMatrixUnit[] = [];
  const characterMatch = /character-detail\.php_id-(\d+)\.html$/.exec(source.path);
  if (characterMatch !== null) {
    const id = characterMatch[1] ?? 'unknown';
    units.push(
      buildUnit(
        source,
        `legacy_character:${id}`,
        'legacy_character',
        `Legacy character ${id}`,
        'file',
        'partial'
      )
    );
  }
  if (/play\.php/.test(source.path)) {
    units.push(
      buildUnit(
        source,
        `legacy_session_page:${slugify(basename(source.path))}`,
        'legacy_session_page',
        basename(source.path),
        'file',
        'partial'
      )
    );
  }
  return units;
}

function buildUnit(
  source: SourceEntry,
  unitId: string,
  unitType: string,
  title: string,
  ref: string,
  status: UnitStatus
): CanonicalMatrixUnit {
  const isSourceDocument = unitType === 'source_document';
  const downstreamStatus: UnitStatus = isSourceDocument ? 'not_applicable' : 'partial';
  return {
    api: link(
      downstreamStatus,
      downstreamStatus === 'partial' ? 'Downstream API evidence pending.' : 'Source document only.'
    ),
    business_rule: {
      ambiguity_ref: null,
      summary: `${title} from ${source.path}.`
    },
    domain: source.domains[0] ?? 'unclassified',
    relational_db: link(
      downstreamStatus,
      downstreamStatus === 'partial'
        ? 'Canonical relational tables/import evidence pending.'
        : 'Source document only.'
    ),
    rules_core: link(
      unitType === 'rule' ? 'partial' : 'not_applicable',
      unitType === 'rule'
        ? 'Rules-core behavior evidence pending or must be linked.'
        : 'Content/lore unit; no direct rules-core behavior required by default.'
    ),
    sources: [{ path: source.path, ref, sha256: source.sha256 }],
    status,
    tests: link(
      downstreamStatus,
      downstreamStatus === 'partial'
        ? 'Automated coverage evidence pending.'
        : 'Source document only.'
    ),
    title,
    ui: link(
      downstreamStatus,
      downstreamStatus === 'partial' ? 'UI exposure evidence pending.' : 'Source document only.'
    ),
    unit_id: unitId,
    unit_type: unitType,
    vector_store: link(
      source.status === 'out_of_scope' ? 'not_applicable' : 'covered',
      source.status === 'out_of_scope'
        ? 'Out-of-scope source is not indexed.'
        : 'Indexed from source manifest by knowledge indexer.'
    ),
    yaml: link('not_applicable', 'No YAML projection required at source-document layer.'),
    zod_schema: link('not_applicable', 'No Zod schema required.')
  };
}

function link(status: UnitStatus, evidence: string): MatrixLink {
  return { evidence, status };
}

function addUnit(units: Map<string, CanonicalMatrixUnit>, unit: CanonicalMatrixUnit): void {
  if (!units.has(unit.unit_id)) {
    units.set(unit.unit_id, unit);
    return;
  }
  let suffix = 2;
  while (units.has(`${unit.unit_id}#${suffix}`)) suffix += 1;
  units.set(`${unit.unit_id}#${suffix}`, { ...unit, unit_id: `${unit.unit_id}#${suffix}` });
}

async function collectSourceFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  for (const sourceRoot of sourceRoots)
    files.push(...(await walkFiles(join(root, sourceRoot), root)));
  return [...new Set(files)].filter((file) => !file.startsWith(`${generatedDir}/`)).sort();
}

async function walkFiles(directory: string, root: string): Promise<string[]> {
  let entries: Awaited<ReturnType<typeof readdir>>;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectoryNames.has(entry.name)) continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walkFiles(absolute, root)));
    if (entry.isFile()) files.push(relative(root, absolute).split('\\').join('/'));
  }
  return files;
}

function classifySource(path: string): Omit<SourceEntry, 'id' | 'path' | 'sha256'> {
  if (path.startsWith('docs/rules/') && path.endsWith('.md')) {
    return classify(
      'canonical_rule',
      100,
      'active',
      ['rules'],
      [domainFromRulePath(path)],
      'Canonical rule document.'
    );
  }
  if (path.startsWith('data/catalogs/') && path.endsWith('.yaml')) {
    return classify(
      'catalog_yaml',
      90,
      'active',
      containsForCatalog(path),
      domainsForCatalog(path),
      'Product YAML catalog.'
    );
  }
  if (path.startsWith('data/catalogs/') && path.endsWith('.csv')) {
    return classify(
      'catalog_table',
      90,
      'active',
      containsForCatalog(path),
      domainsForCatalog(path),
      'Product catalog table.'
    );
  }
  if (path.startsWith('data/catalogs/') && path.endsWith('.md')) {
    return classify(
      'generated_doc',
      85,
      'active',
      ['catalog_documentation'],
      domainsForCatalog(path),
      'Catalog documentation or ambiguity log.'
    );
  }
  if (path.startsWith('data/legacy/web-scraped/raw-html/')) {
    return classify(
      'legacy_web_html',
      80,
      'active',
      containsForLegacyWeb(path),
      domainsForLegacyWeb(path),
      'Scraped legacy web source.'
    );
  }
  if (path.startsWith('data/legacy/paper/') && path.includes('/extracted/')) {
    return classify(
      'legacy_paper_extract',
      70,
      'active',
      containsForPaperExtract(path),
      domainsForPaperExtract(path),
      'Extracted paper source.'
    );
  }
  if (path.startsWith('apps/legacy-php-site/')) {
    if (isThirdPartyLegacyPath(path)) {
      return classify(
        'third_party',
        10,
        'out_of_scope',
        ['third_party_or_generated_code'],
        ['technical-legacy'],
        'Registered for completeness; excluded from K&W canonical extraction.'
      );
    }
    return classify(
      'legacy_php',
      60,
      'active',
      containsForLegacyPhp(path),
      domainsForLegacyPhp(path),
      'Legacy PHP implementation source.'
    );
  }
  if (path.startsWith('data/legacy/paper/')) {
    return classify(
      'raw_source',
      50,
      'raw_reference_only',
      ['raw_reference'],
      ['source-archive'],
      'Raw paper source retained as evidence; extracted text is preferred for atomization.'
    );
  }
  if (path.startsWith('docs/')) {
    return classify(
      'generated_doc',
      40,
      'active',
      ['project_documentation'],
      ['project-governance'],
      'Project documentation source.'
    );
  }
  return classify(
    'other',
    20,
    'active',
    ['other'],
    ['unclassified'],
    'Registered source requiring later classification.'
  );
}

function classify(
  sourceType: SourceType,
  priority: number,
  status: SourceStatus,
  contains: string[],
  domains: string[],
  notes: string
): Omit<SourceEntry, 'id' | 'path' | 'sha256'> {
  return { contains, domains, notes, priority, source_type: sourceType, status };
}

function domainFromRulePath(path: string): string {
  const match = /docs\/rules\/(\d+)-(.+)\.md$/.exec(path);
  return match === null ? 'rules' : `D${Number(match[1])}-${match[2] ?? 'rules'}`;
}

function domainsForCatalog(path: string): string[] {
  if (path.includes('bestiaire')) return ['D3-races', 'D11-creatures'];
  if (path.includes('atouts')) return ['D4-assets'];
  if (path.includes('armes') || path.includes('protections') || path.includes('potions'))
    return ['D10-equipment'];
  if (path.includes('nations') || path.includes('world-map') || path.includes('cities'))
    return ['D12-world'];
  if (path.includes('religions')) return ['D12-religions'];
  if (path.includes('organisations')) return ['D12-organisations'];
  if (path.includes('lore')) return ['lore'];
  return ['catalogs'];
}

function containsForCatalog(path: string): string[] {
  if (path.includes('bestiaire'))
    return ['races', 'creatures', 'innate_assets', 'innate_handicaps'];
  if (path.includes('atouts')) return ['assets', 'handicaps'];
  if (path.includes('armes')) return ['weapons'];
  if (path.includes('protections')) return ['armor', 'shields'];
  if (path.includes('potions')) return ['potions'];
  if (path.includes('champignons')) return ['mushrooms', 'poisons'];
  if (path.includes('nations')) return ['nations', 'regions', 'cultures'];
  if (path.includes('religions')) return ['religions', 'deities'];
  if (path.includes('organisations')) return ['organisations'];
  if (path.includes('cities')) return ['cities'];
  if (path.includes('images')) return ['images', 'maps', 'flags'];
  return ['catalog_entries'];
}

function domainsForLegacyWeb(path: string): string[] {
  if (path.includes('character-detail')) return ['legacy-characters', 'lore'];
  if (path.includes('play.php')) return ['legacy-sessions', 'lore'];
  if (path.includes('spells')) return ['D8-magic'];
  if (path.includes('classes')) return ['D4-classes'];
  if (path.includes('skills')) return ['D5-skills'];
  if (path.includes('races')) return ['D3-races'];
  if (path.includes('assets')) return ['D4-assets'];
  return ['legacy-web'];
}

function containsForLegacyWeb(path: string): string[] {
  if (path.includes('character-detail')) return ['legacy_character'];
  if (path.includes('play.php')) return ['legacy_session_page', 'forum_posts'];
  if (path.includes('spells')) return ['spells'];
  if (path.includes('classes')) return ['orientations', 'classes'];
  if (path.includes('skills')) return ['skills', 'specializations'];
  if (path.includes('races')) return ['races'];
  if (path.includes('assets')) return ['assets'];
  return ['legacy_web_page'];
}

function domainsForPaperExtract(path: string): string[] {
  if (path.includes('grand-grimoire')) return ['D8-magic'];
  if (path.includes('orientations-et-classes')) return ['D4-classes'];
  if (path.includes('lexique') || path.includes('atouts')) return ['D4-assets'];
  if (path.includes('bestiaire')) return ['D3-races', 'D11-creatures'];
  if (path.includes('experience')) return ['D7-progression'];
  if (path.includes('regles')) return ['rules'];
  if (path.includes('nations') || path.includes('cultes')) return ['D12-world'];
  return ['legacy-paper'];
}

function containsForPaperExtract(path: string): string[] {
  if (path.includes('grand-grimoire')) return ['spells', 'magic_schools'];
  if (path.includes('orientations-et-classes')) return ['orientations', 'classes', 'class_assets'];
  if (path.includes('lexique')) return ['lexicon', 'assets', 'handicaps'];
  if (path.includes('atouts')) return ['level_assets', 'assets'];
  if (path.includes('bestiaire')) return ['races', 'creatures'];
  return ['paper_extract'];
}

function domainsForLegacyPhp(path: string): string[] {
  if (path.includes('FightAssistant') || path.includes('fight-assistant')) return ['D9-combat'];
  if (path.includes('Dice') || path.includes('dice')) return ['D1-resolution'];
  if (path.includes('Character') || path.includes('character'))
    return ['D2-attributes', 'D6-character-creation'];
  if (path.includes('Skill') || path.includes('skill')) return ['D5-skills'];
  if (path.includes('Spell') || path.includes('spell')) return ['D8-magic'];
  if (path.includes('Asset') || path.includes('asset')) return ['D4-assets'];
  if (path.includes('Class') || path.includes('class')) return ['D4-classes'];
  if (path.includes('Race') || path.includes('race')) return ['D3-races'];
  return ['legacy-php'];
}

function containsForLegacyPhp(path: string): string[] {
  if (path.endsWith('.tpl')) return ['legacy_ui'];
  if (path.endsWith('.php')) return ['legacy_behavior'];
  return ['legacy_php_source'];
}

function isThirdPartyLegacyPath(path: string): boolean {
  return (
    path.includes('/includes/PHPMailer/') ||
    path.includes('/includes/smarty/') ||
    path.includes('/includes/fpdf/') ||
    path.includes('/includes/templates_c/')
  );
}

function catalogUnitType(collection: string, path: string): string {
  const explicit: Record<string, string> = {
    armor_pieces: 'armor_piece',
    creatures: 'creature',
    factions: 'organisation',
    images: 'image',
    potions: 'potion',
    regions: 'region',
    religions: 'religion',
    shields: 'shield',
    weapons: 'weapon'
  };
  if (explicit[collection] !== undefined) return explicit[collection];
  if (path.includes('atouts')) return 'asset';
  if (path.includes('cities')) return 'city';
  if (path.includes('images')) return 'image';
  if (collection.endsWith('ies')) return `${collection.slice(0, -3)}y`;
  return collection.endsWith('s') ? collection.slice(0, -1) : collection;
}

function parseSourceEntry(value: unknown): SourceEntry {
  if (!isRecord(value)) throw new Error('Invalid source entry');
  return {
    contains: stringArray(value.contains),
    domains: stringArray(value.domains),
    id: requiredString(value.id, 'id'),
    notes: requiredString(value.notes, 'notes'),
    path: requiredString(value.path, 'path'),
    priority: requiredNumber(value.priority, 'priority'),
    sha256: requiredString(value.sha256, 'sha256'),
    source_type: requiredString(value.source_type, 'source_type') as SourceType,
    status: requiredString(value.status, 'status') as SourceStatus
  };
}

function renderLink(name: string, value: MatrixLink): string[] {
  const lines = [
    `    ${name}:`,
    `      status: ${value.status}`,
    `      evidence: ${yamlString(value.evidence)}`
  ];
  if (value.path !== undefined)
    lines.push(`      path: ${value.path === null ? 'null' : yamlString(value.path)}`);
  if (value.entry_id !== undefined)
    lines.push(`      entry_id: ${value.entry_id === null ? 'null' : yamlString(value.entry_id)}`);
  return lines;
}

function countBy<T, K extends string>(items: T[], getKey: (item: T) => K): Record<K, number> {
  return items.reduce<Record<K, number>>(
    (counts, item) => {
      const key = getKey(item);
      return { ...counts, [key]: (counts[key] ?? 0) + 1 };
    },
    {} as Record<K, number>
  );
}

function countLines(counts: Record<string, number>): string[] {
  return Object.entries(counts)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `- ${key}: ${value}`);
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(current);
      current = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(current);
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }
  row.push(current);
  if (row.some((cell) => cell.length > 0)) rows.push(row);
  return rows;
}

function stripMarkdown(line: string): string {
  return line.replace(/^#+\s*/, '').replace(/^[-*]\s*/, '');
}

function yamlArray(values: string[]): string {
  return values.length === 0 ? '[]' : `[${values.map(yamlString).join(', ')}]`;
}

function yamlString(value: string): string {
  return JSON.stringify(value);
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function requiredString(value: unknown, name: string): string {
  if (typeof value !== 'string') throw new Error(`Source manifest field ${name} must be a string`);
  return value;
}

function requiredNumber(value: unknown, name: string): number {
  if (typeof value !== 'number') throw new Error(`Source manifest field ${name} must be a number`);
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  if (args.has('--write')) {
    await writeCanonicalArtifacts();
    console.log('canonical artifacts written');
    return;
  }
  const result = await checkCanonicalArtifacts();
  if (!result.ok) {
    console.error('canonical artifacts are stale or missing:');
    result.stale.forEach((file) => console.error(`- ${file}`));
    console.error('Run `pnpm canonical:write` and review the generated diff.');
    process.exitCode = 1;
    return;
  }
  if (args.has('--strict')) {
    const imports = await findProductSampleImports();
    if (imports.length > 0) {
      console.error('strict canonical compliance failed: product sample imports remain');
      imports.forEach((entry) =>
        console.error(`- ${entry.file}:${entry.line} ${entry.importText}`)
      );
      process.exitCode = 1;
      return;
    }
  }
  console.log('canonical artifacts are current');
}

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
