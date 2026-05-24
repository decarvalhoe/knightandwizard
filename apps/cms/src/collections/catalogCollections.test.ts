import type { CollectionConfig, Field } from 'payload';
import { describe, expect, it } from 'vitest';

import { Users } from './Users.js';
import { CatalogCollections } from './catalogCollections.js';

const requiredCatalogSlugs = [
  'weapons',
  'protections',
  'bestiary',
  'potions',
  'magic-schools',
  'spells',
  'nations',
  'organisations',
  'religions',
  'rules'
] as const;

const yamlBacklogSlugs = [
  'mushrooms',
  'images',
  'lore-entries',
  'world-map-regions',
  'map-cities'
] as const;

const legacySupportSlugs = [
  'orientations',
  'races',
  'skill-families',
  'skills',
  'character-classes',
  'assets',
  'level-assets',
  'places'
] as const;

const expectedSlugs = [...requiredCatalogSlugs, ...yamlBacklogSlugs, ...legacySupportSlugs];

describe('Payload catalog collections', () => {
  it('registers the complete CMS catalog surface for issue 56', () => {
    expect(CatalogCollections.map((collection) => collection.slug)).toEqual(expectedSlugs);
  });

  it('keeps every catalog collection versioned and keyed by canonicalId', () => {
    for (const collection of CatalogCollections) {
      expect(collection.versions).toBe(true);

      const canonicalId = collection.fields.find(fieldByName('canonicalId'));
      expect(canonicalId).toMatchObject({
        index: true,
        required: true,
        type: 'text',
        unique: true
      });

      expect(collection.fields.some(fieldByName('status'))).toBe(true);
      expect(collection.fields.some(fieldByName('sourceRefs'))).toBe(true);
      expect(collection.fields.some(fieldByName('metadata'))).toBe(true);
    }
  });

  it('preserves canonical status and source hashes on every catalog collection', () => {
    for (const collection of CatalogCollections) {
      expect(field(collection.slug, 'status')).toMatchObject({
        defaultValue: 'active',
        index: true,
        type: 'select'
      });
      expect(childFieldNames(field(collection.slug, 'sourceRefs'))).toEqual([
        'kind',
        'path',
        'ref',
        'sha256',
        'note'
      ]);
    }
  });

  it('defines catalog editor and reviewer permissions', () => {
    for (const collection of CatalogCollections) {
      expect(collection.access).toBeDefined();
      expect(runAccess(collection, 'read', { roles: ['catalog_reviewer'] })).toBe(true);
      expect(runAccess(collection, 'create', { roles: ['catalog_editor'] })).toBe(true);
      expect(runAccess(collection, 'update', { roles: ['catalog_editor'] })).toBe(true);
      expect(runAccess(collection, 'delete', { roles: ['catalog_reviewer'] })).toBe(false);
    }

    expect(fieldFromFields(Users.fields, 'roles')).toMatchObject({
      hasMany: true,
      type: 'select'
    });
  });

  it('keeps collection slugs unique', () => {
    const slugs = CatalogCollections.map((collection) => collection.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('models critical relationships between catalogs', () => {
    expect(field('weapons', 'originNation')).toMatchObject({
      relationTo: 'nations',
      type: 'relationship'
    });
    expect(field('level-assets', 'characterClass')).toMatchObject({
      relationTo: 'character-classes',
      type: 'relationship'
    });
    expect(field('places', 'parentPlace')).toMatchObject({
      relationTo: 'places',
      type: 'relationship'
    });
    expect(field('character-classes', 'primarySkills')).toMatchObject({
      hasMany: true,
      relationTo: 'skills',
      type: 'relationship'
    });
    expect(field('magic-schools', 'specialistClass')).toMatchObject({
      relationTo: 'character-classes',
      type: 'relationship'
    });
    expect(field('spells', 'magicSchool')).toMatchObject({
      relationTo: 'magic-schools',
      type: 'relationship'
    });
  });
});

function field(slug: string, name: string): Field | undefined {
  return CatalogCollections.find((collection) => collection.slug === slug)?.fields.find(
    fieldByName(name)
  );
}

function fieldFromFields(fields: Field[], name: string): Field | undefined {
  return fields.find(fieldByName(name));
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

type AccessName = 'create' | 'delete' | 'read' | 'update';

function runAccess(
  collection: CollectionConfig,
  accessName: AccessName,
  user: { roles: string[] }
): boolean {
  const access = collection.access?.[accessName];

  if (typeof access !== 'function') {
    return false;
  }

  return Boolean(access({ req: { user } } as unknown as Parameters<typeof access>[0]));
}
