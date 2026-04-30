// Initialisation de la carte Leaflet — fond parchemin K&W

import L from 'leaflet';

// CRS fictif K&W : on utilise CRS.Simple pour des coordonnées arbitraires (0-100)
// au lieu de WGS84. Permet de placer librement les éléments sur le JPG.

export function initMap(elementId) {
  const map = L.map(elementId, {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 5,
    zoomSnap: 0.25,
    attributionControl: true
  });

  // Bornes arbitraires K&W : [[lat=0, lng=0], [lat=100, lng=143]]
  // Le ratio 100/143 correspond approximativement au ratio 590x420 de terres-oubliees.jpg
  const bounds = [
    [0, 0],
    [100, 143]
  ];

  // Fond parchemin (carte mondiale K&W)
  L.imageOverlay('/maps/terres-oubliees.jpg', bounds, {
    attribution: '',
    opacity: 1
  }).addTo(map);

  map.fitBounds(bounds);
  map.setMaxBounds([
    [-20, -20],
    [120, 163]
  ]);

  // Layers groups (vides au départ)
  const layers = {
    regions: L.layerGroup(),
    cities: L.layerGroup(),
    routes: L.layerGroup()
  };

  return { map, layers, bounds };
}
