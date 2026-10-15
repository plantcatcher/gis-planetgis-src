/* 约旦行政区划互动地图 · 表现层配置
   数据：scripts/gen_top12_regions.py 从 GADM 4.1（gadm41_JOR_shp）转换生成
        - provinces.geojson  省（L1）
        - districts.geojson  区（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'jor-regions',
  defaultMetric: 'pop',
  view: { center: [36.03844732461356, 31.449525992865638], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [34.96764, 29.26401, 39.05772, 32.74732],
  boundsMobile: [34.96764, 29.26401, 39.05772, 32.74732],
  extent: [34.96764, 29.26401, 39.05772, 32.74732],
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

  /* 顺序色阶（由 约旦主色生成） */
  RAMP: ["#f4e9dd", "#e1d0be", "#cfb89f", "#bc9f80", "#aa8761", "#976e42", "#855624"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '省': '#e6194b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '约旦各省人口（最近普查 / 官方估计，约值）' },
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
      pop: '按<b>人口</b>着色：安曼、伊尔比德等西北部省份密集，南部与东部沙漠省（马安、亚喀巴周边）人口稀疏。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。'
    }
  }
};
