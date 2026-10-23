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

/** 学段（content/learn 的 level 字段） */
const LEVEL: Record<string, string> = {
  初中: 'Middle School',
  高中: 'High School',
  大学: 'University',
};

/** 互动地图 / 游戏的地域范围（scope 字段） */
const SCOPE: Record<string, string> = {
  中国: 'China',
  世界: 'World',
  通用: 'General',
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
};

/** 精品作品的子类（content/works 的 category 字段） */
const WORK_CATEGORY: Record<string, string> = {
  互动地图: 'Interactive Maps',
  地理小游戏: 'Geo Games',
  模拟实验: 'Simulations',
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

const TABLES: Record<string, string>[] = [
  SUBJECT,
  LEVEL,
  SCOPE,
  LEARN_CATEGORY,
  RESOURCE_CATEGORY,
  WORK_CATEGORY,
  GROUP,
  DOC_TYPE,
  STD_LEVEL,
  PLAN_LEVEL,
  REGION,
  PROVINCE,
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
};

/** 计量单位本地化：英文站查不到映射就回退 items（数量本身仍然正确） */
export function localizeUnit(unit: string | undefined, lang: Lang): string {
  if (!unit) return '';
  if (lang !== 'en') return unit;
  return UNIT[unit] ?? 'items';
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
