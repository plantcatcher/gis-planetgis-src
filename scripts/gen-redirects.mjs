// 生成 Cloudflare Pages 的 public/_redirects：把迁移前的详情页 URL 301 到新地址。
//
// 为什么必须有：63 张地图的旧地址 /works/<slug> 已被百度收录，直接下线会全部变 404。
//
// 为什么映射要固化成本仓库的 JSON：这次迁移提交之后，git 索引里就再也没有
// content/works/<slug>.md 了，届时无法反推旧地址清单。所以 scripts/legacy-redirects.json
// 是这份历史映射的唯一真相，**随仓库提交，不要删**。
//
// 用法：node scripts/gen-redirects.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const legacy = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'scripts', 'legacy-redirects.json'), 'utf8'),
);

const pairs = Object.entries(legacy).sort((a, b) => a[0].localeCompare(b[0]));

const lines = [
  '# 由 scripts/gen-redirects.mjs 自动生成，请勿手动编辑。',
  '# 数据源：scripts/legacy-redirects.json',
  '# 迁移前 content/works 下的地图与游戏详情页 301 到新地址，保住已收录 URL 的权重。',
  '',
  ...pairs.map(([from, to]) => `${from}  ${to}  301`),
];

fs.writeFileSync(path.join(ROOT, 'public', '_redirects'), `${lines.join('\n')}\n`, 'utf8');
console.log(`已写出 ${pairs.length} 条 301 规则 -> public/_redirects`);
