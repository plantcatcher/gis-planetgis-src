# -*- coding: utf-8 -*-
"""提取全部地图应用 index.html 的 placeholder / title / aria-label 属性文案。"""
import glob
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CN = re.compile(r"[\u4e00-\u9fff]")
attrs = {}
for f in glob.glob(os.path.join(ROOT, "public", "maps", "*", "index.html")):
    app = os.path.basename(os.path.dirname(f))
    src = open(f, encoding="utf-8").read()
    for m in re.finditer(r'(placeholder|title|aria-label)\s*=\s*"([^"]*)"', src):
        v = m.group(2)
        if CN.search(v):
            attrs.setdefault(v, set()).add(app)

out = {k: sorted(v) for k, v in attrs.items()}
dst = os.path.join(ROOT, "output", "_attr_strings.json")
json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"distinct: {len(out)}")
for k in sorted(out, key=lambda x: -len(out[x])):
    print(f"{len(out[k]):3d}| {k}")
