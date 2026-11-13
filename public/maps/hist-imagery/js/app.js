/* 历史影像查看器 · 地图主逻辑
 *
 * 数据源：Esri World Imagery Wayback 存档影像，196 期（2014-02-20 → 2026-08-05）。
 * 存档索引 RELEASES 在下方内联（构建期自 waybackconfig.json 生成）——刻意不在运行时拉取，
 * 少一次请求就少一个启动阻塞点。
 *
 * 来源：D:/WorkSpace/01PlanetGIS互动地图/03历史影像（单文件版 index.html），
 * 现由主站 /maps/hist-imagery 壳页 iframe 承载，见 src/data/vizmaps.json 登记。
 */
(function () {
'use strict';

/* =====================================================================
   1  数据
   ===================================================================== */

/* Esri World Imagery Wayback 全部存档期（日期升序）：[发布日期, 版本号]
   来源 config.maptiles.arcgis.com/waybackconfig.json */
const RELEASES = [["2014-02-20","10"],["2014-03-26","4230"],["2014-04-30","19819"],["2014-05-14","16513"],["2014-06-11","31144"],["2014-06-25","11033"],["2014-07-02","3026"],["2014-07-30","5232"],["2014-09-17","25586"],["2014-10-01","22692"],["2014-10-29","11019"],["2014-11-12","30195"],["2014-12-03","23383"],["2014-12-18","14720"],["2014-12-30","5844"],["2015-01-21","20222"],["2015-02-18","10443"],["2015-03-18","15084"],["2015-03-25","2730"],["2015-04-15","9203"],["2015-04-30","23880"],["2015-05-13","19930"],["2015-06-24","11952"],["2015-07-08","24007"],["2015-08-19","28219"],["2015-09-02","30584"],["2015-09-16","1431"],["2015-09-30","3630"],["2015-10-14","10850"],["2015-10-28","11092"],["2015-11-18","8781"],["2015-12-16","28163"],["2016-01-13","3515"],["2016-02-04","6354"],["2016-02-17","11262"],["2016-03-02","20443"],["2016-03-16","19085"],["2016-04-20","388"],["2016-04-28","5769"],["2016-05-11","8551"],["2016-06-13","11509"],["2016-07-06","13240"],["2016-07-20","5097"],["2016-08-11","23601"],["2016-08-31","9175"],["2016-09-14","6984"],["2016-10-12","13770"],["2016-10-25","4222"],["2016-11-16","21750"],["2016-12-07","6678"],["2016-12-20","18966"],["2017-01-11","577"],["2017-01-25","9486"],["2017-02-08","27946"],["2017-02-27","31026"],["2017-03-15","29387"],["2017-03-29","5205"],["2017-04-19","1052"],["2017-05-03","784"],["2017-05-17","20365"],["2017-05-31","14342"],["2017-06-14","14765"],["2017-06-27","4073"],["2017-07-14","3319"],["2017-08-10","14035"],["2017-08-30","25379"],["2017-09-13","18358"],["2017-10-04","15212"],["2017-10-25","23264"],["2017-11-16","25521"],["2018-01-08","13161"],["2018-01-18","13045"],["2018-01-31","10768"],["2018-02-23","13067"],["2018-03-14","8255"],["2018-03-28","7072"],["2018-04-11","20399"],["2018-04-25","1296"],["2018-05-16","32337"],["2018-06-06","8249"],["2018-06-27","11334"],["2018-07-25","14829"],["2018-08-15","1858"],["2018-09-06","2168"],["2018-09-26","14426"],["2018-10-17","18820"],["2018-11-07","3201"],["2018-11-29","239"],["2018-12-14","23448"],["2019-01-09","6036"],["2019-01-31","25944"],["2019-02-21","17677"],["2019-03-13","4383"],["2019-04-03","18691"],["2019-04-24","18063"],["2019-05-15","9598"],["2019-06-05","12576"],["2019-06-26","645"],["2019-07-17","16681"],["2019-08-07","17216"],["2019-08-28","30442"],["2019-09-18","9892"],["2019-10-09","11351"],["2019-10-30","11060"],["2019-12-12","4756"],["2020-01-08","23001"],["2020-01-30","21485"],["2020-02-20","8495"],["2020-03-23","16062"],["2020-04-08","26751"],["2020-04-29","15045"],["2020-05-20","32645"],["2020-06-10","11135"],["2020-07-01","18289"],["2020-07-22","9549"],["2020-08-12","6049"],["2020-09-02","9181"],["2020-09-23","19187"],["2020-10-14","119"],["2020-11-18","20753"],["2020-12-16","29260"],["2021-01-13","1049"],["2021-02-24","9812"],["2021-03-17","5359"],["2021-04-08","6863"],["2021-04-28","27659"],["2021-05-19","15423"],["2021-06-09","48376"],["2021-06-30","13534"],["2021-07-21","8432"],["2021-08-11","51423"],["2021-09-01","47568"],["2021-09-28","51313"],["2021-10-13","16749"],["2021-11-03","42403"],["2021-11-30","48624"],["2021-12-21","26120"],["2022-01-12","42663"],["2022-02-02","26083"],["2022-02-24","10312"],["2022-03-16","10321"],["2022-04-06","48232"],["2022-04-27","16245"],["2022-05-18","5314"],["2022-06-08","44710"],["2022-06-29","4905"],["2022-07-21","13851"],["2022-08-10","17825"],["2022-08-31","45441"],["2022-09-21","47471"],["2022-10-12","44988"],["2022-11-02","7110"],["2022-12-14","45134"],["2023-01-11","11475"],["2023-02-23","57965"],["2023-03-15","44873"],["2023-04-05","37890"],["2023-05-03","46399"],["2023-06-13","25982"],["2023-06-29","47963"],["2023-08-10","17632"],["2023-08-31","64776"],["2023-10-11","1034"],["2023-11-01","12457"],["2023-12-07","56102"],["2024-01-18","41468"],["2024-02-08","37965"],["2024-03-07","60013"],["2024-03-28","13968"],["2024-05-09","52930"],["2024-06-06","12428"],["2024-06-27","39767"],["2024-08-15","32553"],["2024-09-19","20337"],["2024-10-10","56450"],["2024-11-18","49849"],["2024-12-12","16453"],["2025-01-30","36557"],["2025-02-27","34007"],["2025-03-27","6543"],["2025-04-24","27982"],["2025-05-29","25285"],["2025-06-26","48925"],["2025-07-31","49999"],["2025-09-04","52304"],["2025-09-25","58924"],["2025-10-23","20512"],["2025-11-20","51127"],["2025-12-18","13192"],["2026-01-29","22252"],["2026-02-26","64001"],["2026-03-26","22869"],["2026-04-30","49059"],["2026-05-28","10842"],["2026-06-30","32246"],["2026-08-05","26334"]];
const LAST = RELEASES.length - 1;

/* wayback.maptiles.arcgis.com 在国内被 DNS 污染，改用 a / b 双节点 */
const WB_HOSTS = ['wayback-a.maptiles.arcgis.com', 'wayback-b.maptiles.arcgis.com'];
const WB_PATH = '/arcgis/rest/services/World_Imagery/MapServer/tile/';

function tileUrls(num) {
  return WB_HOSTS.map(h => 'https://' + h + WB_PATH + num + '/{z}/{y}/{x}');
}

/* 天地图中文注记 cva_w（含境界线），CGCS2000 与影像无偏移。
   tk 复用 geotype 游戏的共享开发 key（原本就是站内公开注册的浏览器端 key）。 */
const TDT_TK = 'e92d8558a9a7eb0709e7f895801bdcc9';
const TDT_SUB = ['0', '1', '2', '3', '4', '5', '6', '7'];
function tdtUrl() {
  /* 注意：maplibre-gl raster source 的 tiles 数组接受多 URL，每个 URL 里的 {x}{y}{z}
     是占位符，但子域名 {s} 必须我们自己展开——maplibre 不认识 {s}。 */
  return TDT_SUB.map(s =>
    'https://t' + s + '.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile' +
    '&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles' +
    '&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' + TDT_TK
  );
}

const PLACES = null; /* 已废弃：原观察点数据，搜索改走 Photon/天地图 */

/* =====================================================================
   2  状态与元素
   ===================================================================== */
const LS_MODE = 'hist_mode';
const LS_LABEL = 'hist_label';

const state = {
  mode: 'single',
  cur: LAST,
  ref: 0,
  labelOn: false,
  swipePct: 50,
  /* 局部对比 lens（单位 % 相对 stage），x/y 是左上角 */
  lensX: 30, lensY: 22, lensW: 40, lensH: 50
};

const $ = id => document.getElementById(id);
const el = {
  stage: $('stage'), swipe: $('swipe'),
  eraRef: $('eraRef'), eraRefV: $('eraRefV'), eraRefK: $('eraRef').querySelector('.k'),
  eraCur: $('eraCur'), eraCurV: $('eraCurV'), eraCurK: $('eraCur').querySelector('.k'),
  dateCur: $('dateCur'), dateRef: $('dateRef'),
  rngCur: $('rngCur'), rngRef: $('rngRef'),
  ticksCur: $('ticksCur'), ticksRef: $('ticksRef'),
  metaCur: $('metaCur'), metaRef: $('metaRef'),
  rowRef: $('rowRef'), hudPos: $('hudPos'),
  loadbar: $('loadbar'), toast: $('toast'), boot: $('boot'),
  btnLabel: $('btnLabel'),
  modes: $('modes'), searchBox: $('searchBox'), searchInput: $('searchInput'),
  searchClr: $('searchClr'), suggest: $('suggest'),
  lens: $('lens'), lensHandle: $('lensHandle'), lensTagRef: $('lensTagRef')
};

/* =====================================================================
   3  进度指示 / 提示
   ===================================================================== */
let pendingTasks = 0, hideTimer = null;
function progress(delta) {
  pendingTasks = Math.max(0, pendingTasks + delta);
  if (pendingTasks > 0) { clearTimeout(hideTimer); el.loadbar.classList.add('on'); }
  else hideTimer = setTimeout(() => el.loadbar.classList.remove('on'), 400);
}
let toastTimer = null;
function toast(msg, ms) {
  el.toast.textContent = msg;
  el.toast.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('on'), ms || 2300);
}

/* =====================================================================
   4  影像视图（双图层交叉淡入，避免切换闪烁）
   ===================================================================== */
class HistView {
  constructor(containerId, primary) {
    this.ready = false;
    this.primary = !!primary;
    this._slot = 0;
    this._num = null;
    this._pending = null;
    this._handler = null;
    this._timer = null;
    this._labelWanted = false;
    this._labelShown = false;

    const sources = {}, layers = [];
    for (let i = 0; i < 2; i++) {
      sources['h' + i] = {
        type: 'raster',
        tiles: tileUrls(0),
        tileSize: 256,
        minzoom: 0,
        maxzoom: 19,
        attribution: 'Esri, Maxar, Earthstar Geographics'
      };
      layers.push({
        id: 'l' + i,
        type: 'raster',
        source: 'h' + i,
        paint: {
          'raster-opacity': i === 0 ? 1 : 0,
          'raster-fade-duration': 0,
          'raster-resampling': 'linear'
        }
      });
    }

    this.map = new maplibregl.Map({
      container: containerId,
      style: { version: 8, sources: sources, layers: layers },
      center: [114.058, 22.543],
      zoom: 12,
      minZoom: 1.6,
      maxZoom: 19,
      attributionControl: false,
      fadeDuration: 0,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      maxTileCacheSize: 420,
      antialias: false
    });
    this.map.touchZoomRotate.disableRotation();

    this.map.on('load', () => {
      this.ready = true;
      if (this._labelWanted) this.setLabel(true);
      if (this._pending != null) { const p = this._pending; this._pending = null; this.release(p); }
      if (typeof this.onReady === 'function') this.onReady();
    });

    this.map.on('dataloading', () => progress(1));
    this.map.on('idle', () => progress(-1));

    if (this.primary) {
      this.map.on('mousemove', e => {
        el.hudPos.textContent =
          e.lngLat.lat.toFixed(5) + '°N  ' + e.lngLat.lng.toFixed(5) + '°E   Z' +
          this.map.getZoom().toFixed(1);
      });
    }
  }

  /* 切换影像期次 */
  release(num) {
    if (num == null) return;
    if (!this.ready) { this._pending = num; return; }
    if (this._num === num) return;
    this._num = num;

    const m = this.map;
    const next = 1 - this._slot;
    const lid = 'l' + next, oldLid = 'l' + this._slot;

    try { m.getSource('h' + next).setTiles(tileUrls(num)); }
    catch (e) { return; }

    if (this._handler) { m.off('sourcedata', this._handler); this._handler = null; }
    clearTimeout(this._timer);

    const self = this;
    const settle = function () {
      if (!self._handler) return;
      m.off('sourcedata', self._handler);
      self._handler = null;
      clearTimeout(self._timer);
      try {
        m.setPaintProperty(lid, 'raster-opacity', 1);
        m.setPaintProperty(oldLid, 'raster-opacity', 0);
      } catch (e) { /* style busy */ }
      self._slot = next;
    };

    this._handler = e => {
      if (e.sourceId !== 'h' + next) return;
      let ok = false;
      try { ok = m.isSourceLoaded('h' + next); } catch (err) { ok = false; }
      if (ok) settle();
    };
    m.on('sourcedata', this._handler);
    this._timer = setTimeout(settle, 7000);
  }

  /* 天地图中文注记层（含境界线） */
  setLabel(show) {
    this._labelWanted = show;
    const m = this.map;
    if (!m.isStyleLoaded()) return;

    if (!show) {
      if (m.getLayer('tdt-cva')) m.removeLayer('tdt-cva');
      if (m.getSource('tdt-cva')) m.removeSource('tdt-cva');
      this._labelShown = false;
      return;
    }
    if (this._labelShown) return;

    try {
      if (!m.getSource('tdt-cva')) {
        m.addSource('tdt-cva', {
          type: 'raster',
          tiles: tdtUrl(),
          tileSize: 256,
          minzoom: 1,
          maxzoom: 18,
          attribution: '天地图'
        });
      }
      if (!m.getLayer('tdt-cva')) {
        m.addLayer({
          id: 'tdt-cva', type: 'raster', source: 'tdt-cva',
          paint: { 'raster-opacity': 0.92, 'raster-fade-duration': 0 }
        });
      }
      this._labelShown = true;
    } catch (e) { /* ignore */ }
  }
}

/* =====================================================================
   5  实例化与同步
   ===================================================================== */
const viewBase = new HistView('mapBase', true);
const viewTop  = new HistView('mapTop', false);
let syncing = false;

function linkMove(src, dst) {
  src.map.on('move', () => {
    if (syncing) return;
    if (state.mode !== 'swipe' && state.mode !== 'lens') return;
    if (!dst.ready) return;
    syncing = true;
    try {
      dst.map.jumpTo({ center: src.map.getCenter(), zoom: src.map.getZoom(), bearing: 0, pitch: 0 });
    } catch (e) { /* ignore */ }
    syncing = false;
  });
}
linkMove(viewBase, viewTop);
linkMove(viewTop, viewBase);

function syncTop() {
  if (!viewTop.ready) return;
  try {
    viewTop.map.jumpTo({
      center: viewBase.map.getCenter(),
      zoom: viewBase.map.getZoom(),
      bearing: 0, pitch: 0
    });
  } catch (e) { /* ignore */ }
}

/* 唯一的地图发布入口：swipe/lens 都是「底层=基准期，上层=当前期」 */
let releaseTimer = null;
function applyReleases() {
  if (state.mode === 'swipe' || state.mode === 'lens') {
    viewBase.release(RELEASES[state.ref][1]);
    viewTop.release(RELEASES[state.cur][1]);
  } else {
    viewBase.release(RELEASES[state.cur][1]);
  }
}
function applyReleasesSoon(ms) {
  clearTimeout(releaseTimer);
  releaseTimer = setTimeout(applyReleases, ms == null ? 130 : ms);
}

/* =====================================================================
   6  时间轴
   ===================================================================== */
function fmt(d) { return d; }

function buildTicks(box) {
  const years = {};
  RELEASES.forEach((r, i) => { const y = r[0].slice(0, 4); if (!(y in years)) years[y] = i; });
  const ys = Object.keys(years);
  let html = '';
  ys.forEach(y => {
    const pct = (years[y] / LAST) * 100;
    html += '<i class="' + (parseInt(y, 10) % 2 === 0 ? 'maj' : '') + '" style="left:' + pct + '%"></i>';
  });
  ys.forEach((y, k) => {
    const last = k === ys.length - 1;
    if (k % 2 !== 0 && !last) return;
    const pct = (years[y] / LAST) * 100;
    html += '<span class="' + (k % 2 === 0 ? 'maj' : '') + '" style="left:' + pct + '%">' + y + '</span>';
  });
  box.innerHTML = html;
}
buildTicks(el.ticksCur);
buildTicks(el.ticksRef);

function syncSlider(input, idx) {
  input.value = idx;
  input.style.setProperty('--pct', (idx / LAST * 100) + '%');
}

function renderCur() {
  const r = RELEASES[state.cur];
  el.dateCur.textContent = fmt(r[0]);
  el.eraCurV.textContent = fmt(r[0]);
  el.metaCur.innerHTML = '第 <b>' + (state.cur + 1) + '</b> / ' + RELEASES.length + ' 期';
  syncSlider(el.rngCur, state.cur);
}

function renderRef() {
  const r = RELEASES[state.ref];
  el.dateRef.textContent = fmt(r[0]);
  el.eraRefV.textContent = fmt(r[0]);
  el.metaRef.innerHTML = '第 <b>' + (state.ref + 1) + '</b> / ' + RELEASES.length + ' 期';
  syncSlider(el.rngRef, state.ref);
}

function flashDate(node) {
  node.style.animation = 'none';
  void node.offsetWidth;
  node.style.animation = '';
}

/* =====================================================================
   7  卷帘
   ===================================================================== */
function applySwipe(pct) {
  state.swipePct = Math.min(96, Math.max(4, pct));
  const p = state.swipePct;
  $('mapTop').style.clipPath = 'inset(0 0 0 ' + p + '%)';
  el.swipe.style.left = p + '%';

  el.eraRef.style.left = (p / 2) + '%';
  el.eraCur.style.left = ((100 + p) / 2) + '%';
  el.eraRef.style.opacity = p < 24 ? 0 : 1;
  el.eraCur.style.opacity = p > 76 ? 0 : 1;
}

(function initSwipe() {
  let dragging = false;

  function start() { dragging = true; el.swipe.classList.add('drag'); }
  function move(clientX) {
    if (!dragging) return;
    const r = el.stage.getBoundingClientRect();
    applySwipe(((clientX - r.left) / r.width) * 100);
  }
  function end() { dragging = false; el.swipe.classList.remove('drag'); }

  el.swipe.addEventListener('pointerdown', e => {
    e.preventDefault(); start();
    try { el.swipe.setPointerCapture(e.pointerId); } catch (err) {}
  });
  el.swipe.addEventListener('pointermove', e => move(e.clientX));
  el.swipe.addEventListener('pointerup', end);
  el.swipe.addEventListener('pointercancel', end);

  el.stage.addEventListener('pointerdown', e => {
    if (state.mode !== 'swipe') return;
    if (e.target.closest('.swipe, .hud, .era')) return;
    const r = el.stage.getBoundingClientRect();
    const pos = ((e.clientX - r.left) / r.width) * 100;
    if (Math.abs(pos - state.swipePct) < 3.5) {
      start();
      try { el.swipe.setPointerCapture(e.pointerId); } catch (err) {}
    }
  });
  el.stage.addEventListener('pointermove', e => move(e.clientX));
  el.stage.addEventListener('pointerup', end);
  el.stage.addEventListener('pointercancel', end);
})();

/* =====================================================================
   8  模式（单期 / 卷帘 / 局部对比 lens）
   ===================================================================== */
/* lens 的 clip 用 inset(top right bottom left)，左上->右下，单位 % */
function applyLens() {
  const x = Math.min(92 - state.lensW, Math.max(0, state.lensX));
  const y = Math.min(92 - state.lensH, Math.max(0, state.lensY));
  const w = Math.max(10, state.lensW);
  const h = Math.max(10, state.lensH);
  state.lensX = x; state.lensY = y; state.lensW = w; state.lensH = h;

  /* mapTop = 当前期：clip 成 lens 方框 */
  $('mapTop').style.clipPath =
    'inset(' + y + '% ' + (100 - x - w) + '% ' + (100 - y - h) + '% ' + x + '%)';

  /* lens div 同步定位 */
  el.lens.style.left   = x + '%';
  el.lens.style.top    = y + '%';
  el.lens.style.width  = w + '%';
  el.lens.style.height = h + '%';
}

(function initLens() {
  let mode = null, sx = 0, sy = 0, ox = 0, oy = 0, ow = 0, oh = 0;

  function rect() { return el.stage.getBoundingClientRect(); }
  function start(e, isResize) {
    e.preventDefault();
    e.stopPropagation();
    mode = isResize ? 'resize' : 'move';
    const r = rect();
    sx = e.clientX; sy = e.clientY;
    ox = state.lensX; oy = state.lensY;
    ow = state.lensW; oh = state.lensH;
    el.lens.classList.add('drag');
    try { (isResize ? el.lensHandle : el.lens).setPointerCapture(e.pointerId); } catch (err) {}
  }
  function move(e) {
    if (!mode) return;
    const r = rect();
    const dx = ((e.clientX - sx) / r.width) * 100;
    const dy = ((e.clientY - sy) / r.height) * 100;
    if (mode === 'move') {
      state.lensX = ox + dx;
      state.lensY = oy + dy;
    } else {
      state.lensW = Math.min(96 - ox, Math.max(10, ow + dx));
      state.lensH = Math.min(96 - oy, Math.max(10, oh + dy));
    }
    applyLens();
  }
  function end() { mode = null; el.lens.classList.remove('drag'); }

  el.lens.addEventListener('pointerdown', e => start(e, false));
  el.lens.addEventListener('pointermove', move);
  el.lens.addEventListener('pointerup', end);
  el.lens.addEventListener('pointercancel', end);
  el.lensHandle.addEventListener('pointerdown', e => start(e, true));
  el.lensHandle.addEventListener('pointermove', move);
  el.lensHandle.addEventListener('pointerup', end);
  el.lensHandle.addEventListener('pointercancel', end);
})();

function setMode(m, silent) {
  if (m !== 'swipe' && m !== 'lens' && m !== 'single') m = 'single';
  state.mode = m;
  try { localStorage.setItem(LS_MODE, m); } catch (e) {}

  const sw = (m === 'swipe');
  const ln = (m === 'lens');
  el.swipe.classList.toggle('on', sw);
  el.stage.classList.toggle('swiping', sw);
  el.stage.classList.toggle('lensing', ln);
  el.lens.classList.toggle('on', ln);
  el.lensTagRef.classList.toggle('on', ln);
  /* 双时间轴在 swipe/lens 都需要 */
  el.rowRef.classList.toggle('hide', !sw && !ln);
  /* 两侧文字标签只在 swipe 显示；lens 用 .lens-tag */
  el.eraRef.classList.toggle('on', sw);
  el.eraCur.classList.toggle('on', sw);
  el.eraRefK.textContent = '基准期';
  el.eraCurK.textContent = '当前期';

  Array.prototype.forEach.call(el.modes.children, b => {
    b.classList.toggle('on', b.dataset.mode === m);
  });

  if (sw) {
    $('mapTop').style.clipPath = 'inset(0 0 0 ' + state.swipePct + '%)';
    viewTop.map.resize();
    syncTop();
    applySwipe(state.swipePct);
    applyReleasesSoon(0);
    if (!silent) toast('拖动中间把手，对比两个时期');
  } else if (ln) {
    viewTop.map.resize();
    syncTop();
    applyLens();
    applyReleasesSoon(0);
    if (!silent) toast('拖动方框移动，右下圆点调整大小');
  } else {
    $('mapTop').style.clipPath = 'inset(0 0 0 100%)';
    applyReleasesSoon(0);
    if (!silent) toast('已切换为单期浏览');
  }
}

el.modes.addEventListener('click', e => {
  const b = e.target.closest('button[data-mode]');
  if (b) setMode(b.dataset.mode);
});

/* =====================================================================
   9  滑块与步进
   ===================================================================== */
function bindSlider(input, which) {
  const isCur = which === 'cur';
  input.addEventListener('input', () => {
    const v = parseInt(input.value, 10);
    if (isCur) {
      state.cur = v;
      el.dateCur.textContent = RELEASES[v][0];
      el.eraCurV.textContent = RELEASES[v][0];
      el.metaCur.innerHTML = '第 <b>' + (v + 1) + '</b> / ' + RELEASES.length + ' 期';
      syncSlider(input, v);
      el.loadbar.classList.add('on');
    } else {
      state.ref = v;
      el.dateRef.textContent = RELEASES[v][0];
      el.eraRefV.textContent = RELEASES[v][0];
      el.metaRef.innerHTML = '第 <b>' + (v + 1) + '</b> / ' + RELEASES.length + ' 期';
      syncSlider(input, v);
      el.loadbar.classList.add('on');
    }
    applyReleasesSoon(130);
  });
  input.addEventListener('change', () => applyReleases());
  input.addEventListener('pointerup', () => {
    setTimeout(() => { if (pendingTasks <= 0) el.loadbar.classList.remove('on'); }, 500);
  });
}
bindSlider(el.rngCur, 'cur');
bindSlider(el.rngRef, 'ref');

function step(which, d) {
  if (which === 'cur') {
    const v = Math.min(LAST, Math.max(0, state.cur + d));
    if (v === state.cur) return;
    state.cur = v;
    renderCur();
    flashDate(el.dateCur);
  } else {
    const v = Math.min(LAST, Math.max(0, state.ref + d));
    if (v === state.ref) return;
    state.ref = v;
    renderRef();
    flashDate(el.dateRef);
  }
  applyReleasesSoon(0);
}
$('curPrev').onclick = () => step('cur', -1);
$('curNext').onclick = () => step('cur', 1);
$('refPrev').onclick = () => step('ref', -1);
$('refNext').onclick = () => step('ref', 1);

document.addEventListener('keydown', e => {
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
  if (e.key === 'ArrowLeft')       { step('cur', -1); e.preventDefault(); }
  else if (e.key === 'ArrowRight') { step('cur',  1); e.preventDefault(); }
  else if (e.key === 'ArrowUp'   && state.mode === 'swipe') { step('ref',  1); e.preventDefault(); }
  else if (e.key === 'ArrowDown' && state.mode === 'swipe') { step('ref', -1); e.preventDefault(); }
  else if (e.key === ' ')  { setMode(state.mode === 'swipe' ? 'single' : 'swipe'); e.preventDefault(); }
  else if (e.key === 'Escape') { closeSuggest(); }
});

/* =====================================================================
   10  搜索 / 定位
   ===================================================================== */

function flyTo(lng, lat, z) {
  const zz = z || 12;
  try { viewBase.map.flyTo({ center: [lng, lat], zoom: zz, duration: 900, essential: true }); }
  catch (e) { /* ignore */ }
  if (viewTop.ready) {
    try { viewTop.map.jumpTo({ center: [lng, lat], zoom: zz, bearing: 0, pitch: 0 }); }
    catch (e) { /* ignore */ }
  }
  closeSuggest();
  el.searchInput.blur();
}

function parseCoord(s) {
  const m = s.match(/^\s*(-?\d+(?:\.\d+)?)\s*[,，\s]\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!m) return null;
  const a = parseFloat(m[1]), b = parseFloat(m[2]);
  let lng, lat;
  if (Math.abs(a) > 90) { lng = a; lat = b; }
  else if (Math.abs(b) > 90) { lat = a; lng = b; }
  else { lat = a; lng = b; }
  if (lng < -180 || lng > 180 || lat < -85 || lat > 85) return null;
  return { lng: lng, lat: lat };
}

let sugIndex = -1;
function closeSuggest() { el.suggest.classList.remove('on'); sugIndex = -1; }

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

/* 在线地名搜索：Photon（OSM 数据，免 Key，WGS84）+ 天地图搜索（CGCS2000，需已存 tk）。
   高德/腾讯是 GCJ-02、百度是 BD-09，相对 Esri WGS84 影像有百米级偏移，刻意不接。 */
const PHOTON = 'https://photon.komoot.io/api/';
let nomTimer = null, nomSeq = 0;

function spanZoom(dLat, dLng) {
  const span = Math.max(dLat, dLng);
  if (!isFinite(span) || span <= 0) return 12;
  if (span > 20) return 4;
  if (span > 8)  return 6;
  if (span > 3)  return 8;
  if (span > 1)  return 10;
  if (span > 0.3) return 12;
  if (span > 0.08) return 14;
  return 15;
}

/* Photon: 返回统一条目 {lng,lat,z,nm,co} */
function searchPhoton(q) {
  const url = PHOTON + '?limit=6&lang=default&q=' + encodeURIComponent(q);
  return fetch(url)
    .then(r => r.ok ? r.json() : null)
    .then(j => {
      if (!j || !j.features) return [];
      return j.features.map(f => {
        const p = f.properties || {}, c = f.geometry.coordinates;
        let z;
        if (p.extent && p.extent.length === 4) {
          z = spanZoom(Math.abs(p.extent[3] - p.extent[1]), Math.abs(p.extent[2] - p.extent[0]));
        } else {
          z = { country: 5, state: 7, region: 7, province: 7, city: 11, town: 12,
                district: 13, locality: 13, borough: 13, suburb: 13, quarter: 14,
                village: 13, hamlet: 14, street: 15, house: 16 }[p.osm_value] || 13;
        }
        const tail = [p.district, p.city, p.state, p.country].filter(Boolean).join(' · ');
        return { lng: c[0], lat: c[1], z: z, nm: p.name || q, co: tail };
      }).filter(it => isFinite(it.lng) && isFinite(it.lat));
    })
    .catch(() => []);
}

/* 天地图地名搜索 V2：CGCS2000 与影像无偏移；tk 复用注记层那枚。 */
function searchTianditu(q) {
  const tk = TDT_TK;
  const post = JSON.stringify({
    keyWord: q, level: 12, mapBound: '-180,-85,180,85',
    queryType: 1, start: 0, count: 6, show: 1
  });
  const url = 'https://api.tianditu.gov.cn/v2/search?type=query&tk=' + encodeURIComponent(tk) +
              '&postStr=' + encodeURIComponent(post);
  return fetch(url)
    .then(r => r.ok ? r.json() : null)
    .then(j => {
      const pois = j && (j.pois || (j.area && j.area.pois)) || [];
      return pois.map(p => {
        const m = String(p.lonlat || '').split(/[\s,]+/).map(parseFloat);
        if (m.length < 2 || !isFinite(m[0]) || !isFinite(m[1])) return null;
        const lv = parseInt(p.level, 10);
        const z = isFinite(lv) ? Math.max(5, Math.min(16, lv)) : 13;
        return { lng: m[0], lat: m[1], z: z, nm: p.name || q,
                 co: (p.address || '').slice(0, 40) };
      }).filter(Boolean);
    })
    .catch(() => []);
}

function searchOnline(q) {
  return Promise.all([searchTianditu(q), searchPhoton(q)])
    .then(([tdt, pho]) => {
      const seen = new Set(), out = [];
      tdt.concat(pho).forEach(it => {
        const k = Math.round(it.lng * 500) + '_' + Math.round(it.lat * 500);
        if (seen.has(k)) return;
        seen.add(k); out.push(it);
      });
      return out.slice(0, 7);
    });
}

function renderSuggest(q) {
  const key = q.trim().toLowerCase();
  nomSeq++;
  if (!key) {
    if (nomTimer) { clearTimeout(nomTimer); nomTimer = null; }
    closeSuggest();
    return;
  }

  const coord = parseCoord(key);

  let html = '';
  if (coord) {
    html += '<div class="grp">坐标定位</div><button data-lng="' + coord.lng + '" data-lat="' +
            coord.lat + '" data-z="13"><span class="nm">跳转到 ' +
            coord.lat.toFixed(5) + ', ' + coord.lng.toFixed(5) + '</span></button>';
  }

  /* 非坐标查询时追加 Nominatim 在线结果（先渲染本地，防抖后异步补上） */
  if (!coord) {
    const groupId = 'nom-grp';
    html += '<div class="grp" id="' + groupId + '">在线搜索</div>' +
            '<div class="empty" id="nom-status" style="padding-top:0">搜索中…</div>';
    el.suggest.innerHTML = html;
    el.suggest.classList.add('on');
    sugIndex = -1;

    if (nomTimer) clearTimeout(nomTimer);
    const mySeq = nomSeq;
    nomTimer = setTimeout(() => {
      searchOnline(key).then(list => {
        /* 输入已变化，丢弃过期结果 */
        if (mySeq !== nomSeq) return;
        if (el.searchInput.value.trim().toLowerCase() !== key) return;
        const status = document.getElementById('nom-status');
        if (!status) return;
        if (!list.length) {
          status.textContent = '在线搜索无结果';
          return;
        }
        status.remove();
        let extra = '';
        list.forEach(it => {
          extra += '<button data-lng="' + it.lng + '" data-lat="' + it.lat + '" data-z="' + it.z +
                   '"><span class="nm">' + esc(it.nm) + '</span><span class="co">' +
                   esc(it.co) + '</span></button>';
        });
        const grp = document.getElementById(groupId);
        if (grp) grp.insertAdjacentHTML('afterend', extra);
      });
    }, 280);
    return;
  }

  if (!html) {
    html = '<div class="empty">未找到匹配地点。可直接输入坐标，例如 <b>22.54,114.06</b></div>';
  }
  el.suggest.innerHTML = html;
  el.suggest.classList.add('on');
  sugIndex = -1;
}

el.searchInput.addEventListener('input', () => {
  el.searchBox.classList.toggle('has', !!el.searchInput.value);
  renderSuggest(el.searchInput.value);
});
el.searchInput.addEventListener('focus', () => { if (el.searchInput.value) renderSuggest(el.searchInput.value); });
el.searchInput.addEventListener('keydown', e => {
  const btns = el.suggest.querySelectorAll('button');
  if (e.key === 'ArrowDown') { sugIndex = Math.min(btns.length - 1, sugIndex + 1); e.preventDefault(); }
  else if (e.key === 'ArrowUp') { sugIndex = Math.max(-1, sugIndex - 1); e.preventDefault(); }
  else if (e.key === 'Enter') {
    const b = sugIndex >= 0 ? btns[sugIndex] : btns[0];
    if (b) bubble(b);
    e.preventDefault();
    return;
  } else if (e.key === 'Escape') { closeSuggest(); return; }
  btns.forEach((b, i) => b.classList.toggle('act', i === sugIndex));
});
function bubble(b) { flyTo(parseFloat(b.dataset.lng), parseFloat(b.dataset.lat), parseFloat(b.dataset.z)); }
el.suggest.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b) bubble(b);
});
el.searchClr.onclick = () => {
  el.searchInput.value = '';
  el.searchBox.classList.remove('has');
  closeSuggest();
  el.searchInput.focus();
};
document.addEventListener('click', e => {
  if (!el.searchBox.contains(e.target)) closeSuggest();
});

