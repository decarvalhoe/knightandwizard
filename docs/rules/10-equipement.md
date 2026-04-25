# D10 — Équipement (armes, armures, potions, crafting, monnaie, économie)

> Population du méta-modèle item-type-classes (D9 R-9.30) avec tous les items K&W : armes, armures, boucliers, munitions, potions, rituels, vêtements, outils, équipement de voyage, items magiques, items légendaires. Inclut le système monétaire, le crafting, l'encombrement, la réparation, le pillage et le stockage.

**Sources** :
- [regles-papier/extracted/listes/armes.md](regles-papier/extracted/listes/armes.md) — table armes paper (60+ entrées)
- [documents/armes/index.md](documents/armes/index.md) — table armes web canonique (669 lignes)
- [regles-papier/extracted/listes/protections.md](regles-papier/extracted/listes/protections.md) — table protections (cuir/maille/plaque + multiplicateurs raciaux)
- [regles-papier/extracted/listes/rituels-et-potions.md](regles-papier/extracted/listes/rituels-et-potions.md) — rituels et potions paper
- [documents/potions/index.md](documents/potions/index.md) — potions web (Nom, Effet, Ingrédients, Recette, Difficulté, Valeur)
- [regles-papier/extracted/infos/monnaie.md](regles-papier/extracted/infos/monnaie.md) — système monétaire (Po/Pa/Pb/Pc) + prix de référence
- [regles-papier/extracted/infos/champignons-toxiques.md](regles-papier/extracted/infos/champignons-toxiques.md) — champignons (cousins des poisons R-9.35)
- [site/includes/class/Weapon.php](site/includes/class/Weapon.php) — entité arme
- [site/includes/managers/_DBManager.php](site/includes/managers/_DBManager.php) — opérations sur les items

**Décisions D9 actées qui s'appliquent à D10** :
- **R-9.30** — Méta-modèle item-type-classes dynamiques. D10 peuple ce modèle.
- **R-9.19/20/25/35/36/41** — Item-types `weapon_melee`, `weapon_ranged`, `weapon_thrown`, `armor_piece`, `shield`, `ammunition`, `poison`, `unarmed_attack` déjà définis.
- **R-9.24** — Portée des armes à distance (catégorie + numérique).
- **R-9.26** — Durabilité paramétrable par campagne (arcade/standard/réaliste).
- **R-9.42** — Force minimum (`min_strength`) sur armes à 2 mains.
- **R-9.43** — Item-type `mount` pour montures.
- **D2** — Capacité de port = 5 kg × Force avant pénalité de FV.

**Méta-principe rappel (acté 2026-04-25, transversal D1-D13)** : *les règles sont vivantes*. Tous les catalogues D10 sont éditables, versionnés, avec migration des persos en cas d'évolution.

---

## Partie A — Système monétaire

### R-10.1 — Monnaie K&W : 4 unités en factor 10

**Énoncé legacy** ([monnaie.md:14](regles-papier/extracted/infos/monnaie.md)) :

> Po = Pièce d'or, Pa = Pièce d'argent, Pb = Pièce de bronze, Pc = Pièce de cuivre.
> 1Po = 10Pa = 100Pb = 1000Pc.
> 1Pa = 10Pb = 100Pc. 1Pb = 10Pc.
> **1Pc = 1 CHF** (équivalence narrative pour ancrage du joueur)

**Mécanique** :
- 4 dénominations en facteur 10.
- Conversion automatique entre unités lors des transactions.
- Stockage interne en `Pc` (entier) pour éviter les flottants.
- Affichage dans la dénomination la plus appropriée (ex. 1500 Pc = 15 Pb ou 1 Pa 5 Pb).

### R-10.18 — Modèle monétaire minimaliste (décision Q-D10.1)

**Décision Q-D10.1 (2026-04-25)** : choix A — modèle minimaliste legacy.

#### A. Stockage interne

- Toutes les valeurs monétaires sont stockées en **`Pc` (pièces de cuivre)** comme entier (`int`).
- Pas de flottants, pas d'arrondis cachés.
- Capacité d'un compteur : `int64` largement suffisant.

#### B. Conversion automatique pour l'affichage

À l'affichage, le moteur convertit en représentation la plus dense :
```text
amount_pc → { Po, Pa, Pb, Pc }  via division entière successives
```

Exemple : `1500 Pc` → `1 Pa, 5 Pb` (ou `15 Pb`, selon préférence UI).

Le joueur peut payer avec n'importe quelle combinaison de pièces tant que la somme atteint le prix demandé. Le rendu de monnaie est calculé automatiquement (greedy, plus grosses pièces d'abord).

#### C. Prix globaux fixes

- Tous les prix sont stockés au niveau de l'item (`item_instance.price.base_pc`).
- Aucun multiplicateur régional, aucune fluctuation par scène, aucune marge marchande.
- Le MJ humain peut ponctuellement surcharger le prix d'une transaction (mode arbitre humain libre), mais ce n'est pas une règle moteur.

#### D. Pas de banques, pas de devises étrangères

- Le perso porte sa monnaie sur lui (sacoches, bourse), inclus dans l'inventaire et le poids global (R-10.10).
- Poids d'une pièce : à valider (Q-D10.X). Hypothèse de travail : `1 Pc = 1 g`, `1 Pb = 2 g`, `1 Pa = 5 Pb`, `1 Po = 10 g`.
- Pas de comptes bancaires, pas de chèques, pas de devises étrangères modélisées.
- Si la campagne nécessite de tels concepts, le MJ humain les gère narrativement.

#### E. Application par mode arbitre

- **MJ humain** : peut surcharger un prix ponctuellement, négocier narrativement.
- **MJ LLM** : applique les prix de référence du catalogue.
- **MJ auto** : strict — applique les prix sans interprétation, refuse les transactions au-delà du solde du perso.

**Statut** : 🟢 acté

### R-10.2 — Prix de référence (extrait du legacy, table vivante)

**Énoncé legacy** ([monnaie.md:15-22](regles-papier/extracted/infos/monnaie.md)) — prix en Pc :

| Item | Prix (Pc) | Catégorie |
|---|---:|---|
| Pain (500 g) | 10 | nourriture |
| Repas standard (sans viande) | 10 | service |
| Bière (0,5 L) | 5 | nourriture |
| Nuit dans une auberge | 30 | service |
| Corde (1 m) | 3 | équipement |
| Torche | 40 | équipement |
| Couteau | 50 | arme |
| Fronde | 20 | arme |
| Carreau (par pièce) | 4 | munition |
| Flèche (par pièce) | 4 | munition |
| Dague | 150 | arme |
| Arc court | 300 | arme |
| Arc long | 500 | arme |
| Cochon | 500 | animal |
| Veste de cuir souple sans manche | 700 | armure |
| Ceinture | 80 | équipement |
| Chemise | 100 | vêtement |
| Gants (paire) | 180 | armure |
| Veste de cuir souple avec manche | 900 | armure |
| Mule | 1000 | monture |
| Épée à une main | 1800 | arme |
| Épée bâtarde | 2000 | arme |
| Épée à deux mains | 2200 | arme |
| Cheval | 2500 | monture |
| Potion de soin (vitalité +1) | 20 | potion |

**Statut** : 🟡 base de référence — à compléter pour tous les items du catalogue.

---

## Partie B — Catalogue d'armes (à intégrer dans R-9.30 / R-9.19)

### R-10.3 — Catalogue d'armes complet (60+ entrées paper + web)

Catalogue à importer depuis :
- [regles-papier/extracted/listes/armes.md](regles-papier/extracted/listes/armes.md) — version paper concise
- [documents/armes/index.md](documents/armes/index.md) — version web canonique enrichie

