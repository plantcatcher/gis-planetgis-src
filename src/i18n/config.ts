// 站点国际化（i18n）基础配置。
//
// 语言版本的唯一判据是 **URL 前缀**，不是 localStorage、不是 navigator.language。
// 为什么：本站是 SSG，dist 里每个 URL 都是一份预渲染好的静态 HTML。
// 若首帧语言取自 localStorage，服务端渲染时读不到它（预渲染环境没有 localStorage），
// 就会产出中文 DOM、客户端却按英文渲染，hydrateRoot 判 mismatch 后整棵丢弃重建 ——
// 爬虫执行 JS 时看到整页 DOM 被替换，正是要避免的情况。
// localStorage / navigator.language 只用于「引导用户去哪个版本的 URL」，不参与首帧渲染。

export type Lang = 'zh' | 'en';

export const LANGS: Lang[] = ['zh', 'en'];

export const DEFAULT_LANG: Lang = 'zh';

/** 语言切换器上的显示名（各自用本语言书写，不翻译） */
export const LANG_LABEL: Record<Lang, string> = {
  zh: '中文',
  en: 'English',
};

/** <html lang> 属性值 */
export const HTML_LANG: Record<Lang, string> = {
  zh: 'zh-CN',
  en: 'en',
};

/** hreflang / OG 用的区域码 */
export const OG_LOCALE: Record<Lang, string> = {
  zh: 'zh_CN',
  en: 'en_US',
};

/** 英文版 URL 前缀。中文版不加前缀（保持既有 URL 不变，不影响已收录页面）。 */
export const EN_PREFIX = '/en';

/** 从路径推断语言。/en 与 /en/** 为英文，其余为中文。 */
export function langFromPath(pathname: string): Lang {
  const p = pathname || '/';
  return p === EN_PREFIX || p.startsWith(EN_PREFIX + '/') ? 'en' : 'zh';
}

/** 去掉语言前缀，返回与语言无关的路径。/en/learn/xxx -> /learn/xxx；/en -> / */
export function stripLang(pathname: string): string {
  const p = pathname || '/';
  if (langFromPath(p) !== 'en') return p;
  const rest = p.slice(EN_PREFIX.length); // '/learn/xxx' 或 ''
  return rest === '' ? '/' : rest;
}

/** 给路径加上语言前缀。'/' 在英文下是 '/en'，其余是 '/en' + path */
export function withLang(pathname: string, lang: Lang): string {
  const base = stripLang(pathname);
  if (lang === 'en') return base === '/' ? EN_PREFIX : EN_PREFIX + base;
  return base;
}

/** 是否为英文路径（含 /en 本身） */
export const isEnPath = (pathname: string): boolean => langFromPath(pathname) === 'en';

/**
 * 拥有英文版的**固定路由**清单。
 *
 * ⚠️ 必须与 scripts/site-routes.mjs 的 staticRoutes 减去 EN_EXCLUDE 保持一致：
 *    那边决定「预渲染哪些 /en/* 页面」，这边决定「页面声明哪些 hreflang」。
 *    两边不同步 → hreflang 指向 dist 里不存在的 /en 地址（死链声明）。
 *    为此 check-seo.mjs 会逐页校验 hreflang 目标可落地，漂移会让构建失败。
 *
 * 目前英文版只有「静态页 + 列表页」：内容详情页要等 content/en/ 建好才有真实内容。
 */
const EN_STATIC_ROUTES = new Set([
  '/',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms',
  '/works',
  '/learn',
  '/tools',
  '/games',
  '/maps',
  '/my',
  '/subdomains',
  '/downloads',
  '/changelog',
]);

/**
 * 该路径在英文站是否有真实对应的页面。
 *
 * 用于生成 hreflang：**没有英文版的页面绝不能声明 hreflang="en"**。
 * 旧实现无条件输出 zh-CN / en / x-default 三件套，而 collectRoutes() 只预渲染
 * 静态路由的英文版，详情页（/learn/xxx 等 497+ 篇）根本没有 /en 版本 ——
 * 于是每个详情页都在向搜索引擎声明「英文版在 /en/learn/xxx」，那个地址实际是 404。
 * 百度/Google 会把「hreflang 指向死链」记为页面质量问题，且可能连中文版一起降权。
 *
 * 采用白名单而非黑名单：多级路径（/maps/<slug>/catalog、/maps/<slug>/full、/tag/x）
 * 都落在名单之外，天然不会被误判成有英文版。传入带不带 /en 前缀都可以。
 */
export function hasEnglishVersion(pathname: string): boolean {
  const p = stripLang(pathname || '/');
  // 分页页（/learn/page/3）跟着列表页走：列表页有英文版，它的分页就有。
  // 不剥掉 /page/N 的话，白名单精确匹配落空 → 英文分页页不声明 hreflang="en"，
  // 而中文分页页也不声明英文版，两边互相看不见。
  const stripped = p.replace(/\/page\/\d+\/?$/, '') || '/';
  const base = stripped === '/' ? '/' : stripped.replace(/\/+$/, '');
  return EN_STATIC_ROUTES.has(base);
}
