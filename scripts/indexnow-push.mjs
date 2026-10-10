// IndexNow 主动推送：把 URL 立刻告知支持该协议的搜索引擎。
//
// ⚠️ 重要前提：Google 官方**不参与** IndexNow。这个脚本对 Google 收录没有任何帮助，
//    覆盖范围只有 Bing / Yandex / Seznam / Naver 等。想上 Google 请走
//    Search Console（验证站点 + 提交 sitemap + 网址检查里的「请求编入索引」）。
//
// 前置条件（顺序不能反）：
//   1. public/<key>.txt 必须已经随站点部署上线，
//      且 https://planetgis.cn/<key>.txt 能返回 key 本身（纯文本）。
//      校验方式就是抓这个文件，拿到 HTML 一律判失败。
//   2. 确认上线后再跑本脚本，否则推送全部作废。
//
// 用法：
//   node scripts/indexnow-push.mjs                  推送 dist/sitemap.xml 里的全部 URL
//   node scripts/indexnow-push.mjs --limit=200      只推前 200 条
//   node scripts/indexnow-push.mjs /learn/xxx /works/yyy   只推指定路径
//   node scripts/indexnow-push.mjs --dry            只打印，不真发请求

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const PUBLIC = join(ROOT, 'public');
const SITE = process.env.SITE_URL || 'https://planetgis.cn';
const HOST = new URL(SITE).host;

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry') || argv.includes('--dry-run');
const limitArg = argv.find((a) => a.startsWith('--limit='));
const LIMIT = limitArg ? Number.parseInt(limitArg.split('=')[1], 10) : 0;
const explicit = argv.filter((a) => !a.startsWith('--'));

// 自动发现 public/ 下的密钥文件：文件名即 key，文件内容也是 key
const keyFile = existsSync(PUBLIC)
  ? readdirSync(PUBLIC).find((f) => /^[0-9a-f]{16,64}\.txt$/.test(f))
  : null;
if (!keyFile) {
  console.log('[indexnow] 未找到 public/<key>.txt，跳过。可用下面命令生成：');
  console.log(
    '  node -e "const k=require(\'crypto\').randomBytes(16).toString(\'hex\');require(\'fs\').writeFileSync(\'public/\'+k+\'.txt\',k)"',
  );
  process.exit(0);
}
const KEY = keyFile.replace(/\.txt$/, '');
const keyLocation = `${SITE}/${keyFile}`;
console.log(`[indexnow] 使用密钥文件 ${keyLocation}`);

let urls = [];
if (explicit.length) {
  urls = explicit.map((u) => (/^https?:\/\//i.test(u) ? u : `${SITE}/${u.replace(/^\/+/, '')}`));
} else {
  const sitemapPath = join(DIST, 'sitemap.xml');
  if (!existsSync(sitemapPath)) {
    console.error('[indexnow] 未找到 dist/sitemap.xml，请先运行 npm run build。');
    process.exit(0);
  }
  urls = Array.from(readFileSync(sitemapPath, 'utf-8').matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
}

if (urls.length === 0) {
  console.log('[indexnow] 没有可推送的 URL。');
  process.exit(0);
}
if (LIMIT > 0) urls = urls.slice(0, LIMIT);

// 协议要求：urlList 里的 URL 必须与 host 一致
const before = urls.length;
urls = urls.filter((u) => {
  try {
    return new URL(u).host === HOST;
  } catch {
    return false;
  }
});
if (urls.length !== before) {
  console.warn(`[indexnow] 过滤掉 ${before - urls.length} 条 host 不匹配的 URL。`);
}

console.log(`[indexnow] 待推送 ${urls.length} 条`);
for (const u of urls.slice(0, 10)) console.log(`   · ${u}`);
if (urls.length > 10) console.log(`   …（还有 ${urls.length - 10} 条）`);

if (DRY) {
  console.log('\n[indexnow] --dry 模式：未发送任何请求。');
  process.exit(0);
}

const payload = { host: HOST, key: KEY, keyLocation, urlList: urls };

try {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
    signal: controller.signal,
  });
  clearTimeout(timer);
  const text = await res.text();

  // 响应语义（别把 202 当成功）：
  //   200 成功 | 202 已接收但密钥异步校验（不代表通过）| 403 密钥校验失败
  //   422 URL 与 host 不匹配或含无效 URL | 429 提交过于频繁
  const hint = {
    200: '成功',
    202: '已接收，密钥将异步校验 —— 请稍后确认密钥文件可公网访问，否则会校验失败',
    403: '密钥校验失败：确认 <key>.txt 已部署且内容就是密钥本身',
    422: 'URL 与 host 不匹配，或含无效 URL',
    429: '提交过于频繁，稍后再试',
  }[res.status];
  console.log(`[indexnow] HTTP ${res.status} ${hint ? `（${hint}）` : ''} ${text.slice(0, 200)}`);
  if (res.status === 403) process.exitCode = 1;
} catch (e) {
  console.warn(`[indexnow] 推送失败（不影响构建）: ${e.message}`);
  process.exit(0);
}
