# D11 — Contrôle PNJ (joueur / MJ humain / LLM / auto)

> Architecture du contrôle des PNJ : qui décide des actions d'un PNJ donné ? Comment formaliser le pattern "mode arbitre" récurrent (humain libre / LLM contextuel / auto strict) qui a structuré D1-D10 ? Bestiaire complet, IA tactique, personnalité PNJ pour LLM, hostilité dynamique, foules, animaux, créatures magiques. Pose les fondations du moteur multi-arbitre.

**Sources** :
- [site/includes/class/Npc.php](site/includes/class/Npc.php) — entité PNJ (extends Character, 370 lignes)
- [site/includes/managers/user/AddCharacterMan.php](site/includes/managers/user/AddCharacterMan.php) — `setRandom*` pour génération PNJ
- [site/includes/managers/user/FightAssistantMan.php](site/includes/managers/user/FightAssistantMan.php) — assistant combat existant
- [regles-papier/extracted/listes/bestiaire.md](regles-papier/extracted/listes/bestiaire.md) — bestiaire paper (1001 lignes, ~30 races et créatures détaillées)
- D6 Q-D6.4 — templates / archétypes / générateur PNJ cohérent par niveau (déjà acté)
- D7 R-7.14 — génération random PNJ (déjà acté)
- D9 R-9.28 — spawn PNJ en combat (déjà acté)
- D9 R-9.30 — méta-modèle item-type-classes (extensible à PNJ-types)
- D10 R-10.26 — loot tables liées aux PNJ

**Décisions amont structurantes** :
- **Pattern "mode arbitre" (récurrent D1-D10)** : humain libre / LLM contextuel / auto strict. Présent dans presque toutes les règles D9-D10. À formaliser ici comme couche transverse.
- **R-9.30** : méta-modèle item-type-classes (potentiellement extensible aux PNJ-types).
- **D6 Q-D6.4** : templates de PNJ avec génération par niveau cohérente.
- **D7 R-7.14** : génération random via `setRandom*` (gauss avec moyenne raciale + variance).
- **R-9.28** : spawn de PNJ en combat (3 voies : manuel/scripté/magique).
- **Méta-principe règles vivantes** (acté 2026-04-25) : tous les catalogues sont éditables, versionnés, avec migration.

---

## Partie A — Architecture du contrôle (Q-D11.1+)

### R-11.1 — Quatre contrôleurs possibles d'un PNJ

> Tout PNJ (Personnage Non Joueur) — incluant ennemis, alliés, neutres, animaux, créatures, foules — peut être contrôlé par exactement **un** des quatre contrôleurs suivants à un instant donné :

| Contrôleur | Description | Exemples |
|---|---|---|
| `player` | Un joueur humain (différent du joueur principal du PJ) | compagnon prêté à un autre joueur, familier d'un PJ contrôlé via délégation |
| `human_gm` | Le MJ humain de la session | tous les ennemis et PNJ majeurs en mode papier classique |
| `llm` | Un agent LLM (IA contextuelle) | PNJ secondaires quand le MJ veut déléguer pour fluidité |
| `auto` | Un script déterministe (IA tactique) | foules, créatures triviales, animaux non-sentients, mode test/CI |

Le contrôleur d'un PNJ peut **changer dynamiquement** en cours de session (le MJ humain peut prendre le contrôle d'un PNJ LLM, ou déléguer un PNJ humain à l'auto, etc.).

### R-11.2 — Statut PJ vs PNJ : flag mutable

Le flag `is_player_character` sur l'entité Character détermine si c'est un PJ ou un PNJ. **Mutable** : un PNJ peut devenir PJ (recrutement, possession), un PJ peut devenir PNJ (mort sans résurrection, captif transformé, abandon de joueur).

---

## Partie B — Bestiaire (catalogue de races/créatures non-PJ)

### R-11.3 — Bestiaire = R-9.30 méta-modèle étendu pour les races/créatures

Le bestiaire utilise R-9.30 méta-modèle avec item-type `creature` :

```yaml
creature:
  id: <slug>
  name: <string localisé>
  category: humanoid | beast | undead | construct | elemental | spirit | dragon | aberration | plant | ooze | celestial | fiend
  size: tiny | small | medium | large | huge | gargantuan
  
  # Stats raciales (cf. Npc.php, hérité de Character)
  vitality_base: <int>
  speed_factor_base: <int>
  will_factor_base: <int>
  category_xp: <int>                     # multiplicateur XP par niveau
  
  attribute_max:
    strength: <int>
    dexterity: <int>
    stamina: <int>
    aestheticism: <int>
    reflexes: <int>
    perception: <int>
    charisma: <int>
    intelligence: <int>
    empathy: <int>
  
  innate_atouts: [<atout_id>]            # atouts raciaux automatiques
  innate_handicaps: [<handicap_id>]
  resistances: [<resistance_def>]        # cf. D3 Q-D3.8 modèle normalisé
  
  natural_attacks: [<unarmed_attack_id>] # R-9.41 (griffes, morsure, queue)
  natural_armor:                         # R-9.14 layer `natural`
    P: <int>
    E: <int>
    C: <int>
    T: <int>
  
  speed_m_per_dt: <float>                # R-9.32 vitesse de base
  
  manipulators_count: <int>              # R-9.41 E (multi-membres : naga 6, octopode 8)
  
  intelligence_level: sentient | semi_sentient | instinctive | mindless
  language_capable: bool
  
  habitat: [<biome>]
  social_structure: solitary | pack | hive | tribal | civilized
  
  bestiary_description: <string narratif>
  
  metadata:
    source: paper | web | custom
    version: <int>
```

### R-11.4 — Catalogue à importer (1001 lignes paper)

Liste partielle (table des matières du bestiaire paper) :

Canidae (Gnolls), Centaure, Chat, Cheval, Chigr, Demi-elfe, Dryade, Elfe (de Nacre, des Bois, Sombre, Haut), Fantôme, Gnome, Gobelin, Hobbit, Homme Lézard, Homme Oiseau, Homme Rat, Humain, Khochigr, Khogr, Loup, Loup-garou, Nain, Ogre, Ondine, Orc, Squelette, Troll, Vampire.

Soit ~30 entrées principales. Import via R-10.19 stratégie (auto + ambiguïtés + édition admin).

**Statut** : 🟡 import à faire (Q-D11.X)

### R-11.5 — Distinction races (PJ-jouables) vs créatures (PNJ-only)

D3 a établi 33 races jouables. Le bestiaire contient des **races jouables** (réutilisables comme PJ) ET des **créatures non-jouables** (Squelette, Fantôme, animaux purs).

Champ `playable: bool` sur l'entrée `creature`. Si `false`, ne peut être instancié que comme PNJ.

---

## Partie C — Génération de PNJ (rappels D6/D7 + extensions D11)

### R-11.6 — Pipeline de génération PNJ (rappel)

