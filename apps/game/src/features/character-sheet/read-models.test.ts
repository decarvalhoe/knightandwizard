import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPlayerCharacter, type CharacterAttributes } from '@knightandwizard/rules-core';

vi.mock('@/lib/catalogs', () => ({
  getApiBaseUrl: vi.fn(),
  getCatalogDocument: vi.fn()
}));

import { getApiBaseUrl, getCatalogDocument } from '@/lib/catalogs';

import {
  buildEquipmentCatalog,
  buildInventory,
  type PotionsEquipmentDocument,
  type ProtectionsEquipmentDocument,
  type WeaponsEquipmentDocument
} from './model.js';
import { getCharacterSheetReadModel } from './read-models.js';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const weapons: WeaponsEquipmentDocument = {
  weapons: [
    { id: 'epee_batarde', name: 'Épée bâtarde', weight_kg: 2.2 },
    // Parametric weights (string) are intentionally left without a numeric weight.
    { id: 'chaine', name: 'Chaîne', weight_kg: '0.8/1m' },
    // Non-active entries must never reach the inventory picker.
    { id: 'arme_demo', name: 'Arme démo', status: 'deprecated', weight_kg: 1 },
    // Entries missing an id/name are skipped.
    { name: 'Sans id' }
  ]
};

const protections: ProtectionsEquipmentDocument = {
  armor_pieces: [{ id: 'cuir_souple_bonnet', name: 'Bonnet (cuir souple)', weight_kg_human: 0.2 }],
  shields: [{ id: 'bouclier_bois', name: 'Bouclier (bois)', weight_kg_human: 3 }]
};

const potions: PotionsEquipmentDocument = {
  potions: [
    { id: 'soin', name: 'Potion de Soin' },
    { id: 'agrandissement', name: "Potion d'Agrandissement" }
  ]
};

describe('character sheet equipment read-model', () => {
  it('derives the equipment picker from the armes/protections/potions catalogs', () => {
    const catalog = buildEquipmentCatalog({ potions, protections, weapons });

    expect(catalog).toEqual([
      { category: 'weapon', id: 'epee_batarde', name: 'Épée bâtarde', weightKg: 2.2 },
      { category: 'weapon', id: 'chaine', name: 'Chaîne', weightKg: undefined },
      { category: 'shield', id: 'bouclier_bois', name: 'Bouclier (bois)', weightKg: 3 },
      { category: 'armor', id: 'cuir_souple_bonnet', name: 'Bonnet (cuir souple)', weightKg: 0.2 },
      { category: 'consumable', id: 'soin', name: 'Potion de Soin', weightKg: undefined },
      {
        category: 'consumable',
        id: 'agrandissement',
        name: "Potion d'Agrandissement",
        weightKg: undefined
      }
    ]);
  });

  it('excludes non-active and malformed catalog entries from the picker', () => {
    const ids = buildEquipmentCatalog({ potions, protections, weapons }).map((entry) => entry.id);

    expect(ids).not.toContain('arme_demo');
    expect(ids.every((id) => id.length > 0)).toBe(true);
  });

  it('seeds the inventory from canonical catalog ids without inventing items', () => {
    const inventory = buildInventory({ potions, protections, weapons });

    expect(inventory).toEqual([
      {
        category: 'weapon',
        equipped: true,
        id: 'epee_batarde',
        name: 'Épée bâtarde',
        quantity: 1,
        weightKg: 2.2
      },
      {
        category: 'shield',
        equipped: true,
        id: 'bouclier_bois',
        name: 'Bouclier (bois)',
        quantity: 1,
        weightKg: 3
      },
      {
        category: 'consumable',
        id: 'soin',
        name: 'Potion de Soin',
        quantity: 2,
        weightKg: undefined
      }
    ]);
  });

  it('drops a seed slot when its canonical id is absent rather than fabricating one', () => {
    const inventory = buildInventory({
      potions: { potions: [] },
      protections,
      weapons
    });

    expect(inventory.map((item) => item.id)).toEqual(['epee_batarde', 'bouclier_bois']);
  });

  it('loads the current character from the persisted API when characterId is provided', async () => {
    const character = createPlayerCharacter({
      attributes: sampleAttributes,
      classProfile: { id: 'garde', name: 'Garde', orientationId: 'guerrier' },
      equipment: [{ id: 'epee_batarde', name: 'Epee batarde', quantity: 1 }],
      id: 'pc-aveline',
      metadata: { deity: 'Les Trois Flammes', quote: 'La lame engage.' },
      name: 'Aveline API',
      orientation: { id: 'guerrier', isMagical: false, name: 'Guerrier' },
      race: {
        attributeMax: maxAttributes,
        category: 20,
        id: 'humain',
        name: 'Humain',
        speedFactor: 2,
        vitality: 20,
        willFactor: 2
      },
      skills: [
        { id: 'epee-a-une-main', points: 4 },
        { id: 'stoicisme', points: 4 },
        { id: 'commandement', points: 4 },
        { id: 'observation-du-terrain', points: 4 },
        { id: 'bouclier', points: 4 }
      ],
      spells: []
    });
    vi.mocked(getApiBaseUrl).mockReturnValue('http://api.test');
    vi.mocked(getCatalogDocument).mockImplementation(
      async (path: string) => catalogDocuments[path]
    );
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ character, status: 'found' }));
    vi.stubGlobal('fetch', fetchMock);

    const readModel = await getCharacterSheetReadModel({ characterId: 'pc-aveline' });

    expect(fetchMock).toHaveBeenCalledWith('http://api.test/characters/pc-aveline', {
      cache: 'no-store'
    });
    expect(readModel.character.id).toBe('pc-aveline');
    expect(readModel.character.name).toBe('Aveline API');
    expect(readModel.dataSourceLabel).toBe('Personnage API');
    expect(readModel.initialInventory.map((item) => item.id)).toEqual(['epee_batarde']);
  });
});

