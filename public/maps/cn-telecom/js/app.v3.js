/* 三大运营商省级分布图 · cn-telecom
   主视图：31 省按「谁是移动在该省的主要挑战者」着色（北方联通红 / 南方电信蓝 /
   移动独大绿 / 充分竞争灰）。单家视角：按该家省级估算份额 12–68% 连续色阶。
   点省 → 右侧详情卡三家份额 + 格局解读；实时搜索 / 分组目录 / #u/<省名> 分享。

   数据（_g/build_cn_telecom.py 生成）：
     data/provinces.geojson  35 要素（31 省 + 港澳台 + 九段线；属性 m/c/u 估算份额）
     data/index.json         [adcode, 简称, 类型, 全名]

   口径声明：省级无官方逐省逐家用户份额，全部估算；全国份额取 2025 年报实数。 */
(function () {
  'use strict';

  var CFG = window.CTM_CONFIG;
  var fmt = Thematic.fmt, esc = Thematic.esc;
  var COLORS = CFG.COLORS, LEADS = CFG.LEADS, VIEWS = CFG.VIEWS, RAMPS = CFG.RAMPS;
  var NATION = CFG.NATION;

  var el = {};
  ['fCm', 'fOthers', 'fProv', 'viewStrip', 'grpStrip', 'searchInput', 'searchResults',
   'unitList', 'listHint', 'detail', 'dtLevel', 'dtName', 'dtSub', 'shareBox', 'dtMeta',
   'provNote', 'dtFooter', 'introBarText'].forEach(function (id) {
    el[id] = document.getElementById(id);
  });

  var S = {
    feats: [], idx: [], byName: {},
    sel: null, hi: null, mode: 'all', labelsOn: true
  };

  function plainFeature(f) {
    var props = {};
    for (var k in f.properties) if (Object.prototype.hasOwnProperty.call(f.properties, k)) props[k] = f.properties[k];
    return { type: 'Feature', properties: props, geometry: f.geometry };
  }

  /* ── 着色表达式 ── */
  /* 主视图：lead 分组着色；港澳台灰；选中退到 0.1；分组高亮时其余压暗 */
  function allColorExpr() {
    var a = ['match', ['get', 'lead']];
    LEADS.forEach(function (g) { a.push(g.key, g.color); });
    a.push(COLORS.na);
    return a;
  }
  /* 单家视角：按各家实际份额区间插值五档色。
     VIEWS key 为 cm/ct/cu，数据字段是 m/c/u，必须映射，否则取到 null 不显色。
     每家用自己的区间，贴合真实分布，避免电信/联通挤在暗档。 */
  var RAMP_FIELD = { cm: 'm', ct: 'c', cu: 'u' };
  var RAMP_RANGE = { cm: [38, 72], ct: [10, 38], cu: [8, 44] };
  function rampColorExpr(key) {
    var stops = RAMPS[key], n = stops.length - 1;
    var range = RAMP_RANGE[key] || [12, 68], lo = range[0], hi = range[1];
    var a = ['interpolate', ['linear'], ['get', RAMP_FIELD[key] || key]];
    for (var i = 0; i <= n; i++) a.push(lo + (hi - lo) * i / n, stops[i]);
    return a;
  }
  function colorExpr() {
    if (S.mode === 'all') return allColorExpr();
    return rampColorExpr(S.mode);
  }
  function opacityExpr() {
    var base = S.hi
      ? ['case', ['==', ['get', 'lead'], S.hi], 0.78, 0.12]
      : 0.66;
    return ['case', ['boolean', ['feature-state', 'selected'], false], 0.1, base];
  }

  /* ── 启动 ── */
  var app = Thematic.create({
    slug: 'cn-telecom',
    view: CFG.view, bounds: CFG.bounds, boundsMobile: CFG.boundsMobile, extent: CFG.extent,
    graticuleStep: CFG.graticuleStep,
    imgPaint: CFG.imgPaint,
    /* 省界自己画（tele-fill / tele-line），关掉引擎默认 prov-* 防止 id 冲突 */
    province: false,
    sources: {
      main: { data: 'data/provinces.geojson', promoteId: 'adcode' },
      sel: { data: Thematic.EMPTY, promoteId: 'adcode' }
    },
    layers: [
      { id: 'tele-fill', type: 'fill', source: 'main',
        paint: { 'fill-color': colorExpr(), 'fill-opacity': opacityExpr() } },
      { id: 'tele-line', type: 'line', source: 'main',
        paint: { 'line-color': '#ffffff', 'line-width': 0.65, 'line-opacity': 0.34 } },
      { id: 'sel-halo', type: 'line', source: 'sel', layout: { visibility: 'none' },
        paint: { 'line-color': '#7dd3fc', 'line-width': 7, 'line-opacity': 0, 'line-blur': 2 } },
      { id: 'sel-line', type: 'line', source: 'sel', layout: { visibility: 'none' },
        paint: { 'line-color': '#ffffff', 'line-width': 2.2, 'line-opacity': 0.95 } }
    ],
    onReady: boot,
    onOverview: function () { setSel(null); app.fitAll({ animate: true }); },
    onClose: function () { setSel(null); }
  });
  window.__app = app;
  /* 封面生成脚本（_gen_cn_store_covers.mjs）统一用 window.__map 取 map 实例 */
  window.__map = app.map;

  function boot() {
    fetch('data/provinces.geojson').then(function (r) { return r.json(); }).then(function (fc) {
      S.feats = fc.features || [];
      S.feats.forEach(function (f) {
        var p = f.properties;
        if (p.level === 'prov' || p.level === 'special') S.byName[String(p.short)] = f;
      });

      el.fCm.textContent = NATION.cm.toFixed(1);
      el.fOthers.textContent = NATION.ct.toFixed(1) + ' / ' + NATION.cu.toFixed(1);
      el.fProv.textContent = String(S.feats.filter(function (f) { return f.properties.level === 'prov'; }).length);

      renderViews();
      renderGrpStrip();
      renderUnitList();
      bind();
      bindSearch();
      bindPanel();
      app.fitAll({ animate: false });
      updateLabels();
      window.__cnTelecomReady = true;

      var m = location.hash.match(/^#u\/(.+)$/);
      if (m) goToName(decodeURIComponent(m[1]));
      window.addEventListener('hashchange', function () {
        var h = location.hash.match(/^#u\/(.+)$/);
        if (h) {
          var nm = decodeURIComponent(h[1]);
          if (!S.sel || S.sel.properties.short !== nm) goToName(nm);
          return;
        }
        if (S.sel || !el.detail.hidden) { setSel(null); app.fitAll({ animate: true }); }
      });
    }).catch(function (err) {
      console.error('[cn-telecom] 数据加载失败', err);
      el.unitList.innerHTML = '<div class="sr-more">数据加载失败，请刷新重试。</div>';
    });
  }

  /* ── 视角切换 ── */
  function renderViews() {
    el.viewStrip.innerHTML = VIEWS.map(function (v) {
      return '<button type="button" class="vw-btn' + (v.key === S.mode ? ' is-on' : '') +
        '" data-mode="' + v.key + '" title="' + esc(v.desc) + '">' + esc(v.name) + '</button>';
    }).join('');
    el.viewStrip.addEventListener('click', function (e) {
      var b = e.target.closest('.vw-btn'); if (!b) return;
      setMode(b.getAttribute('data-mode'));
    });
  }
  function setMode(mode) {
    S.mode = mode;
    var map = app.map;
    if (map.getLayer('tele-fill')) map.setPaintProperty('tele-fill', 'fill-color', colorExpr());
    Array.prototype.forEach.call(el.viewStrip.querySelectorAll('.vw-btn'), function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-mode') === mode);
    });
    /* 单家视角下分组高亮无意义，清掉 */
    if (mode !== 'all' && S.hi) {
      S.hi = null;
      if (map.getLayer('tele-fill')) map.setPaintProperty('tele-fill', 'fill-opacity', opacityExpr());
      Array.prototype.forEach.call(el.grpStrip.querySelectorAll('.gp-btn'), function (b) { b.classList.remove('is-on'); });
    }
  }

  /* ── 左栏分组色带 ── */
  function renderGrpStrip() {
    el.grpStrip.innerHTML = LEADS.map(function (g) {
      return '<button type="button" class="gp-btn" data-key="' + g.key + '" title="' + esc(g.desc) + '">' +
        '<i style="background:' + g.color + '"></i>' + esc(g.name) + '</button>';
    }).join('');
    el.grpStrip.addEventListener('click', function (e) {
      var b = e.target.closest('.gp-btn'); if (!b) return;
      if (S.mode !== 'all') setMode('all');
      var k = b.getAttribute('data-key');
      S.hi = (S.hi === k) ? null : k;
      if (app.map.getLayer('tele-fill')) app.map.setPaintProperty('tele-fill', 'fill-opacity', opacityExpr());
      Array.prototype.forEach.call(el.grpStrip.querySelectorAll('.gp-btn'), function (x) {
        x.classList.toggle('is-on', S.hi && x.getAttribute('data-key') === S.hi);
      });
    });
  }

  /* ── 目录：按格局分组，组内按份额降序 ── */
  function renderUnitList() {
    var groups = {};
    S.feats.forEach(function (f) {
      var p = f.properties;
      if (p.level !== 'prov') return;
      (groups[p.lead] || (groups[p.lead] = [])).push(f);
    });
    var html = '';
    LEADS.forEach(function (g) {
      var arr = groups[g.key] || []; if (!arr.length) return;
      arr.sort(function (a, b) { return b.properties.m - a.properties.m; });
      html += '<button type="button" class="unit-prov" data-name="' + esc(g.key) + '">' +
        '<i class="dot" style="background:' + g.color + '"></i>' + esc(g.name) +
        '<em>' + arr.length + ' 省 ›</em></button>';
      arr.forEach(function (f) {
        var p = f.properties;
        html += '<button type="button" class="unit-row" data-name="' + esc(p.short) + '">' +
          '<span class="nm">' + esc(p.short) + '</span>' +
          '<span class="sh">移 ' + p.m + '</span>' +
          '<span class="sh">电 ' + p.c + '</span>' +
          '<span class="sh">联 ' + p.u + '</span>' +
          '</button>';
      });
    });
    el.unitList.innerHTML = html;
  }

  /* ── 搜索：省名 / 简称即时下拉 ── */
  function bindSearch() {
    var box = el.searchInput, out = el.searchResults, timer = 0;
    function run() {
      var q = box.value.trim();
      if (!q) { out.innerHTML = ''; return; }
      var hits = [];
      for (var i = 0; i < S.feats.length && hits.length < 12; i++) {
        var p = S.feats[i].properties;
        if (p.level !== 'prov' && p.level !== 'special') continue;
        if (p.short.indexOf(q) !== -1 || p.name.indexOf(q) !== -1 ||
            (p.region && p.region.indexOf(q) !== -1)) hits.push(p);
      }
      hits.sort(function (a, b) {
        return (a.short === q ? 0 : 1) - (b.short === q ? 0 : 1);
      });
      out.innerHTML = hits.length
        ? hits.map(function (p) {
            var badge = p.level === 'special' ? '港澳台' : CFG.LEAD_LABEL[p.lead];
            return '<button type="button" class="sr-row" data-name="' + esc(p.short) + '">' +
              '<span class="nm">' + esc(p.short) + '</span>' +
              '<span class="lv">' + esc(badge) + '</span></button>';
          }).join('')
        : '<div class="sr-more">没有匹配 “' + esc(q) + '” 的省份</div>';
    }
    box.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 120); });
    out.addEventListener('click', function (e) {
      var b = e.target.closest('.sr-row'); if (!b) return;
      box.value = ''; out.innerHTML = '';
      goToName(b.dataset.name);
    });
  }

  function goToName(name) {
    var f = S.byName[name];
    if (!f) return;
    setSel(f);
    var b = Thematic.bboxOf(f.geometry);
    if (b) app.fitBounds(Thematic.padBbox(b, 0.18), { withDetail: true, animate: true, maxZoom: 8 });
    app.collapseDrawer();
  }

  /* ── 选中 ── */
  function setSel(f) {
    var map = app.map;
    if (S.sel) {
      try { map.setFeatureState({ source: 'main', id: S.sel.properties.adcode }, { selected: false }); } catch (_) {}
    }
    S.sel = f || null;
    if (!f) {
      map.getSource('sel').setData(Thematic.EMPTY);
      app.setVisible('sel-halo', false); app.setVisible('sel-line', false);
      el.detail.hidden = true;
      app.setDetailOpen(false);
      markUnit('');
      try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {}
      return;
    }
    try { map.setFeatureState({ source: 'main', id: f.properties.adcode }, { selected: true }); } catch (_) {}
    map.getSource('sel').setData({ type: 'FeatureCollection', features: [plainFeature(f)] });
    app.setVisible('sel-line', true);
    app.pulse({ glowId: 'sel-halo', baseWidth: 7, maxExtra: 7, restOpacity: 0.3 });
    openCard(f);
    app.collapseDrawer();
    markUnit(String(f.properties.short));
    try { history.replaceState(null, '', '#u/' + encodeURIComponent(f.properties.short)); } catch (_) {}
  }

  function markUnit(name) {
    var list = el.unitList; if (!list) return;
    var old = list.querySelectorAll('.unit-row.active');
    for (var i = 0; i < old.length; i++) old[i].classList.remove('active');
    if (!name) return;
    var rows = list.querySelectorAll('.unit-row');
    for (var j = 0; j < rows.length; j++) {
      if (rows[j].dataset.name === name) {
        rows[j].classList.add('active');
        if (rows[j].scrollIntoView) rows[j].scrollIntoView({ block: 'nearest' });
        break;
      }
    }
  }

  /* ── 详情卡 ── */
  function openCard(f) {
    var p = f.properties;
    if (p.level === 'special') {
      el.dtLevel.textContent = '港澳台 · 不适用';
      el.dtName.textContent = p.short;
      el.dtSub.textContent = p.note || '';
      el.shareBox.innerHTML = '<div class="na-note">不属三大运营商大陆市场体系</div>';
      el.dtMeta.innerHTML = '';
      el.provNote.textContent = p.note || '';
      el.dtFooter.innerHTML = '<a href="/learn/south-telecom-north-unicom" target="_top">了解三大运营商的格局由来 ›</a>';
      el.detail.hidden = false; app.setDetailOpen(true);
      return;
    }

    el.dtLevel.textContent = p.region + ' · ' + CFG.LEAD_LABEL[p.lead];
    el.dtName.textContent = p.short;
    el.dtSub.textContent = (p.anchor ? '含公开硬锚点' : '省级估算') + ' · 三家份额合计 100%';

    el.shareBox.innerHTML = [
      { k: '移动', v: p.m, cls: 'cm' },
      { k: '电信', v: p.c, cls: 'ct' },
      { k: '联通', v: p.u, cls: 'cu' }
    ].map(function (o) {
      return '<div class="share-row ' + o.cls + '">' +
        '<span class="sk">' + o.k + '</span>' +
        '<span class="sb"><i style="width:' + Math.round(o.v / 70 * 100) + '%"></i></span>' +
        '<b>' + o.v + '<small>%</small></b></div>';
    }).join('') +
    '<div class="share-foot">省级为估算 · 全国口径：移 ' + NATION.cm + ' / 电 ' + NATION.ct + ' / 联 ' + NATION.cu + '%</div>';

    el.dtMeta.innerHTML =
      '<span><small>主要挑战者</small><b style="color:' + (COLORS[p.lead] || '#cbd5e1') + '">' +
        esc(CFG.LEAD_LABEL[p.lead]) + '</b></span>' +
      '<span><small>移动领先第二名</small><b>' + (p.m - Math.max(p.c, p.u)) + ' pt</b></span>';

    el.provNote.textContent = p.note || '';
    el.dtFooter.innerHTML = '<a href="/learn/south-telecom-north-unicom" target="_top">在「南电信、北联通是怎么来的」中看格局成因 ›</a>';
    el.detail.hidden = false;
    app.setDetailOpen(true);
  }

  /* ── 标注：缩放 > 5 时显示省名 ── */
  function updateLabels() {
    if (!S.labelsOn || app.map.getZoom() < 5) { app.setLabels([]); return; }
    var items = [];
    S.feats.forEach(function (f) {
      var p = f.properties;
      if (p.level !== 'prov') return;
      var c = p.center || (function () { var b = Thematic.bboxOf(f.geometry); return b ? [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2] : null; })();
      if (!c) return;
      items.push({ id: String(p.adcode), text: p.short, lng: c[0], lat: c[1], color: '#dbeafe' });
    });
    app.setLabels(items);
  }

  /* ── 交互 ── */
  function bind() {
    var map = app.map;
    map.on('mousemove', function (e) {
      var f = app.pick(e.point, ['tele-fill']);
      if (!f) { map.getCanvas().style.cursor = ''; app.tooltip(null); return; }
      map.getCanvas().style.cursor = 'pointer';
      var p = f.properties;
      if (p.level !== 'prov') {
        app.tooltip('<b>' + esc(p.short || p.name || '') + '</b><br><span style="color:#64748b">' + esc(p.note || '') + '</span>', e.point.x, e.point.y);
        return;
      }
      var lab = CFG.LEAD_LABEL[p.lead];
      app.tooltip('<b>' + esc(p.short) + '</b> <span style="color:#9fb4cd">' + esc(p.region) + '</span><br>' +
        '<span style="color:#d1d5db">移 ' + p.m + '% · 电 ' + p.c + '% · 联 ' + p.u + '%</span><br>' +
        '<span style="color:#64748b">' + esc(lab) + ' · 估算 · 点开看详情</span>', e.point.x, e.point.y);
    });
    map.on('mouseleave', function () { app.tooltip(null); });
    map.on('click', function (e) {
      var f = app.pick(e.point, ['tele-fill']);
      if (f) {
        setSel(f);
        var b = Thematic.bboxOf(f.geometry);
        if (b) app.fitBounds(Thematic.padBbox(b, 0.18), { withDetail: true, animate: true, maxZoom: 8 });
      } else setSel(null);
    });
    map.on('idle', updateLabels);
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') setSel(null); });

    el.unitList.addEventListener('click', function (e) {
      var b = e.target.closest('.unit-row');
      if (!b || !b.dataset.name) return;
      goToName(b.dataset.name);
    });
    var ckLabel = document.getElementById('ckLabel');
    if (ckLabel) ckLabel.addEventListener('change', function () { S.labelsOn = !!ckLabel.checked; updateLabels(); });
  }

  function bindPanel() {
    var gear = document.getElementById('panelGear');
    var panel = document.getElementById('panel');
    var close = document.getElementById('panelClose');
    if (gear && panel) gear.addEventListener('click', function () { panel.classList.remove('closed'); gear.hidden = true; });
    if (close && panel && gear) close.addEventListener('click', function () { panel.classList.add('closed'); gear.hidden = false; });
  }
})();
