/* 印度尼西亚行政区划互动地图 · 表现层配置
   数据：scripts/gen_four_regions.py 从 GADM 4.1（gadm41_IDN_shp）转换生成
        - provinces.geojson  省（L1）
        - districts.geojson  县/市（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'idn-regions',
  defaultMetric: 'pop',
  view: { center: [118.1076189299183, -2.355613783783784], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [96.40422, -10.13418, 139.04727, 4.40325],
  boundsMobile: [96.40422, -10.13418, 139.04727, 4.40325],
  extent: [96.40422, -10.13418, 139.04727, 4.40325],
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

  /* 顺序色阶（由 印度尼西亚主色生成） */
  RAMP: ["#f5dcdd", "#e2bcbe", "#cf9ca0", "#bd7d81", "#aa5d63", "#973d44", "#851e26"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '省': '#e6194b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '印度尼西亚各省人口（最近普查 / 官方估计，约值）' },
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
    subRole: '县/市',
    subDesc: '县/市是省之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：爪哇岛的西爪哇、东爪哇与中爪哇三省深不见底，加里曼丹与巴布亚的省份则地广人稀。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：省 / 邦 / 中央直辖区等一目了然。'
    }
  }
};
