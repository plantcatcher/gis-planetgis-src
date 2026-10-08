# -*- coding: utf-8 -*-
"""
GADM 4.1 JPN → GeoJSON 转换器（纯 Python，无第三方依赖）
- 解析 shp（Polygon / PolygonZ / PolygonM）+ dbf
- 道格拉斯-普克简化（按经纬度度数容差）
- 坐标取整到 4 位小数（≈11 m）
- 环方向规范化：外环 CCW、洞 CW（GeoJSON RFC7946 右手定则）
- 输出 public/maps/jp-regions/data/{prefectures,municipalities}.geojson
- 主层 = 47 都道府県（Level1）；叠加层 = 1811 市町村（Level2）
- 嵌入各县：汉字名 / 罗马字 / 类型(都道府県) / 所属 8 地方 / 县厅所在地 /
  2020 人口普查人口 / 面积(km²) / 昵称 / 看点
- 剔除钓鱼岛及其附属岛屿矢量（详见 DIAOYU_BOX）：钓鱼岛及其附属岛屿自古以来
  就是中国的固有领土，GADM 日方口径将其并入冲绳县石垣市，本站不予采用。

人口取日本总务省 2020 年国势调查（10月1日）；面积取维基精确值 km²。

用法：python scripts/convert_gadm_jpn.py
"""
import json
import math
import os
import struct

BASE = "D:/01 ArcGIS制图计划/09 数据集/03 矢量数据/04 全球矢量数据/02 GDM数据/gadm41_JPN_shp"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public/maps/jp-regions/data")

# ── 8 地方（region）归属：键为 GADM 的 NAME_1 罗马字 ──
REGION = {
    # 北海道地方
    "hokkaido": ("北海道", "Hokkaido"),
    # 東北地方
    "aomori": ("東北", "Tohoku"), "iwate": ("東北", "Tohoku"), "miyagi": ("東北", "Tohoku"),
    "akita": ("東北", "Tohoku"), "yamagata": ("東北", "Tohoku"), "fukushima": ("東北", "Tohoku"),
    # 関東地方
    "ibaraki": ("関東", "Kanto"), "tochigi": ("関東", "Kanto"), "gunma": ("関東", "Kanto"),
    "saitama": ("関東", "Kanto"), "chiba": ("関東", "Kanto"), "tokyo": ("関東", "Kanto"),
    "kanagawa": ("関東", "Kanto"),
    # 中部地方
    "niigata": ("中部", "Chubu"), "toyama": ("中部", "Chubu"), "ishikawa": ("中部", "Chubu"),
    "fukui": ("中部", "Chubu"), "yamanashi": ("中部", "Chubu"), "nagano": ("中部", "Chubu"),
    "gifu": ("中部", "Chubu"), "shizuoka": ("中部", "Chubu"), "aichi": ("中部", "Chubu"),
    # 近畿地方
    "mie": ("近畿", "Kansai"), "shiga": ("近畿", "Kansai"), "kyoto": ("近畿", "Kansai"),
    "osaka": ("近畿", "Kansai"), "hyōgo": ("近畿", "Kansai"), "nara": ("近畿", "Kansai"),
    "wakayama": ("近畿", "Kansai"),
    # 中国地方
    "tottori": ("中国", "Chugoku"), "shimane": ("中国", "Chugoku"), "okayama": ("中国", "Chugoku"),
    "hiroshima": ("中国", "Chugoku"), "yamaguchi": ("中国", "Chugoku"),
    # 四国地方
    "tokushima": ("四国", "Shikoku"), "kagawa": ("四国", "Shikoku"), "ehime": ("四国", "Shikoku"),
    "kochi": ("四国", "Shikoku"),
    # 九州地方（含沖縄）
    "fukuoka": ("九州", "Kyushu"), "saga": ("九州", "Kyushu"), "naoasaki": ("九州", "Kyushu"),
    "nagasaki": ("九州", "Kyushu"), "kumamoto": ("九州", "Kyushu"), "oita": ("九州", "Kyushu"),
    "miyazaki": ("九州", "Kyushu"), "kagoshima": ("九州", "Kyushu"), "okinawa": ("九州", "Kyushu"),
}

