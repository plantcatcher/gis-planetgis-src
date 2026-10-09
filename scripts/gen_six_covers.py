# -*- coding: utf-8 -*-
"""为 6 国互动地图生成封面图（复用已生成的 provinces.geojson）。
输出：public/maps/<slug>/vizmap-<slug>-cover.jpg  +  public/shots/<slug>/vizmap-<slug>-hp1.jpg
"""
import os, json, math
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon as MplPoly
import gen_six_regions as G

ROOT = G.ROOT

def all_points(geom):
    pts = []
    if geom["type"] == "Polygon":
        for r in geom["coordinates"]:
            pts += r
    elif geom["type"] == "MultiPolygon":
        for poly in geom["coordinates"]:
            for r in poly:
                pts += r
    return pts

def wrap(x):
    while x > 180: x -= 360
    while x < -180: x += 360
    return x

def render(slug, m, bnd):
    geo = json.load(open(os.path.join(ROOT, "public", "maps", slug, "data", "provinces.geojson"), encoding="utf-8"))
    feats = geo["features"]
    pts = []
    for f in feats:
        pts += all_points(f["geometry"])
    median = sorted(p[0] for p in pts)[len(pts)//2]
    def dl(lon):
        return wrap(lon + (360 if lon - median < -180 else 0))
    draw = []
    for f in feats:
        polys = f["geometry"]["coordinates"] if f["geometry"]["type"] == "MultiPolygon" else [f["geometry"]["coordinates"]]
        for poly in polys:
            draw.append([(dl(lon), lat) for lon, lat in poly[0]])
    fig, ax = plt.subplots(figsize=(16, 10), dpi=90)
    fig.patch.set_facecolor(m["dark"]); ax.set_facecolor(m["dark"])
    for ext in draw:
        ax.add_patch(MplPoly(ext, closed=True, facecolor=m["accent"], edgecolor="#ffffff", linewidth=0.6, alpha=0.85))
    ax.set_xlim(bnd[0]-2, bnd[2]+2); ax.set_ylim(bnd[1]-2, bnd[3]+2)
    ax.set_xticks([]); ax.set_yticks([])
    for sp in ax.spines.values(): sp.set_visible(False)
    out1 = os.path.join(ROOT, "public", "maps", slug, f"vizmap-{slug}-cover.jpg")
    out2 = os.path.join(ROOT, "public", "shots", slug, f"vizmap-{slug}-hp1.jpg")
    kw = {}
    try:
        kw = {"pil_kwargs": {"quality": 86}}
    except Exception:
        pass
    fig.savefig(out1, dpi=90, bbox_inches="tight", facecolor=m["dark"], **kw)
    fig.savefig(out2, dpi=90, bbox_inches="tight", facecolor=m["dark"], **kw)
    plt.close(fig)
    print(f"{slug}: cover={os.path.getsize(out1)/1e3:.0f}KB  hp_1={os.path.getsize(out2)/1e3:.0f}KB")

if __name__ == "__main__":
    for cc, m in G.META.items():
        slug = m["slug"]
        # 取 config.js 里的 bounds
        cfg = open(os.path.join(ROOT, "public", "maps", slug, "js", "config.js"), encoding="utf-8").read()
        import re
        mm = re.search(r"bounds:\s*\[([^\]]+)\]", cfg)
        bnd = [float(x) for x in mm.group(1).split(",")]
        # 渲染用经度需连续：若 hi>180 改成 180（已修正）
        render(slug, m, bnd)
    print("covers done")
