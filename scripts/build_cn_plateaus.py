#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
中国主要高原 —— 数据管线（自建，可复现，与 build_cn_plains.py 同族）

数据源
  DEM：AWS Open Data「Terrain Tiles」（terrarium 编码 PNG，Mapzen 整理，公开数据集）
       https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png
  陆地掩膜：public/maps/_shared/china-provinces.json（省级行政区并集，用于剔除境外与海域）
  各高原的约束范围与面积口径：维基百科「中国高原」条目 + 通行地理教科书说法

方法（不是手画多边形，边界全部由真实高程算出来）
  高原与平原判据方向相反：平原是「海拔上限 + 低起伏」，高原是「海拔下限（下限+上限构成高程带）」
  1. 拼 DEM → 逐像素算「邻域起伏度」= 3×3 窗口内最大高程 − 最小高程（部分高原启用）
  2. 候选 = 陆地 ∩ 约束区 ∩ 高程带 [hmin, hmax] ∩（可选 起伏度 ≤ rmax）
     extra：补充检索框（如柴达木盆地 2500m、湟水谷地 2050m），与主判据做 OR
  3. 在候选里做连通域分析，保留包含种子点的连通域（种子点取高原腹地）
  4. 轮廓追踪成多边形 → 简化 → WGS84 转 GCJ-02（与高德底图对齐）

判据设计备忘
  - 青藏高原：≥3000m 即可，边界由山系天然圈定（昆仑—阿尔金—祁连以北同海拔区域不在中国境内，
    盆地一侧海拔不足）。柴达木（2500m+）与湟水谷地（2050m+）教科书属青藏，用 extra 补回。
  - 内蒙古高原：高程带 + 起伏度双判据——准平原面起伏和缓，大兴安岭/阴山/狼山山体 3km 内
    高差大被剔除，恰好得到「山间坦荡高原面」；约束 poly 排除河套—土默川（已是平原图要素）
    和黄河河谷，防止隔河把鄂尔多斯连进来。
  - 黄土高原：沟壑纵横、起伏度判据必然失效，只用高程带 + 约束 poly（北抵长城、南依秦岭、
    东至太行、西达乌鞘岭）。黄河晋陕峡谷海拔 <950m 被天然剔除，晋西与陕北各成一块。
  - 云贵高原：喀斯特起伏大同样弃用起伏度，用高程带 + 约束 poly（西起哀牢山—点苍山、
    北抵四川盆地南缘、东至雪峰山）。深切河谷与贵州低海拔谷地成为图上的「洞」，是真实地貌。
  - 鄂尔多斯高原：黄河三面环绕的方形地块，高程带收得很紧，约束框北缘避开河套平原。

输出 public/maps/cn-plateaus/data/plateaus.json

用法
  python scripts/build_cn_plateaus.py                 # z=7（约 1 km/px，走缓存）
  python scripts/build_cn_plateaus.py --zoom 8        # 约 500 m/px
  python scripts/build_cn_plateaus.py --only 青藏高原  # 只跑一个，调参用
