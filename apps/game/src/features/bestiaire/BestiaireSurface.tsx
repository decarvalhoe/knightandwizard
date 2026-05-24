'use client';

import { useMemo, useState } from 'react';

import { Badge, Button, Card, Label, Seal, StatBlock, type BadgeTone } from '@knightandwizard/ui';

import type { BestiaryEntryView, BestiarySurfaceView } from './model';

interface BestiaireSurfaceProps {
  view: BestiarySurfaceView;
}

export function BestiaireSurface({ view }: Readonly<BestiaireSurfaceProps>) {
  const [night, setNight] = useState(false);
  const [selectedId, setSelectedId] = useState(view.entries[0]?.id ?? '');

  const selected = useMemo(
    () => view.entries.find((entry) => entry.id === selectedId) ?? view.entries[0],
    [selectedId, view.entries]
  );

  return (
    <div className="kw-bestiary-page">
      <div className="kw-bestiary-page__header">
        <div>
          <Label>Surface 12 · Bestiaire</Label>
          <h1>Cabinet du naturaliste</h1>
          <p>Fiches especes chargees depuis le catalogue canonique bestiaire.yaml.</p>
        </div>
        <Button variant="secondary" onClick={() => setNight((current) => !current)}>
          Mode : {night ? 'Veillee (nuit)' : 'Jour'}
        </Button>
      </div>

      <section
        className="kw-bestiary"
        data-skin="armorial"
        data-theme={night ? 'night' : undefined}
      >
        <Card className="kw-bestiary__hero">
          <div>
            <Label>Armorial · especes et peuples</Label>
            <h2>Registre illustre des formes vivantes et persistantes</h2>
            <p>
              Chaque fiche conserve les bases mecaniques du catalogue: taille, esperance de vie,
              categorie XP, facteurs, maxima d&apos;aptitudes et traits listes.
            </p>
            <div className="kw-bestiary__badge-row">
              <Badge tone="info">Skin armorial</Badge>
              <Badge tone="neutral">API catalogues</Badge>
              {view.sourceFiles.map((source) => (
                <Badge key={source.path} tone="neutral">
                  {source.path}
                </Badge>
              ))}
            </div>
          </div>
          <Seal>{view.metrics.activeEntries} fiches</Seal>
        </Card>

        <div className="kw-bestiary__overview">
          <Card>
            <StatBlock
              title="Etat du catalogue"
              items={[
                { label: 'Fiches actives', value: view.metrics.activeEntries },
                { label: 'Races jouables', value: view.metrics.playableEntries },
                { label: 'Creatures MJ', value: view.metrics.nonPlayableEntries },
                { label: 'Categories', value: view.metrics.categories }
              ]}
            />
          </Card>

          <Card>
            <Label>Rayonnages</Label>
            <div className="kw-bestiary__category-grid">
              {view.categorySummaries.map((summary) => (
                <div className="kw-bestiary__category-row" key={summary.category}>
                  <span>{summary.category}</span>
                  <Badge tone="neutral">{summary.count}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="kw-bestiary__layout">
          <Card>
            <div className="kw-bestiary__panel-head">
              <div>
                <Label>Index des especes</Label>
                <h2>{view.metrics.activeEntries} fiches actives</h2>
              </div>
            </div>
            <div className="kw-bestiary__species-list" aria-label="Fiches du bestiaire">
              {view.entries.map((entry) => (
                <Button
                  aria-pressed={entry.id === selected?.id}
                  className="kw-bestiary__species-button"
                  key={entry.id}
                  onClick={() => setSelectedId(entry.id)}
                  variant={entry.id === selected?.id ? 'primary' : 'secondary'}
                >
                  <span className="kw-bestiary__species-name">{entry.name}</span>
                  <span className="kw-bestiary__species-meta">
                    {entry.category} · {entry.playableLabel}
                  </span>
                </Button>
              ))}
            </div>
          </Card>

          <BestiaryDetail entry={selected} />
        </div>
      </section>
    </div>
  );
}

function BestiaryDetail({ entry }: Readonly<{ entry: BestiaryEntryView | undefined }>) {
  if (!entry) {
    return (
      <Card>
        <Label>Fiche espece</Label>
        <p className="kw-bestiary__muted">Aucune entree active dans le catalogue.</p>
      </Card>
    );
  }

  return (
    <Card className="kw-bestiary__detail">
      <div className="kw-bestiary__panel-head">
        <div>
          <Label>Fiche espece</Label>
          <h2>{entry.name}</h2>
          <p>Nom source: {entry.sourceName}</p>
        </div>
        <Badge tone={playableTone(entry)}>{entry.playableLabel}</Badge>
      </div>

      <p className="kw-bestiary__lore">
        {entry.lore ?? 'Description non renseignee dans le catalogue.'}
      </p>

      <div className="kw-bestiary__detail-grid">
        <StatBlock
          title="Morphologie"
          items={[
            { label: 'Categorie', value: entry.category },
            { label: 'Taille', value: entry.sizeLabel },
            { label: 'Esperance', value: entry.lifeExpectancyLabel },
            { label: 'Langage', value: entry.languageLabel }
          ]}
        />
        <StatBlock
          title="Bases"
          items={[
            { label: 'XP', value: entry.xpCategory },
            { label: 'Vitalite', value: entry.vitalityBase },
            { label: 'F. Vitesse', value: entry.speedFactor },
            { label: 'F. Volonte', value: entry.willFactor }
          ]}
        />
      </div>

      <StatBlock title="Maxima d'aptitudes" items={entry.attributeMaxItems} />

      <div className="kw-bestiary__trait-grid">
        <TraitList label="Habitats" values={entry.habitat} />
        <TraitList label="Atouts innes" values={entry.innateAtouts} />
        <TraitList label="Handicaps innes" values={entry.innateHandicaps} />
        <TraitList label="Resistances" values={entry.resistanceLabels} />
        <TraitList
          label="Structure sociale"
          values={entry.socialStructure ? [entry.socialStructure] : []}
        />
      </div>
    </Card>
  );
}

function TraitList({ label, values }: Readonly<{ label: string; values: string[] }>) {
  return (
    <div className="kw-bestiary__trait-list">
      <Label>{label}</Label>
      {values.length > 0 ? (
        <div className="kw-bestiary__badge-row">
          {values.map((value) => (
            <Badge key={value} tone="neutral">
              {value}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="kw-bestiary__muted">Non renseigne</span>
      )}
    </div>
  );
}

function playableTone(entry: BestiaryEntryView): BadgeTone {
  return entry.playable ? 'success' : 'info';
}
