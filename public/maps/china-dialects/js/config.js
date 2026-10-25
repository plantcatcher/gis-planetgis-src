/* 中国汉语方言分布 · 表现层配置
   数据：县级主分区取自《中国语言地图集(第2版)汉语方言卷》分类（2649 县有记录），
   县界为 WGS84 干净县级多边形（2891 县，含台湾 20、港澳 19）。
   着色口径 = 图集给每个县定的「大区」（pattern_group，与首路径 100% 一致）。 */
window.CNDIAL_CONFIG = (function () {
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
    '官话': '#e8613c', '晋语': '#b06a2c', '吴语': '#3d8fd1', '徽语': '#1f7d72',
    '赣语': '#a552b3', '湘语': '#d24f6a', '闽语': '#f0b429', '客家话': '#7cb342',
    '粤语': '#2fbf9e', '平话和土话': '#9aa0a6', '其他': '#c9a878', '未记录': '#6b7280'
  };

  /* 按县数降序；count 由构建脚本统计（县级记录数，非人口） */
  var GROUPS = [
    { key: '官话',       count: 1906 },
    { key: '晋语',       count: 219 },
    { key: '吴语',       count: 152 },
    { key: '客家话',     count: 132 },
    { key: '闽语',       count: 123 },
    { key: '粤语',       count: 78 },
    { key: '赣语',       count: 78 },
    { key: '湘语',       count: 60 },
    { key: '徽语',       count: 11 },
    { key: '平话和土话', count: 2 },
    { key: '其他',       count: 14, name: '其他（乡话·儋州话·军话等）' },
    { key: '未记录',     count: 116, name: '暂无汉语方言分区记录' }
  ].map(function (g) { g.color = COLORS[g.key]; if (!g.name) g.name = g.key; return g; });

  return {
    view: { center: [104.5, 34.6], zoom: 3.9, minZoom: 3, maxZoom: 10 },
    bounds: [73.0, 17.5, 135.5, 54.5],
    extent: [73.0, 17.5, 135.5, 54.5],
    boundsMobile: [96, 20, 126, 46],
    graticuleStep: 5,
    defaultBasemap: 'none',
    imgPaint: { 'raster-brightness-max': 0.92, 'raster-brightness-min': 0.02, 'raster-saturation': -0.04, 'raster-contrast': 0.05 },
    basemaps: {
      img: tdt('img'), vec: tdt('vec'),
      imgAttr: '天地图 · 卫星影像', vecAttr: '天地图 · 矢量'
    },
    COLORS: COLORS,
    GROUPS: GROUPS,
    TOTAL_COUNTIES: 2891,
    HAN_COUNTIES: 2775,  // 有方言记录/补全的县（2891 - 116 未记录）

    /* 汉语人口基数衰减曲线：hc = 该省汉族人口占比（七普，省级均值）
       → 填色不透明度倍率。目的是让「新疆=官话」这类读法不被误读：
       新疆汉族 42%、西藏 12%，色块很淡；川渝 93%、中原 99%，色块实。 */
    HC_STOPS: [[12, 0.46], [45, 0.58], [65, 0.74], [85, 0.9], [96, 1.0]],
    HC_HATCH: 70          // 汉族人口占比低于此值的省，叠斜纹（提示：汉语非本地主体语言）
  };
})();
