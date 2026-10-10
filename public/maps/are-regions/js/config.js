/* 阿联酋行政区划互动地图 · 表现层配置
   数据：scripts/gen_twelve_regions.py 从 GADM 4.1（gadm41_ARE_shp）转换生成
        - provinces.geojson  酋长国（L1）
        - districts.geojson  市/镇（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'are-regions',
  defaultMetric: 'pop',
  view: { center: [54.694338603709944, 24.833744064080943], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [51.58902, 23.58314, 56.36276, 25.92937],
  boundsMobile: [51.58902, 23.58314, 56.36276, 25.92937],
  extent: [51.58902, 23.58314, 56.36276, 25.92937],
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

  /* 顺序色阶（由 阿联酋主色生成） */
  RAMP: ["#d7eae7", "#b4d1cd", "#92b9b4", "#70a19b", "#4d8882", "#2b7069", "#095850"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '酋长国': '#e6194b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '阿联酋各酋长国人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '酋长国',
    subRole: '市/镇',
    subDesc: '市/镇是酋长国之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：迪拜与阿布扎比两座都会圈聚集了全国绝大多数人口，其余五个酋长地广人稀。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。'
    }
  }
};
