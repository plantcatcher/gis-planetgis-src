/* 全球半导体 / 晶圆厂分布图 · 互动逻辑
   晶圆厂级气泡：每个晶圆厂一个气泡，半径/颜色 = 月产能（千片，300mm 等效）；国家密度面按同一口径（各国工厂产能合计）着色；
   时间轴按工厂投产年份回放 1969—2026 制造版图扩张；左侧按产能排行，可按大洲筛选。
   数据口径：各工厂公开披露的月产能与投产年份（公开资料整理）；
   坐标为厂区代表点，非精确门址。
   合规：国界数据沿用本站统一底图（台湾已并入中国）。 */
(function () {
  "use strict";

  // 环线配色：冰青渐层（低产能淡青 → 高产能冷白），与蓝色国家密度面分工，避免蓝套蓝
  var STOPS = [
    [0, "#2f9ec4"], [20, "#22b8dd"], [50, "#38d0f0"],
    [100, "#67e8f9"], [150, "#a5f3fc"], [200, "#d6f7ff"], [300, "#ffffff"]
  ];
  // 核心亮点配色：白热渐层，作为环心的"通电"高光
  var CORE_STOPS = [
    [0, "#7fd4ee"], [20, "#9ce2f6"], [50, "#bcedfb"],
    [100, "#d9f6ff"], [150, "#ecfbff"], [200, "#f8feff"], [300, "#ffffff"]
  ];
  function stopExpr(stops) {
    var out = ["interpolate", ["linear"], ["coalesce", ["get", "count"], 0]];
    for (var i = 0; i < stops.length; i++) { out.push(stops[i][0], stops[i][1]); }
    return out;
  }
  function colorStops() { return stopExpr(STOPS); }
  function coreColorStops() { return stopExpr(CORE_STOPS); }

  /* 气泡半径：按 sqrt(产能) 分段，让「圆面积」近似正比于产能，大厂不再吞掉小厂；
     zoom 必须是顶层 interpolate 的输入（不能套乘法），故每层各写一套数值。 */
  var SQ = [1, 4.47, 7.07, 10, 12.25, 14.14, 17.32]; // sqrt(1/20/50/100/150/200/300)
  function radiusExpr(rows) {
    var byCount = function (r) {
      return ["interpolate", ["linear"], ["sqrt", ["coalesce", ["get", "count"], 0]],
        SQ[0], r[0], SQ[1], r[1], SQ[2], r[2],
        SQ[3], r[3], SQ[4], r[4], SQ[5], r[5], SQ[6], r[6]];
    };
    return ["interpolate", ["linear"], ["zoom"],
      0,   byCount(rows[0]),
      1.5, byCount(rows[1]),
      3,   byCount(rows[2]),
      5,   byCount(rows[3]),
      8,   byCount(rows[4])
    ];
  }
  // 彩环半径（数据主视觉）
  var RING_ROWS = [
    [1.6, 3.2, 5.0, 6.8, 8.8, 10.8, 13.0],    // zoom 0
    [3.0, 5.4, 8.0, 10.6, 13.4, 16.2, 19.5],  // 1.5
    [4.2, 7.2, 10.5, 14.0, 17.6, 21.5, 26.0], // 3
    [5.6, 9.2, 13.4, 17.8, 22.4, 27.2, 33.5], // 5
    [8.0, 12.4, 17.6, 23.0, 28.8, 35.0, 42.5] // 8
  ];
  // 核心亮点半径
  var CORE_ROWS = [
    [1.2, 1.8, 2.4, 3.0, 3.6, 4.2, 5.0],
    [1.6, 2.5, 3.4, 4.4, 5.4, 6.4, 7.6],
    [2.2, 3.2, 4.4, 5.6, 6.8, 8.2, 9.6],
    [2.8, 4.1, 5.6, 7.1, 8.6, 10.2, 12.0],
    [4.0, 5.8, 7.8, 9.8, 11.8, 13.8, 16.0]
  ];
  function scaleRows(rows, mul) {
    var out = [];
    for (var i = 0; i < rows.length; i++) {
      var r = [];
      for (var j = 0; j < rows[i].length; j++) r.push(Math.round(rows[i][j] * mul * 10) / 10);
      out.push(r);
    }
    return out;
  }

  /* 桌面宽屏 zoom<1.5 会并排出现多个地球副本；竖屏世界宽度远大于屏幕，
     可以用低 zoom 一次看到接近全球，故两端分别设 minZoom / 初始 zoom。 */
  var isMobile = window.innerWidth <= 760;
  var INIT_ZOOM = isMobile ? 0.15 : 1.5;
  var MIN_ZOOM = isMobile ? 0 : 1.5;

  // 全球底图：默认纯深色（不依赖境外瓦片）；Esri 卫星 / 地形晕渲按需加载
  var ESRI_IMG = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  var ESRI_RELIEF = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}";

  var mapStyle = {
    version: 8,
    sources: {
      esri_img:    { type: "raster", tiles: [ESRI_IMG], tileSize: 256, attribution: "Esri World Imagery" },
      esri_relief: { type: "raster", tiles: [ESRI_RELIEF], tileSize: 256, attribution: "Esri World Shaded Relief" },
      // 直接给 URL：即使运行时 fetch 失败，密度面也能由 MapLibre 自行加载
      countries:   { type: "geojson", data: "data/country-fills.geojson" },
      stores:      { type: "geojson", data: "data/stores.geojson", promoteId: "id" }
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#0b1220" } },
      { id: "esri-img", type: "raster", source: "esri_img", layout: { visibility: "none" },
        paint: { "raster-opacity": 0.9, "raster-brightness-max": 0.62, "raster-saturation": -0.45 } },
      { id: "esri-relief", type: "raster", source: "esri_relief", layout: { visibility: "none" },
        paint: { "raster-opacity": 0.85 } },
      {
        id: "country-fill", type: "fill", source: "countries",
        paint: {
          // 密度面用「暗蓝渐层」压住亮度，把高饱和留给气泡环，避免蓝底吞掉蓝环
          "fill-color": ["interpolate", ["linear"], ["coalesce", ["get", "semiCount"], 0],
            0, "#0a1220", 100, "#0c1a29", 300, "#0e2236", 600, "#102b45", 1000, "#123555", 1600, "#153f68"],
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 1.5, 0.92, 4.5, 0.46, 7.0, 0]
        }
      },
      { id: "country-line", type: "line", source: "countries",
        paint: { "line-color": "#7f95ad", "line-width": 0.6, "line-opacity": 0.5 } }
    ]
  };

  /* 全球取景：必须开 renderWorldCopies，否则 center 经度被锁在 ±34° 且跨 180° 看不到；
     minZoom 1.5 保证缩到最小时不会出现并排三个地球。 */
  var map = new maplibregl.Map({
    container: "map", style: mapStyle,
    center: isMobile ? [150, 25] : [-30, 25],
    zoom: INIT_ZOOM, minZoom: MIN_ZOOM, maxZoom: 12,
    renderWorldCopies: true, attributionControl: false
  });
  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
  map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-right");
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-right");
  window.__map = map;

  var labelsEl = document.createElement("div");
  labelsEl.id = "labels";
  map.getContainer().appendChild(labelsEl);

  // ---------- 状态 ----------
  var allStores = [], markets = [], meta = {}, marketByIso = {}, continentCount = {};
  var countryRaw = null;
  var viewYear = 2026;
  var labelOn = true;
  var popup = null, popupId = null, pinned = false;
  var rafPending = false;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function row(k, v) { if (v === "" || v == null) return ""; return '<tr><td class="k">' + k + "</td><td>" + v + "</td></tr>"; }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function bandColor(c) {
    for (var i = STOPS.length - 1; i >= 0; i--) if (c >= STOPS[i][0]) return STOPS[i][1];
    return STOPS[0][1];
  }
  function shareOf(c) { return meta.totalCapacity ? (Number(c || 0) / meta.totalCapacity * 100) : 0; }

  // ---------- 详情卡 ----------
  function storePopupHTML(p) {
    var c = Number(p.count) || 0;
    var col = bandColor(c);
    var planned = p.exited === true || p.exited === "true";
    var ysrc = p.yearSrc === "compiled" ? "（公开资料整理）" : "（官方 / 公开披露）";
    var rows = "";
    rows += row("大　洲", esc(p.continent));
    rows += row("月产能", planned ? "规划中（未投产）" : fmt(c) + " 千片");
    if (!planned && c > 0) rows += row("占全球产能", shareOf(c).toFixed(1) + "%");
    rows += row("类　型", esc(p.type));
    if (p.products) rows += row("主要产品", esc(p.products));
    if (p.area && Number(p.area) > 0) rows += row("建筑面积", esc(p.area) + " 万㎡");
    rows += row("投产年份", esc(p.enterYear) + ysrc);
    if (p.note) rows += row("备　注", esc(p.note));
    var tag = planned ? '<span class="era-tag is-exited">规划中</span>'
                      : '<span class="era-tag" style="background:' + col + ';color:#fff">' + fmt(c) + " 人</span>";
    return '<div class="pop" style="--c:' + col + '">' +
      "<h3>" + esc(p.name) + tag + "</h3>" +
      '<table class="kv">' + rows + "</table>" +
      '<div class="note">月产能为各厂公开披露或行业估算值（统一折算 300mm 等效，单位千片/月），坐标为厂区代表点。' +
      '国界数据已将台湾并入中国。时间轴累计值为已投产晶圆厂按当前产能求和，非当年真实产能。标注 * 的产能为行业估算。</div>' +
      "</div>";
  }

  function validLngLat(v) {
    if (!v) return null;
    if (Array.isArray(v) && v.length >= 2 && isFinite(v[0]) && isFinite(v[1])) return { lng: v[0], lat: v[1] };
    return (isFinite(v.lng) && isFinite(v.lat)) ? v : null;
  }
  function showPopup(props, lngLat, html) {
    var ll = validLngLat(lngLat);
    if (!ll) ll = map.getCenter();
    if (popup && popupId === props.id) { popup.setLngLat(ll); return; }
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ offset: 12, closeButton: true, closeOnClick: false, className: "mcd-popup", maxWidth: "340px" })
      .setLngLat(ll).setHTML(html || storePopupHTML(props)).addTo(map);
    popup.on("close", function () { popup = null; popupId = null; pinned = false; });
    popupId = props.id;
  }
  function removePopup() { if (popup) popup.remove(); popup = null; popupId = null; pinned = false; }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && popup && pinned) removePopup(); });

  // ---------- 气泡交互 ----------
  function bindStoreEvents() {
    var hovered = null;
    map.on("mousemove", function (e) {
      var fs = map.queryRenderedFeatures(e.point, { layers: ["stores-glow", "stores-ring", "stores-circle", "stores-exited"] });
      if (fs.length) {
        map.getCanvas().style.cursor = "pointer";
        var f = fs[0];
        if (hovered !== f.properties.id) {
          if (hovered != null) map.setFeatureState({ source: "stores", id: hovered }, { hover: false });
          hovered = f.properties.id;
          map.setFeatureState({ source: "stores", id: hovered }, { hover: true });
        }
        showPopup(f.properties, e.lngLat);
      } else {
        map.getCanvas().style.cursor = "";
        if (hovered != null) { map.setFeatureState({ source: "stores", id: hovered }, { hover: false }); hovered = null; }
        if (!pinned) removePopup();
      }
    });
    map.on("click", function (e) {
      var fs = map.queryRenderedFeatures(e.point, { layers: ["stores-glow", "stores-ring", "stores-circle", "stores-exited"] });
      if (fs.length) {
        var f = fs[0];
        if (hovered != null && hovered !== f.properties.id) map.setFeatureState({ source: "stores", id: hovered }, { hover: false });
        hovered = f.properties.id;
        map.setFeatureState({ source: "stores", id: hovered }, { hover: true });
        showPopup(f.properties, e.lngLat); pinned = true;
      } else {
        removePopup();
      }
    });
  }

  // ---------- 工厂标注（全球阈值 + ±360 世界副本投影 + 碰撞网格） ----------
  var LBL_MIN_DIST = isMobile ? 58 : 84;
  function updateLabels() {
    if (!labelOn) { labelsEl.innerHTML = ""; return; }
    var z = map.getZoom();
    var w = map.getCanvas().clientWidth, h = map.getCanvas().clientHeight;
    var leftEdge = w > 760 ? 320 : 40;
    var cands = [];
    for (var i = 0; i < markets.length; i++) {
      var c = markets[i];
      if (c.firstYear > viewYear || c.exited) continue;
      var need = c.count >= 150 ? 1.5 : c.count >= 50 ? 2.2 : c.count >= 20 ? 2.8 : c.count >= 10 ? 3.2 : c.count >= 5 ? 3.6 : 4.4;
      if (isMobile) need -= 1.4;
      if (z < need) continue;
      for (var k = -1; k <= 1; k++) {
        var p = map.project([c.lng + k * 360, c.lat]);
        if (p.x < leftEdge || p.x > w - 50 || p.y < 30 || p.y > h - 30) continue;
        cands.push({ c: c, x: p.x, y: p.y });
      }
    }
    cands.sort(function (a, b) { return b.c.count - a.c.count; });
    var html = "", grid = {}, n = 0, MAX = isMobile ? 16 : 44;
    for (var q = 0; q < cands.length && n < MAX; q++) {
      var t = cands[q];
      var lx = (t.x - 46 < leftEdge) ? t.x + 46 : t.x;
      var gx = Math.floor(lx / LBL_MIN_DIST), gy = Math.floor(t.y / LBL_MIN_DIST), hit = false;
      for (var ax = gx - 1; ax <= gx + 1 && !hit; ax++)
        for (var ay = gy - 1; ay <= gy + 1 && !hit; ay++) {
          var bucket = grid[ax + "," + ay];
          if (!bucket) continue;
          for (var bi = 0; bi < bucket.length; bi++) {
            var o = bucket[bi], ddx = o[0] - lx, ddy = o[1] - t.y;
            if (ddx * ddx + ddy * ddy < LBL_MIN_DIST * LBL_MIN_DIST) { hit = true; break; }
          }
        }
      if (hit) continue;
      (grid[gx + "," + gy] || (grid[gx + "," + gy] = [])).push([lx, t.y]);
      html += '<div class="city-lbl" data-iso="' + esc(t.c.iso) + '" style="left:' + lx + "px;top:" + t.y + 'px">' +
        esc(t.c.name) + '<span class="cc">' + fmt(t.c.count) + "</span></div>";
      n++;
    }
    labelsEl.innerHTML = html;
    var els = labelsEl.querySelectorAll(".city-lbl");
    for (var m = 0; m < els.length; m++) {
      els[m].addEventListener("click", function () { focusMarket(this.getAttribute("data-iso"), null); });
    }
  }
  function requestLabelUpdate() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () { rafPending = false; updateLabels(); });
  }

  // ---------- 左侧目录 ----------
  function updateStats() {
    document.getElementById("stat-stores").textContent = fmt(meta.totalCapacity || 0);
    document.getElementById("stat-cities").textContent = meta.activeFabs || 0;
    document.getElementById("stat-provs").textContent = meta.continents || 0;
  }
  function buildLegend() {
    document.getElementById("era-filter").innerHTML = STOPS.map(function (s, i) {
      var label = i === 0 ? "<" + fmt(STOPS[1][0]) : (i === STOPS.length - 1 ? "≥" + fmt(s[0]) : fmt(s[0]));
      return '<span class="lg-item"><i style="background:' + s[1] + '"></i>' + label + "</span>";
    }).join("");
  }

  var searchKw = "", contFilter = "all";
  function buildMarketList() {
    var list = document.getElementById("city-list");
    var kw = searchKw.toLowerCase();
    var items = markets.filter(function (c) {
      if (contFilter !== "all" && c.continent !== contFilter) return false;
      if (!kw) return true;
      return c.name.toLowerCase().indexOf(kw) >= 0 ||
             c.nameEn.toLowerCase().indexOf(kw) >= 0 ||
             c.iso.toLowerCase().indexOf(kw) >= 0 ||
             (c.countryIso || "").toLowerCase().indexOf(kw) >= 0;
    });
    items.sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name, "zh"); });
    if (!items.length) { list.innerHTML = '<div class="list-empty">没有匹配的工厂</div>'; }
    else {
      list.innerHTML = items.map(function (c) {
        var meta2 = c.continent + " · 投产 " + c.firstYear + (c.yearSrc === "compiled" ? "*" : "");
        var num = c.exited ? "规划中" : fmt(c.count) + " 千片" + (c.est ? "*" : "");
        return '<button class="city-item' + (c.exited ? " is-exited" : "") + '" data-iso="' + esc(c.iso) + '">' +
          '<div class="ci-top"><span class="ci-name">' + esc(c.name) + "</span>" +
          '<span class="ci-count">' + num + "</span></div>" +
          '<div class="ci-meta">' + esc(meta2) + (c.note ? " · " + esc(c.note) : "") + "</div></button>";
      }).join("");
    }
    var btns = list.querySelectorAll(".city-item");
    for (var i = 0; i < btns.length; i++) btns[i].addEventListener("click", function () { focusMarket(this.dataset.iso, this); });
    document.getElementById("list-count").textContent = "共 " + items.length + " 座晶圆厂 · * 年份/产能为公开资料整理";
  }

  function focusMarket(iso, btn) {
    var c = marketByIso[iso];
    if (!c) return;
    if (window.matchMedia("(max-width: 760px)").matches) {
      sidePanel.classList.add("collapsed");
      document.getElementById("panel-open").setAttribute("aria-expanded", "false");
    }
    if (btn) {
      var old = document.querySelectorAll(".city-item.is-selected");
      for (var k = 0; k < old.length; k++) old[k].classList.remove("is-selected");
      btn.classList.add("is-selected");
    }
    var z = c.count >= 150 ? 4.0 : c.count >= 50 ? 4.6 : 5.4;
    map.flyTo({ center: [c.lng, c.lat], zoom: z, speed: 1.2, curve: 1.4 });
    map.once("moveend", function () { showPopup(fullProps(c), [c.lng, c.lat]); pinned = true; });
  }
  function fullProps(c) {
    return { id: c.iso, name: c.name, continent: c.continent, count: c.count,
      type: c.type, products: c.products, area: c.area, enterYear: c.firstYear, yearSrc: c.yearSrc, note: c.note, exited: c.exited };
  }

  // ---------- 时间轴过滤：气泡、标注、国家密度面同步 ----------
  function updateCountryFills() {
    if (!countryRaw || !map.getSource("countries")) return;
    var agg = {};
    for (var i = 0; i < markets.length; i++) {
      var m = markets[i];
      if (m.exited || m.firstYear > viewYear) continue;
      agg[m.countryIso] = (agg[m.countryIso] || 0) + m.count;
    }
    for (var j = 0; j < countryRaw.features.length; j++) {
      var p = countryRaw.features[j].properties;
      p.semiCount = (p.semiIso && agg[p.semiIso]) ? agg[p.semiIso] : 0;
    }
    map.getSource("countries").setData(countryRaw);
  }
  function activeFilter() {
    return ["all", ["==", ["get", "exited"], false], ["<=", ["get", "enterYear"], viewYear]];
  }
  function applyFilter() {
    var f = activeFilter();
    var layers = ["stores-glow", "stores-ring", "stores-circle"];
    for (var i = 0; i < layers.length; i++) {
      if (map.getLayer(layers[i])) map.setFilter(layers[i], f);
    }
    if (map.getLayer("stores-orbit")) {
      map.setFilter("stores-orbit", ["all", f, [">=", ["get", "count"], 100]]);
    }
    if (map.getLayer("stores-exited")) {
      map.setFilter("stores-exited", ["all", ["==", ["get", "exited"], true],
        ["<=", ["get", "enterYear"], viewYear]]);
    }
    updateCountryFills();
    requestLabelUpdate();
  }

  // ---------- 搜索 ----------
  var searchInput = document.getElementById("search");
  var searchResult = document.getElementById("searchResult");
  function renderSearch(q) {
    if (!q) { searchResult.innerHTML = ""; searchResult.classList.remove("has-hits"); return; }
    var hits = markets.filter(function (c) {
      return c.name.indexOf(q) >= 0 || c.nameEn.toLowerCase().indexOf(q.toLowerCase()) >= 0 ||
             c.iso.toLowerCase().indexOf(q.toLowerCase()) >= 0 ||
             (c.countryIso || "").toLowerCase().indexOf(q.toLowerCase()) >= 0;
    }).slice(0, 20);
    if (!hits.length) { searchResult.innerHTML = '<li class="empty">无匹配工厂</li>'; searchResult.classList.add("has-hits"); return; }
    searchResult.innerHTML = hits.map(function (c) {
      return '<li data-iso="' + esc(c.iso) + '"><span>' + esc(c.name) + "</span>" +
        '<span class="tag">' + esc(c.continent) + " · " + (c.exited ? "规划中" : fmt(c.count) + " 千片" + (c.est ? "*" : "")) + "</span></li>";
    }).join("");
    searchResult.classList.add("has-hits");
  }
  searchInput.addEventListener("input", function () { searchKw = this.value.trim(); renderSearch(searchKw); buildMarketList(); });
  searchResult.addEventListener("click", function (e) {
    var li = e.target.closest("li"); if (!li || !li.dataset.iso) return;
    var iso = li.dataset.iso, c = marketByIso[iso];
    searchResult.innerHTML = ""; searchResult.classList.remove("has-hits"); searchInput.value = ""; searchKw = "";
    buildMarketList();
    if (!c) return;
    map.flyTo({ center: [c.lng, c.lat], zoom: 4.6, speed: 1.2 });
    map.once("moveend", function () { showPopup(fullProps(c), [c.lng, c.lat]); pinned = true; });
  });

  // ---------- 底图与叠加 ----------
  var optsBtn = document.getElementById("map-opts-btn");
  var optsPanel = document.getElementById("map-opts");
  function setOptsOpen(open) { optsPanel.classList.toggle("open", open); optsBtn.setAttribute("aria-expanded", String(open)); }
  optsBtn.addEventListener("click", function (e) { e.stopPropagation(); setOptsOpen(!optsPanel.classList.contains("open")); });
  document.addEventListener("click", function (e) { if (optsPanel.classList.contains("open") && !optsPanel.contains(e.target)) setOptsOpen(false); });

  function setVis(id, on) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); }
  function setBasemap(mode) {
    setVis("esri-img", mode === "img");
    setVis("esri-relief", mode === "vec");
    var opts = document.querySelectorAll(".bm-opt");
    for (var i = 0; i < opts.length; i++) { var r = opts[i].querySelector("input"); if (r) opts[i].classList.toggle("active", r.checked); }
  }
  var bmRadios = document.querySelectorAll('input[name="basemap"]');
  for (var bi = 0; bi < bmRadios.length; bi++) bmRadios[bi].addEventListener("change", function () { setBasemap(this.value); });
  var bmChecked = document.querySelector('input[name="basemap"]:checked');
  setBasemap(bmChecked ? bmChecked.value : "none");

  function bindToggle(id, fn) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("click", function () {
      var on = this.getAttribute("aria-pressed") !== "true";
      this.setAttribute("aria-pressed", String(on)); fn(on);
    });
  }
  bindToggle("toggleProv", function (on) { setVis("country-fill", on); setVis("country-line", on); });
  bindToggle("toggleLabel", function (on) { labelOn = on; requestLabelUpdate(); });

  var contSel = document.getElementById("prov-select");
  function buildContSelect() {
    var names = Object.keys(continentCount).sort(function (a, b) { return continentCount[b] - continentCount[a]; });
    contSel.innerHTML = '<option value="all">全部大洲（' + names.length + '）</option>' +
      names.map(function (n) { return '<option value="' + esc(n) + '">' + esc(n) + "（" + fmt(continentCount[n]) + "）</option>"; }).join("");
    contSel.addEventListener("change", function () { contFilter = this.value; buildMarketList(); });
  }

  // ---------- 目录开合 ----------
  var sidePanel = document.getElementById("side-panel");
  var drawerHandle = document.getElementById("drawer-handle");
  if (window.matchMedia("(max-width: 760px)").matches) { sidePanel.classList.add("collapsed"); drawerHandle.setAttribute("aria-expanded", "false"); }
  drawerHandle.addEventListener("click", function () { var c = sidePanel.classList.toggle("collapsed"); this.setAttribute("aria-expanded", String(!c)); });
  document.getElementById("panel-close").addEventListener("click", function () { sidePanel.classList.add("collapsed"); document.getElementById("panel-open").setAttribute("aria-expanded", "false"); });
  document.getElementById("panel-open").addEventListener("click", function () { sidePanel.classList.remove("collapsed"); this.setAttribute("aria-expanded", "true"); });

  // ---------- 时间轴 ----------
  var tlSlider = document.getElementById("tl-slider");
  var tlYear = document.getElementById("tl-year");
  var tlCum = document.getElementById("tl-cum");
  var tlPlay = document.getElementById("tl-play");
  var playing = false, playTimer = null;
  function cumulative() {
    var n = 0, marketsN = 0;
    for (var i = 0; i < markets.length; i++) {
      if (markets[i].firstYear <= viewYear && !markets[i].exited) { n += markets[i].count; marketsN++; }
    }
    return { stores: n, markets: marketsN };
  }
  function updateTimelineUI() {
    var c = cumulative();
    tlSlider.value = viewYear;
    tlYear.textContent = isMobile ? (viewYear + " 年") : (viewYear + " 年 · 累计投产 " + c.markets + " 座晶圆厂");
    tlCum.innerHTML = "累计月产能 <b>" + fmt(c.stores) + "</b> 千片";
  }
  function onYearChange() {
    viewYear = Number(tlSlider.value);
    applyFilter(); updateTimelineUI();
  }
  tlSlider.addEventListener("input", onYearChange);
  function stopPlay() { playing = false; if (playTimer) clearInterval(playTimer); playTimer = null; tlPlay.classList.remove("playing"); tlPlay.textContent = "▶"; }
  function startPlay() {
    if (viewYear >= (meta.yearMax || 2026)) { viewYear = meta.yearMin || 1980; tlSlider.value = viewYear; onYearChange(); }
    playing = true; tlPlay.classList.add("playing"); tlPlay.textContent = "⏸";
    playTimer = setInterval(function () {
      if (viewYear >= (meta.yearMax || 2026)) { stopPlay(); return; }
      viewYear++; tlSlider.value = viewYear; onYearChange();
    }, 180);
  }
  tlPlay.addEventListener("click", function () { if (playing) stopPlay(); else startPlay(); });

  // ---------- 启动 ----------
  function refreshUI() {
    if (markets.length) {
      updateStats(); buildLegend(); buildContSelect(); buildMarketList(); updateLabels(); updateTimelineUI();
      if (countryRaw) applyFilter();
    }
  }

  map.on("load", function () {
    bindStoreEvents();
    var RING = radiusExpr(RING_ROWS);
    var CORE = radiusExpr(CORE_ROWS);
    var GLOW = radiusExpr(scaleRows(RING_ROWS, 1.85));
    var ORBIT = radiusExpr(scaleRows(RING_ROWS, 1.34));
    // 1) 柔光扩散：给高产能厂一圈空气感，避免环形过于扁平
    map.addLayer({
      id: "stores-glow", type: "circle", source: "stores",
      filter: ["==", ["get", "exited"], false],
      paint: {
        "circle-radius": GLOW,
        "circle-color": colorStops(), "circle-opacity": 0.17, "circle-blur": 1
      }
    });
    // 2) 靶环：只给产能 ≥100 千片的主力厂，做双层同心，强化层级
    map.addLayer({
      id: "stores-orbit", type: "circle", source: "stores",
      filter: ["all", ["==", ["get", "exited"], false], [">=", ["get", "count"], 100]],
      paint: {
        "circle-radius": ORBIT,
        "circle-color": "rgba(0,0,0,0)",
        "circle-stroke-width": ["case", ["boolean", ["feature-state", "hover"], false], 1.8, 1],
        "circle-stroke-color": "#9ec5ff",
        "circle-stroke-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.85, 0.34]
      }
    });
    // 3) 主环：产能着色，环宽随 zoom 微调（zoom 只能作顶层输入，故不用 case 包裹）
    map.addLayer({
      id: "stores-ring", type: "circle", source: "stores",
      filter: ["==", ["get", "exited"], false],
      paint: {
        "circle-radius": RING,
        "circle-color": "rgba(0,0,0,0)",
        "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 0, 1.4, 1.5, 2.2, 3, 2.6, 5, 3.0, 8, 3.4],
        "circle-stroke-color": ["case", ["boolean", ["feature-state", "hover"], false], "#ffffff", colorStops()],
        "circle-stroke-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.92]
      }
    });
    // 4) 核心亮点：硅片意象，中心提亮，鼠标交互以这层为准
    map.addLayer({
      id: "stores-circle", type: "circle", source: "stores",
      filter: ["==", ["get", "exited"], false],
      paint: {
        "circle-radius": CORE,
        "circle-color": coreColorStops(),
        "circle-stroke-width": 0.7, "circle-stroke-color": "rgba(7,14,30,0.85)",
        "circle-opacity": 1
      }
    });
    // 规划中（未投产）工厂：空心灰点，与在营工厂区分
    map.addLayer({
      id: "stores-exited", type: "circle", source: "stores",
      filter: ["==", ["get", "exited"], true],
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 1.5, 3.5, 5, 6],
        "circle-color": "rgba(0,0,0,0)",
        "circle-stroke-width": 1.6, "circle-stroke-color": "#94a3b8", "circle-stroke-opacity": 0.9
      }
    });
    applyFilter();
  });

  fetch("data/stores.geojson").then(function (r) { return r.json(); }).then(function (fc) {
    allStores = fc.features;
  }).catch(function (e) { console.error("stores.geojson 加载失败", e); });

  fetch("data/markets.json").then(function (r) { return r.json(); }).then(function (d) {
    markets = d.markets; meta = d.meta; continentCount = d.continentCount || {};
    for (var i = 0; i < markets.length; i++) marketByIso[markets[i].iso] = markets[i];
    tlSlider.min = d.meta.yearMin; tlSlider.max = d.meta.yearMax;
    refreshUI();
  }).catch(function (e) { console.error("markets.json 加载失败", e); });

  fetch("data/country-fills.geojson").then(function (r) { return r.json(); }).then(function (geo) {
    countryRaw = geo;
    updateCountryFills();
  }).catch(function (e) { console.error("country-fills.geojson 加载失败", e); });

  map.on("move", requestLabelUpdate);
  map.on("zoom", requestLabelUpdate);
})();
