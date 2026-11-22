/* 奥斯卡最佳外语片全球分布图 · 互动逻辑 v1
   数据：1948—2026 颁奖年份，78 次获奖 + 280 次提名，按选送国统计。
   主视觉：大洲分色（欧洲蓝 / 亚洲红 / 美洲橙 / 非洲绿 / 大洋洲紫）；无获奖国家灰色。
   点击国家 → 右侧面板列完整获奖与提名影片；时间轴按颁奖年份回放；三阶段按钮跳转。
   口径：港澳台并入中国；苏联/南斯拉夫/捷克斯洛伐克按继承国落点并注明；1947—1955 荣誉奖无提名。 */
(function () {
  "use strict";

  var CONT_COLOR = {
    "欧洲": "#4f9de0", "亚洲": "#e8614f", "美洲": "#e0a63c",
    "非洲": "#4fbfa0", "大洋洲": "#a876e0"
  };
  var CONT_ORDER = ["欧洲", "亚洲", "美洲", "非洲", "大洋洲"];
  var PHASES = [
    { id: "p1", label: "欧洲中心", sub: "1948—1979", from: 1948, to: 1979 },
    { id: "p2", label: "缓慢松动", sub: "1980—2009", from: 1980, to: 2009 },
    { id: "p3", label: "全球多点", sub: "2010—2026", from: 2010, to: 2026 }
  ];

  var isMobile = window.innerWidth <= 760;
  var INIT_ZOOM = isMobile ? 0.15 : 1.5;
  var MIN_ZOOM = isMobile ? 0 : 1.5;
  var ESRI_IMG = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  var ESRI_RELIEF = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}";

  // 大洲分色：awWins=0 灰色；有获奖按大洲颜色，提名-only 半透明
  function fillColorExpr() {
    var cases = ["case",
      ["boolean", ["feature-state", "hover"], false], "#fde68a",
      ["==", ["coalesce", ["get", "awWins"], 0], 0],
        ["case", ["==", ["coalesce", ["get", "awNoms"], 0], 0], "#4b5563", "#64748b"]];
    CONT_ORDER.forEach(function (cont) {
      cases.push(["==", ["get", "awCont"], cont], CONT_COLOR[cont]);
    });
    cases.push("#4b5563");
    return cases;
  }

  var mapStyle = {
    version: 8,
    sources: {
      esri_img: { type: "raster", tiles: [ESRI_IMG], tileSize: 256, attribution: "Esri World Imagery" },
      esri_relief: { type: "raster", tiles: [ESRI_RELIEF], tileSize: 256, attribution: "Esri World Shaded Relief" },
      countries: { type: "geojson", data: "data/country-fills.geojson", promoteId: "awIso" }
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#0b1220" } },
      { id: "esri-img", type: "raster", source: "esri_img", layout: { visibility: "visible" },
        paint: { "raster-opacity": 0.88, "raster-brightness-max": 0.82, "raster-saturation": -0.22 } },
      { id: "esri-relief", type: "raster", source: "esri_relief", layout: { visibility: "none" }, paint: { "raster-opacity": 0.85 } },
      { id: "country-fill", type: "fill", source: "countries",
        paint: { "fill-color": fillColorExpr(),
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 1.5, 0.76, 4.5, 0.46, 7.0, 0] } },
      { id: "country-line", type: "line", source: "countries",
        paint: { "line-color": "#94a3b8", "line-width": 0.6, "line-opacity": 0.5 } }
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
  var markets = [], films = [], marketByIso = {}, filmsByIso = {};
  var meta = {}, viewYear = 2026, labelOn = true;
  var countryRaw = null;
  var detailOpen = false, popupId = null;
  var contFilter = "all", searchKw = "";
  var rafPending = false;
  var filmsByIndex = [];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

  // 时间轴过滤：颁奖年份 ≤ viewYear
  function visibleFilms(iso) {
    return (filmsByIso[iso] || []).filter(function (m) { return m.ceremonyYear <= viewYear; });
  }
  function visibleProps(iso) {
    var c = marketByIso[iso];
    if (!c) return null;
    var vf = visibleFilms(iso);
    return {
      id: c.iso, name: c.name, continent: c.continent, color: c.color,
      wins: vf.filter(function (m) { return m.result === "winner"; }).length,
      noms: vf.filter(function (m) { return m.result === "nominee"; }).length,
      totalWins: c.wins, totalNoms: c.noms, firstWin: c.firstWin
    };
  }

  // ---------- 海报卡 ----------
  function posterHTML(m) {
    var poster = m.poster
      ? '<img src="' + esc(m.poster) + '" loading="lazy" alt="' + esc(m.titleZh || m.titleEn) + '" onerror="this.style.display=\'none\';this.parentNode.classList.add(\'noimg\')" />'
      : "";
    var badge = m.honorary
      ? '<span class="pc-honorary">荣誉奖</span>'
      : (m.result === "nominee" ? '<span class="pc-nom">提名</span>' : "");
    var title = m.titleZh || m.titleEn;
    return '<div class="poster-card">' +
      '<div class="pc-img">' + poster + '<span class="pc-ph">' + esc(title.slice(0, 4)) + "</span>" +
      '<span class="pc-rank">' + m.ceremonyYear + "</span>" + badge +
      '<span class="pc-badges"><b class="pc-score">' + (m.result === "winner" ? "获奖" : "提名") +
      '</b><i class="pc-year">' + m.filmYear + ' 影片</i></span>' +
      "</div>" +
      '<div class="pc-title" title="' + esc(title) + '">' + esc(title) + "</div></div>";
  }

  function marketPopupHTML(p) {
    var list = visibleFilms(p.id);
    var winners = list.filter(function (m) { return m.result === "winner"; });
    var noms = list.filter(function (m) { return m.result === "nominee"; });
    var grid = winners.concat(noms).map(posterHTML).join("");
    if (!list.length) grid = '<div class="pw-empty">该年份前暂无获奖或提名记录</div>';
    var note = p.firstWin ? ("首个获奖 " + p.firstWin + " 年") : "暂无获奖";
    var countryNote = "";
    var mk = marketByIso[p.id];
    if (mk && mk.films.length) {
      var wf = mk.films.find(function (m) { return m.result === "winner" && m.countryNote; });
      if (wf) countryNote = '<div class="dp-honorary-note">' + esc(wf.countryNote) + "</div>";
    }
    return '<div class="pop pw" style="--c:' + (CONT_COLOR[p.continent] || "#38bdf8") + '">' +
      '<div class="pw-head"><h3>' + esc(p.name) + " <span class='era-tag' style='background:" +
      (CONT_COLOR[p.continent] || "#38bdf8") + ";color:#fff'>获奖 " + p.totalWins + " · 提名 " + p.totalNoms +
      "</span></h3>" +
      '<div class="pw-sub">' + esc(p.continent) + " · " + note + " · 当前年份前获奖 " + p.wins + " / 提名 " + p.noms +
      " · 完整记录 " + list.length + " 部</div></div>" + countryNote +
      '<div class="pw-grid">' + grid + "</div>" +
      '<div class="note">获奖与提名均按选送国计入 · 港澳台并入中国 · 1947—1955 荣誉奖非竞赛 · 海报存于本站</div>' +
      "</div>";
  }

  // ---------- 右侧详情面板 ----------
  var detailPanel = document.getElementById("detail-panel");
  var detailBody = document.getElementById("dp-body");
  function showPopup(props) {
    if (!props) return;
    popupId = props.id;
    detailBody.innerHTML = marketPopupHTML(props);
    detailPanel.classList.add("open");
    detailPanel.setAttribute("aria-hidden", "false");
    detailOpen = true;
  }
  function removePopup() {
    detailPanel.classList.remove("open");
    detailPanel.setAttribute("aria-hidden", "true");
    detailOpen = false; popupId = null;
  }
  document.getElementById("dp-close").addEventListener("click", removePopup);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && detailOpen) removePopup();
  });

  // ---------- 地图事件 ----------
  function bindStoreEvents() {
    map.on("click", "country-fill", function (e) {
      var f = e.features && e.features[0];
      if (!f) return;
      var iso = f.properties.awIso;
      if (iso) showPopup(visibleProps(iso));
    });
    map.on("mouseenter", "country-fill", function () { map.getCanvas().style.cursor = "pointer"; });
    map.on("mouseleave", "country-fill", function () { map.getCanvas().style.cursor = ""; });
    map.on("click", function (e) {
      var hits = map.queryRenderedFeatures(e.point, { layers: ["country-fill"] });
      if (!hits.length && detailOpen) removePopup();
    });
  }
  bindStoreEvents();

  // ---------- 标签 ----------
  var LBL_MIN_DIST = isMobile ? 58 : 84;
  function updateLabels() {
    if (!labelOn) { labelsEl.innerHTML = ""; return; }
    var placed = [];
    var html = [];
    markets.forEach(function (c) {
      var vf = visibleFilms(c.iso);
      var wins = vf.filter(function (m) { return m.result === "winner"; }).length;
      var noms = vf.length - wins;
      if (!wins && !noms) return;
      var p = map.project(c.lnglat);
      if (p.x < -60 || p.y < -40 || p.x > map.getCanvas().width + 60 || p.y > map.getCanvas().height + 40) return;
      for (var i = 0; i < placed.length; i++) {
        var q = placed[i];
        if (Math.abs(p.x - q[0]) < LBL_MIN_DIST && Math.abs(p.y - q[1]) < 22) return;
      }
      placed.push([p.x, p.y]);
      var col = CONT_COLOR[c.continent] || "#38bdf8";
      var nums = '<b class="lbl-win">奖 ' + wins + '</b>' + (noms ? '<span class="lbl-sep"> · </span><i class="lbl-nom">提 ' + noms + '</i>' : "");
      html.push('<button class="city-lbl' + (popupId === c.iso ? " sel" : "") + '" data-iso="' + c.iso +
        '" style="left:' + p.x.toFixed(1) + 'px;top:' + p.y.toFixed(1) + 'px;border-color:' + col + '">' +
        esc(c.name) + " " + nums + "</button>");
    });
    labelsEl.innerHTML = html.join("");
  }
  function requestLabelUpdate() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () { rafPending = false; updateLabels(); });
  }
  map.on("move", requestLabelUpdate);
  map.on("zoom", requestLabelUpdate);
  labelsEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".city-lbl");
    if (btn) showPopup(visibleProps(btn.getAttribute("data-iso")));
  });

  // ---------- 统计与目录 ----------
  function updateStats() {
    var wins = films.filter(function (m) { return m.result === "winner" && m.ceremonyYear <= viewYear; }).length;
    var noms = films.filter(function (m) { return m.result === "nominee" && m.ceremonyYear <= viewYear; }).length;
    document.getElementById("stat-stores").textContent = wins;
    document.getElementById("stat-cities").textContent = noms;
    document.getElementById("stat-provs").textContent = markets.length;
    document.getElementById("tl-year").textContent = viewYear + " 年 · 累计获奖 " + wins + " 部";
    document.getElementById("tl-cum").innerHTML = "已获奖 <b>" + wins + "</b> 部";
  }

  function buildPhaseButtons() {
    var box = document.getElementById("era-filter");
    box.innerHTML = PHASES.map(function (p) {
      return '<button class="era-btn" data-from="' + p.from + '" data-to="' + p.to + '"><b>' +
        p.label + "</b>" + p.sub + "</button>";
    }).join("");
    box.addEventListener("click", function (e) {
      var btn = e.target.closest(".era-btn");
      if (!btn) return;
      var y = Number(btn.getAttribute("data-to"));
      document.getElementById("tl-slider").value = y;
      viewYear = y; applyFilter();
      Array.prototype.forEach.call(box.children, function (b) { b.classList.toggle("active", b === btn); });
    });
  }

  function buildContSelect() {
    var sel = document.getElementById("prov-select");
    sel.innerHTML = '<option value="all">全部大洲</option>' + CONT_ORDER.map(function (c) {
      return '<option value="' + c + '">' + c + "</option>";
    }).join("");
    sel.addEventListener("change", function () { contFilter = sel.value; buildMarketList(); });
  }

  function buildMarketList() {
    var box = document.getElementById("city-list");
    var list = markets.filter(function (c) {
      if (contFilter !== "all" && c.continent !== contFilter) return false;
      if (searchKw) {
        var hay = c.name + c.continent + c.films.map(function (m) { return m.titleZh + m.titleEn + m.director; }).join("");
        if (hay.toLowerCase().indexOf(searchKw) < 0) return false;
      }
      return true;
    });
    if (searchKw) {
      list.sort(function (a, b) {
        var ah = (a.name + a.films.map(function (m) { return m.titleZh; }).join("")).indexOf(searchKw) >= 0;
        var bh = (b.name + b.films.map(function (m) { return m.titleZh; }).join("")).indexOf(searchKw) >= 0;
        return (bh ? 1 : 0) - (ah ? 1 : 0) || b.wins - a.wins;
      });
    }
    box.innerHTML = list.map(function (c) {
      var vf = visibleFilms(c.iso);
      var w = vf.filter(function (m) { return m.result === "winner"; }).length;
      var n = vf.length - w;
      var col = CONT_COLOR[c.continent] || "#38bdf8";
      return '<button class="city-item" data-iso="' + c.iso + '" style="border-left-color:' + col + '">' +
        '<span class="ci-name">' + esc(c.name) + "</span>" +
        '<span class="ci-ct"><b>' + w + "</b> 奖" + (n ? " · " + n + " 提" : "") + "</span></button>";
    }).join("");
    document.getElementById("list-count").textContent = "显示 " + list.length + " / " + markets.length + " 个选送国";
    Array.prototype.forEach.call(box.querySelectorAll(".city-item"), function (btn) {
      btn.addEventListener("click", function () {
        var iso = btn.getAttribute("data-iso");
        var c = marketByIso[iso];
        if (c) { map.flyTo({ center: c.lnglat, zoom: Math.max(map.getZoom(), 3.2), duration: 900 }); showPopup(visibleProps(iso)); }
      });
    });
  }

  function updateCountryFills() {
    if (!countryRaw) return;
    // 大洲分色为静态属性，时间轴只影响标签与面板；填色保持国家级总体成绩
    var src = map.getSource("countries");
    if (src && src.setData) src.setData(countryRaw);
  }

  function applyFilter() {
    updateStats(); buildMarketList(); updateLabels();
    if (popupId) showPopup(visibleProps(popupId));
    updateCountryFills();
  }

  // ---------- 搜索 ----------
  var searchInput = document.getElementById("search");
  var searchResult = document.getElementById("searchResult");
  function renderSearch(q) {
    searchKw = q.trim().toLowerCase();
    buildMarketList();
    if (!searchKw) { searchResult.classList.remove("open"); searchResult.innerHTML = ""; return; }
    var hits = [];
    markets.forEach(function (c) {
      if (hits.length >= 8) return;
      if (c.name.toLowerCase().indexOf(searchKw) >= 0 || c.continent.indexOf(searchKw) >= 0) {
        hits.push({ iso: c.iso, label: c.name, sub: "获奖 " + c.wins + " · 提名 " + c.noms });
        return;
      }
      c.films.forEach(function (m) {
        if (hits.length >= 8) return;
        if ((m.titleZh + m.titleEn + m.director).toLowerCase().indexOf(searchKw) >= 0) {
          hits.push({ iso: c.iso, label: m.titleZh || m.titleEn, sub: c.name + " · " + m.ceremonyYear + (m.result === "winner" ? " 获奖" : " 提名") });
        }
      });
    });
    searchResult.innerHTML = hits.map(function (h) {
      return '<li data-iso="' + h.iso + '"><b>' + esc(h.label) + "</b><small>" + esc(h.sub) + "</small></li>";
    }).join("") || '<li class="sr">无匹配</li>';
    searchResult.classList.add("open");
  }
  searchInput.addEventListener("input", function () { renderSearch(searchInput.value); });
  searchResult.addEventListener("click", function (e) {
    var li = e.target.closest("li[data-iso]");
    if (!li) return;
    var iso = li.getAttribute("data-iso");
    var c = marketByIso[iso];
    searchResult.classList.remove("open");
    searchInput.value = ""; searchKw = ""; buildMarketList();
    if (c) { map.flyTo({ center: c.lnglat, zoom: Math.max(map.getZoom(), 3.2), duration: 900 }); showPopup(visibleProps(iso)); }
  });

  // ---------- 底图设置 ----------
  var optsBtn = document.getElementById("map-opts-btn");
  var optsPanel = document.getElementById("map-opts");
  optsBtn.addEventListener("click", function () {
    var open = !optsPanel.classList.contains("open");
    optsPanel.classList.toggle("open", open);
    optsBtn.setAttribute("aria-expanded", String(open));
  });
  function setVis(id, on) { if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", on ? "visible" : "none"); }
  function setBasemap(mode) {
    setVis("esri-img", mode === "img");
    setVis("esri-relief", mode === "vec");
  }
  Array.prototype.forEach.call(document.querySelectorAll('input[name="basemap"]'), function (r) {
    r.addEventListener("change", function () { setBasemap(r.value); });
  });
  document.getElementById("toggleProv").addEventListener("click", function () {
    var on = this.getAttribute("aria-pressed") !== "true";
    this.setAttribute("aria-pressed", String(on));
    setVis("country-fill", on); setVis("country-line", on);
  });
  document.getElementById("toggleLabel").addEventListener("click", function () {
    labelOn = !labelOn;
    this.setAttribute("aria-pressed", String(labelOn));
    updateLabels();
  });

  // ---------- 榜单弹层 ----------
  var rankPop = document.getElementById("rank-pop");
  document.getElementById("rank-btn").addEventListener("click", function () {
    rankPop.classList.toggle("open");
    optsPanel.classList.remove("open");
  });
  document.getElementById("rank-close").addEventListener("click", function () { rankPop.classList.remove("open"); });
  Array.prototype.forEach.call(document.querySelectorAll(".rp-tab"), function (tab) {
    tab.addEventListener("click", function () {
      Array.prototype.forEach.call(document.querySelectorAll(".rp-tab"), function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      renderRank(tab.getAttribute("data-tab"));
    });
  });
  function renderRank(kind) {
    var box = document.getElementById("rp-body");
    var rows = [];
    if (kind === "zero") {
      // 有提名但零获奖（按选送国）
      var zero = markets.filter(function (c) { return c.wins === 0 && c.noms > 0; })
        .sort(function (a, b) { return b.noms - a.noms; });
      rows = zero.slice(0, 15).map(function (c, i) {
        return '<div class="rp-row"><span class="rp-rank">' + (i + 1) + '</span><span class="rp-name">' +
          esc(c.name) + "<small>多次提名，尚未获奖</small></span><span class=\"rp-val zero\">" + c.noms + " 提 · 0 奖</span></div>";
      }).join("") || '<div class="pw-empty">暂无零获奖提名国</div>';
    } else if (kind === "director") {
      var dm = {};
      films.forEach(function (m) {
        if (m.result !== "winner" || !m.director) return;
        m.director.split(/[,，]/).forEach(function (d) {
          d = d.trim(); if (!d) return;
          dm[d] = (dm[d] || 0) + 1;
        });
      });
      var dl = Object.keys(dm).map(function (d) { return [d, dm[d]]; })
        .sort(function (a, b) { return b[1] - a[1]; }).slice(0, 12);
      rows = dl.map(function (x, i) {
        return '<div class="rp-row"><span class="rp-rank">' + (i + 1) + '</span><span class="rp-name">' +
          esc(x[0]) + "</span><span class=\"rp-val\">" + x[1] + " 次获奖</span></div>";
      }).join("");
    } else {
      var cm = {};
      CONT_ORDER.forEach(function (c) { cm[c] = { wins: 0, noms: 0 }; });
      films.forEach(function (m) {
        if (cm[m.continent]) cm[m.continent][m.result === "winner" ? "wins" : "noms"]++;
      });
      rows = CONT_ORDER.map(function (c) {
        return '<div class="rp-row"><span class="rp-rank" style="width:10px;height:10px;border-radius:2px;background:' + CONT_COLOR[c] + '"></span>' +
          '<span class="rp-name">' + c + "</span><span class=\"rp-val\">" + cm[c].wins + " 奖 · " + cm[c].noms + " 提</span></div>";
      }).join("");
    }
    box.innerHTML = rows;
  }
  // ---------- 面板与时间轴 ----------
  var sidePanel = document.getElementById("side-panel");
  document.getElementById("panel-open").addEventListener("click", function () { sidePanel.classList.remove("collapsed"); });
  document.getElementById("panel-close").addEventListener("click", function () { sidePanel.classList.add("collapsed"); });
  document.getElementById("drawer-handle").addEventListener("click", function () { sidePanel.classList.toggle("collapsed"); });

  var tlSlider = document.getElementById("tl-slider");
  var tlPlay = document.getElementById("tl-play");
  var playing = false, playTimer = null;
  function stopPlay() {
    playing = false;
    if (playTimer) clearInterval(playTimer);
    playTimer = null;
    tlPlay.classList.remove("playing"); tlPlay.textContent = "▶";
  }
  tlSlider.addEventListener("input", function () { stopPlay(); viewYear = Number(tlSlider.value); applyFilter(); });
  tlPlay.addEventListener("click", function () {
    if (playing) { stopPlay(); return; }
    playing = true; tlPlay.classList.add("playing"); tlPlay.textContent = "❚❚";
    if (Number(tlSlider.value) >= Number(tlSlider.max)) tlSlider.value = tlSlider.min;
    playTimer = setInterval(function () {
      var y = Number(tlSlider.value) + 1;
      if (y > Number(tlSlider.max)) { stopPlay(); return; }
      tlSlider.value = y; viewYear = y; applyFilter();
    }, 260);
  });

  // ---------- 数据加载 ----------
  Promise.all([
    fetch("data/markets.json").then(function (r) { return r.json(); }),
    fetch("data/films.json").then(function (r) { return r.json(); }),
    fetch("data/country-fills.geojson").then(function (r) { return r.json(); })
  ]).then(function (rs) {
    var cd = rs[0], fd = rs[1], geo = rs[2];
    meta = fd.meta;
    markets = cd.markets;
    films = fd.films;
    filmsByIndex = films;
    marketByIso = {}; filmsByIso = {};
    markets.forEach(function (c) { marketByIso[c.iso] = c; });
    films.forEach(function (m) {
      (filmsByIso[m.iso] || (filmsByIso[m.iso] = [])).push(m);
    });
    countryRaw = geo;
    // 国界代表点补齐大洲色到市场
    markets.forEach(function (c) { c.color = CONT_COLOR[c.continent] || "#38bdf8"; });
    buildPhaseButtons(); buildContSelect(); applyFilter(); requestLabelUpdate();
    renderRank("zero");
    window.__app = { map: map, markets: markets, films: films, meta: meta };
  }).catch(function (e) {
    console.error("数据加载失败", e);
    document.getElementById("city-list").innerHTML = '<div class="pw-empty">数据加载失败，请刷新重试</div>';
  });
})();
