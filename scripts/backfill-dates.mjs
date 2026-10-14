#!/usr/bin/env node
/**
 * 一次性脚本：给 content/maps 与 content/games 的 md 补 `date:` 字段。
 *
 * 背景：这两个目录的 md 此前挂在 content/works 下，一直没有 date 字段，
 * 所以汇总页只能用 order（人工手排）当"默认"排序，"最新"无从谈起。
 * 这里用 git 里文件的首次提交日期作为上线日期回填——它反映的是内容真正出现在站上的时间。
 *
 * 用法：node scripts/backfill-dates.mjs [--dry]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const root = process.cwd();
const map = JSON.parse(fs.readFileSync(path.join(root, 'scripts/legacy-redirects.json'), 'utf8'));

// 新路径 -> 旧路径（content/works/<slug>.md）
const newToOld = new Map();
// legacy-redirects.json 的值是去扩展名的 URL，这里还原成仓库里的旧文件路径
for (const [oldPath, newPath] of Object.entries(map)) {
  newToOld.set(newPath, oldPath.replace(/^\/works\//, 'content/works/') + '.md');
}

const dirs = ['content/maps', 'content/games'];
let written = 0;
let missing = [];

for (const dir of dirs) {
  for (const file of fs.readdirSync(path.join(root, dir)).filter((f) => f.endsWith('.md'))) {
    const relNew = `${dir}/${file}`.replace(/\.md$/, '');
    const relOld =
      newToOld.get('/' + relNew.replace(/^content\//, '')) ?? `content/works/${path.basename(file)}`;

    let date = '';
    try {
      // --diff-filter=A：只看"新增"该文件的那次提交；tail -1 取最早一条
      const out = execFileSync(
        'git',
        ['log', '--diff-filter=A', '--format=%ad', '--date=short', '--', relOld],
        { cwd: root, encoding: 'utf8' },
      ).trim();
      const lines = out.split('\n').filter(Boolean);
      date = lines[lines.length - 1] || '';
    } catch {
      date = '';
    }
    if (!date) {
      missing.push(relNew);
      continue;
    }

    const abs = path.join(root, dir, file);
    const raw = fs.readFileSync(abs, 'utf8');
    if (/^date:/m.test(raw)) continue;

    // 插到 order 行之后；没有 order 就插到最后一条 frontmatter 键之后
    const lines = raw.split('\n');
    let idx = lines.findIndex((l) => /^order:/.test(l));
    if (idx === -1) {
      const end = lines.indexOf('---', 1);
      idx = end > 0 ? end - 1 : 0;
    }
    lines.splice(idx + 1, 0, `date: ${date}`);
    if (!DRY) fs.writeFileSync(abs, lines.join('\n'), 'utf8');
    written++;
  }
}

console.log(DRY ? '[dry-run] 将写入' : '已写入', written, '个文件的 date 字段');
if (missing.length) console.log('未取到 git 日期（需人工补）:', missing.join(', '));
