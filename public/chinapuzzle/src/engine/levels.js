// 关卡注册表 —— 可扩展拼图引擎的核心扩展点。
// 未来要做「美国州拼图」「世界国家拼图」，只需提供同样结构的数据模块
// （viewBox + regions[{id,name,short,path,home,meta}] + background），在此注册即可。
import { CHINA } from '../../data/chinaData.js';
import { CHINA_REGIONS } from '../../data/chinaRegions_region.js';
import { PROVINCE_LIST, REGION_ORDER } from '../../data/provinceIndex.js';

export { PROVINCE_LIST, REGION_ORDER };

// 把数据模块里的 region 列表统一成引擎需要的形态（兼容「顶层字段」与「meta 字段」两种来源）
function toRegions(list) {
  return list.map((p) => {
    const meta = p.meta || {};
    return {
      id: p.adcode != null ? p.adcode : p.id,
      name: p.name,
      short: p.short,
      path: p.path,
      home: p.home,
      meta: {
        abbr: meta.abbr != null ? meta.abbr : p.abbr,
        capital: meta.capital != null ? meta.capital : p.capital,
        population: meta.population != null ? meta.population : p.population,
        gdp: meta.gdp != null ? meta.gdp : p.gdp,
        area: meta.area != null ? meta.area : p.area,
        feature: meta.feature != null ? meta.feature : p.feature,
      },
    };
  });
}

function chinaToLevel() {
  return {
    id: 'china-province',
    title: '中国省级行政区',
    subtitle: `省级行政区 · ${CHINA.provinces.length} 块`,
    difficulty: 'normal',
    tag: '普通',
    viewBox: CHINA.viewBox,
    regions: toRegions(CHINA.provinces),
    background: CHINA.background
      ? { path: CHINA.background, box: CHINA.backgroundBox }
      : null,
  };
}

function chinaRegionLevel() {
  return {
    id: 'china-region',
    title: '中国地理大区',
    subtitle: `七大地理区 · ${CHINA_REGIONS.regions.length} 块`,
    difficulty: 'region',
    tag: '大区',
    viewBox: CHINA_REGIONS.viewBox,
    regions: CHINA_REGIONS.regions.map((r) => ({
      id: r.id,
      name: r.name,
      short: r.short,
      path: r.path,
      home: r.home,
      meta: r.meta,
    })),
    background: null,
  };
}

// 「省市地划」合集入口：本身不可直接开玩，点开后在首页展开省份选择
const TOTAL_CITIES = PROVINCE_LIST.reduce((s, p) => s + p.count, 0);
function cityCollectionLevel() {
  return {
    id: 'province-cities',
    title: '省内地市拼图',
    subtitle: `${PROVINCE_LIST.length} 省合集 · 共 ${TOTAL_CITIES} 区划`,
    difficulty: 'city',
    tag: '合集',
    collection: true,
    viewBox: CHINA.viewBox,
    regions: [],
    background: null,
  };
}

export const LEVELS = [chinaToLevel(), chinaRegionLevel(), cityCollectionLevel()];

// ---- 各省地市关卡：按需 dynamic import，避免首屏加载全部 700+KB ----
export const PROVINCE_LEVEL_PREFIX = 'pc-';
const provinceCache = new Map();

export function isProvinceLevelId(id) {
  return typeof id === 'string' && id.startsWith(PROVINCE_LEVEL_PREFIX);
}

export function provinceLevelId(adcode) {
  return PROVINCE_LEVEL_PREFIX + adcode;
}

export function provinceInfo(adcode) {
  return PROVINCE_LIST.find((p) => p.id === String(adcode)) || null;
}

function buildProvinceLevel(adcode, pc) {
  return {
    id: provinceLevelId(adcode),
    title: `${pc.name} · 地市拼图`,
    subtitle: `${pc.cities.length} 个下辖行政区`,
    difficulty: 'city',
    tag: pc.short,
    provinceId: String(adcode),
    viewBox: pc.viewBox,
    regions: toRegions(pc.cities),
    background: null,
  };
}

// 按省加载关卡（带缓存）。传入 adcode 或 'pc-<adcode>' 均可。
export async function loadProvinceLevel(idOrCode) {
  const adcode = isProvinceLevelId(idOrCode)
    ? idOrCode.slice(PROVINCE_LEVEL_PREFIX.length)
    : String(idOrCode);
  if (provinceCache.has(adcode)) return provinceCache.get(adcode);
  const mod = await import(`../../data/provinces/${adcode}.js`);
  const lv = buildProvinceLevel(adcode, mod.PROVINCE);
  provinceCache.set(adcode, lv);
  return lv;
}

// 同步取关卡（仅基础关卡 + 已加载过的省份关卡）
export function getLevel(id) {
  if (isProvinceLevelId(id)) {
    const adcode = id.slice(PROVINCE_LEVEL_PREFIX.length);
    return provinceCache.get(adcode) || LEVELS[0];
  }
  return LEVELS.find((l) => l.id === id) || LEVELS[0];
}

// 异步取关卡：统一入口，基础关卡直接返回，省份关卡按需加载
export async function resolveLevel(id) {
  if (isProvinceLevelId(id)) return loadProvinceLevel(id);
  return getLevel(id);
}

// 按大区分组的省份列表，供首页折叠展示
export function provincesByRegion() {
  const map = new Map(REGION_ORDER.map((r) => [r, []]));
  for (const p of PROVINCE_LIST) {
    if (!map.has(p.region)) map.set(p.region, []);
    map.get(p.region).push(p);
  }
  return [...map.entries()].filter(([, list]) => list.length);
}
