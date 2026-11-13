/* 离我最近的门店 · 互动逻辑
   数据源：data/nearest.json（站内 13 张地图合并，GCJ-02，10897 点 / 437 城）
   输入：城市搜索 / 地图点选 / 浏览器定位 → Haversine 直线距离 → 每类品牌取最近点
   输出：分组结果列表 + 地图连线与高亮 + Canvas 分享卡 */
(function () {
  "use strict";

  var R = 6371.0088;
  var D2R = Math.PI / 180;
  var EMPTY = { type: "FeatureCollection", features: [] };

  var DATA = null, BRANDS = [], BY_ID = {}, GROUPS = {}, CITIES = [];
  var origin = null, results = [], activeId = null;
  var map = null, popup = null, hlIndex = -1, cityHits = [];

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fc(features) { return { type: "FeatureCollection", features: features }; }
  function point(p, props) {
    return { type: "Feature", geometry: { type: "Point", coordinates: [p.x, p.y] }, properties: props };
  }
  function fmtDist(d) {
    if (d < 100) return d.toFixed(1);
    return Math.round(d).toLocaleString("en-US");
  }
  function toast(msg) {
    var el = $("toast");
    el.textContent = msg;
    el.classList.add("on");
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove("on"); }, 2600);
  }

  // ── WGS84 → GCJ-02（浏览器定位坐标与高德瓦片对齐） ──────────
  function outOfChina(lng, lat) {
    return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
  }
  function transLat(x, y) {
    var r = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
    r += (20 * Math.sin(y * Math.PI) + 40 * Math.sin(y / 3 * Math.PI)) * 2 / 3;
    r += (160 * Math.sin(y / 12 * Math.PI) + 320 * Math.sin(y * Math.PI / 30)) * 2 / 3;
    return r;
  }
  function transLng(x, y) {
    var r = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
    r += (20 * Math.sin(x * Math.PI) + 40 * Math.sin(x / 3 * Math.PI)) * 2 / 3;
    r += (150 * Math.sin(x / 12 * Math.PI) + 300 * Math.sin(x / 30 * Math.PI)) * 2 / 3;
    return r;
  }
  function wgs2gcj(lng, lat) {
    if (outOfChina(lng, lat)) return [lng, lat];
    var a = 6378245.0, ee = 0.00669342162296594323;
    var dLat = transLat(lng - 105, lat - 35);
    var dLng = transLng(lng - 105, lat - 35);
    var rad = lat * D2R;
    var magic = Math.sin(rad);
    magic = 1 - ee * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
    dLng = (dLng * 180) / (a / sqrtMagic * Math.cos(rad) * Math.PI);
    return [lng + dLng, lat + dLat];
  }

  // ── 球面直线距离（km） ─────────────────────────────────────
  function hav(a, b) {
    var dLat = (b.y - a.y) * D2R, dLng = (b.x - a.x) * D2R;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a.y * D2R) * Math.cos(b.y * D2R) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(s));
  }

  // ── 数据展开 ───────────────────────────────────────────────
  function expand(d) {
    DATA = d;
    BRANDS = d.brands;
    BY_ID = {};
    CITIES = d.cities.map(function (c) { return { n: c[0], p: c[1], x: c[2], y: c[3] }; });
    BRANDS.forEach(function (b) { BY_ID[b.id] = b; });
    Object.keys(d.groups).forEach(function (bid) {
      GROUPS[bid] = d.groups[bid].map(function (r) {
        if (BY_ID[bid].level === "city") {
          return { x: r[0], y: r[1], n: r[2], c: r[3], k: r[4] };
        }
        if (bid === "apple_auth") {
          return { x: r[0], y: r[1], n: r[2], c: r[3], a: "" };
        }
        return { x: r[0], y: r[1], n: r[2], c: r[3], p: r[4], a: r[5] };
      });
    });
  }

  function calcResults() {
    return BRANDS.map(function (b) {
      var best = null, bd = Infinity;
      GROUPS[b.id].forEach(function (p) {
        var d = hav(origin, p);
        if (d < bd) { bd = d; best = p; }
      });
      return { brand: b, p: best, d: bd };
    });
  }

  // ── GeoJSON 数据源 ─────────────────────────────────────────
  function baseFC() {
    var fs = [];
    BRANDS.forEach(function (b) {
      if (!b.draw) return;
      GROUPS[b.id].forEach(function (p) {
        fs.push(point(p, { bid: b.id, color: b.color, name: p.n }));
      });
    });
    return fc(fs);
  }
  function nearestFC() {
    return fc(results.map(function (r) {
      return point(r.p, { bid: r.brand.id, color: r.brand.color, name: r.brand.short, dist: r.d });
    }));
  }
  function linksFC() {
    return fc(results.map(function (r) {
      return {
        type: "Feature",
        geometry: { type: "LineString", coordinates: [[origin.x, origin.y], [r.p.x, r.p.y]] },
        properties: { bid: r.brand.id, color: r.brand.color }
      };
    }));
  }
  function selResult() {
    for (var i = 0; i < results.length; i++) {
      if (results[i].brand.id === activeId) return results[i];
    }
    return results[0];
  }
  function selLineFC() {
    var r = selResult();
    if (!r) return EMPTY;
    return fc([{
      type: "Feature",
      geometry: { type: "LineString", coordinates: [[origin.x, origin.y], [r.p.x, r.p.y]] },
      properties: { color: r.brand.color }
    }]);
  }
  function selPointFC() {
    var r = selResult();
    return r ? fc([point(r.p, { color: r.brand.color })]) : EMPTY;
  }
  function originFC() { return fc([point(origin, {})]); }

  // ── 高德瓦片 ───────────────────────────────────────────────
  function amapTiles(styleId) {
    return ["01", "02", "03", "04"].map(function (s) {
      return "https://wprd" + s + ".is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=" + styleId;
    });
  }

  function buildStyle() {
    return {
      version: 8,
      sources: {
        amap_img: { type: "raster", tiles: amapTiles(6), tileSize: 256, attribution: "高德地图" },
        amap_vec: { type: "raster", tiles: amapTiles(7), tileSize: 256, attribution: "高德地图" },
        provinces: { type: "geojson", data: "/maps/_shared/china-provinces.json" },
        links: { type: "geojson", data: linksFC() },
        link_sel: { type: "geojson", data: selLineFC() },
        poi_base: { type: "geojson", data: baseFC() },
        nearest: { type: "geojson", data: nearestFC() },
        sel: { type: "geojson", data: selPointFC() },
        origin: { type: "geojson", data: originFC() }
      },
      layers: [
        { id: "bg", type: "background", paint: { "background-color": "#070c16" } },
        { id: "amap-img", type: "raster", source: "amap_img", paint: { "raster-opacity": 0.82, "raster-brightness-max": 0.86 } },
        { id: "amap-vec", type: "raster", source: "amap_vec", layout: { visibility: "none" }, paint: { "raster-opacity": 0.9 } },
        { id: "province-fill", type: "fill", source: "provinces",
          paint: { "fill-color": "#0d2038", "fill-opacity": 0.32 } },
        { id: "province-line", type: "line", source: "provinces",
          paint: { "line-color": "#9cb6d6", "line-width": 0.8, "line-opacity": 0.5 } },
        { id: "links", type: "line", source: "links",
          paint: { "line-color": ["get", "color"], "line-width": 1.4, "line-opacity": 0.55 } },
        { id: "link-sel-glow", type: "line", source: "link_sel",
          paint: { "line-color": ["get", "color"], "line-width": 10, "line-opacity": 0.16, "line-blur": 5 } },
        { id: "link-sel", type: "line", source: "link_sel",
          paint: { "line-color": ["get", "color"], "line-width": 2.4, "line-opacity": 0.95 } },
        { id: "poi-base", type: "circle", source: "poi_base",
          paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 3.2, 8, 5.5],
            "circle-color": ["get", "color"], "circle-opacity": 0.85,
            "circle-stroke-width": 0.8, "circle-stroke-color": "#08101e" } },
        { id: "nearest-halo", type: "circle", source: "nearest",
          paint: { "circle-radius": 13, "circle-color": "rgba(0,0,0,0)",
            "circle-stroke-color": ["get", "color"], "circle-stroke-width": 2, "circle-stroke-opacity": 0.85 } },
        { id: "nearest-dot", type: "circle", source: "nearest",
          paint: { "circle-radius": 4.6, "circle-color": "#ffffff",
            "circle-stroke-color": ["get", "color"], "circle-stroke-width": 2 } },
        { id: "sel-halo", type: "circle", source: "sel",
          paint: { "circle-radius": 20, "circle-color": "rgba(0,0,0,0)",
            "circle-stroke-color": ["get", "color"], "circle-stroke-width": 2, "circle-stroke-opacity": 0.9 } },
        { id: "origin-pulse", type: "circle", source: "origin",
          paint: { "circle-radius": 17, "circle-color": "#4fd8f0", "circle-opacity": 0.18,
            "circle-stroke-color": "#4fd8f0", "circle-stroke-width": 1, "circle-stroke-opacity": 0.5 } },
        { id: "origin-dot", type: "circle", source: "origin",
          paint: { "circle-radius": 6.5, "circle-color": "#4fd8f0",
            "circle-stroke-color": "#ffffff", "circle-stroke-width": 2 } }
      ]
    };
  }

  function initMap() {
    map = new maplibregl.Map({
      container: "map", style: buildStyle(),
      center: [112, 33], zoom: 3.7, minZoom: 2.8, maxZoom: 16,
      attributionControl: false
    });
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 110, unit: "metric" }), "bottom-right");
    window.__map = map;
    window.__app = {
      setCity: function (name) {
        var c = findCity(name);
        if (c) setOrigin({ x: c.x, y: c.y, label: c.n + (c.p ? " · " + c.p : ""), city: c.n });
        return !!c;
      }
    };

    map.on("load", function () {
      renderLabels();
      $("mapHint").textContent = "点地图任意位置，即可重设「我的位置」";
    });
    map.on("move", renderLabels);
    map.on("zoom", renderLabels);
    map.on("click", onMapClick);
  }

  function onMapClick(e) {
    if (!map.getLayer("poi-base")) return;
    var hits = map.queryRenderedFeatures(e.point, { layers: ["poi-base", "nearest-dot", "nearest-halo"] });
    if (hits.length) {
      var p = hits[0].properties;
      var bid = p.bid, b = BY_ID[bid];
      var lngLat = hits[0].geometry.coordinates;
      var d = hav(origin, { x: lngLat[0], y: lngLat[1] });
      var rows = '<div class="pop-title">' + esc(p.name || "") + '</div>';
      if (b) rows += '<div class="pop-row">类别：<b>' + esc(b.name) + '</b></div>';
      rows += '<div class="pop-row">距我的位置：<b>' + fmtDist(d) + ' km</b>（直线）</div>';
      if (popup) popup.remove();
      popup = new maplibregl.Popup({ offset: 12, closeButton: true })
        .setLngLat(lngLat).setHTML(rows).addTo(map);
      return;
    }
    setOrigin({
      x: e.lngLat.lng, y: e.lngLat.lat,
      label: "地图点选 · " + e.lngLat.lng.toFixed(2) + "°E, " + e.lngLat.lat.toFixed(2) + "°N"
    });
    toast("已重设「我的位置」，距离已重算");
  }

  // ── 结果列表 ───────────────────────────────────────────────
  var GROUP_LABEL = { rare: "门址级 · 精确到店", edu: "公共设施", chain: "城市级 · 城市中心口径" };
  var GROUP_ORDER = ["rare", "edu", "chain"];

  function renderResults() {
    var html = "";
    GROUP_ORDER.forEach(function (g) {
      var rows = results.filter(function (r) { return r.brand.group === g; })
        .sort(function (a, b) { return a.d - b.d; });
      if (!rows.length) return;
      html += '<div class="group-title">' + GROUP_LABEL[g] + '</div>';
      rows.forEach(function (r) {
        var b = r.brand;
        var sub = b.level === "city"
          ? r.p.n + " · 该城 " + (r.p.k == null ? "—" : r.p.k) + " 个单元"
          : (r.p.n + (r.p.c ? " · " + r.p.c : ""));
        html += '<div class="res-row' + (b.id === activeId ? " on" : "") + '" data-bid="' + b.id + '">' +
          '<span class="res-dot" style="background:' + b.color + ';color:' + b.color + '"></span>' +
          '<div class="res-main"><b>' + esc(b.short) +
          (b.level === "city" ? '<span class="res-tag">城市中心</span>' : "") +
          '</b><small>' + esc(sub) + '</small></div>' +
          '<div class="res-dist"><b>' + fmtDist(r.d) + '</b><small>km</small></div>' +
          '</div>';
      });
    });
    $("resultList").innerHTML = html;
  }

  function setActive(bid, focus) {
    activeId = bid;
    var rows = document.querySelectorAll(".res-row");
    for (var i = 0; i < rows.length; i++) {
      rows[i].classList.toggle("on", rows[i].getAttribute("data-bid") === bid);
    }
    if (map && map.getSource("link_sel")) {
      map.getSource("link_sel").setData(selLineFC());
      map.getSource("sel").setData(selPointFC());
    }
    renderLabels();
    if (focus && map) focusOnSelected();
  }

  function focusOnSelected() {
    var r = selResult();
    if (!r) return;
    if (r.d < 0.6) {
      map.easeTo({ center: [origin.x, origin.y], zoom: Math.max(map.getZoom(), 9), duration: 700 });
      return;
    }
    var minx = Math.min(origin.x, r.p.x), maxx = Math.max(origin.x, r.p.x);
    var miny = Math.min(origin.y, r.p.y), maxy = Math.max(origin.y, r.p.y);
    var pad = window.innerWidth <= 860
      ? { top: 70, bottom: Math.round(window.innerHeight * 0.5), left: 30, right: 30 }
      : { top: 90, bottom: 90, left: 390, right: 80 };
    map.fitBounds([[minx, miny], [maxx, maxy]], { padding: pad, maxZoom: 10.5, duration: 750 });
  }

  // ── 地图数据更新 ───────────────────────────────────────────
  function updateMapData() {
    if (!map || !map.getSource("nearest")) return;
    map.getSource("links").setData(linksFC());
    map.getSource("link_sel").setData(selLineFC());
    map.getSource("nearest").setData(nearestFC());
    map.getSource("sel").setData(selPointFC());
    map.getSource("origin").setData(originFC());
  }

  function renderLabels() {
    var el = $("labels");
    if (!el || !map || !origin || !map.getLayer("nearest-dot")) return;
    var mobile = window.innerWidth <= 860;
    var html = "";
    function visible(q) {
      return q.x > (mobile ? 12 : 380) && q.x < window.innerWidth - 12 &&
        q.y > 60 && q.y < window.innerHeight - (mobile ? window.innerHeight * 0.66 : 40);
    }
    function proj(p) {
      try { return map.project([p.x, p.y]); } catch (e) { return null; }
    }
    var po = proj(origin);
    if (po && visible(po)) {
      html += '<div class="lab origin" style="left:' + po.x + 'px;top:' + po.y + 'px">我的位置</div>';
    }
    var r = selResult();
    if (r) {
      var q = proj(r.p);
      if (q && visible(q)) {
        html += '<div class="lab" style="left:' + q.x + 'px;top:' + q.y + 'px;border-color:' + r.brand.color + '">' +
          esc(r.brand.short) + '<small>' + fmtDist(r.d) + ' km</small></div>';
      }
    }
    el.innerHTML = html;
  }

  function setOrigin(o) {
    origin = o;
    results = calcResults();
    if (!activeId || !BY_ID[activeId]) {
      var rare = results.filter(function (r) { return r.brand.group === "rare"; })
        .sort(function (a, b) { return a.d - b.d; });
      activeId = (rare[0] || results[0]).brand.id;
    }
    $("originCur").textContent = "当前：" + o.label;
    renderResults();
    updateMapData();
    renderLabels();
    syncUrl();
  }

  function syncUrl() {
    try {
      var u = new URL(window.location.href);
      if (origin.city) u.searchParams.set("city", origin.city);
      else u.searchParams.delete("city");
      history.replaceState(null, "", u.pathname + u.search + u.hash);
    } catch (err) { /* 忽略：iframe 内可能受限 */ }
  }

  // ── 城市搜索 ───────────────────────────────────────────────
  function findCity(name) {
    var q = String(name || "").trim();
    if (!q) return null;
    var exact = CITIES.filter(function (c) { return c.n === q; })[0];
    if (exact) return exact;
    return CITIES.filter(function (c) { return c.n.indexOf(q) >= 0; })[0] || null;
  }
  function hideCityList() { $("cityList").classList.remove("on"); hlIndex = -1; }
  function renderCityList(hits) {
    cityHits = hits; hlIndex = -1;
    $("cityList").innerHTML = hits.length
      ? hits.map(function (c, i) {
        return '<li data-i="' + i + '">' + esc(c.n) + '<span>' + esc(c.p) + '</span></li>';
      }).join("")
      : '<li data-i="-1" style="cursor:default;color:#7f96b3">没有匹配的城市</li>';
    $("cityList").classList.add("on");
  }
  function chooseCity(i) {
    var c = cityHits[i];
    if (!c) return;
    $("cityInput").value = c.n;
    hideCityList();
    setOrigin({ x: c.x, y: c.y, label: c.n + (c.p ? " · " + c.p : ""), city: c.n });
    toast("已定位到 " + c.n + "，距离已重算");
  }
  function bindSearch() {
    var input = $("cityInput"), list = $("cityList");
    input.addEventListener("input", function () {
      var q = input.value.trim();
      if (!q) { hideCityList(); return; }
      renderCityList(CITIES.filter(function (c) {
        return c.n.indexOf(q) >= 0 || c.p.indexOf(q) >= 0;
      }).slice(0, 8));
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { hideCityList(); return; }
      if (!cityHits.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        hlIndex += e.key === "ArrowDown" ? 1 : -1;
        if (hlIndex < 0) hlIndex = cityHits.length - 1;
        if (hlIndex >= cityHits.length) hlIndex = 0;
        var lis = list.querySelectorAll("li");
        for (var i = 0; i < lis.length; i++) lis[i].classList.toggle("hl", i === hlIndex);
      } else if (e.key === "Enter") {
        e.preventDefault();
        chooseCity(hlIndex >= 0 ? hlIndex : 0);
      }
    });
    list.addEventListener("click", function (e) {
      var li = e.target.closest("li");
      if (li && li.getAttribute("data-i") !== "-1") chooseCity(+li.getAttribute("data-i"));
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".search-wrap")) hideCityList();
    });
  }

  // ── 分享卡 ─────────────────────────────────────────────────
  function cardRows() {
    var rare = results.filter(function (r) { return r.brand.group !== "chain"; })
      .sort(function (a, b) { return a.d - b.d; }).slice(0, 4);
    var chain = results.filter(function (r) { return r.brand.group === "chain"; })
      .sort(function (a, b) { return a.d - b.d; }).slice(0, 2);
    return rare.concat(chain);
  }
  function drawCard() {
    var c = $("shareCanvas"), ctx = c.getContext("2d");
    var W = c.width, H = c.height;
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#050b16"); g.addColorStop(0.55, "#0a1a2e"); g.addColorStop(1, "#0c2740");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // 右侧雷达装饰
    ctx.save();
    ctx.translate(880, 330);
    for (var i = 1; i <= 6; i++) {
      ctx.beginPath(); ctx.arc(0, 0, i * 62, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(79,216,240," + (0.16 - i * 0.018) + ")";
      ctx.lineWidth = 1; ctx.stroke();
    }
    cardRows().forEach(function (r, j) {
      var ang = -Math.PI / 2 + j * (Math.PI * 2 / 6);
      var len = 120 + Math.min(r.d, 800) / 8;
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
      ctx.strokeStyle = r.brand.color; ctx.globalAlpha = 0.55;
      ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(Math.cos(ang) * len, Math.sin(ang) * len, 5, 0, Math.PI * 2);
      ctx.fillStyle = r.brand.color; ctx.fill();
    });
    ctx.restore();

    // 左侧渐隐遮罩
    var m = ctx.createLinearGradient(0, 0, 720, 0);
    m.addColorStop(0, "rgba(4,9,18,0.98)"); m.addColorStop(0.72, "rgba(4,9,18,0.9)");
    m.addColorStop(1, "rgba(4,9,18,0)");
    ctx.fillStyle = m; ctx.fillRect(0, 0, 760, H);

    ctx.textBaseline = "top";
    ctx.fillStyle = "#4fd8f0";
    ctx.font = 'bold 20px "Microsoft YaHei", sans-serif';
    ctx.fillText("PLANETGIS · 互动地图", 64, 56);

    ctx.fillStyle = "#ffffff";
    ctx.font = 'bold 66px "Microsoft YaHei", sans-serif';
    ctx.fillText("离我最近的", 62, 106);
    ctx.fillStyle = "#4fd8f0";
    ctx.fillText("门店与地标", 62, 184);

    ctx.fillStyle = "#c8d9ec";
    ctx.font = '24px "Microsoft YaHei", sans-serif';
    ctx.fillText("起点：" + origin.label, 66, 276);
    ctx.fillStyle = "#7f96b3";
    ctx.font = '18px "Microsoft YaHei", sans-serif';
    ctx.fillText("13 类品牌 · 10,897 个点位 · 437 座城市 · 直线距离", 66, 316);

    // 结果条
    var rows = cardRows();
    rows.forEach(function (r, i) {
      var y = 370 + i * 46;
      ctx.beginPath(); ctx.arc(76, y + 12, 6, 0, Math.PI * 2);
      ctx.fillStyle = r.brand.color; ctx.fill();
      ctx.fillStyle = "#e8f0fa";
      ctx.font = 'bold 21px "Microsoft YaHei", sans-serif';
      ctx.fillText(r.brand.short, 96, y);
      ctx.fillStyle = "#93a9c4";
      ctx.font = '17px "Microsoft YaHei", sans-serif';
      ctx.fillText(r.p.n.length > 12 ? r.p.n.slice(0, 12) + "…" : r.p.n, 250, y + 3);
      ctx.fillStyle = "#ffffff";
      ctx.font = 'bold 23px "Microsoft YaHei", sans-serif';
      var t = fmtDist(r.d) + " km";
      ctx.fillText(t, 620 - ctx.measureText(t).width, y);
    });

    ctx.fillStyle = "rgba(160,190,220,0.7)";
    ctx.font = '16px "Microsoft YaHei", sans-serif';
    ctx.fillText("planetgis.cn · 城市级品牌按城市中心计算 · 直线距离非驾车距离", 64, 632);
  }
  function bindShare() {
    $("btnShare").addEventListener("click", function () {
      drawCard();
      $("shareModal").classList.add("on");
    });
    $("btnCloseShare").addEventListener("click", function () { $("shareModal").classList.remove("on"); });
    $("shareModal").addEventListener("click", function (e) {
      if (e.target === $("shareModal")) $("shareModal").classList.remove("on");
    });
    $("btnDownload").addEventListener("click", function () {
      $("shareCanvas").toBlob(function (blob) {
        if (!blob) { toast("图片生成失败"); return; }
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "离我最近的门店-" + (origin.city || origin.label) + ".png";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1200);
        toast("分享卡片已保存");
      }, "image/png");
    });
  }

  // ── 其它交互 ───────────────────────────────────────────────
  function bindUI() {
    $("resultList").addEventListener("click", function (e) {
      var row = e.target.closest(".res-row");
      if (row) setActive(row.getAttribute("data-bid"), true);
    });
    $("btnLocate").addEventListener("click", function () {
      if (!navigator.geolocation) { toast("浏览器不支持定位，请点地图选位置"); return; }
      toast("正在定位…");
      navigator.geolocation.getCurrentPosition(function (pos) {
        var g = wgs2gcj(pos.coords.longitude, pos.coords.latitude);
        setOrigin({ x: g[0], y: g[1], label: "当前位置（浏览器定位）" });
        toast("定位成功，距离已重算");
      }, function (err) {
        toast("定位失败：" + (err && err.message ? err.message : "未知原因") + "，请点地图选位置");
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
    });
    $("btnClear").addEventListener("click", function () {
      toast("在地图上点一下，即可设为「我的位置」");
    });
    var bmBtns = document.querySelectorAll(".bm-seg button");
    for (var i = 0; i < bmBtns.length; i++) {
      bmBtns[i].addEventListener("click", function () {
        var mode = this.getAttribute("data-bm");
        for (var j = 0; j < bmBtns.length; j++) bmBtns[j].classList.toggle("on", bmBtns[j] === this);
        if (map && map.getSource("link_sel")) {
          map.setLayoutProperty("amap-img", "visibility", mode === "img" ? "visible" : "none");
          map.setLayoutProperty("amap-vec", "visibility", mode === "vec" ? "visible" : "none");
          map.setPaintProperty("province-fill", "fill-opacity", mode === "none" ? 0.55 : 0.32);
        }
      });
    }
    $("btnReset").addEventListener("click", function () {
      if (map) map.flyTo({ center: [112, 33], zoom: 3.7, duration: 800 });
    });
    $("drawer").addEventListener("click", function () {
      var side = $("side");
      var on = side.classList.toggle("collapsed");
      this.setAttribute("aria-expanded", String(!on));
    });
    $("panelOpen").addEventListener("click", function () {
      $("side").classList.remove("collapsed");
    });
    window.addEventListener("resize", renderLabels);
  }

  // ── 启动 ───────────────────────────────────────────────────
  function start() {
    fetch("data/nearest.json").then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (d) {
      expand(d);
      $("statBrand").textContent = BRANDS.length;
      $("statPoi").textContent = Object.keys(GROUPS).reduce(function (s, k) { return s + GROUPS[k].length; }, 0).toLocaleString("en-US");
      $("statCity").textContent = CITIES.length;
      var q = "";
      try { q = new URL(window.location.href).searchParams.get("city") || ""; } catch (e) { /* 忽略 */ }
      var c = findCity(q) || findCity("深圳") || { n: "深圳", p: "广东", x: 113.999354, y: 22.625912 };
      origin = { x: c.x, y: c.y, label: c.n + (c.p ? " · " + c.p : ""), city: c.n };
      results = calcResults();
      var rare = results.filter(function (r) { return r.brand.group === "rare"; })
        .sort(function (a, b) { return a.d - b.d; });
      activeId = (rare[0] || results[0]).brand.id;
      $("originCur").textContent = "当前：" + origin.label;
      $("cityInput").value = c.n;
      renderResults();
      initMap();
      bindSearch();
      bindShare();
      bindUI();
    }).catch(function (err) {
      $("resultList").innerHTML = '<div class="loading">数据加载失败：' + esc(err.message) + '</div>';
    });
  }

  start();
})();
