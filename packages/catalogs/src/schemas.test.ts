import { describe, expect, it } from 'vitest';

import {
  CatalogValidationError,
  PRIORITY_CATALOG_NAMES,
  loadValidatedCatalog,
  loadValidatedCatalogs,
  validateCatalogData
} from './schemas.js';

const expectedCollections = [
  ['armes.yaml', 'weapons', 107],
  ['bestiaire.yaml', 'creatures', 31],
  ['protections.yaml', 'armor_pieces', 59],
  ['protections.yaml', 'shields', 12],
  ['potions.yaml', 'potions', 5],
  ['nations.yaml', 'regions', 29],
  ['organisations.yaml', 'factions', 7],
  ['religions.yaml', 'religions', 15],
  ['competences.yaml', 'skills', 368],
  ['orientations.yaml', 'orientations', 12],
  ['classes.yaml', 'classes', 90],
  ['magic-schools.yaml', 'schools', 11],
  ['spells.yaml', 'spells', 324],
  ['legacy-characters.yaml', 'characters', 96],
  ['atouts.yaml', 'atouts', 416]
] as const;

describe('catalog Zod schemas', () => {
  it.each(expectedCollections)(
    'validates %s %s against the canonical YAML',
    async (file, key, count) => {
      const catalog = await loadValidatedCatalog(file);
      const collection = catalog[key];

      expect(Array.isArray(collection)).toBe(true);
      expect(collection).toHaveLength(count);
    }
  );

  it('loads all priority catalogs with their typed schemas', async () => {
    const catalogs = await loadValidatedCatalogs();

    expect(Object.keys(catalogs).sort()).toEqual([...PRIORITY_CATALOG_NAMES].sort());
    expect(catalogs['armes.yaml'].weapons[0].name).toBe('Arbalète à cry');
    expect(catalogs['nations.yaml'].regions[0].id).toBe('aderand');
  });

  it('groups skills under the 10 canonical families and resolves explicit parents', async () => {
    const catalog = await loadValidatedCatalog('competences.yaml');
    const families = new Set(catalog.skills.map((skill) => skill.family));

    expect(families).toEqual(
      new Set([
        'art',
        'artisanat',
        'combat',
        'connaissance',
        'jeu',
        'maitrise-de-soi',
        'savoir-faire',
        'sens',
        'social',
        'sport'
      ])
    );

    const ids = new Set(catalog.skills.map((skill) => skill.id));
    for (const skill of catalog.skills) {
      if (skill.parent_id != null) {
        expect(ids.has(skill.parent_id)).toBe(true);
      }
    }

    expect(ids.has('bouclier')).toBe(true);
    expect(ids.has('arcanologie')).toBe(true);
    expect(ids.has('long-blades')).toBe(false);
    expect(ids.has('shield')).toBe(false);
  });

  it('exposes specializations with an explicit parent reference', async () => {
    const catalog = await loadValidatedCatalog('competences.yaml');
    const tirGorge = catalog.skills.find((skill) => skill.id === 'tir-dans-la-gorge');

    expect(tirGorge).toBeDefined();
    expect(tirGorge?.parent_id).toBe('arc-long');
    expect(tirGorge?.family).toBe('combat');
  });

  it('rejects demo orientation and class IDs in the canonical catalogs', async () => {
    const orientations = await loadValidatedCatalog('orientations.yaml');
    const classes = await loadValidatedCatalog('classes.yaml');
    const orientationIds = new Set(orientations.orientations.map((o) => o.id));
    const classIds = new Set(classes.classes.map((c) => c.id));

    for (const demoId of ['fighter', 'magician-en', 'artisan-en']) {
      expect(orientationIds.has(demoId)).toBe(false);
    }
    for (const demoId of ['knight', 'mage-arms', 'lore-mage', 'blacksmith']) {
      expect(classIds.has(demoId)).toBe(false);
    }
  });

  it('flags only the magician orientation as magical', async () => {
    const catalog = await loadValidatedCatalog('orientations.yaml');
    const magical = catalog.orientations.filter((o) => o.is_magical);

    expect(magical.map((o) => o.id)).toEqual(['magicien']);
  });

  it('links every class to a known orientation and resolves primary skills', async () => {
    const orientations = await loadValidatedCatalog('orientations.yaml');
    const classes = await loadValidatedCatalog('classes.yaml');
    const skills = await loadValidatedCatalog('competences.yaml');
    const orientationIds = new Set(orientations.orientations.map((o) => o.id));
    const skillIds = new Set(skills.skills.map((s) => s.id));

    for (const klass of classes.classes) {
      expect(orientationIds.has(klass.orientation_id)).toBe(true);

      if (klass.primary_skill_choice === 'magician_no_primary') {
        expect(klass.primary_skill_id).toBeNull();
        expect(klass.orientation_id).toBe('magicien');
      } else if (klass.primary_skill_choice === 'fixed') {
        expect(klass.primary_skill_id).not.toBeNull();
        expect(skillIds.has(klass.primary_skill_id!)).toBe(true);
      }
    }
  });

  it('rejects demo race IDs and exposes the 26 canonical playable races', async () => {
    const catalog = await loadValidatedCatalog('bestiaire.yaml');
    const ids = new Set(catalog.creatures.map((c) => c.id));
    const playable = catalog.creatures.filter((c) => c.playable);

    for (const demoId of ['human', 'elf', 'dwarf']) {
      expect(ids.has(demoId)).toBe(false);
    }

    expect(playable).toHaveLength(25);
    expect(ids.has('humain')).toBe(true);
    expect(ids.has('haut_elfe')).toBe(true);
    expect(ids.has('nain')).toBe(true);
    expect(ids.has('zombie')).toBe(true);
  });

  it('preserves canonical source files at the bestiaire catalog level', async () => {
    const catalog = await loadValidatedCatalog('bestiaire.yaml');
    const sourceFiles = (catalog.metadata as { source_files?: Array<{ path: string }> })
      .source_files;

    expect(sourceFiles).toBeDefined();
    expect(sourceFiles?.map((s) => s.path)).toEqual(
      expect.arrayContaining([
        'data/legacy/web-scraped/documents/bestiaire/index.md',
        'data/legacy/paper/regles-papier/extracted/listes/bestiaire.md'
      ])
    );

    for (const creature of catalog.creatures) {
      if (creature.source_refs) {
        for (const ref of creature.source_refs) {
          expect(ref.path).toMatch(/data\/legacy\//);
          expect(ref.sha256).toMatch(/^[0-9a-f]{64}$/);
        }
      }
    }
  });

  it('exposes the canonical fighter and magician class spreads', async () => {
    const classes = await loadValidatedCatalog('classes.yaml');
    const fighters = classes.classes.filter((c) => c.orientation_id === 'guerrier');
    const magicians = classes.classes.filter((c) => c.orientation_id === 'magicien');

    expect(fighters.length).toBeGreaterThanOrEqual(15);
    expect(magicians).toHaveLength(12);
    expect(fighters.map((c) => c.id)).toContain('garde');
    expect(fighters.map((c) => c.id)).toContain('samourai');
    expect(magicians.map((c) => c.id)).toEqual(
      expect.arrayContaining([
        'abjurateur',
        'alterateur',
        'chaman',
        'clerc',
        'devin',
        'druide',
        'elementaliste',
        'enchanteur',
        'illusionniste',
        'invocateur',
        'necromancien',
        'sorcier'
      ])
    );
  });

  it('rejects demo spell IDs spark/ward/veil/mend in the canonical grimoire', async () => {
    const catalog = await loadValidatedCatalog('spells.yaml');
    const ids = new Set(catalog.spells.map((s) => s.id));

    for (const demoId of ['spark', 'ward', 'veil', 'mend']) {
      expect(ids.has(demoId)).toBe(false);
    }
  });

  it('links every spell to one of the 11 canonical magic schools', async () => {
    const schools = await loadValidatedCatalog('magic-schools.yaml');
    const spells = await loadValidatedCatalog('spells.yaml');
    const schoolIds = new Set(schools.schools.map((s) => s.id));

    expect(schoolIds).toEqual(
      new Set([
        'abjuration',
        'alteration',
        'magie-blanche',
        'divination',
        'enchantement',
        'elementaire',
        'illusion',
        'invocation',
        'magie-naturelle',
        'magie-noire',
        'necromancie'
      ])
    );

    for (const spell of spells.spells) {
      expect(schoolIds.has(spell.school_id)).toBe(true);
      expect(spell.energy).toBeGreaterThan(0);
      expect(spell.difficulty).toBeGreaterThan(0);
    }
  });

  it('exposes the canonical specialist class for each magic school', async () => {
    const catalog = await loadValidatedCatalog('magic-schools.yaml');
    const classes = await loadValidatedCatalog('classes.yaml');
    const classIds = new Set(classes.classes.map((c) => c.id));

    for (const school of catalog.schools) {
      expect(classIds.has(school.specialist_class_id)).toBe(true);
    }
  });

  it('inventories the 96 legacy characters as raw_reference_only with traceable source refs', async () => {
    const catalog = await loadValidatedCatalog('legacy-characters.yaml');

    expect(catalog.characters).toHaveLength(96);
    for (const character of catalog.characters) {
      expect(character.id).toMatch(/^legacy-character-\d+$/);
      expect(character.legacy_id).toBeGreaterThan(0);
      expect(character.status).toBe('raw_reference_only');
      expect(character.source_refs).toHaveLength(1);
      expect(character.source_refs[0].path).toMatch(
        /^data\/legacy\/web-scraped\/personnages\/fiches\/character-\d+\.md$/
      );
      expect(character.source_refs[0].sha256).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it('exposes atouts catalog with permanent/ephemere activation and scope partition', async () => {
    const catalog = await loadValidatedCatalog('atouts.yaml');
    const totals = {
      permanent: 0,
      ephemere: 0,
      classe: 0,
      neutre: 0,
      orientation: 0,
      handicap: 0
    };

    for (const atout of catalog.atouts) {
      totals[atout.activation] += 1;
      totals[atout.scope] += 1;
      if (atout.value < 0) totals.handicap += 1;
    }

    expect(totals.permanent + totals.ephemere).toBe(416);
    expect(totals.classe).toBe(75);
    expect(totals.neutre).toBe(328);
    expect(totals.orientation).toBe(13);
    expect(totals.handicap).toBeGreaterThan(0);

    const ids = new Set(catalog.atouts.map((a) => a.id));
    expect(ids.has('ambidextrie')).toBe(true);
    expect(ids.has('anosmie')).toBe(true);
    expect(ids.has('demo-atout')).toBe(false);
  });

  it('reports the file and data path when validation fails', () => {
    const validate = () =>
      validateCatalogData(
        'armes.yaml',
        {
          version: 1,
          metadata: {
            source: 'test',
            imported_at: '2026-04-29',
            total_entries: 1
          },
          weapons: [{ id: 'broken_weapon' }]
        },
        'fixtures/armes.yaml'
      );

    expect(validate).toThrow(CatalogValidationError);

    try {
      validate();
    } catch (error) {
      expect(error).toBeInstanceOf(CatalogValidationError);
      expect((error as Error).message).toContain('fixtures/armes.yaml');
      expect((error as Error).message).toContain('weapons.0.name');
    }
  });
});
