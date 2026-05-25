export const EFFECT_TARGETS = [
  'aptitude',
  'factor',
  'difficulty',
  'pool',
  'energy',
  'vitality',
  'status'
] as const;

export type EffectTarget = (typeof EFFECT_TARGETS)[number];

export const EFFECT_OPERATIONS = ['add', 'sub', 'set', 'grant', 'multiply'] as const;

export type EffectOperation = (typeof EFFECT_OPERATIONS)[number];

export const EFFECT_ACTIVATIONS = ['passive', 'active', 'triggered'] as const;

export type EffectActivation = (typeof EFFECT_ACTIVATIONS)[number];

export type EffectDuration = 'permanent' | 'ephemeral' | { dt: number } | 'until_dispel';

export const EFFECT_FIDELITIES = ['covered', 'ambiguous', 'pending'] as const;

export type EffectFidelity = (typeof EFFECT_FIDELITIES)[number];

export const EFFECT_VALUE_VARIABLES = [
  'level',
  'force',
  'dexterity',
  'stamina',
  'reflexes',
  'perception',
  'intelligence',
  'charisma',
  'empathy',
  'aestheticism',
  'vitalityMax',
  'energyMax'
] as const;

export type EffectValueVariable = (typeof EFFECT_VALUE_VARIABLES)[number];

export interface EffectTableValue {
  table: string;
  key: EffectValueVariable;
}

export type EffectValueExpression = string;

export type EffectValue = number | EffectValueVariable | EffectValueExpression | EffectTableValue;

export const EFFECT_CONDITION_KEYS = [
  'context',
  'env',
  'action_type',
  'target_tag',
  'weapon',
  'school',
  'self_state'
] as const;

export type EffectConditionKey = (typeof EFFECT_CONDITION_KEYS)[number];

export type EffectConditionValue = string | string[];

export type EffectCondition = {
  all_of?: EffectCondition[];
  any_of?: EffectCondition[];
} & Partial<Record<EffectConditionKey, EffectConditionValue>>;

export type EffectConditionContext = Partial<Record<EffectConditionKey, EffectConditionValue>>;

export type EffectValueContext = Partial<Record<EffectValueVariable, number>> & {
  tables?: Record<string, Record<string, number>>;
};

export interface EffectSource {
  prose: string;
  ref: string;
}

export interface EffectSpec {
  target: EffectTarget;
  scope?: string;
  op: EffectOperation;
  value: EffectValue;
  condition?: EffectCondition;
  activation: EffectActivation;
  duration: EffectDuration;
}

export interface EffectModel {
  source: EffectSource;
  spec: EffectSpec;
  render?: string;
  fidelity: EffectFidelity;
  ambiguity_ref?: string | null;
}

type BinaryOperator = '+' | '-' | '*' | '/';
type UnaryOperator = '+' | '-';

type ExpressionNode =
  | { kind: 'literal'; value: number }
  | { kind: 'variable'; name: EffectValueVariable }
  | { kind: 'unary'; op: UnaryOperator; expression: ExpressionNode }
  | { kind: 'binary'; op: BinaryOperator; left: ExpressionNode; right: ExpressionNode };

type Token =
  | { type: 'number'; value: string }
  | { type: 'identifier'; value: string }
  | { type: 'operator'; value: BinaryOperator }
  | { type: 'left_paren'; value: '(' }
  | { type: 'right_paren'; value: ')' }
  | { type: 'eof'; value: '' };

