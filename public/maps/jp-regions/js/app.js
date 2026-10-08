/* 日本行政区划互动地图 —— 互动逻辑
   引擎：_shared/thematic
   交互要点：
   ① 都道府県是面要素，queryRenderedFeatures 直接命中。
   ② 选中用「feature-state 透明填充 + sel 源发光描边」双保险。
   ③ 三种着色：人口 / 面积（log 红阶）与 8 地方（分类色）。 */
(function () {
  'use strict';

  var CFG = window.JP_CONFIG;
  var fmt = Thematic.fmt, esc = Thematic.esc;

  var DATA = {
    pref: 'data/prefectures.geojson',
    muni: 'data/municipalities.geojson'
  };

  var S = {
    pref: [],
    muni: [],
    metric: 'pop',
    sel: null,
    muniSel: null,
    regionCentroids: {},
    totals: { pop: 0, area: 0 }
  };

  var el = {
    metricSeg: document.getElementById('metricSeg'),
    legend: document.getElementById('legend'),
    fPref: document.getElementById('fPref'),
    fMuni: document.getElementById('fMuni'),
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

  /* ── 着色 ── */
  function domain(metric) {
    var pos = [], hi = 0;
    S.pref.forEach(function (f) {
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
    S.pref.forEach(function (f) {
      if (metric === 'region') {
        f.properties.fill = CFG.REGION_COLORS[f.properties.regionZh] || '#94a3b8';
      } else {
        f.properties.fill = rampColor(metric, f.properties[metric]);
      }
    });
    app.map.getSource('pref').setData({ type: 'FeatureCollection', features: S.pref });
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
  function shortPref(name) {
    if (name === '北海道') return '北海道';   // 唯一称「道」，不去尾
    return (name || '').replace(/(都|道|府|県)$/, '');
  }

  /* ── 标注 ── */
  function computeRegionCentroids() {
    var acc = {};
    S.pref.forEach(function (f) {
      var b = mainBbox(f.geometry); if (!b) return;
      var rz = f.properties.regionZh, lng = (b[0] + b[2]) / 2, lat = (b[1] + b[3]) / 2;
      if (!acc[rz]) acc[rz] = { n: 0, lng: 0, lat: 0 };
      acc[rz].n++; acc[rz].lng += lng; acc[rz].lat += lat;
    });
    S.regionCentroids = {};
    Object.keys(acc).forEach(function (k) {
      S.regionCentroids[k] = { lng: acc[k].lng / acc[k].n, lat: acc[k].lat / acc[k].n };
    });
  }
  function setLabels() {
    if (!S.pref.length) { app.setLabels([]); return; }
    var items = [];
    if (S.metric === 'region') {
      // 分类模式：只标 8 个地方，干净
      Object.keys(S.regionCentroids).forEach(function (rz) {
        var c = S.regionCentroids[rz];
        items.push({ text: rz, lng: c.lng, lat: c.lat, color: CFG.REGION_COLORS[rz] || '#fff', kind: 'tag', size: 18, weight: 700 });
      });
    } else {
      S.pref.forEach(function (f) {
        var b = mainBbox(f.geometry); if (!b) return;
        items.push({
          text: shortPref(f.properties.name), lng: (b[0] + b[2]) / 2, lat: (b[1] + b[3]) / 2,
          color: '#fff', kind: 'tag', size: 11,
          active: (S.sel && S.sel.properties.gid === f.properties.gid)
        });
      });
    }
    app.setLabels(items);
  }

  /* ── 图例 ── */
  function renderLegend() {
    if (S.metric === 'region') {
      var rows = '';
      Object.keys(CFG.REGION_COLORS).forEach(function (rz) {
        rows += '<span class="lg-row"><i style="background:' + CFG.REGION_COLORS[rz] + '"></i>' + esc(rz) + '地方</span>';
      });
      el.legend.innerHTML =
        '<div class="lg-cap">按 8 地方 着色</div>' + rows +
        '<div class="lg-note">日本传统把全国分为 8 个「地方」（地方区分），北海道、東北、関東、中部、近畿、中国、四国、九州；都道府県在地方之下。</div>';
      return;
    }
    var m = CFG.METRICS[S.metric];
    var vals = S.pref.map(function (f) { return f.properties[S.metric]; }).filter(function (v) { return v > 0; });
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

  /* ── 选中都道府県 ── */
  function selectPref(f, move) {
    if (S.sel && S.sel.properties.gid) {
      try { app.map.setFeatureState({ source: 'pref', id: S.sel.properties.gid }, { selected: false }); } catch (_) {}
    }
    S.sel = f; S.muniSel = null;
    try { app.map.setFeatureState({ source: 'pref', id: f.properties.gid }, { selected: true }); } catch (_) {}
    app.map.getSource('sel').setData({ type: 'FeatureCollection', features: [f] });
    app.map.setLayoutProperty('pref-glow', 'visibility', 'visible');
    app.map.setLayoutProperty('pref-sel', 'visibility', 'visible');

    var p = f.properties;
    var col = S.metric === 'region' ? (CFG.REGION_COLORS[p.regionZh] || '#e15a52') : '#e15a52';
    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', col);
    el.dtRole.textContent = p.type + '（' + p.typeEn + '）';
    el.dtName.textContent = p.name;
    el.dtSub.textContent = [p.romaji, p.regionZh + '地方'].filter(Boolean).join(' · ');

    el.dtLb1.textContent = '人口'; el.dtV1.textContent = p.pop ? fmt(p.pop, 0) : '—'; el.dtU1.textContent = '人';
    el.dtLb2.textContent = '面积'; el.dtV2.textContent = p.area ? fmt(p.area, 0) : '—'; el.dtU2.textContent = 'km²';
    el.dtLb3.textContent = '县厅'; el.dtV3.textContent = p.capitalZh || '—'; el.dtU3.textContent = '';

    var bits = [];
    if (p.nick) bits.push('昵称：' + p.nick);
    if (p.blurb) bits.push(p.blurb);
    el.dtDescLb.textContent = '看点';
    el.dtDesc.innerHTML = bits.join('；') + '。';

    el.dtFooter.innerHTML = '<span>所属地方：' + esc(p.regionZh) + '</span>' +
      '<span>类型：' + esc(p.type) + '</span>' +
      '<span>GID_1：' + esc(p.gid || '—') + '</span>';

    setLabels();
    app.pulse({ glowId: 'pref-glow', selId: 'pref-sel', baseWidth: 2.4, maxExtra: 4, duration: 1500 });
    if (move) {
      var b = mainBbox(f.geometry);
      if (b) app.fitBounds(b, { withDetail: true, animate: true });
    }
  }

  /* ── 选中市町村 ── */
  function selectMuni(f) {
    S.muniSel = f;
    var p = f.properties;
    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', '#38bdf8');
    el.dtRole.textContent = '市町村';
    el.dtName.textContent = p.name2 || '—';
    el.dtSub.textContent = [p.type2 || p.engtype2, '属 ' + (p.prefZh || '')].filter(Boolean).join(' · ');

    el.dtLb1.textContent = '所属'; el.dtV1.textContent = p.prefZh || '—'; el.dtU1.textContent = '都道府县';
    el.dtLb2.textContent = '类型'; el.dtV2.textContent = p.engtype2 || '—'; el.dtU2.textContent = '';
    el.dtLb3.textContent = '代码'; el.dtV3.textContent = p.gid ? p.gid.replace('JPN.', '') : '—'; el.dtU3.textContent = '';

    el.dtDescLb.textContent = '说明';
    el.dtDesc.textContent = '市町村（日语：しちょうそん）是日本最基层的行政区划，包含市、町、村与特别区；都道府県之下的 1,811 个市町村构成地方的骨架。';

    el.dtFooter.innerHTML = '<span>GID_2：' + esc(p.gid || '—') + '</span>';
    setLabels();
  }

  function clearSel() {
    if (S.sel && S.sel.properties.gid) {
      try { app.map.setFeatureState({ source: 'pref', id: S.sel.properties.gid }, { selected: false }); } catch (_) {}
    }
    S.sel = null; S.muniSel = null;
    app.map.getSource('sel').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('pref-glow', 'visibility', 'none');
    app.map.setLayoutProperty('pref-sel', 'visibility', 'none');
    app.setDetailOpen(false);
    el.detail.hidden = true;
    setLabels();
  }

  /* ── 交互 ── */
  function bind() {
    app.map.on('mousemove', function (e) {
      var f = app.map.queryRenderedFeatures(e.point, { layers: ['pref-fill'] })[0];
      if (f) {
        var p = f.properties, m = CFG.METRICS[S.metric];
        app.map.getCanvas().style.cursor = 'pointer';
        var val = S.metric === 'region' ? (p.regionZh + '地方') : (p[m.key] ? fmt(p[m.key], 0) + ' ' + m.unit : '—');
        app.tooltip('<b>' + esc(p.name) + '</b><br><span style="color:#9fb4cd">' +
          esc(m.label) + '：' + esc(val) + '</span>' +
          '<br><span style="color:#9fb4cd">县厅：' + esc(p.capitalZh || '—') + '</span>',
          e.point.x, e.point.y);
        return;
      }
      app.map.getCanvas().style.cursor = '';
      app.tooltip(null);
    });
    app.map.on('mouseleave', function () { app.tooltip(null); });

    app.map.on('click', 'pref-fill', function (e) {
      if (e.features && e.features[0]) { app.collapseDrawer(); selectPref(e.features[0], true); }
    });
    app.map.on('click', 'muni-line', function (e) {
      if (e.features && e.features[0]) { app.collapseDrawer(); selectMuni(e.features[0]); }
    });
    app.map.on('click', function (e) {
      var hit = app.map.queryRenderedFeatures(e.point, { layers: ['pref-fill', 'muni-line'] });
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
    if (S.metric === 'pop') {
      n.innerHTML = '按<b>人口</b>着色（2020 年国势调查）。东京都一极集中——关东地方（东京、神奈川、埼玉、千叶）就占了全国四成以上人口。';
    } else if (S.metric === 'area') {
      n.innerHTML = '按<b>面积</b>着色。北海道约占全国两成，而神奈川、大阪等都市县面积很小却人口稠密，是「小面积大人口」的反差。';
    } else {
      n.innerHTML = '按<b>8 地方</b>着色。日本传统把全国分为 8 个地方（地方区分），都道府県从属于地方之下——这是理解日本区域格局的钥匙。';
    }
  }

  var app = Thematic.create({
    slug: 'jp-regions',
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
      pref: { data: DATA.pref, promoteId: 'gid' },
      muni: { data: DATA.muni },
      sel: { data: Thematic.EMPTY }
    },
    layers: [
      { id: 'pref-fill', type: 'fill', source: 'pref',
        paint: {
          'fill-color': ['coalesce', ['get', 'fill'], '#c2410c'],
          'fill-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 0.04, 0.68]
        } },
      { id: 'pref-line', type: 'line', source: 'pref',
        paint: { 'line-color': '#ffffff', 'line-width': 0.9, 'line-opacity': 0.42 } },
      { id: 'pref-glow', type: 'line', source: 'sel', layout: { visibility: 'none' },
        paint: { 'line-color': '#fb7185', 'line-width': 5, 'line-opacity': 0.0, 'line-blur': 2 } },
      { id: 'pref-sel', type: 'line', source: 'sel', layout: { visibility: 'none' },
        paint: { 'line-color': '#ffffff', 'line-width': 2, 'line-opacity': 0.95 } },
      { id: 'muni-fill', type: 'fill', source: 'muni', layout: { visibility: 'none' },
        paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.04 } },
      { id: 'muni-line', type: 'line', source: 'muni', layout: { visibility: 'none' },
        paint: { 'line-color': '#cbd5e1', 'line-width': 0.4, 'line-opacity': 0.28 } }
    ],
    onReady: boot,
    onOverview: function () { clearSel(); app.fitAll({ animate: true }); },
    onClose: function () { clearSel(); }
  });

  /* ── 启动 ── */
  function boot() {
    Promise.all([
      fetch(DATA.pref).then(function (r) { return r.json(); }),
      fetch(DATA.muni).then(function (r) { return r.json(); })
    ]).then(function (res) {
      S.pref = res[0].features;
      S.muni = res[1].features;

      S.totals.pop = S.pref.reduce(function (a, f) { return a + (f.properties.pop || 0); }, 0);
      S.totals.area = S.pref.reduce(function (a, f) { return a + (f.properties.area || 0); }, 0);

      el.fPref.textContent = fmt(S.pref.length, 0);
      el.fMuni.textContent = fmt(S.muni.length, 0);
      el.fPop.textContent = (S.totals.pop / 1e8).toFixed(2) + ' 亿';
      el.fArea.textContent = (S.totals.area / 1e4).toFixed(1) + ' 万';

      computeRegionCentroids();
      recolor(S.metric);
      renderLegend();
      updateMetricNote();
      bind();
      app.fitAll({ animate: false });
      setLabels();
      window.__jpDebug = { ready: true, pref: S.pref.length, muni: S.muni.length };
    }).catch(function (err) {
      console.error('[jp-regions] 数据加载失败', err);
      el.detail.hidden = false;
      el.dtDesc.textContent = '数据加载失败，请刷新重试。';
    });
  }
})();
