/* 星链环绕地球 · 表现层配置 */
window.STARLINK_CONFIG = {
  /* 相机初始视角：略微抬高，一眼看到薄壳星座环绕 */
  view: { lon: 0, lat: 14, radius: 2.7 },
  minRadius: 1.45,
  maxRadius: 6,

  /* 闲置自动旋转速度（度/帧）；拖拽 / 缩放 / 选中即停 */
  spin: 0.045,

  presets: [
    { name: '全球全景', lon: 0, lat: 12, radius: 2.7 },
    { name: '北美', lon: -100, lat: 38, radius: 1.95 },
    { name: '欧洲', lon: 12, lat: 50, radius: 1.9 },
    { name: '赤道侧视', lon: 0, lat: 0, radius: 2.7 },
    { name: '极地俯视', lon: 0, lat: 84, radius: 2.35 }
  ],

  /* 时间轴：滑块 0→1 对应 2019→2026；baseTimeScale 决定轨道动画速度（仿真秒/真实秒） */
  timeline: { defaultT: 1, baseTimeScale: 620 },

  facts: {
    name: '星链（Starlink）',
    altitudeKm: '约 550 km（低地球轨道 LEO）',
    shells: '3 个主壳层：53° / 70° / 97.6° 极轨',
    texture: 'NASA / Solar System Scope 昼面贴图（自托管）'
  }
};