export function parseEffectModel(raw: unknown): EffectModel {
  if (!isRecord(raw)) {
    throw new Error('EffectModel must be an object');
  }

  assertKnownKeys(raw, ['source', 'spec', 'render', 'fidelity', 'ambiguity_ref'], 'EffectModel');

  const source = requireRecord(raw, 'source', 'EffectModel.source');
  assertKnownKeys(source, ['prose', 'ref'], 'EffectModel.source');
  assertString(source.prose, 'EffectModel.source.prose');
  assertString(source.ref, 'EffectModel.source.ref');

  const spec = requireRecord(raw, 'spec', 'EffectModel.spec');
  assertKnownKeys(
    spec,
    ['target', 'scope', 'op', 'value', 'condition', 'activation', 'duration'],
    'EffectModel.spec'
  );
  assertEnum(spec.target, EFFECT_TARGETS, 'effect target');
  assertOptionalString(spec.scope, 'EffectModel.spec.scope');
  assertEnum(spec.op, EFFECT_OPERATIONS, 'effect operation');
  validateEffectValue(spec.value);
  if ('condition' in spec) {
    validateEffectCondition(spec.condition);
  }
  assertEnum(spec.activation, EFFECT_ACTIVATIONS, 'effect activation');
  validateEffectDuration(spec.duration);

  if ('render' in raw) {
    assertString(raw.render, 'EffectModel.render');
  }
  assertEnum(raw.fidelity, EFFECT_FIDELITIES, 'effect fidelity');
  if ('ambiguity_ref' in raw && raw.ambiguity_ref !== null) {
    assertString(raw.ambiguity_ref, 'EffectModel.ambiguity_ref');
  }

  return raw as unknown as EffectModel;
}

export function evaluateValue(value: EffectValue, context: EffectValueContext): number {
  validateEffectValue(value);

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return evaluateExpressionNode(parseValueExpression(value), context);
  }

  const keyValue = readContextVariable(value.key, context);
  const table = context.tables?.[value.table];

  if (table === undefined) {
    throw new Error(`Unknown effect value table "${value.table}"`);
  }

  const result = table[String(keyValue)];

  if (typeof result !== 'number' || !Number.isFinite(result)) {
    throw new Error(`Missing effect value table entry "${value.table}.${keyValue}"`);
  }

  return result;
}

export function matchesCondition(
  condition: EffectCondition | undefined,
  context: EffectConditionContext
): boolean {
  if (condition === undefined) {
    return true;
  }

  validateEffectCondition(condition);

  return evaluateCondition(condition, context);
}

function validateEffectValue(value: unknown): asserts value is EffectValue {
  if (typeof value === 'number') {
    if (!Number.isInteger(value)) {
      throw new Error('Effect value literal must be an integer');
    }
    return;
  }

  if (typeof value === 'string') {
    parseValueExpression(value);
    return;
  }

  if (isRecord(value)) {
    assertKnownKeys(value, ['table', 'key'], 'effect value table');
    assertString(value.table, 'effect value table.table');
    assertString(value.key, 'effect value table.key');
    assertEffectValueVariable(value.key);
    return;
  }

  throw new Error('Unknown effect value form');
}

function validateEffectDuration(duration: unknown): asserts duration is EffectDuration {
  if (duration === 'permanent' || duration === 'ephemeral' || duration === 'until_dispel') {
    return;
  }

  if (isRecord(duration)) {
    assertKnownKeys(duration, ['dt'], 'effect duration');
    if (typeof duration.dt !== 'number' || !Number.isInteger(duration.dt) || duration.dt <= 0) {
      throw new Error('Effect duration dt must be a positive integer');
    }
    return;
  }

  throw new Error(`Unknown effect duration "${String(duration)}"`);
}

function validateEffectCondition(condition: unknown): asserts condition is EffectCondition {
  if (!isRecord(condition)) {
    throw new Error('Effect condition must be an object');
  }

  const keys = Object.keys(condition);
  if (keys.length === 0) {
    throw new Error('Effect condition must contain at least one key');
  }

  for (const key of keys) {
    if (key === 'all_of' || key === 'any_of') {
      validateConditionGroup(condition[key], key);
      continue;
    }

    if (!isEffectConditionKey(key)) {
      throw new Error(`Unknown effect condition key "${key}"`);
    }

    validateConditionValue(condition[key], key);
  }
}

