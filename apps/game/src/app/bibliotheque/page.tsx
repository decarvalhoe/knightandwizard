import { Badge, Card, Label } from '@knightandwizard/ui';

const ledgers = ['Sources', 'Catalogues', 'Amendements', 'Historique'] as const;

export default function BibliothequePage() {
  return (
    <div className="kw-surface-page">
      <Card>
        <Label>Bibliotheque</Label>
        <h1>La chancellerie classe avant de contredire.</h1>
        <Badge tone="neutral">Skin bibliotheque</Badge>
      </Card>

      <section className="kw-surface-grid" aria-label="Registres de chancellerie">
        {ledgers.map((ledger) => (
          <div className="kw-swatch-row" key={ledger}>
            <span className="kw-label">{ledger}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
