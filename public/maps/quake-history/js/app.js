/* 全球历史地震目录地图 · 运行时
   依赖：/maps/_shared/thematic/thematic.js（MapLibre 引擎封装）
   数据：data/catalog.json（USGS ComCat 1900–2026 M6+ 静态矢量）+ data/plates.json（PB2002 板块边界）
   逻辑：一次性载入本地矢量 → 用 MapLibre filter 控制「年份 + 震级」两个维度，不重建数据。 */
(function () {
  'use strict';

  var C = window.QH_CONFIG;
  var app = null;

  /* D：数据；state：交互状态 */
  var D = { feats: [], places: [], years: [], meta: null, big: [] };
  var state = {
    year: 2026, mode: 'cum', floor: 6,
    playing: false, timer: null,
    glow: true, nowHi: true, plates: true
  };

  /* ── 工具 ───────────────────────────────────────────────── */
  function bandOf(m) {
    var arr = C.magBands;
    for (var i = 0; i < arr.length; i++) if (m >= arr[i].min) return arr[i];
    return arr[arr.length - 1];
  }
  function magColor(m) { return bandOf(m).color; }
  function r1(n) { return Math.round(n * 10) / 10; }

  function yStart(y) { return Date.UTC(y, 0, 1); }
  function yEnd(y) { return Date.UTC(y + 1, 0, 1) - 1; }
  function yOf(ms) { return new Date(ms).getUTCFullYear(); }

  function fmtUTC(ms, withTime) {
    var d = new Date(ms);
    function p(n) { return (n < 10 ? '0' : '') + n; }
    var s = d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate());
    if (withTime) s += ' ' + p(d.getUTCHours()) + ':' + p(d.getUTCMinutes());
    return s;
  }
  function setTxt(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
  function nf(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ── 载入数据 ───────────────────────────────────────────── */
  function loadData() {
    return Promise.all([
      fetch(C.data.catalog).then(function (r) { return r.json(); }),
      fetch(C.data.plates).then(function (r) { return r.json(); }).catch(function () { return null; }),
      fetch(C.data.land).then(function (r) { return r.json(); }).catch(function () { return null; })
    ]).then(function (res) {
      var cat = res[0], pl = res[1], ld = res[2];
      D.meta = cat.meta;
      D.places = cat.places;
      D.years = cat.years;

      var places = cat.places;
      var rows = cat.rows;
      var feats = new Array(rows.length);
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        feats[i] = {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [r[0], r[1]] },
          properties: { mag: r[2], t: r[3], d: r[4], p: places[r[5]] || '', ts: r[6], id: r[7] }
        };
      }
      D.feats = feats;

      /* 巨震档案：M8+ 按震级降序 */
      var big = feats.filter(function (f) { return f.properties.mag >= C.bigMag; });
      big.sort(function (a, b) { return b.properties.mag - a.properties.mag || a.properties.t - b.properties.t; });
      D.big = big;

      state.year = D.meta.yearMax;

      var qs = app.map.getSource('quakes');
      qs.setData({ type: 'FeatureCollection', features: feats });

      if (pl && app.map.getSource('plates')) {
        app.map.getSource('plates').setData({
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: {}, geometry: { type: 'MultiLineString', coordinates: pl.lines } }]
        });
      }

      if (ld && app.map.getSource('land')) {
        app.map.getSource('land').setData({
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: ld.polys } }]
        });
      }

      buildBars();
      renderBigList();
      apply();
    }).catch(function (err) {
      setTxt('fCount', '加载失败');
      if (window.console) console.error('[quake-history]', err);
    });
  }

  /* ── 过滤表达式 ─────────────────────────────────────────── */
  var EMPTY = ['==', ['get', 'mag'], -999];

  function fBase() { return ['>=', ['get', 'mag'], state.floor]; }

  function filterPast() {
    var a = ['all', fBase()];
    if (state.mode === 'cum') a.push(['<=', ['get', 't'], yEnd(state.year)]);
    else a.push(['>=', ['get', 't'], yStart(state.year)], ['<=', ['get', 't'], yEnd(state.year)]);
    return a;
  }
  function filterNow() {
    if (state.mode !== 'cum' || !state.nowHi) return EMPTY;
    return ['all', fBase(),
      ['>=', ['get', 't'], yStart(state.year)],
      ['<=', ['get', 't'], yEnd(state.year)]];
  }

  /* ── 主刷新 ─────────────────────────────────────────────── */
  function apply() {
    var map = app && app.map;
    if (!map) return;

    if (map.getLayer('quake-glow')) map.setFilter('quake-glow', filterPast());
    map.setFilter('quake-past', filterPast());
    if (map.getLayer('quake-now')) map.setFilter('quake-now', filterNow());

    /* 统计（一次遍历，14542 条） */
    var n = 0, mx = 0, t0 = yStart(state.year), t1 = yEnd(state.year);
    var feats = D.feats, floor = state.floor, cum = state.mode === 'cum';
    for (var i = 0; i < feats.length; i++) {
      var p = feats[i].properties;
      if (p.mag < floor) continue;
      if (cum) { if (p.t > t1) continue; }
      else if (p.t < t0 || p.t > t1) continue;
      n++;
      if (p.mag > mx) mx = p.mag;
    }
    setTxt('fCount', nf(n));
    setTxt('fMax', mx ? r1(mx) : '—');
    setTxt('fTotal', nf(D.meta.count));

    syncTimeline();
  }

  /* ── 时间轴 ─────────────────────────────────────────────── */
  function buildBars() {
    var svg = document.getElementById('tlBars');
    if (!svg || !D.years.length) return;
    var y0 = D.meta.yearMin, maxN = 1, i;
    for (i = 0; i < D.years.length; i++) if (D.years[i][0] > maxN) maxN = D.years[i][0];
    var html = '', gap = 10, w = 7.6;
    for (i = 0; i < D.years.length; i++) {
      var cnt = D.years[i][0];
      var h = cnt ? Math.max(2.5, cnt / maxN * 96) : 1.2;
      html += '<rect class="tbar" data-y="' + (y0 + i) + '" x="' + (i * gap + (gap - w) / 2).toFixed(1) +
        '" y="' + (100 - h).toFixed(1) + '" width="' + w + '" height="' + h.toFixed(1) + '"></rect>';
    }
    svg.innerHTML = html;
    svg._maxN = maxN;
    svg._y0 = y0;
  }

  var _lastBar = null;
  function syncTimeline() {
    var y0 = D.meta.yearMin, y1 = D.meta.yearMax, span = (y1 - y0) || 1;
    var pct = (state.year - y0) / span * 100;
    var cur = document.getElementById('tlCursor');
    if (cur) cur.style.left = pct.toFixed(2) + '%';
    var rg = document.getElementById('tlRange');
    if (rg && +rg.value !== state.year) rg.value = state.year;
    setTxt('tlYear', state.mode === 'cum' ? ('截至 ' + state.year) : (state.year + ' 年'));

    var svg = document.getElementById('tlBars');
    if (svg) {
      var bars = svg.querySelectorAll('.tbar');
      var idx = state.year - y0;
      if (_lastBar && _lastBar !== idx) {
        var old = svg.querySelector('.tbar.is-cur');
        if (old) old.classList.remove('is-cur');
      }
      if (bars[idx]) bars[idx].classList.add('is-cur');
      _lastBar = idx;
    }
  }

  function setYear(y) {
    var lo = D.meta.yearMin, hi = D.meta.yearMax;
    state.year = Math.max(lo, Math.min(hi, y));
    apply();
  }

  function stopPlay() {
    state.playing = false;
    if (state.timer) { clearTimeout(state.timer); state.timer = null; }
    var b = document.getElementById('btnPlay');
    if (b) { b.classList.remove('is-playing'); b.querySelector('i').textContent = '▶'; b.querySelector('span').textContent = '播放'; }
  }
  function startPlay() {
    if (!D.meta) return;
    if (state.mode !== 'cum') { state.mode = 'cum'; syncModeUI(); }
    if (state.year >= D.meta.yearMax) state.year = D.meta.yearMin;
    state.playing = true;
    var b = document.getElementById('btnPlay');
    if (b) { b.classList.add('is-playing'); b.querySelector('i').textContent = '❚❚'; b.querySelector('span').textContent = '暂停'; }
    var step = function () {
      if (!state.playing) return;
      setYear(state.year + 1);
      if (state.year >= D.meta.yearMax) { stopPlay(); return; }
      state.timer = setTimeout(step, C.playMs);
    };
    state.timer = setTimeout(step, C.playMs);
  }
  function syncModeUI() {
    var seg = document.getElementById('segMode');
    if (!seg) return;
    var bs = seg.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) bs[i].classList.toggle('active', bs[i].dataset.v === state.mode);
    var note = document.getElementById('tlNote');
    if (note) {
      note.innerHTML = state.mode === 'cum'
        ? '柱高＝该年被记录的 M6+ 地震次数。<b>累计</b>模式把历年震中叠在一起，看板块边界如何被一点点描出来。'
        : '柱高＝该年被记录的 M6+ 地震次数。现在只看 <b>' + state.year + ' 年</b>，点播放可逐年翻页。';
    }
  }

  /* ── 巨震档案 ───────────────────────────────────────────── */
  function shortPlace(s) {
    /* USGS 早期大震的 place 常带年份前缀（"1960 Great Chilean Earthquake…"），
       列表里已单列年份，去掉避免重复占宽。 */
    return String(s || '').replace(/^(The\s+)?\d{4}\s+/i, '').replace(/^The\s+/i, '');
  }

  function renderBigList() {
    var el = document.getElementById('bigList');
    if (!el) return;
    var html = '';
    D.big.forEach(function (f, i) {
      var p = f.properties;
      html += '<button type="button" class="qrow" data-i="' + i + '">' +
        '<span class="mbadge" style="background:' + magColor(p.mag) + '">' + r1(p.mag) + '</span>' +
        '<span class="qmeta"><span class="qplace">' + Thematic.esc(shortPlace(p.p) || '未命名震中') + '</span>' +
        '<span class="qtime">' + yOf(p.t) + ' 年 · 深 ' + (p.d >= 0 ? p.d + ' km' : '未知') + '</span></span>' +
        '</button>';
    });
    el.innerHTML = html;
    setTxt('bigN', D.big.length + ' 场 · M8+');
    Array.prototype.forEach.call(el.querySelectorAll('.qrow'), function (btn) {
      btn.addEventListener('click', function () {
        var f = D.big[+btn.dataset.i];
        if (!f) return;
        state.year = yOf(f.properties.t);
        apply();
        openFeature(f, true);
      });
    });
  }

  /* ── 详情卡 ─────────────────────────────────────────────── */
  function openFeature(f, fly) {
    var p = f.properties, co = f.geometry.coordinates;
    var col = magColor(p.mag);
    var det = document.getElementById('detail');
    document.documentElement.style.setProperty('--rc', col);
    document.getElementById('dtRole').textContent = 'M' + r1(p.mag) + ' · ' + bandOf(p.mag).label.replace(/^M[\d.]+[–+]?\s*/, '');
    document.getElementById('dtName').textContent = p.p || '未命名震中';

    /* 年度序位：这一年里第几场（按震级降序） */
    var yr = yOf(p.t), same = 0, rank = 0;
    for (var i = 0; i < D.feats.length; i++) {
      var q = D.feats[i].properties;
      if (yOf(q.t) !== yr) continue;
      same++;
      if (q.mag > p.mag) rank++;
    }
    document.getElementById('dtSub').textContent = fmtUTC(p.t, true) + ' UTC';

    document.getElementById('dtLb1').textContent = '震级';
    document.getElementById('dtV1').textContent = r1(p.mag);
    document.getElementById('dtU1').textContent = '级';
    document.getElementById('dtLb2').textContent = '深度';
    document.getElementById('dtV2').textContent = (p.d >= 0 ? p.d : '—');
    document.getElementById('dtU2').textContent = 'km';
    document.getElementById('dtLb3').textContent = '年内序位';
    document.getElementById('dtV3').textContent = (rank + 1);
    document.getElementById('dtU3').textContent = '/ ' + same;

    document.getElementById('dtDescLb').textContent = '震中与坐标';
    var d = '经度 <b>' + co[0].toFixed(3) + '°</b> · 纬度 <b>' + co[1].toFixed(3) + '°</b>';
    d += '<br>' + yr + ' 年全球共 <b>' + same + '</b> 场 M6+ 地震，本场震级排第 <b>' + (rank + 1) + '</b>。';
    if (p.ts) d += '<br><span style="color:#fb923c">⚠ USGS 标记该事件可能引发海啸</span>';
    if (p.d >= 700) d += '<br>深源地震：震源在俯冲带深处，地表震感通常远小于同震级浅源地震。';
    else if (p.d >= 0 && p.d < 70) d += '<br>浅源地震：能量离地表近，同震级下破坏力最大。';
    document.getElementById('dtDesc').innerHTML = d;

    document.getElementById('dtFooter').innerHTML = p.id
      ? '<a href="https://earthquake.usgs.gov/earthquakes/eventpage/' + encodeURIComponent(p.id) +
        '" target="_blank" rel="noopener">在 USGS 查看该事件 ↗</a>'
      : '—';

    det.hidden = false;
    document.body.classList.add('has-detail');
    if (fly) {
      app.map.easeTo({
        center: [co[0], co[1]],
        zoom: Math.max(app.map.getZoom(), p.mag >= 8 ? 3.4 : 4.6),
        duration: 900
      });
    }
  }
  function closeDetail() {
    var det = document.getElementById('detail');
    if (det) det.hidden = true;
    document.body.classList.remove('has-detail');
  }

  /* ── 图例 ───────────────────────────────────────────────── */
  function renderLegend() {
    var el = document.getElementById('legend');
    if (!el) return;
    var html = '<span class="lg-cap">震级（颜色 / 圆点大小）</span>';
    for (var i = 0; i < C.magBands.length; i++) {
      html += '<span class="lg-row"><i style="background:' + C.magBands[i].color + '"></i>' +
        C.magBands[i].label + '</span>';
    }
    html += '<span class="lg-row lg-line"><i></i>板块边界 PB2002</span>';
    el.innerHTML = html;
  }

  /* ── 交互 ───────────────────────────────────────────────── */
  function bindUI() {
    var rg = document.getElementById('tlRange');
    if (rg) {
      rg.addEventListener('input', function () {
        if (state.playing) stopPlay();
        setYear(+this.value);
      });
    }

    var btn = document.getElementById('btnPlay');
    if (btn) btn.addEventListener('click', function () {
      if (state.playing) stopPlay(); else startPlay();
    });

    var seg = document.getElementById('segMode');
    if (seg) seg.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.mode = b.dataset.v;
      syncModeUI();
      apply();
    });

    var chips = document.getElementById('chipMag');
    if (chips) chips.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      Array.prototype.forEach.call(chips.querySelectorAll('button'), function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      state.floor = parseFloat(b.dataset.v);
      setTxt('magLb', '≥' + state.floor.toFixed(1));
      apply();
    });

    var ckP = document.getElementById('ckPlates');
    if (ckP) ckP.addEventListener('change', function () {
      state.plates = this.checked; app.setVisible('plate-line', this.checked);
    });
    var ckG = document.getElementById('ckGlow');
    if (ckG) ckG.addEventListener('change', function () {
      state.glow = this.checked;
      app.map.setPaintProperty('quake-past', 'circle-blur', this.checked ? 1 : 0);
      app.setVisible('quake-glow', this.checked);
    });
    var ckN = document.getElementById('ckNow');
    if (ckN) ckN.addEventListener('change', function () {
      state.nowHi = this.checked;
      app.setVisible('quake-now', this.checked);
      apply();
    });
  }

  /* ── 启动 ───────────────────────────────────────────────── */
  function onReady(a) {
    app = a;
    renderLegend();
    syncModeUI();
    bindUI();
    loadData();

    /* 手机竖屏：桌面取景 zoom 1.95 在 390px 宽里只能看到 71° 经度，等于什么都看不见。
       落到 0.82（世界宽 891px，纵向刚好铺满 844px 高的竖屏，上下不留空），可见约 166° 经度；
       同时把 minZoom 放开到 0.5，否则引擎会把 0.82 顶回 1.5。 */
    if (window.innerWidth <= 900) {
      try { a.map.setMinZoom(0.5); } catch (e) {}
      a.map.jumpTo({ center: [170, -5], zoom: 0.82 });
    }

    /* 陆地轮廓只在「深色无底图」下有意义：卫星 / 地形底图自带陆地，叠上去只会发灰 */
    var bms = document.querySelectorAll('input[name="basemap"]');
    for (var i = 0; i < bms.length; i++) {
      bms[i].addEventListener('change', function () {
        var on = this.value === 'none';
        a.setVisible('land-fill', on);
        a.setVisible('land-line', on);
      });
    }

    a.map.on('click', 'quake-past', function (e) {
      if (e.features && e.features[0]) openFeature(e.features[0]);
    });
    a.map.on('click', 'quake-now', function (e) {
      if (e.features && e.features[0]) openFeature(e.features[0]);
    });
    a.map.on('mousemove', 'quake-past', function (e) {
      a.map.getCanvas().style.cursor = 'pointer';
      if (e.features && e.features[0]) {
        var p = e.features[0].properties;
        a.tooltip('<b>M' + r1(p.mag) + '</b> · ' + Thematic.esc(p.p || '') +
          '<br>' + fmtUTC(p.t) + ' · 深 ' + (p.d >= 0 ? p.d + ' km' : '未知'),
          e.originalEvent.clientX + 14, e.originalEvent.clientY + 14);
      }
    });
    a.map.on('mouseleave', 'quake-past', function () {
      a.map.getCanvas().style.cursor = '';
      a.tooltip(null);
    });
  }

  function build() {
    Thematic.create({
      slug: 'quake-history',
      view: C.view,
      bounds: C.bounds,
      extent: C.extent,
      graticuleStep: C.graticuleStep,
      province: false,
      defaultBasemap: C.defaultBasemap,
      basemaps: C.basemaps,
      imgPaint: C.imgPaint,
      sources: {
        quakes: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
        plates: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
        land: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } }
      },
      layers: [
        {
          /* 陆地轮廓：只画海陆分界，不含任何国界 */
          id: 'land-fill', type: 'fill', source: 'land',
          paint: {
            'fill-color': '#1b2a45',
            'fill-opacity': 0.9
          }
        },
        {
          id: 'land-line', type: 'line', source: 'land',
          paint: {
            'line-color': '#7f97b8',
            'line-opacity': 0.5,
            'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.5, 4, 0.9, 8, 1.3]
          }
        },
        {
          id: 'plate-line', type: 'line', source: 'plates',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#9fb3cd',
            'line-opacity': ['interpolate', ['linear'], ['zoom'], 0, 0.34, 4, 0.5, 8, 0.55],
            'line-width': ['interpolate', ['linear'], ['zoom'], 0, 0.7, 3, 1.2, 6, 2, 9, 2.6],
            'line-dasharray': [3, 2]
          }
        },
        {
          id: 'quake-glow', type: 'circle', source: 'quakes',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'],
              0, ['*', 2.6, ['interpolate', ['linear'], ['get', 'mag'], 6, 3.4, 7, 5.8, 8, 9.6, 9, 15.5]],
              3, ['*', 2.8, ['interpolate', ['linear'], ['get', 'mag'], 6, 3.4, 7, 5.8, 8, 9.6, 9, 15.5]],
              6, ['*', 3.3, ['interpolate', ['linear'], ['get', 'mag'], 6, 3.4, 7, 5.8, 8, 9.6, 9, 15.5]]],
            'circle-color': ['step', ['get', 'mag'], '#4fc3f7', 7.0, '#ffd54f', 8.0, '#ff8a4c', 9.0, '#ef4444'],
            'circle-blur': 1, 'circle-opacity': 0.3
          }
        },
        {
          id: 'quake-past', type: 'circle', source: 'quakes',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'],
              0, ['*', 0.92, ['interpolate', ['linear'], ['get', 'mag'], 6, 3.4, 7, 5.8, 8, 9.6, 9, 15.5]],
              3, ['*', 1.06, ['interpolate', ['linear'], ['get', 'mag'], 6, 3.4, 7, 5.8, 8, 9.6, 9, 15.5]],
              6, ['*', 1.55, ['interpolate', ['linear'], ['get', 'mag'], 6, 3.4, 7, 5.8, 8, 9.6, 9, 15.5]],
              9, ['*', 2.2, ['interpolate', ['linear'], ['get', 'mag'], 6, 3.4, 7, 5.8, 8, 9.6, 9, 15.5]]],
            'circle-color': ['step', ['get', 'mag'], '#4fc3f7', 7.0, '#ffd54f', 8.0, '#ff8a4c', 9.0, '#ef4444'],
            'circle-opacity': ['interpolate', ['linear'], ['zoom'], 0, 0.82, 5, 0.86, 9, 0.92],
            'circle-blur': 1,
            'circle-stroke-color': 'rgba(6,10,18,.85)',
            'circle-stroke-width': 0.35
          }
        },
        {
          id: 'quake-now', type: 'circle', source: 'quakes',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'],
              0, ['*', 1.05, ['interpolate', ['linear'], ['get', 'mag'], 6, 3.4, 7, 5.8, 8, 9.6, 9, 15.5]],
              3, ['*', 1.2, ['interpolate', ['linear'], ['get', 'mag'], 6, 3.4, 7, 5.8, 8, 9.6, 9, 15.5]],
              6, ['*', 1.75, ['interpolate', ['linear'], ['get', 'mag'], 6, 3.4, 7, 5.8, 8, 9.6, 9, 15.5]],
              9, ['*', 2.45, ['interpolate', ['linear'], ['get', 'mag'], 6, 3.4, 7, 5.8, 8, 9.6, 9, 15.5]]],
            'circle-color': ['step', ['get', 'mag'], '#8ee2ff', 7.0, '#ffe08a', 8.0, '#ffab7d', 9.0, '#ff7b7b'],
            'circle-opacity': 0.98,
            'circle-blur': 0,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 0, 0.7, 5, 1.3, 9, 1.8]
          }
        }
      ],
      onReady: onReady,
      onClose: closeDetail,
      /* 「全球总览」回到初始取景：引擎会把 fitBounds 算出的低 zoom 顶回最小级并锁死 center，
         所以这里直接跳回配置的视野，而不是调 fitAll。 */
      onOverview: function (a) {
        a.map.easeTo({ center: C.view.center, zoom: C.view.zoom, bearing: 0, pitch: 0, duration: 700 });
      }
    });
  }

  if (document.readyState !== 'loading') build();
  else document.addEventListener('DOMContentLoaded', build);
})();
