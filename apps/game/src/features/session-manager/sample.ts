import type { SessionDecision, SessionEvent } from '@knightandwizard/rules-core';
import { createSessionManagerState } from './model';

const sampleEvents: SessionEvent[] = [
  {
    actorId: 'gm',
    createdAt: '2026-04-30T20:04:00.000Z',
    id: 'event-1',
    payload: { location: 'Porte nord' },
    sequence: 1,
    type: 'scene_opened'
  },
  {
    actorId: 'aveline',
    createdAt: '2026-04-30T20:11:00.000Z',
    id: 'event-2',
    payload: { text: 'Aveline interroge le guetteur.' },
    sequence: 2,
    type: 'player_action'
  },
  {
    actorId: 'aveline',
    createdAt: '2026-04-30T20:12:00.000Z',
    id: 'event-3',
    payload: { difficulty: 7, successes: 2 },
    sequence: 3,
    type: 'dice_roll'
  },
  {
    actorId: 'gm',
    createdAt: '2026-04-30T20:18:00.000Z',
    id: 'event-4',
    payload: { text: 'Les brigands sortent de la brume.' },
    sequence: 4,
    type: 'combat'
  }
];

const sampleDecisions: SessionDecision[] = [
  {
    assignedTo: 'human_gm',
    createdAt: '2026-04-30T20:19:00.000Z',
    id: 'decision-1',
    payload: { options: ['negociation', 'embuscade'] },
    priority: 'high',
    requestedBy: 'llm',
    status: 'pending',
    title: 'Valider la reaction du guetteur'
  }
];

export function createSampleSessionManagerState() {
  return createSessionManagerState({
    decisions: sampleDecisions,
    events: sampleEvents
  });
}
