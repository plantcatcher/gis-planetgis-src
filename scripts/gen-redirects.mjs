// 生成 Cloudflare Pages 的 public/_redirects：把迁移前的详情页 URL 301 到新地址。
//
// 为什么必须有：63 张地图的旧地址 /works/<slug> 已被百度收录，直接下线会全部变 404。
//
// 为什么映射要固化成本仓库的 JSON：这次迁移提交之后，git 索引里就再也没有
// content/works/<slug>.md 了，届时无法反推旧地址清单。所以 scripts/legacy-redirects.json
// 是这份历史映射的唯一真相，**随仓库提交，不要删**。
//
// 用法：node scripts/gen-redirects.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const legacy = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'scripts', 'legacy-redirects.json'), 'utf8'),
);

const pairs = Object.entries(legacy).sort((a, b) => a[0].localeCompare(b[0]));

/**
 * 英文站详情页 → 中文正文。
 *
 * 背景：英文版只预渲染「静态页 + 列表页」（见 scripts/site-routes.mjs 的 EN_EXCLUDE），
 * 详情页要等 content/en/ 建好才有真实英文内容。但英文列表页里**链到了**这些详情页，
 * 外部/AI 引用也直接指向它们 —— 直接访问会落到 404.html，GA4 里 404 页因此有
 * 100+ 真实用户。英文正文尚不存在时，301 到中文原文是唯一不丢用户的处理：
 * 用户拿到内容，权重也归到唯一可索引的地址，而不是在 /en 下多一份中文重复页。
 *
 * ⚠️ 只用单段占位符（:slug），不要写成 /en/learn/*：
 *    英文分页页 /en/learn/page/2 是真实预渲染的文件，通配符会把它们一起重定向掉。
 */
const enDetail = [
  ['/en/maps/:slug/full', '/maps/:slug/full'],
  ['/en/maps/:slug/*', '/maps/:slug/:splat'],
  ['/en/maps/:slug', '/maps/:slug'],
  ['/en/learn/:slug', '/learn/:slug'],
  ['/en/downloads/:slug', '/downloads/:slug'],
  ['/en/tools/:slug', '/tools/:slug'],
  ['/en/works/:slug', '/works/:slug'],
  ['/en/games/:slug', '/games/:slug'],
  ['/en/tag/:tag', '/tag/:tag'],
  // 游戏壳页与 /wiki 刻意不做英文版：游戏本体界面仍是中文，/wiki 收录的是中文平台。
  ['/en/geoquiz', '/geoquiz'],
  ['/en/geoshape', '/geoshape'],
  ['/en/geotype', '/geotype'],
  ['/en/chinapuzzle', '/chinapuzzle'],
  ['/en/wiki', '/wiki'],
];

/** 误打到主站的旧地址 */
const legacyPatterns = [
  // /archives/<abbrlink> 是 Hexo 博客的固定地址格式。旧链接、书签、搜索快照
  // 偶尔会把 blog.planetgis.cn 写成 planetgis.cn；主站从没做过 /archives，
  // 整段交给博客域名，能救回一批 404。
  ['/archives/*', 'https://blog.planetgis.cn/archives/:splat'],
  // 浏览器会无条件请求 /favicon.ico（即便页面已声明 <link rel="icon" href="/favicon.png">）
  ['/favicon.ico', '/favicon.png'],
];

// Cloudflare 文档要求「静态规则排在动态规则之前」，否则动态规则会先吃掉请求。
const isDynamic = (rule) => rule.includes(':') || rule.includes('*');
const allExtra = [...enDetail, ...legacyPatterns];
const staticExtra = allExtra.filter(([from]) => !isDynamic(from));
const dynamicExtra = allExtra.filter(([from]) => isDynamic(from));

const lines = [
  '# 由 scripts/gen-redirects.mjs 自动生成，请勿手动编辑。',
  '# 数据源：scripts/legacy-redirects.json',
  '# 迁移前 content/works 下的地图与游戏详情页 301 到新地址，保住已收录 URL 的权重。',
  '',
  ...pairs.map(([from, to]) => `${from}  ${to}  301`),
  '',
  '# ===== 静态补充 =====',
  '',
  ...staticExtra.map(([from, to]) => `${from}  ${to}  301`),
  '',
  '# ===== 动态规则：英文站详情页 → 中文正文（英文版尚未建立）=====',
  '',
  ...dynamicExtra.map(([from, to]) => `${from}  ${to}  301`),
];

fs.writeFileSync(path.join(ROOT, 'public', '_redirects'), `${lines.join('\n')}\n`, 'utf8');
console.log(`已写出 ${pairs.length} 条 301 规则 -> public/_redirects`);
