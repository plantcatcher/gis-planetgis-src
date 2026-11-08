// 内容元数据的中英标签映射。
//
// 与 dict（界面文案）的区别：这里的中文串来自 **md frontmatter 与 vizmaps.json**，
// 是内容数据而非界面文案。正文与元数据全面英文化之前，靠这张表把最常见的
// 分类 / 学科 / 地域值在地化显示，英文站不至于出现「英文句子里夹中文分类名」。
//
// 查不到映射时原样返回（保留中文），不做机器翻译——宁可显示中文原名，
// 也不要把「国土空间规划」译成谁都看不懂的生造词。

import type { Lang } from './config';

/** 地理知识库的四大学科方向（content/learn 的 subject 字段） */
const SUBJECT: Record<string, string> = {
  自然地理: 'Physical Geography',
  人文地理: 'Human Geography',
  区域地理: 'Regional Geography',
  地理信息技术: 'GIS & Remote Sensing',
};

/** 互动地图 / 游戏的地域范围（scope 字段，受控词表） */
const SCOPE: Record<string, string> = {
  中国: 'China',
  世界: 'World',
  太空: 'Space',
  通用: 'General',
};

/**
 * 互动地图 / 游戏的专题（topics 字段，受控词表）。
 *
 * 与 scope 正交：scope 答「画的是哪儿」，topics 答「画的是什么」。
 * 只收录受控词表里的值——更细的粒度先并进这些桶，不要新增只含一两条的孤岛，
 * 否则 /maps 的筛选 chip 会退化成一排单例。
 */
const TOPIC: Record<string, string> = {
  行政区划: 'Administrative Divisions',
  商业地理: 'Commercial Geography',
  水系与地形: 'Rivers & Terrain',
  城市与经济: 'Cities & Economy',
  能源与工业: 'Energy & Industry',
  人口与社会: 'Population & Society',
  历史地理: 'Historical Geography',
  地质灾害: 'Geohazards',
  天文与航天: 'Astronomy & Spaceflight',
  遥感与影像: 'Remote Sensing',
  人文地理: 'Human Geography',
  交通与贸易: 'Transport & Trade',
  极地与科考: 'Polar Research',
  地图投影: 'Map Projections',
  看图竞猜: 'Map Quiz',
  拼图挑战: 'Jigsaw Challenge',
  趣味测试: 'Trivia',
};

/** 知识库专题栏目（content/learn 的 category 字段） */
const LEARN_CATEGORY: Record<string, string> = {
  海平面模拟: 'Sea Level',
  历史地理: 'Historical Geography',
  区域地理: 'Regional Geography',
  地理基础: 'Geography Basics',
};

/** 资料下载分类（content/downloads 的 category 字段） */
const RESOURCE_CATEGORY: Record<string, string> = {
  地理数据: 'Geo Data',
  标准规范: 'Standards',
  国土空间规划: 'Spatial Planning',
  图书教材: 'Books & Textbooks',
  'GIS与遥感': 'GIS & Remote Sensing',
  人文地理: 'Human Geography',
  自然地理: 'Physical Geography',
  城市与区域: 'Cities & Regions',
  计算机与编程: 'Computing & Programming',
  测绘与地球科学: 'Surveying & Earth Science',
  高中地理: 'High-School Geography',
};

/** 作品 / 游戏 / 工具的 category 字段（三者共用一张表，取值互不重叠） */
const WORK_CATEGORY: Record<string, string> = {
  互动地图: 'Interactive Maps',
  地理小游戏: 'Geo Games',
  地理游戏: 'Geography Games',
  地理小工具: 'Geography Tools',
  模拟实验: 'Simulations',
  地形分析: 'Terrain Analysis',
  趣味测试: 'Quizzes',
};

/** 资料下载的顶层分类（group） */
const GROUP: Record<string, string> = {
  文献资料: 'Documents',
  地理数据: 'Geo Data',
};

/** 资料性质（resourceDocType 的取值） */
const DOC_TYPE: Record<string, string> = {
  图书教材: 'Books & Textbooks',
  标准规范: 'Standards',
  规划文本: 'Spatial Plans',
};

/** 标准级别 */
const STD_LEVEL: Record<string, string> = {
  国家标准: 'National',
  行业标准: 'Industry',
  地方标准: 'Local',
};

/** 规划层级 */
const PLAN_LEVEL: Record<string, string> = {
  省级: 'Provincial',
  市级: 'City',
};

