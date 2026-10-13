/* 印度行政区划互动地图 · 表现层配置
   数据：scripts/gen_four_regions.py 从 GADM 4.1（gadm41_IND_shp）转换生成
        - provinces.geojson  邦 / 中央直辖区（L1）
        - districts.geojson  县（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'ind-regions',
  defaultMetric: 'pop',
  view: { center: [81.17991490222177, 22.10864280638886], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [68.48764, 8.35212, 94.46794, 33.98982],
  boundsMobile: [68.48764, 8.35212, 94.46794, 33.98982],
  extent: [68.48764, 8.35212, 94.46794, 33.98982],
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

  /* 顺序色阶（由 印度主色生成） */
  RAMP: ["#fbe8dc", "#ebcfbd", "#dcb69e", "#cd9d80", "#be8461", "#af6b42", "#a05324"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '中央直辖区': '#e6194b',
    '邦': '#3cb44b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '印度各邦 / 中央直辖区人口（最近普查 / 官方估计，约值）' },
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
    mainLabel: '邦 / 中央直辖区',
    subRole: '县',
    subDesc: '县是邦 / 中央直辖区之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：北方邦、马哈拉施特拉与比哈尔等恒河—印度河流域邦人口极密，东北部山区与海岛直辖区则明显稀疏。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：省 / 邦 / 中央直辖区等一目了然。'
    }
  }
};