**Schéma `weapon_melee` / `weapon_ranged` / `weapon_thrown`** (extension R-9.30, R-9.19, R-9.24, R-9.26, R-9.36, R-9.42) :
```yaml
weapon:
  id: <slug>
  name: <string localisé>
  category: melee | ranged | thrown
  damage_type: P | E | C | T               # ou liste si multi-type R-9.7
  damage_formula: <string>                  # ex. "F+4", "5+carreau"
  difficulty: <int>                         # difficulté convenue
  hands_required: 1 | 2
  min_strength: <int>                       # R-9.42
  weight_kg: <float>
  range:                                     # R-9.24, weapon_ranged uniquement
    nominal: <int en mètres>
    categories: { short: [..], medium: [..], long: [..], extreme: [..] }
  ammunition_compatible: [<ammunition_id>] # weapon_ranged uniquement
  area_attack:                              # R-9.36, optionnel
    enabled: bool
    pattern: sweep | cone | line | ricochet | charge
    max_targets: <int>
  durability:                                # R-9.26
    max: <int>
    breaking_threshold: 0
  special_effects: <string>                 # ex. "+1 C" pour bonus additionnel R-9.7
  price:
    base_pc: <int>                          # prix de référence en pièces de cuivre
    rarity: courant | rare | tres_rare | unique | legendaire
    regional_modifier: <map>                 # multiplicateurs par région D12
  crafting:                                  # voir partie F
    base_recipe: <ref>
    skill_required: <ref>
    base_time: <duration>
  metadata:
    version: <int>
    created_at: <timestamp>
    archived: bool
```

**Statut** : 🟡 import à faire (résolu par R-10.19)

### R-10.19 — Stratégie d'import des catalogues (armes, protections, potions, etc.)

**Décision Q-D10.2 (2026-04-25)** : choix D — hybride règle vivante : import auto + table d'ambiguïtés + édition admin.

#### A. Phases d'import

##### Phase 1 — Import automatique avec valeurs inférées
- Le moteur lit le legacy (paper + web) et crée les `item_instance` pour chaque entrée.
- Pour les champs ambigus (range, min_strength, area_attack, durability max, prix manquants), le moteur applique des **valeurs inférées par défaut** selon des règles documentées :
  - **range** : inféré du type d'arme (arc court → 50 m nominal, arc long → 100 m, arbalète légère → 80 m, arbalète à tour → 200 m, etc.).
  - **min_strength** : inféré du poids (`min_str = ceil(weight_kg / 1.5)` pour arme de mêlée, `0` pour arme à distance simple).
  - **area_attack** : inféré du nom (épée à 2 mains, hallebarde, bardiche, faux → `sweep` ; chakram, boomerang → `ricochet` ; lance, harpon → `line`).
  - **durability max** : inféré du matériau / qualité (`bois` 30, `bronze` 40, `fer` 60, `acier` 100, `acier elfique` 200).
  - **prix** : si listé en monnaie.md → utilisé ; sinon `null` (à compléter).
- Toutes ces valeurs inférées portent un flag `inferred: true` sur l'item.

##### Phase 2 — Détection d'ambiguïtés
- Le moteur produit une **table d'ambiguïtés** par catégorie (range pour armes ranged, min_strength pour armes 2 mains, prix manquants, etc.).
- Chaque ambiguïté est listée avec : item concerné, champ, valeur inférée, justification, alternatives plausibles.

##### Phase 3 — Édition admin/MJ
- Admin/MJ peut :
  - Valider la valeur inférée (passe `inferred: false`).
  - Surcharger avec une valeur custom.
  - Marquer un champ comme `pending_review` (statut 🟡).
- Toutes les modifications sont versionnées (`version` incrémenté à chaque édition).

##### Phase 4 — Migration des persos
- Les armes équipées par les persos pointent vers une version figée jusqu'à acceptation explicite de migration.
- Si une version supérieure est publiée (édition admin), les persos sont notifiés et peuvent valider/refuser la migration.
- Les armes obsolètes (archivées) sont conservées sur les persos jusqu'à leur déséquipement.

#### B. Catalogues concernés par cette stratégie

- Armes (R-10.3)
- Protections (R-10.4)
- Boucliers (R-10.5)
- Potions (R-10.7)
- Champignons (R-10.8)
- Munitions (R-9.25)
- Poisons (R-9.35)
- Toute extension future via R-9.30 méta-modèle

#### C. Application par mode arbitre

- **MJ humain** : peut éditer/valider en libre, peut créer des items custom à la volée.
- **MJ LLM** : suggère des valeurs cohérentes pour les ambiguïtés, propose des résolutions.
- **MJ auto** : utilise les valeurs inférées telles quelles ; refuse de prendre des décisions critiques sans intervention humaine.

**Statut** : 🟢 acté

---

## Partie C — Catalogue de protections (armures + boucliers)

### R-10.4 — Catalogue de protections complet

À importer depuis [regles-papier/extracted/listes/protections.md](regles-papier/extracted/listes/protections.md) avec les 4 catégories canoniques :

| Catégorie | P | E | C | T |
|---|:---:|:---:|:---:|:---:|
| Cuir souple | 1 | 1 | 0 | 1 |
| Cuir rigide | 1 | 1 | 0 | 2 |
| Maille (à compléter) | — | — | — | — |
| Plaque (à compléter) | — | — | — | — |

Pièces typiques : bonnet, botte, cagoule, cuissot, gant, grève, pantalon, veste (avec/sans manche), haubergeon, haubert, canon d'avant-bras, spalière.

**Multiplicateurs raciaux de poids** (paper protections.md:42-50) :
- Gnome 50%, Gobelin 40%, Hobbit 60%, Homme-rat 90%, Khogr 110%, Nain 80%, Ogre 300%, Troll 350%.

**Schéma `armor_piece`** (extension R-9.30, R-9.14, R-9.20) :
```yaml
armor_piece:
  id: <slug>
  name: <string localisé>
  layer: natural | soft | mail | plate | magic        # R-9.14
  category: cuir_souple | cuir_rigide | maille | plaque | <custom>
  protection: { P: <int>, E: <int>, C: <int>, T: <int> }
  zones_covered: [<zone_id>]                          # R-9.5 / R-9.21
  weight_kg_human: <float>
  racial_weight_modifier: <map>                       # legacy multipliers
  durability: { max: <int>, breaking_threshold: 0 }
  price: { base_pc: <int>, rarity: <enum> }
  crafting: { ... }
```

**Statut** : 🟡 import à faire

### R-10.5 — Catalogue de boucliers

À détailler depuis legacy. Référence R-9.7/8 (actif/passif), schéma `shield`.

**Statut** : 🟡 import à faire

---

## Partie D — Potions et rituels

### R-10.6 — Distinction potion vs rituel

**Hypothèse** :
- **Potion** : item consommable. Effet à l'usage (boire/inhaler/contact). Stockable, transportable, achetable. Création par recette + jet de fabrication (compétence Alchimie).
- **Rituel** : procédure. Effet à la complétion. Pas un item per se, mais peut produire un item (potion, talisman, sort enchanté). Création par procédé qui peut être long (heures, jours, conditions astronomiques).

**Statut** : 🟡 à valider (Q-D10.X)

### R-10.7 — Catalogue de potions

À importer depuis :
- [documents/potions/index.md](documents/potions/index.md) — Agrandissement, Résistance au feu, Supercherie (3 exemples détaillés)
- [regles-papier/extracted/listes/rituels-et-potions.md](regles-papier/extracted/listes/rituels-et-potions.md) — Calme pour Loup-Garou, Soin

**Schéma `potion`** (nouveau item-type, extension R-9.30 + R-9.33) :
```yaml
potion:
  id: <slug>
  name: <string localisé>
  effect: <string>                          # ex. "Double la taille / R, 10 min/niv"
  effect_duration_dt: <int>                 # OR
  effect_duration_narrative: <duration>
  ingredients: [<ingredient>]
  recipe: <string>                          # procédé textuel
  crafting:
    skill_required: <ref alchimie/cuisine/médecine>
    difficulty: <int>
    base_time: <duration>
    moon_phase_required: <enum>             # ex. pleine lune pour Calme Loup-Garou
    success_per_dose: bool                  # ex. Soin = +difficulté/dose supplémentaire
  consumption_mode: ingestion | inhalation | contact | injection | ointment
  stack_size: <int>                          # potions/lot par recette
  price: { base_pc: <int>, rarity: <enum> }
  durability:                                # péremption ?
    expires_in: <duration | null>
```

**Statut** : 🟡 import à faire (3 exemples web + 2 paper, à étoffer) — résolu structurellement par R-10.20

### R-10.20 — Méta-modèle `creation_procedure` (potions, rituels, artefacts, items magiques)

**Décision Q-D10.3 (2026-04-25)** : choix D — hybride règle vivante : méta-modèle R-9.30 étendu.

#### A. Item-type `creation_procedure`

