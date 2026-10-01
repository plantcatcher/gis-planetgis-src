/* 全国房价时空可视化 —— 互动逻辑
   数据：国家统计局 70 城住宅价格指数（2006-01 起，月度）
   引擎：_shared/thematic

   两个粒度：
     province —— 31 个省级行政区（由省内被监测城市聚合）
     city     —— 70 个被监测城市（有真实边界）
   两个口径 × 两个指标：新建商品住宅 / 二手住宅 × 同比 / 环比 */
(function () {
  'use strict';

  var CFG = window.HOUSE_PRICE_CONFIG;
  var fmt = Thematic.fmt, esc = Thematic.esc;

  var DATA = {
    months: 'data/months.json',
    cities: 'data/cities.json',
    provinces: 'data/provinces.json',
    cityGeo: 'data/cities-geo.json'
  };

  var S = {
    meta: null,
    months: [],
    cities: [],
    provinces: [],
    cityByAd: {},
    provByAd: {},
    kind: 'new',        // new | sh
    cal: 'yoy',         // yoy | mom
    level: 'province',  // province | city
    idx: 0,             // 当前月份索引
    sel: null,          // 选中的 adcode
    playing: false,
    timer: 0
  };

  var el = {
    tbRange: document.getElementById('tbRange'),
    tbTicks: document.getElementById('tbTicks'),
    tbYear: document.getElementById('tbYear'),
    tbMonths: document.getElementById('tbMonths'),
    tbPlay: document.getElementById('tbPlay'),
    tbMile: document.getElementById('tbMilestone'),
    segKind: document.getElementById('segKind'),
    segCal: document.getElementById('segCal'),
    rankList: document.getElementById('rankList'),
    rankTitle: document.getElementById('rankTitle'),
    rankNote: document.getElementById('rankNote'),
    strip: document.getElementById('strip'),
    legend: document.getElementById('legend'),
    fMonths: document.getElementById('fMonths'),
    fCities: document.getElementById('fCities'),
    fCur: document.getElementById('fCur'),
    detail: document.getElementById('detail'),
    dtRole: document.getElementById('dtRole'),
    dtName: document.getElementById('dtName'),
    dtSub: document.getElementById('dtSub'),
    dtLb1: document.getElementById('dtLb1'),
    dtLb2: document.getElementById('dtLb2'),
    dtLb3: document.getElementById('dtLb3'),
    dtV1: document.getElementById('dtV1'),
    dtV2: document.getElementById('dtV2'),
    dtV3: document.getElementById('dtV3'),
    dtSpark: document.getElementById('dtSpark'),
    dtFooter: document.getElementById('dtFooter')
  };

  /* ── 色阶 ─────────────────────────────────────────────── */
  /* 当前口径对应的色阶（同比与环比量级不同，分档不同） */
  function scale() { return CFG.scaleOf[S.cal]; }

  function colorOf(v) {
    if (v == null || !isFinite(v)) return CFG.noData;
    var dev = v - 100, sc = scale(), i;
    for (i = 0; i < sc.length; i++) if (dev <= sc[i].v) return sc[i].c;
    return sc[sc.length - 1].c;
  }

  /* 当前月份某个 adcode 的值 */
  function valueOf(o) {
    if (!o) return null;
    var arr = o[S.kind][S.cal];
    var v = arr ? arr[S.idx] : null;
    return (v === undefined || v === null) ? null : v;
  }

  /* 把值写进要素 properties，供 MapLibre 表达式着色 */
  function paintData(features, lookup) {
    features.forEach(function (f) {
      var ad = String(f.properties.adcode);
      var o = lookup[ad];
      var v = valueOf(o);
      f.properties.v = v == null ? -9999 : v;
      f.properties.hasVal = v == null ? 0 : 1;
      f.properties.base = S.level === 'city' ? 110000 : 110000;
    });
    return features;
  }

  /* 统一着色表达式：无数据 → 深色底；有数据 → 阶梯色 */
  /* ⚠️ case 从上往下取第一个命中的分支。必须按档位上界**升序**排列，
     让最紧的一档先被判断到；反过来（从大到小）会让第一个分支
     （上界 1e9）吞掉所有值，地图变成一整块最深色。 */
  function fillColorExpr() {
    var expr = ['case', ['==', ['get', 'hasVal'], 0], CFG.noData];
    var sc = scale().slice().sort(function (a, b) { return a.v - b.v; });
    sc.forEach(function (s) {
      expr.push(['<=', ['get', 'v'], 100 + s.v], s.c);
    });
    expr.push(sc[sc.length - 1].c);
    return expr;
  }

  /* ── 地图 ─────────────────────────────────────────────── */
  var app = Thematic.create({
    slug: 'house-price',
    view: CFG.view,
    bounds: CFG.bounds,
    extent: [72, 16, 138, 56],
    graticuleStep: 5,
    province: { fill: true, line: true },
    sources: {
      prov: { data: '/maps/_shared/china-provinces.json' },
      city: { data: DATA.cityGeo, promoteId: 'adcode' },
      sel: { data: Thematic.EMPTY }
    },
    layers: [
      /* 省级填充（省级视角启用） */
      { id: 'hp-prov', type: 'fill', source: 'prov',
        layout: { visibility: 'none' },
        paint: { 'fill-color': '#1a2436', 'fill-opacity': 0.72 } },
      /* 市级填充（市级视角启用） */
      { id: 'hp-city', type: 'fill', source: 'city',
        layout: { visibility: 'none' },
        paint: { 'fill-color': '#1a2436', 'fill-opacity': 0.78 } },
      /* 市级边界线 */
      { id: 'hp-city-line', type: 'line', source: 'city',
        layout: { visibility: 'none', 'line-join': 'round' },
        paint: { 'line-color': '#8fa3bd', 'line-width': 0.6, 'line-opacity': 0.5 } },
      /* 选中高亮 */
      { id: 'hp-glow', type: 'line', source: 'sel',
        layout: { 'line-join': 'round', visibility: 'none' },
        paint: { 'line-color': '#ffffff', 'line-width': 12, 'line-opacity': 0, 'line-blur': 7 } },
      { id: 'hp-sel', type: 'line', source: 'sel',
        layout: { 'line-join': 'round', visibility: 'none' },
        paint: { 'line-color': '#ffffff', 'line-width': 2.4, 'line-opacity': 0.92 } }
    ],
    onReady: boot,
    onOverview: function () { clearSel(); app.fitAll({ animate: true }); },
    onClose: function () { clearSel(); }
  });

  /* ── 时间轴 ──────────────────────────────────────────── */
  function buildTicks() {
    var n = S.months.length, html = '';
    for (var i = 0; i < n; i++) {
      var m = S.months[i];
      if (m.m !== 1) continue;
      var pct = n > 1 ? i / (n - 1) * 100 : 0;
      var major = m.y % 5 === 0;
      html += '<b class="' + (major ? 'is-major' : '') + '" style="left:' + pct.toFixed(3) + '%">' + m.y + '</b>';
    }
    el.tbTicks.innerHTML = html;
    el.tbYear.textContent = S.months[S.idx].y;
  }

  function setIndex(i, opts) {
    opts = opts || {};
    i = Math.max(0, Math.min(S.months.length - 1, i));
    if (i === S.idx && !opts.force) return;
    S.idx = i;
    el.tbRange.value = i;
    var m = S.months[i];
    el.tbYear.textContent = m.y + '-' + String(m.m).padStart(2, '0');
    el.fCur.textContent = m.key;

    // 史实注解：命中当前月或之前最近的一个
    var hit = null;
    for (var k = 0; k < CFG.milestones.length; k++) {
      if (CFG.milestones[k].key === m.key) { hit = CFG.milestones[k]; break; }
    }
    el.tbMile.innerHTML = hit
      ? '<b>' + esc(hit.key) + ' · ' + esc(hit.title) + '</b> ' + esc(hit.text)
      : esc(CFG.hint);

    applyColors();
    renderRank();
    renderDetail();
    setLabels();
  }

  function bindTimeline() {
    el.tbRange.addEventListener('input', function () {
      stopPlay();
      setIndex(Number(this.value));
    });
    Array.prototype.forEach.call(document.querySelectorAll('.tb-ctl [data-step]'), function (b) {
      b.addEventListener('click', function () {
        stopPlay();
        setIndex(S.idx + Number(this.dataset.step));
      });
    });
    el.tbPlay.addEventListener('click', function () { S.playing ? stopPlay() : startPlay(); });
    // 键盘：左右方向键逐月
    document.addEventListener('keydown', function (e) {
      if (e.target && e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft') { stopPlay(); setIndex(S.idx - 1); }
      if (e.key === 'ArrowRight') { stopPlay(); setIndex(S.idx + 1); }
    });
  }

  function startPlay() {
    S.playing = true;
    el.tbPlay.classList.add('is-playing');
    el.tbPlay.textContent = '❚❚ 暂停';
    S.timer = setInterval(function () {
      if (S.idx >= S.months.length - 1) { stopPlay(); return; }
      setIndex(S.idx + 1, { force: true });
    }, 260);
  }
  function stopPlay() {
    S.playing = false;
    if (S.timer) clearInterval(S.timer);
    S.timer = 0;
    el.tbPlay.classList.remove('is-playing');
    el.tbPlay.textContent = '▶ 播放';
  }

  /* ── 着色 ─────────────────────────────────────────────── */
  function applyColors() {
    var expr = fillColorExpr();
    var isCity = S.level === 'city';

    // 数据写入两个 source 的属性（各自只在本视角可见，但都刷一遍保证切换即时生效）
    var provSrc = app.map.getSource('prov');
    if (provSrc) {
      fetch('/maps/_shared/china-provinces.json').then(function (r) { return r.json(); }).then(function (fc) {
        paintData(fc.features, S.provByAd);
        provSrc.setData(fc);
      });
    }
    var citySrc = app.map.getSource('city');
    if (citySrc) {
      fetch(DATA.cityGeo).then(function (r) { return r.json(); }).then(function (fc) {
        paintData(fc.features, S.cityByAd);
        citySrc.setData(fc);
      });
    }

    app.map.setPaintProperty('hp-prov', 'fill-color', expr);
    app.map.setPaintProperty('hp-city', 'fill-color', expr);
    app.setVisible('hp-prov', !isCity);
    app.setVisible('hp-city', isCity);
    app.setVisible('hp-city-line', isCity);
    // 省级视角：省界即边界；市级视角下省界仍在（作为上层参照，压隐一些）
    if (app.map.getLayer('prov-line')) {
      app.map.setPaintProperty('prov-line', 'line-width', isCity ? 0.9 : 0.7);
      app.map.setPaintProperty('prov-line', 'line-opacity', isCity ? 0.42 : 0.3);
    }
    if (app.map.getLayer('prov-fill')) app.setVisible('prov-fill', false);
  }

  /* ── 排行 ─────────────────────────────────────────────── */
  function currentList() {
    return S.level === 'city' ? S.cities : S.provinces;
  }

  function renderRank() {
    var list = currentList().slice();
    var rows = [];
    list.forEach(function (o) {
      var v = valueOf(o);
      if (v == null) return;
      rows.push({ o: o, v: v });
    });
    rows.sort(function (a, b) { return b.v - a.v; });

    var up = rows.filter(function (r) { return r.v > 100; }).length;
    var down = rows.filter(function (r) { return r.v < 100; }).length;
    var flat = rows.length - up - down;

    el.rankTitle.textContent = (S.cal === 'yoy' ? '同比' : '环比') +
      (S.kind === 'new' ? ' · 新房' : ' · 二手') + ' 排行';
    el.rankNote.textContent = '共 ' + rows.length + ' 个' +
      (S.level === 'city' ? '城市' : '省份') + '：上涨 ' + up + ' · 持平 ' + flat + ' · 下跌 ' + down +
      '（' + S.months[S.idx].key + '）';

    // 只显示头尾，中间省略——避免 70 行把侧栏撑爆
    var show = rows.length > 14
      ? rows.slice(0, 7).concat([null]).concat(rows.slice(-7))
      : rows;
    var maxAbs = Math.max.apply(null, rows.map(function (r) { return Math.abs(r.v - 100); }).concat([1]));

    el.rankList.innerHTML = show.map(function (r) {
      if (!r) return '<div class="rank-gap">⋯</div>';
      var dev = r.v - 100;
      var w = Math.min(100, Math.abs(dev) / maxAbs * 100);
      var cls = dev > 0.05 ? 'up' : (dev < -0.05 ? 'down' : '');
      var ad = String(r.o.adcode);
      return '<button type="button" class="chart-row' + (S.sel === ad ? ' active' : '') +
        '" data-ad="' + ad + '">' +
        '<span class="nm">' + esc(r.o.name.replace(/省|市|自治区|维吾尔|壮族|回族|特别行政区/g, '')) + '</span>' +
        '<span class="bar"><i style="width:' + w.toFixed(1) + '%;background:' + colorOf(r.v) + '"></i></span>' +
        '<span class="vl ' + cls + '">' + (dev > 0 ? '+' : '') + dev.toFixed(1) + '</span>' +
        '</button>';
    }).join('');

    el.rankList.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      app.collapseDrawer();
      selectBy(String(b.dataset.ad), true);
    };
  }

  /* ── 标注 ─────────────────────────────────────────────── */
  function setLabels() {
    var items = [];
    if (S.level === 'city') {
      // 市级：只标有数据的城市，按当前值着色
      S.cities.forEach(function (c) {
        var v = valueOf(c);
        if (v == null) return;
        items.push({
          text: c.name, lng: c.lng, lat: c.lat,
          color: colorOf(v), kind: 'dot', active: S.sel === String(c.adcode)
        });
      });
    } else {
      // 省级：只标出极值省份，避免全国 31 个标签糊成一片
      var rows = [];
      S.provinces.forEach(function (p) {
        var v = valueOf(p);
        if (v == null) return;
        rows.push({ p: p, v: v });
      });
      rows.sort(function (a, b) { return b.v - a.v; });
      var pick = rows.slice(0, 3).concat(rows.slice(-3));
      var provBounds = window.__provCenter || {};
      pick.forEach(function (r) {
        var c = provBounds[String(r.p.adcode)];
        if (!c) return;
        items.push({
          text: r.p.name.replace(/省|市|自治区|维吾尔|壮族|回族/g, '') + ' ' +
            (r.v - 100 > 0 ? '+' : '') + (r.v - 100).toFixed(1),
          lng: c[0], lat: c[1],
          color: colorOf(r.v), kind: 'tag', active: S.sel === String(r.p.adcode)
        });
      });
    }
    app.setLabels(items);
  }

  /* 从省界数据里取省级标注锚点（只取一次，优先用 centroid） */
  function loadProvCenters() {
    fetch('/maps/_shared/china-provinces.json')
      .then(function (r) { return r.json(); })
      .then(function (fc) {
        var m = {};
        fc.features.forEach(function (f) {
          var p = f.properties;
          if (p.level !== 'province') return;
          m[String(p.adcode)] = p.centroid || p.center;
        });
        window.__provCenter = m;
        setLabels();
      }).catch(function () {});
  }

  /* ── 选中与详情 ───────────────────────────────────────── */
  function boundsOfAdcode(ad) {
    // 省界数据里查（省级），或市级边界里查（市级）
    if (S.level === 'province') {
      var f = (window.__provGeo || []).filter(function (x) { return String(x.properties.adcode) === ad; })[0];
      return f ? Thematic.bboxOf(f.geometry) : null;
    }
    var g = (window.__cityGeo || []).filter(function (x) { return String(x.properties.adcode) === ad; })[0];
    return g ? Thematic.bboxOf(g.geometry) : null;
  }

  function outlineOf(f) {
    var feats = [];
    var g = f.geometry;
    var polys = g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates];
    var areas = polys.map(function (poly) {
      var ring = poly[0], a = 0, i;
      for (i = 0; i < ring.length - 1; i++) a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
      return Math.abs(a / 2);
    });
    var maxA = Math.max.apply(null, areas);
    polys.forEach(function (poly, i) {
      if (areas[i] < maxA * 0.015) return;
      poly.forEach(function (ring, k) {
        if (k > 0) return;
        feats.push({ type: 'Feature', properties: f.properties,
          geometry: { type: 'LineString', coordinates: ring } });
      });
    });
    return { type: 'FeatureCollection', features: feats };
  }

  function findFeature(ad) {
    var arr = S.level === 'province' ? (window.__provGeo || []) : (window.__cityGeo || []);
    for (var i = 0; i < arr.length; i++) {
      if (String(arr[i].properties.adcode) === ad) return arr[i];
    }
    return null;
  }

  function selectBy(ad, move) {
    var obj = (S.level === 'province' ? S.provByAd : S.cityByAd)[ad];
    if (!obj) return;
    S.sel = ad;
    var f = findFeature(ad);
    if (f) {
      var o = outlineOf(f);
      app.map.getSource('sel').setData(o);
      app.map.setLayoutProperty('hp-glow', 'visibility', 'visible');
      app.map.setLayoutProperty('hp-sel', 'visibility', 'visible');
      if (move) {
        var b = Thematic.padBbox(Thematic.bboxOf(f.geometry), S.level === 'city' ? 1.4 : 0.5);
        app.fitBounds(b, { animate: true, maxZoom: S.level === 'city' ? 7.5 : 6, withDetail: true, duration: 720 });
      }
    }
    app.pulse({ glowId: 'hp-glow', selId: 'hp-sel', baseWidth: 11, maxExtra: 8, duration: 1500 });
    renderDetail();
    renderRank();
    setLabels();
  }

  function clearSel() {
    S.sel = null;
    app.stopFx();
    app.map.getSource('sel').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('hp-glow', 'visibility', 'none');
    app.map.setLayoutProperty('hp-sel', 'visibility', 'none');
    renderDetail();
    renderRank();
    setLabels();
  }

  function devClass(v) {
    if (v == null) return '';
    return v > 100.05 ? 'up' : (v < 99.95 ? 'down' : '');
  }

  function renderDetail() {
    var ad = S.sel;
    if (!ad) { app.setDetailOpen(false); el.detail.hidden = true; return; }
    var obj = (S.level === 'province' ? S.provByAd : S.cityByAd)[ad];
    if (!obj) { app.setDetailOpen(false); el.detail.hidden = true; return; }

    app.setDetailOpen(true);
    el.detail.hidden = false;

    var isCity = S.level === 'city';
    el.dtRole.textContent = isCity ? 'MONITORED CITY' : 'PROVINCE (AVG)';
    el.dtName.textContent = obj.name;
    el.dtSub.textContent = isCity
      ? (obj.prov || '') + ' · 国家统计局 70 城监测口径'
      : '含 ' + obj.cityCount + ' 个监测城市' + (obj.cityCount ? '：' + obj.cities.join('、') : '（无监测城市）');

    var v1 = valueOf(obj);
    var v2 = obj[S.kind][S.cal === 'yoy' ? 'mom' : 'yoy'][S.idx];
    var series = obj[S.kind][S.cal];

    // 峰值（同口径全序列的最大值）及其出现时间
    var peak = null, peakIdx = -1;
    for (var i = 0; i < series.length; i++) {
      var x = series[i];
      if (x == null) continue;
      if (peak === null || x > peak) { peak = x; peakIdx = i; }
    }
    var vsPeak = (v1 != null && peak != null) ? v1 - peak : null;

    el.dtLb1.textContent = (S.cal === 'yoy' ? '同比' : '环比') + '指数';
    el.dtLb2.textContent = (S.cal === 'yoy' ? '环比' : '同比') + '指数';
    el.dtLb3.textContent = '较历史峰值';

    setMetric(el.dtV1, v1 == null ? '—' : (v1 - 100 > 0 ? '+' : '') + (v1 - 100).toFixed(1) + '%', devClass(v1));
    setMetric(el.dtV2, v2 == null ? '—' : (v2 - 100 > 0 ? '+' : '') + (v2 - 100).toFixed(1) + '%', devClass(v2));
    setMetric(el.dtV3, vsPeak == null ? '—' : (vsPeak > 0 ? '+' : '') + vsPeak.toFixed(1) + ' pt', devClass(vsPeak + 100));

    el.detail.style.setProperty('--rc', colorOf(v1));
    renderSpark(series);
    el.dtFooter.innerHTML = '<span>峰值 ' + (peak == null ? '—' : peak.toFixed(1)) +
      (peakIdx >= 0 ? '（' + S.months[peakIdx].key + '）' : '') + '</span>' +
      '<span style="flex-basis:100%;color:#b9c8dc">当前 ' + S.months[S.idx].key +
      ' · ' + (S.kind === 'new' ? '新建商品住宅' : '二手住宅') + '</span>';
  }

  function setMetric(node, text, cls) {
    node.textContent = text;
    node.parentNode.parentNode.className = '';
    node.className = cls || '';
  }

  /* 近 60 个月走势小图 */
  function renderSpark(series) {
    var n = series.length;
    var from = Math.max(0, n - 60);
    var pts = [];
    for (var i = from; i < n; i++) {
      var v = series[i];
      if (v != null) pts.push([i, v]);
    }
    if (pts.length < 2) { el.dtSpark.innerHTML = '<p style="font-size:11px;color:#64748b;margin:4px 0 0">暂无走势数据</p>'; return; }
    var W = 300, H = 46, PAD = 4;
    var vs = pts.map(function (p) { return p[1]; });
    var lo = Math.min.apply(null, vs), hi = Math.max.apply(null, vs);
    lo = Math.min(lo, 99.4); hi = Math.max(hi, 100.6);
    var x0 = pts[0][0], x1 = pts[pts.length - 1][0];
    var sx = function (i) { return PAD + (i - x0) / Math.max(1, x1 - x0) * (W - PAD * 2); };
    var sy = function (v) { return PAD + (hi - v) / Math.max(0.001, hi - lo) * (H - PAD * 2); };
    var d = pts.map(function (p, k) { return (k ? 'L' : 'M') + sx(p[0]).toFixed(1) + ' ' + sy(p[1]).toFixed(1); }).join(' ');
    var last = pts[pts.length - 1][1];
    var col = last >= 100 ? '#ff8f7a' : '#6fd6a4';
    var y100 = sy(100).toFixed(1);
    el.dtSpark.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' +
      '<line class="axis" x1="0" y1="' + y100 + '" x2="' + W + '" y2="' + y100 + '"/>' +
      '<text class="zero" x="2" y="' + (Number(y100) - 2) + '">100</text>' +
      '<path class="ln" d="' + d + '" stroke="' + col + '"/></svg>';
  }

  /* ── 粒度切换 ─────────────────────────────────────────── */
  function setLevel(lv, move) {
    if (lv === S.level) return;
    S.level = lv;
    clearSel();
    applyColors();
    renderStrip();
    renderRank();
    setLabels();
    if (move !== false) app.fitAll({ animate: true });
  }

  function renderStrip() {
    var items = [
      { v: 'province', n: '省级视角', s: '31 个省级区' },
      { v: 'city', n: '市级视角', s: '70 个监测城市' }
    ];
    el.strip.innerHTML = items.map(function (it) {
      return '<button type="button" data-v="' + it.v + '" class="' + (S.level === it.v ? 'active' : '') + '">' +
        '<i></i><span><b>' + it.n + '</b><small>' + it.s + '</small></span></button>';
    }).join('');
    el.strip.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      app.collapseDrawer();
      setLevel(b.dataset.v, true);
    };
  }

  function renderLegend() {
    var sc = scale().slice().reverse();
    el.legend.innerHTML = '<div class="ramp"><div class="ramp-cap">' +
      (S.cal === 'yoy' ? '同比' : '环比') + '指数偏离 100（= 持平）</div>' +
      sc.map(function (s) {
        return '<div class="ramp-row"><i style="background:' + s.c + '"></i><span>' + esc(s.t) + '</span></div>';
      }).join('') + '</div>';
  }

  /* ── 交互 ─────────────────────────────────────────────── */
  function bind() {
    var layerId = function () { return S.level === 'city' ? ['hp-city'] : ['hp-prov']; };

    app.map.on('mousemove', function (e) {
      var f = app.pick(e.point, layerId(), 0);
      if (f) {
        var ad = String(f.properties.adcode);
        var o = (S.level === 'province' ? S.provByAd : S.cityByAd)[ad];
        var v = valueOf(o);
        app.map.getCanvas().style.cursor = 'pointer';
        app.tooltip('<b>' + esc(o ? o.name : f.properties.name) + '</b> <span style="color:' +
          colorOf(v) + '">' + (v == null ? '无数据' :
          (v - 100 > 0 ? '+' : '') + (v - 100).toFixed(1) + '%') + '</span>',
          e.point.x, e.point.y);
      } else {
        app.map.getCanvas().style.cursor = '';
        app.tooltip(null);
      }
    });
    app.map.on('mouseleave', function () { app.tooltip(null); });
    app.map.on('click', function (e) {
      var f = app.pick(e.point, layerId());
      if (f) { app.collapseDrawer(); selectBy(String(f.properties.adcode), true); }
      else clearSel();
    });

    el.segKind.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.kind = b.dataset.v;
      syncSeg();
      applyColors(); renderRank(); renderDetail(); setLabels();
    };
    el.segCal.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.cal = b.dataset.v;
      syncSeg();
      renderLegend();
      applyColors(); renderRank(); renderDetail(); setLabels();
    };
  }

  function syncSeg() {
    Array.prototype.forEach.call(el.segKind.children, function (b) {
      b.classList.toggle('active', b.dataset.v === S.kind);
    });
    Array.prototype.forEach.call(el.segCal.children, function (b) {
      b.classList.toggle('active', b.dataset.v === S.cal);
    });
  }

  /* ── 启动 ─────────────────────────────────────────────── */
  function boot() {
    var dbg = window.__hpDebug = { fetches: {}, startedAt: Date.now() };
    function tracked(url) {
      dbg.fetches[url] = 'pending';
      return fetch(url).then(function (r) {
        dbg.fetches[url] = r.ok ? 'ok ' + r.status : 'HTTP ' + r.status;
        if (!r.ok) throw new Error(url + ' -> HTTP ' + r.status);
        return r.json();
      }).catch(function (e) {
        dbg.fetches[url] = 'FAIL ' + String(e).slice(0, 80);
        throw e;
      });
    }
    Promise.all([
      tracked(DATA.months),
      tracked(DATA.cities),
      tracked(DATA.provinces),
      tracked(DATA.cityGeo),
      tracked('/maps/_shared/china-provinces.json')
    ]).then(function (res) {
      var meta = res[0], cities = res[1].cities, provs = res[2].provinces;
      var cityGeo = res[3], provGeo = res[4];

      S.meta = meta;
      S.months = meta.months;
      S.cities = cities;
      S.provinces = provs;
      window.__cityGeo = cityGeo.features;
      window.__provGeo = provGeo.features.filter(function (f) {
        return f.properties.level === 'province';
      });

      cities.forEach(function (c) { S.cityByAd[String(c.adcode)] = c; });
      provs.forEach(function (p) { S.provByAd[String(p.adcode)] = p; });

      // 省级锚点（标注用）
      var cm = {};
      window.__provGeo.forEach(function (f) {
        var p = f.properties;
        cm[String(p.adcode)] = p.centroid || p.center;
      });
      window.__provCenter = cm;

      el.fMonths.textContent = meta.monthCount;
      el.fCities.textContent = meta.cityCount;
      el.tbRange.max = S.months.length - 1;
      S.idx = S.months.length - 1;   // 默认落在最新月份
      el.tbRange.value = S.idx;

      buildTicks();
      renderLegend();
      renderStrip();
      syncSeg();
      bind();
      bindTimeline();
      setIndex(S.idx, { force: true });
      app.fitAll({ animate: false });
      dbg.bootDone = true;
      dbg.ms = Date.now() - dbg.startedAt;
    }).catch(function (err) {
      console.error('[house-price] 数据加载失败', err);
      dbg.bootError = String(err);
      el.rankList.innerHTML = '<p class="note">数据加载失败，请刷新重试。</p>';
    });
  }
})();
