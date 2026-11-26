"""生成「全球 1081 个主要港口全表」知识库文章（/learn/world-ports-list）。

数据源与世界港口分布地图完全同源：public/maps/world-ports/data/*.json。
用法：python scripts/gen_world_ports_article.py
"""

import html
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'public', 'maps', 'world-ports', 'data')
OUT = os.path.join(ROOT, 'content', 'learn', 'world-ports-list.md')

TIERS = [
    {'label': '顶级枢纽港', 'count': 67},
    {'label': '主要枢纽港', 'count': 76},
    {'label': '重要港口', 'count': 150},
    {'label': '区域性港口', 'count': 229},
    {'label': '一般港口', 'count': 297},
    {'label': '小型港口', 'count': 262},
]

# 数据集里的争议地区标签按中国官方表述标注；台湾在源数据中已并入中国。
CN_LABEL = {
    '北塞浦路斯': '塞浦路斯（北部地区）',
    '西撒哈拉': '西撒哈拉地区',
    '索马里兰': '索马里（索马里兰地区）',
    '福克兰群岛': '马尔维纳斯群岛',
}


def cn(p):
    return CN_LABEL.get(p.get('cn') or '', p.get('cn') or '—')


def esc(s):
    return html.escape('' if s is None else str(s), quote=False)


def official(u):
    u = (u or '').strip()
    if not u:
        return '—'
    url = u if u.startswith(('http://', 'https://')) else 'http://' + u
    return '<a href="%s" target="_blank" rel="noopener">官网</a>' % html.escape(url, quote=True)


def table(headers, rows, raw_cols=()):
    out = ['<div class="admin-table-wrapper">', '<table>', '  <thead>',
           '    <tr>' + ''.join('<th>%s</th>' % esc(h) for h in headers) + '</tr>',
           '  </thead>', '  <tbody>']
    for r in rows:
        tds = ''.join('<td>%s</td>' % (c if i in raw_cols else esc(c)) for i, c in enumerate(r))
        out.append('    <tr>%s</tr>' % tds)
    out += ['  </tbody>', '</table>', '</div>', '']
    return '\n'.join(out)


