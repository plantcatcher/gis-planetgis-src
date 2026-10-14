/* 加纳行政区划互动地图 · 表现层配置
   数据：scripts/gen_top12_regions.py 从 GADM 4.1（gadm41_GHA_shp）转换生成
        - provinces.geojson  大区（L1）
        - districts.geojson  县/市镇（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'gha-regions',
  defaultMetric: 'pop',
  view: { center: [-1.1350454268669, 7.796593978605225], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [-3.02051, 4.97579, 0.6941, 11.00653],
  boundsMobile: [-3.02051, 4.97579, 0.6941, 11.00653],
  extent: [-3.02051, 4.97579, 0.6941, 11.00653],
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

  /* 顺序色阶（由 加纳主色生成） */
  RAMP: ["#d9ecdf", "#b7d4c1", "#96bda4", "#75a687", "#548f69", "#33784c", "#12612f"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '大区': '#e6194b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '加纳各大区人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '大区',
    subRole: '县/市镇',
    subDesc: '县/市镇是大区之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：大阿克拉、阿散蒂（库马西）等南部大区密集，北部大区相对稀疏。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。'
    }
  }
};
