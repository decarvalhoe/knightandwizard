#!/usr/bin/env python3
"""
qgis_pipeline.py
Wrapper pour les étapes 2 (géoréférencement) et 6 (export GeoJSON) du
workflow QGIS K&W (cf. apps/interactive-map/qgis/README.md).

Shell-out vers les CLI GDAL/OGR fournis avec QGIS — pas besoin d'ouvrir
l'UI. Une fois ce script en place, la digitalisation se résume à :

    1. Ouvrir QGIS sur kw-world.qgz
    2. Tracer les 29 frontières (manuel — couche regions.gpkg)
    3. Placer ~280 villes (manuel — couche cities.gpkg)
    4. Lancer ce script  → géoréf raster + export GeoJSON

Étape 2 : public/maps/terres-oubliees.jpg → qgis/rasters/terres-oubliees.tif
          (CRS arbitraire EPSG:4326, bornes ulx=0/uly=100/lrx=143/lry=0)
Étape 6 : qgis/layers/{regions,cities,routes}.gpkg → public/data/geojson/*.geojson
          (les couches vides sont sautées — les placeholders restent)

Usage :
    python apps/interactive-map/tools/qgis_pipeline.py            # tout
    python apps/interactive-map/tools/qgis_pipeline.py --georef   # étape 2 seule
    python apps/interactive-map/tools/qgis_pipeline.py --project  # projet QGIS GUI prêt
    python apps/interactive-map/tools/qgis_pipeline.py --export   # étape 6 seule
    python apps/interactive-map/tools/qgis_pipeline.py --status   # état sans modification

Override de découverte GDAL :
    QGIS_BIN_DIR=/chemin/vers/qgis/bin python ...
"""

import argparse
import csv
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

ROOT = Path(__file__).resolve().parent.parent.parent.parent
APP = ROOT / 'apps' / 'interactive-map'
MAPS = APP / 'public' / 'maps'
QGIS_DIR = APP / 'qgis'
RASTERS = QGIS_DIR / 'rasters'
LAYERS = QGIS_DIR / 'layers'
CSV_IMPORTS = QGIS_DIR / 'csv-imports'
GEOJSON_OUT = APP / 'public' / 'data' / 'geojson'

# Étape 2 — rasters à géoréférencer (CRS arbitraire EPSG:4326, K&W coord system)
RASTERS_TO_GEOREF = [
    {
        'name': 'terres-oubliees',
        'src': MAPS / 'terres-oubliees.jpg',
        'dst': RASTERS / 'terres-oubliees.tif',
        # ulx, uly, lrx, lry — voir qgis/README.md "Étape 2"
        'ullr': (0, 100, 143, 0),
    },
]

# Étape 6 — couches vectorielles à exporter
LAYERS_TO_EXPORT = [
    ('regions', LAYERS / 'regions.gpkg', GEOJSON_OUT / 'regions.geojson'),
    ('cities',  LAYERS / 'cities.gpkg',  GEOJSON_OUT / 'cities.geojson'),
    ('routes',  LAYERS / 'routes.gpkg',  GEOJSON_OUT / 'routes.geojson'),
]


def find_tool(name: str) -> str:
    """Localise un binaire GDAL/OGR (PATH, QGIS_BIN_DIR, install QGIS standard)."""
    exe = name + ('.exe' if sys.platform == 'win32' else '')

    override = os.environ.get('QGIS_BIN_DIR')
    if override:
        cand = Path(override) / exe
        if cand.exists():
            return str(cand)

    on_path = shutil.which(name) or shutil.which(exe)
    if on_path:
        return on_path

    if sys.platform == 'win32':
        roots = []
        for parent in (Path('C:/Program Files'), Path('C:/Program Files (x86)')):
            if parent.exists():
                roots.extend(sorted(parent.glob('QGIS *'), reverse=True))
        for r in (Path('C:/OSGeo4W64'), Path('C:/OSGeo4W')):
            if r.exists():
                roots.append(r)
        for r in roots:
            cand = r / 'bin' / exe
            if cand.exists():
                return str(cand)
    elif sys.platform == 'darwin':
        for app in Path('/Applications').glob('QGIS*.app'):
            cand = app / 'Contents' / 'MacOS' / 'bin' / name
            if cand.exists():
                return str(cand)

    raise FileNotFoundError(
        f"{name} introuvable. Installer QGIS/GDAL ou définir QGIS_BIN_DIR."
    )


