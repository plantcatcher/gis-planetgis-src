/* 中国人口密度点密度图 + 胡焕庸线 · 互动逻辑（基于 _shared/thematic 共享运行时）
 *
 * 图层（绘制顺序，后者在上）：
 *   prov-hit   省面透明命中层（悬浮/点击省用）
 *   dots       人口点（东南暖金 / 西北冷蓝，每点=5万人）
 *   hu-casing  胡焕庸线白色描边
 *   hu-glow    胡焕庸线外发光
 *   hu-line    胡焕庸线本体
 *   hu-pt      线两端端点（黑河 / 腾冲）
 *   selprov    选中省份高亮（填充 + 描边）
 */
(function () {
  'use strict';

  var CFG = window.CNPOPD_CONFIG;
  var DOTS_URL = 'data/dots.geojson';
  var fmt = Thematic.fmt, esc = Thematic.esc;
  var POP = CFG.POP;

  var COL_E = '#ffcf5c', COL_W = '#5cc8ff', HU = '#ff5470';
  var sel = null;

  var el = {
    fDots: document.getElementById('fDots'),
    fEast: document.getElementById('fEast'),
    fWest: document.getElementById('fWest'),
    fEastPct: document.getElementById('fEastPct'),
    legend: document.getElementById('legend'),
    detail: document.getElementById('detail'),
    dtRole: document.getElementById('dtRole'),
    dtName: document.getElementById('dtName'),
    dtSub: document.getElementById('dtSub'),
    dtLb1: document.getElementById('dtLb1'), dtV1: document.getElementById('dtV1'), dtU1: document.getElementById('dtU1'),
    dtLb2: document.getElementById('dtLb2'), dtV2: document.getElementById('dtV2'), dtU2: document.getElementById('dtU2'),
    dtLb3: document.getElementById('dtLb3'), dtV3: document.getElementById('dtV3'), dtU3: document.getElementById('dtU3'),
    dtDescLb: document.getElementById('dtDescLb'),
    dtDesc: document.getElementById('dtDesc'),
    dtFooter: document.getElementById('dtFooter')
  };

  /* 胡焕庸线 GeoJSON 源 */
  function huSources() {
    var a = CFG.hu.a, b = CFG.hu.b;
    return {
      hu: { data: { type: 'FeatureCollection', features: [{
        type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [a, b] }
      }] } },
      hupts: { data: { type: 'FeatureCollection', features: [
        { type: 'Feature', properties: { name: CFG.hu.aName }, geometry: { type: 'Point', coordinates: a } },
        { type: 'Feature', properties: { name: CFG.hu.bName }, geometry: { type: 'Point', coordinates: b } }
      ] } },
      selprov: { data: Thematic.EMPTY }
    };
  }

  var app = Thematic.create({
    slug: 'cn-pop-density',
    view: CFG.view,
    bounds: CFG.bounds,
    extent: CFG.extent,
    graticuleStep: CFG.graticuleStep,
    defaultBasemap: CFG.defaultBasemap,
    imgPaint: CFG.imgPaint,
    sources: Object.assign({ dots: { data: Thematic.EMPTY } }, huSources()),
    layers: [
      { id: 'prov-hit', type: 'fill', source: 'prov', filter: ['has', 'name'],
        paint: { 'fill-color': '#ffffff', 'fill-opacity': 0 } },
      { id: 'dots', type: 'circle', source: 'dots',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 1.0, 6, 1.7, 10, 3.2],
          'circle-color': ['match', ['get', 's'], 'E', COL_E, 'W', COL_W, COL_E],
          'circle-opacity': 0.9,
          'circle-blur': 0.35
        } },
      { id: 'hu-casing', type: 'line', source: 'hu',
        paint: { 'line-color': '#ffffff', 'line-width': ['interpolate', ['linear'], ['zoom'], 3, 4, 8, 8], 'line-opacity': 0.35 } },
      { id: 'hu-glow', type: 'line', source: 'hu',
        paint: { 'line-color': HU, 'line-width': ['interpolate', ['linear'], ['zoom'], 3, 6, 8, 12], 'line-blur': 6, 'line-opacity': 0.28 } },
      { id: 'hu-line', type: 'line', source: 'hu',
        paint: { 'line-color': HU, 'line-width': ['interpolate', ['linear'], ['zoom'], 3, 2.4, 8, 5], 'line-opacity': 1 } },
      { id: 'hu-pt', type: 'circle', source: 'hupts',
        paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 3, 8, 5],
          'circle-color': HU, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.4, 'circle-opacity': 1 } },
      { id: 'selprov', type: 'fill', source: 'selprov',
        paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.14 } },
      { id: 'selprov-line', type: 'line', source: 'selprov',
        paint: { 'line-color': '#ffffff', 'line-width': 1.6, 'line-opacity': 0.9 } }
    ],
    onReady: boot,
    onOverview: function () { clearSel(); app.fitAll({ animate: true }); },
    onClose: clearSel
  });

  function boot() {
    fetch(DOTS_URL).then(function (r) { return r.json(); }).then(function (fc) {
      app.map.getSource('dots').setData(fc);

      // 统计东/西两侧
      var e = 0, w = 0;
      fc.features.forEach(function (f) { if (f.properties.s === 'E') e++; else w++; });
      var total = e + w;
      var ePct = total ? (100 * e / total) : 0;
      if (el.fDots) el.fDots.textContent = fmt(total, 0);
      if (el.fEast) el.fEast.textContent = fmt(e, 0);
      if (el.fWest) el.fWest.textContent = fmt(w, 0);
      if (el.fEastPct) el.fEastPct.textContent = ePct.toFixed(0) + '%';

      bind();
      app.fitAll({ animate: false });
      setLabels();
      renderLegend(ePct);
      window.__app = app;
      window.__popdDebug = { ready: true, total: total, east: e, west: w, ePct: ePct };
    }).catch(function (err) {
      console.error('[cn-pop-density] 人口点加载失败', err);
      if (el.detail) { el.detail.hidden = false; el.dtDesc.textContent = '人口点数据加载失败，请刷新重试。'; }
    });
  }

  function renderLegend(ePct) {
    if (!el.legend) return;
    el.legend.innerHTML =
      '<div class="lg-cap">人口点 · 每粒 = 5 万人</div>' +
      '<span class="lg-row"><i style="background:' + COL_E + ';border-radius:50%"></i>东南侧（约 ' + (ePct ? ePct.toFixed(0) : 94) + '% 人口）</span>' +
      '<span class="lg-row"><i style="background:' + COL_W + ';border-radius:50%"></i>西北侧（约 ' + (ePct ? (100 - ePct).toFixed(0) : 6) + '% 人口）</span>' +
      '<div class="lg-cap" style="margin-top:8px">胡焕庸线</div>' +
      '<span class="lg-row"><i style="background:' + HU + ';height:3px;border-radius:2px"></i>黑河（瑷珲）— 腾冲</span>' +
      '<div class="lg-note">东南暖金、西北冷蓝；一条线把两种人口密度劈成两半。</div>';
  }

  function setLabels() {
    var items = [
      { text: CFG.hu.aName, lng: CFG.hu.a[0], lat: CFG.hu.a[1], color: HU, kind: 'tag', size: 12, weight: 700 },
      { text: CFG.hu.bName, lng: CFG.hu.b[0], lat: CFG.hu.b[1], color: HU, kind: 'tag', size: 12, weight: 700 }
    ];
    app.setLabels(items);
  }

  function fmtPop(v) {
    if (v >= 1e4) { if (el.dtU1) el.dtU1.textContent = '亿'; return (v / 1e4).toFixed(2); }
    if (el.dtU1) el.dtU1.textContent = '万'; return (v / 1e4 * 10000 / 1e4).toFixed(0); // 万人
  }

  function selectProv(f) {
    var p = f.properties;
    var ad = p.adcode, name = p.name || '—';
    var pop = POP[ad];
    sel = f;

    app.map.getSource('selprov').setData({ type: 'FeatureCollection', features: [f] });
    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', '#ffffff');
    el.dtRole.textContent = '省级行政区';
    el.dtName.textContent = name;
    el.dtSub.textContent = [p.level === 'province' ? '省/自治区/直辖市/特别行政区' : ''].filter(Boolean).join('');

    if (pop) {
      el.dtLb1.textContent = '常住人口'; el.dtV1.textContent = (pop / 1e4).toFixed(2); el.dtU1.textContent = '亿';
      el.dtLb2.textContent = '占全国'; el.dtV2.textContent = (100 * pop / 141178).toFixed(1) + '%'; el.dtU2.textContent = '';
    } else {
      el.dtLb1.textContent = '常住人口'; el.dtV1.textContent = '—'; el.dtU1.textContent = '';
      el.dtLb2.textContent = '占全国'; el.dtV2.textContent = '—'; el.dtU2.textContent = '';
    }
    el.dtLb3.textContent = 'adcode'; el.dtV3.textContent = String(ad || '—'); el.dtU3.textContent = '';

    el.dtDescLb.textContent = '看点';
    el.dtDesc.textContent = pop
      ? ('按第七次人口普查，' + name + '约有 ' + (pop / 1e4).toFixed(2) + ' 亿常住人口；点上每粒代表 5 万人，点的疏密即人口密度。')
      : '点上每粒代表 5 万人，点的疏密即人口密度。';

    el.dtFooter.innerHTML = '<span>胡焕庸线</span><span>东南侧人口占比约 94%</span><span>西北侧约 6%</span>';

    // 飞向该省
    var b = Thematic.bboxOf(f.geometry);
    if (b) app.fitBounds(b, { withDetail: true, animate: true });
  }

  function clearSel() {
    sel = null;
    try { app.map.getSource('selprov').setData(Thematic.EMPTY); } catch (_) {}
    if (el.detail) { el.detail.hidden = true; }
    app.setDetailOpen(false);
  }

  function bind() {
    // 省悬浮提示
    app.map.on('mousemove', 'prov-hit', function (e) {
      var f = e.features && e.features[0];
      if (!f) return;
      var p = f.properties, ad = p.adcode, pop = POP[ad];
      app.map.getCanvas().style.cursor = 'pointer';
      var html = '<b>' + esc(p.name || '') + '</b>';
      if (pop) html += '<br><span style="color:#9fb4cd">常住人口：' + fmt(pop, 0) + ' 万人</span>';
      html += '<br><span style="color:#9fb4cd">点按看它在胡焕庸线哪一侧</span>';
      app.tooltip(html, e.point.x, e.point.y);
    });
    app.map.on('mouseleave', 'prov-hit', function () { app.tooltip(null); });

    // 点击省：选中 + 飞向
    app.map.on('click', 'prov-hit', function (e) {
      var f = e.features && e.features[0];
      if (f) { app.collapseDrawer(); selectProv(f); }
    });
    // 点击空白处：若点在省界之外（海洋/国界外）不清除，避免误触；仅 Esc / 总览清选

    // 图层开关：人口点 / 胡焕庸线（多图层联动 + 端点标签）
    var ckDots = document.getElementById('ckDots');
    if (ckDots) ckDots.addEventListener('change', function () { window.__popdToggleDots(this.checked); });
    var ckHu = document.getElementById('ckHu');
    if (ckHu) ckHu.addEventListener('change', function () { window.__popdToggleHu(this.checked); });
  }

  /* 暴露给面板里"胡焕庸线"开关备用 */
  window.__popdToggleHu = function (on) {
    app.setVisible('hu-line', on); app.setVisible('hu-glow', on);
    app.setVisible('hu-casing', on); app.setVisible('hu-pt', on);
    setLabels(); // 端点标签随线显隐
  };
  window.__popdToggleDots = function (on) { app.setVisible('dots', on); };
})();
