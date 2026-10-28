/* 玄奘西行 · 真实的取经路 —— 互动逻辑（基于 _shared/thematic 共享运行时）
 *
 * 结构：
 *   1. 建图与图层（含世界陆地衬底）
 *   2. 数据装载（routes / nodes / land）
 *   3. 界面渲染（章节 / 图例 / 导航条 / 详情卡 / 标注）
 *   4. 选中与特效（路线脉冲 + 沿线揭示 / 节点呼吸圈）
 *   5. 悬停、点击、图层与底图
 *
 * 数据说明见 scripts/build_xuanzang.py：线路是途经地连线的地理示意，非实测道路。
 */
(function () {
  'use strict';

  var CFG = window.XUANZANG_CONFIG;
  var ROUTE_URL = 'data/routes.json';
  var NODE_URL = 'data/nodes.json';
  var LAND_URL = 'data/land.json';
  var fmt = Thematic.fmt, esc = Thematic.esc;

  var routes = [];
  var nodes = [];
  var byRoute = {}, byNode = {};
  var selected = { type: '', id: '', name: '', rids: [] };
  var hovered = { type: '', id: '' };
  var fullLabels = null;

  var el = {
    list: document.getElementById('routeList'),
    legend: document.getElementById('legend'),
    strip: document.getElementById('strip'),
    fNode: document.getElementById('fNode'),
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
    dtXyjiBox: document.getElementById('dtXyjiBox'),
    dtXyji: document.getElementById('dtXyji'),
    dtFooter: document.getElementById('dtFooter')
  };

  /* ── 1. 建图 ────────────────────────────────────────────── */
  var app = Thematic.create({
    slug: 'xuanzang-route',
    view: CFG.view,
    bounds: CFG.bounds,
    extent: CFG.extent,
    boundsMobile: CFG.boundsMobile,
    graticuleStep: CFG.graticuleStep,
    defaultBasemap: CFG.defaultBasemap,
    imgPaint: CFG.imgPaint,
    basemaps: CFG.basemaps,
    /* 古羊皮卷风：海面＝偏深的赭黄，陆地＝更亮的纸白，靠「墨线海岸 + 内侧晕染」立起来。
       底色必须比陆地深，否则陆地留白就压不住海，整张纸会糊成一片。 */
    background: '#d9c9a1',
    sources: {
      route: { data: Thematic.EMPTY, promoteId: 'id' },
      node: { data: Thematic.EMPTY, promoteId: 'id' },
      selRoute: { data: Thematic.EMPTY },
      selNode: { data: Thematic.EMPTY },
      walk: { data: Thematic.EMPTY },
      land: { data: Thematic.EMPTY }
    },
    layers: [
      /* 世界陆地衬底：古舆图里陆地是「留白的纸」，比海更亮；无国界，合规 */
      { id: 'land-fill', type: 'fill', source: 'land',
        paint: { 'fill-color': '#f2e8cd', 'fill-opacity': 1 } },
      /* 等深线：从海岸向海一侧逐层外扩、逐层变淡，模拟古舆图沿海外侧的排线。
         polygon 的 line-offset 取负值即「向外（海侧）」偏移（已用鲜红探针实测），
         四层叠出「由浅入深」的晕圈。 */
      { id: 'land-depth-1', type: 'line', source: 'land',
        paint: { 'line-color': '#6b4c26', 'line-width': 1.25, 'line-opacity': 0.52,
                 'line-offset': -5, 'line-dasharray': [4.2, 2.4] } },
      { id: 'land-depth-2', type: 'line', source: 'land',
        paint: { 'line-color': '#6b4c26', 'line-width': 1.1, 'line-opacity': 0.4,
                 'line-offset': -12, 'line-dasharray': [4.2, 2.8] } },
      { id: 'land-depth-3', type: 'line', source: 'land',
        paint: { 'line-color': '#6b4c26', 'line-width': 1.0, 'line-opacity': 0.3,
                 'line-offset': -20, 'line-dasharray': [4.0, 3.2] } },
      { id: 'land-depth-4', type: 'line', source: 'land',
        paint: { 'line-color': '#6b4c26', 'line-width': 0.9, 'line-opacity': 0.2,
                 'line-offset': -29, 'line-dasharray': [3.8, 3.8] } },
      /* 海岸晕染：由外向内逐层加深，模拟手绘古图的沿海排线 / 水渍（三层叠出渐变感） */
      { id: 'land-halo', type: 'line', source: 'land',
        paint: { 'line-color': '#8a6a3c', 'line-width': 7, 'line-opacity': 0.1, 'line-blur': 3 } },
      { id: 'land-line', type: 'line', source: 'land',
        paint: { 'line-color': '#5c4529', 'line-width': 1.35, 'line-opacity': 0.82 } },
      /* 线路：先纸色描边打底，朱砂 / 靛青压在纸面上才有「画上去」的手感 */
      { id: 'route-casing', type: 'line', source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#faf4e2', 'line-opacity': 0.92,
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 3.4, 7, 6.2, 10, 9]
        } },
      { id: 'route-line', type: 'line', source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#241407', ['get', 'color']],
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 2, 7, 4.2, 10, 6.8],
          'line-opacity': 0.96
        } },
      { id: 'route-glow', type: 'line', source: 'selRoute',
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint: { 'line-color': ['get', 'color'], 'line-width': 14, 'line-opacity': 0, 'line-blur': 8 } },
      { id: 'route-sel', type: 'line', source: 'selRoute',
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 3.2, 7, 5.6, 10, 9],
          'line-opacity': 1
        } },
      /* 沿线揭示：浅底上不能再走「白色亮线」，改成浓墨一路写过去，更像毛笔在纸上落笔 */
      { id: 'route-walk', type: 'line', source: 'walk',
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint: {
          'line-color': '#3a2412',
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 2.4, 7, 4.2, 10, 6.6],
          'line-opacity': 0.9
        } },
      /* 途经地：枢纽 / 抵达 / 出发 / 关隘画得更大（方形），普通途经画圆点 */
      { id: 'node-dot', type: 'circle', source: 'node',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            3, ['case', ['in', ['get', 'kind'], ['literal', ['junction', 'terminus', 'origin', 'pass']]], 5, 3.2],
            9, ['case', ['in', ['get', 'kind'], ['literal', ['junction', 'terminus', 'origin', 'pass']]], 8, 5.4]],
          'circle-color': ['get', 'color'],
          'circle-stroke-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#241407', '#f7f0dc'],
          'circle-stroke-width': ['case', ['boolean', ['feature-state', 'hover'], false], 2.4, 1.6],
          'circle-opacity': 1
        } },
      { id: 'node-halo', type: 'circle', source: 'selNode',
        layout: { 'visibility': 'none' },
        paint: {
          'circle-radius': 11,
          'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-color': '#8c2b1c',
          'circle-stroke-width': 2.1,
          'circle-opacity': 0.75
        } }
    ],
    onReady: boot,
    /* 注意：一旦提供 onOverview，共享引擎就不再自动 fitAll —— 必须自己复位视野，
       否则点「全球总览」只清选中、画面停在放大状态。 */
    onOverview: function () { clearSel(); goHome(true); },
    onClose: function () { clearSel(); },
    onReplay: function () { replay(); }
  });

  var map = app.map;

  /* 陆地衬底（含等深线）只为「羊皮卷」纸底而生。切到天地图矢量 / 卫星影像时整体让开，
     否则米黄的陆地填充会把真实底图整片盖死；用户手动关掉衬底时同理。
     本监听晚于 thematic 内置的 data-toggle-layer 绑定，所以能覆盖它的结果。 */
  var LAND_LAYERS = ['land-fill', 'land-depth-1', 'land-depth-2', 'land-depth-3',
                     'land-depth-4', 'land-halo', 'land-line'];
  function syncLand() {
    var bm = document.querySelector('input[name="basemap"]:checked');
    var paper = !bm || bm.value === 'none';
    var ck = document.getElementById('ckLand');
    var on = paper && (!ck || ck.checked);
    for (var i = 0; i < LAND_LAYERS.length; i++) {
      if (map.getLayer(LAND_LAYERS[i])) {
        map.setLayoutProperty(LAND_LAYERS[i], 'visibility', on ? 'visible' : 'none');
      }
    }
  }
  (function bindLandUI() {
    var rads = document.querySelectorAll('input[name="basemap"]');
    for (var i = 0; i < rads.length; i++) rads[i].addEventListener('change', syncLand);
    var ck = document.getElementById('ckLand');
    if (ck) ck.addEventListener('change', syncLand);
  })();

  /* 取景：左侧有 352px 的常驻介绍栏，fitBounds 必须把这块让出来，
     否则整条路线会被压在栏底下、右侧空出一大片海。 */
  function homePad() {
    if (window.innerWidth < 900) return { left: 18, right: 18, top: 18, bottom: 120 };
    return { left: 384, right: 56, top: 40, bottom: 72 };
  }
  function goHome(animate) {
    app.fitAll({ animate: !!animate, padding: homePad() });
  }

  /* ── 2. 数据装载 ────────────────────────────────────────── */
  function boot() {
    /* 古图皮肤：经纬网与省界由共享引擎内置，这里改写配色 ——
       经纬网做「淡褐细虚线」，省界做「更淡的点线」，都不抢主线的墨色。 */
    try {
      map.setPaintProperty('grat', 'line-color', '#9c8256');
      map.setPaintProperty('grat', 'line-width', 0.7);
      map.setPaintProperty('grat', 'line-opacity', 0.45);
      map.setPaintProperty('grat', 'line-dasharray', [4, 5]);
      if (map.getLayer('prov-line')) {
        map.setPaintProperty('prov-line', 'line-color', '#9c8256');
        map.setPaintProperty('prov-line', 'line-width', 0.8);
        map.setPaintProperty('prov-line', 'line-opacity', 0.5);
        map.setPaintProperty('prov-line', 'line-dasharray', [2, 3]);
      }
    } catch (e) { /* 皮肤属装饰，缺失不影响地图 */ }

    syncLand();

    Promise.all([
      fetch(ROUTE_URL).then(function (r) { return r.json(); }),
      fetch(NODE_URL).then(function (r) { return r.json(); })
    ]).then(function (res) {
      routes = res[0].features.slice().sort(function (a, b) {
        return a.properties.no.localeCompare(b.properties.no);
      });
      nodes = res[1].features;
      byRoute = {}; byNode = {};
      routes.forEach(function (f) { byRoute[f.properties.id] = f; });
      /* 节点自身不带颜色：按所属路线继承线色，地图上的点位与标注小圆点才能跟着朱砂 / 靛青走 */
      nodes.forEach(function (f) {
        var r = byRoute[f.properties.route];
        f.properties.color = (r && r.properties.color) || '#8a7350';
        byNode[f.properties.id] = f;
      });

      map.getSource('route').setData({ type: 'FeatureCollection', features: routes });
      map.getSource('node').setData({ type: 'FeatureCollection', features: nodes });

      el.fNode.textContent = uniqueNodes().length;
      renderList(); renderLegend(); renderStrip(); setLabels(true);
      bindHover();
      /* 封面取景：?view=lng,lat,zoom 覆盖自适应全景（封面 16:9 与 4:3 构图不同，
         且缩略图下路线需要占满画幅才读得出走向） */
      var viewQS = null;
      try { viewQS = new URLSearchParams(location.search).get('view'); } catch (e) { /* 忽略 */ }
      if (viewQS) {
        var vp = viewQS.split(',').map(Number);
        if (vp.length === 3 && vp.every(function (v) { return isFinite(v); })) {
          map.jumpTo({ center: [vp[0], vp[1]], zoom: vp[2] });
        } else { goHome(false); }
      } else { goHome(false); }
      /* 默认折叠左下「图层与底图」面板，避免全景态遮挡中亚—印度段路线 */
      var pb = document.getElementById('panelBody');
      if (pb && !pb.classList.contains('collapsed')) {
        pb.classList.add('collapsed');
        var pt = document.getElementById('panelToggle'); if (pt) pt.textContent = '＋';
      }
      window.__xzReady = true;
    }).catch(function (err) {
      console.error('[xuanzang-route] 数据加载失败', err);
      el.list.innerHTML = '<p class="note">路线数据加载失败，请刷新重试。</p>';
    });

    /* 世界陆地衬底：把 land.json 的 polys 直接包成 MultiPolygon */
    fetch(LAND_URL).then(function (r) { return r.json(); }).then(function (ld) {
      if (map.getSource('land')) {
        map.getSource('land').setData({
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: ld.polys } }]
        });
      }
    }).catch(function () { /* 陆地衬底缺失不影响主线 */ });
  }

  /* ── 3. 界面渲染 ────────────────────────────────────────── */
  function renderList() {
    el.list.innerHTML = routes.map(function (f) {
      var p = f.properties;
      return '<button type="button" data-id="' + p.id + '">' +
        '<span class="no">' + esc(p.no) + '</span>' +
        '<span class="tx"><b>' + esc(p.name) + '</b>' +
        '<small>' + esc(p.origin) + ' → ' + esc(p.destination) +
        ' · ' + fmt(p.length_km) + ' km</small></span></button>';
    }).join('');
    el.list.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      app.collapseDrawer();
      selectRoute(b.dataset.id, true);
    };
  }

  function renderLegend() {
    var lines = routes.map(function (f) {
      return '<span><em><i style="background:' + f.properties.color + '"></i></em>' +
        esc(f.properties.name) + '</span>';
    }).join('');
    el.legend.innerHTML = lines +
      '<span><s style="background:#e8c89a"></s>途经地</span>' +
      '<span><s class="sq" style="background:#e8c89a"></s>枢纽 / 抵达地</span>';
  }

  function renderStrip() {
    el.strip.innerHTML = routes.map(function (f) {
      var p = f.properties;
      return '<button type="button" data-id="' + p.id + '" style="--rc:' + p.color + '"' +
        ' title="' + esc(p.teaser) + '" aria-label="' + esc(p.name) + '">' +
        '<i></i><span><b>' + esc(p.name) + '</b><small>' + p.node_count + ' 站</small></span></button>';
    }).join('');
    el.strip.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      app.collapseDrawer();
      selectRoute(b.dataset.id, true);
    };
  }

  /* 线路：三格 = 起点 / 终点 / 途经地；描述为线路概述 */
  function renderDetailRoute(f) {
    var p = f.properties;
    el.dtXyjiBox.hidden = true;
    el.detail.style.setProperty('--rc', p.color);
    el.dtRole.textContent = p.badge;
    el.dtName.textContent = p.name;
    el.dtTagline.textContent = p.teaser;
    el.dtM1Label.textContent = '出发';
    el.dtM1.textContent = shortPlace(p.origin);
    el.dtM2Label.textContent = '抵达';
    el.dtM2.textContent = shortPlace(p.destination);
    el.dtM3Label.textContent = '途经';
    el.dtM3.textContent = p.node_count + ' 处';
    el.dtDescLabel.textContent = '线路概述';
    el.dtDesc.textContent = p.desc;
    el.dtFooter.innerHTML =
      '<span>里程 <b>' + fmt(p.length_km) + ' 公里</b></span>' +
      '<span>年代 <b>唐·贞观</b></span>';
    el.detail.hidden = false;
    app.setDetailOpen(true);
  }

  /* 途经地：三格 = 今址 / 今属 / 序位；描述玄奘在此的经历；有则展示《西游记》关联 */
  function renderDetailNode(f, rids) {
    var p = f.properties;
    var r = byRoute[p.route];
    var color = r ? r.properties.color : '#e8c89a';
    el.detail.style.setProperty('--rc', color);
    el.dtXyjiBox.hidden = !p.xyji;
    if (p.xyji) el.dtXyji.textContent = p.xyji;
    el.dtRole.textContent = CFG.roleEn[p.kind] || 'WAYPOINT';
    el.dtName.textContent = p.name;
    el.dtTagline.textContent = p.route_name + ' · 第 ' + p.seq + ' 站';
    el.dtM1Label.textContent = '今址';
    el.dtM1.textContent = p.modern;
    el.dtM2Label.textContent = '今属';
    el.dtM2.textContent = p.country;
    el.dtM3Label.textContent = '序位';
    el.dtM3.textContent = p.seq + ' / ' + p.of;
    el.dtDescLabel.textContent = '玄奘在此';
    el.dtDesc.textContent = p.note;
    el.dtFooter.innerHTML =
      '<span>WGS84 <b>' + p.wgs84[0].toFixed(2) + '°E, ' + p.wgs84[1].toFixed(2) + '°N</b></span>' +
      '<span>角色 <b>' + (CFG.kindLabel[p.kind] || '途经') + '</b></span>' +
      (rids && rids.length > 1 ? '<span>归属 <b>' + esc(rids.map(function (k) { return byRoute[k] ? byRoute[k].properties.name : k; }).join(' / ')) + '</b></span>' : '');
    el.detail.hidden = false;
    app.setDetailOpen(true);
  }

  function hideDetail() {
    el.detail.hidden = true;
    app.setDetailOpen(false);
  }

  function shortPlace(s) { return String(s || '').split('·').pop().trim(); }

  /* 同名节点在两条线上各存一份（长安、那烂陀、曲女城等），标签只画一次 */
  var NODE_RANK = { junction: 0, terminus: 1, origin: 2, pass: 3, stage: 4 };
  var labelNodes = null;
  function uniqueNodes() {
    if (labelNodes) return labelNodes;
    var seen = {};
    labelNodes = nodes.slice().sort(function (a, b) {
      return (NODE_RANK[a.properties.kind] || 9) - (NODE_RANK[b.properties.kind] || 9);
    }).filter(function (f) {
      var k = f.properties.name;
      if (seen[k]) return false;
      seen[k] = 1; return true;
    });
    return labelNodes;
  }

  function setLabels(force) {
    var full = map.getZoom() >= CFG.fullLabelZoom;
    if (!force && full === fullLabels) return;
    fullLabels = full;

    var items = routes.map(function (f) {
      var p = f.properties;
      var ll = Thematic.pointAt(f.geometry.coordinates, p.label_at || 0.4);
      return { text: p.name, lng: ll[0], lat: ll[1], color: p.color, kind: 'tag',
        active: selected.type === 'route' && selected.id === p.id };
    });

    uniqueNodes().forEach(function (f) {
      var p = f.properties;
      var major = p.kind !== 'stage';
      if (!major && !full) return;
      items.push({
        text: p.name,
        lng: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
        color: p.color,
        kind: (p.kind === 'junction' || p.kind === 'terminus' || p.kind === 'origin') ? 'square' : 'dot',
        active: selected.type === 'node' && selected.name === p.name
      });
    });

    app.setLabels(items);
  }

  /* ── 4. 选中与特效 ──────────────────────────────────────── */
  var NFX = { raf: 0, token: 0 };
  function stopNodeFx() {
    NFX.token++;
    if (NFX.raf) cancelAnimationFrame(NFX.raf);
    NFX.raf = 0;
  }

  function walkRoute(f) {
    app.reveal({
      layerId: 'route-walk', sourceId: 'walk',
      coords: f.geometry.coordinates, props: { color: f.properties.color },
      duration: 2600, fade: 650
    });
  }

  function pulseRoute(f) {
    app.pulse({
      glowId: 'route-glow', selId: 'route-sel',
      baseWidth: 13, maxExtra: 9, duration: 1600,
      then: function () { walkRoute(f); }
    });
  }

  function pulseNode() {
    stopNodeFx();
    if (!map.getLayer('node-halo')) return;
    map.setLayoutProperty('node-halo', 'visibility', 'visible');
    var token = NFX.token;
    var t0 = performance.now(), DUR = 1500;
    (function step(now) {
      if (token !== NFX.token) return;
      var p = Math.min((now - t0) / DUR, 1);
      var e = 0.16 + 0.84 * Math.pow(Math.sin(p * Math.PI * 3), 2);
      map.setPaintProperty('node-halo', 'circle-radius', 9 + e * 9);
      map.setPaintProperty('node-halo', 'circle-opacity', 0.22 + e * 0.6);
      if (p < 1) { NFX.raf = requestAnimationFrame(step); return; }
      NFX.raf = 0;
      map.setPaintProperty('node-halo', 'circle-radius', 11.5);
      map.setPaintProperty('node-halo', 'circle-opacity', 0.72);
    })(t0);
  }

  function applyRouteOpacity() {
    if (selected.type === 'route') {
      map.setPaintProperty('route-line', 'line-opacity', ['case',
        ['==', ['get', 'id'], selected.id], 1, 0.34]);
      map.setPaintProperty('route-casing', 'line-opacity', ['case',
        ['==', ['get', 'id'], selected.id], 0.85, 0.38]);
      map.setPaintProperty('node-dot', 'circle-opacity', ['case',
        ['==', ['get', 'route'], selected.id], 1, 0.45]);
    } else if (selected.type === 'node') {
      var rids = selected.rids || [];
      map.setPaintProperty('route-line', 'line-opacity', ['case',
        ['in', ['get', 'id'], ['literal', rids]], 1, 0.4]);
      map.setPaintProperty('route-casing', 'line-opacity', ['case',
        ['in', ['get', 'id'], ['literal', rids]], 0.85, 0.4]);
      map.setPaintProperty('node-dot', 'circle-opacity', ['case',
        ['==', ['get', 'name'], selected.name || ''], 1, 0.55]);
    } else {
      map.setPaintProperty('route-line', 'line-opacity', 0.95);
      map.setPaintProperty('route-casing', 'line-opacity', 0.8);
      map.setPaintProperty('node-dot', 'circle-opacity', 0.98);
    }
  }

  function syncUI() {
    var activeRoutes = selected.type === 'route' ? [selected.id]
      : (selected.type === 'node' ? (selected.rids || []) : []);
    Array.prototype.forEach.call(document.querySelectorAll('#routeList button'), function (b) {
      b.classList.toggle('active', activeRoutes.indexOf(b.dataset.id) >= 0);
    });
    Array.prototype.forEach.call(document.querySelectorAll('#strip button'), function (b) {
      b.classList.toggle('active', activeRoutes.indexOf(b.dataset.id) >= 0);
    });
    if (selected.type === 'route') {
      app.scrollStripIntoView(document.querySelector('#strip button.active'));
    }
  }

  function selectRoute(id, move) {
    var f = byRoute[id]; if (!f) return;
    stopNodeFx();
    selected = { type: 'route', id: id };
    map.getSource('selRoute').setData({ type: 'FeatureCollection', features: [f] });
    map.getSource('selNode').setData(Thematic.EMPTY);
    map.setLayoutProperty('node-halo', 'visibility', 'none');
    map.setLayoutProperty('route-glow', 'visibility', 'visible');
    map.setLayoutProperty('route-sel', 'visibility', 'visible');
    applyRouteOpacity();
    renderDetailRoute(f);
    syncUI(); setLabels(true);
    pulseRoute(f);
    if (move) {
      app.fitBounds(Thematic.padBbox(Thematic.bboxOf(f.geometry), 0.35),
        { animate: true, maxZoom: 5.6, withDetail: true, duration: 760 });
    }
  }

  function selectNode(id, move) {
    var f = byNode[id]; if (!f) return;
    stopNodeFx();
    var rids = nodes.filter(function (n) {
      return n.properties.name === f.properties.name;
    }).map(function (n) { return n.properties.route; })
      .filter(function (v, i, a) { return a.indexOf(v) === i; });
    selected = { type: 'node', id: id, name: f.properties.name, rids: rids };
    var related = rids.map(function (r) { return byRoute[r]; }).filter(Boolean);
    if (related.length) {
      map.getSource('selRoute').setData({ type: 'FeatureCollection', features: related });
      map.setLayoutProperty('route-glow', 'visibility', 'visible');
      map.setLayoutProperty('route-sel', 'visibility', 'visible');
      map.setPaintProperty('route-glow', 'line-width', 12);
      map.setPaintProperty('route-glow', 'line-opacity', 0.26);
    }
    map.getSource('selNode').setData({ type: 'FeatureCollection', features: [f] });
    app.stopFx();
    app.clearReveal('walk', 'route-walk');
    applyRouteOpacity();
    renderDetailNode(f, rids);
    syncUI(); setLabels(true);
    pulseNode();
    if (move) {
      var c = f.geometry.coordinates;
      app.fitBounds(Thematic.padBbox([c[0], c[1], c[0], c[1]], 0.45),
        { animate: true, maxZoom: 5.4, withDetail: true, duration: 700 });
    }
  }

  function clearSel() {
    selected = { type: '', id: '', name: '', rids: [] };
    stopNodeFx();
    app.stopFx();
    map.getSource('selRoute').setData(Thematic.EMPTY);
    map.getSource('selNode').setData(Thematic.EMPTY);
    map.getSource('walk').setData(Thematic.EMPTY);
    map.setLayoutProperty('route-glow', 'visibility', 'none');
    map.setLayoutProperty('route-sel', 'visibility', 'none');
    map.setLayoutProperty('route-walk', 'visibility', 'none');
    map.setLayoutProperty('node-halo', 'visibility', 'none');
    applyRouteOpacity();
    hideDetail();
    syncUI(); setLabels(true);
  }

  function replay() {
    if (selected.type === 'route') {
      map.setLayoutProperty('route-glow', 'visibility', 'visible');
      map.setLayoutProperty('route-sel', 'visibility', 'visible');
      pulseRoute(byRoute[selected.id]);
    } else if (selected.type === 'node') {
      pulseNode();
    }
  }

  /* ── 5. 悬停 / 点击 / 控件 ──────────────────────────────── */
  function geomDistance(g, pt) {
    var min = Infinity;
    (function walk(c) {
      if (typeof c[0] === 'number') {
        var p = map.project(c);
        var dx = p.x - pt.x, dy = p.y - pt.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < min) min = d;
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
      var n = pickNearest(e.point, ['node-dot'], Thematic.isMobile() ? 16 : 5);
      var f = n || pickNearest(e.point, ['route-line'], Thematic.isMobile() ? 14 : 4);
      var nextType = n ? 'node' : (f ? 'route' : '');
      var nextId = f ? (n ? n.properties.id : f.properties.id) : '';
      if (nextType !== hovered.type || nextId !== hovered.id) {
        if (hovered.type) {
          map.setFeatureState({ source: hovered.type === 'node' ? 'node' : 'route', id: hovered.id }, { hover: false });
        }
        hovered = { type: nextType, id: nextId };
        if (nextType) {
          map.setFeatureState({ source: nextType === 'node' ? 'node' : 'route', id: nextId }, { hover: true });
        }
      }
      if (nextType) {
        map.getCanvas().style.cursor = 'pointer';
        var p = nextType === 'node' ? n.properties : f.properties;
        var sub = nextType === 'node'
          ? (p.modern + ' · ' + (CFG.kindLabel[p.kind] || '途经'))
          : (fmt(p.length_km) + ' 公里 · ' + p.node_count + ' 处途经地');
        app.tooltip('<b>' + esc(p.name) + '</b> <span style="color:#7a6242">' + esc(sub) + '</span>',
          e.point.x, e.point.y);
      } else {
        map.getCanvas().style.cursor = '';
        app.tooltip(null);
      }
    });
    map.on('mouseleave', function () {
      if (hovered.type) {
        map.setFeatureState({ source: hovered.type === 'node' ? 'node' : 'route', id: hovered.id }, { hover: false });
        hovered = { type: '', id: '' };
      }
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
})();
