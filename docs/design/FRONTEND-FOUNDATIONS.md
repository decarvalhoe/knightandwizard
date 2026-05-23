# Knight & Wizard — Frontend Foundations (DA · Design System · UX)

> **Living runbook.** Updated at **every step** of the démarche (project practice: exhaustive end‑to‑end process documentation).
> **Scope:** FRONTEND / design concern — Direction Artistique, design system, UX flows, tooling pipeline. This is **NOT** the canonical-first rules-canon (no entry here belongs in `docs/canonical/`). The UI must, however, **consume** canonical read-models for *data* (never invent game data).
> **Last updated:** 2026-05-22 · **Branch:** `feat/frontend-foundations`

---

## 0. Purpose & scope
Establish durable, sound foundations (visual identity + design system + UX flows + tooling) **before** building the v0.4+ product surfaces (#52 sheet, #56 CMS loop, #58–60 LLM/RAG/memory), so the frontend rests on a perennial base.

- **Users:** Joueur + MJ · tabletop‑first · **asynchronous** · **French** · often **tablet at the table**.
- **Surfaces (all):** character creation (wizard) · **character sheet (primary)** · combat tracker (DT timeline) · session journal · grimoire/spells · bestiary · equipment · **GM assistant (LLM)**.
- **Stack (verified):** Next.js 15.5 · React 19 · **Tailwind v4.2** (CSS‑first `@theme`, **no JS config**) · pnpm/turbo monorepo (`apps/*`, `packages/*`, existing `rules-core` + `catalogs`) · Fastify API exposing canonical read-models.

## 1. Principles & constraints
**UX (from TTRPG-tools research):**
- "Juice" only on the **dice roll** (anim + son + ~500 ms tension + haptique tablette, désactivable). Everything else calm.
- **Tap‑to‑roll inline** from every skill/attribute row. **No separate dice screen.**
- **Crit lisible:** couleur **+ forme/icône** (colorblind-safe); **toujours le D100 de gravité** sur échec critique; attribut 0 = "échec auto, pas de D100" (la règle enseignée par l'UI).
- **Progressive disclosure** + toggle densité (tablette).
- **Modes Joueur / MJ** distincts; **capture live** dans le journal.
- **MJ/LLM:** chips de citation (source→règle→résultat), override 1‑tap, retrieval partitionné joueur/MJ, le LLM ne calcule jamais (tools rules-core).

**Données canoniques (différenciateur):** l'UI **ne consomme que des read-models validés** (Zod `.parse()` à la frontière), affiche la **provenance** (`<SourceCitation>`), et rend **« donnée non disponible »** (`<DataUnavailable>`) au lieu d'inventer. Interdire l'import de `sample.ts`/fixtures (lint).

**a11y:** WCAG 2.2 AA · patterns APG (grid/listbox/dialog) pour fiche/combat/dés · `aria-live` pour les jets (D100 critique annoncé) · contraste parchemin audité · `prefers-reduced-motion`.

**i18n:** next-intl, FR défaut; **termes canoniques dans la data**, on ne traduit que le chrome.

## 2. Toolchain & pipeline
```
Figma (source design : foundations + composants + modes light/night)
   ⇅  tokens DTCG / Code Connect
Repo : packages/tokens (→ Tailwind v4 @theme) + packages/ui (Radix + Storybook) + packages/contracts (Zod)
   ↓  Claude Design lit le codebase (packages/ui+tokens) + la lib Figma + web-capture de l'app
Claude Design (Anthropic Labs, Opus 4.7) → génère les écrans des surfaces
   ↓
apps/game (implémentation Next.js)
```
- **Figma** = vérité visuelle (Variables/modes, composants, Code Connect vers `packages/ui`).
- **`packages/*`** = design system code (vérité d'implémentation + **ce que Claude Design lit**).
- **Claude Design** = `claude.ai/design` ; applique le design system en **lisant codebase + fichiers design** ; web-capture ; export HTML/PPTX/PDF/Canva ; research preview (Pro/Max/Team/Enterprise). → on lui fournit un `packages/ui`+tokens propre + la lib Figma.
- **Figma MCP + skills** (`figma-use`, `figma-generate-library`, `figma-code-connect`) pour code↔design.

## 3. Direction Artistique — token system (3-tier, W3C DTCG)
**Existant** (`apps/game/src/app/globals.css`, Tailwind v4 `@theme`, **light-only, primitifs plats**) : `ink #151619` · `paper #f6f2ea` · `vellum #e8dfd1` · `forest #22473b` · `wine #7a2638` · `gold #c79b4b` · police Inter.

**Cible — 3 tiers :**
- **Primitifs** : rampes `parchment-50…900`, `ink-950…`, `forest-*`, `wine-*`, `gold-*` ; spacing base 4px ; radii ; échelle typo ; ombres parchemin douces ; motion (durées/easings).
- **Sémantiques (alias, consommés par les composants)** : `surface`, `surface.raised`, `text.body`, `text.muted`, `border`, `accent`(gold), `success`, `danger`, `crit.success`, `crit.failure` → couche re-pointée pour le **mode nuit/donjon** (dark dès J1).
- **Composant** : overrides locaux si besoin (`dice.crit.fg`).

**Format** : DTCG (`$value`/`$type`, alias `{group.token}`, composites `typography`/`shadow`/`border`). **Modes** : light / night / high-contrast (Figma Variable modes + `[data-theme]`). **Typo** : Inter (corps) + display à caractère pour titres, lisibilité prioritaire.

## 4. Design system architecture
**Figma (multi-fichiers publiés en libraries) :** `00 Foundations` → `01 Core Components` (variants + component properties + slots) → `02 Patterns` → `03 Templates/Playground`.

**Repo (nouveaux packages) :**
- `packages/tokens` — DTCG → **Style Dictionary** → **CSS vars dans `@theme`** (pas de JS config). Drift = échec CI.
- `packages/ui` — composants **Radix re-skinnés tokens** (départ shadcn re-thémé), build tsup ESM+types, **Storybook**.
- `packages/contracts` — schémas **Zod** des read-models partagés API↔UI (`z.infer`).
- **Code Connect** (`*.figma.tsx`) — mappe Figma ↔ `packages/ui`.

## 5. Component inventory
**Atomes/molécules :** Button, IconButton, Input, Select, Textarea, Checkbox/Radio, Tabs, Card/**Panel**, **StatusPill**/Badge, Dialog/Drawer, Tooltip, Table/DataTable, Toggle, Breadcrumb.
**Spécifiques K&W :** **DicePool/DiceRoller**, **AttributeDie** (tap-to-roll + état attribut-0), **StatBlock**, **SkillTree** (imbriqué, spécialisation sans parent), **RuleCitation/SourceCitation**, **DataUnavailable/EmptyState**, **CombatTimeline/Carousel** (DT absolu), **SessionEvent** + **GMDecisionCard** (+ rollback), **SpellCard**, **BestiaryEntry**, **EquipmentRow**, **BudgetMeter**.

## 6. Surfaces & flows
| Surface | Patterns clés | Modes |
|---|---|---|
| Création | wizard guidé, budgets visibles, ambiguïtés explicites, « tout existe à 0 » qui s'allume | Joueur |
| **Fiche (P0)** | tap-to-roll partout, progressive disclosure, densité, onglets Complet/Combat/Social/MJ | Joueur + MJ |
| Combat | timeline DT absolue (Combat Carousel), acteur courant/suivant, init cachée MJ | Joueur + MJ |
| Session | event-log typé/ordonné, **rollback réel**, citations, liens entités | Joueur + MJ |
| Grimoire/Bestiaire/Équipement | browser + filtres + détail dépliable, « ajouter » in-context | Joueur + MJ |
| Assistant MJ | chips citation par ruling, override 1-tap, retrieval partitionné, jamais de calcul LLM | MJ |

## 7. Frontend architecture & quality gates
- **Couches (lint-enforced `eslint-plugin-boundaries`)** : `packages/ui` → domain → `features/*` → `app/*`. RSC par défaut, îlots client minimaux.
- **Données** : `.parse()` Zod à la frontière (`lib/catalogs.ts`) ; cache **taggé** pour catalogues statiques, `no-store` réservé à la session live ; interdire import `sample.ts`.
- **a11y / i18n / CI** : voir §1 ; CI = Storybook + visual regression (Chromatic ou Playwright) + Lighthouse + size-limit + Code Connect, **branché dans `pnpm validate`**.

## 8. Execution plan (bout en bout)
| Phase | Objectif | Artefacts | Acceptance | Statut |
|---|---|---|---|---|
| **F0** Recherche & pack | Best practices Figma/Claude Design/game-UX/frontend + synthèse | ce runbook | recoupé + cité | ✅ fait |
| **F1** DA / tokens | tokens DTCG (primitif→sémantique), light+night → Tailwind v4 `@theme` | `packages/tokens` + `apps/game/src/app/tokens.generated.css` | gates verts + vars CSS émises au build Next | ✅ fait |
| **F2** Figma `00 Foundations` | Variables/modes/type/grille | fichier Figma + Variables (80) + nuanciers/typo/grille | library publiée (manuel) | 🟡 prêt à publier |
| **F3** Figma `01 Core` + `packages/ui` | composants core + K&W (DicePool, StatBlock…) | Figma + `packages/ui`+Storybook | Storybook vert, a11y axe | ⏳ |
| **F4** Code Connect | mapping Figma ↔ `packages/ui` | `*.figma.tsx` | Dev Mode émet le vrai code | ⏳ |
| **F5** Figma `02 Patterns` | fiche/combat/session/browsers/MJ | maquettes patterns | revues | ⏳ |
| **F6** Claude Design | pointer codebase + Figma, générer écrans | prototypes + brief `CLAUDE-DESIGN-BRIEF.md` | cohérents DA | 🟡 planches DS lancées |
| **F7** Surfaces | implémenter par surface (fiche #52 d'abord) | apps/game | tests + e2e verts | ⏳ |
| **F8** CI/qualité | boundaries-lint + Storybook + visual reg + Lighthouse dans `pnpm validate` | ci.yml | gates verts | ⏳ |

## 9. Execution log (vivant — mis à jour à chaque étape)
- **2026-05-22** — F0 lancée : 3 recherches profondes en parallèle (design systems/Figma ; game-UX/TTRPG ; frontend robuste/canonical/CI), grounding DA lu dans `globals.css`. Pack de synthèse produit. « Claude Design » identifié (claude.ai/design, Anthropic Labs, lit codebase+design files). Décisions de cadrage prises (voir §10). Runbook créé.
- **2026-05-22** — **F1 tokens livrée.** Décision utilisateur : Figma vierge à créer (pas d'URL) + scaffolder `packages/tokens` + branchement Tailwind v4, « en parallèle ». Skills Figma chargés (`figma-generate-library` + `figma-use`).
  - *Env vérifié* : WSL OK via `wsl.exe`, branche `feat/frontend-foundations`, `packages/{catalogs,rules-core}` (tokens à créer), pnpm 10.33.2 / node 20.
  - *Set v1 (source unique)* : `packages/tokens/src/tokens/*.json` (DTCG W3C) — **primitives** (6 ancres marque + dérivés deep/soft, rampe neutre warm 0→900, 4 fonctionnels), **semantic.light/night** (21 rôles : canvas/surface/raised/inset · fg/-muted/-subtle/-inverse/on-accent · border/-strong/-subtle · forest/forest-strong/wine/wine-strong/gold · success/warning/danger/info), **dimensions** (spacing 0→4xl, radius none→full), **typography** (Inter, 4 weights, 9 tailles, 4 line-heights).
  - *Générateur* : `src/build.ts` (+`lib.ts`) — flatten DTCG + résolution d'alias `{…}` → émet (a) `apps/game/src/app/tokens.generated.css` (`@theme` light + override `[data-theme='night']`), (b) `tokens.resolved.json` (miroir pour Figma), (c) `src/generated/tokens.ts` (export typé). Script racine `pnpm tokens:build`.
  - *Wiring Tailwind v4* : `globals.css` → `@import './tokens.generated.css'` + styles de base sur variables (`var(--color-canvas/-fg/-forest/-wine)`, `--font-sans`).
  - *Validation* : `format:check` ✓ · `lint` ✓ (0 pb) · `typecheck` ✓ (7 packages dont `@knightandwizard/tokens`) · `next build` ✓ (4 pages) ; **vérifié** que `--color-canvas` et `[data-theme]` sont émis dans `.next/static/css`. Artefacts générés exclus de prettier (contrat « générateur = source de vérité »).
  - **Prochaine : F2 — créer le fichier Figma + Variables (miroir des 21 couleurs × 2 modes + spacing/radius/type), après checkpoint scope-lock.**
- **2026-05-22** — F2 : fichier Figma **Knight & Wizard — Design System** créé (key `d6rwR90ptCWCcrOZFhBZ3n` · https://www.figma.com/design/d6rwR90ptCWCcrOZFhBZ3n · plan « L'équipe de Dev Réalisons », auth `DevRealisons`). Build des Variables en cours, miroir de `tokens.resolved.json` : Primitives (26) → Color light/night (21) → Dimension (spacing+radius) → Typography ; scopes + code syntax `var(--…)` posés sur le sémantique.
  - **Variables livrées** : 4 collections, **80 variables** — Primitives `1:2` (26, scopes masqués), Color `2:2` (21, modes Light `2:0`/Night `2:1`, alias→primitives, scopes par rôle, `var(--color-*)`), Dimension `3:2` (15 : spacing+radius, `var(--spacing-*/--radius-*)`), Typography `3:18` (18 : family/weights/sizes px/line-heights, `var(--font-sans/--font-weight-*/--text-*/--leading-*)`). Page `Foundations` (`4:2`) + planche nuanciers sémantiques (frame `4:3`, fills/texte liés aux variables) **validée par screenshot** (Light).
  - **Foundations complétées** : planche **Night** (frame `5:2`, clone + mode explicite Night) ✅ ; panneau **Type & Scales** (`6:2`) — spécimen typo (font-size lié aux variables `xs→5xl`), échelle spacing (4→64px), radius ✅ ; **styles de grille** réutilisables `Baseline / 8px` + `Columns / 12` + frame exemple (`7:5`) ✅. Validé par screenshots (Light / Night / Type). **Publication en library = action manuelle Figma** (Assets → Publish ; non exposée à l'API plugin).
- **2026-05-22** — **Brief Claude Design** préparé : [`CLAUDE-DESIGN-BRIEF.md`](./CLAUDE-DESIGN-BRIEF.md) — démarche bout-en-bout pour **challenger la DA** via claude.ai/design. Recherche outil confirmée (ingère repo GitHub + Figma + tokens/assets → design system → écrans HTML interactifs → handoff Claude Code ; « comparison workflow » natif). Contenu : prérequis (push repo + publish Figma), onboarding DS, **brief produit copier-coller** (produit/public/DA baseline/surfaces/dés/contraintes dures/axes ouverts), **4 prompts**, **grille de comparaison pondérée**, **boucle de réintégration** tokens↔Figma anti-drift.
- **2026-05-22** — **F6 lancée dans Claude Design** (projet « Knight and Wizard », compte DevRealisons). Accès GitHub au repo **OK** (a parcouru `decarvalhoe/knightandwizard`, restitué fidèlement les règles : pool D10, règle du 10/du 1, échec critique D100, combat DT, multi-arbitre). Décision utilisateur : **pas de protos d'abord** → **planches de proposition de design system**, **à l'aveugle** (sans lui fournir ma palette parchemin). Consigne envoyée : 3 directions DA distinctes côte à côte (nom+intention ; palette Light/Night en rôles sémantiques + primitives ; typo display+texte+échelle ; composants échantillon bouton/carte/input/badge/stat-block ; iconographie/texture ; rendu du jet de pool D10 / réussite critique / échec critique D100) ; contraintes WCAG 2.2 AA + Light/Night + lisibilité table + FR + logique systémique (→ conversion tokens). Génération en cours. **Garde-fou : ne jamais toucher « Realisons Design System » (Pro-only, distinct).** Suite : l'utilisateur choisit une direction → alimentation propre du DS → protos.
- **2026-05-22** — **F6 itération 1** : 3 planches reçues (Grimoire d'Aldwin / Console DT / Bréviaire d'un compagnon). Verdict utilisateur : Grimoire **trop cliché**, Console **mauvaise DA**, Bréviaire OK mais **« manque de chien »**. Diagnostic : **la voix K&W n'était pas DANS l'UI**. Relecture canonique (`docs/rules/01-resolution.md` + `data/legacy/.../listes/lexique.md` + `histoires/{blagues-dictons-proverbes,us-et-coutumes}.md` + `lore-index.yaml`) → **VOIX = pince-sans-rire, noire, cynique, ethnographique** ; **ancrage artisanal** (classes-métiers : Tonnelier, Vannier, Braconnier, Pêcheur) ; monde = **les Terres Oubliées** (nations : Fauche-le-Vent, Corteganne, Yonkado, Monde Sombre, Forêt de Tyrkan). Pépites : échec critique « (et ça, c'est rigolo) » ; sort Apathie « à quoi bon mourir, **on meurt toujours trop tard** » ; proverbes (Elfe Sombre « Lève-toi et meurt », Mort-Vivant « la mort c'est comme la cuisine… », Irtanien « Cours tant qu'il te reste des jambes ») ; joute des hommes-rats « perdants **cordialement invités à la prochaine joute** ». Re-prompt envoyé : 2-3 **nouvelles** directions où la voix vit dans la **microcopie / états vides / affichage du jet de dés** ; seeds « **almanach/chronique des Terres Oubliées** » (chroniqueur blasé) et « **carnet d'atelier/compagnon** » (artisanal, cuir/laiton, surtout pas tech) ; éviter grimoire arcane / console sci-fi / bréviaire pieux. **Décision DA : la « voix & ton » devient un livrable du design system** (microcopie canonique), à verrouiller avec la direction retenue.
- **2026-05-22** — **F6 itération 2** : 2ᵉ fournée (A · Armorial des Nations / B · Gazette des Routes / C · Greffe des Causes) jugée **bonne**. **Insight clé : 3 skins d'une même famille** (socle parchemin + encre + voix), pas des concurrents. Directive utilisateur : **ancrer chaque surface dans une métaphore réelle** (greffe→règles, registre du commandant→combat, tripot/casino→dés, archives→historique…) + **anachronisme assumé par nation** (vrai pays détourné, époques mêlées, clichés régionaux). Relecture canon firsthand (`nations.md` + `nations.yaml`) + agent de collecte (3 HTML + surfaces + `organisations.md`). **Livré : [`DA-MATRICES.md`](./DA-MATRICES.md)** — socle commun, 3 skins (palettes/polices/voix), **Matrice 1 surface→métaphore→skin** (14 surfaces actuelles+futures ; nouveaux skins « Registre du commandant », « Tripot », « Archives »), **Matrice 2 nation→pays anachronique→ambiance** (18 nations ; émaux du blason = accent régional), factions (Sans Noms = guilde d'assassins d'État, Clemente = mafia, 5 maisons divinatoires). Traces écrites : ambiances **écrites** ✓ ; oral **documenté** mais `us-et-coutumes.md` = **stub** (coutumes surtout à générer dans le ton, canonical-first). **En attente utilisateur** : valider les 2 matrices + trancher split Alteria (Renaissance) / Irtanie (pègre). Ensuite : push du doc (lisible par Claude Design depuis GitHub) + re-prompt « planches par surface (skin + émaux), Jour/Veillée ».
- **2026-05-22** — **Vérif lore régional profonde** (agent) + **cartes retrouvées**. **Cosmologie clé** : le titre **« Knight & Wizard » EST le mythe fondateur** (deux élus — un Chevalier physique + un Sorcier psychique — destinés à s'entretuer pour rééquilibrer le monde ; énergie blanche/noire en guerre éternelle ; dragon **Eresthos** ; 8 écoles = 8 couleurs). **Cartes réelles dans le repo** : carte du monde + **16 cartes régionales JPG** (`apps/interactive-map/public/maps/`), GeoJSON régions/villes, QGIS (`kw-world.qgs`), blasons (`public/flags/`) — tout catalogué dans `data/catalogs/images.yaml`. **`DA-MATRICES.md` enrichi** : §8 cosmologie, §9 cartes & assets, §10 régions web + corrections (Yonkado = sino-japonais ; Portes d'Azrak = nains alpins ; « Sans Noms » = Monde Sombre ≠ Terres Sans Noms ; divergences Oracle 2/1 gorgée, princesse Alteria). 11 régions web : 5 mappables (Azrak/Stazyliss/Terres Sauvages/Chaos/Lounaxill), 6 « non écrit » → ne pas inventer.
- **2026-05-22** — **Pipeline cartes (R&D)** : réseau OK, python3.13 + pip. Testé **vtracer** (trace couleur → délavé, perd le canon → **écarté**) puis **extraction lignes d'encre cv2** (seuillage → contours → **parchemin + encre** SVG) = **concluant** : géométrie canon **préservée** (côtes/frontières/villes/labels), **DA-raccord**, **~1 s/carte**, automatique. Scripts : `apps/interactive-map/tools/{vectorize_test,vectorize_lines}.py` (+ scratch `_vec_work/`, non commité). Reste : émaux par région + labels en vrai texte (cities data) + batch des 16 (+ relief hachuré option). **Liste de décisions à trancher** consignée dans [`DA-MATRICES.md`](./DA-MATRICES.md) §11.
- **2026-05-22** — **Cadrage multivers acté** : K&W = **moteur agnostique + packs de setting** ; Terres Oubliées = **branche originelle** ; lore **vivant/collaboratif/rhizomatique** (MJ ajoutent du canon validé ; leviers géopolitiques guerres/alliances/traités ; branches & timelines), règles **canon + vivantes (validées)**. `DA-MATRICES.md` : **§3 superseded par §12** (atomisation diégétique = autorité), ajout **§15 architecture multivers** + split signature **moteur** (universelle) / **Terres Oubliées** (pack ré-skinnable) en §13. Arbitrages : noms+positions cartes = **canon** (C4). Push (bc18ac0) effectué ; reste : push refontes + re-prompt Claude Design (planches **par surface** §12, ossature ré-skinnable).
- **2026-05-22** — **5 planches par-surface validées** (verifier Claude Design OK) : Grimoire (roue des 11 écoles + notice de sort), Registre du commandant (timeline DT 142→152, F. Vitesse), Tripot/Fortune (3 jets + roulette D100 « tire au cent »), Archives juridiques (D1→D13, statuts 🟢🟡🔴, renvois §), Bibliothèque/Chancellerie (versioning par champ + diff + historique). HTML fournis par l'utilisateur (à archiver dans `docs/design/boards/`).
- **2026-05-22** — **Bascule d'exécution** : quota Claude Design quasi épuisé → **réservé aux tâches spécifiques**. Je **reprends tous les points ouverts en interne** : (a) codification tokens **moteur + pack** depuis les 5 planches ; (b) **extension des surfaces restantes conçue par moi** (depuis §12 + signature §13, sans nouvelle génération Claude Design) ; (c) proto **DT tracker** ; (d) **test de ré-skinnabilité** (pack alternatif sur la même ossature). Scope acté : **dossier complet (moteur + pack)**.
- **2026-05-22** — **Dossier complet codifié + validé**. `packages/tokens` restructuré en **source unique `src/kw-system.ts`** (engine agnostique + pack Terres Oubliées + **5 skins** + **11 écoles**) ; tokens F1 DTCG supprimés (superseded). Générateur `build.ts` → `tokens.generated.css` : `@theme` (utilitaires) + bloc `:root` **var()-only** (géométrie/ombres/tracking/11 écoles, hors tree-shaking Tailwind) + `[data-skin]` ×5 (Jour) + `[data-theme=night]` (Veillée partagée + accent par skin). `globals.css` rebranché. **Gates verts** (format/lint/typecheck/build:game) ; vérifié dans le CSS de prod : `--color-accent`, `--school-necromancie`, `--shadow-card`, `data-skin`. 5 HTML archivés (gitignored) + `boards/README.md` ; contrat de consommation en `DA-MATRICES.md` §16. Reste : (b) surfaces restantes (par moi), (c) proto DT, (d) test ré-skin.
- **2026-05-22** — **(b) Pack étendu : 7 skins** (ajout `gazette` + `armorial` depuis la 1ʳᵉ fournée validée) + **émaux héraldiques** (`--emaux-{gueules,azur,or,sinople}`, accent par nation §4). **Toutes les surfaces §12 mappées** sur les 7 skins (couverture détaillée en DA-MATRICES §16). Gates verts ; `data-skin=armorial|gazette` + `--emaux-gueules` vérifiés dans le CSS de prod. Reste : (c) proto DT live, (d) test ré-skin.
- **2026-05-22** — **(c) Proto DT live + (d) preuve de ré-skinnabilité**. Page `apps/game/src/app/design-proto/page.tsx` : **Tracker DT** (timeline DT, F.Vitesse, jet de pool D10 avec dé/destin) **stylé 100 % via les tokens** (`var(--color-*/--shadow-*/--font-*)`), avec **sélecteur de skin (8) + bascule Jour/Veillée** → le même composant/ossature re-skinné en live. **(d)** : pack alternatif **`moderne`** (sans-serif Inter, palette froide, **sa propre rampe nuit**) ajouté → prouve l'invariant **moteur↔pack** ; le générateur émet désormais une rampe nuit **propre au pack** (`[data-skin][data-theme=night]`). 8 skins, gates verts, route `/design-proto` buildée. Visible via `pnpm dev:game` → `/design-proto`.

## 10. Decisions register
| Date | Décision | Rationale |
|---|---|---|
| 2026-05-22 | Le design n'est **pas** du canonical-first ; rien dans `docs/canonical/` | Le canonical-first gouverne les règles/contenu, pas la DA (clarification utilisateur) |
| 2026-05-22 | **Figma-first**, repo ensuite si utile | Choix utilisateur |
| 2026-05-22 | Périmètre **large** (toutes les surfaces) | Choix utilisateur |
| 2026-05-22 | Tokens **DTCG → générateur tsx maison → Tailwind v4 `@theme`** (CSS vars). **Pas** Style Dictionary | Cohérent avec les outils repo (tsx : canonical, nomos-export) ; zéro dépendance ; SD n'émet pas le `@theme` v4 nativement (formatter custom de toute façon) |
| 2026-05-22 | `packages/ui` = **Radix re-skinné tokens** (départ shadcn) | a11y native + pas de lock-in |
| 2026-05-22 | **Dark/night mode dès J1** au niveau sémantique | éviter le retrofit |
| 2026-05-22 | Claude Design alimenté via **codebase (packages/ui+tokens) + lib Figma** | c'est ce que Claude Design lit |
| 2026-05-22 | `packages/tokens` = **source unique**, Figma Variables = **miroir** (via `tokens.resolved.json`) | Aligne code↔design dès J1, anti-drift |
| 2026-05-22 | Clés sémantiques **plates** (`canvas`,`fg`,`fg-muted`,`border`,`forest`…) = vars `--color-*` = utilitaires Tailwind (`bg-canvas`,`text-fg`) | Tailwind v4 met toutes les couleurs dans un seul namespace ; évite `bg-bg-*` |
| 2026-05-22 | Night via override **`[data-theme='night']`** des vars `@theme` (pas de variantes `dark:`) | Un seul jeu d'utilitaires bascule via l'attribut HTML ; maintenance simplifiée |
| 2026-05-22 | CSS généré = **fichier séparé** `tokens.generated.css` importé + `.prettierignore` | Découple généré/manuel ; évite le conflit générateur↔prettier |

## 11. References
Claude Design : [Anthropic Labs](https://www.anthropic.com/news/claude-design-anthropic-labs) · [TechCrunch](https://techcrunch.com/2026/04/17/anthropic-launches-claude-design-a-new-product-for-creating-quick-visuals/) · [DataCamp](https://www.datacamp.com/blog/claude-design).
Design tokens : [W3C DTCG stable (2025.10)](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/) · [Contentful 3-tier](https://www.contentful.com/blog/design-token-system/) · [figmafy Variables→Tailwind](https://figmafy.com/figma-variables-to-code-tokens-to-tailwind-css-vars/).
Figma : [Code Connect](https://developers.figma.com/docs/code-connect/react/) · [Claude Code to Figma](https://www.figma.com/blog/introducing-claude-code-to-figma/) · [libraries best practices](https://www.figma.com/best-practices/components-styles-and-shared-libraries/).
Game UX : [Foundry vs Roll20 2025](https://myvtt.games/blog/foundry-vtt-vs-roll20-2025-which-vtt-is-better) · [Foundry Combat](https://foundryvtt.com/article/combat/) · [Demiplane Q1 2025](https://www.demiplane.com/blog/demiplane-q1-2025-review) · [Juice — Brad Woods](https://garden.bradwoods.io/notes/design/juice).
Frontend : [Next.js Server/Client](https://nextjs.org/docs/app/getting-started/server-and-client-components) · [eslint-plugin-boundaries](https://www.npmjs.com/package/eslint-plugin-boundaries) · [Shared Zod contracts](https://www.ruthvikdev.com/blog/3-shared-zod-schemas) · [WCAG 2.2](https://www.allaccessible.org/blog/wcag-22-complete-guide-2025) · [next-intl](https://next-intl.dev/docs/getting-started/app-router) · [Turborepo design-system](https://github.com/vercel/turborepo/tree/main/examples/design-system).
