#!/usr/bin/env python3
"""
prepare_qgis_project.py
Prépare le projet QGIS pour la digitalisation des cartes K&W :
- Crée le fichier .qgz minimal (XML)
- Génère les couches GeoPackage vides (regions, cities, routes)
- Convertit les YAML en CSV (importable dans QGIS comme couche délimitée)
- Crée la structure du dossier qgis/

Usage : python apps/interactive-map/tools/prepare_qgis_project.py
"""

import os
import sys
import csv
import yaml
from pathlib import Path
import zipfile
from datetime import datetime
import xml.etree.ElementTree as ET
from xml.dom import minidom

# Force UTF-8 sur Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

ROOT = Path(__file__).resolve().parent.parent.parent.parent
QGIS_DIR = ROOT / 'apps' / 'interactive-map' / 'qgis'
LAYERS_DIR = QGIS_DIR / 'layers'
CSV_DIR = QGIS_DIR / 'csv-imports'
CATALOGS = ROOT / 'data' / 'catalogs'
MAPS_DIR = ROOT / 'apps' / 'interactive-map' / 'public' / 'maps'


def ensure_dirs():
    """Crée les dossiers nécessaires."""
    for d in [QGIS_DIR, LAYERS_DIR, CSV_DIR]:
        d.mkdir(parents=True, exist_ok=True)


