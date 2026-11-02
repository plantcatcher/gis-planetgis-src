/* 全国苹果官方授权店分布图 · 互动逻辑
   暗色玻璃体系（复用 cn-rivers）：省级密度 choropleth（按门店数）+ 三级门店点
   （Apple Store 直营 / 优质经销商 APR / 授权经销商）+ 城市与门店标注 HTML 叠层；
   左侧城市目录（统计/层级筛选/省份筛选/搜索）+ 右上搜索/底图/叠加设置；
   点击弹玻璃详情卡；底部层级图例兼开关。移动端目录为底部抽屉。
   数据：Apple 官方「查找地点」服务抓取，坐标 GCJ-02（Apple 中国区基于高德），与高德底图同源。 */
(function () {
  "use strict";

  var KIND = {
    store: { name: "Apple Store", tag: "直营店", color: "#ffffff" },
    apr:   { name: "优质经销商", tag: "APR",   color: "#ffd60a" },
    auth:  { name: "授权经销商", tag: "授权店", color: "#3b9bff" }
  };
  var KIND_ORDER = ["store", "apr", "auth"];

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
      amap_vec:  { type: "raster", tiles: amapTiles(7), tileSize: 256, attribution: "高德地图" },
      amap_img:  { type: "raster", tiles: amapTiles(6), tileSize: 256, attribution: "高德地图" },
      provinces: { type: "geojson", data: "/maps/_shared/china-provinces.json" },
      stores:    { type: "geojson", data: "data/stores.geojson" }
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#08090c" } },
      { id: "amap-vec", type: "raster", source: "amap_vec", layout: { "visibility": "none" }, paint: { "raster-opacity": 1 } },
      { id: "amap-img", type: "raster", source: "amap_img", paint: { "raster-opacity": 1 } },
      // 省级密度面：按门店总数着色；随缩放淡出，放大后露出卫星底图
      {
        id: "province-fill", type: "fill", source: "provinces",
        paint: {
          "fill-color": ["interpolate", ["linear"], ["coalesce", ["get", "storeCount"], 0],
            0, "#0a1120", 10, "#0e2136", 40, "#12344e", 100, "#17496b", 200, "#1d6191", 340, "#2880b8"],
          "fill-opacity": ["interpolate", ["linear"], ["zoom"],
            4.2, ["interpolate", ["linear"], ["coalesce", ["get", "storeCount"], 0],
                    0, 0.06, 10, 0.10, 100, 0.15, 200, 0.19, 340, 0.23],
            6.8, 0
          ]
        }
      },
      { id: "province-line", type: "line", source: "provinces",
        paint: { "line-color": "#cbd5e1", "line-width": 0.7, "line-opacity": 0.7 } }
    ]
  };

  var map = new maplibregl.Map({
    container: "map", style: mapStyle,
    center: [104.5, 34.2], zoom: 3.25, minZoom: 2.6, maxZoom: 16, attributionControl: false
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
  var kindOn = { store: true, apr: true, auth: true };
  var countByKind = { store: 0, apr: 0, auth: 0 };
  var labelOn = true;
  var popup = null, popupId = null, pinned = false;
  var rafPending = false, lastLabelTs = 0;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function row(k, v) { if (v === "" || v == null) return ""; return '<tr><td class="k">' + k + "</td><td>" + v + "</td></tr>"; }

  function kindColor(k) { return KIND[k] ? KIND[k].color : "#94a3b8"; }
  function kindName(k) { return KIND[k] ? KIND[k].name : k; }

  // ---------- 查询图层（按缩放动态选当前可见的门店层） ----------
  function activeStoreLayers() {
    var out = [];
    if (kindOn.auth && map.getLayer("auth-circle")) out.push("auth-circle");
    if (kindOn.apr && map.getLayer("apr-circle")) out.push("apr-circle");
    if (kindOn.store && map.getLayer("store-circle")) out.push("store-circle");
    return out;
  }

  // ---------- 门店详情卡 ----------
  function storePopupHTML(p) {
    var c = kindColor(p.kind);
    var rows = "";
    rows += row("层　级", '<span class="kp" style="--c:' + c + '">' + esc(kindName(p.kind)) + "</span>");
    rows += row("城　市", esc(p.city) + " · " + esc(p.prov));
    if (p.dist && p.dist !== p.city) rows += row("区　县", esc(p.dist));
    rows += row("地　址", esc(p.addr));
    if (p.tel) rows += row("电　话", '<a href="tel:' + esc(p.tel) + '">' + esc(p.tel) + "</a>");
    return '<div class="pop" style="--c:' + c + '">' +
      "<h3>" + esc(p.name) + '<span class="kind-tag">' + esc(KIND[p.kind] ? KIND[p.kind].tag : p.kind) + "</span></h3>" +
      '<table class="kv">' + rows + "</table>" +
      '<div class="note">数据源：Apple 官方「查找地点」。坐标由 Apple Maps（中国区基于高德）提供，与卫星底图同源。</div>' +
      "</div>";
  }

  // ---------- 城市详情卡 ----------
  function cityPopupHTML(city) {
    var stores = allStores.filter(function (s) { return s.properties.city === city.city; })
      .sort(function (a, b) {
        var ra = KIND_ORDER.indexOf(a.properties.kind), rb = KIND_ORDER.indexOf(b.properties.kind);
        return ra !== rb ? ra - rb : a.properties.name.localeCompare(b.properties.name, "zh");
      });
    var show = stores.slice(0, 6);
    var rows = show.map(function (s) {
      var p = s.properties;
      return '<div class="store-row"><span class="dot" style="background:' + kindColor(p.kind) + '"></span>' +
        '<span class="sn">' + esc(p.name) + "</span></div>";
    }).join("");
    var more = stores.length > show.length ? '<div class="note">另有 ' + (stores.length - show.length) + " 家授权经销商未逐一列出。</div>" : "";
    return '<div class="pop" style="--c:var(--accent)">' +
      "<h3>" + esc(city.city) + '<span class="kind-tag">' + city.count + " 家</span></h3>" +
      '<table class="kv">' + row("省　份", esc(city.province)) +
      row("构　成", "直营 " + city.store + " · 优质经销商 " + city.apr + " · 授权 " + city.auth) + "</table>" +
      rows + more + "</div>";
  }

  function validLngLat(v) {
    if (!v) return null;
    if (Array.isArray(v) && v.length >= 2 && isFinite(v[0]) && isFinite(v[1])) return { lng: v[0], lat: v[1] };
    return (isFinite(v.lng) && isFinite(v.lat)) ? v : null;
  }
  function showPopup(props, lngLat, html) {
    var ll = validLngLat(lngLat) || map.getCenter();
    if (popup && popupId === props.id) { popup.setLngLat(ll); return; }
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ offset: 12, closeButton: true, closeOnClick: false, className: "apple-popup", maxWidth: "310px" })
      .setLngLat(ll).setHTML(html || storePopupHTML(props)).addTo(map);
    popup.on("close", function () { popup = null; popupId = null; pinned = false; });
    popupId = props.id;
  }
  function removePopup() { if (popup) popup.remove(); popup = null; popupId = null; pinned = false; }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && popup && pinned) removePopup(); });

  // ---------- 门店点交互 ----------
  function bindStoreEvents() {
    var hovered = null;
    function clearHover() {
      if (hovered != null) { try { map.setFeatureState({ source: "stores", id: hovered }, { hover: false }); } catch (e) {} hovered = null; }
    }
    map.on("mousemove", function (e) {
      var layers = activeStoreLayers();
      if (!layers.length) return;
      var fs = map.queryRenderedFeatures(e.point, { layers: layers });
      if (fs.length) {
        map.getCanvas().style.cursor = "pointer";
        var f = fs[0];
        if (hovered !== f.properties.id) {
          clearHover();
          hovered = f.properties.id;
          map.setFeatureState({ source: "stores", id: hovered }, { hover: true });
        }
        showPopup(f.properties, e.lngLat);
      } else {
        map.getCanvas().style.cursor = "";
        clearHover();
        if (!pinned) removePopup();
      }
    });
    map.on("click", function (e) {
      var layers = activeStoreLayers();
      var fs = layers.length ? map.queryRenderedFeatures(e.point, { layers: layers }) : [];
      if (fs.length) {
        var f = fs[0];
        clearHover();
        hovered = f.properties.id;
        map.setFeatureState({ source: "stores", id: hovered }, { hover: true });
        showPopup(f.properties, e.lngLat); pinned = true;
      } else {
        removePopup();
      }
    });
  }

  // ---------- 标注（城市 + 门店名，HTML 叠层） ----------
  var CITY_MIN_DIST = 30;
  var STORE_MIN_DIST = 24;
  var STORE_MIN_Z = 8.6;
  function updateLabels() {
    lastLabelTs = Date.now();
    if (!labelOn) { labelsEl.innerHTML = ""; return; }
    var z = map.getZoom();
    var w = map.getCanvas().clientWidth, h = map.getCanvas().clientHeight;
    var bd = map.getBounds();
    var wmin = bd.getWest(), wmax = bd.getEast(), smin = bd.getSouth(), smax = bd.getNorth();
    var html = "", grid = {};

    // 城市标注：门店越多越早出现
    if (cityMeta.length) {
      var cands = [];
      for (var i = 0; i < cityMeta.length; i++) {
        var c = cityMeta[i];
        var need = c.count >= 40 ? 3.1 : c.count >= 12 ? 3.7 : c.count >= 4 ? 4.8 : 6.0;
        if (z < need) continue;
        if (c.lng < wmin || c.lng > wmax || c.lat < smin || c.lat > smax) continue;
        var p = map.project([c.lng, c.lat]);
        if (p.x < 40 || p.x > w - 40 || p.y < 30 || p.y > h - 30) continue;
        cands.push({ c: c, x: p.x, y: p.y });
      }
      cands.sort(function (a, b) { return b.c.count - a.c.count; });
      var n = 0, MAX_CITY = 62;
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
        var nm = q.c.city.length > 6 ? q.c.city.slice(0, 5) + "…" : q.c.city;
        (grid[gx + "," + gy] || (grid[gx + "," + gy] = [])).push([q.x, q.y, nm.length * 12 + 26]);
        var cc = q.c.count > 1 ? '<span class="cc">' + q.c.count + "</span>" : "";
        html += '<div class="city-lbl" data-city="' + esc(q.c.city) + '" style="left:' + q.x + "px;top:" + q.y + 'px">' + esc(nm) + cc + "</div>";
        n++;
      }
    }

    // 门店名标注：放大到街区级才显示，直营店优先
    if (z >= STORE_MIN_Z && allStores.length) {
      var scands = [];
      var authMinZ = 10.6;   // 授权经销商数量巨大，需更高缩放才显示店名
      for (var s = 0; s < allStores.length; s++) {
        var f = allStores[s], fp = f.properties;
        if (!kindOn[fp.kind]) continue;
        if (fp.kind === "auth" && z < authMinZ) continue;
        var ll = f.geometry.coordinates;
        if (ll[0] < wmin || ll[0] > wmax || ll[1] < smin || ll[1] > smax) continue;
        var sp = map.project(ll);
        if (sp.x < 24 || sp.x > w - 24 || sp.y < 24 || sp.y > h - 24) continue;
        scands.push({ f: f, x: sp.x, y: sp.y + 12, pri: KIND_ORDER.indexOf(fp.kind) });
      }
      scands.sort(function (a, b) { return a.pri - b.pri; });
      var sn = 0, MAX_STORE = 46, gridHit = false;
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
        var spp = sq.f.properties;
        var shortName = spp.name.replace(/[-－—\s]*Apple\s*优质(合作商|经销商)\s*$/, "").trim();
        if (shortName.length > 14) shortName = shortName.slice(0, 13) + "…";
        // 按标签实际宽度做碰撞（每字约 11px + 内边距）
        var wTag = shortName.length * 11 + 14, hTag = 16;
        gridHit = false;
        var gx0 = Math.floor((sq.x - wTag / 2) / STORE_MIN_DIST), gx1 = Math.floor((sq.x + wTag / 2) / STORE_MIN_DIST);
        var gy0 = Math.floor((sq.y - hTag / 2) / STORE_MIN_DIST), gy1 = Math.floor((sq.y + hTag / 2) / STORE_MIN_DIST);
        for (var bx = gx0; bx <= gx1 && !gridHit; bx++)
          for (var by = gy0; by <= gy1 && !gridHit; by++) {
            var bb = grid[bx + "," + by];
            if (!bb) continue;
            for (var bj = 0; bj < bb.length; bj++) {
              var ob = bb[bj];
              if (Math.abs(ob[0] - sq.x) < (ob[2] + wTag) / 2 - 2 && Math.abs(ob[1] - sq.y) < (hTag + 14) / 2) { gridHit = true; break; }
            }
          }
        if (gridHit) continue;
        (grid[sgx + "," + sgy] || (grid[sgx + "," + sgy] = [])).push([sq.x, sq.y, wTag]);
        html += '<div class="store-lbl k-' + spp.kind + '" data-id="' + spp.id + '" style="left:' + sq.x + "px;top:" + sq.y + 'px">' + esc(shortName) + "</div>";
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
  function focusStore(id) {
    var s = null;
    for (var i = 0; i < allStores.length; i++) if (allStores[i].properties.id === id) { s = allStores[i]; break; }
    if (!s) return;
    showPopup(s.properties, s.geometry.coordinates); pinned = true;
  }
  function requestLabelUpdate() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      updateLabels();
    });
  }
  function throttledLabelUpdate() {
    if (rafPending) return;
    var now = Date.now();
    if (now - lastLabelTs < 110) return;
    requestLabelUpdate();
  }

  // ---------- 左侧目录 ----------
  function updateStats() {
    document.getElementById("stat-stores").textContent = allStores.length;
    document.getElementById("stat-direct").textContent = countByKind.store;
    document.getElementById("stat-cities").textContent = cityMeta.length;
    document.getElementById("stat-provs").textContent = Object.keys(provCount).length;
    var sc = document.getElementById("sub-count");
    if (sc) sc.textContent = allStores.length.toLocaleString("en-US");
  }

  function buildKindFilter() {
    var el = document.getElementById("kind-filter");
    el.innerHTML = KIND_ORDER.map(function (k) {
      return '<label class="era-check' + (kindOn[k] ? "" : " off") + '">' +
        '<input type="checkbox" data-kind="' + k + '"' + (kindOn[k] ? " checked" : "") + ">" +
        '<span class="dot" style="background:' + KIND[k].color + '"></span>' +
        "<span>" + KIND[k].name + "</span>" +
        '<span class="era-count">' + countByKind[k] + "</span></label>";
    }).join("");
    var inputs = el.querySelectorAll("input");
    for (var j = 0; j < inputs.length; j++) {
      inputs[j].addEventListener("change", function () {
        var e = this.dataset.kind;
        kindOn[e] = this.checked;
        this.parentNode.classList.toggle("off", !this.checked);
        applyFilter(); buildCityList(); renderLegend();
      });
    }
  }

  // 底部图例（兼开关）
  function renderLegend() {
    var el = document.getElementById("lg-items");
    if (!el) return;
    el.innerHTML = KIND_ORDER.map(function (k) {
      return '<button class="lg-item' + (kindOn[k] ? "" : " off") + '" data-kind="' + k + '" type="button">' +
        '<i style="background:' + KIND[k].color + '"></i><span>' + KIND[k].name + "</span>" +
        "<b>" + countByKind[k].toLocaleString("en-US") + "</b></button>";
    }).join("");
    var btns = el.querySelectorAll(".lg-item");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", function () {
        var k = this.dataset.kind;
        kindOn[k] = !kindOn[k];
        this.classList.toggle("off", !kindOn[k]);
        var cbi = document.querySelector('#kind-filter input[data-kind="' + k + '"]');
        if (cbi) { cbi.checked = kindOn[k]; cbi.parentNode.classList.toggle("off", !kindOn[k]); }
        applyFilter(); buildCityList();
      });
    }
  }

  var searchKw = "", provFilter = "all";
  function visibleCityCount(c) {
    return (c.store && kindOn.store ? c.store : 0) + (c.apr && kindOn.apr ? c.apr : 0) + (c.auth && kindOn.auth ? c.auth : 0);
  }
  function buildCityList() {
    var list = document.getElementById("city-list");
    var kw = searchKw.toLowerCase();
    var cities = cityMeta.filter(function (c) {
      if (provFilter !== "all" && c.province !== provFilter) return false;
      if (visibleCityCount(c) === 0) return false;
      if (!kw) return true;
      return c.city.toLowerCase().indexOf(kw) >= 0 || c.province.toLowerCase().indexOf(kw) >= 0;
    });
    if (!cities.length) {
      list.innerHTML = '<div class="list-empty">没有匹配的城市</div>';
    } else {
      list.innerHTML = cities.map(function (c) {
        var parts = [];
        if (c.store) parts.push('<em class="p-store">直营 ' + c.store + "</em>");
        if (c.apr) parts.push('<em class="p-apr">优质 ' + c.apr + "</em>");
        parts.push('<em class="p-auth">授权 ' + c.auth + "</em>");
        return '<button class="city-item" data-city="' + esc(c.city) + '">' +
          '<div class="ci-top"><span class="ci-name">' + esc(c.city) + '</span>' +
          '<span class="ci-count">' + visibleCityCount(c) + " 家</span></div>" +
          '<div class="ci-meta">' + esc(c.province) + "</div>" +
          '<div class="ci-kinds">' + parts.join("") + "</div></button>";
      }).join("");
    }
    var btns = list.querySelectorAll(".city-item");
    for (var i = 0; i < btns.length; i++) btns[i].addEventListener("click", function () { focusCity(this.dataset.city, this); });
    document.getElementById("list-count").textContent = "共 " + cities.length + " 座城市";
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
    var pts = [];
    for (var si = 0; si < allStores.length; si++) {
      var sp = allStores[si];
      if (sp.properties.city === cityName && kindOn[sp.properties.kind]) pts.push(sp.geometry.coordinates);
    }
    var focusCenter;
    if (pts.length >= 2) {
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (var pi = 0; pi < pts.length; pi++) {
        if (pts[pi][0] < minX) minX = pts[pi][0];
        if (pts[pi][0] > maxX) maxX = pts[pi][0];
        if (pts[pi][1] < minY) minY = pts[pi][1];
        if (pts[pi][1] > maxY) maxY = pts[pi][1];
      }
      focusCenter = [(minX + maxX) / 2, (minY + maxY) / 2];
      var pad = window.matchMedia("(max-width: 760px)").matches
        ? 55
        : { top: 70, right: 80, bottom: 92, left: 336 };
      map.fitBounds([[minX, minY], [maxX, maxY]], { padding: pad, maxZoom: 12, duration: 900 });
    } else if (pts.length === 1) {
      focusCenter = pts[0];
      map.flyTo({ center: pts[0], zoom: 12.2, speed: 1.1, curve: 1.4 });
    } else {
      focusCenter = [c.lng, c.lat];
      map.flyTo({ center: [c.lng, c.lat], zoom: 10.5, speed: 1.2 });
    }
    map.once("moveend", function () { showPopup({ id: "city:" + c.city }, focusCenter, cityPopupHTML(c)); pinned = true; });
  }

  // ---------- 图层可见性 ----------
  function applyFilter() {
    KIND_ORDER.forEach(function (k) {
      var id = k + "-circle";
      if (!map.getLayer(id)) return;
      map.setLayoutProperty(id, "visibility", kindOn[k] ? "visible" : "none");
    });
    if (map.getLayer("store-halo2")) map.setLayoutProperty("store-halo2", "visibility", kindOn.store ? "visible" : "none");
    requestLabelUpdate();
  }

  // ---------- 搜索 ----------
  var searchInput = document.getElementById("search");
  var searchResult = document.getElementById("searchResult");
  function renderSearch(q) {
    if (!q) { searchResult.innerHTML = ""; searchResult.classList.remove("has-hits"); return; }
    var hits = allStores.filter(function (s) {
      var p = s.properties;
      return (p.name && p.name.indexOf(q) >= 0) || (p.city && p.city.indexOf(q) >= 0) || (p.prov && p.prov.indexOf(q) >= 0);
    });
    var total = hits.length;
    hits = hits.slice(0, 26);
    if (!hits.length) { searchResult.innerHTML = '<li class="empty">无匹配门店</li>'; searchResult.classList.add("has-hits"); return; }
    var head = total > hits.length ? '<li class="s-head">匹配 ' + total + " 家，显示前 " + hits.length + " 条</li>" : "";
    searchResult.innerHTML = head + hits.map(function (s) {
      var p = s.properties;
      return '<li data-id="' + p.id + '" data-lng="' + s.geometry.coordinates[0] + '" data-lat="' + s.geometry.coordinates[1] + '">' +
        "<span>" + esc(p.name) + "</span>" +
        '<span class="tag k-' + p.kind + '">' + esc(p.city) + "</span></li>";
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
    map.flyTo({ center: [lng, lat], zoom: 12.4, speed: 1.2 });
    map.once("moveend", function () { showPopup(s.properties, [lng, lat]); pinned = true; });
  });

  // ---------- 右上角设置 ----------
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

  // ---------- 抽屉 ----------
  var sidePanel = document.getElementById("side-panel");
  var drawerHandle = document.getElementById("drawer-handle");
  if (window.matchMedia("(max-width: 760px)").matches) { sidePanel.classList.add("collapsed"); drawerHandle.setAttribute("aria-expanded", "false"); }
  drawerHandle.addEventListener("click", function () { var c = sidePanel.classList.toggle("collapsed"); this.setAttribute("aria-expanded", String(!c)); });
  document.getElementById("panel-close").addEventListener("click", function () { sidePanel.classList.add("collapsed"); document.getElementById("panel-open").setAttribute("aria-expanded", "false"); });
  document.getElementById("panel-open").addEventListener("click", function () { sidePanel.classList.remove("collapsed"); this.setAttribute("aria-expanded", "true"); });

  // ---------- 启动 ----------
  function refreshUI() {
    if (allStores.length && cityMeta.length) {
      updateStats(); buildKindFilter(); buildProvSelect(); buildCityList(); renderLegend(); updateLabels();
    }
  }

  map.on("load", function () {
    bindStoreEvents();
    fetch("/maps/_shared/china-provinces.json").then(function (r) { return r.json(); }).then(function (geo) {
      for (var i = 0; i < geo.features.length; i++) {
        var ad = geo.features[i].properties.adcode;
        geo.features[i].properties.storeCount = provCount[ad] || 0;
      }
      map.getSource("provinces").setData(geo);
    }).catch(function (e) { console.error("provinces 加载失败", e); });

    // 授权经销商（最小点，低缩放呈密度云）
    map.addLayer({
      id: "auth-circle", type: "circle", source: "stores",
      filter: ["==", ["get", "kind"], "auth"],
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 2.0, 5, 2.8, 7, 3.9, 10, 5.6, 14, 8.0],
        "circle-color": KIND.auth.color,
        "circle-opacity": ["interpolate", ["linear"], ["zoom"], 3, 0.62, 6, 0.78, 9, 0.9],
        "circle-blur": 0.18
      }
    });
    // 优质经销商 APR
    map.addLayer({
      id: "apr-circle", type: "circle", source: "stores",
      filter: ["==", ["get", "kind"], "apr"],
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 3.2, 5, 4.4, 7, 5.6, 10, 8, 14, 10.5],
        "circle-color": KIND.apr.color,
        "circle-stroke-width": 1.1,
        "circle-stroke-color": "#04121a",
        "circle-opacity": 0.95
      }
    });
    // Apple Store 直营：外层光晕
    map.addLayer({
      id: "store-halo2", type: "circle", source: "stores",
      filter: ["==", ["get", "kind"], "store"],
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 11, 6, 15, 10, 21, 14, 26],
        "circle-color": "#54b8ff",
        "circle-opacity": 0.42,
        "circle-blur": 0.85
      }
    });
    map.addLayer({
      id: "store-circle", type: "circle", source: "stores",
      filter: ["==", ["get", "kind"], "store"],
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 5.0, 6, 7.0, 10, 9.2, 14, 11.5],
        "circle-color": KIND.store.color,
        "circle-stroke-width": ["case", ["boolean", ["feature-state", "hover"], false], 3, 1.8],
        "circle-stroke-color": ["case", ["boolean", ["feature-state", "hover"], false], "#64d2ff", "#0a84ff"],
        "circle-opacity": 1
      }
    });
    // hover 时放大描边
    ["auth-circle", "apr-circle"].forEach(function (id) {
      map.setPaintProperty(id, "circle-stroke-width", ["case", ["boolean", ["feature-state", "hover"], false], 2.4, id === "apr-circle" ? 1.1 : 0]);
      map.setPaintProperty(id, "circle-stroke-color", ["case", ["boolean", ["feature-state", "hover"], false], "#ffffff", "#04121a"]);
    });
    applyFilter();
  });

  fetch("data/stores.geojson").then(function (r) { return r.json(); }).then(function (fc) {
    allStores = fc.features;
    countByKind = { store: 0, apr: 0, auth: 0 };
    for (var i = 0; i < allStores.length; i++) {
      var k = allStores[i].properties.kind;
      countByKind[k] = (countByKind[k] || 0) + 1;
    }
    refreshUI();
  }).catch(function (e) { console.error("stores.geojson 加载失败", e); });

  fetch("data/cities.json").then(function (r) { return r.json(); }).then(function (d) {
    cityMeta = d.cities; provCount = d.provinceCount; refreshUI();
  }).catch(function (e) { console.error("cities.json 加载失败", e); });

  map.on("move", throttledLabelUpdate);
  map.on("zoom", throttledLabelUpdate);
})();
