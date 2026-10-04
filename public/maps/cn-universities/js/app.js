/* 中国高校分布地图 —— 互动逻辑
   数据：scripts/build_cn_universities.py 生成的 provinces.json（省级总数 + 精英分档）
        与 universities.json（985 / 211 / 军校点位）
   引擎：_shared/thematic */
(function () {
  'use strict';

  var CFG = window.UNIV_CONFIG;
  var fmt = Thematic.fmt, esc = Thematic.esc;

  var DATA = {
    univ: 'data/universities.json',
    provGeo: '/maps/_shared/china-provinces.json',
    provStat: 'data/provinces.json'
  };

  var S = {
    provStat: null,        // provinces.json 内容
    provByName: {},        // shortName -> {total,n985,n211,nMili}
    provCenter: {},        // shortName -> [lng,lat]（省界 centroid）
    chinaByName: {},       // shortName -> feature（省界多边形）
    allUniv: [],           // 全部院校点位
    cat: 'all',            // all | 985 | 211 | mili
    selProv: null,         // 选中的省（short name）
    selUniv: null          // 选中的院校 feature
  };

  var el = {
    segCat: document.getElementById('segCat'),
    catNote: document.getElementById('catNote'),
    rankList: document.getElementById('rankList'),
    rankTitle: document.getElementById('rankTitle'),
    rankNote: document.getElementById('rankNote'),
    legend: document.getElementById('legend'),
    fTotal: document.getElementById('fTotal'),
    f985: document.getElementById('f985'),
    f211: document.getElementById('f211'),
    fMili: document.getElementById('fMili'),
    detail: document.getElementById('detail'),
    dtRole: document.getElementById('dtRole'),
    dtName: document.getElementById('dtName'),
    dtSub: document.getElementById('dtSub'),
    dtLb1: document.getElementById('dtLb1'),
    dtLb2: document.getElementById('dtLb2'),
    dtLb3: document.getElementById('dtLb3'),
    dtV1: document.getElementById('dtV1'),
    dtV2: document.getElementById('dtV2'),
    dtV3: document.getElementById('dtV3'),
    dtDescLb: document.getElementById('dtDescLb'),
    dtDesc: document.getElementById('dtDesc'),
    dtFooter: document.getElementById('dtFooter')
  };

  /* ── 省份名归一化（去后缀，便于匹配）───────────────────────── */
  function strip(n) {
    return String(n || '').replace(/特别行政区$/, '').replace(/壮族自治区$/, '')
      .replace(/回族自治区$/, '').replace(/维吾尔自治区$/, '').replace(/自治区$/, '')
      .replace(/[省市]$/, '');
  }

  /* ── 省级分档配色 ─────────────────────────────────────────── */
  function tierColor(total) {
    if (total == null) return CFG.tiers[CFG.tiers.length - 1].color;
    for (var i = 0; i < CFG.tiers.length; i++) if (total >= CFG.tiers[i].min) return CFG.tiers[i].color;
    return CFG.tiers[CFG.tiers.length - 1].color;
  }
  /* 点位配色：按最高层级 */
  function rankColorOf(f) {
    return CFG.rankColor[String(f.properties.rank)] || '#9aa7bd';
  }

  /* ── 地图 ─────────────────────────────────────────────────── */
  var app = Thematic.create({
    slug: 'cn-universities',
    view: CFG.view,
    bounds: CFG.bounds,
    extent: CFG.extent,
    graticuleStep: 5,
    province: { fill: true, line: true },
    sources: {
      univ: { data: DATA.univ, promoteId: 'name' },
      selProv: { data: Thematic.EMPTY },
      selUniv: { data: Thematic.EMPTY }
    },
    layers: [
      /* 院校点位 */
      { id: 'univ-pt', type: 'circle', source: 'univ',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 3.2, 7, 7.5],
          'circle-color': ['match', ['get', 'rank'], 3, '#f56c6c', 2, '#e6a23c', 1, '#409eff', '#9aa7bd'],
          'circle-stroke-width': 1, 'circle-stroke-color': 'rgba(255,255,255,.72)',
          'circle-opacity': 0.92
        } },
      /* 选中院校：白色光环 + 柔光 */
      { id: 'univ-glow', type: 'circle', source: 'selUniv', layout: { visibility: 'none' },
        paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 11, 7, 22],
          'circle-color': '#ffffff', 'circle-opacity': 0.18 } },
      { id: 'univ-sel', type: 'circle', source: 'selUniv', layout: { visibility: 'none' },
        paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 7, 7, 14],
          'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-width': 2.5,
          'circle-stroke-color': '#ffffff', 'circle-opacity': 0.95 } },
      /* 选中省份描边 */
      { id: 'prov-sel', type: 'line', source: 'selProv', layout: { visibility: 'none' },
        paint: { 'line-color': '#ffffff', 'line-width': 2.4, 'line-opacity': 0.92, 'line-blur': 0.4 } }
    ],
    onReady: boot,
    onOverview: function () { clearSel(); app.fitAll({ animate: true }); },
    onClose: function () { clearSel(); }
  });

  /* ── 省级填色 ─────────────────────────────────────────────── */
  function paintProvinces() {
    fetch(DATA.provGeo).then(function (r) { return r.json(); }).then(function (fc) {
      fc.features.forEach(function (f) {
        var p = f.properties || {};
        var nm = strip(p.name);
        f.properties.fillColor = tierColor((S.provByName[nm] || {}).total);
      });
      app.map.getSource('prov').setData(fc);
      // 重新落实填色表达式（引擎 onReady 时 fillColor 尚为空）
      app.map.setPaintProperty('prov-fill', 'fill-color', ['case',
        ['==', ['typeof', ['get', 'fillColor']], 'string'], ['get', 'fillColor'], '#0e1a2a']);
      app.map.setPaintProperty('prov-fill', 'fill-opacity', 0.74);
    }).catch(function () {});
  }

  /* ── 院校类别筛选 ─────────────────────────────────────────── */
  function applyCategory(cat) {
    S.cat = cat;
    var feats = S.allUniv.filter(function (f) {
      var p = f.properties;
      if (cat === 'all') return true;
      if (cat === '985') return p.is985;
      if (cat === '211') return p.is211;
      if (cat === 'mili') return p.isMili;
      return true;
    });
    app.map.getSource('univ').setData({ type: 'FeatureCollection', features: feats });

    // 选中院校若被过滤掉，则清除
    if (S.selUniv && !feats.some(function (f) { return f.properties.name === S.selUniv.properties.name; })) {
      clearUnivSel();
    }
    syncCat();
    setLabels();

    var c = CFG.cats.filter(function (x) { return x.key === cat; })[0];
    el.catNote.textContent = c ? c.desc + '。' : '';
  }

  function syncCat() {
    Array.prototype.forEach.call(el.segCat.children, function (b) {
      b.classList.toggle('active', b.dataset.v === S.cat);
    });
  }

  /* ── 图例 ─────────────────────────────────────────────────── */
  function renderLegend() {
    var html = '<div class="lg-cap">省级 · 普通高校总数</div>';
    CFG.tiers.forEach(function (t) {
      html += '<span class="lg-row"><i style="background:' + t.color + '"></i>' + esc(t.label) + '</span>';
    });
    html += '<div class="lg-cap" style="margin-top:6px">院校点位 · 层级</div>';
    [{ c: '#f56c6c', t: '985 工程' }, { c: '#e6a23c', t: '211 工程' }, { c: '#409eff', t: '军事院校' }, { c: '#9aa7bd', t: '其他' }]
      .forEach(function (x) {
        html += '<span class="lg-row"><s style="background:' + x.c + '"></s>' + x.t + '</span>';
      });
    el.legend.innerHTML = html;
  }

  /* ── 省份排行 ─────────────────────────────────────────────── */
  function renderRank() {
    var list = S.provStat.provinces.slice().sort(function (a, b) { return b.total - a.total; });
    var max = Math.max.apply(null, list.map(function (p) { return p.total; }));
    el.rankTitle.textContent = '普通高校数量排行';
    el.rankNote.textContent = '共 ' + list.length + ' 个省级区 · 全国 ' + S.provStat.summary.totalAll + ' 所（2023）';

    el.rankList.innerHTML = list.map(function (p) {
      var w = Math.round(p.total / max * 100);
      var nm = p.name.replace(/省|市|自治区|维吾尔|壮族|回族/g, '');
      var active = S.selProv === p.name ? ' active' : '';
      return '<button type="button" class="chart-row' + active + '" data-nm="' + esc(p.name) + '">' +
        '<span class="nm">' + esc(nm) + '</span>' +
        '<span class="bar"><i style="width:' + w + '%;background:' + tierColor(p.total) + '"></i></span>' +
        '<span class="vl">' + p.total + '</span></button>';
    }).join('');

    el.rankList.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      app.collapseDrawer();
      selectProv(b.dataset.nm, true);
    };
  }

  /* ── 标注：省份名 + 选中院校 ──────────────────────────────── */
  function setLabels() {
    var items = [];
    Object.keys(S.provCenter).forEach(function (nm) {
      var st = S.provByName[nm];
      if (!st) return;
      var c = S.provCenter[nm];
      items.push({
        text: nm.replace(/省|市|自治区|维吾尔|壮族|回族/g, '') + ' ' + st.total,
        lng: c[0], lat: c[1], color: tierColor(st.total), kind: 'tag', active: S.selProv === nm
      });
    });
    if (S.selUniv) {
      var p = S.selUniv.properties;
      items.push({ text: p.name, lng: S.selUniv.geometry.coordinates[0], lat: S.selUniv.geometry.coordinates[1],
        color: rankColorOf(S.selUniv), kind: 'dot', active: true });
    }
    app.setLabels(items);
  }

  /* ── 选中省份 ─────────────────────────────────────────────── */
  function selectProv(name, move) {
    var f = S.chinaByName[name];
    if (!f) return;
    S.selProv = name;
    S.selUniv = null;
    clearUnivSel();

    app.map.getSource('selProv').setData(f);
    app.map.setLayoutProperty('prov-sel', 'visibility', 'visible');

    var st = S.provByName[name] || { total: 0, n985: 0, n211: 0, nMili: 0 };
    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', tierColor(st.total));
    el.dtRole.textContent = 'PROVINCE';
    el.dtName.textContent = (f.properties.name || name).replace(/特别行政区$/, '');
    el.dtSub.textContent = '普通高校 ' + st.total + ' 所（2023）';
    el.dtLb1.textContent = '985'; el.dtV1.textContent = st.n985 + ' 所';
    el.dtLb2.textContent = '211'; el.dtV2.textContent = st.n211 + ' 所';
    el.dtLb3.textContent = '军校'; el.dtV3.textContent = st.nMili + ' 所';
    el.dtDescLb.textContent = '分布解读';
    el.dtDesc.textContent = st.total >= 150
      ? '高等教育第一梯队：高校总数居全国最前列，院校密度与优质资源高度集中。'
      : st.total >= 100
        ? '高等教育强省：高校总量大，拥有一批 985 / 211 重点院校。'
        : st.total >= 50
          ? '高校资源中等省份，以省属本科与高职专科为主，顶尖院校相对有限。'
          : '高校总量偏少，高等教育资源密度低于全国多数省份。';
    el.dtFooter.innerHTML = '<span>数据年份 2023</span><span>口径：普通高校（本科 + 专科）</span>';

    renderRank();
    setLabels();
    if (move) {
      var bb = Thematic.bboxOf(f.geometry);
      if (bb) app.fitBounds(Thematic.padBbox(bb, 0.4), { animate: true, maxZoom: 6.5, withDetail: true, duration: 720 });
    }
  }

  /* ── 选中院校 ─────────────────────────────────────────────── */
  function selectUniv(f, move) {
    S.selUniv = f;
    S.selProv = null;
    app.map.getSource('selProv').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('prov-sel', 'visibility', 'none');

    app.map.getSource('selUniv').setData({ type: 'FeatureCollection', features: [f] });
    app.map.setLayoutProperty('univ-glow', 'visibility', 'visible');
    app.map.setLayoutProperty('univ-sel', 'visibility', 'visible');

    var p = f.properties;
    var tags = [];
    if (p.is985) tags.push('985 工程');
    if (p.is211) tags.push('211 工程');
    if (p.isMili) tags.push('军事院校');
    if (!tags.length) tags.push('普通高校');
    var col = rankColorOf(f);

    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', col);
    el.dtRole.textContent = 'UNIVERSITY';
    el.dtName.textContent = p.name;
    el.dtSub.textContent = p.city + ' · ' + p.province + (p.isMili ? ' · 军队直属' : '');
    el.dtLb1.textContent = '类别'; el.dtV1.textContent = tags.join(' / ');
    el.dtLb2.textContent = '城市'; el.dtV2.textContent = p.city;
    el.dtLb3.textContent = '省份'; el.dtV3.textContent = p.province;
    el.dtDescLb.textContent = '简介';
    el.dtDesc.textContent = tags.indexOf('军事院校') >= 0
      ? '军队 / 武警直属院校，承担军事人才培养与国防科研任务，招生与培养体系与地方高校不同。'
      : (p.is985 ? '985 工程高校——1998 年启动、面向世界一流的顶尖大学建设计划，全国共 39 所。'
        : p.is211 ? '211 工程高校——面向 21 世纪重点建设约百所高等学校，是双一流建设的重要基础。'
          : '普通高等院校，未列入 985 / 211 序列。');
    el.dtFooter.innerHTML = '<span>层级：' + tags.join(' / ') + '</span><span>' + esc(p.city) + ' · ' + esc(p.province) + '</span>';

    renderRank();
    setLabels();
    app.pulse({ glowId: 'univ-glow', selId: 'univ-sel', baseWidth: 11, maxExtra: 9, duration: 1500 });
    if (move) {
      var c = f.geometry.coordinates;
      app.map.easeTo({ center: c, zoom: Math.max(app.map.getZoom(), 6), duration: 720 });
    }
  }

  function clearUnivSel() {
    S.selUniv = null;
    app.map.getSource('selUniv').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('univ-glow', 'visibility', 'none');
    app.map.setLayoutProperty('univ-sel', 'visibility', 'none');
  }

  function clearSel() {
    S.selProv = null;
    clearUnivSel();
    app.map.getSource('selProv').setData(Thematic.EMPTY);
    app.map.setLayoutProperty('prov-sel', 'visibility', 'none');
    app.setDetailOpen(false);
    el.detail.hidden = true;
    renderRank();
    setLabels();
  }

  /* ── 交互 ─────────────────────────────────────────────────── */
  function bind() {
    app.map.on('mousemove', function (e) {
      var u = app.pick(e.point, ['univ-pt'], 4);
      if (u) {
        var p = u.properties;
        app.map.getCanvas().style.cursor = 'pointer';
        var tags = [];
        if (p.is985) tags.push('985'); if (p.is211) tags.push('211'); if (p.isMili) tags.push('军校');
        app.tooltip('<b>' + esc(p.name) + '</b> <span style="color:' + rankColorOf(u) + '">' +
          (tags.length ? tags.join(' · ') : '普通高校') + '</span><br><span style="color:#9fb4cd">' +
          esc(p.city) + ' · ' + esc(p.province) + '</span>', e.point.x, e.point.y);
        return;
      }
      var pr = app.pick(e.point, ['prov-fill'], 0);
      if (pr) {
        var nm = strip(pr.properties.name);
        var st = S.provByName[nm];
        app.map.getCanvas().style.cursor = 'pointer';
        app.tooltip('<b>' + esc(pr.properties.name.replace(/特别行政区$/, '')) + '</b> <span style="color:#9fb4cd">普通高校 ' +
          (st ? st.total : '—') + ' 所</span>', e.point.x, e.point.y);
        return;
      }
      app.map.getCanvas().style.cursor = '';
      app.tooltip(null);
    });
    app.map.on('mouseleave', function () { app.tooltip(null); });
    app.map.on('click', function (e) {
      var u = app.pick(e.point, ['univ-pt'], 4);
      if (u) { app.collapseDrawer(); selectUniv(u, true); return; }
      var pr = app.pick(e.point, ['prov-fill'], 0);
      if (pr) { app.collapseDrawer(); selectProv(strip(pr.properties.name), true); return; }
      clearSel();
    });

    el.segCat.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      applyCategory(b.dataset.v);
    };
  }

  function bindPanel() {
    var ckUniv = document.getElementById('ckUniv');
    if (ckUniv) ckUniv.addEventListener('change', function () { app.setVisible('univ-pt', this.checked); app.setVisible('univ-sel', false); app.setVisible('univ-glow', false); });
  }

  /* ── 启动 ─────────────────────────────────────────────────── */
  function boot() {
    var dbg = window.__univDebug = { startedAt: Date.now() };
    Promise.all([
      fetch(DATA.univ).then(function (r) { return r.json(); }),
      fetch(DATA.provGeo).then(function (r) { return r.json(); }),
      fetch(DATA.provStat).then(function (r) { return r.json(); })
    ]).then(function (res) {
      var univ = res[0], geo = res[1], stat = res[2];
      S.allUniv = univ.features;
      S.provStat = stat;

      stat.provinces.forEach(function (p) { S.provByName[p.name] = p; });
      geo.features.forEach(function (f) {
        var nm = strip(f.properties.name);
        S.chinaByName[nm] = f;
        if (f.properties.centroid) S.provCenter[nm] = f.properties.centroid;
        else if (f.properties.center) S.provCenter[nm] = f.properties.center;
      });

      el.fTotal.textContent = stat.summary.totalAll;
      el.f985.textContent = stat.summary.n985;
      el.f211.textContent = stat.summary.n211;
      el.fMili.textContent = stat.summary.nMili;

      paintProvinces();
      renderLegend();
      renderRank();
      bind();
      bindPanel();
      applyCategory('all');
      setLabels();
      app.fitAll({ animate: false });
      dbg.bootDone = true;
    }).catch(function (err) {
      console.error('[cn-universities] 数据加载失败', err);
      el.rankList.innerHTML = '<p class="note">数据加载失败，请刷新重试。</p>';
    });
  }
})();
