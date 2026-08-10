// 应用逻辑：三层算法 + 反差洞察 + UI 渲染 + Canvas 雷达图/分享卡
(function () {
  "use strict";
  var DIMS = ["ocean", "mountain", "forest", "desert", "river", "polar", "volcano", "cosmic"];
  var MAIN = DIMS;
  var PER = window.PERSONAS, QS = window.QUESTIONS, INS = window.INSIGHTS,
      REC = window.RECOMMEND, CLIM = window.CLIMATE_CN, CITIES = window.CITIES || [];
  var app = document.getElementById("app");
  var state = { answers: {}, step: 0, place: null, lnglat: null, result: null };

  // 天地图 key（与 index.html 的 tk 保持一致）
  var TDT_TK = "e92d8558a9a7eb0709e7f895801bdcc9";
  // 瓦片图层配置：底图在下、注记在上。
  // 如需更轻量合规的矢量底图，把下面两项换成 vec_w(矢量底图)/cva_w(矢量注记，含审图号 GS(2023)1312号) 即可。
  var TDT_BASE_LAYERS = [
    { constName: "img_w", name: "img_w", wmts: "img" },  // 影像底图
    { constName: "cia_w", name: "cia_w", wmts: "cia" }   // 影像注记（含城市名与官方审图号）
  ];
  // 关键修复：T.TileLayer 第一个参数必须是「完整瓦片 URL 模板」，不能把 "img_w" 这种图层名当 URL 传入，
  // 否则会请求无效地址导致瓦片整片空白。优先用预定义图层常量，兜底用自定义 WMTS URL（已实测对该 key 返回真实瓦片）。
  function tdtTileUrl(layerName, wmtsLayer) {
    return "https://t0.tianditu.gov.cn/" + layerName + "/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=" +
      wmtsLayer + "&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=" + TDT_TK;
  }
  function addTdtLayers(map) {
    if (!map || typeof T === "undefined" || !T.TileLayer) return;
    TDT_BASE_LAYERS.forEach(function (L) {
      var added = false;
      try { if (T.TileLayer[L.constName]) { map.addLayer(T.TileLayer[L.constName]); added = true; } } catch (e) {}
      if (!added) {
        try { map.addLayer(new T.TileLayer(tdtTileUrl(L.name, L.wmts), { minZoom: 1, maxZoom: 18 })); } catch (e) {}
      }
    });
  }

  // ---------- 埋点（localStorage 计数 + Google Analytics 事件） ----------
  function track(k, params) {
    // 本地计数（保留原逻辑，便于无网/无 GA 时也能看 UV）
    try { var n = parseInt(localStorage.getItem("geo_" + k) || "0", 10) + 1;
      localStorage.setItem("geo_" + k, n); } catch (e) {}
    // 上报 Google Analytics（gtag 已在 <head> 同步定义，事件入队，加载后自动发送）
    try {
      if (typeof gtag === "function") {
        var p = { event_category: "geo_funnel" };
        if (params && typeof params === "object") {
          for (var key in params) { if (Object.prototype.hasOwnProperty.call(params, key)) p[key] = params[key]; }
        }
        gtag("event", k, p);
      }
    } catch (e) {}
  }
  track("views");

  // ---------- 算法 ----------
  function geoScore(c) {
    var s = {}; DIMS.forEach(function (d) { s[d] = 0; });
    if (!c) return s;
    // 海洋信号严格绑定沿海，避免内陆城市被错判为海洋型
    if (c.coastal) s.ocean += 18;
    // 海拔分段：高原/山地 → 山岳 + 星空，丘陵小幅，平原不给
    if (c.elevation > 2500) { s.mountain += 14; s.cosmic += 12; }
    else if (c.elevation > 1500) { s.mountain += 12; s.cosmic += 6; }
    else if (c.elevation > 800) { s.mountain += 9; }
    else if (c.elevation > 300) { s.mountain += 4; }
    // 城市化低 → 自然/森林
    if (c.urbanization < 55) { s.forest += 12; s.desert += 4; }
    else if (c.urbanization < 70) { s.forest += 6; }
    // 气候：海洋分仅在沿海或热带/地中海（近海气质）时给
    switch (c.climate) {
      case "arid": s.desert += 16; if (c.elevation > 1000) s.cosmic += 8; break;
      case "cold":
      case "polar": s.mountain += 8; s.polar += 12; if (c.coastal) s.ocean += 4; break;
      case "tropical": s.ocean += (c.coastal ? 10 : 3); s.volcano += 8; break;
      case "mediterranean": s.ocean += (c.coastal ? 8 : 2); s.desert += 4; break;
      case "continental": s.mountain += 8; s.desert += 5; s.polar += 4; break;
      case "subtropical": if (c.coastal) s.ocean += 5; s.forest += 5; break;
      case "temperate": s.forest += 5; s.river += 5; if (c.coastal) s.ocean += 5; break;
    }
    // 河流型：温带/亚热带内陆、中海拔（江城气质）
    if ((c.climate === "temperate" || c.climate === "subtropical") && !c.coastal
        && c.elevation > 100 && c.elevation < 1500) s.river += 6;
    // 火山型：中高海拔
    if (c.elevation > 1000 && c.elevation <= 2500) s.volcano += 4;
    return s;
  }
  function topOf(scores, dims) {
    var best = dims[0], bv = -1;
    dims.forEach(function (d) { if (scores[d] > bv) { bv = scores[d]; best = d; } });
    return best;
  }
  function getInsight(main, pref) {
    if (pref === main) return INS[main][main];
    if (INS[pref] && INS[pref][main]) return INS[pref][main];
    return "你被" + PER[pref].name + "吸引，骨子里却是" + PER[main].name +
      "——你向往" + PER[pref].keywords + "，最终却活成了" + PER[main].keywords + "。";
  }
  // 单一地点：生活时间最长的地方（出生 / 成长 / 工作 合成一个）
  var PLACE_TITLE  = "生活地";
  var PLACE_HINT   = "出生、成长、工作……把它们合成一个地方——那个你待得最久、最像「家」的城市。";
  function compositeGeo(c) {
    if (!c) { var s = {}; DIMS.forEach(function (d) { s[d] = 0; }); return s; }
    return geoScore(c);
  }
  function placeTypeOf(c) {
    if (!c) return null;
    return topOf(geoScore(c), MAIN);
  }
  // 单地点模式：不再计算三地轨迹（trajectoryInsight 已废弃）
  function compute(answers, place) {
    var scores = {}, pref = {}, behav = {};
    DIMS.forEach(function (d) { scores[d] = 0; pref[d] = 0; behav[d] = 0; });
    var np = 0, nb = 0;
    QS.forEach(function (q) { if (q.type === "prefer") np++; else nb++; });
    var perPref = 45 / np, perBehav = 25 / nb;
    QS.forEach(function (q) {
      var d = answers[q.id];
      if (d == null) return;
      if (q.type === "prefer") { scores[d] += perPref; pref[d] += perPref; }
      else { scores[d] += perBehav; behav[d] += perBehav; }
    });
    var g = compositeGeo(place);
    DIMS.forEach(function (d) { scores[d] += g[d]; });
    var mainType = topOf(scores, MAIN);
    var dominantPref = topOf(pref, DIMS);
    var hidden = null, hv = -1;
    DIMS.forEach(function (d) { if (d !== mainType && scores[d] > hv) { hv = scores[d]; hidden = d; } });
    var placeType = place ? placeTypeOf(place) : null;
    return {
      scores: scores, mainType: mainType, dominantPref: dominantPref,
      hidden: hidden, insight: getInsight(topOf(g, MAIN), dominantPref),
      place: place, placeType: placeType
    };
  }

  // ---------- 渲染：首页 ----------
  // 首页地球：Three.js 真 3D 自转球体（球体网格 + 等距柱状地球纹理 + 真实 rotateY 自转）。
  // 若 Three.js(CDN) 加载失败/超时，initEarth3D 自动降级为静态正射球图(assets/earth_ortho.png)。
  var earth3dState = null;
  function earthGlobe() { return '<div class="earth" id="earth3d"></div>'; }

  function fallbackEarthStatic(box) {
    box.style.backgroundImage = 'url("assets/earth_ortho.png")';
    box.style.backgroundSize = "cover";
    box.style.backgroundPosition = "center";
  }

  // 释放 WebGL 资源，防止离开首页后渲染循环/上下文泄漏
  function disposeEarth3D() {
    if (!earth3dState) return;
    try { earth3dState.stop(); } catch (e) {}
    try {
      var s = earth3dState;
      if (s.geo) s.geo.dispose();
      if (s.mat) s.mat.dispose();
      if (s.tex) s.tex.dispose();
      if (s.atmoGeo) s.atmoGeo.dispose();
      if (s.atmoMat) s.atmoMat.dispose();
      if (s.renderer) {
        s.renderer.dispose();
        if (s.renderer.domElement && s.renderer.domElement.parentNode)
          s.renderer.domElement.parentNode.removeChild(s.renderer.domElement);
      }
    } catch (e) {}
    earth3dState = null;
  }

  function initEarth3D() {
    var box = document.getElementById("earth3d");
    if (!box) return;
    // Three.js 尚未就绪：等待 CDN（最多 3s），失败则降级静态正射球图
    if (typeof THREE === "undefined") {
      if (window.__threeFailed) { fallbackEarthStatic(box); return; }
      if (!box.dataset.wt) box.dataset.wt = String(Date.now());
      if (Date.now() - Number(box.dataset.wt) < 3000) { setTimeout(initEarth3D, 120); return; }
      fallbackEarthStatic(box); return;
    }
    box.dataset.wt = "0";
    try {
      var W = box.clientWidth || 180, H = box.clientHeight || 180;
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 0, 2.7);
      var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(W, H);
      renderer.domElement.style.borderRadius = "50%";
      renderer.domElement.style.display = "block";
      box.appendChild(renderer.domElement);

      var geo = new THREE.SphereGeometry(1, 64, 48);
      var tex = new THREE.TextureLoader().load("assets/earth.jpg");
      // 兼容新旧色彩空间 API（r152+ 用 colorSpace / outputColorSpace；旧版用 encoding / outputEncoding）
      if (typeof THREE.SRGBColorSpace !== "undefined") tex.colorSpace = THREE.SRGBColorSpace;
      else if (typeof THREE.sRGBEncoding !== "undefined") tex.encoding = THREE.sRGBEncoding;
      if (typeof THREE.SRGBColorSpace !== "undefined" && renderer.outputColorSpace !== undefined)
        renderer.outputColorSpace = THREE.SRGBColorSpace;
      else if (typeof THREE.sRGBEncoding !== "undefined" && renderer.outputEncoding !== undefined)
        renderer.outputEncoding = THREE.sRGBEncoding;
      var mat = new THREE.MeshPhongMaterial({ map: tex, shininess: 6, specular: 0x223344 });
      var earth = new THREE.Mesh(geo, mat);
      scene.add(earth);

      // 大气辉光壳（外层略大半透明蓝，BackSide 仅见边缘）
      var atmoGeo = new THREE.SphereGeometry(1.025, 64, 48);
      var atmoMat = new THREE.MeshBasicMaterial({ color: 0x3a7bd5, transparent: true, opacity: 0.16, side: THREE.BackSide });
      var atmo = new THREE.Mesh(atmoGeo, atmoMat);
      scene.add(atmo);

      scene.add(new THREE.AmbientLight(0x88aaff, 0.55));
      var dir = new THREE.DirectionalLight(0xffffff, 0.95);
      dir.position.set(-1, 0.6, 1.2);   // 左上前方主光
      scene.add(dir);

      var raf = null, running = true;
      function animate() {
        if (!running) return;
        earth.rotation.y += 0.0016;     // 约 30s 一圈的真实自转
        atmo.rotation.y = earth.rotation.y;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      }
      animate();

      earth3dState = {
        renderer: renderer, geo: geo, mat: mat, tex: tex, atmoGeo: atmoGeo, atmoMat: atmoMat,
        stop: function () { running = false; if (raf) cancelAnimationFrame(raf); }
      };
    } catch (e) {
      fallbackEarthStatic(box);
    }
  }

  function renderHome() {
    disposeEarth3D();
    app.innerHTML =
      '<div class="home">' +
        earthGlobe() +
        '<h1>发现你的地球人格</h1>' +
        '<p class="sub">20 个问题，找到属于你的地球身份</p>' +
        '<button class="cta" data-action="start">开始测试</button>' +
        '<p class="tip">MBTI 探索你的性格，地理人格探索你与地球的关系。</p>' +
      '</div>';
    setTimeout(initEarth3D, 30);
  }

  // ---------- 渲染：测试 ----------
  function renderQuiz() {
    var i = state.step;
    var q = QS[i];
    var total = QS.length;
    var pct = Math.round((i / total) * 100);
    var opts = q.options.map(function (o, idx) {
      return '<button class="opt" data-action="answer" data-qid="' + q.id + '" data-dim="' + o.dim + '">' +
        '<span class="num">' + (idx + 1) + '</span>' + o.text + '</button>';
    }).join("");
    var tag = q.type === "prefer" ? "偏好题" : "本能题";
    app.innerHTML =
      '<div class="quiz">' +
        '<div class="progress"><div class="bar" style="width:' + pct + '%"></div></div>' +
        '<div class="meta">第 ' + (i + 1) + ' / ' + total + ' 题 · ' + tag + '</div>' +
        '<h2 class="q">' + q.q + '</h2>' +
        '<div class="opts">' + opts + '</div>' +
        (i > 0 ? '<button class="ghost" data-action="prev">上一题</button>' : '') +
      '</div>';
  }

  // ---------- 渲染：选城市（生活时间最长的地方 · 单地点 · 地图选点 + 搜索框降级） ----------
  function renderCity() {
    var opts = CITIES.map(function (c) {
      return '<option value="' + c.city + '"></option>';
    }).join("");
    var sel = state.place ? state.place.city : "";
    app.innerHTML =
      '<div class="city">' +
        '<h2>你生活时间最长的地方是？</h2>' +
        '<p class="sub">' + PLACE_HINT + '</p>' +
        '<div class="map-wrap">' +
          '<div class="map-tip">📍 在地图上点出 <b>' + PLACE_TITLE + '</b>，或直接在下方输入城市</div>' +
          '<div id="mapDiv"></div>' +
          '<div id="mapPop" class="map-pop"></div>' +
          '<div id="pickStatus" class="pick-status">地图加载中…</div>' +
          '<div class="geo-note">地图数据 © 天地图 GS(2023)1312号 · 含完整国界与南海诸岛</div>' +
        '</div>' +
        '<div class="rows">' +
          '<div class="prow active">' +
            '<label>' + PLACE_TITLE + '</label>' +
            '<input id="city_life" list="cityList" value="' + sel + '" placeholder="点地图或输入，如 深圳 / 东京 / 拉萨" autocomplete="off">' +
          '</div>' +
        '</div>' +
        '<button class="cta" data-action="toResult">生成我的地球人格</button>' +
        '<button class="ghost" data-action="prev">上一题</button>' +
      '</div>' +
      '<datalist id="cityList">' + opts + '</datalist>';
    setTimeout(function () {
      var el = document.getElementById("city_life"); if (el) el.focus();
      initMap();
    }, 30);
  }

  // ---------- 地图选点（天地图合规底图，支持三地点） ----------
  var tdtMarkers = { life: null };
  function cleanCityName(name) {
    if (!name) return "";
    return name.replace(
      /(特别行政区|维吾尔自治区|壮族自治区|回族自治区|自治区|自治州|地区|市辖区|市|县|区|省|盟|林区)$/g, ""
    ).trim();
  }
  function parseGeo(result) {
    if (!result) return null;
    try { if (typeof result.getStatus === "function" && result.getStatus() !== 0) return null; } catch (e) {}
    var addr = "", comp = null;
    try { if (typeof result.getAddress === "function") addr = result.getAddress(); } catch (e) {}
    try { if (typeof result.getAddressComponent === "function") comp = result.getAddressComponent(); } catch (e) {}
    if (!addr && result.formattedAddress) addr = result.formattedAddress;
    if (!addr && result.address) addr = result.address;
    if (!comp && result.addressComponent) comp = result.addressComponent;
    if (!comp && result.addressComponents) comp = result.addressComponents;
    var city = "", province = "";
    if (comp) { city = comp.city || ""; province = comp.province || ""; }
    if (!city && addr) city = addr;
    return { city: city, province: province, addr: addr };
  }
  function updatePickStatus(html, ok) {
    var box = document.getElementById("pickStatus");
    if (!box) return;
    box.innerHTML = html;
    box.className = "pick-status" + (ok === false ? " warn" : (ok === true ? " ok" : ""));
  }
  function reverseGeo(lng, lat, cb) {
    try {
      var geocoder = new T.Geocoder();
      geocoder.getLocation(new T.LngLat(lng, lat), function (res) { cb(parseGeo(res)); });
    } catch (e) { cb(null); }
  }
  function setPlaceChoice(match, ll) {
    state.place = match;
    if (ll) state.lnglat = ll;
    var inp = document.getElementById("city_life");
    if (inp) inp.value = match ? match.city : "";
  }
  // 单地点模式：无需在三地之间顺延
  // 单地点模式：聚焦生活地输入框即可
  function syncPlaceUI(focus) {
    if (focus) {
      var inp = document.getElementById("city_life");
      if (inp) inp.focus();
    }
  }
  // 地图中央浮层提示（如「继续点击成长地」）
  var mapPopTimer = null;
  function showMapPop(html) {
    var pop = document.getElementById("mapPop");
    if (!pop) return;
    pop.innerHTML = html;
    pop.classList.add("show");
    if (mapPopTimer) clearTimeout(mapPopTimer);
    mapPopTimer = setTimeout(function () { pop.classList.remove("show"); }, 2600);
  }
  function addMarker(map, k, ll) {
    try {
      if (tdtMarkers[k]) {
        try { if (tdtMarkers[k].marker) map.removeOverLay(tdtMarkers[k].marker); } catch (e) {}
        try { if (tdtMarkers[k].label) map.removeOverLay(tdtMarkers[k].label); } catch (e) {}
      }
      var point = new T.LngLat(ll.lng, ll.lat);
      var marker = new T.Marker(point);
      map.addOverLay(marker);
      try {
        var label = new T.Label({ text: PLACE_TITLE, position: point, offset: new T.Point(-14, -30) });
        map.addOverLay(label);
        tdtMarkers[k] = { marker: marker, label: label };
      } catch (e2) { tdtMarkers[k] = { marker: marker }; }
    } catch (e) {}
  }
  // 隐藏天地图默认品牌 logo 标识（左上角图片）及任何加载失败的裂图。注意：审图号 GS(2023)1312号 烘焙在 cia_w 影像注记瓦片内，不受影响，合规照常。
  // 关键：瓦片图 URL 同样含 "tianditu"，因此绝不能用 "tianditu" 判定 logo，否则会把整张地图瓦片一并隐藏（地图整片空白）。
  // 只命中 src 含 "logo" 字样或已经裂图的小图（瓦片 URL 不含 logo，且瓦片尺寸大），避免误伤覆盖物。
  function hideTdtLogo() {
    ["mapDiv", "trackMap"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      // 1) 命中任何 class 含 logo 的容器（最稳）
      el.querySelectorAll('[class*="logo" i]').forEach(function (n) { n.style.display = "none"; });
      // 2) 隐藏 logo 图片，以及加载失败的小图（裂图占位符）
      el.querySelectorAll("img").forEach(function (im) {
        var s = (im.getAttribute("src") || "") + (im.getAttribute("alt") || "");
        var cls = im.className || "", pcls = (im.parentElement && im.parentElement.className) || "";
        var isLogoLike = /logo/i.test(s);
        var isBroken = im.complete && (im.naturalWidth === 0 || im.naturalHeight === 0);
        if (!isLogoLike && !isBroken) return;
        // 裂图且尺寸较大（如 256 瓦片）则暂不隐藏，可能是临时加载中；裂图且小 = _logo/图标，直接藏
        var w = im.naturalWidth || im.width || 0, h = im.naturalHeight || im.height || 0;
        if (isBroken && !isLogoLike && (w > 140 || h > 70 || /tile/i.test(cls + " " + pcls))) return;
        var p = im.closest('[class*="logo" i]') || im.parentElement;
        if (p) p.style.display = "none";
        im.style.display = "none";
      });
    });
  }
  function initMap() {
    var box = document.getElementById("mapDiv");
    if (!box) return;
    if (typeof T === "undefined" || !T.Map) {
      updatePickStatus("地图组件加载失败，请在下方输入框手动选择城市", false);
      box.style.height = "0";
      return;
    }
    try {
      var map = new T.Map("mapDiv");
      map.centerAndZoom(new T.LngLat(104, 35), 4); // 中国视野
      addTdtLayers(map); // 影像底图 + 影像注记（含城市名与官方审图号）
      hideTdtLogo(); setTimeout(hideTdtLogo, 500); // 移除左上角天地图品牌 logo
      if (state.lnglat) addMarker(map, "life", state.lnglat);
      updatePickStatus("已加载，点击地图选择「" + PLACE_TITLE + "」", true);
      map.addEventListener("click", function (e) {
        var ll = e.lnglat; if (!ll) return;
        var lng = (typeof ll.getLng === "function") ? ll.getLng() : ll.lng;
        var lat = (typeof ll.getLat === "function") ? ll.getLat() : ll.lat;
        if (!lng || !lat) return;
        state.lnglat = { lng: lng, lat: lat };
        addMarker(map, "life", { lng: lng, lat: lat });
        updatePickStatus("正在识别位置…");
        reverseGeo(lng, lat, function (g) {
          if (!g) { updatePickStatus("无法识别该位置，请重试或手动输入", false); return; }
          var clean = cleanCityName(g.city || g.province);
          var match = findCity(clean);
          setPlaceChoice(match, { lng: lng, lat: lat });
          if (match) {
            updatePickStatus("已选 " + PLACE_TITLE + "：" + match.city + " · 点击下方「生成我的地球人格」", true);
            showMapPop("✅ " + PLACE_TITLE + " 已选：" + match.city +
              "<br>点击下方按钮生成你的地球人格");
          } else {
            updatePickStatus("识别为「" + (g.city || g.addr) + "」暂未收录，已记录坐标，可手动输入近似城市", false);
          }
        });
      });
    } catch (e) {
      updatePickStatus("地图初始化失败，请在下方输入框手动选择城市", false);
      box.style.height = "0";
    }
  }
  // 结果页：生活地地图（单点标注，无连线）
  function initTrackMap() {
    var box = document.getElementById("trackMap");
    if (!box) return;
    var note = document.getElementById("trackNote");
    if (!state.lnglat || typeof T === "undefined" || !T.Map) {
      box.style.display = "none";
      if (note) note.style.display = "block";
      return;
    }
    try {
      var map = new T.Map("trackMap");
      map.centerAndZoom(new T.LngLat(state.lnglat.lng, state.lnglat.lat), 6);
      addTdtLayers(map); // 影像底图 + 影像注记（含官方审图号）
      hideTdtLogo(); setTimeout(hideTdtLogo, 500); // 移除左上角天地图品牌 logo
      var point = new T.LngLat(state.lnglat.lng, state.lnglat.lat);
      try {
        map.addOverLay(new T.Marker(point));
        map.addOverLay(new T.Label({ text: PLACE_TITLE, position: point, offset: new T.Point(-14, -30) }));
      } catch (e) {}
    } catch (e) {
      box.style.display = "none";
      if (note) note.style.display = "block";
    }
  }

  // ---------- 渲染：结果 ----------
  function bestMatches(mt) {
    var dims = DIMS.filter(function (d) { return d !== mt; });
    dims.sort(function (a, b) { return window.COMPAT(mt, b).score - window.COMPAT(mt, a).score; });
    return dims.slice(0, 3);
  }
  function renderResult() {
    var r = state.result, m = PER[r.mainType], hidden = PER[r.hidden];

    // 同步到「我的学习」（主站本地学习档案，同域 localStorage 共享）
    try {
      if (window.PlanetLearning && r && r.mainType) {
        var _pt = PER[r.mainType];
        window.PlanetLearning.recordGame({
          gameId: 'geotype',
          title: '地理人格测试',
          subtitle: _pt ? _pt.name : r.mainType,
          score: null,
        });
      }
    } catch (e) {}
    var base = m.base;
    var recObj = REC[r.mainType] || { similar: [], complement: [], travel: [] };
    function recList(arr) { return (arr || []).map(function (c) { return "<li>" + c + "</li>"; }).join(""); }
    var hiddenLine = (r.hidden !== r.mainType)
      ? ('<div class="hidden-tag">隐藏标签：' + hidden.icon + ' ' + hidden.name + '（' + hidden.keywords + '）</div>')
      : '';
    var triple = (function () {
      if (!(r.place && r.placeType)) return '';
      var p = PER[r.placeType];
      return '<div class="tcard single"><div class="tlabel">' + PLACE_TITLE + '</div>' +
        '<div class="ticon" style="color:' + p.color + '">' + p.icon + '</div>' +
        '<div class="tname">' + p.name + '</div>' +
        '<div class="tcity">' + r.place.city + '</div>' +
        '<div class="tdesc">' + p.keywords + '</div></div>';
    })();
    var trajLine = '';
    var geoLines = (r.place)
      ? ('<div class="geoline"><span class="glabel">' + PLACE_TITLE + '</span>' +
          r.place.city + " · " + (CLIM[r.place.climate] || r.place.climate) +
          (r.place.coastal ? " · 海洋影响强" : "") + " · 城市化 " + r.place.urbanization + "%</div>")
      : '<div class="geoline">未选择</div>';
    var bm = bestMatches(r.mainType);
    var bmHtml = bm.map(function (d) {
      var p = PER[d], c = window.COMPAT(r.mainType, d);
      return '<div class="match"><span class="micon" style="color:' + p.color + '">' + p.icon + '</span>' +
        '<div class="minfo"><b>' + p.name + '</b><span class="mscore">契合 ' + c.score + '</span>' +
        '<div class="mtext">' + c.text + '</div></div></div>';
    }).join("");
    var careerHtml = (m.career || []).map(function (x) { return "<li>" + x + "</li>"; }).join("");
    app.innerHTML =
      '<div class="result">' +
        '<div class="hero" style="border-color:' + m.color + '">' +
          '<div class="big-icon" style="color:' + m.color + '">' + m.icon + '</div>' +
          '<div class="type">' + m.name + '城市居民</div>' +
          '<div class="en">' + m.en + '</div>' +
        '</div>' +
        '<div class="insight">“' + r.insight + '”</div>' +
        hiddenLine +
        '<div class="section-title">你的地理底色</div>' +
        '<div class="triple">' + triple + '</div>' +
        trajLine +
        '<div class="trackwrap">' +
          '<div class="section-title">你的生活地坐标</div>' +
          '<div id="trackMap" class="track-map"></div>' +
          '<div id="trackNote" class="track-note" style="display:none">在上一页选择生活地，即可在此查看它的地理坐标。</div>' +
        '</div>' +
        '<div class="grid2">' +
          '<div class="card">' +
            '<h3>我的属性</h3>' +
            '<canvas id="radar" width="320" height="320"></canvas>' +
            '<h3 style="margin-top:14px">地理人格 × 职业</h3>' +
            '<ul class="rec">' + careerHtml + '</ul>' +
          '</div>' +
          '<div class="card">' +
            '<h3>地理档案</h3>' +
            '<div class="geo">' + geoLines + '</div>' +
            '<h3 style="margin-top:14px">人格描述</h3>' +
            '<p class="desc">' + m.desc + '</p>' +
            '<h3 style="margin-top:14px">地理人格 × 生活方式</h3>' +
            '<p class="desc">' + m.life + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="section-title">推荐城市</div>' +
        '<div class="city-rec">' +
          '<div class="cr"><h4>与你相似</h4><ul class="rec">' + recList(recObj.similar) + '</ul></div>' +
          '<div class="cr"><h4>互补反差</h4><ul class="rec">' + recList(recObj.complement) + '</ul></div>' +
          '<div class="cr"><h4>该去旅行</h4><ul class="rec">' + recList(recObj.travel) + '</ul></div>' +
        '</div>' +
        '<div class="section-title">你的最佳拍档</div>' +
        '<div class="matches">' + bmHtml + '</div>' +
        '<div class="actions">' +
          '<button class="cta" data-action="genCard">生成地球人格卡</button>' +
          '<button class="ghost" data-action="restart">重新测试</button>' +
        '</div>' +
        '<div id="cardWrap" class="card-wrap"></div>' +
      '</div>';
    drawRadar(document.getElementById("radar"), base, m.color);
    setTimeout(function () { initTrackMap(); }, 30);
  }

  // ---------- 雷达图 ----------
  function drawRadar(cv, base, color) {
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var W = cv.width, H = cv.height, cx = W / 2, cy = H / 2, R = 110;
    var axes = [
      { k: "explore", label: "探索" }, { k: "connect", label: "连接" },
      { k: "stable", label: "稳定" }, { k: "nature", label: "自然" }
    ];
    ctx.clearRect(0, 0, W, H);
    // 网格
    for (var ring = 1; ring <= 4; ring++) {
      var rr = R * ring / 4;
      ctx.beginPath();
      for (var i = 0; i <= axes.length; i++) {
        var a = -Math.PI / 2 + i * (Math.PI * 2 / axes.length);
        var x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.stroke();
    }
    // 轴 + 标签
    axes.forEach(function (ax, i) {
      var a = -Math.PI / 2 + i * (Math.PI * 2 / axes.length);
      var x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y);
      ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.font = "13px sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(ax.label, cx + Math.cos(a) * (R + 20), cy + Math.sin(a) * (R + 20));
    });
    // 数据
    ctx.beginPath();
    axes.forEach(function (ax, i) {
      var v = (base[ax.k] || 0) / 100;
      var a = -Math.PI / 2 + i * (Math.PI * 2 / axes.length);
      var x = cx + Math.cos(a) * R * v, y = cy + Math.sin(a) * R * v;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = hexA(color, 0.35); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
    // 顶点
    axes.forEach(function (ax, i) {
      var v = (base[ax.k] || 0) / 100;
      var a = -Math.PI / 2 + i * (Math.PI * 2 / axes.length);
      var x = cx + Math.cos(a) * R * v, y = cy + Math.sin(a) * R * v;
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
    });
  }
  function hexA(hex, a) {
    var h = hex.replace("#", "");
    var r = parseInt(h.substring(0, 2), 16), g = parseInt(h.substring(2, 4), 16), b = parseInt(h.substring(4, 6), 16);
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }

  // ---------- 分享卡 ----------
  function genCard() {
    var r = state.result, m = PER[r.mainType];
    var cv = document.createElement("canvas");
    cv.width = 600; cv.height = 800;
    var c = cv.getContext("2d");
    // 背景
    var grd = c.createLinearGradient(0, 0, 0, 800);
    grd.addColorStop(0, "#0a1230"); grd.addColorStop(1, "#060a1c");
    c.fillStyle = grd; c.fillRect(0, 0, 600, 800);
    // 圆点星空
    c.fillStyle = "rgba(255,255,255,0.5)";
    for (var i = 0; i < 60; i++) {
      var x = (i * 97) % 600, y = (i * 53) % 800;
      c.beginPath(); c.arc(x, y, (i % 3) * 0.6 + 0.4, 0, Math.PI * 2); c.fill();
    }
    // 底噪抖动：消除深色渐变导出 PNG 时的色带断层（overlay 混合，居中于中灰，对文字/星空无影响）
    (function () {
      var nc = document.createElement("canvas"); nc.width = nc.height = 128;
      var nctx = nc.getContext("2d");
      var img = nctx.createImageData(128, 128);
      for (var p = 0; p < img.data.length; p += 4) {
        var v = 128 + (Math.random() * 2 - 1) * 22;
        img.data[p] = img.data[p + 1] = img.data[p + 2] = v; img.data[p + 3] = 255;
      }
      nctx.putImageData(img, 0, 0);
      c.save();
      c.globalCompositeOperation = "overlay";
      c.globalAlpha = 0.55;
      c.fillStyle = c.createPattern(nc, "repeat");
      c.fillRect(0, 0, 600, 800);
      c.restore();
    })();
    // 标题
    c.fillStyle = "#9fd0ff"; c.font = "22px sans-serif"; c.textAlign = "center";
    c.fillText("🌍 我的地球人格", 300, 70);
    // 大图标 + 名称
    c.fillStyle = m.color; c.font = "90px sans-serif"; c.fillText(m.icon, 300, 200);
    c.fillStyle = "#fff"; c.font = "bold 40px sans-serif"; c.fillText(m.name + "城市居民", 300, 270);
    c.fillStyle = "#8fa6c8"; c.font = "18px sans-serif"; c.fillText(m.en, 300, 305);
    // 属性条
    var base = m.base;
    var bars = [["探索力", base.explore], ["连接力", base.connect], ["稳定力", base.stable], ["自然力", base.nature]];
    var by = 360;
    bars.forEach(function (b) {
      c.fillStyle = "rgba(255,255,255,0.8)"; c.font = "16px sans-serif"; c.textAlign = "left";
      c.fillText(b[0], 80, by);
      c.fillStyle = "rgba(255,255,255,0.15)"; c.fillRect(170, by - 12, 300, 12);
      c.fillStyle = m.color; c.fillRect(170, by - 12, 300 * b[1] / 100, 12);
      c.fillStyle = "#fff"; c.textAlign = "right"; c.fillText(b[1] + "%", 520, by);
      by += 44;
    });
    // slogan
    c.fillStyle = "#cfe0ff"; c.font = "italic 18px sans-serif"; c.textAlign = "center";
    c.fillText(m.keywords, 300, 560);
    // 三重地理人格
    var tri = PLACE_TITLE + "：" + (r.place && r.placeType ? PER[r.placeType].name : "—");
    c.fillStyle = "#9fb6d8"; c.font = "15px sans-serif";
    c.fillText(tri, 300, 592);
    var bm = bestMatches(r.mainType);
    var bmLine = "最佳拍档：" + bm.map(function (d) { return PER[d].name; }).join(" / ");
    c.fillText(bmLine, 300, 618);
    c.fillStyle = "#6f86a8"; c.font = "15px sans-serif";
    c.fillText("你的是什么？ planetgis.cn/geotype", 300, 760);
    // 输出
    var wrap = document.getElementById("cardWrap");
    if (wrap) {
      wrap.innerHTML = '<img class="card-img" src="' + cv.toDataURL("image/png") + '" alt="地球人格卡">' +
        '<a class="cta" download="我的地球人格卡.png" href="' + cv.toDataURL("image/png") + '">下载卡片</a>';
    }
    track("shares", { main_type: r.mainType, place_type: r.placeType || "" });
  }

  // ---------- 导航 ----------
  function next() {
    state.step++;
    if (state.step >= QS.length) renderCity();
    else renderQuiz();
  }
  function findCity(val) {
    if (!val) return null;
    val = val.trim();
    var exact = CITIES.filter(function (c) { return c.city === val; })[0];
    if (exact) return exact;
    var like = CITIES.filter(function (c) { return c.city.indexOf(val) >= 0; })[0];
    return like || null;
  }

  app.addEventListener("click", function (e) {
    var t = e.target.closest("[data-action]"); if (!t) return;
    var a = t.getAttribute("data-action");
    if (a === "start") { state.step = 0; track("starts"); disposeEarth3D(); renderQuiz(); }
    else if (a === "answer") {
      var dim = t.getAttribute("data-dim"), qid = t.getAttribute("data-qid");
      state.answers[qid] = dim;
      track("answer", { question: qid, step: state.step + 1 });
      next();
    }
    else if (a === "prev") {
      if (state.step > 0) { state.step--; renderQuiz(); }
      else renderHome();
    }
    else if (a === "toResult") {
      var inp = document.getElementById("city_life");
      var v = inp ? inp.value : "";
      if (!state.place && v) state.place = findCity(v);
      state.result = compute(state.answers, state.place);
      track("done", { main_type: state.result.mainType, place_type: state.result.placeType || "" });
      if (state.place) track("city_selected", { city: state.place.city, place_type: state.result.placeType || "" });
      renderResult();
    }
    else if (a === "restart") {
      state = { answers: {}, step: 0, place: null, lnglat: null, result: null };
      renderHome();
    }
    else if (a === "genCard") { genCard(); }
  });

  renderHome();
})();
