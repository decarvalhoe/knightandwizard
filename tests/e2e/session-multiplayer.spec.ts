import { expect, test } from '@playwright/test';

const e2eApiBaseUrl =
  process.env.E2E_API_URL ?? `http://127.0.0.1:${process.env.E2E_API_PORT ?? '3102'}`;

/**
 * End-to-end proof of "jeu en reseau" (E-C journal -> E-N broadcast -> E-S feed).
 *
 * Two independent browser contexts join the same session room. An action committed
 * by one player must appear on the other player's screen with no reload and no action
 * on their side: the only path for that text to reach them is the live WebSocket feed.
 */
test('two networked players see each other journal actions live', async ({ browser, request }) => {
  const slug = `e2e-net-${Date.now()}`;
  const draftId = `e2e-net-character-${Date.now()}`;
  const saveResponse = await request.put(`${e2eApiBaseUrl}/character-drafts/${draftId}`, {
    data: savedCharacterDraftPayload('Aveline Reseau')
  });
  const finalizeResponse = await request.post(`${e2eApiBaseUrl}/characters/finalize`, {
    data: { draftId }
  });
  const hostUrl = `/session?slug=${slug}&player=gm-e2e&name=MJ%20E2E&role=human_gm`;
  const guestUrl = `/session?slug=${slug}&player=player-aveline&name=Aveline%20Reseau&role=player&characterId=${draftId}`;

  expect(saveResponse.ok()).toBe(true);
  expect(finalizeResponse.ok()).toBe(true);

  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();

  try {
    // Host creates + loads the room first, so the guest joins an existing session.
    const host = await hostContext.newPage();
    await host.goto(hostUrl);
    await expect(host.getByRole('button', { name: 'Publier' })).toBeVisible();

    // Guest joins; wait until its live feed is actually connected before acting,
    // otherwise a broadcast could fire before the guest is subscribed.
    const guest = await guestContext.newPage();
    await guest.goto(guestUrl);
    await expect(guest.getByTestId('session-live-status')).toContainText('En direct');

    // Host plays a table-thread post. The guest did nothing: this can only arrive live.
    await host.getByLabel('Message de table').fill('MJ ouvre le fil jouable.');
    await host.getByRole('button', { name: 'Publier' }).click();
    await expect(guest.getByText('MJ ouvre le fil jouable.').first()).toBeVisible();
    await expect(guest.getByText('MJ E2E').first()).toBeVisible();

    // A player dice roll stays attached to the post and also propagates live.
    await guest.getByLabel('Message de table').fill('Je force la serrure.');
    await guest.getByRole('button', { name: 'Jeter D10' }).click();
    await expect(host.getByText(/Je force la serrure\..*succes/).first()).toBeVisible();

    // A GM decision created from the thread is visible to the other client and survives reload.
    await host.getByLabel('Message de table').fill('Valider le bruit de la serrure');
    await host.getByRole('button', { name: 'Décision MJ' }).click();
    await expect(guest.getByText('Valider le bruit de la serrure').first()).toBeVisible();
    await guest.reload();
    await expect(guest.getByText('MJ ouvre le fil jouable.').first()).toBeVisible();
    await expect(guest.getByText('Valider le bruit de la serrure').first()).toBeVisible();
  } finally {
    await hostContext.close();
    await guestContext.close();
  }
});

function savedCharacterDraftPayload(name: string) {
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
