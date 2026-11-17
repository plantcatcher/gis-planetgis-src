"""生成 content/learn/china-airport-codes.md：全国民用运输机场三字码（IATA）/ 四字码（ICAO）对照表。

数据流程：
  1. 机场清单与 2025 年旅客吞吐量：民航局《2025 年全国民用运输机场吞吐量排名》xlsx（官方，268 个）
  2. 三字码：按「城市/机场名」匹配 timeon1/tmc_dataset 中文机场表；匹配不上的人工指定（MANUAL）
  3. 四字码、英文名：OurAirports（公有领域）按三字码关联
  4. 省份：按城市名匹配民政部行政区划代码（OurAirports 的省份字段有错，如把山西机场标成陕西，不采用）
用法：python3 scripts/ref_pages/airports.py（依赖 admin_codes.py 已下载的 2025.txt 缓存）
"""
import csv
import json
import re

import pandas as pd

from common import code, faq, fetch, table, write_page

UPDATED = '2026-11-15'
CAAC_XLSX = 'https://www.caac.gov.cn/XXGK/XXGK/TJSJ/202602/P020260226360830390937.xlsx'
CAAC_PAGE = 'https://www.caac.gov.cn/XXGK/XXGK/TJSJ/202602/t20260226_230119.html'
TMC = 'https://raw.githubusercontent.com/timeon1/tmc_dataset/master/citys-cn-code.json'
OA = 'https://davidmegginson.github.io/ourairports-data/airports.csv'
ADMIN = 'https://raw.githubusercontent.com/yescallop/areacodes/master/data/2025.txt'

# 中文表匹配不上（新机场 / 改名）时人工指定的三字码，均已在 OurAirports 中核对存在
MANUAL = {
    '乌鲁木齐/天山': 'URC', '海西/茫崖': 'HTT', '和田/昆冈': 'HTN', '兴义/万峰林': 'ACX', '乌兰浩特/义勒力特': 'HLH',
    '哈密/伊州': 'HMI', '佳木斯/松江': 'JMU', '塔城/千泉': 'TCG', '莎车/叶尔羌': 'QSZ', '二连浩特/赛乌素': 'ERL',
    '奇台/江布拉克': 'JBK', '临沧/博尚': 'LNJ', '丽水': 'LIJ', '梅州/梅县': 'MXZ', '且末/玉都': 'IQM',
    '巴里坤/大河': 'DHH', '绥芬河/东宁': 'HSF', '赣州/瑞金': 'JRJ', '亳州': 'BZJ', '天水/麦积山': 'THQ',
    '塔什库尔干/红其拉甫': 'HQL', '阿里/普兰': 'APJ', '嘉兴/南湖': 'JNH', '神农架/红坪': 'HPG',
    '和静/巴音布鲁克': 'HJB', '朝阳': 'CHG', '三沙/永兴': '',
}
# 2025 年及以后新通航、OurAirports 仍标为在建或未开通的机场：代码以航司 / 民航公布为准
NEW = {'LIJ', 'DHH', 'HSF', 'JRJ', 'BZJ', 'APJ'}
# 城市名 → 省级代码前两位（城市名不是行政区名、或有重名时）
PROV_ALIAS = {
    '上海': '31', '北京': '11', '天津': '12', '重庆': '50', '万州': '50', '黔江': '50', '西安': '61', '大同': '14',
    '吕梁': '14', '建三江': '23', '大兴安岭': '23', '五大连池': '23', '漠河': '23', '抚远': '23', '绥芬河': '23',
    '长白山': '22', '白山': '22', '延吉': '22', '长海': '21', '朝阳': '21', '阿里': '54', '山南': '54', '日喀则': '54',
    '连城': '35', '武夷山': '35', '黔东南': '52', '黔南': '52', '湘西': '43', '德宏': '53', '西双版纳': '53',
    '迪庆': '53', '腾冲': '53', '澜沧': '53', '宁蒗': '53', '沧源': '53', '甘南': '62', '敦煌': '62', '嘉峪关': '62',
    '甘孜': '51', '阿坝': '51', '九寨': '51', '稻城': '51', '阆中': '51', '西昌': '51', '海西': '63', '海北': '63',
    '果洛': '63', '玉树': '63', '格尔木': '63', '三沙': '46', '琼海': '46', '神农架': '42', '义乌': '33', '丽水': '33',
    '嘉兴': '33', '亳州': '34', '黄山': '34', '连云港': '32', '扬州': '32', '揭阳': '44', '惠州': '44', '吉安': '36',
    '赣州': '36',
}
for c in ('伊犁', '于田', '莎车', '和静', '昭苏', '新源', '布尔津', '富蕴', '若羌', '且末', '奇台', '巴里坤', '库车',
          '图木舒克', '阿拉尔', '石河子', '博乐', '塔什库尔干'):
    PROV_ALIAS[c] = '65'
