/* 遥感卫星在轨全景 · 3D 引擎
 * 数据：data/satellites.js（window.EO_SATS，构建期由 CelesTrak TLE 生成）
 * 配置：js/config.js（window.EO_CONFIG）
 * 渲染：three.min.js（自托管，r150+）
 *
 * 设计要点：
 *  - 位置由真实轨道根数推算：圆轨道开普勒运动 + J2 项升交点进动（太阳同步轨道每天
 *    进动约 +0.99°，正好跟住太阳）。静止卫星改为按反算定点经度锁定，相对地球静止。
 *  - 地球按 GMST 自转，轨道与卫星都在 ECI 中表达，故极轨轨迹会随地球自转向西推移。
 *  - 刈幅带按地心角在球面构建三角带；「扫一天」把整天的刈幅叠成覆盖图。
 *  - 轨道高度做了非线性压缩（极轨保留相对高低，静止压到 1.55 倍地球半径）。
 *  - 支持 URL 参数：?spin=0 关自转 · ?speed=600 倍速 · ?sat=<id> 直接选中。
 *  - 封面就绪标志 window.__eoReady。
 */
(function (global) {
  'use strict';

  var DEG = Math.PI / 180, RAD = 180 / Math.PI, TWO_PI = Math.PI * 2;
  var RE = 6378.137;            /* km，TLE 反算用的赤道半径 */
  var EARTH_KM = 6371;          /* km，刈幅换算用的平均半径 */
  var EARTH_CIRC = 40075;       /* km，地球周长 */
  var J2 = 1.08263e-3;

  var CFG = global.EO_CONFIG || {};
  var DATA = global.EO_SATS || { sats: [] };
  var sats = DATA.sats.slice();
  var N = sats.length;

  var GROUPS = CFG.groups || [];
  var GCOL = {}, GKEY = [];
  GROUPS.forEach(function (g) { GCOL[g.key] = g.color; GKEY.push(g.key); });
  function rgbOf(hex) {
    var h = String(hex).replace('#', '');
    return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255];
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmt(n, d) { return Number(n).toFixed(d == null ? 1 : d); }

  /* ── 轨道预计算 ──────────────────────────────────────── */
  /* 高度 → 显示半径（地球半径 = 1）。极轨段线性铺开，1000 km 以上对数压缩，
     否则 3.6 万公里的静止轨道会跑到画面外。 */
  function dispRadius(h) {
    if (h <= 1000) return 1 + 0.18 + (clamp(h, 300, 1000) - 400) / 600 * 0.18;
    return 1 + 0.36 + (Math.log(h / 1000) / Math.log(35.786)) * 0.19;
  }
  function prep(s) {
    var a = RE + s.alt;
    var n = s.revday * TWO_PI / 86400;            /* rad/s */
    var ci = Math.cos(s.inc * DEG);
    var p = (RE / a) * (RE / a);
    s._a = a;
    s._n = n;
    s._ci = ci;
    s._si = Math.sin(s.inc * DEG);
    s._raanDot = -1.5 * n * J2 * p * ci;          /* rad/s，J2 升交点进动 */
    s._disp = dispRadius(s.alt);
    s._scale = s._disp / a;
    s._raan0 = s.raan * DEG;
    s._argp = s.argp * DEG;
    s._ma0 = s.ma * DEG;
    s._incDot = s._raanDot * RAD * 86400;         /* 度/天，用于展示 */
    s._v = Math.sqrt(398600.4418 / a);            /* km/s */
  }
  sats.forEach(prep);

  /* 儒略日 / 格林尼治平恒星时 */
  function jdFromMs(ms) { return ms / 86400000 + 2440587.5; }
  function gmstRad(ms) {
    var d = jdFromMs(ms) - 2451545.0;
    var t = d / 36525;
    return ((280.46061837 + 360.98564736629 * d + 0.000387933 * t * t) % 360) * DEG;
  }

  /* 球面坐标 → 场景坐标（经度 0 落 +X，纬度沿 +Y） */
  function spherePoint(lon, lat, r) {
    r = r == null ? 1 : r;
    var la = lat * DEG, lo = lon * DEG;
    return new THREE.Vector3(Math.cos(la) * Math.cos(lo) * r, Math.sin(la) * r, -Math.cos(la) * Math.sin(lo) * r);
  }

  /* 卫星在 ECI 中的三个分量（单位球，未缩放）；GEO 走定点经度分支 */
  function eciUnit(s, tMs, out) {
    if (s.grp === 'geo') {
      var lo = (s.lon + gmstRad(tMs) * RAD) * DEG;
      out.x = Math.cos(lo); out.y = 0; out.z = -Math.sin(lo);
      return out;
    }
    var dt = (tMs - s.epoch) / 1000;
    var raan = s._raan0 + s._raanDot * dt;
    var u = s._argp + s._ma0 + s._n * dt;
    var xo = Math.cos(u), yo = Math.sin(u);
    var cr = Math.cos(raan), sr = Math.sin(raan);
    out.x = xo * cr - yo * sr * s._ci;
    out.y = xo * sr + yo * cr * s._ci;
    out.z = yo * s._si;
    return out;
  }
  var _e = { x: 0, y: 0, z: 0 };

  /* 卫星场景坐标 */
  function satScene(s, tMs, out) {
    eciUnit(s, tMs, _e);
    var k = s._disp;
    out.set(_e.x * k, _e.z * k, -_e.y * k);
    return out;
  }

  /* 星下点地固经纬度 */
  function subPoint(s, tMs) {
    if (s.grp === 'geo') return { lon: s.lon, lat: 0 };
    eciUnit(s, tMs, _e);
    var lat = Math.asin(clamp(_e.z, -1, 1)) * RAD;
    var lon = Math.atan2(_e.y, _e.x) * RAD - gmstRad(tMs) * RAD;
    lon = ((lon + 180) % 360 + 360) % 360 - 180;
    return { lon: lon, lat: lat };
  }

  /* ── 场景 / 相机 / 渲染器 ────────────────────────────── */
  var container = document.getElementById('map');
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.05, 500);

  var ambient = new THREE.AmbientLight(0x4a5e80, 0.55);
  var sun = new THREE.DirectionalLight(0xfff4e2, 1.55);
  sun.position.set(5, 2.4, 4);
  var fill = new THREE.DirectionalLight(0x2a4a7a, 0.35);
  fill.position.set(-4, -1.5, -3);
  scene.add(ambient); scene.add(sun); scene.add(fill);

  /* 太阳跟随镜头：本图讲轨道而非昼夜，正对观察者的半球恒定受光，
     否则选中卫星若落在夜半球，刈幅带与视场就看不见了。 */
  var _sv = new THREE.Vector3();
  function updateSun() {
    _sv.copy(camera.position).normalize();
    var ang = Math.atan2(_sv.z, _sv.x) + 0.38;
    var rr = Math.sqrt(_sv.x * _sv.x + _sv.z * _sv.z);
    sun.position.set(Math.cos(ang) * rr * 12, _sv.y * 12 + 2.6, Math.sin(ang) * rr * 12);
  }

  /* 地球 */
  var earthMat = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x222222, shininess: 12 });
  var earth = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), earthMat);
  scene.add(earth);
  new THREE.TextureLoader().load('textures/earth-2k.jpg', function (tex) {
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.colorSpace = THREE.SRGBColorSpace || tex.colorSpace;
    earthMat.map = tex; earthMat.needsUpdate = true;
  }, undefined, function () { earthMat.color.setHex(0x16335c); });

  var atmo = new THREE.Mesh(
    new THREE.SphereGeometry(1.025, 64, 64),
    new THREE.MeshBasicMaterial({
      color: 0x3f7fd6, transparent: true, opacity: 0.2,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false
    })
  );
  scene.add(atmo);

  /* 经纬网格 */
  var gratMat = new THREE.LineBasicMaterial({ color: 0x8cb4e8, transparent: true, opacity: 0.22 });
  var gpts = [];
  for (var gi = -75; gi <= 75; gi += 15) {
    for (var gj = 0; gj <= 24; gj++) {
      var glo = gj * 15;
      gpts.push(spherePoint(glo, gi, 1.006), spherePoint(glo - 0.001, gi, 1.006));
    }
  }
  for (var gk = -180; gk <= 180; gk += 30) {
    for (var gm = 0; gm < 12; gm++) {
      gpts.push(spherePoint(gk, -90 + gm * 15, 1.006), spherePoint(gk, -90 + (gm + 1) * 15, 1.006));
    }
  }
  var grat = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(gpts), gratMat);
  scene.add(grat);

  /* 星空 */
  (function () {
    var n = 1500, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var u = Math.random() * 2 - 1, th = Math.random() * TWO_PI;
      var s = Math.sqrt(1 - u * u), r = 140 + Math.random() * 140;
      pos[i * 3] = r * s * Math.cos(th); pos[i * 3 + 1] = r * u; pos[i * 3 + 2] = r * s * Math.sin(th);
      var b = 0.3 + Math.random() * 0.7;
      col[i * 3] = b * 0.92; col[i * 3 + 1] = b * 0.95; col[i * 3 + 2] = b;
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({
      size: 1.4, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false
    })));
  })();

  /* ── 卫星点 ──────────────────────────────────────────── */
  function dotTexture(ring) {
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var g = c.getContext('2d');
    g.fillStyle = '#ffffff';
    g.beginPath(); g.arc(32, 32, ring ? 20 : 26, 0, TWO_PI); g.fill();
    if (ring) {
      g.lineWidth = 6; g.strokeStyle = '#ffffff';
      g.beginPath(); g.arc(32, 32, 27, 0, TWO_PI); g.stroke();
    }
    return new THREE.CanvasTexture(c);
  }
  var posBuf = new Float32Array(N * 3);
  var colBuf = new Float32Array(N * 3);
  var satGeo = new THREE.BufferGeometry();
  satGeo.setAttribute('position', new THREE.BufferAttribute(posBuf, 3));
  satGeo.setAttribute('color', new THREE.BufferAttribute(colBuf, 3));
  var points = new THREE.Points(satGeo, new THREE.PointsMaterial({
    size: 7, sizeAttenuation: false, map: dotTexture(false), vertexColors: true,
    transparent: true, opacity: 0.96, depthWrite: false, alphaTest: 0.04
  }));
  points.frustumCulled = false;
  scene.add(points);

  var marker = new THREE.Sprite(new THREE.SpriteMaterial({
    map: dotTexture(true), transparent: true, opacity: 0, depthTest: false, depthWrite: false
  }));
  marker.scale.set(0.1, 0.1, 1);
  scene.add(marker);

  /* ── 轨道线（每帧按需重建，轨道面随 J2 缓慢转动） ────── */
  var ORB_SEG = 128;
  var orbitLines = sats.map(function (s) {
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((ORB_SEG + 1) * 3), 3));
    var mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(GCOL[s.grp] || '#888'), transparent: true, opacity: 0.34
    });
    var l = new THREE.Line(g, mat);
    l.frustumCulled = false;
    scene.add(l);
    return l;
  });
  function updateOrbit(i, tMs) {
    var s = sats[i], arr = orbitLines[i].geometry.attributes.position.array;
    var dt = (tMs - s.epoch) / 1000;
    var raan = s._raan0 + s._raanDot * dt;
    var cr = Math.cos(raan), sr = Math.sin(raan);
    for (var k = 0; k <= ORB_SEG; k++) {
      var u = k / ORB_SEG * TWO_PI;
      var xo = Math.cos(u), yo = Math.sin(u);
      var xE = xo * cr - yo * sr * s._ci;
      var yE = xo * sr + yo * cr * s._ci;
      var zE = yo * s._si;
      arr[k * 3] = xE * s._disp; arr[k * 3 + 1] = zE * s._disp; arr[k * 3 + 2] = -yE * s._disp;
    }
    orbitLines[i].geometry.attributes.position.needsUpdate = true;
  }

  /* ── 刈幅带 / 一天覆盖 ───────────────────────────────── */
  /* 关键：地球贴图按 GMST 自转（earth.rotation.y = gmst），卫星场景坐标也在惯性系。
     刈幅带/视场按地固经度构建，必须放进一个每帧按 GMST 旋转的组，
     否则会整体偏转一个自转角，不落在卫星正下方。 */
  var swathGroup = new THREE.Group();
  scene.add(swathGroup);
  var swathMesh = null, swathDayMesh = null, geoDisc = null;
  function clearMesh(m) { if (m) { if (m.parent) m.parent.remove(m); m.geometry.dispose(); m.material.dispose(); } }

  var _vA = new THREE.Vector3(), _vB = new THREE.Vector3(), _vT = new THREE.Vector3(), _vBn = new THREE.Vector3();

  /* 沿星下点轨迹生成三角带：halfAng = 刈幅半宽对应的地心角 */
  function swathGeometry(s, t0, t1, samples) {
    var sw = s.swath;
    if (!sw) return null;
    var half = (sw / 2) / EARTH_KM;
    var ch = Math.cos(half), sh = Math.sin(half);
    var pts = new Array(samples);
    for (var k = 0; k < samples; k++) {
      var g = subPoint(s, t0 + (t1 - t0) * (k / (samples - 1)));
      pts[k] = spherePoint(g.lon, g.lat, 1);
    }
    var vert = new Float32Array(samples * 6);
    var idx = [];
    for (var i = 0; i < samples; i++) {
      var P = pts[i];
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(samples - 1, i + 1)];
      _vT.copy(b).sub(a);
      if (_vT.lengthSq() < 1e-12) _vT.set(0, 1, 0);
      _vT.normalize();
      _vBn.copy(_vT).cross(P).normalize();
      _vA.copy(P).multiplyScalar(ch).add(_vBn.clone().multiplyScalar(sh)).normalize().multiplyScalar(1.007);
      _vB.copy(P).multiplyScalar(ch).add(_vBn.clone().multiplyScalar(-sh)).normalize().multiplyScalar(1.007);
      vert[i * 6] = _vA.x; vert[i * 6 + 1] = _vA.y; vert[i * 6 + 2] = _vA.z;
      vert[i * 6 + 3] = _vB.x; vert[i * 6 + 4] = _vB.y; vert[i * 6 + 5] = _vB.z;
      if (i < samples - 1) {
        var o = i * 2;
        idx.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(vert, 3));
    g.setIndex(idx);
    return g;
  }

  /* 静止卫星视场：以星下点为圆心的球面帽（多层环，贴合球面；单环三角扇会穿进球体） */
  function geoDiscGeometry(lonC, angDeg, seg, rings) {
    var d = angDeg * DEG, lat0 = 0;
    var verts = [], idx = [], rim = [];
    for (var r = 0; r <= rings; r++) {
      var dr = d * r / rings;
      var sd = Math.sin(dr), cd = Math.cos(dr);
      for (var k = 0; k <= seg; k++) {
        var th = k / seg * TWO_PI;
        var lat = Math.asin(clamp(Math.sin(lat0) * cd + Math.cos(lat0) * sd * Math.cos(th), -1, 1));
        var dlon = Math.atan2(Math.sin(th) * sd * Math.cos(lat0), cd - Math.sin(lat0) * Math.sin(lat));
        var p = spherePoint(lonC + dlon * RAD, lat * RAD, 1.007);
        verts.push(p);
        if (r === rings && k < seg) rim.push(p.clone());
      }
    }
    for (var r2 = 0; r2 < rings; r2++) {
      for (var k2 = 0; k2 < seg; k2++) {
        var a = r2 * (seg + 1) + k2, b = a + 1, c = a + seg + 1, e = c + 1;
        idx.push(a, c, b, b, c, e);
      }
    }
    rim.push(rim[0].clone());
    var g = new THREE.BufferGeometry().setFromPoints(verts);
    g.setIndex(idx);
    return { fill: g, rim: new THREE.BufferGeometry().setFromPoints(rim) };
  }

  var showSwath = false, showDay = false;
  function rebuildSwath() {
    clearMesh(swathMesh); swathMesh = null;
    clearMesh(swathDayMesh); swathDayMesh = null;
    clearMesh(geoDisc); geoDisc = null;
    if (selected < 0) return;
    var s = sats[selected];
    var col = new THREE.Color(GCOL[s.grp] || '#4fd6c0');

    if (s.grp === 'geo') {
      var dd = geoDiscGeometry(s.lon, (CFG.swath && CFG.swath.geoViewDeg) || 62, 96, 8);
      geoDisc = new THREE.Mesh(dd.fill, new THREE.MeshBasicMaterial({
        color: col, transparent: true, opacity: 0.26, side: THREE.DoubleSide, depthWrite: false
      }));
      swathGroup.add(geoDisc);
      var rim = new THREE.Line(dd.rim, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.95 }));
      swathGroup.add(rim);
      swathMesh = rim;
      return;
    }
    if (!s.swath) return;
    var span = ((CFG.swath && CFG.swath.showSeconds) || 50) * 1000;
    if (showDay) {
      var gd = swathGeometry(s, tNow - 43200000, tNow + 43200000, (CFG.swath && CFG.swath.daySamples) || 2600);
      if (gd) {
        swathDayMesh = new THREE.Mesh(gd, new THREE.MeshBasicMaterial({
          color: col, transparent: true, opacity: 0.19, side: THREE.DoubleSide, depthWrite: false
        }));
        swathGroup.add(swathDayMesh);
      }
    } else if (showSwath) {
      var gs = swathGeometry(s, tNow - span, tNow + span, 110);
      if (gs) {
      swathMesh = new THREE.Mesh(gs, new THREE.MeshBasicMaterial({
        color: col, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false
      }));
      swathGroup.add(swathMesh);
      }
    }
  }

  /* ── 状态 ────────────────────────────────────────────── */
  var grpOn = {}; GKEY.forEach(function (k) { grpOn[k] = true; });
  var tNow = Date.now();
  var speed = CFG.defaultSpeed != null ? CFG.defaultSpeed : 60;
  var playing = true;
  var selected = -1;
  var followMode = false;   /* 名单点选后镜头持续跟随卫星星下点 */
  var followR = 2.6;        /* 跟随时的目标相机半径（滚轮可改） */
  var frameNo = 0;

  /* ── 相机（球面坐标 + 自写拖拽缩放） ─────────────────── */
  var presetView = Object.assign({ lon: 105, lat: 12, radius: 3.4 }, CFG.view || {});
  var cur = { lon: presetView.lon, lat: presetView.lat, radius: presetView.radius };
  var goal = { lon: cur.lon, lat: cur.lat, radius: cur.radius };
  var easing = false, dragging = false;
  var minR = CFG.minRadius != null ? CFG.minRadius : 1.28;
  var maxR = CFG.maxRadius != null ? CFG.maxRadius : 9;
  var spinSpeed = CFG.spin != null ? CFG.spin : 0.03;

  function applyCam(v) {
    var p = spherePoint(v.lon, clamp(v.lat, -89, 89), clamp(v.radius, minR, maxR));
    camera.position.copy(p);
    camera.lookAt(0, 0, 0);
  }
  function snapCamera() { applyCam(cur); }
  function flyTo(v) {
    goal.lon = v.lon; goal.lat = clamp(v.lat, -89, 89); goal.radius = clamp(v.radius, minR, maxR);
    easing = true;
  }

  var viewOff = -1;
  function discRadiusPx() {
    var halfFov = camera.fov * DEG / 2;
    return Math.asin(clamp(1 / presetView.radius, -1, 1)) / halfFov * (container.clientHeight / 2);
  }
  function updateViewOffset() {
    if (isCover) return;
    var off = 0;
    var intro = document.getElementById('intro');
    if (!hasMenu() && intro) {
      var cw = container.clientWidth;
      off = clamp(intro.offsetWidth + 46 + discRadiusPx() - cw / 2, 0, cw * 0.3);
    }
    if (Math.abs(off - viewOff) < 0.5) return;
    viewOff = off;
    if (off > 1) camera.setViewOffset(container.clientWidth, container.clientHeight, -off, 0, container.clientWidth, container.clientHeight);
    else camera.clearViewOffset();
  }

  /* ── URL 参数 ────────────────────────────────────────── */
  var pendingSat = null, spinOK = true, isCover = false, pendingView = null, pendingFollow = false;
  try {
    var qs = new URLSearchParams(global.location.search);
    spinOK = qs.get('spin') !== '0';
    if (qs.get('speed') != null) { var sv = parseFloat(qs.get('speed')); if (!isNaN(sv)) speed = sv; }
    if (qs.get('sat')) pendingSat = qs.get('sat');
    if (qs.get('swath') === '1') showSwath = true;
    if (qs.get('day') === '1') showDay = true;
    /* 封面取景：?cover=1 隐藏左栏并取消右移偏移，?view=lon,lat,radius 指定机位，
       ?follow=1 把镜头对准选中卫星的星下点（否则刈幅带可能落在地球背面） */
    if (qs.get('cover') === '1') isCover = true;
    if (qs.get('follow') === '1') pendingFollow = true;
    if (qs.get('view')) {
      var vv = String(qs.get('view')).split(',');
      if (vv.length === 3 && isFinite(+vv[0]) && isFinite(+vv[1]) && isFinite(+vv[2])) {
        pendingView = { lon: +vv[0], lat: +vv[1], radius: +vv[2] };
      }
    }
  } catch (e) { /* 忽略 */ }
  var spinning = spinOK;
  function stopSpin() { spinning = false; }

  /* ── 交互 ────────────────────────────────────────────── */
  var pointers = {}, lastP = null, moving = false, pinchDist = 0;
  function pointersCount() { return Object.keys(pointers).length; }
  function pointerDist() {
    var ks = Object.keys(pointers); if (ks.length < 2) return 0;
    var a = pointers[ks[0]], b = pointers[ks[1]];
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
  }
  function onDown(e) {
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    lastP = { x: e.clientX, y: e.clientY }; moving = false; easing = false; dragging = true; stopSpin();
    followMode = false;
    if (pointersCount() === 2) pinchDist = pointerDist();
    if (renderer.domElement.setPointerCapture) { try { renderer.domElement.setPointerCapture(e.pointerId); } catch (e2) { /* noop */ } }
  }
  function onMove(e) {
    if (!pointers[e.pointerId]) return;
    var dx = e.clientX - pointers[e.pointerId].x, dy = e.clientY - pointers[e.pointerId].y;
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (Math.abs(e.clientX - lastP.x) + Math.abs(e.clientY - lastP.y) > 3) moving = true;
    if (pointersCount() >= 2) {
      var d = pointerDist();
      if (pinchDist > 0) cur.radius = clamp(cur.radius * pinchDist / Math.max(20, d), minR, maxR);
      pinchDist = d;
    } else {
      cur.lon -= dx * 0.42; cur.lat = clamp(cur.lat + dy * 0.28, -89, 89);
    }
    goal.lon = cur.lon; goal.lat = cur.lat; goal.radius = cur.radius;
    lastP = { x: e.clientX, y: e.clientY };
  }
  function onUp(e) {
    if (!pointers[e.pointerId]) return;
    delete pointers[e.pointerId];
    if (pointersCount() === 1) pinchDist = 0;
    if (pointersCount() === 0) dragging = false;
  }
  function onWheel(e) {
    e.preventDefault();
    cur.radius = clamp(cur.radius * (e.deltaY > 0 ? 1.09 : 0.92), minR, maxR);
    goal.radius = cur.radius; followR = cur.radius; stopSpin();
  }

  var _p = new THREE.Vector3();
  function findNearest(sx, sy) {
    var w = container.clientWidth, h = container.clientHeight, best = -1, bd = 18;
    for (var i = 0; i < N; i++) {
      if (!grpOn[sats[i].grp]) continue;
      satScene(sats[i], tNow, _p);
      var v = _p.clone().project(camera);
      if (v.z >= 1) continue;
      var x = (v.x + 1) * 0.5 * w, y = (1 - (v.y + 1) * 0.5) * h;
      var d = Math.sqrt((x - sx) * (x - sx) + (y - sy) * (y - sy));
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
  renderer.domElement.addEventListener('pointerdown', onDown);
  global.addEventListener('pointermove', onMove, { passive: true });
  global.addEventListener('pointerup', onUp);
  global.addEventListener('pointercancel', onUp);
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
  renderer.domElement.addEventListener('click', function (e) {
    if (moving) return;
    var rect = renderer.domElement.getBoundingClientRect();
    var hit = findNearest(e.clientX - rect.left, e.clientY - rect.top);
    if (hit >= 0) { followMode = false; selectSat(hit); } else deselect();
  });

  /* ── 选中与详情卡 ────────────────────────────────────── */
  function grpName(k) {
    for (var i = 0; i < GROUPS.length; i++) if (GROUPS[i].key === k) return GROUPS[i].name;
    return k;
  }
  function selectSat(i) {
    selected = i; stopSpin();
    /* 选中即给看头：极轨亮刈幅带，静止亮视场圆盘 */
    showDay = false;
    showSwath = sats[i].grp !== 'geo' && !!sats[i].swath;
    /* 静止卫星转过去看它的视场圆盘，否则多半在地球背面。
       相机经度也要加上 GMST：地固经度 s.lon 在场景中出现在 s.lon + GMST 处 */
    if (sats[i].grp === 'geo') flyTo({ lon: sats[i].lon + gmstRad(tNow) * RAD, lat: 8, radius: 4.2 });
    rebuildSwath();
    openCard(i);
    syncList();
  }
  function deselect() {
    selected = -1;
    followMode = false;
    clearMesh(swathMesh); swathMesh = null;
    clearMesh(swathDayMesh); swathDayMesh = null;
    clearMesh(geoDisc); geoDisc = null;
    var c = document.getElementById('satcard'); if (c) c.hidden = true;
    syncList();
  }
  function openCard(i) {
    var s = sats[i];
    var card = document.getElementById('satcard');
    document.getElementById('scName').textContent = s.cn;
    document.getElementById('scCode').innerHTML = esc(s.code) + '<span>' + esc(s.nat) + ' · ' + s.year + ' 年</span>';
    var m = [
      ['轨道类型', grpName(s.grp)],
      ['轨道高度', fmt(s.alt, 0) + ' km'],
      ['倾角', fmt(s.inc, 2) + '°'],
      ['周期', fmt(s.period, 1) + ' min'],
      ['速度', fmt(s._v, 2) + ' km/s'],
      ['轨道面进动', fmt(s._incDot, 2) + '°/天']
    ];
    if (s.grp === 'geo') m.push(['定点经度', s.slot]);
    m.push(['分辨率', s.res]);
    m.push(['重访', s.revisit]);
    document.getElementById('scMetrics').innerHTML = m.map(function (r, k) {
      return '<span' + (k >= 6 ? ' class="wide"' : '') + '><small>' + esc(r[0]) + '</small><b>' + esc(r[1]) + '</b></span>';
    }).join('');
    document.getElementById('scNote').textContent = s.note;
    var sw = s.swath;
    var swWrap = document.querySelector('.sw-row');
    if (swWrap) swWrap.hidden = !sw;
    if (sw) {
      document.getElementById('scSwathNum').textContent = String(sw);
      document.getElementById('scSwathBar').style.width = (sw / EARTH_CIRC * 100).toFixed(2) + '%';
    }
    var bs = document.getElementById('btnSwath'), bd = document.getElementById('btnDay');
    if (bs) bs.classList.toggle('on', showSwath && !showDay);
    if (bd) bd.classList.toggle('on', showDay);
    if (card) card.hidden = false;
  }

  /* 名单同步高亮 */
  function syncList() {
    var host = document.getElementById('satList');
    if (!host) return;
    var items = host.querySelectorAll('.sat-item');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle('on', parseInt(items[i].getAttribute('data-i'), 10) === selected);
    }
  }

  /* ── UI 构建 ─────────────────────────────────────────── */
  function hasMenu() { return global.innerWidth <= 900; }

  function buildPresets() {
    var host = document.getElementById('presetList');
    if (!host) return;
    (CFG.presets || []).forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = p.name;
      b.addEventListener('click', function () { if (hasMenu()) setIntroCollapsed(true); flyTo(p); });
      host.appendChild(b);
    });
  }
  function buildGroups() {
    var host = document.getElementById('grpList');
    if (!host) return;
    GROUPS.forEach(function (g) {
      var n = sats.filter(function (s) { return s.grp === g.key; }).length;
      var lab = document.createElement('label');
      lab.className = 'grp-row';
      lab.innerHTML = '<input type="checkbox" checked /><s class="lg" style="background:' + g.color + '"></s>' +
        '<span><b>' + esc(g.name) + '</b> <i>' + esc(g.sub) + '</i></span><em>' + n + ' 颗</em>';
      host.appendChild(lab);
      var ck = lab.querySelector('input');
      ck.addEventListener('change', function () { grpOn[g.key] = ck.checked; applyGroupVisible(); });
    });
  }
  function applyGroupVisible() {
    for (var i = 0; i < N; i++) orbitLines[i].visible = grpOn[sats[i].grp];
    if (selected >= 0 && !grpOn[sats[selected].grp]) deselect();
  }
  function buildSpeeds() {
    var host = document.getElementById('spdRow');
    if (!host) return;
    (CFG.speeds || []).forEach(function (v) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = v + '×';
      b.classList.toggle('on', v === speed);
      b.addEventListener('click', function () {
        speed = v;
        var all = host.querySelectorAll('button');
        for (var k = 0; k < all.length; k++) all[k].classList.toggle('on', all[k] === b);
      });
      host.appendChild(b);
    });
  }
  function buildList() {
    var host = document.getElementById('satList');
    if (!host) return;
    GROUPS.forEach(function (g) {
      var h = document.createElement('div');
      h.className = 'sat-grp';
      h.innerHTML = '<s class="lg" style="background:' + g.color + '"></s>' + esc(g.name);
      host.appendChild(h);
      sats.forEach(function (s, i) {
        if (s.grp !== g.key) return;
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'sat-item'; b.setAttribute('data-i', String(i));
        b.innerHTML = esc(s.cn) + '<u>' + fmt(s.alt, 0) + ' km</u>';
        b.addEventListener('click', function () {
          selectSat(i);
          /* 名单点选：飞到卫星星下点并持续跟随（静止卫星由 selectSat 内的 flyTo 处理） */
          if (sats[i].grp !== 'geo') {
            followMode = true;
            followR = Math.min(cur.radius, 2.6);
          }
          if (hasMenu()) setIntroCollapsed(true);
        });
        host.appendChild(b);
      });
    });
  }

  var btnPlay = document.getElementById('btnPlay');
  if (btnPlay) btnPlay.addEventListener('click', function () {
    playing = !playing;
    btnPlay.textContent = playing ? '❙❙ 暂停' : '▶ 播放';
  });
  var btnNow = document.getElementById('btnNow');
  if (btnNow) btnNow.addEventListener('click', function () { tNow = Date.now(); rebuildSwath(); });
  var bs = document.getElementById('btnSwath');
  if (bs) bs.addEventListener('click', function () {
    showSwath = !showSwath || showDay; showDay = false; rebuildSwath();
    bs.classList.toggle('on', showSwath);
    var bd2 = document.getElementById('btnDay'); if (bd2) bd2.classList.remove('on');
  });
  var bd = document.getElementById('btnDay');
  if (bd) bd.addEventListener('click', function () {
    showDay = !showDay; if (showDay) showSwath = false; rebuildSwath();
    bd.classList.toggle('on', showDay);
    var bs2 = document.getElementById('btnSwath'); if (bs2) bs2.classList.remove('on');
  });
  var scClose = document.getElementById('scClose');
  if (scClose) scClose.addEventListener('click', function (e) { e.stopPropagation(); deselect(); });

  var intro = document.getElementById('intro');
  var introBar = document.getElementById('introBar');
  var introCollapsed = false;
  function setIntroCollapsed(c) { if (!intro) return; intro.classList.toggle('is-collapsed', c); introCollapsed = c; }
  if (introBar) introBar.addEventListener('click', function () { setIntroCollapsed(!introCollapsed); });
  document.getElementById('btnOverview').addEventListener('click', function () {
    flyTo((CFG.presets || [])[0] || presetView); deselect();
  });

  /* ── 主循环 ──────────────────────────────────────────── */
  var lastT = performance.now();
  var labelEl = document.getElementById('satLabel');
  var clockEl = document.getElementById('tmClock');

  function utcText(ms) {
    var d = new Date(ms);
    function p(v) { return v < 10 ? '0' + v : String(v); }
    return d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate()) +
      ' ' + p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds());
  }

  function frame() {
    requestAnimationFrame(frame);
    var now = performance.now();
    var dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    frameNo++;

    if (playing) tNow += dt * 1000 * speed;

    if (spinning && !easing && !dragging) cur.lon += spinSpeed;
    if (easing) {
      cur.lon += (goal.lon - cur.lon) * 0.1;
      cur.lat += (goal.lat - cur.lat) * 0.1;
      cur.radius += (goal.radius - cur.radius) * 0.1;
      if (Math.abs(goal.lon - cur.lon) < 0.001 && Math.abs(goal.lat - cur.lat) < 0.001 && Math.abs(goal.radius - cur.radius) < 0.001) {
        cur.lon = goal.lon; cur.lat = goal.lat; cur.radius = goal.radius; easing = false;
      }
    }
    /* 名单跟随：镜头持续对准选中卫星的星下点（拖拽即解除）。
       不走 flyTo——它的目标点会冻结，追不上 60 倍速下移动的卫星 */
    if (followMode && selected >= 0 && !dragging && !easing) {
      var fsp = subPoint(sats[selected], tNow);
      var fLon = fsp.lon + gmstRad(tNow) * RAD;
      var dLon = ((fLon - cur.lon + 180) % 360 + 360) % 360 - 180;   /* 取最短经度差，防反子午线甩镜头 */
      cur.lon += dLon * 0.12;
      cur.lat += (clamp(fsp.lat, -58, 58) - cur.lat) * 0.12;
      cur.radius += (followR - cur.radius) * 0.08;
      goal.lon = cur.lon; goal.lat = cur.lat; goal.radius = cur.radius;
    }
    /* 地固系刈幅带 / 视场随地球自转角旋转，保持落在卫星正下方 */
    swathGroup.rotation.y = gmstRad(tNow);
    snapCamera();
    updateSun();
    earth.rotation.y = gmstRad(tNow);

    /* 卫星点 */
    var r = 0;
    for (var i = 0; i < N; i++) {
      if (!grpOn[sats[i].grp]) continue;
      satScene(sats[i], tNow, _p);
      posBuf[r * 3] = _p.x; posBuf[r * 3 + 1] = _p.y; posBuf[r * 3 + 2] = _p.z;
      var c = rgbOf(GCOL[sats[i].grp] || '#888888');
      colBuf[r * 3] = c[0]; colBuf[r * 3 + 1] = c[1]; colBuf[r * 3 + 2] = c[2];
      r++;
    }
    satGeo.setDrawRange(0, r);
    satGeo.attributes.position.needsUpdate = true;
    satGeo.attributes.color.needsUpdate = true;

    /* 轨道线：进动很慢，每 12 帧刷一次即可 */
    if (frameNo % 12 === 0) {
      for (var j = 0; j < N; j++) if (orbitLines[j].visible) updateOrbit(j, tNow);
    }

    /* 实时刈幅带跟着卫星走 */
    if (showSwath && !showDay && selected >= 0 && swathMesh && sats[selected].grp !== 'geo') {
      var span = ((CFG.swath && CFG.swath.showSeconds) || 240) * 1000;
      var gs = swathGeometry(sats[selected], tNow - span, tNow + span, 110);
      if (gs) { swathMesh.geometry.dispose(); swathMesh.geometry = gs; }
    }
    if (showDay && swathDayMesh && selected >= 0 && frameNo % 240 === 0) rebuildSwath();

    /* 选中标记 + 标签 */
    if (selected >= 0) {
      satScene(sats[selected], tNow, _p);
      marker.position.copy(_p);
      var sc = 0.1 * (1 + 0.07 * Math.sin(now * 0.006));
      marker.scale.set(sc, sc, 1);
      marker.material.opacity += (0.95 - marker.material.opacity) * 0.2;
      var v = _p.clone().project(camera);
      if (v.z < 1 && labelEl) {
        labelEl.hidden = false;
        labelEl.textContent = sats[selected].cn;
        labelEl.style.left = ((v.x + 1) * 0.5 * container.clientWidth) + 'px';
        labelEl.style.top = ((1 - (v.y + 1) * 0.5) * container.clientHeight) + 'px';
      } else if (labelEl) labelEl.hidden = true;
    } else {
      marker.material.opacity += (0 - marker.material.opacity) * 0.2;
      if (labelEl) labelEl.hidden = true;
    }

    if (clockEl) clockEl.textContent = utcText(tNow);

    renderer.render(scene, camera);
  }

  /* ── 尺寸 ────────────────────────────────────────────── */
  var resizeTimer = 0;
  global.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      updateViewOffset();
    }, 80);
  });

  /* ── 启动 ────────────────────────────────────────────── */
  document.getElementById('fCount').textContent = String(N);
  var fe = document.getElementById('fEpoch');
  if (fe) fe.textContent = DATA.epochFetched || '—';
  buildPresets();
  buildGroups();
  buildSpeeds();
  buildList();
  applyGroupVisible();
  if (isCover && intro) intro.style.display = 'none';
  if (pendingView) {
    cur.lon = goal.lon = pendingView.lon;
    cur.lat = goal.lat = pendingView.lat;
    cur.radius = goal.radius = clamp(pendingView.radius, minR, maxR);
  }
  for (var q = 0; q < N; q++) updateOrbit(q, tNow);
  snapCamera();
  updateViewOffset();
  if (hasMenu() && intro) setIntroCollapsed(true);
  if (pendingSat) {
    for (var w = 0; w < N; w++) if (sats[w].id === pendingSat) { selectSat(w); break; }
  }
  if (pendingFollow && selected >= 0 && sats[selected].grp !== 'geo') {
    var g0 = subPoint(sats[selected], tNow);
    /* 相机对准的是场景经度（地固经度 + GMST），与刈幅带同一坐标系 */
    cur.lon = goal.lon = g0.lon + gmstRad(tNow) * RAD;
    cur.lat = goal.lat = clamp(g0.lat, -55, 55);
    if (!pendingView) cur.radius = goal.radius = 3.2;
    snapCamera();
    if (showSwath && !showDay) rebuildSwath();
  }
  frame();

  /* 封面脚本兼容：3D 图无 MapLibre，给最小假实例让 gen_map_cover 跳过 2D fit */
  global.__app = {
    map: {
      setMinZoom: function () {}, jumpTo: function () {}, setZoom: function () {},
      getCenter: function () { return { toArray: function () { return [0, 0]; } }; },
      getZoom: function () { return 2; },
      getBounds: function () { return { toArray: function () { return [[-180, -90], [180, 90]]; } }; },
      fitBounds: function () {}, getLayer: function () { return null; }, setLayoutProperty: function () {}
    },
    mapReady: true
  };
  /* 数值探针（?debug=1）：headless 验证用 */
  if (new URLSearchParams(global.location.search).get('debug') === '1') {
    global.__eoState = function () {
      var out = { t: tNow, gmstDeg: gmstRad(tNow) * RAD, cam: { lon: cur.lon, lat: cur.lat, radius: cur.radius }, selected: selected, follow: followMode, easing: easing, goal: { lon: goal.lon, lat: goal.lat, radius: goal.radius } };
      if (selected >= 0) {
        var s = sats[selected];
        satScene(s, tNow, _p);
        out.sat = { sub: subPoint(s, tNow), scene: [_p.x, _p.y, _p.z] };
        var msh = swathMesh && swathMesh.geometry ? swathMesh : (swathDayMesh && swathDayMesh.geometry ? swathDayMesh : null);
        if (msh) {
          var arr = msh.geometry.attributes.position.array;
          var mv = new THREE.Vector3();
          var best = 180;
          for (var k = 0; k < arr.length; k += 3) {
            mv.set(arr[k], arr[k + 1], arr[k + 2]).applyMatrix4(msh.matrixWorld).normalize();
            var dot = clamp(mv.dot(_p) / _p.length(), -1, 1);
            var ang = Math.acos(dot) * RAD;
            if (ang < best) best = ang;
          }
          out.swathNearestDeg = best;
        }
      }
      return out;
    };
  }
  global.__eoReady = true;
})(window);
