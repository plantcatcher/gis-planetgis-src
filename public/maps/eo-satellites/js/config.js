/* 遥感卫星在轨全景 · 表现层配置 */
window.EO_CONFIG = {
  /* 相机初始视角：赤道侧视，一眼同时看到地球、极轨壳层与静止轨道上的定点星 */
  view: { lon: 105, lat: 12, radius: 3.4 },
  minRadius: 1.28,
  maxRadius: 9,

  /* 闲置自动旋转（度/帧）；拖拽 / 缩放 / 选中即停 */
  spin: 0.03,

  presets: [
    { name: '全球全景', lon: 105, lat: 12, radius: 3.4 },
    { name: '中国上空', lon: 108, lat: 30, radius: 1.95 },
    { name: '北极俯视', lon: 0, lat: 84, radius: 2.9 },
    { name: '赤道侧视', lon: 105, lat: 2, radius: 4.4 },
    { name: '静止轨道环', lon: 105, lat: 5, radius: 5.6 }
  ],

  /* 三支队伍：太阳同步 / 地球静止 / 倾斜特殊 */
  groups: [
    { key: 'sso', name: '太阳同步轨道', sub: '极轨扫描 · 全球覆盖', color: '#4fd6c0' },
    { key: 'geo', name: '地球静止轨道', sub: '赤道上空定点凝视', color: '#ffb648' },
    { key: 'tilt', name: '倾斜 / 特殊轨道', sub: '降水、测高等专班', color: '#a78bfa' }
  ],

  /* 时间倍速：仿真秒 / 真实秒 */
  speeds: [1, 60, 600, 3600],
  defaultSpeed: 60,

  /* 刈幅带 */
  swath: {
    showSeconds: 240,       /* 实时带：星下点前后各多少秒（50 秒只有 3° 弧长，看不出「带」） */
    daySamples: 2600,       /* 「一天覆盖」采样点数 */
    geoViewDeg: 62          /* 静止卫星视场球面圆半径（地心角） */
  },

  facts: {
    texture: 'NASA / Solar System Scope 昼面贴图（自托管）',
    tle: 'CelesTrak 公开 TLE（构建期抓取，运行时零外网请求）'
  }
};
