import type { CollectionBeforeValidateHook, CollectionConfig, Field } from 'payload';

const GOVERNANCE_GROUP = 'Gouvernance canonique';

const catalogEditorRoles = ['admin', 'catalog_editor'] as const;
const catalogReviewerRoles = ['admin', 'catalog_editor', 'catalog_reviewer'] as const;

const catalogCollections = [
  'weapons',
  'protections',
  'bestiary',
  'potions',
  'magic-schools',
  'spells',
  'nations',
  'organisations',
  'religions',
  'rules',
  'mushrooms',
  'images',
  'lore-entries',
  'world-map-regions',
  'map-cities',
  'orientations',
  'races',
  'skill-families',
  'skills',
  'character-classes',
  'assets',
  'level-assets',
  'places'
] as const;

const ambiguityStatuses = ['open', 'assigned', 'resolved', 'rejected'] as const;
const decisionStatuses = ['proposed', 'accepted', 'applied', 'superseded', 'rejected'] as const;
const regenerationStatuses = ['not_required', 'pending', 'completed'] as const;

type CatalogUser = {
  role?: string | null;
  roles?: string[] | string | null;
};

const governanceAccess: CollectionConfig['access'] = {
  read: ({ req }) => hasGovernanceRole(req.user, catalogReviewerRoles),
  create: ({ req }) => hasGovernanceRole(req.user, catalogEditorRoles),
  update: ({ req }) => hasGovernanceRole(req.user, catalogEditorRoles),
  delete: ({ req }) => hasGovernanceRole(req.user, catalogEditorRoles)
};

export function validateCatalogAmbiguityWorkflow(data: unknown): unknown {
  if (!isRecord(data)) {
    return data;
  }

  if (data.status === 'assigned' && !hasValue(data.assignedTo)) {
    throw new Error('assigned ambiguities require assignedTo');
  }

  if (data.status !== 'resolved') {
    return data;
  }

  if (
    !hasValue(data.assignedTo) ||
    !hasValue(data.resolutionDecision) ||
    !hasValue(data.resolvedBy) ||
    !hasValue(data.resolvedAt)
  ) {
    throw new Error(
      'resolved ambiguities require assignedTo, resolutionDecision, resolvedBy and resolvedAt'
    );
  }

  if (data.regenerationStatus !== 'completed' || !hasRegeneratedArtifacts(data)) {
    throw new Error('resolved ambiguities require completed regeneration and regeneratedArtifacts');
  }

  return data;
}

export function validateCatalogDecisionWorkflow(data: unknown): unknown {
  if (!isRecord(data)) {
    return data;
  }

  if (data.status !== 'applied') {
    return data;
  }

  if (data.regenerationStatus !== 'completed' || !hasRegeneratedArtifacts(data)) {
    throw new Error('applied decisions require completed regeneration and regeneratedArtifacts');
  }

  if (!hasValue(data.decidedBy) || !hasValue(data.decidedAt)) {
    throw new Error('applied decisions require decidedBy and decidedAt');
  }

  return data;
}

const validateAmbiguityBeforeValidate: CollectionBeforeValidateHook = ({ data }) =>
  validateCatalogAmbiguityWorkflow(data) as Record<string, unknown> | undefined;

const validateDecisionBeforeValidate: CollectionBeforeValidateHook = ({ data }) =>
  validateCatalogDecisionWorkflow(data) as Record<string, unknown> | undefined;

const canonicalIdField: Field = {
  name: 'canonicalId',
  type: 'text',
  admin: {
    description: 'Stable governance id used to reference ambiguity and decision records.'
  },
  index: true,
  required: true,
  unique: true
};

const nameField: Field = {
  name: 'name',
  type: 'text',
  required: true
};

const sourceRefsField: Field = {
  name: 'sourceRefs',
  type: 'array',
  required: true,
  admin: {
    description: 'Source files, anchors and hashes that justify the ambiguity or decision.'
  },
  fields: [
    selectField(
      'kind',
      ['yaml', 'legacy_source', 'legacy_php', 'rules_markdown', 'map_asset', 'manual'],
      true
    ),
    textField('path', true),
    textField('ref'),
    textField('sha256'),
    textField('note')
  ]
};

const regeneratedArtifactsField: Field = {
  name: 'regeneratedArtifacts',
  type: 'array',
  admin: {
    description: 'Artifacts regenerated after applying the decision.'
  },
  fields: [textField('path', true), textField('command'), textField('sha256'), textField('note')]
};

const metadataField: Field = {
  name: 'metadata',
  type: 'json',
  admin: {
    description: 'Raw governance metadata preserved for audits and import/export workflows.'
  }
};

