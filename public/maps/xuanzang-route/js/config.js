/* 玄奘西行 · 真实的取经路 —— 表现层配置
   坐标系：WGS84（与天地图 _w 瓦片、NE 110m 陆地衬底、经纬网一致，不混 GCJ-02）。
   线路与节点由 scripts/build_xuanzang.py 生成（节点连线示意，非实测道路）。 */
window.XUANZANG_CONFIG = (function () {
  /* 天地图全球服务（WGS84 球面墨卡托，境外有基础地理数据，国内合规） */
  var TK = 'e92d8558a9a7eb0709e7f895801bdcc9';
  function tdt(layer) {
    var subs = ['0', '1', '2', '3', '4', '5', '6', '7'];
    return subs.map(function (s) {
      return 'https://t' + s + '.tianditu.gov.cn/' + layer + '_w/wmts?SERVICE=WMTS&REQUEST=GetTile' +
        '&VERSION=1.0.0&LAYER=' + layer + '&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles' +
        '&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' + TK;
    });
  }

  return {
    /* 横跨中国—中亚—南亚。取景框刻意比路线本身宽松一圈：
       古舆图的美感靠「海陆并置」——印度洋、孟加拉湾、阿拉伯海要进画面，
       只框住路线会让整张图变成一块没有海岸线的色块。 */
    view: { center: [85, 33.5], zoom: 3.4, minZoom: 2.4, maxZoom: 9 },
    bounds: [59, 16, 117, 52],
    extent: [55, 10, 125, 56],
    /* 手机竖屏：路线东西跨度 42°，框太窄会把长安与中亚段两端切掉 ——
       宁可整体缩小也要让人一眼看到「这是一条横跨亚洲的路」。 */
    boundsMobile: [64, 20, 114, 46],
    graticuleStep: 5,

    /* 默认深色 + 世界陆地衬底（陆地轮廓无国界，合规安全）；可选天地图全球瓦片 */
    defaultBasemap: 'none',
    imgPaint: { 'raster-brightness-max': 0.78, 'raster-saturation': -0.1, 'raster-contrast': 0.06 },
    basemaps: {
      img: tdt('img'), vec: tdt('vec'),
      imgAttr: '天地图 · 卫星影像', vecAttr: '天地图 · 矢量'
    },

    /* 低层级只标枢纽 / 关隘 / 起终点与两条线名，放大后补出全部途经点 */
    fullLabelZoom: 4.3,

    /* 节点角色 */
    kindLabel: {
      origin: '出发',
      stage: '途经',
      pass: '关隘',
      junction: '枢纽',
      terminus: '抵达'
    },
    roleEn: {
      origin: 'DEPARTURE',
      stage: 'WAYPOINT',
      pass: 'PASS',
      junction: 'JUNCTION',
      terminus: 'ARRIVAL'
    },

    legendNote: '圆点为途经地，方点为枢纽 / 抵达地；朱砂红＝西行去程，靛蓝＝东归回程'
  };
})();
