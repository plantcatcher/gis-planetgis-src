// 应用入口：装配引擎、渲染、拖拽、UI，并管理计时 / 缩放平移 / 模式切换。
import {
  getLevel,
  LEVELS,
  PROVINCE_LIST,
  resolveLevel,
  isProvinceLevelId,
  provinceLevelId,
  provinceInfo,
  provincesByRegion,
} from './engine/levels.js';
import { PuzzleEngine } from './engine/PuzzleEngine.js';
import { Renderer } from './engine/renderer.js';
import { DragController } from './engine/dragController.js';
import { Modals } from './ui/modals.js';
import { AudioManager } from './engine/audio.js';
import { recordResult, getLevelScore, getRecent, formatTime, getTotals } from './engine/scoreStore.js';
import { clientToSvg } from './engine/geo.js';
import { launchConfetti } from './engine/confetti.js';
import { drawShareCard } from './engine/shareCard.js';
import { CHINA } from '../data/chinaData.js';

// ---- 本地设置（持久化到 localStorage）----
const settings = {
  get muted() { return localStorage.getItem('cmp_muted') === '1'; }, // 音效（点击/放对/放错/胜利）
  set muted(v) { localStorage.setItem('cmp_muted', v ? '1' : '0'); },
  get bgmMuted() { return localStorage.getItem('cmp_bgm_muted') === '1'; }, // 背景音乐
  set bgmMuted(v) { localStorage.setItem('cmp_bgm_muted', v ? '1' : '0'); },
  get suppressCards() { return localStorage.getItem('cmp_suppress') === '1'; },
  set suppressCards(v) { localStorage.setItem('cmp_suppress', v ? '1' : '0'); },
  get showNames() { return localStorage.getItem('cmp_showNames') !== '0'; },
  set showNames(v) { localStorage.setItem('cmp_showNames', v ? '1' : '0'); },
};

const audio = new AudioManager();
audio.sfxMuted = settings.muted;
audio.bgmMuted = settings.bgmMuted;

let level = getLevel('china-province');

// ---- DOM ----
const svg = document.getElementById('map');
const viewport = document.getElementById('viewport');
const bgLayer = document.getElementById('bgLayer');
const ghostLayer = document.getElementById('ghostLayer');
const pieceLayer = document.getElementById('pieceLayer');
const traySvg = document.getElementById('traySvg');
const trayContent = document.getElementById('trayContent');
const mapWrap = document.getElementById('mapWrap');
let timerEl = document.getElementById('timer');
const progressEl = document.getElementById('progress');
const totalEl = document.getElementById('total');
const levelTitleEl = document.getElementById('levelTitle');
const hudTimer = document.getElementById('hudTimer');
const hudMode = document.getElementById('hudMode');
const progressFill = document.getElementById('progressFill');

const homeScreen = document.getElementById('homeScreen');
const homeMap = document.getElementById('homeMap');
const homeStartBtn = document.getElementById('homeStart');
const homeHelpBtn = document.getElementById('homeHelp');
const homeStats = document.getElementById('homeStats');
const homeLevels = document.getElementById('homeLevels');
const homeProvinces = document.getElementById('homeProvinces');
const homePicked = document.getElementById('homePicked');
const homeModeSeg = document.getElementById('homeModeSeg');
const homeModeDesc = document.getElementById('homeModeDesc');
const btnNames = document.getElementById('btnNames'); // 游戏内「显示名称」控件（练习模式）
let selectedLevelId = level.id;
let selectedMode = 'practice';
let provinceGridOpen = false;

// 在首页直接渲染关卡选择卡片（整图关卡 + 合集入口）
function renderHomeLevels() {
  homeLevels.innerHTML = '';
  LEVELS.forEach((l) => {
    const card = document.createElement('button');
    const isCollection = !!l.collection;
    card.className =
      'home-level-card' + (isCollection ? ' collection' : '') +
      (l.id === selectedLevelId ? ' selected' : '');
    card.dataset.level = l.id;
    if (isCollection) card.dataset.collection = '1';
    card.innerHTML =
      `<span class="hl-tag">${l.tag}</span>` +
      `<span class="hl-title">${l.title}</span>` +
      `<span class="hl-sub">${l.subtitle}</span>`;
    card.addEventListener('click', () => {
      audio.playClick();
      if (isCollection) {
        toggleProvinceGrid();
        refreshHomeSelection(); // 合集面板打开时高亮该卡片（光圈）
        return;
      }
      selectedLevelId = l.id;
      hideProvinceGrid();
      refreshHomeSelection();
      renderHomeStats();
    });
    homeLevels.appendChild(card);
  });
}

