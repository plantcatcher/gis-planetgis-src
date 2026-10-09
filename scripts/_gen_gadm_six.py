# -*- coding: utf-8 -*-
"""一次性生成 6 个 GADM 4.1 国家数据包的截图与真实统计数据。

读取 D:/01 资料下载/【临时】 下 BRA/CAN/DEU/NZL/RUS/USA 的 GADM 4.1 SHP，
逐要素实算各级要素数 / 字段 / bbox / 面积，并为每个国家渲染 3 张截图：
  <slug>_map.jpg    国家一级行政区地图预览
  <slug>_files.jpg  压缩包文件清单（各级文件 / 体积 / 要素数）
  <slug>_fields.jpg 属性表字段结构（L0/L1/L2）
截图保存到 public/shots/<slug>/，统计 JSON 写到 _gadm_six_stats.json。
"""
import os, json, math
import geopandas as gpd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
from PIL import Image, ImageDraw, ImageFont

BASE = "D:/01 资料下载/【临时】"
OUT  = "D:/WorkSpace/00PlanetGIS源码/public/shots"
ROOT = "D:/WorkSpace/00PlanetGIS源码"

META = {
    "BRA": dict(name_cn="巴西",   name_en="Brazil",       capital="巴西利亚", continent="南美洲", slug="gadm41-bra-shp", code="NSH-GIS-029"),
    "CAN": dict(name_cn="加拿大", name_en="Canada",       capital="渥太华",   continent="北美洲", slug="gadm41-can-shp", code="NSH-GIS-030"),
    "DEU": dict(name_cn="德国",   name_en="Germany",      capital="柏林",     continent="欧洲",   slug="gadm41-deu-shp", code="NSH-GIS-031"),
    "NZL": dict(name_cn="新西兰", name_en="New Zealand",  capital="惠灵顿",   continent="大洋洲", slug="gadm41-nzl-shp", code="NSH-GIS-032"),
    "RUS": dict(name_cn="俄罗斯", name_en="Russia",       capital="莫斯科",   continent="横跨欧亚", slug="gadm41-rus-shp", code="NSH-GIS-033"),
    "USA": dict(name_cn="美国",   name_en="United States",capital="华盛顿",  continent="北美洲", slug="gadm41-usa-shp", code="NSH-GIS-034"),
}
LEVEL_CN = {0: "国界", 1: "一级行政区", 2: "二级行政区", 3: "三级行政区", 4: "四级行政区", 5: "五级行政区"}

# ── 寻找系统中文字体 ────────────────────────────────────────────────
def find_cjk_font():
    cands = [
        "C:/Windows/Fonts/msyh.ttc",
        "C:/Windows/Fonts/msyhbd.ttc",
        "C:/Windows/Fonts/simhei.ttf",
        "C:/Windows/Fonts/simsun.ttc",
        "C:/Windows/Fonts/SimHei.ttf",
    ]
    for c in cands:
        if os.path.exists(c):
            return c
    # 兜底：扫描 Fonts 目录
    try:
        for f in os.listdir("C:/Windows/Fonts"):
            low = f.lower()
            if low in ("msyh.ttc", "simhei.ttf", "simsun.ttc", "msyhbd.ttc"):
                return os.path.join("C:/Windows/Fonts", f)
    except Exception:
        pass
    return None

CJK = find_cjk_font()
if not CJK:
    raise SystemExit("未找到中文字体")
print("使用字体:", CJK)
FPROP = fm.FontProperties(fname=CJK)
plt.rcParams["font.family"] = FPROP.get_name()
plt.rcParams["axes.unicode_minus"] = False

def human_bytes(b):
    return f"{b/1e6:.1f} MB（{b:,} 字节）"

def nice_step(span, target=6):
    raw = span / target
    for s in (1, 2, 5, 10, 15, 20, 30, 60):
        if raw <= s:
            return s
    return 90

def shift_antimeridian(gdf):
    """bbox 跨度 >300° 视为跨反经线：把所有 x<0 的坐标 +360，保证连成一片。"""
    b = gdf.total_bounds
    if b[2] - b[0] <= 300:
        return gdf, False
    from shapely.ops import transform as shp_transform
    def sh(x, y, z=None):
        return [xi + 360 if xi < 0 else xi for xi in x], y
    g = gdf.copy()
    g["geometry"] = g.geometry.apply(lambda gm: shp_transform(sh, gm))
    return g, True

