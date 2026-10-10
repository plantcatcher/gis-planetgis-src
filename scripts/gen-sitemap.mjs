// 构建期自动生成 sitemap.xml 到 dist/，覆盖所有静态路由、内容详情页，
// 以及互动地图小网站自带的**馆情介绍页 / 目录页**。
// ⚠️ 标签专题页 /tag/* 已不再收录：它们是薄内容且与其他页面高度重复，
//    曾占全站 1207 条中的 858 条（71%），吃掉抓取配额、拉低整站质量信号。
//    prerender 会对它们输出 noindex, follow，本脚本同步将其排除出 sitemap。
// 路由清单与 prerender.mjs 共用 scripts/site-routes.mjs，保证 sitemap 里的每条 URL
// 在 dist 里都有对应的静态产物（不会指向 404 或 3xx）。
//
// URL 一律使用「无末尾斜杠」形式，与扁平 .html 产物、页面 canonical 完全一致，
// 爬虫抓 sitemap 时直接命中 200，不会经过 Cloudflare Pages 的斜杠归一化 308。

import { createServer } from 'vite';
import { writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { collectRoutes, SITE } from './site-routes.mjs';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');

// 列表/首页等静态路由的固定优先级
const STATIC_PRIORITY = {
  '/': 1.0,
  '/learn': 0.9,
  '/works': 0.8,
  '/tools': 0.8,
  '/games': 0.8,
  '/maps': 0.8,
  '/about': 0.7,
  '/subdomains': 0.6,
  '/changelog': 0.5,
  '/contact': 0.5,
  '/privacy-policy': 0.3,
  '/terms': 0.3,
};

// 互动地图小网站自带的静态内容页：dist/maps/<slug>/libraries/*.html（每馆一篇介绍页）
// 与 dist/maps/<slug>/catalog.html（目录页）。这些是有实质正文的独立页面（长尾词落地页），
// 必须进 sitemap；/maps/<slug> 全屏壳页与地图本体 index.html 则排除。
// 直接扫 dist 而不是写死清单——有哪些产物就收哪些，不会指向不存在的 URL。
//
// ⚠️ URL 一律**去掉 .html 后缀**，与全站无尾斜杠扁平化规范一致（canonical/sitemap/Link 三处统一），
// 也与 check-seo.mjs 的 fileToUrlPath() 期望一致；Cloudflare Pages 对静态 html 支持无后缀直出。
function collectMapContentPages() {
  const mapsDir = join(DIST, 'maps');
  if (!existsSync(mapsDir)) return [];
  const out = [];
  let slugs = [];
  try { slugs = readdirSync(mapsDir, { withFileTypes: true }).filter((d) => d.isDirectory()); } catch (_) { return []; }
  for (const d of slugs) {
    const slug = d.name;
    const dir = join(mapsDir, slug);
    if (existsSync(join(dir, 'catalog.html'))) {
      out.push({ url: `/maps/${slug}/catalog`, priority: 0.5 });
    }
    const libDir = join(dir, 'libraries');
    if (!existsSync(libDir)) continue;
    let files = [];
    try { files = readdirSync(libDir).filter((f) => f.endsWith('.html')); } catch (_) { continue; }
    for (const f of files.sort()) {
      out.push({ url: `/maps/${slug}/libraries/${f.replace(/\.html$/, '')}`, priority: 0.6 });
    }
  }
  return out;
}

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
    // /my 是用户私有学习中心（数据存于本地 LocalStorage），全员返回的是空壳，
    // 不应被搜索引擎收录，故排除出 sitemap（但仍参与预渲染，保证直链可访问）。
    if (u === '/my') continue;

    // /maps/<slug> 是全屏 iframe 壳页，正文只有一张地图，收录价值低；
    // 真正给搜索引擎看的是 /works/<slug> 介绍页，故此处排除。
    // ⚠️ 注意只排除壳页这一层：/maps/<slug>/libraries/*.html 与 catalog.html
    // 是地图小网站自己的内容页（有实质正文），由 collectMapContentPages()单独收录。
    if (u.startsWith('/maps/')) continue;

    // tag 聚合页已由 prerender 输出 noindex, follow（薄内容 + 与文章页高度重复，
    // 曾占全站 1207 条中的 858 条）。noindex 的页面绝不能再出现在 sitemap 里，
    // 否则是互相矛盾的信号；保留页面本身供站内导航使用。
    if (u.startsWith('/tag/')) continue;

    const isDetail =
      u.startsWith('/works/') ||
      u.startsWith('/tools/') ||
      u.startsWith('/learn/');
    const priority = isDetail ? 0.7 : (STATIC_PRIORITY[u] ?? 0.6);
    entries.push(
      `  <url>\n    <loc>${SITE}${u}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`,
    );
  }

  const mapPages = collectMapContentPages();
  for (const m of mapPages) {
    entries.push(
      `  <url>\n    <loc>${SITE}${m.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${m.priority.toFixed(1)}</priority>\n  </url>`,
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

  writeFileSync(join(DIST, 'sitemap.xml'), xml, 'utf-8');
  console.log(`[sitemap] 生成 ${entries.length} 条（含地图内容页 ${mapPages.length} 条）-> dist/sitemap.xml`);
} finally {
  await vite.close();
}
