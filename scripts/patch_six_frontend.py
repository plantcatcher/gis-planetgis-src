# -*- coding: utf-8 -*-
"""更新 6 国互动地图的前端：config.js 增加「人口」指标、修正类型配色与文案；
index.html 补「总人口」事实栏、「人口」着色指标与说明文案。
用法：python scripts/patch_six_frontend.py
"""
import json, os, re, sys
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

C = {
 'bra-regions': dict(
  title='巴西行政区划地图 · 27 个州 / 联邦区的人口、面积与类型',
  desc='点一下巴西地图，看 27 个州 / 联邦区的中文名、首府、人口、面积与行政区类型。可在「人口 / 面积 / 类型」之间切换着色，还能展开 5572 个市镇。边界数据来自 GADM 4.1。',
  kw='巴西地图,巴西行政区划,州,联邦区,首府,人口,面积,类型,GADM,互动地图',
  lead='南美洲面积最大的国家，26 个州 + 1 个联邦区，亚马孙雨林覆盖北半部。点一下地图，看每个州的<b>中文名、首府、人口、面积与类型</b>。',
  notePop='按<b>人口</b>着色：圣保罗、米纳斯吉拉斯、里约热内卢三州合计接近全国四成，北部的亚马孙、罗赖马等州则地广人稀。',
  source='州 / 联邦区、市镇边界来自 <b>GADM 4.1</b>（gadm41_BRA_shp，WGS84 / EPSG:4326，公开数据）；中文名与首府按通行译法整理，人口为 <b>2022 年巴西人口普查</b>（约值），面积由几何球面实算。',
  panel='色块按<b>人口 / 面积</b>分级（越深越大）；选「类型」则按行政区类型分类着色。选中后色块变透明、用色环勾边。勾选「市镇」可看一级以下的行政边界。',
  mainLabel='州 / 联邦区', capitalLabel='首府',
  groupNote='按<b>行政区类型</b>着色：26 个州与 1 个联邦区一目了然。',
  groups=[('州', '#e6194b'), ('联邦区', '#3cb44b')],
 ),
 'can-regions': dict(
  title='加拿大行政区划地图 · 13 个省份 / 地区的人口、面积与类型',
  desc='点一下加拿大地图，看 10 省 + 3 地区的中文名、首府、人口、面积与行政区类型。可在「人口 / 面积 / 类型」之间切换着色，还能展开 293 个普查分区。边界数据来自 GADM 4.1。',
  kw='加拿大地图,加拿大行政区划,省,地区,首府,人口,面积,类型,GADM,互动地图',
  lead='世界面积第二大国，10 个省 + 3 个地区，北方三地区占去国土近七成。点一下地图，看每个省 / 地区的<b>中文名、首府、人口、面积与类型</b>。',
  notePop='按<b>人口</b>着色：安大略、魁北克、不列颠哥伦比亚三省集中全国近四分之三人口，北方的努纳武特、西北地区则地广人稀。',
  source='省 / 地区、普查分区边界来自 <b>GADM 4.1</b>（gadm41_CAN_shp，WGS84 / EPSG:4326，公开数据）；中文名与首府按通行译法整理，人口为 <b>2022 年加拿大官方估计</b>（约值），面积由几何球面实算。',
  panel='色块按<b>人口 / 面积</b>分级（越深越大）；选「类型」则按行政区类型分类着色。选中后色块变透明、用色环勾边。勾选「普查分区」可看一级以下的行政边界。',
  mainLabel='省 / 地区', capitalLabel='省会',
  groupNote='按<b>行政区类型</b>着色：10 个省与 3 个地区一目了然。',
  groups=[('省', '#e6194b'), ('地区', '#3cb44b')],
 ),
 'deu-regions': dict(
  title='德国行政区划地图 · 16 个联邦州的人口、面积与类型',
  desc='点一下德国地图，看 16 个联邦州的中文名、首府、人口、面积与行政区类型。可在「人口 / 面积 / 类型」之间切换着色，还能展开 403 个行政区。边界数据来自 GADM 4.1。',
  kw='德国地图,德国行政区划,联邦州,首府,人口,面积,类型,GADM,互动地图',
  lead='联邦制的中欧大国，16 个联邦州，其中柏林、汉堡、不来梅是「城市州」。点一下地图，看每个州的<b>中文名、首府、人口、面积与类型</b>。',
  notePop='按<b>人口</b>着色：北莱茵-威斯特法伦、巴伐利亚、巴登-符腾堡三州人口最多，仅北威州就超过 1700 万。',
  source='联邦州、行政区边界来自 <b>GADM 4.1</b>（gadm41_DEU_shp，WGS84 / EPSG:4326，公开数据）；中文名与首府按通行译法整理，人口为 <b>2022 年德国人口普查</b>（约值），面积由几何球面实算。',
  panel='色块按<b>人口 / 面积</b>分级（越深越大）；选「类型」则按行政区类型分类着色。选中后色块变透明、用色环勾边。勾选「行政区」可看一级以下的行政边界。',
  mainLabel='联邦州', capitalLabel='首府',
  groupNote='按<b>行政区类型</b>着色：16 个联邦州。',
  groups=[('州', '#e6194b')],
 ),
 'nzl-regions': dict(
  title='新西兰行政区划地图 · 19 个大区 / 领地的人口、面积与类型',
  desc='点一下新西兰地图，看 16 个大区与查塔姆群岛领地、外岛区域的中文名、首府、人口、面积与行政区类型。可在「人口 / 面积 / 类型」之间切换着色，还能展开 75 个地方当局。边界数据来自 GADM 4.1。',
  kw='新西兰地图,新西兰行政区划,大区,领地,首府,人口,面积,类型,GADM,互动地图',
  lead='南太平洋岛国，16 个大区 + 查塔姆群岛领地与南北群岛等外岛区域。点一下地图，看每个大区的<b>中文名、首府、人口、面积与类型</b>。',
  notePop='按<b>人口</b>着色：奥克兰大区独占全国约三分之一人口，南岛西海岸与南方群岛则人烟稀少。',
  source='大区、地方当局边界来自 <b>GADM 4.1</b>（gadm41_NZL_shp，WGS84 / EPSG:4326，公开数据）；中文名与首府按通行译法整理，人口为 <b>2023 年新西兰人口普查</b>（约值），面积由几何球面实算。',
  panel='色块按<b>人口 / 面积</b>分级（越深越大）；选「类型」则按行政区类型分类着色。选中后色块变透明、用色环勾边。勾选「地方当局」可看一级以下的行政边界。',
  mainLabel='大区 / 领地', capitalLabel='首府',
  groupNote='按<b>行政区类型</b>着色：大区、领地与外岛区域一目了然。',
  groups=[('大区', '#e6194b'), ('领地', '#3cb44b'), ('群岛', '#4363d8')],
 ),
 'rus-regions': dict(
  title='俄罗斯行政区划地图 · 83 个联邦主体的人口、面积与类型',
  desc='点一下俄罗斯地图，看 83 个联邦主体（共和国、边疆区、州、自治区、直辖市）的中文名、首府、人口、面积与行政区类型。可在「人口 / 面积 / 类型」之间切换着色，还能展开 2445 个区市。边界数据来自 GADM 4.1。',
  kw='俄罗斯地图,俄罗斯行政区划,联邦主体,共和国,边疆区,州,首府,人口,面积,GADM',
  lead='世界面积最大的国家，83 个联邦主体（共和国、边疆区、州、自治区、直辖市）。点一下地图，看每个主体的<b>中文名、首府、人口、面积与类型</b>。',
  notePop='按<b>人口</b>着色：莫斯科市与莫斯科州合计超过 2100 万，广袤的西伯利亚与远东则地广人稀。',
  source='联邦主体、区市边界来自 <b>GADM 4.1</b>（gadm41_RUS_shp，WGS84 / EPSG:4326，公开数据）；中文名与首府按通行译法整理，人口为 <b>2021 年俄罗斯人口普查</b>（约值），面积由几何球面实算。',
  panel='色块按<b>人口 / 面积</b>分级（越深越大）；选「类型」则按行政区类型分类着色。选中后色块变透明、用色环勾边。勾选「区市」可看一级以下的行政边界。',
  mainLabel='联邦主体', capitalLabel='首府',
  groupNote='按<b>行政区类型</b>着色：共和国、边疆区、州、自治区、自治州与直辖市六类一目了然。',
  groups=[('共和国', '#e6194b'), ('边疆区', '#3cb44b'), ('州', '#4363d8'),
          ('自治区', '#f58231'), ('自治州', '#911eb4'), ('直辖市', '#42d4f4')],
 ),
 'usa-regions': dict(
  title='美国行政区划地图 · 51 个州级单位的人口、面积与类型',
  desc='点一下美国地图，看 50 个州 + 哥伦比亚特区的中文名、首府、人口、面积与行政区类型。可在「人口 / 面积 / 类型」之间切换着色，还能展开 3148 个县。边界数据来自 GADM 4.1。',
  kw='美国地图,美国行政区划,州,首府,人口,面积,类型,哥伦比亚特区,GADM,互动地图',
  lead='50 个州 + 哥伦比亚特区，跨越北美大陆并远及太平洋。点一下地图，看每个州的<b>中文名、首府、人口、面积与类型</b>。',
  notePop='按<b>人口</b>着色：加利福尼亚、得克萨斯、佛罗里达三州人口最多，东北新英格兰诸州则小巧密集。',
  source='州 / 联邦区、县边界来自 <b>GADM 4.1</b>（gadm41_USA_shp，WGS84 / EPSG:4326，公开数据）；中文名与首府按通行译法整理，人口为 <b>2020 年美国人口普查</b>（约值），面积由几何球面实算。',
  panel='色块按<b>人口 / 面积</b>分级（越深越大）；选「类型」则按行政区类型分类着色。选中后色块变透明、用色环勾边。勾选「县」可看一级以下的行政边界。',
  mainLabel='州 / 联邦区', capitalLabel='首府',
  groupNote='按<b>行政区类型</b>着色：50 个州与 1 个联邦区一目了然。',
  groups=[('州', '#e6194b'), ('联邦区', '#3cb44b')],
 ),
}

