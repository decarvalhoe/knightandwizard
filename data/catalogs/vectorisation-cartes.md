# Vectorisation des cartes K&W → cartes interactives

> Guide d'outils et workflow recommandé pour transformer les 16 cartes JPG existantes (K&W) en cartes web interactives avec villes cliquables, popups, recherche, navigation.

**Date** : 2026-04-25
**Contexte** : Phase 2 axe A bis — étendre les imports avec une couche visuelle interactive.

---

## 1. État actuel des assets

| Asset | Quantité | Format | Localisation |
|---|---:|---|---|
| Cartes haute résolution | 16 | JPG | `site/download/map/` |
| Cartes web (compressées) | 3 | JPG | `site/img/maps/` |
| Blasons / drapeaux | 10 | JPG | `site/img/flags/` |
| Villes structurées | ~280 | YAML | `catalogs/cities-from-maps.yaml` |
| Nations | 29 | YAML | `catalogs/nations.yaml` |
| Lore (descriptions) | dense | YAML/MD | `catalogs/nations.yaml`, `lore-index.yaml` |

**Ce qui manque pour rendre les cartes interactives** :
1. **Coordonnées lat/lng fictives** par ville et frontière (aujourd'hui : noms seuls dans le YAML)
2. **Polygones de frontières** par nation (digitalisation depuis les JPG)
3. **Frontend de rendu** (carte cliquable avec popups)

---

## 2. Approches techniques (4 options évaluées)

### Option A — QGIS + Mapbox (référence professionnelle)

**Workflow** :
1. **QGIS Georeferencer** : assigner des coordonnées fictives (système K&W) à chaque JPG via points de contrôle.
2. **Digitalisation manuelle** : tracer les frontières (polygones) et placer les villes (points) dans QGIS.
3. **Export GeoJSON** : un fichier par couche (nations, villes, routes, lieux).
4. **Mapbox Studio** : importer GeoJSON, créer un style custom (parchemin, polices fantasy).
5. **Mapbox GL JS** : intégrer la carte stylisée dans le frontend web avec popups, zoom, animation.

**Avantages** :
- Workflow professionnel utilisé par cartographes fantasy (Ross Thorn).
- Excellent rendu visuel (tuiles vectorielles, antialiasing parfait, zoom infini).
- Données réutilisables (GeoJSON est un standard universel).
- Performance haute (WebGL).

**Inconvénients** :
- Mapbox = service commercial (free tier généreux, mais payant à grande échelle).
- Estimation Ross Thorn : **13-20h par continent** pour vectorisation soignée.
- Apprentissage QGIS requis (1-2 jours pour les bases).

**Coût pour K&W** : **15 cartes régionales × 13-20h ≈ 200-300h** pour vectorisation complète. Pratique si on cible une carte par mois.

---

### Option B — QGIS + Leaflet (open source pur)

**Workflow** :
1. **QGIS Georeferencer** : idem option A.
2. **Digitalisation** : idem.
3. **Plugin qgis2web** ou **qgis2leaf** : génère automatiquement une page HTML/JS avec Leaflet.js depuis le projet QGIS.
4. **Personnalisation** : ajustements manuels du HTML/JS pour styles custom et popups.

**Avantages** :
- 100% open source, gratuit à vie.
- Leaflet.js = lib mature, très répandue, légère (39 KB).
- Sortie standalone (peut être hébergée sur n'importe quel serveur statique).
- Personnalisation totale via JavaScript.

**Inconvénients** :
- Rendu moins beau que Mapbox (raster tiles ou SVG basiques).
- qgis2web a quelques limitations sur les styles complexes.
- Idem temps de digitalisation.

**Coût pour K&W** : **identique à A** côté digitalisation, mais **0€ en hébergement**.

**Recommandé pour K&W** : ✅ — meilleur rapport qualité/effort/coût pour un projet RPG personnel.

---

### Option C — SVG manuel + D3.js (hybride léger)

**Workflow** :
1. **Inkscape** : importer le JPG comme calque de fond.
2. **Tracer manuellement** chaque frontière avec l'outil polygone.
3. **Affecter un `id` ou `data-region`** à chaque polygone.
4. **Placer les villes** comme `<circle>` SVG avec attributs `data-city`.
5. **Exporter en SVG**.
6. **D3.js dans le navigateur** : charger le SVG, ajouter les listeners (click, hover, tooltip).
7. **Bind les données** depuis `nations.yaml`, `cities-from-maps.yaml`.

**Avantages** :
- Pas de georéférencement nécessaire (SVG = coordonnées arbitraires).
- Préserve **exactement** l'esthétique des JPG originaux (pas de re-stylage).
- Léger (1 fichier SVG + 1 fichier JS).
- Excellent pour un site statique.

**Inconvénients** :
- **Pas de zoom infini** (SVG perd en qualité au-delà d'un certain niveau).
- Tracé manuel = lent et fastidieux.
- Pas d'optimisation pour mobile.
- Difficile à étendre (ajouter une nouvelle nation = retracer).

**Coût pour K&W** : **5-10h par carte** pour tracé manuel rapide. Total ~80-160h.

**Recommandé si** : pas besoin de zoom natif, esthétique JPG préservée prioritaire.

---

### Option D — Vectorisation auto (IA / algorithmique)

**Outils principaux** :
- **Vectorizer.AI** (commercial, 0.20$/image, qualité IA très élevée)
- **Adobe Illustrator Image Trace** (commercial, déjà très bon)
- **Inkscape Trace Bitmap** (gratuit, basé sur Potrace, qualité variable)
- **Potrace** (CLI, open source, qualité ok pour formes simples)
- **autotrace** (CLI, open source)
- **Picterra** / **Mapflow** (ML pour cartes satellites, **pas adapté** aux cartes fantasy stylisées)

**Workflow** :
1. Soumettre les JPG à un vectoriseur.
2. Récupérer un SVG vectoriel.
3. Nettoyer manuellement (l'auto-trace produit beaucoup de bruit sur les textures parchemin).
4. Continuer avec Option C ou ajouter des couches de données.

**Avantages** :
- Rapide (5-30 min par carte avec Vectorizer.AI).
- Préserve les détails graphiques.

**Inconvénients** :
- **Le résultat n'est PAS sémantique** : on obtient des polygones de couleur, pas des "frontières de nation".
- Nécessite un travail manuel post-trace pour identifier régions/villes/textes.
- Les cartes K&W (parchemin texturé, calligraphie) sont **mal adaptées** au tracé auto — beaucoup de bruit.
- Vectorizer.AI seul ne donne pas de **données structurées** utilisables par Leaflet/Mapbox.

**Recommandé** : ❌ pas pour cartographie sémantique. ⚠️ utile uniquement pour produire un rendu vectoriel décoratif.

---

### Option E — Azgaar Fantasy Map Generator (régénération)

**Workflow** :
1. **Régénérer** les cartes K&W dans Azgaar à partir des paramètres de monde (tailles régions, bordures, nations).
2. Azgaar produit nativement **GeoJSON, SVG, et tuiles compatibles Leaflet/Mapbox**.
3. Importer le tout dans le frontend.

**Avantages** :
- Workflow tout-en-un, gratuit, open source.
- Sortie directement utilisable (GeoJSON + SVG + tuiles).
- Inclut le générateur de villes, marquage politique, etc.
- Conversion native vers Mapbox via projet `chriswhong/mapbox-fantasy-map-generator`.

**Inconvénients** :
- **Perd l'esthétique unique des cartes K&W** (Azgaar a son propre style généré).
- Nécessite de réimporter manuellement les noms des 280 villes existantes.
- Les frontières seraient régénérées, pas exactement identiques aux cartes originales.

**Recommandé si** : on veut repartir d'une base technique solide en acceptant un changement esthétique.

---

### Option F — georender (2026, spécialisé fantasy)

**Workflow** :
1. Préparer les données K&W en **GeoJSON** (frontières, villes).
2. Définir un **ruleset JSON** déclaratif (couleurs par type de région, icônes par taille de ville, etc.).
3. Déployer le service `georender` (Docker, container-native).
4. Le service expose une **REST API** qui sert des PNG de tuiles "slippy-map".
5. Frontend Leaflet/Mapbox consomme ces tuiles.

**Avantages** :
- **Spécifiquement conçu pour fantasy maps** (pas Earth-centric).
- Open source (Apache 2.0).
- Container-native, API-first, reproductible.
- Rulesets versionnés comme du code.

**Inconvénients** :
- Récent (Avril 2026), encore peu d'exemples.
- Ne fait que le rendu — pas de digitalisation (besoin d'autre outil pour produire les GeoJSON).
- Sortie PNG seulement (pas de vector tile server natif).
- Nécessite déjà des données GeoJSON propres en entrée.

**Recommandé** : ✅ excellent **pour le rendu** une fois les données digitalisées avec QGIS. Complémentaire à l'option B.

---

## 3. Workflow recommandé pour K&W

### Stack recommandée (option B+ enrichie)

```
[JPG cartes]  →  [QGIS digitalisation]  →  [GeoJSON]  →  [Leaflet.js + frontend]
                                                    ↓
                                             [nations.yaml + cities-from-maps.yaml]
                                                    ↓
                                             popups dynamiques (lore, blasons, organisations)
```

### Étapes détaillées

#### Phase 1 — Setup (3-5h)

1. Installer **QGIS 3.44+** (gratuit) : https://qgis.org/download/
2. Définir un **CRS fictif K&W** (système de coordonnées arbitraire). Recommandation : utiliser `EPSG:4326` (WGS84) avec coordonnées arbitraires entre 0-100 pour simplifier.
3. Créer un projet QGIS K&W avec :
   - Couche raster pour chaque JPG (16 cartes).
   - Georeferencer chaque JPG (4 GCPs minimum par carte, transformation polynomiale 2).

#### Phase 2 — Digitalisation carte mondiale (8-12h)

4. Importer `terres-oubliees.jpg` (carte mondiale).
5. Créer une couche vector `regions_polygones` :
   - Tracer les frontières des **29 nations** comme polygones.
   - Champ `id` = id de `nations.yaml` (cortega, alteria, etc.).
6. Créer une couche vector `villes_points` :
   - Importer `cities-from-maps.yaml` ; pour chaque ville, placer un point.
   - Champ `id`, `name`, `parent_region`, `role`.
7. Créer une couche vector `routes_lignes` (optionnel) :
   - Routes de voyage, fleuves principaux.

#### Phase 3 — Digitalisation cartes régionales (16-24h)

8. Pour chaque carte régionale (15) :
   - Georéférencer dans le système K&W.
   - Affiner les frontières (la carte régionale a plus de détails que la mondiale).
   - Placer les villes manquantes (celles qui n'apparaissent pas sur la mondiale).
   - **Estimation : 1-1.5h par carte régionale.**

#### Phase 4 — Export et intégration web (4-8h)

9. Exporter les couches vectorielles en **GeoJSON** :
   - `regions.geojson` (frontières des nations)
   - `cities.geojson` (toutes les villes)
   - `routes.geojson` (optionnel)
10. Initialiser un projet web :
    - HTML + Leaflet.js + JS vanilla (ou Vue/React si déjà un framework).
    - Import des GeoJSON.
    - Bind avec `nations.yaml`, `cities-from-maps.yaml`, `religions.yaml`, `organisations.yaml` pour popups riches.
11. Styles :
    - Fond parchemin (texture du JPG mondial comme tuile).
    - Polygones nations transparents (cliquables).
    - Markers villes par catégorie (capital / major_city / town).

#### Phase 5 — Polissage (4-8h)

12. Ajouter :
    - Recherche par nom de ville/nation.
    - Filtres (afficher uniquement les capitales, ou les villes d'une certaine race).
    - Popups avec image (blason, carte régionale, descriptifs lore).
    - Mode tour-par-tour pour suivi de campagne (positions des PJ).
    - Layer basculable : politique / géographique / religieux / commercial.

### Estimation totale

| Phase | Heures |
|---|---:|
| Setup | 3-5 |
| Carte mondiale digitalisée | 8-12 |
| 15 cartes régionales | 16-24 |
| Export et intégration | 4-8 |
| Polissage | 4-8 |
| **Total** | **35-57h** |

Soit **~1 mois part-time** pour produire une expérience cartographique web complète.

---

## 4. Outils recommandés (téléchargements)

### Indispensables (gratuits)

| Outil | Rôle | URL | OS |
|---|---|---|---|
| **QGIS 3.44+** | Georéférencement + digitalisation | https://qgis.org/download/ | Win/Mac/Linux |
| **Leaflet.js** | Lib JS interactive | https://leafletjs.com/ | Web |
| **GeoJSON.io** | Visualisation rapide GeoJSON | https://geojson.io/ | Web |
| **Inkscape** | Édition SVG (option C ou retouches blasons) | https://inkscape.org/ | Win/Mac/Linux |

### Optionnels selon préférence

| Outil | Cas d'usage | Coût |
|---|---|---|
| **Mapbox Studio + GL JS** | Si rendu pro très soigné requis | Free tier généreux, payant à grande échelle |
| **D3.js** | Visualisations data avancées (heatmaps, flux migratoires) | Gratuit |
| **georender** | Rendu côté serveur fantasy-aware | Gratuit (Apache 2.0) |
| **Azgaar's FMG** | Régénération de cartes from scratch | Gratuit |
| **qgis2web** plugin | Export auto QGIS → Leaflet | Gratuit |
| **OpenLayers** | Alternative Leaflet (plus puissant, plus complexe) | Gratuit |

### Plugins QGIS utiles

- `qgis2web` : export rapide vers Leaflet/Mapbox/OpenLayers
- `Freehand Raster Georeferencer` : georéférencement rapide pour cartes fantaisie
- `MMQGIS` : opérations vectorielles avancées
- `QuickMapServices` : ajout de fonds de carte (utile pour comparer)

---

## 5. Format des données pour Phase 2B (implémentation)

### Schéma `regions.geojson`

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Polygon", "coordinates": [...] },
      "properties": {
        "id": "cortega",
        "name": "Cortega",
        "ref_yaml": "nations.yaml#cortega",
        "blason_image": "site/img/flags/8.jpg",
        "regional_map": "site/download/map/cortega.jpg",
        "color": "#aa3322"
      }
    }
  ]
}
```

### Schéma `cities.geojson`

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [lng, lat] },
      "properties": {
        "id": "erune",
        "name": "Erune",
        "parent_region": "alteria",
        "role": "capital",
        "ref_yaml": "cities-from-maps.yaml#erune",
        "icon": "city_capital"
      }
    }
  ]
}
```

### Code Leaflet minimal

```javascript
const map = L.map('map').setView([50, 50], 4);

// Fond parchemin
L.imageOverlay('site/download/map/terres-oubliees.jpg', [[0,0], [100,100]]).addTo(map);

// Régions cliquables
fetch('regions.geojson').then(r => r.json()).then(data => {
  L.geoJSON(data, {
    style: feature => ({ fillColor: feature.properties.color, weight: 1, fillOpacity: 0.3 }),
    onEachFeature: (feature, layer) => {
      layer.bindPopup(`<h3>${feature.properties.name}</h3><img src="${feature.properties.blason_image}"/>`);
      layer.on('click', () => loadNationDetails(feature.properties.ref_yaml));
    }
  }).addTo(map);
});

// Villes
fetch('cities.geojson').then(r => r.json()).then(data => {
  L.geoJSON(data, {
    pointToLayer: (feature, latlng) => L.marker(latlng, { icon: getIconByRole(feature.properties.role) }),
    onEachFeature: (feature, layer) => {
      layer.bindTooltip(feature.properties.name);
    }
  }).addTo(map);
});
```

---

## 6. Recommandation finale

### Pour K&W spécifiquement

**Stack recommandée** : **Option B (QGIS + Leaflet)** enrichie avec **georender** en option pour un rendu serveur de qualité.

**Pourquoi** :
- 100% open source, gratuit à vie.
- Workflow standard de l'industrie cartographique (réutilisable, documenté).
- Préserve l'esthétique des JPG originaux comme fond.
- Sortie GeoJSON = standard universel (réutilisable plus tard avec d'autres frontends).
- Estimation 35-57h pour expérience complète, faisable en quelques mois part-time.

**Phasage recommandé** :
1. **MVP (8-12h)** : carte mondiale interactive avec frontières des 29 nations cliquables → popups texte.
2. **V1 (+16-24h)** : 15 cartes régionales avec villes cliquables → popups texte + blason.
3. **V2 (+8-16h)** : recherche, filtres, navigation entre cartes, layer politique/religieux.
4. **V3 (Phase 3)** : intégration runtime de campagne (positions PJ, événements, brouillard de guerre).

### Ne pas faire

- ❌ Vectorisation auto (Vectorizer.AI, Potrace) seule : produit du bruit, pas de sémantique.
- ❌ Régénération via Azgaar : perd l'esthétique unique des cartes K&W existantes.
- ❌ Tout faire en SVG manuel : trop fastidieux pour 16 cartes, peu maintenable.

---

## 7. Backlog pour cette extension

### Q-D12.31 — 🟡 Vectorisation effective des 16 cartes en GeoJSON

**Contexte** : ce document a été produit pour ce backlog. Travail à faire (35-57h estimées).

### Q-D12.32 — 🟡 Frontend cartographique interactif (Leaflet)

**Contexte** : implémentation web après vectorisation.

### Q-D12.33 — 🟡 Système de coordonnées K&W (CRS fictif)

**Contexte** : convention à adopter (EPSG:4326 arbitraire vs CRS personnalisé). Impact migration future.

### Q-D12.34 — 🟡 Intégration cartographique avec moteur de campagne (Phase 3)

**Contexte** : positions PJ live, brouillard de guerre, voyage en temps réel (lien D9 R-9.32 déplacement).

---

## Sources consultées

- [Interactive Fantasy Web Maps — Ross Thorn](https://rossthorn.github.io/interactivefantasymaps.html)
- [Azgaar's Fantasy Map Generator](https://azgaar.github.io/Fantasy-Map-Generator/)
- [georender: Symbolic Map Rendering for Fantasy and Fictional Worlds](https://medium.com/openfantasymap/georender-symbolic-map-rendering-for-fantasy-and-fictional-worlds-adf5c4c8af43)
- [Best Fantasy Map Generators 2026 — Robb Wallace](https://www.robbwallace.co.uk/news/best-fantasy-map-generators/)
- [QGIS Tutorials — Leaflet Web Maps with qgis2leaf](https://www.qgistutorials.com/en/docs/leaflet_maps_with_qgis2leaf.html)
- [QGIS Documentation — Georeferencer](https://docs.qgis.org/3.44/en/docs/user_manual/managing_data_source/georeferencer.html)
- [Leaflet documentation](https://leafletjs.com/reference.html)
- [How to Create Interactive SVG Maps — Bomberbot](https://www.bomberbot.com/svg/how-to-create-interactive-svg-maps-a-developers-guide/)
- [Leaflet + D3 — Mulberry House Software](https://www.mulberryhousesoftware.com/articles/leaflet-d3)
- [Mapbox Fantasy Map Generator (chriswhong)](https://chriswhong.github.io/mapbox-fantasy-map-generator/)