def load_yaml(path):
    with open(path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def export_nations_csv():
    """Exporte les nations en CSV pour import QGIS."""
    nations = load_yaml(CATALOGS / 'nations.yaml')
    out = CSV_DIR / 'nations.csv'

    with open(out, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f, delimiter=',', quoting=csv.QUOTE_MINIMAL)
        writer.writerow(['id', 'name', 'category', 'capital',
                         'language', 'religion', 'government',
                         'population', 'surface_km2', 'notes'])

        for region in nations.get('regions', []):
            rid = region.get('id', '')
            writer.writerow([
                rid,
                region.get('name', ''),
                region.get('category', 'nation'),
                region.get('capital') or '',
                region.get('official_language') or '',
                region.get('official_religion') or '',
                region.get('government') or '',
                (region.get('population') or {}).get('total') if isinstance(region.get('population'), dict) else '',
                region.get('surface_km2') or '',
                ' | '.join(region.get('notable_features', []) or [])[:500]
            ])

    print(f"  ✓ {out.relative_to(ROOT)} ({sum(1 for _ in open(out, encoding='utf-8'))-1} entries)")


def export_cities_csv():
    """Exporte les villes en CSV."""
    cities_data = load_yaml(CATALOGS / 'cities-from-maps.yaml')
    out = CSV_DIR / 'cities.csv'

    rows = []
    for key, section in cities_data.items():
        if not isinstance(section, dict) or 'parent_region' not in section:
            continue
        parent = section['parent_region']

        # Capitales
        for cap in section.get('capital', []) or []:
            rows.append(_flatten_city(cap, parent, 'capital'))

        # Major / cities
        for c in (section.get('major_cities', []) or section.get('cities', []) or []):
            rows.append(_flatten_city(c, parent))

        # Villages
        for v in (section.get('villages', []) or []):
            rows.append(_flatten_city(v, parent, 'village'))

        # Portes (Azrak)
        for g in (section.get('fortified_gates', []) or []):
            rows.append(_flatten_city(g, parent, 'gate'))

    with open(out, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f, delimiter=',', quoting=csv.QUOTE_MINIMAL)
        writer.writerow(['id', 'name', 'parent_region', 'role', 'notes'])
        for row in rows:
            writer.writerow(row)

    print(f"  ✓ {out.relative_to(ROOT)} ({len(rows)} entries)")


def _flatten_city(city, parent_region, default_role='town'):
    """Aplatit une entrée city YAML en row CSV."""
    if isinstance(city, str):
        return [city, city.replace('_', ' ').title(), parent_region, default_role, '']

    return [
        city.get('id', ''),
        city.get('name', ''),
        parent_region,
        city.get('role', default_role),
        city.get('notes') or ''
    ]


def create_qgz_project():
    """Crée un fichier .qgz minimal (zip contenant un .qgs XML)."""
    qgs_path = QGIS_DIR / 'kw-world.qgs'
    qgz_path = QGIS_DIR / 'kw-world.qgz'

    # Liste les rasters disponibles
    raster_files = sorted(MAPS_DIR.glob('*.jpg'))
    print(f"\n→ Création du projet QGIS")
    print(f"  Cartes raster disponibles : {len(raster_files)}")
    for r in raster_files[:5]:
        print(f"    · {r.name}")
    if len(raster_files) > 5:
        print(f"    · ... ({len(raster_files)-5} autres)")

    # Génération XML minimal compatible QGIS 3.x
    qgs_xml = _generate_qgs_xml(raster_files)

    with open(qgs_path, 'w', encoding='utf-8') as f:
        f.write(qgs_xml)

    # Wrapper en .qgz (zip)
    with zipfile.ZipFile(qgz_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.write(qgs_path, 'kw-world.qgs')

    print(f"  ✓ {qgs_path.relative_to(ROOT)}")
    print(f"  ✓ {qgz_path.relative_to(ROOT)} (à ouvrir dans QGIS)")


def _generate_qgs_xml(raster_files):
    """Génère le XML minimal du projet QGIS avec les rasters listés."""
    timestamp = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')

    # Header XML
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<qgis projectname="Knight and Wizard — Carte interactive" version="3.44.9-Solothurn" saveDateTime="{timestamp}">',
        '  <homePath path=""/>',
        '  <title>Knight and Wizard — Digitalisation cartes</title>',
        '  <transaction mode="Disabled"/>',
        '  <projectFlags set=""/>',
        '  <autotransaction active="0"/>',
        '  <evaluateDefaultValues active="0"/>',
        '  <trust active="0"/>',
        '',
        '  <projectCrs>',
        '    <spatialrefsys nativeFormat="Wkt">',
        '      <wkt>GEOGCRS["WGS 84",ENSEMBLE["World Geodetic System 1984 ensemble",MEMBER["World Geodetic System 1984 (Transit)"],MEMBER["World Geodetic System 1984 (G730)"],MEMBER["World Geodetic System 1984 (G873)"],MEMBER["World Geodetic System 1984 (G1150)"],MEMBER["World Geodetic System 1984 (G1674)"],MEMBER["World Geodetic System 1984 (G1762)"],MEMBER["World Geodetic System 1984 (G2139)"],ELLIPSOID["WGS 84",6378137,298.257223563,LENGTHUNIT["metre",1]],ENSEMBLEACCURACY[2.0]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]],CS[ellipsoidal,2],AXIS["geodetic latitude (Lat)",north,ORDER[1],ANGLEUNIT["degree",0.0174532925199433]],AXIS["geodetic longitude (Lon)",east,ORDER[2],ANGLEUNIT["degree",0.0174532925199433]],USAGE[SCOPE["Horizontal component of 3D system."],AREA["World."],BBOX[-90,-180,90,180]],ID["EPSG",4326]]</wkt>',
        '      <proj4>+proj=longlat +datum=WGS84 +no_defs</proj4>',
        '      <srsid>3452</srsid>',
        '      <srid>4326</srid>',
        '      <authid>EPSG:4326</authid>',
        '      <description>WGS 84</description>',
        '      <projectionacronym>longlat</projectionacronym>',
        '      <ellipsoidacronym>EPSG:7030</ellipsoidacronym>',
        '      <geographicflag>true</geographicflag>',
        '    </spatialrefsys>',
        '  </projectCrs>',
        '',
        '  <layer-tree-group>',
        '    <customproperties/>',
        '    <layer-tree-group expanded="1" name="Rasters (référence)" checked="Qt::Unchecked">',
        '      <customproperties/>',
    ]

    # Ajout des rasters (carte mondiale en premier, visible)
    sorted_rasters = sorted(raster_files, key=lambda p: 0 if 'terres-oubliees' in p.name else 1)
    for i, r in enumerate(sorted_rasters):
        layer_id = f"raster_{r.stem.replace('-', '_')}"
        # Carte mondiale visible par défaut, autres invisibles
        checked = "Qt::Checked" if 'terres-oubliees' in r.name else "Qt::Unchecked"
        rel_path = os.path.relpath(r, QGIS_DIR).replace('\\', '/')
        lines.append(f'      <layer-tree-layer id="{layer_id}" name="{r.stem}" providerKey="gdal" source="{rel_path}" checked="{checked}" expanded="1"/>')

    lines.extend([
        '    </layer-tree-group>',
        '    <layer-tree-group expanded="1" name="Vecteurs à digitaliser" checked="Qt::Checked">',
        '      <customproperties/>',
        '      <layer-tree-layer id="regions_layer" name="Régions (à créer en GeoPackage)" providerKey="ogr" source="layers/regions.gpkg|layername=regions" expanded="1"/>',
        '      <layer-tree-layer id="cities_layer" name="Villes (à créer en GeoPackage)" providerKey="ogr" source="layers/cities.gpkg|layername=cities" expanded="1"/>',
        '      <layer-tree-layer id="routes_layer" name="Routes/fleuves (optionnel)" providerKey="ogr" source="layers/routes.gpkg|layername=routes" expanded="1"/>',
        '    </layer-tree-group>',
        '  </layer-tree-group>',
        '',
        '  <projectlayers>',
    ])

    # Définitions des layers raster
    for i, r in enumerate(sorted_rasters):
        layer_id = f"raster_{r.stem.replace('-', '_')}"
        rel_path = os.path.relpath(r, QGIS_DIR).replace('\\', '/')
        lines.extend([
            f'    <maplayer type="raster" id="{layer_id}">',
            f'      <id>{layer_id}</id>',
            f'      <datasource>{rel_path}</datasource>',
            '      <provider>gdal</provider>',
            f'      <layername>{r.stem}</layername>',
            '      <srs>',
            '        <spatialrefsys nativeFormat="Wkt">',
            '          <authid>EPSG:4326</authid>',
            '        </spatialrefsys>',
            '      </srs>',
            f'      <abstract>Carte raster K&amp;W : {r.stem}</abstract>',
            '    </maplayer>',
        ])

    lines.extend([
        '  </projectlayers>',
        '',
        '  <properties>',
        '    <Paths>',
        '      <Absolute type="bool">false</Absolute>',
        '    </Paths>',
        '    <PAL>',
        '      <CandidatesLinePerCM type="double">5</CandidatesLinePerCM>',
        '      <CandidatesPolygonPerCM type="double">2.5</CandidatesPolygonPerCM>',
        '      <DrawRectOnly type="bool">false</DrawRectOnly>',
        '      <DrawUnplaced type="bool">false</DrawUnplaced>',
        '      <SearchMethod type="int">0</SearchMethod>',
        '      <ShowingAllLabels type="bool">false</ShowingAllLabels>',
        '      <ShowingCandidates type="bool">false</ShowingCandidates>',
        '      <ShowingPartialsLabels type="bool">true</ShowingPartialsLabels>',
        '    </PAL>',
        '  </properties>',
        '</qgis>',
    ])

    return '\n'.join(lines)


def create_empty_geopackages():
    """Crée des fichiers GeoPackage vides via le ogr2ogr ou Python ogr.

    Note : nécessite la bibliothèque GDAL Python ou ogr2ogr en CLI.
    Si non disponible, le user devra créer les couches manuellement dans QGIS
    (cf. README.md étape 3).
    """
    try:
        from osgeo import ogr, osr
    except ImportError:
        print("  ⚠ GDAL Python non installé — couches GPKG à créer manuellement dans QGIS")
        print("    Voir README.md étape 3 pour la procédure.")
        return False

    layouts = [
        {
            'name': 'regions.gpkg',
            'layer_name': 'regions',
            'geom_type': ogr.wkbPolygon,
            'fields': [
                ('id', ogr.OFTString, 64),
                ('name', ogr.OFTString, 128),
                ('category', ogr.OFTString, 32),
                ('color', ogr.OFTString, 16),
                ('capital', ogr.OFTString, 64),
                ('blason_image', ogr.OFTString, 256),
                ('regional_map', ogr.OFTString, 256),
            ]
        },
        {
            'name': 'cities.gpkg',
            'layer_name': 'cities',
            'geom_type': ogr.wkbPoint,
            'fields': [
                ('id', ogr.OFTString, 64),
                ('name', ogr.OFTString, 128),
                ('parent_region', ogr.OFTString, 64),
                ('role', ogr.OFTString, 32),
                ('notes', ogr.OFTString, 512),
            ]
        },
        {
            'name': 'routes.gpkg',
            'layer_name': 'routes',
            'geom_type': ogr.wkbLineString,
            'fields': [
                ('id', ogr.OFTString, 64),
                ('name', ogr.OFTString, 128),
                ('type', ogr.OFTString, 32),  # road / river / border
            ]
        }
    ]

    srs = osr.SpatialReference()
    srs.ImportFromEPSG(4326)

    driver = ogr.GetDriverByName('GPKG')

    for layout in layouts:
        path = LAYERS_DIR / layout['name']
        if path.exists():
            print(f"  · {path.name} existe déjà, skip")
            continue

        ds = driver.CreateDataSource(str(path))
        layer = ds.CreateLayer(layout['layer_name'], srs, layout['geom_type'])

        for field_name, field_type, field_size in layout['fields']:
            field_defn = ogr.FieldDefn(field_name, field_type)
            if field_type == ogr.OFTString:
                field_defn.SetWidth(field_size)
            layer.CreateField(field_defn)

        ds = None  # close
        print(f"  ✓ {path.relative_to(ROOT)}")

    return True


def main():
    print("K&W — Préparation projet QGIS")
    print(f"  Root        : {ROOT}")
    print(f"  QGIS dir    : {QGIS_DIR}")
    print(f"  Catalogs    : {CATALOGS}\n")

    print("→ Création de la structure de dossiers...")
    ensure_dirs()
    print(f"  ✓ {QGIS_DIR.relative_to(ROOT)}")
    print(f"  ✓ {LAYERS_DIR.relative_to(ROOT)}")
    print(f"  ✓ {CSV_DIR.relative_to(ROOT)}")

    print("\n→ Export CSV des catalogues (importables QGIS)...")
    export_nations_csv()
    export_cities_csv()

    print("\n→ Création des couches GeoPackage vides...")
    gdal_ok = create_empty_geopackages()

    create_qgz_project()

    print("\n--- DONE ---")
    print(f"\n→ Ouvrir le projet : {QGIS_DIR / 'kw-world.qgz'}")
    print(f"→ Documentation : {QGIS_DIR / 'README.md'}")

    if not gdal_ok:
        print("\n⚠ Note : GDAL non installé (pip install GDAL ou via conda)")
        print("  Les couches vectorielles devront être créées manuellement dans QGIS.")
        print("  Voir README.md étape 3 pour la procédure.")


if __name__ == '__main__':
    main()
