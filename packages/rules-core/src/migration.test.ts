import { describe, expect, it } from 'vitest';

import {
  ATTRIBUTE_KEYS,
  createPlayerCharacter,
  migrateCharacter,
  type RaceProfile
} from './character.js';
import { DEFAULT_RULES_CONFIG, type RulesConfig } from './rules-config.js';

describe('migrateCharacter', () => {
  it('recomputes magician energy.max and clamps current when magicianStartingEnergy changes', () => {
    const mage = magicianCharacter();

    expect(mage.energy).toEqual({ current: 60, max: 60 });

    const toConfig = withCreation({ magicianStartingEnergy: 40 });
    const result = migrateCharacter(mage, toConfig);

    expect(result.character.energy).toEqual({ current: 40, max: 40 });
    expect(result.changes).toContain('energy.max recomputed from 60 to 40');
    expect(result.changes).toContain('energy.current clamped from 60 to 40');
    expect(result.warnings).toEqual([]);
  });

  it('does not raise energy.current beyond what the player had when the max grows', () => {
    const mage = magicianCharacter();
    const result = migrateCharacter(mage, withCreation({ magicianStartingEnergy: 80 }));

    // max grows, but a previously-spent current is preserved (here it equals the old max).
    expect(result.character.energy.max).toBe(80);
    expect(result.character.energy.current).toBe(60);
    expect(result.changes).toContain('energy.max recomputed from 60 to 80');
    expect(result.changes).not.toContain('energy.current clamped from 60 to 80');
  });

  it('warns about a chosen skill exceeding a lowered cap without truncating it', () => {
    const fighter = fighterCharacter();
    const chosenPoints = fighter.skills[0].points;

    expect(chosenPoints).toBe(4);

    const toConfig = withCreation({ maxSkillPointsAtCreation: 3 });
    const result = migrateCharacter(fighter, toConfig);

    expect(result.warnings).toContain(
      `skill ${fighter.skills[0].id} has 4 points which exceeds the new creation cap of 3; value preserved`
    );
    // Player choice preserved, NOT truncated to the new cap.
    expect(result.character.skills[0].points).toBe(4);
  });

  it('warns about a chosen spell exceeding a lowered cap without truncating it', () => {
    const mage = magicianCharacter();

    expect(mage.spells[0].points).toBe(2);

    const result = migrateCharacter(mage, withCreation({ maxSpellPointsAtCreation: 1 }));

    expect(result.warnings).toContain(
      `spell ${mage.spells[0].id} has 2 points which exceeds the new creation cap of 1; value preserved`
    );
    expect(result.character.spells[0].points).toBe(2);
  });

  it('warns about an attribute exceeding a lowered per-attribute cap without truncating it', () => {
    const fighter = fighterCharacter();

    // Default offset is 1 against attributeMax 6 -> creation cap 5; strength is 3.
    // Bumping the offset to 4 lowers the cap to 2, so strength 3 now exceeds it.
    const result = migrateCharacter(fighter, withCreation({ attributeMaxOffset: 4 }));

    expect(result.warnings).toContain(
      'attribute strength is 3 which exceeds the new creation cap of 2 for Human; value preserved'
    );
    expect(result.character.attributes.strength).toBe(3);
  });

  it('stamps the target version and leaves player choices unchanged', () => {
    const fighter = fighterCharacter();
    const toConfig: RulesConfig = { ...DEFAULT_RULES_CONFIG, version: 7 };

    const result = migrateCharacter(fighter, toConfig);

    expect(result.character.rulesVersion).toBe(7);
    expect(result.changes).toContain('rulesVersion stamped from 1 to 7');
    // Player choices are preserved verbatim.
    expect(result.character.attributes).toEqual(fighter.attributes);
    expect(result.character.skills).toEqual(fighter.skills);
    expect(result.character.spells).toEqual(fighter.spells);
  });

  it('is a no-op (no warnings) when migrating across the same config and stamps the same version', () => {
    const fighter = fighterCharacter();

    const result = migrateCharacter(fighter, DEFAULT_RULES_CONFIG);

    expect(result.warnings).toEqual([]);
    expect(result.character.rulesVersion).toBe(DEFAULT_RULES_CONFIG.version);
    expect(result.changes).toContain('rulesVersion stamped from 1 to 1');
    expect(result.character.energy).toEqual(fighter.energy);
  });

  it('returns a new object and never mutates the input character', () => {
    const mage = magicianCharacter();
    const snapshotEnergy = { ...mage.energy };
    const snapshotVersion = mage.rulesVersion;

    const result = migrateCharacter(mage, withCreation({ magicianStartingEnergy: 30 }));

    expect(result.character).not.toBe(mage);
    expect(result.character.energy).not.toBe(mage.energy);
    expect(mage.energy).toEqual(snapshotEnergy);
    expect(mage.rulesVersion).toBe(snapshotVersion);
  });
});

function humanRace(): RaceProfile {
  return {
    id: 'humain',
    name: 'Human',
    category: 20,
    vitality: 24,
    speedFactor: 8,
    willFactor: 10,
    attributeMax: Object.fromEntries(
      ATTRIBUTE_KEYS.map((key) => [key, 6])
    ) as RaceProfile['attributeMax']
  };
}

function validAttributes() {
  return {
    strength: 3,
    dexterity: 3,
    stamina: 3,
    reflexes: 2,
    perception: 2,
    intelligence: 2,
    charisma: 2,
    empathy: 2,
    aestheticism: 1
  };
}

function validSkills() {
  return [
    { id: 'epee', points: 4, isMain: true },
    { id: 'course', points: 4 },
    { id: 'chasse', points: 4 },
    { id: 'histoire', points: 4 },
    { id: 'medecine', points: 4 }
  ];
}

function fighterCharacter() {
  return createPlayerCharacter({
    id: 'pc-fighter',
    name: 'Jehan',
    race: humanRace(),
    orientation: { id: 'guerrier', name: 'Guerrier' },
    classProfile: {
      id: 'garde',
      name: 'Garde',
      orientationId: 'guerrier',
      primarySkillIds: ['epee']
    },
    attributes: validAttributes(),
    skills: validSkills()
  });
}

function magicianCharacter() {
  return createPlayerCharacter({
    id: 'pc-mage',
    name: 'Mirelda',
    race: humanRace(),
    orientation: { id: 'magicien', name: 'Magicien', isMagical: true },
    classProfile: {
      id: 'sorcier',
      name: 'Mage',
      orientationId: 'magicien'
    },
    attributes: validAttributes(),
    skills: validSkills(),
    spells: [{ id: 'firebolt', points: 2 }]
  });
}

function withCreation(overrides: Partial<RulesConfig['creation']>): RulesConfig {
  return {
    ...DEFAULT_RULES_CONFIG,
    creation: { ...DEFAULT_RULES_CONFIG.creation, ...overrides }
  };
}
