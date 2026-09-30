#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
茶马古道三条主线 · 数据构建

产物：
  public/maps/tea-horse-road/data/routes.json   3 条 LineString（滇藏道 / 川藏道 / 青藏道）
  public/maps/tea-horse-road/data/nodes.json    驿镇节点 Point

数据口径（重要，页面与 vizmaps.json 的说明与此保持一致）：
  * 节点坐标是真实城镇 / 山口 / 汇合点的 WGS84 经纬度（人工整理，量级 0.01°）。
  * 线路几何 **不是**测绘意义上的历史道路：茶马古道是跨时期、多支线的交通网络，
    没有单一年代的权威线画。本图取「驿镇节点依次连线 + 曲线化」的表达——
    相邻节点之间做插值并叠加端点归零的正弦摆动，使折线不呈尺子直连观感，
    节点始终精确落在线 上。因此本数据只可用于地理人文叙事与关系示意，
    不可作为道路、遗址边界或勘界依据。
  * 里程 = 沿线坐标的 haversine 累加（用 WGS84 原值计算），
    与实测古道里程口径不同，仅用于三条主线之间横向比较。
  * 输出坐标统一转为 GCJ-02，与高德瓦片底图及 _shared/china-provinces.json 对齐；
    节点的原始 WGS84 坐标保留在 properties.wgs84 中，便于核对与二次利用。