def find_qgis_python() -> str:
    """Localise le wrapper Python PyQGIS fourni par QGIS."""
    names = ['python-qgis-ltr.bat', 'python-qgis.bat', 'python-qgis-ltr', 'python-qgis']

    override = os.environ.get('QGIS_BIN_DIR')
    if override:
        for name in names:
            cand = Path(override) / name
            if cand.exists():
                return str(cand)

    for name in names:
        on_path = shutil.which(name)
        if on_path:
            return on_path

    if sys.platform == 'win32':
        roots = []
        for parent in (Path('C:/Program Files'), Path('C:/Program Files (x86)')):
            if parent.exists():
                roots.extend(sorted(parent.glob('QGIS *'), reverse=True))
        for r in (Path('C:/OSGeo4W64'), Path('C:/OSGeo4W')):
            if r.exists():
                roots.append(r)
        for r in roots:
            for name in names:
                cand = r / 'bin' / name
                if cand.exists():
                    return str(cand)

    raise FileNotFoundError(
        "python-qgis introuvable. Installer QGIS ou définir QGIS_BIN_DIR."
    )


def feature_count(ogrinfo: str, gpkg: Path, layer: str) -> int:
    """Compte les entités d'une couche GPKG (0 si introuvable / vide)."""
    try:
        proc = subprocess.run(
            [ogrinfo, '-ro', '-so', '-al', str(gpkg), layer],
            capture_output=True, text=True, check=True,
        )
    except subprocess.CalledProcessError:
        return 0
    for line in proc.stdout.splitlines():
        if line.strip().startswith('Feature Count:'):
            try:
                return int(line.split(':', 1)[1].strip())
            except ValueError:
                return 0
    return 0


def georeference() -> int:
    """Étape 2 — géoréférence chaque raster en GeoTIFF EPSG:4326. Retourne le nombre d'échecs durs."""
    print("→ Étape 2 — Géoréférencement raster")
    gdal_translate = find_tool('gdal_translate')
    print(f"  · gdal_translate: {gdal_translate}")
    RASTERS.mkdir(parents=True, exist_ok=True)

    failures = 0
    for r in RASTERS_TO_GEOREF:
        src, dst, ullr = r['src'], r['dst'], r['ullr']
        if not src.exists():
            print(f"  ⚠ {r['name']}: source absente {src.relative_to(ROOT)}")
            continue
        cmd = [
            gdal_translate,
            '-of', 'GTiff',
            '-a_srs', 'EPSG:4326',
            '-a_ullr', *map(str, ullr),
            '-co', 'COMPRESS=DEFLATE',
            '-co', 'TILED=YES',
            str(src), str(dst),
        ]
        try:
            subprocess.run(cmd, check=True, capture_output=True, text=True)
            print(f"  ✓ {r['name']}: {src.name} → {dst.relative_to(ROOT)}  (ullr={ullr})")
        except subprocess.CalledProcessError as e:
            tail = (e.stderr or e.stdout or '').strip().splitlines()[-1:] or ['gdal_translate failed']
            print(f"  ✗ {r['name']}: {tail[0]}")
            failures += 1
    return failures


def build_project() -> int:
    """Prépare le projet QGIS GUI avec PyQGIS."""
    print("\n→ Projet QGIS GUI")
    try:
        qgis_python = find_qgis_python()
    except FileNotFoundError as e:
        print(f"  ✗ {e}")
        return 1

    script = APP / 'tools' / 'qgis_build_project.py'
    print(f"  · python-qgis: {qgis_python}")
    try:
        proc = subprocess.run(
            [qgis_python, str(script)],
            cwd=str(ROOT),
            capture_output=True,
            text=True,
            encoding='utf-8',
            errors='replace',
            check=True,
        )
    except subprocess.CalledProcessError as e:
        output = (e.stderr or e.stdout or '').strip()
        tail = output.splitlines()[-1:] or ['qgis_build_project.py failed']
        print(f"  ✗ {tail[0]}")
        return 1

    for line in proc.stdout.strip().splitlines():
        print(f"  {line}")
    if proc.stderr.strip():
        for line in proc.stderr.strip().splitlines():
            print(f"  ⚠ {line}")
    return 0


