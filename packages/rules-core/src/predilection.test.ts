import { describe, expect, it } from 'vitest';

import { changePredilection, extendPredilection, initPredilectionSlot } from './predilection.js';

describe('predilection slots', () => {
  it('initializes a one-value slot', () => {
    expect(initPredilectionSlot('arme', 'epee_longue')).toEqual({
      arme: ['epee_longue']
    });
  });

  it('replaces a slot and returns a transition for journaling', () => {
    const result = changePredilection(
      { arme: ['epee_longue'], instrument: ['luth'] },
      'arme',
      'arc_court',
      'level_up'
    );

    expect(result).toEqual({
      slots: { arme: ['arc_court'], instrument: ['luth'] },
      transition: {
        action: 'change',
        kind: 'arme',
        previous: ['epee_longue'],
        next: ['arc_court'],
        value: 'arc_court',
        trigger: 'level_up'
      }
    });
  });

  it('rejects changes with an unsupported trigger', () => {
    expect(() =>
      changePredilection({ arme: ['epee_longue'] }, 'arme', 'arc_court', 'downtime' as never)
    ).toThrow(/Predilection change trigger must be level_up or gm_validation/);
  });

  it('extends a slot only when allowed', () => {
    const result = extendPredilection({ instrument: ['luth'] }, 'instrument', 'flute', {
      allowed: true
    });

    expect(result).toEqual({
      slots: { instrument: ['luth', 'flute'] },
      transition: {
        action: 'extend',
        kind: 'instrument',
        previous: ['luth'],
        next: ['luth', 'flute'],
        value: 'flute'
      }
    });
  });

  it('rejects extensions unless explicitly allowed', () => {
    expect(() =>
      extendPredilection({ domaine: ['service'] }, 'domaine', 'ouvrage', {
        allowed: false
      })
    ).toThrow(/Predilection extension must be allowed/);
  });
});
