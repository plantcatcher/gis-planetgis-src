# -*- coding: utf-8 -*-
"""导出 regions 家族完整待译字段（HTML + config.js）。只读。"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
apps = json.load(open(os.path.join(ROOT, "output", "_i18n_html_strings.json"), encoding="utf-8"))
regions = sorted(a for a in apps if a.endswith("-regions"))
out = {}
for a in regions:
    cfg_path = os.path.join(ROOT, "public", "maps", a, "js", "config.js")
    cfg = open(cfg_path, encoding="utf-8").read() if os.path.exists(cfg_path) else ""
    m = re.search(r"notes:\s*\{(.*?)\}", cfg, re.S)
    notes_blk = m.group(1) if m else ""

    def note(k):
        mm = re.search(k + r"\s*:\s*'((?:[^'\\]|\\.)*)'", notes_blk)
        return mm.group(1) if mm else ""

    def g(pat):
        mm = re.search(pat, cfg)
        return mm.group(1) if mm else ""

    d = apps[a]

    def find(pred):
        for t, paths in d.items():
            if pred(t, paths):
                return t
        return ""

    out[a] = {
        "code": a.split("-")[0].upper(),
        "title": find(lambda t, p: p[0] == "title"),
        "overview": find(lambda t, p: p[0] == "btnOverview"),
        "lead": find(lambda t, p: p[0] == "lead"),
        "popnote": note("pop"),
        "areanote": note("area"),
        "groupnote": note("group"),
        "mainLabel": g(r"mainLabel:\s*'([^']+)'"),
        "subRole": g(r"subRole:\s*'([^']+)'"),
        "subDesc": g(r"subDesc:\s*'([^']+)'"),
        "capLabel": g(r"capitalLabel:\s*'([^']+)'"),
        "src": find(lambda t, p: p[0] == "p" and t.startswith("数据来源")),
        "panel": find(lambda t, p: p[0] == "panelNote"),
    }

dst = os.path.join(ROOT, "output", "_regions_full.json")
json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
missing = [(a, k) for a, r in out.items() for k, v in r.items() if not v]
print("apps:", len(out), "missing:", len(missing))
for a, k in missing[:15]:
    print(" ", a, k)