export const CatalogAmbiguities: CollectionConfig = {
  slug: 'catalog-ambiguities',
  admin: {
    defaultColumns: ['canonicalId', 'name', 'status', 'catalogCollection', 'assignedTo'],
    group: GOVERNANCE_GROUP,
    useAsTitle: 'name'
  },
  access: governanceAccess,
  labels: { singular: 'Catalog Ambiguity', plural: 'Catalog Ambiguities' },
  versions: true,
  hooks: {
    beforeValidate: [validateAmbiguityBeforeValidate]
  },
  fields: [
    canonicalIdField,
    nameField,
    selectField('status', ambiguityStatuses, true, { defaultValue: 'open', index: true }),
    selectField('severity', ['P0', 'P1', 'P2', 'P3', 'P4'], true, { defaultValue: 'P2' }),
    textField('domain', true),
    selectField('catalogCollection', catalogCollections, true),
    textField('catalogEntryCanonicalId', true),
    textField('fieldPath'),
    textareaField('conflictSummary', true),
    textareaField('proposedResolution'),
    sourceRefsField,
    relationshipField('assignedTo', 'users'),
    relationshipField('resolvedBy', 'users'),
    dateField('resolvedAt'),
    relationshipField('resolutionDecision', 'catalog-decisions'),
    selectField('regenerationStatus', regenerationStatuses, true, { defaultValue: 'pending' }),
    regeneratedArtifactsField,
    metadataField
  ]
};

export const CatalogDecisions: CollectionConfig = {
  slug: 'catalog-decisions',
  admin: {
    defaultColumns: ['canonicalId', 'name', 'status', 'catalogCollection', 'decidedAt'],
    group: GOVERNANCE_GROUP,
    useAsTitle: 'name'
  },
  access: governanceAccess,
  labels: { singular: 'Catalog Decision', plural: 'Catalog Decisions' },
  versions: true,
  hooks: {
    beforeValidate: [validateDecisionBeforeValidate]
  },
  fields: [
    canonicalIdField,
    nameField,
    selectField('status', decisionStatuses, true, { defaultValue: 'proposed', index: true }),
    selectField(
      'decisionType',
      ['catalog_resolution', 'rules_interpretation', 'source_priority', 'migration'],
      true
    ),
    selectField('catalogCollection', catalogCollections, true),
    textField('catalogEntryCanonicalId', true),
    textField('fieldPath'),
    textareaField('rationale', true),
    textareaField('resolutionSummary', true),
    relationshipField('ambiguities', 'catalog-ambiguities', { hasMany: true, required: true }),
    sourceRefsField,
    relationshipField('decidedBy', 'users'),
    dateField('decidedAt'),
    textField('regenerationCommand'),
    selectField('regenerationStatus', regenerationStatuses, true, { defaultValue: 'pending' }),
    regeneratedArtifactsField,
    metadataField
  ]
};

export const GovernanceCollections = [
  CatalogAmbiguities,
  CatalogDecisions
] satisfies CollectionConfig[];

function textField(name: string, required = false, extra: Record<string, unknown> = {}): Field {
  return {
    name,
    type: 'text',
    required,
    ...extra
  } as Field;
}

function textareaField(name: string, required = false): Field {
  return {
    name,
    type: 'textarea',
    required
  };
}

function dateField(name: string): Field {
  return {
    name,
    type: 'date'
  };
}

function selectField(
  name: string,
  options: readonly string[],
  required = false,
  extra: Record<string, unknown> = {}
): Field {
  return {
    name,
    type: 'select',
    options: options.map((value) => ({ label: toLabel(value), value })),
    required,
    ...extra
  } as Field;
}

function relationshipField(
  name: string,
  relationTo: string,
  extra: Record<string, unknown> = {}
): Field {
  return {
    name,
    type: 'relationship',
    relationTo,
    ...extra
  } as Field;
}

function hasGovernanceRole(
  user: unknown,
  allowedRoles: readonly (typeof catalogReviewerRoles)[number][]
): boolean {
  if (!isCatalogUser(user)) {
    return false;
  }

  const roles = [
    ...(Array.isArray(user.roles) ? user.roles : user.roles ? [user.roles] : []),
    ...(user.role ? [user.role] : [])
  ];

  return roles.some((role) => allowedRoles.includes(role as (typeof catalogReviewerRoles)[number]));
}

function isCatalogUser(user: unknown): user is CatalogUser {
  return typeof user === 'object' && user !== null;
}

function hasRegeneratedArtifacts(data: Record<string, unknown>): boolean {
  return (
    Array.isArray(data.regeneratedArtifacts) &&
    data.regeneratedArtifacts.some((artifact) => isRecord(artifact) && hasValue(artifact.path))
  );
}

function hasValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toLabel(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
