#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
中国地势三级阶梯 —— 数据管线（自建，可复现）

数据源
  DEM：AWS Open Data「Terrain Tiles」（terrarium 编码 PNG，Mapzen 整理，公开数据集）
        https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png
  国界：项目内 public/maps/_shared/china-provinces.json（省级行政区并集，仅用于裁范围）

分级口径（地理教科书通行说法，同时照顾 DEM 的可分性）
  第一阶梯  青藏高原，平均 4000 m 以上
  第二阶梯  1000~2000 m 的高原与盆地（内蒙古高原 / 黄土高原 / 云贵高原 / 四川盆地 / 新疆盆地群）
  第三阶梯  500 m 以下，且位于「大兴安岭—太行山—巫山—雪峰山」一线以东

实现要点
  第一阶梯用 DEM ≥ 3000 m 从青藏种子点生长的连通域（自然贴合昆仑山—祁连山—横断山走向），
  并把柴达木盆地（盆底 2600~3000 m）并入第一阶梯——教科书口径柴达木属第一阶梯；
  第一阶梯内部的零星洼地（湖泊/盐湖）做填洞处理，保持台阶完整。
  第二、三阶梯的界线是教科书给出的山系走向折线，用折线以东+以南的半区作为第三阶梯候选，
  余下的陆地即第二阶梯。这样四川盆地、汾渭谷地会正确落到第二阶梯，而东北平原落到第三阶梯。
  轮廓提取使用 cv2 层级结构（RETR_CCOMP），洞环正确挂回所属外环，
  绝不让 A 阶梯的"洞"变成 B 阶梯的叠盖多边形（旧版的叠盖/点选错乱即源于此）。

输出：WGS84 → GCJ-02 转换后的 GeoJSON（与高德瓦片底图对齐）

用法
  python scripts/build_cn_terrain_steps.py                 # z=7，约 414 张瓦片（首次需下载，之后走缓存）
  python scripts/build_cn_terrain_steps.py --zoom 5        # 快速试跑
