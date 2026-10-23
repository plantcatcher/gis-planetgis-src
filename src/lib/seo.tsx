// 零依赖的 SEO 头管理：同一套实现同时支持客户端（CSR）与服务端预渲染（SSG）。
// 不依赖 react-helmet-async，避免其在 Vite SSR 下因 CJS/ESM 互操作报错。
//
// 原理：
// - 客户端：组件挂载/更新时通过 useEffect 直接写入 document.head。
// - 服务端：渲染期间把 head 数据写入模块级单例；预渲染脚本在 renderToString 之后读取并注入静态 HTML。

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '@/i18n/LocaleContext';
import { stripLang, withLang, HTML_LANG, OG_LOCALE } from '@/i18n/config';
import { zh as dictZh } from '@/i18n/dict.zh';
import { en as dictEn } from '@/i18n/dict.en';

export interface HeadData {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: string;
}

/** 品牌名按语言取：中文「星球小捕手」/ 英文「Planet Catcher」 */
const BRAND: Record<string, string> = {
  zh: dictZh['brand.name'],
  en: dictEn['brand.name'],
};

export interface AlternateLink {
  hreflang: string;
  href: string;
}

/** 站点 baseURL：全站 canonical / OG / 结构化数据的唯一来源 */
export const SITE = 'https://planetgis.cn';
const DEFAULT_OG = 'https://blogphoto.planetgis.cn/PicGo/2026-02-27-favicon-dec42c.png';
/** 判断一个图片地址是否已是绝对 URL（http/https），用于决定是否补站点前缀 */
const ABSOLUTE_URL = /^https?:\/\//i;

/**
 * 由路由 pathname 生成规范地址（canonical）。
 *
 * 规范形式统一为「无末尾斜杠」，与 Cloudflare Pages 上的扁平 `.html` 产物
 * （dist/about.html -> /about）严格对齐：爬虫命中的就是 200 页面本身，
 * 不会再经过 308 斜杠归一化。这是百度抓取诊断标记「有跳转」的根源之一。
 */
export function buildCanonical(pathname: string): string {
  let p = pathname || '/';
  if (!p.startsWith('/')) p = `/${p}`;
  p = p.split('?')[0].split('#')[0];
  if (p !== '/') p = p.replace(/\/+$/, '');
  return p === '/' ? `${SITE}/` : `${SITE}${p}`;
}

// 服务端渲染期间收集的 head 数据（每次路由渲染前需 reset）。
let ssrHead: HeadData = {};
let ssrJsonLd: object[] = [];
let ssrAlternates: AlternateLink[] = [];

export function resetSsrHead(): void {
  ssrHead = {};
  ssrJsonLd = [];
  ssrAlternates = [];
}
export function getSsrHead(): HeadData {
  return ssrHead;
}
export function getSsrJsonLd(): object[] {
  return ssrJsonLd;
}
export function getSsrAlternates(): AlternateLink[] {
  return ssrAlternates;
}

/**
 * 给显式传入的 canonical 补上语言前缀。
 *
 * 站内多个页面直接写死 canonical（如 Listing 的 `https://planetgis.cn/${m.base}`、
 * ContentDetail 的 `https://planetgis.cn/${basePath[type]}/${item.slug}`）。
 * 英文站下这些常量会指回中文地址，既不是自引用，也与 hreflang 自相矛盾，
 * check-seo 会直接判「canonical 不自引用」让构建失败。
 * 与其逐个页面改，不如在这里统一按当前语言重写前缀——调用方照旧传无语言的地址。
 *
 * ⚠️ 只重写 path，不动 query / hash：canonical 里带它们本身也不规范。
 */
export function localizeCanonical(url: string, lang: 'zh' | 'en'): string {
  const bare = url.replace(/^https?:\/\/[^/]+/i, '') || '/';
  return SITE + withLang(stripLang(bare), lang);
}

/**
 * 生成 hreflang 三件套：zh-CN / en / x-default。
 *
 * x-default 指向中文版——中文是默认语言，未匹配到任何语言的访问者应落在中文站。
 * ⚠️ 三者的路径都基于「去掉语言前缀的同一路径」，保证互为对应版本；
 *    若直接拿带 /en 前缀的 pathname 去算，英文页会声明自己的英文 URL 为 en 版、
 *    中文版却变成 /en/en/... 的死链。
 */
export function buildAlternates(pathname: string): AlternateLink[] {
  const base = stripLang(pathname);
  return [
    { hreflang: 'zh-CN', href: buildCanonical(base) },
    { hreflang: 'en', href: buildCanonical(withLang(base, 'en')) },
    { hreflang: 'x-default', href: buildCanonical(base) },
  ];
}

