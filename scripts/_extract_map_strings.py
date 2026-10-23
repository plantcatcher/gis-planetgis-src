# -*- coding: utf-8 -*-
"""导出 82 个地图应用的静态中文文案（元素级 textContent），供英译词典使用。
只读不写，产出 output/_i18n_html_strings.json。
"""
import json
import os
import re
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPS = os.path.join(ROOT, "public", "maps")
OUT = os.path.join(ROOT, "output", "_i18n_html_strings.json")

CN = re.compile(r"[\u4e00-\u9fff]")


class Collector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip = 0          # script/style 深度
        self.stack = []        # (tag, [text parts])
        self.results = []      # [(path, text)]

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.skip += 1
            return
        if self.skip:
            return
        d = dict(attrs)
        path = d.get("id") or d.get("class") or tag
        self.stack.append((path, []))

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip = max(0, self.skip - 1)
            return
        if self.skip or not self.stack:
            return
        path, parts = self.stack.pop()
        text = "".join(parts)
        text = re.sub(r"\s+", " ", text).strip()
        if text and CN.search(text):
            self.results.append((path, text))
        # 子元素全文合并回父级，使父级拿到完整 textContent
        # （prose 的 key 必须是含 <b> 内文的完整句子，替换时才能整段 innerHTML 换掉）
        if self.stack and not self.skip:
            self.stack[-1][1].append(text)

    def handle_data(self, data):
        if self.skip or not self.stack:
            return
        self.stack[-1][1].append(data)


apps = {}
for name in sorted(os.listdir(MAPS)):
    idx = os.path.join(MAPS, name, "index.html")
    if not os.path.isfile(idx):
        continue
    c = Collector()
    with open(idx, encoding="utf-8") as f:
        c.feed(f.read())
    # 去掉被父元素完整包含的重复（保留最具体的）
    seen = {}
    for path, text in c.results:
        seen.setdefault(text, []).append(path)
    apps[name] = {t: p for t, p in seen.items()}

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(apps, f, ensure_ascii=False, indent=1)

total = sum(len(v) for v in apps.values())
uniq = len({t for v in apps.values() for t in v})
print(f"apps={len(apps)} strings={total} unique={uniq} -> {OUT}")
