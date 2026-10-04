# -*- coding: utf-8 -*-
"""cn-rivers 互动地图数据构建 / 校验。

源数据：D:/01 资料下载/地理数据/cn-zhuyao-shuixi-shp（国家基础地理 1:100万 水系）
  - R12.polyline  字段 LEVEL_RIVE=1,2 ... 干流与主要支流（1~5 级）
  - R4.polyline   字段 LEVEL=4            四级支流
  - R5.polyline   字段 LEVEL=5            五级支流
  - R12P.polygon  水域面（湖泊/水库/双线河）
坐标系：WGS_1984_Albers -> WGS84 -> GCJ-02（与高德底图对齐）

用法：
  python build_cn_rivers.py            # 全量重建 rivers.json + water-areas.json
  python build_cn_rivers.py --check    # 只做一致性校验（不写文件）
"""
import os
import sys
import json
import argparse
import warnings
import collections

warnings.filterwarnings("ignore")

import shapefile
from pyproj import CRS, Transformer

SRC = r"D:/01 资料下载/地理数据/cn-zhuyao-shuixi-shp"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   "public", "maps", "cn-rivers", "data")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from crs_tools import wgs84_to_gcj02  # noqa: E402

# R12 里 LEVEL_RIVE=9 不是「九级河」，而是**人工运河**的标记（90 段京杭运河全线
# 与南运河、北运河都在此级）。它不参与 1~5 级的水系分级，单独作为一个语义类别收录，
# 否则京杭运河这种国家级水利工程会整体缺失。
LEVEL_CANAL = 9

# 河流分级配色沿用 app.js：1 红 / 2 蓝 / 3 橙 / 4 绿 / 5 灰 / 9 运河紫
LEVEL_TEXT = {1: "一级", 2: "二级", 3: "三级", 4: "四级", 5: "五级", LEVEL_CANAL: "运河"}
# 需要收录的层级：R12 取 1/2/3 级（四级、五级由 R4/R5 提供）
R12_LEVELS = (1, 2, 3)

# GBCODE 经核查与河名无稳定对应（29/111 个河名同时出现多个码，连黄河自身都是
# 21011+23010 混合；R12P 里青海湖这种内流区湖泊也被标成 23010 长江水系），
# 因此**不使用 GBCODE 推断水系**，改由 build_rivers() 按河口落在哪条干流上来判定。
# 干流集合：用于判定「某河的干流归属」的一级河流名
TRUNK_NAMES = [
    "长江", "黄河", "珠江", "黑龙江", "雅鲁藏布江", "澜沧江", "怒江",
    "松花江", "辽河", "海河", "淮河", "额尔齐斯河", "塔里木河", "伊犁河",
]

# R12P 的 LEVEL_LAKE：湖泊/水库规模等级
LAKE_LEVEL_TEXT = {1: "特大型", 2: "大型", 3: "中型", 4: "小型"}

# 名称中的同义括注（如“汉江(汉水)”“京杭运河(梁济运河)”），主名取括号前
BRACKET = "（("
PINYIN_TABLE = None  # 运行时由 _init_pinyin 填充


def split_alias(name):
    """拆分「主名(别名)」-> (主名, 别名或 None)。半角/全角括号都处理。"""
    if not name:
        return None, None
    n = name.strip()
    for l, r in (("(", ")"), ("（", "）")):
        if l in n and n.endswith(r):
            i = n.rindex(l)
            main, alias = n[:i].strip(), n[i + 1: -1].strip()
            return main.replace(" ", "") or None, (alias or None)
    return n.replace(" ", "") or None, None


def clean_name(name):
    """去掉名称中的同义括注，保留主名。"""
    return split_alias(name)[0]


def _init_pinyin():
    """生成汉字->拼音的小字典（覆盖常见河名用字），失败则返回 None。"""
    global PINYIN_TABLE
    try:
        from pypinyin import lazy_pinyin
        PINYIN_TABLE = lazy_pinyin
    except Exception:
        PINYIN_TABLE = None


def to_pinyin(name):
    if not name:
        return ""
    if PINYIN_TABLE:
        try:
            return "".join(PINYIN_TABLE(name))
        except Exception:
            pass
    return ""


def make_transformer(prj_path):
    crs = CRS.from_wkt(open(prj_path, encoding="utf-8").read())
    return Transformer.from_crs(crs, CRS.from_epsg(4326), always_xy=True)


