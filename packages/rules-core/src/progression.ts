import {
  calculateLevelProgression,
  type Character,
  type CharacterProgression,
  type CharacterSkill,
  type CharacterSpell
} from './character.js';
import { DEFAULT_RULES_CONFIG, type RulesConfig } from './rules-config.js';

export type LearningKind =
  | 'skill'
  | 'complex_skill'
  | 'new_spell'
  | 'spell_development'
  | 'conceptualization';

export interface SessionXPAwardCriteria {
  presence?: boolean;
  concentration?: boolean;
  respectsSpeech?: boolean;
  respectsPsychology?: boolean;
  achievedObjective?: boolean;
  roleplayPoints?: number;
  questPoint?: boolean;
  bonusXP?: number;
}

export interface SessionXPAward {
  xp: number;
  questPoints: number;
}

export interface GainXPOptions {
  questPoints?: number;
}

export interface LearningPlanInput {
  xpCost: number;
  kind: LearningKind;
  learningSuccesses?: number;
  teachingSuccesses?: number;
  divisor?: number;
  selfTaught?: boolean;
}

export interface LearningPlan {
  baseDays: number;
  finalDays: number;
}

export interface LearnSkillOptions {
  hasNarrativeAccess?: boolean;
  parentId?: string | null;
  isMain?: boolean;
}

export interface LearnSpellOptions {
  hasNarrativeAccess?: boolean;
  minimumLevel?: number;
}

export class ProgressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProgressionError';
  }
}

export function calculateSessionXPAward(
  criteria: SessionXPAwardCriteria,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): SessionXPAward {
  const roleplayPoints = criteria.roleplayPoints ?? 0;
  const bonusXP = criteria.bonusXP ?? 0;

  assertIntegerInRange('roleplayPoints', roleplayPoints, 0, config.progression.maxRoleplayPoints);
  assertNonNegativeInteger('bonusXP', bonusXP);

  return {
    xp:
      boolPoint(criteria.presence) +
      boolPoint(criteria.concentration) +
      boolPoint(criteria.respectsSpeech) +
      boolPoint(criteria.respectsPsychology) +
      boolPoint(criteria.achievedObjective) +
      roleplayPoints +
      bonusXP,
    questPoints: criteria.questPoint === true ? 1 : 0
  };
}

export function gainXP<TCharacter extends Character>(
  character: TCharacter,
  amount: number,
  options: GainXPOptions = {}
): TCharacter {
  const questPoints = options.questPoints ?? 0;

  assertNonNegativeInteger('amount', amount);
  assertNonNegativeInteger('questPoints', questPoints);

  return withProgression(character, {
    experiencePoints: character.progression.experiencePoints + amount,
    experienceTotal: character.progression.experienceTotal + amount,
    questPoints: character.progression.questPoints + questPoints
  });
}

export function finalizeDefinitiveDeath<TCharacter extends Character>(
  character: TCharacter
): TCharacter {
  return withProgression(character, {
    ...character.progression,
    experiencePoints: 0,
    questPoints: 0
  });
}

export function calculateLearningPlan(
  input: LearningPlanInput,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): LearningPlan {
  assertPositiveInteger('xpCost', input.xpCost);
  assertNonNegativeInteger('learningSuccesses', input.learningSuccesses ?? 0);
  assertNonNegativeInteger('teachingSuccesses', input.teachingSuccesses ?? 0);

  const divisor = input.divisor ?? 1;

  assertPositiveInteger('divisor', divisor);

  const baseDays =
    input.xpCost *
    config.progression.learningDaysPerXP *
    (input.selfTaught === true ? config.progression.selfTaughtMultiplier : 1);
  const successes = (input.learningSuccesses ?? 0) + (input.teachingSuccesses ?? 0);
  const reducedDays = Math.ceil(Math.max(0, baseDays - successes) / divisor);

  return {
    baseDays,
    finalDays: Math.max(learningFloor(input.kind, config), reducedDays)
  };
}

