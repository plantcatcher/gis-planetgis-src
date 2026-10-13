# -*- coding: utf-8 -*-
"""第三批 4 国互动地图封面图生成器（独立脚本，只依赖已生成的 provinces.geojson）。
gen_four_regions.py 会重新生成 geojson 并覆盖 enrich 回填的属性，
所以在 enrich 之后再单独跑本脚本出封面，几何一致、属性不丢。
用法：python scripts/gen_four_covers.py
"""
import json, os, sys
sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from gen_four_regions import META, wrap, pct


def cover(slug, m):
    p = os.path.join(ROOT, "public", "maps", slug, "data", "provinces.geojson")
    fc = json.load(open(p, encoding="utf-8"))
    pts = []
    def walk(o):
        if isinstance(o, (list, tuple)):
            if o and isinstance(o[0], (int, float)):
                pts.append((o[0], o[1]))
            else:
                for i in o:
                    walk(i)
    for f in fc["features"]:
        walk(f["geometry"]["coordinates"])
    lons = [x for x, _ in pts]; lats = [y for _, y in pts]
    med = pct(lons, 0.5)
    bnd = [pct(lons, 0.005), pct(lats, 0.005), pct(lons, 0.995), pct(lats, 0.995)]

    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib.patches import Polygon as MplPoly
    fig, ax = plt.subplots(figsize=(16, 10), dpi=90)
    fig.patch.set_facecolor(m["dark"]); ax.set_facecolor(m["dark"])
    def draw_lon(x):
        return wrap(x + (360 if x - med < -180 else 0))
    for f in fc["features"]:
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            ring = poly[0]
            if len(ring) < 4:
                continue
            ax.add_patch(MplPoly([(draw_lon(x), y) for x, y in ring], closed=True,
                                 facecolor=m["accent"], edgecolor="#ffffff",
                                 linewidth=0.6, alpha=0.85))
    ax.set_xlim(bnd[0] - 1.5, bnd[2] + 1.5); ax.set_ylim(bnd[1] - 1.5, bnd[3] + 1.5)
    ax.set_xticks([]); ax.set_yticks([])
    for sp in ax.spines.values():
        sp.set_visible(False)
    out = os.path.join(ROOT, "public", "maps", slug, f"vizmap-{slug}-cover.jpg")
    fig.savefig(out, dpi=90, bbox_inches="tight", facecolor=m["dark"])
    plt.close(fig)
    print(f"  cover OK  {out}  ({os.path.getsize(out)/1024:.0f} KB)")


if __name__ == "__main__":
    for cc, m in META.items():
        print("###", m["slug"])
        cover(m["slug"], m)
    print("DONE.")
