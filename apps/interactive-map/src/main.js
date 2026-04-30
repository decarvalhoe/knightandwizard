// Knight and Wizard — Carte interactive — entrée principale
// Phase 2 axe A bis — MVP

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { initMap } from './map.js';
import { loadData } from './data.js';
import { setupSearch } from './search.js';
import { setupLayerControls } from './layers.js';

async function bootstrap() {
  console.log('K&W — bootstrap interactive map');

  // 1. Init Leaflet map (carte mondiale comme fond)
  const { map, layers } = initMap('map');

  // 2. Charge les données (GeoJSON + YAML)
  const data = await loadData();

  // 3. Affiche les régions (polygones)
  layers.regions.addTo(map);
  data.regions.features.forEach((feature) => addRegionToLayer(feature, layers.regions, data));

  // 4. Affiche les villes (points)
  layers.cities.addTo(map);
  data.cities.features.forEach((feature) => addCityToLayer(feature, layers.cities, data));

  // 5. Compteurs UI
  document.getElementById('count-regions').textContent = data.regions.features.length;
  document.getElementById('count-cities').textContent = data.cities.features.length;

  // 6. Recherche
  setupSearch(data, (target) => focusOnTarget(map, target));

  // 7. Toggle des layers
  setupLayerControls(map, layers);

  // 8. Panneau info
  document.getElementById('info-close').addEventListener('click', () => {
    document.getElementById('info-panel').classList.add('hidden');
  });

  console.log(
    `Loaded ${data.regions.features.length} regions, ${data.cities.features.length} cities`
  );
}

function addRegionToLayer(feature, layer, data) {
  const polygon = L.geoJSON(feature, {
    style: () => ({
      color: feature.properties.color || '#8b3a1f',
      weight: 1.5,
      fillOpacity: 0.15,
      fillColor: feature.properties.color || '#c66a3f'
    })
  });

  polygon.on('click', () => {
    showRegionInfo(feature, data);
  });

  polygon.bindTooltip(feature.properties.name, {
    className: 'region-label',
    sticky: true,
    direction: 'center'
  });
  polygon.addTo(layer);
}

function addCityToLayer(feature, layer, data) {
  const [lng, lat] = feature.geometry.coordinates;
  const role = feature.properties.role || 'town';

  const marker = L.divIcon({
    className: `city-marker-${role}`,
    iconSize: [10, 10]
  });

  const point = L.marker([lat, lng], { icon: marker });

  point.bindTooltip(feature.properties.name, {
    className: 'city-label',
    permanent: role === 'capital' || role === 'major_city',
    direction: 'right',
    offset: [8, 0]
  });

  point.on('click', () => {
    showCityInfo(feature, data);
  });

  point.addTo(layer);
}

function showRegionInfo(feature, data) {
  const panel = document.getElementById('info-panel');
  const content = document.getElementById('info-content');
  const props = feature.properties;

  const region = data.nations[props.id] || {};
  const blasonHtml = props.blason_image
    ? `<img class="blason" src="${props.blason_image}" alt="Blason ${props.name}">`
    : '';

  content.innerHTML = `
    ${blasonHtml}
    <h2>${props.name}</h2>
    <dl>
      ${region.capital ? `<dt>Capitale</dt><dd>${region.capital}</dd>` : ''}
      ${region.gentile ? `<dt>Gentilé</dt><dd>${Array.isArray(region.gentile) ? region.gentile.join(' / ') : region.gentile}</dd>` : ''}
      ${region.official_language ? `<dt>Langue</dt><dd>${region.official_language}</dd>` : ''}
      ${region.official_religion ? `<dt>Religion</dt><dd>${region.official_religion}</dd>` : ''}
      ${region.government ? `<dt>Gouvernement</dt><dd>${region.government}</dd>` : ''}
      ${region.population?.total ? `<dt>Population</dt><dd>${region.population.total.toLocaleString()}</dd>` : ''}
      ${region.surface_km2 ? `<dt>Surface</dt><dd>${region.surface_km2.toLocaleString()} km²</dd>` : ''}
    </dl>
    ${
      region.notable_features?.length
        ? `
      <h3>À noter</h3>
      <ul>${region.notable_features.map((f) => `<li>${f}</li>`).join('')}</ul>
    `
        : ''
    }
    ${
      props.regional_map
        ? `
      <h3>Carte régionale</h3>
      <a href="${props.regional_map}" target="_blank"><img src="${props.regional_map}" alt="Carte ${props.name}" style="width:100%; border:1px solid var(--ink);"></a>
    `
        : ''
    }
  `;

  panel.classList.remove('hidden');
}

function showCityInfo(feature, data) {
  const panel = document.getElementById('info-panel');
  const content = document.getElementById('info-content');
  const props = feature.properties;
  const region = data.nations[props.parent_region] || {};

  content.innerHTML = `
    <h2>${props.name}</h2>
    <dl>
      <dt>Type</dt><dd>${props.role || 'town'}</dd>
      <dt>Région</dt><dd>${region.name || props.parent_region}</dd>
      ${props.notes ? `<dt>Notes</dt><dd>${props.notes}</dd>` : ''}
    </dl>
  `;

  panel.classList.remove('hidden');
}

function focusOnTarget(map, target) {
  if (target.type === 'region') {
    const layer = L.geoJSON(target.feature);
    map.fitBounds(layer.getBounds(), { padding: [50, 50] });
    showRegionInfo(target.feature, target.data);
  } else if (target.type === 'city') {
    const [lng, lat] = target.feature.geometry.coordinates;
    map.setView([lat, lng], 6);
    showCityInfo(target.feature, target.data);
  }
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  document.getElementById('map').innerHTML = `
    <div style="padding:2rem; color:#e8d8b0; text-align:center;">
      <h2>Échec du chargement</h2>
      <p>${err.message}</p>
      <p>Vérifiez que les fichiers GeoJSON sont présents dans <code>data/geojson/</code>.</p>
      <p>Lancez <code>python tools/yaml_to_geojson.py</code> pour les générer.</p>
    </div>
  `;
});
