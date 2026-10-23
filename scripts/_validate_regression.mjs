// 临时：回归验证——82 个地图应用 + 3 个游戏 + 中文站对照
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/ZhuanZ/.workbuddy/binaries/node/workspace/node_modules/playwright-core');

const ROOT = path.resolve('public');
const PORT = 8150;
const MIME = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.geojson':'application/json','.ico':'image/x-icon','.jpg':'image/jpeg','.webp':'image/webp' };
const server = http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const fp = path.join(ROOT, p);
  if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, {'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream'});
  fs.createReadStream(fp).pipe(res);
});
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'] });
await new Promise(r => server.listen(PORT, r));

// 抽样地图应用：regions 家族 + 独立应用
const MAPS = [
  'deu-regions', 'cn-plains', 'antarctic-stations', 'world-currents',
  'sz-libraries', 'cn-basins', 'moon-viewer', 'tea-horse-road',
];
const GAMES = ['geoshape', 'geotype', 'chinapuzzle'];

console.log('=== 地图应用 ?lang=en ===');
for (const m of MAPS) {
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0,60)));
  await page.goto(`http://127.0.0.1:${PORT}/maps/${m}/index.html?lang=en`, { waitUntil:'domcontentloaded', timeout:20000 }).catch(()=>{});
  await page.waitForTimeout(2600);
  const r = await page.evaluate(() => ({
    on: window.__mapI18nOn === true,
    stats: window.__mapI18nStats || null,
    lang: document.documentElement.getAttribute('lang'),
    hasZh: /[一-鿿]/.test((document.body.innerText || '').slice(0, 4000)),
    title: document.title.slice(0, 50),
  }));
  console.log(`  ${m.padEnd(20)} on=${r.on} lang=${r.lang} stats=${JSON.stringify(r.stats)} 仍有中文=${r.hasZh} ${errs.length?'ERR:'+errs[0]:''}`);
  await page.close();
}

console.log('\n=== 中文站对照（无 ?lang=en，应完全不变）===');
for (const m of ['deu-regions', 'antarctic-stations', 'cn-plains']) {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/maps/${m}/index.html`, { waitUntil:'domcontentloaded', timeout:20000 }).catch(()=>{});
  await page.waitForTimeout(2400);
  const r = await page.evaluate(() => ({
    on: window.__mapI18nOn === true,
    lang: document.documentElement.getAttribute('lang'),
    zh: (document.body.innerText || '').match(/[一-鿿]/g) ? (document.body.innerText.match(/[一-鿿]/g)||[]).length : 0,
  }));
  console.log(`  ${m.padEnd(20)} on=${r.on} lang=${r.lang} 中文字符数=${r.zh}`);
  await page.close();
}
for (const g of GAMES) {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/games/${g}/index.html`, { waitUntil:'domcontentloaded', timeout:20000 }).catch(()=>{});
  await page.waitForTimeout(2400);
  const r = await page.evaluate(() => ({
    on: window.__mapI18nOn === true,
    lang: document.documentElement.getAttribute('lang'),
    zh: (document.body.innerText || '').match(/[一-鿿]/g) ? (document.body.innerText.match(/[一-鿿]/g)||[]).length : 0,
  }));
  console.log(`  ${g.padEnd(20)} on=${r.on} lang=${r.lang} 中文字符数=${r.zh}`);
  await page.close();
}

await browser.close();
server.close();
