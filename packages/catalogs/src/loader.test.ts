import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { catalogPath, loadCatalog, loadYamlFile } from './loader.js';

describe('catalog YAML loader', () => {
  it('parses a YAML file as structured data', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'kw-catalog-'));
    const file = join(dir, 'sample.yaml');
    await writeFile(file, 'version: 1\nitems:\n  - id: test\n    name: Test\n', 'utf8');

    const data = await loadYamlFile<{ version: number; items: Array<{ id: string }> }>(file);

    expect(data.version).toBe(1);
    expect(data.items).toEqual([{ id: 'test', name: 'Test' }]);
  });

  it('resolves catalog paths from the repository data/catalogs directory', () => {
    expect(catalogPath('armes.yaml')).toMatch(/data\/catalogs\/armes\.yaml$/);
  });

  it('loads an existing canonical K&W catalog', async () => {
    const catalog = await loadCatalog<{
      metadata: { total_entries: number };
      weapons: unknown[];
    }>('armes.yaml');

    expect(catalog.metadata.total_entries).toBe(107);
    expect(catalog.weapons).toHaveLength(catalog.metadata.total_entries);
  });
});
