/* 一次性：world-hydro 介绍页配图 → public/shots/world-hydro/vizmap-world-hydro-hpN.jpg
 * 用法：BASE=http://127.0.0.1:8942 PORT=9830 node scripts/shoot_map_shots.mjs --slug world-hydro
 * 规格对齐既有先例 public/shots/cn-universities：1440x900 JPEG 约 145KB。
 * 每次重拍（而不是缩放既有 PNG）：截图脚本默认 DSF=2 产出 2880x1800，缩下来会糊。 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.BASE || 'http://127.0.0.1:8942';
const PORT = Number(process.env.PORT || 9830);
const W = Number(process.env.W || 1440);
const H = Number(process.env.H || 900);
const WAIT = Number(process.env.WAIT || 22000);
const PROF = '_g/prof_shots';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const slug = arg('slug');
if (!slug) { console.error('缺 --slug'); process.exit(1); }

const OUTDIR = arg('out', `public/shots/${slug}`);
/* hp_1 的取景：直接用地图自己的 bounds 就常常留太多空白（全球尺度下南极洲能吃掉
   五分之一画面）。给--zoom/--center 可以手动收紧，--zoom 只给值会保持当前中心。 */
const SHOT1_ZOOM = arg('zoom');
const SHOT1_CENTER = arg('center');   // "lng,lat"
/* hp_2 的取景中心：不给就用「离视口中心近 + 带数值属性」自动挑。
   自动挑可能落在沙漠/无人区，配图上看不出电站层级 —— 手动指定能保证落在
   该专题最有代表性的区域（如 world-hydro 用中国西南 101.8E/26.6N）。 */
const SHOT2_CENTER = arg('focus');
const SHOT2_ZOOM = arg('focusZoom');
fs.rmSync(PROF, { recursive: true, force: true });
fs.mkdirSync(OUTDIR, { recursive: true });

