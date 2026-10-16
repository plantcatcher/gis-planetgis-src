// 内容加载层：在编译期通过 import.meta.glob 把所有 Markdown 打进 bundle。
// 每个内容文件由 frontmatter（卡片元数据）+ 正文（详情页内容）组成。
// 无需后端、无需额外依赖，纯前端 + 构建期即可驱动全站。
//
// 文件夹即类型：content 下的一级目录名直接决定 type 与详情页路径前缀，
//   works  ->  /works/:slug      模拟实验等独立作品
//   maps   ->  /maps/:slug       互动地图（本体在 /maps/:slug/full）
//   games  ->  /games/:slug      地理小游戏
//   tools  ->  /tools/:slug      地理小工具
//   learn      /learn/:slug      地理知识库
//   downloads  /downloads/:slug  资料下载
// 新增内容只需放进对应文件夹，不需要额外的归属字段。

// 页面热度（浏览量）：由 scripts/gen_heat.mjs 从 GA4 取数生成，构建期 baked 进静态数据。
import heatRaw from '../data/heat.json';
const HEAT: Record<string, number> = (heatRaw as unknown as Record<string, number>) || {};

// 内容元数据索引（不含正文）：由 scripts/gen-content-index.mjs 在 dev/build 前置生成。
// 过去这里是 eager glob 把全部 markdown（含正文，约 4MB）打进主 bundle，是首包 4.9MB 的主因；
// 现在只常驻这份轻量元数据，正文改由下方 loadBody() 按篇懒加载（详见该函数注释）。
import contentIndexRaw from '../data/content-index.json';

export type ContentType = 'work' | 'map' | 'game' | 'tool' | 'article' | 'learn' | 'resource';

/**
 * type -> URL 路径前缀。详情页与列表页路径的唯一映射来源，与 content 下的文件夹名一一对应。
 * ContentDetail / TagPage / learningService / 预渲染脚本都从这里取，不要再各写一份。
 */
export const BASE_PATH: Record<ContentType, string> = {
  work: 'works',
  map: 'maps',
  game: 'games',
  tool: 'tools',
  article: 'articles',
  learn: 'learn',
  resource: 'downloads',
};

