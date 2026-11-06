/* 全球实时地震地图 · 运行时
   依赖：/maps/_shared/thematic/thematic.js（MapLibre 引擎封装）
   逻辑：USGS GeoJSON Feed → 过滤 / 按时间排序 → 更新点源 + 列表 + 统计；每 60s 自动刷新。

   2026-11-06 改动：
   - 去掉震源点的黑色描边（原 circle-stroke-color: rgba(10,14,22,.9)），核心点改为柔光实心点；
   - 新增 quake-ripple-a / quake-ripple-b 两道错相位、不断外扩的光波环，替代原"光晕"点感；
   - 光晕开关（ckGlow）同时控制柔光底晕与光波动效。 */
(function () {
  'use strict';

  var C = window.EQ_CONFIG;
  var app = null;
  var state = { win: 'day', floor: 0, auto: true, glow: true, feats: [], raw: [], timer: null, updTime: 0 };

  /* 震级 → 颜色 / 半径 表达式（多处复用，保证核心点、光波环、列表徽标一致） */
  var MAG_COLOR_EXPR = ['interpolate', ['linear'], ['get', 'mag'],
    0, '#7dd3fc', 2.5, '#fde047', 4.5, '#fb923c', 6, '#ef4444'];
  var MAG_R_EXPR = ['interpolate', ['linear'], ['get', 'mag'],
    0, 3, 2, 5, 4, 9, 6, 15, 8, 26];
  /* zoom 必须是顶层 interpolate 输入（MapLibre 限制）；mag 的插值嵌进每个 zoom 停靠点。
     mult 为外扩倍率：1 = 与核心点同径，随光波动画增大。 */
  function radiusExpr(mult) {
    return ['interpolate', ['linear'], ['zoom'],
      0,  ['*', mult * 0.8, MAG_R_EXPR],
      3,  ['*', mult * 1.1, MAG_R_EXPR],
      6,  ['*', mult * 1.6, MAG_R_EXPR],
      10, ['*', mult * 2.4, MAG_R_EXPR]];
  }
  var RIPPLE_STROKE_W = ['interpolate', ['linear'], ['get', 'mag'],
    0, 1, 2.5, 1.3, 4.5, 1.8, 6, 2.6];

  /* ── 工具 ───────────────────────────────────────────────── */
  function magColor(m) {
    var arr = C.magColors || [];
    for (var i = 0; i < arr.length; i++) if (m >= arr[i].min) return arr[i].color;
    return '#7dd3fc';
  }
  function rMag(m) { return (m == null ? 0 : Math.round(m * 10) / 10); }
  function r1(n) { return (n == null ? '—' : Math.round(n * 10) / 10); }

  function relTime(ms) {
    var d = Date.now() - ms; if (d < 0) d = 0;
    var s = Math.floor(d / 1000);
    if (s < 60) return s + ' 秒前';
    var m = Math.floor(s / 60); if (m < 60) return m + ' 分钟前';
    var h = Math.floor(m / 60); if (h < 24) return h + ' 小时前';
    return Math.floor(h / 24) + ' 天前';
  }
  function absTime(ms) {
    var t = new Date(ms);
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate()) + ' ' + p(t.getHours()) + ':' + p(t.getMinutes());
  }
  function labelWin(w) { return { hour: '1h', day: '24h', week: '7d', month: '30d' }[w] || w; }
  function setStat(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }

  /* ── USGS 拉取 ──────────────────────────────────────────── */
  function load() {
    setStat('fUpd', '加载中…');
    fetch(C.feeds[state.win])
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (geo) {
        state.raw = (geo.features || []).filter(function (f) {
          return f.geometry && f.geometry.coordinates && f.geometry.coordinates.length >= 3;
        });
        state.updTime = Date.now();
        apply();
      })
      .catch(function (err) { setStat('fUpd', '加载失败'); if (window.console) console.error('[earthquake]', err); });
  }

  function apply() {
    var floor = state.floor;
    var feats = state.raw.filter(function (f) {
      var m = f.properties ? f.properties.mag : null;
      return m != null && m >= floor;
    });
    feats.sort(function (a, b) { return (b.properties.time || 0) - (a.properties.time || 0); });
    state.feats = feats;

    if (app && app.map && app.map.getSource('quakes')) {
      app.map.getSource('quakes').setData({ type: 'FeatureCollection', features: feats });
    }

    var max = 0;
    feats.forEach(function (f) { var m = f.properties.mag; if (m != null && m > max) max = m; });
    setStat('fCount', feats.length);
    setStat('fMax', max ? rMag(max) : '—');
    setStat('fUpd', absTime(state.updTime));

    renderList(feats.slice(0, 40));
  }

  /* ── 最近地震列表 ──────────────────────────────────────── */
  function renderList(items) {
    var el = document.getElementById('qlist');
    if (!el) return;
    if (!items.length) { el.innerHTML = '<div class="qempty">该时间窗内暂无符合条件的地震</div>'; return; }
    var html = '';
    items.forEach(function (f, i) {
      var p = f.properties, c = f.geometry.coordinates;
      var m = p.mag != null ? p.mag : 0;
      var col = magColor(m);
      var place = p.place || ('M' + rMag(m) + ' 地震');
      html += '<button type="button" class="qrow" data-i="' + i + '">' +
        '<span class="mbadge" style="background:' + col + '">' + (p.mag != null ? rMag(m) : '?') + '</span>' +
        '<span class="qmeta"><span class="qplace">' + Thematic.esc(place) + '</span>' +
        '<span class="qtime">' + relTime(p.time) + ' · 深 ' + (c[2] != null ? Math.round(c[2]) + ' km' : '—') + '</span></span>' +
        '</button>';
    });
    el.innerHTML = html;
    Array.prototype.forEach.call(el.querySelectorAll('.qrow'), function (btn) {
      btn.addEventListener('click', function () {
        var idx = +btn.dataset.i;
        if (state.feats[idx]) openFeature(state.feats[idx], true);
      });
    });
  }

  /* ── 震源详情卡 ────────────────────────────────────────── */
  function openFeature(f, fly) {
    var p = f.properties, c = f.geometry.coordinates; // [lon, lat, depth]
    var m = p.mag != null ? p.mag : 0;
    var col = magColor(m);
    document.getElementById('dtRole').textContent = (p.mag != null ? ('M' + rMag(m)) : '—') + ' · 地震';
    document.documentElement.style.setProperty('--rc', col);
    var place = p.place || ('M' + rMag(m) + ' 地震');
    document.getElementById('dtName').textContent = place;
    document.getElementById('dtSub').textContent = absTime(p.time) + '（' + relTime(p.time) + '）';
    document.getElementById('dtLb1').textContent = '震级';
    document.getElementById('dtV1').textContent = (p.mag != null ? rMag(m) : '—');
    document.getElementById('dtU1').textContent = '级';
    document.getElementById('dtLb2').textContent = '深度';
    document.getElementById('dtV2').textContent = (c[2] != null ? Math.round(c[2]) : '—');
    document.getElementById('dtU2').textContent = 'km';
    document.getElementById('dtLb3').textContent = '类型';
    document.getElementById('dtV3').textContent = (p.type || '—');
    document.getElementById('dtU3').textContent = '';
    document.getElementById('dtDescLb').textContent = '震中与坐标';
    var d = '经度 <b>' + c[0].toFixed(3) + '°</b> · 纬度 <b>' + c[1].toFixed(3) + '°</b>';
    if (p.tsunami) d += '<br><span style="color:#fb923c">⚠ 已触发海啸预警标记</span>';
    if (p.magType) d += '<br>震级类型：' + Thematic.esc(p.magType);
    document.getElementById('dtDesc').innerHTML = d;
    document.getElementById('dtFooter').innerHTML =
      '<a href="' + Thematic.esc(p.url || '#') + '" target="_blank" rel="noopener">在 USGS 查看事件详情 ↗</a>';

    var det = document.getElementById('detail');
    det.hidden = false;
    document.body.classList.add('has-detail');
    if (fly) app.map.easeTo({ center: [c[0], c[1]], zoom: Math.max(app.map.getZoom(), 5), duration: 800 });
  }
  function closeDetail() {
    var det = document.getElementById('detail');
    det.hidden = true;
    document.body.classList.remove('has-detail');
  }

  /* ── 图例 ──────────────────────────────────────────────── */
  function renderLegend() {
    var el = document.getElementById('legend');
    if (!el) return;
    el.innerHTML =
      '<span class="lg-cap">震级（颜色 / 大小）</span>' +
      '<span class="lg-row"><i style="background:#7dd3fc"></i>&lt; 2.5 微震</span>' +
      '<span class="lg-row"><i style="background:#fde047"></i>2.5 – 4.5 中强</span>' +
      '<span class="lg-row"><i style="background:#fb923c"></i>4.5 – 6 强震</span>' +
      '<span class="lg-row"><i style="background:#ef4444"></i>≥ 6 大震</span>';
  }

  /* ── 光波外扩动画 ──────────────────────────────────────── */
  var RIPPLE_DUR = 2600;          // 单道波完整外扩周期（ms）
  var RIPPLE_RAF = 0, RIPPLE_TOKEN = 0, RIPPLE_LAST = 0;
  function rippleSet(id, phase) {
    var grow = 1 + phase * 3.4;                       // 由 1× 扩到 ~4.4×
    var op = Math.pow(1 - phase, 1.15) * 0.62;        // 由强到淡，越外越淡
    try {
      app.map.setPaintProperty(id, 'circle-radius', radiusExpr(grow));
      app.map.setPaintProperty(id, 'circle-stroke-opacity', op);
    } catch (e) {}
  }
  function rippleFrame(now, token) {
    if (token !== RIPPLE_TOKEN) return;
    if (now - RIPPLE_LAST >= 38) {                    // ~26fps，省渲染开销
      RIPPLE_LAST = now;
      var p = (now % RIPPLE_DUR) / RIPPLE_DUR;
      rippleSet('quake-ripple-a', p);
      rippleSet('quake-ripple-b', (p + 0.5) % 1);     // 错半周，呈连续波列
    }
    RIPPLE_RAF = requestAnimationFrame(function (t) { rippleFrame(t, token); });
  }
  function startRipple() {
    stopRipple();
    if (app && app.map) {
      try { app.map.setLayoutProperty('quake-ripple-a', 'visibility', 'visible'); } catch (e) {}
      try { app.map.setLayoutProperty('quake-ripple-b', 'visibility', 'visible'); } catch (e) {}
    }
    RIPPLE_TOKEN++;
    var token = RIPPLE_TOKEN;
    RIPPLE_LAST = 0;
    RIPPLE_RAF = requestAnimationFrame(function (t) { rippleFrame(t, token); });
  }
  function stopRipple() {
    RIPPLE_TOKEN++;
    if (RIPPLE_RAF) cancelAnimationFrame(RIPPLE_RAF);
    RIPPLE_RAF = 0;
    if (app && app.map) {
      try { app.map.setLayoutProperty('quake-ripple-a', 'visibility', 'none'); } catch (e) {}
      try { app.map.setLayoutProperty('quake-ripple-b', 'visibility', 'none'); } catch (e) {}
    }
  }

  /* ── 自动刷新 ──────────────────────────────────────────── */
  function startAuto() { stopAuto(); state.timer = setInterval(load, C.refreshMs); }
  function stopAuto() { if (state.timer) { clearInterval(state.timer); state.timer = null; } }

  /* ── 交互绑定 ──────────────────────────────────────────── */
  function bindUI() {
    var seg = document.getElementById('segWin');
    seg.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      Array.prototype.forEach.call(seg.querySelectorAll('button'), function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      state.win = b.dataset.v; setStat('fWin', labelWin(state.win)); load();
    });

    var chips = document.getElementById('chipMag');
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      Array.prototype.forEach.call(chips.querySelectorAll('button'), function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      state.floor = parseFloat(b.dataset.v); apply();
    });

    document.getElementById('ckAuto').addEventListener('change', function () {
      state.auto = this.checked; if (state.auto) startAuto(); else stopAuto();
    });
    document.getElementById('ckGlow').addEventListener('change', function () {
      state.glow = this.checked;
      app.setVisible('quake-glow', this.checked);
      if (this.checked) startRipple(); else stopRipple();
    });
  }

  /* ── 启动 ──────────────────────────────────────────────── */
  function onReady(a) {
    app = a;
    renderLegend();
    bindUI();
    load();
    startAuto();
    if (state.glow) startRipple();

    a.map.on('click', 'quake-pt', function (e) {
      if (e.features && e.features[0]) openFeature(e.features[0]);
    });
    a.map.on('mouseenter', 'quake-pt', function () { a.map.getCanvas().style.cursor = 'pointer'; });
    a.map.on('mouseleave', 'quake-pt', function () { a.map.getCanvas().style.cursor = ''; });
  }

  function build() {
    Thematic.create({
      slug: 'earthquake',
      view: C.view,
      bounds: C.bounds,
      extent: C.extent,
      graticuleStep: C.graticuleStep,
      province: false,
      defaultBasemap: C.defaultBasemap,
      basemaps: C.basemaps,
      imgPaint: C.imgPaint,
      sources: { quakes: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } } },
      layers: [
        /* 柔光底晕：仅做氛围，默认开启，可被"震源光晕"开关关掉 */
        {
          id: 'quake-glow', type: 'circle', source: 'quakes',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'],
              0,  ['*', 0.7, MAG_R_EXPR],
              3,  ['*', 1.0, MAG_R_EXPR],
              6,  ['*', 1.5, MAG_R_EXPR],
              10, ['*', 2.2, MAG_R_EXPR]],
            'circle-color': MAG_COLOR_EXPR,
            'circle-blur': 1, 'circle-opacity': 0.20
          }
        },
        /* 光波环 a / b：空心、随震级着色、半径与透明度由 rippleFrame 实时驱动外扩 */
        {
          id: 'quake-ripple-a', type: 'circle', source: 'quakes',
          paint: {
            'circle-radius': radiusExpr(1),
            'circle-color': MAG_COLOR_EXPR, 'circle-opacity': 0,
            'circle-blur': 0,
            'circle-stroke-color': MAG_COLOR_EXPR,
            'circle-stroke-width': RIPPLE_STROKE_W,
            'circle-stroke-opacity': 0.5
          }
        },
        {
          id: 'quake-ripple-b', type: 'circle', source: 'quakes',
          paint: {
            'circle-radius': radiusExpr(1),
            'circle-color': MAG_COLOR_EXPR, 'circle-opacity': 0,
            'circle-blur': 0,
            'circle-stroke-color': MAG_COLOR_EXPR,
            'circle-stroke-width': RIPPLE_STROKE_W,
            'circle-stroke-opacity': 0.5
          }
        },
        /* 核心点：柔光实心、无黑边 */
        {
          id: 'quake-pt', type: 'circle', source: 'quakes',
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'],
              0,  ['*', 0.8, MAG_R_EXPR],
              3,  ['*', 1.1, MAG_R_EXPR],
              6,  ['*', 1.6, MAG_R_EXPR],
              10, ['*', 2.4, MAG_R_EXPR]],
            'circle-color': MAG_COLOR_EXPR,
            'circle-blur': 0.35, 'circle-opacity': 0.98
          }
        }
      ],
      onReady: onReady,
      onClose: closeDetail
    });
  }

  if (document.readyState !== 'loading') build();
  else document.addEventListener('DOMContentLoaded', build);
})();
