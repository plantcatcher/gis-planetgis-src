# -*- coding: utf-8 -*-
"""7 国（ETH/IRN/IRQ/KAZ/MYS/NGA/PAK）行政区划互动地图 · 数据 + 页面生成器
复用 gen_twelve_regions.py 的纯 Python SHP/DBF 解析（无第三方依赖）。
从 C:/Users/ZhuanZ/Downloads/gadm41_{CC}_shp 读取 GADM 4.1。
产出每国：
    public/maps/<slug>/data/{provinces,districts}.geojson   (L1 / L2，含几何实算面积)
    public/maps/<slug>/js/config.js
    public/maps/<slug>/index.html
    content/works/<slug>.md
    content/downloads/gadm41-<iso>-shp.md   （access: gated，R2 直链 + 与地图互链）
    src/data/vizmaps.json 追加 7 条登记

公众号关键词规则：本批 7 国共用一套通用关键词（trigger=GADM，别名只用「全球行政区SHP」等
通用词，不放国名）与一个验证码（NSH-GADM-999），避免占满公众号 200 条规则上限。
R2 直链：https://downloads.planetgis.cn/GIS/gadm41_<ISO>_shp.zip
本脚本只生成「机械层」：面积实算、类型由 ENGTYPE 映射；
中文名 / 首府 / 人口 / 看点 由后续 enrich_seven_regions.py 按 GID 回填。
"""
import json, os, sys
sys.stdout.reconfigure(encoding='utf-8')

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BASE = r"C:/Users/ZhuanZ/Downloads"
sys.path.insert(0, HERE)

from gen_twelve_regions import (
    read_dbf, read_shp, build_geojson, feat_area_km2, all_points,
    pct, unwrap_lons, wrap, ramp, hex2rgb, lerp, ENGTYPE_ZH, GROUP_PALETTE,
)

R2_BASE = "https://downloads.planetgis.cn/GIS"

# ── 公众号关键词：7 国共用一套规则 + 一个验证码 ──────────────────────
SHARED_CODE = "NSH-GADM-999"
SHARED_TRIGGER = "GADM"
SHARED_ALIASES = "GADM,全球行政区SHP,行政区划SHP,全球行政区划数据,GADM数据"

# ENGTYPE_1 → 中文分组（本批 7 国专用覆盖表，未命中回落到通用表）
ENGTYPE_ZH7 = {
    "state": "州",                            # ETH 民族州 / NGA 州 / MYS 州
    "city": "特别市",                          # ETH 亚的斯亚贝巴 / 德雷达瓦（Astedader）
    "province": "省",                          # IRN / IRQ / PAK
    "region": "州",                            # KAZ 州（Oblasy）
    "federal territory": "联邦直辖区",          # MYS 吉隆坡 / 布城 / 纳闽
    "capital territory": "首都区",              # PAK 伊斯兰堡
    "centrally administered area": "直管区",    # PAK 阿扎德克什米尔 / 吉尔吉特-巴尔蒂斯坦
    "territory": "地区",                        # PAK FATA
}

