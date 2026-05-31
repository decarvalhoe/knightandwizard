import { GmCockpit, type GmCockpitNpcTemplate } from '@/features/gm-cockpit/GmCockpit';
import { getBestiaireReadModel } from '@/features/bestiaire/read-models';
import { getSessionManagerReadModel } from '@/features/session-manager/read-models';

export const dynamic = 'force-dynamic';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default async function GmPage({
  searchParams
}: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const params = await searchParams;
  const slug = normalizeSlug(normalizeSearchParam(params.slug));
  const [readModel, bestiaireReadModel] = await Promise.all([
    getSessionManagerReadModel(slug),
    getBestiaireReadModel()
  ]);

  return (
    <GmCockpit
      bestiaryNpcTemplates={toNpcTemplates(bestiaireReadModel.view.entries)}
      initialState={readModel.initialState}
    />
  );
}

function toNpcTemplates(
  entries: Array<{
    categoryLabel: string;
    id: string;
    name: string;
    playable: boolean;
    speedFactor: number;
    vitalityBase: number;
    willFactor: number;
  }>
): GmCockpitNpcTemplate[] {
  return entries
    .filter((entry) => !entry.playable)
    .map((entry) => ({
      categoryLabel: entry.categoryLabel,
      id: entry.id,
      name: entry.name,
      speedFactor: entry.speedFactor,
      vitalityBase: entry.vitalityBase,
      willFactor: entry.willFactor
    }));
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
