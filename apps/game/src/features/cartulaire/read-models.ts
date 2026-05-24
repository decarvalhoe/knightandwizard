import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { getCatalogDocument } from '@/lib/catalogs';

import {
  buildCartulaireReadModel,
  type CartulaireReadModel,
  type CityGeometry,
  type CityProperties,
  type GeoJsonFeatureCollection,
  type NationsCatalogDocument,
  type RegionGeometry,
  type RegionProperties
} from './model';

const GEOJSON_CANDIDATE_ROOTS = [
  resolve(process.cwd(), '../interactive-map/public/data/geojson'),
  resolve(process.cwd(), 'apps/interactive-map/public/data/geojson')
] as const;

export async function getCartulaireReadModel(): Promise<CartulaireReadModel> {
  const [nations, regions, cities] = await Promise.all([
    getCatalogDocument<NationsCatalogDocument>('nations.yaml'),
    readGeoJson<GeoJsonFeatureCollection<RegionGeometry, RegionProperties>>('regions.geojson'),
    readGeoJson<GeoJsonFeatureCollection<CityGeometry, CityProperties>>('cities.geojson')
  ]);

  return buildCartulaireReadModel({
    cities,
    nations,
    regions
  });
}

async function readGeoJson<Document>(fileName: string): Promise<Document> {
  const filePath = await resolveGeoJsonPath(fileName);
  const content = await readFile(filePath, 'utf8');

  return JSON.parse(content) as Document;
}

async function resolveGeoJsonPath(fileName: string): Promise<string> {
  for (const root of GEOJSON_CANDIDATE_ROOTS) {
    const filePath = resolve(root, fileName);

    try {
      await access(filePath);
      return filePath;
    } catch {
      // Try the next known workspace cwd layout.
    }
  }

  throw new Error(`Unable to locate interactive-map GeoJSON file ${fileName}.`);
}