META = {
    "eth": dict(slug="eth-regions", zh="埃塞俄比亚", en="Ethiopia", eyebrow="ETHIOPIA · REGIONS",
                role="民族州 / 特别市", sub="专区", accent="#c8963e", dark="#241704",
                blurb="东非高原之国，非洲唯一从未被长期殖民的国家，11 个民族州与 2 个特别市按民族语言划界，咖啡的发源地与拉利贝拉岩石教堂都在这里。",
                note="按<b>人口</b>着色：奥罗米亚与阿姆哈拉两大高原州人口最多，首都亚的斯亚贝巴面积最小却密度最高，东南索马里州与西南低地则明显稀疏。",
                read="埃塞俄比亚 11 个一级政区按人口着色，几乎就是一张「高原住人、低地空旷」的图——奥罗米亚从首都一路铺到肯尼亚边境，是面积与人口的双重巨块；阿姆哈拉守着北部的塔纳湖与贡德尔古城；而东南的索马里州、西南的甘贝拉，大片干热低地里人烟稀少。切到「类型」看更有意思：11 个里有 9 个是民族州（Kilil），另有亚的斯亚贝巴与德雷达瓦 2 个特别市（Astedader）。这个国家的行政区划是按民族语言划界的，一张图就能看出「民族联邦制」的骨架。"),
    "irn": dict(slug="irn-regions", zh="伊朗", en="Iran", eyebrow="IRAN · PROVINCES",
                role="省", sub="县", accent="#3a5ba0", dark="#0b1a33",
                blurb="西亚高原大国，31 个省，波斯文明与什叶派伊斯兰在此交汇，扎格罗斯与厄尔布尔士两条山脉夹着中央高原，石油、地毯与里海—波斯湾的双海岸线是它的地理标签。",
                note="按<b>人口</b>着色：德黑兰一省独大（首都圈聚集千万级人口），伊斯法罕、法尔斯、拉扎维呼罗珊次之，东南的锡斯坦-俾路支斯坦与中部沙漠省份稀疏。",
                read="伊朗 31 个省按人口着色，德黑兰像一颗钉在厄尔布尔士山南麓的图钉，浓得化不开；往南到伊斯法罕、往东北到呼罗珊，颜色渐次变浅；而东南角的锡斯坦-俾路支斯坦、中部的卢特荒漠，几乎是大片留白。切到「面积」看排序几乎倒过来——克尔曼、锡斯坦-俾路支斯坦、法尔斯才是真正的巨无霸。这个国家的秘密藏在地形里：两条山脉夹着中央高原，人和城都压在山前的绿洲带上。"),
    "irq": dict(slug="irq-regions", zh="伊拉克", en="Iraq", eyebrow="IRAQ · GOVERNORATES",
                role="省", sub="区", accent="#a8621b", dark="#241404",
                blurb="两河流域（美索不达米亚）的文明发源地，18 个省，底格里斯与幼发拉底河在南部汇成阿拉伯河，石油储量与巴格达的千年古城是它最重的两个标签。",
                note="按<b>人口</b>着色：巴格达省一省独大，巴士拉、尼尼微（摩苏尔）次之，西部的安巴尔省面积最大却人口稀疏。",
                read="伊拉克 18 个省按人口着色，最扎眼的是「两河之间那条深色带」——从巴格达沿底格里斯河南下到巴士拉，全国人口几乎都压在这条水带上；向西是安巴尔省的沙漠，向北向东是库尔德山区的埃尔比勒、苏莱曼尼亚。切到「面积」看，安巴尔一省就占去国土近三分之一。这个国家的人口分布本质上是「水在哪人在哪」——美索不达米亚四千年没变过的规律。"),
    "kaz": dict(slug="kaz-regions", zh="哈萨克斯坦", en="Kazakhstan", eyebrow="KAZAKHSTAN · REGIONS",
                role="州", sub="区", accent="#0d9bd6", dark="#052430",
                blurb="世界最大的内陆国，14 个州，从里海一路铺到阿尔泰山，草原、荒漠与拜科努尔航天发射场共同构成它的辽阔，也是「一带一路」的关键通道。",
                note="按<b>人口</b>着色：南部的阿拉木图与南哈萨克斯坦（奇姆肯特）人口密集，北部与中部的广袤草原、荒漠州份则地广人稀。",
                read="哈萨克斯坦 14 个州按人口着色，重心明显压在南缘——阿拉木图（旧都、最大城市）与南哈萨克斯坦贴着天山与乌兹别克斯坦边境，人口最密；往北、往中是卡拉干达的矿区与一望无际的草原，颜色越来越浅。切到「面积」看，阿克托别、东哈萨克斯坦才是真正的巨无霸，一个州顶得上欧洲一个国家。这个国土面积世界第九的国家人口却只有两千万，「地广人稀」在这里是最直观的地理事实。"),
    "mys": dict(slug="mys-regions", zh="马来西亚", en="Malaysia", eyebrow="MALAYSIA · STATES",
                role="州 / 联邦直辖区", sub="县", accent="#1b6ca8", dark="#08182e",
                blurb="被南海劈成两半的东南亚国家，13 州 + 3 个联邦直辖区，西马的都市带与东马（婆罗洲）的雨林隔海相望，马六甲海峡是全球最繁忙的海运通道之一。",
                note="按<b>人口</b>着色：雪兰莪（含吉隆坡都会圈）与柔佛（紧邻新加坡）人口最密，东马的沙巴、砂拉越面积辽阔但人口分散。",
                read="马来西亚 16 个一级政区按人口着色，重心牢牢压在西马西海岸：雪兰莪包着吉隆坡与巴生港，是毫无争议的人口第一；南端的柔佛靠着新加坡，北部的槟城、吉打次之。切到「面积」看，画面立刻翻转——东马的砂拉越、沙巴加起来占国土六成以上，却只住着不到两成人口。切到「类型」看，13 个州（Negeri）之外还有吉隆坡、布城、纳闽 3 个联邦直辖区，是联邦政府直接管辖的「非州」单元。"),
    "nga": dict(slug="nga-regions", zh="尼日利亚", en="Nigeria", eyebrow="NIGERIA · STATES",
                role="州", sub="地方政府区", accent="#0a8a52", dark="#04200f",
                blurb="非洲人口最多的国家，37 个州（含联邦首都区），尼日尔河三角洲的石油、拉各斯的超级都市，以及南北之间穆斯林与基督徒的分野，共同构成这个非洲巨人。",
                note="按<b>人口</b>着色：拉各斯一州密度惊人（非洲第一大城），卡诺（北部商贸古都）次之，中部与东北部州份人口分散。",
                read="尼日利亚 37 个州按人口着色，最扎眼的是西南角那块小小的拉各斯——面积几乎全国最小，颜色却最深，非洲最大城市的密度全挤在这里；北方的卡诺、卡齐纳靠撒赫勒商贸带撑起第二梯队；而中部的尼日尔、高原州面积不小、人口却稀。切到「面积」看，北方的博尔诺、尼日尔才是真正的巨块。这张图最值得看的是「南密北疏」背后的雨量线——南部的雨林与三角洲能养人，北部的萨赫勒只能放牧。"),
    "pak": dict(slug="pak-regions", zh="巴基斯坦", en="Pakistan", eyebrow="PAKISTAN · PROVINCES",
                role="省 / 直管区", sub="专区", accent="#4a8b2c", dark="#0b2010",
                blurb="南亚次大陆西北的印度河之国，4 个省 + 1 个首都区 + 2 个直管区，印度河灌溉平原养活了全国绝大多数人口，喀喇昆仑公路把它与中国连在一起。",
                note="按<b>人口</b>着色：旁遮普一省独大（占全国人口一半以上），信德省（卡拉奇）次之，西南的俾路支斯坦面积最大却人口最稀。",
                read="巴基斯坦 8 个一级政区按人口着色，几乎就是「一条印度河」的形状——旁遮普沿着五河平原铺开，扛下全国一半以上人口；信德省靠卡拉奇这个千万级港口城市撑起第二极；而西南的俾路支斯坦占了国土面积的四成以上，人烟却稀到几乎看不见。切到「面积」看，俾路支斯坦与开伯尔-普什图省才是真正的巨块。这个国家的地理逻辑极其直白：印度河在哪，人就在哪。",
                disclaimer="**克什米尔地区的说明**：本数据集含 GADM 依其来源口径列入巴基斯坦的「阿扎德克什米尔」与「吉尔吉特-巴尔蒂斯坦」两个一级政区。克什米尔地区为印度与巴基斯坦之间的争议地区，本页所述「8 个一级政区」等计数均为对该数据集的客观描述，**不代表任何立场，也不构成对主权归属的判断**；涉及该地区以及涉及中国疆域的正式制图，请使用中国官方发布的标准地图数据。"),
}

