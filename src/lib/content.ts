// 内容加载层：在编译期通过 import.meta.glob 把所有 Markdown 打进 bundle。
// 每个内容文件由 frontmatter（卡片元数据）+ 正文（详情页内容）组成。
// 无需后端、无需额外依赖，纯前端 + 构建期即可驱动全站。

export type ContentType = 'work' | 'tool' | 'article' | 'learn';

export interface ContentItem {
  slug: string;
  type: ContentType;
  title: string;
  cover?: string;
  summary?: string;
  link?: string;
  order: number;
  date?: string;
  category?: string;
  subject?: string;
  tags?: string[];
  body: string;
}

interface Frontmatter {
  [key: string]: string;
}

const rawFiles = import.meta.glob('../../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(raw: string): { data: Frontmatter; content: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, content: raw };
  const data: Frontmatter = {};
  for (const line of m[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    val = val.replace(/^["']|["']$/g, '');
    if (val) data[key] = val;
  }
  return { data, content: raw.slice(m[0].length) };
}

const items: ContentItem[] = [];

for (const [path, raw] of Object.entries(rawFiles)) {
  // changelog.md 是更新日志专用文件，由 getChangelog 单独处理，不要当成文章。
  if (path.endsWith('/changelog.md')) continue;
  const { data, content } = parseFrontmatter(raw);
  const seg = path.split('/');
  const folder = seg[seg.length - 2]; // works | tools | articles
  const filename = seg[seg.length - 1].replace(/\.md$/, '');
  const type: ContentType =
    folder === 'works' ? 'work' : folder === 'tools' ? 'tool' : folder === 'learn' ? 'learn' : 'article';
  items.push({
    slug: data.slug || filename,
    type,
    title: data.title || filename,
    cover: data.cover,
    summary: data.summary,
    link: data.link,
    order: data.order ? Number(data.order) : 999,
    date: data.date,
    category: data.category,
    subject: data.subject,
    tags: data.tags ? data.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
    body: content.trim(),
  });
}

export const getWorks = (): ContentItem[] =>
  items
    .filter((i) => i.type === 'work')
    .sort((a, b) => a.order - b.order);

export const getTools = (): ContentItem[] =>
  items
    .filter((i) => i.type === 'tool')
    .sort((a, b) => a.order - b.order);

export const getArticles = (): ContentItem[] =>
  items
    .filter((i) => i.type === 'article')
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

export const getLearns = (): ContentItem[] =>
  items
    .filter((i) => i.type === 'learn')
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

// 地理学习板块的学段（难度）分类，按固定顺序返回，便于列表页生成筛选 tabs。
const LEARN_LEVEL_ORDER = ['初中地理', '高中地理', '大学地理', '通识地理'];
export const getLearnCategories = (): string[] => {
  const cats = Array.from(
    new Set(
      items
        .filter((i) => i.type === 'learn')
        .map((i) => i.category)
        .filter(Boolean) as string[],
    ),
  );
  return cats.sort((a, b) => {
    const ia = LEARN_LEVEL_ORDER.indexOf(a);
    const ib = LEARN_LEVEL_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
};

// 地理学习板块的学科方向（与学段 category 正交）。
// 沿用《中国大百科全书（第三版）·地理学》四大板块：自然地理学 / 人文地理学 /
// 区域地理学 / 地理信息科学——也是中小学到高考地理的通用分法，对自助学习受众最友好。
export const LEARN_SUBJECTS = ['自然地理', '人文地理', '区域地理', '地理信息技术'] as const;
export const SUBJECT_META: Record<string, { desc: string; icon: string }> = {
  自然地理: { desc: '地貌、气候、水文、土壤、植被——地球自然面貌的成因与规律', icon: 'Mountain' },
  人文地理: { desc: '人口、城市、农业、工业、交通、文化——人类活动与地理空间', icon: 'Users' },
  区域地理: { desc: '中国地理、世界地理、乡土地理——不同区域的特征与联系', icon: 'Map' },
  地理信息技术: { desc: 'GIS、遥感 RS、卫星定位——用技术丈量与认知地球', icon: 'Satellite' },
};
export const getLearnSubjects = () =>
  LEARN_SUBJECTS.map((name) => ({
    name,
    desc: SUBJECT_META[name]?.desc || '',
    icon: SUBJECT_META[name]?.icon || 'Globe',
    count: items.filter((i) => i.type === 'learn' && i.subject === name).length,
  }));

export const getItem = (type: ContentType, slug: string): ContentItem | undefined =>
  items.find((i) => i.type === type && i.slug === slug);

// 同类型内的相关推荐（用于详情页内部互链，利于 SEO / AdSense）。
// 优先返回同分类条目，不足时再用其他条目补齐。
export const getRelated = (type: ContentType, slug: string, limit = 3): ContentItem[] => {
  const current = getItem(type, slug);
  const others = items.filter((i) => i.type === type && i.slug !== slug);
  if (!current?.category) return others.slice(0, limit);
  const sameCat = others.filter((i) => i.category === current.category);
  if (sameCat.length >= limit) return sameCat.slice(0, limit);
  const rest = others.filter((i) => i.category !== current.category);
  return [...sameCat, ...rest].slice(0, limit);
};

// 更新日志：content/changelog.md 单文件
const changelogRaw = rawFiles['../../content/changelog.md'];

export const getChangelog = (): ContentItem | null => {
  if (!changelogRaw) return null;
  const { data, content } = parseFrontmatter(changelogRaw);
  return {
    slug: 'changelog',
    type: 'article',
    title: data.title || '更新日志',
    summary: data.summary,
    order: 0,
    body: content.trim(),
  };
};

export interface TimelineEntry {
  date: string;
  title: string;
}

// 从 changelog 正文提取「**YYYY-MM-DD**：标题」格式的最近更新时间线
export const getChangelogTimeline = (limit = 6): TimelineEntry[] => {
  const cl = getChangelog();
  if (!cl) return [];
  const entries: TimelineEntry[] = [];
  const re = /\*\*(\d{4}-\d{2}-\d{2})\*\*[：:]\s*(.+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cl.body)) !== null) {
    entries.push({ date: m[1], title: m[2].trim() });
  }
  return entries.slice(0, limit);
};

// 供预渲染脚本枚举所有详情页路由
export const getAllDetailPaths = (): string[] => {
  const paths: string[] = [];
  for (const it of items) {
    const base = it.type === 'work' ? 'works' : it.type === 'tool' ? 'tools' : it.type === 'learn' ? 'learn' : 'articles';
    paths.push(`/${base}/${it.slug}`);
  }
  if (changelogRaw) paths.push('/changelog');
  return paths;
};

// 标签聚合：返回所有标签及其出现次数（降序），用于「地理」等专题落地页与 sitemap。
export interface TagCount {
  tag: string;
  count: number;
}

export const getTags = (): TagCount[] => {
  const map = new Map<string, number>();
  for (const it of items) {
    for (const t of it.tags || []) {
      map.set(t, (map.get(t) || 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
};

export const getItemsByTag = (tag: string): ContentItem[] =>
  items
    .filter((i) => (i.tags || []).includes(tag))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

// 供预渲染 / sitemap 枚举所有标签专题页路由（中文标签做 URL 编码）。
export const getAllTagPaths = (): string[] =>
  getTags().map((t) => `/tag/${encodeURIComponent(t.tag)}`);
