// 临时：验证 3 个游戏 ?lang=en 的英译覆盖（首屏 + 进入游戏 + 结果页）
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/ZhuanZ/.workbuddy/binaries/node/workspace/node_modules/playwright-core');

const ROOT = path.resolve('public');
const PORT = 8141;
const MIME = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.geojson':'application/json','.ico':'image/x-icon','.woff2':'font/woff2','.ttf':'font/ttf','.jpg':'image/jpeg' };
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

async function grab(page) {
  return await page.evaluate(() => {
    const out = []; const seen = new Set();
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let n;
    while ((n = walk.nextNode())) {
      const t = n.nodeValue || '';
      if (!/[一-鿿]/.test(t)) continue;
      let el = n.parentElement; let vis = true;
      while (el) { const s = getComputedStyle(el); if (s.display==='none'||s.visibility==='hidden'||parseFloat(s.opacity)===0){vis=false;break;} el=el.parentElement; }
      if (!vis) continue;
      const k = t.trim();
      if (k && !seen.has(k)) { seen.add(k); out.push(k); }
    }
    return out;
  });
}

async function clickText(page, text) {
  const btns = await page.$$('button, a, [role=button], .opt, .cta, .ghost');
  for (const b of btns) {
    const tx = (await b.innerText().catch(()=>'')) || '';
    if (tx.includes(text)) { await b.click().catch(()=>{}); return true; }
  }
  return false;
}

const GAMES = [
  { name: 'geoshape', starts: ['Start Game', 'Random Challenge', 'Classic Mode', '按大洲挑战'] },
  { name: 'geotype', starts: ['Start the Test', 'Start Quiz'] },
  { name: 'chinapuzzle', starts: ['Start Game', 'Practice', 'Challenge'] },
];

for (const g of GAMES) {
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.goto(`http://127.0.0.1:${PORT}/games/${g.name}/index.html?lang=en`, { waitUntil:'domcontentloaded', timeout:20000 }).catch(()=>{});
  await page.waitForTimeout(3500);
  const on = await page.evaluate(() => window.__mapI18nOn === true);
  const stats = await page.evaluate(() => window.__mapI18nStats || null);
  const home = await grab(page);
  console.log(`\n===== ${g.name} (lang=en, on=${on}, stats=${JSON.stringify(stats)}) =====`);
  console.log(`[首屏残留中文 ${home.length}]`);
  home.forEach(s => console.log('  H ' + s.slice(0,60)));

  // 进入游戏：依次尝试候选按钮
  let clicked = false;
  for (const t of g.starts) {
    clicked = await clickText(page, t);
    if (clicked) break;
  }
  await page.waitForTimeout(2500);
  const after = await grab(page);
  const homeSet = new Set(home);
  const fresh = after.filter(s => !homeSet.has(s));
  console.log(`[点击进入=${clicked}；交互后新增中文 ${fresh.length}]`);
  fresh.forEach(s => console.log('  A ' + s.slice(0,60)));
  if (errs.length) console.log('  JS错误:', errs.slice(0,3));
  await page.close();
}
await browser.close();
server.close();
