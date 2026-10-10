/* 瑞士行政区划互动地图 · 表现层配置
   数据：scripts/gen_twelve_regions.py 从 GADM 4.1（gadm41_CHE_shp）转换生成
        - provinces.geojson  州 / 半州（L1）
        - districts.geojson  市镇（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'che-regions',
  defaultMetric: 'pop',
  view: { center: [8.17974456494947, 46.96118780872566], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [6.12011, 45.89998, 10.40335, 47.74653],
  boundsMobile: [6.12011, 45.89998, 10.40335, 47.74653],
  extent: [6.12011, 45.89998, 10.40335, 47.74653],
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

  /* 顺序色阶（由 瑞士主色生成） */
  RAMP: ["#f8dddd", "#e7bdbe", "#d69e9f", "#c57f80", "#b45f61", "#a34042", "#922124"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '州': '#e6194b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '瑞士各州 / 半州人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '州 / 半州',
    subRole: '市镇',
    subDesc: '市镇是州 / 半州之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：苏黎世、伯尔尼、日内瓦等中部与西部州人口密集，山地州格劳宾登、瓦莱则相对稀疏。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。'
    }
  }
};
