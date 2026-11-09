/* 中国春运人口迁徙 · 互动逻辑 v2（基于 _shared/thematic 共享运行时）
 *
 * v2 变化（相对 app.js）：
 *   1. 直线 → 飞机航线式弧线（二次贝塞尔，垂直偏移 = 距离 × arcK，左航向偏）
 *   2. 统一橙色 → 蓝→红双色分段航线：流出端用起点城市净流动色（蓝），
 *      流入端用终点城市净流动色（红），线随城市「送人 / 吸人」语义着色
 *   3. 航线加光：宽模糊辉光层 + 白色虚线沿强通道流动（dash 逐帧步进）
 *   4. 科技感底图：深空底色 + 陆地色块 + 海岸辉光 + 经纬网常开（切卫星 / 矢量自动隐藏）
 *
 * 结构：
 *   1. 建图与图层（辉光 / 描边 / 双色航线 / 流光 / 箭头 / 节点 / 选中）
 *   2. 数据装载 + 弧线展开 + 邻接表
 *   3. 界面渲染（排行 / 图例 / 详情卡 / 标注）
 *   4. 选中与特效（点城市高亮其全部流入流出；红蓝节点表达净流动）
 *   5. 悬停、点击、图层与底图
 *
 * 数据说明：边权重为百度迁徙规模指数占比（相对值），航线为城市间弧线示意。
 */
