# -*- coding: utf-8 -*-
"""
6 国行政区划互动地图 · 数据 + 页面生成器
- 复用现有纯 Python SHP/DBF 解析（无第三方依赖）
- 从 D:/01 资料下载/【临时】/gadm41_{CC}_shp 读取 GADM 4.1
- 产出每国：
    public/maps/<slug>/data/{provinces,districts}.geojson   (L1 / L2)
    public/maps/<slug>/js/config.js                        (window.MAP_CONFIG)
    public/maps/<slug>/index.html
    public/maps/<slug>/vizmap-<slug>-cover.jpg   +  public/shots/<slug>/vizmap-<slug>-hp1.jpg
    content/works/<slug>.md
- 字段只来自 GADM 数据本身：gid / name(NAME_1) / type(ENGTYPE_1) / iso(ISO_1)
  + 几何球面实算面积(area, km²) + ENGTYPE_1 自动映射中文分组(groupZh)
  不填人口/省会/中文译名（GADM 不含，逐区调研约 209 条，本次不做）
- 跨 180° 经线国家(USA/RUS/NZL)：仅用于「计算中心与 fit 边界」时绕中位数展开经度，
  GeoJSON 仍存标准 WGS84，与 Esri 底图对齐。
"""
import json, math, os, struct

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "D:/01 资料下载/【临时】"

# 国家元信息（slug / 中文名 / 英文名 / 一级统称 / 二级统称 / 主色 / 配图底色 / 一句话 / 指标说明 / 解读）
META = {
    "bra": dict(slug="bra-regions", zh="巴西", en="Brazil", eyebrow="BRAZIL · STATES",
                role="州 / 联邦区", sub="市镇", accent="#1f9d55", dark="#0c1f15",
                blurb="南美洲面积最大的国家，26 个州 + 1 个联邦区，亚马孙雨林覆盖北半部。",
                note="按<b>面积</b>着色：亚马孙流域的帕拉、亚马逊、马托格罗索等州幅员惊人，里约热内卢、圣保罗等东南州则小得只剩沿海一溜。",
                read="巴西把 27 个一级政区按面积着一次色，会看见一条「北边是绿海、东南是碎钻」的格局——北半部亚马孙诸州占去国土一大半，而人口与工业全挤在东南沿海的圣保罗、里约一带。切到「类型」看，只有巴西利亚所在的联邦区是特殊地位，其余清一色是州。"),
    "can": dict(slug="can-regions", zh="加拿大", en="Canada", eyebrow="CANADA · PROVINCES",
                role="省 / 领地", sub="普查分区", accent="#2563c9", dark="#0a1426",
                blurb="世界面积第二大国，10 个省 + 3 个领地，北方广袤而地广人稀。",
                note="按<b>面积</b>着色：努纳武特、魁北克、西北领地三个北方单位占了国土近七成，而人口密集的安大略、魁北克南部只是东南一角。",
                read="加拿大 13 个一级政区按面积着色，几乎是一张「北方压倒南方」的图——努纳武特、魁北克、西北领地三个北方单位吃掉了国土近七成，而真正的经济与人口重心（多伦多、蒙特利尔、温哥华）全挤在美加边境那条细线上。领地（育空、西北、努纳武特）与省在自治权上有差别，切到「类型」即可区分。"),
    "deu": dict(slug="deu-regions", zh="德国", en="Germany", eyebrow="GERMANY · STATES",
                role="州", sub="行政区", accent="#c8841a", dark="#1f1405",
                blurb="联邦制国家，16 个州（含 3 个城市州），是欧洲人口与经济核心。",
                note="按<b>面积</b>着色：巴伐利亚、下萨克森等南部大州面积居前，柏林、汉堡、不莱梅三个城市州小到几乎只是一个点。",
                read="德国 16 个州按面积着色，反差极大：巴伐利亚、下萨克森等南部大州辽阔，而柏林、汉堡、不莱梅三个城市州小到在图上几乎只是一个点。切到「类型」看，这三个城市州（Stadtstaat）与另外 13 个面积州（Flächenland）地位不同——这正是德国「城市州 + 面积州」二元结构的直观呈现。"),
    "nzl": dict(slug="nzl-regions", zh="新西兰", en="New Zealand", eyebrow="NEW ZEALAND · REGIONS",
                role="大区 / 群岛", sub="地方当局", accent="#0f9e8e", dark="#04201d",
                blurb="南太平洋岛国，16 个大区 + 群岛领地，南岛与北岛地貌迥异。",
                note="按<b>面积</b>着色：南岛的南方区、坎特伯雷等大区辽阔多山，北岛北地等则相对小巧。",
                read="新西兰 19 个一级单位按面积着色，南岛明显「重」于北岛——坎特伯雷、南方区等大区山峦叠嶂、幅员辽阔，北岛则更破碎小巧。切到「类型」可区分本土大区与查塔姆群岛等离岸领地，看清这个长白云之乡的南北分野。"),
    "rus": dict(slug="rus-regions", zh="俄罗斯", en="Russia", eyebrow="RUSSIA · FEDERAL SUBJECTS",
                role="联邦主体", sub="区 / 市", accent="#2b5fa8", dark="#071426",
                blurb="世界面积最大国家，83 个联邦主体（州 / 边疆区 / 共和国 / 自治专区等）。",
                note="按<b>面积</b>着色：萨哈（雅库特）、克拉斯诺亚尔斯克等西伯利亚单位大得惊人，莫斯科、圣彼得堡等欧洲部分则只是弹丸之地。",
                read="俄罗斯 83 个联邦主体按面积着色，是一张极端的「东重西轻」图——萨哈（雅库特）、克拉斯诺亚尔斯克等西伯利亚单位大得超越许多国家，而莫斯科、圣彼得堡所在的欧洲部分只是弹丸之地。切到「类型」看，共和国、边疆区、州、自治专区等林林总总的联邦主体类型，正是俄罗斯「以多样自治单位维系庞大疆域」的制度写照。"),
    "usa": dict(slug="usa-regions", zh="美国", en="United States", eyebrow="UNITED STATES · STATES",
                role="州 / 联邦区 / 领地", sub="县", accent="#c0392b", dark="#1f0805",
                blurb="北美大国，50 个州 + 哥伦比亚特区（华盛顿），海外领地另计。",
                note="按<b>面积</b>着色：阿拉斯加、得克萨斯、加利福尼亚等西部大州辽阔，东北新英格兰诸州与特区则小巧密集。",
                read="美国 51 个本土地级单位按面积着色，西部明显「大」于东部——阿拉斯加一国之巨、得州与加州辽阔，而东北新英格兰的小州和弹丸般的哥伦比亚特区挤作一团。切到「类型」看，只有华盛顿所在的哥伦比亚特区是联邦直辖，其余全是州（本图按 GADM 口径未含波多黎各等海外领地）。"),
}

