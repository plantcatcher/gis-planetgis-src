/* 乌兹别克斯坦行政区划互动地图 · 表现层配置
   数据：scripts/gen_top12_regions.py 从 GADM 4.1（gadm41_UZB_shp）转换生成
        - provinces.geojson  州 / 共和国 / 市（L1）
        - districts.geojson  区（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'uzb-regions',
  defaultMetric: 'pop',
  view: { center: [66.95238961983472, 40.58740078512397], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [57.14855, 37.33596, 72.76207, 43.67339],
  boundsMobile: [57.14855, 37.33596, 72.76207, 43.67339],
  extent: [57.14855, 37.33596, 72.76207, 43.67339],
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

  /* 顺序色阶（由 乌兹别克斯坦主色生成） */
  RAMP: ["#dbe7f2", "#bacdde", "#99b4cb", "#799bb8", "#5881a5", "#376892", "#174f7f"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '州': '#e6194b',
    '自治共和国': '#3cb44b',
    '市': '#4363d8'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '乌兹别克斯坦各州 / 共和国 / 市人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '州 / 共和国 / 市',
    subRole: '区',
    subDesc: '区是州 / 共和国 / 市之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：塔什干市与费尔干纳盆地诸州密集，西部的卡拉卡尔帕克斯坦与克孜勒库姆沙漠州稀疏。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。'
    }
  }
};
