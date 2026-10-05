/* 馆情介绍页里的只读定位小地图
   ——本馆金色高亮 + 其他馆灰色作空间上下文，让读者一眼看出「这家馆在全市的什么位置」。
   数据由页面内联注入：window.__PAGE_LIB（15 个点位GeoJSON 要素）、window.__PAGE_ID（当前馆 id）。 */
(function () {
  'use strict';

  function boot() {
    var el = document.getElementById('pmap');
    var raw = window.__PAGE_LIB;
    var ID = window.__PAGE_ID;
    if (!el || !raw || !ID) return;

    /* 页面内联注入的是 Feature 数组，这里统一包成 FeatureCollection */
    var PT = { type: 'FeatureCollection', features: raw.features || raw };
    if (!PT.features || !PT.features.length) return;

    var me = null;
    PT.features.forEach(function (f) { if (f.properties.id === ID) me = f; });
    if (!me) return;

    var c = me.geometry.coordinates;
    var tiles = ['01', '02', '03', '04'].map(function (s) {
      return 'https://wprd' + s + '.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=6';
    });

    var m = new maplibregl.Map({
      container: 'pmap',
      style: {
        version: 8,
        sources: {
          img: { type: 'raster', tiles: tiles, tileSize: 256, attribution: '高德地图' },
          lib: { type: 'geojson', data: PT }
        },
        layers: [
          { id: 'bg', type: 'background', paint: { 'background-color': '#0a1220' } },
          { id: 'img', type: 'raster', source: 'img', paint: { 'raster-opacity': 0.6 } },
          { id: 'other', type: 'circle', source: 'lib',
            filter: ['!=', ['get', 'id'], ID],
            paint: { 'circle-radius': 5, 'circle-color': '#8fa3ba', 'circle-opacity': 0.7,
              'circle-stroke-width': 1, 'circle-stroke-color': 'rgba(255,255,255,.45)' } },
          { id: 'me', type: 'circle', source: 'lib',
            filter: ['==', ['get', 'id'], ID],
            paint: { 'circle-radius': 10, 'circle-color': '#d9a441',
              'circle-stroke-width': 3, 'circle-stroke-color': '#fff' } },
          { id: 'halo', type: 'circle', source: 'lib',
            filter: ['==', ['get', 'id'], ID],
            paint: { 'circle-radius': 22, 'circle-color': '#d9a441', 'circle-opacity': 0.16 } }
        ]
      },
      center: c, zoom: 11, minZoom: 8, maxZoom: 15,
      attributionControl: false, dragRotate: false, pitchWithRotate: false
    });
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    m.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    m.on('error', function () { /* 瓦片偶发失败不阻塞页面 */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();