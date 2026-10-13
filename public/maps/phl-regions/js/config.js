/* 菲律宾行政区划互动地图 · 表现层配置
   数据：scripts/gen_four_regions.py 从 GADM 4.1（gadm41_PHL_shp）转换生成
        - provinces.geojson  省（L1）
        - districts.geojson  市镇（L2）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（各国普查 / 官方估计，约值）/ 面积（几何实算）/ 行政区类型（ENGTYPE 映射）。 */
window.MAP_CONFIG = {
  slug: 'phl-regions',
  defaultMetric: 'pop',
  view: { center: [122.55420990322153, 11.285372056211056], zoom: 4.2, minZoom: 2.5, maxZoom: 11 },
  bounds: [117.27, 5.08661, 126.34539, 18.875],
  boundsMobile: [117.27, 5.08661, 126.34539, 18.875],
  extent: [117.27, 5.08661, 126.34539, 18.875],
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

  /* 顺序色阶（由 菲律宾主色生成） */
  RAMP: ["#dae5ef", "#b9cada", "#98afc5", "#7794b0", "#56799b", "#355e86", "#144371"],

  /* 行政区类型配色 */
  GROUP_COLORS: {
    '省': '#e6194b'
  },

  METRICS: {
    pop:    { key: 'pop', label: '人口', unit: '人', hint: '菲律宾各省人口（最近普查 / 官方估计，约值）' },
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
    subRole: '市镇',
    subDesc: '市镇是省之下的基本行政单位。',
    notes: {
      pop: '按<b>人口</b>着色：首都马尼拉大区周边的布拉干、甲米地、内湖等吕宋岛南部省份人口极密，棉兰老内陆与巴拉望则稀疏得多。',
      area: '按<b>面积</b>着色：由几何球面实算，颜色越深面积越大。',
      group: '按<b>行政区类型</b>着色：省 / 邦 / 中央直辖区等一目了然。'
    }
  }
};