export function learnSkill<TCharacter extends Character>(
  character: TCharacter,
  skillId: string,
  options: LearnSkillOptions = {},
  config: RulesConfig = DEFAULT_RULES_CONFIG
): TCharacter {
  assertNarrativeAccess(options.hasNarrativeAccess);

  const currentSkill = character.skills.find((skill) => skill.id === skillId);
  const cost = skillImprovementCost(currentSkill?.points ?? 0, config);

  assertCanSpendXP(character, cost);

  const nextSkills =
    currentSkill === undefined
      ? [
          ...character.skills,
          {
            id: skillId,
            points: 1,
            isMain: options.isMain,
            parentId: options.parentId
          }
        ]
      : character.skills.map((skill) =>
          skill.id === skillId
            ? {
                ...skill,
                points: skill.points + 1
              }
            : skill
        );

  return withProgression(
    {
      ...character,
      skills: nextSkills.map(copySkill)
    },
    spendXP(character.progression, cost)
  );
}

export function learnSpell<TCharacter extends Character>(
  character: TCharacter,
  spellId: string,
  options: LearnSpellOptions = {},
  config: RulesConfig = DEFAULT_RULES_CONFIG
): TCharacter {
  if (!isMagician(character)) {
    throw new ProgressionError('only magician characters can learn spells');
  }

  assertNarrativeAccess(options.hasNarrativeAccess);
  assertMinimumLevel(character, options.minimumLevel);

  const currentSpell = character.spells.find((spell) => spell.id === spellId);
  const cost = spellImprovementCost(currentSpell?.points ?? 0, config);

  assertCanSpendXP(character, cost);

  const nextSpells =
    currentSpell === undefined
      ? [
          ...character.spells,
          {
            id: spellId,
            points: 1
          }
        ]
      : character.spells.map((spell) =>
          spell.id === spellId
            ? {
                ...spell,
                points: spell.points + 1
              }
            : spell
        );

  return withProgression(
    {
      ...character,
      spells: nextSpells.map(copySpell)
    },
    spendXP(character.progression, cost)
  );
}

export function skillImprovementCost(
  currentPoints: number,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): number {
  assertNonNegativeInteger('currentPoints', currentPoints);
  const base = config.progression.skillImprovementBaseCost;
  return currentPoints === 0 ? base : currentPoints * base;
}

export function spellImprovementCost(
  currentPoints: number,
  config: RulesConfig = DEFAULT_RULES_CONFIG
): number {
  assertNonNegativeInteger('currentPoints', currentPoints);
  const base = config.progression.spellImprovementBaseCost;
  return currentPoints === 0 ? base : currentPoints * base;
}

function spendXP(progression: CharacterProgression, cost: number): CharacterProgression {
  return {
    ...progression,
    experiencePoints: progression.experiencePoints - cost
  };
}

function withProgression<TCharacter extends Character>(
  character: TCharacter,
  progression: CharacterProgression
): TCharacter {
  return {
    ...character,
    progression
  };
}

function assertCanSpendXP(character: Character, cost: number): void {
  if (character.progression.experiencePoints < cost) {
    throw new ProgressionError(
      `not enough experience points: ${cost} required, ${character.progression.experiencePoints} available`
    );
  }
}

function assertNarrativeAccess(hasNarrativeAccess = true): void {
  if (!hasNarrativeAccess) {
    throw new ProgressionError('learning requires narrative access to a mentor, text or practice');
  }
}

function assertMinimumLevel(character: Character, minimumLevel?: number): void {
  if (minimumLevel === undefined) {
    return;
  }

  assertPositiveInteger('minimumLevel', minimumLevel);

  const level = calculateLevelProgression(character).level ?? 0;

  if (level < minimumLevel) {
    throw new ProgressionError(`level ${minimumLevel} required, current level is ${level}`);
  }
}

function isMagician(character: Character): boolean {
  return (
    character.orientation.isMagical === true ||
    character.orientation.id === '1' ||
    character.orientation.id === 'magicien'
  );
}

function learningFloor(kind: LearningKind, config: RulesConfig = DEFAULT_RULES_CONFIG): number {
  return config.progression.learningFloors[kind];
}

function boolPoint(value?: boolean): number {
  return value === true ? 1 : 0;
}

function assertIntegerInRange(name: string, value: number, min: number, max: number): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new ProgressionError(`${name} must be an integer between ${min} and ${max}`);
  }
}

function assertPositiveInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new ProgressionError(`${name} must be a positive integer`);
  }
}

function assertNonNegativeInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new ProgressionError(`${name} must be a non-negative integer`);
  }
}

function copySkill(skill: CharacterSkill): CharacterSkill {
  return { ...skill };
}

function copySpell(spell: CharacterSpell): CharacterSpell {
  return { ...spell };
}
