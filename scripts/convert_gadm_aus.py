# -*- coding: utf-8 -*-
"""
GADM 4.1 AUS → GeoJSON 转换器（纯 Python，无第三方依赖）
- 解析 shp（Polygon / PolygonZ / PolygonM）+ dbf
- 道格拉斯-普克简化（按经纬度度数容差）
- 坐标取整到 4 位小数（≈11 m）
- 环方向规范化：外环 CCW、洞 CW（GeoJSON RFC7946 右手定则）
- 输出 public/maps/au-regions/data/{states,lga}.geojson

用法：python scripts/convert_gadm_aus.py
"""
import json
import math
import os
import struct

BASE = "D:/01 ArcGIS制图计划/09 数据集/03 矢量数据/04 全球矢量数据/02 GDM数据/gadm41_AUS_shp"
OUT_DIR = "public/maps/au-regions/data"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", OUT_DIR)

# ── DBF 读取 ────────────────────────────────────────────────
def read_dbf(path):
    with open(path, "rb") as f:
        data = f.read()
    numrec = struct.unpack("<I", data[4:8])[0]   # 实际记录数（le）
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
            s = raw[pos:pos + length].decode("gbk", "replace").rstrip()
            if typ == "N" or typ == "F":
                s = s.strip()
                row[nm] = float(s) if ("." in s or dec) and s not in ("", "-") else (int(s) if s not in ("", "-") else None)
            else:
                row[nm] = s
            pos += length
        rows.append(row)
    return rows


# ── SHP 读取 ────────────────────────────────────────────────
def read_shp(path):
    with open(path, "rb") as f:
        data = f.read()
    # 头：shapeType 在 byte 32（le）
    shape_type = struct.unpack("<i", data[32:36])[0]
    # 记录
    recs = []
    off = 100
    n = len(data)
    while off + 8 <= n:
        rec_off = struct.unpack(">i", data[off:off + 4])[0]   # 记录号（忽略）
        content_len = struct.unpack(">i", data[off + 4:off + 8])[0]  # 16-bit words
        cstart = off + 8
        cend = cstart + content_len * 2
        if cend > n:
            break
        buf = data[cstart:cend]
        recs.append(parse_polygon(buf))
        off = cend
    return shape_type, recs


def parse_polygon(buf):
    """返回该要素的所有环（list of rings，每个 ring = list of [x,y]）。"""
    st = struct.unpack("<i", buf[0:4])[0]
    if st not in (5, 15, 25):
        return []
    # bbox 4 doubles BE
    p = 4 + 32  # 跳过 shapeType + bbox(4*8)
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
    # 跳过 Z/M（15/25）
    if st == 15:
        p += 16 + num_points * 8          # zmin/zmax + z[]
        p += 16 + num_points * 8          # mmin/mmax + m[]
    elif st == 25:
        p += 16 + num_points * 8
    rings = []
    for i in range(num_parts):
        s = parts[i]
        e = parts[i + 1] if i + 1 < num_parts else num_points
        rings.append(pts[s:e])
    return rings


