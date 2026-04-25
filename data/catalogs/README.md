# Catalogues K&W — données structurées (Phase 2 / axe A)

Ce dossier contient les imports effectifs des catalogues legacy, structurés selon les méta-modèles définis en Phase 1.

## Stratégie d'import (R-10.19)

1. **Phase 1 — Auto** : import automatique depuis le legacy (paper + web) avec valeurs inférées (range, min_strength, area_attack, durability, prix manquants).
2. **Phase 2 — Ambiguïtés** : table d'ambiguïtés détectées par catalogue (`*-ambiguites.md`).
3. **Phase 3 — Édition admin** : l'auteur valide / corrige / surcharge les valeurs.
4. **Phase 4 — Migration** : les persos référencent une version figée.

## Catalogues (avancement)

| Catalogue | Fichier | Source | Entrées | Statut |
|---|---|---|---:|---|
| Armes | `armes.yaml` + `armes-ambiguites.md` | `regles-papier/extracted/listes/armes.md` | 102 | ✅ import auto |
| Protections | `protections.yaml` | `regles-papier/extracted/listes/protections.md` | 49 + 11 boucliers | ✅ import auto |
| Potions | `potions.yaml` | `regles-papier/extracted/listes/rituels-et-potions.md` + `documents/potions/index.md` | 5 | ✅ import auto |
| Champignons | `champignons.yaml` | `regles-papier/extracted/infos/champignons-toxiques.md` | 8 syndromes (~14 espèces) | ✅ import auto |
| Bestiaire | `bestiaire.yaml` | `regles-papier/extracted/listes/bestiaire.md` | 30 | ✅ import auto |
| Nations | `nations.yaml` (v2) | `regles-papier/extracted/histoires/nations.md` + cartes web | **29** (18 paper + 11 ajouts web) | ✅ import auto + extension cartes |
| Religions/Divinités | `religions.yaml` | `regles-papier/extracted/histoires/cultes-et-religions.md` | 9 religions / 70+ divinités | ✅ import auto |
| Carte du monde | `world-map.yaml` | `monde/regions/`, `monde/villes/`, `monde/lieux/`, `site/download/map/terres-oubliees.jpg` | 5 régions web + 9 villes + 17 lieux + 6 régions découvertes via carte + 15 villes Cortega | ✅ import auto |
| Organisations | `organisations.yaml` | `regles-papier/extracted/histoires/organisations.md` | 7 organisations | ✅ import auto |
| **Images visuelles** | `images.yaml` | `site/download/map/`, `site/img/flags/`, `site/img/maps/` | 1 carte mondiale + 15 cartes régionales + 10 blasons + 3 web assets | ✅ import auto |
| **Villes des cartes régionales** | `cities-from-maps.yaml` | 15 cartes JPG `site/download/map/*.jpg` | ~280 villes + 10 portes fortifiées + 3 régions nouvelles + zones | ✅ extraction visuelle |
| **Vectorisation cartes** | `vectorisation-cartes.md` | recherche 2026 outils interactifs | 6 options évaluées + workflow recommandé QGIS+Leaflet | ✅ guide d'implémentation |
| Lore narratif | `lore-index.yaml` | `regles-papier/extracted/histoires/*.md` | 6 entrées (préservées) | ✅ référencement |

**Total : ~690 entrées canoniques importées dans 12 catalogues** (+ 29 fichiers images référencés).

## Backlogs résolus par cet import

- ✅ Q-D10.14 : Catalogue d'armes complet (102 entrées + 12 ambiguïtés validées)
- ✅ Q-D10.15 : Catalogue de protections (49 + 11 boucliers)
- ✅ Q-D10.16 : Catalogue de potions (5 entrées de base, extensible)
- ✅ Q-D10.17 : Catalogue de champignons (8 syndromes)
- ✅ Q-D11.10 : Bestiaire (30 créatures avec stats complètes)
- ✅ Q-D12.14 : Nations (18 nations avec lore + stats) — étendu via world-map.yaml (+1 nation : Portes d'Azrak)
- ✅ Q-D12.15 : Religions/Divinités (9 religions + 70+ divinités)
- ✅ Q-D12.16 : Mythe fondateur (référencé en `lore-index.yaml`)
- ✅ Carte du monde web (régions + villes + lieux)
- ✅ Organisations (7 organisations : 5 maisons divinatoires + Devins fédération + Sans Noms assassins)

## Validation à faire (post-import)

Cf. `armes-ambiguites.md` pour les ambiguïtés. Les autres catalogues ont moins d'ambiguïtés (les stats sont explicites dans le legacy).

Points d'attention :
- **`inferred: true`** : valeurs déduites par le moteur. À valider/surcharger par l'auteur.
- **Difficulté legacy "95"** (4 armes + 1 potion) : ✅ tranché par auteur — c'est la notation étendue D1 R-1.X (= difficulté 10, "9 ET 5 minimum sur 2 dés").
- **Champignons** : structure paper par syndrome plutôt que par espèce. Décomposition fine en backlog.
- **Manoir Rossellini** : ✅ tranché par auteur — propriété d'un groupe de PJ, hors règles canoniques. Marqué `is_canon: false` dans `world-map.yaml`. **Pas d'import des plans/screenshots** (`regles-papier/extracted/manoir-rossellini/` — non lié aux règles).
- **Anomalies world-map vs nations** :
  - "Portes d'Azrak" (web) absent de nations.yaml paper — à ajouter comme nation naine.
  - Princesse alteria : "Santa-Lucarna" (paper) vs "Santa-Ferucci" (web) — variante mineure.
  - Oracle Cortega : "2 gorgées" (paper) vs "1 gorgée" (web) — révision narrative.
- **Géomanciens** : maison-mère "Deonit" (paper organisations.md) ≠ "Hildurm" (capitale Terres du Nord, paper nations.md) — anomalie source à valider.
- **Régions découvertes via carte mondiale (terres-oubliees.jpg)** absentes de nations.md paper :
  - **Royaume du Chaos** (frontière nord)
  - **Onarit** (nord-est, derrière Montagnes Grises)
  - **Lounaxill** (est) — mentionné dans poisons.md + champignons-toxiques.md
  - **Île aux Basilics** (sud)
  - **Montagnes Grises** (chaîne nord-est)
  - **Terres Sauvages** (sud-est) — mentionné comme habitat dans bestiaire mais pas comme entrée nations
  - **Terres Sans Noms** visible sur carte cortega.jpg (zone tampon liée à organisation Sans Noms ?)
- **Cortega** : 16 villes visibles sur la carte régionale (Senec, Mellec, Précy, Ozora, Teglas, Gampey, Gara, Gan, Letak, Cetara, Udvan, Padan, Selice, Massa, Pilis + Cortega capitale). Les 14 autres cartes régionales contiennent probablement aussi de nombreuses villes non-extraites.

## Format

Tous les catalogues sont en YAML (lisible humain + parseable). Chaque entrée porte :
- `id` (slug)
- `name`
- champs spécifiques au type (cf. méta-modèle Phase 1)
- `metadata.source` : `paper` | `web` | `custom`
- `metadata.inferred` : si `true`, valeurs inférées par le moteur, à valider par admin
- `metadata.version` : versionning
