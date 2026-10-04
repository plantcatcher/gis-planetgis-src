/* 我国主要河流分布图 · 互动逻辑（一级 / 二级 / 三级 / 四级 / 五级） */
(function () {
  "use strict";

  var L1_COLOR = "#ef4444";   // 一级 红
  var L2_COLOR = "#38bdf8";   // 二级 蓝
  var L3_COLOR = "#fbbf24";   // 三级 橙
  var L4_COLOR = "#34d399";   // 四级 绿
  var L5_COLOR = "#9ca3af";   // 五级 灰
  var L9_COLOR = "#c084fc";   // 运河 紫（人工河道，不参与 1~5 级分级）

  // 高德免 key 瓦片（GCJ-02，带 CORS），subdomain 01~04 负载均衡
  function amapTiles(styleId) {
    return ["01", "02", "03", "04"].map(function (s) {
      return "https://wprd" + s + ".is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=" + styleId;
    });
  }

  // ---------- 地图样式 ----------
  // 默认：卫星影像（style=6 纯影像、无标注）；矢量路网（style=7）作为可切换项
  var mapStyle = {
    version: 8,
    sources: {
      amap_vec: { type: "raster", tiles: amapTiles(7), tileSize: 256, attribution: "高德地图" }, // 矢量路网+注记
      amap_img: { type: "raster", tiles: amapTiles(6), tileSize: 256, attribution: "高德地图" }, // 卫星影像(无标注)
      provinces: { type: "geojson", data: "/maps/_shared/china-provinces.json" },                          // 省界(可选叠加, GCJ-02)
      rivers: { type: "geojson", data: "data/rivers.json", promoteId: "fid" },                     // 河流(GCJ-02)
      water: { type: "geojson", data: "data/water-areas.json", promoteId: "fid" }                  // 水域面(GCJ-02)
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#0b1220" } },
      { id: "amap-vec", type: "raster", source: "amap_vec", layout: { "visibility": "none" }, paint: { "raster-opacity": 1 } },
      { id: "amap-img", type: "raster", source: "amap_img", paint: { "raster-opacity": 1 } },     // 卫星影像(无标注)
      // 省级行政区边界：默认开启（填充降低透明度，避免遮挡卫星影像）
      { id: "province-fill", type: "fill", source: "provinces", paint: { "fill-color": "#16233b", "fill-opacity": 0.2 } },
      { id: "province-line", type: "line", source: "provinces", paint: { "line-color": "#cbd5e1", "line-width": 0.8, "line-opacity": 0.85 } },
      // 水域面（湖泊 / 水库 / 双线河）：默认开启，位于河流线之下
      {
        // 仍全部绘制（双线河的水面本身是地理事实），但只让「有名字 或 面积 >= 20km²」的
        // 湖泊可点：721 个面里 693 个是无名双线河河段，中位面积 0.0 km²，
        // 若全部可点会把整张图的点击都劫持成「无名水域」。
        id: "water-fill", type: "fill", source: "water",
        paint: { "fill-color": "#1d4ed8", "fill-opacity": ["interpolate", ["linear"], ["zoom"], 3, 0.25, 9, 0.5] }
      },
      {
        id: "water-line", type: "line", source: "water",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#60a5fa", "line-width": 0.6, "line-opacity": 0.75 }
      },
      {
        id: "rivers-l2",
        type: "line",
        source: "rivers",
        filter: ["==", ["get", "level"], 2],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          // line-width 必须为顶层 zoom interpolate（zoom 不能嵌套在 case 内）
          "line-width": ["interpolate", ["linear"], ["zoom"], 3, 1.8, 9, 3.6],
          "line-color": ["case", ["boolean", ["feature-state", "hover"], false], "#e0f2fe", L2_COLOR],
          "line-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.92]
        }
      },
      {
        id: "rivers-l1",
        type: "line",
        source: "rivers",
        filter: ["==", ["get", "level"], 1],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-width": ["interpolate", ["linear"], ["zoom"], 3, 3, 9, 6],
          "line-color": ["case", ["boolean", ["feature-state", "hover"], false], "#fecaca", L1_COLOR],
          "line-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.95]
        }
      },
      {
        id: "rivers-l3",
        type: "line",
        source: "rivers",
        filter: ["==", ["get", "level"], 3],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-width": ["interpolate", ["linear"], ["zoom"], 3.5, 1.4, 9, 2.8],
          "line-color": ["case", ["boolean", ["feature-state", "hover"], false], "#fef3c7", L3_COLOR],
          "line-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.9]
        }
      },
      {
        id: "rivers-l4",
        type: "line",
        source: "rivers",
        filter: ["==", ["get", "level"], 4],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-width": ["interpolate", ["linear"], ["zoom"], 4, 1.0, 10, 1.8],
          "line-color": ["case", ["boolean", ["feature-state", "hover"], false], "#bbf7d0", L4_COLOR],
          "line-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.85]
        }
      },
      {
        id: "rivers-l5",
        type: "line",
        source: "rivers",
        filter: ["==", ["get", "level"], 5],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.5, 11, 0.9],
          "line-color": ["case", ["boolean", ["feature-state", "hover"], false], "#e5e7eb", L5_COLOR],
          "line-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.8]
        }
      },
      {
        // 人工运河：源数据 LEVEL_RIVE=9。用虚线与天然河道区分，宽度略粗以突出国家工程
        id: "rivers-l9",
        type: "line",
        source: "rivers",
        filter: ["==", ["get", "level"], 9],
        layout: { "line-cap": "butt", "line-join": "round" },
        paint: {
          "line-width": ["interpolate", ["linear"], ["zoom"], 4, 1.6, 10, 3.0],
          "line-dasharray": [3, 2],
          "line-color": ["case", ["boolean", ["feature-state", "hover"], false], "#f3e8ff", L9_COLOR],
          "line-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.95]
        }
      }
    ]
  };

  var map = new maplibregl.Map({
    container: "map",
    style: mapStyle,
    center: [104, 36],
    zoom: 3.6,
    minZoom: 2.5,
    maxZoom: 16,
    attributionControl: false
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
  map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-right");
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-right");

  window.__map = map;   // 调试用：便于在控制台/自动化中访问地图实例

  // 标注层注入到地图容器内（确保弹窗层级高于标注，参考 CSS 中 .maplibregl-popup z-index:30）
  var labelsEl = document.createElement("div");
  labelsEl.id = "labels";
  map.getContainer().appendChild(labelsEl);

  // ---------- 标注层（HTML 叠加，规避中文字形依赖）----------
  var labelOn = true;
  var labelData = []; // {fid, name, level, lng, lat, line, lenDeg, bbox}
  var rafPending = false;

  function buildLabelData(features) {
    labelData = features.map(function (f) {
      var lines = geoLines(f.geometry);            // MultiLineString -> 线数组
      var best = lines[0], bestLen = -1;
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].length > bestLen) { bestLen = lines[i].length; best = lines[i]; }
      }

      // 包围盒：用于快速剔除视野外的河流，避免逐锚点投影
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

      // 河段总长度（度）：用于按缩放级别自适应决定标注锚点密度
      var lenDeg = 0;
      for (var m = 1; m < best.length; m++) {
        lenDeg += Math.hypot(best[m][0] - best[m - 1][0], best[m][1] - best[m - 1][1]);
      }

      var mid = best[Math.floor(best.length / 2)];  // 供搜索定位使用
      return {
        fid: f.properties.fid, name: f.properties.name, level: f.properties.level,
        lng: mid[0], lat: mid[1], lines: lines, lenDeg: lenDeg, bbox: [minX, minY, maxX, maxY]
      };
    });
  }

  // 标注显隐阈值：放大到一定程度才显示 3/4/5 级细支流名称（1/2 级始终显示）
  // 三级放得比四、五级早（它是主要支流，全国视图下也需要 recognition），
  // 但配合下面的碰撞检测避免标注互相压叠。
  var ZOOM_L3 = 4.2;    // 三级名称出现的最小缩放级别
  var ZOOM_L4 = 5.2;    // 四级名称出现的最小缩放级别
  var ZOOM_L5 = 7;      // 五级名称出现的最小缩放级别
  var ZOOM_L9 = 4.2;    // 运河名称与三级同档（京杭运河北段在华北平原，很显眼）
  var MAX_LABELS = 260; // 单屏标注上限，避免细支流全开时卡顿
  // 标注碰撞：按优先级（1→5 级）依次放置，与已放置标注太近则跳过
  var LABEL_MIN_DIST = 26;   // px，同级/异级统一阈值，保证不重叠
  var LABEL_EDGE = 30;       // px，距画布边缘的最小留白

  function updateLabels() {
    if (!labelOn) { labelsEl.innerHTML = ""; return; }
    var z = map.getZoom();
    // 3/4/5 级名称仅在对应图层开启且缩放到达阈值后显示
    var showL3 = z >= ZOOM_L3 && document.getElementById("chkL3").checked;
    var showL4 = z >= ZOOM_L4 && document.getElementById("chkL4").checked;
    var showL5 = z >= ZOOM_L5 && document.getElementById("chkL5").checked;
    var showL9 = z >= ZOOM_L9 && document.getElementById("chkL9").checked;

    var w = map.getCanvas().clientWidth, h = map.getCanvas().clientHeight;
    // 视野经纬度范围：先按包围盒剔除，避免对全部要素逐锚点投影
    var bd = map.getBounds();
    var wmin = bd.getWest(), wmax = bd.getEast(), smin = bd.getSouth(), smax = bd.getNorth();

    // 期望锚点间距 ≈ 视野宽度的一半：缩放越大采样越密，保证名称始终落在视野内
    var want = Math.max((wmax - wmin) * 0.5, 1e-6);
    var cx = w / 2, cy = h / 2;
    var budget = 80000; // 单次更新的投影次数预算，避免极端缩放下拉卡顿

    // 先算出每条河的候选锚点，再按「等级优先 + 碰撞检测」择优落标：
    // 直接按数组顺序输出会让长河的标注被五级小支流挤掉，或彼此重叠成一片。
    var cands = [];
    for (var i = 0; i < labelData.length && budget > 0; i++) {
      var d = labelData[i];
      // 一/二级始终标注；三/四/五级按缩放级别与图层开关决定
      if (d.level === 3 && !showL3) continue;
      if (d.level === 4 && !showL4) continue;
      if (d.level === 5 && !showL5) continue;
      if (d.level === 9 && !showL9) continue;

      var bb = d.bbox;
      if (bb[2] < wmin || bb[0] > wmax || bb[3] < smin || bb[1] > smax) continue;   // 视野外

      // 自适应步长采样：遍历全部线段（多段河流的短分支也要能标名），
      // 在视野内挑离屏幕中心最近的顶点作为标注位置
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

    // 优先级：等级小的先放（1→5），同级按离屏幕中心近的先放
    cands.sort(function (a, b) {
      // 运河（level 9）优先级最低：它常与天然河道并行，不该挤掉同级天然河的标注
      var la = a.d.level === 9 ? 90 : a.d.level;
      var lb = b.d.level === 9 ? 90 : b.d.level;
      if (la !== lb) return la - lb;
      var da = (a.x - cx) * (a.x - cx) + (a.y - cy) * (a.y - cy);
      var db = (b.x - cx) * (b.x - cx) + (b.y - cy) * (b.y - cy);
      return da - db;
    });

    // 碰撞检测：网格加速（每 32px 一格），已占用的格内做过距离判定
    var CELL = LABEL_MIN_DIST;
    var grid = {};
    var placed = [];
    var MIN2 = LABEL_MIN_DIST * LABEL_MIN_DIST;
    var html = "", n = 0;
    for (var ci = 0; ci < cands.length && n < MAX_LABELS; ci++) {
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

    for (var pi = 0; pi < placed.length; pi++) {
      var q = placed[pi];
      var cls = "l" + q.d.level;   // 1/2/3/4/5/9 均已定义同名样式
      html += '<div class="lbl ' + cls + '" style="left:' + q.x + "px;top:" + q.y + 'px">' + esc(q.d.name) + "</div>";
      n++;
    }
    labelsEl.innerHTML = html;
  }

  function requestLabelUpdate() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () { rafPending = false; updateLabels(); });
  }

  // ---------- 信息弹窗（悬停/点击共用，单一实例）----------
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function row(k, v) {
    // 空值不占行：弹窗高度随信息量自适应，不留空档
    if (v === "" || v == null) return "";
    return '<tr><td class="k">' + k + "</td><td>" + v + "</td></tr>";
  }
  function num(v, unit) {
    return (v && Number(v) > 0) ? (Math.round(Number(v)).toLocaleString() + " " + unit) : "—";
  }

  // 河流弹窗字段设计：
  //   干流归属 —— 最有用。渭河→黄河、赣江→长江，一眼看出这条河最终流进哪条大河
  //   别名     —— 数据源里「汉江(汉水)」「京杭运河(里运河)」的同义名，检索/认知都有用
  //   河长     —— 规模感（数据源无长度字段，由几何折线算得）
  //   干流跨度 —— 反映流经范围（东西向）
  //   河段数   —— 1 段=数据源里是连续单段；多段说明被水库/河道切割，非断续
  //   拼音     —— 便于搜索框回显
  // 已按要求去掉「国标码」：源数据 GBCODE 与河名无稳定对应（见 build_cn_rivers.py 注释），
  // 是内部编码，展示了反而误导。
  function popupHTML(p) {
    var lv = p.levelText || (p.level + "级河流");
    var isTrunk = p.level === 1;
    var isCanal = p.level === 9;
    var rows = "";
    if (isCanal) {
      rows += row("类　型", "人工运河（源数据 LEVEL_RIVE=9）");
    } else {
      rows += row("干流归属", p.basin
        ? (isTrunk ? p.basin + "（本流为一级干流）" : "汇入 " + p.basin)
        : (isTrunk ? "一级干流" : "—"));
    }
    rows += row("别　名", p.alias ? esc(p.alias) : "");
    rows += row("河　长", num(p.lengthKm, "km"));
    rows += row("干流跨度", num(p.spanKm, "km"));
    rows += row("河段数", p.segCount ? (Number(p.segCount) + " 段") : "");
    rows += row("级　别", p.levelText || lv);
    rows += row("拼　音", p.pinyin ? esc(p.pinyin) : "");
    return '<div class="pop">' +
      "<h3>" + esc(p.name) + '<span class="lv l' + p.level + '">' + esc(lv) + "</span></h3>" +
      '<table class="kv">' + rows + "</table>" +
      "</div>";
  }

  // 水域面弹窗：面积取源数据 AREA 字段（万 km² × 10000），已核对青海湖 4490 / 太湖 2240
  function waterPopupHTML(p) {
    var unnamed = !p.name || p.name === "未命名水域";
    var rows = "";
    rows += row("类　型", p.lakeLevelText ? (p.lakeLevelText + "湖泊 / 水库") : "湖泊 / 水库 / 双线河");
    rows += row("面　积", num(p.areaKm2, "km²"));
    rows += row("水面片数", p.partCount ? (Number(p.partCount) + " 片") : "");
    rows += row("名　称", unnamed ? "无名（本图未收录名称）" : esc(p.name));
    return '<div class="pop">' +
      "<h3>" + esc(unnamed ? "无名水域" : p.name) + '<span class="lv lw">水域面</span></h3>' +
      '<table class="kv">' + rows + "</table>" +
      "</div>";
  }

  var popup = null, popupFid = null, pinned = false;
  function validLngLat(v) {
    return v && isFinite(v.lng) && isFinite(v.lat) ? v : null;
  }
  function showPopup(props, lngLat, html) {
    // 兜底：事件对象缺 lngLat 时（如自动化脚本 fire('click', {point})）退回要素自身坐标，
    // 避免 setLngLat 抛错导致整段交互中断
    var ll = validLngLat(lngLat);
    if (!ll) {
      var bb = props.bbox;
      ll = (bb && isFinite(bb[0])) ? { lng: (bb[0] + bb[2]) / 2, lat: (bb[1] + bb[3]) / 2 } : map.getCenter();
    }
    if (popup && popupFid === props.fid) { popup.setLngLat(ll); return; }
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ offset: 12, closeButton: true, closeOnClick: false })
      .setLngLat(ll)
      .setHTML(html || popupHTML(props))
      .addTo(map);
    popup.on("close", function () { popup = null; popupFid = null; pinned = false; });
    popupFid = props.fid;
  }
  function removePopup() { if (popup) popup.remove(); popup = null; popupFid = null; pinned = false; }

  // ---------- 吸附拾取（半径查询 + 最近要素）----------
  var HOVER_RADIUS = 16;       // 像素：鼠标附近多少范围内都能“吸附”到河流
  var RIVER_LAYERS = ["rivers-l1", "rivers-l2", "rivers-l3", "rivers-l4", "rivers-l5", "rivers-l9"];

  function geoLines(geom) {
    if (!geom) return [];
    var c = geom.coordinates;
    if (!c || !c.length) return [];
    // LineString: c[0] 是 [lon,lat]（数字）；MultiLineString: c[0] 是线（数组的数组）
    return (typeof c[0][0] === "number") ? [c] : c;
  }
  // 点到线段距离（像素空间）
  function ptSegDist(px, py, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay;
    var len2 = dx * dx + dy * dy;
    var t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    var cx = ax + t * dx, cy = ay + t * dy;
    return Math.hypot(px - cx, py - cy);
  }
  // 在候选要素里挑离鼠标最近的那个（提升“吸附”到细河的命中感）
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
  // 指针到某河流要素几何线的最短像素距离
  function riverDist(f, point) {
    var lines = geoLines(f.geometry);
    var best = Infinity;
    for (var l = 0; l < lines.length; l++) {
      var ln = lines[l];
      for (var j = 1; j < ln.length; j++) {
        var a = map.project(ln[j - 1]), b = map.project(ln[j]);
        var d = ptSegDist(point.x, point.y, a.x, a.y, b.x, b.y);
        if (d < best) best = d;
      }
    }
    return best;
  }
  function queryRivers(point) {
    var fs = map.queryRenderedFeatures(point, { layers: RIVER_LAYERS, radius: HOVER_RADIUS });
    if (!fs.length) return null;
    return pickClosest(fs, point.x, point.y) || fs[0];
  }

  // ---------- 交互：点击 / 悬停 ----------
  var allRivers = [];

  function bindRiverEvents() {
    var hovered = null;

    // 悬停：直接弹出信息卡片 + 高亮（带吸附半径，细河也好选中）
    map.on("mousemove", function (e) {
      var f = queryRivers(e.point);
      if (f) {
        map.getCanvas().style.cursor = "pointer";
        if (hovered !== f.properties.fid) {
          if (hovered) map.setFeatureState({ source: "rivers", id: hovered }, { hover: false });
          hovered = f.properties.fid;
          map.setFeatureState({ source: "rivers", id: hovered }, { hover: true });
        }
        showPopup(f.properties, e.lngLat); // 悬停即时弹出，不被河流名称遮挡（CSS 保证层级）
      } else {
        map.getCanvas().style.cursor = "";
        if (hovered) { map.setFeatureState({ source: "rivers", id: hovered }, { hover: false }); hovered = null; }
        if (!pinned) removePopup(); // 鼠标离开河流且未“钉住”时收起
      }
    });

    // 点击：水域面与河流在入湖口/河口处大量重叠（赣江入鄱阳湖等），
    // 因此按「谁离指针更近」取舍，而不是固定优先级 ——
    // 固定优先水域会让整张图都被 721 个水面（多数是无名双线河）劫持，点哪儿都是水域。
    map.on("click", function (e) {
      var f = queryRivers(e.point);
      var wf = map.queryRenderedFeatures(e.point, { layers: ["water-fill"] }).filter(function (x) {
        var p = x.properties || {};
        // 只让「有名字 或 面积 >= 20km²」的水域可点：721 个面里 693 个是无名双线河河段
        // （中位面积 0.0 km²），全放行会把整张图的点击劫持成「无名水域」
        return p.named === 1 || (p.areaKm2 >= 20);
      });
      // 河与湖在入湖口重叠时，若指针明确压在河线上（<=4px）算点河，否则算点湖。
      // 否则鄱阳湖、青海湖这类被入湖干流穿过的湖，用户永远点不到湖本身。
      if (f && wf.length && riverDist(f, e.point) > 4) f = null;
      if (f) {
        if (hovered && hovered !== f.properties.fid) map.setFeatureState({ source: "rivers", id: hovered }, { hover: false });
        hovered = f.properties.fid;
        map.setFeatureState({ source: "rivers", id: hovered }, { hover: true });
        showPopup(f.properties, e.lngLat);
        pinned = true;
      } else if (wf.length) {
        var wp = wf[0].properties;
        var wpt = [Number(wp.lng), Number(wp.lat)];
        showPopup(wp, isFinite(wpt[0]) && isFinite(wpt[1]) ? wpt : e.lngLat, waterPopupHTML(wp));
        pinned = true;
      } else {
        removePopup();
      }
    });
  }

  // ---------- 搜索 ----------
  var searchInput = document.getElementById("search");
  var searchResult = document.getElementById("searchResult");
  function renderSearch(q) {
    if (!q) { searchResult.innerHTML = ""; return; }
    var ql = q.toLowerCase();
    var hits = allRivers.filter(function (r) {
      var p = r.properties;
      // 别名也纳入检索：搜「汉水」能找到汉江，搜「里运河」能找到京杭运河
      return (p.name && p.name.indexOf(q) >= 0) ||
             (p.alias && p.alias.indexOf(q) >= 0) ||
             (p.pinyin && p.pinyin.toLowerCase().indexOf(ql) >= 0);
    }).slice(0, 30);
    if (!hits.length) { searchResult.innerHTML = '<li class="empty">无匹配河流</li>'; return; }
    searchResult.innerHTML = hits.map(function (r) {
      var p = r.properties;
      var sub = p.alias ? '<span class="alias">' + esc(p.alias) + "</span>" : "";
      return '<li data-fid="' + p.fid + '"><span>' + esc(p.name) + sub + "</span>" +
             '<span class="tag l' + p.level + '">' + (p.levelText || p.level) + "</span></li>";
    }).join("");
  }
  searchInput.addEventListener("input", function () { renderSearch(this.value.trim()); });
  searchResult.addEventListener("click", function (e) {
    var li = e.target.closest("li"); if (!li || !li.dataset.fid) return;
    var fid = li.dataset.fid;
    var river = allRivers.find(function (r) { return r.properties.fid === fid; });
    var feat = labelData.find(function (d) { return d.fid === fid; });
    if (river && feat) {
      map.flyTo({ center: [feat.lng, feat.lat], zoom: 6.5, speed: 1.2 });
      map.once("moveend", function () { showPopup(river.properties, [feat.lng, feat.lat]); pinned = true; });
    }
  });

  // ---------- 图层开关 ----------
  function setVis(id, on) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); }
  document.getElementById("chkL1").addEventListener("change", function () { setVis("rivers-l1", this.checked); requestLabelUpdate(); updateCount(); });
  document.getElementById("chkL2").addEventListener("change", function () { setVis("rivers-l2", this.checked); requestLabelUpdate(); updateCount(); });
  document.getElementById("chkL3").addEventListener("change", function () { setVis("rivers-l3", this.checked); requestLabelUpdate(); updateCount(); });
  document.getElementById("chkL4").addEventListener("change", function () { setVis("rivers-l4", this.checked); requestLabelUpdate(); updateCount(); });
  document.getElementById("chkL5").addEventListener("change", function () { setVis("rivers-l5", this.checked); requestLabelUpdate(); updateCount(); });
  document.getElementById("chkL9").addEventListener("change", function () { setVis("rivers-l9", this.checked); requestLabelUpdate(); updateCount(); });
  document.getElementById("chkWater").addEventListener("change", function () {
    setVis("water-fill", this.checked);
    setVis("water-line", this.checked);
  });
  document.getElementById("chkBorder").addEventListener("change", function () {
    setVis("province-fill", this.checked); setVis("province-line", this.checked);
  });
  document.getElementById("chkLabel").addEventListener("change", function () { labelOn = this.checked; requestLabelUpdate(); });

  // 底图三选一：卫星影像(img) / 矢量路网(vec) / 无底图(none)（均免 key）
  function setBasemap(mode) {
    setVis("amap-img", mode === "img");
    setVis("amap-vec", mode === "vec");
    var opts = document.querySelectorAll(".bm-opt");
    for (var i = 0; i < opts.length; i++) {
      var r = opts[i].querySelector("input");
      if (r) opts[i].classList.toggle("active", r.checked);
    }
  }
  var bmRadios = document.querySelectorAll('input[name="basemap"]');
  for (var bi = 0; bi < bmRadios.length; bi++) {
    bmRadios[bi].addEventListener("change", function () { setBasemap(this.value); });
  }
  var bmChecked = document.querySelector('input[name="basemap"]:checked');
  setBasemap(bmChecked ? bmChecked.value : "img");

  // ---------- 折叠 / 移动端底部抽屉 ----------
  var ctrlPanel = document.getElementById("ctrlPanel");
  var ctrlBody = ctrlPanel.querySelector(".ctrl-body");
  var ctrlToggle = document.getElementById("ctrlToggle");
  var ctrlHead = ctrlPanel.querySelector(".ctrl-head");

  // 桌面端：折叠/展开 主体
  ctrlToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    var collapsed = ctrlBody.classList.toggle("collapsed");
    this.textContent = collapsed ? "＋" : "－";
  });

  // 移动端：底部抽屉（点击把手切换；上拉展开、下拉收起）
  var isMobile = function () { return window.innerWidth <= 720; };
  var sheetOpen = false;
  function setSheet(open) {
    sheetOpen = open;
    ctrlPanel.classList.toggle("open", open);
  }
  var suppressClick = false;
  ctrlHead.addEventListener("click", function (e) {
    if (!isMobile()) return;
    if (e.target === ctrlToggle) return;
    if (suppressClick) return;
    setSheet(!sheetOpen);
  });
  var dragStartY = null, dragDy = 0, dragMoved = false;
  ctrlHead.addEventListener("touchstart", function (e) {
    if (!isMobile()) return;
    dragStartY = e.touches[0].clientY; dragDy = 0; dragMoved = false;
  }, { passive: true });
  ctrlHead.addEventListener("touchmove", function (e) {
    if (dragStartY === null) return;
    dragDy = e.touches[0].clientY - dragStartY;
    if (Math.abs(dragDy) > 6) dragMoved = true;
  }, { passive: true });
  ctrlHead.addEventListener("touchend", function () {
    if (dragStartY === null) return;
    if (dragMoved) {
      setSheet(dragDy < 0);   // 上拉展开，下拉收起
      suppressClick = true;
      setTimeout(function () { suppressClick = false; }, 350);
    }
    dragStartY = null; dragDy = 0; dragMoved = false;
  });

  // 计数（位于“图层与显示”面板内）
  function updateCount() {
    function cnt(lv) { return allRivers.filter(function (r) { return r.properties.level === lv; }).length; }
    var n1 = document.getElementById("chkL1").checked ? cnt(1) : 0;
    var n2 = document.getElementById("chkL2").checked ? cnt(2) : 0;
    var n3 = document.getElementById("chkL3").checked ? cnt(3) : 0;
    var n4 = document.getElementById("chkL4").checked ? cnt(4) : 0;
    var n5 = document.getElementById("chkL5").checked ? cnt(5) : 0;
    var n9 = document.getElementById("chkL9").checked ? cnt(9) : 0;
    document.getElementById("cnt").textContent = "当前显示 " + (n1 + n2 + n3 + n4 + n5 + n9) +
      " 条（一级 " + n1 + " / 二级 " + n2 + " / 三级 " + n3 + " / 四级 " + n4 + " / 五级 " + n5 + " / 运河 " + n9 + "）";
  }

  // ---------- 启动 ----------
  function refreshRiverUI() {
    if (allRivers && allRivers.length) {
      buildLabelData(allRivers);
      updateLabels();
      updateCount();
    }
  }
  map.on("load", function () {
    bindRiverEvents();
    refreshRiverUI();
  });
  // 独立加载河流数据用于搜索与标注，避免依赖 source 内部 _data 的加载时机
  fetch("data/rivers.json")
    .then(function (r) { return r.json(); })
    .then(function (fc) { allRivers = fc.features; refreshRiverUI(); })
    .catch(function (e) { console.error("rivers.json 加载失败", e); });
  map.on("move", requestLabelUpdate);
  map.on("zoom", requestLabelUpdate);
})();
