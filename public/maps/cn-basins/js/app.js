/* 我国主要盆地分布图 · 互动逻辑（四大盆地 + 主要盆地盘点，USGS 真实边界） */
(function () {
  "use strict";

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
      amap_vec: { type: "raster", tiles: amapTiles(7), tileSize: 256, attribution: "高德地图" }, // 矢量路网+注记
      amap_img: { type: "raster", tiles: amapTiles(6), tileSize: 256, attribution: "高德地图" }, // 卫星影像(无标注)
      provinces: { type: "geojson", data: "/maps/_shared/china-provinces.json" },                // 省界(可选叠加, GCJ-02)
      basins: { type: "geojson", data: "data/basins.json", promoteId: "id" }                     // 盆地真实边界(GCJ-02)
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#0b1220" } },
      { id: "amap-vec", type: "raster", source: "amap_vec", layout: { "visibility": "none" }, paint: { "raster-opacity": 1 } },
      { id: "amap-img", type: "raster", source: "amap_img", paint: { "raster-opacity": 1 } },
      // 省级行政区边界：默认开启（填充降低透明度，避免遮挡卫星影像）
      { id: "province-fill", type: "fill", source: "provinces", paint: { "fill-color": "#16233b", "fill-opacity": 0.2 } },
      { id: "province-line", type: "line", source: "provinces", paint: { "line-color": "#cbd5e1", "line-width": 0.8, "line-opacity": 0.85 } },
      // 盆地：颜色来自要素自身的 color 属性（四大盆地配色更醒目）
      {
        id: "basin-fill", type: "fill", source: "basins",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 3, 0.34, 6, 0.5, 9, 0.6]
        }
      },
      {
        // 悬停高亮走描边颜色；line-width 必须为顶层 zoom interpolate（zoom 不能嵌套在 case 内）
        id: "basin-outline", type: "line", source: "basins",
        paint: {
          "line-width": ["interpolate", ["linear"], ["zoom"], 3, 1.6, 8, 2.4],
          "line-color": ["case", ["boolean", ["feature-state", "hover"], false], "#ffffff", "rgba(255,255,255,0.75)"]
        }
      }
    ]
  };

  var map = new maplibregl.Map({
    container: "map",
    style: mapStyle,
    center: [104, 36.5],
    zoom: 3.7,
    minZoom: 2.5,
    maxZoom: 14,
    attributionControl: false
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
  map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-right");
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-right");

  window.__map = map;   // 调试用：便于在控制台/自动化中访问地图实例

  // 标注层注入到地图容器内（确保弹窗层级高于标注，CSS 中 .maplibregl-popup z-index:30）
  var labelsEl = document.createElement("div");
  labelsEl.id = "labels";
  map.getContainer().appendChild(labelsEl);

  // ---------- 标注层（HTML 叠加，规避中文字形依赖）----------
  // 12 个盆地点位固定（质心），拖动仅重投影；小盆地名称放大到一定程度才出现，
  // 避免南阳 / 江汉 / 酒泉这些相邻小盆地在低层级互相压叠。
  var labelOn = true;
  var allBasins = [];     // fetch 到的要素数组

  function basinById(id) {
    for (var i = 0; i < allBasins.length; i++) {
      if (allBasins[i].properties.id === id) return allBasins[i];
    }
    return null;
  }

  function updateLabels() {
    if (!labelOn || !allBasins.length) { labelsEl.innerHTML = ""; return; }
    var w = map.getCanvas().clientWidth, h = map.getCanvas().clientHeight;
    var items = [];
    for (var i = 0; i < allBasins.length; i++) {
      var p = allBasins[i].properties;
      var pt = map.project(p.centroid);
      if (pt.x < 30 || pt.x > w - 30 || pt.y < 30 || pt.y > h - 30) continue; // 视野外
      items.push({ p: p, x: pt.x, y: pt.y });
    }
    // 其他盆地先渲染，四大盆地后渲染（DOM 越后层级越高，压在小标签之上）
    items.sort(function (a, b) { return (a.p.big4 ? 1 : 0) - (b.p.big4 ? 1 : 0); });
    var html = "";
    for (var k = 0; k < items.length; k++) {
      var it = items[k], pp = it.p;
      html += '<div class="lbl' + (pp.big4 ? "" : " small-basin") + '"' +
        ' data-id="' + pp.id + '" data-big="' + (pp.big4 ? "1" : "0") + '"' +
        ' style="left:' + it.x + "px;top:" + it.y + 'px">' +
        '<i class="dot" style="background:' + pp.color + '"></i>' + esc(pp.name) + "</div>";
    }
    labelsEl.innerHTML = html;
    deoverlapLabels();
  }

  // 小盆地标签若与其它标签重叠，向上/下轻推几次，避免文字压叠（四大盆地固定不动）
  function deoverlapLabels() {
    var els = labelsEl.querySelectorAll(".lbl");
    var placed = [];
    for (var i = 0; i < els.length; i++) {
      if (els[i].dataset.big === "1") placed.push(els[i].getBoundingClientRect());
    }
    for (var j = 0; j < els.length; j++) {
      var el = els[j];
      if (el.dataset.big === "1") continue;
      var baseTop = parseFloat(el.style.top);
      var nudges = [0, 16, -16, 32, -32, 48, -48];
      for (var t = 0; t < nudges.length; t++) {
        el.style.top = (baseTop + nudges[t]) + "px";
        var r = el.getBoundingClientRect();
        var hit = false;
        for (var q = 0; q < placed.length; q++) {
          if (intersects(placed[q], r)) { hit = true; break; }
        }
        if (!hit) break;
      }
      placed.push(el.getBoundingClientRect());
    }
  }
  function intersects(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }
  function requestLabelUpdate() {
    requestAnimationFrame(updateLabels);
  }
  // 标注点击 = 点击盆地（弹卡片并钉住），提升小盆地的可点中性
  labelsEl.addEventListener("click", function (e) {
    var lbl = e.target.closest(".lbl");
    if (!lbl) return;
    var f = basinById(Number(lbl.dataset.id));
    if (f) { showPopup(f.properties, f.properties.centroid); pinned = true; }
  });

  // ---------- 信息弹窗（悬停/点击共用，单一实例）----------
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function row(k, v) {
    if (v === "" || v == null) return "";
    return '<tr><td class="k">' + k + "</td><td>" + v + "</td></tr>";
  }
  function popupHTML(p) {
    var rows = "";
    rows += row("位　置", esc(p.location));
    rows += row("类　型", esc(p.type));
    rows += row("面　积", esc(p.area));
    rows += row("海　拔", esc(p.elevation));
    rows += row("特　征", esc(p.feature));
    return '<div class="pop">' +
      "<h3>" + esc(p.name) + '<span class="lv ' + (p.big4 ? "big4" : "other") + '">' +
      (p.big4 ? "四大盆地" : "主要盆地") + "</span></h3>" +
      '<table class="kv">' + rows + "</table>" +
      '<div class="fact"><b>盘点亮点</b>　' + esc(p.fact) + "</div>" +
      "</div>";
  }

  var popup = null, popupId = null, pinned = false;
  // lngLat 兜底：自动化脚本 fire('click', {point}) 这类合成事件没有 lngLat，
  // 退回要素自身质心，避免 setLngLat 抛错中断整段交互
  function toLL(v) {
    if (!v) return null;
    // queryRenderedFeatures 会把 GeoJSON 数组属性序列化成字符串（如 "[84,38]"），先还原
    if (typeof v === "string") {
      try { v = JSON.parse(v); } catch (_) { return null; }
    }
    if (Array.isArray(v)) return (isFinite(v[0]) && isFinite(v[1])) ? v : null;
    if (isFinite(v.lng) && isFinite(v.lat)) return [v.lng, v.lat];
    return null;
  }
  function showPopup(props, lngLat, html) {
    var ll = toLL(lngLat) || toLL(props.centroid) || map.getCenter().toArray();
    if (popup && popupId === props.id) { popup.setLngLat(ll); return; }
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ offset: 12, closeButton: true, closeOnClick: false })
      .setLngLat(ll)
      .setHTML(html || popupHTML(props))
      .addTo(map);
    popup.on("close", function () { popup = null; popupId = null; pinned = false; });
    popupId = props.id;
  }
  function removePopup() { if (popup) popup.remove(); popup = null; popupId = null; pinned = false; }

  // ---------- 交互：悬停 / 点击 ----------
  function bindBasinEvents() {
    var hovered = null;
    map.on("mousemove", function (e) {
      var fs = map.queryRenderedFeatures(e.point, { layers: ["basin-fill"] });
      if (fs.length) {
        map.getCanvas().style.cursor = "pointer";
        var id = fs[0].properties.id;
        if (hovered !== id) {
          if (hovered != null) map.setFeatureState({ source: "basins", id: hovered }, { hover: false });
          hovered = id;
          map.setFeatureState({ source: "basins", id: hovered }, { hover: true });
        }
        showPopup(fs[0].properties, e.lngLat); // 悬停即时弹出（层级由 CSS 保证高于名称标注）
      } else {
        map.getCanvas().style.cursor = "";
        if (hovered != null) { map.setFeatureState({ source: "basins", id: hovered }, { hover: false }); hovered = null; }
        if (!pinned) removePopup();
      }
    });
    map.on("click", function (e) {
      var fs = map.queryRenderedFeatures(e.point, { layers: ["basin-fill"] });
      if (fs.length) {
        var id = fs[0].properties.id;
        if (hovered != null && hovered !== id) map.setFeatureState({ source: "basins", id: hovered }, { hover: false });
        hovered = id;
        map.setFeatureState({ source: "basins", id: hovered }, { hover: true });
        showPopup(fs[0].properties, e.lngLat);
        pinned = true;
        markActive(id);
      } else {
        removePopup();
        markActive(null);
      }
    });
  }

  // ---------- 盆地盘点列表 ----------
  var listBig4 = document.getElementById("listBig4");
  var listOther = document.getElementById("listOther");
  function basinZoom(p) { return p.big4 ? 5 : 6.2; }
  function markActive(id) {
    var lis = document.querySelectorAll(".basin-list li");
    for (var i = 0; i < lis.length; i++) {
      lis[i].classList.toggle("active", id != null && Number(lis[i].dataset.id) === id);
    }
  }
  function buildList() {
    function item(f) {
      var p = f.properties;
      return '<li data-id="' + p.id + '">' +
        '<i class="cdot" style="background:' + p.color + '"></i>' +
        '<span class="bname">' + esc(p.name) + "</span>" +
        (p.big4 ? '<span class="b4">四大</span>' : "") +
        '<span class="barea">' + esc(shortArea(p.area)) + "</span>" +
        "</li>";
    }
    var big = [], other = [];
    allBasins.forEach(function (f) { (f.properties.big4 ? big : other).push(f); });
    function byAreaDesc(a, b) { return b.properties.area_num - a.properties.area_num; }
    big.sort(byAreaDesc); other.sort(byAreaDesc);
    listBig4.innerHTML = big.map(item).join("");
    listOther.innerHTML = other.map(item).join("");
    updateCount();
  }
  // 列表右侧的面积简写：取「约 X 万 km²」的数字部分，带状/串珠状的原文太长则截短
  function shortArea(area) {
    var m = /约 ([\d.]+) 万/.exec(area);
    if (m) return m[1] + " 万km²";
    return area.length > 8 ? area.slice(0, 8) + "…" : area;
  }
  function flyToBasin(f) {
    var p = f.properties;
    map.flyTo({ center: p.centroid, zoom: basinZoom(p), speed: 1.2 });
    map.once("moveend", function () { showPopup(p, p.centroid); pinned = true; markActive(p.id); });
  }
  document.querySelector(".ctrl-body").addEventListener("click", function (e) {
    var li = e.target.closest(".basin-list li");
    if (!li || !li.dataset.id) return;
    var f = basinById(Number(li.dataset.id));
    if (f) flyToBasin(f);
  });

  // ---------- 图层开关 ----------
  function setVis(id, on) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); }
  document.getElementById("chkBasins").addEventListener("change", function () {
    setVis("basin-fill", this.checked); setVis("basin-outline", this.checked);
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
  var ctrlToggle = document.getElementById("ctrlToggle");
  var ctrlHead = ctrlPanel.querySelector(".ctrl-head");
  var ctrlOpen = document.getElementById("ctrlOpen");

  function closePanel() {
    ctrlPanel.classList.add("is-closed");
    ctrlOpen.classList.add("show");
  }
  function openPanel() {
    ctrlPanel.classList.remove("is-closed");
    ctrlOpen.classList.remove("show");
    if (isMobile()) setSheet(true);
  }
  ctrlToggle.addEventListener("click", function (e) { e.stopPropagation(); closePanel(); });
  ctrlOpen.addEventListener("click", function () { openPanel(); });

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
      setSheet(dragDy < 0);
      suppressClick = true;
      setTimeout(function () { suppressClick = false; }, 350);
    }
    dragStartY = null; dragDy = 0; dragMoved = false;
  });

  // 计数
  function updateCount() {
    var n4 = allBasins.filter(function (f) { return f.properties.big4; }).length;
    document.getElementById("cnt").textContent =
      "共 " + allBasins.length + " 个盆地（四大盆地 " + n4 + " · 其他主要盆地 " + (allBasins.length - n4) + "）";
  }

  // ---------- 启动 ----------
  map.on("load", function () {
    bindBasinEvents();
    updateLabels();
  });
  fetch("data/basins.json")
    .then(function (r) { return r.json(); })
    .then(function (fc) {
      allBasins = fc.features;
      buildList();
      updateLabels();
    })
    .catch(function (e) { console.error("basins.json 加载失败", e); });
  map.on("move", requestLabelUpdate);
  map.on("zoom", requestLabelUpdate);
})();
