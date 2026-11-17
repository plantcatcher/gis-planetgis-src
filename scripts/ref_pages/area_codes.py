"""生成 content/learn/china-telephone-area-codes.md：全国固定电话长途区号表。

数据：DeerTools「电话区号查询」（依区号核配结果与各地通信管理局并网公告整理，并与 libphonenumber 交叉核对，
2026-09-28 核对版），另与一份公开整理（aode8.com，2025-06）逐条比对；差异均已人工核实（见 CHECK 注释）。
用法：python3 scripts/ref_pages/area_codes.py
"""
import html
import re

from common import code, faq, fetch, table, write_page

UPDATED = '2026-11-15'
DEER = 'https://deertools.cn/tools/area-code'
# CHECK：与 aode8 的差异——莱芜 0634 已于 2020-04-25 并入济南 0531（齐鲁网报道），以 DeerTools 为准；
# 兵团县级市、个别县的区号属县级口径，本表只列地级口径，不收录。
EXTRA_CHANGES = [  # DeerTools 变更表未收、但有公开记录的并网
    ('0565', '巢湖市（今合肥市代管县级市）', '0551', '2012-12-08', '合肥原号码前加 6，巢湖、庐江原号码前加 8'),
]
SPECIAL = [
    ['中国大陆', code('+86'), '境外拨打大陆座机：+86 + 去掉 0 的区号 + 号码'],
    ['中国香港', code('+852'), '不设区号，号码 8 位'],
    ['中国澳门', code('+853'), '不设区号，号码 8 位'],
    ['中国台湾', code('+886'), '岛内另有区码，如台北 02'],
]


def parse():
    h = open(fetch(DEER, 'deer_area.html'), encoding='utf-8').read()
    t = html.unescape(re.sub(r'<[^>]+>', '\n', h))
    t = re.sub(r'\n\s*\n+', '\n', t)
    a = t.index('\n北京市\n（\n1\n 个区号）')
    b = t.index('共用区号查询：哪些城市共用一个区号')
    lines = [l.strip() for l in t[a:b].split('\n') if l.strip()]
    rows, prov, i = [], None, 0
    while i < len(lines):
        if i + 3 < len(lines) and lines[i + 1] == '（' and lines[i + 3] == '个区号）':
            prov = lines[i]
            i += 4
            continue
        if re.fullmatch(r'0\d{2,3}', lines[i]):
            note = ''
            if i + 2 < len(lines) and not re.fullmatch(r'0\d{2,3}', lines[i + 2]) and lines[i + 3:i + 4] != ['（']:
                note = lines[i + 2]
                rows.append((prov, lines[i], lines[i + 1], note))
                i += 3
                continue
            rows.append((prov, lines[i], lines[i + 1], note))
            i += 2
            continue
        i += 1
    c = t.index('区号变更记录（每行附来源）')
    seg = t[c:t.index('旧区号还在号码簿上怎么办', c)]
    changes = re.findall(r'\n(0\d{2,3})\n(?:（已停用）\n)?([^\n]+)\n(0\d{2,3})\n(\d{4}-\d{2}-\d{2})\n([^\n]+)\n', seg)
    return rows, changes


