# Contrat tool calling MJ automatise

Ce contrat ferme l'invariant K&W: le LLM ne calcule jamais les jets, degats, DT, XP ou effets mecaniques. Il produit des intentions, questions et textes narratifs; toute resolution mecanique passe par un outil type connecte a `rules-core` ou a un read model canonique.

## Surface d'outils

La surface versionnee vit dans `apps/server/src/llm/rules-tools.ts` et expose les outils Mastra suivants:

- `rollDice`: resout un jet D10 via `rules-core.rollDice`.
- `applyDamage`: applique degats ou soins a un `CombatState`.
- `resolveAttack`: resout attaque, defense optionnelle, cout DT et degats via la timeline combat.
- `getCharacterStatus`: retourne l'etat mecanique d'un combattant.
- `advanceCombatTimeline`: avance la timeline DT avec `resolveNextAction`.
- `lookupRule`: recupere un contexte RAG cite pour les regles.
- `lookupBestiary`: lit le bestiaire canonique YAML.
- `decideNpcAction`: applique le contrat multi-arbitre PNJ `human_gm / player / llm / auto`.

Chaque outil a un schema Zod d'entree et une entree dans les maps TypeScript `GameMasterRuleToolInputMap` et `GameMasterRuleToolResultMap`. Le runtime MJ consomme `GameMasterRuleTools`, pas des fonctions libres sans contrat.

## Structured outputs

Tous les outils retournent une enveloppe discriminante:

```ts
type RuleToolResult<T> = T | { status: 'error'; message: string };

interface RollDiceToolResult {
  status: 'ok';
  pool: number;
  difficulty: number;
  rolls: number[];
  successes: number;
  total: number;
  isCriticalSuccess: boolean;
  isCriticalFailure: boolean;
  criticalFailureSeverity?: number;
  reason?: string;
}
```

Les sorties `status: 'ok'` portent les donnees rules-core deja calculees. Les sorties `status: 'error'` sont visibles par le runtime et recoverables: le MJ ne doit pas narrer une resolution mecanique inventee, il signale l'erreur outil et attend une entree corrigee ou une decision humaine. Les erreurs de pre-validation Mastra sont normalisees par `normalizeRuleToolResult` avant d'entrer dans `toolCalls`.

## Regles d'orchestration

- Le LLM peut choisir quel outil appeler, mais ne remplace jamais le calcul du noyau deterministe.
- Les jets de des, degats, critiques, DT et decisions PNJ automatisees doivent apparaitre dans `toolCalls` avec leur entree et leur sortie structuree.
- Un echec de validation Zod ou une erreur `rules-core` reste un resultat outil `status: 'error'`, pas une exception opaque pour l'agent.
- Le texte final peut expliquer ou dramatiser un resultat `status: 'ok'`, mais il ne modifie pas les nombres retournes.
- Quand `lookupRule` est utilise, les citations RAG gardent `sourcePath`, `heading`, `citation` et `score`; le RAG explique, il ne remplace pas les catalogues ni `rules-core`.

## Couverture attendue

Les tests serveur doivent prouver au minimum:

- la surface complete des outils Mastra et leurs schemas Zod;
- les jets de des et degats executes via les outils, jamais recalcules dans le runtime narratif;
- la presence des sorties `status: 'ok'` sur les resolutions valides;
- la recuperation visible des sorties `status: 'error'` pour les entrees invalides et les entites de combat absentes.
