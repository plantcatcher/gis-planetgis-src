/* 美国河流分布图 · 互动逻辑
   数据源：本地 Natural Earth 10m（全球版 + 北美区域版），六级分级；
   底图 Esri（WGS84）；州界半透明填充 + 细线；
   河流渲染/标注/详情卡沿用本站 cn-rivers 风格；左侧目录卡片为目录导航。 */
(function () {
  "use strict";

  var LEVEL_COLOR = { 1: "#ef4444", 2: "#38bdf8", 3: "#fbbf24", 4: "#34d399", 5: "#9ca3af", 6: "#cbd5e1" };
  var LEVEL_TEXT = { 1: "一级·主干", 2: "二级·主要支流", 3: "三级·较大支流", 4: "四级·支流", 5: "五级·细支流", 6: "六级·溪流" };
  var LEVEL_ORDER = [1, 2, 3, 4, 5, 6];

  // Esri 全球影像 / 地形晕渲（WGS84，免 key，CORS 友好）
  var ESRI_IMG = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  var ESRI_VEC = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}";

  function riverPaint(color, hoverColor, widthExpr, baseOpacity) {
    var hover = ["case", ["boolean", ["feature-state", "hover"], false], hoverColor, color];
    return {
      "line-width": widthExpr,
      "line-color": hover,
      "line-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, baseOpacity]
    };
  }

  var mapStyle = {
    version: 8,
    sources: {
      esri_img: { type: "raster", tiles: [ESRI_IMG], tileSize: 256, attribution: "Esri World Imagery" },
      esri_vec: { type: "raster", tiles: [ESRI_VEC], tileSize: 256, attribution: "Esri World Shaded Relief" },
      states: { type: "geojson", data: "data/states.geojson" },
      rivers: { type: "geojson", data: "data/rivers.json", promoteId: "fid" }
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#0b1220" } },
      { id: "esri-vec", type: "raster", source: "esri_vec", layout: { "visibility": "none" }, paint: { "raster-opacity": 1 } },
      {
        id: "esri-img", type: "raster", source: "esri_img", paint: {
          "raster-opacity": 1, "raster-brightness-max": 0.62, "raster-brightness-min": 0.06,
          "raster-saturation": -0.35, "raster-contrast": 0.08
        }
      },
      // 州界：半透明填充 + 细线（同 cn-rivers 省界色调，压暗底图、河流更突出）
      {
        id: "states-fill", type: "fill", source: "states",
        paint: { "fill-color": "#16233b", "fill-opacity": 0.2 }
      },
      {
        id: "states-line", type: "line", source: "states",
        paint: { "line-color": "#cbd5e1", "line-width": 0.8, "line-opacity": 0.85 }
      },
      // 河流：低级别先画、高级别盖在上层（线宽/悬停色/透明度与 cn-rivers 同族）
      {
        id: "rivers-l6", type: "line", source: "rivers", filter: ["==", ["get", "level"], 6],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: riverPaint(LEVEL_COLOR[6], "#f1f5f9",
          ["interpolate", ["linear"], ["zoom"], 5, 0.35, 11, 0.8], 0.55)
      },
      {
        id: "rivers-l5", type: "line", source: "rivers", filter: ["==", ["get", "level"], 5],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: riverPaint(LEVEL_COLOR[5], "#e5e7eb",
          ["interpolate", ["linear"], ["zoom"], 5, 0.6, 11, 1.1], 0.8)
      },
      {
        id: "rivers-l4", type: "line", source: "rivers", filter: ["==", ["get", "level"], 4],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: riverPaint(LEVEL_COLOR[4], "#bbf7d0",
          ["interpolate", ["linear"], ["zoom"], 4, 1.0, 10, 1.8], 0.85)
      },
      {
        id: "rivers-l3", type: "line", source: "rivers", filter: ["==", ["get", "level"], 3],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: riverPaint(LEVEL_COLOR[3], "#fef3c7",
          ["interpolate", ["linear"], ["zoom"], 3.5, 1.4, 9, 2.8], 0.9)
      },
      {
        id: "rivers-l2", type: "line", source: "rivers", filter: ["==", ["get", "level"], 2],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: riverPaint(LEVEL_COLOR[2], "#e0f2fe",
          ["interpolate", ["linear"], ["zoom"], 3, 1.8, 9, 3.6], 0.92)
      },
      {
        id: "rivers-l1", type: "line", source: "rivers", filter: ["==", ["get", "level"], 1],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: riverPaint(LEVEL_COLOR[1], "#fecaca",
          ["interpolate", ["linear"], ["zoom"], 3, 3, 9, 6], 0.95)
      }
    ]
  };

  var map = new maplibregl.Map({
    container: "map",
    style: mapStyle,
    center: [-96, 38.5],
    zoom: 3.9,
    minZoom: 2.5,
    maxZoom: 16,
    attributionControl: false
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
  map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-right");
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-right");
  window.__map = map;

  // 标注层注入到地图容器内
  var labelsEl = document.createElement("div");
  labelsEl.id = "labels";
  map.getContainer().appendChild(labelsEl);

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function geoLines(geom) {
    if (!geom) return [];
    var c = geom.coordinates;
    if (!c || !c.length) return [];
    return (typeof c[0][0] === "number") ? [c] : c;
  }
  function featBbox(lines) {
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (var a = 0; a < lines.length; a++) {
      var ln = lines[a];
      for (var b = 0; b < ln.length; b++) {
        if (ln[b][0] < minX) minX = ln[b][0];
        if (ln[b][0] > maxX) maxX = ln[b][0];
        if (ln[b][1] < minY) minY = ln[b][1];
        if (ln[b][1] > maxY) maxY = ln[b][1];
      }
    }
    return [minX, minY, maxX, maxY];
  }

  // ---------- 数据与目录 ----------
  var allRivers = [];
  var visibleLevels = {};
  LEVEL_ORDER.forEach(function (lv) { visibleLevels[lv] = lv <= 5; }); // 一~五级默认开（六级选开）
  var searchKw = "";

  function riverTitle(p) {
    if (!p.name) return "未命名河段";
    return p.nameZh ? (p.nameZh + " " + p.name) : p.name;
  }

  function buildLevelFilter() {
    var el = document.getElementById("level-filter");
    var html = "";
    for (var i = 0; i < LEVEL_ORDER.length; i++) {
      var lv = LEVEL_ORDER[i];
      var cnt = allRivers.filter(function (r) { return r.properties.level === lv; }).length;
      if (!cnt) continue;
      html += '<label class="lv-check' + (visibleLevels[lv] ? "" : " off") + '">' +
        '<input type="checkbox" data-lv="' + lv + '"' + (visibleLevels[lv] ? " checked" : "") + '>' +
        '<span class="dot" style="background:' + LEVEL_COLOR[lv] + '"></span>' +
        '<span class="lv-name">' + lv + '级</span>' +
        '<span class="lv-count">' + cnt + "</span></label>";
    }
    el.innerHTML = html;
    var inputs = el.querySelectorAll("input");
    for (var k = 0; k < inputs.length; k++) {
      inputs[k].addEventListener("change", function () {
        var lv = Number(this.dataset.lv);
        visibleLevels[lv] = this.checked;
        this.parentNode.classList.toggle("off", !this.checked);
        setVis("rivers-l" + lv, this.checked);
        requestLabelUpdate();
        buildRiverList();
      });
    }
  }

  function buildRiverList() {
    var list = document.getElementById("river-list");
    var kw = searchKw.toLowerCase();
    var rivers = allRivers.filter(function (r) {
      if (!visibleLevels[r.properties.level]) return false;
      if (!kw) return true;
      var p = r.properties;
      return (p.name && p.name.toLowerCase().indexOf(kw) >= 0) ||
             (p.nameZh && p.nameZh.indexOf(searchKw) >= 0) ||
             (p.nameAlt && p.nameAlt.toLowerCase().indexOf(kw) >= 0);
    });
    rivers = rivers.slice().sort(function (a, b) {
      return a.properties.level - b.properties.level || b.properties.lengthKm - a.properties.lengthKm;
    });
    var shown = rivers.slice(0, 300);
    var html = "";
    if (!shown.length) {
      html = '<div class="list-empty">没有匹配的河流</div>';
    }
    for (var i = 0; i < shown.length; i++) {
      var p = shown[i].properties;
      var c = LEVEL_COLOR[p.level];
      var meta = (p.basin ? p.basin + " · " : "") + p.lengthKm.toLocaleString() + " km";
      html += '<button class="river-item" data-fid="' + p.fid + '" style="--c:' + c + '">' +
        '<div class="ri-top"><span class="ri-name">' + esc(riverTitle(p)) + "</span>" +
        '<span class="ri-level">' + p.level + "级</span></div>" +
        '<div class="ri-meta">' + esc(meta) + "</div></button>";
    }
    list.innerHTML = html;
    document.getElementById("list-count").textContent = rivers.length > shown.length
      ? "显示 " + shown.length + " / " + rivers.length + " 条（输入关键词可精确查找）"
      : "共 " + rivers.length + " 条";

    var btns = list.querySelectorAll(".river-item");
    for (var j = 0; j < btns.length; j++) {
      btns[j].addEventListener("click", function () { focusRiver(this.dataset.fid, this); });
    }
  }

  function focusRiver(fid, btn) {
    var feat = null;
    for (var i = 0; i < allRivers.length; i++) {
      if (allRivers[i].properties.fid === fid) { feat = allRivers[i]; break; }
    }
    if (!feat) return;
    if (btn) {
      var old = document.querySelectorAll(".river-item.is-selected");
      for (var k = 0; k < old.length; k++) old[k].classList.remove("is-selected");
      btn.classList.add("is-selected");
    }
    var p = feat.properties;
    var bb = featBbox(geoLines(feat.geometry));
    var ctr = [(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2];
    if (isFinite(bb[0]) && bb[2] > bb[0] && bb[3] > bb[1]) {
      map.fitBounds([[bb[0], bb[1]], [bb[2], bb[3]]], { padding: 90, maxZoom: 9, duration: 900 });
    } else {
      map.flyTo({ center: ctr, zoom: 6.5, duration: 900 });
    }
    map.once("moveend", function () { showPopup(p, ctr); pinned = true; });
  }

  function updateStats() {
    var named = 0, segs = 0, len = 0, lvSet = {};
    for (var i = 0; i < allRivers.length; i++) {
      var p = allRivers[i].properties;
      if (p.name) named++;
      segs += Number(p.segCount) || 0;
      len += Number(p.lengthKm) || 0;
      lvSet[p.level] = true;
    }
    document.getElementById("stat-rivers").textContent = allRivers.length.toLocaleString();
    document.getElementById("stat-segs").textContent = segs.toLocaleString();
    document.getElementById("stat-len").textContent = len >= 10000
      ? Math.round(len / 10000) + "万" : Math.round(len).toLocaleString();
    document.getElementById("stat-lv").textContent = Object.keys(lvSet).length;
  }

  var searchInput = document.getElementById("search");
  searchInput.addEventListener("input", function () {
    searchKw = this.value.trim();
    buildRiverList();
  });

  // ---------- 标注层（HTML 叠加）----------
  var labelOn = true;
  var labelData = [];
  var rafPending = false;

  function buildLabelData(features) {
    labelData = features.map(function (f) {
      var lines = geoLines(f.geometry);
      var best = lines[0], bestLen = -1;
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].length > bestLen) { bestLen = lines[i].length; best = lines[i]; }
      }
      var lenDeg = 0;
      for (var m = 1; m < best.length; m++) {
        lenDeg += Math.hypot(best[m][0] - best[m - 1][0], best[m][1] - best[m - 1][1]);
      }
      var mid = best[Math.floor(best.length / 2)];
      return {
        fid: f.properties.fid, name: f.properties.name, nameZh: f.properties.nameZh || "",
        level: f.properties.level, lng: mid[0], lat: mid[1], lines: lines, lenDeg: lenDeg,
        bbox: featBbox(lines)
      };
    });
  }

  // 标注显隐阈值：五/六级与主干同档，zoom 5 起显名
  var ZOOM_L3 = 4.2, ZOOM_L4 = 5, ZOOM_L5 = 5, ZOOM_L6 = 5;
  var MAX_LABELS = 280, LABEL_MIN_DIST = 26, LABEL_EDGE = 30;

  function labelText(d) { return d.nameZh ? (d.nameZh + " " + d.name) : d.name; }

  function updateLabels() {
    if (!labelOn) { labelsEl.innerHTML = ""; return; }
    var z = map.getZoom();
    var show = {};
    for (var lv = 1; lv <= 6; lv++) {
      var zMin = lv === 1 ? 0 : lv === 2 ? 0 : lv === 3 ? ZOOM_L3 : lv === 4 ? ZOOM_L4 : lv === 5 ? ZOOM_L5 : ZOOM_L6;
      show[lv] = visibleLevels[lv] && z >= zMin;
    }

    var w = map.getCanvas().clientWidth, h = map.getCanvas().clientHeight;
    var bd = map.getBounds();
    var wmin = bd.getWest(), wmax = bd.getEast(), smin = bd.getSouth(), smax = bd.getNorth();
    var want = Math.max((wmax - wmin) * 0.5, 1e-6);
    var cx = w / 2, cy = h / 2;
    var budget = 80000;

    var cands = [];
    for (var i = 0; i < labelData.length && budget > 0; i++) {
      var d = labelData[i];
      if (!d.name) continue;
      if (!show[d.level]) continue;
      var bb = d.bbox;
      if (bb[2] < wmin || bb[0] > wmax || bb[3] < smin || bb[1] > smax) continue;

      var need = Math.max(10, Math.ceil(d.lenDeg / want));
      var lns = d.lines;
      var pt = null, bestD2 = Infinity;
      for (var li = 0; li < lns.length; li++) {
        var ln = lns[li];
        var step = Math.max(1, Math.floor(ln.length / need));
        for (var k = 0; k < ln.length; k += step) {
          var p = map.project(ln[k]);
          budget--;
          if (p.x >= LABEL_EDGE && p.x <= w - LABEL_EDGE && p.y >= 16 && p.y <= h - 16) {
            var d2 = (p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy);
            if (d2 < bestD2) { bestD2 = d2; pt = p; }
          }
        }
      }
      if (!pt) continue;
      cands.push({ d: d, x: pt.x, y: pt.y });
    }

    cands.sort(function (a, b) {
      var la = a.d.level, lb = b.d.level;
      if (la !== lb) return la - lb;
      var da = (a.x - cx) * (a.x - cx) + (a.y - cy) * (a.y - cy);
      var db = (b.x - cx) * (b.x - cx) + (b.y - cy) * (b.y - cy);
      return da - db;
    });

    var CELL = LABEL_MIN_DIST;
    var grid = {};
    var placed = [];
    var MIN2 = LABEL_MIN_DIST * LABEL_MIN_DIST;
    for (var ci = 0; ci < cands.length && placed.length < MAX_LABELS; ci++) {
      var c = cands[ci];
      var gx = Math.floor(c.x / CELL), gy = Math.floor(c.y / CELL);
      var hit = false;
      for (var ax = gx - 1; ax <= gx + 1 && !hit; ax++) {
        for (var ay = gy - 1; ay <= gy + 1 && !hit; ay++) {
          var bucket = grid[ax + "," + ay];
          if (!bucket) continue;
          for (var bi = 0; bi < bucket.length; bi++) {
            var o = bucket[bi];
            var ddx = o[0] - c.x, ddy = o[1] - c.y;
            if (ddx * ddx + ddy * ddy < MIN2) { hit = true; break; }
          }
        }
      }
      if (hit) continue;
      (grid[gx + "," + gy] || (grid[gx + "," + gy] = [])).push([c.x, c.y]);
      placed.push(c);
    }

    var html = "";
    for (var pi = 0; pi < placed.length; pi++) {
      var q = placed[pi];
      html += '<div class="lbl l' + q.d.level + '" style="left:' + q.x + "px;top:" + q.y + 'px">' + esc(labelText(q.d)) + "</div>";
    }
    labelsEl.innerHTML = html;
  }

  function requestLabelUpdate() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () { rafPending = false; updateLabels(); });
  }

  // ---------- 详情卡（悬停/点击共用，cn-rivers 风格：标题+级别徽章+键值表）----------
  function num(v, unit) { return (v && Number(v) > 0) ? Math.round(Number(v)).toLocaleString() + (unit ? " " + unit : "") : "–"; }
  function row(k, v) { return "<tr><td class=\"k\">" + k + "</td><td>" + v + "</td></tr>"; }
  function popupHTML(p) {
    var lv = p.levelText || (p.level + "级河流");
    var rows = "";
    rows += row("干流归属", p.basin ? esc(p.basin) : "—");
    rows += row("河　长", num(p.lengthKm, "km"));
    rows += row("干流跨度", num(p.spanKm, "km"));
    rows += row("河段数", p.segCount ? (Number(p.segCount) + " 段") : "");
    var c = LEVEL_COLOR[p.level] || "#38bdf8";
    return '<div class="pop" style="--c:' + c + '">' +
      "<h3>" + esc(riverTitle(p)) + '<span class="lv l' + p.level + '">' + esc(lv) + "</span></h3>" +
      '<table class="kv">' + rows + "</table>" +
      "</div>";
  }

  var popup = null, popupFid = null, pinned = false;
  function validLngLat(v) {
    if (!v) return null;
    // 同时接受 [lng, lat] 数组与 {lng, lat} 对象（目录卡片定位传数组）
    if (Array.isArray(v) && v.length >= 2 && isFinite(v[0]) && isFinite(v[1])) return { lng: v[0], lat: v[1] };
    return (isFinite(v.lng) && isFinite(v.lat)) ? v : null;
  }
  function showPopup(props, lngLat) {
    var ll = validLngLat(lngLat);
    if (!ll) {
      var feat = null;
      for (var i = 0; i < allRivers.length; i++) {
        if (allRivers[i].properties.fid === props.fid) { feat = allRivers[i]; break; }
      }
      var bb = feat ? featBbox(geoLines(feat.geometry)) : null;
      ll = (bb && isFinite(bb[0])) ? { lng: (bb[0] + bb[2]) / 2, lat: (bb[1] + bb[3]) / 2 } : map.getCenter();
    }
    if (popup && popupFid === props.fid) { popup.setLngLat(ll); return; }
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ offset: 12, closeButton: true, closeOnClick: false, className: "river-popup", maxWidth: "280px" })
      .setLngLat(ll)
      .setHTML(popupHTML(props))
      .addTo(map);
    popup.on("close", function () { popup = null; popupFid = null; pinned = false; });
    popupFid = props.fid;
  }
  function removePopup() { if (popup) popup.remove(); popup = null; popupFid = null; pinned = false; }

  // Escape 关闭钉住的弹卡（同海平面 rivers 页）
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && popup && pinned) removePopup();
  });

  // ---------- 吸附拾取（半径查询 + 最近要素）----------
  var HOVER_RADIUS = 16;
  var RIVER_LAYERS = ["rivers-l1", "rivers-l2", "rivers-l3", "rivers-l4", "rivers-l5", "rivers-l6"];

  function ptSegDist(px, py, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay;
    var len2 = dx * dx + dy * dy;
    var t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    var cx = ax + t * dx, cy = ay + t * dy;
    return Math.hypot(px - cx, py - cy);
  }
  function pickClosest(features, px, py) {
    var best = null, bestD = Infinity;
    for (var i = 0; i < features.length; i++) {
      var lines = geoLines(features[i].geometry);
      for (var l = 0; l < lines.length; l++) {
        var ln = lines[l];
        for (var j = 1; j < ln.length; j++) {
          var a = map.project(ln[j - 1]), b = map.project(ln[j]);
          var d = ptSegDist(px, py, a.x, a.y, b.x, b.y);
          if (d < bestD) { bestD = d; best = features[i]; }
        }
      }
    }
    return best;
  }
  function queryRivers(point) {
    var fs = map.queryRenderedFeatures(point, { layers: RIVER_LAYERS.filter(function (id) { return map.getLayer(id); }) });
    if (!fs.length) return null;
    return pickClosest(fs, point.x, point.y) || fs[0];
  }

  function bindRiverEvents() {
    var hovered = null;
    map.on("mousemove", function (e) {
      var f = queryRivers(e.point);
      if (f) {
        map.getCanvas().style.cursor = "pointer";
        if (hovered !== f.properties.fid) {
          if (hovered) map.setFeatureState({ source: "rivers", id: hovered }, { hover: false });
          hovered = f.properties.fid;
          map.setFeatureState({ source: "rivers", id: hovered }, { hover: true });
        }
        if (!pinned) showPopup(f.properties, e.lngLat);
      } else {
        map.getCanvas().style.cursor = "";
        if (hovered) { map.setFeatureState({ source: "rivers", id: hovered }, { hover: false }); hovered = null; }
        if (!pinned) removePopup();
      }
    });
    map.on("click", function (e) {
      var f = queryRivers(e.point);
      if (f) {
        if (hovered && hovered !== f.properties.fid) map.setFeatureState({ source: "rivers", id: hovered }, { hover: false });
        hovered = f.properties.fid;
        map.setFeatureState({ source: "rivers", id: hovered }, { hover: true });
        showPopup(f.properties, e.lngLat);
        pinned = true;
      } else {
        removePopup();
      }
    });
  }

  // ---------- 叠加开关（右上角面板）----------
  function setVis(id, on) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); }

  var statesOn = true, labelsBtn = document.getElementById("toggle-labels"), statesBtn = document.getElementById("toggle-states");
  statesBtn.addEventListener("click", function () {
    statesOn = !statesOn;
    this.setAttribute("aria-pressed", String(statesOn));
    setVis("states-fill", statesOn);
    setVis("states-line", statesOn);
  });
  labelsBtn.addEventListener("click", function () {
    labelOn = !labelOn;
    this.setAttribute("aria-pressed", String(labelOn));
    requestLabelUpdate();
  });

  // 底图三选一
  function setBasemap(mode) {
    setVis("esri-img", mode === "img");
    setVis("esri-vec", mode === "vec");
    var btns = document.querySelectorAll(".tool-btn[data-base]");
    for (var i = 0; i < btns.length; i++) btns[i].classList.toggle("active", btns[i].dataset.base === mode);
  }
  var bmBtns = document.querySelectorAll(".tool-btn[data-base]");
  for (var bi = 0; bi < bmBtns.length; bi++) {
    bmBtns[bi].addEventListener("click", function () { setBasemap(this.dataset.base); });
  }
  setBasemap("img");

  // ---------- 右上面板 开合 ----------
  var mapPanel = document.getElementById("map-panel");
  var mpTrigger = document.getElementById("mp-trigger");
  document.getElementById("mp-close").addEventListener("click", function () {
    mapPanel.classList.add("collapsed");
    mpTrigger.setAttribute("aria-expanded", "false");
    mpTrigger.classList.remove("is-hidden");
  });
  mpTrigger.addEventListener("click", function () {
    mapPanel.classList.remove("collapsed");
    this.setAttribute("aria-expanded", "true");
    this.classList.add("is-hidden");
  });

  // ---------- 左侧目录 开合 ----------
  var sidePanel = document.getElementById("side-panel");
  document.getElementById("panel-close").addEventListener("click", function () {
    sidePanel.classList.add("collapsed");
    document.getElementById("panel-open").setAttribute("aria-expanded", "false");
  });
  document.getElementById("panel-open").addEventListener("click", function () {
    sidePanel.classList.remove("collapsed");
    this.setAttribute("aria-expanded", "true");
  });

  // ---------- 启动 ----------
  function refreshRiverUI() {
    if (!allRivers.length) return;
    buildLabelData(allRivers);
    updateStats();
    buildLevelFilter();
    buildRiverList();
    updateLabels();
  }
  map.on("load", function () {
    bindRiverEvents();
    refreshRiverUI();
  });
  fetch("data/rivers.json")
    .then(function (r) { return r.json(); })
    .then(function (fc) { allRivers = fc.features; refreshRiverUI(); })
    .catch(function (e) { console.error("rivers.json 加载失败", e); });
  map.on("move", requestLabelUpdate);
  map.on("zoom", requestLabelUpdate);
})();
