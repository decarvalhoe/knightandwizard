import { describe, expect, it } from 'vitest';

import {
  type ActiveSpell,
  DT_SECONDS,
  NARRATIVE_UNIT_SECONDS,
  advanceNarrative,
  dtToNarrativeSeconds,
  durationToSeconds,
  endCombat,
  expireActiveSpells,
  isActiveSpellExpired,
  spellExpiresAt
} from './narrative-time.js';

function spell(overrides: Partial<ActiveSpell> = {}): ActiveSpell {
  return {
    id: overrides.id ?? 'spell-1',
    castAtSeconds: overrides.castAtSeconds ?? 0,
    durationAmount: overrides.durationAmount ?? 1,
    durationUnit: overrides.durationUnit ?? 'minute',
    ...overrides
  };
}

describe('constants (R-8.20)', () => {
  it('uses 0,2 s per DT', () => {
    expect(DT_SECONDS).toBe(0.2);
  });

  it('maps narrative units to seconds', () => {
    expect(NARRATIVE_UNIT_SECONDS).toEqual({ minute: 60, hour: 3_600, day: 86_400 });
  });
});

describe('dtToNarrativeSeconds (R-8.20 — 1 DT = 0,2 s)', () => {
  it('converts combat time to narrative seconds', () => {
    expect(dtToNarrativeSeconds(0)).toBe(0);
    expect(dtToNarrativeSeconds(1)).toBeCloseTo(0.2);
    expect(dtToNarrativeSeconds(50)).toBeCloseTo(10);
  });

  it('rejects negative or non-finite input', () => {
    expect(() => dtToNarrativeSeconds(-1)).toThrow(/non-negative finite/);
    expect(() => dtToNarrativeSeconds(Number.NaN)).toThrow(/non-negative finite/);
    expect(() => dtToNarrativeSeconds(Number.POSITIVE_INFINITY)).toThrow(/non-negative finite/);
  });
});

describe('durationToSeconds', () => {
  it('returns null for a permanent spell (dispel-only)', () => {
    expect(durationToSeconds(0, 'permanent')).toBeNull();
    expect(durationToSeconds(99, 'permanent')).toBeNull();
  });

  it('scales DT durations by 0,2 s', () => {
    expect(durationToSeconds(10, 'DT')).toBeCloseTo(2);
  });

  it('scales narrative durations by their unit', () => {
    expect(durationToSeconds(2, 'minute')).toBe(120);
    expect(durationToSeconds(3, 'hour')).toBe(10_800);
    expect(durationToSeconds(1, 'day')).toBe(86_400);
  });

  it('rejects negative or non-finite amounts (non-permanent)', () => {
    expect(() => durationToSeconds(-1, 'minute')).toThrow(/non-negative finite/);
    expect(() => durationToSeconds(Number.NaN, 'DT')).toThrow(/non-negative finite/);
  });
});

describe('spellExpiresAt', () => {
  it('adds the resolved duration to the cast instant', () => {
    expect(
      spellExpiresAt(spell({ castAtSeconds: 100, durationAmount: 2, durationUnit: 'minute' }))
    ).toBe(220);
  });

  it('returns null for a permanent spell', () => {
    expect(spellExpiresAt(spell({ durationUnit: 'permanent' }))).toBeNull();
  });

  it('places a combat-scale (DT) spell on the same narrative clock', () => {
    // 10 DT = 2 s, cast at 60 s narrative → expires at 62 s.
    expect(
      spellExpiresAt(spell({ castAtSeconds: 60, durationAmount: 10, durationUnit: 'DT' }))
    ).toBeCloseTo(62);
  });
});

