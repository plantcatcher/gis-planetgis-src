/* 全国车牌代码互动地图 · china-license-plate-codes
   点击任意城市 → 右侧显示该地发牌机关代号、一城多代号与省会 A 牌；
   按车牌代号（粤B）或城市名即时搜索定位。

   套用 cn-adcode / china-telephone-codes 查询型新模板：实时搜索下拉 + 按省目录 +
   feature-state 选中退色描边 + 大号代码复制 + 齿轮抽屉 + #u/单元代码 分享。

   数据（_g/_build_china_license_map.py 生成）：
     data/prefectures.geojson  450 个单元（属性 adcode,name,prov,plateCity,plateProv,
                               level,code,codes,grp,capital,note）
     data/index.json           [主键, 名称, 类型, adcode]，类型 plate / name / prov / short
*/
(function () {
  'use strict';

  var CFG = window.CLIC_CONFIG;
  var fmt = Thematic.fmt, esc = Thematic.esc;
  var COLORS = CFG.COLORS, GROUPS = CFG.GROUPS;

  var el = {};
  ['fCode', 'fUnit', 'fGrp', 'grpStrip', 'searchInput', 'searchResults', 'unitList', 'listHint',
   'detail', 'dtLevel', 'dtName', 'dtSub', 'dtCode', 'dtCodeLabel', 'dtCopy', 'dtMeta',
   'dtChildrenLabel', 'plateList', 'dtFooter', 'introBarText',
   'dtAbout', 'dtAboutToggle', 'dtAboutBody'].forEach(function (id) {
    el[id] = document.getElementById(id);
  });

  var S = {
    feats: [],
    byCode: {},
    byPlate: {},
    idx: [],
    sel: null,
    hi: null,
    labelsOn: true
  };

  function groupOf(grp) {
    for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].key === grp) return GROUPS[i];
    return GROUPS[GROUPS.length - 1];
  }
  function isCapital(plate) { return !!plate && plate.slice(-1) === 'A'; }
  function isSpecial(plate) { return !!plate && plate.slice(-1) === 'Z'; }
  function plateOrder(a, b) {
    return (isSpecial(a) - isSpecial(b)) || (isCapital(b) - isCapital(a)) || a.localeCompare(b);
  }
  /* 车牌由来：按当前单元所在省、当前代号变化。
     省简称来源 + 本省代号编排 + 本单元特殊代号由来；文本一律转义。 */
  function aboutHtml(short, prov, codes, unitName) {
    var a = CFG.ABOUT || {};
    var origin = CFG.ORIGINS && CFG.ORIGINS[short];
    var region = CFG.REGION && CFG.REGION[short];
    var pm = CFG.PLATE || {};
    if (!origin) return '<p class="ab-p">' + esc(a.special || '港澳台号牌由当地自行管理。') + '</p>';

    var html = '<p class="ab-prov"><b>' + esc(short) + ' · ' + esc(prov || '') + '</b>' + esc(origin) + '</p>';
    if (region) html += '<p class="ab-rule"><em>本省代号</em>' + esc(region) + '</p>';

    var notes = [];
    (codes || []).forEach(function (c) { if (pm[c]) notes.push([c, pm[c]]); });
    if (notes.length) {
      html += '<p class="ab-codes"><em>本单元代号由来</em></p><ul class="ab-list">';
      notes.forEach(function (n) {
        html += '<li><b>' + esc(n[0]) + '</b>' + esc(n[1]) + '</li>';
      });
      html += '</ul>';
    } else if (codes && codes.length) {
      html += '<p class="ab-codes"><em>本单元代号</em>' + esc(unitName || '') +
        '沿用本省排序，无单独史料记载。</p>';
    }
    html += '<p class="ab-foot">' + esc(a.general || '') + '</p>';
    return html;
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
    slug: 'china-license-plate-codes',
    view: CFG.view, bounds: CFG.bounds, boundsMobile: CFG.boundsMobile, extent: CFG.extent,
    graticuleStep: CFG.graticuleStep,
    imgPaint: CFG.imgPaint,
    sources: {
      main: { data: 'data/prefectures.geojson', promoteId: 'adcode' },
      sel: { data: Thematic.EMPTY, promoteId: 'adcode' }
    },
    layers: [
      { id: 'plate-fill', type: 'fill', source: 'main',
        paint: { 'fill-color': colorExpr(), 'fill-opacity': opacityExpr() } },
      { id: 'plate-line', type: 'line', source: 'main',
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
      S.feats.forEach(function (f) {
        var p = f.properties;
        S.byCode[String(p.adcode)] = f;
        (Array.isArray(p.codes) ? p.codes : []).forEach(function (plate) {
          if (!S.byPlate[plate]) S.byPlate[plate] = f; // 第一个单元即代表单元
        });
      });

      el.fCode.textContent = fmt(CFG.TOTAL_PLATES, 0);
      el.fUnit.textContent = fmt(CFG.TOTAL_UNITS, 0);
      el.fGrp.textContent = String(CFG.TOTAL_REGIONS);

      renderGrpStrip();
      renderUnitList();
      bind();
      bindSearch();
      bindPanel();
      bindAbout();
      app.fitAll({ animate: false });
      updateLabels();
      window.__chinaLicenseReady = true;

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
      console.error('[china-license-plate-codes] 数据加载失败', err);
      el.unitList.innerHTML = '<div class="sr-more">数据加载失败，请刷新重试。</div>';
    });
  }

  /* ── 左栏分组色带：点色块只高亮该大区 ── */
  function renderGrpStrip() {
    el.grpStrip.innerHTML = GROUPS.map(function (g) {
      return '<button type="button" class="gp-btn" data-key="' + g.key + '" title="' + esc(g.desc) + '">' +
        '<i style="background:' + g.color + '"></i>' + esc(g.name) + '<em>' + esc(g.key) + '</em></button>';
    }).join('');
    el.grpStrip.addEventListener('click', function (e) {
      var b = e.target.closest('.gp-btn'); if (!b) return;
      var k = b.getAttribute('data-key');
      S.hi = (S.hi === k) ? null : k;
      if (app.map.getLayer('plate-fill')) app.map.setPaintProperty('plate-fill', 'fill-opacity', opacityExpr());
      Array.prototype.forEach.call(el.grpStrip.querySelectorAll('.gp-btn'), function (x) {
        x.classList.toggle('is-on', S.hi && x.getAttribute('data-key') === S.hi);
      });
    });
  }

  /* ── 目录：按省份分组，每个代号一行（共 407 行） ── */
  function renderUnitList() {
    var groups = {};
    S.feats.forEach(function (f) {
      var p = f.properties;
      if (!p.plateProv) return;
      (Array.isArray(p.codes) ? p.codes : []).forEach(function (plate) {
        if (S.byPlate[plate] !== f) return; // 每个代号只出现一次
        var g = groups[p.plateProv] || (groups[p.plateProv] = { prov: p.prov, rows: [] });
        g.rows.push({ plate: plate, city: p.plateCity || p.name, adcode: p.adcode });
      });
    });
    var provKeys = Object.keys(groups).sort(function (a, b) {
      return groups[b].rows.length - groups[a].rows.length;
    });
    var html = '';
    provKeys.forEach(function (pk) {
      var g = groups[pk];
      g.rows.sort(function (a, b) { return plateOrder(a.plate, b.plate); });
      html += '<button type="button" class="unit-prov" data-code="' + esc(pk) + '">' +
        esc(g.prov || pk) + ' ' + esc(pk) + '<i>' + g.rows.length + ' 个代号 ›</i></button>';
      g.rows.forEach(function (r) {
        var tag = isCapital(r.plate) ? '省会 A 牌' : (isSpecial(r.plate) ? '港澳号段' : '');
        html += '<button type="button" class="unit-row" data-code="' + r.adcode + '">' +
          '<span class="code">' + esc(r.plate) + '</span>' +
          '<span class="nm">' + esc(r.city) + '</span>' +
          '<span class="cnt">' + esc(tag) + '</span>' +
          '</button>';
      });
    });
    el.unitList.innerHTML = html;
  }

  /* ── 搜索：车牌代号 / 城市名 / 省份即时下拉 ── */
  function bindSearch() {
    var box = el.searchInput, out = el.searchResults, timer = 0;
    function run() {
      var q = box.value.trim();
      if (!q) { out.innerHTML = ''; return; }
      // 粤b / 粤B 之类的输入统一把字母转大写
      var plateQ = q.replace(/^([一-龥])([A-Za-z])$/, function (_, ch, letter) { return ch + letter.toUpperCase(); });
      var hits = [], seen = {};
      for (var i = 0; i < S.idx.length && hits.length < 12; i++) {
        var r = S.idx[i];
        var ok = (r[0].toLowerCase() === plateQ.toLowerCase()) || (r[0].indexOf(plateQ) === 0) ||
                 (r[1].indexOf(q) !== -1);
        if (!ok) continue;
        var dk = r[3] + '|' + r[0];
        if (seen[dk]) continue;
        seen[dk] = 1;
        hits.push(r);
      }
      hits.sort(function (a, b) {
        return (a[0] === plateQ ? 0 : 1) - (b[0] === plateQ ? 0 : 1) ||
               (a[1] === q ? 0 : 1) - (b[1] === q ? 0 : 1);
      });
      var html = hits.map(function (r) {
        var badge = r[2] === 'plate' ? '车牌' : (r[2] === 'name' ? '城市' : (r[2] === 'short' ? '简称' : '省份'));
        return '<button type="button" class="sr-row" data-code="' + r[3] + '">' +
          '<span class="code">' + esc(r[0]) + '</span>' +
          '<span class="nm">' + esc(r[1]) + '</span>' +
          '<span class="lv">' + badge + '</span></button>';
      }).join('');
      if (!hits.length) html = '<div class="sr-more">没有匹配 “' + esc(q) + '” 的车牌代号或城市</div>';
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
    /* MapLibre queryRenderedFeatures 会把空数组属性读成字符串 "[]"。
       统一还原为数组，避免 openCard 里 codes.map 抛错。 */
    if (f && f.properties && typeof f.properties.codes === 'string') {
      try { f.properties.codes = JSON.parse(f.properties.codes); } catch (_) { f.properties.codes = []; }
    }
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
    var codes = Array.isArray(p.codes) ? p.codes : [];
    var hasCode = !!p.code;
    el.dtLevel.textContent = hasCode
      ? (p.capital ? '省会 A 牌 · ' + p.plateProv : '发牌机关 · ' + p.plateProv)
      : '港澳台 / 未收录';
    el.dtName.textContent = p.plateCity || p.name;
    el.dtSub.textContent = (p.prov || '') + (p.name && p.name !== (p.plateCity || p.name) ? ' · ' + p.name : '');
    el.dtCode.textContent = hasCode ? p.code : '—';
    el.dtCodeLabel.textContent = hasCode ? '车牌代号（点击复制）' : '暂无大陆发牌机关代号';
    el.dtCopy.hidden = !hasCode;

    el.dtMeta.innerHTML =
      '<span><small>所属大区</small><b style="color:' + (COLORS[p.grp] || '#cbd5e1') + '">' +
        esc(g.name) + ' · ' + esc(p.plateProv || '—') + '</b></span>' +
      '<span><small>本单元代号</small><b>' + codes.length + ' 个</b></span>' +
      '<span><small>地图单元</small><b>' + esc(p.name) + '</b></span>' +
      '<span><small>省会 A 牌</small><b>' + (p.capital ? '是' : '否') + '</b></span>';

    el.dtChildrenLabel.textContent = '本单元全部代号（' + codes.length + ' 条，点击复制）';
    el.plateList.innerHTML = codes.length
      ? codes.map(function (c) {
          var cls = 'plate-row' + (isCapital(c) ? ' cap' : '') + (isSpecial(c) ? ' special' : '');
          return '<button type="button" class="' + cls + '" data-plate="' + esc(c) + '" title="' +
            esc(p.plateCity || p.name) + '">' + esc(c) + '</button>';
        }).join('')
      : '<div class="dt-empty">' + esc(p.note || '该单元未收录独立发牌机关代号。') + '</div>';

    if (el.dtAboutBody) el.dtAboutBody.innerHTML = aboutHtml(p.plateProv, p.prov, codes, p.name);
    if (el.dtAboutToggle) { el.dtAboutToggle.textContent = '收起'; el.dtAboutBody.classList.remove('folded'); }
    el.dtFooter.innerHTML = (p.note ? '<span style="color:#fcd34d">' + esc(p.note) + '</span><br>' : '') +
      '<a href="/learn/china-license-plate-codes" target="_top">在「全国车牌代码对照表」中查看完整表格与规则 ›</a>';
    el.detail.hidden = false;
    app.setDetailOpen(true);
  }

  /* ── 标注：缩放 >5 时显示本单元名 + 本单元全部代号 ──
     直辖市各区代号不同（京A / 京G、沪A / 沪C、渝A / 渝C…），
     用单元名而非全市名，避免各区标签都写成「北京市 京A」。 */
  function labelText(p) {
    var codes = Array.isArray(p.codes) ? p.codes : [];
    if (!codes.length) return p.name;
    var shown = codes.slice(0, 4).join('·');
    if (codes.length > 4) shown += ' 等' + codes.length + '个';
    return p.name + ' ' + shown;
  }
  function updateLabels() {
    if (!S.labelsOn || app.map.getZoom() < 5) { app.setLabels([]); return; }
    var items = [];
    S.feats.forEach(function (f) {
      var p = f.properties;
      var b = Thematic.bboxOf(f.geometry);
      if (!b) return;
      items.push({
        id: String(p.adcode),
        text: labelText(p),
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
      var f = app.pick(e.point, ['plate-fill']);
      if (!f) { map.getCanvas().style.cursor = ''; app.tooltip(null); return; }
      map.getCanvas().style.cursor = 'pointer';
      var p = f.properties, g = groupOf(p.grp);
      app.tooltip('<b>' + esc(p.name) + '</b> <span style="color:#9fb4cd">' + esc(p.prov || '') + '</span><br>' +
        '<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' +
        (COLORS[p.grp] || '#7c8eb0') + ';margin-right:5px"></span>' +
        (p.code ? esc(g.name) + ' · ' + esc((p.codes || []).join(' / ')) : '未收录发牌机关代号') +
        '<br><span style="color:#64748b">点开看代号与备注</span>', e.point.x, e.point.y);
    });
    map.on('mouseleave', function () { app.tooltip(null); });
    map.on('click', function (e) {
      var f = app.pick(e.point, ['plate-fill']);
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
    el.plateList.addEventListener('click', function (e) {
      var b = e.target.closest('.plate-row'); if (!b) return;
      copyText(b.dataset.plate, b, '已复制');
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

  /* ── 车牌由来：详情卡内小知识折叠 ── */
  function bindAbout() {
    if (el.dtAboutToggle && el.dtAboutBody) {
      el.dtAboutToggle.addEventListener('click', function () {
        var folded = el.dtAboutBody.classList.toggle('folded');
        el.dtAboutToggle.textContent = folded ? '展开' : '收起';
      });
    }
  }
})();
