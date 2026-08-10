// 构建后自检：校验 dist 内每个 HTML 的 canonical、预渲染正文与客户端跳转代码。
// 目的：把「百度抓取显示有跳转 / 正文空壳」这类问题在构建阶段就拦下来。
//
// 用法：node scripts/check-seo.mjs   （npm run build 末尾自动执行）
// 退出码非 0 表示有致命问题。

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const SITE = 'https://planetgis.cn';

if (!existsSync(DIST)) {
  console.error('[check-seo] 未找到 dist/，请先运行构建。');
  process.exit(1);
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

/** dist 内文件路径 -> 线上 URL 路径（扁平 .html 输出约定） */
function fileToUrlPath(file) {
  let rel = relative(DIST, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/\.html$/, '');
}

const files = walk(DIST);
const errors = [];
const warnings = [];

for (const file of files) {
  const rel = relative(DIST, file).split(sep).join('/');
  const html = readFileSync(file, 'utf-8');
  const urlPath = fileToUrlPath(file);

  // 404 页不参与 canonical / 正文校验
  if (rel === '404.html') continue;

  // 游戏内嵌静态资源（public/geoquiz|geoshape|geotype 复制而来）与游戏壳页
  // 不是主站 React 路由，其结构（无 #root、canonical 指向子域、正文为游戏自身）
  // 不应参与主站 SEO 校验，否则会误报并使构建失败。
  if (/^(geoquiz|geoshape|geotype)/.test(rel)) continue;

  // 1) canonical 必须存在、必须是 ASCII 绝对地址、必须与自身路径一致（自引用）
  const canonical = (html.match(/rel="canonical"[^>]*href="([^"]*)"/) || [])[1];
  if (!canonical) {
    errors.push(`${rel}: 缺少 canonical`);
  } else {
    const expected = SITE + (urlPath === '/' ? '/' : urlPath);
    const decoded = decodeURIComponent(canonical);
    const expectedDecoded = decodeURIComponent(expected);
    if (decoded !== expectedDecoded) {
      errors.push(`${rel}: canonical 不自引用\n      实际=${canonical}\n      期望=${expected}`);
    }
  }

  // 2) body 里必须有真实预渲染 DOM（不能是空壳）
  const rootStart = html.indexOf('<div id="root">');
  if (rootStart === -1) {
    errors.push(`${rel}: 找不到 #root 容器`);
  } else if (html.slice(rootStart).startsWith('<div id="root"></div>')) {
    errors.push(`${rel}: #root 为空壳，正文未预渲染（爬虫将读不到任何内容）`);
  }

  // body 去掉 script/style/注释后的纯文本长度，确保不执行 JS 也能读到正文
  const body = html.slice(html.indexOf('<body'), html.lastIndexOf('</body>'));
  const text = body
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length < 300) {
    errors.push(`${rel}: body 纯文本仅 ${text.length} 字符，正文未预渲染`);
  }

  // 3) 预渲染 DOM 里不允许出现初始隐藏样式
  //    （framer-motion 的 initial={{opacity:0}} 会被渲染成 style="opacity:0"，
  //     关闭 JS 或脚本加载失败时这些内容在 DOM 里却看不见。改用 initial={false}）
  const hiddenInline = body.match(/style="[^"]*(?:opacity:0[^.\d]|visibility:hidden|display:none)[^"]*"/g);
  if (hiddenInline) {
    errors.push(
      `${rel}: 预渲染 DOM 含 ${hiddenInline.length} 处初始隐藏内联样式（无 JS 时不可见），` +
        `请把对应 motion 组件的 initial 改为 false。示例：${hiddenInline[0].slice(0, 60)}`,
    );
  }

  // 4) 页面 HTML 内不得含自动客户端跳转
  if (/<meta[^>]+http-equiv=["']?refresh/i.test(html)) {
    errors.push(`${rel}: 含 meta refresh 跳转`);
  }
  const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1])
    .join('\n');
  if (/location\s*(\.\s*(href|assign|replace)\s*(=|\()|=)/.test(inlineScripts)) {
    errors.push(`${rel}: 内联脚本含 location 跳转`);
  }
}

// 4) 打包后的 JS 里不应残留整页跳转（location.href = / location.assign / location.replace）
const assetsDir = join(DIST, 'assets');
if (existsSync(assetsDir)) {
  for (const name of readdirSync(assetsDir)) {
    if (!name.endsWith('.js')) continue;
    const code = readFileSync(join(assetsDir, name), 'utf-8');
    const hits = code.match(/location\.(href\s*=|assign\(|replace\()/g);
    if (hits) {
      warnings.push(`assets/${name}: 检测到 ${hits.length} 处 location 跳转写法（第三方库可能误报，请人工确认）`);
    }
  }
}

// 5) sitemap 中的每条 URL 必须能在 dist 里找到对应文件（避免 sitemap 指向 404/跳转）
const sitemapPath = join(DIST, 'sitemap.xml');
if (existsSync(sitemapPath)) {
  const xml = readFileSync(sitemapPath, 'utf-8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const known = new Set(files.map(fileToUrlPath));
  for (const loc of locs) {
    if (!loc.startsWith(SITE)) {
      errors.push(`sitemap: ${loc} 不是 ${SITE} 开头`);
      continue;
    }
    const p = decodeURIComponent(loc.slice(SITE.length)) || '/';
    const hit = [...known].some((k) => decodeURIComponent(k) === p);
    if (!hit) errors.push(`sitemap: ${loc} 在 dist 中没有对应静态文件`);
  }
  console.log(`[check-seo] sitemap 条目 ${locs.length} 条`);
}

console.log(`[check-seo] 扫描 HTML ${files.length} 个`);
for (const w of warnings) console.warn(`[check-seo] ! ${w}`);
if (errors.length) {
  console.error(`[check-seo] 发现 ${errors.length} 个问题：`);
  for (const e of errors) console.error(`   ✗ ${e}`);
  process.exit(1);
}
console.log('[check-seo] ✓ 全部通过：canonical 自引用、正文已预渲染、无客户端跳转、sitemap 与产物一致');
