// 零依赖的 SEO 头管理：同一套实现同时支持客户端（CSR）与服务端预渲染（SSG）。
// 不依赖 react-helmet-async，避免其在 Vite SSR 下因 CJS/ESM 互操作报错。
//
// 原理：
// - 客户端：组件挂载/更新时通过 useEffect 直接写入 document.head。
// - 服务端：渲染期间把 head 数据写入模块级单例；预渲染脚本在 renderToString 之后读取并注入静态 HTML。

import React, { useEffect } from 'react';

export interface HeadData {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: string;
}

const SITE = 'https://planetgis.cn';
const DEFAULT_OG = 'https://blogphoto.planetgis.cn/PicGo/2026-02-27-favicon-dec42c.png';

// 服务端渲染期间收集的 head 数据（每次路由渲染前需 reset）。
let ssrHead: HeadData = {};
let ssrJsonLd: object[] = [];

export function resetSsrHead(): void {
  ssrHead = {};
  ssrJsonLd = [];
}
export function getSsrHead(): HeadData {
  return ssrHead;
}
export function getSsrJsonLd(): object[] {
  return ssrJsonLd;
}

interface PageMetaProps {
  title: string;
  description: string;
  /** Canonical URL；缺省按标题推导 */
  canonical?: string;
  /** Open Graph 图片 */
  image?: string;
}

export function PageMeta({ title, description, canonical, image }: PageMetaProps) {
  const canonicalUrl =
    canonical || `${SITE}/${title.split(' ')[0].replace(/^-+/, '')}`;
  const ogImage = image || DEFAULT_OG;

  // 客户端：直接操作 document.head
  useEffect(() => {
    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', canonicalUrl, 'property');
    setMeta('og:image', ogImage, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:site_name', '星球小捕手', 'property');
    setMeta('og:locale', 'zh_CN', 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);
    setCanonical(canonicalUrl);
    setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: canonicalUrl,
      inLanguage: 'zh-CN',
      isPartOf: { '@type': 'WebSite', name: '星球小捕手', url: SITE },
    });
  }, [title, description, canonicalUrl, ogImage]);

  // 服务端：收集到模块级单例
  if (typeof window === 'undefined') {
    ssrHead = {
      title,
      description,
      canonical: canonicalUrl,
      image: ogImage,
      type: 'website',
    };
    ssrJsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: canonicalUrl,
      inLanguage: 'zh-CN',
      isPartOf: { '@type': 'WebSite', name: '星球小捕手', url: SITE },
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
