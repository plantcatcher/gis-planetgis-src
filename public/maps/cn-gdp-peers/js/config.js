/* 中国各省 GDP × 全球国家对标 · 表现层配置
   数据口径见 data/meta.json：
     内陆 31 省按「占全国人民币 GDP 比重」折算美元（全国取世行 2025 现价美元 194980 亿）；
     台湾省 9201 亿美元（IMF WEO），港澳取世行 2025 现价美元；
     世界各国 GDP / 人口来自世界银行 WDI 2025（186 个经济体）。 */
window.GDPPEER_CONFIG = (function () {
  var TK = 'e92d8558a9a7eb0709e7f895801bdcc9';
  function tdt(layer) {
    var subs = ['0', '1', '2', '3', '4', '5', '6', '7'];
    return subs.map(function (s) {
      return 'https://t' + s + '.tianditu.gov.cn/' + layer + '_w/wmts?SERVICE=WMTS&REQUEST=GetTile' +
        '&VERSION=1.0.0&LAYER=' + layer + '&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles' +
        '&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' + TK;
    });
  }

  /* GDP 分档（亿美元）：500 / 1000 / 2500 / 5000 / 10000
     跨度从西藏 387 亿到广东 20407 亿，共 6 档。 */
  var BREAKS = [500, 1000, 2500, 5000, 10000];
  var COLORS = ['#2b6d8f', '#5aa9c4', '#e0cf8a', '#e8a13c', '#dd5a35', '#a4161a'];
  var NO_DATA = '#33404f';   // 无 GDP 数据的国家（世界视图）

  return {
    view: { center: [104.5, 34.6], zoom: 3.9, minZoom: 2.2, maxZoom: 9 },
    bounds: [73.0, 17.5, 135.5, 54.5],
    extent: [73.0, 17.5, 135.5, 54.5],
    boundsMobile: [75.5, 18, 135.5, 50.5],
    worldBounds: [-168, -56, 190, 78],
    graticuleStep: 10,
    defaultBasemap: 'none',
    imgPaint: { 'raster-brightness-max': 0.94, 'raster-brightness-min': 0.03, 'raster-saturation': -0.05 },
    basemaps: {
      img: tdt('img'), vec: tdt('vec'),
      imgAttr: '天地图 · 卫星影像', vecAttr: '天地图 · 矢量'
    },
    BREAKS: BREAKS,
    COLORS: COLORS,
    NO_DATA: NO_DATA,
    HI: '#ffd166',          // 世界视图：对标国家高亮
    FILL_OP: 0.82
  };
})();
