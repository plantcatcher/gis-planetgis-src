/* 葡萄牙行政区划互动地图 · 表现层配置
   数据：scripts/gen_top12_regions.py 从 GADM 4.1（gadm41_PRT_shp）转换生成
        - provinces.geojson  区 / 自治区（L1）
        - districts.geojson  自治市（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'prt-regions',
  defaultMetric: 'pop',
  view: { center: [-9.670871430894309, 39.52697159349594], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [-31.09676, 32.73454, -6.56888, 41.96969],
  boundsMobile: [-31.09676, 32.73454, -6.56888, 41.96969],
  extent: [-31.09676, 32.73454, -6.56888, 41.96969],
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

  /* 顺序色阶（由 葡萄牙主色生成） */
  RAMP: ["#dae7f1", "#b9cddd", "#98b3c9", "#779ab5", "#5680a1", "#35668d", "#144d79"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '区': '#e6194b',
    '自治区': '#3cb44b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '葡萄牙各区 / 自治区人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '区 / 自治区',
    subRole: '自治市',
    subDesc: '自治市是区 / 自治区之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：里斯本、波尔图两大都会区密集，内陆中部与南部（阿连特茹）稀疏，大西洋上的亚速尔、马德拉自治区地广人稀。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：州 / 省 / 酋长国 / 道 / 共和国 / 边疆区等一目了然。'
    }
  }
};
