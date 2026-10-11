/* 伊朗行政区划互动地图 · 表现层配置
   数据：scripts/gen_seven_regions.py 从 GADM 4.1（gadm41_IRN_shp）转换生成
        - provinces.geojson  省（L1）
        - districts.geojson  县（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'irn-regions',
  defaultMetric: 'pop',
  view: { center: [52.193831535, 32.950292375], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [44.33904, 25.36847, 61.83245, 39.28645],
  boundsMobile: [44.33904, 25.36847, 61.83245, 39.28645],
  extent: [44.33904, 25.36847, 61.83245, 39.28645],
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

  /* 顺序色阶（由 伊朗主色生成） */
  RAMP: ["#dfe4ef", "#c0c8da", "#a2adc6", "#8492b1", "#66779d", "#485c88", "#2a4174"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '省': '#e6194b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '伊朗各省人口（最近普查 / 官方估计，约值）' },
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
    subRole: '县',
    subDesc: '县是省之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：德黑兰一省独大（首都圈聚集千万级人口），伊斯法罕、法尔斯、拉扎维呼罗珊次之，东南的锡斯坦-俾路支斯坦与中部沙漠省份稀疏。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 特别市 / 联邦直辖区 / 直管区等一目了然。'
    }
  }
};
