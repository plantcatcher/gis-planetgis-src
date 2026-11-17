"""生成两篇学习页：
  - content/learn/china-epsg-codes.md          中国常用坐标系 EPSG 代码速查
  - content/learn/gauss-kruger-zone-table.md   高斯-克吕格 3°/6° 分带带号、中央经线与各省对照

EPSG 名称与参数一律从 pyproj 自带的 PROJ 数据库读取（不手写），
各省经度范围由阿里云 DataV 省级边界 GeoJSON 计算。
用法：python3 scripts/ref_pages/crs_pages.py
"""
import json
import math

from pyproj import CRS, __proj_version__
from shapely.geometry import shape

from common import code, faq, fetch, table, write_page

UPDATED = '2026-11-15'
DATAV = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json'


def params(epsg):
    crs = CRS.from_epsg(epsg)
    cm = fe = None
    if crs.coordinate_operation:
        for p in crs.coordinate_operation.params:
            if 'Longitude of natural origin' in p.name:
                cm = p.value
            if 'False easting' in p.name:
                fe = p.value
    return crs, cm, fe


def gk_series(start, count, expect):
    """连续 EPSG 段：校验名称包含 expect，返回 [(epsg, 中央经线, 假东, 名称)]"""
    out = []
    for e in range(start, start + count):
        crs, cm, fe = params(e)
        assert expect in crs.name, (e, crs.name)
        out.append((e, cm, fe, crs.name))
    return out


DATUMS = {
    'CGCS2000': {'six_zone': (4491, 11), 'six_cm': (4502, 11), 'three_zone': (4513, 21), 'three_cm': (4534, 21)},
    'Xian 1980': {'six_zone': (2327, 11), 'six_cm': (2338, 11), 'three_zone': (2349, 21), 'three_cm': (2370, 21)},
    'Beijing 1954': {'six_zone': (21413, 11), 'six_cm': (21453, 11), 'three_zone': (2401, 21), 'three_cm': (2422, 21)},
}
DATUM_ZH = {'CGCS2000': '2000 国家大地坐标系（CGCS2000）', 'Xian 1980': '1980 西安坐标系', 'Beijing 1954': '1954 北京坐标系'}


