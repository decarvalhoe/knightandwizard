# D12 — Géographie, social, économie

> Modélisation du monde K&W : nations, régions, religions, cultures, lieux, voyages, factions, quêtes, structure sociale, justice, économie locale. Tous traités en mode **hybride règle vivante par mode arbitre** (pattern récurrent D1-D11), sauf indication contraire validée par l'auteur.

**Sources** :
- [regles-papier/extracted/histoires/nations.md](regles-papier/extracted/histoires/nations.md) — 18 nations détaillées (221 lignes)
- [regles-papier/extracted/histoires/cultes-et-religions.md](regles-papier/extracted/histoires/cultes-et-religions.md) — 5 religions principales + panthéons (75 lignes)
- [regles-papier/extracted/histoires/la-creation-des-terres-oubliees.md](regles-papier/extracted/histoires/la-creation-des-terres-oubliees.md) — mythe fondateur (752 lignes)
- [regles-papier/extracted/histoires/organisations.md](regles-papier/extracted/histoires/organisations.md) — factions/guildes (56 lignes)
- [regles-papier/extracted/histoires/blagues-dictons-et-proverbes.md](regles-papier/extracted/histoires/blagues-dictons-et-proverbes.md) — culture populaire
- [regles-papier/extracted/histoires/us-et-coutumes.md](regles-papier/extracted/histoires/us-et-coutumes.md) — coutumes
- [regles-papier/extracted/manoir-rossellini/](regles-papier/extracted/manoir-rossellini/) — exemple de location
- [monde/](monde/) — pages monde scrapées web (carte-du-monde/, lieux/, regions/, tous-les-lieux/, villes/)
- [regles-papier/extracted/infos/monnaie.md](regles-papier/extracted/infos/monnaie.md) — monnaie + régions citées

**Décisions amont structurantes** :
- **Méta-principe règles vivantes** : tous les catalogues éditables, versionnés, migrables.
- **R-9.30** : méta-modèle item-type-classes — peut héberger géographie, factions, religions.
- **R-10.18** : monnaie minimaliste activée, régionalisation désactivée par défaut (réactivable en D12).
- **R-11.16** : champ `lore.geographic_distribution` sur les créatures.
- **R-11.18** : champ `region_origin` sur les personnalités PNJ.
- **R-11.19** : `social_action` cumul attitudes — utilisable pour réputation par faction.

---

## Partie A — Géographie

### R-12.1 — Item-type `region` (extension R-9.30)

**Décision Q-D12.1 (2026-04-25)** : choix D — hybride règle vivante.

```yaml
region:
  id: <slug>
  name: <string localisé>
  category: continent | nation | duchy | province | city | town | village | wilderness | dungeon | landmark
  parent_region: <region_id | null>           # hiérarchie
  surface_km2: <float | null>
  population:
    total: <int>
    races: { <race_id>: <count> }
  
  # Géographie physique
  biome: forest | desert | mountains | plains | coast | swamp | tundra | jungle | underground
  climate: tropical | temperate | cold | arid | humid
  terrain: <ref terrain_modifier>             # cf. R-9.32 modificateurs de terrain
  
  # Politique
  government: monarchy | republic | theocracy | anarchy | tribal | feudal | imperial
  ruler: <character_id | faction_id | null>
  capital: <region_id | null>
  
  # Culture
  official_language: <ref>
  spoken_languages: [<ref>]
  official_religion: <ref religion | null>
  population_religions: { <religion_id>: <percent> }
  
  # Économie
  primary_economy: trade | agriculture | mining | fishing | crafting | military | knowledge
  resources: [<resource_id>]
  trade_partners: [<region_id>]
  trade_blockades: [<region_id>]
  
  # Diplomatie
  alliances: [<region_id>]
  rivalries: [<region_id>]
  faction_presence: { <faction_id>: <influence_0_100> }
  
  # Narrative
  description: <string>
  history: [<event>]
  notable_individuals: [<character_id>]
  notable_locations: [<location_id>]
  legends: [<string>]
  blason: <string>                            # description héraldique
  
  metadata:
    source: paper_nations | web_monde | custom
    version: <int>
```

