# -*- coding: utf-8 -*-
"""12 国（ARE/ARG/CHE/FIN/FRA/ISR/NLD/PRK/SAU/SGP/SWE/TUR）行政区划互动地图 · 数据 + 页面生成器
复用 gen_six_regions.py 的纯 Python SHP/DBF 解析（无第三方依赖）。
从 C:/Users/ZhuanZ/Downloads/gadm41_{CC}_shp 读取 GADM 4.1。
产出每国：
    public/maps/<slug>/data/{provinces,districts}.geojson   (L1 / L2，含几何实算面积)
    public/maps/<slug>/js/config.js                        (window.MAP_CONFIG，含 pop/area/group 三指标)
    public/maps/<slug>/index.html
    content/works/<slug>.md
    content/downloads/gadm41-<iso>-shp.md                  (access: gated + 验证码，R2 直链 + 互链)
    src/data/vizmaps.json 追加 12 条登记
本脚本只生成「机械层」：面积实算、类型由 ENGTYPE 映射；
中文名 / 首府 / 人口 / 看点 由后续 enrich_twelve_regions.py 按 GADM 英文名回填。
注意：R2 直链前缀 R2_BASE 指向 downloads.planetgis.cn/GIS，文件名为 gadm41_<ISO 大写>_shp.zip。
"""
import json, math, os, struct, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BASE = r"C:/Users/ZhuanZ/Downloads"

# ── R2 直链前缀（与其余 GADM 资料一致：downloads.planetgis.cn/GIS/gadm41_<ISO>_shp.zip）──
R2_BASE = "https://downloads.planetgis.cn/GIS"

# 资料下载验证码（公众号门禁）。既有资料已用到 NSH-GIS-042，这里从 043 顺延。
CODES = {
    "are": "NSH-GIS-043", "arg": "NSH-GIS-044", "che": "NSH-GIS-045", "fin": "NSH-GIS-046",
    "fra": "NSH-GIS-047", "isr": "NSH-GIS-048", "nld": "NSH-GIS-049", "prk": "NSH-GIS-050",
    "sau": "NSH-GIS-051", "sgp": "NSH-GIS-052", "swe": "NSH-GIS-053", "tur": "NSH-GIS-054",
}

