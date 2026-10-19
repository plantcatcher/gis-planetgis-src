/* 全球夜间灯光互动地图 —— 互动逻辑
   引擎：MapLibre GL JS（/maps/_shared/maplibre-gl.js）
   图层（由下而上）：背景(纯黑) → 夜间灯光栅格(NASA GIBS) → 经纬网格 → 国界线 → 灯光热点
   交互：国界 hover 显示中文国名 / 点选显示面积与数据年份；金色热点 hover/点选显示解读；
        10 个区域预设、亮度不透明度、灯光增强、关灯地球对比。 */
(function () {
  'use strict';

  var CFG = window.NL_CONFIG;
  var map, lightsOff = false;

  function fmt(n, d) {
    d = d == null ? 0 : d;
    if (n == null || isNaN(n)) return '—';
    return Number(n).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function areaFmt(v) {
    if (v == null) return '—';
    if (v >= 1e6) return fmt(v / 1e6, 2) + ' 万';
    return fmt(v, 0);
  }
  function latStr(v) { return Math.abs(v).toFixed(1) + '°' + (v >= 0 ? 'N' : 'S'); }
  function lonStr(v) { return Math.abs(v).toFixed(1) + '°' + (v >= 0 ? 'E' : 'W'); }

  var el = {
    intro: document.getElementById('intro'),
    introBar: document.getElementById('introBar'),
    btnOverview: document.getElementById('btnOverview'),
    presetList: document.getElementById('presetList'),
    detail: document.getElementById('detail'),
    dtRole: document.getElementById('dtRole'),
    dtName: document.getElementById('dtName'),
    dtSub: document.getElementById('dtSub'),
    dtM: [
      document.getElementById('dtLb1'), document.getElementById('dtV1'), document.getElementById('dtU1'),
      document.getElementById('dtLb2'), document.getElementById('dtV2'), document.getElementById('dtU2'),
      document.getElementById('dtLb3'), document.getElementById('dtV3'), document.getElementById('dtU3')
    ],
    dtDescLb: document.getElementById('dtDescLb'),
    dtDesc: document.getElementById('dtDesc'),
    dtFooter: document.getElementById('dtFooter'),
    dtClose: document.getElementById('dtClose'),
    panelToggle: document.getElementById('panelToggle'),
    panelBody: document.getElementById('panelBody'),
    ckNight: document.getElementById('ckNight'),
    ckBorders: document.getElementById('ckBorders'),
    ckGrat: document.getElementById('ckGrat'),
    ckBoost: document.getElementById('ckBoost'),
    opacity: document.getElementById('opacity'),
    opacityVal: document.getElementById('opacityVal'),
    btnLights: document.getElementById('btnLights')
  };

  var ttip = document.createElement('div');
  ttip.className = 'ttip';
  document.body.appendChild(ttip);

  function setMetric(i, label, val, unit) {
    el.dtM[i * 3].textContent = label;
    el.dtM[i * 3 + 1].textContent = val;
    el.dtM[i * 3 + 2].textContent = unit || '';
  }
  function showTip(html, x, y) {
    ttip.innerHTML = html;
    ttip.style.left = x + 'px';
    ttip.style.top = y + 'px';
    ttip.style.display = 'block';
  }
  function hideTip() { ttip.style.display = 'none'; }

  /* 经纬网格 */
  function graticule(step) {
    var f = [];
    for (var lon = -180; lon <= 180; lon += step)
      f.push({ type: 'Feature', properties: { d: 'lon', v: lon }, geometry: { type: 'LineString', coordinates: [[lon, -85], [lon, 85]] } });
    for (var lat = -80; lat <= 80; lat += step)
      f.push({ type: 'Feature', properties: { d: 'lat', v: lat }, geometry: { type: 'LineString', coordinates: [[-180, lat], [180, lat]] } });
    return { type: 'FeatureCollection', features: f };
  }

  function init() {
    map = new maplibregl.Map({
      container: 'map',
      style: { version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#04060d' } }] },
      center: CFG.view.center,
      zoom: CFG.view.zoom,
      minZoom: CFG.view.minZoom,
      maxZoom: CFG.view.maxZoom,
      attributionControl: false,
      renderWorldCopies: false,
      dragRotate: false,
      pitchWithRotate: false
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: CFG.gibsAttr }), 'bottom-right');
    map.on('load', onLoad);
    map.on('error', function (e) { if (e && e.error) console.warn('[night] map error', e.error.message); });
  }

  function onLoad() {
    /* 夜间灯光栅格（底层） */
    map.addSource('night', { type: 'raster', tiles: [CFG.gibsTile], tileSize: 256, maxzoom: 8, attribution: CFG.gibsAttr });
    map.addLayer({
      id: 'night', type: 'raster', source: 'night',
      paint: { 'raster-opacity': CFG.nightOpacity, 'raster-saturation': 0, 'raster-contrast': 0, 'raster-brightness-max': 1, 'raster-brightness-min': 0 }
    });

    /* 经纬网格 */
    map.addSource('grat', { type: 'geojson', data: graticule(CFG.graticuleStep) });
    map.addLayer({
      id: 'grat', type: 'line', source: 'grat',
      layout: { 'visibility': CFG.gratOn ? 'visible' : 'none' },
      paint: { 'line-color': '#1c2c4a', 'line-width': 0.6, 'line-opacity': 0.55 }
    });

    /* 国界线（自托管，已反子午线切割） */
    fetch('data/countries.geojson').then(function (r) { return r.json(); }).then(function (gj) {
      map.addSource('borders', { type: 'geojson', data: gj });
      map.addLayer({
        id: 'borders', type: 'line', source: 'borders',
        layout: { 'line-cap': 'round', 'line-join': 'round', 'visibility': 'visible' },
        paint: { 'line-color': '#4a6493', 'line-width': 0.7, 'line-opacity': 0.6 }
      });
      /* 灯光热点（最上层） */
      var sg = {
        type: 'FeatureCollection',
        features: CFG.spotlights.map(function (s) {
          return { type: 'Feature', properties: s, geometry: { type: 'Point', coordinates: s.center } };
        })
      };
      map.addSource('spot', { type: 'geojson', data: sg });
      map.addLayer({
        id: 'spot-glow', type: 'circle', source: 'spot',
        paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 7, 5, 18], 'circle-color': '#ffd98a', 'circle-opacity': 0.16, 'circle-blur': 1 }
      });
      map.addLayer({
        id: 'spot-pt', type: 'circle', source: 'spot',
        paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 2.4, 5, 4.2], 'circle-color': '#ffd98a', 'circle-opacity': 0.95, 'circle-stroke-width': 1, 'circle-stroke-color': 'rgba(255,255,255,.5)' }
      });
      bind();
    }).catch(function (e) {
      console.error('[night] borders load failed', e);
      bind();
    });

    renderPresets();
    window.__nlReady = true;
  }

  function bind() {
    el.panelToggle.addEventListener('click', function () { el.panelBody.classList.toggle('collapsed'); });
    if (el.introBar) el.introBar.addEventListener('click', function () { el.intro.classList.toggle('is-collapsed'); });
    el.btnOverview.addEventListener('click', function () {
      map.flyTo({ center: CFG.view.center, zoom: CFG.view.zoom, duration: 900 });
      clearDetail();
    });
    el.dtClose.addEventListener('click', clearDetail);

    el.ckNight.addEventListener('change', function () {
      if (!lightsOff) map.setLayoutProperty('night', 'visibility', this.checked ? 'visible' : 'none');
    });
    el.ckBorders.addEventListener('change', function () {
      if (map.getLayer('borders')) map.setLayoutProperty('borders', 'visibility', this.checked ? 'visible' : 'none');
    });
    el.ckGrat.addEventListener('change', function () {
      map.setLayoutProperty('grat', 'visibility', this.checked ? 'visible' : 'none');
    });
    el.ckBoost.addEventListener('change', function () { applyBoost(this.checked); });
    el.opacity.addEventListener('input', function () {
      var v = parseFloat(this.value) / 100;
      map.setPaintProperty('night', 'raster-opacity', v);
      el.opacityVal.textContent = this.value + '%';
    });
    el.btnLights.addEventListener('click', toggleLights);

    map.on('mousemove', onMove);
    map.getCanvas().addEventListener('mouseleave', function () { hideTip(); map.getCanvas().style.cursor = ''; });
    map.on('click', onClick);
  }

  function applyBoost(on) {
    map.setPaintProperty('night', 'raster-contrast', on ? 0.4 : 0);
    map.setPaintProperty('night', 'raster-saturation', on ? -0.15 : 0);
    map.setPaintProperty('night', 'raster-brightness-min', on ? 0.02 : 0);
  }

  function toggleLights() {
    lightsOff = !lightsOff;
    if (lightsOff) {
      map.setLayoutProperty('night', 'visibility', 'none');
      el.btnLights.textContent = '点亮地球';
      el.btnLights.classList.add('active');
    } else {
      map.setLayoutProperty('night', 'visibility', el.ckNight.checked ? 'visible' : 'none');
      el.btnLights.textContent = '关灯地球（隐藏灯光）';
      el.btnLights.classList.remove('active');
    }
  }

  function onMove(e) {
    var px = e.point;
    var box = [[px.x - 5, px.y - 5], [px.x + 5, px.y + 5]];
    if (map.getLayer('borders') && map.getLayoutProperty('borders', 'visibility') !== 'none') {
      var bl = map.queryRenderedFeatures(box, { layers: ['borders'] });
      if (bl.length) {
        var p = bl[0].properties;
        map.getCanvas().style.cursor = 'pointer';
        showTip('<b>' + esc(p.name_zh || p.name) + '</b>', px.x, px.y);
        return;
      }
    }
    if (map.getLayer('spot-pt')) {
      var sp = map.queryRenderedFeatures([[px.x - 4, px.y - 4], [px.x + 4, px.y + 4]], { layers: ['spot-pt'] });
      if (sp.length) {
        var s = sp[0].properties;
        map.getCanvas().style.cursor = 'pointer';
        showTip('<b>' + esc(s.name_zh) + '</b> <span style="color:#9fb4cd">' + esc(s.en || '') + '</span>', px.x, px.y);
        return;
      }
    }
    hideTip();
    map.getCanvas().style.cursor = '';
  }

  function onClick(e) {
    var px = e.point;
    if (map.getLayer('borders') && map.getLayoutProperty('borders', 'visibility') !== 'none') {
      var bl = map.queryRenderedFeatures([[px.x - 5, px.y - 5], [px.x + 5, px.y + 5]], { layers: ['borders'] });
      if (bl.length) { showCountry(bl[0].properties); return; }
    }
    if (map.getLayer('spot-pt')) {
      var sp = map.queryRenderedFeatures([[px.x - 4, px.y - 4], [px.x + 4, px.y + 4]], { layers: ['spot-pt'] });
      if (sp.length) { showSpot(sp[0].properties); return; }
    }
    clearDetail();
  }

  function openDetail() {
    el.detail.hidden = false;
    el.detail.style.setProperty('--rc', '#ffd98a');
  }
  function showCountry(p) {
    openDetail();
    el.dtRole.textContent = 'COUNTRY';
    el.dtName.textContent = p.name_zh || p.name;
    el.dtSub.textContent = p.name || '';
    setMetric(0, '面积', areaFmt(p.area_km2), p.area_km2 >= 1e6 ? '万 km²' : 'km²');
    setMetric(1, '数据', CFG.gibsYear, '');
    setMetric(2, '编号', p.id != null ? String(p.id) : '—', '');
    el.dtDescLb.textContent = '图注';
    el.dtDesc.textContent = '在 NASA Black Marble 夜间灯光影像上，该国国界以细线标出。点亮处即人类活动密集区——城市、工业区与油气设施。';
    el.dtFooter.innerHTML = '<span>NASA VIIRS DNB · ' + esc(CFG.gibsYear) + ' 年度合成</span>';
  }
  function showSpot(s) {
    openDetail();
    el.dtRole.textContent = '区域';
    el.dtName.textContent = s.name_zh;
    el.dtSub.textContent = s.en || '';
    setMetric(0, '类型', s.type || '灯光热点', '');
    setMetric(1, '中心纬度', latStr(s.center[1]), '');
    setMetric(2, '中心经度', lonStr(s.center[0]), '');
    el.dtDescLb.textContent = '看点';
    el.dtDesc.textContent = s.note;
    el.dtFooter.innerHTML = '<span>NASA VIIRS DNB · ' + esc(CFG.gibsYear) + ' 年度合成</span>';
  }
  function clearDetail() { el.detail.hidden = true; }

  function renderPresets() {
    el.presetList.innerHTML = CFG.presets.map(function (p, i) {
      return '<button type="button" data-i="' + i + '">' + esc(p.name) + '</button>';
    }).join('');
    el.presetList.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var p = CFG.presets[+b.dataset.i];
      map.flyTo({ center: p.center, zoom: p.zoom, duration: 900 });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
