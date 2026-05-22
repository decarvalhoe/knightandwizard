# Brief Claude Design — Challenger la DA frontend de Knight & Wizard

> But : donner à **Claude Design** (claude.ai → onglet Design, Anthropic Labs, Opus 4.7) **tous les éléments** pour produire des **propositions alternatives** de direction artistique / UI K&W, afin de **challenger** les fondations actuelles (cf. [`FRONTEND-FOUNDATIONS.md`](./FRONTEND-FOUNDATIONS.md)) sur une base de comparaison objective.
>
> Claude Design lit : **repo GitHub + fichiers Figma + tokens/variables + assets (fonts/logos)** → bâtit un design system → génère des écrans **HTML interactifs** → export / **handoff bundle vers Claude Code**. Statut : research preview (Pro/Max/Team/Enterprise).

---

## 0. TL;DR de la démarche

1. **Rendre les éléments accessibles** : pousser la branche frontend sur GitHub + publier la library Figma (§1).
2. **Onboarder le design system** dans Claude Design : connecter le repo + le fichier Figma + les assets (§2).
3. **Coller le brief produit** (§3) puis lancer les **prompts de challenge** (§4).
4. **Comparer** les propositions avec la grille (§5).
5. **Réintégrer** la direction gagnante dans `packages/tokens` + Figma, regénérer, valider (§6).

---

## 1. Prérequis — ce que l'outil doit pouvoir lire

| Élément | État | Action requise |
|---|---|---|
| **Repo GitHub** `decarvalhoe/knightandwizard` | branche `feat/frontend-foundations` **non poussée** | **Pousser la branche** (ou merger sur `dev`) pour exposer `packages/tokens`, `tokens.resolved.json`, `apps/game/src/app/{globals,tokens.generated}.css`, et les surfaces `apps/game/src/features/*`. → me dire « push + PR ». |
| **Fichier Figma** `Knight & Wizard — Design System` | créé, 80 variables (Light/Night) + foundations | **Publier la library** (Assets → Publish) puis fournir l'URL `https://www.figma.com/design/d6rwR90ptCWCcrOZFhBZ3n` à Claude Design. |
| **Fonts** | Inter (en place) ; serif display = **question DA ouverte** | Optionnel : déposer un dossier de fonts si on veut tester un serif heroïque. |
| **Logo / marque** | à fournir si dispo | Déposer le logo K&W (SVG/PNG) s'il existe. |
| **Abonnement** | — | Compte Pro/Max/Team/Enterprise. |

**Pourquoi pousser le repo :** c'est la source unique des tokens (DTCG → `tokens.generated.css`). Sans accès GitHub, Claude Design ne pourra pas hériter automatiquement de la palette/typo et ne fera que deviner.

---

## 2. Onboarding du design system (dans Claude Design)

1. claude.ai → onglet **Design** → créer/gérer un **design system** « Knight & Wizard ».
2. **Connecter GitHub** → repo `decarvalhoe/knightandwizard`, branche poussée. Pointer notamment :
   - `packages/tokens/tokens.resolved.json` (primitives + sémantique light/night + dimensions + typo, **résolues**),
   - `packages/tokens/src/tokens/*.json` (DTCG source),
   - `apps/game/src/app/tokens.generated.css` (`@theme` Tailwind v4 + `[data-theme='night']`),
   - `apps/game/src/features/*` (surfaces réelles : fiche, combat, session…).
3. **Importer le fichier Figma** (URL ci-dessus) → Claude Design extrait variables, styles, frames Foundations + Code Connect.
4. **Déposer les assets** (logo, fonts) + **style notes** (copier le §3 ci-dessous).
5. Vérifier que le système détecté reflète bien la palette (ink/paper/vellum/forest/wine/gold) et les deux modes.

---

## 3. Brief produit K&W — bloc à coller (contexte)

> Copier-coller tel quel dans Claude Design comme contexte/style notes.