# 国家元信息（slug / 中文名 / 英文名 / eyebrow / 一级统称 / 二级统称 / 主色 / 配图底色）
# role/sub 仅用于文案；类型着色的中文由 enrich 的 TYPE_MAP 决定
META = {
    "are": dict(slug="are-regions", zh="阿联酋", en="United Arab Emirates", eyebrow="UAE · EMIRATES",
                role="酋长国", sub="市/镇", accent="#0a7d6b", dark="#04201b",
                blurb="阿拉伯半岛东端的联邦制君主国，由 7 个酋长国组成，石油与迪拜的摩天都市是它最响的标签。",
                note="按<b>人口</b>着色：迪拜与阿布扎比两座都会圈聚集了全国绝大多数人口，其余五个酋长地广人稀。",
                read="阿联酋 7 个酋长国按人口着色，几乎是一张「两强独大」的图——迪拜与阿布扎比两座都会圈吸走了绝大多数人口与财富，而拉斯海玛、富查伊拉等北部酋长国依旧安静地守着海湾与山地。切到「类型」看，七个成员清一色是酋长国（Emirate），共同组成这个石油富国。"),
    "arg": dict(slug="arg-regions", zh="阿根廷", en="Argentina", eyebrow="ARGENTINA · PROVINCES",
                role="省 / 自治市", sub="县/市", accent="#3a7d2c", dark="#0f2410",
                blurb="南美洲南部大国，23 个省 + 布宜诺斯艾利斯自治市，潘帕斯草原与巴塔哥尼亚荒原南北跨度极大。",
                note="按<b>人口</b>着色：布宜诺斯艾利斯及周边的潘帕斯诸省人口稠密，南部的巴塔哥尼亚省份则地广人稀。",
                read="阿根廷 24 个一级政区按人口着色，北方潘帕斯与布宜诺斯艾利斯都会圈密集成团，南部的巴塔哥尼亚省份一路向南越来越空。切到「面积」看则正相反——圣克鲁斯、丘布特等南方大省幅员惊人。这张图把「北密南疏」的阿根廷讲得很清楚。"),
    "che": dict(slug="che-regions", zh="瑞士", en="Switzerland", eyebrow="SWITZERLAND · CANTONS",
                role="州 / 半州", sub="市镇", accent="#d42b2b", dark="#240909",
                blurb="阿尔卑斯山中的联邦制国家，26 个州（含 6 个半州），直接民主与高度地方自治是它最独特的政治基因。",
                note="按<b>人口</b>着色：苏黎世、伯尔尼、日内瓦等中部与西部州人口密集，山地州格劳宾登、瓦莱则相对稀疏。",
                read="瑞士 26 个州（含半州）按人口着色，人口压在中部高原与西北角，阿尔卑斯山地州明显偏冷。切到「类型」看，瑞士的州（Kanton）还细分为全州与半州（Halbkanton），后者在联邦院只有半票——这是它「小国精密制衡」的缩影。"),
    "fin": dict(slug="fin-regions", zh="芬兰", en="Finland", eyebrow="FINLAND · REGIONS",
                role="省", sub="次区", accent="#2b6cd4", dark="#081628",
                blurb="北欧波罗的海国家，5 个旧制一级省（1997–2009 区划），湖泊密布、冬季严寒，圣诞老人与极光是它的名片。",
                note="按<b>人口</b>着色：赫尔辛基所在的南芬兰一省独大，北部拉普兰等地广人稀。",
                read="芬兰 5 个旧制一级省按人口着色，几乎是一颗「南重北轻」的心脏——南芬兰聚集了过半人口（含赫尔辛基），越往北越空旷，拉普兰的驯鹿与极光占据大片国土。切到「类型」看，一级省之下还有次区（sub-region）作为二级框架。"),
    "fra": dict(slug="fra-regions", zh="法国", en="France", eyebrow="FRANCE · REGIONS",
                role="大区 / 海外领地", sub="省/市镇", accent="#1b3fa0", dark="#060f24",
                blurb="西欧核心国家，13 个本土大区 + 若干海外领地，中央集权与地方大区并存的行政格局。",
                note="按<b>人口</b>着色：法兰西岛（巴黎）一区独大，里昂、马赛等大城市圈次之，西南与中部乡村大区稀疏。",
                read="法国 13 个本土大区按人口着色，法兰西岛（巴黎）像一颗超新星般突出，周围大区迅速变冷。切到「类型」看，本土大区之外还有海外领地（如科西嘉、海外省），它们同属法国却远在地球另一端。"),
    "isr": dict(slug="isr-regions", zh="以色列", en="Israel", eyebrow="ISRAEL · DISTRICTS",
                role="区", sub="无", accent="#1f8fb0", dark="#06222b",
                blurb="地中海东岸的狭长国家，7 个区，宗教圣城与高科技产业在此交汇。",
                note="按<b>人口</b>着色：特拉维夫与中央区人口稠密，南部内盖夫沙漠区则极为稀疏。",
                read="以色列 7 个区按人口着色，地中海沿岸的特拉维夫—中央区密集如织，南部的内盖夫沙漠一眼空旷。因国土狭小，本图仅有一级区划，没有更细的二级层级。"),
    "nld": dict(slug="nld-regions", zh="荷兰", en="Netherlands", eyebrow="NETHERLANDS · PROVINCES",
                role="省", sub="市镇", accent="#e8511d", dark="#261006",
                blurb="低地国家，12 个省，靠圩田与堤坝向海要地，阿姆斯特丹与鹿特丹是欧洲门户。",
                note="按<b>人口</b>着色：南荷兰、北荷兰与乌得勒支等西部省份人口稠密，东北部的弗里斯兰等则舒缓许多。",
                read="荷兰 12 个省按人口着色，西部兰斯台德（Randstad）城市带密集成团，东北部平缓舒展。切到「面积」看，弗里斯兰、德伦特等北部省份并不算小。这个填海造出的国度，一级省界之下还有数百个市镇。"),
    "prk": dict(slug="prk-regions", zh="朝鲜", en="North Korea", eyebrow="DPRK · PROVINCES",
                role="道 / 特别市", sub="郡/市", accent="#c0392b", dark="#240909",
                blurb="朝鲜半岛北部的封闭国家，9 个道 + 平壤等特别市，行政区以「道」为基本单元。",
                note="按<b>人口</b>着色：平壤与黄海南北道等西部省份人口集中，北部山区与东北部则相对稀疏。",
                read="朝鲜一级政区按人口着色，西海岸的平壤、黄海南北道一带明显偏重，东部与北部山区渐稀。切到「类型」看，平壤等特别市与普通的「道」地位不同——这张图呈现的是半岛北方以道为基本框架的行政骨架。"),
    "sau": dict(slug="sau-regions", zh="沙特阿拉伯", en="Saudi Arabia", eyebrow="SAUDI ARABIA · REGIONS",
                role="省 / 区", sub="次级区划", accent="#1f8a4c", dark="#0a2417",
                blurb="阿拉伯半岛最大的国家，13 个一级省/区，石油王国大半国土被沙漠覆盖。",
                note="按<b>人口</b>着色：利雅得、麦加（含麦加与吉达）等西部与中部省份人口稠密，北部与东部沙漠省份稀疏。",
                read="沙特 13 个一级省/区按人口着色，西部的利雅得、麦加、麦地那一带密集成线，向东向北迅速沉入鲁卜哈利沙漠的空旷。这个石油王国的一级框架之下，还有更细的次级区划。"),
    "sgp": dict(slug="sgp-regions", zh="新加坡", en="Singapore", eyebrow="SINGAPORE · REGIONS",
                role="大区", sub="无", accent="#d4a017", dark="#241a04",
                blurb="马来半岛南端的城市国家，由 5 个大区（Region）直接构成，没有省—县两级结构。",
                note="按<b>面积</b>着色：西部与东北部的规划大区面积较大，中心商务区则小巧紧凑。",
                read="新加坡作为城市国家，没有省—县两级结构，全境由 5 个大区直接拼成。本图按面积着色，西部大区（West）与东北大区辽阔，中心地带小巧紧凑——一张能装进一屏的城市国家行政区划图。"),
    "swe": dict(slug="swe-regions", zh="瑞典", en="Sweden", eyebrow="SWEDEN · COUNTY",
                role="省 / 郡", sub="市镇", accent="#0a6fb0", dark="#062033",
                blurb="斯堪的纳维亚最大国家，21 个省（län），森林、湖泊与北极圈以北的拉普兰构成它的辽阔。",
                note="按<b>人口</b>着色：斯德哥尔摩、西约塔兰（哥德堡）等南部省份人口密集，北部的北博滕省等地广人稀。",
                read="瑞典 21 个省（län）按人口着色，南部斯德哥尔摩—哥德堡一线密集成团，北部的北博滕省一路伸进北极圈却人烟稀少。切到「面积」看，北方省份才是真正的巨无霸。省之下还有近 300 个市镇。"),
    "tur": dict(slug="tur-regions", zh="土耳其", en="Turkey", eyebrow="TÜRKIYE · PROVINCES",
                role="省", sub="区/县", accent="#c0392b", dark="#240909",
                blurb="横跨欧亚的北约国家，81 个省，安纳托利亚高原与伊斯坦布尔的欧亚交汇是它最鲜明的地理特征。",
                note="按<b>人口</b>着色：伊斯坦布尔、安卡拉、伊兹密尔等西部省份人口高度集中，东部与东南部山区省份稀疏。",
                read="土耳其 81 个省按人口着色，西部伊斯坦布尔—伊兹密尔—安卡拉三角地带密集成团，东部与东南部山地渐疏。切到「面积」看整体更均衡。作为横跨欧亚的国家，它的一级省界之下还有近千个区/县。"),
}

