#!/usr/bin/env node
/**
 * 合并三份词典（chrome / regions / apps）+ chrome 的 sub 表，
 * 内联进引擎模板，产出 public/shared/map-i18n.js（唯一产物，请勿手改）。
 *
 * 用法：node scripts/gen-map-i18n.mjs
 * 词典源：scripts/i18n-maps-src/*.json（由 _gen_regions_dict.py / _gen_apps_dict.py 生成）
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'scripts', 'i18n-maps-src');
const DST = join(ROOT, 'public', 'shared', 'map-i18n.js');
const TPL = join(ROOT, 'scripts', 'map-i18n-engine.js');

/** 归一化与引擎 norm() 对齐：去全部空白 + 去首尾图标字符 */
const EDGE_ICON = '\u2039\u203a\u00ab\u00bb\u25c9\u2715\u2716\uff0d\u2013\u2014\u00d7\u00f7\u25cb\u25cf\u25a0\u25a1\u25b3\u25b2\u25c7\u25c6\u2605\u2606\u203b\u00a7\u00b6\u2022';
const EDGE_RE = new RegExp('^[' + EDGE_ICON + ']+|[' + EDGE_ICON + ']+$', 'g');
function norm(s) {
  return String(s == null ? '' : s).replace(/[\s\u3000]+/g, '').replace(EDGE_RE, '');
}

function load(name) {
  const p = join(SRC, name + '.json');
  return JSON.parse(readFileSync(p, 'utf-8'));
}

// ── 合并 exact：chrome 优先，regions 次之，apps 兜底，games 最后（引擎 indexDict 先到先得） ──
const exact = {};
const subs = {};
let nExact = 0;
for (const name of ['chrome', 'regions', 'apps', 'games']) {
  const d = load(name);
  for (const [k, v] of Object.entries(d.exact || {})) {
    const nk = norm(k);
    if (nk && !(nk in exact)) {
      exact[nk] = v;
      nExact++;
    }
  }
  for (const [k, v] of Object.entries(d.sub || {})) {
    if (k && !(k in subs)) subs[k] = v;
  }
}

const DICT = { exact, sub: subs };

// ── 应用作用域词典：scripts/i18n-maps-src/apps/<slug>.json ──
// 用途：游戏数据层（国名 / 省名 / 题库）只在对应游戏内译成英文，
//       绝不污染 82 个地图应用的中文地名。
const APP_DIR = join(SRC, 'apps');
const apps = {};
let nApp = 0;
if (existsSync(APP_DIR)) {
  for (const file of readdirSync(APP_DIR)) {
    if (!file.endsWith('.json')) continue;
    const slug = file.replace(/\.json$/, '');
    const d = JSON.parse(readFileSync(join(APP_DIR, file), 'utf-8'));
    const aExact = {};
    const aSub = {};
    for (const [k, v] of Object.entries(d.exact || {})) {
      const nk = norm(k);
      if (nk && !(nk in aExact)) aExact[nk] = v;
    }
    for (const [k, v] of Object.entries(d.sub || {})) {
      if (k && !(k in aSub)) aSub[k] = v;
    }
    if (Object.keys(aExact).length || Object.keys(aSub).length) {
      apps[slug] = { exact: aExact, sub: aSub };
      nApp++;
    }
  }
}
DICT.apps = apps;

// ── 内联进模板 ──
const tpl = readFileSync(TPL, 'utf-8');
const MARK = '/*__DICT__*/null';
if (!tpl.includes(MARK)) {
  console.error('FATAL: 引擎模板缺少 ' + MARK + ' 占位符');
  process.exit(1);
}
const out = tpl.replace(MARK, () => JSON.stringify(DICT));
if (out.includes(MARK)) {
  console.error('FATAL: 占位符替换失败');
  process.exit(1);
}

mkdirSync(dirname(DST), { recursive: true });
writeFileSync(DST, out, 'utf-8');
const kb = (Buffer.byteLength(out, 'utf-8') / 1024).toFixed(1);
console.log(`map-i18n.js: ${nExact} exact + ${Object.keys(subs).length} sub, ${nApp} app scopes, ${kb} KB -> public/shared/map-i18n.js`);
