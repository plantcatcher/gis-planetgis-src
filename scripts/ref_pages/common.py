"""速查表类学习页（/learn/*）的共用工具：数据缓存下载 + HTML 表格渲染。

表格统一输出为 <div class="admin-table-wrapper"><table>…，
与 src/index.css 的样式和 TableSearch 页内筛选组件配套。
"""
import html
import os
import re
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CACHE = os.environ.get('REF_CACHE', '/tmp/geodata')
LEARN = os.path.join(ROOT, 'content', 'learn')


def fetch(url: str, name: str) -> str:
    """下载到缓存目录（已存在则复用），返回本地路径。"""
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, name)
    if not os.path.exists(path):
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as r, open(path, 'wb') as f:
            f.write(r.read())
    return path


def esc(s) -> str:
    return html.escape('' if s is None else str(s), quote=False)


def table(headers, rows, row_class=None, raw_cols=()) -> str:
    """rows: list[list]；raw_cols 中的列下标不做转义（用于 <code> / 链接）。"""
    out = ['<div class="admin-table-wrapper">', '<table>', '  <thead>',
           '    <tr>' + ''.join(f'<th>{esc(h)}</th>' for h in headers) + '</tr>',
           '  </thead>', '  <tbody>']
    for i, r in enumerate(rows):
        cls = row_class(r) if row_class else None
        tds = ''.join(f'<td>{c if j in raw_cols else esc(c)}</td>' for j, c in enumerate(r))
        out.append(f'    <tr class="{cls}">{tds}</tr>' if cls else f'    <tr>{tds}</tr>')
    out += ['  </tbody>', '</table>', '</div>', '']
    return '\n'.join(out)


def code(s) -> str:
    return f'<code>{esc(s)}</code>'


def faq(items) -> str:
    """items: [(问题, 答案markdown)] → 站内统一的 <details><summary>Q: …> 结构（extractFaq 可解析）。"""
    out = ['## 常见问题 FAQ', '']
    for q, a in items:
        out += ['<details>', f'<summary>Q: {q}</summary>', '', a.strip(), '', '</details>', '']
    return '\n'.join(out)


# 「地理编码速查」系列：每篇末尾互链，形成主题集群
SERIES = [
    ('china-admin-division-codes', '行政区划代码全表'),
    ('id-card-region-codes', '身份证前六位地区码对照'),
    ('china-provinces-overview', '34 个省级行政区一览'),
    ('china-license-plate-codes', '全国车牌代码对照表'),
    ('china-telephone-area-codes', '全国电话区号表'),
    ('china-postal-codes', '全国邮政编码表'),
    ('china-airport-codes', '全国机场三字码 / 四字码'),
    ('iso-3166-country-codes', '世界国家和地区代码（ISO 3166）'),
    ('china-epsg-codes', '中国常用坐标系 EPSG 代码'),
    ('gauss-kruger-zone-table', '高斯-克吕格分带带号对照'),
    ('land-sea-use-classification-codes', '用地用海分类代码表'),
    ('china-river-codes', '河流国标码'),
]


def series_block(slug: str) -> str:
    items = [f'- [{t}](/learn/{s})' for s, t in SERIES if s != slug]
    return '\n## 地理编码速查系列\n\n' + '\n'.join(items) + '\n'


def write_page(slug: str, frontmatter: dict, body: str) -> str:
    body = body + series_block(slug)
    fm = ['---'] + [f'{k}: {v}' for k, v in frontmatter.items() if v not in (None, '')] + ['---', '']
    path = os.path.join(LEARN, f'{slug}.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(fm) + '\n' + re.sub(r'\n{3,}', '\n\n', body).strip() + '\n')
    return path