# ── 几何工具 ────────────────────────────────────────────────
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
    # 找离首尾连线最远的点
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
    """把要素的环组装成 GeoJSON geometry（Polygon 或 MultiPolygon），并规范化方向。"""
    if not rings:
        return None
    # 简化每个环
    simp = [round_ring(dp_simplify(r, eps)) for r in rings]
    simp = [r for r in simp if len(r) >= 4]
    if not simp:
        return None
    # 判定外环/洞：被其它环包含的为洞
    parents = [None] * len(simp)
    for i in range(len(simp)):
        ri = simp[i]
        # 取一个点判断是否落在其它环内
        test_pt = ri[len(ri) // 2]
        best = None
        for j in range(len(simp)):
            if i == j:
                continue
            if point_in_ring(test_pt, simp[j]):
                # 选面积更小的父环
                if best is None or abs(ring_area(simp[j])) < abs(ring_area(simp[best])):
                    best = j
        parents[i] = best
    # 外环列表
    exteriors = [i for i in range(len(simp)) if parents[i] is None]
    polygons = []
    for e in exteriors:
        ring_e = simp[e]
        # 外环 CCW（面积正）
        if ring_area(ring_e) < 0:
            ring_e = ring_e[::-1]
        holes = [simp[k] for k in range(len(simp)) if parents[k] == e]
        holes_ok = []
        for h in holes:
            # 洞 CW（面积负）
            if ring_area(h) > 0:
                h = h[::-1]
            holes_ok.append(h)
        polygons.append([ring_e] + holes_ok)
    if len(polygons) == 1:
        return {"type": "Polygon", "coordinates": polygons[0]}
    return {"type": "MultiPolygon", "coordinates": polygons}


# ── 州领地事实（人工整理，ABS 2021 普查 / 各州政府口径，近似） ──
FACTS = {
    "AUS.5_1":  dict(zh="新南威尔士州", capitalZh="悉尼",  capitalEn="Sydney",      pop=8072163, area=800642,  joined=1901, nick="首发之州 (First State)",       blurb="澳大利亚人口最多、经济最发达的州，悉尼与世界级海岸线都在这里。"),
    "AUS.10_1": dict(zh="维多利亚州",   capitalZh="墨尔本", capitalEn="Melbourne",   pop=6503491, area=227444,  joined=1901, nick="花园之州 (Garden State)",     blurb="大陆上面积最小、人口第二的州，文化、体育与咖啡馆之城墨尔本所在地。"),
    "AUS.7_1":  dict(zh="昆士兰州",     capitalZh="布里斯班", capitalEn="Brisbane",  pop=5183659, area=1729742, joined=1901, nick="阳光之州 (Sunshine State)",   blurb="面积第二大，坐拥大堡礁与热带海岸，近年人口增速领跑全澳。"),
    "AUS.11_1": dict(zh="西澳大利亚州", capitalZh="珀斯",   capitalEn="Perth",      pop=2660026, area=2527013, joined=1901, nick="资源大州",                    blurb="面积约占全澳三分之一，矿业与偏远内陆的代名词，首府珀斯孤悬西部。"),
    "AUS.8_1":  dict(zh="南澳大利亚州", capitalZh="阿德莱德", capitalEn="Adelaide",  pop=1781516, area=983482,  joined=1901, nick="节日之州 (Festival State)",   blurb="葡萄酒产区与干旱内陆并存，阿德莱德以整洁的方格路网闻名。"),
    "AUS.9_1":  dict(zh="塔斯马尼亚州", capitalZh="霍巴特",  capitalEn="Hobart",     pop=557571,  area=68401,   joined=1901, nick="苹果之岛 (Apple Isle)",       blurb="唯一处在海外岛屿的州，凉爽多雨，近半土地列入世界自然遗产。"),
    "AUS.2_1":  dict(zh="澳大利亚首都领地", capitalZh="堪培拉", capitalEn="Canberra", pop=454499,  area=2358,    joined=1911, nick="首都领地",                    blurb="首都堪培拉所在地，全澳面积最小的行政区划，由联邦直辖。"),
    "AUS.6_1":  dict(zh="北领地",       capitalZh="达尔文",  capitalEn="Darwin",     pop=233834,  area=1347791, joined=1911, nick="红土中心 (Red Centre)",        blurb="地广人稀，乌鲁鲁与卡卡杜国家公园在此，1978 年获自治权。"),
    # 三个海外领地（极小 / 无常住居民）
    "AUS.1_1":  dict(zh="阿什莫尔和卡捷群岛", capitalZh="—（无常住居民）", capitalEn="—", pop=0, area=199, joined=None, nick="海外领地", blurb="印度洋上的珊瑚礁群，无常住居民，由联邦政府直接管辖，生态意义突出。", ext=True),
    "AUS.3_1":  dict(zh="珊瑚海群岛领地",   capitalZh="—（无常住居民）", capitalEn="—", pop=0, area=780000, joined=None, nick="海外领地", blurb="昆士兰以东珊瑚海的珊瑚礁与小岛，无常住居民，多为生态与气象用途。", ext=True),
    "AUS.4_1":  dict(zh="杰维斯湾领地",     capitalZh="—（约 371 人）",  capitalEn="—", pop=371, area=90, joined=None, nick="海外领地", blurb="新南威尔士州以南的一块飞地，有海军基地与比舍诺湾，人口极少。", ext=True),
}


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    # ── Level 1：州与领地 ──
    dbf1 = read_dbf(os.path.join(BASE, "gadm41_AUS_1.dbf"))
    _, recs1 = read_shp(os.path.join(BASE, "gadm41_AUS_1.shp"))
    assert len(dbf1) == len(recs1), (len(dbf1), len(recs1))
    fc1 = {"type": "FeatureCollection", "features": []}
    for d, rings in zip(dbf1, recs1):
        gid = d["GID_1"]
        geom = build_geojson(rings, eps=0.01)
        if not geom:
            continue
        f = FACTS.get(gid, {})
        props = {
            "gid": gid,
            "country": d.get("COUNTRY"),
            "name": d.get("NAME_1"),
            "en": d.get("NAME_1"),
            "engtype": d.get("ENGTYPE_1"),
            "type": d.get("TYPE_1"),
            "hasc": d.get("HASC_1"),
            "iso": d.get("ISO_1"),
            "zh": f.get("zh", d.get("NAME_1")),
            "capitalZh": f.get("capitalZh"),
            "capitalEn": f.get("capitalEn"),
            "pop": f.get("pop"),
            "area": f.get("area"),
            "joined": f.get("joined"),
            "nick": f.get("nick"),
            "blurb": f.get("blurb"),
            "ext": bool(f.get("ext", False)),
        }
        fc1["features"].append({"type": "Feature", "properties": props, "geometry": geom})
    with open(os.path.join(OUT_DIR, "states.geojson"), "w", encoding="utf-8") as f:
        json.dump(fc1, f, ensure_ascii=False, separators=(",", ":"))
    print("states.geojson features=%d size=%.2f MB" % (len(fc1["features"]), os.path.getsize(os.path.join(OUT_DIR, "states.geojson")) / 1e6))

    # ── Level 2：地方政府区 (LGA) ──
    dbf2 = read_dbf(os.path.join(BASE, "gadm41_AUS_2.dbf"))
    _, recs2 = read_shp(os.path.join(BASE, "gadm41_AUS_2.shp"))
    assert len(dbf2) == len(recs2), (len(dbf2), len(recs2))
    fc2 = {"type": "FeatureCollection", "features": []}
    for d, rings in zip(dbf2, recs2):
        geom = build_geojson(rings, eps=0.006)
        if not geom:
            continue
        props = {
            "gid": d.get("GID_2"),
            "name1": d.get("NAME_1"),
            "name2": d.get("NAME_2"),
            "engtype2": d.get("ENGTYPE_2"),
            "type2": d.get("TYPE_2"),
        }
        fc2["features"].append({"type": "Feature", "properties": props, "geometry": geom})
    with open(os.path.join(OUT_DIR, "lga.geojson"), "w", encoding="utf-8") as f:
        json.dump(fc2, f, ensure_ascii=False, separators=(",", ":"))
    print("lga.geojson features=%d size=%.2f MB" % (len(fc2["features"]), os.path.getsize(os.path.join(OUT_DIR, "lga.geojson")) / 1e6))


if __name__ == "__main__":
    main()
