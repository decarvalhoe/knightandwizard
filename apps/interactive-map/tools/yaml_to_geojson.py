#!/usr/bin/env python3
"""
yaml_to_geojson.py
Convertit les catalogues YAML K&W en GeoJSON pour Leaflet.

Comme nous n'avons pas encore de vraies coordonnées (à digitaliser dans QGIS),
ce script génère :
- Pour chaque nation : un polygone fictif (rectangle approximatif basé sur position estimée)
- Pour chaque ville : un point (placeholder, position estimée par région)

Une fois QGIS digitalisation faite, ce script sera remplacé par un export QGIS.

Usage : python tools/yaml_to_geojson.py
"""

import json
import os
import sys
import yaml
from pathlib import Path

# Force UTF-8 output on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Path resolution : ce script vit dans apps/interactive-map/tools/
# ROOT = racine du monorepo (knightandwizard/)
ROOT = Path(__file__).resolve().parent.parent.parent.parent
CATALOGS = ROOT / 'data' / 'catalogs'
OUTPUT = ROOT / 'apps' / 'interactive-map' / 'public' / 'data' / 'geojson'
RAW_OUT = ROOT / 'apps' / 'interactive-map' / 'public' / 'data' / 'raw'

# Position approximative des régions sur la carte mondiale (terres-oubliees.jpg)
# CRS.Simple coords : [lat=Y, lng=X] avec bounds [[0,0], [100, 143]]
# Référence visuelle : carte 590x420, ratio 1.405
# Note: ces positions sont des PLACEHOLDERS — à raffiner dans QGIS.

REGION_PLACEHOLDERS = {
    # Nord
    'terres_du_nord':       {'center': [85, 60], 'size': [10, 50], 'color': '#5d6d7e'},
    'foret_de_tyrkan':      {'center': [75, 50], 'size': [12, 25], 'color': '#3d6e3d'},
    'royaume_du_chaos':     {'center': [92, 90], 'size': [10, 30], 'color': '#5a1a1a'},
    'montagnes_grises':     {'center': [80, 90], 'size': [8, 15],  'color': '#7d7d7d'},
    'detre':                {'center': [75, 110], 'size': [10, 18], 'color': '#8b3a1f'},
    'onarit':               {'center': [82, 105], 'size': [8, 12], 'color': '#a07845'},

    # Centre
    'empire':               {'center': [70, 35], 'size': [15, 18], 'color': '#7a3530'},
    'fauche_le_vent':       {'center': [60, 50], 'size': [10, 18], 'color': '#5a8a3e'},
    'alteria':              {'center': [55, 65], 'size': [12, 15], 'color': '#b8923a'},
    'portes_d_azrak':       {'center': [50, 60], 'size': [8, 12], 'color': '#5d4a30'},
    'chez_nous':            {'center': [55, 35], 'size': [6, 8], 'color': '#999966'},
    'foret_d_ico':          {'center': [62, 75], 'size': [8, 12], 'color': '#4d8c4d'},  # alias collines_d_ico
    'collines_d_ico':       {'center': [62, 75], 'size': [8, 12], 'color': '#4d8c4d'},
    'treadur':              {'center': [70, 85], 'size': [6, 8], 'color': '#7c8c4d'},

    # Est
    'irtanie':              {'center': [55, 100], 'size': [12, 12], 'color': '#a8762a'},
    'lounaxill':            {'center': [50, 90], 'size': [8, 10], 'color': '#9d7050'},
    'blanc_royaume':        {'center': [55, 115], 'size': [10, 10], 'color': '#e8e0d0'},
    'monde_sombre':         {'center': [50, 125], 'size': [15, 12], 'color': '#2a1a3a'},

    # Ouest
    'aderand':              {'center': [55, 18], 'size': [8, 10], 'color': '#3d7d8a'},
    'enorie':               {'center': [50, 25], 'size': [10, 12], 'color': '#c8a878'},
    'haut_royaume':         {'center': [35, 25], 'size': [12, 18], 'color': '#d8c898'},

    # Sud-Ouest
    'cortega':              {'center': [38, 50], 'size': [10, 18], 'color': '#a83a3a'},
    'terres_sans_noms':     {'center': [42, 70], 'size': [6, 10], 'color': '#3a3a3a'},

    # Sud
    'grand_desert':         {'center': [30, 75], 'size': [12, 18], 'color': '#e0c890'},
    'ile_aux_basilics':     {'center': [22, 60], 'size': [4, 6], 'color': '#7da080'},
    'landes_desertiques':   {'center': [12, 50], 'size': [10, 30], 'color': '#bcae90'},
    'terres_sauvages':      {'center': [12, 100], 'size': [10, 30], 'color': '#5d6e3d'},

    # Sud-Est
    'dundoria':             {'center': [25, 100], 'size': [10, 15], 'color': '#c08838'},
    'yonkado':              {'center': [30, 115], 'size': [10, 15], 'color': '#a83a5a'},
    'stazyliss':            {'center': [42, 105], 'size': [6, 8], 'color': '#5d8a5d'}
}

