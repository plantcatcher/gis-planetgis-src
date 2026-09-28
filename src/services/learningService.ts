// =============================================================================
// Learning Service —— 学习数据层的「业务语义」实现（中间层）
// -----------------------------------------------------------------------------
// 这是 UI 唯一允许直接调用的学习数据入口。它把底层 Learning Store 的
// 原始读写，转换成「开始学习 / 更新进度 / 收藏 / 取仪表盘」等语义操作。
//
// 页面组件绝不直接碰 localStorage，一律通过这里。未来接 Supabase 时，
// 只需把 Learning Store 的持久化后端换成 Supabase，本层与所有 UI 都不用改。
// =============================================================================

import {
  type LearningData,
  type ReadingProgress,
  type RecentItem,
  type FavoriteItem,
  type QuizRecord,
  type GameRecord,
  type Achievement,
  type DownloadRecord,
  MAX_RECENT,
  MAX_DOWNLOAD_RECORDS,
  getSnapshot,
  update,
} from '@/lib/learningStore';
import { getItem, getLearns, type ContentType, type ContentItem } from '@/lib/content';
import { trackEvent } from '@/lib/analytics';

/** 阅读进度达到该比例即标记为「已完成」 */
export const COMPLETE_THRESHOLD = 0.9;

const VALID_TYPES: ContentType[] = ['work', 'tool', 'article', 'learn'];

// -----------------------------------------------------------------------------
// 内容键（contentId）：站点内每篇内容的全局唯一标识
//   形如 `learn:earth-is-round`、`article:what-is-gis`
// 仅用键即可通过内容层解析出标题/封面/链接，因此收藏/进度只存键，不存正文。
// -----------------------------------------------------------------------------

export function buildContentKey(type: ContentType, slug: string): string {
  return `${type}:${slug}`;
}

export function parseContentKey(
  key: string,
): { type: ContentType; slug: string } | null {
  const idx = key.indexOf(':');
  if (idx <= 0) return null;
  const type = key.slice(0, idx) as ContentType;
  const slug = key.slice(idx + 1);
  if (!VALID_TYPES.includes(type) || !slug) return null;
  return { type, slug };
}

/** 通过内容键解析出内容元数据（标题/封面/类型/路径），找不到返回 undefined */
export function resolveItem(key: string): ContentItem | undefined {
  const parsed = parseContentKey(key);
  if (!parsed) return undefined;
  return getItem(parsed.type, parsed.slug);
}

/** 内容详情页的跳转路径，如 /learn/earth-is-round */
export function keyToPath(key: string): string | null {
  const parsed = parseContentKey(key);
  if (!parsed) return null;
  return `/${parsed.type === 'learn' ? 'learn' : parsed.type === 'article' ? 'articles' : parsed.type === 'work' ? 'works' : 'tools'}/${parsed.slug}`;
}

// -----------------------------------------------------------------------------
// 工具函数
// -----------------------------------------------------------------------------