# ENGTYPE_1 → 中文分组（覆盖 GADM 常见取值；未命中保留原文）
ENGTYPE_ZH = {
    "state": "州", "province": "省", "territory": "领地", "federal district": "联邦区",
    "region": "大区", "district": "区", "municipality": "直辖市", "autonomous region": "自治区",
    "autonomous okrug": "自治专区", "autonomous oblast": "自治州", "republic": "共和国",
    "kray": "边疆区", "oblast": "州", "city": "市", "federal city": "联邦直辖市",
    "area": "地区", "island": "岛", "county": "县", "department": "省", "prefecture": "府",
    "estado": "州", "distrito federal": "联邦区", "land": "州", "provincia": "省",
    "región": "大区", "territorial authority": "地方当局", "area outside region": "地区",
    "commune": "市镇", "prefecture-level city": "地级市", "special municipality": "直辖市",
    "emirate": "酋长国", "distrito federal": "联邦区", "governorate": "省",
    "kanton": "州", "halbkanton": "半州", "canton": "州", "il": "省",
    "regione": "大区", "län": "省", "do": "道", "special city": "特别市",
    "autonomous region (jts)": "自治区", "gmina": "市镇", "voivodeship": "省",
}

GROUP_PALETTE = ["#e6194b","#3cb44b","#4363d8","#f58231","#911eb4","#46f0f0","#f032e6",
                 "#bcf60c","#fabebe","#008080","#9a6324","#800000","#aaffc3","#808000"]

