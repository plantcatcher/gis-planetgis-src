/* 全球历史地震目录地图 · 表现层配置
   数据：USGS ComCat（ANSS 综合目录）1900-01-01 ~ 2026-10-26、M≥6.0 全量 14542 条，
        已在构建期落成本地静态矢量（data/catalog.json），非实时拉取。
   底图：Esri World Imagery / World_Shaded_Relief + 深色无底图；全球尺度不用高德（境外空白）。
   坐标系：WGS84 / EPSG:4326，与 Esri 底图对齐，无偏移。不绘制国界。 */
window.QH_CONFIG = {
  /* 环太平洋地震带横跨 180° 日界线，必须以太平洋为中心取景。
     renderWorldCopies 关掉时 MapLibre 会把 center 经度锁在 ±34°（视图不得越出世界边界），
     跨日界线根本看不到美洲西岸；故开启世界副本（无缝循环，跨 180° 不会断线），
     minZoom 1.5 保证「缩到最小也只有一个地球左右，不出现并排三个地球」。 */
  view: { center: [160, -2], zoom: 1.95, minZoom: 1.5, maxZoom: 9, renderWorldCopies: true },
  bounds: [-180, -60, 180, 78],
  extent: [-180, -85, 180, 85],
  graticuleStep: 30,
  province: false,
  defaultBasemap: 'none',       // 默认深色：历史散点在纯色底上最清楚

  data: {
    catalog: 'data/catalog.json',
    plates: 'data/plates.json',
    land: 'data/land.json'
  },

  basemaps: {
    img: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    imgAttr: 'Esri World Imagery',
    vec: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}'],
    vecAttr: 'Esri World Shaded Relief'
  },

  imgPaint: {
    'raster-brightness-max': 0.6,
    'raster-brightness-min': 0.04,
    'raster-saturation': -0.5,
    'raster-contrast': 0.05
  },

  /* 震级分级（颜色 / 图例 / 详情卡同源） */
  magBands: [
    { min: 9.0, color: '#ef4444', label: 'M9.0+ 特大地震' },
    { min: 8.0, color: '#ff8a4c', label: 'M8.0–8.9 巨大地震' },
    { min: 7.0, color: '#ffd54f', label: 'M7.0–7.9 大地震' },
    { min: 6.0, color: '#4fc3f7', label: 'M6.0–6.9 强震' }
  ],

  /* 震级门槛（chips 的 data-v） */
  magFloors: [6.0, 6.5, 7.0, 8.0],

  playMs: 90,     // 播放时每年推进的间隔（毫秒）
  bigMag: 8.0     // 「巨震档案」列表门槛
};
