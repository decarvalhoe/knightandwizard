export const ARBITER_PRECEDENCE = ['human_gm', 'player', 'llm', 'auto'] as const;

export type Arbiter = (typeof ARBITER_PRECEDENCE)[number];

const AUTHORITY_SCORE = new Map<Arbiter, number>(
  ARBITER_PRECEDENCE.map((arbiter, index) => [arbiter, ARBITER_PRECEDENCE.length - index])
);

export function compareArbiterAuthority(left: Arbiter, right: Arbiter): number {
  return authorityScore(left) - authorityScore(right);
}

export function hasArbiterAuthorityOver(left: Arbiter, right: Arbiter): boolean {
  return compareArbiterAuthority(left, right) > 0;
}

function authorityScore(arbiter: Arbiter): number {
  const score = AUTHORITY_SCORE.get(arbiter);
  if (score === undefined) {
    throw new Error(`Unknown arbiter: ${arbiter}`);
  }
  return score;
}
