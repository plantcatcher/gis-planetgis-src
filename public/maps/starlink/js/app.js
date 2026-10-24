/* 星链环绕地球 · 3D 引擎
 * 数据：data/shells.js（window.STARLINK_SHELLS / STARLINK_SATS / STARLINK_META）
 * 配置：js/config.js（window.STARLINK_CONFIG）
 * 渲染：three.min.js（自托管，r150+）
 *
 * 设计要点：
 *  - 地球 = 真实昼面贴图打底 + 大气辉光 + 可选经纬网格；固定太阳方向形成昼夜终结线，
 *    地球缓慢自转让晨昏线扫过表面。
 *  - 卫星 = 数千发光点，按 Walker 星座组织成 53°/70°/97.6° 三个壳层网格；
 *    运行时按开普勒第三定律相对速度绕地球运行（时间可加速）。
 *  - 时间轴：滑块 / 播放，揭示 2019→2026 累积部署的卫星（模型在轨数）。
 *  - 壳层开关、轨道速度、地球自转、自动旋转均可切换。
 *  - 点击卫星弹出最小详情（壳层 / 真实高度 / 倾角 / 轨道面 / 周期 / 速度）。
 *  - 支持 URL 参数：?spin=0 关自转 · ?t=0.5 时间轴位置 · ?speed=2 轨道速度倍数。
 *  - 封面就绪标志 window.__starlinkReady。
 */
