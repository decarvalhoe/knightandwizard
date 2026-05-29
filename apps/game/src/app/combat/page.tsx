import { CombatTracker } from '@/features/combat-tracker/CombatTracker';
import { getCombatTrackerReadModel } from '@/features/combat-tracker/read-models';

export const dynamic = 'force-dynamic';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default async function CombatPage({
  searchParams
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const params = await searchParams;
  const slug = normalizeSlug(normalizeSearchParam(params.slug));
  const characterId = normalizeSearchParam(params.characterId);
  const readModel = await getCombatTrackerReadModel({ characterId, sessionSlug: slug });

  return (
    <CombatTracker
      combatantTemplates={readModel.combatantTemplates}
      currentCharacterId={characterId}
      initialState={readModel.initialState}
      sessionSlug={readModel.sessionSlug}
    />
  );
}

function normalizeSlug(value: string | undefined): string | undefined {
  return value && SLUG_PATTERN.test(value) ? value : undefined;
}

function normalizeSearchParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
