# -*- coding: utf-8 -*-
"""
全国房价时空可视化 · 市级边界构建

从 DataV.GeoAtlas 拉取 31 个省级行政区的下辖地级市边界，筛出国家统计局
70 城名单里的城市，拼成一份精简 GeoJSON 供市级视图使用。

输出：public/maps/house-price/data/cities-geo.json
      （只含 70 城的多边形，属性保留 adcode/name/center，坐标 CGCS2000≈WGS84，
        前端转 GCJ-02 后与高德瓦片对齐）

设计取舍：只保留 70 城而非全国所有地级市 —— 地图的着色范围必须与数据覆盖面
一致，否则会出现「有色块无数据」的假象。
"""
import os
import json
import time
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'maps', 'house-price', 'data', 'cities-geo.json')
CACHE = os.path.join(ROOT, '_house_cache', 'citygeo')
BASE = 'https://geo.datav.aliyun.com/areas_v3/bound/%d_full.json'

# 31 个省级行政区（不含港澳台，统计局的 70 城均在内地）
PROV_ADCODES = [
    110000, 120000, 130000, 140000, 150000, 210000, 220000, 230000,
    310000, 320000, 330000, 340000, 350000, 360000, 370000, 410000,
    420000, 430000, 440000, 450000, 460000, 500000, 510000, 520000,
    530000, 540000, 610000, 620000, 630000, 640000, 650000,
]

# 70 城 adcode（与 70cityprice 的 ADCODE 列一致）
CITY_ADCODES = {
    '110100', '120100', '130100', '140100', '150100', '210100', '210200',
    '220100', '230100', '310100', '320100', '330100', '330200', '340100',
    '350100', '350200', '360100', '370100', '370200', '410100', '410300',
    '410400', '420100', '420500', '420600', '430100', '430600', '430700',
    '440100', '440200', '440300', '440800', '441300', '450100', '450300',
    '450500', '460100', '460200', '500100', '510100', '510500', '511300',
    '520100', '520300', '530100', '532900', '610100', '620100', '630100',
    '640100', '650100',
    '130200', '130300', '150200', '210600', '210700', '220200', '231000',
    '320200', '320300', '321000', '330300', '330700', '340300', '340800',
    '350500', '360400', '360700', '370600', '370800',
}

# 直辖市：DataV 的省级 _full 是「区」级，直辖市自身要单独取 市 级边界
MUNI = {110000: '110100', 120000: '120100', 310000: '310100', 500000: '500100'}


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req, timeout=60).read()


def simplify_ring(ring, tol):
    """道格拉斯-普克抽稀。市界精度到市级视图足够，体积能压掉一大半。"""
    if len(ring) <= 4:
        return ring

    def d2(p, a, b):
        dx, dy = b[0] - a[0], b[1] - a[1]
        if dx == 0 and dy == 0:
            return (p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2
        t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)
        t = max(0.0, min(1.0, t))
        px, py = a[0] + t * dx, a[1] + t * dy
        return (p[0] - px) ** 2 + (p[1] - py) ** 2

    def dp(pts):
        if len(pts) < 3:
            return pts
        keep = [False] * len(pts)
        keep[0] = keep[-1] = True
        stack = [(0, len(pts) - 1)]
        t2 = tol * tol
        while stack:
            i, j = stack.pop()
            if j <= i + 1:
                continue
            mi, md = -1, -1.0
            for k in range(i + 1, j):
                dd = d2(pts[k], pts[i], pts[j])
                if dd > md:
                    md, mi = dd, k
            if md > t2:
                keep[mi] = True
                stack.append((i, mi))
                stack.append((mi, j))
        return [p for p, k in zip(pts, keep) if k]

    out = dp(ring)
    if len(out) < 4:
        return ring
    if out[0] != out[-1]:
        out.append(out[0])
    return out


def simplify_geom(geom, tol):
    t = geom['type']
    if t == 'Polygon':
        geom['coordinates'] = [simplify_ring(r, tol) for r in geom['coordinates']]
    elif t == 'MultiPolygon':
        geom['coordinates'] = [
            [simplify_ring(r, tol) for r in poly] for poly in geom['coordinates']
        ]
    return geom


def main():
    os.makedirs(CACHE, exist_ok=True)
    feats = []
    seen = set()

    for ad in PROV_ADCODES:
        cpath = os.path.join(CACHE, '%d.json' % ad)
        if os.path.exists(cpath):
            raw = open(cpath, 'rb').read()
        else:
            for attempt in range(3):
                try:
                    raw = fetch(BASE % ad)
                    break
                except Exception as e:
                    print('  [retry %d] %d: %s' % (attempt + 1, ad, str(e)[:90]))
                    time.sleep(1.5)
            else:
                print('[warn] 跳过 %d（下载失败）' % ad)
                continue
            open(cpath, 'wb').write(raw)

        j = json.loads(raw)
        for f in j.get('features', []):
            p = f.get('properties', {})
            code = str(p.get('adcode', ''))
            if code not in CITY_ADCODES:
                continue
            if code in seen:
                continue
            seen.add(code)
            feats.append({
                'type': 'Feature',
                'properties': {
                    'adcode': code,
                    'name': p.get('name', '').replace('市', ''),
                    'center': p.get('center') or p.get('centroid'),
                },
                'geometry': f['geometry'],
            })
        print('[ok] %d -> 累计 %d 城' % (ad, len(feats)))

    # 直辖市兜底：省级 _full 接口对京津沪渝返回的是「区」级要素，
    # 这 4 个市的完整边界要从国家级 100000_full.json 里取。注意该文件用的是
    # **省级 adcode**（110000/120000/310000/500000），而房价数据的城市码是
    # 市级 adcode（110100/120100/310100/500100），需要建立映射。
    nat_path = os.path.join(CACHE, '100000.json')
    if not os.path.exists(nat_path):
        raw = fetch(BASE % 100000)
        open(nat_path, 'wb').write(raw)
    nat = json.loads(open(nat_path, 'rb').read())
    rev = dict(MUNI)   # 省级码 -> 市级码（MUNI 本身就是这个方向）
    for f in nat.get('features', []):
        p = f.get('properties', {})
        prov_code = p.get('adcode')
        city_code = rev.get(prov_code)
        if city_code and city_code not in seen:
            seen.add(city_code)
            feats.append({
                'type': 'Feature',
                'properties': {
                    'adcode': city_code,
                    'name': p.get('name', '').replace('市', ''),
                    'center': p.get('center') or p.get('centroid'),
                },
                'geometry': f['geometry'],
            })
            print('[ok] 直辖市 %s -> %s' % (p.get('name'), city_code))

    missing = CITY_ADCODES - seen
    if missing:
        print('[warn] 缺 %d 个城市边界：%s' % (len(missing), sorted(missing)))

    # 抽稀：市界在市级视图（zoom 5~7）用 0.012 度容差足够
    for f in feats:
        simplify_geom(f['geometry'], 0.012)

    fc = {'type': 'FeatureCollection', 'features': feats}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as fh:
        json.dump(fc, fh, ensure_ascii=False, separators=(',', ':'))
    print('[out] %s  %d 城  %.0f KB' % (os.path.basename(OUT), len(feats),
                                        os.path.getsize(OUT) / 1024))


if __name__ == '__main__':
    main()
