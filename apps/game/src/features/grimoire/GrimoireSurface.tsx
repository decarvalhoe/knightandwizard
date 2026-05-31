'use client';

import { useMemo, useState, type CSSProperties } from 'react';

import { Badge, Button, Card, Field, Label, StatBlock } from '@knightandwizard/ui';

import type { GrimoireReadModel, GrimoireSpellView } from './read-models';

export function GrimoireSurface({ view }: Readonly<{ view: GrimoireReadModel }>) {
  const [query, setQuery] = useState('');
  const [schoolId, setSchoolId] = useState<string>('all');
  const filteredSpells = useMemo(
    () => filterSpells(view.spells, query, schoolId, 18),
    [query, schoolId, view.spells]
  );
  const selectedSchool =
    schoolId === 'all' ? undefined : view.schoolSummaries.find((school) => school.id === schoolId);

  return (
    <div className="kw-grimoire-page">
      <Card>
        <Label>Grimoire</Label>
        <h1>Grand Grimoire</h1>
        <p>
          Index consultable des sorts canoniques, classés par école et reliés au lexique quand une
          définition papier existe.
        </p>
        <div className="kw-grimoire__badge-row">
          <Badge tone="info">Skin grimoire</Badge>
          {view.sourceLabels.map((source) => (
            <Badge key={source} tone="neutral">
              {source}
            </Badge>
          ))}
        </div>
      </Card>

      <div className="kw-grimoire__overview">
        <Card>
          <StatBlock
            title="Index magique"
            items={[
              { label: 'Sorts', value: view.metrics.spells },
              { label: 'Écoles', value: view.metrics.schools },
              { label: 'Liés au lexique', value: view.metrics.lexiqueLinkedSpells }
            ]}
          />
        </Card>
        <Card>
          <Label>Filtrer</Label>
          <Field
            id="grimoire-search"
            label="Recherche"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Barrière, énergie, illusion..."
            type="search"
            value={query}
          />
        </Card>
      </div>

      <section className="kw-grimoire__schools" aria-label="Écoles de magie">
        <Button
          aria-pressed={schoolId === 'all'}
          onClick={() => setSchoolId('all')}
          variant={schoolId === 'all' ? 'primary' : 'secondary'}
        >
          Toutes les écoles
        </Button>
        {view.schoolSummaries.map((school) => (
          <Button
            aria-pressed={schoolId === school.id}
            className="kw-grimoire__school-button"
            key={school.id}
            onClick={() => setSchoolId(school.id)}
            variant={schoolId === school.id ? 'primary' : 'secondary'}
          >
            <span
              aria-hidden="true"
              className="kw-swatch"
              style={
                {
                  '--swatch-color': `var(--school-${schoolTokenId(school.id)}, var(--color-accent))`
                } as CSSProperties
              }
            />
            <span>{school.name}</span>
            <Badge tone="neutral">{school.spellCount}</Badge>
          </Button>
        ))}
      </section>

      <div className="kw-grimoire__layout">
        <Card>
          <div className="kw-grimoire__panel-head">
            <div>
              <Label>Résultats</Label>
              <h2>{filteredSpells.length} sorts affichés</h2>
            </div>
            {selectedSchool ? <Badge tone="info">{selectedSchool.name}</Badge> : null}
          </div>
          <div className="kw-grimoire__spell-list" aria-label="Sorts filtrés">
            {filteredSpells.length > 0 ? (
              filteredSpells.map((spell) => <SpellCard key={spell.id} spell={spell} />)
            ) : (
              <p>Aucun sort trouvé.</p>
            )}
          </div>
        </Card>

        <Card>
          <Label>Écoles</Label>
          <div className="kw-grimoire__school-list">
            {view.schoolSummaries.map((school) => (
              <article className="kw-grimoire__school-card" key={school.id}>
                <div className="kw-grimoire__school-card-head">
                  <strong>{school.name}</strong>
                  <Badge tone="neutral">{school.color}</Badge>
                </div>
                <p>{school.domain}</p>
              </article>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SpellCard({ spell }: Readonly<{ spell: GrimoireSpellView }>) {
  return (
    <article className="kw-grimoire__spell-card">
      <div className="kw-grimoire__spell-head">
        <div>
          <h3>{spell.name}</h3>
          <p>{spell.effect}</p>
        </div>
        <Badge tone={spell.isLexiqueLinked ? 'success' : 'neutral'}>
          {spell.isLexiqueLinked ? 'Lexique relié' : 'Notice courte'}
        </Badge>
      </div>
      <div className="kw-grimoire__spell-meta">
        <Badge tone="info">{spell.schoolName}</Badge>
        <span>Énergie {formatNullableNumber(spell.energy)}</span>
        <span>Incantation {formatNullableNumber(spell.incantationTime)} DT</span>
        <span>Difficulté {formatNullableNumber(spell.difficulty)}</span>
      </div>
    </article>
  );
}

function filterSpells(
  spells: GrimoireSpellView[],
  query: string,
  schoolId: string,
  limit: number
): GrimoireSpellView[] {
  const normalizedQuery = normalizeSearchText(query);

  return spells
    .filter((spell) => schoolId === 'all' || spell.schoolId === schoolId)
    .filter((spell) => {
      if (!normalizedQuery) return true;

      return normalizeSearchText(`${spell.name} ${spell.effect} ${spell.schoolName}`).includes(
        normalizedQuery
      );
    })
    .slice(0, limit);
}

function formatNullableNumber(value: number | null): string {
  return value === null ? 'non renseignée' : new Intl.NumberFormat('fr-FR').format(value);
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function schoolTokenId(schoolId: string): string {
  const tokenIds: Record<string, string> = {
    'magie-blanche': 'blanche',
    'magie-naturelle': 'naturelle',
    'magie-noire': 'noire'
  };

  return tokenIds[schoolId] ?? schoolId;
}
