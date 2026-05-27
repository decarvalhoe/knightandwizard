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

## Vagues E0 (chaque vague : parseur/lien → évidence → gate canonique)

1. **E0.1 — Parseur de sources prose** → entrées structurées. Commencer par le **lexique** (le plus
   transverse : sorts + atouts + plus).
2. **E0.2 — Liaison sorts ↔ lexique + grimoire** (+ réconciliation, rapport d'orphelins). **Débloque E2.**
3. **E0.3 — Liaison atouts ↔ lexique + atouts-de-niveaux** (129 atouts). Débloque l'encodage des atouts (combat).
4. **E0.4 — Liaison autres catalogs** ↔ leurs sources (bestiaire, races, classes, armes, protections, potions…).
5. **E0.5 — Gate de couverture + intégration RAG** : les entrées parsées deviennent les **unités citables**.

## Ce que E0 débloque (en aval)

- **E2** (audit d'effets de sorts) : structure depuis la **prose du lexique**, pas la ligne terse.
- **Atouts** : les 129 atouts du lexique deviennent encodables en `EffectModel` avec leur prose.
- **RAG** : citation sur les entrées parsées (pas le `.doc` brut).
- **MJ / Fiche / Grimoire** : afficher la **définition canonique en prose** au survol de tout élément.

## Reséquencement du programme magie

**E0 → E1** (schéma `EffectModel` étendu, **informé par la prose réelle**) **→ E2** (audit, lit le
lexique) **→ E3 ∥ E4**. Voir `MAGIC-IMPLEMENTATION.md` (plan de vagues).
