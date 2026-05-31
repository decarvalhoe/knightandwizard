import { EFFECT_CONDITION_KEYS } from './effect-model.js';
import type {
  EffectCondition,
  EffectConditionKey,
  EffectConditionValue,
  EffectFidelity,
  EffectModel,
  EffectOperation,
  EffectSpec,
  EffectTarget,
  EffectValue,
  EffectValueVariable
} from './effect-model.js';

type RenderTemplateKey = `${EffectTarget}:${EffectOperation}`;
type ConditionBuckets = Partial<Record<EffectConditionKey, string[]>>;

export interface EffectFidelityDescription {
  prose: string;
  render: string;
  fidelity: EffectFidelity;
}

const VALUE_LABELS: Record<EffectValueVariable, string> = {
  level: 'niveau',
  force: 'Force',
  dexterity: 'Dextérité',
  stamina: 'Endurance',
  reflexes: 'Réflexes',
  perception: 'Perception',
  intelligence: 'Intelligence',
  charisma: 'Charisme',
  empathy: 'Empathie',
  aestheticism: 'Esthétique',
  vitalityMax: 'vitalité maximale',
  energyMax: 'énergie maximale',
  successes: 'réussite'
};

const SCOPE_LABELS: Record<string, string> = {
  ...VALUE_LABELS,
  volonte: 'volonté',
  volonté: 'volonté'
};

const TARGET_LABELS: Record<EffectTarget, string> = {
  aptitude: 'aptitude',
  factor: 'facteur',
  difficulty: 'difficulté',
  pool: 'pool de dés',
  damage: 'dégâts',
  energy: 'énergie',
  vitality: 'vitalité',
  status: 'état',
  protection: 'protection',
  summon: 'invocation',
  spell: 'sort (méta-magie)'
};

const CONTEXT_LABELS: Record<string, string> = {
  combat: 'combat',
  exploration: 'exploration',
  social: 'interaction sociale',
  rest: 'repos'
};

const ENVIRONMENT_LABELS: Record<string, string> = {
  naval: 'naval',
  mounted: 'monté',
  underwater: 'sous-marin',
  darkness: 'obscur'
};

const ENVIRONMENT_PHRASES: Record<string, string> = {
  naval: 'en environnement naval',
  mounted: 'à dos de monture',
  underwater: 'sous l’eau',
  darkness: 'dans l’obscurité'
};

const ACTION_PHRASES: Record<string, string> = {
  attaque: 'lors d’une attaque',
  attack: 'lors d’une attaque',
  defense: 'lors d’une défense',
  défense: 'lors d’une défense',
  sort: 'lors d’un sort',
  spell: 'lors d’un sort',
  esquive: 'lors d’une esquive',
  dodge: 'lors d’une esquive'
};

const TARGET_TAG_LABELS: Record<string, string> = {
  undead: 'les morts-vivants',
  demon: 'les démons',
  magical: 'les cibles magiques',
  armored: 'les cibles armurées',
  living: 'les vivants'
};

const TARGET_DISPOSITION_PHRASES: Record<string, string> = {
  ally: 'sur un allié',
  enemy: 'contre un ennemi'
};

const WEAPON_LABELS: Record<string, string> = {
  sword: 'une épée',
  epee: 'une épée',
  épée: 'une épée',
  bow: 'un arc',
  arc: 'un arc',
  knife: 'un couteau',
  couteau: 'un couteau'
};

const TOOL_LABELS: Record<string, string> = {
  arme_predilection: 'arme de prédilection',
  instrument_predilection: 'instrument de prédilection',
  animaux_predilection: 'animaux de prédilection',
  monture_predilection: 'monture de prédilection',
  moyen_locomotion_predilection: 'moyen de locomotion de prédilection',
  domaine_predilection: 'domaine de prédilection'
};

const SCHOOL_LABELS: Record<string, string> = {
  abjuration: 'd’abjuration',
  necromancy: 'de nécromancie',
  nécromancie: 'de nécromancie',
  illusion: 'd’illusion'
};

const SELF_STATE_LABELS: Record<string, string> = {
  enraged: 'enragé',
  wounded: 'blessé',
  prone: 'à terre',
  hidden: 'caché'
};

const DIRECTNESS_PHRASES: Record<string, string> = {
  direct_only: 'en action directe'
};

