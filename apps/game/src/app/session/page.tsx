import { SessionManager } from '@/features/session-manager/SessionManager';
import { createInitialSessionManagerState } from '@/features/session-manager/initial-state';

export default function SessionPage() {
  return <SessionManager initialState={createInitialSessionManagerState()} />;
}
