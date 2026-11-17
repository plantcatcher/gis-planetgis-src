"""生成 content/learn/china-postal-codes.md：全国邮政编码表（按省份、县区）。

数据：mumuy/data_post（MIT，全国邮政网点名录，含网点名称、地址、邮编），
      按网点所属的省 / 市 / 区县归入民政部 2025 年县以上行政区划（经 yescallop/areacodes 整理）。
用法：python3 scripts/ref_pages/postal_codes.py
"""
import collections
import io
import json
import re
import tarfile

from common import code, faq, fetch, table, write_page

UPDATED = '2026-11-15'
POST = 'https://github.com/mumuy/data_post/archive/refs/heads/master.tar.gz'
RAW = 'https://raw.githubusercontent.com/yescallop/areacodes/master'
DATA_YEAR = 2025
# 与 admin_codes.py 保持一致：2026 年新设县级区划（本页只用于补全骨架，暂无邮编数据）
ADDED_2026 = {'653132': '岑岭县', '659013': '草湖市'}

# 数据里沿用旧名 / 非行政区名 → 现行行政区（省, 地级, 县区）；地级写 '—' 表示省直辖 / 直辖市
OVERRIDE = {
    ('天津市', '天津市', '大港区'): ('天津市', '天津市', '滨海新区'),
    ('重庆市', '重庆市', '万盛区'): ('重庆市', '重庆市', '綦江区'),
    # 2025 年撤销：江北区、渝北区并入两江新区（渝北区另有部分划归北碚区，邮编统一按两江新区列）
    ('重庆市', '重庆市', '江北区'): ('重庆市', '重庆市', '两江新区'),
    ('重庆市', '重庆市', '渝北区'): ('重庆市', '重庆市', '两江新区'),
    ('山东省', '莱芜市', '莱城区'): ('山东省', '济南市', '莱芜区'),
    ('山东省', '莱芜市', '钢城区'): ('山东省', '济南市', '钢城区'),
    ('山东省', '莱芜市', '莱芜市'): ('山东省', '济南市', '莱芜区'),
    ('山东省', '烟台市', '蓬莱市'): ('山东省', '烟台市', '蓬莱区'),
    ('山东省', '烟台市', '长岛县'): ('山东省', '烟台市', '蓬莱区'),
    ('山东省', '烟台市', '开发区'): ('山东省', '烟台市', '烟台经济技术开发区'),
    ('河北省', '雄安新区', '雄县'): ('河北省', '保定市', '雄县'),
    ('河北省', '雄安新区', '安新县'): ('河北省', '保定市', '安新县'),
    ('河北省', '雄安新区', '容城县'): ('河北省', '保定市', '容城县'),
    ('河南省', '河南省', '济源市'): ('河南省', '—', '济源市'),
    ('湖北省', '武汉市', '仙桃市'): ('湖北省', '—', '仙桃市'),
    ('江西省', '上饶市', '上饶县'): ('江西省', '上饶市', '广信区'),
    ('河北省', '邯郸市', '邯郸县'): ('河北省', '邯郸市', '邯山区'),
    ('河南省', '洛阳市', '孟津县'): ('河南省', '洛阳市', '孟津区'),
    ('西藏自治区', '林芝市', '米林县'): ('西藏自治区', '林芝市', '米林市'),
    ('西藏自治区', '山南市', '错那县'): ('西藏自治区', '山南市', '错那市'),
    ('黑龙江省', '黑河市', '嫩江县'): ('黑龙江省', '黑河市', '嫩江市'),
    ('新疆维吾尔自治区', '喀什地区', '塔什库尔干县'): ('新疆维吾尔自治区', '喀什地区', '塔什库尔干塔吉克自治县'),
    ('安徽省', '宣城市', '广德县'): ('安徽省', '宣城市', '广德市'),
    ('广东省', '东莞市', '东莞县'): ('广东省', '东莞市', '东莞市'),
    ('青海省', '海西蒙古族藏族自治州', '大柴旦'): ('青海省', '海西蒙古族藏族自治州', '大柴旦行政委员会'),
    ('广东省', '深圳市', '深汕特别合作区'): ('广东省', '深圳市', '深汕特别合作区'),
    ('海南省', '三沙市', '三沙市'): ('海南省', '三沙市', '西沙区'),
    ('黑龙江省', '大兴安岭地区', '加格达奇区'): ('黑龙江省', '大兴安岭地区', '加格达奇区'),
    ('黑龙江省', '大兴安岭地区', '松岭区'): ('黑龙江省', '大兴安岭地区', '松岭区'),
    ('黑龙江省', '大兴安岭地区', '新林区'): ('黑龙江省', '大兴安岭地区', '新林区'),
    ('黑龙江省', '大兴安岭地区', '呼中区'): ('黑龙江省', '大兴安岭地区', '呼中区'),
}

