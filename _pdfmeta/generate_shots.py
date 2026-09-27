import os
import pymupdf
from PIL import Image
import io

SRC = "C:/Users/ZhuanZ/Downloads"
OUT_ROOT = "D:/WorkSpace/00PlanetGIS源码/public/shots"

books = {
    "shuijingzhu-shuixi-tuji": ("水经注地图集（上）：水系图集 (张步天) (z-library.sk, 1lib.sk, z-lib.sk).pdf", [0, 10, 16, 25, 35, 50, 70]),
    "shuijingzhu-zonghe-tuce": ("水经注地图集（下）综合图册 (张步天) (z-library.sk, 1lib.sk, z-lib.sk).pdf", [0, 10, 22, 35, 50, 65, 80]),
    "eguo-lishi-ditu": ("俄国历史地图 (（英）马丁·吉尔伯特著) (z-library.sk, 1lib.sk, z-lib.sk).pdf", [0, 10, 30, 60, 90, 120, 150]),
    "meiguo-lishi-ditu": ("美国历史地图(第4版) Атлас по истории США ([英] 马丁·吉尔伯 著 Гилберт Мартин.) (z-library.sk, 1lib.sk, z-lib.sk).pdf", [0, 10, 30, 55, 80, 110, 140]),
    "shijie-lishi-ditu-ji": ("世界历史地图集 (张芝联，刘学荣主编) (z-library.sk, 1lib.sk, z-lib.sk).pdf", [0, 10, 35, 60, 90, 120, 150]),
    "dizhi-xue-jichu": ("地质学基础isbn_9787040165654.pdf", [0, 3, 15, 55, 110, 180, 320]),
}

def save_page(doc, idx, out_path, max_width=1200, quality=90):
    pix = doc[idx].get_pixmap(dpi=150)
    img = Image.open(io.BytesIO(pix.tobytes("png")))
    w, h = img.size
    if w > max_width:
        ratio = max_width / w
        img = img.resize((max_width, int(h * ratio)), Image.LANCZOS)
    # 封面统一比例不做强制裁剪，保持原书页比例
    img.convert("RGB").save(out_path, "JPEG", quality=quality, optimize=True)

for slug, (fname, pages) in books.items():
    path = os.path.join(SRC, fname)
    doc = pymupdf.open(path)
    out_dir = os.path.join(OUT_ROOT, slug)
    os.makedirs(out_dir, exist_ok=True)
    names = ["cover.jpg"] + [f"p{i}.jpg" for i in range(1, 7)]
    for idx, name in zip(pages, names):
        out = os.path.join(out_dir, name)
        save_page(doc, idx, out)
        print(f"  saved {out}")
    doc.close()
    print(f"[OK] {slug}")