# ── DBF / SHP 解析（纯 Python，复用 gen_six_regions.py） ────────────────
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

def build_geojson(rings, extent=None, eps=None, rel=0.0006, nd=5, drop=None):
    if drop:
        rings = [r for r in rings if not drop(r)]
    if not rings:
        return None
    # 尺度相关容差：以「国家整体跨度」为准（extent=国家外接框最大边），
    # 容差 = rel × 国家跨度。小国（如新加坡/以色列）跨度小→容差小→海岸线保留；
    # 大国（如瑞典/土耳其）跨度大→容差大→二级区划不会暴涨。
    e = rel * extent if extent else (eps if eps is not None else 0.01)
    simp = [round_ring(dp_simplify(r, e), nd) for r in rings]
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
    sub_sentence = (f'不满足于一级？勾选左下角「{m["sub"]}」，展开 **{L2n} 个{m["sub"]}**看省以下的行政区划。\n\n'
                   f'## 功能特点\n\n'
                   f'- **三个指标切换着色**：人口用 log 尺度分级（越深越多）；面积由几何实算；选「类型」则按行政区类型分类着色。\n'
                   f'- **点即出卡**：选中色块变透明、透出底图，并用一圈色环勾住边界；卡片显示人口 / 面积 / 首府 / 看点。\n'
                   f'- **面积实算**：每个{m["role"]}的面积由几何球面实算（约值），不依赖外部统计。\n'
                   f'- **三种底图**：Esri 卫星影像（默认，压暗）/ 地形晕渲 / 深色无底图。\n'
                   f'- **可展开 {L2n} 个{m["sub"]}**：{m["sub"]}边界作为可叠加图层，勾选后可点任意单元看所属{m["role"]}。\n'
                   f'- **经纬网格与分享链接**：可叠加 5° 经纬网格；选中后地址栏带上定位状态。\n')
    if not hasSub:
        sub_sentence = ('## 功能特点\n\n'
                   f'- **三个指标切换着色**：人口用 log 尺度分级（越深越多）；面积由几何实算；选「类型」则按行政区类型分类着色。\n'
                   f'- **点即出卡**：选中色块变透明、透出底图，并用一圈色环勾住边界；卡片显示人口 / 面积 / 首府 / 看点。\n'
                   f'- **面积实算**：每个{m["role"]}的面积由几何球面实算（约值），不依赖外部统计。\n'
                   f'- **三种底图**：Esri 卫星影像（默认，压暗）/ 地形晕渲 / 深色无底图。\n'
                   f'- **经纬网格与分享链接**：可叠加 5° 经纬网格；选中后地址栏带上定位状态。\n')
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
        <p><b>数据来源</b>：{m['role']}{('、' + m['sub']) if hasSub else ''}边界来自 <b>GADM 4.1</b>（gadm41_{m['slug'].split('-')[0].upper()}_shp，WGS84 / EPSG:4326，公开数据）。面积由几何球面实算（约值），行政区类型取自 GADM 的 ENGTYPE 字段，人口 / 首府 / 中文译名为人工整理（约值）。本图仅作行政边界示意，界线画法不代表任何立场。</p>
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
    sub_para = (f'不满足于一级？勾选左下角「{m["sub"]}」，展开 **{L2n} 个{m["sub"]}**看省以下的行政区划。\n\n' if hasSub else '')
    l2_line = (f'、{L2n} 个{m["sub"]}' if hasSub else '')
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