export interface ContentItem {
  slug: string;
  type: ContentType;
  title: string;
  cover?: string;
  summary?: string;
  link?: string;
  order: number;
  date?: string;
  /** 学习/作品等内容的「专题栏目」（如海平面模拟 / 历史地理 / 区域地理）。 */
  category?: string;
  /** 学科方向（仅 learn 使用）：自然地理 / 人文地理 / 区域地理 / 地理信息技术。 */
  subject?: string;
  /** 学段（仅 learn 使用，可选）：初中 / 高中 / 大学。与 category（专题）、subject（学科）三者正交。 */
  level?: string;
  /**
   * 主题标签（细分分类，仅 maps / games 使用）：比 category（互动地图 / 地理游戏）
   * 更细的一层，一条目可归多个主题，逗号分隔。用于 /maps、/games 的筛选。
   */
  topics?: string[];
  /**
   * 地域范围（仅 maps / games 使用）：中国 / 世界 / 通用。
   * 与 topics（主题）正交，是 /maps、/games 的第二道筛选。
   */
  scope?: string;
  tags?: string[];
  body: string;
  /** 资料下载专用：关注公众号后获取的专属验证码（大小写不敏感） */
  code?: string;
  /** 资料下载专用：实际下载链接（仅在验证码验证通过后才展示） */
  download?: string;
  /** 资料下载专用：文件格式，如 PDF / GeoJSON / ZIP / JPG */
  format?: string;
  /** 资料下载专用：文件大小，如 12.4 MB */
  size?: string;
  /** 资料下载专用：图书出版信息（书籍类资料使用） */
  /** 作者 / 主编，如「赵英时 主编」 */
  author?: string;
  /** 出版社，如「科学出版社」 */
  publisher?: string;
  /** ISBN 书号，如 9787030108132 */
  isbn?: string;
  /** 出版年份，如 2003 */
  pubYear?: string;
  /** 资料下载专用：访问方式。open=直接下载（如地图图片）；gated=需公众号验证码（默认：有 code 即门禁） */
  access?: 'open' | 'gated';
  /** 资料下载专用：资料来源/发布机构（如「中华人民共和国水利部」），展示在详情页信息卡「来源」处 */
  source?: string;
  /** 资料下载专用：所属「标准演进时间线」key（如 river-code）。同一 key 的几份标准会在详情页以时间线互链展示 */
  timeline?: string;
  /** 资料下载专用：用户向公众号发送的「专属代码」，用于换取下载验证码（缺省则提示回复资料名） */
  trigger?: string;
  /** 资料下载专用：公众号后台配置的额外关键词（中文别名等），与 trigger 等价，半匹配命中。逗号分隔 */
  keywordAliases?: string[];
  /** 资料下载专用：下载方式。direct=本站直链（默认）；baidu=百度网盘（展示网盘链接+提取码）；
   *  external=第三方外链（如地方自然资源主管部门 gov 直链，文件由对方服务器提供，本站不托管） */
  downloadType?: 'direct' | 'baidu' | 'external';
  /** 资料下载专用：在线观看地址（官方在线阅读页，如 nrsis 标准全文阅读）。有值则在下载区追加「在线观看」按钮 */
  viewUrl?: string;
  /** 资料下载专用：官方入口兜底链接（如 openstd 国家标准全文公开系统 / 自然资源标准化信息服务平台） */
  officialUrl?: string;
  /** 资料下载专用：官方入口名称，缺省则直接显示链接文本 */
  officialName?: string;
  /** 资料下载专用（标准规范类）：标准号，如 TD/T 1055-2019，展示在信息卡 */
  standardNo?: string;
  /** 资料下载专用（标准规范类）：标准状态，如「现行」「已废止（被 GB/T 42547—2023 代替）」 */
  stdStatus?: string;
  /** 资料下载专用（标准规范类）：发布 / 实施日期，如「2019-01-28 发布 · 2019-02-01 实施」 */
  stdDate?: string;
  /** 资料下载专用（标准规范类）：总页数，如 135 页 */
  pages?: string;
  /** 资料下载专用：百度网盘提取码（downloadType=baidu 时展示） */
  panCode?: string;
  /** 资料下载专用：备用下载地址（主链接不可用时的兜底渠道，弱化展示在主下载入口下方） */
  downloadAlt?: string;
  /** 资料下载专用：备用下载方式。direct=直链（默认）；baidu=百度网盘 */
  downloadAltType?: 'direct' | 'baidu';
  /** 资料下载专用：备用下载的百度网盘提取码（downloadAltType=baidu 时展示） */
  downloadAltCode?: string;
  /** 首页资料下载区专用：设为 true 则该资料优先显示在首页资料区（精选） */
  home?: boolean;
  /** 首页精选排序：数字越小越靠前；缺省按 date 倒序。仅 home:true 时生效 */
  homeOrder?: number;
  /** 资料下载专用：顶层分组（文献资料 / 地理数据），用于下载页双轴筛选。缺省由 category 推导 */
  group?: string;
  /** 资料下载专用：地理数据的区域范围（国内 / 国外 / 全球 / 其他） */
  region?: string;
  /** 资料下载专用：地理数据的格式类型（SHP / GeoTIFF / 影像 / 其他），由 format 归一化而来 */
  dataFormat?: string;
  /** 页面热度：近 30 天 GA4 浏览量（构建期从 heat.json 注入，缺省 0） */
  heat?: number;
  /**
   * 正文字数（去空白）。由 scripts/gen-content-index.mjs 在构建期预计算并写入元数据索引，
   * 列表卡片据此展示「N 字」而无需加载正文。
   */
  words?: number;
  /** 预计阅读时长（分钟，由 words 按 350 字/分钟推导，构建期预计算） */
  readingMin?: number;
  /** 卡片导语：无 summary 时的正文摘录（构建期预计算，前 72 字）；有 summary 时为空 */
  lead?: string;
}

interface Frontmatter {
  [key: string]: string;
}

interface IndexRow {
  folder: string;
  filename: string;
  fm: Record<string, string>;
  words: number;
  lead: string;
}
const CONTENT_INDEX = contentIndexRaw as unknown as IndexRow[];

