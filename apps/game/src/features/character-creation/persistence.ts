import type { Character } from '@knightandwizard/rules-core';
import { fromDraftSnapshot, toDraftSnapshot, type CharacterCreationDraft } from './model';

export type DraftSyncState = 'error' | 'idle' | 'offline' | 'saved';

export interface DraftSyncResult {
  detail: string;
  state: DraftSyncState;
}

export const CHARACTER_CREATION_DRAFT_STORAGE_KEY = 'kw.character-creation-draft.v1';

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:3002';
const pendingDraftSaves = new Map<string, Promise<DraftSyncResult>>();

export function saveDraftLocally(draft: CharacterCreationDraft, storage: Storage): DraftSyncResult {
  storage.setItem(CHARACTER_CREATION_DRAFT_STORAGE_KEY, JSON.stringify(toDraftSnapshot(draft)));

  return {
    detail: 'Brouillon local',
    state: 'saved'
  };
}

export function clearFinalizedDraftLocally(draft: CharacterCreationDraft, storage: Storage): void {
  // A request can complete after navigation; preserve a newer draft or edits.
  const current = loadDraftLocally(storage);
  if (
    current?.id === draft.id &&
    JSON.stringify(toDraftSnapshot(current).payload) ===
      JSON.stringify(toDraftSnapshot(draft).payload)
  ) {
    storage.removeItem(CHARACTER_CREATION_DRAFT_STORAGE_KEY);
  }
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

export function syncDraftToApi(draft: CharacterCreationDraft): Promise<DraftSyncResult> {
  // An older autosave must not overwrite the snapshot used for finalization.
  const previous = pendingDraftSaves.get(draft.id) ?? Promise.resolve();
  const pending = previous.then(() => writeDraftToApi(draft));
  pendingDraftSaves.set(draft.id, pending);
  void pending.then(() => {
    if (pendingDraftSaves.get(draft.id) === pending) {
      pendingDraftSaves.delete(draft.id);
    }
  });
  return pending;
}

export async function finalizeDraftToApi(draft: CharacterCreationDraft): Promise<Character> {
  const saved = await syncDraftToApi(draft);
  if (saved.state !== 'saved') {
    throw new Error(`Enregistrement du brouillon impossible : ${saved.detail}`);
  }

  const response = await fetch(`${getClientApiBaseUrl()}/characters/finalize`, {
    body: JSON.stringify({ draftId: draft.id }),
    headers: { 'content-type': 'application/json' },
    method: 'POST'
  });
  if (!response.ok) {
    throw new Error(
      `Création impossible (API HTTP ${response.status}). Réessayez sans effacer le brouillon.`
    );
  }
  const result = await response.json();
  if (
    result.status !== 'finalized' ||
    typeof result.character?.id !== 'string' ||
    !result.character.id
  ) {
    throw new Error('La sauvegarde du personnage n’a pas été confirmée par le serveur.');
  }
  return result.character as Character;
}

async function writeDraftToApi(draft: CharacterCreationDraft): Promise<DraftSyncResult> {
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