function todayStr(d = new Date()): string {
  // 用本地日期（非 UTC），否则中国用户（UTC+8）在本地午夜附近会因 UTC 日界
  // 偏移导致「连续学习天数」少算/多算一天。
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addActiveDate(activeDates: string[], date = todayStr()): string[] {
  return activeDates.includes(date) ? activeDates : [...activeDates, date];
}

/** 计算「连续学习天数」：从最近一个活跃日向前数连续的天数 */
export function computeStreak(activeDates: string[]): number {
  if (activeDates.length === 0) return 0;
  const set = new Set(activeDates);
  // 以「今天」或「昨天」为起点（若今天还没学，昨天学了也算连续中）。
  const now = new Date();
  let cursor = new Date(now);
  if (!set.has(todayStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(todayStr(cursor))) return 0;
  }
  let streak = 0;
  while (set.has(todayStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// -----------------------------------------------------------------------------
// 写操作：开始学习 / 更新进度 / 收藏
// -----------------------------------------------------------------------------

// ── 激活事件（增长黑客：Activation 环节） ───────────────────────────────────
// 用户第一次完成核心动作（读 / 收藏 / 下载 / 玩游戏）时记一次 activate，
// 配合 GA4 匿名用户级留存，可算「激活用户留存」与激活率。
function isFirstAction(): boolean {
  const d = getSnapshot();
  return (
    Object.keys(d.learning.readingProgress).length === 0 &&
    d.learning.favorites.length === 0 &&
    d.quizzes.records.length === 0 &&
    d.games.records.length === 0 &&
    d.downloads.records.length === 0
  );
}

function fireActivateIfFirst(actionType: string): void {
  if (isFirstAction()) {
    trackEvent('activate', { action_type: actionType });
  }
}

/** 打开内容时调用：记录首次开始时间、活跃日期、最近学习 */
export function recordStart(key: string): void {
  fireActivateIfFirst('read');
  const now = new Date().toISOString();
  update((data) => ({
    ...data,
    profile: {
      ...data.profile,
      lastActiveAt: now,
      activeDates: addActiveDate(data.profile.activeDates),
    },
    learning: {
      ...data.learning,
      readingProgress: {
        ...data.learning.readingProgress,
        [key]:
          data.learning.readingProgress[key] ??
          ({
            progress: 0,
            lastPosition: 0,
            startedAt: now,
            updatedAt: now,
            completed: false,
            completedAt: null,
            readSeconds: 0,
          } as ReadingProgress),
      },
      recentlyViewed: touchRecent(data.learning.recentlyViewed, key, now),
    },
  }));
}

/** 更新阅读进度（由详情页滚动监听节流调用） */
export function setProgress(
  key: string,
  opts: { progress: number; lastPosition: number; deltaSeconds?: number },
): void {
  const now = new Date().toISOString();
  const progress = Math.max(0, Math.min(1, opts.progress));
  update((data) => {
    const prev = data.learning.readingProgress[key];
    const wasCompleted = prev?.completed ?? false;
    const isCompleted = progress >= COMPLETE_THRESHOLD;
    const nextProgress: ReadingProgress = {
      progress,
      lastPosition: opts.lastPosition,
      startedAt: prev?.startedAt ?? now,
      updatedAt: now,
      completed: isCompleted || wasCompleted,
      completedAt:
        isCompleted || wasCompleted
          ? prev?.completedAt ?? now
          : null,
      readSeconds: (prev?.readSeconds ?? 0) + (opts.deltaSeconds ?? 0),
    };
    const readingProgress = { ...data.learning.readingProgress, [key]: nextProgress };
    return {
      ...data,
      profile: {
        ...data.profile,
        lastActiveAt: now,
        activeDates: addActiveDate(data.profile.activeDates),
      },
      learning: {
        ...data.learning,
        readingProgress,
        // 与 readingProgress.completed 保持同步
        completedArticles: Object.keys(readingProgress).filter(
          (k) => readingProgress[k].completed,
        ),
        recentlyViewed: touchRecent(data.learning.recentlyViewed, key, now),
      },
    };
  });
}

/** 切换收藏状态，返回切换后的「是否已收藏」 */
export function toggleFavorite(key: string): boolean {
  fireActivateIfFirst('favorite');
  const now = new Date().toISOString();
  let isFav = false;
  update((data) => {
    const exists = data.learning.favorites.some((f) => f.contentId === key);
    isFav = !exists;
    const favorites: FavoriteItem[] = exists
      ? data.learning.favorites.filter((f) => f.contentId !== key)
      : [...data.learning.favorites, { contentId: key, createdAt: now }];
    // 收藏/取消也视为一次活跃（更新连续学习统计）
    return {
      ...data,
      profile: {
        ...data.profile,
        lastActiveAt: now,
        activeDates: addActiveDate(data.profile.activeDates),
      },
      learning: { ...data.learning, favorites },
    };
  });
  return isFav;
}

// -----------------------------------------------------------------------------
// 读操作（供 UI / 仪表盘使用）
// -----------------------------------------------------------------------------

export function getProgress(key: string): ReadingProgress | null {
  return getSnapshot().learning.readingProgress[key] ?? null;
}

export function isFavorite(key: string): boolean {
  return getSnapshot().learning.favorites.some((f) => f.contentId === key);
}

export function getFavorites(): FavoriteItem[] {
  return getSnapshot().learning.favorites;
}

export function getRecent(): RecentItem[] {
  return getSnapshot().learning.recentlyViewed;
}

// -----------------------------------------------------------------------------
// 资料下载记录：用户点击下载资料时调用，记录「下载了什么」
// 同 slug 仅保留一条，更新最近下载时间；便于「我的学习」展示下载足迹。
// -----------------------------------------------------------------------------

export function recordDownload(rec: {
  slug: string;
  title: string;
  format?: string;
  size?: string;
  category?: string;
}): void {
  fireActivateIfFirst('download');
  const now = new Date().toISOString();
  update((data) => {
    const recs = data.downloads.records;
    const idx = recs.findIndex((r) => r.slug === rec.slug);
    let nextRecs: DownloadRecord[];
    if (idx >= 0) {
      nextRecs = [...recs];
      nextRecs[idx] = { ...nextRecs[idx], ...rec, downloadedAt: now };
    } else {
      nextRecs = [{ ...rec, downloadedAt: now }, ...recs].slice(0, MAX_DOWNLOAD_RECORDS);
    }
    return { ...data, downloads: { records: nextRecs } };
  });
}

function touchRecent(list: RecentItem[], key: string, now: string): RecentItem[] {
  const filtered = list.filter((r) => r.contentId !== key);
  return [{ contentId: key, viewedAt: now }, ...filtered].slice(0, MAX_RECENT);
}

// -----------------------------------------------------------------------------
// 仪表盘聚合（/my 学习中心页使用）
// -----------------------------------------------------------------------------

export interface DashboardEntry {
  key: string;
  item: ContentItem;
  progress: ReadingProgress | null;
}

export interface Dashboard {
  summary: {
    learnedCount: number;
    favoriteCount: number;
    streak: number;
    lastQuizScore: number | null;
    totalReadSeconds: number;
    downloadCount: number;
  };
  recent: DashboardEntry[];
  favorites: DashboardEntry[];
  completed: DashboardEntry[];
  quizzes: QuizRecord[];
  games: GameRecord[];
  downloads: DownloadRecord[];
}

/** 统一活动流条目（读 / 玩 / 测 / 下），用于「最近动态」合并足迹 */
export interface ActivityFeedEntry {
  id: string;
  kind: 'read' | 'game' | 'quiz' | 'download';
  title: string;
  subtitle: string;
  path: string | null;
  at: string;
}

function toEntries(keys: string[]): DashboardEntry[] {
  const out: DashboardEntry[] = [];
  for (const key of keys) {
    const item = resolveItem(key);
    if (!item) continue; // 内容可能被删除，跳过无效键
    out.push({ key, item, progress: getProgress(key) });
  }
  return out;
}

/** 聚合所有本地学习数据，供学习中心页一次性渲染 */
export function getDashboard(): Dashboard {
  const data = getSnapshot();
  const { readingProgress, recentlyViewed, favorites } = data.learning;

  const recent = toEntries(recentlyViewed.map((r) => r.contentId));
  const favEntries = toEntries(favorites.map((f) => f.contentId));
  const completedKeys = Object.keys(readingProgress).filter(
    (k) => readingProgress[k].completed,
  );
  const completed = toEntries(completedKeys);

  const lastQuiz =
    data.quizzes.records.length > 0
      ? data.quizzes.records[data.quizzes.records.length - 1].score
      : null;

  const totalReadSeconds = Object.values(readingProgress).reduce(
    (sum, p) => sum + (p.readSeconds ?? 0),
    0,
  );

  return {
    summary: {
      learnedCount: Object.keys(readingProgress).length,
      favoriteCount: favorites.length,
      streak: computeStreak(data.profile.activeDates),
      lastQuizScore: lastQuiz,
      totalReadSeconds,
      downloadCount: data.downloads.records.length,
    },
    recent,
    favorites: favEntries,
    completed,
    quizzes: [...data.quizzes.records].sort(
      (a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime(),
    ),
    games: [...data.games.records].sort(
      (a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime(),
    ),
    downloads: [...data.downloads.records].sort(
      (a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime(),
    ),
  };
}

// -----------------------------------------------------------------------------
// 统一活动流（/my「最近动态」用）：把分散的阅读/游戏/测验/下载记录，
// 按时间倒序合并成一条足迹，解决「玩游戏/做测验不进最近学习」的残缺问题。
// -----------------------------------------------------------------------------

function quizAccuracy(q: QuizRecord): number {
  return q.total > 0 ? Math.round((q.score / q.total) * 100) : 0;
}

/** 聚合最近活动（默认取最近 12 条），供学习中心「最近动态」渲染 */
export function getActivityFeed(limit = 12): ActivityFeedEntry[] {
  const data = getSnapshot();
  const items: ActivityFeedEntry[] = [];

  for (const r of data.learning.recentlyViewed) {
    const item = resolveItem(r.contentId);
    if (!item) continue;
    const p = getProgress(r.contentId);
    const pct = p ? Math.round((p.progress ?? 0) * 100) : 0;
    const completed = p?.completed ?? false;
    items.push({
      id: `read:${r.contentId}`,
      kind: 'read',
      title: item.title,
      subtitle: completed ? '已读完' : pct > 0 ? `读到 ${pct}%` : '开始阅读',
      path: keyToPath(r.contentId),
      at: r.viewedAt,
    });
  }

  for (const g of data.games.records) {
    items.push({
      id: `game:${g.id}`,
      kind: 'game',
      title: g.title || GAME_NAMES_FALLBACK[g.gameId] || '地理小游戏',
      subtitle:
        g.score != null && g.total
          ? `得分 ${g.score}/${g.total}`
          : g.subtitle || '已完成一局',
      path: GAME_PATHS_FALLBACK[g.gameId] || '/games',
      at: g.takenAt,
    });
  }

  for (const q of data.quizzes.records) {
    items.push({
      id: `quiz:${q.id}`,
      kind: 'quiz',
      title: q.title,
      subtitle: `测验 ${q.score}/${q.total}（正确率 ${quizAccuracy(q)}%）`,
      path: null,
      at: q.takenAt,
    });
  }

  for (const d of data.downloads.records) {
    items.push({
      id: `dl:${d.slug}`,
      kind: 'download',
      title: d.title,
      subtitle: ['下载', d.format, d.category].filter(Boolean).join(' · '),
      path: `/downloads/${d.slug}`,
      at: d.downloadedAt,
    });
  }

  return items
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit);
}

// 游戏路径/名称兜底（learningService 不依赖 UI 层的 GAME_* 常量，避免循环依赖）
const GAME_PATHS_FALLBACK: Record<string, string> = {
  geoquiz: '/geoquiz',
  geoshape: '/geoshape',
  geotype: '/geotype',
  chinapuzzle: '/chinapuzzle',
};
const GAME_NAMES_FALLBACK: Record<string, string> = {
  geoquiz: '卫星之眼 · 猜城市',
  geoshape: 'GeoShape · 猜国家',
  geotype: '地理人格测试',
  chinapuzzle: '中国地图拼图挑战',
};

// -----------------------------------------------------------------------------
// 续读 / 推荐（/my 增长留存用）
// -----------------------------------------------------------------------------

/** 取「未完成且进度最高」的内容，作为「继续学习」主卡 */
export function getContinueEntry(): DashboardEntry | null {
  const data = getSnapshot();
  const entries = toEntries(Object.keys(data.learning.readingProgress));
  const unfinished = entries.filter((e) => !(e.progress?.completed ?? false));
  if (unfinished.length === 0) return null;
  unfinished.sort((a, b) => (b.progress?.progress ?? 0) - (a.progress?.progress ?? 0));
  return unfinished[0];
}

/** 个性化推荐：未读且未收藏的教程，优先同分类（与续读项一致） */
export function getRecommendations(limit = 3): ContentItem[] {
  const data = getSnapshot();
  const started = new Set(Object.keys(data.learning.readingProgress));
  const favs = new Set(data.learning.favorites.map((f) => f.contentId));
  const unread = getLearns().filter(
    (it) => !started.has(`learn:${it.slug}`) && !favs.has(`learn:${it.slug}`),
  );
  const cont = getContinueEntry();
  if (cont?.item.category) {
    const same = unread.filter((it) => it.category === cont.item.category);
    if (same.length > 0) return same.slice(0, limit);
  }
  return unread.slice(0, limit);
}

// -----------------------------------------------------------------------------
// 数据洞察（/my「数据洞察」用）：基于本地数据生成个性化分析与建议
// -----------------------------------------------------------------------------

export interface InsightItem {
  tone: 'positive' | 'info' | 'warn';
  text: string;
}

function fmtDuration(sec: number): string {
  if (sec <= 0) return '0 分钟';
  if (sec < 3600) return `${Math.max(1, Math.round(sec / 60))} 分钟`;
  return `${(sec / 3600).toFixed(1)} 小时`;
}

export function buildInsights(dash: Dashboard): InsightItem[] {
  const out: InsightItem[] = [];
  const { summary } = dash;

  if (summary.streak > 0) {
    const next = summary.streak + 1;
    out.push({
      tone: summary.streak >= 7 ? 'positive' : 'info',
      text:
        summary.streak >= 7
          ? `已连续学习 ${summary.streak} 天，习惯稳了！再保持就能冲更长的连击。`
          : `已连续学习 ${summary.streak} 天，明天再学一次就能到 ${next} 天，别断。`,
    });
  }

  // 测验正确率
  if (dash.quizzes.length > 0) {
    const acc =
      dash.quizzes.reduce((s, q) => s + quizAccuracy(q), 0) / dash.quizzes.length;
    out.push({
      tone: acc >= 75 ? 'positive' : acc >= 50 ? 'info' : 'warn',
      text: `地理测验平均正确率 ${Math.round(acc)}%（${dash.quizzes.length} 次），${
        acc >= 75 ? '基础扎实，可挑战更难的专题。' : '建议回头重读错题对应的知识点。'
      }`,
    });
  }

  // 游戏战绩
  const scoredGames = dash.games.filter((g) => g.score != null && g.total);
  if (scoredGames.length > 0) {
    const gacc =
      scoredGames.reduce((s, g) => s + ((g.score as number) / (g.total as number)) * 100, 0) /
      scoredGames.length;
    out.push({
      tone: 'info',
      text: `地理小游戏平均得分率 ${Math.round(gacc)}%，玩得越多，世界地图越熟。`,
    });
  }

  // 学习量 / 完成度
  if (summary.learnedCount > 0) {
    const done = dash.completed.length;
    out.push({
      tone: done > 0 ? 'positive' : 'info',
      text: `累计学习 ${summary.learnedCount} 篇、完成 ${done} 篇，收藏 ${summary.favoriteCount} 篇；总计阅读约 ${fmtDuration(
        summary.totalReadSeconds,
      )}。`,
    });
  }

  // 下载活跃度
  if (summary.downloadCount > 0) {
    out.push({
      tone: 'info',
      text: `已下载 ${summary.downloadCount} 份资料，记得用到作业或项目里，资料才真正属于你。`,
    });
  }

  // 节奏建议
  if (summary.learnedCount > 0 && summary.streak < 3) {
    out.push({
      tone: 'warn',
      text: '学习节奏还不稳定：建议每周固定 3 天、每次读 1 篇，连学 3 天即可解锁稳定习惯。',
    });
  }

  return out;
}

// -----------------------------------------------------------------------------
// 图表数据（/my「数据洞察」用）：纯数据，颜色等样式由 UI 层决定
// -----------------------------------------------------------------------------

/** 近 weeks 周「每周活跃天数」序列（周一为周起始，本地日期） */
export function getWeeklyActivity(weeks = 8): { label: string; value: number }[] {
  const dates = new Set(getSnapshot().profile.activeDates);
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // 0=周一
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow);
  const out: { label: string; value: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const wkStart = new Date(monday);
    wkStart.setDate(monday.getDate() - i * 7);
    const wkEnd = new Date(wkStart);
    wkEnd.setDate(wkStart.getDate() + 6);
    let cnt = 0;
    const cur = new Date(wkStart);
    while (cur <= wkEnd) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const d = String(cur.getDate()).padStart(2, '0');
      if (dates.has(`${y}-${m}-${d}`)) cnt++;
      cur.setDate(cur.getDate() + 1);
    }
    const lblM = String(wkStart.getMonth() + 1).padStart(2, '0');
    const lblD = String(wkStart.getDate()).padStart(2, '0');
    out.push({ label: `${lblM}/${lblD}`, value: cnt });
  }
  return out;
}

// -----------------------------------------------------------------------------
// 周目标 / 连学里程碑（增长激励小部件的数据源）
// -----------------------------------------------------------------------------

const WEEKLY_GOAL_KEY = 'planetgis:weekly_goal';
export const WEEKLY_GOAL_DEFAULT = 4;
/** 周目标可选档位（本地持久化，用户可在页面上调整） */
export const WEEKLY_GOAL_OPTIONS = [3, 4, 5, 7];

/** 读取周目标（默认 4 天/周；localStorage 不可用时回退默认值，SSG 安全） */
export function getWeeklyGoal(): number {
  try {
    const v = window.localStorage.getItem(WEEKLY_GOAL_KEY);
    const n = v ? parseInt(v, 10) : WEEKLY_GOAL_DEFAULT;
    return WEEKLY_GOAL_OPTIONS.includes(n) ? n : WEEKLY_GOAL_DEFAULT;
  } catch {
    return WEEKLY_GOAL_DEFAULT;
  }
}

/** 写入周目标 */
export function setWeeklyGoal(n: number): void {
  try {
    window.localStorage.setItem(WEEKLY_GOAL_KEY, String(n));
  } catch {
    /* localStorage 不可用则跳过 */
  }
}

/** 本周学习进度：done=本周已学天数，goal=目标，daysLeft=到周日剩余天数（含今天） */
export function getWeekProgress(goal = getWeeklyGoal()): {
  done: number;
  goal: number;
  pct: number;
  daysLeft: number;
  onTrack: boolean;
} {
  const dates = new Set(getSnapshot().profile.activeDates);
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // 0=周一
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow);
  let done = 0;
  const cur = new Date(monday);
  for (let i = 0; i < 7; i++) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    if (dates.has(`${y}-${m}-${d}`)) done++;
    cur.setDate(cur.getDate() + 1);
  }
  const daysLeft = 7 - dow; // 今天到本周日剩余天数（含今天）
  const need = Math.max(0, goal - done);
  return {
    done,
    goal,
    pct: Math.min(100, Math.round((done / goal) * 100)),
    daysLeft,
    onTrack: need <= daysLeft,
  };
}

export interface StreakMilestone {
  days: number;
  label: string;
  reached: boolean;
  isNext: boolean;
}

/** 连学里程碑：7/30/100/365，标记已达成与「下一个」目标 */
export function getStreakMilestones(streak: number): StreakMilestone[] {
  const defs = [
    { days: 7, label: '一周' },
    { days: 30, label: '一个月' },
    { days: 100, label: '百天' },
    { days: 365, label: '一整年' },
  ];
  let nextMarked = false;
  return defs.map((d) => {
    const reached = streak >= d.days;
    let isNext = false;
    if (!reached && !nextMarked) {
      isNext = true;
      nextMarked = true;
    }
    return { ...d, reached, isNext };
  });
}

// -----------------------------------------------------------------------------
// 预留：未来 Supabase 迁移接口（当前仅声明，不实现）
// 迁移时由 Store 层统一切换后端，Service / UI 保持不变。
// -----------------------------------------------------------------------------

export type LearningBackend = 'local' | 'supabase';

export function getBackend(): LearningBackend {
  return 'local';
}

// 断言类型再导出，方便 UI 用类型
export type { LearningData, Achievement, DownloadRecord };
