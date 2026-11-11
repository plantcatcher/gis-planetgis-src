// 全站路由清单的唯一来源：prerender.mjs 与 gen-sitemap.mjs 共用。
// 以前两份脚本各维护一份 staticRoutes，导致 /changelog 只进了 sitemap 却没被预渲染。

import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { ModuleRunner, ESModulesEvaluator, createNodeImportMeta } from 'vite/module-runner';
import { createServerModuleRunnerTransport } from 'vite';

/** 站点 baseURL —— 与 src/lib/seo.tsx 的 SITE 保持一致 */
export const SITE = 'https://planetgis.cn';

/**
 * 给 vite 实例打补丁：用自定义 transport 的 ModuleRunner 替换默认 ssrLoadModule。
 *
 * 背景：Vite 内部 ModuleRunner 的 transport 超时写死为 `transport.timeout ?? 6e4`
 * （60s，vite@7.3.1 module-runner.js），而 createServerModuleRunner 会把传入的
 * options.transport 覆盖掉，没有配置入口。当机器处于低内存/冷文件缓存状态时
 * （Windows 换页 + 杀软实时扫描），单个模块的首次 transform 可能超过 60s，
 * 预渲染就会稳定报 "transport invoke timed out after 60000ms"。
 *
 * 这里直接构造 ModuleRunner 并把 timeout 放宽到 10 分钟，行为与默认
 * ssrLoadModule 一致（仅绕过 vite 内部 moduleGraph 登记与堆栈修复，构建脚本可接受）。
 * @param {import('vite').ViteDevServer} vite 已创建的 dev server 实例（就地修改）
 */
export function patchSsrLoadModuleTimeout(vite, timeoutMs = 600_000) {
  const env = vite.environments.ssr;
  const transport = Object.assign(
    createServerModuleRunnerTransport({ channel: env.hot }),
    { timeout: timeoutMs },
  );
  const runner = new ModuleRunner(
    {
      transport,
      createImportMeta: createNodeImportMeta,
      sourcemapInterceptor: false,
      hmr: false,
    },
    new ESModulesEvaluator(),
  );
  vite.ssrLoadModule = (url) => runner.import(url);
  return vite;
}

/** 不依赖内容文件的固定路由 */
export const staticRoutes = [
  '/',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms',
  '/works',
  '/learn',
  '/tools',
  '/games',
  '/maps',
  '/my',
  '/subdomains',
  '/wiki',
  '/downloads',
  '/changelog',
  '/geoquiz',
  '/geoshape',
  '/geotype',
  '/chinapuzzle',
  '/geodaily',
];

/**
 * 暂不出英文版的路由。
 *
 * ⚠️ 必须与 src/i18n/config.ts 的 EN_STATIC_ROUTES（英文版白名单）保持一致：
 *    那边决定页面声明哪些 hreflang，这边决定实际预渲染哪些 /en 页面。
 *    两边漂移 → hreflang 指向 dist 里不存在的地址，check-seo.mjs 会判构建失败。
 *
 * - 四个游戏壳页：游戏本体是 public/games/<slug>/ 下的独立应用，界面文案仍是中文，
 *   给它们挂英文壳只会让人点进去看到中文界面，反而更困惑。等游戏本体做了 i18n 再放开。
 * - /wiki：GIS 资源导航收录的 172 个站点绝大多数是中文平台，英文用户用不上。
 */
const EN_EXCLUDE = new Set([
  '/geoquiz',
  '/geoshape',
  '/geotype',
  '/chinapuzzle',
  '/geodaily',
  '/wiki',
]);

/** 中文路由 -> 英文路由（加 /en 前缀；'/' 特殊处理成 '/en'） */
export function toEnRoute(route) {
  return route === '/' ? '/en' : `/en${route}`;
}

/** 由中文路由清单生成英文版路由清单 */
export function enRoutes(routes) {
  return routes.filter((r) => !EN_EXCLUDE.has(r)).map(toEnRoute);
}

// ===== 薄内容页面（noindex + 移出 sitemap）=====
//
// downloads 里有 306 篇「国土空间规划」，全部套用同一份六段式模板：
// 批复底线指标 / 规划目标 / 空间格局 / 指标体系 ……
// 实测 8-gram 重合度中位 0.65，最高 0.89 —— 字数不少（中位 1732 字），
// 但读起来几乎是同一篇文章换了地名，搜索引擎判定为模板化重复内容。
// 这正是「收录数长期不涨」的核心：300 篇近似重复页在消耗抓取配额，
// 还拉低整站的页面质量信号，连累真正有内容的页面。
//
// 判据（三条同时满足）：
//   1. 属于 downloads / 国土空间规划 —— 只有这批页面共用模板；
//   2. 独有 8-gram < 400 —— 与同目录其它页面的公共套话占绝对多数
//      （非规划的 191 篇下载页最低也有 425，这条界线很干净）；
//   3. 站内热度 < 5 —— 确实有人在搜的页面保留，不因模板化误伤。
// 处理方式是 noindex, follow：页面照常可访问、站内导航照常链接、权重照常传递，
// 只是不再占用索引位与抓取配额。
//
// ⚠️ 阈值集中在这里，prerender 与 gen-sitemap 都调用同一个函数，
//    避免出现「prerender 说 noindex、sitemap 还收录着」的矛盾信号。
const THIN_CATEGORY = '国土空间规划';
const THIN_UNIQ_MAX = 400;
const THIN_HEAT_MAX = 5;

/**
 * 返回应当 noindex 的详情页路径集合（形如 /downloads/<slug>）。
 * 读 src/data/content-index.json（由 gen-content-index.mjs 生成，含 uniq）
 * 与 src/data/heat.json（站内热度）。读不到就返回空集，构建照常进行。
 */