/** 区域轴里的世界侧取值（region 字段，含 areaLabel 归一化后的「全国」） */
const REGION: Record<string, string> = {
  全球: 'Global',
  国外: 'Outside China',
  国内: 'Nationwide',
  全国: 'Nationwide',
  月球: 'The Moon',
  火星: 'Mars',
};

/** 34 个省级行政区：英文站显示拼音 / 惯用英文名，否则「广东」对外国读者毫无意义。
 *  西藏按中国政府官方英文译名写作 Xizang。 */
const PROVINCE: Record<string, string> = {
  北京: 'Beijing', 天津: 'Tianjin', 河北: 'Hebei', 山西: 'Shanxi', 内蒙古: 'Inner Mongolia',
  辽宁: 'Liaoning', 吉林: 'Jilin', 黑龙江: 'Heilongjiang',
  上海: 'Shanghai', 江苏: 'Jiangsu', 浙江: 'Zhejiang', 安徽: 'Anhui', 福建: 'Fujian',
  江西: 'Jiangxi', 山东: 'Shandong',
  河南: 'Henan', 湖北: 'Hubei', 湖南: 'Hunan', 广东: 'Guangdong', 广西: 'Guangxi', 海南: 'Hainan',
  重庆: 'Chongqing', 四川: 'Sichuan', 贵州: 'Guizhou', 云南: 'Yunnan', 西藏: 'Xizang',
  陕西: 'Shaanxi', 甘肃: 'Gansu', 青海: 'Qinghai', 宁夏: 'Ningxia', 新疆: 'Xinjiang',
  台湾: 'Taiwan', 香港: 'Hong Kong', 澳门: 'Macao',
};

/**
 * 互动地图的坐标系（vizmaps.json 的 crs 字段，取首个分句后的取值）。
 *
 * 纯拉丁串（WGS84 / EPSG:4326、GCJ-02、CGCS2000…）中外一致，不入表，查不到时
 * localizeLabel 会原样返回；这里只收含中文、英文站必须改写的那几条。
 */
const VIZ_CRS: Record<string, string> = {
  'WGS84 生成后转为 GCJ-02': 'WGS84, converted to GCJ-02',
  'IAU 月面经纬': 'IAU lunar selenographic coordinates',
  'IAU 火星约定：planetocentric 纬度': 'IAU Mars convention: planetocentric latitude',
  地球固连参考系: 'Earth-fixed reference frame',
};

/** 互动地图的底图（vizmaps.json 的 basemap 字段，取首个分句后的取值） */
const VIZ_BASEMAP: Record<string, string> = {
  'Esri World Imagery 卫星影像': 'Esri World Imagery satellite imagery',
  'Esri 全球影像：卫星影像 World Imagery': 'Esri World Imagery satellite imagery',
  'Esri「Polar / Antarctic Imagery」卫星影像': 'Esri Polar / Antarctic Imagery satellite imagery',
  'Esri World Imagery Wayback 存档影像': 'Esri World Imagery Wayback archive',
  '高德瓦片：卫星影像 style=6': 'AMap tiles: satellite imagery (style=6)',
  '高德瓦片：矢量路网 style=7': 'AMap tiles: vector road network (style=7)',
  '高德瓦片：白底': 'AMap tiles: white background',
  '高德瓦片：深色无底图': 'AMap tiles: dark, no basemap',
  '天地图：卫星影像 img_w': 'Tianditu: satellite imagery (img_w)',
  卫星影像: 'Satellite imagery',
  深色无底图: 'Dark, no basemap',
  深色: 'Dark',
  古羊皮卷: 'Antique parchment',
  'NASA Black Marble': 'NASA Black Marble',
  '自托管 3D 地球：NASA': 'Self-hosted 3D globe: NASA',
  '自托管 3D 球体 + Solar System Scope 2K 月面纹理':
    'Self-hosted 3D sphere + Solar System Scope 2K lunar texture',
  '自托管 3D 球体 + Solar System Scope 2K 火面纹理':
    'Self-hosted 3D sphere + Solar System Scope 2K Martian texture',
  真实地球昼面贴图: 'True-colour Earth day-side texture',
  '自托管 Three.js 平面网格 + 真实 WGS84 DEM 顶点色高程晕渲':
    'Self-hosted Three.js planar mesh + true-elevation WGS84 DEM vertex-colour hillshade',
};

const TABLES: Record<string, string>[] = [
  SUBJECT,
  SCOPE,
  TOPIC,
  LEARN_CATEGORY,
  RESOURCE_CATEGORY,
  WORK_CATEGORY,
  GROUP,
  DOC_TYPE,
  STD_LEVEL,
  PLAN_LEVEL,
  REGION,
  PROVINCE,
  VIZ_CRS,
  VIZ_BASEMAP,
];

