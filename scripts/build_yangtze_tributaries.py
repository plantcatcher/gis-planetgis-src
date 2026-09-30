#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""构建「万里长江 · 一江八脉」水系主干线 GeoJSON。

数据源：HydroRIVERS v10 Asia（WWF HydroSHEDS，CC-BY 4.0）
    https://data.hydrosheds.org/file/HydroRIVERS/HydroRIVERS_v10_as_shp.zip  （约 90 MB）

字段用法（HydroRIVERS v10 属性表）：
    HYRIV_ID     河段唯一编号
    NEXT_DOWN    下游河段编号（0 表示已到海洋 / 内流终点）
    MAIN_RIV     所属水系的最下游河段编号（同一水系共用，可用来圈定流域）
    LENGTH_KM    河段长度
    UPLAND_SKM   上游陆地汇水面积
    DIS_AV_CMS   多年平均流量
    ORD_STRA     Strahler 河流等级（1 = 源头河段）
    几何方向     首点 = 上游端，末点 = 下游端（已实测确认）

算法：
    1. 从每条河的「正源」河段（离已知源头坐标最近的 ORD_STRA<=2 河段）出发；
    2. 沿 NEXT_DOWN 顺流而下，直到汇入干流河段集合（支流）或走到 NEXT_DOWN=0（干流）；
    3. 湘江 / 沅江 / 赣江 先入湖再入江，额外在「入湖口」截断，避免把洞庭湖、鄱阳湖
       的过湖段当成河道（否则三条河的河长会互相串味）。
    干流用「从正源顺流」而非「从河口逆流取最大汇水面积」——后者会走到当曲而不是
    长江正源沱沱河。

用法：
    python scripts/build_yangtze_tributaries.py --shp D:/path/HydroRIVERS_v10_as.shp
输出：
    public/maps/yangtze-eight-tributaries/data/yangtze-eight-tributaries.json
