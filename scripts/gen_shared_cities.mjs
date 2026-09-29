// 生成地理游戏共享城市主数据（单一权威源）
//
// 合并来源：
//   public/geoquiz/data.js     → CITY_DB（卫星图猜城市 100 城：坐标/国家/旗/俯视特征/冷知识/双语）
//   public/geotype/data/cities.js → CITIES（城市气候类型：气候/海拔/沿海/城市化，约 400 城）
//
// 产出：
//   public/shared/cities.js（经典脚本，挂载 window.CITY_MASTER / CITY_DB / CITIES）
//   - geoquiz、geotype 两个游戏改为从本文件取数，实现「改一处、全局同步」。
//   - byName：按中文城市名归并的跨游戏字段（含 geotype 城市详情页链接），供未来复用。
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GEOQUIZ_DATA = path.join(ROOT, 'public/geoquiz/data.js');
const GEOTYPE_CITIES = path.join(ROOT, 'public/geotype/data/cities.js');
const GEOTYPE_CITY_PAGES = path.join(ROOT, 'public/geotype/cities');
const OUT = path.join(ROOT, 'public/shared/cities.js');

// ---- 提取 geoquiz CITY_DB（经典脚本，用 vm 捕获全局 const）----
{
  const code = fs.readFileSync(GEOQUIZ_DATA, 'utf8');
  const sb = { module: undefined, window: undefined, console };
  vm.createContext(sb);
  vm.runInContext(code + '\n;__out = CITY_DB;', sb);
  var CITY_DB = sb.__out;
}
// ---- 提取 geotype CITIES ----
{
  const code = fs.readFileSync(GEOTYPE_CITIES, 'utf8');
  const sb = { window: {} };
  vm.createContext(sb);
  vm.runInContext(code + '\n;__out = window.CITIES;', sb);
  var CITIES = sb.__out;
}

console.log('geoquiz CITY_DB:', CITY_DB.length, '| geotype CITIES:', CITIES.length);

// ---- 归并：byName（中文城市名）----
const geotypeByName = new Map();
for (const c of CITIES) geotypeByName.set(c.city, c);

const detailPages = new Set();
try {
  for (const f of fs.readdirSync(GEOTYPE_CITY_PAGES)) {
    if (f.endsWith('.html')) detailPages.add(f.replace(/\.html$/, ''));
  }
} catch (e) { /* 无详情页目录则跳过 */ }

const byName = {};
// 先放 geoquiz 城市（多为世界城市，含坐标）
for (const c of CITY_DB) {
  const g = geotypeByName.get(c.name) || null;
  byName[c.name] = {
    name: c.name,
    nameEn: c.nameEn || '',
    country: c.country,
    flag: c.flag || '',
    lat: c.lat, lng: c.lng, zoom: c.zoom,
    geoquiz: true,
    climate: g ? g.climate : null,
    elevation: g ? g.elevation : null,
    coastal: g ? g.coastal : null,
    urbanization: g ? g.urbanization : null,
    geotypeDetail: detailPages.has(c.name) ? `/geotype/cities/${c.name}.html` : null,
  };
}
// 再补仅 geotype 有的城市（多为国内中小城市，无坐标）
for (const c of CITIES) {
  if (byName[c.city]) continue;
  byName[c.city] = {
    name: c.city,
    nameEn: '',
    country: c.country,
    flag: '',
    lat: null, lng: null, zoom: null,
    geoquiz: false,
    climate: c.climate,
    elevation: c.elevation,
    coastal: c.coastal,
    urbanization: c.urbanization,
    geotypeDetail: detailPages.has(c.city) ? `/geotype/cities/${c.city}.html` : null,
  };
}

const overlap = CITY_DB.filter((c) => geotypeByName.has(c.name)).length;
console.log('跨游戏同名城市(可双向复用):', overlap);
console.log('byName 总条目:', Object.keys(byName).length);
console.log('带 geotype 详情页链接:', Object.values(byName).filter((x) => x.geotypeDetail).length);

const fileText =
  '// 自动生成：地理游戏共享城市主数据（单一权威源）\n' +
  '// 合并自 geoquiz/data.js(CITY_DB) 与 geotype/data/cities.js(CITIES)\n' +
  '// 生成脚本：scripts/gen_shared_cities.mjs\n' +
  '// 修改城市数据请改本文件，geoquiz/geotype 均已改为从此处取数。\n' +
  'window.CITY_MASTER = ' + JSON.stringify({ geoquiz: CITY_DB, geotype: CITIES, byName }, null, 2) + ';\n' +
  'window.CITY_DB = window.CITY_MASTER.geoquiz;\n' +
  'window.CITIES = window.CITY_MASTER.geotype;\n';

fs.writeFileSync(OUT, fileText, 'utf8');
console.log('WROTE', OUT, '| size', fileText.length, 'chars');
console.log('OK');