export const EFFECT_RENDER_TEMPLATE_KEYS = [
  'pool:add',
  'pool:sub',
  'pool:set',
  'pool:multiply',
  'difficulty:add',
  'difficulty:sub',
  'difficulty:set',
  'difficulty:multiply',
  'aptitude:add',
  'aptitude:sub',
  'aptitude:set',
  'aptitude:multiply',
  'aptitude:grant',
  'factor:add',
  'factor:sub',
  'factor:set',
  'factor:multiply',
  'energy:add',
  'energy:sub',
  'energy:set',
  'energy:multiply',
  'vitality:add',
  'vitality:sub',
  'vitality:set',
  'vitality:multiply',
  'damage:add',
  'status:grant',
  'status:sub',
  'status:set'
] as const satisfies readonly RenderTemplateKey[];

const EFFECT_RENDER_TEMPLATES: Partial<Record<RenderTemplateKey, (spec: EffectSpec) => string>> = {
  'pool:add': (spec) => `Ajoute ${renderValue(spec.value)} au pool de dés`,
  'pool:sub': (spec) => `Retire ${renderValue(spec.value)} du pool de dés`,
  'pool:set': (spec) => `Fixe le pool de dés à ${renderValue(spec.value)}`,
  'pool:multiply': (spec) => `Multiplie le pool de dés par ${renderValue(spec.value)}`,
  'difficulty:add': (spec) => `Augmente la difficulté de ${renderValue(spec.value)}`,
  'difficulty:sub': (spec) => `Réduit la difficulté de ${renderValue(spec.value)}`,
  'difficulty:set': (spec) => `Fixe la difficulté à ${renderValue(spec.value)}`,
  'difficulty:multiply': (spec) => `Multiplie la difficulté par ${renderValue(spec.value)}`,
  'aptitude:add': (spec) => `+${renderValue(spec.value)} en ${renderScope(spec.scope)}`,
  'aptitude:sub': (spec) => `-${renderValue(spec.value)} en ${renderScope(spec.scope)}`,
  'aptitude:set': (spec) => `Fixe ${renderScope(spec.scope)} à ${renderValue(spec.value)}`,
  'aptitude:multiply': (spec) =>
    `Multiplie ${renderScope(spec.scope)} par ${renderValue(spec.value)}`,
  'aptitude:grant': (spec) => `Accorde ${renderScope(spec.scope)}`,
  'factor:add': (spec) =>
    `Augmente ${renderScopedTarget('le facteur', spec.scope)} de ${renderValue(spec.value)}`,
  'factor:sub': (spec) =>
    `Réduit ${renderScopedTarget('le facteur', spec.scope)} de ${renderValue(spec.value)}`,
  'factor:set': (spec) =>
    `Fixe ${renderScopedTarget('le facteur', spec.scope)} à ${renderValue(spec.value)}`,
  'factor:multiply': (spec) =>
    `Multiplie ${renderScopedTarget('le facteur', spec.scope)} par ${renderValue(spec.value)}`,
  'energy:add': (spec) => `Restaure ${renderValue(spec.value)} points d'énergie`,
  'energy:sub': (spec) => `Retire ${renderValue(spec.value)} points d'énergie`,
  'energy:set': (spec) => `Fixe l'énergie à ${renderValue(spec.value)}`,
  'energy:multiply': (spec) => `Multiplie l'énergie par ${renderValue(spec.value)}`,
  'vitality:add': (spec) => `Restaure ${renderValue(spec.value)} points de vitalité`,
  'vitality:sub': (spec) => `Retire ${renderValue(spec.value)} points de vitalité`,
  'vitality:set': (spec) => `Fixe la vitalité à ${renderValue(spec.value)}`,
  'vitality:multiply': (spec) => `Multiplie la vitalité par ${renderValue(spec.value)}`,
  'damage:add': (spec) => `Inflige ${renderValue(spec.value)} dégâts supplémentaires`,
  'status:grant': (spec) => `Inflige l'état ${renderScope(spec.scope)}`,
  'status:sub': (spec) => `Retire l'état ${renderScope(spec.scope)}`,
  'status:set': (spec) => `Fixe l'état à ${renderScope(spec.scope)}`
};

export function renderEffect(model: EffectModel): string {
  const baseRender = renderEffectSpec(model.spec);
  const conditionRender = renderConditionSuffix(model.spec.condition);
  const usageRender = renderDailyUseSuffix(model.spec.uses_per_day);

  return `${baseRender}${conditionRender}${usageRender}`;
}

/**
 * Exposes source prose beside the generated render for human audit.
 * The returned fidelity is the model's declared review state, not an automatic semantic verdict.
 */
export function describeFidelity(model: EffectModel): EffectFidelityDescription {
  return {
    prose: model.source.prose,
    render: renderEffect(model),
    fidelity: model.fidelity
  };
}

