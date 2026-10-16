/* 中国绿地分布互动地图 · 表现层
   数据：public/maps/cn-greenland-shp-2024/data/greenland.json
        （由 cn-greenland-shp-2024 SHP 按 89m 容差简化、滤除 <4000㎡ 碎面，约 4 万较大面）
   边界：/maps/_shared/china-provinces.json（省界，复用全站共用数据）
        /maps/house-price/data/cities-geo.json（70 个地级市界，复用共用数据）
   坐标系：数据一律 WGS84 入库；底图是高德 GCJ-02，故**渲染前统一 wgs84ToGcj02 配准**
        （绿地 / 省界 / 市界 / 选区框全部转换，漏一个就整体偏 ~500m）。
   底图：高德（白底 / 卫星 style=6 / 矢量 style=7），默认卫星影像。
   功能：默认故宫视图（北京已选中，仅显示北京绿地）、省 / 市行政边界（到城市）、
        按城市/省份筛选（仅显示所选范围绿地，不在全国一次性堆出全量）、按绿地类型多选、
        按名称搜索、按缩放分级的中文名称标注（DOM 实现，不依赖 glyphs 字体服务）、
        点选浮窗（名称 / 类型 / 面积 / 中心坐标）。 */
(function () {
  "use strict";

  var FCLASS = {
    park:          { label: "公园 / 绿地",  color: "#2e9e5b" },
    pitch:         { label: "体育球场",     color: "#4cc9f0" },
    attraction:    { label: "景点 / 景区",  color: "#f4a261" },
    sports_centre: { label: "体育中心",     color: "#4361ee" },
    theme_park:    { label: "主题公园",     color: "#e63946" },
    golf_course:   { label: "高尔夫球场",   color: "#b5e48c" },
    zoo:           { label: "动物园",       color: "#ffb703" },
    playground:    { label: "游乐场",       color: "#ff70a6" },
    garden_centre: { label: "花木市场",     color: "#a6808c" },
    caravan_site:  { label: "房车营地",     color: "#8d99ae" },
    greengrocer:   { label: "果蔬店",       color: "#c1121f" },
    dog_park:      { label: "遛狗公园",     color: "#90be6d" },
    "":            { label: "其他绿地",     color: "#95d5b2" }
  };
  var FCLASS_KEYS = Object.keys(FCLASS);

  // 默认落点：故宫（WGS84），加载后飞行到此处并放大
  var FORBIDDEN_CITY_WGS = [116.3972, 39.9183];

  // 高德瓦片子域：wprd01~wprd04（两位数，wprd0~wprd3 域名不存在）
  function amapTiles(styleId) {
    return ["01", "02", "03", "04"].map(function (s) {
      return "https://wprd" + s + ".is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=" + styleId;
    });
  }

  // 类型 -> 颜色 的 match 表达式
  function colorMatch() {
    var m = ["match", ["coalesce", ["get", "fclass"], ""]];
    Object.keys(FCLASS).forEach(function (k) {
      if (k === "") return;
      m.push(k, FCLASS[k].color);
    });
    m.push(FCLASS[""].color); // default（含未命名 / 无类别）
    return m;
  }

  /* ── 坐标系配准：WGS84 → GCJ-02 ──
     高德瓦片是 GCJ-02，被当作标准 Web Mercator 加载，内容相对真实位置偏 ~500m。
     本图所有矢量（绿地 / 省界 / 市界 / 选区）都在渲染前整体转到 GCJ-02，与底图对齐。
     内部存储与搜索判定也都用转换后的同一套坐标，因此点面判定仍然自洽。 */
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
    if (gcjOutOfChina(lng, lat)) return [lng, lat]; // 境外原样返回，勿加密
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

  /* 原地转换：环 / 面 / 多多边形（绿地 50 万顶点，一次转换约 0.2s，只在加载时做一次） */
  function shiftRing(ring) {
    for (var i = 0; i < ring.length; i++) {
      var p = wgs84ToGcj02(ring[i][0], ring[i][1]);
      ring[i][0] = p[0];
      ring[i][1] = p[1];
    }
  }
  function shiftGeometry(g) {
    if (!g) return g;
    if (g.type === "Polygon") {
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

  /* 球面带符号面积（km²）：外环与孔洞符号相反，直接求和即得净面积，勿逐环取 abs 累加 */
  function ringSignedAreaKm2(ring) {
    var s = 0, n = ring.length;
    if (n < 3) return 0;
    for (var i = 0; i < n; i++) {
      var p1 = ring[i], p2 = ring[(i + 1) % n];
      s += (p2[0] - p1[0]) * Math.PI / 180 *
        (2 + Math.sin(p1[1] * Math.PI / 180) + Math.sin(p2[1] * Math.PI / 180));
    }
    return s * 6371008.8 * 6371008.8 / 2 / 1e6;
  }
  function geomAreaKm2(g) {
    var polys = g.type === "Polygon" ? [g.coordinates]
      : (g.type === "MultiPolygon" ? g.coordinates : []);
    var a = 0;
    for (var i = 0; i < polys.length; i++) {
      for (var k = 0; k < polys[i].length; k++) a += ringSignedAreaKm2(polys[i][k]);
    }
    return Math.abs(a);
  }

  /* ── 几何工具：点在多边形（射线法）、几何包围盒、面质心 ── */
  function pip(pt, ring) {
    var x = pt[0], y = pt[1], inside = false;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      var xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
      var intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }
  function pointInGeom(pt, geom) {
    if (!geom) return false;
    if (geom.type === "Polygon") return pip(pt, geom.coordinates[0]);
    if (geom.type === "MultiPolygon") {
      for (var i = 0; i < geom.coordinates.length; i++) {
        if (pip(pt, geom.coordinates[i][0])) return true;
      }
    }
    return false;
  }
  function geomBBox(geom) {
    var minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
    function walk(coords) {
      if (typeof coords[0] === "number") {
        if (coords[0] < minx) minx = coords[0];
        if (coords[0] > maxx) maxx = coords[0];
        if (coords[1] < miny) miny = coords[1];
        if (coords[1] > maxy) maxy = coords[1];
        return;
      }
      for (var i = 0; i < coords.length; i++) walk(coords[i]);
    }
    walk(geom.coordinates);
    return [minx, miny, maxx, maxy];
  }
  function centroidOfGeom(geom) {
    var poly = geom.type === "Polygon" ? geom.coordinates
      : (geom.type === "MultiPolygon" ? geom.coordinates[0] : null);
    if (!poly) return null;
    var ring = poly[0];
    var a = 0, cx = 0, cy = 0;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      var xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
      var f = xi * yj - xj * yi;
      a += f; cx += (xi + xj) * f; cy += (yi + yj) * f;
    }
    if (a === 0) {
      var minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
      for (var k = 0; k < ring.length; k++) {
        minx = Math.min(minx, ring[k][0]); maxx = Math.max(maxx, ring[k][0]);
        miny = Math.min(miny, ring[k][1]); maxy = Math.max(maxy, ring[k][1]);
      }
      return [(minx + maxx) / 2, (miny + maxy) / 2];
    }
    a *= 0.5;
    return [cx / (6 * a), cy / (6 * a)];
  }

  /* ── 底图样式（默认卫星影像；白底为 background 兜底） ── */
  var style = {
    version: 8,
    sources: {
      amap_img: { type: "raster", tiles: amapTiles(6), tileSize: 256, attribution: "高德地图" },
      amap_vec: { type: "raster", tiles: amapTiles(7), tileSize: 256, attribution: "高德地图" }
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#ffffff" } },
      { id: "amap-img", type: "raster", source: "amap_img", layout: { visibility: "visible" }, paint: { "raster-opacity": 1 } },
      { id: "amap-vec", type: "raster", source: "amap_vec", layout: { visibility: "none" }, paint: { "raster-opacity": 1 } }
    ]
  };

  // 默认视图：故宫（applyDefault 中会再次精确飞行到故宫中心）
  var map = new maplibregl.Map({
    container: "map",
    style: style,
    center: [116.403, 39.920],
    zoom: 13.5,
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
  }

  // 底图切换按钮（默认 无底图 / 白底）
  var bmSeg = document.getElementById("basemapSeg");
  bmSeg.addEventListener("click", function (e) {
    var btn = e.target.closest(".seg-btn");
    if (!btn) return;
    [].forEach.call(bmSeg.querySelectorAll(".seg-btn"), function (b) { b.classList.remove("active"); });
    btn.classList.add("active");
    setBasemap(btn.getAttribute("data-bm"));
  });

  /* ── 数据状态 ── */
  var allFeatures = [];
  var allCentroids = [];
  var totalCount = 0;
  var currentRegion = null;   // 选中的省 / 市几何（用于空间筛选 + 高亮）
  var currentName = "";       // 名称搜索关键字
  var regionLabel = "";       // 当前范围名称（用于计数标签）
  var typeFilter = {};        // 选中的 fclass -> true（默认全选）
  FCLASS_KEYS.forEach(function (k) { typeFilter[k] = true; });
  var provGeom = {};
  var cityGeom = {};
  var cityCenter = {};        // 城市 adcode -> 行政中心（GCJ-02，已配准）
  var cgjFeatures = [];       // 城市要素（供级联重建城市下拉）
  var CITY_PARENT = {};       // 城市 adcode -> 所属省 adcode（前 2 位 + "0000"）

  function updateCount(n) {
    var el = document.getElementById("countLabel");
    if (!el) return;
    if (!currentRegion) {
      el.textContent = "请选择城市 / 省份查看绿地";
    } else {
      el.textContent = "显示 " + n.toLocaleString("en-US") + " 个 · " + regionLabel;
    }
  }

  /* ── 名称标注（DOM 实现，不依赖 glyphs 字体服务，国内更稳） ──
     只标有名字的矢量（未命名的不标）。按面积分级决定最小可见缩放：
     大面在低缩放下就显示，小面放大后才出现。同一时刻最多渲染 LABEL_MAX 个
     （按面积从大到小取），避免高缩放下堆满屏。 */
  var LABEL_MAX = 350;        // 同一时刻最多渲染的标注数
  var LABEL_POOL_CAP = 1500;  // 标注候选上限（按面积从大到小保留），防止选中大省时创建上万个 DOM 节点
  var labelBox = document.createElement("div");
  labelBox.className = "map-labels";
  document.getElementById("map").appendChild(labelBox);
  var labelPool = [];   // 复用的 DOM 元素池
  var labelItems = [];  // { el, c(GCJ 质心), mz, f }

  function pickLabelMinZoom(area) {
    if (area >= 3) return 7;
    if (area >= 1) return 8.5;
    if (area >= 0.4) return 9.6;
    if (area >= 0.15) return 10.5;
    if (area >= 0.05) return 11.5;
    if (area >= 0.015) return 12.5;
    return 13.5;
  }

  function ensureLabelPool(n) {
    while (labelPool.length < n) {
      var el = document.createElement("div");
      el.className = "map-label";
      // 纯注释，不接事件：标注数量可达数百，若可点击会在图上形成大片拖拽死区
      labelBox.appendChild(el);
      labelPool.push(el);
    }
  }

  function rebuildLabels(features, idxs) {
    var list = [];
    for (var i = 0; i < features.length; i++) {
      var props = features[i].properties || {};
      var nm = props.name;
      if (!nm || !String(nm).trim()) continue;   // 未命名 -> 不标注
      var c = allCentroids[idxs[i]];
      if (!c) continue;
      list.push({ f: features[i], c: c, area: props._area || 0 });
    }
    list.sort(function (a, b) { return b.area - a.area; }); // 大的优先显示
    // 候选截断：标签按面积降序，超出上限的（最小的那批）不参与标注，
    // 避免选中大省时把上万个 div 塞进 DOM 造成卡顿。
    if (list.length > LABEL_POOL_CAP) list = list.slice(0, LABEL_POOL_CAP);
    ensureLabelPool(list.length);
    for (var k = 0; k < list.length; k++) {
      var it = list[k];
      var el = labelPool[k];
      var txt = String(it.f.properties.name);
      if (el.textContent !== txt) { el.textContent = txt; }
      it.el = el;
      it.mz = pickLabelMinZoom(it.area);
    }
    for (var m = list.length; m < labelPool.length; m++) labelPool[m].style.display = "none";
    labelItems = list;
    updateLabels();
  }

  function updateLabels() {
    if (!labelItems.length) return;
    var z = map.getZoom();
    var W = map.getCanvas().width, H = map.getCanvas().height;
    var shown = 0;
    for (var i = 0; i < labelItems.length; i++) {
      var it = labelItems[i], el = it.el;
      var hide = it.mz > z || shown >= LABEL_MAX;
      if (!hide) {
        var p = map.project(it.c);
        if (p.x < -60 || p.y < -30 || p.x > W + 60 || p.y > H + 30) {
          hide = true;
        } else {
          el.style.left = p.x + "px";
          el.style.top = p.y + "px";
        }
      }
      var want = hide ? "none" : "";
      if (el.style.display !== want) el.style.display = want;
      if (!hide) shown++;
    }
  }
  // 拖动/缩放时用 rAF 节流，避免 move 高频触发重复投影
  var labelRAF = null;
  function scheduleLabels() {
    if (labelRAF) return;
    labelRAF = requestAnimationFrame(function () { labelRAF = null; updateLabels(); });
  }
  map.on("move", scheduleLabels);
  map.on("zoom", scheduleLabels);
  map.on("resize", scheduleLabels);

  // 仅渲染：类型被勾选 且 质心落在当前范围 且 名称匹配
  function applyFilter() {
    setSelected(null);                         // 范围 / 类型 / 搜索变化时清除点选态
    var out = [];
    var idxs = [];
    var rb = currentRegion ? geomBBox(currentRegion) : null;
    var name = currentName.toLowerCase();
    for (var i = 0; i < allFeatures.length; i++) {
      var f = allFeatures[i];
      var fc = f.properties.fclass || "";
      if (!typeFilter[fc]) continue;            // 类型未勾选 -> 跳过
      if (!currentRegion) continue;            // 未选范围 -> 不堆全量
      var c = allCentroids[i];
      if (c[0] < rb[0] || c[0] > rb[2] || c[1] < rb[1] || c[1] > rb[3]) continue; // bbox 预筛
      if (!pointInGeom(c, currentRegion)) continue;  // 精确点在面内
      if (name) {
        var nm = (f.properties.name || "").toLowerCase();
        if (nm.indexOf(name) === -1) continue;
      }
      out.push(f);
      idxs.push(i);
    }
    if (map.getSource("green")) {
      map.getSource("green").setData({ type: "FeatureCollection", features: out });
    }
    rebuildLabels(out, idxs);
    updateCount(out.length);
    return out.length;
  }

  function zoomToGeom(geom) {
    var b = geomBBox(geom);
    map.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: 50, maxZoom: 10, duration: 600 });
  }

  function setRegion(geom, label, adcode) {
    currentRegion = geom;
    regionLabel = label || "";
    if (geom) {
      map.getSource("regionSel").setData({ type: "Feature", geometry: geom, properties: {} });
    } else {
      map.getSource("regionSel").setData({ type: "FeatureCollection", features: [] });
    }
  }

  // 默认视图：北京已选中（优先城市级边界 110100，否则省级 110000），
  // 但相机直接飞行到「故宫」中心并放大，而不是框选整个北京边界。
  function applyDefault() {
    var provSel = document.getElementById("provSelect");
    provSel.value = "110000";
    fillCitySelect("110000");                 // 级联：城市下拉只列北京
    var bjCity = cityGeom["110100"];
    if (bjCity) {
      document.getElementById("citySelect").value = "110100";
      setRegion(bjCity, "北京", "110100");
    } else {
      document.getElementById("citySelect").value = "";
      setRegion(provGeom["110000"], "北京市", "110000");
    }
    var fc = wgs84ToGcj02(FORBIDDEN_CITY_WGS[0], FORBIDDEN_CITY_WGS[1]);
    map.flyTo({ center: fc, zoom: 14, duration: 900 });
  }

  /* 选中城市后：飞行到该城市行政中心（而非仅框选边界）。
     缩放由城市外接框反算（cameraForBounds），并限制不超过 12，避免小城市过近。 */
  function flyToCityCenter(geom, center) {
    if (!center || !geom) { if (geom) zoomToGeom(geom); return; }
    var b = geomBBox(geom);
    var cam = map.cameraForBounds([[b[0], b[1]], [b[2], b[3]]], { padding: 70 });
    var z = cam ? Math.min(cam.zoom, 12) : 10;
    map.flyTo({ center: center, zoom: z, duration: 700 });
  }

  /* ── 省 / 市 下拉 ── */
  function buildSelect(sel, gj, store) {
    gj.features.slice().sort(function (a, b) {
      return String(a.properties.name).localeCompare(String(b.properties.name), "zh");
    }).forEach(function (f) {
      var o = document.createElement("option");
      o.value = String(f.properties.adcode);
      o.textContent = f.properties.name;
      sel.appendChild(o);
      store[String(f.properties.adcode)] = f.geometry;
    });
  }

  /* ── 省 / 市 下拉（级联） ──
     选中省份后，城市下拉只列该省的地级市；选「全部城市」回到省级范围；
     直接选城市时，省份自动落到其所属省。 */
  function fillCitySelect(provAdcode) {
    var sel = document.getElementById("citySelect");
    sel.innerHTML = "";
    var ph = document.createElement("option");
    ph.value = "";
    ph.textContent = "全部城市";
    sel.appendChild(ph);
    cgjFeatures.slice().sort(function (a, b) {
      return String(a.properties.name).localeCompare(String(b.properties.name), "zh");
    }).forEach(function (f) {
      var ad = String(f.properties.adcode);
      if (provAdcode && CITY_PARENT[ad] !== provAdcode) return;
      var o = document.createElement("option");
      o.value = ad;
      o.textContent = f.properties.name;
      sel.appendChild(o);
    });
  }

  document.getElementById("provSelect").addEventListener("change", function () {
    var v = this.value;
    fillCitySelect(v);                        // 级联重建城市下拉（重置为「全部城市」）
    if (v) {
      var f = provGeom[v];
      setRegion(f, this.options[this.selectedIndex].textContent, v);
      zoomToGeom(f);
    } else {
      setRegion(null, "");
    }
    applyFilter();
  });

  document.getElementById("citySelect").addEventListener("change", function () {
    var v = this.value;
    var provSel = document.getElementById("provSelect");
    if (v) {
      var pa = CITY_PARENT[v];
      if (pa && provSel.value !== pa) provSel.value = pa;   // 省份自动跟随
      var f = cityGeom[v];
      setRegion(f, this.options[this.selectedIndex].textContent, v);
      flyToCityCenter(f, cityCenter[v]);   // 飞行到城市行政中心，而非仅框选边界
    } else {
      var pv = provSel.value;                 // 「全部城市」-> 回到省级范围
      if (pv) {
        var pf = provGeom[pv];
        setRegion(pf, provSel.options[provSel.selectedIndex].textContent, pv);
        zoomToGeom(pf);
      } else {
        setRegion(null, "");
      }
    }
    applyFilter();
  });

  /* ── 名称搜索 ── */
  function doSearch() {
    currentName = (document.getElementById("searchInput").value || "").trim();
    var n = applyFilter();
    if (currentName && n > 0) {
      var q = currentName.toLowerCase();
      var rb = currentRegion ? geomBBox(currentRegion) : null;
      for (var i = 0; i < allFeatures.length; i++) {
        if (!typeFilter[allFeatures[i].properties.fclass || ""]) continue;
        if (!currentRegion) break;
        var c = allCentroids[i];
        if (rb && (c[0] < rb[0] || c[0] > rb[2] || c[1] < rb[1] || c[1] > rb[3])) continue;
        if (!pointInGeom(c, currentRegion)) continue;
        var nm = (allFeatures[i].properties.name || "").toLowerCase();
        if (nm.indexOf(q) !== -1) {
          map.flyTo({ center: c, zoom: Math.min(12, map.getZoom() + 2) });
          break;
        }
      }
    }
  }
  document.getElementById("searchBtn").addEventListener("click", doSearch);
  document.getElementById("searchInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") doSearch();
  });

  /* ── 绿地类型多选 ── */
  function buildTypeChecks() {
    var box = document.getElementById("typeChecks");
    FCLASS_KEYS.forEach(function (k) {
      var m = FCLASS[k];
      var label = document.createElement("label");
      label.className = "type-check";
      label.innerHTML =
        '<input type="checkbox" value="' + k + '" checked>' +
        '<i style="background:' + m.color + '"></i>' + m.label;
      box.appendChild(label);
    });
    box.addEventListener("change", function (e) {
      var inp = e.target;
      if (inp && inp.type === "checkbox") {
        typeFilter[inp.value] = inp.checked;
        applyFilter();
      }
    });
  }
  document.getElementById("typeAll").addEventListener("click", function () {
    var anyOn = FCLASS_KEYS.some(function (k) { return typeFilter[k]; });
    var next = !anyOn; // 当前有勾选 -> 全不选；当前全空 -> 全选
    FCLASS_KEYS.forEach(function (k) { typeFilter[k] = next; });
    [].forEach.call(document.querySelectorAll("#typeChecks input"), function (inp) { inp.checked = next; });
    this.textContent = next ? "全不选" : "全选";
    applyFilter();
  });

  /* ── 重置（恢复到默认北京视图 + 全类型） ── */
  document.getElementById("resetBtn").addEventListener("click", function () {
    document.getElementById("provSelect").value = "";
    document.getElementById("citySelect").value = "";
    document.getElementById("searchInput").value = "";
    currentName = "";
    FCLASS_KEYS.forEach(function (k) { typeFilter[k] = true; });
    [].forEach.call(document.querySelectorAll("#typeChecks input"), function (inp) { inp.checked = true; });
    document.getElementById("typeAll").textContent = "全不选";
    // 恢复默认北京
    applyDefault();
    applyFilter();
  });

  /* ── 移动端工具卡片 / 说明卡片 展开收起 ── */
  var card = document.getElementById("controlCard");
  var cardToggle = document.getElementById("cardToggle");
  if (cardToggle) {
    cardToggle.addEventListener("click", function () {
      var open = !card.classList.contains("open");
      card.classList.toggle("open", open);
      infoCard.classList.remove("open");          // 打开工具卡时收起说明卡，避免重叠
      infoToggleBtn.textContent = "ℹ 说明";
      this.textContent = open ? "✕ 收起" : "☰ 工具";
    });
  }
  var infoCard = document.getElementById("infoCard");
  var infoToggleBtn = document.getElementById("infoToggleBtn");
  if (infoToggleBtn) {
    infoToggleBtn.addEventListener("click", function () {
      var open = !infoCard.classList.contains("open");
      infoCard.classList.toggle("open", open);
      card.classList.remove("open");              // 打开说明卡时收起工具卡，避免重叠
      cardToggle.textContent = "☰ 工具";
      this.textContent = open ? "✕ 收起" : "ℹ 说明";
    });
  }
  document.getElementById("infoToggle").addEventListener("click", function () {
    infoCard.classList.toggle("collapsed");
    var col = infoCard.classList.contains("collapsed");
    this.setAttribute("aria-expanded", col ? "false" : "true");
  });

  /* ── 加载层 ── */
  var loading = document.getElementById("loading");

  map.on("load", function () {
    // 并行加载：省界 / 市界 / 绿地数据，保证图层叠放顺序正确
    Promise.all([
      fetch("/maps/_shared/china-provinces.json").then(function (r) { return r.json(); }),
      fetch("/maps/house-price/data/cities-geo.json").then(function (r) { return r.json(); }),
      fetch("data/greenland.json").then(function (r) { return r.json(); })
    ]).then(function (res) {
      var pgj = res[0], cgj = res[1], geo = res[2];

      // 0) 坐标系配准：省界 / 市界 / 绿地全部从 WGS84 原地转到 GCJ-02，与高德底图对齐。
      //    下游的渲染、fitBounds、点面判定都基于转换后的同一套坐标，故仍然自洽。
      shiftFeatures(pgj);
      shiftFeatures(cgj);
      allFeatures = geo.features;
      totalCount = allFeatures.length;
      allCentroids = [];
      for (var gi = 0; gi < allFeatures.length; gi++) {
        var gf = allFeatures[gi];
        var cw = centroidOfGeom(gf.geometry);                       // WGS84 质心
        gf.properties._area = +geomAreaKm2(gf.geometry).toFixed(4); // 面积（km²，供标注分级与浮窗）
        if (cw) gf.properties._wgs = [+cw[0].toFixed(6), +cw[1].toFixed(6)]; // 原始 WGS84 坐标（浮窗展示）
        shiftGeometry(gf.geometry);                                 // 原地转 GCJ-02
        allCentroids.push(cw ? wgs84ToGcj02(cw[0], cw[1]) : cw);    // GCJ 质心（筛选 / 标注 / 飞行定位）
      }

      // 1) 下拉填充
      buildSelect(document.getElementById("provSelect"), pgj, provGeom);
      buildSelect(document.getElementById("citySelect"), cgj, cityGeom);

      // 1.1) 级联映射：城市 adcode 前 2 位即所属省（440300 -> 440000），
      //      已核对 70 市全部能命中省界的 35 个 adcode
      cgjFeatures = cgj.features;
      cgj.features.forEach(function (f) {
        var ad = String(f.properties.adcode);
        CITY_PARENT[ad] = ad.slice(0, 2) + "0000";
        // 行政中心：src 与几何同为 WGS84，统一配准到 GCJ-02 与底图对齐
        var c = f.properties.center;
        if (c && c.length === 2) cityCenter[ad] = wgs84ToGcj02(c[0], c[1]);
      });

      // 1.5) 绿地类型多选勾选框（必须构建，否则勾选功能不可用）
      buildTypeChecks();

      // 2) 绿地数据源 + 图层（置于行政边界之下）
      map.addSource("green", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "green-fill",
        type: "fill",
        source: "green",
        paint: {
          "fill-color": colorMatch(),
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 3, 0.3, 8, 0.42, 12, 0.58]
        }
      });
      map.addLayer({
        id: "green-line",
        type: "line",
        source: "green",
        paint: { "line-color": "#04140b", "line-width": 0.4, "line-opacity": 0.25 }
      });

      // 2.5) 点选高亮：独立数据源装当前选中要素，光晕层用 rAF 做呼吸动画
      map.addSource("greenSel", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "green-sel-glow",
        type: "line",
        source: "greenSel",
        paint: { "line-color": "#2e9e5b", "line-width": 12, "line-blur": 8, "line-opacity": 0.4 }
      });
      map.addLayer({
        id: "green-sel-line",
        type: "line",
        source: "greenSel",
        paint: { "line-color": "#0d5c30", "line-width": 2, "line-opacity": 0.95 }
      });

      // 3) 省级行政边界（深灰，置于绿地之上）
      map.addSource("provinces", { type: "geojson", data: pgj });
      map.addLayer({
        id: "prov-line",
        type: "line",
        source: "provinces",
        paint: { "line-color": "#555555", "line-width": 1.1, "line-opacity": 0.6 }
      });

      // 4) 地级市行政边界（浅灰细线，到城市级别）
      map.addSource("cities", { type: "geojson", data: cgj });
      map.addLayer({
        id: "city-line",
        type: "line",
        source: "cities",
        paint: { "line-color": "#9aa0a6", "line-width": 0.6, "line-opacity": 0.5 }
      });

      // 5) 当前选中范围高亮（绿色粗线，最上层）
      map.addSource("regionSel", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "region-sel-line",
        type: "line",
        source: "regionSel",
        paint: { "line-color": "#2e9e5b", "line-width": 2.4, "line-opacity": 0.95 }
      });

      // 6) 默认北京（优先城市 110100，否则省份 110000）
      applyDefault();
      applyFilter();
      loading.classList.add("hide");
    }).catch(function (err) {
      loading.textContent = "数据加载失败：" + (err && err.message ? err.message : err);
    });
  });

  /* ── 点选浮窗：名称 / 类型 / 面积 / 中心坐标 ──
     数据只有 osm_id / code / fclass / name 四个字段，面积与坐标均由几何派生。 */
  var popup = new maplibregl.Popup({ closeButton: true, maxWidth: "280px" });

  /* ── 点选态 + 呼吸光晕：把选中要素塞进独立 source，rAF 循环动画描边 ── */
  var selRAF = null, selT0 = 0;
  function setSelected(geom) {
    var src = map.getSource("greenSel");
    if (!src) return;
    src.setData(geom
      ? { type: "Feature", geometry: geom, properties: {} }
      : { type: "FeatureCollection", features: [] });
    if (selRAF) { cancelAnimationFrame(selRAF); selRAF = null; }
    if (!geom) return;
    selT0 = performance.now();
    selRAF = requestAnimationFrame(function pulse(ts) {
      var p = (Math.sin((ts - selT0) / 520) + 1) / 2;          // 0..1 呼吸相位
      map.setPaintProperty("green-sel-glow", "line-width", 7 + p * 9);
      map.setPaintProperty("green-sel-glow", "line-opacity", 0.22 + p * 0.4);
      map.setPaintProperty("green-sel-line", "line-width", 1.6 + p * 1.0);
      selRAF = requestAnimationFrame(pulse);
    });
  }

  function fmtArea(a) {
    if (!a) return "—";
    if (a >= 1) return a.toFixed(2) + " km²";
    if (a >= 0.01) return (a * 100).toFixed(1) + " 公顷";
    return Math.round(a * 1e6).toLocaleString("en-US") + " m²";
  }

  function showFeaturePopup(f, lngLat) {
    if (!f) return;
    var p = f.properties || {};
    var fc = p.fclass || "";
    var meta = FCLASS[fc] || FCLASS[""];
    var raw = p.name ? String(p.name).trim() : "";
    // MapLibre 会把数组/对象属性序列化成字符串，这里要解析回来
    var wgs = p._wgs;
    if (typeof wgs === "string") {
      try { wgs = JSON.parse(wgs); } catch (e) { wgs = null; }
    }
    if (!wgs || typeof wgs[0] !== "number") wgs = null;
    var rows =
      '<div class="pop-row"><b>类型</b><span><i class="pop-dot" style="background:' + meta.color + '"></i>' + meta.label + "</span></div>" +
      '<div class="pop-row"><b>面积</b><span>' + fmtArea(p._area) + "</span></div>";
    if (wgs) {
      rows += '<div class="pop-row"><b>中心</b><span>' + wgs[0].toFixed(5) + ", " + wgs[1].toFixed(5) + "</span></div>";
    }
    var html =
      '<div class="pop-head">' +
      '<div class="pop-name">' + (raw ? escapeHtml(raw) : '<span class="pop-unnamed">（未命名绿地）</span>') + "</div>" +
      "</div>" +
      '<div class="pop-rows">' + rows + "</div>" +
      '<div class="pop-foot">WGS84 · OpenStreetMap（ODbL）</div>';
    popup.setLngLat(lngLat).setHTML(html).addTo(map);
  }

  map.on("click", "green-fill", function (e) {
    var hits = e.features || [];
    if (!hits.length) return;
    // 重叠时取面积最小的那个（最具体的一块），而非渲染顺序上的第一个
    var best = hits[0];
    for (var i = 1; i < hits.length; i++) {
      if ((hits[i].properties._area || 0) < (best.properties._area || 0)) best = hits[i];
    }
    // e.lngLat 已是显示态（GCJ-02），直接用作锚点
    showFeaturePopup({ properties: best.properties || {} }, e.lngLat);
    if (best.geometry) setSelected(best.geometry);          // 选中 -> 呼吸光晕
  });
  // 移动端：点击地图空白处时，若「工具 / 说明」面板正展开，则自动收起
  // （桌面端卡片始终可见，移除 .open 不影响显示，故无需区分设备）
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

  // 点空白处：清除选中与浮窗，并收起移动端面板
  map.on("click", function (e) {
    var hits = map.queryRenderedFeatures(e.point, { layers: ["green-fill"] });
    if (!hits.length) {
      setSelected(null);
      popup.remove();
      closeMobileCards();
    }
  });
  map.on("mouseenter", "green-fill", function () { map.getCanvas().style.cursor = "pointer"; });
  map.on("mouseleave", "green-fill", function () { map.getCanvas().style.cursor = ""; });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // 供外壳页 / 调试使用
  window.__app = {
    map: map,
    setBasemap: setBasemap,
    toGcj02: wgs84ToGcj02,
    updateLabels: updateLabels
  };
})();
