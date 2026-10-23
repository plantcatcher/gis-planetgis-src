// 全站路由清单的唯一来源：prerender.mjs 与 gen-sitemap.mjs 共用。
// 以前两份脚本各维护一份 staticRoutes，导致 /changelog 只进了 sitemap 却没被预渲染。

import { join } from 'node:path';
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
];

/**
 * 暂不出英文版的路由。
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

/**
 * 汇总全部需要预渲染 / 进 sitemap 的路由（已去重）。
 * @param {import('vite').ViteDevServer} vite 用于 ssrLoadModule 读取内容层
 */
export async function collectRoutes(vite) {
  patchSsrLoadModuleTimeout(vite);
  const { getAllDetailPaths, getAllTagPaths } = await vite.ssrLoadModule('/src/lib/content.ts');
  // 互动地图全屏壳页也需预渲染，否则直接访问 /maps/<slug> 会落到 404.html
  const { getVizMapPaths } = await vite.ssrLoadModule('/src/lib/vizmaps.ts');
  const zhRoutes = [...staticRoutes, ...getAllDetailPaths(), ...getAllTagPaths(), ...getVizMapPaths()];
  // 英文版目前只预渲染静态页与列表页：内容详情页的英文版要等 content/en/ 建好
  // 才有实际内容，提前预渲染只会产出「英文外壳 + 中文正文」的重复页面。
  const all = [...zhRoutes, ...enRoutes(staticRoutes)];
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
