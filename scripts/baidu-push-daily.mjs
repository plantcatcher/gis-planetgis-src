// 主站 planetgis.cn · 百度主动推送「每日任务版」
//
// 与构建期脚本 scripts/baidu-push.mjs 的区别：
//   ① URL 源取**线上** https://planetgis.cn/sitemap.xml（CF 部署后即最新），
//      不再读本地 dist/sitemap.xml —— 那份只在本地跑 npm run build 时更新，
//      几天不构建就永远推不到新发布的页面。
//   ② 内置配额探测：先单推 1 条拿到百度返回的 remain，再把当天剩余额度用完。
//      日配额 10 条时就表现为「1 条测试 + 9 条正式」。
//   ③ 成功一条才写回历史，失败的 URL 下次仍会重试。
//
// 用法：
//   node scripts/baidu-push-daily.mjs           按当日剩余配额推（上限 --max，默认 10）
//   node scripts/baidu-push-daily.mjs --max=5   本次最多推 5 条
//   node scripts/baidu-push-daily.mjs --dry     只打印，不真发请求
//
// 历史与主站构建期脚本共用 scripts/_cache/baidu-pushed.json，两边不会重复推。

// 沙箱/本机可能残留代理变量指向不可达地址，出网前先清掉
for (const k of ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'ALL_PROXY', 'all_proxy']) {
  delete process.env[k];
}

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = process.cwd();
const HISTORY = join(ROOT, 'scripts', '_cache', 'baidu-pushed.json');
const LOG = join(ROOT, 'scripts', '_cache', 'baidu-push-log.jsonl');
const SITEMAP_URL = process.env.BAIDU_SITEMAP_URL || 'https://planetgis.cn/sitemap.xml';