地图本体是 **GADM 4.1** 的行政边界，默认按 **人口** 分级着色；顶栏可在 **人口 / 面积 / 类型** 之间切换——选「类型」则按行政区类型（州 / 省 / 酋长国 / 道……）分类着色，一眼看清这个国家的结构基因。

{sub_para}
## 功能特点

- **三个指标切换着色**：人口用 log 尺度分级（越深越多）；面积由几何实算；选「类型」则按行政区类型分类着色。
- **点即出卡**：选中色块变透明、透出底图，并用一圈色环勾住边界；卡片显示中文名 / 首府 / 人口 / 面积 / 看点。
- **面积实算**：每个{m['role']}的面积由几何球面实算（约值），不依赖外部统计。
- **三种底图**：Esri 卫星影像（默认，压暗）/ 地形晕渲 / 深色无底图。
{('- **可展开 ' + str(L2n) + ' 个' + m['sub'] + '**：' + m['sub'] + '边界作为可叠加图层，勾选后可点任意单元看所属' + m['role'] + '。') if hasSub else '- **纯一级结构**：' + m['zh'] + '没有省—县两级，全境由一级区划直接拼成，一张图装得下。'}
- **经纬网格与分享链接**：可叠加 5° 经纬网格；选中后地址栏带上定位状态。

## 数据来源与合规

{m['role']}{('、' + m['sub']) if hasSub else ''}边界来自 **GADM 4.1**（数据集 `gadm41_{cc.upper()}_shp`，WGS84 / EPSG:4326，公开数据），坐标系与 Esri 全球影像底图对齐。面积由几何球面实算（约值），行政区类型取自 GADM 的 ENGTYPE 字段；**人口、首府与中文译名为人工整理**（通行译法 + 各国统计局 / 普查近似值），仅供快速对照。本图仅展示行政边界几何，界线画法不代表任何立场。

## 想拿走原始数据？

如果你要做自己的地图或分析，建议直接下载这套矢量数据——**GADM 4.1 全层级 Shapefile（国界 / {L1n} 个{m['role']}{l2_line} / 更细层级），体量与层级都很全**：

👉 **[GADM 4.1 {m['zh']}矢量数据下载](/downloads/gadm41-{cc}-shp)**

边界是 WGS84 经纬度，Shapefile 格式，可直接在 QGIS / ArcGIS 里打开。本站这张互动图的几何，正是从它转换来的。

## 使用教程

1. 打开地图，默认停在 **人口** 着色、卫星影像底图。悬停任意{m['role']}会浮出名称、类型与面积。
2. 顶栏点「人口 / 面积 / 类型」切换统计口径；颜色对应的具体量级在右下角图例里看。
3. **点一个{m['role']}**：右侧弹出卡片，地图缩放到该单位范围并用色环勾边。卡片里直接看中文名、首府、人口、面积与看点。
{('4. 想看省以下行政：勾选左下角「' + m['sub'] + '」，边界浮现后可点任意单元看所属' + m['role'] + '。') if hasSub else ''}
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
   数据：scripts/gen_twelve_regions.py 从 GADM 4.1（gadm41_{cc.upper()}_shp）转换生成
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
      group: '按<b>行政区类型</b>着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。'
    }}
  }}
}};
'''

def make_downloads_md(m, slug, cc, L1n, L2n, area_total, zip_bytes, hasSub):
    size_mb = zip_bytes / 1e6
    size_str = f"{size_mb:.1f} MB（{zip_bytes:,} 字节）"
    l2_count_line = (f"**Level 2（{m['sub']}）**：**{L2n} 个要素**。" if hasSub else "本数据集**仅有一级行政区划**（城市国家/地区无省—县两级结构）。")
    return f'''---
