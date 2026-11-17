/* 全国邮政编码互动地图 · china-postal-codes
   点击任意县区 → 右侧完整 6 位邮编表；按邮编或地名即时搜索定位。
   参考 cn-adcode 新模板：实时搜索下拉 + 按省目录 + feature-state 选中退色描边
   + 大号代码复制 + 齿轮抽屉面板 + #u/代码 分享 + 放大名称标注。

   数据（_g/_build_china_postal_map.py 生成）：
     data/counties.geojson  县级边界（属性 adcode,name,prov,city,n,lead,prefix,p4,center,zips）
*/
(function () {
  'use strict';

  var CFG = window.CNPC_CONFIG;
  var fmt = Thematic.fmt, esc = Thematic.esc;
  var COLORS = CFG.COLORS, GROUPS = CFG.GROUPS;

  var el = {};
  ['fCounty', 'fZip', 'fGroup', 'searchInput', 'searchResults', 'unitList', 'listHint',
   'detail', 'dtLevel', 'dtName', 'dtSub', 'dtCode', 'dtCodeLabel', 'dtCopy', 'dtMeta',
   'dtChildrenLabel', 'zipList', 'dtFooter', 'introBarText'].forEach(function (id) {
    el[id] = document.getElementById(id);
  });

  var S = {
    feats: [],          // 全部县 feature
    byCode: {},         // adcode -> feature
    idx: [],            // [zip或code, name, kind, adcode] 搜索索引
    zipRows: {},        // adcode -> 该县邮编数组（缓存）
    sel: null,          // 当前选中 feature
    hi: null,           // 图例高亮的邮区
    labelsOn: true
  };

  function groupOf(lead) {
    for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].key === lead) return GROUPS[i];
    return GROUPS[GROUPS.length - 1];
  }
  function zipsOf(f) {
    var a = S.zipRows[f.properties.adcode];
    if (!a) {
      a = S.zipRows[f.properties.adcode] = (f.properties.zips ? String(f.properties.zips).split(',') : []);
    }
    return a;
  }
  /* queryRenderedFeatures 的包装要素不能直接 setData（worker 无法结构化克隆），拷成普通 Feature */
  function plainFeature(f) {
    var props = {};
    for (var k in f.properties) if (Object.prototype.hasOwnProperty.call(f.properties, k)) props[k] = f.properties[k];
    return { type: 'Feature', properties: props, geometry: f.geometry };
  }

  function colorExpr() {
    var a = ['match', ['get', 'lead']];
    GROUPS.forEach(function (g) { a.push(g.key, g.color); });
    a.push('#7c8eb0');
    return a;
  }
  /* 填色不透明度：选中县退到 0.12；其余按图例高亮状态调整 */
  function opacityExpr() {
    var base = S.hi
      ? ['case', ['==', ['get', 'lead'], S.hi], 0.9, 0.1]
      : 0.66;
    return ['case', ['boolean', ['feature-state', 'selected'], false], 0.12, base];
  }

  /* ── 启动 ── */
  var app = Thematic.create({
    slug: 'china-postal-codes',
    view: CFG.view, bounds: CFG.bounds, boundsMobile: CFG.boundsMobile, extent: CFG.extent,
    graticuleStep: CFG.graticuleStep,
    defaultBasemap: CFG.defaultBasemap,
    imgPaint: CFG.imgPaint,
    basemaps: CFG.basemaps,
    sources: {
      counties: { data: 'data/counties.geojson', promoteId: 'adcode' },
      sel: { data: Thematic.EMPTY, promoteId: 'adcode' }
    },
    layers: [
      { id: 'postal-fill', type: 'fill', source: 'counties',
        paint: { 'fill-color': colorExpr(), 'fill-opacity': opacityExpr() } },
      { id: 'county-line', type: 'line', source: 'counties',
        paint: { 'line-color': '#ffffff', 'line-width': 0.6, 'line-opacity': 0.32 } },
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

  function boot() {
    fetch('data/counties.geojson').then(function (r) { return r.json(); }).then(function (gj) {
      S.feats = gj.features || [];
      buildIndex();
      el.fCounty.textContent = fmt(CFG.WITH_DATA, 0);
      el.fZip.textContent = fmt(CFG.TOTAL_ZIPS, 0);
      el.fGroup.textContent = String(GROUPS.length - 1);
      renderUnitList();
      renderLegend();
      bind();
      bindSearch();
      bindPanel();
      app.fitAll({ animate: false });
      updateLabels();
      window.__chinaPostalReady = true;
      var m = location.hash.match(/^#u\/(\d{6})$/);
      if (m) goToCode(m[1]);
      window.addEventListener('hashchange', function () {
        var h = location.hash.match(/^#u\/(\d{6})$/);
        if (h) {
          if (String(S.sel ? S.sel.properties.adcode : '') !== h[1]) goToCode(h[1]);
          return;
        }
        if (S.sel || !el.detail.hidden) { setSel(null); app.fitAll({ animate: true }); }
      });
    }).catch(function (err) {
      console.error('[china-postal-codes] 数据加载失败', err);
      el.unitList.innerHTML = '<div class="sr-more">数据加载失败，请刷新重试。</div>';
    });
  }

  /* 搜索索引：中心邮编 + 每个邮编（zip 反查）+ adcode + 名称。kind 决定显示徽标 */
  function buildIndex() {
    S.feats.forEach(function (f) {
      var p = f.properties;
      S.byCode[String(p.adcode)] = f;
    });
    S.feats.forEach(function (f) {
      var p = f.properties, code = String(p.adcode);
      S.idx.push([p.center || '', p.name, 'zip', code]);       // 中心邮编
      S.idx.push([code, p.name, 'code', code]);                 // adcode
      zipsOf(f).forEach(function (z) { S.idx.push([z, p.name, 'zip', code]); });
    });
  }

  /* ── 目录：按省分组平铺县区 ── */
  function renderUnitList() {
    var groups = {};
    S.feats.forEach(function (f) {
      var p = f.properties;
      (groups[p.prov] || (groups[p.prov] = [])).push(f);
    });
    var provNames = Object.keys(groups).sort(function (a, b) {
      return groups[b].length - groups[a].length;
    });
    var html = '';
    provNames.forEach(function (pn) {
      var arr = groups[pn];
      html += '<button type="button" class="unit-prov" data-code="' + esc(pn) + '">' +
        esc(pn) + '<i>' + arr.length + ' 个县区 ›</i></button>';
      arr.forEach(function (f) {
        var p = f.properties, g = groupOf(p.lead);
        html += '<button type="button" class="unit-row" data-code="' + p.adcode + '">' +
          '<span class="code">' + (p.center || '——————') + '</span>' +
          '<span class="nm">' + esc(p.name) + '</span>' +
          '<span class="cnt">' + (p.n ? p.n + ' 个 · ' + esc(g.name) : '无数据') + '</span>' +
          '</button>';
      });
    });
    el.unitList.innerHTML = html;
  }

  /* ── 搜索：输入即时下拉，点选定位 ── */
  function bindSearch() {
    var box = el.searchInput, out = el.searchResults, timer = 0;
    function run() {
      var q = box.value.trim();
      if (!q) { out.innerHTML = ''; return; }
      var isNum = /^\d+$/.test(q), seen = {}, hits = [];
      for (var i = 0; i < S.idx.length && hits.length < 12; i++) {
        var r = S.idx[i];
        var ok = isNum ? r[0].indexOf(q) === 0 : (r[1].indexOf(q) !== -1);
        if (!ok) continue;
        var dk = r[3] + '|' + r[2];   // 同县同类去重
        if (seen[dk]) continue;
        seen[dk] = 1;
        hits.push(r);
      }
      hits.sort(function (a, b) {
        return (a[0] === q ? 0 : 1) - (b[0] === q ? 0 : 1) ||
               (a[1] === q ? 0 : 1) - (b[1] === q ? 0 : 1);
      });
      var html = hits.map(function (r) {
        var badge = r[2] === 'zip' ? '邮编' : '代码';
        return '<button type="button" class="sr-row" data-code="' + r[3] + '">' +
          '<span class="code">' + r[0] + '</span>' +
          '<span class="nm">' + esc(r[1]) + '</span>' +
          '<span class="lv">' + badge + '</span></button>';
      }).join('');
      if (!hits.length) html = '<div class="sr-more">没有匹配 “' + esc(q) + '” 的邮编或地名</div>';
      out.innerHTML = html;
    }
    box.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 120); });
    out.addEventListener('click', function (e) {
      var b = e.target.closest('.sr-row'); if (!b) return;
      box.value = ''; out.innerHTML = '';
      goToCode(b.dataset.code);
    });
  }

  function goToCode(code) {
    var f = S.byCode[code];
    if (f) { setSel(f); var b = Thematic.bboxOf(f.geometry); if (b) app.fitBounds(Thematic.padBbox(b, 0.22), { withDetail: true, animate: true, maxZoom: 9 }); app.collapseDrawer(); return; }
    /* 若输的是 4 位前缀，跳到第一个匹配县 */
    if (/^\d{4}$/.test(code)) {
      for (var i = 0; i < S.feats.length; i++) {
        if (String(S.feats[i].properties.prefix) === code || String(S.feats[i].properties.center || '').indexOf(code) === 0) {
          goToCode(String(S.feats[i].properties.adcode)); return;
        }
      }
    }
  }

  /* ── 选中 ── */
  function setSel(f) {
    var map = app.map;
    if (S.sel) { try { map.setFeatureState({ source: 'counties', id: S.sel.properties.adcode }, { selected: false }); } catch (_) {} }
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
    try { map.setFeatureState({ source: 'counties', id: f.properties.adcode }, { selected: true }); } catch (_) {}
    map.getSource('sel').setData({ type: 'FeatureCollection', features: [plainFeature(f)] });
    app.setVisible('sel-line', true);
    app.pulse({ glowId: 'sel-halo', baseWidth: 7, maxExtra: 7, restOpacity: 0.3 });
    openCard(f);
    app.collapseDrawer();
    markUnit(String(f.properties.adcode));
    try { history.replaceState(null, '', '#u/' + f.properties.adcode); } catch (_) {}
  }

  function markUnit(code) {
    var list = el.unitList; if (!list) return;
    var old = list.querySelectorAll('.unit-row.active');
    for (var i = 0; i < old.length; i++) old[i].classList.remove('active');
    if (!code) return;
    var rows = list.querySelectorAll('.unit-row');
    for (var j = 0; j < rows.length; j++) {
      if (rows[j].dataset.code === String(code)) { rows[j].classList.add('active'); if (rows[j].scrollIntoView) rows[j].scrollIntoView({ block: 'nearest' }); break; }
    }
  }

  /* ── 详情卡 ── */
  function openCard(f) {
    var p = f.properties, g = groupOf(p.lead), zips = zipsOf(f);
    el.dtLevel.textContent = '县级 · ' + (p.lead ? '邮区 ' + p.lead : '无邮编');
    el.dtName.textContent = p.name;
    el.dtSub.textContent = (p.prov || '') + (p.city && p.city !== p.name ? ' · ' + p.city : '');
    el.dtCode.textContent = p.center || '——————';
    el.dtCodeLabel.textContent = zips.length ? '代表邮编（县区中心局 · 点击复制）' : '暂无大陆邮编';
    el.dtMeta.innerHTML =
      '<span><small>所属邮区</small><b style="color:' + (COLORS[p.lead] || '#cbd5e1') + '">' + esc(g.name) + (p.lead ? '（' + p.lead + ' 开头）' : '') + '</b></span>' +
      '<span><small>邮编数</small><b>' + (p.n ? fmt(p.n, 0) + ' 个' : '—') + '</b></span>' +
      '<span><small>主前缀 / 段数</small><b>' + (p.prefix ? p.prefix + 'xx · ' + p.p4 + ' 段' : '—') + '</b></span>';
    el.dtChildrenLabel.textContent = '该县区全部邮政编码（' + zips.length + ' 个，点击复制）';
    el.zipList.innerHTML = zips.length
      ? zips.map(function (z) { return '<button type="button" class="zip-row" data-zip="' + z + '">' + z + '</button>'; }).join('')
      : '<div class="sr-more">港澳台 / 新设或撤销区划无大陆邮编数据，详见速查页口径。</div>';
    el.dtFooter.innerHTML = '<a href="/learn/china-postal-codes" target="_top">在「全国邮政编码速查页」中查看完整表格 ›</a>';
    el.detail.hidden = false;
    app.setDetailOpen(true);
  }

  /* 图例（右下角）：点邮区高亮 */
  function renderLegend() {
    var dock = document.querySelector('.dock');
    if (!dock) {
      dock = document.createElement('div'); dock.className = 'dock';
      var lg = document.createElement('div'); lg.className = 'legend'; lg.id = 'legend';
      dock.appendChild(lg); document.body.appendChild(dock);
    }
    var legend = document.getElementById('legend'); if (!legend) return;
    var rows = GROUPS.map(function (g) {
      return '<span class="lg-row" data-key="' + g.key + '" title="' + esc(g.regions) + '"><i style="background:' + g.color + '"></i><b>' + esc(g.name) + '</b><em>' + (g.key === '无' ? '灰' : g.key) + '</em></span>';
    }).join('');
    legend.innerHTML = '<div class="lg-cap">邮政编码 · 九大邮区（首位数字）</div>' + rows +
      '<div class="lg-note">颜色 = 该县邮编首位数字的众数。点图例高亮某一邮区；精确归属请点县或用搜索。</div>';
    Array.prototype.forEach.call(legend.querySelectorAll('.lg-row'), function (row) {
      row.addEventListener('click', function () {
        var k = row.getAttribute('data-key');
        S.hi = (S.hi === k) ? null : k;
        if (app.map.getLayer('postal-fill')) app.map.setPaintProperty('postal-fill', 'fill-opacity', opacityExpr());
        Array.prototype.forEach.call(legend.querySelectorAll('.lg-row'), function (r) {
          r.classList.toggle('is-on', S.hi && r.getAttribute('data-key') === S.hi);
        });
      });
    });
  }

  /* ── 标注：缩放 >5 时显示县名 ── */
  function updateLabels() {
    if (!S.labelsOn || app.map.getZoom() < 5) { app.setLabels([]); return; }
    var items = [];
    S.feats.forEach(function (f) {
      var p = f.properties;
      if (!p.n) return;
      var b = Thematic.bboxOf(f.geometry);
      if (!b) return;
      items.push({ id: String(p.adcode), text: p.name, lng: (b[0] + b[2]) / 2, lat: (b[1] + b[3]) / 2, color: '#dbeafe' });
    });
    app.setLabels(items.slice(0, 400));
  }

  /* ── 交互 ── */
  function bind() {
    var map = app.map;
    map.on('mousemove', function (e) {
      var f = app.pick(e.point, ['postal-fill']);
      if (!f) { map.getCanvas().style.cursor = ''; app.tooltip(null); return; }
      map.getCanvas().style.cursor = 'pointer';
      var p = f.properties, g = groupOf(p.lead);
      app.tooltip('<b>' + esc(p.name) + '</b> <span style="color:#9fb4cd">' + esc(p.prov || '') + '</span><br>' +
        '<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + (COLORS[p.lead] || '#7c8eb0') + ';margin-right:5px"></span>' +
        (p.lead ? esc(g.name) + ' · ' + p.n + ' 个邮编 · 代表 ' + (p.center || '') : '无大陆邮编') +
        '<br><span style="color:#64748b">点开看完整邮编表</span>', e.point.x, e.point.y);
    });
    map.on('mouseleave', function () { app.tooltip(null); });
    map.on('click', function (e) {
      var f = app.pick(e.point, ['postal-fill']);
      if (f) { setSel(f); var b = Thematic.bboxOf(f.geometry); if (b) app.fitBounds(Thematic.padBbox(b, 0.22), { withDetail: true, animate: true, maxZoom: 9 }); }
      else { setSel(null); }
    });
    map.on('idle', updateLabels);
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') setSel(null); });

    el.unitList.addEventListener('click', function (e) {
      var b = e.target.closest('.unit-row'); if (!b || !b.dataset.code) return;
      goToCode(b.dataset.code);
    });
    el.dtSub.addEventListener('click', function () { /* 预留：省名跳转 */ });

    /* 复制：clipboard 被拒则退回 execCommand */
    function copyText(text, btn, okMsg) {
      var flash = function (t) { var old = btn.textContent; btn.textContent = t; setTimeout(function () { btn.textContent = old; }, 1200); };
      var legacy = function () {
        var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select();
        var ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta); flash(ok ? okMsg : '请手动复制');
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { flash(okMsg); }, legacy);
      else legacy();
    }
    el.dtCopy.addEventListener('click', function () { copyText(el.dtCode.textContent, el.dtCopy, '已复制'); });
    el.zipList.addEventListener('click', function (e) {
      var b = e.target.closest('.zip-row'); if (!b) return;
      copyText(b.dataset.zip, b, '✓');
    });

    var wasMobile = window.innerWidth <= 900;
    window.addEventListener('resize', function () {
      var nowMobile = window.innerWidth <= 900;
      if (nowMobile && !wasMobile && !el.detail.hidden) app.collapseDrawer();
      wasMobile = nowMobile;
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
