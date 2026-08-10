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
  MAX_RECENT,
  getSnapshot,
  update,
} from '@/lib/learningStore';
import { getItem, type ContentType, type ContentItem } from '@/lib/content';

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
  return d.toISOString().slice(0, 10);
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

/** 打开内容时调用：记录首次开始时间、活跃日期、最近学习 */
export function recordStart(key: string): void {
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
  };
  recent: DashboardEntry[];
  favorites: DashboardEntry[];
  completed: DashboardEntry[];
  quizzes: QuizRecord[];
  games: GameRecord[];
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
  };
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
export type { LearningData, Achievement };
