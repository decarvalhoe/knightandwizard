import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { chunkMarkdownDocument, chunkYamlCatalog, type KnowledgeChunk } from './chunker.js';

const repoRoot = resolve(
  process.cwd().endsWith('/apps/server') ? join(process.cwd(), '../..') : process.cwd()
);

async function main(): Promise<void> {
  const chunks: KnowledgeChunk[] = [];

  for (const fileName of await readdir(join(repoRoot, 'docs/rules'))) {
    if (!fileName.endsWith('.md')) {
      continue;
    }

    const sourcePath = `docs/rules/${fileName}`;
    const text = await readFile(join(repoRoot, sourcePath), 'utf8');
    chunks.push(...chunkMarkdownDocument({ sourcePath, sourceKind: 'rule_markdown', text }));
  }

  for (const fileName of await readdir(join(repoRoot, 'data/catalogs'))) {
    if (!fileName.endsWith('.yaml')) {
      continue;
    }

    const sourcePath = `data/catalogs/${fileName}`;
    const text = await readFile(join(repoRoot, sourcePath), 'utf8');
    chunks.push(...chunkYamlCatalog({ sourcePath, text }));
  }

  const byKind = new Map<string, number>();
  for (const chunk of chunks) {
    byKind.set(chunk.sourceKind, (byKind.get(chunk.sourceKind) ?? 0) + 1);
  }

  console.log(`knowledge dry-run: ${chunks.length} chunks`);
  for (const [kind, count] of [...byKind.entries()].sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    console.log(`- ${kind}: ${count}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
