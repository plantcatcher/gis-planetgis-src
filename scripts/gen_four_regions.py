# -*- coding: utf-8 -*-
"""第三批 4 国（IDN 印尼 / IND 印度 / PHL 菲律宾 / ZAF 南非）行政区划互动地图 · 数据 + 页面生成器
复用 gen_twelve_regions.py 的纯 Python SHP/DBF 解析（无第三方依赖）。
从 D:/01 资料下载/【临时】/gadm41_{CC}_shp 读取 GADM 4.1。
产出每国：
    public/maps/<slug>/data/{provinces,districts}.geojson   (L1 / L2，含几何实算面积)
    public/maps/<slug>/js/config.js                        (window.MAP_CONFIG，含 pop/area/group 三指标)
    public/maps/<slug>/index.html
    content/works/<slug>.md
    content/downloads/gadm41-<iso>-shp.md                  (access: gated + GADM 通用验证码，百度网盘 + 互链)
    src/data/vizmaps.json 追加 4 条登记
本脚本只生成「机械层」：面积实算、类型由 ENGTYPE 映射；
中文名 / 首府 / 人口 / 看点 由后续 enrich_four_regions.py 按 GADM 英文名回填。
分发方式：百度网盘（pan.baidu.com，downloadType: baidu + panCode），链接见 _tmp 下的 百度网盘链接.txt。
印度（IND）：L1/L2 均经 scripts/km_claims.py 按中方主张界裁剪，页面附领土声明。
"""
import json, math, os, struct, sys
from shapely.geometry import mapping
sys.stdout.reconfigure(encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BASE = r"D:/01 资料下载/【临时】"

# ── 百度网盘分发（第三批 4 国）──
PAN = {
    "idn": ("https://pan.baidu.com/s/15fXHlvzf_6keAiiYubKFLg?pwd=4v9k", "4v9k"),
    "ind": ("https://pan.baidu.com/s/1XvmcafI-vQQpZd_LqzcosQ?pwd=ymxe", "ymxe"),
    "phl": ("https://pan.baidu.com/s/1j0zXGVAds_hXC4dcTJQs0A?pwd=jsu9", "jsu9"),
    "zaf": ("https://pan.baidu.com/s/1ggWz9ggwqWC2Nmr2U_Syog?pwd=573x", "573x"),
}

# 资料下载验证码（公众号门禁）：GADM 通用码 NSH-GADM-999，与第二批 7 国一致
CODE = "NSH-GADM-999"
KEYWORD_ALIASES = "GADM,全球行政区SHP,行政区划SHP,全球行政区划数据,GADM数据"
DATE = "2026-10-14"

# 国家元信息（slug / 中文名 / 英文名 / eyebrow / 一级统称 / 二级统称 / 主色 / 配图底色）
META = {
    "idn": dict(slug="idn-regions", zh="印度尼西亚", en="Indonesia", eyebrow="INDONESIA · PROVINCES",
                role="省", sub="县/市", accent="#c1272d", dark="#2a0a0c",
                blurb="世界上最大的群岛国家，1.7 万余座岛屿横跨赤道，34 个省从苏门答腊一路铺到新几内亚岛西半部，2.8 亿人口居东南亚第一。",
                note="按<b>人口</b>着色：爪哇岛的西爪哇、东爪哇与中爪哇三省深不见底，加里曼丹与巴布亚的省份则地广人稀。",
                read="印尼 34 个省按人口着色，答案几乎写在同一座岛上——爪哇。全国约 2.8 亿人里有一半以上挤在这条东西千余公里的火山岛上，西爪哇一省就有近 5000 万人，比绝大多数国家的人口都多。切到「面积」看，画风完全反转：加里曼丹（婆罗洲）与巴布亚的几个省幅员惊人却人烟稀少，雨林、红树林与泥炭地占据了绝大部分国土。这张图把印尼「岛多、人多、分布极不均」的三重现实讲得很清楚。",
                l1desc="34 个省（含雅加达首都特区、日惹特区）",
                drop=None),
    "ind": dict(slug="ind-regions", zh="印度", en="India", eyebrow="INDIA · STATES & UT",
                role="邦 / 中央直辖区", sub="县", accent="#e8752a", dark="#2a1607",
                blurb="南亚次大陆的主体国家，由若干邦与中央直辖区组成，14 亿人口居世界第一，恒河平原与德干高原构成它的地理骨架。",
                note="按<b>人口</b>着色：北方邦、马哈拉施特拉与比哈尔等恒河—印度河流域邦人口极密，东北部山区与海岛直辖区则明显稀疏。",
                read="印度的一级行政区按人口着色，最深的几块几乎连成一条横带——北方的北方邦、比哈尔与西孟加拉，加上西海岸的马哈拉施特拉，正是恒河平原与印度河—德干边缘的人口核心。切到「类型」看，印度的结构是「邦（State）+ 中央直辖区（Union Territory）」双轨：前者有民选政府，后者由中央直接治理，德里（NCT）、本地治里、安达曼群岛等都属于后者。切到「面积」看，拉贾斯坦与中央邦才是真正的巨无霸。这张图把「人多地广但分布极度不均」的印度说透了。",
                claim="**制图合规说明**：GADM 原始数据按印度方面的划法，把中印边界西段的阿克赛钦、喀喇昆仑走廊与东段的藏南地区一并计入印度行政区。本站遵循中国法律法规与地图编制规范，已在数据转换阶段按中方主张界线做剔除处理：**藏南地区（印方所谓「阿鲁纳恰尔邦」）整体属于中国领土，本图不作呈现、其面积亦不计入统计**；阿克赛钦与喀喇昆仑走廊归入中国，查谟和克什米尔只保留印方实控部分；GADM 用于标记他国主张版本的重复要素（Z 系列）一并去除。地图界线画法以中方主张为准，正式制图请使用自然资源部标准地图服务提供的官方数据。",
                l1desc="邦与中央直辖区",
                drop="ind"),
    "phl": dict(slug="phl-regions", zh="菲律宾", en="Philippines", eyebrow="PHILIPPINES · PROVINCES",
                role="省", sub="市镇", accent="#1b5e9c", dark="#061a2e",
                blurb="由 7000 多个岛屿组成的群岛国家，81 个省分布在吕宋、维萨亚斯与棉兰老三大岛群之间，处在环太平洋火山地震带上。",
                note="按<b>人口</b>着色：首都马尼拉大区周边的布拉干、甲米地、内湖等吕宋岛南部省份人口极密，棉兰老内陆与巴拉望则稀疏得多。",
                read="菲律宾 81 个省按人口着色，最亮的一圈紧紧围绕马尼拉湾展开——大马尼拉与其周边的布拉干、甲米地、内湖、黎刹，几百万人的通勤圈压在吕宋岛西南一隅。往南看，宿务、内格罗斯与伊洛伊洛组成维萨亚斯的第二梯队；棉兰老岛的省份面积大、人口密度低，是另一番景象。切到「面积」看，巴拉望与棉兰老诸省才是真正的巨块。群岛国家的分散与集聚，在这张图上一目了然。",
                l1desc="81 个省（含大马尼拉）",
                claim="**制图合规说明**：黄岩岛（民主礁，15°07′N、117°51′E）是中国固有领土，隶属中国海南省三沙市，不属于菲律宾任何一级行政区。本站遵循中国法律法规与地图编制规范，已在数据转换阶段对源数据做几何核查与兜底剔除：**本图的菲律宾矢量中不含黄岩岛（亦不含其所谓「Bajo de Masinloc / Panatag Shoal」）要素，相关岛礁不作为菲律宾行政区呈现、面积亦不计入统计**。地图界线画法以中方主张为准，正式制图请使用自然资源部标准地图服务提供的官方数据。",
                claim_dl="**黄岩岛（民主礁）说明**：黄岩岛位于 15°07′N、117°51′E，是中国固有领土，隶属中国海南省三沙市，**不属于菲律宾任何一级行政区**。经逐要素几何核查：**GADM 4.1 菲律宾数据集（Level 1 的 81 个省、Level 2 的 1642 个市镇）中不含黄岩岛要素**，数据中名为 Masinloc 的市镇属三描礼士省、位于吕宋岛西岸，与黄岩岛无关。若 GADM 后续版本将黄岩岛并入菲律宾政区，请勿直接采用；涉及南海诸岛与中国疆域的制图，请使用自然资源部标准地图服务提供的官方数据。",
                drop=None),
    "zaf": dict(slug="zaf-regions", zh="南非", en="South Africa", eyebrow="SOUTH AFRICA · PROVINCES",
                role="省", sub="区/市", accent="#1a8a5a", dark="#062018",
                blurb="非洲大陆最南端的国家，9 个省、三座首都（行政比勒陀利亚、立法开普敦、司法布隆方丹），矿业、葡萄酒与非洲最完整的工业体系都在这里。",
                note="按<b>人口</b>着色：豪登省（约翰内斯堡—比勒陀利亚）与夸祖鲁-纳塔尔的德班一带人口最密，北开普的沙漠地带则极度稀疏。",
                read="南非 9 个省按人口着色，豪登省一省独大——它是全国面积最小的一级政区，却装下了约翰内斯堡与比勒陀利亚两座城，是非洲南部的经济心脏。夸祖鲁-纳塔尔（德班）与西开普（开普敦）分列其后。切到「面积」看，画风彻底反转：北开普省占了国土近三分之一，却只有一百多万人口，是真正的空旷之地。这张图把南非「经济聚于一点、国土铺得很开」的格局讲得很直白。",
                l1desc="9 个省",
                drop=None),
}

# ── 印度（IND）专项剔除规则 ────────────────────────────────
# GADM 4.1 对争议区提供多套主张版本：Z01 = 印方主张版（保留），
# Z04 / Z05 / Z07 / Z09 等 = 他国主张版本（去除，否则地图上出现重叠重复要素）。
# 藏南地区（印方所谓「阿鲁纳恰尔邦」，GID 二级序号 3）整体属于中国领土，
# 按中方主张剔除，其下属二级区划同步剔除。
IND_DROP_IDX = {"3"}      # IND.3 = Arunachal Pradesh（藏南）

def ind_drop(feat, lvl):
    gid = feat.get("properties", {}).get("gid") or ""
    parts = gid.split(".")
    head = parts[0]
    if head.startswith("Z") and not head.startswith("Z01"):
        return True                      # 他国主张版本要素
    # GID 形态：一级 IND.3_1 / 二级 IND.3.5_1，取二级序号去掉 _1 后缀
    idx = parts[1].split("_")[0] if len(parts) > 1 else ""
    return idx in IND_DROP_IDX           # 藏南（一级 + 其下二级）

DROP_RULES = {"ind": ind_drop}

# ── 黄岩岛（民主礁）防护 —— 对所有国家生效 ────────────────
# 黄岩岛是中国固有领土（隶属中国海南省三沙市），位于 15°07′N、117°51′E。
# 部分境外行政区划数据集会把黄岩岛（Bajo de Masinloc / Panatag Shoal）
# 并入菲律宾的省 / 市镇。这里在几何层面做兜底剔除：任何完全落在该礁体
# 外接框内的环一律丢弃，确保本批（以及后续批次）产出的菲律宾矢量里
# 不存在黄岩岛要素。框取 117.4–118.2E / 14.7–15.5N，
# 比礁体本身（约 117.75–117.95E、15.00–15.20N）宽出一圈，
# 且远离吕宋岛西岸（最西约 119.8E），不会误伤合法陆地。
HUANGYAN_BOX = (117.4, 14.7, 118.2, 15.5)

def is_huangyan_ring(ring):
    """环的所有顶点都落在黄岩岛框内 → 判定为黄岩岛几何，剔除"""
    if not ring:
        return False
    xs = [p[0] for p in ring]; ys = [p[1] for p in ring]
    return (min(xs) >= HUANGYAN_BOX[0] and max(xs) <= HUANGYAN_BOX[2]
            and min(ys) >= HUANGYAN_BOX[1] and max(ys) <= HUANGYAN_BOX[3])

def drop_huangyan(rings):
    kept = [r for r in rings if not is_huangyan_ring(r)]
    if len(kept) != len(rings):
        print(f"  [黄岩岛] 剔除 {len(rings) - len(kept)} 个环（中国黄岩岛 / 民主礁，不作为他国行政区呈现）")
    return kept

# ENGTYPE_1 → 中文分组（本批 4 国：Province / State / Union Territory）
ENGTYPE_ZH = {
    "province": "省", "state": "邦", "union territory": "中央直辖区",
    "region": "大区", "district": "区", "municipality": "直辖市",
    "autonomous region": "自治区", "city": "市", "county": "县",
    "capital territory": "首都区", "island": "岛", "area": "地区",
}

GROUP_PALETTE = ["#e6194b","#3cb44b","#4363d8","#f58231","#911eb4","#46f0f0","#f032e6",
                 "#bcf60c","#fabebe","#008080","#9a6324","#800000","#aaffc3","#808000"]

# ── DBF / SHP 解析（纯 Python，复用 gen_twelve_regions.py） ────────────────
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
        length = b[16]; dec = b[17]
        fields.append((name, typ, length, dec))
    rows = []
    for r in range(numrec):
        start = hdrlen + r * recsize
        raw = data[start:start + recsize]
        if raw[0:1] == b"\x1a":
            break
        row = {}; pos = 1
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
    recs = []; off = 100; n = len(data)
    while off + 8 <= n:
        content_len = struct.unpack(">i", data[off + 4:off + 8])[0]
        cstart = off + 8; cend = cstart + content_len * 2
        if cend > n:
            break
        recs.append(parse_polygon(data[cstart:cend]))
        off = cend
    return recs

def parse_polygon(buf):
    st = struct.unpack("<i", buf[0:4])[0]
    if st not in (5, 15, 25):
        return []
    p = 4 + 32
    num_parts = struct.unpack("<i", buf[p:p + 4])[0]; p += 4
    num_points = struct.unpack("<i", buf[p:p + 4])[0]; p += 4
    parts = [struct.unpack("<i", buf[p + 4*i:p + 4*i + 4])[0] for i in range(num_parts)]; p += 4*num_parts
    pts = []
    for _ in range(num_points):
        x = struct.unpack("<d", buf[p:p + 8])[0]; p += 8
        y = struct.unpack("<d", buf[p:p + 8])[0]; p += 8
        pts.append([x, y])
    if st == 15:
        p += 16 + num_points * 8; p += 16 + num_points * 8
    elif st == 25:
        p += 16 + num_points * 8
    rings = []
    for i in range(num_parts):
        s = parts[i]; e = parts[i + 1] if i + 1 < num_parts else num_points
        rings.append(pts[s:e])
    return rings

def ring_area(r):
    a = 0.0
    for i in range(len(r)):
        x1, y1 = r[i]; x2, y2 = r[(i+1) % len(r)]
        a += x1 * y2 - x2 * y1
    return a / 2.0

def point_in_ring(pt, ring):
    x, y = pt; inside = False; n = len(ring); j = n - 1
    for i in range(n):
        xi, yi = ring[i]; xj, yj = ring[j]
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

def simplify_ring(ring, eps):
    """闭合环的 Douglas-Peucker 简化。
    直接对闭合环调用 DP 会退化：环首点与末点重合，基线长度为 0，算法只保留
    「离首点最远」的点，海岸线被压成自相交的乱序点串（实测菲律宾邦阿西楠省
    4539 点的环被简化到只剩 70 余点，面积从 5236 km² 掉到 71 km²）。
    正解：先找到环上离首点最远的点作为断点，把环拆成两段开放折线分别简化再拼接。"""
    if len(ring) < 4:
        return ring[:]
    x0, y0 = ring[0]
    far, fd = 1, -1.0
    for i in range(1, len(ring)):
        d = (ring[i][0] - x0) ** 2 + (ring[i][1] - y0) ** 2
        if d > fd:
            fd, far = d, i
    if far < 2 or far > len(ring) - 3:      # 退化（点过少），退回中点
        far = len(ring) // 2
    if far < 2 or far > len(ring) - 3:
        return ring[:]
    seg1 = dp_simplify(ring[:far + 1], eps)
    seg2 = dp_simplify(ring[far:], eps)
    out = seg1[:-1] + seg2
    if out[0] != out[-1]:
        out = out + [out[0]]
    return out

def _round_coords(obj, nd=5):
    if isinstance(obj, (list, tuple)):
        if obj and isinstance(obj[0], (int, float)):
            return [round(float(v), nd) for v in obj]
        return [_round_coords(x, nd) for x in obj]
    return obj

def build_geojson_shapely(rings, extent=None, eps=None, rel=0.0006, nd=5):
    """用 shapely 判定「外环 / 洞」的归属。
    纯 Python 版本用「环中间那个点落在谁里面」来判定父子，遇到海岸线型的闭合环
    会误判——菲律宾邦阿西楠省 4539 点的主环被判成 7 点小岛的洞，面积从 5300 km²
    掉到 71 km²。这里改用 representative_point()（保证落在多边形内部的点）+ contains
    判定，并按面积从大到小依次挖洞。"""
    from shapely.geometry import Polygon as ShpPoly
    from shapely.ops import unary_union
    from shapely.validation import make_valid
    e = rel * extent if extent else (eps if eps is not None else 0.01)
    items = []
    for r in rings:
        s = round_ring(simplify_ring(r, e), nd)
        if len(s) < 4:
            continue
        try:
            p = ShpPoly(s)
            if not p.is_valid:
                p = make_valid(p)
            if p.is_empty:
                continue
            items.append(p)
        except Exception:
            continue
    if not items:
        return None
    items.sort(key=lambda p: p.area, reverse=True)
    geoms = []
    for p in items:
        parts = list(p.geoms) if p.geom_type.startswith("Multi") else [p]
        for q in parts:
            if q.is_empty or not q.geom_type.startswith(("Polygon", "Multi")):
                continue
            placed = False
            for i, g in enumerate(geoms):
                try:
                    if g.contains(q.representative_point()):
                        geoms[i] = g.difference(q)
                        placed = True
                        break
                except Exception:
                    continue
            if not placed:
                geoms.append(q)
    geoms = [g for g in geoms if not g.is_empty]
    if not geoms:
        return None
    merged = geoms[0] if len(geoms) == 1 else unary_union(geoms)
    if merged.is_empty:
        return None
    if not merged.geom_type.startswith(("Polygon", "Multi")):
        keep = [g for g in getattr(merged, "geoms", []) if g.geom_type.startswith(("Polygon", "Multi"))]
        if not keep:
            return None
        merged = keep[0] if len(keep) == 1 else unary_union(keep)
    m = mapping(merged)
    return {"type": m["type"], "coordinates": _round_coords(m["coordinates"], nd)}

def build_geojson(rings, extent=None, eps=None, rel=0.0006, nd=5, drop=None):
    if drop:
        rings = [r for r in rings if not drop(r)]
    rings = drop_huangyan(rings)           # 黄岩岛（中国领土）几何兜底剔除
    if not rings:
        return None
    g = build_geojson_shapely(rings, extent=extent, eps=eps, rel=rel, nd=nd)
    if g is not None:
        return g
    e = rel * extent if extent else (eps if eps is not None else 0.01)
    simp = [round_ring(simplify_ring(r, e), nd) for r in rings]
    simp = [r for r in simp if len(r) >= 4]
    if not simp:
        return None
    parents = [None] * len(simp)
    for i in range(len(simp)):
        ri = simp[i]; test_pt = ri[len(ri) // 2]; best = None
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
        holes_ok = [h[::-1] if ring_area(h) > 0 else h for h in holes]
        polygons.append([ring_e] + holes_ok)
    if len(polygons) == 1:
        return {"type": "Polygon", "coordinates": polygons[0]}
    return {"type": "MultiPolygon", "coordinates": polygons}

def feat_area_km2(geom):
    R = 6371.0088
    def ring_signed(ring):
        a = 0.0; n = len(ring)
        for i in range(n):
            lon1, lat1 = math.radians(ring[i][0]), math.radians(ring[i][1])
            lon2, lat2 = math.radians(ring[(i+1) % n][0]), math.radians(ring[(i+1) % n][1])
            a += (lon2 - lon1) * (2 + math.sin(lat1) + math.sin(lat2))
        return a * R * R / 2.0
    if geom["type"] == "Polygon":
        rings = geom["coordinates"]; a = abs(ring_signed(rings[0]))
        for h in rings[1:]:
            a -= abs(ring_signed(h))
        return max(a, 0.0)
    if geom["type"] == "MultiPolygon":
        return sum(feat_area_km2({"type": "Polygon", "coordinates": poly}) for poly in geom["coordinates"])
    return 0.0

def all_points(geom):
    pts = []
    if geom["type"] == "Polygon":
        for r in geom["coordinates"]:
            pts += r
    elif geom["type"] == "MultiPolygon":
        for poly in geom["coordinates"]:
            for r in poly:
                pts += r
    return pts

def unwrap_lons(lons, ref):
    out = []
    for x in lons:
        while x - ref > 180:
            x -= 360
        while x - ref < -180:
            x += 360
        out.append(x)
    return out

def wrap(x):
    while x > 180:
        x -= 360
    while x < -180:
        x += 360
    return x

def pct(vals, q):
    if not vals:
        return 0
    s = sorted(vals)
    i = max(0, min(len(s) - 1, int(q * (len(s) - 1))))
    return s[i]

# ── 颜色辅助 ────────────────────────────────────────────────
def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
def ramp(accent, n=7):
    A = hex2rgb(accent)
    light = lerp(A, (255, 255, 255), 0.84)
    dark = lerp(A, (8, 12, 24), 0.32)
    return ["#%02x%02x%02x" % lerp(light, dark, i / (n - 1)) for i in range(n)]

# ── HTML / MD 模板 ─────────────────────────────────────────
def make_index_html(m, slug, L1n, L2n, area_total, groups, hasSub):
    accent = m["accent"]; dark = m["dark"]
    sub_row = ""
    if hasSub:
        sub_row = (f'      <label class="row"><input type="checkbox" id="ckMuni" data-toggle-layer="sub-fill,sub-line" /><span>{m["sub"]}</span></label>\n'
                   f'      <label class="row"><input type="checkbox" id="ckLabel" checked /><span>{m["role"]}名称</span></label>')
    else:
        sub_row = (f'      <label class="row"><input type="checkbox" id="ckLabel" checked /><span>{m["role"]}名称</span></label>')
    sub_facts = (f'        <span><small>{m["sub"]}</small><b><span class="v"><em id="fSub">{L2n}</em></span><i>个</i></b></span>\n' if hasSub
                 else '        <span id="fPopWrap" style="display:none"></span>\n')
    # claim 文案自带「**制图合规说明**：」加粗前缀，这里不再重复加前缀
    claim_html = (f'\n      <p class="claim">{m["claim"]}</p>' if m.get("claim") else "")
    note_pop = m["note"]
    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <script src="/shared/ga-bridge.js"></script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{m['zh']}行政区划地图 · {L1n} 个{m['role']}的人口、面积与类型</title>
  <meta name="description" content="点一下{m['zh']}地图，看 {L1n} 个{m['role']}的中文名、首府、人口、面积与行政区类型。可在「人口 / 面积 / 类型」之间切换着色{('，还能展开 ' + str(L2n) + ' 个' + m['sub']) if hasSub else ''}。边界数据来自 GADM 4.1。" />
  <meta name="keywords" content="{m['zh']}地图,{m['zh']}行政区划,{m['en']},人口,面积,类型,GADM,互动地图" />
  <meta name="author" content="PlanetGIS" />
  <link rel="icon" href="data:," />
  <link rel="stylesheet" href="/maps/_shared/maplibre-gl.css" />
  <link rel="stylesheet" href="/maps/_shared/thematic/thematic.css" />
  <link rel="stylesheet" href="/maps/_shared/regions.css" />
  <style>
    :root {{
      --accent: {accent}; --accent-light: {accent}; --accent-dark: {dark};
      --accent-soft: {accent}24;
      --panel-solid: {dark}f0;
    }}
    html, body, #map {{ background: {dark}; }}
  </style>
</head>
<body>

  <div id="map"></div>
  <div id="labels"></div>

  <aside class="intro" id="intro">
    <div class="intro-head">
      <a class="btn-back" href="/maps" target="_top"><i>&#8249;</i> 全部地图</a>
      <button class="btn-overview" id="btnOverview" type="button"><i>&#9673;</i> {m['zh']}总览</button>
    </div>

    <div class="intro-bar" id="introBar" role="button" tabindex="0" aria-expanded="true">
      <i class="ic-eq"></i>
      <b>{m['zh']}行政区划地图</b>
      <span><em id="introBarText">收起</em><i class="caret"></i></span>
    </div>

    <div class="intro-body" id="introBody">
      <small class="eyebrow"><i class="ic-eq"></i> {m['eyebrow']}</small>
      <h1><span>{m['zh']}</span><b>行政区划地图</b></h1>
      <p class="lead">{m['blurb']}点一下地图，看每个{m['role']}的<b>中文名、首府、人口、面积与行政区类型</b>。顶栏可在<b>人口 / 面积 / 类型</b>之间切换着色，颜色越深数值越大。</p>

      <div class="facts">
        <span><small>{m['role']}</small><b><span class="v"><em id="fMain">{L1n}</em></span><i>个</i></b></span>
{sub_facts}        <span><small>总面积</small><b><span class="v"><em id="fArea">—</em></span><i id="fAreaU">万km²</i></b></span>
      </div>

      <section class="block">
        <header><small>着色指标</small><small class="hint-n">切换看不同维度</small></header>
        <div class="chips" id="metricSeg">
          <button type="button" data-metric="pop" class="active">人口</button>
          <button type="button" data-metric="area">面积</button>
          <button type="button" data-metric="group">类型</button>
        </div>
        <p class="note" id="metricNote">{note_pop}</p>
      </section>

      <section class="block src">
        <p><b>数据来源</b>：{m['role']}{('、' + m['sub']) if hasSub else ''}边界来自 <b>GADM 4.1</b>（gadm41_{m['slug'].split('-')[0].upper()}_shp，WGS84 / EPSG:4326，公开数据）。面积由几何球面实算（约值），行政区类型取自 GADM 的 ENGTYPE 字段，人口 / 首府 / 中文译名为人工整理（约值）。本图仅作行政边界示意，界线画法不代表任何立场。</p>{claim_html}
      </section>

      <div class="intro-nav">
        <a href="/works/{slug}" target="_top">作品介绍</a>
        <a href="/downloads/gadm41-{m['slug'].split('-')[0]}-shp" target="_top">下载源数据</a>
        <a href="/maps" target="_top">全部地图</a>
      </div>
    </div>
  </aside>

  <aside class="detail" id="detail" hidden>
    <header>
      <small id="dtRole">—</small>
      <div class="dt-actions">
        <button type="button" id="dtClose" title="关闭">✕</button>
      </div>
    </header>
    <h2 id="dtName">—</h2>
    <p id="dtSub">—</p>
    <div class="dt-metrics">
      <span><small id="dtLb1">人口</small><b><em id="dtV1">—</em><i id="dtU1">人</i></b></span>
      <span><small id="dtLb2">面积</small><b><em id="dtV2">—</em><i id="dtU2">km²</i></b></span>
      <span><small id="dtLb3">首府</small><b><em id="dtV3">—</em><i id="dtU3"></i></b></span>
    </div>
    <section class="dt-desc">
      <small id="dtDescLb">看点</small>
      <p id="dtDesc">—</p>
    </section>
    <footer id="dtFooter">—</footer>
  </aside>

  <div class="dock">
    <div class="legend" id="legend"></div>
  </div>

  <div class="panel" id="panel">
    <div class="panel-head" id="panelHead">
      <span>图层与底图</span>
      <button type="button" id="panelToggle" title="折叠/展开">－</button>
    </div>
    <div class="panel-body" id="panelBody">
{sub_row}
      <label class="row"><input type="checkbox" id="ckGraticule" /><span>经纬网格</span></label>
      <div class="divider"></div>
      <div class="bm-title">底图</div>
      <div class="bm-seg">
        <label class="bm-opt"><input type="radio" name="basemap" value="img" checked /><span>卫星影像</span></label>
        <label class="bm-opt"><input type="radio" name="basemap" value="vec" /><span>地形晕渲</span></label>
        <label class="bm-opt"><input type="radio" name="basemap" value="none" /><span>深色</span></label>
      </div>
      <div class="divider"></div>
      <p class="panel-note" id="panelNote">
        色块按<b>人口</b>分级（越深越多）；选「面积」则按面积、选「类型」按行政区类型分类着色。选中后色块变透明、用色环勾边。{('勾选「' + m['sub'] + '」可看省以下的行政边界。') if hasSub else ''}
      </p>
    </div>
  </div>

  <script src="/maps/_shared/maplibre-gl.js"></script>
  <script src="/maps/_shared/thematic/thematic.js"></script>
  <script src="js/config.js"></script>
  <script src="/maps/_shared/regions-app.js"></script>
</body>
</html>
'''

def make_works_md(m, slug, L1n, L2n, area_total, groups, hasSub):
    cc = slug.split("-")[0]
    area_wan = area_total / 1e4
    sub_para = (f'不满足于一级？勾选左下角「{m["sub"]}」，展开 **{L2n} 个{m["sub"]}**看{m["role"]}以下的行政区划。\n\n' if hasSub else '')
    l2_line = (f'、{L2n} 个{m["sub"]}' if hasSub else '')
    claim_block = (f'\n{m["claim"]}\n' if m.get("claim") else '')
    return f'''---
slug: {slug}
title: {m['zh']}行政区划地图
cover: /maps/{slug}/vizmap-{slug}-cover.jpg
summary: 点一下{m['zh']}地图，看 {L1n} 个{m['role']}的中文名、首府、人口、面积与行政区类型；可在「人口 / 面积 / 类型」之间切换着色{l2_line}。边界数据来自 GADM 4.1。
link: /maps/{slug}
order: 30
category: 互动地图
series: map
topics: 行政区划
scope: 世界
tags: {m['zh']},行政区划,{m['en']},人口,面积,类型,互动地图,地理可视化,GADM
---

## 介绍

{m['blurb']}这张图把{m['zh']}的{m['role']}摊开在同一张地图上：**点一下任意{m['role']}，右侧直接弹出卡片**——中文名、首府、人口、面积（几何实算）与行政区类型，以及一句看点。

地图本体是 **GADM 4.1** 的行政边界，默认按 **人口** 分级着色；顶栏可在 **人口 / 面积 / 类型** 之间切换——选「类型」则按行政区类型（省 / 邦 / 中央直辖区……）分类着色，一眼看清这个国家的结构基因。

{sub_para}
## 功能特点

- **三个指标切换着色**：人口用 log 尺度分级（越深越多）；面积由几何实算；选「类型」则按行政区类型分类着色。
- **点即出卡**：选中色块变透明、透出底图，并用一圈色环勾住边界；卡片显示中文名 / 首府 / 人口 / 面积 / 看点。
- **面积实算**：每个{m['role']}的面积由几何球面实算（约值），不依赖外部统计。
- **三种底图**：Esri 卫星影像（默认，压暗）/ 地形晕渲 / 深色无底图。
{('- **可展开 ' + str(L2n) + ' 个' + m['sub'] + '**：' + m['sub'] + '边界作为可叠加图层，勾选后可点任意单元看所属' + m['role'] + '。') if hasSub else ''}
- **经纬网格与分享链接**：可叠加 5° 经纬网格；选中后地址栏带上定位状态。

## 数据来源与合规

{m['role']}{('、' + m['sub']) if hasSub else ''}边界来自 **GADM 4.1**（数据集 `gadm41_{cc.upper()}_shp`，WGS84 / EPSG:4326，公开数据），坐标系与 Esri 全球影像底图对齐。面积由几何球面实算（约值），行政区类型取自 GADM 的 ENGTYPE 字段；**人口、首府与中文译名为人工整理**（通行译法 + 各国统计局 / 普查近似值），仅供快速对照。本图仅展示行政边界几何，界线画法不代表任何立场。
{claim_block}
## 想拿走原始数据？

如果你要做自己的地图或分析，建议直接下载这套矢量数据——**GADM 4.1 全层级 Shapefile（国界 / {L1n} 个{m['role']}{l2_line} / 更细层级），体量与层级都很全**：

👉 **[GADM 4.1 {m['zh']}矢量数据下载](/downloads/gadm41-{cc}-shp)**

边界是 WGS84 经纬度，Shapefile 格式，可直接在 QGIS / ArcGIS 里打开。本站这张互动图的几何，正是从它转换来的。

## 使用教程

1. 打开地图，默认停在 **人口** 着色、卫星影像底图。悬停任意{m['role']}会浮出名称、类型与面积。
2. 顶栏点「人口 / 面积 / 类型」切换统计口径；颜色对应的具体量级在右下角图例里看。
3. **点一个{m['role']}**：右侧弹出卡片，地图缩放到该单位范围并用色环勾边。卡片里直接看中文名、首府、人口、面积与看点。
{('4. 想看' + m['role'] + '以下行政：勾选左下角「' + m['sub'] + '」，边界浮现后可点任意单元看所属' + m['role'] + '。') if hasSub else ''}
{('5. 只想看数据不想看影像：把底图切成「深色」。') if hasSub else '4. 只想看数据不想看影像：把底图切成「深色」。'}
{('6. 想退出选中：点卡片右上角关闭按钮，或点地图空白处。') if hasSub else '5. 想退出选中：点卡片右上角关闭按钮，或点地图空白处。'}

## 常见问题 FAQ

<details>
<summary>Q: 人口 / 首府的数据准吗？</summary>

人口取自各国统计局 / 最近一次普查的近似值，首府为中文通行译法；面积由几何实算。三者仅供快速对照，正式用途请以各国官方发布为准。GADM 数据本身不含人口，本站的人口 / 首府为逐区人工整理。

</details>

<details>
<summary>Q: 边界数据哪来的，能商用吗？</summary>

{m['role']}{('、' + m['sub']) if hasSub else ''}边界来自 **GADM 4.1**（公开数据，WGS84）。GADM 数据供非商业与研究用途使用，正式或商业用途请遵循其许可并优先采用各国官方发布的标准行政区划。底图瓦片来自 Esri，版权归 Esri 及其数据提供方。

</details>

## 一点解读

{m['read']}
'''

def make_config_js(m, slug, view, bounds, extent, groups, group_colors):
    cc = slug.split("-")[0]
    RAMP = ramp(m["accent"])
    gc = ",\n    ".join(f"'{g}': '{c}'" for g, c in group_colors.items())
    return f'''/* {m['zh']}行政区划互动地图 · 表现层配置
   数据：scripts/gen_four_regions.py 从 GADM 4.1（gadm41_{cc.upper()}_shp）转换生成
        - provinces.geojson  {m['role']}（L1）
        - districts.geojson  {m['sub']}（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {{
  slug: '{slug}',
  defaultMetric: 'pop',
  view: {{ center: [{view[0]}, {view[1]}], zoom: {view[2]}, minZoom: {view[3]}, maxZoom: 11 }},
  bounds: [{bounds[0]}, {bounds[1]}, {bounds[2]}, {bounds[3]}],
  boundsMobile: [{bounds[0]}, {bounds[1]}, {bounds[2]}, {bounds[3]}],
  extent: [{extent[0]}, {extent[1]}, {extent[2]}, {extent[3]}],
  graticuleStep: 5,

  basemaps: {{
    img: {{ tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{{z}}/{{y}}/{{x}}' }},
    vec: {{ tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{{z}}/{{y}}/{{x}}' }}
  }},
  imgAttr: 'Esri World Imagery',
  vecAttr: 'Esri World Shaded Relief',

  imgPaint: {{
    'raster-brightness-max': 0.58,
    'raster-brightness-min': 0.06,
    'raster-saturation': -0.40,
    'raster-contrast': 0.08
  }},

  /* 顺序色阶（由 {m['zh']}主色生成） */
  RAMP: {json.dumps(RAMP)},

  /* 行政区类型配色 */
  GROUP_COLORS: {{
    {gc}
  }},

  METRICS: {{
    pop:    {{ key: 'pop', label: '人口', unit: '人', hint: '{m['zh']}各{m['role']}人口（最近普查 / 官方估计，约值）' }},
    area:   {{ key: 'area', label: '面积', unit: 'km²', hint: '面积由 GADM 几何球面实算（约值）' }},
    group:  {{ key: 'groupZh', label: '类型', unit: '类型', hint: '行政区类型（GADM ENGTYPE 映射）' }}
  }},

  DATA: {{
    main: 'data/provinces.geojson',
    sub: 'data/districts.geojson'
  }},

  TEXT: {{
    groupSuffix: '类型',
    capitalLabel: '首府',
    mainLabel: '{m['role']}',
    subRole: '{m['sub']}',
    subDesc: '{m['sub']}是{m['role']}之下的基本行政单位。',
    notes: {{
      pop: '{m['note']}',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：省 / 邦 / 中央直辖区等一目了然。'
    }}
  }}
}};
'''

def make_downloads_md(m, slug, cc, L1n, L2n, area_total, zip_bytes, hasSub):
    size_mb = zip_bytes / 1e6
    size_str = f"{size_mb:.1f} MB（{zip_bytes:,} 字节）"
    pan_url, pan_code = PAN[cc]
    l2_count_line = (f"**Level 2（{m['sub']}）**：**{L2n} 个要素**。字段含 `NAME_2`、`TYPE_2 / ENGTYPE_2`、`HASC_2` 以及所属一级的 `NAME_1`。" if hasSub
                     else "本数据集**仅有一级行政区划**（无省—县两级结构）。")
    l3_line = "- **Level 3（更细层级）**：压缩包内另含更细一级的 Shapefile，适合需要下钻到基层的用途。\n" if hasSub else ""
    # 下载页分发的是 GADM 原始 zip，声明措辞与「已裁剪的地图页」不同，用 claim_dl 覆盖
    dl_claim = m.get("claim_dl") or m.get("claim") or ""
    claim_block = (f"\n- {dl_claim}\n" if dl_claim else "")
    return f'''---
