import type { CombatState } from '@knightandwizard/rules-core';

import { createCombatTrackerState, type CombatantTemplate } from './model';

export const combatantTemplates: CombatantTemplate[] = [
  {
    attributes: { dexterity: 5, stamina: 4, strength: 4 },
    id: 'aveline',
    name: 'Aveline',
    nextActionAt: 6,
    pendingAction: {
      attack: { difficulty: 7, pool: 7 },
      damageOnHit: 3,
      targetId: 'brigand',
      type: 'attack'
    },
    reflexes: 4,
    skills: { 'long-blades': 3, shield: 2 },
    speedFactor: 5,
    statuses: [],
    vitality: { current: 24, max: 24 }
  },
  {
    attributes: { dexterity: 4, stamina: 4, strength: 5 },
    id: 'brigand',
    name: 'Brigand',
    nextActionAt: 8,
    reflexes: 3,
    skills: { axe: 2, dodge: 2 },
    speedFactor: 7,
    statuses: [{ id: 'bleeding', durationDT: 10 }],
    vitality: { current: 13, max: 18 }
  },
  {
    attributes: { dexterity: 3, stamina: 3, strength: 2 },
    id: 'mire',
    name: 'Mire',
    nextActionAt: 12,
    pendingAction: { costDT: 8, type: 'spell' },
    reflexes: 2,
    skills: { arcana: 4, rituals: 2 },
    speedFactor: 8,
    statuses: [],
    vitality: { current: 16, max: 16 }
  },
  {
    attributes: { dexterity: 2, stamina: 6, strength: 5 },
    id: 'skeleton',
    ignoresVitalityMalus: true,
    name: 'Squelette',
    nextActionAt: 0,
    reflexes: 1,
    skills: { claws: 2 },
    speedFactor: 9,
    statuses: [],
    vitality: { current: 10, max: 10 }
  }
];

export function createSampleCombatTrackerState(): CombatState {
  return createCombatTrackerState({
    combatants: combatantTemplates.slice(0, 3),
    currentDT: 1
  });
}
