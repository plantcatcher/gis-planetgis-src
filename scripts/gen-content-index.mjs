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
    });
  }
}

// 稳定排序：输出可复现，diff 才干净（防止目录遍历顺序波动造成整份 JSON 变动）
rows.sort((a, b) => `${a.folder}/${a.filename}`.localeCompare(`${b.folder}/${b.filename}`));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(rows), 'utf-8');
console.log(`[content-index] 写出 ${rows.length} 条元数据 -> src/data/content-index.json`);
