# Knight and Wizard Game - Document Fondateur

Date : 2026-04-29
Statut : design fondateur valide en discussion auteur
Repo cible : `knightandwizard-game`
Repo source : `knightandwizard`

## 1. Intention

Le projet `knightandwizard-game` est une adaptation en **vrai jeu RPG digital** de Knight and Wizard.

Ce n'est pas un VTT, pas un assistant de table, pas une simple fiche digitale. Le but est de produire un **CRPG tactique coop** jouable, avec une architecture préparée pour évoluer vers un RPG persistant / pré-MMO.

Le dépôt actuel `knightandwizard` reste le corpus source :

- règles canonisées D1-D13 ;
- catalogues YAML/CSV ;
- carte interactive et données monde ;
- legacy paper/web ;
- décisions de design.

Le futur dépôt `knightandwizard-game` contient le produit jeu :

- client jouable ;
- serveur autoritaire ;
- moteur de règles runtime ;
- contenu vertical slice ;
- assets runtime ;
- tests gameplay.

## 2. Position Produit

### Cible Long Terme

Un RPG coopératif en ligne dans l'univers des Terres Oubliées :

- exploration en temps réel ;
- combats tactiques au tour-par-tour DT ;
- personnages persistants ;
- quêtes, factions, réputation, progression ;
- zones instanciées ;
- architecture pouvant évoluer vers des hubs persistants puis un monde pré-MMO.

### Cible Vertical Slice

Une tranche jouable courte qui prouve le coeur du jeu :

- village + ruines proches ;
- quête principale linéaire avec variantes ;
- bandits / pillards humains comme ennemis principaux ;
- 2 à 3 combats tactiques ;
- choix narratifs visibles ;
- mini-donjon fixe en v1 ;
- modules de donjon procéduraux seulement en v2.

## 3. Décisions Validées

| Domaine | Décision |
|---|---|
| Type de jeu | CRPG tactique coop |
| Ambition réseau | Architecture préparée pré-MMO |
| Exploration | Temps réel |
| Combat | Tour-par-tour basé sur DT |
| Engagement combat v1 | Groupe verrouillé |
| Engagement futur | Zone d'engagement |
| Vue | 2D isométrique |
| Scène | 2.5D isométrique avec décors en couches |
| Déplacement | Libre métrique, pas de grille |
| Runtime client | Phaser + TypeScript |
| Serveur | Nakama + PostgreSQL |
| Plateforme v1 | Web desktop |
| Repo | Nouveau monorepo séparé `knightandwizard-game` |
| UI combat | CRPG classique compact |
| Direction artistique | Painterly isométrique |
| Assets v1 | Assets temporaires propres + concepts IA pour direction artistique |

## 4. Boucle de Jeu

La boucle principale de la vertical slice :

1. Créer un personnage dans un périmètre limité.
2. Arriver dans un village menacé.
3. Parler aux habitants et collecter des indices.
4. Faire un choix d'approche : enquête, intimidation, perception, passage discret ou confrontation.
5. Explorer les abords des ruines en temps réel.
6. Entrer en combat tactique DT lorsque la confrontation démarre.
7. Résoudre 2 à 3 combats avec options de fuite, reddition et désengagement.
8. Atteindre le chef des bandits.
9. Conclure la quête avec une conséquence immédiate.
10. Sauvegarder l'état minimal du personnage et de la quête.

## 5. Vertical Slice Narrative

### Pitch

Le groupe arrive dans un village isolé. Des disparitions et vols ont lieu près de ruines anciennes. Les habitants soupçonnent des bandits, mais certains indices suggèrent que les pillards cherchent quelque chose dans les ruines plutôt que de simples richesses.

Le joueur peut :

- interroger les villageois ;
- intimider ou convaincre un suspect ;
- repérer une piste cachée ;
- éviter ou déclencher une embuscade ;
- négocier avec un éclaireur bandit ;
- accepter ou refuser la reddition du chef.

La menace surnaturelle reste en arrière-plan. Elle sert d'accroche K&W pour la suite, sans ouvrir dès la vertical slice les systèmes lourds : morts-vivants, lycanthropie, magie complexe ou factions occultes.

### Ton

Heroic fantasy classique :

- village en danger ;
- ruines mystérieuses ;
- bandits menaçants mais pas grimdark ;
- héroïsme lisible ;
- choix moraux simples ;
- récompense claire ;
- mystère léger pour annoncer un monde plus profond.

## 6. Personnages Jouables

### Groupe

La vertical slice se joue en solo avec un petit groupe, mais l'architecture prépare la coop.

- 1 PJ principal créé par le joueur.
- 2 compagnons fixes contrôlables.
- En combat, le joueur donne les ordres au groupe.
- Plus tard, chaque compagnon pourra être repris par un joueur coop.

