// 生成拼图用中国边界数据（中国地图拼图挑战）
//
// 单一权威数据源：public/maps/_shared/china-provinces.json
//   （DataV.GeoAtlas，与互动地图同源；35 要素 = 34 省 + 十段线）
//
// 本脚本从同一份源同时产出两份派生数据，保证边界精度、投影、坐标系完全一致：
//   1) public/chinapuzzle/data/chinaData.js        —— 全国 34 省级行政区（省级拼图模式）
//   2) public/chinapuzzle/data/chinaRegions_region.js —— 七大地理大区（大区拼图模式）
//
// 做法：Web Mercator 重投影进拼图现有坐标系（viewBox 0,0,1000,785.1，均匀缩放居中），
//       不输出南海九段线（用户选择：只升级省界、视图范围不变）。
// 元数据（population/gdp/feature…）按 adcode 从被覆盖前的旧文件继承，保持连续。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GEO = path.join(ROOT, 'public/maps/_shared/china-provinces.json');
const OLD_CHINA = path.join(ROOT, 'public/chinapuzzle/data/chinaData.js');
const OLD_REGIONS = path.join(ROOT, 'public/chinapuzzle/data/chinaRegions_region.js');
const PROVINCE_INDEX = path.join(ROOT, 'public/chinapuzzle/data/provinceIndex.js');
const OUT_CHINA = path.join(ROOT, 'public/chinapuzzle/data/chinaData.js');
const OUT_REGIONS = path.join(ROOT, 'public/chinapuzzle/data/chinaRegions_region.js');

const TARGET_W = 1000;
const TARGET_H = 785.1;
const ROUND = 1; // 坐标保留小数位（1000 宽视图下 0.1 单位≈0.01%）

// ---- 读取源 ----
const geo = JSON.parse(fs.readFileSync(GEO, 'utf8'));

function readObjJs(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  return JSON.parse(raw.slice(start, end + 1));
}

const OLD_CHINA_OBJ = readObjJs(OLD_CHINA);
const metaByCode = new Map();
for (const p of OLD_CHINA_OBJ.provinces) metaByCode.set(String(p.adcode), p);

// 大区模板（保留现有 id/name/short/meta，仅重算 path/home）
const { CHINA_REGIONS } = await import(pathToFileURL(OLD_REGIONS).href);
const REGION_TEMPLATES = CHINA_REGIONS.regions; // 7 个大区

// 省 → 所属大区 映射
const { PROVINCE_LIST } = await import(pathToFileURL(PROVINCE_INDEX).href);
const regionOf = new Map();
for (const p of PROVINCE_LIST) regionOf.set(p.id, p.region);

// ---- Mercator 投影 ----
const D2R = Math.PI / 180;
function merc(lon, lat) {
  const x = lon * D2R;
  const y = Math.log(Math.tan(Math.PI / 4 + (lat * D2R) / 2));
  return [x, y];
}

const provinces = geo.features.filter(
  (f) => !String(f.properties.adcode).includes('JD')
);

// 计算 34 省的 Mercator 包围盒
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (const f of provinces) {
  const walk = (c) => {
    if (typeof c[0] === 'number') {
      const [x, y] = merc(c[0], c[1]);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      return;
    }
    for (const s of c) walk(s);
  };
  walk(f.geometry.coordinates);
}
const bw = maxX - minX;
const bh = maxY - minY;
const scale = Math.min(TARGET_W / bw, TARGET_H / bh);
const padX = (TARGET_W - bw * scale) / 2;
const padY = (TARGET_H - bh * scale) / 2;

const r1 = (v) => Number(v.toFixed(ROUND));
function proj(lon, lat) {
  const [mx, my] = merc(lon, lat);
  // y 轴翻转：墨卡托 y 随纬度增大，而 SVG 的 y 轴向下，翻转后「北在上」
  return [r1((mx - minX) * scale + padX), r1((maxY - my) * scale + padY)];
}