for c in ('满洲里', '二连浩特', '霍林郭勒', '扎兰屯', '阿尔山', '额济纳旗', '阿拉善左旗', '阿拉善右旗', '锡林浩特',
          '呼伦贝尔', '乌兰浩特'):
    PROV_ALIAS[c] = '15'

HMT = [  # 港澳台主要机场（不在民航局境内统计口径内）
    ['中国香港', '香港国际机场', 'HKG', 'VHHH', 'Hong Kong International Airport'],
    ['中国澳门', '澳门国际机场', 'MFM', 'VMMC', 'Macau International Airport'],
    ['中国台湾', '桃园国际机场', 'TPE', 'RCTP', 'Taoyuan International Airport'],
    ['中国台湾', '台北松山机场', 'TSA', 'RCSS', 'Taipei Songshan Airport'],
    ['中国台湾', '高雄国际机场', 'KHH', 'RCKH', 'Kaohsiung International Airport'],
    ['中国台湾', '台中清泉岗机场', 'RMQ', 'RCMQ', 'Taichung International Airport'],
]


def load():
    x = pd.read_excel(fetch(CAAC_XLSX, 'caac_rank.xlsx'), header=None)
    caac = []
    for _, r in x.iterrows():
        name = str(r[0]).strip()
        if isinstance(r[1], (int, float)) and not pd.isna(r[1]) and name not in ('合计', 'nan'):
            caac.append((name, int(r[1]), None if pd.isna(r[2]) else int(r[2])))
    groups = json.load(open(fetch(TMC, 'tmc_city.json'), encoding='utf-8-sig'))
    tmc = []
    for c in (y for v in groups.values() for y in v):
        for a, n in zip((c.get('airportCode') or '').split(';'), (c.get('airportName') or '').split(';')):
            if a.strip() and n.strip():
                tmc.append((a.strip(), n.strip(), c['cityFullName']))
    oa = {r['iata_code']: r for r in csv.DictReader(open(fetch(OA, 'airports.csv'), encoding='utf-8')) if r['iata_code']}
    admin = {}
    for line in open(fetch(ADMIN, '2025.txt'), encoding='utf-8-sig'):
        m = re.match(r'^(\d{6})\s+(\S.*)$', line.strip())
        if m:
            admin[m.group(1)] = m.group(2)
    return caac, tmc, oa, admin


