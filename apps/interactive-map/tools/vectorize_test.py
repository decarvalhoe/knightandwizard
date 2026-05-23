"""Experimental: raster region map -> vector SVG (stage 1 of the DA map pipeline).

Tool under test: vtracer (color raster -> layered SVG). Geometry is preserved
(canon is locked); restyle happens in a later stage. Run with python3.13.
"""

import os
import sys

from PIL import Image
import vtracer
import cairosvg

SRC = os.environ.get("MAP_SRC", "apps/interactive-map/public/maps/cortega.jpg")
WORK = "apps/interactive-map/tools/_vec_work"
MAXDIM = int(os.environ.get("MAP_MAXDIM", "1600"))

os.makedirs(WORK, exist_ok=True)
base = os.path.splitext(os.path.basename(SRC))[0]

# 1. downscale (speed; keep aspect)
img = Image.open(SRC).convert("RGB")
w, h = img.size
scale = min(1.0, MAXDIM / max(w, h))
small = img.resize((max(1, int(w * scale)), max(1, int(h * scale))))
in_png = os.path.join(WORK, f"{base}_small.png")
small.save(in_png)

# 2. vectorize (vtracer, color/stacked/spline)
svg_out = os.path.join(WORK, f"{base}_vtracer.svg")
vtracer.convert_image_to_svg_py(
    in_png,
    svg_out,
    colormode="color",
    hierarchical="stacked",
    mode="spline",
    filter_speckle=10,
    color_precision=6,
    layer_difference=16,
    corner_threshold=60,
    length_threshold=4.0,
    max_iterations=10,
    splice_threshold=45,
    path_precision=6,
)

svg_txt = open(svg_out, encoding="utf-8").read()
print(f"input {w}x{h} -> small {small.size}")
print(f"svg: {len(svg_txt)} bytes, paths={svg_txt.count('<path')}")

# 3. rasterize preview (so we can eyeball fidelity)
prev = os.path.join(WORK, f"{base}_vtracer_preview.png")
cairosvg.svg2png(url=svg_out, write_to=prev, output_width=1100)
print("svg_out:", os.path.abspath(svg_out))
print("preview:", os.path.abspath(prev))
print("orig_small:", os.path.abspath(in_png))
