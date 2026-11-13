/* 投影实验室 · Projection Lab · truesize 第二视图
   零依赖：5 种投影公式全部本地实现，不加载 d3 / 任何 CDN。
   数据复用 data/countries.geojson（反子午线已由 _g/cut_antimeridian.py 处理；
   南极洲保留的那条 ±180 底边在 5 种投影下两端 Y 相同，画出来正是底边，不会横贯全图）。
   合规：台湾已并入 China 要素，不单列；不叠加境外底图。 */
(function () {
  'use strict';

  var D2R = Math.PI / 180;
  var W = 1000, H = 620, PAD = 30;
  var NS = 'http://www.w3.org/2000/svg';

  var PROJS = [
    { id: 'mercator', name: '墨卡托', en: 'Web Mercator', note: '1569 年 · 为航海设计，保角不保面积。高纬被拉大，全球被拉成正方形。' },
    { id: 'equalEarth', name: '平等地球', en: 'Equal Earth', note: '2018 年 · 等积伪圆柱投影。2026 年联大《纠正地图》决议点名推荐。' },
    { id: 'gallPeters', name: '高尔-彼得斯', en: 'Gall–Peters', note: '1974 年 · 等积圆柱投影。面积对了，大陆形状被纵向拉长。' },
    { id: 'winkel3', name: '温克尔三重', en: 'Winkel Tripel', note: '1921 年 · 美国国家地理学会采用。面积、形状、距离各让一步。' },
    { id: 'azEq', name: '等距方位', en: 'Azimuthal equidistant', note: '以北极为中心 · 联合国徽章采用的距离投影，地球呈圆形。' }
  ];

  /* 非洲大陆国家集合（用本数据里的 name_zh / name 原文）。
     排除 W. Sahara、索马里兰等单列争议实体；岛国在 110m 数据中未收录，不影响量级。 */
  var AFRICA = ('阿尔及利亚|安哥拉|贝宁|博茨瓦纳|布基纳法索|布隆迪|喀麦隆|中非共和国|乍得|' +
    '刚果（布）|刚果（金）|Côte d\'Ivoire|吉布提|埃及|Eq. Guinea|厄立特里亚|eSwatini|埃塞俄比亚|' +
    '加蓬|冈比亚|加纳|Guinea-Bissau|几内亚|肯尼亚|莱索托|利比里亚|利比亚|马达加斯加|马拉维|马里|' +
    '毛里塔尼亚|摩洛哥|莫桑比克|纳米比亚|尼日尔|尼日利亚|卢旺达|S. Sudan|苏丹|塞内加尔|塞拉利昂|' +
    '索马里|南非|坦桑尼亚|多哥|突尼斯|乌干达|赞比亚|津巴布韦').split('|');

  var state = {
    fc: null, id: 'mercator', fits: {}, dById: {}, els: [],
    byName: {}, africa: [], greenland: null, china: null,
    realRatio: 0, ready: false
  };

  /* ── 投影公式：输入经度 λ、纬度 φ（弧度），输出 [X, Y]，Y 向下为正 ── */
  function raw(id, lam, phi) {
    var A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796;
    var M = Math.sqrt(3) / 2;
    if (id === 'mercator') {
      var lim = 85.05112878 * D2R;
      var p = Math.max(-lim, Math.min(lim, phi));
      return [lam, -Math.log(Math.tan(Math.PI / 4 + p / 2))];
    }
    if (id === 'equalEarth') {
      var th = Math.asin(Math.max(-1, Math.min(1, M * Math.sin(phi))));
      var t2 = th * th, t6 = t2 * t2 * t2;
      var x = lam * Math.cos(th) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)));
      var y = A1 * th + A2 * t2 * th + A3 * t6 * th + A4 * t6 * t2 * th;
      return [x, -y];
    }
    if (id === 'gallPeters') {
      var c = Math.SQRT1_2;
      return [lam * c, -Math.sin(phi) / c];
    }
    if (id === 'winkel3') {
      var cp = Math.cos(phi), half = lam / 2;
      var cc = Math.max(-1, Math.min(1, cp * Math.cos(half)));
      var a = Math.acos(cc);
      var sinc = Math.abs(a) < 1e-9 ? 1 : Math.sin(a) / a;
      var xa = 2 * cp * Math.sin(half) / sinc;
      var ya = Math.sin(phi) / sinc;
      /* 标准纬线 φ0 = arccos(2/π)，故 cos φ0 = 2/π */
      return [(xa + lam * (2 / Math.PI)) / 2, -(ya + phi) / 2];
    }
    /* 北极中心等距方位：ρ = 90° − φ，x = ρ·sinλ，y = ρ·cosλ */
    var rho = Math.PI / 2 - phi;
    return [rho * Math.sin(lam), rho * Math.cos(lam)];
  }

  function computeFit(id) {
    var minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
    var lng, lat, r;
    for (lng = -180; lng <= 180; lng += 6) {
      for (lat = -85; lat <= 85; lat += 5) {
        r = raw(id, lng * D2R, lat * D2R);
        if (!isFinite(r[0]) || !isFinite(r[1])) continue;
        if (r[0] < minx) minx = r[0];
        if (r[0] > maxx) maxx = r[0];
        if (r[1] < miny) miny = r[1];
        if (r[1] > maxy) maxy = r[1];
      }
    }
    var s = Math.min((W - 2 * PAD) / (maxx - minx), (H - 2 * PAD) / (maxy - miny));
    return { s: s, cx: (minx + maxx) / 2, cy: (miny + maxy) / 2 };
  }

  function px(id, lng, lat) {
    var f = state.fits[id];
    var r = raw(id, lng * D2R, lat * D2R);
    return [(r[0] - f.cx) * f.s + W / 2, (r[1] - f.cy) * f.s + H / 2];
  }
  function n(v) { return Math.round(v * 10) / 10; }

  function ringPath(id, ring) {
    var out = [], p, i;
    for (i = 0; i < ring.length; i++) {
      p = px(id, ring[i][0], ring[i][1]);
      out.push((i ? 'L' : 'M') + n(p[0]) + ' ' + n(p[1]));
    }
    return out.join('') + 'Z';
  }

  function polygons(geom) {
    if (!geom) return [];
    if (geom.type === 'Polygon') return [geom.coordinates];
    if (geom.type === 'MultiPolygon') return geom.coordinates;
    return [];
  }
  function featurePath(id, f) {
    var out = [], polys = polygons(f.geometry), i, j;
    for (i = 0; i < polys.length; i++)
      for (j = 0; j < polys[i].length; j++) out.push(ringPath(id, polys[i][j]));
    return out.join('');
  }

  /* 屏幕面积（像素²）：外环减内环，用来量化「看起来有多大」 */
  function ringArea2(id, ring) {
    var s = 0, p, q, i;
    for (i = 0; i < ring.length; i++) {
      p = px(id, ring[i][0], ring[i][1]);
      q = px(id, ring[(i + 1) % ring.length][0], ring[(i + 1) % ring.length][1]);
      s += p[0] * q[1] - q[0] * p[1];
    }
    return Math.abs(s / 2);
  }
  function screenArea(id, f) {
    var t = 0, polys = polygons(f.geometry), i, j, r;
    for (i = 0; i < polys.length; i++) {
      for (j = 0; j < polys[i].length; j++) {
        r = ringArea2(id, polys[i][j]);
        t += j === 0 ? r : -r;
      }
    }
    return Math.max(0, t);
  }

  /* ── 经纬网 ── */
  function graticulePath(id) {
    var out = [], lng, lat, pts, i, p;
    for (lat = -60; lat <= 60; lat += 30) {
      pts = [];
      for (lng = -180; lng <= 180; lng += 6) { p = px(id, lng, lat); pts.push(n(p[0]) + ' ' + n(p[1])); }
      out.push('M' + pts.join('L'));
    }
    for (lng = -180; lng <= 180; lng += 30) {
      pts = [];
      for (lat = -85; lat <= 85; lat += 5) { p = px(id, lng, lat); pts.push(n(p[0]) + ' ' + n(p[1])); }
      out.push('M' + pts.join('L'));
    }
    return out.join('');
  }

  /* ── 主画布 ── */
  function svgEl(tag, attrs) {
    var e = document.createElementNS(NS, tag), k;
    for (k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
    return e;
  }

  function buildCanvas() {
    var g = document.getElementById('labCountries');
    if (!g) return;
    var i, f, p, title, nm;
    for (i = 0; i < state.fc.features.length; i++) {
      f = state.fc.features[i];
      nm = f.properties.name_zh || f.properties.name;
      p = svgEl('path', { 'fill-rule': 'evenodd', 'stroke-width': '0.7' });
      title = svgEl('title', {});
      title.textContent = nm + ' · 真实面积 ' + fmtKm2(f.properties.area_km2);
      p.appendChild(title);
      g.appendChild(p);
      state.els.push({ el: p, f: f, nm: nm });
    }
    var thumbs = document.getElementById('labThumbs');
    PROJS.forEach(function (pr) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'lt-item'; b.setAttribute('data-id', pr.id);
      var s = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'xMidYMid meet' });
      s.appendChild(svgEl('path', { d: graticulePath(pr.id), class: 'lt-grid' }));
      b.appendChild(s);
      var cap = document.createElement('span');
      cap.className = 'lt-cap';
      cap.textContent = pr.name;
      b.appendChild(cap);
      thumbs.appendChild(b);
      b.addEventListener('click', function () { setProjection(pr.id); });
    });
  }

  function fmtKm2(v) {
    if (v == null) return '—';
    return (Math.round(v / 10000) / 100).toFixed(2) + ' 万 km²';
  }

  function bboxOfPath(d) {
    var nums = d.match(/-?\d+(\.\d+)?/g) || [];
    var minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity, i, x, y;
    for (i = 0; i + 1 < nums.length; i += 2) {
      x = parseFloat(nums[i]); y = parseFloat(nums[i + 1]);
      if (x < minx) minx = x; if (x > maxx) maxx = x;
      if (y < miny) miny = y; if (y > maxy) maxy = y;
    }
    return { cx: (minx + maxx) / 2, cy: (miny + maxy) / 2, top: miny };
  }

  function renderMarks(id) {
    var box = document.getElementById('labMarks');
    box.textContent = '';
    var marks = [
      { d: state.dById[id][state.idxGreenland], label: '格陵兰', color: '#ffd98a' },
      { d: state.africa.map(function (o) { return state.dById[id][o.i]; }).join(''), label: '非洲', color: '#9fe1cb' },
      { d: state.dById[id][state.idxChina], label: '中国', color: '#b5d4f4' }
    ];
    marks.forEach(function (m) {
      if (!m.d) return;
      var b = bboxOfPath(m.d);
      if (!isFinite(b.cx)) return;
      var t = svgEl('text', {
        x: n(b.cx), y: n(b.top - 9), 'text-anchor': 'middle',
        fill: m.color, 'font-size': '15', 'font-weight': '600',
        stroke: '#060b14', 'stroke-width': '3.5', 'paint-order': 'stroke'
      });
      t.textContent = m.label;
      box.appendChild(t);
    });
  }

  function setProjection(id) {
    if (!state.ready) return;
    state.id = id;
    var pr = PROJS.filter(function (o) { return o.id === id; })[0];
    var i, e, cls, isAfrica, isG, isC;
    var africaSet = {};
    state.africa.forEach(function (o) { africaSet[o.i] = 1; });
    for (i = 0; i < state.els.length; i++) {
      e = state.els[i];
      e.el.setAttribute('d', state.dById[id][i]);
      isAfrica = !!africaSet[i];
      isG = i === state.idxGreenland;
      isC = i === state.idxChina;
      cls = isG ? 'lp-greenland' : (isC ? 'lp-china' : (isAfrica ? 'lp-africa' : 'lp-plain'));
      e.el.setAttribute('class', 'lp ' + cls);
    }
    document.getElementById('labGrid').setAttribute('d', graticulePath(id));
    renderMarks(id);

    /* 读数：同一份轮廓，换投影后屏幕面积比怎么变 */
    var gA = screenArea(id, state.greenland);
    var aA = 0;
    state.africa.forEach(function (o) { aA += screenArea(id, o.f); });
    var vr = gA > 0 ? aA / gA : 0;
    var mx = Math.max(gA, aA, 1);
    setText('lcName', pr.name);
    setText('lcProjEn', pr.en);
    setText('lcVisual', vr.toFixed(1));
    setText('lcReal', state.realRatio.toFixed(1));
    document.getElementById('lcBarG').style.width = (100 * gA / mx).toFixed(1) + '%';
    document.getElementById('lcBarA').style.width = (100 * aA / mx).toFixed(1) + '%';
    setText('lcNote', pr.note);
    setText('labProjNote', pr.note);
    document.getElementById('labMercNote').hidden = id !== 'mercator';

    var btns = document.querySelectorAll('[data-proj], .lt-item');
    for (i = 0; i < btns.length; i++) {
      var bid = btns[i].getAttribute('data-proj') || btns[i].getAttribute('data-id');
      btns[i].classList.toggle('is-active', bid === id);
    }
  }

  function setText(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }

  /* ── 视图切换 ── */
  function setMode(mode) {
    var isLab = mode === 'lab';
    document.body.classList.toggle('mode-lab', isLab);
    document.getElementById('lab').hidden = !isLab;
    document.getElementById('paneDrag').hidden = isLab;
    document.getElementById('paneLab').hidden = !isLab;
    var tabs = document.querySelectorAll('.mt-btn');
    for (var i = 0; i < tabs.length; i++)
      tabs[i].classList.toggle('is-active', tabs[i].getAttribute('data-mode') === mode);
  }
  function bindTabs() {
    var tabs = document.querySelectorAll('.mt-btn'), i;
    for (i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () { setMode(this.getAttribute('data-mode')); });
    }
    var projs = document.getElementById('labProjs');
    PROJS.forEach(function (pr) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'lp-chip'; b.setAttribute('data-proj', pr.id);
      b.innerHTML = '<b></b><span></span>';
      b.querySelector('b').textContent = pr.name;
      b.querySelector('span').textContent = pr.en;
      if (pr.id === 'equalEarth') b.classList.add('is-star');
      b.addEventListener('click', function () { setProjection(pr.id); });
      projs.appendChild(b);
    });
  }

  /* ── 数据 ── */
  function load() {
    fetch('data/countries.geojson')
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (fc) {
        state.fc = fc;
        var i, f, nm, set = {};
        AFRICA.forEach(function (s) { set[s] = 1; });
        for (i = 0; i < fc.features.length; i++) {
          f = fc.features[i];
          nm = f.properties.name_zh || f.properties.name;
          state.byName[nm] = { f: f, i: i };
          if (set[nm]) state.africa.push({ f: f, i: i });
          if (nm === '格陵兰') { state.greenland = f; state.idxGreenland = i; }
          if (nm === '中国') { state.china = f; state.idxChina = i; }
        }
        var realAfrica = 0;
        state.africa.forEach(function (o) { realAfrica += (o.f.properties.area_km2 || 0); });
        state.realRatio = realAfrica / (state.greenland.properties.area_km2 || 1);

        PROJS.forEach(function (pr) {
          state.fits[pr.id] = computeFit(pr.id);
          state.dById[pr.id] = fc.features.map(function (f2) { return featurePath(pr.id, f2); });
        });
        buildCanvas();
        document.getElementById('labLoading').hidden = true;
        state.ready = true;
        setProjection(state.id);
      })
      .catch(function (err) {
        console.error('[projection-lab] 数据加载失败', err);
        setText('labLoading', '国界数据加载失败，请刷新页面');
      });
  }

  function init() {
    if (!document.getElementById('lab')) return;
    bindTabs();
    /* 支持直接链到实验室视图：index.html#lab */
    if (typeof location !== 'undefined' && location.hash === '#lab') setMode('lab');
    load();
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