def build():
    caac, tmc, oa, admin = load()
    assert len(caac) == 268, len(caac)
    prov_name = {c[:2]: n for c, n in admin.items() if c.endswith('0000')}
    out = []
    for name, rank, pax in caac:
        city, short = name.split('/') if '/' in name else (name, name)
        if name in MANUAL:
            iata = MANUAL[name]
        else:
            cands = [t for t in tmc if short in t[1] and (city in t[1] or city in t[2])] or [t for t in tmc if short in t[1]]
            codes = {t[0] for t in cands}
            assert len(codes) == 1, (name, codes)
            iata = codes.pop()
        r = oa.get(iata)
        assert not iata or (r and r['iso_country'] == 'CN'), (name, iata)
        p = PROV_ALIAS.get(city)
        if not p:
            hits = {c[:2] for c, n in admin.items() if not c.endswith('0000') and n.startswith(city)}
            assert len(hits) == 1, (name, hits)
            p = hits.pop()
        out.append(dict(name=name, rank=rank, pax=pax, iata=iata, prov=prov_name[p],
                        icao=(r['icao_code'] or r['gps_code']) if r else '', en=r['name'] if r else ''))
    assert len({o['iata'] for o in out if o['iata']}) == sum(1 for o in out if o['iata'])

    def fmt_pax(v):
        return '—' if not v else f'{v / 10000:,.1f}'

    rows = [[o['rank'], o['name'], o['prov'], code(o['iata']) + ('*' if o['iata'] in NEW else '') if o['iata'] else '—',
             code(o['icao']) if o['icao'] else '—', o['en'] or '—', fmt_pax(o['pax'])] for o in out]
    top = [[o['rank'], o['name'], code(o['iata']), fmt_pax(o['pax'])] for o in out[:20]]
    by_prov = {}
    for o in out:
        by_prov[o['prov']] = by_prov.get(o['prov'], 0) + 1
    prov_rows = sorted(([k, v] for k, v in by_prov.items()), key=lambda x: -x[1])
    multi = {}
    for o in out:
        multi.setdefault(o['name'].split('/')[0], []).append(o)
    multi_rows = [[c, '、'.join(f"{o['name'].split('/')[-1]}（{o['iata']}）" for o in v)] for c, v in multi.items() if len(v) > 1]

    body = f"""
> 数据更新：**{UPDATED}**。机场清单与旅客吞吐量取自民航局 **《2025 年全国民用运输机场吞吐量排名》**（共 {len(out)} 个有统计数据的境内运输机场）。顶部搜索框可直接输入三字码、四字码、城市或机场名，例如 `PKX`、`ZGSZ`、`成都`。

## 一、三字码和四字码有什么区别

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th></th><th>三字码（IATA）</th><th>四字码（ICAO）</th></tr>
  </thead>
  <tbody>
    <tr><td>编码机构</td><td>国际航空运输协会 IATA</td><td>国际民用航空组织 ICAO</td></tr>
    <tr><td>用在哪</td><td>机票、登机牌、行李牌、订票系统</td><td>飞行计划、空管、航图、气象报文</td></tr>
    <tr><td>规律</td><td>多取城市或机场名的拼音 / 旧式拼写，规律不强</td><td>首字母按地区分配，中国大陆为 Z，第二位表示管理局区域</td></tr>
    <tr><td>例子</td><td><code>PEK</code> 北京首都、<code>CAN</code> 广州白云</td><td><code>ZBAA</code> 北京首都、<code>ZGGG</code> 广州白云</td></tr>
  </tbody>
</table>
</div>

**四字码第二位的地区含义**（中国大陆）：`ZB` 华北、`ZG` 中南（广东、广西、湖南等）、`ZH` 中南（河南、湖北）、`ZJ` 海南、`ZL` 西北、`ZP` 云南、`ZS` 华东、`ZU` 西南（四川、重庆、贵州、西藏）、`ZW` 新疆、`ZY` 东北。

不少三字码来自旧式拼写：广州 `CAN`（Canton）、北京 `PEK`（Peking）、重庆 `CKG`（Chungking）、青岛 `TAO`（Tsingtao）。

## 二、2025 年旅客吞吐量前 20

{table(['名次', '机场', '三字码', '旅客吞吐量（万人次）'], top, raw_cols=(2,))}

## 三、一城多机场

搜索航班时用错机场是常见坑，以下城市（按民航局统计名称前缀）有不止一个运输机场：

{table(['城市', '机场（三字码）'], multi_rows)}

另外，北京（`BJS`）、上海（`SHA` 同时也是虹桥机场代码）等城市还有「城市码」，订票时输入城市码会同时搜索该城市所有机场。

## 四、全国民用运输机场三字码 / 四字码全表

按 2025 年旅客吞吐量排序。「机场」列为民航局统计名称（城市 / 机场名）。带 * 的为 2025 年前后新通航的机场，代码取自公开数据库，请以航司和民航部门公布为准。

{table(['名次', '机场', '省份', '三字码', '四字码', '英文名称', '2025 年旅客（万人次）'], rows, raw_cols=(3, 4))}

## 五、港澳台主要机场

民航局统计口径不含港澳台地区，以下列出主要机场的代码：

{table(['地区', '机场', '三字码', '四字码', '英文名称'], [[a, b, code(c), code(d), e] for a, b, c, d, e in HMT], raw_cols=(2, 3))}

## 六、各省运输机场数量

{table(['省级行政区', '机场数（有统计的运输机场）'], prov_rows)}

{faq([
    ('全国一共有多少个民用运输机场？',
     '据民航局《2025 年全国民用运输机场生产统计公报》，截至 2025 年底，我国境内（不含港澳台）颁证运输机场共 270 个，其中定期航班通航的 266 个。本表收录吞吐量排名中的 268 个，另有铜仁德江、蚌埠滕湖两个机场已颁证但尚未正式通航。'),
    ('三字码会变吗？',
     '机场搬迁、新机场启用时可能变化。例如达州金垭机场（DZH）启用后取代了原达州河市机场，成都天府（TFU）、北京大兴（PKX）都是新机场启用时新分配的代码。'),
    ('为什么有的机场三字码和城市拼音对不上？',
     '三字码由 IATA 统一分配，同一个字母组合全球只能用一次，热门组合早被占用，只能另取；还有不少沿用了旧式英文拼写。'),
    ('通用机场有三字码吗？',
     '大多数通用机场没有 IATA 三字码，只有部分开通短途运输的才有。本表只收录运输机场。'),
    ('想要全国机场的点位数据做地图？',
     f'本站整理了[2025 全球机场分布数据 SHP](/downloads/global-airports-2025)，含 ICAO / IATA 标识与经纬度，可以直接用代码与本表挂接。'),
])}

## 七、数据来源

- 机场清单、名称与 2025 年吞吐量：[民航局《2025 年全国民用运输机场生产统计公报》及吞吐量排名]({CAAC_PAGE})。
- 三字码：整理自开源数据集 timeon1/tmc_dataset 并逐条与 OurAirports 核对；四字码、英文名称：[OurAirports](https://ourairports.com/)（公有领域数据）。
- 省份：按民政部行政区划名称匹配，人工校正了个别机场在公开数据库中的省份错误。
"""
    write_page('china-airport-codes', {
        'slug': 'china-airport-codes',
        'title': f'全国机场三字码 / 四字码对照表（{len(out)} 个运输机场，2025 民航局数据）',
        'summary': f'全国 {len(out)} 个民用运输机场的 IATA 三字码与 ICAO 四字码对照表，按民航局 2025 年旅客吞吐量排序，含所在省份、英文名称和吞吐量，可按代码、城市或机场名即时检索；并讲清三字码与四字码的区别、四字码地区规律、一城多机场与港澳台主要机场代码。',
        'date': UPDATED,
        'category': '地理基础',
        'subject': '人文地理',
        'tags': '机场三字码, 机场四字码, IATA, ICAO, 民用机场, 机场代码, 航空, 交通地理',
        'tableSearch': 'true',
        'tableSearchPlaceholder': '输入三字码 / 四字码或机场名，如 SZX / ZGSZ / 宝安',
    }, body)
    print('ok', len(out), 'multi', len(multi_rows))


if __name__ == '__main__':
    build()
