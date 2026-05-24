import type { CSSProperties } from 'react';

import { Badge, Card, Label } from '@knightandwizard/ui';

const schools = [
  ['Abjuration', 'abjuration'],
  ['Alteration', 'alteration'],
  ['Blanche', 'blanche'],
  ['Divination', 'divination'],
  ['Enchantement', 'enchantement'],
  ['Elementaire', 'elementaire'],
  ['Illusion', 'illusion'],
  ['Invocation', 'invocation'],
  ['Naturelle', 'naturelle'],
  ['Noire', 'noire'],
  ['Necromancie', 'necromancie']
] as const;

export default function GrimoirePage() {
  return (
    <div className="kw-surface-page">
      <Card>
        <Label>Grimoire</Label>
        <h1>Onze ecoles, une roue peu charitable.</h1>
        <Badge tone="info">Skin grimoire</Badge>
      </Card>

      <section className="kw-surface-grid" aria-label="Ecoles de magie">
        {schools.map(([label, token]) => (
          <div className="kw-swatch-row" key={token}>
            <span
              aria-hidden="true"
              className="kw-swatch"
              style={{ '--swatch-color': 'var(--school-' + token + ')' } as CSSProperties}
            />
            <span>{label}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