```yaml
creation_procedure:
  id: <slug>
  name: <string localisé>
  category: potion | ritual | enchantment | crafting | recipe_culinary | medicine_recipe
  output_type: <item_type_id>           # type d'item produit (potion, ritual_artifact, enchanted_object, food, etc.)
  output_quantity:
    base: <int>                          # nombre d'items produits par exécution
    scaling: <expr>                      # ex. "+1 par tranche de 2 réussites"
  ingredients:
    - id: <ingredient_id>
      quantity: <float>
      unit: g | mg | dl | ml | piece | drop | dose
      replaceable: bool                  # ingrédient remplaçable par équivalent ?
      consumed: bool                     # consommé à la fin du rituel ?
  prerequisites:
    skill_or_atout: <ref>
    min_level: <int>
    moon_phase: <enum | null>            # ex. pleine lune (Calme Loup-Garou)
    location: <enum | null>              # ex. cercle de pierres, autel, eau bénite
    time_of_day: <enum | null>           # ex. minuit, aube
  procedure_steps: [<string>]            # texte narratif des étapes (paper PDF)
  craft_check:
    skill: <ref>                          # compétence dominante (Alchimie, Forge, Magie, Cuisine, Médecine, etc.)
    aptitude: <ref>                       # aptitude associée (souvent Intelligence, Dextérité, Force selon métier)
    difficulty: <int>                     # difficulté du jet
    multi_dose_difficulty_increment: <int> # +N par dose supplémentaire (ex. Soin = +1/dose)
  duration:
    base: <duration>                      # temps standard (DT, minutes, heures, jours)
    scaling: <expr>                       # ex. "× 0.5 si Apprentissage rapide"
  failure_consequences: <string>         # ex. potion ratée = empoisonne le buveur
  output_metadata:
    quality_distribution: <expr>          # ex. "qualité = réussites / 2"
    expires_in: <duration | null>         # péremption du résultat
  price:
    raw_materials_pc: <int>               # coût total ingrédients
    market_value_pc: <int>                # prix de vente du produit fini
  metadata:
    version: <int>
    archived: bool
```

#### B. Sous-types canoniques (output_type)

- `potion` : item consommable. Effet à l'usage. Stockable, transportable, achetable.
- `ritual_artifact` : item permanent issu d'un rituel (talisman, amulette, gri-gri).
- `enchanted_object` : item magique enchanté (lien D8 école Enchantement). Peut être un item existant qui reçoit un enchantement.
- `food` : nourriture cuisinée. Effet nutritif + parfois bonus temporaires.
- `medicinal_remedy` : préparation médicale (compétence Médecine).
- `structural_item` : objet construit (lien Forge, Menuiserie).
- `tool` : outil artisanal.
- `weapon_crafted` / `armor_crafted` : sous-cas pour armes et armures fabriquées.
- `summon_focus` : objet servant à canaliser une invocation magique.

#### C. Catalogues à importer (R-10.19 stratégie)

- **Potions web** : Agrandissement, Résistance au feu, Supercherie (3 entrées détaillées).
- **Potions paper** : Calme pour Loup-Garou, Soin (procédés textuels).
- **Rituels** (D8 lien) : sorts qui sont en fait des rituels (durée longue, conditions astronomiques).
- **Recettes culinaires** : à compléter narrativement.
- **Recettes médicinales** : à compléter narrativement.

#### D. Application par mode arbitre

- **MJ humain** : peut surcharger les durées, ingrédients alternatifs, créer des recettes custom.
- **MJ LLM** : applique les procédures du catalogue, propose des recettes cohérentes pour les ambiguïtés.
- **MJ auto** : strict — applique les recettes telles que cataloguées, refuse les ingrédients manquants.

**Statut** : 🟢 acté

---

## Partie E — Champignons, plantes et ressources naturelles

### R-10.8 — Catalogue de champignons

À importer depuis [regles-papier/extracted/infos/champignons-toxiques.md](regles-papier/extracted/infos/champignons-toxiques.md) (~14 espèces). Modèle proche des poisons R-9.35 mais distingue :
- **Champignons toxiques** = source de poison (lien `poison` R-9.35)
- **Champignons comestibles** = nourriture
- **Champignons hallucinogènes** = altération mentale (état R-9.27)
- **Champignons médicinaux** = ingrédient potion R-10.7

**Statut** : 🟡 import à faire

---

## Partie F — Crafting et artisanat

### R-10.9 — Compétences de crafting et leurs domaines

À cataloguer (lien D5) :

| Compétence | Domaine d'items |
|---|---|
| Forge | armes métalliques, armures métalliques, outils métal |
| Couture / Tannerie | armures cuir/textile, vêtements |
| Alchimie | potions, poisons synthétiques |
| Cuisine | nourriture, boissons |
| Menuiserie / Charpenterie | outils bois, structures, hampes d'armes |
| Bijouterie | bijoux, items magiques (support) |
| Maroquinerie | sacs, sacoches, ceintures, harnais |
| Vannerie | paniers, contenants tressés |
| Médecine | premiers secours, soins basiques |
| Magie (école Enchantement, D8) | items magiques (enchantement) |

**Statut** : 🟡 résolu structurellement par R-10.21

### R-10.21 — Mécanique de crafting (jet `craft_check` standard + extensions)

**Décision Q-D10.4 (2026-04-25)** : choix D — hybride règle vivante : standard + extensions + mode arbitre.

#### A. Jet `craft_check` standard

Mécanique de base, applicable à toute `creation_procedure` (R-10.20) :

```text
Aptitude (Intelligence / Dextérité / Force selon métier)
+ Compétence (Forge / Alchimie / Couture / Cuisine / Médecine / Magie / etc.)
+ Σ Spécialisations pertinentes
contre la `difficulty` déclarée par la procédure
```

Chaque réussite contribue à la qualité du résultat (cf. `output_metadata.quality_distribution`).

#### B. Extensions optionnelles par procédure

Une procédure peut déclarer dans son `craft_check` :

| Extension | Effet |
|---|---|
| `multi_check_required: <N>` | Plusieurs jets cumulés sur N étapes (ex. travail réparti sur N jours pour Forge). Échec d'une étape = recommencer celle-là, pas tout. |
| `moon_phase: <enum>` | Jet impossible hors de la phase lunaire requise (ex. pleine lune pour Calme Loup-Garou). |
| `astronomical_window: <range>` | Plage horaire stricte (ex. minuit à aube pour potions Soin lunaires). |
| `sacred_location: <enum>` | Lieu requis (cercle de pierres, autel, eau bénite). |
| `assistant_required: <bool>` | Aide d'un compagnon requise (jet d'aide D9 R-9.40 #4). |
| `divine_invocation: <ref>` | Prière/invocation à une divinité (300 prières pour Soin paper). Personnage athée ne peut pas. |
| `multi_dose_increment: <int>` | +N difficulté par dose supplémentaire produite en un seul jet (Soin paper +1/dose). |

#### C. Conséquences d'échec

Selon la `failure_consequences` déclarée par la procédure :

- **Échec mineur** : ingrédients perdus, pas d'item produit, pas de conséquence négative.
- **Échec critique** : ingrédients perdus + item raté inutilisable + effet secondaire (potion empoisonnée, arme cassée, sort dévié).
- **Mode `arcade`** : échec mineur uniquement, ingrédients récupérables partiellement.
- **Mode `réaliste`** : échec critique possible sur fumble (D1 R-1.34).

#### D. Compétences canoniques de crafting (table à compléter via D5)

| Compétence | Aptitude par défaut | Domaine | Sous-types typiques |
|---|---|---|---|
| Forge | Force | Métal | armes métalliques, armures métalliques, outils |
| Couture / Tannerie | Dextérité | Tissu, cuir | armures cuir/textile, vêtements, sacoches |
| Alchimie | Intelligence | Liquide, mixture | potions, poisons synthétiques, baumes |
| Cuisine | Dextérité ou Intelligence | Nourriture | repas, conserves, festins |
| Menuiserie / Charpenterie | Force ou Dextérité | Bois | meubles, outils bois, hampes d'armes |
| Bijouterie | Dextérité | Métaux précieux, gemmes | bijoux, supports d'enchantement |
| Maroquinerie | Dextérité | Cuir | sacs, sacoches, ceintures, harnais |
| Vannerie | Dextérité | Tressage | paniers, contenants tressés |
| Médecine | Intelligence | Soins, baumes | premiers secours, baumes médicinaux |
| Magie (école Enchantement, D8) | Intelligence | Magique | items magiques, talismans |

