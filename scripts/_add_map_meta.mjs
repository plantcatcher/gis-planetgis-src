// 一次性脚本：给 16 张缺 <meta name="description"> 的自建模板地图补
// description / keywords / author（与其余 61 张保持同一套 head 约定）。
// 用法：node scripts/_add_map_meta.mjs [--dry]
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DRY = process.argv.includes('--dry');

const META = {
  'cn-rivers': {
    desc: '一张能点的中国水系图：1681 条河流按一至五级与人工运河分层着色，721 个湖泊水库水域面，悬停即出河名、干流归属与河长，支持中文、拼音与别名搜索。',
    kw: '中国河流,中国水系,长江,黄河,一级河流,河流分级,水系图,互动地图',
  },
  'us-rivers': {
    desc: '一张能点的美国水系图：943 条河流按一至六级分层着色，左侧目录随搜索过滤，悬停即出河名、所属水系与河长，可切换卫星影像 / 地形晕渲 / 深色底图。',
    kw: '美国河流,美国水系,密西西比河,河流分级,水文,互动地图',
  },
  'japan-rivers': {
    desc: '基于日本国交省国土数値情報 W05 河川原始数据：47 都道府县河流按主要河川 / 大河两档着色，悬停即出河名与河长，可切换卫星影像 / 地形晕渲 / 深色底图。',
    kw: '日本河流,日本水系,一级河川,国土数値情報,水文,互动地图',
  },
  'cn-basins': {
    desc: '塔里木、准噶尔、柴达木、四川四大盆地加吐鲁番—哈密、鄂尔多斯、松辽等共 12 个主要盆地，按真实地质边界着色，点击看位置、类型、海拔与特征。',
    kw: '中国盆地,塔里木盆地,准噶尔盆地,柴达木盆地,四川盆地,地形,互动地图',
  },
  'cn-plains': {
    desc: '东北、华北、长江中下游三大平原加成都、关中、河套、珠三角等 11 个区域平原，边界由公开高程数据按海拔与起伏度算出，点击看构成、海拔与土壤。',
    kw: '中国平原,东北平原,华北平原,长江中下游平原,地形,地势,互动地图',
  },
  'cn-plateaus': {
    desc: '青藏、内蒙古、黄土、云贵四大高原加鄂尔多斯、帕米尔共 6 个高原：权威矢量边界与高程数据算出的真实高原面，点击看位置、构成与海拔。',
    kw: '中国高原,青藏高原,内蒙古高原,黄土高原,云贵高原,地形,互动地图',
  },
  'cn-sams': {
    desc: '70 家山姆会员店、36 城、17 省，按拓店阶段四色着色，时间轴回放 1996—2024 三十年开店节奏，悬停即出店名、地址与开业年份。',
    kw: '山姆会员店,山姆,沃尔玛,仓储式超市,门店分布,商业地理,互动地图',
  },
  'cn-ikea': {
    desc: '37 家宜家门店、26 城、18 省，按开业阶段四色着色，时间轴回放 1998—2026 二十八年「蓝盒子」扩张史，悬停即出店名、业态与开业时间。',
    kw: '宜家,IKEA,蓝盒子,家居,门店分布,商业地理,互动地图',
  },
  'cn-costco': {
    desc: '截至 2026 年 9 月中国大陆 7 家开市客 Costco 门店、6 城、4 省，按拓店阶段三色着色，时间轴回放 2019—2024 六年开店节奏。',
    kw: '开市客,Costco,会员店,仓储式超市,门店分布,商业地理,互动地图',
  },
  'cn-starbucks': {
    desc: '截至 2025 财年中国内地 8011 家星巴克门店，按城市聚合为 102 个气泡并叠加省级密度面，时间轴回放 1999—2016 城市进驻节奏。',
    kw: '星巴克,Starbucks,咖啡,门店分布,城市,商业地理,互动地图',
  },
  'cn-tesla': {
    desc: '截至 2025 年中国内地 2300+ 座特斯拉超级充电站、覆盖 350+ 城市，按城市聚合为 115 个气泡并叠加省级密度面，时间轴回放 2014—2023 首站进驻。',
    kw: '特斯拉,Tesla,超级充电站,超充,新能源,城市,商业地理,互动地图',
  },
  'cn-luckin': {
    desc: '截至 2026 年 11 月大陆 37,918 家瑞幸咖啡门店，按城市聚合为 347 个气泡并叠加省级密度面，时间轴回放 2017—2026 城市首店进驻节奏。',
    kw: '瑞幸,瑞幸咖啡,luckin,咖啡,门店分布,下沉市场,商业地理,互动地图',
  },
  'cn-mixue': {
    desc: '截至 2026 年 10 月大陆 46,812 家蜜雪冰城门店，按 324 个城市级单元聚合为气泡，时间轴回放 1997—2026 由郑州向全国的下沉节奏。',
    kw: '蜜雪冰城,雪王,MIXUE,茶饮,门店分布,下沉市场,商业地理,互动地图',
  },
  'cn-lawson': {
    desc: '入华 30 年、截至 2026 年 6 月 7,018 家罗森门店、覆盖 17 个省市，按城市聚合为 138 个气泡，1996—2026 时间轴回放逐城首店进驻。',
    kw: '罗森,LAWSON,便利店,日系便利店,门店分布,商业地理,互动地图',
  },
  'cn-familymart': {
    desc: '入华 22 年、截至 2025 年底 3,226 家全家门店，只进 9 个省市 23 座城市，按城市聚合为 23 个气泡，2004—2026 时间轴回放逐城首店进驻。',
    kw: '全家,FamilyMart,便利店,日系便利店,门店分布,商业地理,互动地图',
  },
  'cn-7eleven': {
    desc: '入华 34 年、截至 2025 年底 5,565 家 7-ELEVEn 门店、19 个省级行政区、63 座可确认城市，按城市聚合为气泡，1992—2026 时间轴回放逐城首店。',
    kw: '7-ELEVEn,7-Eleven,711,便利店,日系便利店,门店分布,商业地理,互动地图',
  },
};

let changed = 0;
for (const [slug, { desc, kw }] of Object.entries(META)) {
  const file = join(ROOT, 'public/maps', slug, 'index.html');
  const html = readFileSync(file, 'utf8');
  if (html.includes('name="description"')) {
    console.log(`skip  ${slug}（已有 description）`);
    continue;
  }
  const titleEnd = html.indexOf('</title>');
  if (titleEnd < 0) throw new Error(`${slug}: 找不到 </title>`);
  const insertAt = html.indexOf('\n', titleEnd) + 1;
  const block =
    `  <meta name="description" content="${desc}" />\n` +
    `  <meta name="keywords" content="${kw}" />\n` +
    `  <meta name="author" content="PlanetGIS" />\n`;
  const out = html.slice(0, insertAt) + block + html.slice(insertAt);
  if (!DRY) writeFileSync(file, out);
  changed++;
  console.log(`${DRY ? 'would ' : 'patch '}${slug}`);
}
console.log(`\n${changed} 个文件${DRY ? '待修改' : '已修改'}`);