slug: gadm41-{cc}-shp
title: GADM 4.1 {m['zh']}行政区划矢量数据 SHP（国界 / {m['role']}{(' / ' + m['sub']) if hasSub else ''}，WGS84）
summary: GADM 4.1 {m['zh']}行政区划数据集，含国界、{L1n} 个{m['role']}{('、' + str(L2n) + ' 个' + m['sub']) if hasSub else ''}的 Shapefile，WGS84 地理坐标系，可直接用于 QGIS / ArcGIS / Python 空间分析与制图。
date: {DATE}
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: GADM, {m['zh']}, 行政区划, SHP, 矢量数据, WGS84, QGIS, 地理数据
access: gated
download: {pan_url}
downloadType: baidu
panCode: {pan_code}
trigger: GADM
keywordAliases: {KEYWORD_ALIASES}
code: {CODE}
format: SHP（ZIP 压缩包）
size: {size_str}
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-09-geo-data-cover.jpg
---

> 本数据集为 GADM（Global Administrative Areas，全球行政区划数据库）v4.1 的**{m['zh']}**部分，以 Shapefile 格式提供行政区划边界，压缩包约 **{size_str}**。GADM 是国际学术界广泛引用的全球行政区划数据项目，覆盖全球 400+ 国家和地区的高精度行政边界。