function validateConditionGroup(value: unknown, key: 'all_of' | 'any_of'): void {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Effect condition ${key} must be a non-empty array`);
  }

  for (const condition of value) {
    validateEffectCondition(condition);
  }
}

function validateConditionValue(value: unknown, key: string): void {
  if (typeof value === 'string') {
    if (value.length === 0) {
      throw new Error(`Effect condition ${key} must not be empty`);
    }
    return;
  }

  if (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((entry) => typeof entry === 'string' && entry.length > 0)
  ) {
    return;
  }

  throw new Error(`Effect condition ${key} must be a string or a non-empty string array`);
}

function evaluateCondition(condition: EffectCondition, context: EffectConditionContext): boolean {
  for (const key of EFFECT_CONDITION_KEYS) {
    const expected = condition[key];
    if (expected !== undefined && !matchesConditionValue(expected, context[key])) {
      return false;
    }
  }

  if (
    condition.all_of !== undefined &&
    !condition.all_of.every((entry) => evaluateCondition(entry, context))
  ) {
    return false;
  }

  if (
    condition.any_of !== undefined &&
    !condition.any_of.some((entry) => evaluateCondition(entry, context))
  ) {
    return false;
  }

  return true;
}

function matchesConditionValue(
  expected: EffectConditionValue,
  actual: EffectConditionValue | undefined
): boolean {
  if (actual === undefined) {
    return false;
  }

  const expectedValues = Array.isArray(expected) ? expected : [expected];
  const actualValues = Array.isArray(actual) ? actual : [actual];

  return expectedValues.some((value) => actualValues.includes(value));
}

function parseValueExpression(expression: string): ExpressionNode {
  const tokens = tokenizeExpression(expression);
  const parser = new ExpressionParser(tokens);

  return parser.parse();
}

function tokenizeExpression(expression: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < expression.length) {
    const char = expression[index];

    if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      index += 1;
      continue;
    }

    if (isDigit(char)) {
      let end = index + 1;
      while (end < expression.length && isDigit(expression[end])) {
        end += 1;
      }
      tokens.push({ type: 'number', value: expression.slice(index, end) });
      index = end;
      continue;
    }

    if (isIdentifierStart(char)) {
      let end = index + 1;
      while (end < expression.length && isIdentifierPart(expression[end])) {
        end += 1;
      }
      tokens.push({ type: 'identifier', value: expression.slice(index, end) });
      index = end;
      continue;
    }

    if (char === '+' || char === '-' || char === '*' || char === '/') {
      tokens.push({ type: 'operator', value: char });
      index += 1;
      continue;
    }

    if (char === '(') {
      tokens.push({ type: 'left_paren', value: char });
      index += 1;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'right_paren', value: char });
      index += 1;
      continue;
    }

    throw new Error(`Malformed effect value expression: unexpected character "${char}"`);
  }

  tokens.push({ type: 'eof', value: '' });

  return tokens;
}

class ExpressionParser {
  private index = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): ExpressionNode {
    const expression = this.parseExpression();

    if (this.current().type !== 'eof') {
      throw new Error(
        `Malformed effect value expression: unexpected token "${this.current().value}"`
      );
    }

    return expression;
  }

  private parseExpression(): ExpressionNode {
    let node = this.parseTerm();

    while (true) {
      const token = this.current();
      if (token.type !== 'operator' || !isAdditiveOperator(token.value)) {
        break;
      }

      const op = token.value;
      this.advance();
      node = { kind: 'binary', op, left: node, right: this.parseTerm() };
    }

    return node;
  }

  private parseTerm(): ExpressionNode {
    let node = this.parseFactor();

    while (true) {
      const token = this.current();
      if (token.type !== 'operator' || !isMultiplicativeOperator(token.value)) {
        break;
      }

      const op = token.value;
      this.advance();
      node = { kind: 'binary', op, left: node, right: this.parseFactor() };
    }

    return node;
  }

  private parseFactor(): ExpressionNode {
    const token = this.current();

    if (token.type === 'operator' && isUnaryOperator(token.value)) {
      this.advance();
      return { kind: 'unary', op: token.value, expression: this.parseFactor() };
    }

    if (token.type === 'number') {
      this.advance();
      return { kind: 'literal', value: Number(token.value) };
    }

    if (token.type === 'identifier') {
      this.advance();
      assertEffectValueVariable(token.value);
      return { kind: 'variable', name: token.value };
    }

    if (token.type === 'left_paren') {
      this.advance();
      const expression = this.parseExpression();

      if (this.current().type !== 'right_paren') {
        throw new Error('Malformed effect value expression: expected ")"');
      }

      this.advance();
      return expression;
    }

    throw new Error('Malformed effect value expression: expected number, variable or "("');
  }

  private current(): Token {
    return this.tokens[this.index] ?? { type: 'eof', value: '' };
  }

  private advance(): void {
    this.index += 1;
  }
}

function evaluateExpressionNode(node: ExpressionNode, context: EffectValueContext): number {
  switch (node.kind) {
    case 'literal':
      return node.value;
    case 'variable':
      return readContextVariable(node.name, context);
    case 'unary': {
      const value = evaluateExpressionNode(node.expression, context);
      return node.op === '-' ? -value : value;
    }
    case 'binary': {
      const left = evaluateExpressionNode(node.left, context);
      const right = evaluateExpressionNode(node.right, context);

      switch (node.op) {
        case '+':
          return left + right;
        case '-':
          return left - right;
        case '*':
          return left * right;
        case '/':
          if (right === 0) {
            throw new Error('Effect value expression division by zero');
          }
          return left / right;
      }
    }
  }
}

function readContextVariable(name: EffectValueVariable, context: EffectValueContext): number {
  const value = context[name];

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Missing effect value variable "${name}" in evaluation context`);
  }

  return value;
}

