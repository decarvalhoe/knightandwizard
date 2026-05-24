import { expect, type Page, test, type TestInfo } from '@playwright/test';

import {
  canonicalE2EFixtures,
  formatCanonicalSourceRefs,
  type CanonicalE2EScenario
} from './fixtures/canonical';

test.describe('K&W player and GM application flows', () => {
  test('dashboard reports the API and links the main work surfaces', async ({ page }, testInfo) => {
    annotateCanonical(testInfo, 'dashboard');

    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Poste de table/ })).toBeVisible();
    await expect(page.getByText('Serveur prêt')).toBeVisible();
    await expect(page.getByRole('link', { name: /Personnage/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Combat/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Session/ })).toBeVisible();
  });

  test('application shell applies surface skins and persists Veillee', async ({
    page
  }, testInfo) => {
    annotateCanonical(testInfo, 'dashboard');

    const serverRenderedCombat = await page.request.get('/combat', {
      headers: { Cookie: 'kw-theme=night' }
    });
    const serverHtml = await serverRenderedCombat.text();
    expect(serverHtml).toContain('data-theme="night"');

    const routeSkins = [
      ['/', 'gazette'],
      ['/character', 'armorial'],
      ['/combat', 'registre'],
      ['/session', 'gazette'],
      ['/grimoire', 'grimoire'],
      ['/dice', 'tripot'],
      ['/rules', 'archives'],
      ['/bibliotheque', 'bibliotheque'],
      ['/design-proto', 'moderne']
    ] as const;

    for (const [route, skin] of routeSkins) {
      await page.goto(route);
      await expect(page.locator('html')).toHaveAttribute('data-skin', skin);
    }

    await page.goto('/');
    await page.getByRole('button', { name: 'Passer en mode Veillee' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');

    await page.getByRole('link', { name: /^Combat/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-skin', 'registre');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  });

  test('character sheet exposes canonical attributes, nested skills and level budget', async ({
    page
  }, testInfo) => {
    annotateCanonical(testInfo, 'characterSheet');

    await page.goto('/character');

    await expect(page.locator('html')).toHaveAttribute('data-skin', 'armorial');
    await expect(page.getByRole('tablist', { name: 'Modes fiche' })).toBeVisible();
    await expect(page.getByRole('progressbar', { name: 'Vitalité' })).toBeVisible();
    await expect(page.getByRole('progressbar', { name: 'Énergie' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Fiche active' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '9 aptitudes' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Compétences' })).toBeVisible();
    await expect(page.getByText('Niveau 1 · 24 / 40 points')).toBeVisible();
    await expect(page.getByText('Cuisine', { exact: true })).toBeVisible();
    await expect(page.getByText('Compétence implicite à 0').first()).toBeVisible();
    await expect(page.getByText('Cuisine corteganne')).toBeVisible();
    await expect(page.getByText(/Catalogue implicite : \d+ entrées, 7 notées/)).toBeVisible();

    await page.getByRole('button', { name: /Esthétisme/ }).click();
    await expect(page.getByTestId('last-roll-forced-failure')).toHaveText(
      'Échec automatique (attribut 0)'
    );

    await page.evaluate(() => {
      const values = [0, 0, 0, 0, 0.72];
      Math.random = () => values.shift() ?? 0.5;
    });
    await page.getByRole('button', { name: /Force/ }).click();
    await expect(page.getByText('Dernier jet')).toBeVisible();
    await expect(page.getByTestId('last-roll-critical-failure')).toHaveText(
      'Échec critique · D100 = 73'
    );

    await page.getByRole('tab', { name: 'Combat' }).click();
    const combatPanel = page.getByRole('tabpanel', { name: 'Combat' });
    await expect(combatPanel.getByRole('heading', { name: 'Armes équipées' })).toBeVisible();
    await expect(combatPanel.getByText('Bouclier').first()).toBeVisible();

    await page.getByRole('tab', { name: 'Social' }).click();
    await expect(page.getByRole('heading', { name: 'Attributs sociaux' })).toBeVisible();

    await page.getByRole('tab', { name: 'MJ' }).click();
    await expect(page.getByRole('heading', { name: 'Audit complet' })).toBeVisible();

    await page.getByRole('tab', { name: 'Complet' }).click();
    const equipmentPicker = page.locator('#equipment-picker');
    await expect(equipmentPicker).toBeVisible();
    expect(await equipmentPicker.locator('option').count()).toBeGreaterThan(0);
    await equipmentPicker.selectOption({ index: 0 });
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(
      page.locator('p.kw-sheet__muted').filter({ hasText: /Charge .* kg/ })
    ).toBeVisible();
  });

  test('character creation validates fighter and magician creation budgets', async ({
    page
  }, testInfo) => {
    annotateCanonical(testInfo, 'characterCreation');

    await page.goto('/character/create');

    await expect(page.getByRole('heading', { name: 'Ambiguïtés catalogues' })).toBeVisible();
    await expect(page.getByText('Armes: 8 ambiguïtés')).toBeVisible();
    await expect(page.getByText('Protections: 4 ambiguïtés')).toBeVisible();

    await page.getByLabel('Nom').fill(canonicalE2EFixtures.actors.avelineDraftName);
    await openCreationStep(page, 'Aptitudes');
    await increaseStepper(page, 'Force', 4);
    await increaseStepper(page, 'Dextérité', 4);
    await increaseStepper(page, 'Vigueur', 4);
    await increaseStepper(page, 'Intelligence', 4);
    await increaseStepper(page, 'Perception', 4);
    await expect(page.getByText('20/20').first()).toBeVisible();

    await openCreationStep(page, 'Competences');
    await increaseStepper(page, 'Arcanologie', 4);
    await increaseStepper(page, 'Epée bâtarde', 4);
    await increaseStepper(page, 'Chasse', 4);
    await increaseStepper(page, 'Forge', 4);
    await increaseStepper(page, 'Commandement', 4);
    await expect(page.getByText('20/20').first()).toBeVisible();

    await openCreationStep(page, 'Validation');
    await expect(page.getByRole('button', { name: 'Valider le brouillon' })).toBeEnabled();
    await page.getByRole('button', { name: 'Valider le brouillon' }).click();
    await expect(page.getByText(/Brouillon valide · vitalite 20 · energie 0/)).toBeVisible();
    await expect(page.getByText('API synchronisee')).toBeVisible();

    await page.getByRole('button', { name: /Reset/ }).click();
    await page.getByLabel('Nom').fill(canonicalE2EFixtures.actors.magicianDraftName);
    await openCreationStep(page, 'Voie');
    await page.getByRole('button', { name: /Magicien/ }).click();
    await openCreationStep(page, 'Sorts');
    await increaseStepper(page, 'Points de sort supplementaires', 2);
    await increaseStepper(page, 'Boule de feu', 2);
    await increaseStepper(page, 'Bouclier', 2);
    await expect(page.getByText('4/4').first()).toBeVisible();

    await openCreationStep(page, 'Competences');
    await expect(page.getByText('0/0').first()).toBeVisible();
    await expect(page.getByText('Convertis')).toBeVisible();
  });

  test('combat tracker resolves DT actions and roster changes', async ({ page }, testInfo) => {
    annotateCanonical(testInfo, 'combatTracker');

    await page.goto('/combat');

    await expect(page.locator('html')).toHaveAttribute('data-skin', 'registre');
    await expect(page.getByRole('heading', { name: 'Tracker DT' })).toBeVisible();
    await expect(page.getByText(/Round 1 · DT 1 · prochain Aveline/)).toBeVisible();
    await expect(page.getByRole('progressbar', { name: 'Vitalité Aveline' })).toBeVisible();
    await expect(page.getByText('Coût DT 5').first()).toBeVisible();

    await page.getByTitle('Attaque').click();
    await page.getByRole('button', { name: /Résoudre/ }).click();
    await expect(page.getByText(/Aveline (touche|rate) Brigand/)).toBeVisible();
    await expect(page.getByText(/coût DT 5 -> prochain DT 11/)).toBeVisible();
    await expect(page.getByText(/Attaque D10:/)).toBeVisible();

    await page.getByRole('button', { name: /Ajouter/ }).click();
    await expect(page.getByRole('heading', { name: 'Squelette' }).first()).toBeVisible();
  });

  test('session manager records events, GM decisions and rollback requests', async ({
    page
  }, testInfo) => {
    annotateCanonical(testInfo, 'sessionManager');

    await page.goto('/session');

    await expect(page.getByRole('heading', { name: 'Brumeval' })).toBeVisible();
    await expect(page.getByText('Decisions MJ')).toBeVisible();

    await page.getByRole('button', { name: 'RP' }).click();
    await expect(page.getByText('Aveline precise son intention.')).toBeVisible();

    await page.getByRole('button', { name: 'D10' }).click();
    await expect(page.getByText('2 succes').first()).toBeVisible();

    await page.getByRole('button', { name: 'MJ' }).click();
    await expect(page.getByText('Valider la consequence narrative').first()).toBeVisible();

    await page.getByLabel('Approuver').click();
    await expect(page.getByText(/Decision MJ resolue/).first()).toBeVisible();

    await page.getByRole('button', { name: 'Rollback' }).click();
    await expect(page.getByText(/Rollback demande/).first()).toBeVisible();
  });
});

function annotateCanonical(testInfo: TestInfo, scenario: CanonicalE2EScenario): void {
  const fixture = canonicalE2EFixtures.scenarios[scenario];

  testInfo.annotations.push({
    description: formatCanonicalSourceRefs(fixture.sourceRefs),
    type: 'canonical-sources'
  });
}

async function openCreationStep(page: Page, stepName: string): Promise<void> {
  await page.getByRole('button', { name: new RegExp(stepName) }).click();
}

async function increaseStepper(page: Page, label: string, times: number): Promise<void> {
  for (let index = 0; index < times; index += 1) {
    await page.getByTitle(`Augmenter ${label}`, { exact: true }).click();
  }
}