export function getThinDetailPaths() {
  const out = new Set();
  let rows;
  let heat;
  try {
    rows = JSON.parse(readFileSync(join(process.cwd(), 'src/data/content-index.json'), 'utf-8'));
    heat = JSON.parse(readFileSync(join(process.cwd(), 'src/data/heat.json'), 'utf-8'));
  } catch {
    return out;
  }
  for (const row of rows) {
    if (row.folder !== 'downloads') continue;
    const fm = row.fm || {};
    if (fm.category !== THIN_CATEGORY) continue;
    if (typeof row.uniq !== 'number' || row.uniq >= THIN_UNIQ_MAX) continue;
    const slug = fm.slug || row.filename;
    if ((heat[slug] || 0) >= THIN_HEAT_MAX) continue;
    // 与 getAllDetailPaths() 同口径：slug 原样拼，不做 URL 编码
    out.add(`/downloads/${slug}`);
  }
  return out;
}

// ===== 列表分页页 =====
//
// 分页从 `?page=N` 改成路径式 `/learn/page/2`：
// 本站是 SSG + Cloudflare Pages 的扁平 `.html` 产物，query string 不参与文件映射，
// `/learn?page=2` 与 `/learn` 落到同一个 dist/learn.html —— 预渲染永远只有第 1 页，
// 第 2 页起的内容在静态 HTML 里没有任何**有效**入口（链接存在，但指向同一份页面）。
// 改成 `/learn/page/2 -> dist/learn/page/2.html` 后每页都是独立可抓取的 200 页面。
//
// ⚠️ PAGE_SIZES 必须与 src/lib/pagination.ts 的 PAGE_SIZE 一一对应：
//    那边决定页面怎么切片，这边决定要预渲染到第几页，漂移会产出死链或漏页。
const PAGE_SIZES = {
  learn: 18,
  downloads: 24,
  maps: 12,
  games: 12,
  works: 12,
};

/**
 * 由「条目总数 + 每页条数」算出分页路由（第 2 页起；第 1 页就是列表页本身）。
 * @param {string} base 列表页基路径，如 /learn
 * @param {number} total 该板块条目总数（**不过滤**，取全量）
 * @param {number} size 每页条数
 */
function pageRoutes(base, total, size) {
  const pages = Math.max(1, Math.ceil(total / size));
  const out = [];
  for (let p = 2; p <= pages; p++) out.push(`${base}/page/${p}`);
  return out;
}

/**
 * 汇总全部需要预渲染 / 进 sitemap 的路由（已去重）。
 * @param {import('vite').ViteDevServer} vite 用于 ssrLoadModule 读取内容层
 */
export async function collectRoutes(vite) {
  patchSsrLoadModuleTimeout(vite);
  const { getAllDetailPaths, getAllTagPaths, getLearns, getResources, getMaps, getGames, getWorks } =
    await vite.ssrLoadModule('/src/lib/content.ts');
  // 互动地图全屏壳页也需预渲染，否则直接访问 /maps/<slug> 会落到 404.html
  const { getVizMapPaths } = await vite.ssrLoadModule('/src/lib/vizmaps.ts');
  const pagedRoutes = [
    ...pageRoutes('/learn', getLearns().length, PAGE_SIZES.learn),
    ...pageRoutes('/downloads', getResources().length, PAGE_SIZES.downloads),
    ...pageRoutes('/maps', getMaps().length, PAGE_SIZES.maps),
    ...pageRoutes('/games', getGames().length, PAGE_SIZES.games),
    ...pageRoutes('/works', getWorks().length, PAGE_SIZES.works),
  ];
  const zhRoutes = [
    ...staticRoutes,
    ...pagedRoutes,
    ...getAllDetailPaths(),
    ...getAllTagPaths(),
    ...getVizMapPaths(),
  ];
  // 英文版目前只预渲染静态页与列表页：内容详情页的英文版要等 content/en/ 建好
  // 才有实际内容，提前预渲染只会产出「英文外壳 + 中文正文」的重复页面。
  // 分页页跟列表页同命运：列表页有英文版，它的分页就有（见 hasEnglishVersion）。
  const enStatic = [...staticRoutes, ...pagedRoutes];
  const all = [...zhRoutes, ...enRoutes(enStatic)];
  return [...new Set(all)];
}

/**
 * 路由 -> dist 内的产物文件路径。
 *
 * 采用「扁平 .html」而非「目录 / index.html」：
 *   /about              -> dist/about.html
 *   /works/geo-xxx      -> dist/works/geo-xxx.html
 *   /                   -> dist/index.html
 *
 * 原因：Cloudflare Pages 对 `foo/index.html` 的规范地址是带斜杠的 `/foo/`，
 * 会把 `/foo` 308 跳到 `/foo/`；而本站 sitemap、canonical、站内链接用的全是
 * 无斜杠形式，于是爬虫每抓一个 URL 都先吃一次 308 —— 这正是百度抓取诊断
 * 标记「有跳转」的直接原因。改成 `foo.html` 后，无斜杠 URL 直接 200。
 *
 * 另：路径里的中文标签必须 decode 后落盘（dist/tag/地理.html）。
 * 之前写成了字面量 `dist/tag/%E5%9C%B0%E7%90%86/`，Cloudflare 解码请求路径后
 * 匹配不到该文件，导致所有 /tag/* 都落进 SPA 兜底、返回首页内容。
 */
export function routeToFile(dist, route) {
  if (route === '/') return join(dist, 'index.html');
  const segments = route.replace(/^\/+/, '').split('/').map(decodeSegment);
  const last = `${segments.pop()}.html`;
  return join(dist, ...segments, last);
}

function decodeSegment(seg) {
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}
