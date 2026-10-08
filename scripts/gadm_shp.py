# -*- coding: utf-8 -*-
"""GADM 4.1 Shapefile → GeoJSON 公共工具（纯标准库，无第三方依赖）

供 scripts/convert_gadm_*.py 复用：
  read_dbf(path)                     读 dbf（UTF-8，兼容 N/F/C 字段）
  read_shp(path)                     读 shp（Polygon / PolygonZ / PolygonM）
  build_geojson(rings, eps, drop)    环 → GeoJSON Polygon/MultiPolygon（RFC7946 右手定则）
  ring_area(ring)                    平面环面积（度²）
  geom_area_km2(geom)                GeoJSON 几何的球面近似面积（km²）
  bbox_of(rings)                     环组外接矩形
"""
import json
import math
import os
import struct


# ── dbf ────────────────────────────────────────────────────────────────
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


# ── shp ────────────────────────────────────────────────────────────────
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


# ── 几何 ───────────────────────────────────────────────────────────────
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


def bbox_of(rings):
    x0 = y0 = float("inf")
    x1 = y1 = float("-inf")
    for r in rings:
        for x, y in r:
            if x < x0: x0 = x
            if y < y0: y0 = y
            if x > x1: x1 = x
            if y > y1: y1 = y
    if x0 == float("inf"):
        return None
    return [x0, y0, x1, y1]


def build_geojson(rings, eps, drop=None):
    """rings: 原始环列表 → GeoJSON geometry。
    drop: 可选 fn(ring)->bool，返回 True 的环被剔除（用于领土合规剔除）。"""
    if drop:
        rings = [r for r in rings if not drop(r)]
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


R_EARTH = 6371.0088


def ring_area_km2(ring):
    """球面近似面积（km²）：以环心纬度做等距圆柱近似，误差 <1%，够用于对照。"""
    n = len(ring)
    if n < 3:
        return 0.0
    lat0 = sum(p[1] for p in ring) / n
    k = math.cos(math.radians(lat0))
    a = 0.0
    for i in range(n):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % n]
        # 用经度差（处理跨 ±180）
        dx = x2 - x1
        if dx > 180: dx -= 360
        if dx < -180: dx += 360
        a += dx * k * (y2 + y1)
    return abs(a) * (math.pi / 180) ** 2 * R_EARTH * R_EARTH / 2.0


def geom_area_km2(geom):
    if not geom:
        return 0.0
    if geom["type"] == "Polygon":
        polys = [geom["coordinates"]]
    else:
        polys = geom["coordinates"]
    total = 0.0
    for poly in polys:
        total += ring_area_km2(poly[0])
        for h in poly[1:]:
            total -= ring_area_km2(h)
    return total


def write_geojson(path, fc):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fp:
        json.dump(fc, fp, ensure_ascii=False, separators=(",", ":"))
    print("  → %s  features=%d  %.2f MB" % (
        os.path.basename(path), len(fc["features"]), os.path.getsize(path) / 1e6))
