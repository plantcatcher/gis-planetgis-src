// 全站路由清单的唯一来源：prerender.mjs 与 gen-sitemap.mjs 共用。
// 以前两份脚本各维护一份 staticRoutes，导致 /changelog 只进了 sitemap 却没被预渲染。

import { join } from 'node:path';

/** 站点 baseURL —— 与 src/lib/seo.tsx 的 SITE 保持一致 */
export const SITE = 'https://planetgis.cn';

/** 不依赖内容文件的固定路由 */
export const staticRoutes = [
  '/',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms',
  '/works',
  '/articles',
  '/learn',
  '/tools',
  '/subdomains',
  '/changelog',
];

/**
 * 汇总全部需要预渲染 / 进 sitemap 的路由（已去重）。
 * @param {import('vite').ViteDevServer} vite 用于 ssrLoadModule 读取内容层
 */
export async function collectRoutes(vite) {
  const { getAllDetailPaths, getAllTagPaths } = await vite.ssrLoadModule('/src/lib/content.ts');
  const all = [...staticRoutes, ...getAllDetailPaths(), ...getAllTagPaths()];
  return [...new Set(all)];
}

/**
 * 路由 -> 线上规范 URL（带末尾斜杠）。
 *
 * Cloudflare Pages 对扁平 `.html` 产物实际以「带尾斜杠」形式返回 200
 * （把 `/about` 308 跳到 `/about/` 后再读 about.html）。所以 sitemap、
 * canonical、站内链接都必须用带尾斜杠的地址，与 CF 实际 200 的 URL 一致，
 * 避免爬虫每抓一个 URL 都先吃一次 308（百度抓取诊断的「有跳转」标记）。
 */
export function routeToUrl(route) {
  if (route === '/' || route === '') return `${SITE}/`;
  let p = route.startsWith('/') ? route : `/${route}`;
  p = p.split('?')[0].split('#')[0];
  if (!p.endsWith('/')) p = `${p}/`;
  return `${SITE}${p}`;
}

/**
 * 路由 -> dist 内的产物文件路径（扁平 .html）。
 *   /about              -> dist/about.html
 *   /works/geo-xxx      -> dist/works/geo-xxx.html
 *   /                   -> dist/index.html
 *
 * 注意：文件仍是扁平 `.html`，但线上访问地址是带尾斜杠的 /about/（见 routeToUrl）。
 *
 * 路径里的中文标签必须 decode 后落盘（dist/tag/地理.html）。
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