ORDER = ["eth", "irn", "irq", "kaz", "mys", "nga", "pak"]

# L2 需要剔除的非行政区要素（ENGTYPE_2）
DROP_L2_ENGTYPE = {"water body"}


# ── HTML / MD 模板（沿用 twelve 版结构，PAK 增加领土/争议地区声明） ──
def make_index_html(m, slug, L1n, L2n, hasSub):
    accent = m["accent"]; dark = m["dark"]
    sub_row = (f'      <label class="row"><input type="checkbox" id="ckMuni" data-toggle-layer="sub-fill,sub-line" /><span>{m["sub"]}</span></label>\n'
               f'      <label class="row"><input type="checkbox" id="ckLabel" checked /><span>{m["role"]}名称</span></label>')
    sub_facts = (f'        <span><small>{m["sub"]}</small><b><span class="v"><em id="fSub">{L2n}</em></span><i>个</i></b></span>\n')
    note_pop = m["note"]
    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <script src="/shared/ga-bridge.js"></script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{m['zh']}行政区划地图 · {L1n} 个{m['role']}的人口、面积与类型</title>
  <meta name="description" content="点一下{m['zh']}地图，看 {L1n} 个{m['role']}的中文名、首府、人口、面积与行政区类型。可在「人口 / 面积 / 类型」之间切换着色，还能展开 {L2n} 个{m['sub']}。边界数据来自 GADM 4.1。" />
  <meta name="keywords" content="{m['zh']}地图,{m['zh']}行政区划,{m['en']},人口,面积,类型,GADM,互动地图" />
  <meta name="author" content="PlanetGIS" />
  <link rel="icon" href="data:," />
  <link rel="stylesheet" href="/maps/_shared/maplibre-gl.css" />
  <link rel="stylesheet" href="/maps/_shared/thematic/thematic.css" />
  <link rel="stylesheet" href="/maps/_shared/regions.css" />
  <style>
    :root {{
      --accent: {accent}; --accent-light: {accent}; --accent-dark: {dark};
      --accent-soft: {accent}24;
      --panel-solid: {dark}f0;
    }}
    html, body, #map {{ background: {dark}; }}
  </style>
