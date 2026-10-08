/* 乌克兰行政区划互动地图 · 表现层配置
   数据：scripts/convert_gadm_ukr.py 从 GADM 4.1（gadm41_UKR_shp）转换生成
        - oblasts.geojson  27 个州级单位（24 州 + 基辅市 + 克里米亚自治共和国 + 塞瓦斯托波尔）
        - raions.geojson   628 个区 / 市（2020 年改革前旧口径）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口 / 面积（log 蓝阶）/ 五大方位（分类色），蓝色呼应乌克兰与麦田天空。 */
window.MAP_CONFIG = {
  slug: 'ukr-regions',
  view: { center: [31.5, 48.8], zoom: 5.0, minZoom: 4, maxZoom: 11 },
  bounds: [22, 44.2, 40.5, 52.6],
  boundsMobile: [22.5, 44.6, 40.0, 52.4],
  extent: [22, 44.2, 40.5, 52.6],
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

  /* 蓝阶（浅天蓝→深靛蓝） */
  RAMP: ['#c9ddf7', '#9ec2ee', '#72a4e4', '#4a85d6', '#2e69bd', '#1e4f96', '#123a70'],

  /* 五大方位配色 */
  GROUP_COLORS: {
    '北部': '#dc2626',
    '中部': '#d97706',
    '东部': '#2563eb',
    '南部': '#0891b2',
    '西部': '#16a34a'
  },

  METRICS: {
    pop:    { key: 'pop',  label: '人口',  unit: '人',   hint: '2021 年前后官方估计（约值，人工整理）' },
    area:   { key: 'area', label: '面积',  unit: 'km²', hint: '面积由 GADM 几何球面实算' },
    group:  { key: 'groupZh', label: '方位', unit: '方位', hint: '北部 / 中部 / 东部 / 南部 / 西部' }
  },

  DATA: {
    main: 'data/oblasts.geojson',
    sub: 'data/raions.geojson'
  },

  TEXT: {
    groupSuffix: '方位',
    capitalLabel: '首府',
    mainLabel: '州级',
    subRole: '区 / 市（旧口径）',
    subDesc: '区（Raion）与市（Misto）是州之下的基本行政单位；本图采用 GADM 4.1 的 2020 年改革前旧口径，全国 620 余个区市。',
    notes: {
      pop: '按<b>人口</b>着色。基辅市与顿涅茨克、第聂伯罗、哈尔科夫、敖德萨等工业州是人口大头。',
      area: '按<b>面积</b>着色。敖德萨、第聂伯罗、切尔尼戈夫是面积最大的州，西部各州相对紧凑。',
      group: '按<b>五大方位</b>着色：北部、中部、东部、南部与西部——第聂伯河与历史上的边界至今仍在左右这张图。'
    }
  }
};
