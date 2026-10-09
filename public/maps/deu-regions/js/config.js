/* 德国行政区划互动地图 · 表现层配置
   数据：scripts/gen_six_regions.py 从 GADM 4.1（gadm41_DEU_shp）转换生成
        - provinces.geojson  州（L1）
        - districts.geojson  行政区（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（普查 / 官方估计）/ 面积（几何实算）/ 行政区类型。 */
window.MAP_CONFIG = {
  slug: 'deu-regions',
  defaultMetric: 'pop',
  view: { center: [10.467468055873598, 51.48435198076483], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [6.118, 47.4954, 14.6816, 54.7443],
  boundsMobile: [6.118, 47.4954, 14.6816, 54.7443],
  extent: [6.118, 47.4954, 14.6816, 54.7443],
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

  /* 顺序色阶（由 德国主色生成） */
  RAMP: ["#f6ebda", "#e4d3b9", "#d2bb99", "#c0a479", "#ae8c59", "#9c7439", "#8a5d19"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '州': '#e6194b'
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
    mainLabel: '联邦州',
    subRole: '行政区',
    subDesc: '行政区是州之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：北莱茵-威斯特法伦、巴伐利亚、巴登-符腾堡三州人口最多，仅北威州就超过 1700 万。',
      area: '按<b>面积</b>着色：巴伐利亚、下萨克森等南部大州面积居前，柏林、汉堡、不莱梅三个城市州小到几乎只是一个点。',
      group: '按<b>行政区类型</b>着色：16 个联邦州。'
    }
  }
};
