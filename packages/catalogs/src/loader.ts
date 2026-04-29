import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { load } from 'js-yaml';

export const DEFAULT_CATALOGS_DIR = fileURLToPath(
  new URL('../../../data/catalogs/', import.meta.url)
);

export function catalogPath(catalogName: string, catalogsDir = DEFAULT_CATALOGS_DIR): string {
  const baseDir = resolve(catalogsDir);
  const resolved = resolve(baseDir, catalogName);

  if (resolved !== baseDir && !resolved.startsWith(`${baseDir}${sep}`)) {
    throw new Error(`Catalog path escapes data/catalogs: ${catalogName}`);
  }

  return resolved;
}

export async function loadCatalog<T = unknown>(
  catalogName: string,
  catalogsDir = DEFAULT_CATALOGS_DIR
): Promise<T> {
  return loadYamlFile<T>(catalogPath(catalogName, catalogsDir));
}

export async function loadYamlFile<T = unknown>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf8');
  return load(content) as T;
}
