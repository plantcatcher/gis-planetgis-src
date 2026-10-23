#!/usr/bin/env python3
"""幂等地把 <script src="/shared/map-i18n.js"></script> 注入 82 个地图 + 3 个游戏的 index.html。

放在 <head> 之后、首个 <script> 之前（若存在 ga-bridge.js 则紧跟其后），
保证 window.__mapI18nOn 在应用 JS 读取前已置位。

**geoquiz 例外**：它自带完整的 data-i18n 中英系统（public/games/geoquiz/i18n.js，
已支持 ?lang=en），通用引擎对它冗余且会与它自己的 lang 属性抢写，故不注入。

用法：python scripts/_inject_i18n_html.py
"""
import glob
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRIPT_LINE = '  <script src="/shared/map-i18n.js"></script>\n'
# 自带 i18n 系统、不需要通用引擎的游戏
SKIP_APPS = {'geoquiz'}

files = sorted(glob.glob(os.path.join(ROOT, 'public', 'maps', '*', 'index.html'))) + \
        [f for f in sorted(glob.glob(os.path.join(ROOT, 'public', 'games', '*', 'index.html')))
         if os.path.basename(os.path.dirname(f)) not in SKIP_APPS]

done = 0
skipped = 0
for f in files:
    html = open(f, encoding='utf-8').read()
    if 'map-i18n.js' in html:
        skipped += 1
        continue
    # 优先紧跟 ga-bridge.js 那一行（保持 shared 脚本聚拢）；否则紧跟 <head>
    if '<script src="/shared/ga-bridge.js"></script>' in html:
        anchor = '<script src="/shared/ga-bridge.js"></script>\n'
        if anchor in html:
            html = html.replace(anchor, anchor + SCRIPT_LINE, 1)
        else:
            html = html.replace('<head>', '<head>\n' + SCRIPT_LINE, 1)
    else:
        html = html.replace('<head>', '<head>\n' + SCRIPT_LINE, 1)
    open(f, 'w', encoding='utf-8').write(html)
    done += 1

print(f'injected={done} skipped={skipped} total={len(files)}')
