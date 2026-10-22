/* 全球洋流运动地图 —— 互动逻辑
   数据：scripts/build_world_currents.py 生成的
        currents.json（32 条洋流路径）/ upwelling.json（6 处上升流）/ stats.json
   引擎：_shared/thematic

   三个必修的坑（world-hydro / cn-rivers 都踩过）：
   ① 跨反子午线的洋流必须按 |Δlng| ≥ 180° 拆段：Kuroshio 尾部 178°E → 174°W、
      NECP 的 -175° → 175°，MapLibre 会按平面坐标直连，画出横贯全图的横线。
      拆段后每段独立重采样；详情与统计仍按逻辑上的「一条洋流」计。
   ② 粒子/箭头旋转角必须在墨卡托平面算（屏幕 y 向下 = mercY 方向），
      直接用 bearing 会在南北向洋流上差一个投影修正量。
   ③ queryRenderedFeatures 命中线层要点在线上：另铺一条 12px 透明 cur-hit
      专用于命中，否则低缩放下洋流线只有 2px 宽，点不中。 */
(function () {
  'use strict';

  var CFG = window.CURRENTS_CONFIG;
  var fmt = Thematic.fmt, esc = Thematic.esc;

  var DATA = {
    currents: 'data/currents.json',
    upwelling: 'data/upwelling.json',
    stats: 'data/stats.json'
  };

  var S = {
    all: [],          // 逻辑洋流（32 条，含 desc 等全属性）
    byId: {},         // id -> 逻辑洋流
    lines: [],        // 渲染线段（跨线已拆段），每段带 curId + __rs 重采样缓存
    uw: [],           // 上升流点 feature
    stats: null,
    type: 'all',      // all | warm | cold
    ocean: 'all',     // all | pacific | atlantic | indian | arctic | southern
    season: 'winter', // winter | summer（北印度洋）
    speed: 1,         // 0 暂停 / 0.5 慢 / 1 常速 / 2 快
    view: [],         // 当前可见的逻辑洋流
    selCur: null,     // 选中的逻辑洋流 properties
    selUw: null,
    showFlow: true,   // 流动条纹开关（canvas 层，不走引擎 data-toggle-layer）
    T: 0              // 动画路径比例 0..1
  };

  var el = {
    segType: document.getElementById('segType'),
    typeNote: document.getElementById('typeNote'),
    typeN: document.getElementById('typeN'),
    chipOcean: document.getElementById('chipOcean'),
    oceanLb: document.getElementById('oceanLb'),
    oceanNote: document.getElementById('oceanNote'),
    segSeason: document.getElementById('segSeason'),
    seasonLb: document.getElementById('seasonLb'),
    seasonNote: document.getElementById('seasonNote'),
    segSpeed: document.getElementById('segSpeed'),
    speedLb: document.getElementById('speedLb'),
    legend: document.getElementById('legend'),
    fCur: document.getElementById('fCur'),
    fWarm: document.getElementById('fWarm'),
    fCold: document.getElementById('fCold'),
    fUw: document.getElementById('fUw'),
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

  var TYPE_LABEL = { warm: '暖流', cold: '寒流' };
  var SEASON_LABEL = { all: '全年', winter: '冬季', summer: '夏季' };
  var OCEAN_SHORT = { pacific: '太平', atlantic: '大西', indian: '印度', arctic: '北冰洋', southern: '南大洋' };
  var UW_LINK = CFG.uwLink;

  /* ── 几何：墨卡托 / 重采样 / 拆段 ─────────────────────────── */
  function mercY(lat) {
    var s = Math.sin(lat * Math.PI / 180);
    return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI);
  }
  /* 把经度绕回 [-180,180]（unwrap 后的插值点用） */
  function wrapLng(lng) { return ((lng + 180) % 360 + 360) % 360 - 180; }
  /* 平面近似里程（km，低纬足够；精确流程 stats.json 已用 haversine 算好） */
  function segKm(a, b) {
    var dx = (b[0] - a[0]) * Math.cos((a[1] + b[1]) / 2 * Math.PI / 180);
    var dy = b[1] - a[1];
    return Math.sqrt(dx * dx + dy * dy) * 111.32;
  }

  /* 按 |Δlng| ≥ 180° 拆段（反子午线）。返回 [{coords, off}]，
     off 是该段的 unwrap 偏移（第二段 +360，重采样时用） */
  function splitSegments(coords) {
    var segs = [], cur = [], off = 0;
    for (var i = 0; i < coords.length; i++) {
      if (i > 0) {
        var d = coords[i][0] - coords[i - 1][0];
        if (d > 180 || d < -180) {
          segs.push({ coords: cur, off: off });
          cur = [];
          off += (d > 180 ? -360 : 360);
        }
      }
      cur.push([coords[i][0], coords[i][1]]);
    }
    if (cur.length) segs.push({ coords: cur, off: off });
    return segs;
  }

  /* 段内重采样成 n 个等距点，每点带切向角（墨卡托屏幕坐标，度，0=东 顺时针） */
  function resample(coords, off, n) {
    if (!coords || coords.length < 2) {
      return { pts: coords && coords.length ? [{ lng: coords[0][0], lat: coords[0][1], rot: 0 }] : [], km: 0 };
    }
    var acc = [0], total = 0, i;
    for (i = 1; i < coords.length; i++) {
      total += segKm(coords[i - 1], coords[i]);
      acc.push(total);
    }
    var out = [];
    for (i = 0; i < n; i++) {
      var target = total * i / (n - 1), k = 1;
      while (k < acc.length - 1 && acc[k] < target) k++;
      var a = coords[k - 1], b = coords[k];
      var f = (acc[k] - acc[k - 1]) > 0 ? (target - acc[k - 1]) / (acc[k] - acc[k - 1]) : 0;
      var lng = a[0] + (b[0] - a[0]) * f;
      var lat = a[1] + (b[1] - a[1]) * f;
      /* 切向：unwrap 后求墨卡托平面方向（屏幕 y 向下） */
      var l1 = a[0] + off, l2 = b[0] + off;
      var rot = Math.atan2(mercY(b[1]) - mercY(a[1]), l2 - l1) * 180 / Math.PI;
      out.push({ lng: lng, lat: lat, rot: rot });
    }
    return { pts: out, km: total };
  }

  /* 按路径比例 t∈[0,1] 取点（经纬度线性插值 + 最近点切向角） */
  function sampleAt(rs, t) {
    var pts = rs.pts, n = pts.length;
    if (n === 0) return null;
    var x = Math.max(0, Math.min(n - 1.001, t * (n - 1)));
    var i0 = Math.floor(x), f = x - i0;
    var a = pts[i0], b = pts[Math.min(n - 1, i0 + 1)];
    return {
      lng: wrapLng(a.lng + (b.lng - a.lng) * f),
      lat: a.lat + (b.lat - a.lat) * f,
      rot: f < 0.5 ? a.rot : b.rot
    };
  }

  /* ── 箭头图标（暖红 / 寒蓝，data URI SVG） ────────────────── */
  function arrowSvg(color) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">' +
      '<path d="M4 14 H17" stroke="' + color + '" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M13 7 L22 14 L13 21 Z" fill="' + color + '"/></svg>');
  }
  var IMG_READY = { warm: false, cold: false };
  function ensureArrowImages() {
    ['warm', 'cold'].forEach(function (t) {
      if (IMG_READY[t] || !app.map.hasImage) return;
      var img = new Image();
      img.onload = function () {
        try {
          if (!app.map.hasImage('arrow-' + t)) app.map.addImage('arrow-' + t, img, { pixelRatio: 2 });
          IMG_READY[t] = true;
        } catch (e) { /* 重复 addImage 忽略 */ }
      };
      img.src = arrowSvg(CFG.typeColors[t]);
    });
  }

  /* Esri 瓦片：{s} 展开成 0~3（host 无数字后缀，保留占位与引擎约定一致） */
  function esriTiles(url) {
    return ['0', '1', '2', '3'].map(function (s) { return url; });
  }

  var app = Thematic.create({
    slug: 'world-currents',
    /* 默认底图 = 卫星影像（Esri World Imagery）：真实地球表面，洋流红蓝线
       与流动粒子在影像上最有「全球环流」的实感；imgPaint 已对影像压暗，
       避免细线被影像噪声吃掉。浅底（晕渲）与深色仍保留为可选项。 */
    defaultBasemap: 'img',
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
      'src-cur': { data: Thematic.EMPTY },
      'src-sel': { data: Thematic.EMPTY },
      'src-arrow': { data: Thematic.EMPTY },
      'src-uw': { data: Thematic.EMPTY },
      'src-uw-sel': { data: Thematic.EMPTY }
    },
    layers: [
      /* 洋流光晕（底层宽线压淡，营造「水流」体积感） */
      { id: 'cur-glow-base', type: 'line', source: 'src-cur',
        paint: {
          'line-color': ['match', ['get', 'type'], 'warm', CFG.typeColors.warm, 'cold', CFG.typeColors.cold, '#ffffff'],
          'line-width': ['interpolate', ['linear'], ['zoom'],
            1, CFG.glowWidth[0][1], 3, CFG.glowWidth[1][1], 5, CFG.glowWidth[2][1], 8, CFG.glowWidth[3][1]],
          'line-opacity': 0.1,
          'line-blur': 3
        } },
      /* 洋流线深色描边（casing）：晕渲/卫星是浅底，没有深色打底红蓝线会糊进地形 */
      { id: 'cur-line-case', type: 'line', source: 'src-cur',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': 'rgba(4, 10, 20, 0.55)',
          'line-width': ['interpolate', ['linear'], ['zoom'],
            1, CFG.lineWidth[0][1] * 1.9, 3, CFG.lineWidth[1][1] * 1.9, 5, CFG.lineWidth[2][1] * 1.9, 8, CFG.lineWidth[3][1] * 1.9],
          'line-opacity': 0.75
        } },
      /* 洋流主线：数据侧已做 Catmull-Rom 平滑（柔美化），这里 line-join round 收尾 */
      { id: 'cur-line', type: 'line', source: 'src-cur',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['match', ['get', 'type'], 'warm', CFG.typeColors.warm, 'cold', CFG.typeColors.cold, '#ffffff'],
          'line-width': ['interpolate', ['linear'], ['zoom'],
            1, CFG.lineWidth[0][1], 3, CFG.lineWidth[1][1], 5, CFG.lineWidth[2][1], 8, CFG.lineWidth[3][1]],
          'line-opacity': 0.9
        } },
      /* 命中专用：12px 透明粗线（queryRenderedFeatures 与绘制无关，opacity 0 也能命中） */
      { id: 'cur-hit', type: 'line', source: 'src-cur',
        layout: { visibility: 'visible' },
        paint: {
          'line-color': 'rgba(0,0,0,0)',
          'line-width': ['interpolate', ['linear'], ['zoom'], 1, 12, 5, 18],
          'line-opacity': 0
        } },
      /* 选中洋流：白色描边 */
      { id: 'cur-sel', type: 'line', source: 'src-sel', layout: { visibility: 'none' },
        paint: {
          'line-color': '#ffffff',
          'line-width': ['interpolate', ['linear'], ['zoom'], 1, 3, 5, 6.5],
          'line-opacity': 0.95
        } },
      /* 方向箭头：每洋流 1 个、低透明，仅 zoom ≥ arrowShowZoom 显示（总览不抢戏）。
         位置固定取路径 1/4 处、不随动画动（方向指示），所以只在筛选时 setData 一次。
         ⚠️ 自托管 maplibre 是 v5.24：symbol 透明度在 paint.icon-opacity
         （不是 layout.icon-opacity，也不是 paint.symbol-opacity，两者都报
         unknown property 并让整个 style 加载失败 → getStyle() undefined） */
      { id: 'cur-arrow', type: 'symbol', source: 'src-arrow',
        layout: {
          'icon-image': ['get', 'img'],
          'icon-rotate': ['get', 'rot'],
          'icon-size': ['interpolate', ['linear'], ['zoom'],
            3, CFG.arrowSize[0][1], 6, CFG.arrowSize[1][1]],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'visibility': 'none'
        },
        paint: { 'icon-opacity': 0.55 } },
      /* 沿岸上升流区（金点） */
      { id: 'uw-pt', type: 'circle', source: 'src-uw',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 3.5, 5, 6],
          'circle-color': CFG.uwColor,
          'circle-opacity': 0.95,
          'circle-stroke-width': 1.2,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.85
        } },
      /* 选中上升流：白环 */
      { id: 'uw-sel', type: 'circle', source: 'src-uw-sel', layout: { visibility: 'none' },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 9, 5, 16],
          'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-width': 2.4,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.9
        } }
    ],
    onReady: boot,
    onOverview: function () { clearSel(); fitAllSafe(true); },
    onClose: function () { clearSel(); }
  });

  /* ── 预处理：拆段 + 重采样 + ±360° 三副本 ──────────────────
     renderWorldCopies 下，底图会左右平铺多个「世界副本」。若数据只有原生
     [-180,180] 一份，pan 到别的副本时太平洋等跨经线洋流就只剩半条、标注也不在
     视野（"另一页才看到"）。所以每条洋流线段都再生成 -360 / 0 / +360 三份，
     保证每个副本里都有完整洋流与标注。 */
  function densityN(coords) {
    /* 按经纬度跨度估取点数：长洋流多取（原固定 48 对长流太稀 → 折线感），短流保底 64 */
    var n = coords.length, minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
    for (var i = 0; i < n; i++) {
      var c = coords[i];
      if (c[0] < minLng) minLng = c[0]; if (c[0] > maxLng) maxLng = c[0];
      if (c[1] < minLat) minLat = c[1]; if (c[1] > maxLat) maxLat = c[1];
    }
    var span = Math.max(maxLng - minLng, maxLat - minLat);
    return Math.min(500, Math.max(64, Math.round(span / 0.3)));
  }

  function prepLines(fc) {
    var lines = [];
    fc.features.forEach(function (f) {
      var segs = splitSegments(f.geometry.coordinates);
      segs.forEach(function (sg, si) {
        var rs = resample(sg.coords, sg.off, densityN(sg.coords));
        [-360, 0, 360].forEach(function (shift) {
          lines.push({
            type: 'Feature',
            properties: { curId: f.properties.id, type: f.properties.type, segIdx: si, shift: shift },
            geometry: { type: 'LineString', coordinates: sg.coords.map(function (c) { return [c[0] + shift, c[1]]; }) },
            __rs: { pts: rs.pts.map(function (p) { return { lng: p.lng + shift, lat: p.lat, rot: p.rot }; }), km: rs.km }
          });
        });
      });
    });
    return lines;
  }

  /* ── 筛选 ─────────────────────────────────────────────────── */
  function passCurrent(p) {
    if (S.type !== 'all' && p.type !== S.type) return false;
    if (S.ocean !== 'all' && p.ocean !== S.ocean) return false;
    if (p.season !== 'all' && p.season !== S.season) return false;
    return true;
  }

  function applyFilter() {
    S.view = S.all.filter(function (f) { return passCurrent(f.properties); });
    var feats = S.lines.filter(function (l) {
      var p = S.byId[l.properties.curId].properties;
      return passCurrent(p);
    });
    app.map.getSource('src-cur').setData({ type: 'FeatureCollection', features: feats });

    /* 上升流：季节流（索马里）只在夏季显示 */
    var uwFeats = S.uw.filter(function (f) {
      return f.properties.season === 'all' || f.properties.season === S.season;
    });
    app.map.getSource('src-uw').setData({ type: 'FeatureCollection', features: uwFeats });

    /* 选中项被筛掉则清除 */
    if (S.selCur && !S.view.some(function (f) { return f.properties.id === S.selCur.id; })) clearSel();
    if (S.selUw && !uwFeats.some(function (f) { return f.properties.id === S.selUw.id; })) clearSel();

    setLabels();
    syncUI();
    setArrows();
    buildField();   // 筛选变化后重建流向场（可见洋流变了）
  }

  /* ── 流动粒子（#fx overlay canvas，“流场”方案，移植自 leaflet-velocity）──
     leaflet-velocity 的精髓：粒子不在一条线上跑，而是在 (u,v) 速度场里自由平流。
     我们把它移植到 MapLibre：把洋流折线栅格化成流向场，粒子在屏幕空间按
     “投影反演”得到当地流向，沿矢量流动、拖尾、老化重生。
     三要素（缺一会像在跳）：
     ① 拖尾：destination-out 减 alpha 渐隐（不是盖半透明黑，那会累积黑幕遮底图）；
     ② 流速：基础 ~58px/s，暖 1.0×、寒 0.6×，肉眼能读出“在流动”；
     ③ 生灭：粒子老化后随机重生，制造连续流动的趋势感，而非齐步走的珠子。 */
  var lastTs = 0;
  var fx = null, fxCtx = null, fxDpr = 1;
  var field = { segs: [], buckets: {}, cell: 2.0, R: 2.6 };
  var particles = [];

  function initFx() {
    fx = document.getElementById('fx');
    if (!fx) return;
    fxCtx = fx.getContext('2d');
    fxCtx.lineCap = 'round';
    fxCtx.lineJoin = 'round';
    resizeFx();
    window.addEventListener('resize', function () { resizeFx(); clearFx(); });
    if (app.map) {
      app.map.on('resize', function () { resizeFx(); clearFx(); });
      /* 相机一动，旧拖尾的投影坐标就失效，先清掉再让渐隐接管 */
      app.map.on('movestart', clearFx);
      app.map.on('zoomstart', clearFx);
    }
  }
  function resizeFx() {
    if (!fx) return;
    fxDpr = Math.min(2, window.devicePixelRatio || 1);
    fx.width = Math.max(1, Math.round(fx.clientWidth * fxDpr));
    fx.height = Math.max(1, Math.round(fx.clientHeight * fxDpr));
  }
  function clearFx() { if (fxCtx) fxCtx.clearRect(0, 0, fx.width, fx.height); }

  /* 把当前可见洋流折线栅格化成流向场：每段存原始单位切向 (ux,uy) 与速度倍率，
     按 2° 格网桶索引，供 sampleField 快速最近段查询 */
  function buildField() {
    field.segs = [];
    field.buckets = {};
    field.R = CFG.flowRadiusDeg;
    S.lines.forEach(function (l) {
      var p = S.byId[l.properties.curId].properties;
      if (!passCurrent(p)) return;
      var c = l.geometry.coordinates;
      for (var i = 0; i < c.length - 1; i++) {
        var a = c[i], b = c[i + 1];
        var dlng = b[0] - a[0], dlat = b[1] - a[1];
        var len = Math.sqrt(dlng * dlng + dlat * dlat);
        if (len < 1e-6) continue;
        var ux = dlng / len, uy = dlat / len;
        var idx = field.segs.length;
        field.segs.push({
          aLng: a[0], aLat: a[1], bLng: b[0], bLat: b[1],
          ux: ux, uy: uy,
          speed: CFG.animBase[p.type] || 1,
          color: CFG.dotColors[p.type] || '#fff'
        });
        var mlng = (a[0] + b[0]) / 2, mlat = (a[1] + b[1]) / 2;
        var key = Math.round(mlng / field.cell) + ',' + Math.round(mlat / field.cell);
        (field.buckets[key] || (field.buckets[key] = [])).push(idx);
      }
    });
  }

  /* 点到线段距离平方（等距矩形近似：经度按 cos(lat) 折算） */
  function distToSeg(lng, lat, s) {
    var ax = (s.aLng - lng) * Math.cos(lat * Math.PI / 180);
    var ay = (s.aLat - lat);
    var bx = (s.bLng - lng) * Math.cos(lat * Math.PI / 180);
    var by = (s.bLat - lat);
    var dx = bx - ax, dy = by - ay;
    var L2 = dx * dx + dy * dy;
    var t = L2 > 0 ? (ax * dx + ay * dy) / L2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    var px = ax + dx * t, py = ay + dy * t;
    return px * px + py * py;
  }

  /* 查询某经纬度的流向：返回 {ux,uy,speed,color} 或 null（走廊外） */
  function sampleField(lng, lat) {
    if (!field.segs.length) return null;
    var bi = Math.round(lng / field.cell), bj = Math.round(lat / field.cell);
    var best = -1, bestD = field.R * field.R;
    for (var di = -1; di <= 1; di++) for (var dj = -1; dj <= 1; dj++) {
      var arr = field.buckets[(bi + di) + ',' + (bj + dj)];
      if (!arr) continue;
      for (var k = 0; k < arr.length; k++) {
        var s = field.segs[arr[k]];
        var d = distToSeg(lng, lat, s);
        if (d < bestD) { bestD = d; best = arr[k]; }
      }
    }
    if (best < 0) return null;
    var s2 = field.segs[best];
    var d2 = Math.sqrt(bestD);
    var fall = 1 - d2 / field.R;          // 走廊中心强、边缘弱
    if (fall <= 0) return null;
    return { ux: s2.ux, uy: s2.uy, speed: s2.speed * fall, color: s2.color };
  }

  /* 粒子池：初始化后只重生、不增删 */
  function initParticles() {
    particles = [];
    for (var i = 0; i < CFG.flowParticles; i++) particles.push(spawnParticle(true));
  }

  /* 重生：在随机可见洋流段上取点，沿垂直方向在走廊内随机偏移成“带”。
     first=true 时随机给年龄，避免一齐生灭。坐标用 CSS 像素。 */
  function spawnParticle(first) {
    var map = app.map;
    var W = fx.width / fxDpr, H = fx.height / fxDpr;
    for (var tries = 0; tries < 10; tries++) {
      var s = field.segs[(Math.random() * field.segs.length) | 0];
      if (!s) return { x: -999, y: -999, age: 0, dead: true };
      var t = Math.random();
      var lng = s.aLng + (s.bLng - s.aLng) * t;
      var lat = s.aLat + (s.bLat - s.aLat) * t;
      var A = map.project([lng, lat]);
      /* 屏幕方向（投影反演，自动含墨卡托修正） */
      var B = map.project([lng + s.ux * 0.02, lat + s.uy * 0.02]);
      var dx = B.x - A.x, dy = B.y - A.y, dl = Math.hypot(dx, dy) || 1;
      var dirx = dx / dl, diry = dy / dl;
      var off = (Math.random() * 2 - 1) * CFG.flowBandPx;
      var x = A.x + (-diry) * off, y = A.y + dirx * off;
      if (x > -40 && x < W + 40 && y > -40 && y < H + 40) {
        return { x: x, y: y, age: first ? (Math.random() * CFG.flowMaxAge) | 0 : 0, dead: false };
      }
    }
    return { x: -999, y: -999, age: 0, dead: true };
  }

  function tick(ts) {
    requestAnimationFrame(tick);
    if (!lastTs) lastTs = ts;
    var dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    if (S.speed <= 0) return;            /* 暂停：冻结画面（拖尾留在原位） */
    stepParticles(dt * S.speed);
  }

  /* 每帧：destination-out 渐隐旧帧 → 按当地流向平流粒子 */
  function stepParticles(dt) {
    if (!fxCtx || !S.showFlow) return;
    var map = app.map;
    /* ① 拖尾核心：减 alpha 渐隐（不是盖半透明黑，那会累积成黑幕） */
    fxCtx.globalCompositeOperation = 'destination-out';
    fxCtx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    fxCtx.fillRect(0, 0, fx.width, fx.height);
    fxCtx.globalCompositeOperation = 'source-over';

    var W = fx.width / fxDpr, H = fx.height / fxDpr;
    var w = CFG.flowWidth * fxDpr;
    var sp = CFG.flowSpeed * dt;
    for (var i = 0; i < particles.length; i++) {
      var pt = particles[i];
      if (pt.dead || pt.age > CFG.flowMaxAge) { particles[i] = spawnParticle(false); continue; }
      pt.age++;
      var ll = map.unproject([pt.x, pt.y]);
      var f = sampleField(ll.lng, ll.lat);
      if (!f) { pt.dead = true; continue; }
      /* 屏幕方向（投影反演，自动含墨卡托修正） */
      var A = map.project([ll.lng, ll.lat]);
      var B = map.project([ll.lng + f.ux * 0.02, ll.lat + f.uy * 0.02]);
      var dx = B.x - A.x, dy = B.y - A.y, dl = Math.hypot(dx, dy);
      if (dl < 1e-6) { pt.dead = true; continue; }
      var dirx = dx / dl, diry = dy / dl;
      var step = sp * f.speed;
      var nx = pt.x + dirx * step, ny = pt.y + diry * step;
      /* 出屏（且仍在洋流上）的粒子回收重生，保持可视区密度 */
      if (nx < -60 || nx > W + 60 || ny < -60 || ny > H + 60) { pt.dead = true; continue; }
      var px = pt.x * fxDpr, py = pt.y * fxDpr;
      var ex = nx * fxDpr, ey = ny * fxDpr;
      /* 深色 halo：晕渲/卫星浅底下，亮色粒子没有深色外圈会糊进地形。
         先画宽深色，再画亮色芯——同一条 path 代价可忽略。 */
      fxCtx.strokeStyle = 'rgba(3, 8, 16, 0.30)';
      fxCtx.lineWidth = w * 2.3;
      fxCtx.beginPath(); fxCtx.moveTo(px, py); fxCtx.lineTo(ex, ey); fxCtx.stroke();
      fxCtx.strokeStyle = f.color;
      fxCtx.lineWidth = w;
      fxCtx.beginPath(); fxCtx.moveTo(px, py); fxCtx.lineTo(ex, ey); fxCtx.stroke();
      pt.x = nx; pt.y = ny;
    }
  }

  /* 方向箭头：位置固定（路径 1/4 处）、不随动画动，筛选/显隐时 setData 一次即可 */
  function setArrows() {
    var src = app.map.getSource('src-arrow');
    if (!src) return;
    var feats = [];
    for (var i = 0; i < S.lines.length; i++) {
      var l = S.lines[i];
      var p = S.byId[l.properties.curId].properties;
      if (!passCurrent(p)) continue;
      var at = sampleAt(l.__rs, 0.25);
      if (!at) continue;
      feats.push({
        type: 'Feature',
        properties: {
          img: p.type === 'warm' ? 'arrow-warm' : 'arrow-cold',
          rot: at.rot
        },
        geometry: { type: 'Point', coordinates: [at.lng, at.lat] }
      });
    }
    src.setData({ type: 'FeatureCollection', features: feats });
  }

  /* 箭头层按缩放显隐：总览（全球视野）只留粒子，放大后才出方向箭头 */
  function syncArrowZoom() {
    if (app.map.getLayer('cur-arrow')) {
      app.setVisible('cur-arrow', app.map.getZoom() >= CFG.arrowShowZoom);
    }
  }

  /* ── 图例 ─────────────────────────────────────────────────── */
  function renderLegend() {
    var html = '<div class="lg-cap">洋流性质</div>' +
      '<span class="lg-row"><i style="background:' + CFG.typeColors.warm + '"></i>暖流（低纬 → 高纬）</span>' +
      '<span class="lg-row"><i style="background:' + CFG.typeColors.cold + '"></i>寒流（高纬 → 低纬）</span>' +
      '<div class="lg-cap" style="margin-top:5px">叠加层</div>' +
      '<span class="lg-row"><s style="background:' + CFG.uwColor + '"></s>沿岸上升流渔场</span>' +
      '<span class="lg-row"><i style="background:rgba(255,255,255,.55);height:2px"></i>粒子 = 水流方向</span>';
    el.legend.innerHTML = html;
  }

  /* ── 标注：洋流名（AABB 碰撞，长洋流优先拿标签） ──────────── */
  /* 太平洋 / 大西洋 / 印度洋各有一条「北赤道暖流」「南赤道暖流」，
     同名洋流在标签上加大洋短后缀，否则世界地图上两个同名标签无法分辨 */
  function dupNames() {
    var cnt = {};
    S.all.forEach(function (f) { cnt[f.properties.name] = (cnt[f.properties.name] || 0) + 1; });
    return cnt;
  }

  function setLabels() {
    if (!S.view.length) { app.setLabels([]); return; }
    var map = app.map, z = map.getZoom();
    var dup = dupNames();

    /* 候选：按长度降序，长洋流优先拿标签（与之前一致） */
    var cands = S.view.filter(function (f) {
      return !(f.properties.season !== 'all' && f.properties.season !== S.season);
    }).sort(function (a, b) { return b.properties.lenKm - a.properties.lenKm; });

    var boxes = [];
    var FS = z < 3 ? 11 : 12;
    function hits(b) {
      for (var i = 0; i < boxes.length; i++) {
        var o = boxes[i];
        if (b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0) return true;
      }
      return false;
    }
    /* MAX 控制「参与标注的洋流条数」上限（长流优先）；每条洋流同时生成
       -360/0/+360 三份标注，由引擎在底图平移时显示落在视野内的那份——
       这样无论左右滑到哪个世界副本，洋流与名字都完整可见。 */
    var MAX = z < 2.6 ? 14 : (z < 4.5 ? 24 : 38);
    var items = [];
    cands.forEach(function (f) {
      if (items.length >= MAX * 3) return;
      var p = f.properties;
      var c = f.geometry.coordinates[Math.floor(f.geometry.coordinates.length / 2)];
      var txt = p.name + (dup[p.name] > 1 ? '·' + (OCEAN_SHORT[p.ocean] || '') : '');
      var w = txt.length * FS * 0.95 + 20;
      var h = FS * 1.9;
      [-360, 0, 360].forEach(function (sh) {
        var lngS = c[0] + sh;
        var pt = map.project([lngS, c[1]]);
        var box = { x0: pt.x - w / 2, x1: pt.x + w / 2, y0: pt.y - h / 2, y1: pt.y + h / 2 };
        if (hits(box)) return;
        boxes.push(box);
        items.push({
          text: txt, lng: lngS, lat: c[1],
          color: CFG.typeColors[p.type], kind: 'tag',
          active: S.selCur === p
        });
      });
    });
    app.setLabels(items);
  }

  /* ── 详情卡 ───────────────────────────────────────────────── */
  function plainFeature(f) {
    return {
      type: 'Feature',
      properties: JSON.parse(JSON.stringify(f.properties)),
      geometry: { type: 'Point', coordinates: [f.geometry.coordinates[0], f.geometry.coordinates[1]] }
    };
  }

  function selLineFeatures(id) {
    return S.lines.filter(function (l) { return l.properties.curId === id; })
      .map(function (l) {
        return {
          type: 'Feature',
          properties: { curId: id },
          geometry: { type: 'LineString', coordinates: l.geometry.coordinates }
        };
      });
  }

  function selectCurrent(id, move) {
    var f = S.byId[id];
    if (!f) return;
    var p = f.properties;
    S.selCur = p;
    S.selUw = null;

    app.map.getSource('src-uw-sel').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('uw-sel', 'visibility', 'none');

    app.map.getSource('src-sel').setData({ type: 'FeatureCollection', features: selLineFeatures(id) });
    app.map.setLayoutProperty('cur-sel', 'visibility', 'visible');

    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', CFG.typeColors[p.type]);

    el.dtRole.textContent = 'OCEAN CURRENT';
    el.dtName.textContent = p.name;
    el.dtSub.textContent = [TYPE_LABEL[p.type] || p.type, CFG.oceanLabels[p.ocean],
      p.season !== 'all' ? SEASON_LABEL[p.season] + '流' : null].filter(Boolean).join(' · ');

    el.dtLb1.textContent = '流程';
    el.dtV1.textContent = fmt(p.lenKm, 0);
    el.dtU1.textContent = 'km';
    el.dtLb2.textContent = '表层流速';
    el.dtV2.textContent = p.speed;
    el.dtU2.textContent = '';
    el.dtLb3.textContent = '输送量';
    el.dtV3.textContent = p.flow;
    el.dtU3.textContent = '';

    el.dtDescLb.textContent = '路径与特点';
    el.dtDesc.textContent = '「' + p.from + ' → ' + p.to + '」。' + p.desc;

    el.dtFooter.innerHTML = '<span>' + esc(p.en) + '</span>' +
      (p.season !== 'all' ? '<span>' + SEASON_LABEL[p.season] + '出现</span>' : '') +
      '<span>' + esc(TYPE_LABEL[p.type] || '') + ' · ' + esc(CFG.oceanLabels[p.ocean] || '') + '</span>';

    setLabels();
    if (move) {
      var mid = f.geometry.coordinates[Math.floor(f.geometry.coordinates.length / 2)];
      app.map.easeTo({ center: mid, zoom: Math.max(app.map.getZoom(), 3.5), duration: 760 });
    }
  }

  function selectUw(f, move) {
    var p = f.properties;
    S.selUw = p;
    S.selCur = null;

    app.map.getSource('src-sel').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('cur-sel', 'visibility', 'none');

    app.map.getSource('src-uw-sel').setData({ type: 'FeatureCollection', features: [plainFeature(f)] });
    app.map.setLayoutProperty('uw-sel', 'visibility', 'visible');

    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', CFG.uwColor);

    el.dtRole.textContent = 'UPWELLING ZONE';
    el.dtName.textContent = p.name;
    el.dtSub.textContent = '沿岸上升流 · ' + (CFG.oceanLabels[p.ocean] || p.ocean) +
      (p.season !== 'all' ? ' · ' + SEASON_LABEL[p.season] + '出现' : ' · 全年');

    el.dtLb1.textContent = '类型';
    el.dtV1.textContent = '风生上升流';
    el.dtU1.textContent = '';
    el.dtLb2.textContent = '活跃期';
    el.dtV2.textContent = SEASON_LABEL[p.season];
    el.dtU2.textContent = '';
    el.dtLb3.textContent = '关联洋流';
    var link = S.byId[UW_LINK[p.id]];
    el.dtV3.textContent = link ? link.properties.name : '—';
    el.dtU3.textContent = '';

    el.dtDescLb.textContent = '为什么出大鱼';
    el.dtDesc.textContent = '代表渔场：' + p.fishery + '。' + p.desc;

    el.dtFooter.innerHTML = '<span>' + esc(p.en) + '</span>' +
      (link ? '<span>驱动：' + esc(link.properties.en) + '</span>' : '');

    setLabels();
    if (move) {
      app.map.easeTo({
        center: f.geometry.coordinates,
        zoom: Math.max(app.map.getZoom(), 4),
        duration: 760
      });
    }
  }

  function clearSel() {
    S.selCur = null;
    S.selUw = null;
    app.map.getSource('src-sel').setData(Thematic.EMPTY);
    app.map.getSource('src-uw-sel').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('cur-sel', 'visibility', 'none');
    app.map.setLayoutProperty('uw-sel', 'visibility', 'none');
    app.setDetailOpen(false);
    el.detail.hidden = true;
    setLabels();
  }

  /* ── 命中 ─────────────────────────────────────────────────── */
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
      if (!g) continue;
      var pr = (g.type === 'Point') ? map.project(g.coordinates) : null;
      if (!pr) continue;
      var d = (pr.x - px) * (pr.x - px) + (pr.y - py) * (pr.y - py);
      if (d < bd) { bd = d; best = list[i]; }
    }
    return best;
  }

  /* ── 交互绑定 ─────────────────────────────────────────────── */
  function bind() {
    app.map.on('zoom', function () { syncArrowZoom(); });
    /* 流动条纹是 canvas 层，引擎的 data-toggle-layer 管不到，单独监听 */
    var ckFlow = document.getElementById('ckArrow');
    if (ckFlow) ckFlow.addEventListener('change', function () {
      S.showFlow = this.checked;
      if (!S.showFlow) clearFx();
    });
    app.map.on('mousemove', function (e) {
      var c = pickNearest(e.point, 'cur-hit', 4);
      if (c) {
        var p = S.byId[c.properties.curId].properties;
        app.map.getCanvas().style.cursor = 'pointer';
        app.tooltip('<b>' + esc(p.name) + '</b> <span style="color:' + CFG.typeColors[p.type] + '">' +
          (TYPE_LABEL[p.type] || '') + '</span><br><span style="color:#9fb4cd">' +
          esc(CFG.oceanLabels[p.ocean] || '') + ' · 流程 ' + fmt(p.lenKm, 0) + ' km</span>',
          e.point.x, e.point.y);
        return;
      }
      var u = pickNearest(e.point, 'uw-pt', 4);
      if (u) {
        app.map.getCanvas().style.cursor = 'pointer';
        app.tooltip('<b>' + esc(u.properties.name) + '</b> <span style="color:' + CFG.uwColor + '">上升流</span>' +
          '<br><span style="color:#9fb4cd">' + esc(u.properties.fishery) + '</span>', e.point.x, e.point.y);
        return;
      }
      app.map.getCanvas().style.cursor = '';
      app.tooltip(null);
    });
    app.map.on('mouseleave', function () { app.tooltip(null); });

    app.map.on('click', function (e) {
      var c = pickNearest(e.point, 'cur-hit', 4);
      if (c) { app.collapseDrawer(); selectCurrent(c.properties.curId, true); return; }
      var u = pickNearest(e.point, 'uw-pt', 4);
      if (u) { app.collapseDrawer(); selectUw(u, true); return; }
      clearSel();
    });

    el.segType.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.type = b.dataset.v;
      applyFilter();
    });
    el.chipOcean.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.ocean = b.dataset.v;
      applyFilter();
    });
    el.segSeason.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.season = b.dataset.v;
      applyFilter();
    });
    el.segSpeed.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.speed = parseFloat(b.dataset.v);
      syncUI();
    });
  }

  /* ── UI 同步 ──────────────────────────────────────────────── */
  function syncUI() {
    Array.prototype.forEach.call(el.segType.children, function (b) {
      b.classList.toggle('active', b.dataset.v === S.type);
    });
    Array.prototype.forEach.call(el.chipOcean.children, function (b) {
      b.classList.toggle('active', b.dataset.v === S.ocean);
    });
    Array.prototype.forEach.call(el.segSeason.children, function (b) {
      b.classList.toggle('active', b.dataset.v === S.season);
    });
    Array.prototype.forEach.call(el.segSpeed.children, function (b) {
      b.classList.toggle('active', parseFloat(b.dataset.v) === S.speed);
    });

    el.typeN.textContent = S.view.length + ' 条';
    var t = S.type === 'all' ? '全部洋流' : TYPE_LABEL[S.type];
    el.typeNote.textContent = S.type === 'all'
      ? '显示全部 ' + S.view.length + ' 条主要洋流。点暖流 / 寒流可单独观察一类的地理分布。'
      : '仅显示' + t + ' ' + S.view.length + ' 条 —— ' + (S.type === 'warm'
        ? '大陆东岸与西风带是暖流的主通道。'
        : '大陆西岸与高纬海区是寒流的主通道。');

    el.oceanLb.textContent = CFG.oceanLabels[S.ocean];
    el.oceanNote.textContent = S.ocean === 'all'
      ? '按海盆过滤。南大洋只有两条——西风漂流与极地东风漂流——但前者是全球最长、输送量最大的洋流。'
      : '当前海盆：' + CFG.oceanLabels[S.ocean] + '，共 ' + S.view.length + ' 条。';

    el.seasonLb.textContent = SEASON_LABEL[S.season];
    el.seasonNote.textContent = S.season === 'winter'
      ? '北印度洋是全球唯一整体随季风换向的大洋：冬季洋流自东向西。切到夏季，整片海域会集体掉头，索马里寒流（蓝）沿非洲之角出现。'
      : '夏季北印度洋整体自西向东，索马里寒流（蓝）与西南季风洋流（红）同时出现——这是全年唯一能同时看到「洋流换向 + 夏季寒流」的季节。';

    el.speedLb.textContent = CFG.speedLabels[String(S.speed)] || '常速';
  }

  /* ── 适配视野 ───────────────────────────────────────────────
     src-cur 里每条洋流有 -360/0/+360 三份副本，app.fitAll 会把整个世界副本
     都框进去（跨度 >360° → 缩到极小）。这里只按原生（S.all，已包回 [-180,180]）
     坐标算 bbox 再 fit，初始 / 总览都能正常取景。 */
  function fitAllSafe(animate) {
    var b = [180, 90, -180, -90];   // [minLng, minLat, maxLng, maxLat]
    S.all.forEach(function (f) {
      f.geometry.coordinates.forEach(function (c) {
        if (c[0] < b[0]) b[0] = c[0];
        if (c[0] > b[2]) b[2] = c[0];
        if (c[1] < b[1]) b[1] = c[1];
        if (c[1] > b[3]) b[3] = c[1];
      });
    });
    /* Web Mercator 纬度上限 ~85.05，fitBounds 越界会抛 Invalid LngLat
       并炸掉整个 boot 链（粒子 rAF 就不再启动）——这里硬 clamp 兜底 */
    var s = Math.max(-85, b[1] - 4), n = Math.min(85, b[3] + 4);
    app.map.fitBounds([[b[0] - 4, s], [b[2] + 4, n]],
      { animate: !!animate, padding: 24, maxZoom: 4, duration: animate ? 700 : 0 });
  }

  /* ── 启动 ─────────────────────────────────────────────────── */
  function boot() {
    Promise.all([
      fetch(DATA.currents).then(function (r) { return r.json(); }),
      fetch(DATA.upwelling).then(function (r) { return r.json(); }),
      fetch(DATA.stats).then(function (r) { return r.json(); })
    ]).then(function (res) {
      var currentsFc = res[0], uwFc = res[1], stats = res[2];

      S.all = currentsFc.features;
      S.all.forEach(function (f) { S.byId[f.properties.id] = f; });
      S.lines = prepLines(currentsFc);
      S.uw = uwFc.features;
      S.stats = stats;

      el.fCur.textContent = stats.nCurrents;
      el.fWarm.textContent = stats.nWarm;
      el.fCold.textContent = stats.nCold;
      el.fUw.textContent = stats.nUpwelling;

      renderLegend();
      bind();
      ensureArrowImages();
      initFx();
      applyFilter();
      initParticles();
      fitAllSafe(false);
      syncArrowZoom();
      requestAnimationFrame(tick);
      window.__currentsDebug = {
        ready: true, n: S.all.length, lines: S.lines.length, uw: S.uw.length
      };
    }).catch(function (err) {
      console.error('[world-currents] 数据加载失败', err);
      el.typeNote.textContent = '数据加载失败，请刷新重试。';
    });
  }
})();
