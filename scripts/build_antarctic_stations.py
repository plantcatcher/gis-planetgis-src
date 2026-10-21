#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""南极科考站分布地图 —— 数据构建。

输入：_g/_antarctic_src/comnap_master.json
      PolarGeospatialCenter/comnap-antarctic-facilities dist/geojson v3.5.0（2024-03-15 发布），
      COMNAP 各成员国南极计划自报口径。
输入（中文补充）：_g/antarctic_names.py —— 只补翻译/分区/落点描述，不改源属性。

输出：public/maps/antarctic-stations/data/
      points.json     设施点位（FeatureCollection，属性字段名压缩）
      countries.json  国家维度聚合
      stats.json      总量、分组阈值、口径与合规说明

口径：
  · 只收 Type=Station/Camp/Refuge/Depot/Laboratory/Airfield Camp 六类设施，
    COMNAP 表中「Open」与「Temporarily Closed」均收（共 114 条）。
  · 已永久退役的历史站点（如 Little America、Wilkes、Dakshin Gangotri）不在本表内。
  · 60°S 以北的亚南极站（麦夸里岛）单独标记 sub=1，并在说明中注明不适用《南极条约》。
  · 不绘制任何领土主张：《南极条约》第 4 条冻结各国主张，本图只用区/海/地物名表达位置。
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from antarctic_names import COUNTRY_ZH, SEASON_ZH, SITES, STATUS_ZH, TYPE_ZH, ZONES  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, '_g', '_antarctic_src', 'comnap_master.json')
DST = os.path.join(ROOT, 'public', 'maps', 'antarctic-stations', 'data')
os.makedirs(DST, exist_ok=True)

# 国家配色：给站点最多的国家各一个可分辨色，其余归 #7c8ba1
COUNTRY_COLORS = {
    'Chile': '#e05252', 'Argentina': '#f0803c', 'Russia': '#e0a52e',
    'Australia': '#5ec26a', 'United States': '#4aa3df', 'China': '#d93a3a',
    'Italy': '#3fbf8f', 'Brazil': '#d7c53a', 'Japan': '#d8568a',
    'United Kingdom': '#c86ade', 'Germany': '#47c2c2', 'France': '#7b83ea',
    'Spain': '#5ad0c0', 'Norway': '#9aa6bd', 'India': '#e08a2e',
    'South Africa': '#8ec13a', 'Republic of Korea': '#59a8e0',
    'New Zealand': '#63c8a8', 'Sweden': '#88c7e8', 'Ukraine': '#e0c23a',
    'Uruguay': '#7fc4d8', 'Poland': '#d06a6a', 'Finland': '#8fd0e8',
    'Netherlands': '#ea8c4a', 'Czech Republic': '#b48ce0',
    'Belgium': '#6ad0d0', 'Bulgaria': '#c9a04a', 'Ecuador': '#e0d05a',
    'Peru': '#d05a5a', 'Türkiye': '#e04a7a', 'Republic of Belarus': '#b06a8a',
}
OTHER_COLOR = '#8291a8'


def dig(props, key):
    v = props.get(key)
    return None if v in ('', None) else v