function assertEffectValueVariable(value: string): asserts value is EffectValueVariable {
  if (!isEffectValueVariable(value)) {
    throw new Error(`Unknown effect value variable "${value}"`);
  }
}

function isEffectValueVariable(value: string): value is EffectValueVariable {
  return (EFFECT_VALUE_VARIABLES as readonly string[]).includes(value);
}

function isEffectConditionKey(value: string): value is EffectConditionKey {
  return (EFFECT_CONDITION_KEYS as readonly string[]).includes(value);
}

function assertEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  label: string
): asserts value is T {
  if (typeof value !== 'string' || !allowedValues.includes(value as T)) {
    throw new Error(`Unknown ${label} "${String(value)}"`);
  }
}

function assertKnownKeys(
  record: Record<string, unknown>,
  allowedKeys: readonly string[],
  label: string
): void {
  for (const key of Object.keys(record)) {
    if (!allowedKeys.includes(key)) {
      throw new Error(`Unknown ${label} key "${key}"`);
    }
  }
}

function requireRecord(
  record: Record<string, unknown>,
  key: string,
  label: string
): Record<string, unknown> {
  const value = record[key];

  if (!isRecord(value)) {
    throw new Error(`${label} must be an object`);
  }

  return value;
}

function assertString(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function assertOptionalString(value: unknown, label: string): asserts value is string | undefined {
  if (value !== undefined) {
    assertString(value, label);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDigit(value: string | undefined): value is string {
  return value !== undefined && value >= '0' && value <= '9';
}

function isIdentifierStart(value: string | undefined): value is string {
  return (
    value !== undefined &&
    ((value >= 'a' && value <= 'z') || (value >= 'A' && value <= 'Z') || value === '_')
  );
}

function isIdentifierPart(value: string | undefined): value is string {
  return isIdentifierStart(value) || isDigit(value);
}

function isAdditiveOperator(value: BinaryOperator): value is '+' | '-' {
  return value === '+' || value === '-';
}

function isMultiplicativeOperator(value: BinaryOperator): value is '*' | '/' {
  return value === '*' || value === '/';
}

function isUnaryOperator(value: BinaryOperator): value is UnaryOperator {
  return value === '+' || value === '-';
}
