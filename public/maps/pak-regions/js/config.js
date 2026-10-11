/* 巴基斯坦行政区划互动地图 · 表现层配置
   数据：scripts/gen_seven_regions.py 从 GADM 4.1（gadm41_PAK_shp）转换生成
        - provinces.geojson  省 / 直管区（L1）
        - districts.geojson  专区（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'pak-regions',
  defaultMetric: 'pop',
  view: { center: [69.7494439590301, 29.535397140468227], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [61.68921, 23.81181, 76.68182, 36.90083],
  boundsMobile: [61.68921, 23.81181, 76.68182, 36.90083],
  extent: [61.68921, 23.81181, 76.68182, 36.90083],
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

  /* 顺序色阶（由 巴基斯坦主色生成） */
  RAMP: ["#e2ecdd", "#c5d5be", "#a8be9f", "#8ba781", "#6e9062", "#517943", "#346225"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '直管区': '#e6194b',
    '省': '#3cb44b',
    '地区': '#4363d8',
    '首都区': '#f58231'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '巴基斯坦各省 / 直管区人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '省 / 直管区',
    subRole: '专区',
    subDesc: '专区是省 / 直管区之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：旁遮普一省独大（占全国人口一半以上），信德省（卡拉奇）次之，西南的俾路支斯坦面积最大却人口最稀。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 特别市 / 联邦直辖区 / 直管区等一目了然。'
    }
  }
};
