# -*- coding: utf-8 -*-
"""把 6 国互动地图的 L1 补齐中文名/首府/人口/看点，并回填 L2 的父级中文名。
用法：python scripts/enrich_six_regions.py
数据口径：
  - 中文名 / 首府 / 看点 ← scripts/enrich_six_meta.py（人工整理）
  - 人口 ← scripts/six_l1_pops.json（citypopulation.de）+ 新西兰 2023 普查
"""
import json, os, sys, io
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from enrich_six_meta import META, NZ_POP, RU_MAP, RU_POP_EXTRA

POPS = json.load(open(os.path.join(HERE, 'six_l1_pops.json'), encoding='utf-8'))

# GADM engtype → 中文类型（同时用作 groupZh，供「类型」着色）
TYPE_MAP = {
 'bra': {'State': '州', 'Federal District': '联邦区'},
 'can': {'Province': '省', 'Territory': '地区'},
 'deu': {'State': '州', 'Free State': '州'},
 'nzl': {'Region': '大区', 'Territory': '领地', 'Group of islands': '群岛'},
 'rus': {'Republic': '共和国', 'Territory': '边疆区', 'Region': '州',
         'Autonomous Province': '自治区', 'Autonomous Region': '自治州', 'City': '直辖市'},
 'usa': {'State': '州', 'Federal District': '联邦区'},
}

COUNTRIES = [('bra', 'bra-regions'), ('can', 'can-regions'), ('deu', 'deu-regions'),
             ('nzl', 'nzl-regions'), ('rus', 'rus-regions'), ('usa', 'usa-regions')]

def pop_of(cc, gadm_name):
    if cc == 'nzl':
        return NZ_POP.get(gadm_name)
    if cc == 'rus':
        if gadm_name in RU_POP_EXTRA:
            return RU_POP_EXTRA[gadm_name]
        key = RU_MAP.get(gadm_name)
        return POPS['russia'].get(key) if key else None
    if cc == 'usa':
        if gadm_name == 'District of Columbia':
            return POPS['usa'].get('District of Columbia (DC)')
        return POPS['usa'].get(gadm_name)
    return POPS[{'bra': 'brazil', 'can': 'canada', 'deu': 'germany'}[cc]].get(gadm_name)

def dump(path, obj):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))

for cc, slug in COUNTRIES:
    base = os.path.join(ROOT, 'public', 'maps', slug, 'data')
    p_path = os.path.join(base, 'provinces.geojson')
    d_path = os.path.join(base, 'districts.geojson')
    prov = json.load(open(p_path, encoding='utf-8'))
    gid2zh, missing, gid2en = {}, [], {}
    for ft in prov['features']:
        p = ft['properties']
        nm = p.get('nameEn') or p['name']   # GADM 原名（首轮后存于 nameEn，保证可重复运行）
        meta = META[cc].get(nm)
        if not meta:
            missing.append(nm); continue
        zh, cap, blurb = meta
        pop = pop_of(cc, nm)
        p['nameEn'] = nm
        p['name'] = zh
        p['capital'] = cap
        p['pop'] = pop
        p['blurb'] = blurb
        gz = TYPE_MAP[cc].get(p.get('engtype'), p.get('groupZh'))
        p['type'] = gz
        p['groupZh'] = gz
        # 以「CC.N」为键（L1/L2 后缀可能不同：_1 或 _2）
        gid2zh['.'.join(p['gid'].split('_')[0].split('.')[:2])] = zh
        gid2en['.'.join(p['gid'].split('_')[0].split('.')[:2])] = nm
    if missing:
        print(f'!! {slug} 缺元数据: {missing}')
    dump(p_path, prov)
    print(f'{slug}: L1 完成 {len(gid2zh)}/{len(prov["features"])}')

    # L2 回填父级中文名
    if os.path.exists(d_path):
        dist = json.load(open(d_path, encoding='utf-8'))
        miss = 0
        for ft in dist['features']:
            gid = ft['properties'].get('gid', '')
            key = '.'.join(gid.split('_')[0].split('.')[:2])
            zh = gid2zh.get(key)
            if zh:
                ft['properties']['provZh'] = zh
            else:
                miss += 1
        dump(d_path, dist)
        print(f'   L2 完成 {len(dist["features"])-miss}/{len(dist["features"])}（未匹配 {miss}）')
