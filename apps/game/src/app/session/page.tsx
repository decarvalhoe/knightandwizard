import { SessionManager } from '@/features/session-manager/SessionManager';
import { getSessionManagerReadModel } from '@/features/session-manager/read-models';

export const dynamic = 'force-dynamic';

export default async function SessionPage() {
  const readModel = await getSessionManagerReadModel();

  return <SessionManager initialState={readModel.initialState} />;
}
