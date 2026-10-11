/* 尼日利亚行政区划互动地图 · 表现层配置
   数据：scripts/gen_seven_regions.py 从 GADM 4.1（gadm41_NGA_shp）转换生成
        - provinces.geojson  州（L1）
        - districts.geojson  地方政府区（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'nga-regions',
  defaultMetric: 'pop',
  view: { center: [7.275720290356032, 7.568582369512616], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [2.78402, 4.34708, 14.17406, 13.40555],
  boundsMobile: [2.78402, 4.34708, 14.17406, 13.40555],
  extent: [2.78402, 4.34708, 14.17406, 13.40555],
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

  /* 顺序色阶（由 尼日利亚主色生成） */
  RAMP: ["#d7ece3", "#b4d4c7", "#92bdac", "#70a691", "#4d8f75", "#2b785a", "#09613f"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '州': '#e6194b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '尼日利亚各州人口（最近普查 / 官方估计，约值）' },
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
    subRole: '地方政府区',
    subDesc: '地方政府区是州之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：拉各斯一州密度惊人（非洲第一大城），卡诺（北部商贸古都）次之，中部与东北部州份人口分散。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 特别市 / 联邦直辖区 / 直管区等一目了然。'
    }
  }
};
