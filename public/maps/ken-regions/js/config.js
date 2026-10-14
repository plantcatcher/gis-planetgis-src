/* 肯尼亚行政区划互动地图 · 表现层配置
   数据：scripts/gen_top12_regions.py 从 GADM 4.1（gadm41_KEN_shp）转换生成
        - provinces.geojson  郡（L1）
        - districts.geojson  选区/分区（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'ken-regions',
  defaultMetric: 'pop',
  view: { center: [37.096928938730855, -0.2901009562363238], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [34.08998, -4.50125, 41.26708, 4.09249],
  boundsMobile: [34.08998, -4.50125, 41.26708, 4.09249],
  extent: [34.08998, -4.50125, 41.26708, 4.09249],
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

  /* 顺序色阶（由 肯尼亚主色生成） */
  RAMP: ["#d7ece2", "#b4d4c6", "#92bdab", "#70a68f", "#4d8f74", "#2b7858", "#09613d"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '郡': '#e6194b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '肯尼亚各郡人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '郡',
    subRole: '选区/分区',
    subDesc: '选区/分区是郡之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：内罗毕、基安布等中部高地郡密集，东北部与北部干旱郡人烟极稀。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。'
    }
  }
};
