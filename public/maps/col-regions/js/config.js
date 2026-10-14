/* 哥伦比亚行政区划互动地图 · 表现层配置
   数据：scripts/gen_top12_regions.py 从 GADM 4.1（gadm41_COL_shp）转换生成
        - provinces.geojson  省 / 首都区（L1）
        - districts.geojson  市镇（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'col-regions',
  defaultMetric: 'pop',
  view: { center: [-73.71920986347519, 4.438475219858156], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [-78.54792, -2.42159, -67.60145, 12.27875],
  boundsMobile: [-78.54792, -2.42159, -67.60145, 12.27875],
  extent: [-78.54792, -2.42159, -67.60145, 12.27875],
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

  /* 顺序色阶（由 哥伦比亚主色生成） */
  RAMP: ["#f8efd9", "#e7d9b8", "#d6c498", "#c5af78", "#b49a57", "#a38537", "#927017"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '省': '#e6194b',
    '首都区': '#3cb44b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '哥伦比亚各省 / 首都区人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '省 / 首都区',
    subRole: '市镇',
    subDesc: '市镇是省 / 首都区之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：波哥大、安蒂奥基亚（麦德林）、山谷（卡利）等安第斯诸省密集，东南部的亚马孙等省份稀疏。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。'
    }
  }
};