# 大兴安岭地区的四个「区」是地区辖区，民政部区划代码里不单列，排序键排在所辖县市之后
EXTRA_SORT = {'加格达奇区': '2327z1', '松岭区': '2327z2', '新林区': '2327z3', '呼中区': '2327z4'}

# 数据集中错录的网点：邮编位被填成了本地的行政区划代码，或位数错乱、地址栏填的是电话，
# 与所在县区的邮编段完全不符。逐条核对过，按（省, 邮编）剔除——同一个六位数在别的省可能是合法邮编
# （如 341000 在江西赣州就是正常邮编），所以不能只按邮编剔。
DROP = {
    ('辽宁省', '210321'),   # 台安县区划代码，鞍山（台安）邮编为 1141xx
    ('安徽省', '341000'),   # 黄山市屯溪区，屯溪邮编为 2450xx
    ('河南省', '410500'),   # 安阳市区划代码，安阳邮编为 4550xx
    ('河南省', '410523'),   # 汤阴县区划代码，汤阴邮编为 4561xx
    ('河南省', '410922'),   # 清丰县区划代码，清丰邮编为 4573xx
    ('河南省', '410926'),   # 范县区划代码，范县邮编为 4575xx
    ('河南省', '411728'),   # 遂平县区划代码，遂平邮编为 4631xx
    ('河南省', '411729'),   # 新蔡县区划代码，新蔡邮编为 4635xx
    ('河南省', '446143'),   # 河南无 44 开头邮编段，太康邮编为 4614xx
    ('河南省', '493809'),   # 河南无 49 开头邮编段，上蔡邮编为 4638xx
    ('湖北省', '420881'),   # 钟祥市区划代码，钟祥邮编为 4319xx
    ('甘肃省', '620723'),   # 临泽县区划代码，且该网点地址一栏填的是电话号码
    ('内蒙古自治区', '294191'),  # 科尔沁右翼中旗应为 0294xx
    ('内蒙古自治区', '294270'),  # 科尔沁右翼中旗应为 0294xx
}


def drop_misplaced(rows):
    keep, dropped = [], collections.Counter()
    for r in rows:
        if (r['province'], r['code']) in DROP:
            dropped[r['code']] += 1
            continue
        keep.append(r)
    return keep, dropped


def load_admin():
    """返回省级列表、地级表，以及「地级 / 省直辖」下的县区索引。"""
    cur = {}
    for line in open(fetch(f'{RAW}/data/{DATA_YEAR}.txt', f'{DATA_YEAR}.txt'), encoding='utf-8-sig'):
        m = re.match(r'^(\d{6})\s+(\S.*)$', line.strip())
        if m:
            cur[m.group(1)] = m.group(2).strip()
    cur.update(ADDED_2026)
    provs = [(c, n) for c, n in sorted(cur.items()) if c.endswith('0000')]
    pref = {c: n for c, n in cur.items() if c.endswith('00') and not c.endswith('0000')}
    pref_prov = {c: c[:2] + '0000' for c in pref}
    by_pref, by_prov = collections.defaultdict(dict), collections.defaultdict(dict)
    for c, n in cur.items():
        if c.endswith('00'):
            continue
        p = c[:4] + '00'
        if p in pref:
            by_pref[pref[p]][n] = c
        else:
            by_prov[c[:2] + '0000'][n] = c
    return cur, provs, pref, pref_prov, by_pref, by_prov