def shp_to_gcj(tr, x, y):
    lon, lat = tr.transform(x, y)
    return wgs84_to_gcj02(lon, lat)


# 坐标保留位数：5 位约 1m 精度，与既有 rivers.json 一致
COORD_PRECISION = 5
# Douglas-Peucker 简化容差（度）。0.0005 ≈ 55m，与既有 rivers.json 的抽稀程度一致；
# 设为 0 可保留全部原始顶点（文件体积会增大约 4 倍）。
SIMPLIFY_TOL = 0.0005


def round_line(line):
    return [[round(p[0], COORD_PRECISION), round(p[1], COORD_PRECISION)] for p in line]


def _perp_dist(p, a, b):
    """点到线段 ab 的垂距（度，近似即可用于抽稀）。"""
    import math
    dx, dy = b[0] - a[0], b[1] - a[1]
    if dx == 0 and dy == 0:
        return math.hypot(p[0] - a[0], p[1] - a[1])
    t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))
    return math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))


def _dp(points, tol):
    """迭代式 Douglas-Peucker，避免深递归。"""
    n = len(points)
    if n < 3:
        return points
    keep = [False] * n
    keep[0] = keep[n - 1] = True
    stack = [(0, n - 1)]
    while stack:
        s, e = stack.pop()
        if e - s < 2:
            continue
        a, b = points[s], points[e]
        best, bi = -1.0, -1
        for k in range(s + 1, e):
            d = _perp_dist(points[k], a, b)
            if d > best:
                best, bi = d, k
        if best > tol and bi > 0:
            keep[bi] = True
            stack.append((s, bi))
            stack.append((bi, e))
    return [points[i] for i in range(n) if keep[i]]


def simplify_line(line, tol=SIMPLIFY_TOL):
    if tol <= 0 or len(line) < 3:
        return line
    return _dp(line, tol)


def build_rivers():
    """读取 R12 / R4 / R5，按 name 合并同名河段，输出 GeoJSON FeatureCollection。"""
    _init_pinyin()
    # (name, level) -> { fid_suffix: [line, ...] }
    grouped = collections.defaultdict(list)
    meta = {}

    def add_file(fname, level_from, level_to, level_field):
        path = os.path.join(SRC, fname)
        tr = make_transformer(path + ".prj")
        rd = shapefile.Reader(path, encoding="gbk", encodingErrors="replace")
        recs = rd.records()
        shapes = rd.shapes()
        n = 0
        for i, rec in enumerate(recs):
            lv = rec[level_field]
            if lv is None or not (level_from <= lv <= level_to):
                continue
            name = clean_name(rec["NAME"])
            if not name:
                continue
            lv = int(lv)
            parts = shapes[i].parts
            pts = shapes[i].points
            if not parts:
                parts = [0]
            bounds = list(parts) + [len(pts)]
            lines = []
            for a, b in zip(bounds[:-1], bounds[1:]):
                seg = pts[a:b]
                if len(seg) < 2:
                    continue
                line = round_line([list(shp_to_gcj(tr, px, py)) for px, py in seg])
                line = simplify_line(line)
                if len(line) < 2:
                    continue
                lines.append(line)
            if not lines:
                continue
            key = (name, lv)
            grouped[key].extend(lines)
            m = meta.setdefault(key, {"bbox": [0, 0, 0, 0], "init": False, "alias": []})
            # 别名：原名括号内的同义名，如「汉江(汉水)」「京杭运河(里运河)」。
            # 同名同级会合并多段，别名要累积（京杭运河北段/江南段/里运河各带不同括注），
            # 否则只会留下第一段的那个别名。
            _, alias = split_alias(rec["NAME"])
            if alias:
                for a in [x.strip() for x in alias.replace("，", ",").split(",") if x.strip()]:
                    if a not in m["alias"]:
                        m["alias"].append(a)
            # 包围盒：跨段取并集（弹窗定位 / 快速剔除视野用）
            xs = [q[0] for l in lines for q in l]
            ys = [q[1] for l in lines for q in l]
            if not m["init"]:
                m["bbox"] = [min(xs), min(ys), max(xs), max(ys)]
                m["init"] = True
            else:
                bb = m["bbox"]
                m["bbox"] = [min(bb[0], min(xs)), min(bb[1], min(ys)),
                             max(bb[2], max(xs)), max(bb[3], max(ys))]
            n += 1
        return n

    def _seg_deg(line):
        s = 0.0
        for k in range(1, len(line)):
            s += ((line[k][0] - line[k - 1][0]) ** 2 + (line[k][1] - line[k - 1][1]) ** 2) ** 0.5
        return s

    counts = {}
    counts["R12"] = add_file("R12", 1, 3, "LEVEL_RIVE")
    counts["R12-canal"] = add_file("R12", LEVEL_CANAL, LEVEL_CANAL, "LEVEL_RIVE")
    counts["R4"] = add_file("R4", 4, 4, "LEVEL")
    counts["R5"] = add_file("R5", 5, 5, "LEVEL")

    basins = infer_basins(grouped, {k: m["bbox"] for k, m in meta.items()})

    feats = []
    used_fid = set()
    for (name, lv), lines in sorted(grouped.items(), key=lambda kv: (kv[0][1], kv[0][0])):
        m = meta[(name, lv)]
        # 同名同级合并为单条 MultiLineString（与既有 rivers.json 结构一致）
        # fid 必须全局唯一（promoteId + setFeatureState 依赖它）：
        # 存在同名不同级的河（如「扎曲」既是 1 级又是 2 级），故在冲突时追加级别后缀。
        fid = "%s_1" % name
        if fid in used_fid:
            fid = "%s_L%d" % (name, lv)
        n = 2
        while fid in used_fid:
            fid = "%s_L%d_%d" % (name, lv, n)
            n += 1
        used_fid.add(fid)
        feats.append({
            "type": "Feature",
            "properties": {
                "fid": fid,
                "name": name,
                "level": lv,
                "levelText": LEVEL_TEXT.get(lv, "%d级" % lv),
                "basin": basins.get((name, lv), "") or ("人工运河" if lv == LEVEL_CANAL else ""),
                "pinyin": to_pinyin(name),
                "lengthKm": round(_len_km_all(lines), 1),
                "alias": "、".join(m.get("alias") or []),
                "segCount": len(lines),
                "spanKm": _span_km(m["bbox"]),
                "bbox": m["bbox"],
            },
            "geometry": {"type": "MultiLineString", "coordinates": lines},
        })
    fc = {"type": "FeatureCollection", "features": feats}
    return fc, counts


