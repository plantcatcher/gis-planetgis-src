#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
中国三维 DEM 沙盘 —— 数据管线（自建，可复现）

数据源（本地，真实高程，WGS84 经纬度 GeoTIFF）
  D:\\01 ArcGIS制图计划\\09 数据集\\01 DEM数据集\\03 中国陆地区域的DEM地形\\中国陆地区域.tif
  格式：int16，无压缩，128x128 分块；ModelPixelScale=0.00416667°/px（≈15 角秒），
        ModelTiepoint 左上角 (73.4958333°E, 53.5625°N)；覆盖中国全境（含南海）。
  国界：项目内 public/maps/_shared/china-provinces.json（省级行政区并集，用于描边）

输出（public/maps/cn-dem-sandbox/）
  data/dem.bin      Float32 LE 高程栅格（rows*cols，单位米，负值为低于海平面）
  data/meta.json   网格元信息（cols/rows/lon0/lat0/dlon/dlat/min/max）
  data/boundary.js window.CN_BOUNDARY = 国界折线（经纬度，已简化）
  data/markers.js  window.CN_MARKERS  = 著名山峰/盆地/高原/平原标注（高程用 DEM 回填）
  cover.jpg        横版（1200x675）高程晕渲封面（自托管，零外网依赖）

用法
  python scripts/build_cn_dem_sandbox.py
  python scripts/build_cn_dem_sandbox.py --cols 1024   # 更高分辨率（更慢、文件更大）
