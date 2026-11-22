/* 三大运营商县级分布图 · cn-telecom-county
   主视图：2852 县按「谁是移动在该县的主要挑战者」着色（北方联通红 / 南方电信蓝 /
   移动独大绿 / 充分竞争灰）。单家视角：按该家县级估算份额 12–68% 连续色阶。
   点县 → 右侧详情卡三家份额 + 城乡层级与推算链；实时搜索 / 省→市→县三级折叠目录 /
   #c/<adcode> 分享。

   数据（_g/build_cn_telecom_county.py 生成）：
     data/counties.geojson  2891 要素（2852 县 + 港澳台；属性 m/c/u 三次推算份额）
     data/index.json        [adcode, 名称, 类型, 省, 父级]

   口径声明：县级无官方逐县逐家用户份额，本图为省级→市级→县级的三次推算，
   可信度低于市级与省级；全国份额取 2025 年报实数。
   注意：30 组县名重名（朝阳区、鼓楼区等），一律用 adcode 定位，不用名称。 */
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
    feats: [], idx: [], byCode: {},
    sel: null, hi: null, mode: 'all', labelsOn: true
  };

  function plainFeature(f) {
    var props = {};
    for (var k in f.properties) if (Object.prototype.hasOwnProperty.call(f.properties, k)) props[k] = f.properties[k];
    return { type: 'Feature', properties: props, geometry: f.geometry };
  }
  function codeOf(f) { return String(f.properties.adcode); }

  /* ── 着色表达式 ── */
  function allColorExpr() {
    var a = ['match', ['get', 'lead']];
    LEADS.forEach(function (g) { a.push(g.key, g.color); });
    a.push(COLORS.na);
    return a;
  }
  /* VIEWS key 为 cm/ct/cu，数据字段是 m/c/u，必须映射，否则取到 null 不显色。
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
      : 0.62;
    return ['case', ['boolean', ['feature-state', 'selected'], false], 0.1, base];
  }

  /* ── 启动 ── */
  var app = Thematic.create({
    slug: 'cn-telecom-county',
    view: CFG.view, bounds: CFG.bounds, boundsMobile: CFG.boundsMobile, extent: CFG.extent,
    graticuleStep: CFG.graticuleStep,
    imgPaint: CFG.imgPaint,
    sources: {
      main: { data: 'data/counties.geojson', promoteId: 'adcode' },
      sel: { data: Thematic.EMPTY, promoteId: 'adcode' }
    },
    layers: [
      { id: 'tele-fill', type: 'fill', source: 'main',
        paint: { 'fill-color': colorExpr(), 'fill-opacity': opacityExpr() } },
      { id: 'tele-line', type: 'line', source: 'main',
        paint: { 'line-color': '#ffffff', 'line-width': 0.25, 'line-opacity': 0.22 } },
      { id: 'county-prov-line', type: 'line', source: 'prov',
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
    fetch('data/counties.geojson').then(function (r) { return r.json(); }).then(function (fc) {
      S.feats = fc.features || [];
      S.feats.forEach(function (f) {
        var p = f.properties;
        if (p.level === 'county' || p.level === 'special') S.byCode[codeOf(f)] = f;
      });

      el.fCm.textContent = NATION.cm.toFixed(1);
      /* 左栏三格窄，短写为 23/22；完整口径在下方声明与详情卡中给出 */
      el.fOthers.textContent = Math.round(NATION.ct) + '/' + Math.round(NATION.cu);
      el.fProv.textContent = String(S.feats.filter(function (f) { return f.properties.level === 'county'; }).length);

      renderViews();
      renderGrpStrip();
      renderUnitList();
      bind();
      bindSearch();
      bindPanel();
      app.fitAll({ animate: false });
      updateLabels();
      window.__cnTelecomCountyReady = true;

      var m = location.hash.match(/^#c\/(\d+)$/);
      if (m) goToCode(m[1]);
      window.addEventListener('hashchange', function () {
        var h = location.hash.match(/^#c\/(\d+)$/);
        if (h) {
          if (!S.sel || codeOf(S.sel) !== h[1]) goToCode(h[1]);
          return;
        }
        if (S.sel || !el.detail.hidden) { setSel(null); app.fitAll({ animate: true }); }
      });
    }).catch(function (err) {
      console.error('[cn-telecom-county] 数据加载失败', err);
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

  /* ── 目录：省 → 地级市 → 县，三级折叠，组内按移动份额降序 ── */
  function renderUnitList() {
    var groups = {};
    S.feats.forEach(function (f) {
      var p = f.properties;
      if (p.level !== 'county') return;
      var city = p.city && p.city !== '—' ? p.city : (p.parent || '省直辖');
      (groups[p.prov] || (groups[p.prov] = {}));
      (groups[p.prov][city] || (groups[p.prov][city] = [])).push(f);
    });
    var provs = Object.keys(groups).sort(function (a, b) {
      var na = 0, nb = 0;
      Object.keys(groups[a]).forEach(function (k) { na += groups[a][k].length; });
      Object.keys(groups[b]).forEach(function (k) { nb += groups[b][k].length; });
      return nb - na;
    });
    var html = '';
    provs.forEach(function (prov) {
      var cities = Object.keys(groups[prov]).sort(function (a, b) { return groups[prov][b].length - groups[prov][a].length; });
      var total = 0;
      cities.forEach(function (k) { total += groups[prov][k].length; });
      html += '<button type="button" class="unit-prov" data-prov="' + esc(prov) + '">' +
        esc(prov) + '<em>' + total + ' 县 ›</em></button>';
      html += '<div class="unit-children" data-prov="' + esc(prov) + '">';
      cities.forEach(function (city) {
        var arr = groups[prov][city];
        arr.sort(function (a, b) { return b.properties.m - a.properties.m; });
        html += '<button type="button" class="unit-city" data-prov="' + esc(prov) + '" data-city="' + esc(city) + '">' +
          esc(city) + '<em>' + arr.length + ' ›</em></button>';
        html += '<div class="unit-grandchildren" data-prov="' + esc(prov) + '" data-city="' + esc(city) + '">';
        arr.forEach(function (f) {
          var p = f.properties;
          html += '<button type="button" class="unit-row" data-code="' + codeOf(f) + '">' +
            '<span class="nm">' + esc(p.short) + '</span>' +
            '<span class="sh">移 ' + p.m + '</span>' +
            '<span class="sh">电 ' + p.c + '</span>' +
            '<span class="sh">联 ' + p.u + '</span>' +
            '</button>';
        });
        html += '</div>';
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
    if (!open) {
      Array.prototype.forEach.call(box.querySelectorAll('.unit-grandchildren.open'), function (g) { g.classList.remove('open'); });
      Array.prototype.forEach.call(box.querySelectorAll('.unit-city.is-open'), function (c) { c.classList.remove('is-open'); });
    }
  }
  function toggleCity(prov, city, force) {
    var box = el.unitList.querySelector('.unit-grandchildren[data-prov="' + prov + '"][data-city="' + city + '"]');
    var head = el.unitList.querySelector('.unit-city[data-prov="' + prov + '"][data-city="' + city + '"]');
    if (!box || !head) return;
    var open = typeof force === 'boolean' ? force : !box.classList.contains('open');
    box.classList.toggle('open', open);
    head.classList.toggle('is-open', open);
  }

  /* ── 搜索：县名 / 地级市 / 省名即时下拉 ── */
  function bindSearch() {
    var box = el.searchInput, out = el.searchResults, timer = 0;
    function run() {
      var q = box.value.trim();
      if (!q) { out.innerHTML = ''; return; }
      var hits = [];
      for (var i = 0; i < S.feats.length && hits.length < 14; i++) {
        var p = S.feats[i].properties;
        if (p.level !== 'county' && p.level !== 'special') continue;
        if (p.short.indexOf(q) !== -1 || p.prov.indexOf(q) !== -1 ||
            (p.city && p.city.indexOf(q) !== -1)) hits.push(p);
      }
      hits.sort(function (a, b) {
        return (a.short === q ? 0 : 1) - (b.short === q ? 0 : 1);
      });
      out.innerHTML = hits.length
        ? hits.map(function (p) {
            var city = p.city && p.city !== '—' ? p.city : (p.parent || '');
            var badge = (city ? city + ' · ' : '') + p.prov.replace(/省$|市$|自治区$|特别行政区$/, '');
            return '<button type="button" class="sr-row" data-code="' + p.adcode + '">' +
              '<span class="nm">' + esc(p.short) + '</span>' +
              '<span class="lv">' + esc(badge) + '</span></button>';
          }).join('')
        : '<div class="sr-more">没有匹配 “' + esc(q) + '” 的县</div>';
    }
    box.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 120); });
    out.addEventListener('click', function (e) {
      var b = e.target.closest('.sr-row'); if (!b) return;
      box.value = ''; out.innerHTML = '';
      goToCode(b.dataset.code);
    });
  }

  function goToCode(code) {
    var f = S.byCode[String(code)];
    if (!f) return;
    setSel(f);
    var b = Thematic.bboxOf(f.geometry);
    if (b) app.fitBounds(Thematic.padBbox(b, 0.18), { withDetail: true, animate: true, maxZoom: 13 });
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
    markUnit(codeOf(f));
    try { history.replaceState(null, '', '#c/' + codeOf(f)); } catch (_) {}
  }

  function markUnit(code) {
    var list = el.unitList; if (!list) return;
    var old = list.querySelectorAll('.unit-row.active');
    for (var i = 0; i < old.length; i++) old[i].classList.remove('active');
    if (!code) return;
    var rows = list.querySelectorAll('.unit-row[data-code="' + code + '"]');
    if (!rows.length) return;
    var row = rows[0], gc = row.closest('.unit-grandchildren');
    if (gc) {
      toggleProv(gc.dataset.prov, true);
      toggleCity(gc.dataset.prov, gc.dataset.city, true);
    }
    row.classList.add('active');
    if (row.scrollIntoView) row.scrollIntoView({ block: 'nearest' });
  }

  /* ── 详情卡 ── */
  function openCard(f) {
    var p = f.properties;
    if (p.level === 'special') {
      el.dtLevel.textContent = '港澳台 · 不适用';
      el.dtName.textContent = p.short;
      el.dtSub.textContent = p.note || '';
      el.shareBox.innerHTML = '<div class="na-note">本地运营商体系，不计入三大运营商</div>';
      el.dtMeta.innerHTML = '';
      el.provNote.textContent = p.note || '';
      el.dtFooter.innerHTML = '<a href="/learn/county-telecom-share" target="_top">看县级数据的估算方法 ›</a>';
      el.detail.hidden = false; app.setDetailOpen(true);
      return;
    }

    el.dtLevel.textContent = p.prov + ' · ' + (p.city && p.city !== '—' ? p.city + ' · ' : '') + p.tierLabel;
    el.dtName.textContent = p.short;
    el.dtSub.textContent = '三次推算（' + p.baseLevel + '基准） · 三家份额合计 100%';

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
    '<div class="share-foot">县级为三次推算 · 全国口径：移 ' + NATION.cm + ' / 电 ' + NATION.ct + ' / 联 ' + NATION.cu + '%</div>';

    el.dtMeta.innerHTML =
      '<span><small>主要挑战者</small><b style="color:' + (COLORS[p.lead] || '#cbd5e1') + '">' +
        esc(CFG.LEAD_LABEL[p.lead]) + '</b></span>' +
      '<span><small>移动领先第二名</small><b>' + (p.m - Math.max(p.c, p.u)) + ' pt</b></span>';

    el.provNote.textContent = p.note || '';
    el.dtFooter.innerHTML = '<a href="/learn/county-telecom-share" target="_top">在「县级份额怎么估」中看方法 ›</a>' +
      '<a href="/maps/cn-telecom-city/full" target="_top">看市级分布图 ›</a>';
    el.detail.hidden = false;
    app.setDetailOpen(true);
  }

  /* ── 标注：分级限流，避免 2852 个 DOM 标签拖慢浏览器 ── */
  function updateLabels() {
    if (!S.labelsOn || app.map.getZoom() < 9) { app.setLabels([]); return; }
    var z = app.map.getZoom(), items = [];
    S.feats.forEach(function (f) {
      var p = f.properties;
      if (p.level !== 'county') return;
      if (z < 11 && p.tier !== 'county_city' && p.tier !== 'other') return;
      var c = p.center;
      if (!c) return;
      items.push({ id: codeOf(f), text: p.short, lng: c[0], lat: c[1], color: '#dbeafe' });
    });
    if (items.length > 900) items = items.slice(0, 900);
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
      if (p.level !== 'county') {
        app.tooltip('<b>' + esc(p.short || p.name || '') + '</b><br><span style="color:#64748b">' + esc(p.note || '') + '</span>', e.point.x, e.point.y);
        return;
      }
      app.tooltip('<b>' + esc(p.short) + '</b> <span style="color:#9fb4cd">' + esc(p.prov) + '</span><br>' +
        '<span style="color:#d1d5db">移 ' + p.m + '% · 电 ' + p.c + '% · 联 ' + p.u + '%</span><br>' +
        '<span style="color:#64748b">' + esc(p.tierLabel) + ' · ' + esc(CFG.LEAD_LABEL[p.lead]) + ' · 三次推算估算</span>', e.point.x, e.point.y);
    });
    map.on('mouseleave', function () { app.tooltip(null); });
    map.on('click', function (e) {
      var f = app.pick(e.point, ['tele-fill']);
      if (f) {
        setSel(f);
        var b = Thematic.bboxOf(f.geometry);
        if (b) app.fitBounds(Thematic.padBbox(b, 0.18), { withDetail: true, animate: true, maxZoom: 13 });
      } else setSel(null);
    });
    map.on('idle', updateLabels);
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') setSel(null); });

    el.unitList.addEventListener('click', function (e) {
      var head = e.target.closest('.unit-prov');
      if (head) { toggleProv(head.dataset.prov); return; }
      var city = e.target.closest('.unit-city');
      if (city) { toggleCity(city.dataset.prov, city.dataset.city); return; }
      var b = e.target.closest('.unit-row');
      if (b && b.dataset.code) goToCode(b.dataset.code);
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
