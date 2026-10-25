/* 中国汉语方言分布 · 互动逻辑（基于 _shared/thematic 共享运行时）
 * 图层（自下而上）：dialect-fill 大区填色（半透明，可透出底图）→ county-line 县界
 *                  → boundary-lines 图集原始界线 → sel-fill/sel-line 选中高亮
 * 标注：HTML 叠加（不依赖地图字形服务），三级随缩放切换——
 *       大区（<4.75）→ 次方言区（4.75~6.75）→ 方言片（≥6.75），带重叠避让。
 * 着色：props.g（大区 key）→ GROUPS 颜色；未记录=灰。
 */
(function () {
  'use strict';
  var CFG = window.CNDIAL_CONFIG;
  var fmt = Thematic.fmt, esc = Thematic.esc;
  var COLORS = CFG.COLORS, GROUPS = CFG.GROUPS;
  var hi = null;          // 图例高亮的大区 key
  var selCode = null;     // 选中县 adcode
  var FILL_OP = 0.66;     // 填色半透明，让地形/卫星底图透出来
  var hcOn = true;        // 是否按「该省汉族人口占比」调淡填色

  /* 填色不透明度：基础半透明 × 汉语人口基数倍率。
     hc 低的省（新疆 42、西藏 12、青海 51）色块会明显变淡——
     这不是「方言分布弱」，而是提示「这里主要通行的不是汉语」。 */
  function hcFactor() {
    var a = ['interpolate', ['linear'], ['get', 'hc']];
    (CFG.HC_STOPS || []).forEach(function (st) { a.push(st[0], st[1]); });
    return a;
  }
  function fillOpacity() {
    var base = hcOn ? ['*', FILL_OP, hcFactor()] : FILL_OP;
    if (!hi) return base;
    return ['case', ['==', ['get', 'g'], hi], 0.94, 0.09];
  }

  var el = {
    legend: document.getElementById('legend'),
    detail: document.getElementById('detail'),
    dtRole: document.getElementById('dtRole'), dtName: document.getElementById('dtName'), dtSub: document.getElementById('dtSub'),
    dtHan: document.getElementById('dtHan'),
    dtLb1: document.getElementById('dtLb1'), dtV1: document.getElementById('dtV1'), dtU1: document.getElementById('dtU1'),
    dtLb2: document.getElementById('dtLb2'), dtV2: document.getElementById('dtV2'), dtU2: document.getElementById('dtU2'),
    dtLb3: document.getElementById('dtLb3'), dtV3: document.getElementById('dtV3'), dtU3: document.getElementById('dtU3'),
    dtDescLb: document.getElementById('dtDescLb'), dtDesc: document.getElementById('dtDesc'), dtFooter: document.getElementById('dtFooter'),
    fCounties: document.getElementById('fCounties'), fHan: document.getElementById('fHan'), fGuan: document.getElementById('fGuan')
  };

  /* 斜纹纹理：汉族人口占比低的省叠一层，视觉上提示「汉语只覆盖当地一部分人」。
     颜色仍是方言色，只是被斜纹「盖住」——比单纯调淡更容易和「未记录=灰」区分。 */
  function makeHatchImg() {
    var N = 13, c = document.createElement('canvas');
    c.width = c.height = N;
    var g = c.getContext('2d');
    g.clearRect(0, 0, N, N);
    g.strokeStyle = 'rgba(255,255,255,0.38)';
    g.lineWidth = 1.0;
    g.beginPath();
    g.moveTo(-3, N - 1); g.lineTo(N - 1, -3);
    g.moveTo(1, N + 3); g.lineTo(N + 3, 1);
    g.stroke();
    return { width: N, height: N, data: g.getImageData(0, 0, N, N).data };
  }
  function ensureHatch() {
    var m = app.map;
    if (!m || !m.getSource('counties')) return;
    if (!m.getImage('hc-hatch')) {
      try { m.addImage('hc-hatch', makeHatchImg(), { pixelRatio: 1 }); } catch (e) { return; }
    }
    if (!m.getLayer('hc-hatch')) {
      try {
        m.addLayer({
          id: 'hc-hatch', type: 'fill', source: 'counties',
          filter: ['all', ['<', ['get', 'hc'], CFG.HC_HATCH || 70],
                   ['!=', ['get', 'g'], '未记录']],
          layout: { visibility: hcOn ? 'visible' : 'none' },
          paint: {
            'fill-pattern': 'hc-hatch',
            // 低缩放时是主要提示，放大后逐渐让位给色块与详情卡
            'fill-opacity': ['interpolate', ['linear'], ['zoom'], 3, 0.85, 6.5, 0.52, 9, 0.14]
          }
        }, 'county-line');
      } catch (e) { /* 图层插入失败不阻断主流程 */ }
    }
  }

  function colorExpr() {
    var arr = ['match', ['get', 'g']];
    GROUPS.forEach(function (g) { arr.push(g.key, g.color); });
    arr.push('#6b7280');
    return arr;
  }

  var app = Thematic.create({
    slug: 'china-dialects',
    view: CFG.view, bounds: CFG.bounds, extent: CFG.extent,
    boundsMobile: CFG.boundsMobile,
    graticuleStep: CFG.graticuleStep,
    defaultBasemap: CFG.defaultBasemap,
    imgPaint: CFG.imgPaint,
    basemaps: CFG.basemaps,
    sources: {
      counties: { data: 'data/counties.geojson' },
      boundaries: { data: 'data/boundaries.geojson' }
    },
    layers: [
      { id: 'dialect-fill', type: 'fill', source: 'counties',
        paint: { 'fill-color': colorExpr(), 'fill-opacity': fillOpacity() } },
      { id: 'county-line', type: 'line', source: 'counties',
        paint: { 'line-color': '#0a1220', 'line-width': 0.4, 'line-opacity': 0.42 } },
      { id: 'boundary-lines', type: 'line', source: 'boundaries',
        paint: { 'line-color': '#0a1220', 'line-width': 1.9, 'line-opacity': 0.8 } },
      { id: 'sel-fill', type: 'fill', source: 'counties',
        filter: ['==', ['get', 'adcode'], '__none__'],
        paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.16 } },
      { id: 'sel-line', type: 'line', source: 'counties',
        filter: ['==', ['get', 'adcode'], '__none__'],
        paint: { 'line-color': '#ffffff', 'line-width': 2.6, 'line-opacity': 0.95 } }
    ],
    onReady: boot,
    onOverview: function () { clearSel(); app.fitAll({ animate: true }); },
    onClose: clearSel
  });
  window.__app = app;

  /* ── 分级标注系统 ─────────────────────────────────────────
     数据 data/labels.geojson：k=g 大区 / k=d 次方言区 / k=s 方言片 / k=c 县级名。
     看全图用大区，放大后逐级换成语义更细的下一级，最深处补县级名做地理参照。
     每帧按「面积大的优先」贪心避让，被挡住的标注直接不画。 */
  var LB = {
    items: [], ready: false, on: true, tier: null, raf: 0,
    TH: { d: 4.75, s: 6.4, c: 8.2 },   // 层级切换缩放阈值
    PILL: { g: 26, d: 6, s: 6, c: 5 }  // 额外横向占用（g 有圆点+胶囊内边距）
  };
  var mctx = document.createElement('canvas').getContext('2d');

  function labelFont(k, fs) {
    return (k === 'g' ? '700 ' : k === 'd' ? '600 ' : '500 ') + fs.toFixed(1) +
      'px "PingFang SC","Microsoft YaHei","Noto Sans CJK SC",system-ui,sans-serif';
  }
  function labelSize(it, fs) {
    mctx.font = labelFont(it.k, fs);
    var w = mctx.measureText(it.t).width + LB.PILL[it.k];
    var h = fs * (it.k === 'g' ? 1.6 : 1.34);
    return { w: w, h: h };
  }
  function tierOf(z) {
    if (z < LB.TH.d) return 'g';
    if (z < LB.TH.s) return 'd';
    if (z < LB.TH.c) return 's';
    return 'c';
  }
  function fsOf(k, z) {
    if (k === 'g') return Math.max(12.5, Math.min(16, 11.0 + (z - 3) * 1.9));
    if (k === 'd') return Math.max(11.5, Math.min(14, 10.4 + (z - LB.TH.d) * 1.3));
    if (k === 's') return Math.max(10.5, Math.min(12.5, 9.8 + (z - LB.TH.s) * 0.75));
    return Math.max(10, Math.min(12, 9.2 + (z - LB.TH.c) * 0.5));
  }

  function loadLabels() {
    fetch('data/labels.geojson').then(function (r) { return r.json(); }).then(function (gj) {
      LB.items = (gj.features || []).map(function (f) {
        var p = f.properties || {};
        return {
          k: p.k, t: p.t, g: p.g, n: p.n, a: p.a || 0, alt: p.alt || null,
          lng: f.geometry.coordinates[0], lat: f.geometry.coordinates[1]
        };
      }).filter(function (it) {
        // 「其他」不是一片连续区域（乡话在湘西、儋州话在海南），大区级不标，避免误导
        return !(it.k === 'g' && it.g === '其他');
      });
      LB.ready = true;
      requestLabels(true);
    }).catch(function () { LB.ready = false; });
  }

  function requestLabels(force) {
    if (LB.raf && !force) return;
    if (force) cancelAnimationFrame(LB.raf);
    LB.raf = requestAnimationFrame(function () { LB.raf = 0; paintLabels(); });
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
  function inBox(x, y, b) { return x >= b.left && x <= b.right && y >= b.top && y <= b.bottom; }

  function paintLabels() {
    var el = document.getElementById('labels');
    if (!el) return;
    if (!LB.ready || !LB.on) { el.innerHTML = ''; return; }
    var map = app.map, z = map.getZoom(), tier = tierOf(z);
    LB.tier = tier;
    var W = el.clientWidth || window.innerWidth, H = el.clientHeight || window.innerHeight;
    var bd = map.getBounds(), ui = uiBoxes();
    // 最深层（县级名）同时保留「方言片」名称，否则放到最大就只剩县名、丢了方言上下文
    var tiers = tier === 'c' ? ['s', 'c'] : [tier];

    var cands = [];
    for (var i = 0; i < LB.items.length; i++) {
      var it = LB.items[i];
      if (tiers.indexOf(it.k) < 0) continue;
      // 大区级带备选锚点：东南几省在低缩放下锚点会挤成一团，撞车时换位
      var spots = [[it.lng, it.lat]];
      if (it.k === 'g' && it.alt) spots = spots.concat(it.alt);
      var sz = labelSize(it, fsOf(it.k, z)), pts = [];
      for (var s = 0; s < spots.length; s++) {
        var lng = spots[s][0], lat = spots[s][1];
        if (lng < bd.getWest() || lng > bd.getEast() || lat < bd.getSouth() || lat > bd.getNorth()) continue;
        var p = map.project([lng, lat]);
        if (p.x < 26 || p.x > W - 26 || p.y < 20 || p.y > H - 20) continue;
        var skip = false;
        for (var u = 0; u < ui.length; u++) { if (inBox(p.x, p.y, ui[u])) { skip = true; break; } }
        if (skip) continue;
        pts.push(p);
      }
      if (!pts.length) continue;
      cands.push({ it: it, pts: pts, w: sz.w, h: sz.h, fs: fsOf(it.k, z) });
    }
    // 面积大的先占位：确保「官话」这类大区永远优先于小片
    cands.sort(function (a, b) { return b.it.a - a.it.a; });

    var kept = [], boxes = [];
    for (var c = 0; c < cands.length; c++) {
      var q = cands[c], placed = null;
      for (var s2 = 0; s2 < q.pts.length && !placed; s2++) {
        var pt = q.pts[s2];
        var box = { l: pt.x - q.w / 2 - 4, r: pt.x + q.w / 2 + 4, t: pt.y - q.h / 2 - 3, b: pt.y + q.h / 2 + 3 };
        var hit = false;
        for (var b = 0; b < boxes.length; b++) {
          var o = boxes[b];
          if (box.l < o.r && box.r > o.l && box.t < o.b && box.b > o.t) { hit = true; break; }
        }
        if (!hit) { placed = { it: q.it, x: pt.x, y: pt.y, fs: q.fs }; boxes.push(box); }
      }
      if (placed) kept.push(placed);
    }

    var html = '';
    for (var k = 0; k < kept.length; k++) {
      var q2 = kept[k], it2 = q2.it;
      var dim = hi && it2.g !== hi;
      html += '<div class="dl-lb is-' + it2.k + (dim ? ' is-dim' : '') + '"' +
        ' style="left:' + q2.x.toFixed(1) + 'px;top:' + q2.y.toFixed(1) + 'px;font-size:' + q2.fs.toFixed(1) + 'px' +
        (it2.k === 'g' ? ';--c:' + (COLORS[it2.g] || '#fff') : '') + '">' + esc(it2.t) + '</div>';
    }
    el.innerHTML = html;
  }

  function boot() {
    ensureHatch();
    app.map.on('load', ensureHatch);
    app.fitAll({ animate: false });
    fillFacts();
    renderLegend();
    bind();
    loadLabels();
    ['move', 'resize'].forEach(function (ev) { app.map.on(ev, function () { requestLabels(); }); });
    window.__chinaDialectsReady = true;
  }

  function fillFacts() {
    if (el.fCounties) el.fCounties.textContent = fmt(CFG.TOTAL_COUNTIES, 0);
    if (el.fHan) el.fHan.textContent = fmt(CFG.HAN_COUNTIES, 0);
    if (el.fGuan) el.fGuan.textContent = Math.round(100 * 1906 / CFG.TOTAL_COUNTIES) + '%';
  }

  function renderLegend() {
    if (!el.legend) return;
    var rows = GROUPS.map(function (g) {
      var c = g.count !== undefined ? ' <em>' + fmt(g.count, 0) + '</em>' : '';
      return '<span class="lg-row" data-key="' + g.key + '" title="点按高亮该大区"><i style="background:' + g.color + '"></i>' + esc(g.name) + c + '</span>';
    }).join('');
    el.legend.innerHTML = '<div class="lg-cap">汉语方言 · 十大区</div>' + rows +
      '<div class="lg-note">按<b>县级主分区</b>着色（图集赋值），数字为该大区的县级记录数，<b>不等于人口占比</b>。点图例可高亮。</div>' +
      '<div class="lg-note lg-hatch"><s></s>斜纹 = 该省<b>汉族人口占比低于 ' + (CFG.HC_HATCH || 70) +
      '%</b>（七普）。图上是当地汉族说的汉语，本地主要通行的多为少数民族语言。</div>';
    Array.prototype.forEach.call(el.legend.querySelectorAll('.lg-row'), function (row) {
      row.addEventListener('click', function () {
        var k = row.getAttribute('data-key');
        hi = (hi === k) ? null : k;
        applyHi();
        Array.prototype.forEach.call(el.legend.querySelectorAll('.lg-row'), function (r) {
          r.classList.toggle('is-on', hi && r.getAttribute('data-key') === hi);
        });
      });
    });
  }

  function applyHi() {
    if (!app.map.getLayer('dialect-fill')) return;
    // 未高亮：基础透明度 × 汉语人口基数；高亮：选中大区抬到 94%，其余压到 9%
    app.map.setPaintProperty('dialect-fill', 'fill-opacity', fillOpacity());
    // 斜纹跟着一起收敛：关闭时清空，高亮时只留选中大区
    if (app.map.getLayer('hc-hatch')) {
      var th = CFG.HC_HATCH || 70, hf;
      if (!hcOn) hf = ['==', ['get', 'adcode'], '__none__'];
      else if (hi) hf = ['all', ['<', ['get', 'hc'], th], ['==', ['get', 'g'], hi]];
      else hf = ['all', ['<', ['get', 'hc'], th], ['!=', ['get', 'g'], '未记录']];
      app.map.setFilter('hc-hatch', hf);
    }
    requestLabels(true);
  }

  function setSel(code) {
    selCode = code;
    var f = ['==', ['get', 'adcode'], code || '__none__'];
    if (app.map.getLayer('sel-fill')) app.map.setFilter('sel-fill', f);
    if (app.map.getLayer('sel-line')) app.map.setFilter('sel-line', f);
  }

  function clearSel() {
    setSel(null);
    if (el.detail) el.detail.hidden = true;
    app.setDetailOpen(false);
  }

  function openDetail(f) {
    var p = f.properties || {};
    var c = COLORS[p.g] || '#6b7280';
    setSel(p.adcode);
    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', c);
    el.dtRole.textContent = '县级 · ' + (p.prov || '中国');
    el.dtName.textContent = p.name || '—';
    el.dtSub.textContent = (p.prov || '') + '　·　adcode ' + (p.adcode || '—');

    el.dtLb1.textContent = '大区'; el.dtV1.textContent = p.g || '—'; el.dtU1.textContent = '';
    el.dtLb2.textContent = '次方言区'; el.dtV2.textContent = p.d || '—'; el.dtU2.textContent = '';
    el.dtLb3.textContent = '方言片'; el.dtV3.textContent = p.s || '—'; el.dtU3.textContent = '';

    // 「这是汉语方言图」的定量提示：该省汉族人口占比越低，色块越淡，越要说明范围
    if (el.dtHan) {
      var hc = p.hc, msg = '';
      if (hc != null) {
        if (p.g === '未记录') {
          msg = '该县<b>没有汉语方言分区记录</b>。' + (p.prov || '') + '汉族人口占 <b>' +
            hc + '%</b>（七普），当地主要通行的多为少数民族语言。';
        } else if (hc < 90) {
          msg = (p.prov || '') + '汉族人口占 <b>' + hc + '%</b>（七普）。图上这个颜色只代表<b>当地汉族居民所用的汉语方言</b>，少数民族语言不在本图范围内。';
        }
        if (p.zz && hc != null) msg += '　本县属<b>' + esc(p.zzn) + '</b>（民族自治地方）。';
      }
      el.dtHan.innerHTML = msg;
      el.dtHan.hidden = !msg;
    }
    el.dtDescLb.textContent = '完整方言归属';
    var path = p.path || '—';
    var extra = '';
    if (p.mixed) extra = '　<b>该县多种方言并存</b>，此处为图集主分区，县内并非只此一种。';
    if (p.src === 'fill' || p.src === 'fill-tw' || p.src === 'fill-hkmo') extra += '　图集未单列，本县按所在省/地区主区补全。';
    if (p.src === 'none') extra += '　该县无汉语方言分区记录（多为非汉语区）。';
    el.dtDesc.innerHTML = esc(path) + extra;

    el.dtFooter.innerHTML = '<span>大区 ' + esc(p.g || '') + '</span><span>' + esc(p.prov || '') + '</span><span>' + esc(p.gt && p.gt !== p.g ? '图集：' + p.gt : '') + '</span>';
    app.collapseDrawer();
  }

  function bind() {
    var map = app.map;
    map.on('mousemove', 'dialect-fill', function (e) {
      var f = e.features && e.features[0]; if (!f) return;
      var p = f.properties || {};
      map.getCanvas().style.cursor = 'pointer';
      var c = COLORS[p.g] || '#6b7280';
      var html = '<b>' + esc(p.name || '') + '</b> <span style="color:#9fb4cd">' + esc(p.prov || '') + '</span>' +
        '<br><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + c + ';margin-right:5px"></span>' +
        esc(p.g || '未记录') + (p.d ? ' · ' + esc(p.d) : '') +
        '<br><span style="color:#9fb4cd">点按查看完整方言归属</span>';
      app.tooltip(html, e.point.x, e.point.y);
    });
    map.on('mouseleave', 'dialect-fill', function () {
      map.getCanvas().style.cursor = '';
      app.tooltip(null);
    });
    map.on('click', 'dialect-fill', function (e) {
      var f = e.features && e.features[0];
      if (f) openDetail(f);
    });
    map.on('click', function (e) {
      if (!e.features || !e.features.length) { /* 点空白保留选中，避免误清；Esc/✕ 退出 */ }
    });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') clearSel(); });

    var ckHc = document.getElementById('ckHanShare');
    if (ckHc) {
      hcOn = !!ckHc.checked;
      ckHc.addEventListener('change', function () {
        hcOn = !!ckHc.checked;
        applyHi();
      });
    }

    var ck = document.getElementById('ckDialectLabel');
    if (ck) {
      LB.on = !!ck.checked;
      ck.addEventListener('change', function () { LB.on = !!ck.checked; requestLabels(true); });
    }
  }
})();
