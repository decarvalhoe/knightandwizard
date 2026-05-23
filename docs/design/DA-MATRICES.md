# DA K&W — Matrices Surface→Style & Nation→Ambiance

> Préalable au prochain prompt Claude Design. Voir aussi [`FRONTEND-FOUNDATIONS.md`](./FRONTEND-FOUNDATIONS.md) et [`CLAUDE-DESIGN-BRIEF.md`](./CLAUDE-DESIGN-BRIEF.md).
>
> **Révélation de la 2ᵉ fournée** : les 3 directions validées (Armorial / Gazette / Greffe) ne sont **pas des alternatives concurrentes** — ce sont **3 « skins » institutionnels d'une même famille**, posés sur un socle commun (parchemin + encre + voix cynique). On les **assigne par surface** (matrice 1) et on les **teinte par nation** (matrice 2).

---

## 1. Socle commun (toutes surfaces, toutes nations)

- **Substrat** : papier vieilli (`canvas ≈ #ECE2BE`), grain, ombres dures décalées, double filet noir. **Modes Jour + Veillée (nuit)** sur les trois.
- **Convention de dé partagée** : réussite = encre pleine · critique/touché = accent · le « 1 »/ouvert = **rouge sang italique** · cascade `↪`.
- **Voix** : pince-sans-rire, cynique, in-world. La **microcopie, les états vides et l'affichage du jet** portent la voix (c'est ça, le « chien »).
- **Invariant produit dans la voix** : *« le greffier ne tranche pas, il consigne »* / *« la cire reste au sceau : suggère, ne calcule pas »* → le LLM propose, **rules-core arbitre** (`human_gm > player > llm > auto`).

## 2. Les 3 skins (issus des 3 planches)

| Skin | Métaphore réelle | Accents (émaux/encres) | Polices | Voix (échantillon court) |
|---|---|---|---|---|
| **Armorial des Nations** | héraldique / registre des êtres | gueules `#8B1F1F` · azur `#1F4870` · or `#B68842` · sinople `#4D5E2A` | Cormorant SC + EB Garamond | « L'écu illisible est un écu mal porté » |
| **Gazette des Routes** | presse / courrier-relais | bleu ordres `#264874` · rouge cachet `#8B2418` · sépia | Playfair Display + PT Serif + Special Elite | « les routes sont calmes. Cela non plus n'est pas rassurant » |
| **Greffe des Causes** | greffe / registre judiciaire | rouge tampon `#8B2018` · sceau `#5C2A30` · carbone `#1F3A55` | Libre Caslon + Source Serif 4 + Courier Prime | « Le greffier ne tranche pas. Il consigne. » |

Nuit (commun aux trois) : fonds `#16100A`/`#211810`/`#2C2218`, texte `#E8D9B0`/`#A8916C`, accents désaturés.

## 3. Matrice 1 — Surface → métaphore → skin

> ⚠️ **Superseded par §12.** Ce tableau ne liste que les **3 skins de base** ; l'**assignation par surface qui fait foi = §12** (atomisation diégétique). Conservé pour mémoire.

