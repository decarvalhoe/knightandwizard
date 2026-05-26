import { expect, test } from '@playwright/test';

/**
 * End-to-end proof of "jeu en reseau" (E-C journal -> E-N broadcast -> E-S feed).
 *
 * Two independent browser contexts join the same session room. An action committed
 * by one player must appear on the other player's screen with no reload and no action
 * on their side: the only path for that text to reach them is the live WebSocket feed.
 */
test('two networked players see each other journal actions live', async ({ browser }) => {
  const slug = `e2e-net-${Date.now()}`;
  const url = `/session?slug=${slug}`;

  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();

  try {
    // Host creates + loads the room first, so the guest joins an existing session.
    const host = await hostContext.newPage();
    await host.goto(url);
    await expect(host.getByRole('button', { name: 'RP' })).toBeVisible();

    // Guest joins; wait until its live feed is actually connected before acting,
    // otherwise a broadcast could fire before the guest is subscribed.
    const guest = await guestContext.newPage();
    await guest.goto(url);
    await expect(guest.getByTestId('session-live-status')).toContainText('En direct');

    // Host plays a role-play beat. The guest did nothing: this can only arrive live.
    await host.getByRole('button', { name: 'RP' }).click();
    await expect(guest.getByText('Aveline precise son intention.')).toBeVisible();

    // A server-resolved dice roll from the host also propagates live to the guest.
    await host.getByRole('button', { name: 'D10' }).click();
    await expect(guest.getByText(/Jet de d/).first()).toBeVisible();
  } finally {
    await hostContext.close();
    await guestContext.close();
  }
});
