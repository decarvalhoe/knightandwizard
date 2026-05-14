import type { CombatState } from '@knightandwizard/rules-core';

import { getCatalogDocument } from '@/lib/catalogs';

import { createCombatTrackerState, type CombatantTemplate } from './model';

interface BestiaryCatalogDocument {
  creatures?: Array<{ id?: string; name?: string; status?: string }>;
}

export interface CombatTrackerReadModel {
  combatantTemplates: CombatantTemplate[];
  initialState: CombatState;
}

export async function getCombatTrackerReadModel(): Promise<CombatTrackerReadModel> {
  const bestiary = await getCatalogDocument<BestiaryCatalogDocument>('bestiaire.yaml');
  const combatantTemplates = buildCombatantTemplates(bestiary);

  return {
    combatantTemplates,
    initialState: createCombatTrackerState({
      combatants: combatantTemplates.slice(0, 3),
      currentDT: 1
    })
  };
}

export function buildCombatantTemplates(bestiary: BestiaryCatalogDocument): CombatantTemplate[] {
  const skeletonName =
    bestiary.creatures?.find((creature) => creature.id === 'squelette')?.name ?? 'Squelette';

  return [
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
      skills: { 'epee-batarde': 3, bouclier: 2 },
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
      skills: { hache: 2, esquive: 2 },
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
      id: 'squelette',
      ignoresVitalityMalus: true,
      name: cleanCreatureName(skeletonName),
      nextActionAt: 0,
      reflexes: 1,
      skills: { claws: 2 },
      speedFactor: 9,
      statuses: [],
      vitality: { current: 10, max: 10 }
    }
  ];
}

function cleanCreatureName(name: string): string {
  return name.replace(/,\s*-.*/, '').trim();
}
