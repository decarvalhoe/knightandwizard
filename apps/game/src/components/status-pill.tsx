import type { ApiConnectionState } from '@/lib/api';

const labels: Record<ApiConnectionState, string> = {
  offline: 'hors ligne',
  online: 'connecté'
};

export function StatusPill({ state }: Readonly<{ state: ApiConnectionState }>) {
  return (
    <span
      className={[
        'rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em]',
        state === 'online' ? 'bg-gold text-ink' : 'bg-paper/14 text-paper'
      ].join(' ')}
    >
      {labels[state]}
    </span>
  );
}
