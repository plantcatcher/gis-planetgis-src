/* 土耳其行政区划互动地图 · 表现层配置
   数据：scripts/gen_twelve_regions.py 从 GADM 4.1（gadm41_TUR_shp）转换生成
        - provinces.geojson  省（L1）
        - districts.geojson  区/县（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'tur-regions',
  defaultMetric: 'pop',
  view: { center: [34.19352433841949, 39.02629359371441], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [26.22986, 36.1543, 44.4319, 41.93573],
  boundsMobile: [26.22986, 36.1543, 44.4319, 41.93573],
  extent: [26.22986, 36.1543, 44.4319, 41.93573],
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

  /* 顺序色阶（由 土耳其主色生成） */
  RAMP: ["#f4dfdd", "#e1c0be", "#cfa29f", "#bc8480", "#aa6661", "#974842", "#852a24"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '省': '#e6194b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '土耳其各省人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '省',
    subRole: '区/县',
    subDesc: '区/县是省之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：伊斯坦布尔、安卡拉、伊兹密尔等西部省份人口高度集中，东部与东南部山区省份稀疏。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。'
    }
  }
};
