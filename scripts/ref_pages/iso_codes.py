"""生成 content/learn/iso-3166-country-codes.md：世界国家和地区代码（ISO 3166-1）中英文对照。

数据：
  - 代码与 UN M49 分区：lukes/ISO-3166-Countries-with-Regional-Codes（all.csv）
  - 中文名：Unicode CLDR（cldr-json, zh territories），台湾 / 香港 / 澳门等按我国规范名称改写
用法：python3 scripts/ref_pages/iso_codes.py
"""
import csv
import json
import os

from common import LEARN, code, faq, fetch, table, write_page

UPDATED = '2026-11-15'
ISO = 'https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv'
CLDR = 'https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-localenames-full/main/zh/territories.json'
NAME_FIX = {
    'TW': '中国台湾',
    'HK': '中国香港',
    'MO': '中国澳门',
    'PS': '巴勒斯坦',
    'FK': '福克兰群岛（马尔维纳斯群岛）',
}
REGION = {'Asia': '亚洲', 'Europe': '欧洲', 'Africa': '非洲', 'Americas': '美洲', 'Oceania': '大洋洲'}
SUB = {
    'Southern Asia': '南亚', 'Eastern Asia': '东亚', 'South-eastern Asia': '东南亚', 'Central Asia': '中亚',
    'Western Asia': '西亚', 'Northern Europe': '北欧', 'Southern Europe': '南欧', 'Western Europe': '西欧',
    'Eastern Europe': '东欧', 'Northern Africa': '北非', 'Sub-Saharan Africa': '撒哈拉以南非洲',
    'Northern America': '北美', 'Latin America and the Caribbean': '拉丁美洲和加勒比',
    'Australia and New Zealand': '澳大利亚和新西兰', 'Melanesia': '美拉尼西亚', 'Micronesia': '密克罗尼西亚',
    'Polynesia': '波利尼西亚',
}
ORDER = ['亚洲', '欧洲', '非洲', '美洲', '大洋洲', '其他']


