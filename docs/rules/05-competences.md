# D5 — Compétences & Spécialisations

> Système ouvert sans liste exhaustive. Hiérarchie récursive **famille → compétence → spécialisation → spé de spé → … (infini)**. Toute compétence ou spécialisation imaginable est admissible (sous validation). C'est l'épine dorsale du système de pool de dés (R-1.2).

**Sources** :
- [documents/regles/index.md:175-205](documents/regles/index.md) — section "Compétences et Spécialisations"
- [documents/regles/index.md:206-222](documents/regles/index.md) — règle compétence primaire (rappel D4)
- [documents/regles/index.md:294-298](documents/regles/index.md) — distribution à la création
- [documents/competences/index.md](documents/competences/index.md) — catalogue web canonique (~380 lignes, 10 familles)
- [regles-papier/extracted/listes/experience.md](regles-papier/extracted/listes/experience.md) — coûts XP
- [site/includes/class/CharacterPlayer.php:60-189](site/includes/class/CharacterPlayer.php) — calcul `levelPoints` avec récursion sur les spés de primaire
- [site/includes/managers/_DBManager.php:775-819](site/includes/managers/_DBManager.php) — `getAllSkills`, `getAllSkillsFamilies`

---

## Partie A — Règles de définition

### R-5.1 — Compétence vs Spécialisation : définitions

**Énoncé legacy** — [documents/regles/index.md:178-187](documents/regles/index.md) :

> **Compétence** : Savoir et technique de base, dans un secteur donné.
> **Spécialisation** : Développement et perfectionnement d'un secteur précis d'une compétence.

**Heuristique de classification** *(extrait des règles)* :
> « Pour vous aidez, vous pouvez vous poser la question : Serait-il possible de prendre un cours de … ? Si la réponse est oui, il est fort probable que la chose en question soit une compétence. Si au contraire, vous vous dîtes non, que cela serait un chapitre d'un cours de …, alors il y a fort à parier que vous faîtes référence à une spécialisation. »

**Statut** : 🟢 claire (mais le sens "intuitif" laisse de la marge)

**Exemples canoniques** :

| Compétence | Spécialisations |
|---|---|
| Danse | Tango, Mutchka Putchka, Galop |
| Course | Sprint, Course d'endurance |
| Arc long | Tir dans la gorge, Tir dans la tête, Tir en mouvement, Tir monté |
| Cuisine | Pâtisserie, Cuisine altérienne, Sandwich, Cuisine corteganne |

### R-5.2 — Système ouvert : pas de liste exhaustive

**Énoncé legacy** — [regles:176](documents/regles/index.md) :
> « Ce point du jeu est essentiel, car celui-ci ne vous propose pas de liste exhaustive. L'idée étant bel et bien de considérer une **infinité de compétences** avec pour chacune d'entre elles, **une infinité de spécialisations**. »

