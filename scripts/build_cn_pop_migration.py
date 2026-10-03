#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
中国历史十次人口迁徙 · 数据构建
（参考可视化：giser.cloud/thematic/10x-cn-pop-flow —— 不抓取对方接口，用公开史料与地名自建复刻）

产物：
  public/maps/cn-pop-migration/data/routes.json   32 条代表路线 LineString
  public/maps/cn-pop-migration/data/nodes.json    38 个城市节点 Point
  public/maps/cn-pop-migration/data/events.json   10 次迁徙事件元数据（章节 / 配色 / 动因 / 描述）

数据口径（页面与 vizmaps.json 的说明与此保持一致）：
  * 节点坐标为真实城市的 WGS84 经纬度（人工整理，量级 0.01°）。
  * 路线几何 **不是**测绘意义上的真实迁徙路径：中国历史上的大迁徙是跨时期、多流向的人口运动，
    不存在单一年代的“权威线画”。本图取「起讫城市连线 + 曲线化」的表达——
    相邻节点之间做插值并叠加端点归零的正弦摆动，使折线不呈尺子直连观感，
    端点始终精确落在线 上。因此本数据只可用于地理人文叙事与关系示意。
  * 里程 = 沿线坐标的 haversine 累加（用 WGS84 原值计算），仅用于各事件之间横向比较。
  * 输出坐标统一转为 GCJ-02，与高德瓦片底图及 _shared/china-provinces.json 对齐；
    节点的原始 WGS84 坐标保留在 properties.wgs84 中，便于核对与二次利用。