// 正文按篇懒加载：非 eager 的 glob 让每个 .md 成为独立 chunk，仅在需要时拉取。
// key 形如 `../../content/<folder>/<filename>.md`，loadBody 用它取到对应 loader。
const bodyGlob = import.meta.glob('../../content/**/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

// changelog.md 供首页「动态与规划」实时读取（getChangelog / 时间线 / 规划卡片），
// 保持 eager——仅一个文件，体积可忽略，但必须同步可得。
const changelogGlob = import.meta.glob('../../content/changelog.md', {
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

/** 目录名 -> 内容类型。与 content 下的一级目录一一对应；preloadRoute 也复用。 */
const folderToType = (folder: string): ContentType =>
  folder === 'works'
    ? 'work'
    : folder === 'maps'
      ? 'map'
      : folder === 'games'
        ? 'game'
        : folder === 'tools'
          ? 'tool'
          : folder === 'learn'
            ? 'learn'
            : folder === 'downloads'
              ? 'resource'
              : 'article';

/** `type:slug` -> 该篇正文的 loader（供 loadBody 按篇拉取） */
const loaderByKey: Record<string, () => Promise<string>> = {};

for (const row of CONTENT_INDEX) {
  const data = row.fm;
  const type = folderToType(row.folder);
  const slug = data.slug || row.filename;

  const loader = bodyGlob[`../../content/${row.folder}/${row.filename}.md`];
  if (loader) loaderByKey[`${type}:${slug}`] = loader;

  items.push({
    slug,
    type,
    title: data.title || row.filename,
    cover: data.cover,
    summary: data.summary,
    link: data.link,
    order: data.order ? Number(data.order) : 999,
    date: data.date,
    category: data.category,
    subject: data.subject,
    level: data.level,
    topics: data.topics ? data.topics.split(',').map((s) => s.trim()).filter(Boolean) : [],
    scope: data.scope,
    tags: data.tags ? data.tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
    // 正文不在此常驻：初始为空，由 loadBody() 在需要时（hydration 前 / 预渲染前 / 站内跳转时）填入。
    body: '',
    words: row.words,
    readingMin: Math.max(1, Math.ceil(row.words / 350)),
    lead: row.lead || undefined,
    code: data.code,
    download: data.download,
    format: data.format,
    size: data.size,
    author: data.author,
    publisher: data.publisher,
    isbn: data.isbn,
    pubYear: data.pubYear,
    access: data.access as ContentItem['access'],
    source: data.source,
    timeline: data.timeline,
    trigger: data.trigger,
    keywordAliases: data.keywordAliases ? data.keywordAliases.split(',').map((s) => s.trim()).filter(Boolean) : [],
    downloadType: data.downloadType as ContentItem['downloadType'],
    viewUrl: data.viewUrl,
    officialUrl: data.officialUrl,
    officialName: data.officialName,
    standardNo: data.standardNo,
    stdStatus: data.stdStatus,
    stdDate: data.stdDate,
    pages: data.pages,
    panCode: data.panCode,
    downloadAlt: data.downloadAlt,
    downloadAltType: data.downloadAltType as ContentItem['downloadAltType'],
    downloadAltCode: data.downloadAltCode,
    home: data.home === 'true' || data.home === '1',
    homeOrder: data.homeOrder ? Number(data.homeOrder) : undefined,
    group: data.group,
    region: data.region,
    dataFormat: data.dataFormat,
    heat: HEAT[slug] || 0,
  });
}

// ===== 正文懒加载 =====
// 正文（全站约 4MB）不进主 bundle，按篇拆成独立 chunk。为了不破坏 SSG + hydrateRoot
// 的 DOM 一致性，会在「第一次渲染之前」预载当前路由的正文：
//   · 客户端：main.tsx 在 hydrateRoot() 之前 await preloadRoute(location.pathname)；
//   · 预渲染：prerender.mjs 在 renderToString() 之前 await preloadRoute(url)。
// 这样首屏渲染拿到的正文与服务端完全一致；只有站内客户端跳转到另一篇时才走异步补载。
const bodyLoading = new Map<string, Promise<void>>();

/** 载入某篇正文到 item.body（幂等；并发调用复用同一 Promise）。 */
export function loadBody(type: ContentType, slug: string): Promise<void> {
  const key = `${type}:${slug}`;
  const item = items.find((i) => i.type === type && i.slug === slug);
  if (!item || item.body) return Promise.resolve();
  const existing = bodyLoading.get(key);
  if (existing) return existing;
  const loader = loaderByKey[key];
  if (!loader) return Promise.resolve();
  const p = loader()
    .then((raw) => {
      item.body = parseFrontmatter(raw).content.trim();
    })
    .finally(() => bodyLoading.delete(key));
  bodyLoading.set(key, p);
  return p;
}

/**
 * 按 URL 路径预载正文——仅详情页路径会命中（`/<板块>/<slug>`，如 /learn/xxx）。
 * 列表页 / 首页 / 多级路径（/maps/x/full 等）不需要正文，直接返回。
 */
export async function preloadRoute(pathname: string): Promise<void> {
  const m = /^\/(works|maps|games|tools|articles|learn|downloads)\/([^/]+?)\/?$/.exec(pathname);
  if (!m) return;
  let slug = m[2];
  try {
    slug = decodeURIComponent(slug);
  } catch {
    /* 非法编码则按原样查 */
  }
  await loadBody(folderToType(m[1]), slug);
}

export const getWorks = (): ContentItem[] =>
  items
    .filter((i) => i.type === 'work')
    .sort((a, b) => a.order - b.order);

/**
 * 按 type 取某一类内容——文件夹即归属，/maps、/games、/works 等汇总页的唯一数据源。
 * 以前靠 frontmatter 的 series 字段区分，现在 type 本身就表达归属。
 */
export const getByType = (type: ContentType): ContentItem[] =>
  items
    .filter((i) => i.type === type)
    .sort((a, b) => a.order - b.order);

/** 互动地图：content/maps（63 条），本体在 /maps/<slug>/full */
export const getMaps = (): ContentItem[] => getByType('map');

/** 地理小游戏：content/games，本体是站内 GameEmbed 路由 */
export const getGames = (): ContentItem[] => getByType('game');

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

// 资料下载板块：按更新时间倒序（最新的在前）
export const getResources = (): ContentItem[] =>
  items
    .filter((i) => i.type === 'resource')
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

/**
 * 首页资料下载区数据源：支持「精选」优先。
 * - frontmatter 加 `home: true` 的资料排在首页最前面；
 * - 可选 `homeOrder`（数字，越小越靠前）控制精选内部顺序，缺省按 date 倒序；
 * - 精选不足 limit 时，自动用最新资料补齐，保证首页始终有 limit 条；
 * - 不设置任何 home 字段时，等价于按 date 倒序取前 limit 条（向后兼容）。
 */
export const getHomeResources = (limit = 6): ContentItem[] => {
  const all = getResources();
  const featured = all.filter((i) => i.home);
  featured.sort((a, b) => {
    const oa = a.homeOrder ?? 999;
    const ob = b.homeOrder ?? 999;
    if (oa !== ob) return oa - ob;
    return (b.date || '').localeCompare(a.date || '');
  });
  if (featured.length >= limit) return featured.slice(0, limit);
  const rest = all.filter((i) => !i.home);
  return [...featured, ...rest].slice(0, limit);
};

/** 资料是否需公众号验证码门禁：显式 gated，或（未标记 open 且带 code）视为门禁 */
export const isResourceGated = (i: ContentItem): boolean =>
  i.access === 'gated' || (i.access !== 'open' && !!(i.code && i.code.trim()));

/** 资料是否可直接下载（无需验证码）：地图图片等 */
export const isResourceOpen = (i: ContentItem): boolean => !isResourceGated(i);

/**
 * 仅提供在线阅读外链、不提供整本文件下载（如 nrsis 官方在线阅读页）。
 * 用于 /downloads 卡片徽标与「访问方式」筛选的三态区分：
 * 需验证码（gated） / 在线观看（view-only） / 直接下载（其余 open）。
 */
export const isResourceViewOnly = (i: ContentItem): boolean =>
  !isResourceGated(i) && !!i.viewUrl && !i.download;

// 地理学习板块的「专题栏目」分类，按固定顺序返回，便于列表页生成筛选。
// 注意：category 的语义是「专题栏目」（海平面模拟 / 历史地理 / 区域地理 / 地理基础），
// 与 subject（学科方向）、level（学段）三者正交——不要再把学段值塞进 category。
const LEARN_CATEGORY_ORDER = ['海平面模拟', '历史地理', '区域地理', '地理基础'];
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
    const ia = LEARN_CATEGORY_ORDER.indexOf(a);
    const ib = LEARN_CATEGORY_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
};

// 地理学习板块的「学段」（仅课本同步类条目可选标注）：初中 / 高中 / 大学。
// 与 category（专题栏目）、subject（学科方向）正交，多数条目没有学段。
const LEARN_LEVEL_ORDER = ['初中', '高中', '大学'];
export const getLearnLevels = (): string[] => {
  const lvls = Array.from(
    new Set(items.filter((i) => i.type === 'learn').map((i) => i.level).filter(Boolean) as string[]),
  );
  return lvls.sort((a, b) => {
    const ia = LEARN_LEVEL_ORDER.indexOf(a);
    const ib = LEARN_LEVEL_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
};

// 地理学习板块的学科方向（与专题 category、学段 level 正交）。
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

/**
 * 作品的真实子分类（category）聚合，用于 /works 页筛选。
 * 作品 category 是「互动地图 / 地理游戏 / 模拟实验 / 趣味测试」这类真实子类，
 * 不是恒定的板块名——写什么就筛什么，改 md 即生效。
 */
export const getWorkCategories = (): { name: string; count: number }[] => {
  const map = new Map<string, number>();
  for (const w of getWorks()) {
    const c = w.category || '未分类';
    map.set(c, (map.get(c) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
};

/**
 * 某一类（map / game）的「主题标签」聚合，用于 /maps、/games 的细分筛选。
 * 比 category（互动地图 / 地理游戏）更细：一条目可归多个主题，写什么就筛什么。
 * 排序：出现次数多的在前，同次数按中文拼音（localeCompare zh）稳定排列。
 */
export const getWorkTopics = (type: 'map' | 'game'): { name: string; count: number }[] => {
  const map = new Map<string, number>();
  for (const w of getByType(type)) {
    for (const t of w.topics || []) map.set(t, (map.get(t) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-Hans-CN'));
};

/** 地域范围的展示顺序（固定：中国 → 世界 → 通用，其余按出现次数兜底） */
const SCOPE_ORDER = ['中国', '世界', '通用'];

/**
 * 某一类（map / game）的「地域范围」聚合，用于第二道筛选。
 * scope 与 topics 正交——一个是「画的是什么主题」，一个是「画的是哪儿」。
 */
export const getWorkScopes = (type: 'map' | 'game'): { name: string; count: number }[] => {
  const map = new Map<string, number>();
  for (const w of getByType(type)) {
    if (w.scope) map.set(w.scope, (map.get(w.scope) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      const ia = SCOPE_ORDER.indexOf(a.name);
      const ib = SCOPE_ORDER.indexOf(b.name);
      if (ia !== ib) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      return b.count - a.count;
    });
};

export const getItem = (type: ContentType, slug: string): ContentItem | undefined =>
  items.find((i) => i.type === type && i.slug === slug);

// 同类型内的相关推荐（用于详情页内部互链，利于 SEO / AdSense）。
// 优先返回同分类条目，不足时再用其他条目补齐。
export const getRelated = (type: ContentType, slug: string, limit = 6): ContentItem[] => {
  const current = getItem(type, slug);
  const others = items.filter((i) => i.type === type && i.slug !== slug);
  if (!current) return others.slice(0, limit);
  const curTags = new Set(current.tags || []);
  // 相关性打分：同分类权重高，标签重合越多越相关。
  const score = (i: ContentItem): number => {
    let s = 0;
    if (i.category === current.category) s += 10;
    for (const t of i.tags || []) if (curTags.has(t)) s += 1;
    return s;
  };
  return others
    .map((i) => ({ i, s: score(i) }))
    .sort((a, b) => b.s - a.s || a.i.title.localeCompare(b.i.title, 'zh'))
    .slice(0, limit)
    .map((x) => x.i);
};

// 更新日志：content/changelog.md 单文件（eager，见 changelogGlob）
const changelogRaw = changelogGlob['../../content/changelog.md'];

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

export interface PlanEntry {
  title: string;
  desc: string;
}

// 从 changelog 正文「## 规划中」小节提取「- **标题**：说明」，与 /changelog 同源，
// 首页「动态与规划」的规划卡片直接由此渲染，改 md 即两处同步。
export const getChangelogPlans = (): PlanEntry[] => {
  const cl = getChangelog();
  if (!cl) return [];
  const sec = cl.body.match(/##\s*规划中([\s\S]*?)(?=\n##\s|$)/);
  if (!sec) return [];
  const out: PlanEntry[] = [];
  const re = /^-\s*\*\*(.+?)\*\*\s*[：:]\s*(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sec[1])) !== null) {
    out.push({ title: m[1].trim(), desc: m[2].trim() });
  }
  return out;
};

// 供预渲染脚本枚举所有详情页路由
export const getAllDetailPaths = (): string[] => {
  const paths: string[] = [];
  for (const it of items) {
    paths.push(`/${BASE_PATH[it.type]}/${it.slug}`);
  }
  if (changelogRaw) paths.push('/changelog');
  return paths;
};

/**
 * 供 gen-sitemap.mjs 使用：路由 -> 内容真实发布日期（YYYY-MM-DD）。
 *
 * 之前 sitemap 的 <lastmod> 一律填构建当天，等于告诉搜索引擎「全站每天都在更新」，
 * 是失真信号（Google 发现 lastmod 不可信后会直接忽略该字段）。改成真实日期后，
 * 搜索引擎才能据此安排抓取优先级：新内容优先抓，老内容降低频次。
 */
export const getDetailLastmodMap = (): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const it of items) {
    // 路径前缀的唯一来源是 BASE_PATH（map→maps、game→games…），不要再手写一份。
    // 旧实现用 if/else 且漏掉了 map / game 两类，它们落到默认分支被写成
    // /articles/<slug>，于是 /maps/*、/games/* 在 sitemap 里取不到真实日期、
    // 退化成构建当天——正是本函数要消除的「全站每天都在更新」失真信号。
    const base = BASE_PATH[it.type];
    const d = (it.date || '').slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) map[`/${base}/${it.slug}`] = d;
  }
  return map;
};

// 标签聚合：返回所有标签及其出现次数（降序），用于「地理」等专题落地页与 sitemap。
export interface TagCount {
  tag: string;
  count: number;
}

export const getTags = (): TagCount[] => {
  const map = new Map<string, number>();
  for (const it of items) {
    // 同一篇内重复写的标签只计一次，避免计数虚高
    for (const t of new Set(it.tags || [])) {
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

// 标签聚合（限定范围）：统计给定资料集合内的标签出现次数（降序）。
// 列表页的标签栏必须用本函数基于「本页资料」统计——直接用 getTags() 会把
// 其它板块（科普文章 / 作品）的计数带进来，使标签后的数字与点击筛选后的结果对不上。
export const countTags = (list: ContentItem[]): TagCount[] => {
  const map = new Map<string, number>();
  for (const it of list) {
    // 一篇资料内重复写的标签只计一次，保证数字 = 点击后筛出的条数
    for (const t of new Set(it.tags || [])) {
      map.set(t, (map.get(t) || 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
};

// ===== 资料下载页的「省份」筛选轴 =====
// 「国土空间规划」类资料按行政区组织，tags 里带有省级标签（广西 / 安徽 / 四川 / 广东…）。
// 这里用一份省级行政区白名单把这些标签识别出来，供下载页提供一独立筛选轴，
// 同时把省份标签从「标签」栏剔除——同一个维度不在两处重复出现，标签栏也能让出位置给语义标签。
export const PROVINCE_ORDER = [
  '北京', '天津', '河北', '山西', '内蒙古',
  '辽宁', '吉林', '黑龙江',
  '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东',
  '河南', '湖北', '湖南', '广东', '广西', '海南',
  '重庆', '四川', '贵州', '云南', '西藏',
  '陕西', '甘肃', '青海', '宁夏', '新疆',
  '台湾', '香港', '澳门',
] as const;

const PROVINCE_SET = new Set<string>(PROVINCE_ORDER);

/** 某个标签是否为省级行政区标签（用于标签栏剔除省份、区域轴识别省份） */
export const isProvinceTag = (tag: string): boolean => PROVINCE_SET.has(tag);

// ===== 资料下载页的分类体系（2026-10-13 重构）=====
// 设计原则：**顶层取共性，第二层才是个性**。
// 所有资料的共同属性是「文件形态」——要么是文本（PDF/Word），要么是数据集（SHP/GeoTIFF），
// 这一层互斥、稳定、不随内容漂移，所以作为主分类；各类内部再挂自己的维度。
//
//   主分类：文献资料 407 ｜ 地理数据 65
//     ├ 图书教材 82  → 学科（自然地理 / 人文地理 / 城市与区域 / GIS与遥感 / 高中地理…）
//     ├ 标准规范 19  → 级别（国家标准 / 行业标准 / 地方标准）
//     ├ 规划文本 306 → 层级（省级 / 市级）
//     └ 地理数据 65  → 格式（SHP / GeoTIFF / 影像）
//   区域（全局横切）：世界（全球 / 国外） ｜ 中国（全国 / 各省·自治区·直辖市）
//   访问方式（全局横切）：直接下载 / 在线观看 / 需验证码
//   标签（最底层）：跨分类的语义关键词
//
// 除 group 外全部由现有字段推导，不改 md——将来若要显式覆盖，加同名 frontmatter 字段即可。

export const DL_GROUP_LITERATURE = '文献资料';
export const DL_GROUP_DATA = '地理数据';

/** 顶层分类。显式 group 字段优先，缺省按 category 推导（数据类恒为「地理数据」，其余为「文献资料」）。 */
export const resourceGroup = (i: ContentItem): string =>
  i.group || (i.category === DL_GROUP_DATA ? DL_GROUP_DATA : DL_GROUP_LITERATURE);

export const DL_GROUP_ORDER = [DL_GROUP_LITERATURE, DL_GROUP_DATA] as const;

/**
 * 第二层「资料性质」：仅文献资料内部细分，地理数据不再分性质（返回其自身）。
 * - 标准规范（GB/T、TD/T、SL、地方细则）
 * - 规划文本（各级国土空间规划文本与配套图集）
 * - 图书教材（教材、专著、论文、题库笔记等技术书刊）
 */
export const resourceDocType = (i: ContentItem): string => {
  const g = resourceGroup(i);
  if (g === DL_GROUP_DATA) return DL_GROUP_DATA;
  if (i.category === '标准规范') return '标准规范';
  if (i.category === '国土空间规划') return '规划文本';
  return '图书教材';
};

/** 文献资料内部的资料性质顺序（图书教材 → 标准规范 → 规划文本） */
export const DL_DOC_TYPES = ['图书教材', '标准规范', '规划文本'] as const;

/** 图书教材的「学科」展示顺序；不在表内的按出现顺序排在最后。 */
const DL_SUBJECT_ORDER = ['自然地理', '人文地理', '城市与区域', 'GIS与遥感', '测绘与地球科学', '计算机与编程', '高中地理'];

export const sortSubjects = (names: string[]): string[] =>
  [...names].sort((a, b) => {
    const ia = DL_SUBJECT_ORDER.indexOf(a);
    const ib = DL_SUBJECT_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

/** 标准规范的「级别」：按标准号前缀判定，缺号时回退到 slug 前缀。 */
export const resourceStdLevel = (i: ContentItem): string => {
  const no = (i.standardNo || '').trim();
  const slug = i.slug || '';
  if (no.startsWith('GB/T') || slug.startsWith('gbt')) return '国家标准';
  if (no.startsWith('TD/T') || slug.startsWith('tdt')) return '行业标准';
  if (slug.startsWith('sl-') || slug === 'sl') return '行业标准';
  return '地方标准';
};

export const DL_STD_LEVELS = ['国家标准', '行业标准', '地方标准'] as const;

// 省级行政区拼音（slug 前缀）。规划文本的 slug 统一为 `<拼音>-guotu-kongjian-guihua[-后缀]`，
// 去掉规划后缀后命中本表即省级规划，否则为市级（地级市 / 自治州 / 盟）。
const PROVINCE_SLUGS = new Set([
  'beijing', 'tianjin', 'hebei', 'shanxi', 'neimenggu',
  'liaoning', 'jilin', 'heilongjiang',
  'shanghai', 'jiangsu', 'zhejiang', 'anhui', 'fujian', 'jiangxi', 'shandong',
  'henan', 'hubei', 'hunan', 'guangdong', 'guangxi', 'hainan',
  'chongqing', 'sichuan', 'guizhou', 'yunnan', 'xizang',
  'shaanxi', 'gansu', 'qinghai', 'ningxia', 'xinjiang',
  'taiwan', 'xianggang', 'aomen',
]);

/** 规划文本的「层级」：省级 / 市级。 */
export const resourcePlanLevel = (i: ContentItem): string => {
  const base = (i.slug || '').replace(/-guotu-kongjian-guihua.*$/, '');
  return PROVINCE_SLUGS.has(base) ? '省级' : '市级';
};

export const DL_PLAN_LEVELS = ['省级', '市级'] as const;

/** 地理数据「格式」归一化：修掉大小写不一致（如 shp / SHP），缺省归「其他」。 */
export const normDataFormat = (raw?: string): string => {
  const s = (raw || '').trim();
  if (!s) return '其他';
  const low = s.toLowerCase();
  if (low === 'shp' || low === 'shapefile') return 'SHP';
  if (low === 'geotiff' || low === 'tif' || low === 'tiff') return 'GeoTIFF';
  return s;
};

/**
 * 区域轴（全局横切）：把地理数据的 region 字段（世界）与省级标签（中国）合成一根轴。
 * 值编码为 `R:<region>`（世界）或 `P:<省>`（中国），供 URL 与筛选共用。
 * 显示上分两组：世界（全球 / 国外）→ 中国（全国 / 各省·自治区·直辖市）。
 */
export interface AreaFacet {
  group: '世界' | '中国';
  name: string;
  value: string;
  count: number;
}

const REGION_ORDER = ['全球', '国外', '国内'];
const REGION_LABEL: Record<string, string> = { 国内: '全国' };

export const getAreaFacets = (list: ContentItem[]): AreaFacet[] => {
  const world = new Map<string, number>();
  const china = new Map<string, number>();
  for (const it of list) {
    if (it.region) world.set(it.region, (world.get(it.region) || 0) + 1);
    for (const t of new Set(it.tags || [])) {
      if (PROVINCE_SET.has(t)) china.set(t, (china.get(t) || 0) + 1);
    }
  }
  const out: AreaFacet[] = [];
  const rest = Array.from(world.keys()).filter((k) => !REGION_ORDER.includes(k)).sort();
  for (const k of [...REGION_ORDER, ...rest]) {
    if (world.has(k)) {
      out.push({ group: '世界', name: REGION_LABEL[k] || k, value: `R:${k}`, count: world.get(k)! });
    }
  }
  for (const p of PROVINCE_ORDER) {
    if (china.has(p)) out.push({ group: '中国', name: p, value: `P:${p}`, count: china.get(p)! });
  }
  return out;
};

/** 区域筛选：`R:<region>` 匹配 region 字段，`P:<省>` 匹配省级标签。 */
export const matchArea = (i: ContentItem, value: string): boolean => {
  if (value.startsWith('R:')) return (i.region || '') === value.slice(2);
  if (value.startsWith('P:')) return (i.tags || []).includes(value.slice(2));
  return true;
};

/** 区域轴取值 → 显示名（`R:国内` → 全国，`P:广东` → 广东）。 */
export const areaLabel = (value: string): string => {
  if (value.startsWith('R:')) {
    const k = value.slice(2);
    return REGION_LABEL[k] || k;
  }
  return value.slice(2);
};

// 供预渲染 / sitemap 枚举所有标签专题页路由（中文标签做 URL 编码）。
export const getAllTagPaths = (): string[] =>
  getTags().map((t) => `/tag/${encodeURIComponent(t.tag)}`);
