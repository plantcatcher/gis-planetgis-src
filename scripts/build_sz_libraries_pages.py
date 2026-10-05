# -*- coding: utf-8 -*-
"""把 public/maps/sz-libraries/libraries/*.md 渲染成 SEO 友好的静态 HTML 页。

设计要点（与主站 content/*.md 无关，这是**地图小网站自己的静态页**）：
  - 每馆一篇 md：frontmatter（title/description/keywords/district/tier/...）+ Markdown 正文
  - 渲染成 libraries/<id>.html：完整 <title>/<meta description>/<meta keywords>、
    面包屑、OG 标签、JSON-LD（Library 类型 + 地理坐标）、正文目录锚点
  - catalog.html：全部馆舍的目录页（按辖区分组），每个馆一张卡
  - 每页内嵌一个只读的高亮定位小地图（复用 /maps/_shared 的MapLibre UMD，
    只画本市域底图 + 本馆点位 + 其他馆点位做对比），并给出「回到主地图」链接

不依赖任何前端框架，纯 Node，产物直接进 public/。

用法：
  node scripts/build_sz_libraries_pages.mjs
  node scripts/build_sz_libraries_pages.mjs --check   # 只校验，不写文件
"""
import json
import math
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SLUG = 'sz-libraries'
BASE = os.path.join(ROOT, 'public', 'maps', SLUG)
MD_DIR = os.path.join(BASE, 'libraries')
OUT_DIR = os.path.join(BASE, 'libraries')
LIB_JSON = os.path.join(BASE, 'data', 'libraries.json')
DIST_JSON = os.path.join(BASE, 'data', 'districts.json')

GROUP_ORDER = ['福田区', '罗湖区', '南山区', '盐田区', '宝安区',
               '龙岗区', '龙华区', '坪山区', '光明区', '大鹏新区']


# ────────── 极简 Markdown ──────────
def parse_frontmatter(text):
    """返回 (dict, body)。仅支持 key: value、key: [a, b]、以及 '- ' 列表。"""
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    m = re.match(r'^---\n(.*?)\n---\n?', text, re.S)
    if not m:
        return {}, text
    # 注意：body 必须是闭合 --- 之后的部分，用 m.end() 切，误用 text 会把
    # frontmatter 本身当成正文渲染出去
    body = text[m.end():]
    fm, key = {}, None
    for line in m.group(1).split('\n'):
        if re.match(r'^\S+:', line):
            k, v = line.split(':', 1)
            key = k.strip()
            v = v.strip()
            if v.startswith('[') and v.endswith(']'):
                fm[key] = [x.strip().strip('"\'') for x in v[1:-1].split(',') if x.strip()]
            else:
                fm[key] = v.strip('"\'')
        elif re.match(r'^\s+-\s+', line) and key:
            fm.setdefault(key + '_list', []).append(re.sub(r'^\s+-\s+', '', line))
    return fm, body


def md_inline(s):
    s = s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)', r'<em>\1</em>', s)
    s = re.sub(r'`(.+?)`', r'<code>\1</code>', s)
    return s


def md_render(body):
    """渲染 h2/h3、段落、无序列表、表格。足够覆盖馆情页，不追求完备。"""
    out, lines, i = [], body.split('\n'), 0
    while i < len(lines):
        ln = lines[i].rstrip()
        if not ln.strip():
            i += 1
            continue
        if ln.startswith('### '):
            out.append('<h3>%s</h3>' % md_inline(ln[4:].strip()))
            i += 1
        elif ln.startswith('## '):
            out.append('<h2 id="%s">%s</h2>' % (
                re.sub(r'[^\w\u4e00-\u9fff]+', '-', ln[3:].strip()).strip('-'),
                md_inline(ln[3:].strip())))
            i += 1
        elif ln.lstrip().startswith('|'):
            rows = []
            while i < len(lines) and lines[i].lstrip().startswith('|'):
                cells = [c.strip() for c in lines[i].strip().strip('|').split('|')]
                if not all(re.match(r'^:?-{2,}:?$', c) for c in cells):
                    rows.append(cells)
                i += 1
            if rows:
                out.append('<table class="ltable"><thead><tr>' +
                           ''.join('<th>%s</th>' % md_inline(c) for c in rows[0]) +
                           '</tr></thead><tbody>' +
                           ''.join('<tr>' + ''.join('<td>%s</td>' % md_inline(c) for c in r) +
                                   '</tr>' for r in rows[1:]) + '</tbody></table>')
        elif re.match(r'^\s*[-*]\s+', ln):
            items = []
            while i < len(lines) and re.match(r'^\s*[-*]\s+', lines[i].rstrip()):
                items.append(re.sub(r'^\s*[-*]\s+', '', lines[i].rstrip()))
                i += 1
            out.append('<ul class="hl">' +
                       ''.join('<li>%s</li>' % md_inline(x) for x in items) + '</ul>')
        else:
            buf = [ln]
            i += 1
            while i < len(lines) and lines[i].strip() and \
                    not re.match(r'^\s*(#{2,3}\s|\||[-*]\s)', lines[i].rstrip()):
                buf.append(lines[i].rstrip())
                i += 1
            out.append('<p>%s</p>' % md_inline(' '.join(buf).strip()))
    return '\n'.join(out)