FACT_ROW = '        <span><small>总人口</small><b><span class="v"><em id="fPop">—</em></span><i id="fPopU"></i></b></span>'
CHIPS = '''        <div class="chips" id="metricSeg">
          <button type="button" data-metric="pop" class="active">人口</button>
          <button type="button" data-metric="area">面积</button>
          <button type="button" data-metric="group">类型</button>
        </div>'''

def sub1(pattern, repl, text, flags=re.S):
    new, n = re.subn(pattern, repl, text, count=1, flags=flags)
    if n == 0:
        print('   !! 未匹配:', pattern[:60])
    return new

for slug, d in C.items():
    # ── config.js ──
    cp = os.path.join(ROOT, 'public', 'maps', slug, 'js', 'config.js')
    s = open(cp, encoding='utf-8').read()
    s = s.replace("defaultMetric: 'area',", "defaultMetric: 'pop',")
    s = sub1(r"  METRICS: \{.*?\n  \},",
             "  METRICS: {\n"
             "    pop:    { key: 'pop', label: '人口', unit: '人', hint: '人口为该行政区最近一次普查 / 官方估计（约值）' },\n"
             "    area:   { key: 'area', label: '面积', unit: 'km²', hint: '面积由 GADM 几何球面实算（约值）' },\n"
             "    group:  { key: 'groupZh', label: '类型', unit: '类型', hint: '行政区类型（GADM ENGTYPE 映射）' }\n"
             "  },", s)
    gc = "  /* 行政区类型配色 */\n  GROUP_COLORS: {\n" + \
         ",\n".join(f"    '{k}': '{v}'" for k, v in d['groups']) + "\n  },"
    s = sub1(r"  /\* 行政区类型配色 \*/\n  GROUP_COLORS: \{.*?\n  \},", gc, s)
    s = s.replace("capitalLabel: '类型',", f"capitalLabel: '{d['capitalLabel']}',")
    s = sub1(r"    mainLabel: '[^']*',", f"    mainLabel: '{d['mainLabel']}',", s)
    s = s.replace("      group: '按<b>行政区类型</b>着色：州 / 省 / 领地 / 共和国 / 边疆区等一目了然。',",
                  f"      group: '{d['groupNote']}',")
    if "      pop: '" not in s:
        s = sub1(r"    notes: \{\n", "    notes: {\n      pop: '" + d['notePop'] + "',\n", s)
    s = s.replace("着色指标：面积（几何实算）/ 行政区类型（ENGTYPE 映射）。",
                  "着色指标：人口（普查 / 官方估计）/ 面积（几何实算）/ 行政区类型。")
    open(cp, 'w', encoding='utf-8').write(s)

    # ── index.html ──
    hp = os.path.join(ROOT, 'public', 'maps', slug, 'index.html')
    h = open(hp, encoding='utf-8').read()
    h = sub1(r"  <title>.*?</title>", f"  <title>{d['title']}</title>", h)
    h = sub1(r'  <meta name="description" content="[^"]*" />',
             f'  <meta name="description" content="{d["desc"]}" />', h)
    h = sub1(r'  <meta name="keywords" content="[^"]*" />',
             f'  <meta name="keywords" content="{d["kw"]}" />', h)
    h = sub1(r'      <p class="lead">.*?</p>', f'      <p class="lead">{d["lead"]}</p>', h)
    h = sub1(r'        <span id="fPopWrap"[^>]*>.*?</span>\n', FACT_ROW + '\n', h)
    h = sub1(r'        <div class="chips" id="metricSeg">.*?</div>', CHIPS, h)
    h = sub1(r'        <p class="note" id="metricNote">.*?</p>',
             f'        <p class="note" id="metricNote">{d["notePop"]}</p>', h)
    h = sub1(r'        <p><b>数据来源</b>.*?</p>', f'        <p><b>数据来源</b>：{d["source"]}</p>', h)
    h = sub1(r'        色块按.*?\n', '        ' + d['panel'] + '\n', h)
    open(hp, 'w', encoding='utf-8').write(h)
    print(f'{slug}: config.js + index.html 已更新')
