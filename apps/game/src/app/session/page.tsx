import { CalendarClock, ListChecks } from 'lucide-react';

const events = [
  ['21:04', 'La compagnie entre dans Brumeval.'],
  ['21:11', 'Aveline interroge le guetteur.'],
  ['21:18', 'Combat ouvert contre les brigands.']
];

export default function SessionPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-md border border-ink/10 bg-white/72 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <CalendarClock aria-hidden="true" className="size-5 text-forest" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-forest">Session</p>
            <h1 className="text-3xl font-semibold text-ink">Brumeval</h1>
          </div>
        </div>
        <dl className="mt-6 grid gap-3 text-sm">
          <div className="rounded-md bg-vellum/70 p-3">
            <dt className="font-medium text-ink/55">Mode</dt>
            <dd className="mt-1 font-semibold text-ink">Asynchrone</dd>
          </div>
          <div className="rounded-md bg-vellum/70 p-3">
            <dt className="font-medium text-ink/55">MJ</dt>
            <dd className="mt-1 font-semibold text-ink">Humain</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-md border border-ink/10 bg-white/72 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <ListChecks aria-hidden="true" className="size-5 text-wine" />
          <h2 className="text-xl font-semibold text-ink">Journal</h2>
        </div>
        <ol className="mt-5 grid gap-3">
          {events.map(([time, event]) => (
            <li className="grid grid-cols-[4rem_1fr] gap-3 rounded-md bg-paper p-3" key={time}>
              <time className="font-mono text-sm font-semibold text-wine">{time}</time>
              <span className="text-sm text-ink">{event}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