# ────────── 页面模板 ──────────
# 占位符统一用 @@NAME@@（不用 str.format，避免与模板里大量 JS/CSS 花括号打架）
def render(tpl, **kw):
    out = tpl
    for k, v in kw.items():
        out = out.replace('@@%s@@' % k.upper(), str(v))
    left = re.findall(r'@@([A-Z_]+)@@', out)
    assert not left, ('未替换的占位符', set(left))
    return out


PAGE_TPL = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>@@TITLE@@</title>
  <meta name="description" content="@@DESC@@" />
  <meta name="keywords" content="@@KEYWORDS@@" />
  <meta name="author" content="PlanetGIS" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="@@TITLE@@" />
  <meta property="og:description" content="@@DESC@@" />
  <meta property="og:url" content="https://maps.planetgis.cn/maps/@@SLUG@@/libraries/@@LIB_ID@@.html" />
  <meta property="og:site_name" content="星球小捕手 · 互动地图" />
  <link rel="icon" href="data:," />
  <link rel="stylesheet" href="/maps/_shared/maplibre-gl.css" />
  <link rel="stylesheet" href="../css/style.css" />
  <script type="application/ld+json">
@@JSONLD@@
  </script>
</head>
<body class="lib-page">

<nav class="p-topbar">
  <a class="back" href="../index.html">← 返回深圳图书馆分布地图</a>
  <span class="crumb">深圳图书馆分布 / @@DISTRICT@@ / @@NAME@@</span>
</nav>

<main class="max-w-7xl mx-auto px-4 md:px-8">

  <p class="crumb"><a href="../index.html">互动地图</a> / <a href="../catalog.html">总馆目录</a> / @@DISTRICT@@</p>

  <header class="lib-hero">
    <small class="eyebrow"><i class="ic-eq"></i> @@TIER_LABEL@@ · @@DISTRICT@@</small>
    <h1>@@H1@@</h1>
    <p class="sub">@@TAGLINE@@。@@SUMMARY@@</p>
    <div class="lib-kpis">
      <div class="lib-kpi"><div class="k">建筑面积</div><div class="v">@@AREA_V@@</div><div class="d">@@AREA_D@@</div></div>
      <div class="lib-kpi"><div class="k">纸质文献</div><div class="v">@@COLL_V@@</div><div class="d">@@COLL_D@@</div></div>
      <div class="lib-kpi"><div class="k">阅览座位</div><div class="v">@@SEATS_V@@</div><div class="d">@@SEATS_D@@</div></div>
      <div class="lib-kpi"><div class="k">建馆 / 现馆开放</div><div class="v">@@FOUNDED_V@@</div><div class="d">@@GRADE@@</div></div>
    </div>
  </header>

  <section class="lsec">
    <h2>馆址与交通</h2>
    <p><b>馆址</b>：@@ADDRESS@@　·　<b>交通</b>：@@TRANSIT@@</p>
    <p class="dim"><b>开放时间</b>：@@VISIT@@</p>
    <p class="dim"><b>藏量口径</b>：@@COLL_NOTE@@</p>
    <p class="dim">坐标 @@LNG@@, @@LAT@@（WGS84 @@WLON@@, @@WLAT@@，已转为 GCJ-02 与高德底图对齐）。坐标由天地图地理编码服务按馆址门址号匹配，仅用于图上定位，非测绘级坐标。</p>
    <div class="lib-map" id="pmap"></div>
  </section>

@@BODY@@

  <section class="lsec">
    <h2>同辖区其他总馆</h2>
    <div class="related">