**Conséquences** :
- Le joueur peut **inventer une compétence** ou une spécialisation à tout moment, sous validation MJ / LLM / moteur (le rapport doit être plausible).
- Le **catalogue web** (`documents/competences/index.md`, 10 familles) sert de **référentiel suggéré**, pas de carcan.
- Pas de plafond mécanique sur les points investis (point 4012 en furtivité possible — borne uniquement par l'XP disponible).

**Statut** : 🟢 claire

### R-5.3 — Récursivité illimitée des spécialisations

**Énoncé code** — [CharacterPlayer.php:115-152](site/includes/class/CharacterPlayer.php) implémente une boucle récursive :

```php
do {
    foreach ($specialisationsIdArray as $specialisationsId) {
        foreach ($this->skills as $skill) {
            if ($skill['isChildOf'] == $specialisationsId) {
                // ... add to count, accumulate
            }
        }
    }
} while (count($newSpecialisationsIdArray) > $k);
```

→ Une spécialisation peut elle-même avoir des **spécialisations** (sous-spés), et ainsi de suite. Le code traite l'arbre **récursivement sans limite de profondeur**.

**Exemple** : Combat → Arc long → Tir dans la tête (arc long) → Tir dans la pomme sur tête (?) → ...

**Statut** : 🟢 claire

### R-5.4 — Échelle 0-15 de pondération (reflet narratif)

**Énoncé legacy** — [regles:189-205](documents/regles/index.md) :

| Points | Description |
|---|---|
| 0 | Vous ne connaissez rien à la chose. |
| 1 | Vous avez de vagues notions. |
| 2 | Vous êtes débutant. |
| 3 | Vous êtes initié. |
| 4 | Vous avez un niveau professionnel. |
| 5 | Vous êtes expert dans votre domaine. |
| 6 | Vous êtes connu de là d'où vous venez. |
| 7 | On connaît votre nom dans le métier. |
| 8 | On parle de vous dans votre pays. |
| 9 | Votre nom est cité lorsqu'on parle de votre branche. |
| 10 | Vous êtes connu dans le monde entier. |
| 11 | On vous reconnaît dans la rue. |
| 12 | Vous entrez dans la légende. |
| 13 | Vous comptez maintenant parmi les atouts de la nation. |
| 14 | Votre avis et vos actes influencent sur les puissants de ce monde. |
| 15+ | Vous êtes devenu un mythe, les gens ne vous croient plus mortel. |

**Référentiel mécanique** : 4 points = niveau professionnel (R-1.14 D1 — pro = ~4 réussites de moyenne).

**Statut** : 🟢 claire

**Conséquence narrative** : le score n'est pas qu'un chiffre — il **détermine la réputation** du perso dans ce domaine (à intégrer en D12 social).

---

## Partie B — Création et progression

### R-5.5 — Distribution à la création

**Énoncé legacy** — [regles:294-298](documents/regles/index.md) :

> Le nombre de points que vous pouvez dépenser est à nouveau égal à votre **catégorie** (comme précédemment pour les aptitudes).
> Le **minimum** de points est de zéro (dans ce cas ne notez pas la compétence sur votre feuille).
> Le **maximum** est de **4** (pour un nouveau personnage).

**Règle** :
- À la création, `Σ(points compétences + spécialisations) = catégorie de la race`
- Min 0 (= ne pas posséder du tout)
- Max 4 par compétence ou spécialisation individuelle (cap niveau "professionnel")

**Statut** : 🟢 claire

### R-5.6 — Progression via XP (rappel R-2.20)

**Coûts officiels** ([Experience.doc](regles-papier/extracted/listes/experience.md)) :

| Action | Coût XP |
|---|---|
| +1 point dans une compétence existante | NA × 3 (3, 6, 9, 12, 15, …) |
| Apprendre une nouvelle compétence (passe à 1) | 3 (flat) |
| +1 point dans une spécialisation existante | NA × 3 |
| Apprendre une nouvelle spécialisation (passe à 1) | 3 (flat) |

**Statut** : 🟢 claire

**Pas de plafond explicite** — un personnage suffisamment expérimenté peut atteindre 15 points et au-delà.

### R-5.6-bis — Le coût XP n'est qu'une dimension : système d'apprentissage complet

L'apprentissage d'une compétence/spécialisation **ne se résume pas au coût XP**. Il existe un système plus large dérivé du lexique (atouts spécifiques) qui implique :

1. **Accès au savoir** (RP) — il faut un mentor, un cours, un manuscrit, une expérience pratique. Préalable narratif. Implicite : un Hobbit n'apprend pas "Cuisine corteganne" sans rencontrer un Cortegan, voir un livre de recettes, voyager.
2. **Temps d'apprentissage** (mécanique) — exprimé en **jours**. Durée par défaut variable selon la compétence, modulable par certains atouts.
3. **Jet d'apprentissage** (mécanique) — l'élève fait un jet de dés (formule à préciser, probablement Intelligence + compétence dédiée). Les réussites accélèrent ou validateent l'apprentissage.
4. **Jet d'enseignement** (mécanique) — le mentor (s'il y en a un) fait un jet en parallèle. Ses réussites s'ajoutent à celles de l'élève (à préciser exactement).
5. **Coût XP** (R-5.6) — payé au passage de niveau pour entériner le gain.

