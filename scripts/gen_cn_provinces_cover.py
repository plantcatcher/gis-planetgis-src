#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
「中国省情一图览」封面 / 配图生成
==============================================================================
封面直接用地图本体在用的两份数据渲染：
  1) 省级边界：public/maps/_shared/china-provinces.json（含十段线要素）
  2) 各省数据：public/maps/cn-provinces/js/data.js 的 window.PROVINCES

所以封面上的颜色和地图里「GDP 总量」着色是同一套分位配色，改数据重跑即可同步。
产物：public/maps/cn-provinces/cover.jpg（GDP 总量）
      public/maps/cn-provinces/shots/pop.jpg（常住人口）
      public/maps/cn-provinces/shots/percapita.jpg（人均 GDP）

用法：python scripts/gen_cn_provinces_cover.py [gdp|pop|pgdp]
"""

import io
import json
import math
import os
import subprocess
import sys

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
MAPS = os.path.join(PUB, "maps")

GEO = os.path.join(MAPS, "_shared", "china-provinces.json")
DATA_JS = os.path.join(MAPS, "cn-provinces", "js", "data.js")
OUTS = {
    "gdp": os.path.join(MAPS, "cn-provinces", "cover.jpg"),
    "pop": os.path.join(MAPS, "cn-provinces", "shots", "pop.jpg"),
    "pgdp": os.path.join(MAPS, "cn-provinces", "shots", "percapita.jpg"),
}

NODE = r"C:\Users\ZhuanZ\.workbuddy\binaries\node\versions\22.22.2-3\node.exe"

W, H = 1200, 675
BG = (11, 18, 32)          # #0b1220，与地图一致
BORDER = (8, 14, 26)
JD = (56, 189, 248)        # #38bdf8 十段线
BBOX = (73.0, 17.6, 135.5, 54.4)

# 与 js/app.js 的 RAMP 完全一致
RAMP = [
    (12, 43, 74), (29, 92, 143), (43, 143, 190), (88, 195, 214),
    (168, 224, 99), (251, 191, 36), (249, 115, 22), (220, 38, 38),
]


def merc_y(lat):
    """墨卡托纵坐标（与经度同单位：度当量，便于和线性经度共用一个 scale）"""
    lat = max(-85.0, min(85.0, lat))
    return math.degrees(math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))


def make_proj(bbox, w, h):
    minx, miny, maxx, maxy = bbox
    y0, y1 = merc_y(miny), merc_y(maxy)
    span_x = maxx - minx
    span_y = y1 - y0
    # 等比：按可用画布取较小的缩放，避免拉伸
    scale = min(w / span_x, h / span_y)
    ox = (w - span_x * scale) / 2
    oy = (h - span_y * scale) / 2

    def proj(lon, lat):
        return (ox + (lon - minx) * scale, h - oy - (merc_y(lat) - y0) * scale)

    return proj


def load_data(metric):
    """用 Node 执行 data.js，取出 window.PROVINCES 的 code / gdp / pop。
    pgdp（人均 GDP，元）按 gdp(亿元) × 1e4 ÷ pop(万人) 现算，与地图 app.js 取法一致。"""
    code = (
        "global.window={};require(%r);"
        "console.log(JSON.stringify(window.PROVINCES.map(function(p){"
        "return [p.code,p.gdp,p.pop,Math.round(p.gdp*1e4/p.pop)];})));"
        % DATA_JS.replace("\\", "/")
    )
    out = subprocess.check_output([NODE, "-e", code], stderr=subprocess.STDOUT, timeout=60)
    rows = json.loads(out.decode("utf-8"))
    col = {"gdp": 1, "pop": 2, "pgdp": 3}[metric]
    return {str(r[0]): r[col] for r in rows}


def bucket(v, steps):
    i = 0
    while i < len(steps) and v >= steps[i]:
        i += 1
    return i


def main():
    with io.open(GEO, encoding="utf-8") as f:
        geo = json.load(f)
    data = load_data(CURRENT_METRIC)

    # 分位断点（与地图 app.js 的 quantileSteps 一致：n = len(RAMP)）
    vals = sorted(v for v in data.values() if isinstance(v, (int, float)))
    n = len(RAMP)
    steps = [vals[math.floor(len(vals) * i / n)] for i in range(1, n)]

    proj = make_proj(BBOX, W, H)
    img = Image.new("RGB", (W, H), BG)
    dr = ImageDraw.Draw(img)

    jd_polys = []
    for feat in geo["features"]:
        pr = feat["properties"]
        adcode = str(pr.get("adcode", ""))
        geom = feat.get("geometry") or {}
        if not geom:
            continue
        polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
        rings = []
        for poly in polys:
            ring = poly[0] if poly else []
            pts = []
            for c in ring:
                if not c or len(c) < 2:
                    continue
                pts.append(proj(c[0], c[1]))
            if len(pts) >= 3:
                rings.append(pts)

        if adcode.endswith("_JD") or not adcode:      # 十段线：只画线
            jd_polys.extend(rings)
            continue
        v = data.get(adcode)
        color = RAMP[bucket(v, steps)] if v is not None else RAMP[0]
        for pts in rings:
            dr.polygon(pts, fill=color, outline=BORDER)

    for pts in jd_polys:                              # 十段线画在最上层
        if len(pts) >= 2:
            dr.line(pts + [pts[0]], fill=JD, width=2)

    out = OUTS[CURRENT_METRIC]
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img.save(out, "JPEG", quality=88, optimize=True)
    print("[cover:%s] %s  %.0f KB" % (CURRENT_METRIC, os.path.relpath(out, ROOT), os.path.getsize(out) / 1024))


CURRENT_METRIC = "gdp"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        CURRENT_METRIC = sys.argv[1]
    if CURRENT_METRIC not in OUTS:
        print("可用指标：%s" % ", ".join(OUTS))
        sys.exit(2)
    sys.exit(main())
