/* 英国行政区划互动地图 · 表现层配置
   数据：scripts/convert_gadm_gbr.py 从 GADM 4.1（gadm41_GBR_shp）转换生成
        - countries.geojson   4 个构成国（英格兰 / 苏格兰 / 威尔士 / 北爱尔兰）
        - districts.geojson   183 个二级行政区（郡 / 单一管理区 / 都会自治市 / 区 等）
   坐标系 WGS84 / EPSG:4326，底图 Esri 全球影像（高德只覆盖中国，境外空白）。
   着色指标：人口（ONS 2022 年中估计）/ 面积（km²），冷色分级。 */
window.UK_CONFIG = {
  /* 默认停在英伦三岛；minZoom 4.5 给总览留余地；Shetland 在最北 60.8°N */
  view: { center: [-2.6, 54.2], zoom: 5.2, minZoom: 4.5, maxZoom: 11 },
  bounds: [-11, 49, 4, 61.5],
  boundsMobile: [-10, 49.5, 3, 60],
  extent: [-11, 49, 4, 61.5],
  graticuleStep: 5,

  basemaps: {
    img: { tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    vec: { tile: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}' }
  },
  imgAttr: 'Esri World Imagery',
  vecAttr: 'Esri World Shaded Relief',

  /* 卫星影像下把色块压暗，让冷色分级在影像上不发飘 */
  imgPaint: {
    'raster-brightness-max': 0.64,
    'raster-brightness-min': 0.05,
    'raster-saturation': -0.38,
    'raster-contrast': 0.06
  },

  /* 冷色分级（海洋蓝 → 靛蓝），浅 → 深表达数值由小到大 */
  RAMP: ['#cffafe', '#7dd3fc', '#38bdf8', '#0ea5e9', '#2563eb', '#1e40af', '#172554'],

  METRICS: {
    pop:  { key: 'pop',  label: '人口', unit: '人',   hint: 'ONS 2022 年中估计（由 2021/2022 普查滚动）' },
    area: { key: 'area', label: '面积', unit: 'km²', hint: '行政区划面积（约）' }
  }
};
