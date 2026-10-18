/* 国家真实面积对比 · True Size · 运行时
   依赖：/maps/_shared/thematic/thematic.js（MapLibre 引擎封装）
   逻辑：加载 Natural Earth 国界 → 淡色作参照 → 选中国高亮可拖拽 → 拖动改写坐标
        → 实时算真实面积(球面) + 墨卡托放大倍数(1/cos²φ)。 */
(function () {
  'use strict';

  var C = window.TS_CONFIG;
  var D2R = Math.PI / 180;
  var app = null;
  var state = {
    features: [], byKey: {},
    activeName: null, activeNameZh: null,
    activeHome: null, activeCurrent: null,
    activeAreaKm2: 0,          // 真实面积：选中时按原始几何算一次并锁定，拖动不改变
    activeHomeLat: 0,
    dragging: false, dragStart: null, geomAtStart: null,
    ghostOn: true
  };

  /* ── 几何工具 ───────────────────────────────────────── */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function shiftGeom(geom, dLng, dLat) {
    var g = clone(geom);
    function walk(c) {
      if (typeof c[0] === 'number') { c[0] += dLng; c[1] += dLat; }
      else for (var i = 0; i < c.length; i++) walk(c[i]);
    }
    walk(g.coordinates);
    return g;
  }
  function ringAreaSigned(coords) {
    var n = coords.length; if (n < 3) return 0;
    var R = 6378137, s = 0, i, dl;
    /* 与 _g/conv_countries.py 同一算法：跨反子午线时按「跨线边数」奇偶决定是否 wrap 经度差。
       偶数次（俄罗斯/斐济）要 wrap，否则 -358° 的假跳变会把整条带算进来；
       奇数次（南极洲这类环世界型）不 wrap 才正确。 */
    var crossings = 0;
    for (i = 0; i < n; i++) {
      if (Math.abs(coords[(i + 1) % n][0] - coords[i][0]) > 180) crossings++;
    }
    var wrap = (crossings % 2 === 0);
    for (i = 0; i < n; i++) {
      var p1 = coords[i], p2 = coords[(i + 1) % n];
      dl = p2[0] - p1[0];
      if (wrap) {
        if (dl > 180) dl -= 360;
        else if (dl < -180) dl += 360;
      }
      s += dl * D2R * (Math.sin(p1[1] * D2R) + Math.sin(p2[1] * D2R));
    }
    return (R * R / 2) * s;
  }
  function geomArea(geom) {
    if (!geom) return 0;
    if (geom.type === 'Polygon') {
      var c = geom.coordinates, a = Math.abs(ringAreaSigned(c[0]));
      for (var i = 1; i < c.length; i++) a -= Math.abs(ringAreaSigned(c[i]));
      return a;
    }
    if (geom.type === 'MultiPolygon') {
      var t = 0;
      geom.coordinates.forEach(function (poly) {
        t += Math.abs(ringAreaSigned(poly[0]));
        for (var k = 1; k < poly.length; k++) t -= Math.abs(ringAreaSigned(poly[k]));
      });
      return t;
    }
    return 0;
  }
  function centroidLat(geom) {
    var sum = 0, n = 0;
    (function walk(c) {
      if (typeof c[0] === 'number') { sum += c[1]; n++; }
      else for (var i = 0; i < c.length; i++) walk(c[i]);
    })(geom.coordinates);
    return n ? sum / n : 0;
  }
  function mercatorFactor(latDeg) { var c = Math.cos(latDeg * D2R); return 1 / (c * c); }

  function setStat(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }

  /* ── 数据加载 ──────────────────────────────────────── */
  function loadData() {
    fetch(C.dataUrl)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (fc) {
        state.features = fc.features || [];
        state.features.forEach(function (f) {
          var k = f.properties.name_zh || f.properties.name;
          state.byKey[k] = f;
          state.byKey[f.properties.name] = f;
          /* alias：如中国带「台湾,Taiwan」，让搜索仍能命中 */
          if (f.properties.alias) {
            f.properties.alias.split(',').forEach(function (a) {
              a = a.trim(); if (a) state.byKey[a] = f;
            });
          }
        });
        app.map.getSource('ctx').setData(fc);
        buildQuick();
        if (C.defaultSelect) selectFeature(state.byKey[C.defaultSelect]);
      })
      .catch(function (err) {
        console.error('[truesize] 数据加载失败', err);
        var el = document.getElementById('tsResults');
        if (el) { el.hidden = false; el.innerHTML = '<div class="ts-empty">国界数据加载失败，请刷新</div>'; }
      });
  }

  /* ── 选中国家 ──────────────────────────────────────── */
  function propsMatch(p, q, ql) {
    if (p.name_zh && p.name_zh.indexOf(q) >= 0) return true;
    if (p.name && p.name.toLowerCase().indexOf(ql) >= 0) return true;
    if (p.alias && p.alias.toLowerCase().indexOf(ql) >= 0) return true;
    return false;
  }
  function findFeature(q) {
    if (!q) return null;
    var hit = state.byKey[q]; if (hit) return hit;
    var ql = q.toLowerCase();
    for (var i = 0; i < state.features.length; i++) {
      if (propsMatch(state.features[i].properties, q, ql)) return state.features[i];
    }
    return null;
  }
  function selectFeature(f) {
    if (!f) return;
    state.activeHome = clone(f.geometry);
    state.activeCurrent = clone(f.geometry);
    state.activeName = f.properties.name;
    state.activeNameZh = f.properties.name_zh;
    /* 真实面积是国家的固有属性，与它被拖到哪里无关：
       优先用数据里预置的 area_km2（在反子午线切割之前按原始国界算好），
       没有则现算原始几何。绝不能用 activeCurrent 实时算——同一形状沿经线
       平移纬度后，球面覆盖面积在数学上会变（经线收敛），读数就会随拖动漂移。 */
    state.activeAreaKm2 = (f.properties.area_km2 != null)
      ? f.properties.area_km2
      : geomArea(f.geometry) / 1e6;
    state.activeHomeLat = centroidLat(f.geometry);
    app.map.getSource('active').setData({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: f.geometry }] });
    updateGhost();
    openDetail();
    updateStats();
  }
  function updateGhost() {
    var src = app.map.getSource('ghost');
    if (!src) return;
    if (state.ghostOn && state.activeHome) {
      src.setData({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: state.activeHome }] });
    } else {
      src.setData({ type: 'FeatureCollection', features: [] });
    }
  }

  /* ── 详情卡 + 实时读数 ─────────────────────────────── */
  function openDetail() {
    var det = document.getElementById('detail');
    document.getElementById('dtRole').textContent = '国家面积';
    document.documentElement.style.setProperty('--rc', '#ffd98a');
    document.getElementById('dtName').textContent = state.activeNameZh || state.activeName;
    document.getElementById('dtSub').textContent = state.activeName || '';
    det.hidden = false;
    document.body.classList.add('has-detail');
  }
  function setMetric(lb, v, u) {
    // 按顺序填三个 metric
    var idx = setMetric._i != null ? setMetric._i : 0;
    setStat('dtLb' + (idx + 1), lb);
    setStat('dtV' + (idx + 1), v);
    setStat('dtU' + (idx + 1), u);
    setMetric._i = idx + 1;
  }
  function updateStats() {
    if (!state.activeCurrent) return;
    var km2 = state.activeAreaKm2;              // 锁定值：选中时算一次，拖动不变
    var lat = centroidLat(state.activeCurrent);
    var K = mercatorFactor(lat);
    var homeLat = state.activeHomeLat;
    var homeK = mercatorFactor(homeLat);
    var ratio = K / homeK;

    setMetric._i = 0;
    setMetric('真实面积', Thematic.fmt(Math.round(km2)), 'km²');
    var ns = lat >= 0 ? 'N' : 'S';
    setMetric('中心纬度', Math.abs(lat).toFixed(1) + '°', ns);
    setMetric('墨卡托放大', '×' + (K >= 10 ? K.toFixed(0) : K.toFixed(1)), '（相对赤道）');

    var rel = ratio > 1.02 ? '更大' : (ratio < 0.98 ? '更小' : '差不多');
    var desc = '真实面积恒定。把它拖到不同纬度，墨卡托投影会让它看起来<b>' + rel + '</b>：当前相对「老家」（' +
      Math.abs(homeLat).toFixed(1) + '°' + (homeLat >= 0 ? 'N' : 'S') + '）约 <b>×' + ratio.toFixed(2) + '</b> 倍。' +
      '在纬度 φ，墨卡托把面积放大约 1/cos²φ 倍。';
    document.getElementById('dtDesc').innerHTML = desc;
    document.getElementById('dtFooter').textContent = '按住国家拖动以对比 · 点 ✕ 关闭';
  }

  /* ── 快捷按钮 / 搜索 ──────────────────────────────── */
  function buildQuick() {
    var box = document.getElementById('tsQuick');
    if (!box) return;
    box.innerHTML = '';
    (C.quick || []).forEach(function (name) {
      var f = state.byKey[name];
      if (!f) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ts-chip';
      b.textContent = f.properties.name_zh || f.properties.name;
      b.addEventListener('click', function () { selectFeature(f); });
      box.appendChild(b);
    });
  }
  function bindSearch() {
    var inp = document.getElementById('tsSearch');
    var res = document.getElementById('tsResults');
    if (!inp || !res) return;
    inp.addEventListener('input', function () {
      var q = inp.value.trim();
      if (!q) { res.hidden = true; res.innerHTML = ''; return; }
      var matches = [];
      var ql = q.toLowerCase();
      for (var i = 0; i < state.features.length && matches.length < 12; i++) {
        if (propsMatch(state.features[i].properties, q, ql)) matches.push(state.features[i]);
      }
      if (!matches.length) { res.hidden = false; res.innerHTML = '<div class="ts-empty">未找到匹配国家</div>'; return; }
      res.hidden = false;
      res.innerHTML = '';
      matches.forEach(function (f) {
        var d = document.createElement('button');
        d.type = 'button'; d.className = 'ts-res';
        d.innerHTML = '<b>' + Thematic.esc(f.properties.name_zh || f.properties.name) + '</b><span>' + Thematic.esc(f.properties.name || '') + '</span>';
        d.addEventListener('click', function () { selectFeature(f); inp.value = f.properties.name_zh || f.properties.name; res.hidden = true; });
        res.appendChild(d);
      });
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { var first = res.querySelector('.ts-res'); if (first) first.click(); }
    });
    document.addEventListener('click', function (e) {
      if (inp && res && !inp.contains(e.target) && !res.contains(e.target)) res.hidden = true;
    });
  }

  /* ── 拖拽 ──────────────────────────────────────────── */
  function bindDrag() {
    var map = app.map;
    map.on('mousedown', function (e) {
      var hit = map.queryRenderedFeatures(e.point, { layers: ['active-fill'] });
      if (hit && hit.length) {
        state.dragging = true;
        state.dragStart = e.lngLat;
        state.geomAtStart = clone(state.activeCurrent);
        map.dragPan.disable();
        map.getCanvas().style.cursor = 'grabbing';
      }
    });
    map.on('mousemove', function (e) {
      if (state.dragging) {
        var dLng = e.lngLat.lng - state.dragStart.lng;
        var dLat = e.lngLat.lat - state.dragStart.lat;
        state.activeCurrent = shiftGeom(state.geomAtStart, dLng, dLat);
        app.map.getSource('active').setData({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: state.activeCurrent }] });
        updateStats();
        return;
      }
      var over = map.queryRenderedFeatures(e.point, { layers: ['active-fill', 'ctx-fill'] });
      map.getCanvas().style.cursor = (over && over.length) ? 'pointer' : '';
    });
    function endDrag() {
      if (state.dragging) {
        state.dragging = false;
        map.dragPan.enable();
        map.getCanvas().style.cursor = '';
      }
    }
    map.on('mouseup', endDrag);
    map.on('mouseout', endDrag);
  }

  /* ── 地图点选 ──────────────────────────────────────── */
  function bindPick() {
    app.map.on('click', function (e) {
      if (state.dragging) return;
      var hit = app.map.queryRenderedFeatures(e.point, { layers: ['ctx-fill'] });
      if (hit && hit.length) {
        // 取属性回查要素
        var nm = hit[0].properties && (hit[0].properties.name_zh || hit[0].properties.name);
        var f = state.byKey[nm];
        if (f && f.properties.name !== state.activeName) selectFeature(f);
      }
    });
  }

  /* ── 交互绑定 ──────────────────────────────────────── */
  function bindUI() {
    bindSearch();
    document.getElementById('btnReset').addEventListener('click', function () {
      if (!state.activeHome) return;
      state.activeCurrent = clone(state.activeHome);
      app.map.getSource('active').setData({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: state.activeCurrent }] });
      updateStats();
    });
    document.getElementById('ckGhost').addEventListener('change', function () {
      state.ghostOn = this.checked; updateGhost();
    });
  }

  function renderLegend() {
    var el = document.getElementById('legend');
    if (!el) return;
    el.innerHTML =
      '<span class="lg-cap">图层</span>' +
      '<span class="lg-row"><i style="background:rgba(245,181,68,.34);border:1px solid #ffd98a"></i>选中国家（可拖拽）</span>' +
      '<span class="lg-row"><i style="background:none;border:1px dashed rgba(245,181,68,.6)"></i>原位置虚影</span>' +
      '<span class="lg-row"><i style="background:rgba(120,150,190,.12);border:1px solid rgba(150,180,220,.3)"></i>其他国家（参照）</span>';
  }

  /* ── 启动 ──────────────────────────────────────────── */
  function onReady(a) {
    app = a;
    renderLegend();
    bindUI();
    bindDrag();
    bindPick();
    loadData();
  }

  function build() {
    Thematic.create({
      slug: 'truesize',
      view: C.view,
      bounds: C.bounds,
      extent: C.extent,
      graticuleStep: C.graticuleStep,
      province: false,
      defaultBasemap: C.defaultBasemap,
      sources: {
        ctx: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
        active: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
        ghost: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } }
      },
      layers: [
        { id: 'ctx-fill', type: 'fill', source: 'ctx', paint: { 'fill-color': C.ctxFill, 'fill-outline-color': C.ctxStroke } },
        { id: 'ghost-line', type: 'line', source: 'ghost', paint: { 'line-color': C.ghostStroke, 'line-width': 1.4, 'line-dasharray': [2, 2], 'line-opacity': 0.8 } },
        { id: 'active-fill', type: 'fill', source: 'active', paint: { 'fill-color': C.activeFill, 'fill-outline-color': C.activeStroke, 'fill-opacity': 1 } },
        { id: 'active-line', type: 'line', source: 'active', paint: { 'line-color': C.activeStroke, 'line-width': 1.6, 'line-opacity': 0.95 } }
      ],
      onReady: onReady,
      onClose: function () {
        var det = document.getElementById('detail');
        det.hidden = true; document.body.classList.remove('has-detail');
        state.activeName = null; state.activeHome = null; state.activeCurrent = null;
        state.activeAreaKm2 = 0; state.activeHomeLat = 0;
        app.map.getSource('active').setData({ type: 'FeatureCollection', features: [] });
        updateGhost();
      }
    });
  }

  if (document.readyState !== 'loading') build();
  else document.addEventListener('DOMContentLoaded', build);
})();
