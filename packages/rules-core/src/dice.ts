export type RandomInteger = (sides: number) => number;

export interface RollDiceOptions {
  randomInteger?: RandomInteger;
}

export interface DiceRollResult {
  rolls: number[];
  successes: number;
  isCriticalSuccess: boolean;
  isCriticalFailure: boolean;
  total: number;
  criticalFailureSeverity?: number;
}

interface InitialDie {
  value: number;
  canceled: boolean;
}

/**
 * Resolves a K&W D10 pool.
 *
 * Canonical behavior:
 * - one success per die reaching the difficulty;
 * - initial 10s count as successes and explode;
 * - initial 1s cancel successes from highest value downward, including a canceled 10's cascade;
 * - 1s rolled during explosions are ignored;
 * - high difficulties use the D1 floor formula: 9 + last digit, then extra 9+ as extra successes;
 * - a pool of 0 is a forced failure: zero successes, no critical-failure D100.
 */
export function rollDice(
  pool: number,
  difficulty: number,
  options: RollDiceOptions = {}
): DiceRollResult {
  assertNonNegativeInteger('pool', pool);
  assertPositiveInteger('difficulty', difficulty);

  if (pool === 0) {
    return {
      rolls: [],
      successes: 0,
      isCriticalSuccess: false,
      isCriticalFailure: false,
      total: 0
    };
  }

  const randomInteger = options.randomInteger ?? defaultRandomInteger;
  const initialDice = rollInitialDice(pool, randomInteger);

  if (difficulty <= 9) {
    return resolveStandardDifficulty(pool, difficulty, initialDice, randomInteger);
  }

  return resolveHighDifficulty(pool, difficulty, initialDice, randomInteger);
}

function resolveStandardDifficulty(
  pool: number,
  difficulty: number,
  initialDice: InitialDie[],
  randomInteger: RandomInteger
): DiceRollResult {
  const rolls = initialDice.map((die) => die.value);
  const excessOnes = cancelInitialSuccesses(initialDice, difficulty);
  let successes = initialDice.filter((die) => !die.canceled && die.value >= difficulty).length;

  for (const die of initialDice) {
    if (!die.canceled && die.value === 10) {
      successes += rollExplosions(difficulty, rolls, randomInteger);
    }
  }

  return buildResult(pool, rolls, successes, excessOnes, randomInteger);
}

function resolveHighDifficulty(
  pool: number,
  difficulty: number,
  initialDice: InitialDie[],
  randomInteger: RandomInteger
): DiceRollResult {
  const rolls = initialDice.map((die) => die.value);
  const requirement = highDifficultyRequirement(difficulty);
  const excessOnes = cancelInitialSuccesses(initialDice, 9);
  const sequenceTokens = initialDice
    .filter((die) => !die.canceled && die.value >= requirement.lastDieDifficulty)
    .map((die) => die.value);

  for (const die of initialDice) {
    if (!die.canceled && die.value === 10) {
      collectHighDifficultyExplosions(
        requirement.lastDieDifficulty,
        sequenceTokens,
        rolls,
        randomInteger
      );
    }
  }

  const successes = countHighDifficultySuccesses(sequenceTokens, requirement.highDiceRequired);

  return buildResult(pool, rolls, successes, excessOnes, randomInteger);
}

function rollInitialDice(pool: number, randomInteger: RandomInteger): InitialDie[] {
  return Array.from({ length: pool }, () => ({
    value: rollDie(10, randomInteger),
    canceled: false
  }));
}

function cancelInitialSuccesses(initialDice: InitialDie[], successThreshold: number): number {
  let excessOnes = 0;

  for (const die of initialDice) {
    if (die.value !== 1) {
      continue;
    }

    if (!cancelHighestDieAtLeast(initialDice, successThreshold)) {
      excessOnes += 1;
    }
  }

  return excessOnes;
}

function cancelHighestDieAtLeast(initialDice: InitialDie[], threshold: number): boolean {
  let candidateIndex = -1;

  for (const [index, die] of initialDice.entries()) {
    if (die.canceled || die.value < threshold) {
      continue;
    }

    if (candidateIndex === -1 || die.value > initialDice[candidateIndex].value) {
      candidateIndex = index;
    }
  }

  if (candidateIndex === -1) {
    return false;
  }

  initialDice[candidateIndex].canceled = true;
  return true;
}

function rollExplosions(
  successThreshold: number,
  rolls: number[],
  randomInteger: RandomInteger
): number {
  let pendingExplosions = 1;
  let successes = 0;

  while (pendingExplosions > 0) {
    pendingExplosions -= 1;

    const value = rollDie(10, randomInteger);
    rolls.push(value);

    if (value >= successThreshold) {
      successes += 1;
    }

    if (value === 10) {
      pendingExplosions += 1;
    }
  }

  return successes;
}

function collectHighDifficultyExplosions(
  lastDieDifficulty: number,
  sequenceTokens: number[],
  rolls: number[],
  randomInteger: RandomInteger
): void {
  let pendingExplosions = 1;

  while (pendingExplosions > 0) {
    pendingExplosions -= 1;

    const value = rollDie(10, randomInteger);
    rolls.push(value);

    if (value >= lastDieDifficulty) {
      sequenceTokens.push(value);
    }

    if (value === 10) {
      pendingExplosions += 1;
    }
  }
}

function countHighDifficultySuccesses(sequenceTokens: number[], highDiceRequired: number): number {
  const remaining = [...sequenceTokens];

  for (let index = 0; index < highDiceRequired; index += 1) {
    if (!removeLowestAtLeast(remaining, 9)) {
      return 0;
    }
  }

  if (!removeLowestAtLeast(remaining, 5)) {
    return 0;
  }

  return 1 + remaining.filter((value) => value >= 9).length;
}

function removeLowestAtLeast(values: number[], threshold: number): boolean {
  let candidateIndex = -1;

  for (const [index, value] of values.entries()) {
    if (value < threshold) {
      continue;
    }

    if (candidateIndex === -1 || value < values[candidateIndex]) {
      candidateIndex = index;
    }
  }

  if (candidateIndex === -1) {
    return false;
  }

  values.splice(candidateIndex, 1);
  return true;
}

function highDifficultyRequirement(difficulty: number): {
  highDiceRequired: number;
  lastDieDifficulty: number;
} {
  return {
    highDiceRequired: Math.floor(difficulty / 5) - 1,
    lastDieDifficulty: (difficulty % 5) + 5
  };
}

function buildResult(
  pool: number,
  rolls: number[],
  successes: number,
  excessOnes: number,
  randomInteger: RandomInteger
): DiceRollResult {
  const isCriticalFailure = successes === 0 && excessOnes > 0;
  const result: DiceRollResult = {
    rolls,
    successes: isCriticalFailure ? 0 : successes,
    isCriticalSuccess: !isCriticalFailure && successes >= pool,
    isCriticalFailure,
    total: rolls.reduce((sum, value) => sum + value, 0)
  };

  if (isCriticalFailure) {
    result.criticalFailureSeverity = rollDie(100, randomInteger);
  }

  return result;
}

function rollDie(sides: number, randomInteger: RandomInteger): number {
  const value = randomInteger(sides);

  if (!Number.isInteger(value) || value < 1 || value > sides) {
    throw new Error(`randomInteger(${sides}) must return an integer between 1 and ${sides}`);
  }

  return value;
}

function defaultRandomInteger(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

function assertPositiveInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
}

function assertNonNegativeInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer`);
  }
}
