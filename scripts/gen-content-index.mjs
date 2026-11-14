// 生成 src/data/content-index.json —— 全站内容的「元数据索引」（**不含正文**）。
//
// 背景：本站是 SSG + hydrateRoot，客户端首屏必须渲染出与服务端完全一致的 DOM。
// 过去 content.ts 用 eager glob 把 content/ 下全部 markdown（含正文）打进主 bundle，
// 导致首包约 4.9MB，其中约 4MB 是正文——而首页 / 列表页其实只需要标题、摘要、标签。
//
// 改造后：
//   · 元数据索引（本脚本产物）常驻 bundle，只含轻量字段；
//   · 正文按篇拆成独立 chunk，由 content.ts 的 loadBody() 在「该路由需要时」加载
//     （客户端 hydration 前、预渲染每条路由前各预载一次，保证 DOM 一致）。
//
// 卡片要展示的「阅读时长 / 字数 / 导语」在构建期一并算好写进索引，
// 列表页因此无需正文即可渲染，不必逐篇加载。
//
// 用法：node scripts/gen-content-index.mjs   （dev / build 前置执行）
//      产物 src/data/content-index.json 已被 .gitignore 忽略，属构建产物。

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = process.cwd();
const CONTENT = join(ROOT, 'content');
const OUT = join(ROOT, 'src', 'data', 'content-index.json');

// content 下的一级目录即内容类型（works 表示模拟实验，maps 互动地图…），
// 顺序需与 src/lib/content.ts 的 ContentType 一致。
const FOLDERS = ['works', 'maps', 'games', 'tools', 'articles', 'learn', 'downloads'];

// frontmatter 解析：与 src/lib/content.ts 保持同一套朴素规则（本项目内容均为自撰、
// 单行 `key: value`，不引入 YAML 依赖）。changelog.md 不在此处理（由 content.ts 单独读）。
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { fm: {}, body: raw };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (v) fm[k] = v;
  }
  return { fm, body: raw.slice(m[0].length) };
}

// 导语：仅当没有 summary 时才回退到正文摘录（去掉 markdown 符号取前 72 字），
// 与原本 KnowledgeCard.leadOf() 的口径一致，保证卡片展示不变。
function leadOf(summary, body) {
  if (summary) return '';
  return body
    .replace(/[#>*`_>-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 72);
}

const rows = [];
for (const folder of FOLDERS) {
  const dir = join(CONTENT, folder);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.md')) continue;
    const raw = readFileSync(join(dir, f), 'utf-8');
    const { fm, body } = parseFrontmatter(raw);
    rows.push({
      folder,
      filename: f.replace(/\.md$/, ''),
      fm,
      // 正文字数（去空白），卡片「N字」与阅读时长由它推导
      words: body.replace(/\s/g, '').length,
      lead: leadOf(fm.summary, body),
      // 下面按目录统计「独有 8-gram 数」，先占位
      uniq: 0,
      // 仅内部使用，写出前删除
      _text: body.replace(/\s/g, ''),
    });
  }
}

// ===== 独有 8-gram 数：量化「这篇正文有多大比例是别处也有的套话」=====
//
// 动机：downloads 里 306 篇「国土空间规划」用的是同一套六段式模板，
// 大批页面正文 65% 以上的 8-gram 与其它页面重合。字数并不短（中位 1732 字），
// 所以「加长正文」治不了，只能识别出来做 noindex 收敛。
//
// 口径：以**同一目录**为语料，把正文（去空白）切成连续 8 字片段；
// 一个片段若出现在超过 15% 的同目录文档里，视为公共套话，不计入「独有」。
// 阈值取相对值而非绝对值，新增内容时不需要调参。
const SHINGLE = 8;
const DF_RATIO = 0.15;

const byFolder = new Map();
for (const r of rows) {
  if (!byFolder.has(r.folder)) byFolder.set(r.folder, []);
  byFolder.get(r.folder).push(r);
}

for (const [, list] of byFolder) {
  const docCount = list.length;
  if (!docCount) continue;
  // 下限 2：小目录（如 works 只有 2 篇）若按比例算出 1，会把「只此一篇有」的片段
  // 也当成公共套话排除掉，导致所有页面 uniq=0 —— 那种数字没有意义。
  const dfCut = Math.max(2, Math.ceil(docCount * DF_RATIO));
  const df = new Map();
  // 每篇先去重，避免长文靠重复自身刷高 df
  const shingleSets = list.map((r) => {
    const s = new Set();
    const t = r._text;
    for (let i = 0; i + SHINGLE <= t.length; i++) s.add(t.slice(i, i + SHINGLE));
    return s;
  });
  for (const s of shingleSets) for (const g of s) df.set(g, (df.get(g) || 0) + 1);
  list.forEach((r, i) => {
    let n = 0;
    for (const g of shingleSets[i]) if (df.get(g) < dfCut) n++;
    r.uniq = n;
  });
}

for (const r of rows) delete r._text;

// 稳定排序：输出可复现，diff 才干净（防止目录遍历顺序波动造成整份 JSON 变动）
rows.sort((a, b) => `${a.folder}/${a.filename}`.localeCompare(`${b.folder}/${b.filename}`));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(rows), 'utf-8');
console.log(`[content-index] 写出 ${rows.length} 条元数据 -> src/data/content-index.json`);

