// 静态站点预渲染（SSG）脚本。
// 用法：在 `vite build` 之后运行。它通过 Vite 的 SSR 能力把每个路由渲染成
// 完整 HTML，并写入 dist/<route>/index.html，使搜索引擎与 AdSense 爬虫直接
// 拿到带真实文本内容的静态页面（无需执行 JS）。
//
// 依赖仅来自项目已有的 vite / react-dom / react-router-dom，无需额外安装。

import { createServer } from 'vite';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

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

try {
  const { getAllDetailPaths } = await vite.ssrLoadModule('/src/lib/content.ts');
  const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');

  const staticRoutes = [
    '/',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/works',
    '/articles',
    '/tools',
    '/subdomains',
  ];
  const allRoutes = [...staticRoutes, ...getAllDetailPaths()];

  const template = readFileSync(join(DIST, 'index.html'), 'utf-8');

  let ok = 0;
  let fail = 0;

  for (const url of allRoutes) {
    try {
      const { html, head } = await render(url);
      let out = template;
      // 移除模板默认 SEO 标签，避免与页面级 head（PageMeta 注入）重复。
      out = out.replace(/<title>[\s\S]*?<\/title>/gi, '');
      out = out.replace(/<meta\s+name="(title|description)"[^>]*>/gi, '');
      out = out.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '');
      out = out.replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');
      out = out.replace(/<link\s+rel="canonical"[^>]*>/gi, '');
      if (head) out = out.replace('</head>', `${head}\n</head>`);
      out = out.replace(
        '<div id="root"></div>',
        `<div id="root">${html}</div>`
      );

      const outDir = url === '/' ? DIST : join(DIST, url);
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, 'index.html'), out, 'utf-8');
      console.log(`[prerender] ✓ ${url}`);
      ok++;
    } catch (err) {
      console.error(`[prerender] ✗ ${url}`, err);
      fail++;
    }
  }

  console.log(`[prerender] 完成：成功 ${ok}，失败 ${fail}`);
  if (fail > 0) process.exitCode = 1;
} finally {
  await vite.close();
}
