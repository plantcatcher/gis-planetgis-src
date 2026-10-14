# -*- coding: utf-8 -*-
"""把 Top12 互动地图 L1 补齐中文名/首府/人口/看点，并回填 L2 父级中文名。
用法：python scripts/enrich_top12_regions.py
数据：scripts/enrich_top12_meta.py（键为 GADM GID_1）。可重复运行。
"""
import json, os, sys
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from enrich_top12_meta import META

COUNTRIES = [('tha','tha-regions'),('mex','mex-regions'),('ita','ita-regions'),
             ('cod','cod-regions'),('ken','ken-regions'),('uzb','uzb-regions'),
             ('khm','khm-regions'),('mmr','mmr-regions'),('mar','mar-regions'),
             ('tza','tza-regions'),('gha','gha-regions'),('col','col-regions')]

def dump(path, obj):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))

for cc, slug in COUNTRIES:
    base = os.path.join(ROOT, 'public', 'maps', slug, 'data')
    prov = json.load(open(os.path.join(base, 'provinces.geojson'), encoding='utf-8'))
    dist = json.load(open(os.path.join(base, 'districts.geojson'), encoding='utf-8'))
    meta = META.get(cc, {})
    used = set(); gid2zh, missing = {}, []
    for ft in prov['features']:
        p = ft['properties']; gid = p.get('gid'); m = meta.get(gid)
        if not m:
            missing.append(gid); continue
        zh, cap, pop, blurb = m; used.add(gid)
        eng = p.get('nameEn') or p.get('name')
        p['name'] = zh; p['nameEn'] = eng; p['capital'] = cap
        p['pop'] = pop; p['blurb'] = blurb
        nl = p.get('nameLocal')
        if not nl or nl == eng:
            p['nameLocal'] = ''
        gid2zh[gid] = zh
    # L2 父级中文名（兼容多种 GID 结构：THA.1_1/COL.1_2/GHA1_2 等）
    def l1key(gid):
        return gid.rsplit('_', 1)[0] if '_' in gid else gid
    def l2parent(l2gid):
        base = l2gid.rsplit('_', 1)[0] if '_' in l2gid else l2gid
        parts = base.split('.')
        if not parts or not parts[0]:
            return ''
        p0 = parts[0]
        if any(c.isdigit() for c in p0):   # GHA1 样式：索引在首段
            return p0
        if len(parts) >= 2:                 # COL.1 样式：索引在第二段
            return p0 + '.' + parts[1]
        return p0
    l1map = {l1key(g): zh for g, zh in gid2zh.items()}
    sub_missing = 0
    for ft in dist['features']:
        p = ft['properties']; gid2 = p.get('gid') or ''
        pk = l2parent(gid2)
        if pk and pk in l1map:
            p['provZh'] = l1map[pk]
        else:
            sub_missing += 1
    dump(os.path.join(base, 'provinces.geojson'), prov)
    dump(os.path.join(base, 'districts.geojson'), dist)
    orphan = set(meta.keys()) - used
    n1 = len(prov['features']); n2 = len(dist['features'])
    print(f"### {slug} | L1={n1} (matched {len(used)})  L2={n2} (provZh unmatched {sub_missing})")
    if missing:
        print(f"  [MISSING L1] {missing}")
    if orphan:
        print(f"  [ORPHAN meta] {sorted(orphan)}")
print("\nDONE. Top12 enrich 回填完毕。")
