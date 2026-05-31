import { describe, expect, it } from 'vitest';

import { computeEffectiveModifiers, effectiveAttribute } from './effects.js';
import { parseEffectModel } from './effect-model.js';
import {
  activateGrantedStatuses,
  canActivate,
  collectActivatedStatusGrants,
  COMPOSITE_STATUS_REGISTRY,
  defineCompositeStatusRegistry,
  expandActiveStatuses,
  isStatusActive
} from './status-effects.js';

describe('composite status effects', () => {
  it('expands folie-furieuse while active into pool and aptitude bundle effects', () => {
    const ctx = { activeStatuses: ['fou_furieux'], elapsedDT: 74, level: 3 };

    const expanded = expandActiveStatuses(ctx.activeStatuses, COMPOSITE_STATUS_REGISTRY, ctx);

    expect(expanded).toHaveLength(4);
    expect(expanded.map((effect) => effect.spec)).toEqual([
      {
        target: 'pool',
        op: 'add',
        value: 'level',
        condition: { aptitude: ['force', 'endurance'] },
        activation: 'passive',
        duration: 'permanent'
      },
      {
        target: 'aptitude',
        scope: 'empathie',
        op: 'set',
        value: 1,
        activation: 'passive',
        duration: 'permanent'
      },
      {
        target: 'aptitude',
        scope: 'intelligence',
        op: 'set',
        value: 1,
        activation: 'passive',
        duration: 'permanent'
      },
      {
        target: 'aptitude',
        scope: 'perception',
        op: 'set',
        value: 1,
        activation: 'passive',
        duration: 'permanent'
      }
    ]);
  });

  it('folds active status effects into computed modifiers without changing callers that omit statuses', () => {
    const forceModifiers = computeEffectiveModifiers([], {
      activeStatuses: ['fou_furieux'],
      aptitude: 'force',
      elapsedDT: 74,
      level: 3
    });
    const perceptionModifiers = computeEffectiveModifiers([], {
      activeStatuses: ['fou_furieux'],
      aptitude: 'perception',
      elapsedDT: 74,
      level: 3
    });
    const inactiveModifiers = computeEffectiveModifiers([], {
      aptitude: 'force',
      elapsedDT: 74,
      level: 3
    });

    expect(forceModifiers.pool.__global__.add).toBe(3);
    expect(forceModifiers.aptitude.empathie.set).toBe(1);
    expect(forceModifiers.aptitude.intelligence.set).toBe(1);
    expect(forceModifiers.aptitude.perception.set).toBe(1);
    expect(perceptionModifiers.pool).toEqual({});
    expect(inactiveModifiers.pool).toEqual({});
    expect(inactiveModifiers.aptitude).toEqual({});
  });

  it('resolves folie-furieuse aptitude set operations to one', () => {
    const ctx = { activeStatuses: ['fou_furieux'], elapsedDT: 12, level: 2 };

    expect(effectiveAttribute(5, 'empathie', [], ctx)).toBe(1);
    expect(effectiveAttribute(4, 'intelligence', [], ctx)).toBe(1);
    expect(effectiveAttribute(3, 'perception', [], ctx)).toBe(1);
  });

  it('expires folie-furieuse after its locked 25 DT per level duration', () => {
    const statusEntry = {
      id: 'fou_furieux',
      duration: COMPOSITE_STATUS_REGISTRY.fou_furieux.duration
    };

    expect(isStatusActive(statusEntry, 74, { level: 3 })).toBe(true);
    expect(isStatusActive(statusEntry, 75, { level: 3 })).toBe(false);
    expect(
      expandActiveStatuses(
        [{ id: 'fou_furieux', duration: { dt: 1 } }],
        COMPOSITE_STATUS_REGISTRY,
        { elapsedDT: 2, level: 3 }
      )
    ).toHaveLength(4);
  });

  it('guards activation sources per status registry entry', () => {
    const registry = defineCompositeStatusRegistry({
      gm_only: {
        activationSources: ['mj_imposed'],
        effects: [
          {
            target: 'pool',
            op: 'add',
            value: 1,
            activation: 'passive',
            duration: 'permanent'
          }
        ]
      }
    });

    expect(canActivate('mj_imposed', 'gm_only', registry)).toBe(true);
    expect(canActivate('player_toggle', 'gm_only', registry)).toBe(false);
    expect(canActivate('player_toggle', 'missing_status', registry)).toBe(false);
  });

  it('turns granted status effects into active composite statuses for allowed sources', () => {
    const grant = parseEffectModel({
      source: {
        prose: 'Accorde la folie furieuse.',
        ref: 'fixture:status:fou-furieux'
      },
      spec: {
        target: 'status',
        scope: 'fou_furieux',
        op: 'grant',
        value: 1,
        activation: 'active',
        duration: 'ephemeral'
      },
      fidelity: 'covered'
    });

    const modifiers = computeEffectiveModifiers([grant], { activations: ['active'] });
    const grants = collectActivatedStatusGrants(modifiers, 'player_toggle');

    expect(grants).toEqual([
      {
        activationSource: 'player_toggle',
        entry: { id: 'fou_furieux' },
        id: 'fou_furieux',
        sourceRef: 'fixture:status:fou-furieux'
      }
    ]);
    expect(
      expandActiveStatuses(activateGrantedStatuses(modifiers, 'player_toggle'), undefined, {
        elapsedDT: 24,
        level: 1
      })
    ).toHaveLength(4);
  });

  it('filters granted statuses by their activation source contract', () => {
    const registry = defineCompositeStatusRegistry({
      gm_only: {
        activationSources: ['mj_imposed'],
        effects: [
          {
            target: 'pool',
            op: 'add',
            value: 1,
            activation: 'passive',
            duration: 'permanent'
          }
        ]
      }
    });
    const grant = parseEffectModel({
      source: { prose: 'Le MJ impose un etat.', ref: 'fixture:status:gm-only' },
      spec: {
        target: 'status',
        scope: 'gm_only',
        op: 'grant',
        value: 1,
        activation: 'active',
        duration: 'ephemeral'
      },
      fidelity: 'covered'
    });
    const modifiers = computeEffectiveModifiers([grant], { activations: ['active'] });

    expect(activateGrantedStatuses(modifiers, 'player_toggle', registry)).toEqual([]);
    expect(activateGrantedStatuses(modifiers, 'mj_imposed', registry)).toEqual([{ id: 'gm_only' }]);
  });
});
