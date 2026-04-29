import { rollDice } from '@knightandwizard/rules-core';

const sampleRolls = [10, 8, 1, 9, 6];
let rollIndex = 0;

const result = rollDice(4, 7, {
  randomInteger: () => sampleRolls[rollIndex++ % sampleRolls.length]
});

export const rulesPreview = {
  difficulty: 7,
  pool: '4D10',
  rolls: result.rolls,
  successes: result.successes
};
