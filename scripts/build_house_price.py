# -*- coding: utf-8 -*-
"""
全国房价时空可视化 · 数据管线

输入：国家统计局「70 个大中城市商品住宅销售价格变动情况」月度数据
      经 https://github.com/hugohe3/70cityprice 整理为 CSV（2006-01 至今，248 个月）
      缓存到 _house_cache/70cityprice.csv，避免每次构建都联网。

输出：public/maps/house-price/data/
  - months.json   月份索引 + 元信息（城市数、口径说明）
  - cities.json   70 个城市的逐月指数（紧凑数组，前端按需读）
  - provinces.json 省级聚合（34 省，由下辖被监测城市加权）

口径要点（务必遵守，违反即数据错误）：
  1. 这是**价格指数**，不是元/㎡ 绝对值。100 = 与基期/上月/去年同期持平。
  2. 「同比」「环比」可直接跨年使用；「定基比」因基期每五年轮换（2010/2015/2020），
     **禁止跨基期拼接** —— 本管线不使用定基比，只用同比 + 环比。
  3. 省级值由省内被监测城市聚合；统计局只监测 70 城，未覆盖城市用省内
     省会/主要城市代表，聚合方式在 meta 里显式说明。
"""
import os
import io
import csv
import json
import math
import urllib.request
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, '_house_cache')
OUT = os.path.join(ROOT, 'public', 'maps', 'house-price', 'data')
CSV_URL = 'https://raw.githubusercontent.com/hugohe3/70cityprice/main/70cityprice.csv'
CSV_PATH = os.path.join(CACHE, '70cityprice.csv')

# ── 是否为直辖市/特区（省级聚合时自身即城市） ──────────────────────
MUNICIPAL = {'北京', '上海', '天津', '重庆'}

# ── 城市 -> 省份（adcode 前两位） ────────────────────────────────
PROV_NAME = {
    '11': '北京市', '12': '天津市', '13': '河北省', '14': '山西省',
    '15': '内蒙古自治区', '21': '辽宁省', '22': '吉林省', '23': '黑龙江省',
    '31': '上海市', '32': '江苏省', '33': '浙江省', '34': '安徽省',
    '35': '福建省', '36': '江西省', '37': '山东省', '41': '河南省',
    '42': '湖北省', '43': '湖南省', '44': '广东省', '45': '广西壮族自治区',
    '46': '海南省', '50': '重庆市', '51': '四川省', '52': '贵州省',
    '53': '云南省', '54': '西藏自治区', '61': '陕西省', '62': '甘肃省',
    '63': '青海省', '64': '宁夏回族自治区', '65': '新疆维吾尔自治区',
}
# 省 adcode（省级要素匹配用）
PROV_ADCODE = {
    '北京市': 110000, '天津市': 120000, '河北省': 130000, '山西省': 140000,
    '内蒙古自治区': 150000, '辽宁省': 210000, '吉林省': 220000, '黑龙江省': 230000,
    '上海市': 310000, '江苏省': 320000, '浙江省': 330000, '安徽省': 340000,
    '福建省': 350000, '江西省': 360000, '山东省': 370000, '河南省': 410000,
    '湖北省': 420000, '湖南省': 430000, '广东省': 440000, '广西壮族自治区': 450000,
    '海南省': 460000, '重庆市': 500000, '四川省': 510000, '贵州省': 520000,
    '云南省': 530000, '西藏自治区': 540000, '陕西省': 610000, '甘肃省': 620000,
    '青海省': 630000, '宁夏回族自治区': 640000, '新疆维吾尔自治区': 650000,
}

