'use client';

import { useState } from 'react';

import { Badge, Button, Card, Die, Label, Seal, StatBlock } from '@knightandwizard/ui';

// Surface « Fiche de personnage » composée avec @knightandwizard/ui, skin armorial.
// Données d'exemple (le branchement rules-core/catalogs = intégration suivante).

const APTITUDES = [
  { label: 'Force', value: 4 },
  { label: 'Dextérité', value: 5 },
  { label: 'Vigueur', value: 3 },
  { label: 'Réflexes', value: 4 },
  { label: 'Intelligence', value: 3 },
  { label: 'Perception', value: 6 },
  { label: 'Volonté', value: 4 },
  { label: 'Esthétisme', value: 2 },
  { label: 'Empathie', value: 3 }
];

export default function FicheSurfacePage() {
  const [night, setNight] = useState(false);

  return (
    <div style={{ padding: 24, maxWidth: 880, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 4 }}>Surface — Fiche de personnage (skin armorial)</h1>
      <p style={{ color: '#666', marginTop: 0 }}>
        Composée avec <code>@knightandwizard/ui</code> (Card, StatBlock, Seal, Badge, Die) sur le
        skin armorial. Données d’exemple.
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
              Aveline de Fauche-le-Vent
            </h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <Badge tone="info">Guerrière</Badge>
              <Badge tone="neutral">Humaine · Carénienne</Badge>
            </div>
          </div>
          <Seal>Niv. 3</Seal>
        </div>

        <Card>
          <StatBlock title="Aptitudes (9)" items={APTITUDES} />
        </Card>

        <Card>
          <Label>Test — tir à l’arc (Dextérité + Arc, diff. 7)</Label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0' }}>
            <Die value={10} kind="success" />
            <span style={{ fontFamily: 'var(--font-display)' }}>↪</span>
            <Die value={9} kind="success" />
            <Die value={7} kind="critical" />
            <Die value={1} kind="one" />
            <span style={{ marginLeft: 8, fontFamily: 'var(--font-display)', fontSize: 28 }}>
              2 réussites
            </span>
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            « L’écu illisible est un écu mal porté. »
          </div>
          <div style={{ marginTop: 12 }}>
            <Button>Consigner au registre</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
