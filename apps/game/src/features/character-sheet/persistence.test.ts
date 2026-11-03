import { afterEach, describe, expect, it, vi } from 'vitest';
import { InventorySaveError, saveCharacterInventory } from './persistence';

afterEach(() => vi.unstubAllGlobals());
describe('inventory persistence', () => {
  it('sends only ids/quantities and the previous snapshot, returns server equipment', async () => {
    const character = { id: 'character-a', equipment: [{ id: 'soin', quantity: 2, name: 'Soin' }] };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ character })));
    vi.stubGlobal('fetch', fetchMock);
    expect(
      await saveCharacterInventory(
        'character-a',
        [{ id: 'soin', name: 'untrusted', quantity: 2 }],
        [{ id: 'soin' }]
      )
    ).toEqual(character);
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual({
      equipment: [{ id: 'soin', quantity: 2 }],
      expectedEquipment: [{ id: 'soin', quantity: 1 }]
    });
    expect(fetchMock.mock.calls[0]![1].method).toBe('PUT');
  });
  it('surfaces API failure and permits retry with the same snapshot', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ character: { id: 'a', equipment: [] } }))
      );
    vi.stubGlobal('fetch', fetchMock);
    await expect(saveCharacterInventory('a', [], [])).rejects.toThrow('API HTTP 503');
    await expect(saveCharacterInventory('a', [], [])).resolves.toMatchObject({
      id: 'a',
      equipment: []
    });
  });
  it('distinguishes conflict from retryable failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 409 })));
    await expect(saveCharacterInventory('a', [], [])).rejects.toMatchObject({ conflict: true });
  });
  it('rejects malformed success without pretending a save succeeded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}')));
    await expect(saveCharacterInventory('a', [], [])).rejects.toBeInstanceOf(InventorySaveError);
  });
});