## 数据内容

包内按行政层级分为 Shapefile（每级均含 `.shp / .shx / .dbf / .prj / .cpg`，齐全）：

- **Level 0（国界）**：1 个要素，{m['zh']}全国边界，字段为 `GID_0`（国家代码 {cc.upper()}）与 `COUNTRY`（国家名）。
- **Level 1（{m['role']}）**：**{L1n} 个要素**。字段含 `NAME_1`、`TYPE_1 / ENGTYPE_1`、`ISO_1`（ISO 3166-2 代码）、`HASC_1` 等。
- {l2_count_line}
{l3_line}
各级通过 `GID_0 → GID_1 → GID_2` 编码严格逐级嵌套，可任意聚合或下钻，直接支撑分组设色、空间连接与区域统计。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326，WGS84 经纬度）**，`.prj` 文件随包附带，无需自行定义投影。
- 文本编码：`.cpg` 指定 **UTF-8**，属性表英文存储，QGIS / ArcGIS / Python 打开无乱码。
- 几何类型：各级数据均为 POLYGON（MultiPolygon）。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接「添加矢量图层」加载 `.shp`，按 `TYPE_1` 区分一级类型，按 `TYPE_2` 对二级分级设色；与人口 / 经济表通过 `NAME_2` 或 `ISO_1` 做表连接即可出专题图。
2. **Python 空间分析**：`geopandas.read_file("gadm41_{cc.upper()}_1.shp")` 读取，配合 `geopandas.sjoin` 把站点 / 网格数据挂到行政区，或用 `dissolve(by="NAME_1")` 聚合到一级。
3. **WebGIS**：经 `ogr2ogr` 转 GeoJSON / MBTiles 后接入 MapLibre / Leaflet，做可点选的行政区划查询。

