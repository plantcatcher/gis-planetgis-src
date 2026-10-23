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

// ⚠️ 模板必须是 vite build 刚产出的空壳。
// buildHtml() 靠 `<div id="root"></div>` 这一处替换把 SSR 内容注入模板；
// prerender 结束会把首页写回 dist/index.html（此时 #root 已装满 Navbar / Footer / 首页正文），
// 若紧接着再跑一次 prerender，替换就会失配 —— 结果是**整份首页**被当成模板套到每一个页面，
// 于是所有页面顶部都残留一份站点导航栏与搜索面板 DOM（2026-10-15 实测踩坑）。
// 这里提前拦截，让人一眼看到「先重跑 vite build」而不是产出被污染的站点。
if (!readFileSync(join(DIST, 'index.html'), 'utf-8').includes('<div id="root"></div>')) {
  console.error('[prerender] dist/index.html 的 #root 已被预渲染内容填充，不是 vite build 的空壳。');
  console.error('[prerender] prerender 必须紧跟 vite build 只跑一次：先执行 npx vite build 再重跑本脚本。');
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

// ===== 正文 chunk 预载（modulepreload）=====
// 详情页正文不在主 bundle 里（见 src/lib/content.ts 的 loadBody）。默认链路是
// 「下载 main bundle → 执行 → 才知道该下载哪个正文 chunk → 再下载」，串行两跳，
// hydration 因此要多等一个网络往返。预渲染时我们已经知道当前页是哪一篇，
// 可以直接在 head 写 <link rel="modulepreload">：浏览器解析 HTML 时就开始下载该 chunk，
// 与 main bundle 并行，省掉这一跳。查不到映射就降级为不注入，不影响页面本身。
const MANIFEST_CANDIDATES = [join(DIST, '.vite', 'manifest.json'), join(DIST, 'manifest.json')];

function readManifest() {
  for (const p of MANIFEST_CANDIDATES) {
    if (!existsSync(p)) continue;
    try {
      return JSON.parse(readFileSync(p, 'utf-8'));
    } catch {
      /* 读不到就当没有，后面静默降级 */
    }
  }
  return null;
}

/** manifest -> 「content/<folder>/<filename>.md」到产物 chunk 的映射 */
function buildBodyChunkMap(manifest) {
  const map = new Map();
  for (const [key, entry] of Object.entries(manifest || {})) {
    if (!entry || !entry.file) continue;
    const m = /(?:^|\/)content\/([^/]+)\/([^/]+)\.md(?:\?raw)?$/.exec(key);
    if (m) map.set(`${m[1]}/${m[2]}`, `/${String(entry.file).replace(/^\/+/, '')}`);
  }
  return map;
}

/** content-index -> 「<folder>/<slug>」到「<folder>/<filename>」的映射（slug 与文件名可能不同） */
function buildSlugToFile() {
  const map = new Map();
  try {
    const idx = JSON.parse(readFileSync(join(ROOT, 'src/data/content-index.json'), 'utf-8'));
    for (const row of idx) {
      const slug = (row.fm && row.fm.slug) || row.filename;
      map.set(`${row.folder}/${slug}`, `${row.folder}/${row.filename}`);
    }
  } catch {
    /* 同上，降级 */
  }
  return map;
}

const bodyChunkMap = buildBodyChunkMap(readManifest());
const slugToFileMap = buildSlugToFile();
let preloadCount = 0;

if (!bodyChunkMap.size) {
  console.warn('[prerender] 未取到正文 chunk 映射，本次不注入 modulepreload（页面照常产出）');
}

/** 详情页 URL -> <link rel="modulepreload">；非详情页或查不到映射时返回空串 */
function modulePreloadTag(url) {
  // 英文详情页带 /en 前缀，先剥掉再匹配——正文 chunk 映射是按中文档案名建的，与语言无关
  const bare = url === '/en' ? '/' : url.startsWith('/en/') ? url.slice(3) : url;
  const m = /^\/(works|maps|games|tools|articles|learn|downloads)\/([^/]+?)\/?$/.exec(bare);
  if (!m) return '';
  let slug = m[2];
  try {
    slug = decodeURIComponent(slug);
  } catch {
    /* 非法编码按原样查 */
  }
  const fileKey = slugToFileMap.get(`${m[1]}/${slug}`);
  const file = fileKey && bodyChunkMap.get(fileKey);
  if (!file) return '';
  preloadCount++;
  return `<link rel="modulepreload" href="${file}" />`;
}

/** 用页面级 head 替换模板里的默认 SEO 标签，并把正文塞进 #root */
function buildHtml(template, { html, head, lang }, { noindex = false, preload = '' } = {}) {
  let out = template;

  // 英文页必须把 <html lang> 与 <meta name="language"> 一起改成 en：
  // 屏幕阅读器按 lang 选发音规则，浏览器也据此决定是否弹出「翻译此页」，
  // 留着 zh-CN 会让英文正文被当成中文朗读。
  if (lang === 'en') {
    out = out.replace(/(<html\s+lang=")[^"]*(")/i, '$1en$2');
    out = out.replace(
      /(<meta\s+name="language"\s+content=")[^"]*(")/i,
      '$1en$2',
    );
  }

  // 移除模板默认 SEO 标签，避免与页面级 head（PageMeta 注入）重复。
  out = out.replace(/<title>[\s\S]*?<\/title>/gi, '');
  out = out.replace(/<meta\s+name="(title|description)"[^>]*>/gi, '');
  out = out.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '');
  out = out.replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');
  out = out.replace(/<link\s+rel="canonical"[^>]*>/gi, '');

  let injected = head;
  if (preload) injected = injected ? `${injected}\n${preload}` : preload;
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
  const { render, preloadRoute } = await vite.ssrLoadModule('/src/entry-server.tsx');
  const template = readFileSync(join(DIST, 'index.html'), 'utf-8');

  let ok = 0;
  let fail = 0;

  for (const url of routes) {
    try {
      // 正文按篇懒加载（见 src/lib/content.ts）：渲染前先把当前路由的正文预载好，
      // 否则 renderToString 拿到的是空正文，产出「零正文页面」。
      await preloadRoute(url);
      const rendered = await render(url);
      // tag 聚合页属薄内容：正文仅数百~两千字，且与所属文章高度重合，
      // 全站 858 条曾占 sitemap 的 71%，会吃掉抓取配额、拉低整站质量信号。
      // 站内导航照常链接这些页，只是对搜索引擎输出 noindex, follow 并移出 sitemap。
      const isTagPage = url.startsWith('/tag/');

      // 互动地图全屏壳页（/maps/<slug>/full）：页面正文只有一张 iframe 地图，
      // 预渲染出来是零文字的空壳，与 /maps/<slug> 介绍页又是同一内容的两个 URL。
      // 对它输出 noindex, follow，既是避免「零正文页面」的负面信号，
      // 也是让权重集中到真正有内容的 /maps/<slug>。
      //
      // ⚠️ 只匹配壳页这一层（多一级 /full）：/maps/<slug>/catalog 与 /maps/<slug>/libraries/*
      //    是地图自带的静态内容页（有实质正文的长尾落地页），必须保持可索引。
      const isMapShell = /^\/maps\/[^/]+\/full\/?$/.test(url);

      const out = buildHtml(template, rendered, {
        noindex: isTagPage || isMapShell,
        preload: modulePreloadTag(url),
      });
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

  console.log(`[prerender] 完成：成功 ${ok}，失败 ${fail}；注入 modulepreload ${preloadCount} 页`);
  if (fail > 0) process.exitCode = 1;
} finally {
  await vite.close();
}
