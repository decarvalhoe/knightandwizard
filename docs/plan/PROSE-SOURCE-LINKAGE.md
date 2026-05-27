# E0 — Liaison sources prose ↔ éléments du jeu (fondation)

> **Principe canonique (acté 2026-05-27).** Les **sources prose** (lexique, grand-grimoire,
> bestiaire, atouts-de-niveaux, orientations-et-classes, armes, protections, rituels-et-potions…)
> sont le **lieu de définition canonique** de la plupart des éléments du jeu (sorts, atouts,
> créatures, races, classes, objets…). **Tout élément qu'une source prose décrit DOIT porter un
> lien inconditionnel vers son/ses entrée(s).** Le catalogue chiffré (YAML) n'est qu'un **résumé
> structuré** ; **la prose fait autorité**.

## Pourquoi — constat 2026-05-27

- Le **lexique** = **514 entrées** de prose (dont **101** `(Sort de magie …)`, **129** `(Atout …)`,
  - durées `(Permanent)`/`(Éphémère)` et catégories orientation/race/classe).
- Or **`spells.yaml` ne le référence pas** (0 lien) — il ne source que le grimoire web. Seul
  `orientations.yaml` touche au lexique. **Le lien lexique ↔ éléments n'a pas été câblé.**
- Structurer un effet depuis la **ligne terse du grimoire** sans la prose produit des erreurs :
  - _Apaisement_ → « Soigne par le toucher, vitalité récupérée = **niveau du soignant**, éphémère » (pas `vitality += R`).
  - _Augmentation énergétique_ → « doit être lancé **durant la phase d'incantation** du magicien cible ».
- Sans ce lien, l'audit d'effets (E2), l'encodage des **atouts**, et la **citation RAG** travaillent
  sur une donnée appauvrie.

## Corpus (sources prose ↔ catalogs)

| Source prose (paper extrait + web)                   | Catalog(s) cible(s)                      |
| ---------------------------------------------------- | ---------------------------------------- |
| `lexique` (514 entrées, **transverse**)              | `atouts.yaml` + `spells.yaml` (+ autres) |
| `grand-grimoire` / web `grimoire`                    | `spells.yaml` (324)                      |
| `bestiaire` (paper + web)                            | `bestiaire.yaml`                         |
| `atouts-de-niveaux` / web `atouts`, `atouts-niveaux` | `atouts.yaml`                            |
| `orientations-et-classes` / web `classes`            | `orientations.yaml`, `classes.yaml`      |
| `armes`                                              | `armes.yaml`                             |
| `protections`                                        | `protections.yaml`                       |
| `rituels-et-potions`                                 | `potions.yaml`                           |
| `experience`                                         | barème progression (rules-core)          |
| `table-des-touches`                                  | hit-table (R-9.46)                       |

Relation **N:N** : un élément peut être défini par **plusieurs** sources (un sort ∈ grimoire **et**
lexique ; un atout ∈ lexique **et** atouts-de-niveaux).

## Modèle de données

- **Chaque source prose est parsée** en entrées structurées : `entry_id`, `term`, `prose`,
  `kind` (sort | atout | creature | race | classe | objet…), métadonnées
  (`school` | `orientation` | `race` | `classe`, `duration`, `niveau`), `source` + `sha256`.
- **Chaque élément de catalogue** gagne `prose_refs: [{ source, entry_id, locator, sha256 }]`
  (réutilise le patron `source_refs` existant, mais pointe vers l'**entrée parsée faisant autorité**,
  pas le `.doc` brut).
- **Ambiguïté = donnée explicite** : un élément sans entrée prose porte `prose_orphan: true` (jamais
  un silence).

## Réconciliation (web ↔ paper)

- Divergence connue : **324** sorts (grimoire web) vs **~101** `(Sort de magie)` (lexique paper).
- Produire un **rapport d'orphelins bidirectionnel** : (a) élément de catalogue sans entrée prose ;
  (b) entrée prose sans élément de catalogue.
- **Variantes** (Contre-couleur, « de masse », création-membre…) souvent **sans entrée propre** →
  lier à l'entrée de **base** + règle de dérivation (cf. audit MAGIC, archétypes/familles).
- **Gate** : 100 % des éléments MVP liés **ou** marqués `prose_orphan: true`.

## Audit d'exhaustivité + mécanisme NOMOS (2026-05-27)

**Pourquoi NOMOS n'atomise pas la prose.** `tools/canonical.ts` route chaque source par
`source_type` : `catalog_yaml` (`data/catalogs/*.yaml`) → `extractYamlCatalogUnits` = **1 unité par
entrée** ; `canonical_rule` (`docs/rules/*.md`) → 1 par R-x.y ; **tout le reste**
(`legacy_paper_extract`, `other`, `raw_source`…) → `extractLegacyObjectUnits` = **1 unité-bloc par
fichier**. `nomos-export.ts` ne fait que **mapper** ces unités. **Prouvé empiriquement** : une sonde
`data/catalogs/*.yaml` est auto-classée `catalog_yaml` et atomisée par entrée.