/* =====================================================================
   11  中文注记层（高德免 Key 瓦片）
   ===================================================================== */
function applyLabel() {
  viewBase.setLabel(state.labelOn);
  viewTop.setLabel(state.labelOn);
  el.btnLabel.classList.toggle('on', state.labelOn);
  el.btnLabel.querySelector('.t').textContent = state.labelOn ? '注记开' : '注记';
}

el.btnLabel.onclick = () => {
  state.labelOn = !state.labelOn;
  try { localStorage.setItem(LS_LABEL, state.labelOn ? '1' : '0'); } catch (e) {}
  applyLabel();
  toast(state.labelOn ? '已开启中文注记（高德路网）' : '已关闭注记层');
};

/* =====================================================================
   12  启动
   ===================================================================== */
(function boot() {
  try {
    const m = localStorage.getItem(LS_MODE);
    if (m === 'swipe' || m === 'single' || m === 'lens') state.mode = m;
    state.labelOn = localStorage.getItem(LS_LABEL) === '1';
  } catch (e) {}

  state.cur = LAST;
  state.ref = 0;

  el.rngCur.max = String(LAST);
  el.rngRef.max = String(LAST);
  renderCur();
  renderRef();

  let done = 0, fired = false;
  function go() {
    if (fired) return;
    fired = true;

    const sw = state.mode === 'swipe', ln = state.mode === 'lens';
    el.stage.classList.toggle('swiping', sw);
    el.stage.classList.toggle('lensing', ln);
    el.swipe.classList.toggle('on', sw);
    el.lens.classList.toggle('on', ln);
    el.lensTagRef.classList.toggle('on', ln);
    el.rowRef.classList.toggle('hide', !sw && !ln);
    el.eraRef.classList.toggle('on', sw);
    el.eraCur.classList.toggle('on', sw);
    Array.prototype.forEach.call(el.modes.children, b => {
      b.classList.toggle('on', b.dataset.mode === state.mode);
    });
    if (sw) {
      $('mapTop').style.clipPath = 'inset(0 0 0 ' + state.swipePct + '%)';
      applySwipe(state.swipePct);
      viewTop.map.resize();
      syncTop();
    } else if (ln) {
      viewTop.map.resize();
      syncTop();
      applyLens();
    } else {
      $('mapTop').style.clipPath = 'inset(0 0 0 100%)';
    }

    // 统一走 applyReleases()：卷帘模式下「基准期=底层左半、当前期=上层右半」的
    // 映射只在 applyReleases 里维护一份。此处原先直接调 viewBase/viewTop.release()，
    // 把两期传反了（底层给了当前期、上层给了基准期），导致刚进页面时左右两侧的
    // 期别与「基准期 / 当前期」标签对调。
    applyReleases();

    if (state.labelOn) applyLabel();

    el.boot.classList.add('gone');
    setTimeout(() => { if (el.boot.parentNode) el.boot.parentNode.removeChild(el.boot); }, 620);

    if (state.mode === 'swipe') {
      setTimeout(() => toast('左侧基准期 · 右侧当前期，拖动中间把手对比', 3400), 750);
    }
  }

  function once() { done++; if (done >= 2) go(); }
  if (viewBase.ready) once(); else viewBase.onReady = once;
  if (viewTop.ready) once(); else viewTop.onReady = once;
  setTimeout(go, 5200);
})();

window.addEventListener('resize', () => {
  viewBase.map.resize();
  if (viewTop.ready) viewTop.map.resize();
});

})();
