import type { HTMLAttributes } from 'react';

/** Sceau de cire — pastille circulaire (accent secondaire), petite capitale. */
export function Seal({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={['kw-seal', className].filter(Boolean).join(' ')} {...props} />;
}
