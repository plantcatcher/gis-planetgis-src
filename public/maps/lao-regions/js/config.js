/* 老挝行政区划互动地图 · 表现层配置
   数据：scripts/gen_top12_regions.py 从 GADM 4.1（gadm41_LAO_shp）转换生成
        - provinces.geojson  省 / 直辖市 / 特别区（L1）
        - districts.geojson  县（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'lao-regions',
  defaultMetric: 'pop',
  view: { center: [103.94052616585704, 18.28741242886884], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [100.40813, 14.1205, 107.56072, 22.38445],
  boundsMobile: [100.40813, 14.1205, 107.56072, 22.38445],
  extent: [100.40813, 14.1205, 107.56072, 22.38445],
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

  /* 顺序色阶（由 老挝主色生成） */
  RAMP: ["#fae3e2", "#eac7c6", "#daabab", "#ca8f8f", "#ba7374", "#aa5758", "#9a3b3d"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '省': '#e6194b',
    '直辖市': '#3cb44b',
    '特别区': '#4363d8'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '老挝各省 / 直辖市 / 特别区人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '省 / 直辖市 / 特别区',
    subRole: '县',
    subDesc: '县是省 / 直辖市 / 特别区之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：万象直辖市与湄公河沿岸的沙湾拿吉、占巴塞等省份密集，北部丰沙里、华潘等山地省份明显偏疏。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。'
    }
  }
};