D6 Q-D6.4 + D7 R-7.14 ont acté :
1. Sélection d'un template (race + classe + niveau).
2. Génération des stats par randGauss (moyenne raciale + variance par classe).
3. Application des atouts raciaux automatiques (R-6.4).
4. Distribution des points selon `category_xp × niveau`.
5. Équipement par défaut (lien R-10.26 loot tables).

Référence code : `Npc.php` + `AddCharacterMan::setRandom*`.

### R-11.7 — Templates de PNJ par contexte narratif

Extension D11 : un template peut spécifier un **contexte narratif** :

```yaml
pnj_template:
  id: <slug>
  base_creature: <ref creature>
  class: <ref class | null>
  level_range: [<min>, <max>]
  context: urban_guard | bandit | merchant | priest | apprentice_mage | ...
  default_controller: human_gm | llm | auto
  default_attitude: hostile | neutral | friendly | unknown
  default_personality: <ref personality | null>      # cf. R-11.X
  default_loot_table: <ref loot_table>
  default_dialogue_tree: <ref | null>
```

**Statut** : 🟡 partiellement résolu D6/D7, à étoffer ici

---

## Partie D — Personnalité PNJ (pour mode `llm`)

### R-11.8 — Profil de personnalité (consommé par le LLM)

Pour qu'un PNJ contrôlé par `llm` soit cohérent narrativement, il doit porter un **profil de personnalité** consommable par le LLM :

```yaml
personality_profile:
  id: <slug>
  archetype: aggressive | cautious | coward | fanatic | greedy | honorable | curious | cruel | compassionate | calculating
  motivations: [<string>]                # ex. "protéger sa famille", "trouver un trésor"
  fears: [<string>]
  values: [<string>]                     # ex. "honneur", "liberté"
  hostilities: [<faction_or_race>]       # qui le PNJ déteste a priori
  alliances: [<faction_or_race>]         # qui le PNJ apprécie a priori
  speech_style: formal | colloquial | crude | poetic | terse
  emotional_baseline: calm | nervous | angry | melancholic | jovial
  intelligence_proxy:                    # comment le PNJ raisonne
    tactical_level: low | medium | high
    risk_tolerance: low | medium | high
    deception_skill: low | medium | high
```

Ce profil est injecté dans le prompt système du LLM lorsqu'il prend les décisions du PNJ.

---

## Partie E — IA tactique (pour mode `auto`)

### R-11.9 — Arbre de décision tactique pour PNJ `auto`

Pour qu'un PNJ contrôlé par `auto` agisse rationnellement en combat sans LLM, il suit un **arbre de décision tactique** déterministe :

```yaml
tactical_ai:
  id: <slug>
  archetype: brute | skirmisher | ranged | caster | support | summoner | trickster
  action_priorities:                     # ordonnées
    - condition: <expr>                  # ex. "self.vitality < 25%"
      action: flee | heal_self | summon_help | continue
    - condition: <expr>
      action: <action>
  target_priorities:
    - <expr>                             # ex. "lowest_vitality_enemy", "caster_first", "highest_threat"
  preferred_actions: [<action_id>]
  forbidden_actions: [<action_id>]       # ex. créature instinctive ne peut pas négocier
```

Ce script est consommé par l'engine combat (R-9.22 timeline) pour déterminer la prochaine action.

---

## Partie F — Hostilité dynamique

### R-11.10 — Attitude d'un PNJ (mutable)

```yaml
pnj_state:
  attitude: hostile | wary | neutral | friendly | allied
  attitude_modifiers:                    # situation-aware
    - source: <event_id>
      delta: <int>                       # ex. "PJ a sauvé la fille du PNJ" → +30
      duration: <duration | permanent>
```

Mécanique :
- Charme magique (D8) → attitude → `friendly` ou `dominated` temporairement.
- Intimidation (compétence) → attitude → `wary` ou rend une action (`surrender`).
- Soudoiement (monnaie) → modifie l'attitude proportionnellement à la somme.
- Action des PJ → influence narrativement.

**Statut** : 🟡 mécanique précise à valider (Q-D11.X)

---

## Partie G — Foules et masses (lien backlog Q-D9.39)

### R-11.11 — Item-type `crowd` (foule abstraite)

Pour gérer les masses (champs de bataille, émeutes urbaines) sans modéliser chaque entité :

```yaml
crowd:
  id: <slug>
  composition: { <creature_id>: <count> }   # ex. {humain: 50, garde: 5}
  size: <int>                                # total
  morale: <int>                              # 0-100, baisse face aux pertes
  cohesion: <int>                            # 0-100, baisse en panique
  aggregate_stats:                           # stats moyennes pondérées
    vitality_total: <int>
    attack_dice_pool: <int>
  break_threshold: <int>                     # % de pertes avant débandade
  controller: human_gm | llm | auto
```

**Statut** : 🟡 résout backlog Q-D9.39 (combat de masse)

---

## Partie H — Animaux non-sentients

### R-11.12 — Item-type `creature` avec `intelligence_level: instinctive`

Animaux non-sentients (chien, cheval, vautour, ours) :
- `intelligence_level: instinctive`
- Contrôle par défaut : `auto` avec `tactical_ai` simple basé sur l'instinct (fight/flight/feed).
- Domesticables → peuvent être contrôlés par `player` (animal de compagnie, monture).
- Réagissent aux ordres de leur maître (lien `bond_strength`).

**Statut** : 🟡 mécanique de domestication à valider

---

## Partie I — Familiers (lien D8 + backlog Q-D9.47)

### R-11.13 — Familier = PNJ allié contrôlable par le PJ magicien

