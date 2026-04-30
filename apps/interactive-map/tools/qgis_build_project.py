#!/usr/bin/env python3
"""
Construit un projet QGIS prêt pour la digitalisation.

À lancer avec le Python livré par QGIS :
    "C:\\Program Files\\QGIS 3.44.9\\bin\\python-qgis-ltr.bat" apps/interactive-map/tools/qgis_build_project.py

Le script charge uniquement ce qui est fiable :
- le GeoTIFF mondial géoréférencé ;
- les couches GeoPackage regions/cities/routes ;
- styles, labels, snapping et édition topologique.
"""

import sys
import warnings
from pathlib import Path

from qgis.core import (
    Qgis,
    QgsApplication,
    QgsCoordinateReferenceSystem,
    QgsEditorWidgetSetup,
    QgsFillSymbol,
    QgsLineSymbol,
    QgsMarkerSymbol,
    QgsPalLayerSettings,
    QgsProject,
    QgsRasterLayer,
    QgsSingleSymbolRenderer,
    QgsSnappingConfig,
    QgsTextBufferSettings,
    QgsTextFormat,
    QgsUnitTypes,
    QgsVectorLayer,
    QgsVectorLayerSimpleLabeling,
)
from qgis.PyQt.QtGui import QColor, QFont

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

warnings.filterwarnings('ignore', category=DeprecationWarning)

ROOT = Path(__file__).resolve().parent.parent.parent.parent
APP = ROOT / 'apps' / 'interactive-map'
QGIS_DIR = APP / 'qgis'
LAYERS_DIR = QGIS_DIR / 'layers'
RASTERS_DIR = QGIS_DIR / 'rasters'
PROJECT_QGZ = QGIS_DIR / 'kw-world.qgz'
PROJECT_QGS = QGIS_DIR / 'kw-world.qgs'


def init_qgis():
    app = QgsApplication.instance()
    if app is not None:
        return None
    app = QgsApplication([], False)
    app.initQgis()
    return app


def assert_valid(layer, label):
    if not layer.isValid():
        raise RuntimeError(f"Couche invalide: {label}")


def add_raster(project, group):
    tif = RASTERS_DIR / 'terres-oubliees.tif'
    if not tif.exists():
        raise FileNotFoundError(f"{tif} absent. Lance d'abord qgis_pipeline.py --georef")

    layer = QgsRasterLayer(str(tif), 'Carte mondiale géoréférencée')
    assert_valid(layer, tif.name)
    layer.setOpacity(0.88)
    project.addMapLayer(layer, False)
    group.addLayer(layer)
    return layer


def apply_labels(layer, field_name, size):
    settings = QgsPalLayerSettings()
    settings.enabled = True
    settings.fieldName = field_name

    text_format = QgsTextFormat()
    text_format.setFont(QFont('Arial'))
    text_format.setSize(size)
    text_format.setSizeUnit(QgsUnitTypes.RenderPoints)
    text_format.setColor(QColor('#1f1a14'))

    buffer = QgsTextBufferSettings()
    buffer.setEnabled(True)
    buffer.setSize(1.2)
    buffer.setColor(QColor('#f7ead0'))
    text_format.setBuffer(buffer)

    settings.setFormat(text_format)
    layer.setLabeling(QgsVectorLayerSimpleLabeling(settings))
    layer.setLabelsEnabled(True)


def apply_value_map(layer, field_name, values):
    idx = layer.fields().indexFromName(field_name)
    if idx < 0:
        return
    layer.setEditorWidgetSetup(
        idx,
        QgsEditorWidgetSetup('ValueMap', {'map': [{v: v} for v in values]}),
    )


def apply_aliases(layer, aliases):
    for field_name, alias in aliases.items():
        idx = layer.fields().indexFromName(field_name)
        if idx >= 0:
            layer.setFieldAlias(idx, alias)


def load_regions(project, group):
    source = f"{LAYERS_DIR / 'regions.gpkg'}|layername=regions"
    layer = QgsVectorLayer(source, 'Régions à tracer', 'ogr')
    assert_valid(layer, 'regions.gpkg')

    symbol = QgsFillSymbol.createSimple({
        'color': '222,138,52,55',
        'outline_color': '156,71,30,230',
        'outline_width': '0.35',
        'outline_width_unit': 'MM',
    })
    layer.setRenderer(QgsSingleSymbolRenderer(symbol))
    layer.setOpacity(0.82)
    apply_labels(layer, 'name', 9)
    apply_aliases(layer, {
        'id': 'ID canonique',
        'name': 'Nom affiché',
        'category': 'Catégorie',
        'color': 'Couleur',
        'capital': 'Capitale',
        'blason_image': 'Blason',
        'regional_map': 'Carte régionale',
    })
    apply_value_map(layer, 'category', ['nation', 'duchy', 'wilderness', 'mountain_range', 'location'])

    project.addMapLayer(layer, False)
    group.addLayer(layer)
    return layer


