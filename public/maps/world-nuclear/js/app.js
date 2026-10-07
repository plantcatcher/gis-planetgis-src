/* 全球核电站分布地图 —— 互动逻辑
   数据：scripts/build_world_nuclear.py 生成的
        units.json（1387 台核电机组）/ sites.json（485 个设施地点）
        countries.json（59 国聚合）/ stats.json
   引擎：_shared/thematic

   两个必修的坑（cn-rivers / world-hydro 都踩过）：
   ① 密集点位命中不能取 queryRenderedFeatures()[0]——低缩放下相邻机组只隔几像素，
      必须「命中框内取离指针最近的那个」。
   ② 国家标注必须做 AABB 碰撞检测——按数组顺序输出会让小国被大国挤掉、标签叠成一片。 */
(function () {
  'use strict';

  var CFG = window.NUC_CONFIG;
  var fmt = Thematic.fmt, esc = Thematic.esc;

  var DATA = {
    units: 'data/units.json',
    sites: 'data/sites.json',
    countries: 'data/countries.json',
    stats: 'data/stats.json'
  };

  var S = {
    units: [], sites: [], countries: [], stats: null, byCountry: {},
    status: 'all',        // all | OP | CON | PLN | SUS | RET | CAN
    capMin: 0,            // 装机门槛 MW
    eraMax: 2040,         // 投运年上限
    selUnit: null, selSite: null, selCountry: null,
    viewUnits: [], viewSites: [], bubbles: []
  };

  var el = {
    segStatus: document.getElementById('segStatus'),
    statusNote: document.getElementById('statusNote'),
    statusN: document.getElementById('statusN'),
    chipCap: document.getElementById('chipCap'),
    capLb: document.getElementById('capLb'),
    eraRange: document.getElementById('eraRange'),
    eraLb: document.getElementById('eraLb'),
    eraTicks: document.getElementById('eraTicks'),
    eraFill: document.getElementById('eraFill'),
    eraNote: document.getElementById('eraNote'),
    rankList: document.getElementById('rankList'),
    rankTitle: document.getElementById('rankTitle'),
    rankNote: document.getElementById('rankNote'),
    legend: document.getElementById('legend'),
    fUnit: document.getElementById('fUnit'),
    fCapOp: document.getElementById('fCapOp'),
    fOp: document.getElementById('fOp'),
    fCountry: document.getElementById('fCountry'),
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

  var GROUPS = {};
  CFG.statusGroups.forEach(function (g) { GROUPS[g.code] = g; });
  function groupColor(code) { return (GROUPS[code] || {}).color || '#94a3b8'; }
  function groupLabel(code) { return (GROUPS[code] || {}).label || code; }

  /* 国家总装机分档色 */
  function cntColor(w) {
    w = w || 0;
    for (var i = 0; i < CFG.cntTiers.length; i++) if (w >= CFG.cntTiers[i].min) return CFG.cntTiers[i].color;
    return CFG.cntTiers[CFG.cntTiers.length - 1].color;
  }
  /* 紧凑容量文案：≥1 万 MW 用 GW，其余用 MW（单位写明，不玩「万」歧义） */
  function fmtGW(v) {
    if (v == null) return '—';
    if (v >= 10000) return fmt(v / 1000, 1) + ' GW';
    return fmt(v, 0) + ' MW';
  }

  /* 与气泡图层同口径的 log 插值（标签偏移复用，保证标签跟着气泡真实半径走） */
  function interp(v, stops) {
    if (v <= stops[0][0]) return stops[0][1];
    for (var i = 1; i < stops.length; i++) {
      if (v <= stops[i][0]) {
        var a = stops[i - 1], b = stops[i];
        return a[1] + (b[1] - a[1]) * (v - a[0]) / (b[0] - a[0]);
      }
    }
    return stops[stops.length - 1][1];
  }
  var FAR_Z = 3;

  function esriTiles(url) {
    return ['0', '1', '2', '3'].map(function () { return url; });
  }

  var app = Thematic.create({
    slug: 'world-nuclear',
    view: CFG.view,
    bounds: CFG.bounds,
    boundsMobile: CFG.boundsMobile,
    extent: CFG.extent,
    graticuleStep: CFG.graticuleStep,
    province: false,
    basemaps: {
      img: esriTiles(CFG.basemaps.img.tile),
      vec: esriTiles(CFG.basemaps.vec.tile),
      imgAttr: CFG.imgAttr,
      vecAttr: CFG.vecAttr
    },
    imgPaint: CFG.imgPaint,
    sources: {
      unit: { data: Thematic.EMPTY },
      site: { data: Thematic.EMPTY },
      bubble: { data: Thematic.EMPTY },
      sel: { data: Thematic.EMPTY },
      selOne: { data: Thematic.EMPTY },
      selCountry: { data: Thematic.EMPTY }
    },
    layers: [
      /* 国家总装机气泡：半径按 log10(总装机) 分级，低缩放用收缩版（ct-bubble-far） */
      { id: 'ct-bubble', type: 'circle', source: 'bubble',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'lw'], 1.2, 4, 2, 7, 3, 12, 4, 19, 5, 28, 6, 40],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.16,
          'circle-stroke-width': 1.2, 'circle-stroke-color': ['get', 'color'], 'circle-stroke-opacity': 0.6
        } },
      { id: 'ct-bubble-far', type: 'circle', source: 'bubble', layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'lw'], 1.2, 2.6, 2, 4.6, 3, 8, 4, 12.5, 5, 18, 6, 24],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.1,
          'circle-stroke-width': 1, 'circle-stroke-color': ['get', 'color'], 'circle-stroke-opacity': 0.4
        } },
      /* 设施地点（项目级）：半径按总装机、半透明、默认隐藏（data-toggle-layer 控制） */
      { id: 'site-pt', type: 'circle', source: 'site', layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            1, ['*', 0.62, ['get', 'r']], 3, ['*', 1.0, ['get', 'r']],
            5, ['*', 1.5, ['get', 'r']], 8, ['*', 2.3, ['get', 'r']], 11, ['*', 3.4, ['get', 'r']]],
          'circle-color': ['get', 'color'],
          'circle-opacity': ['interpolate', ['linear'], ['zoom'], 1.5, 0.4, 3, 0.62, 6, 0.7],
          'circle-stroke-width': 1, 'circle-stroke-color': 'rgba(255,255,255,.5)', 'circle-stroke-opacity': 0.6
        } },
      /* 核电机组：半径 = 基础半径 r（由装机容量算出）× zoom 系数；颜色 = 状态 */
      { id: 'unit-pt', type: 'circle', source: 'unit',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            1, ['*', 0.62, ['get', 'r']], 3, ['*', 1.0, ['get', 'r']],
            5, ['*', 1.5, ['get', 'r']], 8, ['*', 2.3, ['get', 'r']], 11, ['*', 3.4, ['get', 'r']]],
          'circle-color': ['get', 'color'],
          'circle-opacity': ['interpolate', ['linear'], ['zoom'], 1.5, 0.5, 3, 0.85, 6, 0.95],
          'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 4, 0, 6, 0.5, 8, 0.9],
          'circle-stroke-color': 'rgba(255,255,255,.55)'
        } },
      /* 选中发光（高亮集合） */
      { id: 'pt-glow', type: 'circle', source: 'sel', layout: { visibility: 'none' },
        paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 9, 5, 19, 9, 34],
          'circle-color': '#ffffff', 'circle-opacity': 0.16 } },
      /* 选中描边（单个被点中的对象） */
      { id: 'pt-sel', type: 'circle', source: 'selOne', layout: { visibility: 'none' },
        paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 5, 5, 11, 9, 20],
          'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-width': 2.4,
          'circle-stroke-color': '#ffffff', 'circle-opacity': 0.96 } },
      /* 选中国家描边（两档半径与气泡图层配套） */
      { id: 'ct-sel', type: 'circle', source: 'selCountry', layout: { visibility: 'none' },
        paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 8, 3, 22, 5, 36, 7, 52],
          'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-width': 2.6,
          'circle-stroke-color': '#ffffff', 'circle-stroke-opacity': 0.9 } },
      { id: 'ct-sel-far', type: 'circle', source: 'selCountry', layout: { visibility: 'none' },
        paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 5, 2, 11, 3, 15],
          'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-width': 2.2,
          'circle-stroke-color': '#ffffff', 'circle-stroke-opacity': 0.88 } }
    ],
    onReady: boot,
    onOverview: function () { clearSel(); app.fitAll({ animate: true }); },
    onClose: function () { clearSel(); }
  });

  /* 缩放切换气泡档位（同时受 ckBubble 勾选态约束） */
  function syncBubbleZoom() {
    var z = app.map.getZoom();
    var far = z < FAR_Z;
    var on = el.detail && document.getElementById('ckBubble').checked;
    app.setVisible('ct-bubble', on && !far);
    app.setVisible('ct-bubble-far', on && far);
    var selOn = !!S.selCountry;
    app.setVisible('ct-sel', selOn && !far);
    app.setVisible('ct-sel-far', selOn && far);
  }

  /* ── 筛选 ─────────────────────────────────────────────────── */
  function passUnit(p) {
    if (S.status !== 'all' && p.g !== S.status) return false;
    if (S.capMin > 0 && (p.w == null || p.w < S.capMin)) return false;
    if (S.eraMax < 2040 && (p.y == null || p.y > S.eraMax)) return false;
    return true;
  }
  function passSite(p) {
    if (S.status !== 'all' && p.g !== S.status) return false;
    if (S.capMin > 0 && (p.w == null || p.w < S.capMin)) return false;
    return true;
  }

  function applyFilter() {
    S.viewUnits = S.units.filter(function (f) { return passUnit(f.properties); });
    S.viewSites = S.sites.filter(function (f) { return passSite(f.properties); });
    app.map.getSource('unit').setData({ type: 'FeatureCollection', features: S.viewUnits });
    app.map.getSource('site').setData({ type: 'FeatureCollection', features: S.viewSites });

    if (S.selUnit && !S.viewUnits.some(function (f) { return f.properties.id === S.selUnit.properties.id; })) clearUnitSel();
    if (S.selSite && !S.viewSites.some(function (f) { return f.properties.id === S.selSite.properties.id; })) clearSiteSel();

    renderBubbles();
    renderRank();
    setLabels();
    syncUI();
  }

  /* ── 国家气泡（装机加权重心） ─────────────────────────────── */
  function aggregate(feats) {
    var acc = {};
    feats.forEach(function (f) {
      var p = f.properties, k = p.c;
      if (!acc[k]) acc[k] = { n: 0, w: 0, x: 0, y: 0, wsum: 0 };
      var a = acc[k];
      a.n++;
      var w = (p.w != null && p.w > 0) ? p.w : 1;
      a.x += f.geometry.coordinates[0] * w;
      a.y += f.geometry.coordinates[1] * w;
      a.wsum += w;
      if (p.w != null) a.w += p.w;
    });
    return acc;
  }
  function renderBubbles() {
    var acc = aggregate(S.viewUnits);
    var feats = S.countries.map(function (c) {
      var a = acc[c.c];
      if (!a || !a.n) return null;
      var cx = a.wsum ? a.x / a.wsum : (c.cxy ? c.cxy[0] : null);
      var cy = a.wsum ? a.y / a.wsum : (c.cxy ? c.cxy[1] : null);
      if (cx == null) return null;
      return {
        type: 'Feature', geometry: { type: 'Point', coordinates: [cx, cy] },
        properties: { c: c.c, n: a.n, w: a.w || 0, lw: Math.log10(Math.max(a.w || 0, 1)), color: cntColor(a.w || 0) }
      };
    }).filter(Boolean);
    S.bubbles = feats;
    app.map.getSource('bubble').setData({ type: 'FeatureCollection', features: feats });
  }

  /* ── 图例 ─────────────────────────────────────────────────── */
  function renderLegend() {
    var html = '<div class="lg-cap">机组点色 · 反应堆状态</div>';
    CFG.statusGroups.forEach(function (g) {
      html += '<span class="lg-row"><i style="background:' + g.color + '"></i>' + esc(g.label) + '</span>';
    });
    html += '<div class="lg-cap" style="margin-top:5px">点位大小 = 装机容量</div>';
    html += '<div class="lg-cap" style="margin-top:5px">国家气泡 · 总装机</div>';
    CFG.cntTiers.forEach(function (t) {
      html += '<span class="lg-row"><s style="background:' + t.color + '"></s>' + esc(t.label) + '</span>';
    });
    el.legend.innerHTML = html;
  }

  /* ── 国家排行 ─────────────────────────────────────────────── */
  var RANK_N = 12;
  /* 台账全量总装机的国家名次（1 起）。与 renderRank 的「筛选后」列表是两回事，
     详情卡副标题用它，因为「全球第几」不该随筛选条件跳来跳去。 */
  function totalRank(key) {
    var s = S.countries.slice().sort(function (a, b) { return b.w - a.w; });
    for (var i = 0; i < s.length; i++) { if (s[i].c === key) return i + 1; }
    return '—';
  }
  function renderRank() {
    var acc = aggregate(S.viewUnits);
    var list = S.countries.map(function (c) {
      var a = acc[c.c];
      return { c: c.c, cn: c.cn, n: a ? a.n : 0, w: a ? a.w : 0 };
    }).filter(function (x) { return x.n > 0; }).sort(function (a, b) { return b.w - a.w; });

    var filtered = (S.status !== 'all' || S.capMin > 0 || S.eraMax < 2040);
    el.rankTitle.textContent = filtered ? '国家总装机排行（筛选后）' : '国家总装机排行';
    var shown = list.slice(0, RANK_N);
    el.rankNote.textContent = '共 ' + list.length + ' 国 · 显示前 ' + shown.length;

    if (!shown.length) {
      el.rankList.innerHTML = '<p class="note" style="margin:0">当前筛选下没有机组。</p>';
      return;
    }
    var max = Math.max.apply(null, shown.map(function (x) { return x.w || 0; })) || 1;
    el.rankList.innerHTML = shown.map(function (x) {
      var w = Math.round((x.w || 0) / max * 100);
      var active = S.selCountry === x.c ? ' active' : '';
      return '<button type="button" class="chart-row' + active + '" data-c="' + esc(x.c) + '">' +
        '<span class="nm">' + esc(x.cn) + '</span>' +
        '<span class="bar"><i style="width:' + w + '%;background:' + cntColor(x.w) + '"></i></span>' +
        '<span class="vl">' + fmtGW(x.w) + '</span></button>';
    }).join('');
  }
  el.rankList.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    app.collapseDrawer();
    selectCountry(b.dataset.c, true);
  });

  /* ── 标注：国家名（带 AABB 碰撞检测） ────────────────────── */
  function setLabels() {
    if (!S.viewUnits.length) { app.setLabels([]); return; }
    var map = app.map, bd = map.getBounds(), z = map.getZoom();
    var cands = [];
    var acc = aggregate(S.viewUnits);
    S.countries.forEach(function (c) {
      var a = acc[c.c];
      if (!a || !a.n) return;
      var cx = a.wsum ? a.x / a.wsum : (c.cxy ? c.cxy[0] : null);
      var cy = a.wsum ? a.y / a.wsum : (c.cxy ? c.cxy[1] : null);
      if (cx == null) return;
      if (cx < bd.getWest() || cx > bd.getEast() || cy < bd.getSouth() || cy > bd.getNorth()) return;
      cands.push({ cn: c.cn, lng: cx, lat: cy, w: a.w, key: c.c });
    });
    cands.sort(function (p, q) { return (q.w || 0) - (p.w || 0); });

    var boxes = [];
    var FS = z < 3 ? 11 : 12;
    function hits(b) {
      for (var i = 0; i < boxes.length; i++) {
        var o = boxes[i];
        if (b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0) return true;
      }
      return false;
    }
    var items = [];
    var MAX = z < 2.6 ? 26 : (z < 4.5 ? 40 : 70);
    cands.forEach(function (c) {
      if (items.length >= MAX) return;
      var p = map.project([c.lng, c.lat]);
      var txt = c.cn, w = txt.length * FS * 0.95 + 20, h = FS * 1.9;
      var br = interp(c.w ? Math.log10(Math.max(c.w, 1)) : 1.2, z < FAR_Z ? CFG.cntStopsFar : CFG.cntStops);
      var cy2 = p.y - (br + 8);
      var box = { x0: p.x - w / 2, x1: p.x + w / 2, y0: cy2 - h / 2, y1: cy2 + h / 2 };
      if (hits(box)) return;
      boxes.push(box);
      items.push({ text: txt, lng: c.lng, lat: c.lat, color: cntColor(c.w), kind: 'tag', active: S.selCountry === c.key });
    });

    if (S.selUnit || S.selSite) {
      var sp = (S.selUnit || S.selSite);
      items.push({
        text: sp.properties.n || sp.properties.pr || sp.properties.id,
        lng: sp.geometry.coordinates[0], lat: sp.geometry.coordinates[1],
        color: '#fff', kind: 'dot', active: true
      });
    }
    app.setLabels(items);
  }

  /* ── 选中：机组 ───────────────────────────────────────────── */
  function plainFeature(f) {
    return {
      type: 'Feature',
      properties: JSON.parse(JSON.stringify(f.properties)),
      geometry: { type: 'Point', coordinates: [f.geometry.coordinates[0], f.geometry.coordinates[1]] }
    };
  }
  function selectUnit(f, move) {
    S.selUnit = f; S.selSite = null; S.selCountry = null;
    app.map.getSource('selCountry').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('ct-sel', 'visibility', 'none');
    app.map.setLayoutProperty('ct-sel-far', 'visibility', 'none');
    app.map.getSource('sel').setData({ type: 'FeatureCollection', features: [plainFeature(f)] });
    app.map.getSource('selOne').setData({ type: 'FeatureCollection', features: [plainFeature(f)] });
    app.map.setLayoutProperty('pt-glow', 'visibility', 'visible');
    app.map.setLayoutProperty('pt-sel', 'visibility', 'visible');

    var p = f.properties, col = p.color;
    app.setDetailOpen(true); el.detail.hidden = false;
    el.detail.style.setProperty('--rc', col);
    el.dtRole.textContent = 'REACTOR UNIT';
    el.dtName.textContent = p.n || p.pr || p.id;
    el.dtSub.textContent = [p.cn, p.rt, groupLabel(p.g)].filter(Boolean).join(' · ');
    el.dtLb1.textContent = '装机'; el.dtV1.textContent = p.w == null ? '—' : fmt(p.w, 0); el.dtU1.textContent = p.w == null ? '未标注' : 'MW';
    el.dtLb2.textContent = '状态'; el.dtV2.textContent = p.stzh || groupLabel(p.g); el.dtU2.textContent = '';
    el.dtLb3.textContent = '投运'; el.dtV3.textContent = p.y == null ? '—' : p.y; el.dtU3.textContent = p.y == null ? '未标注' : '年';

    el.dtDescLb.textContent = '反应堆与业主';
    var bits = [];
    if (p.rt) bits.push('反应堆：' + p.rt);
    if (p.owner) bits.push('业主：' + p.owner);
    if (p.operator) bits.push('运营商：' + p.operator);
    if (p.loc) bits.push('坐标精度：' + (p.loc === 'exact' ? '精确' : '近似'));
    el.dtDesc.textContent = bits.join('；') + '。';

    el.dtFooter.innerHTML = '<span>项目：' + esc(p.pr || '—') + '</span>' +
      (p.wiki ? '<span><a href="' + esc(p.wiki) + '" target="_top" style="color:inherit">GEM 维基 ↗</a></span>' : '') +
      '<span>ID：' + esc(p.id) + '</span>';

    renderRank(); setLabels();
    if (move) app.map.easeTo({ center: f.geometry.coordinates, zoom: Math.max(app.map.getZoom(), 5), duration: 720 });
  }
  function clearUnitSel() {
    S.selUnit = null;
    app.map.getSource('sel').setData(Thematic.EMPTY);
    app.map.getSource('selOne').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('pt-glow', 'visibility', 'none');
    app.map.setLayoutProperty('pt-sel', 'visibility', 'none');
  }

  /* ── 选中：设施地点（项目级） ─────────────────────────────── */
  function selectSite(f, move) {
    S.selSite = f; S.selUnit = null; S.selCountry = null;
    app.map.getSource('selCountry').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('ct-sel', 'visibility', 'none');
    app.map.setLayoutProperty('ct-sel-far', 'visibility', 'none');
    app.map.getSource('sel').setData({ type: 'FeatureCollection', features: [plainFeature(f)] });
    app.map.getSource('selOne').setData({ type: 'FeatureCollection', features: [plainFeature(f)] });
    app.map.setLayoutProperty('pt-glow', 'visibility', 'visible');
    app.map.setLayoutProperty('pt-sel', 'visibility', 'visible');

    var p = f.properties, col = p.color;
    app.setDetailOpen(true); el.detail.hidden = false;
    el.detail.style.setProperty('--rc', col);
    el.dtRole.textContent = 'NUCLEAR SITE';
    el.dtName.textContent = p.n || p.id;
    el.dtSub.textContent = [p.cn, '项目级 · ' + (p.uc || '?') + ' 台机组', groupLabel(p.g)].filter(Boolean).join(' · ');
    el.dtLb1.textContent = '总装机'; el.dtV1.textContent = p.w == null ? '—' : fmt(p.w, 0); el.dtU1.textContent = p.w == null ? '未标注' : 'MW';
    el.dtLb2.textContent = '机组数'; el.dtV2.textContent = p.uc == null ? '—' : p.uc; el.dtU2.textContent = p.uc == null ? '' : '台';
    el.dtLb3.textContent = '主导状态'; el.dtV3.textContent = p.stset && p.stset.length ? p.stset.join(' / ') : '—'; el.dtU3.textContent = '';

    el.dtDescLb.textContent = '反应堆与运营';
    var bits = [];
    if (p.rtset && p.rtset.length) bits.push('反应堆类型：' + p.rtset.join('、'));
    if (p.owner) bits.push('业主：' + p.owner);
    if (p.operator) bits.push('运营商：' + p.operator);
    el.dtDesc.textContent = bits.join('；') + '。同一项目地点的多台机组已合并为一点，点位大小为该地点总装机。';

    el.dtFooter.innerHTML = '<span>项目级地点</span>' +
      (p.wiki ? '<span><a href="' + esc(p.wiki) + '" target="_top" style="color:inherit">GEM 维基 ↗</a></span>' : '') +
      '<span>ID：' + esc(p.id) + '</span>';

    renderRank(); setLabels();
    if (move) app.map.easeTo({ center: f.geometry.coordinates, zoom: Math.max(app.map.getZoom(), 5), duration: 720 });
  }
  function clearSiteSel() {
    S.selSite = null;
    app.map.getSource('sel').setData(Thematic.EMPTY);
    app.map.getSource('selOne').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('pt-glow', 'visibility', 'none');
    app.map.setLayoutProperty('pt-sel', 'visibility', 'none');
  }

  /* ── 选中国家 ─────────────────────────────────────────────── */
  function selectCountry(key, move) {
    var c = S.countries.filter(function (x) { return x.c === key; })[0];
    if (!c) return;
    S.selCountry = key; clearUnitSel(); clearSiteSel();
    var pts = S.viewUnits.filter(function (f) { return f.properties.c === key; });
    if (pts.length) app.map.getSource('sel').setData({ type: 'FeatureCollection', features: pts });
    else app.map.getSource('sel').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('pt-glow', 'visibility', pts.length ? 'visible' : 'none');
    app.map.setLayoutProperty('pt-sel', 'visibility', 'none');

    var bf = (S.bubbles || []).filter(function (f) { return f.properties.c === key; });
    if (bf.length) {
      app.map.getSource('selCountry').setData({ type: 'FeatureCollection', features: bf });
      app.map.setLayoutProperty('ct-sel', 'visibility', 'visible');
    } else {
      app.map.getSource('selCountry').setData(Thematic.EMPTY);
      app.map.setLayoutProperty('ct-sel', 'visibility', 'none');
    }
    syncBubbleZoom();

    var acc = aggregate(S.viewUnits)[key] || { n: 0, w: 0 };
    var col = cntColor(acc.w || 0);
    var filtered = (S.status !== 'all' || S.capMin > 0 || S.eraMax < 2040);
    app.setDetailOpen(true); el.detail.hidden = false;
    el.detail.style.setProperty('--rc', col);
    el.dtRole.textContent = 'COUNTRY';
    el.dtName.textContent = c.cn;
    /* 无筛选时两个数字必然相同，别把同一个数说两遍。
       名次按台账全量总装机排（与筛选无关），不跟 renderRank 的筛选后列表混用。 */
    el.dtSub.textContent = (filtered && acc.n !== c.n)
      ? '筛选后 ' + acc.n + ' / 台账 ' + c.n + ' 台机组'
      : c.n + ' 台机组 · 总装机全球第 ' + totalRank(c.c) + ' 位';

    el.dtLb1.textContent = '总装机';
    el.dtV1.textContent = acc.w == null || acc.n === 0 ? '—' : fmt(acc.w, 0);
    el.dtU1.textContent = acc.n === 0 ? '未标注' : 'MW';
    el.dtLb2.textContent = '运行中';
    el.dtV2.textContent = (c.g && c.g.OP) ? c.g.OP : '—'; el.dtU2.textContent = '台';
    el.dtLb3.textContent = '首末投运';
    el.dtV3.textContent = c.y0 == null ? '—' : c.y0;
    el.dtU3.textContent = c.y1 == null ? '未标注' : (c.y1 == c.y0 ? '年起' : ' → ' + c.y1);

    el.dtDescLb.textContent = '状态构成与型式';
    var gparts = CFG.statusGroups.map(function (g) { return { k: g.code, n: (c.g && c.g[g.code]) || 0 }; })
      .filter(function (x) { return x.n > 0; }).map(function (x) { return groupLabel(x.k) + ' ' + x.n + ' 台'; });
    var rparts = Object.keys(c.rt || {}).slice(0, 5).map(function (k) { return k + ' ' + c.rt[k] + ' 台'; });
    el.dtDesc.textContent = '状态：' + (gparts.join(' · ') || '—') + '。主要型式：' + (rparts.join(' · ') || '—') + '。';

    el.dtFooter.innerHTML = '<span>台账机组：' + c.n + ' 台</span>' +
      '<span>重心：装机加权</span>';
    renderRank(); setLabels();
    if (move && c.cxy) app.map.easeTo({ center: c.cxy, zoom: Math.max(app.map.getZoom(), 4), duration: 760 });
  }

  function clearSel() {
    S.selCountry = null; clearUnitSel(); clearSiteSel();
    app.map.getSource('selCountry').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('ct-sel', 'visibility', 'none');
    app.map.setLayoutProperty('ct-sel-far', 'visibility', 'none');
    app.setDetailOpen(false); el.detail.hidden = true;
    renderRank(); setLabels();
  }

  /* ── 命中：框内取离指针最近 ──────────────────────────────── */
  function pickNearest(point, layerId, pad) {
    var map = app.map;
    var p = pad === undefined ? app.pad() : pad;
    var px = point && typeof point.x === 'number' ? point.x : (point && point[0]);
    var py = point && typeof point.y === 'number' ? point.y : (point && point[1]);
    if (px == null || py == null) return null;
    var box = p > 0 ? [[px - p, py - p], [px + p, py + p]] : [px, py];
    var list = map.queryRenderedFeatures(box, { layers: [layerId] });
    if (!list.length) return null;
    if (list.length === 1) return list[0];
    var best = list[0], bd = Infinity;
    for (var i = 0; i < list.length; i++) {
      var g = list[i].geometry;
      if (!g || g.type !== 'Point') continue;
      var pr = map.project(g.coordinates);
      var d = (pr.x - px) * (pr.x - px) + (pr.y - py) * (pr.y - py);
      if (d < bd) { bd = d; best = list[i]; }
    }
    return best;
  }

  /* ── 交互绑定 ────────────────────────────────────────────── */
  function bind() {
    app.map.on('zoom', function () { syncBubbleZoom(); });
    app.map.on('mousemove', function (e) {
      var p = pickNearest(e.point, 'unit-pt', 5);
      if (p) {
        var pr = p.properties;
        app.map.getCanvas().style.cursor = 'pointer';
        app.tooltip('<b>' + esc(pr.n || pr.pr || pr.id) + '</b> <span style="color:' + pr.color + '">' +
          (pr.w == null ? '装机未标注' : fmt(pr.w, 0) + ' MW') + '</span><br><span style="color:#9fb4cd">' +
          esc(pr.cn || '') + (pr.rt ? ' · ' + esc(pr.rt) : '') + (pr.stzh ? ' · ' + esc(pr.stzh) : '') + '</span>', e.point.x, e.point.y);
        return;
      }
      var s = pickNearest(e.point, 'site-pt', 6);
      if (s) {
        var sp = s.properties;
        app.map.getCanvas().style.cursor = 'pointer';
        app.tooltip('<b>' + esc(sp.n || sp.id) + '</b> <span style="color:' + sp.color + '">' +
          (sp.w == null ? '总装机未标注' : fmt(sp.w, 0) + ' MW') + '</span><br><span style="color:#9fb4cd">' +
          (sp.uc || '?') + ' 台机组 · 项目级地点</span>', e.point.x, e.point.y);
        return;
      }
      var b = pickNearest(e.point, 'ct-bubble', 4);
      if (b) {
        var bp = b.properties, meta = S.countries.filter(function (x) { return x.c === bp.c; })[0];
        app.map.getCanvas().style.cursor = 'pointer';
        app.tooltip('<b>' + esc(meta ? meta.cn : bp.c) + '</b> <span style="color:' + cntColor(bp.w) + '">' +
          (bp.n ? fmtGW(bp.w) : '装机未标注') + '</span><br><span style="color:#9fb4cd">' +
          bp.n + ' 台机组</span>', e.point.x, e.point.y);
        return;
      }
      app.map.getCanvas().style.cursor = ''; app.tooltip(null);
    });
    app.map.on('mouseleave', function () { app.tooltip(null); });

    app.map.on('click', function (e) {
      var p = pickNearest(e.point, 'unit-pt', 5);
      if (p) { app.collapseDrawer(); selectUnit(p, true); return; }
      var s = pickNearest(e.point, 'site-pt', 6);
      if (s) { app.collapseDrawer(); selectSite(s, true); return; }
      var b = pickNearest(e.point, 'ct-bubble', 4);
      if (b) { app.collapseDrawer(); selectCountry(b.properties.c, true); return; }
      clearSel();
    });

    el.segStatus.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.status = b.dataset.v; applyFilter();
    });
    el.chipCap.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.capMin = parseFloat(b.dataset.v) || 0; applyFilter();
    });
    el.eraRange.addEventListener('input', function () {
      S.eraMax = parseInt(this.value, 10);
      applyFilter();
      var pct = (S.eraMax - 1950) / (2040 - 1950) * 100;
      if (el.eraFill) el.eraFill.style.width = pct + '%';
    });
    // 国家气泡开关需兼顾缩放档位（ct-bubble / ct-bubble-far 互斥）
    var ck = document.getElementById('ckBubble');
    if (ck) ck.addEventListener('change', function () { syncBubbleZoom(); });
  }

  /* ── UI 同步 ──────────────────────────────────────────────── */
  function syncUI() {
    Array.prototype.forEach.call(el.segStatus.children, function (b) {
      b.classList.toggle('active', b.dataset.v === S.status);
    });
    Array.prototype.forEach.call(el.chipCap.children, function (b) {
      b.classList.toggle('active', (parseFloat(b.dataset.v) || 0) === S.capMin);
    });
    var nu = S.viewUnits.length, ns = S.viewSites.length;
    el.statusN.textContent = fmt(nu, 0) + ' 台机组' + (ns && S.status === 'all' && S.capMin === 0 && S.eraMax >= 2040 ? ' / ' + fmt(ns, 0) + ' 地点' : '');
    var g = GROUPS[S.status];
    el.statusNote.textContent = S.status === 'all'
      ? '显示全部 ' + fmt(nu, 0) + ' 台机组。点上方状态可单独观察某一类机组的地理分布。'
      : '仅显示' + g.label + '机组 ' + fmt(nu, 0) + ' 台 —— 颜色即该状态。';
    el.capLb.textContent = S.capMin > 0 ? '≥ ' + fmt(S.capMin, 0) + ' MW' : '≥ 0 MW';
    el.eraLb.textContent = S.eraMax >= 2040 ? '1951 至今' : '1951 – ' + S.eraMax;
    if (S.eraMax >= 2040) {
      el.eraNote.textContent = '拖动时间轴，只看某个年代之前投运的机组——核电的两次浪潮（1970 年前后欧美首波、1980 年前后法苏大建）与 2010 年后的小堆复兴会依次浮现。';
    } else {
      var nNoYear = S.viewUnits.filter(function (f) { return f.properties.y == null; }).length;
      el.eraNote.textContent = '仅统计 ' + S.eraMax + ' 年及之前投运的机组，当前 ' + fmt(nu, 0) + ' 台。'
        + (nNoYear ? '另有 ' + nNoYear + ' 台因缺投运年记录被一并排除。' : '');
    }
  }

  function renderEraTicks() {
    var ys = [1950, 1970, 1990, 2010, 2030, 2040], html = '';
    ys.forEach(function (y) { html += '<span>' + y + '</span>'; });
    el.eraTicks.innerHTML = html;
    if (el.eraFill) el.eraFill.style.width = '100%';
  }

  /* ── 启动 ─────────────────────────────────────────────────── */
  function boot() {
    Promise.all([
      fetch(DATA.units).then(function (r) { return r.json(); }),
      fetch(DATA.sites).then(function (r) { return r.json(); }),
      fetch(DATA.countries).then(function (r) { return r.json(); }),
      fetch(DATA.stats).then(function (r) { return r.json(); })
    ]).then(function (res) {
      var units = res[0], sites = res[1], countries = res[2], stats = res[3];
      S.units = units.features; S.sites = sites.features;
      S.countries = countries.countries; S.stats = stats;
      S.countries.forEach(function (c) { S.byCountry[c.c] = c; });

      el.fUnit.textContent = fmt(stats.nUnit, 0);
      el.fCapOp.textContent = fmt(stats.capOp / 1000, 0);
      el.fOp.textContent = fmt(stats.nOp, 0);
      el.fCountry.textContent = stats.nCountry;

      renderLegend();
      renderEraTicks();
      bind();
      applyFilter();
      app.fitAll({ animate: false });
      syncBubbleZoom();
      setLabels();
      window.__nucDebug = { ready: true, n: S.units.length, bubbles: app.map.querySourceFeatures('bubble').length };
    }).catch(function (err) {
      console.error('[world-nuclear] 数据加载失败', err);
      el.rankList.innerHTML = '<p class="note" style="margin:0">数据加载失败，请刷新重试。</p>';
    });
  }
})();
