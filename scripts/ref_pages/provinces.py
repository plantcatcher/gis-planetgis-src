"""生成 content/learn/china-provinces-overview.md：34 个省级行政区简称、省会、代码、人口、地级 / 县级数量一览。

数据：
  - 代码、地级 / 县级数量：admin_codes.py 同源（民政部 2025 年代码 + 2026 年新设）
  - 常住人口：国家统计局《第七次全国人口普查公报（第三号）》
用法：python3 scripts/ref_pages/provinces.py
"""
import html
import re


from admin_codes import level, load_current
from common import code, faq, fetch, table, write_page

UPDATED = '2026-11-15'
CENSUS = 'https://www.stats.gov.cn/sj/tjgb/rkpcgb/qgrkpcgb/202302/t20230206_1902003.html'
# 简称（第二简称）与省会 / 首府
META = {
    '11': ('京', '', '北京'), '12': ('津', '', '天津'), '13': ('冀', '', '石家庄市'), '14': ('晋', '', '太原市'),
    '15': ('蒙', '', '呼和浩特市'), '21': ('辽', '', '沈阳市'), '22': ('吉', '', '长春市'), '23': ('黑', '', '哈尔滨市'),
    '31': ('沪', '申', '上海'), '32': ('苏', '', '南京市'), '33': ('浙', '', '杭州市'), '34': ('皖', '', '合肥市'),
    '35': ('闽', '', '福州市'), '36': ('赣', '', '南昌市'), '37': ('鲁', '', '济南市'), '41': ('豫', '', '郑州市'),
    '42': ('鄂', '', '武汉市'), '43': ('湘', '', '长沙市'), '44': ('粤', '', '广州市'), '45': ('桂', '', '南宁市'),
    '46': ('琼', '', '海口市'), '50': ('渝', '', '重庆'), '51': ('川', '蜀', '成都市'), '52': ('黔', '贵', '贵阳市'),
    '53': ('滇', '云', '昆明市'), '54': ('藏', '', '拉萨市'), '61': ('陕', '秦', '西安市'), '62': ('甘', '陇', '兰州市'),
    '63': ('青', '', '西宁市'), '64': ('宁', '', '银川市'), '65': ('新', '', '乌鲁木齐市'), '71': ('台', '', '台北'),
    '81': ('港', '', '—'), '82': ('澳', '', '—'),
}
REGION = {  # 统计公报的四大区域划分
    '东部': '11 12 13 31 32 33 35 37 44 46', '中部': '14 34 36 41 42 43', '西部': '15 45 50 51 52 53 54 61 62 63 64 65',
    '东北': '21 22 23',
}


def census():
    h = open(fetch(CENSUS, 'qp3.html'), encoding='utf-8', errors='ignore').read()
    t = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', h)))
    seg = t[t.index('表 3-1 各地区人口'):t.index('现役军人')]
    pop = {}
    for name, n in re.findall(r'([\u4e00-\u9fa5](?: [\u4e00-\u9fa5]|[\u4e00-\u9fa5]{1,2}))\s+(\d{6,9})\s+\d+\.\d\d', seg):
        pop[name.replace(' ', '')] = int(n)
    pop.pop('全国', None)
    assert len(pop) == 31, pop
    return pop


