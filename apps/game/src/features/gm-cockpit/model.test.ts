import { describe, expect, it } from 'vitest';

import { createSessionManagerState } from '../session-manager/model.js';

import { buildGmCockpitView } from './model.js';

describe('GM cockpit model', () => {
  it('aggregates the active scene, participants, decision queue and action links', () => {
    const state = createSessionManagerState({
      decisions: [
        {
          assignedTo: 'human_gm',
          createdAt: '2026-05-29T08:00:00.000Z',
          id: 'decision-1',
          payload: { source: 'thread' },
          priority: 'high',
          requestedBy: 'player-aveline',
          status: 'pending',
          title: 'Valider le bruit de la serrure'
        }
      ],
      events: [
        {
          actorId: 'gm',
          createdAt: '2026-05-29T08:01:00.000Z',
          id: 'event-1',
          payload: { text: 'Ouverture de table.' },
          sequence: 1,
          type: 'narration'
        }
      ],
      players: [
        {
          connected: true,
          id: 'gm',
          name: 'MJ',
          role: 'human_gm'
        },
        {
          characterId: 'pc-aveline',
          connected: true,
          id: 'player-aveline',
          name: 'Aveline',
          role: 'player'
        }
      ],
      scenes: [
        {
          id: 'porte',
          location: 'Brumeval',
          status: 'active',
          title: 'Porte nord'
        }
      ],
      slug: 'brumeval'
    });

    const view = buildGmCockpitView(state);

    expect(view.activeScene).toMatchObject({
      location: 'Brumeval',
      title: 'Porte nord'
    });
    expect(view.participants.map((participant) => participant.name)).toEqual(['MJ', 'Aveline']);
    expect(view.pendingDecisions).toEqual([
      {
        assignedTo: 'MJ humain',
        id: 'decision-1',
        priority: 'high',
        priorityLabel: 'Haute',
        requestedBy: 'Aveline',
        title: 'Valider le bruit de la serrure'
      }
    ]);
    expect(view.primaryCombatHref).toBe('/combat?slug=brumeval&characterId=pc-aveline');
    expect(view.sessionHref).toBe('/session?slug=brumeval');
    expect(view.xpTargets).toEqual([
      {
        characterId: 'pc-aveline',
        id: 'player-aveline',
        name: 'Aveline'
      }
    ]);
    expect(view.rollbackTargets).toEqual([{ label: '#1 narration', sequence: 1 }]);
  });
});
