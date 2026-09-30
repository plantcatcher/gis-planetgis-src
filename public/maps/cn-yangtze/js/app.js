/* 万里长江 · 一江八脉 — 互动逻辑
 *
 * 结构：
 *   1. 底图与样式
 *   2. 数据装载与图层
 *   3. 界面渲染（统计 / 八脉对照 / 水系之最 / 图例 / 导航条 / 标注）
 *   4. 选中态与视觉特效（脉冲光晕 + 水流描边动画）
 *   5. 图层与底图控制、移动端抽屉
 *
 * 说明：本页不加交互埋点（主站约定），只保留 ga-bridge 供主站接管。
 */
(function () {
  'use strict';

  var CFG = window.YANGTZE_CONFIG;
  var DATA_URL = 'data/rivers.json';
  var PROV_URL = '/maps/_shared/china-provinces.json';

  /* ── 1. 底图与样式 ───────────────────────────────────────── */
  // 高德免 key 瓦片（GCJ-02，带 CORS），subdomain 01~04 负载均衡
  function amapTiles(styleId) {
    return ['01', '02', '03', '04'].map(function (s) {
      return 'https://wprd' + s + '.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=' + styleId;
    });
  }

  /* 经纬网格（每 2°，仅覆盖长江流域范围） */
  function graticuleFC() {
    var feats = [], lng, lat, c;
    for (lng = 88; lng <= 124; lng += 2) {
      c = []; for (lat = 22; lat <= 38; lat += 0.5) c.push([lng, lat]);
      feats.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: c } });
    }
    for (lat = 22; lat <= 38; lat += 2) {
      c = []; for (lng = 88; lng <= 124; lng += 0.5) c.push([lng, lat]);
      feats.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: c } });
    }
    return { type: 'FeatureCollection', features: feats };
  }

  var style = {
    version: 8,
    sources: {
      amap_vec: { type: 'raster', tiles: amapTiles(7), tileSize: 256, attribution: '高德地图' },
      amap_img: { type: 'raster', tiles: amapTiles(6), tileSize: 256, attribution: '高德地图' },
      provinces: { type: 'geojson', data: PROV_URL },
      graticule: { type: 'geojson', data: graticuleFC() },
      rivers: { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, promoteId: 'code' },
      sel: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
      flow: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } }
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#070d18' } },
      { id: 'amap-vec', type: 'raster', source: 'amap_vec', layout: { visibility: 'none' } },
      { id: 'amap-img', type: 'raster', source: 'amap_img', layout: { visibility: 'none' } },
      { id: 'graticule', type: 'line', source: 'graticule', layout: { visibility: 'none' },
        paint: { 'line-color': '#7fa4cc', 'line-width': 0.5, 'line-opacity': 0.18 } },
      { id: 'province-line', type: 'line', source: 'provinces',
        paint: { 'line-color': '#b9cbe2', 'line-width': 0.7, 'line-opacity': 0.28 } },
      /* 河线：深色描边打底，让彩色线在影像底图上也能读出来 */
      { id: 'river-casing', type: 'line', source: 'rivers',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#03101d',
          'line-opacity': 0.85,
          'line-width': ['interpolate', ['linear'], ['zoom'],
            4, ['case', ['==', ['get', 'role'], 'mainstream'], 7, 5],
            9, ['case', ['==', ['get', 'role'], 'mainstream'], 15, 11]]
        } },
      { id: 'river-line', type: 'line', source: 'rivers',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': ['case',
            ['boolean', ['feature-state', 'hover'], false], '#ffffff',
            ['get', 'color']],
          'line-width': ['interpolate', ['linear'], ['zoom'],
            4, ['case', ['==', ['get', 'role'], 'mainstream'], 4.2, 2.6],
            9, ['case', ['==', ['get', 'role'], 'mainstream'], 10, 7]],
          'line-opacity': 0.94
        } },
      /* 选中河流的外发光（宽度 / 透明度由 rAF 驱动做脉冲） */
      { id: 'river-glow', type: 'line', source: 'sel',
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint: { 'line-color': ['get', 'color'], 'line-width': 12, 'line-opacity': 0, 'line-blur': 7 } },
      /* 选中河流本体：单独画在最上层，保证不被其他河压住 */
      { id: 'river-sel', type: 'line', source: 'sel',
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['interpolate', ['linear'], ['zoom'],
            4, ['case', ['==', ['get', 'role'], 'mainstream'], 6, 4.2],
            9, ['case', ['==', ['get', 'role'], 'mainstream'], 13, 9]],
          'line-opacity': 1
        } },
      /* 水流描边动画：沿河道逐渐画出来的一道亮线 */
      { id: 'river-flow', type: 'line', source: 'flow',
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'none' },
        paint: {
          'line-color': ['case', ['==', ['get', 'role'], 'mainstream'], '#fff6d8', '#ffffff'],
          'line-width': ['interpolate', ['linear'], ['zoom'],
            4, ['case', ['==', ['get', 'role'], 'mainstream'], 3.2, 2.4],
            9, ['case', ['==', ['get', 'role'], 'mainstream'], 6, 4.6]],
          'line-opacity': 0.96,
          'line-blur': 0.6
        } }
    ]
  };

  var map = new maplibregl.Map({
    container: 'map',
    style: style,
    center: CFG.view.center,
    zoom: CFG.view.zoom,
    minZoom: CFG.minZoom,
    maxZoom: CFG.maxZoom,
    attributionControl: false
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 110, unit: 'metric' }), 'bottom-right');
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
  // 手机上关掉双指旋转：误触旋转比“能旋转”更常见
  if (isMobile() && map.touchZoomRotate) map.touchZoomRotate.disableRotation();
  window.__map = map;   // 调试用

  /* 视野 padding：桌面端给左侧介绍栏与右侧导航条留位，移动端给上下浮层留位。
     移动端详情卡是整宽浮层，高度不定，取实时高度做上边距；
     横屏矮屏下详情卡改停右侧（与样式表保持一致），因此改留右边距。 */
  function isMobile() { return window.innerWidth <= 900; }
  function isShortScreen() { return isMobile() && window.innerHeight <= 520; }
  function viewPadding(withDetail) {
    var hasCard = withDetail && !el.detail.hidden;
    if (isMobile()) {
      if (isShortScreen()) {
        return { left: 18, right: hasCard ? Math.round(el.detail.getBoundingClientRect().width) + 26 : 18, top: 18, bottom: 168 };
      }
      var top = 96;
      if (hasCard) top = Math.round(el.detail.getBoundingClientRect().height) + 30;
      return { left: 18, right: 18, top: Math.min(top, Math.round(window.innerHeight * 0.5)), bottom: 168 };
    }
    return { left: 392, right: 372, top: 78, bottom: 172 };
  }

  var labelsEl = document.getElementById('labels');

  /* ── 2. 状态 ─────────────────────────────────────────────── */
  var rivers = [];                 // GeoJSON 要素数组（已注入 color）
  var byCode = {};                 // code -> 要素
  var labelPts = {};               // code -> [lng,lat] 标注锚点
  var selected = '';               // 当前选中 code，'' = 未选
  var metricKey = CFG.metrics[0].key;
  var hovered = '';

  var el = {
    intro: document.getElementById('intro'),
    introBar: document.getElementById('introBar'),
    introBarText: document.getElementById('introBarText'),
    introBody: document.getElementById('introBody'),
    fMain: document.getElementById('fMain'),
    fCount: document.getElementById('fCount'),
    fSum: document.getElementById('fSum'),
    tabs: document.getElementById('metricTabs'),
    chart: document.getElementById('chart'),
    extremes: document.getElementById('extremes'),
    metricNote: document.getElementById('metricNote'),
    detail: document.getElementById('detail'),
    dtRole: document.getElementById('dtRole'),
    dtName: document.getElementById('dtName'),
    dtTagline: document.getElementById('dtTagline'),
    dtLen: document.getElementById('dtLen'),
    dtArea: document.getElementById('dtArea'),
    dtDis: document.getElementById('dtDis'),
    dtDesc: document.getElementById('dtDesc'),
    dtFooter: document.getElementById('dtFooter'),
    strip: document.getElementById('strip'),
    legend: document.getElementById('legend'),
    btnOverview: document.getElementById('btnOverview')
  };

  function fmt(n, d) {
    var v = Number(n) || 0;
    var s = v.toFixed(d === undefined ? 0 : d);
    var parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function colorOf(code) { return (CFG.rivers[code] || {}).color || '#8fb8e8'; }
  function tribs() { return rivers.filter(function (f) { return f.properties.role === 'tributary'; }); }

  /* ── 3. 界面渲染 ─────────────────────────────────────────── */
  function renderFacts() {
    var main = byCode['yangtze-mainstream'];
    var t = tribs();
    var sum = t.reduce(function (a, f) { return a + f.properties.length_km; }, 0);
    el.fMain.textContent = fmt(main ? main.properties.length_km : 0);
    el.fCount.textContent = t.length;
    el.fSum.textContent = fmt(sum);
  }

  function renderTabs() {
    el.tabs.innerHTML = CFG.metrics.map(function (m) {
      return '<button type="button" data-k="' + m.key + '"' +
        (m.key === metricKey ? ' class="active"' : '') + '>' + m.label + '</button>';
    }).join('');
    el.tabs.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      metricKey = b.dataset.k; renderTabs(); renderChart();
    };
  }

  function renderChart() {
    var list = tribs().slice().sort(function (a, b) {
      return b.properties[metricKey] - a.properties[metricKey];
    });
    var max = list.reduce(function (a, f) { return Math.max(a, Number(f.properties[metricKey]) || 0); }, 0);
    el.chart.innerHTML = list.map(function (f) {
      var p = f.properties;
      var v = Number(p[metricKey]) || 0;
      var w = max > 0 ? (v / max * 100) : 0;
      return '<button type="button" class="chart-row' + (f.properties.code === selected ? ' active' : '') +
        '" data-code="' + p.code + '">' +
        '<span class="nm">' + esc(p.name) + '</span>' +
        '<span class="bar"><i style="width:' + w.toFixed(2) + '%;background:' + colorOf(p.code) + '"></i></span>' +
        '<span class="vl">' + fmt(v) + '</span></button>';
    }).join('');
    el.chart.onclick = function (e) {
      var b = e.target.closest('.chart-row'); if (!b) return;
      selectRiver(b.dataset.code, true);
    };
  }

  function renderExtremes() {
    var t = tribs();
    var rows = CFG.metrics.map(function (m) {
      var best = t.reduce(function (a, f) {
        return (Number(f.properties[m.key]) || 0) > (Number(a.properties[m.key]) || 0) ? f : a;
      }, t[0]);
      return { label: { length_km: '最长支流', upstream_area_sqkm: '汇水最广', estimated_discharge_cms: '流量最大' }[m.key], f: best, unit: m.unit, key: m.key };
    }).filter(function (r) { return r.f; });
    el.extremes.innerHTML = rows.map(function (r) {
      return '<button type="button" data-code="' + r.f.properties.code + '">' +
        '<span>' + r.label + '</span>' +
        '<span>' + esc(r.f.properties.name) + ' <b>' + fmt(r.f.properties[r.key]) + '</b><em>' + r.unit + '</em></span>' +
        '</button>';
    }).join('');
    el.extremes.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      selectRiver(b.dataset.code, true);
    };
  }

  function renderLegend() {
    el.legend.innerHTML = CFG.groups.map(function (g) {
      return '<span><em>' + g.codes.map(function (c) {
        return '<i style="background:' + colorOf(c) + '"></i>';
      }).join('') + '</em>' + g.name + '</span>';
    }).join('');
  }

  function renderStrip() {
    var list = CFG.order.map(function (c) { return byCode[c]; }).filter(Boolean);
    el.strip.innerHTML = list.map(function (f) {
      var p = f.properties;
      var cfg = CFG.rivers[p.code] || {};
      return '<button type="button" class="' + (p.role === 'mainstream' ? 'mainstream' : '') +
        (p.code === selected ? ' active' : '') + '" data-code="' + p.code + '"' +
        ' style="--rc:' + colorOf(p.code) + '" title="' + esc(cfg.tagline || p.name) + '"' +
        ' aria-label="' + esc(p.name) + '">' +
        '<i></i><span><b>' + esc(p.name) + '</b><small>' + fmt(p.length_km) + '</small></span></button>';
    }).join('');
    el.strip.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      collapseDrawer();
      selectRiver(b.dataset.code, true);
    };
  }

  function renderDetail(f) {
    /* 移动端：详情卡打开时用 body 标记收起图层面板（两者都贴顶会互相遮挡） */
    document.body.classList.toggle('has-detail', !!f);
    if (!f) { el.detail.hidden = true; return; }
    var p = f.properties;
    var cfg = CFG.rivers[p.code] || {};
    var c = colorOf(p.code);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', c);
    el.dtRole.textContent = cfg.badge || (p.role === 'mainstream' ? 'MAINSTREAM' : 'MAJOR TRIBUTARY');
    el.dtName.textContent = p.name;
    el.dtTagline.textContent = cfg.tagline || '';
    el.dtLen.textContent = fmt(p.length_km);
    el.dtArea.textContent = fmt(p.upstream_area_sqkm);
    el.dtDis.textContent = fmt(p.estimated_discharge_cms);
    el.dtDesc.textContent = cfg.desc || '';
    var src = p.source_point, mouth = p.mouth_point;
    el.dtFooter.innerHTML =
      '<span>源头 <b>' + Math.abs(src[1]).toFixed(2) + '°N, ' + Math.abs(src[0]).toFixed(2) + '°E</b></span>' +
      '<span>' + (p.into_lake ? '入' + p.into_lake : '汇入长江') +
      ' <b>' + Math.abs(mouth[1]).toFixed(2) + '°N, ' + Math.abs(mouth[0]).toFixed(2) + '°E</b></span>' +
      '<span>河段 <b>' + fmt(p.reach_count) + '</b> 段</span>';
  }

  /* 标注：按 config 的里程占比取锚点，投影 + 视野剔除 */
  function pickLabelPoint(coords, frac) {
    var acc = [0], i, lo1, la1, lo2, la2, d;
    for (i = 1; i < coords.length; i++) {
      lo1 = coords[i - 1][0] * Math.PI / 180; la1 = coords[i - 1][1] * Math.PI / 180;
      lo2 = coords[i][0] * Math.PI / 180; la2 = coords[i][1] * Math.PI / 180;
      var h = Math.sin((la2 - la1) / 2) * Math.sin((la2 - la1) / 2) +
        Math.cos(la1) * Math.cos(la2) * Math.sin((lo2 - lo1) / 2) * Math.sin((lo2 - lo1) / 2);
      acc.push(acc[i - 1] + 2 * Math.asin(Math.min(1, Math.sqrt(h))));
    }
    var target = acc[acc.length - 1] * frac, best = 0, bd = Infinity;
    for (i = 0; i < acc.length; i++) {
      d = Math.abs(acc[i] - target); if (d < bd) { bd = d; best = i; }
    }
    return coords[best];
  }

  var rafPending = false;
  function requestLabelUpdate() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () { rafPending = false; updateLabels(); });
  }
  function updateLabels() {
    if (!document.getElementById('ckLabel').checked) { labelsEl.innerHTML = ''; return; }
    var bd = map.getBounds();
    var html = '';
    CFG.order.forEach(function (code) {
      var ll = labelPts[code]; if (!ll) return;
      if (ll[0] < bd.getWest() || ll[0] > bd.getEast() || ll[1] < bd.getSouth() || ll[1] > bd.getNorth()) return;
      var p = map.project(ll);
      var cfg = CFG.rivers[code] || {};
      html += '<div class="rlabel' + (code === 'yangtze-mainstream' ? ' is-main' : '') +
        (code === selected ? ' is-active' : '') + '" style="left:' + p.x.toFixed(1) + 'px;top:' + p.y.toFixed(1) +
        'px;--c:' + colorOf(code) + '">' + esc(cfg.name || code) + '</div>';
    });
    labelsEl.innerHTML = html;
  }

  /* ── 4. 选中与特效 ───────────────────────────────────────── */
  var FX = { raf: 0, token: 0, slices: [], sliceIdx: -1, flowSrc: null };

  function stopFx() {
    FX.token++;
    if (FX.raf) cancelAnimationFrame(FX.raf);
    FX.raf = 0; FX.slices = []; FX.sliceIdx = -1;
  }

  function setGlow(f, width, opacity) {
    var has = !!f;
    map.setLayoutProperty('river-glow', 'visibility', has ? 'visible' : 'none');
    map.setLayoutProperty('river-sel', 'visibility', has ? 'visible' : 'none');
    if (!has) return;
    map.setPaintProperty('river-glow', 'line-width', width);
    map.setPaintProperty('river-glow', 'line-opacity', opacity);
  }

  /* 沿里程把线切成 n 段，用于「水流描边」逐帧揭示 */
  function buildSlices(coords, n) {
    var total = 0, acc = [0], i;
    for (i = 1; i < coords.length; i++) {
      var dx = coords[i][0] - coords[i - 1][0], dy = coords[i][1] - coords[i - 1][1];
      total += Math.sqrt(dx * dx + dy * dy); acc.push(total);
    }
    var out = [], k = 1;
    for (i = 0; i < n; i++) {
      var t = total * (i + 1) / n;
      while (k < acc.length - 1 && acc[k] < t) k++;
      out.push(coords.slice(0, Math.max(2, k + 1)));
    }
    return out;
  }

  function flow(f, duration) {
    var coords = f.geometry.coordinates;
    var n = coords.length > 1200 ? 34 : 24;
    FX.slices = buildSlices(coords, n);
    FX.sliceIdx = -1;
    map.setLayoutProperty('river-flow', 'visibility', 'visible');
    var t0 = performance.now();
    var token = FX.token;
    function frame(now) {
      if (token !== FX.token) return;
      var p = Math.min((now - t0) / duration, 1);
      var idx = Math.min(FX.slices.length - 1, Math.floor(p * FX.slices.length));
      if (idx !== FX.sliceIdx) {
        FX.sliceIdx = idx;
        map.getSource('flow').setData({
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: f.properties, geometry: { type: 'LineString', coordinates: FX.slices[idx] } }]
        });
      }
      if (p < 1) {
        FX.raf = requestAnimationFrame(frame);
      } else {
        FX.raf = 0;
        // 描边画完后淡出，只留选中发光
        setTimeout(function () {
          if (token === FX.token) map.setLayoutProperty('river-flow', 'visibility', 'none');
        }, 420);
      }
    }
    FX.raf = requestAnimationFrame(frame);
  }

  function pulse(f, playFlow) {
    stopFx();
    var token = FX.token;
    setGlow(f, 12, 0);
    map.getSource('flow').setData({ type: 'FeatureCollection', features: [] });
    map.setLayoutProperty('river-flow', 'visibility', 'none');

    var t0 = performance.now(), DUR = 1700;
    var wBase = f.properties.role === 'mainstream' ? 15 : 11.4;
    (function step(now) {
      if (token !== FX.token) return;
      var p = Math.min((now - t0) / DUR, 1);
      // 0.16 + 0.84 * sin²(3πp)：三次呼吸式脉冲
      var e = 0.16 + 0.84 * Math.pow(Math.sin(p * Math.PI * 3), 2);
      setGlow(f, wBase + e * 8, 0.1 + e * 0.4);
      if (p < 1) { FX.raf = requestAnimationFrame(step); return; }
      FX.raf = 0;
      setGlow(f, wBase + 2.6, 0.32);
      if (playFlow) flow(f, f.properties.role === 'mainstream' ? 2100 : 1400);
    })(t0);
  }

  /* 选中时把其余河流压暗 —— 注意是「按要素」压暗，选中的那条保持全亮。
     用 get/code 对比选中 code 构造表达式，选中变化时整条表达式重建。 */
  function opExpr(full, dim, selFull) {
    if (!selected) return full;
    return ['case',
      ['==', ['get', 'code'], selected], selFull,
      ['boolean', ['feature-state', 'hover'], false], dim + 0.5,
      dim];
  }
  function applySelectionStyles() {
    map.setPaintProperty('river-line', 'line-opacity', opExpr(0.94, 0.28, 0.92));
    map.setPaintProperty('river-casing', 'line-opacity', opExpr(0.85, 0.38, 0.9));
  }

  function fitTo(f) {
    var b = new maplibregl.LngLatBounds();
    f.geometry.coordinates.forEach(function (c) { b.extend(c); });
    map.fitBounds(b, { padding: viewPadding(true), maxZoom: 7.6, duration: 720 });
  }

  /* 水系总览：把九条河一起框进视野 */
  function fitOverview(animate) {
    var b = new maplibregl.LngLatBounds();
    var n = 0;
    rivers.forEach(function (f) {
      f.geometry.coordinates.forEach(function (c) { b.extend(c); n++; });
    });
    if (!n) return;
    map.fitBounds(b, { padding: viewPadding(false), duration: animate ? 760 : 0 });
  }

  /* 移动端：收起底部介绍抽屉（选中河流时要把地图让出来） */
  function setDrawer(collapsed) {
    el.intro.classList.toggle('is-collapsed', collapsed);
    el.introBarText.textContent = collapsed ? '展开' : '收起';
    el.introBar.setAttribute('aria-expanded', String(!collapsed));
  }
  function collapseDrawer() {
    if (isMobile() && !el.intro.classList.contains('is-collapsed')) setDrawer(true);
  }

  function syncUI() {
    Array.prototype.forEach.call(document.querySelectorAll('.chart-row'), function (b) {
      b.classList.toggle('active', b.dataset.code === selected);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.extremes button'), function (b) {
      b.classList.toggle('active', b.dataset.code === selected);
    });
    var stripBtns = document.querySelectorAll('.strip button');
    Array.prototype.forEach.call(stripBtns, function (b) {
      b.classList.toggle('active', b.dataset.code === selected);
    });
    /* 移动端导航条是横向滚动条，把选中项滚进可见范围 */
    if (isMobile() && selected) {
      var ab = document.querySelector('.strip button.active');
      if (ab && ab.scrollIntoView) ab.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }

  function selectRiver(code, move) {
    if (!byCode[code]) return;
    selected = code;
    var f = byCode[code];
    map.getSource('sel').setData({ type: 'FeatureCollection', features: [f] });
    applySelectionStyles();
    renderDetail(f);
    syncUI();
    updateLabels();
    pulse(f, true);
    if (move) fitTo(f);
  }

  function clearSelection() {
    selected = '';
    stopFx();
    map.getSource('sel').setData({ type: 'FeatureCollection', features: [] });
    map.getSource('flow').setData({ type: 'FeatureCollection', features: [] });
    setGlow(null, 12, 0);
    map.setLayoutProperty('river-flow', 'visibility', 'none');
    map.setPaintProperty('river-line', 'line-opacity', 0.94);
    map.setPaintProperty('river-casing', 'line-opacity', 0.85);
    renderDetail(null);
    syncUI();
    updateLabels();
  }

  /* ── 悬停 / 点选命中 ──────────────────────────────────────── */
  /* 河线在手机上只有 3~4 CSS px 宽，单点查询基本点不中；
     触屏时用一个 14px 半径的方框做容差查询，桌面端保持精确单点。 */
  function tapPad() { return isMobile() ? 14 : 0; }
  function pickRiver(pt, pad) {
    var box = pad > 0 ? [[pt.x - pad, pt.y - pad], [pt.x + pad, pt.y + pad]] : pt;
    var fs = map.queryRenderedFeatures(box, { layers: ['river-line'] });
    return fs.length ? fs[0] : null;
  }

  var tip = document.createElement('div');
  tip.className = 'rtip';
  tip.style.cssText = 'position:absolute;z-index:9;pointer-events:none;display:none;' +
    'padding:5px 9px;border-radius:7px;font-size:11.5px;line-height:1.45;color:#e6edf7;' +
    'background:rgba(6,11,20,.92);border:1px solid rgba(148,178,214,.3);white-space:nowrap;' +
    'transform:translate(-50%,-140%);backdrop-filter:blur(6px);box-shadow:0 6px 20px rgba(0,0,0,.5)';
  document.body.appendChild(tip);

  function bindHover() {
    map.on('mousemove', function (e) {
      var fs = map.queryRenderedFeatures(e.point, { layers: ['river-line'] });
      var f = fs.length ? fs[0] : null;
      if (f) {
        map.getCanvas().style.cursor = 'pointer';
        if (hovered !== f.properties.code) {
          if (hovered) map.setFeatureState({ source: 'rivers', id: hovered }, { hover: false });
          hovered = f.properties.code;
          map.setFeatureState({ source: 'rivers', id: hovered }, { hover: true });
        }
        tip.innerHTML = esc(f.properties.name) + ' <span style="color:#8fa3bd">' + fmt(f.properties.length_km) + ' 千米</span>';
        tip.style.display = 'block';
        tip.style.left = e.point.x + 'px';
        tip.style.top = e.point.y + 'px';
      } else {
        map.getCanvas().style.cursor = '';
        if (hovered) { map.setFeatureState({ source: 'rivers', id: hovered }, { hover: false }); hovered = ''; }
        tip.style.display = 'none';
      }
    });
    map.on('click', function (e) {
      var f = pickRiver(e.point, tapPad());
      if (f) {
        collapseDrawer();          // 手机上先把底部抽屉收起，让出地图
        selectRiver(f.properties.code, true);
      } else {
        clearSelection();
      }
    });
    map.on('mouseleave', function () {
      if (hovered) { map.setFeatureState({ source: 'rivers', id: hovered }, { hover: false }); hovered = ''; }
      tip.style.display = 'none';
    });
  }

  /* ── 5. 控制 ─────────────────────────────────────────────── */
  function setVis(id, on) {
    if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');
  }
  function setBasemap(mode) {
    setVis('amap-img', mode === 'img');
    setVis('amap-vec', mode === 'vec');
    var opts = document.querySelectorAll('.bm-opt');
    for (var i = 0; i < opts.length; i++) {
      var r = opts[i].querySelector('input');
      opts[i].classList.toggle('active', r && r.checked);
    }
  }

  function bindControls() {
    var bms = document.querySelectorAll('input[name="basemap"]');
    for (var i = 0; i < bms.length; i++) {
      bms[i].addEventListener('change', function () { setBasemap(this.value); });
    }
    // 移动端：首屏收起介绍抽屉与图层面板，把地图让出来
    if (isMobile()) {
      setDrawer(true);
      document.getElementById('panelBody').classList.add('collapsed');
      document.getElementById('panelToggle').textContent = '＋';
    }
    document.getElementById('ckLabel').addEventListener('change', updateLabels);
    document.getElementById('ckBorder').addEventListener('change', function () { setVis('province-line', this.checked); });
    document.getElementById('ckGraticule').addEventListener('change', function () { setVis('graticule', this.checked); });

    var panelBody = document.getElementById('panelBody');
    document.getElementById('panelToggle').addEventListener('click', function (e) {
      e.stopPropagation();
      var c = panelBody.classList.toggle('collapsed');
      this.textContent = c ? '＋' : '－';
    });
    document.getElementById('panelHead').addEventListener('click', function (e) {
      if (window.innerWidth > 900) return;
      if (e.target.id === 'panelToggle') return;
      var c = panelBody.classList.toggle('collapsed');
      document.getElementById('panelToggle').textContent = c ? '＋' : '－';
    });

    el.btnOverview.addEventListener('click', function () {
      clearSelection();
      fitOverview(true);
    });
    document.getElementById('dtClose').addEventListener('click', clearSelection);
    document.getElementById('dtReplay').addEventListener('click', function () {
      if (selected) pulse(byCode[selected], true);
    });
    el.introBar.addEventListener('click', function () {
      setDrawer(!el.intro.classList.contains('is-collapsed'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') clearSelection();
    });
  }

  /* ── 启动 ────────────────────────────────────────────────── */
  map.on('load', function () {
    fetch(DATA_URL).then(function (r) { return r.json(); }).then(function (fc) {
      rivers = fc.features.map(function (f) {
        f.properties.color = colorOf(f.properties.code);
        return f;
      });
      rivers.sort(function (a, b) {
        return CFG.order.indexOf(a.properties.code) - CFG.order.indexOf(b.properties.code);
      });
      byCode = {};
      rivers.forEach(function (f) {
        byCode[f.properties.code] = f;
        var cfg = CFG.rivers[f.properties.code] || {};
        labelPts[f.properties.code] = pickLabelPoint(f.geometry.coordinates, cfg.labelAt || 0.5);
      });
      // 用排序 + 注入颜色的数据替换源，保证绘制顺序（干流在下）
      map.getSource('rivers').setData({ type: 'FeatureCollection', features: rivers });

      renderFacts();
      renderTabs();
      renderChart();
      renderExtremes();
      renderLegend();
      renderStrip();
      el.metricNote.textContent = CFG.metricNote;

      var bm = document.querySelector('input[name="basemap"]:checked');
      setBasemap(bm ? bm.value : 'none');
      bindControls();
      bindHover();
      fitOverview(false);
      requestLabelUpdate();
    }).catch(function (err) {
      console.error('[cn-yangtze] 河流数据加载失败', err);
      el.chart.innerHTML = '<p class="note">河流数据加载失败，请刷新重试。</p>';
    });
  });

  map.on('move', requestLabelUpdate);
  map.on('zoom', requestLabelUpdate);
  map.on('resize', requestLabelUpdate);
  window.addEventListener('resize', requestLabelUpdate);
})();
