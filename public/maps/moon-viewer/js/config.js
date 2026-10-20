/* 月球查看器 · 表现层配置 */
window.MOON_CONFIG = {
  /* 相机初始视角：正面偏北，月海与高地同框 */
  view: { lon: 0, lat: 16, radius: 2.6 },
  minRadius: 1.32,
  maxRadius: 3.6,

  /* 闲置自动旋转速度（度/帧，约 60fps）；拖拽 / 缩放 / 选中即停 */
  spin: 0.09,

  presets: [
    { name: '正面全景', lon: 0, lat: 8, radius: 2.6 },
    { name: '雨海', lon: -19, lat: 26, radius: 1.72 },
    { name: '第谷坑', lon: -11, lat: -43, radius: 1.6 },
    { name: '静海', lon: 31, lat: 6, radius: 1.72 },
    { name: '月背高地', lon: 165, lat: -10, radius: 3.5 },
    { name: '南极艾特肯', lon: -180, lat: -55, radius: 1.85 },
    { name: '嫦娥六号采样区', lon: -153.9, lat: -41.6, radius: 1.6 }
  ],

  /* 分类（与 data/features.js 的 type 对应） */
  types: [
    { key: 'all', label: '全部' },
    { key: 'mare', label: '月海' },
    { key: 'crater', label: '环形山' },
    { key: 'mountain', label: '山脉月谷' },
    { key: 'mission', label: '探测记录' }
  ],

  facts: {
    name: '月球',
    radiusKm: 1737.4,
    diameterKm: 3474.8,
    texture: '2K 等距圆柱贴图（自托管）'
  }
};