/**
 * 互动地图「要素计量单位」（vizmaps.json 的 unit 字段）。
 *
 * 这些单位是内容作者手写的自由文本（全站 70 多种，含「个已登记月面要素（type=…）」这类长尾），
 * 逐条翻译维护成本高且容易漏。只把最高频的十几种译出来，其余统一回退 'items'——
 * 数字仍然准确，只是粒度为「多少项」，不会出现英文句子里夹中文单位。
 */
const UNIT: Record<string, string> = {
  '个一级行政区': 'first-level divisions',
  '个二级区划': 'second-level divisions',
  '个省级行政区': 'provincial-level divisions',
  '个省级区': 'provincial-level divisions',
  '个省': 'provinces',
  '个国家/地区': 'countries / regions',
  '个城市节点': 'city nodes',
  '个城市边界': 'city boundaries',
  '个运营国': 'operating countries',
  '个互动页面': 'interactive pages',
  '个监测城市': 'monitored cities',
  '座水电站': 'hydropower stations',
  '条主要洋流': 'major currents',
  '条主线': 'main routes',
  '处科考设施': 'research stations',
  '份省情档案': 'provincial profiles',
  '组统计口径': 'statistical series',
  '台核电机组': 'nuclear units',
  '次迁徙事件': 'migration events',
  '期存档影像': 'archived scenes',
  '所精英院校': 'institutions',
  // 各国行政区划类
  '个州 / 联邦区': 'states / federal districts',
  '个省级单元': 'provincial-level units',
  '个构成国': 'constituent countries',
  '个都道府县': 'prefectures',
  '个自治区': 'autonomous communities',
  '个道市级单位': 'provincial-level units',
  '个省市级单位': 'provincial-level units',
  '个州级单位': 'state-level units',
  '个省 / 地区': 'provinces / territories',
  '个联邦州': 'federal states',
  '个大区 / 群岛 / 领地': 'regions / archipelagos / territories',
  '个联邦主体': 'federal subjects',
  县级多边形: 'county polygons',
  // 要素计数类
  座城市: 'cities',
  条路线: 'routes',
  条代表路线: 'representative routes',
  处总馆馆舍: 'library buildings',
  个主要港口: 'major ports',
  颗卫星: 'satellites',
  '颗在轨卫星': 'satellites in orbit',
  粒人口点: 'population dots',
  次地震: 'earthquakes',
  级阶梯: 'terrain steps',
  个月份索引: 'monthly indices',
  个较大绿地面: 'large green-space polygons',
  个工业用地面: 'industrial land polygons',
  处矿产地: 'mineral deposits',
  '个国家/地区国界线': 'country boundaries',
  个已登记月面要素: 'catalogued lunar features',
  个已登记火星要素: 'catalogued Martian features',
  个高程像元: 'elevation cells',
};

/**
 * 计量单位本地化：英文站查不到映射就回退 items（数量本身仍然正确）。
 *
 * 作者常把统计口径塞在单位后面（`次地震（1900-01-01 至 2026-10-26，M≥6.0）`），
 * 所以整串查不到时再拿第一个分句查一次；分句规则与 knowledge.ts 的 firstClause 一致。
 */
export function localizeUnit(unit: string | undefined, lang: Lang): string {
  if (!unit) return '';
  if (lang !== 'en') return unit;
  const head = unit.split(/[（(；;，]/)[0].trim();
  return UNIT[unit] ?? UNIT[head] ?? 'items';
}

/**
 * 筛选器的「全部」哨兵值。
 *
 * ⚠️ 它是**状态值**，不是显示文案：列表页大量用它判断「未筛选」并决定是否写入 URL 参数。
 * 英文站的显示文案由 facetLabel() 换成 All，但状态比较必须继续用这个常量，
 * 否则 `activeSubject !== '全部'` 这类判断会全部失效。
 */
export const FACET_ALL = '全部';

/** 筛选器标签的显示值：'全部' → All，其余走中文元数据映射表 */
export function facetLabel(value: string, lang: Lang): string {
  if (lang !== 'en') return value;
  if (value === FACET_ALL) return 'All';
  return localizeLabel(value, lang);
}

/**
 * 把中文元数据标签转成当前语言。英文站查不到就原样返回（仍是中文），
 * 中文站永远返回原值——中文内容本来就该显示中文。
 */
export function localizeLabel(value: string | undefined, lang: Lang): string {
  if (!value) return '';
  if (lang !== 'en') return value;
  for (const table of TABLES) {
    const hit = table[value];
    if (hit) return hit;
  }
  return value;
}