def render_map(gid, gdf_l1, info, stats):
    fig, ax = plt.subplots(figsize=(16, 12), dpi=100)
    face = "#bae6fd"; edge = "#0e7490"
    shifted = False
    if gdf_l1 is not None and len(gdf_l1):
        gdf_l1, shifted = shift_antimeridian(gdf_l1)
        gdf_l1.plot(ax=ax, facecolor=face, edgecolor=edge, linewidth=0.7)
    else:
        g0 = gpd.read_file(os.path.join(BASE, f"gadm41_{gid}_shp", f"gadm41_{gid}_0.shp"))
        g0.plot(ax=ax, facecolor=face, edgecolor=edge, linewidth=0.7)
    x0, y0, x1, y1 = [float(v) for v in (gdf_l1.total_bounds if gdf_l1 is not None and len(gdf_l1) else stats["bbox"])]
    # 等距圆柱：按中纬度修正纵横比，避免高纬国家被拉扁
    midlat = (y0 + y1) / 2
    ax.set_aspect(1.0 / max(0.15, math.cos(math.radians(midlat))))
    # 留白
    dx = (x1 - x0) * 0.06 or 1; dy = (y1 - y0) * 0.06 or 1
    ax.set_xlim(x0 - dx, x1 + dx); ax.set_ylim(y0 - dy, y1 + dy)
    # 经纬网
    sx = nice_step(x1 - x0); sy = nice_step(y1 - y0)
    xticks = [round(v, 2) for v in range(int(math.floor(x0)), int(math.ceil(x1)) + 1, sx)]
    if shifted:
        # 平移后的经度还原成 -180..180 惯例标签
        ax.set_xticks(xticks)
        ax.set_xticklabels([f"{int(t) if t <= 180 else int(t) - 360}" for t in xticks])
    else:
        ax.set_xticks(xticks)
    ax.set_yticks([round(v, 2) for v in range(int(math.floor(y0)), int(math.ceil(y1)) + 1, sy)])
    ax.grid(True, linestyle=":", color="#94a3b8", alpha=0.5, linewidth=0.8)
    ax.tick_params(labelsize=13, colors="#334155")
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    ax.spines["left"].set_color("#cbd5e1"); ax.spines["bottom"].set_color("#cbd5e1")
    # 标题
    lvl = "一级行政区 (Level 1)" if gdf_l1 is not None and len(gdf_l1) else "国界 (Level 0)"
    ax.set_title(f"GADM 4.1 · {info['name_cn']} {info['name_en']} · {lvl}",
                 fontproperties=FPROP, fontsize=26, fontweight="bold", color="#0f172a", pad=16)
    # 角标统计
    cap = (f"压缩包约 {stats['zip_mb']} MB  ·  {len(stats['levels'])} 级 Shapefile  ·  "
           f"共 {stats['total_features']:,} 个要素  ·  轮廓面积约 {stats['area_wan_km2']} 万 km²")
    fig.text(0.5, 0.03, cap, ha="center", fontproperties=FPROP, fontsize=15, color="#475569")
    out = os.path.join(OUT, info["slug"], f"{info['slug']}_map.jpg")
    fig.savefig(out, dpi=100, bbox_inches="tight", facecolor="white", pil_kwargs={"quality": 88})
    plt.close(fig)

def render_files(gid, info, stats):
    W, H = 1600, 1180
    img = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(img)
    # 标题栏
    d.rectangle([0, 0, W, 96], fill="#0e7490")
    d.text((40, 26), f"GADM 4.1 {info['name_cn']} 行政区划数据包 · 文件清单",
           font=ImageFont.truetype(CJK, 36), fill="white")
    y = 130
    d.text((40, y), f"压缩包：gadm41_{gid}_shp.zip    约 {stats['zip_mb']} MB（{stats['zip_bytes']:,} 字节）",
           font=ImageFont.truetype(CJK, 26), fill="#0f172a"); y += 44
    d.text((40, y), f"解压后共 {len(stats['levels'])} 级 Shapefile，每级含 .shp/.shx/.dbf/.prj/.cpg 共 {stats['total_files']} 个文件",
           font=ImageFont.truetype(CJK, 24), fill="#334155"); y += 30
    d.line([(40, y), (W-40, y)], fill="#cbd5e1", width=2); y += 26
    fnt = ImageFont.truetype(CJK, 24)
    for lv in stats["levels"]:
        pl = stats["per_level"][str(lv)]
        line = (f"Level {lv}  {LEVEL_CN.get(lv,'')}  —  {pl['features']:,} 个要素"
                f"    gadm41_{gid}_{lv}.{{shp,shx,dbf,prj,cpg}}")
        d.text((60, y), line, font=fnt, fill="#0f172a"); y += 42
    y += 20
    d.text((40, y), "坐标系：GCS_WGS_1984（EPSG:4326，WGS84 经纬度）；.cpg 指定 UTF-8，中文/本地名无乱码。",
           font=ImageFont.truetype(CJK, 22), fill="#475569"); y += 36
    bb = stats["bbox"]
    d.text((40, y),
           f"经纬度范围：经度 {bb[0]:.2f}°E—{bb[2]:.2f}°E，纬度 {bb[1]:.2f}°N—{bb[3]:.2f}°N",
           font=ImageFont.truetype(CJK, 22), fill="#475569"); y += 36
    d.text((40, y), f"全国轮廓面积（EPSG:6933 等面积投影实算）：约 {stats['area_wan_km2']} 万 km²",
           font=ImageFont.truetype(CJK, 22), fill="#475569")
    out = os.path.join(OUT, info["slug"], f"{info['slug']}_files.jpg")
    img.save(out, "JPEG", quality=88)

