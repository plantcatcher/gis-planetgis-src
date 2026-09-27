import os, json
import pymupdf

SRC = "C:/Users/ZhuanZ/Downloads"
OUT = "D:/WorkSpace/00PlanetGIS源码/_pdfmeta/extract2"
os.makedirs(OUT, exist_ok=True)

books = {
    "shuijingzhu-shang": "水经注地图集（上）：水系图集 (张步天) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    "shuijingzhu-xia": "水经注地图集（下）综合图册 (张步天) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    "eguo-lishi": "俄国历史地图 (（英）马丁·吉尔伯特著) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    "meiguo-lishi": "美国历史地图(第4版) Атлас по истории США ([英] 马丁·吉尔伯 著 Гилберт Мартин.) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    "shijie-lishi": "世界历史地图集 (张芝联，刘学荣主编) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    "dizhi-xue-jichu": "地质学基础isbn_9787040165654.pdf",
}

def render_pages(key, fname, front_n=8, samples=6):
    path = os.path.join(SRC, fname)
    doc = pymupdf.open(path)
    n = doc.page_count
    bdir = os.path.join(OUT, key)
    os.makedirs(bdir, exist_ok=True)
    pages_rendered = []
    # 前 N 页（封面、版权、前言、目录）
    for i in range(min(front_n, n)):
        pg = doc[i]
        pix = pg.get_pixmap(dpi=110)
        out = os.path.join(bdir, f"p{i:02d}.png")
        pix.save(out)
        pages_rendered.append((i, out))
    # 均匀内页样本
    step = max(1, n // (samples+1))
    for k in range(1, samples+1):
        idx = min(n-1, k*step)
        pg = doc[idx]
        pix = pg.get_pixmap(dpi=110)
        out = os.path.join(bdir, f"sample_{k:02d}_{idx:03d}.png")
        pix.save(out)
    doc.close()
    print(f"[OK] {key}: pages={n}")

for k, f in books.items():
    render_pages(k, f, front_n=8, samples=6)
