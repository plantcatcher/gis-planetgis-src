// 构建期自动生成 sitemap.xml 到 dist/，覆盖所有静态路由、内容详情页与标签专题页。
// 每次构建都重新生成，自动纳入新增的 /learn 与 /tag/* 页面，并把 lastmod 设为当天，
// 彻底取代之前手写、易漏页的 public/sitemap.xml。
//
// 依赖仅来自项目已有的 vite，与 prerender.mjs 同源加载方式。

import { createServer } from 'vite';
import { writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const SITE = 'https://planetgis.cn';

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

const staticRoutes = [
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

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'warn',
  cacheDir: '.vite-prerender',
});

try {
  const { getAllDetailPaths, getAllTagPaths } = await vite.ssrLoadModule('/src/lib/content.ts');
  const today = new Date().toISOString().slice(0, 10);

  const urls = [...staticRoutes, ...getAllDetailPaths(), ...getAllTagPaths()];
  const seen = new Set();
  const entries = [];

  for (const u of urls) {
    if (seen.has(u)) continue;
    seen.add(u);
    const isDetail =
      u.startsWith('/works/') ||
      u.startsWith('/tools/') ||
      u.startsWith('/articles/') ||
      u.startsWith('/learn/') ||
      u.startsWith('/tag/');
    const priority = isDetail ? 0.7 : STATIC_PRIORITY[u] ?? 0.6;
    entries.push(
      `  <url>\n    <loc>${SITE}${u}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`,
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

  if (!existsSync(DIST)) {
    console.error('[sitemap] 未找到 dist/，请先运行 vite build。');
    process.exit(1);
  }
  writeFileSync(join(DIST, 'sitemap.xml'), xml, 'utf-8');
  console.log(`[sitemap] 生成 ${entries.length} 条 -> dist/sitemap.xml`);
} finally {
  await vite.close();
}