# ---------- 干流归属推断 ----------
def _pt_seg_dist(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    if dx == 0 and dy == 0:
        return ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5
    t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))
    return ((px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2) ** 0.5


def _min_dist_to_lines(pt, lines, sample=4):
    """点到一组线的最短距离（度）。长线按 sample 点抽样降本。"""
    best = float("inf")
    for ln in lines:
        step = max(1, len(ln) // sample)
        for k in range(0, len(ln) - 1, step):
            d = _pt_seg_dist(pt[0], pt[1], ln[k][0], ln[k][1], ln[k + 1][0], ln[k + 1][1])
            if d < best:
                best = d
    return best


def infer_basins(grouped, bbox_map, tol_km=60.0):
    """按「河口端点落在哪条河上」逐级上溯，推断每条河的干流归属。

    源数据的 GBCODE 字段不可用（见 TRUNK_NAMES 处注释），故改用几何拓扑：
    对每条河取所有线段端点，找「端点落在其上」且最近的那条等级更高的河作为父河，
    再沿父链一路上溯到一级干流，即为该河的干流归属。
    父河判定失败（河口悬空 / 出境河）时留空 —— 这是正确行为，不硬凑。

    比「找最近的干流」更准：赣江不会因为靠近长江某段而误判，渭河也能经
    渭河 -> 黄河两级上溯正确归入黄河。
    """
    meta_bbox = {k: v for k, v in bbox_map.items()}
    len_km_cache = {k: _len_km_all(v) for k, v in grouped.items()}
    TOL_DEG = tol_km / 111.0 + 0.02
    trunk_names = {k[0] for k in grouped if k[1] == 1}
    parent_of = {}
    out = {}
    # 按等级从高到低处理：算某河时，所有比它高级的河的归属都已就绪
    for (name, lv) in sorted(grouped.keys(), key=lambda k: k[1]):
        if lv == LEVEL_CANAL:
            out[(name, lv)] = ""      # 人工运河：不参与天然水系归属
            continue
        if lv == 1:
            out[(name, lv)] = name
            continue
        lines = grouped[(name, lv)]
        ends = []
        for ln in lines:
            ends.append(ln[0])
            ends.append(ln[-1])

        # 最近的、等级更高的河（同级不互认，避免互相成环）
        # 先用包围盒粗筛掉不可能的候选，再精算距离：否则 1678x1678 次几何比较过慢
        parent, parent_d, parent_rank = None, float("inf"), None
        eb = [min(e[0] for e in ends), min(e[1] for e in ends),
              max(e[0] for e in ends), max(e[1] for e in ends)]
        for (pname, plv), plines in grouped.items():
            # 父河必须严格更高级（等级数字更小）。
            # 曾试过允许同级互认（为的是「嫩江->第二松花江->松花江」这条链），
            # 但同级互认会成环且结果依赖字典顺序：实测无归属从 674 涨到 990、
            # 汉江丢失长江归属。改为「严格更高级 + 端点落在父河上」即可覆盖那条链：
            # 嫩江的端点直接落在松花江上，不必经第二松花江中转。
            if plv >= lv:
                continue
            bb = meta_bbox[(pname, plv)]
            # 两个包围盒的间距超过阈值即不可能是父河
            gap = max(bb[0] - eb[2], eb[0] - bb[2], bb[1] - eb[3], eb[1] - bb[3])
            if gap > TOL_DEG:
                continue
            d = min(_min_dist_to_lines(e, plines) for e in ends)
            # 择优规则（顺序即优先级）：
            #   1) 距离更近
            #   2) 等级更高级（数字更小）
            #   3) 河更长（同一河口常常同时连着干流和支流，如嫩江既接第二松花江也接松花江，
            #      此时应认更长的松花江为父河）
            #   4) 名称序（保证结果稳定可复现，不依赖字典遍历顺序）
            rank = (d, plv, -len_km_cache.get((pname, plv), 0.0), pname)
            if parent is None or rank < parent_rank:
                parent_d, parent, parent_rank = d, pname, rank
        if parent is None or parent_d * 111.0 > tol_km:
            out[(name, lv)] = ""          # 找不到入汇干流（出境河 / 河口悬空）
            continue

        # 沿 parent_of 链一路上溯到一级干流（parent_of 记的是「直接父河」，
        # 逐级跳而不是直接取最终归属，才能处理嫩江->第二松花江->松花江->黑龙江 这种多级链）
        cur, visited = parent, {name}
        while cur not in trunk_names and len(visited) < 12:
            if cur in visited:          # 同级互认可能成环，遇到已访问就停
                break
            visited.add(cur)
            nxt = parent_of.get(cur)
            if not nxt:
                break
            cur = nxt
        out[(name, lv)] = cur if cur in trunk_names else ""
        # 记录「直接父河」而非最终归属，上溯时才能一级一级往上跳
        parent_of[name] = parent
    return out

def _len_km(line):
    """折线球面长度（km），按 1 度纬度 ≈ 111.32 km 近似。"""
    import math
    s = 0.0
    for k in range(1, len(line)):
        dx = (line[k][0] - line[k - 1][0]) * 111.32 * math.cos(math.radians((line[k][1] + line[k - 1][1]) / 2))
        dy = (line[k][1] - line[k - 1][1]) * 111.32
        s += (dx * dx + dy * dy) ** 0.5
    return s


def _span_km(bbox):
    """东西向跨度（km），用来反映一条河横跨的范围。"""
    import math
    midlat = (bbox[1] + bbox[3]) / 2.0
    return round((bbox[2] - bbox[0]) * 111.32 * math.cos(math.radians(midlat)), 0)


def _len_km_all(lines):
    return sum(_len_km(l) for l in lines)


def build_water():
    """R12P -> 水域面 GeoJSON。

    有名字的按名合并（鄱阳湖 88 片、洞庭湖 16 片 -> 各 1 条要素，弹窗点哪片都同一个），
    面积取源 AREA 字段。该字段单位是「万 km²」（青海湖 0.449 -> 4490 km²、
    太湖 0.224 -> 2240、洪泽湖 0.197 -> 1970，与实测一致），故乘 10000 还原。
    注意 R12P 的 GBCODE 不可靠（青海湖被标成 23010 长江水系，实际属内流区），
    因此水系一栏留空，只在河流（R12/R4/R5）上使用 GBCODE。
    无名的 693 个面（多为双线河河段/小湖库）保持逐个要素。
    """
    _init_pinyin()
    path = os.path.join(SRC, "R12P")
    tr = make_transformer(path + ".prj")
    rd = shapefile.Reader(path, encoding="gbk", encodingErrors="replace")
    recs = rd.records()
    shapes = rd.shapes()

    # (名称 or None) -> {polys, area, lv, gb}
    buckets = collections.OrderedDict()
    for i, rec in enumerate(recs):
        sh = shapes[i]
        rings = sh.parts or [0]
        bounds = list(rings) + [len(sh.points)]
        polys = []
        for a, b in zip(bounds[:-1], bounds[1:]):
            seg = sh.points[a:b]
            if len(seg) < 3:
                continue
            ring = simplify_line(round_line([list(shp_to_gcj(tr, px, py)) for px, py in seg]), SIMPLIFY_TOL)
            if len(ring) < 3:
                continue
            if ring[0] != ring[-1]:
                ring.append(ring[0])
            polys.append(ring)
        if not polys:
            continue
        nm = clean_name(rec["NAME"])
        key = nm if nm else ("__anon_%d" % i)
        b = buckets.setdefault(key, {"polys": [], "area": 0.0, "lv": 0})
        b["polys"].extend(polys)
        a_raw = rec["AREA"]
        b["area"] += float(a_raw) * 10000.0 if a_raw not in (None, "") else 0.0
        # 湖库等级取该组内最大值（0 无属性 / 1 特大型 / 2 大型 / 3 中型 / 4 小型）
        lv = rec["LEVEL_LAKE"]
        lv = int(lv) if lv not in (None, "") else 0
        if lv > b["lv"]:
            b["lv"] = lv

    feats = []
    for key, b in buckets.items():
        polys = b["polys"]
        xs = [q[0] for p in polys for q in p]
        ys = [q[1] for p in polys for q in p]
        cx, cy = sum(xs) / len(xs), sum(ys) / len(ys)
        feats.append({
            "type": "Feature",
            "properties": {
                "fid": "water_%s" % key,
                "name": key if not key.startswith("__anon_") else "未命名水域",
                "named": 1 if (not key.startswith("__anon_")) else 0,
                "lakeLevel": b["lv"],
                "lakeLevelText": LAKE_LEVEL_TEXT.get(b["lv"], ""),
                "areaKm2": round(b["area"], 0),
                "partCount": len(polys),
                "lng": round(cx, 5),
                "lat": round(cy, 5),
                "bbox": [round(min(xs), 4), round(min(ys), 4), round(max(xs), 4), round(max(ys), 4)],
            },
            "geometry": {"type": "MultiPolygon", "coordinates": [[p] for p in polys]},
        })
    return {"type": "FeatureCollection", "features": feats}


def _ring_area(ring):
    import math
    s = 0.0
    for k in range(len(ring) - 1):
        x1, y1 = ring[k][0] * math.cos(math.radians(ring[k][1])), ring[k][1]
        x2, y2 = ring[k + 1][0] * math.cos(math.radians(ring[k + 1][1])), ring[k + 1][1]
        s += x1 * y2 - x2 * y1
    return s / 2.0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="只校验不写文件")
    args = ap.parse_args()

    fc, counts = build_rivers()
    lv = collections.Counter(f["properties"]["level"] for f in fc["features"])
    names = collections.Counter(f["properties"]["name"] for f in fc["features"])
    print("原始段数：", counts)
    print("输出要素：", len(fc["features"]), "  分级分布：", dict(sorted(lv.items())))
    print("独立河名数：", len(names))
    for key in ["渭河", "汾河", "汉江", "黄河", "长江", "嫩江", "乌苏里江", "牡丹江", "滦河", "鸭绿江"]:
        print("  %s -> %d 段" % (key, names.get(key, 0)))

    if args.check:
        return

    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "rivers.json"), "w", encoding="utf-8") as fp:
        json.dump(fc, fp, ensure_ascii=False, separators=(",", ":"))
    wfc = build_water()
    with open(os.path.join(OUT, "water-areas.json"), "w", encoding="utf-8") as fp:
        json.dump(wfc, fp, ensure_ascii=False, separators=(",", ":"))
    print("已写出：", OUT)


if __name__ == "__main__":
    main()
