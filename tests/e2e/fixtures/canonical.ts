export type CanonicalE2ESourceRef = {
  path: `docs/rules/${string}` | `docs/product/${string}` | `data/catalogs/${string}`;
  ref: string;
};

export const canonicalE2EFixtures = {
  actors: {
    avelineDraftName: 'E2E Aveline',
    magicianDraftName: 'E2E Magicien'
  },
  scenes: {
    firstDifficultRoll: 'Aveline tente un jet de des difficile a la porte nord.',
    memoryRecall: 'Aveline repense au jet de des difficile avant de parler au guetteur.'
  },
  scenarios: {
    dashboard: {
      title: 'dashboard readiness and surface links',
      sourceRefs: [
        { path: 'docs/product/vision-assistant-mj-joueur.md', ref: 'surfaces MJ/Joueur' }
      ]
    },
    characterSheet: {
      title: 'canonical attributes, nested skills and level budget',
      sourceRefs: [
        { path: 'docs/rules/02-attributs.md', ref: 'D2 aptitudes' },
        { path: 'docs/rules/05-competences.md', ref: 'D5 competences et specialisations' },
        { path: 'docs/rules/07-progression.md', ref: 'D7 level points' }
      ]
    },
    characterCreation: {
      title: 'fighter and magician creation budgets',
      sourceRefs: [
        { path: 'docs/rules/06-creation-perso.md', ref: 'D6 budgets de creation' },
        { path: 'docs/rules/08-magie.md', ref: 'D8 points de sorts magicien' }
      ]
    },
    combatTracker: {
      title: 'combat DT action resolution',
      sourceRefs: [{ path: 'docs/rules/09-combat.md', ref: 'D9 actions DT' }]
    },
    sessionManager: {
      title: 'async session journal and GM decisions',
      sourceRefs: [
        { path: 'docs/rules/11-controle-pnj.md', ref: 'D11 controle PNJ' },
        { path: 'docs/rules/13-roles-passation.md', ref: 'D13 arbitrage et rollback' }
      ]
    },
    backendGm: {
      title: 'backend RAG, GM tools and episodic memory',
      sourceRefs: [
        { path: 'docs/product/llm-tool-calling-contract.md', ref: 'tool calling MJ' },
        { path: 'docs/product/rag-citation-evaluation-contract.md', ref: 'citations RAG' },
        { path: 'docs/product/episodic-memory-contract.md', ref: 'memoire episodique' },
        { path: 'data/catalogs/armes.yaml', ref: 'inventaire armes' },
        { path: 'data/catalogs/protections.yaml', ref: 'inventaire protections' },
        { path: 'data/catalogs/potions.yaml', ref: 'inventaire potions' }
      ]
    }
  }
} as const;

export type CanonicalE2EScenario = keyof typeof canonicalE2EFixtures.scenarios;

export function formatCanonicalSourceRefs(sourceRefs: readonly CanonicalE2ESourceRef[]): string {
  return sourceRefs.map((sourceRef) => `${sourceRef.path}#${sourceRef.ref}`).join(', ');
}