def build():
    src = json.load(open(SRC, encoding='utf-8'))
    feats = src['features']

    miss = []
    points = []
    for f in feats:
        p = f['properties']
        en = (p.get('English_Name') or '').strip()
        key = en
        if key not in SITES:
            # COMNAP 里有个别名称前后带空格，做一次宽松匹配
            cands = [k for k in SITES if k.strip() == en]
            if cands:
                key = cands[0]
            else:
                miss.append(en)
                continue
        zh, zone, loc = SITES[key]
        ce = p.get('Operator__primary_') or '—'
        lat = p['Latitude__DD_']
        lon = p['Longitude__DD_']
        tz, tcode = TYPE_ZH.get(p['Type'], (p['Type'], 'other'))
        sz, scode = SEASON_ZH.get(p['Seasonality'], (p['Seasonality'], 'S'))
        stz, stcode = STATUS_ZH.get(p['Status'], (p['Status'], 'O'))
        points.append({
            'type': 'Feature',
            'properties': {
                'id': p['Record_ID_'],
                'n': zh, 'en': en, 'of': dig(p, 'Official_Name'),
                'c': COUNTRY_ZH.get(ce, ce), 'ce': ce,
                'color': COUNTRY_COLORS.get(ce, OTHER_COLOR),
                't': tcode, 'tl': tz,
                's': scode, 'sl': sz,
                'st': stcode, 'ss': stz,
                'y': dig(p, 'Year_Established'),
                'pop': dig(p, 'Peak_Population'),
                'el': dig(p, 'Elevation__meters_'),
                'pw': dig(p, 'Power_Supply_Types'),
                'lat': lat, 'lon': lon,
                'z': zone, 'loc': loc,
                'sub': 1 if lat > -60 else 0
            },
            'geometry': {'type': 'Point', 'coordinates': [lon, lat]}
        })
    if miss:
        print('!! 缺中文名（跳过 %d 条）：' % len(miss))
        for m in miss:
            print('   -', m)
    points.sort(key=lambda f: (f['properties']['c'], -f['properties']['lat']))

    with open(os.path.join(DST, 'points.json'), 'w', encoding='utf-8') as fo:
        json.dump({'type': 'FeatureCollection', 'features': points},
                  fo, ensure_ascii=False, separators=(',', ':'))

    # ── 国家聚合 ────────────────────────────────────────────────
    agg = {}
    for f in points:
        p = f['properties']
        a = agg.setdefault(p['ce'], {
            'ce': p['ce'], 'c': p['c'], 'color': p['color'],
            'n': 0, 'yr': 0, 'se': 0, 'pop': 0, 'zc': {},
            'lats': [], 'lons': [], 'minY': 9999, 'maxY': 0,
            'maxPop': 0, 'top': None, 'topPop': -1
        })
        a['n'] += 1
        if p['s'] == 'Y':
            a['yr'] += 1
        else:
            a['se'] += 1
        if p['pop']:
            a['pop'] += p['pop']
            if p['pop'] > a['topPop']:
                a['topPop'], a['top'] = p['pop'], p['n']
        if p['y']:
            a['minY'] = min(a['minY'], p['y'])
            a['maxY'] = max(a['maxY'], p['y'])
        a['zc'][p['z']] = a['zc'].get(p['z'], 0) + 1
        a['lats'].append(p['lat'])
        a['lons'].append(p['lon'])

    countries = []
    for ce, a in agg.items():
        # 经度取平均不能用算术均值（跨反子午线会翻到对面），用单位矢量合成
        import math
        sx = sum(math.cos(math.radians(l)) * math.cos(math.radians(o)) for l, o in zip(a['lats'], a['lons']))
        sy = sum(math.cos(math.radians(l)) * math.sin(math.radians(o)) for l, o in zip(a['lats'], a['lons']))
        sz = sum(math.sin(math.radians(l)) for l in a['lats'])
        countries.append({
            'ce': ce, 'c': a['c'], 'color': a['color'],
            'n': a['n'], 'yr': a['yr'], 'se': a['se'],
            'pop': a['pop'],
            'minY': None if a['minY'] == 9999 else a['minY'],
            'maxY': a['maxY'] or None,
            'top': a['top'], 'topPop': a['topPop'] if a['topPop'] > 0 else None,
            'zc': a['zc'],
            'cxy': [round(math.degrees(math.atan2(sy, sx)), 4),
                    round(math.degrees(math.atan2(sz, math.hypot(sx, sy))), 4)]
        })
    countries.sort(key=lambda x: (-x['n'], x['c']))
    with open(os.path.join(DST, 'countries.json'), 'w', encoding='utf-8') as fo:
        json.dump({'countries': countries}, fo, ensure_ascii=False, separators=(',', ':'))

    # ── 统计口径 ────────────────────────────────────────────────
    def cnt(pred):
        return sum(1 for f in points if pred(f['properties']))

    zones = []
    for code, (name, color) in ZONES.items():
        n = cnt(lambda p, c=code: p['z'] == c)
        zones.append({'code': code, 'name': name, 'color': color, 'n': n})
    types = []
    for code, (name, _) in TYPE_ZH.items():
        types.append({'code': code, 'name': name, 'n': cnt(lambda p, c=code: p['t'] == c)})

    els = [f['properties']['el'] for f in points if f['properties']['el'] is not None]
    pops = [f['properties']['pop'] for f in points if f['properties']['pop'] is not None]
    years = [f['properties']['y'] for f in points if f['properties']['y']]

    stats = {
        'n': len(points),
        'nCountry': len(countries),
        'nYear': cnt(lambda p: p['s'] == 'Y'),
        'nSeason': cnt(lambda p: p['s'] == 'S'),
        'nOpen': cnt(lambda p: p['st'] == 'O'),
        'nClosed': cnt(lambda p: p['st'] == 'C'),
        'nSub': cnt(lambda p: p['sub'] == 1),
        'zones': zones,
        'types': types,
        'topCountry': [{'c': x['c'], 'n': x['n']} for x in countries[:10]],
        'elMax': round(max(els), 1) if els else None,
        'elMaxName': max(points, key=lambda f: (f['properties']['el'] or -1e9))['properties']['n'],
        'elMin': round(min(els), 1) if els else None,
        'popSum': sum(pops),
        'popMax': max(pops),
        'popMaxName': max(points, key=lambda f: (f['properties']['pop'] or -1))['properties']['n'],
        'yearMin': min(years), 'yearMax': max(years),
        'nNoYear': cnt(lambda p: not p['y']),
        'nNoPop': cnt(lambda p: not p['pop']),
        'nNoEl': cnt(lambda p: p['el'] is None),
        'source': 'COMNAP 南极设施总表 v3.5.0（2024-03-15 发布，2024 年 11 月版；由各成员国南极计划自报）'
    }
    with open(os.path.join(DST, 'stats.json'), 'w', encoding='utf-8') as fo:
        json.dump(stats, fo, ensure_ascii=False, separators=(',', ':'))

    for name in ('points.json', 'countries.json', 'stats.json'):
        print('%-16s %8d bytes' % (name, os.path.getsize(os.path.join(DST, name))))
    print('points = %d / countries = %d' % (len(points), len(countries)))
    print('missing Chinese names = %d' % len(miss))


if __name__ == '__main__':
    build()
