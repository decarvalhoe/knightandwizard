import { expect, type Page, test } from '@playwright/test';

test.describe('K&W player and GM application flows', () => {
  test('dashboard reports the API and links the main work surfaces', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Poste de table/ })).toBeVisible();
    await expect(page.getByText('Serveur prêt')).toBeVisible();
    await expect(page.getByRole('link', { name: /Personnage/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Combat/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Session/ })).toBeVisible();
  });

  test('character sheet exposes canonical attributes, nested skills and level budget', async ({
    page
  }) => {
    await page.goto('/character');

    await expect(page.getByRole('heading', { name: 'Fiche active' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '9 aptitudes' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Compétences' })).toBeVisible();
    await expect(page.getByText('Niveau 1 · 24 / 40 points')).toBeVisible();
    await expect(page.getByText('Cuisine', { exact: true })).toBeVisible();
    await expect(page.getByText('Compétence implicite à 0').first()).toBeVisible();
    await expect(page.getByText('Cuisine corteganne')).toBeVisible();
    await expect(page.getByText(/Catalogue implicite : 12 entrées, 8 notées/)).toBeVisible();

    await page.getByRole('button', { name: /Force/ }).click();
    await expect(page.getByText('Dernier jet')).toBeVisible();

    await page.getByRole('button', { name: 'Combat' }).click();
    await expect(page.getByRole('heading', { name: 'Armes équipées' })).toBeVisible();
    await expect(page.getByText('Garde mystique').first()).toBeVisible();

    await page.getByRole('button', { name: 'Social' }).click();
    await expect(page.getByRole('heading', { name: 'Attributs sociaux' })).toBeVisible();

    await page.getByRole('button', { name: 'MJ' }).click();
    await expect(page.getByRole('heading', { name: 'Audit complet' })).toBeVisible();

    await page.getByRole('button', { name: 'Complet' }).click();
    await page.getByRole('button', { name: /Torche/ }).click();
    await expect(page.getByText('gear · 0.4 kg')).toBeVisible();
  });

  test('character creation validates fighter and magician creation budgets', async ({ page }) => {
    await page.goto('/character/create');

    await page.getByLabel('Nom').fill('E2E Aveline');
    await openCreationStep(page, 'Aptitudes');
    await increaseStepper(page, 'Force', 5);
    await increaseStepper(page, 'Dexterite', 5);
    await increaseStepper(page, 'Vigueur', 5);
    await increaseStepper(page, 'Intelligence', 5);
    await expect(page.getByText('20/20').first()).toBeVisible();

    await openCreationStep(page, 'Competences');
    await increaseStepper(page, 'Art occulte', 4);
    await increaseStepper(page, 'Armes longues', 4);
    await increaseStepper(page, 'Survie', 4);
    await increaseStepper(page, 'Artisanat', 4);
    await increaseStepper(page, 'Commandement', 4);
    await expect(page.getByText('20/20').first()).toBeVisible();

    await openCreationStep(page, 'Validation');
    await expect(page.getByRole('button', { name: 'Valider le brouillon' })).toBeEnabled();
    await page.getByRole('button', { name: 'Valider le brouillon' }).click();
    await expect(page.getByText(/Brouillon valide · vitalite 24 · energie 0/)).toBeVisible();
    await expect(page.getByText('API synchronisee')).toBeVisible();

    await page.getByRole('button', { name: /Reset/ }).click();
    await page.getByLabel('Nom').fill('E2E Magicien');
    await openCreationStep(page, 'Voie');
    await page.getByRole('button', { name: /Magicien/ }).click();
    await openCreationStep(page, 'Sorts');
    await increaseStepper(page, 'Points de sort supplementaires', 2);
    await increaseStepper(page, 'Etincelle', 2);
    await increaseStepper(page, 'Garde mystique', 2);
    await expect(page.getByText('4/4').first()).toBeVisible();

    await openCreationStep(page, 'Competences');
    await expect(page.getByText('0/0').first()).toBeVisible();
    await expect(page.getByText('Convertis')).toBeVisible();
  });

  test('combat tracker resolves DT actions and roster changes', async ({ page }) => {
    await page.goto('/combat');

    await expect(page.getByRole('heading', { name: 'Tracker DT' })).toBeVisible();
    await expect(page.getByText(/Round 1 · DT 1 · prochain Aveline/)).toBeVisible();

    await page.getByTitle('Attaque').click();
    await page.getByRole('button', { name: /Résoudre/ }).click();
    await expect(page.getByText(/Aveline (touche|rate) Brigand/)).toBeVisible();

    await page.getByRole('button', { name: /Ajouter/ }).click();
    await expect(page.getByRole('heading', { name: 'Squelette' }).first()).toBeVisible();
  });

  test('session manager records events, GM decisions and rollback requests', async ({ page }) => {
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

async function openCreationStep(page: Page, stepName: string): Promise<void> {
  await page.getByRole('button', { name: new RegExp(stepName) }).click();
}

async function increaseStepper(page: Page, label: string, times: number): Promise<void> {
  for (let index = 0; index < times; index += 1) {
    await page.getByTitle(`Augmenter ${label}`).click();
  }
}
