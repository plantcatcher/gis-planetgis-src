// 知识层增强：在 content.ts 之上提供"地理学习站"所需要的知识密度能力——
// 阅读时长估算、跨类型全文搜索、按标签的交叉引用（参见）、信息盒数据、学科统计。
// 全部纯前端、零依赖，预渲染期即可直接计算并打进静态 HTML。

import type { ContentItem, ContentType } from './content';
import { getWorks, getTools, getArticles, getLearns, LEARN_SUBJECTS, SUBJECT_META } from './content';

/** 所有内容（跨作品/工具/文章/学习），供搜索与交叉引用使用 */
export const getAllItems = (): ContentItem[] => [
  ...getWorks(),
  ...getTools(),
  ...getArticles(),
  ...getLearns(),
];

/** 中文按 ~350 字/分钟估算阅读时长，最少 1 分钟 */
export const estimateReadingTime = (body: string, wpm = 350): number => {
  const chars = body.replace(/\s/g, '').length;
  return Math.max(1, Math.ceil(chars / wpm));
};

export const getReadingTime = (item: ContentItem): number => estimateReadingTime(item.body);

/** 正文字数（去空白） */
export const getWordCount = (item: ContentItem): number => item.body.replace(/\s/g, '').length;

export interface SearchHit {
  item: ContentItem;
  type: ContentType;
  score: number;
}

/**
 * 跨类型全文搜索：匹配标题 > 摘要 > 标签 > 正文，按相关度排序。
 * 用于列表页搜索框与首页全局搜索。
 */
export const searchAll = (query: string, pool?: ContentItem[]): SearchHit[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const list = pool ?? getAllItems();
  const hits: SearchHit[] = [];
  for (const item of list) {
    let score = 0;
    if (item.title.toLowerCase().includes(q)) score += 10;
    if (item.summary && item.summary.toLowerCase().includes(q)) score += 5;
    if ((item.tags || []).some((t) => t.toLowerCase().includes(q))) score += 3;
    if (item.body.toLowerCase().includes(q)) score += 1;
    if (score > 0) hits.push({ item, type: item.type, score });
  }
  return hits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.item.date || '').localeCompare(a.item.date || '');
  });
};

/**
 * 交叉引用（参见）：跨类型找与本文共享标签最多的条目，用于详情页"参见"侧栏。
 * 优先同标签数多的，其次按日期新到旧。
 */
export const getSeeAlso = (item: ContentItem, limit = 5): ContentItem[] => {
  const tags = item.tags || [];
  if (tags.length === 0) return [];
  return getAllItems()
    .filter((i) => i.slug !== item.slug && i.type === item.type)
    .map((i) => {
      const shared = (i.tags || []).filter((t) => tags.includes(t)).length;
      return { i, shared };
    })
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared || (b.i.date || '').localeCompare(a.i.date || ''))
    .slice(0, limit)
    .map((x) => x.i);
};

export interface InfoboxRow {
  label: string;
  value: string;
  href?: string;
}

/**
 * 信息盒（infobox）数据：把条目的结构化元信息整理成"标签—值"对，
 * 用于详情页右侧 Wikipedia 式事实面板。
 */
export const buildInfobox = (item: ContentItem): InfoboxRow[] => {
  const rows: InfoboxRow[] = [];
  if (item.subject) {
    rows.push({ label: '学科方向', value: item.subject, href: `/learn?subject=${encodeURIComponent(item.subject)}` });
  }
  if (item.category) {
    rows.push({ label: '学段', value: item.category });
  }
  if (item.date) {
    rows.push({ label: '发布时间', value: item.date });
  }
  rows.push({ label: '阅读时长', value: `${getReadingTime(item)} 分钟` });
  rows.push({ label: '篇幅', value: `${getWordCount(item)} 字` });
  if (item.tags && item.tags.length) {
    rows.push({
      label: '标签',
      value: item.tags.join('、'),
    });
  }
  return rows;
};

export interface SubjectStat {
  name: string;
  desc: string;
  icon: string;
  count: number;
  /** 该学科下出现最多的标签，作为"子主题"预览 */
  subtopics: string[];
}

/** 学科统计：供首页"知识地图"网格使用（计数 + 子主题预览） */
export const getSubjectStats = (): SubjectStat[] => {
  const learns = getLearns();
  return LEARN_SUBJECTS.map((name) => {
    const inSubject = learns.filter((i) => i.subject === name);
    const tagCount = new Map<string, number>();
    for (const i of inSubject) {
      for (const t of i.tags || []) tagCount.set(t, (tagCount.get(t) || 0) + 1);
    }
    const subtopics = Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([t]) => t);
    return {
      name,
      desc: SUBJECT_META[name]?.desc || '',
      icon: SUBJECT_META[name]?.icon || 'Globe',
      count: inSubject.length,
      subtopics,
    };
  });
};

/** 内容类型的中文名映射，供卡片/面包屑统一显示 */
export const TYPE_LABEL: Record<ContentType, string> = {
  work: '可视化作品',
  tool: '地理工具',
  article: '科普文章',
  learn: '地理学习',
};

/** 路由 base 映射 */
export const TYPE_BASE: Record<ContentType, string> = {
  work: 'works',
  tool: 'tools',
  article: 'articles',
  learn: 'learn',
};
