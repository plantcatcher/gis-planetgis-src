/* 中国历史十次人口迁徙 · 表现层配置
   路线 / 节点 / 事件数据由 scripts/build_cn_pop_migration.py 生成（GCJ-02，与高德瓦片对齐），
   这里只放视图参数与标注策略。 */
window.CNPOP_CONFIG = {
  /* 全量范围（含下南洋的东南亚目的地） */
  view: { center: [108, 30], zoom: 3.6, minZoom: 3, maxZoom: 11 },
  bounds: [95, -12, 128, 47],
  extent: [95, -12, 128, 47],

  /* 首屏聚焦中国本土；点「全网总览」才展开到含东南亚的全范围 */
  chinaCore: [100, 18, 125, 42],

  graticuleStep: 5,

  /* 默认卫星影像：路线落实到真实山川骨架上（走西口出长城、闯关东跨山海关）
     才有说服力；影像压暗让出视觉焦点，避免地面纹理抢掉迁徙流线 */
  defaultBasemap: 'img',
  imgPaint: {
    'raster-brightness-max': 0.62,
    'raster-saturation': -0.22,
    'raster-contrast': 0.10
  },

  /* 低于该层级只标「枢纽城市」，放大后才补出全部城市 */
  fullLabelZoom: 4.2,

  /* 节点角色的中英文说法（中文用于标签与提示，英文用于详情卡角标） */
  roleLabel: { hub: '枢纽', origin: '迁出地', dest: '迁入地' },
  roleEn: { hub: 'HUB', origin: 'ORIGIN', dest: 'DESTINATION' }
};