def export_geojson() -> int:
    """Étape 6 — exporte chaque GPKG vers public/data/geojson/. Retourne le nombre d'échecs durs."""
    print("\n→ Étape 6 — Export GeoPackage → GeoJSON")
    ogr2ogr = find_tool('ogr2ogr')
    ogrinfo = find_tool('ogrinfo')
    print(f"  · ogr2ogr: {ogr2ogr}")
    GEOJSON_OUT.mkdir(parents=True, exist_ok=True)

    failures = 0
    for layer, gpkg, geojson in LAYERS_TO_EXPORT:
        if not gpkg.exists():
            print(f"  ⚠ {layer}: {gpkg.relative_to(ROOT)} absent — lancer prepare_qgis_project.py")
            continue
        n = feature_count(ogrinfo, gpkg, layer)
        if n == 0:
            print(f"  ⚠ {layer}: 0 entité — placeholder GeoJSON conservé (digitaliser dans QGIS)")
            continue

        if geojson.exists():
            geojson.unlink()

        cmd = [
            ogr2ogr,
            '-f', 'GeoJSON',
            '-t_srs', 'EPSG:4326',
            '-lco', 'COORDINATE_PRECISION=6',
            '-lco', 'RFC7946=NO',
            str(geojson), str(gpkg), layer,
        ]
        try:
            subprocess.run(cmd, check=True, capture_output=True, text=True)
            print(f"  ✓ {layer}: {n} entités → {geojson.relative_to(ROOT)}")
        except subprocess.CalledProcessError as e:
            tail = (e.stderr or e.stdout or '').strip().splitlines()[-1:] or ['ogr2ogr failed']
            print(f"  ✗ {layer}: {tail[0]}")
            failures += 1
    return failures


def count_csv_rows(path: Path) -> int:
    if not path.exists():
        return 0
    with open(path, newline='', encoding='utf-8') as f:
        return sum(1 for _ in csv.DictReader(f))


def count_geojson_features(path: Path) -> int:
    if not path.exists():
        return 0
    try:
        with open(path, encoding='utf-8') as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError):
        return 0
    return len(data.get('features') or [])


def status_report() -> int:
    """Affiche un état lisible du travail QGIS. Ne modifie rien."""
    print("→ Statut QGIS / frontend")

    try:
        ogrinfo = find_tool('ogrinfo')
        print(f"  · ogrinfo: {ogrinfo}")
    except FileNotFoundError as e:
        print(f"  ✗ {e}")
        return 1

    print("\n  Raster de référence")
    for raster in RASTERS_TO_GEOREF:
        dst = raster['dst']
        if dst.exists():
            size_mb = dst.stat().st_size / 1024 / 1024
            print(f"  ✓ {dst.relative_to(ROOT)} ({size_mb:.1f} MB)")
        else:
            print(f"  ⚠ {dst.relative_to(ROOT)} absent — lancer --georef")

    print("\n  Couches de travail GeoPackage")
    layer_counts = {}
    for layer, gpkg, _geojson in LAYERS_TO_EXPORT:
        if gpkg.exists():
            count = feature_count(ogrinfo, gpkg, layer)
            layer_counts[layer] = count
            print(f"  · {layer:<7} {count:>4} entité(s) dans {gpkg.relative_to(ROOT)}")
        else:
            layer_counts[layer] = 0
            print(f"  ⚠ {layer:<7} absent — lancer prepare_qgis_project.py")

    print("\n  Références CSV pour saisie")
    nations_csv = CSV_IMPORTS / 'nations.csv'
    cities_csv = CSV_IMPORTS / 'cities.csv'
    nations_target = count_csv_rows(nations_csv)
    cities_target = count_csv_rows(cities_csv)
    print(f"  · nations.csv : {nations_target} lignes attendues")
    print(f"  · cities.csv  : {cities_target} lignes de catalogue")

    print("\n  Progression manuelle")
    if nations_target:
        remaining = max(nations_target - layer_counts.get('regions', 0), 0)
        print(f"  · régions : {layer_counts.get('regions', 0)}/{nations_target} tracées ({remaining} restantes)")
    if cities_target:
        remaining = max(cities_target - layer_counts.get('cities', 0), 0)
        print(f"  · villes  : {layer_counts.get('cities', 0)}/{cities_target} placées ({remaining} restantes)")

    print("\n  GeoJSON frontend")
    for layer, _gpkg, geojson in LAYERS_TO_EXPORT:
        n = count_geojson_features(geojson)
        if n:
            print(f"  · {layer:<7} {n:>4} feature(s) dans {geojson.relative_to(ROOT)}")
        else:
            print(f"  · {layer:<7} aucun GeoJSON exporté")

    print("\n  Commandes utiles")
    print("  · exporter après sauvegarde QGIS : python apps/interactive-map/tools/qgis_pipeline.py --export")
    print("  · valider frontend              : python apps/interactive-map/tools/validate_geojson.py")
    print("  · auto-export pendant édition   : python apps/interactive-map/tools/qgis_pipeline.py --watch")
    return 0