function renderEffectSpec(spec: EffectSpec): string {
  const template = EFFECT_RENDER_TEMPLATES[toTemplateKey(spec)];

  if (template !== undefined) {
    return template(spec);
  }

  return renderFallback(spec);
}

function renderFallback(spec: EffectSpec): string {
  const scope = spec.scope === undefined ? '' : ` (${renderScope(spec.scope)})`;

  return `Applique ${spec.op} ${renderValue(spec.value)} sur ${TARGET_LABELS[spec.target]}${scope}`;
}

function renderDailyUseSuffix(usesPerDay: number | undefined): string {
  return usesPerDay === undefined ? '' : ` (${usesPerDay}/jour)`;
}

function renderValue(value: EffectValue): string {
  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'string') {
    return isEffectValueVariable(value) ? VALUE_LABELS[value] : renderExpression(value);
  }

  return `la valeur de la table ${value.table} selon ${VALUE_LABELS[value.key]}`;
}

function renderExpression(expression: string): string {
  const tokens = expression.match(/[A-Za-z_][A-Za-z0-9_]*|\d+|[()+\-*/]/g) ?? [];

  return tokens
    .map((token) => renderExpressionToken(token))
    .join(' ')
    .replace(/\( /g, '(')
    .replace(/ \)/g, ')')
    .trim();
}

function renderExpressionToken(token: string): string {
  if (token === '*') {
    return 'x';
  }

  if (isEffectValueVariable(token)) {
    return VALUE_LABELS[token];
  }

  return token;
}

function renderConditionSuffix(condition: EffectCondition | undefined): string {
  if (condition === undefined) {
    return '';
  }

  const conditionRender = renderConditionBody(condition);

  return conditionRender === '' ? '' : ` ${conditionRender}`;
}

function renderConditionBody(condition: EffectCondition): string {
  const flatCondition = flattenConjunction(condition);

  if (flatCondition !== null) {
    return renderFlatCondition(flatCondition);
  }

  const parts: string[] = [];
  const directConditions = renderDirectConditionKeys(condition);

  if (directConditions !== '') {
    parts.push(directConditions);
  }

  if (condition.all_of !== undefined) {
    parts.push(...condition.all_of.map(renderConditionBody).filter(Boolean));
  }

  if (condition.any_of !== undefined) {
    const anyOfRender = condition.any_of.map(renderConditionBody).filter(Boolean).join(' ou ');

    if (anyOfRender !== '') {
      parts.push(anyOfRender);
    }
  }

  return parts.join(' et ');
}

function renderDirectConditionKeys(condition: EffectCondition): string {
  const buckets = readDirectConditionKeys(condition);

  return renderFlatCondition(buckets);
}

function renderFlatCondition(buckets: ConditionBuckets): string {
  const parts: string[] = [];
  const contextValues = buckets.context ?? [];
  const environmentValues = buckets.env ?? [];

  if (contextValues.length > 0 && environmentValues.length > 0) {
    parts.push(
      `en ${joinLabels(contextValues.map(renderContextLabel))} ${joinLabels(
        environmentValues.map(renderEnvironmentLabel)
      )}`
    );
  } else if (contextValues.length > 0) {
    parts.push(joinLabels(contextValues.map(renderContextPhrase)));
  } else if (environmentValues.length > 0) {
    parts.push(joinLabels(environmentValues.map(renderEnvironmentPhrase)));
  }

  appendConditionPart(parts, buckets.action_type, renderActionPhrase);
  appendConditionPart(parts, buckets.competence, renderCompetencePhrase);
  appendConditionPart(parts, buckets.spec, renderSpecializationPhrase);
  appendConditionPart(parts, buckets.aptitude, renderAptitudeConditionPhrase);
  appendConditionPart(parts, buckets.target_tag, renderTargetTagPhrase);
  appendConditionPart(parts, buckets.target_disposition, renderTargetDispositionPhrase);
  appendConditionPart(parts, buckets.target_ref, renderTargetReferencePhrase);
  appendConditionPart(parts, buckets.weapon, renderWeaponPhrase);
  appendConditionPart(parts, buckets.tool, renderToolPhrase);
  appendConditionPart(parts, buckets.school, renderSchoolPhrase);
  appendConditionPart(parts, buckets.self_state, renderSelfStatePhrase);
  appendConditionPart(parts, buckets.intent, renderIntentPhrase);
  appendConditionPart(parts, buckets.directness, renderDirectnessPhrase);

  return parts.join(' et ');
}

