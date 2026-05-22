import { readFileSync } from 'node:fs';

export type FlatTokens = Record<string, string | number>;

/**
 * Flatten a DTCG token tree into a map of dotted paths to raw values.
 * Group metadata keys (those starting with `$`, e.g. `$type`) are skipped;
 * leaves are objects carrying a `$value`.
 */
export function flattenTokens(obj: Record<string, unknown>, prefix: string[] = []): FlatTokens {
  const out: FlatTokens = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    if (value && typeof value === 'object') {
      const node = value as Record<string, unknown>;
      if ('$value' in node) {
        out[[...prefix, key].join('.')] = node.$value as string | number;
      } else {
        Object.assign(out, flattenTokens(node, [...prefix, key]));
      }
    }
  }
  return out;
}

const ALIAS_RE = /^\{([^}]+)\}$/;

/**
 * Resolve a DTCG alias (e.g. `{color.brand.ink}`) against a flat primitive map.
 * Non-alias values are returned unchanged. Throws on a dangling reference.
 */
export function resolveAlias(value: string | number, primitives: FlatTokens): string | number {
  if (typeof value !== 'string') return value;
  const match = ALIAS_RE.exec(value.trim());
  if (!match) return value;
  const ref = match[1];
  if (!(ref in primitives)) {
    throw new Error(`Unresolved token alias: {${ref}}`);
  }
  return primitives[ref];
}

export function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
}
