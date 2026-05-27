# Knight & Wizard — Spécification des surfaces (jouabilité)

> **But** : définir **chaque surface** du produit une par une, à fond, jusqu'à 100 %.
> Méthode : la surface est une **sonde** — préciser ce qu'elle doit laisser faire pour être
> _jouable_ force à expliciter ce que les règles / données / API / `rules-core` doivent réellement
> livrer. L'écart = un **trou d'implémentation** que la surface révèle (la « leçon combat »).
>
> Ce document est la **source de définition** d'où sont dérivés les épics / issues du plan.
> Autorité des surfaces & skins : `docs/design/DA-MATRICES.md` §12. On verrouille surface par
> surface ; on ne passe à la suivante que quand la précédente est à 100 %.

## Suivi des surfaces (18, d'après DA-MATRICES §12)

| #      | Surface                                                                          | Support in-world / skin                           | Statut                                                  |
| ------ | -------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| 1      | **Fiche de personnage**                                                          | livret / feuille d'armes (armorial)               | ✅ **verrouillée**                                      |
| 2      | **Création de personnage**                                                       | lettres patentes → livret (**armorial**)          | ✅ **verrouillée**                                      |
| 3      | **Combat — Tracker DT**                                                          | carnet de campagne (registre du commandant)       | ✅ **verrouillée**                                      |
| 4      | **Lancer de dés / Tripot**                                                       | tripot / table de la Fortune (tripot)             | ✅ **verrouillée**                                      |
| 5      | **Session / Forum (async)**                                                      | relais de courrier (gazette)                      | ✅ **verrouillée**                                      |
| 6      | Décisions MJ + arbitrage (Greffe)                                                | tribunal / audience (greffe/archives)             | ✅ **factorisé** (vue → `GOVERNANCE`)                   |
| 7      | Dashboard « Poste de table »                                                     | placard de dépêches (gazette)                     | ✅ **factorisé** → Cockpit MJ (panneau 1)               |
| 8      | **Lecteur de règles D1–D13**                                                     | codex relié (archives)                            | ✅ **verrouillée** (consultation + query RAG)           |
| 9      | **Grimoire / Sorts**                                                             | le Grand Grimoire (grimoire)                      | ✅ **verrouillée** (moteur → `MAGIC-IMPLEMENTATION.md`) |
| 10     | **Bestiaire**                                                                    | bestiaire illustré (armorial)                     | ✅ **verrouillée** (browser bâti)                       |
| 11     | **Atouts / compétences**                                                         | carnet de compagnon (armorial)                    | ✅ **verrouillée**                                      |
| 12     | **Équipement / armurerie (catalogue)**                                           | livre de compte d'armurier (armorial)             | ✅ **verrouillée**                                      |
| 13     | CMS — règles vivantes                                                            | fonds + registre d'amendements (bibliothèque)     | ✅ **factorisé** (vue → `GOVERNANCE` + Payload)         |
| 14     | Gouvernance des ambiguïtés                                                       | chambre des doutes (greffe)                       | ✅ **factorisé** (vue → `GOVERNANCE`)                   |
| 15     | Assistant MJ LLM + RAG                                                           | conseiller scribe-oracle (gazette/greffe)         | ✅ **factorisé** → Cockpit MJ (panneau 5)               |
| 16     | Mémoire épisodique / lore                                                        | archives profondes (archives)                     | ✅ **factorisé** → Cockpit MJ (panneau 6)               |
| 17     | **Carte interactive (Cartulaire)**                                               | cartulaire (armorial)                             | ✅ **verrouillée** (browser bâti)                       |
| 18     | Release / ops                                                                    | minutes & sceaux (greffe)                         | ❌ **hors surfaces produit** (ops/CI)                   |
| 19     | **Création de PNJ « named »** (bac à sable MJ) _(S2)_                            | sandbox MJ, distinct de la création PJ (armorial) | ✅ **factorisé** → Cockpit MJ (panneau 2)               |
| —      | PNJ communs = quick-create **à la volée dans le Combat** (chair à canon, legacy) | (couvert par S3)                                  | ✅ cadré                                                |
| **MJ** | **Cockpit du Maître de Jeu** (agrège 7+15+16+19)                                 | poste de commandement (skin dédié ?)              | ✅ **spécifié** → `MJ-COCKPIT.md`                       |

