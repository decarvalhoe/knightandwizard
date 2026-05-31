import { expect, type Page, test, type TestInfo } from '@playwright/test';

import {
  canonicalE2EFixtures,
  formatCanonicalSourceRefs,
  type CanonicalE2EScenario
} from './fixtures/canonical';

const e2eApiBaseUrl =
  process.env.E2E_API_URL ?? `http://127.0.0.1:${process.env.E2E_API_PORT ?? '3102'}`;

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

  test('application shell applies surface skins and persists Veillée', async ({
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
      ['/mj', 'gazette'],
      ['/character', 'armorial'],
      ['/combat', 'registre'],
      ['/session', 'gazette'],
      ['/grimoire', 'grimoire'],
      ['/dice', 'tripot'],
      ['/rules', 'archives'],
      ['/greffe', 'archives'],
      ['/bibliotheque', 'bibliotheque'],
      ['/design-proto', 'moderne']
    ] as const;

    for (const [route, skin] of routeSkins) {
      await page.goto(route);
      await expect(page.locator('html')).toHaveAttribute('data-skin', skin);
    }

    await page.goto('/');
    await page.getByRole('button', { name: 'Passer en mode Veillée' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');

    await page.getByRole('link', { name: /^Combat/ }).click();
    await expect(page.locator('html')).toHaveAttribute('data-skin', 'registre');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  });

  test('mobile shell keeps MVP surfaces inside the viewport', async ({ page }, testInfo) => {
    annotateCanonical(testInfo, 'dashboard');

    await page.setViewportSize({ width: 390, height: 844 });

    // Every MVP surface (#257) must stay inside a 390px-wide phone viewport:
    // the playable table loop (Poste, Session, Cockpit MJ, Combat) alongside the
    // reference/character surfaces. No surface may force horizontal scroll.
    for (const route of [
      '/',
      '/character',
      '/character/create',
      '/session',
      '/mj',
      '/combat',
      '/atouts',
      '/bestiaire',
      '/grimoire',
      '/cartulaire',
      '/greffe'
    ]) {
      await page.goto(route);
      const overflowX = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );

      expect(overflowX, route + ' should not create horizontal scroll').toBeLessThanOrEqual(1);
    }
  });

  test('MVP surfaces never leak internal enum tokens into visible copy', async ({
    page
  }, testInfo) => {
    annotateCanonical(testInfo, 'dashboard');

    // Internal snake_case identifiers (session event types, session modes, the
    // human_gm controller role) must always be humanised before display (#257:
    // "aucun token interne visible hors logs/audit"). snake_case never appears in
    // legitimate French UI copy, so any occurrence in visible text is a leak.
    const forbiddenTokens = [
      'scene_opened',
      'player_action',
      'dice_roll',
      'gm_ruling',
      'gm_decision_requested',
      'gm_decision_resolved',
      'rollback_requested',
      'narrative_time_advanced',
      'combat_ended',
      'spell_cast',
      'spell_dispelled',
      'classic_table',
      'digital_human_gm',
      'digital_llm_gm',
      'digital_auto_gm',
      'multiplayer_no_gm',
      'human_gm'
    ];

    for (const route of ['/', '/session', '/mj', '/combat', '/character']) {
      await page.goto(route);
      // Visible rendered text only (innerText excludes data-* attributes / aria).
      const visibleText = await page.evaluate(() => document.body.innerText);
      const leaked = forbiddenTokens.filter((token) => visibleText.includes(token));

      expect(leaked, route + ' leaks internal tokens: ' + leaked.join(', ')).toEqual([]);
    }
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
    await expect(page.getByText('7 compétences ou spécialisations notées.')).toBeVisible();
    await expect(page.getByText('Cuisine', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Compétence implicite à 0')).toHaveCount(0);
    await expect(page.getByText('Catalogue implicite')).toHaveCount(0);
    await expect(page.getByText('Cuisine corteganne')).toBeVisible();
    await expect(page.getByText('Spécialisation, parent non noté : Cuisine')).toBeVisible();
    await expect(page.getByText('consumable')).toHaveCount(0);
    await expect(page.getByText('Consommable · 0 kg')).toBeVisible();

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
    const rollHistory = page.getByLabel('Historique des jets');
    await expect(page.getByRole('heading', { name: 'Historique des jets' })).toBeVisible();
    await expect(rollHistory.getByText('Échec automatique (attribut 0)')).toBeVisible();
    await expect(rollHistory.getByText('Échec critique · D100 = 73')).toBeVisible();

    await page.getByRole('tab', { name: 'Combat' }).click();
    const combatPanel = page.getByRole('tabpanel', { name: 'Combat' });
    await expect(combatPanel.getByRole('heading', { name: 'Armes équipées' })).toBeVisible();
    await expect(combatPanel.getByText('Bouclier').first()).toBeVisible();

    await page.getByRole('tab', { name: 'Social' }).click();
    await expect(page.getByRole('heading', { name: 'Attributs sociaux' })).toBeVisible();

    await page.getByRole('tab', { name: 'MJ' }).click();
    await expect(page.getByRole('heading', { name: 'Audit complet' })).toBeVisible();

    await page.getByRole('tab', { name: 'Complet' }).click();
    await expect(page.locator('#equipment-picker')).toHaveCount(0);
    await page.locator('#equipment-search').fill('Potion de Soin');
    await page
      .getByLabel('Équipements trouvés')
      .getByRole('button', { name: /Potion de Soin/ })
      .click();
    await expect(
      page.locator('p.kw-sheet__muted').filter({ hasText: /Charge .* kg/ })
    ).toBeVisible();
  });

  test('catalog browsers use searchable results instead of heavy native selects', async ({
    page
  }, testInfo) => {
    annotateCanonical(testInfo, 'dashboard');

    await page.goto('/character');
    await page.getByRole('tab', { name: 'Complet' }).click();
    await expect(page.locator('select')).toHaveCount(0);
    await page.locator('#equipment-search').fill('Potion de Soin');
    await expect(
      page.getByLabel('Équipements trouvés').getByRole('button', { name: /Potion de Soin/ })
    ).toBeVisible();

    await page.goto('/atouts');
    await expect(page.locator('select')).toHaveCount(0);
    await page.locator('#atouts-search').fill('Accoutumance');
    await expect(
      page
        .getByLabel('Atouts filtrés')
        .getByRole('heading', { name: 'Accoutumance à la douleur' })
        .first()
    ).toBeVisible();

    await page.goto('/bestiaire');
    await expect(page.locator('select')).toHaveCount(0);
    await page.locator('#bestiaire-search').fill('Centaure');
    await expect(page.getByRole('button', { name: /Centaure Humanoïdes/ })).toBeVisible();

    await page.goto('/grimoire');
    await expect(page.locator('select')).toHaveCount(0);
    await page.locator('#grimoire-search').fill('Augmentation énergétique');
    await expect(page.getByRole('heading', { name: 'Augmentation énergétique' })).toBeVisible();
    await page.getByRole('button', { name: /Abjuration/ }).click();
    await expect(page.getByText('Grand Grimoire web')).toBeVisible();
  });

  test('character sheet can render an API-backed saved draft', async ({ page }, testInfo) => {
    annotateCanonical(testInfo, 'characterSheet');

    const draftId = 'draft-sheet-api-e2e';
    const saveResponse = await page.request.put(`${e2eApiBaseUrl}/character-drafts/${draftId}`, {
      data: {
        currentStep: 'review',
        payload: {
          attributes: {
            aestheticism: 1,
            charisma: 2,
            dexterity: 3,
            empathy: 2,
            intelligence: 2,
            perception: 2,
            reflexes: 2,
            stamina: 3,
            strength: 3
          },
          background: 'Formee dans une tour frontaliere.',
          classId: 'enchanteur',
          deity: 'Les Trois Flammes',
          equipmentIds: ['epee_batarde', 'bouclier_bois'],
          extraSpellPoints: 1,
          genderId: 'unspecified',
          name: 'Aveline API',
          orientationId: 'magicien',
          psychology: 'calme',
          quote: 'Le mot engage.',
          raceId: 'humain',
          skills: [
            { id: 'arcanologie', points: 4 },
            { id: 'histoire', points: 4 },
            { id: 'arcanologie-des-rituels', parentId: 'arcanologie', points: 2 }
          ],
          spells: [
            { id: 'boule-de-feu', points: 2 },
            { id: 'bouclier', points: 1 }
          ]
        }
      }
    });

    expect(saveResponse.ok()).toBe(true);

    await page.goto(`/character?draftId=${draftId}`);

    await expect(page.locator('html')).toHaveAttribute('data-skin', 'armorial');
    await expect(page.getByRole('heading', { name: 'Aveline API' })).toBeVisible();
    await expect(page.getByText('Brouillon API')).toBeVisible();
    const inventoryRows = page.locator('.kw-sheet__inventory-row');
    await expect(inventoryRows.getByRole('heading', { name: 'Épée bâtarde' })).toBeVisible();
    await expect(inventoryRows.getByRole('heading', { name: 'Bouclier (bois)' })).toBeVisible();
    await expect(page.getByText('Niveau 0 · 16 / 20 points')).toBeVisible();
  });

  test('session identity survives reload and opens the persisted current character', async ({
    page
  }, testInfo) => {
    annotateCanonical(testInfo, 'sessionManager');

    const suffix = Date.now().toString();
    const draftId = `identity-character-${suffix}`;
    const slug = `identity-session-${suffix}`;
    const saveResponse = await page.request.put(`${e2eApiBaseUrl}/character-drafts/${draftId}`, {
      data: savedCharacterDraftPayload('Aveline Identite')
    });
    const finalizeResponse = await page.request.post(`${e2eApiBaseUrl}/characters/finalize`, {
      data: { draftId }
    });

    expect(saveResponse.ok()).toBe(true);
    expect(finalizeResponse.ok()).toBe(true);

    await page.goto(
      `/session?slug=${slug}&player=player-aveline&name=Aveline%20Identite&role=player&characterId=${draftId}`
    );
    await expect(page.getByTestId('session-current-identity')).toContainText('Aveline Identite');
    await expect(page.getByTestId('session-current-identity')).toContainText(draftId);
    await expect(page.getByText('Aveline Identite', { exact: true })).toBeVisible();

    await page.reload();
    await expect(page.getByTestId('session-current-identity')).toContainText('Aveline Identite');
    await expect(page.getByTestId('session-current-identity')).toContainText(draftId);

    await page.goto(`/character?characterId=${draftId}`);
    await expect(page.getByRole('heading', { name: 'Aveline Identite' })).toBeVisible();
    await expect(page.getByText('Personnage API')).toBeVisible();
  });

  test('GM cockpit coordinates scene, queue, combat access and closing actions', async ({
    page
  }, testInfo) => {
    annotateCanonical(testInfo, 'sessionManager');

    const suffix = Date.now().toString();
    const draftId = `gm-cockpit-character-${suffix}`;
    const slug = `gm-cockpit-${suffix}`;
    const saveResponse = await page.request.put(`${e2eApiBaseUrl}/character-drafts/${draftId}`, {
      data: savedCharacterDraftPayload('Aveline Cockpit')
    });
    const finalizeResponse = await page.request.post(`${e2eApiBaseUrl}/characters/finalize`, {
      data: { draftId }
    });
    const sessionResponse = await page.request.post(`${e2eApiBaseUrl}/sessions`, {
      data: {
        metadata: {
          players: [{ connected: true, id: 'gm', name: 'MJ', role: 'human_gm' }],
          scenes: [
            {
              description: 'La serrure resiste et la brume monte.',
              id: 'north-gate',
              location: 'Brumeval',
              status: 'active',
              title: 'Porte nord'
            }
          ]
        },
        mode: 'digital_human_gm',
        slug,
        status: 'active',
        title: 'Table Cockpit'
      }
    });
    const joinResponse = await page.request.post(`${e2eApiBaseUrl}/sessions/${slug}/players`, {
      data: {
        characterId: draftId,
        name: 'Aveline Cockpit',
        playerId: 'player-aveline',
        role: 'player'
      }
    });
    const decisionResponse = await page.request.post(
      `${e2eApiBaseUrl}/sessions/${slug}/decisions`,
      {
        data: {
          assignedTo: 'human_gm',
          priority: 'high',
          requestedBy: 'player-aveline',
          title: 'Valider le bruit de la serrure'
        }
      }
    );

    expect(saveResponse.ok()).toBe(true);
    expect(finalizeResponse.ok()).toBe(true);
    expect(sessionResponse.ok()).toBe(true);
    expect(joinResponse.ok()).toBe(true);
    expect(decisionResponse.ok()).toBe(true);

    await page.goto(`/mj?slug=${slug}`);

    await expect(page.locator('html')).toHaveAttribute('data-skin', 'gazette');
    await expect(page.getByRole('heading', { name: 'Table Cockpit' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Scène active' })).toBeVisible();
    await expect(page.getByText('Porte nord', { exact: true })).toBeVisible();
    await expect(page.getByText('Brumeval', { exact: true })).toBeVisible();
    await expect(page.getByText('Aveline Cockpit', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Valider le bruit de la serrure').first()).toBeVisible();
    await expect(page.locator('main').getByRole('link', { name: 'Combat' })).toHaveAttribute(
      'href',
      `/combat?slug=${slug}&characterId=${draftId}`
    );
    await expect(page.getByRole('heading', { name: 'Assistant MJ' })).toBeVisible();

    await page.getByLabel('Brief de scène').fill('La brume cache un guetteur pres de la porte.');
    await page.getByRole('button', { name: 'Décrire' }).click();
    const proposalPanel = page.locator('article').filter({
      has: page.getByRole('heading', { name: 'Proposition' })
    });
    await expect(proposalPanel.getByText('Le MJ decrit les details visibles')).toBeVisible();
    await expect(proposalPanel.getByText(/Sources \d+ · Mémoire \d+/)).toBeVisible();

    await page.getByLabel('Point de quête').check();
    await page.getByRole('button', { name: 'Attribuer 1 XP' }).click();
    await expect(page.getByText('XP attribue a Aveline Cockpit + 1 point de quête')).toBeVisible();

    await page.goto(`/character?characterId=${draftId}`);
    await expect(page.getByRole('heading', { name: 'Aveline Cockpit' })).toBeVisible();
    await expect(page.getByText('XP 1 / 1')).toBeVisible();
    await expect(page.getByText('Quête 1')).toBeVisible();
    await page.getByRole('button', { name: 'Convertir la quête' }).click();
    await expect(page.getByText('XP 2 / 2')).toBeVisible();
    await expect(page.getByText('Quête 1')).toHaveCount(0);

    await page.goto(`/mj?slug=${slug}`);
    await expect(page.getByLabel('Gabarit PNJ')).toBeVisible();
    await page.getByLabel('Minute').fill('Reclasser Aveline');
    await page.getByLabel('Type').selectOption('class_reclassification');
    await expect(page.getByLabel('Classe demandée')).toBeVisible();
    await page.getByLabel('Identifiant').fill(draftId);
    await page.getByLabel('Classe demandée').fill('duelliste');
    await page.getByLabel('Résumé').fill('Reclassement valide apres duel judiciaire.');
    await page.getByRole('button', { name: 'Inscrire' }).click();
    await expect(page.getByText('Reclasser Aveline').first()).toBeVisible();
    await page.getByRole('button', { name: 'Approuver' }).first().click();

    await page.goto(`/character?characterId=${draftId}`);
    await expect(page.getByText('Humain · Guerrier · Duelliste')).toBeVisible();

    await page.goto(`/mj?slug=${slug}`);
    await expect(page.getByLabel('Gabarit PNJ')).toBeVisible();
    await page.getByLabel('Gabarit PNJ').selectOption('squelette');
    await page.getByRole('button', { name: 'PNJ bestiaire' }).click();
    await expect(page.getByText('Squelette ajoute au suivi MJ depuis le bestiaire')).toBeVisible();

    await page.getByRole('button', { name: 'Fin de session' }).click();
    await expect(page.getByText('Fin de session marquee par le MJ')).toBeVisible();
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

    await openCreationStep(page, 'Compétences');
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

    await openCreationStep(page, 'Compétences');
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

  test('session combat starts from a persisted character and syncs vitality to the sheet', async ({
    page
  }, testInfo) => {
    annotateCanonical(testInfo, 'combatTracker');

    const suffix = Date.now().toString();
    const draftId = `combat-character-${suffix}`;
    const slug = `combat-session-${suffix}`;
    const saveResponse = await page.request.put(`${e2eApiBaseUrl}/character-drafts/${draftId}`, {
      data: savedCharacterDraftPayload('Aveline Combattante')
    });
    const finalizeResponse = await page.request.post(`${e2eApiBaseUrl}/characters/finalize`, {
      data: { draftId }
    });

    expect(saveResponse.ok()).toBe(true);
    expect(finalizeResponse.ok()).toBe(true);

    await page.goto(
      `/session?slug=${slug}&player=player-aveline&name=Aveline%20Combattante&role=player&characterId=${draftId}`
    );
    await page.getByRole('link', { name: 'Ouvrir combat' }).click();

    await expect(page.locator('html')).toHaveAttribute('data-skin', 'registre');
    await expect(page.getByRole('heading', { name: 'Aveline Combattante' })).toBeVisible();
    await expect(page.getByText('Épée bâtarde').first()).toBeVisible();
    await page.waitForLoadState('networkidle');

    const journalWrite = page.waitForResponse(
      (response) =>
        response.url().includes(`/sessions/${slug}/events`) &&
        response.request().method() === 'POST'
    );
    const sheetSync = page.waitForResponse(
      (response) =>
        response.url().includes(`/characters/${draftId}/combat-state`) &&
        response.request().method() === 'PATCH'
    );
    await page.getByLabel('Cible vitalité').selectOption(draftId);
    await page.locator('.kw-combat__small-buttons button').first().click();
    await journalWrite;
    await sheetSync;

    await expect(
      page.getByRole('progressbar', { name: 'Vitalité Aveline Combattante' })
    ).toHaveAttribute('aria-valuenow', '17');

    await page.reload();
    await expect(
      page.getByRole('progressbar', { name: 'Vitalité Aveline Combattante' })
    ).toHaveAttribute('aria-valuenow', '17');

    await page.goto(`/character?characterId=${draftId}`);
    await expect(page.getByRole('heading', { name: 'Aveline Combattante' })).toBeVisible();
    await expect(page.getByRole('progressbar', { name: 'Vitalité' })).toHaveAttribute(
      'aria-valuenow',
      '17'
    );
  });

  test('session manager records events, GM decisions and rollback requests', async ({
    page
  }, testInfo) => {
    annotateCanonical(testInfo, 'sessionManager');

    const slug = `session-flow-${Date.now()}`;

    await page.goto(`/session?slug=${slug}`);

    await expect(page.getByRole('heading', { name: /Session Flow/ })).toBeVisible();
    await expect(page.getByText('Décisions MJ')).toBeVisible();

    await page.getByLabel('Message de table').fill('Aveline precise son intention.');
    await page.getByRole('button', { name: 'Publier' }).click();
    await expect(page.getByText('Aveline precise son intention.').first()).toBeVisible();

    await page.getByLabel('Message de table').fill('Aveline tente un jet.');
    await page.getByRole('button', { name: 'Jeter D10' }).click();
    // Le de est resolu cote serveur (rng reel) : on verifie qu'un jet est journalise,
    // pas un resultat aleatoire exact.
    await expect(page.getByText(/Jet de d/).first()).toBeVisible();

    await page.getByLabel('Message de table').fill('Valider la consequence narrative');
    await page.getByRole('button', { name: 'Décision MJ' }).click();
    await expect(page.getByText('Valider la consequence narrative').first()).toBeVisible();

    await page.getByLabel('Approuver').click();
    await expect(page.getByText(/Décision MJ résolue/).first()).toBeVisible();

    await page.getByRole('button', { name: 'Renvoi' }).click();
    await expect(page.getByText(/Renvoi demandé/).first()).toBeVisible();
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
