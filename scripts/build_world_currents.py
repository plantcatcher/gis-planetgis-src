#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""全球洋流互动地图 · 数据构建（需受管 venv：shapely 避陆）
   运行：C:/Users/ZhuanZ/.workbuddy/binaries/python/envs/default/bin/python scripts/build_world_currents.py

产出 public/maps/world-currents/：
  data/currents.json   32 条主要洋流路径（LineString）
  data/upwelling.json  6 个沿岸上升流区（Point）
  data/stats.json      汇总统计口径

坐标系：WGS84（EPSG:4326）。洋流路径为示意性轴线（手绘于 1:1000 万海洋底图），
相邻点经度差均 < 60°，反子午线处不跳变。前端 app.js 会为每条洋流生成
±360° 的三份副本，保证 renderWorldCopies（世界副本）下无论底图怎么左右滑动，
太平洋等跨经线洋流与标注都完整显示。

路径与属性依据 NOAA Ocean Service / Encyclopaedia Britannica「Ocean current」/
通用海洋学教科书的常用描述整理；输送量（Sv）与流速为文献常用约数，不同研究
差异较大，图中只作量级参考，不作精确统计。
"""

import json
import math
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "maps", "world-currents", "data")
os.makedirs(OUT, exist_ok=True)

R_EARTH = 6371.0088


def haversine(a, b):
    """a/b = [lng, lat] 度。返回 km。"""
    lo1, la1, lo2, la2 = map(math.radians, [a[0], a[1], b[0], b[1]])
    h = (math.sin((la2 - la1) / 2) ** 2
         + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2)
    return 2 * R_EARTH * math.asin(min(1.0, math.sqrt(h)))


def path_km(coords):
    return sum(haversine(coords[i - 1], coords[i]) for i in range(1, len(coords)))


# ── 平滑 + 避陆（shapely） ─────────────────────────────────────────────────
# 板牙方法（2026-10-22）：洋流必须绕开陆地。流程：
#   ① Catmull-Rom 样条重采样（线条柔美化，替代生硬折线）；
#   ② 逐点与全球国家矢量（truesize/countries.geojson，176 国）求交，
#      落陆点用 nearest_points 求最近海岸，沿入射方向外推 PUSH_DELTA 度出海；
#   ③ 再平滑一次收尾 + 抽稀。迭代 ITER 轮收敛。
LAND_SRC = os.path.join(ROOT, "public", "maps", "truesize", "data", "countries.geojson")
PUSH_DELTA = 0.4    # 推出海岸外的距离（度，约 40km）
SMOOTH_STEP = 0.35  # 平滑重采样步长（度）：加密 → 折线更柔
MIN_GAP = 0.18      # 抽稀阈值（度）
ITER = 8

_land_tree = None
_land_geoms = None

def _load_land():
    global _land_tree, _land_geoms
    if _land_tree is not None:
        return
    from shapely.geometry import shape
    from shapely.strtree import STRtree
    with open(LAND_SRC, "r", encoding="utf-8") as f:
        fc = json.load(f)
    _land_geoms = [shape(ft["geometry"]) for ft in fc["features"]]
    _land_tree = STRtree(_land_geoms)

def _unwrap(coords):
    out = [list(coords[0])]; off = 0.0
    for i in range(1, len(coords)):
        d = coords[i][0] - coords[i - 1][0]
        if d > 180: off -= 360
        elif d < -180: off += 360
        out.append([coords[i][0] + off, coords[i][1]])
    return out

def _wrap_lng(lng):
    # 只绕回超出 [-180,180] 的值；180 本身保持 180。
    # 曾踩坑：ACC 末点恰为 180，用 ((x+180)%360)-180 会变成 -180，
    # 与倒数第二点（179.87）差 -359.87°，前端 splitSegments 判定跨线，
    # 拆出单点段 → resample 访问 coords[1] 直接崩。
    while lng > 180: lng -= 360
    while lng < -180: lng += 360
    return lng

def catmull_rom(coords, step=SMOOTH_STEP):
    """Catmull-Rom 样条重采样（经纬度空间，段内按跨度动态取样本数）"""
    if len(coords) < 3:
        return [list(c) for c in coords]
    ext = [coords[0]] + coords + [coords[-1]]
    out = []
    for i in range(1, len(coords)):
        p0, p1, p2, p3 = ext[i - 1], ext[i], ext[i + 1], ext[i + 2]
        span = max(abs(p2[0] - p1[0]), abs(p2[1] - p1[1]))
        n = max(2, int(span / step) + 1)
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t +
                       (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
                       (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t +
                       (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
                       (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            out.append([x, y])
    out.append(list(coords[-1]))
    return out

def avoid_land(coords, delta=PUSH_DELTA, iters=ITER):
    """把落在陆地多边形内（含压在海岸线上）的点推到离岸 delta 度。
    深陆点：沿「点→最近海岸」方向外推 L+delta，一轮即出海；
    压线点：nearest_points 会返回自身（L=0），改用海岸局部切向的法线，
    按 representative_point 判定朝外一侧推出。"""
    from shapely.geometry import Point
    from shapely.ops import nearest_points
    _load_land()
    pts = [list(c) for c in coords]
    for _ in range(iters):
        moved = False
        for i, p in enumerate(pts):
            # ⚠️ 查询必须 wrap 回 [-180,180]：unwrapped 经度（如跨线段的 -212°）
            # 与 [-180,180] 的国家几何 bbox 永不命中，会整段逃逸避开陆（曾踩过）
            w = _wrap_lng(p[0]); off = p[0] - w
            pt = Point(w, p[1])
            for gi in _land_tree.query(pt):
                g = _land_geoms[gi]
                if not g.covers(pt):
                    continue
                q = nearest_points(pt, g.boundary)[1]   # 海岸上离该点最近的点
                dx, dy = q.x - w, q.y - p[1]
                L = math.hypot(dx, dy)
                if L > 1e-9:
                    pts[i] = [w + dx / L * (L + delta) + off, p[1] + dy / L * (L + delta)]
                else:
                    # 压线：海岸切向 ±0.05 长度估法向，representative_point 定朝外
                    bd = g.boundary
                    proj = bd.project(pt)
                    a = bd.interpolate(max(0.0, proj - 0.05))
                    b = bd.interpolate(min(bd.length, proj + 0.05))
                    vx, vy = b.x - a.x, b.y - a.y
                    Lv = math.hypot(vx, vy)
                    if Lv < 1e-9:
                        break
                    nx, ny = -vy / Lv, vx / Lv
                    rp = g.representative_point()
                    if (rp.x - w) * nx + (rp.y - p[1]) * ny > 0:
                        nx, ny = -nx, -ny
                    pts[i] = [w + nx * delta + off, p[1] + ny * delta]
                moved = True
                break
        if not moved:
            break
    return pts

def _covers_any(lng, lat):
    """该点是否落在任一国家多边形内"""
    from shapely.geometry import Point
    _load_land()
    pt = Point(lng, lat)
    for gi in _land_tree.query(pt):
        if _land_geoms[gi].covers(pt):
            return True
    return False

def sweep_offshore(coords, max_r=2.0, step=0.2):
    """兜底扫描：avoid_land 多轮后仍落陆的浅陆点（多国交界带、曲折海岸），
    沿 12 个方向 × max_r 半径找距离最近的海上点。经度步长按 cos(lat) 折算成近圆扫描。"""
    pts = [list(c) for c in coords]
    n_step = int(max_r / step)
    for i, p in enumerate(pts):
        w = _wrap_lng(p[0]); off = p[0] - w
        if not _covers_any(w, p[1]):
            continue
        clat = math.cos(math.radians(p[1])) or 0.01
        best, bd = None, 1e9
        for k in range(12):
            ang = k * 30 * math.pi / 180
            for j in range(1, n_step + 1):
                r = step * j
                x = w + r * math.cos(ang) / clat
                y = p[1] + r * math.sin(ang)
                if not _covers_any(x, y):
                    if r < bd:
                        bd = r; best = (x, y)
                    break
        if best:
            pts[i] = [best[0] + off, best[1]]
    return pts

def decimate(pts, gap=MIN_GAP):
    """抽稀：相邻点小于 gap 度则合并（平滑+避陆会加密采样点）"""
    out = []
    for p in pts:
        if out and abs(p[0] - out[-1][0]) < gap and abs(p[1] - out[-1][1]) < gap:
            continue
        out.append(p)
    if len(out) >= 2 and abs(out[-1][0] - out[-2][0]) < gap * 0.5 and abs(out[-1][1] - out[-2][1]) < gap * 0.5:
        out.pop()
    return out

def chaikin(coords, iters=1):
    """Chaikin 角点圆化：把折线的尖角切成圆弧，线条更柔（比单纯 Catmull-Rom 更能
        消除手绘控制点的尖角）。必须在 unwrapped 连续坐标上做——avoid_land 之前已
        unwrap，不会在反子午线处跨线插值出错误点。"""
    pts = [list(c) for c in coords]
    for _ in range(iters):
        if len(pts) < 3:
            break
        nw = []
        for i in range(len(pts) - 1):
            a, b = pts[i], pts[i + 1]
            nw.append([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]])
            nw.append([0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]])
        pts = nw
    return pts

def finalize_coords(coords):
    """圆手绘尖角 → 密化平滑 → 避陆 → 圆避陆折角 → 再避陆 → 兜底 → 抽稀 → wrap 回 [-180,180]"""
    pts = _unwrap(coords)
    pts = chaikin(pts, 2)                          # 先圆手绘尖角（洋流不再生硬）
    pts = catmull_rom(pts, step=SMOOTH_STEP)        # 再密化 + 平滑
    pts = avoid_land(pts)
    pts = chaikin(pts, 1)                          # 圆避陆产生的折角
    pts = avoid_land(pts)
    pts = sweep_offshore(pts)                       # 兜底：扫到最近海上点
    pts = decimate(pts, gap=MIN_GAP)
    return [[_wrap_lng(x), y] for x, y in pts]


# ── 洋流路径（手绘示意轴线） ──────────────────────────────────────────────
# 字段：id / name / en / type(warm|cold) / ocean / flow / speed /
#       from / to / desc / season(all|winter|summer)
CURRENTS = [
    # ── 太平洋 ────────────────────────────────────────────────
    dict(id="nec-p", name="北赤道暖流", en="North Equatorial Current", type="warm", ocean="pacific",
         flow="约 15 Sv", speed="0.2–0.5 m/s",
         frm="中美洲西岸外海", to="菲律宾以东海域",
         desc="受东北信风驱动，沿北纬 10°–20° 自东向西横贯太平洋，是黑潮的源头。到菲律宾以东后分为两支：主流北上成为黑潮，小分支南下与南赤道暖流汇合。",
         coords=[[-118, 21], [-140, 21], [-160, 21], [-175, 21], [175, 21], [160, 19], [145, 17], [136, 14], [128, 12]]),
    dict(id="sec-p", name="南赤道暖流", en="South Equatorial Current", type="warm", ocean="pacific",
         flow="约 25 Sv", speed="0.2–0.6 m/s",
         frm="加拉帕戈斯群岛附近", to="新几内亚以北",
         desc="受东南信风驱动，沿赤道至南纬 20° 自东向西，规模比北赤道暖流更大。在新几内亚附近分成北上的黑潮源头、南下的东澳大利亚暖流与西去的印尼贯穿流。",
         coords=[[-84, -1], [-100, -2], [-115, -3], [-130, -4], [-145, -5], [-160, -7], [-175, -9], [165, -11], [155, -10], [148, -7], [142, -4]]),
    dict(id="necc-p", name="赤道逆流", en="Equatorial Countercurrent", type="warm", ocean="pacific",
         flow="数 Sv（弱流）", speed="0.1–0.3 m/s",
         frm="新几内亚以北", to="中美洲西岸外海",
         desc="夹在南北赤道暖流之间、沿北纬 4°–8° 自西向东的弱流。赤道无风带降水充沛、海水层化稳定，是信风流系里唯一反向的通道。",
         coords=[[125, 7], [140, 7], [155, 6], [170, 6], [-175, 6], [-160, 6], [-145, 6], [-130, 6], [-115, 7], [-100, 7], [-90, 6]]),
    dict(id="kuroshio", name="黑潮", en="Kuroshio Current", type="warm", ocean="pacific",
         flow="约 50 Sv（台湾以东约 21 Sv）", speed="0.5–2.0 m/s",
         frm="台湾以东海域", to="黑潮延续区（中太平洋）",
         desc="北太平洋西部边界流，北赤道暖流北上遇菲律宾后转向东北，沿台湾东岸、琉球群岛、日本南岸直切房总半岛外海，再向东成为黑潮延续区。水色深蓝、透明度高，流速快、流路稳定。",
         coords=[[122, 22], [121, 24], [122, 26], [124, 27], [126, 28], [129, 30], [131, 31], [133, 32], [136, 33], [138, 34], [140, 35], [142, 35], [145, 35], [149, 35], [154, 34], [160, 34], [166, 34], [172, 35], [178, 35], [-174, 36], [-170, 38], [-166, 39]]),
    dict(id="oyashio", name="亲潮", en="Oyashio Current", type="cold", ocean="pacific",
         flow="数 Sv", speed="0.3–0.8 m/s",
         frm="白令海与堪察加近海", to="北海道以东（与黑潮交汇）",
         desc="千岛寒流，沿千岛群岛自北向南，携亚寒带冷水与营养盐。在北海道以东与黑潮交汇，寒暖流相遇使海水搅动、浮游生物繁盛，形成北海道渔场。",
         coords=[[163, 54], [160, 51], [156, 48], [153, 46], [149, 44], [146, 42], [143, 40], [141, 38]]),
    dict(id="npc", name="北太平洋暖流", en="North Pacific Current", type="warm", ocean="pacific",
         flow="约 30 Sv", speed="0.2–0.5 m/s",
         frm="黑潮延续区", to="北美西岸外海",
         desc="黑潮延续到中太平洋后受西风驱动转向东，横贯北纬 38°–42°，是北太平洋中部的主干流。到北美外海后分为南下的加利福尼亚寒流与北上的阿拉斯加暖流。",
         coords=[[-166, 39], [-155, 40], [-145, 40], [-138, 40], [-132, 41], [-128, 42]]),
    dict(id="california", name="加利福尼亚寒流", en="California Current", type="cold", ocean="pacific",
         flow="约 4 Sv", speed="0.2–0.4 m/s",
         frm="北美温哥华外海", to="下加利福尼亚半岛附近",
         desc="东边界流，沿北美西岸自北向南。离岸的西北风驱动沿岸上升流，深层营养盐上涌，支撑了加州沿岸的沙丁鱼与鳀鱼渔业，也带来旧金山夏季的浓雾。",
         coords=[[-124.3, 46.3], [-124, 43], [-122, 40], [-120, 36], [-118, 33], [-117, 30], [-115, 26], [-114, 22]]),
    dict(id="alaska", name="阿拉斯加暖流", en="Alaska Current", type="warm", ocean="pacific",
         flow="约 10 Sv", speed="0.3–0.6 m/s",
         frm="北太平洋暖流北支", to="阿拉斯加湾深处",
         desc="北太平洋暖流向北的分支，沿阿拉斯加湾北上。暖水使阿拉斯加湾冬季不冻，也给东南阿拉斯加带来丰沛降水。",
         coords=[[-136, 48], [-142, 52], [-148, 56], [-152, 58]]),
    dict(id="eac", name="东澳大利亚暖流", en="East Australian Current", type="warm", ocean="pacific",
         flow="约 10 Sv", speed="0.3–0.8 m/s",
         frm="珊瑚海", to="塔斯曼海（新西兰以北）",
         desc="南赤道暖流南下沿澳大利亚东岸流动的西边界流，规模远小于黑潮与湾流，但在大堡礁外海折出的暖涡（eddy）会把热带海水输送到高纬度，影响新西兰气候。",
         coords=[[152.8, -18], [153.3, -22], [153.5, -27], [153.0, -32], [151.6, -35], [150.8, -38]]),
    dict(id="humboldt", name="秘鲁寒流", en="Humboldt / Peru Current", type="cold", ocean="pacific",
         flow="约 15 Sv", speed="0.2–0.5 m/s",
         frm="智利南部近海", to="赤道东太平洋",
         desc="南太平洋东边界流，沿南美西岸自南向北。东南信风离岸吹拂形成强劲上升流，深层富营养水涌升，曾支撑全球最大的秘鲁鳀鱼渔场。厄尔尼诺年上升流减弱、鱼群消失，是该流最著名的生态信号。",
         coords=[[-74, -42], [-75, -38], [-76, -33], [-77, -28], [-78, -23], [-79, -18], [-80, -13], [-81, -8], [-81, -4]]),
    dict(id="acc", name="西风漂流", en="Antarctic Circumpolar Current", type="cold", ocean="southern",
         flow="110–145 Sv", speed="0.2–0.6 m/s",
         frm="德雷克海峡以东（绕南极一圈）", to="回到德雷克海峡",
         desc="南极环流，全球最长、输送量最大的洋流，绕南极自西向东一圈。没有陆地阻挡，占全球大洋输送量的一半以上，超过所有河流入海径流总和的 100 倍。它把南极冷水锁在南大洋，是地球气候系统的「热隔离带」。",
         coords=[[-180, -57], [-160, -57], [-140, -58], [-120, -59], [-100, -58], [-80, -58], [-60, -57], [-40, -56], [-20, -56], [0, -55], [20, -55], [40, -55], [60, -56], [80, -56], [100, -57], [120, -57], [140, -57], [160, -57], [180, -57]]),
    dict(id="polar-drift", name="极地东风漂流", en="East Wind Drift", type="cold", ocean="southern",
         flow="数 Sv", speed="0.1–0.3 m/s",
         frm="南极大陆近海（绕极）", to="回到威德尔海一侧",
         desc="南极沿岸受极地东风驱动自东向西的环流，靠近大陆架冰架，携带海冰与低温水，与外侧的西风漂流之间是著名的南极辐散带——深层冷水在此上涌。",
         coords=[[170, -67], [150, -68], [120, -68], [90, -67], [60, -67], [30, -66], [0, -66], [-30, -66], [-60, -67], [-90, -67], [-120, -68], [-150, -68], [-170, -67], [-180, -66]]),

    # ── 大西洋 ────────────────────────────────────────────────
    dict(id="nec-a", name="北赤道暖流", en="North Equatorial Current", type="warm", ocean="atlantic",
         flow="约 15 Sv", speed="0.2–0.5 m/s",
         frm="加那利群岛外海", to="加勒比海",
         desc="大西洋信风流系，自非洲西北岸向西横贯热带大西洋进入加勒比海，与南赤道暖流汇合后成为湾流的源头。",
         coords=[[-22, 22], [-32, 20], [-42, 18], [-52, 16], [-60, 14], [-68, 12], [-75, 11], [-80, 10]]),
    dict(id="sec-a", name="南赤道暖流", en="South Equatorial Current", type="warm", ocean="atlantic",
         flow="约 10 Sv", speed="0.2–0.5 m/s",
         frm="几内亚湾外海", to="巴西东部近海",
         desc="沿赤道至南纬 5° 自东向西，受东南信风驱动。部分海水越过赤道加入北赤道暖流，部分沿南美东岸南下成为巴西暖流。",
         coords=[[-8, -1], [-18, -2], [-28, -3], [-35, -5], [-38, -6.5], [-42, -5], [-50, -2], [-52, 0], [-46, 3], [-38, 3]]),
    dict(id="necc-a", name="赤道逆流", en="Equatorial Countercurrent", type="warm", ocean="atlantic",
         flow="数 Sv（弱流）", speed="0.1–0.3 m/s",
         frm="巴西罗卡斯岛附近", to="几内亚湾",
         desc="大西洋赤道无风带内自西向东的弱流，规模小于太平洋的同名洋流，在非洲近海与加那利寒流南端相接。",
         coords=[[-52, 4], [-42, 4], [-32, 4], [-22, 4], [-12, 4]]),
    dict(id="gulf-stream", name="湾流", en="Gulf Stream", type="warm", ocean="atlantic",
         flow="约 30 Sv", speed="0.5–2.5 m/s",
         frm="佛罗里达海峡", to="纽芬兰东南大滩",
         desc="全球最著名的暖流，加勒比海的暖水经佛罗里达海峡以每天上百公里的速度沿北美东岸北上，宽度数十公里、深达数百米。到哈特拉斯角后转向东北入大西洋。它把热带海水的热量带到高纬度，西北欧冬季因此港口不冻。",
         coords=[[-80, 25], [-80.5, 27], [-79.5, 30], [-79, 32], [-77, 34], [-75, 35], [-73, 37], [-70, 39], [-68, 40], [-65, 41], [-60, 42], [-56, 43], [-52, 44], [-49, 45], [-46, 46], [-43, 47], [-41, 48]]),
    dict(id="nadr", name="北大西洋暖流", en="North Atlantic Drift", type="warm", ocean="atlantic",
         flow="约 25 Sv", speed="0.3–0.8 m/s",
         frm="纽芬兰大滩外海", to="挪威海",
         desc="湾流的延续，流向东北并扇形铺开。它给西欧与北欧带去大量热量：同纬度对比，利物浦冬季平均气温比纽芬兰高 10°C 以上。其分支之一继续北上成为挪威暖流。",
         coords=[[-41, 48], [-38, 50], [-34, 52], [-30, 54], [-26, 56], [-22, 57], [-18, 58], [-14, 59], [-10, 60], [-7, 61], [-5, 62]]),
    dict(id="norwegian", name="挪威暖流", en="Norwegian Atlantic Current", type="warm", ocean="atlantic",
         flow="约 5 Sv", speed="0.2–0.5 m/s",
         frm="冰岛以南", to="巴伦支海",
         desc="北大西洋暖流的北支，沿挪威海岸北上进入北冰洋的巴伦支海，是北冰洋唯一的大西洋暖水入口，使挪威北角（北纬 71°）冬季港口不冻。",
         coords=[[-5, 62], [0, 63], [4, 65], [8, 67], [12, 69], [16, 71]]),
    dict(id="canary", name="加那利寒流", en="Canary Current", type="cold", ocean="atlantic",
         flow="约 5 Sv", speed="0.2–0.4 m/s",
         frm="伊比利亚半岛外海", to="佛得角附近",
         desc="北大西洋暖流南下的东边界分支，沿非洲西北岸流动。东北信风离岸分量驱动上升流，带来加那利渔场；冷水上也使撒哈拉西岸的夏季气温明显低于同纬度内陆。",
         coords=[[-9.5, 39.5], [-11, 36], [-12.5, 32], [-13.5, 28], [-15, 24], [-16.5, 21], [-18, 18], [-20, 15]]),
    dict(id="labrador", name="拉布拉多寒流", en="Labrador Current", type="cold", ocean="atlantic",
         flow="约 8 Sv", speed="0.3–0.7 m/s",
         frm="戴维斯海峡", to="纽芬兰大滩",
         desc="沿拉布拉多半岛与纽芬兰自北向南，携北极冷水与冰山（泰坦尼克号事故海域正值此流与湾流交汇处）。寒暖流在纽芬兰大滩相遇，海水搅动、饵料富集，形成著名渔场。",
         coords=[[-58, 60], [-56, 57], [-54, 54], [-53, 51], [-53, 48], [-52, 45], [-52, 42]]),
    dict(id="brazil", name="巴西暖流", en="Brazil Current", type="warm", ocean="atlantic",
         flow="约 4 Sv", speed="0.2–0.6 m/s",
         frm="南赤道暖流南支", to="拉普拉塔河外海",
         desc="沿南美东岸自北向南的西边界流，规模不大。在阿根廷近海与北上的福克兰寒流相遇，形成南大西洋西部的强交汇区。",
         coords=[[-38, -13], [-39, -18], [-41, -23], [-43, -27], [-46, -31], [-50, -34], [-53, -36]]),
    dict(id="benguela", name="本格拉寒流", en="Benguela Current", type="cold", ocean="atlantic",
         flow="约 20 Sv", speed="0.2–0.5 m/s",
         frm="南非厄加勒斯角外海", to="安哥拉近海",
         desc="南大西洋东边界流，沿非洲西南岸自南向北。强劲的东南信风离岸分量形成上升流，深层富营养水上涌，是纳米比亚沿岸沙丁鱼渔场的生命线。本格拉流北上过程中与厄加勒斯暖流在非洲之角附近「擦肩」，构成著名的 Agulhas 回流系统。",
         coords=[[12.5, -32], [13, -29], [13.5, -25], [12.5, -21], [12.2, -17], [13, -13], [14, -9]]),
    dict(id="falkland", name="福克兰寒流", en="Falkland / Malvinas Current", type="cold", ocean="atlantic",
         flow="约 8 Sv", speed="0.3–0.6 m/s",
         frm="德雷克海峡北口", to="拉普拉塔河外海",
         desc="西风漂流经德雷克海峡北上的一支，沿阿根廷大陆架自南向北，水温低、含冰。与巴西暖流在阿根廷近海对峙，交汇线随季节南北摆动。",
         coords=[[-62, -50], [-60, -46], [-58, -42], [-57, -38]]),
    dict(id="east-greenland", name="东格陵兰寒流", en="East Greenland Current", type="cold", ocean="atlantic",
         flow="约 5 Sv", speed="0.3–0.7 m/s",
         frm="弗拉姆海峡（格陵兰东）", to="丹麦海峡",
         desc="沿格陵兰东岸自北向南，携北极冷水与海冰穿过丹麦海峡南下，是北冰洋向大西洋输出冷水与淡水的主通道，直接影响北大西洋深层水的形成。",
         coords=[[-20, 73], [-24, 70], [-30, 66], [-34, 63], [-38, 60]]),

    # ── 印度洋 ────────────────────────────────────────────────
    dict(id="sec-i", name="南赤道暖流", en="South Equatorial Current", type="warm", ocean="indian",
         flow="约 20 Sv", speed="0.2–0.5 m/s",
         frm="澳大利亚西北近海", to="马达加斯加东岸",
         desc="印度洋信风流系，沿南纬 10°–15° 自东向西。受季风调制，流向与流速随季节摆动。到马达加斯加后分为北上的莫桑比克暖流与南下的厄加勒斯暖流源头。",
         coords=[[112, -16], [100, -15], [88, -14], [76, -14], [64, -14], [54, -14], [47, -13], [45, -11.5]]),
    dict(id="mozambique", name="莫桑比克暖流", en="Mozambique Current", type="warm", ocean="indian",
         flow="约 8 Sv", speed="0.3–0.8 m/s",
         frm="莫桑比克海峡北口", to="厄加勒斯暖流起点",
         desc="南赤道暖流北支，沿莫桑比克海岸南下穿过海峡。海峡狭管效应使流速加快，把热带暖水送往非洲南端。",
         coords=[[40.5, -14.5], [40, -16], [38, -18], [36.5, -19.5], [35, -21], [34, -23], [33.5, -24.5], [33, -25.5]]),
    dict(id="agulhas", name="厄加勒斯暖流", en="Agulhas Current", type="warm", ocean="indian",
         flow="约 65 Sv", speed="1.0–2.5 m/s",
         frm="莫桑比克近海", to="非洲最南端（折返）",
         desc="印度洋西边界流，沿非洲东南岸南下，流速在全球边界流中名列前茅。到厄加勒斯角后受西风漂流阻挡，大部分折返印度洋，少量以「厄加勒斯泄漏」形式把印度洋暖水注入南大西洋——全球洋流翻转的关键一环。",
         coords=[[33, -24], [33, -27], [32, -30], [30, -32], [27, -34], [24, -35], [20, -35]]),
    dict(id="west-australian", name="西澳大利亚寒流", en="West Australian Current", type="cold", ocean="indian",
         flow="约 5 Sv", speed="0.2–0.4 m/s",
         frm="澳大利亚西北角", to="珀斯以西近海",
         desc="南赤道暖流沿澳大利亚西岸北上的分支，流经热带荒漠海岸，水温低、蒸发弱，是西澳沿海干旱气候的一部分成因。",
         coords=[[114, -22], [114, -26], [115, -30], [115, -33]]),
    dict(id="monsoon-w", name="东北季风洋流", en="Winter Monsoon Current", type="warm", ocean="indian",
         flow="数 Sv（季节流）", speed="0.2–0.5 m/s",
         frm="孟加拉湾东岸", to="阿拉伯海西部",
         desc="北印度洋冬季（11 月–次年 3 月）在东北季风驱动下自东向西流动，与赤道逆流方向相反。夏季同一海域整体反向。",
         season="winter",
         coords=[[95, 8], [88, 8], [84, 7], [81, 6], [80, 4.8], [78, 6], [72, 6], [65, 6], [58, 7]]),
    dict(id="monsoon-s", name="西南季风洋流", en="Summer Monsoon Current", type="warm", ocean="indian",
         flow="数 Sv（季节流）", speed="0.3–0.8 m/s",
         frm="阿拉伯海西部", to="孟加拉湾东岸",
         desc="北印度洋夏季（6 月–9 月）在西南季风驱动下自西向东流动，流速与流量都超过冬季版。北印度洋是全球唯一「冬逆夏顺」整体换向的大洋。",
         season="summer",
         coords=[[52, 8], [58, 10], [64, 12], [70, 14], [74, 15], [76, 12], [78, 9], [80, 8], [84, 10], [88, 12], [93, 12]]),
    dict(id="somali", name="索马里寒流", en="Somali Current", type="cold", ocean="indian",
         flow="约 5 Sv（夏季最强）", speed="0.5–1.5 m/s",
         frm="亚丁湾外海", to="赤道附近",
         desc="全球最反常的寒流之一：夏季西南季风把索马里沿岸表层水吹离海岸，深层冷水上涌，形成沿索马里海岸向西南的寒流；冬季则转为暖流。它给干旱的索马里海岸带去难得的上升流营养盐。",
         season="summer",
         coords=[[51, 10], [50, 6], [47, 3], [44, 1]]),

    # ── 北冰洋 ────────────────────────────────────────────────
    dict(id="transpolar", name="穿极流", en="Transpolar Drift", type="cold", ocean="arctic",
         flow="数 Sv", speed="0.05–0.2 m/s",
         frm="东西伯利亚海", to="弗拉姆海峡（格陵兰）",
         desc="北冰洋表层水从西伯利亚陆架穿过北极点流向弗拉姆海峡，把亚欧大陆的淡水与海冰输往大西洋。它是核动力破冰船航行与北极科学考察最熟悉的通道，也是北冰洋物质输运的主干线。",
         coords=[[140, 78], [110, 82], [70, 85], [30, 85], [0, 83], [-20, 81]]),
]

# ── 沿岸上升流区（离岸风 → 深层营养盐上涌 → 大渔场） ─────────────────────
UPWELLING = [
    dict(id="uw-peru", name="秘鲁上升流", en="Peru Upwelling", ocean="pacific",
         fishery="秘鲁鳀鱼（曾占全球鱼粉产量约 1/4）",
         desc="东南信风终年离岸吹拂，把表层暖水推离南美西岸，深层富营养盐水持续上涌。这里是全球生产力最高的上升流系统，也是厄尔尼诺现象的「震中」——增温年份上升流停摆，鳀鱼群消失、海鸟饿死。",
         lng=-78, lat=-18),
    dict(id="uw-california", name="加利福尼亚上升流", en="California Upwelling", ocean="pacific",
         fishery="沙丁鱼、鳀鱼、Dungeness 蟹",
         desc="春夏季西北风沿北美西岸离岸吹送，形成季节性上升流。冷水上涌、营养盐充沛，支撑加州沿岸高产的海洋生态，也带来夏季海雾与海鲜产业。",
         lng=-122, lat=36),
    dict(id="uw-benguela", name="本格拉上升流", en="Benguela Upwelling", ocean="atlantic",
         fishery="纳米比亚沙丁鱼、鳕鱼",
         desc="东南信风沿非洲西南岸常年离岸吹拂，深层冷水上涌不停。它是南大西洋东边界最强劲的上升流，把纳米比亚沿岸的沙漠海岸变成世界级渔场，低氧水团也周期性造成鱼类大量死亡。",
         lng=12, lat=-24),
    dict(id="uw-canary", name="加那利上升流", en="Canary Upwelling", ocean="atlantic",
         fishery="沙丁鱼、金枪鱼",
         desc="非洲西北岸的东北信风离岸分量驱动上升流，冷水沿海岸南下。它是加那利寒流的「引擎」，也给撒哈拉西岸带来渔业与海雾。",
         lng=-14, lat=24),
    dict(id="uw-somali", name="索马里上升流", en="Somali Upwelling", ocean="indian",
         fishery="金枪鱼、沙丁鱼（季节性）",
         desc="只在夏季（6–9 月）西南季风最强时出现：离岸风把表层水推向深海，沿岸出现寒流与低温带。它是北印度洋季节性最强的上升流，规模可与秘鲁系统相比。",
         season="summer",
         lng=49, lat=6),
    dict(id="uw-antarctic", name="南极辐散上升流", en="Antarctic Divergence", ocean="southern",
         fishery="南极磷虾（约 3–5 亿吨存量）",
         desc="南纬 60° 附近，极地东风驱动的东风漂流与西风驱动的西风漂流相互拉开，深层冷水沿辐散线大规模上涌。这里是南大洋生产力最高的区域，磷虾—鲸—海豹食物链的基础。",
         lng=100, lat=-63),
]

OCEAN_LABELS = {
    "pacific": "太平洋",
    "atlantic": "大西洋",
    "indian": "印度洋",
    "arctic": "北冰洋",
    "southern": "南大洋",
}


def build_currents():
    feats = []
    for c in CURRENTS:
        coords = finalize_coords(c["coords"])
        feats.append({
            "type": "Feature",
            "properties": {
                "id": c["id"], "name": c["name"], "en": c["en"],
                "type": c["type"], "ocean": c["ocean"],
                "flow": c["flow"], "speed": c["speed"],
                "from": c["frm"], "to": c["to"], "desc": c["desc"],
                "season": c.get("season", "all"),
                "lenKm": round(path_km(coords)),
            },
            "geometry": {"type": "LineString", "coordinates": coords},
        })
    return {"type": "FeatureCollection", "features": feats}


def build_upwelling():
    feats = []
    for u in UPWELLING:
        feats.append({
            "type": "Feature",
            "properties": {
                "id": u["id"], "name": u["name"], "en": u["en"],
                "ocean": u["ocean"], "fishery": u["fishery"],
                "desc": u["desc"], "season": u.get("season", "all"),
            },
            "geometry": {"type": "Point", "coordinates": [u["lng"], u["lat"]]},
        })
    return {"type": "FeatureCollection", "features": feats}


def build_stats(currents_fc, uw_fc):
    feats = currents_fc["features"]
    by_ocean, by_type = {}, {}
    for f in feats:
        p = f["properties"]
        by_ocean[p["ocean"]] = by_ocean.get(p["ocean"], 0) + 1
        by_type[p["type"]] = by_type.get(p["type"], 0) + 1
    lens = sorted(feats, key=lambda f: -f["properties"]["lenKm"])
    seasonal = [f["properties"]["name"] for f in feats if f["properties"]["season"] != "all"]
    return {
        "nCurrents": len(feats),
        "nWarm": by_type.get("warm", 0),
        "nCold": by_type.get("cold", 0),
        "byOcean": {k: by_ocean.get(k, 0) for k in ["pacific", "atlantic", "indian", "arctic", "southern"]},
        "nSeasonal": len(seasonal),
        "seasonalNames": seasonal,
        "nUpwelling": len(uw_fc["features"]),
        "longest": {"name": lens[0]["properties"]["name"], "lenKm": lens[0]["properties"]["lenKm"]},
        "top5Len": [{"name": f["properties"]["name"], "lenKm": f["properties"]["lenKm"]} for f in lens[:5]],
        "updated": "2026-10-22",
        "sourceNote": (
            "洋流路径与属性依据 NOAA Ocean Service、Encyclopaedia Britannica「Ocean current」"
            "及通用海洋学教科书的常用描述整理；路径为示意性轴线（非实测流线），"
            "输送量（Sv）与流速为文献常用约数，不同研究差异较大，仅作量级参考。"
        ),
        "complianceNote": (
            "本图为全球海洋专题，不绘制任何国界线与海岸线行政边界，"
            "不涉及领土归属表达；上升流点位均为公海渔场区。"
        ),
    }


def main():
    currents_fc = build_currents()
    uw_fc = build_upwelling()
    stats = build_stats(currents_fc, uw_fc)

    for name, obj in [("currents.json", currents_fc), ("upwelling.json", uw_fc), ("stats.json", stats)]:
        fp = os.path.join(OUT, name)
        with open(fp, "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, indent=1)
        print("WROTE", fp)

    print("洋流 %d 条（暖 %d / 寒 %d），季节流 %d 条，上升流 %d 处"
          % (stats["nCurrents"], stats["nWarm"], stats["nCold"], stats["nSeasonal"], stats["nUpwelling"]))
    print("最长：%s %.0f km" % (stats["longest"]["name"], stats["longest"]["lenKm"]))
    for t in stats["top5Len"]:
        print("  -", t["name"], round(t["lenKm"]))


if __name__ == "__main__":
    main()
