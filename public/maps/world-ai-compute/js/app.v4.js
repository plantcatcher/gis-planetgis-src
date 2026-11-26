/* 全球 AI 算力地图 · 互动逻辑
   算力枢纽级环形节点：半径/颜色 = 公开披露 IT 容量（MW）；无容量披露者用等大节点。
   国家密度面按各国设施数着色，随时间轴年份重算；时间轴按启用/宣布年份回放。
   只收官方公布或权威媒体报道项目。坐标 WGS84 城市代表点，非门址。
   合规：国界数据沿用本站统一底图（台湾已并入中国）。 */
(function () {
  "use strict";

  // 紫色冰晶渐层：低容量淡紫 → 高容量冷白，与国家密度面深浅紫分工
  var STOPS = [
    [0, "#7c5fc7"], [50, "#8b6fd6"], [100, "#a78bfa"],
    [200, "#c4b5fd"], [400, "#ddd6fe"], [800, "#ede9fe"], [1500, "#ffffff"]
  ];
  var CORE_STOPS = [
    [0, "#a78bfa"], [50, "#b69cf5"], [100, "#c9b6f8"],
    [200, "#ddd0fb"], [400, "#ebe5fd"], [800, "#f5f2ff"], [1500, "#ffffff"]
  ];
  function stopExpr(stops) {
    var out = ["interpolate", ["linear"], ["coalesce", ["get", "count"], 0]];
    for (var i = 0; i < stops.length; i++) { out.push(stops[i][0], stops[i][1]); }
    return out;
  }
  function colorStops() { return stopExpr(STOPS); }
  function coreColorStops() { return stopExpr(CORE_STOPS); }

  /* 半径按 sqrt(容量) 分段，让圆面积近似正比于容量。
     zoom 必须是顶层 interpolate 的输入，故每层各写一套数值。 */
  var SQ = [1, 7.07, 10, 14.14, 20, 28.28, 38.73]; // sqrt(0/50/100/200/400/800/1500)，1 防 0
  function radiusExpr(rows) {
    var byCount = function (r) {
      return ["interpolate", ["linear"], ["sqrt", ["coalesce", ["get", "count"], 0]],
        SQ[0], r[0], SQ[1], r[1], SQ[2], r[2],
        SQ[3], r[3], SQ[4], r[4], SQ[5], r[5], SQ[6], r[6]];
    };
    return ["interpolate", ["linear"], ["zoom"],
      0, byCount(rows[0]), 1.5, byCount(rows[1]), 3, byCount(rows[2]),
      5, byCount(rows[3]), 8, byCount(rows[4])];
  }
  var RING_ROWS = [
    [1.6, 3.2, 5.0, 6.8, 8.8, 10.8, 13.0],
    [3.0, 5.4, 8.0, 10.6, 13.4, 16.2, 19.5],
    [4.2, 7.2, 10.5, 14.0, 17.6, 21.5, 26.0],
    [5.6, 9.2, 13.4, 17.8, 22.4, 27.2, 33.5],
    [8.0, 12.4, 17.6, 23.0, 28.8, 35.0, 42.5]
  ];
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

  var isMobile = window.innerWidth <= 760;
  var INIT_ZOOM = isMobile ? 0.15 : 1.5;
  var MIN_ZOOM = isMobile ? 0 : 1.5;
  var ESRI_IMG = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  var ESRI_RELIEF = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}";

  var mapStyle = {
    version: 8,
    sources: {
      esri_img:    { type: "raster", tiles: [ESRI_IMG], tileSize: 256, attribution: "Esri World Imagery" },
      esri_relief: { type: "raster", tiles: [ESRI_RELIEF], tileSize: 256, attribution: "Esri World Shaded Relief" },
      countries:   { type: "geojson", data: "data/country-fills.geojson" },
      stores:      { type: "geojson", data: "data/stores.geojson", promoteId: "id" }
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#0b1020" } },
      { id: "esri-img", type: "raster", source: "esri_img", layout: { visibility: "none" },
        paint: { "raster-opacity": 0.9, "raster-brightness-max": 0.62, "raster-saturation": -0.45 } },
      { id: "esri-relief", type: "raster", source: "esri_relief", layout: { visibility: "none" },
        paint: { "raster-opacity": 0.85 } },
      {
        id: "country-fill", type: "fill", source: "countries",
        paint: {
          "fill-color": ["interpolate", ["linear"], ["coalesce", ["get", "aiCount"], 0],
            0, "#0a1020", 1, "#11162c", 2, "#181c3d", 4, "#202455", 8, "#2a2f70", 15, "#353b8c"],
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 1.5, 0.92, 4.5, 0.46, 7.0, 0]
        }
      },
      { id: "country-line", type: "line", source: "countries",
        paint: { "line-color": "#7f95ad", "line-width": 0.6, "line-opacity": 0.5 } }
    ]
  };

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
  var allStores = [], markets = [], meta = {}, marketById = {}, continentCount = {};
  var countryRaw = null;
  var viewYear = 2026;
  var labelOn = true;
  var popup = null, popupId = null, pinned = false, rafPending = false;

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
    var rows = "";
    rows += row("运营方", esc(p.operator));
    rows += row("所在地", esc(p.country) + (p.city ? " · " + esc(p.city) : ""));
    if (p.type) rows += row("类型", p.type === "ai-cluster" ? "AI 智算 / 超算中心" : "超大规模数据中心");
    rows += row("公开容量", c > 0 ? fmt(c) + " MW（园区电力/规划口径）" : "未披露");
    var y = p.yearUnknown ? "未披露（截至 2026 运营中）" : (p.enterYear ? p.enterYear + " 年" : "未披露");
    if (p.yearType === "announced") y += "（宣布）";
    rows += row("年份", y);
    if (p.note) rows += row("备注", esc(p.note));
    rows += row("来源", esc(p.source || "见项目页面"));
    return '<div class="pop" style="--c:' + col + '">' +
      "<h3>" + esc(p.name) + '<span class="era-tag" style="background:' + col + ';color:#0b1020">' +
      (c > 0 ? fmt(c) + " MW" : "容量未披露") + "</span></h3>" +
      '<table class="kv">' + rows + "</table>" +
      '<div class="note">点位为城市代表坐标，非门址。容量多为媒体或第三方披露的园区电力/规划规模，非官方 IT 负载；各条备注给出具体口径。未披露者不估算。国界数据已将台湾并入中国。</div>' +
      "</div>";
  }

  function fullProps(m) {
    return { id: m.id, name: m.name, operator: m.operator, city: m.city, country: m.country,
      count: m.count, enterYear: m.enterYear, yearUnknown: m.yearUnknown,
      yearType: m.yearType, type: m.type, source: m.source, note: m.note };
  }

  function showPopup(props, lngLat) {
    if (!lngLat || !isFinite(lngLat[0]) || !isFinite(lngLat[1])) lngLat = map.getCenter().toArray();
    if (popup && popupId === props.id) { popup.setLngLat(lngLat); return; }
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ offset: 12, closeButton: true, closeOnClick: false, className: "mcd-popup", maxWidth: "350px" })
      .setLngLat(lngLat).setHTML(storePopupHTML(props)).addTo(map);
    popup.on("close", function () { popup = null; popupId = null; pinned = false; });
    popupId = props.id;
  }
  function removePopup() { if (popup) popup.remove(); popup = null; popupId = null; pinned = false; }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && popup && pinned) removePopup(); });

  function bindStoreEvents() {
    var hovered = null;
    map.on("mousemove", function (e) {
      var fs = map.queryRenderedFeatures(e.point, { layers: ["stores-glow", "stores-ring", "stores-core"] });
      if (fs.length) {
        map.getCanvas().style.cursor = "pointer";
        var f = fs[0];
        if (hovered !== f.properties.id) {
          if (hovered != null) { try { map.setFeatureState({ source: "stores", id: hovered }, { hover: false }); } catch (err) {} }
          hovered = f.properties.id;
          map.setFeatureState({ source: "stores", id: hovered }, { hover: true });
        }
        if (!pinned) showPopup(f.properties, e.lngLat);
      } else {
        map.getCanvas().style.cursor = "";
        if (hovered != null) { try { map.setFeatureState({ source: "stores", id: hovered }, { hover: false }); } catch (err) {} hovered = null; }
        if (!pinned) removePopup();
      }
    });
    map.on("click", function (e) {
      var fs = map.queryRenderedFeatures(e.point, { layers: ["stores-glow", "stores-ring", "stores-core"] });
      if (fs.length) {
        var f = fs[0];
        showPopup(f.properties, e.lngLat); pinned = true;
      } else removePopup();
    });
  }

  // ---------- 标注（全球 ±360 世界副本投影 + 碰撞网格） ----------
  var LBL_MIN_DIST = isMobile ? 58 : 84;
  function updateLabels() {
    if (!labelOn) { labelsEl.innerHTML = ""; return; }
    var z = map.getZoom(), w = map.getCanvas().clientWidth, h = map.getCanvas().clientHeight;
    var leftEdge = w > 760 ? 320 : 40;
    var cands = [];
    for (var i = 0; i < markets.length; i++) {
      var c = markets[i];
      if (c.enterYear > viewYear) continue;
      var need = c.count >= 50 ? 1.5 : c.count > 0 ? 2.2 : 3.4;
      if (isMobile) need -= 1.4;
      if (z < need) continue;
      for (var k = -1; k <= 1; k++) {
        var p = map.project([c.lng + k * 360, c.lat]);
        if (p.x < leftEdge || p.x > w - 50 || p.y < 30 || p.y > h - 30) continue;
        cands.push({ c: c, x: p.x, y: p.y });
      }
    }
    cands.sort(function (a, b) { return b.c.count - a.c.count || a.c.name.localeCompare(b.c.name, "zh"); });
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
      html += '<div class="city-lbl" data-id="' + esc(t.c.id) + '" style="left:' + lx + "px;top:" + t.y + 'px">' +
        esc(t.c.name) + '<span class="cc">' + (t.c.count > 0 ? fmt(t.c.count) : "—") + "</span></div>";
      n++;
    }
    labelsEl.innerHTML = html;
    var els = labelsEl.querySelectorAll(".city-lbl");
    for (var m = 0; m < els.length; m++) {
      els[m].addEventListener("click", function () { focusMarket(this.getAttribute("data-id"), null); });
    }
  }
  function requestLabelUpdate() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () { rafPending = false; updateLabels(); });
  }

  // ---------- 左侧目录 ----------
  function updateStats() {
    document.getElementById("stat-stores").textContent = markets.length;
    document.getElementById("stat-cities").textContent = Object.keys(meta.countryCount || {}).length;
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
    var list = document.getElementById("city-list"), kw = searchKw.toLowerCase();
    var items = markets.filter(function (c) {
      if (contFilter !== "all" && c.continent !== contFilter) return false;
      if (!kw) return true;
      return (c.name + " " + c.operator + " " + c.country + " " + c.city).toLowerCase().indexOf(kw) >= 0;
    });
    items.sort(function (a, b) { return (b.count - a.count) || (a.enterYear - b.enterYear); });
    if (!items.length) list.innerHTML = '<div class="list-empty">没有匹配的设施</div>';
    else {
      list.innerHTML = items.map(function (c) {
        var num = c.count > 0 ? fmt(c.count) + " MW" : "容量未披露";
        var meta2 = c.continent + " · " + (c.yearUnknown ? "年份未披露" : c.enterYear) + (c.yearType === "announced" ? " 宣布" : "");
        return '<button class="city-item" data-id="' + esc(c.id) + '">' +
          '<div class="ci-top"><span class="ci-name">' + esc(c.name) + "</span>" +
          '<span class="ci-count">' + num + "</span></div>" +
          '<div class="ci-meta">' + esc(c.operator) + " · " + esc(meta2) + "</div></button>";
      }).join("");
    }
    var btns = list.querySelectorAll(".city-item");
    for (var i = 0; i < btns.length; i++) btns[i].addEventListener("click", function () { focusMarket(this.dataset.id, this); });
    document.getElementById("list-count").textContent = "共 " + items.length + " 处设施 · 容量未披露者不估算";
  }

  function focusMarket(id, btn) {
    var c = marketById[id];
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
    map.flyTo({ center: [c.lng, c.lat], zoom: Math.max(map.getZoom(), 4.2), speed: 1.2, curve: 1.4 });
    map.once("moveend", function () { showPopup(fullProps(c), [c.lng, c.lat]); pinned = true; });
  }

  // ---------- 时间轴过滤：节点、标注、国家密度面同步 ----------
  function updateCountryFills() {
    if (!countryRaw || !map.getSource("countries")) return;
    var agg = {};
    for (var i = 0; i < markets.length; i++) {
      var m = markets[i];
      if (m.enterYear > viewYear) continue;
      agg[m.countryIso] = (agg[m.countryIso] || 0) + 1;
    }
    for (var j = 0; j < countryRaw.features.length; j++) {
      var p = countryRaw.features[j].properties;
      p.aiCount = (p.aiIso && agg[p.aiIso]) ? agg[p.aiIso] : 0;
    }
    map.getSource("countries").setData(countryRaw);
  }
  function applyFilter() {
    var f = ["<=", ["get", "enterYear"], viewYear];
    ["stores-glow", "stores-ring", "stores-core"].forEach(function (id) {
      if (map.getLayer(id)) map.setFilter(id, f);
    });
    updateCountryFills();
    requestLabelUpdate();
  }
  function cumulative() {
    var n = 0;
    for (var i = 0; i < markets.length; i++) if (markets[i].enterYear <= viewYear) n++;
    return n;
  }

  // ---------- 搜索 ----------
  var searchInput = document.getElementById("search"), searchResult = document.getElementById("searchResult");
  function renderSearch(q) {
    if (!q) { searchResult.innerHTML = ""; searchResult.classList.remove("has-hits"); return; }
    var hits = markets.filter(function (c) {
      return (c.name + " " + c.operator + " " + c.country + " " + c.city).indexOf(q) >= 0;
    }).slice(0, 20);
    if (!hits.length) { searchResult.innerHTML = '<li class="empty">无匹配设施</li>'; searchResult.classList.add("has-hits"); return; }
    searchResult.innerHTML = hits.map(function (c) {
      return '<li data-id="' + esc(c.id) + '"><span>' + esc(c.name) + "</span>" +
        '<span class="tag">' + esc(c.operator) + "</span></li>";
    }).join("");
    searchResult.classList.add("has-hits");
  }
  searchInput.addEventListener("input", function () { searchKw = this.value.trim(); renderSearch(searchKw); buildMarketList(); });
  searchResult.addEventListener("click", function (e) {
    var li = e.target.closest("li"); if (!li || !li.dataset.id) return;
    var id = li.dataset.id, c = marketById[id];
    searchResult.innerHTML = ""; searchResult.classList.remove("has-hits"); searchInput.value = ""; searchKw = "";
    buildMarketList();
    if (!c) return;
    map.flyTo({ center: [c.lng, c.lat], zoom: 4.6, speed: 1.2 });
    map.once("moveend", function () { showPopup(fullProps(c), [c.lng, c.lat]); pinned = true; });
  });

  // ---------- 底图与叠加 ----------
  var optsBtn = document.getElementById("map-opts-btn"), optsPanel = document.getElementById("map-opts");
  optsBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = optsPanel.classList.toggle("open");
    this.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", function (e) {
    if (optsPanel.classList.contains("open") && !optsPanel.contains(e.target)) {
      optsPanel.classList.remove("open"); optsBtn.setAttribute("aria-expanded", "false");
    }
  });
  function setVis(id, on) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); }
  function setBasemap(mode) {
    setVis("esri-img", mode === "img"); setVis("esri-relief", mode === "vec");
    var opts = document.querySelectorAll(".bm-opt");
    for (var i = 0; i < opts.length; i++) { var r = opts[i].querySelector("input"); if (r) opts[i].classList.toggle("active", r.checked); }
  }
  var bmRadios = document.querySelectorAll('input[name="basemap"]');
  for (var bi = 0; bi < bmRadios.length; bi++) bmRadios[bi].addEventListener("change", function () { setBasemap(this.value); });
  setBasemap("none");
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
    contSel.innerHTML = '<option value="all">全部大洲（' + names.length + "）</option>" +
      names.map(function (n) { return '<option value="' + esc(n) + '">' + esc(n) + "（" + continentCount[n] + "）</option>"; }).join("");
    contSel.addEventListener("change", function () { contFilter = this.value; buildMarketList(); });
  }

  // ---------- 目录开合 ----------
  var sidePanel = document.getElementById("side-panel"), drawerHandle = document.getElementById("drawer-handle");
  if (window.matchMedia("(max-width: 760px)").matches) {
    sidePanel.classList.add("collapsed"); drawerHandle.setAttribute("aria-expanded", "false");
  }
  drawerHandle.addEventListener("click", function () {
    var c = sidePanel.classList.toggle("collapsed");
    this.setAttribute("aria-expanded", String(!c));
  });
  document.getElementById("panel-close").addEventListener("click", function () {
    sidePanel.classList.add("collapsed");
    document.getElementById("panel-open").setAttribute("aria-expanded", "false");
  });
  document.getElementById("panel-open").addEventListener("click", function () {
    sidePanel.classList.remove("collapsed"); this.setAttribute("aria-expanded", "true");
  });

  // ---------- 时间轴 ----------
  var tlSlider = document.getElementById("tl-slider"), tlYear = document.getElementById("tl-year");
  var tlCum = document.getElementById("tl-cum"), tlPlay = document.getElementById("tl-play");
  var playing = false, playTimer = null;
  function setYear(y) {
    viewYear = y; tlSlider.value = y;
    applyFilter(); updateTimelineUI();
  }
  function updateTimelineUI() {
    tlYear.textContent = viewYear + " 年";
    tlCum.innerHTML = "累计 <b>" + cumulative() + "</b> 处设施";
  }
  function onYearChange() { setYear(Number(tlSlider.value)); }
  tlSlider.addEventListener("input", onYearChange);
  function stopPlay() {
    playing = false; if (playTimer) clearInterval(playTimer); playTimer = null;
    tlPlay.classList.remove("playing"); tlPlay.textContent = "▶";
  }
  function startPlay() {
    if (viewYear >= (meta.yearMax || 2026)) setYear(meta.yearMin || 2010);
    playing = true; tlPlay.classList.add("playing"); tlPlay.textContent = "⏸";
    playTimer = setInterval(function () {
      if (viewYear >= (meta.yearMax || 2026)) { stopPlay(); return; }
      setYear(viewYear + 1);
    }, 300);
  }
  tlPlay.addEventListener("click", function () { if (playing) stopPlay(); else startPlay(); });

  // ---------- 启动 ----------
  function refreshUI() {
    if (!markets.length) return;
    updateStats(); buildLegend(); buildContSelect(); buildMarketList(); updateLabels(); updateTimelineUI();
    tlSlider.min = meta.yearMin; tlSlider.max = meta.yearMax;
    if (countryRaw) applyFilter();
  }
  map.on("load", function () {
    bindStoreEvents();
    var RING = radiusExpr(RING_ROWS), CORE = radiusExpr(CORE_ROWS);
    var GLOW = radiusExpr(scaleRows(RING_ROWS, 1.85));
    map.addLayer({
      id: "stores-glow", type: "circle", source: "stores",
      paint: { "circle-radius": GLOW, "circle-color": colorStops(), "circle-opacity": 0.17, "circle-blur": 1 }
    });
    map.addLayer({
      id: "stores-ring", type: "circle", source: "stores",
      paint: {
        "circle-radius": RING, "circle-color": "rgba(0,0,0,0)",
        "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 0, 1.4, 1.5, 2.2, 3, 2.6, 5, 3.0, 8, 3.4],
        "circle-stroke-color": ["case", ["boolean", ["feature-state", "hover"], false], "#ffffff", colorStops()],
        "circle-stroke-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.92]
      }
    });
    map.addLayer({
      id: "stores-core", type: "circle", source: "stores",
      paint: {
        "circle-radius": CORE, "circle-color": coreColorStops(),
        "circle-stroke-width": 0.7, "circle-stroke-color": "rgba(7,14,30,0.85)", "circle-opacity": 1
      }
    });
    applyFilter();
  });
  fetch("data/stores.geojson").then(function (r) { return r.json(); }).then(function (fc) {
    allStores = fc.features;
  }).catch(function (e) { console.error("stores.geojson 加载失败", e); });
  fetch("data/markets.json").then(function (r) { return r.json(); }).then(function (d) {
    markets = d.markets; meta = d.meta; continentCount = d.continentCount || {};
    for (var i = 0; i < markets.length; i++) marketById[markets[i].id] = markets[i];
    refreshUI();
  }).catch(function (e) { console.error("markets.json 加载失败", e); });
  fetch("data/country-fills.geojson").then(function (r) { return r.json(); }).then(function (geo) {
    countryRaw = geo; updateCountryFills();
  }).catch(function (e) { console.error("country-fills.geojson 加载失败", e); });
  map.on("move", requestLabelUpdate);
  map.on("zoom", requestLabelUpdate);
})();