---

## Surface 1 — Fiche de personnage ✅ VERROUILLÉE

**Définition** : le **foyer de gestion** du personnage — là où il _vit_ entre les scènes. Carnet
**multi-pages** (vues R-6.15 : complète / compacte / combat / social / MJ). Liste multi-perso par
statut (PJ / PNJ actif / PNJ inactif / Mort / MJ). On y **gère**, on n'y **résout pas** (ni dé, ni
préparation/cast de sort — mais **boire une potion** oui). Support : livret / feuille d'armes scellé
au blason (skin **armorial**).

### Blocs verrouillés

| Bloc                        | Contenu                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Identité + RP**           | nom / sexe / race / orientation / classe ; champs **optionnels** (jamais bloquants) : background, âge, apparence, psychologie, divinité/religion, devise/citation, **Lieu**, relations / compagnons / familier, monture, **journal de quêtes / chronique en cours**, objectifs, notes                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Aptitudes / Compétences** | 9 aptitudes (valeur de base **et** effective : malus de blessure + effets) ; compétences/spés (base **0** implicite, spé possible sans parent, **principale + son arbre récursif ×2**) — **langues & chant = compétences**, pas des métadonnées                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **XP & niveau**             | **banque d'XP** + **barème R-7.5 complet** : aptitude NA×5 (×20/×10/×15 au-delà des limites) · compétence/spé NA×3 (nouvelle 3) · sort NA×10 (nouveau 10) · vitalité max +10 · énergie max +3 · facteurs vitesse/volonté (NB−NA+1)×25 · atout de classe éphémère (+1 usage/j) NA×10. Dépense **entre parties + déclenchable en partie par le MJ** (pas au passage de niveau : il est _dérivé_). **Niveau dérivé** R-7.8/7.9 (Σ points × catégorie de race ; non-mage : principale+arbre ×2 ; mage : sorts ×2). **Atout de niveau** = pool gratuite R-7.10. **Points de quête** = 2ᵉ jauge (R-7.3, +1/session, bloquée jusqu'à fin de quête + survie, puis convertible). **Pas de validation MJ sur la dépense d'XP** (déterministe par coût). |
| **Gain d'XP**               | distribué par le MJ **en fin de session** : **1 XP / heure de jeu EFFECTIF** (R-7.2 — temps réellement joué, **pas** la connexion → garde-fou anti-farming LLM intégré au canon) **+ bonus** (présence, concentration, respect parole/psychologie, objectif, interprétation 0-3) ; fourchette 1-8 indicative.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Prédilection & atouts**   | **slots de prédilection** (arme/instrument/monture/animaux/domaine — issue #140) + **définition des cibles d'atout** (target/scope — issue #139) ; **changements verrouillés par validation MJ**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **État courant (auto)**     | **vitalité ← points de dégât** · **énergie ← sorts lancés** · statuts · **effets actifs** (enchantements des objets **portés** + **buffs/magie en cours**) → tous nourrissent le moteur d'effets ; **repos & soin = actions de gestion** sur la fiche ; **jamais d'édition manuelle** des compteurs                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Équipement / Inventaire** | voir détail ci-dessous                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

### Page Équipement / Inventaire (la grosse nouveauté — legacy ne la gérait pas)

- **Concept RP « habillé de ville »** : on choisit **ce qu'on porte à l'instant** selon la scène
  (pas full-armure permanente). Geste central : faire passer un objet **porté ↔ transporté**.
- **3 états** d'un objet possédé :
  - **Porté / équipé** (actif maintenant : armure par zone, arme(s) en main, bouclier, vêtements) →
    **alimente le combat** (protections par zone, dégâts d'arme, allonge) **+** compte dans le poids porté.
  - **Transporté** (sur soi) → compte dans le poids porté.
  - **Rangé / hors-personnage** → **ne compte pas** dans l'encombrement.
- **Boucle d'encombrement** (pont V2b déjà branché côté moteur) : `carriedWeightKg` = Σ poids sur soi
  × multiplicateur racial d'armure (R-10.4) → **R-2.18** → **FV effectif**. Jauge de charge en direct
  (capacité = Force × 5 kg ; +1 FV par 5 kg au-delà).
- **Inventaire = liste plate + poids** (mode arcade). **Contenants / extradimensionnel = HORS SCOPE**
  (à rediscuter, pas promis).
- **Monnaie** (R-10.18) : Po / Pa / Pb / Pc, stockée en **Pc (entier)**, **portée sur soi → poids inclus**.
- **Consommation décrémentée à l'usage**, jamais à la main : **potion** = action de Fiche (hors combat)
  **ET** action de combat **avec coût FV** ; **munition** = événement de combat ; charges d'enchantement.
- **Enchantements** (R-10.22) : un objet **porté** applique ses effets passifs (→ moteur d'effets).
- **Versioning règles vivantes** (R-10.19) : un objet équipé pointe vers une **version figée** du
  catalogue jusqu'à acceptation de migration.

**Amélioration future (notée)** : génération d'un **visuel du perso portant son équipement** depuis le
design de base.

### Frontière

La Fiche **ne lance pas de dés** et **ne prépare/cast pas de sort** (ça vit en jeu : Tripot, Combat,
Session). Seule exception de « consommation » : boire une potion (aussi action de combat à coût FV).

---

## Surface 2 — Création de personnage ✅ VERROUILLÉE

**Définition** : le **bureau d'enrôlement** — assemblage d'un perso étape par étape, des _lettres
patentes_ au _livret scellé_. Skin **armorial** (la création produit le livret). État : bâtie
(wizard + brouillon API + `finalize`→DB ; validation `character.ts`).

### Flow canonique (R-6.1) — 15 étapes, 3 modes

1 Genre · 2 **Race** (charge catégorie + bases + maxima) · 3 atouts/handicaps de race (auto) ·
4 facteurs & vitalité (auto) · 5 **Orientation** (« Magicien ? » engageant) · 6 Classe ·
7 atouts orientation+classe (auto : 1 orient. + 2 classe) · 8 **Sorts & énergie** (magicien : 2 pts +
conversion 10 comp.→1 sort + énergie 60) · 9 Psychologie · 10 Divinité · 11 Citation ·
12 **Aptitudes** (Σ = catégorie ; 0 ≤ x ≤ raceMax−1) · 13 **Compétences/spés** (Σ = catégorie −
10×sorts_sup ; 0-4 ; primaire par classe ; spé sans parent OK) · 14 **Équipement** (loadout débutant
« raisonnable », validé MJ — **même moteur d'inventaire que la Fiche**) · 15 Nom (obligatoire) + background.

**Modes** : tutoriel **strict** / libre **avec dépendances** / expert **libre**. Brouillons auto-save +
expiration 30 j, multiples. Avertissements de cohérence à 2 couches (arbitre × UX).

### Règles verrouillées

- **Atouts auto** (race/orientation/classe) ; **pas de choix d'atout avant le niveau 2**.
- **Finalisation = verrou** : orientation **et** classe deviennent **irréversibles** (le draft reste
  librement modifiable). Changement post-création = **exceptionnel, MJ-validation-only** (« reclassement »).
  → même motif transversal que prédilection / cibles d'atout : _finalize verrouille → changement = validation MJ_.
- **Familier** (magicien) = **sous-phase de création séparée**, après finalisation du PF.

### Hors scope (→ surfaces séparées)

- **Création de PNJ** : surface dédiée **« Atelier PNJ (bac à sable MJ) »** — Named + PNJ du MJ ; le MJ
  **fixe le niveau** et **distribue librement** (réutilise les automatismes, **sans** la contrainte de budget).
- **PNJ communs** : quick-create via la surface **Combat / gestion MJ** (forme à définir).

### Trous révélés

atouts auto **inertes** (EffectModel, transversal) · étape 14 = **moteur d'inventaire neuf** (cf. Fiche) ·
**verrou de finalisation** orientation/classe + **flux de reclassement MJ-validé** · **sous-flow Familier** ·
**système d'avertissements de cohérence** · (génération PNJ = surface séparée).

---

## Surface 3 — Combat / Tracker DT ✅ VERROUILLÉE (surface ; moteur = `COMBAT-IMPLEMENTATION.md`)

**Définition** : le **Registre du commandant** (skin _registre_) — la table où le MJ gère la **timeline DT**
par-dessus le moteur de combat (V1 ✅, V2 ✅, reste 🟡/❌ tracé dans le registre dédié). État : bâtie
(timeline, roster, file d'actions) mais combattants **en dur** (gap).

### Ce que la surface permet

- **Roster depuis de vraies sources** : PJ (fiche + **loadout porté**) · **PNJ named** (pré-créés ailleurs,
  **engagés** comme alliés **ou** ennemis) · **PNJ communs** (quick-create **à la volée**, chair à canon,
  inspiré du legacy) · bestiaire (gabarits de communs). → **on ne _crée_ pas les named ici, on les engage**.
- **Timeline DT continue** : rounds, DT courant, ordre par FV effectif + tie-break réflexes (R-9.22/23).
- **Actions** par combattant (attaque/défense/move/wait/reload/aim/**consommer** ; **sort plus tard**),
  chacune à son coût FV ; chaîne **touche→zone→dégâts→atténuation→statuts** avec **sortie explicite + voix**.
- **Sync** : dégâts → vitalité des fiches (auto) ; énergie ← sorts (quand Magie).

### Décisions MVP

- **Contrôle PNJ = `human_gm` uniquement** (`auto` / `llm` plus tard).
- **Sans sorts** (la timeline gérera les **TI** quand le **moteur Magie** arrivera).
- **Scope** = roster réel + chaîne touche→dégâts→statuts jouable ; **zones (#131) / allonge (R-9.45) /
  action précise (R-1.12) / seuils par zone (R-9.17)** viennent **au fil du registre**.

### Trous révélés

**roster réel** (remplacer stats en dur) · **pont loadout→combat** · **TI sorts** (dépend Magie) ·
**PNJ communs quick-create** (à concevoir, legacy comme inspiration) · **sync vitalité/énergie** vers fiches.

---

## Surface 5 — Session / Forum (mode asynchrone) ✅ VERROUILLÉE

**Cadre — les 2 modes de jeu (axe _pacing_), tous deux dans le MVP :**

- **Forum (asynchrone)** = **cette surface** : joueurs **pas tous présents**, on poste façon forum. RP +
  jets intégrés + journal live. **Sans combat.**
- **Live (synchrone)** = la surface **Combat / Tracker DT** (S3) : tout le monde présent, le combat s'y joue.

La campagne **alterne** : RP au forum **entre** les sessions live de combat. Skin **gazette**. État : surface
la plus mûre (journal immuable + WebSocket + multijoueur prouvé).

### Ce que la surface permet

- **Scène** : Lieu + personnages présents.
- **Poster en RP** façon forum (async) : les **joueurs** postent comme leurs **PJ** ; le **MJ** poste et
  **interagit comme ses PNJ named** (allié|ennemi), exactement comme un joueur avec son PJ.
- **Jets de dés intégrés au post** (Aptitude + Comp + Σspés vs difficulté, **résolus serveur**).
- **Journal** immuable, temps réel (déjà livré).
- **XP en async** : gagnable, **distribution à la discrétion du MJ** (c'est lui qui la déclenche ; règle
  async précise à définir).

### Hors scope / ailleurs

- **Pas de combat** dans le Forum (combat = mode Live = S3).
- **MJ inline** (pas de console séparée au MVP). **Greffe** (arbitrage) + **Dashboard** (overview) =
  surfaces distinctes, **plus tard**.

### Trous révélés

players/scenes en **API 1ʳᵉ classe** (pas blob JSONB) · **poster-en-tant-que-personnage** (PJ joueur / PNJ
named MJ) · **UX jet-dans-post** · pagination journal · **distribution XP async** (déclenchée MJ) · auth.

---

## Surface 9 — Grimoire / Sorts ✅ VERROUILLÉE (surface ; moteur = `MAGIC-IMPLEMENTATION.md`)

**Définition** : _le Grand Grimoire_ (skin **grimoire**, 11 couleurs d'école) = le **livre de référence** des
sorts. On y **consulte** 324 sorts × 11 écoles (coût énergie / TI / difficulté / portée / durée / effet /
type de dégât). État : **stub** (11 pastilles).

### Frontière

- **Consulter** un sort → ici (le livre).
- **Apprendre / acheter** un sort → sur la **Fiche** (XP, R-7.5 : NA×10).
- **Lancer** un sort → en **jeu** (Forum : jet-dans-post ; Combat live : action de sort avec **TI** dans la timeline).

### La sonde à l'état pur

On peut feuilleter 324 sorts mais **rien ne les résout** : le **moteur Magie (D8) est à ZÉRO** alors que D8
est **complet canoniquement** (10/10). Le moteur est désormais tracé par son **registre dédié**
`MAGIC-IMPLEMENTATION.md`. **Cœur MVP indissociable** : lancement (R-8.5) + énergie coût/récup (R-8.10) +
TI/concentration/interruption (R-8.6/7/8). **Intégration cast = Combat (TI) au MVP** ; Forum (jet-dans-post)
avec le combat asynchrone. Variantes / développement / familier → plus tard.

### Données

`spells.yaml` (324) + `magic-schools.yaml` (11) ✅. **Moteur : 0** ❌. Surface : stub.

---

## Surface 11 — Atouts / compétences ✅ VERROUILLÉE

**Définition** : le **carnet de compagnon** (skin **armorial**) — catalogue-compagnon des **atouts /
handicaps / dons** (~2410) et **compétences** (432). **Consultation** : portée, activation, effet, familles.
État : bâti (visualiseur API) — **mais inerte**.

### Frontière

- **Consulter** ici · **acquérir** (atout de niveau / achat) → Fiche, atouts auto → Création · **effet** → en jeu.
- **Compétences & spécialisations = un seul arbre inséparable** (une spé vit dans l'arbre de sa compétence,
  **même si achetable sans le parent** ; présentation indentée Fiche/legacy) ; ici = **données de référence**
  (consultation), possession/achat sur la **Fiche**.

### La sonde — trou transversal n°1 : atouts listés mais INERTES

Le cadre `EffectModel` (8 cibles) est **déjà consommé** : aptitude (`character.ts`), facteur (`combat.ts`
V2b), pool+difficulté (`dice.ts`). **Trou** : `target:'damage'` **non consommé** (#137) · statuts ténus
(`fou_furieux` seul ; #132/#141) · **specs d'atouts non encodées** (88 + gros des 2410 ; #127).
→ **Pas un build-from-zero** : compléter la consommation + encoder les specs.

### Suivi (décision)

Moteur d'effets = **mécanisme transversal** (Fiche/Combat/Magie/Atouts) → **registre dédié**
`EFFECTS-IMPLEMENTATION.md` (décision propriétaire), qui possède l'EPIC **#122** + son cluster
(#126/#137/#127/#139/#141/#142). Les registres combat/magie **pointent** vers lui.

### Ordre MVP

(a) compléter **`target:'damage'`** (#137) · (b) **encoder un lot pilote** d'atouts (#127 : race + atouts de
niveau) · **statuts** (#132/#141).

---

## Surface 12 — Équipement / armurerie (catalogue) ✅ VERROUILLÉE

**Définition** : le **livre de compte d'armurier / almanach marchand** (skin **armorial**) — **browser de
référence du matériel** : armes (107), protections (59 + 12 boucliers), potions, + item-types D10. On y
**consulte** : poids, formule de dégâts, protection par zone, valeur/prix, allonge, enchantements.

### Frontière

- **Consulter** ici · **posséder/équiper** → page Inventaire de la **Fiche** (moteur d'inventaire) · la
  **donnée** alimente le **combat** via le loadout porté.

### Scope MVP & schéma

- **Catalogue MVP** = **armes / protections / potions** (existant, Zod ✅).
- **Plus tard** : vêtements, outils, équipement de voyage, contenants, **items magiques / légendaires**.
- **Champs ajoutés quand le moteur les consomme** : `reach` (allonge R-9.45) · `enchantments` (R-10.22).

### Sonde

L'essentiel (moteur d'inventaire neuf + D10 absent) **déjà récolté par la Fiche**. Propre à la surface :
catalogues D10 incomplets + pas de route browser dédiée (la donnée sert l'inventaire de la Fiche).

---

## Surfaces 10 & 17 — Bestiaire + Cartulaire ✅ VERROUILLÉES (browsers bâtis, validation rapide)

- **10 Bestiaire** (cabinet du naturaliste, **armorial**) — browser créatures (`bestiaire.yaml`, 31).
  Consulter ; une créature s'**engage** en combat comme PNJ commun (pont `toCombatant`).
- **17 Cartulaire / carte** (table du cartographe, **armorial**) — carte SVG des nations (`nations.yaml`, 29)
  - émaux héraldiques + geojson. Consulter/naviguer ; alimente le champ **Lieu** (Fiche/Session).

Rien de neuf côté moteur (consultations) — déjà bâtis et API-driven.

---

## Surface 4 — Lancer de dés / Tripot ✅ VERROUILLÉE

**Définition** : le **tripot / table de la Fortune** (skin **tripot**) — le dé qui tranche le destin.
État : stub. **Le moteur devance la surface** : `dice.ts` complet (pool D10, cascade des 10, annulation
par 1, échec critique → D100 « tire au cent », diff>9, attribut 0 = échec forcé).

### Périmètre

- **Tripot = tous les jets qui ne sont NI combat NI forum** (jets libres, jets MJ hors scène, tests
  ponctuels). Le **Combat** et le **Forum** ont leur propre contexte de jet.
- _(À trancher plus tard : le **Forum** pourrait **hériter du skin cartes tripot** pour ses jets-dans-post.)_
- Met en scène **tout le moteur** + **voix** (« le destin tire au cent »).

### Trou

- **Test de volonté D20** (R-8.19) : `dice.ts` fait le **pool D10** + l'aptitude brute, pas le **D20** → à vérifier/compléter.

---

## Surface 8 — Lecteur de règles D1–D13 ✅ VERROUILLÉE

**Définition** : _codex relié / volumes de loi_ (skin **archives**) — **consultation** des règles canoniques
D1-D13 + leurs **statuts** (🟢 recevable / 🟡 sous réserve / 🔴 irrecevable). Référence **joueur + MJ**.
**Au plus** : **interroger les règles via le LLM / RAG** (réponses citées). Données = read-model des règles
(`docs/rules/*.md` + knowledge base RAG + matrice canonique). État : stub.
**Frontière** : **lecture seule** (consultation + query RAG) ; l'**édition** = CMS via **Governance**.

## Surface 18 — Release / ops ❌ HORS SURFACES PRODUIT

**Processus ops / CI** (promotion `main` PR-only, hardening, changelog, backup/rollback ; #61) — **rien à
voir avec le jeu**. Tracé comme **process**, pas comme surface joueur/MJ.

---

## ✅ Passe de définition des surfaces — COMPLÈTE

Les 18 surfaces (+ S19 + Cockpit MJ) sont définies :

- **10 verrouillées** : Fiche · Création · Combat · Dés · Forum · Grimoire · Bestiaire · Atouts · Équipement · Cartulaire.
- **3 factorisées → Governance** : Greffe · CMS · Ambiguïtés.
- **4 factorisées → Cockpit MJ** : Dashboard · Assistant LLM · Mémoire/lore · Création PNJ named.
- **1 consultation** : Lecteur de règles (+ query RAG).
- **1 hors-produit** : Release (ops/CI).

**Prochaine étape** : dériver le **plan de dev / épics / issue-list** depuis les surfaces + les 5 docs moteur
(`COMBAT` · `MAGIC` · `EFFECTS` · `GOVERNANCE` · `MJ-COCKPIT`).

---

## 🎨 Audit d'usage des skins (7 disponibles — DA §16)

| Skin             | Surfaces qui l'utilisent                                              | Charge                                                 |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------------------ |
| **armorial**     | Fiche · Création · Bestiaire · Atouts · Équipement-cat · Cartulaire   | **6 — lourd** (famille fiche/catalogues, cohérent §16) |
| **archives**     | Greffe · Lecteur de règles · Ambiguïtés · (Mémoire→cockpit) · Release | 4-5 (famille greffe)                                   |
| **gazette**      | Session/Forum · (Dashboard→cockpit) · (Assistant→cockpit)             | s'allège à ~1 (Forum)                                  |
| **registre**     | Combat                                                                | 1                                                      |
| **grimoire**     | Grimoire/Sorts                                                        | 1                                                      |
| **tripot**       | Dés                                                                   | 1                                                      |
| **bibliotheque** | CMS                                                                   | 1                                                      |

**Constat** : `armorial` très chargé (par design : famille fiche/catalogues) ; `gazette` s'allège (Dashboard

- Assistant migrent au cockpit MJ) ; `registre/grimoire/tripot/bibliotheque` mono-surface. → **Le cockpit MJ
  est le bon candidat pour un 8ᵉ skin dédié** (« poste de commandement »). **À trancher** : ajouter le 8ᵉ skin
  ou réutiliser un existant.

---

## 🔧 Trous moteur récoltés (alimentent le plan / les épics)

> Liste cumulative des écarts d'implémentation révélés par les surfaces verrouillées.

**Depuis la Fiche (surface 1) :**

1. **XP — barème incomplet** : `progression.ts` ne chiffre que compétences (NA×3) et sorts (NA×10).
   Manquent : **attribut** (NA×5/×20…), **facteurs** ((NB−NA+1)×25), **vitalité** (+10), **énergie** (+3),
   atout éphémère (usage/j).
2. **XP — mécanisme de gain absent** : créer l'**horloge de jeu effectif** (1 XP/h, anti-farming),
   l'**award MJ en fin de session** (bonus R-7.2), et la **jauge points de quête** (R-7.3) + conversion.
3. **Inventaire / équipement (épic neuf)** : aucun modèle dans `rules-core`
   (`CharacterEquipmentItem = {id, name?, quantity?}`). Créer `item_instance` (3 états porté/transporté/
   rangé, charges, enchantements, **snapshot catalogue figé**) · **dériver `carriedWeightKg`** ·
   **pont loadout→combat** (produire les specs arme/protection que `combat-damage.ts` consomme déjà) ·
   **décompte des consommables** (+ type d'action combat « consommer » à coût FV) · **modèle de monnaie**
   (R-10.18, stock Pc).
4. **Effets — `EffectModel` non consommé** (transversal Fiche / Atouts / Combat) : enchantements portés +
   buffs/magie en cours + atouts doivent **modifier** les jets/dégâts/FV/statuts, et s'**afficher** comme
   effets actifs sur la fiche.
5. **Prédilection (#140) + cibles d'atout (#139)** : mécaniques à finir, **avec verrouillage par
   validation MJ** sur les changements.
6. **Persistance de l'état courant** : vitalité (← dégâts) et énergie (← sorts) décomptées
   automatiquement et synchronisées (pas d'édition manuelle).

**Depuis la Création (surface 2) :**

7. **Verrou de finalisation** : orientation + classe irréversibles à la finalisation ; **flux de
   changement exceptionnel MJ-validé** (reclassement) — même motif transversal que prédilection /
   cibles d'atout.
8. **Sous-flow Familier** (magicien, post-finalisation) + **système d'avertissements de cohérence**
   (2 couches : arbitre × UX).
9. **Création de PNJ « named »** : nouvelle surface (S19) — réutilise le moteur de création en
   distribution **libre** + niveau imposé par le MJ ; distincte de la création PJ.

**Depuis le Combat (surface 3) :**

10. **Roster réel** : alimenter le tracker depuis PJ (fiche + loadout) / **PNJ named engagés** (allié|ennemi)
    / **PNJ communs quick-create à la volée** (legacy) / bestiaire — remplacer les combattants en dur.
11. **Branchements MVP combat** : contrôle `human_gm` only ; **sans sorts** (TI activés avec le moteur
    Magie) ; **sync vitalité/énergie → fiches**.

> (Pont loadout→combat, atouts inertes & moteur d'inventaire neuf, trous moteur R-9.x du registre =
> déjà listés ailleurs, partagés.)

**Depuis la Session / Forum (surface 5) :**

12. **Modèle à 2 modes de jeu** (axe pacing) : **Forum async** (S5, RP, sans combat) ↔ **Live synchrone**
    (= Combat, S3) ; la campagne alterne. Tous deux dans le MVP.
13. **players/scenes en API 1ʳᵉ classe** (remplacer le blob JSONB) + **poster-en-tant-que** (PJ joueur /
    PNJ named MJ) + **UX jet-dans-post** + pagination journal + **auth**.
14. **Distribution d'XP asynchrone** : à la **discrétion du MJ** (qui la déclenche) — étend le mécanisme de
    gain d'XP (live = 1 XP/h effectif + bonus ; async = discrétion MJ).

**Depuis la Magie / Grimoire (surface 9) — le plus gros build :**

15. **Moteur Magie (D8) entièrement absent** → registre dédié `MAGIC-IMPLEMENTATION.md`. Cœur MVP :
    **lancement** (Int + points de sort vs diff) + **énergie** (coût/récup) + **TI / concentration /
    interruption** (réutilise R-9.4) — **indissociables**.
16. **Intégration cast → Combat (TI dans la timeline DT)** au MVP ; **Forum (jet-dans-post)** avec le combat
    asynchrone.
17. **Grimoire surface** : browser 324 sorts × 11 écoles (couleurs), schéma, lien apprendre→Fiche (stub aujourd'hui).
18. Plus tard : variantes (R-8.11), développement (R-8.12), **familier** (R-8.13), transferts d'énergie (R-8.14),
    résistance (R-8.15) / durées (R-8.20) / cumul (Q-D8.9) à confirmer dans le MVP-résolution.

**Depuis les Atouts (surface 11) :**

19. **Moteur d'effets = mécanisme transversal** → **registre dédié `EFFECTS-IMPLEMENTATION.md`** (possède
    l'EPIC #122 + cluster). Déjà consommé : aptitude/facteur/pool/diff. **À compléter (MVP)** :
    `target:'damage'` (#137), **statuts** (#132/#141), **encodage des specs** (#127, pilote race + niveaux).

**Depuis l'Équipement / catalogue (surface 12) :**

20. **Catalogues D10 incomplets** : armes/protections/potions ✅ ; vêtements/outils/contenants/items
    magiques-légendaires à cataloguer (V2). Champs `reach` (R-9.45) + `enchantments` (R-10.22) à ajouter au
    schéma **au moment de la consommation**. (Moteur d'inventaire + pont combat = déjà listés Fiche.)

**Depuis les Dés / Tripot (surface 4) :**

21. **Test de volonté D20** (R-8.19) non couvert : `dice.ts` gère le pool D10 + l'aptitude brute, mais le
    **D20** (F.Volonté + modificateurs) est un dé distinct → à vérifier/ajouter.

**Factorisation Gouvernance (surfaces 6 / 13 / 14 + changements MJ-validés) :**

22. **Mécanique unique de Gouvernance / Validation MJ** → **registre dédié `GOVERNANCE-IMPLEMENTATION.md`**.
    Valide **tout changement — d'état de jeu OU de canon** (règle/contenu/lore), selon l'autorité
    `human_gm>player>llm>auto`, avec audit + versioning canon. **Greffe (6) / CMS (13) / Ambiguïtés (14)** =
    **vues** dessus ; les changements MJ-validés (prédilection #140, cibles d'atout #139, reclassement) y
    sont **routés**. Évite la duplication de la validation surface par surface (la factorisation manquante).

**Factorisation Cockpit MJ (surfaces 7 / 15 / 16 / 19) :**

23. **Cockpit du MJ humain** → **doc dédié `MJ-COCKPIT.md`**. Vue unique du MJ (≠ vue joueur) qui **cache
    l'info joueur-invisible** et tourne autour du **scénario/scène en cours**. 7 panneaux : scénario/scène ·
    PNJ (roster + contrôle + atelier named) · le fil · combat-commande · assistant LLM+RAG · mémoire/lore+notes ·
    fin de session/XP. Absorbe Dashboard (7) / Assistant LLM (15) / Mémoire-lore (16) / Création PNJ named (19).
    **Greffe = vue à part.** Futur : **musique d'ambiance**. Skin dédié « poste de commandement » à trancher.
