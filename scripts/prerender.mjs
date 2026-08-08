// 静态站点预渲染（SSG）脚本。
// 用法：在 `vite build` 之后运行。它通过 Vite 的 SSR 能力把每个路由渲染成
// 完整 HTML，使搜索引擎与 AdSense 爬虫无需执行 JS 就能拿到带真实正文的页面。
//
// 产物形态为「扁平 .html」（dist/about.html），理由见 scripts/site-routes.mjs
// 中 routeToFile() 的注释：避免 Cloudflare Pages 的斜杠归一化 308。
//
// 依赖仅来自项目已有的 vite / react-dom / react-router-dom，无需额外安装。

import { createServer } from 'vite';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { collectRoutes, routeToFile } from './site-routes.mjs';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('[prerender] 未找到 dist/index.html，请先运行 vite build。');
  process.exit(1);
}

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'warn',
  // 与可能正在运行的 `npm run dev` 隔离依赖缓存，避免 react 单例被并发优化破坏
  // （表现为 SSR 渲染报 "Cannot read properties of null (reading 'useState')"）。
  cacheDir: '.vite-prerender',
});

/** 用页面级 head 替换模板里的默认 SEO 标签，并把正文塞进 #root */
function buildHtml(template, { html, head }, { noindex = false } = {}) {
  let out = template;
  // 移除模板默认 SEO 标签，避免与页面级 head（PageMeta 注入）重复。
  out = out.replace(/<title>[\s\S]*?<\/title>/gi, '');
  out = out.replace(/<meta\s+name="(title|description)"[^>]*>/gi, '');
  out = out.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '');
  out = out.replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');
  out = out.replace(/<link\s+rel="canonical"[^>]*>/gi, '');

  let injected = head;
  if (noindex) {
    // 404 页不应被索引，也不需要 canonical（否则会指向占位路由）
    injected = injected.replace(/<link rel="canonical"[^>]*>/gi, '');
    injected = injected.replace(/<meta property="og:url"[^>]*>/gi, '');
    out = out.replace(
      /<meta\s+name="robots"[^>]*>/gi,
      '<meta name="robots" content="noindex, follow" />',
    );
  }
  if (injected) out = out.replace('</head>', `${injected}\n</head>`);
  return out.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
}

try {
  const routes = await collectRoutes(vite);
  const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');
  const template = readFileSync(join(DIST, 'index.html'), 'utf-8');

  let ok = 0;
  let fail = 0;

  for (const url of routes) {
    try {
      const rendered = await render(url);
      const out = buildHtml(template, rendered);
      const file = routeToFile(DIST, url);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, out, 'utf-8');
      console.log(`[prerender] ✓ ${url}  ->  ${relative(ROOT, file)}`);
      ok++;
    } catch (err) {
      console.error(`[prerender] ✗ ${url}`, err);
      fail++;
    }
  }

  // 404 页：Cloudflare Pages 会自动用 dist/404.html 响应未命中的路径。
  // 有了它就不再需要 `/* /index.html 200` 这条 SPA 兜底规则
  //（那条规则会让任意不存在的地址都返回 200 + 首页内容，形成软 404 与重复内容）。
  try {
    const rendered = await render('/__not-found__');
    writeFileSync(
      join(DIST, '404.html'),
      buildHtml(template, rendered, { noindex: true }),
      'utf-8',
    );
    console.log('[prerender] ✓ 404.html');
    ok++;
  } catch (err) {
    console.error('[prerender] ✗ 404.html', err);
    fail++;
  }

  console.log(`[prerender] 完成：成功 ${ok}，失败 ${fail}`);
  if (fail > 0) process.exitCode = 1;
} finally {
  await vite.close();
}