slug: gadm41-{cc}-shp
title: GADM 4.1 {m['zh']}行政区划矢量数据 SHP（国界 / {m['role']}{(' / ' + m['sub']) if hasSub else ''}，WGS84）
summary: GADM 4.1 {m['zh']}行政区划数据集，含国界、{L1n} 个{m['role']}{('、' + str(L2n) + ' 个' + m['sub']) if hasSub else ''}的 Shapefile，WGS84 地理坐标系，可直接用于 QGIS / ArcGIS / Python 空间分析与制图。
date: 2026-10-10
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: GADM, {m['zh']}, 行政区划, SHP, 矢量数据, WGS84, QGIS, 地理数据
access: gated
download: {R2_BASE}/gadm41_{cc.upper()}_shp.zip
downloadType: direct
trigger: GADM{m['zh']}
keywordAliases: {m['zh']}行政区划,{m['zh']}行政区shp,{m['zh']}SHP
code: {CODES[cc]}
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

三级通过 `GID_0 → GID_1 → GID_2` 编码严格逐级嵌套，可任意聚合或下钻，直接支撑分组设色、空间连接与区域统计。

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

## 适用场景

{m['zh']}区域地理教学、各级行政区划的人口 / 经济 / 生态专题制图、空间插值与区域统计、遥感影像行政区裁剪、跨国研究中的统一行政框架对齐等。

## 在线互动地图

本数据集已做成可交互的在线地图，支持分级着色、逐点查询与移动端浏览：

- [{m['zh']}行政区划互动地图](/maps/{slug})
'''

# ── 主流程 ────────────────────────────────────────────────
def process(cc, m):
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
    # 先计算国家整体跨度（用于尺度相关简化容差）
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
        # 跳过水体要素（如荷兰的 IJsselmeer / Zeeuwse meren）；
        # 荷兰的 NAME_1='NA'（3133 km²）实为南荷兰省（Zuid-Holland，鹿特丹/海牙所在），补回。
        if gzh == "Water body":
            continue
        if name == "NA":
            name = "Zuid-Holland" if cc == "nld" else gid
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

    # L1 name 查表（按 GID 前缀归属，供 L2 反查所属一级）
    l1_by_prefix = {}
    for f in fc1["features"]:
        parts = f["properties"]["gid"].split(".")
        if len(parts) >= 2:
            l1_by_prefix[parts[1]] = f["properties"]["name"]

    # L2（纯标准库；文件不存在则空）
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

    # 写 geojson
    p1 = os.path.join(out_dir, "provinces.geojson")
    p2 = os.path.join(out_dir, "districts.geojson")
    json.dump(fc1, open(p1, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    json.dump(fc2, open(p2, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    s1 = os.path.getsize(p1) / 1e6; s2 = os.path.getsize(p2) / 1e6

    # 统计
    L1n = len(fc1["features"]); L2n = len(fc2["features"])
    area_total = sum(f["properties"]["area"] for f in fc1["features"])
    groups = {}
    for f in fc1["features"]:
        groups[f["properties"]["groupZh"]] = groups.get(f["properties"]["groupZh"], 0) + 1
    group_colors = {g: GROUP_PALETTE[i % len(GROUP_PALETTE)] for i, g in enumerate(groups)}

    # 中心 / 边界（跨经线处理）
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

    # 写 config / index / works / downloads
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

    # 封面图（matplotlib，跨经线偏移渲染）
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

    # 打印汇总（供 vizmaps 登记）
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
        entry = {
            "slug": r["slug"],
            "entry": f"/maps/{r['slug']}/index.html",
            "bbox": [round(x, 2) for x in r["bnd"]],
            "crs": "WGS84 / EPSG:4326（与 Esri 全球影像底图对齐，无需坐标偏移；不叠加 GCJ-02 底图）",
            "basemap": "Esri World Imagery 卫星影像（server.arcgisonline.com，默认，按专题压暗）/ Esri World Shaded Relief 地形晕渲 / 深色无底图；高德瓦片只覆盖中国，境外空白故不用",
            "source": f"GADM 4.1（gadm41_{cc}_shp，WGS84 / EPSG:4326，公开数据）：{r['L1n']} 个一级行政区（{r['zh']}）边界 + {r['L2n']} 个二级区划。中文名 / 首府 / 人口为人工整理近似值；面积由几何球面实算。",
            "updated": "2026-10-10",
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
            r = process(cc, m)
            results.append(r)
        except Exception as e:
            print(f"!! {cc} 失败: {e}")
    append_vizmaps(results)
    print("=" * 60)
    print("DONE. 机械层生成完毕（中文名/首府/人口/看点 待 enrich_twelve_regions.py 回填）。")
