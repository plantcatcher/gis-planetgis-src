/* 伊拉克行政区划互动地图 · 表现层配置
   数据：scripts/gen_seven_regions.py 从 GADM 4.1（gadm41_IRQ_shp）转换生成
        - provinces.geojson  省（L1）
        - districts.geojson  区（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'irq-regions',
  defaultMetric: 'pop',
  view: { center: [44.752730832745236, 33.8600894283698], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [40.0321, 29.47583, 48.17046, 37.31776],
  boundsMobile: [40.0321, 29.47583, 48.17046, 37.31776],
  extent: [40.0321, 29.47583, 48.17046, 37.31776],
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

  /* 顺序色阶（由 伊拉克主色生成） */
  RAMP: ["#f1e5da", "#dccaba", "#c7b09a", "#b2957a", "#9d7b5a", "#88603a", "#74461a"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '省': '#e6194b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '伊拉克各省人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '省',
    subRole: '区',
    subDesc: '区是省之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：巴格达省一省独大，巴士拉、尼尼微（摩苏尔）次之，西部的安巴尔省面积最大却人口稀疏。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 特别市 / 联邦直辖区 / 直管区等一目了然。'
    }
  }
};
