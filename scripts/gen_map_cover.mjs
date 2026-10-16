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
/* --hideLayers a,b,c：截图前把指定 MapLibre 图层设为不可见。
   某些专题的第二层数据（如国家聚合气泡）在封面构图里会盖住第一层的主体叙事，
   用它按专题裁层，不必为每张图去改页面代码。不传则行为不变。 */
const hideLayers = (arg('hideLayers', '') || '').split(',').map(s => s.trim()).filter(Boolean);
if (!slug) { console.error('缺 --slug'); process.exit(1); }

const OUT = arg('out', `public/maps/${slug}/vizmap-${slug}-cover.jpg`);
const URL_ = `${BASE}/maps/${slug}/index.html`;

try { fs.rmSync(PROF, { recursive: true, force: true }); } catch (_) {}
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

/* READY：可选就绪轮询。重数据地图的 JSON 下载/解析耗时不定，固定 sleep 容易
   截到「正在加载…」占位层。传一段 JS 表达式，返回真值即继续，最长轮询 60s。 */
const READY = process.env.READY;
if (READY) {
  let ok = false;
  for (let i = 0; i < 120; i++) {
    try {
      const r = await send('Runtime.evaluate', { expression: READY, returnByValue: true });
      if (r && r.result && r.result.value) { ok = true; break; }
    } catch (_) {}
    await sleep(500);
  }
  console.log('READY ' + (ok ? 'ok' : 'timeout(60s)'));
}

/* 封面视角：地图尽量占满画面（不套页面的侧栏留白），底部留出标题区 */
const PAD = process.env.PAD_L ? {
  left: Number(process.env.PAD_L), right: Number(process.env.PAD_R || 70),
  top: Number(process.env.PAD_T || 48), bottom: Number(process.env.PAD_B || 150)
} : { left: 70, right: 70, top: 48, bottom: 150 };
const fitInfo = await send('Runtime.evaluate', {
  returnByValue: true,
  expression: `(function(){
    /* 老代地图不暴露 window.__app（那是 thematic 引擎挂的），退而用全局 map 实例兜底。
       注意：__app 只要有 map 就该用（有的地图只暴露 map，没有 fitAll），
       不能因为没有 fitAll 就丢弃，否则按城市筛选的新图封面会取不到地图实例。 */
    var app = window.__app;
    if (!app || !app.map) app = (window.map && window.map.fitBounds) ? { map: window.map } : null;
    if (!app || !app.map) return { ok:false, app:typeof window.__app, map:typeof window.map };
    var m = app.map;
    /* 封面是 16:9 宽幅，整框往往需要比页面 minZoom 更小的级别，这里临时放开 */
    try { m.setMinZoom(0.8); } catch (e) {}
    /* --center "lng,lat" --zoom N：封面自定义取景（如按城市筛选的地图，
       全国框没有内容，需要落到某个有数据的城区）。给了 center 就跳过 fit。 */
    var CENTER = ${JSON.stringify(arg('center', ''))};
    var ZOOM = ${arg('zoom', '0')};
    if (CENTER) {
      var p = CENTER.split(',');
      m.jumpTo({ center: [+p[0], +p[1]], zoom: +ZOOM || 10 });
      var r0 = document.getElementById('map').getBoundingClientRect();
      return { ok:true, mode:'center', z:+m.getZoom().toFixed(3),
               c:m.getCenter().toArray().map(function(v){return +v.toFixed(3)}),
               box:[Math.round(r0.width),Math.round(r0.height)] };
    }
    /* thematic 的 fitBounds 默认 maxZoom=9，小国（新加坡/以色列）会被压小 ——
       MAXZ 提高上限让国家撑满画面；大国自然用不到，不受影响 */
    if (app.fitAll) app.fitAll({ padding: ${JSON.stringify(PAD)}, animate: false, maxZoom: ${process.env.MAXZ || 9} });
    else m.fitBounds(m.getBounds(), { padding: ${JSON.stringify(PAD)}, duration: 0 });
    var r = document.getElementById('map').getBoundingClientRect();
    return { ok:true, z:+m.getZoom().toFixed(3),
             c:m.getCenter().toArray().map(function(v){return +v.toFixed(3)}),
             b:m.getBounds().toArray().map(function(p){return [+p[0].toFixed(2),+p[1].toFixed(2)]}),
             box:[Math.round(r.width),Math.round(r.height)] };
  })()`
});
console.log('FIT ' + JSON.stringify(fitInfo.result.value));
/* fit 会改变视口 → 触发新瓦片请求；等底图（尤其卫星影像）真正加载再截图，否则背景是纯底色 */
await sleep(Number(process.env.WAIT2 || 1200));

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
  'cn-greenland-shp-2024': '.topbar, .control-card, .info-card, .card-toggle, .info-toggle-btn',
  'cn-gongye-yongdi-2024': '.topbar, .control-card, .info-card, .card-toggle, .info-toggle-btn',
  'cn-kuangchan-2021': '.topbar, .control-card, .info-card, .card-toggle, .info-toggle-btn',
};
const extraHide = LEGACY_UI[slug] || '';

