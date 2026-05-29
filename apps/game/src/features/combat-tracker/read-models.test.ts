import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Character, CombatState } from '@knightandwizard/rules-core';

import { getCombatTrackerReadModel } from './read-models.js';

const originalApiBaseUrl = process.env.API_BASE_URL;

afterEach(() => {
  vi.restoreAllMocks();
  restoreEnv('API_BASE_URL', originalApiBaseUrl);
});

describe('combat tracker read models', () => {
  it('resumes the latest combat state from the session journal', async () => {
    process.env.API_BASE_URL = 'http://api.test';
    const persistedState = combatState({ currentVitality: 7 });
    vi.stubGlobal('fetch', fetchForReadModel({ combatState: persistedState }));

    const readModel = await getCombatTrackerReadModel({
      characterId: 'pc-aveline',
      sessionSlug: 'brumeval'
    });

    expect(readModel.sessionSlug).toBe('brumeval');
    expect(readModel.initialState).toMatchObject({
      currentDT: 6,
      timeline: [
        {
          id: 'pc-aveline',
          name: 'Aveline API',
          vitality: { current: 7, max: 20 }
        }
      ]
    });
  });

  it('seeds a new combat from the persisted character and available bestiary templates', async () => {
    process.env.API_BASE_URL = 'http://api.test';
    vi.stubGlobal('fetch', fetchForReadModel());

    const readModel = await getCombatTrackerReadModel({
      characterId: 'pc-aveline',
      sessionSlug: 'brumeval'
    });

    expect(readModel.initialState.timeline[0]).toMatchObject({
      id: 'pc-aveline',
      name: 'Aveline API',
      vitality: { current: 20, max: 20 }
    });
    expect(readModel.combatantTemplates[0]).toMatchObject({
      characterId: 'pc-aveline',
      id: 'pc-aveline',
      loadoutLabels: ['Épée bâtarde'],
      sourceLabel: 'PJ'
    });
    expect(
      readModel.combatantTemplates.some((combatant) => combatant.sourceLabel === 'Bestiaire')
    ).toBe(true);
  });
});

function fetchForReadModel(input: { combatState?: CombatState } = {}) {
  return vi.fn(async (url: string | URL | Request) => {
    const href = String(url);

    if (href === 'http://api.test/sessions/brumeval') {
      return jsonResponse({
        createdAt: '2026-05-29T08:00:00.000Z',
        events: input.combatState
          ? [
              {
                actorId: 'gm',
                createdAt: '2026-05-29T08:01:00.000Z',
                eventType: 'combat',
                id: 'event-combat-1',
                payload: {
                  kind: 'combat_state',
                  state: input.combatState
                },
                sequence: 1
              }
            ]
          : [],
        id: 'session-1',
        metadata: {},
        mode: 'digital_human_gm',
        slug: 'brumeval',
        status: 'active',
        title: 'Brumeval',
        updatedAt: '2026-05-29T08:01:00.000Z'
      });
    }

    if (href === 'http://api.test/catalogs/bestiaire.yaml') {
      return jsonResponse({
        catalog: {
          document: {
            creatures: [{ id: 'squelette', name: 'Squelette', status: 'active' }]
          }
        },
        status: 'found'
      });
    }

    if (href === 'http://api.test/catalogs/armes.yaml') {
      return jsonResponse({
        catalog: {
          document: {
            weapons: [
              {
                damage_formula: 'F+6',
                difficulty: 8,
                id: 'epee_batarde',
                name: 'Épée bâtarde',
                status: 'active'
              }
            ]
          }
        },
        status: 'found'
      });
    }

    if (href === 'http://api.test/characters/pc-aveline') {
      return jsonResponse({
        character: sampleCharacter(),
        status: 'found'
      });
    }

    return new Response(JSON.stringify({ status: 'not_found' }), { status: 404 });
  });
}

function combatState(input: { currentVitality: number }): CombatState {
  return {
    currentDT: 6,
    log: [],
    round: 1,
    timeline: [
      {
        attributes: { dexterity: 3, stamina: 3, strength: 4 },
        baseAttributes: { dexterity: 3, stamina: 3, strength: 4 },
        id: 'pc-aveline',
        name: 'Aveline API',
        nextActionAt: 11,
        reflexes: 2,
        skills: { epee_batarde: 4 },
        speedFactor: 5,
        statuses: [{ id: 'bleeding' }],
        vitality: { current: input.currentVitality, max: 20 }
      }
    ]
  };
}

function sampleCharacter(): Character {
  return {
    attributes: {
      aestheticism: 1,
      charisma: 2,
      dexterity: 3,
      empathy: 1,
      intelligence: 2,
      perception: 2,
      reflexes: 2,
      stamina: 3,
      strength: 4
    },
    classProfile: {
      id: 'garde',
      name: 'Garde',
      orientationId: 'guerrier',
      primarySkillIds: ['epee_batarde']
    },
    energy: { current: 0, max: 0 },
    equipment: [{ id: 'epee_batarde', name: 'Épée bâtarde' }],
    id: 'pc-aveline',
    kind: 'player',
    metadata: {},
    modifiers: [],
    name: 'Aveline API',
    orientation: { id: 'guerrier', name: 'Guerrier' },
    progression: { experiencePoints: 0, experienceTotal: 0, questPoints: 0 },
    race: {
      attributeMax: {
        aestheticism: 8,
        charisma: 8,
        dexterity: 8,
        empathy: 8,
        intelligence: 8,
        perception: 8,
        reflexes: 8,
        stamina: 8,
        strength: 8
      },
      category: 20,
      id: 'humain',
      name: 'Humain',
      speedFactor: 5,
      vitality: 20,
      willFactor: 5
    },
    rulesVersion: 1,
    skills: [{ id: 'epee_batarde', points: 4 }],
    speedFactor: 5,
    spells: [],
    vitality: { current: 20, max: 20 },
    willFactor: 5
  };
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status: 200
  });
}

function restoreEnv(name: 'API_BASE_URL', value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