interface PageMetaProps {
  title: string;
  description: string;
  /** Canonical URL；缺省由当前路由 pathname 自动推导（自引用） */
  canonical?: string;
  /** Open Graph 图片 */
  image?: string;
}

export function PageMeta({ title, description, canonical, image }: PageMetaProps) {
  // 缺省 canonical 由当前路由生成，保证「自引用」。
  // 旧实现是用页面标题拼 URL（`${SITE}/${title.split(' ')[0]}`），会产出
  // https://planetgis.cn/星球小捕手 这类根本不存在的地址，被搜索引擎判定为
  // 指向其它 URL —— 百度抓取诊断的「有跳转」标记即源于此，务必不要改回去。
  //
  // ⚠️ useLocation().pathname 不含 Router 的 basename（英文站下是 /learn 而非 /en/learn），
  //    直接拿它算 canonical 会让英文页把中文 URL 声明成自己的规范地址。
  //    必须先用 withLang 补回语言前缀。
  const { pathname } = useLocation();
  const { lang } = useI18n();
  const canonicalUrl = canonical
    ? localizeCanonical(canonical, lang)
    : buildCanonical(withLang(pathname, lang));
  const alternates = buildAlternates(pathname);
  const brand = BRAND[lang] || BRAND.zh;
  // og:image / twitter:image 必须是绝对 URL——社交平台与结构化数据都不接受相对路径。
  // content/works 允许直接引用站内自托管封面（如 /maps/<slug>/cover.jpg），这里统一补全；
  // 已是绝对地址（blogphoto 图床等）原样透传。
  const ogImage = image
    ? ABSOLUTE_URL.test(image)
      ? image
      : `${SITE}${image.startsWith('/') ? '' : '/'}${image}`
    : DEFAULT_OG;

  // 客户端：直接操作 document.head
  useEffect(() => {
    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', canonicalUrl, 'property');
    setMeta('og:image', ogImage, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:site_name', brand, 'property');
    setMeta('og:locale', OG_LOCALE[lang] || OG_LOCALE.zh, 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);
    setCanonical(canonicalUrl);
    setAlternates(alternates);
    setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: canonicalUrl,
      inLanguage: HTML_LANG[lang] || HTML_LANG.zh,
      isPartOf: { '@type': 'WebSite', name: brand, url: SITE },
    });
  }, [title, description, canonicalUrl, ogImage, lang, brand]);

  // 服务端：收集到模块级单例
  if (typeof window === 'undefined') {
    ssrHead = {
      title,
      description,
      canonical: canonicalUrl,
      image: ogImage,
      type: 'website',
    };
    ssrAlternates = alternates;
    ssrJsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: canonicalUrl,
      inLanguage: HTML_LANG[lang] || HTML_LANG.zh,
      isPartOf: { '@type': 'WebSite', name: brand, url: SITE },
    });
  }

  return null;
}

/**
 * 注入额外的 JSON-LD 结构化数据（如面包屑 BreadcrumbList）。
 * 客户端用 useEffect 写入 <script>，服务端推入 ssrJsonLd 单例。
 */
export function useJsonLd(obj: object): void {
  const key = JSON.stringify(obj);
  useEffect(() => {
    setJsonLd(obj);
    // 组件卸载时移除该 script，避免路由切换后残留
    return () => removeJsonLd(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (typeof window === 'undefined') {
    ssrJsonLd.push(obj);
  }
}

// ---------- 客户端 DOM 操作 ----------
function setMeta(key: string, content: string, attr: 'name' | 'property' = 'name') {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** 写入 hreflang 三件套。每次先清掉旧的，避免站内跳转后残留上一个语言版本的声明。 */
function setAlternates(list: AlternateLink[]) {
  if (typeof document === 'undefined') return;
  document.head
    .querySelectorAll<HTMLLinkElement>('link[rel="alternate"][data-hreflang]')
    .forEach((el) => el.remove());
  for (const a of list) {
    const el = document.createElement('link');
    el.setAttribute('rel', 'alternate');
    el.setAttribute('hreflang', a.hreflang);
    el.setAttribute('href', a.href);
    el.setAttribute('data-hreflang', '1');
    document.head.appendChild(el);
  }
}

function setJsonLd(obj: object) {
  if (typeof document === 'undefined') return;
  const key = JSON.stringify(obj);
  let el = document.head.querySelector<HTMLScriptElement>(
    `script[data-jsonld="${hashKey(key)}"]`
  );
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-jsonld', hashKey(key));
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(obj);
}

function removeJsonLd(key: string) {
  if (typeof document === 'undefined') return;
  const el = document.head.querySelector<HTMLScriptElement>(
    `script[data-jsonld="${hashKey(key)}"]`
  );
  if (el) el.remove();
}

function hashKey(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return `j${h}`;
}