### Création du PJ

Création complète mais limitée :

- nom ;
- genre ;
- race ;
- orientation/classe ;
- aptitudes ;
- compétences/spécialisations limitées ;
- atouts limités ;
- équipement de départ simple.

Sélection v1 :

- races : Humain, Elfe, Nain, Hobbit ;
- classes/orientations : Guerrier, Voleur, Magicien simple.

### Magicien v1

Le magicien existe dès la vertical slice mais avec un périmètre strict.

Trois mini-écoles :

- attaque : dégâts directs simples, portée, interruption ;
- protection : bouclier, réduction de dégâts, soin léger si validé ;
- utilitaire : lumière, détection, ouverture ou entrave simple.

Objectif : tester la magie dans le moteur sans ouvrir le grimoire complet.

## 7. Combat

### Fidélité K&W

Le combat v1 vise une fidélité forte aux règles K&W, avec complexité internalisée dans le moteur et expliquée par l'UI.

À inclure :

- timeline DT ;
- facteur vitesse / facteur volonté ;
- jets K&W avec difficulté et réussites ;
- dégâts typés simples ;
- vitalité et affaiblissement ;
- actions conservées/interrompues ;
- portée en mètres ;
- déplacement libre métrique ;
- états tactiques de base ;
- esquive/parade ;
- fuite ;
- reddition ;
- désengagement ;
- sorts v1 intégrés au système.

Hors v1 :

- combat aquatique ;
- combat aérien ;
- manoeuvres spéciales avancées ;
- taille extrême ;
- drogues/berserk ;
- armes intelligentes ;
- duel magique complexe ;
- familiers en combat coordonné.

### Actions v1

Noyau combat :

- déplacement ;
- attaque ;
- défense/parade/esquive ;
- sort ;
- objet ;
- attente ;
- fuite ;
- reddition ;
- désengagement.

### Déplacement

Le jeu n'utilise pas de grille.

- Distances en mètres.
- Trajectoires libres.
- Portées visibles au survol.
- Anneaux ou zones atteignables.
- Obstacles statiques en vertical slice.
- Pathfinding simple mais central.

## 8. UI et Expérience

Référence validée : **CRPG classique compact**.

Disposition combat :

- carte isométrique au centre ;
- timeline DT en haut ;
- portraits/groupe à gauche ;
- barre d'actions en bas ;
- journal/MJ/infos contextuelles à droite ;
- social/chat/pré-MMO discret, non dominant.

L'UI doit toujours répondre aux questions du joueur :

- qui agit maintenant ?
- qui agit ensuite ?
- combien de DT coûte cette action ?
- quelle est la portée ?
- quelle est la chance de réussite ?
- quels risques existent ?
- quelle conséquence immédiate aura l'action ?

## 9. Architecture Technique

### Principe Central

Séparer strictement :

- simulation ;
- rendu ;
- réseau ;
- contenu ;
- UI.

Le rendu Phaser ne doit jamais être la source de vérité.

### Monorepo Cible

```text
knightandwizard-game/
  apps/
    client/              # Phaser + TypeScript
    server/              # Nakama runtime/modules/config
  packages/
    shared/              # types communs, contrats réseau
    rules-core/          # moteur K&W pur, sans rendu
    content/             # contenu vertical slice normalisé
  tools/
    import-corpus/       # imports depuis le repo knightandwizard
    validate-content/    # validations schemas/content
  docs/
    game-design/
    architecture/
    vertical-slice/
```

### Client

Responsabilités :

- afficher scène isométrique ;
- gérer caméra et input ;
- afficher UI/HUD ;
- envoyer des intentions joueur ;
- interpoler/présenter l'état autoritaire.

Le client ne décide pas :

- résultats de jets ;
- dégâts ;
- validité d'une action ;
- loot ;
- progression ;
- état canonique de quête.

### Serveur

Nakama + PostgreSQL :

- comptes ;
- personnages ;
- sessions/rooms d'aventure ;
- état autoritaire ;
- validation des intentions ;
- résolution des règles ;
- diffusion d'état ;
- persistance minimale.

### Rules Core

`packages/rules-core` doit être pur et testable :

- pas de Phaser ;
- pas de Nakama direct ;
- pas d'accès DB ;
- entrées/sorties sérialisables ;
- tests unitaires pour chaque règle critique.

Modules initiaux :

- dés et réussites ;
- personnages ;
- aptitudes dérivées ;
- actions DT ;
- combat ;
- dégâts ;
- états ;
- progression minimale ;
- sorts v1.

## 10. Persistance v1

Persistance minimale :

- compte joueur Nakama ;
- personnage principal ;
- compagnons liés à la sauvegarde ;
- état de quête principal ;
- progression minimale ;
- inventaire simple si nécessaire.

