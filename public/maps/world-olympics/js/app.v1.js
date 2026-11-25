/* 奥运金牌百年迁移图 · 互动逻辑
   数据：Olympedia《Medal Winners by Games》30 届夏季奥运会逐项奖牌得主，
   解析脚本 _g/_fetch_olympic_medals.py + _g/_parse_olympic_medals.py，
   汇总脚本 _g/build_world_olympics.py。
   口径：历史代表团按继承口径并入现代国家；中国台北、中国香港单列但版图着色于中国；
   1900／1904 跨国混合队 4 金与独立运动员 1 金未计入国家。 */
(function () {
  "use strict";

  // 本届金牌：暗蓝底（0）→ 青 → 暗金 → 金（面积大时也不刺眼）
  var NOW_STOPS = [
    [0, "#0b1421"], [1, "#152a3d"], [2, "#1b3b4d"], [4, "#245a63"],
    [8, "#3d7a63"], [15, "#86762c"], [30, "#b8902c"], [60, "#d8a83a"]
  ];
  // 累计金牌：暗蓝 → 青蓝 → 青绿 → 金 → 亮金（只有历史头部才进金色）
  var CUM_STOPS = [
    [0, "#0b1421"], [1, "#14283a"], [15, "#1a4054"], [60, "#20606a"],
    [150, "#2a7d72"], [300, "#4a7a52"], [500, "#8a7a2c"], [800, "#c49a2a"], [1100, "#e8c04e"]
  ];

  function stopsExpr(stops, field) {
    var out = ["interpolate", ["linear"], ["coalesce", ["get", field], 0]];
    for (var i = 0; i < stops.length; i++) out.push(stops[i][0], stops[i][1]);
    return out;
  }
  var N_ED = 30;
  function gKey(i) { return (mode === "cum" ? "c" : "g") + i; }

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
      { id: "bg", type: "background", paint: { "background-color": "#0a111d" } },
      { id: "esri-img", type: "raster", source: "esri_img", layout: { visibility: "none" },
        paint: { "raster-opacity": 0.8, "raster-brightness-max": 0.55, "raster-saturation": -0.55 } },
      { id: "esri-relief", type: "raster", source: "esri_relief", layout: { visibility: "none" },
        paint: { "raster-opacity": 0.8 } },
      { id: "country-fill", type: "fill", source: "countries",
        paint: {
          "fill-color": stopsExpr(NOW_STOPS, "g29"),
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 1.5, 0.6, 4.5, 0.38, 7.0, 0]
        } },
      { id: "country-line", type: "line", source: "countries",
        paint: { "line-color": "#7f95ad", "line-width": 0.6, "line-opacity": 0.45 } },
      { id: "country-champion-line", type: "line", source: "countries",
        filter: ["==", ["get", "k"], ""],
        paint: { "line-color": "#ffd76a", "line-width": 1.6, "line-opacity": 0.9 } }
    ]
  };

  var map = new maplibregl.Map({
    container: "map", style: mapStyle,
    center: isMobile ? [10, 30] : [-2, 25],
    zoom: INIT_ZOOM, minZoom: MIN_ZOOM, maxZoom: 12,
    renderWorldCopies: false, attributionControl: false
  });
  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
  map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-right");
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-right");
  window.__map = map;

  var labelsEl = document.createElement("div");
  labelsEl.id = "labels";
  map.getContainer().appendChild(labelsEl);

  // ---------- 状态 ----------
  var teams = [], editions = [], byKey = {}, CODE_NAMES = {};
  var storesFC = null, countryRaw = null;
  var viewIdx = 29, mode = "now", contFilter = "all", searchKw = "";
  var labelOn = true, rafPending = false, popup = null, popupId = null, pinned = false;
  var playing = false, playTimer = null;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function row(k, v) { if (v === "" || v == null) return ""; return '<tr><td class="k">' + k + "</td><td>" + v + "</td></tr>"; }
  function ed() { return editions[viewIdx] || {}; }
  function teamOf(k) { return byKey[k] || null; }
  // 该届实际使用的代表团名义（苏联／东德／独联体／ROC 等），直接用该届登记代码
  function eraName(t, idx) {
    if (!t) return "";
    var e = editions[idx] || {};
    var ns = e.names && e.names[t.k];
    if (!ns || !ns.length) return t.name;
    if (ns.length === 1) return CODE_NAMES[ns[0]] || t.name;
    return ns.map(function (c) { return CODE_NAMES[c] || c; }).join(" + ");
  }

  // 当届榜首：榜首可能并列（如 2024 中国与美国各 40 金）
  function leaders(idx) {
    var top = (editions[idx] || {}).top || [];
    if (!top.length) return [];
    var max = top[0][1];
    return top.filter(function (x) { return x[1] === max; });
  }
  function leaderText(idx) {
    return leaders(idx).map(function (x) {
      var t = teamOf(x[0]);
      return eraName(t, idx) || x[0];
    }).join(" + ") || "—";
  }
  function leaderGoldText(idx) {
    var ls = leaders(idx);
    if (!ls.length) return "—";
    return (ls.length > 1 ? "各 " : "") + ls[0][1] + " 金";
  }

  function cumUpTo(t, idx) {
    var n = 0;
    for (var i = 0; i <= idx && i < t.series.length; i++) n += t.series[i];
    return n;
  }
  function goldUpTo(t, year) {
    var n = 0;
    for (var i = 0; i < editions.length; i++) {
      if (editions[i].year <= year) n += t.series[i];
    }
    return n;
  }
  function firstGoldIdx(t) {
    for (var i = 0; i < t.series.length; i++) if (t.series[i] > 0) return i;
    return -1;
  }
  function rankInEdition(t, idx) {
    var e = editions[idx]; if (!e) return 99;
    var list = e.top || [];
    for (var i = 0; i < list.length; i++) if (list[i][0] === t.k) return i + 1;
    return t.series[idx] > 0 ? 0 : -1;
  }

  // ---------- 详情卡 ----------
  function teamPopupHTML(t) {
    var i = viewIdx, e = editions[i];
    var now = t.series[i] || 0;
    var cum = cumUpTo(t, i);
    var maxV = Math.max.apply(null, t.series.concat([1]));
    var cells = "";
    for (var q = 0; q < editions.length; q++) {
      var v = t.series[q];
      var h = v > 0 ? Math.max(12, Math.round((v / maxV) * 100)) : 5;
      var cls = "gl-cell" + (v > 0 ? " on" : "") + (q === i ? " now" : "");
      cells += '<button class="' + cls + '" data-idx="' + q + '" style="height:' + h + '%" title="' +
        editions[q].year + " " + editions[q].city + "：" + (v > 0 ? v + " 金" : "无金牌") + '"></button>';
    }
    var rankTxt = now > 0 ? (rankInEdition(t, i) > 0 ? "第 " + rankInEdition(t, i) + " 位" : "并列夺金") : "未夺金";
    var along = t.aliases.map(function (a) {
      return esc(a.name) + "（" + a.from + (a.to !== a.from ? "—" + a.to : "") + "）";
    }).join(" · ");
    var rows = "";
    rows += row("大　洲", esc(t.cont) + (t.face ? "" : " · 无独立国界"));
    var nm = eraName(t, i);
    if (nm !== t.name) rows += row("本届名义", esc(nm));
    rows += row("本届成绩", now > 0 ? now + " 金 · " + rankTxt : "未夺金");
    rows += row("累计金牌", fmt(t.total) + " 金 · " + t.editions + " 届夺金");
    rows += row("最好名次", "第 " + t.bestRank + " 位（" + t.bestYear + "）");
    if (t.aliases.length > 1 || t.aliases[0].code !== t.k) rows += row("代表团沿革", along);
    return '<div class="pop" style="--c:#e8b84b">' +
      "<h3>" + esc(t.name) + " <span style='font-size:11px;color:var(--text-muted)'>" + esc(t.nameEn) + "</span> " +
      '<span class="era-tag gold">' + fmt(t.total) + " 金</span></h3>" +
      '<table class="kv">' + rows + "</table>" +
      '<div class="gl-strip">' + cells + "</div>" +
      '<div class="yr-cap">30 届金牌分布：柱高为金牌数，白框为当前届。点击柱跳转该届。</div>' +
      '<div class="note">历史代表团已并入现代国家统计；中国台北、中国香港在榜单单列，版图着色于中国。</div>' +
      "</div>";
  }

  function validLngLat(v) {
    if (!v) return null;
    if (Array.isArray(v) && v.length >= 2 && isFinite(v[0]) && isFinite(v[1])) return { lng: v[0], lat: v[1] };
    return (isFinite(v.lng) && isFinite(v.lat)) ? v : null;
  }
  function showPopup(t, lngLat, html) {
    var ll = validLngLat(lngLat) || map.getCenter();
    if (popup && popupId === t.k) { popup.setLngLat(ll); return; }
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ offset: 12, closeButton: true, closeOnClick: false,
      className: "wc-popup", maxWidth: "330px" })
      .setLngLat(ll).setHTML(html || teamPopupHTML(t)).addTo(map);
    popup.on("close", function () { popup = null; popupId = null; pinned = false; });
    bindStrip();
    popupId = t.k;
  }
  function bindStrip() {
    if (!popup) return;
    var cells = popup.getElement().querySelectorAll(".gl-cell");
    for (var i = 0; i < cells.length; i++) {
      cells[i].addEventListener("click", function () {
        viewIdx = Number(this.getAttribute("data-idx"));
        applyEra(); buildList(); updateTimelineUI();
        if (popupId && byKey[popupId]) {
          popup.setHTML(teamPopupHTML(byKey[popupId]));
          bindStrip();
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
      var fs = map.queryRenderedFeatures(e.point, { layers: ["stores-ring"] });
      if (fs.length) {
        map.getCanvas().style.cursor = "pointer";
        var f = fs[0], id = f.properties.id;
        if (hovered !== id) {
          if (hovered != null) map.setFeatureState({ source: "stores", id: hovered }, { hover: false });
          hovered = id;
          map.setFeatureState({ source: "stores", id: hovered }, { hover: true });
        }
        if (!pinned) showPopup(byKey[id], e.lngLat);
      } else {
        map.getCanvas().style.cursor = "";
        if (hovered != null) { map.setFeatureState({ source: "stores", id: hovered }, { hover: false }); hovered = null; }
        if (!pinned) removePopup();
      }
    });
    map.on("click", function (e) {
      var fs = map.queryRenderedFeatures(e.point, { layers: ["stores-ring", "stores-core"] });
      if (fs.length) {
        var id = fs[0].properties.id;
        if (hovered != null && hovered !== id) map.setFeatureState({ source: "stores", id: hovered }, { hover: false });
        hovered = id;
        map.setFeatureState({ source: "stores", id: hovered }, { hover: true });
        showPopup(byKey[id], e.lngLat); pinned = true;
      } else removePopup();
    });
  }

  // ---------- 国家标注 ----------
  var LBL_MIN_DIST = isMobile ? 58 : 84;
  function updateLabels() {
    if (!labelOn) { labelsEl.innerHTML = ""; return; }
    var z = map.getZoom();
    var w = map.getCanvas().clientWidth, h = map.getCanvas().clientHeight;
    var leftEdge = w > 760 ? 326 : 40;
    var cands = [];
    for (var i = 0; i < teams.length; i++) {
      var t = teams[i];
      if (!t.face) continue;
      var v = t.series[viewIdx] || 0;
      var need = v >= 20 ? 1.4 : v >= 8 ? 2.0 : v >= 3 ? 2.8 : v >= 1 ? 3.6 : 5.0;
      if (isMobile) need -= 1.4;
      if (z < need) continue;
      for (var k = -1; k <= 1; k++) {
        var p = map.project([t.lng + k * 360, t.lat]);
        if (p.x < leftEdge || p.x > w - 60 || p.y < 80 || p.y > h - 52) continue;
        cands.push({ t: t, x: p.x, y: p.y, v: v });
      }
    }
    cands.sort(function (a, b) { return (b.v - a.v) || (b.t.total - a.t.total); });
    var html = "", grid = {}, n = 0, MAX = isMobile ? 14 : 40;
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
      var num = it.v > 0 ? '<span class="star">' + it.v + "</span>" : "";
      html += '<div class="city-lbl' + (it.v > 0 ? " has-gold" : "") + '" data-code="' + esc(it.t.k) +
        '" style="left:' + lx + "px;top:" + it.y + 'px">' + esc(it.t.name) + num + "</div>";
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
    var e = ed();
    if (mode === "cum") {
      var n = 0, g = 0;
      for (var i = 0; i < teams.length; i++) {
        var c = cumUpTo(teams[i], viewIdx);
        if (c > 0) { n++; g += c; }
      }
      document.getElementById("stat-nations").textContent = n;
      document.getElementById("stat-golds").textContent = fmt(g);
    } else {
      document.getElementById("stat-nations").textContent = e.nations || 0;
      document.getElementById("stat-golds").textContent = fmt(e.golds || 0);
    }
    document.getElementById("stat-teams").textContent = teams.length;
  }
  function buildLegend() {
    var el = document.getElementById("era-filter");
    var stops = mode === "cum" ? CUM_STOPS : NOW_STOPS;
    el.innerHTML = stops.map(function (s, i) {
      var label = i === 0 ? "0" : (i === stops.length - 1 ? "≥" + s[0] : String(s[0]));
      return '<span class="lg-item"><i style="background:' + s[1] + '"></i>' + label + "</span>";
    }).join("") + '<span class="lg-item lg-note">单位：金牌</span>';
  }
  function listValue(t) {
    return mode === "cum" ? cumUpTo(t, viewIdx) : (t.series[viewIdx] || 0);
  }
  function buildList() {
    var list = document.getElementById("city-list");
    var kw = searchKw.toLowerCase();
    var items = teams.filter(function (t) {
      if (contFilter !== "all" && t.cont !== contFilter) return false;
      if (mode !== "cum" && !(t.series[viewIdx] > 0)) return false;
      if (mode === "cum" && cumUpTo(t, viewIdx) <= 0) return false;
      if (!kw) return true;
      return t.name.indexOf(kw) >= 0 || t.nameEn.toLowerCase().indexOf(kw) >= 0 ||
             t.k.toLowerCase().indexOf(kw) === 0 || (t.iso || "").toLowerCase() === kw ||
             t.aliases.some(function (a) { return a.name.indexOf(kw) >= 0; });
    });
    items.sort(function (a, b) {
      return listValue(b) - listValue(a) || b.total - a.total || a.name.localeCompare(b.name, "zh");
    });
    document.getElementById("panel-title").textContent =
      mode === "cum" ? "累计金牌榜 / 国家目录" : "本届金牌榜 / 国家目录";
    var champSet = {};
    for (var c = 0; c < leaders(viewIdx).length; c++) champSet[leaders(viewIdx)[c][0]] = 1;
    if (!items.length) list.innerHTML = '<div class="list-empty">没有匹配的国家</div>';
    else {
      list.innerHTML = items.map(function (t, i) {
        var v = listValue(t);
        var num = v > 0 ? v + " 金" : "—";
        var shown = mode === "cum" ? t.name : eraName(t, viewIdx);
        var extra = "";
        if (mode !== "cum" && shown !== t.name) extra = " · 今 " + t.name;
        else if (mode === "cum" && t.aliases.length > 1) {
          extra = " · 含 " + t.aliases.map(function (a) { return a.name; })
            .filter(function (n) { return n !== t.name; }).join("/");
        }
        var meta2 = t.cont + " · 累计 " + fmt(cumUpTo(t, viewIdx)) + " 金" +
          (t.series[viewIdx] > 0 && mode === "cum" ? " · 本届 " + t.series[viewIdx] : "") + extra;
        var medal = mode === "cum" ? "" : (champSet[t.k] ? " is-champ" : (i < 3 ? " is-top" : ""));
        return '<button class="city-item' + medal + '" data-code="' + esc(t.k) + '">' +
          '<div class="ci-top"><span class="ci-rank">' + (i + 1) + "</span>" +
          '<span class="ci-name">' + esc(shown) + "</span>" +
          '<span class="ci-count">' + num + "</span></div>" +
          '<div class="ci-meta">' + esc(meta2) + "</div></button>";
      }).join("");
    }
    var btns = list.querySelectorAll(".city-item");
    for (var i2 = 0; i2 < btns.length; i2++) btns[i2].addEventListener("click", function () { focusTeam(this.dataset.code, this); });
    document.getElementById("list-count").textContent = "共 " + items.length + " 个国家 · " + ed().year + " 年";
  }

  function focusTeam(k, btn) {
    var t = byKey[k]; if (!t) return;
    if (window.matchMedia("(max-width: 760px)").matches) {
      sidePanel.classList.add("collapsed");
      document.getElementById("panel-open").setAttribute("aria-expanded", "false");
    }
    if (btn) {
      var old = document.querySelectorAll(".city-item.is-selected");
      for (var j = 0; j < old.length; j++) old[j].classList.remove("is-selected");
      btn.classList.add("is-selected");
    }
    var z = t.total > 200 ? 3.0 : t.total > 50 ? 3.8 : 4.8;
    if (!t.face) z = 5.4;
    map.flyTo({ center: [t.lng, t.lat], zoom: z, speed: 1.2, curve: 1.4 });
    map.once("moveend", function () { showPopup(t, [t.lng, t.lat]); pinned = true; });
  }

  // ---------- 版图重算 ----------
  function fillExpr() {
    return stopsExpr(mode === "cum" ? CUM_STOPS : NOW_STOPS, gKey(viewIdx));
  }
  function bubbleRadius() {
    var field = gKey(viewIdx);
    var sc = mode === "cum" ? 0.44 : 1;
    function band(k) {
      return ["+", k[0], ["*", k[1] * sc, ["sqrt", ["coalesce", ["get", field], 0]]]];
    }
    return ["interpolate", ["linear"], ["zoom"],
      1.4, band([1.9, 1.25]),
      3, band([3.0, 2.2]),
      6, band([4.4, 3.6]),
      10, band([6.0, 5.4])];
  }
  function bubbleFilter() {
    return ["all", [">", ["coalesce", ["get", gKey(viewIdx)], 0], 0]];
  }
  function setCountryPaint() {
    if (map.getLayer("country-fill")) {
      map.setPaintProperty("country-fill", "fill-color", fillExpr());
      map.setPaintProperty("country-fill", "fill-opacity",
        ["interpolate", ["linear"], ["zoom"], 1.5, 0.6, 4.5, 0.38, 7.0, 0]);
    }
    var champKeys = leaders(viewIdx).map(function (x) { return x[0]; });
    if (map.getLayer("country-champion-line")) {
      map.setFilter("country-champion-line", ["in", ["get", "k"], ["literal", champKeys.length ? champKeys : ["#"]]]);
      map.setPaintProperty("country-champion-line", "line-width",
        ["interpolate", ["linear"], ["zoom"], 1.5, 1.6, 5, 2.6, 8, 4]);
    }
  }
  function applyEra() {
    setCountryPaint();
    if (map.getLayer("stores-ring")) {
      map.setFilter("stores-ring", bubbleFilter());
      map.setPaintProperty("stores-ring", "circle-radius", bubbleRadius());
    }
    if (map.getLayer("stores-core")) map.setFilter("stores-core", bubbleFilter());
    if (map.getLayer("stores-halo")) {
      map.setFilter("stores-halo", bubbleFilter());
      map.setPaintProperty("stores-halo", "circle-radius", (function () {
        var field = gKey(viewIdx);
        var sc2 = mode === "cum" ? 0.44 : 1;
        function band(k) { return ["+", k[0], ["*", k[1] * sc2, ["sqrt", ["coalesce", ["get", field], 0]]]]; }
        return ["interpolate", ["linear"], ["zoom"],
          1.4, band([6.5, 3.0]), 3, band([9, 5.0]), 6, band([13, 8.0]), 10, band([17, 12.0])];
      })());
    }
    requestLabelUpdate();
  }

  function updateChampBanner() {
    var e = ed();
    if (!e || !e.champion) return;
    document.getElementById("cb-year").textContent = e.year;
    document.getElementById("cb-edition").textContent = e.no || (viewIdx + 1);
    document.getElementById("cb-host").textContent = e.host || "—";
    document.getElementById("cb-champion").textContent = leaderText(viewIdx);
    document.getElementById("cb-detail").textContent = leaderGoldText(viewIdx);
    document.getElementById("cb-apps").textContent = (e.nations || 0) + " 国夺金";
  }
  function updateTimelineUI() {
    var e = ed();
    if (!e) return;
    document.getElementById("tl-slider").value = viewIdx;
    document.getElementById("tl-year").textContent =
      e.year + " 年 · 第 " + (e.no || viewIdx + 1) + " 届 · " + e.city;
    var tlCum = document.querySelector("#tl-cum b");
    if (tlCum) tlCum.textContent = leaderText(viewIdx) + " · " + leaderGoldText(viewIdx);
    updateChampBanner();
    var noteEl = document.getElementById("era-note");
    if (!noteEl) {
      noteEl = document.createElement("div");
      noteEl.id = "era-note";
      noteEl.className = "era-note";
      document.body.appendChild(noteEl);
    }
    if (e.note) { noteEl.textContent = e.note; noteEl.classList.add("on"); }
    else noteEl.classList.remove("on");
  }
  function onIdxChange() {
    viewIdx = Number(document.getElementById("tl-slider").value);
    applyEra(); buildList(); updateStats(); updateTimelineUI();
  }

  // ---------- 搜索 ----------
  var searchInput = document.getElementById("search");
  var searchResult = document.getElementById("searchResult");
  function renderSearch(q) {
    if (!q) { searchResult.innerHTML = ""; searchResult.classList.remove("has-hits"); return; }
    var lq = q.toLowerCase();
    var hits = teams.filter(function (t) {
      return t.name.indexOf(q) >= 0 || t.nameEn.toLowerCase().indexOf(lq) >= 0 ||
             t.k.toLowerCase() === lq || (t.iso || "").toLowerCase() === lq ||
             t.aliases.some(function (a) { return a.name.indexOf(q) >= 0 || a.code.toLowerCase() === lq; });
    }).slice(0, 20);
    if (!hits.length) { searchResult.innerHTML = '<li class="empty">无匹配国家</li>'; searchResult.classList.add("has-hits"); return; }
    searchResult.innerHTML = hits.map(function (t) {
      return '<li data-code="' + esc(t.k) + '"><span>' + esc(t.name) + "</span>" +
        '<span class="tag">' + fmt(t.total) + " 金</span></li>";
    }).join("");
    searchResult.classList.add("has-hits");
  }
  searchInput.addEventListener("input", function () {
    searchKw = this.value.trim(); renderSearch(searchKw); buildList();
  });
  searchResult.addEventListener("click", function (e) {
    var li = e.target.closest("li"); if (!li || !li.dataset.code) return;
    var k = li.dataset.code;
    searchResult.innerHTML = ""; searchResult.classList.remove("has-hits");
    searchInput.value = ""; searchKw = ""; buildList();
    focusTeam(k, null);
  });

  // ---------- 底图与叠加 ----------
  var optsBtn = document.getElementById("map-opts-btn"), optsPanel = document.getElementById("map-opts");
  function setOptsOpen(open) { optsPanel.classList.toggle("open", open); optsBtn.setAttribute("aria-expanded", String(open)); }
  optsBtn.addEventListener("click", function (e) { e.stopPropagation(); setOptsOpen(!optsPanel.classList.contains("open")); });
  document.addEventListener("click", function (e) { if (optsPanel.classList.contains("open") && !optsPanel.contains(e.target)) setOptsOpen(false); });
  function setVis(id, on) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); }
  function setBasemap(m) {
    setVis("esri-img", m === "img"); setVis("esri-relief", m === "vec");
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
    setVis("country-fill", on); setVis("country-line", on); setVis("country-champion-line", on);
  });
  bindToggle("toggleLabel", function (on) { labelOn = on; requestLabelUpdate(); });

  var contSel = document.getElementById("prov-select");
  function buildContSelect() {
    var cnt = {};
    for (var i = 0; i < teams.length; i++) cnt[teams[i].cont] = (cnt[teams[i].cont] || 0) + 1;
    var names = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; });
    contSel.innerHTML = '<option value="all">全部大洲（' + names.length + '）</option>' +
      names.map(function (n) { return '<option value="' + esc(n) + '">' + esc(n) + "（" + cnt[n] + "）</option>"; }).join("");
    contSel.addEventListener("change", function () { contFilter = this.value; buildList(); });
  }

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
    buildLegend(); buildList(); updateStats(); setCountryPaint(); applyEra();
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
    }, 480);
  }
  tlPlay.addEventListener("click", function () { if (playing) stopPlay(); else startPlay(); });

  // ---------- 启动 ----------
  function refreshUI() {
    if (!teams.length || !editions.length) return;
    tlSlider.min = 0; tlSlider.max = editions.length - 1; tlSlider.value = viewIdx;
    updateStats(); buildLegend(); buildContSelect(); buildList(); updateTimelineUI();
    setCountryPaint(); applyEra();
  }

  map.on("load", function () {
    map.addLayer({
      id: "stores-halo", type: "circle", source: "stores",
      paint: { "circle-radius": 12, "circle-color": "#ffd76a", "circle-opacity": 0.14, "circle-blur": 0.9 }
    });
    map.addLayer({
      id: "stores-ring", type: "circle", source: "stores",
      paint: {
        "circle-radius": 8,
        "circle-color": "rgba(0,0,0,0)",
        "circle-stroke-width": ["case", ["boolean", ["feature-state", "hover"], false], 3.4, 1.7],
        "circle-stroke-color": ["case", ["boolean", ["feature-state", "hover"], false], "#ffd76a", "#ffffff"],
        "circle-stroke-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.82]
      }
    });
    map.addLayer({
      id: "stores-core", type: "circle", source: "stores",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 1.4, 1.4, 4, 2.1, 8, 3.4],
        "circle-color": ["case", ["boolean", ["feature-state", "hover"], false], "#ffffff", "#ffd76a"],
        "circle-opacity": 0.95,
        "circle-stroke-color": "rgba(6,12,22,0.85)", "circle-stroke-width": 0.6
      }
    });
    map.on("mouseleave", "stores-ring", function () { map.getCanvas().style.cursor = ""; });
    bindStoreEvents();
    applyEra();
    requestLabelUpdate();
  });

  fetch("data/teams.json").then(function (r) { return r.json(); }).then(function (d) {
    teams = d.teams; editions = d.editions; CODE_NAMES = d.codeNames || {};
    byKey = {};
    for (var i = 0; i < teams.length; i++) byKey[teams[i].k] = teams[i];
    refreshUI();
  }).catch(function (e) { console.error("teams.json 加载失败", e); });

  fetch("data/stores.geojson").then(function (r) { return r.json(); }).then(function (fc) {
    storesFC = fc;
    // 把 series 展开成 g0..g29，供表达式直接索引
    for (var i = 0; i < fc.features.length; i++) {
      var p = fc.features[i].properties, s = p.series || [], acc = 0;
      for (var j = 0; j < s.length; j++) { p["g" + j] = s[j]; acc += s[j]; p["c" + j] = acc; }
    }
    if (map.getSource("stores")) map.getSource("stores").setData(fc);
    applyEra(); requestLabelUpdate();
  }).catch(function (e) { console.error("stores.geojson 加载失败", e); });

  fetch("data/country-fills.geojson").then(function (r) { return r.json(); }).then(function (geo) {
    for (var i = 0; i < geo.features.length; i++) {
      var p = geo.features[i].properties, acc = 0;
      for (var j = 0; j < N_ED; j++) { acc += p["g" + j] || 0; p["c" + j] = acc; }
    }
    if (map.getSource("countries")) map.getSource("countries").setData(geo);
    applyEra();
  }).catch(function (e) { console.error("country-fills 载入失败", e); });

  map.on("move", requestLabelUpdate);
  map.on("zoom", requestLabelUpdate);
})();
