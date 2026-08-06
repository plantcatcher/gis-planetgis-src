// 构建后把 sitemap 中的 URL 主动推送到百度搜索资源平台（链接提交-主动推送）。
// 中文站收录的命脉：新文章/新页面能几分钟内被百度发现。
//
// 配置（建议放在 CI Secrets / 本地 .env，勿提交）：
//   BAIDU_SITE=https://planetgis.cn
//   BAIDU_PUSH_TOKEN=<百度搜索资源平台-链接提交-主动推送-token>
//
// 未配置 token 时自动跳过，不影响构建；网络失败也只告警、不阻断构建。

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SITE = process.env.BAIDU_SITE || 'https://planetgis.cn';
const TOKEN = process.env.BAIDU_PUSH_TOKEN;

if (!TOKEN) {
  console.log('[baidu-push] 未配置 BAIDU_PUSH_TOKEN，跳过主动推送（如需启用请在 CI/本地设置该变量）。');
  process.exit(0);
}

const sitemapPath = join(process.cwd(), 'dist', 'sitemap.xml');
if (!existsSync(sitemapPath)) {
  console.error('[baidu-push] 未找到 dist/sitemap.xml，请先运行 gen-sitemap。');
  process.exit(0);
}

const xml = readFileSync(sitemapPath, 'utf-8');
const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);

if (urls.length === 0) {
  console.log('[baidu-push] sitemap 中无 URL，跳过。');
  process.exit(0);
}

const endpoint = `http://data.zz.baidu.com/urls?site=${encodeURIComponent(SITE)}&token=${TOKEN}`;

try {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: urls.join('\n'),
    signal: controller.signal,
  });
  clearTimeout(timer);
  const text = await res.text();
  console.log(`[baidu-push] 已推送 ${urls.length} 条，百度返回: ${text}`);
} catch (e) {
  console.warn(`[baidu-push] 推送失败（不影响构建）: ${e.message}`);
  process.exit(0);
}
