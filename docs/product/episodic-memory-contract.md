# Contrat memoire episodique MJ

La memoire episodique retient les faits de session utiles au MJ automatise sans modifier le canon K&W. Elle complete le RAG et le journal de session; elle ne remplace pas les catalogues, les read models PostgreSQL ni `rules-core`.

## Provenance

Chaque entree `gm_memories` porte une provenance explicite:

- `session_fact`: fait observe ou acte pendant la session courante;
- `hypothesis`: hypothese, intention ou interpretation non canonique;
- `canonical_lore`: fait de lore canonique cite depuis une source enregistree.

`canonical_lore` exige une source canonique (`docs/`, `data/`, `catalog:`, `rule:` ou `source:`). La narration du MJ (`game-master`) ne peut pas creer ou modifier du lore canonique.

## Recall

Le contexte de rappel cite chaque entree sous forme `[M#]` avec provenance, type, source et importance. Les appels peuvent filtrer par provenance pour eviter de melanger hypothese et fait de session.

## Ecriture runtime

`describeSceneWithGameMaster` enregistre les scenes comme `session_fact`, source `game-master`, avec `canonicalLoreMutable: false` dans le payload. Les citations RAG peuvent etre stockees en contexte, mais elles restent des references; elles ne deviennent pas du lore canonique editable par l'agent.
