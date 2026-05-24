import { BestiaireSurface } from '@/features/bestiaire/BestiaireSurface';
import { getBestiaireReadModel } from '@/features/bestiaire/read-models';

export const dynamic = 'force-dynamic';

export default async function BestiairePage() {
  const readModel = await getBestiaireReadModel();

  return <BestiaireSurface view={readModel.view} />;
}
