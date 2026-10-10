/* 朝鲜行政区划互动地图 · 表现层配置
   数据：scripts/gen_twelve_regions.py 从 GADM 4.1（gadm41_PRK_shp）转换生成
        - provinces.geojson  道 / 特别市（L1）
        - districts.geojson  郡/市（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'prk-regions',
  defaultMetric: 'pop',
  view: { center: [126.86900376956287, 39.74235832164058], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [124.30792, 37.75237, 130.46448, 42.71139],
  boundsMobile: [124.30792, 37.75237, 130.46448, 42.71139],
  extent: [124.30792, 37.75237, 130.46448, 42.71139],
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

  /* 顺序色阶（由 朝鲜主色生成） */
  RAMP: ["#f4dfdd", "#e1c0be", "#cfa29f", "#bc8480", "#aa6661", "#974842", "#852a24"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '省': '#e6194b',
    'Special Administrative Region': '#3cb44b',
    '特别市': '#4363d8',
    'Directly Governed City': '#f58231'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '朝鲜各道 / 特别市人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '道 / 特别市',
    subRole: '郡/市',
    subDesc: '郡/市是道 / 特别市之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：平壤与黄海南北道等西部省份人口集中，北部山区与东北部则相对稀疏。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。'
    }
  }
};
