#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""万里长江 · 一江八脉 —— 封面图生成
==============================================================================
用地图自己的那份几何数据（public/maps/cn-yangtze/data/rivers.json）渲染封面，
所以封面与地图永远同源：数据变了重跑本脚本，封面自动跟着变。

产物：
    public/maps/cn-yangtze/cover.svg   矢量封面（保留，便于再编辑）
    public/maps/cn-yangtze/cover.jpg   栅格封面（主站卡片用，16:9）

栅格化依赖本机 Chrome / Edge；找不到时只出 SVG，不报错。

用法：
    python scripts/gen_cn_yangtze_cover.py
"""
import json
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAP = os.path.join(ROOT, 'public', 'maps', 'cn-yangtze')
RIVERS = os.path.join(MAP, 'data', 'rivers.json')
PROVINCES = os.path.join(ROOT, 'public', 'maps', '_shared', 'china-provinces.json')

W, H = 1200, 675
PAD = 26

COLORS = {
    'yangtze-mainstream': '#f5b544', 'yalong-river': '#1fd0f7', 'min-river': '#35a9f5',
    'jialing-river': '#4a82f5', 'wu-river': '#8b7cf7', 'xiang-river': '#00e6c3',
    'yuan-river': '#00d0a4', 'han-river': '#1fd6a0', 'gan-river': '#71e97f',
}
CHROME_CANDIDATES = [
    os.environ.get('CHROME_PATH', ''),
    r'C:\Users\ZhuanZ\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe',
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
]


def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        ax, ay = pts[i]
        bx, by = pts[j]
        dx, dy = bx - ax, by - ay
        norm = (dx * dx + dy * dy) ** 0.5
        worst, wi = -1.0, -1
        for k in range(i + 1, j):
            px, py = pts[k]
            d = ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5 if norm == 0 else \
                abs(dx * (ay - py) - dy * (ax - px)) / norm
            if d > worst:
                worst, wi = d, k
        if worst > eps:
            keep[wi] = True
            stack.append((i, wi))
            stack.append((wi, j))
    out = []
    for p, k in zip(pts, keep):
        if k and (not out or p != out[-1]):
            out.append(p)
    return out


def rings(geom):
    t, c = geom['type'], geom['coordinates']
    if t == 'LineString':
        return [c]
    if t == 'MultiLineString':
        return c
    if t == 'Polygon':
        return c
    if t == 'MultiPolygon':
        return [r for poly in c for r in poly]
    return []


def main():
    with open(RIVERS, encoding='utf-8') as f:
        fc = json.load(f)

    # 范围：把所有河线框进来，四周留一点空
    xs, ys = [], []
    for f_ in fc['features']:
        for c in f_['geometry']['coordinates']:
            xs.append(c[0]); ys.append(c[1])
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    x0 -= 0.35; x1 += 0.35; y0 -= 0.35; y1 += 0.35

    s = min((W - 2 * PAD) / (x1 - x0), (H - 2 * PAD) / (y1 - y0))
    ox = PAD + ((W - 2 * PAD) - (x1 - x0) * s) / 2
    oy = PAD + ((H - 2 * PAD) - (y1 - y0) * s) / 2

    def xy(lon, lat):
        return round(ox + (lon - x0) * s, 1), round(oy + (y1 - lat) * s, 1)

    def path_of(geom, eps):
        out = []
        for r in rings(geom):
            if len(r) < 2:
                continue
            pts = rdp([xy(p[0], p[1]) for p in r], eps)
            if len(pts) >= 2:
                out.append('M' + 'L'.join('%g %g' % p for p in pts))
        return ''.join(out)

    parts = []
    # 省界：极淡的底纹，给一点地理参照（GCJ-02 与本图 WGS84 在此尺度上偏差 < 1px）
    if os.path.exists(PROVINCES):
        with open(PROVINCES, encoding='utf-8') as f:
            prov = json.load(f)
        d = ''.join(path_of(ft['geometry'], 1.4) for ft in prov['features'])
        parts.append('<path d="%s" fill="none" stroke="#8aa6c8" stroke-opacity="0.16" stroke-width="0.9"/>' % d)

    # 河流：先暗描边再上色；干流最粗
    order = ['yangtze-mainstream', 'yalong-river', 'min-river', 'jialing-river',
             'wu-river', 'xiang-river', 'yuan-river', 'han-river', 'gan-river']
    by_code = {f_['properties']['code']: f_ for f_ in fc['features']}
    for code in order:
        f_ = by_code.get(code)
        if not f_:
            continue
        d = path_of(f_['geometry'], 1.1)
        main = code == 'yangtze-mainstream'
        col = COLORS[code]
        parts.append('<path d="%s" fill="none" stroke="#03101d" stroke-opacity="0.9" '
                     'stroke-width="%.1f" stroke-linecap="round" stroke-linejoin="round"/>'
                     % (d, 9.0 if main else 6.4))
        parts.append('<path d="%s" fill="none" stroke="%s" stroke-opacity="0.95" filter="url(#soft)" '
                     'stroke-width="%.1f" stroke-linecap="round" stroke-linejoin="round"/>'
                     % (d, col, 4.4 if main else 2.9))

    # 右下角小图例（干流 + 八脉，按列自上而下）
    legend = ['<g font-size="14" fill="#9fb4cd">']
    lx, ly = W - 292, H - 158
    per_col = 5
    for i, code in enumerate(order):
        c, r = i // per_col, i % per_col
        px, py = lx + c * 148, ly + r * 25
        nm = by_code[code]['properties']['name']
        legend.append('<circle cx="%d" cy="%d" r="4" fill="%s"/>' % (px, py - 4, COLORS[code]))
        legend.append('<text x="%d" y="%d">%s</text>' % (px + 11, py, nm))
    legend.append('</g>')

    svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="万里长江 一江八脉">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0" stop-color="#070d18"/><stop offset="1" stop-color="#0e1c30"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.62" cy="0.28" r="0.62">
      <stop offset="0" stop-color="#f5b544" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#f5b544" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ttl" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#ffd98a"/><stop offset="0.55" stop-color="#f5b544"/><stop offset="1" stop-color="#e08c2a"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#050a12" stop-opacity="0"/>
      <stop offset="0.55" stop-color="#050a12" stop-opacity="0.72"/>
      <stop offset="1" stop-color="#050a12" stop-opacity="0.94"/>
    </linearGradient>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#bg)"/>
  <rect width="{W}" height="{H}" fill="url(#glow)"/>
  <g>{parts}</g>
  <rect width="{W}" height="{H}" fill="url(#scrim)"/>
  <g font-family="PingFang SC, Microsoft YaHei, Noto Sans CJK SC, sans-serif">
    <text x="52" y="{ty1}" fill="#cfdcec" font-size="30" font-weight="700" letter-spacing="2">万里长江</text>
    <text x="52" y="{ty2}" fill="url(#ttl)" font-size="62" font-weight="800" letter-spacing="4">一江八脉</text>
    <text x="54" y="{ty3}" fill="#8fa3bd" font-size="17">长江干流与雅砻江 / 岷江 / 嘉陵江 / 乌江 / 湘江 / 沅江 / 汉江 / 赣江</text>
    {legend}
  </g>
</svg>
'''.format(W=W, H=H, parts=''.join(parts), legend=''.join(legend),
           ty1='' if False else 512, ty2=580, ty3=616)

    os.makedirs(MAP, exist_ok=True)
    svg_path = os.path.join(MAP, 'cover.svg')
    with open(svg_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(svg)
    print('[cover] %s  %.0f KB' % (os.path.relpath(svg_path, ROOT), os.path.getsize(svg_path) / 1024))

    # 栅格化：SVG 内联在 HTML 里，保证 1:1 不缩放、无外边距
    html = ('<!DOCTYPE html><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;'
            'background:#070d18}svg{display:block}</style>' + svg)
    tmp_html = os.path.join(MAP, '_cover.html')
    with open(tmp_html, 'w', encoding='utf-8', newline='\n') as f:
        f.write(html)

    chrome = next((p for p in CHROME_CANDIDATES if p and os.path.exists(p)), None)
    if not chrome:
        print('[cover] 未找到 Chrome / Edge，跳过栅格化；SVG 已生成。')
        return
    jpg = os.path.join(MAP, 'cover.jpg')
    cmd = [chrome, '--headless=new', '--no-sandbox', '--hide-scrollbars', '--force-device-scale-factor=1',
           '--window-size=%d,%d' % (W, H), '--screenshot=' + jpg, 'file:///' + tmp_html.replace('\\', '/')]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)
    if os.path.exists(jpg):
        print('[cover] %s  %.0f KB' % (os.path.relpath(jpg, ROOT), os.path.getsize(jpg) / 1024))
    else:
        print('[cover] 栅格化失败，仅保留 SVG。')
    try:
        os.remove(tmp_html)
    except OSError:
        pass


if __name__ == '__main__':
    main()
