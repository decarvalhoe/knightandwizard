'use client';

import { useMemo, useState } from 'react';

import { ATTRIBUTE_KEYS, rollDice } from '@knightandwizard/rules-core';
import { Badge, Button, Card, Die, Label, Seal, StatBlock } from '@knightandwizard/ui';

import { buildCharacterSheetView, skillPoints } from '@/features/character-sheet/model';
import { ATTRIBUTE_LABELS_FR, demoArcher, makeSeededRandomInteger } from '@/lib/design-proto-data';

// Surface « Fiche de personnage » composée avec @knightandwizard/ui (skin armorial),
// branchée sur les VRAIS modèles : createPlayerCharacter (race Humain, races.yaml),
// buildCharacterSheetView (aptitudes effectives + niveau) et rollDice (le moteur tire,
// la surface n'invente rien). Le « 1 » force l'échec critique avec sa sévérité D100.

const TEST_DIFFICULTY = 7;

function dieKind(value: number): 'one' | 'critical' | 'success' | 'plain' {
  if (value === 1) return 'one';
  if (value >= 10) return 'critical';
  if (value >= TEST_DIFFICULTY) return 'success';
  return 'plain';
}

export default function FicheSurfacePage() {
  const [night, setNight] = useState(false);
  const [seed, setSeed] = useState(8);

  const view = useMemo(
    () =>
      buildCharacterSheetView({
        character: demoArcher,
        inventory: [],
        mode: 'complete',
        spells: []
      }),
    []
  );

  // Pool canonique du test = aptitude + compétence (Dextérité + Archerie), résolu
  // par rollDice. Le seed rend le tir reproductible ; « Relancer » change le seed.
  const pool = view.attributes.dexterity + skillPoints(demoArcher.skills, 'archerie');
  const roll = useMemo(
    () => rollDice(pool, TEST_DIFFICULTY, { randomInteger: makeSeededRandomInteger(seed) }),
    [pool, seed]
  );

  const aptitudes = ATTRIBUTE_KEYS.map((key) => ({
    label: ATTRIBUTE_LABELS_FR[key],
    value: view.attributes[key]
  }));

  const level = view.levelProgression;
  const ressources = [
    { label: 'Vitalité', value: `${demoArcher.vitality.current}/${demoArcher.vitality.max}` },
    { label: 'Énergie', value: `${demoArcher.energy.current}/${demoArcher.energy.max}` },
    { label: 'F. Vitesse', value: demoArcher.speedFactor },
    { label: 'F. Volonté', value: demoArcher.willFactor },
    {
      label: 'Niveau',
      value: `${level.level ?? '—'} · ${level.levelPoints ?? '—'}/${level.levelUpAt ?? '—'} pts`
    }
  ];

  return (
    <div style={{ padding: 24, maxWidth: 880, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 4 }}>Surface — Fiche de personnage (skin armorial)</h1>
      <p style={{ color: '#666', marginTop: 0 }}>
        Branchée sur les vrais modèles <code>rules-core</code> + <code>character-sheet</code> :
        personnage construit par <code>createPlayerCharacter</code> (race Humain, races.yaml),
        aptitudes &amp; niveau via <code>buildCharacterSheetView</code>, jet via{' '}
        <code>rollDice</code>.
      </p>
      <button type="button" onClick={() => setNight((n) => !n)} style={{ marginBottom: 12 }}>
        Mode : {night ? 'Veillée (nuit)' : 'Jour'}
      </button>

      <div
        data-skin="armorial"
        data-theme={night ? 'night' : undefined}
        style={{
          background: 'var(--color-bg-canvas)',
          color: 'var(--color-text-ink)',
          fontFamily: 'var(--font-body)',
          padding: 24,
          border: 'var(--border-strong) solid var(--color-border-rule)',
          display: 'grid',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Label>Livret du héros · enrôlement scellé</Label>
            <h2 style={{ fontFamily: 'var(--font-display)', margin: '4px 0' }}>
              {demoArcher.name}
            </h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Badge tone="info">{demoArcher.classProfile.name}</Badge>
              <Badge tone="neutral">
                {demoArcher.race.name} · {demoArcher.orientation.name}
              </Badge>
            </div>
          </div>
          <Seal>Niv. {level.level ?? '—'}</Seal>
        </div>

        <Card>
          <StatBlock title={`Aptitudes (${aptitudes.length})`} items={aptitudes} />
        </Card>

        <Card>
          <StatBlock title="Livret de campagne" items={ressources} />
        </Card>

        <Card>
          <Label>
            Test — Dextérité + Archerie (pool {pool}, diff. {TEST_DIFFICULTY})
          </Label>
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              margin: '8px 0',
              flexWrap: 'wrap'
            }}
          >
            {roll.rolls.map((value, index) => (
              <Die key={`${seed}-${index}-${value}`} value={value} kind={dieKind(value)} />
            ))}
            <span style={{ marginLeft: 8, fontFamily: 'var(--font-display)', fontSize: 28 }}>
              {roll.successes} {roll.successes > 1 ? 'réussites' : 'réussite'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minHeight: 24 }}>
            {roll.isCriticalSuccess && <Badge tone="success">Réussite critique</Badge>}
            {roll.isCriticalFailure && (
              <Badge tone="danger">
                Échec critique · D100 = {roll.criticalFailureSeverity ?? '—'}
              </Badge>
            )}
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: 8 }}>
            « L’écu illisible est un écu mal porté. »
          </div>
          <div style={{ marginTop: 12 }}>
            <Button onClick={() => setSeed((s) => s + 1)}>Relancer le tir</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