describe('isActiveSpellExpired', () => {
  const s = spell({ castAtSeconds: 0, durationAmount: 1, durationUnit: 'minute' }); // expires at 60

  it('is not expired before the expiry instant', () => {
    expect(isActiveSpellExpired(s, 59.9)).toBe(false);
  });

  it('expires exactly at the expiry instant (>=)', () => {
    expect(isActiveSpellExpired(s, 60)).toBe(true);
  });

  it('is expired after the expiry instant', () => {
    expect(isActiveSpellExpired(s, 61)).toBe(true);
  });

  it('never expires a permanent spell', () => {
    expect(isActiveSpellExpired(spell({ durationUnit: 'permanent' }), 1_000_000)).toBe(false);
  });
});

describe('expireActiveSpells', () => {
  it('partitions spells into active and expired at the narrative instant', () => {
    const dtCombat = spell({ id: 'dt', castAtSeconds: 0, durationAmount: 10, durationUnit: 'DT' }); // 2 s
    const shortBuff = spell({
      id: 'min',
      castAtSeconds: 0,
      durationAmount: 1,
      durationUnit: 'minute'
    }); // 60 s
    const ward = spell({ id: 'perm', durationUnit: 'permanent' });

    // 5 s after start: combat spell gone, the minute buff still up, permanent always up.
    const { active, expired } = expireActiveSpells([dtCombat, shortBuff, ward], 5);

    expect(expired.map((x) => x.id)).toEqual(['dt']);
    expect(active.map((x) => x.id)).toEqual(['min', 'perm']);
  });

  it('preserves input order within each bucket', () => {
    const a = spell({ id: 'a', castAtSeconds: 0, durationAmount: 1, durationUnit: 'minute' });
    const b = spell({ id: 'b', castAtSeconds: 0, durationAmount: 2, durationUnit: 'minute' });
    const c = spell({ id: 'c', castAtSeconds: 0, durationAmount: 3, durationUnit: 'minute' });
    const { active, expired } = expireActiveSpells([a, b, c], 120); // a & b expired at/after 120
    expect(expired.map((x) => x.id)).toEqual(['a', 'b']);
    expect(active.map((x) => x.id)).toEqual(['c']);
  });

  it('returns empty buckets for an empty input', () => {
    expect(expireActiveSpells([], 10)).toEqual({ active: [], expired: [] });
  });
});

describe('advanceNarrative (MJ « passer la journée / N heures »)', () => {
  it('advances by a full day', () => {
    expect(advanceNarrative(0, { days: 1 })).toBe(86_400);
  });

  it('combines days, hours, minutes and seconds', () => {
    expect(advanceNarrative(100, { days: 1, hours: 2, minutes: 3, seconds: 4 })).toBe(
      100 + 86_400 + 7_200 + 180 + 4
    );
  });

  it('treats omitted fields as zero', () => {
    expect(advanceNarrative(50, {})).toBe(50);
  });

  it('rejects a negative starting instant', () => {
    expect(() => advanceNarrative(-1, { hours: 1 })).toThrow(/non-negative finite/);
  });

  it('rejects a negative advance delta', () => {
    expect(() => advanceNarrative(0, { hours: -1 })).toThrow(/non-negative finite/);
  });

  it('expires a DT-scale combat buff once the MJ skips a day (combat nests in narrative)', () => {
    const combatBuff = spell({ castAtSeconds: 0, durationAmount: 10, durationUnit: 'DT' });
    const later = advanceNarrative(0, { days: 1 });
    expect(isActiveSpellExpired(combatBuff, later)).toBe(true);
  });
});

describe('endCombat (R-8.20 — scene DT folds back into the narrative clock)', () => {
  it('advances the narrative clock by the cumulated combat time', () => {
    // 50 DT of combat = 10 s narrative.
    expect(endCombat(1_000, 50)).toBeCloseTo(1_010);
  });

  it('is a no-op for a zero-length combat', () => {
    expect(endCombat(1_000, 0)).toBe(1_000);
  });

  it('rejects a negative starting instant', () => {
    expect(() => endCombat(-1, 10)).toThrow(/non-negative finite/);
  });
});