Cette table est éditable et extensible. Spécialisations possibles (« Forge d'armes elfiques », « Alchimie de potions de soin »).

#### E. Application par mode arbitre

- **MJ humain** : peut surcharger n'importe quelle extension, autoriser une recette improvisée.
- **MJ LLM** : applique strict les `craft_check` du catalogue, propose des recettes cohérentes pour les manquants.
- **MJ auto** : strict — applique les règles du catalogue, refuse les actions non documentées.

**Statut** : 🟢 acté

---

## Partie G — Encombrement et inventaire

### R-10.10 — Encombrement et capacité de port (rappel D2 + D9 R-9.32 D)

**Rappel** :
- Capacité sans pénalité = `5 kg × Force`.
- Au-delà : +1 FV par tranche de 5 kg supplémentaires.
- Le poids des items est intégré au catalogue (`weight_kg`).
- Multiplicateurs raciaux pour les armures (R-10.4).

### R-10.11 — Containers et stockage — résolu par R-10.23

### R-10.23 — Containers, items spéciaux, stockage hors-personnage (3 modes)

**Décision Q-D10.6 (2026-04-25)** : choix D — hybride règle vivante : modes activables par campagne.

#### A. Trois modes par campagne

```yaml
campaign:
  inventory_mode: arcade | standard | realistic
```

- **`arcade`** : inventaire plat. Tous les items dans une liste personnelle. Poids cumulé pour le calcul d'encombrement (R-10.10) mais aucune notion de container. Simple, rapide.
- **`standard`** : containers à plat avec capacité. Items rangés dans un container (sacoche, sac à dos, ceinture). Pas d'arborescence, pas d'items magiques de stockage.
- **`realistic`** : arborescence complète + items magiques + stockage hors-personnage avec accès narratif.

#### B. Item-type `container` (extension R-9.30)

```yaml
container:
  id: <slug>
  name: <string localisé>
  category: pouch | belt | backpack | satchel | chest | trunk | vault | extradimensional
  capacity_kg: <float>                  # capacité en poids
  capacity_volume_l: <float | null>     # volume en litres (optionnel)
  capacity_items: <int | null>          # nombre max d'items distincts (optionnel)
  weight_self_kg: <float>               # poids du container vide
  contents: [<item_instance>]
  parent_container: <container_id | null>  # container parent (mode `realistic`)
  weight_reduction_factor: <float>       # ex. 0.5 = sac qui réduit le poids des items contenus de moitié
  extradimensional: bool                 # si true, items dedans ne pèsent pas dans l'inventaire global
  locked: bool
  lock_difficulty: <int>                 # difficulté pour crocheter
  bonded_to: <character_id | null>       # bourse magique liée à un porteur
  enchantments: [<enchantment_id>]       # cf. R-10.22
```

#### C. Containers de base

| Container | Capacité (kg) | Poids vide (kg) | Catégorie |
|---|---:|---:|---|
| Bourse | 1 | 0.05 | pouch |
| Sacoche | 5 | 0.5 | satchel |
| Ceinture (avec dragonnes) | 3 | 0.3 | belt |
| Sac à dos | 15 | 1.5 | backpack |
| Coffre (taille S) | 30 | 5 | chest |
| Coffre (taille M) | 80 | 12 | chest |
| Coffre (taille L) | 200 | 25 | trunk |
| Voûte (banque/donjon) | illimité | — | vault |

#### D. Items magiques de stockage

| Item | Effet | Source |
|---|---|---|
| **Sac sans fond** | `extradimensional: true` — items dedans ne pèsent rien dans l'inventaire global. Capacité « infinie » mais avec limites narratives (taille de l'ouverture). | Item rare, lien D8 école Altération |
| **Bourse de réduction** | `weight_reduction_factor: 0.5` — divise par 2 le poids des items contenus. | Enchantement |
| **Sac de Khazgar** | Combine les deux : extradimensional + verrou magique. | Légendaire |
| **Coffre lié** | `bonded_to: <character>` — seul le porteur peut l'ouvrir. | Enchantement |

#### E. Arborescence (mode `realistic`)

- Containers peuvent être imbriqués (`parent_container`).
- Profondeur max : 3 niveaux par défaut (perso → sac à dos → sacoche → bourse).
- Configurable par campagne.

#### F. Stockage hors-personnage

- Containers placés dans le monde (coffre dans une chambre, voûte dans une banque).
- Accès narratif : le perso doit y aller physiquement (lien D12 géographie).
- Sécurité : verrouillage (`locked`), gardiens, pièges (lien backlog Q-D9.X éventuel).
- Banques narratives : structure du monde fictif (D12), pas de mécanique de compte ; juste un coffre garanti par une institution.

#### G. Calcul d'encombrement avec containers

- Mode `arcade` : `poids_total = Σ poids_items`.
- Mode `standard` : `poids_total = Σ (poids_container_vide + poids_items_dedans × weight_reduction_factor)`.
- Mode `realistic` : récursif sur l'arborescence. Items dans containers `extradimensional: true` exclus du calcul global.

L'encombrement total nourrit le système de pénalité de FV (R-10.10 / D2).

#### H. Application par mode arbitre

- **MJ humain** : peut surcharger les capacités narrativement, autoriser des arrangements non standards.
- **MJ LLM** : applique le mode de campagne, propose des arrangements cohérents.
- **MJ auto** : strict — applique le mode de campagne, refuse les transgressions de capacité.

**Statut** : 🟢 acté

---

## Partie H — Items magiques et légendaires

### R-10.12 — Items magiques (enchantement) — résolu par R-10.22

### R-10.22 — Couche `enchantments` cumulative sur tout item

**Décision Q-D10.5 (2026-04-25)** : choix D — hybride règle vivante : couche `enchantments` cumulative.

#### A. Extension du modèle item-instance

Tout `item_instance` (R-9.30) peut porter une liste `enchantments` :

```yaml
item_instance:
  ...
  enchantments:
    - id: <enchantment_id>
      name: <string localisé>
      type: passive | active | charged | reactive | conditional
      effect: <effect_definition>
      charges:
        max: <int | null>            # null = infini
        current: <int>
        recharge: <expr | null>      # ex. "+1 / jour", "à la pleine lune"
      activation:
        action_cost: <DT | null>
        verbal_required: bool
        somatic_required: bool
        cost_energy: <int>
      identified: bool                # le porteur a-t-il identifié l'enchantement ?
      cursed: bool                    # malédiction cachée ?
      created_by:
        procedure: <ref creation_procedure>
        crafter: <character_id>
        date: <timestamp>
      bonded_to: <character_id | null> # si lié à un porteur spécifique
```

#### B. Types d'enchantements

- **`passive`** : effet permanent tant que l'item est porté/équipé. Ex. `+1 dégâts`, `résistance au feu 20%`, `vision nocturne`.
- **`active`** : capacité activable par le porteur. Ex. `lancer Boule de feu 1×/jour`, `rendre invisible 1 minute`.
- **`charged`** : nombre limité d'usages, recharge selon règle. Ex. `5 charges de Soin majeur, recharge 1/jour à l'aube`.
- **`reactive`** : déclenché automatiquement par condition. Ex. `si Vitalité ≤ 25%, applique Bouclier 10 PV`, `si attaqué par mort-vivant, +2 dégâts`.
- **`conditional`** : effet variable selon contexte. Ex. `+2 dégâts contre orcs`, `lumière en obscurité`, `parler langue elfique en présence d'elfes`.

#### C. Cumul d'enchantements

- Un item peut porter plusieurs enchantements.
- Les `passive` cumulent leurs modificateurs (additif, R-1.36).
- Les `charged` ont des charges indépendantes.
- Les `reactive` se déclenchent indépendamment selon leurs conditions.
- Limite par item : configurable par campagne (`max_enchantments_per_item`, défaut illimité, MJ peut limiter par narration).

#### D. Création d'enchantement (lien R-10.20)

