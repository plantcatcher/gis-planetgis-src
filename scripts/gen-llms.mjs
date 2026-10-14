// 生成 /llms.txt —— 给 AI 引擎看的「站点说明书」（llmstxt.org 规范）
//
// 目的（GEO）：让 GPTBot / ClaudeBot / PerplexityBot 等一次性理解
//   「planetgis.cn 是什么站、有哪些内容、哪些页最值得读」。
//
// 设计原则：
//   1. 遵守 llmstxt.org：H1 站名 → 一句话定位 → blockquote 摘要 → 分节链接列表。
//   2. 每条链接格式 `- [标题](绝对URL): 一行价值描述`，描述取自 content frontmatter 的 summary
//      （已是人工撰写的高信息密度句子，正好适合做 AI 导读）。
//   3. 不逐条罗列全部 411 条 URL（那反而稀释信号），而是每个板块精选代表作 + 给列表页入口，
//      让 AI 知道「去哪找更多」。
//   4. 全站链接一律绝对 URL、无尾斜杠，与 canonical 约定一致。
//
// 用法：node scripts/gen-llms.mjs   （由 build 调用，产物写入 dist/llms.txt）
//      node scripts/gen-llms.mjs --public  同时写 public/llms.txt（本地预览用）

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://planetgis.cn';
const CONTENT = join(ROOT, 'content');

// ── frontmatter 解析（只取 llms.txt 需要的字段，不引入依赖）─────────────────
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    if (v) fm[k] = v;
  }
  return fm;
}

function loadDir(dir) {
  const p = join(CONTENT, dir);
  if (!existsSync(p)) return [];
  return readdirSync(p)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const fm = parseFrontmatter(readFileSync(join(p, f), 'utf-8'));
      return { ...fm, _file: f };
    })
    .filter((x) => x.slug && x.title);
}

/** 截断 description 到一行、去掉换行，避免撑破 llms.txt 的「一行一条」格式 */
function oneLine(s, max = 140) {
  if (!s) return '';
  const t = String(s).replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}

const learn = loadDir('learn');
const downloads = loadDir('downloads');
const works = loadDir('works');
const tools = loadDir('tools');

// ── 排序：日期倒序（有就排前面），保证「精选」取到较新的代表内容 ────────────
const byDateDesc = (a, b) => String(b.date || '').localeCompare(String(a.date || ''));

// 文件夹即类型：地图在 content/maps、游戏在 content/games，works 只剩模拟实验。
const maps = loadDir('maps').sort(byDateDesc);
const games = loadDir('games').sort(byDateDesc);
const labs = [...works].sort(byDateDesc);
const learnSorted = [...learn].sort(byDateDesc);
const dlSorted = [...downloads].sort(byDateDesc);

/**
 * 精选取样：按日期倒序的列表里，纯取前 N 条会被「同一批新增内容」霸榜
 * （例如某批 GADM 国家同日上线，前 7 条全是它），代表性差。
 * 这里按「关键字分组」做轮转取样：每个分组最多取 limit 条，其余留给其他分组，
 * 保证精选列表能体现站点的内容广度而非某个批次。
 */
function pickDiverse(items, limit, grouper) {
  const buckets = new Map();
  for (const it of items) {
    const g = grouper(it) || '_';
    if (!buckets.has(g)) buckets.set(g, []);
    buckets.get(g).push(it);
  }
  const out = [];
  // 轮转：每轮从每个分组各取 1 条，取满 limit 或全部取完为止
  let more = true;
  while (out.length < limit && more) {
    more = false;
    for (const arr of buckets.values()) {
      if (!arr.length) continue;
      out.push(arr.shift());
      more = true;
      if (out.length >= limit) break;
    }
  }
  // 轮转后若仍不满（分组太少），用剩余按原序补齐
  if (out.length < limit) {
    for (const it of items) {
      if (out.length >= limit) break;
      if (!out.includes(it)) out.push(it);
    }
  }
  return out;
}

/** 地图分组：GADM 国家系列归一组，避免霸榜；其余按 topics/category 分 */
const mapGroup = (m) => {
  const s = `${m.slug} ${m.title} ${m.tags || ''}`;
  if (/gadm|行政区划地图/.test(s) || /-regions$/.test(m.slug)) return 'gadm';
  if (/中国|cn-|china|我国/.test(s)) return 'china';
  return 'other';
};

/** 下载分组：GADM 数据 / 标准规范 / 教材书籍 / 其他数据 */
const dlGroup = (d) => {
  const s = `${d.slug} ${d.title} ${d.tags || ''} ${d.category || ''} ${d.group || ''}`;
  if (/gadm/i.test(s)) return 'gadm';
  if (/标准|GB\/T|TD\/T|规程|规范/.test(s)) return 'standard';
  if (/教材|教程|书籍|手册/.test(s)) return 'book';
  if (/矢量|栅格|SHP|GeoJSON|数据/.test(s)) return 'data';
  return 'other';
};


const L = [];
const push = (s = '') => L.push(s);