// ---- 路径构建 ----
function ringToPath(ring) {
  let d = '';
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = proj(ring[i][0], ring[i][1]);
    d += (i === 0 ? `M${x},${y}` : `L${x},${y}`);
  }
  return d + 'Z';
}
function geomToPolygons(geom) {
  if (geom.type === 'Polygon') return [geom.coordinates];
  if (geom.type === 'MultiPolygon') return geom.coordinates;
  return [];
}
function multiToPath(geom) {
  let d = '';
  for (const poly of geomToPolygons(geom)) {
    for (const ring of poly) d += ringToPath(ring);
  }
  return d;
}

// ---- 组装全国省级 ----
const outProvinces = [];
const pathByCode = new Map();
for (const f of provinces) {
  const adcode = String(f.properties.adcode);
  const meta = metaByCode.get(adcode) || {};
  const [hx, hy] = proj(f.properties.center[0], f.properties.center[1]);
  const path = multiToPath(f.geometry);
  pathByCode.set(adcode, path);
  outProvinces.push({
    adcode,
    name: meta.name || f.properties.name,
    short: meta.short || f.properties.name.replace(/(省|市|自治区|特别行政区|壮族|回族|维吾尔|.*族)/g, '').slice(0, 3),
    abbr: meta.abbr || '',
    capital: meta.capital || '',
    population: meta.population || '',
    gdp: meta.gdp || '',
    area: meta.area || '',
    feature: meta.feature || '',
    path,
    home: [hx, hy],
  });
}

const chinaOut = {
  viewBox: [0, 0, TARGET_W, TARGET_H],
  provinces: outProvinces,
};

fs.writeFileSync(
  OUT_CHINA,
  '// 自动生成：中国省级行政区拼图数据（DataV.GeoAtlas GeoJSON → Web Mercator 重投影，与互动地图同源）\n' +
  '// 生成脚本：scripts/gen_puzzle_china.mjs（单一权威源：public/maps/_shared/china-provinces.json）\n' +
  'export const CHINA = ' + JSON.stringify(chinaOut, null, 2) + ';\n',
  'utf8'
);
console.log('WROTE', OUT_CHINA, '| provinces:', outProvinces.length);

// ---- 组装七大地理大区（合并成员省的投影路径，home = 合并路径的质心）----
function pathCentroid(d) {
  const nums = (d.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
  let sx = 0, sy = 0, n = 0;
  for (let i = 0; i < nums.length; i += 2) { sx += nums[i]; sy += nums[i + 1]; n++; }
  return n ? [r1(sx / n), r1(sy / n)] : [0, 0];
}

const outRegions = [];
for (const tpl of REGION_TEMPLATES) {
  const members = PROVINCE_LIST.filter((p) => p.region === tpl.short);
  let merged = '';
  for (const m of members) {
    const p = pathByCode.get(m.id);
    if (p) merged += p;
  }
  outRegions.push({
    id: tpl.id,
    name: tpl.name,
    short: tpl.short,
    path: merged,
    home: pathCentroid(merged),
    meta: tpl.meta || {},
  });
}

const regionsOut = {
  viewBox: [0, 0, TARGET_W, TARGET_H],
  regions: outRegions,
};

fs.writeFileSync(
  OUT_REGIONS,
  '// 自动生成：中国七大地理大区拼图数据（由省级边界合并；单一权威源：public/maps/_shared/china-provinces.json）\n' +
  '// 生成脚本：scripts/gen_puzzle_china.mjs\n' +
  'export const CHINA_REGIONS = ' + JSON.stringify(regionsOut, null, 2) + ';\n',
  'utf8'
);
console.log('WROTE', OUT_REGIONS, '| regions:', outRegions.length);

// ---- 验证统计 ----
function verts(d) { const n = (d.match(/-?\d+(?:\.\d+)?/g) || []); return n.length / 2; }
let vChina = 0; for (const p of outProvinces) vChina += verts(p.path);
let vReg = 0; for (const r of outRegions) vReg += verts(r.path);
console.log('全国顶点数:', vChina, '| 大区顶点数:', vReg);
console.log('OK');
