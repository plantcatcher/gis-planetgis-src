/* 以色列行政区划互动地图 · 表现层配置
   数据：scripts/gen_twelve_regions.py 从 GADM 4.1（gadm41_ISR_shp）转换生成
        - provinces.geojson  区（L1）
        - districts.geojson  无（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'isr-regions',
  defaultMetric: 'pop',
  view: { center: [35.1219728125, 32.187678323863636], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [34.4079, 29.56117, 35.86319, 33.31799],
  boundsMobile: [34.4079, 29.56117, 35.86319, 33.31799],
  extent: [34.4079, 29.56117, 35.86319, 33.31799],
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

  /* 顺序色阶（由 以色列主色生成） */
  RAMP: ["#dbedf2", "#bad6de", "#99bfcb", "#79a9b8", "#5892a5", "#377b92", "#17657f"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '区': '#e6194b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '以色列各区人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '区',
    subRole: '无',
    subDesc: '无是区之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：特拉维夫与中央区人口稠密，南部内盖夫沙漠区则极为稀疏。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。'
    }
  }
};
