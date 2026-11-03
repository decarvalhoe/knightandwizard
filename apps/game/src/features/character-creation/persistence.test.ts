import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCreationDraft, toDraftSnapshot } from './model.js';
import {
  clearFinalizedDraftLocally,
  finalizeDraftToApi,
  saveDraftLocally,
  syncDraftToApi
} from './persistence.js';

const draft = createCreationDraft(
  {
    ambiguityNotices: [],
    assets: [],
    classes: [],
    equipment: [],
    orientations: [],
    races: [],
    skills: [],
    spells: []
  },
  { id: 'draft-save-contract', name: 'Transport contract fixture' }
);

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('character creation persistence contract (D6 creation flow)', () => {
  it('does not erase a newer local draft when an older finalization completes', () => {
    const data = new Map<string, string>();
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => {
        data.set(key, value);
      },
      removeItem: (key: string) => {
        data.delete(key);
      }
    } as Storage;
    saveDraftLocally({ ...draft, id: 'new-draft' }, storage);
    clearFinalizedDraftLocally(draft, storage);
    expect(data.size).toBe(1);
    clearFinalizedDraftLocally({ ...draft, id: 'new-draft' }, storage);
    expect(data.size).toBe(0);
  });

  it('preserves edits to the same draft made while finalization was pending', () => {
    const edited = { ...draft, name: 'Newer edits' };
    const storage = {
      getItem: () => JSON.stringify(toDraftSnapshot(edited)),
      removeItem: vi.fn()
    } as unknown as Storage;
    clearFinalizedDraftLocally(draft, storage);
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it('saves the latest snapshot before finalizing and returns the server identity', async () => {
    const character = { id: 'server-character-id', name: draft.name };
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response({ status: 'saved' }))
      .mockResolvedValueOnce(response({ status: 'finalized', character }, 201));
    vi.stubGlobal('fetch', fetch);
    expect(await finalizeDraftToApi(draft)).toEqual(character);
    expect(fetch.mock.calls[0][0]).toContain(`/character-drafts/${draft.id}`);
    expect(JSON.parse(fetch.mock.calls[0][1].body).payload.name).toBe(draft.name);
    expect(fetch.mock.calls[1][0]).toContain('/characters/finalize');
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ draftId: draft.id });
  });

  it('does not finalize when saving the current draft fails', async () => {
    const fetch = vi.fn().mockResolvedValue(response({}, 503));
    vi.stubGlobal('fetch', fetch);
    await expect(finalizeDraftToApi(draft)).rejects.toThrow(
      'Enregistrement du brouillon impossible'
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('reports a finalization failure and permits a retry using the same draft id', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response({}))
      .mockResolvedValueOnce(response({}, 503))
      .mockResolvedValueOnce(response({}))
      .mockResolvedValueOnce(response({ status: 'finalized', character: { id: 'saved-id' } }, 201));
    vi.stubGlobal('fetch', fetch);
    await expect(finalizeDraftToApi(draft)).rejects.toThrow('API HTTP 503');
    expect((await finalizeDraftToApi(draft)).id).toBe('saved-id');
    expect(
      fetch.mock.calls
        .filter(([, init]) => init.method === 'POST')
        .map(([, init]) => JSON.parse(init.body))
    ).toEqual([{ draftId: draft.id }, { draftId: draft.id }]);
  });

  it('rejects a success response that does not confirm a persisted identity', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response({}))
      .mockResolvedValueOnce(response({ status: 'finalized', character: {} }));
    vi.stubGlobal('fetch', fetch);
    await expect(finalizeDraftToApi(draft)).rejects.toThrow('confirmée par le serveur');
  });

  it('serializes a pending autosave before saving the final snapshot', async () => {
    let release!: (value: Response) => void;
    const firstResponse = new Promise<Response>((resolve) => {
      release = resolve;
    });
    const fetch = vi
      .fn()
      .mockReturnValueOnce(firstResponse)
      .mockResolvedValueOnce(response({}))
      .mockResolvedValueOnce(response({ status: 'finalized', character: { id: 'saved-id' } }));
    vi.stubGlobal('fetch', fetch);
    const autosave = syncDraftToApi({ ...draft, name: 'Older snapshot' });
    await Promise.resolve();
    const finalized = finalizeDraftToApi({ ...draft, name: 'Latest snapshot' });
    await Promise.resolve();
    expect(fetch).toHaveBeenCalledTimes(1);
    release(response({}));
    await autosave;
    await finalized;
    expect(JSON.parse(fetch.mock.calls[1][1].body).payload.name).toBe('Latest snapshot');
    expect(fetch.mock.calls[2][1].method).toBe('POST');
  });
});