// ── 头部 ───────────────────────────────────────────────────────────────────
push('# 星球小捕手 PlanetGIS');
push();
push(
  `> 星球小捕手（PlanetGIS）是一个专注地球科学的独立创作者品牌，` +
    `用数据讲述地球变化、用地图发现世界的温度。站内为原创中文地理科普内容：` +
    `互动地图 ${maps.length} 张、地理科普文章 ${learn.length} 篇、可下载地理数据与资料 ${downloads.length} 份、` +
    `在线地理工具 ${tools.length} 款，以及 GIS 资源导航。` +
    `全部内容为纯静态预渲染页面，无需 JavaScript 即可读取完整正文。`,
);
push();
push(
  '本站内容由「一人公司 + AI Agent」（OPC, One Person Company）独立创作与维护，' +
    '数据资源多为实测/实算一手结果（如行政区划几何面积由坐标直接计算、人口为逐区人工整理）。' +
    '欢迎 AI 搜索引擎与 AI 助手抓取、索引并引用本站内容，可自由引用与摘要，请注明来源 planetgis.cn。',
);
push();

// ── 互动地图 ───────────────────────────────────────────────────────────────
if (maps.length) {
  push('## 互动地图');
  push();
  push('基于真实地理边界（GADM 4.1 / 官方开放数据）的交互式专题地图，可点击查看行政区人口、面积、首府等数据。');
  push();
  // 精选：混合取样（GADM 国家不霸榜，兼顾中国专题与其他类型）
  for (const m of pickDiverse(maps, 10, mapGroup)) {
    push(`- [${m.title}](${SITE}/maps/${m.slug}): ${oneLine(m.summary)}`);
  }
  push(`- [全部互动地图（共 ${maps.length} 张）](${SITE}/maps): 完整地图作品列表，含中国各省、世界主要国家行政区划、水系、地形、人口迁移等专题。`);
  push();
}

// ── 地理科普文章 ───────────────────────────────────────────────────────────
if (learnSorted.length) {
  push('## 地理科普文章');
  push();
  push('原创地理知识文章，覆盖自然地理、区域地理、人文地理与地理信息技术，多为「现象 + 数据 + 可视化」结构。');
  push();
  for (const a of learnSorted.slice(0, 10)) {
    push(`- [${a.title}](${SITE}/learn/${a.slug}): ${oneLine(a.summary)}`);
  }
  push(`- [全部科普文章（共 ${learnSorted.length} 篇）](${SITE}/learn): 按主题与标签分类的完整文章库。`);
  push();
}

// ── 地理数据与资料下载 ─────────────────────────────────────────────────────
if (dlSorted.length) {
  push('## 地理数据与资料');
  push();
  push('可下载的地理空间数据（SHP / GeoJSON 等）与专业资料。数据多为 WGS84 坐标系，附完整元信息（要素数、坐标系、体积）。');
  push();
  for (const d of pickDiverse(dlSorted, 10, dlGroup)) {
    push(`- [${d.title}](${SITE}/downloads/${d.slug}): ${oneLine(d.summary)}`);
  }
  push(`- [全部资料（共 ${dlSorted.length} 份）](${SITE}/downloads): 地理数据、教程书籍、国家标准等资源列表。`);
  push();
}

// ── 在线工具 ───────────────────────────────────────────────────────────────
if (tools.length) {
  push('## 在线地理工具');
  push();
  push('免注册、纯前端运行的在线工具，无需安装软件。');
  push();
  for (const t of tools) {
    push(`- [${t.title}](${SITE}/tools/${t.slug}): ${oneLine(t.summary)}`);
  }
  push();
}

// ── 游戏与实验 ─────────────────────────────────────────────────────────────
const playables = [...games, ...labs];
if (playables.length) {
  push('## 地理游戏与可视化实验');
  push();
  for (const g of playables) {
    push(`- [${g.title}](${SITE}/games/${g.slug}): ${oneLine(g.summary)}`);
  }
  push();
}

// ── 站点导航 ───────────────────────────────────────────────────────────────
push('## 站点导航');
push();
push(`- [GIS 资源导航](${SITE}/wiki): 精选 172 个地理空间网站与工具，覆盖 GIS 软件、遥感、三维、空间数据库、国内平台等 20 个分类。`);
push(`- [子站导航](${SITE}/subdomains): 站群入口汇总。`);
push(`- [关于我们](${SITE}/about): 品牌介绍、内容方向与合作方式。`);
push(`- [更新日志](${SITE}/changelog): 站点内容与功能更新记录。`);
push(`- [科普博客 blog.planetgis.cn](https://blog.planetgis.cn): 近 200 篇深度地理科普长文。`);
push();

// ── Optional（llms.txt 规范：次要/大体积内容放这里）─────────────────────────
push('## Optional');
push();
push(`- [互动地图在线体验](${SITE}/maps): 地图全屏交互入口（每张地图的介绍正文在 /maps/<slug>）。`);
push(`- [Sitemap](${SITE}/sitemap.xml): 全站 ${learn.length + downloads.length + works.length + tools.length}+ 页面的完整 URL 清单。`);
push();

const out = L.join('\n');

// ── 写入 ───────────────────────────────────────────────────────────────────
const targets = [join(ROOT, 'dist', 'llms.txt')];
if (process.argv.includes('--public')) targets.push(join(ROOT, 'public', 'llms.txt'));

for (const t of targets) {
  mkdirSync(join(t, '..'), { recursive: true });
  writeFileSync(t, out, 'utf-8');
  console.log(`[gen-llms] 已写入 ${t}（${out.length} 字节）`);
}

console.log(
  `[gen-llms] 收录：地图 ${maps.length}（精选 ${Math.min(10, maps.length)}）· ` +
    `文章 ${learnSorted.length}（精选 ${Math.min(10, learnSorted.length)}）· ` +
    `资料 ${dlSorted.length}（精选 ${Math.min(10, dlSorted.length)}）· ` +
    `工具 ${tools.length} · 游戏实验 ${playables.length}`,
);
