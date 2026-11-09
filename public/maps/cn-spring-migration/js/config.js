/* 中国春运人口迁徙 · 表现层配置
   数据由 scripts/build_cn_spring_migration.py 生成（GCJ-02，与高德瓦片对齐）。 */
window.CSM_CONFIG = {
  view: { center: [105, 35], zoom: 3.6, minZoom: 3, maxZoom: 11 },
  bounds: [73, 18, 135, 54],
  extent: [73, 18, 135, 54],
  chinaCore: [80, 21, 124, 49],
  graticuleStep: 5,
  defaultBasemap: 'none',   // 深色无底图：数据线最醒目（可切卫星/矢量）
  imgPaint: {
    'raster-brightness-max': 0.62,
    'raster-saturation': -0.22,
    'raster-contrast': 0.10
  },
  fullLabelZoom: 4.6,
  flowColor: '#ff7a45',       // 跨省迁徙流（暖橙，春运主角）
  flowColorIntra: '#52617e',  // 省内短途（冷灰，默认隐藏）
  netPos: '#ff6b5e',          // 净流入（人口「抽水机」）
  netNeg: '#4fa3ff',          // 净流出（人口输出地）
  netMid: '#cfe0f5'
};