Hors v1 :

- économie persistante ;
- marché ;
- guildes ;
- housing ;
- réputation globale complexe ;
- monde persistant continu.

## 11. Contenu v1

### Zone

- 1 village ;
- abords du village ;
- entrée des ruines ;
- donjon court fixe ;
- salle finale du chef bandit.

### Rencontres

- éclaireur bandit ;
- groupe de pillards ;
- garde ou lieutenant ;
- chef bandit.

### Variantes

La quête reste linéaire mais les approches changent :

- embuscade détectée ou subie ;
- ennemis divisés ou groupés ;
- raccourci trouvé ou non ;
- dialogue possible avec un bandit ;
- reddition acceptée ou refusée.

## 12. Assets et Direction Artistique

Direction : painterly isométrique heroic fantasy.

Méthode :

- assets temporaires propres et lisibles pour le gameplay ;
- concepts IA pour cadrer l'identité visuelle ;
- remplacement progressif par assets finalisés ;
- peu de biomes en v1 ;
- village + ruines seulement.

Assets nécessaires v1 :

- héros de base ;
- 2 compagnons ;
- 3-4 bandits ;
- village painterly ;
- ruines ;
- éléments de décor ;
- UI combat ;
- icônes actions ;
- effets de sorts v1.

## 13. Relation avec le Repo Source

Le nouveau repo ne doit pas modifier directement les fichiers du corpus.

Flux recommandé :

1. Le repo source `knightandwizard` contient règles et catalogues canoniques.
2. Un outil d'export produit un bundle versionné.
3. `knightandwizard-game` importe ce bundle.
4. Les contenus runtime sont normalisés et testés.
5. Les divergences nécessaires au jeu vidéo sont documentées comme adaptations, pas comme corrections silencieuses.

Exemple :

```text
knightandwizard/data/catalogs/*.yaml
knightandwizard/docs/rules/*.md
        |
        v
export-corpus
        |
        v
knightandwizard-game/packages/content
```

## 14. Phasage

### Phase 0 - Nouveau Repo

- Créer `knightandwizard-game`.
- Initialiser monorepo TypeScript.
- Ajouter client Phaser minimal.
- Ajouter stack Nakama/PostgreSQL.
- Ajouter packages `shared`, `rules-core`, `content`.

### Phase 1 - Prototype Technique

- Connexion client/serveur.
- Room d'aventure locale.
- Entité joueur visible.
- Déplacement libre métrique.
- État serveur autoritaire.

### Phase 2 - Combat Minimal

- Timeline DT.
- Actions de base.
- Jets.
- Dégâts.
- UI combat compact.
- 1 combat test.

### Phase 3 - Vertical Slice Jouable

- Création PJ limitée.
- Village.
- Dialogues/choix simples.
- Ruines.
- 2-3 combats.
- sauvegarde minimale.

### Phase 4 - Polish et Pré-Coop

- Deuxième joueur possible en test.
- Remplacement partiel des assets temporaires.
- Amélioration UI/feedback.
- Tests de stabilité réseau.

### Phase 5 - Donjon Modulaire v2

- Modules fixes assemblés.
- Variantes de rencontres.
- Rejouabilité légère.

## 15. Risques

| Risque | Réponse |
|---|---|
| Nakama alourdit la v1 | Limiter à une room instanciée et persistance minimale |
| Déplacement libre métrique complexe | Obstacles statiques et pathfinding simple en vertical slice |
| Magie trop large | Trois mini-écoles, 3-4 sorts chacune |
| Painterly trop coûteux | Assets temporaires propres + concepts IA, art final plus tard |
| Fidélité K&W trop opaque | UI explicative : DT, portée, chance, risque |
| Pré-MMO trop large | Pas de MMO v1, seulement architecture compatible |

## 16. Prochaines Décisions

À trancher avant création du repo :

1. Nom exact du paquet npm / organisation Git.
2. Choix tooling monorepo : pnpm, npm workspaces ou turborepo.
3. Version Nakama : Docker compose local ou service existant.
4. Format d'export du corpus source.
5. Liste exacte des races/classes/sorts/atouts v1.
6. Style de sprites : frame-by-frame, Spine-like, ou animation minimale.
7. Niveau de tests minimum pour `rules-core`.

## 17. Critère de Succès Vertical Slice

La vertical slice est réussie si un joueur peut :

1. créer un PJ limité mais reconnaissable K&W ;
2. explorer un village en temps réel ;
3. faire au moins un choix narratif utile ;
4. entrer dans les ruines ;
5. jouer 2 à 3 combats tactiques DT lisibles ;
6. comprendre pourquoi ses actions réussissent ou échouent ;
7. finir la quête ;
8. sauvegarder son personnage ;
9. vouloir rejouer avec une autre approche.
