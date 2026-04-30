# D6 — Création de personnage

> Domaine d'**assemblage** des règles D2-D5. Définit le flow canonique en étapes, les contraintes de validation, les états intermédiaires, et les modes de création (PJ guidé / PNJ généré).

**Sources** :

- [documents/regles/index.md:260-304](documents/regles/index.md) — flow de création paper
- [site/includes/managers/user/AddCharacterMan.php](site/includes/managers/user/AddCharacterMan.php) — implémentation existante (1092 lignes)
- [site/includes/managers/\_DBManager.php:2167-2245](site/includes/managers/_DBManager.php) — `insertCharacter`
- [regles-papier/extracted/regles/regles.md:99-111](regles-papier/extracted/regles/regles.md) — version paper du flow (identique au web)

---

## Partie A — Vue d'ensemble du flow

### R-6.1 — Flow canonique en 14 étapes

**Énoncé legacy** ([regles:260-304](documents/regles/index.md)) :

| #   | Étape                                             | Inputs                                                                                                                                                           | Cf. règle                                         |
| --- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 1   | **Le Genre**                                      | Sélection mâle/femelle (extensible si besoin)                                                                                                                    | R-6.2                                             |
| 2   | **La Race**                                       | Choix parmi les 33 races, charge automatiquement la **catégorie** + bases (vitalité, FV, FVol) + maxima d'aptitudes                                              | D3 R-3.1, R-3.2                                   |
| 3   | **Les Atouts et Handicaps de Race**               | **Octroi automatique** (pas de choix) — racial atouts/handicaps de la race                                                                                       | D3 R-3.3                                          |
| 4   | **Les Facteurs et la Vitalité**                   | **Affichage automatique** des bases racial — copie en `vitality`, `vitalityMax`, `speedFactor`, `willFactor`                                                     | D2 R-2.9, R-2.13, R-2.15                          |
| 5   | **L'Orientation**                                 | Choix parmi 13 orientations (Artisan, Artiste, …, Voyageur). Le choix « Magicien ? oui/non » est **engageant à vie** : un non-magicien ne peut jamais le devenir | D4 R-4.1                                          |
| 6   | **La Classe**                                     | Choix parmi les classes de l'orientation choisie (catalogue éditable via D4)                                                                                     | D4 R-4.1                                          |
| 7   | **Les Atouts d'Orientation et de Classe**         | **Octroi automatique** : 1 atout d'orientation (toujours éphémère sauf Magicien) + 2 atouts de classe (1 perm + 1 éph)                                           | D4 R-4.2, R-4.3                                   |
| 8   | **Les Sorts et Énergie** _(magiciens uniquement)_ | Choix de 2 points de sort gratuits, avec conversion possible de 10 points de compétences en +1 point de sort, + `energyMax = 60`, `energy = 60`                  | D4 R-4.9, D2 R-2.11                               |
| 9   | **La Psychologie**                                | Mot/expression libre (ex: "calme", "extraverti", "vengeur") — purement narratif, impact sur XP-RP en cours de jeu                                                | D4 (psychologie influence atribution XP narratif) |
| 10  | **La Divinité**                                   | Choix parmi le catalogue Cultes et Religions (peut être **athée**, mais déconseillé)                                                                             | D12 (lore)                                        |
| 11  | **La Citation**                                   | Phrase libre ou à laisser vide — purement narratif                                                                                                               | —                                                 |
| 12  | **Les Aptitudes**                                 | Distribution de `catégorie` points entre les 9 aptitudes. Min 1 conseillé (0 possible mais "stagnant"). Max = `limiteRace - 1` par aptitude.                     | D2 R-2.6, R-2.7, R-2.8                            |
| 13  | **Les Compétences et Spécialisations**            | Distribution de `catégorie` points, moins 10 points par point de sort supplémentaire acheté par un magicien. Min 0. Max 4 par compétence/spé. **Compétence primaire** désignée selon classe (D4 R-4.5). | D5 R-5.5 + D4 R-4.5                               |
| 14  | **L'Équipement**                                  | Choix par le joueur, validé par MJ pour la cohérence (« raisonnable » pour un débutant)                                                                          | D10 (équipement)                                  |
| 15  | **Touches finales**                               | **Nom du personnage** (obligatoire) + **background** (recommandé, narratif libre)                                                                                | —                                                 |

**Statut** : 🟢 claire