</head>
<body>

  <div id="map"></div>
  <div id="labels"></div>

  <aside class="intro" id="intro">
    <div class="intro-head">
      <a class="btn-back" href="/maps" target="_top"><i>&#8249;</i> 全部地图</a>
      <button class="btn-overview" id="btnOverview" type="button"><i>&#9673;</i> {m['zh']}总览</button>
    </div>

    <div class="intro-bar" id="introBar" role="button" tabindex="0" aria-expanded="true">
      <i class="ic-eq"></i>
      <b>{m['zh']}行政区划地图</b>
      <span><em id="introBarText">收起</em><i class="caret"></i></span>
    </div>

    <div class="intro-body" id="introBody">
      <small class="eyebrow"><i class="ic-eq"></i> {m['eyebrow']}</small>
      <h1><span>{m['zh']}</span><b>行政区划地图</b></h1>
      <p class="lead">{m['blurb']}点一下地图，看每个{m['role']}的<b>中文名、首府、人口、面积与行政区类型</b>。顶栏可在<b>人口 / 面积 / 类型</b>之间切换着色，颜色越深数值越大。</p>

      <div class="facts">
        <span><small>{m['role']}</small><b><span class="v"><em id="fMain">{L1n}</em></span><i>个</i></b></span>
{sub_facts}        <span><small>总面积</small><b><span class="v"><em id="fArea">—</em></span><i id="fAreaU">万km²</i></b></span>
      </div>

      <section class="block">
        <header><small>着色指标</small><small class="hint-n">切换看不同维度</small></header>
        <div class="chips" id="metricSeg">
          <button type="button" data-metric="pop" class="active">人口</button>
          <button type="button" data-metric="area">面积</button>
          <button type="button" data-metric="group">类型</button>
        </div>
        <p class="note" id="metricNote">{note_pop}</p>
      </section>

      <section class="block src">
        <p><b>数据来源</b>：{m['role']}、{m['sub']}边界来自 <b>GADM 4.1</b>（gadm41_{m['slug'].split('-')[0].upper()}_shp，WGS84 / EPSG:4326，公开数据）。面积由几何球面实算（约值），行政区类型取自 GADM 的 ENGTYPE 字段，人口 / 首府 / 中文译名为人工整理（约值）。本图仅作行政边界示意，界线画法不代表任何立场。</p>
      </section>

      <div class="intro-nav">
        <a href="/works/{slug}" target="_top">作品介绍</a>
        <a href="/downloads/gadm41-{m['slug'].split('-')[0]}-shp" target="_top">下载源数据</a>
        <a href="/maps" target="_top">全部地图</a>
      </div>
    </div>
  </aside>

  <aside class="detail" id="detail" hidden>
    <header>
      <small id="dtRole">—</small>
      <div class="dt-actions">
        <button type="button" id="dtClose" title="关闭">✕</button>
      </div>
    </header>
    <h2 id="dtName">—</h2>
    <p id="dtSub">—</p>
    <div class="dt-metrics">
      <span><small id="dtLb1">人口</small><b><em id="dtV1">—</em><i id="dtU1">人</i></b></span>
      <span><small id="dtLb2">面积</small><b><em id="dtV2">—</em><i id="dtU2">km²</i></b></span>
      <span><small id="dtLb3">首府</small><b><em id="dtV3">—</em><i id="dtU3"></i></b></span>
    </div>
    <section class="dt-desc">
      <small id="dtDescLb">看点</small>
      <p id="dtDesc">—</p>
    </section>
    <footer id="dtFooter">—</footer>
  </aside>

  <div class="dock">
    <div class="legend" id="legend"></div>
  </div>

  <div class="panel" id="panel">
    <div class="panel-head" id="panelHead">
      <span>图层与底图</span>
      <button type="button" id="panelToggle" title="折叠/展开">－</button>
    </div>
    <div class="panel-body" id="panelBody">
{sub_row}
      <label class="row"><input type="checkbox" id="ckGraticule" /><span>经纬网格</span></label>
      <div class="divider"></div>
      <div class="bm-title">底图</div>
      <div class="bm-seg">
        <label class="bm-opt"><input type="radio" name="basemap" value="img" checked /><span>卫星影像</span></label>
        <label class="bm-opt"><input type="radio" name="basemap" value="vec" /><span>地形晕渲</span></label>
        <label class="bm-opt"><input type="radio" name="basemap" value="none" /><span>深色</span></label>
      </div>
      <div class="divider"></div>
      <p class="panel-note" id="panelNote">
        色块按<b>人口</b>分级（越深越多）；选「面积」则按面积、选「类型」按行政区类型分类着色。选中后色块变透明、用色环勾边。勾选「{m['sub']}」可看省以下的行政边界。
      </p>
    </div>
  </div>

  <script src="/maps/_shared/maplibre-gl.js"></script>
  <script src="/maps/_shared/thematic/thematic.js"></script>
  <script src="js/config.js"></script>
  <script src="/maps/_shared/regions-app.js"></script>
</body>
</html>
'''


def make_config_js(m, slug, view, bounds, extent, group_colors):
    cc = slug.split("-")[0]
    RAMP = ramp(m["accent"])
    gc = ",\n    ".join(f"'{g}': '{c}'" for g, c in group_colors.items())
    return f'''/* {m['zh']}行政区划互动地图 · 表现层配置
   数据：scripts/gen_seven_regions.py 从 GADM 4.1（gadm41_{cc.upper()}_shp）转换生成
        - provinces.geojson  {m['role']}（L1）
        - districts.geojson  {m['sub']}（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {{
  slug: '{slug}',
  defaultMetric: 'pop',
  view: {{ center: [{view[0]}, {view[1]}], zoom: {view[2]}, minZoom: {view[3]}, maxZoom: 11 }},
  bounds: [{bounds[0]}, {bounds[1]}, {bounds[2]}, {bounds[3]}],
  boundsMobile: [{bounds[0]}, {bounds[1]}, {bounds[2]}, {bounds[3]}],
  extent: [{extent[0]}, {extent[1]}, {extent[2]}, {extent[3]}],
  graticuleStep: 5,

  basemaps: {{
    img: {{ tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{{z}}/{{y}}/{{x}}' }},
    vec: {{ tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{{z}}/{{y}}/{{x}}' }}
  }},
  imgAttr: 'Esri World Imagery',
  vecAttr: 'Esri World Shaded Relief',

  imgPaint: {{
    'raster-brightness-max': 0.58,
    'raster-brightness-min': 0.06,
    'raster-saturation': -0.40,
    'raster-contrast': 0.08
  }},

  /* 顺序色阶（由 {m['zh']}主色生成） */
  RAMP: {json.dumps(RAMP)},

  /* 行政区类型配色 */
  GROUP_COLORS: {{
    {gc}
  }},

  METRICS: {{
    pop:    {{ key: 'pop', label: '人口', unit: '人', hint: '{m['zh']}各{m['role']}人口（最近普查 / 官方估计，约值）' }},
    area:   {{ key: 'area', label: '面积', unit: 'km²', hint: '面积由 GADM 几何球面实算（约值）' }},
    group:  {{ key: 'groupZh', label: '类型', unit: '类型', hint: '行政区类型（GADM ENGTYPE 映射）' }}
  }},

  DATA: {{
    main: 'data/provinces.geojson',
    sub: 'data/districts.geojson'
  }},

  TEXT: {{
    groupSuffix: '类型',
    capitalLabel: '首府',
    mainLabel: '{m['role']}',
    subRole: '{m['sub']}',
    subDesc: '{m['sub']}是{m['role']}之下的基本行政单位。',
    notes: {{
      pop: '{m['note']}',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 特别市 / 联邦直辖区 / 直管区等一目了然。'
    }}
  }}
}};
'''


def make_works_md(m, slug, L1n, L2n, area_total, hasSub):
    cc = slug.split("-")[0]
    disc = m.get("disclaimer")
    disc_block = (f"\n### 关于争议地区的说明\n\n{disc}\n") if disc else ""
    return f'''---