(function (global) {
  'use strict';

  var DEG = Math.PI / 180, RAD = 180 / Math.PI;
  var config = global.STARLINK_CONFIG || {};
  var SHELLS = global.STARLINK_SHELLS || [];
  var META = global.STARLINK_META || {};
  var satsRaw = global.STARLINK_SATS || [];

  /* 卫星按部署进度 u 升序排列，时间轴揭示 = 取前 visN 颗，壳层开关再二次过滤 */
  var sats = satsRaw.slice().sort(function (a, b) { return a.u - b.u; });
  var uSorted = sats.map(function (s) { return s.u; });
  var N = sats.length;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* 壳层颜色 → 归一化 RGB（供 Points 顶点色） */
  var SHELL_COL = SHELLS.map(function (sh) {
    var h = sh.color.replace('#', '');
    return [
      parseInt(h.substr(0, 2), 16) / 255,
      parseInt(h.substr(2, 2), 16) / 255,
      parseInt(h.substr(4, 2), 16) / 255
    ];
  });

  /* ── 场景 / 相机 / 渲染器 ─────────────────────────────── */
  var container = document.getElementById('map');
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 400);

  /* 球面坐标 → 世界坐标（经度 0 落 +X，纬度沿 +Y；与地球纹理/赤道一致） */
  function spherePoint(lon, lat, r) {
    r = r || 1;
    var la = lat * DEG, lo = lon * DEG;
    return new THREE.Vector3(
      Math.cos(la) * Math.cos(lo) * r,
      Math.sin(la) * r,
      -Math.cos(la) * Math.sin(lo) * r
    );
  }

  /* ── 地球 ─────────────────────────────────────────────── */
  var earthMat = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x222222, shininess: 12 });
  var earth = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 96), earthMat);
  scene.add(earth);
  new THREE.TextureLoader().load('textures/earth-2k.jpg', function (tex) {
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.colorSpace = THREE.SRGBColorSpace || tex.colorSpace;
    earthMat.map = tex;
    earthMat.needsUpdate = true;
  }, undefined, function () {
    earthMat.color.setHex(0x16335c);
  });

  /* 大气辉光：略大的背面球，叠加蓝色，制造边缘光晕 */
  var atmo = new THREE.Mesh(
    new THREE.SphereGeometry(1.03, 64, 64),
    new THREE.MeshBasicMaterial({
      color: 0x3f7fd6, transparent: true, opacity: 0.22,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false
    })
  );
  scene.add(atmo);

  /* 经纬网格：贴球，半径略大于地表 */
  var gratMat = new THREE.LineBasicMaterial({ color: 0x8cb4e8, transparent: true, opacity: 0.28 });
  var gratGeo = new THREE.BufferGeometry();
  var gpts = [];
  for (var gi = -75; gi <= 75; gi += 15) {
    for (var gj = 0; gj <= 24; gj++) {
      var glo = gj * 360 / 24;
      gpts.push(spherePoint(glo, gi, 1.012));
      gpts.push(spherePoint(glo, gi + 0.001, 1.012));
    }
  }
  for (var gk = -180; gk <= 180; gk += 30) {
    for (var gm = 0; gm < 12; gm++) {
      var gla0 = -90 + gm * 180 / 12, gla1 = -90 + (gm + 1) * 180 / 12;
      gpts.push(spherePoint(gk, gla0, 1.012));
      gpts.push(spherePoint(gk, gla1, 1.012));
    }
  }
  gratGeo.setFromPoints(gpts);
  var grat = new THREE.LineSegments(gratGeo, gratMat);
  grat.visible = false;
  scene.add(grat);

  /* 星空背景 */
  var stars = (function () {
    var n = 1600, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2;
      var s = Math.sqrt(1 - u * u), r = 120 + Math.random() * 120;
      pos[i * 3] = r * s * Math.cos(th);
      pos[i * 3 + 1] = r * u;
      pos[i * 3 + 2] = r * s * Math.sin(th);
      var b = 0.3 + Math.random() * 0.7, warm = Math.random() < 0.12;
      col[i * 3] = b * (warm ? 1 : 0.9);
      col[i * 3 + 1] = b * 0.94;
      col[i * 3 + 2] = b * (warm ? 0.8 : 1);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var m = new THREE.PointsMaterial({ size: 1.4, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false });
    var p = new THREE.Points(g, m);
    scene.add(p);
    return p;
  })();

  /* ── 光照（固定太阳方向 → 昼夜终结线） ─────────────────── */
  var ambient = new THREE.AmbientLight(0x4a5e80, 0.55);
  scene.add(ambient);
  var sun = new THREE.DirectionalLight(0xfff4e2, 1.5);
  sun.position.set(5, 2.4, 4);
  scene.add(sun);
  var fill = new THREE.DirectionalLight(0x2a4a7a, 0.35);
  fill.position.set(-4, -1.5, -3);
  scene.add(fill);

  /* ── 卫星星座（Points，按帧重算位置并写入渲染缓冲） ───── */
  var renderPos = new Float32Array(N * 3);
  var renderCol = new Float32Array(N * 3);
  var satGeo = new THREE.BufferGeometry();
  satGeo.setAttribute('position', new THREE.BufferAttribute(renderPos, 3));
  satGeo.setAttribute('color', new THREE.BufferAttribute(renderCol, 3));
  var satMat = new THREE.PointsMaterial({
    size: 2.7, sizeAttenuation: false, vertexColors: true,
    transparent: true, opacity: 0.95, depthWrite: false
  });
  var points = new THREE.Points(satGeo, satMat);
  points.frustumCulled = false;       /* 位置每帧变动，关闭视锥剔除以免误剔 */
  scene.add(points);

  /* 选中卫星高亮环 */
  var ring = (function () {
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var g = c.getContext('2d');
    g.lineWidth = 7; g.strokeStyle = '#ffffff';
    g.beginPath(); g.arc(64, 64, 50, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#ffffff';
    g.beginPath(); g.arc(64, 64, 12, 0, Math.PI * 2); g.fill();
    var tex = new THREE.CanvasTexture(c);
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthTest: true, depthWrite: false }));
    sp.scale.set(0.06, 0.06, 1);
    scene.add(sp);
    return sp;
  })();
  var ringOn = false;
  function showRing() { ringOn = true; }
  function hideRing() { ringOn = false; }

  /* 单颗卫星世界坐标：近焦点在赤道面 → 倾角绕 X → 升交点绕 Y */
  function satPos(i, t) {
    var s = sats[i];
    var ma = s.ma0 + s.rate * t;
    var cma = Math.cos(ma), sma = Math.sin(ma);
    var x1 = s.a * cma;
    var y1 = -s.a * sma * s.sinInc;
    var z1 = s.a * sma * s.cosInc;
    var x2 = x1 * s.cosRaan + z1 * s.sinRaan;
    var y2 = y1;
    var z2 = -x1 * s.sinRaan + z1 * s.cosRaan;
    return { x: x2, y: y2, z: z2 };
  }

  /* ── 状态 ─────────────────────────────────────────────── */
  var shellOn = SHELLS.map(function () { return true; });
  var visN = N;                      /* 时间轴揭示的卫星数（u 升序后前 visN 颗） */
  var timeScale = config.timeline ? config.timeline.baseTimeScale : 620;
  var speedMult = 1;
  var tSim = 0;                      /* 仿真时间（秒） */
  var earthSpinOn = true;
  var earthSpinRate = 0.035;        /* rad / 真实秒 */
  var playing = false, playT = 0;
  var selected = -1;

  function bisectRight(arr, x) {
    var lo = 0, hi = arr.length;
    while (lo < hi) { var mid = (lo + hi) >> 1; if (arr[mid] <= x) lo = mid + 1; else hi = mid; }
    return lo;
  }
  function setTimeline(t) {
    t = clamp(t, 0, 1);
    var thr = META.revealFraction ? META.revealFraction(t) : t;
    visN = bisectRight(uSorted, thr);
    var yr = META.progressToYear ? META.progressToYear(t) : 2026;
    var ry = document.getElementById('tmYear');
    var rc = document.getElementById('tmCount');
    var rc2 = document.getElementById('tmCount2');
    if (ry) ry.textContent = formatYear(yr);
    if (rc) rc.textContent = visN.toLocaleString('en-US');
    if (rc2) rc2.textContent = visN.toLocaleString('en-US');
    updateShellStats();
  }
  function formatYear(y) {
    /* 只返回数字；「年」作为静态文本留在 HTML 里，便于 i18n 单独替换 */
    return y.toFixed(1).replace(/\.0$/, '');
  }
  function updateShellStats() {
    var counts = SHELLS.map(function () { return 0; });
    for (var i = 0; i < visN; i++) if (shellOn[sats[i].sh]) counts[sats[i].sh]++;
    var host = document.getElementById('shellStats');
    if (host) {
      host.innerHTML = SHELLS.map(function (sh, k) {
        return '<span><s class="lg" style="background:' + sh.color + '"></s>' + esc(sh.name) +
          ' <b>' + counts[k].toLocaleString('en-US') + '</b></span>';
      }).join('');
    }
  }

  /* ── 相机视图（球面坐标 + 自写拖拽缩放） ──────────────── */
  var presetView = Object.assign({ lon: 0, lat: 12, radius: 2.7 }, config.view || {});
  var cur = { lon: presetView.lon, lat: presetView.lat, radius: presetView.radius };
  var goal = { lon: cur.lon, lat: cur.lat, radius: cur.radius };
  var easing = false, dragging = false;
  var minR = config.minRadius != null ? config.minRadius : 1.45;
  var maxR = config.maxRadius != null ? config.maxRadius : 6;
  var spinSpeed = config.spin != null ? config.spin : 0.045;

  function applyCam(v, immediate) {
    var lon = v.lon, lat = clamp(v.lat, -89, 89), r = clamp(v.radius, minR, maxR);
    var p = spherePoint(lon, lat, r);
    if (immediate) camera.position.copy(p); else camera.position.lerp(p, 0.1);
    camera.lookAt(0, 0, 0);
  }
  function snapCamera() { applyCam(cur, true); }
  function flyTo(v) {
    goal.lon = v.lon; goal.lat = clamp(v.lat, -89, 89); goal.radius = clamp(v.radius, minR, maxR);
    easing = true;
  }
  function wrapDelta(c, t) { var d = ((t - c) % 360 + 540) % 360 - 180; return c + d; }

  /* 桌面端把地球整体右移，避开左侧介绍栏 */
  var viewOff = -1;
  function discRadiusPx() {
    var halfFov = camera.fov * DEG / 2;
    var ang = Math.asin(clamp(1 / presetView.radius, -1, 1));
    return ang / halfFov * (container.clientHeight / 2);
  }
  function updateViewOffset() {
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

  /* ── 自动旋转 ─────────────────────────────────────────── */
  var pendingT = null, pendingSpeed = null;
  var spinOK = true;
  try {
    var qs = new URLSearchParams(global.location.search);
    spinOK = qs.get('spin') !== '0';
    if (qs.get('t') != null) { var tv = parseFloat(qs.get('t')); if (!isNaN(tv)) pendingT = clamp(tv, 0, 1); }
    if (qs.get('speed') != null) { var sv = parseFloat(qs.get('speed')); if (!isNaN(sv)) pendingSpeed = sv; }
  } catch (_) {}
  var spinning = spinOK;
  function stopSpin() { spinning = false; var ck = document.getElementById('ckSpin'); if (ck) ck.checked = false; }

  /* ── 交互：拖拽 / 缩放 / 点击 ─────────────────────────── */
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
    if (pointersCount() === 2) pinchDist = pointerDist();
    if (renderer.domElement.setPointerCapture) { try { renderer.domElement.setPointerCapture(e.pointerId); } catch (_) {} }
  }
  function onMove(e) {
    if (!pointers[e.pointerId]) return;
    var dx = e.clientX - pointers[e.pointerId].x, dy = e.clientY - pointers[e.pointerId].y;
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (Math.abs(e.clientX - lastP.x) + Math.abs(e.clientY - lastP.y) > 3) moving = true;
    var n = pointersCount();
    if (n >= 2) {
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
    goal.radius = cur.radius; stopSpin();
  }

  /* 点击：命中已部署且开启壳层的卫星（屏幕最近，阈值 14px）；否则取消选择 */
  var ndc = new THREE.Vector2(), ray = new THREE.Raycaster();
  function findNearestSat(sx, sy) {
    var w = container.clientWidth, h = container.clientHeight, best = -1, bd = 14;
    for (var i = 0; i < visN; i++) {
      if (!shellOn[sats[i].sh]) continue;
      var p = satPos(i, tSim);
      var v = new THREE.Vector3(p.x, p.y, p.z).project(camera);
      if (v.z >= 1) continue;
      var x = (v.x + 1) * 0.5 * w, y = (1 - (v.y + 1) * 0.5) * h;
      var d = Math.sqrt((x - sx) * (x - sx) + (y - sy) * (y - sy));
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
  function onClick(e) {
    if (moving) return;
    var rect = renderer.domElement.getBoundingClientRect();
    var sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    var hit = findNearestSat(sx, sy);
    if (hit >= 0) { selectSat(hit); return; }
    deselect();
  }
  function selectSat(i) {
    selected = i; showRing(); stopSpin(); openSatCard(i);
  }
  function deselect() { selected = -1; hideRing(); closeSatCard(); }

  /* 卫星最小详情卡 */
  var MU = 398600.414, EARTH_KM = META.earthKm || 6371;
  function openSatCard(i) {
    var s = sats[i], sh = SHELLS[s.sh];
    var aKm = EARTH_KM + sh.alt;
    var v = Math.sqrt(MU / aKm);                       /* km/s */
    var T = 2 * Math.PI * Math.sqrt(aKm * aKm * aKm / MU) / 60; /* 分钟 */
    var card = document.getElementById('satcard');
    document.getElementById('scShell').textContent = sh.name;
    document.getElementById('scShell').style.color = sh.color;
    card.style.setProperty('--rc', sh.color);
    document.getElementById('scAlt').textContent = sh.alt + ' km';
    document.getElementById('scInc').textContent = sh.inc.toFixed(1) + '°';
    /* 只写数字，避免动态拼接的中文（「第 N / M 面」「N 分钟」）在英文模式残留 */
    document.getElementById('scPlane').textContent = (s.plane + 1) + ' / ' + sh.planes;
    document.getElementById('scPeriod').textContent = T.toFixed(1);
    document.getElementById('scVel').textContent = v.toFixed(2) + ' km/s';
    if (card) card.hidden = false;
  }
  function closeSatCard() { var c = document.getElementById('satcard'); if (c) c.hidden = true; }
  document.getElementById('scClose').addEventListener('click', function (e) { e.stopPropagation(); deselect(); });

  renderer.domElement.addEventListener('pointerdown', onDown);
  global.addEventListener('pointermove', onMove, { passive: true });
  global.addEventListener('pointerup', onUp);
  global.addEventListener('pointercancel', onUp);
  renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
  renderer.domElement.addEventListener('click', onClick);
  renderer.domElement.addEventListener('dblclick', function (e) {
    var rect = renderer.domElement.getBoundingClientRect();
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    if (ray.intersectObject(earth).length) flyTo({ lon: cur.lon, lat: cur.lat, radius: Math.max(minR, 1.7) });
  });

  /* ── UI 构建与绑定 ────────────────────────────────────── */
  function hasMenu() { return global.innerWidth <= 900; }

  /* 壳层开关 + 预设镜头 */
  function buildShellList() {
    var host = document.getElementById('shellList');
    if (!host) return;
    host.innerHTML = '';
    SHELLS.forEach(function (sh, k) {
      var lab = document.createElement('label');
      lab.className = 'row';
      lab.innerHTML = '<input type="checkbox" id="ckShell' + k + '" checked /><span><s class="lg" style="background:' +
        sh.color + '"></s>' + esc(sh.name) + ' <i>· ' + esc(sh.sub) + '</i></span>';
      host.appendChild(lab);
      var ck = lab.querySelector('input');
      ck.addEventListener('change', function () { shellOn[k] = ck.checked; updateShellStats(); });
    });
    updateShellStats();
  }
  function buildPresets() {
    var host = document.getElementById('presetList');
    if (!host) return;
    (config.presets || []).forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = p.name;
      b.addEventListener('click', function () { if (hasMenu()) setIntroCollapsed(true); flyTo(p); });
      host.appendChild(b);
    });
  }

  var rgTime = document.getElementById('rgTime');
  var btnPlay = document.getElementById('btnPlay');
  if (rgTime) {
    rgTime.addEventListener('input', function () {
      playing = false;
      setTimeline(parseFloat(rgTime.value));
    });
  }
  if (btnPlay) btnPlay.addEventListener('click', function () {
    playing = true; playT = 0;
    if (rgTime) rgTime.value = '0';
    setTimeline(0);
  });

  var selSpeed = document.getElementById('selSpeed');
  if (selSpeed) selSpeed.addEventListener('change', function () { speedMult = parseFloat(selSpeed.value) || 1; });

  var ckGrat = document.getElementById('ckGrat');
  if (ckGrat) ckGrat.addEventListener('change', function () { grat.visible = ckGrat.checked; });
  var ckEarth = document.getElementById('ckEarth');
  if (ckEarth) {
    ckEarth.checked = earthSpinOn;
    ckEarth.addEventListener('change', function () { earthSpinOn = ckEarth.checked; });
  }
  var ckSpin = document.getElementById('ckSpin');
  if (ckSpin) {
    ckSpin.checked = spinOK;
    ckSpin.addEventListener('change', function () {
      spinning = ckSpin.checked;
      if (spinning) { easing = false; goal.lon = cur.lon; goal.lat = cur.lat; goal.radius = cur.radius; }
    });
  }

  /* 介绍栏折叠 / 图层面板 */
  var intro = document.getElementById('intro');
  var introBar = document.getElementById('introBar');
  var introCollapsed = false;
  function setIntroCollapsed(c) { if (!intro) return; intro.classList.toggle('is-collapsed', c); introCollapsed = c; }
  function toggleIntro() { setIntroCollapsed(!introCollapsed); }
  if (introBar) introBar.addEventListener('click', toggleIntro);
  var panelBody = document.getElementById('panelBody');
  var panelToggle = document.getElementById('panelToggle');
  function togglePanel() {
    var c = panelBody.classList.toggle('collapsed');
    if (panelToggle) panelToggle.textContent = c ? '＋' : '－';
  }
  if (panelToggle) panelToggle.addEventListener('click', function (e) { e.stopPropagation(); togglePanel(); });
  var panelHead = document.getElementById('panelHead');
  if (panelHead) panelHead.addEventListener('click', function (e) { if (e.target === panelToggle) return; if (hasMenu()) togglePanel(); });

  document.getElementById('btnOverview').addEventListener('click', function () { flyTo(config.presets[0] || presetView); });
  document.getElementById('btnReset').addEventListener('click', function () { flyTo(config.presets[0] || presetView); deselect(); });

  if (hasMenu()) {
    if (intro) setIntroCollapsed(true);
    if (panelBody) panelBody.classList.add('collapsed');
    if (panelToggle) panelToggle.textContent = '＋';
  }

  /* ── 主循环 ───────────────────────────────────────────── */
  var lastT = performance.now();
  function frame() {
    requestAnimationFrame(frame);
    var now = performance.now();
    var dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;

    if (playing && rgTime) {
      playT += dt / 9;                 /* 约 9 秒走完 2019→2026 */
      if (playT >= 1) { playT = 1; playing = false; }
      rgTime.value = String(playT);
      setTimeline(playT);
    }

    tSim += dt * timeScale * speedMult;

    if (spinning && !easing && !dragging) cur.lon += spinSpeed;
    if (easing) {
      cur.lon += (goal.lon - cur.lon) * 0.1;
      cur.lat += (goal.lat - cur.lat) * 0.1;
      cur.radius += (goal.radius - cur.radius) * 0.1;
      if (Math.abs(goal.lon - cur.lon) < 0.001 && Math.abs(goal.lat - cur.lat) < 0.001 && Math.abs(goal.radius - cur.radius) < 0.001) {
        cur.lon = goal.lon; cur.lat = goal.lat; cur.radius = goal.radius; easing = false;
      }
    }
    snapCamera();
    if (earthSpinOn) earth.rotation.y += earthSpinRate * dt * (speedMult > 0 ? 1 : 1);

    /* 写入渲染缓冲：仅已部署 + 壳层开启的卫星 */
    var r = 0;
    for (var i = 0; i < visN; i++) {
      var sh = sats[i].sh;
      if (!shellOn[sh]) continue;
      var p = satPos(i, tSim);
      renderPos[r * 3] = p.x; renderPos[r * 3 + 1] = p.y; renderPos[r * 3 + 2] = p.z;
      var c = SHELL_COL[sh];
      renderCol[r * 3] = c[0]; renderCol[r * 3 + 1] = c[1]; renderCol[r * 3 + 2] = c[2];
      r++;
    }
    satGeo.setDrawRange(0, r);
    satGeo.attributes.position.needsUpdate = true;
    satGeo.attributes.color.needsUpdate = true;

    if (ringOn && selected >= 0) {
      var sp = satPos(selected, tSim);
      ring.position.set(sp.x, sp.y, sp.z);
      var s = 0.06 * (1 + 0.08 * Math.sin(now * 0.006));
      ring.scale.set(s, s, 1);
    }
    var targetOp = ringOn ? 0.9 : 0;
    ring.material.opacity += (targetOp - ring.material.opacity) * 0.18;

    renderer.render(scene, camera);
  }

  /* ── 尺寸 ─────────────────────────────────────────────── */
  var wasMenu = hasMenu(), resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (hasMenu() !== wasMenu) wasMenu = hasMenu();
      updateViewOffset();
    }, 80);
  }
  global.addEventListener('resize', onResize);

  /* ── 启动 ─────────────────────────────────────────────── */
  buildShellList();
  buildPresets();
  snapCamera();
  updateViewOffset();
  setTimeline(config.timeline ? config.timeline.defaultT : 1);
  if (pendingT != null) { if (rgTime) rgTime.value = String(pendingT); setTimeline(pendingT); }
  if (pendingSpeed != null && selSpeed) { selSpeed.value = String(pendingSpeed); speedMult = pendingSpeed; }
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
  global.__starlinkReady = true;
})(window);
