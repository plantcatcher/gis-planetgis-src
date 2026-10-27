/* 中国各省 GDP × 全球国家对标 · 互动逻辑（基于 _shared/thematic 共享运行时）
 * 三个视图：
 *   cn     中国省级 GDP 分级着色，点省出对标卡
 *   world  世界国家 GDP 着色，高亮当前省的对标国家
 *   ladder 全屏混合榜单：34 个省插进 186 个经济体的 GDP 降序阶梯
 * 着色：props.usd（亿美元）→ CFG.BREAKS 分档；世界视图用 props.v（同为亿美元）。
 */
(function () {
  'use strict';
  var CFG = window.GDPPEER_CONFIG;
  var esc = Thematic.esc;

  var META = null, COUNTRIES = [], PROV = [], PEERS = {};
  var view = 'cn', selName = null, selPeers = [];
  var GJ = { provinces: null, world: null };   // 自己留一份几何，用于标注与 bbox（不碰 source 内部）

  /* ── 数值格式化 ─────────────────────────────────────────── */
  function grp(v, d) {
    if (v == null || isNaN(v)) return '—';
    return Number(v.toFixed(d === undefined ? 0 : d)).toLocaleString('en-US');
  }
  function usdStr(v) {                       // 亿美元 → 「x.xx 万亿 / x,xxx 亿」
    if (v >= 10000) return (v / 10000).toFixed(2) + ' 万亿';
    return grp(v) + ' 亿';
  }
  function cnyStr(v) {                       // 亿元人民币
    if (v >= 10000) return (v / 10000).toFixed(2) + ' 万亿';
    return grp(v) + ' 亿';
  }

  /* ── 着色表达式 ─────────────────────────────────────────── */
  function stepExpr(field) {
    var a = ['step', ['get', field], CFG.COLORS[0]];
    for (var i = 0; i < CFG.BREAKS.length; i++) a.push(CFG.BREAKS[i], CFG.COLORS[i + 1]);
    return a;
  }
  function cnFillExpr() { return stepExpr('usd'); }
  function wdFillExpr() {
    return ['case', ['>', ['get', 'v'], 0], stepExpr('v'), CFG.NO_DATA];
  }

  var app = Thematic.create({
    slug: 'cn-gdp-peers',
    view: CFG.view, bounds: CFG.bounds, extent: CFG.extent,
    boundsMobile: CFG.boundsMobile,
    graticuleStep: CFG.graticuleStep,
    defaultBasemap: CFG.defaultBasemap,
    imgPaint: CFG.imgPaint,
    basemaps: CFG.basemaps,
    province: false,
    sources: {
      provinces: { data: 'data/provinces.geojson' },
      world: { data: 'data/world.geojson' }
    },
    layers: [
      { id: 'wd-fill', type: 'fill', source: 'world', layout: { visibility: 'none' },
        paint: { 'fill-color': wdFillExpr(), 'fill-opacity': 0.72 } },
      { id: 'wd-line', type: 'line', source: 'world', layout: { visibility: 'none' },
        paint: { 'line-color': '#0b1524', 'line-width': 0.5, 'line-opacity': 0.55 } },
      { id: 'wd-hi-fill', type: 'fill', source: 'world', layout: { visibility: 'none' },
        filter: ['==', ['get', 'i'], '__none__'],
        paint: { 'fill-color': CFG.HI, 'fill-opacity': 0.2 } },
      { id: 'wd-hi-line', type: 'line', source: 'world', layout: { visibility: 'none' },
        filter: ['==', ['get', 'i'], '__none__'],
        paint: { 'line-color': '#ffe08a', 'line-width': 2.2, 'line-opacity': 1 } },
      { id: 'cn-fill', type: 'fill', source: 'provinces',
        filter: ['!=', ['get', 'nn'], '九段线'],
        paint: { 'fill-color': cnFillExpr(), 'fill-opacity': CFG.FILL_OP } },
      { id: 'cn-line', type: 'line', source: 'provinces',
        filter: ['!=', ['get', 'nn'], '九段线'],
        paint: { 'line-color': '#0b1524', 'line-width': 0.7, 'line-opacity': 0.6 } },
      { id: 'jiu-line', type: 'line', source: 'provinces',
        filter: ['==', ['get', 'nn'], '九段线'],
        paint: { 'line-color': '#e8eef7', 'line-width': 1.6, 'line-opacity': 0.9 } },
      { id: 'cn-sel-fill', type: 'fill', source: 'provinces',
        filter: ['==', ['get', 'name'], '__none__'],
        paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.14 } },
      { id: 'cn-sel-line', type: 'line', source: 'provinces',
        filter: ['==', ['get', 'name'], '__none__'],
        paint: { 'line-color': '#ffffff', 'line-width': 2.4, 'line-opacity': 0.95 } }
    ],
    onReady: boot,
    onOverview: function () {
      clearSel();
      if (view !== 'cn') setView('cn'); else app.fitAll({ animate: true });
    },
    onClose: clearSel
  });
  window.__app = app;

  /* ── 数据 ───────────────────────────────────────────────── */
  function loadJSON(u) {
    return fetch(u).then(function (r) { return r.json(); });
  }
  function boot() {
    // 手机端介绍栏变成底部抽屉（带 backdrop-filter，会锁住 fixed 子元素），
    // 视图切换必须挪到 body 才能固定在屏幕顶部。
    if (window.innerWidth <= 900) {
      var vs = document.getElementById('vseg');
      if (vs) document.body.appendChild(vs);
    }
    app.fitAll({ animate: false });
    loadJSON('data/meta.json').then(function (m) {
      META = m; PROV = m.provs; PEERS = m.peers;
      document.getElementById('fProv').textContent = PROV.length;
      document.getElementById('fYear').textContent = m.year;
      renderLegend();
      return loadJSON('data/countries.json');
    }).then(function (c) {
      COUNTRIES = c.countries;
      document.getElementById('fCountry').textContent = COUNTRIES.length;
      buildLadder();
      return Promise.all([loadJSON('data/provinces.geojson'), loadJSON('data/world.geojson')]);
    }).then(function (gj) {
      GJ.provinces = gj[0]; GJ.world = gj[1];
      requestLabels();
    }).catch(function (e) { console.warn(e); });
    bind();
    window.__cnGdpPeersReady = true;
  }

  /* ── 视图切换 ───────────────────────────────────────────── */
  function vis(id, on) {
    if (app.map.getLayer(id)) app.map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');
  }
  function setView(v) {
    view = v;
    var ladder = document.getElementById('ladder');
    ladder.hidden = (v !== 'ladder');
    var isCn = v === 'cn', isWd = v === 'world';
    document.body.classList.toggle('is-world', isWd);
    ['cn-fill', 'cn-line', 'jiu-line', 'cn-sel-fill', 'cn-sel-line'].forEach(function (id) { vis(id, isCn); });
    ['wd-fill', 'wd-line'].forEach(function (id) { vis(id, isWd); });
    vis('wd-hi-fill', isWd); vis('wd-hi-line', isWd);
    Array.prototype.forEach.call(document.querySelectorAll('#vseg button'), function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-view') === v);
    });
    if (v === 'ladder') { app.tooltip(null); return; }
    // 竖屏手机屏宽 390px：世界宽要 ≤ 屏宽才能看全，必须放开到 zoom 0
    var mobile = window.innerWidth <= 900;
    try { app.map.setMinZoom(isWd ? (mobile ? 0 : 1.2) : 2.0); } catch (e) {}
    if (isWd) {
      // 天地图无境外数据，世界视图强制深色；介绍栏收起，否则会压住半个地球
      var rad = document.querySelector('input[name="basemap"][value="none"]');
      if (rad) { rad.checked = true; app.setBasemap('none'); }
      app.setDrawer(true);
      app.map.fitBounds([[CFG.worldBounds[0], CFG.worldBounds[1]], [CFG.worldBounds[2], CFG.worldBounds[3]]],
        { padding: mobile ? { left: 14, right: 14, top: 70, bottom: 210 } : { left: 46, right: 46, top: 46, bottom: 56 }, duration: 700 });
      setTimeout(requestLabels, 120);
      setTimeout(requestLabels, 900);
    } else {
      app.setDrawer(false);
      app.fitAll({ animate: true });
    }
    requestLabels();
  }

  /* ── 选中 / 详情卡 ──────────────────────────────────────── */
  function setSelFilter(name) {
    var f = ['==', ['get', 'name'], name || '__none__'];
    ['cn-sel-fill', 'cn-sel-line'].forEach(function (id) {
      if (app.map.getLayer(id)) app.map.setFilter(id, f);
    });
  }
  function clearSel() {
    selName = null; selPeers = [];
    setSelFilter(null);
    document.getElementById('detail').hidden = true;
    app.setDetailOpen(false);
    if (app.map.getLayer('wd-hi-fill')) {
      app.map.setFilter('wd-hi-fill', ['==', ['get', 'i'], '__none__']);
      app.map.setFilter('wd-hi-line', ['==', ['get', 'i'], '__none__']);
    }
    requestLabels();
  }

  function selectProv(name) {
    var p = null;
    for (var i = 0; i < PROV.length; i++) { if (PROV[i].name === name) { p = PROV[i]; break; } }
    if (!p) return;
    selName = name;
    app.tooltip(null);
    setSelFilter(name);
    var d = PEERS[name] || { rank: 0, up: [], dn: [] };
    selPeers = (d.up || []).concat(d.dn || []);
    showDetail(p, d);
    applyWorldHi();
    if (view === 'ladder') setView('cn');
    requestLabels();
  }

  var elPeersList = document.getElementById('peersList');
  function showDetail(p, d) {
    var el = document.getElementById('detail');
    el.hidden = false;
    app.setDetailOpen(true);
    document.getElementById('dtRole').textContent = '中国省级行政区 · ' + META.year;
    document.getElementById('dtName').textContent = p.name;
    document.getElementById('dtSub').textContent = '2025 年地区生产总值（GDP）· 现价';

    document.getElementById('dtLb1').textContent = 'GDP（人民币）';
    document.getElementById('dtV1').textContent = cnyStr(p.cny);
    document.getElementById('dtU1').textContent = '元';
    document.getElementById('dtLb2').textContent = '折合美元';
    document.getElementById('dtV2').textContent = usdStr(p.usd);
    document.getElementById('dtU2').textContent = '美元';
    document.getElementById('dtLb3').textContent = '若为一国';
    document.getElementById('dtV3').textContent = '第 ' + d.rank;
    document.getElementById('dtU3').textContent = '位';

    var shareT = '—';
    if (p.src === 'cny' && META.sumCny) {
      shareT = '占全国 GDP 的 ' + (100 * p.cny / META.sumCny).toFixed(1) + '%';
    } else {
      shareT = '港澳台不计入全国 GDP 合计，此处按其本币统计值折算。';
    }
    var up0 = (d.up || [])[0], dn0 = (d.dn || []).slice(-1)[0];
    var between = (up0 && dn0) ? '　体量介于 <b>' + esc(up0.n) + '</b> 与 <b>' + esc(dn0.n) + '</b> 之间。' : '';
    document.getElementById('dtDescLb').textContent = '占全国 GDP';
    document.getElementById('dtDesc').innerHTML = esc(shareT) + between;

    var maxV = Math.max.apply(null, (d.up || []).concat(d.dn || []).map(function (x) { return x.v; }).concat([p.usd]));
    function row(x) {
      var up = x.v >= p.usd;
      var w = Math.max(6, Math.round(100 * x.v / maxV));
      return '<div class="pr' + (up ? ' is-up' : ' is-dn') + '" data-iso="' + esc(x.i) + '">' +
        '<span class="pr-n">' + esc(x.n) + '</span>' +
        '<span class="pr-b"><i style="width:' + w + '%"></i></span>' +
        '<span class="pr-v">' + usdStr(x.v) + '</span>' +
        '<span class="pr-d">' + (up ? '+' : '') + x.d.toFixed(1) + '%</span></div>';
    }
    // 从上到下：比它大的（GDP 降序）→ 比它小的（GDP 降序），中间就是该省的位置
    var html = '';
    (d.up || []).slice().reverse().forEach(function (x) { html += row(x); });
    (d.dn || []).slice().reverse().forEach(function (x) { html += row(x); });
    elPeersList.innerHTML = html || '<div class="pr-empty">暂无对标数据</div>';
    Array.prototype.forEach.call(elPeersList.querySelectorAll('.pr'), function (n) {
      n.addEventListener('click', function () {
        var iso = n.getAttribute('data-iso');
        if (!iso) return;
        setView('world');
        hiOne(iso);
      });
    });

    document.getElementById('dtFooter').innerHTML =
      '<span>口径：GDP 总量</span><span>汇率 ' + META.fx + '</span><span>世界银行 / IMF 2025</span>';
    app.collapseDrawer();
  }

  function hiOne(iso) {
    if (!app.map.getLayer('wd-hi-fill')) return;
    app.map.setFilter('wd-hi-fill', ['==', ['get', 'i'], iso]);
    app.map.setFilter('wd-hi-line', ['==', ['get', 'i'], iso]);
    var f = findWorldFeature(iso);
    if (f) {
      var b = bboxOf(f.geometry);
      if (b) app.map.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: app.viewPadding(true), duration: 700, maxZoom: 5 });
    }
  }

  function applyWorldHi() {
    if (!app.map.getLayer('wd-hi-fill')) return;
    if (!selPeers.length) {
      app.map.setFilter('wd-hi-fill', ['==', ['get', 'i'], '__none__']);
      app.map.setFilter('wd-hi-line', ['==', ['get', 'i'], '__none__']);
      requestLabels();
      return;
    }
    var arr = selPeers.map(function (x) { return x.i; });
    var lf = ['in', ['get', 'i'], ['literal', arr]];
    app.map.setFilter('wd-hi-fill', lf);
    app.map.setFilter('wd-hi-line', lf);
    requestLabels();   // 世界视图只标这 6 个国家（paintLabels 里挑）
  }

  /* ── 几何小工具 ─────────────────────────────────────────── */
  function walk(g, fn) {
    if (!g) return;
    if (g.type === 'GeometryCollection') { (g.geometries || []).forEach(function (x) { walk(x, fn); }); return; }
    var cs = g.coordinates || [];
    if (g.type === 'Point') fn(cs[0], cs[1]);
    else if (g.type === 'MultiPoint' || g.type === 'LineString') cs.forEach(function (c) { fn(c[0], c[1]); });
    else if (g.type === 'MultiLineString' || g.type === 'Polygon') cs.forEach(function (r) { r.forEach(function (c) { fn(c[0], c[1]); }); });
    else if (g.type === 'MultiPolygon') cs.forEach(function (p) { p.forEach(function (r) { r.forEach(function (c) { fn(c[0], c[1]); }); }); });
  }
  function bboxOf(g) {
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    walk(g, function (x, y) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; });
    return x0 === 1e9 ? null : [x0, y0, x1, y1];
  }
  function findWorldFeature(iso) {
    var out = null;
    ((GJ.world || {}).features || []).forEach(function (f) { if ((f.properties || {}).i === iso) out = f; });
    return out;
  }

  /* ── 标注（HTML 叠层 + 贪心避让，不依赖地图字形服务）────────
     项目没有 glyphs 服务，symbol 层会报错；thematic 的 setLabels 不做避让，
     34 个省名在东部会糊成一团，所以这里自己算屏幕矩形、按 GDP 大的优先占位。 */
  var LBL = { raf: 0 };
  var mctx = document.createElement('canvas').getContext('2d');
  function requestLabels() {
    if (LBL.raf) return;
    LBL.raf = requestAnimationFrame(function () { LBL.raf = 0; paintLabels(); });
  }
  function uiBoxes() {
    var out = [];
    ['.intro', '.detail', '.dock', '.panel'].forEach(function (sel) {
      var n = document.querySelector(sel);
      if (!n || n.hidden) return;
      var r = n.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) return;
      out.push(r);
    });
    return out;
  }
  function paintLabels() {
    var el = document.getElementById('labels');
    if (!el) return;
    var ck = document.getElementById('ckLabel');
    if (view === 'ladder' || (ck && !ck.checked)) { el.innerHTML = ''; return; }
    var isWd = view === 'world';
    var cands = [];
    if (isWd) {
      if (!GJ.world) { el.innerHTML = ''; return; }
      var want = selPeers.map(function (x) { return x.i; });
      // 一个国家可能由多个多边形组成（加拿大 30+ 个岛），只取外接框最大的那块做锚点
      var best = {};
      (GJ.world.features || []).forEach(function (f) {
        var p = f.properties || {};
        if (want.indexOf(p.i) < 0) return;
        var b = bboxOf(f.geometry); if (!b) return;
        if (b[2] - b[0] > 180) return;   // 跨反子午线的国家（俄罗斯等）外接框中心会跑到大西洋，不标
        var area = (b[2] - b[0]) * (b[3] - b[1]);
        if (!best[p.i] || area > best[p.i].area) best[p.i] = { area: area, p: p, b: b };
      });
      Object.keys(best).forEach(function (iso) {
        var o = best[iso];
        cands.push({ t: o.p.n, sub: '', c: [(o.b[0] + o.b[2]) / 2, (o.b[1] + o.b[3]) / 2], w: o.p.v, wd: 1 });
      });
    } else {
      if (!GJ.provinces) { el.innerHTML = ''; return; }
      var big = app.map.getZoom() >= 5.2;
      (GJ.provinces.features || []).forEach(function (f) {
        var p = f.properties || {};
        if (!p.name || !p.c) return;
        cands.push({ t: p.s, sub: big ? grp(p.usd) : '', c: p.c, w: p.usd, sel: selName === p.name });
      });
    }
    cands.sort(function (a, b) { return (b.sel ? 1e9 : 0) + b.w - ((a.sel ? 1e9 : 0) + a.w); });

    var W = el.clientWidth || window.innerWidth, H = el.clientHeight || window.innerHeight;
    var bd = app.map.getBounds(), ui = uiBoxes(), boxes = [], html = '';
    for (var i = 0; i < cands.length; i++) {
      var it = cands[i];
      var lng = it.c[0], lat = it.c[1];
      if (lng < bd.getWest() || lng > bd.getEast() || lat < bd.getSouth() || lat > bd.getNorth()) continue;
      var pt = app.map.project([lng, lat]);
      if (pt.x < 30 || pt.x > W - 30 || pt.y < 24 || pt.y > H - 24) continue;
      mctx.font = (it.sel ? '800 ' : '600 ') + (it.wd ? 12.5 : 12) + 'px "PingFang SC","Microsoft YaHei",system-ui,sans-serif';
      var txt = it.t + (it.sub ? ' ' + it.sub : '');
      var w = mctx.measureText(txt).width + 16, h = 20;
      // 撞到面板或已有标注时，上下左右挪一档再试，挪不动才丢弃
      var OFF = [[0, 0], [0, -26], [0, 26], [-38, 0], [38, 0]];
      var placed = null;
      for (var s = 0; s < OFF.length && !placed; s++) {
        var cx = pt.x + OFF[s][0], cy = pt.y + OFF[s][1];
        var box = { l: cx - w / 2, r: cx + w / 2, t: cy - h / 2, b: cy + h / 2 };
        if (box.l < 6 || box.r > W - 6 || box.t < 6 || box.b > H - 6) continue;
        var hit = false, k;
        for (k = 0; k < ui.length; k++) {
          var o = ui[k];
          if (box.l < o.right && box.r > o.left && box.t < o.bottom && box.b > o.top) { hit = true; break; }
        }
        if (!hit) {
          for (k = 0; k < boxes.length; k++) {
            var q = boxes[k];
            if (box.l < q.r && box.r > q.l && box.t < q.b && box.b > q.t) { hit = true; break; }
          }
        }
        if (!hit) placed = { x: cx, y: cy, box: box };
      }
      if (!placed) continue;
      boxes.push(placed.box);
      html += '<div class="glabel' + (it.sel ? ' is-sel' : '') + (it.wd ? ' is-wd' : '') +
        '" style="left:' + placed.x.toFixed(1) + 'px;top:' + placed.y.toFixed(1) + 'px">' +
        esc(it.t) + (it.sub ? '<small>' + esc(it.sub) + '</small>' : '') + '</div>';
    }
    el.innerHTML = html;
  }

  /* ── 图例 ───────────────────────────────────────────────── */
  function renderLegend() {
    var el = document.getElementById('legend');
    if (!el) return;
    var labels = ['< 500', '500 – 1 000', '1 000 – 2 500', '2 500 – 5 000', '5 000 – 10 000', '≥ 10 000'];
    var rows = CFG.COLORS.map(function (c, i) {
      return '<span class="lg-row"><i style="background:' + c + '"></i>' + labels[i] + '</span>';
    }).join('');
    el.innerHTML = '<div class="lg-cap">GDP 总量 · 亿美元（2025，现价）</div>' + rows +
      '<div class="lg-note">颜色只比 <b>总量</b>，不代表人均富裕程度。全球阶梯视图里可看 34 个省插进 186 个经济体的完整位次。</div>';
  }

  /* ── 全球阶梯 ───────────────────────────────────────────── */
  var LADDER = [], ldMin = 1, ldMax = 1;
  var SKIP = { HKG: 1, MAC: 1 };   // 省列表已有香港 / 澳门，国家榜里不再重复
  function buildLadder() {
    LADDER = [];
    PROV.forEach(function (p) { LADDER.push({ k: 'p', n: p.s, full: p.name, v: p.usd }); });
    COUNTRIES.forEach(function (c) { if (!SKIP[c.i]) LADDER.push({ k: 'c', n: c.n, iso: c.i, v: c.v }); });
    LADDER.sort(function (a, b) { return b.v - a.v; });
    var vs = LADDER.map(function (x) { return Math.log10(Math.max(x.v, 1)); });
    ldMin = Math.min.apply(null, vs); ldMax = Math.max.apply(null, vs);
    renderLadder('');
  }
  function renderLadder(q) {
    var body = document.getElementById('ldBody');
    if (!body) return;
    var html = '';
    for (var i = 0; i < LADDER.length; i++) {
      var it = LADDER[i];
      if (q && it.n.indexOf(q) < 0 && String(it.full || '').indexOf(q) < 0) continue;
      var w = 100 * (Math.log10(Math.max(it.v, 1)) - ldMin) / (ldMax - ldMin);
      html += '<div class="ld-row is-' + it.k + (it.full && selName === it.full ? ' is-on' : '') + '" ' +
        'data-k="' + it.k + '" data-n="' + esc(it.full || it.n) + '" data-iso="' + (it.iso || '') + '">' +
        '<span class="ld-r">' + (i + 1) + '</span>' +
        '<span class="ld-n">' + esc(it.n) + (it.k === 'p' ? '<em>省</em>' : '') + '</span>' +
        '<span class="ld-b"><i style="width:' + w.toFixed(2) + '%"></i></span>' +
        '<span class="ld-v">' + usdStr(it.v) + '</span></div>';
    }
    body.innerHTML = html || '<div class="ld-empty">没找到「' + esc(q) + '」</div>';
    Array.prototype.forEach.call(body.querySelectorAll('.ld-row'), function (r) {
      r.addEventListener('click', function () {
        if (r.getAttribute('data-k') === 'p') { selectProv(r.getAttribute('data-n')); return; }
        var iso = r.getAttribute('data-iso');
        var c = null;
        for (var j = 0; j < COUNTRIES.length; j++) { if (COUNTRIES[j].i === iso) { c = COUNTRIES[j]; break; } }
        if (!c) return;
        var best = null;
        PROV.forEach(function (p) {
          var d = Math.abs(p.usd - c.v);
          if (!best || d < best.d) best = { p: p, d: d };
        });
        var t = document.getElementById('ldToast');
        t.hidden = false;
        t.innerHTML = '<b>' + esc(c.n) + '</b> ' + usdStr(c.v) + '美元　≈　中国的 <b>' + esc(best.p.s) + '</b>（' +
          usdStr(best.p.usd) + '美元，差 ' + (100 * Math.abs(best.p.usd - c.v) / c.v).toFixed(1) + '%）' +
          '<button type="button" id="ldGo">看这个省 →</button>';
        document.getElementById('ldGo').addEventListener('click', function () {
          t.hidden = true;
          selectProv(best.p.name);
        });
      });
    });
  }

  /* ── 事件 ───────────────────────────────────────────────── */
  function bind() {
    var map = app.map;

    map.on('mousemove', 'cn-fill', function (e) {
      var f = e.features && e.features[0]; if (!f) return;
      var p = f.properties || {};
      var d = PEERS[p.name];
      map.getCanvas().style.cursor = 'pointer';
      var html = '<b>' + esc(p.s || p.name) + '</b>' +
        '<br>' + cnyStr(p.cny) + '元　·　' + usdStr(p.usd) + '美元';
      if (d) html += '<br><span style="color:#9fb4cd">若为一国：第 ' + d.rank + ' 位</span>';
      if (d && d.up && d.up.length && d.dn && d.dn.length) {
        html += '<br>≈ ' + esc(d.up[0].n) + ' / ' + esc(d.dn[d.dn.length - 1].n);
      }
      html += '<br><span style="color:#9fb4cd">点按看完整对标</span>';
      app.tooltip(html, e.point.x, e.point.y);
    });
    map.on('mouseleave', 'cn-fill', function () {
      map.getCanvas().style.cursor = '';
      app.tooltip(null);
    });
    map.on('click', 'cn-fill', function (e) {
      var f = e.features && e.features[0];
      if (f && f.properties) selectProv(f.properties.name);
    });

    map.on('mousemove', 'wd-fill', function (e) {
      var f = e.features && e.features[0]; if (!f) return;
      var p = f.properties || {};
      map.getCanvas().style.cursor = p.v ? 'pointer' : '';
      app.tooltip('<b>' + esc(p.n) + '</b><br>' + (p.v ? usdStr(p.v) + '美元　·　第 ' + p.k + ' 位' : '无 GDP 数据'),
        e.point.x, e.point.y);
    });
    map.on('mouseleave', 'wd-fill', function () { app.tooltip(null); });
    map.on('click', 'wd-fill', function (e) {
      var f = e.features && e.features[0];
      if (f && f.properties && f.properties.i) hiOne(f.properties.i);
    });

    Array.prototype.forEach.call(document.querySelectorAll('#vseg button'), function (b) {
      b.addEventListener('click', function () { setView(b.getAttribute('data-view')); });
    });
    document.getElementById('btnWorld').addEventListener('click', function () { setView('world'); });
    document.getElementById('ldClose').addEventListener('click', function () { setView('cn'); });
    document.getElementById('ldSearch').addEventListener('input', function (e) {
      renderLadder((e.target.value || '').trim());
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (view === 'ladder') setView('cn'); else clearSel(); }
    });

    var ck = document.getElementById('ckLabel');
    if (ck) ck.addEventListener('change', requestLabels);
    ['move', 'zoom', 'resize', 'moveend', 'zoomend', 'idle'].forEach(function (ev) { map.on(ev, requestLabels); });
  }
})();
