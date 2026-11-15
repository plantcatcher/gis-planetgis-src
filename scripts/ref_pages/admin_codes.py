"""生成两篇学习页：
  - content/learn/china-admin-division-codes.md  现行县以上行政区划代码全表
  - content/learn/id-card-region-codes.md        身份证前六位（含 1981 年以来历史代码）

数据：yescallop/areacodes（CC0，源自民政部 / 国家地名信息库），截至 2025-12-31；
另补 2026 年已公布的新设县级区划（ADDED_2026，来源见注释）。
用法：python3 scripts/ref_pages/admin_codes.py
"""
import collections
import csv
import re

from common import code, faq, fetch, table, write_page

RAW = 'https://raw.githubusercontent.com/yescallop/areacodes/master'
DATA_YEAR = 2025
# 2026 年新设（新疆维吾尔自治区人民政府公告；代码见区划地名网 xzqh.org 2026 年版）
ADDED_2026 = {
    '653132': ('岑岭县', '2026-03-26 经党中央、国务院批准设立，由喀什地区管辖'),
    '659013': ('草湖市', '2026-04-17 经党中央、国务院批准设立，自治区直辖县级市'),
}
UPDATED = '2026-11-15'


def load_current():
    path = fetch(f'{RAW}/data/{DATA_YEAR}.txt', f'{DATA_YEAR}.txt')
    cur = {}
    for line in open(path, encoding='utf-8-sig'):
        m = re.match(r'^(\d{6})\s+(\S.*)$', line.strip())
        if m:
            cur[m.group(1)] = m.group(2).strip()
    for c, (n, _) in ADDED_2026.items():
        cur[c] = n
    return dict(sorted(cur.items()))


def load_history():
    path = fetch(f'{RAW}/result.csv', 'result.csv')
    with open(path, encoding='utf-8-sig') as f:
        return list(csv.DictReader(f))


def county_kind(n):
    if n == '神农架林区':
        return '林区'
    for s, k in (('特区', '特区'), ('自治旗', '自治旗'), ('旗', '旗'), ('自治县', '自治县'),
                 ('县', '县'), ('市', '县级市'), ('区', '市辖区')):
        if n.endswith(s):
            return k
    raise ValueError(n)


def level(c):
    return 'prov' if c.endswith('0000') else 'pref' if c.endswith('00') else 'county'


def parent_pref(c, cur):
    p = c[:4] + '00'
    if p in cur:
        return cur[p]
    if c[2:4] == '90':
        return '省直辖县级行政区划'
    return '（直辖）'


