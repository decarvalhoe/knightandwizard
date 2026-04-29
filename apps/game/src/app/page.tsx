import { ShieldCheck, Sparkles, Swords } from 'lucide-react';

import { StatusPill } from '@/components/status-pill';
import { getApiHealth } from '@/lib/api';
import { getAuthConfig } from '@/lib/auth';
import { rulesPreview } from '@/lib/rules-preview';

export const dynamic = 'force-dynamic';

const dashboardCards = [
  {
    label: 'Personnage',
    value: '1 PJ',
    detail: 'Fiche interactive prête à brancher',
    icon: ShieldCheck
  },
  {
    label: 'Combat',
    value: 'DT',
    detail: 'Timeline moteur disponible',
    icon: Swords
  },
  {
    label: 'Session',
    value: 'Journal',
    detail: 'Flux événements à venir',
    icon: Sparkles
  }
];

export default async function DashboardPage() {
  const [apiStatus, authConfig] = await Promise.all([getApiHealth(), getAuthConfig()]);

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 rounded-md border border-ink/10 bg-white/72 p-5 shadow-sm md:grid-cols-[1.4fr_0.9fr] md:p-6">
        <div className="grid gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-forest">
              Tableau de bord
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold text-ink md:text-5xl">
              Poste de table pour piloter personnages, combats et sessions K&W.
            </h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {dashboardCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  className="rounded-md border border-ink/10 bg-paper/80 p-4 shadow-sm"
                  key={card.label}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-ink/70">{card.label}</span>
                    <Icon aria-hidden="true" className="size-4 text-wine" />
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-ink">{card.value}</p>
                  <p className="mt-1 text-sm text-ink/64">{card.detail}</p>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="grid content-start gap-3 rounded-md border border-forest/15 bg-forest p-4 text-paper">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-paper/72">API backend</p>
            <StatusPill state={apiStatus.state} />
          </div>
          <p className="text-2xl font-semibold">{apiStatus.label}</p>
          <p className="text-sm leading-6 text-paper/74">{apiStatus.message}</p>
          <dl className="grid gap-2 border-t border-paper/15 pt-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-paper/60">Base URL</dt>
              <dd className="truncate font-mono text-paper">{apiStatus.baseUrl}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-paper/60">Auth</dt>
              <dd className="font-medium text-paper">{authConfig.providerLabel}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-md border border-ink/10 bg-white/72 p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-wine">Rules Core</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Jet de référence</h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-md bg-vellum/70 p-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink/55">Pool</p>
              <p className="mt-1 text-xl font-semibold">{rulesPreview.pool}</p>
            </div>
            <div className="rounded-md bg-vellum/70 p-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink/55">
                Difficulté
              </p>
              <p className="mt-1 text-xl font-semibold">{rulesPreview.difficulty}</p>
            </div>
            <div className="rounded-md bg-vellum/70 p-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink/55">Succès</p>
              <p className="mt-1 text-xl font-semibold">{rulesPreview.successes}</p>
            </div>
          </div>
          <p className="mt-4 font-mono text-sm text-ink/64">[{rulesPreview.rolls.join(', ')}]</p>
        </article>

        <article className="rounded-md border border-ink/10 bg-white/72 p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-forest">
            Payload Auth
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Configuration session</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="rounded-md bg-vellum/70 p-3">
              <dt className="font-medium text-ink/55">Endpoint utilisateur</dt>
              <dd className="mt-1 break-all font-mono text-ink">{authConfig.meEndpoint}</dd>
            </div>
            <div className="rounded-md bg-vellum/70 p-3">
              <dt className="font-medium text-ink/55">Login</dt>
              <dd className="mt-1 break-all font-mono text-ink">{authConfig.loginUrl}</dd>
            </div>
          </dl>
        </article>
      </section>
    </div>
  );
}
