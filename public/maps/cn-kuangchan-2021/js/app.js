/* 全国矿产分布互动地图 · 表现层
   数据：public/maps/cn-kuangchan-2021/data/minerals.json
        （公开版《全国矿产地分布（2021版）》名录，228,188 处有效矿产地，WGS84）
   边界：/maps/_shared/china-provinces.json（省界，全站共用）
        /maps/house-price/data/cities-geo.json（70 个地级市界，跨图复用）
   坐标系：源数据 WGS84；底图是高德 GCJ-02，故**渲染前统一 wgs84ToGcj02 配准**
        （矿产地点位 / 省界 / 市界全部转换，漏一个就整体偏 ~500 m）。
   体积：逐点属性全部字典化，坐标按 0.001° 整数化，单文件 16 MB（gzip ≈ 3.8 MB）。
   功能：矿种大类多选（11 类）+ 规模 / 利用现状 / 省份 / 城市级联筛选、名称搜索、
        散点 / 热力双模式、点选浮窗（名称 / 矿种 / 规模 / 现状 / 工作程度 / 成因 / 坐标）、
        省级排行榜、行政边界开关。 */
(function () {
  "use strict";

  /* ── 高德瓦片子域：wprd01~wprd04 ── */
  function amapTiles(styleId) {
    return ["01", "02", "03", "04"].map(function (s) {
      return "https://wprd" + s + ".is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=" + styleId;
    });
  }

  /* ── 坐标系配准：WGS84 → GCJ-02 ── */
  var GCJ_A = 6378245.0;
  var GCJ_EE = 0.00669342162296594323;
  function gcjOutOfChina(lng, lat) {
    return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
  }
  function gcjTransformLat(x, y) {
    var r = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
    r += (20 * Math.sin(y * Math.PI) + 40 * Math.sin(y / 3 * Math.PI)) * 2 / 3;
    r += (160 * Math.sin(y / 12 * Math.PI) + 320 * Math.sin(y * Math.PI / 30)) * 2 / 3;
    return r;
  }
  function gcjTransformLng(x, y) {
    var r = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
    r += (20 * Math.sin(x * Math.PI) + 40 * Math.sin(x / 3 * Math.PI)) * 2 / 3;
    r += (150 * Math.sin(x / 12 * Math.PI) + 300 * Math.sin(x / 30 * Math.PI)) * 2 / 3;
    return r;
  }
  function wgs84ToGcj02(lng, lat) {
    if (gcjOutOfChina(lng, lat)) return [lng, lat];
    var dLat = gcjTransformLat(lng - 105, lat - 35);
    var dLng = gcjTransformLng(lng - 105, lat - 35);
    var radLat = lat / 180 * Math.PI;
    var magic = Math.sin(radLat);
    magic = 1 - GCJ_EE * magic * magic;
    var sq = Math.sqrt(magic);
    dLat = (dLat * 180) / ((GCJ_A * (1 - GCJ_EE)) / (magic * sq) * Math.PI);
    dLng = (dLng * 180) / (GCJ_A / sq * Math.cos(radLat) * Math.PI);
    return [lng + dLng, lat + dLat];
  }
  function shiftRing(ring) {
    for (var i = 0; i < ring.length; i++) {
      var p = wgs84ToGcj02(ring[i][0], ring[i][1]);
      ring[i][0] = p[0];
      ring[i][1] = p[1];
    }
  }
  function shiftGeometry(g) {
    if (!g) return g;
    if (g.type === "Point") {
      var q = wgs84ToGcj02(g.coordinates[0], g.coordinates[1]);
      g.coordinates[0] = q[0];
      g.coordinates[1] = q[1];
    } else if (g.type === "Polygon") {
      for (var i = 0; i < g.coordinates.length; i++) shiftRing(g.coordinates[i]);
    } else if (g.type === "MultiPolygon") {
      for (var a = 0; a < g.coordinates.length; a++) {
        for (var b = 0; b < g.coordinates[a].length; b++) shiftRing(g.coordinates[a][b]);
      }
    }
    return g;
  }
  function shiftFeatures(fc) {
    var fs = (fc && fc.features) || [];
    for (var i = 0; i < fs.length; i++) shiftGeometry(fs[i].geometry);
    return fc;
  }
  function geomBBox(geom) {
    var minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
    (function walk(coords) {
      if (typeof coords[0] === "number") {
        if (coords[0] < minx) minx = coords[0];
        if (coords[0] > maxx) maxx = coords[0];
        if (coords[1] < miny) miny = coords[1];
        if (coords[1] > maxy) maxy = coords[1];
        return;
      }
      for (var i = 0; i < coords.length; i++) walk(coords[i]);
    })(geom.coordinates);
    return [minx, miny, maxx, maxy];
  }

  /* ── 地图样式：深色 / 卫星影像 / 矢量路网 ── */
  var style = {
    version: 8,
    sources: {
      amap_img: { type: "raster", tiles: amapTiles(6), tileSize: 256, attribution: "高德地图" },
      amap_vec: { type: "raster", tiles: amapTiles(7), tileSize: 256, attribution: "高德地图" }
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#0c0906" } },
      { id: "amap-img", type: "raster", source: "amap_img", layout: { visibility: "none" }, paint: { "raster-opacity": 1 } },
      { id: "amap-vec", type: "raster", source: "amap_vec", layout: { visibility: "none" }, paint: { "raster-opacity": 1 } }
    ]
  };

  var map = new maplibregl.Map({
    container: "map",
    style: style,
    center: [104.5, 34.5],
    zoom: 3.6,
    minZoom: 2.5,
    maxZoom: 14,
    maxBounds: [[60, 5], [145, 60]],
    attributionControl: false,
    dragRotate: false,
    pitchWithRotate: false
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

  function setBasemap(mode) {
    map.setLayoutProperty("amap-img", "visibility", mode === "img" ? "visible" : "none");
    map.setLayoutProperty("amap-vec", "visibility", mode === "vec" ? "visible" : "none");
    map.setPaintProperty("bg", "background-color", mode === "none" ? "#0c0906" : "#ffffff");
  }

  var bmSeg = document.getElementById("basemapSeg");
  bmSeg.addEventListener("click", function (e) {
    var btn = e.target.closest(".seg-btn");
    if (!btn) return;
    [].forEach.call(bmSeg.querySelectorAll(".seg-btn"), function (b) { b.classList.remove("active"); });
    btn.classList.add("active");
    setBasemap(btn.getAttribute("data-bm"));
  });

  var modeSeg = document.getElementById("modeSeg");
  modeSeg.addEventListener("click", function (e) {
    var btn = e.target.closest(".seg-btn");
    if (!btn) return;
    [].forEach.call(modeSeg.querySelectorAll(".seg-btn"), function (b) { b.classList.remove("active"); });
    btn.classList.add("active");
    setMode(btn.getAttribute("data-mode"));
  });

  function setMode(mode) {
    if (!map.getLayer("dep-pt")) return;
    var heat = mode === "heat";
    map.setLayoutProperty("dep-heat", "visibility", heat ? "visible" : "none");
    // 热力模式下把散点透明化但仍保留点击命中，避免"看得见点不着"
    map.setPaintProperty("dep-pt", "circle-opacity", heat ? 0 : ["interpolate", ["linear"], ["zoom"], 3, 0.7, 8, 0.8, 12, 0.9]);
    map.setPaintProperty("dep-pt", "circle-stroke-opacity", heat ? 0 : 0.35);
  }

  /* ── 数据状态 ── */
  var DATA = null;
  var PTS = [];
  var FEATURES = [];
  var groupOn = [];
  var scaleSel = -1;
  var useSel = -1;
  var provSel = -1;
  var citySel = -1;
  var searchIds = null;
  var provGeom = {};
  var cityGeom = {};

  function buildFeatures() {
    var kinds = DATA.kinds, names = DATA.names, pts = PTS;
    var out = new Array(pts.length);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      var lon = p[0] / 1000, lat = p[1] / 1000;
      var g = wgs84ToGcj02(lon, lat);
      out[i] = {
        type: "Feature",
        id: i,
        geometry: { type: "Point", coordinates: [+g[0].toFixed(5), +g[1].toFixed(5)] },
        properties: {
          g: kinds[p[2]] ? kinds[p[2]].g : DATA.groups.length - 1,
          k: [p[2], p[3], p[4]],
          sc: p[5],
          us: p[6],
          ge: p[7],
          gn: p[8],
          p: p[9],
          c: p[10],
          n: names[p[11]] || ""
        }
      };
    }
    return out;
  }

  function groupColorExpr() {
    var m = ["match", ["get", "g"]];
    for (var i = 0; i < DATA.groups.length; i++) m.push(i, DATA.groups[i].color);
    m.push("#adb5bd"); // default
    return m;
  }

  // 规模索引：0 超大型 / 1 特大型 / 2 大型 / 3 中型 / 4 小型 / 5 矿点 / 6 矿化点 / 7 未标注
  function radiusExpr() {
    function byScale(z) {
      var base = [3.2, 2.6, 2.2, 1.7, 1.4, 1.2, 1.1, 1.1];
      var arr = ["match", ["get", "sc"]];
      for (var i = 0; i < base.length; i++) arr.push(i, +(base[i] * z).toFixed(2));
      arr.push(1.2);
      return arr;
    }
    return ["interpolate", ["linear"], ["zoom"],
      3, byScale(1),
      7, byScale(1.6),
      11, byScale(2.6),
      14, byScale(4)
    ];
  }

  /* ── 筛选：命中计数与图层过滤 ── */
  function groupOf(p) {
    return DATA.kinds[p[2]] ? DATA.kinds[p[2]].g : DATA.groups.length - 1;
  }

  function matches(p) {
    if (!groupOn[groupOf(p)]) return false;
    if (scaleSel >= 0 && p[5] !== scaleSel) return false;
    if (useSel >= 0 && p[6] !== useSel) return false;
    if (provSel >= 0 && p[9] !== provSel) return false;
    if (citySel >= 0 && p[10] !== citySel) return false;
    return true;
  }

  function buildFilter() {
    var f = ["all"];
    var gsel = [];
    for (var i = 0; i < groupOn.length; i++) if (groupOn[i]) gsel.push(i);
    f.push(["match", ["get", "g"], gsel.length ? gsel : [-1], true, false]);
    if (scaleSel >= 0) f.push(["==", ["get", "sc"], scaleSel]);
    if (useSel >= 0) f.push(["==", ["get", "us"], useSel]);
    if (provSel >= 0) f.push(["==", ["get", "p"], provSel]);
    if (citySel >= 0) f.push(["==", ["get", "c"], citySel]);
    if (searchIds && searchIds.length) f.push(["match", ["id"], searchIds, true, false]);
    return f;
  }

  function applyFilter() {
    var n = 0;
    for (var i = 0; i < PTS.length; i++) if (matches(PTS[i])) n++;
    var f = buildFilter();
    if (map.getLayer("dep-pt")) map.setFilter("dep-pt", f);
    if (map.getLayer("dep-heat")) map.setFilter("dep-heat", f);
    var el = document.getElementById("countLabel");
    if (el) {
      var total = PTS.length;
      el.textContent = "当前显示 " + n.toLocaleString("en-US") + " 处 / 共 " +
        total.toLocaleString("en-US") + " 处（" + (n / total * 100).toFixed(1) + "%）";
    }
    return n;
  }

  /* ── 名称搜索：命中 names 后按 feature.id 过滤（限制 4000 条防表达式过大） ── */
  var SEARCH_CAP = 4000;
  function doSearch() {
    var kw = (document.getElementById("searchInput").value || "").trim().toLowerCase();
    searchIds = null;
    if (kw) {
      var names = DATA.names, ids = [];
      for (var i = 0; i < PTS.length; i++) {
        var nm = names[PTS[i][11]];
        if (nm && nm.toLowerCase().indexOf(kw) !== -1) {
          ids.push(i);
          if (ids.length >= SEARCH_CAP) break;
        }
      }
      searchIds = ids;
    }
    var n = applyFilter();
    if (searchIds && searchIds.length) {
      var first = PTS[searchIds[0]];
      var g = wgs84ToGcj02(first[0] / 1000, first[1] / 1000);
      map.flyTo({ center: g, zoom: Math.max(map.getZoom(), 9), duration: 700 });
    } else if (kw) {
      var lbl = document.getElementById("countLabel");
      if (lbl) lbl.textContent = "没有匹配的矿产地，换个关键词试试";
    }
  }
  document.getElementById("searchBtn").addEventListener("click", doSearch);
  document.getElementById("searchInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") doSearch();
  });

  /* ── 下拉构建（省份 / 城市级联，规模，利用现状） ── */
  function fillSelect(sel, items, placeholder) {
    sel.innerHTML = "";
    var ph = document.createElement("option");
    ph.value = "";
    ph.textContent = placeholder;
    sel.appendChild(ph);
    items.forEach(function (it) {
      var o = document.createElement("option");
      o.value = it.value;
      o.textContent = it.label;
      sel.appendChild(o);
    });
  }

  function buildFilters(pgj, cgj) {
    var provs = DATA.provinces.map(function (p) {
      return { value: String(p.a), label: p.n + "（" + p.t.toLocaleString("en-US") + "）" };
    });
    provs.sort(function (a, b) { return a.label.localeCompare(b.label, "zh"); });
    fillSelect(document.getElementById("provSelect"), provs, "全部省份");

    var citiesAll = DATA.cities.map(function (c) {
      return { value: String(c.p), city: c, label: c.n + "（" + c.t.toLocaleString("en-US") + "）" };
    });
    citiesAll.sort(function (a, b) { return a.label.localeCompare(b.label, "zh"); });

    function fillCity(provAdcode) {
      var sel = document.getElementById("citySelect");
      var list = citiesAll.filter(function (x) { return !provAdcode || x.value === provAdcode; });
      fillSelect(sel, list.map(function (x) {
        return { value: String(x.city.a), label: x.label };
      }), "全部城市");
    }
    fillCity("");
    window.__fillCity = fillCity;

    fillSelect(document.getElementById("scaleSelect"),
      DATA.scales.map(function (s, i) { return { value: String(i), label: s.t + "（" + s.n.toLocaleString("en-US") + "）" }; }),
      "全部规模");
    fillSelect(document.getElementById("useSelect"),
      DATA.uses.map(function (u, i) { return { value: String(i), label: u.t + "（" + u.n.toLocaleString("en-US") + "）" }; }),
      "全部现状");
  }

  document.getElementById("provSelect").addEventListener("change", function () {
    var v = this.value;
    window.__fillCity(v);
    provSel = -1;
    citySel = -1;
    if (v) {
      for (var i = 0; i < DATA.provinces.length; i++) {
        if (String(DATA.provinces[i].a) === v) { provSel = i; break; }
      }
      var geom = provGeom[v];
      if (geom) {
        var b = geomBBox(geom);
        map.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: 60, maxZoom: 9, duration: 600 });
      }
    }
    applyFilter();
    syncRank();
  });

  document.getElementById("citySelect").addEventListener("change", function () {
    var v = this.value;
    citySel = -1;
    if (v) {
      for (var i = 0; i < DATA.cities.length; i++) {
        if (String(DATA.cities[i].a) === v) { citySel = i; break; }
      }
      var geom = cityGeom[v];
      if (geom) {
        var b = geomBBox(geom);
        map.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: 60, maxZoom: 11, duration: 600 });
      }
    }
    applyFilter();
    syncRank();
  });

  document.getElementById("scaleSelect").addEventListener("change", function () {
    scaleSel = this.value === "" ? -1 : +this.value;
    applyFilter();
  });
  document.getElementById("useSelect").addEventListener("change", function () {
    useSel = this.value === "" ? -1 : +this.value;
    applyFilter();
  });

  /* ── 矿种大类多选 ── */
  function buildGroupChecks() {
    var box = document.getElementById("typeChecks");
    box.innerHTML = "";
    DATA.groups.forEach(function (g, i) {
      groupOn[i] = true;
      var label = document.createElement("label");
      label.className = "type-check";
      label.innerHTML =
        '<input type="checkbox" value="' + i + '" checked>' +
        '<i style="background:' + g.color + '"></i>' + g.label +
        '<em>' + g.n.toLocaleString("en-US") + '</em>';
      box.appendChild(label);
    });
    box.addEventListener("change", function (e) {
      var inp = e.target;
      if (inp && inp.type === "checkbox") {
        groupOn[+inp.value] = inp.checked;
        applyFilter();
      }
    });
  }
  document.getElementById("typeAll").addEventListener("click", function () {
    var anyOn = groupOn.some(function (v) { return v; });
    var next = !anyOn;
    groupOn = groupOn.map(function () { return next; });
    [].forEach.call(document.querySelectorAll("#typeChecks input"), function (inp) { inp.checked = next; });
    this.textContent = next ? "全不选" : "全选";
    applyFilter();
  });

  document.getElementById("resetBtn").addEventListener("click", function () {
    document.getElementById("provSelect").value = "";
    window.__fillCity("");
    document.getElementById("citySelect").value = "";
    document.getElementById("scaleSelect").value = "";
    document.getElementById("useSelect").value = "";
    document.getElementById("searchInput").value = "";
    scaleSel = useSel = provSel = citySel = -1;
    searchIds = null;
    groupOn = groupOn.map(function () { return true; });
    [].forEach.call(document.querySelectorAll("#typeChecks input"), function (inp) { inp.checked = true; });
    document.getElementById("typeAll").textContent = "全不选";
    applyFilter();
    syncRank();
    map.fitBounds([[73, 17], [136, 54]], { padding: 20, duration: 700 });
  });

  /* ── 省级排行榜：按矿产地总数降序，点击即筛选 ── */
  var RANK_MAX = 12;
  function buildRank() {
    var box = document.getElementById("rankList");
    box.innerHTML = "";
    var top = DATA.provinces.slice(0, RANK_MAX);
    var max = top.length ? top[0].t : 1;
    top.forEach(function (p, i) {
      var row = document.createElement("div");
      row.className = "rank-row";
      row.setAttribute("data-idx", String(DATA.provinces.indexOf(p)));
      row.innerHTML =
        '<span class="rank-idx">' + (i + 1) + '</span>' +
        '<span><span class="rank-name">' + p.n + '</span>' +
        '<span class="rank-bar"><i style="width:' + (p.t / max * 100).toFixed(1) + '%"></i></span></span>' +
        '<span class="rank-val">' + p.t.toLocaleString("en-US") + '</span>';
      row.addEventListener("click", function () {
        var idx = +row.getAttribute("data-idx");
        var sel = document.getElementById("provSelect");
        var ad = String(DATA.provinces[idx].a);
        if (provSel === idx) {                 // 再点一次 -> 取消筛选
          sel.value = "";
          provSel = -1;
        } else {
          sel.value = ad;
          provSel = idx;
        }
        window.__fillCity(sel.value);
        citySel = -1;
        document.getElementById("citySelect").value = "";
        var geom = provGeom[ad];
        if (geom) {
          var b = geomBBox(geom);
          map.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: 60, maxZoom: 9, duration: 600 });
        }
        applyFilter();
        syncRank();
      });
      box.appendChild(row);
    });
  }
  function syncRank() {
    var rows = document.querySelectorAll("#rankList .rank-row");
    [].forEach.call(rows, function (r) {
      r.classList.toggle("active", +r.getAttribute("data-idx") === provSel);
    });
  }

  /* ── 统计卡 ── */
  function buildFacts() {
    var big = 0, mining = 0;
    DATA.scales.forEach(function (s, i) { if (i <= 2) big += s.n; });
    DATA.uses.forEach(function (u) { if (u.t === "正在开采") mining += u.n; });
    var box = document.getElementById("facts");
    box.innerHTML =
      '<span><small>矿产地</small><b>' + (DATA.meta.total / 10000).toFixed(1) + ' 万</b><i>处（有效坐标）</i></span>' +
      '<span><small>矿种</small><b>' + DATA.meta.kinds + '</b><i>种（细分类目）</i></span>' +
      '<span><small>大型及以上</small><b>' + big.toLocaleString("en-US") + '</b><i>处</i></span>' +
      '<span><small>正在开采</small><b>' + (mining / 10000).toFixed(1) + ' 万</b><i>处</i></span>';
  }

  /* ── 浮窗 ── */
  var popup = new maplibregl.Popup({ closeButton: true, maxWidth: "300px" });

  function kindText(k) {
    var out = [];
    for (var i = 0; i < k.length; i++) {
      if (k[i] >= 0 && DATA.kinds[k[i]]) out.push(DATA.kinds[k[i]].t);
    }
    return out.join("、") || "未标注";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function showPopup(idx) {
    var p = PTS[idx];
    if (!p) return;
    var g = p[5], gmeta = DATA.groups[g] || { label: "其他", color: "#adb5bd" };
    var pn = p[9] >= 0 && DATA.provinces[p[9]] ? DATA.provinces[p[9]].n : "";
    var cn = p[10] >= 0 && DATA.cities[p[10]] ? DATA.cities[p[10]].n : "";
    var loc = (pn + (cn ? " · " + cn : "")).trim();
    var lon = (p[0] / 1000).toFixed(4), lat = (p[1] / 1000).toFixed(4);
    var nm = DATA.names[p[11]] || "";
    var rows = [
      ["矿种", '<i class="pop-dot" style="background:' + gmeta.color + '"></i>' + escapeHtml(kindText(p.slice(2, 5)))],
      ["大类", gmeta.label],
      ["规模", DATA.scales[p[5]] ? DATA.scales[p[5]].t : "—"],
      ["利用现状", DATA.uses[p[6]] ? DATA.uses[p[6]].t : "—"],
      ["工作程度", DATA.geos[p[7]] ? DATA.geos[p[7]].t : "—"],
      ["矿床成因", DATA.gens[p[8]] ? DATA.gens[p[8]].t : "—"],
    ];
    if (loc) rows.unshift(["所在地", loc]);
    var htmlRows = rows.map(function (r) {
      return '<div class="pop-row"><b>' + r[0] + "</b><span>" + r[1] + "</span></div>";
    }).join("");
    var html =
      '<div class="pop-head"><div class="pop-name">' +
      (nm ? escapeHtml(nm) : '<span class="pop-unnamed">（未命名矿产地）</span>') +
      "</div></div>" +
      '<div class="pop-rows">' + htmlRows + "</div>" +
      '<div class="pop-foot">WGS84：' + lon + ", " + lat + " · 2021 版全国矿产地名录</div>";
    var gc = wgs84ToGcj02(p[0] / 1000, p[1] / 1000);
    popup.setLngLat(gc).setHTML(html).addTo(map);
  }

  map.on("click", "dep-pt", function (e) {
    var hits = e.features || [];
    if (!hits.length) return;
    showPopup(hits[0].id);
    setSelected(hits[0].geometry.coordinates);
  });
  map.on("click", function (e) {
    var hits = map.queryRenderedFeatures(e.point, { layers: ["dep-pt"] });
    if (!hits.length) {
      popup.remove();
      setSelected(null);
      closeMobileCards();
    }
  });
  map.on("mouseenter", "dep-pt", function () { map.getCanvas().style.cursor = "pointer"; });
  map.on("mouseleave", "dep-pt", function () { map.getCanvas().style.cursor = ""; });

  /* ── 选中态：呼吸光晕 ── */
  var selRAF = null, selT0 = 0;
  function setSelected(coords) {
    var src = map.getSource("depSel");
    if (!src) return;
    src.setData(coords
      ? { type: "FeatureCollection", features: [{ type: "Feature", geometry: { type: "Point", coordinates: coords }, properties: {} }] }
      : { type: "FeatureCollection", features: [] });
    if (selRAF) { cancelAnimationFrame(selRAF); selRAF = null; }
    if (!coords) return;
    selT0 = performance.now();
    selRAF = requestAnimationFrame(function pulse(ts) {
      var p = (Math.sin((ts - selT0) / 520) + 1) / 2;
      map.setPaintProperty("dep-sel", "circle-radius", 10 + p * 12);
      map.setPaintProperty("dep-sel", "circle-opacity", 0.5 - p * 0.32);
      selRAF = requestAnimationFrame(pulse);
    });
  }

  /* ── 移动端卡片折叠 ── */
  var card = document.getElementById("controlCard");
  var cardToggle = document.getElementById("cardToggle");
  var infoCard = document.getElementById("infoCard");
  var infoToggleBtn = document.getElementById("infoToggleBtn");
  if (cardToggle) {
    cardToggle.addEventListener("click", function () {
      var open = !card.classList.contains("open");
      card.classList.toggle("open", open);
      infoCard.classList.remove("open");
      infoToggleBtn.textContent = "ℹ 说明";
      this.textContent = open ? "✕ 收起" : "☰ 工具";
    });
  }
  if (infoToggleBtn) {
    infoToggleBtn.addEventListener("click", function () {
      var open = !infoCard.classList.contains("open");
      infoCard.classList.toggle("open", open);
      card.classList.remove("open");
      cardToggle.textContent = "☰ 工具";
      this.textContent = open ? "✕ 收起" : "ℹ 说明";
    });
  }
  document.getElementById("infoToggle").addEventListener("click", function () {
    infoCard.classList.toggle("collapsed");
    var col = infoCard.classList.contains("collapsed");
    this.setAttribute("aria-expanded", col ? "false" : "true");
  });
  function closeMobileCards() {
    if (card && card.classList.contains("open")) {
      card.classList.remove("open");
      cardToggle.textContent = "☰ 工具";
    }
    if (infoCard && infoCard.classList.contains("open")) {
      infoCard.classList.remove("open");
      infoToggleBtn.textContent = "ℹ 说明";
    }
  }

  /* ── 加载 ── */
  var loading = document.getElementById("loading");

  map.on("load", function () {
    Promise.all([
      fetch("/maps/_shared/china-provinces.json").then(function (r) { return r.json(); }),
      fetch("/maps/house-price/data/cities-geo.json").then(function (r) { return r.json(); }),
      fetch("data/minerals.json").then(function (r) { return r.json(); })
    ]).then(function (res) {
      var pgj = res[0], cgj = res[1];
      DATA = res[2];
      PTS = DATA.pts;

      // 坐标系配准：省界 / 市界 / 矿产地点位整体转 GCJ-02，与高德底图对齐
      shiftFeatures(pgj);
      shiftFeatures(cgj);
      pgj.features.forEach(function (f) {
        if (f.properties && f.properties.adcode && f.geometry) {
          provGeom[String(f.properties.adcode)] = f.geometry;
        }
      });
      cgj.features.forEach(function (f) {
        if (f.properties && f.properties.adcode && f.geometry) {
          cityGeom[String(f.properties.adcode)] = f.geometry;
        }
      });
      FEATURES = buildFeatures();

      map.addSource("dep", { type: "geojson", data: { type: "FeatureCollection", features: FEATURES } });

      // 热力模式（置于散点之下，由显示模式切换可见性）
      map.addLayer({
        id: "dep-heat",
        type: "heatmap",
        source: "dep",
        layout: { visibility: "none" },
        paint: {
          // 规模越大权重越高：超大型 / 特大型 / 大型 / 中型 / 小型 / 矿点 / 矿化点 / 未标注
          "heatmap-weight": ["match", ["get", "sc"], [0], 1, [1], 0.9, [2], 0.75, [3], 0.55, [4], 0.4, [5], 0.25, [6], 0.2, 0.25],
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 3, 0.6, 6, 1.2, 10, 3],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 3, 12, 6, 20, 10, 34],
          "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 8, 0.8, 12, 0.35],
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0, "rgba(0,0,0,0)",
            0.1, "#1b3a6b",
            0.25, "#1c7ed6",
            0.45, "#38d9a9",
            0.65, "#fcc419",
            0.85, "#ff922b",
            1, "#e03131"
          ]
        }
      });

      map.addLayer({
        id: "dep-pt",
        type: "circle",
        source: "dep",
        paint: {
          "circle-color": groupColorExpr(),
          "circle-radius": radiusExpr(),
          "circle-opacity": ["interpolate", ["linear"], ["zoom"], 3, 0.7, 8, 0.8, 12, 0.9],
          "circle-stroke-color": "#0c0906",
          "circle-stroke-width": 0.4,
          "circle-stroke-opacity": 0.35
        }
      });

      map.addSource("depSel", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "dep-sel",
        type: "circle",
        source: "depSel",
        paint: {
          "circle-color": "#ffffff",
          "circle-opacity": 0.4,
          "circle-radius": 10,
          "circle-blur": 0.6
        }
      });

      map.addSource("provinces", { type: "geojson", data: pgj });
      map.addLayer({
        id: "prov-line",
        type: "line",
        source: "provinces",
        paint: { "line-color": "#6b5b45", "line-width": 1.0, "line-opacity": 0.75 }
      });

      map.addSource("cities", { type: "geojson", data: cgj });
      map.addLayer({
        id: "city-line",
        type: "line",
        source: "cities",
        paint: { "line-color": "#7a6a52", "line-width": 0.5, "line-opacity": 0.45 }
      });

      buildFilters(pgj, cgj);
      buildGroupChecks();
      buildRank();
      buildFacts();
      applyFilter();
      loading.classList.add("hide");
    }).catch(function (err) {
      loading.textContent = "数据加载失败：" + (err && err.message ? err.message : err);
    });
  });

  // 供外壳页 / 调试使用
  window.__app = {
    map: map,
    setBasemap: setBasemap,
    setMode: setMode,
    toGcj02: wgs84ToGcj02
  };
})();
