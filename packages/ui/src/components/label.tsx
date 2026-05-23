import type { HTMLAttributes } from 'react';

/** Sur-titre / eyebrow — typo label (uppercase, tracking) via tokens. */
export function Label({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={['kw-label', className].filter(Boolean).join(' ')} {...props} />;
}
