/* 全国邮政编码互动地图 · 配置
   着色：每个县按其邮编「首位数字」的众数归入九大邮区（0–8），
   对应速查页「二、邮编的编排规律」首位数字表。港澳台无大陆邮编 → 灰。
   县界 WGS84 干净县级多边形（2891 单元，含台湾、港澳），天地图同源无偏移。 */
window.CNPC_CONFIG = (function () {
  var TK = 'e92d8558a9a7eb0709e7f895801bdcc9';
  function tdt(layer) {
    var subs = ['0', '1', '2', '3', '4', '5', '6', '7'];
    return subs.map(function (s) {
      return 'https://t' + s + '.tianditu.gov.cn/' + layer + '_w/wmts?SERVICE=WMTS&REQUEST=GetTile' +
        '&VERSION=1.0.0&LAYER=' + layer + '&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles' +
        '&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' + TK;
    });
  }

  var COLORS = {
    '0': '#4FA8FF', '1': '#7B8CFF', '2': '#2FD9C5', '3': '#4FD88A', '4': '#F2C14E',
    '5': '#FF9F45', '6': '#FF6B6B', '7': '#C77DFF', '8': '#F062A6', '无': '#7c8eb0'
  };

  var GROUPS = [
    { key: '0', name: '华北', regions: '河北 · 山西 · 内蒙古' },
    { key: '1', name: '东北', regions: '北京 · 辽宁 · 吉林 · 黑龙江 · 内蒙古' },
    { key: '2', name: '华东', regions: '上海 · 江苏 · 浙江 · 安徽 · 山东' },
    { key: '3', name: '东南', regions: '天津 · 浙江 · 福建 · 江西' },
    { key: '4', name: '华中', regions: '河南 · 湖北 · 湖南 · 重庆' },
    { key: '5', name: '华南', regions: '广东 · 广西 · 海南 · 贵州' },
    { key: '6', name: '西南', regions: '四川 · 云南' },
    { key: '7', name: '西北', regions: '陕西 · 甘肃 · 宁夏 · 内蒙古' },
    { key: '8', name: '青藏·新疆', regions: '西藏 · 青海 · 新疆' },
    { key: '无', name: '无大陆邮编', regions: '港澳台及无数据县区' }
  ].map(function (g) { g.color = COLORS[g.key]; return g; });

  return {
    view: { center: [104.5, 35.8], zoom: 3.9, minZoom: 3, maxZoom: 11 },
    bounds: [73.0, 17.0, 136.0, 54.5],
    boundsMobile: [82, 19, 127, 50],
    extent: [72, 16, 138, 56],
    graticuleStep: 2,
    defaultBasemap: 'img',
    imgPaint: { 'raster-brightness-max': 0.62, 'raster-brightness-min': 0.05, 'raster-saturation': -0.35, 'raster-contrast': 0.06 },
    basemaps: {
      img: tdt('img'), vec: tdt('vec'),
      imgAttr: '天地图 · 卫星影像', vecAttr: '天地图 · 矢量'
    },
    COLORS: COLORS,
    GROUPS: GROUPS,
    TOTAL_COUNTIES: 2891,
    WITH_DATA: 2834,
    TOTAL_ZIPS: 37026
  };
})();
