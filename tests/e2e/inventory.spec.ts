import { expect, test } from '@playwright/test';
import { canonicalE2EFixtures, formatCanonicalSourceRefs } from './fixtures/canonical';

const apiBaseUrl =
  process.env.E2E_API_URL ?? `http://127.0.0.1:${process.env.E2E_API_PORT ?? '3102'}`;

test('inventory saves canonical additions/removals, retries failure and survives reload', async ({
  page
}, testInfo) => {
  testInfo.annotations.push({
    type: 'canonical-sources',
    description: formatCanonicalSourceRefs(canonicalE2EFixtures.scenarios.inventory.sourceRefs)
  });
  const draftId = `inventory-e2e-${Date.now()}`;
  expect(
    (
      await page.request.put(`${apiBaseUrl}/character-drafts/${draftId}`, {
        data: canonicalE2EFixtures.inventoryDraft
      })
    ).ok()
  ).toBe(true);
  expect(
    (await page.request.post(`${apiBaseUrl}/characters/finalize`, { data: { draftId } })).ok()
  ).toBe(true);
  await page.goto(`/character?characterId=${draftId}`);
  const potionRow = page
    .locator('.kw-sheet__inventory-row')
    .filter({ has: page.getByRole('heading', { name: 'Potion de Soin' }) });
  await expect(potionRow).toHaveCount(0);
  await page.locator('#equipment-search').fill('Potion de Soin');
  let fail = true;
  await page.route(`**/characters/${draftId}/equipment`, async (route) => {
    if (route.request().method() !== 'PUT' || !fail) return route.continue();
    fail = false;
    await route.fulfill({
      status: 503,
      body: '{}',
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' }
    });
  });
  await page
    .getByLabel('Équipements trouvés')
    .getByRole('button', { name: /Potion de Soin/ })
    .click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('API HTTP 503');
  await expect(potionRow).toHaveCount(0);
  await page.getByRole('button', { name: 'Réessayer l’enregistrement' }).click();
  await expect(page.getByRole('status')).toHaveText('Inventaire enregistré');
  await expect(potionRow).toContainText('x1');
  await page.reload();
  await expect(potionRow).toContainText('x1');
  await page.locator('#equipment-search').fill('Potion de Soin');
  await page
    .getByLabel('Équipements trouvés')
    .getByRole('button', { name: /Potion de Soin/ })
    .click();
  await expect(potionRow).toContainText('x2');
  await page.reload();
  await expect(potionRow).toContainText('x2');
  await potionRow.getByRole('button', { name: 'Retirer Potion de Soin' }).click();
  await expect(potionRow).toContainText('x1');
  await potionRow.getByRole('button', { name: 'Retirer Potion de Soin' }).click();
  await expect(potionRow).toHaveCount(0);
  await page.reload();
  await expect(potionRow).toHaveCount(0);
  const persisted = await page.request.get(`${apiBaseUrl}/characters/${draftId}`);
  expect(persisted.ok()).toBe(true);
  expect((await persisted.json()).character.equipment).toMatchObject([
    { id: 'epee_batarde', quantity: 1 }
  ]);
});