@@RELATED@@
    </div>
  </section>

  <section class="lsec">
    <h2>关于深圳的公共图书馆网络</h2>
    <p>2003 年深圳在全国率先提出建设<b>「图书馆之城」</b>，2009 年印发《深圳市「图书馆之城」统一技术平台建设方案》，2012 年 4 月全市公共图书馆与自助图书馆全部加入统一服务。读者持一张「图书馆之城」读者证，即可在全市任一成员馆阅览、借还、查阅数字资源。</p>
    <p>到 2025 年，统一服务成员馆累积文献总藏量 <b>6827.36 万册件</b>，其中实体文献 2892.71 万册件、电子文献 3934.65 万册件；全年进馆读者 5430.20 万人次，实体文献外借 2947.52 万册次。本图收录的是其中的市级与区级<b>总馆馆舍</b>共 15 处——街道分馆、社区图书馆、自助图书馆全市逾千个，属服务网点而非独立馆舍，另图或不收。</p>
    <p class="dim">数据来源：各馆官网「概况 / 本馆简介」页、各区政府门户场馆介绍页、深圳市政府门户场馆名录、深圳市 2026 年「图书馆之城」阅读报告。馆藏、面积等为各馆自报口径，年份不一，本页已尽量标注；本页不构成场馆官方信息，参观前请以各馆官方公告为准。</p>
    <div class="related" style="margin-top:14px">
      <a href="../index.html"><div class="rd">互动地图</div><div class="rn">深圳图书馆分布地图</div><div class="rr">15 处馆舍的空间格局与逐馆速览</div></a>
      <a href="../catalog.html"><div class="rd">目录页</div><div class="rn">15 处总馆一览</div><div class="rr">按辖区分组，含每馆建筑面积与藏量</div></a>
      <a href="/works/sz-libraries" target="_top"><div class="rd">主站</div><div class="rn">作品介绍</div><div class="rr">这张图怎么做出来的、数据口径说明</div></a>
    </div>
  </section>

</main>

<script src="/maps/_shared/maplibre-gl.js"></script>
<script>window.__PAGE_LIB = @@POINTS@@; window.__PAGE_ID = "@@LIB_ID@@";</script>
<script src="../js/page-map.js"></script>
</body>
</html>
'''

CATALOG_TPL = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>深圳公共图书馆总馆目录 · 15 处馆舍一览（馆址 / 藏量 / 面积 / 座位 / 开馆年份）</title>
  <meta name="description" content="深圳 2 家市级机构、9 个行政区与 1 个功能区的公共图书馆总馆目录：15 处馆舍的馆址、纸质文献藏量、建筑面积、阅览座位、开馆年份与一句话特色，按辖区分组，每馆附独立馆情介绍页。" />
  <meta name="keywords" content="深圳图书馆,深圳市图书馆地址,各区图书馆,福田图书馆,南山图书馆,罗湖图书馆,宝安图书馆,龙岗图书馆,龙华图书馆,坪山图书馆,光明图书馆,盐田图书馆,大鹏图书馆,深圳大学城图书馆,图书馆之城,深圳图书馆开放时间" />
  <meta name="author" content="PlanetGIS" />
  <link rel="icon" href="data:," />
  <!-- ⚠️ catalog.html 在 maps/<slug>/（一级），介绍页在 maps/<slug>/libraries/（两级），
       所以这里的相对路径是 css/ 而不是 ../css/。写错会静默退化成无样式裸 HTML。 -->
  <link rel="stylesheet" href="css/style.css" />
</head>
<body class="lib-page">
<nav class="p-topbar">
  <a class="back" href="../index.html">← 返回深圳图书馆分布地图</a>
  <span class="crumb">深圳图书馆分布 / 总馆目录</span>
</nav>
<main class="max-w-7xl mx-auto px-4 md:px-8">
  <p class="crumb"><a href="../index.html">互动地图</a> / 总馆目录</p>
  <header class="lib-hero">
    <h1>深圳公共图书馆总馆目录<span class="h1sub">15 处馆舍 · 一馆一篇</span></h1>
    <p class="sub">深圳「图书馆之城」的市级与区级<b>总馆馆舍</b>清单，按辖区分组。收录口径为<b>独立馆舍</b>——有独立建筑、能查到官方「馆舍简介」的那种；<b>不含</b>街道分馆、社区图书馆、自助图书馆与 24 小时书香亭（全市逾千个，属服务网点而非独立馆舍）。点任一馆名进入完整馆情页。</p>
    <div class="lib-kpis">
      <div class="lib-kpi"><div class="k">总馆馆舍</div><div class="v">@@N_LIB@@<small>处</small></div><div class="d">其中市级馆舍 @@N_CITY@@ 处</div></div>
      <div class="lib-kpi"><div class="k">纸质文献合计</div><div class="v">@@COLL_TOTAL@@<small>万册</small></div><div class="d">统一为纸质口径</div></div>
      <div class="lib-kpi"><div class="k">建筑面积合计</div><div class="v">@@AREA_TOTAL@@<small>m²</small></div><div class="d">部分馆未公开，未计入者从缺</div></div>
      <div class="lib-kpi"><div class="k">一级图书馆</div><div class="v">@@N_GRADE@@<small>家</small></div><div class="d">按机构计，不含大鹏「市一级」</div></div>
    </div>
  </header>

  <nav class="cat-jump" aria-label="快速跳转">
    <span class="cj-label">快速跳转</span>
    <a href="#charts">数据图表<i>5</i></a>
@@JUMP@@
  </nav>

@@CHARTS@@
@@GROUPS@@
  <section class="lsec">
    <h2>口径与免责</h2>
    <ul class="hl">
      <li><b>收录范围</b>：2 家市级机构（含深圳图书馆中心馆与北馆两处馆舍）+ 9 个行政区总馆 + 大鹏新区总馆 = @@N_LIB@@ 处馆舍。街道分馆、社区图书馆、自助图书馆、24 小时书香亭<b>不在此列</b>。</li>
      <li><b>藏量口径</b>：全站统一为<b>纸质文献</b>（不含电子资源）。各馆官网自报口径不同（有的报总量含电子、有的报纸质、有的不区分），逐馆换算依据写在各馆介绍页的「藏量口径」一栏。</li>
      <li><b>数据年份</b>：馆藏、面积、座位数为各馆自报口径，年份<b>不统一</b>（多为 2021–2025，个别为建馆初期口径），已在各馆页标注。本表<b>不做精确排名</b>，只作量级参考。</li>
      <li><b>一级馆计数</b>：按<b>机构</b>计而非按馆舍计——深圳图书馆中心馆与北馆同属一家机构（北馆为「与中心馆一体评定」）；大鹏新区图书馆为<b>市一级</b>，低于国家/地市级一级，未计入。</li>
      <li><b>大鹏新区</b>是深圳的<b>功能区</b>而非行政区（无独立行政区划代码，范围在龙岗区内），因此行政边界数据中没有它的面，地图上以虚线圈示意而非色块。</li>
    </ul>
    <p class="dim">数据来源：各馆官网「概况 / 本馆简介」页、各区政府门户场馆介绍页、深圳市政府门户场馆名录、深圳市 2026 年「图书馆之城」阅读报告。馆址坐标由天地图地理编码服务按门址号匹配，为<b>定位级精度</b>而非测绘级。本目录为公开资料整理，不构成场馆官方信息，参观前请以各馆官方公告为准。</p>
    <div class="related" style="margin-top:16px">
      <a href="../index.html"><div class="rd">互动地图</div><div class="rn">深圳图书馆分布地图</div><div class="rr">15 处馆舍的空间格局与逐馆速览</div></a>
      <a href="/works/sz-libraries" target="_top"><div class="rd">主站</div><div class="rn">作品介绍</div><div class="rr">这张图怎么做出来的、数据口径与复现方式</div></a>
    </div>
  </section>
</main>
</body>
</html>
'''