# ── 各都道府県事实：键为 GADM 的 NAME_1 罗马字（naoasaki=长崎的 GADM 怪拼）──
# pop = 2020 国势调查；area = km²；capitalZh = 县厅所在地（汉字）
FACTS = {
    "tokyo":      dict(pop=14047594, area=2194.03,  capitalZh="新宿区", nick="日本首都圈核心",
                       blurb="日本政治、经济、文化中枢，47 个一级行政区里人口最多（超 1400 万），辖 23 区＋多摩＋岛屿部，是唯一称作「都」的行政区。"),
    "kanagawa":   dict(pop=9237337,  area=2415.86,  capitalZh="横浜市", nick="横滨港与镰仓古都",
                       blurb="紧邻东京，横滨是日本最大港之一，镰仓为镰仓幕府古都，湘南海岸与富士山同框是经典画面。"),
    "osaka":      dict(pop=8837685,  area=1899.28,  capitalZh="大阪市", nick="关西经济中枢",
                       blurb="西日本商业与美食重镇，大阪市为关西最大都会，「天下厨房」之名由来已久，是与东京并称的「府」。"),
    "aichi":      dict(pop=7542415,  area=5165.12,  capitalZh="名古屋市", nick="丰田汽车大本营",
                       blurb="名古屋为核心，丰田总部与汽车产业聚集地，中部经济引擎；中部国际机场连通海外。"),
    "saitama":    dict(pop=7344765,  area=3798.08,  capitalZh="埼玉市", nick="东京卧城",
                       blurb="紧邻东京的居住卫星县，川越保存江户风情，许多上班族通勤东京。"),
    "chiba":      dict(pop=6284480,  area=5156.61,  capitalZh="千葉市", nick="成田空港与房总",
                       blurb="成田国际机场所在地，东京湾沿岸为京叶工业带，房总半岛以海岸与农业闻名。"),
    "hyōgo":      dict(pop=5465002,  area=8396.16,  capitalZh="神戸市", nick="神户港与姬路城",
                       blurb="神户为重要国际贸易港，姬路城是现存天守阁代表作；濑户内海与日本海两侧气候迥异。"),
    "hokkaido":   dict(pop=5224614,  area=83424.44, capitalZh="札幌市", nick="最北最大的道",
                       blurb="面积约占全国两成、人口稀少，以农业、乳业、滑雪与札幌冰雪节闻名，是如今唯一称「道」的行政区。"),
    "fukuoka":    dict(pop=5135214,  area=4978.51,  capitalZh="福岡市", nick="九州门户",
                       blurb="博多为核心，九州最大都市与对外窗口，拉面与祭典文化兴盛，是西日本最具活力的增长极。"),
    "shizuoka":   dict(pop=3633202,  area=7780.50,  capitalZh="静岡市", nick="富士山与茶乡",
                       blurb="富士山南麓，静冈茶园与骏河湾水产闻名；日本最长的东名高速与富士山景交织。"),
    "ibaraki":    dict(pop=2867009,  area=6095.72,  capitalZh="水戸市", nick="筑波科学城",
                       blurb="筑波为国家级科研城，笠间、水户是历史与温泉地，临太平洋的农渔大县。"),
    "hiroshima":  dict(pop=2799702,  area=8479.70,  capitalZh="広島市", nick="和平与濑户内",
                       blurb="广岛市是和平纪念城市，濑户内海沿线工业与造船发达，宫岛严岛神社为世界遗产。"),
    "kyoto":      dict(pop=2578087,  area=4613.21,  capitalZh="京都市", nick="千年古都",
                       blurb="794–1868 的日本首都，寺庙神社与町家文化密集，是与大阪并称的「府」。"),
    "miyagi":     dict(pop=2301996,  area=7285.77,  capitalZh="仙台市", nick="东北门户仙台",
                       blurb="仙台为东北最大都市，松岛是日本三景之一，伊达政宗的城下町。"),
    "niigata":    dict(pop=2201272,  area=12583.83, capitalZh="新潟市", nick="雪国与米乡",
                       blurb="日本海侧豪雪地带，越光米与清酒名产地，佐渡岛为朱鹮栖息地。"),
    "nagano":     dict(pop=2048011,  area=13562.23, capitalZh="長野市", nick="山岳与高原",
                       blurb="内陆山国，长野冬奥会举办地，轻井泽与上高地是避暑胜地，海拔高、滑雪资源丰。"),
    "gifu":       dict(pop=1978742,  area=10621.17, capitalZh="岐阜市", nick="飞驒高山与白川乡",
                       blurb="白川乡合掌造村落为世界遗产，飞驒高山保留江户町并，关原之战古战场。"),
    "gunma":      dict(pop=1939110,  area=6362.33,  capitalZh="前橋市", nick="温泉王国",
                       blurb="草津、伊香保等温泉众多，富冈制丝场为世界遗产，内陆工业县。"),
    "tochigi":    dict(pop=1933146,  area=6408.28,  capitalZh="宇都宮市", nick="日光与那须",
                       blurb="日光东照宫为世界遗产，那须高原为避暑地，宇都宫饺子有名。"),
    "okayama":    dict(pop=1888432,  area=7113.23,  capitalZh="岡山市", nick="晴天之国",
                       blurb="濑户内海侧少雨，仓敷美观地区与后乐园名园，濑户大桥连接四国。"),
    "fukushima":  dict(pop=1833152,  area=13782.76, capitalZh="福島市", nick="会津与双叶",
                       blurb="会津若松为历史城下町，2011 东日本大震灾与福岛核事故影响深远，农产丰富。"),
    "mie":        dict(pop=1770254,  area=5777.31,  capitalZh="津市",   nick="伊势神宫与志摩",
                       blurb="伊势神宫为皇室神道中心，志摩海岸与珍珠养殖，铃鹿赛道为名。"),
    "kumamoto":   dict(pop=1738301,  area=7404.79,  capitalZh="熊本市", nick="阿苏火山与城",
                       blurb="熊本城为名城，阿苏火山为世界级破火山口，2016 熊本地震后重建。"),
    "kagoshima":  dict(pop=1588256,  area=9188.82,  capitalZh="鹿児島市", nick="樱岛火山与南国",
                       blurb="樱岛活火山近在咫尺，奄美诸岛为亚热带世界遗产，萨摩文化独特。"),
    "okinawa":    dict(pop=1467480,  area=2276.49,  capitalZh="那覇市", nick="最南的群岛",
                       blurb="日本最南端、唯一亚热带气候，琉球王国故地，美军基地密集；人口增速居全国前列。"),
    "shiga":      dict(pop=1413610,  area=4017.36,  capitalZh="大津市", nick="琵琶湖",
                       blurb="日本最大湖泊琵琶湖所在地，近江八景与彦根城，关西水源。"),
    "yamaguchi":  dict(pop=1342059,  area=6114.09,  capitalZh="山口市", nick="本州西端",
                       blurb="下关为关门海峡要冲，萩为幕末维新志士辈出地，防府与山口为古都。"),
    "ehime":      dict(pop=1334841,  area=5678.33,  capitalZh="松山市", nick="道后温泉与柑橘",
                       blurb="道后温泉为日本最古温泉之一，柑橘产量居前，濑户内海气候温和。"),
    "nara":       dict(pop=1324473,  area=3691.09,  capitalZh="奈良市", nick="日本古都",
                       blurb="710–784 的日本首都，东大寺大佛与奈良公园鹿群，世界遗产密集。"),
    "naoasaki":   dict(pop=1312317,  area=4105.47,  capitalZh="長崎市", nick="出岛与长崎",
                       blurb="江户锁国时代唯一对外贸易窗口，原爆都市之一，军舰岛（端岛）为世界遗产。"),
    "aomori":     dict(pop=1237984,  area=9644.55,  capitalZh="青森市", nick="苹果与睡魔",
                       blurb="日本最大苹果产地，青森睡魔祭著名，下北半岛与白神山地世界遗产。"),
    "iwate":      dict(pop=1210534,  area=15278.89, capitalZh="盛岡市", nick="东北面积最大",
                       blurb="内陆山地广阔，平泉为世界遗产（中尊寺），釜石与三陆海岸。"),
    "ishikawa":   dict(pop=1132526,  area=4185.67,  capitalZh="金沢市", nick="金泽加贺百万石",
                       blurb="金泽为加贺藩城下町，兼六园为名园，轮岛漆器与茶屋街。"),
    "oita":       dict(pop=1123852,  area=6339.74,  capitalZh="大分市", nick="别府温泉",
                       blurb="别府以温泉涌出量闻名，由布院为疗养地，国东半岛与杵筑。"),
    "miyazaki":   dict(pop=1069576,  area=7735.99,  capitalZh="宮崎市", nick="日向与亚热带",
                       blurb="日向海岸与日南海岸，亚热带气候与农牧业，青岛与鹈户神宫。"),
    "yamagata":   dict(pop=1068027,  area=9323.46,  capitalZh="山形市", nick="出羽与藏王",
                       blurb="藏王温泉与山形藏王树冰，出羽三山为修验道圣地，樱桃有名。"),
    "toyama":     dict(pop=1034814,  area=4247.61,  capitalZh="富山市", nick="立山黑部与富山湾",
                       blurb="立山黑部阿尔卑斯路线，富山湾萤火鱿与寒𫚕，富山砺波郁金香。"),
    "akita":      dict(pop=959502,   area=11636.28, capitalZh="秋田市", nick="米与竿灯",
                       blurb="秋田米（小町）与比内鸡有名，秋田竿灯祭，男鹿生剥鬼，人口减少最快。"),
    "kagawa":     dict(pop=950244,   area=1876.55,  capitalZh="高松市", nick="赞岐乌冬",
                       blurb="日本面积最小县，赞岐乌冬名扬全国，小豆岛与濑户内艺术节。"),
    "wakayama":   dict(pop=922584,   area=4726.29,  capitalZh="和歌山市", nick="纪伊山地与梅",
                       blurb="高野山与熊野古道为世界遗产，梅干与柑橘产地，白滨温泉。"),
    "yamanashi":  dict(pop=809974,   area=4465.37,  capitalZh="甲府市", nick="富士山北麓",
                       blurb="富士山北麓与河口湖，甲州葡萄酒与宝石加工，日本最高峰所在地。"),
    "saga":       dict(pop=811442,   area=2439.65,  capitalZh="佐賀市", nick="有田烧与玄海",
                       blurb="有田、伊万里瓷器名扬世界，玄海沿岸与祐德稻荷，佐贺城迹。"),
    "fukui":      dict(pop=766863,   area=4189.88,  capitalZh="福井市", nick="若狭湾与恐龙",
                       blurb="若狭湾为「御食国」，胜山恐龙化石多发，东寻坊与永平寺曹洞宗大本山。"),
    "tokushima":  dict(pop=719559,   area=4146.74,  capitalZh="徳島市", nick="阿波舞",
                       blurb="德岛阿波舞为全国知名祭典，鸣门漩涡与自然景观，阿波蓝染。"),
    "kochi":      dict(pop=691527,   area=7105.16,  capitalZh="高知市", nick="土佐与坂本龙马",
                       blurb="土佐藩故地，坂本龙马出身，四万十川为名清流，鲣鱼与夜来祭。"),
    "shimane":    dict(pop=671126,   area=6707.96,  capitalZh="松江市", nick="出云与石见",
                       blurb="出云大社为结缘神社，石见银山为世界遗产，宍道湖与松江城。"),
    "tottori":    dict(pop=553407,   area=3507.28,  capitalZh="鳥取市", nick="沙丘与梨",
                       blurb="鸟取沙丘为日本最大沙丘，二十世纪梨名产，人口最少的县。"),
}