"""
import argparse
import io
import json
import math
import os
import struct

import numpy as np
from PIL import Image, ImageDraw
import shapely
from shapely.geometry import shape, MultiPolygon
from shapely.ops import unary_union
import tifffile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TIF = r"D:\01 ArcGIS制图计划\09 数据集\01 DEM数据集\03 中国陆地区域的DEM地形\中国陆地区域.tif"
BBOX = (73.5, 17.5, 135.08, 53.56)      # lon_min, lat_min, lon_max, lat_max
SRC_LON0 = 73.49583333333333            # 像素(0,0) 对应经度
SRC_LAT_TL = 53.5625                    # 像素(0,0) 对应纬度（顶行，北）
SRC_D = 0.004166666666666667            # 每像素度数
BOUNDARY_SRC = os.path.join(ROOT, 'public/maps/_shared/china-provinces.json')
OUT_DIR = os.path.join(ROOT, 'public/maps/cn-dem-sandbox')

# 著名山峰 / 盆地 / 高原 / 平原（高程先用通用值，导出前用 DEM 采样回填）
MARKERS = [
    dict(name='珠穆朗玛峰', lon=86.90, lat=27.99, elev=8848.86, type='peak',
         note='世界最高峰，喜马拉雅山脉主峰，中国尼泊尔交界。'),
    dict(name='乔戈里峰（K2）', lon=76.51, lat=35.88, elev=8611, type='peak',
         note='喀喇昆仑山脉主峰，世界第二高峰，攀登难度极高。'),
    dict(name='贡嘎山', lon=101.88, lat=29.59, elev=7556, type='peak',
         note='横断山脉最高峰，蜀山之王，垂直自然带极丰富。'),
    dict(name='梅里雪山·卡瓦格博', lon=98.59, lat=28.44, elev=6740, type='peak',
         note='怒山山脉主峰，藏传佛教神山，从未被登顶。'),
    dict(name='泰山', lon=117.10, lat=36.25, elev=1532.7, type='peak',
         note='五岳之首，华北平原东缘的断块山，文化地位极高。'),
    dict(name='华山', lon=110.09, lat=34.49, elev=2154.9, type='peak',
         note='五岳之西岳，以险峻的花岗岩陡壁闻名。'),
    dict(name='黄山', lon=118.17, lat=30.13, elev=1864.8, type='peak',
         note='皖南花岗岩名山，奇松、怪石、云海、温泉四绝。'),
    dict(name='峨眉山', lon=103.33, lat=29.52, elev=3099, type='peak',
         note='邛崃山脉支脉，普贤道场，垂直气候带明显。'),
    dict(name='长白山·白头峰', lon=128.08, lat=41.99, elev=2749, type='peak',
         note='东北最高峰，休眠火山，天池为中朝界湖。'),
    dict(name='昆仑山', lon=94.00, lat=35.50, elev=7167, type='peak',
         note='亚洲脊柱，横亘青藏高原北缘，分隔青藏与塔里木。'),
    dict(name='吐鲁番盆地', lon=89.2, lat=42.9, elev=-154, type='basin',
         note='艾丁湖湖面低于海平面 154 米，中国陆地最低点。'),
    dict(name='塔里木盆地', lon=84.0, lat=39.5, elev=1000, type='basin',
         note='中国最大内陆盆地，被天山、昆仑山、阿尔金山环抱。'),
    dict(name='准噶尔盆地', lon=85.5, lat=45.5, elev=500, type='basin',
         note='天山以北大型内陆盆地，西侧缺口迎西风降水。'),
    dict(name='柴达木盆地', lon=95.0, lat=37.5, elev=2600, type='basin',
         note='青藏高原东北缘的高原盆地，富含盐湖与油气。'),
    dict(name='四川盆地', lon=105.0, lat=30.5, elev=500, type='basin',
         note='群山环抱的红色盆地，气候湿润、人口稠密。'),
    dict(name='青藏高原', lon=88.0, lat=33.0, elev=4500, type='plateau',
         note='世界屋脊，平均海拔 4000 米以上，大江大河发源地。'),
    dict(name='云贵高原', lon=103.0, lat=25.5, elev=2000, type='plateau',
         note='喀斯特广布，地形崎岖、峰林溶洞发育。'),
    dict(name='内蒙古高原', lon=112.0, lat=42.0, elev=1100, type='plateau',
         note='坦荡的高原，东西跨度大，草原与戈壁交错。'),
    dict(name='华北平原', lon=116.0, lat=37.0, elev=50, type='plain',
         note='中国第二大平原，黄土沉积深厚、耕地连片。'),
    dict(name='东北平原', lon=125.0, lat=45.0, elev=200, type='plain',
         note='中国最大平原，由三江、松嫩、辽河平原组成。'),
    dict(name='长江中下游平原', lon=113.0, lat=30.0, elev=50, type='plain',
         note='河湖纵横的水乡平原，鱼米之乡。'),
]


def load_and_downsample(cols):
    """整读 TIF → 按 BBOX 裁剪视图 → 块平均降采样（不复制大数组，内存可控）"""
    print('[tif] 读取 %s' % TIF)
    with tifffile.TiffFile(TIF) as tif:
        full = tif.pages[0].asarray()          # int16 (H, W)
    H, W = full.shape
    print('[tif] 尺寸 %dx%d  dtype=%s' % (W, H, full.dtype))

    c0 = max(0, int(math.floor((BBOX[0] - SRC_LON0) / SRC_D)))
    c1 = min(W - 1, int(math.ceil((BBOX[2] - SRC_LON0) / SRC_D)))
    r1 = min(H - 1, int(math.ceil((SRC_LAT_TL - BBOX[1]) / SRC_D)))   # 最南=lat_min
    cropr = full[0:r1 + 1, c0:c1 + 1]                      # 视图，不复制
    ch, cw = cropr.shape
    lat_span = BBOX[3] - BBOX[1]
    lon_span = BBOX[2] - BBOX[0]
    rows = max(2, int(round(cols * lat_span / lon_span)))
    sh = ch // rows
    sw = cw // cols
    block = cropr[:rows * sh, :cols * sw]
    small = block.reshape(rows, sh, cols, sw).mean(axis=(1, 3)).astype(np.float32)
    del full
    small = np.clip(small, -500.0, 9200.0)
    print('[dem] 降采样 -> %dx%d  经度 %.4f..%.4f  纬度 %.4f..%.4f'
          % (cols, rows, SRC_LON0 + (c0 + 0.5 * sw) * SRC_D,
             SRC_LON0 + (c1 - 0.5 * sw) * SRC_D,
             SRC_LAT_TL - (r1 - 0.5 * sh) * SRC_D,
             SRC_LAT_TL - (0.5 * sh) * SRC_D))
    print('[elev] min %.1f  max %.1f m' % (small.min(), small.max()))

    rowc = np.arange(rows) * sh + sh / 2.0
    colc = np.arange(cols) * sw + sw / 2.0
    lats = SRC_LAT_TL - rowc * SRC_D                      # 顶行=r0=0
    lons = SRC_LON0 + (colc + c0) * SRC_D
    return small, lons, lats


# ── 高程晕渲配色（与前端 app.js 保持一致）───────────────────────
HYPSO = [
    (-300.0, (28, 64, 110)),
    (0.0,    (46, 110, 165)),
    (200.0,  (46, 139, 87)),
    (500.0,  (111, 174, 95)),
    (1000.0, (185, 201, 95)),
    (1500.0, (232, 211, 107)),
    (2500.0, (224, 168, 90)),
    (3500.0, (200, 120, 60)),
    (4500.0, (156, 90, 50)),
    (5500.0, (201, 191, 176)),
    (7000.0, (255, 255, 255)),
]


def hypsocolor(elev):
    if elev <= HYPSO[0][0]:
        return HYPSO[0][1]
    if elev >= HYPSO[-1][0]:
        return HYPSO[-1][1]
    for i in range(len(HYPSO) - 1):
        e0, c0 = HYPSO[i]; e1, c1 = HYPSO[i + 1]
        if e0 <= elev <= e1:
            t = (elev - e0) / (e1 - e0)
            return tuple(int(c0[k] + (c1[k] - c0[k]) * t) for k in range(3))
    return HYPSO[-1][1]


def _iter_polys(geom):
    """递归展开并只产出 Polygon（忽略点/线/空几何）"""
    if geom is None:
        return
    t = geom.geom_type
    if t == 'Polygon':
        yield geom
    elif t == 'MultiPolygon':
        for p in geom.geoms:
            yield p
    elif t == 'GeometryCollection':
        for g in geom.geoms:
            yield from _iter_polys(g)


# 只保留三个主岛：大陆（≈958 deg²）、台湾岛（3.37）、海南岛（3.19）。
# 其余多边形均为面积 < 0.12 deg² 的碎岛与南海礁体（含九段线断线来源），全部丢弃。
MAIN_AREA_MIN = 1.0        # 单位 deg²


def main_polys():
    """省级行政区并集 → 按面积降序，只返回大陆 / 台湾岛 / 海南岛三个多边形。"""
    bnd = json.load(io.open(BOUNDARY_SRC, encoding='utf-8'))
    geoms = [shapely.make_valid(shape(f['geometry'])) for f in bnd['features']]
    union = shapely.make_valid(unary_union(geoms))
    polys = [p for p in _iter_polys(union) if p.area > MAIN_AREA_MIN]
    polys.sort(key=lambda p: p.area, reverse=True)
    print('[main] 主岛多边形 %d 个，面积 %s'
          % (len(polys), ' / '.join('%.2f' % p.area for p in polys)))
    return polys


def make_boundary(polys):
    """仅输出三个主岛的外环轮廓（不含内环、不含碎岛、不含九段线）。"""
    lines = []
    for p in polys:
        g = p.exterior.simplify(0.04, preserve_topology=True)
        if len(g.coords) < 3:
            continue
        lines.append([[round(float(x), 4), round(float(y), 4)] for x, y in g.coords])
    return lines


def make_mask(polys, cols, rows, lon0, lat0, dlon, dlat):
    """把三个主岛栅格化为掩膜，境内=255。境外将在前端沉为中性底座，
    使中国地形像一块浮出底座的模型，边界自然贴合地形边缘。"""
    img = Image.new('L', (cols, rows), 0)
    dr = ImageDraw.Draw(img)
    for p in polys:
        ext = [(int(round((x - lon0) / dlon)), int(round((y - lat0) / dlat)))
               for x, y in p.exterior.coords]
        if len(ext) >= 3:
            dr.polygon(ext, fill=255)
    return np.array(img, dtype=np.uint8)


# ── Web 墨卡托（与前端 app.js 一致，单位 km）────────────────────
EARTH_R_KM = 6378.137
KM_PER_DEG = math.pi * EARTH_R_KM / 180.0        # ≈111.3195 km/deg


def merc_y_km(lat):
    return math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) * EARTH_R_KM


def make_cover(small, mask, cols, rows):
    az = math.radians(315.0); alt = math.radians(45.0)
    lx = math.cos(alt) * math.sin(az)
    ly = math.cos(alt) * math.cos(az)
    lz = math.sin(alt)
    gy, gx = np.gradient(small)
    nx = -gx; ny = -gy; nz = 1.0
    norm = np.sqrt(nx * nx + ny * ny + nz * nz) + 1e-9
    shade = np.clip((nx * lx + ny * ly + nz * lz) / norm, 0, 1)
    shade = 0.55 + 0.6 * shade

    # 境内：高程晕渲；境外：中性底座（与前端 app.js 的 TRAY 一致）
    BASE = np.array([10, 16, 27], dtype=np.float32)
    land = mask > 0
    lcolors = np.array([hypsocolor(e) for e in small.flatten()], dtype=np.float32).reshape(rows, cols, 3)
    shaded = np.clip(lcolors * shade[:, :, None], 0, 255)
    h_img = np.zeros((rows, cols, 3), dtype=np.uint8)
    h_img[land] = shaded[land].astype(np.uint8)
    h_img[~land] = BASE.astype(np.uint8)

    img = Image.fromarray(h_img, 'RGB')
    tw, th = 1200, 675
    scale = max(tw / cols, th / rows)
    nw, nh = int(cols * scale), int(rows * scale)
    img = img.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new('RGB', (tw, th), (8, 14, 24))
    canvas.paste(img, ((tw - nw) // 2, (th - nh) // 2))
    out = os.path.join(OUT_DIR, 'cover.jpg')
    canvas.save(out, 'JPEG', quality=88)
    print('[cover] %s  %d KB' % (out, os.path.getsize(out) // 1024))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cols', type=int, default=769)
    args = ap.parse_args()

    small, lons, lats = load_and_downsample(args.cols)
    rows, cols = small.shape
    lon0 = float(lons[0]); lat0 = float(lats[0])
    dlon = float((lons[-1] - lons[0]) / (cols - 1))
    dlat = float((lats[-1] - lats[0]) / (rows - 1))

    polys = main_polys()
    mask = make_mask(polys, cols, rows, lon0, lat0, dlon, dlat)

    os.makedirs(os.path.join(OUT_DIR, 'data'), exist_ok=True)

    with open(os.path.join(OUT_DIR, 'data/dem.bin'), 'wb') as f:
        f.write(struct.pack('<%df' % (rows * cols), *small.flatten().astype(np.float32)))

    # 省级行政区并集掩膜已含填充区（境外=0）。
    with open(os.path.join(OUT_DIR, 'data/mask.bin'), 'wb') as f:
        f.write(mask.astype(np.uint8).tobytes())
    print('[mask] 境内像元 %d / %d' % (int((mask > 0).sum()), rows * cols))

    meta = dict(cols=int(cols), rows=int(rows), lon0=lon0, lat0=lat0,
                dlon=dlon, dlat=dlat, hasMask=True,
                minElev=float(small.min()), maxElev=float(small.max()))
    io.open(os.path.join(OUT_DIR, 'data/meta.json'), 'w', encoding='utf-8').write(
        json.dumps(meta, ensure_ascii=False))

    lines = make_boundary(polys)
    io.open(os.path.join(OUT_DIR, 'data/boundary.js'), 'w', encoding='utf-8').write(
        'window.CN_BOUNDARY = ' + json.dumps(lines, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('[boundary] %d 条轮廓折线（仅大陆 / 台湾岛 / 海南岛）' % len(lines))

    def sample(lon, lat):
        fx = (lon - lon0) / dlon
        fy = (lat - lat0) / dlat
        if fx < 0 or fx > cols - 1 or fy < 0 or fy > rows - 1:
            return None
        x0 = int(math.floor(fx)); y0 = int(math.floor(fy))
        x1 = min(x0 + 1, cols - 1); y1 = min(y0 + 1, rows - 1)
        tx = fx - x0; ty = fy - y0
        a = small[y0, x0] * (1 - tx) + small[y0, x1] * tx
        b = small[y1, x0] * (1 - tx) + small[y1, x1] * tx
        return float(a * (1 - ty) + b * ty)

    out_mk = []
    for m in MARKERS:
        se = sample(m['lon'], m['lat'])
        # 山峰/盆地峰值在降采样块平均中被平滑，保留人工精确值；
        # 高原/平原地形平缓，用 DEM 均值回填更准
        if se is not None and m['type'] not in ('peak', 'basin') and abs(se - m['elev']) > 80:
            m = dict(m); m['elev'] = round(se, 1)
        out_mk.append(m)
    io.open(os.path.join(OUT_DIR, 'data/markers.js'), 'w', encoding='utf-8').write(
        'window.CN_MARKERS = ' + json.dumps(out_mk, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('[markers] %d 个标注，高程已用 DEM 回填' % len(out_mk))

    make_cover(small, mask, cols, rows)
    print('[done] 输出目录:', OUT_DIR)


if __name__ == '__main__':
    main()
