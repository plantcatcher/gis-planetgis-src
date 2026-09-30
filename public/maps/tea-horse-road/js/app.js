/* 茶马古道 · 三条主线 —— 互动逻辑（基于 _shared/thematic 共享运行时）
 *
 * 结构：
 *   1. 建图与图层
 *   2. 数据装载
 *   3. 界面渲染（章节 / 图例 / 导航条 / 详情卡 / 标注）
 *   4. 选中与特效（线路脉冲 + 沿线揭示 / 驿镇呼吸圈）
 *   5. 悬停、点击、图层与底图
 *
 * 数据说明见 scripts/build_tea_horse_road.py：线路是驿镇节点连线的关系示意，
 * 不是历史道路的实测线画。
 */
(function () {
  'use strict';

  var CFG = window.TEAHORSE_CONFIG;
  var ROUTE_URL = 'data/routes.json';
  var NODE_URL = 'data/nodes.json';
  var fmt = Thematic.fmt, esc = Thematic.esc;

  var routes = [];              // 线路要素
  var nodes = [];               // 驿镇要素
  var byRoute = {}, byNode = {};
  var selected = { type: '', id: '', name: '', rids: [] };
  var hovered = { type: '', id: '' };
  var fullLabels = null;        // 上一次「是否已放大到显示全部驿镇」

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
    dtFooter: document.getElementById('dtFooter')
  };

  /* ── 1. 建图 ────────────────────────────────────────────── */
  var app = Thematic.create({
    slug: 'tea-horse-road',
    view: CFG.view,
    bounds: CFG.bounds,
    extent: CFG.extent,
    graticuleStep: 2,
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
      /* 线路：先深色描边打底，彩色线在卫星影像上才读得出来 */
      { id: 'route-casing', type: 'line', source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#04101c',
          'line-opacity': 0.8,
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 3.6, 7, 6.4, 11, 10]
        } },
      { id: 'route-line', type: 'line', source: 'route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#ffffff', ['get', 'color']],
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 2.2, 7, 4.2, 11, 7],
          'line-opacity': 0.94
        } },
      /* 选中线路的外发光 + 本体（宽度 / 透明度由 rAF 驱动做脉冲） */
      { id: 'route-glow', type: 'line', source: 'selRoute',
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint: { 'line-color': ['get', 'color'], 'line-width': 14, 'line-opacity': 0, 'line-blur': 8 } },
      { id: 'route-sel', type: 'line', source: 'selRoute',
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 3.4, 7, 6, 11, 9.4],
          'line-opacity': 1
        } },
      /* 沿线揭示动画：一道亮线从起点走到终点 */
      { id: 'route-walk', type: 'line', source: 'walk',
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint: {
          'line-color': '#fffaf0',
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 2.6, 7, 4.4, 11, 6.6],
          'line-opacity': 0.96
        } },
      /* 驿镇点位：大节点（起点 / 终点 / 汇合点 / 山口）画得更大 */
      { id: 'node-dot', type: 'circle', source: 'node',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            3, ['case', ['in', ['get', 'kind'], ['literal', ['junction', 'terminus', 'origin', 'pass']]], 5.2, 3.4],
            9, ['case', ['in', ['get', 'kind'], ['literal', ['junction', 'terminus', 'origin', 'pass']]], 8.4, 5.6]],
          'circle-color': ['get', 'color'],
          'circle-stroke-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#ffffff', '#04101c'],
          'circle-stroke-width': ['case', ['boolean', ['feature-state', 'hover'], false], 2.2, 1.4],
          'circle-opacity': 0.98
        } },
      /* 选中驿镇的呼吸描边圈 */
      { id: 'node-halo', type: 'circle', source: 'selNode',
        layout: { 'visibility': 'none' },
        paint: {
          'circle-radius': 11,
          'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2.1,
          'circle-opacity': 0.7
        } }
    ],
    onReady: boot,
    onOverview: function () { clearSel(); },
    onClose: function () { clearSel(); },
    onReplay: function () { replay(); }
  });

  var map = app.map;

  /* ── 2. 数据装载 ────────────────────────────────────────── */
  function boot() {
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
      nodes.forEach(function (f) { byNode[f.properties.id] = f; });

      map.getSource('route').setData({ type: 'FeatureCollection', features: routes });
      map.getSource('node').setData({ type: 'FeatureCollection', features: nodes });

      el.fNode.textContent = nodes.length;
      labelNodes = null;                 // 数据换了，去重缓存一并清掉
      renderList(); renderLegend(); renderStrip(); setLabels(true);
      bindHover();
      app.fitAll({ animate: false });
    }).catch(function (err) {
      console.error('[tea-horse-road] 数据加载失败', err);
      el.list.innerHTML = '<p class="note">古道数据加载失败，请刷新重试。</p>';
    });
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
      '<span><s style="background:#cfe0f5"></s>驿镇</span>' +
      '<span><s class="sq" style="background:#cfe0f5"></s>汇合点 / 终点</span>';
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

  /* 线路：三格 = 起点 / 终点 / 驿镇；描述为线路概述 */
  function renderDetailRoute(f) {
    var p = f.properties;
    el.detail.style.setProperty('--rc', p.color);
    el.dtRole.textContent = p.badge;
    el.dtName.textContent = p.name;
    el.dtTagline.textContent = p.teaser;
    el.dtM1Label.textContent = '起点';
    el.dtM1.textContent = shortPlace(p.origin);
    el.dtM2Label.textContent = '终点';
    el.dtM2.textContent = shortPlace(p.destination);
    el.dtM3Label.textContent = '驿镇';
    el.dtM3.textContent = p.node_count + ' 处';
    el.dtDescLabel.textContent = '线路概述';
    el.dtDesc.textContent = p.desc;
    el.dtFooter.innerHTML =
      '<span>里程 <b>' + fmt(p.length_km) + ' 公里</b></span>' +
      '<span>主要货品 <b>' + esc(p.goods) + '</b></span>' +
      '<span style="flex-basis:100%;color:#b9c8dc">' + esc(p.note) + '</span>';
    el.detail.hidden = false;
    app.setDetailOpen(true);
  }

  /* 驿镇：三格 = 所属主线 / 序位 / 纬度；描述为它在古道上的位置 */
  function renderDetailNode(f, rids) {
    var p = f.properties;
    var r = byRoute[p.route];
    var color = r ? r.properties.color : '#cfe0f5';
    var owners = (rids && rids.length ? rids : [p.route]).map(function (k) {
      return byRoute[k] ? byRoute[k].properties.name : k;
    });
    el.detail.style.setProperty('--rc', color);
    el.dtRole.textContent = CFG.roleEn[p.kind] || 'STAGE';
    el.dtName.textContent = p.name;
    el.dtTagline.textContent = p.route_name + ' · 第 ' + p.seq + ' 站';
    el.dtM1Label.textContent = '所属主线';
    el.dtM1.textContent = owners.length > 1 ? '跨 ' + owners.length + ' 条' : p.route_name;
    el.dtM2Label.textContent = '序位';
    el.dtM2.textContent = p.seq + ' / ' + p.of;
    el.dtM3Label.textContent = '纬度';
    el.dtM3.textContent = p.wgs84[1].toFixed(2) + '°N';
    el.dtDescLabel.textContent = '在古道上的位置';
    el.dtDesc.textContent = p.note;
    el.dtFooter.innerHTML =
      '<span>WGS84 <b>' + p.wgs84[0].toFixed(2) + '°E, ' + p.wgs84[1].toFixed(2) + '°N</b></span>' +
      '<span>角色 <b>' + (CFG.kindLabel[p.kind] || '驿站') + '</b></span>' +
      (owners.length > 1 ? '<span>归属 <b>' + esc(owners.join(' / ')) + '</b></span>' : '');
    el.detail.hidden = false;
    app.setDetailOpen(true);
  }

  function hideDetail() {
    el.detail.hidden = true;
    app.setDetailOpen(false);
  }

  /* 「云南 · 普洱」这类前缀在卡片里省掉，地名本身已经够长 */
  function shortPlace(s) { return String(s || '').split('·').pop().trim(); }

  /* 同名节点在两条主线上各存一份（芒康、拉萨），标签只画一次；
     保留优先级更高的角色，免得汇合点被同名的普通驿站盖掉。 */
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

  /* 标注：低层级只标大节点与主线名，放大后补出全部驿站 */
  function setLabels(force) {
    var full = map.getZoom() >= CFG.fullLabelZoom;
    if (!force && full === fullLabels) return;
    fullLabels = full;

    var items = routes.map(function (f) {
      var p = f.properties;
      var ll = Thematic.pointAt(f.geometry.coordinates, p.label_at || 0.42);
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
        kind: (p.kind === 'junction' || p.kind === 'terminus') ? 'square' : 'dot',
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
      layerId: 'route-walk',
      sourceId: 'walk',
      coords: f.geometry.coordinates,
      props: { color: f.properties.color },
      duration: 2500,
      fade: 650
    });
  }

  function pulseRoute(f) {
    app.pulse({
      glowId: 'route-glow',
      selId: 'route-sel',
      baseWidth: 13,
      maxExtra: 9,
      duration: 1600,
      then: function () { walkRoute(f); }
    });
  }

  /* 驿镇：白描边圈做呼吸放大 */
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

  /* 选中主线时把其余线路压暗，选中的那条保持全亮 */
  function applyRouteOpacity() {
    if (selected.type === 'route') {
      map.setPaintProperty('route-line', 'line-opacity', ['case',
        ['==', ['get', 'id'], selected.id], 1, 0.24]);
      map.setPaintProperty('route-casing', 'line-opacity', ['case',
        ['==', ['get', 'id'], selected.id], 0.85, 0.3]);
      map.setPaintProperty('node-dot', 'circle-opacity', ['case',
        ['==', ['get', 'route'], selected.id], 1, 0.34]);
    } else if (selected.type === 'node') {
      var rids = selected.rids || [];
      map.setPaintProperty('route-line', 'line-opacity', ['case',
        ['in', ['get', 'id'], ['literal', rids]], 1, 0.34]);
      map.setPaintProperty('route-casing', 'line-opacity', ['case',
        ['in', ['get', 'id'], ['literal', rids]], 0.85, 0.34]);
      /* 同名节点（两条主线上的芒康 / 拉萨）一起点亮 */
      map.setPaintProperty('node-dot', 'circle-opacity', ['case',
        ['==', ['get', 'name'], selected.name || ''], 1, 0.5]);
    } else {
      map.setPaintProperty('route-line', 'line-opacity', 0.94);
      map.setPaintProperty('route-casing', 'line-opacity', 0.8);
      map.setPaintProperty('node-dot', 'circle-opacity', 0.98);
    }
  }

  function syncUI() {
    /* 驿镇可能同时属于两条主线（芒康、拉萨），这时两个章节都标为选中 */
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
        { animate: true, maxZoom: 6.2, withDetail: true, duration: 760 });
    }
  }

  function selectNode(id, move) {
    var f = byNode[id]; if (!f) return;
    stopNodeFx();

    /* 同名节点在两条主线上各存一份（如芒康、拉萨）：选中任意一份，
       两条相关主线都亮起来，卡片里也把归属写全。 */
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
    /* 打断可能正在跑的线路揭示动画，并把残留的半截亮线一起清掉 */
    app.stopFx();
    app.clearReveal('walk', 'route-walk');

    applyRouteOpacity();
    renderDetailNode(f, rids);
    syncUI(); setLabels(true);
    pulseNode();

    if (move) {
      var c = f.geometry.coordinates;
      app.fitBounds(Thematic.padBbox([c[0], c[1], c[0], c[1]], 0.45),
        { animate: true, maxZoom: 6.8, withDetail: true, duration: 700 });
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
  /* 驿镇密集处（移动端低缩放时相邻两点可能只隔十几像素）命中框里会有多个候选，
     这时要取**离指针最近**的那个，否则点芒康会点到左贡。 */
  function geomDistance(g, pt) {
    var min = Infinity;
    (function walk(c) {
      if (typeof c[0] === 'number') {
        var p = map.project(c);
        var dx = p.x - pt.x, dy = p.y - pt.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < min) min = d;
      } else {
        for (var i = 0; i < c.length; i++) walk(c[i]);
      }
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
          ? (p.route_name + ' · ' + (CFG.kindLabel[p.kind] || '驿站'))
          : (fmt(p.length_km) + ' 公里 · ' + p.node_count + ' 处驿镇');
        app.tooltip('<b>' + esc(p.name) + '</b> <span style="color:#8fa3bd">' + esc(sub) + '</span>',
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