(function () {
  'use strict';

  var CFG = window.CSM_CONFIG;
  var NODE_URL = 'data/nodes.json';
  var FLOW_URL = 'data/flows.json';
  var esc = Thematic.esc;

  var nodes = [], flows = [], byId = {}, byAdcode = {}, byPath = {}, adj = {};
  var selected = null;          // {type:'city', adcode} | {type:'flow', id}
  var hovered = { type: '', id: '' };
  var intraOn = false, labelOn = true, fullLabels = null;
  var maxFlowW = 0;             // 全图最强航线的占比（详情卡大条的比例尺）
  var dashTimer = 0, dashIdx = 0;

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
    background: CFG.background,
    imgPaint: CFG.imgPaint,
    sources: {
      node: { data: Thematic.EMPTY, promoteId: 'id' },
      flow: { data: Thematic.EMPTY, promoteId: 'id' },
      flowpath: { data: Thematic.EMPTY, promoteId: 'id' },
      selNode: { data: Thematic.EMPTY },
      selFlow: { data: Thematic.EMPTY }
    },
    layers: [
      /* 辉光（最底）：同色宽线 + 大模糊，营造「航线发光」 */
      { id: 'flow-glow', type: 'line', source: 'flow',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['get', 'c'],
          'line-blur': 4,
          'line-width': ['interpolate', ['linear'], ['get', 'w'], 1, 3.4, 3, 5.4, 6, 8, 12, 12, 20, 17],
          'line-opacity': ['case',
            ['boolean', ['feature-state', 'sel'], false], 0.95,
            ['boolean', ['feature-state', 'dim'], false], 0.06,
            ['boolean', ['get', 'cross'], false], 0.55, 0.3]
        } },
      /* 描边：深色衬底，把双色线从辉光里托出来 */
      { id: 'flow-casing', type: 'line', source: 'flow',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#020610',
          'line-width': ['interpolate', ['linear'], ['get', 'w'], 1, 2.8, 3, 4.4, 6, 6.6, 12, 10, 20, 14.4],
          'line-opacity': ['case',
            ['boolean', ['feature-state', 'sel'], false], 0.9,
            ['boolean', ['feature-state', 'dim'], false], 0.04,
            ['boolean', ['get', 'cross'], false], 0.4, 0.3]
        } },
      /* 双色航线主体：颜色取线两端城市的净流动色 */
      { id: 'flow-line', type: 'line', source: 'flow',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['get', 'c'],
          'line-width': ['interpolate', ['linear'], ['get', 'w'], 1, 1.0, 3, 1.8, 6, 3.0, 12, 4.6, 20, 6.6],
          'line-opacity': ['case',
            ['boolean', ['feature-state', 'sel'], false], 1,
            ['boolean', ['feature-state', 'dim'], false], 0.1,
            ['boolean', ['get', 'cross'], false], 0.85, 0.45]
        } },
      /* 流光：白色虚线沿强通道流动（dash 逐帧步进，见 startSpark） */
      { id: 'flow-spark', type: 'line', source: 'flow',
        layout: { 'line-cap': 'butt', 'line-join': 'round' },
        paint: {
          'line-color': '#ffffff',
          'line-width': 1.6,
          'line-opacity': 0.85
        } },
      /* 流向箭头：沿整条弧线（flowpath）布点 */
      { id: 'flow-arrow', type: 'symbol', source: 'flowpath', minzoom: 4,
        layout: {
          'symbol-placement': 'line', 'icon-image': 'arrow', 'icon-rotation-alignment': 'map',
          'icon-size': ['interpolate', ['linear'], ['zoom'], 4, 0.42, 7, 0.72],
          'symbol-spacing': 110, 'icon-allow-overlap': true
        },
        paint: { 'icon-opacity': ['case',
          ['boolean', ['feature-state', 'dim'], false], 0.06,
          ['boolean', ['feature-state', 'sel'], false], 1, 0.75] } },
      /* 选中辉线：单条 / 单城聚焦时的亮蓝描亮 */
      { id: 'flow-sel', type: 'line', source: 'selFlow',
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint: { 'line-color': '#bfe3ff',
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 2.8, 7, 5, 11, 8],
          'line-opacity': 0.9, 'line-blur': 1 } },
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
    return x.getImageData(0, 0, s, s);
  }

  /* 飞机航线式弧线：二次贝塞尔，控制点取中点沿航向左侧偏移 d×arcK */
  function arcCoords(a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    var d = Math.sqrt(dx * dx + dy * dy) || 0.0001;
    var n = Math.max(28, Math.min(72, Math.round(d * 1.6)));
    var cx = (a[0] + b[0]) / 2 - dy * CFG.arcK;
    var cy = (a[1] + b[1]) / 2 + dx * CFG.arcK;
    var pts = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n, mt = 1 - t;
      pts.push([
        mt * mt * a[0] + 2 * mt * t * cx + t * t * b[0],
        mt * mt * a[1] + 2 * mt * t * cy + t * t * b[1]
      ]);
    }
    return pts;
  }

  /* 城市净流动色：与 node-dot 同一判据，保证航线端点与节点同色衔接 */
  function netColor(net) {
    return net > 5 ? CFG.netPos : (net < -5 ? CFG.netNeg : CFG.netMid);
  }

  /* ── 2. 数据装载 + 弧线展开 + 邻接表 ────────────────────── */
  function boot() {
    try { map.addImage('arrow', makeArrow()); } catch (e) { console.warn('[arrow] addImage 失败', e); }
    installTechBasemap();

    Promise.all([
      fetch(NODE_URL).then(function (r) { return r.json(); }),
      fetch(FLOW_URL).then(function (r) { return r.json(); })
    ]).then(function (res) {
      nodes = res[0].features;
      nodes.forEach(function (f) { byId[f.properties.id] = f; byAdcode[f.properties.adcode] = f; });

      /* 展开弧线：每条有向边拆成 起点段(c=起点色) + 终点段(c=终点色)，
         flowpath 存整条弧线供箭头 / 选中 / 视野定位用 */
      var legs = [], paths = [];
      res[1].features.forEach(function (f) {
        var p = f.properties;
        p.id = p.from + '-' + p.to;
        var A = byAdcode[p.from], B = byAdcode[p.to];
        if (!A || !B || !A.geometry || !B.geometry) return;
        var pts = arcCoords(A.geometry.coordinates, B.geometry.coordinates);
        var h = Math.floor(pts.length / 2);
        legs.push({ type: 'Feature', properties: { id: p.id, leg: 1, c: netColor(A.properties.net), w: p.w, cross: p.cross, from: p.from, to: p.to, from_name: p.from_name, to_name: p.to_name }, geometry: { type: 'LineString', coordinates: pts.slice(0, h + 1) } });
        legs.push({ type: 'Feature', properties: { id: p.id, leg: 2, c: netColor(B.properties.net), w: p.w, cross: p.cross, from: p.from, to: p.to, from_name: p.from_name, to_name: p.to_name }, geometry: { type: 'LineString', coordinates: pts.slice(h) } });
        var path = { type: 'Feature', properties: { id: p.id, w: p.w, cross: p.cross, from: p.from, to: p.to, from_name: p.from_name, to_name: p.to_name }, geometry: { type: 'LineString', coordinates: pts } };
        paths.push(path); byPath[p.id] = path; byId[p.id] = path;
        /* 邻接表：adcode -> [{other, w, dir}] */
        (adj[p.from] = adj[p.from] || []).push({ other: p.to, w: p.w, dir: 'out' });
        (adj[p.to] = adj[p.to] || []).push({ other: p.from, w: p.w, dir: 'in' });
      });
      flows = paths;
      maxFlowW = flows.reduce(function (m, f) { return Math.max(m, f.properties.w); }, 0);

      map.getSource('node').setData({ type: 'FeatureCollection', features: nodes });
      map.getSource('flow').setData({ type: 'FeatureCollection', features: legs });
      map.getSource('flowpath').setData({ type: 'FeatureCollection', features: paths });
      applyFlowFilter();

      renderRanks(); renderLegend(); bindLayout(); bindHover();
      startSpark();
      setLabels(true);
      app.fitBounds(CFG.chinaCore, { animate: false });
    }).catch(function (err) {
      console.error('[cn-spring-migration] 数据加载失败', err);
      el.rankInflow.innerHTML = '<p class="note">数据加载失败，请刷新重试。</p>';
    });
  }

  /* ── 2.5 科技感底图（深空底 + 陆地色块 + 海岸辉光 + 经纬网） ──
     陆地 / 海岸层插到 grat 之前：压在 bg 上、被卫星 / 矢量底图覆盖逻辑接管。
     切到 img / vec 底图时自动隐藏（见 bindLayout 的 basemap 钩子）。 */
  function installTechBasemap() {
    try {
      if (map.getSource('prov') && !map.getLayer('land-fill')) {
        map.addLayer({ id: 'land-fill', type: 'fill', source: 'prov',
          paint: { 'fill-color': CFG.landFill, 'fill-opacity': 0.92 } }, 'grat');
      }
      if (map.getSource('prov') && !map.getLayer('coast-glow')) {
        map.addLayer({ id: 'coast-glow', type: 'line', source: 'prov',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': CFG.coastGlow, 'line-width': 3.5, 'line-blur': 6, 'line-opacity': 0.5 } }, 'grat');
      }
      if (map.getLayer('prov-line')) {
        map.setPaintProperty('prov-line', 'line-color', CFG.provLine);
        map.setPaintProperty('prov-line', 'line-opacity', 0.55);
      }
      if (map.getLayer('grat')) {
        map.setPaintProperty('grat', 'line-color', CFG.gratColor);
        map.setPaintProperty('grat', 'line-opacity', 0.4);
        map.setLayoutProperty('grat', 'visibility', 'visible');
      }
    } catch (e) { console.warn('[tech-basemap] 安装失败', e); }
  }

  /* ── 流光：dash 步进序列（MapLibre 官方 animate-a-line 范式） ── */
  var DASH_SEQ = [
    [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1],
    [2.5, 4, 0.5], [3, 4, 0], [0, 0.5, 3, 3.5, 0], [0, 1, 2.5, 3, 0.5],
    [0, 1.5, 2, 2.5, 1], [0, 2, 1.5, 2, 1.5], [0, 2.5, 1, 1.5, 2],
    [0, 3, 0.5, 1, 2.5], [0, 4, 0, 0.5, 3], [3, 0.5, 0, 0.5, 3],
    [2.5, 1, 0, 1, 2.5], [2, 1.5, 0, 1.5, 2], [1.5, 2, 0, 2, 1.5],
    [1, 2.5, 0, 2.5, 1], [0.5, 3, 0, 3, 0.5], [0, 4, 0, 4, 0]
  ];
  function startSpark() {
    if (dashTimer || !map.getLayer('flow-spark')) return;
    dashTimer = setInterval(function () {
      if (document.hidden || !map.getLayer('flow-spark')) return;
      dashIdx = (dashIdx + 1) % DASH_SEQ.length;
      try { map.setPaintProperty('flow-spark', 'line-dasharray', DASH_SEQ[dashIdx]); } catch (_) {}
    }, 70);
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
      '<div class="lg-title">迁徙航线 · 蓝→红双色</div>' +
      '<span><i class="sw grad"></i> 蓝端 = 从人口输出地出发</span>' +
      '<span><i class="sw grad"></i> 红端 = 抵达人口「抽水机」</span>' +
      '<span><i class="sw" style="background:#fff"></i> 流动光点 · 春运主力通道</span>' +
      '<div class="lg-title">城市节点 · 红蓝看净流动</div>' +
      '<span><i class="sw dot" style="background:' + CFG.netPos + '"></i> 净流入（人口抽水机）</span>' +
      '<span><i class="sw dot" style="background:' + CFG.netNeg + '"></i> 净流出（人口输出地）</span>' +
      '<span><i class="sw dot" style="background:' + CFG.netMid + '"></i> 进出大致均衡</span>' +
      '<div class="lg-title">其他</div>' +
      '<span><i class="sw" style="background:rgba(207,224,245,.35)"></i> 省内短途（默认隐藏）</span>';
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
    /* 占比条：以本列表最大值为满格，红条=流入、蓝条=流出 */
    function row(e, cls, maxW) {
      var n = byAdcode[e.other]; var nm = n ? n.properties.name : e.other;
      var pct = maxW > 0 ? Math.max(6, Math.round(e.w / maxW * 100)) : 0;
      return '<div class="flow-row ' + cls + '">' +
        '<span class="fname">' + esc(nm) + '</span>' +
        '<i class="bar"><b style="width:' + pct + '%"></b></i>' +
        '<b class="fval">' + e.w.toFixed(1) + '%</b></div>';
    }
    var inMax = ins.length ? Math.max.apply(null, ins.map(function (e) { return e.w; })) : 1;
    var outMax = outs.length ? Math.max.apply(null, outs.map(function (e) { return e.w; })) : 1;
    el.dtDescLabel.textContent = '主要来源 / 去向（占比条以组内最强为满格）';
    el.dtFlows.innerHTML =
      '<div class="flow-col"><small>主要来源（谁流入它）</small>' + (ins.length ? ins.map(function (e) { return row(e, 'in', inMax); }).join('') : '<div class="flow-row"><span class="fname">—</span></div>') + '</div>' +
      '<div class="flow-col"><small>主要去向（它流向谁）</small>' + (outs.length ? outs.map(function (e) { return row(e, 'out', outMax); }).join('') : '<div class="flow-row"><span class="fname">—</span></div>') + '</div>';
    el.dtFooter.innerHTML = '<span>WGS84 <b>' + p.wgs84[0].toFixed(2) + '°E, ' + p.wgs84[1].toFixed(2) + '°N</b></span>';
    el.detail.hidden = false; app.setDetailOpen(true);
  }

  function renderDetailFlow(f) {
    var p = f.properties;
    el.detail.style.setProperty('--rc', netColor(byAdcode[p.to] ? byAdcode[p.to].properties.net : 0));
    el.dtRole.textContent = 'FLOW';
    el.dtName.textContent = p.from_name + ' → ' + p.to_name;
    el.dtTagline.textContent = p.cross ? '跨省迁徙航线' : '省内短途';
    el.dtM1Label.textContent = '占比'; el.dtM1.textContent = p.w.toFixed(1) + '%';
    el.dtM2Label.textContent = '方向'; el.dtM2.textContent = '人从 ' + p.from_name + ' 去 ' + p.to_name;
    el.dtM3Label.textContent = '类型'; el.dtM3.textContent = p.cross ? '跨省' : '省内';
    el.dtDescLabel.textContent = '强度对比';
    var rel = maxFlowW > 0 ? Math.max(4, Math.round(p.w / maxFlowW * 100)) : 0;
    el.dtFlows.innerHTML =
      '<div class="dt-bigbar"><i><b style="width:' + rel + '%"></b></i>' +
      '<small>迁徙占比 ' + p.w.toFixed(1) + '% · 相当于全图最强通道（' + maxFlowW.toFixed(1) + '%）的 ' + rel + '%</small></div>' +
      '<p class="note">线段蓝端为人口输出方、红端为人口流入方；弧线为两点间示意，非实际航路。</p>';
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
      var st = { sel: !!on, dim: !!(activeSet && !on) };
      map.setFeatureState({ source: 'flow', id: id }, st);
      map.setFeatureState({ source: 'flowpath', id: id }, st);
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
    // selFlow 装相关航线整弧（flow-sel 亮蓝描亮）；selNode 装选中城市本身（node-halo 白圈）
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

  function selectFlow(id, move) {
    var path = byPath[id]; if (!path) return;
    selected = { type: 'flow', id: id };
    map.getSource('selFlow').setData({ type: 'FeatureCollection', features: [path] });
    var ends = [byAdcode[path.properties.from], byAdcode[path.properties.to]].filter(Boolean);
    map.getSource('selNode').setData({ type: 'FeatureCollection', features: ends });
    ['flow-sel', 'node-halo'].forEach(function (lid) { if (map.getLayer(lid)) map.setLayoutProperty(lid, 'visibility', 'visible'); });
    setFlowState(new Set([id])); setNodeState(null);
    renderDetailFlow(path); setLabels(true);
    if (move) app.fitBounds(bboxOfFeats([path]), { animate: true, maxZoom: 6.5, withDetail: true, duration: 700 });
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
    var main = intraOn ? null : ['==', ['get', 'cross'], true];
    ['flow-glow', 'flow-casing', 'flow-line'].forEach(function (l) { if (map.getLayer(l)) map.setFilter(l, main); });
    /* 流光只走强跨省主通道，与「显示省内短途」开关无关 */
    if (map.getLayer('flow-spark')) map.setFilter('flow-spark', ['all', ['==', ['get', 'cross'], true], ['>', ['get', 'w'], CFG.sparkMinW]]);
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
      if (f) { app.collapseDrawer(); selectFlow(f.properties.id, true); return; }
      clearSel();
    });
    map.on('zoom', function () { setLabels(false); });
  }

  function bindLayout() {
    /* 设置按钮：左下齿轮，弹出图层/底图面板；点地图或再点一次收起 */
    var toolBtn = document.getElementById('toolToggle'), toolPanel = document.getElementById('panel');
    function setTool(open) {
      if (!toolPanel) return;
      toolPanel.classList.toggle('open', open);
      if (toolBtn) { toolBtn.classList.toggle('open', open); toolBtn.setAttribute('aria-expanded', String(open)); }
    }
    if (toolBtn) toolBtn.addEventListener('click', function (e) { e.stopPropagation(); setTool(!toolPanel.classList.contains('open')); });
    if (toolPanel) toolPanel.addEventListener('click', function (e) { e.stopPropagation(); });
    map.on('click', function () { setTool(false); });

    var ckIntra = document.getElementById('ckIntra');
    if (ckIntra) ckIntra.addEventListener('change', function () { intraOn = this.checked; applyFlowFilter(); });
    var ckLabel = document.getElementById('ckLabel');
    if (ckLabel) ckLabel.addEventListener('change', function () { labelOn = this.checked; setLabels(true); });
    /* 科技底图层跟随底图切换：卫星 / 矢量时隐藏陆地色块与海岸辉光 */
    Array.prototype.forEach.call(document.querySelectorAll('input[name="basemap"]'), function (r) {
      r.addEventListener('change', function () {
        if (!this.checked) return;
        var techOn = this.value === 'none';
        ['land-fill', 'coast-glow'].forEach(function (id) {
          if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', techOn ? 'visible' : 'none');
        });
      });
    });
  }
})();