L'enchantement est un cas particulier de `creation_procedure` :
- `category: enchantment`
- `output_type: enchanted_object` (ou modification de l'item existant)
- `craft_check.skill: Magie + école Enchantement` (D8)
- Conditions : prérequis énergétiques, ingrédients magiques (gemmes, métaux précieux), parfois sacrifice ou ritual long.

L'enchantement peut être :
- **Appliqué à un item neuf** : la procédure crée un item complet enchanté.
- **Appliqué à un item existant** : la procédure ajoute un enchantement à un item normal (épée → épée +1).

#### E. Retrait / dissipation

- **Dissipation** : sort de Dispel/Anti-magie (école Abjuration) peut désactiver temporairement.
- **Désenchantement permanent** : `creation_procedure` inverse, restitue partiellement les ingrédients, supprime l'enchantement.
- **Destruction de l'item** : tous les enchantements sont perdus.
- **Items maudits** : enchantement impossible à retirer sans procédure spéciale (cf. lexique pour les sorts associés).

#### F. Identification

- Un item enchanté non identifié apparaît comme un item normal.
- Pour identifier : sort de Détection / Analyse (école Divination D8), rituel d'identification (`creation_procedure` dédiée), ou test direct (porter l'item et observer les effets).
- Atouts pertinents (à vérifier en D5/lexique) : `Analyse` (lit les niveaux d'autrui), peut être étendu aux items.

#### G. Application par mode arbitre

- **MJ humain** : peut créer des enchantements custom à la volée, autoriser des cumuls non standards.
- **MJ LLM** : applique les enchantements catalogués, propose des effets cohérents pour les ambiguïtés.
- **MJ auto** : strict — applique chaque enchantement selon son catalogue, refuse les surcharges.

**Statut** : 🟢 acté

### R-10.13 — Items légendaires / artefacts — résolu par R-10.28

### R-10.28 — Items légendaires / artefacts (4 archétypes + couches + quêtes)

**Décision Q-D10.11 (2026-04-25)** : choix D — hybride règle vivante : 4 archétypes + couches optionnelles + lien D12 quêtes. **Clôt le backlog Q-D9.51**.

#### A. Quatre archétypes canoniques

##### 1. `legendary_artifact`
- Item ancien, unique, à la provenance documentée.
- Pouvoir distinctif (ex. Excalibur tranche tout métal, Mjolnir n'est soulevable que par les dignes).
- Rareté `legendaire` (R-9.30).
- Souvent au centre d'une quête (D12).

##### 2. `intelligent_weapon` (Q-D9.51 backlog clos)
- Volonté propre (`intelligence`, `charisma`, `wisdom`, `volonte`).
- Communication avec le porteur (`telepathic` | `verbal_audible_to_holder` | `dreams` | `signs`).
- Alignement / objectif propre (peut refuser de servir).
- Mécanique de soumission : si le porteur veut une action contraire à la volonté de l'arme, jet d'opposition Volonté.
- Évolution avec le porteur si lien fort.

##### 3. `holy_relic`
- Relique divine, bénie par une divinité spécifique (lien D8 Magie blanche / D12 religion).
- Pouvoirs uniquement actifs pour les fidèles de la divinité ou les âmes pures.
- Souvent inactif aux mains d'un infidèle.
- Réquisitionnable par l'Église (impact narratif D12).

##### 4. `cursed_item`
- Malédiction cachée ou apparente.
- Effets négatifs (drain, possession, attraction de monstres).
- Difficile à retirer (sort de Dispel niveau supérieur, rituel d'exorcisme, sacrifice).
- Identification : non identifié par défaut (R-10.22 F).

#### B. Couches optionnelles cumulables

Tout item (légendaire ou non) peut porter ces couches :

```yaml
item_instance:
  ...
  legendary_layers:
    history:
      origin: <string narratif>
      previous_owners: [<character_id>]
      legend: <string>
      famous_deeds: [<string>]
    intelligence:
      cha: <int>
      volonte: <int>
      sagesse: <int>
      personality: <string>
      alignment: <string>
      goals: [<string>]
      communication_mode: telepathic | verbal | dreams | signs
    attunement:
      requirements:
        bloodline: <string | null>
        alignment: <string | null>
        min_level: <int>
        deity: <ref | null>
        specific_class: <ref | null>
      bonded_to: <character_id | null>
      bond_strength: <int>           # 0-10
    evolution:
      grows_with_holder: bool
      level_milestones:
        - level: 5
          unlocks: [<enchantment_id>]
        - level: 10
          unlocks: [<enchantment_id>]
    divine_blessing:
      deity: <ref>
      requires_faithful: bool
      banished_by: [<deity_ref>]
    curse:
      visible: bool
      effect: <effect_definition>
      removal_difficulty: <int>      # difficulté du rituel d'exorcisme
      attraction:                     # attire certains événements négatifs
        monsters: [<creature_id>]
        misfortunes: [<event>]
```

#### C. Acquisition et identification

- **Quête (D12 anticipation)** : la plupart des items légendaires sont liés à une quête (récupération, validation digne, sacrifice).
- **Loot** : peut tomber d'un boss légendaire (rare).
- **Don narratif** : un PNJ majeur peut offrir un artefact pour des raisons narratives.
- **Identification** : items légendaires non identifiés par défaut. Identification via :
  - Sort de Divination niveau ≥ tier de l'item.
  - Rituel d'identification (`creation_procedure` dédiée).
  - Compagnonnage (porter l'item pendant N temps narratif révèle progressivement les capacités).

#### D. Limitation par campagne

- Le MJ peut limiter le nombre d'items légendaires actifs par campagne (`max_legendary_per_party`, par défaut illimité).
- Items archivés (perdus dans une quête, brisés narrativement) restent dans l'historique.

#### E. Application par mode arbitre

- **MJ humain** : crée librement des artefacts custom, autorise des cumuls de couches inhabituels.
- **MJ LLM** : applique les archétypes catalogués, propose des artefacts cohérents avec la lore (D12).
- **MJ auto** : strict — applique le catalogue, refuse les cumuls non documentés.

**Statut** : 🟢 acté

---

## Partie I — Pillage, loot, réparation, péremption

### R-10.14 — Pillage et loot — résolu par R-10.26

### R-10.26 — Loot et pillage (3 modes + tables vivantes)

**Décision Q-D10.9 (2026-04-25)** : choix D — hybride règle vivante : 3 modes + tables vivantes.

#### A. Trois modes par campagne

```yaml
campaign:
  loot_mode: arcade | standard | realistic
```

- **`arcade`** : loot minimaliste fixe. Ennemis lâchent monnaie + 0–1 item de base selon niveau.
- **`standard`** : table de loot par type de PNJ (basée sur le template D6 Q-D6.4).
- **`realistic`** : table niveau × classe + dispersion narrative (items perdus en fuite, items détruits par dégâts).

#### B. Item-type `loot_table` (extension R-9.30)

```yaml
loot_table:
  id: <slug>
  name: <string localisé>
  applies_to: pnj_template | location | event
  context_filter:                       # quand cette table s'applique
    pnj_template_id: <ref | null>
    pnj_class: <ref | null>
    pnj_level_range: [<min>, <max>]
    location_id: <ref | null>
  entries:
    - item_id: <ref>
      probability: <0..1>               # chance d'apparition par ennemi
      quantity: { min: <int>, max: <int> }
      always: bool                       # toujours présent
    - currency:
        po: { min: <int>, max: <int> }
        pa: { min: <int>, max: <int> }
        pb: { min: <int>, max: <int> }
        pc: { min: <int>, max: <int> }
  loot_quality_modifier: <expr>          # ex. boss = ×2, élite = ×1.5
```

#### C. Mécanique de loot

##### À la mort du PNJ (mode `standard` et `realistic`)
1. Le moteur identifie la `loot_table` applicable (template, classe, contexte).
2. Pour chaque entrée : roule `random < probability`. Si succès, ajoute l'item (quantité aléatoire dans range).
3. Items toujours présents (`always: true`) sont ajoutés systématiquement (ex. arme équipée).
4. Génère la monnaie (Po/Pa/Pb/Pc selon range).

##### À l'exploration (coffres, caches)
- `loot_table.applies_to: location` ou `event`.
- Roulé une fois à la génération du lieu, persisté.
- Pillable une fois (sauf re-spawn narratif).

##### Dispersion (mode `realistic` uniquement)
- Si le PNJ fuit avant d'être tué : loot **non récupérable** (le PNJ part avec).
- Si le PNJ subit un coup létal massif (cassure tête/gorge sévère) : items en main `cassés` ou `lost` selon dispersion narrative.
- Items magiques (R-10.22) résistent mieux à la dispersion.

#### D. Identification après loot

- Items magiques non identifiés (R-10.22 F) : restent inconnus jusqu'à identification.
- Items normaux : identifiés automatiquement.

#### E. Loot et fin de combat (rappel R-9.37)

- Loot accessible après combat seulement si conditions de fin remplies (R-9.37 E `all_hostiles_neutralized`).
- En cas de fuite (R-9.37 condition `pj_declared_flee`), pas de loot des ennemis (PJ n'a pas le temps).
- Loot manuel par MJ humain possible à tout moment (mode arbitre).

#### F. Application par mode arbitre

- **MJ humain** : peut surcharger toute table, ajouter du loot narratif unique.
- **MJ LLM** : applique les tables, propose un loot cohérent avec le PNJ.
- **MJ auto** : strict — applique les tables sans interprétation.

**Catalogue vivant** : `loot_table` éditable, ajout de templates par PNJ/lieu/événement.

**Statut** : 🟢 acté

### R-10.15 — Réparation (rappel R-9.26) — résolu par R-10.24

### R-10.24 — Réparation (3 paliers + procédure + atouts)

**Décision Q-D10.7 (2026-04-25)** : choix D — hybride règle vivante : 3 paliers + procédural + atouts.

#### A. Trois paliers de dégradation

Selon `durability.current / durability.max` :

| Palier | Pourcentage | État | Effets |
|---|---|---|---|
| **Intact** | 100% | sain | Pleine performance |
| **Entaillé** | 100% > X ≥ 50% | léger défaut | Performance −10% (cumulable) |
| **Endommagé** | 50% > X ≥ 10% | défaut majeur | Performance −30%, jets de toucher +1 difficulté |
| **Cassé** | < 10% ou 0 | inutilisable | Item ne fonctionne plus, doit être réparé ou remplacé |

Les pourcentages sont configurables par campagne. Les modes `arcade/standard/realistic` (R-9.26) modifient les seuils :
- `arcade` : pas de paliers, item toujours intact ou cassé en cas d'échec critique.
- `standard` : 2 paliers (intact / cassé après échec critique).
- `realistic` : 4 paliers complets ci-dessus.

#### B. Procédure de réparation (`creation_procedure` catégorie `repair`)

```yaml
creation_procedure:
  category: repair
  output_type: <item_type>            # type d'item ciblé
  craft_check:
    skill: <ref>                       # Forge/Couture/Alchimie selon item
    aptitude: <ref>                    # Force pour Forge, Dextérité pour Couture, etc.
    difficulty: <int>                  # selon palier
  duration:
    base: <duration>                   # selon palier
  ingredients:                         # selon palier (matériaux pour réparer)
    - id: <ingredient_id>
      quantity: <float>
  cost_pc:                             # coût alternatif si payé à un artisan
    by_palier:
      entaillé: <int>
      endommagé: <int>
      cassé: <int>
```

#### C. Coûts de référence (paramétrables)

| Palier | Coût (% prix neuf) | Temps (Forge/Forge) | Difficulté |
|---|---:|---|:---:|
| Entaillé → Intact | ~10% | 1 heure / point de durabilité | 6 |
| Endommagé → Intact | ~30% | 4 heures / point | 8 |
| Cassé → Intact | ~60% | 1 jour / point | 10 |
| Cassé → irréparable | — | — | — (selon item ou critique catastrophique) |

Réparation incrémentale possible : on peut réparer juste 1 ou 2 points sans aller jusqu'à intact.

#### D. Qui peut réparer

| Réparateur | Conditions |
|---|---|
| **Soi-même** | Compétence pertinente + outils basiques disponibles. Échec possible. |
| **Artisan PNJ (forgeron, tailleur, alchimiste)** | Paiement de la valeur fixée. Réussite quasi-garantie sauf cas exceptionnel. Délai selon ville et qualité de l'artisan. |
| **Compagnon de groupe** | Même règle que soi-même, applicable à la compétence du compagnon. |
| **Atout `Forge magique`** | Permet de réparer les items magiques sans dispel des enchantements. |
| **Atout `Bénédiction de l'objet`** | Réparation accélérée pour items consacrés. |

#### E. Items magiques

- Items enchantés (R-10.22) : la réparation simple peut **dissiper temporairement** un enchantement de couche `passive` ou `charged`. Pour préserver, requiert atout `Forge magique` ou rituel spécifique.
- Items légendaires : peuvent nécessiter des matériaux uniques (lien D12 quêtes).

#### F. Application par mode arbitre

- **MJ humain** : peut surcharger les coûts/délais selon la situation (forgeron de campagne vs maître artisan de capitale).
- **MJ LLM** : applique les coûts standard, propose des alternatives narratives.
- **MJ auto** : strict — applique le catalogue.

**Statut** : 🟢 acté

### R-10.16 — Péremption / dégradation passive — résolu par R-10.25

### R-10.25 — Péremption (3 modes par campagne)

**Décision Q-D10.8 (2026-04-25)** : choix D — hybride règle vivante : 3 modes par campagne.

#### A. Trois modes

```yaml
campaign:
  expiration_mode: arcade | standard | realistic
```

- **`arcade`** : aucune péremption. Tous les items restent intacts indéfiniment.
- **`standard`** : champ `expires_in` simple. Décompte automatique en temps narratif (heures/jours/mois). À expiration, l'item devient inutilisable.
- **`realistic`** : `expires_in` + conditions de conservation + qualité dégradante. Le moteur tracke chaque item périssable individuellement.

#### B. Extension de l'item-instance

```yaml
item_instance:
  ...
  expiration:
    duration: <duration | null>        # null = item non périssable
    started_at: <timestamp>            # timestamp narratif
    storage_requirements:              # conditions optimales (mode realistic)
      temperature: cold | cool | normal | warm
      humidity: dry | normal | humid
      container_required: <container_id | null>  # ex. flacon hermétique pour potion
      light_exposure: dark | shaded | normal
    quality_curve:                     # mode realistic
      fresh: [0, 0.5]                  # 0 → 50% du temps : pleine puissance
      stale: [0.5, 0.8]                # 50 → 80% : effet réduit
      spoiled: [0.8, 1.0]              # 80 → 100% : effet quasi nul
      expired: [1.0, ∞]                # > 100% : inutilisable ou nocif
    on_expiration: become_useless | become_harmful | become_compost
```

#### C. Catalogue de durées par catégorie d'item

| Catégorie | Durée par défaut | Mode |
|---|---|---|
| Pain frais | 3 jours | standard |
| Viande crue | 1 jour | standard |
| Viande fumée | 2 semaines | standard |
| Fromage | 1 mois | standard |
| Fruits frais | 1 semaine | standard |
| Conserve / salaison | 6 mois | standard |
| Eau de gourde | 2 jours | standard (devient stagnante) |
| Vin | 5 ans | standard |
| Potion de soin standard | 6 mois | standard |
| Potion de transformation | 1 an | standard |
| Antidote | 1 an | standard |
| Ingrédient sec (herbe, écorce) | 2 ans | standard |
| Ingrédient frais (fleur d'Onagre) | 1 semaine | standard |
| Munition | non périssable (sauf flèche enflammée) | — |
| Arme / armure | non périssable (mais durabilité R-9.26 / R-10.24) | — |
| Vêtement | non périssable | — |

#### D. Conditions de conservation (mode realistic)

Si les `storage_requirements` ne sont pas respectées, la durée d'expiration est **divisée** :
- Mauvaise température : ÷ 2
- Mauvaise humidité : ÷ 2
- Pas de container approprié : ÷ 3
- Exposition lumineuse incorrecte : ÷ 1.5

Multiplicateurs cumulatifs.

#### E. Effets à expiration

- **`become_useless`** : item ne fonctionne plus (potion ratée). Catégorie par défaut pour potions standards.
- **`become_harmful`** : item devient nocif (nourriture avariée → empoisonnement, lien R-9.35 poisons).
- **`become_compost`** : item devient inutile mais peut être recyclé (compost, peau dégradée → utilisable en bricolage).

#### F. Application par mode arbitre

- **MJ humain** : peut surcharger les durées et conditions narrativement.
- **MJ LLM** : applique le mode de campagne, notifie les expirations imminentes.
- **MJ auto** : strict — décompte automatique, applique les effets à expiration.

**Statut** : 🟢 acté

---

## Partie J — Vêtements civils et impact social

### R-10.17 — Vêtements civils — résolu par R-10.27

### R-10.27 — Vêtements civils (item-type `clothing`)

**Décision Q-D10.10 (2026-04-25)** : choix D — hybride règle vivante.

#### A. Item-type `clothing` (extension R-9.30)

```yaml
clothing:
  id: <slug>
  name: <string localisé>
  category: shirt | pants | dress | robe | cloak | hat | shoes | belt | underwear | accessory
  social_class: peasant | merchant | noble | clergy | military | criminal | exotic | foreign
  region_origin: <ref D12 | null>     # origine régionale stylistique
  concealment_capacity_kg: <float>     # capacité de dissimulation d'items en-dessous (armure ou autre)
  weather_protection:
    cold: <int>                         # 0 (aucun) à 5 (extrême)
    rain: <int>
    heat: <int>                         # vêtements légers protègent de la chaleur
  weight_kg: <float>
  price: { base_pc: <int>, rarity: <enum> }
  enchantments: [<enchantment_id>]      # vêtement enchanté possible (R-10.22)
  protection: { P: 0, E: 0, C: 0, T: 0 } # par défaut nul, sauf cuir souple basique
```

#### B. Impact social passif

Le `social_class` du vêtement modifie passivement les jets sociaux selon le contexte :

| Contexte | Vêtement adapté | Mismatch | Effet |
|---|---|---|---|
| Cour royale | `noble` ou `clergy` | `peasant` ou `criminal` | −2 dés Diplomatie / Étiquette |
| Auberge populaire | `peasant` ou `merchant` | `noble` | −1 dé Information / Persuasion (méfiance) |
| Temple | `clergy` ou `noble` | `criminal` | −2 dés Religion / Bénédiction |
| Quartier louche | `criminal` ou `peasant` | `noble` ou `clergy` | +1 dé Tentative d'agression contre soi (cible facile) |
| Voyage en pays étranger | `foreign` adapté | mismatch | −1 dé Diplomatie locale |

Le contexte est déterminé par le lieu (D12). Mode arbitre : MJ humain peut surcharger.

#### C. Dissimulation d'armure sous vêtements

Mécanique :
- Le vêtement a une `concealment_capacity_kg`.
- Un perso peut porter une armure légère sous un vêtement large (ex. cotte de mailles ≤ 5 kg sous une cape).
- Le moteur calcule : `armure_dissimulable = vêtement.concealment_capacity_kg`.
- Si l'armure dépasse cette capacité, elle est visible (l'armure passe à `concealed: false`).
- Atouts pertinents :
  - `Discrétion` (Hors-la-loi) : +50% à la `concealment_capacity_kg`.
  - `Pieds poilus` : non applicable.
  - `Couture habile` (à proposer si manquant) : +30% à la `concealment_capacity_kg` du vêtement créé.

Détection :
- Un observateur peut tenter `Perception + Vue + spécialisations` vs `Discrétion + Charisme + spécialisations` du porteur.
- Réussite = l'observateur voit l'armure dissimulée.
- Modificateurs : éclairage, distance, attention de l'observateur.

#### D. Protection climatique

`weather_protection` détermine la résistance aux conditions environnementales (lien D12) :
- Froid extrême sans `cold ≥ 4` → état `frozen` progressif (R-9.27 + R-9.35 effets sur Endurance).
- Chaleur extrême sans `heat ≥ 3` → état `dehydrated` / `exhausted`.
- Pluie sans `rain ≥ 2` → vêtements trempés, malus Discrétion (bruit), malus Mouvement.

#### E. Combat en vêtements civils

- Par défaut, `protection: { P: 0, E: 0, C: 0, T: 0 }`.
- Sauf vêtements de cuir souple basique (R-10.4 Cuir souple : 1/1/0/1) qui peuvent être considérés comme civils dans certaines régions (D12).
- Une armure portée par-dessus le vêtement civil applique normalement sa protection (R-9.14 layer system).

#### F. Application par mode arbitre

- **MJ humain** : peut surcharger l'impact social, autoriser des dissimulations exceptionnelles.
- **MJ LLM** : applique passivement l'impact social, propose des descriptions narratives.
- **MJ auto** : strict — applique le tableau de modificateurs.

**Statut** : 🟢 acté

### R-10.29 — Outils non-combat, instruments, livres, objets de voyage et de luxe

**Décision Q-D10.12 (2026-04-25)** : choix D — hybride règle vivante : famille + champs communs + champs spécifiques + bonus de jet.

#### A. Familles d'item-types

##### `tool` (outil d'artisanat)
```yaml
tool:
  category: forge | textile | alchemy | carpentry | jewelry | leatherwork | masonry | mining | farming
  provides_bonus_to: [<skill_id>]      # ex. ["forge"], ["alchimie"]
  quality_modifier: <int>               # ex. +1 dé / +0 (standard) / -1 (rouillé)
  required_for: [<creation_procedure_id>] # procédures qui exigent cet outil
  weight_kg: <float>
  price: { base_pc: <int> }
```

##### `instrument` (instrument de musique)
```yaml
instrument:
  family: string | wind | percussion | keyboard | voice
  type: <slug>                          # ex. luth, flûte, tambour, cornemuse
  provides_bonus_to: [<skill_id>]      # ex. ["musique", "chant"]
  difficulty_to_play: <int>             # difficulté pour utiliser correctement
  quality_modifier: <int>
  applicable_atouts: [<atout_id>]       # ex. Musique stimulante (Barde N2)
  weight_kg: <float>
  price: { base_pc: <int> }
```

##### `book` (livre, parchemin, manuscrit)
```yaml
book:
  category: novel | history | religious | scientific | grimoire | journal | document
  subject: <string>                     # ex. "Histoire de Cortéga", "Sorts d'Abjuration N1-N3"
  language: <ref>                       # langue (lien D5 langues / D12 cultures)
  level: <int>                          # niveau de complexité (lien apprentissage D5)
  pages: <int>
  provides_knowledge: <skill_or_atout>  # ex. permet d'apprendre tel sort, telle compétence
  reading_time: <duration>
  weight_kg: <float>
  price: { base_pc: <int> }
  rare: bool
```

###### Cas particulier : `grimoire`
- `book.category: grimoire`
- Contient des sorts (D8) accessibles par lecture + apprentissage.
- Lien D8 R-8.X (apprentissage de sort).
- `provides_knowledge: [<spell_id>]` liste les sorts disponibles.
- Peut être personnel (grimoire d'un magicien donné) ou public (manuel d'école).

##### `travel_gear` (équipement de voyage)
```yaml
travel_gear:
  category: rope | torch | tent | bedroll | waterskin | tinderbox | compass | map | cookware
  uses: <int | unlimited>               # nombre d'utilisations (torche = 1 utilisation × N heures)
  duration_per_use: <duration>          # ex. torche = 1 heure
  provides_capability: [<capability>]   # ex. "see_in_dark", "shelter_from_weather"
  weight_kg: <float>
  price: { base_pc: <int> }
```

##### `scientific_tool` (instrument scientifique)
```yaml
scientific_tool:
  category: alembic | balance | thermometer | lens | telescope | astrolabe
  provides_bonus_to: [<skill_id>]      # ex. ["alchimie"], ["astronomie"]
  precision_modifier: <int>             # ex. +1 dé Alchimie pour balance précise
  weight_kg: <float>
  price: { base_pc: <int> }
```

##### `luxury_item` (objet de luxe non-magique)
```yaml
luxury_item:
  category: jewelry | artwork | porcelain | silk | rare_textile | exotic_food | fine_wine
  social_value: <int>                   # +N à jets sociaux quand exhibé
  resell_value_pc: <int>
  weight_kg: <float>
  price: { base_pc: <int> }
  rare: bool
```

##### `document` (document officiel)
```yaml
document:
  category: letter_of_credit | treaty | contract | map | royal_decree | passport | wanted_poster
  issued_by: <faction_id | character_id>
  validity:
    region: <ref>
    expires_at: <timestamp | null>
  authority_level: <int>                # influence à jets d'autorité
  weight_kg: <float>
  price: { base_pc: <int> }
```

#### B. Bonus de jet via outils

Mécanique unifiée : si un perso utilise un outil pertinent et possède la compétence appropriée, le bonus de l'outil s'applique au jet :

```text
dés_finaux = aptitude + compétence + Σ spés + outil.quality_modifier (si applicable)
```

Restrictions :
- Si la procédure (R-10.20) `required_for` requiert un outil et qu'il manque → action improvisée +1 difficulté ou impossible selon catégorie.
- Outils à durabilité (R-9.26) peuvent se casser à l'usage selon le mode.

#### C. Catalogue de référence (initial, à étoffer)

| Item | Catégorie | Famille | Prix (Pc) | Bonus |
|---|---|---|---:|---|
| Corde (1 m) | rope | travel_gear | 3 | — |
| Torche | torch | travel_gear | 40 | provides "light_30m_radius" |
| Marteau de forgeron | forge | tool | ~150 | +1 Forge |
| Alambic basique | alembic | scientific_tool | ~500 | +1 Alchimie |
| Balance précise | balance | scientific_tool | ~300 | +1 Alchimie / Bijouterie |
| Luth | luth | instrument | ~600 | +1 Musique |
| Flûte | flûte | instrument | ~80 | +1 Musique |
| Bible / livre saint | religious | book | ~200 | +1 Religion / Bénédiction |
| Grimoire de niveau 1 | grimoire | book | ~1500 | apprentissage sorts N1 |
| Tente (2 personnes) | tent | travel_gear | ~400 | shelter_from_weather |
| Sac de couchage | bedroll | travel_gear | ~80 | comfort sleep |
| Gourde | waterskin | travel_gear | ~30 | 1 L d'eau |
| Bague d'argent (non-magique) | jewelry | luxury_item | ~800 | +1 Diplomatie en cour |

#### D. Application par mode arbitre

- **MJ humain** : peut créer des objets uniques, surcharger les bonus selon la situation.
- **MJ LLM** : applique les bonus standard, propose des outils cohérents avec la situation.
- **MJ auto** : strict — applique les bonus seulement si l'outil et la compétence sont présents.

**Statut** : 🟢 acté

---

## Partie L — Backlog D10 (champs ouverts à trancher ultérieurement)

> Cette partie regroupe les points pertinents identifiés mais **non tranchés** dans la session actuelle. Chaque point est un champ ouvert de décision (`Q-D10.X — 🟡 backlog`) avec source documentée.

### Q-D10.14 — 🟡 Catalogue d'armes complet : import effectif des 60+ entrées

**Contexte** : R-10.19 acte la stratégie. Le travail d'import lui-même reste à faire.

**Décision attendue** : exécuter l'import auto, traiter les ambiguïtés détectées (range, min_strength, area_attack, prix manquants).

### Q-D10.15 — 🟡 Catalogue de protections complet : import effectif

**Contexte** : R-10.4 schéma défini. Import des 4 catégories canoniques + multiplicateurs raciaux.

### Q-D10.16 — 🟡 Catalogue de potions complet : import + extension narrative

**Contexte** : 3 entrées web + 2 paper. Le catalogue legacy est minimal — extension nécessaire selon les besoins de la campagne.

### Q-D10.17 — 🟡 Catalogue de champignons : import + classification (toxique/comestible/médicinal/hallucinogène)

**Contexte** : 14 espèces dans champignons-toxiques.md. Lien R-9.35 poisons.

### Q-D10.18 — 🟡 Poids des pièces (Pc/Pb/Pa/Po) pour calcul d'encombrement

**Contexte** : R-10.18 D propose une hypothèse `1 Pc = 1 g, 1 Po = 10 g` mais à valider.

### Q-D10.19 — 🟡 Atouts de crafting manquants au lexique

**Contexte** : R-10.21 mentionne `Forge magique`, `Bénédiction de l'objet`, `Couture habile` — à proposer si manquants au lexique D4.

### Q-D10.20 — 🟡 Recettes culinaires et médicinales : à compléter narrativement

**Contexte** : R-10.20 prévoit ces sous-types mais le catalogue legacy ne les détaille pas.

### Q-D10.21 — 🟡 Marchands itinérants vs marchands fixes : disponibilité des items

**Contexte** : R-10.18 acte des prix fixes globaux mais la **disponibilité** des items (rare items hors capitales) n'est pas modélisée.

### Q-D10.22 — 🟡 Banques narratives détaillées (D12 anticipation)

**Contexte** : R-10.18 D exclut les banques mécaniques. Mais une institution comme « la Banque royale d'Adérand » peut avoir un rôle narratif (prêts, dépôts sécurisés, transferts).

### Q-D10.23 — 🟡 Items de troc / commerce non monétaire

**Contexte** : économie non monétaire (primitif) — sel, fourrures, esclaves (sombre), bétail. Lien D12.

### Q-D10.24 — 🟡 Récolte de matières premières (mining, herborisme, pêche, chasse)

**Contexte** : crafting requiert des ingrédients. La **récolte** elle-même (mining, gathering) n'est pas modélisée. Lien D5 compétences (Chasse, Pêche, Vannerie).

### Q-D10.25 — 🟡 Catalogue de PNJ artisans / vendeurs

**Contexte** : structure des PNJ vendeurs (forgeron, alchimiste, marchand général) — pas D6 PJ mais NPCs économiques. Lien D11 contrôle PNJ.

### Q-D10.26 — 🟡 Items contextuels (objets d'enquête, indices, MacGuffins)

**Contexte** : items qui font avancer la quête — clés magiques, parchemins de prophétie, gemmes-sceaux. Lien D12 quêtes.

### Q-D10.27 — 🟡 Items consommables modificateurs d'aptitudes (drogues, stimulants)

**Contexte** : R-9.42 backlog (Q-D9.42 drogues / alcool) — peut être complété ici. Stimulants temporaires (énergie, force, courage), narcotiques (douleur, sommeil).

### Q-D10.28 — 🟡 Items associés aux familiers / animaux / montures (selles spéciales, harnais magiques)

**Contexte** : R-9.43 mount + équipement équestre. À étendre pour familiers magiques.

---

## Partie M — Questions ouvertes

### ~~Q-D10.1~~ — Système monétaire ✅ **Tranché (2026-04-25)**

Choix A — modèle minimaliste legacy. Stockage interne en Pc (entier). Prix fixes globaux issus du legacy. Conversion automatique pour l'affichage. Aucune régionalisation, aucune devise étrangère, aucune marge marchande, aucune banque. Voir R-10.18 pour la mécanique.

### ~~Q-D10.2~~ — Stratégie d'import du catalogue d'armes ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : import auto + table d'ambiguïtés + édition admin. Voir R-10.19 pour la mécanique.

### ~~Q-D10.3~~ — Potion vs Rituel : méta-modèle ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : méta-modèle R-9.30 étendu avec item-type `creation_procedure` générique. Voir R-10.20 pour la mécanique.

### ~~Q-D10.4~~ — Crafting / artisanat ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : mécanique standard via R-10.20 `craft_check` + extensions optionnelles par procédure + mode arbitre. Voir R-10.21 pour la mécanique.

### ~~Q-D10.5~~ — Items magiques / enchantement ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : couche `enchantments` cumulative sur tout item. Voir R-10.22 pour la mécanique.

### ~~Q-D10.6~~ — Containers et stockage ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : modes activables par campagne (arcade/standard/réaliste). Voir R-10.23 pour la mécanique.

### ~~Q-D10.7~~ — Réparation des items ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : 3 paliers (entaillé/endommagé/cassé) + procédure R-10.20 + atouts. Voir R-10.24 pour la mécanique.

### ~~Q-D10.8~~ — Péremption / dégradation passive ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : 3 modes par campagne (arcade/standard/réaliste). Voir R-10.25 pour la mécanique.

### ~~Q-D10.9~~ — Pillage et loot ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : 3 modes + tables vivantes. Voir R-10.26 pour la mécanique.

### ~~Q-D10.10~~ — Vêtements civils ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : `clothing` complet (social_class, concealment, weather_protection). Voir R-10.27 pour la mécanique.

### ~~Q-D10.11~~ — Items légendaires / artefacts ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : 4 archétypes (`legendary_artifact`, `intelligent_weapon`, `holy_relic`, `cursed_item`) + couches optionnelles cumulables + lien D12 quêtes. Voir R-10.28 pour la mécanique. **Clôture du backlog Q-D9.51**.

### ~~Q-D10.12~~ — Outils non-combat, instruments, livres, etc. ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : famille d'item-types + champs communs + champs spécifiques + bonus de jet. Voir R-10.29 pour la mécanique.

### ~~Q-D10.13~~ — Bilan D10 ✅ **Tranché (2026-04-25)**

D10 verrouillé sur les 12 décisions architecturales. 15 entrées backlog Q-D10.14→28 (partie L) à dépiler ultérieurement (notamment imports effectifs des catalogues legacy + extensions narratives).
