# D4 — Orientations, classes, et atouts

> Domaine cardinal du système. Couvre les **13 orientations**, leurs ~60 classes, leurs atouts (orientation, classe, niveau), ainsi que l'atout pivot **Polyvalence**. C'est ici que vit le moteur d'extension du personnage.

**Sources** :
- [regles-papier/extracted/listes/orientations-et-classes.md](regles-papier/extracted/listes/orientations-et-classes.md) — paper, 192 lignes, 13 orientations
- [documents/classes/index.md](documents/classes/index.md) — web **canonique**, ajoute 11 classes (67 au total)
- [regles-papier/extracted/listes/lexique.md](regles-papier/extracted/listes/lexique.md) — descriptions des atouts (1200 lignes)
- [regles-papier/extracted/listes/atouts-de-niveaux.md](regles-papier/extracted/listes/atouts-de-niveaux.md) — atouts par niveau (450 lignes)
- [documents/regles/index.md:54-65, 206-222](documents/regles/index.md) — règles orientations/classes + compétence primaire

> **Correction majeure vs D3** : ce qu'on appelait "9 orientations" est en fait **13 orientations**. Je corrigerai retroactivement les renvois D2/D3 vers D4.

---

## Partie A — Règles transversales

### R-4.1 — Orientations et classes : modèle hiérarchique

**Énoncé legacy** — [documents/regles/index.md:54-60](documents/regles/index.md) :

> Les orientations et classes sont synonymes de secteurs et métiers. Un peintre travaille dans le secteur artistique, c'est donc un artiste. Mais plus précisément, il est peintre. Dans ce cas, l'orientation est "artiste" et la classe est "peintre".

**Modèle** : Orientation = grand secteur (Artiste). Classe = métier précis (Peintre). Une classe appartient à **exactement une** orientation (sauf cas litigieux à arbitrer).

**Statut** : 🟢 claire

### R-4.2 — Chaque orientation octroie un atout d'orientation (toujours éphémère, sauf magicien)

**Énoncé legacy** — [documents/regles/index.md:59](documents/regles/index.md) :
> Chaque orientation donne droit à un atout d'orientation et chaque classe, à un atout de classe.

**Précision règles** — [regles:77](documents/regles/index.md) : « Les atouts d'orientation (toujours éphémères) ».

**Sauf exception** : l'orientation **Magicien** a son atout d'orientation **« Familier »** qui est tagué **(Permanent)** dans le lexique — voir partie B catalogue.

**Statut** : 🟢 claire

### R-4.3 — Chaque classe octroie 2 atouts de classe (Q-D2 confirmé)

Précisé par l'auteur (D2 Q-2-bis-a) :
- **1 atout permanent** qui suit le pattern « ajoute des dés en fonction du niveau »
- **1 atout éphémère** avec base de 2 usages/jour, augmentable via XP au coût NA × 10

**Pattern de l'atout permanent** ([lexique:118-119](regles-papier/extracted/listes/lexique.md) ex. Art littéraire) :
> « Additionne le niveau au nombre de dés lorsque le personnage [action de la classe]. (permanent) »

→ Le bonus dés s'ajoute au pool R-1.2, pour des actions dans le **domaine de la classe**.

**L'atout éphémère** : effet variable selon la classe (peut être un coup spécial, une réduction de difficulté ciblée, un avantage ponctuel). 2 usages/jour minimum, augmentable.

**Note importante** : pour **40 classes sur 53/67**, l'atout éphémère **n'est pas explicitement listé** dans le lexique paper en tant que tel. Les éphémères de classe semblent vivre dans `atouts-de-niveaux.md` (gated par classe à un niveau ≥ 2). À clarifier en Q-D4.X.

**Statut** : 🟡 partielle (perm 53/53 OK, éph ~13/53 documenté).

### R-4.4 — Atout d'orientation : usage par jour & progression XP

L'atout d'orientation suit la même mécanique que l'atout de classe éphémère :
- Base : 2 usages/jour minimum
- Coût XP pour +1 usage/jour : NA × 10 (Experience.doc, cf. R-2.20)

**Exception magicien** : « Familier » est permanent (pas une question d'usages/jour, mais d'attachement permanent à une créature secondaire).

**Statut** : 🟢 claire

### R-4.5 — Mapping classe → compétence primaire

**Énoncé legacy** — [documents/regles/index.md:209-222](documents/regles/index.md) :

> La compétence primaire représente la fonction première de la classe.
> Bûcheron → Bûcheronnage
> Cuisinier → Cuisine
> Forgeron → Forge
> Soldat → Son arme (épée à une main, hache, etc)
> Dessinateur → Dessin
>
> Certaines classes (comme les pirates) ne trouveront pas de compétence primaire qui coule de source. Dès lors, c'est au joueur de choisir [...] pour autant qu'un rapport direct et évident puisse être fait.
>
> Un personnage ne peut avoir qu'une seule compétence primaire.
>
> **Attention, les magiciens n'ont pas de compétence primaire.** Ils comptent normalement les points des compétences et spécialisations comme 1, et les points qu'ils possèdent dans leurs sorts comme 2.

**Statut** : 🟢 claire

**Implications** :
- Pour les classes "évidentes" : mapping figé (Forgeron → Forge, etc.).
- Pour les classes ambiguës (Pirate, Voleur, Hors-la-loi générique) : **choix joueur** au moment de la création, validé par le MJ / moteur (rapport direct et évident requis).
- **Magiciens** : pas de compétence primaire, sorts ×2 à la place dans le calcul de levelPoints (déjà confirmé en D2 R-2.20 / Q-D2.7).

### R-4.6 — Polyvalence : atout pivot du système

**Source** : [lexique:857-858](regles-papier/extracted/listes/lexique.md)

> « Le personnage peut désormais choisir ses atouts de niveaux dans toutes les orientations (les classes et les conditions restent restrictives) jusqu'à un niveau égal à son nombre de point en « Polyvalence » + 1. Cet atout compte comme atout à part entière et ne permet pas de choisir un autre atout lorsqu'on le choisit.
>
> Par exemple, un guerrier niveau 5 choisit cet atout. Il pourra donc, quand il passera niveau 6, prendre un atout d'artiste niveau 2 (Polyvalence : 1 + 1). Il devra reprendre l'atout « Polyvalence » s'il désire accéder aux atouts de niveau 3 des orientations qui ne sont pas la sienne. Néanmoins, il ne pourra pas choisir l'atout « Musique stimulante » qui est réservé aux bardes car la polyvalence permet juste d'annuler la barrière de l'orientation. »

