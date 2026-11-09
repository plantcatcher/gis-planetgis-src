/* 中国春运人口迁徙 · 表现层配置（v2：弧线航线 + 蓝→红双色 + 科技感底图）
   数据由 scripts/build_cn_spring_migration.py 生成（GCJ-02，与高德瓦片对齐）。 */
window.CSM_CONFIG = {
  view: { center: [105, 35], zoom: 3.6, minZoom: 3, maxZoom: 11 },
  bounds: [73, 18, 135, 54],
  extent: [73, 18, 135, 54],
  chinaCore: [80, 21, 124, 49],
  graticuleStep: 5,
  defaultBasemap: 'none',   // 深空科技底：陆地色块 + 海岸辉光 + 经纬网
  background: '#050a16',    // 深空底色（海洋 / 画布）
  imgPaint: {
    'raster-brightness-max': 0.62,
    'raster-saturation': -0.22,
    'raster-contrast': 0.10
  },
  fullLabelZoom: 4.6,
  /* 净流动语义色（节点与航线两端共用，蓝端=送人、红端=吸人） */
  netPos: '#ff6b5e',          // 净流入（人口「抽水机」）
  netNeg: '#4fa3ff',          // 净流出（人口输出地）
  netMid: '#cfe0f5',
  /* 科技底图配色 */
  landFill: '#0a1730',
  coastGlow: '#1e56a0',
  provLine: '#4d8fd1',
  gratColor: '#1d3f73',
  /* 航线弧度（垂直偏移 = 距离 × arcK，左航向偏） */
  arcK: 0.22,
  /* 流光：白点虚线只在强跨省主通道上流动 */
  sparkMinW: 3
};
