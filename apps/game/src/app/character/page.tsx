import { BadgeCheck, BookOpen, ScrollText } from 'lucide-react';

const rows = [
  ['Race', 'Humain'],
  ['Orientation', 'Guerrier'],
  ['Classe', 'Chevalier'],
  ['Progression', 'Niveau 1']
];

export default function CharacterPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-md border border-ink/10 bg-white/72 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <BadgeCheck aria-hidden="true" className="size-5 text-wine" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-wine">
              Personnage
            </p>
            <h1 className="text-3xl font-semibold text-ink">Aveline de Brumeval</h1>
          </div>
        </div>
        <dl className="mt-6 grid gap-3">
          {rows.map(([label, value]) => (
            <div
              className="flex items-center justify-between rounded-md bg-vellum/70 p-3"
              key={label}
            >
              <dt className="text-sm font-medium text-ink/58">{label}</dt>
              <dd className="font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid gap-4">
        <article className="rounded-md border border-ink/10 bg-white/72 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <ScrollText aria-hidden="true" className="size-5 text-forest" />
            <h2 className="text-xl font-semibold text-ink">Attributs</h2>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              'Force 4',
              'Dextérité 3',
              'Vigueur 4',
              'Réflexes 3',
              'Perception 2',
              'Intelligence 2'
            ].map((item) => (
              <div className="rounded-md bg-paper p-3 text-sm font-medium text-ink" key={item}>
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-md border border-ink/10 bg-white/72 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <BookOpen aria-hidden="true" className="size-5 text-gold" />
            <h2 className="text-xl font-semibold text-ink">Compétences principales</h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Armes longues', 'Bouclier', 'Commandement', 'Endurance'].map((skill) => (
              <span
                className="rounded-md bg-forest px-3 py-2 text-sm font-medium text-paper"
                key={skill}
              >
                {skill}
              </span>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
