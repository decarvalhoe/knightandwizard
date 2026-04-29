import { describe, expect, it } from 'vitest';

import {
  ARBITER_PRECEDENCE,
  compareArbiterAuthority,
  hasArbiterAuthorityOver
} from './arbiter.js';

describe('arbiter authority hierarchy', () => {
  it('keeps the canonical K&W authority order from D13', () => {
    expect(ARBITER_PRECEDENCE).toEqual(['human_gm', 'player', 'llm', 'auto']);
  });

  it('reports whether one arbiter can override another', () => {
    expect(hasArbiterAuthorityOver('human_gm', 'player')).toBe(true);
    expect(hasArbiterAuthorityOver('player', 'llm')).toBe(true);
    expect(hasArbiterAuthorityOver('llm', 'auto')).toBe(true);
    expect(hasArbiterAuthorityOver('auto', 'llm')).toBe(false);
    expect(hasArbiterAuthorityOver('player', 'player')).toBe(false);
  });

  it('compares two arbiters by authority', () => {
    expect(compareArbiterAuthority('human_gm', 'auto')).toBeGreaterThan(0);
    expect(compareArbiterAuthority('auto', 'human_gm')).toBeLessThan(0);
    expect(compareArbiterAuthority('llm', 'llm')).toBe(0);
  });
});
