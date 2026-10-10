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

/** 标题中文 2-gram：只看连续汉字，用于"词面相关"的弱信号（如 长江/水系、中国/高校） */
const titleGrams = (title: string): Set<string> => {
  const out = new Set<string>();
  const runs = title.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  for (const run of runs) {
    for (let k = 0; k + 2 <= run.length; k++) out.add(run.slice(k, k + 2));
  }
  return out;
};

/**
 * 国家 → 地理分区常识表（用于「同区域」相关性，如日本→韩国/蒙古国，德国→西班牙/英国）。
 * 匹配时对标题 + 标签做最长优先匹配；未命中的条目没有该维度（按 0 计）。
 */
const REGION_DICT: Record<string, string> = {
  东亚: '日本 韩国 朝鲜 蒙古国 蒙古',
  东南亚: '越南 泰国 缅甸 老挝 柬埔寨 印尼 菲律宾 马来西亚 新加坡',
  南亚: '印度 巴基斯坦 孟加拉国 尼泊尔 斯里兰卡',
  西亚: '沙特 伊朗 伊拉克 土耳其 以色列 阿联酋 卡塔尔',
  欧洲: '德国 西班牙 英国 法国 意大利 乌克兰 俄罗斯 波兰 荷兰 葡萄牙 希腊 瑞典 挪威',
  非洲: '埃及 南非 尼日利亚 肯尼亚 摩洛哥 埃塞俄比亚 坦桑尼亚',
  北美: '美国 加拿大 墨西哥',
  南美: '巴西 阿根廷 智利 秘鲁 哥伦比亚',
  大洋洲: '澳大利亚 新西兰',
  中国: '中国 我国 中华',
};
/** 次区域 → 大洲：同大洲但不同次区域（如 巴西↔加拿大、日本↔越南）也算半个相关 */
const REGION_GROUP: Record<string, string> = {
  东亚: '亚洲',
  东南亚: '亚洲',
  南亚: '亚洲',
  西亚: '亚洲',
  中国: '亚洲',
  欧洲: '欧洲',
  非洲: '非洲',
  北美: '美洲',
  南美: '美洲',
  大洋洲: '大洋洲',
};
const REGION_ENTRIES = Object.entries(REGION_DICT)
  .flatMap(([region, names]) => names.split(/\s+/).filter(Boolean).map((name) => ({ name, region })))
  .sort((a, b) => b.name.length - a.name.length); // 长名优先，避免「中国/国」类短名误命中

/** 推断条目所属的地理分区（东亚 / 欧洲 / 中国 …），推断不出返回 undefined */
const regionOf = (item: ContentItem): string | undefined => {
  // 先看标题（"美国行政区划地图"），标题定不了再看标签。
  // ⚠️ 不能拼在一起匹配：标签里的「哥伦比亚特区」会先命中「哥伦比亚」把美国误判成南美。
  for (const hay of [item.title, (item.tags || []).join(' ')]) {
    for (const e of REGION_ENTRIES) if (hay.includes(e.name)) return e.region;
  }
  return undefined;
};

/**
 * 同板块内（互动地图 / 地理小游戏 / 实验室 / 工具）的「相关推荐」排序。
 * 相关度 = 主题(topics) ×6 + 地理分区(同区域国家/同为中国) ×4 + 地域范围(scope) ×3
 *          + 标签(tags) ×2（过于通用的标签按语料频率剔除）+ 标题词面重合（≤3 分，同样按频率剔除）。
 * 分数相同时回退到 order，保证结果稳定可复现（SSG 构建期即定稿）。
 */
export const getRelatedInBoard = (item: ContentItem, pool: ContentItem[], limit = 4): ContentItem[] => {
  const others = pool.filter((i) => i.slug !== item.slug);
  if (others.length === 0) return [];
  const n = others.length;
  const topicsA = new Set(item.topics || []);
  const tagsA = new Set(item.tags || []);
  const gramsA = titleGrams(item.title);
  const regionA = regionOf(item);

  // 语料频率：出现面过广的标签/词（如「地理」「互动地图」「地图」）不构成"相关"证据
  const tagDf = new Map<string, number>();
  for (const i of others) for (const t of new Set(i.tags || [])) tagDf.set(t, (tagDf.get(t) || 0) + 1);
  const gramDf = new Map<string, number>();
  for (const i of others) for (const g of titleGrams(i.title)) gramDf.set(g, (gramDf.get(g) || 0) + 1);

  const scored = others.map((i) => {
    let score = 0;
    for (const t of new Set(i.topics || [])) if (topicsA.has(t)) score += 6;
    if (regionA) {
      const rb = regionOf(i);
      if (rb === regionA) score += 4;
      else if (rb && REGION_GROUP[rb] === REGION_GROUP[regionA]) score += 2;
    }
    if (item.scope && i.scope === item.scope) score += 3;
    for (const t of new Set(i.tags || [])) {
      if (!tagsA.has(t)) continue;
      if ((tagDf.get(t) || 0) / n > 0.6) continue; // 太通用，不算相关
      score += 2;
    }
    let gram = 0;
    for (const g of titleGrams(i.title)) {
      if (!gramsA.has(g)) continue;
      if ((gramDf.get(g) || 0) / n > 0.5) continue;
      gram += 1;
    }
    score += Math.min(gram, 3);
    return { i, score };
  });

  scored.sort((a, b) => b.score - a.score || a.i.order - b.i.order || a.i.slug.localeCompare(b.i.slug));
  return scored.slice(0, limit).map((x) => x.i);
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
    rows.push({
      label: '专题',
      value: item.category,
      // 只有知识库条目才有对应的专题筛选页
      ...(item.type === 'learn' ? { href: `/learn?category=${encodeURIComponent(item.category)}` } : {}),
    });
  }
  if (item.level) {
    rows.push({ label: '学段', value: item.level, href: `/learn?level=${encodeURIComponent(item.level)}` });
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
  learn: '地理知识库',
  resource: '资料下载',
};

/** 路由 base 映射 */
export const TYPE_BASE: Record<ContentType, string> = {
  work: 'works',
  tool: 'tools',
  article: 'articles',
  learn: 'learn',
  resource: 'downloads',
};
