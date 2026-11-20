/* 全国电话区号互动地图 · china-telephone-codes
   点击任意地级市 → 右侧显示它的长途区号、共用城市与旧区号并网改拨；
   按区号或城市名即时搜索定位（旧区号也能反查）。

   套用 cn-adcode / china-postal-codes 新模板：实时搜索下拉 + 按省目录 +
   feature-state 选中退色描边 + 大号代码复制 + 齿轮抽屉 + #u/单元代码 分享。

   数据（_g/_build_china_telephone_map.py 生成）：
     data/prefectures.geojson  450 个单元（属性 adcode,name,prov,level,code,grp,cities,note,old,alts,inferred）
     data/index.json           [主键, 名称, 类型, adcode]，类型 code / old / name
*/
(function () {
  'use strict';

  var CFG = window.CTEL_CONFIG;
  var fmt = Thematic.fmt, esc = Thematic.esc;
  var COLORS = CFG.COLORS, GROUPS = CFG.GROUPS;

  var el = {};
  ['fCode', 'fUnit', 'fGrp', 'grpStrip', 'searchInput', 'searchResults', 'unitList', 'listHint',
   'detail', 'dtLevel', 'dtName', 'dtSub', 'dtCode', 'dtCopy', 'dtMeta',
   'dtChildrenLabel', 'oldList', 'dtFooter', 'introBarText'].forEach(function (id) {
    el[id] = document.getElementById(id);
  });

  var S = {
    feats: [],
    byCode: {},
    idx: [],
    sel: null,
    hi: null,
    labelsOn: true
  };

  function groupOf(grp) {
    for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].key === grp) return GROUPS[i];
    return GROUPS[GROUPS.length - 1];
  }
  /* queryRenderedFeatures 返回 MapLibre 包装要素，直接 setData 会被 worker 拒绝 */
  function plainFeature(f) {
    var props = {};
    for (var k in f.properties) if (Object.prototype.hasOwnProperty.call(f.properties, k)) props[k] = f.properties[k];
    return { type: 'Feature', properties: props, geometry: f.geometry };
  }

  function colorExpr() {
    var a = ['match', ['get', 'grp']];
    GROUPS.forEach(function (g) { a.push(g.key, g.color); });
    a.push('#7c8eb0');
    return a;
  }
  /* 选中单元退到 0.12；分组高亮时其余压到 0.1 */
  function opacityExpr() {
    var base = S.hi
      ? ['case', ['==', ['get', 'grp'], S.hi], 0.9, 0.1]
      : 0.66;
    return ['case', ['boolean', ['feature-state', 'selected'], false], 0.12, base];
  }

  /* ── 启动 ── */
  var app = Thematic.create({
    slug: 'china-telephone-codes',
    view: CFG.view, bounds: CFG.bounds, boundsMobile: CFG.boundsMobile, extent: CFG.extent,
    graticuleStep: CFG.graticuleStep,
    imgPaint: CFG.imgPaint,
    sources: {
      main: { data: 'data/prefectures.geojson', promoteId: 'adcode' },
      sel: { data: Thematic.EMPTY, promoteId: 'adcode' }
    },
    layers: [
      { id: 'tele-fill', type: 'fill', source: 'main',
        paint: { 'fill-color': colorExpr(), 'fill-opacity': opacityExpr() } },
      { id: 'tele-line', type: 'line', source: 'main',
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
    Promise.all([
      fetch('data/prefectures.geojson').then(function (r) { return r.json(); }),
      fetch('data/index.json').then(function (r) { return r.json(); })
    ]).then(function (rs) {
      S.feats = rs[0].features || [];
      S.idx = rs[1] || [];
      S.feats.forEach(function (f) { S.byCode[String(f.properties.adcode)] = f; });

      el.fCode.textContent = fmt(CFG.TOTAL_CODES, 0);
      el.fUnit.textContent = fmt(CFG.TOTAL_UNITS, 0);
      el.fGrp.textContent = String(GROUPS.length - 1);

      renderGrpStrip();
      renderUnitList();
      bind();
      bindSearch();
      bindPanel();
      app.fitAll({ animate: false });
      updateLabels();
      window.__chinaTelephoneReady = true;

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
      console.error('[china-telephone-codes] 数据加载失败', err);
      el.unitList.innerHTML = '<div class="sr-more">数据加载失败，请刷新重试。</div>';
    });
  }

  /* ── 左栏分组色带：点色块只高亮该组 ── */
  function renderGrpStrip() {
    el.grpStrip.innerHTML = GROUPS.map(function (g) {
      return '<button type="button" class="gp-btn" data-key="' + g.key + '" title="' + esc(g.desc) + '">' +
        '<i style="background:' + g.color + '"></i>' + esc(g.name) + '<em>' + g.key + '</em></button>';
    }).join('');
    el.grpStrip.addEventListener('click', function (e) {
      var b = e.target.closest('.gp-btn'); if (!b) return;
      var k = b.getAttribute('data-key');
      S.hi = (S.hi === k) ? null : k;
      if (app.map.getLayer('tele-fill')) app.map.setPaintProperty('tele-fill', 'fill-opacity', opacityExpr());
      Array.prototype.forEach.call(el.grpStrip.querySelectorAll('.gp-btn'), function (x) {
        x.classList.toggle('is-on', S.hi && x.getAttribute('data-key') === S.hi);
      });
    });
  }

  /* ── 目录：按省分组，省名按单元数倒序 ── */
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
        esc(pn) + '<i>' + arr.length + ' 个单元 ›</i></button>';
      arr.sort(function (a, b) { return String(a.properties.code).localeCompare(String(b.properties.code)); });
      arr.forEach(function (f) {
        var p = f.properties;
        var tag = p.code ? groupOf(p.grp).name : '无区号';
        if (p.cities && p.cities.indexOf('、') > -1) tag = '共用 · ' + tag;
        html += '<button type="button" class="unit-row" data-code="' + p.adcode + '">' +
          '<span class="code">' + (p.code || '———') + '</span>' +
          '<span class="nm">' + esc(p.name) + '</span>' +
          '<span class="cnt">' + esc(tag) + '</span>' +
          '</button>';
      });
    });
    el.unitList.innerHTML = html;
  }

  /* ── 搜索：区号 / 旧区号 / 地名即时下拉 ── */
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
        var dk = r[3] + '|' + r[2];
        if (seen[dk]) continue;
        seen[dk] = 1;
        hits.push(r);
      }
      hits.sort(function (a, b) {
        return (a[0] === q ? 0 : 1) - (b[0] === q ? 0 : 1) ||
               (a[1] === q ? 0 : 1) - (b[1] === q ? 0 : 1);
      });
      var html = hits.map(function (r) {
        var badge = r[2] === 'code' ? '区号' : (r[2] === 'old' ? '旧区号' : '城市');
        return '<button type="button" class="sr-row" data-code="' + r[3] + '">' +
          '<span class="code">' + r[0] + '</span>' +
          '<span class="nm">' + esc(r[1]) + '</span>' +
          '<span class="lv">' + badge + '</span></button>';
      }).join('');
      if (!hits.length) html = '<div class="sr-more">没有匹配 “' + esc(q) + '” 的区号或城市</div>';
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
    if (!f) return;
    setSel(f);
    var b = Thematic.bboxOf(f.geometry);
    if (b) app.fitBounds(Thematic.padBbox(b, 0.22), { withDetail: true, animate: true, maxZoom: 9 });
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
      if (rows[j].dataset.code === String(code)) {
        rows[j].classList.add('active');
        if (rows[j].scrollIntoView) rows[j].scrollIntoView({ block: 'nearest' });
        break;
      }
    }
  }

  /* ── 详情卡 ── */
  function openCard(f) {
    var p = f.properties, g = groupOf(p.grp);
    var hasCode = !!p.code;
    el.dtLevel.textContent = p.level === 'prov'
      ? '省级 · 港澳台'
      : (p.level === 'county' ? '直辖 / 省直辖县级' : '地级单元 · 首位 ' + p.grp);
    el.dtName.textContent = p.name;
    el.dtSub.textContent = (p.prov || '') + (p.inferred ? ' · 区号按所在地州推定' : '');
    el.dtCode.textContent = hasCode ? p.code : '—';
    el.dtCodeLabel.textContent = hasCode ? '长途区号（点击复制）' : '暂无大陆长途区号';
    el.dtCopy.hidden = !hasCode;

    var alt = p.alts && p.alts.length ? p.alts.join(' / ') : '';
    el.dtMeta.innerHTML =
      '<span><small>所属分组</small><b style="color:' + (COLORS[p.grp] || '#cbd5e1') + '">' +
        esc(g.name) + (p.grp !== '无' ? '（首位 ' + p.grp + '）' : '') + '</b></span>' +
      '<span><small>覆盖城市</small><b>' + esc(p.cities || p.name) + '</b></span>' +
      (alt ? '<span><small>本单元另有区号</small><b>' + esc(alt) + '</b></span>' : '') +
      (p.note && hasCode ? '<span><small>备注</small><b>' + esc(p.note.slice(0, 48)) + '</b></span>' : '');

    var olds = p.old || [];
    el.dtChildrenLabel.textContent = '旧区号 · 并网改拨（' + olds.length + ' 条）';
    el.oldList.innerHTML = olds.length
      ? olds.map(function (o) {
          return '<button type="button" class="old-row" data-old="' + o.from + '">' +
            '<span class="sw">' + o.from + ' → ' + o.to + '</span>' +
            '<span class="tx"><b>' + esc(o.date) + '</b> · <em>' + esc(o.change) + '</em></span></button>';
        }).join('')
      : '<div class="dt-empty">' +
        (hasCode ? '未收录该市的旧区号并网记录。完整变更表见速查文章。' : esc(p.note || '港澳台不属大陆长途区号体系。')) +
        '</div>';
    el.dtFooter.innerHTML = '<a href="/learn/china-telephone-area-codes" target="_top">在「全国电话区号表」中查看完整表格与变更记录 ›</a>';
    el.detail.hidden = false;
    app.setDetailOpen(true);
  }

  /* ── 标注：缩放 >5 时显示城市名 + 区号 ── */
  function updateLabels() {
    if (!S.labelsOn || app.map.getZoom() < 5) { app.setLabels([]); return; }
    var items = [];
    S.feats.forEach(function (f) {
      var p = f.properties;
      var b = Thematic.bboxOf(f.geometry);
      if (!b) return;
      items.push({
        id: String(p.adcode),
        text: p.code ? p.name + ' ' + p.code : p.name,
        lng: (b[0] + b[2]) / 2, lat: (b[1] + b[3]) / 2,
        color: '#dbeafe'
      });
    });
    app.setLabels(items.slice(0, 400));
  }

  /* ── 交互 ── */
  function bind() {
    var map = app.map;
    map.on('mousemove', function (e) {
      var f = app.pick(e.point, ['tele-fill']);
      if (!f) { map.getCanvas().style.cursor = ''; app.tooltip(null); return; }
      map.getCanvas().style.cursor = 'pointer';
      var p = f.properties, g = groupOf(p.grp);
      var shared = p.cities && p.cities.indexOf('、') > -1 ? ' · 多城共用' : '';
      app.tooltip('<b>' + esc(p.name) + '</b> <span style="color:#9fb4cd">' + esc(p.prov || '') + '</span><br>' +
        '<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' +
        (COLORS[p.grp] || '#7c8eb0') + ';margin-right:5px"></span>' +
        (p.code ? esc(g.name) + ' · ' + p.code + shared : '无大陆长途区号') +
        '<br><span style="color:#64748b">点开看区号与并网改拨</span>', e.point.x, e.point.y);
    });
    map.on('mouseleave', function () { app.tooltip(null); });
    map.on('click', function (e) {
      var f = app.pick(e.point, ['tele-fill']);
      if (f) {
        setSel(f);
        var b = Thematic.bboxOf(f.geometry);
        if (b) app.fitBounds(Thematic.padBbox(b, 0.22), { withDetail: true, animate: true, maxZoom: 9 });
      } else setSel(null);
    });
    map.on('idle', updateLabels);
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') setSel(null); });

    el.unitList.addEventListener('click', function (e) {
      var b = e.target.closest('.unit-row');
      if (!b || !b.dataset.code) return;
      goToCode(b.dataset.code);
    });

    /* 复制：clipboard 被拒则退回 execCommand */
    function copyText(text, btn, okMsg) {
      var flash = function (t) {
        var old = btn.textContent; btn.textContent = t;
        setTimeout(function () { btn.textContent = old; }, 1200);
      };
      var legacy = function () {
        var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select();
        var ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
        document.body.removeChild(ta); flash(ok ? okMsg : '请手动复制');
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { flash(okMsg); }, legacy);
      } else legacy();
    }
    el.dtCopy.addEventListener('click', function () { copyText(el.dtCode.textContent, el.dtCopy, '已复制'); });
    el.oldList.addEventListener('click', function (e) {
      var b = e.target.closest('.old-row'); if (!b) return;
      copyText(b.dataset.old, b, '已复制');
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
