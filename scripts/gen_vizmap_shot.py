# -*- coding: utf-8 -*-
"""gen_vizmap_shot.py · 用真实卫星影像瓦片拼「前后对比」封面 / 配图。

定位：与 prep_vizmap_data.py（矢量数据加工）、gen_vizmap_cover.py（矢量图渲染封面）
并列的第三条数据管线——服务于影像类互动地图（历史影像 / 时序对比）。

做法：取两个 release 的同坐标瓦片拼图，左半留旧期、右半换新期，中间压一条分界线，
      再把两个日期打成标签。全部是真实存档影像，不做任何生成式美化。

用法：
  1. 改下面 JOBS 里的 (经度, 纬度, 层级, 输出文件, 左标签, 右标签)
     —— 输出文件相对 public/maps/<slug>/，也可写绝对路径当候选图先看再定。
  2. python scripts/gen_vizmap_shot.py
  3. 瓦片缓存在 _cover_tmp/（可随时删；重跑同一地点基本秒出）。

⚠️ 生成后务必肉眼确认画面与文案一致：同一坐标的不同期次可能季节/亮度差异极大，
   甚至看起来不像同一个地方（Esri 每期是全球马赛克，各区域实际拍摄时间不同）。
   releaseNum 取 10 = 2014-02-20、26334 = 2026-08-05（完整表见 vizmaps.json 登记）。

已产出：public/maps/hist-imagery/{cover.jpg, shots/yangshan.jpg, shots/xiongan.jpg}
"""
import math
import os
import urllib.request

from PIL import Image, ImageDraw, ImageFont

# 沙箱里 HTTP_PROXY 指向宿主但不可达，清掉后直连
for k in ("HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy"):
    os.environ.pop(k, None)

ROOT = "D:/WorkSpace/00PlanetGIS源码"
MAPDIR = os.path.join(ROOT, "public/maps/hist-imagery")
CACHE = os.path.join(ROOT, "_cover_tmp")
os.makedirs(CACHE, exist_ok=True)
os.makedirs(os.path.join(MAPDIR, "shots"), exist_ok=True)

DATE_A, REL_A = "2014-02-20", "10"
DATE_B, REL_B = "2026-08-05", "26334"

TILE, COLS, ROWS = 256, 6, 4            # 拼 1536x1024，再居中裁 1280x720
W, H = 1280, 720
SPLIT = W // 2

HOSTS = [
    "wayback-a.maptiles.arcgis.com",
    "wayback-b.maptiles.arcgis.com",
    "wayback.maptiles.arcgis.com",
]
PATH = "/arcgis/rest/services/World_Imagery/MapServer/tile/"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"

JOBS = [
    # (经度, 纬度, 层级, 输出文件, 左上标签, 右上标签)
    (113.892, 22.532, 14, "cover.jpg", DATE_A, DATE_B),           # 深圳 · 前海：吹填工地 → 成片楼宇
    (122.080, 30.625, 13, "shots/yangshan.jpg", DATE_A, DATE_B),  # 上海 · 洋山深水港：海上的几座小岛 → 深水码头岛链
    (115.970, 39.050, 13, "shots/xiongan.jpg", DATE_A, DATE_B),   # 河北 · 雄安新区：农田村庄 → 成方格规划路网
]


def lnglat_to_tile(lng, lat, z):
    n = 2.0 ** z
    lat_r = math.radians(lat)
    return ((lng + 180.0) / 360.0 * n,
            (1.0 - math.log(math.tan(lat_r) + 1.0 / math.cos(lat_r)) / math.pi) / 2.0 * n)


def fetch_tile(rel, z, x, y):
    fp = os.path.join(CACHE, f"{rel}_{z}_{x}_{y}.jpg")
    if os.path.exists(fp) and os.path.getsize(fp) > 200:
        return fp
    last = None
    for h in HOSTS:
        url = f"https://{h}{PATH}{rel}/{z}/{y}/{x}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": "https://planetgis.cn/"})
            with urllib.request.urlopen(req, timeout=25) as r:
                data = r.read()
            if len(data) < 200 or not data.startswith(b"\xff\xd8"):
                last = f"{h}: 非 JPEG（{len(data)}B）"
                continue
            with open(fp, "wb") as f:
                f.write(data)
            return fp
        except Exception as e:  # noqa: BLE001
            last = f"{h}: {e}"
    raise RuntimeError(f"瓦片 {rel}/{z}/{y}/{x} 失败 -> {last}")


def mosaic(lng, lat, z, rel):
    cx, cy = lnglat_to_tile(lng, lat, z)
    x0, y0 = int(cx) - COLS // 2, int(cy) - ROWS // 2
    canvas = Image.new("RGB", (COLS * TILE, ROWS * TILE), (18, 22, 28))
    for j in range(ROWS):
        for i in range(COLS):
            with Image.open(fetch_tile(rel, z, x0 + i, y0 + j)) as t:
                canvas.paste(t.convert("RGB"), (i * TILE, j * TILE))
    px, py = (cx - x0) * TILE, (cy - y0) * TILE
    left = int(max(0, min(canvas.width - W, px - W / 2)))
    top = int(max(0, min(canvas.height - H, py - H / 2)))
    return canvas.crop((left, top, left + W, top + H))


def load_font(size):
    for c in (os.path.join(CACHE, "NotoSansSC.ttf"), "C:/Windows/Fonts/msyh.ttc"):
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:  # noqa: BLE001
                pass
    return ImageFont.load_default()


def ensure_font():
    fp = os.path.join(CACHE, "NotoSansSC.ttf")
    if os.path.exists(fp):
        return
    url = "https://github.com/google/fonts/raw/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=90) as r:
            data = r.read()
        if len(data) > 100000:
            with open(fp, "wb") as f:
                f.write(data)
            print("字体已下载:", len(data), "B")
    except Exception as e:  # noqa: BLE001
        print("字体下载失败，用位图字体:", e)


def pill(draw, xy, text, font, anchor="la"):
    x, y = xy
    l, t, r, b = draw.textbbox((0, 0), text, font=font)
    w, h = r - l, b - t
    pad_x, pad_y = 11, 7
    if anchor == "ra":
        x -= w + pad_x * 2
    draw.rounded_rectangle((x, y, x + w + pad_x * 2, y + h + pad_y * 2), radius=7,
                           fill=(9, 13, 19, 205), outline=(255, 255, 255, 60), width=1)
    draw.text((x + pad_x - l, y + pad_y - t), text, font=font, fill=(232, 238, 245, 255))


def main():
    ensure_font()
    font = load_font(21)
    for lng, lat, z, name, la, lb in JOBS:
        a = mosaic(lng, lat, z, REL_A)
        b = mosaic(lng, lat, z, REL_B)
        out = a.copy()
        out.paste(b.crop((SPLIT, 0, W, H)), (SPLIT, 0))
        d = ImageDraw.Draw(out, "RGBA")
        # 分界线：白线 + 两侧暗描边，保证深浅影像上都看得见
        d.rectangle((SPLIT - 3, 0, SPLIT + 2, H), fill=(0, 0, 0, 110))
        d.rectangle((SPLIT - 1, 0, SPLIT, H), fill=(255, 255, 255, 235))
        pill(d, (20, 18), la, font, "la")
        pill(d, (W - 20, 18), lb, font, "ra")
        dst = name if os.path.isabs(name) else os.path.join(MAPDIR, name)
        out.save(dst, "JPEG", quality=88, optimize=True, progressive=True)
        print("已写出:", dst, os.path.getsize(dst) // 1024, "KB")


if __name__ == "__main__":
    main()