def build(cur, hist):
    provs = [c for c in cur if level(c) == 'prov']
    stats = {}
    for p in provs:
        sub = [c for c in cur if c[:2] == p[:2] and c != p]
        prefs = [c for c in sub if level(c) == 'pref']
        counties = [c for c in sub if level(c) == 'county']
        stats[p] = (len(prefs), len(counties), collections.Counter(county_kind(cur[c]) for c in counties))
    n_pref = sum(s[0] for s in stats.values())
    n_cty = sum(s[1] for s in stats.values())
    kinds = collections.Counter()
    for s in stats.values():
        kinds.update(s[2])
    pref_kinds = collections.Counter(
        next(k for k in ('自治州', '地区', '盟', '市') if cur[c].endswith(k)) for c in cur if level(c) == 'pref')
    total = len(cur)

    # ---------- 页面一：现行代码全表 ----------
    stat_rows = []
    for p in provs:
        a, b, k = stats[p]
        detail = '、'.join(f'{t}{k[t]}' for t in ('市辖区', '县级市', '县', '自治县', '旗', '自治旗', '特区', '林区') if k[t])
        stat_rows.append([code(p), cur[p], a or '—', b or '—', detail or '（民政部代码表仅列省级）'])
    stat_rows.append(['', '合计', n_pref, n_cty, ''])

    sections = []
    for p in provs:
        rows = [[code(p), cur[p], '', '']]
        for c in cur:
            if c[:2] != p[:2] or c == p:
                continue
            if level(c) == 'pref':
                rows.append([code(c), cur[p], cur[c], ''])
            else:
                rows.append([code(c), cur[p], parent_pref(c, cur), cur[c]])
        lv = {r[0]: level(re.sub(r'\D', '', r[0])) for r in rows}
        sections.append(f'### {cur[p]}（{p}）\n\n' + table(
            ['代码', '省级', '地级', '县级'], rows, raw_cols=(0,),
            row_class=lambda r: {'prov': 'level-prov', 'pref': 'level-city'}.get(lv[r[0]])))

    # 近年变更：2016 年起停用的代码 + 2026 年新设
    def succ_names(s):
        out = []
        for part in filter(None, s.split(';')):
            m = re.match(r'(\d{6})(?:\[(\d{4})\])?', part)
            c = m.group(1)
            out.append(f'{code(c)} {cur.get(c, latest_name.get(c, ""))}'.strip())
        return '；'.join(out) or '—（地级建制撤销，原辖区县见各自对应行）'

    def now_of(r):
        if r['状态'] == '变更':
            c = r['代码']
            return f"代码未变，现名 {cur.get(c, latest_name.get(c, ''))}"
        return succ_names(r['新代码'])

    latest_name = {}
    for r in hist:
        latest_name[r['代码']] = r['名称']
    recent = [r for r in hist if r['状态'] in ('弃用', '变更') and int(r['变更/弃用时间']) >= 2016]
    recent.sort(key=lambda r: (-int(r['变更/弃用时间']), r['代码']))
    recent_rows = [[f'{c} 年', '新设', code(k), n, ''] for k, (n, _) in ADDED_2026.items() for c in ['2026']]
    recent_rows += [[f"{r['变更/弃用时间']} 年", '停用' if r['状态'] == '弃用' else '更名', code(r['代码']),
                     f"{r['名称']}（{r['一级行政区']}{'' if r['二级行政区'] in ('', '直辖', r['名称']) else r['二级行政区']}）",
                     now_of(r)] for r in recent]

    body = f"""
> 数据更新：**{UPDATED}**。现行代码以民政部 / 国家地名信息库公布的 **{DATA_YEAR} 年县以上行政区划代码**（截至 {DATA_YEAR} 年 12 月 31 日）为底，并补入 2026 年已公布新设的岑岭县、草湖市。页面顶部的搜索框支持按代码或名称即时筛选，例如输入 `440300` 或 `深圳`。

## 一、这是什么

「行政区划代码」是国家给每个省级、地级、县级行政区编制的**唯一 6 位数字代号**，编码规则来自国家标准 **GB/T 2260《中华人民共和国行政区划代码》**，具体代码由民政部每年更新发布。

它的用处很多：
- **身份证号前 6 位**就是首次办证时户籍所在县级行政区的代码，详见[身份证前六位地区码对照（含历年旧码）](/learn/id-card-region-codes)；
- 统计年鉴、人口普查、政务系统都用它当地区主键；
- GIS 里把 Excel 统计表和行政区划矢量数据挂接，最稳妥的字段就是它，比用地名匹配可靠得多。地名会重名（全国有好几个「朝阳区」「鼓楼区」），代码不会。

## 二、6 位代码怎么读

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>位置</th><th>含义</th><th>取值规律</th><th>示例</th></tr>
  </thead>
  <tbody>
    <tr><td>第 1–2 位</td><td>省级行政区</td><td>按大区分段：1 华北、2 东北、3 华东、4 中南、5 西南、6 西北；71 台湾，81 香港，82 澳门</td><td><code>44</code> 广东省</td></tr>
    <tr><td>第 3–4 位</td><td>地级行政区</td><td>01–20、51–70 一般为地级市；21–50 为地区、自治州、盟；90 为省（自治区）直辖县级行政区划</td><td><code>4403</code> 深圳市</td></tr>
    <tr><td>第 5–6 位</td><td>县级行政区</td><td>01–20 一般为市辖区；21–80 为县、自治县、旗等；81–99 为县级市</td><td><code>440304</code> 福田区</td></tr>
  </tbody>
</table>
</div>

读法口诀：**以 `0000` 结尾是省，以 `00` 结尾是地级，其余是县级**。例如 `440300` 深圳市 = `44` 广东 + `03` 深圳 + `00`；`440304` 福田区 = `44` + `03` + `04`。

几个容易踩的坑：
- **直辖市没有地级这一层**。北京、天津、上海、重庆的区县直接挂在省级下面，代码第 3–4 位是 `01`（市辖区）或 `02`（县，现仅重庆还有）。
- **省直辖县级行政区划用 `90`**。如湖北的仙桃 `429004`、河南的济源 `419001`、新疆兵团各市 `6590xx`，它们不属于任何地级市。
- **取值规律有例外**。重庆的区已经排到 `500157`（两江新区），超出了 01–20 的范围；判断类型请以名称和民政部公布为准，不要只看数字。
- **民政部代码表不列「市辖区」占位码**（如 `110100`），本表也不收；部分旧数据或统计用代码里会出现。

## 三、全国县以上行政区划统计

截至本次更新，全国共 **34 个省级、{n_pref} 个地级、{n_cty} 个县级**行政区划单位（本表共收 {total} 个代码）：
- 地级：{pref_kinds['市']} 个地级市、{pref_kinds['地区']} 个地区、{pref_kinds['自治州']} 个自治州、{pref_kinds['盟']} 个盟；
- 县级：{kinds['市辖区']} 个市辖区、{kinds['县级市']} 个县级市、{kinds['县']} 个县、{kinds['自治县']} 个自治县、{kinds['旗']} 个旗、{kinds['自治旗']} 个自治旗、{kinds['特区']} 个特区、{kinds['林区']} 个林区。

{table(['代码', '省级行政区', '地级数', '县级数', '县级构成'], stat_rows, raw_cols=(0,))}

## 四、现行代码全表（按省级行政区排列）

表格列为 **代码 / 省级 / 地级 / 县级**。省级行加粗，地级行稍粗；直辖市的区县「地级」列显示为「（直辖）」。

{chr(10).join(sections)}

## 五、近年代码变更（2016 年以来）

区划调整后，旧代码会停用，所辖范围并入新代码。下表列出 2016 年以来停用或更名的 {len(recent)} 条记录及 2026 年新设的代码，方便核对旧数据。1981 年以来的**完整历史代码**见[身份证前六位地区码对照](/learn/id-card-region-codes)。

{table(['年份', '变动', '代码', '名称（当时所属）', '现对应代码'], recent_rows, raw_cols=(2, 4))}

## 六、在 GIS 里怎么用

1. **统计表挂接矢量**：把代码列统一设成**文本型**再连接（Join），否则 Excel 会把 `110101` 当数字处理，部分软件还会补成 `110101.0`。
2. **只取上级**：县级代码取前 4 位补 `00` 得地级代码，取前 2 位补 `0000` 得省级代码，可以直接用来做分级汇总。
3. **老数据要对版本**：2016 年的数据拿 2025 年的代码去挂，会有上百条对不上。先用第五节的变更表把旧码映射到新码，再连接。
4. 需要配套的矢量数据，可以下载[全国行政区划矢量点数据（省 / 市 / 县 / 乡四级）](/downloads/xzqh-point)，或用[行政区划边界下载工具](/tools/boundary)直接取边界。

{faq([
    ('行政区划代码和邮政编码、电话区号是一回事吗？',
     '不是。行政区划代码是 6 位纯数字，由民政部按 GB/T 2260 编制；邮政编码也是 6 位，但由邮政部门按投递网络编排，两者数字不相同；电话区号是 3–4 位，由工信部按电信网编排，可参考[全国电话区号表](/learn/china-telephone-area-codes)。'),
    ('身份证前 6 位查不到对应地区，是号码有问题吗？',
     '多数情况不是。身份证地址码是**首次办证时**的县级代码，之后区划调整也不会改号，所以很多老身份证用的是已经停用的旧代码。请到[身份证前六位地区码对照](/learn/id-card-region-codes)里查 1981 年以来的历史代码。'),
    ('行政区划代码多久更新一次？',
     '民政部按年度发布县以上行政区划代码，区划一调整（撤县设区、设立新县、地级市更名等），对应代码就会新增或停用。做数据挂接时一定要确认用的是哪一年的代码。'),
    ('统计用区划代码为什么是 12 位？',
     '国家统计局的「统计用区划和城乡划分代码」在 6 位行政区划代码后面又加了 3 位乡级、3 位村级代码，共 12 位，用于普查和抽样调查。前 6 位与民政部县级代码基本一致，但个别开发区、新区等统计单元会单独编码。'),
    ('台湾、香港、澳门有下级代码吗？',
     '民政部公布的县以上代码表中，台湾省（`710000`）、香港特别行政区（`810000`）、澳门特别行政区（`820000`）只列省级代码，没有下级代码，本表与之保持一致。'),
])}

## 七、数据来源与说明

- **现行代码**：民政部「中华人民共和国县级以上行政区划代码」及国家地名信息库 {DATA_YEAR} 年版，整理自开源数据集 [yescallop/areacodes](https://github.com/yescallop/areacodes)（CC0）；2026 年新设的岑岭县（{code('653132')}）、草湖市（{code('659013')}）据新疆维吾尔自治区人民政府公告补入。
- **校验**：各类县级、地级单位数量与区划地名网公布的 2026 年全国行政区划统计（{n_pref} 个地级、{n_cty} 个县级）一致。
- **版本说明**：本页旧版基于约 2016 年的代码快照，已于 {UPDATED} 全面更新为现行代码；旧代码并未删除，而是归入第五节和身份证前六位页面的历史对照表。
- 区划调整随时可能发生，正式用途（户籍、公文、法定报送）请以[民政部全国行政区划信息查询平台](http://xzqh.mca.gov.cn/)为准。
"""
    write_page('china-admin-division-codes', {
        'slug': 'china-admin-division-codes',
        'title': f'行政区划代码查询（{DATA_YEAR}–2026 最新）：全国省市县六位代码全表',
        'summary': f'全国县以上行政区划 6 位代码全表（{total} 条，截至 2026 年），依据 GB/T 2260 与民政部最新公布数据整理，可按代码或名称即时检索。讲清前两位省、中间两位地级、后两位县级的编码规则，附各省地级、县级数量统计、2016 年以来的代码变更对照，以及在 GIS 数据挂接中的用法。',
        'date': '2026-09-20',
        'updated': UPDATED,
        'category': '地理基础',
        'subject': '人文地理',
        'tags': '行政区划代码, GB/T 2260, 身份证前六位, 地理编码, GIS数据, 城市代码, 民政部',
        'tableSearch': 'true',
    }, body)

    # ---------- 页面二：身份证前六位 ----------
    abolished = [r for r in hist if r['状态'] in ('弃用', '变更')]
    abolished.sort(key=lambda r: (r['代码'], int(r['启用时间'])))
    hist_rows = []
    for r in abolished:
        up = r['二级行政区']
        up = '' if up in ('', '直辖', r['名称']) else up
        hist_rows.append([code(r['代码']), r['名称'], '停用' if r['状态'] == '弃用' else '更名',
                          r['一级行政区'] + (f' · {up}' if up else ''),
                          f"{r['启用时间']}–{int(r['变更/弃用时间']) - 1}" if int(r['变更/弃用时间']) - 1 > int(r['启用时间']) else r['启用时间'],
                          now_of(r)])
    reused = sorted({r['代码'] for r in abolished if r['状态'] == '弃用' and r['代码'] in cur})
    years = sorted({int(r['启用时间']) for r in hist})

    body2 = f"""
> 数据更新：**{UPDATED}**。下方表格收录 **{years[0]}–{DATA_YEAR} 年间已经停用或更名的 {len(abolished)} 条县以上行政区划代码记录**，可以在顶部搜索框直接输入身份证前 6 位查询。现行代码请查[行政区划代码全表](/learn/china-admin-division-codes)。

## 一、为什么身份证前六位经常「查不到」

身份证号码的前 6 位叫**地址码**，是持证人**首次申领身份证时**常住户口所在县（市、旗、区）的行政区划代码。

关键在于：**身份证号码终身不变**。之后哪怕县改了区、两个区合并、地级市改了名，已经发出去的号码都不会跟着改。所以：
- 1990 年在「北京市崇文区」办的证，前 6 位是 `110103`，而崇文区 2010 年就并入了东城区（`110101`）；
- 在「湖北省襄樊市」办的证，前 6 位以 `4206` 开头，现在这个地方叫襄阳市，代码没变，名字变了；
- 很多「撤县设区」的地方，代码本身也换了，例如河北滦县 `130223` 在 2018 年撤县设市，新代码是 `130284` 滦州市。

用现行代码表去查老身份证，自然会有一部分查不到。这一页就是专门补这个缺口的。

## 二、18 位身份证号的结构

现行居民身份证号码依据国家标准 **GB 11643《公民身份号码》**，共 18 位：

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th>位置</th><th>名称</th><th>含义</th></tr>
  </thead>
  <tbody>
    <tr><td>第 1–6 位</td><td>地址码</td><td>首次办证时户籍所在县级行政区划代码（GB/T 2260）</td></tr>
    <tr><td>第 7–14 位</td><td>出生日期码</td><td>YYYYMMDD，例如 19900101</td></tr>
    <tr><td>第 15–17 位</td><td>顺序码</td><td>同一地址码、同一天出生的人的编号；<strong>第 17 位奇数为男、偶数为女</strong></td></tr>
    <tr><td>第 18 位</td><td>校验码</td><td>由前 17 位按 ISO 7064 MOD 11-2 算出，取值 0–9 或 X</td></tr>
  </tbody>
</table>
</div>

1999 年以前还发过 **15 位**身份证：6 位地址码 + 6 位出生日期（YYMMDD，年份只有两位）+ 3 位顺序码，没有校验码。15 位升 18 位时，在年份前补「19」，再在末尾算出校验码。

## 三、校验码怎么算

第 18 位不是随便给的，可以用前 17 位算出来，用来发现抄错、输错的号码：

1. 前 17 位数字分别乘以权重 `7 9 10 5 8 4 2 1 6 3 7 9 10 5 8 4 2`；
2. 把 17 个乘积相加，求和后除以 11 取余数；
3. 余数 `0 1 2 3 4 5 6 7 8 9 10` 依次对应校验码 `1 0 X 9 8 7 6 5 4 3 2`。

校验码只能证明号码**格式正确**，不能证明这个号码真实存在、属于某个人。

## 四、怎么查自己的前六位

1. 先到[现行行政区划代码全表](/learn/china-admin-division-codes)里搜，能搜到就说明代码仍在使用；
2. 搜不到，就在下面的历史代码表里搜。表中「使用年份」是这个代码在官方代码表中出现的年份区间，「现对应代码」是区划调整后原地区现在归属的代码；
3. 同一个代码在不同年份可能对应不同名称（例如更名、撤销后又重新启用），表中会分行列出，按办证年份对照即可。现行表里仍在用、但历史上曾对应其他名称的代码共有 {len(reused)} 个。

## 五、1981 年以来已停用或更名的行政区划代码

共 {len(hist_rows)} 条，按代码排序。「停用」表示这个代码已不再使用，原地区并入「现对应」列的代码；「更名」表示代码沿用至今，只是名称变了。

{table(['代码', '当时名称', '变动', '所属', '使用年份', '现对应'], hist_rows, raw_cols=(0, 5))}

{faq([
    ('身份证前六位代表出生地吗？',
     '不完全是。地址码是**首次申领身份证时**常住户口所在地的代码，多数人在出生地落户，所以经常和出生地一致；但如果办证前已经迁过户口，就是迁入地的代码。'),
    ('户口迁移后，身份证号码会变吗？',
     '不会。公民身份号码终身不变，户口迁移、区划调整都不会改号。所以身份证前 6 位反映的是首次办证时的户籍地，而不是现在的户籍地。'),
    ('前六位在现行代码表里查不到，说明身份证是假的吗？',
     '不能这么判断。大量老身份证使用的是已经停用的历史代码，这是正常现象。请先在本页的历史代码表里查找。'),
    ('第 18 位是 X 是什么意思？',
     'X 是罗马数字 10。校验码按 MOD 11-2 计算，余数为 2 时对应的校验值是 10，为了保持 18 位长度就用 X 表示，不是字母 x 的意思。'),
    ('本页能查到具体某个人的信息吗？',
     '不能，也不应该。本页只介绍国家标准公开的编码规则和公开发布的行政区划代码，不涉及任何个人信息；请勿将他人身份证号用于非法用途。'),
])}

## 六、数据来源

- 历史代码：民政部 {years[0]}–{DATA_YEAR} 年历年县级以上行政区划代码、县级以上行政区划变更情况及国务院公报，整理自开源数据集 [yescallop/areacodes](https://github.com/yescallop/areacodes)（CC0），其中「现对应代码」为该数据集整理的新旧代码对应关系。
- 编码规则：GB 11643《公民身份号码》、GB/T 2260《中华人民共和国行政区划代码》。
- {years[0]} 年以前（GB/T 2260 首版之前）的代码未收录。
"""
    write_page('id-card-region-codes', {
        'slug': 'id-card-region-codes',
        'title': '身份证前六位地区码对照表（含 1981 年以来历史旧代码）',
        'summary': f'身份证号前 6 位是首次办证时户籍所在县级行政区划代码，号码终身不变，所以很多老身份证用的是已停用的旧代码。本文收录 {years[0]}–{DATA_YEAR} 年间停用或更名的 {len(abolished)} 条代码记录及其现对应地区，可直接输入前六位检索，并讲清 18 位身份证号结构与第 18 位校验码算法。',
        'date': UPDATED,
        'category': '地理基础',
        'subject': '人文地理',
        'tags': '身份证前六位, 身份证地区码, 行政区划代码, GB 11643, GB/T 2260, 历史行政区划',
        'cover': '',
        'tableSearch': 'true',
    }, body2)
    print('current', total, 'pref', n_pref, 'county', n_cty, 'recent', len(recent), 'abolished', len(abolished))


if __name__ == '__main__':
    build(load_current(), load_history())
