/* 巴西行政区划互动地图 · 表现层配置
   数据：scripts/gen_six_regions.py 从 GADM 4.1（gadm41_BRA_shp）转换生成
        - provinces.geojson  州 / 联邦区（L1）
        - districts.geojson  市镇（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（普查 / 官方估计）/ 面积（几何实算）/ 行政区类型。 */
window.MAP_CONFIG = {
  slug: 'bra-regions',
  defaultMetric: 'pop',
  view: { center: [-49.96362685570072, -12.369557972090261], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [-72.5848, -30.4693, -35.4701, 3.926],
  boundsMobile: [-72.5848, -30.4693, -35.4701, 3.926],
  extent: [-72.5848, -30.4693, -35.4701, 3.926],
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

  /* 顺序色阶（由 巴西主色生成） */
  RAMP: ["#dbefe3", "#bad9c8", "#99c4ad", "#79ae92", "#589977", "#37835c", "#176e41"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '州': '#e6194b',
    '联邦区': '#3cb44b'
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
    capitalLabel: '首府',
    mainLabel: '州 / 联邦区',
    subRole: '市镇',
    subDesc: '市镇是州之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：圣保罗、米纳斯吉拉斯、里约热内卢三州合计接近全国四成，北部的亚马孙、罗赖马等州则地广人稀。',
      area: '按<b>面积</b>着色：亚马孙流域的帕拉、亚马逊、马托格罗索等州幅员惊人，里约热内卢、圣保罗等东南州则小得只剩沿海一溜。',
      group: '按<b>行政区类型</b>着色：26 个州与 1 个联邦区一目了然。'
    }
  }
};