// 省份选择面板（合集内）：按大区分组 + 关键字搜索
let provinceGridBuilt = false;
function renderProvinceGrid() {
  if (provinceGridBuilt) return;
  homeProvinces.innerHTML = '';

  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'prov-search';
  search.placeholder = '搜索省份，例如 广东 / 四川 / 新疆';
  homeProvinces.appendChild(search);

  const wrap = document.createElement('div');
  wrap.className = 'prov-groups';
  provincesByRegion().forEach(([region, list]) => {
    const group = document.createElement('div');
    group.className = 'prov-group';
    group.dataset.region = region;

    const head = document.createElement('div');
    head.className = 'prov-group-title';
    head.innerHTML = `${region}<span class="pg-count">${list.length} 省</span>`;
    group.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'prov-grid';
    list.forEach((p) => {
      const chip = document.createElement('button');
      chip.className = 'province-chip';
      chip.dataset.level = provinceLevelId(p.id);
      chip.dataset.key = `${p.short}|${p.name}`;
      chip.innerHTML = `<span class="pc-name">${p.short}</span><span class="pc-count">${p.count}</span>`;
      chip.addEventListener('click', () => {
        audio.playClick();
        selectedLevelId = provinceLevelId(p.id);
        refreshHomeSelection();
        renderHomeStats();
      });
      grid.appendChild(chip);
    });
    group.appendChild(grid);
    wrap.appendChild(group);
  });
  homeProvinces.appendChild(wrap);

  search.addEventListener('input', () => {
    const q = search.value.trim();
    wrap.querySelectorAll('.prov-group').forEach((g) => {
      let visible = 0;
      g.querySelectorAll('.province-chip').forEach((c) => {
        const hit = !q || c.dataset.key.includes(q);
        c.classList.toggle('hidden', !hit);
        if (hit) visible += 1;
      });
      g.classList.toggle('hidden', visible === 0);
    });
  });

  provinceGridBuilt = true;
}

function showProvinceGrid() {
  renderProvinceGrid();
  homeProvinces.classList.remove('hidden');
  provinceGridOpen = true;
  refreshHomeSelection();
}
function toggleProvinceGrid() {
  if (homeProvinces.classList.contains('hidden')) showProvinceGrid();
  else hideProvinceGrid();
}
function hideProvinceGrid() {
  homeProvinces.classList.add('hidden');
  provinceGridOpen = false;
}

// 统一刷新首页选中态（整图卡片 + 省份卡片 + 已选提示）
function refreshHomeSelection() {
  document.querySelectorAll('#homeLevels .home-level-card, #homeProvinces .province-chip').forEach((c) => {
    const isCard = c.classList.contains('home-level-card');
    const isCollectionCard = c.classList.contains('collection');
    let sel = c.dataset.level === selectedLevelId;
    // 合集面板打开时：普通/大区关卡卡片不再保持选中态，避免与合集同时高亮（省份 chip 仍正常高亮）
    if (provinceGridOpen && isCard && !isCollectionCard) sel = false;
    c.classList.toggle('selected', sel);
  });
  // 合集入口：打开省份面板、或已选中某省时均高亮（光圈）
  const col = document.querySelector('#homeLevels .home-level-card.collection');
  if (col) col.classList.toggle('selected', provinceGridOpen || isProvinceLevelId(selectedLevelId));
  renderPicked();
}

