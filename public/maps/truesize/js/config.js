/* 国家真实面积对比 · True Size · 表现层配置
   数据：Natural Earth 110m 国界（公共领域），自托管于 data/countries.geojson。
   交互：点选 / 搜索选国 → 高亮可拖拽；拖动改写坐标；实时算真实面积 + 墨卡托放大倍数。
   坐标系：WGS84，底图 Web 墨卡托（MapLibre 默认），故纬度越高视觉越大，正是本图要演示的失真。 */
window.TS_CONFIG = {
  view: { center: [10, 25], zoom: 1.6, minZoom: 1, maxZoom: 8, renderWorldCopies: true },
  bounds: [-180, -85, 180, 85],
  extent: [-180, -90, 180, 90],
  graticuleStep: 30,
  province: false,
  defaultBasemap: 'none',

  /* 国界数据（相对本页路径） */
  dataUrl: 'data/countries.geojson',

  /* 快捷对比按钮（按中文名 / 英文名匹配） */
  quick: ['格陵兰', '俄罗斯', '美国', '澳大利亚', '加拿大', '巴西', '印度', '中国', '南极洲', '日本'],

  /* 默认选中（首屏即演示）：格陵兰 */
  defaultSelect: '格陵兰',

  /* 上下文国家填色（淡）与选中国家高亮 */
  ctxFill: 'rgba(120,150,190,0.10)',
  ctxStroke: 'rgba(150,180,220,0.30)',
  activeFill: 'rgba(245,181,68,0.34)',
  activeStroke: '#ffd98a',
  ghostStroke: 'rgba(245,181,68,0.55)'
};