// ===== 客户端瘦身索引（content-index.client.json）=====
//
// 上面的完整索引供构建脚本（prerender / site-routes）使用；浏览器端打进主 bundle 的
// 是这份瘦身版。两点区别：
//   1. 去掉「只在该篇详情页才用得到」的字段（DETAIL_KEYS）。这些字段仍在每篇 md 的
//      frontmatter 里，content.ts 的 loadBody() 拉正文时会顺带解析并补到 item 上——
//      首屏 hydration / 预渲染前都会先 preloadRoute()，因此详情页 DOM 与 SSG 一致。
//   2. 资料的访问方式（gated / view / open）在这里预先算好写成 acc，
//      列表页 / 首页的徽标与筛选因此无需 code / download / viewUrl。
// ⚠️ 若某个列表卡片 / 搜索开始用到 DETAIL_KEYS 里的字段，要把它从这里移出。
const DETAIL_KEYS = [
  'code', 'download', 'viewUrl', 'officialUrl', 'officialName', 'standardNo', 'stdStatus',
  'stdDate', 'source', 'keywordAliases', 'trigger', 'panCode', 'downloadAlt', 'downloadAltType',
  'downloadAltCode', 'downloadType', 'timeline', 'publisher', 'isbn', 'pubYear', 'pages',
  // ⚠️ author 不能进 DETAIL_KEYS：相关推荐卡片（ResourceDetail r.author）会显示作者。
];

// 与 content.ts 的 isResourceGated / isResourceViewOnly 口径一致
function accessKind(fm) {
  const gated = fm.access === 'gated' || (fm.access !== 'open' && !!(fm.code && fm.code.trim()));
  if (gated) return 'gated';
  if (fm.viewUrl && !fm.download) return 'view';
  return 'open';
}

const clientRows = rows.map(({ folder, filename, fm, words, lead }) => {
  const slim = {};
  for (const [k, v] of Object.entries(fm)) if (!DETAIL_KEYS.includes(k)) slim[k] = v;
  const row = { folder, filename, fm: slim, words };
  if (lead) row.lead = lead;
  if (folder === 'downloads') row.acc = accessKind(fm);
  return row;
});
const CLIENT_OUT = join(ROOT, 'src', 'data', 'content-index.client.json');
writeFileSync(CLIENT_OUT, JSON.stringify(clientRows), 'utf-8');
console.log(`[content-index] 客户端瘦身索引 -> src/data/content-index.client.json`);
