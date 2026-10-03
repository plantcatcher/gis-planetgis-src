/* 中国历史十次人口迁徙 · 互动逻辑（基于 _shared/thematic 共享运行时）
 *
 * 结构：
 *   1. 建图与图层（含动态添加的「流向箭头」symbol 层）
 *   2. 数据装载
 *   3. 界面渲染（分组章节 / 时间轴 / 图例 / 详情卡 / 标注）
 *   4. 选中与特效（事件多路线脉冲 + 沿流向揭示 / 城市呼吸圈）
 *   5. 悬停、点击、图层与底图
 *
 * 数据说明见 scripts/build_cn_pop_migration.py：路线是「起讫城市连线」的关系示意，
 * 并非历史路径实测线画。
 */
(function () {
  'use strict';

  var CFG = window.CNPOP_CONFIG;
  var ROUTE_URL = 'data/routes.json';
  var NODE_URL = 'data/nodes.json';
  var EVENT_URL = 'data/events.json';
  var fmt = Thematic.fmt, esc = Thematic.esc;

  /* MapLibre 的 GeoJSON 源会把数组型 property 序列化成 JSON 字符串
     （queryRenderedFeatures 拿到的是 '["a","b"]' 而非 ['a','b']），
     所以凡是读数组型属性都要过这道反序列化，否则 .join / .length 会错。 */
  function arrOf(v) {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') {
      try { var a = JSON.parse(v); if (Array.isArray(a)) return a; } catch (_) {}
      return v ? [v] : [];
    }
    return [];
  }

  var routes = [], nodes = [], events = [], groups = [];
  var byRoute = {}, byNode = {}, byEvent = {};
  var selected = { type: '', id: '', name: '', events: null };
  var hovered = { type: '', id: '' };
  var fullLabels = null;

  var el = {
    chapters: document.getElementById('chapters'),
    legend: document.getElementById('legend'),
    detail: document.getElementById('detail'),
    dtRole: document.getElementById('dtRole'),
    dtName: document.getElementById('dtName'),
    dtTagline: document.getElementById('dtTagline'),
    dtM1Label: document.getElementById('dtM1Label'),
    dtM1: document.getElementById('dtM1'),
    dtM2Label: document.getElementById('dtM2Label'),
    dtM2: document.getElementById('dtM2'),
    dtM3Label: document.getElementById('dtM3Label'),
    dtM3: document.getElementById('dtM3'),
    dtDescLabel: document.getElementById('dtDescLabel'),
    dtDesc: document.getElementById('dtDesc'),
    dtFooter: document.getElementById('dtFooter')
  };

  /* ── 1. 建图 ────────────────────────────────────────────── */
  var app = Thematic.create({
    slug: 'cn-pop-migration',
    view: CFG.view,
    bounds: CFG.bounds,
    extent: CFG.extent,
    graticuleStep: CFG.graticuleStep,
    defaultBasemap: CFG.defaultBasemap,
    imgPaint: CFG.imgPaint,
    sources: {
      route: { data: Thematic.EMPTY, promoteId: 'id' },
      node: { data: Thematic.EMPTY, promoteId: 'id' },
      selRoute: { data: Thematic.EMPTY },
      selNode: { data: Thematic.EMPTY },
      walk: { data: Thematic.EMPTY }
    },
    layers: [
      /* 路线：先深色描边打底，彩色线在暗底上才读得出来 */
      { id: 'route-casing', type: 'line', source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#04101c',
          /* 描边透明度随选中态走：选中时更实，未选中时压到半透，让位给流线本色 */
          'line-opacity': ['case',
            ['boolean', ['feature-state', 'sel'], false], 0.9,
            ['boolean', ['feature-state', 'dim'], false], 0.22,
            0.55],
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 2.6, 7, 5, 11, 8]
        } },
      { id: 'route-line', type: 'line', source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 1.8, 7, 3.4, 11, 6],
          /* 常态半透明航道感；选中当前迁徙时不透明，其余压暗退到背景 */
          'line-opacity': ['case',
            ['boolean', ['feature-state', 'sel'], false], 0.98,
            ['boolean', ['feature-state', 'dim'], false], 0.18,
            0.52]
        } },
      /* 选中事件的外发光 + 本体（宽度由 rAF 脉冲） */
      { id: 'route-glow', type: 'line', source: 'selRoute',
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint: { 'line-color': ['get', 'color'], 'line-width': 13, 'line-opacity': 0, 'line-blur': 7 } },
      { id: 'route-sel', type: 'line', source: 'selRoute',
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 3, 7, 5.4, 11, 8.5],
          'line-opacity': 1
        } },
      /* 选中后持续流动的虚线：航线「流动灯光」效果，沿流向循环滚动 */
      { id: 'route-flow', type: 'line', source: 'selRoute',
        layout: { 'line-cap': 'butt', 'line-join': 'round', 'visibility': 'none' },
        paint: {
          'line-color': '#ffffff',
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 1.4, 7, 2.4, 11, 4],
          'line-opacity': 0.85,
          'line-dasharray': [0, 4, 3]
        } },
      /* 沿流向揭示动画：一道亮线从迁出地走到迁入地 */
      { id: 'route-walk', type: 'line', source: 'walk',
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint: {
          'line-color': '#fffaf0',
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 2.2, 7, 3.8, 11, 6],
          'line-opacity': 0.96
        } },
      /* 城市点位：枢纽最大，迁出地 / 迁入地次之 */
      { id: 'node-dot', type: 'circle', source: 'node',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            3, ['case', ['==', ['get', 'role'], 'hub'], 4.4, 3.2],
            9, ['case', ['==', ['get', 'role'], 'hub'], 7.6, 5.4]],
          'circle-color': ['case',
            ['==', ['get', 'role'], 'origin'], '#ffcf7a',
            ['==', ['get', 'role'], 'dest'], '#8fd4ff', '#ffffff'],
          'circle-stroke-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#ffffff', '#04101c'],
          'circle-stroke-width': ['case', ['boolean', ['feature-state', 'hover'], false], 2.2, 1.3],
          'circle-opacity': ['case', ['boolean', ['feature-state', 'dim'], false], 0.3, 0.98]
        } },
      /* 选中城市的呼吸描边圈 */
      { id: 'node-halo', type: 'circle', source: 'selNode',
        layout: { 'visibility': 'none' },
        paint: {
          'circle-radius': 11, 'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2.1, 'circle-opacity': 0.7
        } }
    ],
    onReady: boot,
    onOverview: function () { clearSel(); app.fitBounds(CFG.bounds, { animate: true, maxZoom: 9, duration: 780 }); },
    onClose: function () { clearSel(); },
    onReplay: function () { replay(); }
  });

  var map = app.map;

  /* 流向箭头：用 canvas 画好后返回标准 ImageData（自带正确长度的 .data），
     这样 MapLibre 的 addImage 才能正确读取像素；直接传 canvas 会因无 .data 报错。
     箭头以 symbol 层沿线路放置并随线旋转（不依赖字形服务）。 */
  function makeArrow() {
    var s = 30, c = document.createElement('canvas');
    c.width = s; c.height = s;
    var x = c.getContext('2d');
    x.clearRect(0, 0, s, s);
    x.fillStyle = '#ffffff';
    x.beginPath();
    // 导航箭头：尖头 + 后凹缺口，比实心三角更利落
    x.moveTo(s * 0.92, s / 2);
    x.lineTo(s * 0.26, s * 0.16);
    x.lineTo(s * 0.44, s / 2);
    x.lineTo(s * 0.26, s * 0.84);
    x.closePath(); x.fill();
    return x.getImageData(0, 0, s, s);
  }

  /* ── 2. 数据装载 ────────────────────────────────────────── */
  function boot() {
    try { map.addImage('arrow', makeArrow()); } catch (e) { console.warn('[arrow] addImage 失败', e); }
    if (map.getImage('arrow')) {
      map.addLayer({
        id: 'arrow-sel', type: 'symbol', source: 'selRoute',
        layout: {
          'symbol-placement': 'line',
          'icon-image': 'arrow',
          'icon-rotation-alignment': 'map',
          'icon-size': ['interpolate', ['linear'], ['zoom'], 3, 0.5, 7, 0.82],
          'symbol-spacing': 60,
          'icon-allow-overlap': true,
          'visibility': 'none'
        },
        paint: { 'icon-color': '#ffffff', 'icon-opacity': 0.92 }
      });
    }

    Promise.all([
      fetch(ROUTE_URL).then(function (r) { return r.json(); }),
      fetch(NODE_URL).then(function (r) { return r.json(); }),
      fetch(EVENT_URL).then(function (r) { return r.json(); })
    ]).then(function (res) {
      routes = res[0].features;
      nodes = res[1].features;
      events = res[2].features;
      groups = res[2].groups || [];
      routes.forEach(function (f) { byRoute[f.properties.id] = f; });
      nodes.forEach(function (f) { byNode[f.properties.id] = f; });
      events.forEach(function (f) { byEvent[f.id] = f; });

      map.getSource('route').setData({ type: 'FeatureCollection', features: routes });
      map.getSource('node').setData({ type: 'FeatureCollection', features: nodes });

      renderChapters(); renderLegend();
      bindLayout(); bindHover();
      setLabels(true);
      // 首屏聚焦中国本土，把东南亚方向留给「全网总览」
      app.fitBounds(CFG.chinaCore, { animate: false });
    }).catch(function (err) {
      console.error('[cn-pop-migration] 数据加载失败', err);
      el.chapters.innerHTML = '<p class="note">迁徙数据加载失败，请刷新重试。</p>';
    });
  }

  /* ── 3. 界面渲染 ────────────────────────────────────────── */
  function renderChapters() {
    var html = '';
    groups.forEach(function (g) {
      html += '<div class="chap-group"><div class="chap-group-h">' + esc(g.name) + '</div>';
      g.events.forEach(function (eid) {
        var e = byEvent[eid]; if (!e) return;
        html += '<button type="button" data-event="' + e.id + '" style="--rc:' + e.color + '">' +
          '<span class="no">' + esc(e.no) + '</span>' +
          '<span class="tx"><b>' + esc(e.name) + '</b>' +
          '<small>' + esc(e.period) + ' · ' + esc(e.driver) + ' · ' + e.route_count + ' 条</small></span></button>';
      });
      html += '</div>';
    });
    el.chapters.innerHTML = html;
    el.chapters.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      app.collapseDrawer(); selectEvent(b.dataset.event, true);
    };
  }

  function renderLegend() {
    var lines = events.map(function (e) {
      return '<span><em><i style="background:' + e.color + '"></i></em>' + esc(e.name) + '</span>';
    }).join('');
    el.legend.innerHTML = lines +
      '<span><s style="background:#ffffff"></s>枢纽</span>' +
      '<span><s style="background:#ffcf7a"></s>迁出地</span>' +
      '<span><s style="background:#8fd4ff"></s>迁入地</span>';
  }

  /* ── 详情卡 ─────────────────────────────────────────────── */
  function renderDetailEvent(e) {
    var p = e;
    el.detail.style.setProperty('--rc', p.color);
    el.dtRole.textContent = 'MIGRATION';
    el.dtName.textContent = p.name;
    el.dtTagline.textContent = p.period + ' · ' + p.driver;
    el.dtM1Label.textContent = '时间'; el.dtM1.textContent = p.period;
    el.dtM2Label.textContent = '迁出地'; el.dtM2.textContent = p.origin;
    el.dtM3Label.textContent = '代表路线'; el.dtM3.textContent = p.route_count + ' 条';
    el.dtDescLabel.textContent = '概述';
    el.dtDesc.textContent = p.desc;
    el.dtFooter.innerHTML =
      '<span>动因 <b>' + esc(p.driver) + '</b></span>' +
      '<span>空间格局 <b>' + esc(p.group_name) + '</b></span>' +
      '<span>时段 <b>' + esc(p.period) + '</b></span>';
    el.detail.hidden = false; app.setDetailOpen(true);
  }

  function renderDetailRoute(f) {
    var p = f.properties;
    el.detail.style.setProperty('--rc', p.color);
    el.dtRole.textContent = 'ROUTE · ' + p.event_no;
    el.dtName.textContent = p.origin + ' → ' + p.destination;
    el.dtTagline.textContent = p.event_name + ' · ' + p.period;
    el.dtM1Label.textContent = '迁出地'; el.dtM1.textContent = p.origin;
    el.dtM2Label.textContent = '迁入地'; el.dtM2.textContent = p.destination;
    el.dtM3Label.textContent = '里程'; el.dtM3.textContent = fmt(p.length_km) + ' km';
    el.dtDescLabel.textContent = '路线概述';
    el.dtDesc.textContent = p.desc;
    el.dtFooter.innerHTML =
      '<span>所属迁徙 <b>' + esc(p.event_name) + '</b></span>' +
      '<span>动因 <b>' + esc(p.driver) + '</b></span>';
    el.detail.hidden = false; app.setDetailOpen(true);
  }

  function renderDetailNode(f, evs) {
    var p = f.properties;
    el.detail.style.setProperty('--rc', '#cfe0f5');
    el.dtRole.textContent = CFG.roleEn[p.role] || 'NODE';
    el.dtName.textContent = p.name;
    var enames = arrOf(p.event_names).join('、');
    el.dtTagline.textContent = (CFG.roleLabel[p.role] || '城市') + ' · ' + enames;
    el.dtM1Label.textContent = '角色'; el.dtM1.textContent = CFG.roleLabel[p.role] || '城市';
    el.dtM2Label.textContent = '涉及迁徙'; el.dtM2.textContent = (p.events ? p.events.length : 0) + ' 次';
    el.dtM3Label.textContent = '坐标'; el.dtM3.textContent = p.wgs84[1].toFixed(2) + '°N, ' + p.wgs84[0].toFixed(2) + '°E';
    var evList = (p.events || []).map(function (eid) {
      var e = byEvent[eid]; return e ? ('<b>' + esc(e.no) + ' ' + esc(e.name) + '</b> ' + esc(e.period)) : '';
    }).filter(Boolean).join('；');
    el.dtDescLabel.textContent = '在迁徙中的位置';
    /* evList 内含 <b>（各段已 esc），需按 HTML 渲染而非纯文本 */
    el.dtDesc.innerHTML = '在十次大迁徙中作为' + esc(CFG.roleLabel[p.role] || '城市') + '，参与：' + (evList || '—');
    el.dtFooter.innerHTML =
      '<span>WGS84 <b>' + p.wgs84[0].toFixed(2) + '°E, ' + p.wgs84[1].toFixed(2) + '°N</b></span>';
    el.detail.hidden = false; app.setDetailOpen(true);
  }

  function hideDetail() { el.detail.hidden = true; app.setDetailOpen(false); }

  /* 标注：事件名常驻（取各事件最长路线中点）；城市低层级只标枢纽，放大后补全 */
  function setLabels(force) {
    var full = map.getZoom() >= CFG.fullLabelZoom;
    if (!force && full === fullLabels) return;
    fullLabels = full;

    var items = [];
    events.forEach(function (e) {
      var rl = routes.filter(function (r) { return r.properties.event === e.id; });
      if (!rl.length) return;
      rl.sort(function (a, b) { return b.properties.length_km - a.properties.length_km; });
      var ll = Thematic.pointAt(rl[0].geometry.coordinates, rl[0].properties.label_at || 0.5);
      items.push({ text: e.name, lng: ll[0], lat: ll[1], color: e.color, kind: 'tag',
        active: selected.type === 'event' && selected.id === e.id });
    });
    nodes.forEach(function (f) {
      var p = f.properties;
      if (p.role !== 'hub' && !full) return;
      items.push({
        text: p.name, lng: f.geometry.coordinates[0], lat: f.geometry.coordinates[1],
        color: '#cfe0f5', kind: 'dot',
        active: selected.type === 'node' && selected.name === p.name
      });
    });
    app.setLabels(items);
  }

  /* ── 4. 选中与特效 ──────────────────────────────────────── */
  function setRouteState(eventsSet) {
    routes.forEach(function (f) {
      var isSel = !!(eventsSet && eventsSet.has(f.properties.event));
      /* sel = 属于当前选中；dim = 有选中但这条不在其中（压到背景） */
      map.setFeatureState({ source: 'route', id: f.properties.id },
        { sel: isSel, dim: !!(eventsSet && !isSel) });
    });
  }
  function setNodeState(eventsSet) {
    nodes.forEach(function (f) {
      var evs = f.properties.events || [];
      var inter = !eventsSet || evs.some(function (e) { return eventsSet.has(e); });
      map.setFeatureState({ source: 'node', id: f.properties.id }, { dim: !inter });
    });
  }

  /* 多路线同步揭示：各线按同一进度切片，避免共用源互相覆盖 */
  function _buildSlices(coords, n) {
    var acc = [0], i;
    for (i = 1; i < coords.length; i++) {
      var dx = coords[i][0] - coords[i - 1][0], dy = coords[i][1] - coords[i - 1][1];
      acc.push(acc[i - 1] + Math.hypot(dx, dy));
    }
    var total = acc[acc.length - 1] || 1, out = [];
    for (var k = 1; k <= n; k++) {
      var t = total * k / n, j = 1;
      while (j < acc.length - 1 && acc[j] < t) j++;
      out.push(coords.slice(0, Math.max(2, j + 1)));
    }
    return out;
  }
  function revealMany(coordsList, opts) {
    var src = map.getSource('walk'); if (!src) return;
    app.stopFx();
    var n = 26;
    var slices = coordsList.map(function (c) { return _buildSlices(c, n); });
    var token = app._fx.token;
    var t0 = performance.now();
    var dur = (opts && opts.duration) || 2200;
    function frame(now) {
      if (token !== app._fx.token) return;
      var p = Math.min((now - t0) / dur, 1);
      var idx = Math.min(n - 1, Math.floor(p * n));
      var feats = coordsList.map(function (c, i) {
        return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: slices[i][idx] } };
      });
      src.setData({ type: 'FeatureCollection', features: feats });
      if (p < 1) { app._fx.raf = requestAnimationFrame(frame); return; }
      app._fx.raf = 0;
      setTimeout(function () {
        if (token === app._fx.token) { src.setData(Thematic.EMPTY); app.setVisible('route-walk', false); }
      }, (opts && opts.fade) || 460);
    }
    app.setVisible('route-walk', true);
    app._fx.raf = requestAnimationFrame(frame);
  }

  function pulseNode() {
    if (!map.getLayer('node-halo')) return;
    map.setLayoutProperty('node-halo', 'visibility', 'visible');
    var t0 = performance.now(), DUR = 1500;
    (function step(now) {
      var p = Math.min((now - t0) / DUR, 1);
      var e = 0.16 + 0.84 * Math.pow(Math.sin(p * Math.PI * 3), 2);
      map.setPaintProperty('node-halo', 'circle-radius', 9 + e * 9);
      map.setPaintProperty('node-halo', 'circle-opacity', 0.22 + e * 0.6);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  function bboxOfFeats(feats) {
    var b = [Infinity, Infinity, -Infinity, -Infinity];
    feats.forEach(function (f) {
      var x = Thematic.bboxOf(f.geometry);
      if (!x) return;
      b[0] = Math.min(b[0], x[0]); b[1] = Math.min(b[1], x[1]); b[2] = Math.max(b[2], x[2]); b[3] = Math.max(b[3], x[3]);
    });
    return b[0] === Infinity ? null : b;
  }

  /* 航线流光：沿选中路线循环滚动的虚线（像航线的流动灯光） */
  var flowTimer = null;
  function startFlow() {
    stopFlow();
    if (!map.getLayer('route-flow')) return;
    var ck = document.getElementById('ckArrows');
    if (ck && !ck.checked) return;   // 尊重「流向箭头」开关：关掉则只显示静态线
    map.setLayoutProperty('route-flow', 'visibility', 'visible');
    var seq = [
      [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, 0.5],
      [3, 4, 0], [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5],
      [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5]
    ];
    var step = 0, token = app._fx.token;
    flowTimer = setInterval(function () {
      if (token !== app._fx.token) { stopFlow(); return; }
      map.setPaintProperty('route-flow', 'line-dasharray', seq[step]);
      step = (step + 1) % seq.length;
    }, 90);
  }
  function stopFlow() {
    if (flowTimer) { clearInterval(flowTimer); flowTimer = null; }
    if (map.getLayer('route-flow')) {
      map.setLayoutProperty('route-flow', 'visibility', 'none');
      map.setPaintProperty('route-flow', 'line-dasharray', [0, 4, 3]);
    }
  }

  function selectEvent(id, move) {
    var e = byEvent[id]; if (!e) return;
    selected = { type: 'event', id: id, events: new Set([id]) };
    var evRoutes = routes.filter(function (r) { return r.properties.event === id; });
    map.getSource('selRoute').setData({ type: 'FeatureCollection', features: evRoutes });
    map.getSource('selNode').setData(Thematic.EMPTY);
    ['route-glow', 'route-sel', 'arrow-sel', 'route-walk', 'route-flow'].forEach(function (lid) {
      if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', 'visible');
    });
    setRouteState(selected.events); setNodeState(selected.events);
    renderDetailEvent(e); syncUI(); setLabels(true);
    revealMany(evRoutes.map(function (r) { return r.geometry.coordinates; }), { duration: 2200 });
    startFlow();
    if (move) app.fitBounds(bboxOfFeats(evRoutes), { animate: true, maxZoom: 6.2, withDetail: true, duration: 780 });
  }

  function selectRoute(id, move) {
    var f = byRoute[id]; if (!f) return;
    selected = { type: 'route', id: id, events: new Set([f.properties.event]) };
    map.getSource('selRoute').setData({ type: 'FeatureCollection', features: [f] });
    map.getSource('selNode').setData(Thematic.EMPTY);
    ['route-glow', 'route-sel', 'arrow-sel', 'route-walk', 'route-flow'].forEach(function (lid) {
      if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', 'visible');
    });
    setRouteState(selected.events); setNodeState(selected.events);
    renderDetailRoute(f); syncUI(); setLabels(true);
    revealMany([f.geometry.coordinates], { duration: 1800 });
    startFlow();
    if (move) app.fitBounds(bboxOfFeats([f]), { animate: true, maxZoom: 6.5, withDetail: true, duration: 720 });
  }

  function selectNode(id, move) {
    var f = byNode[id]; if (!f) return;
    var evs = new Set(f.properties.events || []);
    selected = { type: 'node', id: id, name: f.properties.name, events: evs };
    var evRoutes = routes.filter(function (r) { return evs.has(r.properties.event); });
    map.getSource('selRoute').setData({ type: 'FeatureCollection', features: evRoutes });
    map.getSource('selNode').setData({ type: 'FeatureCollection', features: [f] });
    ['route-glow', 'route-sel', 'arrow-sel', 'route-walk', 'route-flow'].forEach(function (lid) {
      if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', 'visible');
    });
    if (map.getLayer('route-glow')) {
      map.setPaintProperty('route-glow', 'line-width', 12);
      map.setPaintProperty('route-glow', 'line-opacity', 0.22);
    }
    setRouteState(evs); setNodeState(evs);
    renderDetailNode(f, evs); syncUI(); setLabels(true);
    pulseNode();
    startFlow();
    if (move) {
      var c = f.geometry.coordinates;
      app.fitBounds(Thematic.padBbox([c[0], c[1], c[0], c[1]], 0.5), { animate: true, maxZoom: 6.8, withDetail: true, duration: 700 });
    }
  }

  function clearSel() {
    selected = { type: '', id: '', name: '', events: null };
    app.stopFx(); app.clearReveal('walk', 'route-walk');
    map.getSource('selRoute').setData(Thematic.EMPTY);
    map.getSource('selNode').setData(Thematic.EMPTY);
    ['route-glow', 'route-sel', 'arrow-sel', 'route-walk', 'route-flow'].forEach(function (lid) {
      if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', 'none');
    });
    stopFlow();
    setRouteState(null); setNodeState(null);
    hideDetail(); syncUI(); setLabels(true);
  }

  function replay() {
    if (selected.type === 'event') {
      var evRoutes = routes.filter(function (r) { return r.properties.event === selected.id; });
      revealMany(evRoutes.map(function (r) { return r.geometry.coordinates; }), { duration: 2200 });
    } else if (selected.type === 'route') {
      revealMany([byRoute[selected.id].geometry.coordinates], { duration: 1800 });
    } else if (selected.type === 'node') {
      pulseNode();
    }
  }

  function syncUI() {
    var active = selected.type === 'event'
      ? new Set([selected.id])
      : (selected.events || new Set());
    Array.prototype.forEach.call(document.querySelectorAll('#chapters button'), function (b) {
      b.classList.toggle('active', active.has(b.dataset.event));
    });
  }

  /* ── 5. 悬停 / 点击 / 控件 ──────────────────────────────── */
  function geomDistance(g, pt) {
    var min = Infinity;
    (function walk(c) {
      if (typeof c[0] === 'number') {
        var p = map.project(c), dx = p.x - pt.x, dy = p.y - pt.y;
        var d = Math.sqrt(dx * dx + dy * dy); if (d < min) min = d;
      } else { for (var i = 0; i < c.length; i++) walk(c[i]); }
    })(g.coordinates);
    return min;
  }
  function pickNearest(pt, layers, pad) {
    var box = pad > 0 ? [[pt.x - pad, pt.y - pad], [pt.x + pad, pt.y + pad]] : pt;
    var fs = map.queryRenderedFeatures(box, { layers: layers });
    if (fs.length <= 1) return fs.length ? fs[0] : null;
    var best = null, bd = Infinity;
    for (var i = 0; i < fs.length; i++) {
      var d = geomDistance(fs[i].geometry, pt);
      if (d < bd) { bd = d; best = fs[i]; }
    }
    return best;
  }

  function bindHover() {
    map.on('mousemove', function (e) {
      var n = pickNearest(e.point, ['node-dot'], Thematic.isMobile() ? 16 : 6);
      var f = n ? null : pickNearest(e.point, ['route-line'], Thematic.isMobile() ? 14 : 5);
      var nextType = n ? 'node' : (f ? 'route' : '');
      var nextId = n ? n.properties.id : (f ? f.properties.id : '');
      if (nextType !== hovered.type || nextId !== hovered.id) {
        if (hovered.type) map.setFeatureState({ source: hovered.type, id: hovered.id }, { hover: false });
        hovered = { type: nextType, id: nextId };
        if (nextType) map.setFeatureState({ source: nextType, id: nextId }, { hover: true });
      }
      if (nextType) {
        map.getCanvas().style.cursor = 'pointer';
        var p = nextType === 'node' ? n.properties : f.properties;
        var sub = nextType === 'node'
          ? ((CFG.roleLabel[p.role] || '城市') + ' · ' + arrOf(p.event_names).join('、'))
          : (p.event_name + ' · ' + fmt(p.length_km) + ' km');
        app.tooltip('<b>' + esc(p.name || (p.origin + ' → ' + p.destination)) + '</b> <span style="color:#8fa3bd">' + esc(sub) + '</span>', e.point.x, e.point.y);
      } else { map.getCanvas().style.cursor = ''; app.tooltip(null); }
    });
    map.on('mouseleave', function () {
      if (hovered.type) { map.setFeatureState({ source: hovered.type, id: hovered.id }, { hover: false }); hovered = { type: '', id: '' }; }
      app.tooltip(null);
    });
    map.on('click', function (e) {
      var n = pickNearest(e.point, ['node-dot'], Thematic.isMobile() ? 16 : 6);
      if (n) { app.collapseDrawer(); selectNode(n.properties.id, true); return; }
      var f = pickNearest(e.point, ['route-line'], Thematic.isMobile() ? 14 : 5);
      if (f) { app.collapseDrawer(); selectRoute(f.properties.id, true); return; }
      clearSel();
    });
    map.on('zoom', function () { setLabels(false); });
  }

  function bindLayout() {
    var ckArrows = document.getElementById('ckArrows');
    if (ckArrows) ckArrows.addEventListener('change', function () {
      var v = this.checked ? 'visible' : 'none';
      if (map.getLayer('arrow-sel')) map.setLayoutProperty('arrow-sel', 'visibility', v);
      if (this.checked && selected.type) startFlow(); else stopFlow();
    });
  }
})();
