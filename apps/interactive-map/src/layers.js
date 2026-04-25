// Toggle des layers (régions / villes / routes)

export function setupLayerControls(map, layers) {
  const bindings = [
    { id: 'toggle-regions', layer: layers.regions },
    { id: 'toggle-cities', layer: layers.cities },
    { id: 'toggle-routes', layer: layers.routes }
  ];

  bindings.forEach(({ id, layer }) => {
    const cb = document.getElementById(id);
    if (!cb) return;

    cb.addEventListener('change', () => {
      if (cb.checked) {
        layer.addTo(map);
      } else {
        map.removeLayer(layer);
      }
    });

    // Init : si déjà coché, on ajoute
    if (cb.checked && !map.hasLayer(layer)) {
      layer.addTo(map);
    }
  });
}
