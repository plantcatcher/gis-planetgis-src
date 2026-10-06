# -*- coding: utf-8 -*-
"""全球水电站互动地图 · 数据管线

源数据：D:/BaiduNetdiskDownload/全球水电站/GloHydroRes_vs1.csv
  —— WRI GeoDAR / JRC / EHA / RePP 等来源合并的全球水电站台账，坐标系 WGS84。

产出（public/maps/world-hydro/data/）：
  plants.json     7778 座电站点位（GeoJSON，属性精简、短键）
  countries.json  128 个国家/地区的聚合（站数、总装机、类型构成、重心坐标）
  stats.json      分档阈值、类型标签、年代分箱、国家中英名对照

三条铁律：
  1. 合规：Taiwan 并入 China、Kosovo 并入 Serbia，不在数据层面把两者表述为主权国家。
  2. 国家重心 = 装机容量加权几何平均（必落在国土凸包内），不是首府、不是 bbox 中心。
  3. 缺测值统一置 null（不是 0、不是空串），前端按 '—' 渲染，避免「没有数据」被误读成「值为零」。
"""
import csv
import io
import json
import math
import os
from collections import Counter, defaultdict

SRC = 'D:/BaiduNetdiskDownload/全球水电站/GloHydroRes_vs1.csv'
OUT = 'D:/WorkSpace/00PlanetGIS源码/public/maps/world-hydro/data'

# ── 电站类型（源数据 plant_type 原始编码）────────────────────────────
TYPES = {
    'STO': {'key': 'STO', 'label': '蓄水式', 'full': '水库式水电站：有坝体调蓄，枯水期也能稳定发电',
            'color': '#4ea3f0'},
    'ROR': {'key': 'ROR', 'label': '径流式', 'full': '径流式电站：径流过机即发电，基本不调蓄',
            'color': '#37d6a8'},
    'PS':  {'key': 'PS',  'label': '抽水蓄能', 'full': '抽水蓄能电站：负荷低谷抽水、高峰放水发电，净发电为负',
            'color': '#f2b23c'},
    'Canal': {'key': 'CANAL', 'label': '渠道引水', 'full': '无坝引水电站：靠渠道落差或短引水径流发电',
              'color': '#c58cf0'},
    '':    {'key': 'UNK', 'label': '类型未标注', 'full': '源数据未标注电站型式',
            'color': '#8a97ab'},
}

# ── 国家名归一：合规合并 + 中文名 ──────────────────────────────────
# merge: 源数据的国名 -> 归并后的键（合规处理，避免把台湾/科索沃表述为主权国家）
MERGE = {
    'Taiwan': 'China',
    'Kosovo': 'Serbia',
}

