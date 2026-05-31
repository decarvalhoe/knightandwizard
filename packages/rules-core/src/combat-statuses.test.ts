import { describe, expect, it } from 'vitest';

import {
  defineTacticalStatusRegistry,
  getTacticalStatusDefinition,
  isKnownTacticalStatus,
  listTacticalStatusDefinitions,
  TACTICAL_STATUS_IDS,
  TACTICAL_STATUS_REGISTRY
} from './combat-statuses.js';

describe('R-9.27 tactical status catalog', () => {
  it('contains the complete base R-9.27 status set plus the legacy weakened status', () => {
    expect(TACTICAL_STATUS_IDS).toEqual([
      'prone',
      'grappled',
      'restrained',
      'unconscious',
      'dying',
      'dead',
      'disarmed',
      'disabled_limb',
      'encumbered',
      'stunned',
      'winded',
      'weakened',
      'frightened',
      'enraged',
      'charmed',
      'confused',
      'dominated',
      'surprised',
      'blinded',
      'deafened',
      'silenced',
      'petrified',
      'poisoned',
      'burning',
      'frozen',
      'electrified',
      'bleeding',
      'drowning',
      'invisible',
      'incorporeal',
      'levitating',
      'silenced_magic',
      'blessed',
      'cursed'
    ]);
  });

  it('keeps status ids unique and exposes definitions by id', () => {
    const definitions = listTacticalStatusDefinitions();

    expect(definitions).toHaveLength(34);
    expect(new Set(definitions.map((status) => status.id)).size).toBe(34);
    expect(isKnownTacticalStatus('dead')).toBe(true);
    expect(isKnownTacticalStatus('unknown')).toBe(false);
    expect(getTacticalStatusDefinition('prone')).toMatchObject({
      category: 'physical',
      id: 'prone',
      stackable: false
    });
  });

  it('encodes the important R-9.27 interactions as data', () => {
    expect(TACTICAL_STATUS_REGISTRY.prone.modifiers).toEqual([
      { target: 'difficulty', scope: 'self_melee_attack', value: 1 },
      { target: 'difficulty', scope: 'incoming_melee_attack', value: -1 }
    ]);
    expect(TACTICAL_STATUS_REGISTRY.grappled.interactions.blocks).toContain('move');
    expect(TACTICAL_STATUS_REGISTRY.blinded.modifiers).toContainEqual({
      target: 'difficulty',
      scope: 'targeted_attack',
      value: 2
    });
    expect(TACTICAL_STATUS_REGISTRY.unconscious.interactions.blocks).toContain('all_actions');
    expect(TACTICAL_STATUS_REGISTRY.silenced_magic.interactions.blocks).toContain('spell');
  });

  it('rejects malformed custom status registries', () => {
    expect(() =>
      defineTacticalStatusRegistry({
        prone: {
          id: 'wrong',
          name: 'Wrong',
          category: 'physical',
          durationDT: null,
          stackable: false,
          modifiers: [],
          immunities: [],
          removedBy: [],
          interactions: {}
        }
      })
    ).toThrow(/does not match definition id/);

    expect(() =>
      defineTacticalStatusRegistry({
        custom: {
          id: 'custom',
          name: 'Custom',
          category: 'physical',
          durationDT: -1,
          stackable: false,
          modifiers: [],
          immunities: [],
          removedBy: [],
          interactions: {}
        }
      })
    ).toThrow(/durationDT/);
  });
});
