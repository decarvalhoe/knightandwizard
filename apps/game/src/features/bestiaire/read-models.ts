import { getCatalogDocument } from '@/lib/catalogs';

import {
  buildBestiarySurfaceView,
  type BestiaryCatalogDocument,
  type BestiarySurfaceView
} from './model';

export interface BestiaireReadModel {
  view: BestiarySurfaceView;
}

export async function getBestiaireReadModel(): Promise<BestiaireReadModel> {
  const catalog = await getCatalogDocument<BestiaryCatalogDocument>('bestiaire.yaml');

  return {
    view: buildBestiarySurfaceView(catalog)
  };
}
