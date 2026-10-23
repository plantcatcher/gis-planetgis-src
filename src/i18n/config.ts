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