def read_dbf(path):
    with open(path, "rb") as f:
        data = f.read()
    numrec = struct.unpack("<I", data[4:8])[0]
    hdrlen = struct.unpack("<H", data[8:10])[0]
    recsize = struct.unpack("<H", data[10:12])[0]
    nfields = (hdrlen - 33) // 32
    fields = []
    for i in range(nfields):
        b = data[32 + i * 32:32 + (i + 1) * 32]
        name = b[0:11].decode("ascii", "replace").rstrip("\x00").strip()
        typ = b[11:12].decode("ascii")
        length = b[16]
        dec = b[17]
        fields.append((name, typ, length, dec))
    rows = []
    for r in range(numrec):
        start = hdrlen + r * recsize
        raw = data[start:start + recsize]
        if raw[0:1] == b"\x1a":
            break
        row = {}
        pos = 1
        for nm, typ, length, dec in fields:
            s = raw[pos:pos + length].decode("utf-8", "replace").rstrip()
            if typ == "N" or typ == "F":
                s = s.strip()
                row[nm] = float(s) if ("." in s or dec) and s not in ("", "-") else (int(s) if s not in ("", "-") else None)
            else:
                row[nm] = s
            pos += length
        rows.append(row)
    return rows


def read_shp(path):
    with open(path, "rb") as f:
        data = f.read()
    shape_type = struct.unpack("<i", data[32:36])[0]
    recs = []
    off = 100
    n = len(data)
    while off + 8 <= n:
        content_len = struct.unpack(">i", data[off + 4:off + 8])[0]
        cstart = off + 8
        cend = cstart + content_len * 2
        if cend > n:
            break
        buf = data[cstart:cend]
        recs.append(parse_polygon(buf))
        off = cend
    return shape_type, recs


