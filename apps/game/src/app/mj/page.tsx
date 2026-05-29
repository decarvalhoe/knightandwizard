import { GmCockpit } from '@/features/gm-cockpit/GmCockpit';
import { getSessionManagerReadModel } from '@/features/session-manager/read-models';

export const dynamic = 'force-dynamic';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default async function GmPage({
  searchParams
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const params = await searchParams;
  const slug = normalizeSlug(normalizeSearchParam(params.slug));
  const readModel = await getSessionManagerReadModel(slug);

  return <GmCockpit initialState={readModel.initialState} />;
}

function normalizeSlug(value: string | undefined): string | undefined {
  return value && SLUG_PATTERN.test(value) ? value : undefined;
}

function normalizeSearchParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
