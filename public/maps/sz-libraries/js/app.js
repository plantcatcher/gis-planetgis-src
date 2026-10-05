/* 深圳图书馆分布地图 —— 互动逻辑
   数据：scripts/build_sz_libraries.py 生成的 libraries.json（15 处总馆点位）
        与 districts.json（10 个辖区边界，DataV.GeoAtlas 440300_full 抽稀）
   引擎：_shared/thematic */
(function () {
  'use strict';

  var CFG = window.LIB_CONFIG;
  var fmt = Thematic.fmt, esc = Thematic.esc;

  var DATA = {
    lib: 'data/libraries.json',
    dist: 'data/districts.json'
  };

  var S = {
    allLib: [],
    libById: {},
    distByName: {},
    distGeo: null,          // districts.json 的 FC（启动时 fetch 一次，填色直接复用）
    tier: 'all',
    selLib: null,
    selDist: null
  };

  var el = {
    segTier: document.getElementById('segTier'),
    tierNote: document.getElementById('tierNote'),
    rankList: document.getElementById('rankList'),
    rankNote: document.getElementById('rankNote'),
    legend: document.getElementById('legend'),
    fTotal: document.getElementById('fTotal'),
    fCity: document.getElementById('fCity'),
    fColl: document.getElementById('fColl'),
    fGrade: document.getElementById('fGrade'),
    detail: document.getElementById('detail'),
    dtRole: document.getElementById('dtRole'),
    dtName: document.getElementById('dtName'),
    dtSub: document.getElementById('dtSub'),
    dtV1: document.getElementById('dtV1'),
    dtV2: document.getElementById('dtV2'),
    dtV3: document.getElementById('dtV3'),
    dtDescLb: document.getElementById('dtDescLb'),
    dtDesc: document.getElementById('dtDesc'),
    dtFooter: document.getElementById('dtFooter')
  };

  /* ── 分档配色：按实体文献藏量（万册）─────────────────────
     注意 MapLibre case 表达式必须按阈值升序，tiers 数组已升序排列。 */
  function tierColor(v) {
    if (v == null) return '#4a86c6';
    for (var i = 0; i < CFG.tiers.length; i++) if (v >= CFG.tiers[i].min) return CFG.tiers[i].color;
    return CFG.tiers[CFG.tiers.length - 1].color;
  }

  /* ── 地图 ─────────────────────────────────────────────────── */
  var app = Thematic.create({
    slug: 'sz-libraries',
    view: CFG.view,
    bounds: CFG.bounds,
    extent: CFG.extent,
    graticuleStep: CFG.graticuleStep,
    /* 深圳市域尺度不需要省级底图，关掉引擎内置的 prov 图层 */
    province: { fill: false, line: false },
    defaultBasemap: 'img',                 // 默认卫星影像
    imgPaint: {                           // 卫星影像压暗，避免过亮抢掉辖区色块与点位
      'raster-brightness-max': 0.62,
      'raster-saturation': -0.22,
      'raster-contrast': 0.1
    },
    sources: {
      dist: { data: DATA.dist },
      zone: { type: 'geojson', data: Thematic.EMPTY },
      lib: { data: DATA.lib, promoteId: 'id' },
      selDist: { data: Thematic.EMPTY },
      selLib: { data: Thematic.EMPTY }
    },
    layers: [
      /* 辖区色块：按该辖区总馆藏量合计分档。
         fillColor 在启动后才由 paintDistricts 写入，起始阶段用 fallback 兜底，
         否则 MapLibre 会因null 颜色反复报警。 */
      { id: 'dist-fill', type: 'fill', source: 'dist',
        paint: {
          'fill-color': ['case', ['has', 'fillColor'], ['get', 'fillColor'], '#0e1a2a'],
          'fill-opacity': 0.62
        } },
      { id: 'dist-line', type: 'line', source: 'dist',
        paint: { 'line-color': '#9fb6d0', 'line-width': 0.9, 'line-opacity': 0.5 } },
      /* 辖区选中描边 */
      { id: 'dist-sel', type: 'line', source: 'selDist', layout: { visibility: 'none' },
        paint: { 'line-color': '#ffffff', 'line-width': 2.4, 'line-opacity': 0.9 } },
      /* 功能区（大鹏新区）：虚线圈示意范围，无行政区面可填 */
      { id: 'zone-ring', type: 'line', source: 'zone',
        paint: {
          'line-color': '#d9a441', 'line-width': 1.8, 'line-opacity': 0.75,
          'line-dasharray': [3, 2.4]
        } },
      { id: 'zone-fill', type: 'fill', source: 'zone',
        paint: { 'fill-color': '#d9a441', 'fill-opacity': 0.09 } },
      /* 区级总馆圆点 */
      { id: 'lib-pt', type: 'circle', source: 'lib',
        filter: ['==', ['get', 'tier'], 'district'],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 5, 12, 10, 15, 15],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 1.4, 'circle-stroke-color': 'rgba(255,255,255,.8)',
          'circle-opacity': 0.94
        } },
      /* 市级馆方点 */
      { id: 'lib-sq', type: 'circle', source: 'lib',
        filter: ['==', ['get', 'tier'], 'city'],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 6, 12, 12, 15, 18],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': 2.6, 'circle-stroke-color': '#f4e2b8',
          'circle-opacity': 0.96
        } },
      /* 选中光晕 + 白环 */
      { id: 'lib-glow', type: 'circle', source: 'selLib', layout: { visibility: 'none' },
        paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 20, 12, 34, 15, 48],
          'circle-color': '#ffffff', 'circle-opacity': 0.16 } },
      { id: 'lib-sel', type: 'circle', source: 'selLib', layout: { visibility: 'none' },
        paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 9, 12, 15, 15, 21],
          'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff', 'circle-opacity': 0.96 } }
    ],
    onReady: boot,
    onOverview: function () { clearSel(); app.fitAll({ animate: true }); },
    onClose: function () { clearSel(); }
  });

  /* ── 功能区（大鹏新区）虚线圈 ────────────────────────────── */
  function paintZones() {
    var feats = (CFG.functionalZones || []).map(function (z) {
      var ring = [], n = 72;
      /* 1° 纬度 ≈ 111km；用近似换算把半径公里数转成经纬度度数 */
      var dLat = z.radiusKm / 110.9;
      var dLng = z.radiusKm / (111.3 * Math.cos(z.center[1] * Math.PI / 180));
      for (var i = 0; i <= n; i++) {
        var a = i / n * Math.PI * 2;
        ring.push([z.center[0] + dLng * Math.cos(a), z.center[1] + dLat * Math.sin(a)]);
      }
      return {
        type: 'Feature',
        properties: { name: z.name, note: z.note },
        geometry: { type: 'Polygon', coordinates: [ring] }
      };
    });
    if (feats.length) app.map.getSource('zone').setData({ type: 'FeatureCollection', features: feats });
  }

  /* ── 辖区填色：按辖区内总馆实体文献藏量合计 ────────────── */
  function paintDistricts() {
    var byName = {};
    S.allLib.forEach(function (f) {
      var p = f.properties;
      var d = byName[p.district] || (byName[p.district] = { sum: 0, n: 0, libs: [] });
      d.n++;
      d.libs.push(p.name);
      if (p.collection != null) d.sum += p.collection;
    });
    CFG.districts.forEach(function (d) {
      d.count = byName[d.name] ? byName[d.name].n : 0;
      d.coll = byName[d.name] ? byName[d.name].sum : 0;
      d.fillColor = d.count ? tierColor(d.coll) : 'rgba(255,255,255,0.04)';
    });

    /* 注意：MapLibre 的 GeoJSONSource.data() 在 v5 不是公开稳定接口，
       直接复用启动时 fetch 到的 districts.json FC 做一次 setData 即可。 */
    if (!S.distGeo) return;
    S.distGeo.features.forEach(function (f) {
      var nm = f.properties.name;
      var cfg = CFG.districts.filter(function (d) { return d.name === nm; })[0];
      f.properties.fillColor = cfg ? cfg.fillColor : 'rgba(255,255,255,0.04)';
    });
    app.map.getSource('dist').setData(S.distGeo);
  }

  /* ── 图例 ─────────────────────────────────────────────────── */
  function renderLegend() {
    var html = '<div class="lg-cap">总馆 · 纸质文献藏量</div>';
    CFG.tiers.forEach(function (t) {
      html += '<span class="lg-row"><i style="background:' + t.color + '"></i>' + esc(t.label) + '</span>';
    });
    html += '<div class="lg-cap" style="margin-top:6px">馆别</div>';
    html += '<span class="lg-row"><s style="background:#e2564f"></s>市级馆（方点）</span>';
    html += '<span class="lg-row"><s style="background:#4aa96c"></s>区级总馆（圆点）</span>';
    if ((CFG.functionalZones || []).length) {
      html += '<div class="lg-cap" style="margin-top:6px">功能区</div>';
      html += '<span class="lg-row"><i style="background:rgba(217,164,65,.16);border:1.5px dashed #d9a441"></i>大鹏新区（非行政区）</span>';
    }
    el.legend.innerHTML = html;
  }

  /* ── 排行 ─────────────────────────────────────────────────── */
  function renderRank() {
    var list = S.allLib.slice().sort(function (a, b) {
      var x = a.properties.collection, y = b.properties.collection;
      if (x == null && y == null) return 0;
      if (x == null) return 1;
      if (y == null) return -1;
      return y - x;
    });
    var max = Math.max.apply(null, list.map(function (f) { return f.properties.collection || 0; })) || 1;
    var known = S.allLib.filter(function (f) { return f.properties.collection != null; }).length;
    el.rankNote.textContent = '共 ' + list.length + ' 处馆舍 · ' + known + ' 处公开实体文献藏量（口径年份不一，见各馆介绍页）';

    el.rankList.innerHTML = list.map(function (f) {
      var p = f.properties;
      var w = p.collection ? Math.max(2, Math.round(p.collection / max * 100)) : 1;
      var active = S.selLib && S.selLib.properties.id === p.id ? ' active' : '';
      return '<button type="button" class="chart-row' + active + '" data-id="' + esc(p.id) + '" title="' + esc(p.name) + ' · ' + esc(p.tagline) + '">' +
        '<span class="nm">' + esc(p.name) + '</span>' +
        '<span class="bar"><i style="width:' + w + '%;background:' + tierColor(p.collection) + '"></i></span>' +
        '<span class="vl">' + (p.collection == null ? '—' : p.collection) + '</span></button>';
    }).join('');
  }

  /* ── 标注：辖区名 + 选中馆名（带碰撞检测）───────────────────
     深圳总馆点位集中在各区中心，与辖区名锚点高度重叠。
     做法：辖区名按 config 里的 labelOffset 偏移；再用网格做真实包围盒去重。 */
  function setLabels() {
    var items = [];
    CFG.districts.forEach(function (d) {
      var off = d.labelOffset || [0, 0];
      items.push({
        text: d.name.replace(/[区]$/, '') + (d.count ? ' ' + d.count : ''),
        lng: d.center[0] + off[0], lat: d.center[1] + off[1],
        color: d.count ? '#dce9f7' : '#7d8ea3',
        kind: 'tag', active: S.selDist === d.name,
        pri: 1, sz: 12
      });
    });
    (CFG.functionalZones || []).forEach(function (z) {
      items.push({
        text: z.name,
        lng: z.center[0], lat: z.center[1] - z.radiusKm / 110.9 * 0.78,
        color: '#e0b45f', kind: 'tag', pri: 1, sz: 12
      });
    });
    if (S.selLib) {
      var p = S.selLib.properties;
      items.push({
        text: p.name,
        lng: S.selLib.geometry.coordinates[0], lat: S.selLib.geometry.coordinates[1],
        color: p.color, kind: 'dot', active: true, pri: 0, sz: 14
      });
    }
    app.setLabels(dedupe(items));
  }

  /* 网格加速去重。
     ⚠️ 只按「锚点是否落在同一格」判重是不够的：标签有实际宽度与高度，
     锚点相邻 56px 内仍可能视觉重叠。改为按估算包围盒（宽 = 文字长度×字号，
     高 = 行高）做重叠检测，并把 box 从 56×22 收紧到 40×18。 */
  function dedupe(items) {
    var placed = [], out = [];
    items.slice().sort(function (a, b) { return (a.pri || 9) - (b.pri || 9); }).forEach(function (it) {
      var p = app.map.project([it.lng, it.lat]);
      if (!p || !isFinite(p.x)) return;
      /* tag 类是左对齐的胶囊标签，估算半宽；dot 类按中心对称 */
      var sz = it.sz || 12;
      var w = it.kind === 'tag' ? Math.max(34, it.text.length * sz * 0.92 + 18) : it.text.length * sz * 0.95 + 8;
      var h = sz * 1.9;
      var x0 = it.kind === 'tag' ? p.x : p.x - w / 2;
      var box = { x0: x0, y0: p.y - h / 2, x1: x0 + w, y1: p.y + h / 2 };
      var hit = false;
      for (var i = 0; i < placed.length; i++) {
        var b = placed[i];
        if (box.x0 < b.x1 && box.x1 > b.x0 && box.y0 < b.y1 && box.y1 > b.y0) { hit = true; break; }
      }
      if (hit) return;
      placed.push(box);
      out.push(it);
    });
    return out;
  }

  /* ── 筛选 ─────────────────────────────────────────────────── */
  function applyTier(v) {
    S.tier = v;
    var feats = S.allLib.filter(function (f) {
      return v === 'all' ? true : f.properties.tier === v;
    });
    app.map.getSource('lib').setData({ type: 'FeatureCollection', features: feats });
    if (S.selLib && !feats.some(function (f) { return f.properties.id === S.selLib.properties.id; })) {
      clearLibSel();
    }
    Array.prototype.forEach.call(el.segTier.children, function (b) {
      b.classList.toggle('active', b.dataset.v === v);
    });
    var c = CFG.tiers_desc.filter(function (x) { return x.key === v; })[0];
    el.tierNote.textContent = c ? c.desc : '市级馆为「图书馆之城」统一服务中的市级龙头，区级总馆是各区服务体系的枢纽。';
    setLabels();
  }

  /* ── 选中图书馆 ───────────────────────────────────────────── */
  function selectLib(f, move) {
    S.selLib = f;
    S.selDist = null;
    app.map.getSource('selDist').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('dist-sel', 'visibility', 'none');

    app.map.getSource('selLib').setData({ type: 'FeatureCollection', features: [f] });
    app.map.setLayoutProperty('lib-glow', 'visibility', 'visible');
    app.map.setLayoutProperty('lib-sel', 'visibility', 'visible');

    var p = f.properties;
    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', p.color);
    el.dtRole.textContent = p.tier === 'city' ? 'MUNICIPAL' : 'DISTRICT';
    el.dtName.textContent = p.name;
    el.dtSub.textContent = p.district + ' · ' + p.alias;
    el.dtV1.textContent = p.area ? fmt(p.area) : '—';
    el.dtV2.textContent = p.collection == null ? '—' : p.collection + ' 万';
    el.dtV3.textContent = p.seats ? fmt(p.seats) : '—';
    el.dtDescLb.textContent = '看点';
    el.dtDesc.textContent = p.tagline + '。' + p.highlights[0];
    el.dtFooter.innerHTML =
      '<span>' + esc(p.grade) + '</span>' +
      (p.collNote ? '<span class="dt-cn">' + esc(p.collNote) + '</span>' : '') +
      '<a href="' + esc(p.page) + '" target="_blank">馆情介绍页 ↗</a>';

    renderRank();
    setLabels();
    app.pulse({ glowId: 'lib-glow', selId: 'lib-sel', baseWidth: 22, maxExtra: 14, duration: 1500 });
    if (move) {
      app.map.easeTo({ center: f.geometry.coordinates, zoom: Math.max(app.map.getZoom(), 12.4), duration: 720 });
    }
  }

  function clearLibSel() {
    S.selLib = null;
    app.map.getSource('selLib').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('lib-glow', 'visibility', 'none');
    app.map.setLayoutProperty('lib-sel', 'visibility', 'none');
  }

  /* ── 选中辖区 ─────────────────────────────────────────────── */
  function selectDist(name, move) {
    var f = S.distByName[name];
    if (!f) return;
    S.selDist = name;
    clearLibSel();
    app.map.getSource('selDist').setData(f);
    app.map.setLayoutProperty('dist-sel', 'visibility', 'visible');

    var cfg = CFG.districts.filter(function (d) { return d.name === name; })[0] || { count: 0, coll: 0, libs: [] };
    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', cfg.count ? tierColor(cfg.coll) : '#5a6b80');
    el.dtRole.textContent = 'DISTRICT';
    el.dtName.textContent = name;
    el.dtSub.textContent = cfg.count ? cfg.count + ' 处总馆馆舍' : '本图未收录总馆';
    el.dtV1.textContent = cfg.coll ? fmt(Math.round(cfg.coll)) : '—';
    el.dtV2.textContent = cfg.count + ' 处';
    el.dtV3.textContent = cfg.libs.length + ' 座';
    el.dtDescLb.textContent = '辖区看点';
    el.dtDesc.textContent = (CFG.districtNote[name] || '') +
      (cfg.libs.length ? ' 本区收录：' + cfg.libs.join('、') + '。' : '');
    el.dtFooter.innerHTML =
      '<span>色块深浅 = 本区总馆实体文献合计</span>' +
      '<a href="catalog.html#' + encodeURIComponent(name) + '" target="_blank">总馆目录 ↗</a>';

    renderRank();
    setLabels();
    if (move) {
      var bb = Thematic.bboxOf(f.geometry);
      if (bb) app.fitBounds(Thematic.padBbox(bb, 0.03), { animate: true, maxZoom: 12.6, withDetail: true, duration: 720 });
    }
  }

  function clearSel() {
    S.selDist = null;
    clearLibSel();
    app.map.getSource('selDist').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('dist-sel', 'visibility', 'none');
    app.setDetailOpen(false);
    el.detail.hidden = true;
    renderRank();
    setLabels();
  }

  /* ── 交互 ─────────────────────────────────────────────────── */
  function bind() {
    app.map.on('mousemove', function (e) {
      var lf = app.pick(e.point, ['lib-sq', 'lib-pt'], 6);
      if (lf) {
        var p = lf.properties;
        app.map.getCanvas().style.cursor = 'pointer';
        app.tooltip('<b>' + esc(p.name) + '</b> <span style="color:' + p.color + '">' +
          (p.tier === 'city' ? '市级馆' : '区级总馆') + '</span><br>' +
          '<span style="color:#9fb4cd">' + esc(p.district) + ' · ' +
          (p.collection == null ? '藏量未公开' : p.collection + ' 万册') +
          (p.area ? ' · ' + fmt(p.area) + ' m²' : '') + '</span>', e.point.x, e.point.y);
        return;
      }
      var df = app.pick(e.point, ['dist-fill'], 0);
      if (df) {
        var nm = df.properties.name;
        var cfg = CFG.districts.filter(function (d) { return d.name === nm; })[0];
        app.map.getCanvas().style.cursor = 'pointer';
        app.tooltip('<b>深圳市' + esc(nm) + '</b> <span style="color:#9fb4cd">' +
          (cfg && cfg.count ? cfg.count + ' 处总馆 · ' + fmt(Math.round(cfg.coll)) + ' 万册'
            : '本图未收录总馆') + '</span>', e.point.x, e.point.y);
        return;
      }
      app.map.getCanvas().style.cursor = '';
      app.tooltip(null);
    });
    app.map.on('mouseleave', function () { app.tooltip(null); });
    app.map.on('click', function (e) {
      var lf = app.pick(e.point, ['lib-sq', 'lib-pt'], 6);
      if (lf) { app.collapseDrawer(); selectLib(lf, true); return; }
      var df = app.pick(e.point, ['dist-fill'], 0);
      if (df) { app.collapseDrawer(); selectDist(df.properties.name, true); return; }
      clearSel();
    });

    el.segTier.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      applyTier(b.dataset.v);
    };
    el.rankList.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var f = S.libById[b.dataset.id]; if (!f) return;
      app.collapseDrawer();
      selectLib(f, true);
    };
  }

  function bindPanel() {
    var ckLib = document.getElementById('ckLib');
    if (ckLib) ckLib.addEventListener('change', function () {
      app.setVisible('lib-pt', this.checked);
      app.setVisible('lib-sq', this.checked);
      if (!this.checked) { app.setVisible('lib-sel', false); app.setVisible('lib-glow', false); }
    });
    var ckDist = document.getElementById('ckDistrict');
    if (ckDist) ckDist.addEventListener('change', function () { app.setVisible('dist-fill', this.checked); });
    /* 引擎的 #ckBorder 绑的是内置省界层，这里覆盖为辖区边界 */
    var ckBorder = document.getElementById('ckBorder');
    if (ckBorder) {
      var old = ckBorder.onchange;
      ckBorder.onchange = null;
      ckBorder.addEventListener('change', function () {
        app.setVisible('dist-line', this.checked);
        app.setVisible('dist-sel', this.checked && !!S.selDist);
        if (old) old.call(this);
      });
    }
  }

  /* ── 启动 ─────────────────────────────────────────────────── */
  function boot() {
    var dbg = window.__libDebug = { startedAt: Date.now() };
    Promise.all([
      fetch(DATA.lib).then(function (r) { return r.json(); }),
      fetch(DATA.dist).then(function (r) { return r.json(); })
    ]).then(function (res) {
      var lib = res[0], dist = res[1];
      S.allLib = lib.features.map(function (f) {
        f.properties.color = tierColor(f.properties.collection);
        return f;
      });
      S.allLib.forEach(function (f) { S.libById[f.properties.id] = f; });
      dist.features.forEach(function (f) { S.distByName[f.properties.name] = f; });
      S.distGeo = dist;

      el.fTotal.textContent = S.allLib.length;
      el.fCity.textContent = S.allLib.filter(function (f) { return f.properties.tier === 'city'; }).length;
      el.fColl.textContent = fmt(Math.round(S.allLib.reduce(function (s, f) {
        return s + (f.properties.collection || 0);
      }, 0)));
      /* 一级馆要按「机构」而不是「馆舍」计：深圳图书馆中心馆与北馆同属一家机构
         （北馆 grade 写的是「与中心馆一体评定」），若按点位计会重复算一家。
         大鹏的「国家市一级」低于国家/地市级一级，用 /国家.{0,3}级?一级图书馆/ 排除。
         ⚠️ grade 串里是全角括号「（）」，别用 \($ 匹配——会一个都匹配不上。 */
      var gradeSeen = {};
      S.allLib.forEach(function (f) {
        var p = f.properties;
        if (!/级?一级图书馆/.test(p.grade)) return;
        if (/市一级/.test(p.grade)) return;          // 市一级 < 地市级一级，不计
        var key = p.tier === 'city' ? '深圳图书馆' : p.name;
        gradeSeen[key] = 1;
      });
      el.fGrade.textContent = Object.keys(gradeSeen).length;

      paintZones();
      paintDistricts();
      renderLegend();
      renderRank();
      bind();
      bindPanel();
      applyTier('all');
      setLabels();
      app.fitAll({ animate: false });
      dbg.bootDone = true;
    }).catch(function (err) {
      console.error('[sz-libraries] 数据加载失败', err);
      el.rankList.innerHTML = '<p class="note">数据加载失败，请刷新重试。</p>';
    });
  }
})();