// 「已选」提示条
function selectedMeta() {
  if (isProvinceLevelId(selectedLevelId)) {
    const info = provinceInfo(selectedLevelId.replace('pc-', ''));
    return info
      ? { title: `${info.name} · 地市拼图`, tag: info.short, pieces: info.count }
      : { title: '未知关卡', tag: '—', pieces: 0 };
  }
  const l = LEVELS.find((x) => x.id === selectedLevelId) || LEVELS[0];
  return { title: l.title, tag: l.tag, pieces: l.regions.length };
}
function renderPicked() {
  if (!homePicked) return;
  // 省份面板打开但尚未选省：提示先选择
  if (provinceGridOpen && !isProvinceLevelId(selectedLevelId)) {
    homePicked.innerHTML = `已从「省内地市拼图」进入 · 请选择一个省份`;
    return;
  }
  const m = selectedMeta();
  homePicked.innerHTML = `已选：<b>${m.title}</b> · ${m.pieces} 块`;
}

const MODE_DESC = {
  practice: '无时间限制 · 显示名称 · 适合学习',
  challenge: '开始计时 · 隐藏提示 · 记录最佳成绩',
};
function selectMode(m) {
  selectedMode = m;
  homeModeSeg.querySelectorAll('.mode-seg-btn').forEach((b) =>
    b.classList.toggle('active', b.dataset.mode === m)
  );
  homeModeDesc.textContent = MODE_DESC[m];
}
const confettiCanvas = document.getElementById('confetti');
const shareModal = document.getElementById('shareModal');
const shareCanvas = document.getElementById('shareCanvas');
const shareImg = document.getElementById('shareImg');
const shareDownload = document.getElementById('shareDownload');
const shareClose = document.getElementById('shareClose');

levelTitleEl.textContent = level.subtitle;
totalEl.textContent = level.regions.length;

// ---- 引擎与渲染 ----
let engine = new PuzzleEngine(level);
const renderer = new Renderer({ svg, viewport, bgLayer, ghostLayer, pieceLayer, traySvg, trayContent, level });
// 桌面端（≥980px）碎片区改用多列网格（右侧栏），与 CSS 两栏布局配合
const mqDesktop = window.matchMedia('(min-width: 980px)');
renderer.grid = mqDesktop.matches;
renderer.build();

// ---- 视图变换（缩放 / 平移）----
const view = { k: 1, tx: 0, ty: 0 };
function applyView() {
  viewport.setAttribute('transform', `translate(${view.tx} ${view.ty}) scale(${view.k})`);
}
function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}
function zoomBy(factor) {
  const rect = mapWrap.getBoundingClientRect();
  const c = clientToSvg(svg, viewport, rect.left + rect.width / 2, rect.top + rect.height / 2);
  const newK = clamp(view.k * factor, 0.6, 6);
  view.tx += (view.k - newK) * c.x;
  view.ty += (view.k - newK) * c.y;
  view.k = newK;
  applyView();
}
document.getElementById('zoomIn').addEventListener('click', () => { audio.playClick(); zoomBy(1.25); });
document.getElementById('zoomOut').addEventListener('click', () => { audio.playClick(); zoomBy(0.8); });
document.getElementById('zoomReset').addEventListener('click', () => {
  audio.playClick();
  view.k = 1; view.tx = 0; view.ty = 0; applyView();
});

// 平移：在地图空白处拖动
let panning = null;
svg.addEventListener('pointerdown', (e) => {
  panning = { id: e.pointerId, x: e.clientX, y: e.clientY };
  try { svg.setPointerCapture(e.pointerId); } catch {}
});
svg.addEventListener('pointermove', (e) => {
  if (!panning) return;
  const a = clientToSvg(svg, viewport, panning.x, panning.y);
  const b = clientToSvg(svg, viewport, e.clientX, e.clientY);
  view.tx += b.x - a.x;
  view.ty += b.y - a.y;
  applyView();
  panning.x = e.clientX; panning.y = e.clientY;
});
function endPan(e) {
  if (!panning) return;
  panning = null;
  try { svg.releasePointerCapture(e.pointerId); } catch {}
}
svg.addEventListener('pointerup', endPan);
svg.addEventListener('pointercancel', endPan);
// 滚轮缩放
mapWrap.addEventListener(
  'wheel',
  (e) => {
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? 1.12 : 0.89);
  },
  { passive: false }
);