slug: {slug}
title: {m['zh']}行政区划地图
cover: /maps/{slug}/vizmap-{slug}-cover.jpg
summary: 点一下{m['zh']}地图，看 {L1n} 个{m['role']}的中文名、首府、人口、面积与行政区类型；可在「人口 / 面积 / 类型」之间切换着色，还能展开 {L2n} 个{m['sub']}。边界数据来自 GADM 4.1。
link: /maps/{slug}
order: 30
category: 互动地图
series: map
topics: 行政区划
scope: 世界
tags: {m['zh']},行政区划,{m['en']},人口,面积,类型,互动地图,地理可视化,GADM
---

## 介绍

{m['blurb']}这张图把{m['zh']}的{m['role']}摊开在同一张地图上：**点一下任意{m['role']}，右侧直接弹出卡片**——中文名、首府、人口、面积（几何实算）与行政区类型，以及一句看点。

地图本体是 **GADM 4.1** 的行政边界，默认按 **人口** 分级着色；顶栏可在 **人口 / 面积 / 类型** 之间切换——选「类型」则按行政区类型分类着色，一眼看清这个国家的结构基因。

不满足于一级？勾选左下角「{m['sub']}」，展开 **{L2n} 个{m['sub']}**看{m['role']}以下的行政区划。

## 功能特点

- **三个指标切换着色**：人口用 log 尺度分级（越深越多）；面积由几何实算；选「类型」则按行政区类型分类着色。
- **点即出卡**：选中色块变透明、透出底图，并用一圈色环勾住边界；卡片显示中文名 / 首府 / 人口 / 面积 / 看点。
- **面积实算**：每个{m['role']}的面积由几何球面实算（约值），不依赖外部统计。
- **三种底图**：Esri 卫星影像（默认，压暗）/ 地形晕渲 / 深色无底图。
- **可展开 {L2n} 个{m['sub']}**：{m['sub']}边界作为可叠加图层，勾选后可点任意单元看所属{m['role']}。
- **经纬网格与分享链接**：可叠加 5° 经纬网格；选中后地址栏带上定位状态。

## 数据来源与合规

{m['role']}、{m['sub']}边界来自 **GADM 4.1**（数据集 `gadm41_{cc.upper()}_shp`，WGS84 / EPSG:4326，公开数据），坐标系与 Esri 全球影像底图对齐。面积由几何球面实算（约值），行政区类型取自 GADM 的 ENGTYPE 字段；**人口、首府与中文译名为人工整理**（通行译法 + 各国统计局 / 普查近似值），仅供快速对照。本图仅展示行政边界几何，界线画法不代表任何立场。
{disc_block}
## 想拿走原始数据？

如果你要做自己的地图或分析，建议直接下载这套矢量数据——**GADM 4.1 全层级 Shapefile（国界 / {L1n} 个{m['role']} / {L2n} 个{m['sub']} / 更细层级），体量与层级都很全**：

👉 **[GADM 4.1 {m['zh']}矢量数据下载](/downloads/gadm41-{cc}-shp)**

边界是 WGS84 经纬度，Shapefile 格式，可直接在 QGIS / ArcGIS 里打开。本站这张互动图的几何，正是从它转换来的。

## 使用教程

1. 打开地图，默认停在 **人口** 着色、卫星影像底图。悬停任意{m['role']}会浮出名称、类型与面积。
2. 顶栏点「人口 / 面积 / 类型」切换统计口径；颜色对应的具体量级在右下角图例里看。
3. **点一个{m['role']}**：右侧弹出卡片，地图缩放到该单位范围并用色环勾边。卡片里直接看中文名、首府、人口、面积与看点。
4. 想看{m['role']}以下行政：勾选左下角「{m['sub']}」，边界浮现后可点任意单元看所属{m['role']}。
5. 只想看数据不想看影像：把底图切成「深色」。
6. 想退出选中：点卡片右上角关闭按钮，或点地图空白处。

## 常见问题 FAQ

<details>
<summary>Q: 人口 / 首府的数据准吗？</summary>

人口取自各国统计局 / 最近一次普查的近似值，首府为中文通行译法；面积由几何实算。三者仅供快速对照，正式用途请以各国官方发布为准。GADM 数据本身不含人口，本站的人口 / 首府为逐区人工整理。

</details>

<details>
<summary>Q: 边界数据哪来的，能商用吗？</summary>