def num(v, unit='', dash='—'):
    if v is None:
        return dash
    return '{:,}'.format(v) + unit


# 与 js/config.js 的 tiers 保持一致（纸质文献万册）
TIERS = [
    (280, '#e2564f'),
    (180, '#e08a3c'),
    (40, '#4aa96c'),
    (0, '#4a86c6'),
]


def tier_color_of(v):
    if v is None:
        return '#4a86c6'
    for mn, col in TIERS:
        if v >= mn:
            return col
    return '#4a86c6'


def esc(s):
    return (str(s if s is not None else '')
            .replace('&', '&amp;').replace('<', '&lt;')
            .replace('>', '&gt;').replace('"', '&quot;'))


# ────────── 图表（纯内联 SVG，零依赖零 CDN）──────────
# 与 thematic 地图配色同源：红橙绿蓝分档色 + 墨蓝底 + 暖黄强调色
DISTRICT_COLORS = [
    '#e2564f', '#e08a3c', '#4aa96c', '#4a86c6', '#8b6fc4',
    '#d95f8c', '#5aa9a4', '#c4a24a', '#7a9e4e', '#9c7fb8',
]


def _fmt(v):
    """数值显示：万册保留一位小数，平方米取整。"""
    if v is None:
        return '—'
    if abs(v - round(v)) < 0.05:
        return '{:,}'.format(int(round(v)))
    return '{:,.1f}'.format(v)


def bar_chart(items, total_unit, width=620, row_h=30, gap=6, pad_l=104, pad_r=58):
    """横向条形图。items: [(label, value, color)]（可含 None 值 → 画虚线占位）。

    ⚠️ width 必须**贴近该卡片实际渲染宽度**，否则 SVG 会被浏览器等比放大，
       viewBox 里的 px 字号也跟着放大 1~2 倍，文字溢出卡片被裁。
       配合 CSS 的 max-width 封顶，小屏下不会反向缩到不可读。
    """
    if not items:
        return ''
    h = len(items) * (row_h + gap) + 8
    bar_area = width - pad_l - pad_r
    vmax = max((v for _, v, _ in items if v), default=0) or 1
    out = ['<svg class="chart-svg" viewBox="0 0 %d %d" style="max-width:%dpx" '
           'role="img" preserveAspectRatio="xMinYMin meet">' % (width, h, width)]
    y = 4
    for label, v, color in items:
        # 网格基线
        out.append('<line x1="%d" y1="%d" x2="%d" y2="%d" class="gl" />' % (pad_l, y - 1, width - pad_r, y - 1))
        out.append('<text x="%d" y="%d" class="cl" text-anchor="end">%s</text>'
                   % (pad_l - 9, y + row_h * 0.66, esc(label)))
        if v:
            w = max(2.0, v / vmax * bar_area)
            out.append('<rect x="%d" y="%d" width="%.1f" height="%d" rx="2.5" fill="%s" class="cbar-rect" />'
                       % (pad_l, y + 3, w, row_h - 6, color))
            out.append('<text x="%.1f" y="%d" class="cv">%s</text>'
                       % (pad_l + w + 8, y + row_h * 0.66, esc(_fmt(v))))
        else:
            out.append('<rect x="%d" y="%d" width="%d" height="%d" rx="2.5" class="cna" />'
                       % (pad_l, y + 3, bar_area, row_h - 6))
            out.append('<text x="%d" y="%d" class="cv dim">未公开</text>'
                       % (pad_l + 8, y + row_h * 0.66))
        y += row_h + gap
    out.append('</svg>')
    return ''.join(out)


