"""生成 content/learn/china-license-plate-codes.md：全国车牌省份简称与发牌机关代号对照表。

数据：DeerTools「车牌归属地一览表」（依 GA 36-2018 与各地交管公开信息整理，2026-09-28 核对版），
并与另一份独立公开整理（machomeng.pages.dev/48417，2025-10）逐条比对城市归属。
用法：python3 scripts/ref_pages/plates.py
"""
import collections
import html
import re

from common import faq, fetch, table, write_page

UPDATED = '2026-11-15'
DEER = 'https://deertools.cn/tools/plate-location'
MACHO = 'https://machomeng.pages.dev/48417/'
PROVS = [('京', '北京市'), ('津', '天津市'), ('冀', '河北省'), ('晋', '山西省'), ('蒙', '内蒙古自治区'), ('辽', '辽宁省'),
         ('吉', '吉林省'), ('黑', '黑龙江省'), ('沪', '上海市'), ('苏', '江苏省'), ('浙', '浙江省'), ('皖', '安徽省'),
         ('闽', '福建省'), ('赣', '江西省'), ('鲁', '山东省'), ('豫', '河南省'), ('鄂', '湖北省'), ('湘', '湖南省'),
         ('粤', '广东省'), ('桂', '广西壮族自治区'), ('琼', '海南省'), ('渝', '重庆市'), ('川', '四川省'), ('贵', '贵州省'),
         ('云', '云南省'), ('藏', '西藏自治区'), ('陕', '陕西省'), ('甘', '甘肃省'), ('青', '青海省'), ('宁', '宁夏回族自治区'),
         ('新', '新疆维吾尔自治区')]


def strip(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s)).strip()


def load():
    h = open(fetch(DEER, 'deer.html'), encoding='utf-8').read()
    rows = re.findall(r'<tr[^>]*>\s*<td[^>]*>\s*([\u4e00-\u9fa5][A-Z])\s*</td>\s*<td[^>]*>(.*?)</td>(?:\s*<td[^>]*>(.*?)</td>)?', h, re.S)
    deer = {k: (strip(c), strip(n or '')) for k, c, n in rows}
    m = open(fetch(MACHO, 'macho.html'), encoding='utf-8', errors='ignore').read()
    macho = {}
    for sec in re.split(r'<h4[^>]*>', m)[3:]:
        lines = [l.strip() for l in html.unescape(re.sub(r'<[^>]+>', '\n', sec)).split('\n') if l.strip()]
        mm = re.match(r'.*（(.)）', lines[0])
        if not mm:
            continue
        for l in lines[1:]:
            x = re.match(r'^>?\s*([A-Z](?:/[A-Z])*)\s+(.+)$', l)
            if x:
                for letter in x.group(1).split('/'):
                    macho.setdefault(mm.group(1) + letter, x.group(2))
    return deer, macho