# ENGTYPE_1 → 中文分组（覆盖常见 GADM 取值，未命中则保留原文）
ENGTYPE_ZH = {
    "state": "州", "province": "省", "territory": "领地", "federal district": "联邦区",
    "region": "大区", "district": "区", "municipality": "直辖市", "autonomous region": "自治区",
    "autonomous okrug": "自治专区", "autonomous oblast": "自治州", "republic": "共和国",
    "kray": "边疆区", "oblast": "州", "city": "市", "federal city": "联邦直辖市",
    "area": "地区", "island": "岛", "county": "县", "department": "省", "prefecture": "府",
    "estado": "州", "distrito federal": "联邦区", "land": "州", "provincia": "省",
    "región": "大区", "territorial authority": "地方当局", "area outside region": "地区",
    "commune": "市镇", "prefecture-level city": "地级市", "special municipality": "直辖市",
}
GROUP_PALETTE = ["#e6194b","#3cb44b","#4363d8","#f58231","#911eb4","#46f0f0","#f032e6",
                 "#bcf60c","#fabebe","#008080","#9a6324","#800000","#aaffc3","#808000"]

# ── DBF / SHP 解析（纯 Python，复用 convert_gadm_gbr.py） ────────────────
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
    shape_type = struct.unpack("<i", data[32:36])[0]
    recs = []; off = 100; n = len(data)
    while off + 8 <= n:
        content_len = struct.unpack(">i", data[off + 4:off + 8])[0]
        cstart = off + 8; cend = cstart + content_len * 2
        if cend > n:
            break
        recs.append(parse_polygon(data[cstart:cend]))
        off = cend
    return shape_type, recs

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
        x1, y1 = r[i]; x2, y2 = r[(i + 1) % len(r)]
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

