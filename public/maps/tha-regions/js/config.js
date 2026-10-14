/* 泰国行政区划互动地图 · 表现层配置
   数据：scripts/gen_top12_regions.py 从 GADM 4.1（gadm41_THA_shp）转换生成
        - provinces.geojson  府 / 直辖市（L1）
        - districts.geojson  县/区（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'tha-regions',
  defaultMetric: 'pop',
  view: { center: [100.90865397290641, 14.168958732758622], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [97.96329, 6.28868, 105.01164, 19.81128],
  boundsMobile: [97.96329, 6.28868, 105.01164, 19.81128],
  extent: [97.96329, 6.28868, 105.01164, 19.81128],
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

  /* 顺序色阶（由 泰国主色生成） */
  RAMP: ["#dde7f2", "#bdcdde", "#9db3cb", "#7e9ab8", "#5e80a5", "#3e6692", "#1f4d7f"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '省': '#e6194b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '泰国各府 / 直辖市人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '府 / 直辖市',
    subRole: '县/区',
    subDesc: '县/区是府 / 直辖市之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：曼谷及周边中部诸府人口高度密集，北部与东北部高原府县相对稀疏。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。'
    }
  }
};
