// 构建后把 URL 主动推送到百度搜索资源平台（链接提交 → 主动推送 / API 提交）。
//
// ⚠️ 关键改动：这里做的是**增量推送**，不是全量推送。
//    旧版本每次把 sitemap 里全部 1207 条一股脑推给百度，远超新站的每日配额 ——
//    配额被早已推过的旧 URL 吃光，真正新发布的页面反而排不进队列。
//    现在只推「历史上没推过」的 URL，推过的记在 scripts/_cache/baidu-pushed.json。
//
// 用法：
//   node scripts/baidu-push.mjs                默认推 50 条「未推送过」的 URL
//   node scripts/baidu-push.mjs --limit=100    改成本次最多推 100 条
//   node scripts/baidu-push.mjs --all          忽略历史，全量重推（谨慎：会瞬间吃光配额）
//   node scripts/baidu-push.mjs --dry          只打印将要推的 URL，不真发请求
//   node scripts/baidu-push.mjs /learn/xxx /works/yyy   只推指定路径（忽略历史）
//
// 配置（建议放在 CI Secrets / 本地 .env，勿提交）：
//   BAIDU_SITE=https://planetgis.cn
//   BAIDU_PUSH_TOKEN=<百度搜索资源平台-链接提交-主动推送-token>
//
// ⚠️ Cloudflare Pages 构建时若没有 BAIDU_PUSH_TOKEN 环境变量，本脚本会静默跳过，
//    也就是说线上构建一次都没推过 —— 部署后请确认该变量已在 Pages 的环境变量里配好。
//
// 未配置 token 时自动跳过，不影响构建；网络失败也只告警、不阻断构建。

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const HISTORY = join(ROOT, 'scripts', '_cache', 'baidu-pushed.json');

// 轻量读取本地 .env（仅在 process.env 缺失时），不引入 dotenv 依赖。
// 平台（如 Cloudflare Pages）已注入的环境变量优先，不会被 .env 覆盖。
if (!process.env.BAIDU_PUSH_TOKEN && existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf-8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

// 与百度搜索资源平台生成的接口地址中的 site 参数保持一致（带协议）。
const SITE = process.env.BAIDU_SITE || 'https://planetgis.cn';
const TOKEN = process.env.BAIDU_PUSH_TOKEN;

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry') || argv.includes('--dry-run');
const ALL = argv.includes('--all');
const limitArg = argv.find((a) => a.startsWith('--limit='));
const DEFAULT_LIMIT = 50;
const LIMIT = limitArg ? Number.parseInt(limitArg.split('=')[1], 10) : (ALL ? 0 : DEFAULT_LIMIT);
const explicit = argv.filter((a) => !a.startsWith('--'));

if (!TOKEN) {
  console.log('[baidu-push] 未配置 BAIDU_PUSH_TOKEN，跳过主动推送。');
  console.log('[baidu-push]   本地：在项目根目录 .env 写 BAIDU_PUSH_TOKEN=你的token');
  console.log('[baidu-push]   线上：Cloudflare Pages → 项目 → Settings → Environment variables');
  process.exit(0);
}

/* ---------- 读取已推送历史 ---------- */
function loadHistory() {
  if (!existsSync(HISTORY)) return new Set();
  try {
    const data = JSON.parse(readFileSync(HISTORY, 'utf-8'));
    return new Set(Array.isArray(data.pushed) ? data.pushed : []);
  } catch {
    return new Set();
  }
}

/* ---------- 收集候选 URL ---------- */
let candidates = [];
if (explicit.length) {
  candidates = explicit.map((u) => (/^https?:\/\//i.test(u) ? u : `${SITE}/${u.replace(/^\/+/, '')}`));
} else {
  const sitemapPath = join(DIST, 'sitemap.xml');
  if (!existsSync(sitemapPath)) {
    console.error('[baidu-push] 未找到 dist/sitemap.xml，请先运行 gen-sitemap。');
    process.exit(0);
  }
  candidates = Array.from(
    readFileSync(sitemapPath, 'utf-8').matchAll(/<loc>([^<]+)<\/loc>/g),
  ).map((m) => m[1]);
}

if (candidates.length === 0) {
  console.log('[baidu-push] 没有候选 URL，跳过。');
  process.exit(0);
}

const history = loadHistory();
let pending;
if (explicit.length || ALL) {
  pending = candidates;
} else {
  pending = candidates.filter((u) => !history.has(u));
}

if (pending.length === 0) {
  console.log(`[baidu-push] sitemap 共 ${candidates.length} 条，全部已推送过，本次无需推送。`);
  process.exit(0);
}

if (LIMIT > 0 && pending.length > LIMIT) {
  console.log(`[baidu-push] 待推 ${pending.length} 条，本次按配额只推前 ${LIMIT} 条（可用 --limit=N 调整）。`);
  pending = pending.slice(0, LIMIT);
} else {
  console.log(`[baidu-push] 本次推送 ${pending.length} 条（sitemap 共 ${candidates.length} 条）。`);
}

for (const u of pending.slice(0, 10)) console.log(`   · ${u.replace(SITE, '') || '/'}`);
if (pending.length > 10) console.log(`   …（还有 ${pending.length - 10} 条）`);

if (DRY) {
  console.log('\n[baidu-push] --dry 模式：未发送任何请求。');
  process.exit(0);
}

/* ---------- 推送 ---------- */
const endpoint = `http://data.zz.baidu.com/urls?site=${encodeURIComponent(SITE)}&token=${TOKEN}`;

try {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: pending.join('\n'),
    signal: controller.signal,
  });
  clearTimeout(timer);
  const text = await res.text();

  let ok = false;
  let remain = null;
  try {
    const json = JSON.parse(text);
    remain = json.remain ?? null;
    ok = !json.error;
  } catch {
    ok = res.ok;
  }
  console.log(`[baidu-push] HTTP ${res.status} 百度返回: ${text}`);
  if (remain !== null) console.log(`[baidu-push] 今日剩余配额: ${remain}`);

  if (!ok) {
    console.warn('[baidu-push] 推送未成功，历史记录未更新（下次构建会重试这些 URL）。');
    process.exit(0);
  }

  // 只有成功后才落历史，避免失败把 URL 永久标记为「已推」
  for (const u of pending) history.add(u);
  // 顺手清理已不在 sitemap 里的历史条目，防止文件无限膨胀
  const live = new Set(candidates);
  let pruned = 0;
  for (const u of [...history]) {
    if (!live.has(u)) {
      history.delete(u);
      pruned++;
    }
  }
  mkdirSync(dirname(HISTORY), { recursive: true });
  writeFileSync(
    HISTORY,
    `${JSON.stringify(
      { updatedAt: new Date().toISOString(), pushed: [...history].sort() },
      null,
      2,
    )}\n`,
    'utf-8',
  );
  console.log(`[baidu-push] 历史已更新（累计 ${history.size} 条${pruned ? `，清理失效条目 ${pruned} 条` : ''}）。`);
} catch (e) {
  console.warn(`[baidu-push] 推送失败（不影响构建）: ${e.message}`);
  process.exit(0);
}