const sampleAttributes: CharacterAttributes = {
  aestheticism: 1,
  charisma: 2,
  dexterity: 3,
  empathy: 1,
  intelligence: 2,
  perception: 2,
  reflexes: 2,
  stamina: 3,
  strength: 4
};

const maxAttributes: CharacterAttributes = {
  aestheticism: 7,
  charisma: 7,
  dexterity: 7,
  empathy: 7,
  intelligence: 7,
  perception: 7,
  reflexes: 7,
  stamina: 7,
  strength: 7
};

const catalogDocuments: Record<string, unknown> = {
  'armes.yaml': {
    weapons: [{ id: 'epee_batarde', name: 'Epee batarde', status: 'active', weight_kg: 2.2 }]
  },
  'classes.yaml': {
    classes: [
      { id: 'garde', name: 'Garde', orientation_id: 'guerrier', status: 'active' },
      { id: 'enchanteur', name: 'Enchanteur', orientation_id: 'magicien', status: 'active' }
    ]
  },
  'competences.yaml': {
    skills: [
      { id: 'epee-a-une-main', name: 'Epee a une main', status: 'active' },
      { id: 'stoicisme', name: 'Stoicisme', status: 'active' }
    ]
  },
  'orientations.yaml': {
    orientations: [
      { id: 'guerrier', is_magical: false, name: 'Guerrier', status: 'active' },
      { id: 'magicien', is_magical: true, name: 'Magicien', status: 'active' }
    ]
  },
  'potions.yaml': { potions: [] },
  'protections.yaml': { armor_pieces: [], shields: [] },
  'races.yaml': {
    races: [
      {
        attribute_max: maxAttributes,
        id: 'humain',
        name: 'Humain',
        playable: true,
        speed_factor_base: 2,
        status: 'active',
        vitality_base: 20,
        will_factor_base: 2,
        xp_category: 20
      }
    ]
  },
  'spells.yaml': { spells: [] }
};

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    status: 200
  });
}
