import { describe, expect, it } from 'vitest';

import { rollDice } from './dice.js';

describe('D10 resolution', () => {
  it('counts one success per die that reaches a standard difficulty', () => {
    const result = rollDice(3, 7, { randomInteger: scriptedRolls([7, 8, 2]) });

    expect(result.rolls).toEqual([7, 8, 2]);
    expect(result.successes).toBe(2);
    expect(result.total).toBe(17);
    expect(result.isCriticalSuccess).toBe(false);
    expect(result.isCriticalFailure).toBe(false);
  });

  it('explodes 10s and ignores 1s rolled during explosions', () => {
    const result = rollDice(2, 7, { randomInteger: scriptedRolls([10, 7, 1]) });

    expect(result.rolls).toEqual([10, 7, 1]);
    expect(result.successes).toBe(2);
    expect(result.isCriticalSuccess).toBe(true);
    expect(result.isCriticalFailure).toBe(false);
  });

  it('lets an initial 1 cancel a 10 and its explosion chain', () => {
    const result = rollDice(2, 7, { randomInteger: scriptedRolls([10, 1]) });

    expect(result.rolls).toEqual([10, 1]);
    expect(result.successes).toBe(0);
    expect(result.isCriticalSuccess).toBe(false);
    expect(result.isCriticalFailure).toBe(false);
  });

  it('marks a critical failure and rolls one D100 when 1s exceed successes', () => {
    const result = rollDice(2, 7, { randomInteger: scriptedRolls([2, 1, 73]) });

    expect(result.rolls).toEqual([2, 1]);
    expect(result.successes).toBe(0);
    expect(result.isCriticalFailure).toBe(true);
    expect(result.criticalFailureSeverity).toBe(73);
  });

  it('marks a critical success when successes reach the initial pool size', () => {
    const result = rollDice(2, 7, { randomInteger: scriptedRolls([10, 9, 8]) });

    expect(result.rolls).toEqual([10, 9, 8]);
    expect(result.successes).toBe(3);
    expect(result.isCriticalSuccess).toBe(true);
  });

  it('uses the canonical floor formula for high difficulties', () => {
    const result = rollDice(2, 13, { randomInteger: scriptedRolls([9, 8]) });

    expect(result.successes).toBe(1);
    expect(result.isCriticalFailure).toBe(false);
  });

  it('lets a single 10 explosion complete difficulty 10', () => {
    const result = rollDice(1, 10, { randomInteger: scriptedRolls([10, 5]) });

    expect(result.rolls).toEqual([10, 5]);
    expect(result.successes).toBe(1);
    expect(result.isCriticalSuccess).toBe(true);
  });

  it('lets a 10 explosion complete a high-difficulty sequence', () => {
    const result = rollDice(2, 15, { randomInteger: scriptedRolls([10, 9, 5]) });

    expect(result.rolls).toEqual([10, 9, 5]);
    expect(result.successes).toBe(1);
    expect(result.isCriticalSuccess).toBe(false);
  });

  it('counts additional 9+ results as extra successes after a high-difficulty sequence', () => {
    const result = rollDice(3, 10, { randomInteger: scriptedRolls([9, 6, 9]) });

    expect(result.successes).toBe(2);
    expect(result.isCriticalSuccess).toBe(false);
  });

  it('does not complete a high-difficulty sequence without the last die threshold', () => {
    const result = rollDice(1, 10, { randomInteger: scriptedRolls([9]) });

    expect(result.successes).toBe(0);
    expect(result.isCriticalFailure).toBe(false);
  });

  it('validates the dice pool and difficulty inputs', () => {
    expect(() => rollDice(0, 7)).toThrow('pool must be a positive integer');
    expect(() => rollDice(2, 0)).toThrow('difficulty must be a positive integer');
  });

  it('validates custom randomInteger output', () => {
    expect(() => rollDice(1, 7, { randomInteger: () => 11 })).toThrow(
      'randomInteger(10) must return an integer between 1 and 10'
    );
  });

  it('can use the default random source', () => {
    const result = rollDice(1, 7);

    expect(result.rolls.length).toBeGreaterThanOrEqual(1);
    expect(result.rolls[0]).toBeGreaterThanOrEqual(1);
    expect(result.rolls[0]).toBeLessThanOrEqual(10);
  });
});

function scriptedRolls(values: number[]) {
  let index = 0;

  return (sides: number): number => {
    const value = values[index];
    index += 1;

    if (value === undefined) {
      throw new Error(`No scripted roll left for D${sides}`);
    }

    if (!Number.isInteger(value) || value < 1 || value > sides) {
      throw new Error(`Invalid scripted D${sides} roll: ${value}`);
    }

    return value;
  };
}