"""
import argparse
import io
import json
import math
import os
import urllib.request

import numpy as np
from PIL import Image
import cv2
import shapely
from shapely.geometry import Polygon, MultiPolygon, mapping, shape
from shapely.ops import unary_union

for _k in ('HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy'):
    os.environ.pop(_k, None)

TILE_URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
CACHE = '_dem_cache'
BBOX = (73.0, 17.0, 136.0, 55.0)

# 第二 / 第三阶梯分界：大兴安岭—太行山—巫山—雪峰山，再沿海岸线南延绕过雷州半岛西侧，
# 使广西沿海与海南岛正确落在第三阶梯。
DIVIDE = [
    (121.8, 53.4), (121.2, 51.6), (120.4, 49.6), (119.6, 47.6), (118.6, 45.6),
    (117.6, 43.6), (116.4, 41.9), (115.1, 40.4), (113.9, 39.1), (113.0, 37.6),
    (112.1, 36.1), (111.1, 34.6), (110.4, 33.1), (109.9, 31.9), (109.8, 30.6),
    (110.1, 29.3), (110.4, 27.9), (110.3, 26.6), (109.6, 25.2), (108.9, 23.9),
    (108.4, 22.3), (108.2, 20.6), (108.5, 18.6),
]
SEED = (88.0, 33.0)   # 青藏高原种子点（藏北）

# 柴达木盆地范围框：盆底海拔 2600~3000 m，低于 3000 m 阈值，教科书口径属第一阶梯。
# 框内用 2600 m 阈值补齐盆地（四周环山 ≥3000 m，自然与主体连通）。
QAIDAM_BOX = (89.5, 35.3, 98.5, 39.6)   # lon_min, lat_min, lon_max, lat_max
QAIDAM_Z = 2600

LEVEL_INFO = {
    1: dict(name='第一阶梯', elev='平均 4000 米以上', color='#b07ad6',
            terrain='青藏高原 · 柴达木盆地',
            note='世界屋脊，平均海拔 4000 米以上，是长江、黄河、澜沧江等大江大河的发源地。'),
    2: dict(name='第二阶梯', elev='1000 ~ 2000 米', color='#e0924a',
            terrain='内蒙古高原 · 黄土高原 · 云贵高原 · 四川盆地 · 新疆盆地群',
            note='高原与盆地相间，处在第一阶梯向东部平原过渡的台阶上。'),
    3: dict(name='第三阶梯', elev='500 米以下', color='#3fae86',
            terrain='东北平原 · 华北平原 · 长江中下游平原 · 东南丘陵',
            note='地势最低、最平坦的一级，集中了全国大多数人口与城市。'),
}


def lonlat_to_tile(lon, lat, z):
    n = 2 ** z
    return ((lon + 180.0) / 360.0 * n,
            (1.0 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2.0 * n)


def tile_y_to_lat(y, z):
    return math.degrees(math.atan(math.sinh(math.pi * (1.0 - 2.0 * y / (2 ** z)))))


def tile_x_to_lon(x, z):
    return x / (2 ** z) * 360.0 - 180.0


def fetch_tile(z, x, y):
    d = os.path.join(CACHE, str(z), str(x))
    os.makedirs(d, exist_ok=True)
    fn = os.path.join(d, '%d.png' % y)
    if os.path.exists(fn) and os.path.getsize(fn) > 0:
        return fn
    req = urllib.request.Request(TILE_URL.format(z=z, x=x, y=y), headers={'User-Agent': 'planetgis-build/1.0'})
    open(fn, 'wb').write(urllib.request.urlopen(req, timeout=60).read())
    return fn


def build_dem(z, bbox):
    w, s, e, n = bbox
    x0 = int(lonlat_to_tile(w, n, z)[0]); x1 = int(lonlat_to_tile(e, s, z)[0])
    y0 = int(lonlat_to_tile(w, n, z)[1]); y1 = int(lonlat_to_tile(e, s, z)[1])
    nx, ny = x1 - x0 + 1, y1 - y0 + 1
    print('[dem] z=%d 瓦片 %dx%d = %d 张' % (z, nx, ny, nx * ny))
    dem = np.zeros((ny * 256, nx * 256), dtype=np.float32)
    for j, ty in enumerate(range(y0, y1 + 1)):
        for i, tx in enumerate(range(x0, x1 + 1)):
            try:
                img = np.asarray(Image.open(fetch_tile(z, tx, ty)).convert('RGB'), dtype=np.float32)
            except Exception as ex:
                print('  ! tile %d/%d/%d %s' % (z, tx, ty, ex)); continue
            dem[j * 256:(j + 1) * 256, i * 256:(i + 1) * 256] = \
                img[..., 0] * 256.0 + img[..., 1] + img[..., 2] / 256.0 - 32768.0
        print('  行 %d/%d' % (j + 1, ny), end='\r')
    print()
    h, wd = dem.shape
    lons = np.array([tile_x_to_lon(x0 + (i + 0.5) / 256.0, z) for i in range(wd)])
    lats = np.array([tile_y_to_lat(y0 + (j + 0.5) / 256.0, z) for j in range(h)])
    return dem, lons, lats


# ── WGS84 → GCJ-02 ──────────────────────────────────────────
_A, _EE = 6378245.0, 0.00669342162296594323


def _tl(lng, lat):
    r = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * math.sqrt(abs(lng))
    r += (20.0 * math.sin(6.0 * lng * math.pi) + 20.0 * math.sin(2.0 * lng * math.pi)) * 2.0 / 3.0
    r += (20.0 * math.sin(lat * math.pi) + 40.0 * math.sin(lat / 3.0 * math.pi)) * 2.0 / 3.0
    r += (160.0 * math.sin(lat / 12.0 * math.pi) + 320 * math.sin(lat * math.pi / 30.0)) * 2.0 / 3.0
    return r


def _tg(lng, lat):
    r = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * math.sqrt(abs(lng))
    r += (20.0 * math.sin(6.0 * lng * math.pi) + 20.0 * math.sin(2.0 * lng * math.pi)) * 2.0 / 3.0
    r += (20.0 * math.sin(lng * math.pi) + 40.0 * math.sin(lng / 3.0 * math.pi)) * 2.0 / 3.0
    r += (150.0 * math.sin(lng / 12.0 * math.pi) + 300.0 * math.sin(lng / 30.0 * math.pi)) * 2.0 / 3.0
    return r


def wgs2gcj(lng, lat):
    if not (72.004 <= lng <= 137.8347 and 0.8293 <= lat <= 55.8271):
        return lng, lat
    dlat, dlng = _tl(lng - 105.0, lat - 35.0), _tg(lng - 105.0, lat - 35.0)
    rl = lat / 180.0 * math.pi
    m = 1 - _EE * math.sin(rl) ** 2
    sq = math.sqrt(m)
    dlat = (dlat * 180.0) / ((_A * (1 - _EE)) / (m * sq) * math.pi)
    dlng = (dlng * 180.0) / (_A / sq * math.cos(rl) * math.pi)
    return lng + dlng, lat + dlat


def to_gcj_geom(geom, tol):
    def conv_ring(ring):
        pts = [wgs2gcj(p[0], p[1]) for p in ring]
        g = Polygon([(round(x, 5), round(y, 5)) for x, y in pts])
        return g.simplify(tol, preserve_topology=True)
    polys = list(geom.geoms) if isinstance(geom, MultiPolygon) else [geom]
    out = []
    for p in polys:
        ext = conv_ring(list(p.exterior.coords))
        if ext.is_empty:
            continue
        holes = []
        for i in p.interiors:
            h = conv_ring(list(i.coords))
            if not h.is_empty and h.area > 1e-5:
                holes.append(list(h.exterior.coords))
        out.append(Polygon(list(ext.exterior.coords), holes))
    if not out:
        return None
    g = MultiPolygon(out) if len(out) > 1 else out[0]
    return shapely.make_valid(g)


def rasterize(geom, lons, lats, shape_):
    """经纬度几何 → 栅格 mask（uint8 0/255）"""
    h, w = shape_
    mask = np.zeros((h, w), np.uint8)
    polys = list(geom.geoms) if isinstance(geom, MultiPolygon) else [geom]
    for p in polys:
        if p.is_empty:
            continue
        ext = np.array(p.exterior.coords, dtype=np.float64)
        ix = np.clip(np.searchsorted(lons, ext[:, 0]), 0, w - 1)
        # lats 自北向南递减 → 行号用反向 searchsorted
        iy = np.clip(np.searchsorted(-lats, -ext[:, 1]), 0, h - 1)
        cv2.fillPoly(mask, [np.stack([ix, iy], axis=1).astype(np.int32)], 255)
    return mask


def _ring_lonlat(c, lons, lats, tol):
    """轮廓索引点 → 经纬度环（带简化）；点数不足返回 None"""
    if len(c) < 4:
        return None
    pts = c.reshape(-1, 2)
    ix = np.clip(pts[:, 0], 0, len(lons) - 1)
    iy = np.clip(pts[:, 1], 0, len(lats) - 1)
    ring = [(float(lons[i]), float(lats[j])) for i, j in zip(ix, iy)]
    if len(ring) < 4:
        return None
    if tol > 0:
        line = shapely.LineString(ring).simplify(tol, preserve_topology=True)
        ring = list(line.coords)
        if len(ring) < 4:
            return None
    return ring


def contours_to_geoms(mask, lons, lats, tol, min_area):
    """层级感知：外环+洞环组成 Polygon，杜绝『洞变叠盖多边形』"""
    cnts, hier = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    hier = hier[0] if hier is not None else []
    geoms = []
    for i, c in enumerate(cnts):
        if i >= len(hier) or hier[i][3] != -1:   # 只取顶层（外环）
            continue
        ext = _ring_lonlat(c, lons, lats, tol)
        if ext is None:
            continue
        holes = []
        ch = hier[i][2]
        while ch != -1:
            h = _ring_lonlat(cnts[ch], lons, lats, tol)
            if h is not None:
                holes.append(h)
            ch = hier[ch][0]
        try:
            g = Polygon(ext, holes)
            if not g.is_valid:
                g = g.buffer(0)
            if g.is_empty or g.area < min_area:
                continue
            geoms.append(g)
        except Exception:
            continue
    if not geoms:
        return None
    return shapely.make_valid(unary_union(geoms))


def fill_holes(mask):
    """填掉与外部不连通的封闭背景洞（如高原内部湖泊/洼地）"""
    m2 = cv2.copyMakeBorder(mask, 1, 1, 1, 1, cv2.BORDER_CONSTANT, value=0)
    ffmask = np.zeros((m2.shape[0] + 2, m2.shape[1] + 2), np.uint8)
    cv2.floodFill(m2, ffmask, (0, 0), 255)
    holes = (m2 == 0)[1:-1, 1:-1]
    out = mask.copy()
    out[holes] = 255
    return out


def clean(mask, px_min):
    k = cv2.medianBlur(mask, 5)
    ker = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    k = cv2.morphologyEx(k, cv2.MORPH_CLOSE, ker)
    k = cv2.morphologyEx(k, cv2.MORPH_OPEN, ker)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(k, connectivity=8)
    out = np.zeros_like(k)
    kept = 0
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] >= px_min:
            out[lab == i] = 255
            kept += 1
    return out, kept


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--zoom', type=int, default=7)
    ap.add_argument('--out', default='public/maps/cn-terrain-steps/data/stages.json')
    ap.add_argument('--boundary', default='public/maps/_shared/china-provinces.json')
    ap.add_argument('--min-area-km2', type=float, default=6000.0)
    ap.add_argument('--simplify', type=float, default=0.012)
    args = ap.parse_args()

    dem, lons, lats = build_dem(args.zoom, BBOX)
    h, w = dem.shape
    px_km = 40075.0 / (2 ** args.zoom * 256)
    print('[grid] %dx%d  经度 %.3f..%.3f  纬度 %.3f..%.3f  %.2f km/px'
          % (w, h, lons[0], lons[-1], lats[-1], lats[0], px_km))

    # 国界（省界并集，修复无效几何）
    bnd = json.load(io.open(args.boundary, encoding='utf-8'))
    prov = unary_union([shapely.make_valid(shape(f['geometry'])) for f in bnd['features']])
    prov = shapely.make_valid(prov)
    print('[boundary] %d 个要素 → 并集 %.1f deg²' % (len(bnd['features']), prov.area))
    china = rasterize(prov, lons, lats, (h, w))

    # 第三阶梯候选：分界线以东+以南的大半区（南界压到 4°N，避免切掉两广沿海与海南）
    east_poly = Polygon(DIVIDE + [(155.0, 4.0), (155.0, 60.0), (120.0, 60.0)])
    east = rasterize(shapely.make_valid(east_poly), lons, lats, (h, w))

    # 第一阶梯：DEM ≥ 3000 且从青藏种子点连通；柴达木盆地板内降到 2600 m 补齐
    lon_g, lat_g = np.meshgrid(lons, lats)
    qbox = ((lon_g >= QAIDAM_BOX[0]) & (lon_g <= QAIDAM_BOX[2]) &
            (lat_g >= QAIDAM_BOX[1]) & (lat_g <= QAIDAM_BOX[3]))
    hi = (((dem >= 3000) | (qbox & (dem >= QAIDAM_Z))) & (china > 0)).astype(np.uint8) * 255
    hi = cv2.medianBlur(hi, 5)
    n, lab = cv2.connectedComponents(hi, connectivity=8)
    si = int(np.clip(np.searchsorted(lons, SEED[0]), 0, w - 1))
    sj = int(np.clip(np.searchsorted(-lats, -SEED[1]), 0, h - 1))
    sid = lab[sj, si]
    if sid == 0:
        # 种子点被中值滤波吃掉时，取面积最大的那块
        areas = [(int((lab == i).sum()), i) for i in range(1, n)]
        sid = max(areas)[1] if areas else 0
    stage1 = ((lab == sid) & (china > 0)).astype(np.uint8) * 255
    stage1 = fill_holes(stage1)   # 高原内部洼地（湖泊/盐湖）仍属第一阶梯

    min_px = max(300, args.min_area_km2 / (px_km * px_km))

    def smooth_clean(mask):
        m = cv2.GaussianBlur(mask, (5, 5), 0)          # 先轻度平滑，轮廓不再锯齿
        m = ((m >= 128) * 255).astype(np.uint8)
        return clean(m, min_px)

    # 顺序很重要：一级先平滑+填洞定型，再派生三、二级，保证三台阶互不叠盖
    m1, kept = smooth_clean(stage1)
    m1 = fill_holes(m1)
    print('[stage1] 青藏连通域 %d → 面积 %.0f 万 km²  (候选块 %d)'
          % (sid, (m1 > 0).sum() * px_km * px_km / 10000, n - 1))

    stage3 = ((east > 0) & (china > 0) & (m1 == 0)).astype(np.uint8) * 255
    m3, kept3 = smooth_clean(stage3)
    stage2 = ((china > 0) & (m1 == 0) & (m3 == 0)).astype(np.uint8) * 255
    m2, kept2 = smooth_clean(stage2)

    out_feats = []
    for lvl, mask, kept_n in ((1, m1, kept), (3, m3, kept3), (2, m2, kept2)):
        m = mask
        g = contours_to_geoms(m, lons, lats, args.simplify * 0.4, 0.015)
        if g is None:
            print('  ! 阶梯 %d 无有效多边形' % lvl); continue
        g = shapely.make_valid(g.intersection(prov))
        if g.is_empty:
            print('  ! 阶梯 %d 裁剪后为空' % lvl); continue
        # 丢弃细碎块
        polys = list(g.geoms) if isinstance(g, MultiPolygon) else [g]
        polys = [p for p in polys if p.area > 0.03]
        polys.sort(key=lambda p: -p.area)
        if not polys:
            continue
        g = MultiPolygon(polys) if len(polys) > 1 else polys[0]
        info = LEVEL_INFO[lvl]
        # 面积（按中心纬度修正经度收缩）
        clat = math.radians(g.centroid.y)
        area_km2 = g.area * (111.32 ** 2) * math.cos(clat)
        print('[stage%d] %s  连通块=%d  面积约 %.0f 万 km²'
              % (lvl, info['name'], kept_n, area_km2 / 10000))
        gcj = to_gcj_geom(g, args.simplify)
        if gcj is None:
            continue
        out_feats.append({
            'type': 'Feature',
            'properties': {
                'id': 'stage-%d' % lvl, 'level': lvl, 'name': info['name'],
                'elev': info['elev'], 'terrain': info['terrain'], 'note': info['note'],
                'color': info['color'], 'area_wan_km2': round(area_km2 / 10000, 1)
            },
            'geometry': mapping(gcj)
        })

    out_feats.sort(key=lambda f: f['properties']['level'])
    fc = {'type': 'FeatureCollection', 'features': out_feats}
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    txt = json.dumps(fc, ensure_ascii=False, separators=(',', ':'))
    io.open(args.out, 'w', encoding='utf-8').write(txt)
    print('[out] %s  %d 要素  %.0f KB' % (args.out, len(out_feats), len(txt.encode('utf-8')) / 1024))


if __name__ == '__main__':
    main()
