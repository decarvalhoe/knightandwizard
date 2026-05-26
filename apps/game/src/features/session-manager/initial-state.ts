import { createSessionManagerState } from './model';

export function createInitialSessionManagerState() {
  return createSessionManagerState({
    decisions: [],
    events: [],
    id: 'session-empty',
    metadata: {},
    mode: 'digital_human_gm',
    players: [],
    scenes: [],
    slug: 'session-empty',
    status: 'planned',
    title: 'Session'
  });
}
