#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
可视化互动地图 · 封面图生成
==============================================================================
用「真实地理数据」渲染封面 SVG，而不是找一张通用配图：省界轮廓 + 分级河流
线条直接来自 public/maps/<slug>/data/*.json，所以封面和地图本身是同一份数据，
改数据后重跑本脚本封面自动跟着更新。

产物落在 public/<slug>-cover.svg（主站封面约定：作品 md 的 cover 字段指向它）。

用法：
    python scripts/gen_vizmap_cover.py [slug]
"""

import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
MAPS = os.path.join(PUB, "maps")

W, H = 1200, 675
PAD = 40

# 每个地图的封面配置：数据文件 + 绘制样式
COVERS = {
    "cn-rivers": {
        "bbox": (73.0, 17.5, 135.5, 54.5),  # minx, miny, maxx, maxy
        "provinces": "_shared/china-provinces.json",
        "water": "cn-rivers/data/water-areas.json",
        # (数据文件, 级别, 颜色, 线宽, 不透明度, 抽稀阈值px)
        "rivers": [
            ("cn-rivers/data/rivers.json", 5, "#9ca3af", 0.6, 0.35, 1.6),
            ("cn-rivers/data/rivers.json", 4, "#34d399", 0.9, 0.5, 1.2),
            ("cn-rivers/data/rivers.json", 2, "#38bdf8", 2.0, 0.95, 0.6),
            ("cn-rivers/data/rivers.json", 1, "#ef4444", 3.2, 1.0, 0.5),
        ],
        "title": "我国主要河流分布图",
        "subtitle": "一级 · 二级 · 四级 · 五级水系 · 点击查询",
    },
}


def load(rel):
    with open(os.path.join(MAPS, rel), "r", encoding="utf-8") as f:
        return json.load(f)


class Proj:
    """等距圆柱投影到画布（封面尺度足够，不做复杂投影）"""

    def __init__(self, bbox):
        self.x0, self.y0, self.x1, self.y1 = bbox
        sx = (W - 2 * PAD) / (self.x1 - self.x0)
        sy = (H - 2 * PAD) / (self.y1 - self.y0)
        self.s = min(sx, sy)
        self.ox = PAD + ((W - 2 * PAD) - (self.x1 - self.x0) * self.s) / 2
        self.oy = PAD + ((H - 2 * PAD) - (self.y1 - self.y0) * self.s) / 2

    def xy(self, lon, lat):
        return (
            round(self.ox + (lon - self.x0) * self.s, 1),
            round(self.oy + (self.y1 - lat) * self.s, 1),
        )


def rings(geom):
    """Geometry -> 环（坐标数组）列表"""
    t = geom["type"]
    c = geom["coordinates"]
    if t == "Polygon":
        return c
    if t == "MultiPolygon":
        return [r for poly in c for r in poly]
    if t == "LineString":
        return [c]
    if t == "MultiLineString":
        return c
    return []


def rdp(pts, eps):
    """Ramer–Douglas–Peucker 抽稀（在像素空间做，直接控制 SVG 体积与观感）"""
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        ax, ay = pts[i]
        bx, by = pts[j]
        dx, dy = bx - ax, by - ay
        norm = (dx * dx + dy * dy) ** 0.5
        worst, wi = -1.0, -1
        for k in range(i + 1, j):
            px, py = pts[k]
            if norm == 0:
                d = ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5
            else:
                d = abs(dx * (ay - py) - dy * (ax - px)) / norm
            if d > worst:
                worst, wi = d, k
        if worst > eps:
            keep[wi] = True
            stack.append((i, wi))
            stack.append((wi, j))
    out = []
    for p, k in zip(pts, keep):
        if k and (not out or p != out[-1]):
            out.append(p)
    return out


def path_of(geom, proj, eps=0.7):
    out = []
    for r in rings(geom):
        if len(r) < 2:
            continue
        pts = [proj.xy(p[0], p[1]) for p in r]
        pts = rdp(pts, eps)
        if len(pts) < 2:
            continue
        out.append("M" + "L".join(f"{x} {y}" for x, y in pts))
    return "".join(out)


def build(slug):
    cfg = COVERS[slug]
    proj = Proj(cfg["bbox"])
    parts = []

    # 省界底
    if cfg.get("provinces"):
        d = []
        for f in load(cfg["provinces"])["features"]:
            d.append(path_of(f["geometry"], proj, 1.0))
        parts.append(
            f'<path d="{"".join(d)}" fill="#16233b" fill-opacity="0.55" '
            f'stroke="#cbd5e1" stroke-opacity="0.30" stroke-width="0.8" stroke-linejoin="round"/>'
        )

    # 水域面
    if cfg.get("water"):
        d = []
        for f in load(cfg["water"])["features"]:
            d.append(path_of(f["geometry"], proj, 1.2))
        parts.append(
            f'<path d="{"".join(d)}" fill="#1d4ed8" fill-opacity="0.4" stroke="#60a5fa" '
            f'stroke-opacity="0.45" stroke-width="0.4"/>'
        )

    # 分级河流（低级别先画，高级别压在上面）
    for rel, level, color, width, opacity, eps in cfg["rivers"]:
        fc = load(rel)
        d = []
        for f in fc["features"]:
            if f["properties"].get("level") != level:
                continue
            d.append(path_of(f["geometry"], proj, eps))
        parts.append(
            f'<path d="{"".join(d)}" fill="none" stroke="{color}" stroke-opacity="{opacity}" '
            f'stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"/>'
        )

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{cfg['title']}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b1220"/>
      <stop offset="1" stop-color="#0f1c33"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.78" cy="0.18" r="0.6">
      <stop offset="0" stop-color="#38bdf8" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#38bdf8" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#bg)"/>
  <rect width="{W}" height="{H}" fill="url(#glow)"/>
  <g>{"".join(parts)}</g>
  <g font-family="PingFang SC, Microsoft YaHei, Noto Sans CJK SC, sans-serif">
    <text x="48" y="{H - 96}" fill="#e2e8f0" font-size="52" font-weight="700">{cfg['title']}</text>
    <text x="48" y="{H - 58}" fill="#94a3b8" font-size="24">{cfg['subtitle']}</text>
    <g transform="translate({W - 300} {H - 84})" font-size="17" fill="#cbd5e1">
      <line x1="0" y1="0" x2="26" y2="0" stroke="#ef4444" stroke-width="4"/>
      <text x="36" y="6">一级河流</text>
      <line x1="0" y1="30" x2="26" y2="30" stroke="#38bdf8" stroke-width="3"/>
      <text x="36" y="36">二级支流</text>
      <line x1="150" y1="0" x2="176" y2="0" stroke="#34d399" stroke-width="2.5"/>
      <text x="186" y="6">四级支流</text>
      <line x1="150" y1="30" x2="176" y2="30" stroke="#9ca3af" stroke-width="2"/>
      <text x="186" y="36">五级支流</text>
    </g>
  </g>
</svg>
'''
    out = os.path.join(PUB, f"{slug}-cover.svg")
    with open(out, "w", encoding="utf-8", newline="\n") as f:
        f.write(svg)
    print(f"[cover] {os.path.relpath(out, ROOT)}  {os.path.getsize(out)/1024:.0f} KB")


if __name__ == "__main__":
    slug = sys.argv[1] if len(sys.argv) > 1 else list(COVERS)[0]
    build(slug)
