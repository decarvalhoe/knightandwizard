import { Badge, Card, Label } from '@knightandwizard/ui';

const ruleCodes = Array.from({ length: 13 }, (_, index) => 'D' + String(index + 1));

export default function RulesPage() {
  return (
    <div className="kw-surface-page">
      <Card>
        <Label>Archives</Label>
        <h1>D1-D13, et autant de raisons de relire.</h1>
        <Badge tone="danger">Skin archives</Badge>
      </Card>

      <section className="kw-surface-grid" aria-label="Sections de regles">
        {ruleCodes.map((code) => (
          <div className="kw-swatch-row" key={code}>
            <span className="kw-label">{code}</span>
            <span>Article canonique</span>
          </div>
        ))}
      </section>
    </div>
  );
}
