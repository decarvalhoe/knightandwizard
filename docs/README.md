# `docs/` — Documentation Knight and Wizard

## Contenu

- [`HANDOVER.md`](HANDOVER.md) — État global du projet, avancement, décisions structurantes (à lire en premier pour reprendre la session)
- [`INDEX.md`](INDEX.md) — Index général
- [`sources.md`](sources.md) — Inventaire des sources legacy (paper + web)
- [`product/`](product/) — Vision K&W active : assistant MJ/Joueur, moteur tabletop-first, LLM, architecture produit
- [`rules/`](rules/) — Les **13 domaines de règles canoniques** (Phase 1 close 2026-04-25)
- [`game/`](game/) — Cadrage du projet séparé `knightandwizard-game` (décisions distinctes)

## Phase 1 — 13 domaines de règles

| # | Domaine | Fichier |
|---|---|---|
| D1 | Résolution (dés, difficulté, succès, critiques) | [01-resolution.md](rules/01-resolution.md) |
| D2 | Attributs (9 aptitudes + dérivées) | [02-attributs.md](rules/02-attributs.md) |
| D3 | Races (33 races jouables) | [03-races.md](rules/03-races.md) |
| D4 | Orientations + Classes + Atouts | [04-classes.md](rules/04-classes.md) |
| D5 | Compétences & Spécialisations | [05-competences.md](rules/05-competences.md) |
| D6 | Création de personnage | [06-creation-perso.md](rules/06-creation-perso.md) |
| D7 | Progression / XP / niveaux | [07-progression.md](rules/07-progression.md) |
| D8 | Magie (11 écoles, sorts, énergie, TI) | [08-magie.md](rules/08-magie.md) |
| D9 | Combat (DT, actions, dégâts) | [09-combat.md](rules/09-combat.md) |
| D10 | Équipement (armes, armures, potions, monnaie) | [10-equipement.md](rules/10-equipement.md) |
| D11 | Contrôle PNJ (joueur/MJ humain/LLM/auto) | [11-controle-pnj.md](rules/11-controle-pnj.md) |
| D12 | Géographie + social + économie | [12-geographie-social-economie.md](rules/12-geographie-social-economie.md) |
| D13 | Rôles & passation MJ↔PJ | [13-roles-passation.md](rules/13-roles-passation.md) |

## Statistiques Phase 1

- ~230 règles canoniques (R-X.Y)
- ~70 entrées backlog (Q-X.Z)
- Points de précision restants : restrictions/répétabilité de certains atouts familiers + backlogs D9-D13

## Conventions de notation

- **R-X.Y** = règle canonique du domaine X, item Y (immuable une fois actée)
- **Q-X.Y** = question ouverte ou backlog du domaine X
- **Statut** : 🟢 actée / 🟡 partielle / 🔴 trou / ⏸️ standby

Voir [`HANDOVER.md`](HANDOVER.md) pour plus de détail.

## Jeu Digital

Le produit **K&W-game** vit dans un dépôt séparé : `knightandwizard-game`, avec ses propres décisions produit et techniques.

Document fondateur : [game/knightandwizard-game-foundation.md](game/knightandwizard-game-foundation.md).

Le présent dépôt reste le corpus K&W : règles, catalogues, assistant MJ/Joueur, moteur tabletop-first et architecture LLM. Voir [product/](product/).