**Conséquence : seuls les 21 catalogs chiffrés sont atomisés ; toute la couche prose de définition
est « 1 bloc ».** Balayage complet du manifeste :

| Rang | Couche                                     | type actuel                    | Sources                                                                                                                                                                                        | Action                                  |
| ---- | ------------------------------------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 1    | Prose paper `extracted/listes`+`infos`     | `legacy_paper_extract`         | lexique, grand-grimoire, bestiaire, armes, protections, rituels-et-potions, atouts-de-niveaux, orientations-et-classes, experience, table-des-touches, monnaie, poisons, champignons (**~13**) | → `catalog_yaml`                        |
| 2    | Prose web `documents/*/index.md`           | `other`                        | armes, atouts, atouts-niveaux, bestiaire, classes, competences, grimoire, potions, cartes, regles (**~10**)                                                                                    | réconcilier ↔ paper                     |
| 3    | Monde / lore                               | `legacy_paper_extract`+`other` | nations, organisations, cultes-et-religions, us-et-coutumes ; `monde/lieux`(17)/`villes`(9)/`regions`(5)                                                                                       | → enrichir catalogs monde               |
| —    | Originaux binaires `.doc/.pdf/.xls`        | `raw_source`                   | Lexique.doc, Bestiaire.doc…                                                                                                                                                                    | **laisser** (le `.md` extrait fait foi) |
| —    | Fiches perso (96), pages app, docs générés | `other`/`generated_doc`        | —                                                                                                                                                                                              | **hors scope** (couvert / bruit)        |

**Correctif uniforme** : produire/enrichir un `catalog_yaml` porteur de la **prose** + `entry_id` par
source de définition → atomisation **+** `prose_refs` gratuits via le pipeline existant. **Aucun
atomiseur à écrire.** Le **lexique est paper-only** (pas de miroir web) → prioritaire.

## Plan de correction — état d'avancement

> **Gate `catalogs:audit:prose` : 1669/1669 entrées prose-bearing définies, 0 sans définition**
> (atouts 802, spells 324, lexique 513, bestiaire-paper 30). Les catalogues **nominaux**
> (competences, classes, nations, magic-schools…) où le nom EST la définition sont hors-périmètre
> (pas de prose requise → pas un manque).

1. **E0.1 — Lexique → `data/catalogs/lexique.yaml`** ✅ (#198) : 513 entrées parsées + atomisées (`catalog_yaml`).
2. **E0.2 — Liaison sorts ↔ lexique** ✅ (#199) + **E0.2b génération ancrée** ✅ (#201) : 324 sorts = 153 paper-liés + 171 `generated_prose` (pending) ; **orphelins 0**.
3. **E0.3 — Liaison atouts ↔ lexique** ✅ (#200) + **E0.3b génération** ✅ (#202) : 802 atouts = 692 paper-liés + 110 `generated_prose` ; **orphelins 0**.
4. **E0.4 — Couche équipement/combat** ✅ : bestiaire-paper 30 stats (#203), armes-paper 107 (#204), protections-paper 10 matériaux (#205), réconciliation paper↔web read-only (#206). _Sources éparses restantes (potions 2 recettes PDF, monde/lore PDF mono-ligne) : faible ROI, en attente._
5. **E0.5 — Gate de couverture** ✅ (#207) : `tools/audit-prose-coverage.ts` (`catalogs:audit:prose`). _Monde/lore + intégration RAG : en attente (lower-priority)._

**Marquage gouverné (acté)** : `generated_prose` = expansion **ancrée** de l'effet/ligne canonique (jamais d'invention libre) + `prose_origin: templated` + `validation: pending`, promu par **arbitrage MJ** (Q-D8.2) ; **jamais confondu** avec le paper autoritaire (`prose_refs`). Reste optionnel : enrichissement LLM des `generated_prose`, monde/lore, RAG.

## Ce que E0 débloque (en aval)

- **E2** (audit d'effets de sorts) : structure depuis la **prose du lexique**, pas la ligne terse.
- **Atouts** : les 129 atouts du lexique deviennent encodables en `EffectModel` avec leur prose.
- **RAG** : citation sur les entrées parsées (pas le `.doc` brut).
- **MJ / Fiche / Grimoire** : afficher la **définition canonique en prose** au survol de tout élément.

## Reséquencement du programme magie

**E0 → E1** (schéma `EffectModel` étendu, **informé par la prose réelle**) **→ E2** (audit, lit le
lexique) **→ E3 ∥ E4**. Voir `MAGIC-IMPLEMENTATION.md` (plan de vagues).
