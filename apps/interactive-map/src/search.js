// Barre de recherche multi-cible (régions + villes)

export function setupSearch(data, onSelect) {
  const input = document.getElementById('search');
  const results = document.getElementById('search-results');

  // Index combiné
  const index = [
    ...data.regions.features.map((f) => ({
      type: 'region',
      label: f.properties.name,
      role: f.properties.category || 'nation',
      feature: f,
      data
    })),
    ...data.cities.features.map((f) => ({
      type: 'city',
      label: f.properties.name,
      role: f.properties.role || 'town',
      sublabel: f.properties.parent_region,
      feature: f,
      data
    }))
  ];

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) {
      results.classList.remove('visible');
      results.innerHTML = '';
      return;
    }

    const matches = index.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 12);

    if (matches.length === 0) {
      results.innerHTML = '<li style="font-style:italic; color:#888;">Aucun résultat</li>';
      results.classList.add('visible');
      return;
    }

    results.innerHTML = matches
      .map(
        (m, i) => `
      <li data-idx="${i}">
        ${m.label}
        <span class="role-label">${m.type === 'region' ? '⛰' : '🏘'} ${m.role}${m.sublabel ? ` · ${m.sublabel}` : ''}</span>
      </li>
    `
      )
      .join('');

    results.querySelectorAll('li').forEach((li, i) => {
      li.addEventListener('click', () => {
        const target = matches[i];
        onSelect(target);
        results.classList.remove('visible');
        input.value = target.label;
      });
    });

    results.classList.add('visible');
  });

  // Cliquer ailleurs ferme le menu
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.classList.remove('visible');
    }
  });
}
