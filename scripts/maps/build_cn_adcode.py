"""构建 cn-adcode 互动地图（行政区划代码地图）的数据文件。

输出 public/maps/cn-adcode/data/：
  - prefectures.geojson  全国地级/直辖区级单元边界（含属性：代码、名称、级别、下辖县级数等）
  - provinces.geojson    省级边界（用于总览着色与点击下钻）
  - counties/<pref>.json 每个地级单元的县级边界（点击下钻后按需加载）
  - index.json           全量代码搜索索引（省/地/县三级，紧凑数组）

数据源：
  - 代码表：yescallop/areacodes data/2025.txt（复用 ref_pages 的 /tmp/geodata 缓存）+ 2026 新设
  - 边界：DataV.GeoAtlas areas_v3（{adcode}_full.json / {adcode}.json），缓存到 /tmp/geodata/datav/

用法：python3 scripts/maps/build_cn_adcode.py
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'ref_pages'))
from common import fetch  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'public', 'maps', 'cn-adcode', 'data')
CACHE = os.environ.get('REF_CACHE', '/tmp/geodata')
DATAV = 'https://geo.datav.aliyun.com/areas_v3/bound'

ADDED_2026 = {
    '653132': '岑岭县',
    '659013': '草湖市',
}
# DataV 对港澳台只到区级；民政部代码表不收港澳台下级、台湾整省无边界
SAR_LEVEL = {'810000': '香港特别行政区', '820000': '澳门特别行政区'}


def load_codes():
    path = fetch('https://raw.githubusercontent.com/yescallop/areacodes/master/data/2025.txt', '2025.txt')
    cur = {}
    for line in open(path, encoding='utf-8-sig'):
        m = re.match(r'^(\d{6})\s+(\S.*)$', line.strip())
        if m:
            cur[m.group(1)] = m.group(2).strip()
    for c, n in ADDED_2026.items():
        cur[c] = n
    return dict(sorted(cur.items()))


def level(c):
    return 'prov' if c.endswith('0000') else 'pref' if c.endswith('00') else 'county'


def load_geo(adcode, full=True):
    name = f'datav/{adcode}{"_full" if full else ""}.json'
    os.makedirs(os.path.join(CACHE, 'datav'), exist_ok=True)
    path = fetch(f'{DATAV}/{adcode}{"_full" if full else ""}.json', name)
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def simplify_ring(ring, tol):
    """垂距简化（Douglas-Peucker 的轻量版）：够网页用即可。"""
    if len(ring) <= 4:
        return ring
    keep = [ring[0]]
    for i in range(1, len(ring) - 1):
        x0, y0 = keep[-1]
        x1, y1 = ring[i]
        x2, y2 = ring[i + 1]
        dx, dy = x2 - x0, y2 - y0
        d = abs((x1 - x0) * dy - (y1 - y0) * dx) / (dx * dx + dy * dy + 1e-12)
        if d > tol * tol:
            keep.append(ring[i])
    keep.append(ring[-1])
    return keep


def simplify_geom(geom, tol=0.0004):
    t = geom['type']
    cs = geom['coordinates']
    if t == 'Polygon':
        return {'type': t, 'coordinates': [simplify_ring(r, tol) for r in cs]}
    if t == 'MultiPolygon':
        return {'type': t, 'coordinates': [[simplify_ring(r, tol) for r in p] for p in cs]}
    return geom


def round_coords(geom, nd=4):
    def rec(c):
        if isinstance(c[0], (int, float)):
            return [round(c[0], nd), round(c[1], nd)]
        return [rec(x) for x in c]
    return {'type': geom['type'], 'coordinates': rec(geom['coordinates'])}


def prop(adcode, name, lv, extra=None):
    p = {'adcode': int(adcode), 'name': name, 'level': lv}
    if extra:
        p.update(extra)
    return p


def geo_pool(features):
    """给一组 DataV 要素建「按名称 / 按代码 / 按去后缀名称」三套索引。"""
    pool = {'by_name': {}, 'by_code': {}, 'by_base': {}}
    for f in features:
        pr = f['properties']
        code, name = str(pr['adcode']), pr['name']
        pool['by_code'][code] = f
        pool['by_name'].setdefault(name, f)
        pool['by_base'].setdefault(re.sub(r'[市县区旗]$', '', name), []).append(f)
    return pool


def pick_geo(pool, adcode, name, used):
    """按「名称 → 代码 → 去后缀名称」匹配边界。

    DataV 里不少区县仍挂着旧代码（如 320602 崇川区 ↔ 民政部 320613、460302 南沙区 ↔
    民政部 460302 西沙区），只按代码匹配会漏掉新码、甚至张冠李戴，名称才是稳定的对应。
    已匹配过的要素记入 used，避免同一个面被两个新代码重复占用。
    """
    def free(f):
        return f is not None and str(f['properties']['adcode']) not in used

    f = pool['by_name'].get(name)
    if free(f):
        used.add(str(f['properties']['adcode']))
        return f
    f = pool['by_code'].get(adcode)
    if free(f):
        used.add(str(f['properties']['adcode']))
        return f
    cands = [x for x in pool['by_base'].get(re.sub(r'[市县区旗]$', '', name), []) if free(x)]
    if len(cands) == 1:  # 撤县设市这类改名：米林县 → 米林市
        used.add(str(cands[0]['properties']['adcode']))
        return cands[0]
    return None


def main():
    cur = load_codes()
    os.makedirs(os.path.join(OUT, 'counties'), exist_ok=True)

    prov_codes = [c for c in cur if level(c) == 'prov']
    pref_feats, prov_feats = [], []
    index_rows = []  # [code, name, level, parent_code]
    stats = {'pref': 0, 'county': 0, 'geo_pref': 0, 'geo_county': 0}

    for pc in prov_codes:
        pname = cur[pc]
        index_rows.append([pc, pname, 'prov', ''])
        prov_geo = load_geo(pc, full=False)  # 省整体边界
        pf = prov_geo['features'][0]
        prov_feats.append({
            'type': 'Feature',
            'properties': prop(pc, pname, 'prov'),
            'geometry': round_coords(simplify_geom(pf['geometry'])),
        })

        # 台湾省民政部只列省级码，DataV 也无下级——跳过下钻
        if pc == '710000':
            continue

        subs_geo = load_geo(pc, full=True)['features']
        geo_by_code = {str(f['properties']['adcode']): f for f in subs_geo}
        geo_by_name = {f['properties']['name']: f for f in subs_geo}
        prov_pool = geo_pool(subs_geo)

        subs_codes = [c for c in cur if c[:2] == pc[:2] and c != pc]
        prefs = [c for c in subs_codes if level(c) == 'pref']
        counties = [c for c in subs_codes if level(c) == 'county']

        # 港澳台 DataV 的 _full 直接给区级，但代码段与民政部不同（8100xx 统计用码），
        # 按民政部口径它们没有下级行政区划代码——地图里把港澳视作「地级单元」不可再下钻。
        if pc in SAR_LEVEL:
            for c in prefs + counties:  # 民政部表中港澳无下级；防御性遍历
                pass
            pref_feats.append({
                'type': 'Feature',
                # prov 用自身名：目录按 prov 分组，缺这个属性港澳会挂到上一个省的分组里
                'properties': prop(pc, pname, 'pref', {'prov': pname, 'countyN': 0, 'note': '特别行政区'}),
                'geometry': prov_feats[-1]['geometry'],
            })
            stats['pref'] += 1
            continue

        for prefc in prefs:
            pname2 = cur[prefc]
            sub_counties = [c for c in counties if c[:4] == prefc[:4]]
            index_rows.append([prefc, pname2, 'pref', pc])
            stats['pref'] += 1
            g = geo_by_code.get(prefc) or geo_by_name.get(pname2)
            if g is None:
                print('  ! pref missing in DataV:', prefc, pname2)
                continue
            stats['geo_pref'] += 1
            pref_feats.append({
                'type': 'Feature',
                'properties': prop(prefc, pname2, 'pref', {
                    'prov': pname,
                    'countyN': len(sub_counties),
                    'center': g['properties'].get('center'),
                }),
                'geometry': round_coords(simplify_geom(g['geometry'])),
            })

            # 县级边界（民政部代码表里的县才收，DataV 里多出的统计用码跳过）。
            # DataV 部分区县仍挂旧代码，按名称匹配；仍找不到的（2024 后新设）记 noGeo。
            county_feats, no_geo = [], []
            cg = load_geo(prefc, full=True)['features'] if sub_counties else []
            cpool = geo_pool(cg)
            used = set()
            for cc in sub_counties:
                index_rows.append([cc, cur[cc], 'county', prefc])
                stats['county'] += 1
                f = pick_geo(cpool, cc, cur[cc], used)
                if f is None:
                    no_geo.append(cc)
                    continue
                stats['geo_county'] += 1
                county_feats.append({
                    'type': 'Feature',
                    'properties': prop(cc, cur[cc], 'county'),
                    'geometry': round_coords(simplify_geom(f['geometry'])),
                })
            if no_geo:
                # 新设县级单位边界暂缺：记在父级属性上，前端据此提示而不是说「加载失败」
                pref_feats[-1]['properties']['noGeo'] = no_geo
                print('  ! county boundary missing:', prefc, pname2, no_geo)
            if county_feats:
                with open(os.path.join(OUT, 'counties', f'{prefc}.json'), 'w', encoding='utf-8') as f:
                    json.dump({'type': 'FeatureCollection', 'features': county_feats}, f,
                              ensure_ascii=False, separators=(',', ':'))

        # 省直辖县级行政区划（90 段）：DataV 把它们标成 'city'，民政部表是县级码
        direct_used = set()
        for cc in [c for c in counties if c[2:4] == '90']:
            index_rows.append([cc, cur[cc], 'county', pc])
            stats['county'] += 1
            g = pick_geo(prov_pool, cc, cur[cc], direct_used)
            if g is None:
                print('  ! direct county missing:', cc, cur[cc])
                continue
            stats['geo_county'] += 1
            pref_feats.append({
                'type': 'Feature',
                'properties': prop(cc, cur[cc], 'county', {'prov': pname, 'direct': True,
                                                         'center': g['properties'].get('center')}),
                'geometry': round_coords(simplify_geom(g['geometry'])),
            })
            # 省直辖县级单位本身没有再分下级，counties/<code>.json 就放它自己一个面
            with open(os.path.join(OUT, 'counties', f'{cc}.json'), 'w', encoding='utf-8') as f:
                json.dump({'type': 'FeatureCollection', 'features': [{
                    'type': 'Feature',
                    'properties': prop(cc, cur[cc], 'county'),
                    'geometry': round_coords(simplify_geom(g['geometry'])),
                }]}, f, ensure_ascii=False, separators=(',', ':'))

        # 直辖市的区/县：民政部表中是县级码直接挂省级（xx01xx / xx02xx），DataV 同
        for cc in [c for c in counties if c[2:4] in ('01', '02')]:
            if cc[:4] + '00' in cur:  # 有正式地级父级的不走这条（常规市辖区）
                continue
            index_rows.append([cc, cur[cc], 'county', pc])
            stats['county'] += 1
            g = pick_geo(prov_pool, cc, cur[cc], direct_used)
            if g is None:
                continue
            stats['geo_county'] += 1
            pref_feats.append({
                'type': 'Feature',
                'properties': prop(cc, cur[cc], 'county', {'prov': pname, 'direct': True,
                                                         'center': g['properties'].get('center')}),
                'geometry': round_coords(simplify_geom(g['geometry'])),
            })
            with open(os.path.join(OUT, 'counties', f'{cc}.json'), 'w', encoding='utf-8') as f:
                json.dump({'type': 'FeatureCollection', 'features': [{
                    'type': 'Feature',
                    'properties': prop(cc, cur[cc], 'county'),
                    'geometry': round_coords(simplify_geom(g['geometry'])),
                }]}, f, ensure_ascii=False, separators=(',', ':'))

        print(pc, pname, 'prefs:', len(prefs), 'counties:', len(counties))

    def dump(name, obj):
        with open(os.path.join(OUT, name), 'w', encoding='utf-8') as f:
            json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))

    dump('prefectures.geojson', {'type': 'FeatureCollection', 'features': pref_feats})
    dump('provinces.geojson', {'type': 'FeatureCollection', 'features': prov_feats})
    dump('index.json', {'rows': index_rows})
    print('done.', stats, 'index rows:', len(index_rows))


if __name__ == '__main__':
    main()
