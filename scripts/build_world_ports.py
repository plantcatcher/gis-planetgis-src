# -*- coding: utf-8 -*-
"""世界港口（Natural Earth ne_10m_ports） → PlanetGIS 互动地图数据
数据源：Natural Earth「ne_10m_ports」（WGS84 / EPSG:4326，公开数据集）。
字段：scalerank（重要性 0–10，越小越重要；本提取物仅含 3–8）/ featurecla / name / website / natlscale。
坐标系无需偏移（全球尺度，不叠加 GCJ-02 底图，Esri 瓦片同为 WGS84/Web Mercator）。
输出：
  public/maps/world-ports/data/ports.json      1081 个港口点位
  public/maps/world-ports/data/countries.json  国家聚合（港数 / 枢纽数 / 各档计数 / 重心）
  public/maps/world-ports/data/stats.json      分档定义 / 总量 / 缺测与合规说明
合规：世界国界不绘制，国家维度用「港口数加权重心」气泡/高亮表达；台湾港口按中国一部分并入，
      不在排行榜/气泡里单列。
"""
import shapefile, json, os, math
from collections import Counter, defaultdict

SRC = "C:/Users/ZhuanZ/Downloads/世界港口"
OUT = "D:/WorkSpace/00PlanetGIS源码/public/maps/world-ports/data"
CACHE = "D:/WorkSpace/00PlanetGIS源码/scripts/_cache/world-atlas-110m.json"
ATLAS_URL = "https://unpkg.com/world-atlas@2/countries-110m.json"

# ── 重要性分级（scalerank 3 最顶级 → 8 最小）─────────────────────
# 与前端 config.TIERS 同口径；半径 baseR 用于 zoom 缩放前的基础像素半径。
TIERS = [
    {'rank': 3, 'label': '顶级枢纽港', 'color': '#ff3b6b', 'baseR': 9.0},
    {'rank': 4, 'label': '主要枢纽港', 'color': '#ff8c42', 'baseR': 7.0},
    {'rank': 5, 'label': '重要港口',   'color': '#ffd23f', 'baseR': 5.4},
    {'rank': 6, 'label': '区域性港口', 'color': '#4ade80', 'baseR': 4.4},
    {'rank': 7, 'label': '一般港口',   'color': '#38bdf8', 'baseR': 3.8},
    {'rank': 8, 'label': '小型港口',   'color': '#94a3b8', 'baseR': 3.2},
]
RANK2TIER = {t['rank']: t for t in TIERS}
# 国家归属用：重要性权重（用于国家重心与枢纽口径）。顶级枢纽权重最高。
RANK_WEIGHT = {3: 6, 4: 4, 5: 2.5, 6: 1.5, 7: 1, 8: 0.6}

