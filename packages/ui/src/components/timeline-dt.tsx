import type { ReactNode } from 'react';

export type TimelineDTItem = {
  id: string;
  dt: number;
  label: ReactNode;
  description?: ReactNode;
  current?: boolean;
  meta?: ReactNode;
};

export type TimelineDTProps = {
  items: readonly TimelineDTItem[];
  label?: string;
};

export function TimelineDT({ items, label = 'Timeline DT' }: TimelineDTProps) {
  const sortedItems = [...items].sort((left, right) => left.dt - right.dt);

  return (
    <ol aria-label={label} className="kw-timeline-dt">
      {sortedItems.map((item) => (
        <li
          className="kw-timeline-dt__item"
          data-current={item.current ? true : undefined}
          key={item.id}
        >
          <span className="kw-timeline-dt__dt">DT {item.dt}</span>
          <span className="kw-timeline-dt__content">
            <span className="kw-timeline-dt__label">{item.label}</span>
            {item.description ? (
              <span className="kw-timeline-dt__description">{item.description}</span>
            ) : null}
          </span>
          {item.meta ? <span className="kw-timeline-dt__meta">{item.meta}</span> : null}
        </li>
      ))}
    </ol>
  );
}
