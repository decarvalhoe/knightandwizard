# Knight and Wizard — Inventaire des sources (Phase 0)

> Mapping exhaustif : pour chaque domaine de règle, où vit l'information, quelle est sa complétude, et quels sont les trous.

## Légende

- 🟢 Complète — on peut rédiger les règles en lecture directe
- 🟡 Partielle — matière majoritairement disponible, quelques trous identifiés
- 🔴 Lacunaire — trou significatif, à investiguer dans le code ou à faire trancher

---

## Principe architectural transversal — Règles vivantes (acté 2026-04-25)

**Toutes** les règles du jeu Knight and Wizard sont **vivantes** : versionnables, modifiables, extensibles par admin / MJ via une interface d'édition. Le moteur digital ne hard-code aucune règle — tout vit en data.

**Implications** :
- Versioning par règle (auteur, date, motif)
- Migration des personnages existants quand une règle change
- Co-existence possible de versions de règles entre campagnes
- Workflow de proposition / validation (admin ou vote communautaire)
- Documentation canonique français + mapping mécanique pour chaque règle

Cohérent avec : Q-D5.3 (catalogue compétences CMS), Q-D6.8 (extensibilité religieuse), Q-D4.2 (intégration 11 classes web-only), R-3.4 R-4.X (catalogues éditables), etc.

→ S'applique à **tous les domaines D1-D13**.

## Hiérarchie des sources (tranché 2026-04-24)