# 源数据（ISO/英文）-> 中文名。缺项在下方 warn 中列出。
CN = {
    'Afghanistan': '阿富汗', 'Albania': '阿尔巴尼亚', 'Algeria': '阿尔及利亚',
    'Angola': '安哥拉', 'Argentina': '阿根廷', 'Armenia': '亚美尼亚',
    'Australia': '澳大利亚', 'Austria': '奥地利', 'Azerbaijan': '阿塞拜疆',
    'Bangladesh': '孟加拉国', 'Belgium': '比利时', 'Bhutan': '不丹',
    'Bolivia': '玻利维亚', 'Bosnia and Herzegovina': '波黑', 'Brazil': '巴西',
    'Bulgaria': '保加利亚', 'Burkina Faso': '布基纳法索', 'Burundi': '布隆迪',
    'Cambodia': '柬埔寨', 'Cameroon': '喀麦隆', 'Canada': '加拿大',
    'Central African Republic': '中非', 'Chile': '智利', 'China': '中国',
    'Colombia': '哥伦比亚', 'Congo': '刚果（布）', 'Costa Rica': '哥斯达黎加',
    'Croatia': '克罗地亚', 'Czech Republic': '捷克',
    'Democratic Republic of the Congo': '刚果（金）',
    'Dominican Republic': '多米尼加', 'Ecuador': '厄瓜多尔', 'Egypt': '埃及',
    'El Salvador': '萨尔瓦多', 'Equatorial Guinea': '赤道几内亚', 'Ethiopia': '埃塞俄比亚',
    'Fiji': '斐济', 'Finland': '芬兰', 'France': '法国', 'French Guiana': '法属圭亚那',
    'Gabon': '加蓬', 'Georgia': '格鲁吉亚', 'Germany': '德国', 'Ghana': '加纳',
    'Greece': '希腊', 'Guatemala': '危地马拉', 'Guinea': '几内亚', 'Honduras': '洪都拉斯',
    'Hungary': '匈牙利', 'Iceland': '冰岛', 'India': '印度', 'Indonesia': '印度尼西亚',
    'Iran': '伊朗', 'Iraq': '伊拉克', 'Ireland': '爱尔兰', 'Italy': '意大利',
    'Ivory Coast': '科特迪瓦', 'Jamaica': '牙买加', 'Japan': '日本',
    'Kazakhstan': '哈萨克斯坦', 'Kenya': '肯尼亚', 'Kyrgyzstan': '吉尔吉斯斯坦',
    'Laos': '老挝', 'Latvia': '拉脱维亚', 'Lesotho': '莱索托', 'Liberia': '利比里亚',
    'Lithuania': '立陶宛', 'Madagascar': '马达加斯加', 'Malawi': '马拉维',
    'Malaysia': '马来西亚', 'Mali': '马里', 'Mauritius': '毛里求斯', 'Mexico': '墨西哥',
    'Moldova': '摩尔多瓦', 'Montenegro': '黑山', 'Morocco': '摩洛哥', 'Mozambique': '莫桑比克',
    'Myanmar': '缅甸', 'Namibia': '纳米比亚', 'Nepal': '尼泊尔', 'New Zealand': '新西兰',
    'Nicaragua': '尼加拉瓜', 'Nigeria': '尼日利亚', 'North Korea': '朝鲜',
    'North Macedonia': '北马其顿', 'Norway': '挪威', 'Pakistan': '巴基斯坦',
    'Panama': '巴拿马', 'Papua New Guinea': '巴布亚新几内亚', 'Paraguay': '巴拉圭',
    'Peru': '秘鲁', 'Philippines': '菲律宾', 'Poland': '波兰', 'Portugal': '葡萄牙',
    'Romania': '罗马尼亚', 'Russia': '俄罗斯', 'Rwanda': '卢旺达', 'Serbia': '塞尔维亚',
    'Sierra Leone': '塞拉利昂', 'Slovakia': '斯洛伐克', 'Slovenia': '斯洛文尼亚',
    'South Africa': '南非', 'South Korea': '韩国', 'Spain': '西班牙',
    'Sri Lanka': '斯里兰卡', 'Sudan': '苏丹', 'Sweden': '瑞典', 'Switzerland': '瑞士',
    'Syrian Arab Republic': '叙利亚', 'Tajikistan': '塔吉克斯坦', 'Tanzania': '坦桑尼亚',
    'Thailand': '泰国', 'Togo': '多哥', 'Tunisia': '突尼斯', 'Turkey': '土耳其',
    'Uganda': '乌干达', 'Ukraine': '乌克兰',
    'United Kingdom': '英国', 'United States of America': '美国',
    'Uruguay': '乌拉圭', 'Uzbekistan': '乌兹别克斯坦', 'Venezuela': '委内瑞拉',
    'Vietnam': '越南', 'Zambia': '赞比亚', 'Zimbabwe': '津巴布韦', 'eSwatini': '斯威士兰',
}


def num(v):
    """空串 / None / 非法值统一转 None（缺测 ≠ 0）"""
    if v is None:
        return None
    v = v.strip()
    if not v:
        return None
    try:
        f = float(v)
    except ValueError:
        return None
    if math.isnan(f) or math.isinf(f):
        return None
    return f


def s(v):
    v = (v or '').strip()
    return v or None


def rnd(v, n=4):
    return None if v is None else round(v, n)


