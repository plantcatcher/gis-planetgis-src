/* 月球查看器 · 3D Globe 运行时
 * 数据：data/features.js（window.MOON_FEATURES）
 * 配置：js/config.js（window.MOON_CONFIG）
 * 渲染：three.min.js + HTML 坐标标注叠加层
 *
 * 2026-10-20 体验重构：
 *  - 标签屏幕空间防重叠（贪心避让，优先任务 > 月海 > 山脉 > 环形山，靠画面中心者优先）
 *  - 标签尺寸构建时量一次缓存，避免每帧读 offsetWidth 触发重排
 *  - 星空背景 + 太阳偏右上方（可见面恒亮、保留明暗梯度，球体有体积）
 *  - 闲置自动旋转（可开关），任何拖拽/缩放/选中即停
 *  - 桌面端鼠标悬停高亮 + 指针反馈；点月面空白处读出该点 IAU 经纬
 *  - 选中地物在球面显示脉冲光环；桌面端相机右移，月轮不压在介绍栏后面
 *  - URL 加 ?spin=0 可关闭自动旋转（封面截图用）
 */
(function (global) {
  'use strict';

  var DEG = Math.PI / 180;
  var RAD = 180 / Math.PI;
  var config = global.MOON_CONFIG || {};
  var features = global.MOON_FEATURES || [];
  var presetView = Object.assign({ lon: 0, lat: 16, radius: 2.6 }, config.view || {});
  var spinSpeed = config.spin != null ? config.spin : 0.09;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* IAU 月球经纬（东经为正，北纬为正）→ 单位球世界坐标。
     lon=0, lat=0 落于 +X，配合相机默认从正面看，屏幕右方即东。 */
  function spherePoint(lon, lat, r) {
    r = r || 1;
    var la = lat * DEG, lo = lon * DEG;
    return new THREE.Vector3(
      Math.cos(la) * Math.cos(lo) * r,
      Math.sin(la) * r,
      -Math.cos(la) * Math.sin(lo) * r
    );
  }
  function invSphere(p) {
    var x = p.x, y = p.y, z = p.z;
    var r = Math.sqrt(x * x + y * y + z * z) || 1;
    var lat = Math.asin(clamp(y / r, -1, 1)) * RAD;
    var lon = Math.atan2(-z, x) * RAD;
    if (lon > 180) lon -= 360;
    if (lon < -180) lon += 360;
    return { lon: lon, lat: lat };
  }
  function fmtLon(lon) {
    var s = Math.abs(lon).toFixed(1);
    return (lon >= 0 ? '+' : '-') + s + '°';
  }
  function fmtLat(lat) {
    var s = Math.abs(lat).toFixed(1);
    return (lat >= 0 ? '+' : '-') + s + '°';
  }
  /* 经度按最短路径差值，避免从 179° 飞到 -179° 时绕月球一整圈 */
  function wrapDelta(current, target) {
    while (target - current > 180) target -= 360;
    while (target - current < -180) target += 360;
    return target;
  }

  var typeLabel = {
    mare: '月海 / 洋',
    crater: '环形山 / 撞击构造',
    mountain: '山脉 / 月谷 / 地貌带',
    mission: '人类探测记录'
  };
  var typeUnit = {
    mare: '直径',
    crater: '直径/规模',
    mountain: '长度/范围',
    mission: '任务年代'
  };
  var typeColor = {
    mare: '#aad0ff',
    crater: '#d9c8a0',
    mountain: '#f0b86e',
    mission: '#7dd3fc'
  };
  /* 标签避让优先级：数字越小越先占位 */
  var typeRank = { mission: 0, mare: 1, mountain: 2, crater: 3 };

  var container = document.getElementById('map');
  var labelsEl = document.getElementById('labels');
  var detail = document.getElementById('detail');
  var intro = document.getElementById('intro');
  var introBar = document.getElementById('introBar');

  var hasMenu = function () {
    return global.innerWidth <= 900;
  };
  var introCollapsed = false;
  function setIntroCollapsed(c) {
    if (!intro) return;
    intro.classList.toggle('is-collapsed', c);
    introCollapsed = c;
  }
  function toggleIntro() {
    setIntroCollapsed(!introCollapsed);
  }

  /* ── 场景 ─────────────────────────────────────────────── */
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 200);

  var moonMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0x111111,
    shininess: 12
  });
  var moon = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), moonMat);
  scene.add(moon);

  new THREE.TextureLoader().load('textures/moon-2k.jpg', function (tex) {
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    moonMat.map = tex;
    moonMat.needsUpdate = true;
  }, undefined, function () {
    moonMat.color.setHex(0xb8c0ca);
  });

  /* 太阳挂在相机附近、固定偏右上方：可见面永远有光，同时保留明暗梯度 */
  scene.add(new THREE.AmbientLight(0x8a9bb0, 0.62));
  var sun = new THREE.DirectionalLight(0xfff2de, 1.45);
  sun.position.set(4, 2.5, 5);
  scene.add(sun);
  var fill = new THREE.DirectionalLight(0x88b8e8, 0.22);
  fill.position.set(-3, -1, -3);
  scene.add(fill);
  var SUN_TILT = new THREE.Vector3(0, 1, 0);

  /* 星空：远处球壳上的随机点，跟着相机有轻微视差 */
  var stars = (function () {
    var n = 1500;
    var pos = new Float32Array(n * 3);
    var col = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      var u = Math.random() * 2 - 1;
      var th = Math.random() * Math.PI * 2;
      var s = Math.sqrt(1 - u * u);
      var r = 55 + Math.random() * 35;
      pos[i * 3] = r * s * Math.cos(th);
      pos[i * 3 + 1] = r * u;
      pos[i * 3 + 2] = r * s * Math.sin(th);
      var b = 0.3 + Math.random() * 0.7;
      var warm = Math.random() < 0.12;
      col[i * 3] = b * (warm ? 1 : 0.9);
      col[i * 3 + 1] = b * 0.94;
      col[i * 3 + 2] = b * (warm ? 0.8 : 1);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var m = new THREE.PointsMaterial({
      size: 1.5, sizeAttenuation: false, vertexColors: true,
      transparent: true, opacity: 0.9, depthWrite: false
    });
    var p = new THREE.Points(g, m);
    scene.add(p);
    return p;
  })();

  /* 经纬网格：圆弧贴球，半径略大于月面 */
  var gratMat = new THREE.LineBasicMaterial({ color: 0x8cb4e8, transparent: true, opacity: 0.32 });
  var gratGeo = new THREE.BufferGeometry();
  var gratPts = [];
  var lonSteps = 24, latSteps = 12;
  for (var i = -90; i <= 90; i += 15) {
    for (var j = 0; j <= lonSteps; j++) {
      var lo = j * 360 / lonSteps;
      gratPts.push(spherePoint(lo, i, 1.015));
      gratPts.push(spherePoint(lo, i + 0.001, 1.015));
    }
  }
  for (var k = -180; k <= 180; k += 30) {
    for (var m = 0; m < latSteps; m++) {
      var la0 = -90 + m * 180 / latSteps;
      var la1 = -90 + (m + 1) * 180 / latSteps;
      gratPts.push(spherePoint(k, la0, 1.015));
      gratPts.push(spherePoint(k, la1, 1.015));
    }
  }
  gratGeo.setFromPoints(gratPts);
  var grat = new THREE.LineSegments(gratGeo, gratMat);
  grat.visible = false;
  scene.add(grat);

  /* 选中光环：贴在球面的脉冲圆环（ Sprite 自动面向相机，depthTest 挡掉背面地物） */
  var ring = (function () {
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var g = c.getContext('2d');
    g.lineWidth = 7;
    g.strokeStyle = '#ffffff';
    g.beginPath(); g.arc(64, 64, 50, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#ffffff';
    g.beginPath(); g.arc(64, 64, 12, 0, Math.PI * 2); g.fill();
    var tex = new THREE.CanvasTexture(c);
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, opacity: 0, depthTest: true, depthWrite: false
    }));
    sp.scale.set(0.085, 0.085, 1);
    scene.add(sp);
    return sp;
  })();
  var ringOn = false;
  function showRing(f) {
    ring.position.copy(spherePoint(f.lon, f.lat, 1.015));
    ring.material.color.set(typeColor[f.type] || '#9fd0ff');
    ringOn = true;
  }
  function hideRing() { ringOn = false; }

  /* ── 相机视图 ─────────────────────────────────────────── */
  var cur = { lon: presetView.lon, lat: presetView.lat, radius: presetView.radius };
  var goal = { lon: cur.lon, lat: cur.lat, radius: cur.radius };
  var easing = false;
  var dragging = false;
  var minR = config.minRadius != null ? config.minRadius : 1.32;
  var maxR = config.maxRadius != null ? config.maxRadius : 3.6;

  function applyCam(v, immediate) {
    var lon = v.lon, lat = clamp(v.lat, -88, 88), r = clamp(v.radius, minR, maxR);
    var p = spherePoint(lon, lat, r);
    if (immediate) {
      camera.position.copy(p);
    } else {
      camera.position.lerp(p, 0.1);
    }
    camera.lookAt(0, 0, 0);
    /* 太阳始终偏在相机右上方：正面永远有光，但左侧边缘自然压暗 */
    sun.position.copy(p);
    sun.position.applyAxisAngle(SUN_TILT, 0.24);
    sun.position.y += 0.45;
    sun.position.multiplyScalar(2.2);
  }
  function snapCamera() {
    applyCam(cur, true);
  }
  function flyTo(v) {
    goal.lon = wrapDelta(cur.lon, v.lon);
    goal.lat = clamp(v.lat, -88, 88);
    goal.radius = clamp(v.radius, minR, maxR);
    easing = true;
  }

  /* 桌面端把月轮整体右移，避开左侧介绍栏（用视口偏移，不动相机几何） */
  var viewOff = -1;
  function discRadiusPx() {
    var halfFov = camera.fov * DEG / 2;
    var ang = Math.asin(clamp(1 / presetView.radius, -1, 1));
    return ang / halfFov * (container.clientHeight / 2);
  }
  function updateViewOffset() {
    var off = 0;
    if (!hasMenu() && intro) {
      var cw = container.clientWidth;
      off = clamp(intro.offsetWidth + 46 + discRadiusPx() - cw / 2, 0, cw * 0.3);
    }
    if (Math.abs(off - viewOff) < 0.5) return;
    viewOff = off;
    if (off > 1) {
      camera.setViewOffset(container.clientWidth, container.clientHeight, -off, 0, container.clientWidth, container.clientHeight);
    } else {
      camera.clearViewOffset();
    }
  }

  /* 标签锚点允许出现的极限：贴着可见半球边缘（留 3.5° 余量），随缩放自适应 */
  function limbDot() {
    var r = clamp(cur.radius, minR, maxR);
    return Math.cos(Math.acos(clamp(1 / r, -1, 1)) + 3.5 * DEG);
  }

  /* ── 标注层 ───────────────────────────────────────────── */
  var labelInfos = [];
  function buildLabels() {
    labelsEl.innerHTML = '';
    labelInfos = features.map(function (f, idx) {
      var el = document.createElement('div');
      el.className = 'moon-label' + (f.type === 'mission' ? ' is-mission' : '');
      el.style.setProperty('--rc', typeColor[f.type] || '#9fd0ff');
      el.innerHTML = '<span class="dot"></span><span class="txt"></span>';
      el.querySelector('.txt').textContent = f.name;
      el.title = f.en + ' · ' + f.coord;
      el.dataset.index = String(idx);
      labelsEl.appendChild(el);
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        hidePin();
        openDetail(f, el);
      });
      var info = { f: f, el: el, w: 0, h: 0 };
      measureLabel(info);
      return info;
    });
  }
  /* 尺寸只在构建 / 跨移动端断点时量（显示状态才量得到），避免每帧强制重排 */
  function measureLabel(info) {
    info.w = info.el.offsetWidth;
    info.h = info.el.offsetHeight;
  }

  function visibilityFor(f) {
    if (currentType !== 'all' && currentType !== f.type) return false;
    if (f.type === 'mission') return ckMissions.checked;
    return ckNames.checked;
  }

  var raycaster = new THREE.Raycaster();
  var ndc = new THREE.Vector2();
  var probeV = new THREE.Vector3();
  var camFwdV = new THREE.Vector3();

  /* 屏幕空间贪心避让：候选标签按「类型优先级 − 离画面中心距离」排序，
     依次占位，与已占盒子或浮层（介绍栏 / 详情卡 / 图例 / 面板）重叠的弃置。 */
  var obstacles = [];
  function collectObstacles() {
    obstacles = [];
    if (intro && !intro.classList.contains('is-collapsed')) {
      var r = intro.getBoundingClientRect();
      if (r.width > 0) obstacles.push({ x: r.left, y: r.top, w: r.width, h: r.height });
    }
    if (detail && !detail.hidden) {
      var r2 = detail.getBoundingClientRect();
      if (r2.width > 0) obstacles.push({ x: r2.left, y: r2.top, w: r2.width, h: r2.height });
    }
    var dock = document.querySelector('.dock');
    if (dock) {
      var r3 = dock.getBoundingClientRect();
      if (r3.width > 0) obstacles.push({ x: r3.left, y: r3.top, w: r3.width, h: r3.height });
    }
    var panel = document.getElementById('panel');
    if (panel) {
      var r4 = panel.getBoundingClientRect();
      if (r4.width > 0) obstacles.push({ x: r4.left, y: r4.top, w: r4.width, h: r4.height });
    }
  }
  function hitAny(box, list, gap) {
    for (var i = 0; i < list.length; i++) {
      var p = list[i];
      if (box.x < p.x + p.w + gap && p.x < box.x + box.w + gap &&
          box.y < p.y + p.h + gap && p.y < box.y + box.h + gap) return true;
    }
    return false;
  }

  function projectLabels() {
    var w = container.clientWidth, h = container.clientHeight;
    var lim = limbDot();
    var camFwd = camFwdV.copy(camera.position).normalize();
    collectObstacles();
    var cands = [];
    for (var i = 0; i < labelInfos.length; i++) {
      var it = labelInfos[i], f = it.f;
      var v = spherePoint(f.lon, f.lat, 1.018);
      var dot = v.x * camFwd.x + v.y * camFwd.y + v.z * camFwd.z;
      if (dot <= lim || !visibilityFor(f)) { it.el.classList.add('is-hidden'); continue; }
      probeV.copy(v).project(camera);
      if (probeV.z >= 1) { it.el.classList.add('is-hidden'); continue; }
      var x = (probeV.x + 1) * 0.5 * w;
      var y = (1 - (probeV.y + 1) * 0.5) * h;
      if (x < -8 || x > w + 8 || y < -8 || y > h + 8) { it.el.classList.add('is-hidden'); continue; }
      cands.push({ it: it, x: x, y: y });
    }
    cands.sort(function (a, b) {
      var sa = (typeRank[a.it.f.type] == null ? 3 : typeRank[a.it.f.type]) * 10000
        - Math.sqrt((a.x - w / 2) * (a.x - w / 2) + (a.y - h / 2) * (a.y - h / 2));
      var sb = (typeRank[b.it.f.type] == null ? 3 : typeRank[b.it.f.type]) * 10000
        - Math.sqrt((b.x - w / 2) * (b.x - w / 2) + (b.y - h / 2) * (b.y - h / 2));
      return sa - sb;
    });
    /* 已选中（详情打开中）的标签最先占位，保证一定可见 */
    cands.sort(function (a, b) {
      var aa = a.it.el.classList.contains('active') ? 0 : 1;
      var bb = b.it.el.classList.contains('active') ? 0 : 1;
      return aa - bb;
    });
    var placed = [];
    for (var j = 0; j < cands.length; j++) {
      var c = cands[j], it2 = c.it;
      var box = { x: c.x - it2.w / 2, y: c.y - it2.h / 2, w: it2.w, h: it2.h };
      var isActive = it2.el.classList.contains('active');
      if (!isActive && (hitAny(box, placed, 2) || hitAny(box, obstacles, 2))) {
        it2.el.classList.add('is-hidden');
        continue;
      }
      placed.push(box);
      it2.el.classList.remove('is-hidden');
      it2.el.style.left = c.x.toFixed(1) + 'px';
      it2.el.style.top = c.y.toFixed(1) + 'px';
    }
  }

  /* label 被隐藏时保留定位以便过渡；display 交由 class 控制 */
  var typeTypes = config.types || [];
  var currentType = 'all';
  var ckNames = document.getElementById('ckNames');
  var ckMissions = document.getElementById('ckMissions');
  var ckGrat = document.getElementById('ckGrat');
  var ckSpin = document.getElementById('ckSpin');

  function refreshLabels() {
    for (var i = 0; i < labelInfos.length; i++) labelInfos[i].el.style.display = '';
    projectLabels();
  }

  /* 桌面端悬停：靠近地物锚点就高亮标签 + 指针变形 */
  var mouse = { x: 0, y: 0, active: false };
  var hoverInfo = null;
  function updateHover() {
    var w = container.clientWidth, h = container.clientHeight;
    var lim = limbDot();
    var camFwd = camFwdV.copy(camera.position).normalize();
    var best = null, bd = 1e9;
    for (var i = 0; i < labelInfos.length; i++) {
      var it = labelInfos[i];
      if (it.el.classList.contains('is-hidden')) continue;
      if (!visibilityFor(it.f)) continue;
      var v = spherePoint(it.f.lon, it.f.lat, 1.018);
      if (v.x * camFwd.x + v.y * camFwd.y + v.z * camFwd.z <= lim) continue;
      probeV.copy(v).project(camera);
      var sx = (probeV.x + 1) * 0.5 * w;
      var sy = (1 - (probeV.y + 1) * 0.5) * h;
      var d = Math.sqrt((sx - mouse.x) * (sx - mouse.x) + (sy - mouse.y) * (sy - mouse.y));
      var rad = Math.max(22, it.w * 0.5 + 10);
      if (d < rad && d < bd) { bd = d; best = it; }
    }
    if (best !== hoverInfo) {
      if (hoverInfo) hoverInfo.el.classList.remove('hover');
      hoverInfo = best;
      if (hoverInfo) hoverInfo.el.classList.add('hover');
      renderer.domElement.style.cursor = hoverInfo ? 'pointer' : '';
    }
  }

  /* 点击空白月面：临时坐标签，显示该点的 IAU 经纬 */
  var pinEl = null, pinTimer = 0;
  function showPin(x, y, lon, lat) {
    if (!pinEl) {
      pinEl = document.createElement('div');
      pinEl.className = 'moon-pin';
      pinEl.innerHTML = '<i></i><span></span>';
      labelsEl.appendChild(pinEl);
    }
    pinEl.querySelector('span').textContent = '东经 ' + fmtLon(lon) + ' · 北纬 ' + fmtLat(lat);
    pinEl.style.left = x + 'px';
    pinEl.style.top = y + 'px';
    pinEl.classList.add('is-on');
    clearTimeout(pinTimer);
    pinTimer = setTimeout(function () {
      if (pinEl) pinEl.classList.remove('is-on');
    }, 3600);
  }
  function hidePin() {
    clearTimeout(pinTimer);
    if (pinEl) pinEl.classList.remove('is-on');
  }

  /* ── 详情卡 ───────────────────────────────────────────── */
  function openDetail(f, el) {
    var isMission = f.type === 'mission';
    var role = (isMission ? 'MISSION RECORD' : 'LUNAR FEATURE') + ' · ' + (typeLabel[f.type] || '');
    document.getElementById('dtRole').textContent = role;
    document.getElementById('dtName').textContent = f.name;
    document.getElementById('dtSub').textContent = (f.en || '') + (isMission ? '' : ' · IAU 月面命名');
    document.getElementById('dtV1').textContent = f.coord;
    document.getElementById('dtV2').textContent = String(f.size);
    document.getElementById('dtU2').textContent = isMission ? '年份' : 'km';
    document.getElementById('dtV3').textContent = typeLabel[f.type] || '—';
    document.getElementById('dtDescLb').textContent = isMission ? '任务解读' : '图注';
    document.getElementById('dtDesc').textContent = f.note || '—';
    var foot = document.getElementById('dtFooter');
    foot.innerHTML = '<span><b>英文名</b> ' + esc(f.en) +
      '</span><span><b>类型</b> ' + esc(f.type) +
      '</span><span><b>坐标</b> ' + esc(f.coord) + '</span>';
    detail.style.setProperty('--rc', typeColor[f.type] || '#9fd0ff');
    detail.hidden = false;
    document.body.classList.add('has-detail');
    for (var i = 0; i < labelInfos.length; i++) labelInfos[i].el.classList.remove('active');
    if (el) el.classList.add('active');
    if (hasMenu() && intro) setIntroCollapsed(true);
    showRing(f);
    stopSpin();
    hidePin();
    projectLabels();
  }
  function closeDetail() {
    detail.hidden = true;
    document.body.classList.remove('has-detail');
    for (var i = 0; i < labelInfos.length; i++) labelInfos[i].el.classList.remove('active');
    hideRing();
    projectLabels();
  }
  document.getElementById('dtClose').addEventListener('click', function (e) {
    e.stopPropagation();
    closeDetail();
  });

  /* ── 自动旋转 ─────────────────────────────────────────── */
  var spinOK = true;
  try { spinOK = new URLSearchParams(global.location.search).get('spin') !== '0'; } catch (_) {}
  var spinning = spinOK;
  function stopSpin() {
    spinning = false;
    if (ckSpin) ckSpin.checked = false;
  }
  if (ckSpin) {
    ckSpin.checked = spinOK;
    ckSpin.addEventListener('change', function () {
      spinning = ckSpin.checked;
      if (spinning) { easing = false; goal.lon = cur.lon; goal.lat = cur.lat; goal.radius = cur.radius; }
    });
  }

  /* ── 预设 / 分类 Tabs ────────────────────────────────── */
  function buildPresets() {
    var list = document.getElementById('presetList');
    if (!list) return;
    list.innerHTML = '';
    (config.presets || []).forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = p.name;
      b.addEventListener('click', function () {
        if (hasMenu() && intro) setIntroCollapsed(true);
        flyTo(p);
      });
      list.appendChild(b);
    });
  }
  function buildTabs() {
    var host = document.getElementById('typeTabs');
    if (!host) return;
    host.innerHTML = '';
    typeTypes.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = t.label;
      if (t.key === currentType) b.classList.add('active');
      b.addEventListener('click', function () {
        currentType = t.key;
        var btns = host.querySelectorAll('button');
        for (var i = 0; i < btns.length; i++) btns[i].classList.toggle('active', btns[i] === b);
        closeDetail();
        refreshLabels();
      });
      host.appendChild(b);
    });
  }
  if (ckNames) ckNames.addEventListener('change', refreshLabels);
  if (ckMissions) ckMissions.addEventListener('change', refreshLabels);
  if (ckGrat) ckGrat.addEventListener('change', function () { grat.visible = ckGrat.checked; });

  /* ── 交互：拖拽 / 缩放 / 点击 ─────────────────────────── */
  var pointers = {};
  var lastP = null;
  var moving = false;
  var pinchDist = 0;

  function onDown(e) {
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    lastP = { x: e.clientX, y: e.clientY };
    moving = false;
    easing = false;
    dragging = true;
    stopSpin();
    hidePin();
    if (pointersCount() === 2) {
      pinchDist = pointerDist();
    }
    if (renderer.domElement.setPointerCapture) {
      try { renderer.domElement.setPointerCapture(e.pointerId); } catch (_) {}
    }
  }
  function pointersCount() {
    return Object.keys(pointers).length;
  }
  function pointerDist() {
    var ks = Object.keys(pointers);
    if (ks.length < 2) return 0;
    var a = pointers[ks[0]], b = pointers[ks[1]];
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }
  function onMove(e) {
    if (!pointers[e.pointerId]) return;
    var dx = e.clientX - (pointers[e.pointerId] ? pointers[e.pointerId].x : e.clientX);
    var dy = e.clientY - (pointers[e.pointerId] ? pointers[e.pointerId].y : e.clientY);
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (Math.abs(e.clientX - lastP.x) + Math.abs(e.clientY - lastP.y) > 3) moving = true;
    var n = pointersCount();
    if (n >= 2) {
      var d = pointerDist();
      if (pinchDist > 0) {
        cur.radius = clamp(cur.radius * pinchDist / Math.max(20, d), minR, maxR);
        goal.radius = cur.radius;
      }
      pinchDist = d;
    } else if (pointers[e.pointerId] && (e.buttons === 1 || pointersCount() === 1)) {
      cur.lon -= dx * 0.42;
      cur.lat = clamp(cur.lat + dy * 0.28, -88, 88);
      goal.lon = cur.lon;
      goal.lat = cur.lat;
      goal.radius = cur.radius;
    }
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
    goal.radius = cur.radius;
    stopSpin();
  }
  function nearestFeature(sx, sy, maxPx) {
    var w = container.clientWidth, h = container.clientHeight;
    var lim = limbDot();
    var camFwd = camFwdV.copy(camera.position).normalize();
    var best = null, bd = maxPx;
    for (var i = 0; i < labelInfos.length; i++) {
      var it = labelInfos[i];
      if (!visibilityFor(it.f)) continue;
      var v = spherePoint(it.f.lon, it.f.lat, 1.018);
      if (v.x * camFwd.x + v.y * camFwd.y + v.z * camFwd.z <= lim) continue;
      probeV.copy(v).project(camera);
      var x = (probeV.x + 1) * 0.5 * w;
      var y = (1 - (probeV.y + 1) * 0.5) * h;
      var d = Math.sqrt((x - sx) * (x - sx) + (y - sy) * (y - sy));
      if (d < bd) { bd = d; best = it; }
    }
    return best;
  }
  function onClick(e) {
    if (moving) return;
    hidePin();
    /* 标签是 HTML 叠加层，点击命中优先于球体「最近地物」 */
    if (!hasMenu()) {
      var lbl = currentLabelAt(e.clientX, e.clientY);
      if (lbl) { openDetail(lbl.f, lbl.el); return; }
    }
    var rect = renderer.domElement.getBoundingClientRect();
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    var hits = raycaster.intersectObject(moon);
    if (!hits.length) { closeDetail(); return; }
    var ll = invSphere(hits[0].point);
    var near = nearestFeature(e.clientX - rect.left, e.clientY - rect.top, 88);
    if (near) { openDetail(near.f, near.el); return; }
    showPin(e.clientX - rect.left, e.clientY - rect.top, ll.lon, ll.lat);
  }
  function currentLabelAt(x, y) {
    var w = container.clientWidth, h = container.clientHeight;
    var camFwd = camFwdV.copy(camera.position).normalize();
    var best = null, bd = 26;
    for (var i = 0; i < labelInfos.length; i++) {
      var it = labelInfos[i];
      if (it.el.classList.contains('is-hidden')) continue;
      if (!visibilityFor(it.f)) continue;
      var v = spherePoint(it.f.lon, it.f.lat, 1.018);
      if (v.x * camFwd.x + v.y * camFwd.y + v.z * camFwd.z < 0.12) continue;
      probeV.copy(v).project(camera);
      var sx = (probeV.x + 1) * 0.5 * w;
      var sy = (1 - (probeV.y + 1) * 0.5) * h;
      var d = Math.sqrt((sx - x) * (sx - x) + (sy - y) * (sy - y));
      if (d < bd) { bd = d; best = it; }
    }
    return best;
  }

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
    raycaster.setFromCamera(ndc, camera);
    var hits = raycaster.intersectObject(moon);
    if (!hits.length) return;
    var ll = invSphere(hits[0].point);
    flyTo({ lon: ll.lon, lat: ll.lat, radius: Math.max(minR, 1.5) });
  });

  renderer.domElement.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') { mouse.active = false; return; }
    var rect = renderer.domElement.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  renderer.domElement.addEventListener('pointerleave', function () {
    mouse.active = false;
    if (hoverInfo) { hoverInfo.el.classList.remove('hover'); hoverInfo = null; }
    renderer.domElement.style.cursor = '';
  });

  renderer.domElement.addEventListener('touchstart', function () {
    if (hasMenu() && intro) setIntroCollapsed(true);
  }, { passive: true });

  document.getElementById('btnOverview').addEventListener('click', function () { flyTo({ lon: 0, lat: 16, radius: 2.6 }); });
  document.getElementById('btnReset').addEventListener('click', function () { flyTo({ lon: 0, lat: 16, radius: 2.6 }); });

  /* ── 移动端抽屉 / 图层面板 ────────────────────────────── */
  if (introBar) {
    introBar.addEventListener('click', function () {
      toggleIntro();
    });
  }
  var panelBody = document.getElementById('panelBody');
  var panelToggle = document.getElementById('panelToggle');
  function togglePanel() {
    var c = panelBody.classList.toggle('collapsed');
    if (panelToggle) panelToggle.textContent = c ? '＋' : '－';
  }
  if (panelToggle) panelToggle.addEventListener('click', function (e) { e.stopPropagation(); togglePanel(); });
  document.getElementById('panelHead').addEventListener('click', function (e) {
    if (e.target === panelToggle) return;
    if (hasMenu()) togglePanel();
  });

  if (hasMenu()) {
    if (intro) setIntroCollapsed(true);
    if (panelBody) panelBody.classList.add('collapsed');
    if (panelToggle) panelToggle.textContent = '＋';
  }

  /* ── 主循环 ───────────────────────────────────────────── */
  var wasMenu = hasMenu();
  var resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (hasMenu() !== wasMenu) {
        wasMenu = hasMenu();
        for (var i = 0; i < labelInfos.length; i++) measureLabel(labelInfos[i]);
      }
      updateViewOffset();
      projectLabels();
    }, 80);
  }
  global.addEventListener('resize', onResize);

  function frame() {
    requestAnimationFrame(frame);
    if (spinning && !easing && !dragging) cur.lon += spinSpeed;
    if (easing) {
      cur.lon += (goal.lon - cur.lon) * 0.1;
      cur.lat += (goal.lat - cur.lat) * 0.1;
      cur.radius += (goal.radius - cur.radius) * 0.1;
      snapCamera();
      if (Math.abs(goal.lon - cur.lon) < 0.001 && Math.abs(goal.lat - cur.lat) < 0.001 &&
          Math.abs(goal.radius - cur.radius) < 0.001) {
        cur.lon = goal.lon; cur.lat = goal.lat; cur.radius = goal.radius;
        easing = false;
      }
    } else {
      snapCamera();
    }
    projectLabels();
    if (mouse.active && !hasMenu()) updateHover();
    var targetOp = ringOn ? 0.9 : 0;
    ring.material.opacity += (targetOp - ring.material.opacity) * 0.18;
    if (ringOn) {
      /* 光环保持恒定屏幕尺寸（约 90px），不随缩放变大变小，避免被标签 pill 盖住 */
      var s = cur.radius * 0.073 * (1 + 0.07 * Math.sin(performance.now() * 0.006));
      ring.scale.set(s, s, 1);
    }
    renderer.render(scene, camera);
  }

  buildPresets();
  buildTabs();
  buildLabels();
  snapCamera();
  updateViewOffset();
  refreshLabels();
  frame();

  /* 封面脚本兼容：3D 图没有 MapLibre，但 gen_map_cover 会判断 window.__app.map。
     这里给一个最小假实例，让 --center/--zoom 分支可跳过 2D fit。 */
  global.__app = {
    map: {
      setMinZoom: function () {},
      jumpTo: function () {},
      setZoom: function () {},
      getCenter: function () { return { toArray: function () { return [0, 0]; } }; },
      getZoom: function () { return 2; },
      getBounds: function () { return { toArray: function () { return [[-180, -90], [180, 90]]; } }; },
      fitBounds: function () {},
      getLayer: function () { return null; },
      setLayoutProperty: function () { }
    },
    mapReady: true
  };
  global.__moonReady = true;
})(window);
