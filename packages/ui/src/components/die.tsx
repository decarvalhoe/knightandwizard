export type DieKind = 'success' | 'critical' | 'one' | 'plain';

/**
 * Dé K&W — signature dé/destin du MOTEUR (présente quel que soit le skin) :
 * success = encre pleine · critical = accent · one = « 1 » rouge italique.
 */
export function Die({ value, kind = 'plain' }: { value: number; kind?: DieKind }) {
  return (
    <span className={`kw-die kw-die--${kind}`} aria-label={`dé ${value} (${kind})`}>
      {value}
    </span>
  );
}