def build_geojson(rings, eps):
    if not rings:
        return None
    simp = [round_ring(dp_simplify(r, eps)) for r in rings]
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

# ── 几何工具 ────────────────────────────────────────────────
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

def main_ring_bbox(geom):
    pts = all_points(geom)
    if not pts:
        return None
    b = [min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts)]
    return b

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

def round_coords(obj, nd=4):
    if isinstance(obj, (list, tuple)):
        if len(obj) == 2 and isinstance(obj[0], (int, float)) and isinstance(obj[1], (int, float)):
            return [round(obj[0], nd), round(obj[1], nd)]
        return [round_coords(x, nd) for x in obj]
    return obj

def shapely_to_geojson(geom, nd=4):
    from shapely.geometry import mapping
    m = mapping(geom)
    m["coordinates"] = round_coords(m["coordinates"], nd)
    return m

def process_l2(cc, d, l1_by_prefix, eps=0.02):
    """L2 用 geopandas 读大文件（C 内核），shapely simplify 后转 GeoJSON。"""
    import geopandas as gpd
    path = os.path.join(d, f"gadm41_{cc.upper()}_2.shp")
    g = gpd.read_file(path)
    g["geometry"] = g.geometry.simplify(eps, preserve_topology=True)
    fc = {"type": "FeatureCollection", "features": []}
    for _, r in g.iterrows():
        gid = str(r.get("GID_2"))
        if not gid or gid == "NA":
            continue
        geom = shapely_to_geojson(r.geometry)
        nm2 = str(r.get("NAME_2") or "—")
        prefix = gid.split(".")[1] if "." in gid else ""
        prov = l1_by_prefix.get(prefix, "—")
        fc["features"].append({"type": "Feature", "properties": {
            "gid": gid, "name2": nm2,
            "engtype2": str(r.get("ENGTYPE_2") or ""),
            "type2": str(r.get("TYPE_2") or ""),
            "provZh": prov}, "geometry": geom})
    return fc

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
def make_index_html(m, slug, L1n, L2n, area_total, groups):
    accent = m["accent"]; dark = m["dark"]
    group_opts = "".join(
        '<button type="button" data-metric="group">类型</button>' if g == "类型"
        else '<button type="button" data-metric="group">类型</button>' for g in [0])
    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <script src="/shared/ga-bridge.js"></script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{m['zh']}行政区划地图 · {L1n} 个{m['role']}的面积与类型</title>
  <meta name="description" content="点一下{m['zh']}地图，看 {L1n} 个{m['role']}的边界、面积与行政区类型。可在「面积 / 类型」之间切换着色，还能展开 {L2n} 个{m['sub']}。边界数据来自 GADM 4.1。" />
  <meta name="keywords" content="{m['zh']}地图,{m['zh']}行政区划,{m['en']},面积,类型,GADM,互动地图" />
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
      <p class="lead">{m['blurb']}点一下地图，看每个{m['role'].split(' /')[0]}的<b>边界、面积与行政区类型</b>。顶栏可在<b>面积 / 类型</b>之间切换着色，颜色越深面积越大。</p>

      <div class="facts">
        <span><small>{m['role']}</small><b><span class="v"><em id="fMain">{L1n}</em></span><i>个</i></b></span>
        <span><small>{m['sub']}</small><b><span class="v"><em id="fSub">{L2n}</em></span><i>个</i></b></span>
        <span><small>总面积</small><b><span class="v"><em id="fArea">—</em></span><i id="fAreaU">万km²</i></b></span>
        <span id="fPopWrap" style="display:none"><em id="fPop"></em><i id="fPopU"></i></span>
      </div>

      <section class="block">
        <header><small>着色指标</small><small class="hint-n">切换看不同维度</small></header>
        <div class="chips" id="metricSeg">
          <button type="button" data-metric="area" class="active">面积</button>
          <button type="button" data-metric="group">类型</button>
        </div>
        <p class="note" id="metricNote">{m['note']}</p>
      </section>

      <section class="block src">
        <p><b>数据来源</b>：{m['role']}、{m['sub']}边界来自 <b>GADM 4.1</b>（gadm41_{m['slug'].split('-')[0].upper()}_shp，WGS84 / EPSG:4326，公开数据）。面积由几何球面实算（约值），行政区类型取自 GADM 的 ENGTYPE 字段，仅供快速对照。本图仅展示行政边界，不含人口等需另行调研的指标。</p>
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
      <span><small id="dtLb1">面积</small><b><em id="dtV1">—</em><i id="dtU1">km²</i></b></span>
      <span><small id="dtLb2">类型</small><b><em id="dtV2">—</em><i id="dtU2"></i></b></span>
      <span><small id="dtLb3">ISO</small><b><em id="dtV3">—</em><i id="dtU3"></i></b></span>
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
      <label class="row"><input type="checkbox" id="ckMuni" data-toggle-layer="sub-fill,sub-line" /><span>{m['sub']}</span></label>
      <label class="row"><input type="checkbox" id="ckLabel" checked /><span>{m['role']}名称</span></label>
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
        色块按<b>面积</b>分级（越深越大）；选「类型」则按行政区类型分类着色。选中后色块变透明、用色环勾边。勾选「{m['sub']}」可看省以下的行政边界。
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