// ---- 计时 ----
let mode = 'practice';
let timerHandle = null;
let startTime = 0;
let elapsed = 0;
let errors = 0;
let lastResult = null;

function tick() {
  elapsed = (performance.now() - startTime) / 1000;
  timerEl.textContent = formatTime(elapsed);
}
function startTimer() {
  startTime = performance.now();
  elapsed = 0;
  timerEl.textContent = '00:00';
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = setInterval(tick, 250);
}
function stopTimer() {
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = null;
}

// ---- 状态 ----
function updateProgress() {
  const done = engine.progress();
  progressEl.textContent = done;
  if (progressFill) {
    const total = level.regions.length || 1;
    progressFill.style.width = Math.min(100, (done / total) * 100) + '%';
  }
}

async function startGame(levelId, m) {
  mode = m;
  const lvl = await resolveLevel(levelId); // 省份关卡按需 dynamic import
  level = lvl;
  engine.setLevel(lvl);
  renderer.setLevel(lvl);
  // 练习模式默认显示各区域名称（学习向）；挑战模式隐藏名称及其控件
  const practice = m === 'practice';
  renderer.showNames = practice;        // 练习=True，挑战=False
  renderer._practiceLabels = practice;   // 让游戏内「名称」按钮即时切换生效
  renderer.showGhostLabels(practice);    // 练习模式常显轮廓名（挑战模式不显示）
  if (btnNames) {
    btnNames.style.display = practice ? '' : 'none';
    btnNames.classList.toggle('active', practice);
  }
  levelTitleEl.textContent = lvl.subtitle;
  totalEl.textContent = lvl.regions.length;
  errors = 0;
  updateProgress();
  hudMode.textContent = (m === 'challenge' ? '挑战模式' : '练习模式') + ' · ' + lvl.tag;
  if (m === 'challenge') {
    hudTimer.innerHTML = '⏱ <span id="timer">00:00</span>';
    timerEl = document.getElementById('timer');
    startTimer();
  } else {
    hudTimer.textContent = '📚 练习';
    stopTimer();
  }
  audio.startBGM(); // 练习/挑战两种模式均播放 BGM（静音时 startBGM 内部自动跳过）
}

function finishGame() {
  stopTimer();
  audio.stopBGM();
  audio.playWin(); // 两种模式完成均播放胜利音
  launchConfetti(confettiCanvas);
  const t = Math.round(elapsed);
  const score = recordResult(level.id, { mode, time: t, errors });
  // 成绩打通：每完成一局，写回主站「我的学习」档案（同源 iframe 内已由 /games-sync.js 注入 window.PlanetLearning）
  try {
    if (window.PlanetLearning && typeof window.PlanetLearning.recordGame === 'function') {
      window.PlanetLearning.recordGame({
        gameId: 'chinapuzzle',
        title: '中国地图拼图挑战',
        subtitle: `${level.subtitle} · ${mode === 'challenge' ? '挑战' : '练习'} · 用时 ${formatTime(t)} · ${errors} 失误`,
        score: null,
        total: null,
      });
    }
  } catch (e) {}
  lastResult = { mode, time: t, errors };
  const recent = getRecent(level.id, 5);
  modals.showResult({ mode, time: t, errors, score, recent, total: level.regions.length });
}

// ---- 拖拽回调 ----
const drag = new DragController({
  traySvg,
  mapSvg: svg,
  mapViewport: viewport,
  renderer,
  engine,
  onPlace: (region) => {
    updateProgress();
    audio.playPlace();
    renderer.pulsePlaced(region.id);
    // 挑战模式放对后短暂显示省名（受开关控制）；练习模式轮廓已常显省名，不再叠加
    if (mode === 'challenge' && settings.showNames) {
      renderer.showPlacedName(region, false);
    }
    if (engine.isComplete()) {
      finishGame();
      return;
    }
    // 挑战模式不弹窗；练习模式仅当未勾选「不再弹出」时弹知识卡
    if (mode === 'practice' && !settings.suppressCards) {
      modals.showCard(region, settings.suppressCards);
    } else {
      modals.toast(`🎉 ${region.short} 完成！`);
    }
  },
  onError: () => {
    errors += 1;
    audio.playError();
  },
});

