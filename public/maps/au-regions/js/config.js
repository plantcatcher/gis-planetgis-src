/* 澳大利亚行政区划互动地图 · 表现层配置
   数据：scripts/convert_gadm_aus.py 从 GADM 4.1（gadm41_AUS_shp）转换生成
        - states.geojson  11 个一级行政区（6 州 + 2 领地 + 3 海外领地），含首府/人口/面积/简介
        - lga.geojson     568 个地方政府区（Local Government Area）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（2021 普查，ABS）/ 面积（km²），暖色分级呼应「红色中心」。 */
window.AUS_CONFIG = {
  /* 默认停在澳大利亚大陆 + 塔斯马尼亚；minZoom 2.5 给总览留余地 */
  view: { center: [134, -25], zoom: 3.4, minZoom: 2.5, maxZoom: 10 },
  bounds: [112, -46, 156, -9],
  boundsMobile: [128, -40, 150, -12],
  extent: [112, -46, 156, -9],
  graticuleStep: 5,

  basemaps: {
    img: { tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    vec: { tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}' }
  },
  imgAttr: 'Esri World Imagery',
  vecAttr: 'Esri World Shaded Relief',

  /* 卫星影像下把色块压暗，让暖色分级在影像上不发飘 */
  imgPaint: {
    'raster-brightness-max': 0.64,
    'raster-brightness-min': 0.05,
    'raster-saturation': -0.38,
    'raster-contrast': 0.06
  },

  /* 暖色分级（outback 红金），浅 → 深表达数值由小到大 */
  RAMP: ['#fde68a', '#fbbf24', '#f59e0b', '#ea580c', '#c2410c', '#9a3412', '#7c2d12'],

  METRICS: {
    pop:  { key: 'pop',  label: '人口', unit: '人',   hint: '2021 年人口普查（ABS）' },
    area: { key: 'area', label: '面积', unit: 'km²', hint: '行政区划面积（约）' }
  }
};