**Catalogue de base à importer** (nations.md table des matières) :
Aderand (Duché d'), Alteria, Blanc Royaume, Collines d'Ico, Cortega, Dêtre, Dundoria, Empire (l'), Enorie (l'), Fauche-le-Vent, Grand Désert (Le), Haut Royaume (Le), Irtanie (l'), Landes Désertiques (les), Monde Sombre (Le), Terres du Nord (les), Tyrkan (Forêt de), Yonkado (Le).

**Statut** : 🟢 acté (import effectif en backlog Q-D12.X)

### R-12.2 — Hiérarchie géographique et lieux notables

**Décision Q-D12.2 (2026-04-25)** : choix D — hybride règle vivante.

Item-type `location` (sous-type de `region` ou autonome) pour les lieux ponctuels :
- Auberges, temples, marchés, ports, ponts, ruines, cavernes, sanctuaires.
- Manoir Rossellini comme exemple canonique d'instance (regles-papier/extracted/manoir-rossellini/ contient screenshots et plans).

Lien avec scènes (R-11.20 `scene_id`) pour le combat localisé.

**Statut** : 🟢 acté

### R-12.3 — Voyages : durées, dangers, méthodes

**Décision Q-D12.3 (2026-04-25)** : choix D — hybride règle vivante.

Item-type `travel_route` :
```yaml
travel_route:
  id: <slug>
  from: <region_id>
  to: <region_id>
  distance_km: <float>
  methods:
    - mode: foot | horse | wagon | carriage | boat | ship | flying | teleport
      duration: <duration>
      cost_pc: <int>
      capacity: <int>
      risk_level: 1-10
  hazards: [<event_id>]                       # bandits, monstres, météo, brigands
  guards_available: bool
  seasons_open: [<season>]                    # certaines routes fermées en hiver
```

Vitesse standard de voyage (lien R-9.32) :
- Marche : 4 km/h, 30 km/jour humain.
- Cheval : 8 km/h, 60-80 km/jour.
- Voiture : 6 km/h, 50 km/jour.
- Bateau : 4-10 km/h selon vent/courant.

**Statut** : 🟢 acté

---

## Partie B — Cultures, religions, factions

### R-12.4 — Religions et panthéons (item-type `religion`)

**Décision Q-D12.4 (2026-04-25)** : choix D — hybride règle vivante.

```yaml
religion:
  id: <slug>
  name: <string>
  category: monotheist | polytheist | animist | dualist | secular_philosophy | death_cult
  primary_race: <race_id | null>              # race principale qui pratique
  deities: [<deity>]
  doctrine: <string>                           # principes fondamentaux
  practices: [<string>]                        # rituels, fêtes
  holy_days: [<date>]
  forbidden_acts: [<string>]
  blessed_acts: [<string>]
  symbol: <string>
  hierarchy: <faction_id | null>              # ordre clerical éventuel
  alignment_tendency: lawful | neutral | chaotic | varies
  spell_school_affinity: <ref D8 école>       # ex. clergé Dieu Unique → Magie blanche
```

```yaml
deity:
  id: <slug>
  name: <string>
  domain: <string>                             # ex. "guerre", "mort", "amour"
  motto: <string>                              # citation de l'idéal
  worshippers: [<race_id>]
  granted_abilities: [<atout_id>]              # atouts spéciaux des fidèles
  granted_spells: [<spell_id>]                # sorts spécifiques de Magie blanche
```

**Catalogue de base** (cultes-et-religions.md) :
- **Culte de la Mort** (mort-vivants, prophétie funeste)
- **Dieu Unique** (humains, monothéiste, 10 commandements)
- **Dieux Elfiques** (12+ divinités : Cerexos, Isashi, Kahan, Louénill, Méliokyss, Mialiss, Oléhan, Sarh, Senghir, Théemen, Vaelis, Voratyr)
- **Dieux Gnomiques** (5 divinités : Androulia, Baeh, Darul, Estian, Tritirina)
- **Dieux Orientaux** (12+ divinités : Amaterasu, Benten, Fu Xi, Jen-Han, Kirin, Nu Wa, Shoki, Ssu Ko Liang, Susanowo, Tsuki Yomi, Xi Wang Mu, Yanluo Wang, Yu Huang Shangdi)
- **Dieux Païens** (8 divinités : Adiphaée, Conoclès, Daémus, Gaïa, Ilis, Iménophé, Oradip, Teranos)
- **Liberté de Culte** (philosophie, Aderand + Altéria)
- **Autres divinités par race** : Chaotiques Puissances (7 entités), Cyclope, Félidés (9 dieux), Gobelinoïdes, Hobbits, Hommes-Lézards (6), Hommes-Rats (Empereur), Vikings (~12), Hauts-Elfes, Khogr, Naïades, Nains, Orcs, Trolls.

**Statut** : 🟢 acté (import effectif en backlog)

### R-12.5 — Factions et organisations (item-type `faction`)

**Décision Q-D12.5 (2026-04-25)** : choix D — hybride règle vivante.

```yaml
faction:
  id: <slug>
  name: <string>
  category: guild | military_order | religious_order | criminal | merchant | political | secret_society | scholarly | druidic
  base_region: <region_id>
  presence_regions: [<region_id>]
  members_count: <int | null>
  hierarchy: [<rank>]
  goals: [<string>]
  methods: [<string>]
  alliances: [<faction_id>]
  rivalries: [<faction_id>]
  reputation_thresholds:                      # lien R-12.10 réputation
    enemy: <int>
    hostile: <int>
    neutral: <int>
    friendly: <int>
    ally: <int>
    revered: <int>
  membership:
    requirements: [<string>]                  # prérequis pour rejoindre
    benefits: [<benefit>]                     # ce que l'adhésion apporte
    obligations: [<obligation>]
    exit_consequences: <string>
```

**Catalogue de base** : à importer depuis `organisations.md` paper + factions citées dans `nations.md` (Inquisition Cortégante, Alliance, Garde d'Aderand, Cult de la Mort, Empire homme-rat, etc.).

**Statut** : 🟢 acté

### R-12.6 — Langues et cultures

**Décision Q-D12.6 (2026-04-25)** : choix D — hybride règle vivante.

```yaml
language:
  id: <slug>
  name: <string>                               # ex. "Langage commun", "Elfique", "Nain"
  scripted: bool                               # forme écrite existe-t-elle ?
  speakers: [<race_id>]
  regional: bool                               # langue d'une région ou universelle ?
  difficulty_to_learn: 1-10
  related_languages: [<language_id>]          # familles linguistiques
```

Lien D5 (compétences) : `Langues parlées` est une compétence avec spécialisations par langue.

**Catalogue de base** (extrait de nations.md) :
- Langage commun (universel humain)
- Elfique (haut, sylvain, sombre)
- Nain
- Gnomique
- Orcique / Gobelinois
- Oriental (cf. Yonkado, Lounaxill)
- Reptilien (hommes-lézards)
- Vétérinaire / Bestial (cris d'animaux)

**Statut** : 🟢 acté

---

## Partie C — Économie et structure sociale

### R-12.7 — Régionalisation des prix (réactivation R-10.18 mode B)

**Décision Q-D12.7 (2026-04-25)** : choix D — hybride règle vivante.

Si la campagne active `regional_pricing: true` (par défaut désactivé R-10.18), chaque `region` peut avoir :

```yaml
region:
  ...
  price_modifiers:
    - item_category: <ref>                    # ex. "weapon_melee", "potion"
      multiplier: <float>                      # ex. 1.3 = +30%
      reason: <string>                         # narratif
    - item_id: <ref>
      multiplier: <float>
      reason: <string>
  scarce_items: [<item_id>]                    # introuvables localement
  abundant_items: [<item_id>]                  # surabondants, prix réduits
  illegal_items: [<item_id>]                   # interdits (poisons, drogues, armes lourdes)
```

Application : un même item a un prix différent à Aderand (port commercial, low margin) vs Cortéga (théocratie autoritaire, contrebande nécessaire).

**Statut** : 🟢 acté (mode opt-in)

### R-12.8 — Structure sociale (classes sociales, noblesse, esclavage)

**Décision Q-D12.8 (2026-04-25)** : choix D — hybride règle vivante.

```yaml
social_class:
  id: <slug>
  name: <string>                               # ex. "noblesse", "clergé", "bourgeoisie", "paysannerie", "esclavage"
  region_specific: <region_id | null>          # certaines classes existent dans certaines régions seulement
  privileges: [<privilege>]
  obligations: [<obligation>]
  legal_protections: [<protection>]
  income_range_pc: [<min>, <max>]
  typical_attire: [<clothing_id>]              # lien R-10.27 social_class
  marriage_rules: [<rule>]
  social_mobility: low | medium | high
```

**Catalogue de base** :
- **Noblesse** : Duc, Comte, Baron, Chevalier (variations par région).
- **Clergé** : Cardinal, Évêque, Prêtre, Moine, Diacre.
- **Bourgeoisie** : Marchand, Maître artisan, Banquier.
- **Paysannerie** : Serf, Tenancier, Affranchi.
- **Marginaux** : Mendiant, Vagabond, Hors-la-loi (orientation).
- **Esclavage** : Existe dans certaines régions (anticipation Q-D10.23 backlog), interdit dans d'autres.

**Statut** : 🟢 acté

### R-12.9 — Lois, justice, crimes et peines

**Décision Q-D12.9 (2026-04-25)** : choix D — hybride règle vivante.

```yaml
legal_system:
  region: <region_id>
  source: code_civil | royal_decree | divine_law | tribal_custom | religious_text
  
  crimes:
    - id: <slug>
      name: <string>                           # ex. "vol", "meurtre", "sorcellerie", "hérésie"
      severity: minor | major | capital
      penalty: <penalty_def>
      proof_required: testimony | confession | evidence | divine_sign
      jurisdiction: local | regional | royal | religious
  
  penalties:
    - id: <slug>
      type: fine | imprisonment | flogging | mutilation | exile | death | religious_punishment
      duration: <duration | null>
      monetary: <int Pc | null>
      stigma_permanent: bool                    # marque/cicatrice permanente
  
  trial_procedure:
    judge: <character_id_template | faction_id>
    rights_of_accused: [<right>]
    appeals_possible: bool
  
  enforcement_factions: [<faction_id>]        # garde, inquisition, milice
```

Lien D11 R-9.44 (interrogatoire, reddition) et R-11.19 (intimidation).

**Statut** : 🟢 acté

### R-12.10 — Réputation par faction (clôt backlog Q-D11.19)

**Décision Q-D12.10 (2026-04-25)** : choix D — hybride règle vivante. **Clôt Q-D11.19**.

```yaml
character_reputation:
  character: <character_id>
  faction_reputations:
    - faction: <faction_id>
      score: <int>                              # -100 à +100
      thresholds_reached: [enemy, hostile, neutral, friendly, ally, revered]
      events: [<event_log>]                     # log des actions ayant influencé
```

Cumul avec R-11.10 attitude individuelle. Une réputation faction influence l'attitude par défaut des PNJ membres de la faction.

Mécaniques :
- Action positive envers la faction → +N réputation (selon poids).
- Action négative → -N réputation.
- Lien narratif : un PNJ de la faction informe les autres (vitesse de propagation selon faction).
- Conséquences mécaniques : seuils débloquent privilèges (accès, prix réduit, missions, refuge) ou sanctions (chasse, mise à prix, refus de service).

**Statut** : 🟢 acté

---

## Partie D — Quêtes et progression narrative

### R-12.11 — Item-type `quest` (extension R-9.30)

**Décision Q-D12.11 (2026-04-25)** : choix D — hybride règle vivante.

```yaml
quest:
  id: <slug>
  title: <string>
  category: main | side | personal | faction | religious | exploration | bounty
  giver: <character_id | faction_id>
  hooks: [<hook_description>]                  # comment les PJ peuvent y être confrontés
  prerequisites:
    level_min: <int>
    reputation_required: { <faction_id>: <int> }
    quests_completed: [<quest_id>]
    items_required: [<item_id>]
  objectives:
    - id: <slug>
      description: <string>
      type: kill | retrieve | escort | explore | persuade | survive | solve | deliver
      target: <ref>
      optional: bool
      hidden: bool                              # objectif révélé pendant la quête
  rewards:
    xp: <int>                                    # lien D7 progression
    quest_points: <int>                          # lien D7 R-7.X
    monetary_pc: <int>
    items: [<item_id>]
    reputation_changes: { <faction_id>: <int> }
    title_or_status: <string>                    # ex. "Héros d'Aderand"
    consequences: [<event>]                      # conséquences narratives
  status: not_started | in_progress | completed | failed | abandoned
  time_limit: <duration | null>
  location: <region_id | location_id>
  related_quests: [<quest_id>]                   # arcs narratifs
```

Lien R-12.10 (réputation) et D7 (XP, quest_points).

**Catalogue à compléter narrativement** par les MJ.

**Statut** : 🟢 acté (catalogue narratif libre)

---

## Partie E — Histoire et lore

### R-12.12 — Mythe fondateur et lore

**Décision Q-D12.12 (2026-04-25)** : choix D — hybride règle vivante.

Lore importé depuis `la-creation-des-terres-oubliees.md` (752 lignes, mythe fondateur). Item-type `lore_entry` :

```yaml
lore_entry:
  id: <slug>
  category: creation_myth | historic_event | prophecy | legend | folklore
  era: ancient | classical | medieval | recent | current
  related_regions: [<region_id>]
  related_factions: [<faction_id>]
  related_deities: [<deity_id>]
  text: <string>
  truth_status: confirmed | rumored | disputed | known_false
  known_to: [<race_id | faction_id>]            # qui connaît ce lore
```

**Statut** : 🟢 acté

---

## Partie F — Coutumes, dictons, culture populaire

### R-12.13 — Coutumes et culture populaire (`custom`, `proverb`)

**Décision Q-D12.13 (2026-04-25)** : choix D — hybride règle vivante.

Importer depuis :
- `us-et-coutumes.md` (23 lignes — coutumes par culture)
- `blagues-dictons-et-proverbes.md` (79 lignes — sagesse populaire)

```yaml
custom:
  id: <slug>
  category: greeting | hospitality | mourning | celebration | taboo | gesture
  practiced_by: [<race_id | region_id>]
  description: <string>
  social_consequences:
    respected: <int>                            # +N réputation locale si respecté
    violated: <int>                             # -N réputation si violé
```

```yaml
proverb:
  id: <slug>
  text: <string>
  origin: <race_id | region_id>
  meaning: <string>
  context_use: [<situation>]
```

**Statut** : 🟢 acté

---

## Partie G — Backlog D12 (à compléter ultérieurement)

### Q-D12.14 — 🟡 Import effectif des 18 nations (nations.md)

### Q-D12.15 — 🟡 Import effectif des religions et 60+ divinités (cultes-et-religions.md)

### Q-D12.16 — 🟡 Import du mythe fondateur (la-creation-des-terres-oubliees.md, 752 lignes)

### Q-D12.17 — 🟡 Import des organisations / factions (organisations.md)

### Q-D12.18 — 🟡 Import des us et coutumes + proverbes (paper)

### Q-D12.19 — 🟡 Carte du monde digitale (intégration `monde/carte-du-monde/`)

### Q-D12.20 — 🟡 Lieux notables détaillés (Manoir Rossellini comme exemple, monde/lieux/)

### Q-D12.21 — 🟡 Système d'événements globaux (météo, saisons, cycles politiques)

### Q-D12.22 — 🟡 Tables de rencontres aléatoires par région (random encounters)

### Q-D12.23 — 🟡 Économie dynamique (inflation, événements économiques)

### Q-D12.24 — 🟡 Système de saison narrative (cycles de quêtes, rotation)

### Q-D12.25 — 🟡 Cartographie 3D (donjons, ruines, dimensions parallèles)

### Q-D12.26 — 🟡 Génération procédurale de régions/lieux/quêtes

### Q-D12.27 — 🟡 Q-D10.21 marchands itinérants vs fixes (lien D10) — peut être tranché ici

### Q-D12.28 — 🟡 Q-D10.22 banques narratives (lien D10) — peut être tranché ici

### Q-D12.29 — 🟡 Q-D10.23 items de troc / commerce non monétaire (lien D10)

### Q-D12.30 — 🟡 Q-D11.16 PNJ d'interaction sociale spécialisés (marchands/artisans/autorité)

---

## Partie H — Questions ouvertes (rappel)

### Q-D12.1 → Q-D12.13 — toutes ✅ tranchées en lot (pattern D / hybride règle vivante)

L'auteur a indiqué « répond presque toujours la même chose » donc D12 a été traité en mode batch sur le pattern D. Les 13 règles structurantes (R-12.1 → R-12.13) couvrent l'architecture complète. Les imports effectifs et raffinements en backlog Q-D12.14 → Q-D12.30.