// ---- 弹窗 ----
const modals = new Modals({
  onCloseCard: (suppress) => {
    settings.suppressCards = suppress; // 记住「不再弹出」选择
  },
  onToggleCards: (on) => {
    settings.suppressCards = !on; // 设置里开关：on=true 表示启用弹窗
  },
  onToggleNames: (on) => setNames(on),
  onToggleAudio: (on) => {
    audio.ensure();
    audio.setSfxMuted(!on); // 音效独立开关（不影响 BGM）
    settings.muted = !on;
  },
  onToggleBGM: (on) => {
    audio.ensure();
    audio.setBgmMuted(!on); // 背景音乐独立开关
    settings.bgmMuted = !on;
    if (on) audio.startBGM(); else audio.stopBGM();
  },
  onReshuffle: () => {
    startGame(level.id, mode);
    modals.toast('已重新打乱');
  },
  onClick: () => audio.playClick(), // 弹窗内按钮（关闭/重玩/开关/重打乱）统一点击音效
  onCloseResult: () => {},
  onReplay: () => startGame(selectedLevelId, mode),
});

// 省名显示：设置开关与游戏内控件共用，同步渲染器与按钮态
function setNames(on) {
  settings.showNames = on;
  if (btnNames) btnNames.classList.toggle('active', on);
  if (renderer) renderer.setNamesPersistent(on);
}
if (btnNames) {
  btnNames.addEventListener('click', () => {
    audio.playClick();
    setNames(!settings.showNames);
  });
}

// ---- 顶栏按钮 ----
const btnSettings = document.getElementById('btnSettings');
btnSettings.addEventListener('click', () => {
  audio.playClick();
  modals.showSettings({
    muted: audio.sfxMuted,
    bgm: audio.bgmMuted,
    suppress: settings.suppressCards,
    names: settings.showNames,
    mode,
    inGame: true,
  });
});
// ---- 成绩分享卡 ----
document.getElementById('resultShare').addEventListener('click', () => { audio.playClick(); openShare(); });
shareClose.addEventListener('click', () => { audio.playClick(); shareModal.classList.add('hidden'); });

function openShare() {
  if (!lastResult) return;
  drawShareCard(shareCanvas, {
    level,
    mode: lastResult.mode,
    time: lastResult.time,
    errors: lastResult.errors,
    score: getLevelScore(level.id),
  });
  const url = shareCanvas.toDataURL('image/png');
  shareImg.src = url;
  shareDownload.href = url;
  shareModal.classList.remove('hidden');
}

// ---- 主页 ----
// 统计口径：所有可玩关卡（整图关卡 + 34 个省的地市关卡），合集入口本身不计
const STAT_LEVELS = [
  ...LEVELS.filter((l) => !l.collection).map((l) => ({
    id: l.id, pieces: l.regions.length, title: l.title, tag: l.tag, kind: 'map',
  })),
  ...PROVINCE_LIST.map((p) => ({
    id: provinceLevelId(p.id), pieces: p.count, title: `${p.name} · 地市拼图`, tag: p.short, kind: 'province',
  })),
];

