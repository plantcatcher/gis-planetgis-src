/* 中国高铁网络时间轴 · 互动逻辑
   线路 LineString（按开通年代四色）+ 站点环节点（半径 ∝ √线路数）+ 城市名 HTML 叠层；
   左侧线路目录（年代筛选/搜索）+ 底部年份时间轴 + 点线路/点城市详情卡 + 三种底图。
   线路走向为城市节点连线示意，非精确轨道几何。 */
(function () {
  "use strict";

  var ERA = {
    pioneer:      { name: "起步期", range: "≤2012", color: "#fbbf24" },
    expansion:    { name: "骨干期", range: "2013–2017", color: "#38bdf8" },
    acceleration: { name: "加密期", range: "2018–2022", color: "#34d399" },
    surge:        { name: "新线期", range: "2023–2026", color: "#f87171" }
  };
  var ERA_ORDER = ["pioneer", "expansion", "acceleration", "surge"];
  var MIN_YEAR = 2008, MAX_YEAR = 2026;

  function amapTiles(styleId) {
    return ["01", "02", "03", "04"].map(function (s) {
      return "https://wprd" + s + ".is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=" + styleId;
    });
  }

  var mapStyle = {
    version: 8,
    sources: {
      amap_vec:  { type: "raster", tiles: amapTiles(7), tileSize: 256, attribution: "高德地图" },
      amap_img:  { type: "raster", tiles: amapTiles(6), tileSize: 256, attribution: "高德地图" },
      provinces: { type: "geojson", data: "/maps/_shared/china-provinces.json" },
      lines:     { type: "geojson", data: "data/lines.geojson" },
      stations:  { type: "geojson", data: "data/stations.json" }
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#0b1220" } },
      { id: "amap-vec", type: "raster", source: "amap_vec", layout: { "visibility": "none" }, paint: { "raster-opacity": 1 } },
      { id: "amap-img", type: "raster", source: "amap_img", paint: { "raster-opacity": 0.62 } },
      {
        id: "province-fill", type: "fill", source: "provinces", layout: { "visibility": "none" },
        paint: {
          "fill-color": ["interpolate", ["linear"], ["coalesce", ["get", "railCount"], 0],
            0, "#0d1b30", 2, "#163b52", 5, "#1d6b78", 9, "#2f9a8c", 14, "#c79839"],
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 4.5, 0.62, 7.0, 0]
        }
      },
      { id: "province-line", type: "line", source: "provinces", layout: { "visibility": "none" },
        paint: { "line-color": "#cbd5e1", "line-width": 0.8, "line-opacity": 0.75 } },
      {
        id: "lines-halo", type: "line", source: "lines",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": eraColorExpr(),
          "line-width": ["interpolate", ["linear"], ["zoom"], 3, 5, 5, 8, 8, 13],
          "line-opacity": 0.22,
          "line-blur": 3
        }
      },
      {
        id: "lines-main", type: "line", source: "lines",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": eraColorExpr(),
          "line-width": ["interpolate", ["linear"], ["zoom"], 3, 1.5, 5, 2.6, 8, 4.5, 12, 6],
          "line-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.86]
        }
      },
      {
        id: "stations-glow", type: "circle", source: "stations",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 6, 6, 11, 10, 18],
          "circle-color": "#38bdf8", "circle-opacity": 0.2, "circle-blur": 0.8
        }
      },
      {
        id: "stations-ring", type: "circle", source: "stations",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, ["*", 2.6, ["sqrt", ["get", "count"]]], 6, ["*", 4.2, ["sqrt", ["get", "count"]]], 10, ["*", 6, ["sqrt", ["get", "count"]]]],
          "circle-color": "#38bdf8",
          "circle-opacity": 0,
          "circle-stroke-color": "#7dd3fc",
          "circle-stroke-width": ["case", ["boolean", ["feature-state", "hover"], false], 3, 1.6],
          "circle-stroke-opacity": 0.95
        }
      },
      {
        id: "stations-core", type: "circle", source: "stations",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 2.2, 6, 3, 10, 4],
          "circle-color": "#e0f2fe", "circle-opacity": 0.95
        }
      }
    ]
  };

  var map = new maplibregl.Map({
    container: "map", style: mapStyle,
    center: [105, 34], zoom: 3.6, minZoom: 2.6, maxZoom: 14, attributionControl: false
  });
  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
  map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-right");
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-right");
  window.__map = map;

  var labelsEl = document.createElement("div");
  labelsEl.id = "labels";
  map.getContainer().appendChild(labelsEl);

  function eraColorExpr() {
    return ["case",
      ["==", ["get", "era"], "pioneer"], ERA.pioneer.color,
      ["==", ["get", "era"], "expansion"], ERA.expansion.color,
      ["==", ["get", "era"], "acceleration"], ERA.acceleration.color,
      ["==", ["get", "era"], "surge"], ERA.surge.color,
      "#ffffff"];
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function row(k, v) { if (v === "" || v == null) return ""; return '<tr><td class="k">' + k + "</td><td>" + v + "</td></tr>"; }
  function eraName(e) { return ERA[e] ? ERA[e].name : e; }
  function eraColor(e) { return ERA[e] ? ERA[e].color : "#38bdf8"; }

  // ---------- 状态 ----------
  var allLines = [], allStations = [];
  var viewYear = MAX_YEAR;
  var eraOn = {}; ERA_ORDER.forEach(function (e) { eraOn[e] = true; });
  var labelOn = true, stationOn = true, thick = true;
  var popup = null, popupKey = null, pinned = false, rafPending = false;
  var searchKw = "";

  // ---------- 详情卡 ----------
  function linePopupHTML(p) {
    var c = eraColor(p.era);
    var rows = "";
    rows += row("开通年份", p.openYear + " 年");
    rows += row("里程", p.lengthKm != null ? p.lengthKm + " km" : "—");
    rows += row("起讫", (p.from || "—") + " → " + (p.to || "—"));
    if (p.province && p.province.length) rows += row("途经省份", p.province.join("、"));
    var chain = (p.cities && p.cities.length)
      ? '<div class="city-chain"><b>沿线城市</b><br>' + esc(p.cities.join(" · ")) + "</div>" : "";
    var note = "";
    if (p.note) note += esc(p.note) + "<br>";
    note += "线路走向以城市节点连线示意，非精确轨道几何。";
    if (p.source) note += '<br>来源：' + esc(p.source);
    return '<div class="pop" style="--c:' + c + '">' +
      "<h3>" + esc(p.name) + '<span class="era-tag ' + p.era + '">' + eraName(p.era) + "</span></h3>" +
      '<table class="kv">' + rows + "</table>" + chain +
      '<div class="note">' + note + "</div></div>";
  }

  function stationPopupHTML(p) {
    var rows = "";
    rows += row("首个通车年", p.firstYear + " 年");
    rows += row("经过线路", p.count + " 条");
    var ls = (p.lines || []).map(function (l) {
      return '<div class="line-row"><span class="sn">' + esc(l.short || l.name) +
        '</span><span class="sy">' + l.openYear + "</span></div>";
    }).join("");
    return '<div class="pop" style="--c:#38bdf8">' +
      "<h3>" + esc(p.name) + '<span class="era-tag expansion">' + p.count + " 条高铁</span></h3>" +
      '<table class="kv">' + rows + "</table>" + ls +
      '<div class="note">城市节点取城市中心坐标，不代表具体车站位置。</div></div>';
  }

  function showPopup(key, lngLat, html) {
    if (!lngLat || !isFinite(lngLat[0]) || !isFinite(lngLat[1])) lngLat = map.getCenter().toArray ? map.getCenter().toArray() : [110, 33];
    if (popup && popupKey === key) { popup.setLngLat(lngLat); return; }
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ offset: 12, closeButton: true, closeOnClick: false, className: "rail-popup", maxWidth: "320px" })
      .setLngLat(lngLat).setHTML(html).addTo(map);
    popup.on("close", function () { popup = null; popupKey = null; pinned = false; });
    popupKey = key;
  }
  function removePopup() { if (popup) popup.remove(); popup = null; popupKey = null; pinned = false; }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && popup && pinned) removePopup(); });

  // ---------- 年份过滤 ----------
  function visibleLine(f) { return f.properties.openYear <= viewYear && eraOn[f.properties.era]; }
  function visibleStation(f) { return f.properties.firstYear <= viewYear; }
  function eraFilterExpr(key) {
    var expr = ["any"];
    ERA_ORDER.forEach(function (e) { if (eraOn[e]) expr.push(["==", ["get", key], e]); });
    if (expr.length === 1) expr.push(["==", ["get", key], "__none__"]);
    return expr;
  }
  function applyFilter() {
    if (!map.getLayer("lines-main")) return;
    var lf = ["all", ["<=", ["get", "openYear"], viewYear], eraFilterExpr("era")];
    map.setFilter("lines-halo", lf);
    map.setFilter("lines-main", lf);
    var sf = ["<=", ["get", "firstYear"], viewYear];
    ["stations-glow", "stations-ring", "stations-core"].forEach(function (id) {
      if (map.getLayer(id)) map.setFilter(id, sf);
    });
    requestLabelUpdate();
  }
  function cumLines() { return allLines.filter(visibleLine).length; }
  function cumKm() {
    var n = 0;
    allLines.forEach(function (f) { if (visibleLine(f)) n += (f.properties.lengthKm || 0); });
    return n;
  }
  function cumCities() {
    var s = {};
    allLines.forEach(function (f) {
      if (!visibleLine(f)) return;
      (f.properties.cities || []).forEach(function (c) { s[c] = 1; });
    });
    return Object.keys(s).length;
  }

  // ---------- 地图交互 ----------
  function bindEvents() {
    var hoverLine = null, hoverLineId = null, hoverStation = null, hoverStationId = null;
    map.on("mousemove", function (e) {
      var sf = stationOn ? map.queryRenderedFeatures(e.point, { layers: ["stations-ring", "stations-core"] }) : [];
      if (sf.length) {
        map.getCanvas().style.cursor = "pointer";
        var f = sf[0];
        if (hoverStation !== f.properties.name) {
          if (hoverStationId != null) clearFeatureState("stations", hoverStationId);
          hoverStation = f.properties.name; hoverStationId = f.id;
          map.setFeatureState({ source: "stations", id: f.id }, { hover: true });
        }
        if (hoverLineId != null) { clearFeatureState("lines", hoverLineId); hoverLine = null; hoverLineId = null; }
        if (!pinned) showPopup("station:" + f.properties.name, f.geometry.coordinates, stationPopupHTML(f.properties));
        return;
      }
      if (hoverStationId != null) { clearFeatureState("stations", hoverStationId); hoverStation = null; hoverStationId = null; }
      var lf = map.queryRenderedFeatures(e.point, { layers: ["lines-halo", "lines-main"] });
      if (lf.length) {
        map.getCanvas().style.cursor = "pointer";
        var g = lf[0];
        if (hoverLine !== g.properties.id) {
          if (hoverLineId != null) clearFeatureState("lines", hoverLineId);
          hoverLine = g.properties.id; hoverLineId = g.id;
          map.setFeatureState({ source: "lines", id: g.id }, { hover: true });
        }
        if (!pinned) showPopup("line:" + g.properties.id, e.lngLat, linePopupHTML(g.properties));
      } else {
        map.getCanvas().style.cursor = "";
        if (hoverLineId != null) { clearFeatureState("lines", hoverLineId); hoverLine = null; hoverLineId = null; }
        if (!pinned) removePopup();
      }
    });
    map.on("click", function (e) {
      var sf = stationOn ? map.queryRenderedFeatures(e.point, { layers: ["stations-ring", "stations-core"] }) : [];
      if (sf.length) {
        var f = sf[0];
        showPopup("station:" + f.properties.name, f.geometry.coordinates, stationPopupHTML(f.properties));
        pinned = true; return;
      }
      var lf = map.queryRenderedFeatures(e.point, { layers: ["lines-halo", "lines-main"] });
      if (lf.length) {
        var g = lf[0];
        showPopup("line:" + g.properties.id, e.lngLat, linePopupHTML(g.properties));
        pinned = true; return;
      }
      removePopup();
    });
  }
  function clearFeatureState(source, id) {
    try { map.setFeatureState({ source: source, id: id }, { hover: false }); } catch (err) { /* id 可能是字符串 */ }
  }

  // ---------- 城市标注（HTML 叠层 + 碰撞） ----------
  function updateLabels() {
    if (!labelOn || !allStations.length) { labelsEl.innerHTML = ""; return; }
    var z = map.getZoom(), w = map.getCanvas().clientWidth, h = map.getCanvas().clientHeight;
    var bd = map.getBounds(), wmin = bd.getWest(), wmax = bd.getEast(), smin = bd.getSouth(), smax = bd.getNorth();
    var cands = [];
    for (var i = 0; i < allStations.length; i++) {
      var s = allStations[i], p = s.properties;
      if (!visibleStation(s)) continue;
      if (p.lng < wmin || p.lng > wmax || p.lat < smin || p.lat > smax) continue;
      var need = p.count >= 4 ? 3.4 : (p.count >= 2 ? 4.6 : 6.0);
      if (z < need) continue;
      var pt = map.project([p.lng, p.lat]);
      if (pt.x < 40 || pt.x > w - 40 || pt.y < 30 || pt.y > h - 30) continue;
      cands.push({ p: p, x: pt.x, y: pt.y });
    }
    cands.sort(function (a, b) { return b.p.count - a.p.count; });
    var MIN = 34, grid = {}, html = "", n = 0;
    for (var k = 0; k < cands.length && n < 70; k++) {
      var q = cands[k], gx = Math.floor(q.x / MIN), gy = Math.floor(q.y / MIN), hit = false;
      for (var ax = gx - 1; ax <= gx + 1 && !hit; ax++)
        for (var ay = gy - 1; ay <= gy + 1 && !hit; ay++) {
          var bucket = grid[ax + "," + ay];
          if (!bucket) continue;
          for (var bi = 0; bi < bucket.length; bi++) {
            var o = bucket[bi], dx = o[0] - q.x, dy = o[1] - q.y;
            if (dx * dx + dy * dy < MIN * MIN) { hit = true; break; }
          }
        }
      if (hit) continue;
      (grid[gx + "," + gy] || (grid[gx + "," + gy] = [])).push([q.x, q.y]);
      html += '<div class="city-lbl" data-city="' + esc(q.p.name) + '" style="left:' + q.x + "px;top:" + (q.y - 12) + 'px">' +
        esc(q.p.name) + '<span class="cc">' + q.p.count + "</span></div>";
      n++;
    }
    labelsEl.innerHTML = html;
    var els = labelsEl.querySelectorAll(".city-lbl");
    for (var m = 0; m < els.length; m++) {
      els[m].addEventListener("click", function () { focusStation(this.getAttribute("data-city")); });
    }
  }
  function requestLabelUpdate() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () { rafPending = false; updateLabels(); });
  }

  // ---------- 定位 ----------
  function focusLine(id) {
    var f = null;
    for (var i = 0; i < allLines.length; i++) if (allLines[i].properties.id === id) { f = allLines[i]; break; }
    if (!f) return;
    var c = f.geometry.coordinates;
    if (c.length >= 2) map.fitBounds([minLngLat(c), maxLngLat(c)], { padding: 80, maxZoom: 8, duration: 900 });
    else map.flyTo({ center: c[0], zoom: 7, speed: 1.2 });
    map.once("moveend", function () { showPopup("line:" + id, lineCenter(c), linePopupHTML(f.properties)); pinned = true; });
  }
  function focusStation(name) {
    var f = null;
    for (var i = 0; i < allStations.length; i++) if (allStations[i].properties.name === name) { f = allStations[i]; break; }
    if (!f) return;
    if (window.matchMedia("(max-width: 760px)").matches) collapsePanel();
    map.flyTo({ center: f.geometry.coordinates, zoom: Math.max(map.getZoom(), 7.5), speed: 1.2 });
    map.once("moveend", function () { showPopup("station:" + name, f.geometry.coordinates, stationPopupHTML(f.properties)); pinned = true; });
  }
  function minLngLat(c) { var a = [Infinity, Infinity]; c.forEach(function (p) { a[0] = Math.min(a[0], p[0]); a[1] = Math.min(a[1], p[1]); }); return a; }
  function maxLngLat(c) { var a = [-Infinity, -Infinity]; c.forEach(function (p) { a[0] = Math.max(a[0], p[0]); a[1] = Math.max(a[1], p[1]); }); return a; }
  function lineCenter(c) { var a = minLngLat(c), b = maxLngLat(c); return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }

  // ---------- 左侧目录 ----------
  function updateStats() {
    document.getElementById("stat-lines").textContent = allLines.length;
    document.getElementById("stat-stations").textContent = cumCities();
    document.getElementById("stat-km").textContent = (cumKm() / 10000).toFixed(1);
  }
  function buildEraFilter() {
    var el = document.getElementById("era-filter"), html = "";
    ERA_ORDER.forEach(function (e) {
      var cnt = allLines.filter(function (f) { return f.properties.era === e; }).length;
      html += '<label class="era-check' + (eraOn[e] ? "" : " off") + '">' +
        '<input type="checkbox" data-era="' + e + '"' + (eraOn[e] ? " checked" : "") + '>' +
        '<span class="dot" style="background:' + ERA[e].color + '"></span>' +
        "<span>" + ERA[e].name + " " + ERA[e].range + "</span>" +
        '<span class="era-count">' + cnt + "</span></label>";
    });
    el.innerHTML = html;
    var inputs = el.querySelectorAll("input");
    for (var j = 0; j < inputs.length; j++) {
      inputs[j].addEventListener("change", function () {
        eraOn[this.dataset.era] = this.checked;
        this.parentNode.classList.toggle("off", !this.checked);
        applyFilter(); buildLineList(); updateStats(); updateTimelineUI();
      });
    }
  }
  function buildLineList() {
    var list = document.getElementById("line-list"), kw = searchKw.toLowerCase();
    var fs = allLines.filter(function (f) {
      var p = f.properties;
      if (!eraOn[p.era]) return false;
      if (!kw) return true;
      var hay = (p.name + " " + (p.short || "") + " " + (p.from || "") + " " + (p.to || "") + " " + (p.cities || []).join(" ") + " " + (p.province || []).join(" ")).toLowerCase();
      return hay.indexOf(kw) >= 0;
    }).sort(function (a, b) { return b.properties.openYear - a.properties.openYear; });
    if (!fs.length) list.innerHTML = '<div class="list-empty">没有匹配的线路</div>';
    else {
      list.innerHTML = fs.map(function (f) {
        var p = f.properties, c = eraColor(p.era);
        return '<button class="line-item" data-id="' + esc(p.id) + '" style="--c:' + c + '">' +
          '<div class="li-top"><span class="li-name">' + esc(p.short || p.name) + '</span>' +
          '<span class="li-year">' + p.openYear + "</span></div>" +
          '<div class="li-meta">' + esc(p.from || "") + " → " + esc(p.to || "") +
          (p.lengthKm ? " · " + p.lengthKm + " km" : "") + "</div></button>";
      }).join("");
    }
    var btns = list.querySelectorAll(".line-item");
    for (var i = 0; i < btns.length; i++) btns[i].addEventListener("click", function () {
      var old = document.querySelectorAll(".line-item.is-selected");
      for (var k = 0; k < old.length; k++) old[k].classList.remove("is-selected");
      this.classList.add("is-selected");
      focusLine(this.getAttribute("data-id"));
    });
    document.getElementById("list-count").textContent = "共 " + fs.length + " 条线路";
  }

  // ---------- 搜索 ----------
  var searchInput = document.getElementById("search"), searchResult = document.getElementById("searchResult");
  searchInput.addEventListener("input", function () {
    searchKw = this.value.trim();
    renderSearch(searchKw); buildLineList();
  });
  function renderSearch(q) {
    if (!q) { searchResult.innerHTML = ""; searchResult.classList.remove("has-hits"); return; }
    var lineHits = allLines.filter(function (f) {
      var p = f.properties;
      return (p.name + " " + (p.short || "") + " " + (p.from || "") + " " + (p.to || "") + " " + (p.cities || []).join(" ")).indexOf(q) >= 0;
    }).slice(0, 12);
    var cityHits = allStations.filter(function (f) { return f.properties.name.indexOf(q) >= 0; }).slice(0, 10);
    var html = "";
    lineHits.forEach(function (f) {
      var p = f.properties;
      html += '<li data-kind="line" data-id="' + esc(p.id) + '"><span>' + esc(p.short || p.name) + '</span><span class="tag ' + p.era + '">' + p.openYear + "</span></li>";
    });
    cityHits.forEach(function (f) {
      var p = f.properties;
      html += '<li data-kind="station" data-city="' + esc(p.name) + '"><span>' + esc(p.name) + '</span><span class="tag expansion">' + p.count + " 条</span></li>";
    });
    if (!html) html = '<li class="empty">无匹配线路或城市</li>';
    searchResult.innerHTML = html;
    searchResult.classList.add("has-hits");
  }
  searchResult.addEventListener("click", function (e) {
    var li = e.target.closest("li"); if (!li || !li.dataset.kind) return;
    searchResult.innerHTML = ""; searchResult.classList.remove("has-hits"); searchInput.value = ""; searchKw = "";
    if (li.dataset.kind === "line") focusLine(li.dataset.id);
    else focusStation(li.dataset.city);
    buildLineList();
  });

  // ---------- 右上角设置 ----------
  var optsBtn = document.getElementById("map-opts-btn"), optsPanel = document.getElementById("map-opts");
  optsBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = optsPanel.classList.toggle("open");
    this.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", function (e) { if (optsPanel.classList.contains("open") && !optsPanel.contains(e.target)) { optsPanel.classList.remove("open"); optsBtn.setAttribute("aria-expanded", "false"); } });
  function setVis(id, on) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); }
  function setBasemap(mode) {
    setVis("amap-img", mode === "img"); setVis("amap-vec", mode === "vec");
    var opts = document.querySelectorAll(".bm-opt");
    for (var i = 0; i < opts.length; i++) { var r = opts[i].querySelector("input"); if (r) opts[i].classList.toggle("active", r.checked); }
  }
  var bmRadios = document.querySelectorAll('input[name="basemap"]');
  for (var bi = 0; bi < bmRadios.length; bi++) bmRadios[bi].addEventListener("change", function () { setBasemap(this.value); });
  setBasemap("img");
  function bindToggle(id, fn) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("click", function () {
      var on = this.getAttribute("aria-pressed") !== "true";
      this.setAttribute("aria-pressed", String(on)); fn(on);
    });
  }
  bindToggle("toggleProv", function (on) { setVis("province-fill", on); setVis("province-line", on); });
  bindToggle("toggleStation", function (on) {
    stationOn = on;
    ["stations-glow", "stations-ring", "stations-core"].forEach(function (id) { setVis(id, on); });
    requestLabelUpdate();
  });
  bindToggle("toggleLabel", function (on) { labelOn = on; requestLabelUpdate(); });
  function setThick(on) {
    thick = on;
    var halo = ["interpolate", ["linear"], ["zoom"], 3, on ? 5 : 3, 5, on ? 8 : 4, 8, on ? 13 : 7];
    var main = ["interpolate", ["linear"], ["zoom"], 3, on ? 1.5 : 1, 5, on ? 2.6 : 1.6, 8, on ? 4.5 : 2.8, 12, on ? 6 : 4];
    if (map.getLayer("lines-halo")) map.setPaintProperty("lines-halo", "line-width", halo);
    if (map.getLayer("lines-main")) map.setPaintProperty("lines-main", "line-width", main);
    document.getElementById("thinLine").setAttribute("aria-pressed", String(!on));
    document.getElementById("thickLine").setAttribute("aria-pressed", String(on));
  }
  document.getElementById("thinLine").addEventListener("click", function () { setThick(false); });
  document.getElementById("thickLine").addEventListener("click", function () { setThick(true); });

  // ---------- 左侧抽屉 ----------
  var sidePanel = document.getElementById("side-panel");
  function collapsePanel() {
    sidePanel.classList.add("collapsed");
    document.getElementById("panel-open").setAttribute("aria-expanded", "false");
  }
  if (window.matchMedia("(max-width: 760px)").matches) {
    sidePanel.classList.add("collapsed");
    document.getElementById("drawer-handle").setAttribute("aria-expanded", "false");
  }
  document.getElementById("drawer-handle").addEventListener("click", function () {
    var c = sidePanel.classList.toggle("collapsed");
    this.setAttribute("aria-expanded", String(!c));
  });
  document.getElementById("panel-close").addEventListener("click", collapsePanel);
  document.getElementById("panel-open").addEventListener("click", function () {
    sidePanel.classList.remove("collapsed"); this.setAttribute("aria-expanded", "true");
  });

  // ---------- 时间轴 ----------
  var tlSlider = document.getElementById("tl-slider"), tlYear = document.getElementById("tl-year");
  var tlCum = document.getElementById("tl-cum"), tlPlay = document.getElementById("tl-play");
  var playing = false, playTimer = null;
  function updateTimelineUI() {
    tlSlider.value = viewYear;
    tlYear.textContent = viewYear + " 年";
    tlCum.innerHTML = "累计 <b>" + cumLines() + "</b> 条 · <b>" + (cumKm() / 10000).toFixed(1) + "</b> 万 km";
  }
  function setYear(y) {
    viewYear = y;
    tlSlider.value = y;
    applyFilter(); updateStats(); updateTimelineUI();
  }
  function onYearChange() { setYear(Number(tlSlider.value)); }
  tlSlider.addEventListener("input", onYearChange);
  function stopPlay() {
    playing = false; if (playTimer) clearInterval(playTimer); playTimer = null;
    tlPlay.classList.remove("playing"); tlPlay.textContent = "▶";
  }
  function startPlay() {
    if (viewYear >= MAX_YEAR) setYear(MIN_YEAR);
    playing = true; tlPlay.classList.add("playing"); tlPlay.textContent = "⏸";
    playTimer = setInterval(function () {
      if (viewYear >= MAX_YEAR) { stopPlay(); return; }
      setYear(viewYear + 1);
    }, 380);
  }
  tlPlay.addEventListener("click", function () { if (playing) stopPlay(); else startPlay(); });

  // ---------- 启动 ----------
  function refreshUI() {
    if (allLines.length) { updateStats(); buildEraFilter(); buildLineList(); updateTimelineUI(); }
    if (allStations.length) requestLabelUpdate();
  }
  map.on("load", function () {
    bindEvents();
    applyFilter();
    fetch("/maps/_shared/china-provinces.json").then(function (r) { return r.json(); }).then(function (geo) {
      var counts = {};
      allLines.forEach(function (f) {
        f.properties.province.forEach(function (p) { counts[p] = (counts[p] || 0) + 1; });
      });
      for (var i = 0; i < geo.features.length; i++) {
        var pname = geo.features[i].properties.name.replace(/(特别行政区|维吾尔自治区|壮族自治区|回族自治区|自治区|省|市)$/, "");
        geo.features[i].properties.railCount = counts[pname] || 0;
      }
      map.getSource("provinces").setData(geo);
    }).catch(function (e) { console.error("provinces 加载失败", e); });
    updateLabels();
  });
  fetch("data/lines.geojson").then(function (r) { return r.json(); }).then(function (fc) {
    allLines = fc.features; refreshUI();
  }).catch(function (e) { console.error("lines.geojson 加载失败", e); });
  fetch("data/stations.json").then(function (r) { return r.json(); }).then(function (fc) {
    allStations = fc.features; refreshUI();
  }).catch(function (e) { console.error("stations.json 加载失败", e); });
  map.on("move", requestLabelUpdate);
  map.on("zoom", requestLabelUpdate);
})();
