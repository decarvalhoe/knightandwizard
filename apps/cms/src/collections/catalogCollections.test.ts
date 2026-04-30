import type { CollectionConfig, Field } from 'payload';
import { describe, expect, it } from 'vitest';

import { CatalogCollections } from './catalogCollections.js';

const requiredCatalogSlugs = [
  'weapons',
  'protections',
  'bestiary',
  'potions',
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
  it('registers the complete CMS catalog surface for issue 3C-02', () => {
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

      expect(collection.fields.some(fieldByName('sourceRefs'))).toBe(true);
      expect(collection.fields.some(fieldByName('metadata'))).toBe(true);
    }
  });

  it('keeps collection slugs unique', () => {
    const slugs = CatalogCollections.map((collection) => collection.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('models critical relationships between catalogs', () => {
    expect(field(CatalogCollections, 'weapons', 'originNation')).toMatchObject({
      relationTo: 'nations',
      type: 'relationship'
    });
    expect(field(CatalogCollections, 'level-assets', 'characterClass')).toMatchObject({
      relationTo: 'character-classes',
      type: 'relationship'
    });
    expect(field(CatalogCollections, 'places', 'parentPlace')).toMatchObject({
      relationTo: 'places',
      type: 'relationship'
    });
    expect(field(CatalogCollections, 'character-classes', 'primarySkills')).toMatchObject({
      hasMany: true,
      relationTo: 'skills',
      type: 'relationship'
    });
  });
});

function field(collections: CollectionConfig[], slug: string, name: string): Field | undefined {
  return collections.find((collection) => collection.slug === slug)?.fields.find(fieldByName(name));
}

function fieldByName(name: string): (field: Field) => boolean {
  return (field) => 'name' in field && field.name === name;
}
