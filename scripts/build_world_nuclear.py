# -*- coding: utf-8 -*-
"""全球核电站及核设施分布数据库 → PlanetGIS 互动地图数据
数据源：Global Energy Monitor, Global Nuclear Power Tracker (GNPT), Sept 2025 (CC BY 4.0)
坐标系：WGS84 (EPSG:4326)，无需偏移（全球尺度，不叠加 GCJ-02 底图）。
输出：
  public/maps/world-nuclear/data/units.json   1387 台核电机组点位
  public/maps/world-nuclear/data/sites.json   485 个核电设施地点
  public/maps/world-nuclear/data/countries.json 59 国聚合
  public/maps/world-nuclear/data/stats.json   分档阈值 / 标签 / 总量
"""
import shapefile, json, os, math
from collections import Counter, defaultdict

SRC = "C:/Users/ZhuanZ/Downloads/全球核电站及核设施分布数据库"
OUT = "D:/WorkSpace/00PlanetGIS源码/public/maps/world-nuclear/data"

# ── 国家 EN → ZH ──────────────────────────────────────────────
CN = {
 'United States':'美国','Russia':'俄罗斯','United Kingdom':'英国','France':'法国','Japan':'日本',
 'India':'印度','Poland':'波兰','Canada':'加拿大','Germany':'德国','Ukraine':'乌克兰',
 'South Korea':'韩国','Spain':'西班牙','Uganda':'乌干达','Czech Republic':'捷克','Ghana':'加纳',
 'Sweden':'瑞典','Bulgaria':'保加利亚','Türkiye':'土耳其','Indonesia':'印度尼西亚','Iran':'伊朗',
 'Romania':'罗马尼亚','Switzerland':'瑞士','Slovakia':'斯洛伐克','Argentina':'阿根廷','Kazakhstan':'哈萨克斯坦',
 'Belgium':'比利时','Finland':'芬兰','Pakistan':'巴基斯坦','Uzbekistan':'乌兹别克斯坦','Vietnam':'越南',
 'Hungary':'匈牙利','Italy':'意大利','North Korea':'朝鲜','Kenya':'肯尼亚','Belarus':'白俄罗斯',
 'Egypt':'埃及','Lithuania':'立陶宛','Mexico':'墨西哥','Netherlands':'荷兰','Nigeria':'尼日利亚',
 'Norway':'挪威','Philippines':'菲律宾','South Africa':'南非','United Arab Emirates':'阿联酋','Armenia':'亚美尼亚',
 'Brazil':'巴西','Azerbaijan':'阿塞拜疆','Bangladesh':'孟加拉国','Cuba':'古巴','Estonia':'爱沙尼亚',
 'Israel':'以色列','Jordan':'约旦','Kyrgyzstan':'吉尔吉斯斯坦','Puerto Rico':'波多黎各','Slovenia':'斯洛文尼亚',
 'Sri Lanka':'斯里兰卡','Thailand':'泰国','Austria':'奥地利','Panama':'巴拿马',
}

# ── 状态：原始 → 分组码 / 中文 ───────────────────────────────
STATUS = {
 'operating':                 ('OP',  '运行中'),
 'construction':              ('CON', '在建'),
 'announced':                 ('PLN', '已公布'),
 'pre-construction':          ('PLN', '拟建前期'),
 'shelved':                   ('SUS', '搁置'),
 'shelved - inferred 2 y':    ('SUS', '搁置（推断2年）'),
 'mothballed':                ('SUS', '封存'),
 'retired':                   ('RET', '退役'),
 'cancelled':                 ('CAN', '取消'),
 'cancelled - inferred 4 y':  ('CAN', '取消（推断4年）'),
}
GROUP_LABEL = {'OP':'运行中','CON':'在建','PLN':'规划中','SUS':'搁置/封存','RET':'退役','CAN':'取消'}
GROUP_COLOR = {'OP':'#22c55e','CON':'#38bdf8','PLN':'#fbbf24','SUS':'#fb923c','RET':'#94a3b8','CAN':'#ef4444'}

# ── 反应堆类型：原始 → 标签 ──────────────────────────────────
RT = {
 'pressurized water reactor':'压水堆 (PWR)','boiling water reactor':'沸水堆 (BWR)',
 'small modular reactor':'小型模块化堆 (SMR)','unknown':'未标注','pressurized heavy water reactor':'重水堆 (PHWR)',
 'gas-cooled reactor':'气冷堆 (GCR)','light water graphite reactor':'石墨水冷堆 (LWGR)',
 'high temperature gas reactor':'高温气冷堆 (HTGR)','fast breeder reactor':'快中子增殖堆 (FBR)',
 'microreactor':'微堆','liquid-metal-cooled fast reactor':'液态金属快堆 (LMFBR)','molten salt reactor':'熔盐堆 (MSR)',
}
def rt_label(s): return RT.get(s, s or '未标注')