def build():
    deer, macho = load()
    assert len(deer) == 407, len(deer)
    both = [k for k in deer if k in macho and k[0] not in '京津沪渝']
    agree = [k for k in both if deer[k][0][:2] in macho[k] or macho[k].replace('原', '')[:2] in deer[k][0]
             or deer[k][1][:2] in macho[k]]
    assert len(agree) == len(both), [k for k in both if k not in agree]

    cnt = collections.Counter(k[0] for k in deer)
    overview, sections = [], []
    for ab, name in PROVS:
        keys = sorted(k for k in deer if k[0] == ab)
        cap = deer[ab + 'A'][0]
        overview.append([ab, name, cnt[ab], cap])
        rows = [[k, deer[k][0], deer[k][1] or ''] for k in keys]
        sections.append(f'### {name}（{ab}，{len(keys)} 个代号）\n\n' + table(['车牌', '城市 / 地区', '说明'], rows))
    by_city = collections.defaultdict(list)
    for k, (c, _) in deer.items():
        if k[0] not in '京津沪渝':
            by_city[c].append(k)
    multi = sorted(([c, '、'.join(sorted(v))] for c, v in by_city.items() if len(v) > 1), key=lambda x: -len(x[1]))

    body = f"""
> 数据更新：**{UPDATED}**。共收录 31 个省级行政区的 **{len(deer)} 个**发牌机关代号。顶部搜索框可以直接输入车牌前两位（如 `粤B`）或城市名（如 `苏州`）查询。

## 一、车牌怎么看是哪里的

普通汽车号牌的格式是 **省份简称 + 发牌机关代号 + 序号**，例如「粤B·12345」：

- **第 1 位汉字**：省、自治区、直辖市的简称，如「粤」是广东；
- **第 2 位字母**：发牌机关代号，对应省内的某个地级市（或直辖市的某个车管分所），如「粤B」是深圳；
- **后 5 位**（新能源车 6 位）：序号。

一般规律是 **A 为省会（首府）**，其余字母大致按地市排列，但各省分配方式不同，不能硬套。字母 **I 和 O 不用**，避免和数字 1、0 混淆。

注意：**车牌归属地只代表车辆在哪里登记上牌**，不代表车主住在那里，更不能据此判断车主身份。

## 二、新能源车牌怎么区分

依据公安部行业标准 GA 36-2018《中华人民共和国机动车号牌》：

- 新能源车牌序号是 **6 位**，比普通车牌多 1 位；
- **小型新能源车**：序号第 1 位是字母 **D（纯电动）**或 **F（非纯电动，如插电混动）**，号牌为渐变绿色；
- **大型新能源车**：序号最后 1 位是 D 或 F，号牌为黄绿双拼色。

## 三、31 个省级行政区车牌简称一览

{table(['简称', '省级行政区', '代号数', 'A 牌城市'], overview)}

车牌简称与常说的省份简称大多一致，但有几个容易混：贵州车牌用「**贵**」（不用黔），云南用「**云**」（不用滇），甘肃用「**甘**」（不用陇），四川用「**川**」，陕西用「**陕**」。香港、澳门、台湾的车辆号牌由当地自行管理，不在本表范围；内地签发的「**粤Z**」号牌用于往来港澳的车辆。

## 四、一个城市有多个代号

车多了号段不够用，一些城市启用了第二、第三个字母：

{table(['城市', '车牌代号'], multi)}

北京、天津、上海、重庆四个直辖市各有多个字母，归属地都是本市，见下表。

## 五、全国车牌代号全表（按省份）

{chr(10).join(sections)}

{faq([
    ('粤B 是哪里的车牌？',
     '粤B 是广东省深圳市。可以在本页顶部搜索框输入任意车牌前两位直接查询。'),
    ('为什么车牌字母没有 I 和 O？',
     '为了避免和数字 1、0 混淆，车牌序号和发牌机关代号都不使用字母 I 和 O。'),
    ('城市撤并后，原来的车牌还能用吗？',
     '可以，已经发出的号牌继续有效。例如原莱芜市 2019 年并入济南市，原「鲁S」号牌照常使用，表中已注明。'),
    ('车牌第二位是 A，一定是省会吗？',
     '省级行政区的 A 字头都分配给了省会（首府）或直辖市本级，但 B 及以后的字母各省分配方式不同，例如闽B 是莆田、闽D 才是厦门，最好直接查表。'),
    ('新增的号段多久更新一次？',
     '各地会根据需要新增号段，本表半年左右复核一次。办理业务请以当地公安交管部门公告为准。'),
])}

## 六、数据来源与核对

- 编码规则：公安部行业标准 GA 36-2018《中华人民共和国机动车号牌》。
- 代号与城市对应：整理自 [DeerTools 车牌归属地一览表]({DEER})（依 GA 36-2018 与各地交管公开信息整理，2026-09-28 核对版），并与另一份独立的公开整理资料逐条比对：两者共同收录的 {len(both)} 个非直辖市代号，城市归属全部一致。
- 部分已停发的历史号段、警用及内部专用号段未收录。
"""
    write_page('china-license-plate-codes', {
        'slug': 'china-license-plate-codes',
        'title': f'全国车牌代码对照表：31 省车牌简称与 {len(deer)} 个发牌城市代号（粤B 是哪里）',
        'summary': f'全国 31 个省级行政区车牌简称与 {len(deer)} 个发牌机关代号对照表，输入车牌前两位或城市名即可查归属地。说明车牌「省份简称 + 字母 + 序号」的结构、A 牌规律、字母 I 和 O 不用的原因、新能源车牌 D / F 的含义，以及一城多代号、城市撤并后的历史号段。',
        'date': UPDATED,
        'category': '地理基础',
        'subject': '人文地理',
        'tags': '车牌代码, 车牌归属地, 车牌简称, 发牌机关代号, GA 36-2018, 新能源车牌, 城市代码',
        'tableSearch': 'true',
        'tableSearchPlaceholder': '输入车牌代号或城市名，如 粤B / 苏州',
    }, body)
    print('ok', len(deer), 'both', len(both))


if __name__ == '__main__':
    build()
