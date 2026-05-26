# Prompt de reprise — chantier Combat (session propre)

> Doc de **handoff**. Colle le contenu ci-dessous (ou lis-le) au démarrage d'une
> nouvelle session pour reprendre sans rien redécouvrir. `origin/dev` fait foi sur l'état.

## Rôle & langue

Session Claude côté Windows, projet **Knight & Wizard** (companion de JDR sur table,
**canonical-first**). Réponds **toujours en français**. Style : sparring (propose →
l'utilisateur challenge → on converge), exécution autonome, qualité **« précis et
exhaustif, rien de jetable / capitalisable »**.

## Mission en cours

Refaire les surfaces du front **en partant du concept** (design + UX), pas du
rapiéçage. **Combat** est la surface phare. Objectif MVP : **toutes les surfaces
fonctionnelles + jeu en réseau** (options A∪B∪C). Le moteur (`rules-core`) reste
**autoritaire** : l'UI et le LLM ne calculent **jamais**, ils appellent rules-core/API.

## Où on en est (tout mergé sur `dev`, gates verts)

- **Pipeline temps réel livré + prouvé** : E-C journal immuable (#153), E-N WebSocket
  broadcast (#154), E-S surface session live (#155), e2e multijoueur 2 clients (#156).
- **Chantier combat** (piloté par le registre gated) :
  - **V1 ✅** : table des touches **provisoire** reconstruite + allonge + loi UX
    « sortie explicite + voix », en **🟡 règles vivantes** (#157 registre, #158 règles).
  - **V2 🟡 partiel** : V2a fait (#159) = **interruptions R-9.4** (`interruptCombatant`,
    DT écoulés perdus, restart/release) + **types d'action `reload`/`aim` R-9.3**.
    **Reste V2b = « FV effectif »** (voir Prochaine action).
  - **V3** zones, **V4** statuts R-9.27, **V5** finitions, **V6** surface
    « Registre du commandant » : à venir.
- **Suivi exhaustif** : `docs/plan/COMBAT-IMPLEMENTATION.md` (**à lire en premier**) +
  `docs/canonical/rule-evidence.yaml` (gated) → l'absence d'évidence = pending visible,
  donc **aucune règle ne se perd**.

## Prochaine action — Combat V2b « FV effectif » (`rules-core`)

Facteur de vitesse effectif au scheduling = base + encombrement + modifs magie/atouts :

- **R-2.18** : encombrement = +1 FV par tranche de 5 kg au-dessus de (Force × 5).
- **R-1.38** : modificateurs de FV via effets → `packages/rules-core/src/effects.ts`
  `computeEffectiveModifiers` cible `factor` (existe, mais `combat.ts` ne l'appelle pas).
- Aujourd'hui : `Combatant` n'a qu'un `speedFactor` plat ;
  `actionCostDT(actor, action) = action.costDT ?? actor.speedFactor` (`combat.ts`).
- À faire : étendre `Combatant` (charge portée + effets actifs, champs **optionnels**
  rétro-compatibles) ; calculer `effectiveSpeedFactor(actor)` ; l'utiliser dans
  `actionCostDT` quand pas de `costDT` explicite. Tests + `rule-evidence` (R-2.18, R-1.38)
  - maj du registre. ⚠️ Lancer le **`pnpm typecheck` complet** (un changement de type
    partagé `rules-core` casse les consommateurs aval, ex. `apps/game` CombatTracker).

## Décisions verrouillées (ne pas rouvrir sans raison)

- **FV = attribut de l'acteur** (jamais de l'arme). La Force aux dégâts dépend de
  l'arme (token `F`).
- **Table des touches** : reconstruction provisoire 🟡 (règle vivante, révisable) ;
  passe **🟢 quand le propriétaire fournit le scan** papier (OCR). Ordre létalité :
  `gorge_nuque` (×2 non-endurable) > `parties_genitales` > `tete` (×2 endurable).
- **Allonge de mêlée** = nouvelle règle gouvernée (champ `reach` 0/1/2 dans `armes.yaml` ;
  +1 difficulté par cran d'écart sur l'action offensive de l'assaillant ; **pas de double
  peine ni d'action perdue**).
- **Loi UX transverse** : toute mécanique → (1) sortie explicite typée + (2) ligne de
  voix in-world. À appliquer **partout**.
- **Concept design** = « atomisation diégétique » : chaque surface = un support in-world
  avec **son** skin + **sa** typo (8 skins existent dans `packages/tokens/src/kw-system.ts`).
  Autorité : `docs/design/DA-MATRICES.md` §12 (surface→skin), §13 (signature), §15
  (moteur agnostique + packs), §16 (tokens). `FRONTEND-FOUNDATIONS.md` a dérivé
  (5 skins/Radix/tokens DTCG supprimés) → DA-MATRICES + `kw-system.ts` font foi.

## Environnement & workflow (critique)

- **Source de vérité = checkout WSL** : `/home/decarvalhoe/repos/knightandwizard`
  (git/build/test/push via `wsl bash -lc '...'`).
- Le checkout Windows `C:\Dev\knightandwizard` est souvent **stale** et **READ-only**
  (gh = `realisonsdotcom`). Ne pas pousser depuis Windows.
- PATH WSL : `export PATH="$HOME/.nvm/versions/node/v24.11.0/bin:$HOME/.local/bin:$PATH"`
- **Merges/PR** : seul le compte `decarvalhoe` (dans le gh CLI WSL) crée/merge →
  `gh auth switch -u decarvalhoe` avant ; `RBOKCLIclaude` ne fait que pousser (clé SSH).
- **Recette PR** : `git checkout dev && git pull --ff-only origin dev` →
  `git checkout -b <branche>` → éditer → **`pnpm typecheck` complet + `pnpm lint` +
  `pnpm format:check`** (prettier --write d'abord) → **si source canonique** modifiée
  (`docs/rules`, `docs/plan`, `data/catalogs`, `rule-evidence`…) : **`pnpm canonical:write`
  ET `pnpm nomos:export`**, committer les artefacts régénérés (`docs/canonical` +
  `docs/canonical/nomos`) → commit (trailer
  `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`) → push →
  `gh pr create --base dev` → `gh pr checks <PR> --watch` → merger si **4 gates verts**
  (Validate, Strict Canonical, NOMOS Binary, NOMOS Canonical).
- **Gotchas** : `/tmp` WSL est **effacé entre appels** (garder sous `/home` ou `/mnt/c`) ;
  `git rev-parse`/`log` affiche parfois un état périmé (glitch WSL ; `origin` fait foi) ;
  variables custom inline parfois vides sous `wsl bash -lc` (préférer des littéraux) ;
  pour éditer des fichiers WSL de façon fiable, écrire un script Python (anchors,
  `assert count == 1`) via l'outil Write sous `/mnt/c/Users/decarvalhoe/AppData/Local/Temp/`
  puis l'exécuter en WSL.

## En attente du propriétaire

- Le **scan de la Table des Touches** (pour passer la table provisoire 🟡 → 🟢).

## À lire en premier

`docs/plan/COMBAT-IMPLEMENTATION.md` · `packages/rules-core/src/combat.ts`
(+ `combat-damage.ts`, `effects.ts`) · `docs/rules/09-combat.md` (R-9.x) ·
`docs/design/DA-MATRICES.md` (§12–§16).

## Démarrer par

Confirmer l'état (`git log origin/dev`, lire le registre), proposer le plan **V2b**
et exécuter — ou demander à l'utilisateur s'il préfère **déposer le scan** ou réorienter.