**Produit.** Knight & Wizard (K&W) est un **jeu de rôle papier** (univers fantasy) et son **adaptation numérique « tabletop-first »** : on outille une vraie partie autour de la table (un **Meneur de Jeu** + des **joueurs**), on ne fait **pas** un CRPG/jeu vidéo. L'app assiste fiches de personnage, création, combat, et conduite de session.

**Public & ton.** Rôlistes (joueurs + MJ), à l'aise avec de la densité de règles. Ambiance recherchée : **fantasy artisanale, « parchemin »**, sérieuse et chaleureuse, **lisible en conditions de table** (longues sessions, parfois tablette posée).

**DA actuelle = la BASELINE à challenger.**
- Palette : encre `#151619`, parchemin `#f6f2ea`, vélin `#e8dfd1`, forêt `#22473b`, vin `#7a2638`, or `#c79b4b` ; rampe neutre chaude ; fonctionnels success/warning/danger/info.
- Tokens **sémantiques** : `canvas/surface/raised/inset`, `fg/-muted/-subtle/-inverse/on-accent`, `border/-strong/-subtle`, accents `forest/wine/gold`, feedback. **2 modes Light + Night**.
- Typo : **Inter** (pas encore de serif display — point ouvert). Échelle xs→5xl, 4 graisses. Spacing 4→64, radius none→full.