# ── 半径插值（与前端 config 同口径） ─────────────────────────
def interp(v, stops):
    if v is None: v = stops[0][0]
    if v <= stops[0][0]: return stops[0][1]
    for i in range(1, len(stops)):
        if v <= stops[i][0]:
            a, b = stops[i-1], stops[i]
            return a[1] + (b[1]-a[1])*(v-a[0])/(b[0]-a[0])
    return stops[-1][1]

CAP_RADIUS = [[0,2],[50,2.8],[200,3.8],[500,5],[1000,6.5],[1500,8],[1830,9]]
SITE_RADIUS = [[1,3.5],[500,5.5],[2000,8],[5000,11],[10000,14],[10944,15]]
# 国家气泡按 log10(总装机) 分级（与前端 BUBBLE_R 同断点）
CNT_STOPS   = [[1.2,4],[2,7],[3,12],[4,19],[5,28],[6,40]]
CNT_STOPS_F = [[1.2,2.6],[2,4.6],[3,8],[4,12.5],[5,18],[6,24]]
CNT_TIERS = [
 {'min':100000,'color':'#ff4d6d','label':'10 万 MW 以上'},
 {'min':50000, 'color':'#ff8c42','label':'5 万 – 10 万 MW'},
 {'min':20000, 'color':'#ffd23f','label':'2 万 – 5 万 MW'},
 {'min':5000,  'color':'#3ddc97','label':'5000 – 2 万 MW'},
 {'min':1000,  'color':'#38bdf8','label':'1000 – 5000 MW'},
 {'min':0,     'color':'#94a3b8','label':'1000 MW 以下'},
]
def cntColor(w):
    w = w or 0
    for t in CNT_TIERS:
        if w >= t['min']: return t['color']
    return CNT_TIERS[-1]['color']

def fnum(v):
    if v in (None,'',): return None
    try: return float(v)
    except: return None

def read_shp(name):
    sf = shapefile.Reader(os.path.join(SRC, name+".shp"), encoding="utf-8")
    fields = [f[0] for f in sf.fields[1:]]
    out = []
    for i, rec in enumerate(sf.iterRecords()):
        d = dict(zip(fields, rec))
        shp = sf.shape(i)
        if not shp or not shp.points: continue
        x, y = shp.points[0][0], shp.points[0][1]
        if x is None or y is None: continue
        d['_lon'], d['_lat'] = x, y
        out.append(d)
    return out

units_raw = read_shp("全球核电机组_GNPT_2025-09")
sites_raw = read_shp("全球核电设施地点_GNPT_2025-09")

# ── 机组点位 ──────────────────────────────────────────────────
def build_units():
    feats = []
    for r in units_raw:
        w = fnum(r.get('Capacity ('))
        st_raw = (r.get('Status') or '').strip()
        g, stzh = STATUS.get(st_raw, ('UNK','未知'))
        rt = rt_label(r.get('Reactor Ty'))
        lon, lat = r['_lon'], r['_lat']
        year = fnum(r.get('Start Year'))
        feats.append({
            'type':'Feature',
            'geometry':{'type':'Point','coordinates':[round(lon,5), round(lat,5)]},
            'properties':{
                'id': r.get('GEM unit I') or '',
                'n': r.get('Display Na') or r.get('Project Na') or '',
                'pr': r.get('Project Na') or '',
                'un': r.get('Unit Name') or '',
                'c': r.get('Country/Ar') or '',
                'cn': CN.get(r.get('Country/Ar'), r.get('Country/Ar') or ''),
                'w': None if w is None else round(w,1),
                'g': g, 'st': st_raw, 'stzh': stzh,
                'rt': rt,
                'y': None if year is None else int(year),
                'owner': (r.get('Owner') or '').strip(),
                'operator': (r.get('Operator') or '').strip(),
                'loc': r.get('Location A') or '',
                'wiki': r.get('Wiki URL') or '',
                'r': interp(w, CAP_RADIUS) if w is not None else CAP_RADIUS[0][1],
                'color': GROUP_COLOR.get(g, '#94a3b8'),
            }
        })
    return feats

def build_sites():
    feats = []
    for r in sites_raw:
        w = fnum(r.get('Total Capa'))
        uc = fnum(r.get('Unit Count'))
        stset = (r.get('Unit Statu') or '').split(';')
        stset = [s.strip() for s in stset if s.strip()]
        # 主导状态：按分组计数取最多者
        gc = Counter()
        for s in stset:
            g, _ = STATUS.get(s, ('UNK','未知')); gc[g]+=1
        if gc:
            domg = gc.most_common(1)[0][0]
        else:
            domg = 'UNK'
        rtset = (r.get('Reactor Ty') or '').split(';')
        rtset = [rt_label(s.strip()) for s in rtset if s.strip()]
        feats.append({
            'type':'Feature',
            'geometry':{'type':'Point','coordinates':[round(r['_lon'],5), round(r['_lat'],5)]},
            'properties':{
                'id': r.get('GEM locati') or '',
                'n': r.get('Project Na') or '',
                'c': r.get('Country/Ar') or '',
                'cn': CN.get(r.get('Country/Ar'), r.get('Country/Ar') or ''),
                'w': None if w is None else round(w,1),
                'uc': None if uc is None else int(uc),
                'g': domg,
                'stset': stset, 'rtset': rtset,
                'owner': (r.get('Owner') or '').strip(),
                'operator': (r.get('Operator') or '').strip(),
                'wiki': r.get('Wiki URL') or '',
                'r': interp(w, SITE_RADIUS) if w is not None else SITE_RADIUS[0][1],
                'color': GROUP_COLOR.get(domg, '#94a3b8'),
            }
        })
    return feats

