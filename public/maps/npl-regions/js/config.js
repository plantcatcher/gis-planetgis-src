/* 尼泊尔行政区划互动地图 · 表现层配置
   数据：scripts/gen_top12_regions.py 从 GADM 4.1（gadm41_NPL_shp）转换生成
        - provinces.geojson  发展区（L1）
        - districts.geojson  行政区（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'npl-regions',
  defaultMetric: 'pop',
  view: { center: [83.83669060287082, 28.40067203349282], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [80.24992, 26.40529, 88.13769, 30.37841],
  boundsMobile: [80.24992, 26.40529, 88.13769, 30.37841],
  extent: [80.24992, 26.40529, 88.13769, 30.37841],
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

  /* 顺序色阶（由 尼泊尔主色生成） */
  RAMP: ["#ddeade", "#bdd1bf", "#9eb9a1", "#7fa183", "#608865", "#417047", "#225829"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '发展区': '#e6194b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '尼泊尔各发展区人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '发展区',
    subRole: '行政区',
    subDesc: '行政区是发展区之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：中部（含加德满都谷地的发展区）极度密集，西部与远西部发展区明显偏疏。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。'
    }
  }
};
