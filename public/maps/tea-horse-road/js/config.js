/* 茶马古道 · 三条主线 —— 表现层配置
   线路几何与驿镇节点由 scripts/build_tea_horse_road.py 生成（GCJ-02，与高德瓦片对齐），
   这里只放视图参数与标注策略。 */
window.TEAHORSE_CONFIG = {
  /* 三条线合起来的范围：西至拉萨、东至西安、南至普洱、北至湟源 */
  view: { center: [99.6, 30.0], zoom: 4.4, minZoom: 3.2, maxZoom: 11 },
  bounds: [90.0, 21.9, 110.2, 37.6],
  extent: [88, 21, 112, 38],

  /* 底图：默认卫星影像——三条主线的走法本身就是地形决定的 */
  defaultBasemap: 'img',
  imgPaint: {
    'raster-brightness-max': 0.76,
    'raster-saturation': -0.12,
    'raster-contrast': 0.08
  },

  /* 驿镇共 36 处，层级低时全部标出会糊成一片：
     低于该层级只标起终点 / 汇合点 / 山口，放大后才补出全部驿站。 */
  fullLabelZoom: 5.6,

  /* 节点角色的中英文说法（中文用于标签与提示，英文用于详情卡的角标） */
  kindLabel: {
    origin: '起点',
    stage: '驿站',
    pass: '山口',
    junction: '汇合点',
    terminus: '终点'
  },
  roleEn: {
    origin: 'ORIGIN',
    stage: 'STAGE',
    pass: 'MOUNTAIN PASS',
    junction: 'JUNCTION',
    terminus: 'TERMINUS'
  },

  /* 图例补充说明 */
  legendNote: '圆形为驿镇，方形为汇合点 / 终点'
};