**Règle de priorité en cas de divergence** :
1. **Web scrapé** ([documents/regles/](documents/regles/) + [documents/*/](documents/) + [raw-html/](raw-html/)) = **source canonique**
2. **Paper K&Wshared** ([regles-papier/extracted/](regles-papier/extracted/)) = **source supplémentaire** (comble les trous du web mais ne remplace pas)
3. **Code PHP** = **indicateur** (confirme ou révèle des trous, jamais source primaire)

### Divergences paper vs web déjà identifiées

| Sujet | Web (canonique) | Paper | Décision |
|---|---|---|---|
| Vitalité familier | `niveau × 5` | `niveau + 5` | Web : × 5 |
| Terminologie critique | "Réussite/Échec Critique" | "Totale/Total" | Web : "Critique" |
| TI minimum sort | Facteur de vitesse | 1 DT | Web : FV minimum |

D'autres divergences possibles à détecter au fil de la lecture des autres docs paper.

## Vue d'ensemble

| Source | Volume | Nature |
|---|---|---|
| [documents/regles/index.md](documents/regles/index.md) | 569 lignes | **Règles officielles** — socle commun (attributs, création, combat, XP) |
| [documents/grimoire/index.md](documents/grimoire/index.md) | 2 621 lignes | Sorts (11 écoles, stats complètes) |
| [documents/bestiaire/index.md](documents/bestiaire/index.md) | 637 lignes | 32 races jouables + stats |
| [documents/armes/index.md](documents/armes/index.md) | ~600 lignes | ~106 armes |
| [documents/potions/index.md](documents/potions/index.md) | ~600 lignes | ~50 potions avec recettes détaillées |
| [documents/classes/index.md](documents/classes/index.md) | ~300 lignes | 67 classes sous 13 orientations *(corrigé en D4)* |
| [documents/competences/index.md](documents/competences/index.md) | ~400 lignes | ~100 compétences |
| [documents/atouts/index.md](documents/atouts/index.md) | ~700 lignes | Atouts/handicaps divers |
| [documents/atouts-niveaux/index.md](documents/atouts-niveaux/index.md) | ~1 000 lignes | Atouts débloqués par niveau |
| [documents/cartes/index.md](documents/cartes/index.md) | — | Index 15 régions |
| [monde/regions/](monde/regions/) | 5 fichiers | Régions + lore |
| [monde/villes/](monde/villes/) | 9 fichiers | Villes |
| [monde/lieux/](monde/lieux/) | ~17 fichiers | Lieux jouables |
| [personnages/fiches/](personnages/fiches/) | 96 fichiers | Fiches réelles (données partielles) |
| [raw-html/](raw-html/) | ~20 + détails | Backup HTML (fallback si markdown incomplet) |
| **[regles-papier/extracted/regles/regles.md](regles-papier/extracted/regles/regles.md)** | PDF officiel (16 pages extraites) | Règles complètes papier v1.0 |
| **[regles-papier/extracted/listes/experience.md](regles-papier/extracted/listes/experience.md)** | Doc | **XP costs** (NA×5 attributs, NA×3 compétences, etc.) |
| **[regles-papier/extracted/listes/lexique.md](regles-papier/extracted/listes/lexique.md)** | Doc 1200 l | Descriptions complètes des atouts |
| **[regles-papier/extracted/listes/bestiaire.md](regles-papier/extracted/listes/bestiaire.md)** | Doc 1000 l | Races détaillées + atouts raciaux |
| **[regles-papier/extracted/listes/atouts-de-niveaux.md](regles-papier/extracted/listes/atouts-de-niveaux.md)** | Doc 450 l | Atouts par niveau détaillés |
| **[regles-papier/extracted/listes/grand-grimoire.md](regles-papier/extracted/listes/grand-grimoire.md)** | Doc 450 l | Sorts complets avec effets détaillés |
| **[regles-papier/extracted/listes/orientations-et-classes.md](regles-papier/extracted/listes/orientations-et-classes.md)** | Doc 190 l | Classes + atouts associés |
| **[regles-papier/extracted/listes/armes.md](regles-papier/extracted/listes/armes.md)** | Doc | Table des armes complète |
| **[regles-papier/extracted/listes/protections.md](regles-papier/extracted/listes/protections.md)** | Doc | Table des protections (armures, boucliers) |
| **[regles-papier/extracted/listes/rituels-et-potions.md](regles-papier/extracted/listes/rituels-et-potions.md)** | PDF | Rituels et potions |
| **[regles-papier/extracted/infos/table-des-touches.md](regles-papier/extracted/infos/table-des-touches.md)** | PDF 53 l | **Table D100 zones touchées** |
| **[regles-papier/extracted/infos/monnaie.md](regles-papier/extracted/infos/monnaie.md)** | PDF | Système monétaire |
| **[regles-papier/extracted/infos/poisons.md](regles-papier/extracted/infos/poisons.md)** | PDF 1000 l | Catalogue des poisons |
| **[regles-papier/extracted/infos/champignons-toxiques.md](regles-papier/extracted/infos/champignons-toxiques.md)** | PDF 400 l | Catalogue des champignons toxiques |
| **[regles-papier/extracted/histoires/](regles-papier/extracted/histoires/)** | PDFs/Doc | Lore : Création des Terres Oubliées, Nations, Organisations, Cultes et Religions, Us et Coutumes, Blagues et Proverbes |
| **[regles-papier/extracted/regles/jets-de-des-kw.md](regles-papier/extracted/regles/jets-de-des-kw.md)** | PPT 46 slides | Présentation du système de dés (didactique) |
| **[regles-papier/extracted/kw.csv](regles-papier/extracted/kw.csv)** | XLS | Tableau maître (à inspecter) |
| **[regles-papier/extracted/manoir-rossellini/](regles-papier/extracted/manoir-rossellini/)** | PNG | Plans scénario Manoir Rossellini |
| **[regles-papier/source/](regles-papier/source/)** | originaux | Archives originales (PDF/DOC/PPT/XLS) préservées |
| [site/includes/class/](site/includes/class/) | 6 classes PHP | Entités : Character, CharacterPlayer, Npc, Place, Weapon, Arena |
| [site/includes/managers/_DBManager.php](site/includes/managers/_DBManager.php) | 3 170 lignes | **Hub DB** — contient les colonnes persistées (= source de vérité du modèle) |
| [site/includes/managers/user/](site/includes/managers/user/) | 26 managers | Logique métier par page (combat, dés, création, etc.) |
| [site/download/map/](site/download/map/) | 15 JPG | Cartes HD |

---

## Domaine 1 — Attributs (9 aptitudes)

**Sources** :
- 🟢 [documents/regles/index.md:138-175](documents/regles/index.md) — définitions narratives
- 🟢 [documents/regles/index.md:286-293](documents/regles/index.md) — distribution à la création
- 🟢 [documents/bestiaire/index.md](documents/bestiaire/index.md) — maxima par race
- 🟢 [site/includes/class/Character.php](site/includes/class/Character.php) — noms des propriétés PHP
- 🟢 [site/includes/managers/_DBManager.php:127-159](site/includes/managers/_DBManager.php) — colonnes persistées

**Liste confirmée** : `strength`, `dexterity`, `stamina` (Endurance), `aestheticism`, `charisma`, `empathy`, `intelligence`, `perception`, `reflexes`.

**Complétude** : 🟡

**Trous** :
- Formule `energyMax` = ? (dérivée d'Intelligence ? de Volonté ?)
- Formule `vitalityMax` = ? (stamina × X + catégorie ?)
- Formule `speedFactor` et `willFactor` de base (race) + modifiés par encombrement (règles l.258 : +1/5 kg)

**Où chercher** : `_DBManager.php` (colonnes de la table `characters`), `Character.php`, managers `AddCharacter`, `UpdateCharacter`.

---

## Domaine 2 — Races

**Sources** :
- 🟢 [documents/bestiaire/index.md](documents/bestiaire/index.md) — 32 races, table complète (Nom, Catégorie, Vitalité, F.Vitesse, F.Volonté, 9 × attribut max)
- 🟡 [documents/regles/index.md:8-14](documents/regles/index.md) — explication atouts/handicaps de race
- 🟢 [raw-html/races-list.html](raw-html/races-list.html) — backup
- 🟢 [site/includes/managers/_DBManager.php:737-774](site/includes/managers/_DBManager.php) — `getAllRaces`
- 🟢 [site/includes/managers/_DBManager.php:2462-2510](site/includes/managers/_DBManager.php) — `insertRace` → signature des colonnes

**Catégories connues** : 16, 20, 24, 28, 32, 40 (détermine seuils de niveau).

**Complétude** : 🟡

**Trous** :
- 🔴 **Quels sont les atouts/handicaps spécifiques de chaque race ?** (mentionnés mais pas listés par race dans le bestiaire markdown)
- Cross-reference à faire avec [documents/atouts/index.md](documents/atouts/index.md)

---

## Domaine 3 — Classes

**Sources** :
- 🟢 [documents/classes/index.md](documents/classes/index.md) — 53 classes (Artisan, Artiste, Commerçant, Domestique, Guerrier, Intellectuel, Magicien, Voyou, Domestique)
- 🟡 [documents/regles/index.md:54-60, 270-275](documents/regles/index.md) — explications flux création
- 🟢 [raw-html/classes-list.html](raw-html/classes-list.html)
- 🟢 [site/includes/managers/_DBManager.php:550-572](site/includes/managers/_DBManager.php) — `getAllClasses`

**Complétude** : 🟡

**Trous** :
- 🔴 **Atouts par classe** — référencés mais non mappés dans le markdown
- 🔴 **Compétence primaire par classe** — règle connue (2 pts/point vs 1 pt/point) mais mapping classe → compétence non explicité
- À creuser : [documents/atouts/index.md](documents/atouts/index.md) (peut contenir le mapping)

---

## Domaine 4 — Orientations

**Sources** :
- 🟢 [documents/regles/index.md:54-65](documents/regles/index.md) — orientations = secteurs (socio-pro)
- 🟢 [regles-papier/extracted/listes/orientations-et-classes.md](regles-papier/extracted/listes/orientations-et-classes.md) — 13 orientations
- 🟢 [regles-papier/extracted/listes/lexique.md](regles-papier/extracted/listes/lexique.md) — atouts d'orientation décrits
- 🟢 [site/includes/managers/_DBManager.php:644-665](site/includes/managers/_DBManager.php) — `getAllOrientations`

**13 orientations confirmées (2026-04-25)** : Artisan, Artiste, Commerçant, Domestique, Guerrier, Hors-la-loi, Intellectuel, Magicien, Malfaisant, Ouvrier, Paysan, Religieux, Voyageur.

**Complétude** : 🟡

**Trous** :
- 🔴 **Liste exhaustive et atouts spécifiques** d'orientation
- Confusion possible avec "psychologie" ([regles:61-65](documents/regles/index.md))

---

## Domaine 5 — Compétences & spécialisations

**Sources** :
- 🟢 [documents/competences/index.md](documents/competences/index.md) — ~100 compétences en familles
- 🟢 [documents/regles/index.md:175-222](documents/regles/index.md) — règle de résolution, échelle 0–15+, compétence primaire
- 🟢 [raw-html/skills-list.html](raw-html/skills-list.html)
- 🟢 [site/includes/managers/_DBManager.php:775-819](site/includes/managers/_DBManager.php) — `getAllSkills`, `getAllSkillsFamilies`

**Familles** : Art, Artisanat, Combat, Créatures, Déplacement, Discrétion, Éléments, Hypothétique (sciences), Lien social, Magie, Objet, Perception, Technique.

**Formule résolution** : `dés = aptitude + compétence + spécialisations` en D10 vs difficulté 7 (standard).

**Complétude** : 🟡

**Trous** :
- 🔴 **Liste exhaustive des spécialisations** (système semble ouvert / choix libre ?)
- Mapping classe → compétence primaire (cf. Domaine 3)

---

## Domaine 6 — Création de personnage

**Sources** :
- 🟢 [documents/regles/index.md:260-304](documents/regles/index.md) — flow 14 étapes complet
- 🟢 [site/includes/managers/user/AddCharacterMan.php](site/includes/managers/user/AddCharacterMan.php) — implémentation
- 🟢 [raw-html/details/add-character.php.html](raw-html/details/) — capture UI

**Étapes** : genre → race → atouts raciaux → vitalité/facteurs → orientation → classe → atouts orientation/classe → sorts+énergie (si magicien) → psychologie → divinité → citation → aptitudes (max catégorie pts, min 1 / max limite-1 par attribut) → compétences (max 4 initial) → équipement → nom/background.

**Complétude** : 🟢 narrative complète

**Trous** :
- Dépend des trous D2/D3/D4 (atouts par race/classe/orientation)

---

## Domaine 7 — Magie / Grand Grimoire

**Sources** :
- 🟢 [documents/grimoire/index.md](documents/grimoire/index.md) — 2 621 lignes, sorts complets (Nom, Type, Énergie, TI, Difficulté, Effet, Valeur)
- 🟢 [documents/regles/index.md:90-134](documents/regles/index.md) — règles de magie, énergie, familiers, concentration
- 🟡 [raw-html/spells-list.html](raw-html/spells-list.html) — HTML apparemment malformé (DOM dynamique ?)
- 🟢 [site/includes/managers/_DBManager.php:820-851, 2610-2636](site/includes/managers/_DBManager.php) — `getAllSpells`, `insertSpell`

**11 écoles** : Abjuration (jaune), Altération (rouge), Blanche (blanc), Divination (brun), Enchantement (turquoise), Élémentaire (bleu), Illusion (violet), Invocation (orange), Naturelle (vert), Noire (noir), Nécromancie (gris).

**Complétude** : 🟢

**Trous** :
- Règles précises de l'incantation en combat (TI mesuré en DT de 0.2 s)
- Règles de contre-sort / dissipation (partiellement dans Abjuration)

---

## Domaine 8 — Combat

**Sources** :
- 🟢 [documents/regles/index.md:305-428+](documents/regles/index.md) — DT, actions (simple/précise/improvisée/multiple/contre-action/conservée), types de jets
- 🟡 [outils/assistant-combat/](outils/assistant-combat/), [outils/combat/](outils/combat/) — docs outil joueur
- 🟢 [raw-html/fight-assistant.html](raw-html/fight-assistant.html) — UI assistant
- 🔴 [site/includes/class/Arena.php](site/includes/class/Arena.php) — 21 lignes, logique ailleurs
- 🔴 [site/includes/managers/user/FightAssistantMan.php](site/includes/managers/user/FightAssistantMan.php) — **à lire pour mécanique réelle**
- 🔴 [site/user/fight.php](site/user/fight.php), [site/user/fight-assistant.php](site/user/fight-assistant.php)

**Base connue** : 1 DT = 0,2 s ; facteur vitesse = temps d'action en DT ; jets = dés ≥ difficulté 7.

**Complétude** : 🟡

**Trous** :
- 🔴 **Formule d'initiative** (F.Vitesse ? Dex+Reflexes ?)
- 🔴 **Calcul des dégâts d'arme** ("F+3" = Force + 3 ?)
- 🔴 **Rôle des armures** (réduction ? malus vitesse ?)
- 🔴 **Seuils vitalité/énergie** (mort, KO, conscience)

---

## Domaine 9 — Dés & résolution

**Sources** :
- 🟢 [documents/regles/index.md:319-337](documents/regles/index.md) — D10 actions, difficulté 7 standard
- 🟢 [documents/regles/index.md:23-47](documents/regles/index.md) — D20 pour volonté (1 = échec, 20 = réussite auto)
- 🟢 [outils/lanceur-de-des/](outils/lanceur-de-des/) — docs outil
- 🟢 [raw-html/dice-roller.html](raw-html/dice-roller.html)
- 🟢 [site/user/dice-roller.php](site/user/dice-roller.php)

**Règles** :
- D10 actions, succès = chaque dé ≥ difficulté. Pro moyen = 4 réussites.
- D20 volonté, succès = roll ≥ F.Volonté. Critiques : 1 / 20.

**Complétude** : 🟡

**Trous** :
- Autres types de dés ? (rien vu pour D6/D12)
- Échec critique D10 (quand ?)
- Gradation de l'échec (0 réussites = ?)

---

## Domaine 10 — Progression / XP / niveaux

**Sources** :
- 🟢 [documents/regles/index.md:206-223](documents/regles/index.md) — formule niveau (primaire = 2 pts/point, autres = 1 pt/point, magicien sort = 2 pts/point)
- 🟢 [documents/regles/index.md:232-248](documents/regles/index.md) — XP par session (1–8 pts + 1 pt quête)
- 🟡 [documents/atouts-niveaux/index.md](documents/atouts-niveaux/index.md) — atouts de niveau par condition
- 🟢 [site/includes/managers/_DBManager.php:499-525, 2356-2394](site/includes/managers/_DBManager.php) — `getAllAssetsMergeLevels`, `insertAssetsMergeLevels`

**Formule seuil niveau** : `seuil_N = N × catégorie_race`.

**Complétude** : 🟡

**Trous** :
- 🔴 **Coût XP pour +1 point** (aptitude / compétence / école magique / sort)
- Conditions de déblocage des atouts de niveau (race + classe + "special condition")

---

## Domaine 11 — Équipement

### 11A — Armes
- 🟢 [documents/armes/index.md](documents/armes/index.md) — ~106 armes (Nom, Dégâts, Type, Diff, Poids, Spécial)
- 🟢 [site/includes/managers/_DBManager.php:211-229](site/includes/managers/_DBManager.php) — `formatWeaponsArray`
- 🔴 **Notation "F+3"** à expliciter (probable : dégâts = Force + modificateur)

### 11B — Potions
- 🟢 [documents/potions/index.md](documents/potions/index.md) — ~50 potions, recettes très détaillées (ingrédients, procédure, difficulté d'Alchimie)
- 🟢 [site/includes/managers/_DBManager.php:181-192](site/includes/managers/_DBManager.php) — `formatPotionArray`

### 11C — Armures / protections
- 🔴 **Très lacunaire** — pas de liste distincte. Probablement dans [documents/atouts/index.md](documents/atouts/index.md) (à vérifier).
- 🔴 **Règles d'armure** (réduction dégâts, malus vitesse) non explicitées

**Complétude** : 🟡 armes 🟢 potions 🟢 armures 🔴

---

## Domaine 12 — PNJ (modèle unifié PJ/PNJ)

**Principe** *(confirmé par l'auteur)* : **pas de bestiaire séparé**. PJ et PNJ partagent **le même modèle de personnage** (races, attributs, compétences, sorts). La seule différence est la **source de contrôle** : joueur humain, MJ humain, MJ LLM, ou IA automatique.

Les "monstres" qu'on trouve dans d'autres jeux (dragons, démons, morts-vivants…) sont ici des **races jouables** présentes dans [documents/bestiaire/index.md](documents/bestiaire/index.md) : Demon, Dêmonomanoïde, Dryade, Elfe sombre, etc. — 32 races au total, toutes utilisables pour PJ comme PNJ.

**Sources** :
- 🟢 [documents/bestiaire/index.md](documents/bestiaire/index.md) — 32 races (= couvre aussi les "monstres")
- 🟢 [site/includes/class/Npc.php](site/includes/class/Npc.php) — structure PNJ (à lire pour confirmer qu'elle ne diverge pas de `Character`)
- 🟢 [site/includes/class/Character.php](site/includes/class/Character.php), [site/includes/class/CharacterPlayer.php](site/includes/class/CharacterPlayer.php)

**Complétude** : 🟢 (modèle données) — 🔴 **règles de contrôle PNJ** (à construire selon les 3 modes MJ)

**Ce qui reste à définir en Phase 1** :
- Flags/champs qui distinguent un PJ "jouable" d'un PNJ "MJ-controlled" (probablement un simple `ownerType` / `controlledBy`)
- Règles de passation de contrôle (switch MJ↔PJ évoqué par l'auteur)
- Pour le mode MJ LLM / IA auto : quelles données doivent être injectées/lues (personnalité, objectifs, comportement combat) — ce sont des **méta-données optionnelles** par-dessus le modèle de base

---

## Bonus — Géographie / univers

**Sources** :
- 🟢 [documents/cartes/index.md](documents/cartes/index.md) — 15 régions indexées
- 🟢 [site/download/map/](site/download/map/) — 15 cartes JPG HD
- 🟡 [monde/regions/](monde/regions/) — 5 régions détaillées (dont Cortega)
- 🟡 [monde/villes/](monde/villes/) — 9 villes
- 🟡 [monde/lieux/](monde/lieux/) — 17 lieux jouables
- 🟢 [site/includes/managers/_DBManager.php:666-689](site/includes/managers/_DBManager.php) — `getAllPlaces`

**Régions connues** : Alteria, Collines d'Ico, Cortega, Dêtre, Dundoria, Empire, Enorie, Fauche-le-Vent, Forêt de Tyrkan, Haut Royaume, Irtanie, Portes d'Azrak, Sombre Monde, Terres du Nord, Yonkado.

**Trous** : relations politiques, historique, factions, cultes.

---

## Bonus — Fiches de joueurs réelles

**Sources** :
- 🟡 [personnages/fiches/](personnages/fiches/) — 96 fiches markdown (données partielles : nom, race, classe, lieu, attribut-échantillon)
- Les fiches complètes existent dans la DB du site (inaccessible), mais ces 96 exemples servent de **validateurs de règles** (cas réels)

**Usage Phase 1** : confronter chaque règle proposée à un échantillon de fiches pour s'assurer qu'elle génère des valeurs cohérentes avec les persos existants.

---

## Bonus — Social / forum / arène / taverne

**Sources** :
- 🔴 Règles RP très minimales dans les documents
- 🟡 [raw-html/details/play.php_place-id-*.html](raw-html/details/) — captures forum par lieu (activité importante : ~500 posts pour lieu 2)
- [site/user/forum.php](site/user/forum.php), [site/user/tavern.php](site/user/tavern.php), [site/includes/managers/user/ChallengeMan.php](site/includes/managers/user/ChallengeMan.php)

**Trous** :
- 🔴 Règles formelles RP / modération
- 🔴 Règles de challenge/arène (PvP arbitré)
- 🔴 Économie (argent, commerce — mentionné mais non spécifié)

---

## Formules cachées dans le code — à extraire en Phase 1

À lire en détail dans [site/includes/managers/_DBManager.php](site/includes/managers/_DBManager.php) + managers `user/` :

| Question | Où chercher |
|---|---|
| Formule `vitalityMax` | colonnes `characters` + AddCharacterMan / UpdateCharacter |
| Formule `energyMax` | idem |
| `speedFactor` et `willFactor` (init + encombrement) | Character.php + _DBManager |
| Calcul initiative combat | FightAssistantMan.php |
| Calcul dégâts arme | FightAssistantMan / fight.php |
| Effet des armures | idem |
| Coût XP pour amélioration | UpdateCharacterMan / managers `update-character-*.php` |
| Mapping classe → compétence primaire | AddCharacterMan ou table jointure dans DB |
| Atouts par race / orientation / classe | `AssetsMergeLevels` + tables |

---

## Synthèse

### Ce qu'on a (70 %)
- Règles narratives complètes (attributs, création, combat macro, XP)
- Le Grand Grimoire (11 écoles, ~sorts tous stats)
- 32 races jouables avec stats
- ~106 armes, ~50 potions (recettes détaillées)
- ~100 compétences en familles
- 53 classes listées
- Géographie et cartes
- 96 fiches de joueurs pour validation

### Trous critiques (30 %)
- Formules dérivées (vitalité max, énergie max, initiative, dégâts) — dans le code
- Atouts par race / classe / orientation — à réconcilier entre [atouts/](documents/atouts/) et [atouts-niveaux/](documents/atouts-niveaux/)
- Coût XP pour améliorations — dans le code
- Armures (règles et liste)
- Règles de contrôle PNJ (MJ humain / LLM / IA) — modèle de perso unifié, pas de bestiaire séparé
- Règles sociales / économie / religion-divinités

### Ordre proposé pour Phase 1

1. **Résolution** (D9) — base mécanique, facile à figer
2. **Attributs** (D1) + formules dérivées (lecture code)
3. **Races** (D2) + réconciliation atouts raciaux *(couvre aussi les "créatures-monstres" vu le modèle unifié)*
4. **Classes** (D3) + orientations (D4) + atouts
5. **Compétences** (D5) + mapping primaires
6. **Création de personnage** (D6) — assemble 1→5
7. **Progression / XP** (D10) — formules de coût (lecture code)
8. **Magie** (D7) — 11 écoles, sorts
9. **Combat** (D8) — formules initiative/dégâts/armures (lecture code)
10. **Équipement** (D11) — armes, armures, potions, crafting
11. **Contrôle PNJ** (D12) — sur le même modèle de perso, règles de contrôle par mode (joueur / MJ humain / MJ LLM / IA auto)
12. **Géographie + social + économie** — ensemble
13. **Rôles & passation MJ↔PJ** (D13) — mécanisme de switch de rôle en cours de partie (qui peut devenir MJ temporairement, à quelles conditions, avec quelles restrictions)

Chaque domaine produit un doc canonique `rules/01-resolution.md`, `rules/02-attributs.md`, etc., validé par toi avant passage au suivant.

**Note méthodologique** : les règles ont été transmises majoritairement à l'oral. Les docs écrits (site scraped) peuvent donc avoir des trous ou des imprécisions que l'auteur a en tête mais n'a jamais formalisées. Le travail de Phase 1 consiste autant à **extraire** qu'à **clarifier** par dialogue avec l'auteur.
