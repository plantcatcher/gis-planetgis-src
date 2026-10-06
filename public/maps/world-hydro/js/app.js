/* 全球水电站分布地图 —— 互动逻辑
   数据：scripts/build_world_hydro.py 生成的
        plants.json（7774 座电站点位）/ countries.json（126 国聚合）/ stats.json
   引擎：_shared/thematic

   两个必修的坑（cn-rivers / cn-universities 都踩过）：
   ① 密集点位命中不能取 queryRenderedFeatures()[0]——低缩放下相邻电站只隔几像素，
      必须「命中框内取离指针最近的那个」。
   ② 国家标注必须做 AABB 碰撞检测——按数组顺序输出会让小国被大国挤掉、标签叠成一片。 */
(function () {
  'use strict';

  var CFG = window.HYDRO_CONFIG;
  var fmt = Thematic.fmt, esc = Thematic.esc;

  var DATA = {
    plants: 'data/plants.json',
    countries: 'data/countries.json',
    stats: 'data/stats.json'
  };

  var S = {
    all: [],              // 全部电站 feature
    countries: [],
    byCountry: {},        // 国家键 -> 该国全部电站 feature
    stats: null,
    type: 'all',          // all | STO | ROR | PS | CANAL | UNK
    capMin: 0,            // 装机门槛 MW
    eraMax: 2030,         // 投产年上限
    selPlant: null,
    selCountry: null,
    view: []              // 当前可见的点位（筛选后）
  };

  var el = {
    segType: document.getElementById('segType'),
    typeNote: document.getElementById('typeNote'),
    typeN: document.getElementById('typeN'),
    chipCap: document.getElementById('chipCap'),
    capLb: document.getElementById('capLb'),
    eraRange: document.getElementById('eraRange'),
    eraLb: document.getElementById('eraLb'),
    eraTicks: document.getElementById('eraTicks'),
    eraNote: document.getElementById('eraNote'),
    rankList: document.getElementById('rankList'),
    rankTitle: document.getElementById('rankTitle'),
    rankNote: document.getElementById('rankNote'),
    legend: document.getElementById('legend'),
    fPlant: document.getElementById('fPlant'),
    fCap: document.getElementById('fCap'),
    fCountry: document.getElementById('fCountry'),
    fYear: document.getElementById('fYear'),
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

  var TYPE_MAP = {};
  CFG.types.forEach(function (t) { TYPE_MAP[t.key] = t; });
  function typeOf(k) { return TYPE_MAP[k] || TYPE_MAP.UNK; }

  /* 单站装机分档色：阈值升序匹配 */
  function capColor(w) {
    if (w == null) return CFG.capTiers[CFG.capTiers.length - 1].color;
    for (var i = 0; i < CFG.capTiers.length; i++) if (w >= CFG.capTiers[i].min) return CFG.capTiers[i].color;
    return CFG.capTiers[CFG.capTiers.length - 1].color;
  }
  /* 国家总装机分档色 */
  function cntColor(w) {
    if (w == null) return CFG.cntTiers[CFG.cntTiers.length - 1].color;
    for (var i = 0; i < CFG.cntTiers.length; i++) if (w >= CFG.cntTiers[i].min) return CFG.cntTiers[i].color;
    return CFG.cntTiers[CFG.cntTiers.length - 1].color;
  }
  function fmtMW(v) {
    if (v == null) return '—';
    if (v >= 10000) return fmt(v / 1000, 1) + ' 万';
    return fmt(v, 0);
  }
  function cnCountry(key) {
    var c = S.byCountry[key];
    return c ? c.cn : key;
  }

  /* 与图层 circle-radius 同口径的 log 插值（供标签偏移复用，保证标签位置
     跟气泡真实半径一致，不会写死一个偏移量导致大气泡被压住） */
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
  var BUBBLE_R = [[1.2, 4], [2, 7], [3, 12], [4, 19], [5, 28], [5.5, 34]];
  var BUBBLE_R_FAR = [[1.2, 2.6], [2, 4.6], [3, 8], [4, 12.5], [5, 18], [5.5, 22]];
  /* 远景档阈值：全球总览（约 z 1.0）用收缩版气泡 */
  var FAR_Z = 3;

  /* 缩放切换气泡档位。气泡半径不能把 ['zoom'] 乘进去（MapLibre 不允许），
     只能两图层 + 可见性互斥；选中描边同理。 */
  function syncBubbleZoom() {
    var z = app.map.getZoom();
    var far = z < FAR_Z;
    app.setVisible('ct-bubble', !far);
    app.setVisible('ct-bubble-far', far);
    var selOpen = !!app.map.getLayer('ct-sel') && app.map.getLayoutProperty('ct-sel', 'visibility') === 'visible';
    var selFarOpen = !!app.map.getLayer('ct-sel-far') && app.map.getLayoutProperty('ct-sel-far', 'visibility') === 'visible';
    if (selOpen) app.setVisible('ct-sel', !far);
    if (selFarOpen) app.setVisible('ct-sel-far', far);
  }

  /* Esri 瓦片：{s} 展开成 0~3 四个子域（host 本身无数字后缀，负载均衡靠 URL 差异即可，
     这里保留 {s} 占位是为了与引擎约定一致，同时用 0~3 做端点区分） */
  function esriTiles(url) {
    return ['0', '1', '2', '3'].map(function (s) { return url; });
  }

  var app = Thematic.create({
    slug: 'world-hydro',
    view: CFG.view,
    bounds: CFG.bounds,
    boundsMobile: CFG.boundsMobile,       // 手机竖屏装不下全球，收窄到内容重心
    extent: CFG.extent,
    graticuleStep: CFG.graticuleStep,
    province: false,                       // 全球尺度不画中国省界
    basemaps: {
      img: esriTiles(CFG.basemaps.img.tile),
      vec: esriTiles(CFG.basemaps.vec.tile),
      imgAttr: CFG.imgAttr,
      vecAttr: CFG.vecAttr
    },
    imgPaint: CFG.imgPaint,
    sources: {
      plant: { data: Thematic.EMPTY },
      bubble: { data: Thematic.EMPTY },
      selPlant: { data: Thematic.EMPTY },
      selCountry: { data: Thematic.EMPTY }
    },
    layers: [
      /* 国家总装机气泡：半径按总装机的对数分级。
         lw = log10(总装机)，实测范围 1.17（10 MW 级）~ 5.41（中国 25.8 万 MW），
         断点必须覆盖到 5.5，否则中国/巴西/美国会一起被 clamp 成同一个最大半径。
         气泡是「表达量级」而不是「表达面积」：全球总览时 126 个圈同时铺开会互相压盖、
         盖住它本该表达的电站点位，所以半径随 zoom 收缩（zoom 3 以下按 0.45 折算），
         且透明度也随 zoom 降低——低缩放下读作「分布在哪」，放大后才读「有多少」。 */
      { id: 'ct-bubble', type: 'circle', source: 'bubble',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'lw'], 1.2, 4, 2, 7, 3, 12, 4, 19, 5, 28, 5.5, 34],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.16,
          'circle-stroke-width': 1.2,
          'circle-stroke-color': ['get', 'color'],
          'circle-stroke-opacity': 0.62
        } },
      /* 低缩放时给气泡叠一层「收缩版」，用 zoom 切换两者：
         顶层 interpolate 里 ['zoom'] 只能在输入位置（见下方 plant-pt 注释），
         所以缩放系数不能乘进半径，只能拆成两个图层 + layout 可见性互斥。 */
      { id: 'ct-bubble-far', type: 'circle', source: 'bubble',
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['get', 'lw'], 1.2, 2.6, 2, 4.6, 3, 8, 4, 12.5, 5, 18, 5.5, 22],
          'circle-color': ['get', 'color'],
          'circle-opacity': 0.1,
          'circle-stroke-width': 1,
          'circle-stroke-color': ['get', 'color'],
          'circle-stroke-opacity': 0.4
        } },
      /* 电站点位
         半径 = 基础半径 r（由装机容量算出，boot 时写进要素属性）× zoom 系数。
         ⚠️ 两处 MapLibre 约束踩过：
           1) ['zoom'] 只能作顶层 step/interpolate 的输入，塞进 ['*'] 会让整个 style
              加载失败（报 "zoom expression may only be used as input to a top-level
              step or interpolate"），表现是 getStyle() 返回 undefined、图层全无、空白页。
              所以顶层必须写 interpolate(['linear'], ['zoom'], z, ['*', k, ['get','r']])。
           2) 面积随 r² 放大，所以容量档位用线性插值即可，不必开方。 */
      { id: 'plant-pt', type: 'circle', source: 'plant',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'],
            1, ['*', 0.62, ['get', 'r']],
            3, ['*', 1.0, ['get', 'r']],
            5, ['*', 1.5, ['get', 'r']],
            8, ['*', 2.3, ['get', 'r']],
            11, ['*', 3.4, ['get', 'r']]],
          'circle-color': ['get', 'color'],
          /* 低缩放下整体压淡：全球视野里上万个小点叠在一起会累积成白噪点，
             让人以为那里是「一片白色的国家」。压淡后密集区读作一团微光。 */
          'circle-opacity': ['interpolate', ['linear'], ['zoom'], 1.1, 0.34, 3, 0.82, 6, 0.93],
          'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 4, 0, 6, 0.6, 8, 1],
          'circle-stroke-color': 'rgba(255,255,255,.6)'
        } },
      /* 选中电站：白色光环 + 柔光 */
      { id: 'plant-glow', type: 'circle', source: 'selPlant', layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 8, 5, 18, 9, 34],
          'circle-color': '#ffffff', 'circle-opacity': 0.16
        } },
      { id: 'plant-sel', type: 'circle', source: 'selPlant', layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 5, 5, 11, 9, 20],
          'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-width': 2.4,
          'circle-stroke-color': '#ffffff', 'circle-opacity': 0.96
        } },
      /* 选中国家：高亮描边（两档半径与气泡图层配套） */
      { id: 'ct-sel', type: 'circle', source: 'selCountry', layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 8, 3, 22, 5, 36, 7, 52],
          'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-width': 2.6,
          'circle-stroke-color': '#ffffff', 'circle-stroke-opacity': 0.9
        } },
      { id: 'ct-sel-far', type: 'circle', source: 'selCountry', layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 5, 2, 11, 3, 15],
          'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-width': 2.2,
          'circle-stroke-color': '#ffffff', 'circle-stroke-opacity': 0.88
        } }
    ],
    onReady: boot,
    onOverview: function () { clearSel(); app.fitAll({ animate: true }); },
    onClose: function () { clearSel(); }
  });

  /* ── Esri 署名同步（引擎 sources 里已带 attribution，这里只补面板说明） ── */

  /* ── 筛选 ─────────────────────────────────────────────────── */
  function passFilter(p) {
    if (S.type !== 'all' && p.p !== S.type) return false;
    if (S.capMin > 0) {
      if (p.w == null || p.w < S.capMin) return false;
    }
    if (S.eraMax < 2030) {
      if (p.y == null || p.y > S.eraMax) return false;
    }
    return true;
  }

  function applyFilter() {
    var feats = S.all.filter(function (f) { return passFilter(f.properties); });
    S.view = feats;
    app.map.getSource('plant').setData({ type: 'FeatureCollection', features: feats });

    // 选中电站被筛掉则清除
    if (S.selPlant && !feats.some(function (f) { return f.properties.id === S.selPlant.properties.id; })) {
      clearPlantSel();
    }
    // 气泡跟随筛选重算（各国在当前筛选下的站数与装机）
    renderBubbles();
    renderRank();
    setLabels();
    syncUI();
  }

  /* ── 国家气泡 ─────────────────────────────────────────────── */
  function aggregate(feats) {
    var acc = {};
    feats.forEach(function (f) {
      var p = f.properties, k = p.c;
      if (!acc[k]) acc[k] = { n: 0, w: 0, wn: 0, x: 0, y: 0, wsum: 0, pts: [] };
      var a = acc[k];
      a.n++;
      a.pts.push(f);
      var w = (p.w != null && p.w > 0) ? p.w : 1;
      a.x += f.geometry.coordinates[0] * w;
      a.y += f.geometry.coordinates[1] * w;
      a.wsum += w;
      if (p.w != null) { a.w += p.w; a.wn++; }
    });
    return acc;
  }

  function renderBubbles() {
    var acc = aggregate(S.view);
    var feats = Object.keys(acc).map(function (k) {
      var a = acc[k], meta = S.countries.filter(function (c) { return c.c === k; })[0];
      // 当前筛选下无装机的国家，用重心回退到该国全部电站的重心
      var cx = a.wsum ? a.x / a.wsum : (meta && meta.cxy ? meta.cxy[0] : null);
      var cy = a.wsum ? a.y / a.wsum : (meta && meta.cxy ? meta.cxy[1] : null);
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [cx, cy] },
        properties: {
          c: k, n: a.n, w: a.w == null ? 0 : a.w, wn: a.wn,
          lw: Math.log10(Math.max(a.w || 0, 1)),          // 半径按对数插值
          color: cntColor(a.w || 0)
        }
      };
    }).filter(function (f) { return f.geometry.coordinates[0] != null; });

    /* 气泡要素在 JS 侧留一份：MapLibre 源对象的 _data 是私有字段，
       读它做高亮会随版本失效。自己存最稳。 */
    S.bubbles = feats;
    app.map.getSource('bubble').setData({ type: 'FeatureCollection', features: feats });
  }

  /* ── 图例 ─────────────────────────────────────────────────── */
  function renderLegend() {
    var html = '<div class="lg-cap">电站点位 · 单站装机容量</div>';
    CFG.capTiers.forEach(function (t) {
      html += '<span class="lg-row"><i style="background:' + t.color + '"></i>' + esc(t.label) + '</span>';
    });
    html += '<div class="lg-cap" style="margin-top:5px">气泡 · 国家总装机</div>';
    CFG.cntTiers.forEach(function (t) {
      html += '<span class="lg-row"><s style="background:' + t.color + '"></s>' + esc(t.label) + '</span>';
    });
    el.legend.innerHTML = html;
  }

  /* ── 国家排行 ─────────────────────────────────────────────── */
  var RANK_N = 12;
  function renderRank() {
    var acc = aggregate(S.view);
    var list = S.countries.map(function (c) {
      var a = acc[c.c];
      return {
        c: c.c, cn: c.cn, n: a ? a.n : 0, w: a ? a.w : 0, cxy: c.cxy
      };
    }).filter(function (x) { return x.n > 0; })
      .sort(function (a, b) { return b.w - a.w; });

    var filtered = (S.type !== 'all' || S.capMin > 0 || S.eraMax < 2030);
    el.rankTitle.textContent = filtered ? '国家总装机排行（筛选后）' : '国家总装机排行';
    var shown = list.slice(0, RANK_N);
    el.rankNote.textContent = '共 ' + list.length + ' 国 · 显示前 ' + shown.length;

    if (!shown.length) {
      el.rankList.innerHTML = '<p class="note" style="margin:0">当前筛选下没有电站。</p>';
      return;
    }

    var max = Math.max.apply(null, shown.map(function (x) { return x.w || 0; })) || 1;
    el.rankList.innerHTML = shown.map(function (x) {
      var w = Math.round((x.w || 0) / max * 100);
      var active = S.selCountry === x.c ? ' active' : '';
      return '<button type="button" class="chart-row' + active + '" data-c="' + esc(x.c) + '">' +
        '<span class="nm">' + esc(x.cn) + '</span>' +
        '<span class="bar"><i style="width:' + w + '%;background:' + cntColor(x.w) + '"></i></span>' +
        '<span class="vl">' + fmtMW(x.w) + '</span></button>';
    }).join('');
  }

  el.rankList.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    app.collapseDrawer();
    selectCountry(b.dataset.c, true);
  });

  /* ── 标注：国家名（带 AABB 碰撞检测） ────────────────────── */
  function setLabels() {
    if (!S.view.length) { app.setLabels([]); return; }
    var map = app.map;
    var bd = map.getBounds();
    var z = map.getZoom();

    // 只标当前视口内的国家气泡，且总装机越高越优先拿标签。
    // 直接从 S.view 聚合出国家重心（气泡每次筛选都重算，这里保持同一口径）
    var cands = [];
    var acc = aggregate(S.view);
    S.countries.forEach(function (c) {
      var a = acc[c.c];
      if (!a || !a.n || !a.wn) return;
      var cx = a.wsum ? a.x / a.wsum : (c.cxy ? c.cxy[0] : null);
      var cy = a.wsum ? a.y / a.wsum : (c.cxy ? c.cxy[1] : null);
      if (cx == null) return;
      if (cx < bd.getWest() || cx > bd.getEast() || cy < bd.getSouth() || cy > bd.getNorth()) return;
      cands.push({ cn: c.cn, lng: cx, lat: cy, w: a.w, key: c.c });
    });
    cands.sort(function (p, q) { return (q.w || 0) - (p.w || 0); });

    /* 标签避让：只判锚点同格不够——标签有实际宽高，必须估 AABB 做相交检测 */
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
    var MAX = z < 2.6 ? 26 : (z < 4.5 ? 40 : 70);
    cands.forEach(function (c) {
      if (items.length >= MAX) return;
      var p = map.project([c.lng, c.lat]);
      var txt = c.cn;
      var w = txt.length * FS * 0.95 + 20;      // tag 左右各 10px 内边距
      var h = FS * 1.9;
      /* 标签抬到气泡上方：偏移要跟着气泡半径走，写死 12px 在小气泡上偏高、
         在大气泡上又压在圈里。气泡半径用与图层同一条 log 插值。 */
      var br = interp(c.w ? Math.log10(Math.max(c.w, 1)) : 1.17,
        z < FAR_Z ? BUBBLE_R_FAR : BUBBLE_R);
      var cy2 = p.y - (br + 8);
      var box = { x0: p.x - w / 2, x1: p.x + w / 2, y0: cy2 - h / 2, y1: cy2 + h / 2 };
      if (hits(box)) return;
      boxes.push(box);
      items.push({
        text: txt, lng: c.lng, lat: c.lat,
        color: cntColor(c.w), kind: 'tag', active: S.selCountry === c.key
      });
    });

    // 选中电站额外加一个标签
    if (S.selPlant) {
      var sp = S.selPlant.properties;
      items.push({
        text: sp.n || sp.d || sp.id, lng: S.selPlant.geometry.coordinates[0],
        lat: S.selPlant.geometry.coordinates[1], color: '#fff', kind: 'dot', active: true
      });
    }
    app.setLabels(items);
  }

  /* ── 选中电站 ─────────────────────────────────────────────── */
  /* queryRenderedFeatures() 返回的要素里，geometry.coordinates 是 MapLibre 内部
     Point 类实例（不是普通数组），直接塞回 source.setData() 会在 postMessage 时
     抛 "can't serialize object of unregistered class"。所以这里重建一个纯 JSON 副本。 */
  function plainFeature(f) {
    return {
      type: 'Feature',
      properties: JSON.parse(JSON.stringify(f.properties)),
      geometry: { type: 'Point', coordinates: [f.geometry.coordinates[0], f.geometry.coordinates[1]] }
    };
  }

  function selectPlant(f, move) {
    S.selPlant = f;
    S.selCountry = null;
    app.map.getSource('selCountry').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('ct-sel', 'visibility', 'none');
    app.map.setLayoutProperty('ct-sel-far', 'visibility', 'none');

    app.map.getSource('selPlant').setData({ type: 'FeatureCollection', features: [plainFeature(f)] });
    app.map.setLayoutProperty('plant-glow', 'visibility', 'visible');
    app.map.setLayoutProperty('plant-sel', 'visibility', 'visible');

    var p = f.properties;
    var col = capColor(p.w);
    var t = typeOf(p.p);

    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', col);
    el.dtRole.textContent = 'HYDRO PLANT';
    el.dtName.textContent = p.n || p.d || p.id;
    el.dtSub.textContent = [cnCountry(p.c), t.label, p.r ? p.r + ' 河段' : null]
      .filter(Boolean).join(' · ');

    el.dtLb1.textContent = '装机'; el.dtV1.textContent = p.w == null ? '—' : fmt(p.w, 0); el.dtU1.textContent = p.w == null ? '未标注' : 'MW';
    el.dtLb2.textContent = '坝高'; el.dtV2.textContent = p.h == null ? '—' : fmt(p.h, 0); el.dtU2.textContent = p.h == null ? '未标注' : 'm';
    el.dtLb3.textContent = '投产'; el.dtV3.textContent = p.y == null ? '—' : p.y; el.dtU3.textContent = p.y == null ? '未标注' : '年';

    el.dtDescLb.textContent = '水库与水头';
    var bits = [];
    if (p.d) bits.push('坝体「' + p.d + '」');
    if (p.av != null) bits.push('库容 ' + fmt(p.av, 2) + ' km³');
    if (p.ar != null) bits.push('库区面积 ' + fmt(p.ar, 0) + ' km²');
    if (p.hd != null) bits.push('水头 ' + fmt(p.hd, 0) + ' m');
    if (!bits.length) bits.push('源数据未记录坝体与水库参数');
    el.dtDesc.textContent = bits.join('；') + '。' + (t.desc || '') + '。';

    el.dtFooter.innerHTML = '<span>型式：' + esc(t.label) + '</span>' +
      (p.r ? '<span>河流：' + esc(p.r) + '</span>' : '') +
      '<span>ID：' + esc(p.id) + '</span>';

    renderRank();
    setLabels();
    app.pulse({ glowId: 'plant-glow', selId: 'plant-sel', baseWidth: 10, maxExtra: 8, duration: 1500 });
    if (move) {
      app.map.easeTo({
        center: f.geometry.coordinates,
        zoom: Math.max(app.map.getZoom(), 5),
        duration: 720
      });
    }
  }

  function clearPlantSel() {
    S.selPlant = null;
    app.map.getSource('selPlant').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('plant-glow', 'visibility', 'none');
    app.map.setLayoutProperty('plant-sel', 'visibility', 'none');
  }

  /* ── 选中国家 ─────────────────────────────────────────────── */
  function selectCountry(key, move) {
    var c = S.countries.filter(function (x) { return x.c === key; })[0];
    if (!c) return;
    S.selCountry = key;
    clearPlantSel();

    // 高亮该国在当前筛选下的全部电站
    var pts = S.view.filter(function (f) { return f.properties.c === key; });
    if (pts.length) {
      app.map.getSource('selPlant').setData({ type: 'FeatureCollection', features: pts });
      app.map.setLayoutProperty('plant-glow', 'visibility', 'visible');
    } else {
      app.map.getSource('selPlant').setData(Thematic.EMPTY);
      app.map.setLayoutProperty('plant-glow', 'visibility', 'none');
    }

    // 气泡描边高亮
    var bf = (S.bubbles || []).filter(function (f) { return f.properties.c === key; });
    if (bf.length) {
      app.map.getSource('selCountry').setData({ type: 'FeatureCollection', features: bf });
      app.map.setLayoutProperty('ct-sel', 'visibility', 'visible');
    } else {
      app.map.setLayoutProperty('ct-sel', 'visibility', 'none');
    }
    syncBubbleZoom();

    var acc = aggregate(S.view)[key] || { n: 0, w: 0, wn: 0 };
    var col = cntColor(acc.w || 0);
    var filtered = (S.type !== 'all' || S.capMin > 0 || S.eraMax < 2030);

    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', col);
    el.dtRole.textContent = 'COUNTRY';
    el.dtName.textContent = c.cn;
    el.dtSub.textContent = (filtered ? '筛选后 ' : '') + acc.n + ' 座水电站 · 台账国别共 ' + c.n + ' 座';

    el.dtLb1.textContent = '总装机';
    el.dtV1.textContent = acc.w == null || acc.wn === 0 ? '—' : fmtMW(acc.w);
    el.dtU1.textContent = acc.wn === 0 ? '未标注' : 'MW';
    el.dtLb2.textContent = '最高坝'; el.dtV2.textContent = c.hmax == null ? '—' : fmt(c.hmax, 0); el.dtU2.textContent = c.hmax == null ? '未标注' : 'm';
    el.dtLb3.textContent = '首末投产';
    el.dtV3.textContent = c.y0 == null ? '—' : c.y0;
    el.dtU3.textContent = c.y1 == null ? '未标注' : (c.y1 == c.y0 ? '年起' : ' → ' + c.y1);

    el.dtDescLb.textContent = '型式构成';
    var order = ['STO', 'ROR', 'PS', 'CANAL', 'UNK'];
    var parts = order.map(function (k) {
      return { k: k, n: (c.t && c.t[order.indexOf(k)]) || 0 };
    }).filter(function (x) { return x.n > 0; })
      .map(function (x) { return typeOf(x.k).label + ' ' + x.n + ' 座'; });
    el.dtDesc.textContent = parts.join(' · ') + '。' + countryNote(c);

    el.dtFooter.innerHTML = '<span>台账站数：' + c.n + ' 座</span>' +
      (c.wn ? '<span>有装机记录：' + c.wn + ' 座</span>' : '') +
      '<span>重心：装机加权</span>';

    renderRank();
    setLabels();
    if (move && c.cxy) {
      app.map.easeTo({ center: c.cxy, zoom: Math.max(app.map.getZoom(), 4), duration: 760 });
    }
  }

  /* 各国一句话解读 */
  function countryNote(c) {
    var w = c.w || 0, n = c.n || 0;
    var per = n ? w / n : 0;
    if (w >= 100000) {
      return '装机总量进入全球第一梯队（10 万 MW 级）。' + (per > 3000
        ? '平均单站 ' + fmt(per, 0) + ' MW，规模以超大型工程为主。'
        : '但站数多、平均仅 ' + fmt(per, 0) + ' MW，以中小型电站铺开。');
    }
    if (w >= 50000) return '装机总量全球第二梯队（5 万 MW 级），' + (per > 2000 ? '以大型电站为主。' : '大小电站并存。');
    if (w >= 20000) return '装机总量处于全球中上水平（2 万 – 5 万 MW）。';
    if (n >= 200) return '装机总量不大，但电站数量全球前列（' + n + ' 座），典型的「多站型」水电国家。';
    if (n === 0) return '当前筛选下该国无电站。';
    return '台账收录 ' + n + ' 座电站，装机总量在全球属中小规模。';
  }

  function clearSel() {
    S.selCountry = null;
    clearPlantSel();
    app.map.getSource('selCountry').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('ct-sel', 'visibility', 'none');
    app.map.setLayoutProperty('ct-sel-far', 'visibility', 'none');
    app.setDetailOpen(false);
    el.detail.hidden = true;
    renderRank();
    setLabels();
  }

  /* ── 命中：框内取离指针最近（低缩放下相邻电站只隔几像素） ──── */
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
    // 多个命中：取屏幕上离指针最近的那个
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

  /* ── 交互 ─────────────────────────────────────────────────── */
  function bind() {
    app.map.on('zoom', function () { syncBubbleZoom(); });
    app.map.on('mousemove', function (e) {
      var p = pickNearest(e.point, 'plant-pt', 5);
      if (p) {
        var pr = p.properties;
        app.map.getCanvas().style.cursor = 'pointer';
        app.tooltip('<b>' + esc(pr.n || pr.d || pr.id) + '</b> <span style="color:' + capColor(pr.w) + '">' +
          (pr.w == null ? '装机未标注' : fmt(pr.w, 0) + ' MW') + '</span><br><span style="color:#9fb4cd">' +
          esc(cnCountry(pr.c)) + (pr.r ? ' · ' + esc(pr.r) : '') + (pr.y ? ' · ' + pr.y + ' 年' : '') + '</span>',
          e.point.x, e.point.y);
        return;
      }
      var b = pickNearest(e.point, 'ct-bubble', 4);
      if (b) {
        var bp = b.properties;
        var meta = S.countries.filter(function (x) { return x.c === bp.c; })[0];
        app.map.getCanvas().style.cursor = 'pointer';
        app.tooltip('<b>' + esc(meta ? meta.cn : bp.c) + '</b> <span style="color:' + cntColor(bp.w) + '">' +
          (bp.wn ? fmtMW(bp.w) + ' MW' : '装机未标注') + '</span><br><span style="color:#9fb4cd">' +
          bp.n + ' 座水电站</span>', e.point.x, e.point.y);
        return;
      }
      app.map.getCanvas().style.cursor = '';
      app.tooltip(null);
    });
    app.map.on('mouseleave', function () { app.tooltip(null); });

    app.map.on('click', function (e) {
      // 先电站点位（覆盖在气泡之上，层级更高）
      var p = pickNearest(e.point, 'plant-pt', 5);
      if (p) { app.collapseDrawer(); selectPlant(p, true); return; }
      var b = pickNearest(e.point, 'ct-bubble', 4);
      if (b) { app.collapseDrawer(); selectCountry(b.properties.c, true); return; }
      clearSel();
    });

    el.segType.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.type = b.dataset.v;
      applyFilter();
    });
    el.chipCap.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.capMin = parseFloat(b.dataset.v) || 0;
      applyFilter();
    });
    el.eraRange.addEventListener('input', function () {
      S.eraMax = parseInt(this.value, 10);
      applyFilter();
    });
  }

  /* ── UI 同步 ──────────────────────────────────────────────── */
  function syncUI() {
    Array.prototype.forEach.call(el.segType.children, function (b) {
      b.classList.toggle('active', b.dataset.v === S.type);
    });
    Array.prototype.forEach.call(el.chipCap.children, function (b) {
      b.classList.toggle('active', (parseFloat(b.dataset.v) || 0) === S.capMin);
    });

    var n = S.view.length;
    el.typeN.textContent = fmt(n, 0) + ' 座';
    var t = typeOf(S.type);
    el.typeNote.textContent = S.type === 'all'
      ? '显示全部 ' + fmt(n, 0) + ' 座电站。点上方型式可单独观察某一类电站的地理分布。'
      : '仅显示' + t.label + '电站 ' + fmt(n, 0) + ' 座 —— ' + t.desc + '。';
    el.capLb.textContent = S.capMin > 0 ? '≥ ' + fmt(S.capMin, 0) + ' MW' : '≥ 0 MW';

    el.eraLb.textContent = S.eraMax >= 2030 ? '1830 至今' : '1830 – ' + S.eraMax;
    if (S.eraMax >= 2030) {
      el.eraNote.textContent = '拖动时间轴，只看某个年代之前投产的电站——水电建设的三次浪潮（1900 前后的欧美、1950–1980 的苏联与拉美、2000 年后的中国）会依次浮现。';
    } else {
      var nNoYear = S.view.filter(function (f) { return f.properties.y == null; }).length;
      el.eraNote.textContent = '仅统计 ' + S.eraMax + ' 年及之前投产的电站，当前 ' + fmt(n, 0) + ' 座。'
        + (nNoYear ? '另有 ' + nNoYear + ' 座因缺投产年记录被一并排除。' : '');
    }
  }

  function renderEraTicks() {
    var y0 = 1830, y1 = 2030, step = 40;
    var html = '';
    for (var y = y0; y <= y1; y += step) html += '<span>' + y + '</span>';
    el.eraTicks.innerHTML = html;
  }

  /* ── 启动 ─────────────────────────────────────────────────── */
  function boot() {
    Promise.all([
      fetch(DATA.plants).then(function (r) { return r.json(); }),
      fetch(DATA.countries).then(function (r) { return r.json(); }),
      fetch(DATA.stats).then(function (r) { return r.json(); })
    ]).then(function (res) {
      var plants = res[0], countries = res[1], stats = res[2];

      S.all = plants.features;
      S.countries = countries.countries;
      S.stats = stats;

      S.countries.forEach(function (c) { S.byCountry[c.c] = c; });
      /* 逐座预计算渲染属性：色（装机分档）+ 基础半径 r（容量→像素）。
         构建期算好，前端每帧不必再跑表达式分支。 */
      S.all.forEach(function (f) {
        f.properties.color = capColor(f.properties.w);
        f.properties.r = interp(f.properties.w == null ? 1 : f.properties.w, CFG.capRadius);
      });
      // 按国家建索引
      S.all.forEach(function (f) {
        var k = f.properties.c;
        (S.byCountry[k].pts = S.byCountry[k].pts || []).push(f);
      });

      el.fPlant.textContent = fmt(stats.nPlant, 0);
      el.fCap.textContent = fmt(stats.capTotal / 10000, 1);
      el.fCountry.textContent = stats.nCountry;
      el.fYear.textContent = stats.yearMin;

      renderLegend();
      renderEraTicks();
      bind();
      applyFilter();
      app.fitAll({ animate: false });
      syncBubbleZoom();
      setLabels();
      window.__hydroDebug = { ready: true, n: S.all.length, bubbles: app.map.querySourceFeatures('bubble').length };
    }).catch(function (err) {
      console.error('[world-hydro] 数据加载失败', err);
      el.rankList.innerHTML = '<p class="note" style="margin:0">数据加载失败，请刷新重试。</p>';
    });
  }
})();
