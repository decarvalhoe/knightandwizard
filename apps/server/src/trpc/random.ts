import type { RandomInteger } from '@knightandwizard/rules-core';

export interface DeterministicRandomInput {
  randomInteger?: number[];
  seed?: number | string;
}

export function toRandomInteger(input: DeterministicRandomInput): RandomInteger | undefined {
  if (input.randomInteger !== undefined) {
    return sequenceRandomInteger(input.randomInteger);
  }

  if (input.seed !== undefined) {
    return seededRandomInteger(String(input.seed));
  }

  return undefined;
}

function sequenceRandomInteger(values: number[]): RandomInteger {
  let index = 0;

  return (sides) => {
    const value = values[index];

    if (value === undefined) {
      throw new Error('Deterministic randomInteger sequence exhausted');
    }

    if (!Number.isInteger(value) || value < 1 || value > sides) {
      throw new Error(`Deterministic randomInteger value ${value} is outside 1..${sides}`);
    }

    index += 1;
    return value;
  };
}

function seededRandomInteger(seed: string): RandomInteger {
  let state = hashSeed(seed);

  return (sides) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return (state % sides) + 1;
  };
}

function hashSeed(seed: string): number {
  let hash = 2166136261;

  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}