const child = spawn(CHROME, [
  '--headless=new', '--disable-gpu-sandbox', '--no-first-run', '--no-default-browser-check',
  '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--in-process-gpu',
  '--hide-scrollbars', '--no-proxy-server',
  '--user-data-dir=' + path.resolve(PROF), '--remote-debugging-port=' + PORT, 'about:blank'
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function wsUrl() {
  for (let i = 0; i < 90; i++) {
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
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: `${BASE}/maps/${slug}/index.html` });

/* 等页面真正就绪，而不是死等固定秒数：地图 boot 要下载数据（全球尺度可达 1.8MB）
   + 首批瓦片，冷加载常常超过 20s。截到「无法访问此网站」或空白页是最常见的翻车点。 */
const ready = await (async () => {
  const t0 = Date.now();
  while (Date.now() - t0 < 90000) {
    try {
      const r = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(function(){
          var m = window.__map || (window.__app || {}).map;
          if (!m || !m.getStyle) return { ok:false, why:'no map' };
          var st = m.getStyle();
          if (!st) return { ok:false, why:'style 未加载' };
          /* 不写死图层名：数出「有源且非背景」的图层里已渲染的要素总数 */
          var n = 0;
          st.layers.forEach(function (l) {
            if (l.type === 'background' || !l.source) return;
            try { n += m.queryRenderedFeatures({ layers: [l.id] }).length; } catch (e) {}
          });
          return { ok: m.loaded() && n > 0, why: 'loaded=' + m.loaded() + ' feats=' + n };
        })()`
      });
      if (r.result && r.result.value && r.result.value.ok) return true;
    } catch (_) {}
    await sleep(1000);
  }
  console.error('WARN 90s 内页面未就绪，仍继续截图（可能截到空图）');
  return false;
})();
console.log('READY ' + ready);
await sleep(2500);

/* 隐藏页面上会盖住地图的浮层（保留 #labels —— 国家名标注是配图要展示的信息）。
   注意 .detail 此刻先不隐藏：hp_2 要展示详情卡。 */
await send('Runtime.evaluate', {
  expression: `(function(){
    var s = document.createElement('style');
    s.id = 'shot-hide';
    s.textContent = '.intro, .dock, .panel, .maplibregl-ctrl-bottom-right, .maplibregl-ctrl-top-right{display:none!important}';
    document.head.appendChild(s);
  })()`
});
await sleep(600);

async function shot(name) {
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 86, fromSurface: true });
  const fp = path.join(OUTDIR, name);
  fs.writeFileSync(fp, Buffer.from(r.data, 'base64'));
  console.log('SHOT ' + fp + '  ' + (fs.statSync(fp).size / 1024).toFixed(0) + ' KB');
}

if (SHOT1_ZOOM || SHOT1_CENTER) {
  const c = SHOT1_CENTER ? SHOT1_CENTER.split(',').map(Number) : null;
  await send('Runtime.evaluate', {
    expression: `(function(){
      var m = window.__map || (window.__app || {}).map;
      m.jumpTo({ ${c ? 'center: [' + c[0] + ',' + c[1] + '],' : ''}
                  ${SHOT1_ZOOM ? 'zoom: ' + Number(SHOT1_ZOOM) + ',' : ''} duration: 0 });
    })()`
  });
  await sleep(3500);   // 等瓦片进来
}

await shot(`vizmap-${slug}-hp1.jpg`);
/* hp_1 是干净的总览态，隐藏详情卡；hp_2 要展示它，拍完再恢复 */
await send('Runtime.evaluate', {
  expression: `(function(){
    var s = document.getElementById('shot-hide'); if (!s) return;
    s.textContent += ', .detail{display:none!important}';
  })()`
});
await sleep(500);

/* 等瓦片真的加载完。easeTo / jumpTo 之后网络取瓦片要时间，只 sleep 固定秒数会拍到
   「瓦片只到一半」的错缝画面（曾拍出 3x3 网格错位）。用 m.loaded() 轮询到idle。 */
async function waitTiles(ms = 20000) {
  try {
    await send('Runtime.evaluate', {
      expression: `(function(){
        var m = window.__map || (window.__app || {}).map;
        return new Promise(function (res) {
          var n = 0, lim = ${Math.round(ms / 250)};
          var t = setInterval(function () {
            if (m.loaded() || ++n > lim) { clearInterval(t); res(!!m.loaded()); }
          }, 250);
        });
      })()`,
      awaitPromise: true
    });
  } catch (_) {}
  await sleep(2500);
}

/* 在当前视口里挑一个要素（不写死图层名，换专题也能用）：
   ① 动态找要素最多的 circle 图层；② 在其中挑「离视口中心近 + 带数值属性」的要素。
   带数值属性这条很关键 —— 随机一个可能落在沙漠/无人区，配图上既看不出层级也不好看。 */
const PICK_IN_VIEWPORT = `(function(){
  var m = window.__map || (window.__app || {}).map; if (!m) return null;
  var st = m.getStyle(), bestLayer = null, bestN = 0;
  st.layers.forEach(function (l) {
    if (l.type !== 'circle' || !l.source) return;
    try {
      var n = m.queryRenderedFeatures({ layers: [l.id] }).length;
      if (n > bestN) { bestN = n; bestLayer = l.id; }
    } catch (e) {}
  });
  if (!bestLayer) return null;
  var fs = m.queryRenderedFeatures({ layers: [bestLayer] });
  if (!fs.length) return null;
  var best = null, bestScore = -1e9;
  fs.forEach(function (f) {
    var g = f.geometry; if (!g || g.type !== 'Point') return;
    var p = m.project(g.coordinates);
    var d = Math.abs(p.x - ${W} / 2) + Math.abs(p.y - ${H} / 2);
    var props = f.properties || {}, hasNum = 0;
    for (var k in props) { if (typeof props[k] === 'number') { hasNum = 1; break; } }
    var score = (hasNum ? 4000 : 0) - d;
    if (score > bestScore) { bestScore = score; best = g.coordinates; }
  });
  return best ? [best[0], best[1]] : null;   // Point 实例不能直接过postMessage
})()`;

/* 第二张：点开一座电站的详情态，展示逐站信息面板。
   取景两条路径：
   - 给了 --focus：直接开到该坐标（+ --focusZoom），保证落在该专题最有代表性的区域；
   - 没给：在当前视口自动挑一个要素。
   两条路径都要「定位 → 等瓦片 → 在新视口里取要素 → 点击」，所以定位和取要素分成两步。 */
let picked = null;
if (SHOT2_CENTER) {
  const c = SHOT2_CENTER.split(',').map(Number);
  await send('Runtime.evaluate', {
    expression: `(function(){
      var m = window.__map || (window.__app || {}).map;
      m.jumpTo({ center: [${c[0]}, ${c[1]}], zoom: ${Number(SHOT2_ZOOM || 5.2)}, duration: 0 });
    })()`
  });
  await waitTiles();
}
{
  const r = await send('Runtime.evaluate', { returnByValue: true, expression: PICK_IN_VIEWPORT });
  picked = r.result && r.result.value ? r.result.value : null;
}
if (picked) {
  console.log('PICK ' + JSON.stringify(picked));
  await send('Runtime.evaluate', {
    expression: `(function(){
      var m = window.__map || (window.__app || {}).map;
      m.easeTo({ center: ${JSON.stringify(picked)}, zoom: ${SHOT2_CENTER ? Number(SHOT2_ZOOM || 5.2) : 5.2}, duration: 900 });
    })()`
  });
  /* easeTo 动画 900ms + 网络取瓦片，两层等待叠加 */
  await sleep(2500);
  await waitTiles();
  /* 触发点击让详情卡展开：直接模拟指针事件管线 */
  await send('Runtime.evaluate', {
    expression: `(function(){
      var m = window.__map || (window.__app || {}).map;
      var p = m.project(${JSON.stringify(picked)});
      var canvas = m.getCanvas();
      ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(function (t) {
        canvas.dispatchEvent(new MouseEvent(t, { clientX: p.x, clientY: p.y, bubbles: true, cancelable: true, view: window }));
      });
    })()`
  });
  await sleep(2200);
  /* 详情卡此前被隐藏（hp_1 是干净总览态），恢复显示并留出动画时间 */
  await send('Runtime.evaluate', {
    expression: `(function(){
      var s = document.getElementById('shot-hide');
      if (s) s.textContent = s.textContent.replace(', .detail{display:none!important}', '');
    })()`
  });
  await sleep(900);
  await shot(`vizmap-${slug}-hp2.jpg`);
} else {
  console.log('WARN 没取到可点要素，hp_2 跳过');
}

ws.close(); child.kill(); process.exit(0);
