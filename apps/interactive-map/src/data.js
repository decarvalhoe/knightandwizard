// Chargement des données GeoJSON et YAML enrichis

import yaml from 'js-yaml';

const DATA_DIR = '/data';

export async function loadData() {
  const [regions, cities, nationsYaml, citiesYaml, religionsYaml] = await Promise.all([
    fetchJson(`${DATA_DIR}/geojson/regions.geojson`),
    fetchJson(`${DATA_DIR}/geojson/cities.geojson`),
    fetchYaml(`${DATA_DIR}/raw/nations.yaml`),
    fetchYaml(`${DATA_DIR}/raw/cities-from-maps.yaml`),
    fetchYaml(`${DATA_DIR}/raw/religions.yaml`)
  ]);

  // Indexer les nations par id pour accès O(1)
  const nationsIndex = {};
  if (nationsYaml?.regions) {
    nationsYaml.regions.forEach(n => { nationsIndex[n.id] = n; });
  }

  return {
    regions,
    cities,
    nations: nationsIndex,
    citiesYaml,
    religions: religionsYaml
  };
}

async function fetchJson(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Could not fetch ${url}: ${res.status}`);
      return { type: 'FeatureCollection', features: [] };
    }
    return await res.json();
  } catch (err) {
    console.warn(`Error fetching ${url}:`, err);
    return { type: 'FeatureCollection', features: [] };
  }
}

async function fetchYaml(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Could not fetch ${url}: ${res.status}`);
      return null;
    }
    const text = await res.text();
    return yaml.load(text);
  } catch (err) {
    console.warn(`Error fetching ${url}:`, err);
    return null;
  }
}
