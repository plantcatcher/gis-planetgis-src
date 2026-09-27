import os, pymupdf

SRC = "C:/Users/ZhuanZ/Downloads"
OUT = "D:/WorkSpace/00PlanetGIS源码/_pdfmeta/extract2"

books = {
    "eguo-lishi": "俄国历史地图 (（英）马丁·吉尔伯特著) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    "meiguo-lishi": "美国历史地图(第4版) Атлас по истории США ([英] 马丁·吉尔伯 著 Гилберт Мартин.) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    "shuijingzhu-shang": "水经注地图集（上）：水系图集 (张步天) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    "shuijingzhu-xia": "水经注地图集（下）综合图册 (张步天) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
}
extra_pages = {
    "eguo-lishi": [8,9,10,11],
    "meiguo-lishi": [8,9,10],
    "shuijingzhu-shang": [8,9,10,11],
    "shuijingzhu-xia": [6,7,8,9],
}

for key, fname in books.items():
    path = os.path.join(SRC, fname)
    doc = pymupdf.open(path)
    bdir = os.path.join(OUT, key)
    os.makedirs(bdir, exist_ok=True)
    for idx in extra_pages[key]:
        if idx >= doc.page_count: continue
        pg = doc[idx]
        pix = pg.get_pixmap(dpi=110)
        pix.save(os.path.join(bdir, f"p{idx:02d}.png"))
    doc.close()
    print(f"[OK] {key}")
