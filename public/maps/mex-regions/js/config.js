/* 墨西哥行政区划互动地图 · 表现层配置
   数据：scripts/gen_top12_regions.py 从 GADM 4.1（gadm41_MEX_shp）转换生成
        - provinces.geojson  州 / 联邦区（L1）
        - districts.geojson  市镇（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'mex-regions',
  defaultMetric: 'pop',
  view: { center: [-101.74972920700867, 22.666544075144508], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [-115.23771, 16.02106, -87.39544, 31.55504],
  boundsMobile: [-115.23771, 16.02106, -87.39544, 31.55504],
  extent: [-115.23771, 16.02106, -87.39544, 31.55504],
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

  /* 顺序色阶（由 墨西哥主色生成） */
  RAMP: ["#d7eae0", "#b4d1c2", "#92b9a5", "#70a188", "#4e886b", "#2c704e", "#0a5831"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '州': '#e6194b',
    '联邦区': '#3cb44b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '墨西哥各州 / 联邦区人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '州 / 联邦区',
    subRole: '市镇',
    subDesc: '市镇是州 / 联邦区之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：墨西哥城、哈利斯科（瓜达拉哈拉）、新莱昂（蒙特雷）等都会密集，北部沙漠州与南部瓦哈卡等地偏疏。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。'
    }
  }
};
