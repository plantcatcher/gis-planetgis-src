/* 蒙古国行政区划互动地图 · 表现层配置
   数据：scripts/convert_gadm_mng.py 从 GADM 4.1（gadm41_MNG_shp）转换生成
        - aimags.geojson  22 个省市级（21 省 + 首都乌兰巴托等）
        - sums.geojson    327 个苏木（Sum，含西里尔原名）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口 / 面积（log 草原绿分级）/ 四大自然区域（分类色）。 */
window.MAP_CONFIG = {
  slug: 'mng-regions',
  view: { center: [103.8, 46.8], zoom: 3.8, minZoom: 3, maxZoom: 10 },
  bounds: [87.5, 41.4, 120.2, 52.4],
  boundsMobile: [88.5, 41.8, 119.5, 52.2],
  extent: [87.5, 41.4, 120.2, 52.4],
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

  /* 草原绿分级（浅草→深林） */
  RAMP: ['#d9edc8', '#b9dd9f', '#95c978', '#6fb453', '#4f9738', '#3a7a27', '#295c1c'],

  /* 四大自然区域配色 */
  GROUP_COLORS: {
    '西部山区':  '#2563eb',
    '杭爱 · 中部': '#16a34a',
    '戈壁地带':  '#d97706',
    '东部草原':  '#dc2626'
  },

  METRICS: {
    pop:    { key: 'pop',  label: '人口',  unit: '人',   hint: '公开估计（约值，人工整理）' },
    area:   { key: 'area', label: '面积',  unit: 'km²', hint: '面积由 GADM 几何球面实算' },
    group:  { key: 'groupZh', label: '自然区域', unit: '区域', hint: '西部山区 / 杭爱中部 / 戈壁地带 / 东部草原' }
  },

  DATA: {
    main: 'data/aimags.geojson',
    sub: 'data/sums.geojson'
  },

  TEXT: {
    groupSuffix: '自然区域',
    capitalLabel: '省会',
    mainLabel: '省市',
    subRole: '苏木（Sum）',
    subDesc: '苏木（Sum，сум）是蒙古国省之下的基本行政单位，全国 330 余个，平均每个苏木不到 1,000 人——世界上最稀疏的基层区划之一。',
    notes: {
      pop: '按<b>人口</b>着色。乌兰巴托一市约占全国一半人口；戈壁省份反而地广人稀。',
      area: '按<b>面积</b>着色。南戈壁、东戈壁等戈壁省份最大，人口却最少——蒙古的「大」与「空」是同一件事。',
      group: '按<b>四大自然区域</b>着色：西部山区、杭爱中部、戈壁地带与东部草原，游牧经济沿此分带。'
    }
  }
};
