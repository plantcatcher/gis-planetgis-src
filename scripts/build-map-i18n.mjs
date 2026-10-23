#!/usr/bin/env node
/**
 * 一键重建地图/游戏英译层。
 *
 * 步骤：
 *   1. 生成词典：regions / apps / geoshape / geotype / chinapuzzle
 *   2. 合并进引擎：public/shared/map-i18n.js（含应用作用域词典）
 *   3. 注入 <script src="/shared/map-i18n.js"> 到地图与游戏 index.html（幂等）
 *   4. 覆盖率自检：地图应用静态文案 0 未覆盖
 *
 * 用法：node scripts/build-map-i18n.mjs
 */
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NODE = process.execPath;
const PY = process.env.PYTHON || 'python';

function run(cmd, args, label) {
  process.stdout.write(`→ ${label}\n`);
  try {
    const out = execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
    if (out && out.trim()) process.stdout.write(out.trim().split('\n').map(l => '   ' + l).join('\n') + '\n');
  } catch (e) {
    process.stderr.write(`   FAILED: ${label}\n${e.stdout || ''}${e.stderr || ''}\n`);
    process.exit(1);
  }
}

// 1. 生成词典
for (const s of ['_gen_regions_dict.py', '_gen_apps_dict.py', '_gen_geoshape_dict.py', '_gen_geotype_dict.py', '_gen_chinapuzzle_dict.py']) {
  run(PY, [join('scripts', s)], s);
}
// 1b. geotype 英文内容集（源码级）
run(PY, [join('scripts', '_build_geotype_en.py')], '_build_geotype_en.py');

// 2. 合并进引擎
run(NODE, [join('scripts', 'gen-map-i18n.mjs')], 'gen-map-i18n.mjs');

// 3. 注入脚本标签
run(PY, [join('scripts', '_inject_i18n_html.py')], '_inject_i18n_html.py');

// 4. 覆盖率自检
run(PY, [join('scripts', '_check_coverage.py')], '_check_coverage.py');

process.stdout.write('\n完成。产物：public/shared/map-i18n.js\n');
