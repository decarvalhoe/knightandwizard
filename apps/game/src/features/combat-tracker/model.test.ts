import { describe, expect, it } from 'vitest';

import {
  addTrackerCombatant,
  applyTrackerDamage,
  buildCombatTrackerView,
  createCombatTrackerState,
  formatCombatEvent,
  queueTrackerAction,
  removeTrackerCombatant,
  resolveTrackerNextAction,
  type CombatantTemplate
} from './model.js';

describe('combat tracker model', () => {
  it('builds a sorted DT timeline view with cyclic and relative counters', () => {
    const state = createCombatTrackerState({
      combatants: [
        template({ id: 'slow', name: 'Brigand', nextActionAt: 58, reflexes: 2 }),
        template({ id: 'fast', name: 'Aveline', nextActionAt: 54, reflexes: 4 }),
        template({ id: 'tie', name: 'Mire', nextActionAt: 54, reflexes: 1 })
      ],
      currentDT: 51
    });
    const view = buildCombatTrackerView(state);

    expect(view.current).toEqual({ absoluteDT: 51, cyclicDT: 1, round: 2 });
    expect(
      view.timeline.map((row) => [
        row.id,
        row.name,
        row.absoluteDT,
        row.cyclicDT,
        row.relativeDT,
        row.active
      ])
    ).toEqual([
      ['fast', 'Aveline', 54, 4, 3, true],
      ['tie', 'Mire', 54, 4, 3, false],
      ['slow', 'Brigand', 58, 8, 7, false]
    ]);
  });

  it('adds and removes combatants through the tracker state', () => {
    const state = createCombatTrackerState({ currentDT: 10 });
    const withAveline = addTrackerCombatant(state, template({ id: 'aveline', name: 'Aveline' }));
    const withBrigand = addTrackerCombatant(
      withAveline,
      template({ id: 'brigand', name: 'Brigand', speedFactor: 8 })
    );
    const withoutAveline = removeTrackerCombatant(withBrigand, 'aveline');

    expect(withAveline.timeline[0]).toMatchObject({
      id: 'aveline',
      nextActionAt: 16
    });
    expect(withBrigand.timeline.map((combatant) => combatant.id)).toEqual(['aveline', 'brigand']);
    expect(withoutAveline.timeline.map((combatant) => combatant.id)).toEqual(['brigand']);
  });

  it('applies damage, updates vitality view, and delays the target action', () => {
    const state = createCombatTrackerState({
      combatants: [template({ id: 'target', vitality: { current: 12, max: 12 } })],
      currentDT: 4
    });
    const damaged = applyTrackerDamage(state, 'target', 7);
    const view = buildCombatTrackerView(damaged);
    const target = view.roster.find((combatant) => combatant.id === 'target');

    expect(target).toMatchObject({
      vitalityPercent: 42,
      vitalityState: 'critical'
    });
    expect(damaged.timeline[0].nextActionAt).toBe(17);
    expect(view.log.at(-1)?.label).toBe('Dégâts 7 sur Combatant');
  });

  it('queues a rules-core attack action and resolves the next actor', () => {
    const state = createCombatTrackerState({
      combatants: [
        template({
          id: 'attacker',
          name: 'Aveline',
          nextActionAt: 6,
          speedFactor: 5
        }),
        template({
          id: 'defender',
          name: 'Brigand',
          nextActionAt: 12,
          speedFactor: 8
        })
      ],
      currentDT: 1
    });
    const queued = queueTrackerAction(state, 'attacker', {
      attack: { difficulty: 7, pool: 3 },
      damageOnHit: 3,
      targetId: 'defender',
      type: 'attack'
    });
    const resolved = resolveTrackerNextAction(queued, scriptedRolls([7, 8, 2]));
    const defender = resolved.timeline.find((combatant) => combatant.id === 'defender');
    const view = buildCombatTrackerView(resolved);

    expect(defender?.vitality.current).toBe(9);
    expect(defender?.nextActionAt).toBe(15);
    expect(view.current).toEqual({ absoluteDT: 6, cyclicDT: 6, round: 1 });
    expect(view.log.map((event) => event.label)).toContain('Aveline touche Brigand : 2 succès');
  });

  it('formats non-attack actions for the combat log', () => {
    const state = createCombatTrackerState({
      combatants: [
        template({ id: 'actor', name: 'Mire', pendingAction: { costDT: 4, type: 'spell' } })
      ],
      currentDT: 1
    });
    const resolved = resolveTrackerNextAction(state);

    expect(formatCombatEvent(resolved.log.at(-1)!, resolved.timeline)).toEqual({
      atDT: 7,
      label: 'Mire résout spell',
      tone: 'neutral'
    });
  });
});

function template(overrides: Partial<CombatantTemplate> = {}): CombatantTemplate {
  return {
    attributes: { dexterity: 5, stamina: 5, strength: 5 },
    id: 'combatant',
    name: 'Combatant',
    nextActionAt: 0,
    reflexes: 3,
    skills: { 'long-blades': 3 },
    speedFactor: 6,
    statuses: [],
    vitality: { current: 12, max: 12 },
    ...overrides
  };
}

function scriptedRolls(values: number[]) {
  let index = 0;

  return (sides: number): number => {
    const value = values[index];
    index += 1;

    if (value === undefined) {
      throw new Error(`No scripted roll left for D${sides}`);
    }

    return value;
  };
}
