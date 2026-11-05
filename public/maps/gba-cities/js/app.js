/* 粤港澳大湾区城市图鉴 · 11 城基础介绍
   运行时：/maps/_shared/thematic/thematic.js（底图 / 标注 / 视野 / 浮层）
   数据：data/cities.geojson —— 11 市边界 + 《广州统计年鉴 2025》附录 5（2024 年）指标
   坐标系：边界 CGCS2000 ≈ WGS84；底图高德 GCJ-02，两者约 500 m 系统偏移。 */
(function () {
  'use strict';

  var fmt = Thematic.fmt, esc = Thematic.esc;

  var RAMP = ['#153a5c', '#1a5b85', '#1c7ea6', '#22a3ae', '#48bd9a', '#9bd07f', '#f0b429'];
  var GROUP_COLORS = {
    '中心城市（内地）': '#f0b429',
    '重要节点城市': '#38bdf8',
    '特别行政区': '#fb7185'
  };
  var ROLE_ORDER = { '中心城市（内地）': 0, '特别行政区': 1, '重要节点城市': 2 };

  var METRICS = {
    gdp: {
      key: 'gdp', label: '地区生产总值', unit: '亿元',
      hint: '2024 年地区生产总值（亿元人民币），港澳为本地生产总值折算值',
      note: '按<b>GDP</b>着色：深圳、广州、香港三城贡献了 11 市总量的约三分之二，肇庆、澳门所在的一端明显更浅。',
      listHint: '按 GDP 排序 · 点击定位'
    },
    pop: {
      key: 'pop', label: '常住人口', unit: '万人',
      hint: '2024 年末常住人口（万人）；港澳为年中人口，口径不同',
      note: '按<b>常住人口</b>着色：广州、深圳双双超过 1700 万，加上东莞、佛山、香港，五城已占湾区人口七成以上。',
      listHint: '按人口排序 · 点击定位'
    },
    gdpPc: {
      key: 'gdpPc', label: '人均 GDP', unit: '元',
      hint: '2024 年人均地区生产总值（元，现价），年鉴统一口径',
      note: '按<b>人均 GDP</b>着色：澳门、香港、深圳构成第一梯队；总量最大的广州退到第三，量级与结构不是同一张地图。',
      listHint: '按人均 GDP 排序 · 点击定位'
    },
    area: {
      key: 'area', label: '陆域面积', unit: 'km²',
      hint: '陆域面积（km²），取年鉴统一口径，非几何实算',
      note: '按<b>陆域面积</b>着色：肇庆一市约占 11 市总面积四分之一；澳门仅 33.3 km²，不足肇庆的 1/400。',
      listHint: '按面积排序 · 点击定位'
    },
    group: {
      key: 'groupZh', label: '城市角色', unit: '',
      hint: '《粤港澳大湾区发展规划纲要》四大中心城市 = 香港、澳门、广州、深圳；本图把两个特别行政区单列',
      note: '按<b>城市角色</b>着色：《规划纲要》确定香港、澳门、广州、深圳为四大中心城市；本图把两个特别行政区单列，以显示「一国两制」下的制度差异。',
      listHint: '按城市角色分组 · 点击定位'
    }
  };

  var S = { main: [], metric: 'gdp', sel: null };

  var el = {
    metricSeg: document.getElementById('metricSeg'),
    metricNote: document.getElementById('metricNote'),
    listHint: document.getElementById('listHint'),
    cityList: document.getElementById('cityList'),
    legend: document.getElementById('legend'),
    fMain: document.getElementById('fMain'),
    fArea: document.getElementById('fArea'),
    fPop: document.getElementById('fPop'),
    fGdp: document.getElementById('fGdp'),
    detail: document.getElementById('detail'),
    dtRole: document.getElementById('dtRole'),
    dtName: document.getElementById('dtName'),
    dtSub: document.getElementById('dtSub'),
    dtGdp: document.getElementById('dtGdp'),
    dtPop: document.getElementById('dtPop'),
    dtArea: document.getElementById('dtArea'),
    dtPc: document.getElementById('dtPc'),
    dtIdx: document.getElementById('dtIdx'),
    dtPort: document.getElementById('dtPort'),
    dtBlurb: document.getElementById('dtBlurb'),
    dtTitle: document.getElementById('dtTitle'),
    dtTrade: document.getElementById('dtTrade'),
    dtRank: document.getElementById('dtRank'),
    dtTags: document.getElementById('dtTags'),
    dtFooter: document.getElementById('dtFooter')
  };

  /* ── 数值工具 ── */
  function val(p, key) { return Number(p[key]) || 0; }
  function shortVal(p, key) {
    var v = val(p, key);
    if (key === 'gdpPc') return (v / 1e4).toFixed(2) + ' 万元';
    if (key === 'gdp') return fmt(v, 0) + ' 亿';
    if (key === 'pop') return fmt(v, 0) + ' 万';
    if (key === 'area') return fmt(v, v < 100 ? 1 : 0) + ' km²';
    if (key === 'trade') return fmt(v, 0) + ' 亿美元';
    if (key === 'port') return fmt(v, 0) + ' 万箱';
    return p.groupZh || '—';
  }
  function domain(key) {
    var vs = S.main.map(function (f) { return val(f.properties, key); }).filter(function (v) { return v > 0; });
    return { lo: Math.log10(Math.min.apply(null, vs.length ? vs : [1])), hi: Math.log10(Math.max.apply(null, vs.length ? vs : [1])), min: Math.min.apply(null, vs), max: Math.max.apply(null, vs) };
  }
  function rampColor(key, value) {
    var d = domain(key);
    var t = (Math.log10(Math.max(value, 0.01)) - d.lo) / (d.hi - d.lo || 1);
    t = Math.max(0, Math.min(1, t));
    return RAMP[Math.round(t * (RAMP.length - 1))];
  }
  function rank(p, key) {
    var sorted = S.main.map(function (f) { return val(f.properties, key); }).sort(function (a, b) { return b - a; });
    var i = sorted.indexOf(val(p, key));
    return i < 0 ? '—' : String(i + 1);
  }

  /* ── 着色 / 图例 ── */
  function recolor() {
    S.main.forEach(function (f) {
      var p = f.properties;
      p.fill = S.metric === 'group'
        ? (GROUP_COLORS[p.groupZh] || '#94a3b8')
        : rampColor(S.metric, val(p, S.metric));
    });
    app.map.getSource('main').setData({ type: 'FeatureCollection', features: S.main });
    /* setData 会清掉 feature-state，选中态要补回来 */
    if (S.sel) {
      try { app.map.setFeatureState({ source: 'main', id: S.sel.properties.gid }, { selected: true }); } catch (_) {}
    }
  }
  function renderLegend() {
    if (S.metric === 'group') {
      var rows = Object.keys(GROUP_COLORS).map(function (g) {
        return '<span class="lg-row"><i style="background:' + GROUP_COLORS[g] + '"></i>' + esc(g) + '</span>';
      }).join('');
      el.legend.innerHTML = '<div class="lg-cap">按城市角色着色</div>' + rows +
        '<div class="lg-note">' + esc(METRICS.group.hint) + '</div>';
      return;
    }
    var m = METRICS[S.metric], d = domain(S.metric), cells = '';
    for (var i = 0; i < RAMP.length; i++) {
      var t = i / (RAMP.length - 1);
      var v = Math.pow(10, d.lo + t * (d.hi - d.lo));
      var lab = t === 0 ? '≤ ' + shortVal({ gdp: d.min, pop: d.min, area: d.min, gdpPc: d.min }, S.metric)
        : (t === 1 ? '≥ ' + shortVal({ gdp: d.max, pop: d.max, area: d.max, gdpPc: d.max }, S.metric)
          : (S.metric === 'gdpPc' ? (v / 1e4).toFixed(1)
            : fmt(v, S.metric === 'area' && v < 100 ? 1 : 0)));
      cells += '<span class="lg-row"><i style="background:' + RAMP[i] + '"></i>' + esc(lab) + '</span>';
    }
    el.legend.innerHTML = '<div class="lg-cap">按' + esc(m.label) + '着色 · ' + esc(m.unit || '分类') + '</div>' + cells +
      '<div class="lg-note">' + esc(m.hint) + '；颜色越亮数值越大（对数分级）。</div>';
  }

  /* ── 标注（HTML 叠层，不依赖地图字体服务） ── */
  function setLabels() {
    var items = S.main.map(function (f) {
      var p = f.properties, a = p.label;
      return {
        text: p.short, lng: a[0], lat: a[1], kind: 'tag', size: 12,
        color: S.metric === 'group' ? (GROUP_COLORS[p.groupZh] || '#fff') : '#e2e8f0',
        active: !!(S.sel && S.sel.properties.gid === p.gid)
      };
    });
    app.setLabels(items);
  }

  /* ── 目录 ── */
  function renderList() {
    var arr = S.main.slice();
    if (S.metric === 'group') {
      arr.sort(function (a, b) {
        var o = ROLE_ORDER[a.properties.groupZh] - ROLE_ORDER[b.properties.groupZh];
        return o || val(b.properties, 'gdp') - val(a.properties, 'gdp');
      });
    } else {
      arr.sort(function (a, b) { return val(b.properties, S.metric) - val(a.properties, S.metric); });
    }
    var d = S.metric === 'group' ? null : domain(S.metric);
    el.cityList.innerHTML = arr.map(function (f, i) {
      var p = f.properties;
      var w = 100;
      if (d) {
        var v = Math.max(val(p, S.metric), 0.01);
        w = 12 + 88 * (Math.log10(v) - d.lo) / (d.hi - d.lo || 1);
        w = Math.max(8, Math.min(100, w));
      }
      var text = S.metric === 'group' ? p.roleZh : shortVal(p, S.metric);
      return '<button type="button" class="city-row' + (p.role === 'sar' ? ' sar' : '') +
        (S.sel && S.sel.properties.gid === p.gid ? ' active' : '') + '" data-gid="' + esc(p.gid) + '">' +
        '<span class="rk">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</span>' +
        '<span class="nm">' + esc(p.short) + '</span>' +
        '<span class="bar"><i style="width:' + w.toFixed(1) + '%"></i></span>' +
        '<span class="vl">' + esc(text) + '</span></button>';
    }).join('');
  }

  /* ── 选中 ── */
  function find(gid) {
    for (var i = 0; i < S.main.length; i++) if (S.main[i].properties.gid === String(gid)) return S.main[i];
    return null;
  }
  function select(f, move) {
    /* 命中来自 queryRenderedFeatures，属性中的数组可能被引擎转成字符串；
       统一换回 S.main 里的原始要素，保证 bbox / label 是真数组。 */
    var full = find(f.properties.gid);
    if (full) f = full;
    var p = f.properties;
    if (S.sel) {
      try { app.map.setFeatureState({ source: 'main', id: S.sel.properties.gid }, { selected: false }); } catch (_) {}
    }
    S.sel = f;
    try { app.map.setFeatureState({ source: 'main', id: p.gid }, { selected: true }); } catch (_) {}
    app.map.getSource('sel').setData({ type: 'FeatureCollection', features: [f] });
    app.setVisible('city-halo', true);
    app.setVisible('city-sel', true);

    var col = GROUP_COLORS[p.groupZh] || '#f0b429';
    app.setDetailOpen(true);
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', col);
    el.dtRole.textContent = p.roleZh;
    el.dtName.textContent = p.name;
    el.dtSub.textContent = p.nameEn + ' · ' + p.shore + ' · ' +
      (p.role === 'sar' ? '中华人民共和国特别行政区' : '广东省辖地级市');

    el.dtGdp.textContent = fmt(p.gdp, 0);
    el.dtPop.textContent = fmt(p.pop, 2);
    el.dtArea.textContent = fmt(p.area, p.area < 100 ? 2 : 0);
    el.dtPc.textContent = (p.gdpPc / 1e4).toFixed(2);
    el.dtIdx.textContent = '+' + (p.gdpIdx - 100).toFixed(1);
    el.dtPort.textContent = fmt(p.port, 0);
    el.dtBlurb.textContent = p.blurb;
    el.dtTitle.textContent = p.title;
    el.dtTrade.textContent = fmt(p.trade, 0) + ' 亿美元 · 11 城第 ' + rank(p, 'trade');
    el.dtRank.textContent = 'GDP 第 ' + rank(p, 'gdp') + ' · 人口 第 ' + rank(p, 'pop') +
      ' · 面积 第 ' + rank(p, 'area') + ' · 人均 第 ' + rank(p, 'gdpPc');
    el.dtTags.innerHTML = String(p.tags).split('|').map(function (t) { return '<i>' + esc(t) + '</i>'; }).join('');

    var foot = '<span>指标口径：2024 年 · 广州统计年鉴 2025 附录 5</span><span>行政区划代码 ' + esc(p.gid) + '</span>';
    if (p.role === 'sar') foot += '<span>本地生产总值 / 年中人口，与内地口径不同</span>';
    el.dtFooter.innerHTML = foot;

    setLabels();
    renderList();
    app.pulse({ glowId: 'city-halo', selId: 'city-sel', baseWidth: 3, maxExtra: 4, duration: 1500 });
    if (move) app.fitBounds(p.bbox, { withDetail: true, animate: true, maxZoom: 10 });
    try { history.replaceState(null, '', '#c/' + p.gid); } catch (_) {}
  }
  function clearSel() {
    if (S.sel) {
      try { app.map.setFeatureState({ source: 'main', id: S.sel.properties.gid }, { selected: false }); } catch (_) {}
    }
    S.sel = null;
    app.map.getSource('sel').setData(Thematic.EMPTY);
    app.setVisible('city-halo', false);
    app.setVisible('city-sel', false);
    app.setDetailOpen(false);
    el.detail.hidden = true;
    setLabels();
    renderList();
    try { history.replaceState(null, '', location.pathname + location.search); } catch (_) {}
  }

  /* ── 交互 ── */
  var HIT_LAYERS = ['city-fill', 'city-dot', 'city-dot-halo'];

  function bind() {
    var map = app.map;
    map.on('mousemove', function (e) {
      var f = map.queryRenderedFeatures(e.point, { layers: HIT_LAYERS })[0];
      if (!f) { map.getCanvas().style.cursor = ''; app.tooltip(null); return; }
      map.getCanvas().style.cursor = 'pointer';
      var p = f.properties;
      var m = METRICS[S.metric];
      var v = S.metric === 'group' ? p.groupZh : shortVal(p, S.metric);
      app.tooltip('<b>' + esc(p.name) + '</b><br><span style="color:#9fb4cd">' +
        esc(m.label) + '：' + esc(v) + '</span><br><span style="color:#64748b">点开看城市名片</span>',
        e.point.x, e.point.y);
    });
    map.on('mouseleave', function () { app.tooltip(null); });

    /* 统一在这里判定命中：面层与点层可能同时命中，分图层绑定会重复 select 两次 */
    map.on('click', function (e) {
      var hit = map.queryRenderedFeatures(e.point, { layers: HIT_LAYERS });
      if (!hit.length) { clearSel(); return; }
      app.collapseDrawer();
      select(hit[0], true);
    });

    el.metricSeg.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      S.metric = b.dataset.metric;
      Array.prototype.forEach.call(el.metricSeg.children, function (x) { x.classList.toggle('active', x === b); });
      recolor(); renderLegend(); updateNote(); setLabels(); renderList();
    });
    el.cityList.addEventListener('click', function (e) {
      var b = e.target.closest('.city-row'); if (!b) return;
      var f = find(b.dataset.gid);
      if (f) { app.collapseDrawer(); select(f, true); }
    });
  }
  function updateNote() {
    el.metricNote.innerHTML = METRICS[S.metric].note;
    el.listHint.textContent = METRICS[S.metric].listHint;
  }

  /* ── 启动 ── */
  var app = Thematic.create({
    slug: 'gba-cities',
    view: { center: [113.72, 23.02], zoom: 7.4, minZoom: 5.5, maxZoom: 12 },
    bounds: [111.36, 21.56, 115.43, 24.39],
    boundsMobile: [112.05, 21.80, 115.10, 24.15],
    extent: [111, 21, 116, 25],
    graticuleStep: 1,
    province: false,
    imgPaint: {
      'raster-brightness-max': 0.60,
      'raster-brightness-min': 0.04,
      'raster-saturation': -0.38,
      'raster-contrast': 0.08
    },
    sources: {
      main: { data: 'data/cities.geojson', promoteId: 'gid' },
      dots: { data: Thematic.EMPTY },
      sel: { data: Thematic.EMPTY }
    },
    layers: [
      { id: 'city-fill', type: 'fill', source: 'main',
        paint: {
          'fill-color': ['coalesce', ['get', 'fill'], '#1a5b85'],
          'fill-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 0.20, 0.66]
        } },
      { id: 'city-line', type: 'line', source: 'main',
        paint: { 'line-color': '#ffffff', 'line-width': 1, 'line-opacity': 0.5 } },
      /* 澳门仅 33.3 km²，湾区总览下不足一个像素：用可点击的圆点补位 */
      { id: 'city-dot-halo', type: 'circle', source: 'dots',
        paint: { 'circle-radius': 12, 'circle-color': ['get', 'dotColor'], 'circle-opacity': 0.24, 'circle-blur': 0.7 } },
      { id: 'city-dot', type: 'circle', source: 'dots',
        paint: { 'circle-radius': 4.5, 'circle-color': '#ffffff',
                 'circle-stroke-color': ['get', 'dotColor'], 'circle-stroke-width': 2 } },
      { id: 'city-halo', type: 'line', source: 'sel', layout: { visibility: 'none' },
        paint: { 'line-color': '#ffd166', 'line-width': 5, 'line-opacity': 0.3, 'line-blur': 2 } },
      { id: 'city-sel', type: 'line', source: 'sel', layout: { visibility: 'none' },
        paint: { 'line-color': '#ffffff', 'line-width': 2.2, 'line-opacity': 0.95 } }
    ],
    onReady: boot,
    onOverview: function () { clearSel(); app.fitAll({ animate: true }); },
    onClose: function () { clearSel(); }
  });

  function boot() {
    fetch('data/cities.geojson').then(function (r) { return r.json(); }).then(function (fc) {
      S.main = fc.features;

      /* 小面积城市在总览尺度下不可点：用包围盒中心生成一个可点击圆点 */
      var dots = S.main.filter(function (f) { return val(f.properties, 'area') < 100; }).map(function (f) {
        var p = f.properties, b = p.bbox;
        var props = Object.assign({}, p);
        props.dotColor = GROUP_COLORS[p.groupZh] || '#f0b429';
        return { type: 'Feature', properties: props,
                 geometry: { type: 'Point', coordinates: [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2] } };
      });
      app.map.getSource('dots').setData({ type: 'FeatureCollection', features: dots });

      el.fMain.textContent = fmt(S.main.length, 0);
      el.fArea.textContent = (S.main.reduce(function (a, f) { return a + val(f.properties, 'area'); }, 0) / 1e4).toFixed(2);
      el.fPop.textContent = fmt(S.main.reduce(function (a, f) { return a + val(f.properties, 'pop'); }, 0), 0);
      el.fGdp.textContent = (S.main.reduce(function (a, f) { return a + val(f.properties, 'gdp'); }, 0) / 1e4).toFixed(2);

      recolor(); renderLegend(); updateNote(); renderList(); bind();
      app.fitAll({ animate: false });
      setLabels();
      window.__app = app;
      window.__gba = { app: app, selectByGid: function (g) { var f = find(g); if (f) select(f, true); } };
      window.__gbaCitiesReady = true;

      var m = location.hash.match(/^#c\/(\d{6})$/);
      if (m) { var f = find(m[1]); if (f) select(f, true); }
    }).catch(function (err) {
      console.error('[gba-cities] 数据加载失败', err);
      el.detail.hidden = false;
      el.dtBlurb.textContent = '数据加载失败，请刷新重试。';
    });
  }
})();
