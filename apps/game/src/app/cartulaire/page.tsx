import { CartulaireSurface } from '@/features/cartulaire/CartulaireSurface';
import { getCartulaireReadModel } from '@/features/cartulaire/read-models';

export const dynamic = 'force-dynamic';

export default async function CartulairePage() {
  const readModel = await getCartulaireReadModel();

  return <CartulaireSurface readModel={readModel} />;
}