def parse_polygon(buf):
    st = struct.unpack("<i", buf[0:4])[0]
    if st not in (5, 15, 25):
        return []
    p = 4 + 32
    num_parts = struct.unpack("<i", buf[p:p + 4])[0]; p += 4
    num_points = struct.unpack("<i", buf[p:p + 4])[0]; p += 4
    parts = []
    for _ in range(num_parts):
        parts.append(struct.unpack("<i", buf[p:p + 4])[0]); p += 4
    pts = []
    for _ in range(num_points):
        x = struct.unpack("<d", buf[p:p + 8])[0]; p += 8
        y = struct.unpack("<d", buf[p:p + 8])[0]; p += 8
        pts.append([x, y])
    if st == 15:
        p += 16 + num_points * 8
        p += 16 + num_points * 8
    elif st == 25:
        p += 16 + num_points * 8
    rings = []
    for i in range(num_parts):
        s = parts[i]
        e = parts[i + 1] if i + 1 < num_parts else num_points
        rings.append(pts[s:e])
    return rings


def ring_area(ring):
    a = 0.0
    m = len(ring)
    for i in range(m):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % m]
        a += x1 * y2 - x2 * y1
    return a / 2.0


def point_in_ring(pt, ring):
    x, y = pt
    inside = False
    n = len(ring)
    j = n - 1
    for i in range(n):
        xi, yi = ring[i]
        xj, yj = ring[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi + 1e-15) + xi):
            inside = not inside
        j = i
    return inside


