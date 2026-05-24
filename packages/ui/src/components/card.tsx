import type { HTMLAttributes } from 'react';

/** Carte K&W — surface + bordure + ombre dure décalée (var tokens). */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={['kw-card', className].filter(Boolean).join(' ')} {...props} />;
}
