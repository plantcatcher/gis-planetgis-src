/* 芬兰行政区划互动地图 · 表现层配置
   数据：scripts/gen_twelve_regions.py 从 GADM 4.1（gadm41_FIN_shp）转换生成
        - provinces.geojson  省（L1）
        - districts.geojson  次区（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'fin-regions',
  defaultMetric: 'pop',
  view: { center: [23.92601909375, 62.27409420238095], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [21.05261, 59.83931, 30.12895, 69.6852],
  boundsMobile: [21.05261, 59.83931, 30.12895, 69.6852],
  extent: [21.05261, 59.83931, 30.12895, 69.6852],
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

  /* 顺序色阶（由 芬兰主色生成） */
  RAMP: ["#dde7f8", "#bdcde7", "#9db3d7", "#7e9ac7", "#5e80b7", "#3e66a7", "#1f4d97"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '省': '#e6194b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '芬兰各省人口（最近普查 / 官方估计，约值）' },
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
    subRole: '次区',
    subDesc: '次区是省之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：赫尔辛基所在的南芬兰一省独大，北部拉普兰等地广人稀。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。'
    }
  }
};
