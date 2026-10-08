# -*- coding: utf-8 -*-
"""
GADM 4.1 GBR → GeoJSON 转换器（纯 Python，无第三方依赖）
- 解析 shp（Polygon / PolygonZ / PolygonM）+ dbf
- 道格拉斯-普克简化（按经纬度度数容差）
- 坐标取整到 4 位小数（≈11 m）
- 环方向规范化：外环 CCW、洞 CW（GeoJSON RFC7946 右手定则）
- 输出 public/maps/uk-regions/data/{countries,districts}.geojson
- GADM GBR 怪点：Level1 中英格兰 NAME_1 为空（GID=GBR.1_1），且有一条全空 stray 记录；
  Level2 有 2 条 NAME_2 为空的记录。一律用 GID 前缀推导构成国归属。

用法：python scripts/convert_gadm_gbr.py
"""
import json
import math
import os
import struct

BASE = "D:/01 ArcGIS制图计划/09 数据集/03 矢量数据/04 全球矢量数据/02 GDM数据/gadm41_GBR_shp"
OUT_DIR = "public/maps/uk-regions/data"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", OUT_DIR)

# ── DBF 读取 ────────────────────────────────────────────────
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


# ── 构成国事实（ONS 2022 年中估计，由 2021/2022 普查滚动；面积取维基精确值 km²） ──
# GID 前缀：1=英格兰 2=北爱尔兰 3=苏格兰 4=威尔士
FACTS = {
    "GBR.1_1": dict(zh="英格兰", en="England", capitalZh="伦敦", capitalEn="London",
                    pop=57106000, area=130310, devolved=False,
                    nick="人口占全英八成四",
                    blurb="占全英 84% 人口、最都市化的构成国；伦敦为首都与政府所在地，但英格兰本身不设下放议会（devolution 刻意绕开它）。"),
    "GBR.3_1": dict(zh="苏格兰", en="Scotland", capitalZh="爱丁堡", capitalEn="Edinburgh",
                    pop=5448000, area=77901, devolved=True,
                    nick="山与湖之国",
                    blurb="山地与湖泊（loch）密布，风能与威士忌之乡；1999 年恢复苏格兰议会，独立公投话题长热。"),
    "GBR.4_1": dict(zh="威尔士", en="Wales", capitalZh="卡迪夫", capitalEn="Cardiff",
                    pop=3132000, area=20737, devolved=True,
                    nick="城堡之乡",
                    blurb="多山、双语（威尔士语为官方语言之一）、城堡密布；1999 年成立威尔士议会（Senedd）。"),
    "GBR.2_1": dict(zh="北爱尔兰", en="Northern Ireland", capitalZh="贝尔法斯特", capitalEn="Belfast",
                    pop=1911000, area=13547, devolved=True,
                    nick="阿尔斯特",
                    blurb="历史省份阿尔斯特九郡中的六郡；1998 年《耶稣受难日协议》后走向和平稳定，权力下放政府驻贝尔法斯特。"),
}

# GID 前缀 → 构成国英文名（用于 Level2 兜底归属，与 NAME_1 字段英文保持一致）
PREFIX_EN = {"1": "England", "2": "Northern Ireland", "3": "Scotland", "4": "Wales"}


def country_from_gid(gid):
    if not gid or gid == "NA":
        return None
    # GID 形如 GBR.1_1 或 GBR.1.19_1
    parts = gid.split(".")
    if len(parts) >= 2 and parts[1] in PREFIX_EN:
        return PREFIX_EN[parts[1]]
    return None


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    # ── Level 1：构成国 ──
    dbf1 = read_dbf(os.path.join(BASE, "gadm41_GBR_1.dbf"))
    _, recs1 = read_shp(os.path.join(BASE, "gadm41_GBR_1.shp"))
    assert len(dbf1) == len(recs1), (len(dbf1), len(recs1))
    fc1 = {"type": "FeatureCollection", "features": []}
    skipped = 0
    for d, rings in zip(dbf1, recs1):
        gid = d.get("GID_1")
        if not gid or gid == "NA":
            skipped += 1
            continue  # 跳过全空 stray 记录
        geom = build_geojson(rings, eps=0.01)
        if not geom:
            continue
        f = FACTS.get(gid, {})
        props = {
            "gid": gid,
            "country": d.get("COUNTRY"),
            "name": f.get("zh", d.get("NAME_1")),
            "en": f.get("en", d.get("NAME_1")),
            "engtype": d.get("ENGTYPE_1"),
            "type": d.get("TYPE_1"),
            "iso": d.get("ISO_1"),
            "capitalZh": f.get("capitalZh"),
            "capitalEn": f.get("capitalEn"),
            "pop": f.get("pop"),
            "area": f.get("area"),
            "devolved": bool(f.get("devolved", False)),
            "nick": f.get("nick"),
            "blurb": f.get("blurb"),
        }
        fc1["features"].append({"type": "Feature", "properties": props, "geometry": geom})
    with open(os.path.join(OUT_DIR, "countries.geojson"), "w", encoding="utf-8") as fp:
        json.dump(fc1, fp, ensure_ascii=False, separators=(",", ":"))
    print("countries.geojson features=%d (skipped=%d) size=%.2f MB" % (
        len(fc1["features"]), skipped, os.path.getsize(os.path.join(OUT_DIR, "countries.geojson")) / 1e6))

    # ── Level 2：郡 / 单一管理区 / 都会自治市 / 区 ──
    dbf2 = read_dbf(os.path.join(BASE, "gadm41_GBR_2.dbf"))
    _, recs2 = read_shp(os.path.join(BASE, "gadm41_GBR_2.shp"))
    assert len(dbf2) == len(recs2), (len(dbf2), len(recs2))
    fc2 = {"type": "FeatureCollection", "features": []}
    skip2 = 0
    for d, rings in zip(dbf2, recs2):
        gid = d.get("GID_2")
        geom = build_geojson(rings, eps=0.005)
        if not geom:
            skip2 += 1
            continue
        name1 = d.get("NAME_1")
        if not name1 or name1 == "NA":
            name1 = country_from_gid(gid) or "—"
        name2 = d.get("NAME_2")
        if not name2 or name2 == "NA":
            name2 = "—"
        props = {
            "gid": gid,
            "name1": name1,          # 所属构成国
            "name2": name2,          # 次级行政区名
            "engtype2": d.get("ENGTYPE_2"),
            "type2": d.get("TYPE_2"),
        }
        fc2["features"].append({"type": "Feature", "properties": props, "geometry": geom})
    with open(os.path.join(OUT_DIR, "districts.geojson"), "w", encoding="utf-8") as fp:
        json.dump(fc2, fp, ensure_ascii=False, separators=(",", ":"))
    print("districts.geojson features=%d (skipped=%d) size=%.2f MB" % (
        len(fc2["features"]), skip2, os.path.getsize(os.path.join(OUT_DIR, "districts.geojson")) / 1e6))


if __name__ == "__main__":
    main()
