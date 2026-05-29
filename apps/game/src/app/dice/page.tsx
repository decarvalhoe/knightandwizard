import { Badge, Card, Die, Label } from '@knightandwizard/ui';

const dice = [
  { value: 10, kind: 'success' },
  { value: 7, kind: 'critical' },
  { value: 1, kind: 'one' }
] as const;

export default function DicePage() {
  return (
    <div className="kw-surface-page">
      <Card>
        <Label>Tripot</Label>
        <h1>Le destin tire au cent.</h1>
        <Badge tone="warn">Skin tripot</Badge>
      </Card>

      <Card>
        <div className="flex flex-wrap gap-2" aria-label="Dés de référence">
          {dice.map((die) => (
            <Die key={die.value} kind={die.kind} value={die.value} />
          ))}
        </div>
      </Card>
    </div>
  );
}