**Surfaces & flux (réels).**
- **Dashboard** « Poste de table » : santé serveur + liens Personnage / Combat / Session.
- **Fiche de personnage** (issue #52) : aptitudes (9), compétences imbriquées + spécialisations, budget de niveau, **jets de dés**, onglets Combat / Social / MJ, inventaire lié aux **catalogues d'équipement**.
- **Création de personnage** : budgets aptitudes/compétences, **Voie** (Guerrier/Magicien), sorts (magiciens : conversion 10 pts compétence → +1 pt de sort).
- **Combat tracker** : « Tracker DT », rounds, résolution d'attaque (touche/rate), gestion du roster.
- **Session MJ** : journal d'événements, **décisions MJ** (approuver/rejeter), **rollback** par rejeu d'événements.
- **Browsers de catalogues** (races, compétences, sorts, bestiaire, atouts) ; **boucle CMS↔catalogues** (#56).
- **MJ augmenté LLM** (#58-60) : assistant MJ, **RAG cité**, mémoire épisodique.

**Mécanique de dés (à mettre en valeur visuellement).** Pool de **D10** : on compte des **succès** ; **réussite/échec critique** ; un **D100 de sévérité** s'affiche sur l'échec critique. **Attribut 0 = échec automatique** (0 succès, pas de D100).

**Contraintes DURES (non négociables).**
- **Accessibilité WCAG 2.2 AA** (contraste, focus visible, cibles tactiles), **Light + Night** obligatoires.
- **Lisibilité table** : hiérarchie claire, densité maîtrisée, pas d'esbroufe illisible.
- **Responsive** desktop + tablette.
- **i18n FR** (langue produit = français).
- Le **LLM ne calcule jamais** dés/dégâts/DT/niveaux : il appelle des outils typés (UI n'invente pas de chiffres).
- **Canonical-first côté contenu** : pas de dépendance à des données inventées ; les catalogues sont des contrats.
- Idéalement **réutiliser les tokens existants** ; si une direction propose une autre palette/typo, elle doit rester **systémique** (primitives → sémantique → 2 modes), pas du one-off.

**Ce qui est OUVERT au challenge (axes de divergence souhaités).**
- Registre visuel : « parchemin » vs autre registre fantasy (grimoire sombre, héraldique, minimal-runique, etc.).
- **Système typographique** : faut-il un **serif/display heroïque** pour les titres ? lequel ?
- **Densité & « juice »** : sobre/dense (façon feuille de perso pro) vs animé/tactile.
- Formes de composants (cartes, encadrés, bordures, coins), **iconographie**.
- **Traitement des jets de dés** (le moment fort) : comment afficher pool/succès/critique/D100 ?
- Layout **fiche** et **combat tracker** (le plus dense).
- **Light-first vs dark-first**.

---

## 4. Prompts de challenge (prêts à coller)

**Prompt A — 3 directions alternatives sur la Fiche de personnage**
> En t'appuyant sur mon design system (repo + Figma) et le brief K&W, propose **3 directions visuelles ALTERNATIVES** pour l'écran **Fiche de personnage** qui **divergent délibérément** de la baseline « parchemin/Inter » sur : registre visuel, système typographique, densité & juice, traitement des **jets de dés D10 (succès, critique, D100 de sévérité)**. Pour CHAQUE direction : un **nom**, l'**intention** (1 phrase), **palette** (primitives + sémantique light/night), **typo**, **formes de composants**, le **traitement du jet de dés**, et un **écran HTML interactif** complet (états Light + Night). Respecte les contraintes dures (WCAG 2.2 AA, 2 modes, lisibilité table, FR). Garde une logique systémique (primitives→sémantique→modes).

**Prompt B — décliner la direction retenue**
> Décline la direction « [NOM] » sur **Combat tracker (Tracker DT)** et **Session MJ** (journal + décisions MJ + rollback). Montre la densité réelle (roster, rounds, résolution touche/rate ; flux d'événements). Light + Night.

**Prompt C — référence concurrentielle (web capture)**
> Capture l'UI de [Foundry VTT / Demiplane / Roll20] et propose comment K&W peut **se différencier** tout en gardant nos contraintes — ce qu'on reprend, ce qu'on évite.

**Prompt D — handoff**
> Prépare un **handoff bundle** pour Claude Code de la direction retenue (écrans + tokens proposés) ; je le réintégrerai dans `packages/tokens` + Figma (source unique).

---

## 5. Grille de comparaison (juger objectivement vs la baseline)

Scorer chaque proposition **0–5** (pondération entre crochets) :

| Critère | Poids |
|---|---|
| Identité / mémorabilité fantasy K&W | ×3 |
| **Lisibilité en conditions de table** (hiérarchie, densité) | ×3 |
| **Accessibilité** (contraste AA, focus, cibles) Light **et** Night | ×3 |
| Mise en valeur du **jet de dés** (succès/critique/D100) | ×2 |
| Cohérence **systémique** (primitives→sémantique→2 modes) | ×2 |
| **Faisabilité** Tailwind v4 / Next 15 / packages/ui | ×2 |
| Différenciation vs VTT existants | ×1 |
| « Juice » / plaisir d'usage sans nuire à la lecture | ×1 |

> Comparer chaque proposition **à la baseline actuelle** (capture des frames Foundations + des surfaces `apps/game`). Retenir 1 direction (ou un hybride d'axes).

---

## 6. Boucle de réintégration (le challenge doit nourrir les fondations)

1. Récupérer le **handoff bundle** (Prompt D).
2. Traduire la palette/typo gagnante en **tokens DTCG** dans `packages/tokens/src/tokens/*.json` (modes light/night).
3. `pnpm tokens:build` → regénère `tokens.generated.css` + `tokens.resolved.json` + exports.
4. Mettre à jour les **Figma Variables** (miroir) pour rester aligné.
5. Gates : `pnpm format:check && pnpm lint && pnpm typecheck && pnpm build:game`.
6. Consigner la décision dans `FRONTEND-FOUNDATIONS.md` (§10 registre de décisions).

---

## 7. Limites & garde-fous

- **Research preview** : features frontières (3D/voix/motion) encore rugueuses ; consomme du quota.
- **Prompts spécifiques** = résultats nettement meilleurs (audience, but, style explicites).
- **Pas un gestionnaire de DS pixel-perfect** : Claude Design **propose** ; la **source de vérité reste `packages/tokens` + Figma**. Toute direction adoptée repasse par la boucle §6 (anti-drift).
- Vérifier l'accès **Figma** de Claude Design (sinon, exporter les frames Foundations en images + fournir `tokens.resolved.json`).

---

_Références : [Anthropic — Introducing Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs) · [Plugin Figma — Claude](https://claude.com/plugins/figma) · [Guide buildfastwithai](https://www.buildfastwithai.com/blogs/claude-design-anthropic-guide-2026) · [The New Stack](https://thenewstack.io/anthropic-claude-design-launch/)._
