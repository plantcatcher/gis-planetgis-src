/* 南极科考站分布地图 —— 互动逻辑（Canvas 自绘，EPSG:3031 南极极地立体投影）

   为什么不用 MapLibre：南极点（89.98°S）在 Web 墨卡托里没有定义（下限 85.05°S），
   任何墨卡托库都画不了阿蒙森-斯科特站；Esri 的南极影像瓦片服务本身就是 3031
   立体投影（非墨卡托），MapLibre 的 raster source 只认墨卡托寻址。所以这里用
   Canvas 2D 自己做相机 + 瓦片摆放 + 矢量渲染，交互习惯与全站其余专题图保持一致。

   渲染管线（每帧）：海洋背景 → 影像瓦片 → 陆地/冰架矢量 → 经纬网 → 地名 →
   站点（带贪心避让）→ 选中态。 */
(function () {
  'use strict';

  var CFG = window.ANT_CONFIG;
  var D2R = Math.PI / 180;

  /* ══ EPSG:3031 投影 ═══════════════════════════════════════ */
  var A = CFG.proj.a, E = CFG.proj.e;
  var KSQ = Math.pow(1 + E, 1 + E) * Math.pow(1 - E, 1 - E);
  var K = Math.sqrt(KSQ);
  var K0 = CFG.k0;
  function conj(ph) {
    var s = Math.sin(ph);
    return Math.pow((1 + E * s) / (1 - E * s), E / 2);
  }
  function stereoR(lat) {          // 到极点的投影半径（米）
    var ph = lat * D2R;
    var t = Math.tan(Math.PI / 4 + ph / 2) / conj(ph);
    return 2 * A * K0 * t / K;
  }
  function proj(lat, lon) {
    var r = stereoR(lat), la = lon * D2R;
    return { x: r * Math.sin(la), y: r * Math.cos(la) };
  }
  function haversine(lat1, lon1, lat2, lon2) {
    var p1 = lat1 * D2R, p2 = lat2 * D2R, dp = (lat2 - lat1) * D2R, dl = (lon2 - lon1) * D2R;
    var a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    return 6371008.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /* ══ 状态 ═════════════════════════════════════════════════ */
  var S = {
    all: [], countries: [], byCountry: {}, stats: null,
    view: [],                    // 过滤后的站点要素
    selSite: null, selCountry: null,
    q: '',
    fSeason: 'all',              // all | Y | S
    fStatus: 'all',              // all | O | C
    fZone: 'all',                // 分区代码
    showSites: true, showLabels: true, showPlaces: true, showGrat: true,
    basemap: 'vec'               // img | vec | dark
  };

  var cam = { cx: 0, cy: 0, mpp: 15000 };   // 相机中心（3031 米）与每像素米数
  var anim = null;                          // easeTo 动画句柄
  var dirty = true;

  var el = {
    cv: document.getElementById('cv'),
    wrap: document.getElementById('map'),
    labels: document.getElementById('labels'),
    intro: document.getElementById('intro'),
    introBar: document.getElementById('introBar'),
    introBarText: document.getElementById('introBarText'),
    detail: document.getElementById('detail'),
    legend: document.getElementById('legend'),
    rankList: document.getElementById('rankList'),
    rankTitle: document.getElementById('rankTitle'),
    rankNote: document.getElementById('rankNote'),
    chipZone: document.getElementById('chipZone'),
    chipSeason: document.getElementById('chipSeason'),
    chipStatus: document.getElementById('chipStatus'),
    q: document.getElementById('q'), qClear: document.getElementById('qClear'),
    qN: document.getElementById('qN'),
    panelBody: document.getElementById('panelBody'),
    panelToggle: document.getElementById('panelToggle'),
    tip: null
  };
  var dt = {};
  ['dtRole', 'dtName', 'dtSub', 'dtLb1', 'dtV1', 'dtU1', 'dtLb2', 'dtV2', 'dtU2',
   'dtLb3', 'dtV3', 'dtU3', 'dtDescLb', 'dtDesc', 'dtFooter', 'dtClose'].forEach(function (id) {
    dt[id] = document.getElementById(id);
  });

  var ctx = el.cv.getContext('2d');
  var W = 0, H = 0, DPR = 1;
  var isMobile = function () { return window.innerWidth <= 900; };

  /* ══ 工具 ═════════════════════════════════════════════════ */
  function fmt(n, d) {
    var v = Number(n);
    if (!isFinite(v)) return '—';
    var s = v.toFixed(d === undefined ? 0 : d), parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtCoord(lat, lon) {
    return Math.abs(lat).toFixed(2) + '°' + (lat >= 0 ? 'N' : 'S') + ', ' +
      Math.abs(lon).toFixed(2) + '°' + (lon >= 0 ? 'E' : 'W');
  }
  function toScreen(x, y) {
    return { x: (x - cam.cx) / cam.mpp + W / 2, y: H / 2 - (y - cam.cy) / cam.mpp };
  }
  function toWorld(sx, sy) {
    return { x: (sx - W / 2) * cam.mpp + cam.cx, y: cam.cy - (sy - H / 2) * cam.mpp };
  }
  function clampMpp(m) { return Math.min(CFG.mppMax, Math.max(CFG.mppMin, m)); }

  /* ══ 相机动画 ═════════════════════════════════════════════ */
  function easeTo(target, dur) {
    anim = {
      t0: performance.now(), dur: dur || 650,
      from: { cx: cam.cx, cy: cam.cy, mpp: cam.mpp },
      to: { cx: target.cx, cy: target.cy, mpp: clampMpp(target.mpp) }
    };
    dirty = true;
  }
  function tickAnim(now) {
    if (!anim) return false;
    var p = Math.min((now - anim.t0) / anim.dur, 1);
    var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    cam.cx = anim.from.cx + (anim.to.cx - anim.from.cx) * e;
    cam.cy = anim.from.cy + (anim.to.cy - anim.from.cy) * e;
    cam.mpp = anim.from.mpp * Math.pow(anim.to.mpp / anim.from.mpp, e);
    if (p >= 1) anim = null;
    return true;
  }

  /* 可用取景区（避开侧栏与浮层），返回世界坐标 bbox + 屏幕像素区。
     ?cover=1：封面模式，不受侧栏约束，地图占满画面。 */
  var COVER = new URLSearchParams(location.search).get('cover') === '1';
  function viewPort(withDetail) {
    if (COVER) return { l: 40, r: W - 40, t: 40, b: H - 80 };
    if (isMobile()) {
      var top = 16, bottom = H * 0.42;
      return { l: 12, r: W - 12, t: top, b: H - bottom };
    }
    var l = 352 + 32, r = W - (withDetail ? 372 : 76), t = 20, b = H - 96;
    return { l: l, r: r, t: t, b: b };
  }
  function fitBBox(bb, o) {
    o = o || {};
    var vp = viewPort(o.withDetail && !el.detail.hidden);
    var aw = Math.max(120, vp.r - vp.l), ah = Math.max(120, vp.b - vp.t);
    var mpp = clampMpp(Math.max((bb[2] - bb[0]) / aw, (bb[3] - bb[1]) / ah));
    var cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2;
    /* 让 bbox 中心落到可用区中心：屏幕 sx = (x-cx)/mpp + W/2，
       解 cx = x0 - offX*mpp（y 轴朝下同理）。offX 写反会把地图推进侧栏下面。 */
    var offX = (vp.l + vp.r) / 2 - W / 2, offY = (vp.t + vp.b) / 2 - H / 2;
    cx -= offX * mpp; cy -= offY * mpp;
    if (o.animate === false) { cam.cx = cx; cam.cy = cy; cam.mpp = mpp; dirty = true; }
    else easeTo({ cx: cx, cy: cy, mpp: mpp }, o.duration || 720);
  }
  function fitAll(o) { fitBBox(OVERVIEW_BB, o); }

  var OVERVIEW_BB = [-3450000, -3450000, 3450000, 3450000];

  /* ══ 瓦片（Esri 3031 南极影像）════════════════════════════ */
  var TILE = CFG.tileSize, ORX = CFG.tileOrigin.x, ORY = CFG.tileOrigin.y;
  var tileCache = new Map();       // key -> {img, state: 0待加载 1完成 2失败}
  var inflight = new Set();        // 已在请求中的 key（防重复发起）
  var pending = 0, queue = [];

  function pickLod() {
    var best = CFG.lods[CFG.lodMin], bd = 1e9;
    for (var i = CFG.lodMin; i <= CFG.lodMax && i < CFG.lods.length; i++) {
      var d = Math.abs(Math.log((CFG.lods[i].res * TILE / cam.mpp) / 256));
      if (d < bd) { bd = d; best = CFG.lods[i]; }
    }
    return best;
  }
  function tileKey(z, r, c) { return z + '/' + r + '/' + c; }

  function pumpTiles() {
    while (pending < 10 && queue.length) {
      var job = queue.shift();
      var key = tileKey(job.z, job.r, job.c);
      var ent = tileCache.get(key);
      if (ent && ent.state === 1) continue;   // 已有成品；空壳/失败都要发起请求
      if (inflight.has(key)) continue;
      inflight.add(key);
      var url = CFG.tileUrl.replace('{z}', job.z).replace('{y}', job.r).replace('{x}', job.c);
      var img = new Image();
      img.crossOrigin = 'anonymous';
      pending++;
      (function (k, im) {
        im.onload = function () {
          var e = tileCache.get(k);
          if (e) { e.state = 1; e.img = im; }
          pending--; inflight.delete(k); dirty = true;
        };
        im.onerror = function () {
          var e = tileCache.get(k);
          if (e) { e.state = 2; e.retry = (e.retry || 0) + 1; if (e.retry < 2) e.state = 0; }
          pending--; inflight.delete(k); dirty = true;
        };
        im.src = url;
      })(key, img);
      if (!ent) tileCache.set(key, { img: null, state: 0 });
    }
  }

  function drawTiles(g) {
    var lod = pickLod(), res = lod.res, z = lod.z;
    var tileM = res * TILE;                     // 一块瓦片的边长（米）
    var tilePx = tileM / cam.mpp;               // 摆到屏幕的边长（像素）
    var nw = toWorld(0, 0), se = toWorld(W, H);
    var c0 = Math.floor((nw.x - ORX) / tileM), c1 = Math.floor((se.x - ORX) / tileM);
    var r0 = Math.floor((ORY - nw.y) / tileM), r1 = Math.floor((ORY - se.y) / tileM);
    var gridN = Math.round((ORX * -2) / tileM);
    c0 = Math.max(0, c0); r0 = Math.max(0, r0);
    c1 = Math.min(gridN - 1, c1); r1 = Math.min(gridN - 1, r1);
    queue.length = 0;
    for (var r = r0; r <= r1; r++) {
      for (var c = c0; c <= c1; c++) {
        var key = tileKey(z, r, c);
        var ent = tileCache.get(key);
        if (!ent) { ent = { img: null, state: 0 }; tileCache.set(key, ent); }
        var sx = (ORX + c * tileM - cam.cx) / cam.mpp + W / 2;
        var sy = H / 2 - (ORY - r * tileM - cam.cy) / cam.mpp;
        if (ent.state === 1 && ent.img) {
          g.drawImage(ent.img, sx, sy, tilePx + 0.6, tilePx + 0.6);
        } else if (ent.state === 0) {
          queue.push({ z: z, r: r, c: c });
        }
      }
    }
    pumpTiles();
    /* LRU：缓存超限先删最旧的（Map 保持插入序） */
    if (tileCache.size > 320) {
      var it = tileCache.keys();
      while (tileCache.size > 260) {
        var k = it.next().value;
        if (!queue.some(function (qj) { return tileKey(qj.z, qj.r, qj.c) === k; })) tileCache.delete(k);
        else break;
      }
    }
  }

  /* ══ 矢量：陆地 / 冰架 / 经纬网 / 地名 ════════════════════ */
  var GEO = { land: null, shelf: null };

  function prepGeom(fc) {
    /* 投影一次、缓存 E/N：几何是静态的，逐帧重算 sin/cos/pow 太贵 */
    fc.features.forEach(function (f) {
      var polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : (f.geometry.coordinates || []);
      f._rings = polys.map(function (poly) {
        return poly.map(function (ring) {
          return ring.map(function (pt) { return proj(pt[1], pt[0]); });
        });
      });
    });
    return fc;
  }

  function drawPolyFC(g, fc, fill, stroke, lw, dash) {
    g.beginPath();
    fc.features.forEach(function (f) {
      (f._rings || []).forEach(function (poly) {
        poly.forEach(function (ring) {
          for (var i = 0; i < ring.length; i++) {
            var p = toScreen(ring[i].x, ring[i].y);
            if (i === 0) g.moveTo(p.x, p.y); else g.lineTo(p.x, p.y);
          }
          g.closePath();
        });
      });
    });
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) {
      if (dash) g.setLineDash(dash);
      g.strokeStyle = stroke; g.lineWidth = lw || 1; g.stroke();
      if (dash) g.setLineDash([]);
    }
  }

  function drawGraticule(g) {
    var lats = [-60, -66.567, -70, -80];
    var vp = { l: 0, r: W, t: 0, b: H };
    g.save();
    lats.forEach(function (la, i) {
      var r = stereoR(la) / cam.mpp;
      var c = toScreen(0, 0);
      g.beginPath();
      g.arc(c.x, c.y, r, 0, Math.PI * 2);
      if (la === -60) {         // 南极条约适用区边界
        g.setLineDash([7, 5]);
        g.strokeStyle = 'rgba(245,181,68,.5)'; g.lineWidth = 1.4;
      } else {
        g.strokeStyle = 'rgba(127,164,204,' + (la === -66.567 ? '.34' : '.2') + ')';
        g.lineWidth = la === -66.567 ? 1.1 : 0.7;
      }
      g.stroke(); g.setLineDash([]);
      /* 纬圈注记 */
      var ly = c.y - r;
      if (ly > vp.t + 14 && ly < vp.b - 6) {
        g.font = '10px "PingFang SC","Microsoft YaHei",sans-serif';
        g.fillStyle = 'rgba(159,180,205,.62)';
        g.textAlign = 'center';
        var txt = Math.abs(la) === 66.567 ? '66.6°S 南极圈' : Math.abs(la) + '°S';
        if (la === -60) txt = '60°S · 南极条约适用区';
        g.fillText(txt, W / 2, ly - 5);
      }
    });
    for (var lon = -180; lon < 180; lon += 30) {
      var a = lon * D2R, R = stereoR(-52) / cam.mpp;
      var c2 = toScreen(0, 0);
      g.beginPath();
      g.moveTo(c2.x, c2.y);
      g.lineTo(c2.x + Math.sin(a) * R, c2.y - Math.cos(a) * R);
      g.strokeStyle = 'rgba(127,164,204,.14)'; g.lineWidth = 0.6; g.stroke();
    }
    /* 南极点 */
    var sp = toScreen(0, 0);
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(sp.x - 5, sp.y); g.lineTo(sp.x + 5, sp.y);
    g.moveTo(sp.x, sp.y - 5); g.lineTo(sp.x, sp.y + 5);
    g.stroke();
    g.font = '10.5px "PingFang SC","Microsoft YaHei",sans-serif';
    g.fillStyle = 'rgba(255,255,255,.8)'; g.textAlign = 'left';
    g.fillText('地理南极点 90°S', sp.x + 8, sp.y + 12);
    g.restore();
  }

  function drawPlaces(g) {
    if (!S.showPlaces) return;
    var boxes = labelBoxes.slice();       // 与站点标签共用避让
    g.save();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    CFG.places.forEach(function (p) {
      if (cam.mpp > p.z) return;
      var w = proj(p.lat, p.lon), s = toScreen(w.x, w.y);
      if (s.x < -60 || s.x > W + 60 || s.y < -30 || s.y > H + 30) return;
      var col = p.t === 'sea' ? 'rgba(159,196,229,.72)' :
                p.t === 'shelf' ? 'rgba(200,224,244,.8)' : 'rgba(232,240,248,.88)';
      g.font = (p.t === 'sea' ? 'italic ' : '') + '600 11.5px "PingFang SC","Microsoft YaHei",sans-serif';
      var tw = g.measureText(p.n).width;
      var bx = { x0: s.x - tw / 2 - 5, x1: s.x + tw / 2 + 5, y0: s.y - 9, y1: s.y + 9 };
      for (var i = 0; i < boxes.length; i++) {
        var o = boxes[i];
        if (bx.x0 < o.x1 && bx.x1 > o.x0 && bx.y0 < o.y1 && bx.y1 > o.y0) return;
      }
      boxes.push(bx);
      g.shadowColor = 'rgba(4,10,20,.9)'; g.shadowBlur = 4;
      g.fillStyle = col;
      g.fillText(p.n, s.x, s.y);
      g.shadowBlur = 0;
    });
    g.restore();
  }

  /* ══ 站点 ═════════════════════════════════════════════════ */
  var labelBoxes = [];
  var screenPos = new Map();    // 站点 id -> 渲染后的屏幕坐标（命中用）

  function siteR(p) {
    if (p.st === 'C') return 3.6;
    return p.s === 'Y' ? 5.6 : (p.t === 'station' ? 4.6 : 3.8);
  }

  function relaxSites() {
    /* 贪心排斥：低缩放下乔治王岛一带十几个站会叠成一个点，
       渲染时沿连线方向推开（仅影响屏幕位置，命中测试用同一套坐标）。 */
    screenPos.clear();
    var placed = [];
    var order = S.view.slice().sort(function (a, b) {
      return (a.properties.s === 'Y' ? 0 : 1) - (b.properties.s === 'Y' ? 0 : 1);
    });
    order.forEach(function (f) {
      var p = f.properties;
      var w = f._w || (f._w = proj(p.lat, p.lon));
      var s = { x: (w.x - cam.cx) / cam.mpp + W / 2, y: H / 2 - (w.y - cam.cy) / cam.mpp };
      var r = siteR(p);
      s.r = r;                     // 排斥距离要与 placed 里共享的同一对象配套
      for (var it = 0; it < 3; it++) {
        for (var i = 0; i < placed.length; i++) {
          var q = placed[i];
          var dx = s.x - q.x, dy = s.y - q.y;
          var d = Math.hypot(dx, dy), minD = r + q.r + 5;
          if (d >= minD) continue;
          if (d < 0.01) { dx = 1; dy = -1; d = Math.SQRT2; }
          var push = (minD - d) / d;
          s.x += dx * push; s.y += dy * push;
          q.x -= dx * push * 0.5; q.y -= dy * push * 0.5;
        }
      }
      placed.push(s);
      screenPos.set(String(p.id), s);
    });
  }

  function drawSites(g) {
    if (!S.showSites) return;
    labelBoxes = [];
    relaxSites();
    g.save();
    S.view.forEach(function (f) {
      var p = f.properties;
      var s = screenPos.get(String(p.id));
      if (!s) return;
      if (s.x < -30 || s.x > W + 30 || s.y < -30 || s.y > H + 30) return;
      var r = siteR(p), col = p.st === 'C' ? '#7c8ba1' : p.color;
      if (p.st === 'C') g.setLineDash([2.5, 2]);
      /* 外环 */
      g.beginPath(); g.arc(s.x, s.y, r + 2.2, 0, Math.PI * 2);
      g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.4; g.stroke();
      /* 主体 */
      g.beginPath(); g.arc(s.x, s.y, r, 0, Math.PI * 2);
      g.fillStyle = col; g.globalAlpha = p.st === 'C' ? 0.9 : 1; g.fill();
      g.globalAlpha = 1; g.setLineDash([]);
      if (p.s === 'Y') {           // 常年站加一圈暗描边增强对比
        g.beginPath(); g.arc(s.x, s.y, r, 0, Math.PI * 2);
        g.strokeStyle = 'rgba(8,15,28,.55)'; g.lineWidth = 1; g.stroke();
      }
    });
    /* 选中光环 */
    if (S.selSite) {
      var ss = screenPos.get(String(S.selSite.properties.id));
      if (ss) {
        var t = (performance.now() % 1500) / 1500;
        var rr = siteR(S.selSite.properties) + 4 + t * 12;
        g.beginPath(); g.arc(ss.x, ss.y, rr, 0, Math.PI * 2);
        g.strokeStyle = 'rgba(255,255,255,' + (0.85 * (1 - t)) + ')'; g.lineWidth = 2; g.stroke();
        g.beginPath(); g.arc(ss.x, ss.y, siteR(S.selSite.properties) + 3.5, 0, Math.PI * 2);
        g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
      }
    }
    g.restore();
  }

  function paintLabels() {
    var html = '';
    if (S.showLabels && S.showSites) {
      var boxes = labelBoxes.slice();
      var maxN = isMobile() ? 16 : 46;
      var cand = S.view.slice().sort(function (a, b) {
        return (a.properties.s === 'Y' ? 0 : 1) - (b.properties.s === 'Y' ? 0 : 1);
      });
      var n = 0;
      for (var i = 0; i < cand.length && n < maxN; i++) {
        var p = cand[i].properties;
        var s = screenPos.get(String(p.id));
        if (!s) continue;
        if (s.x < 40 || s.x > W - 40 || s.y < 30 || s.y > H - 40) continue;
        var w = p.n.length * 12.5 * 0.95 + 20, h = 24;
        var bx = { x0: s.x - w / 2, x1: s.x + w / 2, y0: s.y - siteR(p) - 8 - h, y1: s.y - siteR(p) - 8 };
        var clash = false;
        for (var j = 0; j < boxes.length; j++) {
          var o = boxes[j];
          if (bx.x0 < o.x1 && bx.x1 > o.x0 && bx.y0 < o.y1 && bx.y1 > o.y0) { clash = true; break; }
        }
        if (clash) continue;
        boxes.push(bx);
        var active = S.selSite && String(S.selSite.properties.id) === String(p.id);
        html += '<div class="tlabel is-tag' + (active ? ' is-active' : '') + '" style="left:' +
          s.x.toFixed(1) + 'px;top:' + (bx.y0 + h / 2).toFixed(1) + 'px;--c:' + p.color + '">' +
          esc(p.n) + '</div>';
        n++;
      }
    }
    el.labels.innerHTML = html;
  }

  /* ══ 主渲染 ═══════════════════════════════════════════════ */
  function draw() {
    var g = ctx;
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    g.clearRect(0, 0, W, H);

    /* 海洋底色 */
    var grad = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.62);
    if (S.basemap === 'dark') { grad.addColorStop(0, '#0d1b2c'); grad.addColorStop(1, '#060d18'); }
    else { grad.addColorStop(0, '#0e2238'); grad.addColorStop(1, '#081524'); }
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);

    if (S.basemap === 'img') drawTiles(g);

    var vecMode = S.basemap !== 'img';
    if (GEO.land) {
      if (vecMode) {
        drawPolyFC(g, GEO.shelf, '#a9c8e0', 'rgba(96,140,180,.5)', 0.8);
        drawPolyFC(g, GEO.land, '#dde9f3', 'rgba(88,128,168,.65)', 1);
      } else {
        drawPolyFC(g, GEO.shelf, null, 'rgba(190,220,245,.4)', 0.9, [4, 3]);
        drawPolyFC(g, GEO.land, null, 'rgba(235,246,255,.75)', 1.1);
      }
    }
    if (S.showGrat) drawGraticule(g);
    drawSites(g);
    drawPlaces(g);
    paintLabels();
  }

  function loop(now) {
    var moved = tickAnim(now);
    if (dirty || moved || S.selSite) { dirty = false; draw(); }
    requestAnimationFrame(loop);
  }

  /* ══ 命中 ═════════════════════════════════════════════════ */
  function pickSite(mx, my) {
    var best = null, bd = 18 * 18;
    S.view.forEach(function (f) {
      var s = screenPos.get(String(f.properties.id));
      if (!s) return;
      var dx = s.x - mx, dy = s.y - my, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = f; }
    });
    return best;
  }

  /* ══ 详情卡 ═══════════════════════════════════════════════ */
  function showSite(f, move) {
    S.selSite = f; S.selCountry = null;
    var p = f.properties;
    document.body.classList.add('has-detail');
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', p.st === 'C' ? '#7c8ba1' : p.color);
    dt.dtRole.textContent = p.tl.toUpperCase() + ' · ' + p.ss;
    dt.dtName.textContent = p.n;
    dt.dtSub.textContent = [p.en, p.c].filter(Boolean).join(' · ');

    dt.dtLb1.textContent = '类型'; dt.dtV1.textContent = p.tl; dt.dtU1.textContent = p.sl;
    dt.dtLb2.textContent = '建成'; dt.dtV2.textContent = p.y ? p.y : '—'; dt.dtU2.textContent = '年';
    dt.dtLb3.textContent = '海拔'; dt.dtV3.textContent = p.el != null ? fmt(p.el, p.el < 10 ? 1 : 0) : '—';
    var elUnit = (p.el != null && p.el < 10) ? '' : ' m';
    dt.dtU3.textContent = elUnit;

    var bits = [];
    bits.push(esc(p.loc || ''));
    var dPole = haversine(p.lat, p.lon, -90, 0) / 1000;
    bits.push('距南极点约 <b>' + fmt(dPole, 0) + ' km</b>');
    if (p.pop) bits.push('峰值容纳约 ' + p.pop + ' 人');
    if (p.pw) bits.push('能源：' + (p.pw === 'Fossil Fuel' ? '化石燃料' : p.pw === 'Renewable' ? '可再生能源' : p.pw));
    if (p.sub) bits.push('<b style="color:#f5b544">位于南纬 60° 以北，不在《南极条约》适用区内</b>');
    dt.dtDescLb.textContent = '位置与说明';
    dt.dtDesc.innerHTML = bits.join('；') + '。';

    dt.dtFooter.innerHTML = '<span>' + fmtCoord(p.lat, p.lon) + '</span><span>' +
      esc(p.c) + '</span><span>' + p.sl + ' · ' + p.ss + '</span>';

    renderRank();
    if (move) {
      var w = f._w || (f._w = proj(p.lat, p.lon));
      easeTo({ cx: w.x, cy: w.y, mpp: Math.min(cam.mpp, 900) });
    }
    dirty = true;
  }

  function showCountry(key, move) {
    var c = S.byCountry[key];
    if (!c) return;
    S.selCountry = key; S.selSite = null;
    var feats = S.view.filter(function (f) { return f.properties.ce === key; });
    document.body.classList.add('has-detail');
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', c.color);
    dt.dtRole.textContent = 'COUNTRY · ' + c.n + ' 处设施';
    dt.dtName.textContent = c.c;
    dt.dtSub.textContent = 'COMNAP 运营成员：' + c.ce;

    dt.dtLb1.textContent = '设施总数'; dt.dtV1.textContent = c.n; dt.dtU1.textContent = '处';
    dt.dtLb2.textContent = '常年'; dt.dtV2.textContent = c.yr; dt.dtU2.textContent = '处';
    dt.dtLb3.textContent = '合计人数'; dt.dtV3.textContent = c.pop || '—'; dt.dtU3.textContent = '人';

    dt.dtDescLb.textContent = '说明';
    var zdesc = [];
    Object.keys(c.zc).forEach(function (z) { zdesc.push(zoneName(z) + ' ' + c.zc[z] + ' 处'); });
    dt.dtDesc.innerHTML = '规模最大的站点：<b>' + esc(c.top || '—') + '</b>' +
      (c.topPop ? '（峰值约 ' + c.topPop + ' 人）' : '') + '。设施分布：' + zdesc.join('，') + '。' +
      (c.minY ? '最早设施建于 ' + c.minY + ' 年。' : '');

    dt.dtFooter.innerHTML = '<span>' + fmtCoord(c.cxy[1], c.cxy[0]) + '（站点重心）</span>';

    renderRank();
    if (move && feats.length) {
      var bb = [Infinity, Infinity, -Infinity, -Infinity];
      feats.forEach(function (f) {
        var w = f._w || (f._w = proj(f.properties.lat, f.properties.lon));
        bb[0] = Math.min(bb[0], w.x); bb[1] = Math.min(bb[1], w.y);
        bb[2] = Math.max(bb[2], w.x); bb[3] = Math.max(bb[3], w.y);
      });
      var pad = (bb[2] - bb[0]) * 0.18 + 60000, padY = (bb[3] - bb[1]) * 0.18 + 60000;
      fitBBox([bb[0] - pad, bb[1] - padY, bb[2] + pad, bb[3] + padY], { withDetail: true });
    }
    dirty = true;
  }

  function clearSel() {
    S.selSite = null; S.selCountry = null;
    document.body.classList.remove('has-detail');
    el.detail.hidden = true;
    renderRank();
    dirty = true;
  }

  /* ══ 侧栏 UI ══════════════════════════════════════════════ */
  function zoneName(code) {
    if (!S.stats) return code;
    for (var i = 0; i < S.stats.zones.length; i++) {
      if (S.stats.zones[i].code === code) return S.stats.zones[i].name;
    }
    return code;
  }

  function passFilter(p) {
    if (S.fSeason !== 'all' && p.s !== S.fSeason) return false;
    if (S.fStatus !== 'all' && p.st !== S.fStatus) return false;
    if (S.fZone !== 'all' && p.z !== S.fZone) return false;
    if (S.q) {
      var hay = (p.n + ' ' + p.en + ' ' + (p.loc || '') + ' ' + p.c + ' ' + p.ce).toLowerCase();
      if (hay.indexOf(S.q) === -1) return false;
    }
    return true;
  }

  function applyFilter() {
    S.view = S.all.filter(function (f) { return passFilter(f.properties); });
    if (S.selSite && !S.view.some(function (f) { return f.properties.id === S.selSite.properties.id; })) S.selSite = null;
    if (S.selCountry && !S.view.some(function (f) { return f.properties.ce === S.selCountry; })) S.selCountry = null;
    renderRank();
    syncChips();
    dirty = true;
  }

  var RANK_N = 15;
  function renderRank() {
    var counts = {};
    S.view.forEach(function (f) {
      var k = f.properties.ce;
      counts[k] = counts[k] || { n: 0, yr: 0 };
      counts[k].n++;
      if (f.properties.s === 'Y') counts[k].yr++;
    });
    var list = S.countries.filter(function (c) { return counts[c.ce]; })
      .map(function (c) { return { ce: c.ce, c: c.c, n: counts[c.ce].n, yr: counts[c.ce].yr, color: c.color }; })
      .sort(function (a, b) { return b.n - a.n; });

    el.rankTitle.textContent = (S.q || S.fZone !== 'all' || S.fSeason !== 'all' || S.fStatus !== 'all') ?
      '各国设施数排行（筛选后）' : '各国设施数排行';
    el.rankNote.textContent = '共 ' + list.length + ' 国 · 前 ' + RANK_N;
    if (!list.length) { el.rankList.innerHTML = '<p class="note" style="margin:0">当前筛选没有站点。</p>'; return; }
    var max = list[0].n || 1;
    el.rankList.innerHTML = list.slice(0, RANK_N).map(function (x) {
      var w = Math.round(x.n / max * 100);
      var active = S.selCountry === x.ce ? ' active' : '';
      return '<button type="button" class="chart-row' + active + '" data-c="' + esc(x.ce) + '">' +
        '<span class="nm">' + esc(x.c) + '</span>' +
        '<span class="bar"><i style="width:' + w + '%;background:' + x.color + '"></i></span>' +
        '<span class="vl">' + x.n + ' <em>（' + x.yr + '）</em></span></button>';
    }).join('');
  }

  function chipGroup(box, val, cb) {
    Array.prototype.forEach.call(box.children, function (b) {
      b.classList.toggle('active', b.dataset.v === val);
    });
  }
  function syncChips() {
    chipGroup(el.chipZone, S.fZone);
    chipGroup(el.chipSeason, S.fSeason);
    chipGroup(el.chipStatus, S.fStatus);
    var n = S.view.length;
    el.qN.textContent = S.q ? '命中 ' + n : '';
  }

  function renderLegend() {
    el.legend.innerHTML =
      '<span><s style="background:#4aa3df"></s>常年运行</span>' +
      '<span><s style="background:transparent;border:1.5px solid #9fb4cd"></s>夏季运行</span>' +
      '<span><s style="background:#7c8ba1;opacity:.85"></s>暂时关闭</span>' +
      '<span><em><i style="background:#f5b544"></i></em>60°S 条约界线</span>';
  }

  function setDrawer(collapsed) {
    el.intro.classList.toggle('is-collapsed', collapsed);
    if (el.introBarText) el.introBarText.textContent = collapsed ? '展开' : '收起';
  }

  /* ══ 事件 ═════════════════════════════════════════════════ */
  function bind() {
    /* 指针：拖拽 / 悬停 / 点击 */
    var drag = null, moved = false, hoverId = null;

    el.cv.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      el.cv.setPointerCapture(e.pointerId);
      drag = { x: e.clientX, y: e.clientY, cx: cam.cx, cy: cam.cy };
      moved = false;
      anim = null;
    });
    el.cv.addEventListener('pointermove', function (e) {
      if (drag) {
        var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        cam.cx = drag.cx - dx * cam.mpp;
        cam.cy = drag.cy + dy * cam.mpp;
        dirty = true;
        return;
      }
      var rect = el.cv.getBoundingClientRect();
      var f = pickSite(e.clientX - rect.left, e.clientY - rect.top);
      el.cv.style.cursor = f ? 'pointer' : '';
      if (f) {
        var p = f.properties;
        hoverId = p.id;
        if (!el.tip) { el.tip = document.createElement('div'); el.tip.className = 'ttip'; document.body.appendChild(el.tip); }
        el.tip.style.display = 'block';
        el.tip.innerHTML = '<b>' + esc(p.n) + '</b> <span style="color:' + p.color + '">' + esc(p.c) + '</span><br>' +
          '<span style="color:#9fb4cd">' + p.sl + ' · ' + p.tl + '</span>';
        el.tip.style.left = (e.clientX - rect.left) + 'px';
        el.tip.style.top = (e.clientY - rect.top) + 'px';
      } else {
        hoverId = null;
        if (el.tip) el.tip.style.display = 'none';
      }
    });
    el.cv.addEventListener('pointerup', function (e) {
      var wasDrag = drag && moved;
      drag = null;
      if (wasDrag) return;
      var rect = el.cv.getBoundingClientRect();
      var f = pickSite(e.clientX - rect.left, e.clientY - rect.top);
      if (!isMobile()) setDrawer(false);
      if (f) showSite(f, true); else clearSel();
    });
    el.cv.addEventListener('pointerleave', function () {
      drag = null;
      if (el.tip) el.tip.style.display = 'none';
    });

    /* 滚轮缩放（以指针为锚） */
    el.cv.addEventListener('wheel', function (e) {
      e.preventDefault();
      anim = null;
      var rect = el.cv.getBoundingClientRect();
      var mx = e.clientX - rect.left, my = e.clientY - rect.top;
      var w0 = toWorld(mx, my);
      var k = Math.exp(-e.deltaY * 0.0016);
      cam.mpp = clampMpp(cam.mpp / k);
      var w1 = toWorld(mx, my);
      cam.cx += w0.x - w1.x; cam.cy += w0.y - w1.y;
      dirty = true;
    }, { passive: false });

    /* 双击放大 */
    el.cv.addEventListener('dblclick', function (e) {
      var rect = el.cv.getBoundingClientRect();
      var w = toWorld(e.clientX - rect.left, e.clientY - rect.top);
      easeTo({ cx: w.x, cy: w.y, mpp: cam.mpp / 2.4 }, 480);
    });

    /* 触摸双指缩放 */
    var pinch = null;
    el.cv.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) {
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        pinch = { d: Math.hypot(dx, dy), mpp: cam.mpp };
        drag = null;
      }
    }, { passive: true });
    el.cv.addEventListener('touchmove', function (e) {
      if (pinch && e.touches.length === 2) {
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        cam.mpp = clampMpp(pinch.mpp * pinch.d / Math.max(20, Math.hypot(dx, dy)));
        dirty = true;
      }
    }, { passive: true });
    el.cv.addEventListener('touchend', function () { pinch = null; }, { passive: true });

    /* 侧栏 */
    el.chipZone.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.fZone = b.dataset.v; applyFilter();
    });
    el.chipSeason.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.fSeason = b.dataset.v; applyFilter();
    });
    el.chipStatus.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.fStatus = b.dataset.v; applyFilter();
    });
    el.rankList.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (!isMobile()) setDrawer(false);
      showCountry(b.dataset.c, true);
    });
    el.q.addEventListener('input', function () {
      S.q = (this.value || '').trim().toLowerCase();
      applyFilter();
    });
    el.qClear.addEventListener('click', function () {
      el.q.value = ''; S.q = ''; applyFilter(); el.q.focus();
    });

    /* 图层面板 */
    document.getElementById('ckSites').addEventListener('change', function () {
      S.showSites = this.checked; dirty = true;
    });
    document.getElementById('ckLabels').addEventListener('change', function () {
      S.showLabels = this.checked; dirty = true;
    });
    document.getElementById('ckPlaces').addEventListener('change', function () {
      S.showPlaces = this.checked; dirty = true;
    });
    document.getElementById('ckGrat').addEventListener('change', function () {
      S.showGrat = this.checked; dirty = true;
    });
    Array.prototype.forEach.call(document.querySelectorAll('input[name="basemap"]'), function (r) {
      r.addEventListener('change', function () {
        S.basemap = this.value; dirty = true;
      });
    });
    el.panelToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var c = el.panelBody.classList.toggle('collapsed');
      this.textContent = c ? '＋' : '－';
    });
    document.getElementById('panelHead').addEventListener('click', function (e) {
      if (!isMobile()) return;
      if (e.target.id === 'panelToggle') return;
      var c = el.panelBody.classList.toggle('collapsed');
      if (el.panelToggle) el.panelToggle.textContent = c ? '＋' : '－';
    });

    /* 顶栏 */
    document.getElementById('btnOverview').addEventListener('click', function () {
      clearSel(); fitAll({ animate: true });
    });
    el.introBar.addEventListener('click', function () {
      setDrawer(!el.intro.classList.contains('is-collapsed'));
    });
    dt.dtClose.addEventListener('click', clearSel);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') clearSel();
    });

    if (isMobile()) { setDrawer(true); el.panelBody.classList.add('collapsed'); el.panelToggle.textContent = '＋'; }
  }

  /* ══ 尺寸 ═════════════════════════════════════════════════ */
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = el.wrap.clientWidth; H = el.wrap.clientHeight;
    el.cv.width = Math.round(W * DPR);
    el.cv.height = Math.round(H * DPR);
    el.cv.style.width = W + 'px';
    el.cv.style.height = H + 'px';
    dirty = true;
  }

  /* ══ 启动 ═════════════════════════════════════════════════ */
  function boot() {
    resize();
    window.addEventListener('resize', resize);

    /* ?bm=img|vec|dark：初始底图（分享/封面用），并同步面板选中态 */
    var bmParam = new URLSearchParams(location.search).get('bm');
    if (bmParam && ['img', 'vec', 'dark'].indexOf(bmParam) >= 0) {
      S.basemap = bmParam;
      var r = document.querySelector('input[name="basemap"][value="' + bmParam + '"]');
      if (r) { r.checked = true; }
    }

    Promise.all([
      fetch('data/points.json').then(function (r) { return r.json(); }),
      fetch('data/countries.json').then(function (r) { return r.json(); }),
      fetch('data/stats.json').then(function (r) { return r.json(); }),
      fetch('data/geo.json').then(function (r) { return r.json(); })
    ]).then(function (res) {
      S.all = res[0].features;
      S.countries = res[1].countries;
      S.stats = res[2];
      S.countries.forEach(function (c) { S.byCountry[c.ce] = c; });
      GEO.land = prepGeom(res[3].land);
      GEO.shelf = prepGeom(res[3].shelf);

      document.getElementById('fSite').textContent = fmt(S.stats.n, 0);
      document.getElementById('fYear').textContent = S.stats.nYear;
      document.getElementById('fCountry').textContent = S.stats.nCountry;
      document.getElementById('fSeasonN').textContent = S.stats.nSeason;

      renderLegend();
      bind();
      applyFilter();
      fitAll({ animate: false });
      requestAnimationFrame(loop);
      window.__ant = { S: S, GEO: GEO, cam: cam, W: W, H: H, screenPos: screenPos };   // 调试 / 封面脚本用
      window.__antReady = true;
    }).catch(function (err) {
      console.error('[antarctic-stations] 数据加载失败', err);
      el.rankList.innerHTML = '<p class="note" style="margin:0">数据加载失败，请刷新重试。</p>';
    });
  }

  boot();
})();