def build():
    rows, changes = parse()
    provs = list(dict.fromkeys(p for p, *_ in rows))
    assert len(provs) == 31 and len(rows) == 320, (len(provs), len(rows))
    assert len(changes) == 13
    changes = sorted(changes + EXTRA_CHANGES, key=lambda x: x[3], reverse=True)

    sections = []
    for p in provs:
        r = [[code(a), c, n] for pp, a, c, n in rows if pp == p]
        sections.append(f'### {p}（{len(r)} 个区号）\n\n' + table(['区号', '城市 / 地区', '说明'], r, raw_cols=(0,)))
    shared = [[code(a), p, c] for p, a, c, _ in rows if '、' in c]
    two = sorted([code(a), c] for p, a, c, _ in rows if len(a) == 3)

    body = f"""
> 数据更新：**{UPDATED}**。收录中国大陆 31 个省级行政区的 **{len(rows)} 个**长途区号，以及近年区号并网的变更记录。顶部搜索框可直接输入区号（如 `0755`）或城市名（如 `深圳`）查询。

## 一、区号怎么拨

- **同城拨打座机**：直接拨号码，不加区号；
- **外地拨打座机**：0 + 区号 + 号码，例如深圳号码写作 `0755-12345678`；
- **境外拨打座机**：+86 + **去掉开头 0 的区号** + 号码，例如 `+86 755 1234 5678`、北京 `+86 10 1234 5678`。最常见的错误是写成「+86 0755…」，多出的 0 在很多国家会拨不通。
- **手机号没有区号**，拨打手机永远直接拨 11 位号码。

## 二、区号的编排规律

- **2 位区号**（含开头的 0 为 3 位）只给了北京 `010` 和 `020`–`029` 的大区中心城市（`026` 空缺）：

{table(['区号', '城市'], two, raw_cols=(0,))}

- 其余都是 **3 位区号**（含 0 为 4 位），按地级市（含自治州、地区、盟）分配。首位大致对应大区：3 开头多在华北，4 开头多在东北和内蒙古，5 开头多在华东，7 开头多在华中、华南，8 开头多在西南，9 开头多在西北；6 开头分散在山东、广东、云南等地。这只是大致规律，具体要查表。
- **县、区、县级市没有自己的区号**，都用所属地级市的区号，例如昆山用苏州的 `0512`。

## 三、多个城市共用的区号

相邻城市「同城化」电话并网后，会合用一个区号，互相拨打按本地计费：

{table(['区号', '省份', '共用城市'], shared, raw_cols=(0,))}

## 四、全国电话区号表（按省份）

{chr(10).join(sections)}

## 五、区号变更记录：旧区号现在怎么拨

区号并网后，旧区号停用，原号码通常在前面加 1 位数字升到 8 位。按下表把旧名片、旧合同上的号码改写即可。眉山、资阳迁出后，`0833` 仍由乐山使用、`0832` 仍由内江使用，这两个区号没有停用。

{table(['旧区号', '城市', '现区号', '启用日期', '号码变化'], [[code(a), b, code(c), d, e] for a, b, c, d, e in changes], raw_cols=(0, 2))}

## 六、港澳台与国际区号

{table(['地区', '国际区号', '说明'], SPECIAL, raw_cols=(1,))}

{faq([
    ('0755 是哪里的区号？',
     '0755 是广东省深圳市。可以在本页顶部搜索框输入任意区号或城市名查询。'),
    ('县城有自己的区号吗？',
     '没有。中国大陆的长途区号按地级市（含自治州、地区、盟）分配，下辖的区、县和县级市都用所属地级市的区号。'),
    ('为什么 024 是好几个城市共用？',
     '沈阳、抚顺、本溪、铁岭先后做了电话并网，合成一个本地网、统一用 024，旧区号 0410、0413、0414 已停用，相互拨打不再算长途。'),
    ('莱芜的区号还是 0634 吗？',
     '不是。原莱芜市 2019 年并入济南市，2020 年 4 月 25 日起电话也并网，区号统一为 0531，原 7 位号码前加 7。'),
    ('电话区号和邮政编码、行政区划代码有关系吗？',
     '没有。三者由不同部门按不同体系编制：区号是电信网编码，邮编是邮政投递编码，行政区划代码是民政部门的地区编码，可参考[行政区划代码全表](/learn/china-admin-division-codes)。'),
])}

## 七、数据来源与核对

- 区号与城市对应、并网变更记录：整理自 [DeerTools 电话区号查询]({DEER})（依公开的区号核配结果与各地通信管理局、运营商并网公告整理，并与 libphonenumber 交叉核对，2026-09-28 核对版）。
- 另与一份公开整理的区号表逐条比对，差异（如莱芜 0634）已按通信管理局并网公告和新闻报道核实。巢湖 0565 并入 0551 的记录据公开资料补入。
"""
    write_page('china-telephone-area-codes', {
        'slug': 'china-telephone-area-codes',
        'title': f'全国电话区号表（{len(rows)} 个区号，2026 最新）：城市区号查询与旧区号变更',
        'summary': f'中国大陆 31 个省级行政区共 {len(rows)} 个固定电话长途区号的完整对照表，输入区号或城市名即可查询；说明外地、境外拨打座机的写法，2 位与 3 位区号的编排规律，多个城市共用区号的情况，以及咸阳、开封、莱芜、公主岭等旧区号并网后的改拨方法。',
        'date': UPDATED,
        'category': '地理基础',
        'subject': '人文地理',
        'tags': '电话区号, 长途区号, 区号查询, 固定电话, 城市区号, 区号并网',
        'tableSearch': 'true',
        'tableSearchPlaceholder': '输入区号或城市名，如 0755 / 深圳',
    }, body)
    print('ok', len(rows), len(changes))


if __name__ == '__main__':
    build()
