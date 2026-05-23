import type { HTMLAttributes } from 'react';

export type BadgeTone = 'neutral' | 'success' | 'warn' | 'danger' | 'info';
export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone };

/** Badge / pastille de statut — couleur de feedback via tokens. */
export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  const cls = ['kw-badge', `kw-badge--${tone}`, className].filter(Boolean).join(' ');
  return <span className={cls} {...props} />;
}