**Atouts qui modifient le temps d'apprentissage** :

| Atout | Effet | Source |
|---|---|---|
| **Affinité arcanique** | Jours d'apprentissage de sorts ÷ (niveau + 1) | Magicien N3, [lexique:50](regles-papier/extracted/listes/lexique.md) |
| **Don pour les langues** | Jours d'apprentissage de langue ÷ niveau | (à confirmer la condition d'accès), [lexique:369](regles-papier/extracted/listes/lexique.md) |
| **Esprit logique** | Jours d'apprentissage en sciences mathématiques ÷ niveau | Intellectuel N2, [lexique:450](regles-papier/extracted/listes/lexique.md) |
| **Né pour tuer** | Jours d'apprentissage de techniques de combat / armes ÷ (niveau + 1) | Guerrier N3, [lexique:751](regles-papier/extracted/listes/lexique.md) |
| **Autodidacte** | Permet d'apprendre seul (sans mentor) un sort vu/entendu, mais ×2 le temps | Permanent, [lexique:140](regles-papier/extracted/listes/lexique.md) — interdit aux Chamans |

**Atouts qui modifient les jets d'apprentissage / enseignement** :

| Atout | Effet | Source |
|---|---|---|
| **Apprentissage rapide** | +niveau aux réussites du **jet d'apprentissage** | Intellectuel N2, [lexique:98](regles-papier/extracted/listes/lexique.md) |
| **Enseignement efficace** | +niveau aux réussites du **jet d'enseignement** (côté mentor) | Précepteur N2, [lexique:440](regles-papier/extracted/listes/lexique.md) |

**Spécificité Magicien — apprentissage des sorts** :
- L'atout **Autodidacte** permet d'apprendre un sort sans maître, mais double le temps. Implique qu'**en règle générale, un sort nécessite un mentor**.
- **Chamans exclus** d'Autodidacte → ils doivent toujours avoir un maître (cohérent avec la nature transmise oralement de leur magie).
- L'atout **Affinité arcanique** réduit drastiquement le temps (÷ niveau+1).
- Le coût XP reste 10 par point dans un sort + 10 pour un nouveau sort (Experience.doc).

**Gating culturel implicite** : la majorité des spécialisations marquées culturellement (langues régionales, cuisines régionales, étiquettes, théologies) n'ont **pas de gating mécanique** explicite. Le gating se fait par **disponibilité du mentor / du savoir** (étape 1 ci-dessus) — un Hobbit qui n'a jamais quitté ses collines ne croisera jamais de mentor cortegan.

