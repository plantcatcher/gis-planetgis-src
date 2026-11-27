/* 全球手机区号地图 · 互动逻辑
   国界面按 ITU 编号区（区号首位数字）着色；点国家看完整 E.164 呼叫代码。
   区号口径：ITU-T E.164 国家呼叫代码，即国际拨号时加在号码前的 +86 / +1。
   合规：国界数据沿用本站统一底图，台湾已并入中国；港澳台作为中国的地区号列入详情卡。 */
(function () {
  "use strict";

  // 编号区配色：低饱和区分色，东亚（中国所在区）用金色突出；无码地区贴近背景。
  var ZCOLORS = {
    "1": "#28527a", "2": "#2e6b5e", "3": "#55518a", "4": "#34678f",
    "5": "#7a4f6b", "6": "#2d7280", "7": "#6b5f8a", "8": "#b58b3a", "9": "#8a6b3f"
  };
  var NONE_COLOR = "#111827";
  var ZONE_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  var isMobile = window.innerWidth <= 760;
  var INIT_ZOOM = isMobile ? 0.15 : 1.5;
  var MIN_ZOOM = isMobile ? 0 : 1.5;
  var ESRI_IMG = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  var ESRI_RELIEF = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}";

  var baseColor = ["case", ["==", ["get", "zone"], ""], NONE_COLOR,
    ["match", ["get", "zone"],
      "1", ZCOLORS["1"], "2", ZCOLORS["2"], "3", ZCOLORS["3"],
      "4", ZCOLORS["4"], "5", ZCOLORS["5"], "6", ZCOLORS["6"],
      "7", ZCOLORS["7"], "8", ZCOLORS["8"], "9", ZCOLORS["9"], NONE_COLOR]];

  var mapStyle = {
    version: 8,
    sources: {
      esri_img: { type: "raster", tiles: [ESRI_IMG], tileSize: 256, attribution: "Esri World Imagery" },
      esri_relief: { type: "raster", tiles: [ESRI_RELIEF], tileSize: 256, attribution: "Esri World Shaded Relief" },
      countries: { type: "geojson", data: "data/countries.geojson" }
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
          "fill-color": baseColor,
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 1.5, 0.68, 4.5, 0.5, 7.5, 0.22]
        }
      },
      { id: "country-line", type: "line", source: "countries",
        paint: { "line-color": "#93a9bd", "line-width": 0.55, "line-opacity": 0.42 } },
      {
        id: "country-outline", type: "line", source: "countries",
        paint: {
          "line-color": "#e6f6ff",
          "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 2.4,
            ["boolean", ["feature-state", "hover"], false], 1.6, 0],
          "line-opacity": ["case",
            ["any", ["boolean", ["feature-state", "selected"], false], ["boolean", ["feature-state", "hover"], false]], 0.95, 0]
        }
      }
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
  var rows = [], meta = {}, rowById = {}, codeToRows = {};
  var zoneFilter = "all", searchKw = "", labelOn = true;
  var popup = null, popupId = null, pinned = false, hoveredId = null, selectedId = null;
  var rafPending = false;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function row(k, v) { if (v === "" || v == null) return ""; return '<tr><td class="k">' + k + "</td><td>" + v + "</td></tr>"; }
  /** properties 里的数组被 MapLibre 序列化成 JSON 字符串，统一防御解析。 */
  function asArray(v) {
    if (Array.isArray(v)) return v;
    if (typeof v === "string") { try { var p = JSON.parse(v); return Array.isArray(p) ? p : []; } catch (e) { return []; } }
    return [];
  }
  function zoneColor(z) { return ZCOLORS[z] || NONE_COLOR; }
  function codeLabel(r) { return r.dial ? "+" + r.dial : "无区号"; }

  // ---------- 详情卡 ----------
  function popupHTML(r) {
    var z = r.zone || "";
    var col = z ? zoneColor(z) : "#64748b";
    var html = '<div class="pop" style="--c:' + col + '">';
    html += '<div class="bigcode">' + (r.dial ? "+" + r.dial : "—") + "</div>";
    html += "<h3>" + esc(r.name) + '<span class="era-tag" style="background:' + col + ';color:#08111d">' +
      (z ? "编号区 " + z : "无国家代码") + "</span></h3>";
    var t = "";
    t += row("国家 / 地区", esc(r.name) + (r.en && r.en !== r.name ? " · " + esc(r.en) : ""));
    t += row("国际区号", r.dial ? "+" + r.dial : "无（南极洲）");
    t += row("编号区", z ? z + " · " + esc((meta.zoneNames || {})[z] || "") : "无");
    t += row("ISO 代码", esc(r.a2 || "—"));
    if (r.dial) t += row("共用区号", esc(String(r.share || 1)) + " 个国家和地区使用 " + codeLabel(r));
    html += '<table class="kv">' + t + "</table>";
    if (r.regions && r.regions.length) {
      html += '<div class="region-list"><span class="rl-title">中国的地区号</span>' +
        r.regions.map(function (x) { return '<span class="rl-item">' + esc(x.name) + " <b>+" + esc(x.code) + "</b></span>"; }).join("") + "</div>";
    }
    html += '<div class="note">' + esc(r.note || "区号取 ITU-T E.164 国家呼叫代码。国界数据已将台湾并入中国。") +
      " 拨打国际电话时，先拨本国国际出局码（中国为 00），再拨目的国家代码与号码；手机里输入 + 号即代表出局码。</div>";
    html += "</div>";
    return html;
  }

  function setFeatureId(id, key, on) {
    if (id == null) return;
    var s = {}; s[key] = !!on;
    try { map.setFeatureState({ source: "countries", id: id }, s); } catch (e) {}
  }

  function showPopup(r, lngLat, id) {
    if (!lngLat || !isFinite(lngLat[0]) || !isFinite(lngLat[1])) lngLat = map.getCenter().toArray();
    if (selectedId != null && selectedId !== id) setFeatureId(selectedId, "selected", false);
    if (id != null) { selectedId = id; setFeatureId(id, "selected", true); }
    if (popup && popupId === r.dial + "|" + r.name) { popup.setLngLat(lngLat); return; }
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ offset: 10, closeButton: true, closeOnClick: false, className: "mcd-popup", maxWidth: "340px" })
      .setLngLat(lngLat).setHTML(popupHTML(r)).addTo(map);
    popup.on("close", function () {
      popup = null; popupId = null; pinned = false;
      if (selectedId != null) { setFeatureId(selectedId, "selected", false); selectedId = null; }
    });
    popupId = r.dial + "|" + r.name;
  }
  function removePopup() {
    if (popup) popup.remove();
    popup = null; popupId = null; pinned = false;
    if (selectedId != null) { setFeatureId(selectedId, "selected", false); selectedId = null; }
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && popup && pinned) removePopup(); });

  function rowByFeature(f) {
    var p = f.properties;
    var dial = p.dial == null ? "" : String(p.dial);
    var key = dial + "|" + (p.name_zh || p.name);
    return rowById[key] || null;
  }

  function bindCountryEvents() {
    map.on("mousemove", function (e) {
      var fs = map.queryRenderedFeatures(e.point, { layers: ["country-fill"] });
      if (fs.length) {
        map.getCanvas().style.cursor = "pointer";
        var f = fs[0], fid = f.id;
        if (hoveredId !== fid) {
          if (hoveredId != null) setFeatureId(hoveredId, "hover", false);
          hoveredId = fid; setFeatureId(hoveredId, "hover", true);
        }
        if (!pinned) {
          var r = rowByFeature(f);
          if (r) showPopup(r, e.lngLat.toArray(), fid);
        }
      } else {
        map.getCanvas().style.cursor = "";
        if (hoveredId != null) { setFeatureId(hoveredId, "hover", false); hoveredId = null; }
        if (!pinned) removePopup();
      }
    });
    map.on("click", function (e) {
      var fs = map.queryRenderedFeatures(e.point, { layers: ["country-fill"] });
      if (fs.length) {
        var f = fs[0], r = rowByFeature(f);
        if (r) { showPopup(r, e.lngLat.toArray(), f.id); pinned = true; }
      } else removePopup();
    });
  }

  // ---------- 标注：区号 + 国名，碰撞网格 ----------
  var LBL_MIN_DIST = isMobile ? 52 : 78;
  function updateLabels() {
    if (!labelOn) { labelsEl.innerHTML = ""; return; }
    var z = map.getZoom(), w = map.getCanvas().clientWidth, h = map.getCanvas().clientHeight;
    var leftEdge = w > 760 ? 322 : 40;
    var need = isMobile ? 2.6 : 2.1;
    if (z < need) { labelsEl.innerHTML = ""; return; }
    var cands = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var c = asArray(r.center);
      if (c.length < 2 || !isFinite(c[0])) continue;
      for (var k = -1; k <= 1; k++) {
        var p = map.project([c[0] + k * 360, c[1]]);
        if (p.x < leftEdge || p.x > w - 44 || p.y < 24 || p.y > h - 24) continue;
        cands.push({ r: r, x: p.x, y: p.y, rank: (r.dial ? 0 : 2) + (String(r.dial || "").length <= 2 ? 0 : 1) });
      }
    }
    cands.sort(function (a, b) { return a.rank - b.rank || a.r.name.localeCompare(b.r.name, "zh"); });
    var html = "", grid = {}, n = 0, MAX = isMobile ? 14 : 38;
    for (var q = 0; q < cands.length && n < MAX; q++) {
      var t = cands[q];
      var gx = Math.floor(t.x / LBL_MIN_DIST), gy = Math.floor(t.y / LBL_MIN_DIST), hit = false;
      for (var ax = gx - 1; ax <= gx + 1 && !hit; ax++)
        for (var ay = gy - 1; ay <= gy + 1 && !hit; ay++) {
          var bucket = grid[ax + "," + ay];
          if (!bucket) continue;
          for (var bi = 0; bi < bucket.length; bi++) {
            var o = bucket[bi], ddx = o[0] - t.x, ddy = o[1] - t.y;
            if (ddx * ddx + ddy * ddy < LBL_MIN_DIST * LBL_MIN_DIST) { hit = true; break; }
          }
        }
      if (hit) continue;
      (grid[gx + "," + gy] || (grid[gx + "," + gy] = [])).push([t.x, t.y]);
      var key = (t.r.dial || "") + "|" + t.r.name;
      html += '<div class="city-lbl" data-key="' + esc(key) + '" style="left:' + t.x + "px;top:" + t.y + 'px">' +
        esc(t.r.name) + '<span class="cc">' + (t.r.dial ? "+" + esc(t.r.dial) : "—") + "</span></div>";
      n++;
    }
    labelsEl.innerHTML = html;
    var els = labelsEl.querySelectorAll(".city-lbl");
    for (var m = 0; m < els.length; m++) {
      els[m].addEventListener("click", function () { focusRow(rowById[this.getAttribute("data-key")], null); });
    }
  }
  function requestLabelUpdate() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () { rafPending = false; updateLabels(); });
  }

  // ---------- 左侧目录 ----------
  function updateStats() {
    document.getElementById("stat-countries").textContent = meta.countries || rows.length;
    document.getElementById("stat-codes").textContent = meta.coded || 0;
    document.getElementById("stat-zones").textContent = meta.zones || 0;
    var share = 0;
    for (var i = 0; i < rows.length; i++) if ((rows[i].share || 0) > 1 && rows[i].dial) share++;
    document.getElementById("stat-share").textContent = share;
  }
  function buildZoneFilter() {
    var el = document.getElementById("zone-filter");
    var h = '<button class="lg-item zone-chip' + (zoneFilter === "all" ? " active" : "") + '" data-zone="all">' +
      '<i class="chip-all"></i>全部</button>';
    for (var i = 0; i < ZONE_KEYS.length; i++) {
      var z = ZONE_KEYS[i];
      h += '<button class="lg-item zone-chip' + (zoneFilter === z ? " active" : "") + '" data-zone="' + z +
        '" title="' + esc((meta.zoneNames || {})[z] || "") + '"><i style="background:' + zoneColor(z) + '"></i>' + z + "</button>";
    }
    el.innerHTML = h;
    var btns = el.querySelectorAll(".zone-chip");
    for (var j = 0; j < btns.length; j++) btns[j].addEventListener("click", function () { setZoneFilter(this.getAttribute("data-zone")); });
  }
  function buildZoneSelect() {
    var sel = document.getElementById("zone-select");
    var names = meta.zoneNames || {};
    var h = '<option value="all">全部编号区（' + rows.length + "）</option>";
    for (var i = 0; i < ZONE_KEYS.length; i++) {
      var z = ZONE_KEYS[i], n = 0;
      for (var j = 0; j < rows.length; j++) if (rows[j].zone === z) n++;
      h += '<option value="' + z + '">' + z + " · " + esc(names[z] || "") + "（" + n + "）</option>";
    }
    h += '<option value="none">无国家代码（1）</option>';
    sel.innerHTML = h;
    sel.addEventListener("change", function () { setZoneFilter(this.value); });
  }
  function setZoneFilter(z) {
    zoneFilter = z;
    document.getElementById("zone-select").value = z;
    buildZoneFilter();
    var f = z === "all" ? null : ["==", ["get", "zone"], z === "none" ? "" : z];
    ["country-fill", "country-line", "country-outline"].forEach(function (id) {
      if (map.getLayer(id)) map.setFilter(id, f);
    });
    buildMarketList(); requestLabelUpdate();
  }
  function matchRow(r, kw) {
    if (!kw) return true;
    var q = kw.toLowerCase();
    if (r.name.toLowerCase().indexOf(q) >= 0) return true;
    if ((r.en || "").toLowerCase().indexOf(q) >= 0) return true;
    if ((r.a2 || "").toLowerCase() === q) return true;
    if (r.dial && (r.dial === q || ("+" + r.dial) === q || ("00" + r.dial) === q)) return true;
    if (r.dial && r.dial.indexOf(q) >= 0 && q.length >= 2) return true;
    return false;
  }
  function buildMarketList() {
    var list = document.getElementById("city-list"), kw = searchKw.toLowerCase();
    var items = rows.filter(function (r) {
      if (zoneFilter === "none" && r.dial) return false;
      if (zoneFilter !== "all" && zoneFilter !== "none" && r.zone !== zoneFilter) return false;
      return matchRow(r, kw);
    });
    items.sort(function (a, b) {
      var an = a.dial ? Number(a.dial) : 9999, bn = b.dial ? Number(b.dial) : 9999;
      return an - bn || a.name.localeCompare(b.name, "zh");
    });
    if (!items.length) list.innerHTML = '<div class="list-empty">没有匹配的国家或区号</div>';
    else {
      list.innerHTML = items.map(function (r) {
        var key = (r.dial || "") + "|" + r.name;
        var meta2 = r.dial ? (r.zone ? "编号区 " + r.zone : "") + (r.share > 1 ? " · " + r.share + " 国共用" : "")
          : "无国家呼叫代码";
        return '<button class="city-item" data-key="' + esc(key) + '"' +
          (r.dial ? ' style="border-left-color:' + zoneColor(r.zone) + '"' : "") + ">" +
          '<div class="ci-top"><span class="ci-name">' + esc(r.name) + "</span>" +
          '<span class="ci-count">' + (r.dial ? "+" + esc(r.dial) : "—") + "</span></div>" +
          '<div class="ci-meta">' + esc(meta2) + "</div></button>";
      }).join("");
    }
    var btns = list.querySelectorAll(".city-item");
    for (var i = 0; i < btns.length; i++) btns[i].addEventListener("click", function () {
      focusRow(rowById[this.getAttribute("data-key")], this);
    });
    document.getElementById("list-count").textContent = "共 " + items.length + " 个国家/地区" +
      (zoneFilter === "all" ? " · 按区号升序" : " · 已按编号区筛选");
  }
  function focusRow(r, btn) {
    if (!r) return;
    var c = asArray(r.center);
    if (c.length < 2 || !isFinite(c[0])) return;
    if (window.matchMedia("(max-width: 760px)").matches) {
      sidePanel.classList.add("collapsed");
      document.getElementById("panel-open").setAttribute("aria-expanded", "false");
    }
    if (btn) {
      var old = document.querySelectorAll(".city-item.is-selected");
      for (var k = 0; k < old.length; k++) old[k].classList.remove("is-selected");
      btn.classList.add("is-selected");
    }
    map.flyTo({ center: c, zoom: Math.max(map.getZoom(), 3.6), speed: 1.2, curve: 1.4 });
    map.once("moveend", function () {
      var f = null;
      try {
        var fs = map.queryRenderedFeatures(map.project(c), { layers: ["country-fill"] });
        f = fs.length ? fs[0] : null;
      } catch (e) {}
      showPopup(r, c, f ? f.id : null); pinned = true;
    });
  }

  // ---------- 搜索 ----------
  var searchInput = document.getElementById("search"), searchResult = document.getElementById("searchResult");
  function renderSearch(q) {
    if (!q) { searchResult.innerHTML = ""; searchResult.classList.remove("has-hits"); return; }
    var hits = rows.filter(function (r) { return matchRow(r, q); }).slice(0, 20);
    if (!hits.length) { searchResult.innerHTML = '<li class="empty">无匹配国家 / 区号</li>'; searchResult.classList.add("has-hits"); return; }
    searchResult.innerHTML = hits.map(function (r) {
      return '<li data-key="' + esc((r.dial || "") + "|" + r.name) + '"><span>' + esc(r.name) +
        (r.en && r.en !== r.name ? " <em>" + esc(r.en) + "</em>" : "") + "</span>" +
        '<span class="tag">' + (r.dial ? "+" + esc(r.dial) : "—") + "</span></li>";
    }).join("");
    searchResult.classList.add("has-hits");
  }
  searchInput.addEventListener("input", function () { searchKw = this.value.trim(); renderSearch(searchKw); buildMarketList(); });
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { var first = searchResult.querySelector("li[data-key]"); if (first) first.click(); }
  });
  searchResult.addEventListener("click", function (e) {
    var li = e.target.closest("li[data-key]"); if (!li) return;
    var r = rowById[li.getAttribute("data-key")];
    searchResult.innerHTML = ""; searchResult.classList.remove("has-hits"); searchInput.value = ""; searchKw = "";
    buildMarketList();
    focusRow(r, null);
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
  bindToggle("toggleFill", function (on) { setVis("country-fill", on); setVis("country-line", on); setVis("country-outline", on); });
  bindToggle("toggleLabel", function (on) { labelOn = on; requestLabelUpdate(); });

  // ---------- 目录开合 ----------
  var sidePanel = document.getElementById("side-panel"), drawerHandle = document.getElementById("drawer-handle");
  if (isMobile) { sidePanel.classList.add("collapsed"); drawerHandle.setAttribute("aria-expanded", "false"); }
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

  // ---------- 启动 ----------
  map.on("load", function () { bindCountryEvents(); buildZoneFilter(); buildZoneSelect(); });
  fetch("data/codes.json").then(function (r) { return r.json(); }).then(function (d) {
    meta = d.meta; rows = d.rows;
    for (var i = 0; i < rows.length; i++) {
      rowById[(rows[i].dial || "") + "|" + rows[i].name] = rows[i];
      if (rows[i].dial) (codeToRows[rows[i].dial] || (codeToRows[rows[i].dial] = [])).push(rows[i]);
    }
    updateStats(); buildZoneFilter(); buildZoneSelect(); buildMarketList();
  }).catch(function (e) { console.error("codes.json 加载失败", e); });
  map.on("move", requestLabelUpdate);
  map.on("zoom", requestLabelUpdate);
})();
