import type { ReactNode } from 'react';

export type TabItem = {
  id: string;
  label: ReactNode;
  panel: ReactNode;
  disabled?: boolean;
};

export type TabsProps = {
  items: readonly TabItem[];
  activeId?: string;
  label?: string;
  onTabChange?: (id: string) => void;
};

export function Tabs({ items, activeId, label, onTabChange }: TabsProps) {
  const selectedId = activeId ?? items.find((item) => !item.disabled)?.id ?? items[0]?.id;

  return (
    <div className="kw-tabs">
      <div aria-label={label} className="kw-tabs__list" role="tablist">
        {items.map((item) => {
          const selected = item.id === selectedId;
          const eventProps = onTabChange ? { onClick: () => onTabChange(item.id) } : undefined;

          return (
            <button
              aria-controls={'kw-tab-panel-' + item.id}
              aria-selected={selected}
              className="kw-tabs__trigger"
              disabled={item.disabled}
              id={'kw-tab-' + item.id}
              key={item.id}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
              {...eventProps}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => {
        const selected = item.id === selectedId;

        return (
          <div
            aria-labelledby={'kw-tab-' + item.id}
            className="kw-tabs__panel"
            hidden={!selected}
            id={'kw-tab-panel-' + item.id}
            key={item.id}
            role="tabpanel"
            tabIndex={0}
          >
            {item.panel}
          </div>
        );
      })}
    </div>
  );
}
