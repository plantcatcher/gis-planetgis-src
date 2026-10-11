/* 埃塞俄比亚行政区划互动地图 · 表现层配置
   数据：scripts/gen_seven_regions.py 从 GADM 4.1（gadm41_ETH_shp）转换生成
        - provinces.geojson  民族州 / 特别市（L1）
        - districts.geojson  专区（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'eth-regions',
  defaultMetric: 'pop',
  view: { center: [38.1765632945591, 9.464378836772983], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [33.21722, 3.64698, 43.09826, 14.59843],
  boundsMobile: [33.21722, 3.64698, 43.09826, 14.59843],
  extent: [33.21722, 3.64698, 43.09826, 14.59843],
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

  /* 顺序色阶（由 埃塞俄比亚主色生成） */
  RAMP: ["#f6eee0", "#e4d7c2", "#d2c1a5", "#c0ab88", "#ae956b", "#9c7f4e", "#8a6931"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '特别市': '#e6194b',
    '州': '#3cb44b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '埃塞俄比亚各民族州 / 特别市人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '民族州 / 特别市',
    subRole: '专区',
    subDesc: '专区是民族州 / 特别市之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：奥罗米亚与阿姆哈拉两大高原州人口最多，首都亚的斯亚贝巴面积最小却密度最高，东南索马里州与西南低地则明显稀疏。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 特别市 / 联邦直辖区 / 直管区等一目了然。'
    }
  }
};
