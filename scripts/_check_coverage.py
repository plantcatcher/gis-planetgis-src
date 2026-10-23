# -*- coding: utf-8 -*-
"""检查各应用字符串的词典覆盖率（chrome + regions + apps 三份合并）。
用法：python scripts/_check_coverage.py [app ...]
无参数时输出全部应用的未覆盖清单（按应用分组，全文不截断）。
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts", "i18n-maps-src")
strings = json.load(open(os.path.join(ROOT, "output", "_i18n_html_strings.json"), encoding="utf-8"))

done = set()
sub_keys = set()
for name in ("chrome.json", "regions.json", "apps.json"):
    p = os.path.join(SRC, name)
    if os.path.exists(p):
        d = json.load(open(p, encoding="utf-8"))
        done |= set(d["exact"])
        sub_keys |= set(d.get("sub") or {})

SKIP = {
    "html", "body", "intro", "introBody", "intro-nav", "panel", "panelBody", "dock",
    "facts", "metricSeg", "block", "detail", "dt-metrics", "dt-desc", "bm-seg",
    "intro-head", "panelHead", "introBar", "map", "wrap", "app", "main", "stage", "hud",
    "toolbar", "side", "card", "list", "grid", "row", "col", "box", "modal", "pop", "tip",
    "note", "sec", "hd", "bd", "ft", "ct", "ctrl", "bar", "seg", "chip", "tab", "head",
    "foot", "topbar", "top-actions", "basemapSeg", "legend", "catalog-head", "map-nav",
    "ts-ops", "brand", "modes", "searchBox", "dlg", "br", "site-nav", "ctrl-nav",
}
# 纯数据值（数字+量词/年份）不译
PURE = re.compile(
    r"^[\s\d.,—–\-+≈×↺▶◉‹›·:：/()（）%％km²㎡°]+"
    r"(个|处|条|台|所|家|人|次|数|级|倍|公里|千米|米|km|工程|目录|视角|馆|机组|矿种|高校|港口|"
    r"苏木|市町村|区级总馆|市级馆舍|普通高校|主要港口|核电设施|州级单位|道市级单位|科考设施|"
    r"主要洋流|期|年|月|日|小时|天|万|亿|平方千米|公顷|亩|吨|千瓦|兆瓦|万千瓦|亿千瓦|立方米|"
    r"秒立方米|万册|亿册|亿元|万美元|至今|府|省|市|县|区|镇|村|州|盟|旗|类|种|项|座|张|本|册|"
    r"篇|套|栋|院|校|站|场|矿|山|河|湖|岛|港|路|线|层|阶|版|号|字|位|度|总览|对比|导航)?\s*$"
)

apps = sys.argv[1:] or sorted(strings)
total = 0
# 归一化后的已Covered集合：去空白 + 去首尾图标字符（与 map-i18n.js 对齐）
ICON = "\u2039\u203a\u00ab\u00bb\u25c9\u2715\u2716\uff0d\u2013\u2014\u00d7\u00f7\u25cb\u25cf\u25a0\u25a1\u25b3\u25b2\u25c7\u25c6\u2605\u2606\u203b\u00a7\u00b6\u2022"


def norm(s):
    s = re.sub(r"[\s\u3000]+", "", s or "")
    return re.sub("^[" + ICON + "]+|[" + ICON + "]+$", "", s)


done_n = {norm(k) for k in done}
# sub 键也计入「可处理」集合（子串替换由文本节点完成）
done_n |= {norm(k) for k in sub_keys if norm(k)}

# 含 CJK 才需要译；纯数字/英文/单位串（2K、340GW、m³/s、WGS84）不译
NO_CJK = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]")
NOCJK_RUN = re.compile(r"[^\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+")
# 值串的「数字/符号」头部与「中文量词」表（与 PURE 的单位表一致）
DIGITS = re.compile(r"[\s\d.,—–\-+≈×≥≤~:：/()（）%％km²㎡°³]+")
UNIT_RE = re.compile(
    r"个|处|条|台|所|家|人|次|级|倍|公里|千米|米|km|工程|目录|视角|馆|机组|矿种|高校|港口|"
    r"苏木|市町村|区级总馆|市级馆舍|普通高校|主要港口|核电设施|州级单位|道市级单位|科考设施|"
    r"主要洋流|期|年|月|日|小时|天|万|亿|平方千米|公顷|亩|吨|千瓦|兆瓦|万千瓦|亿千瓦|立方米|"
    r"秒立方米|万册|亿册|亿元|万美元|至今|府|省|市|县|区|镇|村|州|盟|旗|类|种|项|座|张|本|册|"
    r"篇|套|栋|院|校|站|场|矿|山|河|湖|岛|港|路|线|层|阶|版|号|字|位|度|总览|对比|导航|全量"
)

# 数字/单位 token（「大区 / 海外领地13个」这类 rollup 会由下沉逐个替换，无需整条键）
NUMTOK = re.compile(
    r"^[\d\s.,—–\-+≈×≥≤~:：/()（）%％km²㎡°]+"
    r"(个|处|条|台|所|家|人|次|级|倍|公里|千米|米|km|期|年|月|日|小时|天|万|亿|至今|全量)?$"
)


def tokens_ok(t):
    """回溯式贪心分段：词典前缀 → 数字/符号值串（可带 0~n 个中文量词）→ 非中文串。
    模拟引擎「父级不整换 → 下沉子节点各自命中」的行为，滤除 rollup 误报。"""
    nt = norm(t)
    if nt in done_n:
        return True
    if len(nt) < 4 or len(nt) > 400:
        return False
    n = len(nt)
    memo = {}

    def seg(i):
        if i >= n:
            return True
        if i in memo:
            return memo[i]
        ok = False
        # ① 词典前缀（最长优先，带回溯）
        for L in range(min(200, n - i), 0, -1):
            if nt[i:i + L] in done_n and seg(i + L):
                ok = True
                break
        # ② 数字/符号值串：先吃数字符号，再按单位词逐个长度回溯
        if not ok:
            m = DIGITS.match(nt, i)
            if m and m.end() > i:
                j = m.end()
                if seg(j):
                    ok = True
                else:
                    while not ok:
                        m2 = UNIT_RE.match(nt, j)
                        if not m2:
                            break
                        j = m2.end()
                        if seg(j):
                            ok = True
        # ③ 纯非中文串（英文/单位符号，如 2K、340GW、WGS84）
        if not ok:
            m = NOCJK_RUN.match(nt, i)
            if m and m.end() > i and seg(m.end()):
                ok = True
        memo[i] = ok
        return ok

    return seg(0)


# 已Covered串拼接池：若某串是某个已Covered父串的子串，父级整段替换时顺带覆盖，跳过
covered_blob = "\u0001".join(done_n)

# 「标签+数字+量词」统计条（如「州 / 联邦区27个」「一级行政区11个」）：
# 标签整体已Covered即可，数字与量词由 <em>/<i> 子元素各自命中
LABELED = re.compile(r"^(.*?)[\s]*(\d+|—)[\s]*(个|人|万|亿|条|处|万km²|km²)?$")


def concat_ok(t):
    """两段拼接：整串可在某处切成两截、两截都已Covered（父级两个子元素各自命中）。"""
    nt = norm(t)
    if len(nt) < 4 or len(nt) > 300:
        return False
    for i in range(2, len(nt) - 1):
        if nt[:i] in done_n and nt[i:] in done_n:
            return True
    return False


for a in apps:
    rec = strings.get(a, {})
    rem = []
    for t, p in rec.items():
        if len(t) > 240 or any(x in SKIP for x in p):
            continue
        if PURE.match(t) and len(t) <= 16:
            continue
        # 「标签—值」瞬态（em-dash 占位，随后被真实数值替换）
        if re.match(r"^[\u4e00-\u9fffA-Za-z]{1,8}\s*[—–-]\s*[\u4e00-\u9fffA-Za-z°/²k㎡]*$", t):
            continue
        if norm(t) in done_n:
            continue
        if tokens_ok(t):
            continue
        # 统计条「标签+数字+量词」：标签部分整体已Covered（数字/量词在下沉后各自命中）
        m = LABELED.match(t)
        if m and norm(m.group(1)) in done_n:
            continue
        # 子串规则：父元素整段命中时子元素顺带被替换（如 <p>…<b>2022 年德国人口普查</b>…</p>）
        if len(t) <= 60 and norm(t) in covered_blob:
            continue
        if concat_ok(t):
            continue
        rem.append((p[0], t))
    if rem:
        total += len(rem)
        print(f"===== {a} ({len(rem)}) =====")
        for p, t in rem:
            print(f"  [{p[:14]}] {t}")
print(f"\nTOTAL UNCOVERED: {total}")