def render_fields(gid, info, stats):
    W, H = 1600, 1180
    img = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 96], fill="#0e7490")
    d.text((40, 26), f"GADM 4.1 {info['name_cn']} · 属性表字段结构（L0 / L1 / L2）",
           font=ImageFont.truetype(CJK, 34), fill="white")
    cols = [l for l in (0, 1, 2) if str(l) in stats["per_level"]]
    col_w = (W - 80) / len(cols)
    y0 = 140
    fnt_h = 24
    for i, lv in enumerate(cols):
        cx = 40 + col_w * i + 20
        pl = stats["per_level"][str(lv)]
        d.text((cx, y0), f"Level {lv}  {LEVEL_CN.get(lv,'')}（{pl['features']:,} 要素）",
               font=ImageFont.truetype(CJK, 24), fill="#0e7490")
        yy = y0 + 44
        for fld in pl["fields"]:
            d.text((cx, yy), fld, font=ImageFont.truetype(CJK, fnt_h), fill="#0f172a")
            yy += fnt_h + 10
    d.text((40, H-70), "字段逐级嵌套（GID_0→GID_1→GID_2→…），NAME_x 为英文名、NL_NAME_x 为本地名、TYPE_x/ENGTYPE_x 为类型。",
           font=ImageFont.truetype(CJK, 20), fill="#64748b")
    out = os.path.join(OUT, info["slug"], f"{info['slug']}_fields.jpg")
    img.save(out, "JPEG", quality=88)

def main():
    stats_all = {}
    for gid, info in META.items():
        print("处理", gid, info["name_cn"])
        d = os.path.join(BASE, f"gadm41_{gid}_shp")
        # 探测层级
        levels = []
        for f in os.listdir(d):
            if f.startswith(f"gadm41_{gid}_") and f.endswith(".shp"):
                lv = int(f.split("_")[-1].split(".")[0])
                levels.append(lv)
        levels.sort()
        per_level = {}
        gdf_l1 = None
        total_features = 0
        total_files = 0
        for lv in levels:
            shp = os.path.join(d, f"gadm41_{gid}_{lv}.shp")
            g = gpd.read_file(shp)
            feats = len(g)
            total_features += feats
            # 文件数（该级所有扩展名）
            base = f"gadm41_{gid}_{lv}"
            nfiles = sum(1 for x in os.listdir(d) if x.startswith(base + "."))
            total_files += nfiles
            eng = None
            if lv == 1 and "ENGTYPE_1" in g.columns:
                vc = g["ENGTYPE_1"].value_counts()
                eng = {str(k): int(v) for k, v in vc.items()}
            per_level[str(lv)] = {
                "features": feats,
                "fields": list(g.columns),
                "engtype": eng,
            }
            if lv == 1:
                gdf_l1 = g
        # bbox + area（用 L0）
        g0 = gpd.read_file(os.path.join(d, f"gadm41_{gid}_0.shp"))
        bb = [float(v) for v in g0.total_bounds]
        try:
            area_m2 = float(g0.to_crs("EPSG:6933").area.sum())
            area_wan = round(area_m2 / 1e10, 1)  # 万 km²
        except Exception:
            area_wan = None
        zipb = os.path.getsize(os.path.join(BASE, f"gadm41_{gid}_shp.zip"))
        stats = {
            "gid": gid, "levels": levels, "per_level": per_level,
            "bbox": bb, "area_wan_km2": area_wan,
            "zip_bytes": zipb, "zip_mb": round(zipb/1e6, 1),
            "total_features": total_features, "total_files": total_files,
        }
        stats_all[gid] = stats
        os.makedirs(os.path.join(OUT, info["slug"]), exist_ok=True)
        render_map(gid, gdf_l1, info, stats)
        render_files(gid, info, stats)
        render_fields(gid, info, stats)
        print(f"  → 层级 {levels}, 要素 {total_features}, 面积 {area_wan} 万km², 截图 OK")
    with open(os.path.join(ROOT, "_gadm_six_stats.json"), "w", encoding="utf-8") as fp:
        json.dump(stats_all, fp, ensure_ascii=False, indent=2)
    print("统计已写 _gadm_six_stats.json")

if __name__ == "__main__":
    main()
