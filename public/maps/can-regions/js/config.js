/* 加拿大行政区划互动地图 · 表现层配置
   数据：scripts/gen_six_regions.py 从 GADM 4.1（gadm41_CAN_shp）转换生成
        - provinces.geojson  省 / 领地（L1）
        - districts.geojson  普查分区（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（普查 / 官方估计）/ 面积（几何实算）/ 行政区类型。 */
window.MAP_CONFIG = {
  slug: 'can-regions',
  defaultMetric: 'pop',
  view: { center: [-87.86039802907685, 64.66102311824106], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [-135.3714, 44.7356, -53.96, 82.4812],
  boundsMobile: [-135.3714, 44.7356, -53.96, 82.4812],
  extent: [-135.3714, 44.7356, -53.96, 82.4812],
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

  /* 顺序色阶（由 加拿大主色生成） */
  RAMP: ["#dce6f6", "#bbcbe5", "#9bb1d4", "#7b96c3", "#5b7cb2", "#3b61a1", "#1b4790"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '省': '#e6194b',
    '地区': '#3cb44b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '人口为该行政区最近一次普查 / 官方估计（约值）' },
    area:   { key: 'area', label: '面积', unit: 'km²', hint: '面积由 GADM 几何球面实算（约值）' },
    group:  { key: 'groupZh', label: '类型', unit: '类型', hint: '行政区类型（GADM ENGTYPE 映射）' }
  },

  DATA: {
    main: 'data/provinces.geojson',
    sub: 'data/districts.geojson'
  },

  TEXT: {
    groupSuffix: '类型',
    capitalLabel: '省会',
    mainLabel: '省 / 地区',
    subRole: '普查分区',
    subDesc: '普查分区是省之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：安大略、魁北克、不列颠哥伦比亚三省集中全国近四分之三人口，北方的努纳武特、西北地区则地广人稀。',
      area: '按<b>面积</b>着色：努纳武特、魁北克、西北领地三个北方单位占了国土近七成，而人口密集的安大略、魁北克南部只是东南一角。',
      group: '按<b>行政区类型</b>着色：10 个省与 3 个地区一目了然。'
    }
  }
};
