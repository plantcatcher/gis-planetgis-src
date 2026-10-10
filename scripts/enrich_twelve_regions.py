# -*- coding: utf-8 -*-
"""把 12 国互动地图的 L1 补齐中文名/首府/人口/看点，并回填 L2 的父级中文名。
用法：python scripts/enrich_twelve_regions.py
数据：scripts/enrich_twelve_meta.py（人工整理，键为 GADM GID_1）。
人口为近似值，详见 meta 文件说明。可重复运行。
"""
import json, os, sys
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from enrich_twelve_meta import META

COUNTRIES = [('are', 'are-regions'), ('arg', 'arg-regions'), ('che', 'che-regions'),
             ('fin', 'fin-regions'), ('fra', 'fra-regions'), ('isr', 'isr-regions'),
             ('nld', 'nld-regions'), ('prk', 'prk-regions'), ('sau', 'sau-regions'),
             ('sgp', 'sgp-regions'), ('swe', 'swe-regions'), ('tur', 'tur-regions')]

def dump(path, obj):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))

for cc, slug in COUNTRIES:
    base = os.path.join(ROOT, 'public', 'maps', slug, 'data')
    p_path = os.path.join(base, 'provinces.geojson')
    d_path = os.path.join(base, 'districts.geojson')
    prov = json.load(open(p_path, encoding='utf-8'))
    dist = json.load(open(d_path, encoding='utf-8'))

    meta = META.get(cc, {})
    used = set()
    gid2zh, missing = {}, []
    for ft in prov['features']:
        p = ft['properties']
        gid = p.get('gid')
        m = meta.get(gid)
        if not m:
            missing.append(gid)
            continue
        zh, cap, pop, blurb = m
        used.add(gid)
        eng = p.get('nameEn') or p.get('name')
        p['name'] = zh
        p['nameEn'] = eng
        p['capital'] = cap
        p['pop'] = pop
        p['blurb'] = blurb
        nl = p.get('nameLocal')
        if not nl or nl == eng:
            p['nameLocal'] = ''
        gid2zh[gid] = zh

    # L2 父级中文名
    sub_missing = 0
    for ft in dist['features']:
        p = ft['properties']
        gid2 = p.get('gid') or ''
        parts = gid2.split('.')
        l1gid = parts[0] + '.' + parts[1] + '_1' if len(parts) >= 2 else ''
        if l1gid in gid2zh:
            p['provZh'] = gid2zh[l1gid]
        else:
            sub_missing += 1

    dump(p_path, prov)
    dump(d_path, dist)

    orphan = set(meta.keys()) - used
    n1 = len(prov['features']); n2 = len(dist['features'])
    print(f"### {slug} | L1={n1} (matched {len(used)})  L2={n2} (provZh unmatched {sub_missing})")
    if missing:
        print(f"  [MISSING L1, no meta] {missing}")
    if orphan:
        print(f"  [ORPHAN meta keys, no feature] {sorted(orphan)}")
print("\nDONE. 中文名/首府/人口/看点 与 L2 父级中文名 回填完毕。")
