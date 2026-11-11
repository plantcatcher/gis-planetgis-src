/* GeoDaily · 每日地理挑战
 * 在地图上丢针标记目标地的真实位置，按距离算分、按连击攒连胜。
 * 玩法：每日题（全网同题、结算连击）+ 练习（随机抽题）+ 挑战模式（5 题连答、每题 60 秒、累计评级）。
 * 复用：MapLibre（/maps/_shared）、CITY_MASTER（/shared/cities.js）、
 *       games-sync.js 的成绩打通、ga-bridge.js 的 GA 事件桥。
 */
(function () {
  'use strict';

  // ── 题库：共享城市库 + 本游戏扩展的自然地貌 / 名胜（places.js）────────
  // 共享城市只有 100 座，挑战模式很快会碰到熟题；扩展题库让每日题一轮更久、
  // 题型也更丰富。kind / level 用于在题目卡上标出类型与难度。
  var CITIES = (window.CITY_MASTER && window.CITY_MASTER.geoquiz) || [];
  if (window.GEODAILY_PLACES && window.GEODAILY_PLACES.length) {
    CITIES = CITIES.concat(window.GEODAILY_PLACES);
  }
  for (var ci = 0; ci < CITIES.length; ci++) {
    if (!CITIES[ci].kind) CITIES[ci].kind = 'city';
    if (!CITIES[ci].level) CITIES[ci].level = 2;
  }
  var KIND_LABEL = { city: '城市', nature: '自然地貌', landmark: '名胜' };
  var LEVEL_LABEL = { 1: '入门', 2: '进阶', 3: '冷门' };

  // ── 挑战模式参数 ─────────────────────────────────────────────────────
  var ROUNDS = 5;          // 一局挑战的题数
  var ROUND_SECONDS = 60;  // 每题限时（秒）

  // ── 确定性每日种子（全网同一天同题）──────────────────────────────────
  // 取本地日期（与用户所在时区一致），按 yyyy-mm-dd 做种子。
  function dateKey(d) {
    var y = d.getFullYear();
    var m = ('0' + (d.getMonth() + 1)).slice(-2);
    var day = ('0' + d.getDate()).slice(-2);
    return y + '-' + m + '-' + day;
  }
  // 字符串 → 32 位哈希（cyrb53 简化版）
  function hash(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return (h >>> 0);
  }
  function pickCity(key) {
    if (!CITIES.length) return null;
    var idx = hash(key) % CITIES.length;
    return CITIES[idx];
  }

  // ── 距离（Haversine，km）─────────────────────────────────────────────
  function haversineKm(a, b) {
    var R = 6371;
    var dLat = ((b[1] - a[1]) * Math.PI) / 180;
    var dLng = ((b[0] - a[0]) * Math.PI) / 180;
    var la1 = (a[1] * Math.PI) / 180;
    var la2 = (b[1] * Math.PI) / 180;
    var x =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
  }

  // 评分：0 km → 1000；2000 km → 约 500；10000 km → 约 100；越远趋近于 0。
  function scoreFor(distKm) {
    var s = 1000 * Math.exp(-distKm / 2200);
    return Math.max(0, Math.round(s));
  }

  // ── 本地存档：连击 / 今日最佳 / 累计分 / 挑战最佳 ────────────────────
  var STORE_KEY = 'geodaily:v1';
  function loadStore() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }
  function saveStore(d) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(d));
    } catch (e) {}
  }
  function dayOffset(n) {
    var d = new Date();
    d.setDate(d.getDate() + n);
    return dateKey(d);
  }
  // 两个 yyyy-mm-dd 之间相差的天数（b - a）
  function daysBetween(a, b) {
    var pa = a.split('-'), pb = b.split('-');
    var ua = Date.UTC(+pa[0], +pa[1] - 1, +pa[2]);
    var ub = Date.UTC(+pb[0], +pb[1] - 1, +pb[2]);
    return Math.round((ub - ua) / 86400000);
  }
  // 以「本周一」为键，用于限制每周只能补签一次
  function weekKey(d) {
    var t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    t.setDate(t.getDate() - ((t.getDay() + 6) % 7));
    return dateKey(t);
  }
  // 连击按「连续完成每日挑战」计：今天答过就算今天完成，隔天 +1；断一天归零。
  function getStreak() {
    var d = loadStore();
    if (!d.lastPlayed) return 0;
    if (d.lastPlayed !== dayOffset(0) && d.lastPlayed !== dayOffset(-1)) return 0;
    return d.streak || 0;
  }
  function settleStreak() {
    var d = loadStore();
    var today = dayOffset(0);
    if (d.lastPlayed === today) return d.streak || 0; // 今天已结算过
    d.streak = d.lastPlayed === dayOffset(-1) ? (d.streak || 0) + 1 : 1;
    d.lastPlayed = today;
    saveStore(d);
    return d.streak;
  }
  // 每局都记分：今日最佳取当天最高分，累计分一直叠加；练习 / 挑战局不计连击。
  function recordScore(score, isDaily) {
    var d = loadStore();
    var today = dayOffset(0);
    if (d.bestDay !== today) {
      d.bestDay = today;
      d.bestScore = 0;
    }
    if (score > (d.bestScore || 0)) d.bestScore = score;
    d.total = (d.total || 0) + score;
    if (isDaily) {
      // 连击日历：记录每天是否完成，只保留最近 60 天
      d.days = d.days || {};
      d.days[today] = 1;
      var cutoff = dayOffset(-60);
      for (var k in d.days) {
        if (k < cutoff) delete d.days[k];
      }
    }
    saveStore(d);
    if (isDaily) settleStreak();
    refreshStats();
  }

  // 断签 1 天且本周还没补签过 → 可以补签（保住原连击，今天答完 +1）
  function streakBrokenInfo() {
    var d = loadStore();
    if (!d.lastPlayed || (d.streak || 0) < 2) return null;
    if (daysBetween(d.lastPlayed, dayOffset(0)) !== 2) return null;
    if (d.repairKey === weekKey(new Date())) return null;
    return { streak: d.streak };
  }
  function repairStreak() {
    var info = streakBrokenInfo();
    if (!info) return false;
    var d = loadStore();
    var y = dayOffset(-1);
    d.days = d.days || {};
    d.days[y] = 'repair';
    d.lastPlayed = y;
    d.repairKey = weekKey(new Date());
    saveStore(d);
    ga('streak_repair', { streak: info.streak });
    refreshStats();
    updateRepairUi();
    return true;
  }

  function refreshStats() {
    var d = loadStore();
    var today = dayOffset(0);
    $('streakNum').textContent = getStreak();
    $('bestNum').textContent = d.bestDay === today && d.bestScore ? d.bestScore : '—';
    $('totalNum').textContent = d.total || 0;
    renderStreak();
    return d;
  }

  // 连击日历：最近 14 天的小格子 + 补签入口
  function renderStreak() {
    var d = loadStore();
    d.days = d.days || {};
    var grid = $('streakGrid');
    if (!grid) return;
    grid.innerHTML = '';
    for (var i = 13; i >= 0; i--) {
      var key = dayOffset(-i);
      var state = d.days[key];
      var cell = document.createElement('div');
      cell.className = 'day' + (state === 'repair' ? ' repair' : state ? ' done' : ' miss') + (i === 0 ? ' today' : '');
      cell.textContent = String(Number(key.slice(8)));
      cell.title = key + (state === 'repair' ? ' · 已补签' : state ? ' · 已完成' : ' · 未完成');
      grid.appendChild(cell);
    }
    var info = streakBrokenInfo();
    var streak = getStreak();
    $('streakSub').textContent = info
      ? '连击停在 ' + info.streak + ' 天：昨天漏答了，补签可以接上（每周 1 次）。'
      : streak > 0
        ? '当前连击 ' + streak + ' 天' + (d.lastPlayed === dayOffset(0) ? '，今天已完成。' : '，今天答完 +1。')
        : '连续完成每日挑战即可累加连击，断一天归零。';
    var can = !!info;
    $('btnRepairModal').hidden = !can;
    if (can) $('btnRepairModal').textContent = '🔁 补签昨天（保住 ' + info.streak + ' 天连击）';
  }

  // 补签按钮只在「每日题 + 有断签可补」时出现在题目卡里
  function updateRepairUi() {
    var info = isDaily ? streakBrokenInfo() : null;
    $('btnRepair').hidden = !info;
    if (info) $('btnRepair').textContent = '🔁 补签昨天（保住 ' + info.streak + ' 天连击）';
  }

  // ── GA 事件（经 ga-bridge 转发父页）────────────────────────────────
  function ga(name, params) {
    try {
      window.gtag && window.gtag('event', name, params || {});
    } catch (e) {}
  }

  // ── 地图 ─────────────────────────────────────────────────────────────
  var SATELLITE_TILE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  // 备用源：高德卫星影像。Esri 在国内偶发连不上，而高德在境内可达，
  // 同样是卫星图，切换后玩法不受影响（高德为 GCJ-02，境内有几百米偏移，对猜点影响很小）。
  // 注意 MapLibre 不会替换 {s} 之类的占位符，多台服务器要写成多个完整模板。
  var PLAIN_TILES = [
    'https://wprd01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
    'https://wprd02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
    'https://wprd03.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
    'https://wprd04.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
  ];

  var mapStyle = {
    version: 8,
    sources: {
      // 主底图：Esri 卫星影像
      img: {
        type: 'raster',
        tiles: [SATELLITE_TILE],
        tileSize: 256,
        maxzoom: 19,
        attribution: 'Esri World Imagery',
      },
      // 兜底底图：高德卫星（另一个域名，Esri 连不上时仍可玩）
      plain: {
        type: 'raster',
        tiles: PLAIN_TILES,
        tileSize: 256,
        maxzoom: 18,
        attribution: '© 高德地图',
      },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#0a1322' } },
      {
        id: 'plain', type: 'raster', source: 'plain',
        layout: { visibility: 'none' },
        paint: { 'raster-opacity': 0.92, 'raster-brightness-max': 0.8 },
      },
      {
        id: 'img', type: 'raster', source: 'img',
        paint: { 'raster-opacity': 0.9, 'raster-brightness-max': 0.72, 'raster-saturation': -0.25 },
      },
    ],
  };

  var map = new maplibregl.Map({
    container: 'map',
    style: mapStyle,
    center: [30, 20],
    zoom: 2,
    minZoom: 1.5,
    maxZoom: 16,
    renderWorldCopies: true,
    attributionControl: false,
    // 分享卡要截地图画布当缩略图，必须保留帧缓冲。
    // MapLibre 5 把上下文属性挪进了 canvasContextAttributes。
    canvasContextAttributes: { preserveDrawingBuffer: true },
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

  // ── 底图兜底：卫星图探测失败 → 切备用卫星源，并可手动重试 ────────────
  // 整个游戏都依赖卫星影像；Esri 在国内偶尔连不上，此时不能只留一块深色背景。
  var basemapMode = 'sat';

  function probeTile(url, ms, cb) {
    var done = false;
    function finish(ok) {
      if (done) return;
      done = true;
      cb(ok);
    }
    var img = new Image();
    img.onload = function () { finish(true); };
    img.onerror = function () { finish(false); };
    setTimeout(function () { finish(false); }, ms);
    img.src = url;
  }

  function setBasemap(mode) {
    basemapMode = mode;
    if (map.getLayer('img')) {
      map.setLayoutProperty('img', 'visibility', mode === 'sat' ? 'visible' : 'none');
    }
    if (map.getLayer('plain')) {
      map.setLayoutProperty('plain', 'visibility', mode === 'sat' ? 'none' : 'visible');
    }
  }

  function showBasemapNotice(text) {
    $('basemapNoticeText').textContent = text;
    $('basemapNotice').hidden = false;
  }

  function usePlainBasemap(reason) {
    if (basemapMode === 'plain') return;
    setBasemap('plain');
    showBasemapNotice('卫星底图连不上，已换备用源');
    ga('basemap_fallback', { reason: reason });
  }

  // ?basemap=plain 可直接使用备用底图（网络受限时的备用入口）
  function forcePlainBasemap() {
    try {
      return new URLSearchParams(location.search).get('basemap') === 'plain';
    } catch (e) {
      return false;
    }
  }

  // 首屏探测一次；失败再给一次机会（偶发超时不等于被墙）
  function ensureBasemap() {
    if (basemapMode !== 'sat') return;
    probeTile(SATELLITE_TILE.replace('{z}', 3).replace('{y}', 3).replace('{x}', 4), 6000, function (ok) {
      if (ok) return;
      probeTile(SATELLITE_TILE.replace('{z}', 3).replace('{y}', 3).replace('{x}', 4), 6000, function (ok2) {
        if (!ok2) usePlainBasemap('probe');
      });
    });
  }

  // 运行中瓦片连续失败也切（比如中途断网 / 被限流）
  var imgTileErrors = 0;
  map.on('error', function (e) {
    if (basemapMode !== 'sat' || !e || e.sourceId !== 'img') return;
    imgTileErrors++;
    if (imgTileErrors >= 8) usePlainBasemap('tile-errors');
  });

  $('btnBasemapRetry').addEventListener('click', function () {
    showBasemapNotice('正在重连卫星底图…');
    probeTile(SATELLITE_TILE.replace('{z}', 3).replace('{y}', 3).replace('{x}', 4), 6000, function (ok) {
      if (ok) {
        setBasemap('sat');
        imgTileErrors = 0;
        $('basemapNotice').hidden = true;
        ga('basemap_retry', { ok: 1 });
      } else {
        setBasemap('plain');
        showBasemapNotice('仍连不上，继续用备用源');
        ga('basemap_retry', { ok: 0 });
      }
    });
  });
  $('btnBasemapClose').addEventListener('click', function () {
    $('basemapNotice').hidden = true;
  });

  // ── 标记针：SVG 图钉，底端尖角与坐标严格对齐 ────────────────────────
  // 之前用 emoji 📍：字形在行盒里有基线留白，再叠加 translateY，
  // 视觉上会比真实坐标高出一截。SVG 的尖角落在元素底边中点，
  // 配合 anchor:'bottom' 就能做到「点哪落哪」。
  var pinEl = document.createElement('div');
  pinEl.className = 'pin';
  pinEl.innerHTML =
    '<svg width="30" height="40" viewBox="0 0 30 40" aria-hidden="true">' +
    '<path d="M15 39.4C12.4 35.8 2 22.7 2 14.6 2 7.6 7.8 2 15 2s13 5.6 13 12.6c0 8.1-10.4 21.2-13 24.8Z" ' +
    'fill="#ef4444" stroke="#fff" stroke-width="2.2"/>' +
    '<circle cx="15" cy="14.6" r="4.6" fill="#fff"/></svg>';
  pinEl.style.visibility = 'hidden'; // 首次点击地图后才出现

  var marker = new maplibregl.Marker({ draggable: true, anchor: 'bottom', element: pinEl })
    .setLngLat([0, 0])
    .addTo(map);

  // 标记点下方跟随的「标定这里」按钮（地图锚定，随针移动）
  var confirmWrap = document.createElement('div');
  confirmWrap.className = 'confirm-wrap';
  confirmWrap.hidden = true;
  var confirmBtn = document.createElement('button');
  confirmBtn.id = 'btnConfirm';
  confirmBtn.type = 'button';
  confirmBtn.className = 'confirm';
  confirmBtn.textContent = '📍 标定这里';
  confirmBtn.addEventListener('click', function () { check(false); });
  confirmWrap.appendChild(confirmBtn);

  var confirmMarker = new maplibregl.Marker({ element: confirmWrap, anchor: 'top', offset: [0, 10] })
    .setLngLat([0, 0])
    .addTo(map);

  // ── 结算图层：猜测点 → 真实点的距离线 ──────────────────────────────
  var distMarker = null;

  function clearAnswer() {
    if (distMarker) {
      distMarker.remove();
      distMarker = null;
    }
    if (map.getSource('answer')) {
      ['answer-line-glow', 'answer-line', 'answer-pt-ring', 'answer-pt'].forEach(function (id) {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      map.removeSource('answer');
    }
  }

  // 跨 180° 经线时把真实点经度平移到猜测点同一侧，避免连线绕地球一圈
  function wrapLng(guessLng, targetLng) {
    var t = targetLng;
    while (t - guessLng > 180) t -= 360;
    while (t - guessLng < -180) t += 360;
    return t;
  }

  var answerRetryId = null;

  // 样式没就绪（首帧之前、或 GPU 上下文丢失后 maplibre 正在恢复）时 addSource 会抛错。
  // 注意不能用 map.isStyleLoaded()：它要求瓦片全部加载，卫星瓦片慢/被墙时一直是 false。
  // 用 map.style._loaded 判断「样式 JSON 已 parse」，并带重试。
  function showAnswer(target, guess, distKm, attempt) {
    attempt = attempt || 0;
    if (!(map.style && map.style._loaded)) {
      if (attempt < 40) {
        clearTimeout(answerRetryId);
        answerRetryId = setTimeout(function () {
          showAnswer(target, guess, distKm, attempt + 1);
        }, 250);
      }
      return;
    }
    try {
      drawAnswer(target, guess, distKm);
    } catch (err) {
      clearAnswer();
      if (attempt < 40) {
        clearTimeout(answerRetryId);
        answerRetryId = setTimeout(function () {
          showAnswer(target, guess, distKm, attempt + 1);
        }, 400);
      }
    }
  }

  function drawAnswer(target, guess, distKm) {
    var tlng = wrapLng(guess[0], target[0]);
    var targetDraw = [tlng, target[1]];
    var fc = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [guess, targetDraw] } },
        { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [targetDraw[0], targetDraw[1]] } },
      ],
    };

    if (!map.getSource('answer')) {
      map.addSource('answer', { type: 'geojson', data: fc });
      // 白色光晕衬底，卫星底图上也能看清
      map.addLayer({
        id: 'answer-line-glow', type: 'line', source: 'answer',
        filter: ['==', '$type', 'LineString'],
        paint: { 'line-color': '#ffffff', 'line-width': 7, 'line-opacity': 0.35, 'line-blur': 2 },
      });
      map.addLayer({
        id: 'answer-line', type: 'line', source: 'answer',
        filter: ['==', '$type', 'LineString'],
        paint: { 'line-color': '#f59e0b', 'line-width': 3, 'line-dasharray': [2, 1.6] },
      });
      map.addLayer({
        id: 'answer-pt-ring', type: 'circle', source: 'answer',
        filter: ['==', '$type', 'Point'],
        paint: { 'circle-radius': 14, 'circle-color': '#ef4444', 'circle-opacity': 0.22 },
      });
      map.addLayer({
        id: 'answer-pt', type: 'circle', source: 'answer',
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 7, 'circle-color': '#ef4444', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2.5,
        },
      });
    } else {
      map.getSource('answer').setData(fc);
    }

    // 连线中点挂一个距离标签
    var lab = document.createElement('div');
    lab.className = 'dist-label';
    lab.textContent = Math.round(distKm).toLocaleString() + ' km';
    distMarker = new maplibregl.Marker({ element: lab, anchor: 'center' })
      .setLngLat([(guess[0] + tlng) / 2, (guess[1] + target[1]) / 2])
      .addTo(map);

    // 视野同时装下猜测点与真实点：上方避开 HUD，下方避开结算卡
    if (distKm < 1) {
      map.flyTo({ center: target, zoom: 7, duration: 800 });
      return;
    }
    var hudEl = document.querySelector('.hud');
    var cardEl = document.querySelector('.result-card');
    var padTop = Math.round(hudEl ? hudEl.getBoundingClientRect().height : 220) + 20;
    var padBottom = Math.round(cardEl ? cardEl.getBoundingClientRect().height : 220) + 24;
    // 小屏（横屏手机）留白可能吃掉整个视口，退化成只保证连线可见
    if (window.innerHeight - padTop - padBottom < 120) {
      padTop = 70;
      padBottom = 110;
    }
    var b = new maplibregl.LngLatBounds();
    b.extend(guess);
    b.extend([tlng, target[1]]);
    map.fitBounds(b, {
      padding: { top: padTop, bottom: padBottom, left: 48, right: 48 },
      maxZoom: 6,
      duration: 900,
    });
  }

  // ── 状态与界面 ───────────────────────────────────────────────────────
  var current = null;
  var answered = false;
  var placed = false;    // 是否已标出（点过地图）
  var isDaily = false;   // 当前这局是否是今日每日题（决定连击是否结算）
  var lastScore = 0;     // 最近一次结算得分（分享卡用）
  var summary = null;    // 挑战结束后的总成绩页
  var challenge = { active: false, index: 0, scores: [], total: 0, used: [], cityIds: [] };
  // 好友对战：?vs=1.5.9.22.40&s=884 —— 双方按同一顺序答同一组城市
  // s 是发起人的总分；打开链接的人看到对手成绩，答完直接比高低。
  var battle = { active: false, cities: [], rival: null };

  // 对手成绩（没有对战 / 链接里没带分时为 null）
  function rivalScore() {
    return battle.active && battle.rival ? battle.rival.score : null;
  }

  function rivalChipText(prefix) {
    return '⚔️ ' + (prefix || '好友') + ' ' + battle.rival.score.toLocaleString() + ' 分';
  }

  function totalRounds() {
    return battle.active ? battle.cities.length : ROUNDS;
  }

  function $(id) { return document.getElementById(id); }

  // ── 挑战倒计时 ───────────────────────────────────────────────────────
  var timerId = null;

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    var chip = $('timerChip');
    chip.hidden = true;
    chip.classList.remove('warn');
  }

  function startTimer() {
    stopTimer();
    var left = ROUND_SECONDS;
    var chip = $('timerChip');
    chip.hidden = false;
    chip.textContent = left + 's';
    chip.classList.remove('warn');
    timerId = setInterval(function () {
      left--;
      if (left <= 0) {
        chip.textContent = '0s';
        chip.classList.add('warn');
        stopTimer();
        if (!answered) check(true); // 超时按当前标记结算，没标就是 0 分
        return;
      }
      chip.textContent = left + 's';
      if (left <= 10) chip.classList.add('warn');
    }, 1000);
  }

  // ── 抽题 ─────────────────────────────────────────────────────────────
  // 随机抽一座城市（练习 / 下一题用，不再受日期约束）
  function pickRandom(keyAvoid) {
    if (!CITIES.length) return null;
    var c = pickCity(dateKey(new Date()));
    if (CITIES.length > 1) {
      for (var i = 0; i < 8; i++) {
        var cand = CITIES[Math.floor(Math.random() * CITIES.length)];
        if (!keyAvoid || cand.name !== keyAvoid) { c = cand; break; }
      }
    }
    return c;
  }

  // 挑战模式抽题：一局内不重复
  function pickChallengeCity() {
    var c = pickRandom(current && current.name);
    var guard = 0;
    while (c && challenge.used.indexOf(c.name) > -1 && guard++ < 20) {
      c = pickRandom(current && current.name);
    }
    if (c) challenge.used.push(c.name);
    return c;
  }

  function challengeLabel() {
    return ROUNDS + ' 题连答 · 每题 ' + ROUND_SECONDS + ' 秒';
  }

  // 放针状态 → 两个「标定」入口的可用性
  function updatePlaceUI() {
    var canCheck = !!current && placed && !answered;
    confirmWrap.hidden = !canCheck;
    if (canCheck) confirmMarker.setLngLat(marker.getLngLat());
  }

  function coordText(city) {
    return '真实坐标 ' + Math.abs(city.lat).toFixed(2) + '°' + (city.lat >= 0 ? 'N' : 'S') +
      ', ' + Math.abs(city.lng).toFixed(2) + '°' + (city.lng >= 0 ? 'E' : 'W');
  }

  function loadCity(city, label, daily, opts) {
    opts = opts || {};
    var inChallenge = !!opts.challenge;
    current = city;
    answered = false;
    placed = false;
    isDaily = !!daily;
    summary = null;
    clearAnswer();
    pinEl.style.visibility = 'hidden';
    confirmWrap.hidden = true;

    if (city) {
      $('promptName').textContent = city.name;
      $('promptHint').textContent = city.hint || city.feature || '';
    } else {
      $('promptName').textContent = '（城市库加载失败）';
      $('promptHint').textContent = '';
    }
    if (inChallenge && city) challenge.cityIds[challenge.index] = city.id;
    $('promptKicker').textContent = inChallenge
      ? (battle.active ? '好友对战' : '挑战') + ' 第 ' + (challenge.index + 1) + '/' + totalRounds() + ' 题'
      : isDaily ? '今天的地点是' : '练习地点是';
    $('btnMode').textContent = inChallenge ? (battle.active ? '✕ 退出对战' : '✕ 退出挑战') : '🎯 挑战模式';
    $('btnBattle').hidden = true;
    $('btnSkip').title = inChallenge ? '本题 0 分，直接进入下一题' : '换一题（不计分）';
    $('btnNext').textContent = '下一题';
    $('resultScoreLab').textContent = '本局得分';
    $('resultCoords').hidden = false;
    $('result').hidden = true;
    $('mapHint').hidden = false;
    // 题型 / 难度标签：城市题不显示，自然地貌与名胜标出来
    var tag = $('placeTag');
    if (city && city.kind && city.kind !== 'city') {
      tag.textContent = (KIND_LABEL[city.kind] || '地点') + ' · ' + (LEVEL_LABEL[city.level] || '进阶');
      tag.hidden = false;
    } else {
      tag.hidden = true;
    }
    $('dateLabel').textContent = label || '';
    var tip = inChallenge
      ? '点地图任意处放下 📍，标记点下方会出现「标定这里」；本题限时 ' + ROUND_SECONDS + ' 秒。'
      : '点地图任意处放下 📍，标记点下方会出现「标定这里」。';
    if (isDaily) {
      var sd = loadStore();
      var broken = streakBrokenInfo();
      if (broken) {
        tip = '昨天漏答了：点「🔁 补签」可以接上 ' + broken.streak + ' 天连击（每周 1 次）。';
      } else if (sd.lastPlayed === dayOffset(-1) && (sd.streak || 0) > 0) {
        tip = '连击 ' + sd.streak + ' 天，今天答完变 ' + (sd.streak + 1) + ' 天。';
      }
    }
    $('promptTip').textContent = tip;
    updateRepairUi();
    marker.setLngLat([Math.random() * 60 - 30, Math.random() * 30 - 5]);
    updatePlaceUI();
    refreshStats();
    if (inChallenge) startTimer();
    else stopTimer();
  }

  // 退出对战后把 ?vs= 从地址栏去掉，避免刷新又回到对战。
  // 游戏跑在同源 iframe 里，父页的地址栏才是用户看到的那个，优先改父页。
  function clearBattleUrl() {
    try {
      var host = window.parent && window.parent !== window ? window.parent : window;
      host.history.replaceState(null, '', '/geodaily');
    } catch (e) {}
  }

  function startDay() {
    var wasBattle = battle.active;
    challenge.active = false;
    battle = { active: false, cities: [], rival: null };
    if (wasBattle) clearBattleUrl();
    $('rivalChip').hidden = true;
    var key = dateKey(new Date());
    loadCity(pickCity(key), key + ' · 第 ' + ((hash(key) % 365) + 1) + ' 题 · 每日一题', true);
  }

  function startChallenge() {
    if (battle.active) clearBattleUrl();
    challenge = { active: true, index: 0, scores: [], total: 0, used: [], cityIds: [] };
    battle = { active: false, cities: [], rival: null };
    summary = null;
    $('rivalChip').hidden = true;
    ga('challenge_start', { rounds: ROUNDS, seconds: ROUND_SECONDS });
    loadCity(pickChallengeCity(), challengeLabel(), false, { challenge: true });
  }

  // 好友对战：按固定顺序答同一组城市；rival 为发起人的总分（可为空）
  function startBattle(cities, rival) {
    battle = {
      active: true,
      cities: cities,
      rival: rival && typeof rival.score === 'number' ? rival : null,
    };
    challenge = {
      active: true, index: 0, scores: [], total: 0,
      used: cities.map(function (c) { return c.name; }),
      cityIds: cities.map(function (c) { return c.id; }),
    };
    summary = null;
    if (battle.rival) {
      $('rivalChip').textContent = rivalChipText();
      $('rivalChip').title = '发起人的成绩，答完看你能否超过';
      $('rivalChip').hidden = false;
    } else {
      $('rivalChip').hidden = true;
    }
    ga('battle_start', { rounds: cities.length, rival_score: battle.rival ? battle.rival.score : -1 });
    loadCity(cities[0], '好友对战 · 同题 ' + cities.length + ' 题', false, { challenge: true });
  }

  function findCityById(id) {
    for (var i = 0; i < CITIES.length; i++) {
      if (CITIES[i].id === id) return CITIES[i];
    }
    return null;
  }

  // 从 ?vs=1.5.9.22.40&s=884 进入好友对战；参数非法时返回 false 走每日题
  function tryBattleFromUrl() {
    var raw = '';
    var rival = null;
    try {
      var params = new URLSearchParams(location.search);
      raw = params.get('vs') || '';
      var s = parseInt(params.get('s'), 10);
      if (!isNaN(s) && s >= 0) rival = s;
    } catch (e) {
      raw = '';
    }
    if (!raw) return false;
    var ids = raw.split('.').map(function (s) { return parseInt(s, 10); });
    var cities = [];
    for (var i = 0; i < ids.length && cities.length < 10; i++) {
      if (isNaN(ids[i])) continue;
      var c = findCityById(ids[i]);
      if (c && cities.indexOf(c) === -1) cities.push(c);
    }
    if (cities.length < 2) return false;
    var max = cities.length * 1000;
    var rivalObj = rival === null ? null : { score: Math.min(rival, max), max: max };
    startBattle(cities, rivalObj);
    return true;
  }

  function advanceChallenge() {
    if (challenge.index + 1 >= totalRounds()) {
      finishChallenge();
      return;
    }
    challenge.index++;
    if (battle.active) {
      loadCity(battle.cities[challenge.index], '好友对战 · 同题 ' + battle.cities.length + ' 题', false, { challenge: true });
    } else {
      loadCity(pickChallengeCity(), challengeLabel(), false, { challenge: true });
    }
  }

  function gradeFor(total, max) {
    var p = total / (max || ROUNDS * 1000);
    if (p >= 0.9) return { title: '🏆 地理大师', tip: '几乎把世界装进了口袋，这个分数可以截图炫耀了。' };
    if (p >= 0.7) return { title: '🌍 方位高手', tip: '经纬网格已经长在脑子里，再多练几局就能冲满。' };
    if (p >= 0.5) return { title: '🧭 空间感不错', tip: '大方向都对了，细节位置再稳一点就更好。' };
    if (p >= 0.3) return { title: '🗺️ 入门探险家', tip: '已经能认出大陆轮廓，继续刷每日题会有明显进步。' };
    return { title: '📍 继续加油', tip: '先记住几条基准线：赤道、本初子午线、回归线。' };
  }

  function finishChallenge() {
    stopTimer();
    var rounds = totalRounds();
    var max = rounds * 1000;
    var total = challenge.total;
    var isBattle = battle.active;
    var store = loadStore();
    if (!isBattle && total > (store.challengeBest || 0)) {
      store.challengeBest = total;
      saveStore(store);
    }
    summary = { total: total, max: max, rounds: rounds, battle: isBattle };
    challenge.active = false;
    var g = gradeFor(total, max);

    $('resultScore').textContent = total;
    $('resultScoreLab').textContent = (isBattle ? '对战总分 / ' : '挑战总分 / ') + max;
    $('resultName').textContent = g.title;
    $('resultDist').textContent =
      rounds + ' 题共 ' + total.toLocaleString() + ' 分 · 平均 ' + Math.round(total / rounds) + ' 分';
    $('resultTrivia').textContent = g.tip;
    $('resultCoords').hidden = true;
    $('resultMeta').textContent = isBattle
      ? '同题 ' + rounds + ' 题 · 把成绩发回给对手，或把对战链接发给更多人'
      : '挑战最佳 ' + (store.challengeBest || total).toLocaleString() + ' / ' + max;

    // 从好友链接进入：直接给出胜负与分差
    var rs = rivalScore();
    var vsEl = $('resultVs');
    if (rs !== null) {
      var diff = total - rs;
      vsEl.hidden = false;
      vsEl.className = 'result-vs ' + (diff > 0 ? 'win' : diff < 0 ? 'lose' : 'tie');
      vsEl.textContent = diff > 0
        ? '🏆 好友 ' + rs.toLocaleString() + ' 分 · 你领先 ' + diff.toLocaleString() + ' 分'
        : diff < 0
          ? '⚔️ 好友 ' + rs.toLocaleString() + ' 分 · 还差 ' + (-diff).toLocaleString() + ' 分'
          : '🤝 好友 ' + rs.toLocaleString() + ' 分 · 打成平手';
    } else {
      vsEl.hidden = true;
    }
    $('btnNext').textContent = isBattle ? '再战一次' : '再来一局';
    $('btnBattle').hidden = false;
    $('btnBattle').textContent = '🔗 复制对战链接';
    $('btnMode').textContent = '🎯 挑战模式';
    $('timerChip').hidden = true;
    $('promptKicker').textContent = isBattle ? '好友对战成绩' : '挑战成绩';
    $('dateLabel').textContent = isBattle ? '同题 ' + rounds + ' 题 · 把链接发给好友' : '本轮挑战结束';
    $('promptTip').textContent = '点「' + $('btnNext').textContent + '」继续，或分享成绩卡给好友比一比。';
    $('result').hidden = false;
    $('mapHint').hidden = true;

    if (window.PlanetLearning) {
      window.PlanetLearning.recordGame({
        gameId: 'geodaily',
        title: isBattle ? '每日地理挑战 · 好友对战' : '每日地理挑战 · 挑战模式',
        subtitle: rounds + ' 题 ' + total + ' 分',
        score: total,
        total: max,
      });
    }
    ga(isBattle ? 'battle_finish' : 'challenge_finish', {
      score: total, max: max, rounds: rounds,
      rival_score: rs === null ? -1 : rs,
      won: rs === null ? -1 : (total > rs ? 1 : total === rs ? 0 : -1),
    });
  }

  function check(force) {
    if (!current || answered) return;
    if (!placed && !force) return;
    answered = true;
    stopTimer();

    var guess = placed ? marker.getLngLat().toArray() : null;
    var target = [current.lng, current.lat];
    var dist = guess ? haversineKm(guess, target) : null;
    var score = dist === null ? 0 : scoreFor(dist);
    lastScore = score;

    recordScore(score, isDaily);
    var st = loadStore();

    if (challenge.active) {
      challenge.scores.push(score);
      challenge.total += score;
    }

    // 结果卡先渲染（fitBounds 需要量卡片实际高度）
    $('resultScore').textContent = score;
    $('resultScoreLab').textContent = challenge.active ? '本轮得分' : '本局得分';
    $('resultName').textContent = current.name + ' · ' + current.country + ' ' + (current.flag || '');
    $('resultDist').textContent = dist === null
      ? '⏱ 超时未标定 · 本题 0 分'
      : '偏差 ' + Math.round(dist).toLocaleString() + ' km · ' + current.nameEn;
    $('resultTrivia').textContent = (current.trivia && current.trivia[0]) || '';
    $('resultCoords').textContent = coordText(current);
    $('resultCoords').hidden = false;
    $('btnNext').textContent = challenge.active
      ? (challenge.index + 1 >= totalRounds() ? '查看总成绩' : '下一题')
      : '下一题';
    $('resultMeta').textContent = challenge.active
      ? '第 ' + (challenge.index + 1) + '/' + totalRounds() + ' 题 · 本轮 ' + score + ' 分 · ' +
        (battle.active ? '对战累计 ' : '挑战累计 ') + challenge.total
      : '连击 ' + getStreak() + ' 天 · 今日最佳 ' + (st.bestScore || 0) + ' · 累计 ' + (st.total || 0) +
        (isDaily ? ' · 每日题已计入连击' : ' · 练习局不计连击');

    // 有对手成绩时，每题结算都显示「还差多少」
    var rs = rivalScore();
    var vsEl = $('resultVs');
    if (rs !== null) {
      var gap = rs - challenge.total;
      vsEl.hidden = false;
      vsEl.className = 'result-vs live';
      vsEl.textContent = '⚔️ 好友 ' + rs.toLocaleString() + ' 分 · 目前 ' + challenge.total.toLocaleString() +
        ' 分' + (gap > 0 ? '，还差 ' + gap.toLocaleString() : gap < 0 ? '，已领先 ' + (-gap).toLocaleString() : '，追平了');
    } else {
      vsEl.hidden = true;
    }
    $('result').hidden = false;

    if (guess) showAnswer(target, guess, dist);

    confirmWrap.hidden = true;
    $('mapHint').hidden = true;
    $('promptTip').textContent = dist === null
      ? '超时没有标定，本题 0 分。'
      : '已标定：地图上的橙线就是猜测点到真实点的距离。';

    // 每日题 / 练习局每局同步成绩；挑战模式在总结算时统一上报
    if (!challenge.active && window.PlanetLearning) {
      window.PlanetLearning.recordGame({
        gameId: 'geodaily',
        title: '每日地理挑战 · ' + current.name,
        subtitle: dist === null ? '超时未标定' : '偏差 ' + Math.round(dist) + ' km',
        score: score,
        total: 1000,
      });
    }
    ga('geodaily_answer', {
      city: current.name, dist_km: dist === null ? -1 : Math.round(dist), score: score,
      hit: dist !== null && dist < 800, streak: getStreak(), daily: isDaily, challenge: challenge.active,
    });
    if (challenge.active) {
      ga('challenge_round', {
        round: challenge.index + 1, score: score, total: challenge.total,
      });
    } else if (isDaily) {
      ga('daily_challenge', { day: dateKey(new Date()), score: score });
    }
  }

  // ── 分享成绩卡 ───────────────────────────────────────────────────────
  var CARD_W = 1080;
  var CARD_H = 1350;
  var CARD_FONT = '"PingFang SC", "Microsoft YaHei", -apple-system, "Noto Sans SC", sans-serif';

  function copyText(t) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t);
        return true;
      }
    } catch (e) {}
    try {
      var ta = document.createElement('textarea');
      ta.value = t;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch (e2) {
      return false;
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function fitFont(ctx, text, maxWidth, size, weight) {
    do {
      ctx.font = weight + ' ' + size + 'px ' + CARD_FONT;
      if (ctx.measureText(text).width <= maxWidth) break;
      size -= 4;
    } while (size > 34);
    return size;
  }

  function drawPin(ctx, x, y, s, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-10, -14, -24, -30, -24, -44);
    ctx.arc(0, -44, 24, Math.PI, 0, false);
    ctx.bezierCurveTo(24, -30, 10, -14, 0, 0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -44, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();
  }

  // 分享卡内容：结算页优先，其次是刚答完的一局
  function sharePayload() {
    var today = dateKey(new Date());
    if (summary) {
      var rounds = summary.rounds;
      var avg = Math.round(summary.total / rounds);
      var rs = summary.battle ? rivalScore() : null;
      return {
        kind: summary.battle ? 'battle' : 'challenge',
        kicker: (summary.battle ? '好友对战' : '挑战模式') + ' · ' + rounds + ' 题',
        title: gradeFor(summary.total, summary.max).title,
        subtitle: (summary.battle ? '同题对战' : '连答挑战') + ' · 满分 ' + summary.max,
        score: summary.total,
        scoreLabel: '总分 / ' + summary.max,
        avg: avg,
        outOf: summary.max,
        streak: getStreak(),
        rival: rs,
        rivalDiff: rs === null ? null : summary.total - rs,
        date: today,
      };
    }
    if (current && answered) {
      var dist = placed ? Math.round(haversineKm(marker.getLngLat().toArray(), [current.lng, current.lat])) : null;
      return {
        kind: isDaily ? 'daily' : 'practice',
        kicker: isDaily ? '每日一题' : '练习局',
        title: current.name,
        subtitle: current.country + ' · ' + current.nameEn,
        score: lastScore,
        scoreLabel: '本局 / 1000',
        distKm: dist,
        outOf: 1000,
        streak: getStreak(),
        date: today,
      };
    }
    return null;
  }

  // 对战链接：城市 id + 自己的总分（结算后才有），收到的人打开即可对比
  function battleLinkNow() {
    var ids = (battle.active ? battle.cities.map(function (c) { return c.id; }) : challenge.cityIds || [])
      .filter(function (n) { return !!n; });
    if (ids.length < 2) return '';
    var url = window.location.origin + '/geodaily?vs=' + ids.join('.');
    if (summary) url += '&s=' + summary.total;
    return url;
  }

  function shareText(p) {
    if (p.kind === 'battle' || p.kind === 'challenge') {
      var vs = battleLinkNow();
      var cmp = p.rival == null ? ''
        : p.rivalDiff > 0 ? '，超过好友 ' + p.rival.toLocaleString() + ' 分'
          : p.rivalDiff < 0 ? '，还差 ' + (-p.rivalDiff).toLocaleString() + ' 分追上好友 ' + p.rival.toLocaleString() + ' 分'
            : '，和好友 ' + p.rival.toLocaleString() + ' 分打平';
      return '我在「每日地理挑战」' + (p.kind === 'battle' ? '好友对战' : '挑战模式') +
        '拿了 ' + p.score + '/' + p.outOf + ' 分（' + p.title + '）' + cmp + '！' +
        (vs ? '同题来战：' + vs : '来 @星球小捕手 比一比 →');
    }
    return '我在「每日地理挑战」标 ' + p.title +
      (p.distKm == null ? ' 超时未标定' : ' 偏差 ' + p.distKm.toLocaleString() + ' km') +
      '，拿了 ' + p.score + ' 分，连击 ' + p.streak + ' 天！来 @星球小捕手 比一比 →';
  }

  // 截当前地图画布做成绩卡缩略图：以「猜测点 + 真实点」的中点为中心裁剪，
  // 保持目标宽高比。canvas 被跨域瓦片污染时返回 null，调用方退回装饰线。
  function mapThumb(w, h) {
    try {
      var cv = map.getCanvas();
      if (!cv || !cv.width || !cv.height) return null;
      var ratio = cv.width / (cv.clientWidth || cv.width);
      var aspect = w / h;
      var sx, sy, sw, sh;
      var dots = null;
      if (placed && current) {
        var gl = marker.getLngLat();
        var a = map.project(gl);
        var b = map.project({ lng: wrapLng(gl.lng, current.lng), lat: current.lat });
        var ax = a.x * ratio, ay = a.y * ratio;
        var bx = b.x * ratio, by = b.y * ratio;
        dots = { gx: ax, gy: ay, tx: bx, ty: by };
        var cx = (ax + bx) / 2, cy = (ay + by) / 2;
        var pad = 140 * ratio;
        var needW = Math.abs(ax - bx) + pad;
        var needH = Math.abs(ay - by) + pad;
        // 先保证两点都在框内，再按目标宽高比放大
        sw = Math.max(needW, needH * aspect);
        sh = sw / aspect;
        // 只放大不缩小，否则可能把两个点裁出去
        if (sw < cv.width * 0.5) { sw = cv.width * 0.5; sh = sw / aspect; }
        if (sh < cv.height * 0.5) { sh = cv.height * 0.5; sw = sh * aspect; }
        if (sw > cv.width) { sw = cv.width; sh = sw / aspect; }
        if (sh > cv.height) { sh = cv.height; sw = sh * aspect; }
        sx = Math.min(Math.max(cx - sw / 2, 0), cv.width - sw);
        sy = Math.min(Math.max(cy - sh / 2, 0), cv.height - sh);
      } else {
        sw = Math.min(cv.width, cv.height * w / h);
        sh = sw * h / w;
        sx = (cv.width - sw) / 2;
        sy = (cv.height - sh) / 2;
      }
      var out = document.createElement('canvas');
      out.width = w * 2;
      out.height = h * 2;
      var c2 = out.getContext('2d');
      c2.drawImage(cv, sx, sy, sw, sh, 0, 0, out.width, out.height);
      out.getContext('2d').getImageData(0, 0, 1, 1); // 被污染时这里会抛错

      // 标记针是 DOM 元素，不会出现在 WebGL 画布里：缩略图上补画猜测点与真实点
      if (dots) {
        var r = out.width * 0.021;
        function dot(px, py, color) {
          var dx = (px - sx) / sw * out.width;
          var dy = (py - sy) / sh * out.height;
          if (dx < 0 || dy < 0 || dx > out.width || dy > out.height) return;
          c2.beginPath();
          c2.arc(dx, dy, r + 4, 0, Math.PI * 2);
          c2.fillStyle = '#ffffff';
          c2.fill();
          c2.beginPath();
          c2.arc(dx, dy, r, 0, Math.PI * 2);
          c2.fillStyle = color;
          c2.fill();
        }
        dot(dots.gx, dots.gy, '#38bdf8');
        dot(dots.tx, dots.ty, '#ef4444');
      }
      return out;
    } catch (e) {
      return null;
    }
  }

  function buildShareCard(p) {
    var c = document.createElement('canvas');
    c.width = CARD_W;
    c.height = CARD_H;
    var ctx = c.getContext('2d');

    // 背景：深色渐变 + 网格 + 光晕
    var bg = ctx.createLinearGradient(0, 0, 0, CARD_H);
    bg.addColorStop(0, '#0c1c33');
    bg.addColorStop(1, '#060b14');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.strokeStyle = 'rgba(56,189,248,0.07)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx <= CARD_W; gx += 72) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, CARD_H); ctx.stroke();
    }
    for (var gy = 0; gy <= CARD_H; gy += 72) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(CARD_W, gy); ctx.stroke();
    }
    var glow = ctx.createRadialGradient(770, 380, 40, 770, 380, 540);
    glow.addColorStop(0, 'rgba(29,143,225,0.30)');
    glow.addColorStop(1, 'rgba(29,143,225,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    // 页眉
    drawPin(ctx, 96, 128, 1.05, '#38bdf8');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f1f6fc';
    ctx.font = '700 36px ' + CARD_FONT;
    ctx.fillText('星球小捕手', 132, 100);
    ctx.fillStyle = '#7f95ad';
    ctx.font = '500 22px ' + CARD_FONT;
    ctx.fillText('PLANETGIS · 每日地理挑战', 132, 132);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#9fb3cc';
    ctx.font = '500 26px ' + CARD_FONT;
    ctx.fillText(p.date, CARD_W - 90, 104);
    ctx.textAlign = 'left';
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(90, 180); ctx.lineTo(CARD_W - 90, 180); ctx.stroke();

    // 模式 + 标题
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 28px ' + CARD_FONT;
    ctx.fillText(p.kicker, 90, 262);
    fitFont(ctx, p.title, 520, 96, '800');
    ctx.fillStyle = '#f1f6fc';
    ctx.fillText(p.title, 88, 386);
    ctx.fillStyle = '#9fb3cc';
    ctx.font = '500 30px ' + CARD_FONT;
    ctx.fillText(p.subtitle, 90, 438);

    // 分数
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 172px ' + CARD_FONT;
    ctx.fillText(String(p.score), 82, 650);
    ctx.fillStyle = '#9fb3cc';
    ctx.font = '500 30px ' + CARD_FONT;
    ctx.fillText(p.scoreLabel, 90, 700);

    // 距离 / 平均分
    ctx.fillStyle = '#e6edf6';
    ctx.font = '700 42px ' + CARD_FONT;
    ctx.fillText(
      p.distKm != null ? '偏差 ' + p.distKm.toLocaleString() + ' km' : '平均 ' + p.avg + ' 分 / 题',
      90, 800
    );

    // 连击 + 对手成绩（横排小徽标）
    var chipX = 90;
    if (p.streak > 0) {
      var chip = '🔥 连击 ' + p.streak + ' 天';
      ctx.font = '700 26px ' + CARD_FONT;
      var cw = ctx.measureText(chip).width + 44;
      roundRect(ctx, chipX, 838, cw, 56, 28);
      ctx.fillStyle = 'rgba(245,158,11,0.16)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(245,158,11,0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(chip, chipX + 22, 876);
      chipX += cw + 16;
    }
    if (p.rival != null) {
      var vsTxt = p.rivalDiff > 0
        ? '🏆 对手 ' + p.rival.toLocaleString() + ' · 领先 ' + p.rivalDiff.toLocaleString()
        : p.rivalDiff < 0
          ? '⚔️ 对手 ' + p.rival.toLocaleString() + ' · 还差 ' + (-p.rivalDiff).toLocaleString()
          : '🤝 对手 ' + p.rival.toLocaleString() + ' · 打平';
      ctx.font = '700 26px ' + CARD_FONT;
      var vw = ctx.measureText(vsTxt).width + 44;
      roundRect(ctx, chipX, 838, vw, 56, 28);
      ctx.fillStyle = 'rgba(168,85,247,0.16)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(168,85,247,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#d8b4fe';
      ctx.fillText(vsTxt, chipX + 22, 876);
    }

    // 右上：真实地图缩略图（猜测点 → 真实点），截不到时退回装饰距离线
    var thumb = mapThumb(330, 320);
    if (thumb) {
      var tx = 660, ty = 252, tw = 330, th = 320;
      ctx.save();
      roundRect(ctx, tx, ty, tw, th, 28);
      ctx.clip();
      ctx.drawImage(thumb, tx, ty, tw, th);
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 3;
      roundRect(ctx, tx, ty, tw, th, 28);
      ctx.stroke();
      // 图注放在缩略图下方，避免遮住落在边缘的标记点
      ctx.fillStyle = '#8aa0bb';
      ctx.font = '500 18px ' + CARD_FONT;
      ctx.textAlign = 'right';
      ctx.fillText('截图：你的标记 → 真实位置', tx + tw, ty + th + 30);
      ctx.textAlign = 'left';
    } else {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.setLineDash([14, 12]);
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 14;
      ctx.beginPath(); ctx.moveTo(716, 316); ctx.lineTo(962, 566); ctx.stroke();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(716, 316); ctx.lineTo(962, 566); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(962, 566, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.stroke();
      ctx.beginPath(); ctx.arc(716, 316, 13, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8'; ctx.fill();
      ctx.lineWidth = 4; ctx.stroke();
      ctx.restore();
    }

    // 底部：二维码 + 引导
    roundRect(ctx, 60, 986, CARD_W - 120, 300, 30);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 772, 1012, 244, 244, 18);
    ctx.fill();
    GeoDailyQR.draw(ctx, 'https://planetgis.cn/geodaily', 780, 1020, 228, { bg: '#ffffff', fg: '#0b1020' });

    ctx.fillStyle = '#f1f6fc';
    ctx.font = '700 36px ' + CARD_FONT;
    ctx.fillText('扫码玩同款每日挑战', 100, 1076);
    ctx.fillStyle = '#9fb3cc';
    ctx.font = '500 25px ' + CARD_FONT;
    ctx.fillText('每天一题 · 全网同题 · 连击挑战', 100, 1126);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 26px ' + CARD_FONT;
    ctx.fillText('planetgis.cn/geodaily', 100, 1176);

    // 页脚
    ctx.fillStyle = 'rgba(159,179,204,0.55)';
    ctx.font = '500 22px ' + CARD_FONT;
    ctx.textAlign = 'center';
    ctx.fillText('星球小捕手 · 自助探索的地理知识库', CARD_W / 2, 1322);
    ctx.textAlign = 'left';

    return c;
  }

  function flashShareBtn(text) {
    $('btnShare').textContent = text;
    setTimeout(function () { $('btnShare').textContent = '分享成绩'; }, 1600);
  }

  function share() {
    var p = sharePayload();
    if (!p) return;
    var text = shareText(p);
    var url = window.location.origin + '/geodaily';
    var canvas;
    try {
      canvas = buildShareCard(p);
    } catch (e) {
      copyText(text + ' ' + url);
      flashShareBtn('已复制文案');
      return;
    }
    canvas.toBlob(function (blob) {
      if (!blob) {
        copyText(text + ' ' + url);
        flashShareBtn('已复制文案');
        return;
      }
      var file = null;
      try { file = new File([blob], 'geodaily.png', { type: 'image/png' }); } catch (e) {}
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], text: text, url: url }).catch(function () {});
        ga('share', { content_type: 'game', content_slug: 'geodaily', share_platform: 'image_web', share_url: url });
        return;
      }
      // 不支持文件分享：弹出图片，可长按保存 / 下载
      var dataUrl = canvas.toDataURL('image/png');
      $('shareImg').src = dataUrl;
      $('shareDownload').href = dataUrl;
      $('shareDownload').download = 'geodaily-' + p.date + '.png';
      $('shareModal').hidden = false;
      ga('share', { content_type: 'game', content_slug: 'geodaily', share_platform: 'image_card', share_url: url });
    }, 'image/png');
  }

  // ── 事件绑定 ─────────────────────────────────────────────────────────
  $('btnSkip').addEventListener('click', function () {
    ga('geodaily_skip', { city: current && current.name, challenge: challenge.active });
    if (challenge.active) {
      if (!answered) {
        // 跳过 = 本题 0 分，直接进入下一题
        answered = true;
        stopTimer();
        challenge.scores.push(0);
        confirmWrap.hidden = true;
            $('result').hidden = true;
      }
      advanceChallenge();
      return;
    }
    loadCity(pickRandom(current && current.name), '练习 · 已跳过今日题', false);
  });
  $('btnNext').addEventListener('click', function () {
    if (summary) {
      var replay = summary.battle ? battle.cities.slice() : null;
      var rival = battle.rival;
      summary = null;
      if (replay) startBattle(replay, rival);
      else startChallenge();
      return;
    }
    if (challenge.active) {
      advanceChallenge();
      return;
    }
    loadCity(pickRandom(current && current.name), '练习 · 自由抽题', false);
  });
  $('btnMode').addEventListener('click', function () {
    if (challenge.active) {
      ga(battle.active ? 'battle_quit' : 'challenge_quit', { round: challenge.index + 1, score: challenge.total });
      summary = null;
      startDay();
      return;
    }
    startChallenge();
  });
  $('btnBattle').addEventListener('click', function () {
    var url = battleLinkNow();
    if (!url) return;
    var ok = copyText('同题对战：' + url);
    $('btnBattle').textContent = ok ? '✅ 对战链接已复制' : '复制失败，请手动复制';
    ga('battle_create', { rounds: (challenge.cityIds || []).length });
    setTimeout(function () { $('btnBattle').textContent = '🔗 复制对战链接'; }, 1800);
  });
  $('btnShare').addEventListener('click', share);
  $('btnShareClose').addEventListener('click', function () { $('shareModal').hidden = true; });
  $('shareDownload').addEventListener('click', function () {
    ga('share_download', { content_type: 'game', content_slug: 'geodaily' });
  });
  $('btnHelp').addEventListener('click', function () { $('helpModal').hidden = false; });
  $('btnHelpClose').addEventListener('click', function () { $('helpModal').hidden = true; });

  // 连击日历 + 补签
  $('streakStat').addEventListener('click', function () {
    renderStreak();
    $('streakModal').hidden = false;
  });
  $('streakStat').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.click();
    }
  });
  $('btnStreakClose').addEventListener('click', function () { $('streakModal').hidden = true; });
  function doRepair() {
    if (!repairStreak()) return;
    $('promptTip').textContent = '已补签昨天，连击接上了：今天答完变 ' + (getStreak() + 1) + ' 天。';
  }
  $('btnRepair').addEventListener('click', doRepair);
  $('btnRepairModal').addEventListener('click', function () {
    doRepair();
    $('streakModal').hidden = true;
  });

  // ── 交互：点地图放针，拖动针微调，拖空白=移动地图（MapLibre 默认）──
  function placeAt(lngLat) {
    if (answered) return;
    marker.setLngLat(lngLat);
    pinEl.style.visibility = 'visible';
    placed = true;
    updatePlaceUI();
  }
  map.on('click', function (e) {
    if (answered) return;
    placeAt(e.lngLat);
  });
  // 拖动针（微调）时，下方的「标定这里」跟着走
  marker.on('drag', function () {
    if (placed && !answered) confirmMarker.setLngLat(marker.getLngLat());
  });
  marker.on('dragend', function () {
    if (answered) return;
    placed = true;
    updatePlaceUI();
  });
  map.getCanvas().style.cursor = 'crosshair';

  // 容器尺寸可能在初始化后才变化（iframe 外壳先小后大），必须主动 resize，
  // 否则画布停留在初始尺寸，卫星影像只铺左上角一块。
  window.addEventListener('resize', function () { map.resize(); });
  if (window.ResizeObserver) {
    new ResizeObserver(function () { map.resize(); }).observe($('map'));
  }

  // 出题只需要样式 parse 完成（标定画线会在 showAnswer 里再等 map.style._loaded）。
  // 不能依赖 map.isStyleLoaded()：它要求瓦片全部加载，卫星瓦片慢/被墙时永远 false。
  // 事件偶发漏触发，所以再加一个轻量轮询兜底。
  var started = false;
  var bootId = null;
  function boot() {
    if (!(map.style && map.style._loaded)) return;
    if (bootId) {
      clearInterval(bootId);
      bootId = null;
    }
    if (started) return;
    started = true;
    map.resize();
    if (forcePlainBasemap()) setBasemap('plain');
    else {
      if (basemapMode === 'plain') setBasemap('plain');
      ensureBasemap();
    }
    if (!tryBattleFromUrl()) startDay();
  }
  map.on('style.load', boot);
  map.on('load', boot);
  bootId = setInterval(boot, 200);
  boot();
})();