def build():
    zh = json.load(open(fetch(CLDR, 'cldr_zh.json'), encoding='utf-8'))['main']['zh']['localeDisplayNames']['territories']
    rows = list(csv.DictReader(open(fetch(ISO, 'iso.csv'), encoding='utf-8')))
    assert len(rows) == 249, len(rows)
    gadm = {f[7:10] for f in os.listdir(os.path.join(os.path.dirname(LEARN), 'downloads')) if f.startswith('gadm41-')}

    groups = {k: [] for k in ORDER}
    for r in rows:
        a2, a3 = r['alpha-2'], r['alpha-3']
        name = NAME_FIX.get(a2) or zh[a2]
        reg = '亚洲' if a2 == 'TW' else REGION.get(r['region'], '其他')
        sub = '东亚' if a2 == 'TW' else SUB.get(r['sub-region'], '')
        a3cell = code(a3)
        if a3.lower() in gadm:
            a3cell += f' · <a href="/downloads/gadm41-{a3.lower()}-shp">GADM 数据</a>'
        groups[reg].append([code(a2), a3cell, code(r['country-code']), name, r['name'], sub or '—'])

    sections = []
    for reg in ORDER:
        g = sorted(groups[reg], key=lambda x: x[0])
        if not g:
            continue
        sections.append(f'### {reg}（{len(g)} 个）\n\n' + table(
            ['二字母', '三字母', '数字', '中文名称', '英文名称（ISO）', '分区（UN M49）'], g, raw_cols=(0, 1, 2)))

    examples = [
        [code('CN'), code('CHN'), code('156'), '中国', '域名 .cn、护照国籍 CHN、GADM 文件名 gadm41_CHN'],
        [code('US'), code('USA'), code('840'), '美国', '域名 .us，IP 地理库国家字段 US'],
        [code('JP'), code('JPN'), code('392'), '日本', '奥运会代码也是 JPN，但不总是和 ISO 一致'],
        [code('GB'), code('GBR'), code('826'), '英国', '注意域名用 .uk，不是 .gb'],
        [code('DE'), code('DEU'), code('276'), '德国', '奥运会 / 国际足联代码是 GER，不是 DEU'],
    ]

    body = f"""
> 本页收录 ISO 3166-1 全部 **{len(rows)} 个**国家和地区代码（二字母、三字母、数字三种），配中英文名称和联合国 M49 地理分区，按大洲分组。顶部搜索框可直接输入 `JPN`、`392`、`日本` 或 `Japan` 查询。

## 一、ISO 3166-1 是什么

ISO 3166-1 是国际标准化组织（ISO）发布的**国家和地区代码标准**，我国的等同标准是 **GB/T 2659.1《世界各国和地区及其行政区划名称代码 第 1 部分：国家和地区代码》**。它为每个国家和地区规定了三种代码：

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>代码</th><th>形式</th><th>常见用途</th></tr>
  </thead>
  <tbody>
    <tr><td>alpha-2 二字母</td><td><code>CN</code></td><td>国家顶级域名（.cn）、语言区域标识（zh-CN）、IP 地理库、银行 SWIFT 代码第 5–6 位</td></tr>
    <tr><td>alpha-3 三字母</td><td><code>CHN</code></td><td>护照机读区、联合国统计、GIS 数据（GADM、Natural Earth 的 ISO_A3 字段）</td></tr>
    <tr><td>numeric 数字</td><td><code>156</code></td><td>与联合国 M49 统计代码一致，不依赖拉丁字母，适合跨语言系统</td></tr>
  </tbody>
</table>
</div>

## 二、几个容易搞混的例子

{table(['二字母', '三字母', '数字', '国家', '说明'], examples, raw_cols=(0, 1, 2))}

奥运会代码（IOC）、国际足联代码（FIFA）、国际车辆识别代码（如德国车尾的 D）**都不是 ISO 3166**，做数据匹配时不要混用。

## 三、在 GIS 里怎么用

- **挂接统计数据**：世界银行、联合国等机构的国别数据几乎都带 ISO alpha-3 字段，用它挂接世界行政区划矢量，比用国家名称匹配可靠得多（名称有简称、旧称、各种拼写）。
- **GADM 数据**：GADM 的文件按 alpha-3 命名（如 `gadm41_JPN_1.shp`）。下表里带「GADM 数据」链接的国家，本站已整理了可直接下载的行政区划矢量。
- **Natural Earth**：注意部分要素的 `ISO_A3` 字段为 `-99`（如争议地区），此时可改用 `ADM0_A3` 字段。

## 四、国家和地区代码全表（按大洲）

{chr(10).join(sections)}

{faq([
    ('中国的 ISO 代码是什么？',
     '二字母 `CN`，三字母 `CHN`，数字 `156`。中国香港、中国澳门、中国台湾在 ISO 3166-1 中另有代码（HK / HKG / 344、MO / MAC / 446、TW / TWN / 158），本页中文名称按我国规范写法列出。'),
    ('ISO 3166-1 一共有多少个代码？',
     f'目前 ISO 3166-1 共有 {len(rows)} 个正式分配的代码，其中既包括主权国家，也包括依附领土和特殊地区（如南极洲 AQ）。所以这个数字比联合国会员国（193 个）多。'),
    ('ISO 3166-2 又是什么？',
     'ISO 3166-2 是各国**一级行政区**的代码，格式为「国家二字母-区划代码」，例如 `CN-GD` 广东省、`JP-13` 东京都、`US-CA` 加利福尼亚州。'),
    ('为什么英国的代码是 GB，域名却是 .uk？',
     '英国的 ISO 代码是 GB / GBR，但互联网早期已经启用了 .uk，后来一直沿用，所以域名是唯一的例外。'),
    ('国家改名后代码会变吗？',
     '名称变化不一定改代码。例如土耳其英文名改为 Türkiye、斯威士兰改为 Eswatini，代码仍是 TR / TUR、SZ / SWZ。只有国家分立、合并等情况才会新增或撤销代码。'),
])}

## 五、数据来源

- 代码与分区：ISO 3166-1 及联合国统计司 M49 标准，整理自开源数据集 [lukes/ISO-3166-Countries-with-Regional-Codes](https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes)；
- 中文名称：Unicode CLDR 简体中文区域名称，并按我国规范对中国台湾、中国香港、中国澳门等名称做了调整；正式文件中的中文名称请以 GB/T 2659.1 和外交部公布的国家和地区名称为准。
- 相关资料：[GADM 世界各国行政区划矢量数据](/downloads)（在资料下载中搜索「GADM」）。
"""
    write_page('iso-3166-country-codes', {
        'slug': 'iso-3166-country-codes',
        'title': '世界国家和地区代码表（ISO 3166-1）：二字母、三字母、数字代码中英文对照',
        'summary': f'ISO 3166-1 全部 {len(rows)} 个国家和地区代码的中英文对照表，含二字母（CN）、三字母（CHN）、数字（156）三种代码与联合国 M49 地理分区，按大洲分组并可即时检索；说明三种代码的用途、与奥运会和国际足联代码的区别，以及在 GIS 数据挂接、GADM 文件命名中的用法。',
        'date': UPDATED,
        'category': '地理基础',
        'subject': '人文地理',
        'tags': 'ISO 3166, 国家代码, 国家和地区代码, GB/T 2659, 三字母代码, GADM, GIS数据',
        'tableSearch': 'true',
        'tableSearchPlaceholder': '输入二 / 三字母码、数字码或国家名，如 JPN / 392 / 日本',
    }, body)
    print('ok', len(rows))


if __name__ == '__main__':
    build()