{m['role']}、{m['sub']}边界来自 **GADM 4.1**（公开数据，WGS84）。GADM 数据供非商业与研究用途使用，正式或商业用途请遵循其许可并优先采用各国官方发布的标准行政区划。底图瓦片来自 Esri，版权归 Esri 及其数据提供方。

</details>

## 一点解读

{m['read']}
'''


def make_downloads_md(m, slug, cc, L1n, L2n, area_total, zip_bytes, l3n):
    size_mb = zip_bytes / 1e6
    size_str = f"{size_mb:.1f} MB（{zip_bytes:,} 字节）"
    disc = m.get("disclaimer")
    disc_block = (f"\n### 关于争议地区的说明\n\n{disc}\n") if disc else ""
    l3_line = (f"- **Level 3（更细层级）**：**{l3n} 个要素**（本包独有，多数国家 GADM 只到 L2）。" if l3n else "")
    return f'''---
slug: gadm41-{cc}-shp
title: GADM 4.1 {m['zh']}行政区划矢量数据 SHP（国界 / {m['role']} / {m['sub']}，WGS84）
summary: GADM 4.1 {m['zh']}行政区划数据集，含国界、{L1n} 个{m['role']}、{L2n} 个{m['sub']}的 Shapefile，WGS84 地理坐标系，可直接用于 QGIS / ArcGIS / Python 空间分析与制图。
date: 2026-10-11
category: 地理数据
group: 地理数据
region: 国外
dataFormat: SHP
tags: GADM, {m['zh']}, 行政区划, SHP, 矢量数据, WGS84, QGIS, 地理数据
access: gated
download: {R2_BASE}/gadm41_{cc.upper()}_shp.zip
downloadType: direct
trigger: {SHARED_TRIGGER}
keywordAliases: {SHARED_ALIASES}
code: {SHARED_CODE}
format: SHP（ZIP 压缩包）
size: {size_str}
cover: https://blogphoto.planetgis.cn/PicGo/2026-10-09-geo-data-cover.jpg
---

> 本数据集为 GADM（Global Administrative Areas，全球行政区划数据库）v4.1 的**{m['zh']}**部分，以 Shapefile 格式提供行政区划边界，压缩包约 **{size_str}**。GADM 是国际学术界广泛引用的全球行政区划数据项目，覆盖全球 400+ 国家和地区的高精度行政边界。{m['blurb']}

## 数据内容

包内按行政层级分为 Shapefile（每级均含 `.shp / .shx / .dbf / .prj / .cpg`，齐全）：

- **Level 0（国界）**：{m['zh']}全国边界，字段为 `GID_0` 与 `COUNTRY`（国家名）。
- **Level 1（{m['role']}）**：**{L1n} 个要素**。字段含 `NAME_1`、`TYPE_1 / ENGTYPE_1`、`ISO_1`（ISO 3166-2 代码）、`HASC_1` 等。
- **Level 2（{m['sub']}）**：**{L2n} 个要素**。字段含 `NAME_2`、`TYPE_2 / ENGTYPE_2`、`HASC_2` 以及所属一级的 `NAME_1`。
{l3_line}
各级通过 `GID_0 → GID_1 → GID_2` 编码严格逐级嵌套，可任意聚合或下钻，直接支撑分组设色、空间连接与区域统计。

## 坐标系与格式

- 坐标系：**GCS_WGS_1984（EPSG:4326，WGS84 经纬度）**，`.prj` 文件随包附带，无需自行定义投影。
- 文本编码：`.cpg` 指定 **UTF-8**，属性表按源数据语言存储，QGIS / ArcGIS / Python 打开无乱码。
- 几何类型：各级数据均为 POLYGON（MultiPolygon）。

## 使用方法

1. **QGIS / ArcGIS**：解压后直接「添加矢量图层」加载 `.shp`，按 `TYPE_1` 区分一级类型，按 `TYPE_2` 对二级分级设色；与人口 / 经济表通过 `NAME_2` 或 `ISO_1` 做表连接即可出专题图。
2. **Python 空间分析**：`geopandas.read_file("gadm41_{cc.upper()}_1.shp")` 读取，配合 `geopandas.sjoin` 把站点 / 网格数据挂到行政区，或用 `dissolve(by="NAME_1")` 聚合到一级。
3. **WebGIS**：经 `ogr2ogr` 转 GeoJSON / MBTiles 后接入 MapLibre / Leaflet，做可点选的行政区划查询。

## 使用须知

- GADM 数据采用其自有许可：**免费用于学术研究与其他非商业用途**；嵌入商业产品或对外再分发请查阅 GADM 官网许可条款并自行确认。
- 本数据由国外项目整理，**界线画法不代表任何立场**；涉及中国疆域的正式制图请使用自然资源部标准地图服务提供的官方数据。数据亦未标注任何审图号，公开使用请遵守《地图管理条例》。
- WGS84 与国内正式出图常用的 CGCS2000 存在厘米级差异，正式成果建议先行转换核对。
{disc_block}
## 适用场景

{m['zh']}区域地理教学、各级行政区划的人口 / 经济 / 生态专题制图、空间插值与区域统计、遥感影像行政区裁剪、跨国研究中的统一行政框架对齐等。

## 在线互动地图

本数据集已做成可交互的在线地图，支持分级着色、逐点查询与移动端浏览：