# 城市中心坐标（用于市级圆点标记；取自省界数据 centroid 与公开坐标整理）
CITY_CENTER = {
    '北京': [116.405, 39.905], '天津': [117.190, 39.126], '石家庄': [114.502, 38.045],
    '太原': [112.549, 37.857], '呼和浩特': [111.671, 40.818], '沈阳': [123.429, 41.797],
    '大连': [121.618, 38.914], '长春': [125.325, 43.887], '哈尔滨': [126.642, 45.757],
    '上海': [121.473, 31.232], '南京': [118.767, 32.042], '杭州': [120.154, 30.287],
    '宁波': [121.550, 29.875], '合肥': [117.283, 31.861], '福州': [119.306, 26.075],
    '厦门': [118.089, 24.479], '南昌': [115.892, 28.676], '济南': [117.001, 36.676],
    '青岛': [120.355, 36.083], '郑州': [113.665, 34.758], '武汉': [114.299, 30.584],
    '长沙': [112.982, 28.194], '广州': [113.281, 23.125], '深圳': [114.085, 22.548],
    '南宁': [108.320, 22.824], '海口': [110.331, 20.032], '重庆': [106.505, 29.533],
    '成都': [104.066, 30.659], '贵阳': [106.713, 26.578], '昆明': [102.712, 25.041],
    '西安': [108.948, 34.263], '兰州': [103.824, 36.058], '西宁': [101.779, 36.623],
    '银川': [106.278, 38.466], '乌鲁木齐': [87.618, 43.793],
    '唐山': [118.175, 39.635], '秦皇岛': [119.600, 39.935], '包头': [109.840, 40.658],
    '丹东': [124.383, 40.124], '锦州': [121.135, 41.120], '吉林': [126.553, 43.844],
    '牡丹江': [129.618, 44.583], '无锡': [120.302, 31.574], '徐州': [117.184, 34.262],
    '扬州': [119.421, 32.393], '温州': [120.699, 27.995], '金华': [119.649, 29.089],
    '蚌埠': [117.363, 32.939], '安庆': [117.043, 30.508], '泉州': [118.589, 24.909],
    '九江': [115.993, 29.712], '赣州': [114.940, 25.851], '烟台': [121.391, 37.539],
    '济宁': [116.587, 35.415], '洛阳': [112.454, 34.619], '平顶山': [113.308, 33.745],
    '宜昌': [111.291, 30.702], '襄阳': [112.144, 32.042], '岳阳': [113.133, 29.370],
    '常德': [111.699, 29.032], '韶关': [113.592, 24.801], '湛江': [110.359, 21.271],
    '惠州': [114.416, 23.111], '桂林': [110.290, 25.274], '北海': [109.120, 21.473],
    '三亚': [109.508, 18.248], '泸州': [105.443, 28.889], '南充': [106.083, 30.795],
    '遵义': [106.937, 27.707], '大理': [100.226, 25.589],
}


def ensure_csv():
    """下载主 CSV。5MB 大文件在弱网下易触发 SSL UNEXPECTED_EOF，
    改为分块写盘 + 重试（最多 5 次），失败不留半个文件。"""
    os.makedirs(CACHE, exist_ok=True)
    if os.path.exists(CSV_PATH) and os.path.getsize(CSV_PATH) > 1_000_000:
        print('[cache] 使用本地 CSV')
        return CSV_PATH
    for attempt in range(1, 6):
        tmp = CSV_PATH + '.part'
        try:
            print('[net] 下载 70cityprice.csv ... (第 %d 次)' % attempt)
            req = urllib.request.Request(CSV_URL, headers={'User-Agent': 'Mozilla/5.0'})
            resp = urllib.request.urlopen(req, timeout=90)
            total = 0
            with open(tmp, 'wb') as f:
                while True:
                    chunk = resp.read(256 * 1024)
                    if not chunk:
                        break
                    f.write(chunk)
                    total += len(chunk)
            if total < 1_000_000:
                raise IOError('下载不完整 %d 字节' % total)
            os.replace(tmp, CSV_PATH)
            print('[net] 已缓存 %d 字节' % total)
            return CSV_PATH
        except Exception as e:
            print('[net] 失败：%s' % str(e)[:120])
            if os.path.exists(tmp):
                os.remove(tmp)
    raise SystemExit('CSV 下载失败，请检查网络后重跑')


def load_rows(path):
    with open(path, encoding='utf-8-sig') as f:
        return list(csv.DictReader(f))


def midx(datestr):
    y, m, _ = datestr.split('/')
    return int(y) * 12 + int(m) - 1


