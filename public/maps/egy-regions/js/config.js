/* 埃及行政区划互动地图 · 表现层配置
   数据：scripts/convert_gadm_egy.py 从 GADM 4.1（gadm41_EGY_shp）转换生成
        - governorates.geojson  27 个省（Muhafazah），含中文名/首府/人口/面积/看点
        - districts.geojson     342 个区（Markaz）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口 / 面积（log 沙金分级）/ 四大区域（分类色），沙金色呼应撒哈拉。 */
window.MAP_CONFIG = {
  slug: 'egy-regions',
  view: { center: [30.5, 26.8], zoom: 4.4, minZoom: 3, maxZoom: 11 },
  bounds: [24.5, 21.5, 36.5, 32.0],
  boundsMobile: [24.5, 21.5, 36.5, 32.0],
  extent: [24.5, 21.5, 36.5, 32.0],
  graticuleStep: 5,

  basemaps: {
    img: { tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    vec: { tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}' }
  },
  imgAttr: 'Esri World Imagery',
  vecAttr: 'Esri World Shaded Relief',

  /* 卫星影像下把色块压暗，让沙金分级在影像上不发飘 */
  imgPaint: {
    'raster-brightness-max': 0.58,
    'raster-brightness-min': 0.06,
    'raster-saturation': -0.40,
    'raster-contrast': 0.08
  },

  /* 沙金分级（浅沙→深赭） */
  RAMP: ['#f3dfa5', '#e8c37a', '#d9a441', '#c1852c', '#a16519', '#7d4a10', '#5c340a'],

  /* 四大区域配色 */
  GROUP_COLORS: {
    '大开罗':              '#dc2626',
    '下埃及 · 三角洲与运河': '#16a34a',
    '上埃及 · 尼罗河谷':    '#d97706',
    '沙漠与边疆省':         '#7c3aed'
  },

  METRICS: {
    pop:    { key: 'pop',  label: '人口',  unit: '人',   hint: '公开估计（约值，人工整理）' },
    area:   { key: 'area', label: '面积',  unit: 'km²', hint: '面积由 GADM 几何球面实算' },
    group:  { key: 'groupZh', label: '区域', unit: '区域', hint: '大开罗 / 下埃及 / 上埃及 / 沙漠与边疆' }
  },

  DATA: {
    main: 'data/governorates.geojson',
    sub: 'data/districts.geojson'
  },

  TEXT: {
    groupSuffix: '分组',
    capitalLabel: '省会',
    mainLabel: '省',
    subRole: '区（Markaz）',
    subDesc: '区（Markaz，مركز）是埃及省之下的基本行政单位，全国 340 余个，每区辖若干城镇与乡村中心。',
    notes: {
      pop: '按<b>人口</b>着色。大开罗三省（开罗、吉萨、盖勒尤卜）合计约 2,500 万人，是非洲与阿拉伯世界最大的都会区。',
      area: '按<b>面积</b>着色。新河谷省一家就占国土约四成，而开罗、杜姆亚特等城市省在图上几乎找不到。',
      group: '按<b>四大区域</b>着色。尼罗河谷与三角洲集中了全国 95% 以上的人口，而国土的大头属于东西两侧的沙漠省。'
    }
  }
};
