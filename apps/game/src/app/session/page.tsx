import { SessionManager } from '@/features/session-manager/SessionManager';
import { getSessionManagerReadModel } from '@/features/session-manager/read-models';

export const dynamic = 'force-dynamic';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default async function SessionPage({
  searchParams
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const params = await searchParams;
  const rawSlug = params.slug;
  const slug = typeof rawSlug === 'string' && SLUG_PATTERN.test(rawSlug) ? rawSlug : undefined;
  const readModel = await getSessionManagerReadModel(slug);

  return <SessionManager initialState={readModel.initialState} />;
}
