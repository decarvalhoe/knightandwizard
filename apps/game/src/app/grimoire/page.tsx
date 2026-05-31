import { GrimoireSurface } from '@/features/grimoire/GrimoireSurface';
import { getGrimoireReadModel } from '@/features/grimoire/read-models';

export default async function GrimoirePage() {
  const view = await getGrimoireReadModel();

  return <GrimoireSurface view={view} />;
}