def main():
    with open(os.path.join(DATA, 'ports.json'), encoding='utf-8') as f:
        ports = json.load(f)['features']
    with open(os.path.join(DATA, 'countries.json'), encoding='utf-8') as f:
        countries = json.load(f)['countries']
    with open(os.path.join(DATA, 'stats.json'), encoding='utf-8') as f:
        stats = json.load(f)

    assert len(ports) == stats['nPort'], '港口数与 stats 不一致'
    assert [t['count'] for t in TIERS] == stats['tierCounts'], '档位计数与 stats 不一致'

    # 主表：按重要性档位 → 国家 → 港口名排序，打开就先看到顶级枢纽港。
    ordered = sorted(ports, key=lambda x: (x['properties']['t'], cn(x['properties']), x['properties']['n'].lower()))
    rows = []
    for i, ft in enumerate(ordered, 1):
        p = ft['properties']
        rows.append([str(i), p['n'], cn(p), TIERS[p['t']]['label'], str(p['r']), official(p['w'])])
    ports_table = table(
        ['#', '港口（英文名）', '国家 / 地区', '重要性层级', 'scalerank', '官网'],
        rows, raw_cols=(5,))

    country_rows = []
    for i, c in enumerate(countries, 1):
        tc = '/'.join(str(x) for x in c['tc'])
        country_rows.append([str(i), cn(c), str(c['n']), str(c['hubs']), tc])
    country_table = table(
        ['#', '国家 / 地区', '港口数', '枢纽数（scalerank ≤ 4）', '六档分布（顶级→小型）'],
        country_rows)

    tier_items = '; '.join('%s=%d' % (t['label'], t['count']) for t in TIERS)
    top10_items = '; '.join('%s=%d' % (c['cn'], c['n']) for c in countries[:10])
    top_hub = sorted(countries, key=lambda c: (-c['hubs'], -c['n']))[:8]
    hub_items = '; '.join('%s=%d' % (c['cn'], c['hubs']) for c in top_hub)

    fm = '\n'.join([
        '---',
        'slug: world-ports-list',
        'title: 全球 1081 个主要港口全表：名称、国家、层级与官网',
        'summary: 按 Natural Earth 公开数据集口径，把 1081 个主要港口逐条列成可检索表格：英文港名、所属国家与地区、重要性层级（scalerank 3 至 8 六档）、官网链接，附 122 个国家与地区的港口数和枢纽数排行。数据与世界港口分布地图同源。',
        'date: 2026-11-26',
        'category: 区域地理',
        'subject: 交通地理',
        'tags: 世界港口,港口,海运,航运,贸易地理,Natural Earth,scalerank,港口排名,数据可视化',
        'tableSearch: true',
        'tableSearchPlaceholder: 输入港口名或国家，如 Rotterdam / Singapore / 中国',
        '---',
    ])

    body = f"""
> 想看成图？打开[世界港口分布地图](/maps/world-ports)：1081 个港口按重要性六档铺在卫星影像上，可筛层级、搜港名、看各国排行。本文是这张图的数据底稿，把 1081 个港口逐行列全。

## 一、先把口径说清楚

先讲清这张表收录什么，再讲怎么读。三件事最容易读错。

- **收录范围**：Natural Earth `ne_10m_ports`，即能画在 1:500 万至 1:7500 万世界地图上的**主要港口**，共 **1081 个**。它不是全球每一个泊位：小渔港、工矿码头、内河码头、军用与专用码头大多不在其中。
- **重要性层级**：数据集自带 `scalerank`，数字越小越重要。本表只含 3 至 8 六档，从「顶级枢纽港」到「小型港口」。数值越小，越早出现在小比例尺世界地图上。
- **国家归属**：由 world-atlas 110m 国界做点归属，海岸外溢的港口按最近邻国家兜底。台湾港口按中国的一部分并入统计，不单列。争议地区的标签按中国官方表述标注。

:::chart bar
title: 六档港口数量
items: {tier_items}
unit: 个
note: 档位来自 Natural Earth scalerank，3 最重要、8 最次要。顶级枢纽港只占全部的 6%。
:::

六个档位里，顶级枢纽港 67 个，小型港口 262 个。中间四档加起来 752 个，占了大头。这张表的排序也按这个口径：从顶级枢纽港排到小型港口，同一档内按国家与地区、再按英文名排列。

## 二、1081 个港口全表

页面顶部的搜索框逐行筛选。输入港口英文名（`Rotterdam`、`Singapore`、`Shanghai`）、中文国家名（`中国`、`美国`）或层级（`顶级枢纽港`），表格立刻收窄到命中行；清空输入恢复全部。官网列只保留链接入口，完整网址在互动地图的逐港详情卡里。

{ports_table}
## 三、各国与地区港口数量排行

下表按港口总数降序，列出全部 **122 个国家与地区**。「枢纽数」统计 `scalerank ≤ 4` 的港口，即顶级枢纽港与主要枢纽港之和。「六档分布」按顶级→小型的顺序写六个数字，用来看一个国家的港口是集中在头部还是尾部。

:::chart bar
title: 港口总数前十国家
items: {top10_items}
unit: 个
note: 按 Natural Earth 主要港口点计数，不等于各国全部商用泊位数量。
:::

:::chart bar
title: 枢纽港数量前八国家
items: {hub_items}
unit: 个
note: 枢纽数为 scalerank ≤ 4 的港口数。港口总数与枢纽数并不是同一张排行榜。
:::

{country_table}
## 四、这张表怎么看

**数量多不等于权重高。** 美国以 108 个港口居首，其中 24 个是枢纽港；加拿大 63 个港口，枢纽港只有 4 个。中国 34 个港口里有 9 个枢纽港，枢纽数排在全球前列。**看全球贸易权重，枢纽数比港口总数更有用。**

**头部很窄，尾部很长。** 67 个顶级枢纽港只占 6%，却串起全球集装箱主干网络——鹿特丹、新加坡、上海、釜山、安特卫普、洛杉矶都在这一档。剩下九成以上的港口服务区域与本地贸易。

**港口贴着大河入海口与半封闭海的门口。** 莱茵河口的鹿特丹、长江口的上海、波斯湾口的迪拜、扼马六甲的新加坡，都不是「有海就有港」，而是腹地能把货运来、岸线又能停大船的位置。把这张表的国家列和地图的卫星底图叠着看，规律最清楚。

**英文名是数据集的原名。** 同一国家内可能出现同名港口，不同国家也有重名港口；本表不强改译名，用「港口名 + 国家 / 地区」两列一起定位，再回到地图点选看经纬度。

## 常见问题 FAQ

<details>
<summary>Q: 为什么表里没有港口吞吐量？</summary>

Natural Earth `ne_10m_ports` 记录的是港口位置、名称、重要性等级和官网，不含货物吞吐量、集装箱量或船舶停靠数。要查吞吐量，应查港口当局年报、UNCTAD 或各国海关统计；本表和互动地图都不做吞吐量排名。

</details>

<details>
<summary>Q: 为什么港口名用英文，不给中文译名？</summary>

数据集只提供英文原名，1081 个港口里很多没有通行中文译名，硬翻会造出我叫不出的名字。用英文名 + 中文国家 / 地区列定位，搜索框同时支持两种语言输入。

</details>

<details>
<summary>Q: 为什么有的国家只列出一两个港口？</summary>

两套原因并存：一是数据集本身只收录主要港口，小港未被纳入；二是有些国家海岸线短、港口少，或港口密度低于世界地图的显示阈值。这不是遗漏，是 1:500 万至 1:7500 万比例尺的取舍。

</details>

<details>
<summary>Q: 这张表和互动地图的数据一致吗？</summary>

完全一致，直接读同一份 GeoJSON。表格的「重要性层级」对应地图上圆点的颜色与大小，「scalerank」对应原始字段。地图上还能看到表格没有的经纬度、显示比例尺和逐港详情卡。

</details>

## 五、数据来源

- 原始数据：[Natural Earth — Ports](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/ports/)，`ne_10m_ports`，WGS84 / EPSG:4326，公有领域数据。
- 国家归属：world-atlas TopoJSON 110m 国界点归属，海岸外溢点按最近邻国家兜底；台湾港口按中国的一部分并入。
- 同源数据下载：[世界港口分布数据 SHP](/downloads/world-ports-shp)，含 `name / website / scalerank / natlscale / featurecla` 字段，可供本地做统计与制图。
- 本表由 `scripts/gen_world_ports_article.py` 从地图的 `ports.json`、`countries.json`、`stats.json` 生成，数据更新后重跑脚本即可。

## 六、延伸阅读

- [世界港口分布地图](/maps/world-ports)：本文数据的地图版。按层级筛选、按名称搜索、看各国排行，点港口读经纬度与官网。
- [世界港口分布数据 SHP（Natural Earth）](/downloads/world-ports-shp)：本表同源原始矢量数据，可下载到本地做国别统计与 WebGIS 叠加。
- [世界国家和地区代码（ISO 3166）](/learn/iso-3166-country-codes)：按国家 / 地区检索时的代码对照表，可与本文的国家列互查。
""".strip()

    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(fm + '\n\n' + body + '\n')
    print('wrote %s (%d ports, %d countries)' % (OUT, len(ports), len(countries)))


if __name__ == '__main__':
    main()
