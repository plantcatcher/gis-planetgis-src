/* 日本周边历史地震地图 · 运行时
   依赖：/maps/_shared/thematic/thematic.js（MapLibre 引擎封装）
   数据：data/catalog.json（USGS ComCat 1900–2026 M5+ 静态矢量）
         + data/plates.json（PB2002 板块边界）+ data/land.json（海陆分界）
   逻辑：一次性载入本地矢量 → 用 MapLibre filter 控制「年份 + 震级 + 地震带」三个维度，
        不重建数据；着色方式（震级 / 深度）只切换 paint 表达式。 */
(function () {
  'use strict';

  var C = window.JQ_CONFIG;
  var app = null;

  var D = { feats: [], years: [], meta: null, marks: [], bands: [], markById: {} };
  var state = {
    year: 2026, mode: 'cum', floor: 5.0, colorMode: 'mag',
    bands: null,            // Set，null = 全选
    playing: false, timer: null,
    glow: true, nowHi: true, axis: true, city: true
  };

  /* ── 工具 ───────────────────────────────────────────────── */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  }); }
  function r1(n) { return Math.round(n * 10) / 10; }
  function nf(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function setTxt(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
  /* 系统「减少动态效果」偏好：持续外扩的冲击波对前庭敏感用户不友好 */
  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

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

  function bandOf(key) {
    for (var i = 0; i < D.bands.length; i++) if (D.bands[i].key === key) return D.bands[i];
    return { key: key, name: key, color: '#8ea3bd' };
  }
  function magColor(m) {
    var arr = C.magBands;
    for (var i = 0; i < arr.length; i++) if (m >= arr[i].min) return arr[i].color;
    return arr[arr.length - 1].color;
  }
  function depthColor(d) {
    var arr = C.depthBands;
    for (var i = 0; i < arr.length; i++) if (d >= arr[i].min) return arr[i].color;
    return arr[arr.length - 1].color;
  }

  /* ── 载入数据 ───────────────────────────────────────────── */
  function loadData() {
    return Promise.all([
      fetch(C.data.catalog).then(function (r) { return r.json(); }),
      fetch(C.data.plates).then(function (r) { return r.json(); }).catch(function () { return null; }),
      fetch(C.data.land).then(function (r) { return r.json(); }).catch(function () { return null; })
    ]).then(function (res) {
      var cat = res[0], pl = res[1], ld = res[2];
      D.meta = cat.meta;
      D.years = cat.years;
      D.marks = cat.marks || [];
      D.bands = cat.meta.bands || [];

      var labels = cat.labels || [];
      var places = cat.places || [];
      var rows = cat.rows;
      var feats = new Array(rows.length);
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        feats[i] = {
          type: 'Feature',
          id: i,
          geometry: { type: 'Point', coordinates: [r[0], r[1]] },
          properties: {
            mag: r[2], t: r[3], d: r[4],
            zh: labels[r[5]] || places[r[5]] || '',
            en: places[r[5]] || '',
            ts: r[6], uid: r[7], b: r[8]
          }
        };
      }
      D.feats = feats;
      D.markById = {};
      D.marks.forEach(function (m) { D.markById[m.id] = m; });

      state.year = D.meta.yearMax;
      state.bands = {};
      D.bands.forEach(function (b) { state.bands[b.key] = true; });

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
      renderBands();
      renderMarks();
      paintLabels();
      apply();
    }).catch(function (err) {
      setTxt('fCount', '加载失败');
      if (window.console) console.error('[japan-quakes]', err);
    });
  }

  /* ── 过滤表达式 ─────────────────────────────────────────── */
  var EMPTY = ['==', ['get', 'mag'], -999];

  function bandCond() {
    var keys = [];
    for (var k in state.bands) if (state.bands[k]) keys.push(k);
    if (keys.length === D.bands.length) return null;
    if (!keys.length) return EMPTY;
    return ['in', ['get', 'b'], ['literal', keys]];
  }

  function filterPast() {
    var a = ['all', ['>=', ['get', 'mag'], state.floor]];
    var b = bandCond();
    if (b) a.push(b);
    if (state.mode === 'cum') a.push(['<=', ['get', 't'], yEnd(state.year)]);
    else a.push(['>=', ['get', 't'], yStart(state.year)], ['<=', ['get', 't'], yEnd(state.year)]);
    return a;
  }
  function filterNow() {
    if (state.mode !== 'cum' || !state.nowHi) return EMPTY;
    var a = ['all', ['>=', ['get', 'mag'], state.floor],
      ['>=', ['get', 't'], yStart(state.year)],
      ['<=', ['get', 't'], yEnd(state.year)]];
    var b = bandCond();
    if (b) a.push(b);
    return a;
  }

  /* 光晕只给 M6+ 大点：原先 1 万个模糊大圆是主要开销，按 M6+ 过滤后降到约 1.7 千个，
     视觉上小点本来也看不出光晕，性能提升明显。 */
  function filterGlow() {
    var a = ['all', ['>=', ['get', 'mag'], Math.max(state.floor, 6.0)]];
    var b = bandCond();
    if (b) a.push(b);
    if (state.mode === 'cum') a.push(['<=', ['get', 't'], yEnd(state.year)]);
    else a.push(['>=', ['get', 't'], yStart(state.year)], ['<=', ['get', 't'], yEnd(state.year)]);
    return a;
  }

  /* 脉冲层过滤：
     · 常驻：M8+ 巨震，随当前年份窗口（累计=截至当年 / 当年=仅当年）持续向外脉冲。
     · 播放状态：叠加「当前年份内 M8 以下的可见地震」——
       大量脉冲只在播放时出现，停止播放即消失。 */
  function filterPulse() {
    var b = bandCond();
    var big = ['all', ['>=', ['get', 'mag'], 8.0]];
    if (b) big.push(b);
    if (state.mode === 'cum') {
      big.push(['<=', ['get', 't'], yEnd(state.year)]);
    } else {
      big.push(['>=', ['get', 't'], yStart(state.year)], ['<=', ['get', 't'], yEnd(state.year)]);
    }
    if (!state.playing) return big;
    var mass = ['all', ['>=', ['get', 'mag'], state.floor], ['<', ['get', 'mag'], 8.0],
      ['>=', ['get', 't'], yStart(state.year)],
      ['<=', ['get', 't'], yEnd(state.year)]];
    if (b) mass.push(b);
    return ['any', big, mass];
  }

  /* ── 着色表达式 ─────────────────────────────────────────── */
  function colorExpr(light) {
    if (state.colorMode === 'depth') {
      return light
        ? ['step', ['get', 'd'], '#ff8fa3', 30, '#ffc078', 70, '#8fd8f5', 300, '#c4b5fd']
        : ['step', ['get', 'd'], '#ff4d6d', 30, '#ffa63d', 70, '#45c8f0', 300, '#a78bfa'];
    }
    /* 暖→赤红热力色阶：小震暖橙、大震赤红，颜色随震级向红色过渡 */
    return light
      ? ['step', ['get', 'mag'], '#ffd9a8', 6.0, '#ffc078', 7.0, '#ff9a5a', 8.0, '#ff6b4a', 9.0, '#ff8a8a']
      : ['step', ['get', 'mag'], '#ffb88c', 6.0, '#ff8c42', 7.0, '#ff5a36', 8.0, '#ff2d2d', 9.0, '#d4001a'];
  }

  function radiusExpr() {
    var byMag = ['interpolate', ['linear'], ['get', 'mag'], 5, 2.6, 6, 4.0, 7, 6.4, 8, 10.5, 9, 16.0];
    /* 注意：["zoom"] 只能作顶层 interpolate 的输入，不能塞进 ['*'] 内部 */
    return ['interpolate', ['linear'], ['zoom'],
      3, ['*', 0.95, byMag],
      6, ['*', 1.3, byMag],
      9, ['*', 1.95, byMag]];
  }

  /* ── 主刷新 ─────────────────────────────────────────────── */
  function apply() {
    var map = app && app.map;
    if (!map) return;

    var f = filterPast();
    if (map.getLayer('quake-glow')) map.setFilter('quake-glow', filterGlow());
    if (map.getLayer('quake-past')) map.setFilter('quake-past', f);
    if (map.getLayer('quake-now')) map.setFilter('quake-now', filterNow());
    var pf = filterPulse();
    if (map.getLayer('quake-pulse')) map.setFilter('quake-pulse', pf);

    /* 统计：一次遍历 1 万条 */
    var n = 0, mx = 0, t0 = yStart(state.year), t1 = yEnd(state.year);
    var feats = D.feats, floor = state.floor, cum = state.mode === 'cum';
    var bands = state.bands, allBands = D.bands.length;
    var picked = 0;
    for (var bk in bands) if (bands[bk]) picked++;
    for (var i = 0; i < feats.length; i++) {
      var p = feats[i].properties;
      if (p.mag < floor) continue;
      if (picked < allBands && !bands[p.b]) continue;
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
    var html = '', gap = 10, w = 7.4;
    for (i = 0; i < D.years.length; i++) {
      var cnt = D.years[i][0];
      var h = cnt ? Math.max(2.5, Math.sqrt(cnt / maxN) * 94) : 1.2;
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

    updateNote();
    var svg = document.getElementById('tlBars');
    if (svg) {
      var bars = svg.querySelectorAll('.tbar');
      var idx = state.year - y0;
      if (_lastBar !== null && _lastBar !== idx) {
        var old = svg.querySelector('.tbar.is-cur');
        if (old) old.classList.remove('is-cur');
      }
      if (bars[idx]) bars[idx].classList.add('is-cur');
      _lastBar = idx;
    }
  }

  function setYear(y) {
    state.year = Math.max(D.meta.yearMin, Math.min(D.meta.yearMax, y));
    apply();
  }

  var _playGen = 0;   // 播放代次：停止/重播时自增，作废旧的一次性回调，避免双倍速
  function stopPlay(skipApply) {
    _playGen++;
    state.playing = false;
    if (state.timer) { clearTimeout(state.timer); state.timer = null; }
    var b = document.getElementById('btnPlay');
    if (b) { b.classList.remove('is-playing'); b.querySelector('i').textContent = '▶'; b.querySelector('span').textContent = '播放'; }
    if (!skipApply) apply();   // 回到「仅 M8+ 常驻脉冲」过滤
  }
  function startPlay() {
    if (!D.meta) return;
    _playGen++;
    if (state.mode !== 'cum') { state.mode = 'cum'; syncModeUI(); }
    if (state.year >= D.meta.yearMax) state.year = D.meta.yearMin;
    state.playing = true;
    var b = document.getElementById('btnPlay');
    if (b) { b.classList.add('is-playing'); b.querySelector('i').textContent = '❚❚'; b.querySelector('span').textContent = '暂停'; }
    apply();   // 立即切到「M8+ 常驻 + 当前年份其余脉冲」过滤
    state.timer = setTimeout(step, C.playMs);
  }
  /* 播放推进：等这一年真正画到地图上（下一帧 render）再推进下一年，
     进度条与地图就不会脱节；渲染慢时按真实帧率前进，而不是盲等 95ms。 */
  function step() {
    if (!state.playing) return;
    if (state.year >= D.meta.yearMax) { stopPlay(); return; }
    var gen = _playGen;
    setYear(state.year + 1);
    var map = app && app.map;
    var done = false;
    var next = function () {
      if (done || gen !== _playGen) return;   // 过期回调直接丢弃
      done = true;
      if (state.playing) state.timer = setTimeout(step, C.playMs);
    };
    if (map) {
      map.once('render', next);
      state.timer = setTimeout(next, 600);   // 兜底：万一 render 未触发
    } else {
      state.timer = setTimeout(next, C.playMs);
    }
  }
  function updateNote() {
    var note = document.getElementById('tlNote');
    if (!note) return;
    note.innerHTML = state.mode === 'cum'
      ? '柱高＝该年被记录的 M5+ 地震次数。<b>1900–1950 年柱子极矮，不是那时地震少，是那时没有台网。</b>'
      : '柱高＝该年被记录的 M5+ 地震次数。现在只看 <b>' + state.year + ' 年</b>，点播放可逐年翻页。';
  }
  function syncModeUI() {
    var seg = document.getElementById('segMode');
    if (!seg) return;
    var bs = seg.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) bs[i].classList.toggle('active', bs[i].dataset.v === state.mode);
    updateNote();
  }

  /* ── 地震带筛选 ─────────────────────────────────────────── */
  function renderBands() {
    var el = document.getElementById('bandList');
    if (!el) return;
    var bc = (D.meta && D.meta.bandCount) || {};
    var html = '';
    D.bands.forEach(function (b) {
      html += '<button type="button" class="bandrow is-on" data-k="' + b.key + '">' +
        '<i style="background:' + b.color + '"></i>' +
        '<span class="bn">' + esc(b.name) + '</span>' +
        '<em>' + nf(bc[b.key] || 0) + '</em></button>';
    });
    el.innerHTML = html;
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button.bandrow');
      if (!b) return;
      var k = b.dataset.k;
      state.bands[k] = !state.bands[k];
      b.classList.toggle('is-on', state.bands[k]);
      syncBandHint();
      apply();
    });
  }

  function syncBandHint() {
    var n = 0, tot = D.bands.length;
    for (var k in state.bands) if (state.bands[k]) n++;
    setTxt('bandHint', n === tot ? '全部' : (n + ' / ' + tot + ' 类'));
  }

  function setAllBands(on, onlyTrench) {
    D.bands.forEach(function (b) {
      state.bands[b.key] = onlyTrench ? (b.key !== 'inland' && b.key !== 'other') : on;
    });
    var rows = document.querySelectorAll('#bandList .bandrow');
    Array.prototype.forEach.call(rows, function (r) {
      r.classList.toggle('is-on', !!state.bands[r.dataset.k]);
    });
    syncBandHint();
    apply();
  }

  /* ── 必看事件 ───────────────────────────────────────────── */
  function renderMarks() {
    var el = document.getElementById('markList');
    if (!el) return;
    var html = '';
    D.marks.forEach(function (m, i) {
      var col = magColor(m.mag);
      html += '<button type="button" class="qrow" data-i="' + i + '">' +
        '<span class="mbadge" style="background:' + col + '">' + r1(m.mag) + '</span>' +
        '<span class="qmeta"><span class="qplace">' + esc(m.name) + '</span>' +
        '<span class="qtime">' + m.date.slice(0, 4) + ' 年 · ' + esc(bandOf(m.band).name) + '</span></span>' +
        '</button>';
    });
    el.innerHTML = html;
    setTxt('markN', D.marks.length + ' 场');
    el.addEventListener('click', function (e) {
      var b = e.target.closest('.qrow');
      if (!b) return;
      var m = D.marks[+b.dataset.i];
      if (!m) return;
      var f = D.feats[m.i];
      /* 详情卡先弹出（下一帧再跑重的地图过滤），避免点下去像“卡住” */
      if (state.playing) stopPlay(true);
      openFeature(f, true);
      state.mode = 'year';
      state.year = yOf(f.properties.t);
      syncModeUI();
      setTimeout(apply, 0);
    });
  }

  /* ── 标注（海沟带名 + 城市） ────────────────────────────── */
  function paintLabels() {
    var items = [];
    var z = app.map.getZoom();
    if (state.axis && z < 7.2) {
      C.axes.forEach(function (a) {
        var b = bandOf(a.key);
        items.push({ text: a.name, lng: a.pos[0], lat: a.pos[1], color: b.color, kind: 'tag', active: true });
      });
    }
    if (state.city) {
      C.cities.forEach(function (c) {
        items.push({ text: c.name, lng: c.lng, lat: c.lat, color: '#c8d6e8', kind: 'dot' });
      });
    }
    app.setLabels(items);
  }

  /* ── 详情卡 ─────────────────────────────────────────────── */
  function openFeature(f, fly) {
    var p = f.properties, co = f.geometry.coordinates;
    var mark = D.markById[p.uid];
    var col = state.colorMode === 'depth' ? depthColor(p.d) : magColor(p.mag);
    var band = bandOf(p.b);
    document.documentElement.style.setProperty('--rc', col);

    var title = mark ? mark.name : (p.zh || '未命名震中');
    document.getElementById('dtRole').textContent = 'M' + r1(p.mag) + ' · ' + band.name;
    document.getElementById('dtName').textContent = title;
    document.getElementById('dtSub').textContent = fmtUTC(p.t, true) + ' UTC' +
      (p.zh && mark ? ' · ' + p.zh : '');

    var yr = yOf(p.t), same = 0, rank = 0;
    for (var i = 0; i < D.feats.length; i++) {
      var q = D.feats[i].properties;
      if (yOf(q.t) !== yr || q.mag < state.floor) continue;
      same++;
      if (q.mag > p.mag) rank++;
    }

    document.getElementById('dtLb1').textContent = '震级';
    document.getElementById('dtV1').textContent = r1(p.mag);
    document.getElementById('dtU1').textContent = '级';
    document.getElementById('dtLb2').textContent = '深度';
    document.getElementById('dtV2').textContent = (p.d >= 0 ? p.d : '—');
    document.getElementById('dtU2').textContent = 'km';
    document.getElementById('dtLb3').textContent = '年内序位';
    document.getElementById('dtV3').textContent = (rank + 1);
    document.getElementById('dtU3').textContent = '/ ' + same;

    document.getElementById('dtDescLb').textContent = mark ? '发生了什么' : '震中与坐标';
    var d = '';
    if (mark) d += mark.note + '<br>';
    d += '经度 <b>' + co[0].toFixed(3) + '°</b> · 纬度 <b>' + co[1].toFixed(3) + '°</b>';
    d += ' · ' + band.name + '<br>' + yr + ' 年（M≥' + state.floor.toFixed(1) + '）共 <b>' + same +
      '</b> 次，本场震级排第 <b>' + (rank + 1) + '</b>。';
    if (p.ts) d += '<br><span style="color:#fb923c">⚠ USGS 标记该事件可能引发海啸</span>';
    if (p.d >= 300) d += '<br>深源地震：震源在俯冲板片深处，地表震感通常远小于同震级浅源地震。';
    else if (p.d >= 0 && p.d < 70) d += '<br>浅源地震：能量离地表近，同震级下破坏力最大。';
    if (p.en && p.zh !== p.en) d += '<br><span class="en-orig">USGS 原始地名：' + esc(p.en) + '</span>';
    document.getElementById('dtDesc').innerHTML = d;

    document.getElementById('dtFooter').innerHTML = p.uid
      ? '<a href="https://earthquake.usgs.gov/earthquakes/eventpage/' + encodeURIComponent(p.uid) +
        '" target="_blank" rel="noopener">在 USGS 查看该事件 ↗</a>'
      : '—';

    document.getElementById('detail').hidden = false;
    document.body.classList.add('has-detail');
    if (fly) {
      app.map.easeTo({
        center: [co[0], co[1]],
        zoom: Math.max(app.map.getZoom(), p.mag >= 8 ? 4.4 : 5.6),
        duration: 900
      });
    }
  }
  function closeDetail() {
    var det = document.getElementById('detail');
    if (det) det.hidden = true;
    document.body.classList.remove('has-detail');
  }

  /* ── 图层与底图：默认收起为齿轮按钮，点击齿轮展开、✕ 收起（参考 gba-cities） ── */
  function bindPanel() {
    var gear = document.getElementById('panelGear');
    var panel = document.getElementById('panel');
    var close = document.getElementById('panelClose');
    if (gear && panel) {
      gear.addEventListener('click', function () {
        panel.classList.remove('closed');
        gear.hidden = true;
      });
    }
    if (close && panel && gear) {
      close.addEventListener('click', function () {
        panel.classList.add('closed');
        gear.hidden = false;
      });
    }
  }

  /* ── 交互 ───────────────────────────────────────────────── */
  function bindUI() {
    bindPanel();
    var rg = document.getElementById('tlRange');
    if (rg) rg.addEventListener('input', function () {
      if (state.playing) stopPlay();
      setYear(+this.value);
    });

    var btn = document.getElementById('btnPlay');
    if (btn) btn.addEventListener('click', function () { state.playing ? stopPlay() : startPlay(); });

    var seg = document.getElementById('segMode');
    if (seg) seg.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.mode = b.dataset.v;
      syncModeUI(); apply();
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

    var sc = document.getElementById('segColor');
    if (sc) sc.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.v === state.colorMode) return;
      state.colorMode = b.dataset.v;
      Array.prototype.forEach.call(sc.querySelectorAll('button'), function (x) {
        x.classList.toggle('active', x.dataset.v === state.colorMode);
      });
      var note = document.getElementById('panelNote');
      if (note) {
        note.innerHTML = state.colorMode === 'mag'
          ? '虚线是<b>海沟与应变带轴线</b>，不是国界。震级越大点越大、越红。<b>M8 以上巨震持续向外脉冲</b>；点「播放」后，其余震中会随年份一圈圈炸开（小震绿环）。'
          : '虚线是<b>海沟与应变带轴线</b>，不是国界。颜色改为按<b>震源深度</b>：从海沟向东由红转紫，那条斜带就是俯冲板片。';
      }
      var map = app.map;
      map.setPaintProperty('quake-past', 'circle-color', colorExpr(false));
      if (map.getLayer('quake-glow')) map.setPaintProperty('quake-glow', 'circle-color', colorExpr(false));
      if (map.getLayer('quake-now')) map.setPaintProperty('quake-now', 'circle-color', colorExpr(true));
    });

    var bAll = document.getElementById('bandAll');
    if (bAll) bAll.addEventListener('click', function () { setAllBands(true, false); });
    var bNone = document.getElementById('bandNone');
    if (bNone) bNone.addEventListener('click', function () { setAllBands(false, true); });

    var ckA = document.getElementById('ckAxis');
    if (ckA) ckA.addEventListener('change', function () {
      state.axis = this.checked;
      app.setVisible('axis-line', this.checked);
      paintLabels();
    });
    var ckP = document.getElementById('ckPlates');
    if (ckP) ckP.addEventListener('change', function () {
      app.setVisible('plate-line', this.checked);
    });
    var ckC = document.getElementById('ckCity');
    if (ckC) ckC.addEventListener('change', function () {
      state.city = this.checked;
      paintLabels();
    });
    var ckG = document.getElementById('ckGlow');
    if (ckG) ckG.addEventListener('change', function () {
      state.glow = this.checked;
      app.map.setPaintProperty('quake-past', 'circle-blur', this.checked ? 1 : 0);
      app.setVisible('quake-glow', this.checked);
      app.setVisible('quake-pulse', this.checked);
      if (this.checked) startPulse(); else stopPulse();
    });
    var ckN = document.getElementById('ckNow');
    if (ckN) ckN.addEventListener('change', function () {
      state.nowHi = this.checked;
      app.setVisible('quake-now', this.checked);
      apply();
    });
  }

  /* ── 脉冲动画：震级越大环越大；小震绿环、大震红环；向外扩散的冲击波 ── */
  var _pulseRAF = null, _pulseT0 = null;
  var PULSE_PERIOD = 2000;                 // 一圈脉冲的时长（ms）
  /* 基准半径随震级放大：M5 小环 → M9 大环（再乘以扩散系数） */
  var PULSE_R_BASE = ['interpolate', ['linear'], ['get', 'mag'], 5, 4, 6, 7, 7, 11, 8, 16, 9, 22];
  /* 颜色随震级：小震绿、大震红（数据驱动，一次性设置；动画只改半径与透明度） */
  var PULSE_COLOR = ['step', ['get', 'mag'],
    '#39d98a',                       // <6：绿（M5 中震）
    6, '#a3e635',                    // M6：黄绿
    7, '#ffb347',                    // M7：橙
    8, '#ff6b3d',                    // M8：红橙
    9, '#ff3b30'                     // M9+：红
  ];
  var _lastPaint = 0;
  function paintPulse(layer, p) {
    var map = app.map;
    var factor = 0.55 + p * 3.0;                 // 由内向外扩散
    map.setPaintProperty(layer, 'circle-radius', ['*', factor, PULSE_R_BASE]);
    /* 单圈：起亮、扩散过程中淡出到接近 0，再从头开始，避免“大环突然缩小”的跳变 */
    var fade = 0.06 + (1 - p) * 0.94;
    map.setPaintProperty(layer, 'circle-stroke-opacity', fade * 0.95);
  }
  function pulseFrame(now) {
    if (!app || !app.map || !app.map.getLayer('quake-pulse')) { _pulseRAF = null; return; }
    if (!document.hidden) {
      if (now == null) now = (window.performance ? performance.now() : Date.now());
      if (_pulseT0 === null) _pulseT0 = now;
      if (now - _lastPaint >= 33) {                // 限到 ~30fps：半径是数据驱动表达式，重设会重建圆桶，降频显著减负
        var p = ((now - _pulseT0) % PULSE_PERIOD) / PULSE_PERIOD;
        paintPulse('quake-pulse', p);
        _lastPaint = now;
      }
    }
    _pulseRAF = requestAnimationFrame(pulseFrame);
  }
  function startPulse() {
    /* 减少动态效果：不跑无限外扩循环，只留一圈静态冲击波。
       半径仍按震级分级（PULSE_R_BASE），震级信息不丢，只是不再动。 */
    if (reducedMotion()) {
      if (_pulseRAF !== null) { cancelAnimationFrame(_pulseRAF); _pulseRAF = null; }
      if (app && app.map && app.map.getLayer('quake-pulse')) paintPulse('quake-pulse', 0.35);
      return;
    }
    if (_pulseRAF === null) _pulseRAF = requestAnimationFrame(pulseFrame);
  }
  function stopPulse() {
    if (_pulseRAF !== null) { cancelAnimationFrame(_pulseRAF); _pulseRAF = null; }
  }

  /* ── 启动 ───────────────────────────────────────────────── */
  function onReady(a) {
    app = a;
    bindUI();
    loadData();

    if (window.innerWidth <= 900) {
      /* 竖屏用固定的取景而不是 fitAll：fitBounds 会让日本落到可视区偏下。
         z=3.6 时 390px 宽约合 22° 经度，正好装下日本主体 + 日本海沟东侧。 */
      setTimeout(function () {
        a.map.jumpTo({ center: [136.4, 35.4], zoom: 3.6 });
      }, 80);
    }

    /* 陆地轮廓只在「深色无底图」下有意义：卫星 / 地形底图自带陆地。
       默认卫星影像，先把陆地填充隐藏。 */
    var landOn = (C.defaultBasemap === 'none');
    a.setVisible('land-fill', landOn);
    a.setVisible('land-line', landOn);
    var bms = document.querySelectorAll('input[name="basemap"]');
    for (var i = 0; i < bms.length; i++) {
      bms[i].addEventListener('change', function () {
        var on = this.value === 'none';
        a.setVisible('land-fill', on);
        a.setVisible('land-line', on);
      });
    }

    /* 启动向外扩散的红色脉冲（震中光晕开启时） */
    if (state.glow) startPulse();

    /* 轴线与带名随缩放刷新 */
    a.map.on('zoom', function () { paintLabels(); });

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
        a.tooltip('<b>M' + r1(p.mag) + '</b> · ' + esc(p.zh || '') +
          '<br>' + fmtUTC(p.t) + ' · 深 ' + (p.d >= 0 ? p.d + ' km' : '未知') +
          '<br><span style="opacity:.7">' + esc(bandOf(p.b).name) + '</span>',
          e.originalEvent.clientX + 14, e.originalEvent.clientY + 14);
      }
    });
    a.map.on('mouseleave', 'quake-past', function () {
      a.map.getCanvas().style.cursor = '';
      a.tooltip(null);
    });
  }

  function build() {
    /* 海沟轴线：GeoJSON 由 config 里的坐标现场生成，不额外请求文件 */
    var axisFC = {
      type: 'FeatureCollection',
      features: C.axes.map(function (a) {
        return { type: 'Feature', properties: { k: a.key }, geometry: { type: 'LineString', coordinates: a.line } };
      })
    };

    Thematic.create({
      slug: 'japan-quakes',
      view: C.view,
      bounds: C.bounds,
      boundsMobile: C.boundsMobile,
      extent: C.extent,
      graticuleStep: C.graticuleStep,
      province: false,
      defaultBasemap: C.defaultBasemap,
      basemaps: C.basemaps,
      imgPaint: C.imgPaint,
      sources: {
        quakes: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
        plates: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
        land: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
        axis: { type: 'geojson', data: axisFC }
      },
      layers: [
        {
          /* 陆地轮廓：只画海陆分界，不含任何国界 */
          id: 'land-fill', type: 'fill', source: 'land',
          paint: { 'fill-color': '#1a2740', 'fill-opacity': 0.92 }
        },
        {
          id: 'land-line', type: 'line', source: 'land',
          paint: {
            'line-color': '#7f97b8',
            'line-opacity': 0.5,
            'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.5, 6, 1, 10, 1.6]
          }
        },
        {
          id: 'plate-line', type: 'line', source: 'plates',
          layout: { visibility: 'none', 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#9fb3cd',
            'line-opacity': 0.42,
            'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.7, 6, 1.4, 10, 2],
            'line-dasharray': [2, 2]
          }
        },
        {
          /* 海沟 / 应变带轴线：示意线，非国界 */
          id: 'axis-line', type: 'line', source: 'axis',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#bcd6f0',
            'line-opacity': ['interpolate', ['linear'], ['zoom'], 3, 0.45, 7, 0.6],
            'line-width': ['interpolate', ['linear'], ['zoom'], 3, 1.1, 6, 1.8, 10, 2.6],
            'line-dasharray': [4, 2.4]
          }
        },
        {
          id: 'quake-glow', type: 'circle', source: 'quakes',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'],
              3, ['*', 2.4, ['interpolate', ['linear'], ['get', 'mag'], 5, 2.6, 6, 4.0, 7, 6.4, 8, 10.5, 9, 16.0]],
              6, ['*', 2.7, ['interpolate', ['linear'], ['get', 'mag'], 5, 2.6, 6, 4.0, 7, 6.4, 8, 10.5, 9, 16.0]],
              9, ['*', 3.4, ['interpolate', ['linear'], ['get', 'mag'], 5, 2.6, 6, 4.0, 7, 6.4, 8, 10.5, 9, 16.0]]],
            'circle-color': colorExpr(false),
            'circle-blur': 1, 'circle-opacity': 0.26
          }
        },
        {
          id: 'quake-past', type: 'circle', source: 'quakes',
          paint: {
            'circle-radius': radiusExpr(),
            'circle-color': colorExpr(false),
            'circle-opacity': ['interpolate', ['linear'], ['zoom'], 3, 0.8, 6, 0.86, 10, 0.93],
            'circle-blur': 1,
            'circle-stroke-color': 'rgba(4,8,15,.85)',
            'circle-stroke-width': 0.35
          }
        },
        {
          id: 'quake-now', type: 'circle', source: 'quakes',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'],
              3, ['*', 1.15, ['interpolate', ['linear'], ['get', 'mag'], 5, 2.6, 6, 4.0, 7, 6.4, 8, 10.5, 9, 16.0]],
              6, ['*', 1.5, ['interpolate', ['linear'], ['get', 'mag'], 5, 2.6, 6, 4.0, 7, 6.4, 8, 10.5, 9, 16.0]],
              9, ['*', 2.2, ['interpolate', ['linear'], ['get', 'mag'], 5, 2.6, 6, 4.0, 7, 6.4, 8, 10.5, 9, 16.0]]],
            'circle-color': colorExpr(true),
            'circle-opacity': 0.98,
            'circle-blur': 0,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 3, 0.7, 6, 1.2, 10, 1.7]
          }
        },
        {
          /* 向外扩散的冲击波：每点一圈，RAF 动画驱动半径/透明度，颜色与基准半径由震级决定
             （小震绿环、大震红环，震级越大环越大）。 */
          id: 'quake-pulse', type: 'circle', source: 'quakes',
          paint: {
            'circle-radius': 8,
            'circle-color': PULSE_COLOR,
            'circle-opacity': 0,
            'circle-stroke-color': PULSE_COLOR,
            'circle-stroke-width': 1.4,
            'circle-stroke-opacity': 0
          }
        }
      ],
      onReady: onReady,
      onClose: closeDetail,
      onOverview: function (a) {
        if (window.innerWidth <= 900) { a.fitAll({ animate: true }); return; }
        a.map.easeTo({ center: C.view.center, zoom: C.view.zoom, bearing: 0, pitch: 0, duration: 700 });
      }
    });
  }

  if (document.readyState !== 'loading') build();
  else document.addEventListener('DOMContentLoaded', build);
})();
