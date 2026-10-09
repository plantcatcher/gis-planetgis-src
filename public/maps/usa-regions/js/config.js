/* 美国行政区划互动地图 · 表现层配置
   数据：scripts/gen_six_regions.py 从 GADM 4.1（gadm41_USA_shp）转换生成
        - provinces.geojson  州 / 联邦区 / 领地（L1）
        - districts.geojson  县（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（普查 / 官方估计）/ 面积（几何实算）/ 行政区类型。 */
window.MAP_CONFIG = {
  slug: 'usa-regions',
  defaultMetric: 'pop',
  view: { center: [-116.50201668726059, 46.77815379957988], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [-177.6939, 24.7221, -68.2367, 70.8313],
  boundsMobile: [-177.6939, 24.7221, -68.2367, 70.8313],
  extent: [-177.6939, 24.7221, -68.2367, 70.8313],
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

  /* 顺序色阶（由 美国主色生成） */
  RAMP: ["#f4dfdd", "#e1c0be", "#cfa29f", "#bc8480", "#aa6661", "#974842", "#852a24"],

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
    subRole: '县',
    subDesc: '县是州之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：加利福尼亚、得克萨斯、佛罗里达三州人口最多，东北新英格兰诸州则小巧密集。',
      area: '按<b>面积</b>着色：阿拉斯加、得克萨斯、加利福尼亚等西部大州辽阔，东北新英格兰诸州与特区则小巧密集。',
      group: '按<b>行政区类型</b>着色：50 个州与 1 个联邦区一目了然。'
    }
  }
};
