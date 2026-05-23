import type { ReactNode } from 'react';

export type StatItem = { label: string; value: ReactNode };

/** Bloc de stats — grille libellé/valeur (aptitudes, attributs de sort, etc.). */
export function StatBlock({ title, items }: { title?: string; items: StatItem[] }) {
  return (
    <div className="kw-statblock">
      {title ? <div className="kw-statblock__title">{title}</div> : null}
      <div className="kw-statblock__grid">
        {items.map((item) => (
          <div key={item.label} className="kw-statblock__item">
            <span className="kw-statblock__label">{item.label}</span>
            <span className="kw-statblock__value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