def dp_simplify(pts, eps):
    if len(pts) < 3:
        return pts[:]
    def pdist(a, b, c):
        x1, y1 = a; x2, y2 = b; x0, y0 = c
        dx = x2 - x1; dy = y2 - y1
        if dx == 0 and dy == 0:
            return math.hypot(x0 - x1, y0 - y1)
        t = ((x0 - x1) * dx + (y0 - y1) * dy) / (dx * dx + dy * dy)
        t = max(0, min(1, t))
        px = x1 + t * dx; py = y1 + t * dy
        return math.hypot(x0 - px, y0 - py)
    dmax, idx = 0.0, 0
    for i in range(1, len(pts) - 1):
        d = pdist(pts[0], pts[-1], pts[i])
        if d > dmax:
            dmax, idx = d, i
    if dmax > eps:
        left = dp_simplify(pts[:idx + 1], eps)
        right = dp_simplify(pts[idx:], eps)
        return left[:-1] + right
    return [pts[0], pts[-1]]


def round_ring(ring, nd=4):
    return [[round(x, nd), round(y, nd)] for x, y in ring]


# ── 钓鱼岛及其附属岛屿剔除框（WGS84 经纬度）──
# 钓鱼岛及其附属岛屿自古以来就是中国的固有领土，中国对其拥有无可争辩的主权。
# GADM 4.1 的日方数据把钓鱼岛及其附属岛屿并入「沖縄県 石垣市」，
# 该画法不代表中国政府立场，本站一律不予采用 —— 转换时按外接矩形整环剔除。
DIAOYU_BOX = (123.2, 25.6, 124.7, 26.1)   # (xmin, ymin, xmax, ymax)


def is_diaoyu(ring):
    """环的外接矩形落在钓鱼岛及其附属岛屿范围内 → True（剔除）"""
    if not ring:
        return False
    xs = [p[0] for p in ring]
    ys = [p[1] for p in ring]
    x0, y0, x1, y1 = DIAOYU_BOX
    return min(xs) >= x0 and max(xs) <= x1 and min(ys) >= y0 and max(ys) <= y1