def make_works_md(m, slug, L1n, L2n, area_total, groups):
    cc = slug.split("-")[0]
    area_wan = area_total / 1e4
    return f'''---
slug: {slug}
title: {m['zh']}行政区划地图
cover: /maps/{slug}/vizmap-{slug}-cover.jpg
summary: 点一下{m['zh']}地图，看 {L1n} 个{m['role']}的边界、面积与行政区类型；可在「面积 / 类型」之间切换着色，还能展开 {L2n} 个{m['sub']}。边界数据来自 GADM 4.1。
link: /maps/{slug}
order: 30
category: 互动地图
series: map
topics: 行政区划
scope: 世界
tags: {m['zh']},行政区划,{m['en']},面积,类型,互动地图,地理可视化,GADM
---

## 介绍

{m['blurb']}这张图把{m['zh']}的{m['role']}摊开在同一张地图上：**点一下任意{m['role'].split(' /')[0]}，右侧直接弹出卡片**——名称、行政区类型、面积（几何实算）与 ISO 代码。

地图本体是 **GADM 4.1** 的行政边界，默认按 **面积** 分级着色；顶栏可在 **面积 / 类型** 之间切换——选「类型」则按行政区类型（州 / 省 / 领地 / 共和国……）分类着色，一眼看清这个国家的结构基因。

不满足于一级？勾选左下角「{m['sub']}」，展开 **{L2n} 个{m['sub']}**看省以下的行政区划。

## 功能特点

- **两个指标切换着色**：面积用 log 尺度分级（越深越大）；选「类型」则按行政区类型分类着色。
- **点即出卡**：选中色块变透明、透出底图，并用一圈色环勾住边界。
- **面积实算**：每个{m['role'].split(' /')[0]}的面积由几何球面实算（约值），不依赖外部统计。
- **三种底图**：Esri 卫星影像（默认，压暗）/ 地形晕渲 / 深色无底图。
- **可展开 {L2n} 个{m['sub']}**：{m['sub']}边界作为可叠加图层，勾选后可点任意单元看所属{m['role'].split(' /')[0]}。
- **经纬网格与分享链接**：可叠加 5° 经纬网格；选中后地址栏带上定位状态。

## 数据来源与合规

{m['role']}、{m['sub']}边界来自 **GADM 4.1**（数据集 `gadm41_{cc.upper()}_shp`，WGS84 / EPSG:4326，公开数据），坐标系与 Esri 全球影像底图对齐。面积由几何球面实算（约值），行政区类型取自 GADM 的 ENGTYPE 字段。本图仅展示行政边界几何，**不含人口、省会等需另行调研的指标**（GADM 数据本身不包含）。

## 想拿走原始数据？

如果你要做自己的地图或分析，建议直接下载这套矢量数据——**GADM 4.1 全层级 Shapefile（国界 / {L1n} 个{m['role']} / {L2n} 个{m['sub']} / 更细层级），体量与层级都很全**：

👉 **[GADM 4.1 {m['zh']}矢量数据下载](/downloads/gadm41-{cc}-shp)**

边界是 WGS84 经纬度，Shapefile 格式，可直接在 QGIS / ArcGIS 里打开。本站这张互动图的几何，正是从它转换来的。

## 使用教程

1. 打开地图，默认停在 **面积** 着色、卫星影像底图。悬停任意{m['role'].split(' /')[0]}会浮出名称、类型与面积。
2. 顶栏点「面积 / 类型」切换统计口径；颜色对应的具体量级在右下角图例里看。
3. **点一个{m['role'].split(' /')[0]}**：右侧弹出卡片，地图缩放到该单位范围并用色环勾边。卡片里直接看类型、面积与 ISO。
4. 想看省以下行政：勾选左下角「{m['sub']}」，边界浮现后可点任意单元看所属{m['role'].split(' /')[0]}。
5. 只想看数据不想看影像：把底图切成「深色」。
6. 想退出选中：点卡片右上角关闭按钮，或点地图空白处。

## 常见问题 FAQ

<details>
<summary>Q: 为什么图里没有人口 / 省会？</summary>

因为这批互动地图严格「只用 GADM 数据本身」生成：GADM 4.1 只提供行政边界、名称、类型(ENGTYPE)与 ISO 代码，**不含人口与省会**。面积由几何实算，类型由 ENGTYPE 字段映射。若需要人口等统计指标，需另行接入各国统计局普查数据——本站现有 9 国同类地图中，人口等是逐区人工整理的。

</details>

<details>
<summary>Q: 边界数据哪来的，能商用吗？</summary>

{m['role']} / {m['sub']}边界来自 **GADM 4.1**（公开数据，WGS84）。GADM 数据供非商业与研究用途使用，正式或商业用途请遵循其许可并优先采用各国官方发布的标准行政区划。底图瓦片来自 Esri，版权归 Esri 及其数据提供方。

</details>

## 一点解读

{m['read']}
'''