# Position estimée des capitales (centre de la région par défaut)
def make_polygon(center, size):
    """Crée un rectangle de polygone GeoJSON depuis center=[lat,lng] et size=[h,w]"""
    lat, lng = center
    h, w = size
    return {
        "type": "Polygon",
        "coordinates": [[
            [lng - w/2, lat - h/2],
            [lng + w/2, lat - h/2],
            [lng + w/2, lat + h/2],
            [lng - w/2, lat + h/2],
            [lng - w/2, lat - h/2]
        ]]
    }


def load_yaml(path):
    with open(path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def build_regions_geojson(nations_data):
    features = []
    for region in nations_data.get('regions', []):
        rid = region.get('id')
        if not rid:
            continue

        placeholder = REGION_PLACEHOLDERS.get(rid)
        if not placeholder:
            print(f"  ⚠ {rid}: pas de placeholder de position, skip")
            continue

        # Préparer image_assets
        image_assets = region.get('image_assets', {})
        regional_map = image_assets.get('regional_map') or f'/maps/{rid}.jpg'
        flag = image_assets.get('flag') or image_assets.get('flag_mini')

        # Convertir les chemins absolus du repo en chemins web relatifs
        if regional_map and regional_map.startswith('site/'):
            # site/download/map/cortega.jpg -> /maps/cortega.jpg
            filename = os.path.basename(regional_map)
            regional_map = f'/maps/{filename}'
        if flag and flag.startswith('site/'):
            filename = os.path.basename(flag)
            flag = f'/flags/{filename}'

        feature = {
            "type": "Feature",
            "geometry": make_polygon(placeholder['center'], placeholder['size']),
            "properties": {
                "id": rid,
                "name": region.get('name', rid),
                "category": region.get('category', 'nation'),
                "color": placeholder['color'],
                "capital": region.get('capital'),
                "regional_map": regional_map if os.path.basename(regional_map or '').replace('.jpg', '') in PLACEHOLDER_HAS_MAP else None,
                "blason_image": flag,
                "is_placeholder": True
            }
        }
        features.append(feature)

    return {"type": "FeatureCollection", "features": features}


# Liste des cartes régionales effectivement présentes (pour ne pas linker des 404)
PLACEHOLDER_HAS_MAP = {
    'alteria', 'collines-ico', 'cortega', 'detre', 'dundoria', 'empire',
    'enorie', 'fauche-le-vent', 'foret-tyrkan', 'haut-royaume', 'irtanie',
    'portes-azrak', 'sombre-monde', 'terres-nord', 'terres-oubliees', 'yonkado'
}


def build_cities_geojson(cities_data, nations_data):
    """Place les villes en grille dans le centre de chaque région (placeholder)."""
    features = []

    # Index region centers
    centers = {rid: REGION_PLACEHOLDERS[rid]['center'] for rid in REGION_PLACEHOLDERS}

    # Parcours toutes les sections *_cities du YAML
    for key, section in cities_data.items():
        if not isinstance(section, dict) or 'parent_region' not in section:
            continue

        parent = section['parent_region']
        center = centers.get(parent)
        if not center:
            print(f"  ⚠ {key}: parent_region={parent} sans placeholder, skip")
            continue

        # Capitale au centre
        for cap in section.get('capital', []) or []:
            features.append(make_city_feature(cap, parent, center, role='capital'))

        # Major cities (rayon 1)
        major = section.get('major_cities', []) or section.get('cities', []) or []
        for i, city in enumerate(major):
            angle = (i / max(len(major), 1)) * 6.283
            offset = [center[0] + 2.5 * math.sin(angle), center[1] + 3 * math.cos(angle)]
            features.append(make_city_feature(city, parent, offset))

        # Villages (rayon 2)
        villages = section.get('villages', []) or []
        for i, v in enumerate(villages):
            if isinstance(v, str):
                v = {'id': v, 'name': v.replace('_', ' ').title(), 'role': 'village'}
            angle = (i / max(len(villages), 1)) * 6.283 + 0.3
            offset = [center[0] + 4 * math.sin(angle), center[1] + 5 * math.cos(angle)]
            features.append(make_city_feature(v, parent, offset, role='village'))

    return {"type": "FeatureCollection", "features": features}


def make_city_feature(city, parent_region, position, role=None):
    if isinstance(city, str):
        city_id = city
        name = city.replace('_', ' ').title()
        city_role = role or 'town'
        notes = None
    else:
        city_id = city.get('id')
        name = city.get('name', city_id)
        city_role = city.get('role', role or 'town')
        notes = city.get('notes')

    return {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [position[1], position[0]]  # [lng, lat]
        },
        "properties": {
            "id": city_id,
            "name": name,
            "parent_region": parent_region,
            "role": city_role,
            "notes": notes,
            "is_placeholder": True
        }
    }


