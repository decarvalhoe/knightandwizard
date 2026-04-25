#!/usr/bin/env python3
"""
validate_geojson.py
Valide les GeoJSON exportés depuis QGIS pour s'assurer :
- de la cohérence avec les YAML canon (data/catalogs/)
- de l'absence de doublons
- de la complétude des champs obligatoires
- des références croisées (parent_region existe, etc.)

Usage : python apps/interactive-map/tools/validate_geojson.py
"""

import json
import os
import sys
import yaml
from pathlib import Path
from collections import Counter

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

ROOT = Path(__file__).resolve().parent.parent.parent.parent
GEOJSON_DIR = ROOT / 'apps' / 'interactive-map' / 'public' / 'data' / 'geojson'
CATALOGS = ROOT / 'data' / 'catalogs'

REQUIRED_REGION_FIELDS = ['id', 'name']
REQUIRED_CITY_FIELDS = ['id', 'name', 'parent_region']

VALID_REGION_CATEGORIES = {'nation', 'wilderness', 'mountain_range', 'location', 'duchy'}
VALID_CITY_ROLES = {'capital', 'major_city', 'town', 'village', 'tribal_capital',
                    'capital_centre', 'gate', 'border_town'}


def load_yaml(path):
    with open(path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def load_geojson(path):
    if not path.exists():
        return None
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def validate_regions(regions_gj, nations_yaml):
    """Vérifie regions.geojson vs nations.yaml."""
    issues = []
    if not regions_gj:
        return ['regions.geojson manquant']

    yaml_ids = {r['id'] for r in nations_yaml.get('regions', [])}
    gj_ids = []

    for i, feat in enumerate(regions_gj.get('features', [])):
        props = feat.get('properties', {})

        # Champs obligatoires
        for field in REQUIRED_REGION_FIELDS:
            if not props.get(field):
                issues.append(f"Feature {i}: champ '{field}' manquant")

        # Catégorie valide
        cat = props.get('category')
        if cat and cat not in VALID_REGION_CATEGORIES:
            issues.append(f"Feature {i} ({props.get('id')}): catégorie '{cat}' invalide")

        # ID dans le YAML canon ?
        rid = props.get('id')
        if rid and rid not in yaml_ids:
            issues.append(f"Feature {i} ({rid}): id absent de nations.yaml")

        gj_ids.append(rid)

        # Géométrie polygon ?
        geom = feat.get('geometry', {})
        if geom.get('type') not in ('Polygon', 'MultiPolygon'):
            issues.append(f"Feature {i} ({rid}): géométrie {geom.get('type')} (devrait être Polygon)")

    # Doublons
    counts = Counter(gj_ids)
    for rid, n in counts.items():
        if n > 1:
            issues.append(f"ID dupliqué: '{rid}' apparaît {n} fois")

    # IDs YAML manquants dans le GeoJSON
    missing = yaml_ids - set(gj_ids)
    if missing:
        for m in sorted(missing):
            issues.append(f"Region '{m}' dans nations.yaml mais absente de regions.geojson")

    return issues


def validate_cities(cities_gj, regions_gj):
    """Vérifie cities.geojson."""
    issues = []
    if not cities_gj:
        return ['cities.geojson manquant']

    region_ids = set()
    if regions_gj:
        for r in regions_gj.get('features', []):
            rid = r.get('properties', {}).get('id')
            if rid:
                region_ids.add(rid)

    city_ids = []

    for i, feat in enumerate(cities_gj.get('features', [])):
        props = feat.get('properties', {})

        for field in REQUIRED_CITY_FIELDS:
            if not props.get(field):
                issues.append(f"City {i}: champ '{field}' manquant")

        role = props.get('role')
        if role and role not in VALID_CITY_ROLES:
            issues.append(f"City {i} ({props.get('id')}): role '{role}' invalide")

        parent = props.get('parent_region')
        if parent and region_ids and parent not in region_ids:
            issues.append(f"City {i} ({props.get('id')}): parent_region '{parent}' inconnu")

        city_ids.append(props.get('id'))

        geom = feat.get('geometry', {})
        if geom.get('type') != 'Point':
            issues.append(f"City {i} ({props.get('id')}): géométrie {geom.get('type')} (devrait être Point)")

    counts = Counter(city_ids)
    for cid, n in counts.items():
        if n > 1:
            issues.append(f"City ID dupliqué: '{cid}' apparaît {n} fois")

    return issues


def main():
    print("K&W — Validation GeoJSON\n")

    print("→ Chargement YAML canon...")
    nations = load_yaml(CATALOGS / 'nations.yaml')
    print(f"  ✓ nations.yaml: {len(nations.get('regions', []))} régions canon\n")

    print("→ Chargement GeoJSON...")
    regions_gj = load_geojson(GEOJSON_DIR / 'regions.geojson')
    cities_gj = load_geojson(GEOJSON_DIR / 'cities.geojson')

    if regions_gj:
        print(f"  ✓ regions.geojson: {len(regions_gj.get('features', []))} polygones")
    else:
        print("  ⚠ regions.geojson absent — lancer prepare_qgis_project.py + digitaliser dans QGIS")

    if cities_gj:
        print(f"  ✓ cities.geojson: {len(cities_gj.get('features', []))} points")
    else:
        print("  ⚠ cities.geojson absent")

    print("\n→ Validation des régions...")
    issues_r = validate_regions(regions_gj, nations)
    if issues_r:
        for issue in issues_r:
            print(f"  ✗ {issue}")
    else:
        print("  ✓ Aucun problème détecté")

    print("\n→ Validation des villes...")
    issues_c = validate_cities(cities_gj, regions_gj)
    if issues_c:
        for issue in issues_c[:30]:
            print(f"  ✗ {issue}")
        if len(issues_c) > 30:
            print(f"  ... ({len(issues_c) - 30} autres problèmes)")
    else:
        print("  ✓ Aucun problème détecté")

    total = len(issues_r) + len(issues_c)
    print(f"\n--- {total} problème(s) détecté(s) ---")
    sys.exit(0 if total == 0 else 1)


if __name__ == '__main__':
    main()