# ── 国家 EN → ZH（覆盖 world-atlas 177 个名称）──────────────────
CN = {
 'Afghanistan':'阿富汗','Albania':'阿尔巴尼亚','Algeria':'阿尔及利亚','Angola':'安哥拉',
 'Antarctica':'南极洲','Argentina':'阿根廷','Armenia':'亚美尼亚','Australia':'澳大利亚',
 'Austria':'奥地利','Azerbaijan':'阿塞拜疆','Bahamas':'巴哈马','Bangladesh':'孟加拉国',
 'Belarus':'白俄罗斯','Belgium':'比利时','Belize':'伯利兹','Benin':'贝宁','Bhutan':'不丹',
 'Bolivia':'玻利维亚','Bosnia and Herz.':'波黑','Botswana':'博茨瓦纳','Brazil':'巴西',
 'Brunei':'文莱','Bulgaria':'保加利亚','Burkina Faso':'布基纳法索','Burundi':'布隆迪',
 'Cambodia':'柬埔寨','Cameroon':'喀麦隆','Canada':'加拿大','Central African Rep.':'中非',
 'Chad':'乍得','Chile':'智利','China':'中国','Colombia':'哥伦比亚','Congo':'刚果（布）',
 'Costa Rica':'哥斯达黎加','Croatia':'克罗地亚','Cuba':'古巴','Cyprus':'塞浦路斯',
 'Czechia':'捷克','Côte d\'Ivoire':'科特迪瓦','Dem. Rep. Congo':'刚果（金）','Denmark':'丹麦',
 'Djibouti':'吉布提','Dominican Rep.':'多米尼加','Ecuador':'厄瓜多尔','Egypt':'埃及',
 'El Salvador':'萨尔瓦多','Eq. Guinea':'赤道几内亚','Eritrea':'厄立特里亚','Estonia':'爱沙尼亚',
 'Ethiopia':'埃塞俄比亚','Falkland Is.':'福克兰群岛','Fiji':'斐济','Finland':'芬兰',
 'Fr. S. Antarctic Lands':'法属南方领地','France':'法国','Gabon':'加蓬','Gambia':'冈比亚',
 'Georgia':'格鲁吉亚','Germany':'德国','Ghana':'加纳','Greece':'希腊','Greenland':'格陵兰',
 'Guatemala':'危地马拉','Guinea':'几内亚','Guinea-Bissau':'几内亚比绍','Guyana':'圭亚那',
 'Haiti':'海地','Honduras':'洪都拉斯','Hungary':'匈牙利','Iceland':'冰岛','India':'印度',
 'Indonesia':'印度尼西亚','Iran':'伊朗','Iraq':'伊拉克','Ireland':'爱尔兰','Israel':'以色列',
 'Italy':'意大利','Jamaica':'牙买加','Japan':'日本','Jordan':'约旦','Kazakhstan':'哈萨克斯坦',
 'Kenya':'肯尼亚','Kosovo':'科索沃','Kuwait':'科威特','Kyrgyzstan':'吉尔吉斯斯坦',
 'Laos':'老挝','Latvia':'拉脱维亚','Lebanon':'黎巴嫩','Lesotho':'莱索托','Liberia':'利比里亚',
 'Libya':'利比亚','Lithuania':'立陶宛','Luxembourg':'卢森堡','Macedonia':'北马其顿',
 'Madagascar':'马达加斯加','Malawi':'马拉维','Malaysia':'马来西亚','Mali':'马里',
 'Mauritania':'毛里塔尼亚','Mexico':'墨西哥','Moldova':'摩尔多瓦','Mongolia':'蒙古',
 'Montenegro':'黑山','Morocco':'摩洛哥','Mozambique':'莫桑比克','Myanmar':'缅甸',
 'N. Cyprus':'北塞浦路斯','Namibia':'纳米比亚','Nepal':'尼泊尔','Netherlands':'荷兰',
 'New Caledonia':'新喀里多尼亚','New Zealand':'新西兰','Nicaragua':'尼加拉瓜','Niger':'尼日尔',
 'Nigeria':'尼日利亚','North Korea':'朝鲜','Norway':'挪威','Oman':'阿曼','Pakistan':'巴基斯坦',
 'Palestine':'巴勒斯坦','Panama':'巴拿马','Papua New Guinea':'巴布亚新几内亚','Paraguay':'巴拉圭',
 'Peru':'秘鲁','Philippines':'菲律宾','Poland':'波兰','Portugal':'葡萄牙','Puerto Rico':'波多黎各',
 'Qatar':'卡塔尔','Romania':'罗马尼亚','Russia':'俄罗斯','Rwanda':'卢旺达','S. Sudan':'南苏丹',
 'Saudi Arabia':'沙特阿拉伯','Senegal':'塞内加尔','Serbia':'塞尔维亚','Sierra Leone':'塞拉利昂',
 'Slovakia':'斯洛伐克','Slovenia':'斯洛文尼亚','Solomon Is.':'所罗门群岛','Somalia':'索马里',
 'Somaliland':'索马里兰','South Africa':'南非','South Korea':'韩国','Spain':'西班牙',
 'Sri Lanka':'斯里兰卡','Sudan':'苏丹','Suriname':'苏里南','Sweden':'瑞典','Switzerland':'瑞士',
 'Syria':'叙利亚','Taiwan':'中国台湾','Tajikistan':'塔吉克斯坦','Tanzania':'坦桑尼亚',
 'Thailand':'泰国','Timor-Leste':'东帝汶','Togo':'多哥','Trinidad and Tobago':'特立尼达和多巴哥',
 'Tunisia':'突尼斯','Turkey':'土耳其','Turkmenistan':'土库曼斯坦','Uganda':'乌干达',
 'Ukraine':'乌克兰','United Arab Emirates':'阿联酋','United Kingdom':'英国',
 'United States of America':'美国','Uruguay':'乌拉圭','Uzbekistan':'乌兹别克斯坦',
 'Vanuatu':'瓦努阿图','Venezuela':'委内瑞拉','Vietnam':'越南','W. Sahara':'西撒哈拉',
 'Yemen':'也门','Zambia':'赞比亚','Zimbabwe':'津巴布韦','eSwatini':'斯威士兰',
}

