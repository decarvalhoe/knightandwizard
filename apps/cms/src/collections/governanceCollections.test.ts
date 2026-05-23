import type { Field } from 'payload';
import { describe, expect, it } from 'vitest';

import {
  GovernanceCollections,
  validateCatalogAmbiguityWorkflow,
  validateCatalogDecisionWorkflow
} from './governanceCollections.js';

const expectedSlugs = ['catalog-ambiguities', 'catalog-decisions'] as const;

describe('Payload governance collections', () => {
  it('registers ambiguity and decision governance collections', () => {
    expect(GovernanceCollections.map((collection) => collection.slug)).toEqual(expectedSlugs);

    for (const collection of GovernanceCollections) {
      expect(collection.admin?.group).toBe('Gouvernance canonique');
      expect(collection.versions).toBe(true);
      expect(collection.access).toBeDefined();
      expect(field(collection.slug, 'canonicalId')).toMatchObject({
        index: true,
        required: true,
        type: 'text',
        unique: true
      });
    }
  });

  it('models ambiguity assignment and resolution against a catalog entry', () => {
    expect(field('catalog-ambiguities', 'status')).toMatchObject({
      defaultValue: 'open',
      required: true,
      type: 'select'
    });
    expect(field('catalog-ambiguities', 'catalogCollection')).toMatchObject({
      required: true,
      type: 'select'
    });
    expect(field('catalog-ambiguities', 'catalogEntryCanonicalId')).toMatchObject({
      required: true,
      type: 'text'
    });
    expect(field('catalog-ambiguities', 'assignedTo')).toMatchObject({
      relationTo: 'users',
      type: 'relationship'
    });
    expect(field('catalog-ambiguities', 'resolutionDecision')).toMatchObject({
      relationTo: 'catalog-decisions',
      type: 'relationship'
    });
    expect(field('catalog-ambiguities', 'sourceRefs')).toMatchObject({ required: true });
    expect(childFieldNames(field('catalog-ambiguities', 'regeneratedArtifacts'))).toEqual([
      'path',
      'command',
      'sha256',
      'note'
    ]);
  });

  it('models decisions as explicit, source-backed changes linked to ambiguities', () => {
    expect(field('catalog-decisions', 'status')).toMatchObject({
      defaultValue: 'proposed',
      required: true,
      type: 'select'
    });
    expect(field('catalog-decisions', 'ambiguities')).toMatchObject({
      hasMany: true,
      required: true,
      relationTo: 'catalog-ambiguities',
      type: 'relationship'
    });
    expect(field('catalog-decisions', 'catalogEntryCanonicalId')).toMatchObject({
      required: true,
      type: 'text'
    });
    expect(field('catalog-decisions', 'sourceRefs')).toMatchObject({ required: true });
    expect(childFieldNames(field('catalog-decisions', 'sourceRefs'))).toEqual([
      'kind',
      'path',
      'ref',
      'sha256',
      'note'
    ]);
    expect(childFieldNames(field('catalog-decisions', 'regeneratedArtifacts'))).toEqual([
      'path',
      'command',
      'sha256',
      'note'
    ]);
  });

  it('rejects hidden ambiguity resolution without assignment, decision and regenerated artifacts', () => {
    expect(() =>
      validateCatalogAmbiguityWorkflow({
        catalogCollection: 'weapons',
        catalogEntryCanonicalId: 'arc-court',
        canonicalId: 'amb-arc-court-range',
        name: 'Arc court range',
        status: 'resolved'
      })
    ).toThrow(
      'resolved ambiguities require assignedTo, resolutionDecision, resolvedBy and resolvedAt'
    );

    expect(() =>
      validateCatalogAmbiguityWorkflow({
        assignedTo: 1,
        catalogCollection: 'weapons',
        catalogEntryCanonicalId: 'arc-court',
        canonicalId: 'amb-arc-court-range',
        name: 'Arc court range',
        regenerationStatus: 'completed',
        regeneratedArtifacts: [{ path: 'data/catalogs/armes.yaml' }],
        resolutionDecision: 2,
        resolvedAt: '2026-05-23T00:00:00.000Z',
        resolvedBy: 1,
        status: 'resolved'
      })
    ).not.toThrow();
  });

  it('requires applied decisions to carry regeneration evidence', () => {
    expect(() =>
      validateCatalogDecisionWorkflow({
        catalogCollection: 'weapons',
        catalogEntryCanonicalId: 'arc-court',
        canonicalId: 'dec-arc-court-range',
        name: 'Arc court range decision',
        status: 'applied'
      })
    ).toThrow('applied decisions require completed regeneration and regeneratedArtifacts');

    expect(() =>
      validateCatalogDecisionWorkflow({
        catalogCollection: 'weapons',
        catalogEntryCanonicalId: 'arc-court',
        canonicalId: 'dec-arc-court-range',
        decidedAt: '2026-05-23T00:00:00.000Z',
        decidedBy: 1,
        name: 'Arc court range decision',
        regenerationCommand: 'pnpm canonical:write',
        regenerationStatus: 'completed',
        regeneratedArtifacts: [
          { command: 'pnpm canonical:write', path: 'data/catalogs/armes.yaml' }
        ],
        status: 'applied'
      })
    ).not.toThrow();
  });
});

function field(slug: string, name: string): Field | undefined {
  return GovernanceCollections.find((collection) => collection.slug === slug)?.fields.find(
    fieldByName(name)
  );
}

function fieldByName(name: string): (field: Field) => boolean {
  return (field) => 'name' in field && field.name === name;
}

function childFieldNames(field: Field | undefined): string[] {
  if (!field || !('fields' in field) || !Array.isArray(field.fields)) {
    return [];
  }

  return field.fields.filter(hasName).map((childField) => String(childField.name));
}

function hasName(field: Field): field is Field & { name: string } {
  return 'name' in field && typeof field.name === 'string';
}
