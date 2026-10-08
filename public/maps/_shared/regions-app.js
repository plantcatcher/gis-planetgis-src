/* 通用行政区划互动地图 —— 共享互动逻辑（regions-app）
   供 egy/esp/kor/mng/ukr/vnm-regions 复用；各国差异全部放进 js/config.js：
     window.MAP_CONFIG = {
       slug, view, bounds, boundsMobile, extent, graticuleStep,
       basemaps, imgAttr, vecAttr, imgPaint,
       RAMP, GROUP_COLORS, METRICS,
       DATA: { main, sub },
       TEXT: {
         groupSuffix, capitalLabel, subRole, subBelongLabel, mainLabel,
         subDesc, notes: { pop, area, group }, overviewHint
       },
       shortLabel: 可选 fn(name) → 标注文字
     }
   交互要点：
   ① 主层是面要素，queryRenderedFeatures 直接命中；子层线图层命中。
   ② 选中用「feature-state 透明填充 + sel 源发光描边」双保险。
   ③ 三种着色：人口 / 面积（log 分级）与分组（分类色）。 */
(function () {
  'use strict';

  var CFG = window.MAP_CONFIG;
  if (!CFG) { console.error('[regions-app] window.MAP_CONFIG 未定义'); return; }
  var fmt = Thematic.fmt, esc = Thematic.esc;
  var T = CFG.TEXT;

  var DATA = {
    main: CFG.DATA.main,
    sub: CFG.DATA.sub
  };

  var S = {
    main: [],
    sub: [],
    metric: 'pop',
    sel: null,
    subSel: null,
    groupCentroids: {},
    totals: { pop: 0, area: 0 }
  };

  var el = {
    metricSeg: document.getElementById('metricSeg'),
    legend: document.getElementById('legend'),
    fMain: document.getElementById('fMain'),
    fSub: document.getElementById('fSub'),
    fPop: document.getElementById('fPop'),
    fPopU: document.getElementById('fPopU'),
    fArea: document.getElementById('fArea'),
    fAreaU: document.getElementById('fAreaU'),
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

  /* ── 着色 ── */
  function domain(metric) {
    var pos = [], hi = 0;
    S.main.forEach(function (f) {
      var v = f.properties[metric];
      if (v > 0) pos.push(v);
      if (v > hi) hi = v;
    });
    var lo = pos.length ? Math.min.apply(null, pos) : 1;
    return { lo: Math.log10(lo), hi: Math.log10(hi || 1) };
  }
  function rampColor(metric, value) {
    var d = domain(metric);
    var t = (Math.log10(Math.max(value, 1)) - d.lo) / (d.hi - d.lo || 1);
    t = Math.max(0, Math.min(1, t));
    var i = Math.round(t * (CFG.RAMP.length - 1));
    return CFG.RAMP[i];
  }
  function recolor(metric) {
    S.main.forEach(function (f) {
      if (metric === 'group') {
        f.properties.fill = CFG.GROUP_COLORS[f.properties.groupZh] || '#94a3b8';
      } else {
        f.properties.fill = rampColor(metric, f.properties[metric]);
      }
    });
    app.map.getSource('main').setData({ type: 'FeatureCollection', features: S.main });
  }

  /* ── 几何：取「主体多边形」算中心，避免离岛拉偏 ── */
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
  function shortName(name) {
    if (typeof CFG.shortLabel === 'function') return CFG.shortLabel(name) || name;
    return name;
  }

  /* ── 标注 ── */
  function computeGroupCentroids() {
    var acc = {};
    S.main.forEach(function (f) {
      var b = mainBbox(f.geometry); if (!b) return;
      var gz = f.properties.groupZh, lng = (b[0] + b[2]) / 2, lat = (b[1] + b[3]) / 2;
      if (!acc[gz]) acc[gz] = { n: 0, lng: 0, lat: 0 };
      acc[gz].n++; acc[gz].lng += lng; acc[gz].lat += lat;
    });
    S.groupCentroids = {};
    Object.keys(acc).forEach(function (k) {
      S.groupCentroids[k] = { lng: acc[k].lng / acc[k].n, lat: acc[k].lat / acc[k].n };
    });
  }
  function setLabels() {
    if (!S.main.length) { app.setLabels([]); return; }
    var items = [];
    if (S.metric === 'group') {
      Object.keys(S.groupCentroids).forEach(function (gz) {
        var c = S.groupCentroids[gz];
        items.push({ text: gz, lng: c.lng, lat: c.lat, color: CFG.GROUP_COLORS[gz] || '#fff', kind: 'tag', size: 18, weight: 700 });
      });
    } else {
      S.main.forEach(function (f) {
        var b = mainBbox(f.geometry); if (!b) return;
        items.push({
          text: shortName(f.properties.name), lng: (b[0] + b[2]) / 2, lat: (b[1] + b[3]) / 2,
          color: '#fff', kind: 'tag', size: 11,
          active: (S.sel && S.sel.properties.gid === f.properties.gid)
        });
      });
    }
    app.setLabels(items);
  }

  /* ── 图例 ── */
  function renderLegend() {
    if (S.metric === 'group') {
      var rows = '';
      Object.keys(CFG.GROUP_COLORS).forEach(function (gz) {
        rows += '<span class="lg-row"><i style="background:' + CFG.GROUP_COLORS[gz] + '"></i>' + esc(gz) + '</span>';
      });
      el.legend.innerHTML =
        '<div class="lg-cap">按' + esc(CFG.METRICS.group.label) + '着色</div>' + rows +
        '<div class="lg-note">' + esc(CFG.METRICS.group.hint) + '</div>';
      return;
    }
    var m = CFG.METRICS[S.metric];
    var vals = S.main.map(function (f) { return f.properties[S.metric === 'group' ? 'pop' : S.metric]; }).filter(function (v) { return v > 0; });
    if (!vals.length) vals = [1];
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    var rows2 = '';
    for (var i = 0; i < CFG.RAMP.length; i++) {
      var t = i / (CFG.RAMP.length - 1);
      var v = Math.round(Math.pow(10, domain(S.metric).lo + t * (domain(S.metric).hi - domain(S.metric).lo)));
      var lab = t === 0 ? '≤ ' + fmt(lo, 0) : (t === 1 ? '≥ ' + fmt(hi, 0) : fmt(v, 0));
      rows2 += '<span class="lg-row"><i style="background:' + CFG.RAMP[i] + '"></i>' + esc(lab) + '</span>';
    }
    el.legend.innerHTML =
      '<div class="lg-cap">按' + esc(m.label) + '着色 · ' + esc(m.unit) + '</div>' + rows2 +
      '<div class="lg-note">' + esc(m.hint) + '；颜色越深数值越大（log 尺度）。</div>';
  }

  /* ── 选中主层 ── */
  function selectMain(f, move) {
    if (S.sel && S.sel.properties.gid) {
      try { app.map.setFeatureState({ source: 'main', id: S.sel.properties.gid }, { selected: false }); } catch (_) {}
    }
    S.sel = f; S.subSel = null;
    try { app.map.setFeatureState({ source: 'main', id: f.properties.gid }, { selected: true }); } catch (_) {}
    app.map.getSource('sel').setData({ type: 'FeatureCollection', features: [f] });
    app.map.setLayoutProperty('main-glow', 'visibility', 'visible');
    app.map.setLayoutProperty('main-sel', 'visibility', 'visible');

    var p = f.properties;
    var col = S.metric === 'group' ? (CFG.GROUP_COLORS[p.groupZh] || '#e15a52') : getComputedStyle(document.documentElement).getPropertyValue('--accent-light').trim() || '#e15a52';
    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', col);
    el.dtRole.textContent = p.type + (p.typeEn ? '（' + p.typeEn + '）' : '');
    el.dtName.textContent = p.name;
    el.dtSub.textContent = [p.nameEn, p.groupZh].filter(Boolean).join(' · ');

    el.dtLb1.textContent = '人口'; el.dtV1.textContent = p.pop ? fmt(p.pop, 0) : '—'; el.dtU1.textContent = '人';
    el.dtLb2.textContent = '面积'; el.dtV2.textContent = p.area ? fmt(p.area, 0) : '—'; el.dtU2.textContent = 'km²';
    el.dtLb3.textContent = T.capitalLabel || '首府'; el.dtV3.textContent = p.capital || '—'; el.dtU3.textContent = '';

    el.dtDescLb.textContent = '看点';
    el.dtDesc.textContent = p.blurb || '——';

    var bits = ['<span>' + (T.groupSuffix || '') + '：' + esc(p.groupZh) + '</span>'];
    if (p.nameLocal) bits.push('<span>原名：' + esc(p.nameLocal) + '</span>');
    bits.push('<span>类型：' + esc(p.type) + '</span>');
    bits.push('<span>GID：' + esc(p.gid || '—') + '</span>');
    el.dtFooter.innerHTML = bits.join('');

    setLabels();
    app.pulse({ glowId: 'main-glow', selId: 'main-sel', baseWidth: 2.4, maxExtra: 4, duration: 1500 });
    if (move) {
      var b = mainBbox(f.geometry);
      if (b) app.fitBounds(b, { withDetail: true, animate: true });
    }
  }

  /* ── 选中子层 ── */
  function selectSub(f) {
    S.subSel = f;
    var p = f.properties;
    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', '#38bdf8');
    el.dtRole.textContent = T.subRole;
    el.dtName.textContent = p.name2 || '—';
    el.dtSub.textContent = [p.engtype2 || p.type2, '属 ' + (p.provZh || '')].filter(Boolean).join(' · ');

    el.dtLb1.textContent = '所属'; el.dtV1.textContent = p.provZh || '—'; el.dtU1.textContent = T.mainLabel || '';
    el.dtLb2.textContent = '类型'; el.dtV2.textContent = p.engtype2 || p.type2 || '—'; el.dtU2.textContent = '';
    el.dtLb3.textContent = '代码'; el.dtV3.textContent = p.gid ? p.gid.replace(/^[A-Z]+\./, '') : '—'; el.dtU3.textContent = '';

    el.dtDescLb.textContent = '说明';
    el.dtDesc.textContent = T.subDesc || '';

    el.dtFooter.innerHTML = '<span>GID：' + esc(p.gid || '—') + '</span>';
    setLabels();
  }

  function clearSel() {
    if (S.sel && S.sel.properties.gid) {
      try { app.map.setFeatureState({ source: 'main', id: S.sel.properties.gid }, { selected: false }); } catch (_) {}
    }
    S.sel = null; S.subSel = null;
    app.map.getSource('sel').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('main-glow', 'visibility', 'none');
    app.map.setLayoutProperty('main-sel', 'visibility', 'none');
    app.setDetailOpen(false);
    el.detail.hidden = true;
    setLabels();
  }

  /* ── 交互 ── */
  function bind() {
    app.map.on('mousemove', function (e) {
      var f = app.map.queryRenderedFeatures(e.point, { layers: ['main-fill'] })[0];
      if (f) {
        var p = f.properties, m = CFG.METRICS[S.metric];
        app.map.getCanvas().style.cursor = 'pointer';
        var val = S.metric === 'group' ? p.groupZh : (p[m.key] ? fmt(p[m.key], 0) + ' ' + m.unit : '—');
        app.tooltip('<b>' + esc(p.name) + '</b><br><span style="color:#9fb4cd">' +
          esc(m.label) + '：' + esc(val) + '</span>' +
          '<br><span style="color:#9fb4cd">' + esc(T.capitalLabel || '首府') + '：' + esc(p.capital || '—') + '</span>',
          e.point.x, e.point.y);
        return;
      }
      app.map.getCanvas().style.cursor = '';
      app.tooltip(null);
    });
    app.map.on('mouseleave', function () { app.tooltip(null); });

    app.map.on('click', 'main-fill', function (e) {
      if (e.features && e.features[0]) { app.collapseDrawer(); selectMain(e.features[0], true); }
    });
    app.map.on('click', 'sub-line', function (e) {
      if (e.features && e.features[0]) { app.collapseDrawer(); selectSub(e.features[0]); }
    });
    app.map.on('click', function (e) {
      var hit = app.map.queryRenderedFeatures(e.point, { layers: ['main-fill', 'sub-line'] });
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
      updateMetricNote();
      setLabels();
    });
  }

  function updateMetricNote() {
    var n = document.getElementById('metricNote');
    if (!n) return;
    n.innerHTML = T.notes[S.metric] || '';
  }

  var app = Thematic.create({
    slug: CFG.slug,
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
      main: { data: DATA.main, promoteId: 'gid' },
      sub: { data: DATA.sub },
      sel: { data: Thematic.EMPTY }
    },
    layers: [
      { id: 'main-fill', type: 'fill', source: 'main',
        paint: {
          'fill-color': ['coalesce', ['get', 'fill'], '#c2410c'],
          'fill-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 0.04, 0.68]
        } },
      { id: 'main-line', type: 'line', source: 'main',
        paint: { 'line-color': '#ffffff', 'line-width': 0.9, 'line-opacity': 0.42 } },
      { id: 'main-glow', type: 'line', source: 'sel', layout: { visibility: 'none' },
        paint: { 'line-color': '#fb7185', 'line-width': 5, 'line-opacity': 0.0, 'line-blur': 2 } },
      { id: 'main-sel', type: 'line', source: 'sel', layout: { visibility: 'none' },
        paint: { 'line-color': '#ffffff', 'line-width': 2, 'line-opacity': 0.95 } },
      { id: 'sub-fill', type: 'fill', source: 'sub', layout: { visibility: 'none' },
        paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.04 } },
      { id: 'sub-line', type: 'line', source: 'sub', layout: { visibility: 'none' },
        paint: { 'line-color': '#cbd5e1', 'line-width': 0.4, 'line-opacity': 0.28 } }
    ],
    onReady: boot,
    onOverview: function () { clearSel(); app.fitAll({ animate: true }); },
    onClose: function () { clearSel(); }
  });

  /* ── 启动 ── */
  function fmtPop(v) {
    if (v >= 1e8) { el.fPopU.textContent = '亿'; return (v / 1e8).toFixed(2) + ' 亿'; }
    el.fPopU.textContent = '万'; return (v / 1e4).toFixed(0) + ' 万';
  }
  function fmtArea(v) {
    el.fAreaU.textContent = '万km²'; return (v / 1e4).toFixed(1) + ' 万';
  }

  function boot() {
    Promise.all([
      fetch(DATA.main).then(function (r) { return r.json(); }),
      fetch(DATA.sub).then(function (r) { return r.json(); })
    ]).then(function (res) {
      S.main = res[0].features;
      S.sub = res[1].features;

      S.totals.pop = S.main.reduce(function (a, f) { return a + (f.properties.pop || 0); }, 0);
      S.totals.area = S.main.reduce(function (a, f) { return a + (f.properties.area || 0); }, 0);

      el.fMain.textContent = fmt(S.main.length, 0);
      el.fSub.textContent = fmt(S.sub.length, 0);
      el.fPop.textContent = fmtPop(S.totals.pop);
      el.fArea.textContent = fmtArea(S.totals.area);

      computeGroupCentroids();
      recolor(S.metric);
      renderLegend();
      updateMetricNote();
      bind();
      app.fitAll({ animate: false });
      setLabels();
      window.__regionsDebug = { ready: true, main: S.main.length, sub: S.sub.length };
    }).catch(function (err) {
      console.error('[regions-app] 数据加载失败', err);
      el.detail.hidden = false;
      el.dtDesc.textContent = '数据加载失败，请刷新重试。';
    });
  }
})();