Le familier (atout permanent magicien D8) est un PNJ avec :
- `controller: player` (le magicien qui l'a) par défaut, peut basculer `auto` si le magicien fait autre chose.
- Communication mentale avec le maître (lien D8 école Magie blanche / Enchantement).
- Initiative liée mais distincte (cf. backlog Q-D9.47).

**Statut** : 🟡 résout backlog Q-D9.47

---

## Partie J — Créatures magiques / surnaturelles

### R-11.14 — Sous-types `creature` magiques

- `undead` : squelette, fantôme, vampire, zombie. Souvent immune à mort biologique (R-9.17 atout `Jusqu'à la mort` D9 R-9.13).
- `spirit` : esprit éthéré (lien backlog Q-D9.40 incorporel).
- `elemental` : feu, eau, terre, air. Sorts d'Élémentaliste D8.
- `construct` : automate, golem. Pas d'âme, immune à charme/peur.
- `dragon` : créature légendaire. Lien Q-D9.38 (multi-attaques).
- `celestial` / `fiend` : entités divines/démoniaques. Pouvoirs hors normes.

---

### R-11.15 — Architecture du contrôle PNJ (hiérarchie + bascule + fallback + audit)

**Décision Q-D11.1 (2026-04-25)** : choix D — hybride règle vivante.

#### A. Hiérarchie d'assignation par défaut

Un PNJ reçoit son contrôleur via une cascade hiérarchique. Le premier niveau qui définit un contrôleur l'emporte ; sinon, on remonte au niveau supérieur.

```yaml
default_controller_resolution:
  1_individual: pnj.controller             # surcharge individuelle (priorité max)
  2_template:  pnj_template.default_controller  # par template (R-11.7)
  3_category:  category_default            # par catégorie (humanoid/beast/undead/etc.)
  4_scene:     scene.default_controller    # par scène/encounter
  5_campaign:  campaign.default_controller # défaut de campagne (priorité min)
```

Exemple : campagne en mode `human_gm`. Une scène spécifique `embuscade_orcs` règle `default_controller: auto`. Un orc lieutenant a un template avec `default_controller: llm`. Tous les orcs simples → `auto` (héritent de la scène). Lieutenant → `llm` (template). Un orc unique avec `controller: human_gm` → MJ humain (surcharge individuelle).

#### B. Bascule dynamique en cours de session

À tout moment, le contrôle d'un PNJ peut changer pour les raisons suivantes :

##### Bascule manuelle (par MJ humain)
- Le MJ humain peut basculer **n'importe quel PNJ** vers n'importe quel contrôleur via l'interface.
- L'historique de la bascule est tracé (cf. D).

##### Bascule par règle automatique
- **Vitalité critique** : un PNJ `auto` peut basculer `llm` quand sa vitalité descend sous un seuil (décisions complexes : fuir ? appeler renforts ? négocier reddition ?).
- **Charme/Domination** : un PNJ qui devient `dominated` (R-9.27) bascule sur le contrôleur du sort lanceur (souvent `player` du PJ magicien).
- **Mort/KO** : un PNJ KO/mort passe à `auto` désactivé (pas d'action possible).
- **Reddition acceptée** (R-9.44) : un PNJ surrendered bascule à `human_gm` ou `llm` pour interrogatoire/négociation.

##### Bascule narrative (par déclenchement scénarisé)
- Une rencontre peut prédéfinir des bascules : « si le boss tombe à 50% vitalité, ses sbires basculent llm pour proposer la reddition ».

#### C. Fallback en cas d'indisponibilité

Cascade de fallback automatique si un contrôleur n'est pas disponible :

```text
player indisponible → human_gm → llm → auto
human_gm indisponible (MJ aux toilettes) → llm → auto
llm indisponible (réseau down, quota épuisé) → human_gm → auto
auto toujours disponible (script local)
```

Notification au MJ humain quand un fallback s'est produit. Le MJ peut restaurer manuellement le contrôleur initial dès qu'il redevient disponible.

#### D. Audit / historique d'assignations

Chaque changement de contrôleur est tracé :

```yaml
controller_change_log:
  - timestamp: <datetime>
    pnj_id: <ref>
    from: <controller>
    to: <controller>
    reason: manual_mj | auto_rule | fallback | scenario_trigger | charm_effect | ...
    triggered_by: <character_id | rule_id | system>
    note: <string>
```

L'historique est consultable pour audit, debug, narration post-session.

#### E. Application par mode arbitre

- **MJ humain** : libre, peut surcharger toutes les bascules, ignorer les règles automatiques.
- **MJ LLM** : applique les règles de bascule, propose des bascules narratives quand pertinent.
- **MJ auto** : applique strict la hiérarchie + règles automatiques + fallback.

#### F. Exemples concrets

**Scénario 1** : combat de base, 5 gobelins (auto) + 1 chef gobelin (llm). Au cours du combat, le chef tombe à 30% vitalité → règle automatique bascule chef vers `llm` (déjà llm, donc no-op, mais le LLM reçoit un nouveau contexte « chef en danger »). Si LLM down → fallback `auto` qui applique la priorité « heal_self » de son `tactical_ai`.

**Scénario 2** : compagnon d'un PJ (player) tombe KO. Le contrôle reste `player` (le compagnon n'est pas mort, juste KO), mais aucune action n'est possible jusqu'au réveil.

**Scénario 3** : sort de Charme (D8) lancé par PJ magicien sur un PNJ ennemi `human_gm`. Pendant la durée du sort, le PNJ bascule `player` (le joueur du magicien le contrôle). Sort dissipé → retour à `human_gm`.

**Statut** : 🟢 acté

### R-11.16 — Bestiaire : import via R-10.19 + structure modulaire

**Décision Q-D11.2 (2026-04-25)** : choix D — hybride règle vivante.

#### A. Import via R-10.19 (rappel)

- Phase 1 : import auto avec valeurs inférées (depuis paper bestiaire).
- Phase 2 : détection d'ambiguïtés (catégorie XP non documentée pour certaines créatures, atouts raciaux à clarifier, résistances absentes du paper).
- Phase 3 : édition admin/MJ.
- Phase 4 : migration des persos référençant le bestiaire.

#### B. Schéma `creature` étendu (modulaire)

Le schéma R-11.3 reste la base. **Champs obligatoires** :

```yaml
creature:
  id, name, category, size
  vitality_base, speed_factor_base, will_factor_base, category_xp
  attribute_max
  intelligence_level, language_capable
  habitat, social_structure
  metadata.source, metadata.version
```

**Champs optionnels** (lore modulaire) :

```yaml
creature:
  ...
  lore:
    origin_myth: <string narratif | ref D12>
    society_description: <string | ref D12>
    rivalries: [<creature_id | faction_id>]
    alliances: [<creature_id | faction_id>]
    beliefs_and_religion: <string | ref D12 deity>
    famous_individuals: [<character_id | ref D12 historic_figure>]
    cultural_artifacts: [<item_id>]                       # lien D10
    geographic_distribution: [<region_id>]                 # lien D12
    notable_legends: [<string>]
    paper_descriptif: <string>                             # texte brut du PDF source
```

Le moteur peut soit référencer D12 (`ref D12`) soit stocker le lore inline (autonome). MJ peut basculer dynamiquement.

#### C. Import canonique des ~30 entrées paper

Liste à importer (priorité décroissante par importance narrative) :
1. **Humain** (race-pivot, beaucoup de classes par défaut)
2. **Elfe** (sous-types : Nacre, Bois, Sombre, Haut)
3. **Nain**
4. **Hobbit**
5. **Gnome**
6. **Orc**, **Gobelin**
7. **Ogre**, **Troll**
8. **Loup-garou**, **Vampire**
9. **Squelette**, **Fantôme**
10. **Canidae** (Gnolls)
11. **Centaure**, **Dryade**, **Ondine**
12. **Homme Lézard**, **Homme Oiseau**, **Homme Rat**
13. **Khogr**, **Khochigr**, **Chigr**
14. **Demi-elfe**
15. Animaux : **Cheval**, **Chat**, **Loup**, autres

#### D. Cohérence avec D3 (33 races jouables)

- Les 33 races de D3 sont toutes des `creature` avec `playable: true`.
- Le bestiaire ajoute les créatures non-jouables (Squelette, Fantôme, animaux purs, créatures monstrueuses).
- Cohérence : si une race est dans D3, son entrée bestiaire doit refléter les mêmes stats (synchronisation à valider à l'import).

#### E. Application par mode arbitre

- **MJ humain** : peut créer des créatures custom à la volée, surcharger toute valeur.
- **MJ LLM** : applique le bestiaire, utilise les `lore` pour cohérence narrative (cf. R-11.8 personnalité).
- **MJ auto** : strict — applique le bestiaire, refuse les créatures non documentées.

**Statut** : 🟢 acté (import effectif en backlog Q-D11.X)

### R-11.17 — IA tactique : 3 niveaux selon complexité

**Décision Q-D11.3 (2026-04-25)** : choix D — hybride règle vivante.

#### A. Trois niveaux

##### Niveau 1 : Priority list (R-11.9, déjà acté)

Pour PNJ standards (gobelins, gardes, animaux). Liste ordonnée de règles `condition → action`.

```yaml
tactical_ai:
  level: priority_list
  archetype: brute | skirmisher | ranged | caster | support
  rules:
    - priority: 1
      condition: "self.vitality < 25%"
      action: flee
    - priority: 2
      condition: "ally_within_2m AND ally.vitality < 50%"
      action: defend_ally
    - priority: 3
      condition: "true"
      action: attack_target
  target_selection: "lowest_vitality_enemy" | "highest_threat" | "nearest" | "caster_first"
```

##### Niveau 2 : State machine

Pour PNJ complexes (boss, lieutenants, créatures intelligentes). Machine d'état explicite avec transitions.

```yaml
tactical_ai:
  level: state_machine
  states:
    idle:
      on_enemy_detected: scout
    scout:
      on_enemy_in_range: engage
      on_too_many_enemies: alert_allies
    engage:
      on_vitality_low: flee_or_rage    # selon archétype
      on_ally_dying: defend_ally
      on_target_fleeing: pursue
    alert_allies:
      action: shout_alarm
      transition_after: 1_dt → engage
    flee_or_rage:
      condition_rage: "archetype == berserker"
      action_rage: enrage
      action_default: flee
    defend_ally: { ... }
    pursue: { ... }
```

##### Niveau 3 : Decision tree

Pour PNJ avancés (leaders, créatures hautement intelligentes, boss légendaires). Arbre de décision avec probabilités.

```yaml
tactical_ai:
  level: decision_tree
  root:
    type: condition
    test: "self.vitality < 25%"
    yes:
      type: probabilistic
      branches:
        - probability: 0.6
          action: flee
        - probability: 0.3
          action: call_help
        - probability: 0.1
          action: surrender
    no:
      type: condition
      test: "enemy_count > self_allies_count * 2"
      yes:
        action: tactical_retreat
      no:
        type: condition
        test: "self.aptitude.intelligence > 5"
        yes:
          action: complex_tactic
        no:
          action: brute_force
```

#### B. Sélection du niveau d'IA

Le niveau est déterminé par :
- **Mode campagne** : `arcade` → toutes IA en niveau 1, `standard` → niveau adapté au PNJ, `realistic` → tous niveaux selon complexité.
- **Catégorie de PNJ** : foules (Niveau 1), gardes (Niveau 1), boss (Niveau 2 ou 3), créatures légendaires (Niveau 3).
- **Surcharge MJ** : MJ humain peut imposer n'importe quel niveau pour n'importe quel PNJ.

#### C. Catalogue d'IA réutilisables

Le catalogue `tactical_ai` est éditable. Profils standard fournis :
- `brute_warrior` : Niveau 1, target weakest, fight to death (rarely flee).
- `cautious_archer` : Niveau 1, kite (maintain distance), retreat if engaged in melee.
- `tactical_caster` : Niveau 2, prioritize buffs/debuffs, summon, target casters first.
- `pack_hunter` : Niveau 2, coordinate with allies, encircle target.
- `boss_intelligent` : Niveau 3, adapt to PJ tactics, exploit weaknesses.
- `instinctive_animal` : Niveau 1, fight/flight basé sur Vitalité.

#### D. Application par mode arbitre

- **MJ humain** : peut surcharger toute IA, prendre le contrôle direct (bascule à `human_gm` cf. R-11.15).
- **MJ LLM** : peut consulter l'IA pour suggestion mais a la liberté narrative.
- **MJ auto** : applique strict l'IA selon le catalogue.

**Statut** : 🟢 acté

### R-11.18 — Personnalité PNJ en mode `llm` (mémoire + prompt + évolution)

**Décision Q-D11.4 (2026-04-25)** : choix D — hybride règle vivante.

#### A. Trois modes de mémoire (par campagne)

```yaml
campaign:
  pnj_memory_mode: none | session | persistent
```

- **`none`** : aucune mémoire. Chaque interaction est une rencontre fraîche. Le LLM reçoit uniquement le profil R-11.8.
- **`session`** : mémoire intra-session. Le LLM reçoit le profil + log des événements depuis le début de la session courante. Effacement à fin de session.
- **`persistent`** : mémoire persistante entre sessions. Le LLM reçoit le profil + log historique de toutes les rencontres avec les PJ. Le PNJ se souvient.

#### B. Format du prompt système (hybride structuré + narratif)

Le LLM reçoit un prompt système composé :

```text
[STATS - JSON structuré]
{
  "id": "garde_capitaine_aelric",
  "race": "humain",
  "class": "garde",
  "level": 6,
  "vitality": 28,
  "current_state": "alerted",
  "weapon_in_hand": "épée à une main",
  "active_atouts": ["Détection des coups portants", "Précision"],
  "controller": "llm"
}

[PERSONNALITÉ - JSON structuré]
{
  "archetype": "honorable",
  "motivations": ["protéger sa garnison", "trouver le voleur"],
  "fears": ["déshonneur", "trahison de ses hommes"],
  "values": ["honneur", "loyauté", "discipline"],
  "speech_style": "formal",
  "intelligence_proxy": { "tactical_level": "high", "deception_skill": "low" }
}

[CONTEXTE NARRATIF - texte libre]
Aelric est le capitaine de la garde de la cité d'Adérand depuis 8 ans. Il a perdu son frère
dans une embuscade de bandits il y a 3 ans, ce qui l'a rendu inflexible envers les criminels.
Il est respecté de ses hommes pour son équité.

[MÉMOIRE - JSON structuré] (mode session ou persistent)
[
  {"timestamp": "...", "event": "Rencontré PJ Galen pour la première fois", "tone": "neutral", "outcome": "soupçon léger"},
  {"timestamp": "...", "event": "PJ Galen a refusé de donner son nom", "tone": "tense", "outcome": "soupçon renforcé"}
]

[INSTRUCTIONS]
Réponds toujours en cohérence avec ce profil. Privilégie le langage formel.
Tu es maintenant en présence de [contexte courant injecté à chaque tour].
Décide de ton action tactique pour ce DT en respectant l'IA tactique de niveau 2.
```

Le format est configurable par campagne (`prompt_format: structured | narrative | hybrid`). `hybrid` (par défaut) est le format ci-dessus.

#### C. Évolution des attitudes via R-11.10

Le `personality_profile` est statique (l'archétype ne change pas), mais l'`attitude` envers les PJ évolue dynamiquement via les `attitude_modifiers`.

Exemples de triggers d'évolution :
- PJ sauve la fille du PNJ → +30 attitude (permanent).
- PJ humilie publiquement le PNJ → −20 attitude (permanent).
- PJ trahit la confiance → attitude → `hostile` (permanent).
- PJ paie le PNJ → temporaire selon montant.

#### D. Mémoire ET attitude : interaction

- En mode `none`, l'attitude reste à sa valeur de défaut du template.
- En mode `session`, l'attitude évolue pendant la session uniquement.
- En mode `persistent`, l'attitude évolue à long terme et persiste.

#### E. Application par mode arbitre

- **MJ humain** : peut surcharger le prompt, ajuster manuellement la mémoire, contredire le LLM si l'output ne lui plaît pas.
- **MJ LLM** : applique le mode mémoire de campagne, génère des actions cohérentes avec le profil.
- **MJ auto** : pas applicable (mode auto utilise R-11.17 IA tactique, pas LLM).

#### F. Catalogue d'archétypes prêts

R-11.8 archetypes : `aggressive | cautious | coward | fanatic | greedy | honorable | curious | cruel | compassionate | calculating`. Chaque archétype a un template de profil par défaut, surchargeable.

**Statut** : 🟢 acté

### R-11.19 — Hostilité dynamique : item-type `social_action`

**Décision Q-D11.5 (2026-04-25)** : choix D — hybride règle vivante.

#### A. Item-type `social_action` (extension R-9.30)

```yaml
social_action:
  id: <slug>
  name: <string localisé>
  category: charm | intimidation | persuasion | bribery | seduction | deception | reassurance | provocation
  jet_required:
    aptitude: <ref>                       # Charisme par défaut, Empathie pour persuasion, etc.
    skill: <ref>                          # Intimidation, Diplomatie, Persuasion, Tromperie
    specializations_applicable: [<spe>]
    difficulty: <int>                     # difficulté de base
    opposed_by: <attribute_or_skill>      # ex. Volonté, Empathie, Intelligence
  effect:
    attitude_delta: <int>                 # ±N points d'attitude
    attitude_floor: <enum | null>         # ne peut pas descendre en dessous
    attitude_ceiling: <enum | null>       # ne peut pas monter au dessus
    forced_action: <action_id | null>     # ex. surrender pour intimidation extrême
    duration: <duration | permanent>
    cancellable_by: [<event_or_action>]   # ex. dispel_magic pour charme
  prerequisites:
    proximity: <enum>                     # ex. mêlée pour intimidation physique, conversation pour persuasion
    common_language: bool
    visibility: bool                      # cible doit voir/entendre l'auteur
  cost:
    monetary_pc: <int | null>             # pour soudoiement
    energy: <int | null>                  # pour sort de charme
  resistance:
    immunities: [<creature_category>]     # ex. construct immune au charme
    resistances: [<resistance_def>]
```

#### B. Catalogue de base

| `social_action` | Catégorie | Jet | Effet par défaut |
|---|---|---|---|
| **Intimidation glaciale** | intimidation | Charisme + Intimidation | attitude −10, peut forcer `wary` |
| **Intimidation menaçante** | intimidation | Force + Intimidation | attitude −15, peut forcer `surrender` si écart ≥ 5 |
| **Persuasion** | persuasion | Charisme + Diplomatie | attitude +5 par réussite |
| **Séduction** | seduction | Esthétique + Charisme | attitude +N selon contexte |
| **Soudoiement** | bribery | Charisme + Diplomatie | attitude +∝ somme/cible |
| **Tromperie** | deception | Charisme + Bluff | force action (selon contexte) |
| **Charme magique** (sort D8) | charm | Intelligence + Charme | attitude → friendly OR état `charmed` |
| **Domination** (sort D8) | charm | Intelligence + Domination | état `dominated`, contrôleur change vers le lanceur |
| **Réassurance** | reassurance | Empathie + Diplomatie | dissipe peur/colère, attitude +5 |
| **Provocation** | provocation | Charisme + Intimidation | attitude −10, force `enraged` |

#### C. Cumul avec attitude_modifiers (R-11.10)

Chaque `social_action` réussie ajoute un `attitude_modifier` à l'état du PNJ :

```yaml
attitude_modifier:
  source: <social_action_id>
  delta: <int>
  duration: <duration | permanent>
  triggered_by: <character_id>
  triggered_at: <timestamp>
```

Cumul possible : plusieurs actions sociales successives empilent leurs effets (additif R-1.36).

#### D. Atouts dédiés (catalogue intégré)

| Atout | Effet | Source |
|---|---|---|
| **Charme inné** | +Niveau aux réussites de toute action `category: charm | seduction` | À proposer si manquant |
| **Intimidation glaciale** | −1 difficulté pour intimidation, action sociale dédiée | À proposer si manquant |
| **Bluff naturel** | +Niveau aux réussites de `deception` | À proposer si manquant |
| **Diplomatie** (compétence D5) | Cumul standard avec spécialisations | Compétence |
| **Bardique** (Musique stimulante D9 R-9.40) | +Niveau aux jets de groupe en présence de musique | Atout |

#### E. Résistance et immunités

- **Volonté** (D2) : test D20 pour résister à charme/intimidation/seduction.
- **Constructs** (R-11.14) : immune à charme et seduction.
- **Animaux instinctifs** (R-11.12 `intelligence_level: instinctive`) : immune à persuasion mais sensibles à intimidation/réassurance.
- **Atouts de résistance** : `Volonté de fer`, `Insensibilité au charme`, etc.

#### F. Conséquences sur le contrôle (lien R-11.15)

- `charmed` ou `dominated` réussi → bascule du contrôleur vers le lanceur (`player` du PJ) pour la durée du sort.
- `intimidated` à `surrender` → bascule à `human_gm` ou `llm` pour interrogatoire/négociation.
- `enraged` → reste sur le contrôleur d'origine mais avec contraintes d'IA (attaque l'auteur de la provocation).

#### G. Application par mode arbitre

- **MJ humain** : peut surcharger les jets, les effets, autoriser des actions custom.
- **MJ LLM** : applique strict, propose des conséquences narratives cohérentes avec le profil R-11.18.
- **MJ auto** : strict — applique le catalogue.

**Catalogue vivant** : `social_action` éditable, ajout d'actions custom (rituels d'humiliation, codes d'honneur, gestes culturels).

**Statut** : 🟢 acté

### R-11.20 — Foules et masses (`crowd`, 3 modes, clôt Q-D9.39)

**Décision Q-D11.6 (2026-04-25)** : choix D — hybride règle vivante. **Clôt le backlog D9 Q-D9.39 combat de masse**.

#### A. Trois modes par scène

```yaml
scene:
  crowd_mode: individual | aggregated | hybrid_threshold
  hybrid_threshold_size: <int>          # par défaut 10
```

- **`individual`** : tous les membres sont des entités distinctes. Limite R-9.28 (20 entités max simultanées) s'applique. Adapté aux petits groupes (< 20).
- **`aggregated`** : la foule est une `crowd` unique avec stats agrégées. Adapté aux grandes masses (50+).
- **`hybrid_threshold`** : tant que la foule a < `hybrid_threshold_size` membres, individuel. Au-delà, agrégation automatique. Bascule dynamique si la foule se divise (un membre se sépare → individuel) ou se regroupe.

#### B. Item-type `crowd` (extension R-11.11)

```yaml
crowd:
  id: <slug>
  name: <string localisé>
  composition:
    - creature_id: <ref>
      count: <int>
      level_avg: <int>
  size: <int>                            # total members
  
  # Stats agrégées
  vitality_total: <int>                  # somme des vitalités individuelles
  attack_dice_pool: <int>                # somme des dés moyens d'attaque
  defense_dice_pool: <int>               # somme des dés moyens de défense
  
  # Morale et cohésion
  morale: <int>                          # 0-100, baisse face aux pertes
  cohesion: <int>                        # 0-100, baisse en panique/désorganisation
  break_threshold: <int>                 # % de pertes qui déclenche débandade (par défaut 25%)
  
  # Contrôle
  controller: human_gm | llm | auto
  leader_pnj: <pnj_id | null>            # si la foule a un leader nommé
  
  # IA
  tactical_ai: <ref tactical_ai>         # R-11.17
  formation: <ref formation>             # cf. R-9.40 (mur de boucliers, phalange, etc.)
  
  metadata:
    version: <int>
```

#### C. Mécanique de combat de groupe

##### Attaque de groupe contre cible unique
- Pool de dés d'attaque agrégé (`attack_dice_pool`).
- Jet unique : `attack_dice_pool` D10 vs difficulté.
- Chaque réussite = N dégâts (selon archétype de la foule).
- Modificateur de zone unique pour la cible (R-9.15).

##### Attaque de groupe contre groupe (mêlée massive)
- Jet d'opposition `attack_dice_pool` vs `defense_dice_pool` adverse.
- L'écart de réussites détermine les pertes : chaque écart = 1 mort dans la foule perdante.
- Application proportionnelle à la `composition` (les unités les plus fragiles meurent en premier).

##### Attaque individuelle contre foule
- Jet standard (R-9.5) contre la foule comme cible.
- Chaque réussite = 1 ou plusieurs morts dans la foule (selon dégâts de l'arme).
- Foule peut riposter via `defense_dice_pool / size` proportionnel.

#### D. Morale et débandade

À chaque DT ou phase de combat :
1. Calculer `pertes_pct = (size_initial − size_courant) / size_initial × 100`.
2. Si `pertes_pct ≥ break_threshold` → test de morale.
3. **Test de morale** : `morale + cohesion D100 ≤ 100 + bonus_leader` → la foule tient. Sinon → **débandade**.
4. **Débandade** : la foule se transforme en `state: routing`. Vitesse × 2 (sprint), aucune attaque, fuit hors de la zone (R-9.37 fuite).
5. La débandade peut être stoppée par : leader chargismatique (test `Charisme + Commandement` du leader), mort du leader adverse, événement narratif.

#### E. Bonus du leader

Un `leader_pnj` (PNJ nommé qui commande la foule) ajoute :
- `+(leader.charisma + leader.command_skill)` aux tests de morale.
- Bonus de cohésion : +20 cohésion tant que le leader est vivant et présent.
- Mort du leader → −50 morale immédiat, −30 cohésion.

#### F. Application par mode arbitre

- **MJ humain** : peut surcharger toute statistique, déclencher événements narratifs.
- **MJ LLM** : applique le mode de scène, propose des descriptions narratives de la mêlée.
- **MJ auto** : strict — applique les règles d'agrégation et de morale.

**Statut** : 🟢 acté

### R-11.21 — Animaux non-sentients (Dressage + bond_strength + ordres + atouts)

**Décision Q-D11.7 (2026-04-25)** : choix D — hybride règle vivante.

#### A. Compétence Dressage (lien D5)

`Dressage / Animal Handling` est une compétence (D5) avec :
- Aptitude par défaut : Charisme ou Empathie selon contexte.
- Spécialisations possibles : `Dressage (chiens)`, `Dressage (chevaux)`, `Dressage (rapaces)`, `Dressage (créatures sauvages)`, etc.
- Difficulté de base : 7 (animal coopératif) à 12 (animal sauvage hostile).

#### B. Lien `bond_strength` (0-10)

```yaml
animal_companion:
  master: <character_id>
  animal: <pnj_id>
  bond_strength: <int>                 # 0 (étranger) à 10 (lien profond)
  bonded_since: <timestamp>
  shared_experiences: [<event>]        # log narratif
  trust_level: low | medium | high     # dérivé de bond_strength
```

Évolution :
- **+1** par interaction positive (nourrir, soigner, sauver, jouer).
- **+1** par jour de cohabitation continue.
- **−1** par interaction négative (frapper, négliger, abandon temporaire).
- **−2** par événement traumatique (animal blessé en bataille sans aide).
- Plafond 10, plancher 0.

#### C. Ordres standards (catalogue)

Difficulté du jet `Charisme + Dressage + spécialisations` selon complexité de l'ordre :

| Ordre | Difficulté | bond_strength minimum |
|---|:---:|:---:|
| **Au pied** | 6 | 1 |
| **Assis / Couché** | 6 | 1 |
| **Reste** | 7 | 2 |
| **Attaque [cible]** | 8 | 3 |
| **Protège [PJ]** | 9 | 4 |
| **Récupère [item]** | 9 | 4 |
| **Fouille [zone]** | 10 | 5 |
| **Patrouille** | 11 | 6 |
| **Communique [info simple]** | 12 | 7 |
| **Saut acrobatique** | 13 | 7 |
| **Tâche complexe en autonomie** | 15 | 9 |

Si `bond_strength < minimum requis` → ordre impossible (l'animal ne comprend pas ou refuse).

#### D. Atouts dédiés

| Atout | Effet | Source |
|---|---|---|
| **Empathie animale** | +Niveau aux jets de Dressage | À proposer si manquant |
| **Maîtrise équestre** (R-9.43) | +Niveau aux manœuvres équestres | Cavalier (classe) |
| **Communion sauvage** (à proposer) | Permet la communication avec animaux sauvages, niveau de complexité supérieur | Druide (classe) |
| **Pisteur né** (Canidae racial) | Bonus Dressage et lien avec animaux | Racial |
| **Flaire infaillible** (Canidae racial) | Aide pour pister, retrouver l'animal perdu | Racial |

#### E. Réaction à stress (animal contrôlé en combat)

- Test de **Volonté de l'animal** (souvent basse, 6-10) face à des situations stressantes (feu, magie effrayante, mort de compagnons).
- Échec → état `panicked` (R-9.27, équivalent `frightened`).
- Animal en panique : refuse les ordres complexes, peut fuir, peut attaquer aléatoirement.
- Le maître peut tenter une **action de réassurance** (R-11.19 `category: reassurance`) pour récupérer l'animal.

#### F. Application par mode arbitre

- **MJ humain** : peut surcharger les difficultés selon la situation et l'animal spécifique.
- **MJ LLM** : applique les règles, propose des comportements animaux cohérents.
- **MJ auto** : strict — applique les règles selon le catalogue.

**Statut** : 🟢 acté

### R-11.22 — Familiers (couches débloquées par atouts, clôt Q-D9.47)

**Décision Q-D11.8 (2026-04-25)** : choix D — hybride règle vivante. **Clôt le backlog D9 Q-D9.47**.

**Note importante** : les règles complètes du familier sont en standby (D6 Q-D6.6, D7 Q-D7.7, D8 Q-D8.6) — l'auteur a indiqué qu'elles sont plus complexes que les sources actuellement disponibles. R-11.22 modélise ce qui est connu et porte le statut `extended_rules_pending` pour migration future.

#### A. Item-type `familiar` (extension R-9.30)

```yaml
familiar:
  id: <slug>
  base_creature: <ref creature>          # cf. catalogue ci-dessous
  master: <character_id>                 # le magicien à qui il appartient
  bond_type: familiar
  bond_strength: 10                       # par défaut, max
  
  # Couches activables (par atouts du magicien)
  active_layers:
    base: true                            # toujours actif tant que l'atout `Familier` est pris
    sensory_link:                         # atout `Sens du familier`
      enabled: bool
      sense: vision | hearing | smell | touch | taste
    remote_spell_casting:                 # atout `Main du magicien`
      enabled: bool
    possession_transfer:                  # atout `Passage au familier`
      enabled: bool
    summon_dismiss:                       # atout `Rappel du familier`
      enabled: bool
  
  # Multi-familiers
  is_additional: bool                     # via atout `Familier supplémentaire`
  inherited_atouts: [<atout_id>]          # atouts hérités du familier précédent
  
  # Initiative et état
  controller: player | auto | llm         # par défaut player (le magicien), auto si occupé
  next_action_at: <int DT>                 # initiative distincte du magicien
  current_state: active | dismissed | possessed
  
  # Métadonnées
  metadata:
    extended_rules_pending: true           # rappel D8 Q-D8.6 standby
    version: <int>
```

#### B. Mapping atouts → couches

| Atout (lexique) | Couche activée | Effet |
|---|---|---|
| **Familier** (orientation Magicien permanent) | `base` | Acquisition d'un familier — bond_strength=10, contrôlable par le magicien |
| **Sens du familier** (N2 perm) | `sensory_link` | Lien sensoriel sur 1 sens choisi (vue/ouïe/odorat/toucher/goût). Le magicien voit/entend/etc. à travers le familier. |
| **Main du magicien** | `remote_spell_casting` | Le magicien lance ses sorts en utilisant le familier comme origine spatiale (cf. D9 R-9.31 ciblage). |
| **Passage au familier** (éphémère) | `possession_transfer` | Le magicien entre intégralement dans son familier (corps physique vacant ou caché). Sort/retour à volonté. |
| **Rappel du familier** (N3) | `summon_dismiss` | Stocke/invoque le familier en soi-même. Pas de risque physique pendant l'absence. |
| **Familier supplémentaire** (perm) | `multiplicity` | Permet plusieurs familiers (illimité ?). Le nouveau hérite des atouts placés. |

#### C. Catalogue de familiers types (R-11.16 + cf. D8 R-8.13)

```yaml
familiar_template:
  id: cat_familiar
  name: "Chat familier"
  base_creature: chat
  default_personality: curious | independent
  default_advantages: [stealth_bonus, climb_bonus]
```

Liste de familiers communs :
- **Chat** : agile, furtif, indépendant
- **Corbeau** / **corbeau noir** : intelligent, parle (sons mémorisés)
- **Hibou** : nocturne, vision dans la pénombre
- **Serpent** : faufilage, immune poison
- **Crapaud** : amphibie, immune poison naturel
- **Faucon** : vol, vision lointaine
- **Rat** : faufilage, résistance aux maladies
- **Sphère magique** (forme arbitraire D8 R-8.13) : lévitation, ne mange pas, non-organique
- **Livre ailé** : transport de connaissances, lecture autonome
- **Renard** : ruse, traque

Catalogue éditable. Chaque familier a ses stats `creature` (R-11.3) et hérite des règles d'animal R-11.21 sauf sur les couches activées (qui surchargent les règles standard).

#### D. Initiative et action

- **Initiative distincte** : le familier a son propre `next_action_at` calculé selon son `speed_factor` propre (cf. R-9.22 timeline).
- Si `controller: player` → le PJ magicien décide de l'action du familier à chaque tour du familier.
- Si `controller: auto` → IA tactique (R-11.17 niveau 1 typiquement, brute simple).
- Si `controller: llm` → LLM avec personnalité du familier injectée (R-11.18).
- **Communication mentale** : si `sensory_link.enabled`, communication immédiate entre maître et familier sans coût de DT (au-delà du temps de réflexion narratif).

#### E. Mort du familier

Conséquences pour le maître selon les couches actives :

| Couche active | Conséquence à la mort |
|---|---|
| `base` seule | Drain de 5 énergie temporaire (1 jour). |
| `sensory_link` | Drain de 5 énergie + perte du sens lié pendant 1 semaine. |
| `remote_spell_casting` | Drain de 10 énergie + impossibilité de relancer ce sort spécifique pendant 1 jour. |
| `possession_transfer` | Si le magicien était dans le familier au moment de la mort → mort immédiate du magicien (sauf intervention rituelle). |
| `summon_dismiss` | Le familier stocké au moment de la mort → drain de 10 énergie permanent (jusqu'à acquisition d'un nouveau familier). |

Acquisition d'un nouveau familier : rituel (lien R-10.20 `creation_procedure`) + énergie + temps. Drain levé à l'acquisition.

#### F. Règles à compléter ultérieurement

Quand l'auteur fournira les règles complètes (D8 Q-D8.6 standby), les points à préciser :
- Procédure exacte d'acquisition (rituel, ingrédients, temps).
- Limite du nombre de familiers (atout `Familier supplémentaire` répétable ? plafond ?).
- Évolution du familier avec le niveau du magicien.
- Familiers spéciaux liés à l'école de magie (familier de feu pour Élémentaliste, familier mort-vivant pour Nécromancien).
- Communication verbale (le familier parle-t-il ?).

#### G. Application par mode arbitre

- **MJ humain** : peut surcharger toute couche, autoriser des familiers exotiques.
- **MJ LLM** : applique les règles selon les atouts pris, propose des comportements de familier cohérents.
- **MJ auto** : strict — applique les règles selon le catalogue.

**Statut** : 🟢 acté (avec `extended_rules_pending: true` jusqu'à clôture D8 Q-D8.6)

---

## Partie K — Backlog D11 (à compléter au fil des questions)

> Cette partie regroupe les points pertinents identifiés mais **non tranchés** dans la session actuelle.

### Q-D11.10 — 🟡 Bestiaire : import effectif des ~30 entrées

**Contexte** : R-11.16 acte la stratégie. Le travail d'import lui-même reste à faire.

### Q-D11.11 — 🟡 Cohérence D3 (33 races jouables) ↔ Bestiaire

**Contexte** : R-11.16 D mentionne la synchronisation à valider. À vérifier item par item.

### Q-D11.12 — 🟡 Atouts de contrôle PNJ manquants au lexique

**Contexte** : R-11.18, R-11.19, R-11.21 mentionnent des atouts à proposer (Charme inné, Intimidation glaciale, Bluff naturel, Volonté de fer, Insensibilité au charme, Désengagement souple, Pas de retraite, Empathie animale, Communion sauvage). À cataloguer en D4.

### Q-D11.13 — 🟡 Mémoire LLM : architecture technique (vector store ? log structuré ?)

**Contexte** : R-11.18 acte les 3 modes. Mais le **format technique de stockage** (DB, vector embeddings, log structuré, summarization) n'est pas tranché.

### Q-D11.14 — 🟡 Catalogue d'archétypes de personnalité prêts à l'emploi

**Contexte** : R-11.18 F liste 10 archétypes mais le contenu détaillé n'est pas écrit.

### Q-D11.15 — 🟡 Détection automatique de bascule de contrôleur (règles précises)

**Contexte** : R-11.15 mentionne « bascule automatique selon vitalité, charme, etc. ». Définir précisément les triggers, valeurs seuils, conditions.

### Q-D11.16 — 🟡 PNJ d'interaction sociale spécialisés (marchands, artisans, autorité, informateurs)

**Contexte** : Les rôles sociaux des PNJ : marchands (lien D10 Q-D10.25), artisans (D10 R-10.21), autorité (gardes/juges/dirigeants), vendeurs d'info (lien D12). Anticipe D12. Templates spécialisés à élaborer.

### Q-D11.17 — 🟡 Créatures magiques / surnaturelles : sous-types détaillés

**Contexte** : R-11.14 esquisse les sous-types `undead`, `spirit`, `elemental`, `construct`, `dragon`, `celestial`, `fiend`. Détail des immunités, résistances spéciales, mécaniques propres. Lien backlog **Q-D9.40 combat contre incorporel/éthéré** à clôturer ici.

### Q-D11.18 — 🟡 Compagnons persistants (PJ recrute un PNJ comme compagnon long terme)

**Contexte** : R-11.2 acte le flag PJ vs PNJ mutable. Mais la **mécanique de recrutement** (négociation, partage XP, partage du loot, lien narratif) n'est pas définie. Distinct des familiers (R-11.22) — un compagnon est plus autonome, peut être PNJ humain/elfe/etc.

### Q-D11.19 — 🟡 Hostilité de groupe / réputation par faction

**Contexte** : R-11.10 traite l'attitude individuelle. Mais la **réputation auprès de factions** (« vous êtes mal vus de la garde de Cortéga ») nécessite un système de réputation par groupe. Anticipe D12.

### Q-D11.20 — 🟡 Q-D9.38 monstres avec multiples attaques par DT (hydre, dragon multi-gueules)

**Contexte** : Backlog D9 Q-D9.38 — peut être traité ici via extension du modèle `creature` avec champ `attack_routines: [<routine>]` permettant plusieurs `nextActionAt` distincts pour une seule créature.

---

## Partie K — Backlog D11 (à compléter au fil des questions)

À ouvrir au fur et à mesure.

---

## Partie L — Questions ouvertes

### ~~Q-D11.1~~ — Architecture du contrôle PNJ ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : hiérarchie + bascule dynamique + fallback + audit. Voir R-11.15 pour la mécanique.

### ~~Q-D11.2~~ — Bestiaire : stratégie d'import ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : R-10.19 (auto + ambiguïtés + admin) + structure modulaire (stats obligatoires + lore optionnels avec ref D12 ou autonome). Voir R-11.16 pour la mécanique.

### ~~Q-D11.3~~ — IA tactique pour PNJ `auto` ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : 3 niveaux selon complexité (priority list / state machine / decision tree). Voir R-11.17 pour la mécanique.

### ~~Q-D11.4~~ — Personnalité PNJ en mode `llm` ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : 3 modes mémoire + format prompt configurable. Voir R-11.18 pour la mécanique.

### ~~Q-D11.5~~ — Hostilité dynamique ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : item-type `social_action` + cumul + atouts dédiés + mode arbitre. Voir R-11.19 pour la mécanique.

### ~~Q-D11.6~~ — Foules et masses ✅ **Tranché (2026-04-25)** — **Clôt backlog Q-D9.39**

Choix D — hybride règle vivante : 3 modes par scène + mécanique complète. Voir R-11.20 pour la mécanique.

### ~~Q-D11.7~~ — Animaux non-sentients ✅ **Tranché (2026-04-25)**

Choix D — hybride règle vivante : Dressage + bond_strength + atouts dédiés + ordres standards. Voir R-11.21 pour la mécanique.

### ~~Q-D11.8~~ — Familiers : couches débloquées par atouts du lexique ✅ **Tranché (2026-04-25)** — **Clôt backlog Q-D9.47**

Choix D — hybride règle vivante : atouts → couches explicites + statut `extended_rules_pending` (standby D8 Q-D8.6) + initiative et mort détaillées + catalogue de familiers types. Voir R-11.22 pour la mécanique. Clôture du backlog Q-D9.47.

### ~~Q-D11.9~~ — Bilan D11 ✅ **Tranché (2026-04-25)**

D11 verrouillé sur 8 questions architecturales et 8 règles structurantes (R-11.15 → R-11.22). 2 backlogs D9 clôturés (Q-D9.39 combat de masse, Q-D9.47 familiers). Sujets restants renvoyés en backlog Q-D11.10 → Q-D11.16. Passage à D12 Géographie/Social/Économie.
