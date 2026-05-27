# Spécification — Cockpit du Maître de Jeu (MJ humain)

> **But** : la **vue unique du MJ humain** — son _control center_ / écran, qui **cache aux joueurs** ce
> qu'ils ne doivent pas voir et **tourne autour du scénario / de la scène en cours**. Le MJ ne voit **pas**
> la même chose que les joueurs. Posée par-dessus les mécanismes (`GOVERNANCE`, `COMBAT`, `MAGIC`,
> `EFFECTS`, rules-core) + le LLM. **Factorise** les surfaces **7 (Dashboard) · 15 (Assistant LLM+RAG) ·
> 16 (Mémoire-lore) · 19 (Création PNJ named)** en **panneaux d'une seule surface**.
>
> Fondement : vision (gestion de scène, contrôle PNJ hybride, timeline DT), **R-11** (contrôle PNJ), **R-13**
> (rôles / passation / modes), **R-7.2** (XP fin de session), legacy (FightAssistant + Play + back-office
> admin), et les pratiques MJ générales (écran du MJ = control center : info cachée, référence rapide,
> tracker d'initiative, stats PNJ, notes, gestion de scénario).

## Principe

Le MJ a une **vue distincte** des joueurs : elle **masque l'info joueur-invisible** (stats/vitalité PNJ,
secrets, beats à venir) et s'organise **autour du scénario & de la scène en cours**.

## Les 7 panneaux

1. **Scénario & scène en cours** _(colonne vertébrale — la notion qui manquait)_ : scénario actif,
   scène / lieu courant, fils d'intrigue, secrets, beats prévus, ambiance. _(Absorbe le rôle d'overview du
   Dashboard.)_
2. **PNJ** : roster (named + communs), **stats/vitalité cachées des joueurs**, **contrôle** (assigner
   `player / human_gm / auto / llm`, R-11), créer un **named** (atelier bac à sable), engager allié | ennemi.
3. **Le fil** : journal / flux de session live (vue MJ du Forum / de la scène).
4. **Combat (commande)** : **vue MJ de la timeline DT** — gérer les PNJ ennemis (≠ vue joueur).
5. **Assistant LLM + RAG** : suggestions, **citations** de règles (ne calcule pas), lookup rapide PNJ / règle.
6. **Mémoire / lore + notes** : mémoire de session, notes MJ, **ajout de lore** (→ `GOVERNANCE` pour devenir canon).
7. **Fin de session / XP** : déclencher la distribution (R-7.2 : 1 XP/h effectif + bonus).

## Hors cockpit

- **Greffe (arbitrage)** = **vue à part** (S6, sur le mécanisme `GOVERNANCE`). Une notification peut y
  pointer, mais la console d'arbitrage reste séparée.

## Améliorations futures (notées)

- **Musique d'ambiance** : gestion d'ambiance sonore par scène, pilotée depuis le cockpit (proche futur).
- (autres à venir — réflexion MJ à approfondir au besoin.)

## Skin

Identité **dédiée** proposée : « **poste de commandement** » (cousin du _registre du commandant_ du combat,
mais MJ-global). Cf. **audit d'usage des skins** dans `SURFACES.md` (on sous-utilise la variété). À trancher :
ajouter ce **8ᵉ skin** ou réutiliser un existant.

## Surfaces factorisées ici

| Surface d'origine              | Devient                               |
| ------------------------------ | ------------------------------------- |
| 7 Dashboard « Poste de table » | panneau 1 (scénario/scène + overview) |
| 15 Assistant MJ LLM + RAG      | panneau 5                             |
| 16 Mémoire / lore              | panneau 6                             |
| 19 Création PNJ named          | panneau 2 (atelier PNJ)               |
