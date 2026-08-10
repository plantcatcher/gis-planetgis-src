// =============================================================================
// Learning Store —— 本地学习数据层的「存储」实现（最底层）
// -----------------------------------------------------------------------------
// 设计原则（见需求文档「九、非常重要」）：
//   UI ──> Learning Service ──> Learning Store ──> LocalStorage
//   未来：UI ──> Learning Service ──> Learning Store ──> Supabase
//
// 本文件只负责「把数据读出来 / 写进去」与订阅通知，不关心业务语义，
// 也不依赖 React。业务语义（开始学习、标记完成、收藏……）全部在
// src/services/learningService.ts 里，页面组件只允许调用 Service 层。
//
// 这样未来切到 Supabase 时，只需替换本文件的持久化后端，
// Service 层与所有 UI 组件都不用动。
// =============================================================================

export interface ReadingProgress {
  /** 阅读进度 0~1 */
  progress: number;
  /** 最后的阅读位置（滚动像素或字符偏移，用于在详情页续读） */
  lastPosition: number;
  /** 首次开始学习的时间戳（ISO 字符串） */
  startedAt: string;
  /** 最近一次更新的时间戳（ISO 字符串） */
  updatedAt: string;
  /** 是否已达完成阈值 */
  completed: boolean;
  /** 标记完成的时间戳（ISO 字符串，未完成为 null） */
  completedAt: string | null;
  /** 累计阅读时长（秒），由详情页追踪器节流累加 */
  readSeconds?: number;
}

export interface RecentItem {
  /** 内容唯一键，形如 `learn:earth-is-round` */
  contentId: string;
  /** 最近一次访问时间戳 */
  viewedAt: string;
}

export interface FavoriteItem {
  /** 内容唯一键 */
  contentId: string;
  /** 收藏时间戳 */
  createdAt: string;
}

export interface QuizRecord {
  id: string;
  title: string;
  score: number;
  total: number;
  takenAt: string;
}

export interface GameRecord {
  id: string;
  title: string;
  score: number;
  takenAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  unlockedAt: string;
}

export interface LearningData {
  version: number;
  profile: {
    createdAt: string;
    lastActiveAt: string;
    /** 活跃日期集合（'YYYY-MM-DD'），用于计算连续学习天数 */
    activeDates: string[];
  };
  learning: {
    /** contentId -> 阅读进度 */
    readingProgress: Record<string, ReadingProgress>;
    /** 已完成的内容键（与 readingProgress.completed 保持同步，便于迁移） */
    completedArticles: string[];
    /** 最近学习，按时间倒序，仅保留最近若干条 */
    recentlyViewed: RecentItem[];
    /** 收藏 */
    favorites: FavoriteItem[];
  };
  quizzes: { records: QuizRecord[] };
  games: { records: GameRecord[] };
  achievements: Achievement[];
}

const STORAGE_KEY = 'planetgis:learning:v1';
const SCHEMA_VERSION = 1;

/** 最近学习保留条数 */
export const MAX_RECENT = 12;

function createEmptyData(): LearningData {
  const now = new Date().toISOString();
  return {
    version: SCHEMA_VERSION,
    profile: {
      createdAt: now,
      lastActiveAt: now,
      activeDates: [],
    },
    learning: {
      readingProgress: {},
      completedArticles: [],
      recentlyViewed: [],
      favorites: [],
    },
    quizzes: { records: [] },
    games: { records: [] },
    achievements: [],
  };
}

// 内存缓存：保证 getSnapshot 在「数据未变」时返回同一引用，
// 这是 useSyncExternalStore 正确工作的前提（否则会无限重渲染）。
let cache: LearningData | null = null;

// 订阅者集合：store 数据变化时逐个通知，触发 React 重渲染。
const listeners = new Set<() => void>();

/** 判断当前是否处于可访问 localStorage 的环境（浏览器、且非 SSR/预渲染） */
function hasStorage(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

/** 读取原始数据（浏览器：localStorage；服务端：返回默认空数据且不写入缓存） */
function readRaw(): LearningData {
  if (!hasStorage()) return createEmptyData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyData();
    const parsed = JSON.parse(raw) as Partial<LearningData>;
    // 与默认结构做浅合并，兼容旧版本 / 字段缺失。
    return mergeWithDefault(parsed);
  } catch {
    return createEmptyData();
  }
}

/** 把任意（可能不完整）的对象补齐为完整 LearningData */
function mergeWithDefault(partial: Partial<LearningData>): LearningData {
  const empty = createEmptyData();
  return {
    version: SCHEMA_VERSION,
    profile: { ...empty.profile, ...(partial.profile || {}) },
    learning: {
      readingProgress: partial.learning?.readingProgress || {},
      completedArticles: partial.learning?.completedArticles || [],
      recentlyViewed: partial.learning?.recentlyViewed || [],
      favorites: partial.learning?.favorites || [],
    },
    quizzes: { records: partial.quizzes?.records || [] },
    games: { records: partial.games?.records || [] },
    achievements: partial.achievements || [],
  };
}

/** 写回持久层并通知订阅者 */
function writeRaw(data: LearningData): void {
  cache = data;
  if (hasStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // 配额满 / 隐私模式禁用等：静默失败，内存态仍可用。
    }
  }
  listeners.forEach((fn) => fn());
}

// -----------------------------------------------------------------------------
// 对外导出（供 Service 层调用）
// -----------------------------------------------------------------------------

/** 客户端取数：带缓存；首次调用从 localStorage 加载 */
export function getSnapshot(): LearningData {
  if (cache) return cache;
  cache = readRaw();
  return cache;
}

// 服务端快照：模块级固定常量，保证每次返回同一引用（useSyncExternalStore 要求）。
const SERVER_EMPTY: LearningData = createEmptyData();

/** 服务端取数：永远返回稳定的默认空数据，避免 hydration mismatch */
export function getServerSnapshot(): LearningData {
  return SERVER_EMPTY;
}

/** 订阅 store 变化，返回取消订阅函数 */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * 在现有数据上应用一次「变更函数」并持久化。
 * Service 层的所有写操作都通过它完成，保证缓存/持久化/通知三件事原子发生。
 */
export function update(mutator: (data: LearningData) => LearningData): LearningData {
  const next = mutator(getSnapshot());
  writeRaw(next);
  return next;
}

/** 仅供调试/迁移：清空全部本地学习数据 */
export function clearAll(): void {
  writeRaw(createEmptyData());
}
