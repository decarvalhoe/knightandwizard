import { Die, type DieKind } from './die.js';

export type DiceClusterDie = {
  value: number;
  kind?: DieKind;
};

export type DiceClusterProps = {
  dice: readonly DiceClusterDie[];
  label?: string;
};

export function DiceCluster({ dice, label = 'Des' }: DiceClusterProps) {
  return (
    <div aria-label={label} className="kw-dice-cluster" role="group">
      {dice.map((die, index) => (
        <Die key={String(die.value) + '-' + index} kind={die.kind} value={die.value} />
      ))}
    </div>
  );
}
