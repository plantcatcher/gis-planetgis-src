// 从 GA4 拉取【资料下载】各页面近 30 天浏览量，生成 src/data/heat.json（slug -> 浏览量）。
// 该脚本不参与日常构建，按需手动执行，或用 GitHub Actions 定时跑（见下方说明）。
//
// 前置（需在运行环境提供）：
//   GA4_PROPERTY_ID            GA4 数字属性 ID（不是 G-XXXX 测量 ID），如 13673930686
//   GA4_SERVICE_ACCOUNT       Google 服务账号 JSON 字符串（含 client_email / private_key）
//   或 GA4_SERVICE_ACCOUNT_FILE  服务账号 JSON 文件路径
//   服务账号需在 GA4 媒体资源里被授予「查看者 / Read & Analyze」角色。
//
// 网络说明：
//   - CI（GitHub Actions，直连 Google 可达）走内置 fetch。
//   - 本机（国内需代理）若设置了 HTTPS_PROXY / HTTP_PROXY 环境变量，则自动改用 curl
//     走代理（Node fetch 默认不读系统代理，直连会被墙）。
//
// 用法（本机，PowerShell，假设 Clash 代理在 127.0.0.1:7897）：
//   $env:HTTPS_PROXY="http://127.0.0.1:7897"
//   $env:HTTP_PROXY="http://127.0.0.1:7897"
//   $env:GA4_PROPERTY_ID="13673930686"
//   $env:GA4_SERVICE_ACCOUNT_FILE="C:\Users\ZhuanZ\Downloads\planetgis-ga4-2e9c58c67bb0.json"
//   node scripts/gen_heat.mjs
// 输出：src/data/heat.json —— content.ts 在构建期读取它给每个资料注入 heat 字段。

import { createSign } from 'node:crypto';
import { writeFile, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../src/data/heat.json');

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');

// 是否走代理（仅当显式设置了代理环境变量且本机有 curl 时）
function proxyUrl() {
  return (
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy ||
    ''
  );
}
const CURL = process.platform === 'win32' ? 'curl.exe' : 'curl';
function hasCurl() {
  try {
    execFileSync(CURL, ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
const USE_CURL = !!proxyUrl() && hasCurl();

// 统一 POST：有代理优先 curl（自动读 HTTPS_PROXY），否则 fetch（CI 直连）
async function httpPost(url, headers, bodyStr) {
  if (USE_CURL) {
    const args = ['-sS', '-X', 'POST', url];
    for (const [k, v] of Object.entries(headers)) args.push('-H', `${k}: ${v}`);
    args.push('--data-binary', bodyStr);
    const out = execFileSync(CURL, args, { maxBuffer: 32 * 1024 * 1024 });
    return JSON.parse(out.toString('utf8'));
  }
  const res = await fetch(url, { method: 'POST', headers, body: bodyStr });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
}

function createJWT(sa) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const seg = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;
  const sig = createSign('RSA-SHA256').update(seg).sign(sa.private_key);
  return `${seg}.${b64url(sig)}`;
}

async function getAccessToken(sa) {
  const jwt = createJWT(sa);
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  }).toString();
  const data = await httpPost(
    'https://oauth2.googleapis.com/token',
    { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  );
  if (data.error) throw new Error(`token 失败: ${data.error_description || data.error}`);
  return data.access_token;
}

async function run() {
  const propertyId = process.env.GA4_PROPERTY_ID;
  let saJson = process.env.GA4_SERVICE_ACCOUNT;
  if (!saJson && process.env.GA4_SERVICE_ACCOUNT_FILE) {
    saJson = await readFile(process.env.GA4_SERVICE_ACCOUNT_FILE, 'utf8');
  }

  if (!propertyId || !saJson) {
    console.log(
      '[gen_heat] 未配置 GA4 凭证（GA4_PROPERTY_ID / GA4_SERVICE_ACCOUNT），跳过。\n' +
        '            先到 GA4 媒体资源设置里拿到数字属性 ID，并创建一个带 Read&Analyze 角色的服务账号，\n' +
        '            再把 JSON 通过环境变量注入后重跑本脚本即可生成真实热度数据。',
    );
    return;
  }

  console.log(`[gen_heat] 网络模式: ${USE_CURL ? `curl 走代理 ${proxyUrl()}` : 'fetch 直连'}`);
  const sa = JSON.parse(saJson);
  const token = await getAccessToken(sa);

  const body = {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }],
    dimensionFilter: {
      filter: {
        fieldName: 'pagePath',
        stringFilter: { matchType: 'BEGINS_WITH', value: '/downloads/' },
      },
    },
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 2000,
  };

  const data = await httpPost(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    JSON.stringify(body),
  );
  if (data.error) throw new Error(`runReport 失败: ${JSON.stringify(data.error)}`);

  const heat = {};
  for (const row of data.rows || []) {
    let path = (row.dimensionValues?.[0]?.value || '').split('?')[0];
    const slug = path.replace(/^\/downloads\//, '').replace(/\.html$/, '').replace(/\/+$/, '');
    if (!slug) continue;
    heat[slug] = Number(row.metricValues?.[0]?.value) || 0;
  }

  await writeFile(OUT, JSON.stringify(heat, null, 2) + '\n', 'utf8');
  const total = Object.values(heat).reduce((s, n) => s + n, 0);
  console.log(
    `[gen_heat] 已写入 ${Object.keys(heat).length} 个资料页热度，近30天总浏览量 ${total} -> ${OUT}`,
  );
}

run().catch((e) => {
  console.error('[gen_heat] 失败：', e.message);
  process.exit(1);
});