def build():
    with io.open(SRC, encoding='utf-8-sig', errors='replace') as f:
        rows = list(csv.DictReader(f))
    print('CSV rows:', len(rows))

    feats = []
    by_country = defaultdict(list)
    missing_cn = set()
    seen_ids = set()

    for r in rows:
        rid = (r.get('ID') or '').strip()
        if not rid or rid in seen_ids:
            continue                      # ID 缺失/重复的脏行直接丢
        seen_ids.add(rid)

        lat, lon = num(r.get('plant_lat')), num(r.get('plant_lon'))
        if lat is None or lon is None or not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            continue                      # 无坐标的台账行无法落点

        c_raw = (r.get('country') or '').strip()
        if not c_raw:
            continue
        c_key = MERGE.get(c_raw, c_raw)
        if c_key not in CN:
            missing_cn.add(c_raw)

        t = TYPES.get((r.get('plant_type') or '').strip(), TYPES[''])
        cap = num(r.get('capacity_mw'))
        year = num(r.get('year'))
        if year is not None:
            year = int(year)
            if not (1800 <= year <= 2030):      # 明显异常年份按缺测处理
                year = None

        f_ = {
            't': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': [rnd(lon, 5), rnd(lat, 5)]},
            'properties': {
                'id': rid,
                'n': s(r.get('name')),                 # 电站名
                'c': c_key,                            # 国家（归并后）
                'w': cap,                              # 装机 MW
                'y': year,                             # 投产年
                'p': t['key'],                         # 型式
                'd': s(r.get('dam_name')),             # 坝名
                'h': rnd(num(r.get('dam_height_m')), 1),          # 坝高 m
                'r': s(r.get('river')),                # 所在河流
                'hd': rnd(num(r.get('head_m')), 1),               # 水头 m
                'av': rnd(num(r.get('res_vol_km3')), 3),          # 库容 km³
                'ar': rnd(num(r.get('res_area_km2')), 2),         # 库区面积 km²
            },
        }
        feats.append(f_)
        by_country[c_key].append((f_['properties'],
                                  f_['geometry']['coordinates'][0],
                                  f_['geometry']['coordinates'][1]))

    missing_cn.discard('')
    if missing_cn:
        print('!! 缺少中文名映射（本次已按英文名兜底）:', sorted(missing_cn))

    # ── 国家聚合 ────────────────────────────────────────────────────
    countries = []
    for key, grp in by_country.items():
        plist = [g[0] for g in grp]                 # 该国全部电站属性
        n = len(plist)
        cap_total = sum(p['w'] for p in plist if p['w'] is not None)
        cap_n = sum(1 for p in plist if p['w'] is not None)
        tcount = Counter(p['p'] for p in plist)

        # 装机容量加权几何重心：必落在该国电站点的凸包内
        wx = wy = wsum = 0.0
        for p, x, y in grp:
            w = p['w'] if (p['w'] is not None and p['w'] > 0) else 1.0
            wx += x * w
            wy += y * w
            wsum += w
        cx = round(wx / wsum, 4) if wsum else None
        cy = round(wy / wsum, 4) if wsum else None

        ys = [p['y'] for p in plist if p['y'] is not None]
        hs = [p['h'] for p in plist if p['h'] is not None]
        # 各国装机最大的 3 座（作详情卡里的代表电站）
        top3 = sorted([p for p in plist if p['w'] is not None],
                      key=lambda p: -p['w'])[:3]

        countries.append({
            'c': key,
            'cn': CN.get(key, key),
            'n': n,
            'w': rnd(cap_total, 1),
            'wn': cap_n,
            't': [tcount.get(t['key'], 0) for t in
                  (TYPES['STO'], TYPES['ROR'], TYPES['PS'], TYPES['Canal'], TYPES[''])],
            'y0': min(ys) if ys else None,
            'y1': max(ys) if ys else None,
            'hmax': rnd(max(hs), 1) if hs else None,
            'cxy': [cx, cy] if cx is not None else None,
            'top': [{'n': p['n'], 'w': p['w'], 'y': p['y'], 'd': p['d']} for p in top3],
        })

    countries.sort(key=lambda x: -(x['w'] or 0))
    for i, c in enumerate(countries):
        c['rk'] = i + 1

    # ── 装机容量分档（对数档，跨度 2.5MW ~ 22500MW）─────────────────
    caps = [p['w'] for p in (f['properties'] for f in feats) if p['w'] is not None]
    cap_tiers = [
        {'min': 5000,    'color': '#ff5f6d', 'label': '5000 MW 以上', 'r': [7, 26]},
        {'min': 1000,    'color': '#ffa14a', 'label': '1000 – 4999 MW', 'r': [5.5, 18]},
        {'min': 300,     'color': '#ffd84d', 'label': '300 – 999 MW', 'r': [4.5, 13]},
        {'min': 50,      'color': '#4ee08a', 'label': '50 – 299 MW', 'r': [3.5, 9.5]},
        {'min': 1,       'color': '#39b6f0', 'label': '1 – 49 MW', 'r': [2.4, 6.5]},
        {'min': 0,       'color': '#7f8da0', 'label': '装机未标注', 'r': [2, 5]},
    ]
    # 国家总装机分档
    cw = sorted([c['w'] for c in countries if c['w']], reverse=True)
    cnt_tiers = [
        {'min': 100000, 'color': '#ff5f6d', 'label': '10 万 MW 以上'},
        {'min': 50000,  'color': '#ffa14a', 'label': '5 万 – 10 万 MW'},
        {'min': 20000,  'color': '#ffd84d', 'label': '2 万 – 5 万 MW'},
        {'min': 5000,   'color': '#4ee08a', 'label': '5000 – 2 万 MW'},
        {'min': 1000,   'color': '#39b6f0', 'label': '1000 – 5000 MW'},
        {'min': 0,      'color': '#7f8da0', 'label': '1000 MW 以下'},
    ]

    # ── 年代分箱 ────────────────────────────────────────────────────
    decades = Counter()
    for f in feats:
        y = f['properties']['y']
        if y:
            decades[y // 10 * 10] += 1
    dec_list = [{'d': d, 'n': decades[d]} for d in sorted(decades)]

    total_cap = round(sum(caps), 1)
    stats = {
        'nPlant': len(feats),
        'nCountry': len(countries),
        'nCap': len(caps),
        'capTotal': total_cap,
        'capMax': max(caps) if caps else None,
        'yearMin': min((f['properties']['y'] for f in feats if f['properties']['y']), default=None),
        'yearMax': max((f['properties']['y'] for f in feats if f['properties']['y']), default=None),
        'yearN': sum(1 for f in feats if f['properties']['y'] is not None),
        'types': [{'k': t['key'], 'label': t['label'], 'full': t['full'], 'color': t['color'],
                   'n': sum(1 for f in feats if f['properties']['p'] == t['key'])} for t in
                  (TYPES['STO'], TYPES['ROR'], TYPES['PS'], TYPES['Canal'], TYPES[''])],
        'capTiers': cap_tiers,
        'cntTiers': cnt_tiers,
        'decades': dec_list,
        'mergeNote': '数据集中 Taiwan（7 座）已按一个国家的一部分并入中国统计；'
                     'Kosovo（2 座）并入塞尔维亚。两者未单独列为国家。',
        'srcNote': '源数据 GloHydroRes v1（WRI GeoDAR / JRC 全球水电数据库 / EHA / RePP 等合并），'
                   'WGS84，坐标为电站厂址点。',
    }

    os.makedirs(OUT, exist_ok=True)
    dump('plants.json', {'type': 'FeatureCollection', 'features': feats})
    dump('countries.json', {'countries': countries, 'cn': CN})
    dump('stats.json', stats)

    print('plants:', len(feats), '| countries:', len(countries),
          '| cap total(MW):', total_cap)
    print('  缺测：装机 %d / 投产年 %d / 坝高 %d / 库容 %d' % (
        stats['nPlant'] - stats['nCap'], stats['nPlant'] - stats['yearN'],
        sum(1 for f in feats if f['properties']['h'] is None),
        sum(1 for f in feats if f['properties']['av'] is None)))
    print('  年份跨度:', stats['yearMin'], '→', stats['yearMax'])
    print('  Top10 国家:', ', '.join(
        '%s(%s MW)' % (c['cn'], fmt_int(c['w'])) for c in countries[:10]))
    print('  类型构成:', ', '.join('%s %d' % (t['label'], t['n']) for t in stats['types']))


def fmt_int(v):
    if v is None:
        return '—'
    return format(int(round(v)), ',d')


def dump(name, obj):
    p = os.path.join(OUT, name)
    txt = json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
    with io.open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(txt)
    print('  → %s  (%.0f KB)' % (p, len(txt.encode('utf-8')) / 1024.0))


if __name__ == '__main__':
    build()
