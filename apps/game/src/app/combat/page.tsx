import { CombatTracker } from '@/features/combat-tracker/CombatTracker';
import { getCombatTrackerReadModel } from '@/features/combat-tracker/read-models';

export const dynamic = 'force-dynamic';

export default async function CombatPage() {
  const readModel = await getCombatTrackerReadModel();

  return (
    <CombatTracker
      combatantTemplates={readModel.combatantTemplates}
      initialState={readModel.initialState}
    />
  );
}