# ── TopoJSON → GeoJSON（仅用于国家归属，运行期不依赖）────────────
def load_atlas():
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    if os.path.exists(CACHE):
        with open(CACHE, 'r', encoding='utf-8') as f:
            return json.load(f)
    import urllib.request
    for k in ('HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy'):
        os.environ.pop(k, None)
    req = urllib.request.Request(ATLAS_URL, headers={'User-Agent': 'Mozilla/5.0'})
    topo = json.loads(urllib.request.urlopen(req, timeout=30).read())
    with open(CACHE, 'w', encoding='utf-8') as f:
        json.dump(topo, f)
    return topo

def decode_arcs(topo):
    sc = topo['transform']['scale']; tr = topo['transform']['translate']
    out = []
    for arc in topo['arcs']:
        pts = []; x = 0; y = 0
        for dx, dy in arc:
            x += dx; y += dy
            pts.append((x * sc[0] + tr[0], y * sc[1] + tr[1]))
        out.append(pts)
    return out

def ring_coords(arc_ids, arcs):
    pts = []
    for i, aid in enumerate(arc_ids):
        if aid >= 0:
            seg = arcs[aid]
        else:
            seg = arcs[~aid][::-1]
        if i > 0 and pts and seg:
            pts.pop()  # 去掉与上一段重复的拼接点
        pts.extend(seg)
    return pts

def geom_to_polygons(g, arcs):
    t = g['type']; c = g['arcs']
    polys = []
    if t == 'Polygon':
        polys.append([ring_coords(r, arcs) for r in c])
    elif t == 'MultiPolygon':
        for poly in c:
            polys.append([ring_coords(r, arcs) for r in poly])
    return polys

def build_countries(topo):
    arcs = decode_arcs(topo)
    feats = []
    for g in topo['objects']['countries']['geometries']:
        name = (g.get('properties') or {}).get('name')
        if g['type'] == 'GeometryCollection':
            polys = []
            for sub in g['geometries']:
                polys.extend(geom_to_polygons(sub, arcs))
        else:
            polys = geom_to_polygons(g, arcs)
        if not polys:
            continue
        # bbox + 简单重心
        xs = []; ys = []
        for poly in polys:
            for ring in poly:
                for x, y in ring:
                    xs.append(x); ys.append(y)
        feats.append({
            'name': name,
            'polys': polys,
            'bbox': [min(xs), min(ys), max(xs), max(ys)],
            'cx': sum(xs) / len(xs), 'cy': sum(ys) / len(ys),
            # 全部顶点（用于离岸港口的「最近邻国家」兜底归属）
            'verts': [(x, y) for poly in polys for ring in poly for (x, y) in ring],
        })
    return feats

