import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildCanonicalMatrix,
  buildCoverageSummary,
  buildSourceManifest,
  checkCanonicalArtifacts,
  findProductSampleImports,
  renderCanonicalMatrix,
  renderSourceManifest,
  writeCanonicalArtifacts
} from './canonical.js';

describe('canonical compliance artifacts', () => {
  it('registers source files with hashes, priorities and statuses', async () => {
    const fixture = await createFixtureRepo();

    try {
      const manifest = await buildSourceManifest({ repoRoot: fixture });

      expect(manifest.sources).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'docs/rules/01-resolution.md',
            priority: 100,
            source_type: 'canonical_rule',
            status: 'active'
          }),
          expect.objectContaining({
            path: 'data/catalogs/bestiaire.yaml',
            source_type: 'catalog_yaml',
            status: 'active'
          }),
          expect.objectContaining({
            path: 'apps/legacy-php-site/includes/PHPMailer/vendor.php',
            source_type: 'third_party',
            status: 'out_of_scope'
          })
        ])
      );
      expect(manifest.sources[0]?.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(renderSourceManifest(manifest)).toContain('sources:');
    } finally {
      await rm(fixture, { force: true, recursive: true });
    }
  });

  it('atomizes rules, catalog entries, assets and legacy characters', async () => {
    const fixture = await createFixtureRepo();

    try {
      const manifest = await buildSourceManifest({ repoRoot: fixture });
      const matrix = await buildCanonicalMatrix(manifest, { repoRoot: fixture });
      const unitIds = matrix.units.map((unit) => unit.unit_id);

      expect(unitIds).toContain('R-1.17');
      expect(unitIds).toContain('creature:humain');
      expect(unitIds).toContain('asset:anti-limites-physiques');
      expect(unitIds).toContain('legacy_character:87');
      expect(renderCanonicalMatrix(matrix)).toContain('vector_store:');
    } finally {
      await rm(fixture, { force: true, recursive: true });
    }
  });

  it('reports product sample imports as known blockers', async () => {
    const fixture = await createFixtureRepo();

    try {
      await mkdir(join(fixture, 'apps/game/src/app/character'), { recursive: true });
      await writeFile(
        join(fixture, 'apps/game/src/app/character/page.tsx'),
        "import { sampleCharacter } from '@/features/character-sheet/sample';\n"
      );

      const imports = await findProductSampleImports({ repoRoot: fixture });

      expect(imports).toEqual([
        expect.objectContaining({
          file: 'apps/game/src/app/character/page.tsx',
          line: 1
        })
      ]);
    } finally {
      await rm(fixture, { force: true, recursive: true });
    }
  });

  it('writes idempotent generated artifacts without self-registering them as sources', async () => {
    const fixture = await createFixtureRepo();

    try {
      await writeCanonicalArtifacts({ repoRoot: fixture });
      const result = await checkCanonicalArtifacts({ repoRoot: fixture });

      expect(result).toEqual({ ok: true, stale: [] });
    } finally {
      await rm(fixture, { force: true, recursive: true });
    }
  });

  it('builds a real repository coverage summary with broad corpus scope', async () => {
    const manifest = await buildSourceManifest();
    const matrix = await buildCanonicalMatrix(manifest);
    const summary = await buildCoverageSummary(manifest, matrix);

    expect(summary.manifestSources).toBeGreaterThan(1000);
    expect(summary.matrixUnits).toBeGreaterThan(summary.manifestSources);
    expect(summary.unitsByType.legacy_character).toBeGreaterThan(0);
    expect(summary.productSampleImports.length).toBeGreaterThan(0);
  });
});

async function createFixtureRepo(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'kw-canonical-'));
  await mkdir(join(root, 'docs/rules'), { recursive: true });
  await mkdir(join(root, 'data/catalogs'), { recursive: true });
  await mkdir(join(root, 'data/legacy/web-scraped/raw-html/details'), { recursive: true });
  await mkdir(join(root, 'apps/legacy-php-site/includes/PHPMailer'), { recursive: true });
  await writeFile(join(root, 'docs/rules/01-resolution.md'), '### R-1.17 - Echec critique\n');
  await writeFile(
    join(root, 'data/catalogs/bestiaire.yaml'),
    'version: 1\nmetadata: {}\ncreatures:\n  - id: humain\n    name: Humain\n'
  );
  await writeFile(
    join(root, 'data/catalogs/atouts-values.csv'),
    'id,name,value,xp_cost,handicap_value,is_handicap,kind,scope,legacy_id,description\nanti-limites-physiques,Anti-limites physiques,1000,100,,False,Permanent,Race,1,Desc\n'
  );
  await writeFile(
    join(root, 'data/legacy/web-scraped/raw-html/details/character-detail.php_id-87.html'),
    '<html>Aveline</html>'
  );
  await writeFile(join(root, 'apps/legacy-php-site/includes/PHPMailer/vendor.php'), '<?php');
  return root;
}
