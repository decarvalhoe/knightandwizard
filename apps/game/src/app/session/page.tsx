import { SessionManager } from '@/features/session-manager/SessionManager';
import {
  getSessionManagerReadModel,
  type SessionJoinIdentity
} from '@/features/session-manager/read-models';

export const dynamic = 'force-dynamic';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default async function SessionPage({
  searchParams
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const params = await searchParams;
  const rawSlug = params.slug;
  const slug = typeof rawSlug === 'string' && SLUG_PATTERN.test(rawSlug) ? rawSlug : undefined;
  const readModel = await getSessionManagerReadModel(slug, toSessionJoinIdentity(params));

  return (
    <SessionManager
      currentPlayerId={readModel.currentPlayerId}
      initialState={readModel.initialState}
    />
  );
}

function toSessionJoinIdentity(
  params: Record<string, string | string[] | undefined>
): SessionJoinIdentity {
  const playerId = normalizeSearchParam(params.player);
  const name = normalizeSearchParam(params.name);
  const role = normalizeRole(normalizeSearchParam(params.role));
  const characterId = normalizeSearchParam(params.characterId);
  const capability = normalizeSearchParam(params.capability);

  return {
    ...(capability ? { capability } : {}),
    ...(characterId ? { characterId } : {}),
    ...(name ? { name } : {}),
    ...(playerId ? { playerId } : {}),
    ...(role ? { role } : {})
  };
}

function normalizeRole(value: string | undefined): SessionJoinIdentity['role'] | undefined {
  if (value === 'auto' || value === 'human_gm' || value === 'llm' || value === 'player') {
    return value;
  }

  return undefined;
}

function normalizeSearchParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
