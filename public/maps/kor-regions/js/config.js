/* 韩国行政区划互动地图 · 表现层配置
   数据：scripts/convert_gadm_kor.py 从 GADM 4.1（gadm41_KOR_shp）转换生成
        - metro.geojson      17 个道市级单位（含韩文汉字名）
        - citycounty.geojson 229 个市 / 郡 / 区
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口 / 面积（log 青碧分级）/ 六大圈域（分类色），青绿呼应半岛山海。 */
window.MAP_CONFIG = {
  slug: 'kor-regions',
  view: { center: [127.8, 36.2], zoom: 5.6, minZoom: 4, maxZoom: 11 },
  bounds: [124, 32.8, 132.2, 38.8],
  boundsMobile: [125, 33.2, 131.8, 38.6],
  extent: [124, 32.8, 132.2, 38.8],
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

  /* 青碧分级（青→深松绿） */
  RAMP: ['#c8e6d5', '#8fd0b4', '#5bb894', '#30a076', '#1d8560', '#13684b', '#0c4d38'],

  /* 六大圈域配色 */
  GROUP_COLORS: {
    '首都圈': '#dc2626',
    '忠清圈': '#d97706',
    '湖南圈': '#7c3aed',
    '岭南圈': '#2563eb',
    '江原圈': '#16a34a',
    '济州':   '#db2777'
  },

  METRICS: {
    pop:    { key: 'pop',  label: '人口',  unit: '人',   hint: '住民登记估计（约值，人工整理）' },
    area:   { key: 'area', label: '面积',  unit: 'km²', hint: '面积由 GADM 几何球面实算' },
    group:  { key: 'groupZh', label: '圈域', unit: '圈域', hint: '首都圈 / 忠清 / 湖南 / 岭南 / 江原 / 济州' }
  },

  DATA: {
    main: 'data/metro.geojson',
    sub: 'data/citycounty.geojson'
  },

  TEXT: {
    groupSuffix: '圈域',
    capitalLabel: '行政中心',
    mainLabel: '道市',
    subRole: '市 / 郡 / 区',
    subDesc: '市（시）、郡（군）、区（구）是韩国道市之下的基本行政单位：广域市与部分市下设区，郡多辖郊县里邑。',
    notes: {
      pop: '按<b>人口</b>着色。京畿道一道约 1360 万人，与首尔、仁川同属首都圈——全国人口的一半。',
      area: '按<b>面积</b>着色。庆尚北道最大（约 1.9 万 km²），首尔只有 605 km² 却住着近千万人。',
      group: '按<b>六大圈域</b>着色。首都圈、忠清、湖南、岭南、江原与济州——首尔独大、岭南与湖南对峙，是韩国政治地理的主轴。'
    }
  }
};
