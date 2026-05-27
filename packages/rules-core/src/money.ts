/**
 * R-10.18 — Système monétaire minimaliste : 4 unités (Po, Pa, Pb, Pc) en facteur 10.
 *
 * La **source de vérité interne** est un entier de **Pc** (pièces de cuivre) ; la répartition
 * Po/Pa/Pb/Pc n'est qu'une conversion d'affichage.
 *   1 Po = 1000 Pc · 1 Pa = 100 Pc · 1 Pb = 10 Pc · 1 Pc = 1 Pc.
 */
export interface MoneyBreakdown {
  po: number;
  pa: number;
  pb: number;
  pc: number;
}

const COPPER_PER_PO = 1000;
const COPPER_PER_PA = 100;
const COPPER_PER_PB = 10;

/** Valeur totale en Pc (cuivre) d'une répartition Po/Pa/Pb/Pc. */
export function breakdownToCopper(money: MoneyBreakdown): number {
  assertNonNegativeInteger('po', money.po);
  assertNonNegativeInteger('pa', money.pa);
  assertNonNegativeInteger('pb', money.pb);
  assertNonNegativeInteger('pc', money.pc);

  return money.po * COPPER_PER_PO + money.pa * COPPER_PER_PA + money.pb * COPPER_PER_PB + money.pc;
}

/** Convertit un montant interne en Pc vers la répartition canonique Po/Pa/Pb/Pc (affichage). */
export function copperToBreakdown(copper: number): MoneyBreakdown {
  assertNonNegativeInteger('copper', copper);

  let rest = copper;
  const po = Math.floor(rest / COPPER_PER_PO);
  rest %= COPPER_PER_PO;
  const pa = Math.floor(rest / COPPER_PER_PA);
  rest %= COPPER_PER_PA;
  const pb = Math.floor(rest / COPPER_PER_PB);
  rest %= COPPER_PER_PB;

  return { po, pa, pb, pc: rest };
}

/** Dépense un coût (en Pc) sur un solde (en Pc) ; lève une erreur si fonds insuffisants. */
export function spendCopper(balance: number, cost: number): number {
  assertNonNegativeInteger('balance', balance);
  assertNonNegativeInteger('cost', cost);

  if (cost > balance) {
    throw new Error(`insufficient funds: ${cost} required, ${balance} available`);
  }

  return balance - cost;
}

function assertNonNegativeInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
}