- [{m['zh']}行政区划互动地图](/maps/{slug})
'''


# ── 主流程 ────────────────────────────────────────────────
def process(cc, m):
    slug = m["slug"]
    CC = cc.upper()
    d = os.path.join(BASE, f"gadm41_{CC}_shp")
    if not os.path.exists(d):
        print(f"!! {slug}: 源目录不存在 {d}")
        return None
    out_dir = os.path.join(ROOT, "public", "maps", slug, "data")
    os.makedirs(out_dir, exist_ok=True)

    dbf1 = read_dbf(os.path.join(d, f"gadm41_{CC}_1.dbf"))
    recs1 = read_shp(os.path.join(d, f"gadm41_{CC}_1.shp"))
    ext_xs = []; ext_ys = []
    for rings in recs1:
        for r in rings:
            for x, y in r:
                ext_xs.append(x); ext_ys.append(y)
    country_extent = max((max(ext_xs) - min(ext_xs)), (max(ext_ys) - min(ext_ys))) if ext_xs else 0.0

    fc1 = {"type": "FeatureCollection", "features": []}
    for row, rings in zip(dbf1, recs1):
        gid = row.get("GID_1")
        if not gid or gid == "NA":
            continue
        geom = build_geojson(rings, extent=country_extent, nd=5)
        if not geom:
            continue
        eng = (row.get("ENGTYPE_1") or "").strip()
        gzh = ENGTYPE_ZH7.get(eng.lower()) or ENGTYPE_ZH.get(eng.lower(), eng if eng else "其他")
        name = row.get("NAME_1") or row.get("VARNAME_1") or gid
        if gzh == "Water body":
            continue
        if name == "NA":
            name = gid
        nl = row.get("NL_NAME_1")
        if not nl or nl == "NA" or nl == name:
            nl = name
        fc1["features"].append({"type": "Feature", "properties": {
            "gid": gid, "name": name, "nameEn": name, "nameLocal": nl,
            "type": eng, "typeEn": eng, "groupZh": gzh,
            "area": round(feat_area_km2(geom), 1),
            "iso": row.get("ISO_1") or "", "engtype": eng,
            "capital": "", "pop": None, "blurb": ""
        }, "geometry": geom})

    l1_by_prefix = {}
    for f in fc1["features"]:
        gid = f["properties"]["gid"]
        parts = gid.split(".")
        if len(parts) >= 2:
            l1_by_prefix[parts[0] + "." + parts[1]] = f["properties"]["name"]

    fc2 = {"type": "FeatureCollection", "features": []}
    dbf2_path = os.path.join(d, f"gadm41_{CC}_2.dbf")
    if os.path.exists(dbf2_path):
        dbf2 = read_dbf(dbf2_path)
        recs2 = read_shp(os.path.join(d, f"gadm41_{CC}_2.shp"))
        for row, rings in zip(dbf2, recs2):
            gid = row.get("GID_2")
            if not gid or gid == "NA":
                continue
            eng2 = str(row.get("ENGTYPE_2") or "").strip()
            if eng2.lower() in DROP_L2_ENGTYPE:
                continue
            geom = build_geojson(rings, extent=country_extent, nd=5)
            if not geom:
                continue
            parts = gid.split(".")
            key = parts[0] + "." + parts[1] if len(parts) >= 2 else ""
            prov = l1_by_prefix.get(key, "—")
            fc2["features"].append({"type": "Feature", "properties": {
                "gid": gid, "name2": row.get("NAME_2") or "—",
                "engtype2": eng2, "type2": str(row.get("TYPE_2") or ""),
                "provZh": prov}, "geometry": geom})

    p1 = os.path.join(out_dir, "provinces.geojson")
    p2 = os.path.join(out_dir, "districts.geojson")
    # 中方主张领土合规裁剪：阿克赛钦/喀喇昆仑走廊等中国主张领土不得出现在他国矢量内
    try:
        from km_claims import clip_feature_collection
        n1 = clip_feature_collection(fc1, verbose=False, tag=f"{CC} L1")
        n2 = clip_feature_collection(fc2, verbose=False, tag=f"{CC} L2")
        if n1 or n2:
            for f in fc1["features"] + fc2["features"]:
                try:
                    f["properties"]["area"] = feat_area_km2(f["geometry"])
                except Exception:
                    pass
            print(f"  [km-claims] {CC}: L1 裁剪 {n1} / L2 裁剪 {n2} 个要素（中方主张领土合规）")
    except ImportError:
        print("  [warn] 未找到 km_claims（需 shapely），跳过中方主张领土裁剪")
    json.dump(fc1, open(p1, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    json.dump(fc2, open(p2, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    s1 = os.path.getsize(p1) / 1e6; s2 = os.path.getsize(p2) / 1e6

    L1n = len(fc1["features"]); L2n = len(fc2["features"])
    l3n = 0
    dbf3_path = os.path.join(d, f"gadm41_{CC}_3.dbf")
    if os.path.exists(dbf3_path):
        l3n = len(read_dbf(dbf3_path))
    area_total = sum(f["properties"]["area"] for f in fc1["features"])
    groups = {}
    for f in fc1["features"]:
        groups[f["properties"]["groupZh"]] = groups.get(f["properties"]["groupZh"], 0) + 1
    group_colors = {g: GROUP_PALETTE[i % len(GROUP_PALETTE)] for i, g in enumerate(groups)}

    allpts = []
    for f in fc1["features"]:
        allpts += all_points(f["geometry"])
    lats = [p[1] for p in allpts]
    median_lon = pct([p[0] for p in allpts], 0.5)
    unw = unwrap_lons([p[0] for p in allpts], median_lon)
    cx = wrap(sum(unw) / len(unw))
    cy = sum(lats) / len(lats)
    lo_lon = pct(unw, 0.01); hi_lon = pct(unw, 0.99)
    lo_lat = pct(lats, 0.01); hi_lat = pct(lats, 0.99)
    bnd = [wrap(lo_lon), lo_lat, wrap(hi_lon), hi_lat]
    extent = bnd[:]
    view = [cx, cy, 4.2, 2.5]

    map_dir = os.path.join(ROOT, "public", "maps", slug)
    js_dir = os.path.join(map_dir, "js"); os.makedirs(js_dir, exist_ok=True)
    os.makedirs(os.path.join(ROOT, "content", "works"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "content", "downloads"), exist_ok=True)
    open(os.path.join(js_dir, "config.js"), "w", encoding="utf-8").write(
        make_config_js(m, slug, view, bnd, extent, group_colors))
    open(os.path.join(map_dir, "index.html"), "w", encoding="utf-8").write(
        make_index_html(m, slug, L1n, L2n, True))
    open(os.path.join(ROOT, "content", "works", f"{slug}.md"), "w", encoding="utf-8").write(
        make_works_md(m, slug, L1n, L2n, area_total, True))
    zip_path = os.path.join(BASE, f"gadm41_{CC}_shp.zip")
    zip_bytes = os.path.getsize(zip_path) if os.path.exists(zip_path) else 0
    open(os.path.join(ROOT, "content", "downloads", f"gadm41-{cc}-shp.md"), "w", encoding="utf-8").write(
        make_downloads_md(m, slug, cc, L1n, L2n, area_total, zip_bytes, l3n))

    grp_str = "; ".join(f"{g}×{n}" for g, n in groups.items())
    print(f"### {slug} | {m['zh']} ({CC})")
    print(f"  L1={L1n}  L2={L2n}  L3={l3n}  面积≈{area_total/1e4:.1f}万km²")
    print(f"  provinces.geojson={s1:.2f}MB  districts.geojson={s2:.2f}MB  zip={zip_bytes/1e6:.2f}MB")
    print(f"  分组: {grp_str}")
    print(f"  view=[{cx:.3f},{cy:.3f},{view[2]},{view[3]}]  bounds=[{bnd[0]:.2f},{bnd[1]:.2f},{bnd[2]:.2f},{bnd[3]:.2f}]")
    print()
    return dict(slug=slug, zh=m["zh"], cc=cc, L1n=L1n, L2n=L2n, area=area_total,
                s1=s1, s2=s2, groups=groups, view=view, bnd=bnd, group_colors=group_colors)


def append_vizmaps(results):
    vp = os.path.join(ROOT, "src", "data", "vizmaps.json")
    data = json.load(open(vp, encoding="utf-8"))
    existing = {m["slug"] for m in data["maps"]}
    added = 0
    for r in results:
        if not r or r["slug"] in existing:
            continue
        cc = r["cc"].upper()
        entry = {
            "slug": r["slug"],
            "entry": f"/maps/{r['slug']}/index.html",
            "bbox": [round(x, 2) for x in r["bnd"]],
            "crs": "WGS84 / EPSG:4326（与 Esri 全球影像底图对齐，无需坐标偏移；不叠加 GCJ-02 底图）",
            "basemap": "Esri World Imagery 卫星影像（server.arcgisonline.com，默认，按专题压暗）/ Esri World Shaded Relief 地形晕渲 / 深色无底图；高德瓦片只覆盖中国，境外空白故不用",
            "source": f"GADM 4.1（gadm41_{cc}_shp，WGS84 / EPSG:4326，公开数据）：{r['L1n']} 个一级行政区（{r['zh']}）边界 + {r['L2n']} 个二级区划。中文名 / 首府 / 人口为人工整理近似值；面积由几何球面实算。",
            "updated": "2026-10-11",
            "data": [
                {"file": f"maps/{r['slug']}/data/provinces.geojson", "features": r["L1n"], "unit": "个一级行政区",
                 "desc": f"{r['L1n']} 个一级行政区边界；属性含中文名 / 英文名 / 首府 / 人口 / 几何实算面积 / 行政区类型"},
                {"file": f"maps/{r['slug']}/data/districts.geojson", "features": r["L2n"], "unit": "个二级区划",
                 "desc": f"{r['L2n']} 个二级区划边界，可作为叠加图层查看最基层行政区划；属性含所属一级中文名"}
            ]
        }
        data["maps"].append(entry)
        added += 1
    json.dump(data, open(vp, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"vizmaps.json 追加 {added} 条（总计 {len(data['maps'])}）")


if __name__ == "__main__":
    print("=" * 60)
    results = []
    for cc in ORDER:
        try:
            results.append(process(cc, META[cc]))
        except Exception as e:
            import traceback; traceback.print_exc()
            print(f"!! {cc} 失败: {e}")
    append_vizmaps(results)
    print("=" * 60)
    print("DONE. 机械层生成完毕（中文名/首府/人口/看点 待 enrich_seven_regions.py 回填）。")
