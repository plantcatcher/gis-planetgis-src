/* 西班牙行政区划互动地图 · 表现层配置
   数据：scripts/convert_gadm_esp.py 从 GADM 4.1（gadm41_ESP_shp）转换生成
        - communities.geojson  18 个自治区（含 Ceuta y Melilla 合并要素）
        - provinces.geojson    52 个省
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口 / 面积（log 红阶）/ 五大区域（分类色），红金配色呼应西班牙。
   取景聚焦伊比利亚半岛主体（加那利在西 18°，全画幅会太小）。 */
window.MAP_CONFIG = {
  slug: 'esp-regions',
  view: { center: [-3.7, 40.2], zoom: 4.6, minZoom: 4.2, maxZoom: 11 },
  bounds: [-10, 35.5, 4.5, 44],
  boundsMobile: [-9.5, 36, 3.5, 43.8],
  extent: [-10, 35.5, 4.5, 44],
  graticuleStep: 5,

  basemaps: {
    img: { tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    vec: { tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}' }
  },
  imgAttr: 'Esri World Imagery',
  vecAttr: 'Esri World Shaded Relief',

  imgPaint: {
    'raster-brightness-max': 0.58,
    'raster-brightness-min': 0.06,
    'raster-saturation': -0.40,
    'raster-contrast': 0.08
  },

  /* 弗拉门戈红阶 */
  RAMP: ['#f7b49a', '#f08d6e', '#e4674b', '#cb442f', '#a72c1f', '#831b12', '#5e100b'],

  /* 五大区域配色 */
  GROUP_COLORS: {
    '绿色西班牙 · 北部': '#16a34a',
    '中部高原 · 梅塞塔':  '#d97706',
    '地中海东岸':        '#0891b2',
    '安达卢西亚 · 南部':  '#dc2626',
    '海岛与北非飞地':     '#7c3aed'
  },

  METRICS: {
    pop:    { key: 'pop',  label: '人口',  unit: '人',   hint: 'INE 估计（约值，人工整理）' },
    area:   { key: 'area', label: '面积',  unit: 'km²', hint: '面积由 GADM 几何球面实算' },
    group:  { key: 'groupZh', label: '区域', unit: '区域', hint: '北部 / 梅塞塔 / 地中海 / 安达卢西亚 / 海岛飞地' }
  },

  DATA: {
    main: 'data/communities.geojson',
    sub: 'data/provinces.geojson'
  },

  TEXT: {
    groupSuffix: '分组',
    capitalLabel: '首府',
    mainLabel: '自治区',
    subRole: '省（Provincia）',
    subDesc: '省（Provincia）是自治区之下的传统划分，西班牙全国共 52 省；休达与梅利利亚两自治市不设省。',
    notes: {
      pop: '按<b>人口</b>着色。安达卢西亚与加泰罗尼亚是人口最多的自治区，马德里以一城之力挤进前三。',
      area: '按<b>面积</b>着色。卡斯蒂利亚-莱昂是最大自治区（约 9.4 万 km²），马德里反而只排第 12。',
      group: '按<b>五大区域</b>着色。绿色西班牙沿北大西洋，梅塞塔高原是骨架，地中海东岸与安达卢西亚各自成块。'
    }
  }
};
