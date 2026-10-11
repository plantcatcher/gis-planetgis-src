/* 哈萨克斯坦行政区划互动地图 · 表现层配置
   数据：scripts/gen_seven_regions.py 从 GADM 4.1（gadm41_KAZ_shp）转换生成
        - provinces.geojson  州（L1）
        - districts.geojson  区（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'kaz-regions',
  defaultMetric: 'pop',
  view: { center: [66.70103487443392, 48.89329680526966], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [47.40833, 41.24948, 86.23872, 54.88303],
  boundsMobile: [47.40833, 41.24948, 86.23872, 54.88303],
  extent: [47.40833, 41.24948, 86.23872, 54.88303],
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

  /* 顺序色阶（由 哈萨克斯坦主色生成） */
  RAMP: ["#d8eff8", "#b5d9e8", "#93c3d8", "#71aec8", "#4f98b8", "#2d82a8", "#0b6d99"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '州': '#e6194b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '哈萨克斯坦各州人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '州',
    subRole: '区',
    subDesc: '区是州之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：南部的阿拉木图与南哈萨克斯坦（奇姆肯特）人口密集，北部与中部的广袤草原、荒漠州份则地广人稀。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 特别市 / 联邦直辖区 / 直管区等一目了然。'
    }
  }
};
