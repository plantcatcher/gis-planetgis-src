/* 豆瓣电影 Top250 全球分布图 · 互动逻辑 v2
   国家填色：0 部灰色，1 部起绿→黄→红渐变；国家标签显示「国名 + 数量」，不用圆点；
   点击国家填色区域或标签弹出「海报墙」卡片：按排名排列，9.0+ 金边，海报走本地文件。
   时间轴按上映年份回放 1931—2023；默认 Esri 卫星影像底图。
   数据口径：豆瓣电影 Top250 2026-11-23 快照；主产国法取第一制片国；
   中国香港/中国台湾/中国大陆按一个中国原则合并为「中国」。 */
(function () {
  "use strict";

  // 0 部固定灰色；1 部起按数量绿→黄→红渐变（数量越多越红）
  var STOPS = [
    [0, "#4b5563"], [1, "#15803d"], [3, "#22c55e"], [6, "#84cc16"],
    [12, "#eab308"], [20, "#f97316"], [45, "#ef4444"], [100, "#b91c1c"]
  ];
  function colorStops(field) {
    var f = field || "count";
    var rest = STOPS.slice(1).reduce(function (a, s) { a.push(s[0], s[1]); return a; }, []);
    return ["case",
      ["==", ["coalesce", ["get", f], 0], 0], STOPS[0][1],
      ["interpolate", ["linear"], ["coalesce", ["get", f], 0]].concat(rest)
    ];
  }
  // hover 高亮只放在 fill-color 的 case 里；zoom 表达式必须保持顶层，不能嵌进 case
  function fillColorExpr() {
    return ["case", ["boolean", ["feature-state", "hover"], false], "#fde68a", colorStops("dbCount")];
  }

  var isMobile = window.innerWidth <= 760;
  var INIT_ZOOM = isMobile ? 0.15 : 1.5;
  var MIN_ZOOM = isMobile ? 0 : 1.5;

  var ESRI_IMG = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  var ESRI_RELIEF = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}";

  var mapStyle = {
    version: 8,
    sources: {
      esri_img:    { type: "raster", tiles: [ESRI_IMG], tileSize: 256, attribution: "Esri World Imagery" },
      esri_relief: { type: "raster", tiles: [ESRI_RELIEF], tileSize: 256, attribution: "Esri World Shaded Relief" },
      countries:   { type: "geojson", data: "data/country-fills.geojson", promoteId: "dbIso" }
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#0d0a06" } },
      { id: "esri-img", type: "raster", source: "esri_img", layout: { visibility: "visible" },
        paint: { "raster-opacity": 0.92, "raster-brightness-max": 0.85, "raster-saturation": -0.2 } },
      { id: "esri-relief", type: "raster", source: "esri_relief", layout: { visibility: "none" },
        paint: { "raster-opacity": 0.85 } },
      {
        id: "country-fill", type: "fill", source: "countries",
        paint: {
          "fill-color": fillColorExpr(),
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 1.5, 0.74, 4.5, 0.44, 7.0, 0]
        }
      },
      { id: "country-line", type: "line", source: "countries",
        paint: { "line-color": "#8a7350", "line-width": 0.6, "line-opacity": 0.5 } }
    ]
  };

  var map = new maplibregl.Map({
    container: "map", style: mapStyle,
    center: isMobile ? [20, 25] : [-8, 25],
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
  var markets = [], movies = [], marketByIso = {}, moviesByIso = {}, continentCount = {};
  var countryRaw = null, meta = {};
  var viewYear = 2023;
  var labelOn = true;
  var detailOpen = false, popupId = null, pinned = false;
  var rafPending = false;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function bandColor(c) {
    for (var i = STOPS.length - 1; i >= 0; i--) if (c >= STOPS[i][0]) return STOPS[i][1];
    return STOPS[0][1];
  }

  // ---------- 海报墙详情卡 ----------
  function visibleMovies(iso) {
    var list = moviesByIso[iso] || [];
    return list.filter(function (m) { return m.year <= viewYear; });
  }
  function visibleProps(iso) {
    var c = marketByIso[iso];
    if (!c) return null;
    var p = { id: c.iso, name: c.name, nameEn: c.nameEn, continent: c.continent,
      count: visibleMovies(c.iso).length, avgRating: c.avgRating, bestRank: c.bestRank };
    return p;
  }
  function posterHTML(m) {
    var gold = m.rating >= 9.0 ? " gold" : "";
    var poster = m.poster
      ? '<img src="' + esc(m.poster) + '" loading="lazy" alt="' + esc(m.title) + '海报" onerror="this.style.display=\'none\';this.parentNode.classList.add(\'noimg\')" />'
      : "";
    return '<a class="poster-card' + gold + '" href="https://movie.douban.com/subject/' + (m.doubanId || "") + '" target="_blank" rel="noopener" title="' + esc(m.title) + " · " + m.year + " · 豆瓣评分 " + m.rating.toFixed(1) + '">' +
      '<div class="pc-img">' + poster + '<span class="pc-ph">' + esc(m.title.slice(0, 4)) + "</span>" +
      '<span class="pc-rank">#' + m.rank + "</span>" +
      '<span class="pc-badges"><b class="pc-score">' + m.rating.toFixed(1) + '</b><i class="pc-year">' + m.year + '</i></span>' +
      "</div>" +
      '<div class="pc-title" title="' + esc(m.title) + '">' + esc(m.title) + "</div></a>";
  }
  function marketPopupHTML(p) {
    var c = Number(p.count) || 0;
    var col = bandColor(c);
    var list = visibleMovies(p.id);
    var grid = list.map(posterHTML).join("");
    if (!list.length) grid = '<div class="pw-empty">该年份前暂无上榜电影</div>';
    return '<div class="pop pw" style="--c:' + col + '">' +
      '<div class="pw-head"><h3>' + esc(p.name) + " <span class='era-tag' style='background:" + col + ";color:#fff'>" + c + " 部</span></h3>" +
      '<div class="pw-sub">' + esc(p.nameEn) + " · " + esc(p.continent) + " · 均分 " + Number(p.avgRating).toFixed(2) + " · 最高 #" + p.bestRank + " · 完整榜单 " + list.length + " 部</div></div>" +
      '<div class="pw-grid">' + grid + "</div>" +
      '<div class="note">按第一制片国计入 · 中国香港/台湾/大陆并入中国 · 海报存于本站 · 9.0+ 金边 · 点海报跳原页</div>' +
      "</div>";
  }

  // ---------- 右侧详情面板（完整榜单） ----------
  var detailPanel = document.getElementById("detail-panel");
  var detailBody = document.getElementById("dp-body");
  function showPopup(props) {
    if (!props) return;
    detailBody.innerHTML = marketPopupHTML(props);
    detailBody.scrollTop = 0;
    detailPanel.classList.add("open");
    detailPanel.setAttribute("aria-hidden", "false");
    detailOpen = true;
    popupId = props.id;
    pinned = true;
  }
  function removePopup() {
    detailPanel.classList.remove("open");
    detailPanel.setAttribute("aria-hidden", "true");
    detailOpen = false;
    popupId = null;
    pinned = false;
  }
  document.getElementById("dp-close").addEventListener("click", removePopup);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && detailOpen) removePopup(); });

  // ---------- 国家填色区域交互 ----------
  function bindStoreEvents() {
    var hovered = null;
    function hitIso(fs) {
      for (var i = 0; i < fs.length; i++) {
        var iso = fs[i].properties && fs[i].properties.dbIso;
        if (iso && marketByIso[iso]) return iso;
      }
      return null;
    }
    map.on("mousemove", function (e) {
      var iso = hitIso(map.queryRenderedFeatures(e.point, { layers: ["country-fill"] }));
      if (iso) {
        map.getCanvas().style.cursor = "pointer";
        if (hovered !== iso) {
          if (hovered) map.setFeatureState({ source: "countries", id: hovered }, { hover: false });
          hovered = iso;
          map.setFeatureState({ source: "countries", id: hovered }, { hover: true });
        }
      } else {
        map.getCanvas().style.cursor = "";
        if (hovered) { map.setFeatureState({ source: "countries", id: hovered }, { hover: false }); hovered = null; }
      }
    });
    map.on("click", function (e) {
      var iso = hitIso(map.queryRenderedFeatures(e.point, { layers: ["country-fill"] }));
      if (iso) { showPopup(visibleProps(iso), e.lngLat); pinned = true; }
      else removePopup();
    });
  }

  // ---------- 国家标注：国名 + 数量（无圆点） ----------
  var LBL_MIN_DIST = isMobile ? 58 : 84;
  function updateLabels() {
    if (!labelOn) { labelsEl.innerHTML = ""; return; }
    var w = map.getCanvas().clientWidth, h = map.getCanvas().clientHeight;
    var leftEdge = w > 760 ? 320 : 40;
    var cands = [];
    for (var i = 0; i < markets.length; i++) {
      var c = markets[i];
      var n = visibleMovies(c.iso).length;
      if (!n) continue;
      for (var k = -1; k <= 1; k++) {
        var p = map.project([c.lng + k * 360, c.lat]);
        if (p.x < leftEdge || p.x > w - 50 || p.y < 30 || p.y > h - 30) continue;
        cands.push({ c: c, x: p.x, y: p.y, n: n });
      }
    }
    cands.sort(function (a, b) { return b.n - a.n; });
    var html = "", grid = {}, n = 0, MAX = isMobile ? 16 : 44;
    for (var q = 0; q < cands.length && n < MAX; q++) {
      var t = cands[q];
      var lx = (t.x - 46 < leftEdge) ? t.x + 46 : t.x;
      var gx = Math.floor(lx / LBL_MIN_DIST), gy = Math.floor(t.y / LBL_MIN_DIST), hit = false;
      for (var ax = gx - 1; ax <= gx + 1 && !hit; ax++)
        for (var ay = gy - 1; ay <= gy + 1 && !hit; ay++) {
          var bucket = grid[ax + "," + ay];
          if (!bucket) continue;
          for (var bi = 0; bi < bucket.length; bi++) {
            var o = bucket[bi], ddx = o[0] - lx, ddy = o[1] - t.y;
            if (ddx * ddx + ddy * ddy < LBL_MIN_DIST * LBL_MIN_DIST) { hit = true; break; }
          }
        }
      if (hit) continue;
      (grid[gx + "," + gy] || (grid[gx + "," + gy] = [])).push([lx, t.y]);
      var col = bandColor(t.n);
      html += '<div class="city-lbl" data-iso="' + esc(t.c.iso) + '" style="left:' + lx + "px;top:" + t.y + "px;border-color:" + col + '">' +
        esc(t.c.name) + '<span class="cc" style="color:' + col + '">' + t.n + "</span></div>";
      n++;
    }
    labelsEl.innerHTML = html;
    var els = labelsEl.querySelectorAll(".city-lbl");
    for (var m = 0; m < els.length; m++) {
      els[m].addEventListener("click", function () { focusMarket(this.getAttribute("data-iso"), null); });
    }
  }
  function requestLabelUpdate() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () { rafPending = false; updateLabels(); });
  }

  // ---------- 左侧目录 ----------
  function updateStats() {
    document.getElementById("stat-stores").textContent = fmt(meta.total || 0);
    document.getElementById("stat-cities").textContent = meta.markets || 0;
    document.getElementById("stat-provs").textContent = meta.continents || 0;
  }
  function buildLegend() {
    var html = '<span class="lg-item"><i style="background:' + STOPS[0][1] + '"></i>0 部</span>';
    for (var i = 1; i < STOPS.length; i++) {
      var label = i === STOPS.length - 1 ? "≥" + fmt(STOPS[i][0]) : fmt(STOPS[i][0]);
      html += '<span class="lg-item"><i style="background:' + STOPS[i][1] + '"></i>' + label + "</span>";
    }
    document.getElementById("era-filter").innerHTML = html;
  }

  var searchKw = "", contFilter = "all";
  function buildMarketList() {
    var list = document.getElementById("city-list");
    var kw = searchKw.toLowerCase();
    var items = markets.filter(function (c) {
      if (contFilter !== "all" && c.continent !== contFilter) return false;
      if (!kw) return true;
      if (c.name.toLowerCase().indexOf(kw) >= 0 || c.nameEn.toLowerCase().indexOf(kw) >= 0) return true;
      var ms = moviesByIso[c.iso] || [];
      for (var i = 0; i < ms.length; i++) {
        if (ms[i].title.indexOf(searchKw) >= 0 || ms[i].titleEn.toLowerCase().indexOf(kw) >= 0) return true;
      }
      return false;
    });
    items.sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name, "zh"); });
    if (!items.length) { list.innerHTML = '<div class="list-empty">没有匹配的国家或电影</div>'; }
    else {
      list.innerHTML = items.map(function (c) {
        var m2 = c.continent + " · 均分 " + Number(c.avgRating).toFixed(2) + " · 最高 #" + c.bestRank;
        return '<button class="city-item" data-iso="' + esc(c.iso) + '">' +
          '<div class="ci-top"><span class="ci-name">' + esc(c.name) + "</span>" +
          '<span class="ci-count">' + c.count + " 部</span></div>" +
          '<div class="ci-meta">' + esc(m2) + "</div></button>";
      }).join("");
    }
    var btns = list.querySelectorAll(".city-item");
    for (var i = 0; i < btns.length; i++) btns[i].addEventListener("click", function () { focusMarket(this.dataset.iso, this); });
    document.getElementById("list-count").textContent = "共 " + items.length + " 个主产国 · 数据快照 2026-11-23";
  }

  function focusMarket(iso, btn) {
    var c = marketByIso[iso];
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
    var z = c.count >= 45 ? 3.4 : c.count >= 12 ? 4.4 : 5.4;
    map.flyTo({ center: [c.lng, c.lat], zoom: z, speed: 1.2, curve: 1.4 });
    map.once("moveend", function () { showPopup(visibleProps(iso), [c.lng, c.lat]); pinned = true; });
  }

  // ---------- 时间轴过滤 ----------
  function updateCountryFills() {
    if (!countryRaw || !map.getSource("countries")) return;
    for (var i = 0; i < countryRaw.features.length; i++) {
      var p = countryRaw.features[i].properties;
      var ms = moviesByIso[p.dbIso] || [];
      var n = 0;
      for (var j = 0; j < ms.length; j++) if (ms[j].year <= viewYear) n++;
      p.dbCount = n;
    }
    map.getSource("countries").setData(countryRaw);
  }
  function applyFilter() {
    updateCountryFills();
    requestLabelUpdate();
    if (detailOpen && popupId) detailBody.innerHTML = marketPopupHTML(visibleProps(popupId));
  }

  // ---------- 搜索 ----------
  var searchInput = document.getElementById("search");
  var searchResult = document.getElementById("searchResult");
  function renderSearch(q) {
    if (!q) { searchResult.innerHTML = ""; searchResult.classList.remove("has-hits"); return; }
    var ql = q.toLowerCase();
    var hits = [];
    for (var i = 0; i < markets.length; i++) {
      var c = markets[i];
      if (c.name.indexOf(q) >= 0 || c.nameEn.toLowerCase().indexOf(ql) >= 0) {
        hits.push({ type: "country", iso: c.iso, title: c.name, tag: c.count + " 部" });
      }
    }
    for (var j = 0; j < movies.length && hits.length < 30; j++) {
      var m = movies[j];
      if (m.title.indexOf(q) >= 0 || (m.titleEn && m.titleEn.toLowerCase().indexOf(ql) >= 0)) {
        hits.push({ type: "movie", iso: m.iso, title: m.title + " (" + m.year + ")", tag: "#" + m.rank + " " + m.rating.toFixed(1) });
      }
    }
    hits = hits.slice(0, 30);
    if (!hits.length) { searchResult.innerHTML = '<li class="empty">无匹配国家 or 电影</li>'; searchResult.classList.add("has-hits"); return; }
    searchResult.innerHTML = hits.map(function (h) {
      return '<li data-iso="' + esc(h.iso) + '"><span>' + esc(h.title) + "</span>" +
        '<span class="tag">' + esc(h.tag) + "</span></li>";
    }).join("");
    searchResult.classList.add("has-hits");
  }
  searchInput.addEventListener("input", function () { searchKw = this.value.trim(); renderSearch(searchKw); buildMarketList(); });
  searchResult.addEventListener("click", function (e) {
    var li = e.target.closest("li"); if (!li || !li.dataset.iso) return;
    var iso = li.dataset.iso, c = marketByIso[iso];
    searchResult.innerHTML = ""; searchResult.classList.remove("has-hits"); searchInput.value = ""; searchKw = "";
    buildMarketList();
    if (!c) return;
    map.flyTo({ center: [c.lng, c.lat], zoom: 4.6, speed: 1.2 });
    map.once("moveend", function () { showPopup(visibleProps(iso), [c.lng, c.lat]); pinned = true; });
  });

  // ---------- 底图与叠加 ----------
  var optsBtn = document.getElementById("map-opts-btn");
  var optsPanel = document.getElementById("map-opts");
  function setOptsOpen(open) { optsPanel.classList.toggle("open", open); optsBtn.setAttribute("aria-expanded", String(open)); }
  optsBtn.addEventListener("click", function (e) { e.stopPropagation(); setOptsOpen(!optsPanel.classList.contains("open")); });
  document.addEventListener("click", function (e) { if (optsPanel.classList.contains("open") && !optsPanel.contains(e.target)) setOptsOpen(false); });

  function setVis(id, on) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); }
  function setBasemap(mode) {
    setVis("esri-img", mode === "img");
    setVis("esri-relief", mode === "vec");
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
  bindToggle("toggleProv", function (on) { setVis("country-fill", on); setVis("country-line", on); });
  bindToggle("toggleLabel", function (on) { labelOn = on; requestLabelUpdate(); });

  var contSel = document.getElementById("prov-select");
  function buildContSelect() {
    var names = Object.keys(continentCount).sort(function (a, b) { return continentCount[b] - continentCount[a]; });
    contSel.innerHTML = '<option value="all">全部大洲（' + names.length + "）</option>" +
      names.map(function (n) { return '<option value="' + esc(n) + '">' + esc(n) + "（" + continentCount[n] + "）</option>"; }).join("");
    contSel.addEventListener("change", function () { contFilter = this.value; buildMarketList(); });
  }

  // ---------- 目录开合 ----------
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
  function cumulative() {
    var n = 0;
    for (var i = 0; i < movies.length; i++) if (movies[i].year <= viewYear) n++;
    return n;
  }
  function updateTimelineUI() {
    var n = cumulative();
    tlSlider.value = viewYear;
    tlYear.textContent = isMobile ? (viewYear + " 年") : (viewYear + " 年 · 累计上榜 " + n + " 部");
    tlCum.innerHTML = "已上映上榜 <b>" + n + "</b> 部";
  }
  function onYearChange() { viewYear = Number(tlSlider.value); applyFilter(); updateTimelineUI(); }
  tlSlider.addEventListener("input", onYearChange);
  function stopPlay() { playing = false; if (playTimer) clearInterval(playTimer); playTimer = null; tlPlay.classList.remove("playing"); tlPlay.textContent = "▶"; }
  function startPlay() {
    if (viewYear >= meta.yearMax) { viewYear = meta.yearMin; tlSlider.value = viewYear; onYearChange(); }
    playing = true; tlPlay.classList.add("playing"); tlPlay.textContent = "⏸";
    playTimer = setInterval(function () {
      if (viewYear >= meta.yearMax) { stopPlay(); return; }
      viewYear++; tlSlider.value = viewYear; onYearChange();
    }, 160);
  }
  tlPlay.addEventListener("click", function () { if (playing) stopPlay(); else startPlay(); });

  // ---------- 启动 ----------
  function refreshUI() {
    if (markets.length) {
      updateStats(); buildLegend(); buildContSelect(); buildMarketList(); updateLabels(); updateTimelineUI();
      if (countryRaw) applyFilter();
    }
  }

  map.on("load", function () { bindStoreEvents(); applyFilter(); });

  fetch("data/markets.json").then(function (r) { return r.json(); }).then(function (d) {
    markets = d.markets; meta = d.meta; continentCount = d.continentCount || {};
    for (var i = 0; i < markets.length; i++) marketByIso[markets[i].iso] = markets[i];
    tlSlider.min = d.meta.yearMin; tlSlider.max = d.meta.yearMax;
    viewYear = d.meta.yearMax;
    refreshUI();
  }).catch(function (e) { console.error("markets.json 加载失败", e); });

  fetch("data/movies.json").then(function (r) { return r.json(); }).then(function (d) {
    movies = d.movies;
    for (var i = 0; i < movies.length; i++) {
      var m = movies[i];
      (moviesByIso[m.iso] || (moviesByIso[m.iso] = [])).push(m);
    }
    refreshUI();
  }).catch(function (e) { console.error("movies.json 加载失败", e); });

  fetch("data/country-fills.geojson").then(function (r) { return r.json(); }).then(function (geo) {
    countryRaw = geo;
    updateCountryFills();
  }).catch(function (e) { console.error("country-fills.geojson 加载失败", e); });

  map.on("move", requestLabelUpdate);
  map.on("zoom", requestLabelUpdate);
})();
