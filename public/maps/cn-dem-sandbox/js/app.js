/* 中国三维 DEM 沙盘 · 交互层（Three.js，无 OrbitControls，自写轨道控制）
   坐标系：Web 墨卡托（与天地图瓦片同构，保证卫星影像 UV 严格对齐）。 */
(function () {
  'use strict';

  var CFG = window.CN_CONFIG;
  var D2R0 = Math.PI / 180;

  // ── 状态 ──────────────────────────────────────────────
  var meta, dem, mask, cols, rows, lon0, lat0, dlon, dlat;
  var LON_C, LAT_C, MX_C, MY_C;
  var exagg = CFG.exaggDefault;
  var themeName = CFG.defaultTheme || 'classic';

  // 境外（非中国陆地）统一沉为中性托盘底座，使国界自然贴合地形边缘
  var BASE_Y = -6.0;                        // 固定托盘高度（不随垂直夸张缩放）
  var BASE_COLOR = [0.006, 0.009, 0.016];   // 兜底
  var TRAY_COLOR = [0.009, 0.014, 0.026];   // 托盘面（深海蓝黑）

  var azimuth = CFG.view.azimuth, polar = CFG.view.polar, radius = CFG.view.radius;
  var minR = CFG.minRadius, maxR = CFG.maxRadius;
  var autoRotate = false;

  var target = new THREE.Vector3(0, 0, 0);
  var dragging = false, panning = false, moved = false, lastX = 0, lastY = 0;
  var pointers = {};
  var pinchDist = 0;

  // flyTo 缓动
  var easing = false, easeT = 0, easeDur = 700, easeFrom = null, easeTo = null;
  var needExagg = false;

  // 卫星瓦片网格（UV 与贴图共用同一套瓦片坐标，避免整体偏移）
  var SAT = null;

  // ── Web 墨卡托 ────────────────────────────────────────
  var EARTH_R = 6378137, D2R = Math.PI / 180, R2D = 180 / Math.PI;
  function mercX(lon) { return lon * D2R * EARTH_R; }
  function mercY(lat) { var r = lat * D2R; return Math.log(Math.tan(Math.PI / 4 + r / 2)) * EARTH_R; }
  function mxToLon(x) { return x / EARTH_R * R2D; }
  function myToLat(y) { return (2 * Math.atan(Math.exp(y / EARTH_R)) - Math.PI / 2) * R2D; }
  // 世界单位 = km（与高程 Y 一致）；UV 用原始墨卡托米
  function lonToX(lon) { return (mercX(lon) - MX_C) / 1000; }
  function latToZ(lat) { return (MY_C - mercY(lat)) / 1000; }   // 北向 = -z
  function xToLon(x) { return mxToLon(x * 1000 + MX_C); }
  function zToLat(z) { return myToLat(MY_C - z * 1000); }

  // ── 高程晕渲配色：地形图常用方案 ──────────────────────
  // classic   经典晕渲：国际通用 hypsometric tint（绿—黄—棕—白）
  // atlas     分层设色：地图集式（深绿—黄绿—米黄—棕—灰白）
  // terrain   棕调地形：地形图褐色系（米—棕—深棕—白）
  // gray      灰度高程：单色浮雕
  // satellite 卫星影像：天地图 img_w 瓦片（运行时加载）
  var THEMES = {
    classic: [[-300, [28, 64, 110]], [0, [46, 110, 165]], [200, [46, 139, 87]],
      [500, [111, 174, 95]], [1000, [185, 201, 95]], [1500, [232, 211, 107]],
      [2500, [224, 168, 90]], [3500, [200, 120, 60]], [4500, [156, 90, 50]],
      [5500, [201, 191, 176]], [7000, [255, 255, 255]]],
    atlas: [[-300, [26, 77, 110]], [0, [31, 107, 58]], [200, [63, 138, 69]],
      [500, [121, 170, 82]], [1000, [182, 192, 101]], [1500, [226, 211, 119]],
      [2500, [224, 180, 106]], [3500, [201, 141, 85]], [4500, [165, 106, 65]],
      [5500, [138, 95, 69]], [6500, [217, 210, 198]], [7500, [255, 255, 255]]],
    terrain: [[-300, [58, 90, 114]], [0, [222, 211, 184]], [300, [216, 199, 156]],
      [800, [203, 177, 130]], [1500, [189, 154, 108]], [2500, [171, 131, 90]],
      [3500, [151, 105, 74]], [4500, [127, 85, 62]], [5500, [179, 163, 150]],
      [7000, [255, 255, 255]]],
    gray: 'gray',
    satellite: 'satellite'
  };
  var THEME_LABELS = {
    classic: '经典晕渲', atlas: '分层设色', terrain: '棕调地形',
    gray: '灰度高程', satellite: '卫星影像'
  };
  var isSatTheme = function () { return themeName === 'satellite'; };

  function themeColor(name, e) {
    if (name === 'gray') {
      var t = Math.max(0, Math.min(1, (e + 300) / 7300));
      var g = 18 + t * 228;
      return [g / 255, g / 255, g / 255];
    }
    var pal = THEMES[name] || THEMES.classic;
    if (typeof pal === 'string') pal = THEMES.classic;   // satellite 时顶点色不参与显示
    if (e <= pal[0][0]) return pal[0][1].map(function (v) { return v / 255; });
    if (e >= pal[pal.length - 1][0]) return pal[pal.length - 1][1].map(function (v) { return v / 255; });
    for (var i = 0; i < pal.length - 1; i++) {
      var e0 = pal[i][0], c0 = pal[i][1], e1 = pal[i + 1][0], c1 = pal[i + 1][1];
      if (e >= e0 && e <= e1) {
        var f = (e - e0) / (e1 - e0);
        return [(c0[0] + (c1[0] - c0[0]) * f) / 255, (c0[1] + (c1[1] - c0[1]) * f) / 255, (c0[2] + (c1[2] - c0[2]) * f) / 255];
      }
    }
    return pal[pal.length - 1][1].map(function (v) { return v / 255; });
  }
  // 图例渐变字符串
  function themeGradient(name) {
    if (name === 'satellite') return '';
    if (name === 'gray') return 'linear-gradient(to right,#121212,#e6e6e6)';
    var pal = THEMES[name] || THEMES.classic;
    var stops = pal.map(function (p) {
      var r = Math.round(p[1][0]), g = Math.round(p[1][1]), b = Math.round(p[1][2]);
      var span = name === 'terrain' ? 7300 : 7800;
      return 'rgb(' + r + ',' + g + ',' + b + ') ' + Math.round((p[0] + 300) / span * 100) + '%';
    });
    return 'linear-gradient(to right,' + stops.join(',') + ')';
  }

  var TYPE_COLOR = { peak: '#f0b86e', basin: '#7dd3fc', plateau: '#e8c46a', plain: '#8fdc9a' };
  var TYPE_LABEL = { peak: '山峰', basin: '盆地', plateau: '高原', plain: '平原' };

  function elevToY(e) { return e * 0.001 * exagg; }

  // 顶点 Y / 颜色（境外=托盘平面；境内=真实高程晕渲）
  function cellY(idx) {
    if (mask && mask[idx] === 0) return BASE_Y;
    return dem[idx] * 0.001 * exagg;
  }
  function cellColor(idx) {
    if (mask && mask[idx] === 0) return TRAY_COLOR;
    return themeColor(themeName, dem[idx]);
  }

  function sampleElev(lon, lat) {
    var fx = (lon - lon0) / dlon, fy = (lat - lat0) / dlat;
    if (fx < 0 || fx > cols - 1 || fy < 0 || fy > rows - 1) return 0;
    var x0 = Math.floor(fx), y0 = Math.floor(fy);
    var x1 = Math.min(x0 + 1, cols - 1), y1 = Math.min(y0 + 1, rows - 1);
    var tx = fx - x0, ty = fy - y0;
    var a = dem[y0 * cols + x0] * (1 - tx) + dem[y0 * cols + x1] * tx;
    var b = dem[y1 * cols + x0] * (1 - tx) + dem[y1 * cols + x1] * tx;
    return a * (1 - ty) + b * ty;
  }

  // ── Three.js 全局 ──────────────────────────────────────
  var scene, camera, renderer, dom, labelsEl;
  var terrainMesh, terrainGeom, boundaryGroup, markerGroup, starGroup;
  var markerObjs = [];
  var ray = new THREE.Raycaster();
  var vProj = new THREE.Vector3();

  function setupThree() {
    dom = document.getElementById('map');
    var w = dom.clientWidth, h = dom.clientHeight;
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, w / h, 1, 400000);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);   // 透明底，露出 CSS 星云渐变
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    dom.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    var dir = new THREE.DirectionalLight(0xfff1de, 0.95);
    dir.position.set(-6000, 9000, 6000); // 西北方向入射，强化地形阴影
    scene.add(dir);

    buildStars();
    window.addEventListener('resize', onResize);
  }

  function onResize() {
    if (!renderer) return;
    var w = dom.clientWidth, h = dom.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  // ── 星空背景 ──────────────────────────────────────────
  function buildStars() {
    starGroup = new THREE.Group();
    var N = 2400;
    var pos = new Float32Array(N * 3);
    var col = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      var u = Math.random(), v = Math.random();
      var theta = 2 * Math.PI * u;
      var phi = Math.acos(2 * v - 1);
      var r = 70000 + Math.random() * 40000;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      var t = Math.random();
      var cr = 1, cg = 1, cb = 1;
      if (t > 0.85) { cr = 0.7; cg = 0.8; cb = 1.0; }      // 蓝白
      else if (t > 0.7) { cr = 1.0; cg = 0.85; cb = 0.7; } // 暖白
      var b = 0.6 + Math.random() * 0.4;
      col[i * 3] = cr * b; col[i * 3 + 1] = cg * b; col[i * 3 + 2] = cb * b;
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var m = new THREE.PointsMaterial({ size: 220, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false });
    starGroup.add(new THREE.Points(g, m));
    scene.add(starGroup);
  }

  // ── 地形网格（矩形，境外沉为托盘平面）──────────────────
  function buildTerrain() {
    terrainGeom = new THREE.BufferGeometry();
    var n = rows * cols;
    var positions = new Float32Array(n * 3);
    var colors = new Float32Array(n * 3);
    var uvs = new Float32Array(n * 2);
    var idx = 0;
    for (var j = 0; j < rows; j++) {
      var lat = lat0 + j * dlat;
      var z = latToZ(lat);
      for (var i = 0; i < cols; i++) {
        var lon = lon0 + i * dlon;
        positions[idx * 3] = lonToX(lon);
        positions[idx * 3 + 1] = cellY(idx);
        positions[idx * 3 + 2] = z;
        var c = cellColor(idx);
        colors[idx * 3] = c[0]; colors[idx * 3 + 1] = c[1]; colors[idx * 3 + 2] = c[2];
        // 关键：UV 必须按「瓦片网格」归一化（贴图 canvas 从整瓦片边界起画），
        // 否则会整体偏移最多一整张瓦片（z6 约 600 km）
        uvs[idx * 2] = SAT ? (tileColF(lon) - SAT.c0) / SAT.tc
          : (lon - lon0) / ((cols - 1) * dlon);
        uvs[idx * 2 + 1] = SAT ? (tileRowF(lat) - SAT.r0) / SAT.tr
          : (lat0 - lat) / ((rows - 1) * Math.abs(dlat));
        idx++;
      }
    }
    var indices = new Uint32Array((rows - 1) * (cols - 1) * 6);
    var k = 0;
    for (var jj = 0; jj < rows - 1; jj++) {
      for (var ii = 0; ii < cols - 1; ii++) {
        var a = jj * cols + ii, b = a + 1, c2 = a + cols, d = c2 + 1;
        indices[k++] = a; indices[k++] = c2; indices[k++] = b;
        indices[k++] = b; indices[k++] = c2; indices[k++] = d;
      }
    }
    terrainGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    terrainGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    terrainGeom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    terrainGeom.setIndex(new THREE.BufferAttribute(indices, 1));
    terrainGeom.computeVertexNormals();

    var mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0.0 });
    terrainMesh = new THREE.Mesh(terrainGeom, mat);
    scene.add(terrainMesh);
  }

  function applyThemeColors() {
    var col = terrainGeom.attributes.color;
    for (var k = 0; k < rows * cols; k++) {
      var c = cellColor(k);
      col.array[k * 3] = c[0]; col.array[k * 3 + 1] = c[1]; col.array[k * 3 + 2] = c[2];
    }
    col.needsUpdate = true;
  }

  function updateExagg() {
    var pos = terrainGeom.attributes.position;
    for (var k = 0; k < rows * cols; k++) {
      pos.array[k * 3 + 1] = cellY(k);
    }
    pos.needsUpdate = true;
    terrainGeom.computeVertexNormals();
    updateBoundaryY();
  }

  // ── 国界 ──────────────────────────────────────────────
  function buildBoundary() {
    var lines = window.CN_BOUNDARY || [];
    boundaryGroup = new THREE.Group();
    var mat = new THREE.LineBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.92 });
    for (var li = 0; li < lines.length; li++) {
      var line = lines[li];
      var pts = [];
      for (var k = 0; k < line.length; k++) {
        var lon = line[k][0], lat = line[k][1];
        pts.push(new THREE.Vector3(lonToX(lon), elevToY(sampleElev(lon, lat)) + 6, latToZ(lat)));
      }
      var g = new THREE.BufferGeometry().setFromPoints(pts);
      boundaryGroup.add(new THREE.Line(g, mat));
    }
    scene.add(boundaryGroup);
  }
  function updateBoundaryY() {
    if (!boundaryGroup) return;
    var lines = window.CN_BOUNDARY || [];
    var li = 0;
    boundaryGroup.children.forEach(function (line) {
      var pts = line.geometry.attributes.position;
      var src = lines[li++];
      for (var k = 0; k < src.length; k++) {
        pts.setY(k, elevToY(sampleElev(src[k][0], src[k][1])) + 6);
      }
      pts.needsUpdate = true;
    });
  }

  // ── 标注 ──────────────────────────────────────────────
  function buildMarkers() {
    var data = window.CN_MARKERS || [];
    markerGroup = new THREE.Group();
    scene.add(markerGroup);
    for (var mi = 0; mi < data.length; mi++) {
      var m = data[mi];
      var e = (m.elev != null) ? m.elev : sampleElev(m.lon, m.lat);
      var x = lonToX(m.lon), z = latToZ(m.lat), y = elevToY(e) + 14;
      var col = new THREE.Color(TYPE_COLOR[m.type] || '#ffffff');
      var sph = new THREE.Mesh(new THREE.SphereGeometry(9, 10, 10),
        new THREE.MeshBasicMaterial({ color: col }));
      sph.position.set(x, y, z);
      markerGroup.add(sph);

      var el = document.createElement('div');
      el.className = 'cn-label type-' + m.type;
      el.innerHTML = '<span class="dot"></span>' + m.name;
      labelsEl.appendChild(el);
      (function (mm, ee) {
        el.addEventListener('click', function (ev) { ev.stopPropagation(); showMarker(mm, ee); });
      })(m, e);

      markerObjs.push({ m: m, x: x, y: y, z: z, el: el });
    }
  }

  function updateLabels() {
    var w = dom.clientWidth, h = dom.clientHeight;
    var show = document.getElementById('ckLabels').checked;
    for (var i = 0; i < markerObjs.length; i++) {
      var o = markerObjs[i];
      if (!show) { o.el.style.display = 'none'; continue; }
      vProj.set(o.x, o.y, o.z); vProj.project(camera);
      if (vProj.z > 1) { o.el.style.display = 'none'; continue; }
      o.el.style.display = 'block';
      o.el.style.left = ((vProj.x * 0.5 + 0.5) * w) + 'px';
      o.el.style.top = ((-vProj.y * 0.5 + 0.5) * h) + 'px';
    }
  }

  // ── 相机控制 ──────────────────────────────────────────
  function updateCamera() {
    var sp = Math.sin(polar), cp = Math.cos(polar);
    camera.position.set(
      target.x + radius * sp * Math.sin(azimuth),
      target.y + radius * cp,
      target.z + radius * sp * Math.cos(azimuth));
    camera.lookAt(target);
  }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function bindControls() {
    renderer.domElement.addEventListener('pointerdown', function (e) {
      if (e.button === 1) { panning = true; }
      else { dragging = true; }
      moved = false; lastX = e.clientX; lastY = e.clientY;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (Object.keys(pointers).length === 2) pinchDist = pointerDist();
      try { renderer.domElement.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging && !panning) return;
      if (panning) {
        var dxp = e.clientX - lastX, dyp = e.clientY - lastY;
        lastX = e.clientX; lastY = e.clientY;
        if (Math.abs(dxp) + Math.abs(dyp) > 2) moved = true;
        doPan(dxp, dyp);
        stopSpin();
        return;
      }
      if (e.pointerType === 'touch' && pointers[e.pointerId] && Object.keys(pointers).length === 2) {
        pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
        var d = pointerDist();
        if (pinchDist > 0) { radius = clamp(radius * (pinchDist / d), minR, maxR); }
        pinchDist = d; moved = true; return;
      }
      if (!pointers[e.pointerId]) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      lastX = e.clientX; lastY = e.clientY;
      azimuth -= dx * 0.005;
      polar = clamp(polar - dy * 0.005, 0.12, 1.5);
      stopSpin();
    });
    window.addEventListener('pointerup', function (e) {
      delete pointers[e.pointerId];
      if (Object.keys(pointers).length === 0) { dragging = false; panning = false; }
    });
    window.addEventListener('pointercancel', function (e) { delete pointers[e.pointerId]; });
    renderer.domElement.addEventListener('wheel', function (e) {
      e.preventDefault();
      radius = clamp(radius * Math.exp(e.deltaY * 0.0008), minR, maxR);
      stopSpin();
    }, { passive: false });
    renderer.domElement.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    renderer.domElement.addEventListener('click', onClickTerrain);
  }
  function pointerDist() {
    var ks = Object.keys(pointers); if (ks.length < 2) return 0;
    var a = pointers[ks[0]], b = pointers[ks[1]];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  function doPan(dx, dy) {
    camera.updateMatrixWorld();
    var e = camera.matrixWorld.elements;
    var right = new THREE.Vector3(e[0], e[1], e[2]);
    var up = new THREE.Vector3(e[4], e[5], e[6]);
    var scale = 2 * Math.tan(45 * D2R / 2) * radius / dom.clientHeight;
    target.addScaledVector(right, -dx * scale);
    target.addScaledVector(up, dy * scale);
  }
  function stopSpin() {
    if (autoRotate) { autoRotate = false; var c = document.getElementById('ckSpin'); if (c) c.checked = false; }
  }

  function onClickTerrain(e) {
    if (moved) return;
    var rect = renderer.domElement.getBoundingClientRect();
    var nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    var ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    ray.setFromCamera({ x: nx, y: ny }, camera);
    var hit = ray.intersectObject(terrainMesh);
    if (hit.length) {
      var p = hit[0].point;
      showTerrain(xToLon(p.x), zToLat(p.z), sampleElev(xToLon(p.x), zToLat(p.z)));
    }
  }

  // ── 预设飞行 ──────────────────────────────────────────
  // 关键：必须同时平移观察中心 target，否则只是绕全国中心转方位角（看着像"只旋转不定位"）
  function flyTo(p) {
    var tx = target.x, ty = target.y, tz = target.z;
    if (p.tx != null) {                       // 显式世界坐标（重置用）
      tx = p.tx; ty = p.ty || 0; tz = p.tz != null ? p.tz : 0;
    } else if (p.lon != null && p.lat != null) {
      tx = lonToX(p.lon);
      tz = latToZ(p.lat);
      var e = sampleElev(p.lon, p.lat);
      ty = (isFinite(e) ? e : 0) * 0.001 * exagg;   // 焦点落在该点地表高度上
    }
    var to = {
      azimuth: (p.azimuth != null) ? p.azimuth : azimuth,   // 默认保持当前朝向，不自转
      polar: (p.polar != null) ? p.polar : polar,
      radius: (p.radius != null) ? p.radius : radius,
      tx: tx, ty: ty, tz: tz
    };
    easeFrom = {
      azimuth: azimuth, polar: polar, radius: radius,
      tx: target.x, ty: target.y, tz: target.z
    };
    easeTo = to; easeT = 0; easing = true;
  }

  // ── 卫星影像（天地图 img_w 瓦片 → CanvasTexture）────────
  // 贴图与 UV 共用同一套瓦片坐标（SAT），彻底消除整块偏移
  var satTexture = null, satLoading = false;

  function buildSatGrid() {
    var Z = (CFG.satellite && CFG.satellite.zoom) || 6;
    var n = Math.pow(2, Z);
    var lonE = lon0 + (cols - 1) * dlon, latN = lat0, latS = lat0 + (rows - 1) * dlat;
    function tcol(lon) { return (lon + 180) / 360 * n; }
    function trow(lat) {
      var r = lat * D2R0;
      return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n;
    }
    // 用 floor：取「包含边界」的整瓦片，贴图从该瓦片左上角起画
    var c0 = Math.floor(tcol(lon0)), c1 = Math.floor(tcol(lonE));
    var r0 = Math.floor(trow(latN)), r1 = Math.floor(trow(latS));
    SAT = { z: Z, n: n, c0: c0, r0: r0, tc: c1 - c0 + 1, tr: r1 - r0 + 1 };
    console.log('[sat] z' + Z + ' 瓦片 ' + SAT.tc + 'x' + SAT.tr + ' = ' + (SAT.tc * SAT.tr) + ' 张');
  }
  function tileColF(lon) { return (lon + 180) / 360 * SAT.n; }
  function tileRowF(lat) {
    var r = lat * D2R0;
    return (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * SAT.n;
  }

  function buildSatellite() {
    if (satTexture || satLoading || !SAT) return;
    satLoading = true;
    var tk = (CFG.satellite && CFG.satellite.tk) || '';
    var cv = document.createElement('canvas');
    cv.width = SAT.tc * 256; cv.height = SAT.tr * 256;
    var ctx = cv.getContext('2d');
    ctx.fillStyle = '#0b1420'; ctx.fillRect(0, 0, cv.width, cv.height);
    var jobs = [], done = 0, failed = 0, inFlight = 0, next = 0, PAR = 6;
    for (var cx = SAT.c0; cx < SAT.c0 + SAT.tc; cx++)
      for (var cy = SAT.r0; cy < SAT.r0 + SAT.tr; cy++) jobs.push([cx, cy]);
    var total = jobs.length;

    function finish() {
      satLoading = false;
      if (failed >= total) { console.warn('[sat] 全部瓦片加载失败（跨域或被拦截）'); satTexture = null; return; }
      var tex = new THREE.CanvasTexture(cv);
      tex.flipY = false;                       // v=0 对应 canvas 首行（北）
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      satTexture = tex;
      if (isSatTheme()) applySatellite(true);
    }
    function after() {
      done++;
      if (done >= total) finish(); else pump();
    }
    function loadTile(cx, cy) {
      var url = 'https://t' + ((cx + cy) % 8) + '.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile'
        + '&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles'
        + '&TILEMATRIX=' + SAT.z + '&TILEROW=' + cy + '&TILECOL=' + cx + '&tk=' + tk;
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        try { ctx.drawImage(img, (cx - SAT.c0) * 256, (cy - SAT.r0) * 256); } catch (_) {}
        inFlight--; after();
      };
      img.onerror = function () { inFlight--; failed++; after(); };
      img.src = url;
    }
    function pump() {
      while (inFlight < PAR && next < total) {
        var job = jobs[next++]; inFlight++; loadTile(job[0], job[1]);
      }
    }
    pump();
  }
  function applySatellite(on) {
    if (!terrainMesh) return;
    var m = terrainMesh.material;
    var lg = document.querySelector('.legend');
    if (on) {
      if (!satTexture) { buildSatellite(); return; }
      m.map = satTexture; m.vertexColors = false; m.color.set(0xffffff);
      m.needsUpdate = true;
      if (lg) lg.classList.add('is-sat');
    } else {
      m.map = null; m.vertexColors = true; m.color.set(0xffffff);
      m.needsUpdate = true;
      if (lg) lg.classList.remove('is-sat');
    }
  }

  // ── 详情卡 ────────────────────────────────────────────
  function showDetail(role, name, sub, lon, lat, elev, desc, footer) {
    document.getElementById('dtRole').textContent = role;
    document.getElementById('dtName').textContent = name;
    document.getElementById('dtSub').textContent = sub;
    document.getElementById('dtV1').textContent = lon.toFixed(2);
    document.getElementById('dtV2').textContent = lat.toFixed(2);
    document.getElementById('dtV3').textContent = Math.round(elev).toLocaleString();
    document.getElementById('dtDesc').textContent = desc;
    document.getElementById('dtFooter').textContent = footer || '';
    document.getElementById('detail').hidden = false;
  }
  function showMarker(m, e) {
    showDetail('MARKER · ' + (TYPE_LABEL[m.type] || ''), m.name, (TYPE_LABEL[m.type] || '') + '标注',
      m.lon, m.lat, e, m.note || '', '坐标：' + m.lon.toFixed(2) + '°E, ' + m.lat.toFixed(2) + '°N');
  }
  function showTerrain(lon, lat, e) {
    showDetail('TERRAIN · 地形表面', '点击点', '地形表面', lon, lat, e,
      '该位置高程由 DEM 双线性采样得到（地形网格已降采样，局部尖峰略有平滑）。',
      '坐标：' + lon.toFixed(2) + '°E, ' + lat.toFixed(2) + '°N');
  }

  // ── UI 绑定 ───────────────────────────────────────────
  function buildPresets() {
    var box = document.getElementById('presetList');
    (CFG.presets || []).forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = p.name;
      b.addEventListener('click', function () { flyTo(p); });
      box.appendChild(b);
    });
  }
  // 主题切换：卫星影像与晕渲配色统一到同一个下拉
  function setTheme(name) {
    themeName = name;
    var sat = isSatTheme();
    var ramp = document.querySelector('.legend .ramp');
    var rl = document.querySelector('.legend .ramp-labels');
    var lb = document.querySelector('.legend small');
    if (lb) lb.textContent = sat ? '卫星影像' : '高程晕渲';
    if (ramp) {
      ramp.style.display = sat ? 'none' : '';
      if (!sat) ramp.style.background = themeGradient(name);
    }
    if (rl) rl.style.display = sat ? 'none' : '';
    if (sat) {
      applySatellite(true);
    } else {
      applySatellite(false);
      applyThemeColors();
    }
  }

  function bindUI() {
    var exaggEl = document.getElementById('exagg');
    var exaggVal = document.getElementById('exaggVal');
    exaggEl.addEventListener('input', function () {
      exagg = parseInt(exaggEl.value, 10);
      exaggVal.textContent = exagg + '×';
      needExagg = true;
    });
    var themeSel = document.getElementById('themeSel');
    if (themeSel) {
      Object.keys(THEME_LABELS).forEach(function (k) {
        var o = document.createElement('option');
        o.value = k; o.textContent = THEME_LABELS[k];
        if (k === themeName) o.selected = true;
        themeSel.appendChild(o);
      });
      themeSel.addEventListener('change', function () { setTheme(this.value); });
    }
    document.getElementById('ckBoundary').addEventListener('change', function (e) {
      if (boundaryGroup) boundaryGroup.visible = e.target.checked;
    });
    document.getElementById('ckLabels').addEventListener('change', function (e) {
      if (!e.target.checked) markerObjs.forEach(function (o) { o.el.style.display = 'none'; });
    });
    document.getElementById('ckSpin').addEventListener('change', function (e) {
      autoRotate = e.target.checked;
    });
    document.getElementById('btnReset').addEventListener('click', function () {
      flyTo({ tx: 0, ty: 0, tz: 0, azimuth: CFG.view.azimuth, polar: CFG.view.polar, radius: CFG.view.radius });
    });
    document.getElementById('dtClose').addEventListener('click', function () {
      document.getElementById('detail').hidden = true;
    });
  }

  // ── 渲染循环 ──────────────────────────────────────────
  var lastT = 0;
  function animate(t) {
    requestAnimationFrame(animate);
    if (needExagg) { updateExagg(); needExagg = false; }
    if (easing) {
      easeT += (t - lastT) || 16;
      var k = Math.min(1, easeT / easeDur);
      var s = k * k * (3 - 2 * k); // smoothstep
      azimuth = easeFrom.azimuth + (easeTo.azimuth - easeFrom.azimuth) * s;
      polar = easeFrom.polar + (easeTo.polar - easeFrom.polar) * s;
      radius = easeFrom.radius + (easeTo.radius - easeFrom.radius) * s;
      target.set(
        easeFrom.tx + (easeTo.tx - easeFrom.tx) * s,
        easeFrom.ty + (easeTo.ty - easeFrom.ty) * s,
        easeFrom.tz + (easeTo.tz - easeFrom.tz) * s
      );
      if (k >= 1) easing = false;
    } else if (autoRotate && !dragging && !panning) {
      azimuth += CFG.spin;
    }
    lastT = t;
    updateCamera();
    if (starGroup) starGroup.position.copy(camera.position); // 星空跟随相机，似无限远
    updateLabels();
    renderer.render(scene, camera);
  }

  // ── 封面兼容：暴露 window.__app.map 假实例 ──────────────
  function exposeAppStub() {
    window.__cnDemSandboxReady = true;
    // 只读状态探针（?debug=1 时才挂），用于验证预设飞行是否真的平移了观察中心
    if (new URLSearchParams(location.search).get('debug') === '1') {
      window.__cnState = function () {
        return {
          target: [+target.x.toFixed(1), +target.y.toFixed(1), +target.z.toFixed(1)],
          cam: [+camera.position.x.toFixed(1), +camera.position.y.toFixed(1), +camera.position.z.toFixed(1)],
          radius: +radius.toFixed(1), azimuth: +azimuth.toFixed(4), polar: +polar.toFixed(4)
        };
      };
    }
    window.__app = {
      map: {
        setMinZoom: function () {}, getZoom: function () { return 4; },
        getCenter: function () { return { toArray: function () { return [LON_C, LAT_C]; } }; },
        getBounds: function () { return { toArray: function () { return [[lon0, lat0], [lon0 + (cols - 1) * dlon, lat0 + (rows - 1) * dlat]]; } }; },
        fitBounds: function () {}, jumpTo: function () {}
      }
    };
  }

  // ── 启动 ──────────────────────────────────────────────
  async function init() {
    labelsEl = document.getElementById('labels');
    var q = new URLSearchParams(location.search);
    if (q.get('spin') === '0') autoRotate = false;
    var coverMode = q.get('cover') === '1';

    var mres = await fetch('data/meta.json');
    meta = await mres.json();
    cols = meta.cols; rows = meta.rows; lon0 = meta.lon0; lat0 = meta.lat0;
    dlon = meta.dlon; dlat = meta.dlat;

    var bres = await fetch('data/dem.bin');
    var buf = await bres.arrayBuffer();
    dem = new Float32Array(buf);

    if (meta.hasMask) {
      var mres2 = await fetch('data/mask.bin');
      mask = new Uint8Array(await mres2.arrayBuffer());
    }

    LON_C = lon0 + (cols - 1) * dlon / 2;
    LAT_C = lat0 + (rows - 1) * dlat / 2;
    MX_C = mercX(LON_C); MY_C = mercY(LAT_C);

    // 卫星瓦片网格先算好：地形 UV 直接引用它，保证贴图与几何严丝合缝
    buildSatGrid();

    setupThree();
    buildTerrain();
    buildBoundary();
    buildMarkers();
    buildPresets();
    bindControls();
    bindUI();

    // 封面取景：略拉远、抬高视角，给底部标题渐变留出空间
    if (coverMode) { radius = 7800; polar = 0.76; azimuth = CFG.view.azimuth; }
    updateCamera();

    document.getElementById('loading').style.display = 'none';
    exposeAppStub();
    requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
