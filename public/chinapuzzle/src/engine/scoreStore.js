// 成绩系统：localStorage 本地保存（MVP 阶段无需登录）。
// 保存：最佳完成时间、最少错误次数、完成次数、历史记录。
const KEY = 'cmp_scores_v1';

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function saveAll(all) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* 隐私模式或容量不足时静默失败 */
  }
}

export function getLevelScore(levelId) {
  const all = loadAll();
  return (
    all[levelId] || {
      bestTime: null,
      minErrors: null,
      plays: 0,
      history: [],
    }
  );
}

// 仅挑战模式计入最佳成绩
export function recordResult(levelId, { mode, time, errors }) {
  const all = loadAll();
  const s = all[levelId] || {
    bestTime: null,
    minErrors: null,
    plays: 0,
    history: [],
  };
  s.plays += 1;
  if (mode === 'challenge') {
    if (s.bestTime == null || time < s.bestTime) s.bestTime = time;
    if (s.minErrors == null || errors < s.minErrors) s.minErrors = errors;
  }
  s.history = [{ mode, time, errors, at: Date.now() }, ...(s.history || [])].slice(0, 20);
  all[levelId] = s;
  saveAll(all);
  return s;
}

export function getRecent(levelId, n = 5) {
  const all = loadAll();
  const s = all[levelId];
  if (!s || !s.history) return [];
  return s.history.slice(0, n);
}

export function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// 返回全部关卡成绩（用于首页跨关卡汇总）
export function getAllScores() {
  return loadAll();
}

// 累计统计：跨所有关卡的全局数据
// levels 元素支持 { id, pieces } 或 { id, regions:[] } 两种形态；
// kind === 'province' 的关卡会额外计入「已解锁省份数」。
export function getTotals(levels) {
  const all = loadAll();
  let totalPlays = 0;
  let totalPieces = 0; // 累计拼过的区块数 = 每关(通关次数 × 该关区块数)
  let perfectClears = 0; // 零失误通关的关卡数
  let clearedLevels = 0; // 玩过并完成过的关卡数
  let provincesCleared = 0; // 玩过的省份地市关卡数
  let recent = null;
  for (const l of levels) {
    const s = all[l.id];
    if (!s || !s.plays) continue;
    const pieces = l.pieces != null ? l.pieces : (l.regions ? l.regions.length : 0);
    totalPlays += s.plays;
    totalPieces += s.plays * pieces;
    clearedLevels += 1;
    if (l.kind === 'province') provincesCleared += 1;
    if (s.minErrors === 0) perfectClears += 1;
    if (s.history && s.history[0]) {
      if (!recent || s.history[0].at > recent.at) {
        recent = { ...s.history[0], levelTitle: l.title, levelTag: l.tag };
      }
    }
  }
  return { totalPlays, totalPieces, perfectClears, clearedLevels, provincesCleared, recent };
}
