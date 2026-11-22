/* 三大运营商县级分布图 · 配置
   着色口径与市级图一致：主视图按「谁是移动在该县的主要挑战者」——
     cu 联通挑战（北方，红）/ ct 电信挑战（南方，蓝）/
     cm 移动一家独大（份额≥60%，绿）/ flat 三家接近（灰）。
   单家视角切到连续色阶：按该家市级估算份额 12–68% 插值。
   全国口径：2025 年报移动 55.8% / 电信 24.4% / 联通 19.8%。

   注意：县级为市级基准的三次推算，可信度低于市级与省级。 */
window.CTM_CONFIG = (function () {
  var COLORS = {
    cu: '#f05a5a',   // 联通挑战 · 红
    ct: '#4a9fe0',   // 电信挑战 · 蓝
    cm: '#3fc98a',   // 移动独大 · 绿
    flat: '#7c8eb0', // 三家接近 · 灰
    na: '#5b6b82'    // 港澳 · 不适用
  };
  var LEADS = [
    { key: 'cu', name: '联通挑战', desc: '北方城市 · 联通为第二，份额明显高于电信' },
    { key: 'ct', name: '电信挑战', desc: '南方城市 · 电信为第二，固网根基深' },
    { key: 'cm', name: '移动独大', desc: '份额 ≥ 60% · 移动一家独大' },
    { key: 'flat', name: '充分竞争', desc: '三家份额接近 · 移动领先不足 8 个百分点' }
  ].map(function (g) { g.color = COLORS[g.key]; return g; });

  var VIEWS = [
    { key: 'all', name: '格局', desc: '按主要挑战者着色' },
    { key: 'cm', name: '移动', desc: '移动份额色阶' },
    { key: 'ct', name: '电信', desc: '电信份额色阶' },
    { key: 'cu', name: '联通', desc: '联通份额色阶' }
  ];

  var RAMPS = {
    cm: ['#163a2f', '#1e6b4c', '#2ea36a', '#3fc98a', '#8ce6b8'],
    ct: ['#122b45', '#1c5586', '#2a7fbc', '#4a9fe0', '#9ad0f5'],
    cu: ['#3a1c22', '#7d2c34', '#b13d47', '#f05a5a', '#f9a3a3']
  };

  return {
    view: { center: [104.5, 35.8], zoom: 3.7, minZoom: 3, maxZoom: 14 },
    bounds: [73.0, 17.0, 136.0, 54.5],
    boundsMobile: [82, 19, 127, 50],
    extent: [72, 16, 138, 56],
    graticuleStep: 2,
    imgPaint: {
      'raster-brightness-max': 0.6,
      'raster-brightness-min': 0.05,
      'raster-saturation': -0.35,
      'raster-contrast': 0.06
    },
    COLORS: COLORS,
    LEADS: LEADS,
    VIEWS: VIEWS,
    RAMPS: RAMPS,
    NATION: { cm: 55.8, ct: 24.4, cu: 19.8, total: 18.01 },
    LEAD_LABEL: { cu: '联通挑战', ct: '电信挑战', cm: '移动独大', flat: '充分竞争', na: '不适用' }
  };
})();