def load_records():
    path = fetch(POST, 'data_post.tar.gz')
    out = []
    with tarfile.open(path, 'r:gz') as tf:
        for m in tf.getmembers():
            if re.fullmatch(r'data_post-master/code/\d{6}\.json', m.name):
                with tf.extractfile(m) as f:
                    out += json.load(io.TextIOWrapper(f, encoding='utf-8'))
    seen, rows = set(), []
    for r in out:
        # 剔除标注「撤销」的停用网点，并按 名称 + 邮编 + 地址 去重
        if '撤销' in r['name'] or '撤销' in r['address']:
            continue
        k = (r['name'], r['code'], r['address'])
        if k not in seen:
            seen.add(k)
            rows.append(r)
    return drop_misplaced(rows)


def build():
    cur, provs, pref, pref_prov, by_pref, by_prov = load_admin()
    recs, dropped = load_records()
    pref_names = set(pref.values())
    pref_code = {n: c for c, n in pref.items()}
    prov_code = {n: c for c, n in provs}

    def sort_key(prov, tpref, tarea):
        """县区在表内的排序键：优先行政区划代码，骨架里没有的排在所属地级末尾。

        直辖市的区直接挂在省码下（110000、500000…），地级表里查不到，需回退到省直辖表。
        """
        if tarea in EXTRA_SORT:
            return EXTRA_SORT[tarea]
        c = (by_pref.get(tpref) or {}).get(tarea) or (by_prov.get(prov_code[prov]) or {}).get(tarea)
        if c:
            return c
        if tpref != '—':
            return (pref_code.get(tpref) or '') + 'zz'
        return prov_code[prov][:2] + '99zz'

    # data[省][(排序键, 地级, 县区)] = set(邮编)
    data = collections.defaultdict(lambda: collections.defaultdict(set))
    unmatched = collections.Counter()

    for r in recs:
        p, city, area = r['province'], r['city'], r['area']
        key = (p, city, area)
        if key in OVERRIDE:
            tp, tpref, tarea = OVERRIDE[key]
            sort = sort_key(tp, tpref, tarea)
        elif area != city:
            tc = (by_pref.get(city) or {}).get(area) or (by_prov.get(prov_code[p]) or {}).get(area)
            if not tc:
                unmatched[key] += 1
                continue
            tp, tpref, tarea, sort = p, city, area, tc
        elif city in pref_names:
            kids = by_pref.get(city) or {}
            if not kids:            # 不设区的地级市（东莞、中山、儋州、嘉峪关）
                tp, tpref, tarea = p, '—', city
                sort = pref_code.get(city) or sort_key(p, '—', city)
            else:                   # 地级市本级登记的网点：按地址归到下属县区，归不进则单列
                hits = [n for n in kids if len(n) > 1 and n in r['address']]
                if hits:
                    tarea = max(hits, key=len)
                    tp, tpref, sort = p, city, kids[tarea]
                else:
                    tp, tpref, tarea = p, city, f'{city}（市本级）'
                    sort = (pref_code.get(city) or '') + 'zz'
        else:
            tc = (by_prov.get(prov_code[p]) or {}).get(city)
            if not tc:
                unmatched[key] += 1
                continue
            tp, tpref, tarea, sort = p, '—', city, tc
        data[tp][(sort, tpref, tarea)].add(r['code'])

    # 输出：按省代码顺序，省内按县区代码顺序
    sections, all_codes, n_rows = [], set(), 0
    for pc, pn in provs:
        if pn not in data:
            continue
        rows = []
        for (sort, tpref, tarea), cs in sorted(data[pn].items()):
            cs = sorted(cs)
            all_codes.update(cs)
            rows.append([tarea, tpref, '、'.join(code(c) for c in cs), len(cs)])
        n_rows += len(rows)
        n_codes = len({c for cs in data[pn].values() for c in cs})
        sections.append(f'### {pn}（{len(rows)} 个县区，{n_codes} 个邮编）\n\n'
                        + table(['县区', '所属地级', '邮政编码', '数量'], rows, raw_cols=(2,)))

    # 首位数字 → 覆盖的省级行政区（省内按行政区划代码排序，不按字形）
    first = collections.defaultdict(lambda: [set(), set()])
    for pn in data:
        for (sort, tpref, tarea), cs in data[pn].items():
            for c in cs:
                first[c[0]][0].add(pn)
                first[c[0]][1].add(c)
    first_rows = [[d, '、'.join(sorted(v[0], key=lambda n: prov_code[n])), len(v[1])]
                  for d, v in sorted(first.items())]

    # 邮编段数最多的县区
    multi = sorted(((tarea, tpref, len({c[:4] for c in cs}), len(cs))
                    for pn in data for (sort, tpref, tarea), cs in data[pn].items()
                    if len({c[:4] for c in cs}) >= 4), key=lambda x: (-x[2], -x[3]))[:12]

    body = f"""
> 数据更新：**{UPDATED}**。收录全国 **{len(all_codes)} 个**邮政编码，覆盖 **{len([p for _, p in provs if p in data])} 个**省级行政区、**{n_rows} 个**县区（含直辖市的区、省直辖县级市）。顶部搜索框可直接输入邮编（如 `518000`）或地名（如 `深圳`）查询。

> 想看成图？打开[全国邮政编码互动地图](/maps/china-postal-codes)：按首位数字把 2857 个县区染成九大邮区，输入 6 位邮编即可在地图上定位。

## 一、邮编怎么读

中国大陆的邮政编码是 **6 位数字、四级编码**：

{table(['位次', '含义', '说明'], [
    [code('第 1–2 位'), '省（自治区、直辖市）', '同一省级行政区共用一个或几个两位前缀，如 10 为北京、20 为上海、51 为广东'],
    [code('第 3 位'), '邮区', '一个邮区通常覆盖一个地级市或相邻几个地级市'],
    [code('第 4 位'), '县、市', '邮区内的县市编号，直辖市和大城市的城区也按这一位区分'],
    [code('第 5–6 位'), '投递局', '县市内具体投递局（支局、所）的编号，`00` 多为该县区的中心局'],
], raw_cols=(0,))}

所以 `518000` 读作：`51` 广东省、`8` 深圳邮区、`0` 县市位、`00` 投递局，是深圳市南山区的中心局邮编。不过「邮区—县市」的划分是传统规则，直辖市和很多大城市的城区会占掉邮区号段，因此**不能只凭邮编反推区县**；查某个地址的邮编、或某个邮编属于哪里，以本表为准。

## 二、邮编的编排规律

- **首位数字大致对应大区**：

{table(['首位', '覆盖的省级行政区', '邮编数'], first_rows)}

- **一个县区通常占一段连号**：前四位相同、后两位不同，`xx00` 多是县区中心局；县区越大、网点越多，占的段也越多。
- **大城市的区可能分成好几段**：城区范围大、投递局多，前四位会分成多段。段数最多的几个县区：

{table(['县区', '所属地级', '邮编段数', '邮编数'], multi)}

- **省直辖县级市、不设区的地级市本身就是一个县区**：济源、仙桃、文昌、东莞、中山、儋州、嘉峪关等，邮编直接归到市名下，`所属地级` 记为 `—`。

## 三、和行政区划代码、身份证、电话区号的关系

{table(['编码', '用途', '编制部门', '对照页面'], [
    ['邮政编码 6 位', '邮件分拣投递', '中国邮政', '本页'],
    ['行政区划代码 6 位', '行政区划管理、统计', '民政部', '<a href="/learn/china-admin-division-codes">行政区划代码全表</a>'],
    ['身份证前 6 位', '户籍登记', '公安部', '<a href="/learn/id-card-region-codes">身份证前六位地区码对照</a>'],
    ['长途区号', '固定电话', '工信部', '<a href="/learn/china-telephone-area-codes">全国电话区号表</a>'],
], raw_cols=(3,))}

四套编码互不通用：同一个地方，邮编、区划代码、身份证码、区号完全不同，也没有换算公式。唯一相近的是**县区级**——本表按县区汇总邮编，正好能和行政区划代码全表的县区名对照着看。

## 四、全国邮政编码表（按省份）

按省级行政区列出每个县区的全部邮政编码，`数量` 为该县区的邮编个数。表内搜索支持邮编、县区名、地级名。

{chr(10).join(sections)}

{faq([
    ('邮政编码和行政区划代码能互相换算吗？',
     '不能。邮编是邮政部门按投递网络编的，行政区划代码是民政部门按行政区划编的，位数虽然都是 6 位，但编码规则完全不同，同一县区的两者没有任何换算关系，只能按名称对照，例如本页与[行政区划代码全表](/learn/china-admin-division-codes)的县区名一一对应。'),
    ('一个县区为什么有好几十个邮编？',
     '邮政编码的最后两位标识投递局。一个县区的城区和乡镇各有邮政支局、所，每个投递局都有独立编号，所以县区越大、网点越多，邮编就越多。东莞、中山这类不设区的地级市，全市网点都挂在一个「县区」下，邮编可达两百个左右。'),
    ('寄快递只写 6 位邮编够吗？',
     '够用。国内邮件按邮编分拣，写到县区一级的邮编即可正常投递，详细地址比邮编更重要；写错邮编一般也能按地址送达，但可能慢一些。国际邮件则要求邮编与城市、国家对应准确。'),
    ('为什么有的县区写着「市本级」？',
     '少数网点在邮政系统里登记在地级市本级、没有细分到区县（多为市中心枢纽局或跨区网点），本表单列为「某某市（市本级）」，邮编仍是该市城区的邮编。'),
    ('港澳台也有邮政编码吗？',
     '香港、澳门不设邮政编码，邮件按地址投递；台湾地区使用 3+2 位邮递区号（如台北 100）。本表只收录中国大陆 31 个省级行政区的邮编。'),
])}

## 五、数据来源与核对

- 网点名称、地址、邮编：整理自开源数据集 [mumuy/data_post](https://github.com/mumuy/data_post)（MIT 许可，全国邮政网点名录），共 {len(recs)} 条有效网点记录，已剔除标注「撤销」的停用网点并去重。
- 数据集里有 {sum(dropped.values())} 条记录的邮编位被误填成了行政区划代码（如安阳市的网点写成 `410500`、新蔡县写成 `411729`、台安县写成 `210321`），或位数错乱、地址栏填的是电话，与所在县区的邮编段完全不符，已一并剔除，不计入本表。
- 县区归属：以民政部 {DATA_YEAR} 年县以上行政区划代码为骨架（整理自 [yescallop/areacodes](https://github.com/yescallop/areacodes)，CC0），按网点登记的省、市、区县归入现行县区。数据里沿用的旧名已改为现行名称：大港区→滨海新区、万盛区→綦江区、莱芜市→济南市莱芜区 / 钢城区、蓬莱市、长岛县→蓬莱区、上饶县→广信区、邯郸县→邯山区、孟津县→孟津区、米林县→米林市、错那县→错那市、嫩江县→嫩江市、广德县→广德市、塔什库尔干县→塔什库尔干塔吉克自治县，雄安新区三县归入保定市。
- 开发区、新区、管理区一般沿用所在县区的邮编；烟台经济技术开发区、大柴旦行政委员会、深汕特别合作区在现行区划代码里没有独立代码，按数据集原样单列；三沙市的网点归入西沙区。重庆市江北区、渝北区 2025 年撤销并入两江新区，两区的网点统一归入两江新区。
- 大兴安岭地区的加格达奇区、松岭区、新林区、呼中区是地区辖区，民政部区划代码不单列，本表按网点登记原样保留。
- 邮编会随网点调整变化，寄件前可在中国邮政官网或 11185 核对具体地址。
"""
    write_page('china-postal-codes', {
        'slug': 'china-postal-codes',
        'title': f'全国邮政编码表（{len(all_codes)} 个邮编，2026 最新）：按省份、县区查询',
        'summary': f'全国 {len([p for _, p in provs if p in data])} 个省级行政区、{n_rows} 个县区的 {len(all_codes)} 个邮政编码完整对照表，输入邮编或地名即可查询；讲清 6 位邮编的省、邮区、县市、投递局四级编码规则，首位数字与大区的对应关系，以及邮编与行政区划代码、身份证、电话区号的区别。',
        'date': UPDATED,
        'updated': UPDATED,
        'category': '地理基础',
        'subject': '人文地理',
        'tags': '邮政编码, 邮编查询, 邮编表, 邮政区号, 邮政编码查询, 县区邮编',
        'tableSearch': 'true',
        'tableSearchPlaceholder': '输入邮编、县区或地级市，如 518000 / 南山 / 深圳',
    }, body)
    print('ok', len(all_codes), n_rows, len(recs), '剔除', sum(dropped.values()), sorted(dropped))
    if unmatched:
        print('未匹配', sum(unmatched.values()), unmatched.most_common(10))


if __name__ == '__main__':
    build()