// 轻量读取本地 .env（仅在本机、process.env 缺失时；CI 注入的变量优先）
if (!process.env.BAIDU_PUSH_TOKEN && existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf-8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const SITE = process.env.BAIDU_SITE || 'https://planetgis.cn';
const TOKEN = process.env.BAIDU_PUSH_TOKEN;

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry') || argv.includes('--dry-run');
const maxArg = argv.find((a) => a.startsWith('--max='));
const maxParsed = maxArg ? Number.parseInt(maxArg.split('=')[1], 10) : NaN;
// ⚠️ --max=abc 这类非法值会让 parseInt 返回 NaN，slice(0, NaN) 得到空数组，
//    随后会把 undefined 推给百度并静默吃掉 1 条配额 —— 这里兜底回默认值。
const MAX = Number.isFinite(maxParsed) && maxParsed > 0 ? maxParsed : 10;
if (maxArg && Number.isNaN(maxParsed)) {
  console.warn(`[baidu-daily] --max 参数非法（${maxArg}），回退为默认 ${MAX} 条。`);
}

if (!TOKEN) {
  console.log('[baidu-daily] 未配置 BAIDU_PUSH_TOKEN，跳过。');
  console.log('[baidu-daily]   本机：项目根目录 .env 写 BAIDU_PUSH_TOKEN=你的token');
  process.exit(0);
}

function loadHistory() {
  if (!existsSync(HISTORY)) return new Set();
  try {
    const d = JSON.parse(readFileSync(HISTORY, 'utf-8'));
    return new Set(Array.isArray(d.pushed) ? d.pushed : []);
  } catch {
    return new Set();
  }
}

async function pushOnce(urls) {
  // ⚠️ site 参数禁止 encodeURIComponent：编码后百度返回 400 site init fail
  const endpoint = `http://data.zz.baidu.com/urls?site=${SITE}&token=${TOKEN}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: urls.join('\n'),
      signal: controller.signal
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* 非 JSON 响应 */ }
    const ok = json ? !json.error : res.ok;
    const remain = json && json.remain != null ? json.remain : null;
    return { ok, remain, text: text.slice(0, 300), status: res.status };
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- 1. 拉线上 sitemap ---------- */
let candidates = [];
try {
  const res = await fetch(SITEMAP_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 baidu-push-daily' },
    signal: AbortSignal.timeout(20000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  candidates = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (m) => m[1]);
} catch (e) {
  console.error(`[baidu-daily] 拉取 ${SITEMAP_URL} 失败: ${e.message}，本次不推送（避免拉到残缺 sitemap 误清历史）。`);
  process.exit(0);
}
if (!candidates.length) {
  console.log('[baidu-daily] 线上 sitemap 无 URL，跳过。');
  process.exit(0);
}

/* ---------- 2. 过滤已推 ---------- */
const history = loadHistory();
const pending = candidates.filter((u) => !history.has(u));
const done = candidates.length - pending.length;

if (!pending.length) {
  console.log(`[baidu-daily] sitemap 共 ${candidates.length} 条，全部已推送过，本次无需推送。`);
  process.exit(0);
}

console.log(`[baidu-daily] 线上 sitemap ${candidates.length} 条，已推 ${done} 条，待推 ${pending.length} 条。`);

if (DRY) {
  for (const u of pending.slice(0, MAX)) console.log(`   · ${u.replace(SITE, '') || '/'}`);
  console.log(`[baidu-daily] --dry 模式：未发送任何请求（本次计划推 ${Math.min(pending.length, MAX)} 条）。`);
  process.exit(0);
}

/* ---------- 3. 先单推 1 条探测配额 ---------- */
const batch = pending.slice(0, MAX);
const first = await pushOnce([batch[0]]);
console.log(`[baidu-daily] 探测 1 条 → HTTP ${first.status} ${first.text}`);
if (!first.ok) {
  console.warn('[baidu-daily] 推送失败或配额已耗尽，历史未更新，下次继续重试。');
  appendLog({ date: today(), attempted: 1, pushed: 0, remain: first.remain, note: 'first-batch-failed' });
  process.exit(0);
}

const accepted = [batch[0]];
let remain = first.remain;

/* ---------- 4. 用满当天剩余额度 ---------- */
const rest = batch.slice(1);
if (remain === null || remain > 0) {
  const cap = remain === null ? rest.length : Math.min(rest.length, remain);
  for (let i = 0; i < cap; i++) {
    const r = await pushOnce([rest[i]]);
    if (!r.ok) {
      console.warn(`[baidu-daily] 第 ${i + 2} 条失败（HTTP ${r.status} ${r.text}），停止本次推送。`);
      remain = r.remain;
      break;
    }
    accepted.push(rest[i]);
    remain = r.remain;
    if (remain === 0) break;
  }
}

/* ---------- 5. 落历史 + 日志 ---------- */
for (const u of accepted) history.add(u);
const live = new Set(candidates);
let pruned = 0;
// ⚠️ 只有当本次候选集不小于已有历史时才做清理。sitemap 异常变少（CDN 旧缓存 / 线上短暂缺页）
//    会触发大规模误删，而这些 URL 之后会被重复推送。异常时保留历史、只告警。
if (candidates.length >= history.size) {
  for (const u of [...history]) {
    if (!live.has(u)) { history.delete(u); pruned++; }
  }
} else {
  console.warn(
    `[baidu-daily] 候选集 ${candidates.length} 条 < 历史 ${history.size} 条，疑似 sitemap 异常，本次跳过历史清理。`
  );
}
mkdirSync(dirname(HISTORY), { recursive: true });
// 写前备份：历史文件不入库且日志不记 URL，出错时靠 baidu-pushed.bak.json 兜底
const BACKUP = HISTORY.replace(/\.json$/, '.bak.json');
try {
  if (existsSync(HISTORY)) copyFileSync(HISTORY, BACKUP);
} catch { /* 备份失败不阻断主流程 */ }
writeFileSync(
  HISTORY,
  `${JSON.stringify({ updatedAt: new Date().toISOString(), pushed: [...history].sort() }, null, 2)}\n`,
  'utf-8'
);

console.log(`[baidu-daily] 本次成功推 ${accepted.length} 条；今日剩余配额: ${remain ?? '未知'}；累计已推 ${history.size} 条；待推还剩 ${pending.length - accepted.length} 条${pruned ? `（清理失效条目 ${pruned} 条）` : ''}。`);
appendLog({ date: today(), attempted: batch.length, pushed: accepted.length, remain, total: history.size, left: candidates.length - history.size });
console.log(`[baidu-daily] 预计还需 ${Math.ceil((candidates.length - history.size) / MAX)} 天推完全部存量（按每天 ${MAX} 条）。`);

function today() {
  // ⚠️ 必须用北京时间：本任务每天 00:25 跑，UTC 时间仍是「前一天 16:25」，
  //    直接 toISOString().slice(0,10) 会把每天的推送记成前一天，日志全部错位。
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}
function appendLog(rec) {
  try {
    mkdirSync(dirname(LOG), { recursive: true });
    appendFileSync(LOG, `${JSON.stringify(rec)}\n`, 'utf-8');
  } catch { /* 日志失败不影响主流程 */ }
}
