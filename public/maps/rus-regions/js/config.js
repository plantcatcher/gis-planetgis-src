/* 俄罗斯行政区划互动地图 · 表现层配置
   数据：scripts/gen_six_regions.py 从 GADM 4.1（gadm41_RUS_shp）转换生成
        - provinces.geojson  联邦主体（L1）
        - districts.geojson  区 / 市（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（普查 / 官方估计）/ 面积（几何实算）/ 行政区类型。 */
window.MAP_CONFIG = {
  slug: 'rus-regions',
  defaultMetric: 'pop',
  view: { center: [91.27690146689102, 63.34735754528358], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [29.0101, 43.0204, 180, 81.0599],
  boundsMobile: [29.0101, 43.0204, 180, 81.0599],
  extent: [29.0101, 43.0204, 180, 81.0599],
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

  /* 顺序色阶（由 俄罗斯主色生成） */
  RAMP: ["#dde5f1", "#bdcadd", "#9dafc9", "#7e94b5", "#5e79a1", "#3e5e8d", "#1f4479"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '共和国': '#e6194b',
    '边疆区': '#3cb44b',
    '州': '#4363d8',
    '自治区': '#f58231',
    '自治州': '#911eb4',
    '直辖市': '#42d4f4'
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
    mainLabel: '联邦主体',
    subRole: '区 / 市',
    subDesc: '区 / 市是联邦主体之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：莫斯科市与莫斯科州合计超过 2100 万，广袤的西伯利亚与远东则地广人稀。',
      area: '按<b>面积</b>着色：萨哈（雅库特）、克拉斯诺亚尔斯克等西伯利亚单位大得惊人，莫斯科、圣彼得堡等欧洲部分则只是弹丸之地。',
      group: '按<b>行政区类型</b>着色：共和国、边疆区、州、自治区、自治州与直辖市六类一目了然。'
    }
  }
};
