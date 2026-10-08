/* 澳大利亚行政区划互动地图 —— 互动逻辑
   引擎：_shared/thematic
   两个交互要点：
   ① 州领地是面要素，直接 queryRenderedFeatures 命中（无需 pickNearest，面要素不会相邻几像素重叠）。
   ② 选中州用「feature-state 透明填充 + sel 源发光描边」双保险，和 cn-provinces 一致。 */
(function () {
  'use strict';

  var CFG = window.AUS_CONFIG;
  var fmt = Thematic.fmt, esc = Thematic.esc;

  var DATA = {
    states: 'data/states.geojson',
    lga: 'data/lga.geojson'
  };

  var S = {
    states: [],
    lga: [],
    metric: 'pop',
    sel: null,            // 当前选中的 states feature
    lgaSel: null,
    view: [],
    totals: { pop: 0, area: 0 }
  };

  var el = {
    metricSeg: document.getElementById('metricSeg'),
    legend: document.getElementById('legend'),
    fStates: document.getElementById('fStates'),
    fLga: document.getElementById('fLga'),
    fPop: document.getElementById('fPop'),
    fArea: document.getElementById('fArea'),
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

  /* ── 着色：暖色分级，log 尺度拉开量级差 ── */
  function domain(metric) {
    var pos = [], hi = 0;
    S.states.forEach(function (f) {
      var v = f.properties[metric];
      if (v > 0) pos.push(v);
      if (v > hi) hi = v;
    });
    var lo = pos.length ? Math.min.apply(null, pos) : 1;
    return { lo: Math.log10(lo), hi: Math.log10(hi || 1) };
  }
  function colorOf(metric, value) {
    var d = domain(metric);
    var t = (Math.log10(Math.max(value, 1)) - d.lo) / (d.hi - d.lo || 1);
    t = Math.max(0, Math.min(1, t));
    var i = Math.round(t * (CFG.RAMP.length - 1));
    return CFG.RAMP[i];
  }
  function recolor(metric) {
    S.states.forEach(function (f) {
      f.properties.fill = colorOf(metric, f.properties[metric]);
    });
    app.map.getSource('states').setData({ type: 'FeatureCollection', features: S.states });
  }

  /* ── 几何：取「主体多边形」（面积最大的那个），避免塔斯马尼亚被麦夸里岛拉偏 ── */
  function ringArea(r) {
    var a = 0;
    for (var i = 0; i < r.length; i++) {
      var p1 = r[i], p2 = r[(i + 1) % r.length];
      a += p1[0] * p2[1] - p2[0] * p1[1];
    }
    return a / 2;
  }
  function mainRing(g) {
    if (!g) return null;
    if (g.type === 'Polygon') return g.coordinates[0];
    if (g.type === 'MultiPolygon') {
      var best = null, ba = 0;
      g.coordinates.forEach(function (poly) {
        var r = poly[0], a = Math.abs(ringArea(r));
        if (a > ba) { ba = a; best = r; }
      });
      return best;
    }
    return null;
  }
  function mainBbox(g) {
    var r = mainRing(g);
    if (!r) return null;
    var b = [Infinity, Infinity, -Infinity, -Infinity];
    r.forEach(function (p) {
      if (p[0] < b[0]) b[0] = p[0]; if (p[1] < b[1]) b[1] = p[1];
      if (p[0] > b[2]) b[2] = p[0]; if (p[1] > b[3]) b[3] = p[1];
    });
    return b;
  }

  /* ── 图例 ── */
  function renderLegend() {
    var m = CFG.METRICS[S.metric];
    var vals = S.states.map(function (f) { return f.properties[S.metric]; }).filter(function (v) { return v > 0; });
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    var rows = '';
    for (var i = 0; i < CFG.RAMP.length; i++) {
      var t = i / (CFG.RAMP.length - 1);
      // 反推该档对应的量级（log 尺度）
      var v = Math.round(Math.pow(10, domain(S.metric).lo + t * (domain(S.metric).hi - domain(S.metric).lo)));
      var lab = t === 0 ? '≤ ' + fmt(lo, 0) : (t === 1 ? '≥ ' + fmt(hi, 0) : fmt(v, 0));
      rows += '<span class="lg-row"><i style="background:' + CFG.RAMP[i] + '"></i>' + esc(lab) + '</span>';
    }
    el.legend.innerHTML =
      '<div class="lg-cap">按' + esc(m.label) + '着色 · ' + esc(m.unit) + '</div>' + rows +
      '<div class="lg-note">' + esc(m.hint) + '；颜色越深数值越大（log 尺度）。</div>';
  }

  /* ── 标注：州领地名称（11 个，直接全标） ── */
  function setLabels() {
    if (!S.states.length) { app.setLabels([]); return; }
    var items = [];
    S.states.forEach(function (f) {
      var b = mainBbox(f.geometry);
      if (!b) return;
      var lng = (b[0] + b[2]) / 2, lat = (b[1] + b[3]) / 2;
      items.push({
        text: f.properties.zh, lng: lng, lat: lat,
        color: '#fff', kind: 'tag',
        active: (S.sel && S.sel.properties.gid === f.properties.gid)
      });
    });
    app.setLabels(items);
  }

  /* ── 选中州 ── */
  function selectState(f, move) {
    if (S.sel && S.sel.properties.gid) {
      try { app.map.setFeatureState({ source: 'states', id: S.sel.properties.gid }, { selected: false }); } catch (_) {}
    }
    S.sel = f;
    S.lgaSel = null;
    try { app.map.setFeatureState({ source: 'states', id: f.properties.gid }, { selected: true }); } catch (_) {}

    app.map.getSource('sel').setData({ type: 'FeatureCollection', features: [f] });
    app.map.setLayoutProperty('states-glow', 'visibility', 'visible');
    app.map.setLayoutProperty('states-sel', 'visibility', 'visible');

    var p = f.properties;
    var col = '#f59e0b';
    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', col);
    el.dtRole.textContent = p.ext ? '海外领地' : (p.engtype === 'State' ? 'STATE' : 'TERRITORY');
    el.dtName.textContent = p.zh;
    el.dtSub.textContent = [p.en, p.engtype === 'State' ? '州' : '领地'].filter(Boolean).join(' · ');

    el.dtLb1.textContent = '人口'; el.dtV1.textContent = p.pop ? fmt(p.pop, 0) : '—'; el.dtU1.textContent = '人';
    el.dtLb2.textContent = '面积'; el.dtV2.textContent = p.area ? fmt(p.area, 0) : '—'; el.dtU2.textContent = 'km²';
    el.dtLb3.textContent = '首府'; el.dtV3.textContent = p.capitalZh || '—'; el.dtU3.textContent = p.capitalEn ? '（' + p.capitalEn + '）' : '';

    var bits = [];
    if (p.nick) bits.push('昵称：' + p.nick);
    if (p.blurb) bits.push(p.blurb);
    if (p.joined) bits.push('加入联邦：' + p.joined + ' 年');
    el.dtDescLb.textContent = '看点';
    el.dtDesc.innerHTML = bits.join('；') + '。';

    el.dtFooter.innerHTML = '<span>类型：' + esc(p.engtype || '—') + '</span>' +
      '<span>HASC：' + esc(p.hasc || '—') + '</span>' +
      (p.iso && p.iso !== 'NA' ? '<span>ISO：' + esc(p.iso) + '</span>' : '');

    setLabels();
    app.pulse({ glowId: 'states-glow', selId: 'states-sel', baseWidth: 2.4, maxExtra: 4, duration: 1500 });
    if (move) {
      var b = mainBbox(f.geometry);
      if (b) app.fitBounds(b, { withDetail: true, animate: true });
    }
  }

  /* ── 选中 LGA ── */
  function selectLga(f) {
    S.lgaSel = f;
    var p = f.properties;
    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', '#38bdf8');
    el.dtRole.textContent = 'LGA';
    el.dtName.textContent = p.name2 || '—';
    el.dtSub.textContent = [p.type2 || p.engtype2, '属 ' + (p.name1 || '')].filter(Boolean).join(' · ');

    el.dtLb1.textContent = '所属州'; el.dtV1.textContent = p.name1 || '—'; el.dtU1.textContent = '';
    el.dtLb2.textContent = '类型'; el.dtV2.textContent = p.engtype2 || '—'; el.dtU2.textContent = '';
    el.dtLb3.textContent = '代码'; el.dtV3.textContent = p.gid ? p.gid.replace('AUS.', '') : '—'; el.dtU3.textContent = '';

    el.dtDescLb.textContent = '说明';
    el.dtDesc.textContent = '地方政府区（Local Government Area）是澳大利亚最基层的行政区划，类型包括 City / Region / Area / Shire 等；部分偏远地区为「非建制区」（Unincorporated），不归任何 LGA 管辖。';

    el.dtFooter.innerHTML = '<span>GID_2：' + esc(p.gid || '—') + '</span>';
    setLabels();
  }

  function clearSel() {
    if (S.sel && S.sel.properties.gid) {
      try { app.map.setFeatureState({ source: 'states', id: S.sel.properties.gid }, { selected: false }); } catch (_) {}
    }
    S.sel = null; S.lgaSel = null;
    app.map.getSource('sel').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('states-glow', 'visibility', 'none');
    app.map.setLayoutProperty('states-sel', 'visibility', 'none');
    app.setDetailOpen(false);
    el.detail.hidden = true;
    setLabels();
  }

  /* ── 交互 ── */
  function bind() {
    app.map.on('mousemove', function (e) {
      var f = app.map.queryRenderedFeatures(e.point, { layers: ['states-fill'] })[0];
      if (f) {
        var p = f.properties, m = CFG.METRICS[S.metric];
        app.map.getCanvas().style.cursor = 'pointer';
        app.tooltip('<b>' + esc(p.zh) + '</b><br><span style="color:#9fb4cd">' +
          esc(m.label) + '：' + (p[m.key] ? fmt(p[m.key], 0) : '—') + ' ' + esc(m.unit) + '</span>' +
          (p.capitalZh ? '<br><span style="color:#9fb4cd">首府：' + esc(p.capitalZh) + '</span>' : ''),
          e.point.x, e.point.y);
        return;
      }
      app.map.getCanvas().style.cursor = '';
      app.tooltip(null);
    });
    app.map.on('mouseleave', function () { app.tooltip(null); });

    app.map.on('click', 'states-fill', function (e) {
      if (e.features && e.features[0]) { app.collapseDrawer(); selectState(e.features[0], true); }
    });
    app.map.on('click', 'lga-line', function (e) {
      if (e.features && e.features[0]) { app.collapseDrawer(); selectLga(e.features[0]); }
    });
    app.map.on('click', function (e) {
      // 点在空白处（非州、非 LGA）才清空
      var hit = app.map.queryRenderedFeatures(e.point, { layers: ['states-fill', 'lga-line'] });
      if (!hit.length) clearSel();
    });

    el.metricSeg.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.metric = b.dataset.metric;
      Array.prototype.forEach.call(el.metricSeg.children, function (x) {
        x.classList.toggle('active', x === b);
      });
      recolor(S.metric);
      renderLegend();
    });
  }

  var app = Thematic.create({
    slug: 'au-regions',
    view: CFG.view,
    bounds: CFG.bounds,
    boundsMobile: CFG.boundsMobile,
    extent: CFG.extent,
    graticuleStep: CFG.graticuleStep,
    province: false,
    basemaps: {
      img: [CFG.basemaps.img.tile, CFG.basemaps.img.tile, CFG.basemaps.img.tile, CFG.basemaps.img.tile],
      vec: [CFG.basemaps.vec.tile, CFG.basemaps.vec.tile, CFG.basemaps.vec.tile, CFG.basemaps.vec.tile],
      imgAttr: CFG.imgAttr,
      vecAttr: CFG.vecAttr
    },
    imgPaint: CFG.imgPaint,
    sources: {
      states: { data: DATA.states, promoteId: 'gid' },
      lga: { data: DATA.lga },
      sel: { data: Thematic.EMPTY }
    },
    layers: [
      { id: 'states-fill', type: 'fill', source: 'states',
        paint: {
          'fill-color': ['coalesce', ['get', 'fill'], '#c9a04a'],
          'fill-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 0.04, 0.6]
        } },
      { id: 'states-line', type: 'line', source: 'states',
        paint: { 'line-color': '#ffffff', 'line-width': 0.9, 'line-opacity': 0.42 } },
      { id: 'states-glow', type: 'line', source: 'sel', layout: { visibility: 'none' },
        paint: { 'line-color': '#fbbf24', 'line-width': 5, 'line-opacity': 0.0, 'line-blur': 2 } },
      { id: 'states-sel', type: 'line', source: 'sel', layout: { visibility: 'none' },
        paint: { 'line-color': '#ffffff', 'line-width': 2, 'line-opacity': 0.95 } },
      { id: 'lga-fill', type: 'fill', source: 'lga', layout: { visibility: 'none' },
        paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.04 } },
      { id: 'lga-line', type: 'line', source: 'lga', layout: { visibility: 'none' },
        paint: { 'line-color': '#cbd5e1', 'line-width': 0.4, 'line-opacity': 0.28 } }
    ],
    onReady: boot,
    onOverview: function () { clearSel(); app.fitAll({ animate: true }); },
    onClose: function () { clearSel(); }
  });

  /* ── 启动 ── */
  function boot() {
    Promise.all([
      fetch(DATA.states).then(function (r) { return r.json(); }),
      fetch(DATA.lga).then(function (r) { return r.json(); })
    ]).then(function (res) {
      S.states = res[0].features;
      S.lga = res[1].features;

      // 合计（仅统计 8 个主要行政区，海外领地人口/面积单列为参照）
      var main = S.states.filter(function (f) { return !f.properties.ext; });
      S.totals.pop = main.reduce(function (a, f) { return a + (f.properties.pop || 0); }, 0);
      S.totals.area = main.reduce(function (a, f) { return a + (f.properties.area || 0); }, 0);

      el.fStates.textContent = fmt(S.states.length, 0);
      el.fLga.textContent = fmt(S.lga.length, 0);
      el.fPop.textContent = (S.totals.pop / 1e4).toFixed(0) + ' 万';
      el.fArea.textContent = (S.totals.area / 1e4).toFixed(0) + ' 万';

      recolor(S.metric);
      renderLegend();
      bind();
      app.fitAll({ animate: false });
      setLabels();
      window.__ausDebug = { ready: true, states: S.states.length, lga: S.lga.length };
    }).catch(function (err) {
      console.error('[au-regions] 数据加载失败', err);
      el.detail.hidden = false;
      el.dtDesc.textContent = '数据加载失败，请刷新重试。';
    });
  }
})();