"""
import argparse, json, math, os, struct, sys
import numpy as np

# ── 九条河的「正源」坐标与截断点 ──────────────────────────────────────────────
# src=(lng,lat) 正源；term=(lng,lat) 入湖口/入江口，None 表示汇入干流即止
RIVERS = {
    'yangtze-mainstream': dict(
        name='长江干流', role='mainstream', src=(90.8208, 33.5292),
        src_note='唐古拉山 · 各拉丹冬（沱沱河）', term=None),
    'yalong-river': dict(
        name='雅砻江', role='tributary', src=(97.60, 34.20),
        src_note='青海 · 巴颜喀拉山', term=None),
    'min-river': dict(
        name='岷江', role='tributary', src=(103.50, 33.10),
        src_note='四川 · 岷山弓杠岭', term=None),
    'jialing-river': dict(
        name='嘉陵江', role='tributary', src=(106.60, 34.10),
        src_note='陕西 · 秦岭代王山', term=None),
    'wu-river': dict(
        name='乌江', role='tributary', src=(104.50, 26.90),
        src_note='贵州 · 威宁香炉山', term=None),
    'xiang-river': dict(
        name='湘江', role='tributary', src=(111.00, 25.50),
        src_note='广西 · 兴安海洋山', term=(112.9396, 29.0062), into_lake='洞庭湖'),
    'yuan-river': dict(
        name='沅江', role='tributary', src=(107.40, 26.40),
        src_note='贵州 · 都匀云雾山', term=(112.3479, 28.9062), into_lake='洞庭湖'),
    'han-river': dict(
        name='汉江', role='tributary', src=(106.30, 32.85),
        src_note='陕西 · 宁强嶓冢山', term=None),
    'gan-river': dict(
        name='赣江', role='tributary', src=(115.90, 25.10),
        src_note='江西 · 石城石寮岽', term=(115.8687, 28.6896), into_lake='鄱阳湖'),
}
ORDER = ['yangtze-mainstream', 'yalong-river', 'min-river', 'jialing-river',
         'wu-river', 'xiang-river', 'yuan-river', 'han-river', 'gan-river']

MAIN_OUTLET_ID = 40613666  # 长江口河段（HYRIV_ID），用于校验


# ── HydroRIVERS 读取 ─────────────────────────────────────────────────────────
DBF_FIELDS = [
    ('id', 'i8', 1, 9), ('next_down', 'i8', 10, 9), ('main_riv', 'i8', 19, 9),
    ('length_km', 'f8', 28, 7), ('dist_dn', 'f8', 35, 7), ('dist_up', 'f8', 42, 7),
    ('catch_skm', 'f8', 49, 7), ('upland_skm', 'f8', 56, 10), ('endorheic', 'i8', 66, 4),
    ('dis_av', 'f8', 70, 10), ('ord_stra', 'i8', 80, 4),
]


def read_dbf(path):
    raw = open(path, 'rb').read()
    nrec, hlen, rlen = struct.unpack('<IHH', raw[4:12])
    body = np.frombuffer(raw, dtype=np.uint8, offset=hlen, count=nrec * rlen).reshape(nrec, rlen)
    out = {}
    for name, dt, a, ln in DBF_FIELDS:
        sub = np.ascontiguousarray(body[:, a:a + ln]).view(f'S{ln}').ravel()
        cast = int if dt == 'i8' else float
        out[name] = np.fromiter((cast(x) for x in sub), dtype='i8' if dt == 'i8' else 'f8', count=nrec)
    return out


def read_endpoints(shp_path):
    """一次遍历 shp，取每条河段的首点 / 末点与记录字节偏移。"""
    raw = open(shp_path, 'rb').read()
    n = len(raw)
    fl, fa, ll, la, off = [], [], [], [], []
    pos = 100
    un = struct.unpack_from
    while pos < n:
        off.append(pos)
        nparts, npts = un('<ii', raw, pos + 44)
        p0 = pos + 52 + nparts * 4
        fl.append(un('<d', raw, p0)[0]); fa.append(un('<d', raw, p0 + 8)[0])
        e = p0 + (npts - 1) * 16
        ll.append(un('<d', raw, e)[0]); la.append(un('<d', raw, e + 8)[0])
        pos = p0 + npts * 16
    return (np.array(fl), np.array(fa), np.array(ll), np.array(la),
            np.array(off, dtype='i8'), raw)


def haversine(a, b):
    R = 6371.0088
    lng1, lat1, lng2, lat2 = map(math.radians, (a[0], a[1], b[0], b[1]))
    h = math.sin((lat2 - lat1) / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin((lng2 - lng1) / 2) ** 2
    return 2 * R * math.asin(min(1.0, math.sqrt(h)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--shp', required=True, help='HydroRIVERS_v10_as.shp 路径')
    ap.add_argument('--out', default='public/maps/yangtze-eight-tributaries/data/yangtze-eight-tributaries.json')
    a = ap.parse_args()
    base = os.path.splitext(a.shp)[0]

    print('[1/4] 读 DBF 属性表 ...')
    at = read_dbf(base + '.dbf')
    ids = at['id']; n = len(ids)
    order = np.argsort(ids); sids = ids[order]
    print('      %d 条河段' % n)

    def lookup(vals):
        p = np.searchsorted(sids, np.atleast_1d(vals))
        pc = np.clip(p, 0, n - 1)
        return np.where(sids[pc] == np.atleast_1d(vals), order[pc], -1)

    next_idx = lookup(at['next_down'])
    U, L = at['upland_skm'], at['length_km']
    # 反向索引：ups_of(i) = 所有 next_down == ids[i] 的记录（即 i 的上游邻居）
    rev = np.argsort(at['next_down'], kind='stable')
    snd = at['next_down'][rev]
    st = np.searchsorted(snd, ids, 'left'); en = np.searchsorted(snd, ids, 'right')

    print('[2/4] 读 SHP 首尾点与偏移 ...')
    FLNG, FLAT, LLNG, LLAT, OFF, raw = read_endpoints(base + '.shp')
    un = struct.unpack_from

    def geom_of(i):
        o = int(OFF[i])
        nparts, npts = un('<ii', raw, o + 44)
        p0 = o + 52 + nparts * 4
        parts = un('<%di' % nparts, raw, o + 52)
        for k in range(nparts):
            s = parts[k]
            e = parts[k + 1] if k + 1 < nparts else npts
            pts = np.frombuffer(raw, dtype='<f8', count=(e - s) * 2, offset=p0 + s * 16).reshape(-1, 2)
            for x, y in pts:
                yield x, y

    def nearest(lng, lat, r, pool=None):
        m = (np.abs(FLNG - lng) < r) & (np.abs(FLAT - lat) < r)
        if pool is not None:
            m &= pool
        c = np.where(m)[0]
        if len(c) == 0:
            return -1
        dd = (FLNG[c] - lng) ** 2 + (FLAT[c] - lat) ** 2
        return int(c[np.argmin(dd)])

    def trace_down(start, stop=set(), stop_at=set()):
        cur = start; path = [cur]
        while True:
            if cur in stop_at:
                break
            nxt = int(next_idx[cur])
            if nxt < 0 or nxt in stop:
                break
            path.append(nxt); cur = nxt
            if len(path) > 200000:
                raise RuntimeError('拓扑成环')
        return path

    print('[3/4] 顺流追踪 9 条主干线 ...')
    # 干流
    ms = nearest(*RIVERS['yangtze-mainstream']['src'], 0.35, pool=(at['ord_stra'] <= 2))
    if ms < 0:
        sys.exit('找不到长江正源河段')
    main_path = trace_down(ms)
    main_set = set(main_path)
    out = np.array(main_path, dtype='i8')
    if int(ids[out[-1]]) != MAIN_OUTLET_ID:
        print('     ! 干流终点 %d != 预期 %d（数据版本可能不同）' % (ids[out[-1]], MAIN_OUTLET_ID))
    print('     长江干流 %d 段 / %.1f km' % (len(out), L[out].sum()))

    paths = {'yangtze-mainstream': main_path}
    for code in ORDER[1:]:
        cfg = RIVERS[code]
        s = nearest(*cfg['src'], 0.35, pool=(at['ord_stra'] <= 2))
        if s < 0:
            s = nearest(*cfg['src'], 1.0)
        if s < 0:
            sys.exit('找不到 %s 正源河段' % cfg['name'])
        stop_at = set()
        if cfg.get('term'):
            m = (np.abs(LLNG - cfg['term'][0]) < 0.08) & (np.abs(LLAT - cfg['term'][1]) < 0.08)
            stop_at = set(int(i) for i in np.where(m)[0])
        paths[code] = trace_down(s, main_set, stop_at)

    print('[4/4] 拼接几何并导出 ...')
    feats = []
    for code in ORDER:
        cfg = RIVERS[code]
        p = np.array(paths[code], dtype='i8')
        coords = []
        for i in p:
            for x, y in geom_of(i):
                xy = (round(float(x), 5), round(float(y), 5))
                if coords and abs(coords[-1][0] - xy[0]) < 1e-6 and abs(coords[-1][1] - xy[1]) < 1e-6:
                    continue
                coords.append(xy)
        geo_len = sum(haversine(coords[k], coords[k + 1]) for k in range(len(coords) - 1))
        e = int(p[-1])
        props = {
            'code': code, 'name': cfg['name'], 'role': cfg['role'],
            'length_km': round(float(L[p].sum()), 1),
            'geometry_length_km': round(geo_len, 1),
            'upstream_area_sqkm': round(float(U[e])),
            'estimated_discharge_cms': round(float(at['dis_av'][e]), 1),
            'stream_order': int(at['ord_stra'][e]),
            'reach_count': int(len(p)),
            'source_point': [round(float(FLNG[p[0]]), 5), round(float(FLAT[p[0]]), 5)],
            'mouth_point': [round(float(LLNG[e]), 5), round(float(LLAT[e]), 5)],
            'source_note': cfg['src_note'],
            'source': 'HydroRIVERS v10 Asia',
        }
        if cfg.get('into_lake'):
            props['into_lake'] = cfg['into_lake']
        feats.append({'type': 'Feature', 'properties': props,
                      'geometry': {'type': 'LineString', 'coordinates': [[x, y] for x, y in coords]}})
        print('     %-20s %5d 点  %8.1f km  汇水 %9d km²  流量 %8.1f m³/s'
              % (code, len(coords), props['length_km'], props['upstream_area_sqkm'],
                 props['estimated_discharge_cms']))

    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, 'w', encoding='utf-8') as f:
        json.dump({'type': 'FeatureCollection', 'features': feats}, f,
                  ensure_ascii=False, separators=(',', ':'))
    print('完成 -> %s (%.0f KB)' % (a.out, os.path.getsize(a.out) / 1024))


if __name__ == '__main__':
    main()
