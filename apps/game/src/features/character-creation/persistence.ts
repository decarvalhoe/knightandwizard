import { fromDraftSnapshot, toDraftSnapshot, type CharacterCreationDraft } from './model';

export type DraftSyncState = 'error' | 'idle' | 'offline' | 'saved';

export interface DraftSyncResult {
  detail: string;
  state: DraftSyncState;
}

export const CHARACTER_CREATION_DRAFT_STORAGE_KEY = 'kw.character-creation-draft.v1';

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:3002';

export function saveDraftLocally(draft: CharacterCreationDraft, storage: Storage): DraftSyncResult {
  storage.setItem(CHARACTER_CREATION_DRAFT_STORAGE_KEY, JSON.stringify(toDraftSnapshot(draft)));

  return {
    detail: 'Brouillon local',
    state: 'saved'
  };
}

export function loadDraftLocally(storage: Storage): CharacterCreationDraft | null {
  const rawDraft = storage.getItem(CHARACTER_CREATION_DRAFT_STORAGE_KEY);

  if (!rawDraft) {
    return null;
  }

  try {
    return fromDraftSnapshot(JSON.parse(rawDraft));
  } catch {
    storage.removeItem(CHARACTER_CREATION_DRAFT_STORAGE_KEY);
    return null;
  }
}

export async function syncDraftToApi(draft: CharacterCreationDraft): Promise<DraftSyncResult> {
  const snapshot = toDraftSnapshot(draft);

  try {
    const response = await fetch(
      `${getClientApiBaseUrl()}/character-drafts/${encodeURIComponent(snapshot.id)}`,
      {
        body: JSON.stringify(snapshot),
        headers: {
          'content-type': 'application/json'
        },
        method: 'PUT'
      }
    );

    if (!response.ok) {
      return {
        detail: `API HTTP ${response.status}`,
        state: 'offline'
      };
    }

    return {
      detail: 'API synchronisee',
      state: 'saved'
    };
  } catch (error: unknown) {
    return {
      detail: error instanceof Error ? error.message : 'API indisponible',
      state: 'offline'
    };
  }
}

function getClientApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}
