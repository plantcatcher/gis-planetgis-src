/* ─────────────────────────────────────────────────────────────
   专题地图共享运行时 · PlanetGIS
   目的：把「底图 / 省界 / 经纬网 / 标注 / 命中 / 视野 / 浮层 / 原语动画」这些
   每张专题图都要的东西收拢到一处，专题的 app.js 只写自己的图层与叙事。

   典型用法：
     var app = Thematic.create({
       slug: 'cn-terrain-steps',
       view: { center: [104, 35], zoom: 4.2, minZoom: 3, maxZoom: 9 },
       bounds: [73, 17, 136, 55],
       sources: { stage: { data: 'data/stages.json' } },
       layers: [
         { id: 'stage-fill', type: 'fill', source: 'stage',
           paint: { 'fill-color': ['get','color'], 'fill-opacity': 0.45 } }
       ],
       onReady: function (app) { ... }
     });

   DOM 约定（专题的 index.html 需提供，缺省即跳过该功能）：
     #map #labels #intro(#introBar #introBody) #detail(#dtClose)
     #panel(#panelHead #panelToggle #panelBody) input[name="basemap"]
     [data-toggle-layer="layerId"] 复选框
   ───────────────────────────────────────────────────────────── */
(function (global) {
  'use strict';

  var PROV_URL = '/maps/_shared/china-provinces.json';
  var BG = '#070d18';

  /* 高德免 key 瓦片（GCJ-02，带 CORS），subdomain 01~04 负载均衡 */
  function amapTiles(styleId) {
    return ['01', '02', '03', '04'].map(function (s) {
      return 'https://wprd' + s + '.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=' + styleId;
    });
  }

  function isMobile() { return global.innerWidth <= 900; }
  function isShort() { return isMobile() && global.innerHeight <= 520; }

  function fmt(n, d) {
    var v = Number(n);
    if (!isFinite(v)) return '—';
    var s = v.toFixed(d === undefined ? 0 : d);
    var parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* 经纬网格：按 extent 生成 step 度间隔的线 */
  function graticuleFC(extent, step) {
    var w = extent[0], s = extent[1], e = extent[2], n = extent[3];
    var feats = [], x, y, c;
    for (x = Math.ceil(w / step) * step; x <= e; x += step) {
      c = []; for (y = s; y <= n; y += 0.5) c.push([x, y]);
      feats.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: c } });
    }
    for (y = Math.ceil(s / step) * step; y <= n; y += step) {
      c = []; for (x = w; x <= e; x += 0.5) c.push([x, y]);
      feats.push({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: c } });
    }
    return { type: 'FeatureCollection', features: feats };
  }

  /* 几何 / bbox 互转 */
  function bboxOf(geo) {
    var b = [Infinity, Infinity, -Infinity, -Infinity];
    function walk(c) {
      if (typeof c[0] === 'number') {
        if (c[0] < b[0]) b[0] = c[0];
        if (c[1] < b[1]) b[1] = c[1];
        if (c[0] > b[2]) b[2] = c[0];
        if (c[1] > b[3]) b[3] = c[1];
      } else { for (var i = 0; i < c.length; i++) walk(c[i]); }
    }
    if (geo) walk(geo.coordinates || geo);
    return b[0] === Infinity ? null : b;
  }
  function padBbox(b, r) { return [b[0] - r, b[1] - r, b[2] + r, b[3] + r]; }

  /* 沿折线按里程占比取锚点（标注用） */
  function pointAt(coords, frac) {
    if (!coords || coords.length < 2) return coords && coords[0];
    var acc = [0], i, lo1, la1, lo2, la2, h, total, target, best = 0, bd = Infinity;
    for (i = 1; i < coords.length; i++) {
      lo1 = coords[i - 1][0] * Math.PI / 180; la1 = coords[i - 1][1] * Math.PI / 180;
      lo2 = coords[i][0] * Math.PI / 180; la2 = coords[i][1] * Math.PI / 180;
      h = Math.sin((la2 - la1) / 2) * Math.sin((la2 - la1) / 2) +
        Math.cos(la1) * Math.cos(la2) * Math.sin((lo2 - lo1) / 2) * Math.sin((lo2 - lo1) / 2);
      acc.push(acc[i - 1] + 2 * Math.asin(Math.min(1, Math.sqrt(h))));
    }
    total = acc[acc.length - 1] * (frac == null ? 0.5 : frac);
    for (i = 0; i < acc.length; i++) { var d = Math.abs(acc[i] - total); if (d < bd) { bd = d; best = i; } }
    return coords[best];
  }

  /* 把线按里程切成 n 段（揭示动画用） */
  function buildSlices(coords, n) {
    var total = 0, acc = [0], i;
    for (i = 1; i < coords.length; i++) {
      var dx = coords[i][0] - coords[i - 1][0], dy = coords[i][1] - coords[i - 1][1];
      total += Math.sqrt(dx * dx + dy * dy); acc.push(total);
    }
    var out = [], k = 1;
    for (i = 0; i < n; i++) {
      var t = total * (i + 1) / n;
      while (k < acc.length - 1 && acc[k] < t) k++;
      out.push(coords.slice(0, Math.max(2, k + 1)));
    }
    return out;
  }

  /* 归一化墨卡托（x/y ∈ [0,1]，y 向下） */
  function mercX(lng) { return (lng + 180) / 360; }
  function mercY(lat) {
    var s = Math.sin(lat * Math.PI / 180);
    return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI);
  }
  function invMercY(y) {
    var n = Math.PI - 2 * Math.PI * y;
    return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  }

  var EMPTY = { type: 'FeatureCollection', features: [] };

  /* MapLibre 的缩放口径：worldSize = TSIZE * 2^zoom，TSIZE = 512（不是 OSM/Leaflet 的 256）。
     整个引擎里凡是要把「归一化墨卡托跨度」换成像素，都必须用这个常量。 */
  var TSIZE = 512;

  /* ── 实例 ──────────────────────────────────────────────── */
  function Instance(opts) {
    var self = this;
    this.opts = opts || {};
    this.slug = this.opts.slug || 'thematic';
    this._labels = [];
    this._labelRaf = 0;
    this._fx = { raf: 0, token: 0, slices: [], idx: -1 };
    this._provinceFill = this.opts.province && this.opts.province.fill;

    var el = this.el = {
      labels: document.getElementById('labels'),
      intro: document.getElementById('intro'),
      introBar: document.getElementById('introBar'),
      introBarText: document.getElementById('introBarText'),
      detail: document.getElementById('detail'),
      panelBody: document.getElementById('panelBody'),
      panelToggle: document.getElementById('panelToggle'),
      strip: document.getElementById('strip'),
      legend: document.getElementById('legend')
    };

    /* 1) 样式：底图 + 省界 + 经纬网 + 专题图层 */
    var sources = {
      amap_vec: { type: 'raster', tiles: amapTiles(7), tileSize: 256, attribution: '高德地图' },
      amap_img: { type: 'raster', tiles: amapTiles(6), tileSize: 256, attribution: '高德地图' },
      prov: { type: 'geojson', data: PROV_URL },
      grat: { type: 'geojson', data: graticuleFC(this.opts.extent || this.opts.bounds || [73, 17, 136, 55], this.opts.graticuleStep || 2) }
    };
    Object.keys(this.opts.sources || {}).forEach(function (k) {
      var s = self.opts.sources[k];
      sources[k] = typeof s === 'string' ? { type: 'geojson', data: s } : Object.assign({ type: 'geojson' }, s);
      if (!sources[k].data) sources[k].data = EMPTY;
    });

    var provLayers = [];
    if (!this.opts.province || this.opts.province.line !== false) {
      if (this._provinceFill) {
        provLayers.push({
          id: 'prov-fill', type: 'fill', source: 'prov',
          paint: { 'fill-color': '#0e1a2a', 'fill-opacity': 0 }
        });
      }
      provLayers.push({
        id: 'prov-line', type: 'line', source: 'prov',
        paint: { 'line-color': '#b9cbe2', 'line-width': 0.7, 'line-opacity': 0.28 }
      });
    }

    var layers = [
      { id: 'bg', type: 'background', paint: { 'background-color': this.opts.background || BG } },
      { id: 'amap-vec', type: 'raster', source: 'amap_vec', layout: { visibility: 'none' } },
      { id: 'amap-img', type: 'raster', source: 'amap_img', layout: { visibility: 'none' } },
      { id: 'grat', type: 'line', source: 'grat', layout: { visibility: 'none' },
        paint: { 'line-color': '#7fa4cc', 'line-width': 0.5, 'line-opacity': 0.18 } }
    ].concat(provLayers);

    (this.opts.layers || []).forEach(function (l) { layers.push(l); });

    var map = this.map = new maplibregl.Map({
      container: this.opts.container || 'map',
      style: { version: 8, sources: sources, layers: layers },
      center: (this.opts.view || {}).center || [104, 35],
      zoom: (this.opts.view || {}).zoom || 4,
      minZoom: (this.opts.view || {}).minZoom || 3,
      maxZoom: (this.opts.view || {}).maxZoom || 12,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    if (this.opts.scale !== false) map.addControl(new maplibregl.ScaleControl({ maxWidth: 110, unit: 'metric' }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    if (isMobile() && map.touchZoomRotate) map.touchZoomRotate.disableRotation();
    global.__map = map;

    ['move', 'zoom', 'resize'].forEach(function (ev) { map.on(ev, function () { self._requestLabels(); }); });
    global.addEventListener('resize', function () { self._requestLabels(); });

    map.once('load', function () {
      /* 卫星影像压暗（按专题覆盖，不写则不压暗，保证不影响其他专题图） */
      if (self.opts.imgPaint) {
        Object.keys(self.opts.imgPaint).forEach(function (k) {
          try { map.setPaintProperty('amap-img', k, self.opts.imgPaint[k]); } catch (_) {}
        });
      }
      /* 样式就绪后按 UI 选中态落实底图（构造期样式未加载，setVisible 会静默失效） */
      var bm = document.querySelector('input[name="basemap"]:checked');
      if (bm) self.setBasemap(bm.value);
      /* 省界着色（若声明） */
      if (self._provinceFill) {
        map.setPaintProperty('prov-fill', 'fill-color', ['case',
          ['==', ['typeof', ['get', 'fillColor']], 'string'], ['get', 'fillColor'], '#0e1a2a']);
        map.setPaintProperty('prov-fill', 'fill-opacity', 0.72);
      }
      if (self.opts.onReady) self.opts.onReady(self);
    });

    this._bindLayoutControls();
    global.__app = this;   // 调试 / 封面脚本用
  }

  /* ── 视野 ───────────────────────────────────────────────── */
  Instance.prototype.viewPadding = function (withDetail) {
    var el = this.el;
    var hasCard = withDetail && el.detail && !el.detail.hidden;
    if (isMobile()) {
      if (isShort()) {
        var r = hasCard ? Math.round(el.detail.getBoundingClientRect().width) + 26 : 18;
        return { left: 18, right: r, top: 18, bottom: 168 };
      }
      var top = 96;
      if (hasCard) top = Math.round(el.detail.getBoundingClientRect().height) + 30;
      return { left: 18, right: 18, top: Math.min(top, Math.round(global.innerHeight * 0.5)), bottom: 168 };
    }
    /* 桌面：左侧让开 352px 简介栏；右侧仅在详情卡展开时让开卡片宽度，
       否则只留一条窄边（否则总览会被挤小、再被 minZoom 顶回而溢出画面）。 */
    var right = hasCard ? Math.round(el.detail.getBoundingClientRect().width) + 28 : 72;
    return { left: 392, right: right, top: 78, bottom: 172 };
  };

  /* 自实现 fitBounds：Maplibre 内建的 padding 适配在宽扁容器下会只按高度约束，
     导致地图横向溢出到侧栏下面。这里直接用归一化墨卡托算缩放，取宽高两个约束的较小者，
     再按不对称 padding 把中心偏移到可用区中心。 */
  Instance.prototype.fitBounds = function (bbox, o) {
    o = o || {};
    var map = this.map;
    var pad = o.padding || this.viewPadding(o.withDetail);
    var cw = map.getContainer().clientWidth || global.innerWidth;
    var ch = map.getContainer().clientHeight || global.innerHeight;
    var w = Math.max(80, cw - (pad.left || 0) - (pad.right || 0));
    var h = Math.max(80, ch - (pad.top || 0) - (pad.bottom || 0));

    var x0 = mercX(bbox[0]), y0 = mercY(bbox[3]);   // 西北
    var x1 = mercX(bbox[2]), y1 = mercY(bbox[1]);   // 东南
    var dx = Math.max(Math.abs(x1 - x0), 1e-9);
    var dy = Math.max(Math.abs(y1 - y0), 1e-9);

    /* MapLibre 的 zoom 约定按 512px 瓦片（worldSize = 512 * 2^z），与 Leaflet/OSM 的
       256px 口径差整整 1 级。这里必须用 512，否则算出的 z 偏小 1 级、视野溢出被裁。 */
    var z = Math.min(Math.log2(w / (dx * TSIZE)), Math.log2(h / (dy * TSIZE)));
    z = Math.min(z, o.maxZoom == null ? 9 : o.maxZoom);
    z = Math.max(z, map.getMinZoom(), 0.2);

    var scale = TSIZE * Math.pow(2, z);
    /* 让「要素中心」落到「可用区中心」。可用区中心相对容器中心偏移 (padA - padB)/2，
       而屏幕坐标 = 容器中心 + (n - n_c) * scale，所以地图中心要朝反方向挪：
       n_c = n_target - (padA - padB) / (2 * scale)。符号写反会把地图推进侧栏下面。 */
    var cx = (x0 + x1) / 2 - ((pad.left || 0) - (pad.right || 0)) / 2 / scale;
    var cy = (y0 + y1) / 2 - ((pad.top || 0) - (pad.bottom || 0)) / 2 / scale;

    var target = { center: [cx * 360 - 180, invMercY(cy)], zoom: z, bearing: 0, pitch: 0 };
    if (o.animate === false) map.jumpTo(target);
    else map.easeTo(Object.assign({ duration: o.duration || 720 }, target));
    return target;
  };

  /* 框全部要素：传 bbox 或 GeoJSON 数组 */
  Instance.prototype.fitAll = function (o) {
    o = o || {};
    var b = this.opts.bounds;
    if (!b && o.features) {
      var bb = [Infinity, Infinity, -Infinity, -Infinity];
      o.features.forEach(function (f) {
        var x = bboxOf(f);
        if (x) { bb[0] = Math.min(bb[0], x[0]); bb[1] = Math.min(bb[1], x[1]); bb[2] = Math.max(bb[2], x[2]); bb[3] = Math.max(bb[3], x[3]); }
      });
      b = bb[0] === Infinity ? null : bb;
    }
    if (!b) return;
    this.fitBounds(b, o);
  };

  /* ── 命中 ───────────────────────────────────────────────── */
  Instance.prototype.pad = function () { return isMobile() ? 14 : 0; };
  Instance.prototype.pick = function (point, layers, pad) {
    var p = (pad === undefined ? this.pad() : pad);
    /* 归一化点：MapLibre 的 queryRenderedFeatures 只认 Point 实例或 [x,y] 数组；
       普通 {x,y} 对象会被当成「查全部」返回整层导致命中错乱。
       这里统一抽取成数值坐标，真实点击传来的 Point 行为不变。 */
    var px, py;
    if (point && point instanceof Array) { px = point[0]; py = point[1]; }
    else if (point && typeof point.x === 'number') { px = point.x; py = point.y; }
    else { px = NaN; py = NaN; }
    if (px == null || isNaN(px) || py == null || isNaN(py)) return null;
    var box = p > 0 ? [[px - p, py - p], [px + p, py + p]] : [px, py];
    var fs = this.map.queryRenderedFeatures(box, { layers: layers });
    return fs.length ? fs[0] : null;
  };

  /* ── 标注层 ─────────────────────────────────────────────── */
  /* items: [{id, text, lng, lat, color, kind:'dot'|'square'|'tag', active }] */
  Instance.prototype.setLabels = function (items) {
    this._labels = items || [];
    this._requestLabels();
  };
  Instance.prototype._requestLabels = function () {
    var self = this;
    if (this._labelRaf) return;
    this._labelRaf = global.requestAnimationFrame(function () {
      self._labelRaf = 0; self._paintLabels();
    });
  };
  Instance.prototype._paintLabels = function () {
    var el = this.el.labels;
    if (!el || !this._labels.length) { if (el) el.innerHTML = ''; return; }
    var ck = document.getElementById('ckLabel');
    if (ck && !ck.checked) { el.innerHTML = ''; return; }
    var bd = this.map.getBounds(), html = '', self = this;
    this._labels.forEach(function (it) {
      if (it.show === false) return;
      if (it.lng < bd.getWest() || it.lng > bd.getEast() || it.lat < bd.getSouth() || it.lat > bd.getNorth()) return;
      var p = self.map.project([it.lng, it.lat]);
      html += '<div class="tlabel' +
        (it.kind === 'square' ? ' is-square' : (it.kind === 'tag' ? ' is-tag' : '')) +
        (it.active ? ' is-active' : '') +
        '" style="left:' + p.x.toFixed(1) + 'px;top:' + p.y.toFixed(1) + 'px;--c:' + (it.color || '#fff') + '">' +
        esc(it.text) + '</div>';
    });
    el.innerHTML = html;
  };

  /* ── 悬停提示 ───────────────────────────────────────────── */
  Instance.prototype.tooltip = function (html, x, y) {
    if (!this._tip) {
      this._tip = document.createElement('div');
      this._tip.className = 'ttip';
      document.body.appendChild(this._tip);
    }
    if (html == null) { this._tip.style.display = 'none'; return; }
    this._tip.innerHTML = html;
    this._tip.style.display = 'block';
    this._tip.style.left = x + 'px';
    this._tip.style.top = y + 'px';
  };

  /* ── 图层 / 底图 ────────────────────────────────────────── */
  Instance.prototype.setVisible = function (id, on) {
    if (this.map.getLayer(id)) this.map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');
  };
  Instance.prototype.setBasemap = function (mode) {
    this.setVisible('amap-img', mode === 'img');
    this.setVisible('amap-vec', mode === 'vec');
    var opts = document.querySelectorAll('.bm-opt');
    for (var i = 0; i < opts.length; i++) {
      var r = opts[i].querySelector('input');
      opts[i].classList.toggle('active', !!(r && r.checked));
    }
  };
  /* 供专题在数据到位后写入省界填色（按 adcode 匹配） */
  Instance.prototype.fillProvinces = function (byAdcode, fallback) {
    var src = this.map.getSource('prov');
    if (!src) return;
    fetch(PROV_URL).then(function (r) { return r.json(); }).then(function (fc) {
      fc.features.forEach(function (f) {
        var c = byAdcode[String(f.properties.adcode)] || byAdcode[Number(f.properties.adcode)];
        f.properties.fillColor = c || fallback || 'rgba(255,255,255,0.03)';
      });
      src.setData(fc);
    });
  };

  /* ── 移动端抽屉 / 面板 ──────────────────────────────────── */
  Instance.prototype.setDrawer = function (collapsed) {
    var el = this.el;
    if (!el.intro) return;
    el.intro.classList.toggle('is-collapsed', collapsed);
    if (el.introBarText) el.introBarText.textContent = collapsed ? '展开' : '收起';
    if (el.introBar) el.introBar.setAttribute('aria-expanded', String(!collapsed));
  };
  Instance.prototype.collapseDrawer = function () {
    var el = this.el;
    if (isMobile() && el.intro && !el.intro.classList.contains('is-collapsed')) this.setDrawer(true);
  };
  Instance.prototype.setDetailOpen = function (open) {
    document.body.classList.toggle('has-detail', !!open);
  };
  Instance.prototype.scrollStripIntoView = function (btn) {
    if (!isMobile() || !btn || !btn.scrollIntoView) return;
    btn.scrollIntoView({ inline: 'center', block: 'nearest' });
  };

  Instance.prototype._bindLayoutControls = function () {
    var self = this, el = this.el;

    var bms = document.querySelectorAll('input[name="basemap"]');
    for (var i = 0; i < bms.length; i++) {
      bms[i].addEventListener('change', function () { self.setBasemap(this.value); });
    }
    var ckLabel = document.getElementById('ckLabel');
    if (ckLabel) ckLabel.addEventListener('change', function () { self._paintLabels(); });
    var ckBorder = document.getElementById('ckBorder');
    if (ckBorder) ckBorder.addEventListener('change', function () { self.setVisible('prov-line', this.checked); if (self.map.getLayer('prov-fill')) self.setVisible('prov-fill', this.checked); });
    var ckGrat = document.getElementById('ckGraticule');
    if (ckGrat) ckGrat.addEventListener('change', function () { self.setVisible('grat', this.checked); });

    Array.prototype.forEach.call(document.querySelectorAll('[data-toggle-layer]'), function (box) {
      box.addEventListener('change', function () {
        var ids = this.dataset.toggleLayer.split(',');
        for (var k = 0; k < ids.length; k++) self.setVisible(ids[k].trim(), this.checked);
      });
    });

    if (el.panelToggle) {
      el.panelToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var c = el.panelBody.classList.toggle('collapsed');
        this.textContent = c ? '＋' : '－';
      });
    }
    var panelHead = document.getElementById('panelHead');
    if (panelHead) {
      panelHead.addEventListener('click', function (e) {
        if (!isMobile()) return;
        if (e.target.id === 'panelToggle') return;
        var c = el.panelBody.classList.toggle('collapsed');
        if (el.panelToggle) el.panelToggle.textContent = c ? '＋' : '－';
      });
    }

    if (el.introBar) {
      el.introBar.addEventListener('click', function () {
        self.setDrawer(!el.intro.classList.contains('is-collapsed'));
      });
    }
    var btnOverview = document.getElementById('btnOverview');
    if (btnOverview) {
      btnOverview.addEventListener('click', function () {
        if (self.opts.onOverview) self.opts.onOverview(self);
        else self.fitAll({ animate: true });
      });
    }
    var dtClose = document.getElementById('dtClose');
    if (dtClose) dtClose.addEventListener('click', function () { if (self.opts.onClose) self.opts.onClose(self); });
    var dtReplay = document.getElementById('dtReplay');
    if (dtReplay) dtReplay.addEventListener('click', function () { if (self.opts.onReplay) self.opts.onReplay(self); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && self.opts.onClose) self.opts.onClose(self);
    });

    /* 移动端首屏：收起抽屉与面板，把地图让出来 */
    if (isMobile() && this.opts.autoCollapse !== false) {
      this.setDrawer(true);
      if (el.panelBody) el.panelBody.classList.add('collapsed');
      if (el.panelToggle) el.panelToggle.textContent = '＋';
    }
    var bm = document.querySelector('input[name="basemap"]:checked');
    /* 专题可声明默认底图（defaultBasemap），优先于 index.html 的默认选中态并同步 UI */
    if (self.opts.defaultBasemap && self.opts.defaultBasemap !== 'none') {
      var dr = document.querySelector('input[name="basemap"][value="' + self.opts.defaultBasemap + '"]');
      if (dr) {
        var rads = document.querySelectorAll('input[name="basemap"]');
        for (var j = 0; j < rads.length; j++) rads[j].checked = false;
        dr.checked = true; bm = dr;
      }
    }
    if (bm) this.setBasemap(bm.value);
  };

  /* ── 原语：脉冲发光 ─────────────────────────────────────── */
  /* glowId: 发光图层 id（line/fill/circle 都行）；selId: 可选，选中本体图层 */
  Instance.prototype.pulse = function (o) {
    var self = this, map = this.map, fx = this._fx;
    this.stopFx();
    var token = fx.token;
    var glowId = o.glowId, selId = o.selId;
    if (glowId && map.getLayer(glowId)) map.setLayoutProperty(glowId, 'visibility', 'visible');
    if (selId && map.getLayer(selId)) map.setLayoutProperty(selId, 'visibility', 'visible');
    var wBase = o.baseWidth || 12;
    var maxExtra = o.maxExtra == null ? 8 : o.maxExtra;
    var dur = o.duration || 1700;
    var t0 = performance.now();
    (function step(now) {
      if (token !== fx.token) return;
      var p = Math.min((now - t0) / dur, 1);
      var e = 0.16 + 0.84 * Math.pow(Math.sin(p * Math.PI * 3), 2);
      if (glowId && map.getLayer(glowId)) {
        try {
          map.setPaintProperty(glowId, 'line-width', wBase + e * maxExtra);
          map.setPaintProperty(glowId, 'line-opacity', 0.1 + e * 0.4);
        } catch (_) {}
      }
      if (p < 1) { fx.raf = requestAnimationFrame(step); return; }
      fx.raf = 0;
      if (glowId && map.getLayer(glowId)) {
        try {
          map.setPaintProperty(glowId, 'line-width', wBase + 2.6);
          map.setPaintProperty(glowId, 'line-opacity', o.restOpacity == null ? 0.32 : o.restOpacity);
        } catch (_) {}
      }
      if (o.then) o.then();
    })(t0);
  };

  /* ── 原语：线条揭示（水流 / 行军 / 迁徙） ───────────────── */
  /* o: {layerId, sourceId, coords, props, duration, onDone} */
  Instance.prototype.reveal = function (o) {
    var self = this, map = this.map, fx = this._fx;
    var src = map.getSource(o.sourceId);
    if (!src) return;
    var n = o.coords.length > 1200 ? 34 : 24;
    fx.slices = buildSlices(o.coords, n);
    fx.idx = -1;
    if (map.getLayer(o.layerId)) map.setLayoutProperty(o.layerId, 'visibility', 'visible');
    var t0 = performance.now();
    var token = fx.token;
    var dur = o.duration || 1600;
    (function frame(now) {
      if (token !== fx.token) return;
      var p = Math.min((now - t0) / dur, 1);
      var idx = Math.min(fx.slices.length - 1, Math.floor(p * fx.slices.length));
      if (idx !== fx.idx) {
        fx.idx = idx;
        src.setData({ type: 'FeatureCollection', features: [{
          type: 'Feature', properties: o.props || {}, geometry: { type: 'LineString', coordinates: fx.slices[idx] } }] });
      }
      if (p < 1) { fx.raf = requestAnimationFrame(frame); return; }
      fx.raf = 0;
      setTimeout(function () {
        if (token === fx.token) {
          src.setData(EMPTY);
          if (map.getLayer(o.layerId)) map.setLayoutProperty(o.layerId, 'visibility', 'none');
        }
      }, o.fade || 420);
      if (o.onDone) o.onDone();
    })(t0);
  };

  Instance.prototype.stopFx = function () {
    this._fx.token++;
    if (this._fx.raf) cancelAnimationFrame(this._fx.raf);
    this._fx.raf = 0; this._fx.slices = []; this._fx.idx = -1;
  };
  Instance.prototype.clearReveal = function (sourceId, layerId) {
    var s = this.map.getSource(sourceId);
    if (s) s.setData(EMPTY);
    if (layerId && this.map.getLayer(layerId)) this.map.setLayoutProperty(layerId, 'visibility', 'none');
  };

  /* ── 导出 ───────────────────────────────────────────────── */
  global.Thematic = {
    create: function (opts) { return new Instance(opts); },
    fmt: fmt, esc: esc,
    isMobile: isMobile, isShort: isShort,
    bboxOf: bboxOf, padBbox: padBbox, pointAt: pointAt,
    amapTiles: amapTiles,
    EMPTY: EMPTY
  };
})(window);
