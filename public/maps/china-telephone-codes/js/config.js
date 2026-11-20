/* 全国电话区号互动地图 · 配置
   着色：区号首位数字分组，对应速查页「二、区号的编排规律」。
   '0' = 010 / 020—029 的 2 位大区中心；3—9 = 3 位区号的首位大区；无 = 港澳台。 */
window.CTEL_CONFIG = (function () {
  var COLORS = {
    '0': '#38bdf8', '3': '#7b8cff', '4': '#2fd9c5', '5': '#4fd88a',
    '6': '#f2c14e', '7': '#ff9f45', '8': '#ff6b6b', '9': '#c77dff',
    '无': '#7c8eb0'
  };

  var GROUPS = [
    { key: '0', name: '大区中心', desc: '010 / 020—029 · 2 位区号' },
    { key: '3', name: '华北', desc: '河北 · 山西 · 内蒙古' },
    { key: '4', name: '东北', desc: '辽宁 · 吉林 · 黑龙江 · 内蒙古' },
    { key: '5', name: '华东', desc: '江苏 · 浙江 · 安徽 · 福建 · 山东' },
    { key: '6', name: '分散', desc: '山东 · 广东 · 云南 等地' },
    { key: '7', name: '华中·华南', desc: '河南 · 湖北 · 湖南 · 广东 · 广西 · 海南' },
    { key: '8', name: '西南', desc: '四川 · 重庆 · 贵州 · 云南' },
    { key: '9', name: '西北', desc: '陕西 · 甘肃 · 青海 · 宁夏 · 新疆' },
    { key: '无', name: '港澳台', desc: '不属大陆长途区号体系' }
  ].map(function (g) { g.color = COLORS[g.key]; return g; });

  return {
    view: { center: [104.5, 35.8], zoom: 3.9, minZoom: 3, maxZoom: 11 },
    bounds: [73.0, 17.0, 136.0, 54.5],
    boundsMobile: [82, 19, 127, 50],
    extent: [72, 16, 138, 56],
    graticuleStep: 2,
    imgPaint: {
      'raster-brightness-max': 0.62,
      'raster-brightness-min': 0.05,
      'raster-saturation': -0.35,
      'raster-contrast': 0.06
    },
    COLORS: COLORS,
    GROUPS: GROUPS,
    TOTAL_CODES: 320,
    TOTAL_OLD: 14,
    TOTAL_UNITS: 447
  };
})();