def main():
    path = ensure_csv()
    rows = load_rows(path)
    print('[data] %d 行' % len(rows))

    # months 索引
    month_set = sorted({r['DATE'] for r in rows}, key=midx)
    month_index = {d: i for i, d in enumerate(month_set)}
    months = []
    for d in month_set:
        y, m, _ = d.split('/')
        months.append({'y': int(y), 'm': int(m), 'key': '%04d-%02d' % (int(y), int(m))})
    print('[data] %d 个月：%s → %s' % (len(months), months[0]['key'], months[-1]['key']))

    # 逐城市展开：三口径 × 主要指数列
    # 只用 同比(yoy) / 环比(mom)，不用定基比（基期轮换，禁止跨期）
    CALIBER = {'同比': 'yoy', '环比': 'mom'}
    COL = {
        'CommodityHouseIDX': 'new',       # 新建商品住宅
        'SecondHandIDX': 'sh',            # 二手住宅
    }
    # city -> { new: {yoy:[], mom:[]}, sh: {...} }
    city_series = defaultdict(lambda: {
        'new': {'yoy': [None] * len(months), 'mom': [None] * len(months)},
        'sh': {'yoy': [None] * len(months), 'mom': [None] * len(months)},
    })
    city_adcode = {}
    city_names = set()

    for r in rows:
        cal = CALIBER.get(r['FixedBase'])
        if not cal:
            continue
        i = month_index[r['DATE']]
        c = r['CITY']
        city_names.add(c)
        city_adcode[c] = r['ADCODE']
        for col, key in COL.items():
            v = r[col].strip()
            if v:
                try:
                    city_series[c][key][cal][i] = float(v)
                except ValueError:
                    pass

    cities_out = []
    for c in sorted(city_names):
        s = city_series[c]
        cities_out.append({
            'name': c,
            'adcode': city_adcode[c],
            'prov': PROV_NAME.get(city_adcode[c][:2], ''),
            'lng': CITY_CENTER.get(c, [0, 0])[0],
            'lat': CITY_CENTER.get(c, [0, 0])[1],
            'new': {'yoy': s['new']['yoy'], 'mom': s['new']['mom']},
            'sh': {'yoy': s['sh']['yoy'], 'mom': s['sh']['mom']},
        })
    print('[data] %d 个城市' % len(cities_out))

    # ── 省级聚合 ──────────────────────────────────────────────
    # 聚合口径：省内被监测城市的**算数平均**（指数已无量纲，平均可解释为"省内
    # 主要城市的中位式表现"）。直辖市直接取本市。未进入 70 城名单的省份
    # （西藏）无数据，标记为 null。
    by_prov = defaultdict(list)
    for c in cities_out:
        if c['prov']:
            by_prov[c['prov']].append(c)

    provinces_out = []
    for prov, adcode in PROV_ADCODE.items():
        members = by_prov.get(prov, [])
        entry = {
            'name': prov,
            'adcode': adcode,
            'cities': [m['name'] for m in members],
            'cityCount': len(members),
            'new': {'yoy': [], 'mom': []},
            'sh': {'yoy': [], 'mom': []},
        }
        for key in ('new', 'sh'):
            for cal in ('yoy', 'mom'):
                series = []
                for i in range(len(months)):
                    vals = [m[key][cal][i] for m in members if m[key][cal][i] is not None]
                    series.append(round(sum(vals) / len(vals), 1) if vals else None)
                entry[key][cal] = series
        provinces_out.append(entry)

    covered = sum(1 for p in provinces_out if p['cityCount'] > 0)
    print('[data] 省级聚合 %d 个（有数据 %d）' % (len(provinces_out), covered))

    # ── 校验 ─────────────────────────────────────────────────
    warn = []
    for c in cities_out:
        if not c['lng'] or not c['lat']:
            warn.append('缺坐标: %s' % c['name'])
    last = len(months) - 1
    missing_last = [c['name'] for c in cities_out if c['new']['yoy'][last] is None]
    if missing_last:
        warn.append('末月无新房同比: %s' % ','.join(missing_last))
    for w in warn:
        print('[warn]', w)

    os.makedirs(OUT, exist_ok=True)
    meta = {
        'source': '国家统计局「70 个大中城市商品住宅销售价格变动情况」（月度）',
        'sourceUrl': 'https://www.stats.gov.cn/',
        'via': 'https://github.com/hugohe3/70cityprice（2006 至今 CSV 整理与自动更新）',
        'updated': months[-1]['key'],
        'monthCount': len(months),
        'cityCount': len(cities_out),
        'provinceCount': covered,
        'unit': '价格指数（100 = 持平；>100 上涨，<100 下跌）',
        'caliber': {
            'new': '新建商品住宅销售价格指数',
            'sh': '二手住宅销售价格指数',
            'yoy': '同比（与上年同月比）',
            'mom': '环比（与上月比）',
        },
        'note': '指数为相对数，不含价格绝对水平，不能反推元/㎡。'
                '省级值为省内被监测城市的算术平均，仅代表监测城市的表现，'
                '不代表全省全域。',
        'months': months,
    }
    with open(os.path.join(OUT, 'months.json'), 'w', encoding='utf-8') as f:
        json.dump(meta, f, ensure_ascii=False, separators=(',', ':'))
    with open(os.path.join(OUT, 'cities.json'), 'w', encoding='utf-8') as f:
        json.dump({'cities': cities_out}, f, ensure_ascii=False, separators=(',', ':'))
    with open(os.path.join(OUT, 'provinces.json'), 'w', encoding='utf-8') as f:
        json.dump({'provinces': provinces_out}, f, ensure_ascii=False, separators=(',', ':'))

    for fn in ('months.json', 'cities.json', 'provinces.json'):
        p = os.path.join(OUT, fn)
        print('[out] %s  %.0f KB' % (fn, os.path.getsize(p) / 1024))


if __name__ == '__main__':
    main()