**Note** : la numérotation 1-15 (et non 1-14 comme dit dans les règles) reflète la séparation explicite entre "création mécanique" (1-14) et "touches finales" (15). C'est cohérent avec le texte qui dit _« Voilà votre personnage est presque terminé, il ne vous reste plus qu'à lui trouver un nom »_ après l'étape 14.

### R-6.2 — Le Genre : choix extensible

**Énoncé legacy** : _« Il vous faut choisir un sexe à votre personnage. Pour un nouveau joueur il est conseillé de commencer par un personnage de son propre sexe (ce qui est souvent plus facile à jouer). Précisons tout de même que le médiéval fantastique donne souvent les mêmes droits aux femmes qu'aux hommes. »_ ([regles:262-263](documents/regles/index.md))

**Implémentation actuelle** ([\_DBManager.php](site/includes/managers/_DBManager.php)) : la table `genders` est référentielle, donc la liste des genres est extensible côté admin (cohérent avec l'esprit de R-5.3 / Q-D5.3 sur la flexibilité).

**Statut** : 🟢 claire (le système supporte plusieurs genres si besoin éditorial)

### R-6.3 — Choix « Magicien ? » : engageant à vie

**Énoncé legacy** ([regles:271-272](documents/regles/index.md)) :

> Un magicien peut par la suite **abandonner la magie** (mais s'il le fait il ne pourra jamais la retrouver), alors qu'**un non-magicien ne peut en aucun cas devenir magicien**.

**Statut** : 🟢 claire

**Implication** :

- Choix d'orientation Magicien → engagement irréversible vers la voie magique. Possibilité d'abandon (devient un perso "non-magicien" mais sans pouvoir revenir en arrière).
- Choix d'une autre orientation → magie définitivement inaccessible **sauf via mécanique de race** (Vampire / Art occulte, Polyvalence + atouts magiciens, etc. cf. D4 R-4.X et D3 R-3.4).

**Cas particuliers à noter** :

- Race Vampire qui acquiert l'atout racial « Art occulte » à N2 → acquiert `energyMax = 40` et un sort, **sans devoir être de l'orientation Magicien**. C'est l'exception au principe d'engagement (D4 R-4.9).
- Atout « Polyvalence » → permet d'acquérir des atouts d'orientation Magicien sans être Magicien (D4 R-4.6).

### R-6.4 — Octroi automatique des atouts/handicaps

À la création, **3 sets d'atouts** sont **automatiquement assignés** au perso :

| Source                    | Atouts                                            | Handicaps                                             |
| ------------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| **Race** (étape 3)        | Tous les atouts raciaux de la race choisie        | Tous les handicaps raciaux (irréversibles, cf. R-3.3) |
| **Orientation** (étape 7) | 1 atout d'orientation (cf. D4 partie B catalogue) | —                                                     |
| **Classe** (étape 7)      | 2 atouts de classe (1 perm + 1 éph, cf. D4 R-4.3) | —                                                     |

**Pas de choix joueur** sur ces 4 atouts initiaux — ils sont **liés à la race / orientation / classe**.

Le joueur **commence à acquérir des atouts au choix** uniquement à partir du **niveau 2** (passages de niveau, cf. D7 — chaque passage de niveau débloque la pool d'atouts de niveau N et permet le choix dans la pool).

**Statut** : 🟢 claire

---

## Partie B — Validations & contraintes

### R-6.5 — Contraintes de distribution des aptitudes (étape 12)

**Énoncé legacy** ([regles:285-293](documents/regles/index.md)) :

```
- Total à distribuer = catégorie de la race
- Par aptitude : min 0 (avec impact "attribut nul" R-2.4 si choisi)
                 min 1 conseillé
                 max = limiteRace_aptitude - 1
```

**Validation côté moteur** :

- `Σ(aptitudes) === catégorie` (strictement égale, ni plus ni moins)
- Pour chaque aptitude `i` : `0 <= aptitude_i <= (race.aptitudeMax_i - 1)`
- Avertir le joueur s'il met 0 quelque part (rappel : aucune évolution future possible sur cette aptitude — R-2.4)

### R-6.6 — Contraintes de distribution des compétences (étape 13)

**Énoncé legacy** ([regles:294-298](documents/regles/index.md)) :

```
- Total à distribuer = catégorie de la race
- Magicien : total réduit de 10 points par point de sort supplémentaire acheté
- Par compétence/spé : min 0 (= absent de la fiche)
                       max 4 (cap "professionnel" pour nouveau perso)
```

**Validation côté moteur** :

- `Σ(compétences + spécialisations) === catégorie - 10 × pointsSortSupplémentaires`
- Pour chaque compétence/spé `i` : `0 <= score_i <= 4`
- **Sélection de la compétence primaire** (R-4.5) : doit être faite dans cette étape, sauf pour magiciens
- Cas limite : spé sans compétence mère autorisé (cf. R-1.3 / R-5.8)

### R-6.7 — Bonus magicien : points de sort + 60 énergie (étape 8)

**Énoncé legacy** ([regles:276-277](documents/regles/index.md)) :

```
Si orientation == Magicien :
   - 2 points à distribuer dans 1 ou 2 sorts (au choix : 1+1 ou 2+0)
   - Possibilité d'acheter des points de sort supplémentaires en convertissant
     10 points du budget compétences = +1 point de sort
   - energyMax = 60, energy = 60
   - Choix dans le Grand Grimoire
```

**Note** : les 2 premiers points de sort sont **en plus** des compétences (étape 13).
Les points de sort supplémentaires sont achetés par conversion du budget compétences. Exemple
humain (`catégorie = 20`) : `20 compétences + 2 sorts`, `10 compétences + 3 sorts`, ou
`0 compétence + 4 sorts` sont valides, même si le dernier cas est très déconseillé. Les sorts
ne sont **pas** des compétences (cf. D4 R-4.9 / D5 R-5.6-bis), donc il n'y a pas de
spécialisation de sort.

### R-6.8 — Validation des cohérences inter-étapes

| Validation                                    | Condition                                                                                                        |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Race × Orientation cohérente                  | Pas de hard-block, mais avertir si la combinaison est rare/exotique (ex: Squelette → Magicien Clerc est étrange) |
| Race × Classe cohérente                       | Idem (Hobbit Berzerker = improbable mais autorisé)                                                               |
| Aptitudes × Classe cohérente                  | Avertir si distribution incohérente (Bûcheron avec Force 1 est rare)                                             |
| Compétences × Classe (compétence primaire)    | La primaire doit être de la classe ou défendable narrativement (D4 R-4.5)                                        |
| Maximum d'énergie magicien à 60 à la création | Strict, pas de modification possible à la création — uniquement progressable via XP                              |

**Statut** : 🟡 — pas de règle stricte legacy sur les cohérences. Tout est laissé à la **discrétion du joueur/MJ**, mais le moteur peut générer des avertissements (Q-D6.5).

---

## Partie C — Modes de création

### R-6.9 — Mode PJ guidé (création humaine)

Workflow standard pour un joueur :

1. **Étape par étape** : le joueur progresse linéairement, peut revenir en arrière
2. **Sauvegarde automatique** à chaque étape validée (auto-save dans la session)
3. **Brouillon** : possibilité de quitter et reprendre plus tard
4. **Validation finale** : récapitulatif complet avant de soumettre, possibilité de tout revoir
5. **Création irréversible après soumission** : le perso est créé en DB, modifications futures uniquement via XP / level-up

### R-6.10 — Mode PNJ généré (outil MJ)

Code existant : `setRandomAttributes`, `setRandomSkills`, `setRandomSpells`, `setRandomLevelAsset`, `setRandomSpeedFactor`, `setRandomVitality`, `setRandomWillFactor` ([AddCharacterMan.php](site/includes/managers/user/AddCharacterMan.php)).

**Workflow** :

1. MJ saisit : race + orientation + classe + niveau cible
2. Le moteur génère **automatiquement** :
   - Distribution aléatoire d'aptitudes selon catégorie + max racial (`setRandomAttributes`)
   - Distribution de compétences/spés selon classe et niveau (`setRandomSkills`)
   - Sorts si magicien (`setRandomSpells`)
   - Atouts de niveau acquis (`setRandomLevelAsset`)
   - Facteurs de vitesse / volonté ajustés selon niveau (`setRandom*Factor`)
   - Vitalité ajustée selon niveau (`setRandomVitality`)
3. MJ peut **réviser/ajuster** chaque champ avant de finaliser
4. Création en DB

**Statut** : 🟢 claire (déjà implémentée, à transposer en spec digitale)

### R-6.11 — Mode template / archétype

Idée pour D7 (Progression) ou ici : permettre de créer un perso à partir d'un **template prédéfini** (ex: "Garde humain niveau 3", "Magicien clerc humain niveau 5") qui pré-remplit les choix communs et laisse le joueur ajuster.

**Statut** : 🟡 idée en standby, pas dans les règles legacy. À discuter (Q-D6.X).

---

## Partie D — Modèle de données

### R-6.12 — État d'un personnage en cours de création (draft)

Pour supporter la sauvegarde automatique et le retour en arrière :

```sql
character_drafts (
  id, user_id, current_step (1..15),
  payload JSON,  -- contient les choix faits jusqu'ici
  created_at, updated_at
)
```

À la soumission finale, le draft est converti en `characters` row + tous les `character_*` rows liés (atouts, compétences, sorts).

### R-6.13 — Persistance finale (insertCharacter)

Code de référence : [\_DBManager.php:2167-2245](site/includes/managers/_DBManager.php). Champs persistés dans `characters` :

```
id, user_id, gender_id, name, race_id, orientation_id, class_id,
age, category (= race.category, dénormalisé pour perf),
vitality, vitality_max, speed_factor, will_factor,
energy, energy_max,
strength, dexterity, stamina, aestheticism, reflexes, perception,
charisma, intelligence, empathy,
place_id (lieu de départ), status_id (statut PJ/PNJ/etc.),
note (background narratif libre)
```

Liaisons enfants :

- `character_skills (character_id, skill_id, points, is_main, is_main_inherited)` — D5
- `character_spells (character_id, spell_id, points)` — D8
- `character_atouts (character_id, asset_id, instances)` — D4
- `character_resistances (character_id, type, value, source)` — D3 R-3.5/Q-D3.8

---

### R-6.14 — Import / Export automatique de personnage (acté 2026-04-25)

**Exigence** : tout personnage (PJ ou PNJ) doit être **exportable** dans un format portable et **importable** dans une autre instance du moteur ou dans une autre campagne.

**Cas d'usage** :

- Joueur qui change de table / campagne → emmène son PJ
- Backup utilisateur (sauvegarde personnelle de sa fiche)
- Transfert entre instances (serveurs différents, environnements communautaires)
- Migration entre versions de règles (cf. principe « règles vivantes »)

**Format** :

- **JSON canonique** standard (lisible humain, machine-friendly)
- Contient toutes les données : stats, race, orientation, classe, atouts, compétences, sorts, équipement, vitalité courante, énergie courante, levelPoints, XP cumulé, points de quête, divinité, psychologie, citation, background, historique d'événements significatifs
- Métadonnées : version du moteur de règles, date d'export, identifiant de la campagne d'origine (optionnel), checksum d'intégrité

**Garde-fous** :

- **Checksum / signature** pour détecter les modifications externes (anti-triche)
- **Validation à l'import** : le moteur vérifie la cohérence (XP cumulé cohérent, contraintes respectées, atouts existants dans le catalogue cible)
- **Migration de version** : si le perso est dans une version de règles antérieure, proposer un workflow de migration assistée
- **Approbation MJ à l'import** : le MJ de la campagne cible peut accepter / refuser un import (anti-power-creep)

**Statut** : 🟢 exigence claire, **spec détaillée à faire en phase 2**.

### R-6.15 — Feuilles tabletop digitales

**Exigence** : génération de **feuilles de personnage tabletop** (style fiche imprimable papier, mais en numérique) à partir des données du perso digital.

**Cas d'usage** :

- Joueur qui veut imprimer sa fiche pour une session live tabletop
- Aide visuelle compacte sur mobile/tablette pendant une session
- Référence "à plat" à montrer / partager
- Mode "tabletop hybride" où le digital sert de référence mais le jeu se déroule en présence

**Foundations existantes** : le code paper a déjà `_PrintManager.php` qui génère un PDF via FPDF (cf. [\_PrintManager.php:140-300+](site/includes/managers/_PrintManager.php)). À reprendre et moderniser.

**Modes de présentation** :

- **Fiche complète** (toutes infos, multi-pages) — équivalent du PDF actuel
- **Fiche compacte** (synthèse mono-page : aptitudes, atouts, sorts, équipement)
- **Mode combat** (focus combat : pool de dés par action, vitalité courante, atouts éphémères restants, sorts disponibles, FV, FVol)
- **Mode social** (focus social : Charisme/Empathie/Esthétique, atouts sociaux, divinité, citation, background)
- **Mode admin** (vue MJ : toutes les méta-données, historique XP, prévisions de niveau)

**Formats de sortie** :

- **PDF** (impression / archivage)
- **Page web responsive** (consultation mobile/tablette/desktop)
- **JSON** (déjà couvert par R-6.14 import/export)
- **Image** (carte de perso compacte pour partage social, optionnel)

**Mise à jour temps réel** : la fiche affichée doit refléter l'**état courant** (vitalité actuelle, énergie restante, atouts éphémères utilisés ce jour, malus d'affaiblissement actifs, modificateurs magiques en cours). Synchronisée avec l'état serveur.

**Personnalisation** :

- Le joueur peut choisir le mode de présentation par défaut
- Possibilité d'ajouter une **photo / illustration** du perso
- Couleurs / thème selon orientation ou divinité (optionnel)

**Statut** : 🟢 exigence claire, **spec détaillée à faire en phase 2**.

---

## Partie E — Questions ouvertes

### ~~Q-D6.1~~ — Ordre des étapes ✅ **Tranché (2026-04-25)** : Option (c) hybride par mode utilisateur.

**Mode Débutant / Tutoriel** : ordre **strict 1→15**, didactique, le joueur ne peut pas sauter d'étape avant d'avoir validé la précédente. Pédagogique pour les nouveaux joueurs.

**Mode Expérimenté / Libre** : ordre **libre avec dépendances techniques**. Le joueur peut naviguer librement (saisir le nom ou la psychologie tôt, par exemple) tant que les pré-requis sont satisfaits. Les étapes verrouillées affichent leur dépendance manquante (ex: « Aptitudes » verrouillé tant que Race non choisie).

**Sélection du mode** : par défaut tutoriel pour les nouveaux comptes (premier perso créé), libre par défaut ensuite. Toggle disponible dans les préférences.

### ~~Q-D6.2~~ — Validation timing ✅ **Tranché (2026-04-25)** : Option (d) hybride par mode (cohérent avec Q-D6.1).

| Mode                    | Politique de validation                                                                                                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tutoriel / Débutant** | Validation **par étape** — bloquante, message d'erreur clair, force la correction immédiate. Apprentissage progressif.                                                              |
| **Libre / Expérimenté** | Validation **différée avec warnings live** — pas de blocage par étape, badges/notifications visibles ("Aptitudes : 18 / 20"), validation stricte uniquement à la soumission finale. |
| **Expert**              | Validation **uniquement à la soumission finale**. Liberté totale d'expérimentation, le moteur fait confiance.                                                                       |

**Mode par défaut** : Tutoriel pour le premier perso d'un compte, Libre pour les suivants. Toggle dans les préférences.

### ~~Q-D6.3~~ — Brouillons & sauvegardes ✅ **Tranché (2026-04-25)** : Option (d) hybride.

**Mécanique** :

- **Auto-save par étape validée** (bon compromis sécurité / performance)
- **Save manuel** disponible à tout moment via bouton dédié
- **Expiration des drafts inactifs** : après 30 jours sans modification, le draft est archivé puis purgé (configurable côté admin)
- **Restauration** : tout draft non expiré est rechargé automatiquement à la connexion

### ~~Q-D6.3-a~~ — Drafts simultanés ✅ **Tranché (2026-04-25)** : Option (iii) **multiple / illimité**. Le joueur peut maintenir autant de drafts en parallèle qu'il veut. L'expiration automatique à 30 jours d'inactivité (Q-D6.3) fait naturellement le ménage. Permet l'exploration de plusieurs concepts simultanément.

### ~~Q-D6.4~~ — Templates / archétypes ✅ **Tranché (2026-04-25)** : Option (c) **templates étendus + extension communautaire** + **génération PNJ coherente à la volée**.

**Deux mécaniques distinctes** à supporter :

#### C.1 — Templates statiques (pour PJ et PNJ nommés)

- **Templates débutant officiels** maintenus par les admins (Guerrier humain N1, Magicien clerc humain N1, Hobbit voleur N3, …).
- **Templates communautaires** ajoutables par MJ via le CMS (cohérent avec Q-D5.3 / D5).
- Pré-remplissent race + orientation + classe + suggestions d'aptitudes + compétences + équipement de base.
- Le joueur (ou MJ) **ajuste librement** après application du template.
- Marquage du perso comme "issu d'un template" (méta-donnée pour traçabilité).

#### C.2 — Génération PNJ coherente par niveau et par combinaison (GÉNÉRATIVE)

**Use cases** explicitement listés par l'auteur :

- Créer une **armée** (50 humains soldats N3-N5)
- Créer un **groupe de mercenaires** (10 humains/orcs niveau hétérogène)
- Créer un **groupe d'artisans** (5 nains forgerons N4)
- Créer un **groupe de marchands** (3 commerçants par lieu)
- Animer un **combat** avec PNJ ennemis variés
- Toute autre **scène narrative** nécessitant des PNJ rapides

**Exigences** :

- **Toutes les combinaisons** (race × orientation × classe × niveau) doivent être générables — pas de paire interdite par la combinatoire (au-delà des restrictions natives genre Magicien irrévocable cf. R-6.3)
- **Cohérence statistique** garantie par niveau cible : aptitudes / compétences / atouts / vitalité / facteurs sont distribués selon des distributions plausibles (héritières des `setRandom*` du code, mais étendues à tous les niveaux et combinaisons)
- **Génération en lot** : "génère N personnages avec ces critères" (paramétrable : race possible, orientation possible, plage de niveaux, distribution sociale, etc.)
- **Variabilité contrôlée** : pas N copies identiques mais N personnages distincts dans la fourchette demandée
- **Réutilisabilité** : sauvegarder un lot généré comme "groupe nommé" (ex: "Garde personnelle de Lord X") qui peut être instancié plusieurs fois

**Implication architecturale** :

- Service de génération autonome (`PnjGenerator`) avec API genre `generate({ race, orientation, class, level: [min, max], count, contextTags? })`
- Distributions statistiques paramétrables (admin peut tuner les courbes de distribution par niveau / catégorie)
- Vérification automatique de la cohérence (pas de Hobbit avec Force 7 — la limite physique est respectée)
- Support du **contexte narratif** comme méta-paramètre (ex: `contextTags: ['mercenaire', 'guerre', 'mauvais perdant']`) qui peut influencer les choix de psychologie, atouts éphémères, équipement
- Compatible avec les modes MJ humain (génère, MJ ajuste), MJ LLM (génère + LLM enrichit la psychologie/background), MJ auto (génère et utilise direct)

**Renvoi** : la spec complète de ce moteur génératif sera détaillée en D11 (Contrôle PNJ) et D7 (Progression — distributions par niveau).

### ~~Q-D6.5~~ — Avertissements de cohérence ✅ **Tranché (2026-04-25)** : combinaison **(c)+(d)** — deux couches superposées.

**Layer 1 — Mode arbitre (contrôle décisionnel)** :
| Arbitre | Politique |
|---|---|
| MJ humain | Autorise librement, le MJ valide narrativement |
| MJ LLM | Avertissement + validation contextuelle (analyse plausibilité avec background) |
| MJ auto strict | **Bloquant** si combinaison statistiquement incohérente (Force 1 + Bûcheron, Empathie 0 + Médecin, etc.) |

**Layer 2 — Mode utilisateur (UX progression)** :
| Mode UX | Politique |
|---|---|
| Tutoriel / Débutant | Warning **bloquant + explication pédagogique**, demande confirmation explicite ("êtes-vous sûr ?") |
| Libre / Expérimenté | Warning **live, non-bloquant** (badge visible) |
| Expert | **Silence** assumé, aucun warning |

**Comment les couches se combinent** : le mode arbitre détermine si **l'incohérence bloque mécaniquement la création** ; le mode utilisateur détermine **la verbosité** des warnings affichés. Les deux peuvent coexister :

- Auto strict + Expert = blocage silencieux + raison fournie quand on tente de soumettre
- Humain + Tutoriel = avertissement bloquant pédagogique mais override possible avec confirmation
- LLM + Libre = badge live avec analyse contextuelle, pas de blocage

### ~~Q-D6.6~~ — Personnages secondaires (familiers, montures, compagnons) ✅ **Tranché (2026-04-25)** :

**Compagnons / montures** :

- ❌ **N'existent PAS à la création de personnage**
- Acquisition uniquement **en cours de jeu** (achat, dressage, capture, rencontre RP)
- Règle écrite minimale retrouvée : ce sont des personnages/créatures autonomes que leur propriétaire PJ ou PNJ peut faire évoluer en partageant sa propre XP (exemple source : céder de l'XP à un cheval pour améliorer sa course)
- Les occurrences legacy qui incluent les familiers dans les "personnages secondaires" sont à traiter comme un raccourci ancien : les familiers magiques suivent D8 R-8.13

**Familiers (Magicien)** :

- 🟡 **Règles de base retrouvées et structurées en D8 R-8.13**
- La fiche de familier est ouverte dans une **phase de création séparée**, une fois le PF finalisé, validé, et la classe de Magicien confirmée (quelle que soit l'école)
- Le familier utilise un budget total `niveau du magicien × 100`, ses caps `niveau × 5`, ses facteurs base `8`, et ses atouts comme pseudo-raciaux
- La table générale des valeurs d'atouts est la règle de coût : `valeur / 10`

**Implication pour D6** : l'étape de création **n'inclut pas de slot pour compagnon/monture non magique détaillé**. Pour le Magicien, la création doit enregistrer l'atout `Familier`, puis déclencher l'étape post-validation de création du familier selon D8 R-8.13.

### ~~Q-D6.7~~ — Multi-PJ par joueur ✅ **Tranché (2026-04-25)** : Option (b) — **plusieurs PJ actifs, un par table/groupe**.

**Mécanique** :

- Un joueur peut maintenir **plusieurs personnages actifs simultanément**, **chaque PJ étant lié à une table / un groupe / une campagne** spécifique.
- **XP, progression, équipement, atouts** sont **isolés par perso** — pas de transfert entre persos.
- Un PJ peut mourir dans une table sans affecter les autres.
- Les **points de quête** ([regles:248](documents/regles/index.md)) sont également isolés par perso.
- **Un même PJ peut participer à plusieurs campagnes en parallèle** (différents groupes de joueurs) — précisé par l'auteur 2026-04-25. Cohérent avec le multi-table.

**Précision sur les rôles MJ et joueur (2026-04-25)** :

- Le rôle **MJ et joueur ne sont pas exclusifs**. Un même utilisateur peut être :
  - Joueur dans une campagne A (avec son PJ)
  - MJ dans une campagne B (avec ses PNJ)
  - **MJ ET joueur** dans une campagne C qu'il a créée mais où il intervient avec ses PJ (si reprise par un autre MJ par exemple, ou alternance)
- Certains comptes ne seront jamais MJ (joueurs purs), c'est OK.
- **Implication modèle** : les rôles `mj` et `player` sont des **droits/capacités** à attribuer par campagne (pas des types d'utilisateur exclusifs).

**Implication modèle de données** :

- `characters` table a déjà `user_id` (multi-PJ par utilisateur supporté)
- Ajouter une table de jointure `character_campaigns(character_id, campaign_id, role, joined_at)` pour permettre **un même PJ dans plusieurs campagnes**
- Table `campaigns(id, name, mj_user_id, settings)` — un MJ principal par campagne, peut être co-MJ ou délégué
- Tableau de bord joueur affiche tous ses PJ actifs et leurs campagnes d'attache (1 PJ peut apparaître dans plusieurs campagnes)

### ~~Q-D6.8~~ — Impact mécanique de la divinité ✅ **Tranché (2026-04-25)** : Option (c) hybride — impact mécanique opt-in.

**Mécanique** :

- **Athée légal** mais limite l'accès aux mécaniques religieuses (atouts, classes, compétences théologiques). Cohérent avec [regles:282](documents/regles/index.md) : _« Vous pouvez décider d'être athée, mais à long terme, cela risque de devenir moins intéressant pour le jeu. »_
- **Croyant pratiquant** : accès aux atouts religieux (Foi, Pouvoir symbolique, etc.), classes religieuses gates par culte, compétences théologiques de la religion choisie. **Devoir RP** de respecter les préceptes — sanctions XP en cas de manquement (cf. règles XP qui valorisent le respect de psychologie / parole).

**Extensibilité religieuse (précisée par l'auteur 2026-04-25)** :

- Les classes religieuses comme **Exorciste** et **Inquisiteur** sont actuellement gated « Dieu Unique » uniquement.
- À l'avenir, des **équivalents pour d'autres religions** existeront probablement, **avec des noms différents** (« Exorciste » et « Inquisiteur » sont des termes connotés Dieu Unique). Exemples potentiels : Chasseur de démons (théologie elfique ?), Purificateur (théologie nordique ?), etc.
- **Implication modèle** : ne **pas hard-coder** « classe X requires religion Y ». Plutôt :
  - Chaque classe religieuse a un champ `religion_required: religion_id`
  - Chaque religion peut **avoir 0..N classes** dédiées
  - Le CMS admin (D5 R-5.3) permet d'ajouter de nouvelles classes religieuses par religion à mesure que le lore s'enrichit.

**Implication modèle de données** :

- `religions(id, name, description, is_monotheistic, ...)` — catalogue éditable
- `classes.religion_required` (nullable) — pointe vers `religions(id)` si classe gated par religion
- `characters.religion_id` (nullable) — null = athée
- Compétences théologiques liées à `religions(id)` via `skills.religion_id` (nullable)

**Renvoi** : le **catalogue complet des religions** (et leurs préceptes) sera détaillé en **D12** (Géographie / Social / Lore) en lisant `regles-papier/extracted/histoires/cultes-et-religions.md` (919 Ko PDF).

### ~~Q-D6.9~~ — Création de PJ à N > 1 ✅ **Tranché (2026-04-25)** : Option (d) hybride par mode + restrictions.

**Mécanique** :
| Mode | Politique création N > 1 |
|---|---|
| Tutoriel / Débutant | **N1 forcé** — pas d'exception. Pédagogie de la création complète. |
| Libre | **Avec autorisation MJ** d'une campagne. Le MJ peut activer "création au niveau du groupe" pour un nouveau joueur. |
| Expert | **Libre** mais restrictions : XP cumulé fictif obligatoirement distribué selon Experience.doc (NA × 5 pour aptitudes, NA × 3 pour compétences, etc.) — pas de "perso à N5 avec stats de N1 + bonus magiques". Le moteur valide la distribution XP. |

**Restrictions complémentaires** :

- Tout perso N > 1 doit avoir une **fiche d'XP cohérente** (XP dépensés + XP non-dépensés cohérents avec le niveau)
- L'admin / MJ peut limiter le niveau max de création par campagne (ex: cap N5 pour rejoindre le groupe)

---

## Acceptance checklist

- [x] ~~Q-D6.1 : ordre des étapes~~ → hybride par mode (tutoriel strict / libre / expert)
- [x] ~~Q-D6.2 : validation timing~~ → hybride (par étape / live warnings / final)
- [x] ~~Q-D6.3 : brouillons~~ → auto-save par étape + manuel + expiration 30j
- [x] ~~Q-D6.3-a : drafts simultanés~~ → illimité avec expiration auto
- [x] ~~Q-D6.4 : templates / archétypes~~ → CMS étendu + générateur PNJ cohérent par niveau (toutes combinaisons, génération en lot, contexte narratif)
- [x] ~~Q-D6.5 : avertissements de cohérence~~ → 2 couches (mode arbitre × mode UX)
- [x] ~~Q-D6.6 : familiers / compagnons~~ → compagnons/montures N/A à création et évoluent par XP partagé ; familier D8 R-8.13 en phase post-validation du PF magicien
- [x] ~~Q-D6.7 : multi-PJ par joueur~~ → autorisé, 1 PJ par campagne mais 1 PJ peut multi-campagne ; rôles MJ/joueur non-exclusifs
- [x] ~~Q-D6.8 : impact mécanique de la divinité~~ → opt-in, extensibilité religieuse (autres religions futures avec classes équivalentes nommées différemment)
- [x] ~~Q-D6.9 : création directe à niveau N > 1~~ → hybride par mode + restrictions XP cohérent + cap MJ

**Nouvelles règles ajoutées (2026-04-25)** :

- **R-6.14 Import / Export automatique** (JSON canonique, checksum, validation, migration de version, approbation MJ)
- **R-6.15 Feuilles tabletop digitales** (PDF + web responsive, modes fiche complète / compacte / combat / social / admin, mise à jour temps réel)

**Méta-principe transversal acté** : _les règles sont vivantes_ — toutes versionnables, modifiables via admin/MJ, migration des persos sur changement de règles. Sauvegardé en mémoire et formalisé dans `sources.md`.

**D6 complet** ✅. Une fois validé → **D7 Progression / XP / niveaux**.
