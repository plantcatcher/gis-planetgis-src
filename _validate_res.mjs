import { readFileSync } from 'node:fs';

const p = 'D:/WorkSpace/00PlanetGIS源码/content/downloads/gs-2024-0650-shp.md';
const raw = readFileSync(p, 'utf-8');
const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
if (!m) { console.error('FAIL: 无 frontmatter'); process.exit(1); }
const fm = {};
for (const line of m[1].split('\n')) {
  const i = line.indexOf(':'); if (i === -1) continue;
  const k = line.slice(0, i).trim();
  let v = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  if (v) fm[k] = v;
}
const body = m[2].trim();
const text = body.replace(/[#>*`\-]/g, ' ').replace(/\s+/g, ' ').trim();

const required = ['slug', 'title', 'summary', 'date', 'category', 'tags', 'access', 'trigger', 'keywordAliases', 'code', 'download', 'format', 'size'];
const missing = required.filter((k) => !fm[k]);
const errs = [];
if (missing.length) errs.push('缺失字段: ' + missing.join(', '));
if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.date || '')) errs.push('date 格式应为 YYYY-MM-DD');
if ((fm.slug || '').length > 30) errs.push('slug 超 30 字符');
if (!/^[a-z0-9-]+$/.test(fm.slug || '')) errs.push('slug 含非法字符(应仅小写字母/数字/连字符)');
if (text.length < 300) errs.push(`正文纯文本仅 ${text.length} 字，需 ≥300`);
if (!['open', 'gated'].includes(fm.access)) errs.push('access 非法');

const lines = [
  'slug        : ' + fm.slug + ' (len=' + fm.slug.length + ')',
  'category    : ' + fm.category,
  'access      : ' + fm.access,
  'code        : ' + fm.code,
  'trigger     : ' + fm.trigger,
  'aliases     : ' + fm.keywordAliases,
  'format/size : ' + fm.format + ' / ' + fm.size,
  '正文纯文本   : ' + text.length + ' 字',
  'cover       : ' + (fm.cover || '(无，使用占位)'),
  'canonical   : https://planetgis.cn/downloads/' + fm.slug,
];
let report = lines.join('\n');
if (errs.length) {
  report += '\n\n校验未通过:\n - ' + errs.join('\n - ');
  console.error(report);
} else {
  report += '\n\n✓ 校验通过：必填字段齐全、slug 合规、正文达标，可正常预渲染并通过 check-seo 门禁。';
  console.log(report);
}
import('node:fs').then((fs) => fs.writeFileSync('D:/WorkSpace/00PlanetGIS源码/_validate_out.txt', report, 'utf8'));
