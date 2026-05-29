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
