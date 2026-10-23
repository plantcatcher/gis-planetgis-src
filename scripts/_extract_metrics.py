# -*- coding: utf-8 -*-
"""提取全部 config.js 的 METRICS label（供 regions-app.js 英文图例映射表用）。"""
import glob
import os
import re
import json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ml = {}
for f in glob.glob(os.path.join(ROOT, "public", "maps", "*", "js", "config.js")):
    app = os.path.basename(os.path.dirname(os.path.dirname(f)))
    src = open(f, encoding="utf-8").read()
    i = src.find("METRICS:")
    if i < 0:
        continue
    j = src.find("\n  },", i)
    blk = src[i:j] if j > 0 else src[i:i + 2000]
    for mm in re.finditer(r"label\s*:\s*'([^']+)'", blk):
        ml.setdefault(mm.group(1), set()).add(app)

out = {k: sorted(v) for k, v in ml.items()}
dst = os.path.join(ROOT, "output", "_metrics_labels.json")
json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for k in sorted(out, key=lambda x: -len(out[x])):
    print(f"{len(out[k]):3d}| {k}")