用法：python scripts/build_cn_pop_migration.py
"""

import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT_DIR = os.path.join(ROOT, 'public', 'maps', 'cn-pop-migration', 'data')

# ── 10 次迁徙事件：温暖→冷色的时间梯度配色，呼应“从战乱红到工业紫”的叙事 ──────
EVENTS = [
    {
        'id': 'e1', 'no': '01', 'color': '#e2483b', 'name': '衣冠南渡', 'period': '307–317', 'group': 'g1',
        'driver': '战乱避难',
        'origin': '中原（洛阳、长安）', 'dest': '江南（建康、会稽）',
        'teaser': '西晋永嘉之乱，中原士族第一次大规模南迁。',
        'desc': '西晋永嘉年间，匈奴等族攻陷洛阳、长安，中原战乱连绵。门阀士族与百姓相携南奔，'
                '渡江后聚于建康（今南京）及三吴会稽一带，史称“衣冠南渡”。'
                '这是中原人口第一次成规模地离开黄河流域，江南自此由边鄙渐成重心。',
    },
    {
        'id': 'e2', 'no': '02', 'color': '#ef6b3a', 'name': '安史之乱后的南迁', 'period': '755–960', 'group': 'g1',
        'driver': '战乱避难',
        'origin': '中原（洛阳、长安）', 'dest': '江南（扬州、杭州）',
        'teaser': '唐中期战乱，人口再度大规模南移，江南彻底超越中原。',
        'desc': '安史之乱持续八年，黄河中下游残破，继之以藩镇割据、黄巢之乱。'
                '北方人口循运河与长江南奔扬州、杭州、宣歙，南方户数首次逼近并逐步超过北方，'
                '“赋出天下而江南居十九”的格局在此奠定。',
    },
    {
        'id': 'e3', 'no': '03', 'color': '#f0902f', 'name': '靖康之难后的南迁', 'period': '1126–1279', 'group': 'g1',
        'driver': '战乱避难',
        'origin': '中原（汴京）', 'dest': '江南（临安、福州）',
        'teaser': '北宋亡于金，赵宋南渡，政治中心彻底移往江南。',
        'desc': '靖康之难，汴京（今开封）陷落，宋室南渡定都临安（今杭州），史称南宋。'
                '宗室、官僚、工匠、百姓裹挟南下，部分更辗转入闽。中国经济、文化重心自此完全南移。',
    },
    {
        'id': 'e4', 'no': '04', 'color': '#e8b53a', 'name': '明初洪洞大槐树移民', 'period': '1371–1417', 'group': 'g2',
        'driver': '政策移民',
        'origin': '山西洪洞', 'dest': '华北（北京、济南、郑州）',
        'teaser': '明初政府组织的官方大移民，填补战乱后中原空虚。',
        'desc': '元末战乱使中原“积骸成丘、户丁稀绝”。明初政府于山西洪洞大槐树设局，'
                '分批迁民填实华北、中原，“问我祖先在何处，山西洪洞大槐树”由此流传。',
    },
    {
        'id': 'e5', 'no': '05', 'color': '#c9c23a', 'name': '走西口', 'period': '1571–1937', 'group': 'g2',
        'driver': '边疆开发',
        'origin': '山西、陕北', 'dest': '塞外（归绥、包头）',
        'teaser': '“哥哥走西口”，晋陕百姓出塞垦荒、边贸谋生。',
        'desc': '口内人多地狭、岁饥频仍，百姓循长城诸口（杀虎口等）西出，'
                '进入河套与蒙古草原垦牧、行商。归绥（今呼和浩特）、包头因之兴起，'
                '农耕与牧交界线大幅北推。',
    },
    {
        'id': 'e6', 'no': '06', 'color': '#7bb24a', 'name': '湖广填四川', 'period': '1650–1770', 'group': 'g2',
        'driver': '经济谋生',
        'origin': '湖广（湖北、湖南）', 'dest': '四川（成都、重庆）',
        'teaser': '“湖广熟，天下足”之后，人口倒灌填补四川。',
        'desc': '明末清初，四川迭遭兵燹、张献忠据蜀与清军拉锯，孑遗无几。'
                '清廷招民垦荒，以湖广（今两湖）为主的移民溯江而上填川，'
                '“湖广填四川”成为清代规模最大的国内移民潮之一。',
    },
    {
        'id': 'e7', 'no': '07', 'color': '#3fa67a', 'name': '闯关东', 'period': '1860–1931', 'group': 'g2',
        'driver': '经济谋生',
        'origin': '山东、河北', 'dest': '东北（沈阳、长春、哈尔滨）',
        'teaser': '“闯关东”，华北百姓出山海关开发白山黑水。',
        'desc': '咸丰朝开禁东北弛禁，山东、直隶（今河北）百姓泛海、出关，'
                '赴辽东与松花江、黑龙江流域垦荒谋生。闯关东是近代中国规模最大、持续时间最长的移民潮，'
                '深刻塑造了东北的人口与方言格局。',
    },
    {
        'id': 'e8', 'no': '08', 'color': '#2fa8b0', 'name': '下南洋', 'period': '1860–1950', 'group': 'g3',
        'driver': '海外谋生',
        'origin': '东南沿海（闽、粤、琼）', 'dest': '东南亚（新加坡、曼谷、马尼拉等）',
        'teaser': '“过番”谋生，华人下南洋拓殖东南亚。',
        'desc': '鸦片战争后沿海生计艰难，闽粤琼民众搭乘帆船“过番”，'
                '赴暹罗（今泰国）、马来亚、荷属东印度（今印尼）、菲律宾等地垦殖、务工、经商。'
                '下南洋是中国人第一次成规模地跨海向外移民，今东南亚华人多源于此。',
    },
    {
        'id': 'e9', 'no': '09', 'color': '#4a6fb0', 'name': '河南大逃荒', 'period': '1938–1943', 'group': 'g3',
        'driver': '战乱避难',
        'origin': '河南', 'dest': '西北（西安、兰州）',
        'teaser': '花园口决堤与连年灾荒，豫省百姓向西流亡。',
        'desc': '1938 年花园口决堤黄泛，兼以旱蝗与战祸，河南赤地千里、哀鸿遍野。'
                '灾民扶老携幼沿陇海线西入陕西、甘肃，是为抗战时期最惨烈的一次省内人口流亡。',
    },
    {
        'id': 'e10', 'no': '10', 'color': '#7b5fc0', 'name': '三线建设人口迁徙', 'period': '1964–1980', 'group': 'g3',
        'driver': '工业建设',
        'origin': '沿海、东北', 'dest': '中西部内陆（川、黔、鄂、陕）',
        'teaser': '备战备荒，工厂与人才内迁构筑战略大后方。',
        'desc': '面对紧张国际形势，国家将沿海、东北的工厂、院校、科研与大批职工西迁，'
                '在川黔鄂陕的群山间建起军工与重工业基地（如攀枝花钢铁、十堰二汽、遵义航天）。'
                '这是一场由国家主导、以“靠山、分散、隐蔽”为原则的工业人口大迁徙。',
    },
]

# 分组（对应参考页“空间格局”三大板块）
GROUPS = [
    {'id': 'g1', 'name': '中原南下'},
    {'id': 'g2', 'name': '边疆扩展'},
    {'id': 'g3', 'name': '近现代外流'},
]

# ── 城市坐标（WGS84） ────────────────────────────────────────────────────────
CITIES = {
    '洛阳': (112.45, 34.62),
    '西安': (108.94, 34.34),   # 长安
    '开封': (114.30, 34.80),   # 汴京
    '南京': (118.78, 32.06),   # 建康
    '杭州': (120.15, 30.27),   # 临安
    '扬州': (119.41, 32.39),
    '福州': (119.30, 26.08),
    '洪洞': (111.73, 36.25),
    '北京': (116.40, 39.90),   # 北平
    '济南': (117.00, 36.65),
    '太原': (112.55, 37.87),
    '呼和浩特': (111.75, 40.84),  # 归绥
    '包头': (109.84, 40.66),
    '武汉': (114.30, 30.59),   # 湖广（武昌）
    '长沙': (112.94, 28.23),   # 湖广（湖南）
    '成都': (104.07, 30.67),
    '重庆': (106.55, 29.56),
    '沈阳': (123.43, 41.80),   # 奉天
    '长春': (125.32, 43.82),
    '哈尔滨': (126.53, 45.80),
    '大连': (121.62, 38.91),
    '青岛': (120.38, 36.07),
    '泉州': (118.68, 24.87),
    '广州': (113.26, 23.13),
    '厦门': (118.09, 24.48),
    '海口': (110.20, 20.04),
    '汕头': (116.68, 23.35),
    '新加坡': (103.82, 1.35),
    '曼谷': (100.50, 13.75),
    '马尼拉': (120.98, 14.60),
    '雅加达': (106.85, -6.21),
    '吉隆坡': (101.69, 3.14),
    '郑州': (113.62, 34.75),
    '兰州': (103.83, 36.06),
    '贵阳': (106.71, 26.65),
    '十堰': (110.79, 32.63),
    '遵义': (106.93, 27.73),
    '上海': (121.47, 31.23),
}

# ── 32 条代表路线：event_id, 起点城市, 终点城市 ───────────────────────────────
ROUTES = [
    # e1 衣冠南渡
    ('e1', '洛阳', '南京'), ('e1', '洛阳', '杭州'), ('e1', '西安', '南京'),
    # e2 安史之乱后的南迁
    ('e2', '洛阳', '扬州'), ('e2', '西安', '杭州'), ('e2', '洛阳', '南京'),
    # e3 靖康之难后的南迁
    ('e3', '开封', '杭州'), ('e3', '开封', '南京'), ('e3', '洛阳', '福州'),
    # e4 洪洞大槐树
    ('e4', '洪洞', '北京'), ('e4', '洪洞', '济南'), ('e4', '洪洞', '郑州'),
    # e5 走西口
    ('e5', '太原', '呼和浩特'), ('e5', '太原', '包头'),
    # e6 湖广填四川
    ('e6', '武汉', '成都'), ('e6', '长沙', '成都'), ('e6', '武汉', '重庆'),
    # e7 闯关东
    ('e7', '济南', '沈阳'), ('e7', '济南', '哈尔滨'), ('e7', '北京', '长春'),
    # e8 下南洋
    ('e8', '泉州', '新加坡'), ('e8', '广州', '曼谷'), ('e8', '厦门', '马尼拉'),
    ('e8', '海口', '雅加达'), ('e8', '汕头', '吉隆坡'),
    # e9 河南大逃荒
    ('e9', '郑州', '西安'), ('e9', '郑州', '兰州'),
    # e10 三线建设
    ('e10', '上海', '成都'), ('e10', '上海', '贵阳'), ('e10', '沈阳', '重庆'),
    ('e10', '大连', '十堰'), ('e10', '北京', '遵义'),
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


# ── 几何：起讫连线 + 弧线化 ───────────────────────────────────────────────────
BOW = 0.11   # 弧的最大鼓起量（占弦长比例），模拟大圆弧的弓形


def _curve_segment(a, b, n, phase=None):
    """二次贝塞尔弧：向航向左侧单向鼓起的一道平滑弓形（航线/大圆弧的视觉类比）。

    注意：`phase` 已废弃——旧实现用它做来回摆动的波浪，看起来不像航线；
    保留参数只为兼容调用方，不再参与计算。
    """
    (x0, y0), (x1, y1) = a, b
    dx, dy = x1 - x0, y1 - y0
    seg = math.hypot(dx, dy)
    if seg < 1e-9:
        return []
    # 航向左侧的单位法向量
    ux, uy = -dy / seg, dx / seg
    # 控制点：中点沿法向抬起；二次贝塞尔在 t=0.5 处的偏移 = 抬起量的一半
    mx, my = (x0 + x1) / 2.0, (y0 + y1) / 2.0
    lift = seg * BOW * 2.0
    cx, cy = mx + ux * lift, my + uy * lift
    pts = []
    for i in range(1, n + 1):
        t = i / (n + 1)
        w0, w1, w2 = (1 - t) ** 2, 2 * (1 - t) * t, t ** 2
        pts.append((w0 * x0 + w1 * cx + w2 * x1,
                    w0 * y0 + w1 * cy + w2 * y1))
    return pts


def _haversine(a, b):
    lng1, lat1 = math.radians(a[0]), math.radians(a[1])
    lng2, lat2 = math.radians(b[0]), math.radians(b[1])
    h = (math.sin((lat2 - lat1) / 2) ** 2
         + math.cos(lat1) * math.cos(lat2) * math.sin((lng2 - lng1) / 2) ** 2)
    return 2 * 6371008.8 * math.asin(min(1.0, math.sqrt(h)))


def build_line(from_name, to_name):
    """起讫城市连成一条曲线化折线，返回 (coordinates_wgs, length_km)。"""
    ca = CITIES[from_name]
    cb = CITIES[to_name]
    seg = math.hypot(cb[0] - ca[0], cb[1] - ca[1])
    n = max(8, min(46, int(seg / 0.05) + 4))
    out = [ca]
    out.extend(_curve_segment(ca, cb, n))
    out.append(cb)
    length = sum(_haversine(out[i], out[i + 1]) for i in range(len(out) - 1)) / 1000.0
    return out, length


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    ev_by_id = {e['id']: e for e in EVENTS}

    # 每个事件累计路线，记录最长路线用于放事件名标注
    route_feats, node_event = [], {}
    event_route_count = {e['id']: 0 for e in EVENTS}
    for i, (ev_id, frm, to) in enumerate(ROUTES):
        ev = ev_by_id[ev_id]
        wgs, length_km = build_line(frm, to)
        gcj = [list(wgs84_to_gcj02(x, y)) for x, y in wgs]
        event_route_count[ev_id] += 1

        route_feats.append({
            'type': 'Feature',
            'properties': {
                'id': '%s-r%d' % (ev_id, event_route_count[ev_id]),
                'event': ev_id,
                'event_no': ev['no'],
                'event_name': ev['name'],
                'color': ev['color'],
                'period': ev['period'],
                'driver': ev['driver'],
                'origin': frm,
                'destination': to,
                'teaser': '%s → %s：%s' % (frm, to, ev['teaser']),
                'desc': '%s 至 %s。%s' % (frm, to, ev['desc']),
                'length_km': round(length_km),
                'label_at': 0.5,
            },
            'geometry': {'type': 'LineString',
                         'coordinates': [[round(x, 5), round(y, 5)] for x, y in gcj]},
        })
        for c in (frm, to):
            node_event.setdefault(c, set()).add(ev_id)

    # 节点：角色判定（既是起点又是终点 = hub，仅起点 = origin，仅终点 = dest）
    node_feats = []
    for name in CITIES:
        lng, lat = CITIES[name]
        as_from = any(f == name for _, f, _ in ROUTES)
        as_to = any(t == name for _, _, t in ROUTES)
        role = 'hub' if (as_from and as_to) else ('origin' if as_from else 'dest')
        gx, gy = wgs84_to_gcj02(lng, lat)
        evs = sorted(node_event.get(name, set()), key=lambda e: ev_by_id[e]['no'])
        node_feats.append({
            'type': 'Feature',
            'properties': {
                'id': 'n-%s' % name,
                'name': name,
                'role': role,
                'events': evs,
                'event_names': [ev_by_id[e]['name'] for e in evs],
                'wgs84': [round(lng, 4), round(lat, 4)],
            },
            'geometry': {'type': 'Point', 'coordinates': [round(gx, 5), round(gy, 5)]},
        })

    # 事件元数据（章节列表 + 详情卡用）
    events_out = []
    for e in EVENTS:
        gid = e['group']
        events_out.append({
            'id': e['id'], 'no': e['no'], 'name': e['name'], 'period': e['period'],
            'group': gid, 'group_name': next(g['name'] for g in GROUPS if g['id'] == gid),
            'driver': e['driver'], 'color': e['color'],
            'origin': e['origin'], 'dest': e['dest'],
            'teaser': e['teaser'], 'desc': e['desc'],
            'route_count': event_route_count[e['id']],
        })

    groups_out = [{'id': g['id'], 'name': g['name'],
                   'events': [e['id'] for e in EVENTS if e['group'] == g['id']]} for g in GROUPS]

    routes_fc = {
        '_comment': '中国历史十次人口迁徙 · 32 条代表路线（GCJ-02）。'
                    '非历史路径实测线画，仅供地理人文叙事，见 scripts/build_cn_pop_migration.py。',
        'type': 'FeatureCollection', 'features': route_feats,
    }
    nodes_fc = {
        '_comment': '中国历史十次人口迁徙 · 城市节点（GCJ-02）。properties.wgs84 为原始 WGS84。',
        'type': 'FeatureCollection', 'features': node_feats,
    }
    events_fc = {
        '_comment': '10 次迁徙事件元数据：章节、配色、动因、时段、描述。',
        'type': 'FeatureCollection',
        'features': events_out,
        'groups': groups_out,
    }

    for fn, obj in (('routes.json', routes_fc), ('nodes.json', nodes_fc), ('events.json', events_fc)):
        p = os.path.join(OUT_DIR, fn)
        with open(p, 'w', encoding='utf-8') as f:
            json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))
        print('写明 %s（%.1f KB，%d 条）' % (p, os.path.getsize(p) / 1024, len(obj['features'])))

    for r in route_feats:
        p = r['properties']
        print('  %s %-10s %5d km  %s → %s' % (p['event'], p['event_name'], p['length_km'], p['origin'], p['destination']))


if __name__ == '__main__':
    main()