| Surface (statut) | Métaphore réelle | Skin de base | Pourquoi |
|---|---|---|---|
| Dashboard « Poste de table » (live) | **Bureau des dépêches** | Gazette | la une du jour = santé serveur + accès |
| Fiche de personnage #52 (live→v0.4) | **Armorial / Livret du héros** | Armorial | identité = blason + « stat block » |
| Création de personnage (live) | **Enrôlement au rôle** | Greffe + Armorial | étapes = pièces à verser au registre |
| Combat tracker DT (live→v0.4) | **Registre du commandant** | *(nouveau skin)* | timeline DT = chronomètre d'ordres ; « le commandant consigne les coups » |
| Lanceur de dés (transverse) | **Tripot / maison de jeu** (casino-pachinko) | *(nouveau skin, accent du contexte)* | cascade des 10 = le frisson ; échec critique = « le destin tire au cent » |
| Session / journal d'événements #54 | **Courrier-relais** | Gazette | flux = dépêches (« BIEN ARRIVÉ / RETARD / PERDU ») |
| Décisions MJ + multi-arbitrage + rollback | **Tribunal / audience** | Greffe | hiérarchie d'arbitrage = ordre d'audience ; rollback = « renvoi à l'audience » |
| Lecteur de règles D1–D13 | **Code & jurisprudence** | Greffe | règles = articles ; statuts 🟢🟡🔴 = recevable / sous réserve / irrecevable |
| Browsers de catalogues (armes, sorts, bestiaire, atouts) | **Armorial / Almanach** | Armorial | catalogues = registres des choses & des êtres |
| CMS Payload — règles vivantes #56 | **Chancellerie / greffe d'édition** | Greffe | éditer = amender le registre (versioning par champ) |
| Gouvernance des ambiguïtés #57 | **Chambre des doutes** | Greffe | ambiguïté = cause en délibéré |
| Assistant MJ LLM + RAG cité #58–59 | **Conseiller qui cite, ne tranche pas** | Gazette + Greffe | « suggère, ne calcule pas » ; citations = renvois d'article |
| Mémoire épisodique / lore #60 | **Archives / Chroniques** | *(nouveau skin)* | historique = fonds d'archives (cotes, chemises) |
| Carte interactive (live) | **Cartulaire / table des nations** | Armorial | les nations + leurs émaux |
| Release / ops #61 | **Minutes & sceaux** | Greffe | promotion = acte scellé |

