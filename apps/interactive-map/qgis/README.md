# QGIS Project — Knight and Wizard

Ce dossier contient le projet QGIS pour la **digitalisation des cartes** (Phase 2B itération 2).

## Prérequis

### QGIS 3.44 LTR (recommandé)

Installation Windows :

```powershell
# Via winget (Windows 10+)
winget install --id OSGeo.QGIS_LTR

# Via Chocolatey
choco install qgis-ltr

# OU télécharger depuis https://qgis.org/download/
```

Installation macOS / Linux : voir [qgis.org/download/](https://qgis.org/download/).

### Plugins QGIS recommandés

Une fois QGIS lancé, installer via *Extensions → Installer/Gérer les extensions* :

- **qgis2web** — export auto vers Leaflet (alternative à notre frontend custom)
- **MMQGIS** — opérations vectorielles avancées
- **Freehand Raster Georeferencer** — georéférencement rapide des cartes fantasy

## Structure du projet QGIS

```
qgis/
├── README.md                    # Ce fichier
├── kw-world.qgz                 # Projet QGIS principal (à créer)
├── layers/                      # Couches vectorielles produites
│   ├── regions.gpkg             # Polygones des nations (sortie QGIS)
│   ├── cities.gpkg              # Points des villes
│   └── routes.gpkg              # (optionnel) routes / fleuves
├── snapshots/                   # Captures écran pour validation
└── styles/                      # Styles QML (optionnel)
```

## Workflow de digitalisation

### Étape 1 — Créer le projet QGIS

1. Ouvrir QGIS.
2. Menu **Projet → Nouveau**.
3. Définir le CRS : **EPSG:4326** (WGS84) — on l'utilise comme système arbitraire.
4. Enregistrer sous `apps/interactive-map/qgis/kw-world.qgz`.

### Étape 2 — Charger la carte mondiale comme référence raster

1. Menu **Couche → Ajouter une couche → Ajouter une couche raster**.
2. Sélectionner `apps/interactive-map/public/maps/terres-oubliees.jpg`.
3. **Géoréférencer** : menu **Raster → Géoréférenceur** :
   - Ouvrir le raster.
   - Ajouter ≥ 4 points de contrôle (GCP) :
     - Coin haut-gauche : `(0, 100)` lat=100, lng=0
     - Coin haut-droit : `(143, 100)` lat=100, lng=143
     - Coin bas-gauche : `(0, 0)`
     - Coin bas-droit : `(143, 0)`
   - Type de transformation : **Polynomiale 2** (préserve la géométrie).
   - Valider.

### Étape 3 — Créer les couches vectorielles

#### Couche `regions` (polygones)

1. Menu **Couche → Créer une couche → Nouvelle couche GeoPackage**.
2. Nom : `regions`, fichier : `apps/interactive-map/qgis/layers/regions.gpkg`.
3. Type de géométrie : **Polygone**.
4. Champs à ajouter :
   - `id` (texte, 64) — slug de la nation (ex: `cortega`)
   - `name` (texte, 128) — nom affiché
   - `category` (texte, 32) — `nation` / `wilderness` / `mountain_range` / `location`
   - `color` (texte, 16) — couleur hex (ex: `#aa3322`)
5. Valider.

#### Couche `cities` (points)

1. Menu **Couche → Créer une couche → Nouvelle couche GeoPackage**.
2. Nom : `cities`, fichier : `apps/interactive-map/qgis/layers/cities.gpkg`.
3. Type de géométrie : **Point**.
4. Champs :
   - `id` (texte, 64)
   - `name` (texte, 128)
   - `parent_region` (texte, 64)
   - `role` (texte, 32) — `capital` / `major_city` / `town` / `village`

#### Couche `routes` (lignes, optionnel)

1. Géométrie : **LineString**.
2. Champs : `id`, `name`, `type` (`road` / `river` / `border`).

### Étape 4 — Tracer les frontières

1. Sélectionner la couche `regions`.
2. Cliquer sur **Basculer en mode édition** (icône crayon).
3. Cliquer **Ajouter une entité polygone**.
4. Tracer le polygone autour d'une nation visible sur la carte raster.
5. Remplir les champs (`id`, `name`, etc.).
6. Sauvegarder (Ctrl+S).
7. Répéter pour les **29 nations** (cf. `data/catalogs/nations.yaml`).

### Étape 5 — Placer les villes

1. Sélectionner la couche `cities`.
2. Mode édition + **Ajouter une entité point**.
3. Cliquer sur la position de chaque ville visible sur la carte.
4. Remplir les champs.
5. Importer en lot depuis `data/catalogs/cities-from-maps.yaml` :
   - Outil **Couche → Ajouter depuis un fichier de texte délimité** si on convertit le YAML en CSV (cf. script `tools/yaml_to_csv.py` à venir).

### Étape 6 — Exporter en GeoJSON

Pour chaque couche :

1. Clic droit sur la couche → **Exporter → Sauvegarder les entités sous...**
2. Format : **GeoJSON**.
3. Nom du fichier :
   - `regions` → `apps/interactive-map/public/data/geojson/regions.geojson`
   - `cities` → `apps/interactive-map/public/data/geojson/cities.geojson`
4. CRS : `EPSG:4326`.
5. Valider — écrase les fichiers placeholder.

### Étape 7 — Vérifier dans le frontend

```bash
cd apps/interactive-map
npm run dev
# Ouvrir http://localhost:5173
```

Les nouvelles frontières et villes vraies apparaissent dans la carte interactive.

## Cartes régionales (15 nations)

Les **cartes régionales** ont plus de détail (villes mineures, fleuves) que la carte mondiale. Une fois la digitalisation de la carte mondiale terminée, on peut affiner :

1. Charger `apps/interactive-map/public/maps/cortega.jpg` (par exemple) comme nouveau raster.
2. Géoréférencer dans le même CRS K&W (utiliser des villes connues comme GCP : Cortega, Pilis, Senec…).
3. Affiner les frontières et placer les villes mineures.
4. Ré-exporter `cities.geojson`.

## Estimations

| Étape | Temps |
|---|---:|
| Setup projet + géoréférencement carte mondiale | 1-2h |
| Tracé des 29 frontières (polygones) | 4-8h |
| Placement des ~280 villes sur la carte mondiale | 2-4h |
| Géoréférencement + détail des 15 cartes régionales | 16-24h |
| **Total Phase 2B itération 2** | **~25-40h** |

## Aide-mémoire raccourcis QGIS

| Raccourci | Action |
|---|---|
| `Ctrl+J` | Ouvrir le panneau "Couches" |
| `F1` | Aide contextuelle |
| `Ctrl+Shift+F` | Plein écran cartographique |
| `Ctrl++` / `Ctrl+-` | Zoom +/- |
| `Espace` | Pan (clic + déplacer) |
| `Ctrl+Z` (en édition) | Annuler dernière action |
| `Ctrl+E` | Rafraîchir la couche |

## Liens utiles

- [Documentation QGIS](https://docs.qgis.org/3.44/en/docs/user_manual/)
- [Tutoriels QGIS](https://www.qgistutorials.com/en/)
- [Guide vectorisation cartes K&W](../../../data/catalogs/vectorisation-cartes.md)