def make_config_js(m, slug, view, bounds, extent, groups, group_colors):
    cc = slug.split("-")[0]
    RAMP = ramp(m["accent"])
    gc = ",\n    ".join(f"'{g}': '{c}'" for g, c in group_colors.items())
    return f'''/* {m['zh']}行政区划互动地图 · 表现层配置
   数据：scripts/gen_six_regions.py 从 GADM 4.1（gadm41_{cc.upper()}_shp）转换生成
        - provinces.geojson  {m['role']}（L1）
        - districts.geojson  {m['sub']}（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {{
  slug: '{slug}',
  defaultMetric: 'area',
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
    area:   {{ key: 'area', label: '面积', unit: 'km²', hint: '面积由 GADM 几何球面实算（约值）' }},
    group:  {{ key: 'groupZh', label: '类型', unit: '类型', hint: '行政区类型（GADM ENGTYPE 映射）' }}
  }},

  DATA: {{
    main: 'data/provinces.geojson',
    sub: 'data/districts.geojson'
  }},

  TEXT: {{
    groupSuffix: '类型',
    capitalLabel: '类型',
    mainLabel: '{m['role']}',
    subRole: '{m['sub']}',
    subDesc: '{m['sub']}是{m['role'].split(" /")[0]}之下的基本行政单位。',
    notes: {{
      area: '{m['note']}',
      group: '按<b>行政区类型</b>着色：州 / 省 / 领地 / 共和国 / 边疆区等一目了然。'
    }}
  }}
}};
'''

