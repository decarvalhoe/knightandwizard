'use client';

import { useMemo, useState, type CSSProperties } from 'react';

import { Badge, Button, Card, Field, Label, Seal, StatBlock } from '@knightandwizard/ui';
import type { BadgeTone } from '@knightandwizard/ui';

import type {
  AtoutActivation,
  AtoutScope,
  AtoutSummary,
  AtoutsCompanionView,
  BreakdownItem,
  CatalogStatus
} from './read-models';

const COMPANION_IDENTITY = {
  name: 'Aveline de Brumeval',
  role: 'Compagnonne eclaireuse',
  seal: 'S12'
} as const;

export function AtoutsCompanionSurface({ view }: Readonly<{ view: AtoutsCompanionView }>) {
  const [night, setNight] = useState(false);
  const [atoutSearch, setAtoutSearch] = useState('');
  const filteredAtouts = useMemo(
    () => filterAtouts(view.browseAtouts, atoutSearch, 12),
    [atoutSearch, view.browseAtouts]
  );

  const catalogStats = [
    { label: 'Atouts', value: formatNumber(view.stats.atoutTotal) },
    { label: 'Actifs', value: formatNumber(view.stats.activeAtouts) },
    { label: 'Compétences', value: formatNumber(view.stats.skillTotal) },
    { label: 'Familles', value: formatNumber(view.stats.families) }
  ];

  return (
    <div className="kw-atouts-page">
      <Card className="kw-atouts-page__header">
        <div>
          <Label>Atouts &amp; competences</Label>
          <h1>Carnet de compagnon</h1>
        </div>
        <Button
          aria-pressed={night}
          onClick={() => setNight((current) => !current)}
          variant="secondary"
        >
          Mode : {night ? 'Veillée' : 'Jour'}
        </Button>
      </Card>

      <div
        className="kw-atouts-surface"
        data-skin="armorial"
        data-theme={night ? 'night' : undefined}
      >
        <section className="kw-atouts-hero" aria-labelledby="atouts-title">
          <div className="kw-atouts-hero__copy">
            <Label>Carnet armorial · sources canoniques chargees</Label>
            <h2 id="atouts-title">{COMPANION_IDENTITY.name}</h2>
            <p>
              {COMPANION_IDENTITY.role}. Cette surface lit les catalogues atouts.yaml et
              competences.yaml sans rejouer les regles de creation de personnage.
            </p>
            <div className="kw-atouts-badge-row">
              <Badge tone="info">Surface 12</Badge>
              <Badge tone="info">Skin armorial</Badge>
              <Badge tone="neutral">{view.sourceLabels.atouts}</Badge>
              <Badge tone="neutral">{view.sourceLabels.skills}</Badge>
            </div>
          </div>
          <Seal>{COMPANION_IDENTITY.seal}</Seal>
        </section>

        <Card>
          <StatBlock title="Index du carnet" items={catalogStats} />
        </Card>

        <div className="kw-atouts-layout">
          <section className="kw-atouts-stack" aria-label="Atouts suivis">
            <Card>
              <div className="kw-atouts-section-head">
                <div>
                  <Label>Répertoire</Label>
                  <h2>Recherche d&apos;atouts</h2>
                </div>
                <Badge tone="info">{formatNumber(view.browseAtouts.length)} actifs</Badge>
              </div>
              <Field
                id="atouts-search"
                label="Rechercher"
                onChange={(event) => setAtoutSearch(event.target.value)}
                placeholder="Adrénaline, ambidextrie, race..."
                type="search"
                value={atoutSearch}
              />
              <div className="kw-atouts-catalog-list" aria-label="Atouts filtrés">
                {filteredAtouts.length > 0 ? (
                  filteredAtouts.map((atout) => <AtoutEntry atout={atout} key={atout.id} />)
                ) : (
                  <p>Aucun atout trouvé.</p>
                )}
              </div>
            </Card>

            <Card>
              <div className="kw-atouts-section-head">
                <div>
                  <Label>Atouts en vue</Label>
                  <h2>Privilèges, handicaps et dons</h2>
                </div>
                <Badge tone="success">{formatNumber(view.stats.permanentAtouts)} permanents</Badge>
              </div>
              <div className="kw-atouts-entry-list">
                {view.highlightAtouts.map((atout) => (
                  <AtoutEntry key={atout.id} atout={atout} />
                ))}
              </div>
            </Card>

            <Card>
              <div className="kw-atouts-section-head">
                <div>
                  <Label>Compétences pivots</Label>
                  <h2>Repères de feuille</h2>
                </div>
                <Badge tone="info">{formatNumber(view.stats.skillTotal)} entrées</Badge>
              </div>
              <div className="kw-atouts-skill-grid">
                {view.focusSkills.map((skill) => (
                  <div className="kw-atouts-skill" key={skill.id}>
                    <strong>{skill.name}</strong>
                    <span>{skill.familyLabel}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <aside className="kw-atouts-stack" aria-label="Repartition des catalogues">
            <Card>
              <Label>Activation</Label>
              <div className="kw-atouts-meter-list">
                {view.activationBreakdown.map((item) => (
                  <BreakdownMeter item={item} key={item.key} />
                ))}
              </div>
            </Card>

            <Card>
              <Label>Scopes</Label>
              <div className="kw-atouts-meter-list">
                {view.scopeBreakdown.slice(0, 5).map((item) => (
                  <BreakdownMeter item={item} key={item.key} />
                ))}
              </div>
            </Card>

            <Card>
              <Label>Familles de competences</Label>
              <div className="kw-atouts-family-list">
                {view.skillFamilies.map((family) => (
                  <div className="kw-atouts-family" key={family.family}>
                    <span>{family.label}</span>
                    <strong>{formatNumber(family.total)}</strong>
                  </div>
                ))}
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function AtoutEntry({ atout }: Readonly<{ atout: AtoutSummary }>) {
  return (
    <article className="kw-atouts-entry">
      <div className="kw-atouts-entry__head">
        <h3>{atout.name}</h3>
        <Badge tone={activationTone(atout.activation)}>{activationLabel(atout.activation)}</Badge>
      </div>
      <p>{atout.effect}</p>
      <div className="kw-atouts-badge-row">
        <Badge tone={scopeTone(atout.scope)}>{scopeLabel(atout.scope)}</Badge>
        <Badge tone={statusTone(atout.status)}>{statusLabel(atout.status)}</Badge>
        <Badge tone={atout.value !== null && atout.value < 0 ? 'danger' : 'neutral'}>
          Valeur {formatAtoutValue(atout.value)}
        </Badge>
      </div>
    </article>
  );
}

function BreakdownMeter({ item }: Readonly<{ item: BreakdownItem }>) {
  return (
    <div className="kw-atouts-meter">
      <span>{item.label}</span>
      <div aria-hidden="true" className="kw-atouts-meter__track">
        <div
          className="kw-atouts-meter__fill"
          style={{ '--meter-value': `${item.percent}%` } as CSSProperties}
        />
      </div>
      <strong>{formatNumber(item.count)}</strong>
    </div>
  );
}

function filterAtouts(atouts: AtoutSummary[], query: string, limit: number): AtoutSummary[] {
  const normalizedQuery = normalizeSearchText(query);
  const source = normalizedQuery
    ? atouts.filter((atout) =>
        normalizeSearchText(`${atout.name} ${atout.effect} ${scopeLabel(atout.scope)}`).includes(
          normalizedQuery
        )
      )
    : atouts;

  return source.slice(0, limit);
}

function activationTone(activation: AtoutActivation): BadgeTone {
  if (activation === 'ephemere') return 'warn';
  if (activation === 'permanent') return 'success';
  return 'neutral';
}

function scopeTone(scope: AtoutScope): BadgeTone {
  if (scope === 'race') return 'info';
  if (scope === 'niveau') return 'success';
  if (scope === 'classe' || scope === 'orientation') return 'warn';
  return 'neutral';
}

function statusTone(status: CatalogStatus): BadgeTone {
  if (status === 'active') return 'success';
  if (status === 'ambiguous') return 'warn';
  if (status === 'deprecated') return 'danger';
  return 'neutral';
}

function activationLabel(activation: AtoutActivation): string {
  const labels: Record<string, string> = {
    ephemere: 'Ephemere',
    permanent: 'Permanent',
    unknown: 'Activation inconnue'
  };

  return labels[activation] ?? activation;
}

function scopeLabel(scope: AtoutScope): string {
  const labels: Record<string, string> = {
    classe: 'Classe',
    niveau: 'Niveau',
    neutre: 'Neutre',
    orientation: 'Orientation',
    race: 'Race'
  };

  return labels[scope] ?? scope;
}

function statusLabel(status: CatalogStatus): string {
  const labels: Record<string, string> = {
    active: 'Actif',
    ambiguous: 'Ambigu',
    deprecated: 'Deprecie',
    raw_reference_only: 'Reference brute'
  };

  return labels[status] ?? status;
}

function formatAtoutValue(value: number | null): string {
  return value === null ? 'non renseignee' : formatNumber(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value);
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
