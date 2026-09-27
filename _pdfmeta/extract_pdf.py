import os, sys, json, glob
import pymupdf

SRC = "C:/Users/ZhuanZ/Downloads"
OUT = "D:/WorkSpace/00PlanetGIS源码/_pdfmeta/extract"
os.makedirs(OUT, exist_ok=True)

books = {
    "shuijingzhu-shang": "水经注地图集（上）：水系图集 (张步天) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    "shuijingzhu-xia": "水经注地图集（下）综合图册 (张步天) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    "eguo-lishi": "俄国历史地图 (（英）马丁·吉尔伯特著) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    "meiguo-lishi": "美国历史地图(第4版) Атлас по истории США ([英] 马丁·吉尔伯 著 Гилберт Мартин.) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    "shijie-lishi": "世界历史地图集 (张芝联，刘学荣主编) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    "dizhi-xue-jichu": "地质学基础isbn_9787040165654.pdf",
}

def find_pdf(name):
    p = os.path.join(SRC, name)
    return p if os.path.exists(p) else None

report = {}
for key, fname in books.items():
    path = find_pdf(fname)
    if not path:
        print(f"[MISS] {key}: {fname}")
        continue
    doc = pymupdf.open(path)
    n = doc.page_count
    # 统计文字层
    txt_front = ""
    for i in range(min(8, n)):
        txt_front += doc[i].get_text()
    has_text = len(txt_front.strip()) > 50
    # 找目录页
    toc_pages = []
    for i in range(min(40, n)):
        t = doc[i].get_text()
        if ("目录" in t) or ("目  录" in t) or ("目 录" in t) or ("Contents" in t) or ("CONTENTS" in t):
            toc_pages.append(i)
    # 渲染关键页
    bdir = os.path.join(OUT, key)
    os.makedirs(bdir, exist_ok=True)
    def render(idx, name):
        if 0 <= idx < n:
            pg = doc[idx]
            pix = pg.get_pixmap(dpi=110)
            outp = os.path.join(bdir, name)
            pix.save(outp)
            return outp
        return None
    render(0, "p00_cover.png")
    render(1, "p01.png")
    render(2, "p02.png")
    render(3, "p03.png")
    for tp in toc_pages[:2]:
        render(tp, f"toc_{tp:02d}.png")
    # 均匀采样内页（用于后续挑选 p1-p6）
    import math
    sample_n = min(6, max(2, n//20))
    step = max(1, n // (sample_n+1))
    samples = []
    for k in range(1, sample_n+1):
        idx = min(n-1, k*step)
        p = render(idx, f"sample_{k:02d}_{idx:03d}.png")
        if p: samples.append((idx, p))
    report[key] = {
        "file": fname, "pages": n, "has_text_layer": has_text,
        "front_text_len": len(txt_front.strip()),
        "toc_pages": toc_pages[:4],
        "samples": samples,
    }
    # 保存前若干页文本
    with open(os.path.join(bdir, "front_text.txt"), "w", encoding="utf-8") as f:
        f.write(txt_front)
    doc.close()
    print(f"[OK] {key}: pages={n} text={has_text} toc={toc_pages[:4]}")

with open(os.path.join(OUT, "report.json"), "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=2)
print("DONE")
