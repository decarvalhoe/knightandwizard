# QGIS Project — Knight and Wizard

Ce dossier contient le projet QGIS pour la **digitalisation des cartes** (Phase 2B itération 2).

## Workflow efficace

Le workflow robuste est volontairement hybride : QGIS pour les gestes cartographiques, scripts pour tout le reste.

```powershell
# 1. Préparer/mettre à jour projet, CSV (avec lon/lat) et couches
python apps/interactive-map/tools/prepare_qgis_project.py

# 2. Géoréférencer la carte mondiale en GeoTIFF
python apps/interactive-map/tools/qgis_pipeline.py --georef

# 3. Construire le projet QGIS GUI propre : vrais layers, styles, snapping
python apps/interactive-map/tools/qgis_pipeline.py --project

# 4. Ouvrir/recharger QGIS et digitaliser
& "C:\Program Files\QGIS 3.44.9\bin\qgis-ltr.bat" apps/interactive-map/qgis/kw-world.qgz

# 5. Pendant QGIS : auto-export live (re-exporte+valide à chaque Ctrl+S)
python apps/interactive-map/tools/qgis_pipeline.py --watch

# 5bis. Voir un snapshot ponctuel de la progression
python apps/interactive-map/tools/qgis_pipeline.py --status

# 6. Après sauvegarde QGIS, exporter vers le frontend (si pas en --watch)
python apps/interactive-map/tools/qgis_pipeline.py --export
python apps/interactive-map/tools/validate_geojson.py

# 7. Aperçu live frontend pendant la digitalisation
cd apps/interactive-map ; npm run dev
# → http://localhost:5173
```

Si QGIS est déjà ouvert pendant l'étape `--project`, recharger `kw-world.qgz` dans QGIS pour récupérer les styles, les vraies couches vectorielles et le snapping.

À faire manuellement dans QGIS :
- tracer les frontières dans `qgis/layers/regions.gpkg`
- placer les villes dans `qgis/layers/cities.gpkg` (ou ajuster celles importées depuis `cities.csv`)

Automatisé par scripts :
- génération du projet/couches/CSV (le CSV inclut désormais `lon`/`lat` → import direct comme couche de points)
- géoréférencement `terres-oubliees.jpg` → `qgis/rasters/terres-oubliees.tif`
- reconstruction du projet QGIS GUI via PyQGIS (`qgis_pipeline.py --project`)
- statut de progression QGIS/GeoJSON via `qgis_pipeline.py --status`
- **mode live** `qgis_pipeline.py --watch` : surveille les `.gpkg`, re-exporte et revalide automatiquement à chaque sauvegarde QGIS
- export GeoPackage → GeoJSON
- validation avant affichage frontend
- aperçu live frontend Vite/Leaflet pendant la digitalisation (`npm run dev` → http://localhost:5173)

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

### Plugins QGIS optionnels

Une fois QGIS lancé, installer via *Extensions → Installer/Gérer les extensions* :

- **qgis2web** — export auto vers Leaflet (alternative à notre frontend custom)
- **MMQGIS** — opérations vectorielles avancées
- **Freehand Raster Georeferencer** — utile pour les cartes régionales, pas nécessaire pour la carte mondiale car `qgis_pipeline.py --georef` la cale automatiquement

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

Pour la carte mondiale, préférer le script :

```powershell
python apps/interactive-map/tools/qgis_pipeline.py --georef
```

Il produit `apps/interactive-map/qgis/rasters/terres-oubliees.tif` calé sur les bornes K&W `(0,0)` → `(143,100)` en `EPSG:4326`.

Si le GeoTIFF existe, `prepare_qgis_project.py` l'ajoute au projet QGIS à la place du JPG non géoréférencé.

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

#### Option A — Import en lot depuis le CSV pré-rempli (rapide)

`prepare_qgis_project.py` génère `apps/interactive-map/qgis/csv-imports/cities.csv` avec déjà
`id, name, parent_region, role, notes, lon, lat` — les coordonnées sont calculées à partir
des centroïdes des nations + un petit décalage déterministe par rôle (capitales centrées,
villes périphériques en spirale d'angle d'or).

Dans QGIS :

1. **Couche → Ajouter une couche → Ajouter une couche de texte délimité**.
2. Fichier : `apps/interactive-map/qgis/csv-imports/cities.csv`.
3. Format : CSV, séparateur `,`, premier enregistrement = noms de champs.
4. Géométrie : `Coordonnées de point`, X = `lon`, Y = `lat`, CRS `EPSG:4326`.
5. Ajouter — toutes les ~315 villes apparaissent immédiatement.
6. Clic droit sur la couche → **Exporter → Sauvegarder les entités sous…**
   → format `GeoPackage`, fichier `qgis/layers/cities.gpkg`, nom de couche `cities`,
   remplacer la couche existante. C'est cette couche qu'on édite ensuite (les villes
   ont une position approximative qu'on affine en cliquant sur la carte).

#### Option B — Saisie manuelle (précision maximum dès le départ)

1. Sélectionner la couche `cities` (vide).
2. Mode édition + **Ajouter une entité point**.
3. Cliquer sur la position de chaque ville visible sur la carte raster.
4. Remplir les champs.

### Étape 6 — Exporter en GeoJSON

#### Option A — Export ponctuel après sauvegarde

```powershell
python apps/interactive-map/tools/qgis_pipeline.py --export
python apps/interactive-map/tools/validate_geojson.py
```

#### Option B — Mode `--watch` (live, recommandé pendant la digitalisation)

Lancer dans un terminal séparé en parallèle de QGIS :

```powershell
python apps/interactive-map/tools/qgis_pipeline.py --watch
```

Le script surveille les `.gpkg` (toutes les 2 s) et déclenche `--export` + validation
automatiquement à chaque `Ctrl+S` dans QGIS. Combiné au serveur Vite (`npm run dev`),
on voit les nouvelles frontières/villes apparaître dans le navigateur en quelques
secondes après chaque sauvegarde.

`Ctrl+C` pour arrêter le mode watch.

Les couches vides sont ignorées et les placeholders existants sont conservés.

### Étape 7 — Vérifier dans le frontend

```bash
cd apps/interactive-map
npm run dev
# Ouvrir http://localhost:5173
```

Les nouvelles frontières et villes vraies apparaissent dans la carte interactive.
Avec `qgis_pipeline.py --watch` actif, le rafraîchissement est automatique : il
suffit de recharger l'onglet après chaque sauvegarde QGIS.

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