**Formule des jets d'apprentissage et d'enseignement** *(tranché par l'auteur 2026-04-25)* — cohérent avec R-1.2 :

**Côté élève — jet d'apprentissage** :
- **Aptitude** : **Intelligence** par défaut, **autre aptitude possible selon le type de matière et de méthode d'enseignement** (ex: Dextérité pour apprendre une danse, Force pour la lutte, Endurance pour endurance physique, Empathie pour psychologie sociale, etc.)
- **Compétence** : « **Apprentissage** » (compétence générique, située dans Maîtrise de soi du catalogue)
- **Spécialisation** : « **Apprentissage [domaine]** » (ex: « Apprentissage de la magie », « Apprentissage des langues », « Apprentissage de la musique » — déjà dans le catalogue web ligne 254-256)

**Côté mentor — jet d'enseignement** :
- **Aptitude** : **Empathie** par défaut, **autre aptitude possible selon le type d'enseignement / matière** (ex: Charisme pour oration, Intelligence pour savoirs académiques, etc.)
- **Compétence** : « **Enseignement** » (compétence générique, située dans Social du catalogue ligne 347)
- **Spécialisation** : « **Enseignement [domaine]** » (ex: « Enseignement de l'équitation (cheval) », « Enseignement de la magie » — déjà dans le catalogue web ligne 348-349)

**Règle générale** : la compétence/spé d'apprentissage et d'enseignement suivent le pattern R-1.2 (pool = aptitude + compétence + spé applicables) avec choix narratif de l'aptitude la plus pertinente.

### R-5.6-ter - Durée d'apprentissage en jours

**Statut source** : les sources legacy prouvent l'existence d'un apprentissage en jours, de jets d'apprentissage/enseignement et d'atouts de réduction, mais ne donnent pas la formule explicite des jours de base.

**Décision auteur (2026-04-27)** : la règle de travail est fixée comme règle canonique jusqu'à éventuelle réforme future : utiliser le coût XP comme base, avec un multiplicateur simple cohérent avec le style K&W.

```text
jours_base = coût_XP × 3
jours_après_jets = jours_base - réussites_apprentissage - réussites_enseignement
jours_final = max(plancher, jours_après_jets)
```

**Planchers** :

| Type d'apprentissage | Plancher |
|---|---:|
| Compétence ou spécialisation simple | 1 jour |
| Langue, science, technique complexe | 3 jours |
| Nouveau sort | 7 jours |
| Développement de sort | 14 jours |
| Conceptualisation | 30 jours minimum, sauf validation MJ |

**Modificateurs** :
- Autodidacte sur un sort : `jours_base × 2`, puis réduction par jet d'autodidacticité.
- Développement magique / avancé : `temps_apprentissage_sort × 2`, puis réduction par jet de développement.
- Conceptualisation : 100 jours pour un sort de base, moins jet de conceptualisation, ajustable par le MJ selon le sort.
- Atouts réducteurs (Affinité arcanique, Don pour les langues, Esprit logique, Né pour tuer) : division après calcul de la base, arrondie au supérieur.

**Exemples de base avant jets/atouts** :

| Action | Coût XP | Jours base |
|---|---:|---:|
| Nouvelle compétence / spécialisation | 3 | 9 |
| Compétence/sp. NA 2 → 3 | 6 | 18 |
| Compétence/sp. NA 5 → 6 | 15 | 45 |
| Nouveau sort | 10 | 30 |
| Sort NA 2 → 3 | 20 | 60 |
| Sort NA 5 → 6 | 50 | 150 |

**Statut** : 🟢 acté.

**Statut** : 🟢 claire (formule du jet + durée de base + couplage mentor).

**Zones d'ombre restantes** :
- Politique de gating narratif des compétences exotiques → **Q-D5.2-d**

### R-5.7 — Compétence primaire (rappel D4 R-4.5)

- **Non-magicien** : une compétence primaire au choix (selon classe). Cette compétence ET ses spécialisations (récursivement, cf. R-5.3) octroient ×2 points de niveau au lieu de ×1.
- **Magicien** : pas de compétence primaire mécanique — c'est tous les sorts qui comptent ×2 dans levelPoints.
- **Héritage récursif sur la primaire** : confirmé par le code [CharacterPlayer.php:91-152](site/includes/class/CharacterPlayer.php), la propriété "primaire" se propage à toutes les spécialisations descendantes (spés, spés de spés, etc.).

### R-5.8 — Cas limite : spécialisation sans compétence mère

**Précisé en D1 R-1.3** : un personnage peut avoir des points dans une **spécialisation sans avoir la compétence mère**. Rare mais possible.

**Conséquences** :
- Pool de dés = aptitude + 0 (pas de compétence) + points de spé
- Le **modificateur -1 de compétence** (R-1.9) ne s'applique pas (pas de compétence)
- Le **modificateur -1 par spécialisation** (R-1.10) s'applique normalement

**Statut** : 🟢 claire

**Cas typique** : *"un débutant en combat qui a appris un seul mouvement précis sans maîtriser les bases générales de l'arme"*. Possible RP, sous validation cohérence narrative.

### R-5.9 — Cumulabilité des spécialisations multiples

**Énoncé legacy** — [regles:364-368](documents/regles/index.md) :

> Vous pouvez également posséder plusieurs spécialisations qui sont pertinentes à l'action que vous entreprenez. Celles-ci se cumulent ainsi que leur diminution de difficulté.

**Conséquences** (déjà vues en D1 R-1.10) :
- Toutes les spécialisations applicables s'**additionnent** au pool de dés
- Toutes les spécialisations applicables **diminuent la difficulté de 1 chacune**
- Pas de cap sur le nombre de spés cumulables (limité par ce qui est "applicable")

**Statut** : 🟢 claire

**Exemple canonique** : Salogel tire dans la carotide d'un humanoïde avec un arc long → applique simultanément les spés "Tir dans la gorge (arc long)" + "Tir dans la carotide (arc long)" si elles existent et sont pertinentes.

---

## Partie C — Catalogue web canonique

### R-5.10 — 10 familles de compétences

Le catalogue [documents/competences/index.md](documents/competences/index.md) regroupe les compétences en **10 familles** (dérivées de `getAllSkillsFamilies` dans le code) :

| # | Famille | Description |
|---|---|---|
| 1 | **Art** | Disciplines artistiques (chant, danse, instruments, peinture, sculpture, prestidigitation…) |
| 2 | **Artisanat** | Métiers de fabrication (bijouterie, couture, forge, menuiserie, poterie, tannage…) |
| 3 | **Combat** | Armes, parade, esquive, mains nues (~75 compétences/spés) |
| 4 | **Connaissance** | Savoirs académiques (alchimie, langues, théologie, sciences, droit…, ~120 entrées avec spés) |
| 5 | **Jeu** | Jeux de société et d'argent (dames, échecs, poker…) |
| 6 | **Maîtrise de soi** | Apprentissage, méditation, mémoire, stoïcisme, yoga, furtivité |
| 7 | **Savoir-faire** | Métiers pratiques (agriculture, chasse, cuisine, médecine, pêche, navigation, vol à la tire…) |
| 8 | **Sens** | Perception sensorielle (goût, odorat, ouïe, touché, vue) |
| 9 | **Social** | Interactions humaines (commandement, commerce, séduction, intimidation, oration, étiquette…) |
| 10 | **Sport** | Activité physique (course, équitation, escalade, lutte, natation, surf, vol…) |

**Note de design** : ces familles sont une **convention d'organisation**, pas une mécanique — aucune règle de jeu ne dépend de la "famille". Sert essentiellement à organiser l'UI / la fiche de perso.

**Statut** : 🟢 claire

### R-5.11 — Volume du catalogue

- ~380 lignes au total dans le scrape web
- ~150 compétences "racine"
- ~230 spécialisations explicitement référencées (sous-niveau 1)
- Quelques sous-spés (sous-niveau 2+)

**Le catalogue n'est PAS exhaustif** : c'est un **point de départ** — les joueurs peuvent inventer toute compétence/spécialisation cohérente. C'est le principe de R-5.2.

**Statut** : 🟢 claire

---

## Partie D — Cas particuliers

### R-5.12 — Mapping classe → compétence primaire (référentiel D4)

D4 R-4.5 a établi le mapping. Récap des cas :

| Type de classe | Compétence primaire |
|---|---|
| Évidente (Forgeron, Bûcheron, Cuisinier, Archer, …) | Mappée par défaut (Forge, Bûcheronnage, Cuisine, Arc long ou Arc court) |
| Ambiguë (Pirate, Voleur, Hors-la-loi générique, Escroc, …) | Suggestions canoniques + choix custom validé (D4 Q-D4.3) |
| Magicien | NULL (pas de primaire mécanique, sorts ×2) |

### R-5.13 — Compétences soumises à condition de race / culture

Certaines spécialisations sont **liées à une culture, race ou contexte** :
- **Langages** : Langue elfique, Langue verte, Langage altérien, Langage cortegan, etc. → typiquement liées à la nationalité d'origine ou apprises via Apprentissage des langues
- **Cuisines régionales** : Cuisine altérienne, Cuisine corteganne, Cuisine yonnienne… → lien culturel
- **Étiquette** : Étiquette altérienne, carénienne, cortegane → contexte social
- **Théologies** : Théologie ancestrâle, du Dieu Unique, elfique, païenne, nordique → lien religieux

**Statut** : 🟡 implicite

**Question implicite** (à creuser en D6 Création) : ces spés sont-elles **gated** par la race / nationalité / religion du perso, ou choix libre ?

### R-5.14 — Compétences contextuelles (terminologie variable)

**Énoncé legacy** — [regles:185-187](documents/regles/index.md) :
> « Vous pouvez même posséder plusieurs de ces compétences et/ou spécialisations pour le même personnage sans que cela ne gêne. L'important demeure que chaque joueur comprenne ce qu'il a noté sur sa feuille et sache à quel moment il devra utiliser quoi. »

→ Plusieurs noms peuvent décrire la **même compétence** sans interaction mécanique néfaste. Ex: "Bagarre" / "Combat à mains nues" / "Karaté" / "Boxe" peuvent coexister sur une fiche.

**Conséquence design** : pas de déduplication forcée — le moteur autorise des doublons sémantiques (sous validation MJ/joueur).

**Statut** : 🟢 claire

---

## Partie E — Modèle de données

### R-5.15 — Structure persistée

```sql
skill_families (id, name, sort_order)
skills (id, name, family_id, parent_skill_id NULL, description NULL, is_canonical BOOLEAN)
character_skills (character_id, skill_id, points, is_main BOOLEAN, is_main_inherited BOOLEAN)
```

**Notes architecturales** :
- `skills.parent_skill_id` : NULL pour les compétences racines, pointe vers une compétence pour les spécialisations (récursif R-5.3 — un parent peut lui-même avoir un parent).
- `is_canonical` : `TRUE` pour les ~380 entrées du catalogue web, `FALSE` pour les compétences inventées par les joueurs (à modérer).
- `character_skills.is_main` : marqueur direct (compétence primaire désignée par le joueur).
- `character_skills.is_main_inherited` : drapeau dérivé (spé d'une compétence primaire — propage le ×2 dans levelPoints récursivement, cf. CharacterPlayer.php).

### R-5.16 — Calcul `levelPoints` consolidé

```python
def compute_level_points(character):
    points = 0
    if character.orientation == "magicien":
        for skill in character.skills:
            points += skill.points          # ×1
        for spell in character.spells:
            points += 2 * spell.points      # ×2 quel que soit l'école (cf. D4 Q-D4.9)
    else:
        primary_id = character.primary_skill_id
        for skill in character.skills:
            multiplier = 2 if skill.is_main_inherited or skill.id == primary_id else 1
            points += multiplier * skill.points
        # is_main_inherited propagé récursivement aux spés du primary
    return points
```

**Niveau dérivé** : `level = floor(levelPoints / race.category)`.

---

## Partie F — Questions ouvertes

### ~~Q-D5.1~~ — Création / modération de compétences custom ✅ **Tranché (2026-04-25)** : Option D (hybride par mode).

**Mécanique** :
| Mode de session | Politique |
|---|---|
| Sandbox solo / débrouille | Création libre, marquée `is_canonical = FALSE` |
| Multijoueur avec MJ | MJ valide chaque ajout custom (validation synchronisée) |
| Mode LLM (MJ-LLM) | LLM valide la cohérence (rapport plausible, granularité OK, pas d'abus mécanique) |
| Mode auto strict | Seules les compétences canoniques admises, pas de custom |

**Heuristique de validation** : « pourrait-on prendre un cours de … ? » (cf. regles:185) — si oui = compétence, sinon = spécialisation. À cumuler avec un test de plausibilité (pas de "Frapper avec dague enchantée +5 contre orcs gauchers le mardi").

### Q-D5.1-a — Promotion communautaire de compétences custom au catalogue ✅ **Tranché (2026-04-25)** : Oui, mécanisme de promotion à implémenter.

**Mécanique proposée** (à affiner en spec) :
- Une compétence custom utilisée par **N joueurs distincts** ou validée par **M MJ humains** différents devient **candidate à la promotion**.
- Promotion = passage de `is_canonical = FALSE` à `TRUE`, ajout au catalogue web public.
- Seuils N et M : à définir en phase 2 (peut être 5 joueurs, 3 MJ).
- Validation finale par un curateur (auteur ou modérateur communautaire) avant promotion.
- Permet au catalogue de **grandir organiquement** avec l'usage.

### Q-D5.2 — Spécialisations soumises à condition

Certaines spés (langages, cuisines régionales, étiquettes, théologies) sont culturellement gated.

- **(a)** Gating dur : un Hobbit ne peut pas apprendre "Cuisine corteganne" tant qu'il n'a pas vécu en Cortega
- **(b)** Soft gating : c'est plus cher en XP / plus long à apprendre hors contexte d'origine
- **(c)** Pas de gating mécanique, juste narratif : le MJ / joueur le justifie

### ~~Q-D5.3~~ — Catalogue éditable et dynamique ✅ **Tranché (2026-04-25)** :

Le catalogue de compétences (familles, compétences, spécialisations, hiérarchie, tags, synonymes, descriptions) est un **CMS dynamique** géré par les **administrateurs ET les MJ** avec un workflow agile :

- **Édition libre** par les rôles admin et MJ (ajouter, renommer, déplacer, fusionner, supprimer)
- **Mise à jour fréquente** anticipée — la structure va évoluer au fil des discussions et de l'usage
- **Pas de structure figée** côté code : le code consomme le catalogue depuis la DB / une source modifiable, jamais de hardcode

**Implication architecturale** :
- `skill_families`, `skills`, et leurs liens parent/enfant doivent être éditables en runtime via une interface d'admin
- **Versioning** : un historique des changements (qui a modifié, quand, quoi) est nécessaire pour traçabilité
- **Migration des fiches** : si une compétence est renommée/déplacée/fusionnée, les fiches de personnages existantes doivent suivre (relinking automatique ou semi-automatique)
- **Multi-environnement possible** : variant par-campagne ou par-serveur si l'auteur décide à terme (à creuser)
- **Workflow de proposition** : un MJ peut proposer un changement, un admin peut le valider (lié au workflow Q-D5.1-a sur la promotion communautaire)

**Recherche Phase 2 à produire** : le principe CMS/règles vivantes est acté, mais l'implémentation doit encore comparer des options concrètes : catalogue versionné en DB, interface admin/MJ, migration automatique vs assistée, rollback, audit, permissions par campagne et impact sur personnages existants.

Cette décision résout aussi **Q-D5.5** (assignation famille des customs : édition par admin/MJ) et **Q-D5.7** (doublons/synonymes : gérés par admin via fusion ou tagging).

### ~~Q-D5.4~~ — Profondeur d'arbre des spécialisations ✅ **Tranché (2026-04-25)** : politique par mode, alignée sur le pattern 3-modes universel.

| Mode | Politique |
|---|---|
| **MJ papier** (humain) | **Illimité** — création libre de sous-spés à profondeur arbitraire, le MJ valide narrativement la pertinence |
| **MJ LLM** | **Strictement le catalogue canonique validé** par admin — pas de création de nouvelles entrées en cours de session |
| **MJ digital / auto** | Idem — **strictement le catalogue canonique** |

**Conséquence** : la seule autorité créative durable est l'**admin** (via le CMS de Q-D5.3) ou le **MJ papier** (cas par cas, dans sa session). Les modes LLM et Digital consomment le catalogue à un instant T sans pouvoir l'étendre dynamiquement.

**Effets de bord** :
- Les **sessions LLM/Digital sont stables** — le catalogue ne change pas en cours de partie.
- Les **sessions MJ papier sont créatives** — le MJ peut inventer une spé à la volée, mais cette création reste **locale** (sauf promotion ultérieure au catalogue canonique via Q-D5.1-a).
- L'admin peut **enrichir le catalogue** entre sessions ; LLM/Digital récupèrent le nouveau état au prochain démarrage de session.

### ~~Q-D5.5~~ — Auto-catégorisation des compétences custom ✅ **Tranché (2026-04-25, lié à Q-D5.3)** : la catégorisation est éditable par admin/MJ via le CMS. Au moment de la création, le joueur peut suggérer une famille ; un admin/MJ valide ou repositionne. Pas de famille "Custom" séparée — toutes les compétences vivent dans le même arbre, distinguées uniquement par le flag `is_canonical`.

### ~~Q-D5.6~~ — Catalogue web vs paper ✅ **Tranché (2026-04-25)** : **aucun catalogue paper de compétences n'existe**. Vérification dans les listes paper (regles-papier/extracted/listes/) : armes, atouts-de-niveaux, bestiaire, experience, grand-grimoire, lexique, orientations-et-classes, protections, rituels-et-potions — **mais pas de fichier "competences"**. Le catalogue web (`documents/competences/index.md`) est la **seule source canonique**, et il est désormais géré comme un CMS éditable (Q-D5.3).

### ~~Q-D5.7~~ — Doublons / synonymes du catalogue web ✅ **Tranché (2026-04-25, lié à Q-D5.3)** : la gestion est admin via le CMS. Les doublons peuvent être :
- **Fusionnés** (admin choisit un nom canonique, redirige les autres comme synonymes)
- **Conservés comme entrées distinctes** si nuances réelles (ex: Bagarre vs Boxe vs Karaté = arts martiaux différents même si sémantiquement proches — cf. R-5.14)
- **Tagués** comme synonymes pour faciliter la recherche

Pas de règle stricte de normalisation — c'est un **arbitrage admin/MJ au cas par cas**.

---

## Acceptance checklist

- [x] ~~Q-D5.1 : politique de création de compétences custom~~ → hybride par mode
- [x] ~~Q-D5.1-a : promotion communautaire~~ → oui
- [x] ~~Q-D5.2-a : formule jet apprentissage / enseignement~~ → R-1.2 (apt + comp Apprentissage/Enseignement + spé)
- [x] ~~Q-D5.2-b : durée de base d'un apprentissage en jours~~ → `coût_XP × 3 jours`
- [x] ~~Q-D5.2-c : couplage élève/mentor~~ → `jours - réussites apprentissage - réussites enseignement`
- [x] ~~**Q-D5.2-d** : gating narratif des spés exotiques~~ → **Option B (2026-04-25)** : validation contextuelle par mode. MJ humain valide narrativement. MJ LLM valide la cohérence avec background (lieu d'origine, historique, voyages, mentors mentionnés). MJ auto : pool restreinte aux spés "natives" (compatibles race + lieu d'origine), les autres requièrent un événement de jeu pour débloquer.
- [x] ~~Q-D5.3 : reclasser certaines compétences ou rester strict au web~~ → catalogue CMS dynamique admin/MJ, web canonique initial
- [x] ~~Q-D5.4 : profondeur d'arbre encouragée ou plafonnée~~ → politique par mode, MJ papier illimité, LLM/auto catalogue validé
- [x] ~~Q-D5.5 : assignation de famille pour les customs~~ → édition admin/MJ dans le même arbre
- [x] ~~Q-D5.6 : divergences avec un catalogue paper éventuel~~ → aucun catalogue paper compétences trouvé, web canonique
- [x] ~~Q-D5.7 : doublons / synonymes dans le catalogue web~~ → gestion CMS par fusion, renommage, synonymes

**Note importante** : la table dans `documents/atouts/index.md` qui semble lister des "coûts XP" pour les atouts (Affinité arcanique 3000, Né pour tuer 3000, etc.) est en réalité une **table de pondération de game design** (échelle de puissance/équilibre des atouts entre eux) — **pas** des coûts XP payés par les joueurs. Ces valeurs servent à comparer les atouts pour équilibrer le système, pas à les acheter. À garder en tête pour D7 (Progression).

Une fois validé → **D6 Création de personnage** (assemblage de tous les choix : genre, race, orientation, classe, atouts, aptitudes, compétences, équipement, psychologie, divinité, citation, background).
