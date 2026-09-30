/* 中国地势三级阶梯 —— 互动逻辑（基于 _shared/thematic 共享运行时） */
(function () {
  'use strict';

  var CFG = window.TERRAIN_CONFIG;
  var DATA = 'data/stages.json';
  var fmt = Thematic.fmt, esc = Thematic.esc;

  var stages = [], byId = {}, selected = '';
  var el = {
    list: document.getElementById('stageList'),
    legend: document.getElementById('legend'),
    strip: document.getElementById('strip'),
    fStage1: document.getElementById('fStage1'),
    detail: document.getElementById('detail'),
    dtRole: document.getElementById('dtRole'),
    dtName: document.getElementById('dtName'),
    dtElev: document.getElementById('dtElev'),
    dtElevV: document.getElementById('dtElevV'),
    dtShare: document.getElementById('dtShare'),
    dtArea: document.getElementById('dtArea'),
    dtTerrain: document.getElementById('dtTerrain'),
    dtFooter: document.getElementById('dtFooter')
  };

  var app = Thematic.create({
    slug: 'cn-terrain-steps',
    view: CFG.view,
    bounds: CFG.bounds,
    extent: [72, 16, 138, 56],
    defaultBasemap: 'img',                 // 默认卫星影像
    imgPaint: {                           // 卫星影像压暗，避免过亮抢掉阶梯色块
      'raster-brightness-max': 0.58,
      'raster-saturation': -0.25,
      'raster-contrast': 0.12
    },
    sources: {
      stage: { data: DATA, promoteId: 'id' },
      sel: { data: Thematic.EMPTY },
      edge: { data: Thematic.EMPTY }
    },
    layers: [
      { id: 'stage-fill', type: 'fill', source: 'stage',
        paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.46 } },
      { id: 'stage-line', type: 'line', source: 'stage',
        layout: { 'line-join': 'round' },
        paint: { 'line-color': ['get', 'color'], 'line-width': 1.7, 'line-opacity': 0.92 } },
      { id: 'stage-glow', type: 'line', source: 'sel',
        layout: { 'line-join': 'round', 'visibility': 'none' },
        paint: { 'line-color': ['get', 'color'], 'line-width': 12, 'line-opacity': 0, 'line-blur': 7 } },
      { id: 'stage-sel', type: 'line', source: 'sel',
        layout: { 'line-join': 'round', 'visibility': 'none' },
        paint: { 'line-color': '#ffffff', 'line-width': 2.4, 'line-opacity': 0.9 } },
      { id: 'edge-dash', type: 'line', source: 'edge',
        layout: { 'line-join': 'round', 'visibility': 'none' },
        paint: { 'line-color': '#ffffff', 'line-width': 2.6, 'line-opacity': 0.0, 'line-dasharray': [2, 1.6] } }
    ],
    onReady: boot,
    onOverview: function () { clearSel(); app.fitAll({ animate: true }); },
    onClose: function () { clearSel(); },
    onReplay: function () { if (selected) pulseSel(); }
  });

  /* ── 渲染 ───────────────────────────────────────────────── */
  function renderList() {
    el.list.innerHTML = stages.map(function (f) {
      var p = f.properties;
      return '<button type="button" data-id="' + p.id + '">' +
        '<span class="no">' + p.level + '</span>' +
        '<span class="tx"><b>' + esc(p.name) + '</b><small>' + esc(p.elev) + '</small></span></button>';
    }).join('');
    el.list.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      app.collapseDrawer();
      selectStage(b.dataset.id, true);
    };
  }

  function renderLegend() {
    el.legend.innerHTML = stages.map(function (f) {
      var p = f.properties;
      return '<span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:' +
        p.color + '"></i>' + esc(p.name) + '</span>';
    }).join('');
  }

  function renderStrip() {
    el.strip.innerHTML = stages.map(function (f) {
      var p = f.properties;
      return '<button type="button" data-id="' + p.id + '" style="--rc:' + p.color + '" title="' + esc(p.elev) + '">' +
        '<i></i><span><b>' + esc(p.name) + '</b><small>' + fmt(p.area_wan_km2) + ' 万 km²</small></span></button>';
    }).join('');
    el.strip.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      app.collapseDrawer();
      selectStage(b.dataset.id, true);
    };
  }

  function setLabels() {
    var items = stages.map(function (f) {
      var p = f.properties;
      var ll = CFG.stageLabelAt[p.id] || [104, 35];
      return { text: p.name, lng: ll[0], lat: ll[1], color: p.color, kind: 'square', active: p.id === selected };
    });
    CFG.mountains.forEach(function (m) {
      items.push({ text: m.name, lng: m.lng, lat: m.lat, color: m.edge === 1 ? '#b07ad6' : '#e0924a', kind: 'tag' });
    });
    app.setLabels(items);
  }

  function renderDetail(f) {
    app.setDetailOpen(!!f);
    el.detail.hidden = !f;
    if (!f) return;
    var p = f.properties;
    var total = stages.reduce(function (a, x) { return a + (x.properties.area_wan_km2 || 0); }, 0);
    el.detail.style.setProperty('--rc', p.color);
    el.dtRole.textContent = CFG.badge[p.id] || 'STEP';
    el.dtName.textContent = p.name;
    el.dtElev.textContent = p.elev;
    el.dtElevV.textContent = p.elev.replace(/[^0-9~ ]/g, '').trim() || p.elev;
    el.dtShare.textContent = total ? (p.area_wan_km2 / total * 100).toFixed(0) : '—';
    el.dtArea.textContent = fmt(p.area_wan_km2);
    el.dtTerrain.textContent = p.terrain;
    el.dtFooter.innerHTML = '<span>' + esc(p.note) + '</span><span style="flex-basis:100%;color:#b9c8dc">' +
      esc(CFG.watch[p.id] || '') + '</span>';
  }

  function syncUI() {
    Array.prototype.forEach.call(document.querySelectorAll('#stageList button'), function (b) {
      b.classList.toggle('active', b.dataset.id === selected);
    });
    var btns = document.querySelectorAll('#strip button');
    Array.prototype.forEach.call(btns, function (b) {
      b.classList.toggle('active', b.dataset.id === selected);
    });
    if (selected) app.scrollStripIntoView(document.querySelector('#strip button.active'));
  }

  /* ── 选中与特效 ─────────────────────────────────────────── */
  function outlineOf(f) {
    var feats = [];
    var g = f.geometry;
    var polys = g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates];
    // 只画有效面积较大的主体边界，避免小碎块也发光
    var areas = polys.map(function (poly) {
      var ring = poly[0], a = 0, i;
      for (i = 0; i < ring.length - 1; i++) a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
      return Math.abs(a / 2);
    });
    var maxA = Math.max.apply(null, areas);
    polys.forEach(function (poly, i) {
      if (areas[i] < maxA * 0.02) return;
      poly.forEach(function (ring, k) {
        if (k > 0) return;   // 只取外环
        feats.push({ type: 'Feature', properties: f.properties,
          geometry: { type: 'LineString', coordinates: ring } });
      });
    });
    return { type: 'FeatureCollection', features: feats };
  }

  function pulseSel() {
    var f = byId[selected]; if (!f) return;
    app.pulse({ glowId: 'stage-glow', selId: 'stage-sel', baseWidth: 11, maxExtra: 9, duration: 1600 });
  }

  function selectStage(id, move) {
    var f = byId[id]; if (!f) return;
    selected = id;
    var o = outlineOf(f);
    app.map.getSource('sel').setData(o);
    app.map.getSource('edge').setData(o);
    app.map.setLayoutProperty('stage-glow', 'visibility', 'visible');
    app.map.setLayoutProperty('stage-sel', 'visibility', 'visible');
    app.map.setPaintProperty('stage-fill', 'fill-opacity',
      ['case', ['==', ['get', 'id'], id], 0.62, 0.20]);
    app.map.setPaintProperty('stage-line', 'line-opacity',
      ['case', ['==', ['get', 'id'], id], 1, 0.45]);
    renderDetail(f); syncUI(); setLabels(); pulseSel();
    if (move) {
      var b = Thematic.padBbox(Thematic.bboxOf(f.geometry), 0.6);
      app.fitBounds(b, { animate: true, maxZoom: 6.2, withDetail: true, duration: 720 });
    }
  }

  function clearSel() {
    selected = '';
    app.stopFx();
    app.map.getSource('sel').setData(Thematic.EMPTY);
    app.map.getSource('edge').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('stage-glow', 'visibility', 'none');
    app.map.setLayoutProperty('stage-sel', 'visibility', 'none');
    app.map.setPaintProperty('stage-fill', 'fill-opacity', 0.46);
    app.map.setPaintProperty('stage-line', 'line-opacity', 0.92);
    renderDetail(null); syncUI(); setLabels();
  }

  /* ── 交互 ───────────────────────────────────────────────── */
  function bind() {
    var tip = null;
    app.map.on('mousemove', function (e) {
      var f = app.pick(e.point, ['stage-fill'], 0);
      if (f) {
        app.map.getCanvas().style.cursor = 'pointer';
        app.tooltip('<b>' + esc(f.properties.name) + '</b> <span style="color:#8fa3bd">' + esc(f.properties.elev) + '</span>',
          e.point.x, e.point.y);
      } else {
        app.map.getCanvas().style.cursor = '';
        app.tooltip(null);
      }
    });
    app.map.on('mouseleave', function () { app.tooltip(null); });
    app.map.on('click', function (e) {
      var f = app.pick(e.point, ['stage-fill']);
      if (f) { app.collapseDrawer(); selectStage(f.properties.id, true); }
      else clearSel();
    });
  }

  /* ── 启动 ───────────────────────────────────────────────── */
  function boot(a) {
    fetch(DATA).then(function (r) { return r.json(); }).then(function (fc) {
      stages = fc.features.slice().sort(function (x, y) { return x.properties.level - y.properties.level; });
      stages.forEach(function (f) { byId[f.properties.id] = f; });
      var s1 = byId['stage-1'];
      el.fStage1.textContent = s1 ? fmt(s1.properties.area_wan_km2) : '—';
      renderList(); renderLegend(); renderStrip(); setLabels();
      bind();
      app.fitAll({ animate: false });
    }).catch(function (err) {
      console.error('[cn-terrain-steps] 数据加载失败', err);
      el.list.innerHTML = '<p class="note">地势数据加载失败，请刷新重试。</p>';
    });
  }
})();
