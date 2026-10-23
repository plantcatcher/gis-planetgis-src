#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
中国主要平原 —— 数据管线（自建，可复现）

数据源
  DEM：AWS Open Data「Terrain Tiles」（terrarium 编码 PNG，Mapzen 整理，公开数据集）
       https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png
  陆地掩膜：public/maps/_shared/china-provinces.json（省级行政区并集，用于剔除海域）
  各平原的检索范围框（bbox）与面积口径：维基百科「中国平原」条目 + 通行地理教科书说法

方法（不是手画多边形，边界全部由真实高程算出来）
  1. 拼 DEM → 逐像素算「邻域起伏度」= 3×3 窗口内最大高程 − 最小高程（地形平坦度）
  2. 候选 = 陆地 ∩ 起伏度 ≤ rmax ∩ 海拔 ≤ hmax ∩ 该平原检索框
  3. 在候选里做连通域分析，保留包含种子点的连通域（种子点取平原腹地）
  4. 轮廓追踪成多边形 → 简化 → WGS84 转 GCJ-02（与高德底图对齐）

输出 public/maps/cn-plains/data/plains.json

用法
  python scripts/build_cn_plains.py                 # z=7（约 1 km/px，432 张瓦片，走缓存）
  python scripts/build_cn_plains.py --zoom 8        # 约 500 m/px
  python scripts/build_cn_plains.py --only 东北平原  # 只跑一个，调参用
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
BBOX = (79.0, 18.0, 136.0, 54.0)
BOUNDARY = 'public/maps/_shared/china-provinces.json'
OUT = 'public/maps/cn-plains/data/plains.json'

R = 6371.0088  # 地球平均半径 km

