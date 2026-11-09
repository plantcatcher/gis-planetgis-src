/* 中国春运人口迁徙 · 互动逻辑（基于 _shared/thematic 共享运行时）
 *
 * 结构：
 *   1. 建图与图层（迁徙流线 / 流向箭头 / 城市节点 / 选中高亮）
 *   2. 数据装载 + 邻接表
 *   3. 界面渲染（排行 / 图例 / 详情卡 / 标注）
 *   4. 选中与特效（点城市高亮其全部流入流出；红蓝节点表达净流动）
 *   5. 悬停、点击、图层与底图
 *
 * 数据说明：边权重为百度迁徙规模指数占比（相对值），连线为城市间直线示意。
 */
(function () {
  'use strict';

  var CFG = window.CSM_CONFIG;
  var NODE_URL = 'data/nodes.json';
  var FLOW_URL = 'data/flows.json';
  var fmt = Thematic.fmt, esc = Thematic.esc;

  var nodes = [], flows = [], byId = {}, byAdcode = {}, adj = {};
  var selected = null;          // {type:'city', adcode} | {type:'flow', flow}
  var hovered = { type: '', id: '' };
  var intraOn = false, labelOn = true, fullLabels = null;

  var el = {
    rankInflow: document.getElementById('rankInflow'),
    rankOutflow: document.getElementById('rankOutflow'),
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
    dtFlows: document.getElementById('dtFlows'),
    dtFooter: document.getElementById('dtFooter')
  };

  /* ── 1. 建图 ────────────────────────────────────────────── */
  var app = Thematic.create({
    slug: 'cn-spring-migration',
    view: CFG.view,
    bounds: CFG.bounds,
    extent: CFG.extent,
    graticuleStep: CFG.graticuleStep,
    defaultBasemap: CFG.defaultBasemap,
    imgPaint: CFG.imgPaint,
    sources: {
      node: { data: Thematic.EMPTY, promoteId: 'id' },
      flow: { data: Thematic.EMPTY, promoteId: 'id' },
      selNode: { data: Thematic.EMPTY },
      selFlow: { data: Thematic.EMPTY }
    },
    layers: [
      { id: 'flow-casing', type: 'line', source: 'flow',
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint: {
          'line-color': '#040b16',
          'line-opacity': ['case', ['boolean', ['feature-state', 'sel'], false], 0.92, 0.4],
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 3, 7, 6, 11, 9]
        } },
      { id: 'flow-line', type: 'line', source: 'flow',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['case', ['boolean', ['get', 'cross'], false], CFG.flowColor, CFG.flowColorIntra],
          'line-width': ['interpolate', ['linear'], ['get', 'w'], 1, 1.0, 3, 1.8, 6, 3.0, 12, 4.6, 20, 6.6],
          'line-opacity': ['case',
            ['boolean', ['feature-state', 'sel'], false], 1,
            ['boolean', ['feature-state', 'dim'], false], 0.1,
            ['boolean', ['get', 'cross'], false], 0.7, 0.34]
        } },
      { id: 'flow-sel', type: 'line', source: 'selFlow',
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint: { 'line-color': CFG.flowColor,
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 2.4, 7, 4.4, 11, 7],
          'line-opacity': 1, 'line-blur': 0.3 } },
      { id: 'flow-arrow', type: 'symbol', source: 'flow', minzoom: 4,
        layout: {
          'symbol-placement': 'line', 'icon-image': 'arrow', 'icon-rotation-alignment': 'map',
          'icon-size': ['interpolate', ['linear'], ['zoom'], 4, 0.42, 7, 0.72],
          'symbol-spacing': 95, 'icon-allow-overlap': true, 'visibility': 'visible'
        },
        paint: { 'icon-color': CFG.flowColor, 'icon-opacity': 0.85 } },
      { id: 'node-dot', type: 'circle', source: 'node',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'strength'], 8, 3.2, 20, 5, 45, 7.6, 90, 11, 160, 15],
          'circle-color': ['case',
            ['>', ['get', 'net'], 5], CFG.netPos,
            ['<', ['get', 'net'], -5], CFG.netNeg, CFG.netMid],
          'circle-stroke-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#ffffff', '#040b16'],
          'circle-stroke-width': ['case', ['boolean', ['feature-state', 'hover'], false], 2.2, 1.2],
          'circle-opacity': ['case', ['boolean', ['feature-state', 'dim'], false], 0.26, 0.98]
        } },
      { id: 'node-halo', type: 'circle', source: 'selNode',
        layout: { 'visibility': 'none' },
        paint: { 'circle-radius': 13, 'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2.1, 'circle-opacity': 0.7 } }
    ],
    onReady: boot,
    onOverview: function () { clearSel(); app.fitBounds(CFG.bounds, { animate: true, maxZoom: 9, duration: 780 }); },
    onClose: function () { clearSel(); },
    onReplay: function () {}
  });

  var map = app.map;

  function makeArrow() {
    var s = 30, c = document.createElement('canvas');
    c.width = s; c.height = s;
    var x = c.getContext('2d');
    x.clearRect(0, 0, s, s);
    x.fillStyle = '#ffffff';
    x.beginPath();
    x.moveTo(s * 0.92, s / 2);
    x.lineTo(s * 0.26, s * 0.16);
    x.lineTo(s * 0.44, s / 2);
    x.lineTo(s * 0.26, s * 0.84);
    x.closePath(); x.fill();
    return x.getImageData(0,0, s, s);
  }

  /* ── 2. 数据装载 + 邻接表 ──────────────────────────────── */
  function boot() {
    try { map.addImage('arrow', makeArrow()); } catch (e) { console.warn('[arrow] addImage 失败', e); }

    Promise.all([
      fetch(NODE_URL).then(function (r) { return r.json(); }),
      fetch(FLOW_URL).then(function (r) { return r.json(); })
    ]).then(function (res) {
      nodes = res[0].features;
      flows = res[1].features;
      flows.forEach(function (f) {
        var p = f.properties;
        p.id = p.from + '-' + p.to;
        byId[p.id] = f;
      });
      nodes.forEach(function (f) { byId[f.properties.id] = f; byAdcode[f.properties.adcode] = f; });
      // 邻接表：adcode -> [{other, w, dir}]
      flows.forEach(function (f) {
        var p = f.properties;
        (adj[p.from] = adj[p.from] || []).push({ other: p.to, w: p.w, dir: 'out' });
        (adj[p.to] = adj[p.to] || []).push({ other: p.from, w: p.w, dir: 'in' });
      });

      map.getSource('node').setData({ type: 'FeatureCollection', features: nodes });
      map.getSource('flow').setData({ type: 'FeatureCollection', features: flows });
      // 默认仅显示跨省流线
      applyFlowFilter();

      renderRanks(); renderLegend(); bindLayout(); bindHover();
      setLabels(true);
      app.fitBounds(CFG.chinaCore, { animate: false });
    }).catch(function (err) {
      console.error('[cn-spring-migration] 数据加载失败', err);
      el.rankInflow.innerHTML = '<p class="note">数据加载失败，请刷新重试。</p>';
    });
  }

  /* ── 3. 界面渲染 ──────────────────────────────────────── */
  function renderRanks() {
    var inflow = nodes.filter(function (n) { return n.properties.net > 0; })
      .sort(function (a, b) { return b.properties.net - a.properties.net; }).slice(0, 10);
    var outflow = nodes.filter(function (n) { return n.properties.net < 0; })
      .sort(function (a, b) { return a.properties.net - b.properties.net; }).slice(0, 10);
    function row(n, i) {
      var p = n.properties, v = p.net > 0 ? '+' + p.net.toFixed(1) : p.net.toFixed(1);
      var cls = p.net > 0 ? 'pos' : 'neg';
      return '<button type="button" class="rank-item" data-adcode="' + p.adcode + '">' +
        '<span class="no">' + (i + 1) + '</span>' +
        '<span class="nm">' + esc(p.name) + '</span>' +
        '<span class="vv ' + cls + '">' + v + '</span></button>';
    }
    el.rankInflow.innerHTML = inflow.map(row).join('') || '<p class="note">—</p>';
    el.rankOutflow.innerHTML = outflow.map(row).join('') || '<p class="note">—</p>';
    var onClick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      app.collapseDrawer(); selectCity(parseInt(b.dataset.adcode, 10), true);
    };
    el.rankInflow.onclick = onClick; el.rankOutflow.onclick = onClick;
  }

  function renderLegend() {
    el.legend.innerHTML =
      '<div class="lg-title">迁徙连线 · 线越粗联系越强</div>' +
      '<span><i class="sw grad"></i> 百度迁徙占比（相对值）</span>' +
      '<div class="lg-title">城市节点 · 红蓝看净流动</div>' +
      '<span><i class="sw dot" style="background:' + CFG.netPos + '"></i> 净流入（人口抽水机）</span>' +
      '<span><i class="sw dot" style="background:' + CFG.netNeg + '"></i> 净流出（人口输出地）</span>' +
      '<span><i class="sw dot" style="background:' + CFG.netMid + '"></i> 进出大致均衡</span>' +
      '<div class="lg-title">流线颜色</div>' +
      '<span><i class="sw" style="background:' + CFG.flowColor + '"></i> 跨省流（春运主角）</span>' +
      '<span><i class="sw" style="background:' + CFG.flowColorIntra + '"></i> 省内短途（默认隐藏）</span>';
  }

  function renderDetailCity(adcode) {
    var f = byAdcode[adcode]; if (!f) return;
    var p = f.properties;
    el.detail.style.setProperty('--rc', p.net > 0 ? CFG.netPos : (p.net < 0 ? CFG.netNeg : CFG.netMid));
    el.dtRole.textContent = 'CITY';
    el.dtName.textContent = p.name;
    var netTxt = p.net > 0 ? '净流入 · 人口抽水机' : (p.net < 0 ? '净流出 · 人口输出地' : '进出均衡');
    el.dtTagline.textContent = netTxt;
    el.dtM1Label.textContent = '联系强度'; el.dtM1.textContent = p.strength.toFixed(1);
    el.dtM2Label.textContent = '净流动'; el.dtM2.textContent = (p.net > 0 ? '+' : '') + p.net.toFixed(1);
    el.dtM3Label.textContent = '关联城市'; el.dtM3.textContent = (adj[adcode] || []).length;

    var list = adj[adcode] || [];
    var ins = list.filter(function (e) { return e.dir === 'in'; }).sort(function (a, b) { return b.w - a.w; }).slice(0, 6);
    var outs = list.filter(function (e) { return e.dir === 'out'; }).sort(function (a, b) { return b.w - a.w; }).slice(0, 6);
    function row(e) {
      var n = byAdcode[e.other]; var nm = n ? n.properties.name : e.other;
      return '<div class="flow-row"><span>' + esc(nm) + '</span><b>' + e.w.toFixed(1) + '%</b></div>';
    }
    el.dtDescLabel.textContent = '主要来源 / 去向（占比）';
    el.dtFlows.innerHTML =
      '<div class="flow-col"><small>主要来源（谁流入它）</small>' + (ins.length ? ins.map(row).join('') : '<div class="flow-row"><span>—</span></div>') + '</div>' +
      '<div class="flow-col"><small>主要去向（它流向谁）</small>' + (outs.length ? outs.map(row).join('') : '<div class="flow-row"><span>—</span></div>') + '</div>';
    el.dtFooter.innerHTML = '<span>WGS84 <b>' + p.wgs84[0].toFixed(2) + '°E, ' + p.wgs84[1].toFixed(2) + '°N</b></span>';
    el.detail.hidden = false; app.setDetailOpen(true);
  }

  function renderDetailFlow(f) {
    var p = f.properties;
    el.detail.style.setProperty('--rc', CFG.flowColor);
    el.dtRole.textContent = 'FLOW';
    el.dtName.textContent = p.from_name + ' → ' + p.to_name;
    el.dtTagline.textContent = p.cross ? '跨省迁徙' : '省内短途';
    el.dtM1Label.textContent = '占比'; el.dtM1.textContent = p.w.toFixed(1) + '%';
    el.dtM2Label.textContent = '方向'; el.dtM2.textContent = '人从 ' + p.from_name + ' 去 ' + p.to_name;
    el.dtM3Label.textContent = '类型'; el.dtM3.textContent = p.cross ? '跨省' : '省内';
    el.dtDescLabel.textContent = '说明';
    el.dtFlows.innerHTML = '<p class="note">该连线为「' + esc(p.from_name) + '→' + esc(p.to_name) +
      '」的城市间迁徙联系（百度迁徙占比 ' + p.w.toFixed(1) + '%），直线示意非实际路径。</p>';
    el.dtFooter.innerHTML = '<span>数据日 <b>2026.02.10</b></span>';
    el.detail.hidden = false; app.setDetailOpen(true);
  }

  function hideDetail() { el.detail.hidden = true; app.setDetailOpen(false); }

  function setLabels(force) {
    if (!labelOn) { app.setLabels([]); return; }
    var full = map.getZoom() >= CFG.fullLabelZoom;
    if (!force && full === fullLabels) return;
    fullLabels = full;
    var items = [];
    var selAdcode = selected && selected.type === 'city' ? selected.adcode : null;
    nodes.forEach(function (f) {
      var p = f.properties;
      if (p.strength < 28 && !full) return;
      items.push({
        text: p.name, lng: f.geometry.coordinates[0], lat: f.geometry.coordinates[1],
        color: '#cfe0f5', kind: 'dot', active: selAdcode === p.adcode
      });
    });
    app.setLabels(items);
  }

  /* ── 4. 选中与特效 ─────────────────────────────────────── */
  function setFlowState(activeSet) {
    flows.forEach(function (f) {
      var id = f.properties.id;
      var on = activeSet && activeSet.has(id);
      map.setFeatureState({ source: 'flow', id: id },
        { sel: !!on, dim: !!(activeSet && !on) });
    });
  }
  function setNodeState(keep) {
    nodes.forEach(function (f) {
      map.setFeatureState({ source: 'node', id: f.properties.id }, { dim: !!(keep && f.properties.adcode !== keep) });
    });
  }

  function bboxOfFeats(feats) {
    var b = [Infinity, Infinity, -Infinity, -Infinity];
    feats.forEach(function (f) {
      var x = Thematic.bboxOf(f.geometry); if (!x) return;
      b[0] = Math.min(b[0], x[0]); b[1] = Math.min(b[1], x[1]); b[2] = Math.max(b[2], x[2]); b[3] = Math.max(b[3], x[3]);
    });
    return b[0] === Infinity ? null : b;
  }

  function selectCity(adcode, move) {
    var f = byAdcode[adcode]; if (!f) return;
    selected = { type: 'city', adcode: adcode };

    var related = flows.filter(function (x) {
      return x.properties.from === adcode || x.properties.to === adcode;
    });
    var ids = new Set(related.map(function (x) { return x.properties.id; }));
    // selFlow 装相关流线（在 flow-sel 上叠发光）；selNode 装选中城市本身（在 node-halo 上描白圈）
    map.getSource('selFlow').setData({ type: 'FeatureCollection', features: related.length ? related : [] });
    map.getSource('selNode').setData({ type: 'FeatureCollection', features: [f] });
    ['flow-sel', 'node-halo'].forEach(function (lid) { if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', 'visible'); });

    setFlowState(ids); setNodeState(adcode);
    renderDetailCity(adcode); setLabels(true);
    if (move) {
      var bb = bboxOfFeats(related.length ? related : [f]);
      app.fitBounds(bb || Thematic.padBbox([f.geometry.coordinates[0], f.geometry.coordinates[1], f.geometry.coordinates[0], f.geometry.coordinates[1]], 0.5),
        { animate: true, maxZoom: 6.8, withDetail: true, duration: 720 });
    }
  }

  function selectFlow(f, move) {
    selected = { type: 'flow', flow: f };
    map.getSource('selFlow').setData({ type: 'FeatureCollection', features: [f] });
    var ends = [byAdcode[f.properties.from], byAdcode[f.properties.to]].filter(Boolean);
    map.getSource('selNode').setData({ type: 'FeatureCollection', features: ends });
    ['flow-sel', 'node-halo'].forEach(function (lid) { if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', 'visible'); });
    var ids = new Set([f.properties.id]);
    setFlowState(ids); setNodeState(null);
    renderDetailFlow(f); setLabels(true);
    if (move) app.fitBounds(bboxOfFeats([f]), { animate: true, maxZoom: 6.5, withDetail: true, duration: 700 });
  }

  function clearSel() {
    selected = null;
    map.getSource('selFlow').setData(Thematic.EMPTY);
    map.getSource('selNode').setData(Thematic.EMPTY);
    ['flow-sel', 'node-halo'].forEach(function (lid) { if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', 'none'); });
    setFlowState(null); setNodeState(null);
    hideDetail(); setLabels(true);
  }

  function applyFlowFilter() {
    var f = intraOn ? null : ['==', ['get', 'cross'], true];
    ['flow-line', 'flow-casing'].forEach(function (l) { if (map.getLayer(l)) map.setFilter(l, f); });
    var af = intraOn ? ['>', ['get', 'w'], 1.5] : ['all', ['==', ['get', 'cross'], true], ['>', ['get', 'w'], 1.5]];
    if (map.getLayer('flow-arrow')) map.setFilter('flow-arrow', af);
  }

  /* ── 5. 悬停 / 点击 / 控件 ─────────────────────────────── */
  function geomDistance(g, pt) {
    var min = Infinity;
    (function walk(c) {
      if (typeof c[0] === 'number') {
        var p = map.project(c), dx = p.x - pt.x, dy = p.y - pt.y, d = Math.sqrt(dx * dx + dy * dy);
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
      var n = pickNearest(e.point, ['node-dot'], Thematic.isMobile() ? 16 : 6);
      var f = n ? null : pickNearest(e.point, ['flow-line'], Thematic.isMobile() ? 14 : 5);
      var nextType = n ? 'node' : (f ? 'flow' : '');
      var nextId = n ? n.properties.id : (f ? f.properties.id : '');
      if (nextType !== hovered.type || nextId !== hovered.id) {
        if (hovered.type) map.setFeatureState({ source: hovered.type, id: hovered.id }, { hover: false });
        hovered = { type: nextType, id: nextId };
        if (nextType) map.setFeatureState({ source: nextType, id: nextId }, { hover: true });
      }
      if (nextType) {
        map.getCanvas().style.cursor = 'pointer';
        if (nextType === 'node') {
          var np = n.properties;
          var tag = (np.net > 0 ? '净流入 ' : (np.net < 0 ? '净流出 ' : '均衡 ')) + np.net.toFixed(1);
          app.tooltip('<b>' + esc(np.name) + '</b> <span style="color:#8fa3bd">' + esc(tag) + ' · 强度 ' + np.strength.toFixed(1) + '</span>', e.point.x, e.point.y);
        } else {
          var fp = f.properties;
          app.tooltip('<b>' + esc(fp.from_name + ' → ' + fp.to_name) + '</b> <span style="color:#8fa3bd">' + fp.w.toFixed(1) + '% · ' + (fp.cross ? '跨省' : '省内') + '</span>', e.point.x, e.point.y);
        }
      } else { map.getCanvas().style.cursor = ''; app.tooltip(null); }
    });
    map.on('mouseleave', function () {
      if (hovered.type) { map.setFeatureState({ source: hovered.type, id: hovered.id }, { hover: false }); hovered = { type: '', id: '' }; }
      app.tooltip(null);
    });
    map.on('click', function (e) {
      var n = pickNearest(e.point, ['node-dot'], Thematic.isMobile() ? 16 : 6);
      if (n) { app.collapseDrawer(); selectCity(n.properties.adcode, true); return; }
      var f = pickNearest(e.point, ['flow-line'], Thematic.isMobile() ? 14 : 5);
      if (f) { app.collapseDrawer(); selectFlow(f, true); return; }
      clearSel();
    });
    map.on('zoom', function () { setLabels(false); });
  }

  function bindLayout() {
    var ckIntra = document.getElementById('ckIntra');
    if (ckIntra) ckIntra.addEventListener('change', function () { intraOn = this.checked; applyFlowFilter(); });
    var ckLabel = document.getElementById('ckLabel');
    if (ckLabel) ckLabel.addEventListener('change', function () { labelOn = this.checked; setLabels(true); });
  }
})();
