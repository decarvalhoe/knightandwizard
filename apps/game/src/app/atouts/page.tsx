import { AtoutsCompanionSurface } from '@/features/atouts/AtoutsCompanionSurface';
import { getAtoutsCompanionReadModel } from '@/features/atouts/read-models';

export const dynamic = 'force-dynamic';

export default async function AtoutsPage() {
  const view = await getAtoutsCompanionReadModel();

  return <AtoutsCompanionSurface view={view} />;
}