# ── 平原清单 ────────────────────────────────────────────────────────────────
# box  : (西, 南, 东, 北) 检索范围框（WGS84），取自公开资料给出的平原分布范围
# seeds: 平原腹地种子点（连通域筛选用），多个表示允许由若干块组成（如河套三联盆地）
# hmax : 海拔上限（m）   rmax: 邻域起伏度上限（m）
PLAINS = [
    dict(
        name='东北平原', tier=1, color='#f59e0b',
        box=(119.0, 40.6, 128.6, 49.5), hmax=300, rmax=40,
        seeds=[(125.2, 45.6), (122.8, 42.6), (132.8, 47.3), (127.6, 45.9)],
        aka='松辽平原',
        area_ref='约 35 万 km²（中国最大平原）',
        location='黑龙江、吉林、辽宁大部与内蒙古东部',
        parts='松嫩平原 · 辽河平原 · 三江平原',
        elevation='大部 50–200 m',
        soil='黑土、黑钙土',
        feature='中国面积最大的平原，由松花江、嫩江、辽河冲积而成，被大兴安岭、小兴安岭、长白山合围成向北开口的马蹄形。',
        fact='黑土层厚达 30–100 厘米，有机质含量是黄土的 5–10 倍，是「北大仓」的粮食根基；三江平原的沼泽湿地曾是「北大荒」，现已大面积退耕还湿。',
    ),
    dict(
        name='华北平原', tier=1, color='#ef4444',
        # 东界穿渤海海峡，避免把辽西走廊与辽东半岛沿海低地连进来
        poly=[(113.9, 40.5), (116.8, 40.9), (119.0, 40.8), (120.1, 40.4), (120.6, 39.5),
              (120.9, 38.0), (121.6, 37.5), (122.6, 37.3), (122.6, 33.5), (113.9, 33.5)],
        hmax=120, rmax=35,
        seeds=[(115.6, 37.2), (116.8, 35.4), (118.2, 34.2), (114.9, 35.7)],
        aka='黄淮海平原',
        area_ref='约 30 万 km²',
        location='京、津、冀、鲁、豫、皖北、苏北',
        parts='海河平原 · 黄河平原 · 淮河平原',
        elevation='大部 50 m 以下',
        soil='潮土、褐土（黄河冲积物）',
        feature='黄河、海河、淮河共同冲积出的中国第二大平原，也是人口最密集的平原。',
        fact='黄河下游是「地上悬河」，河床高出两岸地面 3–10 米，整条黄河成了海河与淮河的分水岭；地下水超采曾让这里出现世界罕见的巨大地下水漏斗。',
    ),
    dict(
        name='长江中下游平原', tier=1, color='#22d3ee',
        box=(111.3, 27.9, 123.0, 33.6), hmax=100, rmax=32,
        seeds=[(114.3, 30.5), (116.0, 29.2), (118.6, 31.6), (120.6, 31.2), (112.6, 29.0)],
        aka='长江平原',
        area_ref='约 26 万 km²',
        location='鄂、湘、赣、皖、苏、浙、沪的长江沿线',
        parts='江汉平原 · 洞庭湖平原 · 鄱阳湖平原 · 江淮平原 · 太湖平原',
        elevation='大部 50 m 以下',
        soil='水稻土',
        feature='由长江及其支流冲积、并串联一系列断陷盆地而成的带状平原，河湖密布。',
        fact='古称「云梦泽—彭蠡泽」一带的湖群被泥沙逐年淤填，洞庭湖从 19 世纪的 6000 km² 缩到今天约 2600 km²；这里是水稻与淡水鱼的主产区，「湖广熟，天下足」。',
    ),
    dict(
        name='珠江三角洲平原', tier=2, color='#a3e635',
        box=(112.8, 21.9, 114.5, 23.4), hmax=60, rmax=32,
        seeds=[(113.3, 22.8), (113.6, 23.1)],
        aka='珠三角',
        area_ref='约 1.1 万 km²',
        location='广东中南部（广州、佛山、东莞、深圳、中山、珠海、香港、澳门）',
        parts='西江三角洲 · 北江三角洲 · 东江三角洲',
        elevation='多在 10 m 以下',
        soil='水稻土、赤红壤',
        feature='西江、北江、东江三江汇流冲积出的复合三角洲，河网密度为全国之最。',
        fact='这里是中国城镇化率最高、经济密度最大的平原之一；「桑基鱼塘」是世界公认的早期循环农业典范——塘基种桑、桑叶喂蚕、蚕粪喂鱼、塘泥肥桑。',
    ),
    dict(
        name='成都平原', tier=2, color='#34d399',
        box=(102.9, 29.6, 105.2, 31.9), hmax=800, rmax=60,
        seeds=[(103.9, 30.8), (104.1, 31.3)],
        aka='川西平原 · 天府之国',
        area_ref='约 2.2 万 km²',
        location='四川盆地西部（成都、德阳、绵阳、眉山、乐山）',
        parts='岷江—沱江冲积扇',
        elevation='450–750 m',
        soil='水稻土、紫色土',
        feature='龙门山与龙泉山之间由岷江、沱江冲积扇联缀而成的扇形平原，是四川盆地唯一的连片平地。',
        fact='都江堰把岷江一分为二，两千三百年来自流灌溉成都平原，是全世界年代最久、仍在使用的无坝引水工程——「天府之国」由此而来。',
    ),
    dict(
        name='关中平原', tier=2, color='#f472b6',
        box=(105.9, 33.7, 110.5, 35.8), hmax=950, rmax=100,
        seeds=[(108.9, 34.4), (109.6, 34.6)],
        aka='渭河平原 · 八百里秦川',
        area_ref='约 3.6 万 km²',
        location='陕西中部（西安、咸阳、渭南、宝鸡、铜川）',
        parts='渭河冲积阶地',
        elevation='320–600 m',
        soil='塿土（褐土经长期耕作熟化）',
        feature='南依秦岭、北接黄土高原的渭河地堑谷地，东西长约 300 公里。',
        fact='周、秦、汉、唐等十三个王朝在此建都；郑国渠、白渠、成国渠三渠串联，让关中成为秦国统一六国的粮仓。',
    ),
    dict(
        name='河套平原', tier=2, color='#60a5fa',
        # 三段绿洲分别约束：宁夏平原（西套）/ 后套 / 前套（土默川），
        # 框沿平原边缘收得很紧，防止把同海拔的鄂尔多斯高原与乌拉特草原吸进来
        boxes=[(105.5, 37.3, 107.0, 39.5), (106.9, 40.4, 109.2, 41.0), (110.3, 40.4, 112.3, 41.2)],
        hmax=1250, rmax=40,
        seeds=[(106.4, 38.4), (108.2, 40.9), (111.4, 40.8)],
        aka='宁夏平原 · 后套平原 · 前套平原',
        area_ref='约 2.5 万 km²',
        location='宁夏与内蒙古沿黄河「几」字弯（银川、巴彦淖尔、包头、呼和浩特）',
        parts='宁夏平原（西套） · 后套平原 · 前套平原（土默川）',
        elevation='1000–1200 m',
        soil='灌淤土、盐渍土',
        feature='黄河在贺兰山、阴山与鄂尔多斯高原之间绕出的三段河谷平原，干旱区里的带状绿洲。',
        fact='「天下黄河富河套」——年降水不足 200 毫米，却靠自流引黄灌渠成为塞上粮仓；秦汉时在此设郡屯垦，渠系沿用至今。',
    ),
    dict(
        name='汾河平原', tier=2, color='#c084fc',
        box=(110.3, 34.8, 113.4, 38.4), hmax=1000, rmax=55,
        seeds=[(112.5, 37.7), (111.5, 36.0), (110.9, 35.1)],
        aka='汾河谷地 · 晋中盆地群',
        area_ref='约 1.5 万 km²',
        location='山西中部与南部（太原、晋中、临汾、运城）',
        parts='太原盆地 · 临汾盆地 · 运城盆地',
        elevation='350–900 m',
        soil='褐土、潮土',
        feature='汾河沿吕梁山与太岳山之间的断裂带串起的一串盆地，是山西唯一的农业精华地带。',
        fact='晋商从这里走出——太谷、祁县、平遥的票号曾掌控晚清全国金融命脉；运城盆地的盐池采盐史超过四千年。',
    ),
    dict(
        name='潮汕平原', tier=3, color='#fb923c',
        box=(116.0, 23.0, 117.6, 24.0), hmax=80, rmax=35,
        seeds=[(116.7, 23.5)],
        aka='韩江三角洲',
        area_ref='约 0.4 万 km²',
        location='广东东部（汕头、潮州、揭阳）',
        parts='韩江三角洲 · 榕江平原',
        elevation='多在 20 m 以下',
        soil='水稻土',
        feature='韩江与榕江冲积出的小型三角洲平原，背山面海、人多地少。',
        fact='这里是著名的侨乡，海外潮汕籍人口与本土人口规模相当；精耕细作到「种田如绣花」，单位面积产量长期居全国前列。',
    ),
    dict(
        name='汉中平原', tier=3, color='#2dd4bf',
        box=(106.4, 32.9, 108.3, 33.9), hmax=800, rmax=55,
        seeds=[(107.2, 33.4)],
        aka='汉中盆地',
        area_ref='带状，长约 100 km',
        location='陕西西南部（汉中）',
        parts='汉江上游河谷盆地',
        elevation='500–600 m',
        soil='水稻土、黄褐土',
        feature='秦巴山地之间汉江上游的狭长河谷盆地，气候温润、稻麦两熟。',
        fact='刘邦在此「明修栈道、暗度陈仓」成就汉室，汉族、汉字、汉文化之名皆源于此地的汉水与汉中。',
    ),
    dict(
        name='河西走廊平原', tier=3, color='#e879f9',
        # 走廊是一条西北—东南走向的窄带，两侧同海拔的戈壁同样平坦，
        # 因此用沿走廊中心的带状多边形约束，而不是矩形框
        poly=[(103.4, 37.9), (103.0, 38.4), (101.4, 39.1), (99.4, 39.9), (97.4, 40.6),
              (95.4, 40.9), (94.3, 40.4), (94.4, 39.7), (96.2, 39.8), (98.0, 39.4),
              (100.0, 38.7), (101.8, 38.0), (102.9, 37.5)],
        hmax=2100, rmax=45,
        seeds=[(100.4, 39.0), (98.5, 39.7), (102.6, 38.9), (96.0, 40.3)],
        aka='走廊绿洲群',
        area_ref='串珠状，总长 1000+ km',
        location='甘肃（祁连山与北山之间：武威、张掖、酒泉、嘉峪关、敦煌）',
        parts='武威绿洲 · 张掖绿洲 · 酒泉—嘉峪关绿洲 · 玉门—敦煌绿洲',
        elevation='1000–2000 m',
        soil='灌淤土、灰棕荒漠土',
        feature='祁连山与马鬃山之间被夹出的一串绿洲平原，不是一整块，而是被戈壁分隔的珠链。',
        fact='丝绸之路的主干道。每一片绿洲都靠祁连山冰雪融水养活，水量决定了绿洲的大小——这就是「弱水三千」的现实版本。',
    ),
    dict(
        name='伊犁河谷平原', tier=3, color='#84cc16',
        box=(80.2, 42.8, 85.2, 44.6), hmax=1300, rmax=60,
        seeds=[(81.9, 43.8)],
        aka='伊犁谷地',
        area_ref='约 1.5 万 km²',
        location='新疆西北部（伊犁哈萨克自治州、伊宁）',
        parts='伊犁河冲积平原',
        elevation='600–1300 m',
        soil='黑钙土、栗钙土',
        feature='天山向西张开的喇叭口谷地，迎着西风带，把水汽兜在新疆最西端。',
        fact='年降水 400–600 毫米，是新疆最湿润的地方，被称为「塞外江南」；天山在这里形成逆温层，让伊犁的苹果、薰衣草与河谷草原同时存在。',
    ),
    dict(
        name='台湾西部平原', tier=3, color='#facc15',
        box=(120.0, 22.0, 121.9, 25.4), hmax=200, rmax=35,
        seeds=[(120.5, 23.6), (120.6, 24.1), (121.5, 25.05)],
        aka='嘉南平原 · 彰化平原 · 台北盆地',
        area_ref='约 0.8 万 km²',
        location='中国台湾地区西部（嘉南平原、彰化平原、台北盆地）',
        parts='浊水溪冲积扇 · 曾文溪三角洲 · 台北盆地',
        elevation='多在 100 m 以下',
        soil='水稻土、红壤',
        feature='中央山脉西侧由浊水溪、曾文溪等短促河流冲积出的带状平原，台湾人口与农业的核心。',
        fact='嘉南平原是台湾最大平原，浊水溪冲积扇的扇面半径达 40 公里；嘉南大圳与「三年轮作」制度让这里成为台湾的米仓与糖仓。',
    ),
    dict(
        name='海南北部平原', tier=3, color='#38bdf8',
        box=(109.5, 19.3, 111.2, 20.3), hmax=150, rmax=30,
        seeds=[(110.4, 19.9)],
        aka='琼北台地平原',
        area_ref='约 0.7 万 km²',
        location='海南北部（海口、文昌、定安、澄迈）',
        parts='玄武岩台地 · 南渡江下游平原',
        elevation='20–100 m',
        soil='砖红壤、水稻土',
        feature='中国最南端的连片平原，底下是第四纪火山喷发铺开的玄武岩台地，表面平缓起伏。',
        fact='石山火山群与玄武岩台地构成独特地貌；这里也是中国唯一的热带平原农业区，一年可三熟。',
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
    """核对用预览图：省界灰底 + 平原多边形填色 + 名称"""
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
    ap.add_argument('--simplify', type=float, default=0.012)
    ap.add_argument('--only', default='')
    ap.add_argument('--plot', default='')
    args = ap.parse_args()

    dem, lons, lats = build_dem(args.zoom, BBOX)
    h, w = dem.shape
    px_km = 40075.0 / (2 ** args.zoom * 256)
    print('[grid] %dx%d  %.2f km/px  经度 %.2f..%.2f  纬度 %.2f..%.2f'
          % (w, h, px_km, lons[0], lons[-1], lats[-1], lats[0]), flush=True)

    # 陆地掩膜（省界并集）
    bnd = json.load(io.open(args.boundary, encoding='utf-8'))
    prov = unary_union([shapely.make_valid(shape(f['geometry'])) for f in bnd['features']])
    prov = shapely.make_valid(prov)
    land = rasterize(prov, lons, lats, (h, w))

    # 邻域起伏度：3×3 窗口内极差（地形平坦度）
    k3 = np.ones((3, 3), np.uint8)
    hi = cv2.dilate(dem, k3)
    lo = cv2.erode(dem, k3)
    relief = hi - lo
    print('[relief] 计算完成', flush=True)

    lon_g, lat_g = np.meshgrid(lons, lats)
    # Web Mercator 像元东西、南北两方向均按 sec(lat) 拉伸：真实面积 = px_km² · cos²(lat)
    # （曾错写为 cos(lat)，导致所有像元面积系统性高估 1/cos(lat)，华北平原虚高 22%、东北 41%）
    cell_km2 = (px_km * px_km) * (np.cos(np.radians(lat_g)) ** 2)
    min_px = max(8, int(args.min_area_km2 / (px_km * px_km)))

    feats = []
    for p in PLAINS:
        if args.only and args.only not in p['name']:
            continue
        if 'poly' in p:
            reg = Polygon(p['poly'])
        elif 'boxes' in p:
            reg = unary_union([shapely.geometry.box(*b) for b in p['boxes']])
        else:
            reg = shapely.geometry.box(*p['box'])
        boxm = rasterize(shapely.make_valid(reg), lons, lats, (h, w)) > 0
        cand = ((land > 0) & boxm & (relief <= p['rmax']) & (dem <= p['hmax'])).astype(np.uint8) * 255
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
        print('  %-14s 像素 %7d  像元面积 %8.0f km²  球面面积 %8.0f km²  参考 %s'
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
                'soil': p['soil'],
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
    print('[out] %s  %d 个平原  合计 %.1f 万 km²'
          % (args.out, len(feats), sum(f['properties']['area_num'] for f in feats)))


if __name__ == '__main__':
    main()
