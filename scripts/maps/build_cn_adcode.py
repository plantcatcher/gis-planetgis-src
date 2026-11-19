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
import glob
import json
import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'ref_pages'))
from common import fetch  # noqa: E402

from shapely import set_precision  # noqa: E402
from shapely.geometry import mapping, shape  # noqa: E402
from shapely.ops import unary_union  # noqa: E402
from shapely.validation import make_valid  # noqa: E402

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


def polygonal(g):
    """只留面。make_valid 对自相交的环可能返回 GeometryCollection（面 + 线/点毛刺）。"""
    if g is None or g.is_empty:
        return None
    if g.geom_type in ('Polygon', 'MultiPolygon'):
        return g
    if g.geom_type == 'GeometryCollection':
        polys = [p for p in g.geoms if p.geom_type in ('Polygon', 'MultiPolygon')]
        return unary_union(polys) if polys else None
    return None


def clean_geom(geom, tol=0.0004, grid=1e-4):
    """修好自相交的环，再简化、取整。

    DataV areas_v3 里有 270 来个单元的环自相交（绵阳的游仙区、北川羌族自治县都在内）。
    MapLibre 的 earcut 三角化遇到这种多边形会画出错误的填充三角，屏幕上就是
    「边界没加载全、拉一条横线闭口」。所以每个面都过一遍：
      make_valid 拆开自相交 → 只留面 → 拓扑保持的简化 → 网格取整（合并近重合点）
    取整后再校验一次，不合格就退回未简化的修复版；实在修不好宁可留原样，
    也不能让单元从地图上消失（代码检索还要靠它）。
    """
    g = shape(geom)
    if not g.is_valid:
        g = polygonal(make_valid(g))
    if g is None or g.is_empty:
        return None
    cands = []
    try:
        cands.append(set_precision(g.simplify(tol, preserve_topology=True), grid))
    except Exception:  # noqa: BLE001 — GEOS 修不干净时直接退回未简化版
        pass
    cands.append(g)
    for c in cands:
        c = polygonal(c)
        if c is None:
            continue
        if c.is_valid:
            return round_coords(mapping(c), nd=4)
    return round_coords(mapping(g), nd=4)


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


def repair_existing():
    """就地修复已生成的数据（不重新下载 DataV）。

    生成脚本的 clean_geom 已经保证新数据是干净的；这个入口用于修补历史上生成的文件：
      python3 scripts/maps/build_cn_adcode.py --repair
    只动 geometry，属性原样保留；每个文件覆盖前先写 .tmp 再原子替换。
    """
    bad = 0
    for path in [os.path.join(OUT, 'provinces.geojson'), os.path.join(OUT, 'prefectures.geojson')] + \
            sorted(glob.glob(os.path.join(OUT, 'counties', '*.json'))):
        with open(path, encoding='utf-8') as f:
            fc = json.load(f)
        changed = 0
        for feat in fc['features']:
            g = feat.get('geometry')
            if not g:
                continue
            try:
                if shape(g).is_valid:
                    continue
            except Exception:  # noqa: BLE001
                pass
            fixed = clean_geom(g)
            if fixed:
                feat['geometry'] = fixed
                changed += 1
        if changed:
            bad += changed
            tmp = path + '.tmp'
            with open(tmp, 'w', encoding='utf-8') as f:
                json.dump(fc, f, ensure_ascii=False, separators=(',', ':'))
            os.replace(tmp, path)
            print(f'  fixed {changed:3d}  {os.path.relpath(path, OUT)}')
    print('repair done, features fixed:', bad)


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
            'geometry': clean_geom(pf['geometry']),
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
                'geometry': clean_geom(g['geometry']),
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
                    'geometry': clean_geom(f['geometry']),
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
                'geometry': clean_geom(g['geometry']),
            })
            # 省直辖县级单位本身没有再分下级，counties/<code>.json 就放它自己一个面
            with open(os.path.join(OUT, 'counties', f'{cc}.json'), 'w', encoding='utf-8') as f:
                json.dump({'type': 'FeatureCollection', 'features': [{
                    'type': 'Feature',
                    'properties': prop(cc, cur[cc], 'county'),
                    'geometry': clean_geom(g['geometry']),
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
                'geometry': clean_geom(g['geometry']),
            })
            with open(os.path.join(OUT, 'counties', f'{cc}.json'), 'w', encoding='utf-8') as f:
                json.dump({'type': 'FeatureCollection', 'features': [{
                    'type': 'Feature',
                    'properties': prop(cc, cur[cc], 'county'),
                    'geometry': clean_geom(g['geometry']),
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
    if '--repair' in sys.argv:
        repair_existing()
    else:
        main()