const hideCss = `
  .intro, .detail, .dock, .panel, .maplibregl-ctrl-bottom-right, .timeline, .playbar,
  .maplibregl-ctrl-top-right, .maplibregl-ctrl-top-left { display: none !important; }
  ${extraHide} { display: none !important; }
  ${keepLabels ? '' : '#labels { display: none !important; }'}
`;
/* 详情页封面用 <img object-cover> 展示，四周按容器比例裁切：
   - 桌面横容器裁上下、手机竖容器裁左右 —— 唯一任何裁切都保得住的位置是正中央。
   - TITLE_CENTER=1 时标题放画面正中 + 径向暗色晕影，专供 downloads 详情页。 */
const TITLE_CENTER = !!process.env.TITLE_CENTER;
const titleHtml =
  `${eyebrow ? `<div style="font-size:12px;font-weight:700;letter-spacing:.22em;color:${accent};margin-bottom:12px">${eyebrow}</div>` : ''}` +
  `<div style="font-size:${TITLE_CENTER ? (title.length > 12 ? 34 : 42) : (title.length > 12 ? 38 : 46)}px;font-weight:800;color:#fff;letter-spacing:.02em;line-height:1.15">${title}</div>` +
  `${sub ? `<div style="font-size:15px;color:#a8bcd4;margin-top:12px;letter-spacing:.02em">${sub}</div>` : ''}`;
const overlay = title ? (TITLE_CENTER ? `
  var g = document.createElement('div');
  g.style.cssText = 'position:fixed;left:0;right:0;top:0;bottom:0;z-index:2147483646;pointer-events:none;' +
    'background:radial-gradient(ellipse 72% 58% at center, rgba(6,11,20,.88) 0%, rgba(6,11,20,.62) 46%, rgba(6,11,20,0) 100%)';
  document.body.appendChild(g);
  var d = document.createElement('div');
  d.style.cssText = 'position:fixed;left:6%;right:6%;top:50%;transform:translateY(-50%);z-index:2147483647;pointer-events:none;text-align:center;' +
    'text-shadow:0 2px 18px rgba(0,0,0,.85);font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
  d.innerHTML = ${JSON.stringify(titleHtml)};
  document.body.appendChild(d);
` : `
  var g = document.createElement('div');
  g.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:46%;z-index:2147483646;pointer-events:none;' +
    'background:linear-gradient(to top, rgba(6,11,20,.94) 0%, rgba(6,11,20,.72) 34%, rgba(6,11,20,0) 100%)';
  document.body.appendChild(g);
  var d = document.createElement('div');
  d.style.cssText = 'position:fixed;left:52px;bottom:44px;z-index:2147483647;pointer-events:none;' +
    'text-shadow:0 2px 18px rgba(0,0,0,.85);font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
  d.innerHTML = ${JSON.stringify(titleHtml)};
  document.body.appendChild(d);
`) : '';

await send('Runtime.evaluate', {
  expression: `(function(){ var s=document.createElement('style'); s.textContent=${JSON.stringify(hideCss)}; document.head.appendChild(s);
    ${hideLayers.length ? `(function(){
      var m = (window.__app || {}).map || window.__map;
      if (!m) return;
      ${JSON.stringify(hideLayers)}.forEach(function (id) {
        try { if (m.getLayer(id)) m.setLayoutProperty(id, 'visibility', 'none'); } catch (e) {}
      });
    })()` : ''}
    ${overlay} })()`
});
await sleep(900);

const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90, fromSurface: true });
fs.writeFileSync(OUT, Buffer.from(shot.data, 'base64'));
const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
console.log(`COVER ${OUT}  ${W}x${H}@${DSF}  ${kb} KB`);

ws.close(); child.kill(); process.exit(0);