# ── 主流程 ────────────────────────────────────────────────
def process(cc, m):
    slug = m["slug"]
    d = os.path.join(BASE, f"gadm41_{cc.upper()}_shp")
    out_dir = os.path.join(ROOT, "public", "maps", slug, "data")
    os.makedirs(out_dir, exist_ok=True)

    # L1
    dbf1 = read_dbf(os.path.join(d, f"gadm41_{cc.upper()}_1.dbf"))
    _, recs1 = read_shp(os.path.join(d, f"gadm41_{cc.upper()}_1.shp"))
    fc1 = {"type": "FeatureCollection", "features": []}
    for row, rings in zip(dbf1, recs1):
        gid = row.get("GID_1")
        if not gid or gid == "NA":
            continue
        geom = build_geojson(rings, eps=0.01)
        if not geom:
            continue
        eng = (row.get("ENGTYPE_1") or "").strip()
        gzh = ENGTYPE_ZH.get(eng.lower(), eng if eng else "其他")
        nm = row.get("NAME_1") or row.get("VARNAME_1") or gid
        fc1["features"].append({"type": "Feature", "properties": {
            "gid": gid, "name": nm, "nameEn": nm, "nameLocal": nm,
            "type": eng, "typeEn": eng, "groupZh": gzh,
            "area": round(feat_area_km2(geom), 1),
            "iso": row.get("ISO_1") or "", "engtype": eng
        }, "geometry": geom})

    # 建 L1 name 查表（按 GID 前缀归属，供 L2 反查所属一级）
    l1_by_prefix = {}
    for f in fc1["features"]:
        parts = f["properties"]["gid"].split(".")
        if len(parts) >= 2:
            l1_by_prefix[parts[1]] = f["properties"]["name"]
    # L2（用 geopandas 读大文件）
    fc2 = process_l2(cc, d, l1_by_prefix)

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

    # 写 config / index / works
    map_dir = os.path.join(ROOT, "public", "maps", slug)
    os.makedirs(map_dir, exist_ok=True)
    os.makedirs(os.path.join(ROOT, "content", "works"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "public", "shots", slug), exist_ok=True)
    js_dir = os.path.join(map_dir, "js"); os.makedirs(js_dir, exist_ok=True)
    open(os.path.join(js_dir, "config.js"), "w", encoding="utf-8").write(
        make_config_js(m, slug, view, bnd, extent, groups, group_colors))
    open(os.path.join(map_dir, "index.html"), "w", encoding="utf-8").write(
        make_index_html(m, slug, L1n, L2n, area_total, groups))
    open(os.path.join(ROOT, "content", "works", f"{slug}.md"), "w", encoding="utf-8").write(
        make_works_md(m, slug, L1n, L2n, area_total, groups))

    # 封面图（matplotlib，跨经线偏移渲染）
    try:
        if os.environ.get("NO_COVER"):
            raise RuntimeError("cover disabled")
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        from matplotlib.patches import Polygon as MplPoly
        fig, ax = plt.subplots(figsize=(16, 10), dpi=90)
        fig.patch.set_facecolor(m["dark"]); ax.set_facecolor(m["dark"])
        # 渲染用偏移经度（跨经线国家把偏离中位数一侧的经度 +360，仅用于画图）
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
        fig.savefig(os.path.join(ROOT, "public", "shots", slug, f"vizmap-{slug}-hp1.jpg"), dpi=90, bbox_inches="tight", facecolor=m["dark"])
        plt.close(fig)
    except Exception as e:
        print("  [warn] cover 渲染失败:", e)

    # 打印汇总（供 vizmaps 登记）
    grp_str = "; ".join(f"{g}×{n}" for g, n in groups.items())
    print(f"### {slug} | {m['zh']} ({cc.upper()})")
    print(f"  L1={L1n}  L2={L2n}  面积≈{area_total/1e4:.1f}万km²")
    print(f"  provinces.geojson={s1:.2f}MB  districts.geojson={s2:.2f}MB")
    print(f"  分组: {grp_str}")
    print(f"  view=[[{cx:.3f},{cy:.3f}],{view[2]},{view[3]}]  bounds=[{bnd[0]:.2f},{bnd[1]:.2f},{bnd[2]:.2f},{bnd[3]:.2f}]")
    print(f"  GROUP_COLORS={json.dumps(group_colors, ensure_ascii=False)}")
    print()
    return dict(slug=slug, zh=m["zh"], cc=cc, L1n=L1n, L2n=L2n, area=area_total,
                s1=s1, s2=s2, groups=groups, view=view, bnd=bnd,
                group_colors=group_colors)

if __name__ == "__main__":
    print("=" * 60)
    for cc, m in META.items():
        process(cc, m)
    print("=" * 60)
    print("DONE. 上面每国的汇总用于手填 src/data/vizmaps.json 的 6 条登记。")
