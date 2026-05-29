# MVP v0.4 RC - Table reseau jouable

Date d'audit : 2026-05-29.

Ce cut remplace une lecture trop large de "MVP canonique complet". L'objectif
v0.4 RC est une table K&W jouable en reseau, sans IA obligatoire, avec un MJ et
des joueurs qui peuvent reprendre une session persistante.

## Definition du MVP

Le MVP est atteint quand :

- le MJ ouvre une session persistante ;
- les joueurs rejoignent via un lien ou capability de session ;
- chaque joueur conserve son role et son personnage courant au reload ;
- la fiche lit un personnage reel depuis la DB/API ;
- le fil session/forum accepte posts, jets, decisions MJ et rollback ;
- le combat utilise des participants reels de session, pas un roster de demo ;
- les degats, statuts minimum et changements de fiche sont persistants ;
- le journal de session reste la source de verite et survit au reload ;
- une session reste continuable apres rollback ;
- les gates `pnpm validate` et E2E multi-client MVP sont verts.

## Hors MVP

Ces sujets restent importants, mais ne bloquent pas v0.4 RC :

- MJ LLM vivant complet ;
- CMS de gouvernance avance ;
- couverture canonique exhaustive de tous les `partial` non critiques ;
- magie structuree 324/324 ;
- bestiaire/lore/RAG E0.5 complet ;
- tous les statuts et cas avances R-9.27 ;
- design final de toutes les surfaces hors parcours jouable.

## Route d'execution

1. Stabiliser les gates : corriger la projection session/rollback (#244).
2. Verrouiller le cut v0.4 RC et ses checks (#243).
3. Livrer identite de session et personnage courant (#245).
4. Rendre session/forum jouable par acteur (#247).
5. Brancher le combat sur roster, loadout, journal et fiche (#246).
6. Assembler le cockpit MJ minimum (#248).
7. Faire passer `pnpm validate` et un E2E multi-client de release.

## Regle de priorisation

Un item entre dans v0.4 RC seulement s'il contribue directement a une table
reseau jouable : rejoindre, jouer, arbitrer, combattre, persister, recharger.
Le reste part en v0.5/v0.6 ou V2, meme si le moteur canonique sous-jacent est
deja avance.
