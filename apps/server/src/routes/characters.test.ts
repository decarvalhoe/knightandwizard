import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';

const app = buildApp({ logger: false });

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('character routes', () => {
  it('finalizes a saved draft into a persisted character and reads it back by id', async () => {
    const draftId = `route-character-${randomUUID()}`;

    const saveResponse = await app.inject({
      method: 'PUT',
      payload: sampleDraft('Aveline Persistante'),
      url: `/character-drafts/${draftId}`
    });
    const finalizeResponse = await app.inject({
      method: 'POST',
      payload: { draftId },
      url: '/characters/finalize'
    });
    const readResponse = await app.inject({
      method: 'GET',
      url: `/characters/${draftId}`
    });

    expect(saveResponse.statusCode).toBe(200);
    expect(finalizeResponse.statusCode).toBe(201);
    expect(finalizeResponse.json()).toMatchObject({
      character: {
        id: draftId,
        kind: 'player',
        name: 'Aveline Persistante'
      },
      status: 'finalized'
    });
    expect(readResponse.statusCode).toBe(200);
    expect(readResponse.json()).toEqual({
      character: finalizeResponse.json().character,
      status: 'found'
    });
  });

  it('scopes character finalization and mutations to the current request user', async () => {
    const draftId = `route-auth-character-${randomUUID()}`;

    await app.inject({
      headers: { 'x-kw-user-id': 'player-aveline' },
      method: 'PUT',
      payload: sampleDraft('Aveline Authentifiee'),
      url: `/character-drafts/${draftId}`
    });

    const deniedFinalizeResponse = await app.inject({
      headers: { 'x-kw-user-id': 'player-bastian' },
      method: 'POST',
      payload: { draftId },
      url: '/characters/finalize'
    });
    const finalizeResponse = await app.inject({
      headers: { 'x-kw-user-id': 'player-aveline' },
      method: 'POST',
      payload: { draftId },
      url: '/characters/finalize'
    });
    const ownerReadResponse = await app.inject({
      headers: { 'x-kw-user-id': 'player-aveline' },
      method: 'GET',
      url: `/characters/${draftId}`
    });
    const otherReadResponse = await app.inject({
      headers: { 'x-kw-user-id': 'player-bastian' },
      method: 'GET',
      url: `/characters/${draftId}`
    });
    const otherCombatResponse = await app.inject({
      headers: { 'x-kw-user-id': 'player-bastian' },
      method: 'PATCH',
      payload: { vitality: { current: 1 } },
      url: `/characters/${draftId}/combat-state`
    });
    const otherXpResponse = await app.inject({
      headers: { 'x-kw-user-id': 'player-bastian' },
      method: 'POST',
      payload: { amount: 1, reason: 'Intrusion' },
      url: `/characters/${draftId}/xp-awards`
    });

    expect(deniedFinalizeResponse.statusCode).toBe(404);
    expect(finalizeResponse.statusCode).toBe(201);
    expect(finalizeResponse.json()).toMatchObject({
      character: {
        id: draftId,
        name: 'Aveline Authentifiee',
        userId: 'player-aveline'
      },
      status: 'finalized'
    });
    expect(ownerReadResponse.statusCode).toBe(200);
    expect(ownerReadResponse.json().character.userId).toBe('player-aveline');
    expect(otherReadResponse.statusCode).toBe(404);
    expect(otherCombatResponse.statusCode).toBe(404);
    expect(otherXpResponse.statusCode).toBe(404);
  });

  it('updates persisted combat vitality and statuses for the character sheet', async () => {
    const draftId = `route-combat-character-${randomUUID()}`;

    await app.inject({
      method: 'PUT',
      payload: sampleDraft('Aveline Combattante'),
      url: `/character-drafts/${draftId}`
    });
    const finalizeResponse = await app.inject({
      method: 'POST',
      payload: { draftId },
      url: '/characters/finalize'
    });
    const finalizedCharacter = finalizeResponse.json().character;
    const nextVitality = finalizedCharacter.vitality.max - 5;
    const updateResponse = await app.inject({
      method: 'PATCH',
      payload: {
        sessionSlug: 'mvp-combat',
        statuses: [{ durationDT: 8, id: 'bleeding' }],
        vitality: { current: nextVitality }
      },
      url: `/characters/${draftId}/combat-state`
    });
    const readResponse = await app.inject({
      method: 'GET',
      url: `/characters/${draftId}`
    });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json()).toMatchObject({
      character: {
        id: draftId,
        metadata: {
          combat: {
            sessionSlug: 'mvp-combat',
            statuses: [{ durationDT: 8, id: 'bleeding' }]
          }
        },
        vitality: {
          current: nextVitality,
          max: finalizedCharacter.vitality.max
        }
      },
      status: 'updated'
    });
    expect(readResponse.json().character.vitality.current).toBe(nextVitality);
    expect(readResponse.json().character.metadata.combat.statuses).toEqual([
      { durationDT: 8, id: 'bleeding' }
    ]);
  });

  it('awards persisted XP to a character for session-end GM rewards', async () => {
    const draftId = `route-xp-character-${randomUUID()}`;

    await app.inject({
      method: 'PUT',
      payload: sampleDraft('Aveline Recompensee'),
      url: `/character-drafts/${draftId}`
    });
    await app.inject({
      method: 'POST',
      payload: { draftId },
      url: '/characters/finalize'
    });
    const awardResponse = await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        amount: 2,
        questPoints: 1,
        reason: 'Fin de session',
        sessionSlug: 'mvp-xp'
      },
      url: `/characters/${draftId}/xp-awards`
    });
    const readResponse = await app.inject({
      method: 'GET',
      url: `/characters/${draftId}`
    });

    expect(awardResponse.statusCode).toBe(200);
    expect(awardResponse.json()).toMatchObject({
      character: {
        id: draftId,
        metadata: {
          xpAwards: [
            {
              actorId: 'gm',
              amount: 2,
              questPoints: 1,
              reason: 'Fin de session',
              sessionSlug: 'mvp-xp'
            }
          ]
        },
        progression: {
          experiencePoints: 2,
          experienceTotal: 2,
          questPoints: 1
        }
      },
      status: 'updated'
    });
    expect(readResponse.json().character.progression).toEqual({
      experiencePoints: 2,
      experienceTotal: 2,
      questPoints: 1
    });
  });

  it('converts persisted quest points into usable XP when the quest ends', async () => {
    const draftId = `route-quest-convert-character-${randomUUID()}`;

    await app.inject({
      method: 'PUT',
      payload: sampleDraft('Aveline Queteuse'),
      url: `/character-drafts/${draftId}`
    });
    await app.inject({
      method: 'POST',
      payload: { draftId },
      url: '/characters/finalize'
    });
    await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        amount: 2,
        questPoints: 3,
        reason: 'Trois seances de quete',
        sessionSlug: 'quete-brumeval'
      },
      url: `/characters/${draftId}/xp-awards`
    });

    const convertResponse = await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        reason: 'Quete terminee et personnage survivant',
        sessionSlug: 'quete-brumeval'
      },
      url: `/characters/${draftId}/quest-points/convert`
    });
    const readResponse = await app.inject({
      method: 'GET',
      url: `/characters/${draftId}`
    });

    expect(convertResponse.statusCode).toBe(200);
    expect(convertResponse.json()).toMatchObject({
      character: {
        id: draftId,
        metadata: {
          questPointConversions: [
            {
              actorId: 'gm',
              questPoints: 3,
              reason: 'Quete terminee et personnage survivant',
              sessionSlug: 'quete-brumeval'
            }
          ]
        },
        progression: {
          experiencePoints: 5,
          experienceTotal: 5,
          questPoints: 0
        }
      },
      status: 'updated'
    });
    expect(readResponse.json().character.progression).toEqual({
      experiencePoints: 5,
      experienceTotal: 5,
      questPoints: 0
    });
  });

  it('spends persisted XP to improve an existing skill', async () => {
    const draftId = `route-skill-xp-character-${randomUUID()}`;

    await app.inject({
      method: 'PUT',
      payload: sampleDraft('Aveline Studieuse'),
      url: `/character-drafts/${draftId}`
    });
    await app.inject({
      method: 'POST',
      payload: { draftId },
      url: '/characters/finalize'
    });
    await app.inject({
      method: 'POST',
      payload: { amount: 20, reason: 'Reserve de progression' },
      url: `/characters/${draftId}/xp-awards`
    });
    const improvementResponse = await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        reason: 'Entrainement valide par le MJ',
        sessionSlug: 'mvp-xp',
        skillId: 'epee-a-une-main'
      },
      url: `/characters/${draftId}/skill-improvements`
    });
    const readResponse = await app.inject({
      method: 'GET',
      url: `/characters/${draftId}`
    });

    expect(improvementResponse.statusCode).toBe(200);
    expect(improvementResponse.json()).toMatchObject({
      character: {
        id: draftId,
        metadata: {
          xpSpends: [
            {
              actorId: 'gm',
              cost: 12,
              kind: 'skill_improvement',
              previousPoints: 4,
              reason: 'Entrainement valide par le MJ',
              sessionSlug: 'mvp-xp',
              skillId: 'epee-a-une-main'
            }
          ]
        },
        progression: {
          experiencePoints: 8,
          experienceTotal: 20,
          questPoints: 0
        },
        skills: expect.arrayContaining([
          expect.objectContaining({ id: 'epee-a-une-main', points: 5 })
        ])
      },
      status: 'updated'
    });
    expect(readResponse.json().character.skills).toContainEqual({
      id: 'epee-a-une-main',
      isMain: true,
      points: 5
    });
    expect(readResponse.json().character.progression.experiencePoints).toBe(8);
  });

  it('learns an unaffiliated specialization without materializing the zero-point parent skill', async () => {
    const draftId = `route-specialization-xp-character-${randomUUID()}`;

    await app.inject({
      method: 'PUT',
      payload: sampleDraft('Aveline Specialisee'),
      url: `/character-drafts/${draftId}`
    });
    await app.inject({
      method: 'POST',
      payload: { draftId },
      url: '/characters/finalize'
    });
    await app.inject({
      method: 'POST',
      payload: { amount: 3, reason: 'Reserve de specialisation' },
      url: `/characters/${draftId}/xp-awards`
    });
    const improvementResponse = await app.inject({
      method: 'POST',
      payload: {
        parentId: 'competence-non-achetee',
        skillId: 'specialisation-libre'
      },
      url: `/characters/${draftId}/skill-improvements`
    });
    const skills = improvementResponse.json().character.skills;

    expect(improvementResponse.statusCode).toBe(200);
    expect(skills).toContainEqual({
      id: 'specialisation-libre',
      parentId: 'competence-non-achetee',
      points: 1
    });
    expect(skills.some((skill: { id: string }) => skill.id === 'competence-non-achetee')).toBe(
      false
    );
    expect(improvementResponse.json().character.progression.experiencePoints).toBe(0);
  });
});

function sampleDraft(name: string) {
  return {
    currentStep: 'review',
    payload: {
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
      background: 'Garde de la porte nord.',
      classId: 'garde',
      deity: 'Les Trois Flammes',
      equipmentIds: ['epee_batarde'],
      extraSpellPoints: 0,
      genderId: 'unspecified',
      name,
      orientationId: 'guerrier',
      psychology: 'calme',
      quote: 'La lame engage.',
      raceId: 'humain',
      skills: [
        { id: 'epee-a-une-main', points: 4 },
        { id: 'stoicisme', points: 4 },
        { id: 'commandement', points: 4 },
        { id: 'observation-du-terrain', points: 4 },
        { id: 'bouclier', points: 4 }
      ],
      spells: []
    }
  };
}