function renderHomeStats() {
  const m = selectedMeta();
  const s = getLevelScore(selectedLevelId);
  const best = s.bestTime != null ? formatTime(s.bestTime) : '—';
  const minE = s.minErrors != null ? s.minErrors : '—';
  const tot = getTotals(STAT_LEVELS);

  // 当前关卡三指标
  let html = `<div class="stat-grid">
    <div class="stat-cell"><div class="stat-num">${best}</div><div class="stat-label">${m.tag}最佳</div></div>
    <div class="stat-cell"><div class="stat-num">${minE}</div><div class="stat-label">最少失误</div></div>
    <div class="stat-cell"><div class="stat-num">${s.plays}</div><div class="stat-label">通关次数</div></div>
  </div>`;

  // 累计（跨关卡）
  html += `<div class="home-cum">累计拼完 <b>${tot.totalPieces}</b> 块 · 共 <b>${tot.totalPlays}</b> 局` +
    (tot.provincesCleared > 0 ? ` · 已解锁 <b>${tot.provincesCleared}</b>/${PROVINCE_LIST.length} 省` : '') +
    (tot.perfectClears > 0 ? ` · <b>${tot.perfectClears}</b> 关零失误` : '') + `</div>`;

  // 最近一局
  if (tot.recent) {
    const r = tot.recent;
    const modeLabel = r.mode === 'challenge' ? '挑战' : '练习';
    const d = new Date(r.at);
    const date = `${d.getMonth() + 1}/${d.getDate()}`;
    html += `<div class="home-recent">最近一局 · <b>${r.levelTag}</b> ${modeLabel} ${formatTime(r.time)} · ${r.errors} 失误 · ${date}</div>`;
  }
  homeStats.innerHTML = html;
}
function buildHomeMap() {
  let html = `<path d="${CHINA.background}" fill="none" stroke="rgba(56,189,248,0.55)" stroke-width="1.8"/>`;
  for (const p of CHINA.provinces) {
    html += `<path d="${p.path}" fill="rgba(56,189,248,0.14)" stroke="rgba(56,189,248,0.60)" stroke-width="1"/>`;
  }
  homeMap.innerHTML = html;
}
function showHome() {
  stopTimer();
  audio.stopBGM();
  engine.reset();
  renderer.reset(mode);
  if (progressFill) progressFill.style.width = '0%';
  renderHomeLevels();
  if (isProvinceLevelId(selectedLevelId)) showProvinceGrid();
  else hideProvinceGrid();
  selectMode(selectedMode);
  refreshHomeSelection();
  renderHomeStats();
  homeScreen.classList.remove('hidden');
}

// 启动：先显示主页（关卡与模式选择移到「开始拼图」弹层内完成）
buildHomeMap();
renderHomeLevels();
selectMode(selectedMode);
refreshHomeSelection();
renderHomeStats();
homeScreen.classList.remove('hidden');

// ---- 开始弹层：地图 + 模式选择 ----
const startModal = document.getElementById('startModal');
const startConfirmBtn = document.getElementById('startConfirm');
const startCloseBtn = document.getElementById('startClose');

function openStartModal() {
  audio.ensure();
  audio.playClick();
  refreshHomeSelection(); // 同步已选态与「已选」提示
  startModal.classList.remove('hidden');
}
function closeStartModal() {
  audio.playClick();
  startModal.classList.add('hidden');
}
homeStartBtn.addEventListener('click', openStartModal);
startCloseBtn.addEventListener('click', closeStartModal);
startModal.addEventListener('click', (e) => {
  if (e.target === startModal) closeStartModal(); // 点背景关闭
});

startConfirmBtn.addEventListener('click', async () => {
  audio.ensure();
  audio.playClick();
  const label = startConfirmBtn.textContent;
  startConfirmBtn.disabled = true;
  startConfirmBtn.textContent = '加载中…';
  try {
    await startGame(selectedLevelId, selectedMode);
    startModal.classList.add('hidden');
    homeScreen.classList.add('hidden');
  } catch (err) {
    console.error('关卡加载失败', err);
    modals.toast('关卡加载失败，请重试');
  } finally {
    startConfirmBtn.disabled = false;
    startConfirmBtn.textContent = label;
  }
});
homeModeSeg.querySelectorAll('.mode-seg-btn').forEach((btn) => {
  btn.addEventListener('click', () => { audio.playClick(); selectMode(btn.dataset.mode); });
});
btnHome.addEventListener('click', () => { audio.playClick(); showHome(); });
homeHelpBtn.addEventListener('click', () => {
  audio.playClick();
  modals.showSettings({
    muted: audio.sfxMuted,
    bgm: audio.bgmMuted,
    suppress: settings.suppressCards,
    names: settings.showNames,
    mode: selectedMode,
    inGame: false,
  });
});

// 跨断点切换碎片区布局：仅当桌面/移动状态变化时重建托盘（避免频繁洗牌）
let __cmpDesktop = mqDesktop.matches;
window.addEventListener('resize', () => {
  const d = mqDesktop.matches;
  if (d !== __cmpDesktop) {
    __cmpDesktop = d;
    renderer.setGrid(d);
  }
});

// 暴露给调试
window.__cmp = { engine, renderer, view };
