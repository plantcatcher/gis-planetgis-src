/* 越南行政区划互动地图 · 表现层配置
   数据：scripts/convert_gadm_vnm.py 从 GADM 4.1（gadm41_VNM_shp）转换生成
        - provinces.geojson  63 个省级行政区（57 省 + 6 直辖市）
        - districts.geojson  710 个县 / 郡 / 市社
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口 / 面积（log 红阶）/ 八大经济区（分类色）。
   合规：GADM 越南数据经实测不含西沙 / 南沙几何；转换脚本另设 SEA_BOXES
   兜底过滤，确保输出永不含相关几何。 */
window.MAP_CONFIG = {
  slug: 'vnm-regions',
  view: { center: [106.3, 16.2], zoom: 4.8, minZoom: 3.5, maxZoom: 11 },
  bounds: [102, 8.2, 109.7, 23.6],
  boundsMobile: [102.5, 8.4, 109.6, 23.4],
  extent: [102, 8.2, 109.7, 23.6],
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

  /* 红阶（稻金→深红） */
  RAMP: ['#f6c8a8', '#f0a583', '#e7835f', '#d96041', '#bd422a', '#962b1a', '#6f1a0d'],

  /* 八大经济区配色 */
  GROUP_COLORS: {
    '红河三角洲':   '#dc2626',
    '东北':        '#2563eb',
    '西北':        '#7c3aed',
    '北中部':      '#0891b2',
    '南中部':      '#16a34a',
    '西原':        '#d97706',
    '东南':        '#db2777',
    '湄公河三角洲': '#65a30d'
  },

  METRICS: {
    pop:    { key: 'pop',  label: '人口',  unit: '人',   hint: '2019 年普查口径（约值，人工整理）' },
    area:   { key: 'area', label: '面积',  unit: 'km²', hint: '面积由 GADM 几何球面实算' },
    group:  { key: 'groupZh', label: '大区', unit: '大区', hint: '越南官方八大经济区' }
  },

  DATA: {
    main: 'data/provinces.geojson',
    sub: 'data/districts.geojson'
  },

  TEXT: {
    groupSuffix: '大区',
    capitalLabel: '省会',
    mainLabel: '省市',
    subRole: '县 / 郡 / 市社',
    subDesc: '县（Huyện）、郡（Quận）与市社（Thị xã）是越南省市之下的基本行政单位，全国 700 余个。',
    notes: {
      pop: '按<b>人口</b>着色。胡志明市（约 900 万）与河内（约 825 万）双极领跑，红河与湄公河两大三角洲人口最密。',
      area: '按<b>面积</b>着色。义安是最大的省，胡志明市与河南、北宁等小省在图上几乎找不到。',
      group: '按<b>八大经济区</b>着色：红河三角洲与湄公河三角洲是两大粮仓与人海，西原与西北是山地高原。'
    }
  }
};
