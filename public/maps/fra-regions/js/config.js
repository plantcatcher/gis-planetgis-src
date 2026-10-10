/* 法国行政区划互动地图 · 表现层配置
   数据：scripts/gen_twelve_regions.py 从 GADM 4.1（gadm41_FRA_shp）转换生成
        - provinces.geojson  大区 / 海外领地（L1）
        - districts.geojson  省/市镇（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'fra-regions',
  defaultMetric: 'pop',
  view: { center: [2.1211100180288462, 46.569259190705125], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [-4.59847, 41.60764, 9.26597, 50.69847],
  boundsMobile: [-4.59847, 41.60764, 9.26597, 50.69847],
  extent: [-4.59847, 41.60764, 9.26597, 50.69847],
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

  /* 顺序色阶（由 法国主色生成） */
  RAMP: ["#dae0ef", "#b9c2da", "#98a4c6", "#7787b1", "#56699d", "#354b88", "#142e74"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '大区': '#e6194b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '法国各大区 / 海外领地人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '大区 / 海外领地',
    subRole: '省/市镇',
    subDesc: '省/市镇是大区 / 海外领地之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：法兰西岛（巴黎）一区独大，里昂、马赛等大城市圈次之，西南与中部乡村大区稀疏。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。'
    }
  }
};
