// 内容加载层：在编译期通过 import.meta.glob 把所有 Markdown 打进 bundle。
// 每个内容文件由 frontmatter（卡片元数据）+ 正文（详情页内容）组成。
// 无需后端、无需额外依赖，纯前端 + 构建期即可驱动全站。

export type ContentType = 'work' | 'tool' | 'article';

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
    folder === 'works' ? 'work' : folder === 'tools' ? 'tool' : 'article';
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
    const base = it.type === 'work' ? 'works' : it.type === 'tool' ? 'tools' : 'articles';
    paths.push(`/${base}/${it.slug}`);
  }
  if (changelogRaw) paths.push('/changelog');
  return paths;
};
