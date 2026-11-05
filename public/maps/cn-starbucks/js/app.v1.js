/* 全国星巴克门店分布图 · 互动逻辑
   城市气泡图：每城一个气泡，半径/颜色=门店数；省级密度面（按城市门店数汇总）；
   时间轴按城市 enterYear 回放扩张节奏；左侧城市目录按门店数排行；悬停/点击出玻璃详情卡。
   数据口径：城市级聚合（公开统计+合理估算，非逐店核对），详见正文 FAQ。 */
(function () {
  "use strict";

  // 门店数分级配色（蓝少 → 红多）
  function countColorExpr() {
    return ["interpolate", ["linear"], ["coalesce", ["get", "count"], 0],
      0, "#1e3a5f", 30, "#2f6d8f", 100, "#3ba3c9", 250, "#e0a83a", 500, "#e2622f", 1000, "#d33b27"];
  }
  // 气泡半径：zoom 必须是顶层 interpolate 的输入（MapLibre 限制：zoom 表达式不能嵌套在 * 内），
  // 故每个 zoom 档位的输出再各自是一段按 count 的 interpolate。
  function countRadiusExpr() {
    var byCount = function (s1, s2, s3, s4, s5, s6) {
      return ["interpolate", ["linear"], ["coalesce", ["get", "count"], 0],
        1, s1, 30, s2, 100, s3, 250, s4, 500, s5, 1200, s6];
    };
    return ["interpolate", ["linear"], ["zoom"],
      3, byCount(3, 5, 8, 11, 14, 21),
      9, byCount(6, 11, 17, 23, 30, 45),
      14, byCount(10, 17, 26, 36, 48, 72)
    ];
  }

  // 高德免 key 瓦片（GCJ-02，带 CORS）
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
      stores:     { type: "geojson", data: "data/stores.geojson" }
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#0b1220" } },
      { id: "amap-vec", type: "raster", source: "amap_vec", layout: { "visibility": "none" }, paint: { "raster-opacity": 1 } },
      { id: "amap-img", type: "raster", source: "amap_img", paint: { "raster-opacity": 1 } },
      {
        id: "province-fill", type: "fill", source: "provinces",
        paint: {
          "fill-color": ["interpolate", ["linear"], ["coalesce", ["get", "sbCount"], 0],
            0, "#0d1b30", 50, "#1d3b5c", 200, "#2f6d8f", 500, "#e0a83a", 900, "#e2622f", 1200, "#d33b27"],
          "fill-opacity": ["interpolate", ["linear"], ["zoom"],
            4.5, ["interpolate", ["linear"], ["coalesce", ["get", "sbCount"], 0],
                   0, 0.22, 50, 0.42, 200, 0.52, 600, 0.66, 1200, 0.80],
            7.0, 0
          ]
        }
      },
      { id: "province-line", type: "line", source: "provinces",
        paint: { "line-color": "#cbd5e1", "line-width": 0.8, "line-opacity": 0.85 } }
    ]
  };

  var map = new maplibregl.Map({
    container: "map", style: mapStyle,
    center: [112, 33], zoom: 3.7, minZoom: 2.8, maxZoom: 16, attributionControl: false
  });
  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
  map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-right");
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-right");
  window.__map = map;

  var labelsEl = document.createElement("div");
  labelsEl.id = "labels";
  map.getContainer().appendChild(labelsEl);

  // ---------- 状态 ----------
  var allStores = [], cityMeta = [], provCount = {};
  var viewYear = 2025;
  var labelOn = true;
  var popup = null, popupId = null, pinned = false;
  var rafPending = false;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function row(k, v) { if (v === "" || v == null) return ""; return '<tr><td class="k">' + k + "</td><td>" + v + "</td></tr>"; }

  // ---------- 城市详情卡（气泡点即城市） ----------
  function storePopupHTML(p) {
    var c = p.count;
    var col = ["#1e3a5f", "#2f6d8f", "#3ba3c9", "#e0a83a", "#e2622f", "#d33b27"][
      c >= 1000 ? 5 : c >= 500 ? 4 : c >= 250 ? 3 : c >= 100 ? 2 : c >= 30 ? 1 : 0];
    var ey = p.enterYear != null ? p.enterYear : (p.firstYear != null ? p.firstYear : "—");
    var est = p.est ? "（估算）" : "";
    var rows = "";
    rows += row("省　份", esc(p.province));
    rows += row("门店数", c + " 家" + est);
    rows += row("进入年份", ey + (p.est ? "（估算）" : ""));
    return '<div class="pop" style="--c:' + col + '">' +
      "<h3>" + esc(p.name || p.city) + '<span class="era-tag" style="background:' + col + '">' + c + " 家</span></h3>" +
      '<table class="kv">' + rows + "</table>" +
      '<div class="note">城市门店数为公开统计或合理估算（非逐店核对），仅列主要城市，长尾未单列；省级密度面按城市汇总。数据截至 2025 财年。</div>' +
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
    popup = new maplibregl.Popup({ offset: 12, closeButton: true, closeOnClick: false, className: "starbucks-popup", maxWidth: "300px" })
      .setLngLat(ll).setHTML(html || storePopupHTML(props)).addTo(map);
    popup.on("close", function () { popup = null; popupId = null; pinned = false; });
    popupId = props.id;
  }
  function removePopup() { if (popup) popup.remove(); popup = null; popupId = null; pinned = false; }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && popup && pinned) removePopup(); });

  // ---------- 气泡点交互 ----------
  function bindStoreEvents() {
    var hovered = null;
    map.on("mousemove", function (e) {
      var fs = map.queryRenderedFeatures(e.point, { layers: ["stores-circle"] });
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
      var fs = map.queryRenderedFeatures(e.point, { layers: ["stores-circle"] });
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

  // ---------- 城市标注（含门店数 badge，分级显隐 + 碰撞） ----------
  var CITY_MIN_DIST = 30;
  function updateLabels() {
    if (!labelOn) { labelsEl.innerHTML = ""; return; }
    var z = map.getZoom();
    var w = map.getCanvas().clientWidth, h = map.getCanvas().clientHeight;
    var bd = map.getBounds();
    var wmin = bd.getWest(), wmax = bd.getEast(), smin = bd.getSouth(), smax = bd.getNorth();
    var html = "", grid = {};
    if (cityMeta.length) {
      var cands = [];
      for (var i = 0; i < cityMeta.length; i++) {
        var c = cityMeta[i];
        if (c.firstYear > viewYear) continue;               // 年份过滤：未进入城市不显示
        var need = c.count >= 500 ? 3.0 : c.count >= 200 ? 3.6 : c.count >= 100 ? 4.2 : c.count >= 50 ? 5.0 : 6.2;
        if (z < need) continue;
        if (c.lng < wmin || c.lng > wmax || c.lat < smin || c.lat > smax) continue;
        var p = map.project([c.lng, c.lat]);
        if (p.x < 40 || p.x > w - 40 || p.y < 30 || p.y > h - 30) continue;
        cands.push({ c: c, x: p.x, y: p.y });
      }
      cands.sort(function (a, b) { return b.c.count - a.c.count; });
      var n = 0, MAX_CITY = 70;
      for (var k = 0; k < cands.length && n < MAX_CITY; k++) {
        var q = cands[k], gx = Math.floor(q.x / CITY_MIN_DIST), gy = Math.floor(q.y / CITY_MIN_DIST), hit = false;
        for (var ax = gx - 1; ax <= gx + 1 && !hit; ax++)
          for (var ay = gy - 1; ay <= gy + 1 && !hit; ay++) {
            var bucket = grid[ax + "," + ay];
            if (!bucket) continue;
            for (var bi = 0; bi < bucket.length; bi++) {
              var o = bucket[bi], ddx = o[0] - q.x, ddy = o[1] - q.y;
              if (ddx * ddx + ddy * ddy < CITY_MIN_DIST * CITY_MIN_DIST) { hit = true; break; }
            }
          }
        if (hit) continue;
        (grid[gx + "," + gy] || (grid[gx + "," + gy] = [])).push([q.x, q.y]);
        var cc = q.c.count > 0 ? '<span class="cc">' + q.c.count + "</span>" : "";
        html += '<div class="city-lbl" data-city="' + esc(q.c.city) + '" style="left:' + q.x + "px;top:" + q.y + 'px">' + esc(q.c.city) + cc + "</div>";
        n++;
      }
    }
    labelsEl.innerHTML = html;
    var els = labelsEl.querySelectorAll(".city-lbl");
    for (var m = 0; m < els.length; m++) {
      els[m].addEventListener("click", function () { focusCity(this.getAttribute("data-city"), null); });
    }
  }
  function requestLabelUpdate() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () { rafPending = false; updateLabels(); });
  }

  // ---------- 左侧目录：统计 + 城市排行 ----------
  function updateStats() {
    var total = 0;
    for (var i = 0; i < allStores.length; i++) total += allStores[i].properties.count;
    document.getElementById("stat-stores").textContent = total;
    document.getElementById("stat-cities").textContent = cityMeta.length;
    document.getElementById("stat-provs").textContent = Object.keys(provCount).length;
  }

  // 图例（替代阶段筛选）：门店数色阶
  function buildLegend() {
    var el = document.getElementById("era-filter");
    var stops = [[0, "#1e3a5f"], [30, "#2f6d8f"], [100, "#3ba3c9"], [250, "#e0a83a"], [500, "#e2622f"], [1000, "#d33b27"]];
    el.innerHTML = stops.map(function (s) {
      return '<span class="lg-item"><i style="background:' + s[1] + '"></i>' + (s[0] === 0 ? "<30" : (s[0] >= 1000 ? "≥1000" : s[0])) + "</span>";
    }).join("");
  }

  var searchKw = "", provFilter = "all";
  function buildCityList() {
    var list = document.getElementById("city-list");
    var kw = searchKw.toLowerCase();
    var cities = cityMeta.filter(function (c) {
      if (provFilter !== "all" && c.province !== provFilter) return false;
      if (!kw) return true;
      return c.city.toLowerCase().indexOf(kw) >= 0 || c.province.toLowerCase().indexOf(kw) >= 0;
    });
    cities.sort(function (a, b) { return b.count - a.count; });   // 按门店数降序
    var visibleCount = cities.length;
    if (!cities.length) { list.innerHTML = '<div class="list-empty">没有匹配的城市</div>'; }
    else {
      list.innerHTML = cities.map(function (c) {
        var meta = c.province + " · 进驻 " + c.firstYear;
        return '<button class="city-item" data-city="' + esc(c.city) + '">' +
          '<div class="ci-top"><span class="ci-name">' + esc(c.city) + '</span>' +
          '<span class="ci-count">' + c.count + " 家</span></div>" +
          '<div class="ci-meta">' + esc(meta) + "</div></button>";
      }).join("");
    }
    var btns = list.querySelectorAll(".city-item");
    for (var i = 0; i < btns.length; i++) btns[i].addEventListener("click", function () { focusCity(this.dataset.city, this); });
    document.getElementById("list-count").textContent = "共 " + visibleCount + " 座城市";
  }

  function focusCity(cityName, btn) {
    var c = null;
    for (var i = 0; i < cityMeta.length; i++) if (cityMeta[i].city === cityName) { c = cityMeta[i]; break; }
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
    // 每城单个气泡点：直接飞到城市坐标
    map.flyTo({ center: [c.lng, c.lat], zoom: 9.2, speed: 1.2, curve: 1.4 });
    map.once("moveend", function () {
      var st = null;
      for (var i = 0; i < allStores.length; i++) if (allStores[i].properties.name === cityName) { st = allStores[i]; break; }
      showPopup(st ? st.properties : { id: "city:" + c.city, name: c.city, province: c.province, count: c.count, enterYear: c.firstYear, est: false },
        [c.lng, c.lat]);
      pinned = true;
    });
  }

  // ---------- 年份过滤（时间轴） ----------
  function applyFilter() {
    if (!map.getLayer("stores-circle")) return;
    map.setFilter("stores-circle", ["<=", ["get", "enterYear"], viewYear]);
    if (map.getLayer("stores-halo")) map.setFilter("stores-halo", ["<=", ["get", "enterYear"], viewYear]);
    requestLabelUpdate();
  }

  // ---------- 搜索 ----------
  var searchInput = document.getElementById("search");
  var searchResult = document.getElementById("searchResult");
  function renderSearch(q) {
    if (!q) { searchResult.innerHTML = ""; searchResult.classList.remove("has-hits"); return; }
    var hits = cityMeta.filter(function (c) {
      return c.city.indexOf(q) >= 0 || c.province.indexOf(q) >= 0;
    }).slice(0, 20);
    if (!hits.length) { searchResult.innerHTML = '<li class="empty">无匹配城市</li>'; searchResult.classList.add("has-hits"); return; }
    searchResult.innerHTML = hits.map(function (c) {
      return '<li data-city="' + esc(c.city) + '" data-lng="' + c.lng + '" data-lat="' + c.lat + '">' +
        "<span>" + esc(c.city) + "</span>" +
        '<span class="tag">' + c.province + " · " + c.count + " 家</span></li>";
    }).join("");
    searchResult.classList.add("has-hits");
  }
  searchInput.addEventListener("input", function () { searchKw = this.value.trim(); renderSearch(searchKw); buildCityList(); });
  searchResult.addEventListener("click", function (e) {
    var li = e.target.closest("li"); if (!li || !li.dataset.city) return;
    var city = li.dataset.city, lng = Number(li.dataset.lng), lat = Number(li.dataset.lat);
    searchResult.innerHTML = ""; searchResult.classList.remove("has-hits"); searchInput.value = ""; searchKw = "";
    var c = null; for (var i = 0; i < cityMeta.length; i++) if (cityMeta[i].city === city) { c = cityMeta[i]; break; }
    map.flyTo({ center: [lng, lat], zoom: 9.2, speed: 1.2 });
    map.once("moveend", function () {
      showPopup({ id: "city:" + city, name: city, province: c ? c.province : "", count: c ? c.count : 0, enterYear: c ? c.firstYear : 0, est: false }, [lng, lat]);
      pinned = true;
    });
  });

  // ---------- 右上角：底图 / 叠加 ----------
  var optsBtn = document.getElementById("map-opts-btn");
  var optsPanel = document.getElementById("map-opts");
  function setOptsOpen(open) { optsPanel.classList.toggle("open", open); optsBtn.setAttribute("aria-expanded", String(open)); }
  optsBtn.addEventListener("click", function (e) { e.stopPropagation(); setOptsOpen(!optsPanel.classList.contains("open")); });
  document.addEventListener("click", function (e) { if (optsPanel.classList.contains("open") && !optsPanel.contains(e.target)) setOptsOpen(false); });

  function setVis(id, on) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); }
  function setBasemap(mode) {
    setVis("amap-img", mode === "img");
    setVis("amap-vec", mode === "vec");
    var opts = document.querySelectorAll(".bm-opt");
    for (var i = 0; i < opts.length; i++) { var r = opts[i].querySelector("input"); if (r) opts[i].classList.toggle("active", r.checked); }
  }
  var bmRadios = document.querySelectorAll('input[name="basemap"]');
  for (var bi = 0; bi < bmRadios.length; bi++) bmRadios[bi].addEventListener("change", function () { setBasemap(this.value); });
  var bmChecked = document.querySelector('input[name="basemap"]:checked');
  setBasemap(bmChecked ? bmChecked.value : "img");

  function bindToggle(id, fn) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("click", function () {
      var on = this.getAttribute("aria-pressed") !== "true";
      this.setAttribute("aria-pressed", String(on)); fn(on);
    });
  }
  bindToggle("toggleProv", function (on) { setVis("province-fill", on); });
  bindToggle("toggleLabel", function (on) { labelOn = on; requestLabelUpdate(); });

  // 省份筛选下拉
  var provSel = document.getElementById("prov-select");
  function buildProvSelect() {
    var byName = {};
    for (var i = 0; i < cityMeta.length; i++) {
      var p = cityMeta[i].province;
      byName[p] = (byName[p] || 0) + cityMeta[i].count;
    }
    var names = Object.keys(byName).sort(function (a, b) { return byName[b] - byName[a]; });
    provSel.innerHTML = '<option value="all">全部省份（' + names.length + '）</option>' +
      names.map(function (n) { return '<option value="' + esc(n) + '">' + esc(n) + "（" + byName[n] + "）</option>"; }).join("");
    provSel.addEventListener("change", function () { provFilter = this.value; buildCityList(); });
  }

  // ---------- 左侧目录开合 ----------
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
  function cumStores() {
    var n = 0;
    for (var i = 0; i < allStores.length; i++) {
      var p = allStores[i].properties;
      if (p.enterYear <= viewYear) n += p.count;
    }
    return n;
  }
  function updateTimelineUI() {
    tlSlider.value = viewYear;
    tlYear.textContent = viewYear + " 年";
    tlCum.innerHTML = "累计 <b>" + cumStores() + "</b> 家";
  }
  function onYearChange() {
    viewYear = Number(tlSlider.value);
    applyFilter(); updateTimelineUI();
  }
  tlSlider.addEventListener("input", onYearChange);
  function stopPlay() { playing = false; if (playTimer) clearInterval(playTimer); playTimer = null; tlPlay.classList.remove("playing"); tlPlay.textContent = "▶"; }
  function startPlay() {
    if (viewYear >= 2025) { viewYear = 1999; tlSlider.value = 1999; onYearChange(); }
    playing = true; tlPlay.classList.add("playing"); tlPlay.textContent = "⏸";
    playTimer = setInterval(function () {
      if (viewYear >= 2025) { stopPlay(); return; }
      viewYear++; tlSlider.value = viewYear; onYearChange();
    }, 420);
  }
  tlPlay.addEventListener("click", function () { if (playing) stopPlay(); else startPlay(); });

  // ---------- 启动 ----------
  function refreshUI() {
    if (allStores.length) {
      updateStats(); buildLegend(); buildProvSelect(); buildCityList(); updateLabels(); updateTimelineUI();
    }
  }

  map.on("load", function () {
    bindStoreEvents();
    fetch("/maps/_shared/china-provinces.json").then(function (r) { return r.json(); }).then(function (geo) {
      for (var i = 0; i < geo.features.length; i++) {
        var ad = geo.features[i].properties.adcode;
        geo.features[i].properties.sbCount = provCount[ad] || 0;
      }
      map.getSource("provinces").setData(geo);
    }).catch(function (e) { console.error("provinces 加载失败", e); });

    map.addLayer({
      id: "stores-halo", type: "circle", source: "stores",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 12, 6, 18, 10, 28, 14, 38],
        "circle-color": countColorExpr(),
        "circle-opacity": 0.18, "circle-blur": 0.6
      }
    });
    map.addLayer({
      id: "stores-circle", type: "circle", source: "stores",
      paint: {
        "circle-radius": countRadiusExpr(),
        "circle-color": countColorExpr(),
        "circle-stroke-width": ["case", ["boolean", ["feature-state", "hover"], false], 2.5, 1.4],
        "circle-stroke-color": "#0b1220",
        "circle-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.92],
        "circle-stroke-opacity": 1
      }
    });
    applyFilter();
  });

  fetch("data/stores.geojson").then(function (r) { return r.json(); }).then(function (fc) {
    allStores = fc.features;
    refreshUI();
  }).catch(function (e) { console.error("stores.geojson 加载失败", e); });

  fetch("data/cities.json").then(function (r) { return r.json(); }).then(function (d) {
    cityMeta = d.cities; provCount = d.provinceCount; refreshUI();
  }).catch(function (e) { console.error("cities.json 加载失败", e); });

  map.on("move", requestLabelUpdate);
  map.on("zoom", requestLabelUpdate);
})();