→ **Familles de skins** : **Greffe** (règles, décisions, CMS, ambiguïtés, ops) · **Gazette** (dashboard, session, notifs, présentation de l'assistant) · **Armorial** (fiche, catalogues, carte, lore) · **Registre du commandant** (combat) · **Tripot** (dés) · **Archives** (historique/mémoire). Socle + voix communs.

## 4. Matrice 2 — Nation → pays anachronique → ambiance

Sert aussi de **système d'accent régional** : les émaux du blason (canon, `nations.yaml`) deviennent la teinte de la nation active.

| Nation | Pays détourné | Époques mêlées | Clichés à jouer (pour déconner) | Émaux / indices canon |
|---|---|---|---|---|
| **Alteria** | Italie Renaissance | Rome antique ↔ Quattrocento ↔ contemporain | cité-princière, faste, art, justice théâtrale | or, **balance d'or** ; Dona **Santa-Lucarna** |
| **Irtanie** | **Europe de l'Est / mafia russe** (État failli post-effondrement) | médiéval ↔ XXᵉ post-soviétique | parrains (*vory*), misère noire, marché noir, « on mange des cailloux » (**formule de voix**, pas le terrain) | terrain canon = **plaines + montagnes + fleuve Longue Noire** (blason jaune/brun/noir) ; **famille Clemente** (gouvernement caché) ; famine + cannibalisme ; 99 % illettrés |
| **Fauche-le-Vent** | France des arts | Grand Siècle ↔ Belle Époque | panache, raffinement, snobisme d'artistes | or/noir/blanc/vert, **cerf blanc** ; « faons » |
| **Enorie** | France/Bourgogne chevaleresque | médiéval ↔ Camelot | chevalerie errante, honneur, piété | or/bleu/blanc, **fleur de lys** ; **de Bourgonil** |
| **Empire** | Allemagne/Autriche | Saint-Empire ↔ Prusse | ordre, discipline, militarisme, sérieux | rouge/or/noir, **aigle bicéphale** |
| **Cortega** | Espagne | Siècle d'or ↔ inquisition | inquisition, ferveur sombre, honneur | rouge/bleu/blanc, **Oracle** ; Inquisition Cortégante |
| **Dêtre** | Russie / slave | tsarisme ↔ hiver brutal | roi-tyran, faste glacé, complots | rouge/noir/vert, **haches** ; **Svetlatchev** |
| **Dundoria** | Perse / Orient | califats ↔ alchimie | bazars, alchimistes, élixirs | vert/rouge/or, **cimeterres**, croissant ; pierre philosophale |
| **Yonkado** | **Extrême-Orient (sino-japonais)** | impérial ↔ intemporel | dragons, porcelaine, cour impériale (panthéon Chine + Japon : Amaterasu/Susanowo) | rouge/blanc, **dragon blanc**, « or blanc » |
| **Terres du Nord** | Scandinavie | âge viking | pillage, mer, runes, bière | rouge, **drakkar**, Hugin/Munin, Jarls |
| **Aderand** | Venise / Suisse marchande | cité-comptoir | négoce, neutralité vénale, mercenaires | vert/bleu/or, **moulin/port** |
| **Blanc Royaume** | *anachronisme punk assumé* | — | elfes **piercings/tatouages/narcotiques**, fanatiques | provocation au Haut-Royaume |
| **Monde Sombre** | dystopie elfe noire | — | mélancolie militarisée, **Sans Noms** | bleu/noir, anneau brisé, larmes |
| **Haut Royaume** | hauts-elfes éternels | — | sages, **couples dirigeants**, condescendance bienveillante | trois lunes, argent |
| **Forêt de Tyrkan** | elfes sylvains | — | nature inviolable, **Serment d'Écorce** (flèches aux intrus) | écorce, vert |
| **Collines d'Ico** | gnomes farceurs | — | démocratie de blagueurs (ont tué un ethnographe « en bourrique ») | vert, rose des domaines |
| **Grand Désert** | frontière hors-la-loi | Far-West ↔ Dune | renégats, mercenaires, vers des sables | jaune sable, croix des renégats |
| **Landes Désertiques** | terres mortes (gothique) | — | morts-vivants, **Lingua mortis**, culte de la mort | gris déchiré (« bannière déchirée ») |

## 5. Factions (couleur pour PNJ & lecteur de règles)

- **Les Sans Noms** (Monde Sombre) : **guilde d'assassins d'État** — orphelins elfes noirs dressés, tatoués par employeur, **vendus** (≈ 25–75 M écus). « Mort comme un Sans Nom qui danse ».
- **Famille Clemente** (Irtanie) : mafia / **gouvernement caché**.
- **Maisons divinatoires** (magie brune) : **Aruspices** (sinistres, manipulateurs) · **Astrologues** (riches, soutiennent l'Empereur, snobs) · **Augures** (conseillers royaux) · **Chiromanciens** (sociables, QG fortifié à Abejuan) · **Géomanciens** (rustiques, Terres du Nord).

## 6. Traces écrites & décisions

- **Ambiances des nations : écrites** (`nations.md` + `nations.yaml`). ✓
- **Tradition orale : documentée** (`blagues-dictons-et-proverbes.md`) **mais** `us-et-coutumes.md` est un **stub** (seule la coutume Homme-Rat existe). → la plupart des coutumes restent **orales/non écrites** : opportunité produit — la « voix » de l'app peut **générer dictons/coutumes par nation**, gouvernés canonical-first (jamais en dur).
- **Décision utilisateur (actée)** : **Alteria = Italie Renaissance faste** (*pas* de mafia) ; **Irtanie = Europe de l'Est + mafia russe**, État failli / misère noire. (Dêtre reste l'autre registre « Est » : tsarisme/autocratie slave de Svetlatchev — distinct de l'Irtanie failli-mafieuse.)
- **Résolu (utilisateur)** : on **garde le canon** — Irtanie = plaines/montagnes + fleuve, **pas de désert** (vérifié : « désertique » n'est écrit que pour *Grand Désert* + *Landes Désertiques* ; `land-13` = « Villes : Ameral · Montagnes »). « On mange des cailloux » est une **formule de voix/microcopie** pour la misère irtanienne, sans toucher au terrain canon.
- Le **mapping pays** est une **interprétation soutenue par les indices canon**, pas un mapping écrit explicite → à valider/affiner avec toi.

## 7. Prochain prompt Claude Design (préparé — pas encore envoyé)

Reformuler ainsi : « Les 3 directions ne sont pas concurrentes : ce sont une **famille de skins** sur un socle commun. Applique la **Matrice 1** (un skin par surface : Greffe=règles/décisions, Registre du commandant=combat, Tripot=dés, Archives=historique, Gazette=session, Armorial=fiche/catalogues) et la **Matrice 2** (accent régional par nation via les émaux du blason). Produis des planches **par surface** (pas encore un proto applicatif), en Jour + Veillée, WCAG AA, la voix dans la microcopie. »

## 8. Cosmologie — le mythe « Knight & Wizard » (ancrage DA majeur)

- **Cosmogonie émotionnelle** : *Temps × Espace → Amour →* le **Néant** (aîné) + jumeaux **Matière / Antimatière** ; cascade d'émotions primordiales ; **énergie blanche (positive) vs noire (négative) en guerre éternelle**. Pas de Bien/Mal absolu (sauf Culte de la Mort & Chaos) → **responsabilité morale individuelle**.
- **Peuples** (énergie verte) : elfes (air), nains (roche), hommes (plaines), ondins (eau), hobbits (butte), gnomes (champignon).
- **La Mort & le dragon Eresthos** (lac d'Eresthos) : les immortels survivants deviennent **les dieux** ; naissance de la magie ; **les écoles de magie = dispersion colorée des énergies** (le décompte **canonique = 11 écoles** par D8 R-8.3 / Grand Grimoire — détail couleurs en §14 ; le « 8 » du mythe est thématique, pas le compte officiel).
- **Le titre du jeu = une prophétie** : deux enfants élus — un **Chevalier** (physique) et un **Sorcier** (psychique) — **destinés à s'entretuer pour rééquilibrer le monde**.
- → **Ancrage DA** : la **dualité** (encre↔lumière, blanc↔noir, ordre↔chaos), le **dé qui tranche le destin** (cascade des 10, échec critique « rigolo »), et la palette des **8 écoles par couleur** = un système d'accent magique tout prêt.

## 9. Cartes & assets visuels (réels, déjà dans le repo)

- **Carte du monde** : `apps/interactive-map/public/maps/terres-oubliees.jpg` (legacy `apps/legacy-php-site/download/map/terres-oubliees.jpg`, variante `…/img/maps/map-world.jpg`).
- **16 cartes régionales** (jpg) : `apps/interactive-map/public/maps/{alteria,collines-ico,cortega,detre,dundoria,empire,enorie,fauche-le-vent,foret-tyrkan,haut-royaume,irtanie,portes-azrak,sombre-monde,terres-nord,yonkado}.jpg` (+ `dist/`, + legacy `download/map/`).
- **Frontières digitalisées** : `public/data/geojson/{regions,cities}.geojson` ; **QGIS** : `qgis/kw-world.qgs|.qgz` + layers `regions/cities/routes.gpkg`.
- **Blasons/drapeaux** : `public/flags/` (mini + numérotés 8/9/13/21/24) ; tout indexé dans **`data/catalogs/images.yaml`**.
- *Sans carte régionale propre* : Blanc Royaume, Grand Désert, Landes Désertiques, Terres Sauvages, Aderand.
- ⇒ **Réutilisables** pour le skin **Armorial/Cartulaire** (vraies cartes + vrais blasons) et pour Claude Design (`images.yaml` = l'index).

## 10. Régions web (carte) + corrections vérifiées

- **Portes d'Azrak** = **nains forgerons, forteresse alpine close** (volcans + glaciers, 10 portes, lac d'Herestos ; roi Orotrim). Pays détourné : **Suisse alpine fortifiée**.
- **Stazyliss** = hommes-lézards des marais, isolationnistes pacifiques.
- **Terres Sauvages** = horde barbare **gobelinoïde** (orcs/ogres/trolls), registre hunnique/mongol ; cible des raids dundoriens.
- **Royaume du Chaos** = terre **mutagène du Chaos** (extrême-nord) — registre cauchemar, pas un vrai pays.
- **Lounaxill** = comptoir / **route de l'opium** (seul ancrage canon : origine Opium/Mandragore).
- **Île aux Basilics** = île monstrueuse (*terra periculosa*) · **Montagnes Grises** = chaîne (pas une nation) · **Onarit / Treadur / Chez Nous / Terres Sans Noms** = **non écrit** → zones-tampons, **ne pas inventer**.
- **Corrections** : « **Sans Noms** » = soldats-assassins du **Monde Sombre** (≠ région *Terres Sans Noms*, spéculative). **Yonkado** = sino-**japonais** (pas Chine pure).
- **Divergences — arbitrées (2026-05-22)** : Oracle de Cortega = **non figé** (légende ; faisable sous conditions, le MJ arbitre) ; princesse → **impératrice d'Alteria = Santa-Ferucci** (version web à jour ; réf canonique à mettre à jour ; le MJ propriétaire tranche in fine) ; **toponymes + emplacements des cartes = CANON** (villes/rivières, positions non aléatoires) ; Géomanciens **Deonit/Deenit = on garde les deux** (orthographe incertaine, non figée).

## 11. Décisions à trancher (checklist)

**A · Cartes (pipeline vectorisation)**
- A1. Approche **validée** : extraction des lignes d'encre (cv2) → **parchemin + encre** (canon préservé, DA-raccord, ~1 s/carte). vtracer (trace couleur) écarté (délavé, perd le canon).
- A2. Niveau de finition à industrialiser : (i) 2-tons encre pur · (ii) **+ émaux par région** (couleur héraldique) · (iii) **+ labels en vrai texte** (depuis `cities` data, i18n) · (iv) + relief hachuré DA. → *reco (ii)+(iii) puis batch des 16.*

**B · Design system**
- B1. Skin « identité maître » : Armorial / Greffe / Gazette ? *(reco : Armorial pour l'identité, skins par surface pour le reste).*
- B2. 2ᵉ accent = **8 écoles de magie = 8 couleurs** — l'adopter pour magie/sorts ? *(reco : oui).*
- B3. Police **display/serif** (ouverte depuis F1) : Cormorant / Playfair / Libre Caslon + Inter en texte ?
- B4. Valider la **Matrice 1** (surface→skin) — un ajustement ?

**C · Canon (divergences)**
- C1. Oracle de Cortega : **2 vs 1** gorgée fatale.
- C2. Princesse d'Alteria : **Santa-Lucarna** (paper) vs **Santa-Ferucci** (web).
- C3. Géomanciens QG : **Deonit vs Deenit** (Enorie).
- C4. Toponymes lus sur les cartes (OCR) : canon ou indicatif ?
- C5. 11 régions web : acter les **5 mappables** (Azrak/Stazyliss/Terres Sauvages/Chaos/Lounaxill) ? laisser les **6 « non écrit »** en zones-tampons ?

**D · Process**
- D1. **Commit + push** des docs DA + scripts (pour lecture GitHub par Claude Design) ?
- D2. **Re-prompt Claude Design** (planches par surface) maintenant, ou après ces arbitrages ?

## 12. Atomisation diégétique des surfaces

> Principe (directive utilisateur) : chaque surface = un **support in-world** consulté dans un **lieu** précis. On répond à : *« où, dans le monde K&W, irait-on chercher cette info, sur quel support, et où trouve-t-on ce support ? »*. Les skins (Armorial/Gazette/Greffe + nouveaux) en découlent — **un skin + une typo par surface**, liés par la signature K&W (§13).

| Surface (statut) | Lieu in-world | Support / médium | Skin | Typo / voix (piste) |
|---|---|---|---|---|
| Dashboard « Poste de table » (live) | panneau d'affichage de l'auberge / la table | **placard de dépêches** du jour | Gazette | Playfair + typewriter ; « la une » |
| Fiche de personnage #52 (live→v0.4) | sur soi ; copie au greffe | **livret / feuille d'armes** scellé (blason) | Armorial / Livret | Cormorant + EB Garamond |
| Création de personnage (live) | **chancellerie / bureau d'enrôlement** | **lettres patentes** à remplir → livret scellé | Greffe → Armorial | formulaire + sceau |
| Combat — Tracker DT (live→v0.4) | **tente du commandant** / le champ | **carnet de campagne** + sablier d'ordres | **Registre du commandant** *(nouveau)* | main militaire sèche + chiffres mono |
| Lancer de dés (transverse) | le **tripot** / la **table de la Fortune** (clin d'œil à l'Oracle) | dés + **jeton / feuille de pari** | **Tripot / Fortune** *(nouveau)* | voix « rigolo » ; « le destin tire au cent » |
| Session / journal d'événements #54 | le **relais de courrier** | **dépêches / lettres de relais** | Gazette des Routes | « BIEN ARRIVÉ / RETARD / PERDU » |
| Décisions MJ + multi-arbitrage + rollback | le **tribunal / l'audience** | **minutes d'audience / registre des causes** (rollback = « renvoi/cassation ») | Greffe des Causes | « le greffier consigne » ; hiérarchie `human_gm>player>llm>auto` = ordre de parole au barreau |
| Lecteur de règles D1–D13 | les **archives du droit / grande bibliothèque** | **codex relié / volumes de loi** | Greffe / Archives juridiques | Libre Caslon + Source Serif + Courier (renvois d'art.) ; statuts 🟢🟡🔴 = recevable/sous réserve/irrecevable |
| Sorts / magie (Grand Grimoire) | **cabinet du mage / bibliothèque arcane** | le **Grand Grimoire** (le livre) | **Grimoire** (≠ DA globale rejetée : ici c'est LA bonne métaphore, ciblée) | accent = **11 couleurs d'écoles** (§14) |
| Bestiaire | **cabinet du naturaliste** | **bestiaire illustré** (notes pince-sans-rire) | Bestiaire / cabinet de curiosités | fiches d'espèce |
| Atouts / compétences (métiers) | **maison de guilde / compagnonnage** | **carnet de compagnon** | Carnet d'atelier | marques d'artisan |
| Équipement / armurerie | **armurerie / comptoir d'Aderand** | **livre de compte d'armurier** | Almanach marchand / ledger | prix, poids, charge |
| CMS Payload — règles vivantes #56 | la **grande bibliothèque / chancellerie** | **fonds + registre d'amendements** | **Bibliothèque** *(nouveau ; ton exemple)* | éditeur = scribe ; versioning par champ |
| Gouvernance des ambiguïtés #57 | la **chambre des doutes** | **causes en délibéré** | Greffe | |
| Assistant MJ LLM + RAG cité #58–59 | au côté du MJ — un **conseiller / scribe-oracle** | **notes annotées + renvois** (cite, ne tranche pas) | Greffe / Gazette | « suggère, ne calcule pas » |
| Mémoire épisodique / lore #60 | les **archives profondes / chroniques** | **chemises, cotes, fonds** | **Archives** *(nouveau)* | |
| Carte interactive (live) | la **table du cartographe** | **cartulaire** (cartes vectorisées DA + blasons/émaux) | Armorial / Cartulaire | cf. pipeline cartes (§A1) |
| Release / ops #61 | le **sceau officiel** | **minutes & sceaux** | Greffe | acte scellé |

## 13. Signature K&W (le liant)

Une **police/texture par surface** — mais **une seule ossature** dessous. Ce qui fait « K&W » partout :
- **Substrat** : parchemin + encre, ombres dures décalées, double filet, **sceau de cire**, marges annotées.
- **Voix** : pince-sans-rire, cynique, in-world (microcopie / états vides / jet de dés).
- **Dé & destin** : pool D10, cascade des 10, **D100 « tire au cent »** de la catastrophe.
- **Dualité fondatrice** (mythe, §8) : **Chevalier ↔ Sorcier**, blanc ↔ noir → **modes Jour / Veillée**.
- **Deux systèmes d'accent** : **émaux héraldiques par nation** (§4) + **11 couleurs d'écoles** pour la magie (§14).
- **Tokens & composants partagés** : échelle typo, espacements, radius, états (focus/hover), a11y AA, et composants de base (boutons, champs, badges, sceaux) = **un seul système**.
- **Règle d'or** : *chaque skin habille la MÊME ossature (mêmes tokens/composants) ; seules typo + texture + ornement + couleur changent par surface.*
- **Deux niveaux de signature** (cf. §15) : la **signature moteur** (dé/destin, multi-arbitrage, dualité Chevalier↔Sorcier, ossature de tokens) est **universelle** ; la **signature Terres Oubliées** (parchemin, héraldique, voix, supports diégétiques §12, couleurs d'écoles §14) est un **pack de setting ré-skinnable**.

## 14. Accent « magie » — 11 écoles = 11 couleurs (canon D8 R-8.3 / Grand Grimoire 🟢)

| # | École | Couleur | Spécialiste | abbr |
|---|---|---|---|---|
| 1 | Abjuration | Jaune | Abjurateur | Abj |
| 2 | Altération | Rouge | Altérateur | Alt |
| 3 | Magie blanche | Blanc | Clerc | Bla |
| 4 | Divination | Brun | Devin | Bru |
| 5 | Enchantement | Turquoise | Enchanteur | Enc |
| 6 | Élémentaire | Bleu | Élémentariste | Ble |
| 7 | Illusion | Violet | Illusionniste | Ill |
| 8 | Invocation | Orange | Invocateur | Inv |
| 9 | Magie naturelle | Vert | Druide / Chaman | Nat |
| 10 | Magie noire | Noir | Sorcier | Noi |
| 11 | Nécromancie | Gris | Nécromancien | Nec |

→ Usage : couleur d'école pour les sorts (grimoire, fiche, combat). À décliner en versions **Jour/Veillée accessibles** (les couleurs canon sont des teintes nominales, à mapper en tokens contrastés AA).

## 15. Architecture multivers — moteur agnostique + packs de setting

K&W est **collaboratif et vivant** :
- **Règles = canoniques ET vivantes** : elles évoluent, mais un changement doit être **validé** (équilibrage / cohérence) pour devenir canon.
- **Lore = encore plus vivant** : les MJ papier ajoutent éléments / personnages-clés ; une fois validés, ils deviennent canon (incarnables par d'autres MJ, pris en compte dans les nouveaux scénarios). **Leviers géopolitiques** (guerres, alliances, traités commerciaux) qui changent les rapports entre nations et le cours de l'Histoire.
- **Narration rhizomatique / multiverselle** : un MJ peut situer son scénario dans une **temporalité différente** ou une **branche propre** → mondes parallèles, timelines alternées.
- **Les Terres Oubliées = la branche ORIGINELLE** (médiéval-fantasy), mais le **système (« la cuisine ») doit pouvoir servir n'importe quel univers** — y compris non médiéval-fantasy, autres cartes, autre setting.

**Conséquence design — séparer deux couches :**
1. **Moteur (agnostique)** : ossature de tokens primitifs, composants de base, **UI dé/destin** (pool D10, cascade, D100), **multi-arbitrage**, **dualité Chevalier↔Sorcier** + modes Jour/Veillée, a11y, invariant « suggère, ne calcule pas ». → **persiste à travers les univers**.
2. **Packs de setting (skins)** : l'habillage thématique d'un univers. **Terres Oubliées = 1er pack** (parchemin/encre/sceau, héraldique/émaux, voix pince-sans-rire, supports diégétiques §12, couleurs d'écoles §14). Un autre univers = un **autre pack** sur le **même moteur**.

→ « Design system K&W » = **moteur + packs**. Claude Design produit d'abord le **pack Terres Oubliées** (§12), mais sur une **ossature pensée comme ré-skinnable** (le branchage rhizomatique/temporel est une affaire de **données narratives**, pas de refonte visuelle).
