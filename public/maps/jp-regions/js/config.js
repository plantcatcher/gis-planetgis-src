/* 日本行政区划互动地图 · 表现层配置
   数据：scripts/convert_gadm_jpn.py 从 GADM 4.1（gadm41_JPN_shp）转换生成
        - prefectures.geojson   47 个一级行政区（都道府県），含汉字名/类型/所属地方/县厅/人口/面积/看点
        - municipalities.geojson 1811 个二级行政区（市町村）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（2020 国势调查）/ 面积（km²）/ 所属 8 地方（地方区分），红色分级呼应「日本」。 */
window.JP_CONFIG = {
  /* 默认停在日本列岛；minZoom 3 给总览留余地 */
  view: { center: [138, 37], zoom: 4.1, minZoom: 3, maxZoom: 11 },
  bounds: [122, 24, 154, 46],
  boundsMobile: [128, 28, 148, 46],
  extent: [122, 24, 154, 46],
  graticuleStep: 5,

  basemaps: {
    img: { tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    vec: { tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}' }
  },
  imgAttr: 'Esri World Imagery',
  vecAttr: 'Esri World Shaded Relief',

  /* 卫星影像下把色块压暗，让红色分级在影像上不发飘 */
  imgPaint: {
    'raster-brightness-max': 0.58,
    'raster-brightness-min': 0.06,
    'raster-saturation': -0.40,
    'raster-contrast': 0.08
  },

  /* 红色分级（朱→深红），低端用饱和的朱红而非浅粉，保证在卫星影像上也看得清 */
  RAMP: ['#f6a583', '#ee7f5e', '#e15a41', '#c93b2b', '#a9281f', '#841a15', '#5d100c'],

  /* 8 地方（地方区分）配色 —— 分类着色用 */
  REGION_COLORS: {
    '北海道': '#2563eb',
    '東北':   '#16a34a',
    '関東':   '#dc2626',
    '中部':   '#d97706',
    '近畿':   '#7c3aed',
    '中国':   '#0891b2',
    '四国':   '#db2777',
    '九州':   '#65a30d'
  },

  METRICS: {
    pop:    { key: 'pop',  label: '人口',  unit: '人',   hint: '2020 年国势调查（总务省）' },
    area:   { key: 'area', label: '面积',  unit: 'km²', hint: '行政区划面积（约）' },
    region: { key: 'regionZh', label: '地方', unit: '地方区分', hint: '8 地方（地方区分）' }
  }
};