def _gpkg_signature(gpkg: Path) -> float:
    """mtime combiné du GeoPackage + des fichiers SQLite WAL (-wal/-shm).

    QGIS écrit dans le WAL avant que SQLite ne checkpoint vers le .gpkg ;
    surveiller uniquement le .gpkg rate les sauvegardes pendant la session.
    On prend le max des mtimes pour repérer toute écriture.
    """
    candidates = [gpkg]
    for suffix in ('-wal', '-shm', '-journal'):
        candidates.append(gpkg.with_name(gpkg.name + suffix))
    mtimes = [p.stat().st_mtime for p in candidates if p.exists()]
    return max(mtimes) if mtimes else 0.0


def watch_mode(poll_interval=2.0):
    """Surveille les .gpkg (+ WAL SQLite) et re-exporte + valide à chaque save.

    Permet de garder le frontend Leaflet à jour pendant la digitalisation.
    Polling simple basé sur mtime — pas de dépendance externe.

    Ctrl+C pour arrêter.
    """
    import time

    print("→ Watch mode — surveillance des couches GeoPackage (+ WAL)")
    print(f"  Polling toutes les {poll_interval}s. Ctrl+C pour arrêter.")
    for _, gpkg, _ in LAYERS_TO_EXPORT:
        print(f"  · {gpkg.relative_to(ROOT)}")

    last_mtimes = {}
    for _, gpkg, _ in LAYERS_TO_EXPORT:
        last_mtimes[gpkg] = _gpkg_signature(gpkg)

    print("\n→ Prêt — sauvegarde dans QGIS pour déclencher un export automatique\n")

    try:
        while True:
            changed = []
            for _, gpkg, _ in LAYERS_TO_EXPORT:
                if not gpkg.exists():
                    continue
                mt = _gpkg_signature(gpkg)
                if mt > last_mtimes.get(gpkg, 0.0):
                    changed.append(gpkg)
                    last_mtimes[gpkg] = mt

            if changed:
                print(f"\n[{time.strftime('%H:%M:%S')}] Modification détectée :")
                for gpkg in changed:
                    print(f"  · {gpkg.relative_to(ROOT)}")
                # Petit délai pour laisser QGIS finir l'écriture
                time.sleep(0.3)
                export_geojson()
                # Validation rapide en sortie discrète
                try:
                    validate_script = APP / 'tools' / 'validate_geojson.py'
                    proc = subprocess.run(
                        [sys.executable, str(validate_script)],
                        capture_output=True, text=True, encoding='utf-8',
                    )
                    last_lines = proc.stdout.strip().splitlines()[-3:]
                    for line in last_lines:
                        print(f"  {line}")
                except Exception as e:
                    print(f"  ⚠ validation échouée : {e}")
                print(f"\n→ Frontend Leaflet : http://localhost:5173 (rechargement auto si Vite tourne)")
                print("  Sauvegarde QGIS pour déclencher un nouveau export...\n")

            time.sleep(poll_interval)

    except KeyboardInterrupt:
        print("\n\n→ Arrêt du watch mode.")
        return 0


def main():
    parser = argparse.ArgumentParser(
        description='K&W — Wrapper QGIS étapes 2 + 6 (géoréférencement + export GeoJSON)',
    )
    parser.add_argument('--georef', action='store_true', help='Étape 2 seule')
    parser.add_argument('--project', action='store_true', help='Reconstruire le projet QGIS GUI avec PyQGIS')
    parser.add_argument('--export', action='store_true', help='Étape 6 seule')
    parser.add_argument('--status', action='store_true', help='État du travail QGIS sans modification')
    parser.add_argument('--watch', action='store_true',
                        help='Surveille les GPKG et re-exporte automatiquement à chaque save QGIS')
    args = parser.parse_args()

    explicit_action = args.project or args.export or args.status or args.watch
    do_georef = args.georef or not explicit_action
    do_project = args.project
    do_export = args.export or (not explicit_action and not args.watch)

    print("K&W — QGIS pipeline")
    print(f"  Root : {ROOT}\n")

    failures = 0
    if args.status:
        failures += status_report()
    if do_georef:
        failures += georeference()
    if do_project:
        failures += build_project()
    if do_export:
        failures += export_geojson()
    if args.watch:
        failures += watch_mode()

    if failures == 0:
        print("\n--- DONE ---")
        if do_project:
            print("\n→ QGIS : recharger apps/interactive-map/qgis/kw-world.qgz si l'interface est déjà ouverte")
        if do_georef or do_export:
            print("\n→ Validation : python apps/interactive-map/tools/validate_geojson.py")
            print("→ Frontend  : cd apps/interactive-map && npm run dev")
        sys.exit(0)
    else:
        print(f"\n--- {failures} échec(s) ---")
        sys.exit(1)


if __name__ == '__main__':
    main()