def load_cities(project, group):
    source = f"{LAYERS_DIR / 'cities.gpkg'}|layername=cities"
    layer = QgsVectorLayer(source, 'Villes à placer', 'ogr')
    assert_valid(layer, 'cities.gpkg')

    symbol = QgsMarkerSymbol.createSimple({
        'name': 'circle',
        'color': '164,42,42,255',
        'outline_color': '255,244,220,255',
        'outline_width': '0.35',
        'size': '2.2',
        'size_unit': 'MM',
    })
    layer.setRenderer(QgsSingleSymbolRenderer(symbol))
    apply_labels(layer, 'name', 8)
    apply_aliases(layer, {
        'id': 'ID canonique',
        'name': 'Nom affiché',
        'parent_region': 'Région parent',
        'role': 'Rôle',
        'notes': 'Notes',
    })
    apply_value_map(layer, 'role', ['capital', 'major_city', 'town', 'village', 'gate'])

    project.addMapLayer(layer, False)
    group.addLayer(layer)
    return layer


def load_routes(project, group):
    source = f"{LAYERS_DIR / 'routes.gpkg'}|layername=routes"
    layer = QgsVectorLayer(source, 'Routes / fleuves optionnels', 'ogr')
    assert_valid(layer, 'routes.gpkg')

    symbol = QgsLineSymbol.createSimple({
        'color': '51,92,128,210',
        'width': '0.45',
        'width_unit': 'MM',
    })
    layer.setRenderer(QgsSingleSymbolRenderer(symbol))
    apply_labels(layer, 'name', 7)
    apply_aliases(layer, {'id': 'ID', 'name': 'Nom', 'type': 'Type'})
    apply_value_map(layer, 'type', ['road', 'river', 'border'])

    project.addMapLayer(layer, False)
    group.addLayer(layer)
    return layer


def configure_snapping(project, editable_layers):
    project.setTopologicalEditing(True)

    config = QgsSnappingConfig(project)
    config.setEnabled(True)
    config.setMode(QgsSnappingConfig.AdvancedConfiguration)
    config.setType(QgsSnappingConfig.VertexAndSegment)
    config.setTolerance(0.25)
    config.setUnits(Qgis.MapToolUnit.Project)
    config.setIntersectionSnapping(True)

    for layer in editable_layers:
        config.setIndividualLayerSettings(
            layer,
            QgsSnappingConfig.IndividualLayerSettings(
                True,
                QgsSnappingConfig.VertexAndSegment,
                0.25,
                Qgis.MapToolUnit.Project,
            ),
        )

    project.setSnappingConfig(config)


def main():
    app = init_qgis()

    project = QgsProject.instance()
    project.clear()
    project.setFileName(str(PROJECT_QGZ))
    project.setTitle('Knight and Wizard — Digitalisation cartes')
    project.setCrs(QgsCoordinateReferenceSystem('EPSG:4326'))
    project.writeEntry('Paths', 'Absolute', False)
    project.styleSettings().removeProjectStyle()
    project.styleSettings().setStyleDatabasePaths([])

    root = project.layerTreeRoot()
    raster_group = root.addGroup('Raster de référence')
    vector_group = root.addGroup('Vecteurs à digitaliser')

    add_raster(project, raster_group)
    regions = load_regions(project, vector_group)
    cities = load_cities(project, vector_group)
    routes = load_routes(project, vector_group)
    configure_snapping(project, [regions, cities, routes])

    if not project.write(str(PROJECT_QGZ)):
        raise RuntimeError(f"Écriture impossible: {PROJECT_QGZ}")
    if not project.write(str(PROJECT_QGS)):
        raise RuntimeError(f"Écriture impossible: {PROJECT_QGS}")

    print("Projet QGIS prêt")
    print(f"  QGZ : {PROJECT_QGZ}")
    print(f"  QGS : {PROJECT_QGS}")
    print("  Couches : raster mondial + regions/cities/routes")
    print("  Aides   : styles, labels, snapping, édition topologique")

    if app is not None:
        app.exitQgis()

    # QGIS peut créer ce cache de styles dans le cwd du script. Il n'est pas
    # nécessaire au projet et ne doit pas polluer le repo.
    stray_style_db = ROOT / 'symbology-style.db'
    if stray_style_db.exists():
        stray_style_db.unlink()


if __name__ == '__main__':
    main()
