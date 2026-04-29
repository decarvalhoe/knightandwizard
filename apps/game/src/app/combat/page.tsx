import { Hourglass, Swords } from 'lucide-react';

const turns = [
  { actor: 'Aveline', dt: 0, intent: 'Attaque gardée' },
  { actor: 'Brigand', dt: 2, intent: 'Recul tactique' },
  { actor: 'Mire', dt: 5, intent: 'Sort de soutien' }
];

export default function CombatPage() {
  return (
    <div className="grid gap-6">
      <section className="rounded-md border border-ink/10 bg-white/72 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Swords aria-hidden="true" className="size-5 text-wine" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-wine">Combat</p>
              <h1 className="text-3xl font-semibold text-ink">Tracker DT</h1>
            </div>
          </div>
          <span className="rounded-md bg-forest px-3 py-2 text-sm font-semibold text-paper">
            Round actif
          </span>
        </div>
      </section>

      <section className="grid gap-3">
        {turns.map((turn) => (
          <article
            className="grid gap-3 rounded-md border border-ink/10 bg-white/72 p-4 shadow-sm sm:grid-cols-[5rem_1fr_auto]"
            key={turn.actor}
          >
            <div className="flex items-center gap-2 font-mono text-xl font-semibold text-wine">
              <Hourglass aria-hidden="true" className="size-4" />
              DT {turn.dt}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">{turn.actor}</h2>
              <p className="text-sm text-ink/64">{turn.intent}</p>
            </div>
            <span className="self-start rounded-md bg-vellum px-3 py-2 text-sm font-medium text-ink">
              file active
            </span>
          </article>
        ))}
      </section>
    </div>
  );
}
