/* 互动地图专题页 · 无头实测（通用）
 *
 * 新增 / 改动任何一张 public/maps/<slug>/ 后跑一遍：确认页面能起来、数据加载、
 * 图层真的渲染出要素、UI 区块数量对得上，并留下截图。比人工开浏览器快，也不靠眼力。
 *
 * 用法：
 *   node scripts/verify_vizmap.mjs --slug tea-horse-road
 *   node scripts/verify_vizmap.mjs --slug cn-terrain-steps --mobile
 *   node scripts/verify_vizmap.mjs --slug cn-yangtze --click 610,420      # 点某像素后再截一张
 *   node scripts/verify_vizmap.mjs --slug tea-horse-road --clickAt 99.1,30  # 按经纬度投影像素再点（比硬编码像素稳）
 *
 * 前置：public/ 已用静态服务提供（默认 http://127.0.0.1:8899）
 *   python -m http.server 8899 --bind 127.0.0.1   （在 public/ 目录下）
 *
 * 环境：BASE / PORT / CHROME / KEEP_PROFILE
 * 输出：_shots/<slug>/*.png + 控制台 JSON
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
const PORT = Number(process.env.PORT || 9715);
const MOBILE = argv.includes('--mobile');
const W = Number(arg('w', MOBILE ? 390 : 1440));
const H = Number(arg('h', MOBILE ? 844 : 900));
const DSF = Number(arg('dsf', MOBILE ? 2 : 1));
const WAIT = Number(arg('wait', MOBILE ? 5200 : 5000));
const CLICK = arg('click', '');                 // "x,y"
const CLICK_AT = arg('clickAt', '');            // "lng,lat" —— 投影像素后点击
const OUT = arg('out', `_shots/${slug}`);
const PROF = `_g/prof_verify_${slug}`;
const URL_ = `${BASE}/maps/${slug}/index.html`;

if (!process.env.KEEP_PROFILE) fs.rmSync(PROF, { recursive: true, force: true });
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
  throw new Error('CDP 未就绪（Chrome 启动失败？）');
}

const ws = new WebSocket(await wsUrl());
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let id = 0; const pending = new Map(); const logs = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id); pending.delete(m.id);
    m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
    return;
  }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type !== 'log') {
    logs.push('[console.' + m.params.type + '] ' +
      (m.params.args || []).map((a) => a.value ?? a.description ?? a.type).join(' '));
  }
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails;
    logs.push('[exception] ' + (d.exception?.description || d.text));
  }
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
    logs.push('[log.error] ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
  }
};
const send = (method, params = {}) => new Promise((res, rej) => {
  const n = ++id; pending.set(n, { res, rej });
  ws.send(JSON.stringify({ id: n, method, params }));
});
const evalJs = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};
const shot = async (name) => {
  const r = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  const fp = path.join(OUT, name);
  fs.writeFileSync(fp, Buffer.from(r.data, 'base64'));
  console.log('SHOT ' + fp + '  ' + (fs.statSync(fp).size / 1024).toFixed(0) + 'KB');
};

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DSF, mobile: MOBILE });
if (MOBILE) {
  await send('Emulation.setUserAgentOverride', {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    platform: 'iPhone'
  });
}
await send('Page.navigate', { url: URL_ });
await sleep(WAIT);

const diag = await evalJs(`(function(){
  var out = { slug: ${JSON.stringify(slug)}, viewport: [${W}, ${H}], hasApp: !!window.__app, hasMap: !!window.__map };
  var m = window.__map;
  if (!m) return out;
  out.zoom = +m.getZoom().toFixed(2);
  out.center = m.getCenter().toArray().map(function(v){ return +v.toFixed(2) });
  /* 每个专题图层渲出来的要素数：0 说明数据没到或图层被藏了 */
  out.layers = {};
  m.getStyle().layers.forEach(function (l) {
    if (l.type === 'background' || l.source === 'prov' || l.source === 'grat' ||
        l.id.indexOf('amap') === 0) return;
    if (l.source && !(l.id in out.layers)) {
      try { out.layers[l.id] = m.queryRenderedFeatures({ layers: [l.id] }).length; } catch (e) { out.layers[l.id] = 'n/a'; }
    }
  });
  out.labels = document.querySelectorAll('#labels .tlabel').length;
  out.labelText = Array.prototype.map.call(document.querySelectorAll('#labels .tlabel'), function(e){ return e.textContent });
  out.ui = {
    chapters: document.querySelectorAll('.chapters button').length,
    strip: document.querySelectorAll('.strip button').length,
    legend: (document.getElementById('legend') || {}).textContent || '',
    panelRows: document.querySelectorAll('.panel .row').length,
    basemaps: document.querySelectorAll('input[name=basemap]').length,
    introCollapsed: !!(document.getElementById('intro') || {}).classList && document.getElementById('intro').classList.contains('is-collapsed')
  };
  out.detailHidden = (document.getElementById('detail') || {}).hidden;
  return out;
})()`);
console.log('DIAG ' + JSON.stringify(diag, null, 1));
await shot(MOBILE ? '01-mobile-overview.png' : '01-overview.png');

if (CLICK || CLICK_AT) {
  const pt = CLICK
    ? CLICK.split(',').map(Number)
    : await evalJs(`(function(){
        var p = window.__map.project([${CLICK_AT.split(',').map(Number).join(',')}]);
        return [p.x, p.y];
      })()`).then((a) => a.map(Math.round));
  const [cx, cy] = pt;
  const r = await evalJs(`(function(){
    window.__map.fire('click', { point: { x: ${cx}, y: ${cy} } });
    return true;
  })()`);
  await sleep(3000);
  const after = await evalJs(`(function(){
    var d = document.getElementById('detail');
    return {
      fired: ${JSON.stringify(r)},
      point: [${cx}, ${cy}],
      detailHidden: d.hidden,
      role: (document.getElementById('dtRole') || {}).textContent,
      name: (document.getElementById('dtName') || {}).textContent,
      metrics: Array.prototype.map.call(document.querySelectorAll('.dt-metrics em'), function(e){ return e.textContent }),
      activeChapters: Array.prototype.map.call(document.querySelectorAll('.chapters button.active'), function(b){ return b.dataset.id }),
      activeStrip: Array.prototype.map.call(document.querySelectorAll('.strip button.active'), function(b){ return b.dataset.id })
    };
  })()`);
  console.log('AFTER CLICK ' + JSON.stringify(after, null, 1));
  await shot(MOBILE ? '02-mobile-selected.png' : '02-selected.png');
}

/* --drawer：点一下底部卡片的收起/展开拉手，验证它真的在卡片顶部、箭头方向跟着翻转 */
if (argv.includes('--drawer')) {
  await evalJs(`(function(){ var b = document.getElementById('introBar'); if (b) b.click(); return true; })()`);
  await sleep(800);
  const st = await evalJs(`(function(){
    var i = document.getElementById('intro');
    var bar = document.getElementById('introBar');
    var head = document.querySelector('.intro-head');
    var c = bar && bar.querySelector('.caret');
    var txt = document.getElementById('introBarText');
    var title = bar && bar.querySelector('b');
    var icon = bar && bar.querySelector('.ic-eq');
    var tr = txt ? txt.getBoundingClientRect() : null;
    return {
      collapsed: i.classList.contains('is-collapsed'),
      barText: (txt || {}).textContent,
      caret: c ? getComputedStyle(c).transform : '',
      barTop: bar ? Math.round(bar.getBoundingClientRect().top) : null,
      headTop: head ? Math.round(head.getBoundingClientRect().top) : null,
      sheetTop: Math.round(i.getBoundingClientRect().top),
      bodyCollapsed: !!document.querySelector('.intro.is-collapsed .intro-body'),
      /* 「与卡片融为一体」：拉手自身不应有背景色块 / 分隔线 */
      barBg: bar ? getComputedStyle(bar).backgroundColor : '',
      barBorderBottom: bar ? getComputedStyle(bar).borderBottomWidth : '',
      /* 「仅保留收起/展开」：标题与图标在移动端应被隐藏 */
      titleHidden: title ? getComputedStyle(title).display === 'none' : null,
      iconHidden: icon ? getComputedStyle(icon).display === 'none' : null,
      /* 「居中」：胶囊文字中点与视口中心的偏差（px，应为个位数） */
      centerOffset: tr ? Math.round(tr.left + tr.width / 2 - window.innerWidth / 2) : null
    };
  })()`);
  console.log('DRAWER ' + JSON.stringify(st, null, 1));
  await shot('03-drawer-expanded.png');
}

console.log('LOGS ' + JSON.stringify(logs, null, 1));
if (logs.some((l) => l.indexOf('[exception]') === 0 || l.indexOf('[log.error]') === 0)) {
  console.error('❌ 存在页面错误');
  process.exitCode = 1;
}

ws.close(); child.kill();
process.exit(process.exitCode || 0);
