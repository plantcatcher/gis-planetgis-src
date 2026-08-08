// 构建期自动生成 sitemap.xml 到 dist/，覆盖所有静态路由、内容详情页与标签专题页。
// 路由清单与 prerender.mjs 共用 scripts/site-routes.mjs，保证 sitemap 里的每条 URL
// 在 dist 里都有对应的静态产物（不会指向 404 或 3xx）。
//
// URL 一律使用「无末尾斜杠」形式，与扁平 .html 产物、页面 canonical 完全一致，
// 爬虫抓 sitemap 时直接命中 200，不会经过 Cloudflare Pages 的斜杠归一化 308。

import { createServer } from 'vite';
import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { collectRoutes, SITE } from './site-routes.mjs';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');

// 列表/首页等静态路由的固定优先级
const STATIC_PRIORITY = {
  '/': 1.0,
  '/learn': 0.9,
  '/articles': 0.8,
  '/works': 0.8,
  '/tools': 0.8,
  '/about': 0.7,
  '/subdomains': 0.6,
  '/changelog': 0.5,
  '/contact': 0.5,
  '/privacy-policy': 0.3,
  '/terms': 0.3,
};

if (!existsSync(DIST)) {
  console.error('[sitemap] 未找到 dist/，请先运行 vite build。');
  process.exit(1);
}

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'warn',
  cacheDir: '.vite-prerender',
});

try {
  const routes = await collectRoutes(vite);
  const today = new Date().toISOString().slice(0, 10);
  const entries = [];

  for (const u of routes) {
    const isDetail =
      u.startsWith('/works/') ||
      u.startsWith('/tools/') ||
      u.startsWith('/articles/') ||
      u.startsWith('/learn/') ||
      u.startsWith('/tag/');
    const priority = isDetail ? 0.7 : (STATIC_PRIORITY[u] ?? 0.6);
    entries.push(
      `  <url>\n    <loc>${SITE}${u}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`,
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

  writeFileSync(join(DIST, 'sitemap.xml'), xml, 'utf-8');
  console.log(`[sitemap] 生成 ${entries.length} 条 -> dist/sitemap.xml`);
} finally {
  await vite.close();
}
