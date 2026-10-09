/* 新西兰行政区划互动地图 · 表现层配置
   数据：scripts/gen_six_regions.py 从 GADM 4.1（gadm41_NZL_shp）转换生成
        - provinces.geojson  大区 / 群岛（L1）
        - districts.geojson  地方当局（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（普查 / 官方估计）/ 面积（几何实算）/ 行政区类型。 */
window.MAP_CONFIG = {
  slug: 'nzl-regions',
  defaultMetric: 'pop',
  view: { center: [173.14454069393872, -40.80493296209038], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [166.0994, -50.8517, 180, -34.528],
  boundsMobile: [166.0994, -50.8517, 180, -34.528],
  extent: [166.0994, -50.8517, 180, -34.528],
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

  /* 顺序色阶（由 新西兰主色生成） */
  RAMP: ["#d8efec", "#b6d9d6", "#94c4c0", "#72afaa", "#509994", "#2e847e", "#0c6f68"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '大区': '#e6194b',
    '领地': '#3cb44b',
    '群岛': '#4363d8'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '人口为该行政区最近一次普查 / 官方估计（约值）' },
    area:   { key: 'area', label: '面积', unit: 'km²', hint: '面积由 GADM 几何球面实算（约值）' },
    group:  { key: 'groupZh', label: '类型', unit: '类型', hint: '行政区类型（GADM ENGTYPE 映射）' }
  },

  DATA: {
    main: 'data/provinces.geojson',
    sub: 'data/districts.geojson'
  },

  TEXT: {
    groupSuffix: '类型',
    capitalLabel: '首府',
    mainLabel: '大区 / 领地',
    subRole: '地方当局',
    subDesc: '地方当局是大区之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：奥克兰大区独占全国约三分之一人口，南岛西海岸与南方群岛则人烟稀少。',
      area: '按<b>面积</b>着色：南岛的南方区、坎特伯雷等大区辽阔多山，北岛北地等则相对小巧。',
      group: '按<b>行政区类型</b>着色：大区、领地与外岛区域一目了然。'
    }
  }
};
