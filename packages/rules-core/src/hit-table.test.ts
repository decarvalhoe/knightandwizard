import { describe, expect, it } from 'vitest';

import { PROVISIONAL_HIT_TABLE, rollHitZone } from './hit-table.js';

describe('provisional hit table (R-9.46)', () => {
  it('covers D100 1..100 contiguously, no gaps or overlaps', () => {
    const sorted = [...PROVISIONAL_HIT_TABLE].sort((a, b) => a.min - b.min);

    expect(sorted[0].min).toBe(1);
    expect(sorted[sorted.length - 1].max).toBe(100);

    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i].min).toBe(sorted[i - 1].max + 1);
    }
  });

  it('maps low rolls to limbs and high rolls to vital zones (lethality order)', () => {
    expect(rollHitZone(() => 1).zone).toBe('pied');
    expect(rollHitZone(() => 60).zone).toBe('ventre_bas_dos');
    expect(rollHitZone(() => 85)).toMatchObject({
      zone: 'tete',
      damageMultiplier: 2,
      allowsEndurance: true
    });
    expect(rollHitZone(() => 90)).toMatchObject({
      zone: 'parties_genitales',
      allowsEndurance: false
    });
    expect(rollHitZone(() => 100)).toMatchObject({
      zone: 'gorge_nuque',
      damageMultiplier: 2,
      allowsEndurance: false
    });
  });

  it('returns the roll and an in-world voice line', () => {
    const result = rollHitZone(() => 1);

    expect(result.roll).toBe(1);
    expect(result.voice.length).toBeGreaterThan(0);
  });

  it('rejects an out-of-range D100 value', () => {
    expect(() => rollHitZone(() => 0)).toThrow();
    expect(() => rollHitZone(() => 101)).toThrow();
  });
});
