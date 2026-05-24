'use client';

import { Layers, MapPinned, Moon, Shield, Sun } from 'lucide-react';
import { useMemo, useState, type CSSProperties, type KeyboardEvent } from 'react';

import { Badge, Button, Card, Label, Seal, StatBlock } from '@knightandwizard/ui';

import type { CartulaireReadModel, CartulaireRegion, Emau } from './model';

const numberFormat = new Intl.NumberFormat('fr-FR');

const emauxLabels: Record<Emau, string> = {
  azur: 'Azur',
  gueules: 'Gueules',
  or: 'Or',
  sinople: 'Sinople'
};

export function CartulaireSurface({ readModel }: Readonly<{ readModel: CartulaireReadModel }>) {
  const [night, setNight] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState(readModel.regions[0]?.id ?? '');
  const selectedRegion = useMemo(
    () =>
      readModel.regions.find((region) => region.id === selectedRegionId) ??
      readModel.regions[0] ??
      null,
    [readModel.regions, selectedRegionId]
  );

  const selectedCities = selectedRegion
    ? readModel.cities.filter((city) => city.parentRegionId === selectedRegion.id)
    : [];
  const summaryItems = [
    { label: 'Nations', value: numberFormat.format(readModel.summary.nations) },
    { label: 'Regions vectorisees', value: numberFormat.format(readModel.summary.vectorRegions) },
    { label: 'Villes', value: numberFormat.format(readModel.summary.cities) },
    {
      label: 'Population',
      value: numberFormat.format(readModel.summary.totalPopulation)
    }
  ];

  return (
    <div className="kw-cartulaire-page">
      <div className="kw-cartulaire-page__toolbar">
        <Button
          aria-pressed={night}
          className="kw-cartulaire__button"
          onClick={() => setNight((current) => !current)}
          variant="secondary"
        >
          {night ? (
            <Moon aria-hidden="true" className="kw-cartulaire__button-icon" />
          ) : (
            <Sun aria-hidden="true" className="kw-cartulaire__button-icon" />
          )}
          <span>{night ? 'Veillee' : 'Jour'}</span>
        </Button>
      </div>

      <div data-skin="armorial" data-theme={night ? 'night' : undefined} className="kw-cartulaire">
        <Card className="kw-cartulaire__hero">
          <div className="kw-cartulaire__hero-copy">
            <Label>Cartulaire royal · emaux et marches</Label>
            <h1>Terres Oubliees</h1>
            <div className="kw-cartulaire__badge-row">
              <Badge tone="info">Skin armorial</Badge>
              <Badge tone="neutral">Source nations.yaml</Badge>
              <Badge tone="neutral">GeoJSON interactive-map</Badge>
            </div>
          </div>
          <Seal>{readModel.summary.vectorRegions} cartes</Seal>
        </Card>

        <div className="kw-cartulaire__layout">
          <Card className="kw-cartulaire__map-panel">
            <div className="kw-cartulaire__panel-head">
              <div>
                <Label>Carte vectorisee</Label>
                <h2>Frontieres canoniques</h2>
              </div>
              <Badge tone="neutral">{selectedRegion?.category ?? 'region'}</Badge>
            </div>

            <svg
              aria-label="Carte interactive des nations Knight & Wizard"
              className="kw-cartulaire-map"
              role="img"
              viewBox="0 0 100 100"
            >
              <rect className="kw-cartulaire-map__paper" height="100" width="100" x="0" y="0" />
              {readModel.regions.map((region) => (
                <path
                  aria-label={region.name}
                  className="kw-cartulaire-map__region"
                  d={region.mapPath}
                  data-selected={region.id === selectedRegion?.id ? 'true' : undefined}
                  key={region.id}
                  onClick={() => setSelectedRegionId(region.id)}
                  onKeyDown={(event) => handleRegionKeyDown(event, region, setSelectedRegionId)}
                  role="button"
                  style={regionStyle(region)}
                  tabIndex={0}
                />
              ))}
              {readModel.cities.map((city) => (
                <circle
                  className="kw-cartulaire-map__city"
                  cx={city.x}
                  cy={city.y}
                  data-capital={city.role === 'capital' ? 'true' : undefined}
                  key={city.id}
                  r={city.role === 'capital' ? 0.9 : 0.55}
                />
              ))}
            </svg>
          </Card>

          <div className="kw-cartulaire__side">
            <Card>
              <StatBlock title="Couverture" items={summaryItems} />
            </Card>

            {selectedRegion ? (
              <Card className="kw-cartulaire__detail">
                <div className="kw-cartulaire__panel-head">
                  <div>
                    <Label>Notice territoriale</Label>
                    <h2>{selectedRegion.name}</h2>
                  </div>
                  <EmauxSwatches emaux={selectedRegion.emaux} />
                </div>

                <dl className="kw-cartulaire__definition-list">
                  <div>
                    <dt>Capitale</dt>
                    <dd>{selectedRegion.capital ?? 'Non renseignee'}</dd>
                  </div>
                  <div>
                    <dt>Population</dt>
                    <dd>{formatNullableNumber(selectedRegion.population)}</dd>
                  </div>
                  <div>
                    <dt>Surface</dt>
                    <dd>
                      {selectedRegion.surfaceKm2
                        ? `${numberFormat.format(selectedRegion.surfaceKm2)} km2`
                        : 'Non renseignee'}
                    </dd>
                  </div>
                  <div>
                    <dt>Villes relevees</dt>
                    <dd>{numberFormat.format(selectedCities.length)}</dd>
                  </div>
                </dl>

                {selectedRegion.blasonDescription ? (
                  <p className="kw-cartulaire__muted">{selectedRegion.blasonDescription}</p>
                ) : null}

                {selectedRegion.notableFeatures.length > 0 ? (
                  <ul className="kw-cartulaire__feature-list">
                    {selectedRegion.notableFeatures.slice(0, 3).map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                ) : null}
              </Card>
            ) : null}
          </div>
        </div>

        <Card>
          <div className="kw-cartulaire__panel-head">
            <div>
              <Label>Emaux par nation</Label>
              <h2>Armorial de consultation</h2>
            </div>
            <Layers aria-hidden="true" className="kw-cartulaire__section-icon" />
          </div>

          <div className="kw-cartulaire__nation-grid">
            {readModel.emauxByNation.map((nation) => (
              <Button
                className="kw-cartulaire__nation-button"
                key={nation.id}
                onClick={() => setSelectedRegionId(nation.id)}
                variant={nation.id === selectedRegion?.id ? 'primary' : 'secondary'}
              >
                <Shield aria-hidden="true" className="kw-cartulaire__button-icon" />
                <span className="kw-cartulaire__nation-name">{nation.name}</span>
                <EmauxSwatches emaux={nation.emaux} />
              </Button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="kw-cartulaire__panel-head">
            <div>
              <Label>Villes et points releves</Label>
              <h2>{selectedRegion?.name ?? 'Cartulaire'}</h2>
            </div>
            <MapPinned aria-hidden="true" className="kw-cartulaire__section-icon" />
          </div>

          <div className="kw-cartulaire__city-grid">
            {selectedCities.length > 0 ? (
              selectedCities.map((city) => (
                <div className="kw-cartulaire__city-row" key={city.id}>
                  <span>{city.name}</span>
                  <Badge tone={city.role === 'capital' ? 'info' : 'neutral'}>{city.role}</Badge>
                </div>
              ))
            ) : (
              <p className="kw-cartulaire__muted">Aucune ville vectorisee pour cette notice.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function EmauxSwatches({ emaux }: Readonly<{ emaux: Emau[] }>) {
  if (emaux.length === 0) {
    return <Badge tone="neutral">Sans emaux</Badge>;
  }

  return (
    <span className="kw-cartulaire__emaux-list">
      {emaux.map((emau) => (
        <span
          aria-label={emauxLabels[emau]}
          className="kw-cartulaire__emaux-swatch"
          key={emau}
          style={{ '--emaux-token': `var(--emaux-${emau})` } as CSSProperties}
          title={emauxLabels[emau]}
        />
      ))}
    </span>
  );
}

function regionStyle(region: CartulaireRegion): CSSProperties {
  return {
    '--region-emaux': region.emaux[0]
      ? `var(--emaux-${region.emaux[0]})`
      : 'var(--color-border-rule)'
  } as CSSProperties;
}

function formatNullableNumber(value: number | null): string {
  return value === null ? 'Non renseignee' : numberFormat.format(value);
}

function handleRegionKeyDown(
  event: KeyboardEvent<SVGPathElement>,
  region: CartulaireRegion,
  setSelectedRegionId: (id: string) => void
) {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return;
  }

  event.preventDefault();
  setSelectedRegionId(region.id);
}
