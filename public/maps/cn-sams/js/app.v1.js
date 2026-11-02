/* 全国山姆会员店分布图 · 互动逻辑
   暗色玻璃体系（复用 cn-rivers）：省级密度 choropleth（按门店数）+ 门店点（按拓店阶段着色）
   + 城市标注 HTML 叠层；左侧城市目录（统计/阶段筛选/省份筛选/搜索）+ 右上搜索/底图/叠加设置；
   点击弹玻璃详情卡；底部拓店年份时间轴滑块 + 播放。移动端目录为底部抽屉。 */
(function () {
  "use strict";

  var ERA = {
    pioneer:       { name: "拓荒期", range: "1996–2010", color: "#fbbf24" },
    expansion:     { name: "布局期", range: "2011–2019", color: "#60a5fa" },
    acceleration:  { name: "加速期", range: "2020–2023", color: "#34d399" },
    surge:         { name: "狂飙期", range: "2024–2026", color: "#f87171" }
  };
  var ERA_ORDER = ["pioneer", "expansion", "acceleration", "surge"];

  // 高德免 key 瓦片（GCJ-02，带 CORS），subdomain 01~04 负载均衡
  function amapTiles(styleId) {
    return ["01", "02", "03", "04"].map(function (s) {
      return "https://wprd" + s + ".is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=" + styleId;
    });
  }

  // ---------- 地图样式 ----------
  var mapStyle = {
    version: 8,
    sources: {
      amap_vec:  { type: "raster", tiles: amapTiles(7), tileSize: 256, attribution: "高德地图" },      // 矢量路网+注记
      amap_img:  { type: "raster", tiles: amapTiles(6), tileSize: 256, attribution: "高德地图" },      // 卫星影像(无标注)
      provinces: { type: "geojson", data: "/maps/_shared/china-provinces.json" },                      // 省界(可选叠加密度, GCJ-02)
      stores:     { type: "geojson", data: "data/stores.geojson" }                                        // 门店点(GCJ-02)
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#0b1220" } },
      { id: "amap-vec", type: "raster", source: "amap_vec", layout: { "visibility": "none" }, paint: { "raster-opacity": 1 } },
      { id: "amap-img", type: "raster", source: "amap_img", paint: { "raster-opacity": 1 } },
      // 省级密度面：按门店数渐变（无门店省极低透明），叠加在影像之上凸显分布
      {
        id: "province-fill", type: "fill", source: "provinces",
        paint: {
          "fill-color": ["interpolate", ["linear"], ["coalesce", ["get", "samsCount"], 0],
            0, "#0d1b30", 1, "#1d3b5c", 3, "#2f6d8f", 6, "#e0a83a", 10, "#e2622f", 13, "#d33b27"],
          // 随缩放淡出：全国级(<=4.5)显示密度底色，放大到城市级(>=7)渐隐为 0 露出卫星底图
          "fill-opacity": ["interpolate", ["linear"], ["zoom"],
            4.5, ["interpolate", ["linear"], ["coalesce", ["get", "samsCount"], 0],
                    0, 0.22, 1, 0.42, 3, 0.52, 6, 0.62, 13, 0.78],
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

  // 标注层注入到地图容器内（确保弹窗层级高于标注）
  var labelsEl = document.createElement("div");
  labelsEl.id = "labels";
  map.getContainer().appendChild(labelsEl);

  // ---------- 状态 ----------
  var allStores = [], cityMeta = [], provCount = {};
  var viewYear = 2026;
  var eraOn = {}; ERA_ORDER.forEach(function (e) { eraOn[e] = true; });
  var labelOn = true;
  var popup = null, popupId = null, pinned = false;
  var rafPending = false;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function row(k, v) { if (v === "" || v == null) return ""; return '<tr><td class="k">' + k + "</td><td>" + v + "</td></tr>"; }
  function eraName(e) { return ERA[e] ? ERA[e].name : e; }
  // 阶段 -> 颜色（用 case 表达式，兼容性优于 match）
  function eraColorExpr() {
    return ["case",
      ["==", ["get", "era"], "pioneer"], ERA.pioneer.color,
      ["==", ["get", "era"], "expansion"], ERA.expansion.color,
      ["==", ["get", "era"], "acceleration"], ERA.acceleration.color,
      ["==", ["get", "era"], "surge"], ERA.surge.color,
      "#ffffff"];
  }

  // ---------- 门店详情卡 ----------
  function storePopupHTML(p) {
    var c = ERA[p.era] ? ERA[p.era].color : "#f59e0b";
    var rows = "";
    rows += row("城　市", p.city + " · " + p.province);
    rows += row("地　址", esc(p.address));
    var oy = p.openYear != null ? String(p.openYear) : "—";
    if (p.openDate && p.openDate.length > 4) oy += "（" + p.openDate + "）";
    if (p.yearExact === false) oy += " 估算";
    rows += row("开业时间", oy);
    rows += row("全国序号", "第 " + (p.seq != null ? p.seq : "—") + " 家");
    return '<div class="pop" style="--c:' + c + '">' +
      "<h3>" + esc(p.name) + '<span class="era-tag ' + p.era + '">' + eraName(p.era) + "</span></h3>" +
      '<table class="kv">' + rows + "</table>" +
      '<div class="note">数据截至 2026-10（无锡江阴店 = 全国第 70 家）。空间定位为城市级，精确地址以门店详情为准。</div>' +
      "</div>";
  }

  // ---------- 城市详情卡（列出该城全部门店） ----------
  function cityPopupHTML(city) {
    var stores = allStores.filter(function (s) { return s.properties.city === city.city; })
      .sort(function (a, b) { return a.properties.openYear - b.properties.openYear; });
    var rows = stores.map(function (s) {
      var p = s.properties;
      return '<div class="store-row"><span class="sn">' + esc(p.name) +
        '</span><span class="sy">' + p.openYear + (p.yearExact === false ? "≈" : "") + "</span></div>";
    }).join("");
    return '<div class="pop" style="--c:var(--accent)">' +
      "<h3>" + esc(city.city) + '<span class="era-tag expansion">' + city.count + " 家</span></h3>" +
      '<table class="kv">' + row("省　份", city.province) + row("进驻年份", city.firstYear) + "</table>" +
      rows + "</div>";
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
    popup = new maplibregl.Popup({ offset: 12, closeButton: true, closeOnClick: false, className: "sams-popup", maxWidth: "300px" })
      .setLngLat(ll).setHTML(html || storePopupHTML(props)).addTo(map);
    popup.on("close", function () { popup = null; popupId = null; pinned = false; });
    popupId = props.id;
  }
  function removePopup() { if (popup) popup.remove(); popup = null; popupId = null; pinned = false; }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && popup && pinned) removePopup(); });

  // ---------- 门店点交互（hover 高亮 + 点击钉住） ----------
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

  // ---------- 城市 + 门店标注（HTML 叠层，分级显隐 + 碰撞） ----------
  var CITY_MIN_DIST = 30;   // 城市标注最小间距(px)
  var STORE_MIN_DIST = 22;  // 门店标注最小间距(px)
  var STORE_MIN_Z = 7;      // 缩放 >= 此值才显示门店名标注
  function isStoreVisible(p) { return p.openYear <= viewYear && eraOn[p.era]; }
  function updateLabels() {
    if (!labelOn) { labelsEl.innerHTML = ""; return; }
    var z = map.getZoom();
    var w = map.getCanvas().clientWidth, h = map.getCanvas().clientHeight;
    var bd = map.getBounds();
    var wmin = bd.getWest(), wmax = bd.getEast(), smin = bd.getSouth(), smax = bd.getNorth();
    var html = "", grid = {};
    // ---- 城市标注 ----
    if (cityMeta.length) {
      var cands = [];
      for (var i = 0; i < cityMeta.length; i++) {
        var c = cityMeta[i];
        // 门店数越多，越早显示标注：1 家 z>=5.5，2 家 z>=4.5，>=3 家 z>=3.6
        var need = c.count >= 3 ? 3.6 : (c.count === 2 ? 4.5 : 5.5);
        if (z < need) continue;
        if (c.lng < wmin || c.lng > wmax || c.lat < smin || c.lat > smax) continue;
        var p = map.project([c.lng, c.lat]);
        if (p.x < 40 || p.x > w - 40 || p.y < 30 || p.y > h - 30) continue;
        cands.push({ c: c, x: p.x, y: p.y });
      }
      cands.sort(function (a, b) { return b.c.count - a.c.count; });
      var n = 0, MAX_CITY = 60;
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
        var cc = q.c.count > 1 ? '<span class="cc">' + q.c.count + "</span>" : "";
        html += '<div class="city-lbl" data-city="' + esc(q.c.city) + '" style="left:' + q.x + "px;top:" + q.y + 'px">' + esc(q.c.city) + cc + "</div>";
        n++;
      }
    }
    // ---- 门店名标注（z>=STORE_MIN_Z 时显示，与城市标注共用碰撞网格，避免压住圆点/城市名） ----
    if (z >= STORE_MIN_Z && allStores.length) {
      var scands = [];
      for (var s = 0; s < allStores.length; s++) {
        var f = allStores[s], fp = f.properties;
        if (!isStoreVisible(fp)) continue;
        var ll = f.geometry.coordinates;
        if (ll[0] < wmin || ll[0] > wmax || ll[1] < smin || ll[1] > smax) continue;
        var sp = map.project(ll);
        if (sp.x < 24 || sp.x > w - 24 || sp.y < 24 || sp.y > h - 24) continue;
        scands.push({ f: f, x: sp.x, y: sp.y + 13 }); // 标注置于圆点下方
      }
      scands.sort(function (a, b) { return b.f.properties.openYear - a.f.properties.openYear; });
      var sn = 0, MAX_STORE = 90;
      for (var t = 0; t < scands.length && sn < MAX_STORE; t++) {
        var sq = scands[t], sgx = Math.floor(sq.x / STORE_MIN_DIST), sgy = Math.floor(sq.y / STORE_MIN_DIST), shit = false;
        for (var sax = sgx - 1; sax <= sgx + 1 && !shit; sax++)
          for (var say = sgy - 1; say <= sgy + 1 && !shit; say++) {
            var sb = grid[sax + "," + say];
            if (!sb) continue;
            for (var sbi = 0; sbi < sb.length; sbi++) {
              var so = sb[sbi], ddx2 = so[0] - sq.x, ddy2 = so[1] - sq.y;
              if (ddx2 * ddx2 + ddy2 * ddy2 < STORE_MIN_DIST * STORE_MIN_DIST) { shit = true; break; }
            }
          }
        if (shit) continue;
        (grid[sgx + "," + sgy] || (grid[sgx + "," + sgy] = [])).push([sq.x, sq.y]);
        html += '<div class="store-lbl" data-id="' + sq.f.properties.id + '" style="left:' + sq.x + "px;top:" + sq.y + 'px">' + esc(sq.f.properties.name) + "</div>";
        sn++;
      }
    }
    labelsEl.innerHTML = html;
    var els = labelsEl.querySelectorAll(".city-lbl");
    for (var m = 0; m < els.length; m++) {
      els[m].addEventListener("click", function () { focusCity(this.getAttribute("data-city"), null); });
    }
    var sels = labelsEl.querySelectorAll(".store-lbl");
    for (var mi = 0; mi < sels.length; mi++) {
      sels[mi].addEventListener("click", function () { focusStore(Number(this.getAttribute("data-id"))); });
    }
  }
  // 点击门店名标注 -> 钉住该店详情卡
  function focusStore(id) {
    var s = null;
    for (var i = 0; i < allStores.length; i++) if (allStores[i].properties.id === id) { s = allStores[i]; break; }
    if (!s) return;
    showPopup(s.properties, s.geometry.coordinates); pinned = true;
  }
  function requestLabelUpdate() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () { rafPending = false; updateLabels(); });
  }

  // ---------- 左侧目录：统计 + 阶段筛选 + 城市排名 ----------
  function updateStats() {
    document.getElementById("stat-stores").textContent = allStores.length;
    document.getElementById("stat-cities").textContent = cityMeta.length;
    document.getElementById("stat-provs").textContent = Object.keys(provCount).length;
  }

  function buildEraFilter() {
    var el = document.getElementById("era-filter");
    var html = "";
    ERA_ORDER.forEach(function (e) {
      var cnt = 0;
      for (var i = 0; i < allStores.length; i++) if (allStores[i].properties.era === e) cnt++;
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
        var e = this.dataset.era;
        eraOn[e] = this.checked;
        this.parentNode.classList.toggle("off", !this.checked);
        applyFilter(); buildCityList();
      });
    }
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
    // 仅显示有可见门店（阶段筛选 + 年份）的城市，但年份筛选下已开城市仍列出
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
    // 缩放到该城市门店点的实际分布范围（而非固定城市级缩放）
    var pts = [];
    for (var si = 0; si < allStores.length; si++) {
      if (allStores[si].properties.city === cityName) pts.push(allStores[si].geometry.coordinates);
    }
    var focusCenter, focusZoom;
    if (pts.length >= 2) {
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (var pi = 0; pi < pts.length; pi++) {
        if (pts[pi][0] < minX) minX = pts[pi][0];
        if (pts[pi][0] > maxX) maxX = pts[pi][0];
        if (pts[pi][1] < minY) minY = pts[pi][1];
        if (pts[pi][1] > maxY) maxY = pts[pi][1];
      }
      focusCenter = [(minX + maxX) / 2, (minY + maxY) / 2];
      map.fitBounds([[minX, minY], [maxX, maxY]], { padding: 70, maxZoom: 12, duration: 900 });
    } else if (pts.length === 1) {
      focusCenter = pts[0];
      map.flyTo({ center: pts[0], zoom: 11.5, speed: 1.1, curve: 1.4 });
    } else {
      focusCenter = [c.lng, c.lat];
      map.flyTo({ center: [c.lng, c.lat], zoom: 9.2, speed: 1.2 });
    }
    map.once("moveend", function () { showPopup({ id: "city:" + c.city }, focusCenter, cityPopupHTML(c)); pinned = true; });
  }

  // ---------- 图层可见性：年份 + 阶段 ----------
  function applyFilter() {
    if (!map.getLayer("stores-circle")) return;
    var eraExpr = ["any"];
    ERA_ORDER.forEach(function (e) { if (eraOn[e]) eraExpr.push(["==", ["get", "era"], e]); });
    map.setFilter("stores-circle", ["all", ["<=", ["get", "openYear"], viewYear], eraExpr]);
    if (map.getLayer("stores-halo")) map.setFilter("stores-halo", ["all", ["<=", ["get", "openYear"], viewYear], eraExpr]);
    requestLabelUpdate(); // 阶段/年份变化时同步刷新门店标注
  }

  // ---------- 搜索（下拉结果） ----------
  var searchInput = document.getElementById("search");
  var searchResult = document.getElementById("searchResult");
  function renderSearch(q) {
    if (!q) { searchResult.innerHTML = ""; searchResult.classList.remove("has-hits"); return; }
    var hits = allStores.filter(function (s) {
      var p = s.properties;
      return (p.name && p.name.indexOf(q) >= 0) || (p.city && p.city.indexOf(q) >= 0) || (p.province && p.province.indexOf(q) >= 0);
    }).slice(0, 30);
    if (!hits.length) { searchResult.innerHTML = '<li class="empty">无匹配门店</li>'; searchResult.classList.add("has-hits"); return; }
    searchResult.innerHTML = hits.map(function (s) {
      var p = s.properties;
      return '<li data-id="' + p.id + '" data-lng="' + s.geometry.coordinates[0] + '" data-lat="' + s.geometry.coordinates[1] + '">' +
        "<span>" + esc(p.name) + "</span>" +
        '<span class="tag ' + p.era + '">' + p.city + "</span></li>";
    }).join("");
    searchResult.classList.add("has-hits");
  }
  searchInput.addEventListener("input", function () { searchKw = this.value.trim(); renderSearch(searchKw); buildCityList(); });
  searchResult.addEventListener("click", function (e) {
    var li = e.target.closest("li"); if (!li || !li.dataset.id) return;
    var id = Number(li.dataset.id), lng = Number(li.dataset.lng), lat = Number(li.dataset.lat);
    var s = null;
    for (var i = 0; i < allStores.length; i++) if (allStores[i].properties.id === id) { s = allStores[i]; break; }
    searchResult.innerHTML = ""; searchResult.classList.remove("has-hits"); searchInput.value = "";
    if (!s) return;
    map.flyTo({ center: [lng, lat], zoom: 11, speed: 1.2 });
    map.once("moveend", function () { showPopup(s.properties, [lng, lat]); pinned = true; });
  });

  // ---------- 右上角：底图 / 叠加设置 ----------
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

  // 省份筛选下拉（从 cityMeta 派生省份名->计数，provCount 为 adcode 键供 choropleth 使用）
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

  // ---------- 左侧目录开合（移动端抽屉） ----------
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
      if (p.openYear <= viewYear && eraOn[p.era]) n++;
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
    if (viewYear >= 2026) { viewYear = 1996; tlSlider.value = 1996; onYearChange(); }
    playing = true; tlPlay.classList.add("playing"); tlPlay.textContent = "⏸";
    playTimer = setInterval(function () {
      if (viewYear >= 2026) { stopPlay(); return; }
      viewYear++; tlSlider.value = viewYear; onYearChange();
    }, 420);
  }
  tlPlay.addEventListener("click", function () { if (playing) stopPlay(); else startPlay(); });

  // ---------- 启动 ----------
  function refreshUI() {
    if (allStores.length) {
      updateStats(); buildEraFilter(); buildProvSelect(); buildCityList(); updateLabels(); updateTimelineUI();
    }
  }

  map.on("load", function () {
    bindStoreEvents();
    // 省级密度：拉取共享省界，注入门店计数
    fetch("/maps/_shared/china-provinces.json").then(function (r) { return r.json(); }).then(function (geo) {
      for (var i = 0; i < geo.features.length; i++) {
        var ad = geo.features[i].properties.adcode;
        geo.features[i].properties.samsCount = provCount[ad] || 0;
      }
      map.getSource("provinces").setData(geo);
    }).catch(function (e) { console.error("provinces 加载失败", e); });

    // 门店点图层（数据源经 style 中的 stores 加载，这里仅挂图层）
    map.addLayer({
      id: "stores-halo", type: "circle", source: "stores",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 9, 6, 13, 10, 20, 14, 26],
        "circle-color": eraColorExpr(),
        "circle-opacity": 0.18, "circle-blur": 0.6
      }
    });
    map.addLayer({
      id: "stores-circle", type: "circle", source: "stores",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 5, 6, 7, 10, 9, 14, 11],
        "circle-color": eraColorExpr(),
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
