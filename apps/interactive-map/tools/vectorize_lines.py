"""Experimental stage 1b: extract the INK linework (coast/borders/rivers/labels)
from a canonical raster map as crisp vector shapes, rendered parchment + ink
(DA-aligned Greffe/Armorial). Geometry preserved; color/relief handled later.

Run: python3.13 apps/interactive-map/tools/vectorize_lines.py
"""

import os

import cv2
import numpy as np
import cairosvg

SRC = os.environ.get("MAP_SRC", "apps/interactive-map/public/maps/cortega.jpg")
WORK = "apps/interactive-map/tools/_vec_work"
MAXDIM = int(os.environ.get("MAP_MAXDIM", "1800"))
INK = os.environ.get("DA_INK", "#1f1810")
PAPER = os.environ.get("DA_PAPER", "#efe2b6")
THRESH = int(os.environ.get("INK_THRESH", "110"))

os.makedirs(WORK, exist_ok=True)
base = os.path.splitext(os.path.basename(SRC))[0]

img = cv2.imread(SRC)
h0, w0 = img.shape[:2]
scale = min(1.0, MAXDIM / max(w0, h0))
img = cv2.resize(img, (int(w0 * scale), int(h0 * scale)), interpolation=cv2.INTER_AREA)
H, W = img.shape[:2]

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
# isolate dark ink (lines + labels) on light parchment
_, ink = cv2.threshold(gray, THRESH, 255, cv2.THRESH_BINARY_INV)
ink = cv2.morphologyEx(ink, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))

contours, _ = cv2.findContours(ink, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

paths = []
kept = 0
for c in contours:
    if cv2.contourArea(c) < 4:
        continue
    c = cv2.approxPolyDP(c, 1.0, True)
    if len(c) < 2:
        continue
    d = "M" + " L".join(f"{int(p[0][0])} {int(p[0][1])}" for p in c) + " Z"
    paths.append(f'<path d="{d}"/>')
    kept += 1

svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
    f'viewBox="0 0 {W} {H}">'
    f'<rect width="{W}" height="{H}" fill="{PAPER}"/>'
    f'<g fill="{INK}" fill-rule="evenodd">{"".join(paths)}</g></svg>'
)
svg_out = os.path.join(WORK, f"{base}_lines.svg")
open(svg_out, "w", encoding="utf-8").write(svg)
print(f"{base}: {w0}x{h0} -> {W}x{H}; contours kept={kept}; svg={len(svg)} bytes")

prev = os.path.join(WORK, f"{base}_lines_preview.png")
cairosvg.svg2png(url=svg_out, write_to=prev, output_width=1100)
print("svg_out:", os.path.abspath(svg_out))
print("preview:", os.path.abspath(prev))