用法：python scripts/build_tea_horse_road.py
"""

import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT_DIR = os.path.join(ROOT, 'public', 'maps', 'tea-horse-road', 'data')

# ── 配色：与 cn-terrain-steps 的三级阶梯同色系，保持系列视觉一致 ──────────────
C_DIANCANG = '#3fae86'   # 青绿
C_CHUANCANG = '#e0924a'  # 橙金
C_QINGZANG = '#b07ad6'   # 紫

# ── 驿镇节点（WGS84 真实坐标） ────────────────────────────────────────────────
# kind: origin 起点 / stage 驿站 / pass 山口 / junction 汇合点 / terminus 终点
ROUTES = [
    {
        'id': 'diancang',
        'no': '01',
        'name': '滇藏道',
        'color': C_DIANCANG,
        'badge': 'YUNNAN → TIBET',
        'origin': '云南 · 普洱',
        'destination': '西藏 · 芒康',
        'teaser': '从普洱茶山出发，经过大理、丽江、德钦，进入高原腹地。',
        'desc': '云南方向的主线。茶叶从滇南的茶山启程，沿苍山洱海西侧北上，'
                '翻越横断山脉的云岭与梅里，在盐井进入西藏，于芒康与川藏道会合。'
                '这条线海拔爬升最陡——起点普洱不足 1,500 米，到德钦、盐井已是 3,000 米以上，'
                '中间几乎没有缓冲地带。',
        'goods': '普洱茶、井盐、氆氇（藏区毛织品）',
        'note': '在芒康汇入川藏道，此后共用同一段路抵达拉萨。',
        'nodes': [
            {'name': '普洱', 'lng': 100.97, 'lat': 22.78, 'kind': 'origin',
             'note': '滇南茶山门户，清代普洱茶的主要集散地。'},
            {'name': '景东', 'lng': 100.84, 'lat': 24.45, 'kind': 'stage',
             'note': '无量山与哀牢山之间的坝子，滇南进入滇西的过渡驿站。'},
            {'name': '大理', 'lng': 100.23, 'lat': 25.60, 'kind': 'stage',
             'note': '苍山洱海之间的商帮枢纽，喜洲、下关的马帮在此换货。'},
            {'name': '剑川', 'lng': 99.91, 'lat': 26.54, 'kind': 'stage',
             'note': '白族木雕之乡，滇西北入藏前的最后一片河谷平坝。'},
            {'name': '丽江', 'lng': 100.23, 'lat': 26.87, 'kind': 'stage',
             'note': '纳西族聚居的商贸重镇，藏区马帮与云南茶商的交易中心。'},
            {'name': '香格里拉', 'lng': 99.71, 'lat': 27.83, 'kind': 'stage',
             'note': '旧称中甸，进入藏区高原的第一级台阶，海拔升至 3,300 米。'},
            {'name': '德钦', 'lng': 98.91, 'lat': 28.48, 'kind': 'stage',
             'note': '梅里雪山脚下的滇藏门户，澜沧江河谷的最后一个大驿站。'},
            {'name': '盐井', 'lng': 98.60, 'lat': 29.04, 'kind': 'stage',
             'note': '澜沧江边的古盐田，晒盐与运茶在此交汇，今属西藏芒康县。'},
            {'name': '芒康', 'lng': 98.59, 'lat': 29.68, 'kind': 'junction',
             'note': '滇藏道与川藏道的会合点，自此向西共用一条路。'},
        ],
    },
    {
        'id': 'chuancang',
        'no': '02',
        'name': '川藏道',
        'color': C_CHUANCANG,
        'badge': 'SICHUAN → TIBET',
        'origin': '四川 · 雅安',
        'destination': '西藏 · 拉萨',
        'teaser': '从雅安出发，经康定、理塘、巴塘、芒康，穿越康巴地区抵达昌都。',
        'desc': '里程最长、驿镇最密的一条主线，也是茶马古道上运量最大的一条。'
                '茶叶从雅安、天全一带的茶号出发，翻二郎山进康定，'
                '在横断山区的三江并流地带反复爬升与下切，经理塘、巴塘入藏，'
                '过芒康、左贡、八宿、然乌、波密、林芝，最终抵达拉萨。'
                '它的走向几乎完全贴着河谷——马帮一天的路程，取决于下一个能扎营的河滩在哪里。',
        'goods': '雅安边茶（砖茶）、藏马、皮革、麝香',
        'note': '滇藏道在芒康汇入本线；川藏道是三条主线中驿镇最多的一条。',
        'nodes': [
            {'name': '雅安', 'lng': 103.00, 'lat': 29.99, 'kind': 'origin',
             'note': '川西边茶的中心，茶号在此压制砖茶后启运。'},
            {'name': '泸定', 'lng': 102.23, 'lat': 29.91, 'kind': 'stage',
             'note': '大渡河铁索桥所在，翻二郎山后的第一处歇脚地。'},
            {'name': '康定', 'lng': 101.96, 'lat': 30.05, 'kind': 'stage',
             'note': '旧称打箭炉，茶马互市的核心市场，"锅庄"于此云集。'},
            {'name': '雅江', 'lng': 101.01, 'lat': 30.03, 'kind': 'stage',
             'note': '雅砻江河谷中的小城，海拔骤降再骤升的中继站。'},
            {'name': '理塘', 'lng': 100.27, 'lat': 29.99, 'kind': 'stage',
             'note': '毛垭大草原上的高城，海拔约 4,000 米，康巴地区商贸中心。'},
            {'name': '巴塘', 'lng': 99.10, 'lat': 30.00, 'kind': 'stage',
             'note': '金沙江畔的川滇藏结合部，入藏前的最后一个四川大站。'},
            {'name': '芒康', 'lng': 98.59, 'lat': 29.68, 'kind': 'junction',
             'note': '滇藏道在此汇入，两条主线合流后继续西行。'},
            {'name': '左贡', 'lng': 97.84, 'lat': 29.67, 'kind': 'stage',
             'note': '玉曲河谷的牧业县，往北可通川藏北线重镇昌都。'},
            {'name': '邦达', 'lng': 97.29, 'lat': 30.28, 'kind': 'stage',
             'note': '川藏南线与北线的交汇处，草原上的分岔口。'},
            {'name': '八宿', 'lng': 96.92, 'lat': 30.05, 'kind': 'stage',
             'note': '怒江峡谷上缘，著名的怒江七十二拐就在附近。'},
            {'name': '然乌', 'lng': 96.76, 'lat': 29.49, 'kind': 'stage',
             'note': '然乌湖畔，帕隆藏布江的源头段，藏东南湿润区的开端。'},
            {'name': '波密', 'lng': 95.77, 'lat': 29.86, 'kind': 'stage',
             'note': '帕隆藏布河谷，冰川与森林交错，海拔降至 2,700 米左右。'},
            {'name': '林芝', 'lng': 94.36, 'lat': 29.65, 'kind': 'stage',
             'note': '尼洋河与雅鲁藏布江汇流处，藏东南的门户城市。'},
            {'name': '工布江达', 'lng': 93.25, 'lat': 29.89, 'kind': 'stage',
             'note': '尼洋河上游，翻米拉山前的最后一站。'},
            {'name': '拉萨', 'lng': 91.14, 'lat': 29.65, 'kind': 'terminus',
             'note': '三条主线的共同终点，高原上最大的消费与宗教中心。'},
        ],
    },
    {
        'id': 'qingzang',
        'no': '03',
        'name': '青藏道',
        'color': C_QINGZANG,
        'badge': 'CHANG\'AN → LHASA',
        'origin': '陕西 · 西安',
        'destination': '西藏 · 拉萨',
        'teaser': '从长安经甘青高原到达那曲、拉萨，连接中原与吐蕃的高原通道。',
        'desc': '又称唐蕃古道，是三条主线里唯一从黄河、长江流域直接上高原的一条。'
                '它从长安出发，经天水、兰州进入河湟谷地，再沿青海湖以南的西行，'
                '过玛多、玉树，翻唐古拉山口进入羌塘，经那曲、当雄抵达拉萨。'
                '这条线不经横断山区的深切河谷，路更平缓，但全程在 4,000 米以上行进的时间最长，'
                '也是文成公主入藏的路线。',
        'goods': '丝绸、茶叶、中原器物、藏区马匹与畜产',
        'note': '即唐蕃古道；不经横断山区，是一条以高原面为主体的通道。',
        'nodes': [
            {'name': '西安', 'lng': 108.94, 'lat': 34.34, 'kind': 'origin',
             'note': '旧称长安，唐蕃古道的起点，中原一侧的货物集散地。'},
            {'name': '天水', 'lng': 105.72, 'lat': 34.58, 'kind': 'stage',
             'note': '渭河上游，陇右入关中的第一处大驿。'},
            {'name': '兰州', 'lng': 103.82, 'lat': 36.06, 'kind': 'stage',
             'note': '黄河渡口，自此离开黄河流域、折向湟水谷地。'},
            {'name': '西宁', 'lng': 101.78, 'lat': 36.62, 'kind': 'stage',
             'note': '河湟谷地的中心，中原通往青藏的门户。'},
            {'name': '湟源', 'lng': 101.26, 'lat': 36.68, 'kind': 'stage',
             'note': '日月山以东，农牧交错带上的茶马互市口岸。'},
            {'name': '共和', 'lng': 100.62, 'lat': 36.28, 'kind': 'stage',
             'note': '青海湖南岸的恰卜恰，翻青海南山后进入高原面。'},
            {'name': '玛多', 'lng': 98.21, 'lat': 34.92, 'kind': 'stage',
             'note': '黄河源头第一县，海拔 4,200 米以上，人烟稀少。'},
            {'name': '玉树', 'lng': 97.01, 'lat': 33.00, 'kind': 'stage',
             'note': '通天河与扎曲交汇处，青海南部最大的商贸集散地。'},
            {'name': '唐古拉山口', 'lng': 92.35, 'lat': 32.95, 'kind': 'pass',
             'note': '青海与西藏的天然分界，海拔超过 5,000 米，全线最高的一段。'},
            {'name': '那曲', 'lng': 92.06, 'lat': 31.48, 'kind': 'stage',
             'note': '羌塘草原上的重镇，藏北牧区的畜产品在此集结南下。'},
            {'name': '当雄', 'lng': 91.10, 'lat': 30.48, 'kind': 'stage',
             'note': '念青唐古拉山南麓，进入拉萨河谷平原前的最后一站。'},
            {'name': '拉萨', 'lng': 91.14, 'lat': 29.65, 'kind': 'terminus',
             'note': '与川藏道共用的终点，三线在此收束成一点。'},
        ],
    },
]

# ── 坐标转换：WGS84 → GCJ-02（火星坐标），与高德瓦片对齐 ─────────────────────
A_ = 6378245.0
EE = 0.00669342162296594323


def _out_of_china(lng, lat):
    return not (72.004 <= lng <= 137.8347 and 0.8293 <= lat <= 55.8271)


def _transform_lat(x, y):
    ret = (-100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y
           + 0.2 * math.sqrt(abs(x)))
    ret += (20.0 * math.sin(6.0 * x * math.pi) + 20.0 * math.sin(2.0 * x * math.pi)) * 2.0 / 3.0
    ret += (20.0 * math.sin(y * math.pi) + 40.0 * math.sin(y / 3.0 * math.pi)) * 2.0 / 3.0
    ret += (160.0 * math.sin(y / 12.0 * math.pi) + 320 * math.sin(y * math.pi / 30.0)) * 2.0 / 3.0
    return ret


def _transform_lng(x, y):
    ret = (300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * math.sqrt(abs(x)))
    ret += (20.0 * math.sin(6.0 * x * math.pi) + 20.0 * math.sin(2.0 * x * math.pi)) * 2.0 / 3.0
    ret += (20.0 * math.sin(x * math.pi) + 40.0 * math.sin(x / 3.0 * math.pi)) * 2.0 / 3.0
    ret += (150.0 * math.sin(x / 12.0 * math.pi) + 300.0 * math.sin(x / 30.0 * math.pi)) * 2.0 / 3.0
    return ret


def wgs84_to_gcj02(lng, lat):
    if _out_of_china(lng, lat):
        return lng, lat
    dlat = _transform_lat(lng - 105.0, lat - 35.0)
    dlng = _transform_lng(lng - 105.0, lat - 35.0)
    radlat = lat / 180.0 * math.pi
    magic = math.sin(radlat)
    magic = 1 - EE * magic * magic
    sqrtmagic = math.sqrt(magic)
    dlat = (dlat * 180.0) / ((A_ * (1 - EE)) / (magic * sqrtmagic) * math.pi)
    dlng = (dlng * 180.0) / (A_ / sqrtmagic * math.cos(radlat) * math.pi)
    return lng + dlng, lat + dlat


# ── 几何：节点连线 + 曲线化 ──────────────────────────────────────────────────
def _phase_of(name_a, name_b):
    """由端点名确定摆动的相位与方向，保证同一段每次生成结果一致（可复现）。"""
    seed = sum(ord(c) for c in (name_a + name_b))
    return (seed % 997) / 997.0 * 2 * math.pi


def _curve_segment(a, b, n, phase):
    """在 a、b 之间插入 n 个中间点：垂直方向叠加端点归零的正弦摆动。

    端点系数 sin(pi*t) 在 t=0 与 t=1 时为 0 —— 摆动不影响节点的精确位置。
    """
    (x0, y0), (x1, y1) = a, b
    dx, dy = x1 - x0, y1 - y0
    seg = math.hypot(dx, dy)
    if seg < 1e-9:
        return []
    # 摆动幅度：随段长增长但设上限，避免短线看不出弯、长线摆过头
    amp = min(0.12, seg * 0.055)
    # 垂直方向单位向量（垂直于 a→b）
    ux, uy = -dy / seg, dx / seg
    pts = []
    for i in range(1, n + 1):
        t = i / (n + 1)
        k = math.sin(math.pi * t) * math.cos(2.1 * math.pi * t + phase)
        pts.append((x0 + dx * t + ux * amp * k, y0 + dy * t + uy * amp * k))
    return pts


def _haversine(a, b):
    """两点球面距离（米），入参为 (lng, lat)。"""
    lng1, lat1 = math.radians(a[0]), math.radians(a[1])
    lng2, lat2 = math.radians(b[0]), math.radians(b[1])
    h = (math.sin((lat2 - lat1) / 2) ** 2
         + math.cos(lat1) * math.cos(lat2) * math.sin((lng2 - lng1) / 2) ** 2)
    return 2 * 6371008.8 * math.asin(min(1.0, math.sqrt(h)))


def build_route_line(route):
    """按节点顺序连成一条曲线化折线。

    返回 (coordinates, length_km, node_km)：
      coordinates —— 曲线化后的全线坐标
      length_km   —— 沿线 haversine 累加里程
      node_km     —— 每个节点在曲线上的累计里程（用于挑主线名的标注位置）
    """
    nodes = route['nodes']
    coords = [(float(n['lng']), float(n['lat'])) for n in nodes]
    out = [coords[0]]
    idxs = [0]                                  # 每个节点在 out 中的下标
    for i in range(len(coords) - 1):
        seg = math.hypot(coords[i + 1][0] - coords[i][0], coords[i + 1][1] - coords[i][1])
        # 插值密度：按段长自适应，保证每 0.05° 至少一个点
        n = max(6, min(40, int(seg / 0.05) + 4))
        phase = _phase_of(nodes[i]['name'], nodes[i + 1]['name'])
        out.extend(_curve_segment(coords[i], coords[i + 1], n, phase))
        out.append(coords[i + 1])
        idxs.append(len(out) - 1)

    cum = [0.0]
    for i in range(len(out) - 1):
        cum.append(cum[-1] + _haversine(out[i], out[i + 1]))
    return out, cum[-1] / 1000.0, [cum[k] for k in idxs]


def label_anchor(node_km):
    """挑主线名的标注位置：在里程 30%~70% 区间里找**节点最稀疏**的那一段，
    取段中点。这样主线名不会压在任何驿镇标签上。"""
    total = node_km[-1]
    best_frac, best_len = None, -1.0
    for i in range(len(node_km) - 1):
        f = (node_km[i] + node_km[i + 1]) / 2.0 / total
        if not (0.30 <= f <= 0.70):
            continue
        seg = node_km[i + 1] - node_km[i]
        if seg > best_len:
            best_len, best_frac = seg, f
    if best_frac is None:
        best_frac = 0.45
    return round(best_frac, 3)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    route_feats, node_feats = [], []

    for r in ROUTES:
        wgs_coords, length_km, node_km = build_route_line(r)
        gcj_coords = [list(wgs84_to_gcj02(x, y)) for x, y in wgs_coords]
        label_at = label_anchor(node_km)

        route_feats.append({
            'type': 'Feature',
            'properties': {
                'id': r['id'],
                'no': r['no'],
                'name': r['name'],
                'color': r['color'],
                'badge': r['badge'],
                'origin': r['origin'],
                'destination': r['destination'],
                'teaser': r['teaser'],
                'desc': r['desc'],
                'goods': r['goods'],
                'note': r['note'],
                'length_km': round(length_km),
                'node_count': len(r['nodes']),
                'vertex_count': len(gcj_coords),
                # 主线名标注位置：节点最稀疏处的中点（构建期算好，避免压在驿镇标签上）
                'label_at': label_at,
            },
            'geometry': {'type': 'LineString',
                         'coordinates': [[round(x, 5), round(y, 5)] for x, y in gcj_coords]},
        })

        for i, n in enumerate(r['nodes']):
            gx, gy = wgs84_to_gcj02(float(n['lng']), float(n['lat']))
            node_feats.append({
                'type': 'Feature',
                'properties': {
                    'id': '%s-%d' % (r['id'], i + 1),
                    'name': n['name'],
                    'route': r['id'],
                    'route_name': r['name'],
                    'route_no': r['no'],
                    'color': r['color'],
                    'seq': i + 1,
                    'of': len(r['nodes']),
                    'kind': n['kind'],
                    'note': n['note'],
                    'wgs84': [round(float(n['lng']), 4), round(float(n['lat']), 4)],
                },
                'geometry': {'type': 'Point', 'coordinates': [round(gx, 5), round(gy, 5)]},
            })

    routes_fc = {
        '_comment': '茶马古道三条主线：节点连线 + 曲线化处理的示意线（GCJ-02）。'
                    '非历史道路实测线画，仅供地理人文叙事，见 scripts/build_tea_horse_road.py 的口径说明。',
        'type': 'FeatureCollection',
        'features': route_feats,
    }
    nodes_fc = {
        '_comment': '茶马古道驿镇节点（GCJ-02）。properties.wgs84 为原始 WGS84 经纬度。',
        'type': 'FeatureCollection',
        'features': node_feats,
    }

    p1 = os.path.join(OUT_DIR, 'routes.json')
    p2 = os.path.join(OUT_DIR, 'nodes.json')
    with open(p1, 'w', encoding='utf-8') as f:
        json.dump(routes_fc, f, ensure_ascii=False, separators=(',', ':'))
    with open(p2, 'w', encoding='utf-8') as f:
        json.dump(nodes_fc, f, ensure_ascii=False, separators=(',', ':'))

    for r, feat in zip(ROUTES, route_feats):
        p = feat['properties']
        print('%-6s %-8s 里程 %5d km  节点 %2d  顶点 %4d   %s → %s'
              % (p['id'], p['name'], p['length_km'], p['node_count'], p['vertex_count'],
                 p['origin'], p['destination']))
    print('写明 %s（%.1f KB）' % (p1, os.path.getsize(p1) / 1024))
    print('写明 %s（%.1f KB，%d 个节点）' % (p2, os.path.getsize(p2) / 1024, len(node_feats)))


if __name__ == '__main__':
    main()
