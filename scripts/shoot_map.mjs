/* 专题地图文章配图截图器（通用）
 * 产出 public/shots/<slug>/hp_1.jpg（总览，全量 + 枢纽港名）与 hp_2.jpg（筛选后，仅顶级枢纽）。
 * 用法：node scripts/shoot_map.mjs --slug world-ports
 * 前置：public/ 已用静态服务提供（默认 http://127.0.0.1:8899）
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const slug = arg('slug');
if (!slug) { console.error('缺 --slug'); process.exit(1); }

const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.BASE || 'http://127.0.0.1:8899';
const PORT = Number(process.env.PORT || 9725);
const W = Number(arg('w', 1440));
const H = Number(arg('h', 900));
const DSF = Number(arg('dsf', 1));
const WAIT = Number(arg('wait', 5000));
const FILTER = arg('filter', '3');                 // 第二张图点击的层级 chip（data-v）
const OUT = arg('out', `public/shots/${slug}`);
const PROF = `_g/prof_shoot_${slug}`;
const URL_ = `${BASE}/maps/${slug}/index.html`;

try { fs.rmSync(PROF, { recursive: true, force: true }); } catch (_) {}
fs.mkdirSync(OUT, { recursive: true });

const child = spawn(CHROME, [
  '--headless=new', '--disable-gpu-sandbox', '--no-first-run', '--no-default-browser-check',
  '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--in-process-gpu',
  '--hide-scrollbars', '--no-proxy-server',
  '--user-data-dir=' + path.resolve(PROF), '--remote-debugging-port=' + PORT, 'about:blank'
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wsUrl() {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const p = (await r.json()).find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (p) return p.webSocketDebuggerUrl;
    } catch (_) {}
    await sleep(250);
  }
  throw new Error('CDP 未就绪');
}
const ws = new WebSocket(await wsUrl());
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
};
const send = (method, params = {}) => new Promise((res, rej) => { const n = ++id; pending.set(n, { res, rej }); ws.send(JSON.stringify({ id: n, method, params })); });
const evalJs = async (e) => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
const shot = async (name) => {
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90, fromSurface: true });
  const fp = path.join(OUT, name);
  fs.writeFileSync(fp, Buffer.from(r.data, 'base64'));
  console.log('SHOT ' + fp + '  ' + (fs.statSync(fp).size / 1024).toFixed(0) + 'KB');
};

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DSF, mobile: false });
await send('Page.navigate', { url: URL_ });
await sleep(WAIT);

// 总览：隐藏浮层 UI + 枢纽港名 + 近满框取景
await evalJs(`(function(){
  var app = window.__app; if (app && app.map) { app.map.setMinZoom(0.8); app.fitAll({ padding: { left: 24, right: 24, top: 24, bottom: 24 }, animate: false }); }
  var s = document.createElement('style');
  s.textContent = '.intro,.detail,.dock,.panel,.maplibregl-ctrl-bottom-right,.maplibregl-ctrl-top-left{display:none!important}';
  document.head.appendChild(s);
})()`);
await sleep(1400);
await shot('hp_1.jpg');

// 筛选：点击「仅顶级」层级 chip
await evalJs(`(function(){ var b = document.querySelector('#chipTier button[data-v="${FILTER}"]'); if (b) b.click(); return true; })()`);
await sleep(3400);
await evalJs(`(function(){
  var app = window.__app; if (app && app.map) { app.map.setMinZoom(0.8); app.fitAll({ padding: { left: 24, right: 24, top: 24, bottom: 24 }, animate: false }); }
})()`);
await sleep(1400);
await shot('hp_2.jpg');

ws.close(); child.kill(); process.exit(0);
