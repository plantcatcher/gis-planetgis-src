// 临时：geoshape + chinapuzzle 深度交互验证
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/ZhuanZ/.workbuddy/binaries/node/workspace/node_modules/playwright-core');

const ROOT = path.resolve('public');
const PORT = 8148;
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

async function grab(page) {
  return await page.evaluate(() => {
    const out = []; const seen = new Set();
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let n;
    while ((n = walk.nextNode())) {
      const t = n.nodeValue || '';
      if (!/[一-鿿]/.test(t)) continue;
      let el = n.parentNode; let vis = true;
      while (el) {
        if (el.nodeType !== 1) { el = el.parentNode; continue; }
        const s = getComputedStyle(el);
        if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0) { vis = false; break; }
        el = el.parentNode;
      }
      if (!vis) continue;
      const k = t.trim();
      if (k && !seen.has(k)) { seen.add(k); out.push(k); }
    }
    return out;
  });
}

async function dump(page, label) {
  const txt = await page.evaluate(() => (document.body.innerText || '').slice(0, 600));
  console.log('    --- ' + label + ' ---');
  console.log('    ' + txt.replace(/\n+/g, ' | ').slice(0, 560));
}

// ═══════════ geoshape ═══════════
{
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0,90)));
  await page.goto(`http://127.0.0.1:${PORT}/games/geoshape/index.html?lang=en`, { waitUntil:'domcontentloaded', timeout:20000 }).catch(()=>{});
  await page.waitForTimeout(3500);
  console.log('\n########## geoshape ##########');
  let all = new Set(await grab(page));

  // 找到「开始游戏」类入口
  const clicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button, a')];
    const hit = btns.find(b => /Start|Random|Challenge|Classic|开始|随机|挑战/.test(b.innerText||''));
    if (hit) { hit.click(); return hit.innerText.trim().slice(0,30); }
    return null;
  });
  await page.waitForTimeout(2500);
  let now = await grab(page);
  let fresh = now.filter(s => !all.has(s));
  all = new Set([...all, ...now]);
  console.log(`  [入口] clicked="${clicked}" 新增中文=${fresh.length}`);
  fresh.slice(0,8).forEach(s => console.log('      ! ' + s.slice(0,60)));
  await dump(page, '进入后');

  // 点第一个选项（若有）
  const opt = await page.evaluate(() => {
    const b = document.querySelector('button, .opt, [role=button]');
    const cands = [...document.querySelectorAll('button')].filter(x => /[A-Z]{3,}|Country|Province|City/.test(x.innerText||''));
    const t = cands[0] || b;
    if (t) { t.click(); return (t.innerText||'').trim().slice(0,40); }
    return null;
  });
  await page.waitForTimeout(2500);
  now = await grab(page);
  fresh = now.filter(s => !all.has(s));
  all = new Set([...all, ...now]);
  console.log(`  [答题] clicked="${opt}" 新增中文=${fresh.length}`);
  fresh.slice(0,8).forEach(s => console.log('      ! ' + s.slice(0,60)));
  await dump(page, '答题后');
  if (errs.length) console.log('  JS错误:', [...new Set(errs)].slice(0,2));
  await page.close();
}

// ═══════════ chinapuzzle ═══════════
{
  const page = await browser.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0,90)));
  await page.goto(`http://127.0.0.1:${PORT}/games/chinapuzzle/index.html?lang=en`, { waitUntil:'domcontentloaded', timeout:20000 }).catch(()=>{});
  await page.waitForTimeout(3500);
  console.log('\n########## chinapuzzle ##########');
  let all2 = new Set(await grab(page));

  const c1 = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button, a')];
    const hit = btns.find(b => /Start|Practice|Challenge|开始|练习|挑战/.test(b.innerText||''));
    if (hit) { hit.click(); return hit.innerText.trim().slice(0,30); }
    return null;
  });
  await page.waitForTimeout(2500);
  let now = await grab(page);
  let fresh = now.filter(s => !all2.has(s));
  all2 = new Set([...all2, ...now]);
  console.log(`  [入口] clicked="${c1}" 新增中文=${fresh.length}`);
  fresh.slice(0,8).forEach(s => console.log('      ! ' + s.slice(0,60)));
  await dump(page, '进入后');

  // 选一个关卡
  const c2 = await page.evaluate(() => {
    const b = document.querySelector('.home-level-card');
    if (b) { b.click(); return (b.innerText||'').trim().slice(0,40); }
    return null;
  });
  await page.waitForTimeout(2500);
  now = await grab(page);
  fresh = now.filter(s => !all2.has(s));
  all2 = new Set([...all2, ...now]);
  console.log(`  [选关卡] clicked="${c2}" 新增中文=${fresh.length}`);
  fresh.slice(0,8).forEach(s => console.log('      ! ' + s.slice(0,60)));
  await dump(page, '关卡内');
  if (errs.length) console.log('  JS错误:', [...new Set(errs)].slice(0,2));
  await page.close();
}

await browser.close();
server.close();
