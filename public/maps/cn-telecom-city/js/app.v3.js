/* 三大运营商市级分布图 · cn-telecom-city
   主视图：337 城按「谁是移动在该市的主要挑战者」着色（北方联通红 / 南方电信蓝 /
   移动独大绿 / 充分竞争灰）。单家视角：按该家市级估算份额 12–68% 连续色阶。
   点城市 → 右侧详情卡三家份额 + 城市能级与榜单标注；实时搜索 / 按省折叠目录 /
   #u/<城市名> 分享。

   数据（_g/build_cn_telecom_city.py 生成）：
     data/cities.geojson  339 要素（337 城市 + 香港 + 澳门；属性 m/c/u 估算份额）
     data/index.json      [adcode, 简称, 类型, 省份]

   口径声明：市级无官方逐市逐家用户份额，本图为省级估算表的二次推算，可信度低于省级；
   全国份额取 2025 年报实数。 */
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
  function allColorExpr() {
    var a = ['match', ['get', 'lead']];
    LEADS.forEach(function (g) { a.push(g.key, g.color); });
    a.push(COLORS.na);
    return a;
  }
  function rampColorExpr(key) {
    var stops = RAMPS[key], n = stops.length - 1, lo = 12, hi = 68, a = ['interpolate', ['linear'], ['get', key]];
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
    slug: 'cn-telecom-city',
    view: CFG.view, bounds: CFG.bounds, boundsMobile: CFG.boundsMobile, extent: CFG.extent,
    graticuleStep: CFG.graticuleStep,
    imgPaint: CFG.imgPaint,
    /* 保留引擎默认省界 prov-line；自己再压一条更亮的省界在最上层 */
    sources: {
      main: { data: 'data/cities.geojson', promoteId: 'adcode' },
      sel: { data: Thematic.EMPTY, promoteId: 'adcode' }
    },
    layers: [
      { id: 'tele-fill', type: 'fill', source: 'main',
        paint: { 'fill-color': colorExpr(), 'fill-opacity': opacityExpr() } },
      { id: 'tele-line', type: 'line', source: 'main',
        paint: { 'line-color': '#ffffff', 'line-width': 0.45, 'line-opacity': 0.3 } },
      { id: 'city-prov-line', type: 'line', source: 'prov',
        paint: { 'line-color': '#e2e8f0', 'line-width': 1.05, 'line-opacity': 0.52 } },
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
  /* 封面脚本统一用 window.__map 取 map 实例 */
  window.__map = app.map;

  function boot() {
    fetch('data/cities.geojson').then(function (r) { return r.json(); }).then(function (fc) {
      S.feats = fc.features || [];
      S.feats.forEach(function (f) {
        var p = f.properties;
        if (p.level === 'city' || p.level === 'special') S.byName[String(p.short)] = f;
      });

      el.fCm.textContent = NATION.cm.toFixed(1);
      /* 左栏三格较窄，短写为 24/20；完整口径在下方声明与详情卡中给出 */
      el.fOthers.textContent = NATION.ct.toFixed(0) + '/' + NATION.cu.toFixed(0);
      el.fProv.textContent = String(S.feats.filter(function (f) { return f.properties.level === 'city'; }).length);

      renderViews();
      renderGrpStrip();
      renderUnitList();
      bind();
      bindSearch();
      bindPanel();
      app.fitAll({ animate: false });
      updateLabels();
      window.__cnTelecomCityReady = true;

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
      console.error('[cn-telecom-city] 数据加载失败', err);
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

  /* ── 目录：按省折叠，组内按移动份额降序 ── */
  function renderUnitList() {
    var groups = {};
    S.feats.forEach(function (f) {
      var p = f.properties;
      if (p.level !== 'city') return;
      (groups[p.prov] || (groups[p.prov] = [])).push(f);
    });
    var provs = Object.keys(groups).sort(function (a, b) { return groups[b].length - groups[a].length; });
    var html = '';
    provs.forEach(function (prov) {
      var arr = groups[prov];
      arr.sort(function (a, b) { return b.properties.m - a.properties.m; });
      var lead = arr[0].properties.lead;
      html += '<button type="button" class="unit-prov" data-prov="' + esc(prov) + '">' +
        '<i class="dot" style="background:' + (COLORS[lead] || '#7c8eb0') + '"></i>' +
        esc(prov) + '<em>' + arr.length + ' 市 ›</em></button>';
      html += '<div class="unit-children" data-prov="' + esc(prov) + '">';
      arr.forEach(function (f) {
        var p = f.properties;
        html += '<button type="button" class="unit-row" data-name="' + esc(p.short) + '">' +
          '<span class="nm">' + esc(p.short) + (p.anchor ? '<i class="anchor-dot" title="地市百强榜上榜"></i>' : '') + '</span>' +
          '<span class="sh">移 ' + p.m + '</span>' +
          '<span class="sh">电 ' + p.c + '</span>' +
          '<span class="sh">联 ' + p.u + '</span>' +
          '</button>';
      });
      html += '</div>';
    });
    el.unitList.innerHTML = html;
  }

  function toggleProv(prov, force) {
    var box = el.unitList.querySelector('.unit-children[data-prov="' + prov + '"]');
    var head = el.unitList.querySelector('.unit-prov[data-prov="' + prov + '"]');
    if (!box || !head) return;
    var open = typeof force === 'boolean' ? force : !box.classList.contains('open');
    box.classList.toggle('open', open);
    head.classList.toggle('is-open', open);
  }

  /* ── 搜索：城市名 / 省名即时下拉 ── */
  function bindSearch() {
    var box = el.searchInput, out = el.searchResults, timer = 0;
    function run() {
      var q = box.value.trim();
      if (!q) { out.innerHTML = ''; return; }
      var hits = [];
      for (var i = 0; i < S.feats.length && hits.length < 12; i++) {
        var p = S.feats[i].properties;
        if (p.level !== 'city' && p.level !== 'special') continue;
        if (p.short.indexOf(q) !== -1 || p.name.indexOf(q) !== -1 ||
            (p.prov && p.prov.indexOf(q) !== -1)) hits.push(p);
      }
      hits.sort(function (a, b) {
        return (a.short === q ? 0 : 1) - (b.short === q ? 0 : 1);
      });
      out.innerHTML = hits.length
        ? hits.map(function (p) {
            var badge = p.prov.replace(/省$|市$|自治区$|特别行政区$/, '');
            return '<button type="button" class="sr-row" data-name="' + esc(p.short) + '">' +
              '<span class="nm">' + esc(p.short) + '</span>' +
              '<span class="lv">' + esc(badge) + '</span></button>';
          }).join('')
        : '<div class="sr-more">没有匹配 “' + esc(q) + '” 的城市</div>';
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
    if (b) app.fitBounds(Thematic.padBbox(b, 0.18), { withDetail: true, animate: true, maxZoom: 10 });
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
        var box = rows[j].closest('.unit-children');
        if (box && box.dataset.prov) toggleProv(box.dataset.prov, true);
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
      el.dtLevel.textContent = '特别行政区 · 不适用';
      el.dtName.textContent = p.short;
      el.dtSub.textContent = p.note || '';
      el.shareBox.innerHTML = '<div class="na-note">本地运营商体系，不计入三大运营商</div>';
      el.dtMeta.innerHTML = '';
      el.provNote.textContent = p.note || '';
      el.dtFooter.innerHTML = '<a href="/learn/city-telecom-share" target="_top">看市级数据的估算方法 ›</a>';
      el.detail.hidden = false; app.setDetailOpen(true);
      return;
    }

    el.dtLevel.textContent = p.prov + ' · ' + p.tierLabel;
    el.dtName.textContent = p.short;
    el.dtSub.textContent = (p.anchor ? '地市百强榜上榜 · ' : '') + '市级二次推算 · 三家份额合计 100%';

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
    '<div class="share-foot">市级为二次推算 · 全国口径：移 ' + NATION.cm + ' / 电 ' + NATION.ct + ' / 联 ' + NATION.cu + '%</div>';

    el.dtMeta.innerHTML =
      '<span><small>主要挑战者</small><b style="color:' + (COLORS[p.lead] || '#cbd5e1') + '">' +
        esc(CFG.LEAD_LABEL[p.lead]) + '</b></span>' +
      '<span><small>移动领先第二名</small><b>' + (p.m - Math.max(p.c, p.u)) + ' pt</b></span>';

    el.provNote.textContent = p.note || '';
    el.dtFooter.innerHTML = '<a href="/learn/city-telecom-share" target="_top">在「城市级份额怎么估」中看方法 ›</a>' +
      '<a href="/maps/cn-telecom/full" target="_top">看省级分布图 ›</a>';
    el.detail.hidden = false;
    app.setDetailOpen(true);
  }

  /* ── 标注：缩放阈值分级显示 ── */
  function updateLabels() {
    if (!S.labelsOn || app.map.getZoom() < 5.5) { app.setLabels([]); return; }
    var z = app.map.getZoom(), items = [];
    S.feats.forEach(function (f) {
      var p = f.properties;
      if (p.level !== 'city') return;
      /* 5.5–7 只显示直辖市/省会/计划单列/榜上城市；>7 显示全部 */
      if (z < 7 && p.tier === 'normal') return;
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
      if (p.level !== 'city') {
        app.tooltip('<b>' + esc(p.short || p.name || '') + '</b><br><span style="color:#64748b">' + esc(p.note || '') + '</span>', e.point.x, e.point.y);
        return;
      }
      app.tooltip('<b>' + esc(p.short) + '</b> <span style="color:#9fb4cd">' + esc(p.prov) + '</span><br>' +
        '<span style="color:#d1d5db">移 ' + p.m + '% · 电 ' + p.c + '% · 联 ' + p.u + '%</span><br>' +
        '<span style="color:#64748b">' + esc(p.tierLabel) + ' · ' + esc(CFG.LEAD_LABEL[p.lead]) + ' · 估算</span>', e.point.x, e.point.y);
    });
    map.on('mouseleave', function () { app.tooltip(null); });
    map.on('click', function (e) {
      var f = app.pick(e.point, ['tele-fill']);
      if (f) {
        setSel(f);
        var b = Thematic.bboxOf(f.geometry);
        if (b) app.fitBounds(Thematic.padBbox(b, 0.18), { withDetail: true, animate: true, maxZoom: 10 });
      } else setSel(null);
    });
    map.on('idle', updateLabels);
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') setSel(null); });

    el.unitList.addEventListener('click', function (e) {
      var head = e.target.closest('.unit-prov');
      if (head) { toggleProv(head.dataset.prov); return; }
      var b = e.target.closest('.unit-row');
      if (b && b.dataset.name) goToName(b.dataset.name);
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
