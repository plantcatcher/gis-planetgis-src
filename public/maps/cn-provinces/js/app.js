/* 中国省情一图览 · 地图交互
 * 省级边界由 /maps/_shared/province-geo.js 异步取回后注入（GEO 为回调参数），
 * 不在本目录另存一份省级 GeoJSON。
 */
window.onProvinceGeo(function (GEO) {
  "use strict";

  var P = window.PROVINCES || [];
  var METRICS = window.METRICS;
  var REGIONS = window.REGIONS || [];
  var YEARS = window.YEARS || [2025];
  var SERIES = window.SERIES || {};
  var HKMT = { "710000": 1, "810000": 1, "820000": 1 };   // 港澳台：不参与年份切换

  var byCode = {}, bySlug = {};
  P.forEach(function (p) { byCode[p.code] = p; bySlug[p.slug] = p; });

  // ---------- 历年取值 ----------
  // 2025 年取自 data.js 的 gdp / pop；2020 / 2023 / 2024 取自 SERIES
  function seriesVal(metric, code, year) {
    if (year === 2025) return null;   // 由调用方回落到最新字段
    var s = SERIES[metric] && SERIES[metric][String(year)];
    return s && s[code] !== undefined ? s[code] : null;
  }

  function valOf(p, metric, year) {
    year = year || 2025;
    if (HKMT[p.code]) year = 2025;                 // 港澳台口径不同，固定用最新值
    if (metric === "area") return p.area;
    if (year === 2025) {
      if (metric === "gdp") return p.gdp;
      if (metric === "pop") return p.pop;
      return Math.round(p.gdp * 1e4 / p.pop);
    }
    var g = seriesVal("gdp", p.code, year);
    var q = seriesVal("pop", p.code, year);
    if (metric === "gdp") return (g === null ? p.gdp : g);
    if (metric === "pop") return (q === null ? p.pop : q);
    if (g === null || q === null || !q) return Math.round(p.gdp * 1e4 / p.pop);
    return Math.round(g * 1e4 / q);
  }

  // ---------- 数据注入到边界属性 ----------
  (GEO.features || []).forEach(function (f) {
    var pr = f.properties || {};
    var d = byCode[String(pr.adcode)];
    if (d) {
      pr.slug = d.slug;
      pr.short = d.short;
      pr.name = d.name;
      pr.area = d.area;
      pr.gdp = d.gdp;
      pr.pop = d.pop;
      pr.pgdp = Math.round(d.gdp * 1e4 / d.pop);   // 元/人
      YEARS.forEach(function (y) {
        pr["gdp_" + y] = valOf(d, "gdp", y);
        pr["pop_" + y] = valOf(d, "pop", y);
        pr["pgdp_" + y] = valOf(d, "pgdp", y);
      });
    }
  });

  // ---------- 工具 ----------
  var RAMP = ["#0c2b4a", "#1d5c8f", "#2b8fbe", "#58c3d6", "#a8e063", "#fbbf24", "#f97316", "#dc2626"];

  function amapTiles(styleId) {
    return ["01", "02", "03", "04"].map(function (s) {
      return "https://wprd" + s + ".is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=" + styleId;
    });
  }

  function quantileSteps(values, n) {
    var s = values.filter(function (v) { return typeof v === "number" && isFinite(v); }).slice().sort(function (a, b) { return a - b; });
    var out = [];
    for (var i = 1; i < n; i++) out.push(s[Math.floor(s.length * i / n)]);
    return out;
  }

  function stepColor(key) {
    var vals = [], f = GEO.features || [];
    for (var i = 0; i < f.length; i++) {
      var pr = f[i].properties || {};
      if (pr.slug) vals.push(pr[key]);
    }
    var st = quantileSteps(vals, RAMP.length);
    var expr = ["step", ["get", key], RAMP[0]];
    for (var j = 0; j < st.length; j++) expr.push(st[j], RAMP[j + 1]);
    return { expr: expr, steps: st };
  }

  function fmtNum(v) {
    if (v === null || v === undefined || !isFinite(v)) return "—";
    if (Math.abs(v) >= 10000) return (v / 10000).toFixed(2) + " 万亿";
    return v.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
  }

  function fmtMoney(v) {   // 亿元 → 万亿 / 亿
    if (!isFinite(v)) return "—";
    if (v >= 10000) return (v / 10000).toFixed(2) + "<small>万亿元</small>";
    return v.toLocaleString("zh-CN", { maximumFractionDigits: 2 }) + "<small>亿元</small>";
  }

  function deltaHtml(v, unit) {
    if (v === null || v === undefined) return "";
    var cls = v > 0 ? "up" : (v < 0 ? "down" : "");
    var sign = v > 0 ? "+" : "";
    return '<span class="' + cls + '">' + sign + v + (unit || "") + "</span>";
  }

  // 取「面积最大的那一块多边形」的外接框。
  // 理由：海南省的要素包含南海诸岛，直接取整体 bbox 会把视野拉到赤道附近。
  function bboxOf(geom) {
    var polys = geom.type === "MultiPolygon" ? geom.coordinates : [geom.coordinates];
    var best = null, bestArea = -1;
    for (var i = 0; i < polys.length; i++) {
      var ring = polys[i][0] || [], area = 0;
      var minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
      for (var j = 0; j < ring.length; j++) {
        var c = ring[j], d = ring[(j + 1) % ring.length];
        area += c[0] * d[1] - d[0] * c[1];
        if (c[0] < minx) minx = c[0];
        if (c[1] < miny) miny = c[1];
        if (c[0] > maxx) maxx = c[0];
        if (c[1] > maxy) maxy = c[1];
      }
      area = Math.abs(area / 2);
      if (area > bestArea) { bestArea = area; best = [minx, miny, maxx, maxy]; }
    }
    return best || [104, 20, 120, 45];
  }

  // ---------- 地图 ----------
  var mapStyle = {
    version: 8,
    sources: {
      amap_img: { type: "raster", tiles: amapTiles(6), tileSize: 256, attribution: "高德地图" },
      amap_vec: { type: "raster", tiles: amapTiles(7), tileSize: 256, attribution: "高德地图" },
      provinces: { type: "geojson", data: GEO, promoteId: "adcode" }
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#0b1220" } },
      { id: "amap-img", type: "raster", source: "amap_img", paint: { "raster-opacity": 1 } },
      { id: "amap-vec", type: "raster", source: "amap_vec", layout: { visibility: "none" }, paint: { "raster-opacity": 1 } },
      {
        id: "province-fill", type: "fill", source: "provinces",
        filter: ["has", "slug"],
        paint: {
          "fill-color": stepColor("gdp").expr,
          // 选中省份几乎透明，让底图透出来，靠发光描边标识（active 优先于 hover）
          "fill-opacity": ["case", ["boolean", ["feature-state", "active"], false], 0.10, ["boolean", ["feature-state", "hover"], false], 0.86, 0.62]
        }
      },
      {
        id: "province-line", type: "line", source: "provinces", filter: ["has", "slug"],
        paint: { "line-color": "#0b1220", "line-width": 0.7, "line-opacity": 0.7 }
      },
      {
        id: "jd-line", type: "line", source: "provinces", filter: ["!", ["has", "slug"]],
        paint: { "line-color": "#38bdf8", "line-width": 1.1, "line-opacity": 0.9 }
      },
      // 选中省份的浮动光圈：外层光晕 + 内层实线
      {
        id: "province-halo", type: "line", source: "provinces", filter: ["has", "slug"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#67e8f9",
          "line-width": ["case", ["boolean", ["feature-state", "active"], false], 10, 0],
          "line-blur": 14,
          "line-opacity": ["case", ["boolean", ["feature-state", "active"], false], 0.5, 0]
        }
      },
      {
        id: "province-active", type: "line", source: "provinces", filter: ["has", "slug"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-width": ["case", ["boolean", ["feature-state", "active"], false], 2.4, 0],
          "line-opacity": ["case", ["boolean", ["feature-state", "active"], false], 0.95, 0]
        }
      },
    ]
  };

  // 光圈动画：用 rAF 逐帧改 paint 属性（MapLibre 图层是 canvas，没法用 CSS 动画）
  var GLOW_EXPR = {
    haloWidth: ["case", ["boolean", ["feature-state", "active"], false], 10, 0],
    haloOpacity: ["case", ["boolean", ["feature-state", "active"], false], 0.5, 0],
    ringOpacity: ["case", ["boolean", ["feature-state", "active"], false], 0.95, 0]
  };
  var glowRAF = null, glowT0 = 0;

  // 注意：每帧必须写「表达式」而不是纯数字。
  // 一旦用数字覆盖，非选中要素的 line-width 也会跟着变，结果 34 个省一起发光。
  function glowFrame(now) {
    var t = ((now - glowT0) % 1800) / 1800;            // 0 → 1，1.8s 一轮
    var s = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);      // 呼吸曲线
    var w = 6 + 10 * s, ho = 0.28 + 0.34 * (1 - s), ro = 0.62 + 0.36 * s;
    try {
      map.setPaintProperty("province-halo", "line-width",
        ["case", ["boolean", ["feature-state", "active"], false], w, 0]);
      map.setPaintProperty("province-halo", "line-opacity",
        ["case", ["boolean", ["feature-state", "active"], false], ho, 0]);
      map.setPaintProperty("province-active", "line-opacity",
        ["case", ["boolean", ["feature-state", "active"], false], ro, 0]);
    } catch (e) { /* 图层尚未就绪 */ }
    glowRAF = requestAnimationFrame(glowFrame);
  }

  function startGlow() {
    if (glowRAF) return;
    glowT0 = performance.now();
    glowRAF = requestAnimationFrame(glowFrame);
  }

  function stopGlow() {
    if (glowRAF) { cancelAnimationFrame(glowRAF); glowRAF = null; }
    try {
      map.setPaintProperty("province-halo", "line-width", GLOW_EXPR.haloWidth);
      map.setPaintProperty("province-halo", "line-opacity", GLOW_EXPR.haloOpacity);
      map.setPaintProperty("province-active", "line-opacity", GLOW_EXPR.ringOpacity);
    } catch (e) { /* ignore */ }
  }

  // 省份简称用 DOM 标注（不依赖 glyphs 字体服务，国内更稳）

  var map = new maplibregl.Map({
    container: "map",
    style: mapStyle,
    center: [104.5, 33.5],
    zoom: 3.55,
    minZoom: 2.4,
    maxZoom: 11,
    attributionControl: { compact: true }
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

  // ---------- 省份简称 DOM 标注 ----------
  var SMALL = { "北京": 1, "天津": 1, "上海": 1, "香港": 1, "澳门": 1, "宁夏": 1, "海南": 1 };
  var labelBox = document.createElement("div");
  labelBox.className = "map-labels";
  document.getElementById("map").appendChild(labelBox);
  var labelItems = [];

  (GEO.features || []).forEach(function (f) {
    var pr = f.properties || {};
    if (!pr.slug) return;
    var el = document.createElement("div");
    el.className = "map-label" + (SMALL[pr.short] ? " dim" : "");
    el.textContent = pr.short;
    el.title = pr.name;
    el.onclick = function (e) {
      e.stopPropagation();
      openProvince(pr.slug, true);
      var bb = bboxOf(f.geometry);
      map.fitBounds([[bb[0], bb[1]], [bb[2], bb[3]]], { padding: { top: 90, bottom: 60, left: 40, right: window.innerWidth > 900 ? 420 : 40 }, duration: 700 });
    };
    labelBox.appendChild(el);
    labelItems.push({ el: el, center: pr.center || pr.centroid, slug: pr.slug, short: pr.short });
  });

  function updateLabels() {
    var z = map.getZoom();
    for (var i = 0; i < labelItems.length; i++) {
      var it = labelItems[i];
      if (!it.center) { it.el.style.display = "none"; continue; }
      var p = map.project(it.center);
      if (p.x < -40 || p.y < -40 || p.x > map.getCanvas().width + 40 || p.y > map.getCanvas().height + 40) {
        it.el.style.display = "none";
        continue;
      }
      // 小省（京津沪港澳等）在缩小时隐藏，避免堆叠
      if (SMALL[it.short] && z < 4.2) { it.el.style.display = "none"; continue; }
      it.el.style.display = "";
      it.el.style.left = p.x + "px";
      it.el.style.top = p.y + "px";
    }
  }
  map.on("move", updateLabels);
  map.on("zoom", updateLabels);
  map.on("resize", updateLabels);
  map.on("rotate", updateLabels);

  var HOVER_KEY = "hover", ACTIVE_KEY = "active";
  var hoverId = null, activeId = null, popup = null;
  var currentMetric = "gdp";
  var openSlug = null;

  function setFeatureState(id, key, val) {
    if (id === null || id === undefined) return;
    try { map.setFeatureState({ source: "provinces", id: id }, (function () { var o = {}; o[key] = val; return o; })()); }
    catch (e) { /* ignore */ }
  }

  // ---------- 指标 / 年份切换 ----------
  var seg = document.getElementById("metricSeg");
  var yearSeg = document.getElementById("yearSeg");
  var currentYear = YEARS[YEARS.length - 1];

  METRICS.forEach(function (m) {
    var b = document.createElement("button");
    b.className = "seg-btn" + (m.key === currentMetric ? " active" : "");
    b.textContent = m.label;
    b.dataset.key = m.key;
    b.onclick = function () { setMetric(m.key); };
    seg.appendChild(b);
  });

  YEARS.forEach(function (y) {
    var b = document.createElement("button");
    b.className = "seg-btn" + (y === currentYear ? " active" : "");
    b.textContent = y;
    b.dataset.year = y;
    b.title = y === 2020
      ? "2020 年：GDP 为各省统计局公布数；人口为第七次全国人口普查标准时点（2020-11-01）数据"
      : y + " 年：GDP 为各省统计局公布数，人口为年末常住人口";
    b.onclick = function () { setYear(y); };
    yearSeg.appendChild(b);
  });

  function attrKey(metric, year) {
    return metric === "area" ? "area" : metric + "_" + (year || currentYear);
  }

  function setMetric(key) {
    currentMetric = key;
    refresh();
    Array.prototype.forEach.call(seg.children, function (b) {
      b.classList.toggle("active", b.dataset.key === key);
    });
  }

  function setYear(y) {
    currentYear = y;
    if (currentMetric === "area") currentMetric = "gdp";   // 面积无年份概念
    refresh();
    Array.prototype.forEach.call(seg.children, function (b) {
      b.classList.toggle("active", b.dataset.key === currentMetric);
    });
    if (openSlug) renderCard(openSlug);
  }

  function refresh() {
    var ak = attrKey(currentMetric, currentYear);
    var sc = stepColor(ak);
    map.setPaintProperty("province-fill", "fill-color", sc.expr);
    Array.prototype.forEach.call(yearSeg.children, function (b) {
      var y = Number(b.dataset.year);
      b.classList.toggle("active", y === currentYear);
      b.classList.toggle("disabled", currentMetric === "area");
    });
    updateLegend(currentMetric, currentYear, sc.steps);
    refreshCatalog();
  }

  // 目录抽屉里的数字跟随当前年份
  function refreshCatalog() {
    catalogCells.forEach(function (c) {
      var p = bySlug[c.slug];
      if (!p) return;
      c.el.innerHTML = "人口 " + round1(valOf(p, "pop", currentYear)) + " 万 · GDP " +
        fmtNum(valOf(p, "gdp", currentYear)) + "元";
    });
  }

  function metricOf(m) { return METRICS.filter(function (x) { return x.key === m; })[0]; }

  function fmtVal(key, v) {
    if (!isFinite(v)) return "—";
    if (key === "gdp") return v >= 10000 ? (v / 10000).toFixed(2) + "万亿" : Math.round(v).toLocaleString("zh-CN") + "亿";
    if (key === "pop") return v.toLocaleString("zh-CN", { maximumFractionDigits: 2 }) + "万";
    if (key === "pgdp") return Math.round(v / 1000) / 10 + "万";
    return v + "万km²";
  }

  function updateLegend(metric, year, steps) {
    var m = metricOf(metric) || { label: metric, unit: "" };
    var ak = attrKey(metric, year);
    document.getElementById("legendTitle").textContent =
      m.label + (metric === "area" ? "（不随年份变化）" : " · " + year + " 年");
    var vals = [], f = GEO.features || [];
    for (var i = 0; i < f.length; i++) {
      var pr = f[i].properties || {};
      if (pr.slug) vals.push(pr[ak]);
    }
    vals.sort(function (a, b) { return a - b; });
    var lo = vals[0], hi = vals[vals.length - 1];
    document.getElementById("legendScale").innerHTML =
      "<span>" + fmtVal(metric, lo) + "</span><span>" + fmtVal(metric, steps[Math.floor(steps.length / 2)]) + "</span><span>" + fmtVal(metric, hi) + "</span>";
    var note = document.getElementById("legendNote");
    if (note) {
      note.textContent = metric === "area"
        ? "陆地面积为固定值，年份切换对其无效"
        : (window.SERIES_NOTE || "港澳台数据口径与内地不同，仅作参照");
    }
  }

  // ---------- 底图切换 ----------
  Array.prototype.forEach.call(document.querySelectorAll("#basemapSeg .seg-btn"), function (b) {
    b.onclick = function () {
      var mode = b.dataset.bm;
      Array.prototype.forEach.call(b.parentNode.children, function (x) { x.classList.toggle("active", x === b); });
      map.setLayoutProperty("amap-img", "visibility", mode === "img" ? "visible" : "none");
      map.setLayoutProperty("amap-vec", "visibility", mode === "vec" ? "visible" : "none");
      map.setPaintProperty("province-fill", "fill-opacity",
        mode === "none"
          ? ["case", ["boolean", ["feature-state", "active"], false], 0.22, ["boolean", ["feature-state", "hover"], false], 0.95, 0.78]
          : ["case", ["boolean", ["feature-state", "active"], false], 0.10, ["boolean", ["feature-state", "hover"], false], 0.86, 0.62]);
    };
    if (b.dataset.bm === "img") b.classList.add("active");
  });

  // ---------- 交互：hover / click ----------
  map.on("mousemove", "province-fill", function (e) {
    map.getCanvas().style.cursor = "pointer";
    if (!e.features.length) return;
    var f = e.features[0];
    if (hoverId !== null && hoverId !== f.id) setFeatureState(hoverId, HOVER_KEY, false);
    hoverId = f.id;
    setFeatureState(hoverId, HOVER_KEY, true);
    var pr = f.properties;
    var m = metricOf(currentMetric);
    var v = pr[attrKey(currentMetric, currentYear)];
    var html = "<b>" + pr.name + "</b><br/>" + m.label + "：" + fmtVal(currentMetric, v) +
      (currentMetric === "area" ? "" : " <span style='opacity:.65'>（" + currentYear + "）</span>");
    if (!popup) popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 });
    popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
  });

  map.on("mouseleave", "province-fill", function () {
    map.getCanvas().style.cursor = "";
    if (hoverId !== null) { setFeatureState(hoverId, HOVER_KEY, false); hoverId = null; }
    if (popup) { popup.remove(); popup = null; }
  });

  map.on("click", "province-fill", function (e) {
    if (!e.features.length) return;
    var f = e.features[0];
    var slug = f.properties.slug;
    if (!slug) return;
    openProvince(slug, true);
    // 缩放到该省
    var bb = bboxOf(f.geometry);
    map.fitBounds([[bb[0], bb[1]], [bb[2], bb[3]]], { padding: { top: 90, bottom: 60, left: 40, right: window.innerWidth > 900 ? 420 : 40 }, duration: 700 });
  });

  // ---------- 省份卡片 ----------
  var panel = document.getElementById("cardPanel");
  var inner = document.getElementById("cardInner");

  function openProvince(slug, fly) {
    var p = bySlug[slug];
    if (!p) return;
    openSlug = slug;
    if (activeId !== null) setFeatureState(activeId, ACTIVE_KEY, false);
    // 找到该省的 feature id
    var feats = map.querySourceFeatures("provinces", { filter: ["==", ["get", "slug"], slug] });
    activeId = feats && feats.length ? feats[0].id : null;
    setFeatureState(activeId, ACTIVE_KEY, true);
    startGlow();
    labelItems.forEach(function (it) { it.el.classList.toggle("active", it.slug === slug); });

    renderCard(slug);
    panel.classList.add("open");
    if (window.innerWidth <= 900) document.getElementById("catalog").classList.remove("open");
    if (window.location.hash !== "#p/" + slug) {
      history.replaceState(null, "", "#p/" + slug);
    }
  }

  function renderCard(slug) {
    var p = bySlug[slug];
    if (p) inner.innerHTML = cardHtml(p);
  }

  function closeCard() {
    openSlug = null;
    panel.classList.remove("open");
    labelItems.forEach(function (it) { it.el.classList.remove("active"); });
    if (activeId !== null) { setFeatureState(activeId, ACTIVE_KEY, false); activeId = null; }
    stopGlow();
    history.replaceState(null, "", location.pathname + location.search);
  }

  document.getElementById("cardClose").onclick = closeCard;
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeCard(); });

  function yearLabel(y, metric) {
    if (metric === "pop") return y === 2020 ? "2020-11-01（七普）" : y + " 年末";
    return String(y);
  }

  function cardHtml(p) {
    var y = currentYear;
    var pop = valOf(p, "pop", y), gdp = valOf(p, "gdp", y), pgdp = valOf(p, "pgdp", y);
    var isHKMT = !!HKMT[p.code];
    var h = "";
    h += '<div class="c-head">';
    h += '<div class="c-name">' + p.name + '</div>';
    h += '<div class="c-meta">简称「' + p.short + '」· 省会/首府 ' + p.capital + ' · ' + p.region + ' · 面积 ' + p.area + ' 万 km²</div>';
    h += '<div class="c-tag">' + p.tag + '</div>';
    h += "</div>";

    h += '<div class="c-kpis">';
    h += '<div class="kpi"><div class="k">常住人口（' + yearLabel(y, "pop") + '）</div><div class="v">' + pop.toLocaleString("zh-CN", { maximumFractionDigits: 2 }) + '<small>万人</small></div>';
    h += '<div class="d">' + (y === 2025 && p.popDelta !== null && p.popDelta !== undefined
      ? "较上年 " + deltaHtml(p.popDelta, " 万人")
      : changeText(p, "pop", y)) + "</div></div>";
    h += '<div class="kpi"><div class="k">地区生产总值（' + y + '）</div><div class="v">' + fmtMoney(gdp) + "</div>";
    h += '<div class="d">' + (y === 2025 && p.gdpGrowth !== null && p.gdpGrowth !== undefined
      ? "增速 " + p.gdpGrowth + "%"
      : changeText(p, "gdp", y)) + "</div></div>";
    h += '<div class="kpi"><div class="k">人均 GDP（' + y + '）</div><div class="v">' + pgdp.toLocaleString("zh-CN") + '<small>元</small></div>';
    h += '<div class="d">全国 ' + rankOf("pgdp", y, pgdp) + "</div></div>";
    h += '<div class="kpi"><div class="k">最高点</div><div class="v">' + p.peak.alt + '<small>m</small></div>';
    h += '<div class="d">' + p.peak.name + "</div></div>";
    h += "</div>";

    h += trendTable(p);

    h += '<div class="c-sec"><h3>人口</h3><p><b>' + pop.toLocaleString("zh-CN", { maximumFractionDigits: 2 }) + ' 万人</b>（' + yearLabel(y, "pop") + '），' +
      (y === 2025
        ? (p.popDelta === null || p.popDelta === undefined ? "较上年数据口径不同。" :
          (p.popDelta >= 0 ? "较上年净增 <span class='up'>+" + p.popDelta + " 万人</span>，是全国人口净流入的主要目的地之一。" :
            "较上年减少 <span class='down'>" + p.popDelta + " 万人</span>，人口处于净流出或自然负增长状态。"))
        : "较 2020 年" + (pop - valOf(p, "pop", 2020) >= 0 ? "净增 <span class='up'>+" : "减少 <span class='down'>") +
          round1(pop - valOf(p, "pop", 2020)) + " 万人</span>。") +
      "</p></div>";

    h += '<div class="c-sec"><h3>GDP</h3><p>' + y + ' 年地区生产总值 <b>' + fmtNum(gdp) + "元</b>，" +
      (y === 2025 && p.gdpGrowth !== null && p.gdpGrowth !== undefined ? "同比增长 <b>" + p.gdpGrowth + "%</b>；" : "") +
      "经济总量居全国第 <b>" + rankOf("gdp", y, gdp) + "</b>，人均 GDP 约 <b>" + pgdp.toLocaleString("zh-CN") + "</b> 元" +
      (y === 2025 ? "" : "（按同年常住人口推算）") + "。</p></div>";

    h += '<div class="c-sec"><h3>水系</h3><p class="dim">' + p.waterSummary + "</p>";
    h += '<div class="chips">';
    p.rivers.forEach(function (r) { h += '<span class="chip water">' + r + "</span>"; });
    p.lakes.forEach(function (l) { h += '<span class="chip lake">' + l + "</span>"; });
    h += "</div></div>";

    h += '<div class="c-sec"><h3>地形</h3><p class="dim">' + p.terrain + "</p>";
    h += '<div class="chips"><span class="chip">最高峰：' + p.peak.name + " " + p.peak.alt + "m</span></div>";
    h += "</div>";

    h += '<div class="c-sec"><h3>之最</h3><ul class="best-list">';
    p.best.forEach(function (b, i) {
      h += "<li><span class='idx'>" + (i + 1) + "</span><div><div class='bt'>" + b.t + "</div><div class='bd'>" + b.d + "</div></div></li>";
    });
    h += "</ul></div>";

    if (p.note) h += '<div class="c-sec"><h3>口径说明</h3><p class="dim">' + p.note + "</p></div>";

    h += '<div class="c-actions"><a href="provinces/' + p.slug + '.html">查看完整省情页 →</a></div>';
    return h;
  }

  function rankOf(metric, year, val) {
    var vals = P.map(function (p) { return valOf(p, metric, year); })
      .filter(function (v) { return typeof v === "number" && isFinite(v); })
      .sort(function (a, b) { return b - a; });
    var i = vals.indexOf(val);
    return i >= 0 ? (i + 1) + " 位" : "—";
  }

  function rankText(key, val) { return rankOf(key, 2025, val); }

  function round1(v) { return Math.round(v * 10) / 10; }

  // 相对上一个可选年份的变化（百分比）
  function changeText(p, metric, year) {
    var i = YEARS.indexOf(year);
    if (i <= 0 || HKMT[p.code]) return "—";
    var prev = YEARS[i - 1];
    var a = valOf(p, metric, prev), b = valOf(p, metric, year);
    if (!a) return "—";
    var r = (b - a) / a * 100;
    var cls = r > 0 ? "up" : (r < 0 ? "down" : "");
    return "较 " + prev + " 年 <span class='" + cls + "'>" + (r > 0 ? "+" : "") + round1(r) + "%</span>";
  }

  // 历年数据小表（人口 / GDP / 人均 GDP）
  function trendTable(p) {
    var rows = [
      { k: "人口", u: "万人", m: "pop" },
      { k: "GDP", u: "亿元", m: "gdp" },
      { k: "人均 GDP", u: "元", m: "pgdp" }
    ];
    var h = '<div class="c-sec"><h3>历年数据 <span class="hint">2020 → 2025</span></h3>';
    h += '<table class="trend"><thead><tr><th></th>';
    YEARS.forEach(function (y) {
      h += '<th' + (y === currentYear ? ' class="on"' : "") + '>' + y + "</th>";
    });
    h += "</tr></thead><tbody>";
    rows.forEach(function (r) {
      h += "<tr><th>" + r.k + "<small>" + r.u + "</small></th>";
      YEARS.forEach(function (y) {
        var v = (HKMT[p.code] && y !== 2025) ? null : valOf(p, r.m, y);
        var txt = v === null || v === undefined ? "—"
          : (r.m === "pgdp" ? v.toLocaleString("zh-CN")
            : (r.m === "gdp" ? Math.round(v).toLocaleString("zh-CN") : round1(v).toLocaleString("zh-CN")));
        h += '<td' + (y === currentYear ? ' class="on"' : "") + ">" + txt + "</td>";
      });
      h += "</tr>";
    });
    h += "</tbody></table>";
    if (HKMT[p.code]) h += '<p class="dim" style="margin:8px 0 0">' + (window.SERIES_NOTE || "") + "</p>";
    h += "</div>";
    return h;
  }

  // ---------- 34 省目录 ----------
  var catalogCells = [];
  (function buildCatalog() {
    var body = document.getElementById("catalogBody");
    REGIONS.forEach(function (rg) {
      var list = P.filter(function (p) { return p.region === rg; });
      if (!list.length) return;
      var blk = document.createElement("div");
      blk.className = "region-block";
      var h = document.createElement("div");
      h.className = "region-title";
      h.textContent = rg + "（" + list.length + "）";
      blk.appendChild(h);
      var grid = document.createElement("div");
      grid.className = "pgrid";
      list.forEach(function (p) {
        var a = document.createElement("a");
        a.className = "pcell";
        a.href = "provinces/" + p.slug + ".html";
        var pgdpRank = rankText("pgdp", Math.round(p.gdp * 1e4 / p.pop));
        a.innerHTML = '<div class="pn">' + p.name.replace(/(省|市|自治区|特别行政区|壮族|回族|维吾尔)$/, "") +
          "<em>" + p.short + "</em></div>" +
          '<div class="pv">人口 ' + p.pop + " 万 · GDP " + fmtNum(p.gdp) + "元</div>";
        catalogCells.push({ slug: p.slug, el: a.querySelector(".pv") });
        grid.appendChild(a);
      });
      blk.appendChild(grid);
      body.appendChild(blk);
    });
  })();

  var cat = document.getElementById("catalog");
  document.getElementById("catalogToggle").onclick = function () {
    var open = cat.classList.toggle("open");
    this.setAttribute("aria-expanded", open ? "true" : "false");
  };
  document.getElementById("catalogClose").onclick = function () {
    cat.classList.remove("open");
    document.getElementById("catalogToggle").setAttribute("aria-expanded", "false");
  };

  // ---------- 初始化 ----------
  map.on("load", function () {
    setMetric("gdp");
    updateLabels();
    var m = (location.hash || "").match(/^#p\/(.+)$/);
    if (m && bySlug[m[1]]) {
      openProvince(m[1], false);
      var f = (GEO.features || []).filter(function (x) { return x.properties && x.properties.slug === m[1]; })[0];
      if (f) {
        var bb = bboxOf(f.geometry);
        map.fitBounds([[bb[0], bb[1]], [bb[2], bb[3]]], { padding: { top: 90, bottom: 60, left: 40, right: window.innerWidth > 900 ? 420 : 40 } });
      }
    }
  });
});
