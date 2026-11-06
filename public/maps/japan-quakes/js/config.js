/* 日本周边历史地震地图 · 表现层配置
   数据：USGS ComCat（ANSS 综合目录）1900-01-01 ~ 2026-11-06、M≥5.0、
        东经 122–150°、北纬 22–48° 共 10054 条，构建期落成本地静态矢量。
   底图：Esri World Imagery / World_Shaded_Relief + 深色无底图。
   坐标系：WGS84 / EPSG:4326，与 Esri 底图对齐，无偏移。不绘制任何国界。 */
window.JQ_CONFIG = {
  view: { center: [133.9, 36.3], zoom: 4.15, minZoom: 3.2, maxZoom: 10 },
  bounds: [122, 22, 150, 48],
  boundsMobile: [124, 26, 146, 44],
  extent: [118, 18, 156, 52],
  graticuleStep: 5,
  province: false,
  defaultBasemap: 'img',         // 默认卫星影像：暖色震点与红色脉冲在暗色影像上最跳

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
    'raster-brightness-max': 0.62,
    'raster-brightness-min': 0.05,
    'raster-saturation': -0.55,
    'raster-contrast': 0.06
  },

  /* 震级分级（暖→赤红的热力色阶：小震暖橙、大震赤红，颜色随震级向红色过渡） */
  magBands: [
    { min: 9.0, color: '#d4001a', label: 'M9.0+ 特大地震' },
    { min: 8.0, color: '#ff2d2d', label: 'M8.0–8.9 巨大地震' },
    { min: 7.0, color: '#ff5a36', label: 'M7.0–7.9 大地震' },
    { min: 6.0, color: '#ff8c42', label: 'M6.0–6.9 强震' },
    { min: 5.0, color: '#ffb88c', label: 'M5.0–5.9 中震' }
  ],

  /* 深度分级（和达—贝尼奥夫带：越往西越深，深源地震勾出俯冲板片形状） */
  depthBands: [
    { min: 300, color: '#a78bfa', label: '300 km 以上 深源' },
    { min: 70, color: '#45c8f0', label: '70–300 km 中源' },
    { min: 30, color: '#ffa63d', label: '30–70 km 浅源' },
    { min: -1, color: '#ff4d6d', label: '0–30 km 极浅源' }
  ],

  /* 震级门槛（chips 的 data-v） */
  magFloors: [5.0, 5.5, 6.0, 7.0],

  /* 海沟 / 应变带轴线：与数据构建脚本 _g/jp_quakes_build.py 的 TRENCHES 一致。
     pos 是带名标注锚点（经度、纬度），避开震中最密处。 */
  axes: [
    { key: 'japan', name: '日本海沟', pos: [145.4, 40.4], line: [
      [146.6, 44.0], [145.6, 42.5], [144.8, 41.2], [144.0, 40.0],
      [143.4, 38.9], [142.6, 37.6], [141.9, 36.2], [141.2, 34.6]] },
    { key: 'kuril', name: '千岛—堪察加海沟', pos: [151.0, 46.6], line: [
      [156.0, 49.2], [152.6, 47.2], [149.4, 45.2], [147.4, 44.2], [146.6, 44.0]] },
    { key: 'izu', name: '伊豆—小笠原海沟', pos: [143.6, 30.4], line: [
      [141.0, 34.6], [141.6, 33.0], [142.1, 31.0], [142.6, 28.4], [142.0, 26.0]] },
    { key: 'nankai', name: '南海海槽—相模海槽', pos: [136.8, 32.9], line: [
      [131.2, 31.4], [133.0, 32.4], [134.8, 33.2], [136.6, 33.9],
      [138.2, 34.4], [139.4, 34.9]] },
    { key: 'ryukyu', name: '琉球海沟', pos: [132.0, 24.9], line: [
      [122.6, 23.4], [125.4, 25.0], [127.6, 26.8], [129.8, 28.4],
      [131.4, 29.8], [131.2, 31.4]] },
    { key: 'japansea', name: '日本海东缘应变带', pos: [139.8, 40.6], line: [
      [140.0, 43.2], [139.4, 41.2], [138.6, 39.4], [137.6, 37.8],
      [136.6, 36.6], [135.4, 35.6]] }
  ],

  /* 主要城市：只标位置，不画边界。用于给读者定位。 */
  cities: [
    { name: '东京', lng: 139.69, lat: 35.69 },
    { name: '大阪', lng: 135.50, lat: 34.69 },
    { name: '札幌', lng: 141.35, lat: 43.06 },
    { name: '仙台', lng: 140.87, lat: 38.27 },
    { name: '新潟', lng: 139.04, lat: 37.92 },
    { name: '金泽', lng: 136.66, lat: 36.56 },
    { name: '福冈', lng: 130.40, lat: 33.59 },
    { name: '那霸', lng: 127.68, lat: 26.21 },
    { name: '钏路', lng: 144.38, lat: 42.98 }
  ],

  playMs: 95,      // 播放时每年推进的间隔（毫秒）
  markMag: 7.0     // 「必看事件」以外的补充门槛（未使用，保留可配置）
};