def donut_chart(items, size=210, thick=34):
    """环形图。items: [(label, value, color)]，value<=0 的项跳过。

    ⚠️ 关键：stroke-dasharray 的每一段都从圆周起点(12点方向)开始画，
    不会因为上一段画过就自动偏移 —— 必须用 stroke-dashoffset 逐段累加，
    否则每段都从 12 点起绘、彼此重叠，只剩最后一段可见（表现为「只有右半圈」）。
    """
    data = [(l, v, c) for l, v, c in items if v and v > 0]
    if not data:
        return ''
    total = sum(v for _, v, _ in data) or 1
    cx = cy = size / 2
    r = (size - thick) / 2 - 1          # 留1px 余量，防描边被viewBox 裁掉
    circ = 2 * math.pi * r
    out = ['<svg class="chart-svg donut" viewBox="0 0 %d %d" style="max-width:%dpx" '
           'role="img">' % (size, size, size),
           '<g transform="rotate(-90 %f %f)">' % (cx, cy)]
    offset = 0.0
    for label, v, color in data:
        frac = v / total
        seg = frac * circ
        # 每段末尾留 1.5px 缝隙；dashoffset 为负表示沿路径正向推进
        out.append('<circle cx="%f" cy="%f" r="%f" fill="none" stroke="%s" stroke-width="%d" '
                   'stroke-dasharray="%.2f %.2f" stroke-dashoffset="%.2f" class="seg" />'
                   % (cx, cy, r, color, thick, max(0.5, seg - 1.5), circ, -offset))
        offset += seg
    out.append('</g>')
    out.append('<text x="%f" y="%f" class="dc-main">%d</text>' % (cx, cy + 2, len(data)))
    out.append('<text x="%f" y="%f" class="dc-sub">项</text>' % (cx, cy + 22))
    out.append('</svg>')
    return ''.join(out)


def hbar_stacked(segs, width=422, height=26):
    """单条百分比堆叠条。segs: [(label, value, color)]，自动算百分比。
    ⚠️ 不用 preserveAspectRatio="none"——那会把圆角矩形横向拉变形；
    段内占比文字也在同一SVG 里按真实宽度排版。"""
    total = sum(v for _, v, _ in segs) or 1
    out = ['<svg class="chart-svg" viewBox="0 0 %d %d" style="max-width:%dpx" '
           'role="img">' % (width, height, width)]
    x = 0.0
    for label, v, color in segs:
        w = v / total * width
        out.append('<rect x="%.2f" y="0" width="%.2f" height="%d" fill="%s" />'
                   % (x, max(0, w - 1.5), height, color))
        # 段够宽才写内联文字
        txt = '%d' % v
        if w > 26:
            out.append('<text x="%.2f" y="%.1f" class="hs-t" text-anchor="middle">%s</text>'
                       % (x + w / 2 - 0.75, height * 0.68, txt))
        x += w
    out.append('</svg>')
    return ''.join(out)


def legend_list(items, total=None, unit=''):
    """图表配套图例（自带百分比）。"""
    tot = total if total is not None else (sum(v for _, v, _ in items) or 1)
    out = ['<ul class="cl-legend">']
    for label, v, color in items:
        pct = (v / tot * 100) if tot else 0
        val = _fmt(v) + unit if v else '—'
        out.append('<li><i style="background:%s"></i><span class="cll">%s</span>'
                   '<span class="clv">%s</span><span class="clp">%s</span></li>'
                   % (color, esc(label), esc(val), ('%.1f%%' % pct) if v else '—'))
    out.append('</ul>')
    return ''.join(out)