**Statut** : 🟢 claire

**Mécanique précise** :
- Chaque point en Polyvalence ouvre l'accès aux **atouts d'orientations différentes** jusqu'au niveau `Polyvalence + 1`.
- **Restrictions persistantes** :
  - Atouts spécifiques à une **classe** (ex: Musique stimulante = barde uniquement) restent **fermés**.
  - Atouts avec **conditions explicites** (race, autre atout, score minimum) restent **gated**.
- **Le choix de Polyvalence consomme le slot d'atout du niveau** (au lieu d'un autre atout de l'orientation/classe).
- **Cumulable** : pour passer de "atouts d'autres orientations N1" → "...N2" → "...N3", il faut **re-prendre Polyvalence** à chaque palier.

**Implications design** :
- Polyvalence permet des builds hybrides (Guerrier qui apprend des atouts d'Intellectuel, ou de Magicien sans en être un).
- Coût opportuniste : chaque point de Polyvalence est un atout "perdu" pour la spécialité d'origine, mais ouvre une nouvelle dimension.
- La pool de choix au level-up se calcule dynamiquement selon le score actuel de Polyvalence.

### R-4.7 — Pool d'atouts au passage de niveau (rappel D3)

D'après R-3.4 (D3) :
- Au niveau N, le joueur **débloque** tous les atouts de niveau ≤ N accessibles à son perso (selon race, orientation, classe, conditions, Polyvalence).
- Choix libre dans cette pool.
- Atouts permanents non-cumulables déjà acquis sont **filtrés**.
- Atouts éphémères restent toujours dans la pool (cumulables → +1 usage/jour).
- **Atouts spécifiques à une classe restreinte** (ex: « Musique stimulante » barde) ne sont accessibles qu'à un perso de cette classe — Polyvalence ne les débloque pas.

**Statut** : 🟢 claire

### R-4.8 — Modèle de données

```sql
orientations(id, name, description, orientation_feat_id)
classes(id, name, orientation_id, primary_skill_default_id, perm_feat_id, eph_feat_id, description)
feats(id, name, description, type {permanent|ephemere}, source_type {orientation|class|level|race|equip|spell}, source_id, level_required, conditions_json, is_cumulable, is_xp_buyable_per_use)
character_feats(character_id, feat_id, instances_count, source_log)
character_resistances(character_id, type, value, source) -- déjà défini en D3 R-3.5/Q-D3.8
```

Chaque atout est référencé par son `id` et son `source_*` permet de tracer l'origine (race, classe, orientation, niveau, sort actif…). Le moteur peut filtrer dynamiquement la pool d'atouts choisissables au level-up et calculer les bonus effectifs.

---

## Partie B — Catalogue des 13 orientations

### Tableau de synthèse

| # | Orientation | Atout d'orientation | Type | Effet |
|---|---|---|---|---|
| 1 | **Artisan** | Production | Éph | -5 difficulté pour la construction d'un objet (domaine de prédilection) |
| 2 | **Artiste** | Magnétisme | Éph | -5 difficulté pour plaire (domaine de prédilection) |
| 3 | **Commerçant** | Sens des affaires | Éph | -5 difficulté lors d'un jet de commerce |
| 4 | **Domestique** | Service | Éph | -5 difficulté lors d'un jet domestique (domaine de prédilection) |
| 5 | **Guerrier** | Maîtrise martiale | Éph | -5 difficulté d'une manœuvre martiale (domaine de prédilection) |
| 6 | **Hors-la-loi** | Discrétion | Éph | -5 difficulté sur un jet de furtivité |
| 7 | **Intellectuel** | Réflexion | Éph | -5 difficulté d'un jet basé sur l'intelligence |
| 8 | **Magicien** | Familier | **Perm** | Familier de 5 PV/niveau, peut acquérir des compétences via XP |
| 9 | **Malfaisant** | Méfait | Éph | -5 difficulté lorsque le perso nuit à autrui |
| 10 | **Ouvrier** | Ouvrage | Éph | -5 difficulté pour un ouvrage (domaine de prédilection) |
| 11 | **Paysan** | Paysannerie | Éph | -5 difficulté lors d'un jet de paysannerie (domaine de prédilection) |
| 12 | **Religieux** | Foi | Éph | -5 difficulté d'un jet de volonté |
| 13 | **Voyageur** | Périple | Éph | -5 difficulté d'une manœuvre de déplacement / voyage (moyen de locomotion de prédilection) |

> **NB** : les atouts éphémères d'orientation ont une base de 2 usages/jour (R-4.4), augmentable via XP NA × 10. La « domaine de prédilection » est le périmètre étroit de la classe du perso (ex: pour un Forgeron, le domaine de prédilection de Production = forge spécifiquement).

### Catalogue détaillé des atouts d'orientation

| Atout | Description (lexique) | Référence |
|---|---|---|
| **Production** (Artisan) | « Diminue la difficulté de 5 pour la construction d'un objet (dans leur secteur de prédilection). » | [lexique:873](regles-papier/extracted/listes/lexique.md) |
| **Magnétisme** (Artiste) | « Diminue la difficulté pour plaire, dans le domaine de prédilection, de 5. » | [lexique:648](regles-papier/extracted/listes/lexique.md) |
| **Sens des affaires** (Commerçant) | « Diminue la difficulté de 5 lors d'un jet impliquant des affaires de commerce. » | [lexique:1043](regles-papier/extracted/listes/lexique.md) |
| **Service** (Domestique) | « Diminue la difficulté de 5 lors d'un jet basé sur les tâches domestiques (dans le domaine de prédilection). » | [lexique:1060](regles-papier/extracted/listes/lexique.md) |
| **Maîtrise martiale** (Guerrier) | « Diminue de 5 la difficulté d'une manœuvre martiale dans le domaine de prédilection. » | [lexique:690](regles-papier/extracted/listes/lexique.md) |
| **Discrétion** (Hors-la-loi) | « Diminue la difficulté de 5 sur un jet de furtivité. » | [lexique:359](regles-papier/extracted/listes/lexique.md) |
| **Réflexion** (Intellectuel) | « Cet atout diminue la difficulté d'un jet basé sur l'intelligence de 5. » | [lexique:916](regles-papier/extracted/listes/lexique.md) |
| **Familier** (Magicien) | « Le personnage est aidé d'une créature qui peut prendre n'importe quelle forme. Celle-ci n'a cependant que 5 point de vitalité par niveau du personnage [...]. À chaque passage de niveau, le familier renaît, ce qui implique qu'il peut décider de conserver sa forme ou de la solder pour une autre [...]. Le personnage peut décider d'investir des points d'expérience pour ajouter des compétences et spécialisations à son familier. » | [lexique:461](regles-papier/extracted/listes/lexique.md) |
| **Méfait** (Malfaisant) | « Diminue la difficulté de 5 lorsque le personnage nuit à un autre. » | [lexique:699](regles-papier/extracted/listes/lexique.md) |
| **Ouvrage** (Ouvrier) | « Diminue de 5 la difficulté pour un ouvrage dans le domaine de prédilection. » | [lexique:794](regles-papier/extracted/listes/lexique.md) |
| **Paysannerie** (Paysan) | « Diminue la difficulté de 5 lors d'un jet basé sur la paysannerie (dans le domaine de prédilection). » | [lexique:824](regles-papier/extracted/listes/lexique.md) |
| **Foi** (Religieux) | « Diminue la difficulté d'un jet de volonté de 5. » | [lexique:478](regles-papier/extracted/listes/lexique.md) |
| **Périple** (Voyageur) | « Diminue la difficulté de 5 une manœuvre de déplacement ou un jet basé sur le voyage (avec le moyen de locomotion de prédilection). » | [lexique:834](regles-papier/extracted/listes/lexique.md) |

---

## Partie C — Catalogue des classes par orientation

> Pour chaque classe : nom, compétence primaire (par défaut), atout permanent identifié, atout éphémère identifié (ou ⚠️ à compléter), source web/paper.

### C.1 Artisan (8 paper / 11 web)

| Classe | Compétence primaire | Atout perm | Atout éph | Web only |
|---|---|---|---|---|
| Bijoutier | Bijouterie ou Orfèvrerie | **Orfèvrerie** | ⚠️ | |
| Charpentier | Charpenterie | ⚠️ | ⚠️ | ✓ |
| Couturier | Couture | **Travail du textile** | ⚠️ | |
| Facteur d'arc | Travail de l'arc | **Travail de l'arc** | ⚠️ | |
| Forgeron | Forge | **Travail du métal** | ⚠️ | |
| Menuisier | Menuiserie | **Travail du bois** | ⚠️ | |
| Parfumeur | Parfumerie | ⚠️ | ⚠️ | ✓ |
| Potier | Poterie | **Travail du récipient** | ⚠️ | |
| Tanneur | Tannerie | ⚠️ | ⚠️ | ✓ |
| Tonnelier | Tonnellerie | **Art du tonneau** | ⚠️ | |
| Vannier | Vannerie | **Art de la vannerie** | ⚠️ | |

### C.2 Artiste (9)

| Classe | Compétence primaire | Atout perm | Atout éph |
|---|---|---|---|
| Barde | Musique / Chant | **Son envoûtant** | **Musique stimulante** |
| Chanteur | Chant | **Voix intense** | **Chant envoûtant** (N4) |
| Comédien | Comédie | **Sens de la scène** | **Maître du mensonge** |
| Conteur | Narration | **Narration palpitante** | ⚠️ |
| Danseur | Danse | **Agilité** | **Partenaire idéal** |
| Dessinateur | Dessin | **Coup de crayon** | **Mémoire photographique** |
| Écrivain | Écriture | **Art littéraire** | ⚠️ |
| Peintre | Peinture | **Coup de pinceau** | **Mémoire photographique** |
| Prestidigitateur | Prestidigitation | **Tour de passe-passe** | ⚠️ |

### C.3 Commerçant (3 paper / 6 web)

| Classe | Compétence primaire | Atout perm | Atout éph | Web only |
|---|---|---|---|---|
| Aubergiste | Gestion d'auberge | ⚠️ | ⚠️ | ✓ |
| Chasseur | Chasse | **Art de la chasse** | ⚠️ | |
| Marchand | Commerce / Marchandage | **Esprit mercatique** | ⚠️ | |
| Pêcheur | Pêche | **Art de la pêche** | ⚠️ | |
| Prostitué | (à définir) | ⚠️ | ⚠️ | ✓ |
| Tavernier | Gestion de taverne | ⚠️ | ⚠️ | ✓ |

> Note : « Chasseur » apparaît à la fois en Commerçant et en Domestique selon les sources. À arbitrer — probable que la version web restreigne à une seule orientation.

### C.4 Domestique (4 paper / 4 web)

| Classe | Compétence primaire | Atout perm | Atout éph |
|---|---|---|---|
| Cuisinier | Cuisine | **Cordon bleu** | ⚠️ |
| Jardinier | Jardinage | **Main verte** | ⚠️ |
| Serf | Servitude | **Servitude** | ⚠️ |
| Soubrette | Servitude | **Servitude** | ⚠️ |

### C.5 Guerrier (14 paper / 15+ web)

| Classe | Compétence primaire | Atout perm | Atout éph | Web only |
|---|---|---|---|---|
| Arbalétrier | Arbalète | **Précision** | **Recharge rapide** | |
| Archer | Arc court ou long | **Précision** | **Recharge rapide** | |
| Barbare | Combat brut / Force | **Fureur guerrière** | ⚠️ | |
| Berzerker | Force | **Folie furieuse** | ⚠️ | |
| Cavalier | Équitation | **Maîtrise équestre** | ⚠️ | |
| Chasseur de magicien | (à définir) | ⚠️ | ⚠️ | ✓ |
| Chasseur de primes | Investigation / Chasse | **Vigilance** | ⚠️ | |
| Duelliste | Duel | **Duel** | **Connaissance de l'ennemi** | |
| Fantassin | Mêlée | **Coup décisif** | ⚠️ | |
| Fantassin léger | Mêlée légère | **Coup décisif** | ⚠️ | |
| Fantassin lourd | Mêlée lourde | **Coup décisif** | ⚠️ | |
| Garde | Combat défensif | **Défense** | ⚠️ | |
| Garde du corps | Protection | ⚠️ | ⚠️ | ✓ |
| Justicier | Combat juste / Foi | **Juste cause** | Multiple atouts (Apaisement, Protection divine, Dulcinée…) | |
| Mercenaire | Combat | ⚠️ | ⚠️ | ✓ |
| Samouraï | Sabre / Honneur | **Coup décisif** | ⚠️ | |
| Tueur de monstres | Chasse aux monstres | **Extermination** | **Tuons la bête** | |

### C.6 Hors-la-loi (6 paper / 7 web)

| Classe | Compétence primaire | Atout perm | Atout éph | Web only |
|---|---|---|---|---|
| Assassin | (choix joueur, ex: Assassinat) | **Assassinat** | **Coup mortel** | |
| Braconnier | Chasse illégale | **Art de la chasse** | ⚠️ | |
| Escroc | (choix joueur) | ⚠️ | ⚠️ | ✓ |
| Espion | Espionnage | **Espionnage** | ⚠️ | |
| Ninja | Ninja-jitsu / Furtivité | **Dissimulation** | **Mimétisme** | |
| Voleur | (choix joueur, ex: Subtilisation) | **Subtilisation** | **Invisibilité** | |
| Voleur à la tire | Pickpocket | **Touché léger** | ⚠️ | |

### C.7 Intellectuel (8)

| Classe | Compétence primaire | Atout perm | Atout éph |
|---|---|---|---|
| Alchimiste | Alchimie | **Science de la vie** | **Connaisseur** |
| Herboriste | Herboristerie | **Science naturelle** | ⚠️ |
| Joueur de poker | Jeu / Bluff | **Anti-bluff** | **Bluff** |
| Médecin | Médecine | **Guérison** | **Apaisement** (cross-orientation) |
| Philosophe | Philosophie | **Pensée profonde** | ⚠️ |
| Politicien | Politique | **Sens politique** | **Maître du mensonge** (cross) |
| Précepteur | Enseignement | **Culture générale** | Multiple (Ami des touts petits, Enseignement efficace) |
| Scribe | Écriture | **Art littéraire** | ⚠️ |

### C.8 Magicien (12)

> **Pas de compétence primaire** (R-4.5). Les sorts comptent ×2 dans levelPoints. L'atout d'orientation est **Familier** (permanent, pas éphémère).

| Classe | École de magie | Atout perm | Atout éph |
|---|---|---|---|
| Abjurateur | Magie Jaune | **Magie jaune** | **Énergie au déshonneur** (N4) |
| Altérateur | Magie Rouge | **Magie rouge** | ⚠️ |
| Chaman | Magie Verte | **Magie verte** | ⚠️ |
| Clerc | Magie Blanche | **Magie blanche** | **Aura bénéfique** (N8) |
| Devin | Magie Brune | **Magie brune** | **Ressentir le magicien** (N3) |
| Druide | Magie Verte | **Magie verte** | ⚠️ |
| Élémentaliste | Magie Bleue | **Magie bleue** | **Énergie à l'honneur** (N4) |
| Enchanteur | Magie Turquoise | **Magie turquoise** | ⚠️ |
| Illusionniste | Magie Violette | **Magie violette** | ⚠️ |
| Invocateur | Magie Orange | **Magie orange** | **Liens spirituels** (N3) |
| Nécromancien | Magie Grise | **Magie grise** | Multiple (Sentir la mort, Mobilisation post-mortem, etc.) |
| Sorcier | Magie Noire | **Magie noire** | **Aura maléfique** (N8) |

### C.9 Malfaisant (à inventorier — paper ligne 141)

> Cette orientation est citée dans la TDM de orientations-et-classes.md mais ses **classes spécifiques ne sont pas extraites** par l'agent. À vérifier.

### C.10 Ouvrier (1)

| Classe | Compétence primaire | Atout perm | Atout éph |
|---|---|---|---|
| Bûcheron | Bûcheronnage | **Coupe du bois** | Multiple (Coup du bûcheron, Maîtrise de la hache, etc.) |

### C.11 Paysan (7)

| Classe | Compétence primaire | Atout perm | Atout éph |
|---|---|---|---|
| Agriculteur | Agriculture | **Main verte** | ⚠️ |
| Apiculteur | Apiculture | **Élevage** | ⚠️ |
| Berger | Élevage | **Élevage** | ⚠️ |
| Chevrier | Élevage | **Élevage** | ⚠️ |
| Éleveur de bovidés | Élevage | **Élevage** | ⚠️ |
| Éleveur de volailles | Élevage | **Élevage** | ⚠️ |
| Porcher | Élevage | **Élevage** | ⚠️ |

### C.12 Religieux (3)

| Classe | Compétence primaire | Atout perm | Atout éph |
|---|---|---|---|
| Exorciste | Exorcisme (cond: Dieu unique) | **Vade rétro** | ⚠️ |
| Inquisiteur | Inquisition (cond: Dieu unique) | **Inquisition** | ⚠️ |
| Prêtre | Prédication | **Parole divine** | ⚠️ |

### C.13 Voyageur (4 paper / 5 web)

| Classe | Compétence primaire | Atout perm | Atout éph | Web only |
|---|---|---|---|---|
| Éclaireur | Reconnaissance | ⚠️ | ⚠️ | ✓ |
| Navigateur | Navigation / Voile | **Loup de mer** | ⚠️ | |
| Pirate | (choix joueur, ex: Navigation) | **Abordage** | ⚠️ | |
| Ranger | Pistage / Wilderness | **Boussole interne** | ⚠️ | |
| Rôdeur | Wilderness / Chasse | **Traque** | ⚠️ | |

---

## Partie D — Catalogue des atouts permanents de classe (53)

Pattern récurrent : « Additionne le niveau au nombre de dés lorsque le personnage [action de classe]. (permanent) ».

| Atout | Classe(s) | Description | Référence |
|---|---|---|---|
| Abordage | Pirate | « Additionne le niveau au nombre de dés lors d'un combat sur un navire. » | [lexique:40](regles-papier/extracted/listes/lexique.md) |
| Agilité | Danseur | « Additionne le niveau au nombre de dés lors d'un jet de danse. » | [lexique:57](regles-papier/extracted/listes/lexique.md) |
| Anti-bluff | Joueur de poker | « Additionne le niveau au nombre de dés pour déceler les mensonges. » | [lexique:78](regles-papier/extracted/listes/lexique.md) |
| Art de la chasse | Chasseur, Braconnier | « Cet atout additionne le niveau au nombre de dès lorsque le personnage chasse. » | [lexique:106](regles-papier/extracted/listes/lexique.md) |
| Art de la pêche | Pêcheur | « Cet atout additionne le niveau au nombre de dès lorsque le personnage pêche. » | [lexique:109](regles-papier/extracted/listes/lexique.md) |
| Art du tonneau | Tonnelier | « Cet atout additionne le niveau au nombre de dès lorsque le personnage confectionne un tonneau. » | [lexique:112](regles-papier/extracted/listes/lexique.md) |
| Art littéraire | Écrivain, Scribe | « Additionne le niveau au nombre de dès lorsque le personnage écrit. » | [lexique:118](regles-papier/extracted/listes/lexique.md) |
| Art de la vannerie | Vannier | « Cet atout additionne le niveau au nombre de dès lorsque le personnage fait un travail de vannerie. » | [lexique:103](regles-papier/extracted/listes/lexique.md) |
| Assassinat | Assassin | « Additionne le niveau au nombre de dés lorsque le personnage assassine quelqu'un. » | [lexique:122](regles-papier/extracted/listes/lexique.md) |
| Boussole interne | Ranger | « Additionne le niveau au nombre de dés lors d'un jet basé sur l'orientation. » | [lexique:172](regles-papier/extracted/listes/lexique.md) |
| Cordon bleu | Cuisinier | « Additionne le niveau au nombre de dés lorsque le personnage cuisine. » | [lexique:261](regles-papier/extracted/listes/lexique.md) |
| Coup de crayon | Dessinateur | « Additionne le niveau au nombre de dés lorsque le personnage dessine. » | [lexique:281](regles-papier/extracted/listes/lexique.md) |
| Coup décisif | Fantassin (×3), Samouraï | « Additionne le niveau au nombre de dés pour toucher, lorsque le personnage utilise son arme de prédilection. » | [lexique:283](regles-papier/extracted/listes/lexique.md) |
| Coup de pinceau | Peintre | « Additionne le niveau au nombre de dés lorsque le personnage peint. » | [lexique:282](regles-papier/extracted/listes/lexique.md) |
| Coupe du bois | Bûcheron | « Additionne le niveau au nombre de dés lorsque le personnage bûcheronne. » | [lexique:286](regles-papier/extracted/listes/lexique.md) |
| Culture générale | Précepteur | « Additionne le niveau au nombre de dés lors d'un jet de connaissance. » | [lexique:311](regles-papier/extracted/listes/lexique.md) |
| Défense | Garde | « Additionne le niveau au nombre de dés lors d'un combat défensif avec l'arme de prédilection. » | [lexique:318](regles-papier/etracted/listes/lexique.md) |
| Dissimulation | Ninja | « Additionne le niveau au nombre de dés lors d'un jet basé sur le camouflage. » | [lexique:362](regles-papier/extracted/listes/lexique.md) |
| Duel | Duelliste | « Additionne le niveau au nombre de dés lors d'un duel. » | [lexique:377](regles-papier/extracted/listes/lexique.md) |
| Élevage | Apiculteur, Berger, Chevrier, Éleveurs (3) | « Additionne le niveau au nombre de dés lorsque le personnage élève ses animaux de prédilections. » | [lexique:412](regles-papier/extracted/listes/lexique.md) |
| Espionnage | Espion | « Additionne le niveau au nombre de dés lors d'un jet d'espionnage. » | [lexique:447](regles-papier/extracted/listes/lexique.md) |
| Esprit mercatique | Marchand | « Additionne le niveau au nombre de dés lors d'un jet de marchandage. » | [lexique:453](regles-papier/extracted/listes/lexique.md) |
| Extermination | Tueur de monstres | « Additionne le niveau au nombre de dés lors d'un combat contre un ou plusieurs monstres. » | [lexique:460](regles-papier/extracted/listes/lexique.md) |
| Folie furieuse | Berzerker | « Additionne le niveau au nombre de dés lors d'un jet de force et endurance, lorsque le personnage est fou furieux [...] mais il réduit alors l'empathie, l'intelligence et la perception à 1. Cet état dure 25 DT/niveau (non réductible). » | [lexique:479](regles-papier/extracted/listes/lexique.md) |
| Fureur guerrière | Barbare | « Additionne le niveau au nombre de dés lors d'un jet de force, pendant un combat. » | [lexique:494](regles-papier/extracted/listes/lexique.md) |
| Guérison | Médecin | « Additionne le niveau au nombre de dés lors d'une intervention médicinale. » | [lexique:504](regles-papier/extracted/listes/lexique.md) |
| Inquisition | Inquisiteur | « Ajoute son niveau en dès lors d'un jet d'investigation religieuse. » | [lexique:543](regles-papier/extracted/listes/lexique.md) |
| Juste cause | Justicier | « Additionne le niveau au nombre de dés lorsque le personnage défend les faibles (de manière directe). » | [lexique:575](regles-papier/extracted/listes/lexique.md) |
| Loup de mer | Navigateur | « Additionne le niveau au nombre de dés lorsque le personnage voyage en bateau. » | [lexique:626](regles-papier/extracted/listes/lexique.md) |
| Magie blanche | Clerc | -1 difficulté sorts blancs | [lexique:633](regles-papier/extracted/listes/lexique.md) |
| Magie bleue | Élémentaliste | -1 difficulté sorts bleus | [lexique:634](regles-papier/extracted/listes/lexique.md) |
| Magie brune | Devin | -1 difficulté sorts bruns | [lexique:635](regles-papier/extracted/listes/lexique.md) |
| Magie grise | Nécromancien | -1 difficulté sorts gris | [lexique:636](regles-papier/extracted/listes/lexique.md) |
| Magie jaune | Abjurateur | -1 difficulté sorts jaunes | [lexique:637](regles-papier/extracted/listes/lexique.md) |
| Magie noire | Sorcier | -1 difficulté sorts noirs | [lexique:638](regles-papier/extracted/listes/lexique.md) |
| Magie orange | Invocateur | -1 difficulté sorts oranges | [lexique:639](regles-papier/extracted/listes/lexique.md) |
| Magie rouge | Altérateur | -1 difficulté sorts rouges | [lexique:640](regles-papier/extracted/listes/lexique.md) |
| Magie turquoise | Enchanteur | -1 difficulté sorts turquoise | [lexique:642](regles-papier/extracted/listes/lexique.md) |
| Magie verte | Chaman, Druide | -1 difficulté sorts verts | [lexique:644](regles-papier/extracted/listes/lexique.md) |
| Magie violette | Illusionniste | -1 difficulté sorts violets | [lexique:646](regles-papier/extracted/listes/lexique.md) |
| Main verte | Jardinier, Agriculteur | « Additionne le niveau au nombre de dés lorsque le personnage entretien des végétaux. » | [lexique:652](regles-papier/extracted/listes/lexique.md) |
| Maîtrise équestre | Cavalier | « Additionne le niveau au nombre de dés pour une manœuvre équestre. » | [lexique:689](regles-papier/extracted/listes/lexique.md) |
| Narration palpitante | Conteur | « Additionne le niveau au nombre de dés pour raconter une histoire. » | [lexique:748](regles-papier/extracted/listes/lexique.md) |
| Orfèvrerie | Bijoutier | « Additionne le niveau au nombre de dés lorsque le personnage fait des travaux d'orfèvre. » | [lexique:778](regles-papier/extracted/listes/lexique.md) |
| Parole divine | Prêtre | « Additionne le niveau au nombre de dés lorsque le personnage prêche la bonne parole. » | [lexique:802](regles-papier/extracted/listes/lexique.md) |
| Pensée profonde | Philosophe | « Additionne le niveau aux dés lors d'un jet basé sur la philosophie. » | [lexique:826](regles-papier/extracted/listes/lexique.md) |
| Précision | Arbalétrier, Archer | « Additionne le niveau aux dés lors d'un jet de tir effectuer avec l'arme de prédilection. » | [lexique:864](regles-papier/extracted/listes/lexique.md) |
| Science de la vie | Alchimiste | « Additionne le niveau du personnage au nombre de dès lancés lors d'un jet d'alchimie. » | [lexique:1032](regles-papier/extracted/listes/lexique.md) |
| Science naturelle | Herboriste | « Additionne le niveau du personnage au nombre de dès lancés lors d'un jet d'herboristerie. » | [lexique:1034](regles-papier/extracted/listes/lexique.md) |
| Sens politique | Politicien | « Additionne le niveau au nombre de dés lors d'un jet basé sur la politique. » | [lexique:1052](regles-papier/extracted/listes/lexique.md) |
| Sens de la scène | Comédien | « Additionne le niveau au nombre de dés lors d'un jet de comédie. » | [lexique:1040](regles-papier/extracted/listes/lexique.md) |
| Servitude | Serf, Soubrette | « Additionne le niveau au nombre de dés lorsque le personnage sert son maître. La tâche que le personnage effectue doit être en rapport avec sa condition de domestique. » | [lexique:1063](regles-papier/extracted/listes/lexique.md) |
| Son envoûtant | Barde | « Additionne le niveau au nombre de dés lorsque le personnage joue de son instrument. » | [lexique:1082](regles-papier/extracted/listes/lexique.md) |
| Subtilisation | Voleur | « Additionne son niveau au nombre lorsque le personnage effectue un vol. » | [lexique:1095](regles-papier/extracted/listes/lexique.md) |
| Tour de passe-passe | Prestidigitateur | « Additionne le niveau au nombre de dés lors d'un tour de passe-passe. » | [lexique:1135](regles-papier/extracted/listes/lexique.md) |
| Touché léger | Voleur à la tire | « Additionne le niveau au nombre de dés pour toucher quelqu'un sans que celui-ci ne le remarque. » | [lexique:1128](regles-papier/extracted/listes/lexique.md) |
| Traque | Rôdeur | « Additionne le niveau au nombre de dés, lors d'un jet de pistage ou autre investigation forestière. » | [lexique:1140](regles-papier/extracted/listes/lexique.md) |
| Travail de l'arc | Facteur d'arc | « Additionne le niveau au nombre de dés lorsque le personnage construit un arc. » | [lexique:1141](regles-papier/extracted/listes/lexique.md) |
| Travail du bois | Menuisier | « Additionne le niveau au nombre de dés lorsque le personnage fait des travaux de menuiserie. » | [lexique:1144](regles-papier/extracted/listes/lexique.md) |
| Travail du métal | Forgeron | « Additionne le niveau au nombre de dés lorsque le personnage forge. » | [lexique:1147](regles-papier/extracted/listes/lexique.md) |
| Travail du récipient | Potier | « Additionne le niveau au nombre de dés lorsque le personnage fait des travaux de poterie. » | [lexique:1150](regles-papier/extracted/listes/lexique.md) |
| Travail du textile | Couturier | « Additionne le niveau au nombre de dès lors d'un jet de couture. » | [lexique:1153](regles-papier/extracted/listes/lexique.md) |
| Vade rétro | Exorciste | « Additionne le niveau au nombre de dés lorsque le personnage effectue un exorcisme. » | [lexique:1167](regles-papier/extracted/listes/lexique.md) |
| Vigilance | Chasseur de primes | « Additionne le niveau au nombre de dés pour un jet d'investigation. » | [lexique:1191](regles-papier/extracted/listes/lexique.md) |
| Voix intense | Chanteur | « Additionne le niveau au nombre de dés lorsque le personnage chante. » | [lexique:1208](regles-papier/extracted/listes/lexique.md) |

**Couverture** : 53/53 atouts permanents identifiés. Les classes web-only (Charpentier, Parfumeur, Tanneur, Aubergiste, Prostitué, Tavernier, Chasseur de magicien, Garde du corps, Mercenaire, Escroc, Éclaireur) **n'ont pas d'atout perm identifié dans le lexique paper** — à reconstituer en Q-D4.X.

---

## Partie E — Atouts éphémères de classe (couverture partielle)

Documentés explicitement dans le lexique avec tag « Atout de classe : X » :

| Atout éph | Classe(s) | Description (extrait) | Réf |
|---|---|---|---|
| **Musique stimulante** | Barde | Joue un chant qui +X aux jets des alliés | [lexique:741](regles-papier/extracted/listes/lexique.md) |
| **Chant envoûtant** | Chanteur (et racial Ondine) | Test de volonté pour ne pas être séduit, diff +1/niveau du chanteur | [lexique:208](regles-papier/extracted/listes/lexique.md) |
| **Maître du mensonge** | Comédien, Politicien | Renforce la crédibilité du discours | [lexique:655](regles-papier/extracted/listes/lexique.md) |
| **Partenaire idéal** | Danseur | Synchronisation avec partenaire | [lexique:810](regles-papier/extracted/listes/lexique.md) |
| **Mémoire photographique** | Dessinateur, Peintre | Mémoriser une scène, cumulable | [lexique:703](regles-papier/extracted/listes/lexique.md) |
| **Recharge rapide** | Arbalétrier, Archer | Réduire le temps de recharge de l'arme à distance | [lexique:898](regles-papier/extracted/listes/lexique.md) |
| **Coup mortel** | Assassin | Coup unique avec dégâts ×N | [lexique:285](regles-papier/extracted/listes/lexique.md) |
| **Mimétisme** | Ninja | Camouflage parfait dans un environnement | [lexique:706](regles-papier/extracted/listes/lexique.md) |
| **Invisibilité** | Voleur | Devient invisible pendant N tours | [lexique:563](regles-papier/extracted/listes/lexique.md) |
| **Connaissance de l'ennemi** | Duelliste | +1 dé par combat précédent contre la cible | [lexique:242](regles-papier/extracted/listes/lexique.md) |
| **Tuons la bête** | Tueur de monstres | Bonus contre cible monstre désignée | [lexique:1162](regles-papier/extracted/listes/lexique.md) |
| **Connaisseur** | Alchimiste | Identifie les ingrédients connus | [lexique:247](regles-papier/extracted/listes/lexique.md) |
| **Bluff** | Joueur de poker | Bonus aux mensonges | (à confirmer) |
| **Apaisement** | Médecin (cross), Guerrier | Soigner d'autrui | [lexique:88](regles-papier/extracted/listes/lexique.md) |
| **Énergie au déshonneur** | Abjurateur | Gêner les sorts d'une école au choix | [lexique:424](regles-papier/extracted/listes/lexique.md) |
| **Énergie à l'honneur** | Élémentaliste (et autres mages) | -1 sorts d'une école choisie | [lexique:551](regles-papier/extracted/listes/lexique.md) |
| **Aura bénéfique** | Clerc | Bloque la magie noire à proximité | [lexique:132](regles-papier/extracted/listes/lexique.md) |
| **Aura maléfique** | Sorcier | Bloque la magie blanche à proximité | [lexique:136](regles-papier/extracted/listes/lexique.md) |
| **Ressentir le magicien** | Devin | Détecter la magie ambiante | (à confirmer) |
| **Liens spirituels** | Invocateur | Connaître l'état des créatures invoquées | [lexique:621](regles-papier/extracted/listes/lexique.md) |

**Trou de couverture** : ~30 classes n'ont pas leur atout éphémère explicitement documenté dans le lexique. Ces atouts vivent **probablement dans `atouts-de-niveaux.md`** comme atouts gated par classe à un niveau ≥ 2 — mais la convention exacte (quel atout = "l'atout éphémère officiel" de la classe) est ambiguë.

→ **Q-D4.4** ouverte ci-dessous.

---

## Partie F — Atouts de niveau par orientation

> Inventaire condensé. Le détail complet est dans [atouts-de-niveaux.md](regles-papier/extracted/listes/atouts-de-niveaux.md).

| Orientation | Niveaux couverts | Nb atouts approximatif |
|---|---|---|
| Artisan | N2-N4 | 15+ |
| Artiste | N2-N5 | 8+ |
| Commerçant | N4 | 1 |
| Domestique | N4 | 1 |
| Guerrier | N2-N18 | 40+ (la plus longue) |
| Hors-la-loi | N2-N10 | 35+ |
| Intellectuel | N2-N6 | 15+ |
| Magicien | N2-N15 | 55+ |
| Malfaisant | N2-N5 | 8 |
| Ouvrier | N2-N3 | 10 |
| Paysan | (à inventorier) | ? |
| Religieux | N2-N5 | 5 |
| Voyageur | N2-N4 | 12 |

À détailler en synthèse complète si nécessaire pour D6 / D7.

---

## Partie G — Questions ouvertes

### ~~Q-D4.1~~ — 13 orientations ✅ **Tranché (2026-04-25)** : 13 orientations confirmées (Artisan, Artiste, Commerçant, Domestique, Guerrier, Hors-la-loi, Intellectuel, Magicien, **Malfaisant**, **Ouvrier**, **Paysan**, **Religieux**, **Voyageur**). Correction rétroactive à propager dans D2/D3 : les références "9 orientations" doivent devenir "13 orientations".

### ~~Q-D4.2~~ — 11 classes web-only ✅ **Tranché (2026-04-25)** : on intègre les 11 classes (Charpentier, Parfumeur, Tanneur, Aubergiste, Prostitué, Tavernier, Chasseur de magicien, Garde du corps, Mercenaire, Escroc, Éclaireur). Leurs atouts permanents et éphémères sont à reconstituer ex nihilo car absents du lexique paper. **Création différée** : à faire en phase 2 (specs) ou ad hoc lorsqu'un joueur choisit une de ces classes. Ces atouts suivront le pattern dominant : permanent = "ajoute niveau aux dés sur action de la classe", éphémère = effet ciblé 2/jour.

### ~~Q-D4.3~~ — Compétences primaires "à choix" ✅ **Tranché (2026-04-25)** : Option (c) hybride.

**Mécanique** :
- Pour chaque classe ambiguë (Pirate, Voleur, Hors-la-loi générique, Escroc, Mercenaire, Chasseur de magicien, Garde du corps, etc.), le moteur affiche une **liste de suggestions canoniques** (1-4 options évidentes par classe).
- Le joueur peut **soit choisir une suggestion**, **soit proposer autre chose** avec justification narrative.
- En mode MJ humain : le MJ valide la cohérence "rapport direct et évident".
- En mode LLM : le LLM évalue la plausibilité du choix custom selon le background du perso et le concept de la classe (refus si non justifiable).
- En mode auto : seule la liste canonique est acceptable (pas d'override).

**Implication modèle de données** : `classes.primary_skill_suggestions: [skill_id, skill_id, ...]` au lieu d'un seul `primary_skill_default_id`. La compétence finale est stockée par perso : `characters.primary_skill_id`.

### ~~Q-D4.4~~ — Convention atout éphémère ✅ **Tranché (2026-04-25)** : Option (a) — le **premier atout de niveau N2 listé pour la classe** dans `atouts-de-niveaux.md` est l'**atout éphémère officiel** de cette classe. Les autres atouts de niveau (N3+) restent disponibles mais sont des atouts de progression, pas l'atout éphémère "principal" XP-achetable selon Experience.doc (NA × 10).

**Implication** : le moteur lit `atouts-de-niveaux.md`, trouve les entrées N2 par classe, et celle-ci devient l'atout éphémère officiel utilisé pour le coût XP de progression.

### ~~Q-D4.5~~ — « Chasseur » Commerçant ET Domestique ✅ **Tranché (2026-04-25)** : Option (c) — **deux classes distinctes** :
- **Chasseur (Commerçant)** : chasse pour vendre (économie marchande, gibier vendu sur les marchés, tannage commercial des peaux)
- **Chasseur (Domestique)** : chasse pour fournir la maison/le seigneur (service, livraison directe à un employeur)

**Atout permanent partagé** : « Art de la chasse » (cohérent avec Q-D4.7-8, partage OK).

**Implication modèle de données** : `classes` aura 2 entrées avec `name` proche mais `id` et `orientation_id` différents. La compétence primaire reste « Chasse » dans les deux cas.

### ~~Q-D4.6~~ — Atouts pour classes web-only ✅ **Tranché (2026-04-25, lié à Q-D4.2)** : création **différée** à phase 2 (specs) ou ad hoc lorsqu'un joueur sélectionne une de ces classes. Pattern à suivre :
- Atout permanent : pattern « Additionne le niveau au nombre de dés lorsque le personnage [action de la classe] »
- Atout éphémère : effet ciblé 2/jour (pattern Experience.doc)

**Liste des classes à doter d'atouts** : Charpentier, Parfumeur, Tanneur, Aubergiste, Prostitué, Tavernier, Chasseur de magicien, Garde du corps, Mercenaire, Escroc, Éclaireur.

### ~~Q-D4.7 + Q-D4.8~~ — Atouts partagés entre classes ✅ **Tranché (2026-04-25)** : OK comme c'est. Un même atout peut être assigné à plusieurs classes simultanément (ex: Magie verte → Chaman + Druide ; Coup décisif → 4 fantassins/Samouraï ; Élevage → 6 paysans ; Art de la chasse → Chasseur + Braconnier). Pas de dédoublement — une seule entrée `feats(id)` qui peut être référencée par plusieurs entrées `classes(perm_feat_id)`.

**Implication modèle de données** : la relation `class.perm_feat_id → feat.id` est **N:1** (plusieurs classes peuvent pointer le même atout), pas 1:1. Idem pour `class.eph_feat_id`.

### ~~Q-D4.9 + Q-D4.9-a~~ — Magie comme primaire conceptuelle, pas comme compétence ✅ **Tranché (2026-04-25)** :

**Modèle confirmé** :

1. **Toute la magie** (les 11 écoles cumulées) est la "compétence primaire" **conceptuelle** d'un magicien — mais pas mécaniquement une compétence.
2. **Les sorts ne sont pas des compétences et ne doivent pas l'être**. Différences fondamentales :
   - Pas de spécialisations sur les sorts
   - Règles d'apprentissage différentes (RP gating, accès dur voire quasi-impossible)
   - Règles de progression différentes (NA × 10 XP par point dans un sort, vs NA × 3 pour les compétences)
   - Choix de design délibéré, à préserver
3. **Tous les points investis dans les sorts comptent ×2** dans `levelPoints` — **quelle que soit l'école**, pas seulement l'école de prédilection. Réponse à Q-D4.9-a.
4. **École de prédilection** ≠ compétence primaire. C'est l'**identité narrative et mécanique** de la classe magicien :
   - Donne l'atout permanent « Magie X » (-1 difficulté sur les sorts de cette école)
   - Pas de bonus sur les autres écoles via cet atout
   - Les écarts (apprendre des sorts d'autres écoles) sont **justifiables RP** vu la rareté de la magie, mais sont mécaniquement **"sanctionnés"** par certains atouts de niveau qui renforcent l'école de prédilection (à détailler en D8 Magie).

**Implication modèle de données** :
- `characters.primary_skill_id = NULL` pour tous les magiciens (cohérent avec R-4.5).
- `classes.ecole_predilection_id` (nullable, rempli uniquement pour les 12 classes de magicien) → pointe vers l'école de magie associée.
- Le calcul de `levelPoints` pour un magicien : `Σ(skill.points × 1) + Σ(spell.points × 2)`. Pas de doublement de compétence primaire (pas de primaire).
- Le calcul pour un non-magicien : `Σ(skill.points × 1) + Σ(skill.points × 1 × isMain)` = points × 2 si compétence primaire, ×1 sinon, **récursivement sur les spécialisations de la primaire** (cf. CharacterPlayer.php:91-152).

**Différence essentielle entre les deux profils** :
| Profil | Compétence primaire | Multiplicateur appliqué sur |
|---|---|---|
| Non-magicien | 1 compétence + ses spécialisations + spé de spé (récursif) | Tout l'arbre de la primaire (×2) |
| Magicien | NULL | Tous les sorts (×2), peu importe l'école |

**Renvoi D8 Magie** : la liste des atouts de niveau qui "sanctionnent" les écarts de l'école de prédilection sera détaillée.

---

## Partie H — Acceptance checklist

- [x] ~~Q-D4.1 : confirmer 13 (ou 9) orientations~~ → 13
- [x] ~~Q-D4.2 : confirmer inclusion des 11 classes web-only~~ → oui, atouts à créer
- [x] ~~Q-D4.3 : politique des compétences primaires "à choix"~~ → hybride (suggestions + custom validé)
- [x] ~~Q-D4.4 : convention atout éphémère de classe~~ → premier N2 listé
- [x] ~~Q-D4.5 : Chasseur Commerçant ou Domestique~~ → les deux (classes distinctes)
- [x] ~~Q-D4.6 : timing de création des atouts manquants~~ → différé (phase 2 ou ad hoc)
- [x] ~~Q-D4.7-8 : règle de partage d'atout entre classes~~ → OK, partage autorisé
- [x] ~~Q-D4.9 + Q-D4.9-a : statut compétence primaire des magiciens~~ → magie = primaire conceptuelle, pas mécanique. Tous sorts ×2, école de prédilection pour atout perm seulement.

**D4 complet** ✅. Une fois validé → **D5 Compétences & Spécialisations**. Le système ouvert (compétences libres et infinies) sera décrit, avec les ~100 compétences canoniques répertoriées dans `documents/competences/`.
