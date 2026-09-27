import os, re, glob
from PIL import Image

OUT_ROOT = "D:/WorkSpace/00PlanetGIS源码/public/shots"
EXTRACT_ROOT = "D:/WorkSpace/00PlanetGIS源码/_pdfmeta/extract2"

mapping = {
    "shuijingzhu-shuixi-tuji": "shuijingzhu-shang",
    "shuijingzhu-zonghe-tuce": "shuijingzhu-xia",
    "eguo-lishi-ditu": "eguo-lishi",
    "meiguo-lishi-ditu": "meiguo-lishi",
    "shijie-lishi-ditu-ji": "shijie-lishi",
    "dizhi-xue-jichu": "dizhi-xue-jichu",
}

def convert(in_path, out_path, max_width=1200, quality=90):
    img = Image.open(in_path)
    w, h = img.size
    if w > max_width:
        img = img.resize((max_width, int(h * max_width / w)), Image.LANCZOS)
    img.convert("RGB").save(out_path, "JPEG", quality=quality, optimize=True)

for slug, src in mapping.items():
    src_dir = os.path.join(EXTRACT_ROOT, src)
    out_dir = os.path.join(OUT_ROOT, slug)
    os.makedirs(out_dir, exist_ok=True)
    # cover
    convert(os.path.join(src_dir, "p00.png"), os.path.join(out_dir, "cover.jpg"))
    # samples
    samples = sorted(glob.glob(os.path.join(src_dir, "sample_*.png")))
    for i, s in enumerate(samples[:6], 1):
        convert(s, os.path.join(out_dir, f"p{i}.jpg"))
    print(f"[OK] {slug}: {len(samples[:6])+1} images")
