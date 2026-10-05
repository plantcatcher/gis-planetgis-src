/* 专题地图封面生成器
 * 打开地图页 → 隐藏浮层 UI → 叠加标题层 → 截图为 JPEG
 * 用法：node scripts/gen_map_cover.mjs --slug cn-terrain-steps --title "中国地势三级阶梯" \
 *        --sub "西高东低 · 从青藏高原到东部沿海" --eyebrow "WEST HIGH · EAST LOW" --accent "#6fa8dc"
 * 环境：BASE（默认 http://127.0.0.1:8899）、W、H、PORT
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.BASE || 'http://127.0.0.1:8899';
const PORT = Number(process.env.PORT || 9700);
const W = Number(process.env.W || 1200);
const H = Number(process.env.H || 675);
const DSF = Number(process.env.DSF || 2);
const WAIT = Number(process.env.WAIT || 4200);
const PROF = '_g/prof_cover';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const slug = arg('slug');
const title = arg('title', '');
const sub = arg('sub', '');
const eyebrow = arg('eyebrow', '');
const accent = arg('accent', '#f5b544');
const keepLabels = argv.includes('--labels');
if (!slug) { console.error('缺 --slug'); process.exit(1); }

const OUT = arg('out', `public/maps/${slug}/cover.jpg`);
const URL_ = `${BASE}/maps/${slug}/index.html`;

fs.rmSync(PROF, { recursive: true, force: true });
fs.mkdirSync(path.dirname(OUT), { recursive: true });
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
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id); pending.delete(m.id);
    m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
  }
};
const send = (method, params = {}) => new Promise((res, rej) => {
  const n = ++id; pending.set(n, { res, rej });
  ws.send(JSON.stringify({ id: n, method, params }));
});

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DSF, mobile: false });
await send('Emulation.setUserAgentOverride', {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  platform: 'Win32'
});
await send('Page.navigate', { url: URL_ });
await sleep(WAIT);

/* 封面视角：地图尽量占满画面（不套页面的侧栏留白），底部留出标题区 */
const PAD = process.env.PAD_L ? {
  left: Number(process.env.PAD_L), right: Number(process.env.PAD_R || 70),
  top: Number(process.env.PAD_T || 48), bottom: Number(process.env.PAD_B || 150)
} : { left: 70, right: 70, top: 48, bottom: 150 };
const fitInfo = await send('Runtime.evaluate', {
  returnByValue: true,
  expression: `(function(){
    /* 老代地图不暴露 window.__app（那是 thematic 引擎挂的），退而用全局 map 实例兜底 */
    var app = window.__app;
    if (!app || !app.fitAll) app = (window.map && window.map.fitBounds) ? { map: window.map } : null;
    if (!app || !app.map) return { ok:false, app:typeof window.__app, map:typeof window.map };
    var m = app.map;
    /* 封面是 16:9 宽幅，整框往往需要比页面 minZoom 更小的级别，这里临时放开 */
    try { m.setMinZoom(0.8); } catch (e) {}
    if (app.fitAll) app.fitAll({ padding: ${JSON.stringify(PAD)}, animate: false });
    else m.fitBounds(m.getBounds(), { padding: ${JSON.stringify(PAD)}, duration: 0 });
    var r = document.getElementById('map').getBoundingClientRect();
    return { ok:true, z:+m.getZoom().toFixed(3),
             c:m.getCenter().toArray().map(function(v){return +v.toFixed(3)}),
             b:m.getBounds().toArray().map(function(p){return [+p[0].toFixed(2),+p[1].toFixed(2)]}),
             box:[Math.round(r.width),Math.round(r.height)] };
  })()`
});
console.log('FIT ' + JSON.stringify(fitInfo.result.value));
await sleep(1200);

/* 不同代际的专题图 UI class 完全不同：
   -新代（引 _shared/thematic）：.intro / .detail / .dock / .panel
   - 老代（自带复制版 css）：cn-provinces 用 .topbar/.card-panel/.legend/.map-nav/.catalog
   只隐藏 thematic 那套 → 老图封面会露出全套 UI 浮层。这里按 slug 补一张表。
   新增老图封面时把它的顶层 UI class 追加到对应分组即可。*/
const LEGACY_UI = {
  'cn-provinces': '.topbar, .card-panel, .legend, .map-nav, .catalog, .brand, .src-note',
  'cn-rivers': '.topbar, .panel, .legend, .hint, .brand',
  'cn-yangtze': '.topbar, .panel, .legend, .intro, .brand',
  'hist-imagery': '.topbar, .panel, .legend, .timeline, .brand',
};
const extraHide = LEGACY_UI[slug] || '';

const hideCss = `
  .intro, .detail, .dock, .panel, .maplibregl-ctrl-bottom-right, .timeline, .playbar,
  .maplibregl-ctrl-top-right, .maplibregl-ctrl-top-left { display: none !important; }
  ${extraHide} { display: none !important; }
  ${keepLabels ? '' : '#labels { display: none !important; }'}
`;
const overlay = title ? `
  var g = document.createElement('div');
  g.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:46%;z-index:2147483646;pointer-events:none;' +
    'background:linear-gradient(to top, rgba(6,11,20,.94) 0%, rgba(6,11,20,.72) 34%, rgba(6,11,20,0) 100%)';
  document.body.appendChild(g);
  var d = document.createElement('div');
  d.style.cssText = 'position:fixed;left:52px;bottom:44px;z-index:2147483647;pointer-events:none;' +
    'text-shadow:0 2px 18px rgba(0,0,0,.85);font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
  d.innerHTML =
    '${eyebrow ? `<div style="font-size:12px;font-weight:700;letter-spacing:.22em;color:${accent};margin-bottom:12px">${eyebrow}</div>` : ''}' +
    '<div style="font-size:${title.length > 12 ? 38 : 46}px;font-weight:800;color:#fff;letter-spacing:.02em;line-height:1.15">${title}</div>' +
    '${sub ? `<div style="font-size:15px;color:#a8bcd4;margin-top:12px;letter-spacing:.02em">${sub}</div>` : ''}';
  document.body.appendChild(d);
` : '';

await send('Runtime.evaluate', {
  expression: `(function(){ var s=document.createElement('style'); s.textContent=${JSON.stringify(hideCss)}; document.head.appendChild(s); ${overlay} })()`
});
await sleep(900);

const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90, fromSurface: true });
fs.writeFileSync(OUT, Buffer.from(shot.data, 'base64'));
const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`COVER ${OUT}  ${W}x${H}@${DSF}  ${kb} KB`);

ws.close(); child.kill(); process.exit(0);
