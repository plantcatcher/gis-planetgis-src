/* 世界杯历届冠军与参赛版图 · 互动逻辑
   数据：Wikipedia《FIFA World Cup》历届四强表 +《National team appearances in the FIFA World Cup》逐队参赛表，
   已回填 2026 届（西班牙 1-0 加时胜阿根廷）。逐队参赛次数与维基原表末列 84/84 核对一致。
   口径：参赛按球队计（英格兰等四队独立）；国界版图按国家/地区聚合，台湾并入中国。 */
(function () {
  "use strict";

  // 累计参赛次数：深蓝（未曾参赛）→ 青蓝 → 青绿 → 金黄（常客）
  var APP_STOPS = [
    [0, "#101c30"], [1, "#173a56"], [3, "#1b5d7a"], [6, "#2296a6"],
    [10, "#3bb4a2"], [15, "#d8b35a"], [20, "#e8872f"]
  ];
  // 累计夺冠次数：金色调阶梯
  var TITLE_STOPS = [
    [0, "#101c30"], [1, "#8a6b16"], [2, "#c99720"], [3, "#e8b84b"], [4, "#ffd76a"]
  ];

  function stopsExpr(stops, field) {
    var out = ["interpolate", ["linear"], ["coalesce", ["get", field], 0]];
    for (var i = 0; i < stops.length; i++) out.push(stops[i][0], stops[i][1]);
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
      esri_img: { type: "raster", tiles: [ESRI_IMG], tileSize: 256, attribution: "Esri World Imagery" },
      esri_relief: { type: "raster", tiles: [ESRI_RELIEF], tileSize: 256, attribution: "Esri World Shaded Relief" },
      countries: { type: "geojson", data: "data/country-fills.geojson" },
      stores: { type: "geojson", data: "data/stores.geojson", promoteId: "id" }
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#0b1220" } },
      { id: "esri-img", type: "raster", source: "esri_img", layout: { visibility: "none" },
        paint: { "raster-opacity": 0.86, "raster-brightness-max": 0.6, "raster-saturation": -0.5 } },
      { id: "esri-relief", type: "raster", source: "esri_relief", layout: { visibility: "none" },
        paint: { "raster-opacity": 0.85 } },
      { id: "country-fill", type: "fill", source: "countries",
        paint: {
          "fill-color": stopsExpr(APP_STOPS, "wcCount"),
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 1.5, 0.76, 4.5, 0.44, 7.0, 0]
        } },
      { id: "country-champion-fill", type: "fill", source: "countries",
        filter: ["==", ["get", "wcChampion"], 1],
        paint: { "fill-color": "#e8b84b",
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 1.5, 0.42, 5, 0.3, 7, 0] } },
      { id: "country-line", type: "line", source: "countries",
        paint: { "line-color": "#7f95ad", "line-width": 0.6, "line-opacity": 0.5 } },
      { id: "country-champion-line", type: "line", source: "countries",
        filter: ["==", ["get", "wcChampion"], 1],
        paint: { "line-color": "#ffd76a", "line-width": 1.5, "line-opacity": 0.95 } }
    ]
  };

  var map = new maplibregl.Map({
    container: "map", style: mapStyle,
    center: isMobile ? [20, 25] : [-8, 25],
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
  var teams = [], editions = [], byCode = {}, byIso = {}, aggByIso = {};
  var allStores = [], storesFC = null, countryRaw = null;
  var viewIdx = 22, mode = "apps", contFilter = "all", searchKw = "";
  var labelOn = true, rafPending = false;
  var popup = null, popupId = null, pinned = false;
  var playing = false, playTimer = null;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function row(k, v) { if (v === "" || v == null) return ""; return '<tr><td class="k">' + k + "</td><td>" + v + "</td></tr>"; }
  function year() { return editions.length ? editions[viewIdx].year : 2026; }
  function currentEdition() { return editions[viewIdx] || {}; }
  function teamOf(code) { return byCode[code] || null; }
  function champTeam() { return teamOf(currentEdition().champion); }
  function champIso() { var t = champTeam(); return t ? t.iso : ""; }

  function buildIndex() {
    byCode = {}; byIso = {}; aggByIso = {};
    for (var i = 0; i < teams.length; i++) {
      var t = teams[i];
      byCode[t.fifa3] = t;
      (byIso[t.iso] || (byIso[t.iso] = [])).push(t);
      var a = aggByIso[t.iso] || (aggByIso[t.iso] = { years: {}, titleYears: [], teams: [] });
      for (var j = 0; j < t.years.length; j++) a.years[t.years[j]] = 1;
      for (var k = 0; k < t.titleYears.length; k++) a.titleYears.push(t.titleYears[k]);
      a.teams.push(t);
    }
  }
  function aggYearsUpTo(iso, y) {
    var a = aggByIso[iso]; if (!a) return 0;
    var n = 0;
    for (var k in a.years) if (Number(k) <= y) n++;
    return n;
  }
  function aggTitlesUpTo(iso, y) {
    var a = aggByIso[iso]; if (!a) return 0;
    var n = 0;
    for (var i = 0; i < a.titleYears.length; i++) if (a.titleYears[i] <= y) n++;
    return n;
  }

  // ---------- 详情卡 ----------
  function teamPopupHTML(t) {
    var y = year();
    var apps = 0;
    for (var i = 0; i < t.years.length; i++) if (t.years[i] <= y) apps++;
    var titles = 0, titleTxt = [];
    for (var a = 0; a < t.titleYears.length; a++) {
      if (t.titleYears[a] <= y) { titles++; titleTxt.push(t.titleYears[a]); }
    }
    var col = titles ? "#e8b84b" : "#38bdf8";
    var rows = "";
    rows += row("大　洲", esc(t.continent));
    rows += row("参赛次数", apps + " 次" + (t.apps === 23 ? "（全勤）" : ""));
    rows += row("最好成绩", esc(t.best) + (titles ? " ★".repeat(Math.min(titles, 5)) : ""));
    if (titleTxt.length) rows += row("夺冠年份", titleTxt.join("、"));
    if (t.runnerUpYears.length) rows += row("亚军年份", t.runnerUpYears.join("、"));
    if (t.thirds) rows += row("季军 / 殿军", t.thirds + " / " + t.fourths + " 次");
    if (t.hostYears.length) rows += row("主办年份", t.hostYears.join("、"));
    var cells = "";
    for (var e = 0; e < editions.length; e++) {
      var ey = editions[e].year;
      var on = t.years.indexOf(ey) >= 0;
      var win = t.titleYears.indexOf(ey) >= 0;
      var cls = "yr-cell" + (on ? " on" : "") + (win ? " win" : "") + (e === viewIdx ? " now" : "");
      cells += '<button class="' + cls + '" data-idx="' + e + '" title="' + ey + ' 年"></button>';
    }
    var tag = titles ? '<span class="era-tag gold">' + titles + " 冠</span>"
                     : '<span class="era-tag" style="background:#1e4e63;color:#a5e9ff">' + apps + " 次参赛</span>";
    return '<div class="pop" style="--c:' + col + '">' +
      "<h3>" + esc(t.name) + " <span style='font-size:11px;color:var(--text-muted)'>" + esc(t.nameEn) + "</span> " + tag + "</h3>" +
      '<table class="kv">' + rows + "</table>" +
      '<div class="yr-strip">' + cells + '<div class="yr-cap">共 23 届：亮色为参赛，金色为夺冠，白框为当前届。点击色块跳转届次。</div></div>' +
      '<div class="note">参赛按球队计；英格兰、苏格兰、威尔士、北爱尔兰为四支独立球队，国界版图合并计入英国。西德并入德国、苏联并入俄罗斯、捷克斯洛伐克并入捷克、南斯拉夫并入塞尔维亚。国界数据已将台湾并入中国。</div>' +
      "</div>";
  }

  function validLngLat(v) {
    if (!v) return null;
    if (Array.isArray(v) && v.length >= 2 && isFinite(v[0]) && isFinite(v[1])) return { lng: v[0], lat: v[1] };
    return (isFinite(v.lng) && isFinite(v.lat)) ? v : null;
  }
  function showPopup(t, lngLat, html) {
    var ll = validLngLat(lngLat);
    if (!ll) ll = map.getCenter();
    if (popup && popupId === t.fifa3) { popup.setLngLat(ll); return; }
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ offset: 12, closeButton: true, closeOnClick: false,
      className: "wc-popup", maxWidth: "330px" })
      .setLngLat(ll).setHTML(html || teamPopupHTML(t)).addTo(map);
    popup.on("close", function () { popup = null; popupId = null; pinned = false; });
    bindYearCells();
    popupId = t.fifa3;
  }
  function bindYearCells() {
    if (!popup) return;
    var cells = popup.getElement().querySelectorAll(".yr-cell");
    for (var i = 0; i < cells.length; i++) {
      cells[i].addEventListener("click", function () {
        viewIdx = Number(this.getAttribute("data-idx"));
        applyFilter(); updateTimelineUI();
        if (popupId && byCode[popupId]) {
          var t = byCode[popupId];
          popup.setHTML(teamPopupHTML(t));
          bindYearCells();
        }
      });
    }
  }
  function removePopup() { if (popup) popup.remove(); popup = null; popupId = null; pinned = false; }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && popup && pinned) removePopup(); });

  // ---------- 点交互 ----------
  function bindStoreEvents() {
    var hovered = null;
    map.on("mousemove", function (e) {
      var fs = map.queryRenderedFeatures(e.point, { layers: ["stores-circle"] });
      if (fs.length) {
        map.getCanvas().style.cursor = "pointer";
        var f = fs[0], id = f.properties.id;
        if (hovered !== id) {
          if (hovered != null) map.setFeatureState({ source: "stores", id: hovered }, { hover: false });
          hovered = id;
          map.setFeatureState({ source: "stores", id: hovered }, { hover: true });
        }
        if (!pinned) showPopup(byCode[id], e.lngLat);
      } else {
        map.getCanvas().style.cursor = "";
        if (hovered != null) { map.setFeatureState({ source: "stores", id: hovered }, { hover: false }); hovered = null; }
        if (!pinned) removePopup();
      }
    });
    map.on("click", function (e) {
      var fs = map.queryRenderedFeatures(e.point, { layers: ["stores-circle"] });
      if (fs.length) {
        var id = fs[0].properties.id;
        if (hovered != null && hovered !== id) map.setFeatureState({ source: "stores", id: hovered }, { hover: false });
        hovered = id;
        map.setFeatureState({ source: "stores", id: hovered }, { hover: true });
        showPopup(byCode[id], e.lngLat); pinned = true;
      } else removePopup();
    });
  }

  // ---------- 球队标注 ----------
  var LBL_MIN_DIST = isMobile ? 58 : 82;
  function updateLabels() {
    if (!labelOn) { labelsEl.innerHTML = ""; return; }
    var z = map.getZoom();
    var w = map.getCanvas().clientWidth, h = map.getCanvas().clientHeight;
    var leftEdge = w > 760 ? 320 : 40;
    var cands = [];
    for (var i = 0; i < teams.length; i++) {
      var t = teams[i];
      var have = 0;
      for (var q = 0; q < t.years.length; q++) if (t.years[q] <= year()) have++;
      if (!have) continue;
      if (mode === "current" && t.years.indexOf(year()) < 0) continue;
      var need = t.titles >= 2 ? 1.5 : t.titles === 1 ? 2.1 : t.apps >= 12 ? 2.8 : t.apps >= 6 ? 3.6 : 4.6;
      if (isMobile) need -= 1.4;
      if (z < need) continue;
      for (var k = -1; k <= 1; k++) {
        var p = map.project([t.lng + k * 360, t.lat]);
        if (p.x < leftEdge || p.x > w - 60 || p.y < 80 || p.y > h - 46) continue;
        cands.push({ t: t, x: p.x, y: p.y });
      }
    }
    cands.sort(function (a, b) { return (b.t.titles - a.t.titles) || (b.t.apps - a.t.apps); });
    var html = "", grid = {}, n = 0, MAX = isMobile ? 14 : 42;
    for (var c = 0; c < cands.length && n < MAX; c++) {
      var it = cands[c];
      var lx = (it.x - 46 < leftEdge) ? it.x + 46 : it.x;
      var gx = Math.floor(lx / LBL_MIN_DIST), gy = Math.floor(it.y / LBL_MIN_DIST), hit = false;
      for (var ax = gx - 1; ax <= gx + 1 && !hit; ax++)
        for (var ay = gy - 1; ay <= gy + 1 && !hit; ay++) {
          var bucket = grid[ax + "," + ay];
          if (!bucket) continue;
          for (var bi = 0; bi < bucket.length; bi++) {
            var o = bucket[bi], ddx = o[0] - lx, ddy = o[1] - it.y;
            if (ddx * ddx + ddy * ddy < LBL_MIN_DIST * LBL_MIN_DIST) { hit = true; break; }
          }
        }
      if (hit) continue;
      (grid[gx + "," + gy] || (grid[gx + "," + gy] = [])).push([lx, it.y]);
      var stars = it.t.titles ? '<span class="star">' + "★".repeat(Math.min(it.t.titles, 5)) + "</span>" : "";
      html += '<div class="city-lbl" data-code="' + esc(it.t.fifa3) + '" style="left:' + lx + "px;top:" + it.y + 'px">' +
        esc(it.t.name) + stars + "</div>";
      n++;
    }
    labelsEl.innerHTML = html;
    var els = labelsEl.querySelectorAll(".city-lbl");
    for (var m = 0; m < els.length; m++) {
      els[m].addEventListener("click", function () { focusTeam(this.getAttribute("data-code"), null); });
    }
  }
  function requestLabelUpdate() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () { rafPending = false; updateLabels(); });
  }

  // ---------- 左侧目录 ----------
  function updateStats() {
    document.getElementById("stat-teams").textContent = teams.length;
    document.getElementById("stat-champs").textContent = teams.filter(function (t) { return t.titles > 0; }).length;
    document.getElementById("stat-editions").textContent = editions.length;
  }
  function buildLegend() {
    var el = document.getElementById("era-filter");
    if (mode === "current") {
      el.innerHTML = '<span class="lg-item"><i style="background:#101c30"></i>未参赛</span>' +
        '<span class="lg-item"><i style="background:#1c6f8c"></i>本届参赛</span>' +
        '<span class="lg-item"><i style="background:#e8b84b"></i>本届冠军</span>';
      return;
    }
    var stops = mode === "titles" ? TITLE_STOPS : APP_STOPS;
    el.innerHTML = stops.map(function (s, i) {
      var label = i === 0 ? "0" : (i === stops.length - 1 ? "≥" + s[0] : String(s[0]));
      return '<span class="lg-item"><i style="background:' + s[1] + '"></i>' + label + "</span>";
    }).join("");
  }
  function teamUpTo(t, y) {
    var n = 0;
    for (var i = 0; i < t.years.length; i++) if (t.years[i] <= y) n++;
    return n;
  }
  var searchKw2 = "";
  function buildTeamList() {
    var list = document.getElementById("city-list");
    var kw = searchKw.toLowerCase();
    var y = year();
    var items = teams.filter(function (t) {
      if (contFilter !== "all" && t.continent !== contFilter) return false;
      if (mode === "current" && !t.years) return false;
      if (!kw) return true;
      return t.name.indexOf(kw) >= 0 || t.nameEn.toLowerCase().indexOf(kw) >= 0 ||
             t.fifa3.toLowerCase().indexOf(kw) >= 0 || t.iso.toLowerCase().indexOf(kw) >= 0;
    });
    items.sort(function (a, b) {
      if (mode === "titles") return b.titles - a.titles || b.apps - a.apps || a.name.localeCompare(b.name, "zh");
      if (mode === "current") {
        var ac = a.years.indexOf(y) >= 0 ? 1 : 0, bc = b.years.indexOf(y) >= 0 ? 1 : 0;
        return bc - ac || b.titles - a.titles || b.apps - a.apps;
      }
      return b.apps - a.apps || b.titles - a.titles || a.name.localeCompare(b.name, "zh");
    });
    if (!items.length) list.innerHTML = '<div class="list-empty">没有匹配的球队</div>';
    else {
      list.innerHTML = items.map(function (t) {
        var num = mode === "titles" ? (t.titles ? t.titles + " 冠" : "—") :
                  (mode === "current" ? (t.years.indexOf(y) >= 0 ? "本届" : "—") : teamUpTo(t, y) + " 次");
        var meta2 = t.continent + " · 参赛 " + teamUpTo(t, y) + " 次" +
          (t.titles ? " · " + t.titleYears.join("/") + " 夺冠" : "");
        var cls = "city-item" + (t.titles ? " is-champ" : "") + (t.years.indexOf(y) >= 0 ? " is-playing" : " is-out");
        return '<button class="' + cls + '" data-code="' + esc(t.fifa3) + '">' +
          '<div class="ci-top"><span class="ci-name">' + esc(t.name) + "</span>" +
          '<span class="ci-count">' + num + "</span></div>" +
          '<div class="ci-meta">' + esc(meta2) + "</div></button>";
      }).join("");
    }
    var btns = list.querySelectorAll(".city-item");
    for (var i = 0; i < btns.length; i++) btns[i].addEventListener("click", function () { focusTeam(this.dataset.code, this); });
    document.getElementById("list-count").textContent = "共 " + items.length + " 支球队 · 截至 " + y + " 年";
  }

  function focusTeam(code, btn) {
    var t = byCode[code]; if (!t) return;
    if (window.matchMedia("(max-width: 760px)").matches) {
      sidePanel.classList.add("collapsed");
      document.getElementById("panel-open").setAttribute("aria-expanded", "false");
    }
    if (btn) {
      var old = document.querySelectorAll(".city-item.is-selected");
      for (var k = 0; k < old.length; k++) old[k].classList.remove("is-selected");
      btn.classList.add("is-selected");
    }
    var z = t.titles >= 2 ? 3.4 : t.apps >= 10 ? 4.2 : 5.2;
    map.flyTo({ center: [t.lng, t.lat], zoom: z, speed: 1.2, curve: 1.4 });
    map.once("moveend", function () { showPopup(t, [t.lng, t.lat]); pinned = true; });
  }

  // ---------- 时间轴 + 版图重算 ----------
  function updateCountryFills() {
    if (!countryRaw || !map.getSource("countries")) return;
    var y = year(), ci = champIso(), f = countryRaw.features;
    for (var i = 0; i < f.length; i++) {
      var p = f[i].properties, iso = p.wcIso;
      p.wcCount = mode === "current" ? (aggByIso[iso] && aggByIso[iso].years[y] ? 1 : 0)
        : (mode === "titles" ? aggTitlesUpTo(iso, y) : aggYearsUpTo(iso, y));
      p.wcTitles = aggTitlesUpTo(iso, y);
      p.wcChampion = (iso && iso === ci) ? 1 : 0;
    }
    map.getSource("countries").setData(countryRaw);
  }
  function updateStoreData() {
    if (!storesFC || !map.getSource("stores")) return;
    var y = year();
    for (var i = 0; i < storesFC.features.length; i++) {
      var p = storesFC.features[i].properties;
      p.current = p.years.indexOf(y) >= 0 ? 1 : 0;
      p.titlesToDate = 0;
      for (var k = 0; k < p.titleYears.length; k++) if (p.titleYears[k] <= y) p.titlesToDate++;
    }
    map.getSource("stores").setData(storesFC);
  }
  function activeFilter() {
    if (mode === "current") {
      return ["all", ["==", ["get", "current"], 1], [">", ["get", "apps"], 0]];
    }
    return [">", ["get", "apps"], 0];
  }
  function setLayerPaint() {
    if (!map.getLayer("country-fill")) return;
    var color = mode === "current"
      ? ["case", ["==", ["get", "wcCount"], 1], "#1c6f8c", "#101c30"]
      : stopsExpr(mode === "titles" ? TITLE_STOPS : APP_STOPS, "wcCount");
    map.setPaintProperty("country-fill", "fill-color", color);
    if (map.getLayer("stores-circle")) {
      var pcolor = mode === "current"
        ? ["case", ["==", ["get", "current"], 1], "#2fa9c0", "#38506b"]
        : stopsExpr(mode === "titles" ? TITLE_STOPS : APP_STOPS, mode === "titles" ? "titlesToDate" : "apps");
      map.setPaintProperty("stores-circle", "circle-color", pcolor);
    }
  }
  function applyFilter() {
    if (map.getLayer("stores-circle")) map.setFilter("stores-circle", activeFilter());
    if (map.getLayer("stores-halo")) map.setFilter("stores-halo", activeFilter());
    updateCountryFills();
    updateStoreData();
    setLayerPaint();
    requestLabelUpdate();
  }

  function updateChampBanner() {
    var e = currentEdition(), t = champTeam();
    if (!e || !t) return;
    document.getElementById("cb-year").textContent = e.year;
    document.getElementById("cb-edition").textContent = viewIdx + 1;
    document.getElementById("cb-host").textContent = e.host || "—";
    var got = 0;
    for (var n = 0; n < t.titleYears.length; n++) if (t.titleYears[n] <= e.year) got++;
    document.getElementById("cb-champion").textContent = t.name + (got > 1 ? "（第 " + got + " 冠）" : "（首冠）");
    var runner = teamOf(e.runnerUp), third = teamOf(e.third);
    document.getElementById("cb-detail").textContent = "亚军 " + (runner ? runner.name : "—") +
      " · 季军 " + (third ? third.name : "—");
    document.getElementById("cb-apps").textContent = e.teams + " 队参赛";
  }
  function updateTimelineUI() {
    var e = currentEdition(), t = champTeam();
    if (!e) return;
    document.getElementById("tl-slider").value = viewIdx;
    document.getElementById("tl-year").textContent = e.year + " 年 · 第 " + (viewIdx + 1) + " 届" +
      (t ? " · " + t.name + "夺冠" : "");
    var came = 0;
    for (var i = 0; i < teams.length; i++) if (teams[i].years[0] <= e.year) came++;
    document.getElementById("tl-cum").innerHTML = "累计登场 <b>" + came + "</b> 支球队";
    updateChampBanner();
  }
  function onIdxChange() {
    viewIdx = Number(document.getElementById("tl-slider").value);
    applyFilter(); buildTeamList(); updateTimelineUI();
  }

  // ---------- 搜索 ----------
  var searchInput = document.getElementById("search");
  var searchResult = document.getElementById("searchResult");
  function renderSearch(q) {
    if (!q) { searchResult.innerHTML = ""; searchResult.classList.remove("has-hits"); return; }
    var lq = q.toLowerCase();
    var hits = teams.filter(function (t) {
      return t.name.indexOf(q) >= 0 || t.nameEn.toLowerCase().indexOf(lq) >= 0 ||
             t.fifa3.toLowerCase() === lq || t.iso.toLowerCase() === lq;
    }).slice(0, 20);
    if (!hits.length) { searchResult.innerHTML = '<li class="empty">无匹配球队</li>'; searchResult.classList.add("has-hits"); return; }
    searchResult.innerHTML = hits.map(function (t) {
      return '<li data-code="' + esc(t.fifa3) + '"><span>' + esc(t.name) + "</span>" +
        '<span class="tag">' + (t.titles ? t.titles + " 冠" : t.apps + " 次") + "</span></li>";
    }).join("");
    searchResult.classList.add("has-hits");
  }
  searchInput.addEventListener("input", function () {
    searchKw = this.value.trim(); searchKw2 = searchKw; renderSearch(searchKw); buildTeamList();
  });
  searchResult.addEventListener("click", function (e) {
    var li = e.target.closest("li"); if (!li || !li.dataset.code) return;
    var code = li.dataset.code;
    searchResult.innerHTML = ""; searchResult.classList.remove("has-hits"); searchInput.value = ""; searchKw = ""; searchKw2 = "";
    buildTeamList();
    focusTeam(code, null);
  });

  // ---------- 底图与叠加 ----------
  var optsBtn = document.getElementById("map-opts-btn"), optsPanel = document.getElementById("map-opts");
  function setOptsOpen(open) { optsPanel.classList.toggle("open", open); optsBtn.setAttribute("aria-expanded", String(open)); }
  optsBtn.addEventListener("click", function (e) { e.stopPropagation(); setOptsOpen(!optsPanel.classList.contains("open")); });
  document.addEventListener("click", function (e) { if (optsPanel.classList.contains("open") && !optsPanel.contains(e.target)) setOptsOpen(false); });
  function setVis(id, on) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); }
  function setBasemap(mode2) {
    setVis("esri-img", mode2 === "img"); setVis("esri-relief", mode2 === "vec");
    var opts = document.querySelectorAll(".bm-opt");
    for (var i = 0; i < opts.length; i++) { var r = opts[i].querySelector("input"); if (r) opts[i].classList.toggle("active", r.checked); }
  }
  var bmRadios = document.querySelectorAll('input[name="basemap"]');
  for (var bi = 0; bi < bmRadios.length; bi++) bmRadios[bi].addEventListener("change", function () { setBasemap(this.value); });
  var bmChecked = document.querySelector('input[name="basemap"]:checked');
  setBasemap(bmChecked ? bmChecked.value : "none");
  function bindToggle(id, fn) {
    var btn = document.getElementById(id); if (!btn) return;
    btn.addEventListener("click", function () {
      var on = this.getAttribute("aria-pressed") !== "true";
      this.setAttribute("aria-pressed", String(on)); fn(on);
    });
  }
  bindToggle("toggleProv", function (on) {
    setVis("country-fill", on); setVis("country-champion-fill", on);
    setVis("country-line", on); setVis("country-champion-line", on);
  });
  bindToggle("toggleLabel", function (on) { labelOn = on; requestLabelUpdate(); });

  var contSel = document.getElementById("prov-select");
  function buildContSelect() {
    var names = Object.keys(continentCount).sort(function (a, b) { return continentCount[b] - continentCount[a]; });
    contSel.innerHTML = '<option value="all">全部大洲（' + names.length + '）</option>' +
      names.map(function (n) { return '<option value="' + esc(n) + '">' + esc(n) + "（" + continentCount[n] + " 队）</option>"; }).join("");
    contSel.addEventListener("change", function () { contFilter = this.value; buildTeamList(); });
  }
  var continentCount = {};

  // 目录开合
  var sidePanel = document.getElementById("side-panel");
  var drawerHandle = document.getElementById("drawer-handle");
  if (isMobile) { sidePanel.classList.add("collapsed"); drawerHandle.setAttribute("aria-expanded", "false"); }
  drawerHandle.addEventListener("click", function () { var c = sidePanel.classList.toggle("collapsed"); this.setAttribute("aria-expanded", String(!c)); });
  document.getElementById("panel-close").addEventListener("click", function () { sidePanel.classList.add("collapsed"); document.getElementById("panel-open").setAttribute("aria-expanded", "false"); });
  document.getElementById("panel-open").addEventListener("click", function () { sidePanel.classList.remove("collapsed"); this.setAttribute("aria-expanded", "true"); });

  // 口径切换
  var modeSeg = document.getElementById("mode-seg");
  modeSeg.addEventListener("click", function (e) {
    var btn = e.target.closest(".mode-btn"); if (!btn || btn.dataset.mode === mode) return;
    mode = btn.dataset.mode;
    var all = modeSeg.querySelectorAll(".mode-btn");
    for (var i = 0; i < all.length; i++) all[i].classList.toggle("active", all[i] === btn);
    buildLegend(); applyFilter(); buildTeamList();
  });

  // 时间轴播放
  var tlSlider = document.getElementById("tl-slider"), tlPlay = document.getElementById("tl-play");
  tlSlider.addEventListener("input", onIdxChange);
  function stopPlay() { playing = false; if (playTimer) clearInterval(playTimer); playTimer = null; tlPlay.classList.remove("playing"); tlPlay.textContent = "▶"; }
  function startPlay() {
    if (viewIdx >= editions.length - 1) { viewIdx = 0; tlSlider.value = 0; onIdxChange(); }
    playing = true; tlPlay.classList.add("playing"); tlPlay.textContent = "⏸";
    playTimer = setInterval(function () {
      if (viewIdx >= editions.length - 1) { stopPlay(); return; }
      viewIdx++; tlSlider.value = viewIdx; onIdxChange();
    }, 300);
  }
  tlPlay.addEventListener("click", function () { if (playing) stopPlay(); else startPlay(); });

  // ---------- 启动 ----------
  function refreshUI() {
    if (!teams.length || !editions.length) return;
    tlSlider.min = 0; tlSlider.max = editions.length - 1; tlSlider.value = viewIdx;
    updateStats(); buildLegend(); buildContSelect(); buildTeamList(); updateTimelineUI();
    applyFilter(); requestLabelUpdate();
  }

  map.on("load", function () {
    bindStoreEvents();
    map.addLayer({
      id: "stores-halo", type: "circle", source: "stores",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 1.5, 13, 3, 19, 6, 30, 10, 44],
        "circle-color": "#e8b84b", "circle-opacity": 0.12, "circle-blur": 0.8
      }
    });
    map.addLayer({
      id: "stores-circle", type: "circle", source: "stores",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"],
          0, ["interpolate", ["linear"], ["coalesce", ["get", "apps"], 1], 1, 2, 10, 5, 23, 10],
          1.5, ["interpolate", ["linear"], ["coalesce", ["get", "apps"], 1], 1, 3, 10, 7, 23, 13],
          3, ["interpolate", ["linear"], ["coalesce", ["get", "apps"], 1], 1, 4, 10, 10, 23, 18],
          6, ["interpolate", ["linear"], ["coalesce", ["get", "apps"], 1], 1, 6, 10, 14, 23, 25],
          10, ["interpolate", ["linear"], ["coalesce", ["get", "apps"], 1], 1, 9, 10, 20, 23, 34]
        ],
        "circle-color": stopsExpr(APP_STOPS, "apps"),
        "circle-stroke-width": ["case", ["boolean", ["feature-state", "hover"], false], 2.6, 1.1],
        "circle-stroke-color": "#0b1220",
        "circle-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.88],
        "circle-stroke-opacity": 1
      }
    });
    applyFilter();
  });

  fetch("data/teams.json").then(function (r) { return r.json(); }).then(function (d) {
    teams = d.teams; editions = d.editions; continentCount = d.continentCount || {};
    buildIndex(); refreshUI();
  }).catch(function (e) { console.error("teams.json 加载失败", e); });

  fetch("data/stores.geojson").then(function (r) { return r.json(); }).then(function (fc) {
    storesFC = fc; allStores = fc.features;
    updateStoreData(); requestLabelUpdate();
  }).catch(function (e) { console.error("stores.geojson 加载失败", e); });

  fetch("data/country-fills.geojson").then(function (r) { return r.json(); }).then(function (geo) {
    countryRaw = geo; updateCountryFills();
  }).catch(function (e) { console.error("country-fills.geojson 加载失败", e); });

  map.on("move", requestLabelUpdate);
  map.on("zoom", requestLabelUpdate);
})();