"""
import argparse
import io
import json
import math
import os
import urllib.request
from concurrent.futures import ThreadPoolExecutor

import cv2
import numpy as np
import shapely
from PIL import Image
from shapely.geometry import Polygon, MultiPolygon, shape
from shapely.ops import unary_union

for _k in ('HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy'):
    os.environ.pop(_k, None)

TILE_URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
CACHE = '_dem_cache'
BBOX = (73.0, 18.0, 136.0, 54.0)
BOUNDARY = 'public/maps/_shared/china-provinces.json'
OUT = 'public/maps/cn-plateaus/data/plateaus.json'

R = 6371.0088  # 地球平均半径 km
INF = 99999.0

# ── 高原清单 ────────────────────────────────────────────────────────────────
# box/poly : 检索约束区（WGS84），取自公开资料给出的高原分布范围
# seeds    : 高原腹地种子点（连通域筛选用），多个表示允许由若干块组成（如黄河峡谷两侧）
# band     : (hmin, hmax) 高程带；rmax: 邻域起伏度上限（m，None 表示不启用）
# extras   : [(box, hmin), ...] 补充 OR 检索框（柴达木 / 湟水谷地等低洼但属高原的单元）
PLATEAUS = [
    dict(
        name='青藏高原', tier=1, color='#ef4444',
        # 外源权威边界：张镱锂等 (2002)《论青藏高原范围与面积》，经 Zenodo 6432940
        # (Liu & Zhu 2022, CC BY-SA 4.0) 分发；已与中国国界求交（出入仅 0.076%）。
        # 提供时跳过海拔判据，直接以该多边形 ∩ 国界为候选，面积口径与其余高原一致。
        override='_g/dl_plateau/zhang2002_tp_cn.geojson',
        box=(75.8, 26.5, 105.0, 41.5), band=(3000, INF), rmax=None,
        extras=[((90.3, 35.8, 97.2, 39.3), 2500),   # 柴达木盆地
                ((100.9, 35.8, 102.8, 37.2), 2050)],  # 河湟谷地
        seeds=[(92.05, 31.48), (91.1, 29.66), (98.2, 34.9), (80.05, 32.5),
               (84.05, 32.3), (102.95, 33.58), (100.9, 38.18), (97.37, 37.37)],
        aka='世界屋脊 · 雪域高原',
        area_ref='约 250 万 km²（境内部分，中国最大高原；边界据张镱锂等 2002）',
        location='西藏、青海全部，四川西部、云南西北部、甘肃西南部与新疆南缘',
        parts='藏北高原（羌塘） · 青海高原 · 川西高原 · 柴达木盆地 · 祁连山地',
        elevation='大部 4000–5000 m',
        ground='高寒草甸 · 高寒荒漠 · 雪山冰川',
        feature='印度板块与亚欧板块碰撞隆起的世界最高高原，平均海拔 4000 米以上，是长江、黄河、澜沧江、雅鲁藏布江等大江大河的发源地，被称为「亚洲水塔」。',
        fact='高原上发育约 4.6 万条冰川，冰储量约占全国八成；巨大的地形像一台「抽风机」，造就了东亚季风，也把塔里木与柴达木变成了内陆干旱盆地。',
    ),
    dict(
        name='内蒙古高原', tier=1, color='#a3e635',
        poly=[(97.2, 39.4), (99.0, 39.2), (101.0, 39.0), (103.0, 39.2), (104.5, 39.4),
              (105.5, 40.6), (106.0, 40.9), (108.5, 41.1), (110.5, 41.4), (112.5, 41.6),
              (114.0, 41.3), (115.5, 41.3), (116.3, 41.6), (116.3, 42.4), (115.5, 43.2),
              (116.0, 44.0), (117.0, 44.8), (118.0, 45.6), (119.0, 46.6), (120.2, 47.6),
              (120.6, 48.6), (120.0, 50.6), (97.2, 50.6)],
        band=(550, 1650), rmax=100,
        seeds=[(119.4, 49.2), (116.0, 43.9), (112.5, 42.8), (110.6, 41.6),
               (101.5, 40.9), (114.9, 41.35)],
        aka='北方草原高原',
        area_ref='教科书广义口径约 70 万 km²（含阿拉善）；本图实测草原高原连片区约 51 万 km²',
        location='内蒙古中部（阴山以北草原高原），广义可延伸至阿拉善与鄂尔多斯',
        parts='呼伦贝尔高原 · 锡林郭勒高原 · 乌兰察布高原 · 坝上高原（广义另含阿拉善、鄂尔多斯）',
        elevation='大部 600–1500 m',
        ground='温带草原 · 荒漠草原 · 沙漠戈壁',
        feature='古老地台长期剥蚀形成的准平原面，地表开阔坦荡、起伏和缓，是我国最完整连片的高原面，自东向西由草甸草原渐变为典型草原、荒漠草原与戈壁。',
        fact='「风吹草低见牛羊」的原版就在这里——呼伦贝尔草甸草原的产草量是西部荒漠草原的 10 倍；高原面上风能、太阳能资源居全国前列，是大型风电基地的聚集地。',
    ),
    dict(
        name='黄土高原', tier=1, color='#eab308',
        # 外源权威边界：「黄土高原空间范围」（resdc.cn DATAID 140 同源，GitCode
        # open-source-toolkit/098f3 分发，Krasovsky 1940 Albers 转 WGS84，
        # 单多边形 64.9 万 km²、100% 在境内），直接采用，跳过海拔判据。
        override='_g/dl_plateau/loess_098f3_cn.geojson',
        poly=[(102.9, 36.2), (103.6, 37.0), (104.3, 37.5), (105.3, 37.6), (106.5, 37.9),
              (107.5, 38.1), (108.5, 38.4), (109.5, 38.5), (110.5, 38.7), (111.3, 38.9),
              (112.2, 39.1), (113.0, 39.2), (113.7, 39.2), (113.9, 38.4), (113.5, 37.5),
              (113.3, 36.5), (113.2, 35.6), (112.8, 34.9), (112.0, 34.6), (111.0, 34.3),
              (110.0, 34.1), (108.8, 34.2), (107.5, 34.2), (106.5, 34.5), (105.3, 34.8),
              (104.3, 35.0), (103.4, 35.4)],
        band=(800, 2400), rmax=None,
        seeds=[(104.6, 35.6), (107.5, 35.8), (105.9, 36.0), (109.5, 36.7),
               (111.2, 37.4), (105.7, 34.6), (112.2, 36.5)],
        aka='全球最大黄土堆积区',
        area_ref='约 64 万 km²（教科书口径；边界据 resdc「黄土高原空间范围」权威矢量）',
        location='山西西部、陕北、陇东、陇中、宁夏南部与河南西部边缘',
        parts='陇中高原 · 陇东黄土塬 · 陕北丘陵沟壑 · 晋西黄土丘陵 · 宁南高原',
        elevation='大部 800–2000 m',
        ground='黄土覆盖 · 沟壑纵横 · 耕地与草地',
        feature='风把中亚荒漠的粉沙搬运两百多万年堆积出的「黄土之乡」，最厚处超过 300 米；再经流水切割，形成塬、梁、峁、沟的独特地貌组合。',
        fact='每年约有 16 亿吨泥沙从这里被黄河搬走，「跳进黄河洗不清」的黄色正是黄土；退耕还林二十多年，陕西的绿色版图已向北推进约 400 公里。',
    ),
    dict(
        name='云贵高原', tier=1, color='#22d3ee',
        poly=[(100.0, 27.6), (100.3, 26.6), (100.4, 25.5), (100.8, 24.6), (101.3, 24.0),
              (101.8, 23.7), (102.3, 23.6), (103.2, 23.3), (104.0, 23.0), (104.8, 22.9),
              (105.8, 23.3), (106.6, 23.7), (107.5, 24.3), (108.3, 24.6), (109.2, 25.0),
              (109.9, 25.8), (110.2, 26.5), (109.6, 27.3), (108.8, 27.9), (107.5, 28.2),
              (106.2, 28.3), (105.2, 29.0), (104.5, 29.0), (103.8, 28.5), (102.8, 28.3),
              (101.8, 28.0), (100.8, 27.8)],
        band=(1000, 2500), rmax=None,
        seeds=[(102.8, 24.95), (103.8, 25.5), (106.7, 26.6), (105.9, 26.25),
               (104.9, 25.1), (103.7, 27.35), (101.5, 25.05)],
        aka='喀斯特王国',
        area_ref='教科书口径约 50 万 km²；本图实测 1000–2500 m 高原面约 28 万 km²',
        location='云南东部、贵州全部与广西西北边缘',
        parts='滇东高原 · 贵州高原 · 滇中坝子群 · 桂西北山地',
        elevation='大部 1000–2000 m',
        ground='石灰岩喀斯特 · 坝子（山间盆地） · 河谷深切',
        feature='碳酸盐岩在湿热气候下被溶蚀上亿年，形成石林、峰林、天坑、溶洞与伏流；高原面破碎，山间「坝子」成为人口与耕地集中的宝地。',
        fact='云南石林与贵州织金洞是世界级喀斯特景观；坝子只占云南面积的约 6%，却承载着三分之二的人口——「地无三里平」说的就是这里。',
    ),
    dict(
        name='鄂尔多斯高原', tier=2, color='#c084fc',
        box=(106.5, 38.7, 110.8, 40.4), band=(1000, 1600), rmax=None,
        seeds=[(108.6, 39.2), (107.6, 39.0)],
        aka='黄河怀抱中的方形古陆',
        area_ref='市域 8.7 万 km²；本图实测 1000–1600 m 高原面约 7 万 km²',
        location='内蒙古西南部，黄河「几」字弯怀抱之中',
        parts='毛乌素沙地 · 库布齐沙漠 · 中部硬梁地与碱湖群',
        elevation='大部 1100–1500 m',
        ground='沙地 · 荒漠草原 · 内陆碱湖',
        feature='被黄河三面环绕的方形地块，构造上是稳定抬升的古陆块，风沙地貌与内陆盐湖发育，北缘即是「几」字弯顶点。',
        fact='毛乌素沙地经 70 年治理已有八成以上披绿，即将从「沙地」名单里毕业；高原地下埋着全国约六分之一的煤炭储量，「羊煤土气」说的就是鄂尔多斯。',
    ),
    dict(
        name='帕米尔高原（中国境内）', tier=2, color='#f97316',
        # 萨雷阔勒岭以东的中国帕米尔本体；东界沿塔什库尔干谷地—木吉谷地一线，
        # 否则同海拔的西昆仑—喀喇昆仑会被一并圈入（实测曾达 10 万 km²）
        poly=[(73.5, 37.0), (74.0, 36.85), (74.6, 36.9), (75.1, 37.05), (75.5, 37.3),
              (75.7, 37.7), (75.6, 38.2), (75.35, 38.75), (74.95, 39.05), (74.45, 39.2),
              (73.95, 39.0), (73.55, 38.5), (73.4, 37.6)],
        band=(2850, INF), rmax=None,
        seeds=[(75.23, 37.77), (74.7, 38.5)],
        aka='葱岭 · 山结',
        area_ref='中国境内约 3 万 km²；本图实测 2850 m 以上山体约 1.7 万 km²',
        location='新疆西南端（克孜勒苏柯尔克孜自治州，塔什库尔干一带）',
        parts='萨雷阔勒岭 · 慕士塔格—公格尔山块 · 塔什库尔干谷地',
        elevation='大部 3200–4500 m',
        ground='高寒荒漠与草甸 · 雪山冰川 · 山谷牧场',
        feature='天山、昆仑山、喀喇昆仑山、兴都库什山在此打结的世界级「山结」，古称「葱岭」，是丝绸之路翻越的最险峻路段。',
        fact='慕士塔格峰（7546 米）圆顶冰盖下发育多条山谷冰川，被登山者称为「冰山之父」；塔吉克族的鹰笛与牦牛叼羊，就活在海拔 3000 米以上的谷地里。',
    ),
]

# ── 瓦片 ────────────────────────────────────────────────────────────────────


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
    for _ in range(3):
        try:
            req = urllib.request.Request(
                TILE_URL.format(z=z, x=x, y=y), headers={'User-Agent': 'planetgis-build/1.0'})
            data = urllib.request.urlopen(req, timeout=60).read()
            with open(fn, 'wb') as f:
                f.write(data)
            return fn
        except Exception:
            try:
                if os.path.exists(fn):
                    os.remove(fn)
            except Exception:
                pass
    raise RuntimeError('tile %d/%d/%d failed' % (z, x, y))


def build_dem(z, bbox, workers=16):
    w, s, e, n = bbox
    x0 = int(lonlat_to_tile(w, n, z)[0]); x1 = int(lonlat_to_tile(e, s, z)[0])
    y0 = int(lonlat_to_tile(w, n, z)[1]); y1 = int(lonlat_to_tile(e, s, z)[1])
    nx, ny = x1 - x0 + 1, y1 - y0 + 1
    print('[dem] z=%d 瓦片 %dx%d = %d 张' % (z, nx, ny, nx * ny), flush=True)

    jobs = [(tx, ty) for ty in range(y0, y1 + 1) for tx in range(x0, x1 + 1)]
    paths = {}
    done = [0]

    def _one(t):
        tx, ty = t
        p = fetch_tile(z, tx, ty)
        done[0] += 1
        if done[0] % 50 == 0:
            print('  下载 %d/%d' % (done[0], len(jobs)), end='\r', flush=True)
        return t, p

    with ThreadPoolExecutor(max_workers=workers) as ex:
        for t, p in ex.map(_one, jobs):
            paths[t] = p
    print('  下载完成 %d 张        ' % len(paths), flush=True)

    dem = np.zeros((ny * 256, nx * 256), dtype=np.float32)
    for (tx, ty), p in paths.items():
        i, j = tx - x0, ty - y0
        try:
            img = np.asarray(Image.open(p).convert('RGB'), dtype=np.float32)
        except Exception as ex:
            print('  ! tile %d/%d/%d %s' % (z, tx, ty, ex))
            continue
        dem[j * 256:(j + 1) * 256, i * 256:(i + 1) * 256] = \
            img[..., 0] * 256.0 + img[..., 1] + img[..., 2] / 256.0 - 32768.0

    h, wd = dem.shape
    lons = np.array([tile_x_to_lon(x0 + (i + 0.5) / 256.0, z) for i in range(wd)])
    lats = np.array([tile_y_to_lat(y0 + (j + 0.5) / 256.0, z) for j in range(h)])
    return dem, lons, lats


# ── WGS84 → GCJ-02 ──────────────────────────────────────────────────────────
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
        for it in p.interiors:
            hh = conv_ring(list(it.coords))
            if not hh.is_empty and hh.area > 1e-6:
                holes.append(list(hh.exterior.coords))
        out.append(Polygon(list(ext.exterior.coords), holes))
    if not out:
        return None
    g = MultiPolygon(out) if len(out) > 1 else out[0]
    return shapely.make_valid(g)


def sphere_area(geom):
    """球面多边形面积 km²（经纬环 → 球面积分近似）"""
    def ring_area(ring):
        s = 0.0
        for i in range(len(ring) - 1):
            x1, y1 = ring[i]
            x2, y2 = ring[i + 1]
            s += math.radians(x2 - x1) * (math.sin(math.radians(y1)) + math.sin(math.radians(y2)))
        return abs(s * R * R / 2.0)

    polys = list(geom.geoms) if isinstance(geom, MultiPolygon) else [geom]
    tot = 0.0
    for p in polys:
        tot += ring_area(list(p.exterior.coords))
        for it in p.interiors:
            tot -= ring_area(list(it.coords))
    return tot


# ── 栅格工具 ────────────────────────────────────────────────────────────────


def rasterize(geom, lons, lats, shape_):
    h, w = shape_
    mask = np.zeros((h, w), np.uint8)
    polys = list(geom.geoms) if isinstance(geom, MultiPolygon) else [geom]
    for p in polys:
        if p.is_empty:
            continue
        ext = np.array(p.exterior.coords, dtype=np.float64)
        ix = np.clip(np.searchsorted(lons, ext[:, 0]), 0, w - 1)
        iy = np.clip(np.searchsorted(-lats, -ext[:, 1]), 0, h - 1)
        pts = np.stack([ix, iy], axis=1).astype(np.int32)
        cv2.fillPoly(mask, [pts], 255)
        for it in p.interiors:
            ie = np.array(it.coords, dtype=np.float64)
            jx = np.clip(np.searchsorted(lons, ie[:, 0]), 0, w - 1)
            jy = np.clip(np.searchsorted(-lats, -ie[:, 1]), 0, h - 1)
            cv2.fillPoly(mask, [np.stack([jx, jy], axis=1).astype(np.int32)], 0)
    return mask


def _ring_lonlat(c, lons, lats, tol):
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


def contours_to_geoms(mask, lons, lats, tol, min_area_deg2):
    cnts, hier = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    hier = hier[0] if hier is not None else []
    geoms = []
    for i, c in enumerate(cnts):
        if i >= len(hier) or hier[i][3] != -1:
            continue
        ext = _ring_lonlat(c, lons, lats, tol)
        if ext is None:
            continue
        holes = []
        ch = hier[i][2]
        while ch != -1:
            hh = _ring_lonlat(cnts[ch], lons, lats, tol)
            if hh is not None:
                holes.append(hh)
            ch = hier[ch][0]
        try:
            g = Polygon(ext, holes)
            if not g.is_valid:
                g = g.buffer(0)
            if g.is_empty or g.area < min_area_deg2:
                continue
            geoms.append(g)
        except Exception:
            continue
    if not geoms:
        return None
    return shapely.make_valid(unary_union(geoms))


def idx_of(lons, lats, lon, lat):
    i = int(np.clip(np.searchsorted(lons, lon), 0, len(lons) - 1))
    j = int(np.clip(np.searchsorted(-lats, -lat), 0, len(lats) - 1))
    return i, j


def plot_preview(feats, prov, out_png):
    """核对用预览图：省界灰底 + 高原多边形填色 + 名称"""
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from matplotlib.patches import Polygon as MplPoly
    from matplotlib import patheffects
    import matplotlib.font_manager as fm

    cn = 'DejaVu Sans'
    for cand in ('Microsoft YaHei', 'SimHei', 'SimSun', 'Noto Sans CJK SC'):
        if any(cand.lower() in f.name.lower() for f in fm.fontManager.ttflist):
            cn = cand
            break

    def rings(geom):
        gs = list(geom.geoms) if isinstance(geom, MultiPolygon) else [geom]
        for g in gs:
            yield list(g.exterior.coords)

    fig = plt.figure(figsize=(12, 8.4), dpi=110)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(73, 136); ax.set_ylim(17, 54)
    ax.set_aspect(1.15); ax.set_axis_off()
    fig.patch.set_facecolor('#0b1220'); ax.set_facecolor('#0b1220')

    for g in (list(prov.geoms) if hasattr(prov, 'geoms') else [prov]):
        for r in rings(g):
            xs = [q[0] for q in r]; ys = [q[1] for q in r]
            ax.add_patch(MplPoly(list(zip(xs, ys)), closed=True, facecolor='#16233b',
                                 edgecolor='#33415a', linewidth=0.4, zorder=1))
    for f in feats:
        p = f['properties']
        g = shape(f['geometry'])
        for r in rings(g):
            ax.add_patch(MplPoly(list(zip([q[0] for q in r], [q[1] for q in r])), closed=True,
                                 facecolor=p['color'], edgecolor='white', linewidth=0.6,
                                 alpha=0.72, zorder=3))
        c = p['centroid']
        ax.text(c[0], c[1], p['name'], color='white', fontsize=8, fontweight='bold',
                fontfamily=cn, ha='center', va='center', zorder=5,
                path_effects=[patheffects.withStroke(linewidth=2, foreground='#0b1220')])
    os.makedirs(os.path.dirname(out_png) or '.', exist_ok=True)
    fig.savefig(out_png, dpi=110, facecolor=fig.get_facecolor())
    plt.close(fig)
    print('[plot] %s' % out_png)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--zoom', type=int, default=7)
    ap.add_argument('--out', default=OUT)
    ap.add_argument('--boundary', default=BOUNDARY)
    ap.add_argument('--min-area-km2', type=float, default=200.0)
    ap.add_argument('--simplify', type=float, default=0.015)
    ap.add_argument('--only', default='')
    ap.add_argument('--plot', default='')
    args = ap.parse_args()

    dem, lons, lats = build_dem(args.zoom, BBOX)
    h, w = dem.shape
    px_km = 40075.0 / (2 ** args.zoom * 256)
    print('[grid] %dx%d  %.2f km/px  经度 %.2f..%.2f  纬度 %.2f..%.2f'
          % (w, h, px_km, lons[0], lons[-1], lats[-1], lats[0]), flush=True)

    # 陆地掩膜（省界并集，同时剔除境外与海域）
    bnd = json.load(io.open(args.boundary, encoding='utf-8'))
    prov = unary_union([shapely.make_valid(shape(f['geometry'])) for f in bnd['features']])
    prov = shapely.make_valid(prov)
    land = rasterize(prov, lons, lats, (h, w))

    # 邻域起伏度：3×3 窗口内极差（部分高原启用）
    k3 = np.ones((3, 3), np.uint8)
    hi = cv2.dilate(dem, k3)
    lo = cv2.erode(dem, k3)
    relief = hi - lo
    print('[relief] 计算完成', flush=True)

    lon_g, lat_g = np.meshgrid(lons, lats)
    # Web Mercator 像元东西、南北两方向均按 sec(lat) 拉伸：真实面积 = px_km² · cos²(lat)
    # （曾错写为 cos(lat)，导致所有像元面积系统性高估 1/cos(lat)，青藏一度虚标 306 万）
    cell_km2 = (px_km * px_km) * (np.cos(np.radians(lat_g)) ** 2)
    min_px = max(8, int(args.min_area_km2 / (px_km * px_km)))

    feats = []
    for p in PLATEAUS:
        if args.only and args.only not in p['name']:
            continue
        if 'poly' in p:
            reg = Polygon(p['poly'])
        else:
            reg = shapely.geometry.box(*p['box'])
        if p.get('override'):
            # 外源权威几何：读 WGS84 多边形，与国界求交（合规裁剪）后作为候选
            og = shapely.make_valid(shape(json.load(io.open(p['override'], encoding='utf-8'))['geometry']))
            og = shapely.make_valid(og.intersection(prov))
            cand = (land > 0) & (rasterize(og, lons, lats, (h, w)) > 0)
            cand = cand.astype(np.uint8) * 255
        else:
            cand = (land > 0) \
                & (rasterize(shapely.make_valid(reg), lons, lats, (h, w)) > 0) \
                & (dem >= p['band'][0]) & (dem <= p['band'][1])
            if p.get('rmax') is not None:
                cand &= (relief <= p['rmax'])
            cand = cand.astype(np.uint8) * 255
            # extras：低洼但属高原的单元（柴达木 / 河湟谷地），与主判据 OR
            for (eb, eh) in p.get('extras', ()):
                ebm = rasterize(shapely.make_valid(shapely.geometry.box(*eb)), lons, lats, (h, w)) > 0
                cand |= ((land > 0) & ebm & (dem >= eh)).astype(np.uint8) * 255
        if cand.sum() == 0:
            print('  ! %s 无候选像素' % p['name'])
            continue

        n, lab = cv2.connectedComponents(cand, connectivity=8)
        keep = np.zeros(n, bool)
        for (slon, slat) in p['seeds']:
            si, sj = idx_of(lons, lats, slon, slat)
            # 种子落在非候选时，就近找一个候选像素
            if cand[sj, si] == 0:
                ys, xs = np.nonzero(cand)
                if len(xs) == 0:
                    continue
                d = (lons[xs] - slon) ** 2 + (lats[ys] - slat) ** 2
                k = int(np.argmin(d))
                si, sj = int(xs[k]), int(ys[k])
            keep[lab[sj, si]] = True
        sel = keep[lab]
        sel[0] = False
        mask = (sel * 255).astype(np.uint8)

        # 碎斑清理 + 补洞
        mask = cv2.medianBlur(mask, 3)
        ker = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, ker)
        n2, lab2, st2, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
        out = np.zeros_like(mask)
        for i in range(1, n2):
            if st2[i, cv2.CC_STAT_AREA] >= min_px:
                out[lab2 == i] = 255

        geom = contours_to_geoms(out, lons, lats, args.simplify, 0.0)
        if geom is None:
            print('  ! %s 未提取到几何' % p['name'])
            continue
        px = int((out > 0).sum())
        area_grid = float(cell_km2[out > 0].sum())   # 像元级（按纬度收缩）精确面积
        area_sph = sphere_area(geom)
        print('  %-16s 像素 %8d  像元面积 %9.0f km²  球面面积 %9.0f km²  参考 %s'
              % (p['name'], px, area_grid, area_sph, p['area_ref']), flush=True)

        gj = to_gcj_geom(geom, args.simplify * 0.5)
        if gj is None:
            print('  ! %s 坐标转换失败' % p['name'])
            continue

        # 质心（取最大子多边形的代表点，用于标注定位）
        polys = list(gj.geoms) if isinstance(gj, MultiPolygon) else [gj]
        big = max(polys, key=lambda g: g.area)
        c = big.representative_point()
        cx, cy = c.x, c.y
        if big.contains(c) is False:
            cx, cy = big.centroid.x, big.centroid.y

        feats.append({
            'type': 'Feature',
            'properties': {
                'name': p['name'],
                'tier': p['tier'],
                'color': p['color'],
                'aka': p['aka'],
                'area': p['area_ref'],
                'area_num': round(area_grid / 10000.0, 2),     # 万 km²（按像元实测）
                'area_calc': round(area_grid),
                'location': p['location'],
                'parts': p['parts'],
                'elevation': p['elevation'],
                'ground': p['ground'],
                'feature': p['feature'],
                'fact': p['fact'],
                'centroid': [round(cx, 4), round(cy, 4)],
            },
            'geometry': shapely.geometry.mapping(gj),
        })

    if not feats:
        print('没有输出任何要素，终止')
        return
    feats.sort(key=lambda f: (-f['properties']['tier'], -f['properties']['area_num']))
    for i, f in enumerate(feats):
        f['properties']['id'] = i + 1

    if args.plot:
        plot_preview(feats, prov, args.plot)

    fc = {'type': 'FeatureCollection', 'features': feats}
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with io.open(args.out, 'w', encoding='utf-8') as f:
        json.dump(fc, f, ensure_ascii=False, separators=(',', ':'))
    print('[out] %s  %d 个高原  合计 %.1f 万 km²'
          % (args.out, len(feats), sum(f['properties']['area_num'] for f in feats)))


if __name__ == '__main__':
    main()