def point_in_ring(px, py, ring):
    inside = False
    n = len(ring)
    j = n - 1
    for i in range(n):
        xi, yi = ring[i]; xj, yj = ring[j]
        if ((yi > py) != (yj > py)) and (px < (xj - xi) * (py - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside

def pip(px, py, country):
    for poly in country['polys']:
        outer = poly[0]
        if not point_in_ring(px, py, outer):
            continue
        hit_hole = False
        for hole in poly[1:]:
            if point_in_ring(px, py, hole):
                hit_hole = True; break
        if not hit_hole:
            return True
    return False

def attribute_country(px, py, countries):
    best = None
    for c in countries:
        b = c['bbox']
        if px < b[0] or px > b[2] or py < b[1] or py > b[3]:
            continue
        if pip(px, py, c):
            best = c['name']; break
    if best:
        return best
    # 离岸/海岸外溢：取 3°（≈330km）内最近国家顶点兜底。
    # 用最近顶点而非重心——港口建在水边，离海岸顶点近、离国家几何中心远，
    # 重心兜底会把大量沿海港口误判成「离任何国家都太远」。
    best = None; bd = 2e20
    for c in countries:
        b = c['bbox']
        # 先放宽一圈做粗筛，避免对远国逐个算顶点距离
        if px < b[0] - 3 or px > b[2] + 3 or py < b[1] - 3 or py > b[3] + 3:
            continue
        for vx, vy in c['verts']:
            d = (px - vx) ** 2 + (py - vy) ** 2
            if d < bd:
                bd = d; best = c['name']
    # 3° 阈值外（真正的中洋石油平台等）保留为「—」
    if bd <= 9.0:
        return best
    return None

# ── 读取 SHP ─────────────────────────────────────────────────────
def read_ports():
    sf = shapefile.Reader(os.path.join(SRC, "世界港口.shp"), encoding="utf-8")
    fields = [f[0] for f in sf.fields[1:]]
    out = []
    for i, rec in enumerate(sf.iterRecords()):
        d = dict(zip(fields, rec))
        shp = sf.shape(i)
        if not shp or not shp.points:
            continue
        lon, lat = round(shp.points[0][0], 5), round(shp.points[0][1], 5)
        sr = d.get('scalerank')
        try:
            sr = int(sr)
        except (TypeError, ValueError):
            continue
        out.append({
            'i': i,
            'n': (d.get('name') or '').strip(),
            'w': (d.get('website') or '').strip(),
            'r': sr,
            'ns': None if d.get('natlscale') in (None, '') else float(d.get('natlscale')),
            'lon': lon, 'lat': lat,
        })
    return out

# ── 主流程 ───────────────────────────────────────────────────────
ports_raw = read_ports()
countries_geo = build_countries(load_atlas())

feats = []
for p in ports_raw:
    tier = RANK2TIER.get(p['r'])
    if not tier:
        continue
    en = attribute_country(p['lon'], p['lat'], countries_geo)
    if en == 'Taiwan':
        en = 'China'  # 合规：台湾按中国一部分并入
    cn = CN.get(en, en) if en else '—'
    feats.append({
        'type': 'Feature',
        'geometry': {'type': 'Point', 'coordinates': [p['lon'], p['lat']]},
        'properties': {
            'id': p['i'],
            'n': p['n'],
            'w': p['w'],
            'r': p['r'],                  # scalerank（重要性，越小越重要）
            't': tier['rank'] - 3,        # 档位 0–5
            'color': tier['color'],
            'baseR': tier['baseR'],
            'ns': p['ns'],                # natlscale（显示比例尺分母，百万）
            'c': en or '—',
            'cn': cn,
        },
    })

# ── 国家聚合（仅在港国家）──────────────────────────────────────
acc = defaultdict(lambda: {'n': 0, 'hubs': 0, 'tc': [0] * 6, 'x': 0, 'y': 0, 'wsum': 0})
for f in feats:
    p = f['properties']
    if p['c'] == '—':
        continue
    a = acc[p['c']]
    a['n'] += 1
    a['tc'][p['t']] += 1
    wgt = RANK_WEIGHT.get(p['r'], 1)
    a['x'] += f['geometry']['coordinates'][0] * wgt
    a['y'] += f['geometry']['coordinates'][1] * wgt
    a['wsum'] += wgt
    if p['r'] <= 4:
        a['hubs'] += 1

countries = []
for k, a in acc.items():
    cx = a['x'] / a['wsum'] if a['wsum'] else None
    cy = a['y'] / a['wsum'] if a['wsum'] else None
    countries.append({
        'c': k, 'cn': CN.get(k, k), 'n': a['n'], 'hubs': a['hubs'],
        'tc': a['tc'], 'cxy': [round(cx, 4), round(cy, 4)] if cx is not None else None,
    })
countries.sort(key=lambda x: -x['n'])

# ── stats ────────────────────────────────────────────────────────
tier_counts = [0] * 6
website = 0
for f in feats:
    tier_counts[f['properties']['t']] += 1
    if f['properties']['w']:
        website += 1
no_country = sum(1 for f in feats if f['properties']['c'] == '—')

stats = {
    'nPort': len(feats),
    'nCountry': len(countries),
    'website': website,
    'noCountry': no_country,
    'tierCounts': tier_counts,
    'tiers': [{'rank': t['rank'], 'label': t['label'], 'color': t['color']} for t in TIERS],
    'topByCount': [{'c': c['c'], 'cn': c['cn'], 'n': c['n'], 'hubs': c['hubs']} for c in countries[:15]],
    'source': 'Natural Earth ne_10m_ports（WGS84 / EPSG:4326，公开数据集）',
    'compliance': '世界国界不绘制，国家维度用港口数加权重心表达；台湾港口按中国一部分并入，不在排行榜/气泡单列。',
}

# ── 写出 ────────────────────────────────────────────────────────
os.makedirs(OUT, exist_ok=True)
def dump(fn, obj):
    with open(os.path.join(OUT, fn), 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))

dump('ports.json', {'type': 'FeatureCollection', 'features': feats})
dump('countries.json', {'countries': countries})
dump('stats.json', stats)

# ── 诊断 ────────────────────────────────────────────────────────
print('ports:', len(feats), ' countries:', len(countries), ' website:', website, ' noCountry:', no_country)
print('tierCounts:', tier_counts)
print('top5 by count:', [(c['cn'], c['n'], c['hubs']) for c in countries[:5]])
print('top5 by hubs:', sorted([(c['cn'], c['hubs']) for c in countries], key=lambda x: -x[1])[:5])
