/* 中国三维 DEM 沙盘 · 表现层配置 */
window.CN_CONFIG = {
  /* 相机初始视角：从东南方向斜上方俯瞰，全国轮廓与三级阶梯同框 */
  view: { azimuth: -0.62, polar: 0.78, radius: 6200 },
  minRadius: 600,
  maxRadius: 20000,

  /* 闲置自动旋转速度（弧度/帧，约 60fps）；拖拽 / 缩放 / 选中即停 */
  spin: 0.0015,

  /* 垂直夸张（真实起伏比例约 1:6000，默认 16× 便于观看） */
  exaggDefault: 16,
  exaggMin: 1,
  exaggMax: 45,

  /* 默认配色主题（见 app.js THEMES） */
  defaultTheme: 'classic',

  /* 卫星影像：天地图全球影像瓦片（CGCS2000/WGS84 球面墨卡托，与地形同坐标系）
     zoom 6 = 整幅中国约 12×9 张瓦片；zoom 7 更清晰但请求数增至约 4 倍 */
  satellite: {
    tk: 'e92d8558a9a7eb0709e7f895801bdcc9',
    zoom: 6
  },

  /* 预设镜头：以经纬度焦点 + 极角 + 半径表达；方位角由焦点自动推算 */
  presets: [
    { name: '全国全景',   lon: 105, lat: 35,   radius: 6200, polar: 0.78 },
    { name: '青藏高原',   lon: 88,  lat: 34,   radius: 1750, polar: 0.74 },
    { name: '云贵高原',   lon: 103, lat: 25.5, radius: 1550, polar: 0.80 },
    { name: '塔里木盆地', lon: 84,  lat: 39,   radius: 1500, polar: 0.86 },
    { name: '东北平原',   lon: 125, lat: 45,   radius: 1550, polar: 0.86 },
    { name: '东南沿海',   lon: 119, lat: 27,   radius: 1900, polar: 0.82 },
    { name: '喜马拉雅',   lon: 86.5,lat: 28,   radius: 1550, polar: 0.76 },
    { name: '华北·黄土',  lon: 110, lat: 37,   radius: 1500, polar: 0.86 }
  ]
};