def gk_tables():
    tabs = {}
    for d, s in DATUMS.items():
        six_z = gk_series(*s['six_zone'], d)
        six_c = gk_series(*s['six_cm'], d)
        thr_z = gk_series(*s['three_zone'], d)
        thr_c = gk_series(*s['three_cm'], d)
        six = []
        for (ez, cmz, fez, _), (ec, cmc, fec, _) in zip(six_z, six_c):
            assert cmz == cmc and fec == 500000
            zone = int(round(fez // 1000000))
            assert cmz == 6 * zone - 3
            six.append([zone, f'{cmz:g}°E', code(f'EPSG:{ez}'), code(f'EPSG:{ec}')])
        thr = []
        for (ez, cmz, fez, _), (ec, cmc, fec, _) in zip(thr_z, thr_c):
            assert cmz == cmc and fec == 500000
            zone = int(round(fez // 1000000))
            assert cmz == 3 * zone
            thr.append([zone, f'{cmz:g}°E', code(f'EPSG:{ez}'), code(f'EPSG:{ec}')])
        tabs[d] = (six, thr)
    return tabs


def geo_row(epsg, zh, note):
    crs = CRS.from_epsg(epsg)
    el = crs.ellipsoid
    return [code(f'EPSG:{epsg}'), zh, crs.name, el.name,
            f'{el.semi_major_metre:,.0f} m / 1:{el.inverse_flattening:.9g}', note]


def zone6(lon):
    return math.floor(lon / 6) + 1


def zone3(lon):
    return math.floor((lon + 1.5) / 3)


def build():
    tabs = gk_tables()
    geo = [
        geo_row(4490, 'CGCS2000 地理坐标', '我国现行法定大地坐标系，2008 年 7 月 1 日起启用；天地图、自然资源部门成果默认用它'),
        geo_row(4326, 'WGS 84 地理坐标', 'GPS 使用的坐标系；与 CGCS2000 在一般制图精度下可视为一致（差异在厘米级）'),
        geo_row(4610, '西安 80 地理坐标', '1980 西安坐标系，大量 2000–2010 年代的国土、规划数据仍在用'),
        geo_row(4214, '北京 54 地理坐标', '1954 北京坐标系，更早期的地形图和测绘成果'),
        geo_row(4555, '新北京 54 地理坐标', '把北京 54 换到 IAG-75 椭球上的过渡坐标系，部分老软件和数据里能见到'),
    ]
    _, cm3857, _ = params(3857)
    utm = [[code(f'EPSG:{32600 + z}'), f'UTM {z}N', f'{params(32600 + z)[1]:g}°E', CRS.from_epsg(32600 + z).name]
           for z in range(43, 54)]
    for z in range(43, 54):
        assert params(32600 + z)[1] == 6 * z - 183

    def gk_block(d):
        six, thr = tabs[d]
        return (f'**6° 分带**（11 个带）\n\n' + table(['带号', '中央经线', '带号版（加带号）', '无带号版（CM）'], six, raw_cols=(2, 3))
                + f'\n**3° 分带**（21 个带）\n\n' + table(['带号', '中央经线', '带号版（加带号）', '无带号版（CM）'], thr, raw_cols=(2, 3)))

    body = f"""
> 本页所有 EPSG 代码、名称与投影参数均直接读取自 PROJ {__proj_version__} 自带的 EPSG 数据库并逐条校验（中央经线、假东偏移、带号三者一致），不是手抄的。顶部搜索框可直接搜 `4549`、`120°E` 或 `CGCS2000`。

## 一、先分清两件事：地理坐标系 vs 投影坐标系

- **地理坐标系**（经纬度，单位是度）：描述「用哪个椭球、哪个基准」。例如 `EPSG:4490` 就是 CGCS2000 经纬度。
- **投影坐标系**（平面坐标，单位是米）：在地理坐标系基础上再做投影。我国大比例尺测绘、规划成果几乎都用**高斯-克吕格投影**，按 3° 或 6° 分带。

拿到一份数据，先看它的坐标是「三位数.小数」的经纬度，还是「六七位数」的米制坐标，就能大致判断是哪一类。

## 二、常用地理坐标系

{table(['EPSG', '中文名', 'EPSG 名称', '椭球', '长半轴 / 扁率', '说明'], geo, raw_cols=(0,))}

另外两个常见的 Web 坐标：
- `EPSG:3857`（WGS 84 / Pseudo-Mercator，Web 墨卡托）：谷歌、OSM、天地图瓦片等网络地图的通用投影，中央经线 {cm3857:g}°，**只适合显示，不适合量算面积和距离**。
- **GCJ-02（火星坐标）和 BD-09（百度坐标）没有 EPSG 代码**，它们是在 WGS 84 上加了非线性偏移的加密坐标，需要专门的算法转换。可以用本站的[坐标转换工具](/tools/coord-tool)在 WGS 84 / GCJ-02 / BD-09 之间互转。

## 三、CGCS2000 高斯-克吕格投影 EPSG 全表

现在新做的项目基本都用这一组。每个带都有**两个 EPSG 代码**，区别只在于横坐标前面有没有加带号（见第六节）。

{gk_block('CGCS2000')}

## 四、西安 80 高斯-克吕格投影 EPSG 全表

{gk_block('Xian 1980')}

## 五、北京 54 高斯-克吕格投影 EPSG 全表

{gk_block('Beijing 1954')}

## 六、「带号版」和「无带号版」怎么选

两个代码的投影参数完全相同，只有**假东偏移（False Easting）**不一样：

- **带号版**（名称形如 `CGCS2000 / 3-degree Gauss-Kruger zone 40`）：假东 = 带号 × 1,000,000 + 500,000 米。横坐标 Y 是 8 位数，前两位就是带号，例如 `40 512345.67`。
- **无带号版**（名称形如 `CGCS2000 / 3-degree Gauss-Kruger CM 120E`）：假东 = 500,000 米。横坐标是 6 位数，例如 `512345.67`。

判断方法：**看横坐标（东向）整数部分是 6 位还是 8 位**。8 位选带号版，6 位选无带号版。选错的典型症状是数据「跑」到几千公里外，或者跟底图对不上。

另外注意我国测量习惯里 **X 是北向、Y 是东向**，和数学坐标系相反。导入 CAD 或 Excel 坐标时，如果点位全部「躺倒」了，多半是 X、Y 列反了。

## 七、各省常用哪个带？

不知道自己所在地区用哪个中央经线，可以查[高斯-克吕格分带带号与中央经线对照表](/learn/gauss-kruger-zone-table)，里面按省列出了覆盖的 3° 带、6° 带和省会所在带。几个常用例子：

{table(['地区', '省会经度（约）', '3° 带中央经线', '常用 EPSG（CGCS2000 无带号版）'], [
        ['北京', '116.4°E', '117°E', code('EPSG:4548')],
        ['上海', '121.5°E', '120°E', code('EPSG:4549')],
        ['广州 / 深圳', '113.3°E / 114.1°E', '114°E', code('EPSG:4547')],
        ['成都', '104.1°E', '105°E', code('EPSG:4544')],
        ['武汉', '114.3°E', '114°E', code('EPSG:4547')],
        ['西安', '108.9°E', '108°E', code('EPSG:4545')],
    ], raw_cols=(3,))}

## 八、UTM 投影（WGS 84，覆盖中国的部分）

国际项目、遥感影像（如 Landsat、Sentinel-2 的 L1C / L2A 产品）常用 UTM 投影，它和高斯-克吕格同属横轴墨卡托投影，但比例因子是 0.9996，带号和中央经线的编排也不同（UTM 带号 = 高斯 6° 带号 + 30）。

{table(['EPSG', 'UTM 带', '中央经线', 'EPSG 名称'], utm, raw_cols=(0,))}

{faq([
    ('CGCS2000 和 WGS 84 可以直接当成一样吗？',
     '在 1:1 万及更小比例尺的一般制图、可视化里可以，两者差异在厘米级。但做高精度测量、工程放样时要区分，并注意坐标历元。'),
    ('西安 80 的数据怎么转到 CGCS2000？',
     '两者椭球和基准都不同，不能只改 EPSG 代码，需要做坐标转换。小范围可用七参数或四参数转换，参数应使用当地测绘主管部门公布或用控制点求得的值；在 GIS 软件里直接选两个 EPSG 互转，精度通常只有米级。'),
    ('我拿到的数据没有 .prj 文件，怎么判断是哪个坐标系？',
     '先看坐标量级：经纬度一般是 73–135、3–54 之间的小数；平面坐标横坐标 6 位或 8 位、纵坐标 7 位。8 位横坐标的前两位就是带号，带号 25–45 是 3° 带，13–23 是 6° 带。再结合数据年代判断基准：2018 年以后的自然资源成果一般是 CGCS2000，更早的规划、国土数据很多是西安 80。'),
    ('EPSG:4547 和 EPSG:4526 有什么区别？',
     '都是 CGCS2000 3° 带、中央经线 114°E。4547 是无带号版（假东 500 km），4526 是带号版（第 38 带，假东 38,500 km）。'),
    ('网上下载的高德、百度坐标为什么叠不准？',
     '高德、腾讯用 GCJ-02，百度用 BD-09，都在 WGS 84 基础上做了加密偏移，偏差可达几百米，必须先转换。可以用[坐标转换工具](/tools/coord-tool)批量处理。'),
])}

## 九、数据来源

- EPSG 代码与参数：EPSG Geodetic Parameter Dataset，经 PROJ {__proj_version__} 数据库读取并校验。
- 相关工具：[坐标转换工具](/tools/coord-tool)（WGS 84 / GCJ-02 / BD-09 互转）、[GeoJSON 与 SHP 互转](/tools/geojson-shp)。
"""
    write_page('china-epsg-codes', {
        'slug': 'china-epsg-codes',
        'title': '中国常用坐标系 EPSG 代码速查：CGCS2000、西安 80、北京 54 高斯投影全表',
        'summary': '一页查全国内常用坐标系的 EPSG 代码：CGCS2000（EPSG:4490）、WGS 84、西安 80、北京 54 的经纬度坐标系，以及三者 3° 带、6° 带高斯-克吕格投影的带号版与无带号版全部代码。代码与参数从 EPSG 数据库读取并校验，附带号判断方法、UTM 对照与常见踩坑。',
        'date': UPDATED,
        'category': '地理基础',
        'subject': '地理信息技术',
        'tags': 'EPSG, CGCS2000, 坐标系, 高斯-克吕格投影, 西安80, 北京54, 投影坐标系, GIS',
        'tableSearch': 'true',
        'tableSearchPlaceholder': '输入 EPSG 代码或坐标系名，如 4549 / CGCS2000',
    }, body)

    # ---------- 分带对照 ----------
    gj = json.load(open(fetch(DATAV, 'cn_full.json'), encoding='utf-8'))
    prov_rows, cap_rows = [], []
    for f in gj['features']:
        p = f['properties']
        if not f['geometry'] or not str(p.get('adcode', '')).isdigit():
            continue
        geom = shape(f['geometry'])
        main = max(getattr(geom, 'geoms', [geom]), key=lambda g: g.area)
        lo, hi = geom.bounds[0], geom.bounds[2]
        mlo, mhi = main.bounds[0], main.bounds[2]
        name = p['name']
        note = ''
        if name in ('海南省', '台湾省'):
            isl = '海南岛' if name == '海南省' else '台湾本岛'
            extra = '南海诸岛' if name == '海南省' else '澎湖列岛、钓鱼岛及其附属岛屿等'
            note = f'（含{extra}；{isl} {mlo:.1f}°–{mhi:.1f}°E）'
        z6 = list(range(zone6(lo), zone6(hi) + 1))
        z3 = list(range(zone3(lo), zone3(hi) + 1))
        prov_rows.append([name, f'{lo:.1f}°–{hi:.1f}°E{note}',
                          '、'.join(f'{z}（{6 * z - 3}°）' for z in z6),
                          '、'.join(f'{z}（{3 * z}°）' for z in z3)])
        clon, clat = p['center']
        c3 = zone3(clon)
        cgcs = 4534 + (c3 - 25)
        assert params(cgcs)[1] == 3 * c3
        cap_rows.append([name, f'{clon:.2f}°E', f'{zone6(clon)} 带 / {6 * zone6(clon) - 3}°E',
                         f'{c3} 带 / {3 * c3}°E', code(f'EPSG:{cgcs}'), code(f'EPSG:{4513 + c3 - 25}')])

    zone6_rows = [[z, f'{6 * z - 6}°–{6 * z}°E', f'{6 * z - 3}°E'] for z in range(13, 24)]
    zone3_rows = [[z, f'{3 * z - 1.5:g}°–{3 * z + 1.5:g}°E', f'{3 * z}°E'] for z in range(25, 46)]

    body2 = f"""
> 本页给出我国范围内（约 73°E–135°E）高斯-克吕格投影 **6° 带 13–23 带、3° 带 25–45 带**的经度范围与中央经线，并按省列出覆盖的带号和省会所在带。顶部搜索框可搜省份、带号或经度，如 `浙江`、`39`、`117°`。

## 一、为什么要分带

高斯-克吕格投影离中央经线越远，长度变形越大。为了把变形控制在允许范围内，就把地球按经度切成一条条窄带，**每条带用自己的中央经线单独投影**。

- **6° 分带**：从 0° 经线起每 6° 一带，全球 60 带。主要用于 1:2.5 万–1:50 万的中小比例尺地形图。
- **3° 分带**：从 1.5°E 起每 3° 一带，全球 120 带。变形更小，用于 1:1 万及更大比例尺测图、城市测量和规划成果，**国内项目最常用**。

## 二、带号和中央经线怎么算

<div class="admin-table-wrapper">
<table>
  <thead>
    <tr><th></th><th>6° 带</th><th>3° 带</th></tr>
  </thead>
  <tbody>
    <tr><td>由经度 L 求带号 n</td><td>n = ⌊L / 6⌋ + 1</td><td>n = ⌊(L + 1.5) / 3⌋，也就是 L / 3 四舍五入</td></tr>
    <tr><td>由带号 n 求中央经线 L₀</td><td>L₀ = 6n − 3</td><td>L₀ = 3n</td></tr>
    <tr><td>中国范围内的带号</td><td>13–23</td><td>25–45</td></tr>
  </tbody>
</table>
</div>

举例：杭州约 120.2°E，6° 带 n = ⌊120.2 / 6⌋ + 1 = 21，中央经线 123°E；3° 带 n = ⌊121.7 / 3⌋ = 40，中央经线 120°E。

小技巧：国内 6° 带号和 3° 带号不会重叠（13–23 和 25–45），拿到一个带号就能直接判断是哪种分带。

## 三、6° 带对照表（13–23 带）

{table(['带号', '经度范围', '中央经线'], zone6_rows)}

## 四、3° 带对照表（25–45 带）

{table(['带号', '经度范围', '中央经线'], zone3_rows)}

## 五、各省覆盖的带号

经度范围按省级行政区边界计算。一个省往往跨好几个带，具体项目用哪个带，以当地测绘或自然资源主管部门的规定为准（很多城市还有自己的地方独立坐标系）。

{table(['省级行政区', '经度范围', '覆盖的 6° 带（中央经线）', '覆盖的 3° 带（中央经线）'], prov_rows)}

## 六、省会所在带与 CGCS2000 EPSG

{table(['省级行政区', '省会经度', '6° 带', '3° 带', 'CGCS2000 3° 无带号版', 'CGCS2000 3° 带号版'], cap_rows, raw_cols=(4, 5))}

完整的 EPSG 代码（含西安 80、北京 54）见[中国常用坐标系 EPSG 代码速查](/learn/china-epsg-codes)。

{faq([
    ('3° 带和 6° 带的中央经线有什么关系？',
     '3° 带的中央经线是 3 的倍数，6° 带的中央经线是 6n − 3（如 75°、81°、87°……）。6° 带的中央经线一定也是某个 3° 带的中央经线，但 3° 带的中央经线只有一半是 6° 带的中央经线。'),
    ('一个市跨了两个 3° 带，用哪个？',
     '一般选覆盖面积最大、或主城区所在的那个带，整个项目统一用同一个中央经线，避免拼接时出现接缝。很多城市的测绘主管部门对此有明确规定，以当地规定为准。'),
    ('坐标横坐标前两位是 39，代表什么？',
     '代表 3° 带第 39 带，中央经线 117°E（39 × 3）。这是「带号版」坐标，对应 CGCS2000 的 EPSG:4527。'),
    ('为什么我算出来的带号和别人说的不一样？',
     '先确认是 3° 带还是 6° 带。另外有些地方采用 1.5° 带或任意中央经线的地方独立坐标系，这些不在标准分带里。'),
])}

## 七、数据来源

- 分带规则：我国测绘通用的高斯-克吕格 6° / 3° 分带方案；带号、中央经线与 EPSG 代码均经 PROJ {__proj_version__} 数据库校验。
- 各省经度范围：按省级行政区划边界（阿里云 DataV 公开 GeoJSON）计算，保留 1 位小数，仅供选带参考，不作为权威界线。
"""
    write_page('gauss-kruger-zone-table', {
        'slug': 'gauss-kruger-zone-table',
        'title': '高斯-克吕格 3° 带 / 6° 带带号与中央经线对照表（含各省所在带）',
        'summary': '我国高斯-克吕格投影 6° 带 13–23 带、3° 带 25–45 带的经度范围与中央经线全表，附由经度求带号、由带号求中央经线的公式与例题，并按 34 个省级行政区列出覆盖的带号、省会所在带及对应的 CGCS2000 EPSG 代码。',
        'date': UPDATED,
        'category': '地理基础',
        'subject': '地理信息技术',
        'tags': '高斯-克吕格投影, 3度带, 6度带, 中央经线, 带号, CGCS2000, 测绘, GIS',
        'tableSearch': 'true',
        'tableSearchPlaceholder': '输入带号、中央经线或省份，如 39 / 117°E / 北京',
    }, body2)
    print('ok', len(prov_rows))


if __name__ == '__main__':
    build()
