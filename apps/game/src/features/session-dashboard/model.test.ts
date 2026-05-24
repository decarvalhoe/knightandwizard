import { describe, expect, it } from 'vitest';

import { createSessionManagerState } from '../session-manager/model.js';

import { buildSessionDashboardView } from './model.js';

describe('session dashboard model', () => {
  it('builds the poste de table view from the session manager state', () => {
    const state = createSessionManagerState({
      decisions: [
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
      ],
      events: [
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
          createdAt: '2026-04-30T20:12:00.000Z',
          id: 'event-2',
          payload: { difficulty: 7, successes: 2 },
          sequence: 2,
          type: 'dice_roll'
        }
      ]
    });

    const view = buildSessionDashboardView(state);

    expect(view.session.metrics).toEqual({
      activePlayers: 2,
      events: 2,
      pendingDecisions: 1,
      scenes: 2
    });
    expect(view.nextActions).toEqual([
      {
        detail: 'llm -> MJ humain',
        id: 'decision-1',
        label: 'Valider la reaction du guetteur',
        tone: 'warn'
      }
    ]);
    expect(view.alerts).toEqual([
      {
        detail: '1 decision MJ en attente',
        id: 'decision-queue',
        label: 'Arbitrage requis',
        tone: 'warn'
      },
      {
        detail: 'Mire',
        id: 'players-offline',
        label: 'Joueur hors ligne',
        tone: 'neutral'
      }
    ]);
    expect(view.shortcuts.map((shortcut) => shortcut.href)).toEqual([
      '/character',
      '/combat',
      '/grimoire'
    ]);
  });
});