def main():
    import math
    globals()['math'] = math

    print(f"K&W YAML → GeoJSON converter")
    print(f"  Catalogs : {CATALOGS}")
    print(f"  Output   : {OUTPUT}\n")

    if not CATALOGS.exists():
        print(f"ERREUR : {CATALOGS} introuvable")
        sys.exit(1)

    OUTPUT.mkdir(parents=True, exist_ok=True)
    RAW_OUT.mkdir(parents=True, exist_ok=True)

    # 1. Load YAML
    print("→ Chargement YAML...")
    nations = load_yaml(CATALOGS / 'nations.yaml')
    cities = load_yaml(CATALOGS / 'cities-from-maps.yaml')
    print(f"  nations.yaml: {len(nations.get('regions', []))} entrées")
    print(f"  cities-from-maps.yaml chargé\n")

    # 2. Build GeoJSON
    print("→ Génération regions.geojson...")
    regions_gj = build_regions_geojson(nations)
    print(f"  {len(regions_gj['features'])} polygones régions\n")

    print("→ Génération cities.geojson...")
    cities_gj = build_cities_geojson(cities, nations)
    print(f"  {len(cities_gj['features'])} points villes\n")

    # 3. Write
    with open(OUTPUT / 'regions.geojson', 'w', encoding='utf-8') as f:
        json.dump(regions_gj, f, ensure_ascii=False, indent=2)
    with open(OUTPUT / 'cities.geojson', 'w', encoding='utf-8') as f:
        json.dump(cities_gj, f, ensure_ascii=False, indent=2)
    print(f"✓ {OUTPUT}/regions.geojson")
    print(f"✓ {OUTPUT}/cities.geojson")

    # 4. Copie raw YAML pour le frontend
    import shutil
    for fname in ['nations.yaml', 'cities-from-maps.yaml', 'religions.yaml',
                  'organisations.yaml', 'bestiaire.yaml']:
        src = CATALOGS / fname
        if src.exists():
            shutil.copy(src, RAW_OUT / fname)
            print(f"✓ {RAW_OUT}/{fname}")

    print("\n--- DONE ---")
    print("Note : ces GeoJSON sont des PLACEHOLDERS (rectangles + points en grille).")
    print("Une fois QGIS digitalisation faite, exporter et écraser ces fichiers.")


if __name__ == '__main__':
    main()
