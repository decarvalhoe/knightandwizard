export type Emau = 'azur' | 'gueules' | 'or' | 'sinople';

type GeoJsonPosition = [number, number];
type GeoJsonPolygonCoordinates = GeoJsonPosition[][];
type GeoJsonMultiPolygonCoordinates = GeoJsonPosition[][][];

export interface GeoJsonFeatureCollection<Geometry, Properties> {
  features: Array<GeoJsonFeature<Geometry, Properties>>;
  type: 'FeatureCollection';
}

export interface GeoJsonFeature<Geometry, Properties> {
  geometry: Geometry;
  properties: Properties;
  type: 'Feature';
}

export type RegionGeometry =
  | { coordinates: GeoJsonPolygonCoordinates; type: 'Polygon' }
  | { coordinates: GeoJsonMultiPolygonCoordinates; type: 'MultiPolygon' };

export type CityGeometry = { coordinates: GeoJsonPosition; type: 'Point' };

export interface RegionProperties {
  capital?: string | null;
  category?: string | null;
  id: string;
  name: string;
  regional_map?: string | null;
}

export interface CityProperties {
  id: string;
  name: string;
  notes?: string | null;
  parent_region?: string | null;
  role?: string | null;
}

export interface NationsCatalogDocument {
  metadata?: {
    total_entries?: number;
  };
  regions?: NationDocument[];
  version?: number;
}

export interface NationDocument {
  blason?: {
    colors?: string[];
    description?: string;
    symbols?: string[];
  };
  capital?: string | null;
  category?: string;
  government?: string | null;
  id: string;
  metadata?: Record<string, unknown>;
  name: string;
  notable_features?: string[];
  population?: {
    total?: number | string | null;
  };
  surface_km2?: number | null;
}

export interface CartulaireReadModel {
  cities: CartulaireCity[];
  emauxByNation: CartulaireNationEmaux[];
  regions: CartulaireRegion[];
  summary: {
    cities: number;
    nations: number;
    totalPopulation: number;
    vectorRegions: number;
  };
}

export interface CartulaireRegion {
  blasonDescription: string | null;
  capital: string | null;
  category: string;
  emaux: Emau[];
  id: string;
  mapPath: string;
  name: string;
  notableFeatures: string[];
  population: number | null;
  regionalMap: string | null;
  surfaceKm2: number | null;
}

export interface CartulaireCity {
  id: string;
  name: string;
  parentRegionId: string | null;
  parentRegionName: string | null;
  role: string;
  x: number;
  y: number;
}

export interface CartulaireNationEmaux {
  blasonDescription: string | null;
  category: string;
  emaux: Emau[];
  id: string;
  name: string;
}

export interface CartulaireReadModelInput {
  cities: GeoJsonFeatureCollection<CityGeometry, CityProperties>;
  nations: NationsCatalogDocument;
  regions: GeoJsonFeatureCollection<RegionGeometry, RegionProperties>;
}

const BLAZON_COLOR_TO_EMAU: Record<string, Emau> = {
  bleu: 'azur',
  or: 'or',
  rouge: 'gueules',
  vert: 'sinople'
};

export function buildCartulaireReadModel(input: CartulaireReadModelInput): CartulaireReadModel {
  const nations = input.nations.regions ?? [];
  const nationById = new Map(nations.map((nation) => [nation.id, nation]));

  const regions = input.regions.features.map((feature) => {
    const nation = nationById.get(feature.properties.id);

    return {
      blasonDescription: nation?.blason?.description ?? null,
      capital: nation?.capital ?? feature.properties.capital ?? null,
      category: nation?.category ?? feature.properties.category ?? 'region',
      emaux: extractEmaux(nation),
      id: feature.properties.id,
      mapPath: toSvgPath(feature.geometry),
      name: nation?.name ?? feature.properties.name,
      notableFeatures: nation?.notable_features ?? [],
      population: readPopulation(nation),
      regionalMap: feature.properties.regional_map ?? null,
      surfaceKm2: nation?.surface_km2 ?? null
    } satisfies CartulaireRegion;
  });

  const regionNameById = new Map(regions.map((region) => [region.id, region.name]));
  const cities = input.cities.features.map((feature) => ({
    id: feature.properties.id,
    name: feature.properties.name,
    parentRegionId: feature.properties.parent_region ?? null,
    parentRegionName: feature.properties.parent_region
      ? regionNameById.get(feature.properties.parent_region) ?? null
      : null,
    role: feature.properties.role ?? 'town',
    x: feature.geometry.coordinates[0],
    y: invertY(feature.geometry.coordinates[1])
  }));

  return {
    cities,
    emauxByNation: nations.map((nation) => ({
      blasonDescription: nation.blason?.description ?? null,
      category: nation.category ?? 'region',
      emaux: extractEmaux(nation),
      id: nation.id,
      name: nation.name
    })),
    regions,
    summary: {
      cities: cities.length,
      nations: nations.length,
      totalPopulation: nations.reduce((total, nation) => total + (readPopulation(nation) ?? 0), 0),
      vectorRegions: regions.length
    }
  };
}

function extractEmaux(nation: NationDocument | undefined): Emau[] {
  const colors = nation?.blason?.colors ?? [];
  const unique = new Set<Emau>();

  for (const color of colors) {
    const emau = BLAZON_COLOR_TO_EMAU[color.toLowerCase()];

    if (emau) {
      unique.add(emau);
    }
  }

  return [...unique];
}

function readPopulation(nation: NationDocument | undefined): number | null {
  const total = nation?.population?.total;

  if (typeof total === 'number') {
    return Number.isFinite(total) ? total : null;
  }

  if (typeof total === 'string') {
    const parsed = Number(total);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toSvgPath(geometry: RegionGeometry): string {
  if (geometry.type === 'Polygon') {
    return polygonToPath(geometry.coordinates);
  }

  return geometry.coordinates.map(polygonToPath).join(' ');
}

function polygonToPath(polygon: GeoJsonPolygonCoordinates): string {
  return polygon
    .map((ring) =>
      ring
        .map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${format(x)} ${format(invertY(y))}`)
        .join(' ')
        .concat(' Z')
    )
    .join(' ');
}

function invertY(value: number): number {
  return 100 - value;
}

function format(value: number): string {
  return String(Number(value.toFixed(3)));
}
