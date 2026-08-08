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