## 使用须知

- GADM 数据采用其自有许可：**免费用于学术研究与其他非商业用途**；嵌入商业产品或对外再分发请查阅 GADM 官网许可条款并自行确认。
- 本数据由国外项目整理，**界线画法不代表任何立场**；涉及中国疆域的正式制图请使用自然资源部标准地图服务提供的官方数据。数据亦未标注任何审图号，公开使用请遵守《地图管理条例》。
- WGS84 与国内正式出图常用的 CGCS2000 存在厘米级差异，正式成果建议先行转换核对。
{claim_block}
## 适用场景

{m['zh']}区域地理教学、各级行政区划的人口 / 经济 / 生态专题制图、空间插值与区域统计、遥感影像行政区裁剪、跨国研究中的统一行政框架对齐等。

## 在线互动地图

本数据集已做成可交互的在线地图，支持分级着色、逐点查询与移动端浏览：

- [{m['zh']}行政区划互动地图](/maps/{slug})
'''

# ── 主流程 ────────────────────────────────────────────────
def process(cc, m, clip_claims=True):
    slug = m["slug"]
    d = os.path.join(BASE, f"gadm41_{cc.upper()}_shp")
    if not os.path.exists(d):
        print(f"!! {slug}: 源目录不存在 {d}")
        return None
    out_dir = os.path.join(ROOT, "public", "maps", slug, "data")
    os.makedirs(out_dir, exist_ok=True)

    # L1
    dbf1 = read_dbf(os.path.join(d, f"gadm41_{cc.upper()}_1.dbf"))
    recs1 = read_shp(os.path.join(d, f"gadm41_{cc.upper()}_1.shp"))
    ext_xs = []; ext_ys = []
    for rings in recs1:
        for r in rings:
            for x, y in r:
                ext_xs.append(x); ext_ys.append(y)
    country_extent = max((max(ext_xs) - min(ext_xs)), (max(ext_ys) - min(ext_ys))) if ext_xs else 0.0
    fc1 = {"type": "FeatureCollection", "features": []}
    for row, rings in zip(dbf1, recs1):
        gid = row.get("GID_1")
        if not gid or gid == "NA":
            continue
        geom = build_geojson(rings, extent=country_extent, nd=5)
        if not geom:
            continue
        eng = (row.get("ENGTYPE_1") or "").strip()
        gzh = ENGTYPE_ZH.get(eng.lower(), eng if eng else "其他")
        name = row.get("NAME_1") or row.get("VARNAME_1") or gid
        if gzh == "Water body":
            continue
        if name == "NA":
            name = gid
        nl = row.get("NL_NAME_1")
        if not nl or nl == "NA" or nl == name:
            nl = name
        fc1["features"].append({"type": "Feature", "properties": {
            "gid": gid, "name": name, "nameEn": name, "nameLocal": nl,
            "type": eng, "typeEn": eng, "groupZh": gzh,
            "area": round(feat_area_km2(geom), 1),
            "iso": row.get("ISO_1") or "", "engtype": eng,
            "capital": "", "pop": None, "blurb": ""
        }, "geometry": geom})

    l1_by_prefix = {}
    for f in fc1["features"]:
        parts = f["properties"]["gid"].split(".")
        if len(parts) >= 2:
            l1_by_prefix[parts[1]] = f["properties"]["name"]

    # L2
    hasSub = True
    fc2 = {"type": "FeatureCollection", "features": []}
    dbf2_path = os.path.join(d, f"gadm41_{cc.upper()}_2.dbf")
    if os.path.exists(dbf2_path):
        dbf2 = read_dbf(dbf2_path)
        recs2 = read_shp(os.path.join(d, f"gadm41_{cc.upper()}_2.shp"))
        for row, rings in zip(dbf2, recs2):
            gid = row.get("GID_2")
            if not gid or gid == "NA":
                continue
            geom = build_geojson(rings, extent=country_extent, nd=5)
            if not geom:
                continue
            prefix = gid.split(".")[1] if "." in gid else ""
            prov = l1_by_prefix.get(prefix, "—")
            fc2["features"].append({"type": "Feature", "properties": {
                "gid": gid, "name2": row.get("NAME_2") or "—",
                "engtype2": str(row.get("ENGTYPE_2") or ""),
                "type2": str(row.get("TYPE_2") or ""),
                "provZh": prov}, "geometry": geom})
    else:
        hasSub = False

    # 写 geojson（先做中方主张领土合规裁剪）
    p1 = os.path.join(out_dir, "provinces.geojson")
    p2 = os.path.join(out_dir, "districts.geojson")
    if clip_claims:
        try:
            from km_claims import clip_feature_collection
            n1 = clip_feature_collection(fc1, verbose=False, tag=f"{cc.upper()} L1")
            n2 = clip_feature_collection(fc2, verbose=False, tag=f"{cc.upper()} L2")
            if n1 or n2:
                for f in fc1["features"] + fc2["features"]:
                    try:
                        f["properties"]["area"] = feat_area_km2(f["geometry"])
                    except Exception:
                        pass
                print(f"  [km-claims] {cc.upper()}: L1 裁剪 {n1} / L2 裁剪 {n2} 个要素（中方主张领土合规）")
        except ImportError:
            print("  [warn] 未找到 km_claims（需 shapely），跳过中方主张领土裁剪")
    # 专项剔除（印度：他国主张版本要素 + 藏南地区）
    drop = DROP_RULES.get(cc)
    if drop:
        n1 = len(fc1["features"]); n2 = len(fc2["features"])
        fc1["features"] = [f for f in fc1["features"] if not drop(f, 1)]
        fc2["features"] = [f for f in fc2["features"] if not drop(f, 2)]
        print(f"  [drop] {cc.upper()}: L1 剔除 {n1 - len(fc1['features'])} ({n1}->{len(fc1['features'])})"
              f" / L2 剔除 {n2 - len(fc2['features'])} ({n2}->{len(fc2['features'])})")
    json.dump(fc1, open(p1, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    json.dump(fc2, open(p2, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    s1 = os.path.getsize(p1) / 1e6; s2 = os.path.getsize(p2) / 1e6

    L1n = len(fc1["features"]); L2n = len(fc2["features"])
    area_total = sum(f["properties"]["area"] for f in fc1["features"])
    groups = {}
    for f in fc1["features"]:
        groups[f["properties"]["groupZh"]] = groups.get(f["properties"]["groupZh"], 0) + 1
    group_colors = {g: GROUP_PALETTE[i % len(GROUP_PALETTE)] for i, g in enumerate(groups)}

    allpts = []
    for f in fc1["features"]:
        allpts += all_points(f["geometry"])
    lats = [p[1] for p in allpts]
    median_lon = pct([p[0] for p in allpts], 0.5)
    unw = unwrap_lons([p[0] for p in allpts], median_lon)
    cx = wrap(sum(unw) / len(unw))
    cy = sum(lats) / len(lats)
    lo_lon = pct(unw, 0.01); hi_lon = pct(unw, 0.99)
    lo_lat = pct(lats, 0.01); hi_lat = pct(lats, 0.99)
    bnd = [wrap(lo_lon), lo_lat, wrap(hi_lon), hi_lat]
    extent = bnd[:]
    view = [cx, cy, 4.2, 2.5]

    map_dir = os.path.join(ROOT, "public", "maps", slug)
    js_dir = os.path.join(map_dir, "js"); os.makedirs(js_dir, exist_ok=True)
    os.makedirs(os.path.join(ROOT, "content", "works"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "content", "downloads"), exist_ok=True)
    open(os.path.join(js_dir, "config.js"), "w", encoding="utf-8").write(
        make_config_js(m, slug, view, bnd, extent, groups, group_colors))
    open(os.path.join(map_dir, "index.html"), "w", encoding="utf-8").write(
        make_index_html(m, slug, L1n, L2n, area_total, groups, hasSub))
    open(os.path.join(ROOT, "content", "works", f"{slug}.md"), "w", encoding="utf-8").write(
        make_works_md(m, slug, L1n, L2n, area_total, groups, hasSub))
    zip_path = os.path.join(BASE, f"gadm41_{cc.upper()}_shp.zip")
    zip_bytes = os.path.getsize(zip_path) if os.path.exists(zip_path) else 0
    open(os.path.join(ROOT, "content", "downloads", f"gadm41-{cc}-shp.md"), "w", encoding="utf-8").write(
        make_downloads_md(m, slug, cc, L1n, L2n, area_total, zip_bytes, hasSub))

    # 封面图（matplotlib）
    cover_ok = False
    try:
        if os.environ.get("NO_COVER"):
            raise RuntimeError("cover disabled")
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        from matplotlib.patches import Polygon as MplPoly
        fig, ax = plt.subplots(figsize=(16, 10), dpi=90)
        fig.patch.set_facecolor(m["dark"]); ax.set_facecolor(m["dark"])
        def draw_lon(lon):
            return wrap(lon + (360 if lon - median_lon < -180 else 0))
        draw = []
        for f in fc1["features"]:
            g = f["geometry"]
            polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
            for poly in polys:
                ext = [(draw_lon(lon), lat) for lon, lat in poly[0]]
                draw.append(ext)
        for ext in draw:
            ax.add_patch(MplPoly(ext, closed=True, facecolor=m["accent"], edgecolor="#ffffff",
                                 linewidth=0.6, alpha=0.85))
        ax.set_xlim(bnd[0] - 2, bnd[2] + 2); ax.set_ylim(bnd[1] - 2, bnd[3] + 2)
        ax.set_xticks([]); ax.set_yticks([])
        for sp in ax.spines.values():
            sp.set_visible(False)
        fig.savefig(os.path.join(map_dir, f"vizmap-{slug}-cover.jpg"), dpi=90, bbox_inches="tight", facecolor=m["dark"])
        plt.close(fig)
        cover_ok = True
    except Exception as e:
        print("  [warn] cover 渲染失败:", e)

    grp_str = "; ".join(f"{g}×{n}" for g, n in groups.items())
    print(f"### {slug} | {m['zh']} ({cc.upper()})")
    print(f"  L1={L1n}  L2={L2n}  面积≈{area_total/1e4:.1f}万km²")
    print(f"  provinces.geojson={s1:.2f}MB  districts.geojson={s2:.2f}MB  cover={'OK' if cover_ok else 'SKIP'}")
    print(f"  分组: {grp_str}")
    print(f"  view=[[{cx:.3f},{cy:.3f}],{view[2]},{view[3]}]  bounds=[{bnd[0]:.2f},{bnd[1]:.2f},{bnd[2]:.2f},{bnd[3]:.2f}]")
    print(f"  GROUP_COLORS={json.dumps(group_colors, ensure_ascii=False)}")
    print()
    return dict(slug=slug, zh=m["zh"], cc=cc, L1n=L1n, L2n=L2n, area=area_total,
                s1=s1, s2=s2, groups=groups, view=view, bnd=bnd, group_colors=group_colors,
                hasSub=hasSub)

def append_vizmaps(results):
    vp = os.path.join(ROOT, "src", "data", "vizmaps.json")
    data = json.load(open(vp, encoding="utf-8"))
    existing = {m["slug"] for m in data["maps"]}
    added = 0
    for r in results:
        if not r or r["slug"] in existing:
            continue
        cc = r["cc"].upper()
        src_extra = ""
        if cc == "IND":
            src_extra = "；已按中方主张界线剔除：阿克赛钦、喀喇昆仑走廊归入中国，藏南地区（印方所谓「阿鲁纳恰尔邦」）整体不作为印度行政区呈现，另去除 GADM 标记他国主张版本的 Z 系列重复要素"
        entry = {
            "slug": r["slug"],
            "entry": f"/maps/{r['slug']}/index.html",
            "bbox": [round(x, 2) for x in r["bnd"]],
            "crs": "WGS84 / EPSG:4326（与 Esri 全球影像底图对齐，无需坐标偏移；不叠加 GCJ-02 底图）",
            "basemap": "Esri World Imagery 卫星影像（server.arcgisonline.com，默认，按专题压暗）/ Esri World Shaded Relief 地形晕渲 / 深色无底图；高德瓦片只覆盖中国，境外空白故不用",
            "source": f"GADM 4.1（gadm41_{cc}_shp，WGS84 / EPSG:4326，公开数据）：{r['L1n']} 个一级行政区（{r['zh']}）边界 + {r['L2n']} 个二级区划。中文名 / 首府 / 人口为人工整理近似值；面积由几何球面实算。{src_extra}",
            "updated": DATE,
            "data": [
                {"file": f"maps/{r['slug']}/data/provinces.geojson", "features": r["L1n"], "unit": "个一级行政区",
                 "desc": f"{r['L1n']} 个一级行政区边界；属性含中文名 / 英文名 / 首府 / 人口 / 几何实算面积 / 行政区类型"},
                {"file": f"maps/{r['slug']}/data/districts.geojson", "features": r["L2n"], "unit": "个二级区划",
                 "desc": f"{r['L2n']} 个二级区划边界，可作为叠加图层查看最基层行政区划；属性含所属一级中文名"}
            ]
        }
        data["maps"].append(entry)
        added += 1
    json.dump(data, open(vp, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"vizmaps.json 追加 {added} 条（总计 {len(data['maps'])}）")

if __name__ == "__main__":
    print("=" * 60)
    results = []
    for cc, m in META.items():
        try:
            r = process(cc, m, clip_claims=True)
            results.append(r)
        except Exception as e:
            import traceback; traceback.print_exc()
            print(f"!! {cc} 失败: {e}")
    append_vizmaps(results)
    print("=" * 60)
    print("DONE. 机械层生成完毕（中文名/首府/人口/看点 待 enrich_four_regions.py 回填）。")