def build():
    cur = load_current()
    pop = census()
    reg_of = {p: r for r, ps in REGION.items() for p in ps.split()}
    rows, ranks = [], []
    for c, n in cur.items():
        if level(c) != 'prov':
            continue
        p = c[:2]
        ab, ab2, cap = META[p]
        if p not in ('11', '12', '31', '50', '71', '81', '82'):
            assert cur[p + '0100'] == cap, (p, cur[p + '0100'], cap)
        npref = sum(1 for x in cur if x[:2] == p and level(x) == 'pref')
        ncty = sum(1 for x in cur if x[:2] == p and level(x) == 'county')
        short = next((k for k in pop if n.startswith(k)), None)
        pp = pop.get(short) if short else None
        kind = '直辖市' if p in ('11', '12', '31', '50') else '特别行政区' if p in ('81', '82') else \
            '自治区' if n.endswith('自治区') else '省'
        rows.append([code(c), n, kind, ab + (f'（{ab2}）' if ab2 else ''), cap, reg_of.get(p, '—'),
                     npref or '—', ncty or '—', f'{pp / 10000:,.0f}' if pp else '—'])
        if pp:
            ranks.append((pp, n))
    assert len(rows) == 34
    by_pop = sorted(ranks, reverse=True)
    pop_rows = [[i + 1, n, f'{p / 10000:,.0f}', f'{p / sum(x[0] for x in ranks) * 100:.2f}%'] for i, (p, n) in enumerate(by_pop)]
    n_pref = sum(1 for x in cur if level(x) == 'pref')
    n_cty = sum(1 for x in cur if level(x) == 'county')

    body = f"""
> 数据更新：**{UPDATED}**。一张表看全中国 **34 个省级行政区**：行政区划代码、简称、省会（首府）、所属区域、地级与县级单位数量和第七次全国人口普查常住人口。顶部搜索框可按名称、简称或代码筛选。

## 一、34 个省级行政区怎么构成

**23 个省、5 个自治区、4 个直辖市、2 个特别行政区**，共 34 个。其中 23 个省包括台湾省。

- 4 个直辖市：北京、天津、上海、重庆；
- 5 个自治区：内蒙古、广西壮族、西藏、宁夏回族、新疆维吾尔自治区；
- 2 个特别行政区：香港、澳门。

全国共有 {n_pref} 个地级行政区、{n_cty} 个县级行政区（截至 2026 年，完整代码见[行政区划代码全表](/learn/china-admin-division-codes)）。

## 二、省级行政区一览表

{table(['代码', '名称', '类型', '简称', '省会 / 首府', '区域', '地级数', '县级数', '常住人口（万人，2020）'], rows, raw_cols=(0,))}

说明：
- **简称**括号内为另一个常用简称，例如贵州简称「黔」或「贵」，车牌用「贵」；云南简称「滇」或「云」，车牌用「云」。各省车牌字母见[全国车牌代码对照表](/learn/china-license-plate-codes)。
- **区域**按国家统计局的东部、中部、西部、东北四大区域划分。
- **人口**为第七次全国人口普查（2020 年 11 月 1 日零时）常住人口，不含港澳台。

## 三、人口排名（第七次全国人口普查）

{table(['名次', '省级行政区', '常住人口（万人）', '占 31 省份合计'], pop_rows)}

{faq([
    ('中国有多少个省？',
     '中国共有 34 个省级行政区，其中 23 个省、5 个自治区、4 个直辖市、2 个特别行政区。日常说的「多少个省」，通常指的是这 34 个省级行政区。'),
    ('为什么贵州简称「黔」，车牌却是「贵」？',
     '贵州的简称是「黔」或「贵」，两者都是正式简称。车牌为了易于辨认选用了「贵」；云南「滇 / 云」、甘肃「甘 / 陇」、四川「川 / 蜀」、陕西「陕 / 秦」也是同样情况。'),
    ('省级行政区划代码是怎么编的？',
     '代码前两位按大区排列：1 开头是华北，2 东北，3 华东，4 中南，5 西南，6 西北，台湾 71、香港 81、澳门 82，后四位为 0000。'),
    ('人口最多和最少的省份是哪个？',
     f'按第七次全国人口普查，常住人口最多的是{by_pop[0][1]}（约 {by_pop[0][0] / 10000:,.0f} 万人），最少的是{by_pop[-1][1]}（约 {by_pop[-1][0] / 10000:,.0f} 万人）。'),
])}

## 四、数据来源

- 代码、地级与县级数量：民政部 / 国家地名信息库 2025 年县以上行政区划代码，补入 2026 年新设的岑岭县、草湖市（详见[行政区划代码全表](/learn/china-admin-division-codes)）。
- 人口：[国家统计局《第七次全国人口普查公报（第三号）》]({CENSUS})。
"""
    write_page('china-provinces-overview', {
        'slug': 'china-provinces-overview',
        'title': '中国 34 个省级行政区一览表：简称、省会、代码、人口与地级县级数量',
        'summary': '中国 34 个省级行政区（23 个省、5 个自治区、4 个直辖市、2 个特别行政区）一览表，列出行政区划代码、简称、省会（首府）、所属区域、地级与县级单位数量、第七次全国人口普查常住人口，附人口排名，以及简称与车牌用字的区别。',
        'date': UPDATED,
        'category': '地理基础',
        'subject': '区域地理',
        'tags': '省级行政区, 省份简称, 省会, 中国34个省, 人口, 行政区划',
        'tableSearch': 'true',
    }, body)
    print('ok', len(rows))


if __name__ == '__main__':
    build()
