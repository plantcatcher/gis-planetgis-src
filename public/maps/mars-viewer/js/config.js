/* 火星模拟器 · 表现层配置 */
window.MARS_CONFIG = {
  /* 相机初始视角：大瑟提斯（暗区）与塔尔西斯火山群同框，一眼看见南北差异 */
  view: { lon: 0, lat: 12, radius: 2.6 },
  minRadius: 1.32,
  maxRadius: 3.6,

  /* 闲置自动旋转速度（度/帧，约 60fps）；拖拽 / 缩放 / 选中即停 */
  spin: 0.09,

  presets: [
    { name: '全球全景', lon: 0, lat: 10, radius: 2.7 },
    { name: '塔尔西斯火山群', lon: 247.4, lat: 2, radius: 1.72 },
    { name: '奥林匹斯火山', lon: 226.2, lat: 18.7, radius: 1.5 },
    { name: '水手号峡谷', lon: 301.4, lat: -14, radius: 1.7 },
    { name: '大瑟提斯', lon: 67.1, lat: 9.2, radius: 1.62 },
    { name: '希腊平原', lon: 70.5, lat: -42.4, radius: 1.68 },
    { name: '火星北极', lon: 55, lat: 80, radius: 2.0 },
    { name: '好奇号着陆区', lon: 137.4, lat: -4.6, radius: 1.5 },
    { name: '祝融号着陆区', lon: 109.9, lat: 25.1, radius: 1.5 }
  ],

  /* 分类（与 data/features.js 的 type 对应） */
  types: [
    { key: 'all', label: '全部' },
    { key: 'volcano', label: '火山' },
    { key: 'canyon', label: '峡谷与河道' },
    { key: 'plain', label: '平原与盆地' },
    { key: 'polar', label: '极区冰冠' },
    { key: 'mission', label: '探测记录' }
  ],

  /* 季节预设：太阳黄经 Ls（0=北半球春分，90=夏至，180=秋分，270=冬至） */
  seasons: [
    { name: '春分', ls: 0 },
    { name: '夏至', ls: 90 },
    { name: '秋分', ls: 180 },
    { name: '冬至', ls: 270 },
    { name: '沙尘暴季', ls: 250 }
  ],

  /* 时间模拟常数 */
  time: {
    obliquity: 25.19,      /* 火星自转轴倾角（度） */
    solMinutes: 1479.6,    /* 一个火星日（sol）= 24h39m35s */
    lsDefault: 90,
    hourDefault: 12
  },

  facts: {
    name: '火星',
    radiusKm: 3389.5,
    diameterKm: 6779,
    texture: '2K 等距圆柱贴图（自托管）'
  }
};