def main():
    check = '--check' in sys.argv
    libs = json.load(open(LIB_JSON, encoding='utf-8'))['features']
    by_id = {f['properties']['id']: f for f in libs}

    md_files = sorted(f for f in os.listdir(MD_DIR) if f.endswith('.md'))
    print('md 篇数：%d，libraries.json 点位：%d' % (len(md_files), len(libs)))

    missing = [f['properties']['id'] for f in libs if f['properties']['id'] + '.md' not in md_files]
    if missing:
        print('!! 缺 md：', missing)
    extra = [f for f in md_files if f[:-3] not in by_id]
    if extra:
        print('!! md 无对应点位：', extra)

    # ── 单馆页 ──
    written = []
    for md in md_files:
        lid = md[:-3]
        raw = open(os.path.join(MD_DIR, md), encoding='utf-8').read()
        fm, body = parse_frontmatter(raw)
        f = by_id.get(lid)
        if not f:
            print('!! 跳过（无点位）', md)
            continue
        p = f['properties']
        body_html = md_render(body)
        nwords = len(re.sub(r'<[^>]+>', '', body_html))

        title = fm.get('title', p['name'])
        desc = fm.get('description', '')
        keywords = fm.get('keywords', '')
        h1 = fm.get('h1', p['name'])

        # 同辖区其他馆
        others = [x for x in libs if x['properties']['district'] == p['district']
                  and x['properties']['id'] != lid]
        if not others:
            # 跨区补一条全市入口，避免空区块
            rel_html = ('<a href="../catalog.html"><div class="rd">返回</div>'
                        '<div class="rn">总馆目录</div>'
                        '<div class="rr">本馆是辖区内唯一收录的总馆，'
                        '查看全部 15 处馆舍</div></a>')
        else:
            rel_html = '\n'.join(
                '<a href="%s.html"><div class="rd">%s</div><div class="rn">%s</div>'
                '<div class="rr">%s</div></a>' % (
                    o['properties']['id'], o['properties']['district'],
                    o['properties']['name'], o['properties']['tagline'])
                for o in others)

        jsonld = json.dumps({
            '@context': 'https://schema.org',
            '@type': 'Library',
            'name': p['name'],
            'alternateName': p['alias'],
            'description': desc or p['summary'],
            'address': {'@type': 'PostalAddress',
                        'addressCountry': 'CN',
                        'addressRegion': '广东省',
                        'addressLocality': '深圳市' + p['district'],
                        'streetAddress': p['address']},
            'geo': {'@type': 'GeoCoordinates',
                    'latitude': p['wgs84'][1], 'longitude': p['wgs84'][0]},
            'openingHours': p['visit'],
            'isPartOf': {'@type': 'Organization', 'name': '深圳市图书馆之城统一服务'},
        }, ensure_ascii=False, indent=2)

        pts = [{'type': 'Feature',
                'properties': {'id': x['properties']['id']},
                'geometry': x['geometry']} for x in libs]

        html = render(
            PAGE_TPL,
            title=title, desc=desc, keywords=keywords, jsonld=jsonld,
            slug=SLUG, lib_id=lid, district=p['district'], name=p['name'],
            tier_label='市级馆' if p['tier'] == 'city' else '区级总馆',
            h1=h1, tagline=p['tagline'], summary=p['summary'],
            area_v=(num(round(p['area'])) if p['area'] else '—'),
            area_d='平方米' if p['area'] else '官方未公开',
            coll_v=(('%.2f' % p['collection']).rstrip('0').rstrip('.') if p['collection'] else '—'),
            coll_d='万册（纸质）' if p['collection'] else '官方未公开',
            seats_v=(num(p['seats']) if p['seats'] else '—'),
            seats_d='个' if p['seats'] else '官方未公开',
            founded_v=(str(p['founded']) if p['founded'] else '—'),
            grade=p['grade'],
            address=p['address'], transit=p['transit'], visit=p['visit'],
            lng='%.5f' % f['geometry']['coordinates'][0],
            lat='%.5f' % f['geometry']['coordinates'][1],
            wlon='%.5f' % p['wgs84'][0], wlat='%.5f' % p['wgs84'][1],
            body=body_html, related=rel_html,
            coll_note=p.get('collNote') or '',
            points=json.dumps(pts, ensure_ascii=False, separators=(',', ':')),
        )
        if not check:
            open(os.path.join(OUT_DIR, lid + '.html'), 'w', encoding='utf-8').write(html)
        written.append((lid, p, nwords))
        print('  %-22s %-8s 正文 %4d 字  %s' % (p['name'], p['district'], nwords, lid + '.html'))

    # ── 目录页 ──
    # ⚠️ 目录页在 maps/<slug>/catalog.html，而介绍页在 maps/<slug>/libraries/<id>.html，
    #    相对链接必须带 libraries/ 前缀，否则全 404。
    groups_html = []
    jump_html = []
    totals = {'lib': 0, 'coll': 0.0, 'area': 0.0, 'city': 0, 'grade': 0, 'seats': 0}
    grade_seen = set()
    for _, p, _ in written:
        totals['lib'] += 1
        totals['coll'] += p['collection'] or 0
        totals['area'] += p['area'] or 0
        if p['tier'] == 'city':
            totals['city'] += 1
        if p['seats']:
            totals['seats'] += p['seats']
        # 一级馆按「机构」计：中心馆与北馆同属深圳图书馆一家；大鹏的「市一级」低于地市级，不计
        if re.search(r'级?一级图书馆', p['grade']) and not re.search(r'市一级', p['grade']):
            grade_seen.add('深圳图书馆' if p['tier'] == 'city' else p['name'])
    totals['grade'] = len(grade_seen)

    # ── 图表数据 ──
    # 1) 各馆纸质文献降序（着色按分档，与地图色块同语义）
    chart_coll = []
    for lid, p, _ in sorted(written, key=lambda x: -(x[1]['collection'] or 0)):
        if p['collection']:
            chart_coll.append((p['name'], p['collection'], tier_color_of(p['collection'])))
    # 2) 各区纸质文献合计（占比用环形图）
    dist_coll = []
    for g in GROUP_ORDER:
        s = sum(p['collection'] or 0 for _, p, _ in written if p['district'] == g)
        if s:
            dist_coll.append((g, s, DISTRICT_COLORS[GROUP_ORDER.index(g) % len(DISTRICT_COLORS)]))
    # 3) 建筑面积 vs 纸质文献：每万册占用面积（效率对比）
    eff = []
    for lid, p, _ in written:
        if p['area'] and p['collection']:
            eff.append((p['name'], p['area'] / p['collection'], DISTRICT_COLORS[
                GROUP_ORDER.index(p['district']) % len(DISTRICT_COLORS)] if p['district'] in GROUP_ORDER
                else '#4a86c6'))
    eff.sort(key=lambda x: x[1])
    # 4) 建成年代分布（十年一段）
    ERA = [(1980, 1990, '1980s'), (1990, 2000, '1990s'), (2000, 2010, '2000s'),
           (2010, 2020, '2010s'), (2020, 2030, '2020s')]
    era_items = []
    for lo, hi, lab in ERA:
        c = sum(1 for _, p, _ in written if p['founded'] and lo <= p['founded'] < hi)
        if c:
            era_items.append((lab, c, DISTRICT_COLORS[ERA.index((lo, hi, lab)) % len(DISTRICT_COLORS)]))
    # 5) 馆别与评定构成（堆叠条）
    stack = [
        ('市级馆舍', sum(1 for _, p, _ in written if p['tier'] == 'city'), '#d9a441'),
        ('区级总馆', sum(1 for _, p, _ in written if p['tier'] == 'district'), '#4a86c6'),
    ]

    for g in GROUP_ORDER:
        items = [(lid, p, n) for lid, p, n in written if p['district'] == g]
        if not items:
            continue
        items.sort(key=lambda x: (-(x[1]['collection'] or 0), x[1]['name']))
        coll_sum = sum(p['collection'] or 0 for _, p, _ in items)
        jump_html.append('<a href="#%s">%s<i>%d</i></a>' % (g, g, len(items)))
        rows = []
        for lid, p, _ in items:
            coll = ('%.2f' % p['collection']).rstrip('0').rstrip('.') if p['collection'] else '未公开'
            area = '{:,}'.format(round(p['area'])) if p['area'] else '未公开'
            seats = '{:,}'.format(p['seats']) if p['seats'] else '—'
            badge = ('<span class="cb cb-city">市级</span>' if p['tier'] == 'city'
                     else '<span class="cb cb-dist">区级</span>')
            bar = ''
            if p['collection']:
                w = max(3, round(p['collection'] / (max((q['collection'] or 0) for _, q, _ in items) or 1) * 100))
                bar = ('<span class="cbar"><i style="width:%d%%;background:%s"></i></span>'
                       % (w, tier_color_of(p['collection'])))
            else:
                bar = '<span class="cbar"><i class="na"></i></span>'
            founded = str(p['founded']) if p['founded'] else '—'
            rows.append(
                '<tr>'
                '<td class="cname"><a href="libraries/%s.html">%s</a>%s'
                '<span class="ctag">%s</span></td>'
                '<td class="ccoll">%s</td>'
                '<td class="cbar-cell">%s</td>'
                '<td class="cnum">%s</td>'
                '<td class="cnum">%s</td>'
                '<td class="cnum">%s</td>'
                '<td class="cnote">%s</td>'
                '</tr>' % (
                    lid, esc(p['name']), badge, esc(p['tagline']),
                    coll, bar, area, seats, founded, esc(p['address'])))
        groups_html.append(
            '<section class="lsec" id="%s">'
            '<h2>%s<span class="h2n">%d 处 · 纸质文献 %s 万册</span></h2>'
            '<div class="ctable-wrap"><table class="ctable">'
            '<thead><tr><th>馆名</th><th>纸质文献<br><small>万册</small></th><th></th>'
            '<th>建筑面积<br><small>m²</small></th><th>座位</th><th>开馆</th><th>馆址</th></tr></thead>'
            '<tbody>%s</tbody></table></div></section>' % (
                g, g, len(items), ('%.0f' % coll_sum), ''.join(rows)))

    charts_html = (
        # ① 各馆纸质文献（横向条形，与地图分档同色）
        '<section class="lsec" id="charts">'
        '<h2>数据一览<span class="h2n">15 处馆舍 · 四个角度</span></h2>'
        '<div class="chart-grid">'

        '<figure class="chart-card chart-wide">'
        '<figcaption><b>各馆纸质文献藏量</b>'
        '<span>15 处馆舍中 12 处公开了纸质文献口径。条形颜色对应地图上的分档：'
        '红 ≥280 万 / 橙 180–279 / 绿 40–179 / 蓝 &lt;40 万。</span></figcaption>'
        # 宽卡在 1440 视口下内容区约 1370px，取 1180 让字号接近 1:1。
        # 窄屏（430px 视口，内容区约 422px）另给一份窄 viewBox，见 chart_coll_narrow。
        + '<div class="chart-wide-only">' + bar_chart(
            chart_coll, '万册', width=1180, row_h=28, gap=5, pad_l=118, pad_r=66) + '</div>'
        + '<div class="chart-narrow-only">' + bar_chart(
            chart_coll, '万册', width=422, row_h=24, gap=4, pad_l=98, pad_r=56) + '</div>'
        + '<p class="cnote-inline">另有 3 处馆舍（深圳大学城图书馆、罗湖区图书馆新馆、'
          '龙岗区少年儿童馆）官网未公布独立纸质藏量口径，未参与本图排序。</p>'
        '</figure>'

        '<figure class="chart-card">'
        '<figcaption><b>各区纸质文献合计</b><span>市级馆舍计入其所在辖区</span></figcaption>'
        + donut_chart(dist_coll, size=200, thick=32)
        + legend_list(dist_coll, unit='万册')
        + '</figure>'

        '<figure class="chart-card">'
        '<figcaption><b>每万册占用建筑面积</b>'
        '<span>越低越「紧凑」，衡量藏书与空间的匹配效率</span></figcaption>'
        # 半宽卡在1440 视口下内容区约 422px，viewBox 取 422 让字号接近 1:1
        + bar_chart([(n, round(v, 2), c) for n, v, c in eff], 'm²/万册', width=422,
                    row_h=24, gap=4, pad_l=96, pad_r=56)
        + '<p class="cnote-inline">坪山图书馆的绿色建筑做法（自然通风、'
          '2.4 万㎡ 中心公园衔接）让它在这项上排在最前。</p>'
        '</figure>'

        '<figure class="chart-card">'
        '<figcaption><b>建成年代分布</b><span>按现馆舍开放年份</span></figcaption>'
        + hbar_stacked(era_items, width=422, height=30)
        + legend_list(era_items, total=totals['lib'], unit=' 处')
        + '<p class="cnote-inline">2010 年后新建的 6 处占 40%%，'
          '全部落在深圳北部与东部——正是过去十年产业与人口增长最快的方向。</p>'
        '</figure>'

        '<figure class="chart-card chart-wide">'
        '<figcaption><b>馆别构成</b><span>2 家市级机构（含深圳图书馆中心馆与北馆两处馆舍）'
        'vs 11 处区级总馆</span></figcaption>'
        + hbar_stacked(stack, width=1180, height=30)
        + legend_list(stack, total=totals['lib'], unit=' 处')
        + '<p class="cnote-inline">深圳是全国少数拥有<b>两家市级公共图书馆</b>的城市，'
          '其中一家就有两处馆舍——这也是本图把市级机构拆成 4 个点位收录的原因。</p>'
        '</figure>'

        '</div></section>'
    )

    catalog_html = render(
        CATALOG_TPL,
        n_lib=totals['lib'], n_city=totals['city'], n_grade=totals['grade'],
        coll_total=('{:,.0f}'.format(totals['coll'])),
        area_total=('{:,.0f}'.format(totals['area'])),
        seats_total=('{:,.0f}'.format(totals['seats'])),
        jump=''.join(jump_html),
        charts=charts_html,
        groups='\n'.join(groups_html))
    if not check:
        open(os.path.join(BASE, 'catalog.html'), 'w', encoding='utf-8').write(catalog_html)
    print('  catalog.html（%d 组 / %d 馆）' % (len(groups_html), len(written)))

    short = [(p['name'], n) for _, p, n in written if n < 500]
    if short:
        print('!! 正文偏短（<500 字）：', short)
    else:
        print('全部馆页正文均≥500 字，SEO 长度达标')


if __name__ == '__main__':
    main()