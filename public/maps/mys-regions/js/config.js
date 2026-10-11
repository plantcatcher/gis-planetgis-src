/* 马来西亚行政区划互动地图 · 表现层配置
   数据：scripts/gen_seven_regions.py 从 GADM 4.1（gadm41_MYS_shp）转换生成
        - provinces.geojson  州 / 联邦直辖区（L1）
        - districts.geojson  县（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'mys-regions',
  defaultMetric: 'pop',
  view: { center: [109.69912534598214, 4.122311257440477], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [99.83434, 1.02218, 118.86618, 7.22361],
  boundsMobile: [99.83434, 1.02218, 118.86618, 7.22361],
  extent: [99.83434, 1.02218, 118.86618, 7.22361],
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

  /* 顺序色阶（由 马来西亚主色生成） */
  RAMP: ["#dae7f1", "#b9cddd", "#98b3c9", "#779ab5", "#5680a1", "#35668d", "#144d79"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '州': '#e6194b',
    '联邦直辖区': '#3cb44b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '马来西亚各州 / 联邦直辖区人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '州 / 联邦直辖区',
    subRole: '县',
    subDesc: '县是州 / 联邦直辖区之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：雪兰莪（含吉隆坡都会圈）与柔佛（紧邻新加坡）人口最密，东马的沙巴、砂拉越面积辽阔但人口分散。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 特别市 / 联邦直辖区 / 直管区等一目了然。'
    }
  }
};
