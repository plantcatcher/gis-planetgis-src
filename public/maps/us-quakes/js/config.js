/* 美国周边历史地震地图 · 表现层配置
   数据：USGS ComCat（ANSS 综合目录）1900-01-01 ~ 2026-11-07、M≥5.0、
        美国及周边（阿拉斯加/夏威夷/波多黎各 + 相邻太平洋/大西洋/墨西哥/加拿大）共 8032 条，
        构建期落成本地静态矢量。
   底图：Esri World Imagery / World_Shaded_Relief + 深色无底图。
   坐标系：WGS84 / EPSG:4326，与 Esri 底图对齐，无偏移。不绘制任何国界。 */
window.USQ_CONFIG = {
  view: { center: [-120, 46], zoom: 2.9, minZoom: 2.3, maxZoom: 10 },
  bounds: [-180, 14, -58, 72],
  boundsMobile: [-180, 14, -58, 72],
  extent: [-190, 8, -50, 78],
  graticuleStep: 5,
  province: false,
  defaultBasemap: 'img',         // 实况默认：Esri World Imagery（封面已用无底图离线截取）

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

  /* 深度分级（和达—贝尼奥夫带：越往板片内部越深，深源地震勾出俯冲板片形状） */
  depthBands: [
    { min: 300, color: '#a78bfa', label: '300 km 以上 深源' },
    { min: 70, color: '#45c8f0', label: '70–300 km 中源' },
    { min: 30, color: '#ffa63d', label: '30–70 km 浅源' },
    { min: -1, color: '#ff4d6d', label: '0–30 km 极浅源' }
  ],

  /* 震级门槛（chips 的 data-v） */
  magFloors: [5.0, 5.5, 6.0, 7.0],

  /* 断层 / 俯冲带轴线：与数据构建脚本 _g/us_quakes_build.py 的 TRENCHES 一致。
     pos 是带名标注锚点（经度、纬度），避开震中最密处。 */
  axes: [
    { key: 'sanandreas', name: '圣安德烈亚斯断裂带', pos: [-119.5, 35.2], line: [
      [-117.0, 32.6], [-116.5, 33.9], [-117.3, 34.0], [-118.5, 35.0],
      [-119.0, 35.8], [-120.4, 36.7], [-121.0, 37.2], [-121.6, 37.8],
      [-122.3, 38.3], [-123.0, 38.8], [-124.3, 40.4]] },
    { key: 'cascadia', name: '卡斯卡迪亚俯冲带', pos: [-124.2, 44.5], line: [
      [-124.7, 40.5], [-124.6, 42.5], [-124.5, 44.7], [-124.6, 46.5],
      [-124.9, 48.3], [-125.5, 49.5], [-127.0, 50.5]] },
    { key: 'aleutian', name: '阿留申俯冲带', pos: [-172, 53.5], line: [
      [-163.0, 54.8], [-166.0, 54.0], [-168.5, 53.0], [-171.0, 52.5],
      [-173.5, 52.0], [-176.0, 52.0], [-178.5, 52.3], [-179.5, 52.8]] },
    { key: 'newmadrid', name: '新马德里地震带', pos: [-91.5, 37.6], line: [
      [-90.5, 36.6], [-89.6, 36.1], [-89.2, 35.6], [-90.0, 36.4]] },
    { key: 'puertorico', name: '波多黎各海沟', pos: [-66.5, 19.9], line: [
      [-67.5, 19.6], [-66.5, 19.2], [-65.5, 18.7], [-64.5, 18.2], [-63.5, 17.9]] }
  ],

  /* 主要城市：只标位置，不画边界。用于给读者定位。 */
  cities: [
    { name: '安克雷奇', lng: -149.9, lat: 61.2 },
    { name: '费尔班克斯', lng: -147.7, lat: 64.8 },
    { name: '朱诺', lng: -134.4, lat: 58.3 },
    { name: '西雅图', lng: -122.3, lat: 47.6 },
    { name: '波特兰', lng: -122.7, lat: 45.5 },
    { name: '旧金山', lng: -122.4, lat: 37.8 },
    { name: '洛杉矶', lng: -118.2, lat: 34.1 },
    { name: '圣迭戈', lng: -117.1, lat: 32.7 },
    { name: '拉斯维加斯', lng: -115.1, lat: 36.2 },
    { name: '盐湖城', lng: -111.9, lat: 40.8 },
    { name: '丹佛', lng: -104.99, lat: 39.74 },
    { name: '芝加哥', lng: -87.6, lat: 41.9 },
    { name: '纽约', lng: -74.0, lat: 40.7 },
    { name: '檀香山', lng: -157.9, lat: 21.3 },
    { name: '圣胡安', lng: -66.1, lat: 18.5 }
  ],

  playMs: 95,      // 播放时每年推进的间隔（毫秒）
  markMag: 7.0     // 「必看事件」以外的补充门槛（未使用，保留可配置）
};