function flattenConjunction(condition: EffectCondition): ConditionBuckets | null {
  if (condition.any_of !== undefined) {
    return null;
  }

  const buckets = readDirectConditionKeys(condition);

  for (const child of condition.all_of ?? []) {
    const childBuckets = flattenConjunction(child);

    if (childBuckets === null) {
      return null;
    }

    mergeConditionBuckets(buckets, childBuckets);
  }

  return buckets;
}

function readDirectConditionKeys(condition: EffectCondition): ConditionBuckets {
  const buckets: ConditionBuckets = {};

  for (const key of EFFECT_CONDITION_KEYS) {
    const value = condition[key];

    if (value !== undefined) {
      buckets[key] = readConditionValues(value);
    }
  }

  return buckets;
}

function mergeConditionBuckets(target: ConditionBuckets, source: ConditionBuckets): void {
  for (const key of EFFECT_CONDITION_KEYS) {
    const values = source[key];

    if (values !== undefined) {
      target[key] = [...(target[key] ?? []), ...values];
    }
  }
}

function appendConditionPart(
  parts: string[],
  values: string[] | undefined,
  render: (value: string) => string
): void {
  if (values !== undefined && values.length > 0) {
    parts.push(joinLabels(values.map(render)));
  }
}

function readConditionValues(value: EffectConditionValue): string[] {
  return Array.isArray(value) ? value : [value];
}

function renderContextLabel(value: string): string {
  return CONTEXT_LABELS[value] ?? humanize(value);
}

function renderContextPhrase(value: string): string {
  if (value === 'rest') {
    return 'au repos';
  }

  return `en ${renderContextLabel(value)}`;
}

function renderEnvironmentLabel(value: string): string {
  return ENVIRONMENT_LABELS[value] ?? humanize(value);
}

function renderEnvironmentPhrase(value: string): string {
  return ENVIRONMENT_PHRASES[value] ?? `en environnement ${renderEnvironmentLabel(value)}`;
}

function renderActionPhrase(value: string): string {
  return ACTION_PHRASES[value] ?? `lors de l'action ${humanize(value)}`;
}

function renderCompetencePhrase(value: string): string {
  return `avec la compétence ${humanize(value)}`;
}

function renderSpecializationPhrase(value: string): string {
  return `avec la spécialisation ${humanize(value)}`;
}

function renderAptitudeConditionPhrase(value: string): string {
  return `avec l’aptitude ${renderScope(value)}`;
}

function renderTargetTagPhrase(value: string): string {
  return `contre ${TARGET_TAG_LABELS[value] ?? `les cibles ${humanize(value)}`}`;
}

function renderTargetDispositionPhrase(value: string): string {
  return TARGET_DISPOSITION_PHRASES[value] ?? `sur une cible ${humanize(value)}`;
}

function renderTargetReferencePhrase(value: string): string {
  return `visant ${humanize(value)}`;
}

function renderWeaponPhrase(value: string): string {
  return `avec ${WEAPON_LABELS[value] ?? humanize(value)}`;
}

function renderToolPhrase(value: string): string {
  return `avec ${TOOL_LABELS[value] ?? humanize(value)}`;
}

function renderSchoolPhrase(value: string): string {
  return `pour l’école ${SCHOOL_LABELS[value] ?? `de ${humanize(value)}`}`;
}

function renderSelfStatePhrase(value: string): string {
  return `si le porteur est ${SELF_STATE_LABELS[value] ?? humanize(value)}`;
}

function renderIntentPhrase(value: string): string {
  return `avec l’intention ${humanize(value)}`;
}

function renderDirectnessPhrase(value: string): string {
  return DIRECTNESS_PHRASES[value] ?? `avec une causalité ${humanize(value)}`;
}

function renderScope(scope: string | undefined): string {
  if (scope === undefined) {
    return 'non précisé';
  }

  return SCOPE_LABELS[scope] ?? humanize(scope);
}

function renderScopedTarget(base: string, scope: string | undefined): string {
  if (scope === undefined) {
    return base;
  }

  return `${base} ${renderScope(scope)}`;
}

function toTemplateKey(spec: EffectSpec): RenderTemplateKey {
  return `${spec.target}:${spec.op}`;
}

function joinLabels(values: string[]): string {
  return values.join(' ou ');
}

function humanize(value: string): string {
  return value.replace(/[_-]+/g, ' ');
}

function isEffectValueVariable(value: string): value is EffectValueVariable {
  return value in VALUE_LABELS;
}