units = build_units()
sites = build_sites()

# ── 国家聚合 ──────────────────────────────────────────────────
def aggregate_countries():
    acc = defaultdict(lambda: {'n':0,'w':0,'wn':0,'x':0,'y':0,'wsum':0,
                               'g':Counter(),'rt':Counter(),'ys':[]})
    for f in units:
        p = f['properties']; k = p['c']; a = acc[k]
        a['n'] += 1
        w = p['w']
        if w and w > 0:
            a['wn'] += 1; a['w'] += w; a['wsum'] += w
            a['x'] += f['geometry']['coordinates'][0]*w
            a['y'] += f['geometry']['coordinates'][1]*w
        a['g'][p['g']] += 1
        a['rt'][rt_label(p['rt'])] += 1
        if p['y'] is not None: a['ys'].append(p['y'])
    countries = []
    for k, a in acc.items():
        cx = a['x']/a['wsum'] if a['wsum'] else None
        cy = a['y']/a['wsum'] if a['wsum'] else None
        if cx is None:  # 全无装机记录 → 用简单坐标均值
            xs=[f['geometry']['coordinates'][0] for f in units if f['properties']['c']==k]
            ys=[f['geometry']['coordinates'][1] for f in units if f['properties']['c']==k]
            cx = sum(xs)/len(xs); cy = sum(ys)/len(ys)
        countries.append({
            'c': k, 'cn': CN.get(k, k), 'n': a['n'], 'wn': a['wn'],
            'w': round(a['w'],1),
            'cxy': [round(cx,4), round(cy,4)],
            'g': dict(a['g']),
            'rt': dict(a['rt'].most_common()),
            'y0': min(a['ys']) if a['ys'] else None,
            'y1': max(a['ys']) if a['ys'] else None,
        })
    return countries

countries = aggregate_countries()

# ── stats ─────────────────────────────────────────────────────
g_count = Counter(p['g'] for p in (f['properties'] for f in units))
cap_all = sum(p['w'] for p in (f['properties'] for f in units) if p['w'])
cap_op  = sum(p['w'] for p in (f['properties'] for f in units) if p['w'] and p['g']=='OP')
years = [p['y'] for p in (f['properties'] for f in units) if p['y'] is not None]
stats = {
    'nUnit': len(units),
    'nSite': len(sites),
    'nCountry': len(countries),
    'capAll': round(cap_all,1),
    'capOp': round(cap_op,1),
    'nOp': g_count.get('OP',0),
    'yearMin': min(years) if years else None,
    'yearMax': max(years) if years else None,
    'statusCounts': {GROUP_LABEL[k]: v for k,v in g_count.items()},
    'statusGroups': [{'code':k,'label':GROUP_LABEL[k],'color':GROUP_COLOR[k]}
                     for k in ['OP','CON','PLN','SUS','RET','CAN']],
    'capTiers': [
        {'min':1500,'label':'1500 MW 以上'},{'min':1000,'label':'1000 – 1499 MW'},
        {'min':500,'label':'500 – 999 MW'},{'min':200,'label':'200 – 499 MW'},
        {'min':50,'label':'50 – 199 MW'},{'min':1,'label':'1 – 49 MW'},
        {'min':0,'label':'容量未标注'}],
    'cntTiers': CNT_TIERS,
    'era': {'min':1950,'max':2040},
}

# ── 写出 ──────────────────────────────────────────────────────
os.makedirs(OUT, exist_ok=True)
def dump(fn, obj):
    with open(os.path.join(OUT, fn), 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, separators=(',',':'))

dump('units.json', {'type':'FeatureCollection','features':units})
dump('sites.json', {'type':'FeatureCollection','features':sites})
dump('countries.json', {'countries':countries})
dump('stats.json', stats)

# ── 诊断 ──────────────────────────────────────────────────────
print("units:", len(units), " sites:", len(sites), " countries:", len(countries))
print("capAll(GW):", round(cap_all/1000,1), " capOp(GW):", round(cap_op/1000,1))
print("max country total(MW):", max(c['w'] for c in countries),
      "log10:", round(math.log10(max(c['w'] for c in countries)),2))
print("max site total(MW):", max(p['w'] for p in (f['properties'] for f in sites) if p['w']))
print("status groups:", dict(g_count))
print("year range:", stats['yearMin'], stats['yearMax'])
