#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
可视化互动地图 · 地理数据发布脚本
==============================================================================
作用：把「原始数据目录」（SHP 转出的、坐标浮点位数冗余的 GeoJSON）加工成
      适合静态托管的发布产物，落到 public/maps/<slug>/data/。

做三件事：
  1. 坐标降精度（默认 5 位小数 ≈ 1.1 m，肉眼与缩放到 16 级都无差别，体积砍半）
  2. 共享底图数据（如省级行政区边界）统一抽到 public/maps/_shared/，避免每个地图各存一份
  3. 输出一份 sizes 报告，方便盯着「数据有没有越塞越大」

用法：
    python scripts/prep_vizmap_data.py

约定（新增地图时照抄即可）：
    源数据放在  <源工程>/data/*.json     （不进 git，可在 .gitignore 里排除）
    发布产物    public/maps/<slug>/data/*.json
    跨地图复用  public/maps/_shared/*.json
    登记册      src/data/vizmaps.json
"""

import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB_MAPS = os.path.join(ROOT, "public", "maps")
SHARED = os.path.join(PUB_MAPS, "_shared")

PRECISION = 5  # 小数位；5 位 ≈ 1.1 m

# 源工程路径（开发草稿所在处；换机器时改这里）
SRC_PROJECT = os.path.join(os.path.dirname(ROOT), "01PlanetGIS互动地图", "01我国河流分布图")

# (源文件名, 目标相对路径)
JOBS = [
    ("china-provinces.json", os.path.join("_shared", "china-provinces.json")),
    ("rivers.json", os.path.join("cn-rivers", "data", "rivers.json")),
    ("water-areas.json", os.path.join("cn-rivers", "data", "water-areas.json")),
]


def rnd(v):
    if isinstance(v, float):
        return round(v, PRECISION)
    return v


def round_coords(node):
    """递归处理 GeoJSON 坐标树：Point / LineString / Polygon / Multi*"""
    if not node:
        return node
    if isinstance(node[0], (int, float)):
        return [rnd(node[0]), rnd(node[1])]
    return [round_coords(c) for c in node]


def load(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save(obj, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))


def main():
    if not os.path.isdir(SRC_PROJECT):
        print(f"[vizmap] 源工程不存在：{SRC_PROJECT}")
        print("[vizmap] 请修改脚本顶部的 SRC_PROJECT 后重跑。")
        return 1

    report = []
    for src_name, rel_out in JOBS:
        src = os.path.join(SRC_PROJECT, "data", src_name)
        if not os.path.exists(src):
            print(f"[vizmap] ! 跳过（源文件缺失）: {src}")
            continue
        out = os.path.join(PUB_MAPS, rel_out)
        fc = load(src)
        for feat in fc.get("features", []):
            geom = feat.get("geometry")
            if geom and "coordinates" in geom:
                geom["coordinates"] = round_coords(geom["coordinates"])
        before = os.path.getsize(src)
        save(fc, out)
        after = os.path.getsize(out)
        report.append((rel_out, len(fc.get("features", [])), before, after))

    print("[vizmap] 发布产物：")
    for rel, n, before, after in report:
        pct = (1 - after / before) * 100 if before else 0
        print(
            f"  {rel:<42} {n:>5} 要素  "
            f"{before/1048576:6.2f} MB -> {after/1048576:6.2f} MB  (-{pct:.0f}%)"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