def build_geojson(rings, eps):
    rings = [r for r in rings if not is_diaoyu(r)]   # 剔除钓鱼岛及其附属岛屿
    if not rings:
        return None
    simp = [round_ring(dp_simplify(r, eps)) for r in rings]
    simp = [r for r in simp if len(r) >= 4]
    if not simp:
        return None
    parents = [None] * len(simp)
    for i in range(len(simp)):
        ri = simp[i]
        test_pt = ri[len(ri) // 2]
        best = None
        for j in range(len(simp)):
            if i == j:
                continue
            if point_in_ring(test_pt, simp[j]):
                if best is None or abs(ring_area(simp[j])) < abs(ring_area(simp[best])):
                    best = j
        parents[i] = best
    exteriors = [i for i in range(len(simp)) if parents[i] is None]
    polygons = []
    for e in exteriors:
        ring_e = simp[e]
        if ring_area(ring_e) < 0:
            ring_e = ring_e[::-1]
        holes = [simp[k] for k in range(len(simp)) if parents[k] == e]
        holes_ok = []
        for h in holes:
            if ring_area(h) > 0:
                h = h[::-1]
            holes_ok.append(h)
        polygons.append([ring_e] + holes_ok)
    if len(polygons) == 1:
        return {"type": "Polygon", "coordinates": polygons[0]}
    return {"type": "MultiPolygon", "coordinates": polygons}


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    # ── Level 1：47 都道府県 ──
    dbf1 = read_dbf(os.path.join(BASE, "gadm41_JPN_1.dbf"))
    _, recs1 = read_shp(os.path.join(BASE, "gadm41_JPN_1.shp"))
    assert len(dbf1) == len(recs1), (len(dbf1), len(recs1))
    fc1 = {"type": "FeatureCollection", "features": []}
    kanji_of = {}  # romaji(lower) -> 汉字名，给 Level2 复用
    for d, rings in zip(dbf1, recs1):
        romaji = (d.get("NAME_1") or "").strip()
        key = romaji.lower()
        geom = build_geojson(rings, eps=0.008)
        if not geom:
            continue
        nl = (d.get("NL_NAME_1") or "").strip()
        f = FACTS.get(key, {})
        reg = REGION.get(key, ("—", "—"))
        # 类型：To→都 Do→道 Fu→府 Ken→県
        t = (d.get("TYPE_1") or "").strip()
        type_zh = {"To": "都", "Do": "道", "Fu": "府", "Ken": "県"}.get(t, "県")
        props = {
            "gid": d.get("GID_1"),
            "name": nl or romaji,                 # 汉字名
            "romaji": romaji,                     # 罗马字
            "type": type_zh,                      # 都/道/府/県
            "typeEn": d.get("ENGTYPE_1"),
            "regionZh": reg[0],                   # 所属 8 地方（汉字）
            "regionEn": reg[1],                   # 所属 8 地方（英文）
            "capitalZh": f.get("capitalZh"),
            "pop": f.get("pop"),
            "area": f.get("area"),
            "nick": f.get("nick"),
            "blurb": f.get("blurb"),
        }
        kanji_of[key] = props["name"]
        fc1["features"].append({"type": "Feature", "properties": props, "geometry": geom})
    with open(os.path.join(OUT_DIR, "prefectures.geojson"), "w", encoding="utf-8") as fp:
        json.dump(fc1, fp, ensure_ascii=False, separators=(",", ":"))
    print("prefectures.geojson features=%d size=%.2f MB" % (
        len(fc1["features"]), os.path.getsize(os.path.join(OUT_DIR, "prefectures.geojson")) / 1e6))

    # ── Level 2：1811 市町村 ──
    dbf2 = read_dbf(os.path.join(BASE, "gadm41_JPN_2.dbf"))
    _, recs2 = read_shp(os.path.join(BASE, "gadm41_JPN_2.shp"))
    assert len(dbf2) == len(recs2), (len(dbf2), len(recs2))
    fc2 = {"type": "FeatureCollection", "features": []}
    skip2 = 0
    for d, rings in zip(dbf2, recs2):
        geom = build_geojson(rings, eps=0.004)
        if not geom:
            skip2 += 1
            continue
        pref_key = (d.get("NAME_1") or "").strip().lower()
        name2 = (d.get("NAME_2") or "").strip()
        if not name2 or name2 == "NA":
            name2 = "—"
        props = {
            "gid": d.get("GID_2"),
            "prefZh": kanji_of.get(pref_key, (d.get("NAME_1") or "—").strip()),  # 所属都道府县（汉字）
            "prefRomaji": d.get("NAME_1"),
            "name2": name2,                       # 市町村名
            "engtype2": d.get("ENGTYPE_2"),
            "type2": d.get("TYPE_2"),
        }
        fc2["features"].append({"type": "Feature", "properties": props, "geometry": geom})
    with open(os.path.join(OUT_DIR, "municipalities.geojson"), "w", encoding="utf-8") as fp:
        json.dump(fc2, fp, ensure_ascii=False, separators=(",", ":"))
    print("municipalities.geojson features=%d (skipped=%d) size=%.2f MB" % (
        len(fc2["features"]), skip2, os.path.getsize(os.path.join(OUT_DIR, "municipalities.geojson")) / 1e6))


if __name__ == "__main__":
    main()
