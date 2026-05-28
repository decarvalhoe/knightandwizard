/**
 * G3 — Helper de **régénération gouvernée** (contrat `docs/product/cms-governance-workflow.md`).
 *
 * Quand une `catalog-decisions` passe à `applied`, l'éditeur doit (1) régénérer le canon et (2)
 * **enregistrer** la commande + les artefacts touchés (`regenerationCommand`, `regeneratedArtifacts`)
 * dans la décision. Ce script automatise (1) puis imprime un bloc prêt à coller pour (2) — il ne
 * touche PAS Payload (pas de hook shell risqué : la régénération reste une étape tracée explicite).
 *
 * Fait : `canonical:write` → `nomos:export`, puis liste les fichiers modifiés (`data/catalogs`,
 * `docs/canonical`) avec leur sha256, au format `regeneratedArtifacts`.
 *
 * Usage : `pnpm cms:governance:regenerate`
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TRACKED_PREFIXES = ['data/catalogs/', 'docs/canonical/'];

function run(script: string): void {
  console.log(`\n$ pnpm ${script}`);
  execFileSync('pnpm', [script], { cwd: ROOT, stdio: 'inherit' });
}

function changedArtifacts(): string[] {
  const out = execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' });
  return out
    .split('\n')
    .map((line) => line.slice(3).trim())
    .filter((path) => TRACKED_PREFIXES.some((prefix) => path.startsWith(prefix)));
}

function sha256(relPath: string): string {
  try {
    return createHash('sha256')
      .update(readFileSync(join(ROOT, relPath)))
      .digest('hex');
  } catch {
    return '(supprimé)';
  }
}

function main(): void {
  console.log('G3 — régénération gouvernée du canon (canonical:write + nomos:export)');
  run('canonical:write');
  run('nomos:export');

  const artifacts = changedArtifacts();
  console.log('\n── regeneratedArtifacts (à coller dans la catalog-decisions) ──');
  if (artifacts.length === 0) {
    console.log('  (aucun artefact modifié — le canon était déjà à jour)');
    return;
  }
  for (const path of artifacts) {
    console.log(`  - path: ${path}`);
    console.log(`    command: pnpm canonical:write && pnpm nomos:export`);
    console.log(`    sha256: ${sha256(path)}`);
  }
  console.log(
    `\n${artifacts.length} artefact(s) régénéré(s). Pense à les commiter avec la décision.`
  );
}

main();
