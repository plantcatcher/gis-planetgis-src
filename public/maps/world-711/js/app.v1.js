/* 全球 7-Eleven 分布图 · 互动逻辑
   市场级气泡：每个市场一个气泡，半径/颜色 = 逐市场门店数；国家密度面按同一口径着色；
   时间轴按首店年份回放 1927—2026 全球化进程；左侧按门店数排行，可按大洲筛选。
   数据口径：逐市场门店数综合 Seven & i FY2025/2026 年报与各市场运营商 2025—2026 年公开披露，
   日本 21,600 / 泰国 15,945 / 美国 12,500 / 韩国 11,170 / 菲律宾 4,491 / 马来西亚 2,678 等；
   柬埔寨、老挝、阿联酋为估算值（公开逐店数据有限）。逐市场求和约 86,696 家，
   与 Seven & i 披露的全球约 8.6—8.7 万家吻合；本图不缩放任何逐市场数值，详情卡逐条标注数据来源。
   合规：官方把中国内地、中国台湾、中国香港、中国澳门分列，本图按一个中国原则
   合并为「中国」13,711 家；国界数据沿用台湾已并入中国的统一底图。
   已退出市场（印尼 2017、印度、以色列 2024 等）不计入总数。坐标为市场代表点，非门址。 */
(function () {
  "use strict";

  // 门店数分级配色：深蓝灰（少）→ 蓝 → 青 → 绿 → 黄 → 橙 → 红（最多）
  var STOPS = [
    [0, "#152238"], [50, "#2f6f9c"], [200, "#1d9bb5"], [1000, "#2fb37a"],
    [5000, "#ffc233"], [10000, "#ff7a1a"], [21600, "#e8452a"]
  ];
  function colorStops() {
    var out = ["interpolate", ["linear"], ["coalesce", ["get", "count"], 0]];
    for (var i = 0; i < STOPS.length; i++) { out.push(STOPS[i][0], STOPS[i][1]); }
    return out;
  }
  // 气泡半径：zoom 必须是顶层 interpolate 的输入，各档输出再套一层按 count 的 interpolate
  // 7-Eleven 门店数在 30—21,600 之间，分档按 1 / 50 / 200 / 1000 / 5000 / 10000 / 21600 重设
  function countRadiusExpr() {
    var byCount = function (a, b, c, d, e, f, g) {
      return ["interpolate", ["linear"], ["coalesce", ["get", "count"], 0],
        1, a, 50, b, 200, c, 1000, d, 5000, e, 10000, f, 21600, g];
    };
    return ["interpolate", ["linear"], ["zoom"],
      0,   byCount(1.5, 2.5, 3.5, 5, 7, 10, 14),
      1.5, byCount(3, 5, 7, 10, 14, 20, 28),
      3,   byCount(4, 6, 9, 13, 18, 26, 36),
      5,   byCount(5, 8, 12, 17, 23, 32, 44),
      8,   byCount(8, 12, 17, 25, 35, 50, 68)
    ];
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
          "fill-color": ["interpolate", ["linear"], ["coalesce", ["get", "storeCount"], 0],
            0, "#101c30", 50, "#2f6f9c", 200, "#1d9bb5", 1000, "#2fb37a",
            5000, "#ffc233", 10000, "#ff7a1a", 21600, "#e8452a"],
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 1.5, 0.72, 4.5, 0.40, 7.0, 0]
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
    center: isMobile ? [100, 12] : [100, 22],
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

  // ---------- 详情卡 ----------
  function storePopupHTML(p) {
    var c = Number(p.count) || 0;
    var col = bandColor(c);
    var exited = p.exited === true || p.exited === "true";
    var ysrc = p.yearSrc === "brand" ? "（品牌创立年）" : "（公开编年）";
    var dsrc = p.dataSrc === "cnmerge" ? "中国（含大陆/台湾/香港/澳门，按一个中国原则合并；2025—2026 各市场运营商披露）"
             : p.dataSrc === "est" ? "估算值（市场较小，逐店公开数据有限）"
             : "各市场运营商 2025—2026 年公开披露";
    var rows = "";
    rows += row("大　洲", esc(p.continent));
    rows += row("门 店 数", exited ? "已退出，现无门店" : fmt(c) + " 家");
    if (!exited) rows += row("全球占比", Number(p.share || 0) + "%（按本图总量 86,696 家）");
    rows += row("首店年份", esc(p.enterYear) + ysrc);
    if (p.entered) rows += row("首店地点", esc(p.entered));
    rows += row("数据来源", esc(dsrc));
    if (p.note) rows += row("备　注", esc(p.note));
    var tag = exited ? '<span class="era-tag" style="background:#64748b">已退出</span>'
                     : '<span class="era-tag" style="background:' + col + ';color:#111">' + fmt(c) + " 家</span>";
    return '<div class="pop" style="--c:' + col + '">' +
      "<h3>" + esc(p.name) + tag + "</h3>" +
      '<table class="kv">' + rows + "</table>" +
      '<div class="note">逐市场门店数综合 Seven & i FY2025/2026 年报与各市场运营商 2025—2026 年披露，' +
      '逐条见「数据来源」。逐市场求和约 86,696 家；柬埔寨、老挝、阿联酋为估算值（目录标 *）。' +
      '按一个中国原则，大陆、台湾、香港、澳门合并为「中国」13,711 家；已退出市场（印尼 2017、印度、以色列 2024 等）未计入。' +
      '坐标为市场代表点，非门址。时间轴累计值为已进驻市场的当前门店数之和，非当年真实门店数。</div>' +
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
    popup = new maplibregl.Popup({ offset: 12, closeButton: true, closeOnClick: false, className: "seven-popup", maxWidth: "320px" })
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
      var fs = map.queryRenderedFeatures(e.point, { layers: ["stores-circle", "stores-exited"] });
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
      var fs = map.queryRenderedFeatures(e.point, { layers: ["stores-circle", "stores-exited"] });
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

  // ---------- 市场标注（全球阈值 + ±360 世界副本投影 + 碰撞网格） ----------
  var LBL_MIN_DIST = isMobile ? 48 : 62;   // 7-Eleven 门店集中在东亚与东南亚，缩小碰撞距离以显示更多标签
  function updateLabels() {
    if (!labelOn) { labelsEl.innerHTML = ""; return; }
    var z = map.getZoom();
    var w = map.getCanvas().clientWidth, h = map.getCanvas().clientHeight;
    var leftEdge = w > 760 ? 320 : 40;   // 桌面端左侧目录占 304px，标注不要藏在下面
    var cands = [];
    for (var i = 0; i < markets.length; i++) {
      var c = markets[i];
      if (c.firstYear > viewYear || c.exited) continue;
      var need = c.count >= 1000 ? 1.5 : c.count >= 200 ? 2.0 : 2.8;
      if (isMobile) need -= 1.4;   // 竖屏初始 zoom 低，标注阈值同步前移
      if (z < need) continue;
      // renderWorldCopies 下地图可平移到 ±360 副本，三个副本都要能出现标注
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
      // 靠近左侧目录时把标签整体右移，避免被 304px 侧栏裁掉半截
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
    document.getElementById("stat-stores").textContent = fmt(meta.total || 0);
    document.getElementById("stat-cities").textContent = meta.activeMarkets || 0;
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
             c.iso.toLowerCase().indexOf(kw) >= 0;
    });
    items.sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name, "zh"); });
    if (!items.length) { list.innerHTML = '<div class="list-empty">没有匹配的市场</div>'; }
    else {
      list.innerHTML = items.map(function (c) {
        var meta2 = c.continent + " · 首店 " + c.firstYear + (c.dataSrc === "est" ? "*" : "");
        var num = c.exited ? "已退出" : fmt(c.count) + " 家";
        return '<button class="city-item' + (c.exited ? " is-exited" : "") + '" data-iso="' + esc(c.iso) + '">' +
          '<div class="ci-top"><span class="ci-name">' + esc(c.name) + "</span>" +
          '<span class="ci-count">' + num + "</span></div>" +
          '<div class="ci-meta">' + esc(meta2) + (c.note ? " · " + esc(c.note.slice(0, 16)) + (c.note.length > 16 ? "…" : "") : "") + "</div></button>";
      }).join("");
    }
    var btns = list.querySelectorAll(".city-item");
    for (var i = 0; i < btns.length; i++) btns[i].addEventListener("click", function () { focusMarket(this.dataset.iso, this); });
    document.getElementById("list-count").textContent = "共 " + items.length + " 个市场 · * 估算值（柬埔寨/老挝/阿联酋）";
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
    var z = c.count >= 1000 ? 3.6 : c.count >= 200 ? 4.4 : 5.4;
    map.flyTo({ center: [c.lng, c.lat], zoom: z, speed: 1.2, curve: 1.4 });
    map.once("moveend", function () { showPopup(fullProps(c), [c.lng, c.lat]); pinned = true; });
  }
  function fullProps(c) {
    return { id: c.iso, name: c.name, continent: c.continent, count: c.count,
      share: c.share, enterYear: c.firstYear, yearSrc: c.yearSrc,
      dataSrc: c.dataSrc, entered: c.entered, note: c.note, exited: c.exited };
  }

  // ---------- 时间轴过滤：气泡、标注、国家密度面同步 ----------
  function updateCountryFills() {
    if (!countryRaw || !map.getSource("countries")) return;
    for (var i = 0; i < countryRaw.features.length; i++) {
      var p = countryRaw.features[i].properties;
      var m = marketByIso[p.mktIso];
      p.storeCount = (m && m.firstYear <= viewYear) ? m.count : 0;
    }
    map.getSource("countries").setData(countryRaw);
  }
  function activeFilter() {
    return ["all", ["==", ["get", "exited"], false], ["<=", ["get", "enterYear"], viewYear]];
  }
  function applyFilter() {
    if (map.getLayer("stores-circle")) map.setFilter("stores-circle", activeFilter());
    if (map.getLayer("stores-halo")) map.setFilter("stores-halo", activeFilter());
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
             c.iso.toLowerCase().indexOf(q.toLowerCase()) >= 0;
    }).slice(0, 20);
    if (!hits.length) { searchResult.innerHTML = '<li class="empty">无匹配市场</li>'; searchResult.classList.add("has-hits"); return; }
    searchResult.innerHTML = hits.map(function (c) {
      return '<li data-iso="' + esc(c.iso) + '"><span>' + esc(c.name) + "</span>" +
        '<span class="tag">' + esc(c.continent) + " · " + (c.exited ? "已退出" : fmt(c.count) + " 家") + "</span></li>";
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
      if (markets[i].firstYear <= viewYear) { n += markets[i].count; marketsN++; }
    }
    return { stores: n, markets: marketsN };
  }
  function updateTimelineUI() {
    var c = cumulative();
    tlSlider.value = viewYear;
    tlYear.textContent = isMobile ? (viewYear + " 年") : (viewYear + " 年 · 累计进入 " + c.markets + " 个市场");
    tlCum.innerHTML = "已进驻市场门店 <b>" + fmt(c.stores) + "</b> 家";
  }
  function onYearChange() {
    viewYear = Number(tlSlider.value);
    applyFilter(); updateTimelineUI();
  }
  tlSlider.addEventListener("input", onYearChange);
  function stopPlay() { playing = false; if (playTimer) clearInterval(playTimer); playTimer = null; tlPlay.classList.remove("playing"); tlPlay.textContent = "▶"; }
  function startPlay() {
    if (viewYear >= 2026) { viewYear = 1927; tlSlider.value = 1927; onYearChange(); }
    playing = true; tlPlay.classList.add("playing"); tlPlay.textContent = "⏸";
    playTimer = setInterval(function () {
      if (viewYear >= 2026) { stopPlay(); return; }
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
    map.addLayer({
      id: "stores-halo", type: "circle", source: "stores",
      filter: ["==", ["get", "exited"], false],
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 1.5, 14, 3, 20, 6, 32, 10, 46],
        "circle-color": colorStops(), "circle-opacity": 0.16, "circle-blur": 0.7
      }
    });
    map.addLayer({
      id: "stores-circle", type: "circle", source: "stores",
      filter: ["==", ["get", "exited"], false],
      paint: {
        "circle-radius": countRadiusExpr(),
        "circle-color": colorStops(),
        "circle-stroke-width": ["case", ["boolean", ["feature-state", "hover"], false], 2.5, 1.2],
        "circle-stroke-color": "#0b1220",
        "circle-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.92],
        "circle-stroke-opacity": 1
      }
    });
    // 7-Eleven 已退出印尼（2017）、印度、以色列（2024）等市场，本图仅呈现当前在营市场（保留空心点图层备用）
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
