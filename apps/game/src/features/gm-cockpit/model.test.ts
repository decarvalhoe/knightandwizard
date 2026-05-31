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
      changeRequests: [
        {
          assignedTo: 'human_gm',
          authority: 'human_gm',
          changeKind: 'predilection_target',
          createdAt: '2026-05-29T08:02:00.000Z',
          id: 'change-1',
          payload: { source: 'character-sheet' },
          priority: 'high',
          requestedBy: 'player-aveline',
          scope: 'game_state',
          status: 'pending',
          summary: 'Aveline veut remplacer son arme de predilection.',
          targetId: 'pc-aveline',
          targetType: 'character',
          title: 'Changer la predilection',
          updatedAt: '2026-05-29T08:02:00.000Z'
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
    expect(view.pendingChangeRequests).toEqual([
      {
        assignedTo: 'MJ humain',
        authority: 'MJ humain',
        changeKind: 'predilection_target',
        id: 'change-1',
        priority: 'high',
        priorityLabel: 'Haute',
        requestedBy: 'Aveline',
        status: 'pending',
        statusLabel: 'En attente',
        summary: 'Aveline veut remplacer son arme de predilection.',
        targetLabel: 'character · pc-aveline',
        title: 'Changer la predilection'
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
