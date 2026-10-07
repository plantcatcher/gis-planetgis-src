/* 世界港口分布地图 —— 互动逻辑
   数据：scripts/build_world_ports.py 生成的
        ports.json（1081 个港口点位）/ countries.json（122 国聚合）/ stats.json
   引擎：_shared/thematic

   两个必修的坑（cn-rivers / world-hydro 都踩过）：
   ① 密集点位命中不能取 queryRenderedFeatures()[0]——低缩放下相邻港口只隔几像素，
      必须「命中框内取离指针最近的那个」。
   ② 枢纽港标注必须做 AABB 碰撞检测——按数组顺序输出会让密集区标签叠成一片。 */
(function () {
  'use strict';

  var CFG = window.PORTS_CONFIG;
  var fmt = Thematic.fmt, esc = Thematic.esc;

  var DATA = {
    ports: 'data/ports.json',
    countries: 'data/countries.json',
    stats: 'data/stats.json'
  };

  var TIER_BY_RANK = {};
  CFG.TIERS.forEach(function (t) { TIER_BY_RANK[t.rank] = t; });

  var S = {
    all: [],
    countries: [],
    byCountry: {},          // 国家 EN → 聚合对象
    stats: null,
    tierMax: 8,             // 只显示 scalerank ≤ tierMax 的港口（越小越重要）
    q: '',                  // 名称搜索（小写子串）
    selPort: null,
    selCountry: null,
    view: []
  };

  var el = {
    chipTier: document.getElementById('chipTier'),
    tierN: document.getElementById('tierN'),
    tierNote: document.getElementById('tierNote'),
    q: document.getElementById('q'),
    qClear: document.getElementById('qClear'),
    qN: document.getElementById('qN'),
    qNote: document.getElementById('qNote'),
    rankList: document.getElementById('rankList'),
    rankTitle: document.getElementById('rankTitle'),
    rankNote: document.getElementById('rankNote'),
    legend: document.getElementById('legend'),
    fPort: document.getElementById('fPort'),
    fCountry: document.getElementById('fCountry'),
    fWeb: document.getElementById('fWeb'),
    fHub: document.getElementById('fHub'),
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

  /* 由 zoomK 生成 circle-radius 表达式（基础半径写成要素属性 baseR） */
  function radiusExpr() {
    var e = ['interpolate', ['linear'], ['zoom']];
    CFG.zoomK.forEach(function (s) {
      e.push(s[0], ['*', s[1], ['get', 'baseR']]);
    });
    return e;
  }

  function tierColor(r) {
    var t = TIER_BY_RANK[r];
    return t ? t.color : '#94a3b8';
  }
  function tierLabel(r) {
    var t = TIER_BY_RANK[r];
    return t ? t.label : '未标注';
  }
  function fmtCoord(lat, lon) {
    var la = Math.abs(lat).toFixed(2) + '°' + (lat >= 0 ? 'N' : 'S');
    var lo = Math.abs(lon).toFixed(2) + '°' + (lon >= 0 ? 'E' : 'W');
    return la + ', ' + lo;
  }

  /* 与图层 circle-radius 同口径的 log/线性插值（标签偏移复用） */
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

  var app = Thematic.create({
    slug: 'world-ports',
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
      port: { data: Thematic.EMPTY },
      sel: { data: Thematic.EMPTY }
    },
    layers: [
      { id: 'port-pt', type: 'circle', source: 'port',
        paint: {
          'circle-radius': radiusExpr(),
          'circle-color': ['get', 'color'],
          'circle-opacity': ['interpolate', ['linear'], ['zoom'], 1.2, 0.5, 3, 0.85, 6, 0.95],
          'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 4, 0, 6, 0.6, 8, 1],
          'circle-stroke-color': 'rgba(255,255,255,.55)'
        } },
      /* 选中港口：白色光环 + 柔光 */
      { id: 'port-glow', type: 'circle', source: 'sel', layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 9, 5, 20, 9, 38],
          'circle-color': '#ffffff', 'circle-opacity': 0.16
        } },
      { id: 'port-sel', type: 'circle', source: 'sel', layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 5, 5, 12, 9, 22],
          'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-width': 2.4,
          'circle-stroke-color': '#ffffff', 'circle-opacity': 0.96
        } }
    ],
    onReady: boot,
    onOverview: function () { clearSel(); app.fitAll({ animate: true }); },
    onClose: function () { clearSel(); }
  });

  /* ── 命中：框内取离指针最近（低缩放下相邻港口只隔几像素） ──── */
  function pickNearest(point, pad) {
    var map = app.map;
    var p = pad === undefined ? app.pad() : pad;
    var px = point && typeof point.x === 'number' ? point.x : (point && point[0]);
    var py = point && typeof point.y === 'number' ? point.y : (point && point[1]);
    if (px == null || py == null) return null;
    var box = p > 0 ? [[px - p, py - p], [px + p, py + p]] : [px, py];
    var list = map.queryRenderedFeatures(box, { layers: ['port-pt'] });
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

  /* ── 筛选 ─────────────────────────────────────────────────── */
  function passFilter(p) {
    if (p.r > S.tierMax) return false;
    if (S.q) {
      var name = (p.n || '').toLowerCase();
      if (name.indexOf(S.q) === -1) return false;
    }
    return true;
  }

  function applyFilter() {
    var feats = S.all.filter(function (f) { return passFilter(f.properties); });
    S.view = feats;
    app.map.getSource('port').setData({ type: 'FeatureCollection', features: feats });

    if (S.selPort && !feats.some(function (f) { return f.properties.id === S.selPort.properties.id; })) {
      clearPortSel();
    }
    renderRank();
    setLabels();
    syncUI();
  }

  /* ── 图例 ─────────────────────────────────────────────────── */
  function renderLegend() {
    var html = '<div class="lg-cap">港口点位 · 重要性六档</div>';
    CFG.TIERS.forEach(function (t) {
      html += '<span class="lg-row"><i style="background:' + t.color + '"></i>' + esc(t.label) +
        ' <em>（' + t.rank + '）</em></span>';
    });
    el.legend.innerHTML = html;
  }

  /* ── 国家排行 ─────────────────────────────────────────────── */
  var RANK_N = 15;
  function renderRank() {
    var list = S.countries.map(function (c) {
      var shown = S.view.filter(function (f) { return f.properties.c === c.c; }).length;
      var hubs = S.view.filter(function (f) {
        return f.properties.c === c.c && f.properties.r <= 4;
      }).length;
      return { c: c.c, cn: c.cn, n: shown, hubs: hubs };
    }).filter(function (x) { return x.n > 0; })
      .sort(function (a, b) { return b.n - a.n; });

    var filtered = (S.tierMax < 8 || S.q);
    el.rankTitle.textContent = filtered ? '各国港口数量排行（筛选后）' : '各国港口数量排行';
    el.rankNote.textContent = '共 ' + list.length + ' 国 · 前 ' + RANK_N;

    if (!list.length) {
      el.rankList.innerHTML = '<p class="note" style="margin:0">当前筛选下没有港口。</p>';
      return;
    }
    var max = Math.max.apply(null, list.slice(0, RANK_N).map(function (x) { return x.n; })) || 1;
    el.rankList.innerHTML = list.slice(0, RANK_N).map(function (x) {
      var w = Math.round(x.n / max * 100);
      var active = S.selCountry === x.c ? ' active' : '';
      return '<button type="button" class="chart-row' + active + '" data-c="' + esc(x.c) + '">' +
        '<span class="nm">' + esc(x.cn) + '</span>' +
        '<span class="bar"><i style="width:' + w + '%"></i></span>' +
        '<span class="vl">' + x.n + ' <em>（' + x.hubs + '）</em></span></button>';
    }).join('');
  }

  el.rankList.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    app.collapseDrawer();
    selectCountry(b.dataset.c, true);
  });

  /* ── 标注：枢纽港名（带 AABB 碰撞检测） ───────────────────── */
  function setLabels() {
    if (!S.view.length) { app.setLabels([]); return; }
    var map = app.map;
    var bd = map.getBounds();
    var z = map.getZoom();

    var cands = [];
    S.view.forEach(function (f) {
      if (f.properties.r > CFG.labelRankMax) return;
      var x = f.geometry.coordinates[0], y = f.geometry.coordinates[1];
      if (x < bd.getWest() || x > bd.getEast() || y < bd.getSouth() || y > bd.getNorth()) return;
      cands.push({ name: f.properties.n, lng: x, lat: y, color: f.properties.color, key: f.properties.id, baseR: f.properties.baseR, r: f.properties.r });
    });
    // 重要性高的（rank 小）优先拿到标签
    cands.sort(function (a, b) { return a.r - b.r; });

    var boxes = [];
    var FS = z < 3 ? 11 : (z < 5 ? 12 : 12.5);
    function hits(b) {
      for (var i = 0; i < boxes.length; i++) {
        var o = boxes[i];
        if (b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0) return true;
      }
      return false;
    }
    var items = [];
    var MAX = z < 2.6 ? 30 : (z < 4.5 ? 50 : 90);
    cands.forEach(function (c) {
      if (items.length >= MAX) return;
      var p = map.project([c.lng, c.lat]);
      var txt = c.name;
      var w = txt.length * FS * 0.95 + 20;
      var h = FS * 1.9;
      var br = interp(c.baseR, CFG.zoomK);   // 标签抬高量跟随该点真实半径
      var cy2 = p.y - (br + 8);
      var box = { x0: p.x - w / 2, x1: p.x + w / 2, y0: cy2 - h / 2, y1: cy2 + h / 2 };
      if (hits(box)) return;
      boxes.push(box);
      items.push({ text: txt, lng: c.lng, lat: c.lat, color: c.color, kind: 'tag', active: (S.selPort && S.selPort.properties.id === c.key) });
    });

    // 选中港口额外加一个标签
    if (S.selPort) {
      var sp = S.selPort.properties;
      items.push({
        text: sp.n, lng: S.selPort.geometry.coordinates[0],
        lat: S.selPort.geometry.coordinates[1], color: '#fff', kind: 'dot', active: true
      });
    }
    app.setLabels(items);
  }

  /* ── 选中港口 ─────────────────────────────────────────────── */
  function plainFeature(f) {
    return {
      type: 'Feature',
      properties: JSON.parse(JSON.stringify(f.properties)),
      geometry: { type: 'Point', coordinates: [f.geometry.coordinates[0], f.geometry.coordinates[1]] }
    };
  }

  function selectPort(f, move) {
    S.selPort = f;
    S.selCountry = null;
    app.map.getSource('sel').setData({ type: 'FeatureCollection', features: [plainFeature(f)] });
    app.map.setLayoutProperty('port-glow', 'visibility', 'visible');
    app.map.setLayoutProperty('port-sel', 'visibility', 'visible');

    var p = f.properties;
    var col = p.color || tierColor(p.r);
    var tier = TIER_BY_RANK[p.r];

    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', col);
    el.dtRole.textContent = 'PORT';
    el.dtName.textContent = p.n || ('# ' + p.id);
    el.dtSub.textContent = [p.cn, tier ? tier.label : ''].filter(Boolean).join(' · ');

    el.dtLb1.textContent = '档位'; el.dtV1.textContent = tier ? tier.label : '—'; el.dtU1.textContent = '';
    el.dtLb2.textContent = '国家'; el.dtV2.textContent = p.cn || '—'; el.dtU2.textContent = '';
    el.dtLb3.textContent = '坐标'; el.dtV3.textContent = fmtCoord(p.lat, p.lon); el.dtU3.textContent = '';

    el.dtDescLb.textContent = '数据与链接';
    var bits = [];
    if (p.ns != null) bits.push('显示比例尺约 1:' + fmt(p.ns, 0) + ' 百万（natlscale=' + fmt(p.ns, 0) + '）');
    else bits.push('未记录显示比例尺');
    if (tier && tier.desc) bits.push(tier.desc);
    var link = '';
    if (p.w) link = '<a href="http://' + esc(p.w.replace(/^https?:\/\//, '')) + '" target="_top" rel="noopener">官网 ↗</a>';
    el.dtDesc.innerHTML = bits.join('；') + '。' + (link ? ' ' + link : '（源数据未提供官网）');

    el.dtFooter.innerHTML = '<span>重要性 scalerank：' + p.r + '</span>' +
      (p.c && p.c !== '—' ? '<span>国家：' + esc(p.cn) + '</span>' : '<span>离岸/无归属</span>');

    renderRank();
    setLabels();
    app.pulse({ glowId: 'port-glow', selId: 'port-sel', baseWidth: 12, maxExtra: 8, duration: 1500 });
    if (move) {
      app.map.easeTo({ center: f.geometry.coordinates, zoom: Math.max(app.map.getZoom(), 5), duration: 720 });
    }
  }

  function clearPortSel() {
    S.selPort = null;
    app.map.getSource('sel').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('port-glow', 'visibility', 'none');
    app.map.setLayoutProperty('port-sel', 'visibility', 'none');
  }

  /* ── 选中国家 ─────────────────────────────────────────────── */
  function selectCountry(key, move) {
    var c = S.byCountry[key];
    if (!c) return;
    S.selCountry = key;
    clearPortSel();

    var pts = S.view.filter(function (f) { return f.properties.c === key; });
    if (pts.length) {
      app.map.getSource('sel').setData({ type: 'FeatureCollection', features: pts });
      app.map.setLayoutProperty('port-glow', 'visibility', 'visible');
      app.map.setLayoutProperty('port-sel', 'visibility', 'visible');
    } else {
      app.map.getSource('sel').setData(Thematic.EMPTY);
      app.map.setLayoutProperty('port-glow', 'visibility', 'none');
      app.map.setLayoutProperty('port-sel', 'visibility', 'none');
    }

    var col = '#2dd4bf';
    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', col);
    el.dtRole.textContent = 'COUNTRY';
    el.dtName.textContent = c.cn;
    el.dtSub.textContent = (S.tierMax < 8 || S.q ? '筛选后 ' : '') + c.n + ' 个主要港口 · 其中枢纽 ' + c.hubs + ' 个';

    el.dtLb1.textContent = '港口数'; el.dtV1.textContent = c.n; el.dtU1.textContent = '个';
    el.dtLb2.textContent = '枢纽数'; el.dtV2.textContent = c.hubs; el.dtU2.textContent = '个';
    el.dtLb3.textContent = '各档分布'; el.dtV3.textContent = c.tc.map(function (n, i) { return CFG.TIERS[i].label[0] + n; }).join(' '); el.dtU3.textContent = '';

    el.dtDescLb.textContent = '说明';
    el.dtDesc.textContent = '「港口数」是 Natural Earth 在本国境内的主要港口计数（含筛选），「枢纽数」为其中 scalerank ≤ 4 的顶级/主要枢纽。港口定位采用港口数加权重心（落在本国港口凸包内，非首府）。';

    el.dtFooter.innerHTML = '<span>国家：' + esc(c.cn) + '</span>' +
      (c.cxy ? '<span>重心：' + fmtCoord(c.cxy[1], c.cxy[0]) + '</span>' : '');

    renderRank();
    setLabels();
    if (move && c.cxy) {
      app.map.easeTo({ center: c.cxy, zoom: Math.max(app.map.getZoom(), 4), duration: 760 });
    }
  }

  function clearSel() {
    S.selCountry = null;
    clearPortSel();
    app.setDetailOpen(false);
    el.detail.hidden = true;
    renderRank();
    setLabels();
  }

  /* ── 交互 ─────────────────────────────────────────────────── */
  function bind() {
    app.map.on('mousemove', function (e) {
      var p = pickNearest(e.point, 5);
      if (p) {
        var pr = p.properties;
        app.map.getCanvas().style.cursor = 'pointer';
        app.tooltip('<b>' + esc(pr.n || ('# ' + pr.id)) + '</b> <span style="color:' + (pr.color || tierColor(pr.r)) + '">' +
          esc(tierLabel(pr.r)) + '</span><br><span style="color:#9fb4cd">' +
          esc(pr.cn || '离岸/无归属') + (pr.ns != null ? ' · 1:' + fmt(pr.ns, 0) + 'M' : '') + '</span>',
          e.point.x, e.point.y);
        return;
      }
      app.map.getCanvas().style.cursor = '';
      app.tooltip(null);
    });
    app.map.on('mouseleave', function () { app.tooltip(null); });

    app.map.on('click', function (e) {
      var p = pickNearest(e.point, 5);
      if (p) { app.collapseDrawer(); selectPort(p, true); return; }
      clearSel();
    });

    el.chipTier.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.tierMax = parseInt(b.dataset.v, 10) || 8;
      applyFilter();
    });

    el.q.addEventListener('input', function () {
      S.q = (this.value || '').trim().toLowerCase();
      applyFilter();
    });
    el.qClear.addEventListener('click', function () {
      el.q.value = ''; S.q = '';
      applyFilter();
      el.q.focus();
    });
  }

  /* ── UI 同步 ──────────────────────────────────────────────── */
  function syncUI() {
    Array.prototype.forEach.call(el.chipTier.children, function (b) {
      b.classList.toggle('active', (parseInt(b.dataset.v, 10) || 8) === S.tierMax);
    });
    var n = S.view.length;
    el.tierN.textContent = fmt(n, 0) + ' 个';
    el.tierNote.textContent = S.tierMax >= 8
      ? '显示全部 ' + fmt(n, 0) + ' 个港口。scalerank 越小越重要：3 是顶级枢纽港，8 是小型港口。点上方按钮只看前几档。'
      : '只显示 scalerank ≤ ' + S.tierMax + ' 的港口，共 ' + fmt(n, 0) + ' 个——地图上立刻只剩更重要的港。';

    if (S.q) {
      el.qN.textContent = '命中 ' + fmt(n, 0);
    } else {
      el.qN.textContent = '';
    }
  }

  /* ── 启动 ─────────────────────────────────────────────────── */
  function boot() {
    Promise.all([
      fetch(DATA.ports).then(function (r) { return r.json(); }),
      fetch(DATA.countries).then(function (r) { return r.json(); }),
      fetch(DATA.stats).then(function (r) { return r.json(); })
    ]).then(function (res) {
      var ports = res[0], countries = res[1], stats = res[2];

      S.all = ports.features;
      S.countries = countries.countries;
      S.stats = stats;
      S.countries.forEach(function (c) { S.byCountry[c.c] = c; });

      el.fPort.textContent = fmt(stats.nPort, 0);
      el.fCountry.textContent = stats.nCountry;
      el.fWeb.textContent = stats.website;
      el.fHub.textContent = stats.tierCounts[0];

      renderLegend();
      bind();
      applyFilter();
      app.fitAll({ animate: false });
      setLabels();
      window.__portsDebug = { ready: true, n: S.all.length };
    }).catch(function (err) {
      console.error('[world-ports] 数据加载失败', err);
      el.rankList.innerHTML = '<p class="note" style="margin:0">数据加载失败，请刷新重试。</p>';
    });
  }
})();
