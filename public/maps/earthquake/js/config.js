/* 全球实时地震地图 · 表现层配置
   数据：USGS 实时地震目录 GeoJSON Feed（浏览器端每 60 秒拉取，无静态矢量文件）。
   底图：Esri World Imagery（全球覆盖）+ World_Shaded_Relief + 深色无底图。
   全球尺度，不用高德（境外空白）；坐标系 WGS84，不叠加 GCJ-02 底图，故无偏移。 */
window.EQ_CONFIG = {
  view: { center: [10, 20], zoom: 1.5, minZoom: 0, maxZoom: 11, renderWorldCopies: false },
  bounds: [-180, -85, 180, 85],
  extent: [-180, -90, 180, 90],
  graticuleStep: 30,
  province: false,            // 全球图不画中国省界，也省一次 china-provinces.json 请求
  defaultBasemap: 'img',      // 默认 Esri 全球卫星影像（全球覆盖，境外不空白）；imgPaint 已压暗便于看震源点

  /* Esri 全球瓦片（server 节点，8/8 全通，不用 services 节点）。
     thematic.js 把 basemaps.vec / basemaps.img 当作瓦片数组直接喂给 raster source。 */
  basemaps: {
    img: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    imgAttr: 'Esri World Imagery',
    vec: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}'],
    vecAttr: 'Esri World Shaded Relief'
  },

  /* 卫星影像下压暗，否则震源点在影像上不显 */
  imgPaint: {
    'raster-brightness-max': 0.62,
    'raster-brightness-min': 0.05,
    'raster-saturation': -0.4,
    'raster-contrast': 0.06
  },

  /* USGS 四档时间窗 GeoJSON Feed（公共领域 / CC0，带 CORS） */
  feeds: {
    hour:  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
    day:   'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
    week:  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',
    month: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'
  },

  /* 震级门槛（chips 的 data-v） */
  magFloors: [0, 1, 2.5, 4.5, 6],
  refreshMs: 60000,

  /* 震级 → 颜色（与前端 circle-color 分段保持一致） */
  magColors: [
    { min: 6,    color: '#ef4444' },
    { min: 4.5,  color: '#fb923c' },
    { min: 2.5,  color: '#fde047' },
    { min: -99,  color: '#7dd3fc' }
  ]
};
