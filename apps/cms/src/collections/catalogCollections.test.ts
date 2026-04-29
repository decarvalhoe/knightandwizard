import { describe, expect, it } from 'vitest';

import { CatalogCollections } from './catalogCollections.js';

describe('Payload catalog collections', () => {
  it('registers the living-rules catalog collections in the expected order', () => {
    expect(CatalogCollections.map((collection) => collection.slug)).toEqual([
      'weapons',
      'bestiary',
      'spells',
      'nations'
    ]);
  });

  it('enables version history on every living-rules collection', () => {
    for (const collection of CatalogCollections) {
      expect(collection.versions).toBe(true);
    }
  });

  it('keeps the minimum canonical fields for rules administration', () => {
    const fieldsBySlug = Object.fromEntries(
      CatalogCollections.map((collection) => [
        collection.slug,
        collection.fields.map((field) => ('name' in field ? field.name : undefined))
      ])
    );

    expect(fieldsBySlug.weapons).toEqual(
      expect.arrayContaining(['name', 'category', 'damageType', 'baseDamage'])
    );
    expect(fieldsBySlug.bestiary).toEqual(
      expect.arrayContaining(['name', 'category', 'vitality', 'speedFactor', 'willFactor'])
    );
    expect(fieldsBySlug.spells).toEqual(
      expect.arrayContaining(['name', 'school', 'energyCost', 'incantationTimeDT', 'difficulty'])
    );
    expect(fieldsBySlug.nations).toEqual(expect.arrayContaining(['name', 'region', 'description']));
  });
});
